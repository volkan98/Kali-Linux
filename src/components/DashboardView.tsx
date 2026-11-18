import React, { useState } from 'react';
import {
  Archive,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Code2,
  FileText,
  KeyRound,
  Printer,
  Scale,
  Server,
  Shield,
  Terminal,
  Wifi,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../data/modules';
import { NavSection, StudentProgress } from '../types/academy';
import {
  computeCompetencyScores,
  computeOverallAcademyProgress,
} from '../utils/storage';

interface DashboardViewProps {
  progress: StudentProgress;
  onNavigateSection: (section: NavSection) => void;
  onOpenModule: (moduleId: number) => void;
  onOpenBackup?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigateSection,
  onOpenModule,
  onOpenBackup,
}) => {
  const [studentName, setStudentName] = useState('Studente Cyber Lab');
  const [showCertificate, setShowCertificate] = useState(false);

  const overallPct = computeOverallAcademyProgress(progress);
  const competencies = computeCompetencyScores(progress);

  const nextModule =
    ACADEMY_MODULES.find(
      (m) => m.statoImplementazione === 'completo' && !progress.completedLessons.includes(m.id)
    ) ?? ACADEMY_MODULES[0];

  const quizValues = [
    ...Object.values(progress.initialQuizScores),
    ...Object.values(progress.finalTestScores),
  ];
  const avgQuiz =
    quizValues.length > 0
      ? Math.round(quizValues.reduce((acc, v) => acc + v, 0) / quizValues.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero Focus Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono text-sky-400">
            CYBER LAB ACADEMY · PERCORSO PROGRESSIVO DA ZERO A PROFESSIONISTA
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 text-balance">
            Impara Linux, Ethical Hacking, Sicurezza Reti Windows e Cyber Defence con laboratori reali.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tutte le simulazioni operano in ambiente isolato controllato. Comprendi il perché di ogni comando, verifica permessi SMB e reti Wi-Fi, analizza log e difendi l’infrastruttura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenModule(nextModule.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            Continua: {nextModule.codice} ({nextModule.titolo})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('impara-linux')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            Apri Terminale Linux
          </button>
        </div>
      </div>

      {/* 4 Key Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4">
          <div className="text-xs text-slate-400">Avanzamento Accademia</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-emerald-400 mt-1">
            {overallPct}%
          </div>
          <div className="h-1.5 rounded bg-slate-800 mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${overallPct}%` }} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4">
          <div className="text-xs text-slate-400">Moduli Completati</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-slate-100 mt-1">
            {progress.completedLessons.length}/{ACADEMY_MODULES.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tutti i 22 moduli con 9 fasi, dispensa e test</div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4">
          <div className="text-xs text-slate-400">Laboratori Superati</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-sky-400 mt-1">
            {progress.completedLabs.length}/5
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Linux · Windows SMB · Active Directory · Wi-Fi · Password</div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4">
          <div className="text-xs text-slate-400">Media Quiz & Scenari</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-slate-100 mt-1">
            {avgQuiz}% · {progress.completedScenarios.length}/7
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Media test · Scenari Red/Blue risolti</div>
        </div>
      </div>

      {/* Main Split: Competencies + Quick Lab Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Competency Matrix */}
        <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Progressione basata sulle Competenze
            </h2>
            <span className="text-xs text-slate-400">Aggiornata automaticamente dai quiz e dai lab</span>
          </div>

          <div className="space-y-3">
            {Object.entries(competencies).map(([domain, pct]) => (
              <div key={domain} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200">{domain}</span>
                  <span className="font-mono tabular-nums text-sky-400">{pct}%</span>
                </div>
                <div className="h-2 rounded bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 35 ? 'bg-sky-500' : 'bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {progress.weakTopics.length > 0 && (
            <div className="pt-3 border-t border-slate-800 text-xs">
              <div className="font-semibold text-amber-300 mb-1">Argomenti consigliati da ripassare:</div>
              <div className="text-slate-300">
                {Array.from(new Set(progress.weakTopics)).join(' · ')}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Labs Launchpad */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100">Laboratori Pratici Attivi</h2>
            <div className="space-y-2.5">
              {[
                {
                  section: 'impara-linux' as NavSection,
                  labId: 'terminal-lab',
                  title: 'Terminale Linux (Didattico + Linux Reale v86)',
                  desc: 'VFS collegato a Windows SMB oppure vero kernel Linux 6.8 nel browser.',
                  icon: Terminal,
                },
                {
                  section: 'windows-lab' as NavSection,
                  labId: 'windows-smb-lab',
                  title: 'Windows Network & SMB Lab',
                  desc: 'Correggi Share/NTFS ACL, disattiva SMBv1 e analizza Event Viewer.',
                  icon: Server,
                },
                {
                  section: 'ad-lab' as NavSection,
                  labId: 'ad-security-lab',
                  title: 'Active Directory Security Lab',
                  desc: 'Metti in sicurezza svc_backup, GPO, Password Policy e Kerberos.',
                  icon: Building2,
                },
                {
                  section: 'wifi-lab' as NavSection,
                  labId: 'wifi-security-lab',
                  title: 'Wi-Fi Security & Packet Inspector',
                  desc: 'Configura WPA2/WPA3, isolamento client, VLAN e ispeziona pacchetti.',
                  icon: Wifi,
                },
                {
                  section: 'password-lab' as NavSection,
                  labId: 'password-audit-lab',
                  title: 'Password Audit Lab (Sintetico)',
                  desc: 'Valuta entropia, Argon2id vs MD5, salt e protezione MFA.',
                  icon: KeyRound,
                },
              ].map((lab) => {
                const Icon = lab.icon;
                const passed = progress.completedLabs.includes(lab.labId);
                return (
                  <button
                    key={lab.labId}
                    type="button"
                    onClick={() => onNavigateSection(lab.section)}
                    className="w-full text-left rounded-md border border-slate-800 bg-[#0B111C] p-3 hover:border-sky-500/50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-100">{lab.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{lab.desc}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono shrink-0">
                      {passed ? (
                        <span className="text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Superato
                        </span>
                      ) : (
                        <span className="text-slate-400">Avvia →</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Tools Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateSection('python-lab')}
                className="flex items-center gap-2 rounded border border-slate-800 bg-[#0B111C] px-3 py-2 text-xs text-slate-200 hover:border-amber-500/40"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Python 3 Lab</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('report-builder')}
                className="flex items-center gap-2 rounded border border-slate-800 bg-[#0B111C] px-3 py-2 text-xs text-slate-200 hover:border-sky-500/40"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Report Pentest</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('assessment-prep')}
                className="flex items-center gap-2 rounded border border-slate-800 bg-[#0B111C] px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/40"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Prep. Lab Reale</span>
              </button>
              {onOpenBackup && (
                <button
                  type="button"
                  onClick={onOpenBackup}
                  className="flex items-center gap-2 rounded border border-slate-800 bg-[#0B111C] px-3 py-2 text-xs text-slate-200 hover:border-sky-500/40"
                >
                  <Archive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Backup JSON</span>
                </button>
              )}
            </div>
          </div>

          {/* Internal Completion Certificate Generator */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Attestato Interno di Percorso</h3>
            </div>
            <p className="text-xs text-slate-400">
              Genera un attestato interno riepilogativo delle competenze raggiunte (non sostituisce certificazioni professionali ufficiali).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Nome studente per attestato"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="flex-1 rounded border border-slate-700 bg-[#090D14] px-3 py-1.5 text-xs text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowCertificate((v) => !v)}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 whitespace-nowrap"
              >
                {showCertificate ? 'Nascondi' : 'Anteprima Attestato'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCertificate && (
        <div className="rounded-lg border border-emerald-500/40 bg-[#0B111C] p-8 space-y-4 text-center">
          <div className="flex justify-center">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-xs font-mono text-sky-400">CYBER LAB ACADEMY — ATTESTATO INTERNO DI COMPLETAMENTO</div>
          <h3 className="text-2xl font-bold text-slate-100">{studentName}</h3>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ha raggiunto un avanzamento complessivo del <span className="font-mono text-emerald-400 font-bold">{overallPct}%</span> completando{' '}
            {progress.completedLessons.length}/{ACADEMY_MODULES.length} moduli, {progress.completedLabs.length}/5 laboratori interattivi e{' '}
            {progress.completedScenarios.length}/7 scenari Red/Blue Team.
          </p>
          <p className="text-[11px] text-slate-500">
            Nota: attestato interno didattico. Non costituisce né sostituisce certificazioni professionali ufficiali riconosciute.
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Stampa Attestato
          </button>
        </div>
      )}
    </div>
  );
};
