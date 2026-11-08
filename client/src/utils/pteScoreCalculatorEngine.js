// PTE Score Calculator engine — matches omnicalculator.com/other/pte-score (its calculator definition was read
// from the page; behaviour checked live, see scripts/pte-score-calculator.test.js).
//
// One input, the overall PTE score (10–90; "PTE score can't be lower than 10." / "… higher than 90."), and four
// text segments, each picked by the reference's own conditions:
//   University  60+ / 51–59.99 / 36–50.99 / below 36
//   CEFR        C2 85+ / C1 75+ / B2 59+ / B1 43+ / A2 30+ / below 30 too low
//   IELTS       8.5 at 89+ / 8 84+ / 7.5 76+ / 7 66+ / 6.5 56+ / 6 46+ / 5.5 36+ / 5 29+ / 4.5 23+ / below 23 too low
//   TOEFL       120 from 84, then one value per ROUNDED score from 83 down to 38, "too low" below 38, plus a level
//               line for scores above 38 / 44 / 53 / 68.
// The conditions are kept exactly as the reference has them, including two edges that only fractional scores hit:
// 83.5 ≤ score < 84 rounds to 84 but is below 84, so no TOEFL value shows; 37.5 ≤ score < 38 shows both "40-44"
// and "too low". Rounding is half away from zero (mathjs round).

import { clean, num } from "./marginCalculatorEngine.js";

const between = (lo, hi) => (p) => p >= lo && p < hi;

const UNIVERSITY = [
  { when: (p) => p >= 60 && p <= 90, level: "Postgraduate", text: "You would qualify for most postgraduate, undergraduate and foundation courses with your score." },
  { when: between(51, 60), level: "Undergraduate", text: "You would qualify for most foundation and undergraduate courses, but it might be not enough to qualify for postgraduate courses." },
  { when: between(36, 51), level: "Foundation", text: "You would qualify for most foundation courses, but it might be not enough to qualify for undergraduate or postgraduate courses." },
  { when: (p) => p < 36, level: null, text: "Your score is too low to qualify for most university courses." },
];

const CEFR = [
  { when: (p) => p >= 85 && p <= 90, level: "C2", text: "Congratulations! At C2 level, you're a master of English with near-native fluency and understanding." },
  { when: between(75, 85), level: "C1", text: "Impressive! Achieving C1 means you can express complex ideas fluently and spontaneously, like an advanced speaker." },
  { when: between(59, 75), level: "B2", text: "Well done! Being at B2 level shows you can clearly and detailedly discuss a wide range of topics." },
  { when: between(43, 59), level: "B1", text: "Great job! At B1, you're able to handle most travel and work conversations and situations." },
  { when: between(30, 43), level: "A2", text: "Nice work! With A2 level English, you can understand and participate in basic conversations and convey simple information." },
  { when: (p) => p < 30, level: null, text: "Your score is too low to estimate CEFR." },
];

const IELTS = [
  { when: (p) => p >= 89 && p <= 90, band: "8.5", text: "Scoring 8.5 in IELTS is outstanding, indicating complete command of the language." },
  { when: between(84, 89), band: "8", text: "An 8.0 IELTS score reflects near-native English ability, with comprehensive understanding and expression in a wide range of scenarios." },
  { when: between(76, 84), band: "7.5", text: "With a 7.5, you're very proficient in English, showing a high level of fluency and comprehension in complex contexts." },
  { when: between(66, 76), band: "7", text: "Scoring 7.0 demonstrates a strong proficiency in English, enabling you to use it fluently and flexibly in most situations." },
  { when: between(56, 66), band: "6.5", text: "A 6.5 IELTS score signifies a solid command of English." },
  { when: between(46, 56), band: "6", text: "At a 6.0, you're competently engaging with English, handling conversations and some detailed information." },
  { when: between(36, 46), band: "5.5", text: "Achieving a 5.5 means you're gaining confidence in English, and are able to understand and express somewhat complex ideas." },
  { when: between(29, 36), band: "5", text: "Scoring 5.0 in IELTS shows you're capable of modest communication in English." },
  { when: between(23, 29), band: "4.5", text: "With a 4.5 in IELTS, you're starting to navigate basic English in familiar situations." },
  { when: between(10, 23), band: null, text: "Your PTE score is too low to estimate IELTS." },
];

/** TOEFL value for each rounded PTE score from 83 down to 38. */
const TOEFL_BY_ROUNDED = {
  83: "119", 82: "118", 81: "117", 80: "115-116", 79: "114", 78: "113", 77: "112", 76: "110-111", 75: "109", 74: "107-108",
  73: "106", 72: "105", 71: "103-104", 70: "102", 69: "101", 68: "99-100", 67: "98", 66: "97", 65: "95-96", 64: "94",
  63: "93", 62: "91-92", 61: "90", 60: "89", 59: "87-88", 58: "86", 57: "85", 56: "83-84", 55: "82", 54: "81",
  53: "79-80", 52: "78", 51: "76-77", 50: "74-75", 49: "72-73", 48: "70-71", 47: "67-69", 46: "65-66", 45: "63-64",
  44: "60-62", 43: "57-59", 42: "54-56", 41: "52-53", 40: "48-51", 39: "45-47", 38: "40-44",
};
export const TOEFL_TOO_LOW = "Your score is too low to estimate TOEFL.";
const TOEFL_LEVELS = [
  { when: (p) => p > 68 && p <= 90, name: "Advanced", range: "101-120", text: "Fluent, nuanced understanding." },
  { when: (p) => p > 53 && p <= 68, name: "High-Intermediate", range: "81-100", text: "Strong, detailed expression." },
  { when: (p) => p > 44 && p <= 53, name: "Intermediate", range: "61-80", text: "Able to manage everyday language." },
  { when: (p) => p > 38 && p <= 44, name: "Basic", range: "40-60", text: "Basic communication skills." },
];

/** mathjs round(): half away from zero. */
const roundHalfAway = (x) => Math.sign(x) * Math.round(Math.abs(x));

/** Every TOEFL line whose condition holds (normally one; none or two only for the fractional edges above). */
function toeflValues(p) {
  const out = [];
  if (p >= 84) out.push("120");
  const r = roundHalfAway(p);
  if (r <= 83 && TOEFL_BY_ROUNDED[r]) out.push(TOEFL_BY_ROUNDED[r]);
  if (p < 38) out.push(TOEFL_TOO_LOW);
  return out;
}

const pick = (rows, p) => rows.find((row) => row.when(p)) || null;

/**
 * text: the overall PTE score as typed → { errors } |
 * { score, university: { level, text }, cefr: { level, text }, ielts: { band, text },
 *   toefl: [values or the too-low sentence], toeflLevel: { name, range, text } | null }
 */
export function calculatePte(text) {
  const t = clean(text);
  const p = num(t);
  if (t === "" || !Number.isFinite(p)) return { errors: ["Please enter a valid number for the PTE score."] };
  if (p < 10) return { errors: ["PTE score can't be lower than 10."] };
  if (p > 90) return { errors: ["PTE score can't be higher than 90."] };
  return {
    score: p,
    university: pick(UNIVERSITY, p),
    cefr: pick(CEFR, p),
    ielts: pick(IELTS, p),
    toefl: toeflValues(p),
    toeflLevel: pick(TOEFL_LEVELS, p),
  };
}

/** Whole-score equivalence rows 90 → 10, grouped where CEFR and IELTS agree: { pte, cefr, ielts, toefl }. */
export function equivalenceTable() {
  const rows = [];
  for (let p = 90; p >= 10; p--) {
    const r = calculatePte(String(p));
    const cefr = r.cefr.level || "–";
    const ielts = r.ielts.band || "–";
    const toefl = r.toefl[0] === TOEFL_TOO_LOW ? null : r.toefl[0];
    const last = rows[rows.length - 1];
    if (last && last.cefr === cefr && last.ielts === ielts) { last.low = p; if (toefl) last.toeflLow = toefl; }
    else rows.push({ high: p, low: p, cefr, ielts, toeflHigh: toefl, toeflLow: toefl });
  }
  const span = (hi, lo) => (hi === lo ? hi : `${lo}-${hi}`);
  return rows.map((r) => {
    let toefl = "–";
    if (r.toeflHigh) {
      const top = r.toeflHigh.split("-").pop();
      const bottom = r.toeflLow.split("-")[0];
      toefl = span(top, bottom);
    }
    return { pte: span(String(r.high), String(r.low)), cefr: r.cefr, ielts: r.ielts, toefl };
  });
}
