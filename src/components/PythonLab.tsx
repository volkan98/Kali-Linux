import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Terminal,
} from 'lucide-react';
import { PYTHON_SECURITY_PRESETS, PythonPreset } from '../sim/pythonPresets';

interface PythonLabProps {
  onAskMentorWithOutput?: (text: string) => void;
}

const WORKER_SCRIPT = `
let pyodideReadyPromise = null;

async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js');
    pyodideReadyPromise = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
    });
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { id, type, code } = event.data || {};
  if (type === 'init') {
    try {
      await ensurePyodide();
      self.postMessage({ id, type: 'ready' });
    } catch (err) {
      self.postMessage({
        id,
        type: 'init-error',
        error: err && err.message ? err.message : String(err),
      });
    }
    return;
  }

  if (type === 'run') {
    const stdoutLines = [];
    const stderrLines = [];
    try {
      const pyodide = await ensurePyodide();
      pyodide.setStdout({ batched: (line) => stdoutLines.push(line) });
      pyodide.setStderr({ batched: (line) => stderrLines.push(line) });
      await pyodide.runPythonAsync(code);
      self.postMessage({
        id,
        type: 'result',
        ok: true,
        stdout: stdoutLines.join('\\n'),
        stderr: stderrLines.join('\\n'),
      });
    } catch (err) {
      self.postMessage({
        id,
        type: 'result',
        ok: false,
        stdout: stdoutLines.join('\\n'),
        stderr: [stderrLines.join('\\n'), err && err.message ? err.message : String(err)]
          .filter(Boolean)
          .join('\\n'),
      });
    }
  }
};
`;

export const PythonLab: React.FC<PythonLabProps> = ({ onAskMentorWithOutput }) => {
  const [selectedPreset, setSelectedPreset] = useState<PythonPreset>(PYTHON_SECURITY_PRESETS[0]);
  const [code, setCode] = useState<string>(PYTHON_SECURITY_PRESETS[0].code);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'running' | 'error'>('idle');
  const [stdout, setStdout] = useState<string>(
    'Premi "Esegui Python 3" per avviare Pyodide (WebAssembly) nel Web Worker ed eseguire il codice in modo reale.'
  );
  const [stderr, setStderr] = useState<string>('');
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const runStartRef = useRef<number>(0);

  const destroyWorker = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const createWorker = (): Worker => {
    destroyWorker();
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);

    worker.onmessage = (event) => {
      const msg = event.data || {};
      if (msg.type === 'ready') {
        setStatus((prev) => (prev === 'loading' ? 'ready' : prev));
      } else if (msg.type === 'init-error') {
        setStatus('error');
        setStderr(
          `Impossibile caricare il runtime Python (Pyodide CDN): ${msg.error}. Verifica la connessione di rete o usa la Modalità B (Linux v86) per shell script locali.`
        );
      } else if (msg.type === 'result') {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setDurationMs(Math.round(performance.now() - runStartRef.current));
        setStdout(msg.stdout || '(Nessun output su stdout)');
        setStderr(msg.stderr || '');
        setStatus(msg.ok ? 'ready' : 'error');
      }
    };

    worker.onerror = (err) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setStatus('error');
      setStderr(`Errore Web Worker Python: ${err.message || 'Errore sconosciuto'}`);
    };

    workerRef.current = worker;
    return worker;
  };

  useEffect(() => {
    return () => {
      destroyWorker();
    };
  }, []);

  const handleRun = () => {
    setStderr('');
    setDurationMs(null);
    let worker = workerRef.current;
    if (!worker) {
      setStatus('loading');
      setStdout('Inizializzazione runtime Python 3.12 (Pyodide WebAssembly in Web Worker)...');
      worker = createWorker();
    } else {
      setStatus('running');
    }

    runStartRef.current = performance.now();
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      destroyWorker();
      setStatus('error');
      setStderr('Timeout esecuzione (25s): possibile ciclo infinito interrotto dal sandbox Web Worker.');
    }, 25000);

    worker.postMessage({ id: Date.now(), type: 'run', code });
  };

  const handleStop = () => {
    destroyWorker();
    setStatus('idle');
    setStderr('Esecuzione interrotta manualmente (Web Worker terminato).');
  };

  const handleSelectPreset = (preset: PythonPreset) => {
    setSelectedPreset(preset);
    setCode(preset.code);
    setStderr('');
  };

  const handleSendToMentor = () => {
    if (!onAskMentorWithOutput) return;
    const summary = [
      'Ho eseguito questo script Python nel Laboratorio Python (Pyodide):',
      '```python',
      code.slice(0, 1200),
      '```',
      stdout ? `STDOUT:\n${stdout.slice(0, 800)}` : '',
      stderr ? `STDERR / TRACEBACK:\n${stderr.slice(0, 800)}` : '',
      'Puoi spiegarmi il risultato o aiutarmi a correggere eventuali errori?',
    ]
      .filter(Boolean)
      .join('\n\n');
    onAskMentorWithOutput(summary);
  };

  return (
    <div className="space-y-4">
      {/* Header & Honest Sandbox Note */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Laboratorio Python 3 Reale nel Browser (Pyodide WebAssembly)
              </h2>
              <p className="text-xs text-slate-400">
                Esecuzione isolata in Web Worker: l’interfaccia non si blocca e ogni script produce stdout, hashing reale e traceback autentici.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono ${
                status === 'ready'
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : status === 'loading' || status === 'running'
                  ? 'border-sky-500/40 bg-sky-950/30 text-sky-300'
                  : status === 'error'
                  ? 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              {(status === 'loading' || status === 'running') && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {status === 'idle' && 'Pronto (caricamento su richiesta)'}
              {status === 'loading' && 'Download / Avvio Pyodide...'}
              {status === 'running' && 'Esecuzione in corso...'}
              {status === 'ready' && `Python 3 Pronto${durationMs !== null ? ` (${durationMs} ms)` : ''}`}
              {status === 'error' && 'Errore / Traceback'}
            </span>
          </div>
        </div>

        <div className="rounded border border-amber-500/30 bg-amber-950/15 px-3 py-2 text-[11px] text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Nota tecnica trasparente: Pyodide esegue vero CPython compilato in WebAssembly dentro il browser. Per sicurezza del browser non può aprire raw socket TCP/UDP verso reti esterne (usa VirtualBox + Python locale per test di rete autorizzati).
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {PYTHON_SECURITY_PRESETS.map((preset) => {
          const active = preset.id === selectedPreset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-left rounded-lg border p-3.5 transition-colors ${
                active
                  ? 'border-amber-500/60 bg-amber-950/20'
                  : 'border-slate-800 bg-[#0F1623] hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-amber-400">{preset.categoria}</div>
              <div className="text-xs font-semibold text-slate-100 mt-1">{preset.titolo}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{preset.descrizione}</div>
            </button>
          );
        })}
      </div>

      {/* Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Code Editor */}
        <div className="rounded-lg border border-slate-800 bg-[#0B111C] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-[#0F1623]">
            <span className="text-xs font-mono text-slate-300">script_sicurezza.py</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode(selectedPreset.code)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                Ripristina
              </button>
              {(status === 'loading' || status === 'running') && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-rose-500/50 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50"
                >
                  <Square className="w-3 h-3" />
                  Stop
                </button>
              )}
              <button
                type="button"
                onClick={handleRun}
                disabled={status === 'loading' || status === 'running'}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                Esegui Python 3
              </button>
            </div>
          </div>

          <textarea
            aria-label="Editor Python 3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={16}
            className="w-full flex-1 bg-[#070B12] text-slate-100 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed"
          />
        </div>

        {/* Output / Traceback */}
        <div className="rounded-lg border border-slate-800 bg-[#0B111C] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-[#0F1623]">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Console Output & Traceback
            </div>
            {onAskMentorWithOutput && (
              <button
                type="button"
                onClick={handleSendToMentor}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-sky-500/40 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40"
              >
                <Sparkles className="w-3 h-3" />
                Spiega Output / Errore al Mentor
              </button>
            )}
          </div>

          <div className="flex-1 p-4 font-mono text-xs space-y-3 overflow-auto bg-[#070B12] min-h-[300px]">
            {stdout && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 mb-1">STDOUT</div>
                <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed">{stdout}</pre>
              </div>
            )}
            {stderr && (
              <div className="rounded border border-rose-500/40 bg-rose-950/20 p-3">
                <div className="text-[11px] uppercase tracking-wider text-rose-400 mb-1">
                  STDERR / TRACEBACK REALE
                </div>
                <pre className="whitespace-pre-wrap text-rose-200 leading-relaxed">{stderr}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
