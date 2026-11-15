// Plain-Node test suite for the URL Encode / Decode engine.
// Run with:
//   node scripts/url-encode-decode.test.js
//
// Expected values: the reference page's screenshot and worked examples (^ → %5E, < → %3C, Ω → %CE%A9, β → %CE%B2,
// "encode / and ?" → encode%20%2F%20and%20%3F) and its error messages.

import { encodeUrl, decodeUrl, prefillFrom, MESSAGES, RESERVED, UNRESERVED } from "../src/utils/urlEncodeDecodeEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; console.error(`✗ ${name} — got ${a}, expected ${e}`); }
}
const enc = (s) => encodeUrl(s).output;
const dec = (s) => decodeUrl(s).output;

// ── Reference screenshot and examples ──
eq("screenshot", enc("https://meyerweb.com/eric/tools/dencoder/"), "https%3A%2F%2Fmeyerweb.com%2Feric%2Ftools%2Fdencoder%2F");
eq("screenshot back", dec("https%3A%2F%2Fmeyerweb.com%2Feric%2Ftools%2Fdencoder%2F"), "https://meyerweb.com/eric/tools/dencoder/");
eq("^", enc("^"), "%5E");
eq("<", enc("<"), "%3C");
eq("Ω", enc("Ω"), "%CE%A9");
eq("β", enc("β"), "%CE%B2");
eq("toprocess example", enc("encode / and ?"), "encode%20%2F%20and%20%3F");

// ── encodeURIComponent character classes ──
eq("unreserved untouched", enc(UNRESERVED), UNRESERVED);
eq("!'()* untouched", enc("!'()*"), "!'()*");
eq("other reserved encoded", enc("#$&+,/:;=?@[]"), "%23%24%26%2B%2C%2F%3A%3B%3D%3F%40%5B%5D");
eq("reserved list", RESERVED, "!#$&'()*+,/:;=?@[]");
eq("space → %20", enc("a b"), "a%20b");
eq("percent", enc("100%"), "100%25");
eq("emoji", enc("😀"), "%F0%9F%98%80");
eq("CJK", enc("你好"), "%E4%BD%A0%E5%A5%BD");
eq("inner newline", enc("a\nb"), "a%0Ab");
eq("quotes", enc('"<>`{}|\\'), "%22%3C%3E%60%7B%7D%7C%5C");

// ── Trim (ref trims; empty check is on the untrimmed text) ──
eq("trimmed", enc("  a b \n"), "a%20b");
eq("whitespace only → empty result", encodeUrl("   "), { mode: "encode", output: "" });
eq("decode trimmed", dec("  a%20b\n"), "a b");

// ── Errors ──
eq("empty encode", encodeUrl(""), { missing: ["text"], message: MESSAGES.emptyEncode });
eq("empty decode", decodeUrl(""), { missing: ["text"], message: MESSAGES.emptyDecode });
eq("lone surrogate", encodeUrl("a\uD800b").error, MESSAGES.badEncode);
eq("bad %", decodeUrl("100%").error, MESSAGES.badDecode);
eq("bad hex", decodeUrl("%G1").error, MESSAGES.badDecode);
eq("bad utf-8", decodeUrl("%E9").error, MESSAGES.badDecode);
eq("truncated utf-8", decodeUrl("%CE").error, MESSAGES.badDecode);

// ── Decode details ──
eq("plus kept", dec("a+b"), "a+b");
eq("lower-case hex", dec("%ce%a9"), "Ω");
eq("plain text passes", dec("hello world"), "hello world");
eq("double encoded once", dec("%2520"), "%20");
eq("reserved decoded", dec("%23%24%26%2B%2C%2F%3A%3B%3D%3F%40%5B%5D"), "#$&+,/:;=?@[]");
eq("emoji back", dec("%F0%9F%98%80"), "😀");

// ── Round trip ──
for (const s of ["Tolz.org/a?b=c&d=e#f", "naïve café — 100% ✓", "😀 你好 Привет", "!*'();:@&=+$,/?#[]"]) {
  eq(`round trip ${s}`, dec(enc(s)), s);
}

// ── ?toprocess= pre-fill ──
eq("prefill", prefillFrom("?toprocess=encode%20%2F%20and%20%3F"), "encode / and ?");
eq("prefill none", prefillFrom("?x=1"), "");
eq("prefill empty search", prefillFrom(""), "");
eq("prefill cap", prefillFrom(`?toprocess=${"a".repeat(200000)}`).length, 100000);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
