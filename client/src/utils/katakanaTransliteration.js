// Japanese Name Generator — "My Name in Japanese" foreign-name
// transliteration (spec Section 25).
//
// This produces an APPROXIMATE, letter-based katakana phonetic
// transcription of a foreign (typically English-alphabet) name. It is
// explicitly NOT a claim of an "official" Japanese name, and it does
// NOT model English pronunciation exceptions (silent letters, vowel
// digraphs like the silent-e in "Mike", stress, etc.) — it maps
// letters and common consonant digraphs to their standard katakana
// row using ordinary Japanese loanword conventions. Callers must
// surface this as "Japanese phonetic transcription (approximate)".

const ROW_TABLE = {
  k: { a: "カ", i: "キ", u: "ク", e: "ケ", o: "コ" },
  g: { a: "ガ", i: "ギ", u: "グ", e: "ゲ", o: "ゴ" },
  s: { a: "サ", i: "スィ", u: "ス", e: "セ", o: "ソ" },
  z: { a: "ザ", i: "ズィ", u: "ズ", e: "ゼ", o: "ゾ" },
  t: { a: "タ", i: "ティ", u: "トゥ", e: "テ", o: "ト" },
  d: { a: "ダ", i: "ディ", u: "ドゥ", e: "デ", o: "ド" },
  n: { a: "ナ", i: "ニ", u: "ヌ", e: "ネ", o: "ノ" },
  h: { a: "ハ", i: "ヒ", u: "フ", e: "ヘ", o: "ホ" },
  f: { a: "ファ", i: "フィ", u: "フ", e: "フェ", o: "フォ" },
  b: { a: "バ", i: "ビ", u: "ブ", e: "ベ", o: "ボ" },
  p: { a: "パ", i: "ピ", u: "プ", e: "ペ", o: "ポ" },
  m: { a: "マ", i: "ミ", u: "ム", e: "メ", o: "モ" },
  y: { a: "ヤ", i: "イ", u: "ユ", e: "イェ", o: "ヨ" },
  r: { a: "ラ", i: "リ", u: "ル", e: "レ", o: "ロ" },
  l: { a: "ラ", i: "リ", u: "ル", e: "レ", o: "ロ" }, // Japanese has no l/r distinction
  w: { a: "ワ", i: "ウィ", u: "ウ", e: "ウェ", o: "ウォ" },
  v: { a: "ヴァ", i: "ヴィ", u: "ヴ", e: "ヴェ", o: "ヴォ" },
  j: { a: "ジャ", i: "ジ", u: "ジュ", e: "ジェ", o: "ジョ" },
};

const DIGRAPH_TABLE = {
  sh: { row: { a: "シャ", i: "シ", u: "シュ", e: "シェ", o: "ショ" }, fallback: "シュ" },
  ch: { row: { a: "チャ", i: "チ", u: "チュ", e: "チェ", o: "チョ" }, fallback: "チ" },
  th: { row: { a: "サ", i: "シ", u: "ス", e: "セ", o: "ソ" }, fallback: "ス" }, // approximated via s-row
  ph: { row: { a: "ファ", i: "フィ", u: "フ", e: "フェ", o: "フォ" }, fallback: "フ" },
  wh: { row: { a: "ワ", i: "ウィ", u: "ウ", e: "ウェ", o: "ウォ" }, fallback: "ウ" },
};

const DEFAULT_VOWEL = {
  k: "u", g: "u", s: "u", z: "u", t: "o", d: "o", h: "u", f: "u",
  b: "u", p: "u", y: "i", r: "u", l: "u", v: "u", w: "u", j: "i",
};

const VOWEL_KATAKANA = { a: "ア", i: "イ", u: "ウ", e: "エ", o: "オ" };
const VOWELS = new Set(["a", "e", "i", "o", "u"]);
const CONSONANTS = new Set([..."bcdfghjklmnpqrstvwxyz"]);

// Internal-only placeholder inserted where a doubled consonant should
// produce a small っ (sokuon). Never collides with real input, since
// preprocess() has already stripped everything outside [a-z\s] by the
// time this marker is inserted.
const SOKUON_MARKER = "";

/** Lowercase, keep letters/spaces only, resolve 'c'->k/s and 'qu'->kw, mark doubled consonants for sokuon. */
function preprocess(input) {
  let s = String(input || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "");

  // Contextual "c": soft before e/i/y (-> s), hard otherwise (-> k).
  s = s.replace(/c(?=[eiy])/g, "s").replace(/c/g, "k");
  s = s.replace(/qu/g, "kw");

  // Doubled consonant -> sokuon marker + single consonant (e.g. "tt" -> <marker>t).
  s = s.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, SOKUON_MARKER + "$1");
  return s;
}

/**
 * Approximate katakana transliteration of a foreign name. Returns
 * { katakana, wordCount } — never throws on malformed/empty/very long
 * input (caller is expected to cap input length before calling, but
 * this function is safe either way since it only ever reads characters).
 */
export function transliterateToKatakana(input) {
  const s = preprocess(input);
  let out = "";
  let i = 0;
  const n = s.length;

  while (i < n) {
    const ch = s[i];

    if (ch === " ") { out += "・"; i += 1; continue; }
    if (ch === SOKUON_MARKER) { out += "ッ"; i += 1; continue; }
    if (VOWELS.has(ch)) { out += VOWEL_KATAKANA[ch]; i += 1; continue; }
    if (!CONSONANTS.has(ch)) { i += 1; continue; } // stray char, skip safely

    const two = s.slice(i, i + 2);
    const digraph = DIGRAPH_TABLE[two];
    if (digraph) {
      const vowelChar = s[i + 2];
      if (vowelChar && VOWELS.has(vowelChar)) {
        out += digraph.row[vowelChar];
        i += 3;
      } else {
        out += digraph.fallback;
        i += 2;
      }
      continue;
    }

    if (ch === "n" || ch === "m") {
      const next = s[i + 1];
      const nextIsVowelish = next && (VOWELS.has(next) || next === "y");
      if (nextIsVowelish) {
        const vowelChar = VOWELS.has(next) ? next : "i";
        out += ROW_TABLE[ch][vowelChar];
        i += 2;
      } else {
        out += ch === "n" ? "ン" : "ム";
        i += 1;
      }
      continue;
    }

    if (ch === "x") { out += "クス"; i += 1; continue; }

    // "h" immediately after a vowel and NOT followed by another vowel
    // is silent in English far more often than not (Sarah, John, Noah,
    // Hannah, Leah) — a cheap, safe special case worth handling even
    // in an otherwise letter-literal approximation.
    if (ch === "h") {
      const prev = s[i - 1];
      const next = s[i + 1];
      const prevIsVowel = prev && VOWELS.has(prev);
      const nextIsVowel = next && VOWELS.has(next);
      if (prevIsVowel && !nextIsVowel) { i += 1; continue; }
    }

    const row = ROW_TABLE[ch];
    if (!row) { i += 1; continue; } // unknown letter, skip safely

    const next = s[i + 1];
    if (next && VOWELS.has(next)) {
      out += row[next];
      i += 2;
    } else if (next === "y") {
      out += row.i;
      i += 2;
    } else {
      out += row[DEFAULT_VOWEL[ch] || "u"];
      i += 1;
    }
  }

  return { katakana: out, wordCount: s.trim().split(/\s+/).filter(Boolean).length };
}
