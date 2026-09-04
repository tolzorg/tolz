// Payment Calculator engine — matches calculator.net/payment-calculator.html.
//
// Two modes, matching the reference's own "Fixed Term" / "Fixed Payments"
// tabs:
//   - calculateFixedTerm(): given a Loan Amount and a fixed Loan Term (in
//     years), computes the resulting Monthly Payment. Standard fixed-rate
//     amortization — no surprises here, verified against the reference's
//     own worked example to the penny.
//   - calculateFixedPayments(): given a Loan Amount and a fixed Monthly
//     Pay, solves for how long it takes to pay off the loan (a classic
//     closed-form: n = ln(1 / (1 − P·i/M)) / ln(1+i)).
//
// Every figure here — including the FRACTIONAL final period's exact
// dollar breakdown — was verified directly against the real
// calculator.net engine, driven via Playwright (its own HTML form fields
// and hidden `ctype` field were read from the downloaded page source, and
// its full accumulation schedule read back from its real response) — see
// payment-calculator-notes.md. The one non-obvious finding: the FINAL
// (fractional) period isn't a prorated-interest partial payment — it's a
// full payment amount scaled down by the fractional period, with the
// principal portion set to whatever's left on the balance and the
// interest portion backed out as the remainder. See buildSchedule() below.

const MAX_TERM_YEARS = 100;
const MAX_SCHEDULE_MONTHS = 1200;

function monthlyRate(annualRatePercent) {
  return Math.max(0, (Number(annualRatePercent) || 0) / 100) / 12;
}

function paymentForLoan(principal, i, n) {
  if (principal <= 0 || n <= 0) return 0;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

/** Builds the period-by-period schedule. `n` may be fractional (Fixed
 * Payments mode) — in that case the schedule runs floor(n) full payments
 * of `payment`, then one final row scaled by the fractional remainder:
 * finalPayment = payment × fraction, finalPrincipal = whatever balance is
 * left (fully retiring it), finalInterest = finalPayment − finalPrincipal
 * (backed out as the remainder, NOT computed via a prorated interest
 * rate — confirmed against the reference's own schedule, where this is
 * the only formula that reproduces its exact final-row dollar amounts). */
function buildSchedule(principal, i, n, payment) {
  const wholePeriods = Math.min(MAX_SCHEDULE_MONTHS, Math.floor(n));
  const fraction = n - wholePeriods;
  const schedule = [];
  let balance = principal;

  for (let period = 1; period <= wholePeriods; period++) {
    const interest = balance * i;
    let principalPaid = payment - interest;
    if (principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ period, interest, principal: principalPaid, balance });
  }

  if (fraction > 1e-9 && balance > 0.005 && schedule.length < MAX_SCHEDULE_MONTHS) {
    const finalPayment = payment * fraction;
    const finalPrincipal = balance;
    const finalInterest = Math.max(0, finalPayment - finalPrincipal);
    schedule.push({ period: wholePeriods + 1, interest: finalInterest, principal: finalPrincipal, balance: 0 });
  }

  return schedule;
}

function buildAnnualSchedule(monthlySchedule) {
  const annualSchedule = [];
  for (let i = 0; i < monthlySchedule.length; i += 12) {
    const yearRows = monthlySchedule.slice(i, i + 12);
    if (!yearRows.length) break;
    annualSchedule.push({
      period: annualSchedule.length + 1,
      interest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      principal: yearRows.reduce((sum, r) => sum + r.principal, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }
  return annualSchedule;
}

export function calculateFixedTerm({ loanAmount, years, annualRatePercent }) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const n = Math.max(1, Math.min(MAX_TERM_YEARS * 12, Math.round((Math.max(0, Number(years) || 0)) * 12)));
  const i = monthlyRate(annualRatePercent);

  const payment = paymentForLoan(principal, i, n);
  const totalOfPayments = payment * n;
  const totalInterest = totalOfPayments - principal;

  const monthlySchedule = buildSchedule(principal, i, n, payment);
  const annualSchedule = buildAnnualSchedule(monthlySchedule);

  return { payment, totalPayments: n, totalOfPayments, totalInterest, monthlySchedule, annualSchedule };
}

export function calculateFixedPayments({ loanAmount, monthlyPay, annualRatePercent }) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const payment = Math.max(0, Number(monthlyPay) || 0);
  const i = monthlyRate(annualRatePercent);

  // Number of periods to retire `principal` with fixed `payment` at
  // periodic rate `i`. Guard: if the payment doesn't even cover one
  // period's interest, the loan can never be paid off at this rate.
  let n;
  if (principal <= 0 || payment <= 0) {
    n = 0;
  } else if (i === 0) {
    n = principal / payment;
  } else if (payment <= principal * i) {
    n = MAX_TERM_YEARS * 12; // never pays off — clamp rather than return Infinity
  } else {
    n = Math.log(1 / (1 - (principal * i) / payment)) / Math.log(1 + i);
  }
  n = Math.min(MAX_TERM_YEARS * 12, n);

  const totalOfPayments = payment * n;
  const totalInterest = totalOfPayments - principal;
  const payoffYears = n / 12;

  const monthlySchedule = buildSchedule(principal, i, n, payment);
  const annualSchedule = buildAnnualSchedule(monthlySchedule);

  return { payment, totalPeriods: n, totalOfPayments, totalInterest, payoffYears, monthlySchedule, annualSchedule };
}

/** "11 years 6.98 months" — matches the reference's own display format
 * exactly: whole years, then the remaining months WITH two decimal
 * places (not rounded to a whole month). */
export function formatYearsAndDecimalMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths - years * 12;
  const yearLabel = years === 1 ? "year" : "years";
  return `${years} ${yearLabel} ${months.toFixed(2)} months`;
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
