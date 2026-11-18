import { AcademyModule } from '../types/academy';
import { EXTRA_QUESTIONS_EXISTING_MODULES } from './moduleQuestionsExtra';
import { MODULES_PART_A1 } from './modulesPartA1';
import { MODULES_PART_A2 } from './modulesPartA2';
import { MODULES_PART_B1 } from './modulesPartB1';
import { MODULES_PART_B2 } from './modulesPartB2';

const CORE_PREREQUISITES: Record<number, string> = {
  1: 'Nessun prerequisito richiesto: percorso progettato per partire completamente da zero.',
  2: 'Comprensione base di file system, processi e kernel (Modulo 1).',
  3: 'Conoscenza della gerarchia cartelle Linux /etc, /var, /home (Modulo 2).',
  7: 'Conoscenza dei comandi base Linux e delle basi di networking TCP/IP (Moduli 3 e 5).',
  8: 'Conoscenza di rete locale IPv4/CIDR e struttura di Windows Server/NTFS (Moduli 5 e 6).',
  12: 'Concetti base di reti locali, indirizzi IP, MAC e router (Modulo 5).',
  13: 'Conoscenza base di SSID, BSSID e associazione client Wi-Fi 802.11 (Modulo 12).',
  15: 'Concetti di autenticazione, hash di integrità e archivi utenti (Moduli 4 e 6).',
};

const EXISTING_CORE_MODULES: AcademyModule[] = [
  {
    id: 1,
    codice: 'MODULO 1',
    titolo: 'Fondamenti Informatici',
    categoria: 'Fondamenti & Linux',
    competenza: 'Fondamenti & OS',
    statoImplementazione: 'completo',
    obiettivo: 'Comprendere come funzionano hardware, CPU, RAM, kernel, processi, file system e macchine virtuali prima di iniziare a usare Linux.',
    argomenti: [
      'Hardware e Software',
      'CPU, RAM e Archiviazione',
      'Sistemi Operativi e Kernel',
      'Processi e Thread',
      'Client e Server',
      'File System',
      'Virtualizzazione e Macchine Virtuali',
      'Principi di Sicurezza Informatica',
    ],
    laboratorioTitolo: 'Esplorazione componenti e processi nel sistema simulato',
    lezione: {
      fase1_cose:
        'Un computer è un insieme coordinato di componenti fisici (Hardware) guidati da istruzioni logiche (Software). Al centro di tutto opera il Sistema Operativo, il cui nucleo — chiamato Kernel — gestisce la CPU, la memoria RAM, i dischi e la rete per far funzionare in sicurezza i programmi (Processi).',
      fase2_comeFunziona: [
        '1. La memoria di archiviazione (SSD/HDD) conserva programmi e dati anche a computer spento.',
        '2. Quando avvii un programma, il Sistema Operativo lo copia nella RAM (memoria veloce temporanea) e crea un Processo.',
        '3. La CPU esegue le istruzioni del processo una dopo l’altra, mentre il Kernel decide quale processo può accedere a memoria, file o scheda di rete.',
        '4. In un’architettura Client-Server, un computer (Client) invia richieste tramite la rete a un altro computer (Server) che eroga servizi (file, pagine web, autenticazione).',
        '5. Con la Virtualizzazione (VirtualBox, VMware), un software chiamato Hypervisor simula hardware virtuale per eseguire più Sistemi Operativi isolati (Macchine Virtuali) sullo stesso PC fisico.',
      ],
      fase3_schemaVisivo: {
        title: 'Flusso di esecuzione: dall’Hardware al Laboratorio Virtuale',
        nodes: [
          { id: 'hw', label: 'Hardware Fisico', sublabel: 'CPU · RAM · SSD · NIC', type: 'storage' },
          { id: 'os', label: 'Sistema Operativo & Kernel', sublabel: 'Gestione Processi & Permessi', type: 'security' },
          { id: 'vm', label: 'Hypervisor (VirtualBox)', sublabel: 'Rete Interna Isolata', type: 'network' },
          { id: 'kali', label: 'VM Kali / Ubuntu', sublabel: 'Client di Analisi', type: 'client' },
          { id: 'srv', label: 'VM Target Server', sublabel: 'Servizi HTTP / SMB', type: 'server' },
        ],
        flows: [
          { from: 'hw', to: 'os', label: 'Risorse fisiche', protocol: 'Ring 0' },
          { from: 'os', to: 'vm', label: 'Allocazione RAM/CPU', protocol: 'VT-x' },
          { from: 'vm', to: 'kali', label: 'vNIC eth0', protocol: '10.10.20.10' },
          { from: 'kali', to: 'srv', label: 'Richiesta autorizzata', protocol: 'TCP/IP' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Studio Tecnico Alfa Srl',
        contesto: 'Un tirocinante vuole provare strumenti di analisi di rete per imparare a fare audit.',
        problema: 'Installa i tool direttamente sul PC aziendale collegato alla rete di produzione, rischiando instabilità e scansioni non autorizzate verso i server reali.',
        risoluzione: 'Crea invece un laboratorio virtuale isolato con VirtualBox (Host-Only / Internal Network): ogni test avviene tra VM di prova senza toccare la rete reale.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Ispezionare i processi attivi e l’uso di CPU/RAM su Linux',
          comando: 'ps',
          sintassi: 'ps [opzioni]',
          outputAtteso: '  PID TTY          TIME CMD\n    1 ?        00:00:02 systemd\n 1102 ?        00:00:00 sshd\n 2048 pts/0    00:00:00 bash',
          spiegazioneOutput: 'PID è l’identificativo univoco del processo gestito dal Kernel. Ogni servizio (es. sshd) gira come processo isolato.',
        },
        {
          titolo: 'Verificare kernel e architettura del sistema',
          comando: 'uname -a',
          sintassi: 'uname -a',
          outputAtteso: 'Linux kali-lab 6.8.11-amd64 #1 SMP Kali 2026.1 x86_64 GNU/Linux',
          spiegazioneOutput: 'Mostra il nome del kernel (Linux), la versione e l’architettura CPU (x86_64).',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Verifica processi e risorse nel Terminale Simulato',
        descrizione: 'Apri il terminale Linux integrato ed esegui `uname -a`, `ps` e `top` per osservare come il kernel identifica il sistema e i processi.',
        targetLab: 'terminal',
        passi: [
          'Apri la vista Terminale Linux.',
          'Esegui `uname -a` per leggere le informazioni sul kernel simulato.',
          'Esegui `ps` e `top` per individuare i PID dei servizi in esecuzione.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'La macchina virtuale è lentissima o non si avvia a 64-bit',
          causa: 'Virtualizzazione hardware (Intel VT-x / AMD-V) disabilitata nel BIOS/UEFI oppure poca RAM assegnata.',
          correzione: 'Abilita VT-x/AMD-V nel firmware UEFI e assegna almeno 2048 MB di RAM alla VM.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Esecuzione di test di sicurezza sullo stesso sistema operativo usato per lavoro o navigazione personale.',
        rischio: 'Esposizione di dati reali, conflitti di rete e violazioni accidentali verso sistemi non autorizzati.',
        difesa: [
          'Usa sempre macchine virtuali dedicate e snapshot prima di ogni esercitazione.',
          'Configura le reti di laboratorio in modalità Internal Network o Host-Only.',
        ],
      },
      fase9_verifica: 'Sai spiegare la differenza tra RAM e disco fisso, cos’è il Kernel e perché usiamo macchine virtuali isolate per la cybersecurity?',
    },
    quizIniziale: [
      {
        id: 'm1-q1',
        domanda: 'Qual è il ruolo principale del Kernel in un sistema operativo?',
        opzioni: [
          'Disegnare solo le icone del desktop.',
          'Fare da intermediario tra hardware (CPU, RAM, dischi) e processi software applicando controlli di sicurezza.',
          'Sostituire la memoria RAM quando è piena.',
          'Navigare sul web al posto del browser.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Il Kernel è il nucleo del sistema operativo: gestisce risorse fisiche, processi, file system e isolamento tra programmi.',
        concettoCollegato: 'Kernel e Sistema Operativo',
      },
      {
        id: 'm1-q2',
        domanda: 'Perché in cybersecurity si usano Macchine Virtuali isolate per fare pratica?',
        opzioni: [
          'Perché i browser non hanno tastiera.',
          'Per contenere i test in un ambiente controllato e ripristinabile tramite snapshot senza rischiare danni alla rete reale.',
          'Per raddoppiare la velocità della CPU fisica.',
          'Perché Linux non funziona su hardware fisico.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Le VM isolate garantiscono confinamento dei pacchetti, sicurezza legale e possibilità di ripristino immediato.',
        concettoCollegato: 'Virtualizzazione e Lab Isolati',
      },
    ],
    testFinale: [
      {
        id: 'm1-f1',
        domanda: 'In un modello Client-Server, cosa identifica univocamente un programma in esecuzione sul server?',
        opzioni: ['Il suo PID (Process ID) assegnato dal kernel.', 'Il colore del terminale.', 'La dimensione del monitor.', 'Il nome del router.'],
        rispostaCorretta: 0,
        spiegazione: 'Ogni programma caricato in RAM riceve un Process ID (PID) univoco dal kernel.',
        concettoCollegato: 'Processi e Client-Server',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Fondamenti dell’architettura dei calcolatori, funzionamento di CPU/RAM, ruolo del kernel, modello client-server e virtualizzazione sicura.',
        definizioniChiave: [
          { termine: 'Kernel', definizione: 'Componente centrale del Sistema Operativo che controlla hardware, memoria, processi e permessi.' },
          { termine: 'Processo', definizione: 'Istanza di un programma caricato in RAM e in esecuzione sulla CPU, identificato da un PID.' },
          { termine: 'Hypervisor', definizione: 'Software (es. VirtualBox) che permette di eseguire più Sistemi Operativi virtuali su un solo computer fisico.' },
        ],
        spiegazioneApprofondita: [
          'Comprendere la differenza tra archiviazione persistente (SSD) e memoria volatile (RAM) è essenziale per capire dove risiedono file, log e processi attivi.',
          'La virtualizzazione consente al futuro professionista di costruire intere reti aziendali di prova (Linux + Windows + Router) su un singolo computer.',
        ],
        comandiESintassi: [
          { comando: 'uname -a', descrizione: 'Mostra informazioni complete sul kernel e architettura.', esempio: 'uname -a' },
          { comando: 'ps', descrizione: 'Elenca i processi attivi nella sessione.', esempio: 'ps' },
        ],
        rischiESoluzioni: [
          { rischio: 'Test su rete bridged esposta a terzi.', soluzione: 'Utilizzare VirtualBox Internal Network per confinare tutto il traffico.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'CPU esegue istruzioni · RAM ospita dati/processi attivi · SSD conserva file persistenti.',
          'Il Kernel isola i processi e media ogni accesso a file e rete.',
          'I laboratori di ethical hacking si svolgono sempre in VM isolate con snapshot.',
        ],
        comandiRapidi: [
          { comando: 'uname -a', uso: 'Verifica versione kernel' },
          { comando: 'ps / top', uso: 'Osserva processi e consumo risorse' },
        ],
      },
    },
  },
  {
    id: 2,
    codice: 'MODULO 2',
    titolo: 'Linux da Zero',
    categoria: 'Fondamenti & Linux',
    competenza: 'Terminale & Amministrazione Linux',
    statoImplementazione: 'completo',
    obiettivo: 'Capire cos’è Linux, le distribuzioni (Ubuntu, Debian, Kali), la shell Bash, la struttura delle directory e come creare un laboratorio Ubuntu/Kali.',
    argomenti: [
      'Cos’è Linux e distribuzioni (Ubuntu, Debian, Kali)',
      'Differenze tra Linux e Windows',
      'Shell, Bash e Terminale',
      'Albero del File System Linux (/etc, /home, /var, /bin)',
      'Installazione Ubuntu e Kali in VirtualBox',
    ],
    laboratorioTitolo: 'Primo orientamento nel File System Linux (/home/student, /etc, /var/log)',
    lezione: {
      fase1_cose:
        'Linux è una famiglia di sistemi operativi open-source basati sul kernel Linux. A differenza di Windows (che usa lettere come C:\\ e D:\\), Linux organizza ogni file e dispositivo in un unico albero gerarchico che parte dalla radice `/`. La Shell (quasi sempre Bash) è l’interprete che traduce i comandi digitati nel Terminale in azioni reali.',
      fase2_comeFunziona: [
        '1. Distribuzioni: Debian è la base stabile; Ubuntu deriva da Debian ed è ideale per server e desktop; Kali Linux deriva da Debian ed è pre-equipaggiata per test di sicurezza autorizzati.',
        '2. Directory chiave: `/home/utente` contiene i file personali; `/etc` contiene i file di configurazione; `/var/log` contiene i log di sistema e sicurezza; `/bin` e `/usr/bin` contengono i programmi eseguibili.',
        '3. Tutto è un file: su Linux anche dischi, terminali e configurazioni vengono gestiti come file di testo facilmente analizzabili e automatizzabili.',
        '4. Case-Sensitive: `File.txt` e `file.txt` su Linux sono due file completamente diversi.',
      ],
      fase3_schemaVisivo: {
        title: 'Gerarchia del File System Linux (FHS)',
        nodes: [
          { id: 'root', label: '/ (Root)', sublabel: 'Radice unica del sistema', type: 'storage' },
          { id: 'home', label: '/home/student', sublabel: 'File dell’utente', type: 'client' },
          { id: 'etc', label: '/etc', sublabel: 'Configurazioni (hosts, passwd, ssh)', type: 'security' },
          { id: 'var', label: '/var/log', sublabel: 'Log eventi (auth.log, syslog)', type: 'network' },
        ],
        flows: [
          { from: 'root', to: 'home', label: 'Spazio utente' },
          { from: 'root', to: 'etc', label: 'Configurazioni sistema' },
          { from: 'root', to: 'var', label: 'Audit & Telemetry' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'WebHosting Italia Spa',
        contesto: 'Un server web Ubuntu non risponde correttamente e sospettano modifiche ai nomi host interni.',
        problema: 'Uno junior abituato a Windows cerca `C:\\Windows\\System32\\drivers\\etc\\hosts` e non sa dove cercare su Linux.',
        risoluzione: 'Su Linux il file corrispondente si trova in `/etc/hosts` e i log degli accessi sono in `/var/log/`. Conoscere la struttura FHS permette di diagnosticare il problema in 10 secondi.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Scoprire dove ci si trova ed esplorare le directory di sistema',
          comando: 'pwd && ls -la /etc',
          sintassi: 'pwd ; ls [opzioni] [percorso]',
          outputAtteso: '/home/student\nhosts  passwd',
          spiegazioneOutput: '`pwd` conferma la posizione attuale; `ls` mostra i file di configurazione presenti in `/etc`.',
        },
        {
          titolo: 'Leggere la mappa locale degli host',
          comando: 'cat /etc/hosts',
          sintassi: 'cat <percorso_file>',
          outputAtteso: '127.0.0.1\tlocalhost\n10.10.20.15\tfs01-smb.labcorp.local',
          spiegazioneOutput: 'Il file `/etc/hosts` associa manualmente indirizzi IP a nomi host locali prima di interrogare un DNS.',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Esplorazione della Home e dei file di configurazione',
        descrizione: 'Usa il terminale simulato per navigare tra `/home/student`, `/etc` e `/var/log` e leggere `benvenuto.txt` e `/etc/hosts`.',
        targetLab: 'terminal',
        passi: [
          'Esegui `pwd` e `ls -la` nella tua home.',
          'Leggi il contenuto di `benvenuto.txt` con `cat benvenuto.txt`.',
          'Spostati in `/var/log` con `cd /var/log` ed elenca i file con `ls -l`.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'bash: cd: Documenti: File o directory non esistente',
          causa: 'Linux distingue maiuscole e minuscole (`documenti` ≠ `Documenti`).',
          correzione: 'Verifica il nome esatto con `ls` e usa il tasto Tab per l’autocompletamento.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'File sensibili salvati con permessi globali o modifica non tracciata di `/etc/hosts` e `/etc/passwd`.',
        rischio: 'Un attaccante con accesso locale può reindirizzare traffico interno o individuare gli account di sistema.',
        difesa: [
          'Solo `root` (tramite `sudo`) deve poter modificare i file in `/etc`.',
          'Controlla regolarmente i log in `/var/log/auth.log`.',
        ],
      },
      fase9_verifica: 'Riesci a spiegare la differenza tra `/` (directory radice) e `/root` (home dell’amministratore), e dove si trovano configurazioni e log?',
    },
    quizIniziale: [
      {
        id: 'm2-q1',
        domanda: 'In quale directory Linux si trovano normalmente i file di log di sistema e autenticazione?',
        opzioni: ['/home/logs', '/var/log', '/etc/log', '/bin/var'],
        rispostaCorretta: 1,
        spiegazione: 'La directory `/var/log` contiene i registri variabili come `auth.log` e `syslog`.',
        concettoCollegato: 'File System Linux',
      },
      {
        id: 'm2-q2',
        domanda: 'Quale affermazione è vera sul terminale Linux?',
        opzioni: [
          'Non distingue tra maiuscole e minuscole.',
          'È case-sensitive: `Report.txt` e `report.txt` sono file diversi.',
          'Usa le lettere di unità C:\\ e D:\\ come Windows.',
          'Richiede sempre un’interfaccia grafica per funzionare.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'I file system Linux standard (ext4) sono case-sensitive e usano un unico albero che parte da `/`.',
        concettoCollegato: 'Caratteristiche File System Linux',
      },
    ],
    testFinale: [
      {
        id: 'm2-f1',
        domanda: 'Quale distribuzione nasce specificamente come sistema operativo orientato al Penetration Testing autorizzato?',
        opzioni: ['Windows 11 Home', 'Kali Linux', 'MS-DOS', 'macOS'],
        rispostaCorretta: 1,
        spiegazione: 'Kali Linux è basata su Debian e integra strumenti per security assessment autorizzati.',
        concettoCollegato: 'Distribuzioni Linux',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Introduzione a Linux, distribuzioni principali, funzionamento della shell Bash e mappatura completa delle directory standard.',
        definizioniChiave: [
          { termine: 'Bash', definizione: 'Bourne Again Shell: l’interprete a riga di comando più diffuso su Linux.' },
          { termine: '/etc', definizione: 'Cartella delle configurazioni di sistema (utenti, rete, servizi).' },
          { termine: '/var/log', definizione: 'Archivio dei log di sicurezza (auth.log) e di sistema (syslog).' },
        ],
        spiegazioneApprofondita: [
          'Imparare a muoversi da terminale rende l’amministratore e il pentester autonomi anche su server remoti via SSH privi di interfaccia grafica.',
        ],
        comandiESintassi: [
          { comando: 'pwd', descrizione: 'Stampa il percorso corrente.', esempio: 'pwd' },
          { comando: 'ls -la', descrizione: 'Mostra tutti i file inclusi i nascosti con permessi.', esempio: 'ls -la /etc' },
          { comando: 'cd <dir>', descrizione: 'Cambia directory.', esempio: 'cd /var/log' },
        ],
        rischiESoluzioni: [
          { rischio: 'Lavorare sempre come utente root.', soluzione: 'Operare come utente standard (`student`) ed elevare i privilegi solo quando necessario tramite `sudo`.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'Linux parte da `/` · tutto è organizzato in un albero unico case-sensitive.',
          '`/home` = dati utente · `/etc` = configurazioni · `/var/log` = log.',
          'Usa sempre `sudo` in modo mirato invece di restare loggato come root.',
        ],
        comandiRapidi: [
          { comando: 'pwd', uso: 'Dove sono?' },
          { comando: 'ls -la', uso: 'Cosa c’è qui (inclusi nascosti)?' },
          { comando: 'cat /etc/hosts', uso: 'Leggi un file di configurazione' },
        ],
      },
    },
  },
  {
    id: 3,
    codice: 'MODULO 3',
    titolo: 'Terminale Linux Professionale',
    categoria: 'Fondamenti & Linux',
    competenza: 'Terminale & Amministrazione Linux',
    statoImplementazione: 'completo',
    obiettivo: 'Padroneggiare tutti i 31 comandi essenziali Linux per file, permessi, ricerca nei log, gestione processi e diagnostica di rete.',
    argomenti: [
      'Navigazione e gestione file (pwd, ls, cd, mkdir, touch, cat, cp, mv, rm)',
      'Ricerca e ispezione testo (grep, find, less, head, tail, nano)',
      'Permessi e identità (chmod, chown, sudo, whoami, id)',
      'Processi e servizi (ps, top, kill, systemctl, journalctl)',
      'Rete e connettività (ip, ping, ss, dig, curl, ssh)',
    ],
    laboratorioTitolo: 'Sfida guidata nel Terminale Linux con verifica automatica (5 obiettivi)',
    lezione: {
      fase1_cose:
        'Il terminale professionale non serve a "imparare comandi a memoria", ma a combinare piccoli strumenti specializzati (filosofia Unix): un comando legge un file, un altro filtra le righe sospette (`grep`), un altro controlla i permessi (`chmod`) o le porte aperte (`ss`).',
      fase2_comeFunziona: [
        '1. Gestione file: `mkdir`, `touch`, `cp`, `mv`, `rm` creano e organizzano il lavoro.',
        '2. Ispezione e filtri: `cat`, `head`, `tail`, `grep` estraggono solo ciò che conta da migliaia di righe di log.',
        '3. Permessi Linux (r=4, w=2, x=1): `chmod 600` significa proprietario lettura+scrittura (4+2=6), gruppo nessuno (0), altri nessuno (0).',
        '4. Processi e servizi: `systemctl` controlla i demoni (`ssh`, `apache2`), `journalctl` e `/var/log/auth.log` mostrano cosa hanno registrato.',
        '5. Rete: `ip a` mostra gli IP locali, `ss -tulnp` le porte in ascolto, `dig` il DNS, `curl` gli header HTTP.',
      ],
      fase3_schemaVisivo: {
        title: 'Pipeline Unix: come i comandi collaborano tra loro',
        nodes: [
          { id: 'log', label: '/var/log/auth.log', sublabel: 'File di log grezzo', type: 'storage' },
          { id: 'cat', label: 'cat / grep', sublabel: 'Filtro righe "Failed"', type: 'client' },
          { id: 'ufw', label: 'sudo ufw / chmod', sublabel: 'Azione difensiva', type: 'security' },
          { id: 'ss', label: 'ss -tulnp', sublabel: 'Verifica porte aperte', type: 'network' },
        ],
        flows: [
          { from: 'log', to: 'cat', label: 'Flusso di testo (stdout)' },
          { from: 'cat', to: 'ufw', label: 'IP anomalo identificato' },
          { from: 'ufw', to: 'ss', label: 'Controllo post-intervento' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'E-Commerce Nord Srl',
        contesto: 'Un amministratore trova una chiave SSH privata (`chiave_lab.pem`) nella home con permessi `-rw-r--r--`.',
        problema: 'Con permessi 644 qualsiasi utente locale sul server può leggere la chiave privata; inoltre OpenSSH rifiuta di usarla segnalando "UNPROTECTED PRIVATE KEY FILE".',
        risoluzione: 'Esegue `chmod 600 chiave_lab.pem` e verifica con `ls -l` che compaia `-rw-------`.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Filtrare i tentativi SSH falliti nel log di autenticazione',
          comando: 'grep Failed /var/log/auth.log',
          sintassi: 'grep [-i] [-n] <pattern> <file>',
          outputAtteso: 'Nov 17 14:05:44 kali-lab sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44812 ssh2',
          spiegazioneOutput: 'Isola all’istante le righe con tentativi falliti evidenziando nome utente tentato e IP sorgente.',
        },
        {
          titolo: 'Verificare le porte in ascolto sul sistema',
          comando: 'ss -tulnp',
          sintassi: 'ss -tulnp',
          outputAtteso: 'tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1102,fd=3))',
          spiegazioneOutput: 'Mostra che il processo sshd è in ascolto sulla porta 22/TCP su tutte le interfacce (`0.0.0.0`).',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Completa i 5 obiettivi pratici nel Terminale Linux',
        descrizione: 'Apri il Terminale Linux (tab "Terminale & Riferimento Comandi" qui sotto o dal pulsante in alto) e completa tutti e 5 gli obiettivi verificati automaticamente.',
        targetLab: 'terminal',
        passi: [
          'Crea la directory `audit_lab` con `mkdir audit_lab`.',
          'Crea e scrivi dentro `audit_lab/report.txt` con `echo "Audit OK" > audit_lab/report.txt`.',
          'Proteggi `chiave_lab.pem` eseguendo `chmod 600 chiave_lab.pem`.',
          'Cerca gli errori SSH con `grep Failed /var/log/auth.log`.',
          'Scansiona il file server del lab con `nmap 10.10.20.15` o `smbclient -L //10.10.20.15 -U auditor`.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'chmod: cambio dei permessi non autorizzato / file non trovato',
          causa: 'Stai eseguendo `chmod` da una directory diversa rispetto a quella dove si trova il file.',
          correzione: 'Controlla la posizione con `pwd` ed elenca i file con `ls -l` prima di applicare `chmod`.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Uso improprio di `chmod 777` per risolvere errori di permesso.',
        rischio: 'Consente a qualunque utente locale di leggere, alterare o eseguire file critici o script eseguiti da root.',
        difesa: [
          'Applica sempre il permesso minimo necessario: `600` per chiavi/segreti, `644` per file leggibili, `755` per script pubblici.',
          'Verifica proprietario e gruppo con `ls -l` e `chown`.',
        ],
      },
      fase9_verifica: 'Consulta il dizionario interattivo dei 31 comandi associato a questo modulo e completa tutte e 5 le verifiche nel terminale simulato.',
    },
    quizIniziale: [
      {
        id: 'm3-q1',
        domanda: 'Che permessi rappresenta il codice ottale `chmod 600` su un file?',
        opzioni: [
          'Lettura, scrittura ed esecuzione per tutti.',
          'Lettura e scrittura solo per il proprietario (`-rw-------`), nessun accesso per gruppo e altri.',
          'Solo esecuzione per il gruppo.',
          'Sola lettura per tutti gli utenti.',
        ],
        rispostaCorretta: 1,
        spiegazione: '6 = 4 (read) + 2 (write) per il proprietario; 0 e 0 negano ogni accesso a gruppo e altri utenti.',
        concettoCollegato: 'Permessi Ottali Linux',
      },
      {
        id: 'm3-q2',
        domanda: 'Quale comando ispeziona le porte TCP/UDP attualmente aperte in ascolto sul tuo sistema Linux?',
        opzioni: ['ss -tulnp', 'mkdir -p', 'whoami', 'touch'],
        rispostaCorretta: 0,
        spiegazione: 'ss -tulnp mostra i socket TCP/UDP in ascolto con porte numeriche e processo proprietario.',
        concettoCollegato: 'Analisi Rete Linux',
      },
    ],
    testFinale: [
      {
        id: 'm3-f1',
        domanda: 'Quale comando filtra tutte le righe contenenti "Failed" dentro `/var/log/auth.log` ignorando maiuscole/minuscole?',
        opzioni: [
          'grep -i Failed /var/log/auth.log',
          'rm -r Failed /var/log/auth.log',
          'chmod -i Failed /var/log/auth.log',
          'ping Failed /var/log/auth.log',
        ],
        rispostaCorretta: 0,
        spiegazione: 'grep con il flag -i esegue una ricerca case-insensitive nel file indicato.',
        concettoCollegato: 'Analisi Log con grep',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Guida completa ai 31 comandi fondamentali Linux per navigazione, permessi, analisi log, processi, systemd e diagnostica di rete.',
        definizioniChiave: [
          { termine: 'Permessi rwx', definizione: 'r (Read=4), w (Write=2), x (Execute=1) applicati a User, Group, Others.' },
          { termine: 'Pipe (|)', definizione: 'Invia l’output di un comando come input al comando successivo (es. cat log | grep Failed).' },
        ],
        spiegazioneApprofondita: [
          'Tutti i 31 comandi sono documentati nella scheda "Dizionario 31 Comandi" di questo modulo con sintassi, opzioni, output previsto ed errori comuni.',
        ],
        comandiESintassi: [
          { comando: 'chmod 600 <file>', descrizione: 'Protegge chiavi private e credenziali.', esempio: 'chmod 600 chiave_lab.pem' },
          { comando: 'grep -in <pattern> <file>', descrizione: 'Cerca nei log mostrando il numero di riga.', esempio: 'grep -in failed /var/log/auth.log' },
          { comando: 'ss -tulnp', descrizione: 'Mostra servizi esposti su porte TCP/UDP.', esempio: 'ss -tulnp' },
        ],
        rischiESoluzioni: [
          { rischio: 'Eseguire `rm -rf` o `chmod 777` senza verificare `pwd`.', soluzione: 'Verificare sempre percorso corrente e lista file prima di modificare permessi o cancellare.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'File: pwd, ls -la, cd, mkdir, touch, cat, cp, mv, rm.',
          'Log & Ricerca: grep, find, head, tail, less.',
          'Sicurezza & Rete: chmod 600, sudo, whoami, id, ps, systemctl, journalctl, ip a, ss -tulnp, dig, curl.',
        ],
        comandiRapidi: [
          { comando: 'grep Failed /var/log/auth.log', uso: 'Trova intrusioni SSH' },
          { comando: 'chmod 600 file', uso: 'Restringi accesso al solo proprietario' },
          { comando: 'ss -tulnp', uso: 'Controlla porte aperte' },
        ],
      },
    },
  },
  {
    id: 7,
    codice: 'MODULO 7',
    titolo: 'Kali Linux',
    categoria: 'Kali & Assessment',
    competenza: 'Kali Linux & Enumeration',
    statoImplementazione: 'completo',
    obiettivo: 'Comprendere cos’è Kali Linux, come installarlo in ambiente isolato e come usare in modo etico e autorizzato Nmap, Wireshark, Burp Suite e OWASP ZAP.',
    argomenti: [
      'Cos’è Kali Linux e quando si utilizza',
      'Installazione sicura in VirtualBox',
      'Aggiornamenti (apt update/upgrade)',
      'Nmap (Scoperta host e servizi)',
      'Wireshark (Analisi pacchetti)',
      'Burp Suite & OWASP ZAP (Sicurezza Web)',
      'Limiti legali e Rules of Engagement',
    ],
    laboratorioTitolo: 'Ricognizione autorizzata su rete isolata con Nmap dal Terminale',
    lezione: {
      fase1_cose:
        'Kali Linux è una distribuzione basata su Debian mantenuta da OffSec che raccoglie centinaia di strumenti per Penetration Testing, Digital Forensics e Security Auditing. Non è uno strumento "magico" né rende qualcuno un hacker automatico: è una cassetta degli attrezzi professionale che richiede comprensione delle reti e autorizzazione scritta.',
      fase2_comeFunziona: [
        '1. Nmap (Network Mapper): invia pacchetti mirati per capire quali host sono attivi, quali porte TCP/UDP sono aperte e quali versioni di servizi rispondono.',
        '2. Wireshark: cattura e decodifica i pacchetti di rete su un’interfaccia autorizzata per ispezionare protocolli come DNS, HTTP, TLS e SMB.',
        '3. Burp Suite & OWASP ZAP: fungono da proxy HTTP tra il browser e l’applicazione web di test per individuare vulnerabilità applicative.',
        '4. Regola aurea di utilizzo: ogni scansione attiva produce traffico e log sui sistemi bersaglio; si esegue SOLO verso VM proprie o sistemi espressamente autorizzati nello scope.',
      ],
      fase3_schemaVisivo: {
        title: 'Flusso di lavoro autorizzato con Kali Linux in Lab',
        nodes: [
          { id: 'roe', label: 'Autorizzazione (Scope)', sublabel: 'Subnet 10.10.20.0/24', type: 'security' },
          { id: 'kali', label: 'Kali Linux (10.10.20.10)', sublabel: 'Nmap · smbclient · Wireshark', type: 'client' },
          { id: 'fw', label: 'Firewall / IDS', sublabel: 'Registra connessioni', type: 'network' },
          { id: 'srv', label: 'Target Lab', sublabel: 'FS01-SMB / DC01', type: 'server' },
        ],
        flows: [
          { from: 'roe', to: 'kali', label: 'Perimetro consentito' },
          { from: 'kali', to: 'fw', label: 'Probe Nmap / SMB', protocol: 'TCP SYN' },
          { from: 'fw', to: 'srv', label: 'Se consentito da ACL', protocol: '445/TCP' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Manifattura Veneta Srl',
        contesto: 'Un consulente deve verificare quali porte sono esposte sul nuovo file server prima della messa in produzione.',
        problema: 'L’amministratore pensa sia aperta solo la porta 445 interna, ma dal test risulta aperta anche la vecchia porta 139 NetBIOS con SMBv1 attivo.',
        risoluzione: 'Con una singola scansione autorizzata `nmap -sV 10.10.20.15`, il consulente documenta il servizio obsoleto e lo fa disabilitare prima del go-live.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Scansione porte e servizi su host autorizzato di laboratorio',
          comando: 'nmap -sV 10.10.20.15',
          sintassi: 'nmap [opzioni] <target_autorizzato>',
          outputAtteso: 'PORT     STATE SERVICE VERSION\n139/tcp  open  NetBIOS Session\n445/tcp  open  Microsoft Windows SMB (SMBv1+SMBv3 ATTIVO)',
          spiegazioneOutput: 'STATE=open indica che la porta accetta connessioni; la colonna VERSION segnala la presenza di SMBv1 obsoleto.',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Scansiona DC01 e FS01-SMB dal Terminale Simulato',
        descrizione: 'Usa `nmap` nel terminale integrato sui due server autorizzati del laboratorio (`10.10.20.12` e `10.10.20.15`) e poi prova a chiudere la porta 139 nel Windows Lab per vedere come cambia lo stato da `open` a `filtered`.',
        targetLab: 'terminal',
        passi: [
          'Esegui `nmap 10.10.20.15` nel Terminale Linux.',
          'Esegui `nmap 10.10.20.12` per osservare le porte tipiche di un Domain Controller (53, 88, 389, 445).',
          'Passa a Windows Network Lab, blocca la porta 139 e riesegui `nmap 10.10.20.15` per verificare il cambiamento!',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'Tutte le porte risultano "filtered" anche se il servizio è acceso',
          causa: 'Un firewall (UFW o Windows Firewall) sta scartando silenziosamente i pacchetti sulla porta richiesta.',
          correzione: 'Verifica le regole firewall sull’host target o controlla di trovarti nella subnet consentita.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Scansioni non autorizzate verso IP esterni o uso di Kali senza aggiornamenti e credenziali sicure.',
        rischio: 'Implicazioni legali gravi (accesso abusivo / scansione non autorizzata) e instabilità di servizi fragili.',
        difesa: [
          'Verifica sempre IP e CIDR dello scope prima di premere Invio.',
          'Aggiorna regolarmente Kali (`sudo apt update && sudo apt full-upgrade`) e mantieni isolate le VM.',
        ],
      },
      fase9_verifica: 'Sai distinguere lo scopo di Nmap, Wireshark e Burp Suite e spiegare cosa significa quando Nmap restituisce `open` vs `filtered`?',
    },
    quizIniziale: [
      {
        id: 'm7-q1',
        domanda: 'A cosa serve principalmente lo strumento Wireshark?',
        opzioni: [
          'A formattare i dischi rigidi.',
          'A catturare e analizzare i pacchetti che transitano su una rete autorizzata.',
          'A creare macchine virtuali.',
          'A gestire utenti Active Directory.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Wireshark è uno sniffer/analizzatore di protocolli per ispezionare il traffico di rete frame per frame.',
        concettoCollegato: 'Strumenti Kali Linux',
      },
    ],
    testFinale: [
      {
        id: 'm7-f1',
        domanda: 'Se Nmap riporta una porta come `filtered`, cosa sta accadendo probabilmente?',
        opzioni: [
          'Il servizio risponde con una pagina web.',
          'Un firewall blocca i pacchetti impedendo a Nmap di determinare se la porta sia aperta o chiusa.',
          'Il cavo di rete è scollegato sul tuo PC.',
          'La password è corretta.',
        ],
        rispostaCorretta: 1,
        spiegazione: '`filtered` indica che un filtro di rete/firewall blocca la sonda senza restituire risposta.',
        concettoCollegato: 'Interpretazione Nmap',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Panoramica completa di Kali Linux, preparazione ambiente virtuale e ruolo di Nmap, Wireshark, Burp Suite e OWASP ZAP.',
        definizioniChiave: [
          { termine: 'Nmap', definizione: 'Scanner di rete per host discovery, port scanning e rilevamento versioni servizi.' },
          { termine: 'Wireshark', definizione: 'Analizzatore di pacchetti di rete a livello pacchetto.' },
          { termine: 'Burp Suite / OWASP ZAP', definizione: 'Proxy intercettori per testare la sicurezza di applicazioni HTTP/HTTPS.' },
        ],
        spiegazioneApprofondita: [
          'Nessuno strumento di Kali va usato su sistemi pubblici o reti di terzi senza mandato formale scritto.',
        ],
        comandiESintassi: [
          { comando: 'nmap -sV <ip>', descrizione: 'Scansiona porte e tenta di identificare le versioni.', esempio: 'nmap -sV 10.10.20.15' },
        ],
        rischiESoluzioni: [
          { rischio: 'Lasciare le credenziali predefinite su una VM Kali.', soluzione: 'Cambiare subito password con `passwd` e tenere la VM dietro rete interna VirtualBox.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'Kali = toolbox per test autorizzati, mai su reti esterne.',
          'Nmap (porte/servizi) · Wireshark (traffico) · ZAP/Burp (web).',
        ],
        comandiRapidi: [
          { comando: 'nmap -sV 10.10.20.15', uso: 'Verifica servizi esposti nel lab' },
        ],
      },
    },
  },
  {
    id: 8,
    codice: 'MODULO 8',
    titolo: 'Linux contro Reti Windows: Security Assessment',
    categoria: 'Kali & Assessment',
    competenza: 'Windows & Active Directory',
    statoImplementazione: 'completo',
    obiettivo: 'Imparare a verificare la sicurezza di reti e file server Windows da Linux (SMB, porte 139/445, smbclient, ACL Share + NTFS, log Windows e protezione).',
    argomenti: [
      'Comunicazione Linux ↔ Windows tramite SMB/CIFS',
      'Porte 139 (NetBIOS) e 445 (SMB Direct)',
      'Samba e smbclient su Kali Linux',
      'Permessi di Condivisione (Share) vs Permessi NTFS',
      'Configurazioni errate tipiche (Everyone, Guest, SMBv1)',
      'Analisi Event Viewer Windows (ID 4624, 4625, 5140, 5145)',
      'Protezione e hardening delle condivisioni',
    ],
    laboratorioTitolo: 'Laboratorio Windows File Server SMB (10.10.20.15)',
    lezione: {
      fase1_cose:
        'SMB (Server Message Block) è il protocollo con cui i computer Windows (e i sistemi Linux tramite Samba/`smbclient`) condividono cartelle, file e stampanti in rete sulla porta 445/TCP. Verificare la sicurezza SMB da Kali Linux significa controllare chi può elencare e leggere quelle cartelle e correggere permessi troppo larghi.',
      fase2_comeFunziona: [
        '1. Connessione: un client Linux esegue `smbclient` verso `//10.10.20.15` sulla porta 445/TCP (o la vecchia 139/TCP).',
        '2. Firewall: Windows Firewall decide se l’IP sorgente può raggiungere la porta 445.',
        '3. Autenticazione: il server verifica username e credenziali (o rifiuta l’accesso Guest/Anonimo se disabilitato).',
        '4. Doppia barriera ACL: Windows controlla prima i **Permessi di Condivisione (Share)** e poi i **Permessi NTFS** sulla cartella fisica. Vince SEMPRE la regola più restrittiva tra le due!',
        '5. Logging: ogni tentativo genera un evento in Windows Event Viewer (5140 accesso a share, 4625 login fallito).',
      ],
      fase3_schemaVisivo: {
        title: 'Catena di valutazione di un accesso SMB da Kali Linux a Windows Server',
        nodes: [
          { id: 'kali', label: 'Kali Linux (10.10.20.10)', sublabel: 'smbclient -L //10.10.20.15', type: 'client' },
          { id: 'fw', label: 'Windows Firewall', sublabel: 'Controllo porta 445 / 139', type: 'security' },
          { id: 'share', label: '1° Filtro: Share ACL', sublabel: 'Everyone / Gruppi rete', type: 'network' },
          { id: 'ntfs', label: '2° Filtro: NTFS ACL', sublabel: 'Permessi file system D:\\Shares', type: 'security' },
          { id: 'disk', label: 'Cartella & Log 5140', sublabel: 'Esito: CONSENTITO / NEGATO', type: 'server' },
        ],
        flows: [
          { from: 'kali', to: 'fw', label: 'Richiesta TCP', protocol: '445/TCP' },
          { from: 'fw', to: 'share', label: 'Se porta aperta', protocol: 'SMB2/3' },
          { from: 'share', to: 'ntfs', label: 'Intersezione minima', protocol: 'ACL Check' },
          { from: 'ntfs', to: 'disk', label: 'Accesso & Audit Event', protocol: 'Event 5140' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Logistica Adriatica Srl',
        contesto: 'Un reparto IT crea la cartella condivisa `Backup_IT` su Windows Server lasciando `Everyone: Lettura` nelle Share Permissions per comodità durante una migrazione.',
        problema: 'Qualsiasi utente (o addirittura un account Guest) connesso alla rete riesce a elencare e scaricare gli script di configurazione IT da Kali o da qualsiasi PC infetto.',
        risoluzione: 'L’auditor individua la share con `smbclient`, rimuove `Everyone`, lascia solo `IT_Admins`, disabilita SMBv1 e attiva SMB Signing.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Elencare le cartelle condivise esposte dal file server',
          comando: 'smbclient -L //10.10.20.15 -U auditor',
          sintassi: 'smbclient -L //<IP_server> -U <utente>',
          outputAtteso: 'Public       Disk  [ACCESSIBILE: READ]\nBackup_IT    Disk  [ACCESSIBILE: READ]  (PROBLEMA!)\nHR_Riservati Disk  [ACCESSIBILE: READ]  (PROBLEMA!)',
          spiegazioneOutput: 'L’account `auditor` (un semplice Domain User) vede e può leggere `HR_Riservati` e `Backup_IT` per colpa di permessi eccessivi.',
        },
        {
          titolo: 'Accedere a una singola cartella condivisa per verificare cosa è esposto',
          comando: 'smbclient //10.10.20.15/Backup_IT -U guest_user',
          sintassi: 'smbclient //<IP>/<Share> -U <utente>',
          outputAtteso: 'Connesso a //10.10.20.15/Backup_IT come guest_user (READ):\n  deploy_script_template.ps1\n  backup_config_lab.xml',
          spiegazioneOutput: 'Dimostra la gravità: persino `guest_user` riesce ad accedere perché `Everyone` è presente sia su Share sia su NTFS.',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Risolvi tutte le vulnerabilità in Windows Network Lab',
        descrizione: 'Usa la sezione Windows Network Lab per ispezionare il flusso di autorizzazione, rimuovere i permessi eccessivi su `Backup_IT` e `HR_Riservati`, disabilitare SMBv1/Guest, attivare SMB Signing e verificare da Terminale Linux che `guest_user` venga bloccato.',
        targetLab: 'windows',
        passi: [
          'Apri Windows Network Lab e testa l’accesso di `guest_user` su `Backup_IT`.',
          'Rimuovi `Everyone` da `Backup_IT` (Share e NTFS) e `Domain Users` da `HR_Riservati`.',
          'Disabilita SMBv1 e account Guest, attiva SMB Signing e blocca la porta 139 nel firewall.',
          'Esegui la Verifica Automatica del Lab e conferma anche via terminale con `smbclient //10.10.20.15/Backup_IT -U guest_user`.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'Ho tolto Everyone da NTFS, ma perché non basta o viceversa?',
          causa: 'Molti sistemisti modificano solo la scheda "Condivisione" lasciando NTFS aperto (o viceversa). Se un utente accede in locale ignora la Share ACL; se accede da rete è sempre bene proteggere entrambi i livelli.',
          correzione: 'Imposta permessi restrittivi sia sulle Share Permissions sia sulle NTFS Permissions.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'SMBv1 attivo + SMB Signing disabilitato + permessi Everyone/Domain Users su cartelle critiche.',
        rischio: 'Esposizione di dati riservati, ransomware su condivisioni scrivibili e attacchi di relay SMB se manca la firma dei pacchetti.',
        difesa: [
          'Disabilita SMBv1 e blocca la porta 139.',
          'Abilita SMB Signing obbligatorio.',
          'Applica il principio del minimo privilegio su Share + NTFS e monitora Event ID 5140/5145.',
        ],
      },
      fase9_verifica: 'Riesci a spiegare perché se Share = FULL e NTFS = READ l’accesso effettivo da rete è READ?',
    },
    quizIniziale: [
      {
        id: 'm8-q1',
        domanda: 'Su quale porta TCP opera modernamente il protocollo SMB (Direct Host)?',
        opzioni: ['Porta 22', 'Porta 80', 'Porta 445', 'Porta 3389'],
        rispostaCorretta: 2,
        spiegazione: 'SMB moderno comunica direttamente su TCP/445 (mentre 139 era legata al vecchio NetBIOS).',
        concettoCollegato: 'Porte SMB',
      },
      {
        id: 'm8-q2',
        domanda: 'Un utente ha Share Permission = CHANGE e NTFS Permission = READ su una cartella. Cosa può fare accedendo via rete?',
        opzioni: ['Cancellare tutti i file', 'Solo leggere (READ)', 'Modificare le password del server', 'Nulla (accesso negato)'],
        rispostaCorretta: 1,
        spiegazione: 'Vince la combinazione più restrittiva tra Share e NTFS: tra CHANGE e READ prevale READ.',
        concettoCollegato: 'Intersezione ACL Windows',
      },
    ],
    testFinale: [
      {
        id: 'm8-f1',
        domanda: 'Quale comando Linux elenca le condivisioni disponibili su un file server Windows 10.10.20.15?',
        opzioni: [
          'smbclient -L //10.10.20.15 -U auditor',
          'chmod -L 10.10.20.15',
          'cat //10.10.20.15',
          'mkdir smbclient',
        ],
        rispostaCorretta: 0,
        spiegazione: 'Il flag -L di smbclient interroga il server remoto per elencare le condivisioni esposte.',
        concettoCollegato: 'Enumerazione SMB da Linux',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Analisi e messa in sicurezza di reti Windows da Kali Linux tramite protocollo SMB, valutazione doppia ACL e analisi Event Viewer.',
        definizioniChiave: [
          { termine: 'SMB (Server Message Block)', definizione: 'Protocollo di condivisione file e risorse di rete su porta 445/TCP.' },
          { termine: 'SMB Signing', definizione: 'Firma crittografica dei pacchetti SMB per impedire alterazioni o attacchi relay.' },
        ],
        spiegazioneApprofondita: [
          'L’auditor verifica sempre le condivisioni esposte con account non privilegiati per scoprire se dati IT, Finanza o HR sono accessibili impropriamente.',
        ],
        comandiESintassi: [
          { comando: 'smbclient -L //<ip> -U <user>', descrizione: 'Elenca le condivisioni SMB.', esempio: 'smbclient -L //10.10.20.15 -U auditor' },
          { comando: 'smbclient //<ip>/<share> -U <user>', descrizione: 'Apre una sessione verso una share.', esempio: 'smbclient //10.10.20.15/Public -U auditor' },
        ],
        rischiESoluzioni: [
          { rischio: 'SMBv1 attivo e gruppo Everyone sulle share.', soluzione: 'Disabilitare SMBv1, bloccare porta 139, rimuovere Everyone e abilitare SMB Signing.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'SMB usa porta 445/TCP (disabilita SMBv1 e porta 139).',
          'Accesso effettivo = MIN(Share ACL, NTFS ACL).',
          'Log Windows chiave: 5140 (accesso share), 4625 (login fallito).',
        ],
        comandiRapidi: [
          { comando: 'smbclient -L //10.10.20.15 -U auditor', uso: 'Lista condivisioni' },
          { comando: 'nmap -sV 10.10.20.15', uso: 'Verifica porte 139/445' },
        ],
      },
    },
  },
  {
    id: 12,
    codice: 'MODULO 12',
    titolo: 'Reti Wi-Fi da Zero',
    categoria: 'Wi-Fi & Credenziali',
    competenza: 'Wi-Fi Security',
    statoImplementazione: 'completo',
    obiettivo: 'Capire a fondo IEEE 802.11, Access Point, SSID, BSSID, MAC, frequenze 2.4/5 GHz, associazione, autenticazione e reti guest isolate.',
    argomenti: [
      'Standard IEEE 802.11',
      'Access Point vs Router Wireless',
      'SSID, BSSID e MAC Address',
      'Frequenze (2.4 GHz, 5 GHz) e Canali',
      'Fasi di Scansione, Autenticazione e Associazione',
      'Reti Aperte, Captive Portal, Wi-Fi Aziendali e Guest',
      'Isolamento dei Client (AP Isolation)',
    ],
    laboratorioTitolo: 'Simulatore animato 802.11 e topologia Client/AP nel Wi-Fi Security Lab',
    lezione: {
      fase1_cose:
        'Una rete Wi-Fi (standard IEEE 802.11) trasmette i dati tramite onde radio tra un dispositivo (Client / Station) e una stazione base chiamata Access Point (AP). Poiché le onde radio viaggiano nell’aria e non dentro un cavo chiuso, chiunque si trovi nel raggio di copertura può ricevere i segnali radio: per questo la sicurezza wireless è vitale.',
      fase2_comeFunziona: [
        '1. Beacon Frame: l’Access Point annuncia continuamente la propria presenza trasmettendo il nome della rete (`SSID`) e il proprio indirizzo fisico (`BSSID`, cioè il MAC della radio AP).',
        '2. Probe & Scan: il tuo PC/smartphone ascolta i Beacon o invia una richiesta per trovare le reti vicine sul canale radio (2.4 GHz o 5 GHz).',
        '3. Autenticazione & Associazione: prima di scambiare traffico IP, dispositivo e AP eseguono la negoziazione 802.11 (aperta o cifrata con WPA2/WPA3).',
        '4. Reti Guest & Client Isolation: nelle reti aziendali serie, gli ospiti ricevono un SSID separato su VLAN isolata e con `Client Isolation` attivo, così un ospite non può comunicare né con altri ospiti né con i server interni.',
      ],
      fase3_schemaVisivo: {
        title: 'Sequenza di connessione IEEE 802.11 (Scansione → Associazione → Dati)',
        nodes: [
          { id: 'sta', label: 'Dispositivo Client (STA)', sublabel: 'MAC: 08:00:27:4A:19:B2', type: 'client' },
          { id: 'ap', label: 'Access Point (BSSID)', sublabel: 'SSID: LabCorp-Secure · Ch 36', type: 'network' },
          { id: 'ctrl', label: 'Controllo Isolamento & VLAN', sublabel: 'Principale vs Guest', type: 'security' },
          { id: 'lan', label: 'LAN / Server Interni', sublabel: '10.10.20.0/24', type: 'server' },
        ],
        flows: [
          { from: 'ap', to: 'sta', label: '1. Beacon Frame (SSID/Capacità)', protocol: '802.11 Mgmt' },
          { from: 'sta', to: 'ap', label: '2. Auth & Association Request', protocol: '802.11 Auth' },
          { from: 'ap', to: 'ctrl', label: '3. Verifica Policy SSID', protocol: 'VLAN Tag' },
          { from: 'ctrl', to: 'lan', label: 'Solo se autorizzato', protocol: 'IP Traffic' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Studio Medico San Marco',
        contesto: 'La sala d’attesa offre un Wi-Fi "Pazienti_Free" collegato sullo stesso router della segreteria senza separazione.',
        problema: 'Un ospite connesso alla rete pazienti si trova nella stessa subnet dei PC di segreteria e del server cartelle cliniche.',
        risoluzione: 'Si crea un secondo SSID Guest isolato su VLAN separata con Client Isolation attivo e regole firewall che bloccano ogni pacchetto verso la LAN medica.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Osservare gli stati di raggiungibilità nel simulatore Wi-Fi',
          comando: 'Wi-Fi Security Lab → Sequenza 802.11 & Tabella Client',
          sintassi: 'Client Isolation OFF vs ON | Guest VLAN Isolata OFF vs ON',
          outputAtteso: 'OSPITE-MOBILE-SIM: Raggiunge Peer = NO (Isolato) | Raggiunge LAN Interna = NO (Bloccato)',
          spiegazioneOutput: 'Con entrambi gli isolamenti attivi, un dispositivo ospite può navigare solo verso Internet senza vedere altri dispositivi.',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Simula l’associazione 802.11 e isola i client Guest',
        descrizione: 'Apri il Wi-Fi Security Lab, osserva l’animazione passo-passo di associazione 802.11 e attiva `Isolamento Client` e `Isolamento Rete Guest da LAN` osservando come cambia la tabella dei dispositivi connessi.',
        targetLab: 'wifi',
        passi: [
          'Apri la sezione Wi-Fi Security Lab.',
          'Avvia la visualizzazione animata del processo di associazione 802.11.',
          'Attiva `Isolamento Client` e verifica nella lista dispositivi che `Comunicazione tra Peer` passi da Consentita a Bloccata.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'Ho attivato "Nascondi SSID" pensando di rendere invisibile la rete',
          causa: 'I dispositivi già configurati trasmettono comunque il nome della rete nei Probe Request per cercarla ovunque vadano.',
          correzione: 'Lascia l’SSID visibile ma proteggi la rete con WPA3/WPA2 robusto e segmentazione VLAN.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Reti wireless piatte senza isolamento dei client e senza separazione tra rete aziendale e rete ospiti.',
        rischio: 'Movimento laterale da un dispositivo ospite verso workstation e server interni.',
        difesa: [
          'Abilita sempre Client Isolation su reti Guest/Pubbliche.',
          'Separa la rete Guest tramite VLAN dedicata e firewall.',
        ],
      },
      fase9_verifica: 'Sai distinguere SSID da BSSID e spiegare perché `Client Isolation` non basta da solo se la rete Guest non è separata dalla LAN?',
    },
    quizIniziale: [
      {
        id: 'm12-q1',
        domanda: 'Che differenza c’è tra SSID e BSSID in una rete Wi-Fi?',
        opzioni: [
          'Sono sinonimi della password Wi-Fi.',
          'L’SSID è il nome leggibile della rete; il BSSID è l’indirizzo MAC fisico della radio dell’Access Point.',
          'L’SSID è sempre un indirizzo IPv6.',
          'Il BSSID è visibile solo su Windows.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Più Access Point aziendali possono trasmettere lo stesso SSID (nome rete), ma ciascuno ha un BSSID (MAC) distinto.',
        concettoCollegato: 'SSID e BSSID',
      },
    ],
    testFinale: [
      {
        id: 'm12-f1',
        domanda: 'Cosa impedisce concretamente l’opzione "Client Isolation" su un Access Point?',
        opzioni: [
          'Impedisce ai dispositivi di collegarsi a Internet.',
          'Impedisce ai dispositivi wireless connessi allo stesso AP di comunicare direttamente tra loro (peer-to-peer).',
          'Disabilita il modulo Wi-Fi del router.',
          'Raddoppia la potenza dell’antenna.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Client Isolation blocca il traffico diretto tra stazioni sullo stesso AP, contrastando scansioni locali e ARP spoofing.',
        concettoCollegato: 'Isolamento dei Client',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Architettura delle reti wireless IEEE 802.11: frequenze, identificativi, fasi di associazione e isolamento di rete.',
        definizioniChiave: [
          { termine: 'SSID', definizione: 'Nome pubblico della rete wireless annunciato nei frame Beacon.' },
          { termine: 'BSSID', definizione: 'Indirizzo MAC della scheda radio dell’Access Point.' },
          { termine: 'Client Isolation', definizione: 'Meccanismo AP che impedisce ai client collegati di scambiarsi pacchetti direttamente.' },
        ],
        spiegazioneApprofondita: [
          'Comprendere che il mezzo trasmissivo è condiviso (radio) spiega perché isolamento e cifratura siano imprescindibili.',
        ],
        comandiESintassi: [],
        rischiESoluzioni: [
          { rischio: 'Rete Guest collegata alla stessa LAN dei server.', soluzione: 'Segmentazione VLAN + regole firewall di blocco verso la subnet interna.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'SSID = nome rete · BSSID = MAC dell’AP.',
          'Fasi 802.11: Beacon/Probe → Autenticazione → Associazione → Dati.',
          'Rete Guest sempre con Client Isolation + VLAN isolata.',
        ],
        comandiRapidi: [],
      },
    },
  },
  {
    id: 13,
    codice: 'MODULO 13',
    titolo: 'Wi-Fi Security: WPA2, WPA3 e Password',
    categoria: 'Wi-Fi & Credenziali',
    competenza: 'Wi-Fi Security',
    statoImplementazione: 'completo',
    obiettivo: 'Analizzare in profondità WEP, WPA, WPA2-PSK, WPA3-SAE, 802.1X, 4-Way Handshake, WPS, PMF, verifica offline vs online e hardening router.',
    argomenti: [
      'Evoluzione WEP → WPA → WPA2 → WPA3 → WPA-Enterprise (802.1X)',
      'Derivazione delle chiavi e 4-Way Handshake',
      'Verifica Offline vs Autenticazione Online',
      'Debolezza di WPS e difesa tramite PMF (802.11w)',
      'Audit offline didattico su password di prova sintetiche',
      'Verifica non distruttiva della sicurezza del router personale',
    ],
    laboratorioTitolo: 'Laboratorio Wi-Fi Password Security & Audit Dizionario Sintetico',
    lezione: {
      fase1_cose:
        'La sicurezza di una rete Wi-Fi protetta dipende da due pilastri: il protocollo crittografico usato (es. WPA2 vs WPA3) e la robustezza della passphrase o del sistema di autenticazione (Enterprise 802.1X). Protocolli vecchi come WEP o funzioni come WPS hanno difetti strutturali che rendono inutile persino una buona password.',
      fase2_comeFunziona: [
        '1. WEP (obsoleto): usa cifratura RC4 rotta matematicamente; è insicuro e non va mai usato.',
        '2. WPA2-Personal (PSK): quando un client si connette, avviene il "4-Way Handshake" per verificare che entrambi conoscano la passphrase senza inviarla in chiaro. Tuttavia, un attaccante che osserva quei 4 messaggi può provare offline milioni di password sul proprio computer (Audit Offline).',
        '3. WPA3-Personal (SAE - Simultaneous Authentication of Equals): sostituisce il vecchio handshake con un protocollo interattivo resistente al cracking offline. Ogni tentativo richiede uno scambio in diretta con l’AP (Verifica Online), molto più lento e bloccabile.',
        '4. WPA-Enterprise (802.1X): in azienda non si usa una password unica condivisa tra tutti, ma credenziali individuali o certificati verificati da un server RADIUS.',
        '5. WPS & PMF: WPS permette di accedere tramite un PIN a 8 cifre vulnerabile a brute-force rapido (va spento); PMF (802.11w) protegge i frame di gestione da disconnessioni forzate.',
      ],
      fase3_schemaVisivo: {
        title: 'Confronto critico: WPA2-PSK (Audit Offline) vs WPA3-SAE (Anti-Offline)',
        nodes: [
          { id: 'wpa2', label: 'WPA2-PSK (4-Way Handshake)', sublabel: 'PBKDF2 · Verifica offline possibile', type: 'network' },
          { id: 'dict', label: 'Audit Dizionario Sintetico', sublabel: 'Password debole trovata in <1s', type: 'security' },
          { id: 'wpa3', label: 'WPA3-SAE (Dragonfly)', sublabel: 'Anti-offline + PMF obbligatorio', type: 'server' },
          { id: 'ent', label: 'WPA-Enterprise (802.1X)', sublabel: 'Credenziali individuali RADIUS', type: 'client' },
        ],
        flows: [
          { from: 'wpa2', to: 'dict', label: 'Se passphrase corta/comune', protocol: 'Offline Check' },
          { from: 'dict', to: 'wpa3', label: 'Mitigazione protocollo', protocol: 'SAE' },
          { from: 'wpa3', to: 'ent', label: 'Livello aziendale', protocol: 'RADIUS' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Consulenza Studio Beta',
        contesto: 'L’azienda usa WPA2-PSK con la password `azienda123` scritta su un post-it alla reception e il tasto WPS attivo sul router.',
        problema: 'Chiunque si sia mai collegato conosce la stessa chiave; inoltre una verifica di laboratorio mostra che `azienda123` è presente nei dizionari standard e WPS riduce l’entropia a poche migliaia di PIN.',
        risoluzione: 'Passano a WPA3-SAE (o WPA2/WPA3 misto con passphrase casuale da 20 caratteri per la LAN interna), disabilitano WPS, attivano PMF e isolano gli ospiti su SSID Guest separato.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Simulazione audit offline su dizionario sintetico di laboratorio',
          comando: 'Wi-Fi Security Lab → Avvia Audit Dizionario (su passphrase di prova)',
          sintassi: 'Passphrase: "password123" vs "N7!mK9#vQ2$xP4@zL8&tW3"',
          outputAtteso: '[VULNERABILE] "password123" individuata nel dizionario di prova. Punteggio AP: 22/100 (CRITICO).',
          spiegazioneOutput: 'Con WPA2 e una passphrase comune, l’audit offline trova subito la corrispondenza. Passando a WPA3-SAE e 20+ caratteri casuali il punteggio sale a 100/100 (ROBUSTO).',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Metti in sicurezza l’Access Point del Wi-Fi Security Lab',
        descrizione: 'Apri il Wi-Fi Security Lab, esegui l’audit sulla configurazione debole iniziale, poi applica tutte le contromisure fino a superare la verifica automatica al 100%.',
        targetLab: 'wifi',
        passi: [
          'Carica il preset "Debole (WPA2 + WPS)" ed esegui l’Audit Dizionario Sintetico.',
          'Passa a `WPA3-SAE` (oppure `WPA2-PSK` con passphrase >= 16 caratteri ad alta entropia).',
          'Disabilita `WPS`, attiva `PMF (802.11w)`, `Client Isolation`, `Isolamento Rete Guest`, aggiorna il firmware virtuale, cambia password admin e disattiva UPnP.',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'Ho impostato una password fortissima di 20 caratteri, ma ho lasciato WPS attivo',
          causa: 'Il PIN WPS aggira completamente la complessità della passphrase WPA2 permettendo al router di rivelarla se il PIN viene indovinato.',
          correzione: 'Disabilita sempre WPS dal pannello del router.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Uso di WEP/WPA1, passphrase prevedibili su WPA2, WPS attivo, firmware obsoleto e password pannello router predefinita.',
        rischio: 'Accesso non autorizzato alla rete wireless, esposizione del traffico locale e compromissione amministrativa del router stesso.',
        difesa: [
          'Usa WPA3-SAE (o WPA2-AES con passphrase casuale >= 16 caratteri) e 802.1X in azienda.',
          'Disabilita WPS e UPnP, attiva PMF e aggiorna regolarmente il firmware del router.',
        ],
      },
      fase9_verifica: 'Sai spiegare la differenza tra verifica offline di una password WPA2 e protezione anti-offline introdotta da WPA3-SAE?',
    },
    quizIniziale: [
      {
        id: 'm13-q1',
        domanda: 'Perché WPS (Wi-Fi Protected Setup con PIN) è considerato un rischio di sicurezza?',
        opzioni: [
          'Perché rallenta la velocità in download.',
          'Perché il PIN a 8 cifre è verificabile in due blocchi separati, riducendo drasticamente le combinazioni da testare e aggirando la passphrase.',
          'Perché funziona solo su cavi Ethernet.',
          'Perché disattiva la porta USB.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Il protocollo PIN WPS valida prima le prime 4 cifre e poi le successive 3 (+1 checksum), rendendolo vulnerabile.',
        concettoCollegato: 'Vulnerabilità WPS',
      },
    ],
    testFinale: [
      {
        id: 'm13-f1',
        domanda: 'Quale opzione protegge i frame di gestione Wi-Fi (es. richieste di disconnessione falsificate)?',
        opzioni: ['UPnP', 'PMF (Protected Management Frames / 802.11w)', 'WEP', 'Telnet'],
        rispostaCorretta: 1,
        spiegazione: '802.11w / PMF aggiunge integrità e autenticazione ai frame di gestione wireless.',
        concettoCollegato: 'PMF 802.11w',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Analisi tecnica di WEP, WPA, WPA2, WPA3, 802.1X, auditing offline delle credenziali e guida non distruttiva alla messa in sicurezza di un router.',
        definizioniChiave: [
          { termine: '4-Way Handshake', definizione: 'Scambio di 4 messaggi EAPOL usato in WPA2 per derivare le chiavi di sessione e verificare la conoscenza della PSK.' },
          { termine: 'SAE (Dragonfly)', definizione: 'Protocollo di scambio chiavi di WPA3 che impedisce attacchi a dizionario offline.' },
        ],
        spiegazioneApprofondita: [
          'Verifica sempre in modo non distruttivo sul tuo router personale: protocollo attivo, disattivazione WPS/UPnP, cambio password admin e stato aggiornamenti firmware.',
        ],
        comandiESintassi: [],
        rischiESoluzioni: [
          { rischio: 'Passphrase corta su WPA2-PSK.', soluzione: 'Migrazione a WPA3-SAE o passphrase >= 16 caratteri casuali.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'WEP/WPS = da disattivare sempre · WPA2-AES = minimo accettabile con pass >= 16 char · WPA3-SAE = raccomandato.',
          'PMF (802.11w) protegge da deauth spoofing.',
          'In azienda usare WPA-Enterprise (802.1X / RADIUS).',
        ],
        comandiRapidi: [],
      },
    },
  },
  {
    id: 15,
    codice: 'MODULO 15',
    titolo: 'Password Auditing e Sicurezza delle Credenziali',
    categoria: 'Wi-Fi & Credenziali',
    competenza: 'Password & Credential Security',
    statoImplementazione: 'completo',
    obiettivo: 'Comprendere hashing, salt, KDF lenti (bcrypt, Argon2id), password manager, MFA, Passkey e difese da brute-force, dictionary, password spraying e credential stuffing.',
    argomenti: [
      'Password Hashing vs Cifratura',
      'Importanza del Salt crittografico',
      'Algoritmi veloci (MD5, SHA-256, NTLM) vs KDF lenti (bcrypt, Argon2id)',
      'Password Manager, MFA e Passkey (FIDO2)',
      'Brute Force, Dictionary, Password Spraying e Credential Stuffing',
      'Rate Limiting, Account Lockout e Policy Windows/Linux',
    ],
    laboratorioTitolo: 'Laboratorio Password Audit su archivio sintetico controllato',
    lezione: {
      fase1_cose:
        'Un sistema informatico sicuro non salva mai le password in chiaro: le trasforma tramite una funzione matematica a senso unico chiamata Hash (es. Argon2id o bcrypt) unita a un valore casuale chiamato Salt. L’auditing delle password valuta quanto sia resistente questo intero meccanismo contro tentativi automatici sia offline che online.',
      fase2_comeFunziona: [
        '1. Hashing veloce vs KDF lenti: algoritmi come MD5, SHA-256 o NTLM calcolano miliardi di tentativi al secondo su schede video moderne (rischio altissimo se un database viene violato). Argon2id e bcrypt rallentano volontariamente ogni verifica richiedendo memoria e tempo.',
        '2. Salt univoco: aggiunge caratteri casuali diversi per ogni utente prima dell’hash, rendendo inutili le tabelle precalcolate (Rainbow Tables) e nascondendo se due utenti hanno la stessa password.',
        '3. Attacchi online: il Credential Stuffing riutilizza password rubate da altri siti (difesa: password univoche + MFA); il Password Spraying prova 1–2 password banali come `Estate2026!` su 1000 utenti diversi per evitare il blocco account.',
        '4. Difesa moderna: Password Manager per generare password lunghe e uniche per ogni servizio + MFA / Passkey FIDO2 + Rate Limiting.',
      ],
      fase3_schemaVisivo: {
        title: 'Confronto Pipeline di Protezione Credenziali',
        nodes: [
          { id: 'pwd', label: 'Password Utente', sublabel: 'Lunghezza & Entropia', type: 'client' },
          { id: 'salt', label: 'Salt Casuale Univoco', sublabel: '16 byte random per utente', type: 'network' },
          { id: 'kdf', label: 'Argon2id / bcrypt', sublabel: 'KDF lento memory-hard', type: 'security' },
          { id: 'mfa', label: 'MFA / Passkey + Rate Limit', sublabel: 'Protezione accessi online', type: 'server' },
        ],
        flows: [
          { from: 'pwd', to: 'salt', label: 'Concatenazione' },
          { from: 'salt', to: 'kdf', label: 'Derivazione lenta' },
          { from: 'kdf', to: 'mfa', label: 'Verifica secondo fattore' },
        ],
      },
      fase4_esempioReale: {
        azienda: 'Portale Servizi Civici',
        contesto: 'Un vecchio database salvava le password con `MD5` senza salt e senza limite ai tentativi di login.',
        problema: 'In un’analisi di sicurezza su dati sintetici, l’80% delle password di prova tipo `Password1` o `Estate2026!` viene verificato in meno di un secondo.',
        risoluzione: 'Il team migra l’autenticazione ad `Argon2id` con salt univoco, impone almeno 14 caratteri senza scadenze forzate inutili (che inducono schemi come Stagione+Anno), attiva Rate Limiting e abilita MFA TOTP/Passkey.',
      },
      fase5_dimostrazione: [
        {
          titolo: 'Confronto entropia e resistenza tra `admin123` (MD5) e `K9#vP2$mL8@qR4!z` (Argon2id + MFA)',
          comando: 'Password Audit Lab → Analizzatore Sintetico',
          sintassi: 'Password + Algoritmo Hash + Salt + MFA + Rate Limiting',
          outputAtteso: 'admin123 (MD5): Punteggio 5/100 (Critica) — < 1 sec\nK9#vP2$mL8@qR4!z (Argon2id+MFA): Punteggio 100/100 (Molto Robusta)',
          spiegazioneOutput: 'La sicurezza reale nasce dall’unione tra alta entropia (o passphrase lunga), KDF lento con salt, rate limiting e MFA.',
        },
      ],
      fase6_esercitazione: {
        titolo: 'Auditing dell’archivio sintetico nel Password Audit Lab',
        descrizione: 'Apri il Password Audit Lab, ispeziona le 5 credenziali sintetiche di prova, prova a migliorare una credenziale debole cambiando algoritmo in Argon2id, aggiungendo Salt, MFA e una passphrase robusta, e osserva il ricalcolo in tempo reale.',
        targetLab: 'password',
        passi: [
          'Apri la sezione Password Audit Lab.',
          'Seleziona `lab_webapp_admin` (`admin123`, MD5) e osserva le vulnerabilità segnalate.',
          'Usa il simulatore interattivo per trasformarla in una configurazione sicura (>= 85/100).',
        ],
      },
      fase7_diagnosi: [
        {
          errore: 'Richiedere cambio password ogni 30 giorni con regole rigide (1 maiuscola, 1 numero, 1 simbolo)',
          causa: 'Porta gli utenti a creare pattern prevedibili come `Estate2026!`, `Autunno2026!`, vulnerabili al Password Spraying.',
          correzione: 'Privilegia lunghezza (>= 14–16 caratteri o passphrase), verifica contro liste di password compromesse e attiva MFA.',
        },
      ],
      fase8_sicurezza: {
        vulnerabilita: 'Riutilizzo delle password, hashing veloce senza salt e assenza di MFA.',
        rischio: 'Credential Stuffing automatico e compromissione immediata degli account aziendali.',
        difesa: [
          'Adotta Argon2id o bcrypt con salt casuale.',
          'Abilita MFA / Passkey e Rate Limiting su tutti i punti di login.',
        ],
      },
      fase9_verifica: 'Sai spiegare perché il Salt blocca le Rainbow Table e che differenza c’è tra Password Spraying e Credential Stuffing?',
    },
    quizIniziale: [
      {
        id: 'm15-q1',
        domanda: 'A cosa serve il "Salt" quando si calcola l’hash di una password?',
        opzioni: [
          'A rendere la password più corta.',
          'Ad aggiungere dati casuali univoci per ogni utente, impedendo che due password uguali producano lo stesso hash e neutralizzando le Rainbow Table.',
          'A inviare la password via email.',
          'A sostituire HTTPS.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Il Salt rende unico ogni hash calcolato anche se due utenti scelgono identicamente la stessa password.',
        concettoCollegato: 'Salt Crittografico',
      },
    ],
    testFinale: [
      {
        id: 'm15-f1',
        domanda: 'Cos’è il Password Spraying?',
        opzioni: [
          'Provare milioni di password su un solo account.',
          'Provare poche password molto comuni (es. Estate2026!) su moltissimi account diversi per evitare il blocco account (lockout).',
          'Cancellare il database utenti.',
          'Cifrare i dischi rigidi.',
        ],
        rispostaCorretta: 1,
        spiegazione: 'Il Password Spraying distribuisce pochissimi tentativi per utente, restando sotto la soglia di account lockout.',
        concettoCollegato: 'Password Spraying',
      },
    ],
    dispensa: {
      completa: {
        sommario: 'Gestione sicura delle credenziali, funzioni di hashing moderne, attacchi alle password e strategie difensive aziendali.',
        definizioniChiave: [
          { termine: 'Argon2id', definizione: 'Standard moderno per l’hashing delle password resistente ad hardware parallelo (GPU/ASIC).' },
          { termine: 'Passkey (FIDO2)', definizione: 'Credenziale crittografica senza password legata al dispositivo e resistente al phishing.' },
        ],
        spiegazioneApprofondita: [
          'Tutti gli esercizi nel Password Audit Lab operano esclusivamente su credenziali sintetiche didattiche.',
        ],
        comandiESintassi: [],
        rischiESoluzioni: [
          { rischio: 'Salvataggio con MD5/SHA-256 non salato.', soluzione: 'Migrare ad Argon2id o bcrypt e forzare MFA.' },
        ],
      },
      sintetica: {
        puntiEssenziali: [
          'Lunghezza > complessità artificiale · Password Manager + MFA/Passkey.',
          'Argon2id/bcrypt con salt univoco · Mai MD5 o plaintext.',
          'Rate limiting + monitoraggio contro Password Spraying.',
        ],
        comandiRapidi: [],
      },
    },
  },
];

function enrichCoreModule(mod: AcademyModule): AcademyModule {
  const extra = EXTRA_QUESTIONS_EXISTING_MODULES[mod.id];
  const mergedInitial = [...mod.quizIniziale];
  const mergedFinal = [...mod.testFinale];

  if (extra) {
    for (const q of extra.initial) {
      if (!mergedInitial.some((existing) => existing.id === q.id)) {
        mergedInitial.push(q);
      }
    }
    for (const q of extra.final) {
      if (!mergedFinal.some((existing) => existing.id === q.id)) {
        mergedFinal.push(q);
      }
    }
  }

  return {
    ...mod,
    lezione: mod.lezione
      ? {
          ...mod.lezione,
          prerequisiti: mod.lezione.prerequisiti ?? CORE_PREREQUISITES[mod.id],
        }
      : undefined,
    quizIniziale: mergedInitial,
    testFinale: mergedFinal,
  };
}

export const ACADEMY_MODULES: AcademyModule[] = [
  ...EXISTING_CORE_MODULES.map(enrichCoreModule),
  ...MODULES_PART_A1,
  ...MODULES_PART_A2,
  ...MODULES_PART_B1,
  ...MODULES_PART_B2,
].sort((a, b) => a.id - b.id);

