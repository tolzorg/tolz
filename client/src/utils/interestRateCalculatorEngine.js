// Interest Rate Calculator engine — matches
// calculator.net/interest-rate-calculator.html: given a fixed loan
// amount, loan term (years + months), and monthly payment, solve for the
// implied interest rate.
//
// This is a THIN WRAPPER, not a reimplementation — it's exactly the I/Y
// (solve-for-rate) tab of the already-verified Finance Calculator engine
// (financeCalculatorEngine.js), with the inputs pinned to this
// calculator's specific shape: loan amount = PV (positive, received),
// monthly payment = PMT (negative, paid out), FV = 0 (fully amortizing),
// P/Y = C/Y = 12 (monthly payments, monthly compounding), end-of-period.
// Verified exact against the live reference (plain GET request — the
// form submits GET to the same page, server-rendered) for the default
// scenario (5.065% / $34,560.00 / $2,560.00) and a deeply-negative-rate
// scenario (a too-low monthly payment implies a negative interest rate,
// -190.804%, which the reference itself finds and displays — confirmed
// our shared bisection solver's wide search bounds already handle it).

import { calculateIY, formatCurrency } from "./financeCalculatorEngine.js";

// Re-exported as-is: the reference shows negative dollar amounts as
// "$-31,640.00" (sign AFTER the currency symbol, confirmed live via a
// too-low-monthly-payment scenario that implies a negative interest
// rate and a negative "Total interest paid") — the same non-standard
// convention already verified for the Finance Calculator this engine
// wraps, not a generic toLocaleString-style "-$31,640.00".
export { formatCurrency };

export const DEFAULTS = { loanAmount: "32000", years: "3", months: "0", monthlyPayment: "960" };

/** Validates inputs BEFORE calling the solver, matching the reference's
 * own 3 distinct error messages (confirmed live via a GET request per
 * case) — it blocks calculation entirely rather than computing a
 * degenerate result. Returns null when valid. */
export function validateInterestRateInputs({ loanAmount, years, months, monthlyPayment }) {
  const amount = Number(loanAmount) || 0;
  const termMonths = (Number(years) || 0) * 12 + (Number(months) || 0);
  const payment = Number(monthlyPayment) || 0;
  if (amount <= 0) return "Loan amount needs to be positive.";
  if (termMonths <= 0) return "Please provide a positive loan term value.";
  if (payment <= 0) return "Monthly pay needs to be positive.";
  return null;
}

/** Aggregates the monthly PV/PMT/Interest/FV schedule (from the shared
 * Finance Calculator engine) into one point per loan-year for the
 * "Loan Amortization Graph" — remaining balance plus RUNNING TOTALS of
 * interest and payments made, matching the reference's own chart
 * exactly (same convention already verified for the Amortization
 * Calculator's identical chart — see amortizationCalculatorEngine.js's
 * buildCumulativeSeries()). A fractional final year (e.g. a 3-year-6-
 * month term) lands at its own fractional x-position (3.5), not rounded
 * up to a whole year. */
function buildAnnualSeries(schedule) {
  const points = [];
  let cumInterest = 0;
  let cumPayment = 0;
  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    cumInterest += row.interest;
    cumPayment += -row.pmt; // schedule stores pmt negative (cash outflow)
    const isYearBoundary = (i + 1) % 12 === 0 || i === schedule.length - 1;
    if (isYearBoundary) {
      points.push({ year: (i + 1) / 12, balance: Math.max(0, -row.fv), interest: cumInterest, payment: cumPayment });
    }
  }
  return points;
}

export function calculateInterestRate({ loanAmount, years, months, monthlyPayment }) {
  const pv = Math.max(0, Number(loanAmount) || 0);
  const n = Math.max(0, Number(years) || 0) * 12 + Math.max(0, Number(months) || 0);
  const pmt = -Math.max(0, Number(monthlyPayment) || 0);

  const result = calculateIY({ n, pv, pmt, fv: 0, py: 12, cy: 12, due: false });
  if (result.noSolution) {
    return { ...result, totalPayments: Math.abs(pmt * n), annualSeries: [], pieSegments: [] };
  }

  return {
    ...result,
    totalPayments: Math.abs(result.sumOfPmt),
    annualSeries: buildAnnualSeries(result.schedule),
    pieSegments: [
      { label: "Principal", value: pv, color: "#3b7bfc" },
      { label: "Interest", value: Math.max(0, result.totalInterest), color: "#16a34a" },
    ],
  };
}

export function formatPercent(value, decimals = 3) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
