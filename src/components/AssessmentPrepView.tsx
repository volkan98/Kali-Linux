import React, { useState } from 'react';
import {
  CheckSquare,
  Download,
  HardDrive,
  Scale,
  ShieldCheck,
  Square,
} from 'lucide-react';

const LEGAL_CHECKLIST_ITEMS = [
  {
    id: 'auth-written',
    label: 'Autorizzazione scritta firmata dal proprietario dei sistemi (Lettera di Incarico / Scope)',
    detail: 'Mai eseguire scansioni attive, brute force o exploit su reti o server senza permesso scritto formale.',
  },
  {
    id: 'scope-ips',
    label: 'Elenco esatto di IP, subnet, domini in-scope e asset esclusi (Out-of-Scope)',
    detail: 'Esempio sicuro in laboratorio: subnet isolata VirtualBox 10.10.20.0/24 (mai la rete domestica o aziendale di produzione).',
  },
  {
    id: 'time-window',
    label: 'Finestra temporale concordata e canali di emergenza attivi',
    detail: 'Definire orari consentiti, limiti su test DoS/distruttivi e referente tecnico da avvisare immediatamente in caso di anomalie.',
  },
  {
    id: 'isolation-vm',
    label: 'Rete VirtualBox configurata come Host-Only o Rete Interna isolata',
    detail: 'Impedisce ai pacchetti di test di uscire verso Internet o verso dispositivi reali non autorizzati.',
  },
  {
    id: 'snapshots',
    label: 'Snapshot puliti creati su ogni VM prima dei test',
    detail: 'Permette di ripristinare istantaneamente Kali, Ubuntu Server e Windows Server dopo ogni esercitazione.',
  },
];

export const AssessmentPrepView: React.FC = () => {
  const [checked, setChecked] = useState<string[]>(['isolation-vm', 'snapshots']);
  const [orgName, setOrgName] = useState('Laboratorio Personale VirtualBox (Isolato)');
  const [targetRange, setTargetRange] = useState('10.10.20.0/24 (VM Kali + Ubuntu + Windows Server)');
  const [excludedAssets, setExcludedAssets] = useState('Rete domestica/aziendale reale, Router ISP, IP pubblici esterni');
  const [contactEmail, setContactEmail] = useState('referente-lab@esempio.local');

  const toggleItem = (id: string) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const roeDocument = `# RULES OF ENGAGEMENT (RoE) & SCOPE DI TEST AUTORIZZATO

- **Organizzazione / Ambiente**: ${orgName}
- **Asset In-Scope (Autorizzati)**: ${targetRange}
- **Asset Out-of-Scope (Esclusi)**: ${excludedAssets}
- **Contatto Tecnico / Emergenza**: ${contactEmail}
- **Attività Consentite**: Discovery autorizzata, analisi configurazioni, audit credenziali di test, verifica remediation.
- **Attività Vietate**: Denial of Service (DoS), modifica o cancellazione dati reali, test verso IP fuori perimetro.

## Checklist Verifica Pre-Test (${checked.length}/${LEGAL_CHECKLIST_ITEMS.length} completati)
${LEGAL_CHECKLIST_ITEMS.map((i) => `- [${checked.includes(i.id) ? 'x' : ' '}] ${i.label}`).join('\n')}
`;

  const downloadRoe = () => {
    const blob = new Blob([roeDocument], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scope-rules-of-engagement.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-mono">
          <Scale className="w-4 h-4" />
          ETICA, NORMATIVA & ARCHITETTURA LAB REALE
        </div>
        <h2 className="text-lg font-semibold text-slate-100">
          Preparazione all’Ambiente Reale Autorizzato (VirtualBox & Scope Legale)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Questa sezione ti guida nel passaggio responsabile dai laboratori nel browser (simulador + Linux v86 + Pyodide) a un laboratorio VirtualBox isolato sul tuo computer o a un engagement professionale regolarmente autorizzato.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Legal & Technical Pre-flight Checklist */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Checklist Obbligatoria Pre-Assessment
            </h3>
            <span className="font-mono text-xs text-emerald-400">
              {checked.length}/{LEGAL_CHECKLIST_ITEMS.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {LEGAL_CHECKLIST_ITEMS.map((item) => {
              const isDone = checked.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left rounded border p-3 transition-colors flex items-start gap-2.5 ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-[#090D14] hover:border-slate-700'
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-slate-100">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.detail}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* VirtualBox Lab Blueprint */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            Architettura Consigliata VirtualBox (Rete Isolata)
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="font-mono text-sky-400 font-semibold">1. Rete VirtualBox: Host-Only (vboxnet0)</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Assegna la subnet <code className="text-emerald-300">10.10.20.0/24</code> alle VM senza collegare il bridge Wi-Fi/Ethernet alla rete reale di casa o ufficio.
              </p>
            </div>
            <div className="rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="font-mono text-emerald-400 font-semibold">2. VM Kali Linux (10.10.20.10) — Attacker / Auditor</div>
              <p className="text-[11px] text-slate-400 mt-1">
                2 vCPU, 4 GB RAM. Strumenti reali: Nmap, Wireshark, smbclient, OpenSSH, Python 3, Hydra/Hashcat su wordlist locali.
              </p>
            </div>
            <div className="rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="font-mono text-amber-300 font-semibold">3. VM Ubuntu Server (10.10.20.11) & Windows Server / AD (10.10.20.12)</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Target didattici di proprietà dello studente su cui esercitarsi con logging (auth.log, Event Viewer) e firewall UFW/Windows Defender.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scope / RoE Builder */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-100">
            Costruttore Documento Scope & Rules of Engagement (RoE)
          </h3>
          <button
            type="button"
            onClick={downloadRoe}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica Documento Scope (.md)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <label className="space-y-1">
            <span className="text-slate-400">Nome Ambiente / Committente</span>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Contatto di Emergenza</span>
            <input
              type="text"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">IP / Domini In-Scope</span>
            <input
              type="text"
              value={targetRange}
              onChange={(e) => setTargetRange(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100 font-mono"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Asset Esclusi (Out-of-Scope)</span>
            <input
              type="text"
              value={excludedAssets}
              onChange={(e) => setExcludedAssets(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
            />
          </label>
        </div>

        <pre className="rounded border border-slate-800 bg-[#090D14] p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          {roeDocument}
        </pre>
      </div>
    </div>
  );
};
