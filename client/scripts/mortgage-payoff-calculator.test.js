// Plain-Node test suite for the Mortgage Payoff Calculator engine. Run with:
//   node scripts/mortgage-payoff-calculator.test.js
//
// Every scenario below was verified against the LIVE reference site
// (plain GET requests to calculator.net/mortgage-payoff-calculator.html,
// which computes server-side and renders the full result — not just
// screenshots) across both calculators (known remaining term / known
// balance+payment) and all 4 repayment options, including combined
// extra-payment types. See mortgage-payoff-calculator-notes.md.

import { calculateFromRemainingTerm, calculateFromBalance } from "../src/utils/mortgagePayoffCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function approx(a, b, tolerance = 0.02) {
  return Math.abs(a - b) <= tolerance;
}

const BASE1 = { loanAmount: 400000, loanTermYears: 30, annualRatePercent: 6, remainingYears: 25, remainingMonths: 0 };

// ─────────────────────────────────────────────────────────────────
// 1. Calculator 1 — "Payback altogether"
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "together" });
  ok("together: balance (Payoff Amount) 372,217.43", approx(r.balance, 372217.43), `got ${r.balance.toFixed(2)}`);
  ok("together: totalIfPayoff 516,109.55", approx(r.totalIfPayoff, 516109.55), `got ${r.totalIfPayoff.toFixed(2)}`);
  ok("together: totalInterestIfPayoff 116,109.55", approx(r.totalInterestIfPayoff, 116109.55), `got ${r.totalInterestIfPayoff.toFixed(2)}`);
  ok("together: monthlyPay 2,398.20", approx(r.monthlyPay, 2398.20), `got ${r.monthlyPay.toFixed(2)}`);
  ok("together: originalTotalPayments 863,352.76", approx(r.originalTotalPayments, 863352.76), `got ${r.originalTotalPayments.toFixed(2)}`);
  ok("together: originalTotalInterest 463,352.76", approx(r.originalTotalInterest, 463352.76), `got ${r.originalTotalInterest.toFixed(2)}`);
  ok("together: remainingTotalPayments 719,460.63", approx(r.remainingTotalPayments, 719460.63), `got ${r.remainingTotalPayments.toFixed(2)}`);
  ok("together: remainingTotalInterest 347,243.20", approx(r.remainingTotalInterest, 347243.20), `got ${r.remainingTotalInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 2. Calculator 1 — "Normal repayment" (same 5 figures as "together"'s
//    "original payoff schedule" block)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "original" });
  ok("original: monthlyPay 2,398.20", approx(r.monthlyPay, 2398.20));
  ok("original: originalTotalPayments 863,352.76", approx(r.originalTotalPayments, 863352.76));
  ok("original: originalTotalInterest 463,352.76", approx(r.originalTotalInterest, 463352.76));
  ok("original: remainingTotalPayments 719,460.63", approx(r.remainingTotalPayments, 719460.63));
  ok("original: remainingTotalInterest 347,243.20", approx(r.remainingTotalInterest, 347243.20));
}

// ─────────────────────────────────────────────────────────────────
// 3. Calculator 1 — "Repayment with extra payments" ($500/month)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "extra", extraMonthly: 500 });
  ok("extra $500/mo: payoff in 207 months (17y 3m)", r.newMonths === 207, `got ${r.newMonths}`);
  ok("extra $500/mo: newMonthlyPay 2,898.20", approx(r.newMonthlyPay, 2898.20));
  ok("extra $500/mo: showMonthlyPayRow true", r.showMonthlyPayRow === true);
  ok("extra $500/mo: newTotalPayments (full lifetime) 741,046.55", approx(r.newTotalPayments, 741046.55, 0.05), `got ${r.newTotalPayments.toFixed(2)}`);
  ok("extra $500/mo: newTotalInterest (full lifetime) 341,046.55", approx(r.newTotalInterest, 341046.55, 0.05), `got ${r.newTotalInterest.toFixed(2)}`);
  ok("extra $500/mo: newRemainingPayments 597,154.42", approx(r.newRemainingPayments, 597154.42, 0.02), `got ${r.newRemainingPayments.toFixed(2)}`);
  ok("extra $500/mo: newRemainingInterest 224,937.00", approx(r.newRemainingInterest, 224937.00, 0.02), `got ${r.newRemainingInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 4. Calculator 1 — "Repayment with extra payments" ($1,200/year)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "extra", extraYearly: 1200 });
  ok("extra $1200/yr: payoff in 276 months (23y)", r.newMonths === 276, `got ${r.newMonths}`);
  ok("extra $1200/yr: showMonthlyPayRow false", r.showMonthlyPayRow === false);
  ok("extra $1200/yr: newTotalPayments 829,892.17", approx(r.newTotalPayments, 829892.17, 0.05), `got ${r.newTotalPayments.toFixed(2)}`);
  ok("extra $1200/yr: newTotalInterest 429,892.17", approx(r.newTotalInterest, 429892.17, 0.05), `got ${r.newTotalInterest.toFixed(2)}`);
  ok("extra $1200/yr: newRemainingPayments 686,000.04", approx(r.newRemainingPayments, 686000.04, 0.02), `got ${r.newRemainingPayments.toFixed(2)}`);
  ok("extra $1200/yr: newRemainingInterest 313,782.61", approx(r.newRemainingInterest, 313782.61, 0.02), `got ${r.newRemainingInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 5. Calculator 1 — "Repayment with extra payments" ($10,000 one-time)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "extra", extraOneTime: 10000 });
  ok("extra $10k one-time: payoff in 283 months (23y 7m)", r.newMonths === 283, `got ${r.newMonths}`);
  ok("extra $10k one-time: newRemainingPayments 686,866.78", approx(r.newRemainingPayments, 686866.78, 0.02), `got ${r.newRemainingPayments.toFixed(2)}`);
  ok("extra $10k one-time: newRemainingInterest 314,649.35", approx(r.newRemainingInterest, 314649.35, 0.02), `got ${r.newRemainingInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 6. Calculator 1 — combined extra-payment types (monthly + yearly + one-time)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "extra", extraMonthly: 500, extraYearly: 1200, extraOneTime: 10000 });
  ok("combined extras: payoff in 187 months (15y 7m)", r.newMonths === 187, `got ${r.newMonths}`);
  ok("combined extras: showMonthlyPayRow false", r.showMonthlyPayRow === false);
  ok("combined extras: newTotalPayments 711,792.84", approx(r.newTotalPayments, 711792.84, 0.05), `got ${r.newTotalPayments.toFixed(2)}`);
  ok("combined extras: newTotalInterest 311,792.84", approx(r.newTotalInterest, 311792.84, 0.05), `got ${r.newTotalInterest.toFixed(2)}`);
  ok("combined extras: newRemainingPayments 567,900.72", approx(r.newRemainingPayments, 567900.72, 0.05), `got ${r.newRemainingPayments.toFixed(2)}`);
  ok("combined extras: newRemainingInterest 195,683.29", approx(r.newRemainingInterest, 195683.29, 0.05), `got ${r.newRemainingInterest.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// 7. Calculator 1 — Biweekly repayment
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromRemainingTerm({ ...BASE1, payoffOption: "biweekly" });
  ok("biweekly: payoff in 254 months (21y 2m)", r.newMonths === 254, `got ${r.newMonths}`);
  ok("biweekly: biweeklyPayment 1,199.10", approx(r.biweeklyPayment, 1199.10));
  ok("biweekly: newRemainingPayments 657,591.57", approx(r.newRemainingPayments, 657591.57, 0.02), `got ${r.newRemainingPayments.toFixed(2)}`);
  ok("biweekly: newRemainingInterest 285,374.14", approx(r.newRemainingInterest, 285374.14, 0.02), `got ${r.newRemainingInterest.toFixed(2)}`);
  ok("biweekly: showMonthlyPayRow false (reference's biweekly table has no Monthly pay row)", r.showMonthlyPayRow === false);
}

// ─────────────────────────────────────────────────────────────────
// 8. Calculator 2 — "If you don't know the remaining loan term"
//    (Unpaid principal $230,000, monthly payment $1,500, 6%)
// ─────────────────────────────────────────────────────────────────

const BASE2 = { unpaidPrincipal: 230000, monthlyPayment: 1500, annualRatePercent: 6 };

{
  const rOrig = calculateFromBalance({ ...BASE2, payoffOption: "original" });
  ok("calc2 original: remainingTotalMonths 292 (24y 4m)", rOrig.remainingTotalMonths === 292, `got ${rOrig.remainingTotalMonths}`);
  ok("calc2 original: remainingTotalPayments 437,677.36", approx(rOrig.remainingTotalPayments, 437677.36), `got ${rOrig.remainingTotalPayments.toFixed(2)}`);
  ok("calc2 original: remainingTotalInterest 207,677.36", approx(rOrig.remainingTotalInterest, 207677.36), `got ${rOrig.remainingTotalInterest.toFixed(2)}`);

  const rExtra = calculateFromBalance({ ...BASE2, payoffOption: "extra", extraMonthly: 500 });
  ok("calc2 extra $500/mo: payoff in 172 months (14y 4m)", rExtra.newMonths === 172, `got ${rExtra.newMonths}`);
  ok("calc2 extra $500/mo: newTotalPayments 343,122.63", approx(rExtra.newTotalPayments, 343122.63), `got ${rExtra.newTotalPayments.toFixed(2)}`);
  ok("calc2 extra $500/mo: newTotalInterest 113,122.63", approx(rExtra.newTotalInterest, 113122.63), `got ${rExtra.newTotalInterest.toFixed(2)}`);

  const rBiweekly = calculateFromBalance({ ...BASE2, payoffOption: "biweekly" });
  ok("calc2 biweekly: payoff in 248 months (20y 8m)", rBiweekly.newMonths === 248, `got ${rBiweekly.newMonths}`);
  ok("calc2 biweekly: biweeklyPayment 750.00", approx(rBiweekly.biweeklyPayment, 750));
  ok("calc2 biweekly: newTotalPayments 401,486.57", approx(rBiweekly.newTotalPayments, 401486.57), `got ${rBiweekly.newTotalPayments.toFixed(2)}`);
  ok("calc2 biweekly: newTotalInterest 171,486.57", approx(rBiweekly.newTotalInterest, 171486.57), `got ${rBiweekly.newTotalInterest.toFixed(2)}`);
}

console.log(`\nMortgage Payoff Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
