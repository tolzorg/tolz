// Amortization Calculator engine — matches calculator.net/amortization-calculator.html.
//
// This calculator's math is a strict SUBSET of the already-verified
// Mortgage Calculator engine (buildAmortizationSchedule): a plain loan
// amount amortized at a fixed rate, with optional extra monthly/yearly/
// one-time payments — no home price, PMI, property tax, insurance, or
// HOA involved. Rather than duplicate that (already extensively tested)
// simulation logic, this file re-exports it directly and adds only what's
// specific to this calculator: converting the UI's month/year date
// pickers into the 0-indexed "months since loan start" the simulation
// expects, and formatting helpers for its own result layout.
//
// Every formula was verified to match the LIVE reference site exactly
// (not just screenshots) across three scenarios: no extra payments
// ($1,687.71/mo, $103,788.46 total interest on $200,000/15yr/6%),
// monthly+yearly+one-time extra payments ($103,534.22 interest, $405.00
// total extra, $254.24 saved, Sep 2041 payoff), and 10 additional
// one-time payments on top of those ($103,522.72 interest, $413.00
// total extra, $265.74 saved) — see amortization-calculator-notes.md.
import {
  buildAmortizationSchedule, calculateMonthlyPI, addMonths, formatMonthYear,
  formatCurrency, formatYearsAndMonths, MONTHS_IN_YEAR,
} from "./mortgageCalculatorEngine.js";

export { formatCurrency, formatMonthYear, formatYearsAndMonths, MONTHS_IN_YEAR };

/** Converts a {month, year} date into the 0-indexed "months since loan
 * start" the simulation expects (0 = the loan's own start month). Extra
 * payments dated BEFORE the loan start naturally resolve to a negative
 * index, which never matches any simulated month — i.e. they're silently
 * ignored, matching the reference's own behavior (confirmed live: date
 * entries before the loan's start date have no effect on the result). */
function monthIndexFromDate(startDate, month, year) {
  return (Number(year) - startDate.year) * MONTHS_IN_YEAR + (Number(month) - startDate.month);
}

/**
 * @param {object} params
 * @param {number} params.loanAmount
 * @param {number} params.termYears
 * @param {number} params.termMonths — additional months on top of termYears (the reference's "years + months" pair)
 * @param {number} params.annualRatePercent
 * @param {boolean} params.extraPaymentsEnabled
 * @param {{month:number, year:number}} params.startDate
 * @param {{amount:number, month:number, year:number}} [params.extraMonthly]
 * @param {{amount:number, month:number, year:number}} [params.extraYearly]
 * @param {{amount:number, month:number, year:number}} [params.extraOneTime]
 * @param {Array<{amount:number, month:number, year:number}>} [params.additionalOneTimePayments] — the "+ More one-time payments" rows
 */
export function calculateAmortization({
  loanAmount, termYears, termMonths = 0, annualRatePercent,
  extraPaymentsEnabled, startDate,
  extraMonthly, extraYearly, extraOneTime, additionalOneTimePayments = [],
}) {
  const totalTermYears = Math.max(0, Number(termYears) || 0) + Math.max(0, Number(termMonths) || 0) / MONTHS_IN_YEAR;

  const baseline = buildAmortizationSchedule({
    loanAmount, homePrice: 0, annualRatePercent, termYears: totalTermYears, startDate,
  });

  if (!extraPaymentsEnabled) {
    return {
      ...baseline,
      extraPaymentsEnabled: false,
      totalOfPayments: baseline.totalPrincipalPaid + baseline.totalInterest,
      interestSaved: 0,
    };
  }

  const toExtra = (field) => (field && Number(field.amount) > 0
    ? { amount: Number(field.amount), startMonthIndex: monthIndexFromDate(startDate, field.month, field.year) }
    : null);

  const oneTimePayments = [];
  const extraOneTimeResolved = toExtra(extraOneTime);
  if (extraOneTimeResolved) oneTimePayments.push({ amount: extraOneTimeResolved.amount, monthIndex: extraOneTimeResolved.startMonthIndex });
  for (const p of additionalOneTimePayments) {
    if (p && Number(p.amount) > 0) {
      oneTimePayments.push({ amount: Number(p.amount), monthIndex: monthIndexFromDate(startDate, p.month, p.year) });
    }
  }

  const withExtras = buildAmortizationSchedule({
    loanAmount, homePrice: 0, annualRatePercent, termYears: totalTermYears, startDate,
    extraMonthly: toExtra(extraMonthly),
    extraYearly: toExtra(extraYearly),
    oneTimePayments,
  });

  return {
    ...withExtras,
    extraPaymentsEnabled: true,
    totalOfPayments: withExtras.totalPrincipalPaid + withExtras.totalInterest,
    interestSaved: Math.max(0, baseline.totalInterest - withExtras.totalInterest),
    baselineTotalMonths: baseline.totalMonths,
  };
}

/** Cumulative Balance/Interest/Payment series (one point per year) for
 * the "Balance by [term]" line chart — the reference plots the loan's
 * ending balance declining alongside the RUNNING TOTAL of interest paid
 * and the running total of all payments made (principal + interest +
 * extra), not each year's own individual interest/payment amount. */
export function buildCumulativeSeries(annualRows) {
  let cumInterest = 0;
  let cumPayment = 0;
  return annualRows.map((row) => {
    cumInterest += row.interest;
    cumPayment += row.interest + row.principal;
    return { year: row.year, balance: row.endingBalance, interest: cumInterest, payment: cumPayment };
  });
}
