import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialActiveDirectoryState,
  simulateAdPrivilegePath,
  toggleUserEnabled,
  toggleUserGroup,
  verifyActiveDirectoryHardening,
} from './activeDirectoryEngine.ts';

test('activeDirectoryEngine starts insecure and reaches 100/100 after full hardening', () => {
  let state = createInitialActiveDirectoryState();

  const initialReport = verifyActiveDirectoryHardening(state);
  assert.equal(initialReport.passed, false);
  assert.equal(initialReport.score, 0);

  const initialSim = simulateAdPrivilegePath(state, 'svc_backup');
  assert.ok(initialSim.compromiseImpact.startsWith('CRITICO'));

  // Remove svc_backup from Domain Admins, assign Backup_LeastPriv, restrict workstation logon
  state = toggleUserGroup(state, 'svc_backup', 'Domain Admins');
  state = toggleUserGroup(state, 'svc_backup', 'Backup_LeastPriv');
  state = {
    ...state,
    users: state.users.map((u) =>
      u.samAccountName === 'svc_backup' ? { ...u, workstationLogonRestricted: true } : u
    ),
  };

  // Remove svc_sql from Backup Operators
  state = toggleUserGroup(state, 'svc_sql', 'Backup Operators');

  // Disable dormant ex_stagista
  state = toggleUserEnabled(state, 'ex_stagista');

  // Harden password policy and GPO
  state = {
    ...state,
    passwordPolicy: {
      minLength: 14,
      complexityEnabled: true,
      lockoutThreshold: 4,
      maxAgeDays: 90,
      reversibleEncryptionDisabled: true,
    },
    gpos: state.gpos.map((g) => ({
      ...g,
      disableLlmnrNbns: true,
      powershellScriptBlockLogging: true,
      tier0LogonRestriction: true,
    })),
  };

  const finalReport = verifyActiveDirectoryHardening(state);
  assert.equal(finalReport.passed, true);
  assert.equal(finalReport.score, 100);

  const hardenedSim = simulateAdPrivilegePath(state, 'svc_backup');
  assert.ok(hardenedSim.compromiseImpact.startsWith('CONTENUTO'));
});
