export type WindowsGroup =
  | 'Everyone'
  | 'Domain Users'
  | 'Finanza_Staff'
  | 'HR_Team'
  | 'IT_Admins';

export type AclLevel = 'NONE' | 'READ' | 'CHANGE' | 'FULL';

export interface WindowsUser {
  username: string;
  displayName: string;
  ruolo: string;
  groups: WindowsGroup[];
  passwordStrength: 'Debole' | 'Media' | 'Robusta';
  enabled: boolean;
}

export interface SharedFolder {
  name: string;
  path: string;
  description: string;
  sensitivity: 'Pubblica' | 'Interna' | 'Riservata' | 'Critica';
  sharePermissions: Partial<Record<WindowsGroup, AclLevel>>;
  ntfsPermissions: Partial<Record<WindowsGroup, AclLevel>>;
  sampleFiles: string[];
}

export interface FirewallRule {
  id: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  scope: 'ANY' | 'LAB_SUBNET_ONLY' | 'BLOCKED';
  description: string;
}

export interface WindowsLogEvent {
  id: string;
  timestamp: string;
  eventId: 4624 | 4625 | 5140 | 5145 | 4719;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  sourceIp: string;
  user: string;
  target: string;
  outcome: 'CONSENTITO' | 'NEGATO' | 'BLOCCATO_FIREWALL';
  detail: string;
}

export interface AccessEvaluationTrace {
  user: string;
  userGroups: WindowsGroup[];
  shareName: string;
  sourceIp: string;
  firewallAllowed: boolean;
  firewallReason: string;
  shareEffective: AclLevel;
  ntfsEffective: AclLevel;
  finalEffective: AclLevel;
  granted: boolean;
  reason: string;
}

export interface WindowsLabCheckResult {
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

export interface WindowsLabState {
  domainName: string;
  fileServerIp: string;
  dcIp: string;
  workstationIp: string;
  kaliIp: string;
  smbV1Enabled: boolean;
  smbSigningRequired: boolean;
  guestAccountEnabled: boolean;
  users: WindowsUser[];
  shares: SharedFolder[];
  firewallRules: FirewallRule[];
  logs: WindowsLogEvent[];
}

const ACL_RANK: Record<AclLevel, number> = {
  NONE: 0,
  READ: 1,
  CHANGE: 2,
  FULL: 3,
};

function maxAcl(levels: AclLevel[]): AclLevel {
  let best: AclLevel = 'NONE';
  for (const lvl of levels) {
    if (ACL_RANK[lvl] > ACL_RANK[best]) {
      best = lvl;
    }
  }
  return best;
}

function minAcl(a: AclLevel, b: AclLevel): AclLevel {
  return ACL_RANK[a] <= ACL_RANK[b] ? a : b;
}

export function createInitialWindowsLabState(): WindowsLabState {
  return {
    domainName: 'LABCORP.LOCAL',
    fileServerIp: '10.10.20.15',
    dcIp: '10.10.20.12',
    workstationIp: '10.10.20.25',
    kaliIp: '10.10.20.10',
    smbV1Enabled: true,
    smbSigningRequired: false,
    guestAccountEnabled: true,
    users: [
      {
        username: 'guest_user',
        displayName: 'Account Ospite (Guest)',
        ruolo: 'Accesso temporaneo non privilegiato',
        groups: ['Everyone'],
        passwordStrength: 'Debole',
        enabled: true,
      },
      {
        username: 'auditor',
        displayName: 'Marco Bianchi (Auditor)',
        ruolo: 'Security Auditor autorizzato',
        groups: ['Everyone', 'Domain Users'],
        passwordStrength: 'Robusta',
        enabled: true,
      },
      {
        username: 'l.ferrari',
        displayName: 'Laura Ferrari',
        ruolo: 'Contabilità & Finanza',
        groups: ['Everyone', 'Domain Users', 'Finanza_Staff'],
        passwordStrength: 'Media',
        enabled: true,
      },
      {
        username: 'g.conti',
        displayName: 'Giulia Conti',
        ruolo: 'Risorse Umane',
        groups: ['Everyone', 'Domain Users', 'HR_Team'],
        passwordStrength: 'Robusta',
        enabled: true,
      },
      {
        username: 'it_admin',
        displayName: 'Amministratore IT',
        ruolo: 'System & File Server Administrator',
        groups: ['Everyone', 'Domain Users', 'IT_Admins'],
        passwordStrength: 'Robusta',
        enabled: true,
      },
    ],
    shares: [
      {
        name: 'Public',
        path: 'D:\\Shares\\Public',
        description: 'Documentazione interna di base e modulistica aziendale.',
        sensitivity: 'Pubblica',
        sharePermissions: {
          'Domain Users': 'READ',
          IT_Admins: 'FULL',
        },
        ntfsPermissions: {
          'Domain Users': 'READ',
          IT_Admins: 'FULL',
        },
        sampleFiles: ['manuale_benvenuto.pdf', 'calendario_ferie_2026.txt'],
      },
      {
        name: 'Finanza',
        path: 'D:\\Shares\\Finanza',
        description: 'Bilanci trimestrali e fatture fornitori.',
        sensitivity: 'Riservata',
        sharePermissions: {
          Finanza_Staff: 'CHANGE',
          IT_Admins: 'FULL',
        },
        ntfsPermissions: {
          Finanza_Staff: 'CHANGE',
          IT_Admins: 'FULL',
        },
        sampleFiles: ['bilancio_Q3_2026.xlsx', 'piano_pagamenti.csv'],
      },
      {
        name: 'Backup_IT',
        path: 'D:\\Shares\\Backup_IT',
        description: 'Snapshot di sistema e script di manutenzione (PROBLEMA: esposto a Everyone!).',
        sensitivity: 'Critica',
        sharePermissions: {
          Everyone: 'READ',
          IT_Admins: 'FULL',
        },
        ntfsPermissions: {
          Everyone: 'READ',
          IT_Admins: 'FULL',
        },
        sampleFiles: ['deploy_script_template.ps1', 'backup_config_lab.xml'],
      },
      {
        name: 'HR_Riservati',
        path: 'D:\\Shares\\HR_Riservati',
        description: 'Contratti e valutazioni del personale (PROBLEMA: Share aperta a Domain Users!).',
        sensitivity: 'Critica',
        sharePermissions: {
          'Domain Users': 'READ',
          HR_Team: 'CHANGE',
          IT_Admins: 'FULL',
        },
        ntfsPermissions: {
          'Domain Users': 'READ',
          HR_Team: 'CHANGE',
          IT_Admins: 'FULL',
        },
        sampleFiles: ['contratti_dipendenti_2026.docx', 'cedolini_archivio.pdf'],
      },
    ],
    firewallRules: [
      {
        id: 'fw-smb-445',
        port: 445,
        protocol: 'TCP',
        service: 'SMB (Direct Host)',
        scope: 'ANY',
        description: 'Traffico SMB file sharing su porta 445',
      },
      {
        id: 'fw-netbios-139',
        port: 139,
        protocol: 'TCP',
        service: 'NetBIOS Session (Legacy)',
        scope: 'ANY',
        description: 'Sessioni NetBIOS legacy per compatibilità SMBv1',
      },
      {
        id: 'fw-rdp-3389',
        port: 3389,
        protocol: 'TCP',
        service: 'RDP (Remote Desktop)',
        scope: 'LAB_SUBNET_ONLY',
        description: 'Accesso desktop remoto amministrativo',
      },
      {
        id: 'fw-winrm-5985',
        port: 5985,
        protocol: 'TCP',
        service: 'WinRM (PowerShell Remoting)',
        scope: 'LAB_SUBNET_ONLY',
        description: 'Amministrazione remota PowerShell',
      },
    ],
    logs: [
      {
        id: 'evt-init-1',
        timestamp: '14:12:04',
        eventId: 5140,
        severity: 'WARNING',
        sourceIp: '10.10.20.10',
        user: 'guest_user',
        target: '\\\\FS01-SMB\\Backup_IT',
        outcome: 'CONSENTITO',
        detail: 'Accesso in lettura a Backup_IT riuscito tramite gruppo Everyone (configurazione eccessiva).',
      },
      {
        id: 'evt-init-2',
        timestamp: '14:15:31',
        eventId: 5140,
        severity: 'WARNING',
        sourceIp: '10.10.20.25',
        user: 'auditor',
        target: '\\\\FS01-SMB\\HR_Riservati',
        outcome: 'CONSENTITO',
        detail: 'Utente non HR ha elencato la cartella HR_Riservati tramite permesso Domain Users.',
      },
    ],
  };
}

export function evaluateSmbAccess(
  state: WindowsLabState,
  username: string,
  shareName: string,
  sourceIp = '10.10.20.10',
  targetPort: 445 | 139 = 445
): AccessEvaluationTrace {
  const user = state.users.find((u) => u.username === username);
  const share = state.shares.find((s) => s.name.toLowerCase() === shareName.toLowerCase());
  const fwRule = state.firewallRules.find((r) => r.port === targetPort);

  const isInternalIp = sourceIp.startsWith('10.10.20.');
  let firewallAllowed = true;
  let firewallReason = `Porta ${targetPort}/TCP consentita dal profilo firewall (${fwRule?.scope ?? 'ANY'}).`;

  if (!fwRule || fwRule.scope === 'BLOCKED') {
    firewallAllowed = false;
    firewallReason = `Porta ${targetPort}/TCP bloccata da Windows Firewall sul server ${state.fileServerIp}.`;
  } else if (fwRule.scope === 'LAB_SUBNET_ONLY' && !isInternalIp) {
    firewallAllowed = false;
    firewallReason = `Porta ${targetPort}/TCP consentita solo alla subnet interna 10.10.20.0/24 (IP sorgente ${sourceIp} respinto).`;
  }

  if (!firewallAllowed) {
    return {
      user: username,
      userGroups: user?.groups ?? [],
      shareName: share?.name ?? shareName,
      sourceIp,
      firewallAllowed: false,
      firewallReason,
      shareEffective: 'NONE',
      ntfsEffective: 'NONE',
      finalEffective: 'NONE',
      granted: false,
      reason: firewallReason,
    };
  }

  if (!user || !user.enabled) {
    return {
      user: username,
      userGroups: [],
      shareName: share?.name ?? shareName,
      sourceIp,
      firewallAllowed: true,
      firewallReason,
      shareEffective: 'NONE',
      ntfsEffective: 'NONE',
      finalEffective: 'NONE',
      granted: false,
      reason: !user
        ? `Account '${username}' inesistente nel dominio ${state.domainName}.`
        : `Account '${username}' disabilitato: autenticazione SMB rifiutata.`,
    };
  }

  if (user.username === 'guest_user' && !state.guestAccountEnabled) {
    return {
      user: username,
      userGroups: user.groups,
      shareName: share?.name ?? shareName,
      sourceIp,
      firewallAllowed: true,
      firewallReason,
      shareEffective: 'NONE',
      ntfsEffective: 'NONE',
      finalEffective: 'NONE',
      granted: false,
      reason: 'Accesso Guest disabilitato dalle policy di sicurezza del server.',
    };
  }

  if (!share) {
    return {
      user: username,
      userGroups: user.groups,
      shareName,
      sourceIp,
      firewallAllowed: true,
      firewallReason,
      shareEffective: 'NONE',
      ntfsEffective: 'NONE',
      finalEffective: 'NONE',
      granted: false,
      reason: `Condivisione '${shareName}' non trovata su FS01-SMB.`,
    };
  }

  const shareLevels = user.groups.map((g) => share.sharePermissions[g] ?? 'NONE');
  const ntfsLevels = user.groups.map((g) => share.ntfsPermissions[g] ?? 'NONE');

  const shareEffective = maxAcl(shareLevels);
  const ntfsEffective = maxAcl(ntfsLevels);
  const finalEffective = minAcl(shareEffective, ntfsEffective);
  const granted = ACL_RANK[finalEffective] > 0;

  const reason = granted
    ? `Accesso consentito (${finalEffective}): Share ACL = ${shareEffective}, NTFS ACL = ${ntfsEffective} -> combinazione più restrittiva = ${finalEffective}.`
    : `Accesso NEGATO (0xC0000022 STATUS_ACCESS_DENIED): Share ACL = ${shareEffective}, NTFS ACL = ${ntfsEffective}. Nessun gruppo dell'utente autorizza la risorsa.`;

  return {
    user: user.username,
    userGroups: user.groups,
    shareName: share.name,
    sourceIp,
    firewallAllowed: true,
    firewallReason,
    shareEffective,
    ntfsEffective,
    finalEffective,
    granted,
    reason,
  };
}

export function performSmbAccessTest(
  state: WindowsLabState,
  username: string,
  shareName: string,
  sourceIp = '10.10.20.10',
  targetPort: 445 | 139 = 445
): { nextState: WindowsLabState; trace: AccessEvaluationTrace } {
  const trace = evaluateSmbAccess(state, username, shareName, sourceIp, targetPort);
  const now = new Date();
  const timestamp = now.toTimeString().slice(0, 8);

  const event: WindowsLogEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    eventId: !trace.firewallAllowed ? 5145 : trace.granted ? 5140 : 4625,
    severity: !trace.firewallAllowed ? 'INFO' : trace.granted && trace.user === 'guest_user' ? 'ALERT' : trace.granted ? 'INFO' : 'WARNING',
    sourceIp,
    user: username,
    target: `\\\\FS01-SMB\\${trace.shareName}`,
    outcome: !trace.firewallAllowed ? 'BLOCCATO_FIREWALL' : trace.granted ? 'CONSENTITO' : 'NEGATO',
    detail: trace.reason,
  };

  return {
    trace,
    nextState: {
      ...state,
      logs: [event, ...state.logs].slice(0, 25),
    },
  };
}

export function updateSharePermission(
  state: WindowsLabState,
  shareName: string,
  layer: 'share' | 'ntfs',
  group: WindowsGroup,
  level: AclLevel
): WindowsLabState {
  return {
    ...state,
    shares: state.shares.map((s) => {
      if (s.name !== shareName) return s;
      const targetKey = layer === 'share' ? 'sharePermissions' : 'ntfsPermissions';
      const updated = { ...s[targetKey] };
      if (level === 'NONE') {
        delete updated[group];
      } else {
        updated[group] = level;
      }
      return {
        ...s,
        [targetKey]: updated,
      };
    }),
  };
}

export function verifyWindowsLabHardening(state: WindowsLabState): WindowsLabCheckResult {
  const guestBackup = evaluateSmbAccess(state, 'guest_user', 'Backup_IT', '10.10.20.10');
  const auditorBackup = evaluateSmbAccess(state, 'auditor', 'Backup_IT', '10.10.20.10');
  const adminBackup = evaluateSmbAccess(state, 'it_admin', 'Backup_IT', '10.10.20.10');
  const auditorHr = evaluateSmbAccess(state, 'auditor', 'HR_Riservati', '10.10.20.10');
  const hrUserHr = evaluateSmbAccess(state, 'g.conti', 'HR_Riservati', '10.10.20.10');
  const fw139 = state.firewallRules.find((r) => r.port === 139);
  const fw445 = state.firewallRules.find((r) => r.port === 445);

  const checks = [
    {
      id: 'chk-backup-acl',
      label: 'Backup_IT bloccato per Everyone / utenti non IT (ma accessibile a it_admin)',
      passed: !guestBackup.granted && !auditorBackup.granted && adminBackup.granted,
      hint: 'Rimuovi Everyone da Share e NTFS su Backup_IT mantenendo IT_Admins.',
    },
    {
      id: 'chk-hr-acl',
      label: 'HR_Riservati limitato al team HR_Team e IT_Admins (negato a Domain Users)',
      passed: !auditorHr.granted && hrUserHr.granted,
      hint: 'Rimuovi Domain Users dalle ACL di HR_Riservati mantenendo HR_Team.',
    },
    {
      id: 'chk-smbv1',
      label: 'Protocollo obsoleto SMBv1 disabilitato e porta 139 NetBIOS bloccata',
      passed: !state.smbV1Enabled && fw139?.scope === 'BLOCKED',
      hint: 'Disattiva SMBv1 e imposta la porta 139 su BLOCKED nel firewall.',
    },
    {
      id: 'chk-signing-guest',
      label: 'SMB Signing obbligatorio attivo e account Guest disabilitato',
      passed: state.smbSigningRequired && !state.guestAccountEnabled,
      hint: 'Abilita SMB Signing e disattiva l’account guest_user.',
    },
    {
      id: 'chk-fw-445',
      label: 'Porta 445/TCP ristretta alla sola subnet interna o protetta',
      passed: fw445?.scope === 'LAB_SUBNET_ONLY' || fw445?.scope === 'BLOCKED',
      hint: 'Limita la regola firewall della porta 445 a LAB_SUBNET_ONLY.',
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
