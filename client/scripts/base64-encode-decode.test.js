// Plain-Node test suite for the Base64 Encode / Decode engine.
// Run with:
//   node scripts/base64-encode-decode.test.js
//
// Expected values: RFC 4648 §10 test vectors, the reference page's worked examples
// (text → dGV4dA==, Dog → RG9n, Do → RG8=, Dogs → RG9ncw==) and its error messages.

import {
  encodeText, decodeText, encodeFile, decodeFile, bytesToBase64, base64ToBytes, sanitizeFilename, downloadName,
  formatBytes, CHARSETS, MESSAGES,
} from "../src/utils/base64EncodeDecodeEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; console.error(`✗ ${name} — got ${a}, expected ${e}`); }
}
const enc = (s) => encodeText(s).output;
const dec = (s, cs) => decodeText(s, cs).output;
const bytes = (...b) => new Uint8Array(b);
const ascii = (s) => new TextEncoder().encode(s);

// ── RFC 4648 §10 vectors ──
for (const [plain, b64] of [["f", "Zg=="], ["fo", "Zm8="], ["foo", "Zm9v"], ["foob", "Zm9vYg=="], ["fooba", "Zm9vYmE="], ["foobar", "Zm9vYmFy"]]) {
  eq(`encode ${plain}`, enc(plain), b64);
  eq(`decode ${b64}`, dec(b64), plain);
}

// ── Reference page examples ──
eq("screenshot encode", enc("text"), "dGV4dA==");
eq("screenshot decode", dec("dGV4dA=="), "text");
eq("Dog", enc("Dog"), "RG9n");
eq("Do", enc("Do"), "RG8=");
eq("Dogs", enc("Dogs"), "RG9ncw==");

// ── Text encode is always UTF-8 ──
eq("utf-8 é", enc("héllo"), "aMOpbGxv");
eq("emoji", enc("😀"), "8J+YgA==");
eq("CJK", enc("你好"), "5L2g5aW9");
eq("newline kept", enc("a\nb"), "YQpi");
eq("input bytes", encodeText("héllo").inputBytes, 6);
eq("emoji round trip", dec(enc("I ♥ 😀 Tolz")), "I ♥ 😀 Tolz");

// ── Empty input ──
eq("empty encode", encodeText(""), { missing: ["text"], message: MESSAGES.emptyEncode });
eq("empty decode", decodeText(""), { missing: ["text"], message: MESSAGES.emptyDecode });
eq("space is not empty", enc(" "), "IA==");

// ── Forgiving decode (atob) ──
eq("no padding", dec("dGV4dA"), "text");
eq("one of two pads (atob rejects)", decodeText("dGV4dA=").error, MESSAGES.badText);
eq("whitespace ignored", dec(" dGV4\r\n\tdA== "), "text");
eq("bad char", decodeText("dGV4*A==").error, MESSAGES.badText);
eq("length 4n+1", decodeText("dGV4d").error, MESSAGES.badText);
eq("url-safe rejected", decodeText("-_-_").error, MESSAGES.badText);
eq("pad in middle", decodeText("dG==V4").error, MESSAGES.badText);
eq("whitespace only", decodeText("   ").output, "");

// ── Character sets when decoding ──
eq("latin1 é", dec("6Q==", "iso-8859-1"), "é");
eq("utf-8 bad byte → U+FFFD", dec("6Q==", "utf-8"), "�");
// Node's windows-1252 decoder drops 0x80 (browsers give "€"); that byte is checked in the browser instead.
eq("ASCII = windows-1252", dec("6Q==", "ascii"), "é");
eq("utf-16le", dec("aABpAA==", "utf-16le"), "hi");
eq("utf-16be", dec("AGgAaQ==", "utf-16be"), "hi");
eq("utf-16le BOM stripped", dec("//5oAGkA", "utf-16le"), "hi");
eq("windows-1251", dec("z/Do4uXy", "windows-1251"), "Привет");
eq("koi8-r", dec("8NLJ18XU", "koi8-r"), "Привет");
eq("shift-jis", dec("grGC8YLJgr+CzQ==", "shift-jis"), "こんにちは");
eq("gb2312", dec("xOO6ww==", "gb2312"), "你好");
eq("big5", dec("p0Gmbg==", "big5"), "你好");
eq("euc-kr", dec("vsiz58fPvLy/5A==", "euc-kr"), "안녕하세요");
eq("windows-1253", dec("4ePh", "windows-1253"), "αγα");
eq("unknown charset falls back to utf-8", dec("dGV4dA==", "nope"), "text");
eq("40 charsets", CHARSETS.length, 40);
eq("unique keys", new Set(CHARSETS.map((c) => c.value)).size, 40);
// Every label must be one TextDecoder accepts (Node's ICU lacks ISO-8859-16; browsers have it).
for (const c of CHARSETS.filter((x) => x.encoding !== "iso-8859-16")) {
  let ok = true;
  try { new TextDecoder(c.encoding); } catch { ok = false; }
  eq(`TextDecoder accepts ${c.encoding}`, ok, true);
}

// ── Bytes helpers / large input (reference overflows the stack here) ──
const big = new Uint8Array(3 * 1024 * 1024 + 1).map((_, i) => (i * 31 + 7) & 255);
const bigB64 = bytesToBase64(big);
eq("big length", bigB64.length, 4 * Math.ceil(big.length / 3));
eq("big round trip", Buffer.from(base64ToBytes(bigB64)).equals(Buffer.from(big)), true);
eq("matches Node Buffer", bigB64 === Buffer.from(big).toString("base64"), true);
eq("all 256 byte values", bytesToBase64(new Uint8Array(256).map((_, i) => i)), Buffer.from(new Uint8Array(256).map((_, i) => i)).toString("base64"));

// ── File tool ──
eq("encode file", encodeFile(bytes(0x89, 0x50, 0x4e, 0x47)).output, "iVBORw==");
eq("encode empty file", encodeFile(new Uint8Array(0)).error, MESSAGES.noFileEncode);
eq("encode no file", encodeFile(null).error, MESSAGES.noFileEncode);
eq("decode empty file", decodeFile(new Uint8Array(0)).error, MESSAGES.noFileDecode);
eq("decode text file", decodeFile(ascii("dGV4dA==\n"), "txt", "utf-8").output, "text");
eq("decode text file BOM", decodeFile(bytes(0xef, 0xbb, 0xbf, ...ascii("dGV4dA==")), "txt").output, "text");
eq("decode text file charset", decodeFile(ascii("6Q=="), "txt", "windows-1252").output, "é");
eq("decode binary", Array.from(decodeFile(ascii("iVBORw=="), "img").binary), [0x89, 0x50, 0x4e, 0x47]);
eq("decode binary bytes", decodeFile(ascii("iVBORw=="), "img").outputBytes, 4);
eq("decode bad file", decodeFile(bytes(0x89, 0x50, 0x4e, 0x47), "img").error, MESSAGES.badFile);
eq("decode utf-8 non-ascii file", decodeFile(ascii("dGV4dA==é"), "txt").error, MESSAGES.badFile);

// ── Download names ──
eq("default text name", downloadName("", true, 1700000001234), "base64-1234.txt");
eq("default binary name", downloadName("  ", false, 1700000001234), "base64-1234");
eq("typed name kept", downloadName("photo.png", false), "photo.png");
eq("path stripped", sanitizeFilename("../../etc/passwd"), "_.._etc_passwd");
eq("reserved chars", sanitizeFilename('a<b>:c"d|e?f*g'), "a_b__c_d_e_f_g");
eq("control chars", sanitizeFilename("a\u0000b\nc"), "a_b_c");
eq("trailing dots", sanitizeFilename(" name. "), "name");

// ── Sizes ──
eq("bytes", formatBytes(1), "1 byte");
eq("bytes plural", formatBytes(1000), "1,000 bytes");
eq("KB", formatBytes(2048), "2.0 KB");
eq("MB", formatBytes(3 * 1024 * 1024), "3.00 MB");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
