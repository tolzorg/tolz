// Hash Identifier engine — matches omnicalculator.com/other/hash-identifier (its custom JS was read from the page and
// its answers checked live, see scripts/hash-identifier-calculator.test.js).
//
// Like the reference: the input is trimmed, an optional "0x" prefix is dropped, upper and lower case are accepted, and
// anything else that isn't 0-9 / a-f (spaces inside included) gets "Input a hex value!". The hash functions that could
// have produced the digest are looked up by its number of hex digits (4 bits each); a length with no candidates is a
// "Non-standard hash length."
//
// Deviations (flagged to the user), fixing entries in the reference's table whose size doesn't match the length they are
// listed under: RIPEMD-128 is only offered for 32 hex digits (the reference also lists it under 16), Tiger-128 / -160 /
// -192 only for 32 / 40 / 48 digits (the reference also lists Tiger-128 under 28 and Tiger-160 and a "truncated"
// Tiger-192 under 24), and FNV-1 / FNV-1a only in their defined sizes (32, 64, 128, 256, 512, 1024 bits), so FNV-1 32
// is added for 8 digits and the non-existent 96, 112, 192 and 384-bit variants are dropped.

export const MESSAGES = {
  notHex: "Input a hex value! (digits and letters a to f only)",
  unknown: "Non-standard hash length.",
  prompt: "Input a hash...",
};
/** The reference's examples. */
export const EXAMPLES = ["3f4c9f2b", "1a2b3c4d5e6f7a8b", "d41d8cd98f00b204e9800998ecf8427e", "6dcd4ce23d88e2ee9568ba546c007c63", "a9993e364706816aba3e25717850c26c9cd0d89d"];

const fnv = (bits) => [`FNV-1 ${bits}`, `FNV-1a ${bits}`];
/** Number of hex digits → candidate hash functions (the reference's order). */
export const TABLE = {
  8: ["CRC32", ...fnv(32)],
  16: ["CRC64", ...fnv(64)],
  32: ["MD5", "MD4", "NTLM", "RIPEMD-128", "Tiger-128", ...fnv(128)],
  40: ["SHA-1", "RIPEMD-160", "Tiger-160"],
  48: ["Tiger-192"],
  56: ["SHA-224", "SHA3-224", "SHA-512/224"],
  64: ["SHA-256", "SHA3-256", "SHA-512/256", "RIPEMD-256", ...fnv(256)],
  80: ["RIPEMD-320"],
  96: ["SHA-384", "SHA3-384"],
  128: ["SHA-512", "SHA3-512", "Whirlpool", ...fnv(512)],
  256: fnv(1024),
};

/** A short note on how each family is used today. */
const NOTES = {
  CRC: "checksum, not cryptographic", FNV: "fast non-cryptographic hash", MD5: "broken, avoid for security", MD4: "broken, avoid for security",
  NTLM: "Windows password hash", "SHA-1": "deprecated for security", RIPEMD: "cryptographic", Tiger: "cryptographic",
  "SHA-2": "secure, widely used", "SHA-3": "secure, modern", Whirlpool: "cryptographic",
};
export function noteFor(name) {
  if (name.startsWith("CRC")) return NOTES.CRC;
  if (name.startsWith("FNV")) return NOTES.FNV;
  if (name.startsWith("SHA3")) return NOTES["SHA-3"];
  if (/^SHA-(224|256|384|512)/.test(name)) return NOTES["SHA-2"];
  if (name.startsWith("RIPEMD")) return NOTES.RIPEMD;
  if (name.startsWith("Tiger")) return NOTES.Tiger;
  return NOTES[name] || "";
}

/**
 * @param {string} text  the typed hash
 * @returns {{ empty: true } | { notHex: true } | { hex: string, length: number, bits: number, bytes: number, candidates: string[] }}
 */
export function identifyHash(text) {
  const s = String(text ?? "").trim();
  if (s === "") return { empty: true };
  const hex = s.startsWith("0x") ? s.slice(2) : s;
  if (!/^[0-9a-fA-F]+$/.test(hex)) return { notHex: true };
  return { hex: hex.toLowerCase(), length: hex.length, bits: hex.length * 4, bytes: hex.length / 2, candidates: TABLE[hex.length] || [] };
}

/** The lengths the identifier knows, for the reference table on the page. */
export const KNOWN_LENGTHS = Object.keys(TABLE).map(Number);
