// Sentence Counter — main analysis orchestrator.
//
// A single call to analyzeText() parses the input exactly once (via
// segmentSentences/segmentWords) and derives every statistic the UI needs
// from that one pass, so live-typing re-analysis never re-parses more than
// necessary. Reading/speaking time are kept out of this pass on purpose —
// they're a cheap function of total word count, computed separately via
// `computeDuration()` so switching WPM doesn't trigger a full re-analysis.

import { segmentSentences, segmentWordsWithOffsets } from "./textSegmentation";
import { countSyllables, isComplexWord } from "./syllables";
import { STOP_WORDS } from "./stopWords";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  gunningFog,
  smogIndex,
  colemanLiauIndex,
  automatedReadabilityIndex,
  fleschDifficultyLevel,
  gradeLevelLabel,
  overallDifficulty,
  readingLevelSummary,
} from "./readability";

export const LENGTH_BUCKETS = [
  { key: "veryShort", label: "Very Short", range: "1–10 words", min: 1, max: 10 },
  { key: "short", label: "Short", range: "11–20 words", min: 11, max: 20 },
  { key: "medium", label: "Medium", range: "21–30 words", min: 21, max: 30 },
  { key: "long", label: "Long", range: "31–40 words", min: 31, max: 40 },
  { key: "veryLong", label: "Very Long", range: "40+ words", min: 41, max: Infinity },
];

function cleanWord(w) {
  return w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function safeDiv(a, b) {
  return b > 0 ? a / b : 0;
}

export const EMPTY_ANALYSIS = buildEmptyAnalysis();

function buildEmptyAnalysis() {
  return {
    hasText: false,
    method: "intl",
    sentences: [],
    counts: {
      sentences: 0, paragraphs: 0, words: 0, chars: 0,
      charsNoSpaces: 0, lines: 0, nonEmptyLines: 0,
    },
    averages: {
      wordsPerSentence: 0, charsPerSentence: 0,
      sentencesPerParagraph: 0, wordsPerParagraph: 0, sentenceDensity: 0,
    },
    readability: null,
    insights: [],
    distribution: LENGTH_BUCKETS.map((b) => ({ ...b, count: 0, percent: 0 })),
    vocabulary: { uniqueWords: 0, repeatedWords: 0, diversityRatio: 0, diversityPercent: 0, topWords: [] },
    complexity: {
      avgWordLength: 0, avgSentenceLength: 0,
      longestWord: "", longestSentence: null, shortestSentence: null,
      complexWordCount: 0, complexWordPercent: 0,
    },
  };
}

export function analyzeText(rawText) {
  if (!rawText || !rawText.trim()) return EMPTY_ANALYSIS;

  const text = rawText;

  // ── Sentences + words are each parsed exactly once, then merged in a
  // single sweep (both lists are offset-sorted) to get per-sentence word
  // counts — this avoids re-running word segmentation once per sentence.
  const { sentences: rawSentences, method } = segmentSentences(text);
  const wordTokens = segmentWordsWithOffsets(text);

  const sentences = [];
  let wordCursor = 0;
  for (let i = 0; i < rawSentences.length; i++) {
    const s = rawSentences[i];
    let count = 0;
    while (wordCursor < wordTokens.length && wordTokens[wordCursor].start < s.end) {
      count++;
      wordCursor++;
    }
    sentences.push({ index: i + 1, text: s.text, start: s.start, end: s.end, words: count, chars: s.text.length });
  }

  // ── Characters / lines ───────────────────────────────────────────
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const linesArr = text.split("\n");
  const lines = linesArr.length;
  const nonEmptyLines = linesArr.filter((l) => l.trim().length > 0).length;

  // ── Paragraphs (groups of non-empty lines separated by blank lines) ─
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

  // ── Words (Unicode-aware) + per-word data for vocabulary/complexity ─
  const words = wordTokens.length;
  const cleanWords = wordTokens.map((w) => cleanWord(w.text)).filter(Boolean);

  let longestWord = "";
  let totalWordLength = 0;
  let totalLetters = 0;
  let totalAlnumChars = 0;
  let totalSyllables = 0;
  let complexWordCount = 0;
  const freq = Object.create(null);

  for (const w of cleanWords) {
    if (w.length > longestWord.length) longestWord = w;
    totalWordLength += w.length;
    totalLetters += (w.match(/\p{L}/gu) || []).length;
    totalAlnumChars += (w.match(/[\p{L}\p{N}]/gu) || []).length;
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWordCount++;

    const lower = w.toLowerCase();
    if (lower.length >= 3 && !STOP_WORDS.has(lower)) {
      freq[lower] = (freq[lower] || 0) + 1;
    }
  }

  const uniqueWordSet = new Set(cleanWords.map((w) => w.toLowerCase()));
  const uniqueWords = uniqueWordSet.size;
  const repeatedWords = Math.max(0, cleanWords.length - uniqueWords);
  const diversityRatio = safeDiv(uniqueWords, cleanWords.length);

  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const avgWordLength = round2(safeDiv(totalWordLength, cleanWords.length));

  // ── Averages derived from sentence/word/paragraph totals ───────────
  const sentenceCount = sentences.length;
  const averages = {
    wordsPerSentence: round2(safeDiv(words, sentenceCount)),
    charsPerSentence: round2(safeDiv(charsNoSpaces, sentenceCount)),
    sentencesPerParagraph: round2(safeDiv(sentenceCount, paragraphs)),
    wordsPerParagraph: round2(safeDiv(words, paragraphs)),
    sentenceDensity: round2(safeDiv(sentenceCount, words) * 100),
  };

  // ── Longest / shortest sentence ─────────────────────────────────────
  let longestSentence = null;
  let shortestSentence = null;
  for (const s of sentences) {
    if (!longestSentence || s.words > longestSentence.words) longestSentence = s;
    if (!shortestSentence || s.words < shortestSentence.words) shortestSentence = s;
  }

  // ── Sentence length distribution ────────────────────────────────────
  const distribution = LENGTH_BUCKETS.map((b) => ({ ...b, count: 0, percent: 0 }));
  for (const s of sentences) {
    const bucket = distribution.find((b) => s.words >= b.min && s.words <= b.max) || distribution[distribution.length - 1];
    bucket.count++;
  }
  for (const b of distribution) {
    b.percent = round2(safeDiv(b.count, sentenceCount) * 100);
  }

  // ── Readability ──────────────────────────────────────────────────
  const totals = {
    words,
    sentences: sentenceCount,
    syllables: totalSyllables,
    complexWords: complexWordCount,
    letters: totalLetters,
    characters: totalAlnumChars,
  };

  const fleschScore = fleschReadingEase(totals);
  const fkGrade = fleschKincaidGrade(totals);
  const fogScore = gunningFog(totals);
  const smogScore = smogIndex(totals);
  const clScore = colemanLiauIndex(totals);
  const ariScore = automatedReadabilityIndex(totals);

  const gradeMetrics = [fkGrade, fogScore, smogScore, clScore, ariScore];
  const avgGrade = safeDiv(gradeMetrics.reduce((a, b) => a + b, 0), gradeMetrics.length);
  const difficulty = words >= 10 ? overallDifficulty(avgGrade) : null;

  const readability = {
    totals,
    flesch: { score: fleschScore, level: fleschDifficultyLevel(fleschScore) },
    fkGrade: { score: fkGrade, label: gradeLevelLabel(fkGrade) },
    fog: { score: fogScore, label: gradeLevelLabel(fogScore) },
    smog: { score: smogScore, label: gradeLevelLabel(smogScore) },
    colemanLiau: { score: clScore, label: gradeLevelLabel(clScore) },
    ari: { score: ariScore, label: gradeLevelLabel(ariScore) },
    difficulty,
    summary: difficulty ? readingLevelSummary(difficulty) : "Add more text for a reliable readability estimate.",
  };

  // ── Writing insights (only applicable ones) ─────────────────────────
  const insights = buildInsights({
    wordsPerSentence: averages.wordsPerSentence,
    wordsPerParagraph: averages.wordsPerParagraph,
    sentenceCount,
    words,
    complexWordPercent: round2(safeDiv(complexWordCount, cleanWords.length) * 100),
    avgGrade,
    distribution,
  });

  return {
    hasText: true,
    method,
    sentences,
    counts: {
      sentences: sentenceCount,
      paragraphs,
      words,
      chars,
      charsNoSpaces,
      lines,
      nonEmptyLines,
    },
    averages,
    readability,
    insights,
    distribution,
    vocabulary: {
      uniqueWords,
      repeatedWords,
      diversityRatio: round2(diversityRatio),
      diversityPercent: round2(diversityRatio * 100),
      topWords,
    },
    complexity: {
      avgWordLength,
      avgSentenceLength: averages.wordsPerSentence,
      longestWord,
      longestSentence,
      shortestSentence,
      complexWordCount,
      complexWordPercent: round2(safeDiv(complexWordCount, cleanWords.length) * 100),
    },
  };
}

function buildInsights({ wordsPerSentence, wordsPerParagraph, sentenceCount, words, complexWordPercent, avgGrade, distribution }) {
  if (words < 20 || sentenceCount < 2) return [];

  const insights = [];
  const veryShortPct = distribution.find((b) => b.key === "veryShort")?.percent || 0;
  const longPlusPct = (distribution.find((b) => b.key === "long")?.percent || 0) + (distribution.find((b) => b.key === "veryLong")?.percent || 0);
  const usedBuckets = distribution.filter((b) => b.count > 0).length;

  if (wordsPerSentence > 25) {
    insights.push("Sentences are longer than average — consider shortening long sentences for easier reading.");
  }
  if (veryShortPct > 60) {
    insights.push("Very short sentences dominate the text.");
  }
  if (longPlusPct > 40) {
    insights.push("A large share of sentences are long or very long — this may slow readers down.");
  }
  if (wordsPerParagraph > 150) {
    insights.push("Paragraphs are lengthy — consider breaking them into smaller chunks.");
  }
  if (avgGrade > 12) {
    insights.push("Reading level is higher than average — likely best suited for college-level readers.");
  }
  if (complexWordPercent > 20) {
    insights.push("A high proportion of complex (3+ syllable) words may reduce readability.");
  }
  if (usedBuckets >= 3 && wordsPerSentence >= 10 && wordsPerSentence <= 25) {
    insights.push("Good sentence variety — sentence lengths are well mixed.");
  }
  if (insights.length === 0) {
    insights.push("Reading flow is balanced — sentence length and complexity look reasonable.");
  }
  return insights;
}

// Cheap, WPM-dependent — does not require re-parsing the text.
export function computeDuration(wordCount, wpm) {
  const totalSeconds = wpm > 0 ? Math.round((wordCount / wpm) * 60) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds, totalSeconds };
}

export function formatDuration({ minutes, seconds }) {
  if (minutes === 0 && seconds === 0) return "0 sec";
  if (minutes === 0) return `${seconds} sec`;
  return `${minutes} min ${seconds} sec`;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Used by both the sentence list (filtering) and the editor (highlight
// ranges) so search results stay in sync between the two views.
export function matchesQuery(sentenceText, query, matchCase, wholeWord) {
  if (!query) return true;
  const flags = matchCase ? "" : "i";
  const pattern = wholeWord ? `\\b${escapeRegExp(query)}\\b` : escapeRegExp(query);
  try {
    return new RegExp(pattern, flags).test(sentenceText);
  } catch {
    return sentenceText.toLowerCase().includes(query.toLowerCase());
  }
}
