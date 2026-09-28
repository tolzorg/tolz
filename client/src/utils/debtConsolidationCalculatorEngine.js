// Debt Consolidation Calculator engine — matches
// calculator.net/debt-consolidation-calculator.html.
//
// Compares an existing group of debts (paid via the debt avalanche
// method, same mechanics as the sibling Debt Payoff Calculator) against
// a single proposed consolidation loan, on an apples-to-apples basis
// using APR (Annual Percentage Rate — the fee-adjusted true cost of
// borrowing), plus a monthly-payment/payoff-length/total-cost comparison
// table and an upfront-cash-flow figure for the loan fee.
//
// Verified via plain `curl` GET requests (server-side rendered off the
// query string) against the reference's own worked examples: the default
// 3-debt scenario (existing 18.92% APR / $630 mo / 59 months / $36,963.17
// total; loan 13.25% fee-adjusted APR / $543.44 mo / 60 months /
// $32,606.15 total; $1,250 fee; -$250 shortfall — "this loan will save
// you money") and a single-debt scenario (existing APR trivially equals
// that debt's own rate; a $13,750 cash LEFTOVER instead of a shortfall).
//
// Key findings:
//
//  1. The "Existing debts" side reuses debtPayoffCalculatorEngine.js's
//     already-verified `calculateDebtPayoff()` directly (avalanche
//     method, no extra payments, "Fixed total amount" always on — the
//     reference's own footnote, "assume you pay $[total] per month until
//     paidoff", is exactly that mode) for the real monthly-
//     pay/payoff-length/total-payments/total-interest figures — NOT a
//     reimplementation.
//  2. "The APR of your current debts" is a NEW derived figure this
//     calculator introduces: the single blended monthly rate that would
//     make a $[total balance] loan, paid at $[combined minimum
//     payment]/month, take exactly as long (including the same
//     fractional final period) as the real avalanche simulation above
//     took — i.e. the same "solve the rate from PV/PMT/N" technique
//     already used by interestRateCalculatorEngine.js, applied here to
//     the avalanche's own resulting N instead of a directly-given term.
//     Verified exact (rounds to the reference's own 18.92% and, on a
//     single-debt scenario with no avalanche redistribution involved,
//     the underlying dollar total matched the reference to the exact
//     cent — 17.99% / $15,017.12 both ways).
//  3. The consolidation loan's own APR is "fee-adjusted": its stated
//     monthly payment is computed from the FULL loan amount at its
//     stated rate (standard amortization), but the money actually
//     received is the loan amount MINUS the fee — so the fee-adjusted
//     APR is the rate that PV (net proceeds received) implies given that
//     SAME monthly payment and term. This is exactly the Interest Rate
//     Calculator's own PV/PMT/N solve, just with net proceeds standing
//     in for the loan amount. Verified exact (10.99% stated -> 13.25%
//     fee-adjusted, to the exact cent on payment/totals).
//  4. Upfront cash flow = (loan amount - fee) - total existing balance.
//     Negative means extra cash is needed to fully retire the existing
//     debts ("So, you will need additional $X for consolidation");
//     positive means money is left over ("You can keep the remaining $X
//     after consolidation") — both confirmed live, exact wording below.
//  5. The recommendation sentence and verdict color are driven purely by
//     comparing the two APRs (lower wins) — confirmed both directions
//     live: "...the financial cost of the consolidation loan is lower.
//     This consolidation loan will save you money." (green) vs. "...the
//     financial cost of this consolidation loan is more expensive than
//     your existing debt[s]. It is not recommended to use this
//     [reference's own wording] reconsolidation loan." (red).
//  6. Grammar is genuinely singular/plural-sensitive on debt count
//     (confirmed live): "The APR of your current debt IS" / "Existing
//     debt" (1 debt) vs. "...debts ARE" / "Existing debts" (2+) — not
//     just a cosmetic "(s)" suffix.
//  7. Validation mirrors the sibling Debt Payoff Calculator (balance
//     must be positive, minimum payment/rate must be >=0 for every
//     entered debt; a debt that can never be paid off even with
//     avalanche redistribution surfaces the same "cannot pay off"
//     message) plus the consolidation loan's own fields (amount/rate/
//     term/fee must be positive, rate and fee only reject negative).

import { calculateDebtPayoff, formatPayoffLength } from "./debtPayoffCalculatorEngine.js";
import { monthlyRate as annualToMonthlyRate, formatCurrency } from "./paymentCalculatorEngine.js";

export { formatCurrency, formatPayoffLength };

export const MAX_DEBTS = 20;

export const DEFAULT_DEBTS = [
  { name: "Credit card 1", balance: "10000", minPayment: "260", ratePercent: "17.99" },
  { name: "Credit card 2", balance: "7500", minPayment: "190", ratePercent: "19.99" },
  { name: "High interest debt", balance: "6500", minPayment: "180", ratePercent: "18.99" },
];

export const DEFAULTS = {
  loanAmount: "25000",
  interestRate: "10.99",
  years: "5",
  months: "0",
  loanCost: "5",
  loanCostUnit: "p",
};

function emptyDebtRow() {
  return { name: "", balance: "", minPayment: "", ratePercent: "" };
}
export function makeEmptyRows() {
  return Array.from({ length: MAX_DEBTS }, emptyDebtRow);
}

function rowHasAnyInput(row) {
  return Boolean(row.name || row.balance || row.minPayment || row.ratePercent);
}

/** Same convention as debtPayoffCalculatorEngine.js's applyDebtDefaults:
 * defaults apply per-row only to a row the user has started filling in,
 * and across all rows only when the WHOLE table is still untouched — a
 * row left completely blank while others are filled is excluded, not
 * silently backfilled with the example. */
export function applyDebtDefaults(rows) {
  const tableTouched = rows.some(rowHasAnyInput);
  return rows.map((row, i) => {
    const fallback = DEFAULT_DEBTS[i];
    if (!fallback) return row;
    if (tableTouched && !rowHasAnyInput(row)) return row;
    return {
      name: row.name || fallback.name,
      balance: row.balance || fallback.balance,
      minPayment: row.minPayment || fallback.minPayment,
      ratePercent: row.ratePercent || fallback.ratePercent,
    };
  });
}

function isFilledRow(row) {
  return String(row.balance ?? "").trim() !== "";
}

export function validateDebtConsolidationInputs({ debts, loanAmount, interestRate, years, months, loanCost }) {
  const filled = debts.filter(isFilledRow);
  if (filled.length === 0) return "Please provide at least one debt balance.";
  for (const row of filled) {
    const bal = Number(row.balance);
    if (!isFinite(bal) || bal <= 0) return "Please provide a positive balance for every debt entered.";
    const min = Number(row.minPayment);
    if (!isFinite(min) || min < 0) return "Please provide a positive monthly/min. payment for every debt entered.";
    const rate = Number(row.ratePercent);
    if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate for every debt entered.";
  }
  const amount = Number(loanAmount);
  if (!isFinite(amount) || amount <= 0) return "Please provide a positive loan amount value.";
  const rate = Number(interestRate);
  if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate for the consolidation loan.";
  const termMonths = (Number(years) || 0) * 12 + (Number(months) || 0);
  if (termMonths <= 0) return "Please provide a positive loan term value.";
  const cost = Number(loanCost);
  if (!isFinite(cost) || cost < 0) return "Please provide a positive loan fee/points value.";
  return null;
}

/** Bisection solve for the monthly rate implied by a level-payment,
 * end-of-period annuity: PV = PMT x (1-(1+i)^-N)/i. Same technique as
 * interestRateCalculatorEngine.js's own I/Y solve, as a small local
 * helper since both call sites here are the simple fixed-monthly-
 * compounding case (no P/Y-vs-C/Y bridging needed). */
function solveMonthlyRate(pv, pmt, n) {
  const pvAt = (i) => (Math.abs(i) < 1e-12 ? pmt * n : (pmt * (1 - Math.pow(1 + i, -n))) / i);
  let lo = -0.99 / 12;
  let hi = 2;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (pvAt(mid) > pv) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function paymentForLoan(P, i, n) {
  if (n <= 0) return 0;
  return i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n));
}

export function calculateDebtConsolidation({ debts, loanAmount, interestRate, years, months, loanCost, loanCostUnit }) {
  const filled = debts.filter(isFilledRow);
  const debtCount = filled.length;

  const payoff = calculateDebtPayoff({
    debts: filled, extraMonthly: "0", extraYearly: "0", extraOneTime: "0", extraOneTimeMonth: "1", fixedTotal: "y",
  });
  if (payoff.isImpossible) {
    return { isImpossible: true, debtId: payoff.debtId, debtMinPayment: payoff.debtMinPayment };
  }

  const totalBalance = payoff.totalPrincipal;
  const existingMonthlyPay = filled.reduce((s, d) => s + (Number(d.minPayment) || 0), 0);
  const existingTotalPayments = payoff.totalPayments;

  const wholePeriods = Math.floor(existingTotalPayments / existingMonthlyPay);
  const finalFraction = (existingTotalPayments - wholePeriods * existingMonthlyPay) / existingMonthlyPay;
  const existingN = wholePeriods + finalFraction;
  const existingAPR = solveMonthlyRate(totalBalance, existingMonthlyPay, existingN) * 1200;

  const loanP = Math.max(0, Number(loanAmount) || 0);
  const loanTermMonths = Math.max(0, Number(years) || 0) * 12 + Math.max(0, Number(months) || 0);
  const loanMonthlyRate = annualToMonthlyRate(interestRate);
  const loanPMT = paymentForLoan(loanP, loanMonthlyRate, loanTermMonths);
  const loanTotalPayments = loanPMT * loanTermMonths;
  const loanTotalInterest = loanTotalPayments - loanP;

  const costValue = Math.max(0, Number(loanCost) || 0);
  const fee = loanCostUnit === "d" ? costValue : loanP * (costValue / 100);
  const netProceeds = loanP - fee;
  const cashFlow = netProceeds - totalBalance;

  const loanAPR = solveMonthlyRate(netProceeds, loanPMT, loanTermMonths) * 1200;

  return {
    isImpossible: false,
    debtCount,
    totalBalance,
    netProceeds,
    fee,
    cashFlow,
    isLower: loanAPR < existingAPR,
    existing: {
      apr: existingAPR,
      monthlyPay: existingMonthlyPay,
      months: payoff.totalMonths,
      totalPayments: existingTotalPayments,
      totalInterest: payoff.totalInterest,
    },
    loan: {
      apr: loanAPR,
      monthlyPay: loanPMT,
      months: loanTermMonths,
      fee,
      cashFlow,
      totalPayments: loanTotalPayments,
      totalInterest: loanTotalInterest,
    },
  };
}

export function formatPercent(value, decimals = 2) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
