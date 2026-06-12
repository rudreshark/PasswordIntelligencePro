// Password intelligence utilities for PassCheck Matrix
// All operations are client-side.

export type BreachStatus = "safe" | "breached" | "unknown" | "checking";

export interface Analysis {
  password: string;
  length: number;
  poolSize: number;
  entropyBits: number;
  score: number; // 0-100
  label: "Empty" | "Critical" | "Weak" | "Moderate" | "Strong" | "Fortress";
  flags: {
    hasLower: boolean;
    hasUpper: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
    repeats: boolean;
    sequence: boolean;
    keyboardWalk: boolean;
    commonToken: boolean;
  };
  reasons: string[];
  crackEstimate: string;
  radar: { axis: string; value: number; full: number }[];
  breach: BreachStatus;
}

const COMMON_TOKENS = [
  "password",
  "passw0rd",
  "letmein",
  "welcome",
  "admin",
  "qwerty",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "111111",
  "123456",
  "12345678",
  "sunshine",
  "princess",
  "shadow",
  "master",
  "login",
  "trustno1",
  "starwars",
];
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "azertyuiop", "qazwsx"];

function hasSequentialRun(s: string, minLen = 4): boolean {
  if (s.length < minLen) return false;
  let run = 1;
  for (let i = 1; i < s.length; i++) {
    const diff = s.charCodeAt(i) - s.charCodeAt(i - 1);
    if (diff === 1 || diff === -1) {
      run++;
      if (run >= minLen) return true;
    } else run = 1;
  }
  return false;
}

function hasKeyboardWalk(s: string, minLen = 4): boolean {
  const low = s.toLowerCase();
  return KEYBOARD_ROWS.some((row) => {
    for (let i = 0; i <= row.length - minLen; i++) {
      const slice = row.slice(i, i + minLen);
      if (low.includes(slice) || low.includes(slice.split("").reverse().join(""))) return true;
    }
    return false;
  });
}

function hasRepeats(s: string): boolean {
  return /(.)\1{2,}/.test(s);
}

function containsCommonToken(s: string): boolean {
  const low = s.toLowerCase();
  return COMMON_TOKENS.some((t) => low.includes(t));
}

function poolSizeFor(s: string): number {
  let pool = 0;
  if (/[a-z]/.test(s)) pool += 26;
  if (/[A-Z]/.test(s)) pool += 26;
  if (/[0-9]/.test(s)) pool += 10;
  if (/[^A-Za-z0-9]/.test(s)) pool += 33;
  return pool;
}

export function entropyBits(s: string): number {
  const pool = poolSizeFor(s);
  if (!pool || !s.length) return 0;
  return s.length * Math.log2(pool);
}

function humanCrackTime(bits: number): string {
  // Assume 1e10 guesses/sec (offline fast hash). 2^bits / rate seconds.
  const seconds = Math.pow(2, bits) / 1e10;
  if (!isFinite(seconds)) return "centuries+";
  if (seconds < 1) return "instant";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} d`;
  const years = seconds / 31536000;
  if (years < 1000) return `${years.toFixed(1)} yr`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)}k yr`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)}M yr`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)}B yr`;
  return "centuries+";
}

export function analyze(password: string, breach: BreachStatus = "unknown"): Analysis {
  const len = password.length;
  const pool = poolSizeFor(password);
  const ent = entropyBits(password);

  const flags = {
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    repeats: hasRepeats(password),
    sequence: hasSequentialRun(password),
    keyboardWalk: hasKeyboardWalk(password),
    commonToken: containsCommonToken(password),
  };

  let score = 0;
  // length contribution (max 35)
  score += Math.min(35, len * 2.5);
  // pool diversity (max 30)
  const classes = [flags.hasLower, flags.hasUpper, flags.hasDigit, flags.hasSymbol].filter(
    Boolean,
  ).length;
  score += classes * 7.5;
  // entropy (max 25)
  score += Math.min(25, ent / 4);
  // penalties
  if (flags.repeats) score -= 12;
  if (flags.sequence) score -= 14;
  if (flags.keyboardWalk) score -= 16;
  if (flags.commonToken) score -= 25;
  if (breach === "breached") score -= 60;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const reasons: string[] = [];
  if (!len) reasons.push("Awaiting input — enter a candidate cipher.");
  else {
    if (len < 12) reasons.push("Length below 12 chars — extend the cipher.");
    if (classes < 3) reasons.push("Low character pool diversity — mix cases, digits, symbols.");
    if (flags.repeats) reasons.push("Repeated character runs detected.");
    if (flags.sequence) reasons.push("Sequential run detected (e.g. 1234, abcd).");
    if (flags.keyboardWalk) reasons.push("Keyboard walk pattern detected (e.g. qwerty).");
    if (flags.commonToken) reasons.push("Common weak token present in dictionary blacklist.");
    if (breach === "breached")
      reasons.push("⚠ Found in public breach corpus — discard immediately.");
    if (!reasons.length) reasons.push("No weakness patterns detected — strong candidate.");
  }

  let label: Analysis["label"] = "Empty";
  if (!len) label = "Empty";
  else if (score < 25) label = "Critical";
  else if (score < 50) label = "Weak";
  else if (score < 70) label = "Moderate";
  else if (score < 90) label = "Strong";
  else label = "Fortress";

  const radar = [
    { axis: "Entropy", value: Math.min(100, ent), full: 100 },
    { axis: "Pool Span", value: Math.min(100, (pool / 95) * 100), full: 100 },
    { axis: "Bit Length", value: Math.min(100, (len / 32) * 100), full: 100 },
    {
      axis: "Complexity",
      value: Math.min(
        100,
        classes * 20 -
          (flags.repeats ? 15 : 0) -
          (flags.sequence ? 15 : 0) -
          (flags.keyboardWalk ? 15 : 0),
      ),
      full: 100,
    },
    {
      axis: "Breach Margin",
      value: breach === "breached" ? 5 : breach === "safe" ? 100 : Math.max(20, score * 0.8),
      full: 100,
    },
  ].map((r) => ({ ...r, value: Math.max(0, r.value) }));

  return {
    password,
    length: len,
    poolSize: pool,
    entropyBits: ent,
    score,
    label,
    flags,
    reasons,
    crackEstimate: humanCrackTime(ent),
    radar,
    breach,
  };
}

// CSPRNG generation using Web Crypto API
const POOLS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};

export function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
}): string {
  let pool = "";
  const required: string[] = [];
  if (opts.lower) {
    pool += POOLS.lower;
    required.push(POOLS.lower);
  }
  if (opts.upper) {
    pool += POOLS.upper;
    required.push(POOLS.upper);
  }
  if (opts.digits) {
    pool += POOLS.digits;
    required.push(POOLS.digits);
  }
  if (opts.symbols) {
    pool += POOLS.symbols;
    required.push(POOLS.symbols);
  }
  if (!pool) pool = POOLS.lower + POOLS.upper + POOLS.digits;

  const out: string[] = [];
  const buf = new Uint32Array(opts.length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < opts.length; i++) {
    out.push(pool[buf[i] % pool.length]);
  }
  // Guarantee each required class is present
  const oneBuf = new Uint32Array(required.length);
  crypto.getRandomValues(oneBuf);
  required.forEach((set, idx) => {
    const pos = oneBuf[idx] % opts.length;
    out[pos] = set[buf[idx] % set.length];
  });
  return out.join("");
}

// Diceware-ish passphrase using small word list
const WORDS = [
  "atlas",
  "ember",
  "quartz",
  "nimbus",
  "raven",
  "cobalt",
  "onyx",
  "cipher",
  "matrix",
  "vector",
  "lunar",
  "solstice",
  "phantom",
  "helix",
  "zenith",
  "obsidian",
  "tundra",
  "mercury",
  "nebula",
  "prism",
  "orbit",
  "glacier",
  "ember",
  "forge",
  "aurora",
  "beacon",
  "cinder",
  "drift",
  "flint",
  "horizon",
  "ion",
  "jade",
  "kelp",
  "loom",
  "mosaic",
  "nova",
  "oracle",
  "pulse",
  "quasar",
  "rune",
  "saber",
  "talon",
  "umbra",
  "void",
  "wraith",
  "xenon",
  "yonder",
  "zephyr",
  "ash",
  "blade",
];

export function generatePassphrase(words = 4, sep = "-"): string {
  const buf = new Uint32Array(words);
  crypto.getRandomValues(buf);
  const parts: string[] = [];
  for (let i = 0; i < words; i++) parts.push(WORDS[buf[i] % WORDS.length]);
  // Append a small numeric salt
  const saltBuf = new Uint32Array(1);
  crypto.getRandomValues(saltBuf);
  parts.push(String(saltBuf[0] % 100).padStart(2, "0"));
  return parts.join(sep);
}

// SHA-1 hex (used for HIBP k-anonymity)
export async function sha1Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// HIBP Pwned Passwords k-anonymity lookup. Returns count (0 if not found).
export async function checkHIBP(password: string): Promise<number> {
  if (!password) return 0;
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) throw new Error(`HIBP responded ${res.status}`);
  const text = await res.text();
  for (const line of text.split("\n")) {
    const [suf, countStr] = line.trim().split(":");
    if (suf === suffix) return parseInt(countStr || "0", 10);
  }
  return 0;
}

// Compliance policy auditor
export interface PolicyRule {
  id: string;
  label: string;
  description: string;
  test: (a: Analysis) => boolean; // returns true on PASS
}

export const DEFAULT_POLICIES: PolicyRule[] = [
  {
    id: "min-length",
    label: "Minimum length ≥ 12",
    description: "Passwords must be at least 12 characters long.",
    test: (a) => a.length >= 12,
  },
  {
    id: "diversity",
    label: "≥ 3 character classes",
    description: "Use a mix of lower, upper, digits, and symbols.",
    test: (a) =>
      [a.flags.hasLower, a.flags.hasUpper, a.flags.hasDigit, a.flags.hasSymbol].filter(Boolean)
        .length >= 3,
  },
  {
    id: "no-sequence",
    label: "No sequential runs",
    description: "Avoid patterns like 1234, abcd.",
    test: (a) => !a.flags.sequence,
  },
  {
    id: "no-keyboard",
    label: "No keyboard walks",
    description: "Avoid qwerty, asdf, zxcv style walks.",
    test: (a) => !a.flags.keyboardWalk,
  },
  {
    id: "no-repeats",
    label: "No repeated runs",
    description: "Avoid aaa, 111 style runs.",
    test: (a) => !a.flags.repeats,
  },
  {
    id: "no-common",
    label: "No common weak tokens",
    description: "Avoid dictionary tokens like password, admin, letmein.",
    test: (a) => !a.flags.commonToken,
  },
  {
    id: "entropy",
    label: "Entropy ≥ 60 bits",
    description: "Estimated entropy must meet the 60-bit baseline.",
    test: (a) => a.entropyBits >= 60,
  },
  {
    id: "not-breached",
    label: "Not found in breach corpus",
    description: "Must not appear in known breach datasets (when checked).",
    test: (a) => a.breach !== "breached",
  },
];
