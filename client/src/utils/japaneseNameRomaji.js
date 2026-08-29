// Japanese Name Generator — Hiragana → Hepburn romaji conversion and
// mora counting. Both are deterministic, rule-based transliteration
// algorithms (not name-fact claims), so they're implemented directly
// rather than sourced from a dataset — this is the "consistent Hepburn
// system throughout the app" required by spec Section 8, and the exact
// mora algorithm required by Section 10.

// Base kana -> Hepburn romaji (single kana, no combinations).
const BASE_KANA = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu",
};

// Contracted-sound (base kana + small y-kana) -> Hepburn romaji.
const YOON = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
};

// Small vowel kana forming one sound with a preceding base kana
// (e.g. ゔぁ = "va", てぃ = "ti", ふぁ = "fa") — common in transliterated
// foreign-origin readings.
const SMALL_VOWEL_COMBOS = {
  ゔぁ: "va", ゔぃ: "vi", ゔぇ: "ve", ゔぉ: "vo",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ちぇ: "che", じぇ: "je", しぇ: "she",
};

const SMALL_Y = new Set(["ゃ", "ゅ", "ょ"]);
const SMALL_VOWELS = new Set(["ぁ", "ぃ", "ぅ", "ぇ", "ぉ"]);

function katakanaToHiragana(str) {
  return str.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * Tokenize a reading (hiragana, or katakana — auto-folded) into a list
 * of mora units, each { kana, kind }. Shared by both romajiFromReading()
 * and moraCount() so the two never disagree about where mora boundaries
 * fall.
 */
export function tokenizeMora(reading) {
  const s = katakanaToHiragana(reading || "").replace(/[^぀-ゟー]/g, ""); // hiragana + chōonpu only
  const units = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const next = s[i + 1];

    if (ch === "っ") { units.push({ kana: "っ", kind: "sokuon" }); i += 1; continue; }
    if (ch === "ん") { units.push({ kana: "ん", kind: "moraic-nasal" }); i += 1; continue; }
    if (ch === "ー") { units.push({ kana: "ー", kind: "chōonpu" }); i += 1; continue; }

    if (next && SMALL_VOWELS.has(next)) {
      const combo = ch + next;
      if (SMALL_VOWEL_COMBOS[combo]) { units.push({ kana: combo, kind: "small-vowel-combo" }); i += 2; continue; }
    }
    if (next && SMALL_Y.has(next)) {
      const combo = ch + next;
      if (YOON[combo]) { units.push({ kana: combo, kind: "yoon" }); i += 2; continue; }
    }
    units.push({ kana: ch, kind: "base" });
    i += 1;
  }
  return units;
}

/** Mora count for a Hiragana/Katakana reading — spec Section 10's exact rules. */
export function moraCount(reading) {
  return tokenizeMora(reading).length;
}

// Plain vowel -> macron vowel, used for standard (modified) Hepburn
// long-vowel display: おう/おお -> ō, ええ -> ē, ああ -> ā, いい -> ī,
// うう -> ū. Note えい is intentionally NOT merged (stays "ei") — that
// is standard Hepburn behavior (e.g. せんせい -> sensei, not sensē),
// distinct from mora counting where えい is still 2 separate morae
// either way.
const MACRON = { a: "ā", i: "ī", u: "ū", e: "ē", o: "ō" };
const PLAIN_VOWELS = new Set(["a", "i", "u", "e", "o"]);

/**
 * Normalized Hepburn romaji for a Hiragana/Katakana reading. Handles
 * long vowels (both ー and doubled-vowel-kana forms, rendered with a
 * macron per standard Hepburn), sokuon (small っ doubles the following
 * consonant), ん (n, or n' before a vowel/y to avoid ambiguity), and
 * all contracted sounds. This is the ONE romanization system used
 * throughout the app — never mixed with Kunrei-shiki/Nihon-shiki.
 */
export function romajiFromReading(reading) {
  const units = tokenizeMora(reading);
  let out = "";
  let i = 0;
  while (i < units.length) {
    const u = units[i];

    if (u.kind === "sokuon") {
      const nextUnit = units[i + 1];
      const nextRomaji = nextUnit ? romajiForUnit(nextUnit) : "";
      // Double the following consonant (っか -> kka); "chi"/"tsu" double specially (っち -> tchi, っつ -> ttsu).
      const firstConsonant = nextRomaji.startsWith("ch") ? "t" : nextRomaji[0];
      out += firstConsonant || "";
      i += 1;
      continue;
    }

    if (u.kind === "chōonpu") {
      const lastChar = out[out.length - 1];
      out = PLAIN_VOWELS.has(lastChar) ? out.slice(0, -1) + MACRON[lastChar] : out;
      i += 1;
      continue;
    }

    if (u.kind === "moraic-nasal") {
      const nextUnit = units[i + 1];
      const nextRomaji = nextUnit ? romajiForUnit(nextUnit) : "";
      const needsApostrophe = /^[aiueoy]/.test(nextRomaji);
      out += needsApostrophe ? "n'" : "n";
      i += 1;
      continue;
    }

    // Standard-Hepburn long-vowel digraphs: only the bare vowel kana
    // お/う/え/あ/い (as a plain "base" unit, not part of a yoon/combo)
    // immediately following a same-vowel-ending romaji triggers a
    // macron merge. え+い is deliberately excluded (stays "ei").
    if (u.kind === "base" || u.kind === "yoon" || u.kind === "small-vowel-combo") {
      const thisRomaji = romajiForUnit(u);
      out += thisRomaji;
      const lastVowel = thisRomaji[thisRomaji.length - 1];
      const nextUnit = units[i + 1];
      if (
        PLAIN_VOWELS.has(lastVowel) &&
        nextUnit &&
        nextUnit.kind === "base" &&
        isLongVowelPair(lastVowel, nextUnit.kana)
      ) {
        out = out.slice(0, -1) + MACRON[lastVowel];
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    out += romajiForUnit(u);
    i += 1;
  }
  return out;
}

function isLongVowelPair(precedingVowel, nextKana) {
  if (precedingVowel === "o") return nextKana === "う" || nextKana === "お";
  if (precedingVowel === "u") return nextKana === "う";
  if (precedingVowel === "e") return nextKana === "え"; // NOT い — えい stays "ei"
  if (precedingVowel === "a") return nextKana === "あ";
  if (precedingVowel === "i") return nextKana === "い";
  return false;
}

function romajiForUnit(u) {
  if (u.kind === "yoon") return YOON[u.kana] || "";
  if (u.kind === "small-vowel-combo") return SMALL_VOWEL_COMBOS[u.kana] || "";
  return BASE_KANA[u.kana] || "";
}

/** Capitalize the first letter of each romaji "word" (for display of a name). */
export function capitalizeRomaji(romaji) {
  if (!romaji) return "";
  return romaji.charAt(0).toUpperCase() + romaji.slice(1);
}
