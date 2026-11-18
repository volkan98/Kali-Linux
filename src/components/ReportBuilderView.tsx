import React, { useState } from 'react';
import {
  Download,
  FileText,
  Plus,
  Printer,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  FindingSeverity,
  ReportFinding,
  RetestOutcome,
  SecurityAssessmentReport,
} from '../types/academy';

interface ReportBuilderViewProps {
  reports: SecurityAssessmentReport[];
  onSaveReports: (next: SecurityAssessmentReport[]) => void;
  labSummaryContext?: string;
}

const SEVERITIES: FindingSeverity[] = ['Critica', 'Alta', 'Media', 'Bassa', 'Informativa'];
const RETEST_OUTCOMES: RetestOutcome[] = ['Da Verificare', 'Risolto', 'Parzialmente Risolto', 'Non Risolto'];

function createEmptyReport(): SecurityAssessmentReport {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `rep-${Date.now()}`,
    tipoAmbiente: 'Laboratorio Simulato Academy',
    nomeProgetto: 'Security Assessment Infrastruttura LabCorp',
    autore: 'Studente Cyber Lab Academy',
    data: today,
    obiettivo: 'Valutare esposizione rete, servizi Linux/Windows SMB, Active Directory, Wi-Fi e gestione credenziali.',
    sistemiAutorizzati: '10.10.20.10 (Kali/Linux), 10.10.20.12 (DC01), 10.10.20.15 (FS01-SMB), AP LabCorp-WiFi',
    scope: 'Esclusivamente ambiente di laboratorio autorizzato; nessun test su asset esterni.',
    metodologia: 'PTES + OWASP WSTG + Verifica configurazioni AD/SMB/Wi-Fi + Retest difensivo.',
    executiveSummary:
      'La verifica iniziale ha rilevato configurazioni ad alto rischio su condivisioni SMB, privilegi Active Directory (svc_backup) e rete Wi-Fi Guest. Dopo gli interventi di hardening è necessario validare il retest.',
    conclusioni:
      'Applicando il principio del minimo privilegio, segmentazione VLAN e cifratura Argon2id/WPA3, il livello di rischio residuo scende a livello controllato.',
    findings: [
      {
        id: `fnd-${Date.now()}`,
        titolo: 'Condivisione SMB Backup_IT accessibile al gruppo Everyone',
        sistemaCoinvolto: 'FS01-SMB (10.10.20.15)',
        gravita: 'Critica',
        impatto: 'Esposizione di script di amministrazione e snapshot aziendali anche ad account guest.',
        rischio: 'Escalation dei privilegi e furto di dati riservati tramite movimento laterale.',
        evidenze: 'smbclient -L //10.10.20.15 -U guest_user -> Backup_IT [ACCESSIBILE: READ]',
        correzioneConsigliata: 'Rimuovere Everyone da Share & NTFS ACL, disabilitare guest_user e SMBv1, attivare SMB Signing.',
        esitoRetest: 'Da Verificare',
      },
    ],
    updatedAt: today,
  };
}

function buildMarkdownReport(r: SecurityAssessmentReport): string {
  const lines = [
    `# REPORT DI SECURITY ASSESSMENT — ${r.nomeProgetto}`,
    '',
    `- **Tipo Ambiente**: ${r.tipoAmbiente}`,
    `- **Autore**: ${r.autore}`,
    `- **Data**: ${r.data}`,
    `- **Obiettivo**: ${r.obiettivo}`,
    `- **Sistemi Autorizzati**: ${r.sistemiAutorizzati}`,
    `- **Scope & Esclusioni**: ${r.scope}`,
    `- **Metodologia**: ${r.metodologia}`,
    '',
    '## Executive Summary',
    r.executiveSummary,
    '',
    `## Riepilogo Vulnerabilità (${r.findings.length})`,
    ...r.findings.flatMap((f, i) => [
      `### ${i + 1}. [${f.gravita.toUpperCase()}] ${f.titolo}`,
      `- **Sistema Coinvolto**: ${f.sistemaCoinvolto}`,
      `- **Impatto**: ${f.impatto}`,
      `- **Rischio**: ${f.rischio}`,
      `- **Evidenze**: \`${f.evidenze}\``,
      `- **Remediation Consigliata**: ${f.correzioneConsigliata}`,
      `- **Esito Retest**: ${f.esitoRetest}`,
      '',
    ]),
    '## Conclusioni & Piano di Remediation',
    r.conclusioni,
  ];
  return lines.join('\n');
}

export const ReportBuilderView: React.FC<ReportBuilderViewProps> = ({
  reports,
  onSaveReports,
  labSummaryContext,
}) => {
  const [activeId, setActiveId] = useState<string | null>(reports[0]?.id ?? null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeReport = reports.find((r) => r.id === activeId) ?? reports[0] ?? null;

  const handleCreateReport = () => {
    const fresh = createEmptyReport();
    if (labSummaryContext) {
      fresh.executiveSummary = `${fresh.executiveSummary}\n\nStato laboratori attuale: ${labSummaryContext}`;
    }
    const next = [fresh, ...reports];
    onSaveReports(next);
    setActiveId(fresh.id);
  };

  const updateActive = (patch: Partial<SecurityAssessmentReport>) => {
    if (!activeReport) return;
    const updated: SecurityAssessmentReport = {
      ...activeReport,
      ...patch,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveReports(reports.map((r) => (r.id === activeReport.id ? updated : r)));
  };

  const addFinding = () => {
    if (!activeReport) return;
    const item: ReportFinding = {
      id: `fnd-${Date.now()}`,
      titolo: 'Nuovo finding di sicurezza',
      sistemaCoinvolto: '10.10.20.x',
      gravita: 'Media',
      impatto: '',
      rischio: '',
      evidenze: '',
      correzioneConsigliata: '',
      esitoRetest: 'Da Verificare',
    };
    updateActive({ findings: [...activeReport.findings, item] });
  };

  const updateFinding = (findingId: string, patch: Partial<ReportFinding>) => {
    if (!activeReport) return;
    updateActive({
      findings: activeReport.findings.map((f) => (f.id === findingId ? { ...f, ...patch } : f)),
    });
  };

  const removeFinding = (findingId: string) => {
    if (!activeReport) return;
    updateActive({
      findings: activeReport.findings.filter((f) => f.id !== findingId),
    });
  };

  const handleExportMarkdown = () => {
    if (!activeReport) return;
    const md = buildMarkdownReport(activeReport);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport.nomeProgetto.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = (id: string) => {
    const next = reports.filter((r) => r.id !== id);
    onSaveReports(next);
    setConfirmDeleteId(null);
    setActiveId(next[0]?.id ?? null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Generatore Report di Penetration Testing & Remediation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Documenta evidenze tecniche, gravità, rischi aziendali, remediation ed esito retest. Esportabile in Markdown o Stampa/PDF.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCreateReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuovo Report Audit
          </button>
          {activeReport && (
            <>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40"
              >
                <Download className="w-3.5 h-3.5" />
                Esporta Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Stampa / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-[#0B111C] p-8 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-sky-400 mx-auto" />
          <div className="text-sm font-medium text-slate-200">
            Nessun report salvato al momento
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Crea il tuo primo report professionale di assessment partendo dai dati dei laboratori simulati o da un ambiente VM autorizzato.
          </p>
          <button
            type="button"
            onClick={handleCreateReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Crea Primo Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Saved Reports List */}
          <div className="space-y-2 no-print">
            {reports.map((r) => {
              const selected = activeReport?.id === r.id;
              return (
                <div
                  key={r.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    selected
                      ? 'border-sky-500/60 bg-[#0F1829]'
                      : 'border-slate-800 bg-[#0B111C] hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(r.id)}
                    className="w-full text-left"
                  >
                    <div className="text-[10px] font-mono text-sky-400">{r.data} · {r.findings.length} finding</div>
                    <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate">{r.nomeProgetto}</div>
                    <div className="text-[11px] text-slate-400 truncate">{r.tipoAmbiente}</div>
                  </button>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                    {confirmDeleteId === r.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(r.id)}
                          className="text-[11px] text-rose-300 font-semibold hover:underline"
                        >
                          Conferma Elimina
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] text-slate-400 hover:text-slate-200"
                        >
                          Annulla
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Report Editor */}
          {activeReport && (
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-400">Tipo di Ambiente</span>
                    <select
                      value={activeReport.tipoAmbiente}
                      onChange={(e) =>
                        updateActive({
                          tipoAmbiente: e.target.value as SecurityAssessmentReport['tipoAmbiente'],
                        })
                      }
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                    >
                      <option value="Laboratorio Simulato Academy">Laboratorio Simulato Academy</option>
                      <option value="Ambiente Reale Autorizzato (VM / Cliente)">
                        Ambiente Reale Autorizzato (VM / Cliente)
                      </option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-slate-400">Nome Progetto / Audit</span>
                    <input
                      type="text"
                      value={activeReport.nomeProgetto}
                      onChange={(e) => updateActive({ nomeProgetto: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-slate-400">Autore / Analista</span>
                    <input
                      type="text"
                      value={activeReport.autore}
                      onChange={(e) => updateActive({ autore: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-slate-400">Data</span>
                    <input
                      type="date"
                      value={activeReport.data}
                      onChange={(e) => updateActive({ data: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-slate-400">Sistemi Autorizzati & Scope</span>
                    <input
                      type="text"
                      value={activeReport.sistemiAutorizzati}
                      onChange={(e) => updateActive({ sistemiAutorizzati: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100 font-mono"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-slate-400">Executive Summary</span>
                    <textarea
                      rows={3}
                      value={activeReport.executiveSummary}
                      onChange={(e) => updateActive({ executiveSummary: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                    />
                  </label>
                </div>
              </div>

              {/* Findings List */}
              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Finding Tecnici & Retest ({activeReport.findings.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addFinding}
                    className="no-print inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Aggiungi Finding
                  </button>
                </div>

                <div className="space-y-3">
                  {activeReport.findings.map((f, idx) => (
                    <div
                      key={f.id}
                      className="rounded-lg border border-slate-800 bg-[#090D14] p-4 space-y-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-sky-400">FINDING #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select
                            aria-label="Gravità"
                            value={f.gravita}
                            onChange={(e) =>
                              updateFinding(f.id, { gravita: e.target.value as FindingSeverity })
                            }
                            className="rounded border border-slate-700 bg-[#0F1623] px-2 py-1 text-slate-100"
                          >
                            {SEVERITIES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <select
                            aria-label="Esito Retest"
                            value={f.esitoRetest}
                            onChange={(e) =>
                              updateFinding(f.id, { esitoRetest: e.target.value as RetestOutcome })
                            }
                            className="rounded border border-slate-700 bg-[#0F1623] px-2 py-1 text-slate-100"
                          >
                            {RETEST_OUTCOMES.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => removeFinding(f.id)}
                            className="no-print text-slate-500 hover:text-rose-400 p-1"
                            title="Rimuovi finding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Titolo vulnerabilità"
                          value={f.titolo}
                          onChange={(e) => updateFinding(f.id, { titolo: e.target.value })}
                          className="rounded border border-slate-700 bg-[#0F1623] px-2.5 py-1.5 text-slate-100"
                        />
                        <input
                          type="text"
                          placeholder="Sistema coinvolto (IP / Host)"
                          value={f.sistemaCoinvolto}
                          onChange={(e) => updateFinding(f.id, { sistemaCoinvolto: e.target.value })}
                          className="rounded border border-slate-700 bg-[#0F1623] px-2.5 py-1.5 text-slate-100 font-mono"
                        />
                        <textarea
                          rows={2}
                          placeholder="Impatto e Rischio"
                          value={f.impatto}
                          onChange={(e) => updateFinding(f.id, { impatto: e.target.value })}
                          className="rounded border border-slate-700 bg-[#0F1623] px-2.5 py-1.5 text-slate-100"
                        />
                        <textarea
                          rows={2}
                          placeholder="Evidenze tecniche (comandi / output / log)"
                          value={f.evidenze}
                          onChange={(e) => updateFinding(f.id, { evidenze: e.target.value })}
                          className="rounded border border-slate-700 bg-[#0F1623] px-2.5 py-1.5 text-slate-100 font-mono"
                        />
                        <textarea
                          rows={2}
                          placeholder="Remediation consigliata"
                          value={f.correzioneConsigliata}
                          onChange={(e) =>
                            updateFinding(f.id, { correzioneConsigliata: e.target.value })
                          }
                          className="md:col-span-2 rounded border border-slate-700 bg-[#0F1623] px-2.5 py-1.5 text-slate-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2 text-xs">
                <label className="block space-y-1">
                  <span className="text-slate-400 font-semibold">Conclusioni & Piano di Remediation</span>
                  <textarea
                    rows={3}
                    value={activeReport.conclusioni}
                    onChange={(e) => updateActive({ conclusioni: e.target.value })}
                    className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-slate-100"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
