// IRA Calculator engine — matches calculator.net/ira-calculator.html.
//
// Compares the same pre-tax savings in three accounts, one row per year of
// age from the current age up to (not including) the retirement age, both
// rounded half-up first (shared with the Roth IRA Calculator):
//   Traditional/SIMPLE/SEP (before tax): end = start × (1 + r) + c
//   Traditional (after tax):             the before-tax column × (1 − retirement tax)
//   Roth IRA (after tax):                starts at balance × (1 − current tax);
//                                        end = start × (1 + r) + c × (1 − current tax)
//   Regular taxable savings:             same start and contribution as the Roth,
//                                        growing at r × (1 − current tax)
// Contributions land at the END of each year. Unlike the Roth IRA
// Calculator there is no contribution cap here (confirmed live), even
// though its tooltip quotes $7,000/$8,000 limits.
//
// The summary picks one of three sentences by comparing the Traditional
// after-tax balance with the Roth's; the reference's own wording differs
// between them ("after-tax" vs "after tax"), copied verbatim. The second
// figure can be negative ("$-159,952" at a 0% current tax rate).
//
// Chart quirk replicated: every line except "before tax" starts at
// balance × (1 − current tax), even Principal and Traditional (after tax).
// The graph is only drawn for spans of 4+ years.
//
// Validation (reference order, all fields required): balance ≥ 0,
// contribution > 0, return 0…1000, current age ≥ 0, retirement age 0…120,
// both tax rates 0…99; then the rounded ages must be in order (the
// reference's ungrammatical message is copied verbatim).

import { parseNumber, roundAge, formatDollars } from "./rothIraCalculatorEngine.js";

export { formatDollars };

export const DEFAULTS = { balance: "30000", contribution: "7500", rate: "6", currentAge: "30", retirementAge: "65", taxNow: "25", taxRetirement: "15" };

const MESSAGES = {
  balance: "Please provide a positive current balance.",
  contribution: "Please provide a positive annual contribution.",
  rate: "Please provide a positive annual investment return rate value.",
  currentAge: "Please provide a positive current age value.",
  retirementAge: "Please provide a positive retirement age value.",
  taxNow: "Please provide a positive marginal tax rate now value.",
  taxRetirement: "Please provide a positive marginal tax rate after retirement value.",
  ageOrder: "Please provide a current age should be lower than retirement age.",
};

const TRAD = "Traditional, SIMPLE, or SEP IRA";

function summary(tradAfter, roth, taxable, age) {
  const $ = formatDollars;
  if (Math.abs(tradAfter - roth) < 0.005) {
    return [
      `A ${TRAD} account can accumulate the same after tax balance as a Roth IRA account at age ${age}.`,
      `They both can accumulate ${$(roth - taxable)} more than a regular taxable savings account.`,
    ];
  }
  if (tradAfter > roth) {
    return [
      `A ${TRAD} account can accumulate ${$(tradAfter - roth)} more after-tax balance than a Roth IRA account at age ${age}.`,
      `A Roth IRA account can accumulate ${$(roth - taxable)} more than a regular taxable savings account.`,
    ];
  }
  return [
    `A Roth IRA account can accumulate ${$(roth - tradAfter)} more after tax balance than a ${TRAD} account at age ${age}.`,
    `A ${TRAD} account can accumulate ${$(tradAfter - taxable)} more than a regular taxable savings account.`,
  ];
}

export function calculateIra(input) {
  const v = Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, parseNumber(input[k])]));
  const errors = [];
  if (!(v.balance >= 0)) errors.push(MESSAGES.balance);
  if (!(v.contribution > 0)) errors.push(MESSAGES.contribution);
  if (!(v.rate >= 0 && v.rate <= 1000)) errors.push(MESSAGES.rate);
  if (!(v.currentAge >= 0)) errors.push(MESSAGES.currentAge);
  if (!(v.retirementAge >= 0 && v.retirementAge <= 120)) errors.push(MESSAGES.retirementAge);
  if (!(v.taxNow >= 0 && v.taxNow <= 99)) errors.push(MESSAGES.taxNow);
  if (!(v.taxRetirement >= 0 && v.taxRetirement <= 99)) errors.push(MESSAGES.taxRetirement);
  if (errors.length) return { errors };

  const startAge = roundAge(v.currentAge);
  const endAge = roundAge(v.retirementAge);
  if (startAge >= endAge) return { errors: [MESSAGES.ageOrder] };

  const r = v.rate / 100;
  const tNow = v.taxNow / 100;
  const tRet = v.taxRetirement / 100;
  const c = v.contribution;
  const cAfterTax = c * (1 - tNow);

  const rows = [];
  let before = v.balance;
  let roth = v.balance * (1 - tNow);
  let taxable = roth;
  let principal = v.balance;
  for (let age = startAge; age < endAge; age++) {
    const row = {
      age,
      beforeStart: before, beforeEnd: before * (1 + r) + c,
      rothStart: roth, rothEnd: roth * (1 + r) + cAfterTax,
      taxableStart: taxable, taxableEnd: taxable * (1 + r * (1 - tNow)) + cAfterTax,
    };
    row.afterStart = row.beforeStart * (1 - tRet);
    row.afterEnd = row.beforeEnd * (1 - tRet);
    rows.push(row);
    before = row.beforeEnd;
    roth = row.rothEnd;
    taxable = row.taxableEnd;
    principal += c;
  }

  const tradAfter = before * (1 - tRet);
  const firstAfterTax = v.balance * (1 - tNow);
  const series = (label, color, first, pick) => ({
    label, color, points: [{ x: startAge, y: first }, ...rows.map((row, i) => ({ x: row.age + 1, y: pick(row, i) }))],
  });

  return {
    retirementAge: endAge,
    balances: { traditional: before, roth, taxable },
    afterTax: { traditional: tradAfter, roth, taxable },
    sentences: summary(tradAfter, roth, taxable, endAge),
    rows,
    showChart: rows.length >= 4,
    chart: [
      series("Traditional/SIMPLE/SEP IRA (before tax)", "#2b7ddb", v.balance, (row) => row.beforeEnd),
      series("Traditional/SIMPLE/SEP IRA (after tax)", "#8bbc21", firstAfterTax, (row) => row.afterEnd),
      series("Roth IRA (after tax)", "#910000", firstAfterTax, (row) => row.rothEnd),
      series("Regular taxable savings (after tax)", "#1aadce", firstAfterTax, (row) => row.taxableEnd),
      series("Principal", "#492970", firstAfterTax, (_, i) => v.balance + c * (i + 1)),
    ],
    principal,
  };
}
