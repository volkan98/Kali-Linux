import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeWifiSecurity,
  createInitialWifiLabState,
  verifyWifiLabHardening,
} from './wifiLabEngine';

test('wifi lab distinguishes open/weak configurations from hardened WPA3 configuration', () => {
  const openState = createInitialWifiLabState('open');
  const openAnalysis = analyzeWifiSecurity(openState);
  assert.equal(openAnalysis.grade, 'CRITICO');
  assert.equal(verifyWifiLabHardening(openState).passed, false);

  const weakState = createInitialWifiLabState('weak');
  const weakAnalysis = analyzeWifiSecurity(weakState);
  assert.equal(weakAnalysis.auditResult.dictionaryVulnerable, true);
  assert.equal(verifyWifiLabHardening(weakState).passed, false);

  const hardState = createInitialWifiLabState('hardened');
  const hardAnalysis = analyzeWifiSecurity(hardState);
  assert.equal(hardAnalysis.grade, 'ROBUSTO');
  assert.equal(hardAnalysis.auditResult.dictionaryVulnerable, false);
  assert.equal(verifyWifiLabHardening(hardState).passed, true);
});
