// Japanese Name Generator — approximate pronunciation via the browser's
// SpeechSynthesis API. This is explicitly NOT authoritative pronunciation
// (spec Section 27/61) — callers must label it "Approximate pronunciation".
// Always speaks the SELECTED HIRAGANA reading, never Kanji directly.

export function hasJapaneseVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  try {
    return window.speechSynthesis.getVoices().some((v) => v.lang?.toLowerCase().startsWith("ja"));
  } catch {
    return false;
  }
}

/** Speak a Hiragana reading using a ja-JP voice if one exists; falls back to the browser's default voice otherwise. Returns false if speech synthesis is unavailable at all. */
export function speakApproximatePronunciation(hiragana) {
  if (typeof window === "undefined" || !window.speechSynthesis || !hiragana) return false;
  try {
    window.speechSynthesis.cancel(); // never let utterances overlap/queue indefinitely
    const utterance = new SpeechSynthesisUtterance(hiragana);
    const jaVoice = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("ja"));
    if (jaVoice) utterance.voice = jaVoice;
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
