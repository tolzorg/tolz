// Plain-Node test suite for the Present Value Calculator engine.
// Run with:
//   node scripts/present-value-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/present-value-calculator.html) via plain GET requests. A
// scratch comparator also diffed 300 random scenarios (results, pie and full
// schedule): 300 identical.

import {
  calculatePresentValueOfFutureMoney, calculatePresentValueOfDeposits, FUTURE_DEFAULTS, DEPOSIT_DEFAULTS,
} from "../src/utils/presentValueCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const fm = (o = {}) => calculatePresentValueOfFutureMoney({ ...FUTURE_DEFAULTS, ...o });
const dep = (o = {}) => calculatePresentValueOfDeposits({ ...DEPOSIT_DEFAULTS, timing: "end", ...o });
const sum = (r) => `${r.presentValue} | ${r.rows.map((x) => x[1]).join(" ")}`;
const row = (r, k) => { const x = r.schedule[k - 1]; return `${x.period} ${x.deposits} ${x.interest} ${x.balance}`; };

// ── Future money ──
eq("default", `${fm().presentValue} ${fm().totalInterest}`, "$558.39 $441.61");
eq("2.5 periods", fm({ periods: "2.5" }).presentValue, "$864.44");
eq("0% rate", fm({ rate: "0" }).presentValue, "$1,000.00");
eq("negatives allowed", `${fm({ futureValue: "-1000", periods: "-1", rate: "-5" }).presentValue} ${fm({ futureValue: "-1000", periods: "-1", rate: "-5" }).totalInterest}`, "$-950.00 $-50.00");
eq("future errors", fm({ futureValue: "x", periods: "x", rate: "x" }).errors.join(" | "),
  "Please provide a positive future value. | Please provide a positive number of periods value. | Please provide a positive interest rate value.");

// ── Periodical deposits ──
{
  const r = dep();
  eq("deposits default", sum(r), "$736.01 | $1,318.08 $1,000.00 $318.08");
  eq("row 1", row(r, 1), "1 $100.00 $0.00 $100.00");
  eq("row 3 (period interest)", row(r, 3), "3 $300.00 $12.36 $318.36");
  eq("row 10", row(r, 10), "10 $1,000.00 $68.95 $1,318.08");
  eq("pie", r.pie.map((p) => `${p.label} ${p.value.toFixed(2)}`).join(" / "), "Principal 1000.00 / Interest 318.08");
}
{
  const r = dep({ timing: "beginning" });
  eq("beginning", sum(r), "$780.17 | $1,397.16 $1,000.00 $397.16");
  eq("beginning row 2", row(r, 2), "2 $200.00 $12.36 $218.36");
}
eq("0% rate", sum(dep({ rate: "0" })), "$1,000.00 | $1,000.00 $1,000.00 $0.00");
eq("one period", sum(dep({ periods: "1" })), "$94.34 | $100.00 $100.00 $0.00");
{
  const r = dep({ periods: "2.5" });
  eq("2.5 end: no partial deposit (quarter quirk)", sum(r), "$183.34 | $212.09 $200.00 $12.09");
  eq("2.5 end partial row", row(r, 3), "3 $200.00 $6.09 $212.09");
}
eq("2.1 end: partial deposit", sum(dep({ periods: "2.1" })).split(" | ")[0], "$191.96");
eq("2.1 principal", dep({ periods: "2.1" }).rows[1][1], "$209.74");
eq("2.125 end: partial deposit", dep({ periods: "2.125" }).rows[1][1], "$212.18");
eq("2.75 end: no partial", dep({ periods: "2.75" }).rows[1][1], "$200.00");
{
  const r = dep({ periods: "2.5", timing: "beginning" });
  eq("2.5 beginning", sum(r), "$239.49 | $277.04 $250.73 $26.32");
  eq("2.5 beginning partial row", row(r, 3), "3 $250.73 $7.96 $277.04");
}
eq("0.5 beginning", sum(dep({ periods: "0.5", timing: "beginning" })), "$50.73 | $52.23 $50.73 $1.50");
eq("0.5 end", sum(dep({ periods: "0.5" })), "$0.00 | $0.00 $0.00 $0.00");
eq("0% fractional end", dep({ periods: "14.15", rate: "0", deposit: "15295" }).rows[1][1], "$216,424.25");
{
  const r = dep({ rate: "-5", deposit: "-100" });
  eq("negative deposits", sum(r), "$-1,340.37 | $-802.53 $-1,000.00 $197.47");
  eq("no pie for negative principal", r.pie, null);
}
eq("negative interest still has a pie", dep({ periods: "56", rate: "-3.1", deposit: "15034" }).pie !== null, true);
eq("deposit errors", dep({ periods: "x", rate: "x", deposit: "x" }).errors.join(" | "), "Please provide a positive N value. | I/Y needs to be numeric. | PMT needs to be numeric.");
eq("zero periods", dep({ periods: "0" }).errors.join(), "Please provide a positive N value.");
eq("N up to 10,000", dep({ periods: "10000" }).presentValue, "$1,666.67");
eq("N over 10,000", dep({ periods: "3425235", rate: "2", deposit: "24" }).errors.join(), "This calculator is capable of handling N up to 10,000.");
eq("N limit keeps other errors", dep({ periods: "10000.5", rate: "x", deposit: "x" }).errors.join(" | "), "This calculator is capable of handling N up to 10,000. | I/Y needs to be numeric. | PMT needs to be numeric.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
