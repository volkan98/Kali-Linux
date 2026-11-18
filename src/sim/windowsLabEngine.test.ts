import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialWindowsLabState,
  evaluateSmbAccess,
  performSmbAccessTest,
  updateSharePermission,
  verifyWindowsLabHardening,
} from './windowsLabEngine';

test('windows lab initially flags insecure SMB shares and passes after full hardening', () => {
  let state = createInitialWindowsLabState();

  // Initially guest_user can read Backup_IT
  const initialGuest = evaluateSmbAccess(state, 'guest_user', 'Backup_IT', '10.10.20.10');
  assert.equal(initialGuest.granted, true);
  assert.equal(verifyWindowsLabHardening(state).passed, false);

  // Harden Backup_IT and HR_Riservati
  state = updateSharePermission(state, 'Backup_IT', 'share', 'Everyone', 'NONE');
  state = updateSharePermission(state, 'Backup_IT', 'ntfs', 'Everyone', 'NONE');
  state = updateSharePermission(state, 'HR_Riservati', 'share', 'Domain Users', 'NONE');
  state = updateSharePermission(state, 'HR_Riservati', 'ntfs', 'Domain Users', 'NONE');

  // Harden protocol, guest account, and firewall
  state = {
    ...state,
    smbV1Enabled: false,
    smbSigningRequired: true,
    guestAccountEnabled: false,
    firewallRules: state.firewallRules.map((r) => {
      if (r.port === 139) return { ...r, scope: 'BLOCKED' };
      if (r.port === 445) return { ...r, scope: 'LAB_SUBNET_ONLY' };
      return r;
    }),
  };

  const check = verifyWindowsLabHardening(state);
  assert.equal(check.passed, true);
  assert.equal(check.score, 100);

  // Access test logs event and denies external IP on port 445
  const extAttempt = performSmbAccessTest(state, 'it_admin', 'Backup_IT', '203.0.113.50', 445);
  assert.equal(extAttempt.trace.firewallAllowed, false);
  assert.equal(extAttempt.nextState.logs[0].outcome, 'BLOCCATO_FIREWALL');
});
