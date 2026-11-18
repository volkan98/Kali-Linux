export type AdGroupName =
  | 'Domain Users'
  | 'Domain Admins'
  | 'Enterprise Admins'
  | 'Backup Operators'
  | 'Server Operators'
  | 'IT_Admins'
  | 'Finanza_Staff'
  | 'HR_Team'
  | 'Protected Users'
  | 'Backup_LeastPriv';

export interface AdUser {
  id: string;
  samAccountName: string;
  displayName: string;
  ou: string;
  role: string;
  isServiceAccount: boolean;
  spn?: string;
  groups: AdGroupName[];
  enabled: boolean;
  passwordAgeDays: number;
  workstationLogonRestricted: boolean;
  kerberosPreAuthEnabled: boolean;
}

export interface AdPasswordPolicy {
  minLength: number;
  complexityEnabled: boolean;
  lockoutThreshold: number;
  maxAgeDays: number;
  reversibleEncryptionDisabled: boolean;
}

export interface AdGpoSetting {
  id: string;
  name: string;
  scopeOu: string;
  disableLlmnrNbns: boolean;
  powershellScriptBlockLogging: boolean;
  tier0LogonRestriction: boolean;
}

export interface AdAuditEvent {
  id: string;
  timestamp: string;
  eventId: 4624 | 4625 | 4728 | 4729 | 4738 | 4769 | 4740;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  actor: string;
  target: string;
  detail: string;
}

export interface ActiveDirectoryLabState {
  domainName: string;
  dcHost: string;
  dcIp: string;
  functionalLevel: string;
  ous: Array<{ dn: string; purpose: string }>;
  users: AdUser[];
  passwordPolicy: AdPasswordPolicy;
  gpos: AdGpoSetting[];
  logs: AdAuditEvent[];
}

export interface AdAttackSimulationResult {
  targetUser: string;
  compromiseImpact: 'CRITICO (Domain Compromise)' | 'ALTO (Server / Dati Sensibili)' | 'CONTENUTO (Minimo Privilegio)';
  steps: string[];
  riskSummary: string;
}

export interface AdHardeningReport {
  passed: boolean;
  score: number;
  maxScore: number;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    hint: string;
  }>;
}

export const PRIVILEGED_AD_GROUPS: AdGroupName[] = [
  'Domain Admins',
  'Enterprise Admins',
  'Backup Operators',
  'Server Operators',
];

export function createInitialActiveDirectoryState(): ActiveDirectoryLabState {
  return {
    domainName: 'LABCORP.LOCAL',
    dcHost: 'DC01-WIN2022',
    dcIp: '10.10.20.12',
    functionalLevel: 'Windows Server 2022',
    ous: [
      { dn: 'OU=IT_Infrastructure,DC=labcorp,DC=local', purpose: 'Amministratori di sistema Tier-0 / Tier-1' },
      { dn: 'OU=Service_Accounts,DC=labcorp,DC=local', purpose: 'Account tecnici per backup, SQL e automazioni' },
      { dn: 'OU=Finance_Dept,DC=labcorp,DC=local', purpose: 'Utenti contabilità e gestione pagamenti' },
      { dn: 'OU=HR_Dept,DC=labcorp,DC=local', purpose: 'Personale Risorse Umane e stagisti' },
      { dn: 'OU=Workstations,DC=labcorp,DC=local', purpose: 'Postazioni Windows 11 aziendali' },
    ],
    users: [
      {
        id: 'ad-it-admin',
        samAccountName: 'it_admin',
        displayName: 'Amministratore Dominio',
        ou: 'OU=IT_Infrastructure,DC=labcorp,DC=local',
        role: 'Domain Administrator (Tier-0)',
        isServiceAccount: false,
        groups: ['Domain Users', 'IT_Admins', 'Domain Admins', 'Protected Users'],
        enabled: true,
        passwordAgeDays: 24,
        workstationLogonRestricted: true,
        kerberosPreAuthEnabled: true,
      },
      {
        id: 'ad-svc-backup',
        samAccountName: 'svc_backup',
        displayName: 'Servizio Backup Notturno',
        ou: 'OU=Service_Accounts,DC=labcorp,DC=local',
        role: 'Account di Servizio Backup',
        isServiceAccount: true,
        spn: 'BackupSvc/fs01.labcorp.local',
        groups: ['Domain Users', 'Domain Admins'],
        enabled: true,
        passwordAgeDays: 1460,
        workstationLogonRestricted: false,
        kerberosPreAuthEnabled: true,
      },
      {
        id: 'ad-svc-sql',
        samAccountName: 'svc_sql',
        displayName: 'Servizio Database Gestionale',
        ou: 'OU=Service_Accounts,DC=labcorp,DC=local',
        role: 'Account di Servizio SQL',
        isServiceAccount: true,
        spn: 'MSSQLSvc/db01.labcorp.local:1433',
        groups: ['Domain Users', 'Backup Operators'],
        enabled: true,
        passwordAgeDays: 890,
        workstationLogonRestricted: false,
        kerberosPreAuthEnabled: true,
      },
      {
        id: 'ad-ferrari',
        samAccountName: 'l.ferrari',
        displayName: 'Laura Ferrari',
        ou: 'OU=Finance_Dept,DC=labcorp,DC=local',
        role: 'Responsabile Contabilità',
        isServiceAccount: false,
        groups: ['Domain Users', 'Finanza_Staff'],
        enabled: true,
        passwordAgeDays: 42,
        workstationLogonRestricted: false,
        kerberosPreAuthEnabled: true,
      },
      {
        id: 'ad-conti',
        samAccountName: 'g.conti',
        displayName: 'Giulia Conti',
        ou: 'OU=HR_Dept,DC=labcorp,DC=local',
        role: 'HR Specialist',
        isServiceAccount: false,
        groups: ['Domain Users', 'HR_Team'],
        enabled: true,
        passwordAgeDays: 28,
        workstationLogonRestricted: false,
        kerberosPreAuthEnabled: true,
      },
      {
        id: 'ad-ex-stagista',
        samAccountName: 'ex_stagista',
        displayName: 'Marco Verdi (Ex Collaboratore)',
        ou: 'OU=HR_Dept,DC=labcorp,DC=local',
        role: 'Stage terminato 6 mesi fa (Account dormiente ancora attivo!)',
        isServiceAccount: false,
        groups: ['Domain Users', 'HR_Team'],
        enabled: true,
        passwordAgeDays: 210,
        workstationLogonRestricted: false,
        kerberosPreAuthEnabled: true,
      },
    ],
    passwordPolicy: {
      minLength: 8,
      complexityEnabled: true,
      lockoutThreshold: 0,
      maxAgeDays: 365,
      reversibleEncryptionDisabled: true,
    },
    gpos: [
      {
        id: 'gpo-default',
        name: 'Default Domain & Workstation Security GPO',
        scopeOu: 'DC=labcorp,DC=local',
        disableLlmnrNbns: false,
        powershellScriptBlockLogging: false,
        tier0LogonRestriction: false,
      },
    ],
    logs: [
      {
        id: 'ad-evt-1',
        timestamp: '14:08:11',
        eventId: 4769,
        severity: 'ALERT',
        actor: 'auditor@LABCORP.LOCAL',
        target: 'BackupSvc/fs01.labcorp.local',
        detail: 'Richiesto ticket Kerberos TGS (RC4) verso SPN di svc_backup — possibile enumerazione Kerberoasting su account con privilegi Domain Admins.',
      },
      {
        id: 'ad-evt-2',
        timestamp: '14:11:02',
        eventId: 4624,
        severity: 'WARNING',
        actor: 'ex_stagista',
        target: 'WKS-FIN01',
        detail: 'Accesso riuscito da account di ex collaboratore ancora abilitato dopo fine contratto.',
      },
    ],
  };
}

export function toggleUserGroup(
  state: ActiveDirectoryLabState,
  samAccountName: string,
  group: AdGroupName
): ActiveDirectoryLabState {
  const now = new Date().toTimeString().slice(0, 8);
  let added = false;
  const users = state.users.map((u) => {
    if (u.samAccountName !== samAccountName) return u;
    const has = u.groups.includes(group);
    added = !has;
    const nextGroups = has ? u.groups.filter((g) => g !== group) : [...u.groups, group];
    return { ...u, groups: nextGroups };
  });

  const event: AdAuditEvent = {
    id: `ad-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    eventId: added ? 4728 : 4729,
    severity: PRIVILEGED_AD_GROUPS.includes(group) && added ? 'ALERT' : 'INFO',
    actor: 'lab_operator',
    target: `${samAccountName} -> ${group}`,
    detail: added
      ? `Utente ${samAccountName} aggiunto al gruppo ${group}.`
      : `Utente ${samAccountName} rimosso dal gruppo ${group}.`,
  };

  return {
    ...state,
    users,
    logs: [event, ...state.logs].slice(0, 25),
  };
}

export function toggleUserEnabled(
  state: ActiveDirectoryLabState,
  samAccountName: string
): ActiveDirectoryLabState {
  const now = new Date().toTimeString().slice(0, 8);
  let nextEnabled = true;
  const users = state.users.map((u) => {
    if (u.samAccountName !== samAccountName) return u;
    nextEnabled = !u.enabled;
    return { ...u, enabled: nextEnabled };
  });

  const event: AdAuditEvent = {
    id: `ad-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    eventId: 4738,
    severity: 'INFO',
    actor: 'lab_operator',
    target: samAccountName,
    detail: `Stato account ${samAccountName} impostato su: ${nextEnabled ? 'ABILITATO' : 'DISABILITATO'}.`,
  };

  return {
    ...state,
    users,
    logs: [event, ...state.logs].slice(0, 25),
  };
}

export function simulateAdPrivilegePath(
  state: ActiveDirectoryLabState,
  samAccountName: string
): AdAttackSimulationResult {
  const user = state.users.find((u) => u.samAccountName === samAccountName) ?? state.users[0];
  const gpo = state.gpos[0];

  if (!user.enabled) {
    return {
      targetUser: user.samAccountName,
      compromiseImpact: 'CONTENUTO (Minimo Privilegio)',
      steps: [
        `1. Tentativo di autenticazione Kerberos per ${user.samAccountName} su DC01-WIN2022.`,
        '2. Il Domain Controller verifica lo stato account -> ACCOUNT_DISABLED (0xC0000072).',
        '3. Nessun ticket TGT rilasciato; movimento laterale bloccato alla radice.',
      ],
      riskSummary: 'Account disabilitato correttamente: nessuna esposizione residua.',
    };
  }

  const hasDomainAdmin = user.groups.includes('Domain Admins') || user.groups.includes('Enterprise Admins');
  const hasBackupOps = user.groups.includes('Backup Operators') || user.groups.includes('Server Operators');

  if (hasDomainAdmin) {
    return {
      targetUser: user.samAccountName,
      compromiseImpact: 'CRITICO (Domain Compromise)',
      steps: [
        `1. Identificato ${user.samAccountName} (${user.spn ? `SPN ${user.spn} vulnerabile a Kerberoasting` : 'appartenente a gruppo privilegiato'}).`,
        `2. L'account appartiene a Domain Admins${user.passwordAgeDays > 365 ? ` con password invariata da ${user.passwordAgeDays} giorni` : ''}.`,
        '3. Da qualsiasi sessione può eseguire DCSync su DC01-WIN2022 ed estrarre gli hash di tutto il dominio LABCORP.LOCAL.',
      ],
      riskSummary: 'Violazione critica del principio del minimo privilegio: rimuovi immediatamente l’account da Domain Admins!',
    };
  }

  if (hasBackupOps) {
    return {
      targetUser: user.samAccountName,
      compromiseImpact: 'ALTO (Server / Dati Sensibili)',
      steps: [
        `1. Account ${user.samAccountName} possiede i privilegi del gruppo ${user.groups.filter((g) => PRIVILEGED_AD_GROUPS.includes(g)).join(', ')}.`,
        '2. Backup Operators consente di leggere file protetti e copiare il database NTDS.dit o SAM sui server del dominio.',
        '3. Rischio di escalation verso Domain Admin se non sostituito con permessi granulari.',
      ],
      riskSummary: 'Privilegio eccessivo: sostituire con gruppo dedicato a minimo privilegio (Backup_LeastPriv).',
    };
  }

  const weakPolicyNotes: string[] = [];
  if (state.passwordPolicy.lockoutThreshold === 0) {
    weakPolicyNotes.push('Assenza di Account Lockout espone al password spraying online');
  }
  if (!gpo?.disableLlmnrNbns) {
    weakPolicyNotes.push('LLMNR/NBT-NS attivi facilitano spoofing sulla rete locale');
  }

  return {
    targetUser: user.samAccountName,
    compromiseImpact: 'CONTENUTO (Minimo Privilegio)',
    steps: [
      `1. Account ${user.samAccountName} opera con soli permessi standard (${user.groups.join(', ')}).`,
      `2. Nessun privilegio amministrativo su DC01-WIN2022 o gruppi Tier-0.`,
      weakPolicyNotes.length > 0
        ? `3. Attenzione policy di dominio: ${weakPolicyNotes.join('; ')}.`
        : '3. Policy password, blocco tentativi e GPO difensive attive contengono efficacemente il raggio d’azione.',
    ],
    riskSummary:
      weakPolicyNotes.length > 0
        ? `Privilegi account corretti, ma completa le policy GPO/Password: ${weakPolicyNotes.join(', ')}.`
        : 'Configurazione aderente al principio del minimo privilegio e alle linee guida Active Directory.',
  };
}

export function verifyActiveDirectoryHardening(state: ActiveDirectoryLabState): AdHardeningReport {
  const svcBackup = state.users.find((u) => u.samAccountName === 'svc_backup');
  const svcSql = state.users.find((u) => u.samAccountName === 'svc_sql');
  const exStagista = state.users.find((u) => u.samAccountName === 'ex_stagista');
  const gpo = state.gpos[0];

  const backupSafe =
    Boolean(svcBackup) &&
    !svcBackup!.groups.some((g) => PRIVILEGED_AD_GROUPS.includes(g)) &&
    svcBackup!.groups.includes('Backup_LeastPriv') &&
    svcBackup!.workstationLogonRestricted;

  const sqlSafe =
    Boolean(svcSql) &&
    !svcSql!.groups.some((g) => PRIVILEGED_AD_GROUPS.includes(g));

  const dormantDisabled = Boolean(exStagista) && !exStagista!.enabled;

  const policyHardened =
    state.passwordPolicy.minLength >= 14 &&
    state.passwordPolicy.complexityEnabled &&
    state.passwordPolicy.lockoutThreshold > 0 &&
    state.passwordPolicy.lockoutThreshold <= 5 &&
    state.passwordPolicy.maxAgeDays <= 90;

  const gpoHardened =
    Boolean(gpo) &&
    gpo.disableLlmnrNbns &&
    gpo.powershellScriptBlockLogging &&
    gpo.tier0LogonRestriction;

  const checks = [
    {
      id: 'ad-chk-svc-backup',
      label: 'svc_backup rimosso da Domain Admins, assegnato a Backup_LeastPriv e limitato ai soli server autorizzati',
      passed: backupSafe,
      hint: 'Rimuovi svc_backup da Domain Admins, aggiungi Backup_LeastPriv e attiva Restrizione Logon.',
    },
    {
      id: 'ad-chk-svc-sql',
      label: 'svc_sql rimosso da gruppi privilegiati (Backup Operators / Server Operators)',
      passed: sqlSafe,
      hint: 'Rimuovi Backup Operators da svc_sql per applicare il minimo privilegio.',
    },
    {
      id: 'ad-chk-dormant',
      label: 'Account ex collaboratore (ex_stagista) disabilitato',
      passed: dormantDisabled,
      hint: 'Disabilita ex_stagista nella tabella utenti AD.',
    },
    {
      id: 'ad-chk-pwd-policy',
      label: 'Password Policy AD: min 14 caratteri, complessità attiva, blocco dopo <= 5 tentativi, max 90 giorni',
      passed: policyHardened,
      hint: 'Imposta Lunghezza >= 14, Lockout Threshold 3-5, Scadenza <= 90 giorni.',
    },
    {
      id: 'ad-chk-gpo',
      label: 'GPO di difesa: LLMNR/NBT-NS disattivati, PowerShell Logging e Tier-0 Logon Restriction attivi',
      passed: gpoHardened,
      hint: 'Abilita tutte e 3 le difese GPO nella sezione Group Policy.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    passed: passedCount === checks.length,
    score: passedCount * 20,
    maxScore: 100,
    checks,
  };
}
