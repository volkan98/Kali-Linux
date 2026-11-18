import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ImagePlus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../data/modules';
import { MentorMessage, StudentProgress } from '../types/academy';
import { loadMentorChat, saveMentorChat } from '../utils/storage';

interface CyberMentorPanelProps {
  activeModuleId: number;
  activeSectionLabel: string;
  progress: StudentProgress;
  labSummary: string;
  initialDraftPrompt?: string;
  initialDraftImage?: string | null;
  onConsumeDraftPrompt?: () => void;
  onConsumeDraftImage?: () => void;
}

function formatMentorText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="font-mono text-sky-300 bg-slate-900 border border-slate-800 px-1 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const CyberMentorPanel: React.FC<CyberMentorPanelProps> = ({
  activeModuleId,
  activeSectionLabel,
  progress,
  labSummary,
  initialDraftPrompt,
  initialDraftImage,
  onConsumeDraftPrompt,
  onConsumeDraftImage,
}) => {
  const activeMod = ACADEMY_MODULES.find((m) => m.id === activeModuleId);

  const buildWelcomeMessage = (): MentorMessage => ({
    id: 'mentor-welcome',
    role: 'model',
    timestamp: new Date().toTimeString().slice(0, 5),
    text: `Ciao! Sono **CYBER MENTOR**, il tuo docente personale di Cybersecurity.\n\nAttualmente stai studiando: **${activeMod?.codice} — ${activeMod?.titolo}**.\nPuoi chiedermi spiegazioni approfondite con schema ed esempio aziendale, incollare output del tuo terminale simulato, di Linux Reale (v86), di Python o di una tua VM VirtualBox, oppure caricare uno screenshot per analizzare errori e rischi.`,
  });

  const [messages, setMessages] = useState<MentorMessage[]>(() => {
    const saved = loadMentorChat();
    return saved.length > 0 ? saved : [buildWelcomeMessage()];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    saveMentorChat(messages);
  }, [messages]);

  useEffect(() => {
    if (initialDraftPrompt) {
      setInput(initialDraftPrompt);
      onConsumeDraftPrompt?.();
    }
  }, [initialDraftPrompt, onConsumeDraftPrompt]);

  useEffect(() => {
    if (initialDraftImage) {
      const match = initialDraftImage.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        setImageMimeType(match[1] || 'image/png');
        setImageBase64(match[2]);
      } else {
        setImageBase64(initialDraftImage);
      }
      setImagePreviewUrl(initialDraftImage);
      onConsumeDraftImage?.();
    }
  }, [initialDraftImage, onConsumeDraftImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setImageMimeType(file.type || 'image/png');
      setImagePreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend && !imageBase64) return;
    if (loading) return;

    const userMsg: MentorMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend || 'Analizza questo screenshot di laboratorio.',
      timestamp: new Date().toTimeString().slice(0, 5),
      imagePreview: imagePreviewUrl ?? undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput('');
    const currentImg = imageBase64;
    const currentMime = imageMimeType;
    setImageBase64(null);
    setImagePreviewUrl(null);
    setLoading(true);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            activeSection: activeSectionLabel,
            activeModuleId,
            activeModuleTitle: activeMod?.titolo,
            completedModules: progress.completedLessons,
            labSummary,
          },
          imageBase64: currentImg ?? undefined,
          imageMimeType: currentImg ? currentMime : undefined,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string; modelUsed?: string };
      if (!res.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            timestamp: new Date().toTimeString().slice(0, 5),
            text: data.error || 'Impossibile ottenere una risposta da Cyber Mentor AI.',
            error: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'model',
            timestamp: new Date().toTimeString().slice(0, 5),
            text: data.reply!,
            modelUsed: data.modelUsed,
          },
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore di rete verso /api/mentor.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          timestamp: new Date().toTimeString().slice(0, 5),
          text: `Errore di connessione al backend Cyber Mentor: ${msg}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              CYBER MENTOR — Insegnante AI Personale
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Contesto attivo: <span className="text-sky-400 font-mono">{activeMod?.codice} ({activeMod?.titolo})</span> · Conosce i tuoi progressi ({progress.completedLessons.length}/22 moduli) e distingue sempre tra simulazione e VM reali.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMessages([buildWelcomeMessage()])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nuova Conversazione
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          'Come funziona il protocollo SMB?',
          'Spiegami la differenza tra WPA2-PSK e WPA3-SAE con un esempio e un esercizio.',
          'Che argomenti devo ripassare in base ai miei progressi attuali?',
          `Fammi una verifica pratica di 3 domande sul ${activeMod?.codice}: ${activeMod?.titolo}.`,
        ].map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => sendMessage(q)}
            className="px-3 py-1.5 text-xs rounded border border-slate-800 bg-[#0B111C] text-slate-200 hover:border-sky-500/50 hover:text-sky-200 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="rounded-lg border border-slate-800 bg-[#0B111C] p-5 space-y-4">
        <div className="max-h-[460px] overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border p-4 text-xs leading-relaxed ${
                m.error
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                  : m.role === 'user'
                  ? 'border-sky-500/30 bg-sky-950/20 text-slate-100 ml-auto max-w-3xl'
                  : 'border-slate-800 bg-[#0F1623] text-slate-200 max-w-4xl'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-mono">
                <span className={m.role === 'user' ? 'text-sky-400' : m.error ? 'text-rose-400' : 'text-emerald-400'}>
                  {m.role === 'user' ? 'STUDENTE' : m.error ? 'AVVISO SISTEMA' : 'CYBER MENTOR'}
                  {m.modelUsed ? ` · ${m.modelUsed}` : ''}
                </span>
                <span className="text-slate-500">{m.timestamp}</span>
              </div>

              {m.imagePreview && (
                <img
                  src={m.imagePreview}
                  alt="Screenshot caricato dallo studente"
                  className="max-h-48 rounded border border-slate-700 mb-2"
                />
              )}

              <div className="whitespace-pre-wrap">{formatMentorText(m.text)}</div>
              {m.error && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Puoi continuare a usare tutti i laboratori, quiz e terminali offline anche senza API key attiva.</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 text-xs text-slate-400 font-mono">
              Cyber Mentor sta elaborando spiegazione tecnica e verifica didattica...
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="pt-3 border-t border-slate-800 space-y-2.5">
          {imagePreviewUrl && (
            <div className="flex items-center gap-3 rounded border border-slate-800 bg-[#090D14] p-2">
              <img src={imagePreviewUrl} alt="Anteprima allegato" className="h-12 w-12 object-cover rounded" />
              <span className="text-xs text-slate-300 flex-1">Screenshot / appunti pronti per l’analisi AI</span>
              <button
                type="button"
                aria-label="Rimuovi immagine allegata"
                onClick={() => {
                  setImageBase64(null);
                  setImagePreviewUrl(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0">
              <ImagePlus className="w-4 h-4 text-sky-400" />
              <span>Carica Screenshot / Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>

            <input
              type="text"
              aria-label="Scrivi una domanda o incolla un output per Cyber Mentor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Fai una domanda (es. 'Come funziona SMB?'), incolla un output di comando o chiedi un esercizio..."
              className="flex-1 rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />

            <button
              type="button"
              disabled={loading || (!input.trim() && !imageBase64)}
              onClick={() => sendMessage()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Invia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
