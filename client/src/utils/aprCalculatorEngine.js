// APR Calculator engine — matches calculator.net/apr-calculator.html, which
// has two GET forms (decoded with live probes; see scripts/apr-calculator.test.js).
//
// 1. General APR: the loan (plus "loaned fees", which are financed) is repaid
//    in level payments. The nominal rate compounded at one frequency is
//    converted to the payment frequency through the effective annual rate
//    (the same bridge as the Loan Calculator). The term may give a fractional
//    number of payments (daily payback assumes 365.25 days a year).
// 2. Mortgage APR: loan = house value × (1 − down payment %), monthly
//    payments over the term rounded UP to whole years. PMI is charged while
//    the month-end balance is above 80% of the house value. Points (% of
//    the loan) count toward the APR but, as on the reference, not toward the
//    fees shown in the table and chart. A 0% rate, a $0 loan or fees that
//    swallow the loan give "Sorry, we are not able to figure out the APR rate."
//
// Real APR: r = the periodic rate at which the payments are worth what the
// borrower actually receives (loan − upfront fees), restated as a nominal
// rate compounded monthly. The reference's own solver is approximate, so
// some APRs differ from the exact value in the third decimal.

import { effectiveAnnualRate, periodicRateFromEAR } from "./loanCalculatorEngine.js";
import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const GENERAL_DEFAULTS = {
  amount: "100000", years: "10", months: "0", rate: "6",
  compound: "monthly", payback: "month", loanedFees: "0", upfrontFees: "2500",
};
export const MORTGAGE_DEFAULTS = {
  houseValue: "350000", downPayment: "20", years: "30", rate: "6.2", loanFees: "3500", points: "0.5", pmi: "0",
};

export const COMPOUND_CHOICES = [
  { value: "annually", label: "Annually" },
  { value: "semiannually", label: "Semi-annually" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "continuously", label: "Continuously" },
];
export const PAYBACK_CHOICES = [
  { value: "daily", label: "Every Day", result: "Every Day", perYear: 365.25 },
  { value: "weekly", label: "Every Week", result: "Every Week", perYear: 52 },
  { value: "biweekly", label: "Every 2 Weeks", result: "Every Two Weeks", perYear: 26 },
  { value: "halfmonth", label: "Every Half Month", result: "Every Half Month", perYear: 24 },
  { value: "month", label: "Every Month", result: "Every Month", perYear: 12 },
  { value: "quarter", label: "Every Quarter", result: "Every Quarter", perYear: 4 },
  { value: "halfyear", label: "Every 6 Months", result: "Every 6 Months", perYear: 2 },
  { value: "year", label: "Every Year", result: "Every Year", perYear: 1 },
];

const FEE_COLORS = { Principal: "#2b7ddb", Interest: "#8bbc21", Fees: "#910000" };
const money = (v) => (v < 0 && formatNumber(-v, 2) !== "0.00" ? `$-${formatNumber(-v, 2)}` : `$${formatNumber(Math.abs(v), 2)}`);

const levelPayment = (P, i, n) => (i === 0 ? P / n : (P * i) / (1 - (1 + i) ** -n));
const annuityFactor = (i, n) => (i === 0 ? n : (1 - (1 + i) ** -n) / i);

/** Periodic rate r with payment × a(r, n) = received; bisection on (−1, ∞). */
export function solvePeriodicRate(received, payment, n) {
  const f = (r) => payment * annuityFactor(r, n) - received;
  if (f(0) <= 0) {
    // Payments total no more than what was received: the rate is ≤ 0.
    let lo = -0.5;
    while (f(lo) < 0 && lo > -0.999999) lo = (lo - 1) / 2;
    let hi = 0;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  let lo = 0;
  let hi = 1;
  while (f(hi) > 0) { lo = hi; hi *= 2; }
  for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/** Rows like the reference's "View Amortization Table" (showAmo in loannew.js). */
export function buildAmortization({ principal, periodicRate, payments, payment, payback }) {
  const rows = [];
  let balance = principal;
  const whole = Math.floor(payments);
  for (let k = 0; k < whole; k++) {
    const interest = balance * periodicRate;
    const principalPaid = payment - interest;
    const end = balance - principalPaid;
    rows.push({ label: payback === "halfyear" ? `${k + 1}. Year #${Math.floor((k + 2) / 2)}` : String(k + 1), begin: balance, interest, principal: principalPaid, end });
    balance = end;
    const per = { halfmonth: 24, month: 12, quarter: 4 }[payback];
    if (k > 0 && per && (k + 1) % per === 0) rows.push({ yearEnd: (k + 1) / per });
  }
  if (payments - whole > 0.0001) {
    rows.push({ label: `${whole + 1} (Partial)`, begin: balance, interest: balance * periodicRate, principal: balance, end: 0 });
  }
  return rows;
}

function pie(principal, interest, fees) {
  const slices = [["Principal", principal], ["Interest", interest]];
  if (fees > 0) slices.push(["Fees", fees]);
  return slices.map(([label, value]) => ({ label, value, color: FEE_COLORS[label] }));
}

export function calculateGeneralApr(input) {
  const errors = [];
  const amount = num(clean(input.amount));
  const yearsText = clean(input.years);
  const monthsText = clean(input.months);
  const years = num(yearsText);
  const months = monthsText === "" ? 0 : num(monthsText);
  const rate = num(clean(input.rate));
  const loanedFees = num(clean(input.loanedFees));
  const upfront = num(clean(input.upfrontFees));
  if (!(amount > 0)) errors.push("Please provide a positive loan amount.");
  const term = years + months / 12;
  if (!(years >= 0) || !(months >= 0) || !(term > 0)) errors.push("Please provide a positive loan term value.");
  if (!(rate >= 0)) errors.push("Please provide a positive interest value.");
  if (!(loanedFees >= 0)) errors.push("Please provide a positive loaned fees value.");
  if (!(upfront >= 0) || !(upfront < amount)) errors.push("Please provide a positive and reasonable upfront fees value.");
  if (errors.length) return { errors };

  const pay = PAYBACK_CHOICES.find((p) => p.value === input.payback) || PAYBACK_CHOICES[4];
  const ear = effectiveAnnualRate(rate / 100, input.compound);
  const i = periodicRateFromEAR(ear, pay.perYear);
  const n = term * pay.perYear;
  const financed = amount + loanedFees;
  const payment = levelPayment(financed, i, n);
  const total = payment * n;
  const r = solvePeriodicRate(amount - upfront, payment, n);
  // The reference states the APR as a monthly-compounded nominal rate, whatever
  // the payment frequency: EAR = (1 + r)^p − 1, APR = 12 × ((1 + EAR)^(1/12) − 1).
  const apr = 12 * ((1 + r) ** (pay.perYear / 12) - 1) * 100;

  const notes = [];
  for (const v of [input.payback, input.compound]) {
    const note = { daily: "*Daily rate or pay assumes 365.25 days per year.", weekly: "*Weekly rate or pay assumes 52 weeks per year.", biweekly: "*Biweekly rate or pay assumes 52 weeks per year." }[v];
    if (note && !notes.includes(note)) notes.push(note);
  }
  const count = Number.isInteger(Number(n.toFixed(9))) ? formatNumber(Math.round(n), 0) : formatNumber(n, 2);
  return {
    apr: `${formatNumber(apr, 3)}%`,
    rows: [
      ["Amount Financed", money(financed)],
      ["Upfront Out-of-Pocket Fees", money(upfront)],
      [`Payment ${pay.result}`, money(payment)],
      [`Total of ${count} Payments`, money(total)],
      ["Total Interest", money(total - amount)],
      ["All Payments and Fees", money(total + upfront)],
    ],
    pie: pie(amount, total - amount - loanedFees, upfront + loanedFees),
    notes,
    amortization: { principal: financed, periodicRate: i, payments: n, payment, payback: pay.value },
  };
}

export const MORTGAGE_SORRY = "Sorry, we are not able to figure out the APR rate.";

export function calculateMortgageApr(input) {
  const errors = [];
  const read = (key, message, ok) => { const n = num(clean(input[key])); if (!ok(n)) errors.push(message); return n; };
  const house = read("houseValue", "Please provide a positive house value.", (n) => n > 0);
  const down = read("downPayment", "Please provide a positive down payment.", (n) => n >= 0);
  const years = read("years", "Please provide a positive loan term value.", (n) => n > 0);
  const rate = read("rate", "Please provide a positive interest value.", (n) => n >= 0);
  const fees = read("loanFees", "Please provide a positive loan fees value.", (n) => n >= 0);
  const points = read("points", "Please provide a positive points value.", (n) => n >= 0);
  const pmi = read("pmi", "Please provide a positive PMI insurance cost value.", (n) => n >= 0);
  if (errors.length) return { errors };

  const loan = house * (1 - down / 100);
  const n = Math.ceil(years) * 12;
  const i = rate / 1200;
  // Received = loan − fees − points; the reference can't solve 0% loans either.
  const received = loan - fees - (points / 100) * loan;
  if (!(loan > 0) || rate === 0 || !(received > 0)) return { sorry: MORTGAGE_SORRY };

  const payment = levelPayment(loan, i, n);
  // PMI is charged while the month-end balance is still above 80% of the
  // house value (none at a 20% down payment or more).
  let pmiMonths = 0;
  if (pmi > 0) {
    let balance = loan;
    for (let k = 1; k <= n; k++) {
      balance = balance * (1 + i) - payment;
      if (balance > 0.8 * house) pmiMonths = k; else break;
    }
  }
  const pmiMonthly = pmi / 12;
  const pmiTotal = pmiMonthly * pmiMonths;
  const total = payment * n;

  const npv = (r) => {
    let sum = -received;
    for (let k = 1; k <= n; k++) sum += (payment + (k <= pmiMonths ? pmiMonthly : 0)) / (1 + r) ** k;
    return sum;
  };
  const r = pmiMonths ? bisectRate(npv) : solvePeriodicRate(received, payment, n);

  const rows = [
    ["Loan Amount", money(loan)],
    ["Down Payment", money(house - loan)],
    ["Monthly Pay", money(payment)],
    [`Total of ${formatNumber(n, 0)} Payments`, money(total)],
    ["Total Interest", money(total - loan)],
  ];
  if (pmiMonths) {
    rows.push([`PMI Insurance (${pmiMonths} months)`, `${money(pmiMonthly)}/month`]);
    rows.push(["Total PMI Insurance Payments", money(pmiTotal)]);
  }
  // As on the reference, points count toward the APR but not toward the fees shown.
  rows.push(["All Payments and Fees", money(total + fees + pmiTotal)]);
  return { apr: `${formatNumber(r * 1200, 3)}%`, rows, pie: pie(loan, total - loan, fees + pmiTotal), notes: [] };
}

/** Root of a decreasing NPV(r) on (−1, ∞). */
function bisectRate(npv) {
  let lo = -0.999999;
  let hi = 1;
  while (npv(hi) > 0) hi *= 2;
  for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (npv(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
