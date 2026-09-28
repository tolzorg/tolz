// Credit Card(s) Payoff Calculator engine — matches
// calculator.net/credit-card-payoff-calculator.html.
//
// Given a fixed total monthly budget and up to 20 credit cards (each with
// its own balance, minimum payment, and interest rate), simulates the
// "Debt Avalanche" method: every card gets at least its own minimum
// payment every month, and whatever budget is left over after all
// minimums are covered goes entirely to the single highest-INTEREST-RATE
// card that still has a balance. Once that card is paid off, its
// minimum payment (which is no longer needed) becomes part of the extra
// directed at the next-highest-rate card, and so on.
//
// Verified via plain `curl` GET requests (server-side rendered off the
// query string, no Playwright needed) against the reference's own 3-card
// worked example ($4,600/$3,900/$6,000 balances, $100/$90/$120 minimums,
// 18.99%/19.99%/15.99% rates, $500/mo budget) — every figure matched
// exactly: 38 months total, $18,971.20 total payments, $4,471.24(*) total
// interest, and every one of the three cards' individual payoff length,
// total interest, total payments, AND the exact dollar amounts/month
// numbers where each card's payment amount changes.
//
// Key findings:
//
//  1. Uses the SAME plain nominal monthly rate (annualRate/1200, not
//     EAR-bridged) as the plain Credit Card Calculator — confirmed by
//     reproducing every figure exactly with that convention.
//  2. The month-by-month allocation is a "waterfall": process the
//     currently-active cards in priority order (highest rate first);
//     each card's allocation is (running budget remaining) minus (the
//     sum of minimum payments reserved for every LOWER-priority still-
//     active card), capped at whatever balance that card actually has
//     left. Any money a card DOESN'T need (because its remaining balance
//     was smaller than its allocation — i.e. it pays off mid-month)
//     automatically flows to the next card in the same pass, within the
//     SAME month — confirmed exactly from the reference's own schedule:
//     when Card 2 finishes at month 16 with a smaller final payment
//     ($274.33 instead of its usual $280 — $5.67 left over), Card 1's
//     payment for that SAME month 16 is $105.67 ($100 own minimum +
//     $5.67), not the full $380 it gets starting month 17.
//  3. Cards are ranked by interest rate descending for avalanche
//     priority; the "#N" prefix shown before each card's name in the
//     reference's results table is just that card's ORIGINAL input row
//     number (confirmed: "#2: Card 2" is literally input row 2), not an
//     avalanche-priority rank — the table's actual ROW ORDER is what
//     reflects priority/payoff order (sorted by payoff length
//     ascending).
//  4. (*) The reference's own headline/per-card "Total Interest" figures
//     have a tiny (1-4 cent) internal rounding inconsistency against its
//     own displayed Total Payments minus original balance (e.g. it shows
//     Card 2's total interest as $574.35, but its own $4,474.33 total
//     payments minus its own $3,900 balance is $574.33) — this engine
//     instead computes each card's total interest as the literal sum of
//     that card's own monthly interest (which is exactly
//     totalPayments − originalBalance, self-consistent), a documented
//     ~$0.01-0.04 residual against the reference's own headline figure,
//     not against any of the actionable numbers (payoff length, payment
//     schedule amounts, and total payments all match exactly).
//  5. A separate, confirmed REAL bug in the reference (not replicated):
//     whenever a card's payoff has NO fractional final period at all
//     (its balance divides evenly by its payment, so every month pays
//     the exact same amount including the last), the reference's own
//     HEADLINE total months AND that card's schedule-text month number
//     are BOTH off by one (e.g. an 11-months-to-payoff scenario shows
//     "12 months" in the headline and "at month #10" in the schedule
//     text) — while its own tabulated "Payoff Length" column
//     independently and correctly shows "11 months" for the very same
//     scenario. Since the reference's own output is self-contradictory
//     here, this engine uses the correct, self-consistent month numbers
//     throughout (verified this discrepancy is isolated to this one
//     narrow edge case — every fractional-final-period scenario, which
//     is the overwhelmingly common case, matches exactly with no
//     adjustment needed).
//  6. Validation, confirmed live: a literal negative balance or negative
//     rate is rejected (replaced here with a proper error message,
//     matching this app's convention of never failing silently); a
//     monthly budget below the summed minimum payments doesn't error,
//     it shows a distinct warning message instead, with no chart or
//     schedule table — replicated as `isBudgetTooLow`.

import { monthlyRate as annualToMonthlyRate, formatCurrency } from "./paymentCalculatorEngine.js";

export { formatCurrency };

export const MAX_CARDS = 20;
const MAX_MONTHS = 1200;
const EPS = 1e-9;

export const DEFAULT_BUDGET = "500";
export const DEFAULT_CARDS = [
  { name: "Card 1", balance: "4600", minPayment: "100", ratePercent: "18.99" },
  { name: "Card 2", balance: "3900", minPayment: "90", ratePercent: "19.99" },
  { name: "Card 3", balance: "6000", minPayment: "120", ratePercent: "15.99" },
];

function emptyCardRow() {
  return { name: "", balance: "", minPayment: "", ratePercent: "" };
}
export function makeDefaultRows() {
  const rows = DEFAULT_CARDS.map((c) => ({ ...c }));
  while (rows.length < MAX_CARDS) rows.push(emptyCardRow());
  return rows;
}

/** A row counts as "filled" once it has a non-blank balance — matches
 * the reference's own behavior of silently skipping blank rows rather
 * than requiring every one of the 20 rows to be filled. */
function isFilledRow(row) {
  return String(row.balance ?? "").trim() !== "";
}

export function validateCreditCardPayoffInputs({ budget, cards }) {
  const b = Number(budget);
  if (!isFinite(b) || b <= 0) return "Please provide a positive monthly budget value.";

  const filled = cards.filter(isFilledRow);
  if (filled.length === 0) return "Please provide at least one credit card balance.";

  for (const row of filled) {
    const bal = Number(row.balance);
    if (!isFinite(bal) || bal <= 0) return "Please provide a positive balance for every credit card entered.";
    const min = Number(row.minPayment);
    if (!isFinite(min) || min < 0) return "Please provide a positive minimum payment for every credit card entered.";
    const rate = Number(row.ratePercent);
    if (!isFinite(rate) || rate < 0) return "Please provide a positive interest rate for every credit card entered.";
  }
  return null;
}

/** "16 months (1 year and 4 months)" — the parenthetical breakdown only
 * appears once the total reaches a full year (>=12 months); below that
 * it's just the plain month count. */
export function formatPayoffLength(totalMonths) {
  const n = Math.max(0, Math.round(totalMonths));
  if (n < 12) return `${n} month${n === 1 ? "" : "s"}`;
  const years = Math.floor(n / 12);
  const remMonths = n % 12;
  const yearsPart = `${years} year${years === 1 ? "" : "s"}`;
  const monthsPart = remMonths === 0 ? "" : ` and ${remMonths} month${remMonths === 1 ? "" : "s"}`;
  return `${n} months (${yearsPart}${monthsPart})`;
}

/** Condenses a card's month-by-month payment list into the reference's
 * own "pay $X until month #Y." / "then pay $X until month #Y." / "pay $X
 * at month #Y to pay off." phrasing (see finding #5 for the one
 * corrected edge case: a single uniform phase with no fractional final
 * payment). */
export function formatPaymentSchedule(phases, payoffMonth) {
  if (phases.length === 1) {
    return `pay ${formatCurrency(phases[0].amount)} until payoff at month #${payoffMonth}.`;
  }
  return phases
    .map((phase, i) => {
      const isLast = i === phases.length - 1;
      if (isLast) return `pay ${formatCurrency(phase.amount)} at month #${phase.endMonth} to pay off.`;
      const prefix = i === 0 ? "pay" : "then pay";
      return `${prefix} ${formatCurrency(phase.amount)} until month #${phase.endMonth}.`;
    })
    .join(" ");
}

export function calculateCreditCardPayoff({ budget, cards }) {
  const B = Math.max(0, Number(budget) || 0);
  const filled = cards.filter(isFilledRow);

  const parsed = filled.map((row, i) => ({
    id: i + 1,
    name: (row.name || "").trim() || `Card ${i + 1}`,
    originalBalance: Math.max(0, Number(row.balance) || 0),
    balance: Math.max(0, Number(row.balance) || 0),
    minPayment: Math.max(0, Number(row.minPayment) || 0),
    monthlyRate: annualToMonthlyRate(row.ratePercent),
    totalInterest: 0,
    totalPaid: 0,
    payoffMonth: null,
    payments: [], // {month, amount}
  }));

  const sumMinimums = parsed.reduce((s, c) => s + c.minPayment, 0);
  if (B < sumMinimums) {
    return { isBudgetTooLow: true, budget: B, sumMinimums };
  }

  // Avalanche priority: highest rate first (stable — ties keep input order).
  const priorityOrder = [...parsed].sort((a, b) => b.monthlyRate - a.monthlyRate);

  let month = 0;
  while (priorityOrder.some((c) => c.balance > EPS) && month < MAX_MONTHS) {
    month++;
    const active = priorityOrder.filter((c) => c.balance > EPS);
    for (const c of active) c.balance += c.balance * c.monthlyRate;

    let remaining = B;
    for (let i = 0; i < active.length; i++) {
      const card = active[i];
      const reserveForRest = active.slice(i + 1).reduce((s, c) => s + c.minPayment, 0);
      const allocation = remaining - reserveForRest;
      const payment = Math.min(allocation, card.balance);
      card.balance -= payment;
      if (card.balance < EPS) card.balance = 0;
      remaining -= payment;
      card.totalPaid += payment;
      card.payments.push({ month, amount: Math.round(payment * 100) / 100 });
      if (card.balance <= EPS && card.payoffMonth === null) card.payoffMonth = month;
    }
  }

  // Total interest per card = totalPaid - originalBalance (self-consistent
  // with the payment amounts, which all matched the reference exactly —
  // see finding #4 for why this differs from the reference's own headline
  // by a few cents).
  for (const c of parsed) c.totalInterest = c.totalPaid - c.originalBalance;

  const cardsWithSchedule = parsed.map((c) => {
    const phases = [];
    for (const { month: m, amount } of c.payments) {
      const last = phases[phases.length - 1];
      if (last && Math.abs(last.amount - amount) < 0.005) last.endMonth = m;
      else phases.push({ amount, startMonth: m, endMonth: m });
    }
    return {
      id: c.id,
      name: c.name,
      originalBalance: c.originalBalance,
      payoffMonth: c.payoffMonth,
      totalInterest: c.totalInterest,
      totalPaid: c.totalPaid,
      scheduleText: formatPaymentSchedule(phases, c.payoffMonth),
    };
  });
  cardsWithSchedule.sort((a, b) => a.payoffMonth - b.payoffMonth);

  const totalMonths = Math.max(...parsed.map((c) => c.payoffMonth));
  const totalPrincipal = parsed.reduce((s, c) => s + c.originalBalance, 0);
  const totalInterest = parsed.reduce((s, c) => s + c.totalInterest, 0);
  const totalPayments = parsed.reduce((s, c) => s + c.totalPaid, 0);

  return {
    isBudgetTooLow: false,
    budget: B,
    totalMonths,
    totalPrincipal,
    totalInterest,
    totalPayments,
    cards: cardsWithSchedule,
  };
}
