// Plain-Node test suite for the Personal Loan Calculator engine.
// Run with:
//   node scripts/personal-loan-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/personal-loan-calculator.html) via plain GET requests. A
// scratch comparator also diffed 7 hand-picked cases and 400+ random
// scenarios: every result row, pie slice, annual and monthly schedule row,
// payoff date and error matched. The one exception is the APR: the
// reference's own APR solver is approximate (third-decimal differences,
// median 0.001 point) and hides the row for some short, high-fee loans; this
// engine solves it exactly.

import { calculatePersonalLoan } from "../src/utils/personalLoanCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { loanAmount: "20000", interestRate: "10", years: "5", months: "0", startMonth: 10, startYear: "2026", includeFees: false, feeAmount: "5", feeType: "percentage", feePaid: "deduct", insurance: "0" };
const run = (o = {}) => calculatePersonalLoan({ ...BASE, ...o });
const rows = (r) => r.rows.map((x) => `${x.label}: ${x.value}`).join(" / ");
const pie = (r) => r.pie.map((s) => `${s.label} ${s.value.toFixed(2)} ${s.percent}% ${s.color}`).join(", ");
const money = (v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const annual = (r) => r.schedule.annual.map((a) => `${a.year} ${a.date} ${money(Math.round(a.interest * 100) / 100)} ${money(Math.round(a.principal * 100) / 100)} ${money(Math.abs(Math.round(a.balance * 100) / 100))}`);

// ── Screenshot 1: no fees ──
{
  const r = run();
  eq("payment", r.payment, "$424.94");
  eq("rows", rows(r), "Total of 60 loan payments: $25,496.45 / Total interest: $5,496.45 / Payoff date: Oct. 2031");
  eq("pie", pie(r), "Loan amount 20000.00 78% #2b7ddb, Interest 5496.45 22% #8bbc21");
  eq("annual schedule", annual(r).join(" | "), "1 10/26-9/27 $1,853.93 $3,245.36 $16,754.64 | 2 10/27-9/28 $1,514.10 $3,585.19 $13,169.44 | 3 10/28-9/29 $1,138.68 $3,960.61 $9,208.83 | 4 10/29-9/30 $723.95 $4,375.34 $4,833.49 | 5 10/30-9/31 $265.80 $4,833.49 $0.00");
  eq("first month", `${r.schedule.monthly[0].dateText} ${money(Math.round(r.schedule.monthly[0].interest * 100) / 100)}`, "10/2026 $166.67");
}

// ── Screenshot 2: 5% fee deducted ──
{
  const r = run({ includeFees: true });
  eq("fee rows", rows(r), "Cash received: $19,000.00 / Total of 60 loan payments: $25,496.45 / Total interest: $5,496.45 / Origination fee: $1,000.00 / Cost of loan: $6,496.45 / APR: 12.239% / Payoff date: Oct. 2031");
  eq("fee pie", pie(r), "Cash received 19000.00 75% #2b7ddb, Origination fee 1000.00 4% #8bbc21, Interest 5496.45 22% #910000");
}

// ── Fee and insurance variants ──
eq("upfront: no cash received", rows(run({ includeFees: true, feePaid: "upfront" })).split(" / ")[0], "Total of 60 loan payments: $25,496.45");
eq("upfront pie", pie(run({ includeFees: true, feePaid: "upfront" })).split(", ")[0], "Loan amount 20000.00 75% #2b7ddb");
eq("$ fee: no origination fee row", rows(run({ includeFees: true, feeType: "amount", feeAmount: "500" })), "Cash received: $19,500.00 / Total of 60 loan payments: $25,496.45 / Total interest: $5,496.45 / Cost of loan: $5,996.45 / APR: 11.099% / Payoff date: Oct. 2031"); // reference shows 11.098% (its approximate APR solver)
eq("insurance rows", rows(run({ includeFees: true, insurance: "20", feeAmount: "0" })).split(" / ").slice(0, 5).join(" / "), "Cash received: $20,000.00 / Monthly pay + insurance: $444.94 / Total of 60 loan payments: $25,496.45 / Total interest: $5,496.45 / Total insurance: $1,200.00");
eq("insurance pie colours by position", pie(run({ includeFees: true, insurance: "20" })), "Cash received 19000.00 71% #2b7ddb, Origination fee 1000.00 4% #8bbc21, Insurance 1200.00 4% #910000, Interest 5496.45 21% #1aadce");
eq("zero fee and insurance = plain", rows(run({ includeFees: true, feeAmount: "0" })), rows(run()));
eq("no APR at 0%", rows(run({ includeFees: true, interestRate: "0" })), "Cash received: $19,000.00 / Total of 60 loan payments: $20,000.00 / Total interest: $0.00 / Origination fee: $1,000.00 / Cost of loan: $1,000.00 / Payoff date: Oct. 2031");
eq("chart insurance uses whole months", run({ includeFees: true, interestRate: "0", years: "1", months: "0.5", feeAmount: "1", insurance: "15" }).pie[2].value, 195);
eq("rows insurance uses n", rows(run({ includeFees: true, interestRate: "0", years: "1", months: "0.5", feeAmount: "1", insurance: "15" })).split(" / ")[4], "Total insurance: $187.50");

// ── Terms and dates ──
eq("May payoff format", rows(run({ startMonth: 5 })).split(" / ")[2], "Payoff date: May. 2031");
eq("7 months: no schedule", run({ years: "0", months: "7" }).schedule, null);
eq("12 months: no schedule", run({ years: "1" }).schedule, null);
eq("partial final year ends at payoff", annual(run({ years: "1", months: "7" })).join(" | "), "1 10/26-9/27 $1,448.08 $12,262.33 $7,737.67 | 2 10/27-5/28 $260.06 $7,737.67 $0.00");
eq("january start", annual(run({ years: "2", months: "6", startMonth: 1 }))[2], "3 1/28-7/28 $129.45 $4,407.92 $0.00");
eq("fractional term", rows(run({ years: "1.55" })), "Total of 18.60 loan payments: $21,673.08 / Total interest: $1,673.08 / Payoff date: May. 2028");
{
  const m = run({ years: "1.55" }).schedule.monthly;
  const last = m[m.length - 1];
  eq("fractional final payment", `${last.index} ${last.dateText} ${money(Math.round(last.interest * 100) / 100)} ${money(Math.round(last.principal * 100) / 100)}`, "19 4/2028 $4.63 $694.50");
}
eq("thousands in the count", rows(run({ years: "100" })).split(" / ")[0], "Total of 1,200 loan payments: $200,009.46");
eq("schedule limit 719.9", Boolean(run({ years: "0", months: "719.9" }).schedule), true);
eq("schedule limit 720", run({ years: "60" }).schedule, null);
eq("two-digit dates", annual(run({ startYear: "1999" }))[0], "1 10/99-9/0 $1,853.93 $3,245.36 $16,754.64");
eq("0% rate", run({ interestRate: "0" }).payment, "$333.33");

// ── Validation ──
eq("three errors", run({ loanAmount: "x", interestRate: "x", years: "x" }).errors.join(" | "), "Please provide a positive loan amount. | Please provide a positive interest rate value. | Please provide a positive loan term year value.");
eq("zero amount", run({ loanAmount: "0" }).errors.join(), "Please provide a positive loan amount.");
eq("zero term", run({ years: "0", months: "0" }).errors.join(), "Please provide a positive loan term value.");
eq("start year", run({ startYear: "x" }).errors.join(), "Please provide a positive start date value.");
eq("fee", run({ includeFees: true, feeAmount: "-1" }).errors.join(), "Please provide a positive origination fee amount.");
eq("insurance", run({ includeFees: true, insurance: "x" }).errors.join(), "Please provide a personal loan insurance amount.");
eq("fee 100%", run({ includeFees: true, feeAmount: "100" }).errors.join(), "Origination fee percentage cannot be more than 100%.");
eq("fee = loan", run({ includeFees: true, feeType: "amount", feeAmount: "20000" }).errors.join(), "Origination fee cannot be more than loan amount.");
eq("fee ignored when unchecked", run({ includeFees: false, feeAmount: "x" }).errors, undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
