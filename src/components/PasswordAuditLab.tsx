import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Lock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  HashAlgorithm,
  INITIAL_SYNTHETIC_ARCHIVE,
  SyntheticCredentialEntry,
  evaluateSyntheticPassword,
} from '../sim/passwordAuditEngine';

interface PasswordAuditLabProps {
  archive?: SyntheticCredentialEntry[];
  onUpdateArchive?: (next: SyntheticCredentialEntry[]) => void;
  onResetArchive?: () => void;
  onLabCompleted?: () => void;
}

const ALGORITHMS: HashAlgorithm[] = [
  'Plaintext',
  'MD5 (no salt)',
  'NTLM',
  'SHA-256 (no salt)',
  'bcrypt (cost 12)',
  'Argon2id',
];

export const PasswordAuditLab: React.FC<PasswordAuditLabProps> = ({
  archive: controlledArchive,
  onUpdateArchive,
  onResetArchive,
  onLabCompleted,
}) => {
  const [localArchive, setLocalArchive] = useState<SyntheticCredentialEntry[]>(INITIAL_SYNTHETIC_ARCHIVE);
  const archive = controlledArchive ?? localArchive;
  const setArchive = (
    updater:
      | SyntheticCredentialEntry[]
      | ((prev: SyntheticCredentialEntry[]) => SyntheticCredentialEntry[])
  ) => {
    const next = typeof updater === 'function' ? updater(archive) : updater;
    if (onUpdateArchive) {
      onUpdateArchive(next);
    } else {
      setLocalArchive(next);
    }
  };
  const [selectedId, setSelectedId] = useState<string>(archive[1]?.id ?? INITIAL_SYNTHETIC_ARCHIVE[1].id);
  const [testPassword, setTestPassword] = useState<string>(archive[1]?.testPassword ?? INITIAL_SYNTHETIC_ARCHIVE[1].testPassword);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(archive[1]?.hashAlgorithm ?? INITIAL_SYNTHETIC_ARCHIVE[1].hashAlgorithm);
  const [salted, setSalted] = useState<boolean>(archive[1]?.salted ?? INITIAL_SYNTHETIC_ARCHIVE[1].salted);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(archive[1]?.mfaEnabled ?? INITIAL_SYNTHETIC_ARCHIVE[1].mfaEnabled);
  const [rateLimiting, setRateLimiting] = useState<boolean>(archive[1]?.rateLimiting ?? INITIAL_SYNTHETIC_ARCHIVE[1].rateLimiting);

  const report = evaluateSyntheticPassword(testPassword, algorithm, salted, mfaEnabled, rateLimiting);

  const secureArchiveCount = archive.filter((item) => {
    const r = evaluateSyntheticPassword(
      item.testPassword,
      item.hashAlgorithm,
      item.salted,
      item.mfaEnabled,
      item.rateLimiting
    );
    return r.score >= 80;
  }).length;

  useEffect(() => {
    if (report.score >= 85 && secureArchiveCount >= 3 && onLabCompleted) {
      onLabCompleted();
    }
  }, [report.score, secureArchiveCount, onLabCompleted]);

  const loadEntry = (entry: SyntheticCredentialEntry) => {
    setSelectedId(entry.id);
    setTestPassword(entry.testPassword);
    setAlgorithm(entry.hashAlgorithm);
    setSalted(entry.salted);
    setMfaEnabled(entry.mfaEnabled);
    setRateLimiting(entry.rateLimiting);
  };

  const applyHardeningToSelected = () => {
    setArchive((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              testPassword,
              hashAlgorithm: algorithm,
              salted,
              mfaEnabled,
              rateLimiting,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Password Auditing & Credential Security Lab (Dati Sintetici)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Valuta offline la robustezza di credenziali di prova sintetiche, confronta algoritmi di hashing (MD5/NTLM vs bcrypt/Argon2id) e applica difese MFA e Rate Limiting. Non inserire mai tue password reali.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Account Sintetici Messi in Sicurezza</div>
            <div className="text-base font-mono font-bold tabular-nums text-emerald-400">
              {secureArchiveCount}/{archive.length} account (≥ 80/100)
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onResetArchive) {
                onResetArchive();
              } else {
                setLocalArchive(INITIAL_SYNTHETIC_ARCHIVE);
              }
              loadEntry(INITIAL_SYNTHETIC_ARCHIVE[1]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina Archivio
          </button>
        </div>
      </div>

      {/* Synthetic Archive Table */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Archivio Sintetico di Laboratorio (Seleziona un account per eseguire l’audit o applicare modifiche)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-3 font-medium">Account Lab</th>
                <th className="py-2 px-3 font-medium">Sistema</th>
                <th className="py-2 px-3 font-medium">Password di Prova</th>
                <th className="py-2 px-3 font-medium">Protezione</th>
                <th className="py-2 px-3 font-medium">MFA / Rate Limit</th>
                <th className="py-2 pl-3 font-medium">Esito Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {archive.map((entry) => {
                const ev = evaluateSyntheticPassword(
                  entry.testPassword,
                  entry.hashAlgorithm,
                  entry.salted,
                  entry.mfaEnabled,
                  entry.rateLimiting
                );
                const isSelected = entry.id === selectedId;
                return (
                  <tr
                    key={entry.id}
                    onClick={() => loadEntry(entry)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/30' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-2.5 pr-3 font-mono text-slate-100 font-medium">{entry.account}</td>
                    <td className="py-2.5 px-3 text-slate-300">{entry.sistema}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-300">{entry.testPassword}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {entry.hashAlgorithm.includes('no salt')
                        ? entry.hashAlgorithm
                        : `${entry.hashAlgorithm}${entry.salted ? ' + Salt' : ' (no salt)'}`}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {entry.mfaEnabled ? 'MFA ON' : 'MFA OFF'} · {entry.rateLimiting ? 'RL ON' : 'RL OFF'}
                    </td>
                    <td className="py-2.5 pl-3 font-mono tabular-nums">
                      <span
                        className={
                          ev.score >= 80
                            ? 'text-emerald-400'
                            : ev.score >= 45
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {ev.score}/100 ({ev.strengthLabel})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Simulator & Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Banco di Verifica & Miglioramento Credenziale Sintetica
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="audit-pass-input" className="block text-xs text-slate-400 mb-1">
                Password / Passphrase di prova sintetica
              </label>
              <input
                id="audit-pass-input"
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-slate-100"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'admin123',
                  'Estate2026!',
                  'treno-nuvola-bussola-quarzo-74!',
                  'R8#mK4$vP9!xL2@zW7',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setTestPassword(sample)}
                    className="px-2 py-1 text-[11px] font-mono rounded border border-slate-800 bg-[#090D14] text-slate-300 hover:border-sky-500/40"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="audit-algo-select" className="block text-xs text-slate-400 mb-1">
                Metodo di Archiviazione (Hash / KDF)
              </label>
              <select
                id="audit-algo-select"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
                className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-slate-100"
              >
                {ALGORITHMS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSalted((v) => !v)}
                className={`p-2.5 rounded border text-left text-xs ${
                  salted
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/15 text-rose-200'
                }`}
              >
                <div className="font-semibold">Salt Univoco</div>
                <div className="font-mono text-[11px] mt-0.5">{salted ? 'ATTIVO' : 'ASSENTE'}</div>
              </button>

              <button
                type="button"
                onClick={() => setMfaEnabled((v) => !v)}
                className={`p-2.5 rounded border text-left text-xs ${
                  mfaEnabled
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/15 text-amber-200'
                }`}
              >
                <div className="font-semibold">MFA / Passkey</div>
                <div className="font-mono text-[11px] mt-0.5">{mfaEnabled ? 'ATTIVO' : 'DISATTIVO'}</div>
              </button>

              <button
                type="button"
                onClick={() => setRateLimiting((v) => !v)}
                className={`p-2.5 rounded border text-left text-xs ${
                  rateLimiting
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/15 text-amber-200'
                }`}
              >
                <div className="font-semibold">Rate Limiting</div>
                <div className="font-mono text-[11px] mt-0.5">{rateLimiting ? 'ATTIVO' : 'DISATTIVO'}</div>
              </button>
            </div>

            <button
              type="button"
              onClick={applyHardeningToSelected}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Salva Configurazione nell’Account Selezionato
            </button>
          </div>
        </div>

        {/* Live Audit Breakdown */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Risultato Audit Offline</h3>
            </div>
            <span
              className={`font-mono text-base font-bold tabular-nums ${
                report.score >= 80
                  ? 'text-emerald-400'
                  : report.score >= 45
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {report.score}/100 · {report.strengthLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="text-slate-400">Entropia Effettiva Stimata</div>
              <div className="font-mono text-sm font-semibold text-slate-100 mt-0.5 tabular-nums">
                {report.entropyBits} bit
              </div>
            </div>
            <div className="rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="text-slate-400">Resistenza Offline</div>
              <div className="font-mono text-xs font-semibold text-sky-300 mt-0.5">
                {report.offlineCrackEstimate}
              </div>
            </div>
          </div>

          <div className="rounded border border-slate-800 bg-[#090D14] p-3 text-xs">
            <div className="text-slate-400">Protezione Online (Spraying / Stuffing)</div>
            <div className="font-medium text-slate-100 mt-0.5">{report.onlineAttackResistance}</div>
          </div>

          {report.weaknesses.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-amber-300">Debolezze Individuate</div>
              {report.weaknesses.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-300 rounded border border-slate-800 bg-[#090D14] p-3">
            <span className="font-semibold text-slate-100">Conseguenze potenziali: </span>
            {report.consequences}
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-emerald-400">Miglioramenti Consigliati</div>
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
