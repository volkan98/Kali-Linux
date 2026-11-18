import React, { useCallback, useEffect, useRef, useState } from 'react';
import { V86 } from 'v86';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  Cpu,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react';

interface RealLinuxTerminalProps {
  onAskMentorWithOutput?: (outputText: string) => void;
}

type VmBootState = 'booting' | 'ready' | 'error';

export const RealLinuxTerminal: React.FC<RealLinuxTerminalProps> = ({
  onAskMentorWithOutput,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const emulatorRef = useRef<InstanceType<typeof V86> | null>(null);
  const rawBufferRef = useRef<string>('');

  const [bootState, setBootState] = useState<VmBootState>('booting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vmGeneration, setVmGeneration] = useState<number>(0);

  const sendCommand = useCallback((cmd: string) => {
    const emu = emulatorRef.current;
    if (!emu) return;
    emu.serial0_send(`${cmd}\n`);
    xtermRef.current?.focus();
  }, []);

  const readRecentTerminalText = useCallback((): string => {
    const term = xtermRef.current;
    if (!term) return rawBufferRef.current.slice(-2500);
    const buffer = term.buffer.active;
    const lines: string[] = [];
    const start = Math.max(0, buffer.length - 40);
    for (let i = start; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) {
        const text = line.translateToString(true);
        if (text.trim().length > 0) lines.push(text);
      }
    }
    return lines.join('\n');
  }, []);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let cancelled = false;
    let bootTimeoutId: number | undefined;
    rawBufferRef.current = '';
    setBootState('booting');
    setErrorMessage(null);

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      theme: {
        background: '#06090F',
        foreground: '#E2E8F0',
        cursor: '#34D399',
        selectionBackground: '#1E3A5F',
      },
      scrollback: 1500,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(host);
    try {
      fitAddon.fit();
    } catch {
      // Ignore fit before layout stabilization
    }

    term.writeln('\x1b[36m[v86] Avvio emulatore x86 WebAssembly + Linux Kernel 6.8 (Buildroot)...\x1b[0m');
    term.writeln('\x1b[90mCaricamento locale da /v86/v86.wasm e /v86/buildroot-bzimage68.bin (100% nel browser).\x1b[0m\r\n');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    let emulator: InstanceType<typeof V86> | null = null;
    try {
      emulator = new V86({
        wasm_path: '/v86/v86.wasm',
        memory_size: 128 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        bios: { url: '/v86/seabios.bin', async: false },
        vga_bios: { url: '/v86/vgabios.bin', async: false },
        bzimage: { url: '/v86/buildroot-bzimage68.bin', async: false },
        filesystem: {},
        cmdline: 'tsc=reliable mitigations=off random.trust_cpu=on',
        autostart: true,
        disable_keyboard: true,
        uart1: false,
      });
      emulatorRef.current = emulator;

      const decoder = new TextDecoder('utf-8', { fatal: false });
      let byteQueue: number[] = [];
      let loginSent = false;

      const flushBytes = () => {
        if (byteQueue.length === 0) return;
        const text = decoder.decode(new Uint8Array(byteQueue), { stream: true });
        byteQueue = [];
        term.write(text);
        rawBufferRef.current = (rawBufferRef.current + text).slice(-6000);

        if (!loginSent && rawBufferRef.current.includes('buildroot login:')) {
          loginSent = true;
          emulator?.serial0_send('root\n');
        }
        if (
          rawBufferRef.current.includes('~% ') ||
          rawBufferRef.current.includes('~# ') ||
          rawBufferRef.current.includes('/ # ') ||
          rawBufferRef.current.includes('Welcome to Buildroot')
        ) {
          setBootState('ready');
        }
      };

      let rafPending = false;
      emulator.add_listener('serial0-output-byte', (byte: number) => {
        if (cancelled) return;
        byteQueue.push(byte);
        if (!rafPending) {
          rafPending = true;
          window.requestAnimationFrame(() => {
            rafPending = false;
            if (!cancelled) flushBytes();
          });
        }
      });

      const dataDisp = term.onData((data: string) => {
        emulator?.serial0_send(data);
      });

      bootTimeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setBootState((curr) => (curr === 'booting' ? 'ready' : curr));
        }
      }, 15000);

      const ro = new ResizeObserver(() => {
        try {
          fitAddon.fit();
        } catch {
          // ignore
        }
      });
      ro.observe(host);

      return () => {
        cancelled = true;
        if (bootTimeoutId) window.clearTimeout(bootTimeoutId);
        ro.disconnect();
        dataDisp.dispose();
        try {
          emulator?.destroy();
        } catch {
          // ignore destroy errors on rapid unmount
        }
        emulatorRef.current = null;
        try {
          term.dispose();
        } catch {
          // ignore
        }
        xtermRef.current = null;
        fitAddonRef.current = null;
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore inizializzazione emulatore v86.';
      setBootState('error');
      setErrorMessage(msg);
      return () => {
        cancelled = true;
        try {
          term.dispose();
        } catch {
          // ignore
        }
      };
    }
  }, [vmGeneration]);

  return (
    <div className="space-y-4">
      {/* Real Linux Header & Honest Diagnostics */}
      <div className="rounded-lg border border-emerald-500/30 bg-[#0F1623] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  MODALITÀ B — Terminale Linux Reale nel Browser (v86 WebAssembly)
                </h3>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                    bootState === 'ready'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : bootState === 'error'
                      ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                  }`}
                >
                  {bootState === 'ready'
                    ? 'Kernel Linux 6.8 Attivo'
                    : bootState === 'error'
                    ? 'Errore Emulatore'
                    : 'Boot Linux in corso...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Esegue un vero kernel Linux minimale (Buildroot x86) emulato interamente nella tua RAM locale via WebAssembly. Supporta file system reale in RAM, permessi POSIX, pipe, redirezioni, variabili e script shell.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onAskMentorWithOutput && (
              <button
                type="button"
                onClick={() =>
                  onAskMentorWithOutput(
                    `Analizza questo output dal mio Terminale Linux Reale (v86 Buildroot):\n\`\`\`\n${readRecentTerminalText()}\n\`\`\``
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analizza Output con Mentor
              </button>
            )}
            <button
              type="button"
              onClick={() => setVmGeneration((g) => g + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Riavvia VM Linux
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="rounded border border-slate-800 bg-[#090D14] px-3 py-1.5 text-slate-300">
            <span className="text-slate-500">Distribuzione: </span>Buildroot Linux 6.8 (non è Kali Linux)
          </div>
          <div className="rounded border border-slate-800 bg-[#090D14] px-3 py-1.5 text-slate-300">
            <span className="text-slate-500">Shell: </span>BusyBox /bin/sh (ash POSIX + script)
          </div>
          <div className="rounded border border-slate-800 bg-[#090D14] px-3 py-1.5 text-slate-300">
            <span className="text-slate-500">Isolamento: </span>100% locale in RAM · Nessuna rete reale
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4 flex items-start gap-2.5 text-xs text-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            Impossibile avviare la VM WebAssembly in questo browser: {errorMessage}. Puoi usare immediatamente la Modalità A (Terminale Didattico).
          </div>
        </div>
      )}

      {/* xterm.js Surface */}
      <div className="rounded-lg border border-slate-800 bg-[#06090F] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-[#0B1019]">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>serial0 · xterm.js · root@buildroot</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Clicca dentro il terminale per scrivere · Modifiche valide in RAM fino al riavvio VM
          </span>
        </div>

        <div
          ref={containerRef}
          data-testid="v86-xterm-container"
          onClick={() => xtermRef.current?.focus()}
          className="h-[360px] w-full p-2 bg-[#06090F]"
        />

        {/* Quick Real Linux Verification Actions */}
        <div className="border-t border-slate-800 bg-[#0B1019] px-3 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Comandi & Script reali:</span>

          <button
            type="button"
            onClick={() => sendCommand('uname -a && cat /etc/os-release | head -n 3 && id')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            Info Kernel & OS
          </button>

          <button
            type="button"
            onClick={() =>
              sendCommand(
                'mkdir -p /tmp/lab_test && cd /tmp/lab_test && touch nota.txt && echo "errore auth ssh 10.10.20.99" > nota.txt && echo "ok login" >> nota.txt && chmod 600 nota.txt && ls -la && cat nota.txt && grep "errore" nota.txt && find /tmp/lab_test -name "*.txt" && pwd'
              )
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            Test File, Permessi, Grep & Find
          </button>

          <button
            type="button"
            onClick={() =>
              sendCommand(
                'cat << "EOF" > /tmp/audit.sh\n#!/bin/sh\nTARGET="cyberlab"\nif [ "$TARGET" = "cyberlab" ]; then echo "Scope verificato: $TARGET"; fi\nfor n in 1 2 3; do echo "Controllo passo $n ok"; done\nEOF\nchmod +x /tmp/audit.sh && /tmp/audit.sh'
              )
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 hover:border-sky-500/40 hover:text-sky-300"
          >
            <Play className="w-3 h-3 text-sky-400" />
            Test Script Shell (if + for)
          </button>

          <button
            type="button"
            onClick={() => sendCommand('ps | head -n 10 && free -m')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-600"
          >
            <Play className="w-3 h-3 text-slate-400" />
            Processi & RAM (ps / free)
          </button>
        </div>
      </div>

      <div className="rounded border border-slate-800 bg-[#0B111C] p-3 text-[11px] text-slate-400 leading-relaxed">
        <strong className="text-slate-200">Nota tecnica onesta:</strong> questa istanza Buildroot Linux 6.8 esegue realmente kernel, shell, file system POSIX in RAM, processi e script dentro la sandbox WebAssembly del browser, ma non contiene Nmap, gestori pacchetti APT o accesso a reti reali esterne. Per Nmap/smbclient di laboratorio usa la <strong className="text-sky-300">Modalità A (Simulazione Didattica)</strong> oppure VirtualBox in rete interna isolata (<strong className="text-slate-200">Prep. Ambiente Reale</strong>).
      </div>
    </div>
  );
};
