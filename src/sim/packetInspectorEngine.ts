import { WifiLabState } from './wifiLabEngine';

export type PacketProtocol = '802.11' | 'ARP' | 'DHCP' | 'DNS' | 'TCP' | 'HTTP' | 'HTTPS';

export interface SimulatedPacket {
  id: string;
  no: number;
  timestamp: string;
  src: string;
  dst: string;
  protocol: PacketProtocol;
  length: number;
  encrypted: boolean;
  riskLevel: 'INFO' | 'ATTENZIONE' | 'CRITICO';
  summary: string;
  payloadPreview: string;
  didacticExplanation: string;
}

export function generateSyntheticWifiPackets(state: WifiLabState): SimulatedPacket[] {
  const isOpen = state.securityMode === 'OPEN' || state.securityMode === 'WEP';
  const isIsolated = state.clientIsolation;
  const guestBlockedLan = state.guestIsolatedFromLan;
  const apBssid = state.bssid || 'A4:2B:8C:10:20:01';
  const guestClientIp = state.clients[0]?.ip || '192.168.50.14';
  const laptopClientIp = state.clients[1]?.ip || '192.168.50.22';

  const packets: SimulatedPacket[] = [
    {
      id: 'pkt-1',
      no: 1,
      timestamp: '00:00.012',
      src: apBssid,
      dst: 'Broadcast (ff:ff:ff:ff:ff:ff)',
      protocol: '802.11',
      length: 148,
      encrypted: false,
      riskLevel: isOpen ? 'ATTENZIONE' : 'INFO',
      summary: `Beacon frame SSID="${state.ssid}" Security=${state.securityMode}${state.wpsEnabled ? ' WPS=ON' : ''}`,
      payloadPreview: `Capabilities: Privacy=${isOpen ? '0 (Open/Weak)' : '1 (RSN)'}, PMF=${state.pmfEnabled ? 'Required' : 'Disabled'}`,
      didacticExplanation:
        'I frame Beacon 802.11 sono sempre in chiaro affinché i dispositivi possano scoprire la rete (anche con SSID nascosto gli altri frame di management lo espongono).',
    },
    {
      id: 'pkt-2',
      no: 2,
      timestamp: '00:00.184',
      src: '00:00:00:00 (0.0.0.0)',
      dst: '255.255.255.255',
      protocol: 'DHCP',
      length: 342,
      encrypted: !isOpen,
      riskLevel: 'INFO',
      summary: `DHCP Request / ACK -> Assegnato IP ${guestClientIp} (Gateway 192.168.50.1)`,
      payloadPreview: `Option 50: Requested IP ${guestClientIp} | Option 6: DNS 10.10.20.12`,
      didacticExplanation:
        'Il protocollo DHCP assegna indirizzo IP, subnet mask, gateway e server DNS al client appena autenticato.',
    },
    {
      id: 'pkt-3',
      no: 3,
      timestamp: '00:01.045',
      src: guestClientIp,
      dst: laptopClientIp,
      protocol: 'ARP',
      length: 42,
      encrypted: !isOpen,
      riskLevel: isIsolated ? 'INFO' : 'CRITICO',
      summary: isIsolated
        ? `ARP Who-has ${laptopClientIp}? [BLOCCATO da Client Isolation AP]`
        : `ARP Who-has ${laptopClientIp}? Tell ${guestClientIp} [Traffico Peer-to-Peer Consentito]`,
      payloadPreview: isIsolated
        ? 'AP Policy Drop: layer-2 forwarding tra client disabilitato'
        : `Sender MAC: 5C:F9:DD:44:10:02 -> Target IP: ${laptopClientIp}`,
      didacticExplanation: isIsolated
        ? 'Con Client Isolation attivo, l’Access Point impedisce il contatto L2 diretto tra dispositivi connessi alla stessa cella Wi-Fi, bloccando ARP spoofing.'
        : 'Senza Client Isolation un ospite può inviare risposte ARP falsificate (ARP Spoofing) verso altri client per intercettarne il traffico.',
    },
    {
      id: 'pkt-4',
      no: 4,
      timestamp: '00:01.490',
      src: guestClientIp,
      dst: '10.10.20.12:53',
      protocol: 'DNS',
      length: 76,
      encrypted: !isOpen,
      riskLevel: isOpen ? 'ATTENZIONE' : 'INFO',
      summary: 'Standard query A intranet.labcorp.local',
      payloadPreview: isOpen
        ? 'Frame radio in chiaro: Query DNS "intranet.labcorp.local" leggibile passivamente via air'
        : 'Frame wireless cifrato via CCMP/GCMP — Query UDP/53 protetta sul link radio',
      didacticExplanation:
        'Il DNS classico viaggia in chiaro su UDP/53: su una rete Wi-Fi OPEN anche un osservatore radio passivo vede ogni dominio visitato.',
    },
    {
      id: 'pkt-5',
      no: 5,
      timestamp: '00:02.110',
      src: guestClientIp,
      dst: '10.10.20.15:445',
      protocol: 'TCP',
      length: 66,
      encrypted: !isOpen,
      riskLevel: guestBlockedLan ? 'INFO' : 'CRITICO',
      summary: guestBlockedLan
        ? 'TCP SYN -> 10.10.20.15:445 (SMB) [DROP: Guest VLAN Firewall]'
        : 'TCP SYN/ACK -> 10.10.20.15:445 (SMB) [RAGGIUNGIBILE DA RETE GUEST!]',
      payloadPreview: guestBlockedLan
        ? 'Firewall Rule: Deny VLAN_GUEST (192.168.50.0/24) -> LAN_INTERNAL (10.10.20.0/24)'
        : 'Flags [S.] seq 10421 ack 8841 win 64240 — File Server interno raggiunto!',
      didacticExplanation: guestBlockedLan
        ? 'La separazione VLAN blocca l’accesso verticale dalla rete Guest verso i server interni (SMB porta 445).'
        : 'Senza segmentazione VLAN, chiunque si colleghi al Wi-Fi Guest può raggiungere direttamente il File Server SMB aziendale.',
    },
    {
      id: 'pkt-6',
      no: 6,
      timestamp: '00:02.830',
      src: laptopClientIp,
      dst: '10.10.20.10:80',
      protocol: 'HTTP',
      length: 215,
      encrypted: false,
      riskLevel: 'CRITICO',
      summary: 'POST /login HTTP/1.1 [CREDENZIALI IN CHIARO]',
      payloadPreview: 'Host: intranet.labcorp.local | Body: user=m.rossi&pass=Estate2026!',
      didacticExplanation:
        'HTTP senza TLS trasmette username e password in chiaro in rete. Anche con Wi-Fi WPA2/WPA3, il traffico verso il server resta visibile su router/LAN finché non si adotta HTTPS.',
    },
    {
      id: 'pkt-7',
      no: 7,
      timestamp: '00:03.405',
      src: laptopClientIp,
      dst: '10.10.20.10:443',
      protocol: 'HTTPS',
      length: 512,
      encrypted: true,
      riskLevel: 'INFO',
      summary: 'TLSv1.3 Application Data [Cifratura End-to-End Attiva]',
      payloadPreview: 'Opaque Payload: 17 03 03 01 f0 [Ciphertext AEAD AES-256-GCM]',
      didacticExplanation:
        'HTTPS (HTTP su TLS 1.3) protegge integrità e confidenzialità fino al server di destinazione, anche se la rete locale o Wi-Fi dovesse essere ostile.',
    },
  ];

  return packets;
}

export function filterPackets(
  packets: SimulatedPacket[],
  protocolFilter: PacketProtocol | 'TUTTI',
  query: string
): SimulatedPacket[] {
  const q = query.trim().toLowerCase();
  return packets.filter((p) => {
    if (protocolFilter !== 'TUTTI' && p.protocol !== protocolFilter) return false;
    if (!q) return true;
    return (
      p.src.toLowerCase().includes(q) ||
      p.dst.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.payloadPreview.toLowerCase().includes(q)
    );
  });
}
