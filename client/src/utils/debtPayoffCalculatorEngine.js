// Debt Payoff Calculator engine — matches calculator.net/debt-payoff-calculator.html.
//
// A generalization of the Credit Card(s) Payoff Calculator
// (see creditCardPayoffCalculatorEngine.js / credit-card-payoff-calculator-notes.md)
// to ANY kind of debt (loans, mortgages, credit cards together), adding:
//   - three extra-payment sources (a flat monthly extra, a once-a-year
//     extra, and a single one-time extra at a chosen month), and
//   - a "Fixed total amount towards monthly payment?" Yes/No toggle that
//     changes whether a paid-off debt's payment keeps getting reused.
//
// Verified via plain `curl` GET requests (server-side rendered off the
// query string, no Playwright needed; up to 20 debts via
// `cnm{i}`/`cbal{i}`/`cmpy{i}`/`cint{i}`) against the reference's own
// 4-debt worked example (Auto loan $25,000/$519/4.9%, Home mortgage
// $250,000/$1,800/4%, Credit card 1 $6,000/$150/18.99%, Credit card 2
// $3,000/$60/16.99%, $100/mo extra) in BOTH modes — every figure matched
// exactly in both: Yes/"fixed" mode (136 months, $2,629.00/mo fixed
// payment, $356,852.87 total, $72,852.91 interest) and No/"not fixed"
// mode (178 months, $372,933.53 total, $88,933.57 interest), including
// every one of the 4 debts' individual payoff length, total interest,
// total payments, AND the exact dollar amount / month number of every
// payment-schedule breakpoint in both modes.
//
// Key findings:
//
//  1. Same plain nominal monthly rate (annualRate/1200) as the sibling
//     Credit Card Payoff Calculator.
//  2. Avalanche priority is by interest rate descending, exactly like
//     the sibling calculator — same "waterfall" cascading allocation
//     (see creditCardPayoffCalculatorEngine.js's own notes) when "Fixed
//     total amount" is Yes: the combined pool (sum of ALL debts'
//     ORIGINAL minimum payments, whether still active or already paid
//     off, plus any extra due that month) never shrinks, and any unused
//     allocation from a debt that pays off mid-month cascades to the
//     next debt in priority order within the SAME month.
//  3. When "Fixed total amount" is No, the mechanics are genuinely
//     different — confirmed by reverse-engineering a scenario where a
//     debt finishing mid-month behaves two different ways depending on
//     what's left over: EVERY active debt independently pays its own
//     minimum every month (capped at its own remaining balance) — these
//     minimums do NOT pool or cascade to each other at all, which is
//     what "decreases as debts are paid off" means. ONLY the extra pool
//     (monthly + yearly-if-due + one-time-if-due) cascades through
//     active debts in priority order, on top of each debt's own minimum,
//     and ONLY unused EXTRA (not a finished debt's minimum) rolls to the
//     next debt within the same month. Confirmed with two different
//     transition months in the same live scenario: at one debt's payoff
//     month its own minimum alone already covered what it owed (so zero
//     extra was left unused, and the next debt's payment stayed flat);
//     at another debt's payoff month its own minimum was NOT enough (so
//     part of the extra pool was consumed, and the REMAINING unused
//     extra — not the whole freed allocation — rolled to the next debt
//     that same month).
//  4. Extra-yearly is applied at month 1, then every 12 months after
//     that (months 1, 13, 25, 37, …) — confirmed live, NOT months 12,
//     24, 36. Extra-one-time is applied at exactly the chosen month
//     number. Both are transient (single-month) injections into that
//     month's pool — a one-time payment does not permanently raise the
//     ongoing budget in either mode.
//  5. The headline sentence differs by mode: "...by making fixed
//     payments of $X every month[, of which, $Y is the extra monthly
//     payment]." (Yes) vs. "...with the monthly/min.[ and extra]
//     payments." (No) — the bracketed clauses are OMITTED entirely
//     (not shown as "$0.00") whenever the extra monthly payment is 0,
//     confirmed live in both modes.
//  6. This calculator's own wording is subtly different from the
//     sibling Credit Card Payoff Calculator's, despite being the same
//     underlying mechanic — replicated exactly rather than assumed:
//     table headers are sentence-case ("Payoff length", not "Payoff
//     Length"); the schedule phrase capitalizes "Pay"/"Then pay" and
//     uses "to payoff" (one word, no "#" before month numbers) instead
//     of "pay"/"then pay"/"to pay off." with a "#".
//  7. Validation, confirmed live: a literal negative balance is
//     rejected (replaced here with a proper message, matching this
//     app's convention). A debt whose own minimum payment doesn't cover
//     its own interest is NOT flagged by a pre-check — the reference
//     lets the simulation run and shows "With $X monthly payment, you
//     cannot payoff debt #N." (referencing the debt's ORIGINAL INPUT
//     INDEX, not its name) once it becomes clear the debt never
//     converges; replicated here via a MAX_MONTHS simulation cap rather
//     than a fragile per-debt formula pre-check, since whether a debt
//     is rescuable depends on the whole avalanche order, not just its
//     own numbers in isolation.
//  8. Same documented residual as the sibling calculator: the
//     reference's own "Total Interest" figures occasionally carry a
//     tiny (cents-level) internal rounding inconsistency against its
//     own Total Payments minus balance. This engine always computes
//     total interest as `totalPaid - originalBalance` (self-consistent
//     by construction) — see credit-card-payoff-calculator-notes.md for
//     why this isn't a recoverable alternate formula, just reference-
//     side display noise.

import { monthlyRate as annualToMonthlyRate, formatCurrency } from "./paymentCalculatorEngine.js";

export { formatCurrency };

export const MAX_DEBTS = 20;
const MAX_MONTHS = 1200;
const EPS = 1e-9;

export const DEFAULT_DEBTS = [
  { name: "Auto loan", balance: "25000", minPayment: "519", ratePercent: "4.9" },
  { name: "Home mortgage", balance: "250000", minPayment: "1800", ratePercent: "4" },
  { name: "Credit card 1", balance: "6000", minPayment: "150", ratePercent: "18.99" },
  { name: "Credit card 2", balance: "3000", minPayment: "60", ratePercent: "16.99" },
];

export const DEFAULTS = {
  extraMonthly: "100",
  extraYearly: "0",
  extraOneTime: "0",
  extraOneTimeMonth: "5",
  fixedTotal: "y",
};

function emptyDebtRow() {
  return { name: "", balance: "", minPayment: "", ratePercent: "" };
}
export function makeDefaultRows() {
  const rows = DEFAULT_DEBTS.map((d) => ({ ...d }));
  while (rows.length < MAX_DEBTS) rows.push(emptyDebtRow());
  return rows;
}
/** All rows blank — the reference's own default VALUES (see DEFAULT_DEBTS)
 * are shown as placeholder hints only, matching this app's established
 * convention of starting every field empty and falling back to the
 * default at calculate time (see applyDebtDefaults()). */
export function makeEmptyRows() {
  return Array.from({ length: MAX_DEBTS }, emptyDebtRow);
}
function rowHasAnyInput(row) {
  return Boolean(row.name || row.balance || row.minPayment || row.ratePercent);
}

/** Applies the reference's own default VALUES (see DEFAULT_DEBTS) to
 * blank fields — but ONLY within a row the user has already started
 * filling in, and only across all 4 rows when the WHOLE table is still
 * untouched (so a blank Calculate click reproduces the reference's own
 * default example). A row left completely blank while OTHER rows are
 * filled in is left alone (and excluded by isFilledRow) — it's a debt
 * the user didn't enter, not one to silently substitute an example for.
 * A real reported bug: the previous version defaulted every blank field
 * in rows 1-4 independently, so leaving unwanted example rows (e.g. the
 * two Credit card rows) untouched while entering just 2 real debts
 * silently pulled the example Credit Card 1/2 debts into the
 * calculation anyway — confirmed by comparing against the live
 * reference, which only computes the debts actually entered. */
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

export function validateDebtPayoffInputs({ debts, extraMonthly, extraYearly, extraOneTime, extraOneTimeMonth }) {
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

  for (const [label, value] of [["extra monthly payment", extraMonthly], ["extra yearly payment", extraYearly], ["extra one-time payment", extraOneTime]]) {
    const n = Number(value);
    if (!isFinite(n) || n < 0) return `Please provide a positive ${label} value.`;
  }
  const onMonth = Number(extraOneTimeMonth);
  if (!isFinite(onMonth) || onMonth < 1) return "Please provide a positive month for the one-time payment.";

  return null;
}

/** "16 months (1 year and 4 months)" — parenthetical breakdown only once
 * the total reaches a full year (>=12 months). */
export function formatPayoffLength(totalMonths) {
  const n = Math.max(0, Math.round(totalMonths));
  if (n < 12) return `${n} month${n === 1 ? "" : "s"}`;
  const years = Math.floor(n / 12);
  const remMonths = n % 12;
  const yearsPart = `${years} year${years === 1 ? "" : "s"}`;
  const monthsPart = remMonths === 0 ? "" : ` and ${remMonths} month${remMonths === 1 ? "" : "s"}`;
  return `${n} months (${yearsPart}${monthsPart})`;
}

/** "Pay $X until month Y." / "Then pay $X until month Y." / "Pay $X at
 * month Y to payoff." — this calculator's own capitalization/wording,
 * distinct from the sibling Credit Card Payoff Calculator's. */
export function formatPaymentSchedule(phases, payoffMonth) {
  if (phases.length === 1) {
    return `Pay ${formatCurrency(phases[0].amount)} until payoff at month ${payoffMonth}.`;
  }
  return phases
    .map((phase, i) => {
      const isLast = i === phases.length - 1;
      if (isLast) return `Pay ${formatCurrency(phase.amount)} at month ${phase.endMonth} to payoff.`;
      const prefix = i === 0 ? "Pay" : "Then pay";
      return `${prefix} ${formatCurrency(phase.amount)} until month ${phase.endMonth}.`;
    })
    .join(" ");
}

function extraForMonth(month, { extraMonthly, extraYearly, extraOneTime, extraOneTimeMonth }) {
  let extra = Number(extraMonthly) || 0;
  if ((month - 1) % 12 === 0) extra += Number(extraYearly) || 0;
  if (month === Math.round(Number(extraOneTimeMonth) || 0)) extra += Number(extraOneTime) || 0;
  return extra;
}

export function calculateDebtPayoff({ debts, extraMonthly, extraYearly, extraOneTime, extraOneTimeMonth, fixedTotal }) {
  const filled = debts.filter(isFilledRow);
  const isFixed = fixedTotal !== "n";

  const parsed = filled.map((row, i) => ({
    id: i + 1,
    name: (row.name || "").trim() || `Debt ${i + 1}`,
    originalBalance: Math.max(0, Number(row.balance) || 0),
    balance: Math.max(0, Number(row.balance) || 0),
    minPayment: Math.max(0, Number(row.minPayment) || 0),
    monthlyRate: annualToMonthlyRate(row.ratePercent),
    totalPaid: 0,
    payoffMonth: null,
    payments: [],
  }));

  const sumOriginalMins = parsed.reduce((s, d) => s + d.minPayment, 0);
  const priorityOrder = [...parsed].sort((a, b) => b.monthlyRate - a.monthlyRate);
  const extraArgs = { extraMonthly, extraYearly, extraOneTime, extraOneTimeMonth };

  let month = 0;
  let neverPaidOffId = null;
  while (priorityOrder.some((d) => d.balance > EPS) && month < MAX_MONTHS) {
    month++;
    const active = priorityOrder.filter((d) => d.balance > EPS);
    for (const d of active) d.balance += d.balance * d.monthlyRate;

    const extra = extraForMonth(month, extraArgs);

    if (isFixed) {
      let remaining = sumOriginalMins + extra;
      for (let i = 0; i < active.length; i++) {
        const d = active[i];
        const reserveForRest = active.slice(i + 1).reduce((s, x) => s + x.minPayment, 0);
        const allocation = remaining - reserveForRest;
        const payment = Math.min(allocation, d.balance);
        d.balance -= payment;
        remaining -= payment;
        d.totalPaid += payment;
        d.payments.push({ month, amount: Math.round(payment * 100) / 100 });
      }
    } else {
      // Each active debt independently pays its own minimum, capped at
      // its own remaining balance — minimums never pool across debts.
      for (const d of active) {
        const pay = Math.min(d.minPayment, d.balance);
        d.balance -= pay;
        d._paidThisMonth = pay;
      }
      // Only the extra pool cascades through still-owing active debts in
      // priority order, on top of whatever their minimum already paid.
      let remainingExtra = extra;
      for (const d of active) {
        if (d.balance <= EPS || remainingExtra <= EPS) continue;
        const pay = Math.min(remainingExtra, d.balance);
        d.balance -= pay;
        d._paidThisMonth += pay;
        remainingExtra -= pay;
      }
      for (const d of active) {
        d.totalPaid += d._paidThisMonth;
        d.payments.push({ month, amount: Math.round(d._paidThisMonth * 100) / 100 });
      }
    }

    for (const d of active) {
      if (d.balance < EPS) d.balance = 0;
      if (d.balance <= EPS && d.payoffMonth === null) d.payoffMonth = month;
    }
  }

  for (const d of parsed) {
    if (d.payoffMonth === null && neverPaidOffId === null) neverPaidOffId = d.id;
  }
  if (neverPaidOffId !== null) {
    const debt = parsed.find((d) => d.id === neverPaidOffId);
    return { isImpossible: true, debtId: neverPaidOffId, debtMinPayment: debt.minPayment };
  }

  const debtsWithSchedule = parsed.map((d) => {
    const phases = [];
    for (const { month: m, amount } of d.payments) {
      const last = phases[phases.length - 1];
      if (last && Math.abs(last.amount - amount) < 0.005) last.endMonth = m;
      else phases.push({ amount, startMonth: m, endMonth: m });
    }
    return {
      id: d.id,
      name: d.name,
      originalBalance: d.originalBalance,
      payoffMonth: d.payoffMonth,
      totalInterest: d.totalPaid - d.originalBalance,
      totalPaid: d.totalPaid,
      scheduleText: formatPaymentSchedule(phases, d.payoffMonth),
    };
  });
  debtsWithSchedule.sort((a, b) => a.payoffMonth - b.payoffMonth);

  const totalMonths = Math.max(...parsed.map((d) => d.payoffMonth));
  const totalPrincipal = parsed.reduce((s, d) => s + d.originalBalance, 0);
  const totalInterest = debtsWithSchedule.reduce((s, d) => s + d.totalInterest, 0);
  const totalPayments = parsed.reduce((s, d) => s + d.totalPaid, 0);
  const fixedMonthlyTotal = sumOriginalMins + (Number(extraMonthly) || 0);

  return {
    isImpossible: false,
    isFixed,
    totalMonths,
    totalPrincipal,
    totalInterest,
    totalPayments,
    fixedMonthlyTotal,
    extraMonthlyAmount: Number(extraMonthly) || 0,
    debts: debtsWithSchedule,
  };
}
