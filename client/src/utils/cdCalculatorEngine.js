// CD Calculator engine — matches calculator.net/cd-calculator.html.
//
// The math is the already-verified Savings Calculator engine with no
// contributions (calculateSavings is called directly): everything runs on a
// monthly grid, the chosen compounding is bridged to an equivalent monthly
// rate through the effective annual rate, tax is deducted from each month's
// interest, and a fractional final month uses (1 + r)^fraction − 1. Checked
// against 50 random live scenarios (all 5 compounding options, tax,
// fractional months): every headline, monthly row and annual row matched.
//
// CD-specific rules, all confirmed live via GET:
//  - Term = years + months/12. Blank years/months count as 0. Each field
//    must be 0…1000 (they are capped separately, so 1000 years + 1000
//    months is allowed), and the total must be > 0.
//  - Errors, in the reference's order: deposit, rate, years, months, tax.
//    "deposit length" is only reported when every other field is valid.
//    The deposit may be negative or 0 (computed as entered); the rate must
//    be ≥ 0; the tax must be 0…100 and cannot be blank.
//  - Schedules appear only for 1 < total months ≤ 1200. At ≤ 12 months
//    there is just a monthly table (no Annual/Monthly toggle) and the bar
//    chart shows months; otherwise the bars are per year.
//  - Charts need a deposit > 0. With tax, the pie is Initial deposit /
//    Interest after tax / Tax and the bars say "Interest after tax".
//  - Non-annual compounding adds a footnote that echoes the rate as typed:
//    "* interest rate of 5.50% compound monthly is equivalent to annual
//    rate of 5.641%".

import { calculateSavings } from "./savingsCalculatorEngine.js";
import { effectiveAnnualRate } from "./loanCalculatorEngine.js";
import { cleanInput, toNumber, formatMoney } from "./simpleInterestCalculatorEngine.js";

export { formatMoney };

export const DEFAULTS = { deposit: "10000", rate: "5", years: "3", months: "0", tax: "0" };

export const COMPOUND_OPTIONS = [
  { value: "annually", label: "annually (APY)" },
  { value: "semiannually", label: "semiannually" },
  { value: "quarterly", label: "quarterly" },
  { value: "monthly", label: "monthly (APR)" },
  { value: "continuously", label: "continuously" },
];

const MAX_FIELD = 1000;
const MAX_SCHEDULE_MONTHS = 1200;

const MESSAGES = {
  deposit: "Please provide a positive initial deposit amount.",
  rate: "Please provide a positive interest rate value.",
  years: "Please provide a positive holding years value.",
  months: "Please provide a positive holding months value.",
  tax: "Please provide a positive tax rate value.",
  length: "Please provide a positive deposit length value.",
};

/** Years/months: blank → 0; otherwise a number in [0, 1000]. */
function parseLength(text) {
  if (text === "") return 0;
  const n = toNumber(text);
  return n >= 0 && n <= MAX_FIELD ? n : NaN;
}

export function calculateCd({ deposit, rate, compound = "annually", years, months, tax }) {
  const text = {
    deposit: cleanInput(deposit), rate: cleanInput(rate),
    years: cleanInput(years), months: cleanInput(months), tax: cleanInput(tax),
  };
  const P = toNumber(text.deposit);
  const ratePercent = toNumber(text.rate);
  const y = parseLength(text.years);
  const m = parseLength(text.months);
  const taxPercent = toNumber(text.tax);

  const errors = [];
  if (Number.isNaN(P)) errors.push(MESSAGES.deposit);
  if (!(ratePercent >= 0)) errors.push(MESSAGES.rate);
  if (Number.isNaN(y)) errors.push(MESSAGES.years);
  if (Number.isNaN(m)) errors.push(MESSAGES.months);
  if (!(taxPercent >= 0 && taxPercent <= 100)) errors.push(MESSAGES.tax);
  if (!errors.length && y * 12 + m <= 0) errors.push(MESSAGES.length);
  if (errors.length) return { errors };

  const totalMonths = y * 12 + m;
  const s = calculateSavings({
    initialDeposit: P, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: ratePercent, compound, years: totalMonths / 12, taxRatePercent: taxPercent,
    maxYears: Infinity,
  });

  const hasTax = s.hasTax;
  const interestLabel = hasTax ? "Interest after tax" : "Interest";
  const showSchedule = totalMonths > 1 && totalMonths <= MAX_SCHEDULE_MONTHS;
  const monthlyOnly = totalMonths <= 12;

  // Bars show the balance's make-up at the end of each year (or month).
  const barRows = monthlyOnly ? s.monthlySchedule : s.annualSchedule;
  const bars = barRows.map((row) => ({
    year: row.period, startingAmount: P, contributions: 0, interest: row.balance - P, total: row.balance,
  }));
  // Evenly spaced bars; every bar labelled up to 12, then thinned (the
  // reference labels 2, 4, 6 for a 6-month CD — label density is cosmetic).
  const labelStep = bars.length <= 12 ? 1 : Math.ceil(bars.length / 10);
  const barTickLabels = bars.map((bar) => (bar.year % labelStep === 0 || bars.length <= 12 ? String(bar.year) : null));

  const pie = [
    { label: "Initial deposit", value: P, color: "#2b7ddb" },
    { label: interestLabel, value: s.totalInterestAfterTax, color: "#8bbc21" },
    ...(hasTax ? [{ label: "Tax", value: s.totalTax, color: "#910000" }] : []),
  ];

  const footnote = compound === "annually" ? null
    : `* interest rate of ${text.rate}% compound ${compound} is equivalent to annual rate of ${(effectiveAnnualRate(ratePercent / 100, compound) * 100).toFixed(3)}%`;

  return {
    endBalance: s.endingBalance,
    totalInterest: s.totalInterestGross,
    totalTax: s.totalTax,
    interestAfterTax: s.totalInterestAfterTax,
    hasTax,
    interestLabel,
    footnote,
    showCharts: P > 0,
    pie,
    bars,
    barTickLabels,
    barUnit: monthlyOnly ? "Month" : "Year",
    schedule: showSchedule ? {
      monthlyOnly,
      monthly: s.monthlySchedule,
      annual: monthlyOnly ? null : s.annualSchedule,
    } : null,
  };
}
