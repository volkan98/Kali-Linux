import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Circle,
  KeyRound,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  ActiveDirectoryLabState,
  AdGroupName,
  createInitialActiveDirectoryState,
  PRIVILEGED_AD_GROUPS,
  simulateAdPrivilegePath,
  toggleUserEnabled,
  toggleUserGroup,
  verifyActiveDirectoryHardening,
} from '../sim/activeDirectoryEngine';

interface ActiveDirectoryLabProps {
  state: ActiveDirectoryLabState;
  onUpdateState: (next: ActiveDirectoryLabState) => void;
  onLabCompleted?: () => void;
}

const MANAGEABLE_GROUPS: AdGroupName[] = [
  'Domain Admins',
  'Backup Operators',
  'Backup_LeastPriv',
  'Protected Users',
];

export const ActiveDirectoryLab: React.FC<ActiveDirectoryLabProps> = ({
  state,
  onUpdateState,
  onLabCompleted,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('svc_backup');
  const report = verifyActiveDirectoryHardening(state);
  const attackSim = simulateAdPrivilegePath(state, selectedUser);

  useEffect(() => {
    if (report.passed && onLabCompleted) {
      onLabCompleted();
    }
  }, [report.passed, onLabCompleted]);

  const toggleWorkstationRestriction = (sam: string) => {
    onUpdateState({
      ...state,
      users: state.users.map((u) =>
        u.samAccountName === sam
          ? { ...u, workstationLogonRestricted: !u.workstationLogonRestricted }
          : u
      ),
    });
  };

  const updatePolicy = <K extends keyof ActiveDirectoryLabState['passwordPolicy']>(
    field: K,
    value: ActiveDirectoryLabState['passwordPolicy'][K]
  ) => {
    onUpdateState({
      ...state,
      passwordPolicy: {
        ...state.passwordPolicy,
        [field]: value,
      },
    });
  };

  const toggleGpoFlag = (
    flag: 'disableLlmnrNbns' | 'powershellScriptBlockLogging' | 'tier0LogonRestriction'
  ) => {
    onUpdateState({
      ...state,
      gpos: state.gpos.map((g, i) => (i === 0 ? { ...g, [flag]: !g[flag] } : g)),
    });
  };

  const gpo = state.gpos[0];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-mono text-sky-400">
              DOMINIO SIMULATO: {state.domainName} · {state.dcHost} ({state.dcIp}) · {state.functionalLevel}
            </div>
            <h2 className="text-base font-semibold text-slate-100 mt-0.5">
              Active Directory Security Lab — Minimo Privilegio, GPO & Kerberoasting
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulazione didattica del Domain Controller aziendale: elimina i privilegi eccessivi, disattiva account dormienti e rinforza Password Policy e GPO fino a 100/100.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Sicurezza AD</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums ${
                report.passed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {report.score}/{report.maxScore}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateState(createInitialActiveDirectoryState())}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina AD Lab
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 space-y-4">
          {/* Users & Groups Management */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Active Directory Users & Computers (OU & Gruppi)
              </h3>
              <span className="text-[11px] text-slate-400">
                Clicca un account per simularne l’impatto in caso di compromissione
              </span>
            </div>

            <div className="space-y-2.5">
              {state.users.map((u) => {
                const isSelected = u.samAccountName === selectedUser;
                const hasPriv = u.groups.some((g) => PRIVILEGED_AD_GROUPS.includes(g));
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u.samAccountName)}
                    className={`rounded-lg border p-3.5 cursor-pointer transition-colors space-y-2.5 ${
                      isSelected
                        ? 'border-sky-500/60 bg-[#0B1220]'
                        : 'border-slate-800 bg-[#090E17] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-100">
                            {u.samAccountName}
                          </span>
                          <span className="text-xs text-slate-400">({u.displayName})</span>
                          {u.isServiceAccount && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                              SERVICE ACCOUNT
                            </span>
                          )}
                          {hasPriv && u.samAccountName !== 'it_admin' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300">
                              PRIVILEGIO ECCESSIVO
                            </span>
                          )}
                          {!u.enabled && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              DISABILITATO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {u.role} · <span className="font-mono text-slate-500">{u.ou}</span>
                        </div>
                        {u.spn && (
                          <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                            SPN: {u.spn} (Password età: {u.passwordAgeDays} gg)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {u.isServiceAccount && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWorkstationRestriction(u.samAccountName);
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                              u.workstationLogonRestricted
                                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                            }`}
                          >
                            {u.workstationLogonRestricted
                              ? 'Logon limitato a Server: ON'
                              : 'Limita Logon ai soli Server'}
                          </button>
                        )}
                        {u.samAccountName !== 'it_admin' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateState(toggleUserEnabled(state, u.samAccountName));
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded border font-medium transition-colors ${
                              u.enabled
                                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40'
                                : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40'
                            }`}
                          >
                            {u.enabled ? 'Disabilita Account' : 'Riabilita Account'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Group toggles */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 mr-1">Gruppi:</span>
                      {MANAGEABLE_GROUPS.map((grp) => {
                        const member = u.groups.includes(grp);
                        const locked = u.samAccountName === 'it_admin' && grp === 'Domain Admins';
                        return (
                          <button
                            key={grp}
                            type="button"
                            disabled={locked}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateState(toggleUserGroup(state, u.samAccountName, grp));
                            }}
                            className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                              member
                                ? PRIVILEGED_AD_GROUPS.includes(grp) && u.samAccountName !== 'it_admin'
                                  ? 'border-rose-500/50 bg-rose-950/40 text-rose-200'
                                  : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                                : 'border-slate-800 bg-[#070B12] text-slate-500 hover:text-slate-300'
                            } disabled:opacity-60`}
                          >
                            {member ? '✓ ' : '+ '}
                            {grp}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password Policy & GPO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Default Domain Password Policy
              </h3>
              <div className="space-y-2.5 text-xs">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-slate-300">Lunghezza minima password (min 14):</span>
                  <input
                    type="number"
                    min={6}
                    max={32}
                    value={state.passwordPolicy.minLength}
                    onChange={(e) => updatePolicy('minLength', Number(e.target.value) || 8)}
                    className="w-20 rounded border border-slate-700 bg-[#090D14] px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <span className="text-slate-300">Soglia Lockout (tentativi, 3-5):</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={state.passwordPolicy.lockoutThreshold}
                    onChange={(e) => updatePolicy('lockoutThreshold', Number(e.target.value) || 0)}
                    className="w-20 rounded border border-slate-700 bg-[#090D14] px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <span className="text-slate-300">Età massima password (max 90 gg):</span>
                  <input
                    type="number"
                    min={30}
                    max={365}
                    value={state.passwordPolicy.maxAgeDays}
                    onChange={(e) => updatePolicy('maxAgeDays', Number(e.target.value) || 365)}
                    className="w-20 rounded border border-slate-700 bg-[#090D14] px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Group Policy Objects (GPO Difensive)
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleGpoFlag('disableLlmnrNbns')}
                  className={`w-full text-left rounded border px-3 py-2 flex items-center justify-between ${
                    gpo?.disableLlmnrNbns
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                      : 'border-slate-800 bg-[#090D14] text-slate-300'
                  }`}
                >
                  <span>Disattiva LLMNR e NBT-NS (anti-Responder)</span>
                  <span className="font-mono">{gpo?.disableLlmnrNbns ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleGpoFlag('powershellScriptBlockLogging')}
                  className={`w-full text-left rounded border px-3 py-2 flex items-center justify-between ${
                    gpo?.powershellScriptBlockLogging
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                      : 'border-slate-800 bg-[#090D14] text-slate-300'
                  }`}
                >
                  <span>PowerShell Script Block Logging (Event 4104)</span>
                  <span className="font-mono">{gpo?.powershellScriptBlockLogging ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleGpoFlag('tier0LogonRestriction')}
                  className={`w-full text-left rounded border px-3 py-2 flex items-center justify-between ${
                    gpo?.tier0LogonRestriction
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                      : 'border-slate-800 bg-[#090D14] text-slate-300'
                  }`}
                >
                  <span>Blocca Logon Admin Tier-0 su Workstation</span>
                  <span className="font-mono">{gpo?.tier0LogonRestriction ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AD Security Event Logs */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-100">
              Security Event Log Domain Controller (Event ID 4624 / 4728 / 4738 / 4769)
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {state.logs.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded border px-3 py-2 text-xs font-mono ${
                    ev.severity === 'ALERT'
                      ? 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                      : ev.severity === 'WARNING'
                      ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                      : 'border-slate-800 bg-[#090D14] text-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span>
                      [{ev.timestamp}] Event {ev.eventId} ({ev.severity})
                    </span>
                    <span className="text-slate-400">
                      {ev.actor} → {ev.target}
                    </span>
                  </div>
                  <div className="font-sans text-xs mt-1">{ev.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attack Path Sim + 5 Checks */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
            <div className="flex items-center gap-2">
              {attackSim.compromiseImpact.startsWith('CRITICO') ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : attackSim.compromiseImpact.startsWith('ALTO') ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <h3 className="text-sm font-semibold text-slate-100">
                Simulazione Percorso d’Attacco ({attackSim.targetUser})
              </h3>
            </div>

            <div
              className={`rounded border px-3 py-2 text-xs font-semibold ${
                attackSim.compromiseImpact.startsWith('CRITICO')
                  ? 'border-rose-500/40 bg-rose-950/25 text-rose-200'
                  : attackSim.compromiseImpact.startsWith('ALTO')
                  ? 'border-amber-500/40 bg-amber-950/25 text-amber-200'
                  : 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200'
              }`}
            >
              Impatto: {attackSim.compromiseImpact}
            </div>

            <ol className="space-y-1.5 text-xs text-slate-300">
              {attackSim.steps.map((s, idx) => (
                <li key={idx} className="rounded border border-slate-800 bg-[#090D14] p-2 leading-relaxed">
                  {s}
                </li>
              ))}
            </ol>

            <p className="text-[11px] text-slate-400 leading-relaxed">{attackSim.riskSummary}</p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Verifica Hardening AD</h3>
              <span className="font-mono text-xs text-emerald-400">{report.score}/100</span>
            </div>

            <div className="space-y-2">
              {report.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`rounded border p-2.5 text-xs ${
                    chk.passed
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-[#090D14]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={chk.passed ? 'text-emerald-200 font-medium' : 'text-slate-200'}>
                        {chk.label}
                      </div>
                      {!chk.passed && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{chk.hint}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
