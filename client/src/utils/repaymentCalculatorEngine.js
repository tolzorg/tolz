// Repayment Calculator engine — matches calculator.net/repayment-calculator.html.
//
// Two modes:
//   "Repay within a fixed time"       → given a loan term, solve the
//                                       periodic payment.
//   "Repay with a fixed installment"  → given a periodic payment, solve
//                                       how long it takes to pay off.
//
// The Compound/Pay back frequency options and the general-annuity-method
// math (bridging a nominal rate compounded at one frequency to whatever
// periodic rate corresponds to a DIFFERENT payment frequency) are IDENTICAL
// to the already-verified Loan Calculator — confirmed directly from the
// reference's own <select> markup (same 9 Compound options, same 8 Pay
// back options, in the same order). "Repay within a fixed time" is
// therefore a THIN WRAPPER around loanCalculatorEngine.js's own
// `calculateAmortizedLoan()`, not a reimplementation — verified exact
// against the reference's own default example ($10,000 / 10% / monthly /
// 5yr → $212.47/mo, $12,748.23 total, $2,748.23 interest).
//
// "Repay with a fixed installment" is a genuinely new closed-form solve
// (given P, PMT, and the SAME bridged periodic rate, solve n), matching
// the same fractional-final-period schedule convention already used
// throughout this app (e.g. paymentCalculatorEngine.js) — verified exact
// against the reference's own worked example (10.99%... $10,000 / 10% /
// monthly / $300/mo → 39.213174201269915 exact periods — confirmed
// against a value the reference's own page embeds verbatim in its "View
// Amortization Table" link — 40 total payments, $11,763.95 total,
// $1,763.95 interest, "3 years and 3.2 months").
//
// Other findings, all confirmed live:
//  1. "Repay within a fixed time" shows NO headline sentence, just a
//     results table ("Pay back every X" / "Total of N loan payments" /
//     "Interest"). "Repay with a fixed installment" DOES have a headline
//     sentence ("By paying $X every Y, the loan will be paid off in
//     Z.") and its table omits the "Pay back every X" row (redundant
//     with the sentence).
//  2. The fixed-installment duration format is genuinely different from
//     every other calculator in this app: "{years} year(s) and
//     {months}.{d} months" with the REMAINDER MONTHS always shown to ONE
//     DECIMAL PLACE (never rounded to a whole month, and never omitted
//     even when exactly ".0") — confirmed with a clean-number scenario
//     ("1 year and 0.0 months") and an under-a-year scenario, which
//     drops the "years" clause entirely rather than showing "0 years
//     and X.Y months" ("2.0 months" alone).
//  3. The payback-frequency phrase used in BOTH the sentence and the
//     fixed-time table's "Pay back every X" row differs from the
//     dropdown's own option text for exactly one case: biweekly is
//     "every 2 weeks" in the dropdown but "every two weeks" (spelled
//     out) everywhere it's used in a sentence — confirmed live in both
//     contexts.
//  4. Validation, confirmed live: loan balance and interest rate must be
//     positive/non-negative respectively (negative rejected for both);
//     "Repay within a fixed time" additionally requires a positive total
//     term. "Repay with a fixed installment" shows a distinct message
//     when the payment doesn't cover one period's interest: "You need to
//     pay at least $X every Y." (X = principal × periodic rate) — a
//     different phrasing from the sibling debt calculators' own
//     "cannot pay off" messages, replicated exactly.

import {
  calculateAmortizedLoan, COMPOUND_OPTIONS, PAYBACK_OPTIONS, DEFAULT_COMPOUND, DEFAULT_PAYBACK,
  effectiveAnnualRate, periodicRateFromEAR, paybackPeriodsPerYear, paybackPeriodLabel,
  formatCurrency, formatPercent,
} from "./loanCalculatorEngine.js";

export { COMPOUND_OPTIONS, PAYBACK_OPTIONS, DEFAULT_COMPOUND, DEFAULT_PAYBACK, formatCurrency, formatPercent };

const MAX_SCHEDULE_ROWS = 4000;
const EPS = 1e-9;

export const DEFAULTS = {
  loanAmount: "10000",
  interestRate: "10",
  compound: DEFAULT_COMPOUND,
  payback: DEFAULT_PAYBACK,
  years: "5",
  months: "0",
  installmentAmount: "200",
};

// Sentence phrase per payback option — differs from the dropdown's own
// label for biweekly ("every 2 weeks" in the select, "every two weeks"
// spelled out everywhere it appears in a sentence). Keyed by
// PAYBACK_OPTIONS' own value strings (this app's own, not the
// reference's raw form field values).
const PAYBACK_PHRASES = {
  day: "every day",
  week: "every week",
  "2weeks": "every two weeks",
  halfmonth: "every half month",
  month: "every month",
  quarter: "every quarter",
  "6months": "every 6 months",
  year: "every year",
};
export function paybackPhrase(payback) {
  return PAYBACK_PHRASES[payback] || "every month";
}

export function validateFixedTimeInputs({ loanAmount, interestRate, years, months }) {
  const amount = Number(loanAmount);
  if (!isFinite(amount) || amount <= 0) return "Please provide a positive loan balance value.";
  const rate = Number(interestRate);
  if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate value.";
  const termMonths = (Number(years) || 0) * 12 + (Number(months) || 0);
  if (termMonths <= 0) return "Please provide a positive payback time value.";
  return null;
}

export function validateFixedInstallmentInputs({ loanAmount, interestRate, installmentAmount }) {
  const amount = Number(loanAmount);
  if (!isFinite(amount) || amount <= 0) return "Please provide a positive loan balance value.";
  const rate = Number(interestRate);
  if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate value.";
  const pmt = Number(installmentAmount);
  if (!isFinite(pmt) || pmt <= 0) return "Please provide a positive installment amount value.";
  return null;
}

export function calculateFixedTime({ loanAmount, interestRate, compound, payback, years, months }) {
  const result = calculateAmortizedLoan({
    loanAmount, years, months, annualRatePercent: interestRate, compound, payback,
  });
  return {
    mode: "fixedtime",
    isImpossible: false,
    payment: result.payment,
    paymentCount: result.totalPayments,
    totalOfPayments: result.totalOfPayments,
    totalInterest: result.totalInterest,
    schedule: result.schedule,
    periodLabel: result.periodLabel,
    loanAmount: Math.max(0, Number(loanAmount) || 0),
    payback,
  };
}

export function calculateFixedInstallment({ loanAmount, interestRate, compound, payback, installmentAmount }) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const rate = Math.max(0, (Number(interestRate) || 0) / 100);
  const payment = Math.max(0, Number(installmentAmount) || 0);
  const p = paybackPeriodsPerYear(payback);
  const ear = effectiveAnnualRate(rate, compound);
  const periodicRate = periodicRateFromEAR(ear, p);

  const minPayment = principal * periodicRate;
  const isImpossible = payment <= 0 || (periodicRate > 0 && payment <= minPayment);
  if (isImpossible) {
    return { isImpossible: true, minPayment, periodLabel: paybackPeriodLabel(payback), payback };
  }

  const nExact = periodicRate === 0
    ? principal / payment
    : -Math.log(1 - (principal * periodicRate) / payment) / Math.log(1 + periodicRate);

  const wholePeriods = Math.min(MAX_SCHEDULE_ROWS, Math.floor(nExact));
  const fraction = nExact - wholePeriods;

  const schedule = [];
  let balance = principal;
  for (let period = 1; period <= wholePeriods; period++) {
    const interest = balance * periodicRate;
    const principalPaid = payment - interest;
    balance -= principalPaid;
    schedule.push({ period, payment, interest, principal: principalPaid, balance });
  }
  if (fraction > EPS && wholePeriods < MAX_SCHEDULE_ROWS) {
    const finalPayment = payment * fraction;
    const finalPrincipal = balance;
    const finalInterest = finalPayment - finalPrincipal;
    schedule.push({ period: wholePeriods + 1, payment: finalPayment, interest: finalInterest, principal: finalPrincipal, balance: 0 });
  } else if (schedule.length) {
    schedule[schedule.length - 1].balance = 0;
  }

  const totalOfPayments = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalOfPayments - principal;
  const totalMonthsExact = (nExact * 12) / p;

  return {
    isImpossible: false,
    mode: "fixedinstallment",
    payment,
    paymentCount: schedule.length,
    totalOfPayments,
    totalInterest,
    schedule,
    periodLabel: paybackPeriodLabel(payback),
    totalMonthsExact,
    loanAmount: principal,
    payback,
  };
}

/** "3 years and 3.2 months" — see finding #2: remainder months always
 * shown to one decimal, the "years" clause dropped entirely under a
 * year rather than shown as "0 years and X.Y months". */
export function formatFixedInstallmentDuration(totalMonthsExact) {
  const years = Math.floor(totalMonthsExact / 12 + EPS);
  const remMonths = Math.max(0, totalMonthsExact - years * 12);
  if (years <= 0) return `${remMonths.toFixed(1)} months`;
  return `${years} year${years === 1 ? "" : "s"} and ${remMonths.toFixed(1)} months`;
}
