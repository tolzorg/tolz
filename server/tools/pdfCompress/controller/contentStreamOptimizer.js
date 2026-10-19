// Shrinks PDF content streams (the drawing instructions of pages, forms,
// patterns and Type 3 glyphs) by writing numbers in their shortest form.
//
// Many PDF producers write every number with six decimals ("0.750000",
// "792.000000", "635.359985"). In drawing-heavy pages (text converted to
// outlines, charts, maps) those digits are most of the file. A real tokenizer
// is used: strings, hex strings, names, comments and inline-image data are
// copied byte for byte; only numeric tokens are rewritten.
//
//   exact = true   strip trailing zeros only (0.750000 → .75): identical values.
//   exact = false  also round to 6 significant digits, keeping at least 3
//                  decimals (635.359985 → 635.36, -101862.5 unchanged):
//                  each number moves by at most 0.0005 units (a few millionths
//                  of an inch at normal scale) — far below what any screen or
//                  printer can show.

const WHITESPACE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]);
const DELIMITERS = new Set([0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25]); // ( ) < > [ ] { } / %
const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

const isRegular = (c) => !WHITESPACE.has(c) && !DELIMITERS.has(c);

/** Shortest text for a PDF number token (never longer than the original). */
export function shortenNumber(token, exact) {
  const value = Number(token);
  if (!Number.isFinite(value)) return token;
  let out;
  if (value === 0) out = "0";
  else if (exact) {
    out = token.replace(/^\+/, "");
    if (out.includes(".")) out = out.replace(/0+$/, "").replace(/\.$/, "");
    out = out.replace(/^(-?)0+(?=\d)/, "$1");      // leading zeros of the integer part
    out = out.replace(/^(-?)0\./, "$1.");          // 0.75 → .75
    if (out === "" || out === "-" || out === "." || out === "-.") out = "0";
  } else {
    // 6 significant digits, but never fewer than 3 decimals: large values such
    // as page offsets ("-101862.5") must keep their absolute precision, or the
    // whole page would shift.
    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const decimals = Math.min(10, Math.max(3, 5 - magnitude));
    out = value.toFixed(decimals);
    if (out.includes(".")) out = out.replace(/0+$/, "").replace(/\.$/, "");
    out = out.replace(/^(-?)0\./, "$1.");
    if (out === "-0" || out === "") out = "0";
  }
  return out.length < token.length ? out : token;
}

/** Returns the optimised stream bytes (a Buffer), or null if nothing changed. */
export function optimizeContentStream(input, { exact }) {
  const src = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const parts = [];
  let changed = false;
  let i = 0;
  let copyFrom = 0; // start of the pending verbatim region
  const n = src.length;

  const flush = (to) => { if (to > copyFrom) parts.push(src.subarray(copyFrom, to)); };

  while (i < n) {
    const c = src[i];
    if (WHITESPACE.has(c)) { i++; continue; }

    if (c === 0x25) { // % comment → end of line
      while (i < n && src[i] !== 0x0a && src[i] !== 0x0d) i++;
      continue;
    }
    if (c === 0x28) { // ( literal string ) with nesting and escapes
      let depth = 1; i++;
      while (i < n && depth > 0) {
        const d = src[i];
        if (d === 0x5c) { i += 2; continue; } // backslash escape
        if (d === 0x28) depth++;
        else if (d === 0x29) depth--;
        i++;
      }
      continue;
    }
    if (c === 0x3c) { // << dictionary or <hex string>
      if (src[i + 1] === 0x3c) { i += 2; continue; }
      while (i < n && src[i] !== 0x3e) i++;
      i++;
      continue;
    }
    if (DELIMITERS.has(c)) {
      if (c === 0x2f) { // /Name
        i++;
        while (i < n && isRegular(src[i])) i++;
      } else i++;
      continue;
    }

    // Regular token: number or operator.
    const start = i;
    while (i < n && isRegular(src[i])) i++;
    const token = src.toString("latin1", start, i);

    if (token === "ID") {
      // Inline image data: binary until whitespace + "EI" + delimiter/end.
      // Skip it untouched.
      let j = i + 1;
      while (j < n) {
        if (src[j] === 0x45 && src[j + 1] === 0x49 && WHITESPACE.has(src[j - 1]) && (j + 2 >= n || !isRegular(src[j + 2]))) break;
        j++;
      }
      i = Math.min(n, j + 2);
      continue;
    }

    if (NUMBER.test(token)) {
      const short = shortenNumber(token, exact);
      if (short !== token) {
        flush(start);
        parts.push(Buffer.from(short, "latin1"));
        copyFrom = i;
        changed = true;
      }
    }
  }
  if (!changed) return null;
  flush(n);
  return Buffer.concat(parts);
}
