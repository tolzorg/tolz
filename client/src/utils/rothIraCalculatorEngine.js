// Roth IRA Calculator engine — matches calculator.net/roth-ira-calculator.html.
//
// Yearly model, one row per year of age from the current age up to (not
// including) the retirement age, both rounded half-up first:
//   Roth IRA:        end = start × (1 + r) + contribution
//   Taxable account: end = start × (1 + r × (1 − tax)) + contribution,
//                    where the year's tax = start × r × tax
//   Principal:       end = start + contribution
// The contribution lands at the END of the year (no growth that year).
//
// Contribution limits (confirmed live):
//  - "Maximize contributions" = Yes: each year uses the IRS limit for that
//    year's age ($7,500 under 50, $8,600 from 50); the amount field is
//    ignored.
//  - Otherwise the entered amount is capped ONCE, at the limit for the
//    CURRENT age, and that capped amount is used every year (even after
//    turning 50). When capped, the reference shows a notice quoting the
//    limit without a comma ("$7500").
//
// Reference quirks replicated as-is:
//  - Roth "Total interest" = balance − principal + the LAST year's
//    contribution (so a 0% return still shows $7,500 of interest). The
//    taxable account's figure is correct: balance − principal + total tax.
//  - Its two tooltips disagree on the limits ($7,500/$8,600 vs
//    $7,000/$8,000); the math uses $7,500/$8,600.
//
// Validation, in the reference's order: balance ≥ 0, contribution ≥ 0
// (skipped when maximizing), return 0…1000, current age ≥ 0, retirement
// age 0…120, tax 0…99 — blank is an error for all of them. Then the
// rounded current age must be below the rounded retirement age.

export const DEFAULTS = { balance: "30000", contribution: "7500", rate: "6", currentAge: "30", retirementAge: "65", tax: "25" };

const LIMIT_UNDER_50 = 7500;
const LIMIT_50_PLUS = 8600;
const limitForAge = (age) => (age >= 50 ? LIMIT_50_PLUS : LIMIT_UNDER_50);

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
export function parseNumber(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return Number.isFinite(n) ? n : NaN;
}
/** PHP-style round half away from zero (ages are rounded before use). */
export const roundAge = (x) => Math.sign(x) * Math.round(Math.abs(x));

const MESSAGES = {
  balance: "Please provide a positive current balance.",
  contribution: "Please provide a positive annual contribution.",
  rate: "Please provide a positive expected investment return rate value.",
  currentAge: "Please provide a positive current age value.",
  retirementAge: "Please provide a positive retirement age value.",
  tax: "Please provide a positive marginal tax rate value.",
  ageOrder: "Current age should be lower than retirement age.",
};

export function calculateRothIra({ balance, contribution, maximize = false, rate, currentAge, retirementAge, tax }) {
  const v = {
    balance: parseNumber(balance), contribution: parseNumber(contribution), rate: parseNumber(rate),
    currentAge: parseNumber(currentAge), retirementAge: parseNumber(retirementAge), tax: parseNumber(tax),
  };
  const errors = [];
  if (!(v.balance >= 0)) errors.push(MESSAGES.balance);
  if (!maximize && !(v.contribution >= 0)) errors.push(MESSAGES.contribution);
  if (!(v.rate >= 0 && v.rate <= 1000)) errors.push(MESSAGES.rate);
  if (!(v.currentAge >= 0)) errors.push(MESSAGES.currentAge);
  if (!(v.retirementAge >= 0 && v.retirementAge <= 120)) errors.push(MESSAGES.retirementAge);
  if (!(v.tax >= 0 && v.tax <= 99)) errors.push(MESSAGES.tax);
  if (errors.length) return { errors };

  const startAge = roundAge(v.currentAge);
  const endAge = roundAge(v.retirementAge);
  if (startAge >= endAge) return { errors: [MESSAGES.ageOrder] };

  const r = v.rate / 100;
  const t = v.tax / 100;
  const cap = limitForAge(startAge);
  const capped = !maximize && v.contribution > cap;
  const fixedContribution = Math.min(v.contribution, cap);

  const rows = [];
  let principal = v.balance;
  let roth = v.balance;
  let taxable = v.balance;
  let totalTax = 0;
  let lastContribution = 0;
  for (let age = startAge; age < endAge; age++) {
    const c = maximize ? limitForAge(age) : fixedContribution;
    const yearTax = taxable * r * t;
    const row = {
      age,
      principalStart: principal, principalEnd: principal + c,
      rothStart: roth, rothEnd: roth * (1 + r) + c,
      taxableStart: taxable, taxableEnd: taxable * (1 + r * (1 - t)) + c,
    };
    rows.push(row);
    principal = row.principalEnd;
    roth = row.rothEnd;
    taxable = row.taxableEnd;
    totalTax += yearTax;
    lastContribution = c;
  }

  return {
    retirementAge: endAge,
    notice: capped
      ? `The annual contribution is higher than the limit imposed by the IRS for the age, which is $${cap}. As a result, the calculator used the adjusted contribution amount to meet the IRS requirement.`
      : null,
    roth: { balance: roth, principal, interest: roth - principal + lastContribution, tax: 0 },
    taxable: { balance: taxable, principal, interest: taxable - principal + totalTax, tax: totalTax },
    advantage: roth - taxable,
    rows,
    // The reference only draws the graph for spans of 4+ years.
    showChart: rows.length >= 4,
    chart: [
      { label: "Roth IRA", color: "#2b7ddb", points: [{ x: startAge, y: v.balance }, ...rows.map((row) => ({ x: row.age + 1, y: row.rothEnd }))] },
      { label: "Taxable account", color: "#8bbc21", points: [{ x: startAge, y: v.balance }, ...rows.map((row) => ({ x: row.age + 1, y: row.taxableEnd }))] },
      { label: "Principal", color: "#910000", points: [{ x: startAge, y: v.balance }, ...rows.map((row) => ({ x: row.age + 1, y: row.principalEnd }))] },
    ],
  };
}

/** Whole-dollar money, reference style ("$1,066,343", "$-5"). */
export function formatDollars(value) {
  const rounded = Math.round(Number(Math.abs(value).toPrecision(15)));
  const s = rounded.toLocaleString("en-US");
  return value < 0 && rounded !== 0 ? `$-${s}` : `$${s}`;
}
