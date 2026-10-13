// Business Loan Calculator engine — matches calculator.net/business-loan-calculator.html
// (a GET form, decoded with live probes; see scripts/business-loan-calculator.test.js).
//
// The loan itself is the Loan Calculator's general-annuity method: the
// nominal rate at its compounding becomes an effective annual rate, then
// the rate per payment period. Pay back "Every Day" uses 365.25 periods a
// year, and the period count n = periods/year × term is NOT rounded: the
// payment uses the fractional n, the total is payment × n, and the row
// reads "Total of ⌈n⌉ loan payments". "Interest Only" pays monthly
// interest and the principal at the end; "In the End" repays one lump sum.
//
// Fees (origination % of the loan + documentation + other) add the
// "Interest + fee" and "Real rate" rows. The real rate is the IRR of the
// money actually received (loan − fees) against the payments, expressed in
// the chosen compounding's convention ("Real rate (APR)" for monthly,
// "(APY)" for annually, "compound quarterly" ...). Quirk kept: for
// continuous compounding the reference shows the effective annual rate.
// The reference's own rate solver is approximate (up to ±0.003 points for
// schedules of 60+ payments) and hides the row for some short, very
// high-fee loans; this engine solves exactly and shows it whenever the
// money received is positive.

import { COMPOUND_OPTIONS, effectiveAnnualRate, periodicRateFromEAR } from "./loanCalculatorEngine.js";
import { clean, num, formatFixed } from "./marginCalculatorEngine.js";

export { COMPOUND_OPTIONS };

export const PAYBACK_OPTIONS = [
  { value: "daily", label: "Every Day", phrase: "every day", periodsPerYear: 365.25 },
  { value: "weekly", label: "Every Week", phrase: "every week", periodsPerYear: 52 },
  { value: "biweekly", label: "Every 2 Weeks", phrase: "every two weeks", periodsPerYear: 26 },
  { value: "halfmonth", label: "Every Half Month", phrase: "every half month", periodsPerYear: 24 },
  { value: "month", label: "Every Month", phrase: "every month", periodsPerYear: 12 },
  { value: "quarter", label: "Every Quarter", phrase: "every quarter", periodsPerYear: 4 },
  { value: "halfyear", label: "Every 6 Months", phrase: "every 6 months", periodsPerYear: 2 },
  { value: "year", label: "Every Year", phrase: "every year", periodsPerYear: 1 },
  { value: "interest", label: "Interest Only" },
  { value: "end", label: "In the End" },
];

export const BUSINESS_LOAN_DEFAULTS = {
  loanAmount: "10000", interestRate: "10", compound: "monthly", years: "5", months: "0",
  payback: "month", originationFee: "5", documentationFee: "750", otherFees: "0",
};

/** How the real rate is labelled and expressed for each compounding. */
const REAL_RATE = {
  annually: { label: "Real rate (APY)", m: 1 },
  semiannually: { label: "Real rate compound semi-annually", m: 2 },
  quarterly: { label: "Real rate compound quarterly", m: 4 },
  monthly: { label: "Real rate (APR)", m: 12 },
  semimonthly: { label: "Real rate compound semi-monthly", m: 24 },
  biweekly: { label: "Real rate compound biweekly", m: 26 },
  weekly: { label: "Real rate compound weekly", m: 52 },
  daily: { label: "Real rate compound daily", m: 365.25 },
  continuously: { label: "Real rate compound continuously", m: 1 },
};

/** The Loan Calculator's EAR, except that "Daily" compounding here uses 365.25 days a year. */
function annualRate(rate, compound) {
  return compound === "daily" ? Math.pow(1 + rate / 365.25, 365.25) - 1 : effectiveAnnualRate(rate, compound);
}

const money = (v) => `$${formatFixed(v, 2)}`;
const isWhole = (x) => Math.abs(x - Math.round(x)) < 1e-9;
// The reference hands its table the rate and payment as PHP prints them: 14 significant digits.
const php14 = (x) => Number(x.toPrecision(14));

/** Present value of `count` (possibly fractional) level payments at rate i per period. */
function annuityPV(payment, i, count) {
  return i === 0 ? payment * count : (payment * (1 - Math.pow(1 + i, -count))) / i;
}

/** Periodic rate j with pv(j) = target, pv decreasing in j; null when out of range. */
function solveRate(pv, target) {
  let lo = -0.999999;
  let hi = 1;
  while (pv(hi) > target) { hi *= 2; if (hi > 1e6) return null; }
  if (pv(lo) < target) return null;
  for (let k = 0; k < 300; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function realRateText(ear, compound) {
  const { m } = REAL_RATE[compound];
  const rate = compound === "continuously" || m === 1 ? ear : m * (Math.pow(1 + ear, 1 / m) - 1);
  return `${formatFixed(rate * 100, 3)}%`;
}

export function calculateBusinessLoan(input) {
  const text = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, clean(v)]));
  const P = num(text.loanAmount);
  const ratePct = num(text.interestRate);
  const years = text.years === "" ? 0 : num(text.years);
  const months = text.months === "" ? 0 : num(text.months);
  const fee = (key) => (text[key] === "" ? 0 : num(text[key]));
  const orig = fee("originationFee");
  const doc = fee("documentationFee");
  const other = fee("otherFees");

  const errors = [];
  if (!(P > 0)) errors.push("Please provide a positive loan amount.");
  if (!(ratePct >= 0)) errors.push("Please provide a positive interest rate value.");
  if (!(years >= 0)) errors.push("Please provide a positive loan term year value.");
  if (!(months >= 0)) errors.push("Please provide a positive loan term month value.");
  if (!(orig >= 0)) errors.push("Please provide a postivie origination fee amount.");
  if (!(doc >= 0)) errors.push("Please provide a postivie documentation fee amount.");
  if (!(other >= 0)) errors.push("Please provide a postivie other fee amount.");
  if (errors.length) return { errors };
  const termYears = years + months / 12;
  if (!(termYears > 0)) return { errors: ["Please provide a positive loan term."] };

  const compound = REAL_RATE[input.compound] ? input.compound : "monthly";
  const ear = annualRate(ratePct / 100, compound);
  const totalFee = (P * orig) / 100 + doc + other;
  const net = P - totalFee;
  const payback = PAYBACK_OPTIONS.find((o) => o.value === input.payback) || PAYBACK_OPTIONS[4];

  let head = null;
  let rows = [];
  let interest;
  let realEar = null;
  let schedule = null;

  if (payback.value === "interest") {
    const n = termYears * 12;
    const pay = P * periodicRateFromEAR(ear, 12);
    interest = pay * n;
    head = {
      title: `${money(pay)} per month`,
      text: `You will need to pay ${money(pay)} interest every month and pay $${formatFixed(P, 0)} in the end to repay the loan.`,
    };
    if (net > 0) {
      const j = solveRate((i) => annuityPV(pay, i, n) + P * Math.pow(1 + i, -n), net);
      if (j !== null) realEar = Math.pow(1 + j, 12) - 1;
    }
  } else if (payback.value === "end") {
    const due = P * Math.pow(1 + ear, termYears);
    interest = due - P;
    head = { title: `Pay back ${money(due)}`, text: `You will need to pay ${money(due)} when the loan mature.` };
    if (net > 0) realEar = Math.pow(due / net, 1 / termYears) - 1;
    if (isWhole(termYears)) schedule = { rate: php14(ear), count: Math.round(termYears), payment: 0, payback: "end" };
  } else {
    const n = payback.periodsPerYear * termYears;
    const i = periodicRateFromEAR(ear, payback.periodsPerYear);
    const pay = i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n));
    interest = pay * n - P;
    rows = [
      { label: `Payback ${payback.phrase}`, value: money(pay) },
      { label: `Total of ${Math.ceil(n - 1e-9)} loan payments`, value: money(pay * n) },
    ];
    if (net > 0) {
      const j = solveRate((r) => annuityPV(pay, r, n), net);
      if (j !== null) realEar = Math.pow(1 + j, payback.periodsPerYear) - 1;
    }
    if (isWhole(n)) schedule = { rate: php14(i), count: Math.round(n), payment: php14(pay), payback: payback.value };
  }

  rows.push({ label: "Interest", value: money(interest) });
  if (totalFee > 0) {
    rows.push({ label: "Interest + fee", value: money(interest + totalFee) });
    if (realEar !== null && Number.isFinite(realEar)) rows.push({ label: REAL_RATE[compound].label, value: realRateText(realEar, compound) });
  }

  // No interest (a 0% rate), no chart — as on the reference.
  const pieTotal = P + interest + totalFee;
  const pie = interest <= 0 ? null : [
    { label: "Principal", value: P, color: "#2b7ddb" },
    { label: "Interest", value: interest, color: "#8bbc21" },
    ...(totalFee > 0 ? [{ label: "Fee", value: totalFee, color: "#910000" }] : []),
  ].map((s) => ({ ...s, percent: Math.round((s.value / pieTotal) * 100) }));

  return { head, rows, pie, schedule: schedule && { ...schedule, principal: P } };
}

/**
 * The reference's amortization table, row for row: interest on the
 * beginning balance, "Principal" = the change in balance (negative while
 * repaying, positive as interest accrues on an "In the End" loan), with
 * "Year #N End" rows for monthly, half-month and quarterly schedules and
 * "N. Year #k" labels for 6-month ones.
 */
export function buildBusinessLoanSchedule({ principal, rate, count, payment, payback }) {
  const perYear = { month: 12, halfmonth: 24, quarter: 4 }[payback];
  const out = [];
  let balance = principal;
  for (let k = 0; k < count; k++) {
    const interest = balance * rate;
    const paid = payment - interest;
    const ending = balance - paid;
    out.push({
      type: "row",
      label: payback === "halfyear" ? `${k + 1}. Year #${Math.floor((k + 2) / 2)}` : String(k + 1),
      begin: balance, interest, change: -paid, ending,
    });
    balance = ending;
    if (k > 0 && perYear && (k + 1) % perYear === 0) out.push({ type: "year", label: `Year #${(k + 1) / perYear} End` });
  }
  return out;
}

/** The reference table's money format: half-up cents, "-$1,234.56" (a tiny negative shows "-$0.00", as there). */
export function formatTableMoney(value) {
  const cents = Math.floor(Math.abs(value) * 100 + 0.50000000001);
  const text = `${Math.floor(cents / 100).toLocaleString("en-US")}.${String(cents % 100).padStart(2, "0")}`;
  return value < 0 ? `-$${text}` : `$${text}`;
}
