// Lightweight content check for uploaded/dropped .txt files. readTextFile()
// (utils/wordCounter.js) already validates extension and size, but a file
// can be renamed to .txt while still holding binary content - reading it
// as text then decodes garbage rather than throwing, so this scans a
// bounded sample for the tell-tale signs of that: NUL bytes, a high ratio
// of control characters, or the Unicode replacement character (U+FFFD)
// produced when non-UTF-8 bytes are decoded as text.
const SAMPLE_SIZE = 8000;
const SUSPICIOUS_RATIO_THRESHOLD = 0.02;
const NUL_CODE = 0;
const REPLACEMENT_CHAR_CODE = 0xfffd;
const TAB_CODE = 9;
const LF_CODE = 10;
const CR_CODE = 13;

export function looksLikeBinaryText(content) {
  if (!content) return false;

  const sample = content.length > SAMPLE_SIZE ? content.slice(0, SAMPLE_SIZE) : content;

  let suspicious = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    const isNulByte = code === NUL_CODE;
    const isReplacementChar = code === REPLACEMENT_CHAR_CODE;
    const isControlChar = code < 32 && code !== TAB_CODE && code !== LF_CODE && code !== CR_CODE;
    if (isNulByte || isReplacementChar || isControlChar) suspicious++;
  }

  return suspicious / sample.length > SUSPICIOUS_RATIO_THRESHOLD;
}
