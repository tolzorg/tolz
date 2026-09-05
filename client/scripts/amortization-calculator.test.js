// Plain-Node test suite for the Amortization Calculator engine. Run with:
//   node scripts/amortization-calculator.test.js
//
// This engine is a thin wrapper around the already-verified Mortgage
// Calculator's buildAmortizationSchedule() — these tests exist to lock in
// the wrapper's own logic (date-to-monthIndex conversion, the
// extraPaymentsEnabled branch, interestSaved calculation) against the
// LIVE reference site's exact figures for all three of its documented
// scenarios, not to re-verify the underlying simulation itself.

import { calculateAmortization, buildCumulativeSeries } from "../src/utils/amortizationCalculatorEngine.js";

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

const BASE_INPUTS = {
  loanAmount: 200_000, termYears: 15, termMonths: 0, annualRatePercent: 6,
  extraPaymentsEnabled: false, startDate: { month: 9, year: 2026 },
};

// ─────────────────────────────────────────────────────────────────
// Scenario 1: no extra payments — reference: Monthly Pay $1,687.71,
// Total of 180 monthly payments $303,788.46, Total interest $103,788.46.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateAmortization(BASE_INPUTS);
  ok("Base: monthly pay = $1,687.71 (exact)", approx(r.monthlyPI, 1687.71, 0.01), `got ${r.monthlyPI.toFixed(2)}`);
  ok("Base: total interest = $103,788.46 (exact)", approx(r.totalInterest, 103_788.46, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("Base: total of payments = $303,788.46 (exact)", approx(r.totalOfPayments, 303_788.46, 0.01), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Base: total months = 180 (exact)", r.totalMonths === 180, `got ${r.totalMonths}`);
  ok("Base: extraPaymentsEnabled = false, interestSaved = 0", r.extraPaymentsEnabled === false && r.interestSaved === 0);
}

// ─────────────────────────────────────────────────────────────────
// Scenario 2: extra monthly ($2/mo from Sep 2026) + extra yearly ($3/yr
// from Sep 2026) + extra one-time ($2 in Sep 2026) — reference: Total
// interest $103,534.22, Total extra payment(s) $405.00, Interest saved
// $254.24, Loan payoff date Sep. 2041.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateAmortization({
    ...BASE_INPUTS, extraPaymentsEnabled: true,
    extraMonthly: { amount: 2, month: 9, year: 2026 },
    extraYearly: { amount: 3, month: 9, year: 2026 },
    extraOneTime: { amount: 2, month: 9, year: 2026 },
  });
  ok("Extras: total interest = $103,534.22 (exact)", approx(r.totalInterest, 103_534.22, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("Extras: total extra payments = $405.00 (exact)", approx(r.totalExtraPayments, 405.00, 0.01), `got ${r.totalExtraPayments.toFixed(2)}`);
  ok("Extras: interest saved = $254.24 (exact)", approx(r.interestSaved, 254.24, 0.01), `got ${r.interestSaved.toFixed(2)}`);
  ok("Extras: payoff date = Sep 2041 (exact)", r.payoffDate.month === 9 && r.payoffDate.year === 2041, `got ${JSON.stringify(r.payoffDate)}`);
}

// ─────────────────────────────────────────────────────────────────
// Scenario 3: same as Scenario 2, plus 10 "additional one-time payment"
// rows (Jan-Oct 2026, amounts 1/3/3/90/1/4/9/7/5/3) — reference: Total
// interest $103,522.72, Total extra payment(s) $413.00, Interest saved
// $265.74, Loan payoff date Sep. 2041 (unchanged — the extras are too
// small relative to the loan to shorten the 15yr term).
//
// Jan-Aug 2026 payments are dated BEFORE the loan's Sep 2026 start date
// (negative monthIndex) and are correctly ignored — confirmed against
// the reference's own total ($413 = $405 base extras + $5 Sep + $3 Oct,
// NOT $405 + all 10 additional amounts, which would be $530).
// ─────────────────────────────────────────────────────────────────

{
  const additionalOneTimePayments = [
    { amount: 1, month: 1, year: 2026 }, { amount: 3, month: 2, year: 2026 }, { amount: 3, month: 3, year: 2026 },
    { amount: 90, month: 4, year: 2026 }, { amount: 1, month: 5, year: 2026 }, { amount: 4, month: 6, year: 2026 },
    { amount: 9, month: 7, year: 2026 }, { amount: 7, month: 8, year: 2026 }, { amount: 5, month: 9, year: 2026 },
    { amount: 3, month: 10, year: 2026 },
  ];
  const r = calculateAmortization({
    ...BASE_INPUTS, extraPaymentsEnabled: true,
    extraMonthly: { amount: 2, month: 9, year: 2026 },
    extraYearly: { amount: 3, month: 9, year: 2026 },
    extraOneTime: { amount: 2, month: 9, year: 2026 },
    additionalOneTimePayments,
  });
  ok("More one-time: total interest = $103,522.72 (exact)", approx(r.totalInterest, 103_522.72, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("More one-time: total extra payments = $413.00 (exact)", approx(r.totalExtraPayments, 413.00, 0.01), `got ${r.totalExtraPayments.toFixed(2)}`);
  ok("More one-time: interest saved = $265.74 (exact)", approx(r.interestSaved, 265.74, 0.01), `got ${r.interestSaved.toFixed(2)}`);
  ok("More one-time: payoff date unchanged = Sep 2041", r.payoffDate.month === 9 && r.payoffDate.year === 2041, `got ${JSON.stringify(r.payoffDate)}`);
}

// ─────────────────────────────────────────────────────────────────
// buildCumulativeSeries() — used by the Balance/Interest/Payment chart
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateAmortization(BASE_INPUTS);
  const series = buildCumulativeSeries(r.annualRows);
  ok("Cumulative series: one point per year (15)", series.length === 15, `got ${series.length}`);
  ok("Cumulative series: balance starts near loan amount and declines", series[0].balance < 200_000 && series[0].balance > series[series.length - 1].balance);
  ok("Cumulative series: balance ends at ~$0", approx(series[series.length - 1].balance, 0, 1), `got ${series[series.length - 1].balance.toFixed(2)}`);
  ok("Cumulative series: interest is monotonically increasing and ends at total interest", approx(series[series.length - 1].interest, r.totalInterest, 0.5), `got ${series[series.length - 1].interest.toFixed(2)}`);
  ok("Cumulative series: payment ends at total of payments", approx(series[series.length - 1].payment, r.totalOfPayments, 0.5), `got ${series[series.length - 1].payment.toFixed(2)}`);
  for (let i = 1; i < series.length; i++) {
    ok(`Cumulative series: interest[${i}] >= interest[${i - 1}] (monotonic)`, series[i].interest >= series[i - 1].interest - 0.001);
    ok(`Cumulative series: payment[${i}] >= payment[${i - 1}] (monotonic)`, series[i].payment >= series[i - 1].payment - 0.001);
  }
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  const zero = calculateAmortization({ loanAmount: 0, termYears: 15, annualRatePercent: 6, extraPaymentsEnabled: false, startDate: { month: 1, year: 2026 } });
  ok("$0 loan: no crash, 0 payments", zero.totalMonths === 0 && Number.isFinite(zero.monthlyPI));

  const zeroRate = calculateAmortization({ loanAmount: 100_000, termYears: 10, annualRatePercent: 0, extraPaymentsEnabled: false, startDate: { month: 1, year: 2026 } });
  ok("0% rate: monthly pay = principal/months, no interest", approx(zeroRate.monthlyPI, 100_000 / 120, 0.01) && approx(zeroRate.totalInterest, 0, 0.01));

  // termMonths adds to termYears correctly (15yr 0mo vs 14yr 12mo should be identical)
  const a = calculateAmortization({ ...BASE_INPUTS, termYears: 15, termMonths: 0 });
  const b = calculateAmortization({ ...BASE_INPUTS, termYears: 14, termMonths: 12 });
  ok("termYears/termMonths: 15y0m equals 14y12m", approx(a.monthlyPI, b.monthlyPI, 0.01) && a.totalMonths === b.totalMonths);
}

console.log(`\nAmortization Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
