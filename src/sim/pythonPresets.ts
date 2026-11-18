export interface PythonPreset {
  id: string;
  titolo: string;
  categoria: 'Log Analysis' | 'Hashing & Audit' | 'Password Security' | 'Debug & Traceback';
  descrizione: string;
  code: string;
}

export const PYTHON_SECURITY_PRESETS: PythonPreset[] = [
  {
    id: 'log-parser',
    titolo: '1. Analisi Log SSH (Brute-Force Parser)',
    categoria: 'Log Analysis',
    descrizione:
      'Estrae gli IP con più tentativi di login falliti da un log auth.log di laboratorio usando espressioni regolari e dizionari.',
    code: `import re
from collections import Counter

auth_log = """
Nov 17 14:05:44 lab-srv sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44812 ssh2
Nov 17 14:05:46 lab-srv sshd[1140]: Failed password for invalid user admin from 198.51.100.44 port 44815 ssh2
Nov 17 14:05:49 lab-srv sshd[1140]: Failed password for root from 198.51.100.44 port 44820 ssh2
Nov 17 14:07:12 lab-srv sshd[1188]: Accepted publickey for student from 10.10.20.10 port 51022 ssh2
Nov 17 14:09:01 lab-srv sshd[1201]: Failed password for backup from 203.0.113.77 port 39910 ssh2
"""

pattern = re.compile(r"Failed password for (?:invalid user )?(\\S+) from (\\d+\\.\\d+\\.\\d+\\.\\d+)")
ip_counts = Counter()
user_targets = set()

for line in auth_log.strip().splitlines():
    match = pattern.search(line)
    if match:
        user, ip = match.groups()
        ip_counts[ip] += 1
        user_targets.add(user)

print("=== REPORT TRIAGE AUTH.LOG ===")
print("Utenti presi di mira:", ", ".join(sorted(user_targets)))
for ip, count in ip_counts.most_common():
    alert = " [ALERT BRUTE FORCE]" if count >= 3 else ""
    print(f"IP {ip}: {count} tentativi falliti{alert}")
`,
  },
  {
    id: 'hash-integrity',
    titolo: '2. Verifica Integrità File & Segreti',
    categoria: 'Hashing & Audit',
    descrizione:
      'Calcola SHA-256 reale tramite hashlib e controlla file di configurazione simulati per individuare credenziali hardcoded.',
    code: `import hashlib

files = {
    "/etc/app/config.env": "DB_HOST=10.10.20.15\\nDB_USER=app_svc\\nAPI_SECRET=LabDemoKey_NonUsareInProd",
    "/var/www/html/index.html": "<h1>Portale Intranet LabCorp</h1>",
}

print("=== CONTROLLO INTEGRITA' & SEGRETI ===")
for path, content in files.items():
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
    has_secret = any(k in content for k in ("SECRET", "PASSWORD", "TOKEN"))
    print(f"File: {path}")
    print(f"  SHA-256 : {digest}")
    print(f"  Esito   : {'ATTENZIONE - possibile segreto esposto' if has_secret else 'OK - nessun segreto trovato'}")
`,
  },
  {
    id: 'password-entropy',
    titolo: '3. Calcolatore Entropia Password',
    categoria: 'Password Security',
    descrizione:
      'Calcola i bit di entropia teorica e stima la resistenza al cracking offline per diverse password didattiche.',
    code: `import math
import string

def evaluate_password(pwd: str):
    pool = 0
    if any(c.islower() for c in pwd): pool += 26
    if any(c.isupper() for c in pwd): pool += 26
    if any(c.isdigit() for c in pwd): pool += 10
    if any(c in string.punctuation for c in pwd): pool += 32
    entropy = len(pwd) * math.log2(pool) if pool > 0 else 0
    level = "DEBOLE" if entropy < 50 else ("MEDIA" if entropy < 75 else "ROBUSTA")
    return round(entropy, 1), level

samples = ["123456", "Estate2026!", "Caccia-Pino-Vela-74!"]
print("=== ANALISI ENTROPIA PASSWORD ===")
for s in samples:
    bits, label = evaluate_password(s)
    print(f"{s:<24} -> {bits:>5} bit [{label}]")
`,
  },
  {
    id: 'traceback-demo',
    titolo: '4. Esercizio Debug & Traceback Reale',
    categoria: 'Debug & Traceback',
    descrizione:
      'Genera volutamente un errore Python reale (KeyError/ZeroDivisionError) per imparare a leggere i traceback e chiedere aiuto al Mentor AI.',
    code: `ports = {"ssh": 22, "smb": 445}
print("Porte note:", ports)

# Riga con errore intenzionale: chiave inesistente o divisione per zero
# Prova a correggere usando ports.get("rdp", 3389)
print("Porta RDP:", ports["rdp"])
`,
  },
];
