import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Wifi,
} from 'lucide-react';
import {
  SYNTHETIC_TEST_DICTIONARY,
  WifiLabState,
  WifiSecurityMode,
  analyzeWifiSecurity,
  createInitialWifiLabState,
  recomputeClientReachability,
  verifyWifiLabHardening,
} from '../sim/wifiLabEngine';
import {
  PacketProtocol,
  filterPackets,
  generateSyntheticWifiPackets,
} from '../sim/packetInspectorEngine';

interface WifiSecurityLabProps {
  state: WifiLabState;
  onUpdateState: (next: WifiLabState) => void;
  onLabCompleted?: () => void;
}

const STEPS_80211 = [
  {
    title: '1. Beacon & Probe',
    desc: 'L’Access Point trasmette il nome rete (SSID) e il proprio BSSID sul canale radio. Il client cerca le reti vicine.',
  },
  {
    title: '2. Autenticazione 802.11',
    desc: 'Il client inizia l’autenticazione: in rete aperta è immediata; in WPA2/WPA3 si prepara lo scambio chiavi.',
  },
  {
    title: '3. Associazione',
    desc: 'L’AP assegna un Association ID al dispositivo e negozia velocità e supporto PMF (802.11w).',
  },
  {
    title: '4. Handshake / SAE & Policy',
    desc: 'WPA2 esegue il 4-Way Handshake (verificabile offline se password debole); WPA3 usa SAE Dragonfly anti-offline. Poi si applicano Client Isolation e VLAN.',
  },
];

export const WifiSecurityLab: React.FC<WifiSecurityLabProps> = ({
  state,
  onUpdateState,
  onLabCompleted,
}) => {
  const [animStep, setAnimStep] = useState<number>(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(false);
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [packetProto, setPacketProto] = useState<PacketProtocol | 'TUTTI'>('TUTTI');
  const [packetQuery, setPacketQuery] = useState<string>('');
  const [selectedPacketId, setSelectedPacketId] = useState<string>('pkt-3');

  const analysis = analyzeWifiSecurity(state);
  const verification = verifyWifiLabHardening(state);
  const allPackets = generateSyntheticWifiPackets(state);
  const visiblePackets = filterPackets(allPackets, packetProto, packetQuery);
  const activePacket =
    visiblePackets.find((p) => p.id === selectedPacketId) ?? visiblePackets[0] ?? null;

  useEffect(() => {
    if (verification.passed && onLabCompleted) {
      onLabCompleted();
    }
  }, [verification.passed, onLabCompleted]);

  useEffect(() => {
    if (!isPlayingAnim) return;
    const timer = window.setInterval(() => {
      setAnimStep((prev) => {
        if (prev >= STEPS_80211.length - 1) {
          setIsPlayingAnim(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [isPlayingAnim]);

  const updateField = (patch: Partial<WifiLabState>) => {
    if ('securityMode' in patch || 'passphrase' in patch) {
      setAuditLog([]);
    }
    const updated = recomputeClientReachability({ ...state, ...patch });
    onUpdateState(updated);
  };

  const runSyntheticDictionaryAudit = () => {
    setAuditRunning(true);
    setAuditLog([]);
    const candidate = state.passphrase.trim().toLowerCase();
    const logs: string[] = [
      `[AUDIT ISOLATO] Target simulato: SSID="${state.ssid}" (${state.securityMode})`,
      `[INFO] Caricato dizionario sintetico locale (${SYNTHETIC_TEST_DICTIONARY.length} voci di prova).`,
    ];

    if (state.securityMode === 'OPEN') {
      logs.push('[CRITICO] Rete aperta senza password: nessuna cifratura wireless attiva.');
    } else if (state.securityMode === 'WPA3-SAE' || state.securityMode === 'WPA2-Enterprise') {
      logs.push('[PROTEZIONE] Il protocollo selezionato impedisce il cracking offline passivo sul traffico catturato.');
      if (SYNTHETIC_TEST_DICTIONARY.includes(candidate)) {
        logs.push(`[AVVISO] Tuttavia la chiave di prova "${state.passphrase}" è banale e resta debole contro tentativi online.`);
      } else {
        logs.push('[OK] Chiave di prova non presente nel dizionario sintetico e protocollo resistente.');
      }
    } else {
      const idx = SYNTHETIC_TEST_DICTIONARY.indexOf(candidate);
      if (idx >= 0) {
        logs.push(`[TROVATA] Passphrase di prova "${state.passphrase}" individuata alla voce #${idx + 1} del dizionario sintetico!`);
        logs.push('[AZIONE] Passa a WPA3-SAE oppure imposta una passphrase casuale di almeno 16 caratteri.');
      } else if (state.passphrase.length < 12) {
        logs.push('[DEBOLE] Non nel dizionario base, ma lunghezza < 12 caratteri vulnerabile ad attacchi con regole.');
      } else {
        logs.push('[SUPERATO] Nessuna corrispondenza nel dizionario sintetico di laboratorio.');
      }
    }

    if (state.wpsEnabled) {
      logs.push('[ALTA PRIORITÀ] WPS attivo: può aggirare la complessità della passphrase tramite PIN.');
    }

    setAuditLog(logs);
    setAuditRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Wireless Security & Password Audit Lab (Ambiente Isolato)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configura un Access Point virtuale, osserva l’associazione 802.11 ed esegui audit offline esclusivamente su password di prova sintetiche.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onUpdateState(createInitialWifiLabState('open'));
              setAuditLog([]);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Scenario: Rete Aperta
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateState(createInitialWifiLabState('weak'));
              setAuditLog([]);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Scenario: WPA2 Debole + WPS
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateState(createInitialWifiLabState('hardened'));
              setAuditLog([]);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50 transition-colors whitespace-nowrap shrink-0"
          >
            Scenario: WPA3 Hardened
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateState(createInitialWifiLabState('weak'));
              setAuditLog([]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina
          </button>
        </div>
      </div>

      {/* Animated 802.11 Visualizer */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Animazione Didattica: Scansione, Associazione e Handshake 802.11
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnimStep(0);
              setIsPlayingAnim(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            Avvia Sequenza 802.11
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS_80211.map((step, idx) => {
            const active = animStep === idx;
            const passed = animStep > idx;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => {
                  setIsPlayingAnim(false);
                  setAnimStep(idx);
                }}
                className={`text-left rounded-md border p-3.5 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-950/30'
                    : passed
                    ? 'border-emerald-500/40 bg-emerald-950/15'
                    : 'border-slate-800 bg-[#0B111C]'
                }`}
              >
                <div className="text-xs font-semibold text-slate-100">{step.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configurator + Live Security Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Configurazione Router & Access Point Virtuale
            </h3>
            <span className="text-xs font-mono text-slate-400">BSSID {state.bssid} · Ch {state.channel}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wifi-ssid" className="block text-xs text-slate-400 mb-1">
                Nome Rete (SSID)
              </label>
              <input
                id="wifi-ssid"
                type="text"
                value={state.ssid}
                onChange={(e) => updateField({ ssid: e.target.value })}
                className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="wifi-proto" className="block text-xs text-slate-400 mb-1">
                Protocollo di Sicurezza
              </label>
              <select
                id="wifi-proto"
                value={state.securityMode}
                onChange={(e) => updateField({ securityMode: e.target.value as WifiSecurityMode })}
                className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-slate-100"
              >
                <option value="OPEN">OPEN (Nessuna cifratura)</option>
                <option value="WEP">WEP (Obsoleto)</option>
                <option value="WPA2-PSK">WPA2-PSK (AES)</option>
                <option value="WPA3-SAE">WPA3-SAE (Dragonfly)</option>
                <option value="WPA2-Enterprise">WPA2/WPA3-Enterprise (802.1X)</option>
              </select>
            </div>

            <div>
              <label htmlFor="wifi-pass" className="block text-xs text-slate-400 mb-1">
                Passphrase di Laboratorio (solo valori di prova)
              </label>
              <input
                id="wifi-pass"
                type="text"
                disabled={state.securityMode === 'OPEN' || state.securityMode === 'WPA2-Enterprise'}
                value={state.passphrase}
                onChange={(e) => updateField({ passphrase: e.target.value })}
                placeholder="Inserisci passphrase sintetica di test..."
                className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-slate-100 disabled:opacity-40"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={auditRunning}
                onClick={runSyntheticDictionaryAudit}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
              >
                <Wifi className="w-3.5 h-3.5" />
                Esegui Audit Dizionario Sintetico
              </button>
            </div>
          </div>

          {auditLog.length > 0 && (
            <div className="rounded border border-slate-800 bg-[#06090F] p-3 font-mono text-xs space-y-1">
              {auditLog.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes('[CRITICO]') || line.includes('[TROVATA]')
                      ? 'text-rose-400'
                      : line.includes('[AVVISO]') || line.includes('[ALTA') || line.includes('[DEBOLE]')
                      ? 'text-amber-300'
                      : 'text-emerald-400'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Security Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {[
              {
                label: 'WPS Disabilitato',
                active: !state.wpsEnabled,
                onClick: () => updateField({ wpsEnabled: !state.wpsEnabled }),
                activeText: 'Disabilitato (Sicuro)',
                inactiveText: 'Attivo (Vulnerabile)',
              },
              {
                label: 'PMF (802.11w)',
                active: state.pmfEnabled,
                onClick: () => updateField({ pmfEnabled: !state.pmfEnabled }),
                activeText: 'Attivo (Protetto)',
                inactiveText: 'Spento',
              },
              {
                label: 'Isolamento Client',
                active: state.clientIsolation,
                onClick: () => updateField({ clientIsolation: !state.clientIsolation }),
                activeText: 'Attivo (Peer bloccati)',
                inactiveText: 'Spento (Peer visibili)',
              },
              {
                label: 'Rete Guest Isolata',
                active: state.guestIsolatedFromLan,
                onClick: () => updateField({ guestIsolatedFromLan: !state.guestIsolatedFromLan }),
                activeText: 'Separata su VLAN',
                inactiveText: 'Esposta alla LAN!',
              },
              {
                label: 'Firmware Aggiornato',
                active: state.firmwareUpdated,
                onClick: () => updateField({ firmwareUpdated: !state.firmwareUpdated }),
                activeText: 'Aggiornato',
                inactiveText: 'Obsoleto',
              },
              {
                label: 'Admin Password & No UPnP',
                active: state.adminDefaultPasswordChanged && state.upnpDisabled,
                onClick: () =>
                  updateField({
                    adminDefaultPasswordChanged: !(state.adminDefaultPasswordChanged && state.upnpDisabled),
                    upnpDisabled: !(state.adminDefaultPasswordChanged && state.upnpDisabled),
                  }),
                activeText: 'Hardened',
                inactiveText: 'Default / UPnP ON',
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`p-3 rounded border text-left text-xs transition-colors ${
                  item.active
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/15 text-amber-200'
                }`}
              >
                <div className="font-semibold">{item.label}</div>
                <div className="font-mono text-[11px] mt-0.5">
                  {item.active ? item.activeText : item.inactiveText}
                </div>
              </button>
            ))}
          </div>

          {/* Connected Devices Reachability */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-200 mb-2">
              Dispositivi Simulati Connessi & Effetto Isolamento
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-3 font-medium">Host</th>
                    <th className="py-2 px-3 font-medium">IP / Rete</th>
                    <th className="py-2 px-3 font-medium">Comunicazione tra Peer</th>
                    <th className="py-2 pl-3 font-medium">Accesso LAN Interna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {state.clients.map((cli) => (
                    <tr key={cli.id}>
                      <td className="py-2 pr-3 font-mono text-slate-200">{cli.hostname}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {cli.ip} · {cli.networkType}
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className={cli.canReachPeers ? 'text-amber-300' : 'text-emerald-400'}>
                          {cli.canReachPeers ? 'CONSENTITA (Rischio Sniff/ARP)' : 'BLOCCATA (Isolato)'}
                        </span>
                      </td>
                      <td className="py-2 pl-3 font-mono">
                        <span
                          className={
                            cli.networkType === 'Guest' && cli.canReachInternalLan
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }
                        >
                          {cli.canReachInternalLan
                            ? cli.networkType === 'Guest'
                              ? 'ESPOSTA (Rischio critico!)'
                              : 'Consentita (Principale)'
                            : 'BLOCCATA (VLAN Isolata)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Score, Findings & Router Guide */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {verification.passed ? (
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-slate-100">Valutazione Sicurezza AP</h3>
              </div>
              <span
                className={`font-mono text-sm font-bold tabular-nums whitespace-nowrap shrink-0 ${
                  analysis.score >= 85
                    ? 'text-emerald-400'
                    : analysis.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {analysis.score}/100 ({analysis.grade})
              </span>
            </div>

            <div className="text-xs text-slate-300 rounded border border-slate-800 bg-[#090D14] p-3">
              <div className="font-semibold text-slate-100">Resistenza stimata credenziali:</div>
              <div className="mt-0.5 text-sky-300">{analysis.auditResult.estimatedResistance}</div>
              <div className="mt-1 text-slate-400">{analysis.auditResult.attackVectorSummary}</div>
            </div>

            <div className="space-y-2">
              {verification.checks.map((chk) => (
                <div key={chk.id} className="flex items-start gap-2 text-xs">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className={chk.passed ? 'text-emerald-200' : 'text-slate-300'}>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-100">
              Analisi Debolezze & Contromisure
            </h4>
            {analysis.findings.map((f) => (
              <div key={f.id} className="rounded border border-slate-800 bg-[#090D14] p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">{f.titolo}</span>
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      f.severity === 'OK'
                        ? 'text-emerald-400'
                        : f.severity === 'CRITICA'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {f.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{f.dettaglio}</p>
                <p className="text-[11px] text-sky-300">Soluzione: {f.contromisura}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-100">
              Guida Verifica Non Distruttiva del Router Personale
            </h4>
            <ul className="space-y-1 text-slate-400 list-disc pl-4 text-[11px]">
              <li>Accedi al pannello amministrativo locale (es. 192.168.1.1 via HTTPS se disponibile).</li>
              <li>Verifica che la cifratura sia WPA3-Personal o WPA2-AES (mai WEP o TKIP).</li>
              <li>Disattiva WPS e UPnP se non strettamente necessari.</li>
              <li>Attiva una rete Ospiti separata per visitatori e dispositivi IoT.</li>
              <li>Controlla la disponibilità di aggiornamenti firmware ufficiali.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Educational Packet Inspector */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Analizzatore Didattico dei Pacchetti (Simulazione Dinamica su Stato AP)
              </h3>
              <p className="text-[11px] text-slate-400">
                I pacchetti sintetici cambiano in tempo reale in base a cifratura ({state.securityMode}), Client Isolation e separazione VLAN Guest.
              </p>
            </div>
          </div>

          <input
            type="search"
            aria-label="Filtra pacchetti per IP o contenuto"
            value={packetQuery}
            onChange={(e) => setPacketQuery(e.target.value)}
            placeholder="Filtra IP, SSID o payload..."
            className="rounded border border-slate-700 bg-[#090D14] px-3 py-1.5 text-xs text-slate-100 w-56"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['TUTTI', '802.11', 'DHCP', 'ARP', 'DNS', 'TCP', 'HTTP', 'HTTPS'] as const).map((proto) => (
            <button
              key={proto}
              type="button"
              onClick={() => setPacketProto(proto)}
              className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                packetProto === proto
                  ? 'border-sky-500 bg-sky-600 text-white'
                  : 'border-slate-800 bg-[#090D14] text-slate-300 hover:text-white'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 overflow-x-auto rounded border border-slate-800 bg-[#070B12]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-[#0B111C]">
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">Proto</th>
                  <th className="py-2 px-2.5">Sorgente → Destinazione</th>
                  <th className="py-2 px-2.5">Rischio</th>
                  <th className="py-2 px-2.5">Riepilogo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {visiblePackets.map((pkt) => {
                  const selected = activePacket?.id === pkt.id;
                  return (
                    <tr
                      key={pkt.id}
                      onClick={() => setSelectedPacketId(pkt.id)}
                      className={`cursor-pointer transition-colors ${
                        selected ? 'bg-sky-950/35' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2 px-2.5 text-slate-400">{pkt.no}</td>
                      <td className="py-2 px-2.5 text-sky-300">{pkt.protocol}</td>
                      <td className="py-2 px-2.5 text-slate-300">
                        {pkt.src} → {pkt.dst}
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={
                            pkt.riskLevel === 'CRITICO'
                              ? 'text-rose-400'
                              : pkt.riskLevel === 'ATTENZIONE'
                              ? 'text-amber-300'
                              : 'text-emerald-400'
                          }
                        >
                          {pkt.riskLevel}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-sans text-slate-200">{pkt.summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-slate-800 bg-[#090D14] p-4 space-y-2.5 text-xs">
            {activePacket ? (
              <>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-sky-400">
                    FRAME #{activePacket.no} · {activePacket.protocol}
                  </span>
                  <span className="text-slate-400">
                    {activePacket.encrypted ? 'Cifrato' : 'In Chiaro'}
                  </span>
                </div>
                <div className="font-semibold text-slate-100">{activePacket.summary}</div>
                <div className="rounded border border-slate-800 bg-[#06090F] p-2.5 font-mono text-[11px] text-amber-200 break-words">
                  {activePacket.payloadPreview}
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {activePacket.didacticExplanation}
                </div>
              </>
            ) : (
              <div className="text-slate-400">Nessun pacchetto corrisponde al filtro applicato.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
