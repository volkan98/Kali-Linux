export type NavSection =
  | 'dashboard'
  | 'impara-linux'
  | 'kali-linux'
  | 'python-lab'
  | 'windows-lab'
  | 'ad-lab'
  | 'wifi-lab'
  | 'password-lab'
  | 'red-team'
  | 'blue-team'
  | 'ai-mentor'
  | 'report-builder'
  | 'assessment-prep'
  | 'esami'
  | 'appunti';

export type ImplementationPhase = 'completo' | 'fase-2' | 'fase-3' | 'fase-4';

export type CompetencyDomain =
  | 'Fondamenti & OS'
  | 'Terminale & Amministrazione Linux'
  | 'Networking & Traffico'
  | 'Kali Linux & Enumeration'
  | 'Windows & Active Directory'
  | 'Wi-Fi Security'
  | 'Password & Credential Security'
  | 'Cyber Defence & Incident Response';

export interface LessonPhases {
  prerequisiti?: string;
  fase1_cose: string;
  fase2_comeFunziona: string[];
  fase3_schemaVisivo: {
    title: string;
    nodes: Array<{ id: string; label: string; sublabel: string; type: 'client' | 'network' | 'server' | 'security' | 'storage' }>;
    flows: Array<{ from: string; to: string; label: string; protocol?: string }>;
  };
  fase4_esempioReale: {
    azienda: string;
    contesto: string;
    problema: string;
    risoluzione: string;
  };
  fase5_dimostrazione: Array<{
    titolo: string;
    comando: string;
    sintassi: string;
    outputAtteso: string;
    spiegazioneOutput: string;
  }>;
  fase6_esercitazione: {
    titolo: string;
    descrizione: string;
    targetLab: 'terminal' | 'windows' | 'ad' | 'wifi' | 'password' | 'python' | 'quiz';
    passi: string[];
  };
  fase7_diagnosi: Array<{
    errore: string;
    causa: string;
    correzione: string;
  }>;
  fase8_sicurezza: {
    vulnerabilita: string;
    rischio: string;
    difesa: string[];
  };
  fase9_verifica: string;
}

export interface QuizQuestion {
  id: string;
  domanda: string;
  opzioni: string[];
  rispostaCorretta: number;
  spiegazione: string;
  concettoCollegato: string;
}

export interface DispensaContent {
  completa: {
    sommario: string;
    definizioniChiave: Array<{ termine: string; definizione: string }>;
    spiegazioneApprofondita: string[];
    comandiESintassi: Array<{ comando: string; descrizione: string; esempio: string }>;
    rischiESoluzioni: Array<{ rischio: string; soluzione: string }>;
  };
  sintetica: {
    puntiEssenziali: string[];
    comandiRapidi: Array<{ comando: string; uso: string }>;
  };
}

export interface AcademyModule {
  id: number;
  codice: string;
  titolo: string;
  categoria: 'Fondamenti & Linux' | 'Networking & Windows' | 'Kali & Assessment' | 'Wi-Fi & Credenziali' | 'Web, Defence & SOC' | 'Red/Blue & Esame';
  competenza: CompetencyDomain;
  statoImplementazione: ImplementationPhase;
  obiettivo: string;
  argomenti: string[];
  laboratorioTitolo: string;
  lezione?: LessonPhases;
  quizIniziale: QuizQuestion[];
  testFinale: QuizQuestion[];
  dispensa: DispensaContent;
}

export interface CommandDoc {
  cmd: string;
  categoria: 'Navigazione & File' | 'Ricerca & Testo' | 'Permessi & Utenti' | 'Processi & Servizi' | 'Rete & Analisi';
  scopo: string;
  sintassi: string;
  opzioni: Array<{ flag: string; descrizione: string }>;
  esempio: string;
  outputPrevisto: string;
  erroriComuni: string;
  sicurezza: string;
}

export interface NoteEntry {
  id: string;
  moduleId: number;
  titolo: string;
  contenuto: string;
  comandiSalvati: string[];
  immagineBase64?: string;
  updatedAt: string;
}

export interface StudentProgress {
  completedLessons: number[];
  initialQuizScores: Record<number, number>;
  finalTestScores: Record<number, number>;
  completedLabs: string[];
  completedScenarios: string[];
  terminalExercisesPassed: string[];
  finalExamScore: number | null;
  lastActiveModuleId: number;
  weakTopics: string[];
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  imagePreview?: string;
  modelUsed?: string;
  error?: boolean;
}

export interface TerminalLogLine {
  id: string;
  type: 'prompt' | 'output' | 'system';
  cwd?: string;
  text: string;
}

export type FindingSeverity = 'Critica' | 'Alta' | 'Media' | 'Bassa' | 'Informativa';
export type RetestOutcome = 'Da Verificare' | 'Risolto' | 'Parzialmente Risolto' | 'Non Risolto';

export interface ReportFinding {
  id: string;
  titolo: string;
  sistemaCoinvolto: string;
  gravita: FindingSeverity;
  impatto: string;
  rischio: string;
  evidenze: string;
  correzioneConsigliata: string;
  esitoRetest: RetestOutcome;
}

export interface SecurityAssessmentReport {
  id: string;
  tipoAmbiente: 'Laboratorio Simulato Academy' | 'Ambiente Reale Autorizzato (VM / Cliente)';
  nomeProgetto: string;
  autore: string;
  data: string;
  obiettivo: string;
  sistemiAutorizzati: string;
  scope: string;
  metodologia: string;
  executiveSummary: string;
  conclusioni: string;
  findings: ReportFinding[];
  updatedAt: string;
}
