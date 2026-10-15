// Present Value Calculator engine — matches calculator.net/present-value-calculator.html
// (decoded with live GET probes; see scripts/present-value-calculator.test.js).
//
// 1. Present value of future money: PV = FV ÷ (1 + i)^N (negatives allowed).
// 2. Present value of periodical deposits: ⌊N⌋ deposits of PMT at the end
//    (or beginning) of each period; PV discounts them to today, and the future
//    value carries that PV forward over the full N periods (so a fractional N
//    adds growth without another deposit). Schedule rows are cumulative.

import { clean, num } from "./marginCalculatorEngine.js";
import { formatNumber } from "./irrCalculatorEngine.js";

export const FUTURE_DEFAULTS = { futureValue: "1000", periods: "10", rate: "6" };
export const DEPOSIT_DEFAULTS = { periods: "10", rate: "6", deposit: "100" };

const money = (v) => `$${formatNumber(v, 2)}`;

export function calculatePresentValueOfFutureMoney(input) {
  const errors = [];
  const fv = num(clean(input.futureValue));
  if (Number.isNaN(fv)) errors.push("Please provide a positive future value.");
  const n = num(clean(input.periods));
  if (Number.isNaN(n)) errors.push("Please provide a positive number of periods value.");
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate)) errors.push("Please provide a positive interest rate value.");
  if (errors.length) return { errors };
  const pv = fv / (1 + rate / 100) ** n;
  return { presentValue: money(pv), totalInterest: money(fv - pv) };
}

/**
 * Period-by-period simulation shared with the Future Value Calculator: an
 * optional starting balance plus ⌊n⌋ deposits of PMT at the end (or
 * beginning) of each period. A fractional last period gets a partial deposit
 * worth PMT·((1+i)^f − 1)/i at its end (PMT·f at 0%); with beginning deposits
 * it is made at its start instead, so it is scaled back by (1+i)^(1−f).
 * Reference quirk: with end deposits there is none when n is a whole number of
 * quarters (2.25, 2.5, 2.75). Rows: start balance (after a beginning
 * deposit), deposit, interest earned in the period, end balance, cumulative
 * deposits. pvDeposits discounts the deposits to today.
 */
export function simulateDeposits({ n, i, pmt, atStart, start = 0 }) {
  const whole = Math.floor(n);
  const frac = n - whole;
  const fullValue = i === 0 ? pmt * frac : pmt * (((1 + i) ** frac - 1) / i);
  let partial = 0;
  if (frac > 0 && atStart) partial = fullValue * (1 + i) ** (1 - frac);
  else if (frac > 0 && !Number.isInteger(n * 4)) partial = fullValue;

  const rows = [];
  let balance = start;
  let deposits = 0;
  let pvDeposits = 0;
  const periods = whole + (frac > 0 ? 1 : 0);
  for (let k = 1; k <= periods; k++) {
    const isPartial = k > whole;
    const length = isPartial ? frac : 1;
    const amount = isPartial ? partial : pmt;
    const growth = (1 + i) ** length;
    let interest;
    let startBalance;
    if (atStart) {
      startBalance = balance + amount;
      balance = startBalance * growth;
      interest = balance - startBalance;
      pvDeposits += amount / (1 + i) ** (k - 1);
    } else {
      startBalance = balance;
      interest = balance * growth - balance;
      balance = balance * growth + amount;
      pvDeposits += amount / (1 + i) ** (isPartial ? n : k);
    }
    deposits += amount;
    rows.push({ period: k, startBalance, deposit: amount, interest, balance, deposits });
  }
  return { rows, balance, deposits, pvDeposits };
}

export function calculatePresentValueOfDeposits(input) {
  const errors = [];
  const n = num(clean(input.periods));
  if (Number.isNaN(n) || n <= 0) errors.push("Please provide a positive N value.");
  else if (n > 10000) errors.push("This calculator is capable of handling N up to 10,000.");
  const rate = num(clean(input.rate));
  if (Number.isNaN(rate)) errors.push("I/Y needs to be numeric.");
  const pmt = num(clean(input.deposit));
  if (Number.isNaN(pmt)) errors.push("PMT needs to be numeric.");
  if (errors.length) return { errors };

  const sim = simulateDeposits({ n, i: rate / 100, pmt, atStart: input.timing === "beginning" });
  const fv = sim.balance;
  const pv = sim.pvDeposits;
  const rows = sim.rows;
  const principal = sim.deposits;
  const negative = principal < 0;
  return {
    presentValue: money(pv),
    rows: [["FV (Future Value)", money(fv)], ["Total Principal", money(principal)], ["Total Interest", money(fv - principal)]],
    // The reference draws no pie when the principal is negative.
    pie: negative ? null : [
      { label: "Principal", value: principal, color: "#2b7ddb" },
      { label: "Interest", value: fv - principal, color: "#8bbc21" },
    ],
    schedule: rows.map((r) => ({ period: r.period, deposits: money(r.deposits), interest: money(r.interest), balance: money(r.balance), rawDeposits: r.deposits, rawBalance: r.balance })),
  };
}
