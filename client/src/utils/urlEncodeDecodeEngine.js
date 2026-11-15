// URL Encode / Decode engine — mirrors calculator.net/url-encode-decode.html.
//
// Reference behaviour (its page script, ported):
//  - Encode: encodeURIComponent(text.trim()) — every character except the RFC 3986 unreserved
//    set and ! ' ( ) * is percent-encoded as UTF-8 bytes (space → %20, not +).
//  - Decode: decodeURIComponent(text.trim()) — "+" stays "+"; a malformed "%" sequence or
//    invalid UTF-8 fails.
//  - The empty check runs on the untrimmed text, so whitespace-only input gives an empty result.
//  - The page can be opened with ?toprocess=<text> to pre-fill the box (nothing is calculated).

export const MESSAGES = {
  prompt: "Enter text, then click Encode or Decode.",
  emptyEncode: "Please enter text to encode.",
  emptyDecode: "Please enter text to decode.",
  badEncode: "Sorry, the input text cannot be URL encoded.",
  badDecode: "Sorry, the input text cannot be URL decoded.",
};

export const RESERVED = "!#$&'()*+,/:;=?@[]";
export const UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
export const QUERY_PARAM = "toprocess";
export const MAX_PREFILL = 100000;

/** Encode. Returns { missing } | { error } | { mode, output }. */
export function encodeUrl(text) {
  const input = String(text ?? "");
  if (input.length < 1) return { missing: ["text"], message: MESSAGES.emptyEncode };
  try {
    return { mode: "encode", output: encodeURIComponent(input.trim()) };
  } catch {
    return { mode: "encode", error: MESSAGES.badEncode };
  }
}

/** Decode. Returns { missing } | { error } | { mode, output }. */
export function decodeUrl(text) {
  const input = String(text ?? "");
  if (input.length < 1) return { missing: ["text"], message: MESSAGES.emptyDecode };
  try {
    return { mode: "decode", output: decodeURIComponent(input.trim()) };
  } catch {
    return { mode: "decode", error: MESSAGES.badDecode };
  }
}

/** The ?toprocess= value that pre-fills the box (capped in length), or "". */
export function prefillFrom(search) {
  const value = new URLSearchParams(search || "").get(QUERY_PARAM) || "";
  return value.slice(0, MAX_PREFILL);
}
