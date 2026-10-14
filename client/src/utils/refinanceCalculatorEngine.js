// Refinance Calculator engine — matches calculator.net/refinance-calculator.html
// (a GET form, decoded with live probes; see scripts/refinance-calculator.test.js).
//
// Current loan, two ways:
//  • "I know my remaining balance": balance B, payment P, rate r → the
//    remaining months n = ⌊−ln(1 − B·i/P) ÷ ln(1+i)⌋ (⌊B/P⌋ at 0%); the
//    reference totals P × n. A payment that doesn't cover the interest is an
//    error.
//  • "I know the original loan amount": original amount, term and time
//    remaining → the original payment and today's balance (PV of the
//    remaining payments).
// New loan: principal = balance + cash out; payment over the new term at
// the new rate; upfront cost = points% × principal + costs and fees.
// APR = exact IRR of (principal − upfront) against the new payments; it's
// omitted (and the table shows plain rates) when the new rate is 0 or the
// money received isn't positive.
// The APR sentence calls the loans "similar" when the APR is within 0.1
// point of the current rate.
// Lifetime savings = old total − new total − upfront + cash out.
// Break-even = first month the cumulative interest saved reaches the upfront
// cost (only without cash out).

import { clean, num, formatFixed, formatMoney } from "./marginCalculatorEngine.js";

export const REFINANCE_DEFAULTS = {
  balance: "250000", payment: "1800", originalAmount: "300000", originalTerm: "30",
  remainingYears: "20", remainingMonths: "0", rate: "7",
  newTerm: "20", newRate: "6", points: "2", costs: "1500", cashOut: "0",
};

const annuity = (P, i, n) => (i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n)));
const presentValue = (pmt, i, n) => (i === 0 ? pmt * n : (pmt * (1 - Math.pow(1 + i, -n))) / i);
const plainNumber = (v) => String(Number(v.toPrecision(12)));
const pct3 = (v) => `${formatFixed(v, 3)}%`;
// Month counts are printed without thousands separators ("1164 months").
const months = (v) => `${Math.round(v)} months`;

function solveMonthlyRate(net, payment, n) {
  let lo = 1e-15;
  let hi = 1;
  while (presentValue(payment, hi, n) > net) { hi *= 2; if (hi > 1e6) return null; }
  for (let k = 0; k < 400; k++) {
    const mid = (lo + hi) / 2;
    if (presentValue(payment, mid, n) > net) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * @param {{ knowBalance: boolean, balance, payment, originalAmount, originalTerm, remainingYears,
 *   remainingMonths, rate, newTerm, newRate, points, costs, cashOut }} input
 */
export function calculateRefinance(input) {
  const v = (k) => num(clean(input[k]));
  const byBalance = input.knowBalance !== false;
  const rate = v("rate");
  const newTermYears = v("newTerm");
  const newRate = v("newRate");
  const points = v("points");
  const costs = v("costs");
  const cashOut = v("cashOut");
  const i = rate / 1200;

  const errors = [];
  let balance;
  let payment;
  let n;
  if (byBalance) {
    balance = v("balance");
    payment = v("payment");
    if (!(balance > 0)) errors.push("Please provide a positive remaining balance of the current loan.");
    if (!(payment > 0)) errors.push("Please provide a positive monthly payment amount of the current loan.");
    if (balance > 0 && payment > 0 && rate >= 0 && payment <= balance * i) errors.push("The monthly payment amount is not sufficient to repay the loan. Please double check.");
    if (!(rate >= 0 && rate <= 200)) errors.push("Please provide a positive interest rate that is 200% or less.");
  } else {
    const original = v("originalAmount");
    const term = v("originalTerm");
    const ry = v("remainingYears");
    const rm = v("remainingMonths");
    if (!(original > 0)) errors.push("Please provide a positive original loan amount of current loan value.");
    if (!(term > 0 && term <= 50)) errors.push("Please provide a positive loan term that is 50 years or less.");
    if (!(ry >= 0) || !(rm >= 0)) errors.push("Please provide a positive remaining year and month value.");
    else if (term > 0 && ry * 12 + rm > term * 12) errors.push("Remaining year and month cannot be bigger than loan term.");
    if (!(rate >= 0 && rate <= 200)) errors.push("Please provide a positive interest rate that is 200% or less.");
    if (!errors.length) {
      n = ry * 12 + rm;
      payment = annuity(original, i, term * 12);
      balance = presentValue(payment, i, n);
    }
  }
  if (!(newTermYears >= 0)) errors.push("Please provide a positive new loan term value.");
  else if (!(newTermYears > 0)) errors.push("Please provide a longer new loan term value.");
  if (!(newRate >= 0 && newRate <= 200)) errors.push("Please provide a positive new interest rate that is 200% or less.");
  // Reference quirk kept: this check reads the new rate, so a rate of 200%+ also trips it, and points over 100 don't.
  if (!(points >= 0) || !(newRate < 200)) errors.push("Please provide a point from 0 to 100.");
  if (!(costs >= 0)) errors.push("Please provide a positive cost value.");
  if (!Number.isFinite(cashOut)) errors.push("Please provide a numeric cash out amount.");
  if (errors.length) return { errors };

  if (byBalance) n = i === 0 ? Math.floor(balance / payment) : Math.floor(-Math.log(1 - (balance * i) / payment) / Math.log(1 + i));
  const oldTotal = payment * n;
  const oldInterest = oldTotal - balance;

  const m = Math.round(newTermYears * 12);
  const j = newRate / 1200;
  const principal = balance + cashOut;
  const newPayment = annuity(principal, j, m);
  const newTotal = newPayment * m;
  const newInterest = newTotal - principal;
  const upfront = (principal * points) / 100 + costs;
  const net = principal - upfront;
  const aprMonthly = newRate > 0 && net > 0 ? solveMonthlyRate(net, newPayment, m) : null;
  const apr = aprMonthly === null ? null : aprMonthly * 1200;

  // Break-even: cumulative interest saved ≥ upfront cost, within the new term.
  let breakEven = null;
  if (cashOut === 0) {
    let bo = balance;
    let bn = principal;
    let saved = 0;
    for (let k = 1; k <= m; k++) {
      const io = bo * i;
      const inew = bn * j;
      bo -= payment - io;
      bn -= newPayment - inew;
      saved += io - inew;
      if (saved >= upfront) { breakEven = k; break; }
    }
  }

  const rateText = `${plainNumber(rate)}%`;
  let verdict = null;
  if (apr !== null) {
    const diff = Number(apr.toFixed(3)) - rate;
    // "Similar" covers differences up to 0.1 point, inclusive (confirmed live at 6.9/7.1 vs 7, not 6.899).
    if (Math.abs(diff) <= 0.1 + 1e-9) {
      verdict = { text: `The APR for the new loan is ${pct3(apr)}, which is similar to the ${rateText} interest rate of the current loan. The financial cost of the new loan is comparable to that of the existing loan.`, tone: "neutral" };
    } else {
      const lower = diff < 0;
      verdict = {
        apr: pct3(apr), diff: pct3(Math.abs(apr - rate)), rate: rateText, lower,
        text: `The APR for the new loan is ${pct3(apr)}, which is ${pct3(Math.abs(apr - rate))} ${lower ? "lower" : "higher"} than the ${rateText} interest rate of the current loan. Refinancing would be financially ${lower ? "less" : "more"} expensive.`,
        tone: lower ? "good" : "bad",
      };
    }
  }

  const payDiff = newPayment - payment;
  const lenDiff = m - n;
  const lifetime = oldTotal - newTotal - upfront + cashOut;
  const bullets = [
    { value: `${formatMoney(Math.abs(payDiff))}/month`, text: payDiff <= 0 ? " savings in monthly pay" : " extra cost in monthly pay", good: payDiff <= 0 },
    ...(lenDiff !== 0 ? [{ value: months(Math.abs(lenDiff)), text: lenDiff < 0 ? " faster the loan will be paid off" : " slower the loan will be paid off", good: lenDiff < 0 }] : []),
    { value: formatMoney(Math.abs(lifetime)), text: lifetime >= 0 ? " lifetime savings for the new loan" : " total extra cost for the new loan", good: lifetime >= 0 },
    ...(upfront > 0 ? [{ value: formatMoney(upfront), text: " upfront cost", good: false }] : []),
    ...(upfront > 0 && breakEven !== null ? [{ label: "Break even point: ", value: months(breakEven), good: true }] : []),
  ];

  const rows = [
    ["Principal/loan amount", formatMoney(balance), formatMoney(principal), formatMoney(principal - balance)],
    ["Monthly pay", formatMoney(payment), formatMoney(newPayment), formatMoney(payDiff)],
    ["Length", months(n), months(m), months(lenDiff)],
    apr !== null
      ? ["Interest rate/APR", rateText, pct3(apr), pct3(apr - rate)]
      : ["Interest rate", rateText, `${plainNumber(newRate)}%`, `${plainNumber(newRate - rate)}%`],
    ["Total monthly payments", formatMoney(oldTotal), formatMoney(newTotal), formatMoney(newTotal - oldTotal)],
    ["Total interest", formatMoney(oldInterest), formatMoney(newInterest), formatMoney(newInterest - oldInterest)],
    ["Cost + points (upfront)", "$0", formatMoney(upfront), ""],
    ...(cashOut !== 0
      ? [["Cash out", "$0", formatMoney(cashOut), ""], ["Take home amount after cost/point", "$0", formatMoney(cashOut - upfront), ""]]
      : breakEven !== null ? [["Time to recover cost/point", "NA", months(breakEven), ""]] : []),
  ];

  return { verdict, newPayment: formatMoney(newPayment), bullets, rows };
}
