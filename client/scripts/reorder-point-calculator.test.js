// Plain-Node test suite for the Reorder Point Calculator engine.
// Run with:
//   node scripts/reorder-point-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/reorder-point) by entering each scenario
// in a browser and reading the boxes back.

import { calculateReorderPoint, FIELDS, FIELD_KEYS } from "../src/utils/reorderPointCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text, unit?], …] in typing order. */
const calc = (typed) => {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
  const order = [];
  for (const [k, t, unit] of typed) {
    fields[k] = { unit: unit ?? fields[k].unit, texts: [t] };
    order.splice(0, order.length, ...order.filter((x) => x !== k), k);
  }
  return calculateReorderPoint(fields, order);
};
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `${FIELD_KEYS.map((k) => (k === r.solved ? `[${r.display[k][0]}]` : r.display[k][0])).join(" ")}${r.warnings.length ? ` || ${r.warnings.join(" / ")}` : ""}`);

// [basic safety lead sales reorder]
// ── Live ──
eq("10 + 5 + 7 days × 20 / day", out(calc([["basicStock", "10"], ["safetyStock", "5"], ["leadTime", "7"], ["unitSales", "20"]])), "10 5 7 20 [440]");
eq("1 month + 5 + 7 days × 140 / week", out(calc([["basicStock", "1", "mos"], ["safetyStock", "5"], ["leadTime", "7"], ["unitSales", "140", "wk"]])), "1 5 7 140 [848.8]");
eq("basic stock from the reorder point", out(calc([["safetyStock", "5"], ["leadTime", "7"], ["unitSales", "20"], ["reorderPoint", "300"]])), "[3] 5 7 20 300");
eq("unit sales from the reorder point (36 h)", out(calc([["basicStock", "36", "hrs"], ["safetyStock", "2"], ["leadTime", "3"], ["reorderPoint", "1000"]])), "36 2 3 [153.85] 1000");
eq("negative solved basic stock", out(calc([["safetyStock", "5"], ["leadTime", "7"], ["unitSales", "20"], ["reorderPoint", "100"]])),
  "[-7] 5 7 20 100 || Basic stock must be greater than or equal to 0.");

eq("article: beer shop (10 + 2 + 1 days × 10 / day)", out(calc([["basicStock", "10"], ["safetyStock", "2"], ["leadTime", "1"], ["unitSales", "10"]])), "10 2 1 10 [130]");

// ── Units, recency, validation ──
eq("per year", out(calc([["basicStock", "0"], ["safetyStock", "0"], ["leadTime", "1", "yrs"], ["unitSales", "1000", "yr"]])), "0 0 1 1000 [1,000]");
eq("per 3 months", out(calc([["basicStock", "0"], ["safetyStock", "0"], ["leadTime", "91.3125"], ["unitSales", "100", "3mo"]])), "0 0 91.3125 100 [100]");
eq("lead time solved in weeks", out(calc([["basicStock", "7"], ["safetyStock", "7"], ["leadTime", "", "wk"], ["unitSales", "10"], ["reorderPoint", "280"]])), "7 7 [2] 10 280");
eq("all five typed: the oldest is recalculated", out(calc([["basicStock", "10"], ["safetyStock", "5"], ["leadTime", "7"], ["unitSales", "20"], ["reorderPoint", "500"]])),
  "[13] 5 7 20 500");
eq("zero days can't give unit sales", out(calc([["basicStock", "0"], ["safetyStock", "0"], ["leadTime", "0"], ["reorderPoint", "10"]])),
  "ERR The lead time, safety stock and basic stock add up to 0, so the unit sales can't be calculated.");
eq("negative lead time typed", out(calc([["basicStock", "1"], ["safetyStock", "1"], ["leadTime", "-1"], ["unitSales", "1"]])), "ERR Lead time must be greater than or equal to 0.");
eq("zero unit sales typed", out(calc([["basicStock", "1"], ["safetyStock", "1"], ["leadTime", "1"], ["unitSales", "0"]])), "ERR Unit sales per day must be greater than 0.");
eq("missing", out(calc([["basicStock", "1"], ["safetyStock", "1"]])), "MISSING leadTime,unitSales");
eq("missing with the reorder point typed", out(calc([["basicStock", "1"], ["reorderPoint", "50"]])), "MISSING safetyStock,leadTime,unitSales");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
