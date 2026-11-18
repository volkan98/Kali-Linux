import {
  WindowsLabState,
  createInitialWindowsLabState,
  evaluateSmbAccess,
} from './windowsLabEngine';

export interface VfsNode {
  type: 'dir' | 'file';
  permissions: string;
  owner: string;
  group: string;
  content?: string;
  children?: Record<string, VfsNode>;
  size?: number;
}

export interface TerminalServiceState {
  ssh: boolean;
  ufw: boolean;
  ufwAllowSsh: boolean;
  ufwDeny445: boolean;
  apache2: boolean;
}

export interface TerminalState {
  cwd: string;
  user: string;
  hostname: string;
  fs: VfsNode;
  history: string[];
  services: TerminalServiceState;
  executedCommands: string[];
}

export interface TerminalCommandResult {
  output: string;
  clear?: boolean;
  nextState: TerminalState;
}

export interface TerminalObjectiveCheck {
  id: string;
  title: string;
  description: string;
  passed: boolean;
}

export function createInitialTerminalState(): TerminalState {
  return {
    cwd: '/home/student',
    user: 'student',
    hostname: 'kali-lab',
    history: [],
    executedCommands: [],
    services: {
      ssh: true,
      ufw: false,
      ufwAllowSsh: true,
      ufwDeny445: false,
      apache2: false,
    },
    fs: {
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      children: {
        home: {
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            student: {
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'student',
              group: 'student',
              children: {
                'benvenuto.txt': {
                  type: 'file',
                  permissions: '-rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  content:
                    'Benvenuto in CYBER LAB ACADEMY!\nQuesto è un terminale Linux simulato in ambiente isolato.\nObiettivi di laboratorio disponibili nel pannello laterale.\nSubnet di laboratorio autorizzata: 10.10.20.0/24\nHost chiave: 10.10.20.12 (DC01), 10.10.20.15 (FS01-SMB), 10.10.20.25 (WKS-FIN01)\n',
                },
                documenti: {
                  type: 'dir',
                  permissions: 'drwxr-xr-x',
                  owner: 'student',
                  group: 'student',
                  children: {
                    'scope_autorizzato.txt': {
                      type: 'file',
                      permissions: '-rw-r--r--',
                      owner: 'student',
                      group: 'student',
                      content:
                        'RULES OF ENGAGEMENT - AMBIENTE DI TEST\nTarget autorizzati: 10.10.20.10-10.10.20.30\nDivieto assoluto di test verso IP pubblici esterni.\n',
                    },
                  },
                },
                'chiave_lab.pem': {
                  type: 'file',
                  permissions: '-rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  content: '-----BEGIN LAB TEST KEY-----\nCONTENUTO_SIMULATO_PER_ESERCIZIO_CHMOD\n-----END LAB TEST KEY-----\n',
                },
              },
            },
          },
        },
        etc: {
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            hosts: {
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              content:
                '127.0.0.1\tlocalhost\n10.10.20.10\tkali-lab\n10.10.20.12\tdc01.labcorp.local\n10.10.20.15\tfs01-smb.labcorp.local\n10.10.20.25\twks-fin01.labcorp.local\n',
            },
            passwd: {
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              content:
                'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student Lab:/home/student:/bin/bash\nsshd:x:106:65534::/run/sshd:/usr/sbin/nologin\n',
            },
          },
        },
        var: {
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            log: {
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'root',
              group: 'root',
              children: {
                'auth.log': {
                  type: 'file',
                  permissions: '-rw-r-----',
                  owner: 'root',
                  group: 'adm',
                  content: [
                    'Nov 17 14:01:12 kali-lab sshd[1102]: Accepted publickey for student from 10.10.20.25 port 51204 ssh2',
                    'Nov 17 14:05:44 kali-lab sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44812 ssh2',
                    'Nov 17 14:05:46 kali-lab sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44815 ssh2',
                    'Nov 17 14:05:49 kali-lab sshd[1140]: Failed password for root from 198.51.100.44 port 44820 ssh2',
                    'Nov 17 14:05:52 kali-lab sshd[1140]: Failed password for root from 198.51.100.44 port 44829 ssh2',
                    'Nov 17 14:09:10 kali-lab sudo:  student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/usr/sbin/ufw status',
                  ].join('\n') + '\n',
                },
                'syslog': {
                  type: 'file',
                  permissions: '-rw-r-----',
                  owner: 'root',
                  group: 'adm',
                  content:
                    'Nov 17 14:00:01 kali-lab systemd[1]: Started OpenBSD Secure Shell server.\nNov 17 14:02:18 kali-lab kernel: [UFW AUDIT] Lab network interface eth0 up (10.10.20.10/24)\n',
                },
              },
            },
          },
        },
      },
    },
  };
}

function cloneFs(node: VfsNode): VfsNode {
  return {
    ...node,
    children: node.children
      ? Object.fromEntries(Object.entries(node.children).map(([k, v]) => [k, cloneFs(v)]))
      : undefined,
  };
}

export function resolvePath(cwd: string, inputPath: string, home = '/home/student'): string {
  if (!inputPath || inputPath === '~') return home;
  let target = inputPath;
  if (target.startsWith('~/')) {
    target = home + target.slice(1);
  }
  const combined = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`;
  const parts = combined.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return '/' + stack.join('/');
}

function getNodeAt(fs: VfsNode, absPath: string): VfsNode | null {
  if (absPath === '/') return fs;
  const parts = absPath.split('/').filter(Boolean);
  let curr: VfsNode = fs;
  for (const part of parts) {
    if (curr.type !== 'dir' || !curr.children || !curr.children[part]) {
      return null;
    }
    curr = curr.children[part];
  }
  return curr;
}

function getParentAndName(absPath: string): { parentPath: string; name: string } | null {
  if (absPath === '/') return null;
  const parts = absPath.split('/').filter(Boolean);
  const name = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  return { parentPath, name };
}

function octalToSymbolic(octal: string, isDir: boolean): string | null {
  if (!/^[0-7]{3}$/.test(octal)) return null;
  const mapDigit = (d: string) => {
    const n = Number(d);
    return `${n & 4 ? 'r' : '-'}${n & 2 ? 'w' : '-'}${n & 1 ? 'x' : '-'}`;
  };
  return `${isDir ? 'd' : '-'}${mapDigit(octal[0])}${mapDigit(octal[1])}${mapDigit(octal[2])}`;
}

function tokenizeCommand(raw: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

export function executeTerminalCommand(
  state: TerminalState,
  rawInput: string,
  windowsLab?: WindowsLabState
): TerminalCommandResult {
  const trimmed = rawInput.trim();
  const winState = windowsLab ?? createInitialWindowsLabState();

  if (!trimmed) {
    return { output: '', nextState: state };
  }

  const nextFs = cloneFs(state.fs);
  const nextHistory = [...state.history, trimmed].slice(-100);
  const nextExecuted = [...state.executedCommands, trimmed].slice(-100);
  const nextServices = { ...state.services };
  let nextCwd = state.cwd;

  const makeNext = (output: string, clear = false): TerminalCommandResult => ({
    output,
    clear,
    nextState: {
      ...state,
      cwd: nextCwd,
      fs: nextFs,
      history: nextHistory,
      executedCommands: nextExecuted,
      services: nextServices,
    },
  });

  // Handle simple redirection for echo ... > file or echo ... >> file
  const redirMatch = trimmed.match(/^(echo\s+.*?)\s*(>>|>)\s*(\S+)$/);
  if (redirMatch) {
    const [, echoPart, op, targetFileArg] = redirMatch;
    const echoTokens = tokenizeCommand(echoPart);
    const text = echoTokens.slice(1).join(' ') + '\n';
    const absTarget = resolvePath(nextCwd, targetFileArg);
    const parentInfo = getParentAndName(absTarget);
    if (!parentInfo) return makeNext(`bash: ${targetFileArg}: percorso non valido`);
    const parentNode = getNodeAt(nextFs, parentInfo.parentPath);
    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) {
      return makeNext(`bash: ${targetFileArg}: File o directory non esistente`);
    }
    const existing = parentNode.children[parentInfo.name];
    if (existing && existing.type === 'dir') {
      return makeNext(`bash: ${targetFileArg}: È una directory`);
    }
    const prevContent = existing?.content ?? '';
    parentNode.children[parentInfo.name] = {
      type: 'file',
      permissions: existing?.permissions ?? '-rw-r--r--',
      owner: existing?.owner ?? state.user,
      group: existing?.group ?? state.user,
      content: op === '>>' ? prevContent + text : text,
    };
    return makeNext('');
  }

  // Handle simple pipe to grep (e.g. cat /var/log/auth.log | grep Failed)
  const pipeParts = trimmed.split('|').map((s) => s.trim());
  if (pipeParts.length === 2) {
    const leftRes = executeTerminalCommand(state, pipeParts[0], winState);
    const rightTokens = tokenizeCommand(pipeParts[1]);
    if (rightTokens[0] === 'grep' && rightTokens[1]) {
      const ignoreCase = rightTokens.includes('-i');
      const pattern = rightTokens.filter((t) => !t.startsWith('-')).slice(1)[0];
      if (!pattern) return makeNext('Uso: ... | grep [-i] <pattern>');
      const matched = leftRes.output
        .split('\n')
        .filter((line) =>
          ignoreCase ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern)
        )
        .join('\n');
      return makeNext(matched);
    }
    if (rightTokens[0] === 'head') {
      return makeNext(leftRes.output.split('\n').slice(0, 5).join('\n'));
    }
    if (rightTokens[0] === 'tail') {
      const lines = leftRes.output.split('\n');
      return makeNext(lines.slice(-5).join('\n'));
    }
  }

  const tokens = tokenizeCommand(trimmed);
  let cmd = tokens[0];
  let args = tokens.slice(1);
  let usedSudo = false;

  if (cmd === 'sudo') {
    if (args.length === 0) {
      return makeNext('Uso: sudo <comando> — Esegue un comando con privilegi amministrativi simulati.');
    }
    usedSudo = true;
    cmd = args[0];
    args = args.slice(1);
  }

  switch (cmd) {
    case 'clear':
      return makeNext('', true);

    case 'help':
      return makeNext(
        [
          'Comandi Linux & Cybersecurity disponibili nella simulazione (ambiente isolato):',
          '  Navigazione & File : pwd, ls [-la], cd <dir>, mkdir [-p] <dir>, touch <file>, cat <file>',
          '                       head/tail <file>, less <file>, echo "txt" > <file>, cp, mv, rm [-r]',
          '  Ricerca & Testo    : grep [-i|-n] <pattern> <file>, find <dir> -name <pattern>',
          '  Permessi & Sistema : chmod <600|755|+x> <file>, chown, whoami, id, uname -a, ps, top',
          '                       systemctl <status|start|stop> <svc>, journalctl, sudo <cmd>',
          '  Rete & Lab Security: ip a, ping <ip>, ss -tulnp, dig <host>, curl <url>, ssh <user@host>',
          '                       nmap <target>, smbclient -L //<ip> -U <user>, ufw <status|enable|allow|deny>',
          '  Utility            : history, man <cmd>, clear',
        ].join('\n')
      );

    case 'man': {
      const target = args[0];
      if (!target) return makeNext('Quale manuale vuoi consultare? Esempio: man chmod');
      const manuals: Record<string, string> = {
        ls: 'ls [-l] [-a] [-la] [percorso] — Elenca file e directory. -l mostra permessi e proprietario, -a include file nascosti.',
        chmod: 'chmod <permessi> <file> — Modifica i permessi (es. chmod 600 chiave_lab.pem oppure chmod +x script.sh).',
        grep: 'grep [-i] [-n] <testo> <file> — Cerca righe contenenti una stringa. Molto usato sui log in /var/log/auth.log.',
        nmap: 'nmap <ip_lab> — Scansiona le porte aperte di un host autorizzato nel laboratorio (es. 10.10.20.15).',
        smbclient: 'smbclient -L //<ip> -U <utente>  oppure  smbclient //<ip>/<share> -U <utente> — Verifica condivisioni SMB Windows.',
        ss: 'ss -tulnp — Mostra i socket e le porte TCP/UDP in ascolto sul sistema Linux.',
        ufw: 'ufw status | sudo ufw enable | sudo ufw deny 445 — Gestione semplificata del firewall Linux.',
      };
      return makeNext(manuals[target] ?? `Manuale sintetico non trovato per '${target}'. Prova 'help' o chiedi a Cyber Mentor.`);
    }

    case 'pwd':
      return makeNext(nextCwd);

    case 'whoami':
      return makeNext(usedSudo ? 'root' : state.user);

    case 'id':
      return makeNext(
        usedSudo
          ? 'uid=0(root) gid=0(root) groups=0(root)'
          : 'uid=1000(student) gid=1000(student) groups=1000(student),27(sudo),130(kaboxer)'
      );

    case 'uname':
      return makeNext(
        args.includes('-a')
          ? 'Linux kali-lab 6.8.11-amd64 #1 SMP PREEMPT_DYNAMIC Kali 2026.1 x86_64 GNU/Linux [SIMULAZIONE]'
          : 'Linux'
      );

    case 'history':
      return makeNext(nextHistory.map((h, idx) => `  ${String(idx + 1).padStart(3, ' ')}  ${h}`).join('\n'));

    case 'ls': {
      const flags = args.filter((a) => a.startsWith('-')).join('');
      const showLong = flags.includes('l');
      const showAll = flags.includes('a');
      const pathArg = args.find((a) => !a.startsWith('-')) ?? '.';
      const abs = resolvePath(nextCwd, pathArg);
      const node = getNodeAt(nextFs, abs);
      if (!node) return makeNext(`ls: impossibile accedere a '${pathArg}': File o directory non esistente`);
      if (node.type === 'file') {
        const name = abs.split('/').pop()!;
        return makeNext(
          showLong
            ? `${node.permissions} 1 ${node.owner} ${node.group} ${String((node.content ?? '').length).padStart(4, ' ')} Nov 17 14:30 ${name}`
            : name
        );
      }
      const entries = Object.entries(node.children ?? {}).sort(([a], [b]) => a.localeCompare(b));
      const lines: string[] = [];
      if (showLong && showAll) {
        lines.push(`${node.permissions} 2 ${node.owner} ${node.group} 4096 Nov 17 14:30 .`);
        lines.push(`drwxr-xr-x 2 root root 4096 Nov 17 14:00 ..`);
      } else if (showAll) {
        lines.push('.');
        lines.push('..');
      }
      for (const [name, child] of entries) {
        if (showLong) {
          const size = child.type === 'dir' ? 4096 : (child.content ?? '').length;
          const displayName = child.type === 'dir' ? `${name}/` : name;
          lines.push(
            `${child.permissions} 1 ${child.owner.padEnd(7)} ${child.group.padEnd(7)} ${String(size).padStart(4, ' ')} Nov 17 14:30 ${displayName}`
          );
        } else {
          lines.push(child.type === 'dir' ? `${name}/` : name);
        }
      }
      return makeNext(showLong ? lines.join('\n') : lines.join('  '));
    }

    case 'cd': {
      const target = args[0] ?? '~';
      const abs = resolvePath(nextCwd, target);
      const node = getNodeAt(nextFs, abs);
      if (!node) return makeNext(`bash: cd: ${target}: File o directory non esistente`);
      if (node.type !== 'dir') return makeNext(`bash: cd: ${target}: Non è una directory`);
      nextCwd = abs;
      return makeNext('');
    }

    case 'mkdir': {
      const recursive = args.includes('-p');
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return makeNext('mkdir: operando mancante');
      for (const t of targets) {
        const abs = resolvePath(nextCwd, t);
        if (recursive) {
          const parts = abs.split('/').filter(Boolean);
          let curr = nextFs;
          for (const part of parts) {
            curr.children = curr.children ?? {};
            if (!curr.children[part]) {
              curr.children[part] = {
                type: 'dir',
                permissions: 'drwxr-xr-x',
                owner: state.user,
                group: state.user,
                children: {},
              };
            }
            curr = curr.children[part];
          }
        } else {
          const info = getParentAndName(abs);
          if (!info) return makeNext(`mkdir: impossibile creare la directory '${t}'`);
          const parent = getNodeAt(nextFs, info.parentPath);
          if (!parent || parent.type !== 'dir' || !parent.children) {
            return makeNext(`mkdir: impossibile creare la directory '${t}': File o directory non esistente`);
          }
          if (parent.children[info.name]) {
            return makeNext(`mkdir: impossibile creare la directory '${t}': Il file esiste già`);
          }
          parent.children[info.name] = {
            type: 'dir',
            permissions: 'drwxr-xr-x',
            owner: state.user,
            group: state.user,
            children: {},
          };
        }
      }
      return makeNext('');
    }

    case 'touch': {
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return makeNext('touch: operando file mancante');
      for (const t of targets) {
        const abs = resolvePath(nextCwd, t);
        const info = getParentAndName(abs);
        if (!info) continue;
        const parent = getNodeAt(nextFs, info.parentPath);
        if (!parent || parent.type !== 'dir' || !parent.children) {
          return makeNext(`touch: impossibile fare touch di '${t}': File o directory non esistente`);
        }
        if (!parent.children[info.name]) {
          parent.children[info.name] = {
            type: 'file',
            permissions: '-rw-r--r--',
            owner: state.user,
            group: state.user,
            content: '',
          };
        }
      }
      return makeNext('');
    }

    case 'cat':
    case 'less': {
      const target = args[0];
      if (!target) return makeNext(`${cmd}: specificare un file`);
      const abs = resolvePath(nextCwd, target);
      const node = getNodeAt(nextFs, abs);
      if (!node) return makeNext(`${cmd}: ${target}: File o directory non esistente`);
      if (node.type === 'dir') return makeNext(`${cmd}: ${target}: È una directory`);
      return makeNext((node.content ?? '').trimEnd());
    }

    case 'head':
    case 'tail': {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return makeNext(`${cmd}: specificare un file`);
      const abs = resolvePath(nextCwd, target);
      const node = getNodeAt(nextFs, abs);
      if (!node || node.type === 'dir') return makeNext(`${cmd}: impossibile leggere '${target}'`);
      const lines = (node.content ?? '').split('\n').filter((l, idx, arr) => !(idx === arr.length - 1 && l === ''));
      const slice = cmd === 'head' ? lines.slice(0, 5) : lines.slice(-5);
      return makeNext(slice.join('\n'));
    }

    case 'echo':
      return makeNext(args.join(' '));

    case 'nano': {
      const target = args[0];
      if (!target) return makeNext('nano: specifica un nome file. Suggerimento: usa `echo "testo" > file.txt` per scrivere nel simulatore.');
      const abs = resolvePath(nextCwd, target);
      const info = getParentAndName(abs);
      if (!info) return makeNext('nano: percorso non valido');
      const parent = getNodeAt(nextFs, info.parentPath);
      if (!parent || parent.type !== 'dir' || !parent.children) {
        return makeNext(`nano: directory padre inesistente per '${target}'`);
      }
      if (!parent.children[info.name]) {
        parent.children[info.name] = {
          type: 'file',
          permissions: '-rw-r--r--',
          owner: state.user,
          group: state.user,
          content: '# File creato con nano (simulazione)\n',
        };
      }
      return makeNext(`[Editor nano simulato] File '${target}' salvato. Per inserire contenuto testuale usa: echo "contenuto" > ${target}`);
    }

    case 'cp': {
      if (args.length < 2) return makeNext('cp: operando file mancante. Uso: cp <sorgente> <destinazione>');
      const srcAbs = resolvePath(nextCwd, args[0]);
      const srcNode = getNodeAt(nextFs, srcAbs);
      if (!srcNode || srcNode.type === 'dir') return makeNext(`cp: impossibile copiare '${args[0]}'`);
      let dstAbs = resolvePath(nextCwd, args[1]);
      const dstNode = getNodeAt(nextFs, dstAbs);
      if (dstNode?.type === 'dir') {
        const srcName = srcAbs.split('/').pop()!;
        dstAbs = `${dstAbs === '/' ? '' : dstAbs}/${srcName}`;
      }
      const dstInfo = getParentAndName(dstAbs);
      if (!dstInfo) return makeNext('cp: destinazione non valida');
      const dstParent = getNodeAt(nextFs, dstInfo.parentPath);
      if (!dstParent || dstParent.type !== 'dir' || !dstParent.children) {
        return makeNext(`cp: directory di destinazione inesistente`);
      }
      dstParent.children[dstInfo.name] = cloneFs(srcNode);
      return makeNext('');
    }

    case 'mv': {
      if (args.length < 2) return makeNext('mv: operando file mancante. Uso: mv <sorgente> <destinazione>');
      const srcAbs = resolvePath(nextCwd, args[0]);
      const srcInfo = getParentAndName(srcAbs);
      const srcNode = getNodeAt(nextFs, srcAbs);
      if (!srcInfo || !srcNode) return makeNext(`mv: impossibile eseguire stat di '${args[0]}'`);
      let dstAbs = resolvePath(nextCwd, args[1]);
      const dstExisting = getNodeAt(nextFs, dstAbs);
      if (dstExisting?.type === 'dir') {
        dstAbs = `${dstAbs === '/' ? '' : dstAbs}/${srcInfo.name}`;
      }
      const dstInfo = getParentAndName(dstAbs);
      if (!dstInfo) return makeNext('mv: destinazione non valida');
      const dstParent = getNodeAt(nextFs, dstInfo.parentPath);
      const srcParent = getNodeAt(nextFs, srcInfo.parentPath);
      if (!dstParent || dstParent.type !== 'dir' || !dstParent.children || !srcParent?.children) {
        return makeNext('mv: percorso di destinazione non valido');
      }
      dstParent.children[dstInfo.name] = cloneFs(srcNode);
      delete srcParent.children[srcInfo.name];
      return makeNext('');
    }

    case 'rm': {
      const recursive = args.some((a) => a.startsWith('-') && (a.includes('r') || a.includes('R')));
      const targets = args.filter((a) => !a.startsWith('-'));
      if (targets.length === 0) return makeNext('rm: operando mancante');
      for (const t of targets) {
        const abs = resolvePath(nextCwd, t);
        if (abs === '/' || abs === '/home' || abs === '/home/student') {
          return makeNext(`rm: operazione bloccata su directory protetta '${abs}'`);
        }
        const info = getParentAndName(abs);
        if (!info) continue;
        const parent = getNodeAt(nextFs, info.parentPath);
        const node = parent?.children?.[info.name];
        if (!node) return makeNext(`rm: impossibile rimuovere '${t}': File o directory non esistente`);
        if (node.type === 'dir' && !recursive) {
          return makeNext(`rm: impossibile rimuovere '${t}': È una directory (usa -r)`);
        }
        delete parent!.children![info.name];
      }
      return makeNext('');
    }

    case 'chmod': {
      if (args.length < 2) return makeNext('chmod: operando mancante. Esempio: chmod 600 chiave_lab.pem');
      const mode = args[0];
      const target = args[1];
      const abs = resolvePath(nextCwd, target);
      const node = getNodeAt(nextFs, abs);
      if (!node) return makeNext(`chmod: impossibile accedere a '${target}': File o directory non esistente`);
      const symbolic = octalToSymbolic(mode, node.type === 'dir');
      if (symbolic) {
        node.permissions = symbolic;
        return makeNext('');
      }
      if (mode === '+x') {
        const chars = node.permissions.split('');
        chars[3] = 'x';
        node.permissions = chars.join('');
        return makeNext('');
      }
      return makeNext(`chmod: modalità '${mode}' non supportata nel simulatore (usa formato ottale es. 600, 644, 755 o +x)`);
    }

    case 'chown': {
      if (args.length < 2) return makeNext('chown: operando mancante. Uso: chown utente:gruppo file');
      if (!usedSudo) return makeNext('chown: operazione non permessa (prova con sudo chown ...)');
      const [ownerPart, groupPart] = args[0].split(':');
      const abs = resolvePath(nextCwd, args[1]);
      const node = getNodeAt(nextFs, abs);
      if (!node) return makeNext(`chown: impossibile accedere a '${args[1]}'`);
      if (ownerPart) node.owner = ownerPart;
      if (groupPart) node.group = groupPart;
      return makeNext('');
    }

    case 'grep': {
      const ignoreCase = args.includes('-i');
      const showNums = args.includes('-n');
      const cleanArgs = args.filter((a) => !a.startsWith('-'));
      if (cleanArgs.length < 2) return makeNext('Uso: grep [-i] [-n] <pattern> <file>');
      const [pattern, fileArg] = cleanArgs;
      const abs = resolvePath(nextCwd, fileArg);
      const node = getNodeAt(nextFs, abs);
      if (!node || node.type === 'dir') return makeNext(`grep: ${fileArg}: File non leggibile`);
      const lines = (node.content ?? '').split('\n');
      const matches: string[] = [];
      lines.forEach((line, idx) => {
        const hit = ignoreCase
          ? line.toLowerCase().includes(pattern.toLowerCase())
          : line.includes(pattern);
        if (hit) {
          matches.push(showNums ? `${idx + 1}:${line}` : line);
        }
      });
      return makeNext(matches.join('\n'));
    }

    case 'find': {
      const startPath = args[0] && !args[0].startsWith('-') ? args[0] : '.';
      const nameIdx = args.indexOf('-name');
      const pattern = nameIdx >= 0 ? args[nameIdx + 1] : undefined;
      const absStart = resolvePath(nextCwd, startPath);
      const rootNode = getNodeAt(nextFs, absStart);
      if (!rootNode) return makeNext(`find: '${startPath}': File o directory non esistente`);
      const results: string[] = [];
      const walk = (n: VfsNode, p: string) => {
        const base = p.split('/').pop() || '/';
        if (!pattern || base.includes(pattern.replace(/\*/g, ''))) {
          results.push(p);
        }
        if (n.type === 'dir' && n.children) {
          for (const [k, child] of Object.entries(n.children)) {
            walk(child, `${p === '/' ? '' : p}/${k}`);
          }
        }
      };
      walk(rootNode, absStart);
      return makeNext(results.join('\n'));
    }

    case 'ps':
      return makeNext(
        [
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:02 systemd',
          ...(nextServices.ssh ? [' 1102 ?        00:00:00 sshd'] : []),
          ...(nextServices.apache2 ? [' 1450 ?        00:00:00 apache2'] : []),
          ' 2048 pts/0    00:00:00 bash',
          ' 2099 pts/0    00:00:00 ps',
        ].join('\n')
      );

    case 'top':
      return makeNext(
        [
          'top - 14:35:10 up 1:12,  1 user,  load average: 0.14, 0.10, 0.08',
          'Tasks: 94 total,   1 running,  93 sleeping',
          '%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.7 id',
          'MiB Mem :   4096.0 total,   2410.4 free,   1120.2 used',
          '  PID USER      PR  NI    VIRT    RES  %CPU %MEM COMMAND',
          ...(nextServices.ssh ? [' 1102 root      20   0   15420   5200   0.0  0.1 sshd'] : []),
          ' 2048 student   20   0   11240   4100   0.3  0.1 bash',
        ].join('\n')
      );

    case 'kill':
      return makeNext(
        args[0]
          ? `Segnale inviato al processo simulato PID ${args[0]}.`
          : 'kill: specificare PID (es. ps per vedere i PID)'
      );

    case 'systemctl': {
      const action = args[0];
      const svc = args[1]?.replace('.service', '');
      if (!action || !svc) return makeNext('Uso: systemctl <status|start|stop> <ssh|apache2|ufw>');
      if (svc !== 'ssh' && svc !== 'apache2' && svc !== 'ufw') {
        return makeNext(`Unit ${svc}.service could not be found.`);
      }
      if (action === 'status') {
        const active = nextServices[svc];
        return makeNext(
          `● ${svc}.service - Simulated Lab Service\n   Loaded: loaded (/lib/systemd/system/${svc}.service)\n   Active: ${
            active ? 'active (running)' : 'inactive (dead)'
          }`
        );
      }
      if (!usedSudo) return makeNext('Accesso negato: usa sudo systemctl ...');
      if (action === 'start') {
        nextServices[svc] = true;
        return makeNext(`Servizio ${svc}.service avviato.`);
      }
      if (action === 'stop') {
        nextServices[svc] = false;
        return makeNext(`Servizio ${svc}.service arrestato.`);
      }
      return makeNext(`Azione '${action}' non valida.`);
    }

    case 'journalctl': {
      const unitIdx = args.indexOf('-u');
      const unit = unitIdx >= 0 ? args[unitIdx + 1] : '';
      const authLog = getNodeAt(nextFs, '/var/log/auth.log')?.content ?? '';
      const sysLog = getNodeAt(nextFs, '/var/log/syslog')?.content ?? '';
      if (unit === 'ssh' || unit === 'sshd') {
        return makeNext(authLog.trimEnd());
      }
      return makeNext((sysLog + authLog).trimEnd());
    }

    case 'ufw': {
      const sub = args[0];
      if (!sub || sub === 'status') {
        if (!nextServices.ufw) return makeNext('Status: inactive (Suggerimento: sudo ufw enable)');
        return makeNext(
          [
            'Status: active',
            '',
            'To                         Action      From',
            '--                         ------      ----',
            `22/tcp                     ${nextServices.ufwAllowSsh ? 'ALLOW' : 'DENY '}       10.10.20.0/24`,
            `445/tcp                    ${nextServices.ufwDeny445 ? 'DENY ' : 'ALLOW'}       Anywhere`,
          ].join('\n')
        );
      }
      if (!usedSudo) return makeNext('ERROR: Devi eseguire questo comando con sudo.');
      if (sub === 'enable') {
        nextServices.ufw = true;
        return makeNext('Firewall attivo e abilitato all’avvio del sistema.');
      }
      if (sub === 'disable') {
        nextServices.ufw = false;
        return makeNext('Firewall fermato e disabilitato.');
      }
      if (sub === 'allow' && args[1]?.includes('22')) {
        nextServices.ufwAllowSsh = true;
        return makeNext('Regola aggiunta: ALLOW 22/tcp');
      }
      if (sub === 'deny' && args[1]?.includes('445')) {
        nextServices.ufwDeny445 = true;
        return makeNext('Regola aggiunta: DENY 445/tcp');
      }
      return makeNext(`Regola UFW elaborata: ${args.join(' ')}`);
    }

    case 'ip':
      return makeNext(
        [
          '1: lo: <LOOPBACK,UP> mtu 65536 state UNKNOWN',
          '    inet 127.0.0.1/8 scope host lo',
          '2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 state UP',
          '    inet 10.10.20.10/24 brd 10.10.20.255 scope global eth0',
          '    link/ether 08:00:27:11:22:33 brd ff:ff:ff:ff:ff:ff',
        ].join('\n')
      );

    case 'ping': {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return makeNext('Uso: ping [-c 3] <ip_laboratorio>');
      const validLabIps = ['127.0.0.1', 'localhost', winState.kaliIp, winState.dcIp, winState.fileServerIp, winState.workstationIp];
      if (!validLabIps.includes(target)) {
        return makeNext(
          `[SIMULAZIONE ISOLATA] Target '${target}' fuori dalla subnet autorizzata 10.10.20.0/24.\nHost disponibili nel lab: ${winState.dcIp} (DC01), ${winState.fileServerIp} (FS01-SMB), ${winState.workstationIp} (WKS-FIN01).`
        );
      }
      return makeNext(
        [
          `PING ${target} (${target}) 56(84) bytes of data.`,
          `64 bytes from ${target}: icmp_seq=1 ttl=128 time=0.42 ms`,
          `64 bytes from ${target}: icmp_seq=2 ttl=128 time=0.38 ms`,
          `64 bytes from ${target}: icmp_seq=3 ttl=128 time=0.41 ms`,
          `--- ${target} ping statistics ---`,
          `3 packets transmitted, 3 received, 0% packet loss`,
        ].join('\n')
      );
    }

    case 'ss':
      return makeNext(
        [
          'Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process',
          ...(nextServices.ssh
            ? ['tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=1102,fd=3))']
            : []),
          ...(nextServices.apache2
            ? ['tcp    LISTEN  0       511      0.0.0.0:80           0.0.0.0:*          users:(("apache2",pid=1450,fd=4))']
            : []),
        ].join('\n')
      );

    case 'dig': {
      const host = args[0] ?? 'fs01-smb.labcorp.local';
      if (host.includes('fs01')) {
        return makeNext(`; <<>> DiG Lab <<>> ${host}\n;; ANSWER SECTION:\n${host}.\t300\tIN\tA\t${winState.fileServerIp}`);
      }
      if (host.includes('dc01')) {
        return makeNext(`; <<>> DiG Lab <<>> ${host}\n;; ANSWER SECTION:\n${host}.\t300\tIN\tA\t${winState.dcIp}`);
      }
      return makeNext(`; <<>> DiG Lab <<>> ${host}\n;; status: NXDOMAIN (risoluzione limitata al dominio isolato labcorp.local)`);
    }

    case 'curl': {
      const url = args[0] ?? '';
      if (!url) return makeNext('Uso: curl http://10.10.20.10 (verifica servizio web locale di laboratorio)');
      if (url.includes('10.10.20.10') || url.includes('localhost')) {
        if (!nextServices.apache2) {
          return makeNext(`curl: (7) Failed to connect to ${url}: Connection refused (suggerimento: sudo systemctl start apache2)`);
        }
        return makeNext('<html><title>LabCorp Intranet Test</title><h1>Portale Interno di Laboratorio</h1></html>');
      }
      return makeNext('[SIMULAZIONE] Richieste HTTP consentite solo verso host di laboratorio (10.10.20.0/24).');
    }

    case 'ssh':
      return makeNext(
        args[0]
          ? `[SIMULAZIONE] Verifica handshake SSH verso ${args[0]} completata. In ambiente reale, usa chiavi Ed25519 e disabilita PasswordAuthentication per root.`
          : 'Uso: ssh utente@10.10.20.10'
      );

    case 'nmap': {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) {
        return makeNext('Uso: nmap [-sV] <ip_lab>\nEsempio autorizzato: nmap -sV 10.10.20.15');
      }
      if (target === winState.fileServerIp) {
        const lines = [
          `Starting Nmap 7.95 (Lab Simulator) — Target autorizzato: ${target} (FS01-SMB)`,
          'PORT     STATE    SERVICE       VERSION',
        ];
        for (const r of winState.firewallRules) {
          const stateStr = r.scope === 'BLOCKED' ? 'filtered' : 'open';
          const ver =
            r.port === 445
              ? `Microsoft Windows SMB (${winState.smbV1Enabled ? 'SMBv1+SMBv3 ATTIVO - OBSOLETO' : 'SMBv3 Signing=' + (winState.smbSigningRequired ? 'Required' : 'Optional')})`
              : r.service;
          lines.push(`${String(r.port + '/tcp').padEnd(8)} ${stateStr.padEnd(8)} ${r.service.split(' ')[0].toLowerCase().padEnd(13)} ${ver}`);
        }
        lines.push('Nmap done: 1 IP address (1 host up) scanned in 0.48 seconds.');
        return makeNext(lines.join('\n'));
      }
      if (target === winState.dcIp) {
        return makeNext(
          [
            `Starting Nmap 7.95 (Lab Simulator) — Target autorizzato: ${target} (DC01-WIN2022)`,
            'PORT     STATE SERVICE       VERSION',
            '53/tcp   open  domain        Simple DNS Plus (labcorp.local)',
            '88/tcp   open  kerberos-sec  Microsoft Windows Kerberos',
            '389/tcp  open  ldap          Microsoft Windows Active Directory LDAP',
            '445/tcp  open  microsoft-ds  Windows Server 2022 DC',
          ].join('\n')
        );
      }
      return makeNext(`[SIMULAZIONE] Scansione consentita solo sugli host di laboratorio (${winState.dcIp}, ${winState.fileServerIp}, ${winState.workstationIp}).`);
    }

    case 'smbclient': {
      const listMode = args.includes('-L');
      const userIdx = args.indexOf('-U');
      const username = userIdx >= 0 ? args[userIdx + 1] : 'guest_user';
      const targetArg = args.find((a) => a.startsWith('//'));
      if (!targetArg) {
        return makeNext(
          'Uso:\n  smbclient -L //10.10.20.15 -U auditor\n  smbclient //10.10.20.15/Backup_IT -U guest_user'
        );
      }
      const clean = targetArg.replace(/^\/\//, '');
      const [host, shareName] = clean.split('/');
      if (host !== winState.fileServerIp && host !== 'FS01-SMB') {
        return makeNext(`Connection to ${host} failed (Host non trovato nel lab. Usa ${winState.fileServerIp})`);
      }

      const fw445 = winState.firewallRules.find((r) => r.port === 445);
      if (!fw445 || fw445.scope === 'BLOCKED') {
        return makeNext(`do_connect: Connection to ${winState.fileServerIp} failed (Error NT_STATUS_IO_TIMEOUT — porta 445 bloccata dal firewall)`);
      }

      if (listMode || !shareName) {
        if (username === 'guest_user' && !winState.guestAccountEnabled) {
          return makeNext('session setup failed: NT_STATUS_ACCOUNT_DISABLED (account guest disabilitato)');
        }
        const rows = winState.shares.map((s) => {
          const ev = evaluateSmbAccess(winState, username, s.name, winState.kaliIp);
          return `  ${s.name.padEnd(16)} Disk      ${ev.granted ? `[ACCESSIBILE: ${ev.finalEffective}]` : '[Accesso negato]'} ${s.description}`;
        });
        return makeNext(
          [`Sharename        Type      Stato per '${username}'`, '---------        ----      --------------------', ...rows].join('\n')
        );
      }

      const evalRes = evaluateSmbAccess(winState, username, shareName, winState.kaliIp);
      if (!evalRes.granted) {
        return makeNext(`tree connect failed: NT_STATUS_ACCESS_DENIED\nMotivo: ${evalRes.reason}`);
      }
      const shareObj = winState.shares.find((s) => s.name.toLowerCase() === shareName.toLowerCase());
      const filesList = (shareObj?.sampleFiles ?? [])
        .map((f) => `  ${f.padEnd(32)} A      1420  Tue Nov 17 14:20:00 2026`)
        .join('\n');
      return makeNext(
        `Connesso a //${winState.fileServerIp}/${evalRes.shareName} come '${username}' (${evalRes.finalEffective}):\n${filesList}`
      );
    }

    default:
      return makeNext(`bash: ${cmd}: comando non trovato. Digita 'help' per vedere i comandi supportati.`);
  }
}

export function evaluateTerminalObjectives(state: TerminalState): TerminalObjectiveCheck[] {
  const homeChildren = state.fs.children?.home?.children?.student?.children ?? {};
  const auditDir = homeChildren['audit_lab'];
  const reportFile = auditDir?.children?.['report.txt'] ?? homeChildren['report.txt'];
  const keyFile = homeChildren['chiave_lab.pem'];
  const usedGrepOnAuth = state.executedCommands.some(
    (c) => c.includes('grep') && c.includes('auth.log')
  );
  const usedSmbOrNmap = state.executedCommands.some(
    (c) => c.startsWith('nmap') || c.startsWith('smbclient')
  );

  return [
    {
      id: 'term-obj-dir',
      title: '1. Creare una directory di lavoro `audit_lab`',
      description: 'Esegui `mkdir audit_lab` nella tua home `/home/student`.',
      passed: Boolean(auditDir && auditDir.type === 'dir'),
    },
    {
      id: 'term-obj-file',
      title: '2. Creare e popolare `audit_lab/report.txt`',
      description: 'Usa `echo "Audit completato" > audit_lab/report.txt` (oppure dentro la cartella).',
      passed: Boolean(reportFile && reportFile.type === 'file' && (reportFile.content ?? '').trim().length > 0),
    },
    {
      id: 'term-obj-chmod',
      title: '3. Mettere in sicurezza `chiave_lab.pem` (permessi 600)',
      description: 'Riduci i permessi troppo aperti con `chmod 600 chiave_lab.pem`.',
      passed: keyFile?.permissions === '-rw-------',
    },
    {
      id: 'term-obj-log',
      title: '4. Analizzare i tentativi falliti in `/var/log/auth.log`',
      description: 'Esegui `grep Failed /var/log/auth.log` per individuare l’IP sospetto.',
      passed: usedGrepOnAuth,
    },
    {
      id: 'term-obj-net',
      title: '5. Verificare il file server SMB del laboratorio (`10.10.20.15`)',
      description: 'Esegui `nmap 10.10.20.15` oppure `smbclient -L //10.10.20.15 -U auditor`.',
      passed: usedSmbOrNmap,
    },
  ];
}
