import { CompetencyDomain } from '../types/academy';

export interface CareerTrack {
  id: string;
  ruolo: string;
  livello: string;
  descrizione: string;
  competenzeRichieste: Array<{
    nome: string;
    domain: CompetencyDomain;
    moduliCollegati: number[];
  }>;
  attivitaQuotidiane: string[];
  strumenti: string[];
  problemaProfessionale: {
    titolo: string;
    scenario: string;
    approccio: string;
  };
  colloquioSimulato: Array<{
    domanda: string;
    rispostaModello: string;
  }>;
  progettiPortfolio: string[];
  percorsiStudio: Array<{
    nome: string;
    nota: string;
  }>;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'jr-pentester',
    ruolo: 'Junior Penetration Tester / Ethical Hacker',
    livello: 'Entry-Level → Junior',
    descrizione:
      'Esegue verifiche di sicurezza autorizzate su reti, server Linux/Windows e applicazioni web, documentando rischi reali e piani di remediation.',
    competenzeRichieste: [
      { nome: 'Padronanza terminale Linux e Bash', domain: 'Terminale & Amministrazione Linux', moduliCollegati: [2, 3, 4] },
      { nome: 'Reti TCP/IP, porte e analisi traffico', domain: 'Networking & Traffico', moduliCollegati: [5] },
      { nome: 'Ricognizione ed enumerazione con Kali Linux', domain: 'Kali Linux & Enumeration', moduliCollegati: [7, 10, 11] },
      { nome: 'Audit condivisioni SMB e Active Directory', domain: 'Windows & Active Directory', moduliCollegati: [8, 9] },
      { nome: 'Valutazione reti Wi-Fi WPA2/WPA3', domain: 'Wi-Fi Security', moduliCollegati: [12, 13, 14] },
    ],
    attivitaQuotidiane: [
      'Definizione dello scope e delle Rules of Engagement con il cliente.',
      'Enumerazione dei servizi esposti tramite Nmap, smbclient e strumenti dedicati.',
      'Validazione controllata delle configurazioni errate e analisi dell’impatto.',
      'Stesura di report tecnici ed executive con priorità di correzione e retest finale.',
    ],
    strumenti: ['Kali Linux', 'Nmap', 'Wireshark', 'Burp Suite', 'OWASP ZAP', 'smbclient', 'Python/Bash'],
    problemaProfessionale: {
      titolo: 'Cartella Backup accessibile senza restrizioni in rete interna',
      scenario:
        'Durante un assessment interno autorizzato, scopri che \\\\FS01-SMB\\Backup_IT è leggibile dall’utente base Domain Users.',
      approccio:
        'Documenta l’evidenza senza estrarre dati personali reali, verifica la combinazione Share ACL + NTFS ACL, segnala il rischio di movimento laterale e raccomanda il principio del minimo privilegio.',
    },
    colloquioSimulato: [
      {
        domanda: 'Qual è la differenza tra Vulnerability Assessment e Penetration Testing?',
        rispostaModello:
          'Il Vulnerability Assessment identifica e classifica sistematicamente le vulnerabilità note; il Penetration Testing verifica in modo controllato e autorizzato se tali debolezze siano effettivamente concatenabili per valutare il rischio reale.',
      },
      {
        domanda: 'Come interagiscono Share Permissions e NTFS Permissions in Windows?',
        rispostaModello:
          'Quando si accede da rete via SMB, Windows valuta entrambi gli strati e applica la combinazione più restrittiva tra i due.',
      },
    ],
    progettiPortfolio: [
      'Report completo di hardening SMB su laboratorio isolato Linux ↔ Windows Server.',
      'Analisi comparativa sulla sicurezza WPA2 vs WPA3 e guida all’auditing delle configurazioni.',
      'Script Python per l’analisi automatica dei log di autenticazione SSH/Windows.',
    ],
    percorsiStudio: [
      { nome: 'LPI Linux Essentials (Materiale preparatorio)', nota: 'Basi solide su shell, file system e permessi. Non sostituisce l’esame ufficiale.' },
      { nome: 'INE eJPT (Materiale preparatorio)', nota: 'Metodologia pratica su rete, enumerazione ed ethical hacking.' },
    ],
  },
  {
    id: 'soc-analyst',
    ruolo: 'SOC Analyst / Cyber Defence Specialist',
    livello: 'Tier 1 → Tier 2',
    descrizione:
      'Monitora gli eventi di sicurezza in tempo reale, correla log Linux e Windows, riconosce tentativi di intrusione e coordina il contenimento degli incidenti.',
    competenzeRichieste: [
      { nome: 'Analisi log Linux (/var/log/auth.log, journalctl)', domain: 'Terminale & Amministrazione Linux', moduliCollegati: [3, 4] },
      { nome: 'Event Viewer Windows (4624, 4625, 5140, 5145)', domain: 'Windows & Active Directory', moduliCollegati: [6, 8, 9] },
      { nome: 'Firewall, IDS/IPS e SIEM Triage', domain: 'Cyber Defence & Incident Response', moduliCollegati: [17, 18, 21] },
      { nome: 'Riconoscimento attacchi Wi-Fi e credenziali', domain: 'Password & Credential Security', moduliCollegati: [14, 15] },
    ],
    attivitaQuotidiane: [
      'Triage degli alert generati dal SIEM e distinzione tra falsi positivi e veri incidenti.',
      'Analisi di tentativi brute-force SSH, password spraying e accessi SMB anomali.',
      'Applicazione di regole di contenimento su firewall (UFW, nftables, Windows Firewall).',
      'Documentazione della timeline dell’incidente e lezioni apprese.',
    ],
    strumenti: ['Wazuh / SIEM', 'Suricata', 'Zeek', 'Wireshark', 'Event Viewer', 'journalctl', 'UFW / nftables'],
    problemaProfessionale: {
      titolo: 'Picco di Event ID 4625 seguito da accesso riuscito 4624',
      scenario:
        'Il monitoraggio segnala 120 tentativi falliti su più account Windows in 2 minuti dallo stesso IP, seguiti da un login riuscito.',
      approccio:
        'Contieni l’account coinvolto, blocca la sorgente se esterna/non autorizzata, verifica se è stato attivato MFA e controlla eventuali accessi successivi su file server o Domain Controller.',
    },
    colloquioSimulato: [
      {
        domanda: 'Quali file di log controlli per primo su Linux durante un sospetto brute-force SSH?',
        rispostaModello:
          '/var/log/auth.log (su Debian/Ubuntu) o journalctl -u ssh, cercando pattern come "Failed password", "Invalid user" e gli IP sorgenti ricorrenti.',
      },
      {
        domanda: 'Che differenza c’è tra Password Spraying e Brute Force classico?',
        rispostaModello:
          'Il Brute Force prova molte password su un solo account (scatenando presto il blocco account); il Password Spraying prova pochissime password comuni su molti account diversi per evitare il lockout.',
      },
    ],
    progettiPortfolio: [
      'Playbook di Incident Response per accessi SSH sospetti e contenimento UFW.',
      'Analizzatore Python di log SSH e Windows Security Events con esportazione alert.',
    ],
    percorsiStudio: [
      { nome: 'CompTIA Network+ (Materiale preparatorio)', nota: 'Fondamenta di reti, porte, subnetting e protocolli.' },
      { nome: 'CompTIA Security+ (Materiale preparatorio)', nota: 'Concetti di sicurezza difensiva, crittografia, IAM e operazioni SOC.' },
    ],
  },
  {
    id: 'linux-ad-admin',
    ruolo: 'Linux SysAdmin & Active Directory Security Analyst',
    livello: 'Amministrazione Sicura',
    descrizione:
      'Progetta, amministra e mette in sicurezza server Linux e domini Windows Active Directory applicando il principio del minimo privilegio.',
    competenzeRichieste: [
      { nome: 'Hardening Linux, utenti, sudo, SSH e dischi', domain: 'Terminale & Amministrazione Linux', moduliCollegati: [2, 3, 4] },
      { nome: 'Segmentazione di rete, VLAN e VPN', domain: 'Networking & Traffico', moduliCollegati: [5, 17] },
      { nome: 'Windows Server, NTFS, Share ACL e AD', domain: 'Windows & Active Directory', moduliCollegati: [6, 8, 9] },
      { nome: 'Gestione policy password e MFA', domain: 'Password & Credential Security', moduliCollegati: [15] },
    ],
    attivitaQuotidiane: [
      'Revisione periodica di gruppi amministrativi, permessi NTFS e condivisioni SMB.',
      'Gestione aggiornamenti di sicurezza e rimozione di protocolli obsoleti (SMBv1, WEP, TLS 1.0).',
      'Automazione dei controlli di configurazione tramite Bash e Python.',
    ],
    strumenti: ['Ubuntu Server', 'Bash', 'Python', 'PowerShell', 'Windows Server', 'Active Directory', 'UFW / Windows Firewall'],
    problemaProfessionale: {
      titolo: 'Riduzione della superficie d’attacco su server aziendale misto',
      scenario:
        'Un file server Windows ha SMBv1 attivo e la cartella condivisa IT è leggibile da Everyone.',
      approccio:
        'Disattiva SMBv1, abilita SMB Signing, applica Share ACL + NTFS limitati a IT_Admins, chiudi la porta 139 e limita la 445 alla sola subnet autorizzata.',
    },
    colloquioSimulato: [
      {
        domanda: 'Perché il gruppo Everyone non dovrebbe quasi mai avere permessi su cartelle aziendali?',
        rispostaModello:
          'Everyone include potenzialmente sessioni ospite o utenti non appartenenti al reparto interessato, violando il principio del minimo privilegio.',
      },
    ],
    progettiPortfolio: [
      'Checklist di Hardening per Ubuntu Server 24.04 e Windows File Server.',
      'Architettura di laboratorio multi-VM isolata in VirtualBox documentata.',
    ],
    percorsiStudio: [
      { nome: 'LPI Linux Essentials & CompTIA Security+ (Materiale preparatorio)', nota: 'Percorso di riferimento per consolidare amministrazione e sicurezza di sistema.' },
    ],
  },
];

export const VM_LAB_GUIDE = {
  avvisoSicurezza:
    'Il browser simula in modo deterministico file system, rete Windows e Wi-Fi a scopo didattico. Non esegue un vero kernel Linux né controlla schede Wi-Fi fisiche. Per esercitazioni reali, costruisci questo laboratorio isolato sul tuo PC.',
  requisiti: [
    'VirtualBox (gratuito) o VMware Workstation Player',
    'Almeno 16 GB di RAM consigliati (8 GB minimi per eseguire 2 VM alla volta)',
    'Immagini ufficiali: Ubuntu Server/Desktop LTS, Kali Linux VM, Windows 11 / Windows Server Evaluation (uso laboratorio)',
  ],
  reteIsolata: {
    nome: 'Rete Interna VirtualBox (Host-Only / Internal Network: cyberlab-net)',
    regola: 'NON usare "Scheda con bridge" durante test offensivi: mantieni le VM in una rete interna isolata (es. 10.10.20.0/24) senza accesso diretto alla LAN domestica o a sistemi di terzi.',
    macchine: [
      { nome: 'VM 1: Kali Linux (Auditor)', ip: '10.10.20.10', ram: '2–4 GB', ruolo: 'Macchina di analisi con Nmap, Wireshark, smbclient.' },
      { nome: 'VM 2: Ubuntu Server (Target / Defence)', ip: '10.10.20.11', ram: '1–2 GB', ruolo: 'Server Linux per esercizi SSH, UFW e analisi log.' },
      { nome: 'VM 3: Windows Server / Windows 11', ip: '10.10.20.15', ram: '4 GB', ruolo: 'File server SMB e Domain Controller isolato di prova.' },
    ],
  },
  passiInstallazione: [
    'Installa VirtualBox e crea una rete interna dedicata chiamandola "cyberlab-net" (File → Strumenti → Gestore Reti).',
    'Importa la VM Kali Linux ufficiale e assegna la scheda di rete a "Rete interna: cyberlab-net" con IP statico 10.10.20.10/24.',
    'Crea la VM Ubuntu e la VM Windows nella stessa rete interna "cyberlab-net" creando uno Snapshot pulito prima di ogni laboratorio.',
    'Esegui i comandi reali nella tua VM isolata e incolla l’output nella sezione Cyber Mentor (modalità Analisi Output Reale) per ricevere spiegazioni riga per riga.',
  ],
};
