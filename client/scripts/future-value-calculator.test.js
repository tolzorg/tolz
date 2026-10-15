// Plain-Node test suite for the Future Value Calculator engine.
// Run with:
//   node scripts/future-value-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/future-value-calculator.html) via plain GET requests. A
// scratch comparator also diffed 600 random scenarios (results, pie and full
// schedule): 587 identical; the rest were a $0.00 pie slice decided by float
// noise or a 1-cent interest tie.

import { calculateFutureValue, FV_DEFAULTS } from "../src/utils/futureValueCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const fv = (o = {}) => calculateFutureValue({ ...FV_DEFAULTS, timing: "end", ...o });
const sum = (r) => `${r.futureValue} | ${r.rows.map((x) => x[1]).join(" ")}`;
const row = (r, k) => { const x = r.schedule[k - 1]; return `${x.period} ${x.startBalance} ${x.deposit} ${x.interest} ${x.balance}`; };
const pie = (r) => r.pie.map((p) => `${p.label} ${p.value.toFixed(2)}`).join(" / ");

{
  const r = fv();
  eq("default", sum(r), "$3,108.93 | $1,736.01 $1,000.00 $1,108.93");
  eq("default pie", pie(r), "Starting amount 1000.00 / Periodic deposits 1000.00 / Interest 1108.93");
  eq("default has deposits", r.hasDeposits, true);
  eq("schedule length", r.schedule.length, 10);
  eq("row 1", row(r, 1), "1 $1,000.00 $100.00 $60.00 $1,160.00");
  eq("row 10 ends at FV", r.schedule[9].balance, "$3,108.93");
}
eq("beginning", fv({ timing: "beginning" }).futureValue, "$3,188.01");
eq("beginning PV", fv({ timing: "beginning" }).rows[0][1], "$1,780.17");
{
  const r = fv({ periods: "2.5" });
  eq("2.5 end: no partial deposit (quarter quirk)", `${r.futureValue} ${r.rows[0][1]} ${r.rows[1][1]}`, "$1,368.91 $1,183.34 $200.00");
  eq("2.5 end has 3 rows", r.schedule.length, 3);
}
eq("2.1 end: partial deposit", `${fv({ periods: "2.1" }).futureValue} ${fv({ periods: "2.1" }).rows[1][1]}`, "$1,347.11 $209.74");
eq("2.5 beginning", `${fv({ periods: "2.5", timing: "beginning" }).futureValue} ${fv({ periods: "2.5", timing: "beginning" }).rows[0][1]} ${fv({ periods: "2.5", timing: "beginning" }).rows[1][1]}`,
  "$1,433.86 $1,239.49 $250.73");
{
  const r = fv({ deposit: "0" });
  eq("no deposit: interest row only", sum(r), "$1,790.85 | $790.85");
  eq("no deposit: no Deposit column", r.hasDeposits, false);
  eq("no deposit pie", pie(r), "Starting amount 1000.00 / Interest 790.85");
}
eq("no deposit, fractional N keeps $0 slice", fv({ deposit: "0", periods: "2.1" }).pie.length, 3);
{
  const r = fv({ start: "-1000", deposit: "-100" });
  eq("negatives", r.futureValue, "$-3,108.93");
  eq("negatives: no pie", r.pie, null);
}
{
  const r = fv({ start: "0" });
  eq("start 0 pie", r.pie.map((p) => p.label).join(" / "), "Periodic deposits / Interest");
  const total = r.pie.reduce((s, p) => s + p.value, 0);
  eq("start 0 shares", r.pie.map((p) => Math.round((p.value / total) * 100)).join("/"), "76/24");
}
eq("nothing invested: no pie", fv({ start: "0", deposit: "0" }).pie, null);
eq("0% rate", sum(fv({ rate: "0" })), "$2,000.00 | $2,000.00 $1,000.00 $0.00");
eq("one period", fv({ periods: "1" }).futureValue, "$1,160.00");
eq("$10 at 6% for 1 period", fv({ periods: "1", start: "10", deposit: "0" }).futureValue, "$10.60");

eq("errors in order", fv({ periods: "x", start: "x", rate: "x", deposit: "x" }).errors.join(" | "),
  "Please provide a positive Number of Periods (N) value. | Starting amount needs to be numeric. | I/Y needs to be numeric. | PMT needs to be numeric.");
eq("zero periods", fv({ periods: "0" }).errors.join(), "Please provide a positive Number of Periods (N) value.");
eq("negative periods", fv({ periods: "-3" }).errors.join(), "Please provide a positive Number of Periods (N) value.");
eq("N over 10,000", fv({ periods: "10000.5" }).errors.join(), "This calculator is capable of handling N up to 10,000.");
eq("N up to 10,000 accepted", fv({ periods: "10000", rate: "0" }).futureValue, "$1,001,000.00");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
