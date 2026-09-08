// Plain-Node test suite for the Interest Rate Calculator engine. Run with:
//   node scripts/interest-rate-calculator.test.js
//
// This calculator is a thin wrapper around the already-verified Finance
// Calculator's I/Y solver (financeCalculatorEngine.calculateIY), so this
// suite focuses on the wiring (sign conventions, term-to-months
// conversion, validation messages, chart data) rather than re-proving
// the underlying bisection math. Every scenario verified against the
// LIVE reference via plain GET requests (the form submits GET to the
// same page, server-rendered — no Playwright needed).

import { calculateInterestRate, validateInterestRateInputs, formatCurrency, formatPercent } from "../src/utils/interestRateCalculatorEngine.js";

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
// 1. Default reference scenario: $32,000 loan, 3 years 0 months,
//    $960/month payment
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateInterestRate({ loanAmount: 32000, years: 3, months: 0, monthlyPayment: 960 });
  ok("default: interest rate 5.065%", approx(r.iy, 5.065, 0.001), r.iy);
  ok("default: n = 36 months", r.n === 36);
  ok("default: total of 36 payments = $34,560.00", approx(r.totalPayments, 34560, 0.01));
  ok("default: total interest paid = $2,560.00", approx(r.totalInterest, 2560, 0.01));
  ok("default: formatPercent renders '5.065%'", formatPercent(r.iy) === "5.065%", formatPercent(r.iy));
  ok("default: formatCurrency renders '$34,560.00'", formatCurrency(r.totalPayments) === "$34,560.00");

  // Chart data: balance declines from the loan amount to (near) $0,
  // cumulative interest/payment rise monotonically, exactly 3 yearly
  // points for a 36-month term.
  ok("default: 3 annual chart points", r.annualSeries.length === 3, r.annualSeries.length);
  ok("default: chart final balance ~0", approx(r.annualSeries[2].balance, 0, 0.5));
  ok("default: chart final cumulative payment = totalPayments", approx(r.annualSeries[2].payment, r.totalPayments, 0.01));
  ok("default: chart final cumulative interest = totalInterest", approx(r.annualSeries[2].interest, r.totalInterest, 0.01));

  // Payment Breakdown pie: Principal = loan amount, Interest = total interest
  ok("default: pie Principal = 32,000", approx(r.pieSegments[0].value, 32000, 0.01));
  ok("default: pie Interest = 2,560", approx(r.pieSegments[1].value, 2560, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// 2. A too-low monthly payment implies a NEGATIVE interest rate — the
//    reference itself finds and displays this (confirmed live), not a
//    "no solution" case.
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateInterestRate({ loanAmount: 32000, years: 3, months: 0, monthlyPayment: 10 });
  ok("negative-rate: interest rate -190.804%", approx(r.iy, -190.804, 0.01), r.iy);
  ok("negative-rate: total interest paid = $-31,640.00", formatCurrency(r.totalInterest) === "$-31,640.00", formatCurrency(r.totalInterest));
}

// ─────────────────────────────────────────────────────────────────
// 3. Input validation — 3 distinct messages, confirmed live
// ─────────────────────────────────────────────────────────────────

ok("validation: loan amount = 0 blocked", validateInterestRateInputs({ loanAmount: 0, years: 3, months: 0, monthlyPayment: 960 }) === "Loan amount needs to be positive.");
ok("validation: negative loan amount blocked", validateInterestRateInputs({ loanAmount: -100, years: 3, months: 0, monthlyPayment: 960 }) === "Loan amount needs to be positive.");
ok("validation: zero-length term blocked", validateInterestRateInputs({ loanAmount: 32000, years: 0, months: 0, monthlyPayment: 960 }) === "Please provide a positive loan term value.");
ok("validation: zero monthly payment blocked", validateInterestRateInputs({ loanAmount: 32000, years: 3, months: 0, monthlyPayment: 0 }) === "Monthly pay needs to be positive.");
ok("validation: default scenario passes", validateInterestRateInputs({ loanAmount: 32000, years: 3, months: 0, monthlyPayment: 960 }) === null);

// ─────────────────────────────────────────────────────────────────
// 4. Term with both years AND months converts correctly to total months
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateInterestRate({ loanAmount: 32000, years: 3, months: 6, monthlyPayment: 800 });
  ok("years+months: n = 42 months", r.n === 42, r.n);
  ok("years+months: final chart point at fractional year 3.5", approx(r.annualSeries[r.annualSeries.length - 1].year, 3.5, 0.001));
}

console.log(`\nInterest Rate Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
