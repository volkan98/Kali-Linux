import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  Terminal as TerminalIcon,
  Wrench,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../data/modules';
import { LINUX_COMMANDS_DOC } from '../data/commandsDoc';
import { NavSection, StudentProgress } from '../types/academy';
import { isModuleCompetenceVerified } from '../utils/storage';
import { InteractiveDiagram } from './InteractiveDiagram';
import { QuizRunner } from './QuizRunner';

interface ModulesWorkspaceProps {
  activeModuleId: number;
  onSelectModule: (id: number) => void;
  progress: StudentProgress;
  onMarkLessonCompleted: (moduleId: number) => void;
  onSaveQuizScore: (moduleId: number, type: 'initial' | 'final', score: number, wrongConcepts: string[]) => void;
  onNavigateSection: (section: NavSection) => void;
  onAskMentor: (prompt: string) => void;
  filterPreset?: 'linux' | 'kali' | 'all';
}

type LessonTab = 'lezione' | 'comandi' | 'quiz' | 'dispensa-completa' | 'dispensa-sintetica';

export const ModulesWorkspace: React.FC<ModulesWorkspaceProps> = ({
  activeModuleId,
  onSelectModule,
  progress,
  onMarkLessonCompleted,
  onSaveQuizScore,
  onNavigateSection,
  onAskMentor,
  filterPreset = 'all',
}) => {
  const [tab, setTab] = useState<LessonTab>('lezione');
  const [cmdFilter, setCmdFilter] = useState<string>('');
  const [cmdCategory, setCmdCategory] = useState<string>('Tutte');
  const [moduleFilter, setModuleFilter] = useState<'tutti' | 'verificati'>('tutti');

  const currentModule =
    ACADEMY_MODULES.find((m) => m.id === activeModuleId) ?? ACADEMY_MODULES[0];

  const isCompleted = progress.completedLessons.includes(currentModule.id);
  const isVerified = isModuleCompetenceVerified(progress, currentModule.id);
  const verifiedCount = ACADEMY_MODULES.filter((m) => isModuleCompetenceVerified(progress, m.id)).length;

  const displayedModules = ACADEMY_MODULES.filter((m) => {
    if (moduleFilter === 'verificati' && !isModuleCompetenceVerified(progress, m.id)) return false;
    if (filterPreset === 'kali') {
      return [7, 8, 9, 10, 11, 16, 20].includes(m.id);
    }
    return true;
  });

  const filteredCommands = LINUX_COMMANDS_DOC.filter((c) => {
    const matchCat = cmdCategory === 'Tutte' || c.categoria === cmdCategory;
    const q = cmdFilter.trim().toLowerCase();
    const matchSearch =
      !q ||
      c.cmd.toLowerCase().includes(q) ||
      c.scopo.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const openTargetLab = (
    target: 'terminal' | 'windows' | 'ad' | 'wifi' | 'password' | 'python' | 'quiz'
  ) => {
    if (target === 'terminal') onNavigateSection('impara-linux');
    if (target === 'windows') onNavigateSection('windows-lab');
    if (target === 'ad') onNavigateSection('ad-lab');
    if (target === 'wifi') onNavigateSection('wifi-lab');
    if (target === 'password') onNavigateSection('password-lab');
    if (target === 'python') onNavigateSection('python-lab');
    if (target === 'quiz') setTab('quiz');
  };

  const statusLabel = (stato: string) => {
    if (stato === 'completo') return 'Completo';
    if (stato === 'fase-2') return 'Struttura Fase 2';
    if (stato === 'fase-3') return 'Struttura Fase 3';
    return 'Struttura Fase 4';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* 22-Module Curriculum Rail */}
      <aside className="xl:col-span-4 rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3 no-print">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-100">
            {filterPreset === 'kali' ? 'Moduli Kali & Assessment (7)' : 'Percorso 22 Moduli'}
          </h3>
          <div className="flex items-center gap-1 p-0.5 rounded bg-[#090D14] border border-slate-800">
            <button
              type="button"
              onClick={() => setModuleFilter('tutti')}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${
                moduleFilter === 'tutti' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tutti ({filterPreset === 'kali' ? 7 : ACADEMY_MODULES.length})
            </button>
            <button
              type="button"
              onClick={() => setModuleFilter('verificati')}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${
                moduleFilter === 'verificati' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verificati ({verifiedCount}/{ACADEMY_MODULES.length})
            </button>
          </div>
        </div>

        <div className="max-h-[680px] overflow-y-auto space-y-1.5 pr-1">
          {displayedModules.map((mod) => {
            const active = mod.id === currentModule.id;
            const done = progress.completedLessons.includes(mod.id);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  onSelectModule(mod.id);
                  setTab('lezione');
                }}
                className={`w-full text-left rounded-md border p-2.5 transition-colors ${
                  active
                    ? 'border-sky-500/60 bg-sky-950/25'
                    : 'border-slate-800/80 bg-[#0B111C] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-sky-400">{mod.codice}</span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className={mod.statoImplementazione === 'completo' ? 'text-emerald-400' : 'text-slate-500'}>
                      {statusLabel(mod.statoImplementazione)}
                    </span>
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-100 mt-0.5">{mod.titolo}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{mod.categoria}</div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active Module Detail Area */}
      <div className="xl:col-span-8 space-y-5">
        {/* Module Banner */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-sky-400">{currentModule.codice}</span>
                <span aria-hidden="true">·</span>
                <span>{currentModule.categoria}</span>
                <span aria-hidden="true">·</span>
                <span className={currentModule.statoImplementazione === 'completo' ? 'text-emerald-400' : 'text-amber-300'}>
                  {statusLabel(currentModule.statoImplementazione)}
                </span>
                {isVerified && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-semibold">Competenza Verificata (≥70%)</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-100">{currentModule.titolo}</h2>
              <p className="text-sm text-slate-300">{currentModule.obiettivo}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={() =>
                  onAskMentor(
                    `Spiegami il ${currentModule.codice}: ${currentModule.titolo} seguendo il metodo didattico con schema, esempio pratico aziendale, rischi di sicurezza ed esercizio.`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chiedi a Cyber Mentor
              </button>

              <button
                type="button"
                onClick={() => onMarkLessonCompleted(currentModule.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCompleted ? 'Modulo Completato' : 'Segna Modulo Completato'}
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 no-print">
            {[
              { id: 'lezione', label: 'Lezione 9 Fasi', icon: BookOpen },
              { id: 'comandi', label: '31 Comandi', icon: TerminalIcon },
              { id: 'quiz', label: 'Quiz & Verifica', icon: Wrench },
              { id: 'dispensa-completa', label: 'Dispensa Completa', icon: FileText },
              { id: 'dispensa-sintetica', label: 'Dispensa Sintetica', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as LessonTab)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    tab === item.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-[#090D14] text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: 9-Phase Lesson or Transparent Roadmap Notice */}
        {tab === 'lezione' && (
          <div className="space-y-4">
            {currentModule.lezione ? (
              <>
                {currentModule.lezione.prerequisiti && (
                  <section className="rounded-lg border border-sky-500/30 bg-sky-950/15 p-4 text-xs text-sky-200">
                    <span className="font-mono font-semibold text-sky-400">PREREQUISITI DA ZERO: </span>
                    {currentModule.lezione.prerequisiti}
                  </section>
                )}

                <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2">
                  <div className="text-xs font-mono text-sky-400">FASE 1 — COS’È</div>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentModule.lezione.fase1_cose}</p>
                </section>

                <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5">
                  <div className="text-xs font-mono text-sky-400">FASE 2 — COME FUNZIONA</div>
                  <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                    {currentModule.lezione.fase2_comeFunziona.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <div className="text-xs font-mono text-sky-400 px-1">FASE 3 — SCHEMA VISIVO INTERATTIVO</div>
                  <InteractiveDiagram schema={currentModule.lezione.fase3_schemaVisivo} />
                </section>

                <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5">
                  <div className="text-xs font-mono text-sky-400">
                    FASE 4 — ESEMPIO REALE ({currentModule.lezione.fase4_esempioReale.azienda})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded border border-slate-800 bg-[#0B111C] p-3">
                      <div className="font-semibold text-slate-100 mb-1">Contesto</div>
                      <p className="text-slate-300 leading-relaxed">{currentModule.lezione.fase4_esempioReale.contesto}</p>
                    </div>
                    <div className="rounded border border-slate-800 bg-[#0B111C] p-3">
                      <div className="font-semibold text-amber-300 mb-1">Problema</div>
                      <p className="text-slate-300 leading-relaxed">{currentModule.lezione.fase4_esempioReale.problema}</p>
                    </div>
                    <div className="rounded border border-slate-800 bg-[#0B111C] p-3">
                      <div className="font-semibold text-emerald-400 mb-1">Soluzione Professionale</div>
                      <p className="text-slate-300 leading-relaxed">{currentModule.lezione.fase4_esempioReale.risoluzione}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                  <div className="text-xs font-mono text-sky-400">FASE 5 — DIMOSTRAZIONE PRATICA</div>
                  {currentModule.lezione.fase5_dimostrazione.map((demo, i) => (
                    <div key={i} className="rounded border border-slate-800 bg-[#06090F] p-4 space-y-2">
                      <div className="text-xs font-semibold text-slate-100">{demo.titolo}</div>
                      <div className="text-xs font-mono text-emerald-400">$ {demo.comando}</div>
                      <div className="text-[11px] font-mono text-slate-400">Sintassi: {demo.sintassi}</div>
                      <pre className="text-xs font-mono text-slate-200 bg-[#0B111C] p-2.5 rounded border border-slate-800/80 overflow-x-auto">
                        {demo.outputAtteso}
                      </pre>
                      <p className="text-xs text-slate-300">{demo.spiegazioneOutput}</p>
                    </div>
                  ))}
                </section>

                <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-mono text-emerald-400">FASE 6 — ESERCITAZIONE IN LABORATORIO</div>
                    <button
                      type="button"
                      onClick={() => openTargetLab(currentModule.lezione!.fase6_esercitazione.targetLab)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
                    >
                      {currentModule.lezione.fase6_esercitazione.targetLab === 'quiz'
                        ? 'Apri Quiz & Verifica'
                        : 'Apri Laboratorio Collegato'}
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {currentModule.lezione.fase6_esercitazione.titolo}
                  </h4>
                  <p className="text-xs text-slate-300">{currentModule.lezione.fase6_esercitazione.descrizione}</p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-200">
                    {currentModule.lezione.fase6_esercitazione.passi.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ol>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5">
                    <div className="text-xs font-mono text-amber-400">FASE 7 — DIAGNOSI ERRORI</div>
                    {currentModule.lezione.fase7_diagnosi.map((d, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="font-mono text-rose-300">{d.errore}</div>
                        <div className="text-slate-400">Causa: {d.causa}</div>
                        <div className="text-emerald-300">Correzione: {d.correzione}</div>
                      </div>
                    ))}
                  </section>

                  <section className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2">
                    <div className="text-xs font-mono text-rose-400">FASE 8 — SICUREZZA & DIFESA</div>
                    <p className="text-xs text-slate-200">
                      <span className="font-semibold">Vulnerabilità:</span> {currentModule.lezione.fase8_sicurezza.vulnerabilita}
                    </p>
                    <p className="text-xs text-slate-300">
                      <span className="font-semibold">Rischio:</span> {currentModule.lezione.fase8_sicurezza.rischio}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-emerald-300">
                      {currentModule.lezione.fase8_sicurezza.difesa.map((def, i) => (
                        <li key={i}>{def}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="rounded-lg border border-emerald-500/30 bg-emerald-950/15 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="text-xs font-mono text-emerald-400">FASE 9 — VERIFICA FINALE</div>
                    <p className="text-sm text-slate-100">{currentModule.lezione.fase9_verifica}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('quiz')}
                    className="px-4 py-2 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
                  >
                    Vai al Quiz del Modulo
                  </button>
                </section>
              </>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-6 space-y-4">
                <div className="text-xs font-mono text-amber-400">
                  MODULO PREDISPOSTO — {statusLabel(currentModule.statoImplementazione).toUpperCase()}
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  Struttura Didattica: {currentModule.titolo}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Questo modulo fa parte della roadmap incrementale ({statusLabel(currentModule.statoImplementazione)}). Non simuliamo lezioni incomplete: hai già a disposizione la mappa degli argomenti, il quiz preparatorio, la dispensa sintetica e puoi chiedere subito a Cyber Mentor di spiegarti qualsiasi argomento del modulo in tempo reale con il metodo a 9 fasi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentModule.argomenti.map((arg) => (
                    <div key={arg} className="rounded border border-slate-800 bg-[#0B111C] px-3 py-2 text-xs text-slate-200">
                      {arg}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-sky-300">
                  Laboratorio collegato: {currentModule.laboratorioTitolo}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 31 Linux Commands Explorer */}
        {tab === 'comandi' && (
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Dizionario Operativo dei 31 Comandi Linux (Modulo 3)
                </h3>
                <p className="text-xs text-slate-400">
                  Scopo, sintassi, opzioni, output previsto, errori comuni e implicazioni di sicurezza.
                </p>
              </div>
              <input
                type="search"
                aria-label="Cerca comando Linux"
                value={cmdFilter}
                onChange={(e) => setCmdFilter(e.target.value)}
                placeholder="Cerca comando (es. chmod, grep, ss)..."
                className="rounded border border-slate-700 bg-[#090D14] px-3 py-1.5 text-xs text-slate-100 w-60"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Tutte', 'Navigazione & File', 'Ricerca & Testo', 'Permessi & Utenti', 'Processi & Servizi', 'Rete & Analisi'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCmdCategory(cat)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                      cmdCategory === cat
                        ? 'bg-sky-600 text-white'
                        : 'bg-[#090D14] text-slate-300 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="space-y-3">
              {filteredCommands.map((c) => (
                <div key={c.cmd} className="rounded-md border border-slate-800 bg-[#0B111C] p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">{c.cmd}</span>
                    <span className="text-[11px] text-slate-400">{c.categoria}</span>
                  </div>
                  <p className="text-xs text-slate-200">{c.scopo}</p>
                  <div className="text-xs font-mono text-sky-300">Sintassi: {c.sintassi}</div>
                  {c.opzioni.length > 0 && (
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      {c.opzioni.map((o) => (
                        <div key={o.flag}>
                          <span className="font-mono text-slate-100">{o.flag}</span>: {o.descrizione}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded bg-[#06090F] border border-slate-800 p-2.5 text-[11px] font-mono">
                    <div className="text-emerald-400">$ {c.esempio}</div>
                    <div className="text-slate-300 whitespace-pre-wrap mt-1">{c.outputPrevisto}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="text-amber-300">Errori comuni: {c.erroriComuni}</div>
                    <div className="text-sky-300">Sicurezza: {c.sicurezza}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Initial Quiz & Final Test */}
        {tab === 'quiz' && (
          <div className="space-y-5">
            <QuizRunner
              title={`Quiz Iniziale — ${currentModule.titolo}`}
              questions={currentModule.quizIniziale}
              savedScore={progress.initialQuizScores[currentModule.id]}
              onComplete={(score, wrong) => onSaveQuizScore(currentModule.id, 'initial', score, wrong)}
            />
            {currentModule.testFinale.length > 0 && (
              <QuizRunner
                title={`Test Finale di Modulo — ${currentModule.titolo}`}
                questions={currentModule.testFinale}
                savedScore={progress.finalTestScores[currentModule.id]}
                onComplete={(score, wrong) => onSaveQuizScore(currentModule.id, 'final', score, wrong)}
              />
            )}
          </div>
        )}

        {/* Tab 4: Dispensa Completa */}
        {tab === 'dispensa-completa' && (
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Dispensa Completa — {currentModule.codice}: {currentModule.titolo}
                </h3>
                <p className="text-xs text-slate-400">{currentModule.dispensa.completa.sommario}</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Stampa / Salva PDF
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-sky-400">Definizioni Chiave</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentModule.dispensa.completa.definizioniChiave.map((def) => (
                  <div key={def.termine} className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs">
                    <div className="font-semibold text-slate-100">{def.termine}</div>
                    <div className="text-slate-300 mt-1">{def.definizione}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-sky-400">Approfondimento Tecnico</h4>
              {currentModule.dispensa.completa.spiegazioneApprofondita.map((p, i) => (
                <p key={i} className="text-xs text-slate-200 leading-relaxed">{p}</p>
              ))}
            </div>

            {currentModule.dispensa.completa.comandiESintassi.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-sky-400">Comandi e Sintassi</h4>
                {currentModule.dispensa.completa.comandiESintassi.map((cmd, i) => (
                  <div key={i} className="rounded border border-slate-800 bg-[#06090F] p-3 text-xs font-mono">
                    <div className="text-emerald-400">{cmd.comando}</div>
                    <div className="text-slate-300 font-sans mt-0.5">{cmd.descrizione}</div>
                    <div className="text-slate-400 mt-1">Es: {cmd.esempio}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400">Rischi e Soluzioni</h4>
              {currentModule.dispensa.completa.rischiESoluzioni.map((rs, i) => (
                <div key={i} className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs">
                  <div className="text-rose-300">Rischio: {rs.rischio}</div>
                  <div className="text-emerald-300 mt-1">Soluzione: {rs.soluzione}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Dispensa Sintetica */}
        {tab === 'dispensa-sintetica' && (
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-100">
                Dispensa Sintetica (Ripasso Rapido) — {currentModule.codice}
              </h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Stampa / Salva PDF
              </button>
            </div>

            <ul className="space-y-2 text-xs text-slate-200 list-disc pl-5">
              {currentModule.dispensa.sintetica.puntiEssenziali.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>

            {currentModule.dispensa.sintetica.comandiRapidi.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-semibold text-emerald-400">Comandi Fondamentali</h4>
                {currentModule.dispensa.sintetica.comandiRapidi.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-[#090D14] px-3 py-2 text-xs">
                    <code className="text-emerald-400 font-mono">{c.comando}</code>
                    <span className="text-slate-300">{c.uso}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
