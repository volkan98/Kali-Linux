import { ACADEMY_MODULES } from '../data/modules';
import {
  ActiveDirectoryLabState,
  createInitialActiveDirectoryState,
} from '../sim/activeDirectoryEngine';
import {
  INITIAL_SYNTHETIC_ARCHIVE,
  SyntheticCredentialEntry,
} from '../sim/passwordAuditEngine';
import {
  TerminalState,
  createInitialTerminalState,
} from '../sim/terminalEngine';
import {
  WifiLabState,
  createInitialWifiLabState,
} from '../sim/wifiLabEngine';
import {
  WindowsLabState,
  createInitialWindowsLabState,
} from '../sim/windowsLabEngine';
import {
  CompetencyDomain,
  MentorMessage,
  NoteEntry,
  SecurityAssessmentReport,
  StudentProgress,
  TerminalLogLine,
} from '../types/academy';

export const STORAGE_SCHEMA_VERSION = 2;

export const KEYS = {
  progress: 'cyberlab_progress_v1',
  terminal: 'cyberlab_terminal_v1',
  terminalLog: 'cyberlab_terminal_log_v1',
  windows: 'cyberlab_windows_v1',
  ad: 'cyberlab_ad_v1',
  wifi: 'cyberlab_wifi_v1',
  password: 'cyberlab_password_v1',
  notes: 'cyberlab_notes_v1',
  mentorChat: 'cyberlab_mentor_chat_v1',
  reports: 'cyberlab_reports_v1',
  backup: 'cyberlab_backup_v1',
};

export type LabResetTarget = 'terminal' | 'windows' | 'ad' | 'wifi' | 'password' | 'mentorChat';

export function createInitialProgress(): StudentProgress {
  return {
    completedLessons: [],
    initialQuizScores: {},
    finalTestScores: {},
    completedLabs: [],
    completedScenarios: [],
    terminalExercisesPassed: [],
    finalExamScore: null,
    lastActiveModuleId: 1,
    weakTopics: [],
  };
}

export function loadFromStorage<T>(key: string, fallback: () => T): T {
  if (typeof window === 'undefined') return fallback();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export const loadProgress = () => {
  const loaded = loadFromStorage<Partial<StudentProgress>>(KEYS.progress, createInitialProgress);
  const base = createInitialProgress();
  return {
    ...base,
    ...loaded,
    completedLessons: Array.isArray(loaded.completedLessons) ? loaded.completedLessons : [],
    completedLabs: Array.isArray(loaded.completedLabs) ? loaded.completedLabs : [],
    completedScenarios: Array.isArray(loaded.completedScenarios) ? loaded.completedScenarios : [],
    terminalExercisesPassed: Array.isArray(loaded.terminalExercisesPassed) ? loaded.terminalExercisesPassed : [],
    weakTopics: Array.isArray(loaded.weakTopics) ? loaded.weakTopics : [],
    initialQuizScores: loaded.initialQuizScores && typeof loaded.initialQuizScores === 'object' ? loaded.initialQuizScores : {},
    finalTestScores: loaded.finalTestScores && typeof loaded.finalTestScores === 'object' ? loaded.finalTestScores : {},
  };
};
export const saveProgress = (v: StudentProgress) => saveToStorage(KEYS.progress, v);

export const loadTerminalState = () => loadFromStorage<TerminalState>(KEYS.terminal, createInitialTerminalState);
export const saveTerminalState = (v: TerminalState) => saveToStorage(KEYS.terminal, v);

export function createInitialTerminalLogs(): TerminalLogLine[] {
  return [
    {
      id: 'init-1',
      type: 'system',
      text: 'CYBER LAB ACADEMY — Terminale Didattico Simulato (Ambiente Isolato 10.10.20.0/24). Digita `help` per i comandi o passa alla Modalità Linux Reale (v86 WebAssembly).',
    },
  ];
}

export const loadTerminalLogs = () =>
  loadFromStorage<TerminalLogLine[]>(KEYS.terminalLog, createInitialTerminalLogs).slice(-80);
export const saveTerminalLogs = (v: TerminalLogLine[]) =>
  saveToStorage(KEYS.terminalLog, v.slice(-80));

export const loadWindowsLabState = () => loadFromStorage<WindowsLabState>(KEYS.windows, createInitialWindowsLabState);
export const saveWindowsLabState = (v: WindowsLabState) => saveToStorage(KEYS.windows, v);

export const loadAdLabState = () =>
  loadFromStorage<ActiveDirectoryLabState>(KEYS.ad, createInitialActiveDirectoryState);
export const saveAdLabState = (v: ActiveDirectoryLabState) => saveToStorage(KEYS.ad, v);

export const loadWifiLabState = () =>
  loadFromStorage<WifiLabState>(KEYS.wifi, () => createInitialWifiLabState('weak'));
export const saveWifiLabState = (v: WifiLabState) => saveToStorage(KEYS.wifi, v);

export const loadPasswordArchive = () =>
  loadFromStorage<SyntheticCredentialEntry[]>(KEYS.password, () => INITIAL_SYNTHETIC_ARCHIVE);
export const savePasswordArchive = (v: SyntheticCredentialEntry[]) => saveToStorage(KEYS.password, v);

export function createInitialNotes(): NoteEntry[] {
  return [
    {
      id: 'note-init-1',
      moduleId: 3,
      titolo: 'Comandi rapidi di triage Linux',
      contenuto:
        'Ricordare la sequenza per controllare un server sospetto: whoami -> ss -tulnp (porte aperte) -> grep Failed /var/log/auth.log -> sudo ufw status.',
      comandiSalvati: ['ss -tulnp', 'grep Failed /var/log/auth.log', 'chmod 600 chiave_lab.pem'],
      updatedAt: new Date().toISOString().slice(0, 10),
    },
    {
      id: 'note-init-2',
      moduleId: 8,
      titolo: 'Regola d’oro permessi SMB Windows',
      contenuto:
        'Quando si accede da rete via SMB, Windows calcola i permessi di condivisione (Share) e quelli NTFS e applica sempre il livello più restrittivo tra i due.',
      comandiSalvati: ['smbclient -L //10.10.20.15 -U auditor', 'nmap -sV 10.10.20.15'],
      updatedAt: new Date().toISOString().slice(0, 10),
    },
  ];
}

export const loadNotes = () => loadFromStorage<NoteEntry[]>(KEYS.notes, createInitialNotes);
export const saveNotes = (v: NoteEntry[]) => saveToStorage(KEYS.notes, v);

export function createInitialMentorChat(): MentorMessage[] {
  return [];
}

export const loadMentorChat = () =>
  loadFromStorage<MentorMessage[]>(KEYS.mentorChat, createInitialMentorChat).slice(-30);
export const saveMentorChat = (v: MentorMessage[]) => {
  // Never persist raw large image previews in localStorage chat history to avoid quota bloat or sensitive snapshots
  const sanitized = v.slice(-30).map((msg) => ({
    ...msg,
    imagePreview: undefined,
  }));
  saveToStorage(KEYS.mentorChat, sanitized);
};

export function createInitialReports(): SecurityAssessmentReport[] {
  return [];
}

export const loadReports = () =>
  loadFromStorage<SecurityAssessmentReport[]>(KEYS.reports, createInitialReports);
export const saveReports = (v: SecurityAssessmentReport[]) => saveToStorage(KEYS.reports, v);

export interface AcademyBackupBundle {
  schemaVersion: number;
  exportedAt: string;
  app: 'CYBER_LAB_ACADEMY';
  data: {
    progress: StudentProgress;
    terminal: TerminalState;
    terminalLog: TerminalLogLine[];
    windows: WindowsLabState;
    ad: ActiveDirectoryLabState;
    wifi: WifiLabState;
    password: SyntheticCredentialEntry[];
    notes: NoteEntry[];
    mentorChat: MentorMessage[];
    reports: SecurityAssessmentReport[];
  };
}

export function exportAllAcademyData(): AcademyBackupBundle {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'CYBER_LAB_ACADEMY',
    data: {
      progress: loadProgress(),
      terminal: loadTerminalState(),
      terminalLog: loadTerminalLogs(),
      windows: loadWindowsLabState(),
      ad: loadAdLabState(),
      wifi: loadWifiLabState(),
      password: loadPasswordArchive(),
      notes: loadNotes(),
      mentorChat: loadMentorChat(),
      reports: loadReports(),
    },
  };
}

export function validateBackupBundle(input: unknown): { valid: boolean; error?: string; bundle?: AcademyBackupBundle } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'File JSON non valido: contenuto mancante o non è un oggetto.' };
  }
  const obj = input as Record<string, unknown>;
  if (obj.app !== 'CYBER_LAB_ACADEMY') {
    return { valid: false, error: 'Schema non riconosciuto: manca l’identificativo "CYBER_LAB_ACADEMY".' };
  }
  if (typeof obj.schemaVersion !== 'number' || obj.schemaVersion < 1 || obj.schemaVersion > STORAGE_SCHEMA_VERSION) {
    return { valid: false, error: `Versione schema non supportata (${String(obj.schemaVersion)}).` };
  }
  const data = obj.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Sezione "data" mancante nel backup.' };
  }
  const prog = data.progress as Record<string, unknown> | undefined;
  if (!prog || !Array.isArray(prog.completedLessons) || !Array.isArray(prog.completedLabs)) {
    return { valid: false, error: 'Oggetto progress incompleto: completedLessons o completedLabs mancanti.' };
  }
  return { valid: true, bundle: obj as unknown as AcademyBackupBundle };
}

export function applyBackupBundle(bundle: AcademyBackupBundle): void {
  saveProgress(bundle.data.progress);
  if (bundle.data.terminal) saveTerminalState(bundle.data.terminal);
  if (Array.isArray(bundle.data.terminalLog)) saveTerminalLogs(bundle.data.terminalLog);
  if (bundle.data.windows) saveWindowsLabState(bundle.data.windows);
  if (bundle.data.ad) saveAdLabState(bundle.data.ad);
  if (bundle.data.wifi) saveWifiLabState(bundle.data.wifi);
  if (Array.isArray(bundle.data.password)) savePasswordArchive(bundle.data.password);
  if (Array.isArray(bundle.data.notes)) saveNotes(bundle.data.notes);
  if (Array.isArray(bundle.data.mentorChat)) saveMentorChat(bundle.data.mentorChat);
  if (Array.isArray(bundle.data.reports)) saveReports(bundle.data.reports);
}

export function createLocalBackupSnapshot(): { savedAt: string } {
  const bundle = exportAllAcademyData();
  saveToStorage(KEYS.backup, bundle);
  return { savedAt: bundle.exportedAt };
}

export function loadLocalBackupInfo(): { exists: boolean; savedAt?: string; completedLessons?: number } {
  const raw = loadFromStorage<AcademyBackupBundle | null>(KEYS.backup, () => null);
  const check = validateBackupBundle(raw);
  if (!check.valid || !check.bundle) return { exists: false };
  return {
    exists: true,
    savedAt: check.bundle.exportedAt,
    completedLessons: check.bundle.data.progress.completedLessons.length,
  };
}

export function restoreLocalBackupSnapshot(): { ok: boolean; error?: string } {
  const raw = loadFromStorage<AcademyBackupBundle | null>(KEYS.backup, () => null);
  const check = validateBackupBundle(raw);
  if (!check.valid || !check.bundle) {
    return { ok: false, error: check.error || 'Nessun backup locale valido trovato.' };
  }
  applyBackupBundle(check.bundle);
  return { ok: true };
}

export function isModuleCompetenceVerified(progress: StudentProgress, moduleId: number): boolean {
  const initScore = progress.initialQuizScores[moduleId];
  const finScore = progress.finalTestScores[moduleId];
  const studied = progress.completedLessons.includes(moduleId);
  return studied && typeof finScore === 'number' && finScore >= 70 && (initScore === undefined || initScore >= 0);
}

export function computeCompetencyScores(progress: StudentProgress): Record<CompetencyDomain, number> {
  const domains: CompetencyDomain[] = [
    'Fondamenti & OS',
    'Terminale & Amministrazione Linux',
    'Networking & Traffico',
    'Kali Linux & Enumeration',
    'Windows & Active Directory',
    'Wi-Fi Security',
    'Password & Credential Security',
    'Cyber Defence & Incident Response',
  ];

  const scores = {} as Record<CompetencyDomain, number>;
  for (const d of domains) {
    const mods = ACADEMY_MODULES.filter((m) => m.competenza === d);
    let points = 0;
    let total = mods.length * 100;

    for (const m of mods) {
      if (progress.completedLessons.includes(m.id)) points += 40;
      const qScore = progress.finalTestScores[m.id] ?? progress.initialQuizScores[m.id] ?? 0;
      points += Math.round(qScore * 0.6);
    }

    if (d === 'Terminale & Amministrazione Linux') {
      points += progress.completedLabs.includes('terminal-lab') ? 60 : progress.terminalExercisesPassed.length * 10;
      total += 60;
    }
    if (d === 'Windows & Active Directory') {
      if (progress.completedLabs.includes('windows-smb-lab')) points += 60;
      if (progress.completedLabs.includes('ad-security-lab')) points += 60;
      total += 120;
    }
    if (d === 'Wi-Fi Security') {
      if (progress.completedLabs.includes('wifi-security-lab')) points += 80;
      total += 80;
    }
    if (d === 'Password & Credential Security') {
      if (progress.completedLabs.includes('password-audit-lab')) points += 60;
      total += 60;
    }
    if (d === 'Cyber Defence & Incident Response') {
      points += progress.completedScenarios.length * 25;
      total += 175;
    }

    scores[d] = total > 0 ? Math.min(100, Math.round((points / total) * 100)) : 0;
  }
  return scores;
}

export function computeOverallAcademyProgress(progress: StudentProgress): number {
  const totalModules = Math.max(ACADEMY_MODULES.length, 1); // Fixed BUG-05: 22 modules denominator!
  const uniqueLessons = new Set(progress.completedLessons.filter((id) => id >= 1 && id <= totalModules));
  // Verified module mastery rewards both lesson study and >=70% final test score
  let lessonWeighted = 0;
  for (const m of ACADEMY_MODULES) {
    const studied = uniqueLessons.has(m.id);
    const fin = progress.finalTestScores[m.id] ?? 0;
    if (studied && fin >= 70) {
      lessonWeighted += 1;
    } else if (studied) {
      lessonWeighted += 0.5;
    } else if (fin >= 70) {
      lessonWeighted += 0.5;
    }
  }
  const lessonScore = Math.min(1, lessonWeighted / totalModules);
  const validLabs = new Set(
    progress.completedLabs.filter((id) =>
      ['terminal-lab', 'windows-smb-lab', 'ad-security-lab', 'wifi-security-lab', 'password-audit-lab'].includes(id)
    )
  );
  const labsScore = Math.min(1, validLabs.size / 5);
  const uniqueScenarios = new Set(progress.completedScenarios);
  const scenariosScore = Math.min(1, uniqueScenarios.size / 7);
  const pct = Math.round((lessonScore * 0.45 + labsScore * 0.35 + scenariosScore * 0.2) * 100);
  return Math.max(0, Math.min(100, pct));
}
