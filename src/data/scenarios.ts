import { QuizQuestion } from '../types/academy';

export interface AttackDefenceScenario {
  id: string;
  codice: string;
  titolo: string;
  categoria: 'Red Team' | 'Blue Team' | 'Entrambi';
  difficolta: 'Base' | 'Intermedio' | 'Avanzato';
  descrizione: string;
  obiettivo: string;
  ambiente: string[];
  evidenze: Array<{
    fonte: string;
    contenuto: string;
  }>;
  comandiConsigliati: string[];
  opzioniIntervento: Array<{
    id: string;
    azione: string;
    corretta: boolean;
    feedback: string;
  }>;
  spiegazioneFinale: string;
}

export const ATTACK_DEFENCE_SCENARIOS: AttackDefenceScenario[] = [
  {
    id: 'scenario-a',
    codice: 'SCENARIO A',
    titolo: 'Accessi SSH sospetti su server Linux',
    categoria: 'Blue Team',
    difficolta: 'Base',
    descrizione:
      'Il server Ubuntu del laboratorio ha registrato un aumento improvviso di traffico sulla porta 22/TCP. Devi analizzare i log, capire cosa sta succedendo e applicare le protezioni corrette.',
    obiettivo:
      'Identificare l’indirizzo IP sorgente dei tentativi di forza bruta SSH, bloccare l’abuso tramite firewall/hardening e verificare lo stato del servizio.',
    ambiente: ['Ubuntu Server Lab (10.10.20.11)', 'Servizio OpenSSH (22/TCP)', 'Firewall UFW', '/var/log/auth.log'],
    evidenze: [
      {
        fonte: '/var/log/auth.log',
        contenuto:
          'Nov 17 14:05:44 kali-lab sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44812 ssh2\nNov 17 14:05:46 kali-lab sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44815 ssh2\nNov 17 14:05:49 kali-lab sshd[1140]: Failed password for root from 198.51.100.44 port 44820 ssh2',
      },
      {
        fonte: 'ss -tulnp',
        contenuto: 'tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1102,fd=3))',
      },
    ],
    comandiConsigliati: ['grep Failed /var/log/auth.log', 'sudo ufw status', 'sudo ufw enable', 'systemctl status ssh'],
    opzioniIntervento: [
      {
        id: 'a-1',
        azione: 'Limitare SSH con UFW alla sola subnet amministrativa (10.10.20.0/24), disabilitare PermitRootLogin e usare chiavi Ed25519.',
        corretta: true,
        feedback: 'Corretto! Riduci drasticamente la superficie esposta, elimini il brute-force su root e previeni attacchi con password deboli.',
      },
      {
        id: 'a-2',
        azione: 'Cancellare il file /var/log/auth.log in modo che gli errori non compaiano più.',
        corretta: false,
        feedback: 'Errato! Cancellare i log distrugge le evidenze forensi senza fermare minimamente i tentativi di intrusione.',
      },
      {
        id: 'a-3',
        azione: 'Cambiare solo i permessi di /var/log/auth.log a 777 per analizzarlo meglio.',
        corretta: false,
        feedback: 'Errato! Impostare 777 espone i log di sicurezza a chiunque sul sistema e non blocca l’IP attaccante.',
      },
    ],
    spiegazioneFinale:
      'I tentativi ripetuti su utenti inesistenti (admin) e root dallo stesso IP indicano uno script automatizzato di brute force. La risposta professionale prevede: raccolta evidenza (grep su auth.log), restrizione firewall sulla porta 22, blocco login diretto di root, passaggio a chiavi SSH (chmod 600) e strumenti come Fail2Ban.',
  },
  {
    id: 'scenario-b',
    codice: 'SCENARIO B',
    titolo: 'Windows File Sharing con autorizzazioni eccessive',
    categoria: 'Entrambi',
    difficolta: 'Intermedio',
    descrizione:
      'Dalla postazione Kali Linux di test, una verifica SMB mostra cartelle aziendali critiche accessibili anche ad account non autorizzati.',
    obiettivo:
      'Individuare le condivisioni esposte su FS01-SMB (10.10.20.15), valutare la combinazione Share + NTFS e ripristinare il minimo privilegio.',
    ambiente: ['Kali Linux (10.10.20.10)', 'Windows File Server FS01-SMB (10.10.20.15)', 'Porte 139/445 TCP'],
    evidenze: [
      {
        fonte: 'smbclient -L //10.10.20.15 -U guest_user',
        contenuto: 'Backup_IT   Disk   [ACCESSIBILE: READ]   Snapshot di sistema e script',
      },
      {
        fonte: 'Event Viewer (ID 5140)',
        contenuto: 'Account guest_user ha avuto accesso a \\\\FS01-SMB\\Backup_IT tramite gruppo Everyone.',
      },
    ],
    comandiConsigliati: ['nmap 10.10.20.15', 'smbclient -L //10.10.20.15 -U auditor', 'smbclient //10.10.20.15/Backup_IT -U guest_user'],
    opzioniIntervento: [
      {
        id: 'b-1',
        azione: 'Rimuovere Everyone da Share ACL e NTFS su Backup_IT, limitare HR_Riservati a HR_Team, disabilitare SMBv1 e Guest, attivare SMB Signing.',
        corretta: true,
        feedback: 'Esatto! Applichi il principio del minimo privilegio su entrambi i livelli (Share + NTFS) e rimuovi protocolli e account obsoleti.',
      },
      {
        id: 'b-2',
        azione: 'Aggiungere una regola Share Full Control per Domain Users così gli utenti reali non ricevono errori.',
        corretta: false,
        feedback: 'Errato! Esporrebbe dati critici e script di backup a tutti i dipendenti dell’azienda.',
      },
    ],
    spiegazioneFinale:
      'Su Windows, l’accesso effettivo da rete è l’intersezione più restrittiva tra Share Permissions e NTFS Permissions. Lasciare Everyone su entrambe permette anche ad account guest di leggere file sensibili. Puoi eseguire questa correzione dal vivo nel laboratorio Windows Network Lab!',
  },
  {
    id: 'scenario-c',
    codice: 'SCENARIO C',
    titolo: 'Wi-Fi Open Network senza isolamento client',
    categoria: 'Blue Team',
    difficolta: 'Base',
    descrizione:
      'Un hotspot aziendale per gli ospiti è configurato senza password e senza isolamento client. I dispositivi guest possono vedere i server interni.',
    obiettivo:
      'Analizzare i rischi di comunicazione orizzontale e verticale nella rete aperta e segmentare correttamente l’Access Point.',
    ambiente: ['Access Point Lab (LabCafe-Public-Open)', 'Client Windows 11 & Ubuntu', 'LAN Aziendale 10.10.20.0/24'],
    evidenze: [
      {
        fonte: 'Stato AP Simulato',
        contenuto: 'Security: OPEN | Client Isolation: OFF | Guest VLAN Separation: OFF | Traffico DNS/HTTP non cifrato osservabile tra peer.',
      },
    ],
    comandiConsigliati: ['ip a', 'ss -tulnp'],
    opzioniIntervento: [
      {
        id: 'c-1',
        azione: 'Attivare cifratura WPA2/WPA3, abilitare Client Isolation per bloccare comunicazioni peer-to-peer e isolare la rete Guest su VLAN separata dalla LAN interna.',
        corretta: true,
        feedback: 'Corretto! Fermiamo lo sniffing passivo, blocchiamo ARP spoofing tra client e impediamo l’accesso alla rete aziendale.',
      },
      {
        id: 'c-2',
        azione: 'Nascondere semplicemente il nome SSID lasciando la rete aperta.',
        corretta: false,
        feedback: 'Errato! Nascondere l’SSID è "security through obscurity": l’SSID compare comunque nei frame di associazione e la rete resta in chiaro.',
      },
    ],
    spiegazioneFinale:
      'Una rete Wi-Fi aperta espone i frame wireless e facilita attacchi Evil Twin e Man-in-the-Middle verso servizi non HTTPS. L’isolamento dei client impedisce il contatto diretto fra dispositivi connessi allo stesso AP, mentre la segmentazione VLAN protegge i server interni.',
  },
  {
    id: 'scenario-d',
    codice: 'SCENARIO D',
    titolo: 'Wi-Fi Password Weakness & WPS attivo',
    categoria: 'Red Team',
    difficolta: 'Intermedio',
    descrizione:
      'Un router di laboratorio utilizza WPA2-PSK con una passphrase da dizionario ("password123") e ha WPS abilitato.',
    obiettivo:
      'Comprendere perché il 4-Way Handshake e WPS rendono vulnerabile la rete e applicare la configurazione resistente.',
    ambiente: ['Router di laboratorio LabCorp-Office-WiFi', 'Dizionario sintetico locale', 'Simulatore Wi-Fi Lab'],
    evidenze: [
      {
        fonte: 'Audit Offline Sintetico',
        contenuto: 'Passphrase "password123" trovata alla posizione #3 della wordlist di test. WPS PIN abilitato (vulnerabile a Pixie Dust).',
      },
    ],
    comandiConsigliati: ['Audit offline nel Wi-Fi Security Lab'],
    opzioniIntervento: [
      {
        id: 'd-1',
        azione: 'Disabilitare WPS, passare a WPA3-SAE (o WPA2 con passphrase casuale >= 16 caratteri) e attivare PMF (802.11w).',
        corretta: true,
        feedback: 'Perfetto! WPA3-SAE blocca il cracking offline sull’handshake, e disabilitare WPS chiude un vettore noto di compromissione.',
      },
      {
        id: 'd-2',
        azione: 'Tornare a WEP con chiave a 10 cifre perché WPA2 ha un handshake.',
        corretta: false,
        feedback: 'Gravemente errato! WEP è completamente compromesso da oltre 20 anni e violabile in pochi minuti.',
      },
    ],
    spiegazioneFinale:
      'In WPA2-PSK chi cattura il 4-Way Handshake può verificare milioni di password offline senza interagire più con l’Access Point. Per difendersi servono passphrase lunghe e imprevedibili o il passaggio a WPA3-SAE, disattivando sempre WPS.',
  },
  {
    id: 'scenario-e',
    codice: 'SCENARIO E',
    titolo: 'Active Directory — Privilegi amministrativi eccessivi',
    categoria: 'Entrambi',
    difficolta: 'Avanzato',
    descrizione:
      'Un account di servizio (svc_backup) creato per i backup notturni è stato inserito nel gruppo Domain Admins per "risolvere velocemente un errore".',
    obiettivo:
      'Riconoscere la violazione del principio del minimo privilegio e progettare la messa in sicurezza dell’identità.',
    ambiente: ['DC01-WIN2022 (10.10.20.12)', 'Dominio LABCORP.LOCAL', 'Active Directory Users & Computers'],
    evidenze: [
      {
        fonte: 'Audit Gruppi AD (simulato)',
        contenuto: 'Membro di Domain Admins: [it_admin, svc_backup]. Password di svc_backup impostata 4 anni fa, nessuna restrizione di logon.',
      },
    ],
    comandiConsigliati: ['nmap 10.10.20.12', 'dig dc01.labcorp.local'],
    opzioniIntervento: [
      {
        id: 'e-1',
        azione: 'Rimuovere svc_backup da Domain Admins, assegnargli solo permessi specifici sulle cartelle di backup, usare gMSA o password complessa a 25+ caratteri.',
        corretta: true,
        feedback: 'Corretto! Se un account di servizio viene compromesso non deve mai fornire controllo totale sul dominio.',
      },
      {
        id: 'e-2',
        azione: 'Lasciarlo in Domain Admins ma nascondere il nome dell’account.',
        corretta: false,
        feedback: 'Errato! In Active Directory qualsiasi utente autenticato può enumerare gli appartenenti a Domain Admins via LDAP.',
      },
    ],
    spiegazioneFinale:
      'Gli account di servizio con privilegi Domain Admin sono tra i bersagli principali negli attacchi a reti Windows (es. Kerberoasting). Applicare il minimo privilegio e usare Group Managed Service Accounts (gMSA) limita drasticamente il raggio d’azione di un attaccante.',
  },
  {
    id: 'scenario-f',
    codice: 'SCENARIO F',
    titolo: 'Server Web con configurazione vulnerabile',
    categoria: 'Red Team',
    difficolta: 'Intermedio',
    descrizione:
      'Il portale intranet di test espone header informativi di versione, non usa HTTPS e consente l’elenco delle directory.',
    obiettivo:
      'Verificare i servizi esposti con curl/ss e applicare l’hardening web di base.',
    ambiente: ['Server Apache2 di laboratorio (10.10.20.10:80)'],
    evidenze: [
      {
        fonte: 'curl -I http://10.10.20.10',
        contenuto: 'HTTP/1.1 200 OK\nServer: Apache/2.4.49 (Ubuntu)\nX-Frame-Options: (assente)\nStrict-Transport-Security: (assente)',
      },
    ],
    comandiConsigliati: ['sudo systemctl start apache2', 'ss -tulnp', 'curl http://10.10.20.10'],
    opzioniIntervento: [
      {
        id: 'f-1',
        azione: 'Aggiornare il web server, abilitare HTTPS/TLS con redirect forzato, disabilitare Directory Listing e aggiungere header di sicurezza (CSP, HSTS, X-Frame-Options).',
        corretta: true,
        feedback: 'Corretto! Riduci l’esposizione di CVE note, cifri il traffico in transito e mitighi clickjacking e XSS.',
      },
      {
        id: 'f-2',
        azione: 'Spostare il sito dalla porta 80 alla porta 8080 lasciandolo in HTTP in chiaro.',
        corretta: false,
        feedback: 'Errato! Cambiare porta non cifra il traffico né corregge le vulnerabilità applicative o gli header mancanti.',
      },
    ],
    spiegazioneFinale:
      'La sicurezza web inizia da configurazioni pulite (OWASP Security Misconfiguration): versioni aggiornate, TLS attivo, principio del minimo privilegio sui file web e header difensivi.',
  },
  {
    id: 'scenario-g',
    codice: 'SCENARIO G',
    titolo: 'Incidente aziendale multi-dispositivo (Triage & Contenimento)',
    categoria: 'Blue Team',
    difficolta: 'Avanzato',
    descrizione:
      'Alle 14:15 il SIEM segnala autenticazioni fallite su Linux, accesso anomalo da guest_user su \\\\FS01-SMB\\Backup_IT e un client connesso alla rete Wi-Fi senza isolamento.',
    obiettivo:
      'Correlare gli Indicatori di Compromissione (IOC), applicare la sequenza corretta di Incident Response e contenere l’incidente.',
    ambiente: ['SOC SIEM Simulato', 'Linux Server', 'Windows File Server', 'Access Point Wi-Fi'],
    evidenze: [
      {
        fonte: 'Timeline Correlata',
        contenuto:
          '14:05 [Linux auth.log] Failed password for root from 198.51.100.44\n14:12 [Win Event 5140] guest_user accessed \\\\FS01-SMB\\Backup_IT\n14:14 [Wi-Fi AP] Client guest non isolato effettua scansione porta 445 verso 10.10.20.15',
      },
    ],
    comandiConsigliati: ['grep Failed /var/log/auth.log', 'sudo ufw enable', 'Controllo Event Viewer nel Windows Lab'],
    opzioniIntervento: [
      {
        id: 'g-1',
        azione: '1) Preservare i log, 2) Isolare la rete Guest Wi-Fi dalla LAN, 3) Disabilitare guest_user e correggere ACL di Backup_IT, 4) Bloccare IP/porte su firewall e verificare via retest.',
        corretta: true,
        feedback: 'Ottimo lavoro da SOC Analyst / Incident Responder! Hai seguito l’ordine corretto: evidenze → contenimento → eradicazione/correzione → verifica.',
      },
      {
        id: 'g-2',
        azione: 'Spegnere e formattare subito tutti i server aziendali senza salvare i log.',
        corretta: false,
        feedback: 'Errato! Distruggeresti ogni prova forense impedendo di capire la causa radice e causando un fermo aziendale totale.',
      },
    ],
    spiegazioneFinale:
      'Un incidente reale attraversa spesso più domini (Wi-Fi → Rete interna → File Server → Linux). La capacità di correlare log eterogenei e applicare contenimento mirato senza perdere le evidenze è la competenza chiave di un Cyber Defence Specialist.',
  },
];

export const FINAL_EXAM_QUESTIONS: QuizQuestion[] = [
  {
    id: 'exam-1',
    domanda: 'Quale combinazione descrive correttamente l’accesso effettivo a una cartella condivisa Windows tramite rete (SMB)?',
    opzioni: [
      'Si applica solo il permesso NTFS perché è più recente.',
      'Si applica il permesso più permissivo tra Share ACL e NTFS ACL.',
      'Si applica l’intersezione più restrittiva tra Share Permissions e NTFS Permissions.',
      'I permessi Share ignorano completamente quelli NTFS.',
    ],
    rispostaCorretta: 2,
    spiegazione: 'Windows valuta entrambi gli strati (Share e NTFS) e applica la restrizione maggiore tra i due.',
    concettoCollegato: 'Modulo 8 — SMB e Permessi Windows',
  },
  {
    id: 'exam-2',
    domanda: 'Su Linux hai scaricato una chiave privata `chiave_lab.pem` con permessi `-rw-r--r--` (644). Quale comando la rende sicura per SSH?',
    opzioni: ['chmod 777 chiave_lab.pem', 'chmod 600 chiave_lab.pem', 'chown guest chiave_lab.pem', 'touch 600 chiave_lab.pem'],
    rispostaCorretta: 1,
    spiegazione: 'chmod 600 imposta lettura e scrittura solo per il proprietario (-rw-------), requisito richiesto da OpenSSH.',
    concettoCollegato: 'Modulo 3 — Permessi Linux',
  },
  {
    id: 'exam-3',
    domanda: 'Qual è il vantaggio principale di WPA3-SAE rispetto a WPA2-PSK in termini di sicurezza delle password?',
    opzioni: [
      'Permette di usare password di 4 caratteri in sicurezza.',
      'Elimina completamente la necessità di firewall.',
      'Impedisce gli attacchi a dizionario offline sul traffico handshake catturato grazie allo scambio Dragonfly (SAE).',
      'Trasmette i pacchetti in chiaro più velocemente.',
    ],
    rispostaCorretta: 2,
    spiegazione: 'Con WPA3-SAE ogni tentativo richiede interazione attiva con l’AP, rendendo inefficace la cattura passiva per il cracking offline.',
    concettoCollegato: 'Modulo 13 — Wi-Fi Security WPA2/WPA3',
  },
  {
    id: 'exam-4',
    domanda: 'Quale algoritmo è raccomandato per archiviare le password in un database moderno e perché?',
    opzioni: [
      'MD5 senza salt perché è velocissimo.',
      'Plaintext cifrato in Base64 perché è reversibile.',
      'Argon2id (o bcrypt) con salt univoco per utente, perché è lento e costoso in memoria contro GPU.',
      'SHA-1 con chiave fissa condivisa.',
    ],
    rispostaCorretta: 2,
    spiegazione: 'Argon2id è progettato appositamente per resistere al brute-force su GPU/ASIC tramite costo temporale e di memoria + salt univoco.',
    concettoCollegato: 'Modulo 15 — Password Auditing & Hashing',
  },
  {
    id: 'exam-5',
    domanda: 'Quale comando Linux permette di verificare quali porte TCP/UDP sono attualmente in ascolto con il relativo processo?',
    opzioni: ['pwd -a', 'ss -tulnp', 'cat /etc/passwd', 'mkdir -p'],
    rispostaCorretta: 1,
    spiegazione: 'ss -tulnp mostra socket TCP (-t), UDP (-u), in ascolto (-l), numerici (-n) e processi (-p).',
    concettoCollegato: 'Modulo 3 & 5 — Rete e Socket Linux',
  },
  {
    id: 'exam-6',
    domanda: 'Nell’analisi dei log Windows (Event Viewer), quale Event ID segnala l’accesso a una condivisione di rete SMB?',
    opzioni: ['Event ID 5140 / 5145', 'Event ID 100', 'Event ID 22', 'Event ID 8080'],
    rispostaCorretta: 0,
    spiegazione: 'Gli Event ID 5140 e 5145 registrano rispettivamente l’accesso a una share di rete e il controllo dettagliato dei permessi su oggetti condivisi.',
    concettoCollegato: 'Modulo 8 & 18 — Log Windows e SOC',
  },
];
