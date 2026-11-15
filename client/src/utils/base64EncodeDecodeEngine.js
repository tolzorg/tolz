// Base64 Encode / Decode engine — mirrors calculator.net/base64-encode-decode.html.
//
// Reference behaviour (its page script, ported):
//  - Text encode: the text is always turned into UTF-8 bytes (TextEncoder), then Base64 —
//    the "Character" choice is not used when encoding.
//  - Text decode: window.atob (the WHATWG "forgiving-base64" decoder: ASCII whitespace is
//    ignored, padding is optional, anything else outside A–Z a–z 0–9 + / fails), then the
//    bytes are read with TextDecoder(<Character>) — invalid sequences become U+FFFD.
//  - File encode: the file's raw bytes → Base64.
//  - File decode: the file's raw bytes are read as Base64 text, then saved either as text
//    (decoded with the chosen Character) or as a binary/image download.
//  - Downloads default to "base64-<Date.now() % 10000>" (+ ".txt" for text output).
//
// Everything runs in the browser; nothing is uploaded.

export const MAX_FILE_MB = 25;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export const MESSAGES = {
  prompt: "Enter text, then click Encode or Decode.",
  filePrompt: "Choose a file, then click Encode or Decode.",
  emptyEncode: "Please enter text to encode.",
  emptyDecode: "Please enter text to decode.",
  badText: "Sorry, the input text cannot be Base64-decoded.",
  noFileEncode: "Please provide a file with content to encode.",
  noFileDecode: "Please provide a file with content to decode.",
  badFileEncode: "Sorry, the file cannot be encoded.",
  badFile: "Sorry, the file cannot be Base64-decoded.",
  tooLarge: `The file is larger than ${MAX_FILE_MB} MB. Please choose a smaller file.`,
  unreadable: "Sorry, the file could not be read.",
};

// The reference's Character list, in its order. "ASCII" is the WHATWG label windows-1252
// (browsers decode "ascii"/"us-ascii" as windows-1252), so it gets its own key here because
// "Windows-1252" also appears further down the list.
export const CHARSETS = [
  { value: "utf-8", label: "UTF-8", encoding: "utf-8" },
  { value: "ascii", label: "ASCII", encoding: "windows-1252" },
  { value: "utf-16le", label: "UTF-16", encoding: "utf-16le" },
  { value: "utf-16be", label: "UTF-16BE", encoding: "utf-16be" },
  { value: "big5", label: "Big5 (Chinese)", encoding: "big5" },
  { value: "gb18030", label: "GB 18030 (Chinese)", encoding: "gb18030" },
  { value: "gb2312", label: "GB 2312 (Chinese)", encoding: "gb2312" },
  { value: "euc-jp", label: "EUC-JP (Japanese)", encoding: "euc-jp" },
  { value: "iso-2022-jp", label: "ISO-2022-JP (Japanese)", encoding: "iso-2022-jp" },
  { value: "shift-jis", label: "Shift JIS (Japanese)", encoding: "shift-jis" },
  { value: "euc-kr", label: "EUC-KR (Korean)", encoding: "euc-kr" },
  { value: "ibm866", label: "CP866 (Russian)", encoding: "ibm866" },
  { value: "koi8-r", label: "KOI8-R (Russian)", encoding: "koi8-r" },
  { value: "koi8-u", label: "KOI8-U (Ukrainian)", encoding: "koi8-u" },
  { value: "macintosh", label: "Macintosh (x-mac-roman)", encoding: "macintosh" },
  { value: "x-mac-cyrillic", label: "Mac OS Cyrillic (x-mac-cyrillic)", encoding: "x-mac-cyrillic" },
  { value: "iso-8859-1", label: "ISO-8859-1 (Latin1/Western European)", encoding: "iso-8859-1" },
  { value: "iso-8859-2", label: "ISO-8859-2 (Latin2/Eastern European)", encoding: "iso-8859-2" },
  { value: "iso-8859-3", label: "ISO-8859-3 (Latin3/South European)", encoding: "iso-8859-3" },
  { value: "iso-8859-4", label: "ISO-8859-4 (Latin4/North European)", encoding: "iso-8859-4" },
  { value: "iso-8859-5", label: "ISO-8859-5 (Latin/Cyrillic)", encoding: "iso-8859-5" },
  { value: "iso-8859-6", label: "ISO-8859-6 (Latin/Arabic)", encoding: "iso-8859-6" },
  { value: "iso-8859-7", label: "ISO-8859-7 (Latin/Greek)", encoding: "iso-8859-7" },
  { value: "iso-8859-8", label: "ISO-8859-8 (Latin/Hebrew)", encoding: "iso-8859-8" },
  { value: "iso-8859-8-i", label: "ISO-8859-8-I (Latin/Hebrew)", encoding: "iso-8859-8-i" },
  { value: "iso-8859-10", label: "ISO-8859-10 (Latin6/Nordic)", encoding: "iso-8859-10" },
  { value: "iso-8859-13", label: "ISO-8859-13 (Latin7/Baltic Rim)", encoding: "iso-8859-13" },
  { value: "iso-8859-14", label: "ISO-8859-14 (Latin8/Celtic)", encoding: "iso-8859-14" },
  { value: "iso-8859-15", label: "ISO-8859-15 (Latin9/Western European)", encoding: "iso-8859-15" },
  { value: "iso-8859-16", label: "ISO-8859-16 (Latin10/South-Eastern European)", encoding: "iso-8859-16" },
  { value: "windows-874", label: "Windows-874 (Thai)", encoding: "windows-874" },
  { value: "windows-1250", label: "Windows-1250 (Eastern European)", encoding: "windows-1250" },
  { value: "windows-1251", label: "Windows-1251 (Cyrillic)", encoding: "windows-1251" },
  { value: "windows-1252", label: "Windows-1252 (Western European)", encoding: "windows-1252" },
  { value: "windows-1253", label: "Windows-1253 (Greek)", encoding: "windows-1253" },
  { value: "windows-1254", label: "Windows-1254 (Turkish)", encoding: "windows-1254" },
  { value: "windows-1255", label: "Windows-1255 (Hebrew)", encoding: "windows-1255" },
  { value: "windows-1256", label: "Windows-1256 (Arabic)", encoding: "windows-1256" },
  { value: "windows-1257", label: "Windows-1257 (Baltic)", encoding: "windows-1257" },
  { value: "windows-1258", label: "Windows-1258 (Vietnamese)", encoding: "windows-1258" },
];
export const DEFAULT_CHARSET = "utf-8";

export const FILE_OPERATIONS = [
  { value: "en", label: "encode a file" },
  { value: "de", label: "decode a file" },
];
export const OUTPUT_TYPES = [
  { value: "txt", label: "Text file" },
  { value: "img", label: "Binary or Image" },
];

const encodingOf = (charset) => (CHARSETS.find((c) => c.value === charset) || CHARSETS[0]).encoding;

// String.fromCharCode(...bytes) (the reference) overflows the call stack on large inputs,
// so bytes are converted in fixed-size chunks.
const CHUNK = 0x8000;

/** Bytes → a "binary string" (one char per byte, 0–255). */
export function bytesToBinaryString(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return out;
}

/** Bytes → Base64 (RFC 4648 standard alphabet, "=" padded). */
export function bytesToBase64(bytes) {
  return btoa(bytesToBinaryString(bytes));
}

/** Base64 text → bytes, using the browser's forgiving decoder (throws on invalid input). */
export function base64ToBytes(text) {
  const bin = atob(text);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Bytes → text in the chosen character set (throws for an unsupported label). */
export function decodeBytes(bytes, charset) {
  return new TextDecoder(encodingOf(charset)).decode(bytes);
}

/** Text tool, Encode. Returns { missing } | { output, inputBytes }. */
export function encodeText(text) {
  const input = String(text ?? "");
  if (input.length < 1) return { missing: ["text"], message: MESSAGES.emptyEncode };
  const bytes = new TextEncoder().encode(input);
  return { mode: "encode", output: bytesToBase64(bytes), inputBytes: bytes.length };
}

/** Text tool, Decode. Returns { missing } | { error } | { output, outputBytes }. */
export function decodeText(text, charset = DEFAULT_CHARSET) {
  const input = String(text ?? "");
  if (input.length < 1) return { missing: ["text"], message: MESSAGES.emptyDecode };
  try {
    const bytes = base64ToBytes(input);
    return { mode: "decode", output: decodeBytes(bytes, charset), outputBytes: bytes.length };
  } catch {
    return { mode: "decode", error: MESSAGES.badText };
  }
}

// A UTF-8 byte-order mark is not Base64, but text editors often save one; skip it so the
// file still decodes (the reference fails on such files).
const stripUtf8Bom = (bytes) =>
  bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? bytes.subarray(3) : bytes;

/** File tool, Encode: file bytes → Base64 text. */
export function encodeFile(bytes) {
  if (!bytes || bytes.length < 1) return { error: MESSAGES.noFileEncode };
  try {
    return { mode: "encode", output: bytesToBase64(bytes), inputBytes: bytes.length };
  } catch {
    return { error: MESSAGES.badFileEncode };
  }
}

/** File tool, Decode: file bytes (Base64 text) → text in `charset`, or raw bytes for a binary/image download. */
export function decodeFile(bytes, outputType = "txt", charset = DEFAULT_CHARSET) {
  if (!bytes || bytes.length < 1) return { error: MESSAGES.noFileDecode };
  try {
    const decoded = base64ToBytes(bytesToBinaryString(stripUtf8Bom(bytes)));
    if (outputType === "img") return { mode: "decode", binary: decoded, outputBytes: decoded.length };
    return { mode: "decode", output: decodeBytes(decoded, charset), outputBytes: decoded.length };
  } catch {
    return { error: MESSAGES.badFile };
  }
}

/** Keeps a user-typed download name safe: no path parts, control or reserved characters. */
export function sanitizeFilename(name) {
  return String(name ?? "")
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "_")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 200);
}

/** The reference's download names: the typed name, else "base64-NNNN" (+ ".txt" for text output). */
export function downloadName(typed, isText, now = Date.now()) {
  const clean = sanitizeFilename(typed);
  if (clean) return clean;
  return `base64-${now % 10000}${isText ? ".txt" : ""}`;
}

/** "1,234 bytes" / "1.2 KB" style size for the result summary. */
export function formatBytes(n) {
  if (n < 1024) return `${n.toLocaleString("en-US")} byte${n === 1 ? "" : "s"}`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
