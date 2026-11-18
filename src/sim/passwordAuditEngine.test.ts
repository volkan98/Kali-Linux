import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSyntheticPassword } from './passwordAuditEngine';

test('password audit detects weak dictionary passwords vs strong Argon2id MFA credentials', () => {
  const weak = evaluateSyntheticPassword('admin123', 'MD5 (no salt)', false, false, false);
  assert.equal(weak.strengthLabel, 'Critica');
  assert.ok(weak.score < 25);
  assert.ok(weak.weaknesses.length >= 4);

  const strong = evaluateSyntheticPassword('K9#vP2$mL8@qR4!z', 'Argon2id', true, true, true);
  assert.equal(strong.strengthLabel, 'Molto Robusta');
  assert.ok(strong.score >= 90);
});
