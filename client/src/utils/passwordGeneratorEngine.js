// Random Password Generator engine — mirrors calculator.net/password-generator.html.
//
// Reference behaviour (its page script, ported):
//  - One character is drawn from every ticked set first, so each ticked set appears at least once;
//    the rest is drawn from the union of the ticked sets, then the whole password is shuffled.
//  - "No Repeated Characters": every drawn character is removed from the pool; when the pool is
//    smaller than the length the reference reports "Not enough characters…".
//  - Entropy: L × log2(pool size), or log2(N × (N−1) × … × (N−L+1)) without repeats. It is rounded
//    to 0.1 bit; strength: < 36 Very Weak, < 48 Weak, < 60 Good, < 120 Strong, else Very Strong.
//  - Length: 4–100 on the slider; the number box accepts up to 5000 (below 4 → 4, above 5000 → 5000).
//  - Randomness from crypto.getRandomValues.
//
// Deliberate fixes (approved): with "Exclude Ambiguous" the digit 1 is excluded too (the reference kept
// it although its label lists it), and the backslash is in the symbol sets (the reference's JS string
// literals dropped it, although its label lists it).

export const MIN_LENGTH = 4;
export const SLIDER_MAX = 100;
export const MAX_LENGTH = 5000;
export const DEFAULT_SETTINGS = Object.freeze({
  length: 10, lower: true, upper: true, numbers: true, symbols: true, excludeAmbiguous: true, excludeBrackets: true, noRepeat: false,
});
export const OPTION_KEYS = ["lower", "upper", "numbers", "symbols", "excludeAmbiguous", "excludeBrackets", "noRepeat"];

export const MESSAGES = {
  noSet: "Please include at least one character set for the password to be based on.",
  tooLong: "Not enough characters to generate such a long non-repeating password.",
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
export const SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
export const AMBIGUOUS = "iIl1L|o0O`'-_\":;.,";
export const BRACKETS = "<>()[]{}";

const without = (set, remove) => [...set].filter((c) => !remove.includes(c)).join("");

/** The character sets in use, in the reference's order (lower, upper, numbers, symbols). */
export function characterSets(s) {
  const sets = [];
  const amb = s.excludeAmbiguous ? AMBIGUOUS : "";
  if (s.lower) sets.push(without(LOWER, amb));
  if (s.upper) sets.push(without(UPPER, amb));
  if (s.numbers) sets.push(without(DIGITS, amb));
  if (s.symbols) sets.push(without(SYMBOLS, amb + (s.excludeBrackets ? BRACKETS : "")));
  return sets;
}

/** Length box value → a whole length within 4–5000 (as the reference: < 4 → 4, > 5000 → 5000). */
export function clampLength(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < MIN_LENGTH) return MIN_LENGTH;
  if (n > MAX_LENGTH) return MAX_LENGTH;
  return Math.ceil(n); // the reference's "i < length" loops round a fractional length up
}

/** Uniform integer in [0, n) from crypto.getRandomValues (rejection sampling, no modulo bias). */
export function cryptoRandomInt(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

/** Entropy in bits, rounded to 0.1 as the reference shows it. */
export function entropyBits(length, poolSize, noRepeat) {
  let bits;
  if (noRepeat) {
    let possibilities = 1;
    for (let i = 0, n = poolSize; i < length; i++, n--) possibilities *= n;
    bits = Math.log(possibilities) / Math.LN2;
  } else {
    bits = (length * Math.log(poolSize)) / Math.LN2;
  }
  return Math.round(bits * 10) / 10;
}

export const STRENGTHS = [
  { max: 36, label: "Very Weak", bars: 1 },
  { max: 48, label: "Weak", bars: 2 },
  { max: 60, label: "Good", bars: 3 },
  { max: 120, label: "Strong", bars: 4 },
  { max: Infinity, label: "Very Strong", bars: 5 },
];
export const strengthOf = (bits) => STRENGTHS.find((s) => bits < s.max);

/**
 * Generates one password. `randomInt(n)` (default: crypto) returns an integer in [0, n).
 * Returns { error } or { password, entropy, strength, poolSize, length }.
 */
export function generatePassword(settings, randomInt = cryptoRandomInt) {
  const length = clampLength(settings.length);
  const sets = characterSets(settings);
  if (!sets.length) return { error: MESSAGES.noSet };

  const take = (arr) => arr.splice(randomInt(arr.length), 1)[0];
  const pick = (arr) => arr[randomInt(arr.length)];
  const chars = [];
  let pool = [];
  for (const set of sets) {
    const arr = [...set];
    chars.push(settings.noRepeat ? take(arr) : pick(arr));
    pool = pool.concat(arr);
  }
  const poolSize = pool.length + (settings.noRepeat ? chars.length : 0);
  if (settings.noRepeat && poolSize < length) return { error: MESSAGES.tooLong };

  while (chars.length < length) chars.push(settings.noRepeat ? take(pool) : pick(pool));
  // Shuffle so the guaranteed characters aren't always first (Fisher–Yates; the reference picks
  // characters out one at a time at random, which gives the same uniform order).
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const entropy = entropyBits(length, poolSize, settings.noRepeat);
  return { password: chars.join(""), entropy, strength: strengthOf(entropy), poolSize, length };
}

/** Saved settings come from browser storage: keep only well-formed values. */
export function sanitizeSettings(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...DEFAULT_SETTINGS };
  const out = { ...DEFAULT_SETTINGS };
  for (const k of OPTION_KEYS) if (typeof raw[k] === "boolean") out[k] = raw[k];
  if (raw.length !== undefined) out.length = clampLength(raw.length);
  return out;
}
