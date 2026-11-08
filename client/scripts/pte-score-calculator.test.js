// Plain-Node test suite for the PTE Score Calculator engine.
// Run with:
//   node scripts/pte-score-calculator.test.js
//
// Expected lines were read from the LIVE reference (omnicalculator.com/other/pte-score) by typing each score into
// it in a browser (fresh page per score) and reading the result text back.

import { calculatePte, equivalenceTable, TOEFL_TOO_LOW } from "../src/utils/pteScoreCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** "University level | CEFR | IELTS | TOEFL lines | TOEFL level" for a score. */
const line = (v) => {
  const r = calculatePte(v);
  if (r.errors) return r.errors.join(" | ");
  const toefl = r.toefl.map((t) => (t === TOEFL_TOO_LOW ? "too low" : t)).join(" & ") || "none";
  return [r.university.level || "too low", r.cefr.level || "too low", r.ielts.band || "too low", toefl, r.toeflLevel ? r.toeflLevel.name : "–"].join(" | ");
};

// ── Live results ──
eq("55 (screenshot)", line("55"), "Undergraduate | B1 | 6 | 82 | High-Intermediate");
eq("90", line("90"), "Postgraduate | C2 | 8.5 | 120 | Advanced");
eq("85", line("85"), "Postgraduate | C2 | 8 | 120 | Advanced");
eq("68.5", line("68.5"), "Postgraduate | B2 | 7 | 101 | Advanced");
eq("68", line("68"), "Postgraduate | B2 | 7 | 99-100 | High-Intermediate");
eq("60", line("60"), "Postgraduate | B2 | 6.5 | 89 | High-Intermediate");
eq("53", line("53"), "Undergraduate | B1 | 6 | 79-80 | Intermediate");
eq("44", line("44"), "Foundation | B1 | 5.5 | 60-62 | Basic");
eq("38: no level line", line("38"), "Foundation | A2 | 5.5 | 40-44 | –");
eq("35.5", line("35.5"), "too low | A2 | 5 | too low | –");
eq("29.6", line("29.6"), "too low | too low | 5 | too low | –");
eq("23", line("23"), "too low | too low | 4.5 | too low | –");
eq("10", line("10"), "too low | too low | too low | too low | –");
eq("83.4 rounds to 83", line("83.4"), "Postgraduate | C1 | 7.5 | 119 | Advanced");
eq("83.7: no TOEFL value (reference edge)", line("83.7"), "Postgraduate | C1 | 7.5 | none | Advanced");
eq("83.5: no TOEFL value (reference edge)", line("83.5"), "Postgraduate | C1 | 7.5 | none | Advanced");
eq("37.6: both TOEFL lines (reference edge)", line("37.6"), "Foundation | A2 | 5.5 | 40-44 & too low | –");
eq("82.5 rounds half up", calculatePte("82.5").toefl.join(), "119");

// ── Validation (live wording) ──
eq("below 10", line("9.99"), "PTE score can't be lower than 10.");
eq("0", line("0"), "PTE score can't be lower than 10.");
eq("above 90", line("95"), "PTE score can't be higher than 90.");
eq("text", line("abc"), "Please enter a valid number for the PTE score.");

// ── Texts (live wording) ──
const r55 = calculatePte("55");
eq("university text", r55.university.text, "You would qualify for most foundation and undergraduate courses, but it might be not enough to qualify for postgraduate courses.");
eq("cefr text", r55.cefr.text, "Great job! At B1, you're able to handle most travel and work conversations and situations.");
eq("ielts text", r55.ielts.text, "At a 6.0, you're competently engaging with English, handling conversations and some detailed information.");
eq("toefl level", `${r55.toeflLevel.name} (${r55.toeflLevel.range}): ${r55.toeflLevel.text}`, "High-Intermediate (81-100): Strong, detailed expression.");

// ── Every whole score 10-90 has exactly one TOEFL line; the table matches the reference article's rows ──
eq("one TOEFL line per whole score", Array.from({ length: 81 }, (_, i) => calculatePte(String(i + 10)).toefl.length).every((n) => n === 1), true);
eq("table", equivalenceTable().map((r) => `${r.pte}:${r.cefr}/${r.ielts}/${r.toefl}`).join(" "),
  "89-90:C2/8.5/120 85-88:C2/8/120 84:C1/8/120 76-83:C1/7.5/110-119 75:C1/7/109 66-74:B2/7/97-108 59-65:B2/6.5/87-96 56-58:B1/6.5/83-86 46-55:B1/6/65-82 43-45:B1/5.5/57-64 36-42:A2/5.5/40-56 30-35:A2/5/– 29:–/5/– 23-28:–/4.5/– 10-22:–/–/–");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
