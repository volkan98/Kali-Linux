export type WifiSecurityMode = 'OPEN' | 'WEP' | 'WPA2-PSK' | 'WPA3-SAE' | 'WPA2-Enterprise';

export interface WifiClientDevice {
  id: string;
  hostname: string;
  mac: string;
  ip: string;
  os: string;
  networkType: 'Principale' | 'Guest';
  canReachInternalLan: boolean;
  canReachPeers: boolean;
}

export interface WifiLabState {
  ssid: string;
  bssid: string;
  channel: number;
  band: '2.4 GHz' | '5 GHz';
  securityMode: WifiSecurityMode;
  passphrase: string;
  wpsEnabled: boolean;
  pmfEnabled: boolean;
  clientIsolation: boolean;
  guestNetworkEnabled: boolean;
  guestIsolatedFromLan: boolean;
  firmwareUpdated: boolean;
  adminDefaultPasswordChanged: boolean;
  upnpDisabled: boolean;
  clients: WifiClientDevice[];
}

export interface WifiSecurityAnalysis {
  score: number;
  grade: 'CRITICO' | 'DEBOLE' | 'DISCRETO' | 'ROBUSTO';
  findings: Array<{
    id: string;
    severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'OK';
    titolo: string;
    dettaglio: string;
    contromisura: string;
  }>;
  auditResult: {
    dictionaryVulnerable: boolean;
    estimatedResistance: string;
    attackVectorSummary: string;
  };
}

export interface WifiLabCheckResult {
  passed: boolean;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
  }>;
}

export const SYNTHETIC_TEST_DICTIONARY = [
  '12345678',
  'password',
  'password123',
  'admin1234',
  'qwerty123',
  'welcome1',
  'wifi2026',
  'casa1234',
  'ufficio01',
  'letmein99',
  'estate2026',
  'azienda123',
];

export function createInitialWifiLabState(preset: 'open' | 'weak' | 'hardened' = 'weak'): WifiLabState {
  const baseClients: WifiClientDevice[] = [
    {
      id: 'cli-1',
      hostname: 'WKS-WIN11-LAB',
      mac: '08:00:27:4A:19:B2',
      ip: '192.168.50.14',
      os: 'Windows 11 Lab',
      networkType: 'Principale',
      canReachInternalLan: true,
      canReachPeers: true,
    },
    {
      id: 'cli-2',
      hostname: 'UBUNTU-DEV-LAB',
      mac: '08:00:27:8C:33:10',
      ip: '192.168.50.22',
      os: 'Ubuntu 24.04 LTS',
      networkType: 'Principale',
      canReachInternalLan: true,
      canReachPeers: true,
    },
    {
      id: 'cli-3',
      hostname: 'OSPITE-MOBILE-SIM',
      mac: '02:1A:11:9F:04:77',
      ip: '192.168.50.48',
      os: 'Dispositivo Guest Simulato',
      networkType: 'Guest',
      canReachInternalLan: true,
      canReachPeers: true,
    },
  ];

  if (preset === 'open') {
    return {
      ssid: 'LabCafe-Public-Open',
      bssid: 'A4:2B:8C:10:44:01',
      channel: 6,
      band: '2.4 GHz',
      securityMode: 'OPEN',
      passphrase: '',
      wpsEnabled: false,
      pmfEnabled: false,
      clientIsolation: false,
      guestNetworkEnabled: true,
      guestIsolatedFromLan: false,
      firmwareUpdated: false,
      adminDefaultPasswordChanged: false,
      upnpDisabled: false,
      clients: baseClients,
    };
  }

  if (preset === 'hardened') {
    return {
      ssid: 'LabCorp-Secure-5G',
      bssid: 'A4:2B:8C:10:44:99',
      channel: 36,
      band: '5 GHz',
      securityMode: 'WPA3-SAE',
      passphrase: 'N7!mK9#vQ2$xP4@zL8&tW3',
      wpsEnabled: false,
      pmfEnabled: true,
      clientIsolation: true,
      guestNetworkEnabled: true,
      guestIsolatedFromLan: true,
      firmwareUpdated: true,
      adminDefaultPasswordChanged: true,
      upnpDisabled: true,
      clients: baseClients.map((c) => ({
        ...c,
        canReachInternalLan: c.networkType === 'Principale',
        canReachPeers: false,
      })),
    };
  }

  return {
    ssid: 'LabCorp-Office-WiFi',
    bssid: 'A4:2B:8C:10:44:12',
    channel: 11,
    band: '2.4 GHz',
    securityMode: 'WPA2-PSK',
    passphrase: 'password123',
    wpsEnabled: true,
    pmfEnabled: false,
    clientIsolation: false,
    guestNetworkEnabled: true,
    guestIsolatedFromLan: false,
    firmwareUpdated: false,
    adminDefaultPasswordChanged: false,
    upnpDisabled: false,
    clients: baseClients,
  };
}

export function recomputeClientReachability(state: WifiLabState): WifiLabState {
  return {
    ...state,
    clients: state.clients.map((c) => ({
      ...c,
      canReachPeers: !state.clientIsolation,
      canReachInternalLan: c.networkType === 'Principale' ? true : !state.guestIsolatedFromLan,
    })),
  };
}

export function analyzeWifiSecurity(state: WifiLabState): WifiSecurityAnalysis {
  let score = 100;
  const findings: WifiSecurityAnalysis['findings'] = [];

  if (state.securityMode === 'OPEN') {
    score -= 55;
    findings.push({
      id: 'wifi-open',
      severity: 'CRITICA',
      titolo: 'Rete Wi-Fi aperta priva di cifratura',
      dettaglio: 'I frame 802.11 viaggiano in chiaro nell’etere: qualsiasi traffico non protetto da HTTPS/TLS può essere osservato.',
      contromisura: 'Abilita almeno WPA2-AES o preferibilmente WPA3-SAE con passphrase robusta.',
    });
  } else if (state.securityMode === 'WEP') {
    score -= 50;
    findings.push({
      id: 'wifi-wep',
      severity: 'CRITICA',
      titolo: 'Protocollo WEP gravemente obsoleto',
      dettaglio: 'WEP usa RC4 con vettori di inizializzazione deboli e può essere violato statisticamente in pochi minuti.',
      contromisura: 'Migra immediatamente a WPA2-PSK (AES/CCMP) o WPA3-SAE.',
    });
  } else if (state.securityMode === 'WPA2-PSK') {
    score -= 8;
    findings.push({
      id: 'wifi-wpa2',
      severity: 'MEDIA',
      titolo: 'WPA2-PSK attivo (soggetto ad audit offline su handshake)',
      dettaglio: 'Il 4-Way Handshake WPA2 permette la verifica offline della passphrase se quest’ultima è debole.',
      contromisura: 'Usa una passphrase di almeno 16 caratteri casuali oppure passa a WPA3-SAE (resistente al cracking offline).',
    });
  } else {
    findings.push({
      id: 'wifi-wpa3',
      severity: 'OK',
      titolo: `${state.securityMode} attivo`,
      dettaglio: 'L’autenticazione SAE (Dragonfly) o 802.1X impedisce attacchi a dizionario offline sul traffico catturato.',
      contromisura: 'Mantieni attiva la protezione e verifica la compatibilità dei client aziendali.',
    });
  }

  const normalizedPass = state.passphrase.trim().toLowerCase();
  const inDict = SYNTHETIC_TEST_DICTIONARY.includes(normalizedPass);
  const needsPass = state.securityMode === 'WPA2-PSK' || state.securityMode === 'WPA3-SAE' || state.securityMode === 'WEP';

  let dictionaryVulnerable = false;
  let estimatedResistance = 'N/A (nessuna chiave configurata)';
  let attackVectorSummary = 'Nessuna autenticazione wireless attiva.';

  if (needsPass) {
    if (state.passphrase.length < 10 || inDict) {
      score -= 30;
      dictionaryVulnerable = true;
      estimatedResistance = 'Bassa (individuabile in pochi secondi nel dizionario di prova)';
      attackVectorSummary =
        state.securityMode === 'WPA3-SAE'
          ? 'Anche con WPA3-SAE (che blocca l’audit offline), una password da dizionario può subire tentativi online rate-limited.'
          : 'Un audit offline sul 4-Way Handshake individuerebbe questa passphrase immediatamente tramite wordlist.';
      findings.push({
        id: 'wifi-pass-weak',
        severity: 'CRITICA',
        titolo: 'Passphrase di laboratorio debole o presente nel dizionario',
        dettaglio: `La chiave "${state.passphrase || '(vuota)'}" è troppo corta o comune.`,
        contromisura: 'Imposta una passphrase di almeno 14–20 caratteri con lettere, numeri e simboli non prevedibili.',
      });
    } else if (state.passphrase.length < 14) {
      score -= 10;
      estimatedResistance = 'Media (ore/giorni con dizionari estesi in WPA2)';
      attackVectorSummary = 'Resistente ai dizionari base ma migliorabile aumentando la lunghezza sopra i 16 caratteri.';
      findings.push({
        id: 'wifi-pass-med',
        severity: 'MEDIA',
        titolo: 'Lunghezza passphrase migliorabile',
        dettaglio: 'Lunghezza compresa tra 10 e 13 caratteri.',
        contromisura: 'Estendi la passphrase ad almeno 16 caratteri o usa una frase segreta di 4+ parole casuali.',
      });
    } else {
      estimatedResistance =
        state.securityMode === 'WPA3-SAE'
          ? 'Molto Alta (SAE anti-offline + alta entropia)'
          : 'Alta (resistente ad audit a dizionario offline)';
      attackVectorSummary = 'Nessuna corrispondenza nel dizionario sintetico; entropia adeguata per uso di laboratorio/aziendale.';
      findings.push({
        id: 'wifi-pass-ok',
        severity: 'OK',
        titolo: 'Passphrase robusta',
        dettaglio: `Lunghezza ${state.passphrase.length} caratteri ad alta entropia.`,
        contromisura: 'Ruota periodicamente le credenziali solo in caso di cambio personale o compromissione.',
      });
    }
  }

  if (state.wpsEnabled) {
    score -= 18;
    findings.push({
      id: 'wifi-wps',
      severity: 'ALTA',
      titolo: 'WPS (Wi-Fi Protected Setup) abilitato',
      dettaglio: 'Il PIN WPS a 8 cifre è diviso in due metà verificabili separatamente (circa 11.000 combinazioni effettive) ed è vulnerabile a Pixie Dust.',
      contromisura: 'Disabilita completamente WPS dalle impostazioni dell’Access Point.',
    });
  }

  if (!state.pmfEnabled && state.securityMode !== 'OPEN' && state.securityMode !== 'WEP') {
    score -= 10;
    findings.push({
      id: 'wifi-pmf',
      severity: 'MEDIA',
      titolo: 'PMF (Protected Management Frames / 802.11w) disattivo',
      dettaglio: 'Senza PMF, i frame di gestione (es. deauthentication) non sono firmati e possono essere falsificati per disconnettere client.',
      contromisura: 'Attiva PMF (Required su WPA3, Capable/Required su WPA2).',
    });
  }

  if (!state.clientIsolation) {
    score -= 10;
    findings.push({
      id: 'wifi-isolation',
      severity: 'MEDIA',
      titolo: 'Isolamento client disattivato',
      dettaglio: 'I dispositivi connessi allo stesso SSID possono comunicare direttamente tra loro (rischio ARP spoofing / scansione laterale).',
      contromisura: 'Abilita AP/Client Isolation almeno sulle reti Guest e pubbliche.',
    });
  }

  if (state.guestNetworkEnabled && !state.guestIsolatedFromLan) {
    score -= 15;
    findings.push({
      id: 'wifi-guest-lan',
      severity: 'ALTA',
      titolo: 'Rete Guest non segmentata dalla LAN aziendale',
      dettaglio: 'Un dispositivo ospite può raggiungere i server interni e le workstation sulla rete principale.',
      contromisura: 'Separa la rete Guest tramite VLAN dedicata e regole firewall di blocco verso la LAN interna.',
    });
  }

  if (!state.firmwareUpdated || !state.adminDefaultPasswordChanged || !state.upnpDisabled) {
    score -= 10;
    findings.push({
      id: 'wifi-router-hygiene',
      severity: 'MEDIA',
      titolo: 'Hardening del router incompleto',
      dettaglio: 'Firmware non aggiornato, password pannello admin di default o UPnP attivo aumentano la superficie di attacco.',
      contromisura: 'Aggiorna il firmware, cambia la password di amministrazione e disabilita UPnP.',
    });
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  const grade: WifiSecurityAnalysis['grade'] =
    clampedScore >= 85 ? 'ROBUSTO' : clampedScore >= 65 ? 'DISCRETO' : clampedScore >= 40 ? 'DEBOLE' : 'CRITICO';

  return {
    score: clampedScore,
    grade,
    findings,
    auditResult: {
      dictionaryVulnerable,
      estimatedResistance,
      attackVectorSummary,
    },
  };
}

export function verifyWifiLabHardening(state: WifiLabState): WifiLabCheckResult {
  const analysis = analyzeWifiSecurity(state);
  const checks = [
    {
      id: 'wifi-chk-proto',
      label: 'Cifratura WPA2-PSK (passphrase robusta) o WPA3-SAE attiva',
      passed: state.securityMode === 'WPA3-SAE' || state.securityMode === 'WPA2-Enterprise' || (state.securityMode === 'WPA2-PSK' && !analysis.auditResult.dictionaryVulnerable && state.passphrase.length >= 14),
    },
    {
      id: 'wifi-chk-wps',
      label: 'WPS disabilitato e PMF (802.11w) attivato',
      passed: !state.wpsEnabled && state.pmfEnabled,
    },
    {
      id: 'wifi-chk-isolation',
      label: 'Isolamento Client e separazione Rete Guest dalla LAN attivi',
      passed: state.clientIsolation && state.guestIsolatedFromLan,
    },
    {
      id: 'wifi-chk-router',
      label: 'Firmware aggiornato, admin password cambiata e UPnP disabilitato',
      passed: state.firmwareUpdated && state.adminDefaultPasswordChanged && state.upnpDisabled,
    },
  ];
  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
}
