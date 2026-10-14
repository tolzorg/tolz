// Plain-Node test suite for the Boat Loan Calculator engine.
// Run with:
//   node scripts/boat-loan-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/boat-loan-calculator.html) via plain GET requests. A
// scratch comparator also diffed 8 hand-picked cases and 360 random
// scenarios across both tabs: every result row, pie slice, annual and
// monthly schedule row and error matched, except two monthly-interest cells
// that fall exactly on a half cent, which the reference rounds down.

import { calculateBoatLoan, convertDownPayment } from "../src/utils/boatLoanCalculatorEngine.js";
import { formatMoney } from "../src/utils/marginCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { mode: "price", price: "35000", monthlyPay: "350", term: "10", termUnit: "years", interestRate: "7", downPayment: "7000", downUnit: "dollar", tradeIn: "0", salesTax: "7", fees: "2000", financeFees: false };
const run = (o = {}) => calculateBoatLoan({ ...BASE, ...o });
const view = (r) => [`${r.header.label}: ${r.header.value}`, ...r.rows.map((x) => `${x.label}: ${x.value}`)].join(" / ");
const annual = (r) => r.schedule.annual.map((a) => `${a.year} ${formatMoney(a.interest)} ${formatMoney(a.principal)} ${formatMoney(a.balance)}`);

// ── The four screenshots ──
eq("total price", view(run()), "Monthly Pay: $325.10 / Total Loan Amount: $28,000.00 / Sale Tax: $2,450.00 / Upfront Payment: $11,450.00 / Total of 120 Loan Payments: $39,012.45 / Total Loan Interest: $11,012.45 / Total Cost (price, interest, tax, fees): $50,462.45");
eq("total price schedule", `${annual(run())[0]} | ${annual(run())[9]}`, "1 $1,896.49 $2,004.75 $25,995.25 | 10 $143.98 $3,757.26 $0.00");
eq("pie", run().pie.map((p) => `${p.label} ${p.percent}%`).join(", "), "Principal 72%, Interest 28%");
eq("fees in loan", view(run({ financeFees: true })), "Monthly Pay: $376.77 / Total Loan Amount: $32,450.00 / Sale Tax: $2,450.00 / Upfront Payment: $7,000.00 / Total of 120 Loan Payments: $45,212.64 / Total Loan Interest: $12,762.64 / Total Cost (price, interest, tax, fees): $52,212.64");
eq("fees in loan schedule", annual(run({ financeFees: true }))[0], "1 $2,197.90 $2,323.37 $30,126.63");
eq("monthly payment tab", view(run({ mode: "payment" })), "Boat Price: $37,144.22 / Total Loan Amount: $30,144.22 / Sale Tax: $2,600.10 / Upfront Payment: $11,600.10 / Total of 120 Loan Payments: $42,000.00 / Total Loan Interest: $11,855.78 / Total Cost (price, interest, tax, fees): $53,600.10");
eq("monthly payment tab, fees in loan", view(run({ mode: "payment", financeFees: true })), "Boat Price: $32,845.07 / Total Loan Amount: $30,144.22 / Sale Tax: $2,299.15 / Upfront Payment: $7,000.00 / Total of 120 Loan Payments: $42,000.00 / Total Loan Interest: $11,855.78 / Total Cost (price, interest, tax, fees): $49,000.00");
eq("monthly payment tab schedule", annual(run({ mode: "payment" }))[0], "1 $2,041.72 $2,158.28 $27,985.95");

// ── Trade-in, % down, terms ──
{
  const r = run({ tradeIn: "5000" });
  eq("trade-in keeps the full tax", r.rows[1].label + " " + r.rows[1].value, "Sale Tax* $2,450.00");
  eq("trade-in loan", r.header.value, "$267.05");
  eq("trade-in note", r.note.startsWith("* The calculation assumes the full sales tax on the boat."), true);
}
eq("reverse with trade-in", run({ mode: "payment", tradeIn: "5000", financeFees: true }).header.value, "$37,517.97");
eq("% down", run({ downUnit: "percent", downPayment: "20" }).header.value, "$325.10");
eq("reverse % down", view(run({ mode: "payment", downUnit: "percent", downPayment: "20", financeFees: true })).split(" / ").slice(0, 4).join(" / "), "Boat Price: $32,349.68 / Total Loan Amount: $30,144.22 / Sale Tax: $2,264.48 / Upfront Payment: $6,469.94");
eq("months", run({ term: "30", termUnit: "months" }).rows[3].label, "Total of 30 Loan Payments");
eq("fractional term count", run({ term: "2.55" }).rows[3].label, "Total of 30.6 Loan Payments");
eq("fractional last payment", formatMoney(run({ term: "2.55" }).schedule.monthly[30].interest), "$2.79");
eq("no tax row at 0%", run({ salesTax: "0" }).rows.map((x) => x.label).join("|"), "Total Loan Amount|Upfront Payment|Total of 120 Loan Payments|Total Loan Interest|Total Cost (price, interest, tax, fees)");
eq("0% interest", run({ interestRate: "0" }).header.value, "$233.33");
eq("trade-in above price goes negative", run({ tradeIn: "40000" }).header.value, "$-139.33");
eq("schedule from 10.01 months", Boolean(run({ term: "10.01", termUnit: "months" }).schedule), true);
eq("no schedule at 10 months", run({ term: "10", termUnit: "months" }).schedule, null);
eq("no schedule at 600 months", run({ term: "50" }).schedule, null);
eq("schedule at 599.9 months", Boolean(run({ term: "599.9", termUnit: "months" }).schedule), true);
eq("$ to %", convertDownPayment("7000", "percent", "35000"), "20");
eq("% to $", convertDownPayment("20", "dollar", "35000"), "7000");

// ── Validation ──
eq("three errors", run({ price: "x", interestRate: "x", fees: "x" }).errors.join(" | "), "Please provide a positive boat price. | Please provide a positive interest value. | Please provide a positive fees value.");
eq("blank fees", run({ fees: "" }).errors.join(), "Please provide a positive fees value.");
eq("zero term", run({ term: "0" }).errors.join(), "Please provide a positive loan term value.");
eq("monthly pay", run({ mode: "payment", monthlyPay: "0" }).errors.join(), "Please provide a positive monthly pay.");
eq("price ignored on the payment tab", run({ mode: "payment", price: "x" }).errors, undefined);
eq("down % 100", run({ downUnit: "percent", downPayment: "100" }).errors.join(), "Please provide a down payment percentage between 0 and 100%.");
eq("down above price", run({ downPayment: "40000" }).errors.join(), "Please provide a down payment amount that is lower than the boat price.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
