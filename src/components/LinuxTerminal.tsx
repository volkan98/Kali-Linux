import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Cpu,
  RotateCcw,
  Terminal as TerminalIcon,
  Send,
  Monitor,
  Sparkles,
} from 'lucide-react';
import {
  TerminalState,
  createInitialTerminalState,
  evaluateTerminalObjectives,
  executeTerminalCommand,
} from '../sim/terminalEngine';
import { WindowsLabState } from '../sim/windowsLabEngine';
import { VM_LAB_GUIDE } from '../data/careerTracks';
import { TerminalLogLine } from '../types/academy';
import {
  createInitialTerminalLogs,
  loadTerminalLogs,
  saveTerminalLogs,
} from '../utils/storage';
import { RealLinuxTerminal } from './RealLinuxTerminal';

interface LinuxTerminalProps {
  terminalState: TerminalState;
  onUpdateTerminalState: (next: TerminalState) => void;
  windowsLabState: WindowsLabState;
  onAllObjectivesPassed?: () => void;
  onObjectivesUpdated?: (passedIds: string[]) => void;
  onAskMentorWithOutput?: (outputText: string) => void;
}

const KNOWN_COMMANDS = [
  'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'head', 'tail', 'less', 'echo',
  'cp', 'mv', 'rm', 'grep', 'find', 'nano', 'chmod', 'chown', 'sudo',
  'whoami', 'id', 'uname', 'ps', 'top', 'kill', 'systemctl', 'journalctl',
  'ip', 'ping', 'ss', 'dig', 'curl', 'ssh', 'nmap', 'smbclient', 'ufw',
  'history', 'man', 'help', 'clear',
];

function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code
        key={idx}
        className="font-mono text-sky-300 bg-slate-900/90 border border-slate-800 px-1 py-0.5 rounded"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({
  terminalState,
  onUpdateTerminalState,
  windowsLabState,
  onAllObjectivesPassed,
  onObjectivesUpdated,
  onAskMentorWithOutput,
}) => {
  const [terminalMode, setTerminalMode] = useState<'didattico' | 'reale'>('didattico');
  const [lines, setLines] = useState<TerminalLogLine[]>(() => loadTerminalLogs());
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState<number>(-1);
  const [showVmGuide, setShowVmGuide] = useState(false);
  const [realOutputText, setRealOutputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const objectives = evaluateTerminalObjectives(terminalState);
  const passedIds = objectives.filter((o) => o.passed).map((o) => o.id);
  const passedCount = passedIds.length;

  useEffect(() => {
    saveTerminalLogs(lines);
  }, [lines]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, terminalMode]);

  const lastReportedIdsRef = useRef<string>('');
  const passedKey = passedIds.join(',');

  useEffect(() => {
    if (onObjectivesUpdated && lastReportedIdsRef.current !== passedKey) {
      lastReportedIdsRef.current = passedKey;
      onObjectivesUpdated(passedIds);
    }
    if (passedCount === objectives.length && onAllObjectivesPassed) {
      onAllObjectivesPassed();
    }
  }, [passedCount, objectives.length, onAllObjectivesPassed, onObjectivesUpdated, passedKey]);

  const promptPath =
    terminalState.cwd === '/home/student'
      ? '~'
      : terminalState.cwd.startsWith('/home/student/')
      ? '~/' + terminalState.cwd.slice('/home/student/'.length)
      : terminalState.cwd;

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    const res = executeTerminalCommand(terminalState, cmd, windowsLabState);

    if (res.clear) {
      setLines([]);
    } else {
      const additions: TerminalLogLine[] = [
        {
          id: `p-${Date.now()}-${Math.random()}`,
          type: 'prompt',
          cwd: promptPath,
          text: cmd,
        },
      ];
      if (res.output) {
        additions.push({
          id: `o-${Date.now()}-${Math.random()}`,
          type: 'output',
          text: res.output,
        });
      }
      setLines((prev) => [...prev.slice(-76), ...additions]);
    }

    onUpdateTerminalState(res.nextState);
    setInput('');
    setHistIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = terminalState.history;
      if (hist.length === 0) return;
      const nextIdx = histIdx < 0 ? hist.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(nextIdx);
      setInput(hist[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const hist = terminalState.history;
      if (histIdx < 0) return;
      if (histIdx >= hist.length - 1) {
        setHistIdx(-1);
        setInput('');
      } else {
        const nextIdx = histIdx + 1;
        setHistIdx(nextIdx);
        setInput(hist[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const token = input.trim();
      if (!token.includes(' ') && token.length > 0) {
        const match = KNOWN_COMMANDS.find((c) => c.startsWith(token));
        if (match) setInput(match + ' ');
      }
    }
  };

  const handleReset = () => {
    const fresh = createInitialTerminalState();
    onUpdateTerminalState(fresh);
    const resetLogs = [
      ...createInitialTerminalLogs(),
      {
        id: `reset-${Date.now()}`,
        type: 'system' as const,
        text: 'File system virtuale e servizi ripristinati allo stato iniziale di laboratorio.',
      },
    ];
    setLines(resetLogs);
  };

  const lastOutputText = [...lines]
    .reverse()
    .slice(0, 6)
    .reverse()
    .map((l) => (l.type === 'prompt' ? `student@kali-lab:${l.cwd}$ ${l.text}` : l.text))
    .join('\n');

  return (
    <div className="space-y-4">
      {/* Dual Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0B111C] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTerminalMode('didattico')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              terminalMode === 'didattico'
                ? 'bg-sky-600 text-white'
                : 'bg-[#090D14] text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            Modalità A — Terminale Didattico (Rete Lab SMB/Wi-Fi)
          </button>

          <button
            type="button"
            onClick={() => setTerminalMode('reale')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded transition-colors ${
              terminalMode === 'reale'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#090D14] text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Modalità B — Linux Reale nel Browser (v86 WebAssembly)
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {terminalMode === 'didattico'
            ? 'VFS TypeScript collegato a 10.10.20.15'
            : 'Kernel Linux 6.8 Buildroot x86 reale in RAM'}
        </span>
      </div>

      {terminalMode === 'reale' ? (
        <RealLinuxTerminal onAskMentorWithOutput={onAskMentorWithOutput} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0F1623] px-4 py-3">
            <div className="flex items-center gap-3">
              <TerminalIcon className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  MODALITÀ A — Terminale Didattico Simulato (VFS Persistente)
                </h3>
                <p className="text-xs text-slate-400">
                  Comandi di laboratorio collegati allo stato della rete Windows (10.10.20.0/24). Nessuna esecuzione su host esterni.
                </p>
              </div>
            </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVmGuide((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            {showVmGuide ? 'Nascondi Guida VM Reale' : 'Guida VM Isolata & Output Reali'}
          </button>

          {onAskMentorWithOutput && (
            <button
              type="button"
              onClick={() =>
                onAskMentorWithOutput(
                  `Analizza questa sessione dal mio terminale Linux simulato:\n\`\`\`\n${lastOutputText}\n\`\`\``
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analizza con Cyber Mentor
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina Lab
          </button>
        </div>
      </div>

      {showVmGuide && (
        <div className="rounded-lg border border-slate-800 bg-[#0E1522] p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <h4 className="text-sm font-semibold text-slate-100">
                Costruire un Laboratorio Reale Isolato (VirtualBox)
              </h4>
              <p className="text-xs text-amber-300">{VM_LAB_GUIDE.avvisoSicurezza}</p>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                {VM_LAB_GUIDE.passiInstallazione.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {VM_LAB_GUIDE.reteIsolata.macchine.map((vm) => (
                  <div key={vm.nome} className="rounded border border-slate-800 bg-[#090D14] p-2.5">
                    <div className="text-xs font-semibold text-slate-100">{vm.nome}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{vm.ip} · RAM {vm.ram}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{vm.ruolo}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-96 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
              <label htmlFor="real-vm-output" className="block text-xs font-semibold text-slate-200">
                Modalità Output Reale (incolla output dalla tua VM)
              </label>
              <textarea
                id="real-vm-output"
                rows={4}
                value={realOutputText}
                onChange={(e) => setRealOutputText(e.target.value)}
                placeholder="Incolla qui l'output di nmap, ip a, smbclient o log dalla tua VM VirtualBox..."
                className="w-full rounded border border-slate-700 bg-[#090D14] p-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                disabled={!realOutputText.trim() || !onAskMentorWithOutput}
                onClick={() => {
                  if (onAskMentorWithOutput && realOutputText.trim()) {
                    onAskMentorWithOutput(
                      `Ecco un output reale eseguito nella mia macchina virtuale isolata. Analizzalo, spiegami cosa significa e indicami eventuali errori o rischi:\n\`\`\`\n${realOutputText.trim()}\n\`\`\``
                    );
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Invia Output Reale a Cyber Mentor
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Terminal Console */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-[#06090F] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/90 bg-[#0B1019]">
            <span className="text-xs font-mono text-slate-300">
              student@kali-lab:{promptPath}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Simulazione isolata · Tab autocomplete · ↑/↓ cronologia
            </span>
          </div>

          <div
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            className="h-[380px] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed cursor-text space-y-1.5"
          >
            {lines.map((line) => (
              <div key={line.id} className="whitespace-pre-wrap break-words">
                {line.type === 'system' && (
                  <span className="text-sky-300">{renderInlineCode(line.text)}</span>
                )}
                {line.type === 'prompt' && (
                  <div>
                    <span className="text-emerald-400 font-semibold">student@kali-lab</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-sky-400">{line.cwd}</span>
                    <span className="text-slate-300">$ {line.text}</span>
                  </div>
                )}
                {line.type === 'output' && (
                  <div className="text-slate-200 pl-0">{line.text}</div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-emerald-400 font-semibold shrink-0">student@kali-lab</span>
              <span className="text-slate-400 shrink-0">:</span>
              <span className="text-sky-400 shrink-0">{promptPath}</span>
              <span className="text-slate-300 shrink-0">$</span>
              <input
                ref={inputRef}
                type="text"
                aria-label="Prompt comandi terminale Linux"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="digita un comando (es. ls -la, pwd, grep Failed /var/log/auth.log)..."
                className="flex-1 bg-transparent text-slate-100 font-mono text-[13px] focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Quick command buttons */}
          <div className="border-t border-slate-800/90 bg-[#0B1019] px-3 py-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Comandi rapidi:</span>
            {[
              'pwd',
              'ls -la',
              'grep Failed /var/log/auth.log',
              'ss -tulnp',
              'nmap 10.10.20.15',
              'smbclient -L //10.10.20.15 -U auditor',
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => runCommand(cmd)}
                className="px-2 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Automated Exercise Verifier */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-100">Verifica Automatica Lab</h4>
            <span className="text-xs font-mono tabular-nums text-emerald-400">
              {passedCount}/{objectives.length} completati
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ogni obiettivo viene verificato in tempo reale sullo stato del file system virtuale e dei comandi eseguiti.
          </p>
          <div className="space-y-2.5">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className={`rounded border p-2.5 text-xs ${
                  obj.passed
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 bg-[#0B1019]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {obj.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-medium ${obj.passed ? 'text-emerald-200' : 'text-slate-200'}`}>
                      {renderInlineCode(obj.title)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {renderInlineCode(obj.description)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
