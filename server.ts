import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

/**
 * NOTE PER FUTURA DISTRIBUZIONE PUBBLICA:
 * In produzione multi-utente su internet è obbligatorio aggiungere:
 * 1. Autenticazione utenti (es. Firebase Auth / JWT / sessioni server-side).
 * 2. Rate limiting e quote per singolo utente autenticato su store persistente (Redis/DB).
 * 3. Telemetria token, logging audit delle chiamate AI e Content-Security-Policy dedicata.
 */

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const MAX_IMAGE_BASE64_BYTES = 4 * 1024 * 1024; // 4 MB max attachment
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

interface RateBucket {
  timestamps: number[];
}

const rateBuckets = new Map<string, RateBucket>();

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSec: number; remaining: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(clientIp) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (bucket.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000));
    rateBuckets.set(clientIp, bucket);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  bucket.timestamps.push(now);
  rateBuckets.set(clientIp, bucket);

  // Bounded cleanup to avoid unbounded map growth
  if (rateBuckets.size > 1000) {
    for (const [k, b] of rateBuckets.entries()) {
      if (b.timestamps.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateBuckets.delete(k);
      }
    }
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - bucket.timestamps.length),
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CYBER_MENTOR_SYSTEM_INSTRUCTION = `Sei CYBER MENTOR, l'insegnante AI personale di CYBER LAB ACADEMY.
Rispondi SEMPRE in italiano chiaro, didattico, tecnico ma accessibile a chi parte da zero.

REGOLE FONDAMENTALI:
1. Etica e Sicurezza: Insegna esclusivamente Ethical Hacking autorizzato, Cyber Defence e verifica di sicurezza su sistemi propri, macchine virtuali isolate o laboratori controllati. Rifiuta istruzioni per attaccare sistemi o reti reali di terzi non autorizzati, spiegando sempre rischio e contromisura difensiva.
2. Distinzione Simulazione vs Reale: Distingui sempre chiaramente ciò che avviene nella simulazione browser (o nell'ambiente Linux/Pyodide WebAssembly locale) da ciò che richiede una rete reale o un laboratorio multi-macchina VirtualBox.
3. Metodo Didattico: Quando lo studente chiede di spiegare un argomento o protocollo (es. "Come funziona il protocollo SMB?"), struttura la risposta in modo approfondito includendo:
   - Cos'è e a cosa serve (spiegazione semplice senza dare nulla per scontato)
   - Come funziona tecnicamente
   - Schema testuale con frecce (es. Client -> Porta/Protocollo -> Server -> Controllo ACL)
   - Esempio pratico aziendale
   - Rischi di sicurezza e contromisure
   - Un breve esercizio pratico verificabile nel laboratorio dell'accademia.
4. Analisi Output e Errori: Quando lo studente incolla l'output di un comando Linux/Bash, un traceback Python, un log Windows/Wi-Fi o allega una foto/screenshot di appunti, analizzalo riga per riga, correggi eventuali errori tecnici, spiega il perché e proponi sia una versione completa sia una versione sintetica.
5. Non inventare esecuzioni su reti reali.`;

interface MentorRequestBody {
  message?: unknown;
  history?: unknown;
  context?: {
    activeSection?: string;
    activeModuleId?: number;
    activeModuleTitle?: string;
    completedModules?: number[];
    weakTopics?: string[];
    quizScoresSummary?: string;
    labSummary?: string;
  };
  imageBase64?: unknown;
  imageMimeType?: unknown;
}

function classifyGeminiError(err: unknown): { status: number; transient: boolean; userMessage: string } {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const lower = msg.toLowerCase();

  if (lower.includes('401') || lower.includes('403') || lower.includes('permission_denied') || lower.includes('api_key_invalid')) {
    return {
      status: 403,
      transient: false,
      userMessage:
        'Autenticazione API Gemini non valida o non autorizzata. Verifica la chiave GEMINI_API_KEY nelle impostazioni Secrets.',
    };
  }
  if (lower.includes('400') || lower.includes('invalid_argument')) {
    return {
      status: 400,
      transient: false,
      userMessage: 'Richiesta non valida verso il modello AI. Controlla testo o formato allegato.',
    };
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      status: 502,
      transient: false,
      userMessage: 'Il modello AI configurato non risulta disponibile su questo endpoint.',
    };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      transient: false,
      userMessage: 'Quota richieste Gemini esaurita temporaneamente (429). Attendi qualche minuto prima di riprovare.',
    };
  }
  if (
    lower.includes('503') ||
    lower.includes('502') ||
    lower.includes('500') ||
    lower.includes('unavailable') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    lower.includes('network')
  ) {
    return {
      status: 503,
      transient: true,
      userMessage:
        'Il servizio Gemini AI è momentaneamente sovraccarico o non raggiungibile in tempo utile (503). Nessuna risposta simulata è stata inventata: riprova tra poco o continua nei laboratori offline.',
    };
  }

  return {
    status: 502,
    transient: false,
    userMessage: 'Errore imprevisto durante la comunicazione con il servizio AI. Riprova tra poco.',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callModelWithResilience(
  ai: GoogleGenAI,
  contents: string | { parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> }
): Promise<{ replyText: string; modelUsed: string; fallbackUsed: boolean }> {
  const attempts: Array<{ model: string; thinking?: ThinkingLevel; fallback: boolean; timeoutMs: number }> = [
    { model: PRIMARY_MODEL, thinking: ThinkingLevel.LOW, fallback: false, timeoutMs: 14000 },
    { model: PRIMARY_MODEL, thinking: ThinkingLevel.LOW, fallback: false, timeoutMs: 14000 },
    { model: FALLBACK_MODEL, thinking: undefined, fallback: true, timeoutMs: 14000 },
  ];

  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (i > 0) {
      await sleep(i === 1 ? 600 : 1000);
    }
    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents,
        config: {
          systemInstruction: CYBER_MENTOR_SYSTEM_INSTRUCTION,
          ...(attempt.thinking ? { thinkingConfig: { thinkingLevel: attempt.thinking } } : {}),
          abortSignal: AbortSignal.timeout(attempt.timeoutMs),
        },
      });
      const text = response?.text?.trim();
      if (!text) {
        throw new Error('Risposta vuota dal modello AI.');
      }
      return {
        replyText: text,
        modelUsed: attempt.model,
        fallbackUsed: attempt.fallback,
      };
    } catch (err) {
      lastError = err;
      const classified = classifyGeminiError(err);
      if (!classified.transient) {
        // Non-recoverable error (400, 401, 403, 429): do NOT retry
        throw err;
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '6mb' }));

  // Basic security headers + strict same-origin / allowed-origin CORS check
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'same-origin');

    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        const allowedLocal =
          originUrl.host === host ||
          originUrl.hostname === 'localhost' ||
          originUrl.hostname === '127.0.0.1' ||
          originUrl.hostname.endsWith('.run.app');
        if (!allowedLocal) {
          res.status(403).json({ error: 'Origine richiesta non autorizzata.' });
          return;
        }
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      } catch {
        res.status(400).json({ error: 'Header Origin non valido.' });
        return;
      }
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      primaryModel: PRIMARY_MODEL,
      fallbackModel: FALLBACK_MODEL,
    });
  });

  app.post('/api/mentor', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const limitState = checkRateLimit(clientIp);
      res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
      res.setHeader('X-RateLimit-Remaining', String(limitState.remaining));

      if (!limitState.allowed) {
        res.setHeader('Retry-After', String(limitState.retryAfterSec));
        res.status(429).json({
          error: `Troppe richieste inviate a Cyber Mentor in poco tempo. Attendi ${limitState.retryAfterSec} secondi e riprova.`,
        });
        return;
      }

      const body = (req.body ?? {}) as MentorRequestBody;
      const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
      const rawImage = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
      const rawMime = typeof body.imageMimeType === 'string' ? body.imageMimeType : 'image/png';

      if (!rawMessage && !rawImage) {
        res.status(400).json({ error: 'Inserisci una domanda, un output da analizzare o allega un’immagine valida.' });
        return;
      }

      if (rawMessage.length > 16000) {
        res.status(400).json({ error: 'Il testo inviato supera il limite massimo consentito (16.000 caratteri).' });
        return;
      }

      if (rawImage) {
        const estimatedBytes = Math.ceil((rawImage.length * 3) / 4);
        if (estimatedBytes > MAX_IMAGE_BASE64_BYTES) {
          res.status(413).json({ error: 'L’immagine allegata supera il limite di 4 MB.' });
          return;
        }
        if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(rawMime)) {
          res.status(400).json({ error: 'Formato immagine non supportato. Usa PNG, JPEG o WebP.' });
          return;
        }
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Chiave API Gemini non configurata sul server. Configura GEMINI_API_KEY nelle impostazioni dei Secrets per attivare Cyber Mentor AI.',
        });
        return;
      }

      const ctx = body.context;
      const weakTopicsText =
        ctx?.weakTopics && ctx.weakTopics.length > 0
          ? Array.from(new Set(ctx.weakTopics)).slice(-8).join(', ')
          : 'Nessuno segnalato';

      const contextBanner = ctx
        ? `[CONTESTO STUDENTE] Sezione attiva: ${ctx.activeSection ?? 'Dashboard'} | Modulo attuale: ${
            ctx.activeModuleId ? `Modulo ${ctx.activeModuleId} (${ctx.activeModuleTitle ?? ''})` : 'Nessuno'
          } | Moduli completati: ${ctx.completedModules?.length ?? 0}/22 | Argomenti da rinforzare (WeakTopics): ${weakTopicsText} | Punteggi Quiz: ${
            ctx.quizScoresSummary ?? 'N/D'
          } | Stato laboratori: ${ctx.labSummary ?? 'N/D'}`
        : '';

      const safeHistory = Array.isArray(body.history)
        ? body.history
            .filter(
              (m): m is { role: 'user' | 'model'; text: string } =>
                Boolean(m && typeof m === 'object' && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
            )
            .slice(-6)
        : [];

      const historyText = safeHistory
        .map((m) => `${m.role === 'user' ? 'STUDENTE' : 'CYBER MENTOR'}: ${m.text.slice(0, 2000)}`)
        .join('\n\n');

      const fullPrompt = [
        contextBanner,
        historyText ? `Cronologia recente:\n${historyText}` : '',
        `Nuova richiesta dello studente:\n${rawMessage || 'Analizza questa immagine o screenshot di appunti/terminale.'}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const contents = rawImage
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: rawMime,
                  data: rawImage,
                },
              },
              { text: fullPrompt },
            ],
          }
        : fullPrompt;

      const result = await callModelWithResilience(ai, contents);
      res.json({
        reply: result.replyText,
        modelUsed: result.modelUsed,
        fallbackUsed: result.fallbackUsed,
      });
    } catch (err: unknown) {
      const classified = classifyGeminiError(err);
      console.error('[/api/mentor error]', err instanceof Error ? err.message : String(err));
      res.status(classified.status).json({
        error: classified.userMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CYBER LAB ACADEMY server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
