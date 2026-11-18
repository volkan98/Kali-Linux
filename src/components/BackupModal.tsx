import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import {
  AcademyBackupBundle,
  applyBackupBundle,
  createLocalBackupSnapshot,
  exportAllAcademyData,
  LabResetTarget,
  loadLocalBackupInfo,
  restoreLocalBackupSnapshot,
  validateBackupBundle,
} from '../utils/storage';

interface BackupModalProps {
  open: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onResetLab: (target: LabResetTarget) => void;
  onFullReset: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  open,
  onClose,
  onDataRestored,
  onResetLab,
  onFullReset,
}) => {
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pendingBundle, setPendingBundle] = useState<AcademyBackupBundle | null>(null);
  const [confirmFullReset, setConfirmFullReset] = useState(false);
  const [snapshotInfo, setSnapshotInfo] = useState(() => loadLocalBackupInfo());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleExportJson = () => {
    const bundle = exportAllAcademyData();
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-lab-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({
      ok: true,
      text: `Backup esportato con successo (${bundle.data.progress.completedLessons.length} moduli completati, ${bundle.data.notes.length} appunti, ${bundle.data.reports.length} report).`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const res = validateBackupBundle(parsed);
        if (!res.valid || !res.bundle) {
          setFeedback({ ok: false, text: res.error || 'File di backup non valido.' });
          setPendingBundle(null);
        } else {
          setPendingBundle(res.bundle);
          setFeedback({
            ok: true,
            text: `File validato (Schema v${res.bundle.schemaVersion}, esportato il ${res.bundle.exportedAt.slice(0, 10)}). Premi "Conferma Ripristino" per applicarlo.`,
          });
        }
      } catch {
        setFeedback({ ok: false, text: 'Errore di lettura JSON: il file non è un JSON valido.' });
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPending = () => {
    if (!pendingBundle) return;
    applyBackupBundle(pendingBundle);
    setPendingBundle(null);
    setFeedback({ ok: true, text: 'Backup JSON ripristinato correttamente su tutta la piattaforma!' });
    onDataRestored();
  };

  const handleSaveSnapshot = () => {
    const { savedAt } = createLocalBackupSnapshot();
    setSnapshotInfo(loadLocalBackupInfo());
    setFeedback({ ok: true, text: `Snapshot locale salvato alle ${savedAt.slice(11, 19)}.` });
  };

  const handleRestoreSnapshot = () => {
    const res = restoreLocalBackupSnapshot();
    if (res.ok) {
      setFeedback({ ok: true, text: 'Snapshot locale ripristinato con successo!' });
      onDataRestored();
    } else {
      setFeedback({ ok: false, text: res.error || 'Impossibile ripristinare lo snapshot locale.' });
    }
  };

  const labButtons: Array<{ id: LabResetTarget; label: string }> = [
    { id: 'terminal', label: 'Reset Terminale & Log' },
    { id: 'windows', label: 'Reset Windows SMB Lab' },
    { id: 'ad', label: 'Reset Active Directory Lab' },
    { id: 'wifi', label: 'Reset Wi-Fi Lab' },
    { id: 'password', label: 'Reset Password Archive' },
    { id: 'mentorChat', label: 'Svuota Chat Mentor' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Backup e Ripristino Dati"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0F1623] text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0B111C]">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-semibold">
              Backup, Esportazione JSON & Ripristino Selettivo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Chiudi finestra backup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto text-xs">
          {feedback && (
            <div
              className={`rounded border px-3.5 py-2.5 flex items-start gap-2 ${
                feedback.ok
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Export & Import JSON */}
          <div className="rounded-lg border border-slate-800 bg-[#0B111C] p-4 space-y-3">
            <div className="font-semibold text-slate-100">Esporta / Importa File Backup (.json)</div>
            <p className="text-[11px] text-slate-400">
              Salva tutti i progressi dei 22 moduli, laboratori (Linux, Windows, AD, Wi-Fi, Password), appunti, report e cronologia Mentor AI in un unico file portatile.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Esporta Tutto (.json)
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                <Upload className="w-3.5 h-3.5" />
                Importa Backup (.json)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              {pendingBundle && (
                <button
                  type="button"
                  onClick={handleApplyPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Conferma Ripristino Backup
                </button>
              )}
            </div>
          </div>

          {/* Snapshot Locale */}
          <div className="rounded-lg border border-slate-800 bg-[#0B111C] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100">Snapshot Locale di Emergenza (Browser)</span>
              <span className="text-[11px] font-mono text-slate-400">
                {snapshotInfo.exists
                  ? `Salvato (${snapshotInfo.savedAt?.slice(0, 10)}) · ${snapshotInfo.completedLessons} moduli`
                  : 'Nessuno snapshot salvato'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40"
              >
                Crea / Aggiorna Snapshot Locale
              </button>
              <button
                type="button"
                disabled={!snapshotInfo.exists}
                onClick={handleRestoreSnapshot}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                Ripristina Ultimo Snapshot
              </button>
            </div>
          </div>

          {/* Granular Resets */}
          <div className="rounded-lg border border-slate-800 bg-[#0B111C] p-4 space-y-2.5">
            <div className="font-semibold text-slate-100">Reset Selettivo Singoli Laboratori</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {labButtons.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    onResetLab(btn.id);
                    setFeedback({ ok: true, text: `${btn.label} eseguito.` });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-600"
                >
                  <RotateCcw className="w-3 h-3" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Reset */}
          <div className="rounded-lg border border-rose-500/30 bg-rose-950/15 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-rose-200">Reset Completo Piattaforma</div>
              <div className="text-[11px] text-rose-300/80">
                Riporta progressi, laboratori, note e chat allo stato iniziale (consigliato esportare prima un backup JSON).
              </div>
            </div>
            {confirmFullReset ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onFullReset();
                    setConfirmFullReset(false);
                    setFeedback({ ok: true, text: 'Piattaforma ripristinata allo stato iniziale.' });
                  }}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Conferma Azzeramento
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmFullReset(false)}
                  className="px-2.5 py-1.5 rounded border border-slate-700 text-slate-300"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmFullReset(true)}
                className="px-3 py-1.5 rounded border border-rose-500/50 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50"
              >
                Azzera Tutto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
