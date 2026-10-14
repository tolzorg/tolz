// Personal Loan Calculator engine — matches
// calculator.net/personal-loan-calculator.html (a GET form, decoded with
// live probes; see scripts/personal-loan-calculator.test.js).
//
// Findings, all confirmed live:
//  • n = years × 12 + months is used as entered, fractions included: the
//    payment is the standard annuity on n, the total is payment × n, and a
//    fractional final payment carries interest = payment × fraction −
//    remaining balance. "Total of N loan payments" shows N with two
//    decimals when fractional. Payoff date = start + ⌈n⌉ months, "Oct. 2031".
//  • Fee and insurance (when "Include fee and insurance" is on and either is
//    non-zero): the origination fee is a % of the loan or a $ amount,
//    deducted from the loan (→ "Cash received") or paid upfront. Insurance
//    is per month. Cost of loan = interest + fee + total insurance. APR is
//    the exact IRR of (loan − fee) against payment + insurance, × 12 — and
//    is hidden at a 0% interest rate. The "Origination fee" row appears only
//    when the fee was entered as a percentage.
//  • Schedules (annual and monthly) and the chart appear only for
//    12 < n < 720. Annual rows run start month to the month before the next
//    year; the final partial year ends at the payoff month. Dates use
//    two-digit years ("10/26-9/27"), monthly rows "10/2026".

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";

export const PERSONAL_LOAN_DEFAULTS = {
  loanAmount: "20000", interestRate: "10", years: "5", months: "0",
  feeAmount: "5", insurance: "0",
};
// The reference colours slices by position.
const PIE_COLORS = ["#2b7ddb", "#8bbc21", "#910000", "#1aadce"];
export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function annuityPayment(principal, i, n) {
  return i === 0 ? principal / n : (principal * i) / (1 - Math.pow(1 + i, -n));
}

/** Monthly rate j with PV of n payments = target (exact bisection). */
function solveMonthlyRate(target, payment, n) {
  const pv = (j) => (j === 0 ? payment * n : (payment * (1 - Math.pow(1 + j, -n))) / j);
  let lo = 0;
  let hi = 1;
  while (pv(hi) > target && hi < 1e6) hi *= 2;
  for (let k = 0; k < 300; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const addMonths = (month, year, k) => {
  const idx = (month - 1) + k;
  return { month: ((idx % 12) + 12) % 12 + 1, year: year + Math.floor(idx / 12) };
};
const shortDate = (d) => `${d.month}/${((d.year % 100) + 100) % 100}`;

/**
 * @param {{ loanAmount, interestRate, years, months, startMonth, startYear,
 *   includeFees: boolean, feeAmount, feeType: "percentage"|"amount", feePaid: "deduct"|"upfront", insurance }} input
 */
export function calculatePersonalLoan(input) {
  const text = (k) => clean(input[k]);
  const P = num(text("loanAmount"));
  const rate = num(text("interestRate"));
  const years = text("years") === "" ? 0 : num(text("years"));
  const months = text("months") === "" ? 0 : num(text("months"));
  const startYear = num(text("startYear"));
  const startMonth = Math.min(12, Math.max(1, Math.round(Number(input.startMonth) || 1)));
  const include = Boolean(input.includeFees);
  const feeRaw = include ? (text("feeAmount") === "" ? 0 : num(text("feeAmount"))) : 0;
  const insurance = include ? (text("insurance") === "" ? 0 : num(text("insurance"))) : 0;
  const percentFee = input.feeType !== "amount";

  const errors = [];
  if (!(P > 0)) errors.push("Please provide a positive loan amount.");
  if (!(rate >= 0)) errors.push("Please provide a positive interest rate value.");
  if (!(years >= 0)) errors.push("Please provide a positive loan term year value.");
  if (!(months >= 0)) errors.push("Please provide a positive loan term month value.");
  if (!(startYear >= 0)) errors.push("Please provide a positive start date value.");
  if (include && !(feeRaw >= 0)) errors.push("Please provide a positive origination fee amount.");
  if (include && !(insurance >= 0)) errors.push("Please provide a personal loan insurance amount.");
  if (errors.length) return { errors };
  const n = years * 12 + months;
  if (!(n > 0)) return { errors: ["Please provide a positive loan term value."] };
  if (include && percentFee && feeRaw >= 100) return { errors: ["Origination fee percentage cannot be more than 100%."] };
  if (include && !percentFee && feeRaw >= P) return { errors: ["Origination fee cannot be more than loan amount."] };

  const i = rate / 1200;
  const payment = annuityPayment(P, i, n);
  const totalPayments = payment * n;
  const interest = totalPayments - P;
  const fee = percentFee ? (P * feeRaw) / 100 : feeRaw;
  const totalInsurance = insurance * n;
  const extras = include && (fee > 0 || insurance > 0);
  const deducted = input.feePaid !== "upfront";

  const payoff = addMonths(startMonth, startYear, Math.ceil(n - 1e-9));
  const payoffText = `${MONTH_ABBR[payoff.month - 1]}. ${payoff.year}`;
  const countText = Number.isInteger(n) ? formatFixed(n, 0) : formatFixed(n, 2);

  const rows = [];
  if (extras && deducted) rows.push({ label: "Cash received", value: formatMoney(P - fee) });
  if (extras && insurance > 0) rows.push({ label: "Monthly pay + insurance", value: formatMoney(payment + insurance) });
  rows.push({ label: `Total of ${countText} loan payments`, value: formatMoney(totalPayments) });
  rows.push({ label: "Total interest", value: formatMoney(interest) });
  if (extras) {
    if (insurance > 0) rows.push({ label: "Total insurance", value: formatMoney(totalInsurance) });
    if (percentFee && fee > 0) rows.push({ label: "Origination fee", value: formatMoney(fee) });
    rows.push({ label: "Cost of loan", value: formatMoney(interest + fee + totalInsurance), help: "The total amount of interest, fee, and insurance." });
    if (rate > 0) {
      const apr = solveMonthlyRate(P - fee, payment + insurance, n) * 1200;
      rows.push({ label: "APR", value: `${formatFixed(apr, 3)}%`, help: "The Annual Percentage Rate (APR) is the annualized cost of borrowing money, including interest, fees, and other related costs. It is a more precise indicator of the real cost of the loan." });
    }
  }
  rows.push({ label: "Payoff date", value: payoffText });

  const pieSegments = [
    { label: extras && deducted && fee > 0 ? "Cash received" : "Loan amount", value: extras && deducted ? P - fee : P },
    ...(extras && fee > 0 ? [{ label: "Origination fee", value: fee }] : []),
    // Quirk kept: the chart counts insurance for every started month (⌈n⌉), the rows for n.
    ...(extras && insurance > 0 ? [{ label: "Insurance", value: insurance * Math.ceil(n - 1e-9) }] : []),
    { label: "Interest", value: interest },
  ].map((seg, k) => ({ ...seg, color: PIE_COLORS[k] }));
  const pieTotal = pieSegments.reduce((s, x) => s + x.value, 0);
  const pie = pieSegments.map((s) => ({ ...s, percent: Math.round((s.value / pieTotal) * 100) }));

  return {
    principal: P,
    payment: formatMoney(payment),
    rows,
    pie,
    schedule: n > 12 && n < 720 ? buildSchedule({ P, i, n, payment, startMonth, startYear, payoff }) : null,
  };
}

/**
 * Month-by-month amortization of P at monthly rate i over n payments, the
 * calculator.net way: n may be fractional, and the final partial payment
 * carries interest = payment × fraction − remaining balance. Shared with
 * the Boat Loan Calculator.
 */
export function amortizeMonthly({ P, i, n, payment }) {
  const whole = Math.floor(n + 1e-9);
  const frac = n - whole;
  const rows = [];
  let balance = P;
  for (let k = 0; k < whole; k++) {
    const interest = balance * i;
    const principal = payment - interest;
    // At 0% the balance is exactly P − k × payment; accumulating it drifts by a float ulp at half cents.
    balance = i === 0 ? P - (k + 1) * payment : balance - principal;
    rows.push({ index: k + 1, interest, principal, balance });
  }
  if (frac > 1e-9) rows.push({ index: whole + 1, interest: payment * frac - balance, principal: balance, balance: 0 });
  return rows;
}

function buildSchedule({ P, i, n, payment, startMonth, startYear, payoff }) {
  const monthly = amortizeMonthly({ P, i, n, payment }).map((r) => ({ ...r, date: addMonths(startMonth, startYear, r.index - 1) }));

  const annual = [];
  for (let start = 0; start < monthly.length; start += 12) {
    const slice = monthly.slice(start, start + 12);
    const full = slice.length === 12;
    const first = addMonths(startMonth, startYear, start);
    const last = full ? addMonths(startMonth, startYear, start + 11) : payoff;
    annual.push({
      year: annual.length + 1,
      date: `${shortDate(first)}-${shortDate(last)}`,
      interest: slice.reduce((s, r) => s + r.interest, 0),
      principal: slice.reduce((s, r) => s + r.principal, 0),
      balance: slice[slice.length - 1].balance,
    });
  }
  return {
    annual,
    monthly: monthly.map((r) => ({ ...r, dateText: `${r.date.month}/${r.date.year}` })),
  };
}

/** The reference's schedule money format (the same as the result rows). */
export const formatScheduleMoney = formatMoney;
