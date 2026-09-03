// Plain-Node test suite for the Loan Calculator engine. Run with:
//   node scripts/loan-calculator.test.js

import {
  calculateAmortizedLoan, calculateDeferredLoan, calculateBond,
  effectiveAnnualRate, periodicRateFromEAR, compoundPeriodsPerYear, paybackPeriodsPerYear,
} from "../src/utils/loanCalculatorEngine.js";

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
// Reference cross-checks — calculator.net's own worked examples
// (Loan Amount $100,000, 10yr 0mo, 6%, Compound=Annually/Monthly (APY/APR))
// ─────────────────────────────────────────────────────────────────

{
  // Amortized: $100,000, 10yr, 6%, Compound=Monthly (APR), Pay Back=Every Month
  const r = calculateAmortizedLoan({ loanAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "monthly", payback: "month" });
  ok("Amortized: payment matches reference ($1,110.21)", approx(r.payment, 1110.21, 0.01), `got ${r.payment.toFixed(2)}`);
  ok("Amortized: total payments count is 120", r.totalPayments === 120);
  ok("Amortized: total of payments matches reference ($133,224.60)", approx(r.totalOfPayments, 133_224.60, 0.05), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Amortized: total interest matches reference ($33,224.60)", approx(r.totalInterest, 33_224.60, 0.05), `got ${r.totalInterest.toFixed(2)}`);
  ok("Amortized: schedule has 120 rows", r.schedule.length === 120);
  ok("Amortized: schedule ends at $0 balance", approx(r.schedule[r.schedule.length - 1].balance, 0, 0.01));
  ok("Amortized: schedule row 1 interest = balance*rate", approx(r.schedule[0].interest, 100_000 * r.periodicRate, 0.01));
}

{
  // Deferred Payment Loan: $100,000, 10yr, 6%, Compound=Annually (APY)
  const r = calculateDeferredLoan({ loanAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "annually" });
  ok("Deferred: amount due matches reference ($179,084.77)", approx(r.amountDue, 179_084.77, 0.01), `got ${r.amountDue.toFixed(2)}`);
  ok("Deferred: total interest matches reference ($79,084.77)", approx(r.totalInterest, 79_084.77, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("Deferred: schedule has 10 rows (annual compounding)", r.schedule.length === 10);
  ok("Deferred: schedule final balance ties to amount due exactly", r.schedule[9].balance === r.amountDue);
  ok("Deferred: schedule starts from loan amount", approx(r.schedule[0].balance, 100_000 * 1.06, 0.01));
}

{
  // Bond: $100,000 predetermined due amount, 10yr, 6%, Compound=Annually (APY)
  const r = calculateBond({ dueAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "annually" });
  ok("Bond: amount received matches reference ($55,839.48)", approx(r.amountReceived, 55_839.48, 0.01), `got ${r.amountReceived.toFixed(2)}`);
  ok("Bond: total interest matches reference ($44,160.52)", approx(r.totalInterest, 44_160.52, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("Bond: schedule has 10 rows", r.schedule.length === 10);
  ok("Bond: schedule final balance ties to face value exactly", r.schedule[9].balance === 100_000);
  ok("Bond: amountReceived + totalInterest = dueAmount", approx(r.amountReceived + r.totalInterest, 100_000, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// Cross-frequency (compound ≠ payback) sanity — general annuity method
// ─────────────────────────────────────────────────────────────────

{
  // Same nominal rate/compound, different payback frequencies should give
  // different payments but the SAME effective annual rate underneath.
  const monthly = calculateAmortizedLoan({ loanAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "monthly", payback: "month" });
  const biweekly = calculateAmortizedLoan({ loanAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "monthly", payback: "2weeks" });
  ok("Cross-frequency: biweekly payback produces more, smaller payments than monthly", biweekly.totalPayments > monthly.totalPayments);
  ok("Cross-frequency: biweekly total interest is less than monthly (more frequent principal reduction)", biweekly.totalInterest < monthly.totalInterest);

  const ear = effectiveAnnualRate(0.06, "monthly");
  ok("EAR for 6% compounded monthly ≈ 6.1678%", approx(ear, 0.061678, 0.0001), `got ${ear}`);
  const earContinuous = effectiveAnnualRate(0.06, "continuously");
  ok("EAR for 6% compounded continuously ≈ 6.1837% (e^0.06 - 1)", approx(earContinuous, Math.exp(0.06) - 1, 1e-9));

  ok("periodicRateFromEAR degenerates correctly: EAR itself at periodsPerYear=1", approx(periodicRateFromEAR(0.061678, 1), 0.061678, 1e-6));
}

// ─────────────────────────────────────────────────────────────────
// Frequency period-per-year mappings
// ─────────────────────────────────────────────────────────────────

{
  ok("compoundPeriodsPerYear: annually = 1", compoundPeriodsPerYear("annually") === 1);
  ok("compoundPeriodsPerYear: semiannually = 2", compoundPeriodsPerYear("semiannually") === 2);
  ok("compoundPeriodsPerYear: quarterly = 4", compoundPeriodsPerYear("quarterly") === 4);
  ok("compoundPeriodsPerYear: monthly = 12", compoundPeriodsPerYear("monthly") === 12);
  ok("compoundPeriodsPerYear: semimonthly = 24", compoundPeriodsPerYear("semimonthly") === 24);
  ok("compoundPeriodsPerYear: biweekly = 26", compoundPeriodsPerYear("biweekly") === 26);
  ok("compoundPeriodsPerYear: weekly = 52", compoundPeriodsPerYear("weekly") === 52);
  ok("compoundPeriodsPerYear: daily = 365", compoundPeriodsPerYear("daily") === 365);
  ok("compoundPeriodsPerYear: continuously = null", compoundPeriodsPerYear("continuously") === null);

  ok("paybackPeriodsPerYear: day = 365", paybackPeriodsPerYear("day") === 365);
  ok("paybackPeriodsPerYear: week = 52", paybackPeriodsPerYear("week") === 52);
  ok("paybackPeriodsPerYear: 2weeks = 26", paybackPeriodsPerYear("2weeks") === 26);
  ok("paybackPeriodsPerYear: halfmonth = 24", paybackPeriodsPerYear("halfmonth") === 24);
  ok("paybackPeriodsPerYear: month = 12", paybackPeriodsPerYear("month") === 12);
  ok("paybackPeriodsPerYear: quarter = 4", paybackPeriodsPerYear("quarter") === 4);
  ok("paybackPeriodsPerYear: 6months = 2", paybackPeriodsPerYear("6months") === 2);
  ok("paybackPeriodsPerYear: year = 1", paybackPeriodsPerYear("year") === 1);
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 0% interest rate: payment should be a flat principal/N split, no interest.
  const r = calculateAmortizedLoan({ loanAmount: 12_000, years: 1, months: 0, annualRatePercent: 0, compound: "monthly", payback: "month" });
  ok("0% rate: payment = principal / N", approx(r.payment, 1000, 0.01));
  ok("0% rate: total interest = 0", approx(r.totalInterest, 0, 0.01));

  // 0 loan amount
  const zero = calculateAmortizedLoan({ loanAmount: 0, years: 10, months: 0, annualRatePercent: 6, compound: "monthly", payback: "month" });
  ok("$0 loan: payment = 0", approx(zero.payment, 0, 0.01));

  // 0 term (should not crash / divide by zero — clamped to at least 1 payment)
  const zeroTerm = calculateAmortizedLoan({ loanAmount: 10_000, years: 0, months: 0, annualRatePercent: 6, compound: "monthly", payback: "month" });
  ok("0-year term: still produces a finite payment (>= loan amount, single balloon payment)", Number.isFinite(zeroTerm.payment) && zeroTerm.totalPayments >= 1);

  // Negative/garbage input coercion
  const negative = calculateAmortizedLoan({ loanAmount: -5000, years: -3, months: -2, annualRatePercent: -6, compound: "monthly", payback: "month" });
  ok("Negative inputs clamp to 0/safe values, no NaN", Number.isFinite(negative.payment) && !Number.isNaN(negative.payment));

  // Deferred/Bond are exact inverses of each other
  const deferred = calculateDeferredLoan({ loanAmount: 55_839.48, years: 10, months: 0, annualRatePercent: 6, compound: "annually" });
  ok("Deferred(bond's PV) grows back to ~ the original face value", approx(deferred.amountDue, 100_000, 0.5), `got ${deferred.amountDue.toFixed(2)}`);

  // Continuously-compounded deferred loan
  const continuous = calculateDeferredLoan({ loanAmount: 100_000, years: 10, months: 0, annualRatePercent: 6, compound: "continuously" });
  ok("Continuous compounding: amount due = 100000 * e^0.6", approx(continuous.amountDue, 100_000 * Math.exp(0.6), 0.01), `got ${continuous.amountDue.toFixed(2)}`);
}

console.log(`\nLoan Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
