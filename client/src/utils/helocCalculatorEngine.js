// HELOC Calculator engine — matches calculator.net/heloc-calculator.html
// (decoded with live GET probes; see scripts/heloc-calculator.test.js).
//
// - Draw period: interest-only payments, loan × rate ÷ 12 for draw × 12
//   months (a fractional last month pays that fraction of the interest).
// - Repayment period: a level payment over repay × 12 months, possibly
//   fractional (the last row pays the balance with that fraction of a payment).
// - "Total of N payments" counts whole rows: ⌈draw months⌉ + ⌈repay months⌉.
// - Annual fees are charged during the draw period only (fee × draw years).
// - APR: the reference's figure behaves like the APR of the repayment period
//   alone — the monthly rate at which the repayment annuity (fractional term
//   allowed) plus the annual fees (at each year end, from the start) are worth
//   the loan minus the closing costs, times 12. This reproduces it exactly
//   without a draw period; with one, the reference adds a small upward bias
//   (up to ~0.04 points for draws around a year, e.g. 8.042% for a loan with
//   no fees at all) that could not be decoded, so values can differ there.
// - The borrowing calculator is the Home Equity Loan page's script.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";
import { money } from "./fhaLoanCalculatorEngine.js";
import { calculateBorrowLimit as homeEquityBorrowLimit } from "./homeEquityLoanCalculatorEngine.js";

// Schedule cells round like the totals (15-digit pre-round): 1,050.645 prints .65 as on the reference.
export const scheduleMoney = money;
export const HELOC_DEFAULTS = { amount: "50000", rate: "8", drawYears: "5", repayYears: "15", closingCosts: "2000", annualFee: "50" };

const countText = (n) => formatNumber(n, 0);

/** Monthly rate x where repayment annuity + fees are worth `received` (bisection, widening the bracket). */
function solveApr({ payment, months, received, fee, drawYears }) {
  const pv = (x) => {
    let s = x === 0 ? payment * months : (payment * (1 - (1 + x) ** -months)) / x;
    for (let y = 1; y <= Math.ceil(drawYears - 1e-9); y++) s += (fee * Math.min(1, drawYears - (y - 1))) / (1 + x) ** (12 * y);
    return s;
  };
  if (pv(0) <= received) return 0;
  let lo = 0;
  let hi = 1;
  while (pv(hi) > received && hi < 1e12) { lo = hi; hi *= 2; }
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > received) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * @param {object} input — amount, rate, drawYears, repayYears (strings),
 *   includeCosts, closingCosts, closingUnit ("amount"|"percentage"),
 *   closingPaid ("upfront"|"deduct"), annualFee.
 */
export function calculateHeloc(input) {
  const errors = [];
  const amount = num(clean(input.amount));
  if (Number.isNaN(amount) || amount <= 0) errors.push("Please provide a positive loan amount.");
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate) || rate < 0) errors.push("Please provide a positive interest rate value.");
  const drawYears = num(clean(input.drawYears));
  if (Number.isNaN(drawYears) || drawYears < 0) errors.push("Please provide a positive draw period value.");
  const repayYears = num(clean(input.repayYears));
  if (Number.isNaN(repayYears) || repayYears <= 0) errors.push("Please provide a positive repayment period value.");

  const include = !!input.includeCosts;
  const byPercent = input.closingUnit === "percentage";
  let cost = 0;
  let fee = 0;
  if (include) {
    const value = num(clean(input.closingCosts));
    if (Number.isNaN(value) || value < 0) errors.push("Please provide a positive closing costs amount.");
    else if (byPercent && value >= 100) errors.push("Closing costs percentage cannot be more than 100%.");
    else if (!byPercent && amount > 0 && value >= amount) errors.push("Closing costs cannot be more than loan amount.");
    else cost = byPercent ? (amount * value) / 100 : value;
    fee = num(clean(input.annualFee));
    if (Number.isNaN(fee) || fee < 0) { errors.push("Please provide a positive annual fee amount."); fee = 0; }
  }
  if (errors.length) return { errors };

  const r = rate / 1200;
  const drawMonths = drawYears * 12;
  const repayMonths = repayYears * 12;
  const drawPay = amount * r;
  const repayPay = r === 0 ? amount / repayMonths : (amount * r) / (1 - (1 + r) ** -repayMonths);

  // ── Month-by-month schedule ──
  const rows = [];
  for (let k = 1; k <= Math.ceil(drawMonths - 1e-9); k++) {
    rows.push({ interest: drawPay * Math.min(1, drawMonths - (k - 1)), principal: 0, balance: amount });
  }
  let balance = amount;
  const repayRows = Math.ceil(repayMonths - 1e-9);
  for (let k = 1; k <= repayRows && balance > 1e-9; k++) {
    const fraction = Math.min(1, repayMonths - (k - 1));
    let interest; let principal;
    if (fraction < 1) {
      principal = balance;
      interest = r === 0 ? 0 : repayPay * fraction - balance;
    } else {
      interest = balance * r;
      principal = Math.min(balance, repayPay - interest);
    }
    balance -= principal;
    if (balance < 1e-7) balance = 0;
    rows.push({ interest, principal, balance });
  }
  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  const totalPaid = totalInterest + rows.reduce((s, x) => s + x.principal, 0);

  const totalFees = fee * drawYears;
  const withCosts = include && (cost > 0 || fee > 0);
  const deducted = input.closingPaid === "deduct";
  const results = [["Draw period monthly pay", money(drawPay)], ["Repayment period monthly pay", money(repayPay)]];
  const totals = [];
  if (withCosts && deducted) totals.push(["Cash received", money(amount - cost)]);
  totals.push([`Total of ${countText(rows.length)} payments`, money(totalPaid)], ["Total interest", money(totalInterest)]);
  if (withCosts) {
    if (byPercent && cost > 0) totals.push(["Closing costs", money(cost)]);
    if (fee > 0) totals.push(["Total annual fees", money(totalFees)]);
    totals.push(["Cost of loan", money(totalInterest + cost + totalFees)]);
    if (rate > 0 && repayMonths >= 12) {
      const x = solveApr({ payment: repayPay, months: repayMonths, received: amount - cost, fee, drawYears });
      totals.push(["APR", `${formatNumber(1200 * x, 3)}%`]);
    }
  }

  const palette = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce"];
  const slices = [{ label: withCosts && deducted && cost > 0 ? "Cash received" : "Loan amount", value: withCosts && deducted ? amount - cost : amount }];
  if (withCosts && cost > 0) slices.push({ label: "Closing costs", value: cost });
  if (withCosts && fee > 0) slices.push({ label: "Annual fee", value: totalFees });
  slices.push({ label: "Interest", value: totalInterest });
  const pie = slices.map((s, i) => ({ ...s, color: palette[i] }));

  // ── Schedule (shown for 13 to 719 repayment months) ──
  let schedule = null;
  if (repayMonths > 12 && repayMonths < 720) {
    const annual = [];
    for (let y = 0; y * 12 < rows.length; y++) {
      const slice = rows.slice(y * 12, y * 12 + 12);
      annual.push({ label: String(y + 1), interest: slice.reduce((s, x) => s + x.interest, 0), principal: slice.reduce((s, x) => s + x.principal, 0), balance: slice[slice.length - 1].balance });
    }
    const monthly = rows.map((x, i) => ({ label: String(i + 1), ...x, yearEnd: (i + 1) % 12 === 0 ? (i + 1) / 12 : 0 }));
    let cumInterest = 0; let cumPaid = 0;
    const chart = annual.map((a, i) => {
      cumInterest += a.interest; cumPaid += a.interest + a.principal;
      return { year: i + 1, balance: a.balance, interest: cumInterest, payment: cumPaid };
    });
    schedule = { annual, monthly, chart, showDates: false, loan: amount };
  }

  return { results, totals, pie, schedule };
}

const HELOC_NOTE = "There are other factors that may affect the home equity line of credit amount you qualify for, such as your credit history. Applicants with a credit score below 630 may not qualify. Your other debts can also affect the amount you are eligible for. In general, lenders typically won't approve a loan for borrowers with a debt-to-income ratio of 43% or higher.";
const HELOC_CAP = "In addition, most lenders have an upper limit on home equity line of credit, with many setting the cap at $1,000,000.";

/** "The amount of line of credit you can borrow" — the Home Equity page's script with HELOC wording. */
export function calculateHelocBorrowLimit(input) {
  const r = homeEquityBorrowLimit(input);
  if (r.errors || !r.qualifies) return r;
  return { ...r, notes: r.notes.length > 1 ? [HELOC_NOTE, HELOC_CAP] : [HELOC_NOTE] };
}
