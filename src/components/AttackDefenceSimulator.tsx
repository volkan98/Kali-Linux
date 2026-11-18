import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Eye,
  RotateCcw,
  Shield,
  Swords,
  XCircle,
} from 'lucide-react';
import { ATTACK_DEFENCE_SCENARIOS } from '../data/scenarios';
import { LiveLabSnapshot, verifyScenarioInLiveLabs } from '../sim/scenarioLinker';
import { NavSection } from '../types/academy';

interface AttackDefenceSimulatorProps {
  mode: 'red-team' | 'blue-team';
  completedScenarios: string[];
  liveLabs: LiveLabSnapshot;
  onScenarioCompleted: (scenarioId: string) => void;
  onNavigateSection: (section: NavSection) => void;
}

export const AttackDefenceSimulator: React.FC<AttackDefenceSimulatorProps> = ({
  mode,
  completedScenarios,
  liveLabs,
  onScenarioCompleted,
  onNavigateSection,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    mode === 'red-team' ? 'scenario-d' : 'scenario-a'
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showLiveCheck, setShowLiveCheck] = useState<boolean>(false);

  const scenario =
    ATTACK_DEFENCE_SCENARIOS.find((s) => s.id === selectedId) ??
    ATTACK_DEFENCE_SCENARIOS[0];

  const liveStatus = verifyScenarioInLiveLabs(scenario.id, liveLabs);
  const chosenObj = scenario.opzioniIntervento.find((o) => o.id === selectedOption);
  const isCorrect = Boolean(chosenObj?.corretta);

  const handleSelectScenario = (id: string) => {
    setSelectedId(id);
    setSelectedOption(null);
    setSubmitted(false);
    setShowLiveCheck(false);
  };

  const handleEvaluate = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    const hit = scenario.opzioniIntervento.find((o) => o.id === selectedOption);
    if (hit?.corretta) {
      onScenarioCompleted(scenario.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5">
        <div className="flex items-center gap-3">
          {mode === 'red-team' ? (
            <Swords className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Shield className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              CYBER ATTACK & DEFENCE SIMULATOR — {mode === 'red-team' ? 'Modalità RED TEAM' : 'Modalità BLUE TEAM'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'red-team'
                ? 'Verifica configurazioni errate, individua vulnerabilità predisposte e documenta i rischi nell’ambiente isolato.'
                : 'Analizza evidenze e log degli attacchi simulati, seleziona le contromisure corrette e verifica il contenimento.'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono tabular-nums text-emerald-400">
          Scenari superati: {completedScenarios.length}/{ATTACK_DEFENCE_SCENARIOS.length}
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ATTACK_DEFENCE_SCENARIOS.map((sc) => {
          const active = sc.id === scenario.id;
          const done = completedScenarios.includes(sc.id);
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc.id)}
              className={`text-left rounded-md border p-3 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-950/25'
                  : 'border-slate-800 bg-[#0B111C] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-sky-400">{sc.codice}</span>
                <span className={done ? 'text-emerald-400' : 'text-slate-500'}>
                  {done ? 'Completato' : sc.difficolta}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 mt-1">{sc.titolo}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sc.categoria}</div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-sky-400">
                {scenario.codice} · {scenario.categoria} · Difficoltà {scenario.difficolta}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLiveCheck((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Verifica Stato Reale nel Lab
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection(liveStatus.targetSection)}
                  className="px-3 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                >
                  Apri {liveStatus.labName}
                </button>
              </div>
            </div>

            {showLiveCheck && (
              <div
                className={`rounded border p-3 text-xs space-y-1.5 ${
                  liveStatus.verifiedInLab
                    ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                }`}
              >
                <div className="font-semibold">
                  Stato nel Laboratorio Collegato ({liveStatus.labName}): {liveStatus.summary}
                </div>
                {liveStatus.missingRequirements.length > 0 && (
                  <ul className="list-disc pl-4 text-[11px] text-amber-100 space-y-0.5">
                    {liveStatus.missingRequirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <h3 className="text-base font-semibold text-slate-100">{scenario.titolo}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{scenario.descrizione}</p>

            <div className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs">
              <span className="font-semibold text-emerald-400">Obiettivo: </span>
              <span className="text-slate-200">{scenario.obiettivo}</span>
            </div>

            <div className="text-xs text-slate-400">
              Ambiente coinvolto: <span className="text-slate-200">{scenario.ambiente.join(' · ')}</span>
            </div>
          </div>

          {/* Evidenze & Comandi */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-semibold text-slate-100">Evidenze Raccolte nel Laboratorio</h4>
            </div>
            {scenario.evidenze.map((ev, i) => (
              <div key={i} className="rounded border border-slate-800 bg-[#06090F] p-3 space-y-1">
                <div className="text-[11px] font-mono text-sky-400">{ev.fonte}</div>
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">{ev.contenuto}</pre>
              </div>
            ))}

            <div className="text-xs text-slate-400 pt-1">
              Comandi utili nel terminale / laboratori:{' '}
              <span className="font-mono text-emerald-400">{scenario.comandiConsigliati.join('  |  ')}</span>
            </div>
          </div>
        </div>

        {/* Intervention & Evaluation (answers NOT revealed upfront) */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-100">
            Possibili Interventi & Valutazione
          </h4>
          <p className="text-xs text-slate-400">
            Analizza le evidenze e seleziona l’intervento tecnicamente corretto. La spiegazione finale viene sbloccata solo dopo la valutazione.
          </p>

          <div className="space-y-2.5">
            {scenario.opzioniIntervento.map((opt) => {
              const selected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left rounded border p-3 text-xs transition-colors ${
                    submitted && selected && opt.corretta
                      ? 'border-emerald-500/60 bg-emerald-950/25 text-emerald-100'
                      : submitted && selected && !opt.corretta
                      ? 'border-rose-500/60 bg-rose-950/25 text-rose-100'
                      : selected
                      ? 'border-sky-500 bg-sky-950/30 text-slate-100'
                      : 'border-slate-800 bg-[#0B111C] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt.azione}
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button
              type="button"
              disabled={!selectedOption}
              onClick={handleEvaluate}
              className="w-full px-4 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors"
            >
              Valuta Intervento
            </button>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-start gap-2 text-xs">
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                  {chosenObj?.feedback}
                </span>
              </div>

              <div className="rounded border border-slate-800 bg-[#0B111C] p-3 text-xs text-slate-200 space-y-1">
                <div className="font-semibold text-sky-400">Spiegazione Finale & Lezione Appresa</div>
                <p className="leading-relaxed">{scenario.spiegazioneFinale}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOption(null);
                  setSubmitted(false);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Riprova Scenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
