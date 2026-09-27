// Annuity Payout Calculator engine — matches calculator.net/annuity-payout-calculator.html.
//
// Two tabs, both decumulating a starting principal at a fixed rate until (or
// unless) it's depleted:
//   Fixed Length  → solve the periodic payout amount that exactly depletes
//                   the principal over a chosen number of years.
//   Fixed Payment → solve how long a chosen fixed periodic payout amount
//                   will last (or whether it lasts forever).
//
// Every mechanic verified by driving the LIVE reference with plain GET
// requests (this page renders its result server-side off its own query
// string, no Playwright needed) across ~25 scenarios. Key findings:
//
//  1. No "Compound" selector exists on this calculator at all (same as the
//     accumulation Annuity Calculator) — the growth rate always behaves as
//     an unbridged annual EAR, bridged down to whatever the selected
//     Payout frequency's periodic rate is via the standard
//     periodicRateFromEAR() technique used throughout this app.
//  2. Payout frequency only has 6 options — Annually/Semiannually/
//     Quarterly/Monthly/Semimonthly/Biweekly — NOT the 8-option
//     day/week/…/year set the Loan Calculator's "Pay Back" frequency uses
//     (no Weekly or Daily here, confirmed from the reference's own <select>
//     markup).
//  3. Fixed Length uses the standard ordinary-annuity payment formula
//     (PMT = P·r / (1 − (1+r)^−n), P/n when r=0) — verified exact against
//     the reference's own worked example ($500,000 / 6% / 10yr / monthly →
//     $5,511.20, matching to the cent) and against 0%, negative-rate,
//     and non-monthly-frequency scenarios.
//  4. Fixed Payment solves n via n = −ln(1 − P·r/PMT) / ln(1+r) (P/PMT
//     when r=0) — verified exact against the reference's own worked
//     example ($500,000 / 6% / $5,000/mo → 11.45 years, 138 payments,
//     $686,817.82 total, matching to the cent). A genuinely different
//     "PERPETUITY" branch exists: whenever the periodic payout doesn't
//     exceed that period's interest (PMT <= P×periodicRate, only possible
//     when the rate is positive), the fund never depletes — the reference
//     shows "You can withdraw $X monthly forever!" with NO totals table,
//     NO pie chart, and NO schedule/chart section at all (confirmed by
//     diffing the raw HTML of a "forever" response against a normal one).
//  6. The FINAL (fractional) period of a Fixed Payment schedule is NOT a
//     "withdraw whatever remains" true-up — it's the exact same
//     fractional-final-period convention already documented for the
//     Payment Calculator's own "Fixed Payments" tab
//     (see payment-calculator-notes.md): finalPayment = PMT x fraction
//     (fraction = n - floor(n)), the ending balance is forced to exactly
//     0, and finalInterest = finalPayment - remainingBalance is BACKED
//     OUT from that, NOT computed as balance x periodicRate. A first,
//     more "obvious" implementation (clamping the final withdrawal to
//     whatever principal+interest remained) matched every full period
//     exactly but was off by ~$2.80 on the final year's interest and the
//     grand totals — re-deriving with this exact formula (reusing the
//     already-proven convention from the sibling calculator) matched the
//     reference's own 12-row annual schedule to the exact cent, including
//     the final row's $410.43 interest / $0.00 ending balance.
//  7. Validation, confirmed live: starting principal must be >= 0 (negative
//     rejected: "Please provide a positive starting principal value." —
//     genuinely DIFFERENT from the accumulation Annuity Calculator, which
//     accepts a negative starting principal). Years to payout (Fixed
//     Length) must be > 0. Payout amount (Fixed Payment) must be >= 0 (a
//     literal negative is rejected; zero is accepted and legitimately
//     produces the "forever" branch at $0/period). The growth rate itself
//     accepts any value, including negative, with no validation.
//  8. A genuine, different reference quirk from the accumulation Annuity
//     Calculator: the "Annuity Balances" schedule/line-chart section only
//     appears once the EFFECTIVE term exceeds 2 years (not 1) — confirmed
//     both directly (Fixed Length, years=2 hidden vs. 2.01 shown) and via
//     a SOLVED Fixed Payment duration (2.49 years shown, and separately
//     confirmed the reference's own totals table + pie chart still show
//     at years=2, only the schedule/chart section is gated on this
//     threshold).
//
// See annuity-payout-calculator-notes.md for the full worked verification.

import { periodicRateFromEAR, formatCurrency } from "./loanCalculatorEngine.js";

export { formatCurrency };

export const PAYOUT_FREQUENCY_OPTIONS = [
  { value: "annually", label: "Annually", periodsPerYear: 1 },
  { value: "semiannually", label: "Semiannually", periodsPerYear: 2 },
  { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
  { value: "monthly", label: "Monthly", periodsPerYear: 12 },
  { value: "semimonthly", label: "Semimonthly", periodsPerYear: 24 },
  { value: "biweekly", label: "Biweekly", periodsPerYear: 26 },
];
export const DEFAULT_FREQUENCY = "monthly";

const MAX_SCHEDULE_PERIODS = 12000;
const EPS = 1e-6;

export const DEFAULTS = {
  startingPrincipal: "500000",
  interestRatePercent: "6",
  yearsToPayout: "10",
  payoutAmount: "5000",
};

function findFrequency(value) {
  return PAYOUT_FREQUENCY_OPTIONS.find((o) => o.value === value) || PAYOUT_FREQUENCY_OPTIONS[3];
}

/** Confirmed live: only a literal negative starting principal is rejected
 * (zero is fine); years to payout must be strictly positive. */
export function validateFixedLengthInputs({ startingPrincipal, years }) {
  const P = Number(startingPrincipal);
  if (!isFinite(P) || P < 0) return "Please provide a positive starting principal value.";
  const y = Number(years);
  if (!isFinite(y) || y <= 0) return "Please provide a positive years to payout value.";
  return null;
}

/** Confirmed live: only a literal negative starting principal or payout
 * amount is rejected — a $0 payout is valid (produces the "forever" $0
 * branch, not an error). */
export function validateFixedPaymentInputs({ startingPrincipal, payoutAmount }) {
  const P = Number(startingPrincipal);
  if (!isFinite(P) || P < 0) return "Please provide a positive starting principal value.";
  const pmt = Number(payoutAmount);
  if (!isFinite(pmt) || pmt < 0) return "Please provide a positive payout amount value.";
  return null;
}

/** Simulates a FIXED number of exact, equal periodic withdrawals — used by
 * Fixed Length, where `PMT` is already the closed-form solution that
 * exactly zeros the balance at period `n`, so no partial final period is
 * ever needed. */
function simulatePayout({ P, periodicRate, PMT, maxPeriods }) {
  const schedule = [];
  let balance = P;
  let totalWithdrawn = 0;
  let totalInterest = 0;
  for (let period = 1; period <= maxPeriods; period++) {
    if (balance <= EPS) break;
    const interest = balance * periodicRate;
    const beginning = balance;
    balance = balance + interest - PMT;
    totalWithdrawn += PMT;
    totalInterest += interest;
    schedule.push({ period, beginning, interest, withdrawal: PMT, balance });
  }
  return { schedule, totalWithdrawn, totalInterest };
}

/** Simulates a FIXED payout amount against a depleting balance for
 * `exactPeriods` (generally fractional) periods, using the
 * fractional-final-period convention documented in finding #6 above:
 * `wholePeriods` normal withdrawals of the full `PMT`, then one final
 * period withdrawing `PMT x fraction`, with that period's interest BACKED
 * OUT of the final payment rather than computed from the balance. */
function simulateFixedPayment({ P, periodicRate, PMT, exactPeriods, maxPeriods }) {
  const wholePeriods = Math.min(maxPeriods, Math.floor(exactPeriods + EPS));
  const fraction = exactPeriods - wholePeriods;

  const schedule = [];
  let balance = P;
  let totalWithdrawn = 0;
  let totalInterest = 0;
  for (let period = 1; period <= wholePeriods; period++) {
    const interest = balance * periodicRate;
    const beginning = balance;
    balance = balance + interest - PMT;
    totalWithdrawn += PMT;
    totalInterest += interest;
    schedule.push({ period, beginning, interest, withdrawal: PMT, balance });
  }

  if (fraction > EPS && schedule.length < maxPeriods) {
    const finalPayment = PMT * fraction;
    const beginning = balance;
    const finalInterest = finalPayment - beginning;
    schedule.push({ period: wholePeriods + 1, beginning, interest: finalInterest, withdrawal: finalPayment, balance: 0 });
    totalWithdrawn += finalPayment;
    totalInterest += finalInterest;
  } else if (schedule.length) {
    schedule[schedule.length - 1].balance = 0;
  }

  return { schedule, totalWithdrawn, totalInterest };
}

/** Rolls a period-by-period schedule up into one row per year, regardless
 * of payout frequency (confirmed live for quarterly/monthly/biweekly —
 * the reference's own "Annuity Balances" table is always annual). */
function rollUpAnnual(schedule, periodsPerYear) {
  const annual = [];
  for (let i = 0; i < schedule.length; i += periodsPerYear) {
    const yearRows = schedule.slice(i, i + periodsPerYear);
    if (!yearRows.length) break;
    annual.push({
      period: annual.length + 1,
      beginning: yearRows[0].beginning,
      interest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }
  return annual;
}

/** Cumulative {year, balance, interest} points for the line chart — one
 * origin point at year 0, then one point per annual schedule row, with
 * `interest` as a RUNNING TOTAL (matches the reference's own chart
 * tooltips, which show cumulative interest/return, not each year's own
 * amount). */
function buildLineData(annualSchedule, P) {
  const points = [{ year: 0, balance: P, interest: 0 }];
  let cumulativeInterest = 0;
  for (const row of annualSchedule) {
    cumulativeInterest += row.interest;
    points.push({ year: row.period, balance: row.balance, interest: cumulativeInterest });
  }
  return points;
}

export function calculateFixedLength({ startingPrincipal, interestRatePercent, years, frequency }) {
  const P = Math.max(0, Number(startingPrincipal) || 0);
  const rate = (Number(interestRatePercent) || 0) / 100;
  const totalYears = Math.max(0, Number(years) || 0);
  const freq = findFrequency(frequency);
  const periodicRate = periodicRateFromEAR(rate, freq.periodsPerYear);
  const n = Math.min(MAX_SCHEDULE_PERIODS, Math.max(0, Math.round(totalYears * freq.periodsPerYear)));

  const payout = n <= 0 ? 0 : periodicRate === 0 ? P / n : (P * periodicRate) / (1 - Math.pow(1 + periodicRate, -n));

  const { schedule, totalWithdrawn, totalInterest } = simulatePayout({ P, periodicRate, PMT: payout, maxPeriods: n });
  // Anti-drift: the exact closed-form payout should deplete the balance to
  // precisely 0 at period n — force it, matching this app's established
  // convention elsewhere (Investment/Annuity accumulation engines).
  if (schedule.length) schedule[schedule.length - 1].balance = 0;

  const annualSchedule = rollUpAnnual(schedule, freq.periodsPerYear);
  if (annualSchedule.length) annualSchedule[annualSchedule.length - 1].balance = 0;

  return {
    mode: "fixlength",
    payout,
    frequency: freq,
    startingPrincipal: P,
    paymentCount: schedule.length,
    totalWithdrawn,
    totalInterest,
    annualSchedule,
    lineData: buildLineData(annualSchedule, P),
    isForever: false,
    showSchedule: totalYears > 2,
  };
}

export function calculateFixedPayment({ startingPrincipal, interestRatePercent, payoutAmount, frequency }) {
  const P = Math.max(0, Number(startingPrincipal) || 0);
  const rate = (Number(interestRatePercent) || 0) / 100;
  const PMT = Math.max(0, Number(payoutAmount) || 0);
  const freq = findFrequency(frequency);
  const periodicRate = periodicRateFromEAR(rate, freq.periodsPerYear);

  const isForever = PMT <= 0 || (periodicRate > 0 && PMT <= P * periodicRate);
  if (isForever) {
    return { mode: "fixpayment", payout: PMT, frequency: freq, startingPrincipal: P, isForever: true, showSchedule: false };
  }

  const exactPeriods = periodicRate === 0 ? P / PMT : -Math.log(1 - (P * periodicRate) / PMT) / Math.log(1 + periodicRate);
  const years = exactPeriods / freq.periodsPerYear;
  const maxPeriods = Math.min(MAX_SCHEDULE_PERIODS, Math.ceil(exactPeriods - EPS));

  const { schedule, totalWithdrawn, totalInterest } = simulateFixedPayment({ P, periodicRate, PMT, exactPeriods, maxPeriods });
  const annualSchedule = rollUpAnnual(schedule, freq.periodsPerYear);
  if (annualSchedule.length) annualSchedule[annualSchedule.length - 1].balance = 0;

  return {
    mode: "fixpayment",
    payout: PMT,
    frequency: freq,
    startingPrincipal: P,
    years,
    paymentCount: schedule.length,
    totalWithdrawn,
    totalInterest,
    annualSchedule,
    lineData: buildLineData(annualSchedule, P),
    isForever: false,
    showSchedule: years > 2,
  };
}
