import React, { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  BookOpen,
  Building2,
  ClipboardCheck,
  Code2,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LayoutDashboard,
  Menu,
  Scale,
  Server,
  Shield,
  Sparkles,
  Swords,
  Terminal as TerminalIcon,
  Wifi,
  X,
} from 'lucide-react';
import { ACADEMY_MODULES } from './data/modules';
import {
  ActiveDirectoryLabState,
  createInitialActiveDirectoryState,
  verifyActiveDirectoryHardening,
} from './sim/activeDirectoryEngine';
import {
  INITIAL_SYNTHETIC_ARCHIVE,
  SyntheticCredentialEntry,
} from './sim/passwordAuditEngine';
import { TerminalState, createInitialTerminalState } from './sim/terminalEngine';
import { WifiLabState, createInitialWifiLabState, verifyWifiLabHardening } from './sim/wifiLabEngine';
import {
  WindowsLabState,
  createInitialWindowsLabState,
  verifyWindowsLabHardening,
} from './sim/windowsLabEngine';
import {
  NavSection,
  NoteEntry,
  SecurityAssessmentReport,
  StudentProgress,
} from './types/academy';
import {
  LabResetTarget,
  computeOverallAcademyProgress,
  createInitialMentorChat,
  createInitialProgress,
  createInitialTerminalLogs,
  loadAdLabState,
  loadNotes,
  loadPasswordArchive,
  loadProgress,
  loadReports,
  loadTerminalState,
  loadWifiLabState,
  loadWindowsLabState,
  saveAdLabState,
  saveMentorChat,
  saveNotes,
  savePasswordArchive,
  saveProgress,
  saveReports,
  saveTerminalLogs,
  saveTerminalState,
  saveWifiLabState,
  saveWindowsLabState,
} from './utils/storage';
import { DashboardView } from './components/DashboardView';
import { ModulesWorkspace } from './components/ModulesWorkspace';
import { LinuxTerminal } from './components/LinuxTerminal';
import { PythonLab } from './components/PythonLab';
import { WindowsNetworkLab } from './components/WindowsNetworkLab';
import { ActiveDirectoryLab } from './components/ActiveDirectoryLab';
import { WifiSecurityLab } from './components/WifiSecurityLab';
import { PasswordAuditLab } from './components/PasswordAuditLab';
import { AttackDefenceSimulator } from './components/AttackDefenceSimulator';
import { CyberMentorPanel } from './components/CyberMentorPanel';
import { ReportBuilderView } from './components/ReportBuilderView';
import { AssessmentPrepView } from './components/AssessmentPrepView';
import { ExamsView } from './components/ExamsView';
import { NotesDispenseView } from './components/NotesDispenseView';
import { BackupModal } from './components/BackupModal';

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'impara-linux', label: 'IMPARA LINUX (22 MOD.)', icon: TerminalIcon },
  { id: 'kali-linux', label: 'KALI LINUX', icon: BookOpen },
  { id: 'python-lab', label: 'PYTHON 3 LAB', icon: Code2 },
  { id: 'windows-lab', label: 'WINDOWS NETWORK LAB', icon: Server },
  { id: 'ad-lab', label: 'ACTIVE DIRECTORY LAB', icon: Building2 },
  { id: 'wifi-lab', label: 'WI-FI SECURITY LAB', icon: Wifi },
  { id: 'password-lab', label: 'PASSWORD AUDIT LAB', icon: KeyRound },
  { id: 'red-team', label: 'RED TEAM', icon: Swords },
  { id: 'blue-team', label: 'BLUE TEAM', icon: Shield },
  { id: 'ai-mentor', label: 'AI MENTOR', icon: Sparkles },
  { id: 'report-builder', label: 'REPORT PENTEST', icon: FileSpreadsheet },
  { id: 'assessment-prep', label: 'PREP. AMBIENTE REALE', icon: Scale },
  { id: 'esami', label: 'ESAMI', icon: ClipboardCheck },
  { id: 'appunti', label: 'I MIEI APPUNTI', icon: FileText },
];

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);

  const [progress, setProgress] = useState<StudentProgress>(() => loadProgress());
  const [terminalState, setTerminalState] = useState<TerminalState>(() => loadTerminalState());
  const [windowsLabState, setWindowsLabState] = useState<WindowsLabState>(() => loadWindowsLabState());
  const [adLabState, setAdLabState] = useState<ActiveDirectoryLabState>(() => loadAdLabState());
  const [wifiLabState, setWifiLabState] = useState<WifiLabState>(() => loadWifiLabState());
  const [passwordArchive, setPasswordArchive] = useState<SyntheticCredentialEntry[]>(() =>
    loadPasswordArchive()
  );
  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes());
  const [reports, setReports] = useState<SecurityAssessmentReport[]>(() => loadReports());

  const [showEmbeddedTerminal, setShowEmbeddedTerminal] = useState<boolean>(true);
  const [mentorDraftPrompt, setMentorDraftPrompt] = useState<string>('');
  const [mentorDraftImage, setMentorDraftImage] = useState<string | null>(null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveTerminalState(terminalState);
  }, [terminalState]);

  useEffect(() => {
    saveWindowsLabState(windowsLabState);
  }, [windowsLabState]);

  useEffect(() => {
    saveAdLabState(adLabState);
  }, [adLabState]);

  useEffect(() => {
    saveWifiLabState(wifiLabState);
  }, [wifiLabState]);

  useEffect(() => {
    savePasswordArchive(passwordArchive);
  }, [passwordArchive]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  const activeModule =
    ACADEMY_MODULES.find((m) => m.id === progress.lastActiveModuleId) ?? ACADEMY_MODULES[0];

  const markLabCompleted = useCallback((labId: string) => {
    setProgress((prev) => {
      if (prev.completedLabs.includes(labId)) return prev;
      return {
        ...prev,
        completedLabs: [...prev.completedLabs, labId],
      };
    });
  }, []);

  const handleTerminalObjectivesUpdated = useCallback((passedIds: string[]) => {
    setProgress((prev) => {
      if (prev.terminalExercisesPassed.join(',') === passedIds.join(',')) return prev;
      return {
        ...prev,
        terminalExercisesPassed: passedIds,
      };
    });
  }, []);

  const handleSelectModule = (moduleId: number) => {
    setProgress((prev) => ({
      ...prev,
      lastActiveModuleId: moduleId,
    }));
  };

  const handleOpenModule = (moduleId: number) => {
    handleSelectModule(moduleId);
    setActiveSection([7, 8, 9, 10, 11, 16, 20].includes(moduleId) ? 'kali-linux' : 'impara-linux');
  };

  const handleMarkLessonCompleted = (moduleId: number) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(moduleId);
      return {
        ...prev,
        completedLessons: exists
          ? prev.completedLessons.filter((id) => id !== moduleId)
          : [...prev.completedLessons, moduleId],
      };
    });
  };

  const handleSaveQuizScore = (
    moduleId: number,
    type: 'initial' | 'final',
    score: number,
    wrongConcepts: string[]
  ) => {
    setProgress((prev) => ({
      ...prev,
      initialQuizScores:
        type === 'initial' ? { ...prev.initialQuizScores, [moduleId]: score } : prev.initialQuizScores,
      finalTestScores:
        type === 'final' ? { ...prev.finalTestScores, [moduleId]: score } : prev.finalTestScores,
      weakTopics: wrongConcepts.length > 0 ? [...prev.weakTopics, ...wrongConcepts].slice(-12) : prev.weakTopics,
    }));
  };

  const handleScenarioCompleted = (scenarioId: string) => {
    setProgress((prev) => {
      if (prev.completedScenarios.includes(scenarioId)) return prev;
      return {
        ...prev,
        completedScenarios: [...prev.completedScenarios, scenarioId],
      };
    });
  };

  const handleSaveFinalExamScore = (score: number, wrongConcepts: string[]) => {
    setProgress((prev) => ({
      ...prev,
      finalExamScore: score,
      weakTopics: wrongConcepts.length > 0 ? [...prev.weakTopics, ...wrongConcepts].slice(-12) : prev.weakTopics,
    }));
  };

  const handleAskMentor = (prompt: string, imageBase64?: string) => {
    setMentorDraftPrompt(prompt);
    if (imageBase64) {
      setMentorDraftImage(imageBase64);
    }
    setActiveSection('ai-mentor');
    setMobileMenuOpen(false);
  };

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    if (section === 'kali-linux' && ![7, 8, 9, 10, 11, 16, 20].includes(progress.lastActiveModuleId)) {
      handleSelectModule(7);
    } else if (section === 'impara-linux' && (progress.lastActiveModuleId < 1 || progress.lastActiveModuleId > 22)) {
      handleSelectModule(1);
    }
  };

  const handleReloadFromStorage = () => {
    setProgress(loadProgress());
    setTerminalState(loadTerminalState());
    setWindowsLabState(loadWindowsLabState());
    setAdLabState(loadAdLabState());
    setWifiLabState(loadWifiLabState());
    setPasswordArchive(loadPasswordArchive());
    setNotes(loadNotes());
    setReports(loadReports());
  };

  const handleResetLab = (target: LabResetTarget) => {
    if (target === 'terminal') {
      const fresh = createInitialTerminalState();
      setTerminalState(fresh);
      saveTerminalLogs(createInitialTerminalLogs());
    } else if (target === 'windows') {
      setWindowsLabState(createInitialWindowsLabState());
    } else if (target === 'ad') {
      setAdLabState(createInitialActiveDirectoryState());
    } else if (target === 'wifi') {
      setWifiLabState(createInitialWifiLabState('weak'));
    } else if (target === 'password') {
      setPasswordArchive(INITIAL_SYNTHETIC_ARCHIVE);
    } else if (target === 'mentorChat') {
      saveMentorChat(createInitialMentorChat());
    }
  };

  const handleFullReset = () => {
    setProgress(createInitialProgress());
    setTerminalState(createInitialTerminalState());
    saveTerminalLogs(createInitialTerminalLogs());
    setWindowsLabState(createInitialWindowsLabState());
    setAdLabState(createInitialActiveDirectoryState());
    setWifiLabState(createInitialWifiLabState('weak'));
    setPasswordArchive(INITIAL_SYNTHETIC_ARCHIVE);
    saveMentorChat(createInitialMentorChat());
    setReports([]);
  };

  const activeNavObj = NAV_ITEMS.find((n) => n.id === activeSection) ?? NAV_ITEMS[0];
  const overallPct = computeOverallAcademyProgress(progress);

  const labSummary = `Windows SMB: ${
    verifyWindowsLabHardening(windowsLabState).passed ? 'Protetto' : 'Vulnerabile'
  } | Active Directory: ${
    verifyActiveDirectoryHardening(adLabState).passed ? 'Protetto' : 'Vulnerabile'
  } | Wi-Fi: ${verifyWifiLabHardening(wifiLabState).passed ? 'Protetto' : 'Da mettere in sicurezza'} | Lab superati: ${
    progress.completedLabs.length
  }/5`;

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-800/90 bg-[#0B1019] no-print">
        <div className="px-5 py-5 border-b border-slate-800/90">
          <div className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            CYBER LAB ACADEMY
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">
            Linux · Kali · Python · AD · Windows SMB · Wi-Fi · Cyber Defence
          </div>
        </div>

        <nav aria-label="Menu principale accademia" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left whitespace-nowrap ${
                  active
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/90 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300">
            <span>Progresso globale</span>
            <span className="font-mono tabular-nums text-emerald-400 font-semibold">{overallPct}%</span>
          </div>
          <div className="h-1.5 rounded bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${overallPct}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setBackupOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-[11px]"
          >
            <Archive className="w-3.5 h-3.5 text-sky-400" />
            Backup & Ripristino Dati
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B1019] border-r border-slate-800 flex flex-col z-10">
            <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100">CYBER LAB ACADEMY</span>
              <button
                type="button"
                aria-label="Chiudi menu di navigazione"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav aria-label="Menu mobile" className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium text-left ${
                      active
                        ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBackupOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-200 text-xs"
              >
                <Archive className="w-3.5 h-3.5 text-sky-400" />
                Backup & Ripristino
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (3 clean zones) */}
        <header className="h-14 border-b border-slate-800/90 bg-[#0B1019]/90 backdrop-blur px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Apri menu di navigazione"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-slate-100 truncate">
              {activeNavObj.label}
              {(activeSection === 'impara-linux' || activeSection === 'kali-linux') && (
                <span className="text-slate-400 font-normal">
                  {' '}
                  / {activeModule.codice}: {activeModule.titolo}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5 text-xs text-slate-400 whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigateTo('impara-linux')}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              22 Moduli
            </button>
            <button
              type="button"
              onClick={() => navigateTo('python-lab')}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Python Lab
            </button>
            <button
              type="button"
              onClick={() => navigateTo('ad-lab')}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Active Directory
            </button>
            <button
              type="button"
              onClick={() => setBackupOpen(true)}
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Backup
            </button>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('ai-mentor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cyber Mentor
            </button>
          </div>
        </header>

        {/* Active Section Viewport */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1440px] w-full mx-auto space-y-6">
          {activeSection === 'dashboard' && (
            <DashboardView
              progress={progress}
              onNavigateSection={navigateTo}
              onOpenModule={handleOpenModule}
              onOpenBackup={() => setBackupOpen(true)}
            />
          )}

          {(activeSection === 'impara-linux' || activeSection === 'kali-linux') && (
            <div className="space-y-6">
              <div className="space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-emerald-400">
                    LABORATORIO TERMINALE INTEGRATO (Modalità A Simulato + Modalità B Linux Reale v86)
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedTerminal((v) => !v)}
                    className="px-3 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  >
                    {showEmbeddedTerminal ? 'Comprimi Terminale' : 'Espandi Terminale'}
                  </button>
                </div>

                {showEmbeddedTerminal && (
                  <LinuxTerminal
                    terminalState={terminalState}
                    onUpdateTerminalState={setTerminalState}
                    windowsLabState={windowsLabState}
                    onAllObjectivesPassed={() => markLabCompleted('terminal-lab')}
                    onObjectivesUpdated={handleTerminalObjectivesUpdated}
                    onAskMentorWithOutput={(prompt) => handleAskMentor(prompt)}
                  />
                )}
              </div>

              <ModulesWorkspace
                activeModuleId={progress.lastActiveModuleId}
                onSelectModule={handleSelectModule}
                progress={progress}
                onMarkLessonCompleted={handleMarkLessonCompleted}
                onSaveQuizScore={handleSaveQuizScore}
                onNavigateSection={navigateTo}
                onAskMentor={(prompt) => handleAskMentor(prompt)}
                filterPreset={activeSection === 'kali-linux' ? 'kali' : 'all'}
              />
            </div>
          )}

          {activeSection === 'python-lab' && (
            <PythonLab onAskMentorWithOutput={(prompt) => handleAskMentor(prompt)} />
          )}

          {activeSection === 'windows-lab' && (
            <WindowsNetworkLab
              state={windowsLabState}
              onUpdateState={setWindowsLabState}
              onLabCompleted={() => markLabCompleted('windows-smb-lab')}
            />
          )}

          {activeSection === 'ad-lab' && (
            <ActiveDirectoryLab
              state={adLabState}
              onUpdateState={setAdLabState}
              onLabCompleted={() => markLabCompleted('ad-security-lab')}
            />
          )}

          {activeSection === 'wifi-lab' && (
            <WifiSecurityLab
              state={wifiLabState}
              onUpdateState={setWifiLabState}
              onLabCompleted={() => markLabCompleted('wifi-security-lab')}
            />
          )}

          {activeSection === 'password-lab' && (
            <PasswordAuditLab
              archive={passwordArchive}
              onUpdateArchive={setPasswordArchive}
              onResetArchive={() => setPasswordArchive(INITIAL_SYNTHETIC_ARCHIVE)}
              onLabCompleted={() => markLabCompleted('password-audit-lab')}
            />
          )}

          {(activeSection === 'red-team' || activeSection === 'blue-team') && (
            <AttackDefenceSimulator
              mode={activeSection}
              completedScenarios={progress.completedScenarios}
              liveLabs={{
                terminal: terminalState,
                windows: windowsLabState,
                ad: adLabState,
                wifi: wifiLabState,
                passwordArchive,
              }}
              onScenarioCompleted={handleScenarioCompleted}
              onNavigateSection={navigateTo}
            />
          )}

          {activeSection === 'ai-mentor' && (
            <CyberMentorPanel
              activeModuleId={progress.lastActiveModuleId}
              activeSectionLabel={activeNavObj.label}
              progress={progress}
              labSummary={labSummary}
              initialDraftPrompt={mentorDraftPrompt}
              initialDraftImage={mentorDraftImage}
              onConsumeDraftPrompt={() => setMentorDraftPrompt('')}
              onConsumeDraftImage={() => setMentorDraftImage(null)}
            />
          )}

          {activeSection === 'report-builder' && (
            <ReportBuilderView
              reports={reports}
              onSaveReports={setReports}
              labSummaryContext={labSummary}
            />
          )}

          {activeSection === 'assessment-prep' && <AssessmentPrepView />}

          {activeSection === 'esami' && (
            <ExamsView
              progress={progress}
              onSaveFinalExamScore={handleSaveFinalExamScore}
            />
          )}

          {activeSection === 'appunti' && (
            <NotesDispenseView
              notes={notes}
              onUpdateNotes={setNotes}
              onAskMentor={handleAskMentor}
            />
          )}
        </main>
      </div>

      <BackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onDataRestored={handleReloadFromStorage}
        onResetLab={handleResetLab}
        onFullReset={handleFullReset}
      />
    </div>
  );
}

export default App;
