// Plain-Node test suite for the ACT Score Calculator engine.
// Run with:
//   node scripts/act-score-calculator.test.js
//
// Tables, equation and text conditions are the reference's own (omnicalculator.com/other/act-score calculator
// definition); the screenshot case was read from the live page.

import { ACT_SECTIONS, calculateAct, scaledScore, rawOptions, percentileFor, PERCENTILE_TABLE } from "../src/utils/actScoreCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (english, math, reading, science) => calculateAct({ english: String(english), math: String(math), reading: String(reading), science: String(science) });
const out = (...a) => {
  const r = run(...a);
  return r.errors ? r.errors.join(" | ") : `${r.sections.map((s) => s.scaled).join("/")} | ${r.composite} | ${r.percentile}${r.great ? " | great" : ""}`;
};
const [EN, MA, RE, SC] = ACT_SECTIONS;

// ── Screenshot (live): 74 / 48 / 25 / 24 → 36 / 30 / 22 / 22, composite 28, 87th percentile, congratulations ──
eq("screenshot", out(74, 48, 25, 24), "36/30/22/22 | 28 | 87th | great");

// ── Rounding and the unrounded percentile (reference behaviour) ──
eq("27.25 → 27, 87th", out(74, 48, 25, 22), "36/30/22/21 | 27 | 87th | great");
eq("27.75 → 28, 87th", out(74, 48, 26, 24), "36/30/23/22 | 28 | 87th | great");
eq("exact 28 → 90th", out(61, 45, 31, 31), "28/28/28/28 | 28 | 90th | great");
eq("22.75 → 23 but 69th, no congratulations", out(52, 34, 26, 24), "23/23/23/22 | 23 | 69th");
eq("23.25 → 23, 74th, congratulations", out(52, 34, 26, 26), "23/23/23/24 | 23 | 74th | great");
eq("all max → 36, 100th", out(75, 60, 40, 40), "36/36/36/36 | 36 | 100th | great");
eq("35.75 → 36 but 99th", out(75, 60, 40, 37), "36/36/36/35 | 36 | 99th | great");
eq("all zero → 1, 1st", out(0, 0, 0, 0), "1/1/1/1 | 1 | 1st");
eq("10.25 → 10, 1st", out(18, 5, 6, 7), "10/11/10/10 | 10 | 1st");
eq("exact 11 → 3rd", out(22, 5, 8, 8), "11/11/11/11 | 11 | 3rd");

// ── Tables (spot checks against the reference dataset; the full tables were diffed: 0 mismatches) ──
eq("English 45 → 21 (FAQ)", scaledScore(EN, 45), 21);
eq("English 0 and 1 → 1", `${scaledScore(EN, 0)} ${scaledScore(EN, 1)}`, "1 1");
eq("Math 3 → 8, 57 → 35", `${scaledScore(MA, 3)} ${scaledScore(MA, 57)}`, "8 35");
eq("Reading 32 → 29", scaledScore(RE, 32), 29);
eq("Science 33 → 30, 30 → 26", `${scaledScore(SC, 33)} ${scaledScore(SC, 30)}`, "30 26");
eq("option counts", ACT_SECTIONS.map((s) => rawOptions(s).length).join(), "76,61,41,41");
eq("options highest first", `${rawOptions(EN)[0]}..${rawOptions(EN).at(-1)}`, "75..0");

// ── Percentiles ──
eq("percentile brackets", [36, 35.75, 34, 33.5, 29, 24.25, 19, 11, 10.75, 1].map(percentileFor).join(" "), "100th 99th 99th 98th 92nd 78th 53rd 3rd 1st 1st");
eq("table 36→1", PERCENTILE_TABLE.map(([s, p]) => `${s}:${p}`).slice(0, 4).join(" ") + " … " + PERCENTILE_TABLE.slice(-3).map(([s, p]) => `${s}:${p}`).join(" "),
  "36:100th 35:99th 34:99th 33:98th … 3:1st 2:1st 1:1st");

// ── Validation ──
eq("missing", out("", 48, 25, 24), "Please choose a valid English raw score.");
eq("out of range", out(76, 61, 41, -1), "Please choose a valid English raw score. | Please choose a valid Math raw score. | Please choose a valid Reading raw score. | Please choose a valid Science raw score.");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
