// Plain-Node test suite for the shared AP® score engine (AP® Bio and AP® Chem Score Calculators).
// Run with:
//   node scripts/ap-score-calculators.test.js
//
// Formulas and messages are the references' own (omnicalculator.com/other/ap-bio-score and /ap-chem-score
// calculator definitions); results marked "live" were read from the live pages in a browser.

import { AP_EXAMS, calculateApScore, apScale, frqMax } from "../src/utils/apScoreCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const out = (exam, ...pts) => {
  const values = Object.fromEntries(exam.fields.map((f, i) => [f.key, String(pts[i])]));
  const r = calculateApScore(exam, values);
  return r.errors ? r.errors.join(" | ") : `${r.composite} | ${r.apScore} | ${r.recommendation}`;
};
const scaleText = (exam) => apScale(exam).map((b) => `${b.score}:${b.min}-${b.max}`).join(" ");

// ═══ AP® Biology: MCQ + FRQ × 60/36 ═══
const bio = (...p) => out(AP_EXAMS.bio, ...p);
eq("bio screenshot 23,4,6,2,4,3,3 (live)", bio(23, 4, 6, 2, 4, 3, 3), "60 | 3 | qualified");
eq("bio maximum (live)", bio(60, 10, 10, 4, 4, 4, 4), "120 | 5 | extremely well qualified");
eq("bio zero (live)", bio(0, 0, 0, 0, 0, 0, 0), "0 | 1 | no recommendation");
eq("bio 58 + 33 FRQ (live)", bio(58, 10, 10, 4, 4, 4, 1), "113 | 5 | extremely well qualified");
eq("bio 2/3 rounds up", bio(0, 1, 0, 0, 0, 0, 0), "2 | 1 | no recommendation");   // 1.667 → 2
eq("bio 1/3 rounds down", bio(0, 2, 0, 0, 0, 0, 0), "3 | 1 | no recommendation"); // 3.333 → 3
eq("bio 93 → 5", bio(43, 10, 10, 4, 4, 2, 0), "93 | 5 | extremely well qualified");
eq("bio 92 → 4", bio(42, 10, 10, 4, 4, 2, 0), "92 | 4 | very well qualified");
eq("bio 74 → 4", bio(54, 4, 4, 4, 0, 0, 0), "74 | 4 | very well qualified");
eq("bio 73 → 3", bio(53, 4, 4, 4, 0, 0, 0), "73 | 3 | qualified");
eq("bio 51 → 3", bio(26, 10, 4, 1, 0, 0, 0), "51 | 3 | qualified");
eq("bio 50 → 2", bio(25, 10, 4, 1, 0, 0, 0), "50 | 2 | possibly qualified");
eq("bio 28 → 2", bio(28, 0, 0, 0, 0, 0, 0), "28 | 2 | possibly qualified");
eq("bio 27 → 1", bio(27, 0, 0, 0, 0, 0, 0), "27 | 1 | no recommendation");
eq("bio scale", scaleText(AP_EXAMS.bio), "5:93-120 4:74-92 3:51-73 2:28-50 1:0-27");
eq("bio FRQ max", frqMax(AP_EXAMS.bio), 36);
eq("bio decimal", bio("23.5", 4, 6, 2, 4, 3, 3), "The number of points for multiple-choice question must be an integer between 0 and 60.");
eq("bio too high", bio(61, 11, 6, 5, 4, 3, 3), "The number of points for multiple-choice question must be an integer between 0 and 60. | The number of points for the free-response question 1 must be an integer between 0 and 10. | The number of points for the free-response question 3 must be an integer between 0 and 4.");
eq("bio negative", bio(23, 4, 6, 2, 4, 3, -1), "The number of points for the free-response question 6 must be an integer between 0 and 4.");
eq("bio text", bio(23, 4, "x", 2, 4, 3, 3), "The number of points for the free-response question 2 must be an integer between 0 and 10.");

// ═══ AP® Chemistry: MCQ × 50/60 + FRQ × 50/46 ═══
const chem = (...p) => out(AP_EXAMS.chem, ...p);
eq("chem screenshot 34,5,7,4,3,3,2,1 (live)", chem(34, 5, 7, 4, 3, 3, 2, 1), "56 | 3 | qualified");
eq("chem tie 2.5 → 3 (live)", chem(3, 0, 0, 0, 0, 0, 0, 0), "3 | 1 | no recommendation");
eq("chem tie 7.5 → 8 (live)", chem(9, 0, 0, 0, 0, 0, 0, 0), "8 | 1 | no recommendation");
eq("chem tie 42.5 → 43 (live)", chem(21, 10, 10, 3, 0, 0, 0, 0), "43 | 3 | qualified");
eq("chem tie 37.5 → 38 (live)", chem(15, 10, 10, 3, 0, 0, 0, 0), "38 | 2 | possibly qualified");
eq("chem tie 52.5 → 53 (live)", chem(33, 10, 10, 3, 0, 0, 0, 0), "53 | 3 | qualified");
eq("chem tie 97.5 → 98 (live)", chem(57, 10, 10, 10, 4, 4, 4, 4), "98 | 5 | extremely well qualified");
eq("chem maximum", chem(60, 10, 10, 10, 4, 4, 4, 4), "100 | 5 | extremely well qualified");
eq("chem zero", chem(0, 0, 0, 0, 0, 0, 0, 0), "0 | 1 | no recommendation");
eq("chem 72 → 5", chem(60, 10, 10, 0, 0, 0, 0, 0), "72 | 5 | extremely well qualified");  // 50 + 21.74
eq("chem 71 → 4", chem(59, 10, 10, 0, 0, 0, 0, 0), "71 | 4 | very well qualified");      // 49.17 + 21.74 = 70.9
eq("chem 58 → 4", chem(48, 10, 7, 0, 0, 0, 0, 0), "58 | 4 | very well qualified");        // 40 + 18.48
eq("chem 57 → 3", chem(46, 10, 7, 0, 0, 0, 0, 0), "57 | 3 | qualified");
eq("chem 42 → 3", chem(24, 10, 10, 0, 0, 0, 0, 0), "42 | 3 | qualified");                 // 20 + 21.74
eq("chem 41 → 2", chem(23, 10, 10, 0, 0, 0, 0, 0), "41 | 2 | possibly qualified");
eq("chem 27 → 2", chem(6, 10, 10, 0, 0, 0, 0, 0), "27 | 2 | possibly qualified");          // 5 + 21.74
eq("chem 26 → 1", chem(5, 10, 10, 0, 0, 0, 0, 0), "26 | 1 | no recommendation");
eq("chem scale", scaleText(AP_EXAMS.chem), "5:72-100 4:58-71 3:42-57 2:27-41 1:0-26");
eq("chem FRQ max", frqMax(AP_EXAMS.chem), 46);
eq("chem messages", chem(60.5, 10, 11, 10, 4, 5, 4, -1),
  "The number of points for multiple-choice question must be an integer between 0 and 60. | The number of points for the free-response long question 2 must be an integer between 0 and 10. | The number of points for the free-response short question 2 must be an integer between 0 and 4. | The number of points for the free-response short question 4 must be an integer between 0 and 4.");
// Every MCQ/FRQ pair matches the plain-float formula except at exact halves, where half-up applies.
let mismatches = 0;
for (let m = 0; m <= 60; m++) for (let f = 0; f <= 46; f++) {
  const x = (m * 50) / 60 + (f * 50) / 46;
  const values = { mcq: String(m), l1: String(Math.min(f, 10)), l2: String(Math.min(Math.max(f - 10, 0), 10)), l3: String(Math.min(Math.max(f - 20, 0), 10)),
    s1: String(Math.min(Math.max(f - 30, 0), 4)), s2: String(Math.min(Math.max(f - 34, 0), 4)), s3: String(Math.min(Math.max(f - 38, 0), 4)), s4: String(Math.min(Math.max(f - 42, 0), 4)) };
  if (calculateApScore(AP_EXAMS.chem, values).composite !== Math.floor(x + 0.5 + 1e-9)) mismatches++;
}
eq("chem all 61 × 47 pairs", mismatches, 0);

// ═══ AP® English Language: MCQ + FRQ × 55/18 ═══
const lang = (...p) => out(AP_EXAMS.lang, ...p);
eq("lang screenshot 43,6,3,2 (live)", lang(43, 6, 3, 2), "77 | 5 | extremely well qualified");
eq("lang tie 27.5 → 28 (live)", lang(0, 3, 3, 3), "28 | 1 | no recommendation");
eq("lang tie 52.5 → 53 (live)", lang(25, 3, 3, 3), "53 | 3 | qualified");
eq("lang tie, other split (live)", lang(25, 6, 3, 0), "53 | 3 | qualified");
eq("lang tie 64.5 → 65 (live)", lang(37, 3, 3, 3), "65 | 4 | very well qualified");
eq("lang maximum (live)", lang(45, 6, 6, 6), "100 | 5 | extremely well qualified");
eq("lang zero (live)", lang(0, 0, 0, 0), "0 | 1 | no recommendation");
eq("lang 10,1,4,4 (live)", lang(10, 1, 4, 4), "38 | 2 | possibly qualified");
eq("lang 75 → 5", lang(38, 6, 6, 0), "75 | 5 | extremely well qualified");
eq("lang 74 → 4", lang(37, 6, 6, 0), "74 | 4 | very well qualified");
eq("lang 36 → 2", lang(18, 6, 0, 0), "36 | 2 | possibly qualified");
eq("lang 35 → 1", lang(17, 6, 0, 0), "35 | 1 | no recommendation");
eq("lang scale", scaleText(AP_EXAMS.lang), "5:75-100 4:65-74 3:53-64 2:36-52 1:0-35");
eq("lang FRQ max", frqMax(AP_EXAMS.lang), 18);
eq("lang 47 out of range (live: no result)", lang(47, 6, 6, 6), "The number of points for multiple choice question must be an integer between 0 and 45.");
eq("lang messages", lang(1.5, 7, -1, "x"),
  "The number of points for multiple choice question must be an integer between 0 and 45. | The number of points for the free response question 1 must be an integer between 0 and 6. | The number of points for the free response question 2 must be an integer between 0 and 6. | The number of points for the free response question 3 must be an integer between 0 and 6.");

// ═══ AP® World History: MCQ × 52/55 + SAQ × 26/9 + DBQ × 32/7 + LEQ × 20/6 ═══
const world = (...p) => out(AP_EXAMS.world, ...p);
eq("world screenshot 34,3,2,3,4,3 (live)", world(34, 3, 2, 3, 4, 3), "84 | 4 | very well qualified");
eq("world maximum (live)", world(55, 3, 3, 3, 7, 6), "130 | 5 | extremely well qualified");
eq("world zero (live)", world(0, 0, 0, 0, 0, 0), "0 | 1 | no recommendation");
eq("world 40,2,2,2,5,4 (live)", world(40, 2, 2, 2, 5, 4), "91 | 4 | very well qualified");
eq("world 30,2,2,1,3,3 (live)", world(30, 2, 2, 1, 3, 3), "67 | 3 | qualified");
eq("world 43 just below 2 (live)", world(20, 1, 1, 1, 2, 2), "43 | 1 | no recommendation");
eq("world 56 out of range (live: no result)", world(56, 3, 3, 3, 7, 6), "The number of points for multiple-choice question must be an integer between 0 and 55.");
eq("world messages", world(0, 4, 0, 0, 8, 7),
  "The number of points for the short-answer question 1 must be an integer between 0 and 3. | The number of points for the document-based question must be an integer between 0 and 7. | The number of points for the long essay question must be an integer between 0 and 6.");
eq("world scale", scaleText(AP_EXAMS.world), "5:97-130 4:80-96 3:62-79 2:44-61 1:0-43");
eq("world point rows", calculateApScore(AP_EXAMS.world, { mcq: "34", saq1: "3", saq2: "2", saq3: "3", dbq: "4", leq: "3" }).rows.map((r) => `${r.points}/${r.max}`).join(" "), "34/55 8/9 4/7 3/6");
eq("world sections", AP_EXAMS.world.sections.map((s) => `${s.title}:${s.keys.length}`).join(" "), "Section I:4 Section II:2");
// The composite equals the plain formula everywhere (no exact halves exist for AP World).
let worldMismatch = 0;
for (let m = 0; m <= 55; m++) for (let s = 0; s <= 9; s++) for (let d = 0; d <= 7; d++) for (let e = 0; e <= 6; e++) {
  const x = (m * 52) / 55 + (s * 26) / 9 + (d * 32) / 7 + (e * 20) / 6;
  const v = { mcq: String(m), saq1: String(Math.min(s, 3)), saq2: String(Math.min(Math.max(s - 3, 0), 3)), saq3: String(Math.max(s - 6, 0)), dbq: String(d), leq: String(e) };
  if (calculateApScore(AP_EXAMS.world, v).composite !== Math.round(x)) worldMismatch++;
}
eq("world every combination", worldMismatch, 0);
eq("bio/chem/lang point rows unchanged", ["bio", "chem", "lang"].map((k) => AP_EXAMS[k].pointRows.map((r) => r.label).join("+")).join(" | "),
  "Multiple-choice points+Free-response points | Multiple-choice points+Free-response points | Multiple-choice points+Free-response points");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
