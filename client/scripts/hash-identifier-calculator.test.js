// Plain-Node test suite for the Hash Identifier engine.
// Run with:
//   node scripts/hash-identifier-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/hash-identifier): its custom JS and live answers, with
// the table corrections documented in the engine.

import { identifyHash, EXAMPLES, TABLE } from "../src/utils/hashIdentifierCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const sum = (t) => {
  const r = identifyHash(t);
  if (r.empty) return "EMPTY";
  if (r.notHex) return "NOT HEX";
  return r.candidates.length ? `${r.bits} bits: ${r.candidates.join(", ")}` : `${r.length} digits: non-standard`;
};

// live answers (unchanged by the table fixes)
eq("MD5 example", sum("d41d8cd98f00b204e9800998ecf8427e"), "128 bits: MD5, MD4, NTLM, RIPEMD-128, Tiger-128, FNV-1 128, FNV-1a 128");
eq("0x and upper case", sum("0xD41D8CD98F00B204E9800998ECF8427E"), "128 bits: MD5, MD4, NTLM, RIPEMD-128, Tiger-128, FNV-1 128, FNV-1a 128");
eq("surrounding spaces trimmed", sum("  d41d8cd98f00b204e9800998ecf8427e "), "128 bits: MD5, MD4, NTLM, RIPEMD-128, Tiger-128, FNV-1 128, FNV-1a 128");
eq("SHA-1 example", sum(EXAMPLES[4]), "160 bits: SHA-1, RIPEMD-160, Tiger-160");
eq("abc", sum("abc"), "3 digits: non-standard");
eq("xyz123", sum("xyz123"), "NOT HEX");
eq("inner space", sum("d41d 8cd9"), "NOT HEX");
eq("0x alone", sum("0x"), "NOT HEX");
eq("blank", sum("   "), "EMPTY");
eq("SHA-256", sum("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"), "256 bits: SHA-256, SHA3-256, SHA-512/256, RIPEMD-256, FNV-1 256, FNV-1a 256");
// corrected entries
eq("CRC32 + FNV-1 32", sum(EXAMPLES[0]), "32 bits: CRC32, FNV-1 32, FNV-1a 32");
eq("64-bit: no RIPEMD-128", sum(EXAMPLES[1]), "64 bits: CRC64, FNV-1 64, FNV-1a 64");
eq("24 digits: no fake sizes", sum("a".repeat(24)), "24 digits: non-standard");
eq("28 digits", sum("a".repeat(28)), "28 digits: non-standard");
eq("96 digits", sum("a".repeat(96)), "384 bits: SHA-384, SHA3-384");
// FNV / Tiger / RIPEMD names carry their size in bits: each must sit under its own hex length (bits / 4)
eq("sized names match their length", Object.entries(TABLE).every(([len, names]) => names
  .filter((n) => /^(FNV|Tiger|RIPEMD)/.test(n)).every((n) => Number(n.match(/(\d+)$/)[1]) === Number(len) * 4)), true);
eq("table size", Object.values(TABLE).flat().length, 36);
eq("bytes", identifyHash(EXAMPLES[2]).bytes, 16);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
