// Lease Calculator engine — matches calculator.net/lease-calculator.html
// (a GET form, decoded with live probes; see scripts/lease-calculator.test.js).
//
// A lease is an annuity whose value is the asset value less the present value
// of the residual (balloon) at the end: payment = (A − R·(1+i)^−n)·i ÷
// (1 − (1+i)^−n), monthly rate i, ordinary (end-of-month) payments.
//  • "Fixed Rate" solves the monthly payment; "Fixed Pay" solves the rate.
//  • Total interest = payment × n − (A − R); the chart's "Principal" is A − R.
//  • A payment below (A − R) ÷ n gives "With this monthly payment, the
//    interest/return rate is negative."; exactly equal gives "… is 0%."
//  • Reference quirk kept: the pie appears only when (A − R) ÷ n is below
//    whatever the Monthly Payment box holds — even on the Fixed Rate tab,
//    where that box is hidden (400 by default).
//  • When no positive rate can reproduce the asset value (e.g. a $0 asset
//    with a residual), the reference shows an empty result.
//  • The reference's own rate solver is approximate (third-decimal
//    differences up to ±0.0025 points in ~30% of cases); this engine solves
//    the rate exactly.

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";

export const LEASE_DEFAULTS = { assetValue: "20000", residualValue: "8000", years: "3", months: "0", interestRate: "6", monthlyPay: "400" };

/** Whole percent of the total; 0 when the total is 0 (never "-0"). */
const share = (v, total) => (total === 0 ? 0 : Math.round((v / total) * 100) || 0);

function leasePayment(A, R, i, n) {
  if (i === 0) return (A - R) / n;
  const d = Math.pow(1 + i, -n);
  return ((A - R * d) * i) / (1 - d);
}

/** Monthly rate j at which the payments plus the residual are worth A (decreasing in j). */
function solveMonthlyRate(A, R, n, p) {
  const pv = (j) => (p * (1 - Math.pow(1 + j, -n))) / j + R * Math.pow(1 + j, -n);
  let lo = 1e-15;
  let hi = 1;
  while (pv(hi) > A) { hi *= 2; if (hi > 1e6) return null; }
  for (let k = 0; k < 400; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > A) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * @param {{ mode: "rate"|"pay", assetValue, residualValue, years, months, interestRate, monthlyPay }} input
 */
export function calculateLease(input) {
  const fixPay = input.mode === "pay";
  const text = (k) => clean(input[k]);
  const A = num(text("assetValue"));
  const R = num(text("residualValue"));
  const years = text("years") === "" ? 0 : num(text("years"));
  const months = text("months") === "" ? 0 : num(text("months"));
  const rate = num(text("interestRate"));
  const pay = num(text("monthlyPay"));

  const errors = [];
  if (!(A >= 0)) errors.push("Please provide a positive lease product/property value.");
  if (!(R >= 0)) errors.push("Please provide a positive residual value.");
  if (!(years >= 0)) errors.push("Please provide a positive lease year value.");
  if (!(months >= 0)) errors.push("Please provide a positive lease month value.");
  if (!fixPay && !(rate >= 0)) errors.push("Please provide a positive interest value.");
  if (fixPay && !(pay > 0)) errors.push("Please provide a positive monthly pay value.");
  if (errors.length) return { errors };
  const n = years * 12 + months;
  if (!(n > 0)) return { errors: ["Please provide a positive lease term value."] };

  const principal = A - R;
  let payment;
  let headline;
  if (fixPay) {
    if (Math.abs(pay * n - principal) < 1e-9) return { message: "With this monthly payment, the interest/return rate is 0%." };
    if (pay * n < principal) return { message: "With this monthly payment, the interest/return rate is negative." };
    payment = pay;
    const j = solveMonthlyRate(A, R, n, pay);
    if (j === null) return { empty: true };
    headline = { label: "Interest/Return Rate", value: `${formatFixed(j * 1200, 3)}%` };
  } else {
    payment = leasePayment(A, R, rate / 1200, n);
    headline = { label: "Monthly Pay", value: formatMoney(payment) };
  }
  const total = payment * n;
  const interest = total - principal;
  const countText = String(Number(n.toPrecision(12)));

  return {
    headline,
    rows: [
      { label: `Total of ${countText} Monthly Payments`, value: formatMoney(total) },
      { label: "Total Interest", value: formatMoney(interest) },
    ],
    // A non-numeric Monthly Payment box (Fixed Rate tab only) still shows the pie on the reference.
    pie: Number.isNaN(pay) || principal / n < pay ? [
      { label: "Principal", value: principal, color: "#2b7ddb", percent: share(principal, total) },
      { label: "Interest", value: interest, color: "#8bbc21", percent: share(interest, total) },
    ] : null,
  };
}

/** Pie percent labels the way the reference prints them ("-1,389%"). */
export const formatPiePercent = (p) => `${formatFixed(p, 0)}%`;
