// Plain-Node test suite for the Refinance Calculator engine.
// Run with:
//   node scripts/refinance-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/refinance-calculator.html) via plain GET requests. A
// scratch comparator also diffed 18 hand-picked cases and 360 random
// scenarios across both current-loan modes: every line, colour, table row and
// error matched, except a few APRs in the third decimal (the reference's
// approximate solver) and one break-even when the old loan ends before the
// interest saved covers the upfront cost.

import { calculateRefinance, REFINANCE_DEFAULTS } from "../src/utils/refinanceCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (o = {}) => calculateRefinance({ ...REFINANCE_DEFAULTS, knowBalance: true, ...o });
const bullets = (r) => r.bullets.map((b) => `${b.label || ""}${b.value}${b.text || ""}`).join(" / ");
const row = (r, label) => r.rows.find((x) => x[0] === label)?.slice(1).join(" | ");

// ── Screenshot ──
{
  const r = run();
  eq("verdict", r.verdict.text, "The APR for the new loan is 6.329%, which is 0.671% lower than the 7% interest rate of the current loan. Refinancing would be financially less expensive.");
  eq("new payment", r.newPayment, "$1,791.08");
  eq("bullets", bullets(r), "$8.92/month savings in monthly pay / 45 months faster the loan will be paid off / $76,641.36 lifetime savings for the new loan / $6,500.00 upfront cost / Break even point: 30 months");
  eq("principal", row(r, "Principal/loan amount"), "$250,000.00 | $250,000.00 | $0.00");
  eq("monthly pay", row(r, "Monthly pay"), "$1,800.00 | $1,791.08 | $-8.92");
  eq("length", row(r, "Length"), "285 months | 240 months | -45 months");
  eq("rate", row(r, "Interest rate/APR"), "7% | 6.329% | -0.671%");
  eq("totals", row(r, "Total monthly payments"), "$513,000.00 | $429,858.64 | $-83,141.36");
  eq("interest", row(r, "Total interest"), "$263,000.00 | $179,858.64 | $-83,141.36");
  eq("cost", row(r, "Cost + points (upfront)"), "$0 | $6,500.00 | ");
  eq("recover", row(r, "Time to recover cost/point"), "NA | 30 months | ");
}

// ── Original-amount mode ──
{
  const r = run({ knowBalance: false });
  eq("original mode balance", row(r, "Principal/loan amount"), "$257,437.15 | $257,437.15 | $0.00");
  eq("original mode payment", row(r, "Monthly pay"), "$1,995.91 | $1,844.36 | $-151.55");
  eq("no length bullet when equal", bullets(r), "$151.55/month savings in monthly pay / $29,722.73 lifetime savings for the new loan / $6,648.74 upfront cost / Break even point: 32 months");
  eq("remaining years and months", row(run({ knowBalance: false, remainingMonths: "6" }), "Length"), "246 months | 240 months | -6 months");
}

// ── Branches ──
eq("no costs", bullets(run({ points: "0", costs: "0" })), "$8.92/month savings in monthly pay / 45 months faster the loan will be paid off / $83,141.36 lifetime savings for the new loan");
eq("no costs recover row", row(run({ points: "0", costs: "0" }), "Time to recover cost/point"), "NA | 1 months | ");
eq("higher rate", run({ newRate: "8" }).verdict.text.endsWith("which is 1.357% higher than the 7% interest rate of the current loan. Refinancing would be financially more expensive."), true);
eq("higher rate: no break-even", row(run({ newRate: "8" }), "Time to recover cost/point"), undefined);
eq("longer term", bullets(run({ newTerm: "30" })), "$301.12/month savings in monthly pay / 75 months slower the loan will be paid off / $33,095.47 total extra cost for the new loan / $6,500.00 upfront cost / Break even point: 34 months");
eq("similar at 0.1 point", run({ newRate: "6.9", points: "0", costs: "0" }).verdict.text, "The APR for the new loan is 6.900%, which is similar to the 7% interest rate of the current loan. The financial cost of the new loan is comparable to that of the existing loan.");
eq("not similar past 0.1", run({ newRate: "6.899", points: "0", costs: "0" }).verdict.tone, "good");
{
  const r = run({ cashOut: "20000" });
  eq("cash out bullets", bullets(r), "$134.36/month extra cost in monthly pay / 45 months faster the loan will be paid off / $61,852.67 lifetime savings for the new loan / $6,900.00 upfront cost");
  eq("cash out row", row(r, "Cash out"), "$0 | $20,000.00 | ");
  eq("take home row", row(r, "Take home amount after cost/point"), "$0 | $13,100.00 | ");
  eq("cash out: no recover row", row(r, "Time to recover cost/point"), undefined);
}
eq("0% new rate: no APR", run({ newRate: "0" }).verdict, null);
eq("0% new rate row", row(run({ newRate: "0" }), "Interest rate"), "7% | 0% | -7%");
eq("points 100: no APR", run({ points: "100" }).verdict, null);
eq("0% current rate", row(run({ rate: "0" }), "Length"), "138 months | 240 months | 102 months");
eq("short payment months", row(run({ payment: "1460" }), "Length"), "1164 months | 240 months | -924 months");

// ── Validation ──
eq("insufficient payment", run({ payment: "1458.33" }).errors.join(), "The monthly payment amount is not sufficient to repay the loan. Please double check.");
eq("insufficient before rate", run({ rate: "201" }).errors.join(" | "), "The monthly payment amount is not sufficient to repay the loan. Please double check. | Please provide a positive interest rate that is 200% or less.");
eq("new rate 200 trips the points check", run({ newRate: "200" }).errors.join(), "Please provide a point from 0 to 100.");
eq("new rate 201", run({ newRate: "201" }).errors.join(" | "), "Please provide a positive new interest rate that is 200% or less. | Please provide a point from 0 to 100.");
eq("points over 100 allowed", run({ points: "101" }).errors, undefined);
eq("zero new term", run({ newTerm: "0" }).errors.join(), "Please provide a longer new loan term value.");
eq("three errors", run({ balance: "x", newTerm: "x", costs: "x" }).errors.join(" | "), "Please provide a positive remaining balance of the current loan. | Please provide a positive new loan term value. | Please provide a positive cost value.");
eq("cash out numeric", run({ cashOut: "x" }).errors.join(), "Please provide a numeric cash out amount.");
eq("remaining longer than term", run({ knowBalance: false, remainingYears: "35" }).errors.join(), "Remaining year and month cannot be bigger than loan term.");
eq("term over 50", run({ knowBalance: false, originalTerm: "51" }).errors.join(), "Please provide a positive loan term that is 50 years or less.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
