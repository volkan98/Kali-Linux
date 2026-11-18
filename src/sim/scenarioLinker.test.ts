import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialActiveDirectoryState, toggleUserEnabled, toggleUserGroup } from './activeDirectoryEngine.ts';
import { INITIAL_SYNTHETIC_ARCHIVE } from './passwordAuditEngine.ts';
import { verifyScenarioInLiveLabs } from './scenarioLinker.ts';
import { createInitialTerminalState, executeTerminalCommand } from './terminalEngine.ts';
import { createInitialWifiLabState } from './wifiLabEngine.ts';
import { createInitialWindowsLabState } from './windowsLabEngine.ts';

test('scenarioLinker verifies live lab states for SSH, Wi-Fi, and AD scenarios', () => {
  const terminal = createInitialTerminalState();
  const windows = createInitialWindowsLabState();
  const ad = createInitialActiveDirectoryState();
  const wifi = createInitialWifiLabState('weak');

  const initialA = verifyScenarioInLiveLabs('scenario-a', {
    terminal,
    windows,
    ad,
    wifi,
    passwordArchive: INITIAL_SYNTHETIC_ARCHIVE,
  });
  assert.equal(initialA.verifiedInLab, false);

  const afterGrep = executeTerminalCommand(terminal, 'grep Failed /var/log/auth.log', windows).nextState;
  const afterUfw = executeTerminalCommand(afterGrep, 'sudo ufw enable', windows).nextState;

  const passedA = verifyScenarioInLiveLabs('scenario-a', {
    terminal: afterUfw,
    windows,
    ad,
    wifi,
    passwordArchive: INITIAL_SYNTHETIC_ARCHIVE,
  });
  assert.equal(passedA.verifiedInLab, true);

  const passedC = verifyScenarioInLiveLabs('scenario-c', {
    terminal,
    windows,
    ad,
    wifi: createInitialWifiLabState('hardened'),
    passwordArchive: INITIAL_SYNTHETIC_ARCHIVE,
  });
  assert.equal(passedC.verifiedInLab, true);

  let hardenedAd = toggleUserGroup(ad, 'svc_backup', 'Domain Admins');
  hardenedAd = toggleUserGroup(hardenedAd, 'svc_backup', 'Backup_LeastPriv');
  hardenedAd = {
    ...hardenedAd,
    users: hardenedAd.users.map((u) =>
      u.samAccountName === 'svc_backup' ? { ...u, workstationLogonRestricted: true } : u
    ),
    passwordPolicy: {
      minLength: 14,
      complexityEnabled: true,
      lockoutThreshold: 4,
      maxAgeDays: 90,
      reversibleEncryptionDisabled: true,
    },
    gpos: hardenedAd.gpos.map((g) => ({
      ...g,
      disableLlmnrNbns: true,
      powershellScriptBlockLogging: true,
      tier0LogonRestriction: true,
    })),
  };
  hardenedAd = toggleUserGroup(hardenedAd, 'svc_sql', 'Backup Operators');
  hardenedAd = toggleUserEnabled(hardenedAd, 'ex_stagista');

  const passedE = verifyScenarioInLiveLabs('scenario-e', {
    terminal,
    windows,
    ad: hardenedAd,
    wifi,
    passwordArchive: INITIAL_SYNTHETIC_ARCHIVE,
  });
  assert.equal(passedE.verifiedInLab, true);
});
