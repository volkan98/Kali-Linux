export type HashAlgorithm = 'Plaintext' | 'MD5 (no salt)' | 'NTLM' | 'SHA-256 (no salt)' | 'bcrypt (cost 12)' | 'Argon2id';

export interface SyntheticCredentialEntry {
  id: string;
  account: string;
  sistema: 'Linux Server' | 'Windows AD' | 'Portale Web' | 'Router Lab';
  testPassword: string;
  hashAlgorithm: HashAlgorithm;
  salted: boolean;
  mfaEnabled: boolean;
  rateLimiting: boolean;
}

export interface PasswordAuditReport {
  entropyBits: number;
  strengthLabel: 'Critica' | 'Debole' | 'Media' | 'Robusta' | 'Molto Robusta';
  score: number;
  weaknesses: string[];
  offlineCrackEstimate: string;
  onlineAttackResistance: string;
  consequences: string;
  recommendations: string[];
}

const COMMON_SYNTHETIC_PASSWORDS = new Set([
  '123456',
  '12345678',
  'admin',
  'admin123',
  'password',
  'password1',
  'password123',
  'qwerty',
  'letmein',
  'welcome1',
  'estate2026!',
  'azienda2026',
  'inverno2025',
  'root1234',
]);

export const INITIAL_SYNTHETIC_ARCHIVE: SyntheticCredentialEntry[] = [
  {
    id: 'cred-1',
    account: 'lab_helpdesk',
    sistema: 'Windows AD',
    testPassword: 'Password1',
    hashAlgorithm: 'NTLM',
    salted: false,
    mfaEnabled: false,
    rateLimiting: false,
  },
  {
    id: 'cred-2',
    account: 'lab_webapp_admin',
    sistema: 'Portale Web',
    testPassword: 'admin123',
    hashAlgorithm: 'MD5 (no salt)',
    salted: false,
    mfaEnabled: false,
    rateLimiting: false,
  },
  {
    id: 'cred-3',
    account: 'lab_user_mario',
    sistema: 'Linux Server',
    testPassword: 'Estate2026!',
    hashAlgorithm: 'SHA-256 (no salt)',
    salted: false,
    mfaEnabled: false,
    rateLimiting: true,
  },
  {
    id: 'cred-4',
    account: 'lab_sec_auditor',
    sistema: 'Linux Server',
    testPassword: 'K9#vP2$mL8@qR4!z',
    hashAlgorithm: 'Argon2id',
    salted: true,
    mfaEnabled: true,
    rateLimiting: true,
  },
  {
    id: 'cred-5',
    account: 'lab_passphrase_op',
    sistema: 'Portale Web',
    testPassword: 'treno-nuvola-bussola-quarzo-74!',
    hashAlgorithm: 'bcrypt (cost 12)',
    salted: true,
    mfaEnabled: true,
    rateLimiting: true,
  },
];

export function evaluateSyntheticPassword(
  password: string,
  algorithm: HashAlgorithm,
  salted: boolean,
  mfaEnabled: boolean,
  rateLimiting: boolean
): PasswordAuditReport {
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (!password) {
    return {
      entropyBits: 0,
      strengthLabel: 'Critica',
      score: 0,
      weaknesses: ['Password vuota.'],
      offlineCrackEstimate: 'Immediata',
      onlineAttackResistance: 'Nessuna',
      consequences: 'Accesso libero da parte di chiunque.',
      recommendations: ['Imposta una password di almeno 14 caratteri o una passphrase casuale.'],
    };
  }

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  const rawEntropy = Math.round(password.length * Math.log2(Math.max(charsetSize, 1)));
  const lower = password.toLowerCase();
  const isDictionary = COMMON_SYNTHETIC_PASSWORDS.has(lower);
  const hasYearPattern = /(19\d\d|20[0-2]\d)/.test(password);
  const hasSequential = /(1234|abcd|qwer|0000|1111)/i.test(password);

  let effectiveEntropy = rawEntropy;
  if (isDictionary) {
    effectiveEntropy = Math.min(effectiveEntropy, 18);
    weaknesses.push('Presente nei comuni dizionari o liste di password prevedibili (es. Stagione+Anno o parole comuni).');
  }
  if (hasYearPattern) {
    effectiveEntropy = Math.max(12, effectiveEntropy - 18);
    weaknesses.push('Contiene un anno prevedibile (pattern tipico negli attacchi basati su regole).');
  }
  if (hasSequential) {
    effectiveEntropy = Math.max(10, effectiveEntropy - 16);
    weaknesses.push('Contiene sequenze di tastiera o numeriche banali.');
  }
  if (password.length < 12) {
    weaknesses.push(`Lunghezza ridotta (${password.length} caratteri): sotto la soglia consigliata di 12–16 caratteri.`);
    recommendations.push('Aumenta la lunghezza ad almeno 14–16 caratteri (o usa 4+ parole casuali in un Password Manager).');
  }

  const isFastHash = algorithm === 'Plaintext' || algorithm === 'MD5 (no salt)' || algorithm === 'NTLM' || algorithm === 'SHA-256 (no salt)';
  if (algorithm === 'Plaintext') {
    weaknesses.push('Archiviazione in chiaro (Plaintext): chiunque legga il database ottiene subito tutte le password.');
    recommendations.push('Non salvare mai password in chiaro: utilizza Argon2id o bcrypt.');
  } else if (isFastHash) {
    weaknesses.push(`Algoritmo rapido (${algorithm}): vulnerabile a verifiche offline ad altissima velocità su GPU.`);
    recommendations.push('Migra il salvataggio delle credenziali a un KDF lento e memory-hard come Argon2id o bcrypt.');
  }

  if (!salted && algorithm !== 'Plaintext') {
    weaknesses.push('Assenza di Salt univoco: due utenti con la stessa password generano lo stesso hash (rischio Rainbow Table).');
    recommendations.push('Genera un Salt crittografico casuale per ogni singola credenziale.');
  }

  if (!rateLimiting) {
    weaknesses.push('Rate Limiting / Account Lockout assenti sul servizio online: rischio di Password Spraying e Brute Force.');
    recommendations.push('Configura rate limiting, ritardo esponenziale e rilevamento anomalie sui tentativi falliti.');
  }

  if (!mfaEnabled) {
    weaknesses.push('Autenticazione a più fattori (MFA / Passkey) disabilitata: la sola password è un singolo punto di fallimento.');
    recommendations.push('Attiva MFA (app TOTP o chiavi FIDO2/Passkey) per proteggere l’account anche in caso di furto credenziali.');
  }

  let offlineCrackEstimate = '';
  if (algorithm === 'Plaintext') {
    offlineCrackEstimate = '0 secondi (leggibile direttamente)';
  } else if (isDictionary) {
    offlineCrackEstimate = '< 1 secondo (trovata al primo passaggio di wordlist)';
  } else if (isFastHash) {
    if (effectiveEntropy < 45) offlineCrackEstimate = 'Secondi – pochi minuti (hash veloce)';
    else if (effectiveEntropy < 65) offlineCrackEstimate = 'Ore – pochi giorni su hardware GPU';
    else offlineCrackEstimate = 'Mesi – anni, ma penalizzata da hash veloce';
  } else {
    // bcrypt / Argon2id
    if (effectiveEntropy < 40) offlineCrackEstimate = 'Minuti – ore (password troppo corta)';
    else if (effectiveEntropy < 60) offlineCrackEstimate = 'Anni (rallentato da Argon2id/bcrypt)';
    else offlineCrackEstimate = 'Secoli / computazionalmente non praticabile';
  }

  const onlineAttackResistance =
    mfaEnabled && rateLimiting
      ? 'Alta (MFA + Rate Limiting attivi)'
      : rateLimiting
      ? 'Media (Rate Limiting attivo, ma manca MFA)'
      : 'Bassa (esposta a Password Spraying e Credential Stuffing)';

  let score = 0;
  score += Math.min(40, Math.round((effectiveEntropy / 80) * 40));
  if (algorithm === 'Argon2id') score += 30;
  else if (algorithm === 'bcrypt (cost 12)') score += 26;
  else if (algorithm === 'SHA-256 (no salt)') score += 8;
  else if (algorithm === 'NTLM') score += 5;
  else if (algorithm === 'MD5 (no salt)') score += 3;

  if (salted) score += 10;
  if (mfaEnabled) score += 12;
  if (rateLimiting) score += 8;
  if (isDictionary) score = Math.min(score, 22);
  score = Math.max(0, Math.min(100, score));

  const strengthLabel: PasswordAuditReport['strengthLabel'] =
    score >= 85 ? 'Molto Robusta' : score >= 68 ? 'Robusta' : score >= 45 ? 'Media' : score >= 25 ? 'Debole' : 'Critica';

  const consequences =
    score < 45
      ? 'Compromissione probabile dell’account in caso di data breach o attacco a dizionario, con possibile movimento laterale verso altri sistemi.'
      : score < 75
      ? 'Protezione parziale: l’account resiste agli attacchi banali ma presenta margini di miglioramento su hashing o MFA.'
      : 'Rischio residuo minimo: credenziale resistente sia ad audit offline che a tentativi automatizzati online.';

  if (recommendations.length === 0) {
    recommendations.push('Configurazione eccellente: mantieni l’uso di Password Manager, Argon2id/bcrypt e Passkey/MFA.');
  }

  return {
    entropyBits: effectiveEntropy,
    strengthLabel,
    score,
    weaknesses,
    offlineCrackEstimate,
    onlineAttackResistance,
    consequences,
    recommendations,
  };
}
