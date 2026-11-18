import { ActiveDirectoryLabState, verifyActiveDirectoryHardening } from './activeDirectoryEngine';
import { evaluateSyntheticPassword, SyntheticCredentialEntry } from './passwordAuditEngine';
import { TerminalState } from './terminalEngine';
import { analyzeWifiSecurity, verifyWifiLabHardening, WifiLabState } from './wifiLabEngine';
import { verifyWindowsLabHardening, WindowsLabState } from './windowsLabEngine';
import { NavSection } from '../types/academy';

export interface ScenarioLiveStatus {
  scenarioId: string;
  labName: string;
  targetSection: NavSection;
  verifiedInLab: boolean;
  summary: string;
  missingRequirements: string[];
}

export interface LiveLabSnapshot {
  terminal: TerminalState;
  windows: WindowsLabState;
  ad: ActiveDirectoryLabState;
  wifi: WifiLabState;
  passwordArchive: SyntheticCredentialEntry[];
}

export function verifyScenarioInLiveLabs(
  scenarioId: string,
  labs: LiveLabSnapshot
): ScenarioLiveStatus {
  switch (scenarioId) {
    case 'scenario-a': {
      const checkedAuthLog = labs.terminal.executedCommands.some(
        (c) => c.includes('grep') && c.includes('auth.log')
      );
      const ufwOn = labs.terminal.services.ufw;
      const missing: string[] = [];
      if (!checkedAuthLog) missing.push('Analizza /var/log/auth.log con grep nel Terminale Linux');
      if (!ufwOn) missing.push('Attiva il firewall Linux nel Terminale (`sudo ufw enable`)');
      return {
        scenarioId,
        labName: 'Terminale Linux (Modalità A)',
        targetSection: 'impara-linux',
        verifiedInLab: missing.length === 0,
        summary:
          missing.length === 0
            ? 'Evidenze analizzate e firewall UFW attivo nel Terminale Linux.'
            : 'Hardening SSH/UFW non ancora completato nel Terminale Linux.',
        missingRequirements: missing,
      };
    }

    case 'scenario-b': {
      const report = verifyWindowsLabHardening(labs.windows);
      const missing = report.checks.filter((c) => !c.passed).map((c) => c.label);
      return {
        scenarioId,
        labName: 'Windows Network & SMB Lab',
        targetSection: 'windows-lab',
        verifiedInLab: report.passed,
        summary: report.passed
          ? `Score ${report.score}/100: Share SMB, NTFS, SMBv1, Signing e Firewall verificati.`
          : `Score attuale ${report.score}/100 nel Windows Lab.`,
        missingRequirements: missing,
      };
    }

    case 'scenario-c':
    case 'scenario-d': {
      const checksResult = verifyWifiLabHardening(labs.wifi);
      const analysis = analyzeWifiSecurity(labs.wifi);
      const missing = checksResult.checks.filter((c) => !c.passed).map((c) => c.label);
      return {
        scenarioId,
        labName: 'Wi-Fi Security Lab',
        targetSection: 'wifi-lab',
        verifiedInLab: checksResult.passed,
        summary: checksResult.passed
          ? `Score ${analysis.score}/100: AP configurato con cifratura robusta, Client Isolation, VLAN Guest e WPS disattivo.`
          : `Score attuale ${analysis.score}/100 nel Wi-Fi Security Lab.`,
        missingRequirements: missing,
      };
    }

    case 'scenario-e': {
      const report = verifyActiveDirectoryHardening(labs.ad);
      const missing = report.checks.filter((c) => !c.passed).map((c) => c.label);
      return {
        scenarioId,
        labName: 'Active Directory Security Lab',
        targetSection: 'ad-lab',
        verifiedInLab: report.passed,
        summary: report.passed
          ? `Score ${report.score}/100: svc_backup/svc_sql messi a minimo privilegio, ex_stagista disabilitato, Password Policy & GPO attive.`
          : `Score attuale ${report.score}/100 nel laboratorio Active Directory.`,
        missingRequirements: missing,
      };
    }

    case 'scenario-f': {
      const apacheStarted = labs.terminal.services.apache2;
      const ufwOn = labs.terminal.services.ufw;
      const missing: string[] = [];
      if (!apacheStarted) missing.push('Avvia/verifica apache2 nel Terminale (`sudo systemctl start apache2`)');
      if (!ufwOn) missing.push('Abilita UFW (`sudo ufw enable`) e ispeziona porte con `ss -tulnp`');
      return {
        scenarioId,
        labName: 'Terminale Linux + Rete Lab',
        targetSection: 'impara-linux',
        verifiedInLab: missing.length === 0,
        summary:
          missing.length === 0
            ? 'Servizio web verificato e firewall UFW attivo nel laboratorio.'
            : 'Verifica web server e firewall incompleta nel Terminale Linux.',
        missingRequirements: missing,
      };
    }

    case 'scenario-g': {
      const winOk = verifyWindowsLabHardening(labs.windows).passed;
      const wifiOk = verifyWifiLabHardening(labs.wifi).passed;
      const adOk = verifyActiveDirectoryHardening(labs.ad).passed;
      const securePasswords = labs.passwordArchive.filter(
        (item) =>
          evaluateSyntheticPassword(
            item.testPassword,
            item.hashAlgorithm,
            item.salted,
            item.mfaEnabled,
            item.rateLimiting
          ).score >= 80
      ).length;
      const pwdOk = securePasswords >= 3;
      const missing: string[] = [];
      if (!labs.terminal.services.ufw) missing.push('Terminale Linux: attiva UFW (`sudo ufw enable`)');
      if (!winOk) missing.push('Windows Lab: completa tutti i controlli SMB/Firewall (100/100)');
      if (!wifiOk) missing.push('Wi-Fi Lab: completa isolamento e cifratura WPA3/WPA2 (100/100)');
      if (!adOk) missing.push('Active Directory Lab: applica minimo privilegio e GPO (100/100)');
      if (!pwdOk) missing.push('Password Audit Lab: porta almeno 3 account sintetici >= 80/100');
      return {
        scenarioId,
        labName: 'Tutti i Laboratori Aziendali',
        targetSection: 'ad-lab',
        verifiedInLab: missing.length === 0,
        summary:
          missing.length === 0
            ? 'Tutti e 5 i domini dell’infrastruttura aziendale risultano messi in sicurezza!'
            : `Mancano ${missing.length} interventi nei laboratori per il contenimento completo.`,
        missingRequirements: missing,
      };
    }

    default:
      return {
        scenarioId,
        labName: 'Laboratorio Academy',
        targetSection: 'dashboard',
        verifiedInLab: false,
        summary: 'Nessun collegamento live configurato.',
        missingRequirements: [],
      };
  }
}
