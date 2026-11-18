import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialWifiLabState } from './wifiLabEngine.ts';
import { filterPackets, generateSyntheticWifiPackets } from './packetInspectorEngine.ts';

test('packetInspectorEngine reflects OPEN vs hardened AP configuration dynamically', () => {
  const openState = createInitialWifiLabState('open');
  const openPackets = generateSyntheticWifiPackets(openState);

  const arpOpen = openPackets.find((p) => p.protocol === 'ARP');
  const tcpOpen = openPackets.find((p) => p.protocol === 'TCP');
  assert.equal(arpOpen?.riskLevel, 'CRITICO');
  assert.equal(tcpOpen?.riskLevel, 'CRITICO');

  const hardenedState = createInitialWifiLabState('hardened');
  const hardenedPackets = generateSyntheticWifiPackets(hardenedState);
  const arpHardened = hardenedPackets.find((p) => p.protocol === 'ARP');
  const tcpHardened = hardenedPackets.find((p) => p.protocol === 'TCP');
  assert.equal(arpHardened?.riskLevel, 'INFO');
  assert.equal(tcpHardened?.riskLevel, 'INFO');
});

test('filterPackets filters cleanly by protocol and search query', () => {
  const packets = generateSyntheticWifiPackets(createInitialWifiLabState('weak'));
  const dnsOnly = filterPackets(packets, 'DNS', '');
  assert.equal(dnsOnly.length, 1);
  assert.equal(dnsOnly[0].protocol, 'DNS');

  const httpSearch = filterPackets(packets, 'TUTTI', 'credenziali');
  assert.equal(httpSearch.length, 1);
  assert.equal(httpSearch[0].protocol, 'HTTP');
});
