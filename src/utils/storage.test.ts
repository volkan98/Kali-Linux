import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeOverallAcademyProgress,
  createInitialProgress,
  exportAllAcademyData,
  isModuleCompetenceVerified,
  validateBackupBundle,
} from './storage.ts';

test('computeOverallAcademyProgress scales over 22 modules, 5 labs, and 7 scenarios', () => {
  const base = createInitialProgress();
  assert.equal(computeOverallAcademyProgress(base), 0);

  const partial = {
    ...base,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 11 of 22 studied (0.5 each without >=70% test)
    finalTestScores: {
      1: 80, 2: 90, 3: 80, 4: 75, 5: 80, 6: 85, 7: 70, 8: 90, 9: 80, 10: 75, 11: 80,
    },
    completedLabs: ['terminal-lab', 'windows-smb-lab', 'ad-security-lab', 'wifi-security-lab', 'password-audit-lab'],
    completedScenarios: ['scenario-a', 'scenario-b', 'scenario-c', 'scenario-d', 'scenario-e', 'scenario-f', 'scenario-g'],
  };

  // (0.5 * 0.45 + 0.35 + 0.2) * 100 === 77.49999999999999 -> Math.round = 77%
  assert.equal(computeOverallAcademyProgress(partial), 77);
  assert.equal(isModuleCompetenceVerified(partial, 1), true);
  assert.equal(isModuleCompetenceVerified(partial, 12), false);
});

test('validateBackupBundle accepts valid export bundle and rejects corrupted input', () => {
  const bundle = exportAllAcademyData();
  const validResult = validateBackupBundle(bundle);
  assert.equal(validResult.valid, true);

  const invalidApp = validateBackupBundle({ app: 'OTHER', schemaVersion: 2, data: {} });
  assert.equal(invalidApp.valid, false);

  const invalidVersion = validateBackupBundle({
    app: 'CYBER_LAB_ACADEMY',
    schemaVersion: 99,
    data: { progress: { completedLessons: [], completedLabs: [] } },
  });
  assert.equal(invalidVersion.valid, false);
});
