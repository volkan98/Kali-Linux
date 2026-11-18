import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FolderLock,
  Monitor,
  Play,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  AccessEvaluationTrace,
  AclLevel,
  WindowsGroup,
  WindowsLabState,
  createInitialWindowsLabState,
  performSmbAccessTest,
  updateSharePermission,
  verifyWindowsLabHardening,
} from '../sim/windowsLabEngine';

interface WindowsNetworkLabProps {
  state: WindowsLabState;
  onUpdateState: (next: WindowsLabState) => void;
  onLabCompleted?: () => void;
}

const GROUPS: WindowsGroup[] = ['Everyone', 'Domain Users', 'Finanza_Staff', 'HR_Team', 'IT_Admins'];
const ACL_LEVELS: AclLevel[] = ['NONE', 'READ', 'CHANGE', 'FULL'];

export const WindowsNetworkLab: React.FC<WindowsNetworkLabProps> = ({
  state,
  onUpdateState,
  onLabCompleted,
}) => {
  const [selectedShareName, setSelectedShareName] = useState<string>('Backup_IT');
  const [testUser, setTestUser] = useState<string>('guest_user');
  const [testShare, setTestShare] = useState<string>('Backup_IT');
  const [testSourceIp, setTestSourceIp] = useState<string>('10.10.20.10');
  const [testPort, setTestPort] = useState<445 | 139>(445);
  const [lastTrace, setLastTrace] = useState<AccessEvaluationTrace | null>(null);

  const verification = verifyWindowsLabHardening(state);
  const selectedShare = state.shares.find((s) => s.name === selectedShareName) ?? state.shares[0];

  useEffect(() => {
    if (verification.passed && onLabCompleted) {
      onLabCompleted();
    }
  }, [verification.passed, onLabCompleted]);

  const handleRunTest = () => {
    const { nextState, trace } = performSmbAccessTest(state, testUser, testShare, testSourceIp, testPort);
    setLastTrace(trace);
    onUpdateState(nextState);
  };

  const handleAclChange = (layer: 'share' | 'ntfs', group: WindowsGroup, level: AclLevel) => {
    const next = updateSharePermission(state, selectedShare.name, layer, group, level);
    onUpdateState(next);
  };

  const handleFwChange = (port: number, scope: 'ANY' | 'LAB_SUBNET_ONLY' | 'BLOCKED') => {
    onUpdateState({
      ...state,
      firewallRules: state.firewallRules.map((r) => (r.port === port ? { ...r, scope } : r)),
    });
  };

  const handleReset = () => {
    onUpdateState(createInitialWindowsLabState());
    setLastTrace(null);
  };

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Windows Network & SMB Security Lab ({state.domainName})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modifica i permessi Share e NTFS, le regole firewall e le policy SMB. Ogni test aggiorna i log Event Viewer e si riflette anche nei comandi{' '}
            <code className="font-mono text-sky-300">nmap</code> e{' '}
            <code className="font-mono text-sky-300">smbclient</code> del Terminale Linux.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Sicurezza Laboratorio</div>
            <div
              className={`text-base font-mono font-bold tabular-nums ${
                verification.passed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {verification.score}/100 {verification.passed ? '· PROTETTO' : '· VULNERABILE'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina Rete
          </button>
        </div>
      </div>

      {/* Topology Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { name: 'KALI-LAB', ip: state.kaliIp, role: 'Auditor Linux (smbclient / nmap)', icon: Monitor, color: 'text-sky-400' },
          { name: 'DC01-WIN2022', ip: state.dcIp, role: 'Domain Controller · AD / DNS / Kerberos', icon: Server, color: 'text-blue-400' },
          { name: 'FS01-SMB', ip: state.fileServerIp, role: 'Windows File Server · Porte 445 / 139', icon: FolderLock, color: 'text-amber-400' },
          { name: 'WKS-FIN01', ip: state.workstationIp, role: 'Workstation Windows 11 Aziendale', icon: UserCheck, color: 'text-emerald-400' },
        ].map((host) => {
          const Icon = host.icon;
          return (
            <div key={host.name} className="rounded-lg border border-slate-800 bg-[#0B111C] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100">{host.name}</span>
                <Icon className={`w-4 h-4 ${host.color}`} />
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1">{host.ip}</div>
              <div className="text-[11px] text-slate-400 mt-1">{host.role}</div>
            </div>
          );
        })}
      </div>

      {/* Live Access Tester + Visual Evaluation Pipeline */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Simulatore Visivo di Accesso SMB (Verifica Autorizzazioni in Tempo Reale)
            </h3>
            <p className="text-xs text-slate-400">
              Seleziona un account di prova, una cartella condivisa e l’IP sorgente per osservare cosa succede lungo il percorso Firewall → Share ACL → NTFS ACL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label htmlFor="win-test-user" className="block text-xs text-slate-400 mb-1">
              Utente di prova
            </label>
            <select
              id="win-test-user"
              value={testUser}
              onChange={(e) => setTestUser(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-2.5 py-2 text-xs text-slate-100"
            >
              {state.users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username} ({u.groups.slice(-1)[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="win-test-share" className="block text-xs text-slate-400 mb-1">
              Cartella condivisa
            </label>
            <select
              id="win-test-share"
              value={testShare}
              onChange={(e) => setTestShare(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-2.5 py-2 text-xs text-slate-100"
            >
              {state.shares.map((s) => (
                <option key={s.name} value={s.name}>
                  \\FS01-SMB\{s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="win-test-ip" className="block text-xs text-slate-400 mb-1">
              IP Sorgente
            </label>
            <select
              id="win-test-ip"
              value={testSourceIp}
              onChange={(e) => setTestSourceIp(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-2.5 py-2 text-xs font-mono text-slate-100"
            >
              <option value="10.10.20.10">10.10.20.10 (Interno Lab)</option>
              <option value="10.10.20.25">10.10.20.25 (Workstation)</option>
              <option value="203.0.113.50">203.0.113.50 (IP Esterno)</option>
            </select>
          </div>

          <div>
            <label htmlFor="win-test-port" className="block text-xs text-slate-400 mb-1">
              Porta Protocollo
            </label>
            <select
              id="win-test-port"
              value={testPort}
              onChange={(e) => setTestPort(Number(e.target.value) as 445 | 139)}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-2.5 py-2 text-xs font-mono text-slate-100"
            >
              <option value={445}>445/TCP (SMB)</option>
              <option value={139}>139/TCP (NetBIOS)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            Simula Accesso
          </button>
        </div>

        {lastTrace && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="flex-1 rounded border border-slate-800 bg-[#090D14] p-3 text-xs">
                <div className="text-slate-400">1. Identità & Gruppi</div>
                <div className="font-mono font-semibold text-slate-100 mt-0.5">{lastTrace.user}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{lastTrace.userGroups.join(', ') || 'Nessuno'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
              <div
                className={`flex-1 rounded border p-3 text-xs ${
                  lastTrace.firewallAllowed
                    ? 'border-emerald-500/40 bg-emerald-950/15'
                    : 'border-rose-500/40 bg-rose-950/20'
                }`}
              >
                <div className="text-slate-400">2. Windows Firewall ({testPort})</div>
                <div className="font-semibold text-slate-100 mt-0.5">
                  {lastTrace.firewallAllowed ? 'PASSA' : 'BLOCCATO'}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">{lastTrace.sourceIp}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
              <div className="flex-1 rounded border border-slate-800 bg-[#090D14] p-3 text-xs">
                <div className="text-slate-400">3. Share ACL vs NTFS ACL</div>
                <div className="font-mono text-slate-100 mt-0.5">
                  Share: {lastTrace.shareEffective} · NTFS: {lastTrace.ntfsEffective}
                </div>
                <div className="text-[11px] text-sky-400 mt-0.5">Intersezione = {lastTrace.finalEffective}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
              <div
                className={`flex-1 rounded border p-3 text-xs ${
                  lastTrace.granted
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-emerald-500/50 bg-emerald-950/20'
                }`}
              >
                <div className="text-slate-400">4. Esito Finale</div>
                <div className="font-semibold text-slate-100 mt-0.5">
                  {lastTrace.granted ? `ACCESSO CONSENTITO (${lastTrace.finalEffective})` : 'ACCESSO NEGATO'}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">{lastTrace.shareName}</div>
              </div>
            </div>
            <p className="text-xs text-slate-300">{lastTrace.reason}</p>
          </div>
        )}
      </div>

      {/* Main Grid: ACL Editor + Hardening + Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Share & NTFS ACL Workbench */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Gestione Autorizzazioni Share e NTFS (FS01-SMB)
            </h3>
            <div className="flex flex-wrap gap-1">
              {state.shares.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSelectedShareName(s.name)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    selectedShare.name === s.name
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sky-400">{selectedShare.path}</span>
            <span aria-hidden="true">·</span>
            <span>Sensibilità: {selectedShare.sensitivity}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{selectedShare.description}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3 font-medium">Gruppo Windows</th>
                  <th className="py-2 px-3 font-medium">Share Permission (Rete)</th>
                  <th className="py-2 pl-3 font-medium">NTFS Permission (Disco)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {GROUPS.map((group) => {
                  const shareVal = selectedShare.sharePermissions[group] ?? 'NONE';
                  const ntfsVal = selectedShare.ntfsPermissions[group] ?? 'NONE';
                  return (
                    <tr key={group}>
                      <td className="py-2.5 pr-3 font-mono text-slate-200">{group}</td>
                      <td className="py-2.5 px-3">
                        <select
                          aria-label={`Permesso Share per ${group} su ${selectedShare.name}`}
                          value={shareVal}
                          onChange={(e) => handleAclChange('share', group, e.target.value as AclLevel)}
                          className="rounded border border-slate-700 bg-[#090D14] px-2 py-1 text-xs font-mono text-slate-100"
                        >
                          {ACL_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pl-3">
                        <select
                          aria-label={`Permesso NTFS per ${group} su ${selectedShare.name}`}
                          value={ntfsVal}
                          onChange={(e) => handleAclChange('ntfs', group, e.target.value as AclLevel)}
                          className="rounded border border-slate-700 bg-[#090D14] px-2 py-1 text-xs font-mono text-slate-100"
                        >
                          {ACL_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Firewall & SMB Policy */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200">
              Policy Protocollo SMB & Windows Firewall
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateState({ ...state, smbV1Enabled: !state.smbV1Enabled })}
                className={`p-3 rounded border text-left text-xs transition-colors ${
                  !state.smbV1Enabled
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                }`}
              >
                <div className="font-semibold">SMBv1 Legacy</div>
                <div className="font-mono mt-0.5">{state.smbV1Enabled ? 'ATTIVO (Insicuro)' : 'DISABILITATO'}</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateState({ ...state, smbSigningRequired: !state.smbSigningRequired })}
                className={`p-3 rounded border text-left text-xs transition-colors ${
                  state.smbSigningRequired
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                }`}
              >
                <div className="font-semibold">SMB Signing</div>
                <div className="font-mono mt-0.5">{state.smbSigningRequired ? 'OBBLIGATORIO' : 'OPZIONALE'}</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateState({ ...state, guestAccountEnabled: !state.guestAccountEnabled })}
                className={`p-3 rounded border text-left text-xs transition-colors ${
                  !state.guestAccountEnabled
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                }`}
              >
                <div className="font-semibold">Account Guest</div>
                <div className="font-mono mt-0.5">{state.guestAccountEnabled ? 'ABILITATO' : 'DISABILITATO'}</div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {state.firewallRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-[#090D14] px-3 py-2 text-xs">
                  <div>
                    <div className="font-mono font-semibold text-slate-200">
                      {rule.port}/{rule.protocol} · {rule.service}
                    </div>
                  </div>
                  <select
                    aria-label={`Regola firewall porta ${rule.port}`}
                    value={rule.scope}
                    onChange={(e) =>
                      handleFwChange(rule.port, e.target.value as 'ANY' | 'LAB_SUBNET_ONLY' | 'BLOCKED')
                    }
                    className="rounded border border-slate-700 bg-[#0F1623] px-2 py-1 text-[11px] font-mono text-slate-100"
                  >
                    <option value="ANY">ANY (Aperto)</option>
                    <option value="LAB_SUBNET_ONLY">SOLO LAB 10.10.20.0/24</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
          <div className="flex items-center gap-2">
            {verification.passed ? (
              <Shield className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="text-sm font-semibold text-slate-100">
              Obiettivi di Sicurezza Windows
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Correggi tutte le configurazioni insicure sul file server FS01-SMB fino a raggiungere 100/100.
          </p>

          <div className="space-y-2.5">
            {verification.checks.map((c) => (
              <div
                key={c.id}
                className={`rounded border p-2.5 text-xs ${
                  c.passed ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 bg-[#090D14]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {c.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={c.passed ? 'text-emerald-200 font-medium' : 'text-slate-200 font-medium'}>
                      {c.label}
                    </div>
                    {!c.passed && <div className="text-[11px] text-slate-400 mt-1">{c.hint}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Viewer Security Logs */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Windows Event Viewer — Log di Sicurezza (FS01-SMB)
          </h3>
          <span className="text-xs font-mono text-slate-400 tabular-nums">{state.logs.length} eventi recenti</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-3 font-medium">Ora</th>
                <th className="py-2 px-3 font-medium">Event ID</th>
                <th className="py-2 px-3 font-medium">Origine IP</th>
                <th className="py-2 px-3 font-medium">Utente</th>
                <th className="py-2 px-3 font-medium">Risorsa</th>
                <th className="py-2 px-3 font-medium">Esito</th>
                <th className="py-2 pl-3 font-medium">Dettaglio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.logs.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-900/50">
                  <td className="py-2 pr-3 font-mono text-slate-400 whitespace-nowrap">{ev.timestamp}</td>
                  <td className="py-2 px-3 font-mono text-sky-400 whitespace-nowrap">{ev.eventId}</td>
                  <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">{ev.sourceIp}</td>
                  <td className="py-2 px-3 font-mono text-slate-200 whitespace-nowrap">{ev.user}</td>
                  <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">{ev.target}</td>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">
                    <span
                      className={
                        ev.outcome === 'CONSENTITO'
                          ? 'text-amber-300'
                          : ev.outcome === 'BLOCCATO_FIREWALL'
                          ? 'text-sky-300'
                          : 'text-emerald-400'
                      }
                    >
                      {ev.outcome}
                    </span>
                  </td>
                  <td className="py-2 pl-3 text-slate-300">{ev.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
