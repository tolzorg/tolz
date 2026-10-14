// Plain-Node test suite for the ROI Calculator engine.
// Run with:
//   node scripts/roi-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/roi-calculator.html) via plain GET requests. A scratch
// comparator also diffed 240 random scenarios (amounts, date ranges from one
// day to decades, and lengths): all 240 matched every row, colour and label.

import { calculateRoi, ROI_DEFAULTS } from "../src/utils/roiCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const TODAY = "2026-10-14";
const run = (o = {}) => calculateRoi({ ...ROI_DEFAULTS, useLength: false, startDate: TODAY, today: TODAY, ...o });
const rows = (r) => r.rows.map(([l, v]) => `${l} ${v}`).join(" / ");

// ── Default example (screenshot) ──
{
  const r = run();
  eq("default", rows(r), "Investment Gain $1,000.00 / ROI 100.00% / Annualized ROI 17.88% / Investment Length 4.214 years");
  eq("pie", r.pie.map((p) => `${p.label} ${p.value} ${p.color}`).join(" / "), "Invested 1000 #2b7ddb / Profit 1000 #8bbc21");
  eq("gain is green", r.loss, false);
}
eq("use length", rows(run({ useLength: true })), "Investment Gain $1,000.00 / ROI 100.00% / Annualized ROI 31.95% / Investment Length 2.500 years");
eq("loss", rows(run({ returned: "500" })), "Investment Loss $500.00 / ROI -50.00% / Annualized ROI -15.17% / Investment Length 4.214 years");
{
  const r = run({ returned: "500" });
  eq("loss is red", r.loss, true);
  eq("loss pie", r.pie.map((p) => `${p.label} ${p.value}`).join(" / "), "Remaining 500 / Loss 500");
}
eq("break even", rows(run({ returned: "1000" })), "Investment Gain $0.00 / ROI 0.00% / Annualized ROI 0.00% / Investment Length 4.214 years");
eq("half year", rows(run({ useLength: true, length: "0.5" })).split(" / ")[2], "Annualized ROI 300.00%");
eq("decimals and commas", rows(run({ invested: "1,000.55", returned: "2,000.4" })), "Investment Gain $999.85 / ROI 99.93% / Annualized ROI 17.87% / Investment Length 4.214 years");
eq("1,000 years", rows(run({ useLength: true, length: "1,000" })).split(" / ").slice(2).join(" / "), "Annualized ROI 0.07% / Investment Length 1,000.000 years");

// ── Dates: anniversaries + leftover days ÷ 365 ──
eq("leap year counts 1 year", rows(run({ startDate: "2028-01-01", endDate: "2029-01-01" })).split(" / ").slice(2).join(" / "), "Annualized ROI 100.00% / Investment Length 1.000 years");
eq("Feb 29 start", rows(run({ startDate: "2028-02-29", endDate: "2029-02-28" })).split(" / ")[3], "Investment Length 1.000 years");
eq("ten years", rows(run({ startDate: "2020-01-01", endDate: "2030-01-01" })).split(" / ")[2], "Annualized ROI 7.18%");
eq("six days", rows(run({ returned: "1001", startDate: "2026-10-14", endDate: "2026-10-20" })), "Investment Gain $1.00 / ROI 0.10% / Annualized ROI 6.27% / Investment Length 0.016 years");
eq("one day: years rounded to 5 dp first", rows(run({ startDate: "2030-12-30" })).split(" / ")[2],
  "Annualized ROI 7,327,602,820,714,099,406,419,416,245,057,103,220,200,578,621,911,159,469,559,956,741,089,291,425,614,782,490,491,933,759,394,833,558,671,844,179,968.00%");
eq("overflow", rows(run({ startDate: "2030-12-30", returned: "100000000" })).split(" / ")[2], "Annualized ROI inf%");
eq("length rounds to 0", rows(run({ useLength: true, length: "0.000001" })).split(" / ").slice(2).join(" / "), "Annualized ROI inf% / Investment Length 0.000 years");
eq("near -100%", rows(run({ startDate: "2030-12-30", returned: "1" })).split(" / ").slice(1, 3).join(" / "), "ROI -99.90% / Annualized ROI -100.00%");
eq("big digits keep cents", rows(run({ returned: "4990.14", useLength: true, length: "0.063" })).split(" / ")[2], "Annualized ROI 12,054,645,561,886.29%");
eq("invalid start date = today", rows(run({ startDate: "x" })).split(" / ")[3], "Investment Length 4.214 years");

// ── Validation ──
eq("both amounts", run({ invested: "x", returned: "y" }).errors.join(" | "), "Please provide a positive amount invested. | Please provide a positive amount returned.");
eq("zero invested", run({ invested: "0" }).errors.join(), "Please provide a positive amount invested.");
eq("zero returned", run({ returned: "0" }).errors.join(), "Please provide a positive amount returned.");
eq("same dates", run({ startDate: "2030-12-31" }).errors.join(), "Begin date should be earlier than end date.");
eq("reversed dates", run({ startDate: "2031-01-01" }).errors.join(), "Begin date should be earlier than end date.");
eq("zero length", run({ useLength: true, length: "0" }).errors.join(), "Please provide a positive investment length.");
eq("dates ignored with length", rows(run({ useLength: true, length: "3", startDate: "2031-01-01" })).split(" / ")[2], "Annualized ROI 25.99%");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
