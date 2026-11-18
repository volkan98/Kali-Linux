import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { CAREER_TRACKS } from '../data/careerTracks';
import { FINAL_EXAM_QUESTIONS } from '../data/scenarios';
import { StudentProgress } from '../types/academy';
import { computeCompetencyScores } from '../utils/storage';
import { QuizRunner } from './QuizRunner';

interface ExamsViewProps {
  progress: StudentProgress;
  onSaveFinalExamScore: (score: number, wrongConcepts: string[]) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  progress,
  onSaveFinalExamScore,
}) => {
  const [subTab, setSubTab] = useState<'esame' | 'carriera'>('esame');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(CAREER_TRACKS[0].id);

  const competencies = computeCompetencyScores(progress);
  const track = CAREER_TRACKS.find((t) => t.id === selectedTrackId) ?? CAREER_TRACKS[0];

  const practicalChecks = [
    { label: 'Terminale Linux: 5 obiettivi di amministrazione e log superati', done: progress.completedLabs.includes('terminal-lab') },
    { label: 'Windows Network Lab: Share/NTFS SMB e Firewall messi in sicurezza', done: progress.completedLabs.includes('windows-smb-lab') },
    { label: 'Active Directory Lab: svc_backup/svc_sql a minimo privilegio e GPO attive', done: progress.completedLabs.includes('ad-security-lab') },
    { label: 'Wi-Fi Security Lab: AP configurato con WPA3/WPA2 robusto e isolamento', done: progress.completedLabs.includes('wifi-security-lab') },
    { label: 'Password Audit Lab: Credenziali sintetiche portate ad Argon2id + MFA', done: progress.completedLabs.includes('password-audit-lab') },
    { label: 'Simulatore Red/Blue: almeno 3 scenari aziendali risolti', done: progress.completedScenarios.length >= 3 },
  ];

  const practicalPassedCount = practicalChecks.filter((c) => c.done).length;
  const practicalScore = Math.round((practicalPassedCount / practicalChecks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5 no-print">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Esami di Verifica & Percorso Professionale
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Valutazione basata su criteri tecnici verificabili (Moduli, Laboratori pratici, Esame Finale Aziendale) e preparazione ai ruoli cybersecurity.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-md bg-[#090D14] border border-slate-800">
          <button
            type="button"
            onClick={() => setSubTab('esame')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'esame' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Esame Professionale (Mod. 22)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('carriera')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              subTab === 'carriera' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Percorso Professionale
          </button>
        </div>
      </div>

      {subTab === 'esame' ? (
        <div className="space-y-5">
          {/* Corporate Audit Scenario Brief */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-sky-400">SCENARIO DI ESAME — MODULO 22</div>
                <h3 className="text-base font-semibold text-slate-100 mt-0.5">
                  Valutazione e Messa in Sicurezza Infrastruttura Aziendale
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Infrastruttura simulata: 10 workstation Windows, 1 Windows Server, 1 Active Directory, 1 File Server SMB, 2 Server Linux, 1 Router, Wi-Fi aziendale + Guest, Firewall e Monitoraggio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Stampa Report Esame
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded border border-slate-800 bg-[#0B111C] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Criteri Pratici Verificabili nei Laboratori
                  </span>
                  <span className="text-xs font-mono tabular-nums text-emerald-400">
                    {practicalScore}% ({practicalPassedCount}/{practicalChecks.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {practicalChecks.map((chk) => (
                    <div key={chk.label} className="flex items-start gap-2 text-xs">
                      {chk.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className={chk.done ? 'text-emerald-200' : 'text-slate-300'}>
                        {chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-slate-800 bg-[#0B111C] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-100">
                    Riepilogo Punteggio Esame Finale
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 pt-1">
                  <div>
                    Parte Pratica (Laboratori & Scenari):{' '}
                    <span className="font-mono text-emerald-400 tabular-nums">{practicalScore}%</span>
                  </div>
                  <div>
                    Parte Teorica-Tecnica (Test Esame):{' '}
                    <span className="font-mono text-sky-400 tabular-nums">
                      {typeof progress.finalExamScore === 'number' ? `${progress.finalExamScore}%` : 'Non ancora sostenuto'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-2">
                  Nota trasparenza: gli attestati e i punteggi generati in Cyber Lab Academy certificano il completamento interno del percorso e non sostituiscono certificazioni ufficiali di enti esterni.
                </p>
              </div>
            </div>
          </div>

          <QuizRunner
            title="Prova Tecnica Finale — Audit Rete, Linux, Windows SMB, Wi-Fi e Credenziali"
            questions={FINAL_EXAM_QUESTIONS}
            savedScore={progress.finalExamScore}
            onComplete={onSaveFinalExamScore}
          />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Role selector */}
          <div className="flex flex-wrap gap-2">
            {CAREER_TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrackId(t.id)}
                className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
                  t.id === track.id
                    ? 'border-sky-500 bg-sky-950/30 text-sky-200'
                    : 'border-slate-800 bg-[#0B111C] text-slate-300 hover:border-slate-700'
                }`}
              >
                {t.ruolo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                <div className="text-xs font-mono text-sky-400">{track.livello}</div>
                <h3 className="text-base font-semibold text-slate-100">{track.ruolo}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{track.descrizione}</p>

                <div className="pt-2 space-y-2">
                  <div className="text-xs font-semibold text-slate-100">
                    Copertura Competenze (calcolata sui tuoi progressi reali)
                  </div>
                  {track.competenzeRichieste.map((comp) => {
                    const pct = competencies[comp.domain] ?? 0;
                    return (
                      <div key={comp.nome} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-200">
                            {comp.nome}{' '}
                            <span className="text-slate-500">(Moduli {comp.moduliCollegati.join(', ')})</span>
                          </span>
                          <span className="font-mono tabular-nums text-emerald-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-100">
                  Esempio di Problema Professionale: {track.problemaProfessionale.titolo}
                </h4>
                <p className="text-xs text-slate-300">{track.problemaProfessionale.scenario}</p>
                <div className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs text-emerald-300">
                  Approccio corretto: {track.problemaProfessionale.approccio}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-100">Simulazione Colloquio Tecnico</h4>
                {track.colloquioSimulato.map((qa, i) => (
                  <div key={i} className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs space-y-1.5">
                    <div className="font-semibold text-sky-300">Domanda: {qa.domanda}</div>
                    <div className="text-slate-200 leading-relaxed">Risposta modello: {qa.rispostaModello}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-100">Attività Quotidiane & Strumenti</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {track.attivitaQuotidiane.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                <div className="pt-2 text-slate-400">
                  Strumenti: <span className="font-mono text-emerald-400">{track.strumenti.join(' · ')}</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-100">Progetti per il Portfolio</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {track.progettiPortfolio.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-100">
                  Riferimenti di Studio Preparatori
                </h4>
                {track.percorsiStudio.map((ps) => (
                  <div key={ps.nome} className="rounded border border-slate-800 bg-[#0B111C] p-2.5">
                    <div className="font-semibold text-sky-300">{ps.nome}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ps.nota}</div>
                  </div>
                ))}
                <p className="text-[11px] text-slate-500">
                  I contenuti dell’accademia sono materiale preparatorio pratico e non rappresentano certificazioni ufficiali LPI, CompTIA o INE.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
