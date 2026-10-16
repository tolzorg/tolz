// Plain-Node test suite for the Percent Off Calculator engine.
// Run with:
//   node scripts/percent-off-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/percent-off-calculator.html) via plain GET requests. A
// scratch comparator also diffed 500 random scenarios (both modes, all six
// pairs, invalid input): 500 identical.

import { calculatePercentOff, PERCENT_OFF_DEFAULTS } from "../src/utils/percentOffCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const po = (o = {}) => calculatePercentOff({ ...PERCENT_OFF_DEFAULTS, stack: false, ...o });
const show = (r) => (r.errors ? r.errors.join(" | ") : `${r.intro} ${r.rows.map((x) => `${x.label}: ${x.value}`).join(" | ")}`);

// ── Single discount, all six pairs ──
eq("default", show(po()), "With original price $39.99 and 15% off, Final price: $33.99 | Saved amount: $6.00");
eq("percent + final", show(po({ original: "", final: "33.99" })), "With 15% off and final price $33.99, Original price: $39.99 | Saved amount: $6.00");
eq("final + saved", show(po({ original: "", percent: "", final: "33.99", saved: "6" })), "With final price $33.99 and saved amount of $6, Original price: $39.99 | Percent off: 15%");
eq("original + final", show(po({ percent: "", final: "33.99" })), "With original price $39.99 and final price $33.99, Percent off: 15% | Saved amount: $6.00");
eq("original + saved (capital P)", show(po({ percent: "", saved: "6" })), "With original price $39.99 and saved amount of $6, Percent off: 15% | Final Price: $33.99");
eq("percent + saved", show(po({ original: "", saved: "6" })), "With 15% off and saved amount of $6, Original price: $40.00 | Final price: $34.00");
eq("first pair wins", show(po({ final: "1", saved: "2" })), "With original price $39.99 and 15% off, Final price: $33.99 | Saved amount: $6.00");
eq("original+final beats original+saved", po({ percent: "", final: "30", saved: "5" }).intro, "With original price $39.99 and final price $30,");
eq("over 100% off", show(po({ percent: "150" })), "With original price $39.99 and 150% off, Final price: $-20.00 | Saved amount: $59.99");
eq("negative percent off", po({ original: "10", percent: "", final: "20" }).rows[0].value, "-100%");
eq("one decimal", po({ original: "3", percent: "", final: "2" }).rows[0].value, "33.3%");
eq("small percent keeps a digit", po({ original: "30000", percent: "", saved: "1" }).rows[0].value, "0.003%");
eq("tiny percent is 0", po({ original: "3000000", percent: "", saved: "1" }).rows[0].value, "0%");
eq("echo strips commas", po({ original: "1,000.5", percent: "12.345" }).intro, "With original price $1000.5 and 12.345% off,");
eq("100% off with saved", show(po({ original: "", percent: "100", saved: "5" })), "With 100% off and saved amount of $5, Original price: $5.00 | Final price: $0.00");
eq("100% off with final", show(po({ original: "", percent: "100", final: "5" })), "Can not calculate with 100% off.");

// ── Stackable additional discount ──
const st = (o = {}) => po({ stack: true, ...o });
eq("stack default", show(st()), "Given an original price of $39.99, and a discount of 15% off, with an additional 10% off, Final price: $30.59 | Saved amount: $9.40 | Total percent off: 23.5%");
eq("stack percent + final", show(st({ original: "", final: "30.59" })), "Given an discount of 15% off, a final price of $30.59, and an additional 10% off, Original price: $39.99 | Saved amount: $9.40 | Total percent off: 23.5%");
eq("stack final + saved", show(st({ original: "", percent: "", final: "30.59", saved: "9.4" })), "Given a final price of $30.59, a saved amount of $9.4, and an additional 10% off, Original price: $39.99 | 1st percent off: 15% | Total percent off: 23.5%");
eq("stack original + final", show(st({ percent: "", final: "30.59" })), "Given an original price of $39.99, a final price of $30.59, and an additional 10% off, Saved amount: $9.40 | Total percent off: 23.5% | 1st percent off: 15%");
eq("stack original + saved", show(st({ percent: "", saved: "9.4" })), "Given an original price of $39.99, a saved amount of $9.4, and an additional 10% off, Final Price: $30.59 | Total percent off: 23.5% | 1st percent off: 15%");
eq("stack percent + saved", show(st({ original: "", saved: "9.4" })), "Given an discount of 15% off, a saved amount of $9.4, and an additional 10% off, Original price: $40.00 | Final price: $30.60 | Total percent off: 23.5%");
eq("1st row is flagged", st({ percent: "", final: "30.59" }).rows[2].first, true);
eq("stack negative first", st({ original: "10", percent: "", final: "20" }).rows.map((r) => r.value).join(" "), "$-10.00 -100% -122.2%");
eq("stack 99.5%", show(st({ extra: "99.5" })), "Given an original price of $39.99, and a discount of 15% off, with an additional 99.5% off, Final price: $0.17 | Saved amount: $39.82 | Total percent off: 99.6%");
eq("stack decimals", show(st({ original: "1234.56", percent: "12.345", extra: "7.77" })), "Given an original price of $1234.56, and a discount of 12.345% off, with an additional 7.77% off, Final price: $998.07 | Saved amount: $236.49 | Total percent off: 19.2%");

// ── Validation ──
eq("all errors", show(po({ original: "abc", percent: "x", final: "y", saved: "z" })),
  "Please provide a positive original price value. | Please provide a positive percent off value. | Please provide a positive final price value. | Please provide a positive saved amount.");
eq("zero is invalid", show(po({ percent: "0" })), "Please provide a positive percent off value.");
eq("$ sign is invalid text", show(po({ original: "$1000" })), "Please provide a positive original price value.");
eq("fewer than two", show(po({ original: "", percent: "" })), "Please provide 2 values to calculate.");
for (const bad of ["abc", "", "0", "-5", "100", "150"]) {
  eq(`extra "${bad}"`, show(st({ extra: bad })), "Please provide a positive additional discount percentage between 0 and 100%.");
}
eq("extra ignored when No", show(po({ extra: "abc" })), "With original price $39.99 and 15% off, Final price: $33.99 | Saved amount: $6.00");
eq("field then extra errors", show(st({ original: "abc", extra: "x" })), "Please provide a positive original price value. | Please provide a positive additional discount percentage between 0 and 100%.");
eq("extra error beats too-few", show(st({ original: "", percent: "", extra: "x" })), "Please provide a positive additional discount percentage between 0 and 100%.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
