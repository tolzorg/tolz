// Plain-Node test suite for the Payment Calculator engine. Run with:
//   node scripts/payment-calculator.test.js

import { calculateFixedTerm, calculateFixedPayments, formatYearsAndDecimalMonths } from "../src/utils/paymentCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function approx(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks — both verified directly against the LIVE
// calculator.net engine (driven via Playwright, not just screenshots)
// ─────────────────────────────────────────────────────────────────

{
  // Fixed Term: $200,000, 15yr, 6%
  const r = calculateFixedTerm({ loanAmount: 200_000, years: 15, annualRatePercent: 6 });
  ok("Fixed Term: Monthly Payment = $1,687.71", approx(r.payment, 1_687.71, 0.01), `got ${r.payment.toFixed(2)}`);
  ok("Fixed Term: total payments = 180", r.totalPayments === 180);
  ok("Fixed Term: Total of 180 Payments = $303,788.46", approx(r.totalOfPayments, 303_788.46, 0.05), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Fixed Term: Total Interest = $103,788.46", approx(r.totalInterest, 103_788.46, 0.05), `got ${r.totalInterest.toFixed(2)}`);
  ok("Fixed Term: monthly schedule has 180 rows", r.monthlySchedule.length === 180);
  ok("Fixed Term: schedule ends at $0 balance", approx(r.monthlySchedule[179].balance, 0, 0.01));
  ok("Fixed Term: month 1 interest = $1,000.00 (200000 × 6%/12)", approx(r.monthlySchedule[0].interest, 1_000, 0.01));
  ok("Fixed Term: annual schedule has 15 rows", r.annualSchedule.length === 15);
  ok("Fixed Term: year 1 interest = $11,769.23", approx(r.annualSchedule[0].interest, 11_769.23, 0.05), `got ${r.annualSchedule[0].interest.toFixed(2)}`);
  ok("Fixed Term: year 1 principal = $8,483.33", approx(r.annualSchedule[0].principal, 8_483.33, 0.05), `got ${r.annualSchedule[0].principal.toFixed(2)}`);
  ok("Fixed Term: year 1 ending balance = $191,516.67", approx(r.annualSchedule[0].balance, 191_516.67, 0.05), `got ${r.annualSchedule[0].balance.toFixed(2)}`);
}

{
  // Fixed Payments: $200,000, $2,000/mo, 6%
  const r = calculateFixedPayments({ loanAmount: 200_000, monthlyPay: 2_000, annualRatePercent: 6 });
  ok("Fixed Payments: total periods ≈ 138.9757", approx(r.totalPeriods, 138.97572, 0.001), `got ${r.totalPeriods}`);
  ok("Fixed Payments: Time Required to Clear Debt = 11.58 years", (r.payoffYears).toFixed(2) === "11.58");
  ok("Fixed Payments: Payoff displays '11 years 6.98 months'", formatYearsAndDecimalMonths(r.totalPeriods) === "11 years 6.98 months");
  ok("Fixed Payments: Total of 138.98 Payments = $277,951.44", approx(r.totalOfPayments, 277_951.44, 0.05), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Fixed Payments: Total Interest = $77,951.44", approx(r.totalInterest, 77_951.44, 0.05), `got ${r.totalInterest.toFixed(2)}`);

  // The fractional final period — verified directly against the reference's
  // own real schedule (period 139): interest $9.59, principal $1,941.85.
  ok("Fixed Payments: schedule has 139 rows (138 full + 1 fractional)", r.monthlySchedule.length === 139);
  const finalRow = r.monthlySchedule[138];
  ok("Fixed Payments: final row interest = $9.59", approx(finalRow.interest, 9.59, 0.01), `got ${finalRow.interest.toFixed(2)}`);
  ok("Fixed Payments: final row principal = $1,941.85", approx(finalRow.principal, 1_941.85, 0.01), `got ${finalRow.principal.toFixed(2)}`);
  ok("Fixed Payments: final row balance = $0", approx(finalRow.balance, 0, 0.01));
  ok("Fixed Payments: row 138 is a full $2,000 payment", approx(r.monthlySchedule[137].interest + r.monthlySchedule[137].principal, 2_000, 0.01));
  ok("Fixed Payments: month 1 interest = $1,000.00 (200000 × 6%/12)", approx(r.monthlySchedule[0].interest, 1_000, 0.01));
  ok("Fixed Payments: month 1 principal = $1,000.00 ($2,000 payment − $1,000 interest)", approx(r.monthlySchedule[0].principal, 1_000, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 0% interest rate
  const r = calculateFixedTerm({ loanAmount: 12_000, years: 1, annualRatePercent: 0 });
  ok("0% rate: payment = principal / n", approx(r.payment, 1_000, 0.01));
  ok("0% rate: total interest = 0", approx(r.totalInterest, 0, 0.01));

  const rp = calculateFixedPayments({ loanAmount: 12_000, monthlyPay: 1_000, annualRatePercent: 0 });
  ok("0% rate, Fixed Payments: periods = 12 exactly", approx(rp.totalPeriods, 12, 0.001));
  ok("0% rate, Fixed Payments: total interest = 0", approx(rp.totalInterest, 0, 0.01));

  // $0 loan amount
  const zero = calculateFixedTerm({ loanAmount: 0, years: 15, annualRatePercent: 6 });
  ok("$0 loan: payment = 0", approx(zero.payment, 0, 0.01));

  // Payment too small to ever cover interest — clamps rather than looping forever
  const stuck = calculateFixedPayments({ loanAmount: 200_000, monthlyPay: 500, annualRatePercent: 6 }); // 500 < 200000*0.005=1000
  ok("Payment below monthly interest: clamps to max term, finite result", Number.isFinite(stuck.totalPeriods) && stuck.totalPeriods > 0);

  // Negative/garbage inputs coerce safely
  const negative = calculateFixedTerm({ loanAmount: -1000, years: -5, annualRatePercent: -6 });
  ok("Negative inputs (Fixed Term): no NaN, finite payment", Number.isFinite(negative.payment) && !Number.isNaN(negative.payment));
  const negativeP = calculateFixedPayments({ loanAmount: -1000, monthlyPay: -100, annualRatePercent: -6 });
  ok("Negative inputs (Fixed Payments): no NaN, finite periods", Number.isFinite(negativeP.totalPeriods) && !Number.isNaN(negativeP.totalPeriods));

  // formatYearsAndDecimalMonths singular/plural
  ok("formatYearsAndDecimalMonths: 1 year singular", formatYearsAndDecimalMonths(12.5) === "1 year 0.50 months");
  ok("formatYearsAndDecimalMonths: 0 years", formatYearsAndDecimalMonths(6) === "0 years 6.00 months");
}

console.log(`\nPayment Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
