// Pure text analysis — all functions are stateless and side-effect free

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","it","this","that","are","was","were","be","been",
  "being","have","has","had","do","does","did","will","would","could",
  "should","may","might","can","i","you","he","she","we","they","me",
  "him","her","us","them","my","your","his","its","our","their","so",
  "if","as","not","no","up","out","about","into","then","than","when",
  "what","which","who","how","all","any","both","each","few","more",
  "most","other","some","such","only","own","same","too","very","just",
  "because","while","after","before","during","over","between","through",
]);

// Average reading / speaking speeds (words per minute)
const READ_WPM  = 238;
const SPEAK_WPM = 130;

// Approximate words per printed page
const WORDS_PER_PAGE = 275;

export function analyzeText(raw) {
  const empty = {
    words:         0,
    chars:         0,
    charsNoSpaces: 0,
    sentences:     0,
    paragraphs:    0,
    lines:         0,
    readingMins:   0,
    speakingMins:  0,
    longestWord:   "",
    avgWordLength: 0,
    estimatedPages:0,
    topWords:      [],
  };

  if (!raw) return empty;

  const text = raw; // keep original for char counts

  // ── Characters ─────────────────────────────────────────────
  const chars         = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;

  // ── Words ───────────────────────────────────────────────────
  // Extract tokens that contain at least one alphanumeric character
  const wordTokens = text.match(/\S+/g) || [];
  const wordCount  = wordTokens.length;

  // ── Sentences ───────────────────────────────────────────────
  // Split on . ! ? followed by whitespace or end of string
  const sentenceMatches = text.match(/[^.!?]*[.!?]+/g) || [];
  const sentenceCount   = sentenceMatches.filter(s => s.trim().length > 0).length || (wordCount > 0 ? 1 : 0);

  // ── Paragraphs ──────────────────────────────────────────────
  const paragraphCount = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0).length || (wordCount > 0 ? 1 : 0);

  // ── Lines ───────────────────────────────────────────────────
  const lineCount = text.split("\n").filter(l => l.trim().length > 0).length;

  // ── Time estimates ───────────────────────────────────────────
  const readingMins  = wordCount / READ_WPM;
  const speakingMins = wordCount / SPEAK_WPM;

  // ── Estimated pages ─────────────────────────────────────────
  const estimatedPages = wordCount / WORDS_PER_PAGE;

  // ── Word-level analysis ──────────────────────────────────────
  // Strip leading/trailing punctuation for clean words
  const cleanWords = wordTokens
    .map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
    .filter(w => w.length > 0);

  // Longest word
  let longestWord = "";
  for (const w of cleanWords) {
    if (w.length > longestWord.length) longestWord = w;
  }

  // Average word length
  const totalLen    = cleanWords.reduce((s, w) => s + w.length, 0);
  const avgWordLength = cleanWords.length > 0
    ? parseFloat((totalLen / cleanWords.length).toFixed(1))
    : 0;

  // Top 5 most frequent non-stop words (min 3 chars)
  const freq = Object.create(null);
  for (const w of cleanWords) {
    const lower = w.toLowerCase();
    if (lower.length >= 3 && !STOP_WORDS.has(lower)) {
      freq[lower] = (freq[lower] || 0) + 1;
    }
  }
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    words:          wordCount,
    chars,
    charsNoSpaces,
    sentences:      sentenceCount,
    paragraphs:     paragraphCount,
    lines:          lineCount,
    readingMins,
    speakingMins,
    longestWord,
    avgWordLength,
    estimatedPages: parseFloat(estimatedPages.toFixed(2)),
    topWords,
  };
}

// Format fractional minutes into a human-readable string
export function formatTime(totalMins) {
  if (totalMins === 0) return "—";
  if (totalMins < 1 / 60) return "< 1 sec";

  const totalSecs = Math.round(totalMins * 60);
  const hours     = Math.floor(totalSecs / 3600);
  const mins      = Math.floor((totalSecs % 3600) / 60);
  const secs      = totalSecs % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins  > 0) return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  return `${secs}s`;
}

// Format a number with locale commas (e.g. 12345 → "12,345")
export function fmtNum(n) {
  return n.toLocaleString();
}

// Read a .txt or .md file and resolve with its text content (max 10 MB)
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      return reject(new Error("File is too large (max 10 MB)."));
    }
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt", "md"].includes(ext)) {
      return reject(new Error("Only .txt and .md files are supported."));
    }
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result || "");
    reader.onerror = ()  => reject(new Error("Could not read file."));
    reader.readAsText(file, "utf-8");
  });
}
