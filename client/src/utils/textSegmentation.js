// Unicode-aware word + sentence segmentation with a three-tier fallback
// chain, as required for accurate multi-language text analysis:
//
//   1. Intl.Segmenter (native Unicode text segmentation, when supported)
//   2. A rule-based parser that understands abbreviations, initials,
//      decimal numbers, quotes/parens, and ellipses
//   3. A lightweight regex parser (last-resort safety net, never throws)
//
// Sentence boundaries found by tiers 1 and 2 are then corrected by
// `correctSentenceBoundaries`, which merges splits that occur after a
// known abbreviation/initial or before a lowercase continuation — the
// abbreviation dictionary lives in ./abbreviations.js so other text tools
// can reuse it.

import { isTitleAbbreviation, isGeneralAbbreviation } from "./abbreviations";

const HAS_SEGMENTER = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";

// ─────────────────────────────────────────── Words ───────────────────────

export function segmentWords(text) {
  if (!text) return [];

  if (HAS_SEGMENTER) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
      const words = [];
      for (const { segment, isWordLike } of segmenter.segment(text)) {
        if (isWordLike) words.push(segment);
      }
      return words;
    } catch {
      // fall through to regex tiers below
    }
  }

  try {
    // Unicode letter/number runs, allowing internal apostrophes/hyphens
    // ("don't", "well-known") without needing Intl.Segmenter.
    const matches = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
    if (matches) return matches;
  } catch {
    // \p{...} unicode property escapes unsupported — fall through
  }

  return text.match(/\S+/g) || [];
}

// Same as segmentWords, but returns {text, start, end} so callers can map
// words back onto sentence ranges (or any other offset range) without a
// second parsing pass over the text.
export function segmentWordsWithOffsets(text) {
  if (!text) return [];

  if (HAS_SEGMENTER) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
      const words = [];
      for (const { segment, index, isWordLike } of segmenter.segment(text)) {
        if (isWordLike) words.push({ text: segment, start: index, end: index + segment.length });
      }
      return words;
    } catch {
      // fall through to regex tiers below
    }
  }

  const words = [];
  let re;
  try {
    re = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
  } catch {
    re = /\S+/g;
  }
  let match;
  while ((match = re.exec(text)) !== null) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return words;
}

// ────────────────────────────────────────── Sentences ────────────────────

function segmentSentencesWithIntl(text) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
  const spans = [];
  for (const { segment, index } of segmenter.segment(text)) {
    spans.push({ start: index, end: index + segment.length, text: segment });
  }
  return spans;
}

// Tier 2: finds every position where the text has terminal punctuation
// (. ! ? possibly repeated, e.g. "?!", "!!!") followed by a closing
// quote/paren and then whitespace or end-of-text. This is intentionally
// permissive (it will also split "Dr. Smith") — `correctSentenceBoundaries`
// is responsible for fixing the false positives afterward.
function segmentSentencesByRule(text) {
  const spans = [];
  const re = /[.!?]+[)"'’”\]]*/g;
  let start = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    const end = match.index + match[0].length;
    const nextChar = text[end];
    if (nextChar === undefined || /\s/.test(nextChar)) {
      spans.push({ start, end, text: text.slice(start, end) });
      start = end;
    }
  }
  if (start < text.length) {
    spans.push({ start, end: text.length, text: text.slice(start) });
  }
  return spans;
}

// Tier 3: last-resort safety net — never throws, always returns something.
function segmentSentencesNaive(text) {
  const spans = [];
  const matches = text.match(/[^.!?]*[.!?]+|[^.!?]+$/g) || [text];
  let cursor = 0;
  for (const m of matches) {
    const idx = text.indexOf(m, cursor);
    const start = idx === -1 ? cursor : idx;
    const end = start + m.length;
    spans.push({ start, end, text: m });
    cursor = end;
  }
  return spans;
}

function lastToken(str) {
  const parts = str.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
}

function shouldMergeSpans(currentText, nextText) {
  const trimmedCurrent = currentText.replace(/\s+$/, "");
  if (!trimmedCurrent || !/[.!?]["')\]’”]*$/.test(trimmedCurrent)) return false;

  const leadingWhitespace = nextText.match(/^\s*/)[0];
  if (/\n[ \t]*\n/.test(leadingWhitespace)) return false; // blank line = real break

  const peek = nextText.slice(leadingWhitespace.length, leadingWhitespace.length + 1);
  if (!peek) return false;

  const token = lastToken(trimmedCurrent);
  const isInitial = /^[A-Za-z]\.$/.test(token);
  if (isInitial || isTitleAbbreviation(token)) return true;
  if (isGeneralAbbreviation(token) && /[a-z0-9]/.test(peek)) return true;
  if (/[a-z]/.test(peek)) return true; // genuine sentences almost always start capitalized

  return false;
}

// Merges spans that were split on an abbreviation/initial or before a
// lowercase continuation. Works on the output of any tier above.
function correctSentenceBoundaries(spans) {
  const merged = [];
  let i = 0;
  while (i < spans.length) {
    let current = spans[i];
    while (i + 1 < spans.length && shouldMergeSpans(current.text, spans[i + 1].text)) {
      const next = spans[i + 1];
      current = { start: current.start, end: next.end, text: current.text + next.text };
      i++;
    }
    merged.push(current);
    i++;
  }
  return merged;
}

// Trims each span, drops empty/punctuation-only spans, and returns clean,
// display-ready sentences while preserving original offsets (trimmed to
// the visible text) for editor highlighting.
function finalizeSpans(spans) {
  const out = [];
  for (const span of spans) {
    const leading = span.text.match(/^\s*/)[0].length;
    const trailing = span.text.match(/\s*$/)[0].length;
    const start = span.start + leading;
    const end = span.end - trailing;
    const text = span.text.slice(leading, span.text.length - trailing);
    if (!text || !/[\p{L}\p{N}]/u.test(text)) continue;
    out.push({ start, end, text });
  }
  return out;
}

// Returns { sentences: [{start, end, text}], method: "intl"|"rule"|"regex" }
export function segmentSentences(text) {
  if (!text || !text.trim()) return { sentences: [], method: HAS_SEGMENTER ? "intl" : "rule" };

  let rawSpans;
  let method;

  if (HAS_SEGMENTER) {
    try {
      rawSpans = segmentSentencesWithIntl(text);
      method = "intl";
    } catch {
      rawSpans = null;
    }
  }

  if (!rawSpans) {
    try {
      rawSpans = segmentSentencesByRule(text);
      method = "rule";
    } catch {
      rawSpans = null;
    }
  }

  if (!rawSpans) {
    rawSpans = segmentSentencesNaive(text);
    method = "regex";
  }

  const corrected = correctSentenceBoundaries(rawSpans);
  return { sentences: finalizeSpans(corrected), method };
}
