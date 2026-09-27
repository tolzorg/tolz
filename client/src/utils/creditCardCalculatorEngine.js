// Credit Card Calculator engine — matches calculator.net/credit-card-calculator.html.
//
// Two modes, matching the reference's own radio choices:
//   "Pay a certain amount"         → given a fixed monthly payment, solve
//                                    how long it takes to pay off the
//                                    balance (or whether it's even possible).
//   "Pay off within a certain timeframe" → given a target years+months,
//                                    solve the required monthly payment.
//
// This is a THIN WRAPPER around the already-verified Payment Calculator
// engine (paymentCalculatorEngine.js's calculateFixedPayments/
// calculateFixedTerm) — the underlying math is identical (plain nominal
// monthly rate = annualRate/1200, standard amortization), confirmed
// directly from the reference's own embedded JS (`populateValue()`'s
// `rateVal/1200.0`) and by matching its worked examples to the cent
// ($8,000 / 18% / $200/mo → 5 years 2 months, $4,308.61 total interest;
// $8,000 / 18% / 2yr0mo → $399.39/mo, $1,585.43 total interest). Unlike
// the Payment Calculator's own UI, this page has NO GET query interface
// visible in its raw HTML (its <form> has no `action`) — it actually DOES
// still accept a GET submission to the same URL (confirmed live), which is
// how every figure below was verified with plain `curl` requests, no
// Playwright needed.
//
// Non-obvious findings from that verification:
//
//  1. "Pay a certain amount" has a genuinely different, THIRD possible
//     outcome beyond "it takes N months": if the payment doesn't even
//     cover one month's interest (payment <= balance x monthlyRate,
//     including payment <= 0), the reference shows a distinct red
//     message ("It is unlikely that you can pay off the balance with a
//     monthly payment of $X. You will need to pay an amount higher than
//     $Y.") with NO charts at all — confirmed by diffing the raw HTML
//     (a normal response is ~63KB with full chart data; this one is
//     ~30KB, charts entirely absent). The first dollar figure in that
//     message is the RAW typed payment value with no currency formatting
//     (confirmed: typing "100.5" shows literally "$100.5", not
//     "$100.50") — only the second ("...higher than $Y") figure uses
//     proper 2-decimal currency formatting.
//  2. The "Pay a certain amount" duration phrase uses a DIFFERENT format
//     than "Pay off within a certain timeframe": it's driven by the
//     SOLVED, rounded total month count, with a genuine <=12-months
//     special case — verified with floating-point-exact scenarios to
//     rule out rounding noise: 1 month -> "1 month", 12 months (exactly)
//     -> "12 months" (NOT "1 year" — the >12 threshold is a hard cutoff,
//     not "is this an exact multiple of 12"), 13 months -> "1 year and 1
//     month", 24 months (exactly) -> "2 years" (no "and 0 months" once
//     there's no remainder). See formatPayoffDuration() below.
//  3. "Pay off within a certain timeframe" instead formats the RAW
//     years/months INPUT fields directly (not the derived total month
//     count) — confirmed by comparing two scenarios that produce the
//     IDENTICAL 30-month schedule: years=2,months=6 displays "2 years, 6
//     months" (comma-joined, not "and"), while years=0,months=30
//     displays "30 months" (no conversion to years at all, even past
//     12) — proving the wording reads the literal input pair, not a
//     recomputed breakdown. See formatTimeframe() below.
//  4. Validation, confirmed live: balance must be a positive number
//     (blank/zero/negative all silently produce no result on the
//     reference — replaced here with a proper error message, matching
//     this app's usual convention of never failing silently). Interest
//     rate must be >= 0 (negative silently fails on the reference; 0 is
//     valid). For "Pay off within a certain timeframe", years and months
//     must both be >= 0 and sum to a positive total. For "Pay a certain
//     amount", only a literal NEGATIVE payment is rejected outright — a
//     $0 payment is valid input that naturally resolves to the
//     "unlikely" branch above, not a validation error.
//  5. The "Interest + N% of Balance" quick-fill links (1/2/3/4/5%) are
//     confirmed, directly from the reference's own `populateValue()` JS,
//     to be a ONE-TIME convenience that fills the "pay a certain amount"
//     dollar field with a suggested starting value — NOT a recurring,
//     balance-shrinks-so-payment-shrinks minimum-payment simulation mode.
//     Only the 1% link adds the period's interest on top
//     (balance*0.01 + balance*rate/1200); the 2/3/4/5% links are flat
//     percentages of the balance alone (no interest added) — an
//     asymmetry confirmed directly from that JS, not guessed. Both forms
//     floor at $15 (or the full balance, if the balance itself is under
//     $15). See suggestedPayment() below.
//  6. Neither mode has any schedule TABLE at all (confirmed: no `cinfoT`
//     table markup anywhere in a successful response) — only the
//     Principal/Interest pie chart and a Balance/Interest line chart
//     plotted per MONTH (not rolled up to years, unlike the Annuity/
//     Annuity Payout calculators — reasonable given credit card payoff
//     terms are usually short). The line chart's "Interest" series is a
//     RUNNING CUMULATIVE TOTAL (confirmed from the reference's own chart
//     tooltips), same convention as this app's other line charts.

import { calculateFixedPayments, calculateFixedTerm, monthlyRate, formatCurrency } from "./paymentCalculatorEngine.js";

export { formatCurrency };

export const DEFAULTS = {
  balance: "8000",
  ratePercent: "18",
  paymentAmount: "200",
  years: "2",
  months: "0",
};

export const QUICK_FILL_OPTIONS = [1, 2, 3, 4, 5];

/** Confirmed live: only the 1% link adds a period's interest on top of
 * the flat percentage; 2-5% are the balance percentage alone. Both floor
 * at $15 (or the full balance, whichever is smaller). */
export function suggestedPayment(balance, ratePercent, percentOption) {
  const b = Math.max(0, Number(balance) || 0);
  const r = Number(ratePercent) || 0;
  let value = percentOption === 1 ? b * 0.01 + (b * r) / 1200 : b * 0.01 * percentOption;
  if (value < 15) value = b < 15 ? b : 15;
  return value;
}

function validateBalanceAndRate({ balance, ratePercent }) {
  const b = Number(balance);
  if (!isFinite(b) || b <= 0) return "Please provide a positive credit card balance value.";
  const r = Number(ratePercent);
  if (!isFinite(r) || r < 0) return "Please provide a positive interest rate value.";
  return null;
}

export function validatePayCertainAmountInputs({ balance, ratePercent, paymentAmount }) {
  const shared = validateBalanceAndRate({ balance, ratePercent });
  if (shared) return shared;
  const pmt = Number(paymentAmount);
  if (!isFinite(pmt) || pmt < 0) return "Please provide a positive payment value.";
  return null;
}

export function validatePayoffTimeframeInputs({ balance, ratePercent, years, months }) {
  const shared = validateBalanceAndRate({ balance, ratePercent });
  if (shared) return shared;
  const y = Number(years) || 0;
  const m = Number(months) || 0;
  if (y < 0 || m < 0 || y * 12 + m <= 0) return "Please provide a positive payoff time value.";
  return null;
}

function buildLineData(monthlySchedule, principal) {
  const points = [{ month: 0, balance: principal, interest: 0 }];
  let cumulativeInterest = 0;
  for (const row of monthlySchedule) {
    cumulativeInterest += row.interest;
    points.push({ month: row.period, balance: row.balance, interest: cumulativeInterest });
  }
  return points;
}

export function calculatePayCertainAmount({ balance, ratePercent, paymentAmount }) {
  const principal = Math.max(0, Number(balance) || 0);
  const payment = Math.max(0, Number(paymentAmount) || 0);
  const i = monthlyRate(ratePercent);
  const minPayment = principal * i;

  if (payment <= 0 || payment <= minPayment) {
    return { mode: "certainamount", isImpossible: true, payment, minPayment };
  }

  const result = calculateFixedPayments({ loanAmount: principal, monthlyPay: payment, annualRatePercent: ratePercent });
  return {
    mode: "certainamount",
    isImpossible: false,
    payment,
    principal,
    // The actual number of months it takes is the number of SIMULATED
    // schedule rows (wholePeriods, plus one more for a fractional final
    // payment if there is one) — NOT `result.totalPeriods` rounded to the
    // nearest integer. A payment that clears the balance after, say, 9.11
    // exact periods still needs a 10th, smaller payment to finish it off,
    // so it genuinely takes 10 months, not 9 (confirmed against the live
    // reference: $57,310 / 93% / $9,000/mo solves to 9.11 exact periods,
    // and the reference shows "10 months" — nearest-rounding this gave
    // "9 months", a real reported bug).
    totalMonthsRounded: result.monthlySchedule.length,
    totalInterest: result.totalInterest,
    lineData: buildLineData(result.monthlySchedule, principal),
  };
}

export function calculatePayoffTimeframe({ balance, ratePercent, years, months }) {
  const principal = Math.max(0, Number(balance) || 0);
  const y = Math.max(0, Number(years) || 0);
  const m = Math.max(0, Number(months) || 0);

  const result = calculateFixedTerm({ loanAmount: principal, years: y + m / 12, annualRatePercent: ratePercent });
  return {
    mode: "timeframe",
    isImpossible: false,
    payment: result.payment,
    principal,
    years: y,
    months: m,
    totalInterest: result.totalInterest,
    lineData: buildLineData(result.monthlySchedule, principal),
  };
}

/** "5 years and 2 months" — see finding #2. */
export function formatPayoffDuration(totalMonths) {
  const n = Math.max(0, Math.round(totalMonths));
  if (n <= 12) return `${n} month${n === 1 ? "" : "s"}`;
  const years = Math.floor(n / 12);
  const remMonths = n % 12;
  const yearsPart = `${years} year${years === 1 ? "" : "s"}`;
  return remMonths === 0 ? yearsPart : `${yearsPart} and ${remMonths} month${remMonths === 1 ? "" : "s"}`;
}

/** "2 years, 6 months" — see finding #3. Formats the RAW years/months
 * input pair directly, not a recomputed breakdown. */
export function formatTimeframe(years, months) {
  const y = Math.round(years);
  const m = Math.round(months);
  const yearsPart = y > 0 ? `${y} year${y === 1 ? "" : "s"}` : "";
  const monthsPart = m > 0 ? `${m} month${m === 1 ? "" : "s"}` : "";
  if (yearsPart && monthsPart) return `${yearsPart}, ${monthsPart}`;
  return yearsPart || monthsPart;
}
