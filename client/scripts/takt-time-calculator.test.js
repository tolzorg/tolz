// Plain-Node test suite for the Takt Time Calculator engine.
// Run with:
//   node scripts/takt-time-calculator.test.js
//
// Expected values come from the reference's own screenshots and the LIVE reference
// (omnicalculator.com/other/takt-time), read back from the boxes.

import { calculateTaktTime, FIELDS, MODE_FIELDS } from "../src/utils/taktTimeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text | [texts], unit?], …] in typing order. */
const calc = (mode, typed) => {
  const fields = Object.fromEntries(Object.keys(FIELDS).map((k) => [k, { unit: FIELDS[k].unit, texts: FIELDS[k].units.find((x) => x.value === FIELDS[k].unit)?.parts ? ["", ""] : [""] }]));
  const order = [];
  for (const [k, t, unit] of typed) {
    fields[k] = { unit: unit ?? fields[k].unit, texts: Array.isArray(t) ? t : [t] };
    order.splice(0, order.length, ...order.filter((x) => x !== k), k);
  }
  return calculateTaktTime(mode, fields, order);
};
const out = (mode, r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : MODE_FIELDS[mode].map((k) => { const t = r.display[k].join("+"); return r.solved.includes(k) ? `[${t}]` : t; }).join(" ") + (r.warnings.length ? ` || ${r.warnings.join(" / ")}` : ""));
const run = (mode, typed) => out(mode, calc(mode, typed));

// ── Reference screenshots ──
eq("simple: 3 h / 4 units → 45 min", run("simple", [["netTime", "3"], ["demand", "4"]]), "3 4 [45]");
eq("batch: 3 per batch, 4 h, 2 units → 360 min", run("batch", [["itemsPerBatch", "3"], ["netTime", "4"], ["demand", "2"]]), "3 4 2 [360]");
eq("weekly: 3 days × (2 h − 3 − 4 min), 3 units", run("weekly", [["daysPerWeek", "3"], ["hoursPerDay", "2"], ["lunch", "3"], ["otherBreaks", "4"], ["weeklyDemand", "3"]]),
  "3 2 3 4 [5+39] 3 [113]");

// ── Article examples ──
eq("donuts: 3 h / 500 → 21.6 s", run("simple", [["netTime", "3"], ["demand", "500"], ["taktTime", "", "sec"]]), "3 500 [21.6]");
eq("cookies: 24 per batch, 4 h, 600 → 9.6 min", run("batch", [["itemsPerBatch", "24"], ["netTime", "4"], ["demand", "600"]]), "24 4 600 [9.6]");
eq("cookies: takt 12 min → 5 h", run("batch", [["itemsPerBatch", "24"], ["demand", "600"], ["taktTime", "12"]]), "24 [5] 600 12");
eq("masks: 5 days × (8 h − 30 − 20 min), 100 a week", run("weekly", [["daysPerWeek", "5"], ["hoursPerDay", "8"], ["lunch", "30"], ["otherBreaks", "20"], ["weeklyDemand", "100"]]),
  "5 8 30 20 [35+50] 100 [21.5]");

// ── Solving other boxes ──
eq("simple: demand from takt", run("simple", [["netTime", "3"], ["taktTime", "45"]]), "3 [4] 45");
eq("simple: time from takt", run("simple", [["demand", "4"], ["taktTime", "45"]]), "[3] 4 45");
eq("batch: items per batch from takt", run("batch", [["netTime", "4"], ["demand", "2"], ["taktTime", "360"]]), "[3] 4 2 360");
eq("weekly: demand from takt", run("weekly", [["daysPerWeek", "5"], ["hoursPerDay", "8"], ["lunch", "30"], ["otherBreaks", "30"], ["taktTime", "10"]]),
  "5 8 30 30 [35+0] [210] 10");
eq("weekly: other breaks from net time", run("weekly", [["daysPerWeek", "5"], ["hoursPerDay", "8"], ["lunch", "30"], ["weeklyNetTime", ["35", "0"]], ["weeklyDemand", "210"]]),
  "5 8 30 [30] 35+0 210 [10]");
eq("weekly: typed net time skips the breaks", run("weekly", [["weeklyNetTime", ["40", "0"]], ["weeklyDemand", "240"]]), "    40+0 240 [10]");

// ── Units, recency, edge cases ──
eq("simple in minutes, takt in seconds", run("simple", [["netTime", "90", "min"], ["demand", "45"], ["taktTime", "", "sec"]]), "90 45 [120]");
eq("takt in min / sec", run("simple", [["netTime", "1"], ["demand", "7"], ["taktTime", ["", ""], "minsec"]]), "1 7 [8+34.286]");
eq("all three typed: the oldest is recalculated", run("simple", [["netTime", "3"], ["demand", "4"], ["taktTime", "30"]]), "[2] 4 30");
eq("breaks longer than the day", run("weekly", [["daysPerWeek", "1"], ["hoursPerDay", "1"], ["lunch", "50"], ["otherBreaks", "20"], ["weeklyDemand", "1"]]),
  "1 1 50 20 [-0+10] 1 [-10] || The breaks are longer than the working hours per day, so the net production time is negative.");
eq("zero demand: no takt time", run("simple", [["netTime", "3"], ["demand", "0"]]), "MISSING taktTime");
eq("missing", run("batch", [["netTime", "4"]]), "MISSING itemsPerBatch,demand");
eq("not a number", run("simple", [["netTime", "x"], ["demand", "4"]]), "ERR Please enter a number for available production time.");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
