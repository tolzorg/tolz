// Plain-Node test suite for the Password Generator engine.
// Run with:
//   node scripts/password-generator.test.js
//
// Expected values come from the reference page's script (calculator.net/password-generator.html): its character
// sets (with the two approved fixes: "1" excluded as ambiguous, backslash kept in the symbols), entropy formulas,
// strength bands and messages. The screenshot's 10-character default password shows 60.9 bits.

import {
  generatePassword, characterSets, entropyBits, strengthOf, clampLength, sanitizeSettings, cryptoRandomInt,
  DEFAULT_SETTINGS, MESSAGES, SYMBOLS,
} from "../src/utils/passwordGeneratorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; console.error(`✗ ${name} — got ${a}, expected ${e}`); }
}
const S = (patch) => ({ ...DEFAULT_SETTINGS, ...patch });
const none = { lower: false, upper: false, numbers: false, symbols: false };

// ── Character sets ──
const [lo, up, num, sym] = characterSets(DEFAULT_SETTINGS);
eq("lower amb", lo, "abcdefghjkmnpqrstuvwxyz");
eq("upper amb", up, "ABCDEFGHJKMNPQRSTUVWXYZ");
eq("digits amb (fix: no 1)", num, "23456789");
eq("symbols amb+brackets", sym, "!#$%&*+/=?@\\^~");
eq("full symbols", SYMBOLS.length, 32);
eq("symbols none excluded", characterSets(S({ ...none, symbols: true, excludeAmbiguous: false, excludeBrackets: false }))[0], SYMBOLS);
eq("symbols brackets only", characterSets(S({ ...none, symbols: true, excludeAmbiguous: false }))[0], "!\"#$%&'*+,-./:;=?@\\^_`|~");
eq("symbols amb only", characterSets(S({ ...none, symbols: true, excludeBrackets: false }))[0], "!#$%&()*+/<=>?@[\\]^{}~");
eq("all, nothing excluded", characterSets(S({ excludeAmbiguous: false, excludeBrackets: false })).join("").length, 26 + 26 + 10 + 32);
eq("default pool", characterSets(DEFAULT_SETTINGS).join("").length, 23 + 23 + 8 + 14);

// ── Entropy & strength (reference formulas) ──
eq("default 10 chars", entropyBits(10, 68, false), 60.9); // screenshot: 60.9 bits, Strong
eq("default strength", strengthOf(60.9).label, "Strong");
eq("no-repeat 10 of 68", entropyBits(10, 68, true), Math.round(Math.log2(68 * 67 * 66 * 65 * 64 * 63 * 62 * 61 * 60 * 59) * 10) / 10);
eq("very weak", strengthOf(35.9).label, "Very Weak");
eq("weak at 36", strengthOf(36).label, "Weak");
eq("good at 48", strengthOf(48).label, "Good");
eq("strong at 60", strengthOf(60).label, "Strong");
eq("very strong at 120", strengthOf(120).label, "Very Strong");
eq("bars", [35, 40, 50, 70, 130].map((b) => strengthOf(b).bars), [1, 2, 3, 4, 5]);

// ── Length ──
eq("clamp low", clampLength(2), 4);
eq("clamp blank", clampLength(""), 4);
eq("clamp text", clampLength("abc"), 4);
eq("clamp high", clampLength(9000), 5000);
eq("fraction up", clampLength("10.5"), 11);
eq("101 allowed", clampLength(101), 101);

// ── Generation ──
const sets = characterSets(DEFAULT_SETTINGS);
for (let t = 0; t < 2000; t++) {
  const len = 4 + (t % 30);
  const r = generatePassword(S({ length: len }));
  if (r.password.length !== len) { eq("length", r.password.length, len); break; }
  if (!sets.every((set) => [...r.password].some((c) => set.includes(c)))) { eq("every set present", r.password, "one of each"); break; }
  if (![...r.password].every((c) => sets.join("").includes(c))) { eq("only allowed chars", r.password, "allowed"); break; }
}
passed++;
const r10 = generatePassword(DEFAULT_SETTINGS);
eq("result shape", [r10.length, r10.poolSize, r10.entropy, r10.strength.label], [10, 68, 60.9, "Strong"]);

// No repeats
for (let t = 0; t < 500; t++) {
  const r = generatePassword(S({ length: 68, noRepeat: true }));
  if (new Set(r.password).size !== 68) { eq("unique", new Set(r.password).size, 68); break; }
}
passed++;
eq("no-repeat too long", generatePassword(S({ length: 69, noRepeat: true })).error, MESSAGES.tooLong);
eq("no-repeat digits only 8", generatePassword(S({ ...none, numbers: true, length: 8, noRepeat: true })).password.split("").sort().join(""), "23456789");
eq("no set", generatePassword(S(none)).error, MESSAGES.noSet);
eq("exclude flags alone", generatePassword(S({ ...none, excludeAmbiguous: true, excludeBrackets: true, noRepeat: true })).error, MESSAGES.noSet);
eq("5000 chars", generatePassword(S({ length: 5000 })).password.length, 5000);
eq("5000 entropy", generatePassword(S({ length: 5000 })).entropy, Math.round(5000 * Math.log2(68) * 10) / 10);

// Distribution: with only digits, each of 8 digits should appear ~1/8 of the time.
const counts = {};
const big = generatePassword(S({ ...none, numbers: true, length: 5000 })).password + generatePassword(S({ ...none, numbers: true, length: 5000 })).password;
for (const c of big) counts[c] = (counts[c] || 0) + 1;
eq("8 digits used", Object.keys(counts).sort().join(""), "23456789");
eq("roughly uniform", Object.values(counts).every((n) => n > 1100 && n < 1400), true);

// Deterministic RNG: always index 0 → guaranteed chars then pool[0], then the fixed shuffle.
const zero = () => 0;
eq("deterministic", generatePassword(S({ length: 4 }), zero).password.length, 4);
const ints = Array.from({ length: 5000 }, () => cryptoRandomInt(3));
eq("cryptoRandomInt range", ints.every((n) => n >= 0 && n < 3) && new Set(ints).size === 3, true);

// ── Saved settings (browser storage is untrusted) ──
eq("sanitize null", sanitizeSettings(null), { ...DEFAULT_SETTINGS });
eq("sanitize junk", sanitizeSettings({ lower: "yes", length: "abc", __proto__: { upper: false } }).lower, true);
eq("sanitize keeps", sanitizeSettings({ lower: false, noRepeat: true, length: 24 }), { ...DEFAULT_SETTINGS, lower: false, noRepeat: true, length: 24 });
eq("sanitize clamps", sanitizeSettings({ length: 99999 }).length, 5000);
eq("sanitize array", sanitizeSettings([1, 2]), { ...DEFAULT_SETTINGS });

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
