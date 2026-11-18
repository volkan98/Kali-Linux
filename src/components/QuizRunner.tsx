import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QuizQuestion } from '../types/academy';

interface QuizRunnerProps {
  title: string;
  questions: QuizQuestion[];
  savedScore?: number | null;
  onComplete: (scorePercent: number, wrongConcepts: string[]) => void;
  maxQuestions?: number;
}

function selectVariedQuestions(pool: QuizQuestion[], seed: number, limit: number): QuizQuestion[] {
  if (pool.length <= limit) return pool;
  const copy = [...pool];
  // Deterministic Fisher-Yates rotation per attempt seed so retries present different question orders/subsets
  let s = seed + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, limit);
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  title,
  questions,
  savedScore,
  onComplete,
  maxQuestions = 5,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attemptSeed, setAttemptSeed] = useState(0);

  const activeQuestions = useMemo(
    () => selectVariedQuestions(questions, attemptSeed, maxQuestions),
    [questions, attemptSeed, maxQuestions]
  );

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 text-xs text-slate-400">
        Verifica dedicata non ancora disponibile. Puoi studiare la dispensa o usare i laboratori interattivi.
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = activeQuestions.filter((q) => answers[q.id] === q.rispostaCorretta).length;
  const scorePercent = Math.round((correctCount / activeQuestions.length) * 100);

  const handleSubmit = () => {
    setSubmitted(true);
    const wrongConcepts = activeQuestions
      .filter((q) => answers[q.id] !== q.rispostaCorretta)
      .map((q) => q.concettoCollegato);
    onComplete(scorePercent, wrongConcepts);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setAttemptSeed((v) => v + 1);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeQuestions.length} domande estratte da un pool di {questions.length} · Spiegazione immediata al termine (soglia verifica ≥ 70%)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {typeof savedScore === 'number' && (
            <span className="text-xs font-mono tabular-nums text-emerald-400">
              Ultimo risultato salvato: {savedScore}%
            </span>
          )}
          {submitted && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Nuovo tentativo con domande variate
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {activeQuestions.map((q, qIdx) => {
          const chosen = answers[q.id];
          const isCorrect = chosen === q.rispostaCorretta;

          return (
            <div key={q.id} className="rounded-md border border-slate-800 bg-[#0B111C] p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-100">
                <span className="font-mono text-sky-400 mr-2">{qIdx + 1}.</span>
                {q.domanda}
              </div>

              <div className="space-y-2">
                {q.opzioni.map((opt, optIdx) => {
                  const selected = chosen === optIdx;
                  const rightOption = optIdx === q.rispostaCorretta;

                  let style = 'border-slate-800 bg-[#090D14] text-slate-300 hover:border-slate-600';
                  if (submitted) {
                    if (rightOption) {
                      style = 'border-emerald-500/50 bg-emerald-950/25 text-emerald-200';
                    } else if (selected && !rightOption) {
                      style = 'border-rose-500/50 bg-rose-950/25 text-rose-200';
                    }
                  } else if (selected) {
                    style = 'border-sky-500 bg-sky-950/30 text-sky-100';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors flex items-center justify-between gap-2 ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && rightOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {submitted && selected && !rightOption && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`text-xs pt-2 border-t border-slate-800/80 ${
                    isCorrect ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {isCorrect ? 'Corretto: ' : 'Spiegazione: '}
                  {q.spiegazione}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {!submitted ? (
          <button
            type="button"
            disabled={answeredCount < questions.length}
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors"
          >
            Verifica Risposte ({answeredCount}/{questions.length})
          </button>
        ) : (
          <div className="text-xs font-mono tabular-nums text-slate-100">
            Punteggio ottenuto: <span className="text-emerald-400 font-bold">{scorePercent}%</span> ({correctCount}/{questions.length} corrette)
          </div>
        )}
      </div>
    </div>
  );
};
