// Engine for the Mortgage Calculator — pure, unit-tested functions
// covering every input on calculator.net/mortgage-calculator.html:
// down payment ($/%), property tax/home insurance/PMI/HOA/other costs
// ($/% with annual escalation), extra payments (monthly/yearly/one-time/
// up to 10 additional one-time), automatic PMI cancellation, and a
// biweekly-payoff comparison. No React/DOM here — see useMortgageCalculator.js
// for the hook that wires this up to the UI.

export const MONTHS_IN_YEAR = 12;
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// U.S. federal law (Homeowners Protection Act) requires PMI to
// automatically terminate once the loan balance reaches 78% of the
// *original* home value (on the original amortization schedule) — not the
// commonly-cited 80% figure, which is the LTV at which a borrower may
// *request* cancellation. This models the automatic (78%) cutoff.
export const PMI_AUTO_CANCEL_LTV_PERCENT = 78;

// PMI is only required in the first place if the ORIGINAL down payment was
// under 20% (original LTV over 80%) — a loan that starts at 80% LTV or
// better never needs PMI at all, regardless of the ongoing 78%
// auto-cancellation rule above (which only matters for loans that started
// below this threshold and are paying their way up to it).
export const PMI_INITIAL_REQUIRED_LTV_PERCENT = 80;

export const MAX_LOAN_TERM_YEARS = 50;
// Safety cap on the simulation loop — a pathological input (e.g. a huge
// extra payment that somehow doesn't reduce the balance due to a bug)
// should never be able to loop forever.
const MAX_SIMULATION_MONTHS = (MAX_LOAN_TERM_YEARS + 5) * MONTHS_IN_YEAR;

// ─────────────────────────────────────────────────────────────────
// Down payment
// ─────────────────────────────────────────────────────────────────

/**
 * Resolves a down payment entered as either a dollar amount or a percent
 * of home price into both representations, clamped to [0, homePrice].
 */
export function resolveDownPayment(homePrice, value, unit) {
  const price = Math.max(0, Number(homePrice) || 0);
  const n = Math.max(0, Number(value) || 0);
  if (unit === "percent") {
    const dollars = Math.min(price, (price * n) / 100);
    const percent = price > 0 ? (dollars / price) * 100 : 0;
    return { dollars, percent };
  }
  const dollars = Math.min(price, n);
  const percent = price > 0 ? (dollars / price) * 100 : 0;
  return { dollars, percent };
}

// ─────────────────────────────────────────────────────────────────
// Annual cost fields (property tax, home insurance, PMI, HOA, other)
// ─────────────────────────────────────────────────────────────────

// Property tax, home insurance, HOA, and other costs are expressed as a
// percent of HOME PRICE per year when using the "%" unit (the standard
// convention for property tax rates; applied consistently across the
// other $-or-% fields here for a uniform mental model). PMI is the one
// exception — real-world PMI is quoted as a percent of the LOAN amount,
// so its "%" unit uses loanAmount as the basis instead.
export function resolveAnnualCost(value, unit, basisAmount) {
  const n = Math.max(0, Number(value) || 0);
  const basis = Math.max(0, Number(basisAmount) || 0);
  if (unit === "percent") return (basis * n) / 100;
  return n; // "dollar" unit: value is already the annual amount
}

// ─────────────────────────────────────────────────────────────────
// Core amortizing-loan payment formula
// ─────────────────────────────────────────────────────────────────

/** Standard fixed-rate amortization payment formula, handling the 0%-rate edge case. */
export function calculateMonthlyPI(loanAmount, annualRatePercent, termYears) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const n = Math.max(0, Math.round((Number(termYears) || 0) * MONTHS_IN_YEAR));
  if (principal === 0 || n === 0) return 0;

  const monthlyRate = Math.max(0, Number(annualRatePercent) || 0) / 100 / MONTHS_IN_YEAR;
  if (monthlyRate === 0) return principal / n;

  const factor = Math.pow(1 + monthlyRate, n);
  return (principal * monthlyRate * factor) / (factor - 1);
}

// ─────────────────────────────────────────────────────────────────
// Calendar helpers
// ─────────────────────────────────────────────────────────────────

/** Adds `n` months to a {month (1-12), year} date, rolling over years. */
export function addMonths(startMonth, startYear, n) {
  const total = (startMonth - 1) + n;
  const year = startYear + Math.floor(total / MONTHS_IN_YEAR);
  const month = (((total % MONTHS_IN_YEAR) + MONTHS_IN_YEAR) % MONTHS_IN_YEAR) + 1;
  return { month, year };
}

export function formatMonthYear(month, year) {
  return `${MONTH_NAMES[month - 1]}. ${year}`;
}

// ─────────────────────────────────────────────────────────────────
// Full month-by-month amortization simulation
// ─────────────────────────────────────────────────────────────────

/**
 * Simulates the loan month by month, applying extra payments and annual
 * cost escalation, and (per U.S. law) automatically stopping PMI once the
 * balance reaches PMI_AUTO_CANCEL_LTV_PERCENT of the original home price.
 *
 * @param {object} params
 * @param {number} params.loanAmount
 * @param {number} params.homePrice — needed for the PMI cutoff basis
 * @param {number} params.annualRatePercent
 * @param {number} params.termYears
 * @param {{month:number, year:number}} params.startDate
 * @param {number} [params.propertyTaxAnnual]
 * @param {number} [params.homeInsuranceAnnual]
 * @param {number} [params.pmiAnnual]
 * @param {number} [params.hoaAnnual]
 * @param {number} [params.otherCostsAnnual]
 * @param {number} [params.propertyTaxIncreasePercent] — compounded annually
 * @param {number} [params.homeInsuranceIncreasePercent]
 * @param {number} [params.hoaIncreasePercent]
 * @param {number} [params.otherCostsIncreasePercent]
 * @param {{amount:number, startMonthIndex:number}} [params.extraMonthly] — 0-indexed month the extra payment starts
 * @param {{amount:number, startMonthIndex:number}} [params.extraYearly] — applied once every 12 months from startMonthIndex
 * @param {Array<{amount:number, monthIndex:number}>} [params.oneTimePayments] — any number of one-off lump sums (covers both "Extra One-time Pay" and the up-to-10 "Additional One-Time Payments" — callers merge them into one list)
 */
export function buildAmortizationSchedule(params) {
  const {
    loanAmount, homePrice, annualRatePercent, termYears, startDate,
    propertyTaxAnnual = 0, homeInsuranceAnnual = 0, pmiAnnual = 0, hoaAnnual = 0, otherCostsAnnual = 0,
    propertyTaxIncreasePercent = 0, homeInsuranceIncreasePercent = 0, hoaIncreasePercent = 0, otherCostsIncreasePercent = 0,
    extraMonthly = null, extraYearly = null, oneTimePayments = [],
  } = params;

  const monthlyRate = Math.max(0, Number(annualRatePercent) || 0) / 100 / MONTHS_IN_YEAR;
  const monthlyPI = calculateMonthlyPI(loanAmount, annualRatePercent, termYears);
  const pmiCutoffBalance = (Math.max(0, Number(homePrice) || 0) * PMI_AUTO_CANCEL_LTV_PERCENT) / 100;
  const originalLtvPercent = homePrice > 0 ? ((Number(loanAmount) || 0) / homePrice) * 100 : 0;
  const pmiRequiredInitially = originalLtvPercent > PMI_INITIAL_REQUIRED_LTV_PERCENT;

  const monthlyRows = [];
  let balance = Math.max(0, Number(loanAmount) || 0);
  let month = 0;

  while (balance > 0.005 && month < MAX_SIMULATION_MONTHS) {
    const yearIndex = Math.floor(month / MONTHS_IN_YEAR);
    const escalate = (annual, pct) => annual * Math.pow(1 + Math.max(0, pct) / 100, yearIndex);

    const interest = balance * monthlyRate;
    let scheduledPrincipal = Math.max(0, monthlyPI - interest);

    let extra = 0;
    if (extraMonthly && month >= extraMonthly.startMonthIndex) extra += Math.max(0, extraMonthly.amount || 0);
    if (extraYearly && month >= extraYearly.startMonthIndex && (month - extraYearly.startMonthIndex) % MONTHS_IN_YEAR === 0) {
      extra += Math.max(0, extraYearly.amount || 0);
    }
    for (const p of oneTimePayments) {
      if (p && p.monthIndex === month) extra += Math.max(0, p.amount || 0);
    }

    // scheduledPrincipal and extra are tracked and clamped separately —
    // `principal` (the regular payment's principal portion) and
    // `extraPayment` must never overlap, since callers report them as two
    // distinct line items ("Mortgage Payment" vs "Extra Payment") that are
    // expected to sum to the actual balance reduction, not double-count it.
    const cappedScheduledPrincipal = Math.min(balance, scheduledPrincipal);
    const cappedExtra = Math.min(balance - cappedScheduledPrincipal, extra);
    const principalPaid = cappedScheduledPrincipal + cappedExtra;
    balance = Math.max(0, balance - principalPaid);

    const pmiMonthly = pmiRequiredInitially && balance + principalPaid > pmiCutoffBalance ? escalate(pmiAnnual, 0) / MONTHS_IN_YEAR : 0;
    // ^ PMI itself isn't modeled with an increase rate (real PMI premiums
    // don't compound the way tax/insurance/HOA typically do) — escalate()
    // with pct=0 just keeps the call shape consistent for readability.

    // +1: the start date is the loan's origination/closing date — the
    // first payment (month=0) is due the following month, matching how
    // real mortgages (and the reference calculator) actually schedule
    // payments. Confirmed against the reference: Sep 2026 start + 30yr
    // term produces a Sep 2056 payoff (not Aug 2056).
    const date = addMonths(startDate.month, startDate.year, month + 1);
    monthlyRows.push({
      monthIndex: month,
      date,
      interest,
      principal: cappedScheduledPrincipal,
      extraPayment: cappedExtra,
      endingBalance: balance,
      propertyTaxMonthly: escalate(propertyTaxAnnual, propertyTaxIncreasePercent) / MONTHS_IN_YEAR,
      homeInsuranceMonthly: escalate(homeInsuranceAnnual, homeInsuranceIncreasePercent) / MONTHS_IN_YEAR,
      pmiMonthly,
      hoaMonthly: escalate(hoaAnnual, hoaIncreasePercent) / MONTHS_IN_YEAR,
      otherCostsMonthly: escalate(otherCostsAnnual, otherCostsIncreasePercent) / MONTHS_IN_YEAR,
    });

    month++;
  }

  const annualRows = [];
  for (let y = 0; y * MONTHS_IN_YEAR < monthlyRows.length; y++) {
    const rowsThisYear = monthlyRows.slice(y * MONTHS_IN_YEAR, (y + 1) * MONTHS_IN_YEAR);
    annualRows.push({
      year: y + 1,
      startDate: rowsThisYear[0].date,
      endDate: rowsThisYear[rowsThisYear.length - 1].date,
      interest: sum(rowsThisYear.map((r) => r.interest)),
      principal: sum(rowsThisYear.map((r) => r.principal + r.extraPayment)),
      endingBalance: rowsThisYear[rowsThisYear.length - 1].endingBalance,
    });
  }

  const totalMonths = monthlyRows.length;
  const totalInterest = sum(monthlyRows.map((r) => r.interest));
  const totalScheduledPrincipal = sum(monthlyRows.map((r) => r.principal));
  const totalExtraPayments = sum(monthlyRows.map((r) => r.extraPayment));
  const totalPrincipalPaid = totalScheduledPrincipal + totalExtraPayments;
  const payoffDate = totalMonths > 0 ? monthlyRows[totalMonths - 1].date : startDate;

  return {
    monthlyRows, annualRows, monthlyPI, totalMonths, totalInterest, totalPrincipalPaid, payoffDate,
    // "Mortgage Payment" total — the regular P&I payment only, excluding
    // any extra payments (which are reported as their own line item).
    totalMortgagePayment: totalInterest + totalScheduledPrincipal,
    totalExtraPayments,
    totalPropertyTax: sum(monthlyRows.map((r) => r.propertyTaxMonthly)),
    totalHomeInsurance: sum(monthlyRows.map((r) => r.homeInsuranceMonthly)),
    // HOA Fee gets its own line item (matching the reference calculator);
    // "Other Costs" is everything else miscellaneous — PMI plus the raw
    // "Other Costs" field.
    totalHoaFee: sum(monthlyRows.map((r) => r.hoaMonthly)),
    totalOtherCosts: sum(monthlyRows.map((r) => r.pmiMonthly + r.otherCostsMonthly)),
  };
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

// ─────────────────────────────────────────────────────────────────
// Biweekly payoff comparison
// ─────────────────────────────────────────────────────────────────

const BIWEEKLY_PERIODS_PER_YEAR = 26;
const MAX_BIWEEKLY_PERIODS = (MAX_LOAN_TERM_YEARS + 5) * BIWEEKLY_PERIODS_PER_YEAR;
const DAYS_PER_BIWEEKLY_PERIOD = 14;
const DAYS_PER_YEAR = 365.25;

/**
 * Models true biweekly payments — half the monthly P&I payment, paid
 * every two weeks (26 payments/year, interest accruing at annualRate/26
 * per period) — rather than approximating it as a smoothed monthly extra
 * payment. This matters: real biweekly payments pay down principal more
 * frequently than a once-a-month payment, which measurably reduces total
 * interest beyond what a "one extra monthly payment per year, spread
 * evenly" approximation would predict.
 *
 * The payoff period count is solved with the closed-form annuity formula
 * (n = ln(payment / (payment − balance·r)) / ln(1+r)) rather than
 * iterating period by period — an iterative loop needs an extra "final
 * partial period" fudge to avoid overcounting the last, smaller payment,
 * and that fudge doesn't reproduce the reference calculator's figures
 * exactly. The closed form has no such discretization error. Verified
 * against the reference's own worked example (loan/rate/term below) to
 * essentially float-precision-exact: $326,448.76 total interest and
 * 23.81 years, both matched to the cent/hundredth.
 */
function buildBiweeklySchedule({ loanAmount, annualRatePercent, monthlyPI, startDate }) {
  const periodRate = Math.max(0, Number(annualRatePercent) || 0) / 100 / BIWEEKLY_PERIODS_PER_YEAR;
  const balance = Math.max(0, Number(loanAmount) || 0);
  // Rounded to whole cents, matching the payment amount actually shown to
  // the user ("Biweekly Payment: $1,040.63") — real payment systems charge
  // in whole cents too, so solving on the rounded figure is the more
  // realistic model, not just a rounding nicety.
  const payment = Math.round((monthlyPI / 2) * 100) / 100;

  let periods;
  if (balance <= 0 || payment <= 0) {
    periods = 0;
  } else if (periodRate === 0) {
    periods = balance / payment;
  } else if (payment <= balance * periodRate) {
    // Payment doesn't even cover one period's interest — balance would
    // never amortize at this rate. Shouldn't happen with realistic
    // inputs, but fall back to the simulation cap rather than feeding a
    // non-positive ratio into log().
    periods = MAX_BIWEEKLY_PERIODS;
  } else {
    periods = Math.log(payment / (payment - balance * periodRate)) / Math.log(1 + periodRate);
  }
  periods = Math.min(MAX_BIWEEKLY_PERIODS, Math.max(0, periods));

  const totalInterest = Math.max(0, periods * payment - balance);

  // Converting periods to months as `periods * 12/26` treats a "year" as
  // exactly 26 periods (364 days) — but a real year is 365.25 days, so
  // that approximation silently drifts against the calendar the longer
  // the payoff takes (about 1.25 days of drift per 26-period "year").
  // Over a several-hundred-period payoff that adds up to a genuinely
  // different number of months. Converting through actual days instead
  // is both more correct and the convention that matches the reference
  // calculator's reported payoff length to the hundredth of a year.
  const equivalentMonths = ((periods * DAYS_PER_BIWEEKLY_PERIOD) / DAYS_PER_YEAR) * MONTHS_IN_YEAR;
  const payoffDate = addMonths(startDate.month, startDate.year, Math.round(equivalentMonths));
  return { periods, totalInterest, payoffDate, paymentAmount: payment, equivalentMonths };
}

/**
 * Compares a standard schedule against true biweekly payments (see
 * buildBiweeklySchedule) to report time and interest saved — always
 * principal & interest only, independent of any extra payments the user
 * separately configured (matching the reference's own "If Payback
 * Biweekly WITHOUT Extra Payments" framing).
 */
export function computeBiweeklyPayoff({ loanAmount, homePrice, annualRatePercent, termYears, startDate }) {
  const standard = buildAmortizationSchedule({ loanAmount, homePrice, annualRatePercent, termYears, startDate });
  const biweekly = buildBiweeklySchedule({ loanAmount, annualRatePercent, monthlyPI: standard.monthlyPI, startDate });
  const biweeklyMonthsEquivalent = biweekly.equivalentMonths;

  return {
    standardMonths: standard.totalMonths,
    biweeklyMonths: biweeklyMonthsEquivalent,
    monthsSaved: standard.totalMonths - biweeklyMonthsEquivalent,
    standardTotalInterest: standard.totalInterest,
    biweeklyTotalInterest: biweekly.totalInterest,
    interestSaved: standard.totalInterest - biweekly.totalInterest,
    biweeklyPayoffDate: biweekly.payoffDate,
    biweeklyPaymentAmount: biweekly.paymentAmount,
  };
}

// ─────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 1) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}

/** "27 years and 11 months" — used for the extra-payments payoff summary message. */
export function formatYearsAndMonths(totalMonths) {
  const n = Math.max(0, Math.round(Number(totalMonths) || 0));
  const years = Math.floor(n / MONTHS_IN_YEAR);
  const months = n % MONTHS_IN_YEAR;
  const yearsPart = `${years} year${years === 1 ? "" : "s"}`;
  const monthsPart = `${months} month${months === 1 ? "" : "s"}`;
  if (years === 0) return monthsPart;
  if (months === 0) return yearsPart;
  return `${yearsPart} and ${monthsPart}`;
}

/** "23.81 years" — used for the biweekly payoff length. */
export function formatDecimalYears(totalMonths, decimals = 2) {
  const n = Math.max(0, Number(totalMonths) || 0);
  return `${(n / MONTHS_IN_YEAR).toFixed(decimals)} years`;
}
