// Plain-Node test suite for the Interest Calculator engine. Run with:
//   node scripts/interest-calculator.test.js

import { calculateInterest } from "../src/utils/interestCalculatorEngine.js";

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

function approx(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

const BASE_INPUTS = {
  initialInvestment: 20_000, annualContribution: 5_000, monthlyContribution: 0,
  annualRatePercent: 5, compound: "annually", years: 5, months: 0,
  taxRatePercent: 0, inflationRatePercent: 3,
};

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks — the two screenshot examples (beginning vs end
// of period contribution timing)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateInterest({ ...BASE_INPUTS, contributeAt: "beginning" });
  ok("Beginning: Ending balance = $54,535.20", approx(r.endingBalance, 54_535.20, 0.01), `got ${r.endingBalance.toFixed(2)}`);
  ok("Beginning: Total principal = $45,000.00", approx(r.totalPrincipal, 45_000, 0.01), `got ${r.totalPrincipal.toFixed(2)}`);
  ok("Beginning: Total contributions = $25,000.00", approx(r.totalContributions, 25_000, 0.01), `got ${r.totalContributions.toFixed(2)}`);
  ok("Beginning: Total interest = $9,535.20", approx(r.totalInterest, 9_535.20, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("Beginning: Interest of initial investment = $5,525.63", approx(r.interestOfInitial, 5_525.63, 0.01), `got ${r.interestOfInitial.toFixed(2)}`);
  ok("Beginning: Interest of contributions = $4,009.56", approx(r.interestOfContributions, 4_009.56, 0.01), `got ${r.interestOfContributions.toFixed(2)}`);
  ok("Beginning: Buying power after inflation = $47,042.54", approx(r.buyingPower, 47_042.54, 0.01), `got ${r.buyingPower.toFixed(2)}`);
  ok("Beginning: annual schedule has 5 rows", r.annualSchedule.length === 5);
  ok("Beginning: monthly schedule has 60 rows", r.monthlySchedule.length === 60);
  ok("Beginning: annual schedule final balance ties to ending balance", approx(r.annualSchedule[4].balance, r.endingBalance, 0.01));
  ok("Beginning: monthly schedule final balance ties to ending balance", approx(r.monthlySchedule[59].balance, r.endingBalance, 0.01));
}

{
  const r = calculateInterest({ ...BASE_INPUTS, contributeAt: "end" });
  ok("End: Ending balance = $53,153.79", approx(r.endingBalance, 53_153.79, 0.01), `got ${r.endingBalance.toFixed(2)}`);
  ok("End: Total interest = $8,153.79", approx(r.totalInterest, 8_153.79, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("End: Interest of initial investment = $5,525.63 (same as beginning — unaffected by timing)", approx(r.interestOfInitial, 5_525.63, 0.01), `got ${r.interestOfInitial.toFixed(2)}`);
  ok("End: Interest of contributions = $2,628.16", approx(r.interestOfContributions, 2_628.16, 0.01), `got ${r.interestOfContributions.toFixed(2)}`);
  ok("End: Buying power after inflation = $45,850.92", approx(r.buyingPower, 45_850.92, 0.01), `got ${r.buyingPower.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks #2 — a nonzero Tax rate AND both annual + monthly
// contributions together ($3,000 initial, $90/yr + $90/mo, 4%,
// Compound=annually, 5yr, Tax=5%, Inflation=5%/6%). Verified EXACT against
// the REAL calculator.net engine — driven directly via Playwright and its
// own server-rendered response read back (not just eyeballing screenshots)
// — see interest-calculator-notes.md for the full derivation. This is what
// caught both the tax-model bug (tax is deducted per-period, not as one
// lump sum at the end) and confirmed the monthly-contribution cross-
// frequency formula (effectiveAnnualRate = (1+effectiveMonthlyRate)^12−1,
// not nominal×(1−tax) applied directly).
// ─────────────────────────────────────────────────────────────────

const TAX_TEST_INPUTS = {
  initialInvestment: 3_000, annualContribution: 90, monthlyContribution: 90,
  annualRatePercent: 4, compound: "annually", years: 5, months: 0,
  taxRatePercent: 5, inflationRatePercent: 5,
};

{
  const r = calculateInterest({ ...TAX_TEST_INPUTS, contributeAt: "beginning" });
  ok("TaxTest beginning: Total principal = $8,850.00", approx(r.totalPrincipal, 8_850, 0.01), `got ${r.totalPrincipal.toFixed(2)}`);
  ok("TaxTest beginning: Total contributions = $5,850.00", approx(r.totalContributions, 5_850, 0.01), `got ${r.totalContributions.toFixed(2)}`);
  ok("TaxTest beginning: Interest of initial investment = $649.96 (exact)", approx(r.interestOfInitial, 649.96, 0.01), `got ${r.interestOfInitial.toFixed(2)}`);
  ok("TaxTest beginning: Interest of the contributions = $627.24 (exact)", approx(r.interestOfContributions, 627.24, 0.01), `got ${r.interestOfContributions.toFixed(2)}`);
  ok("TaxTest beginning: Total interest (gross) = $1,277.20 (exact)", approx(r.totalInterest, 1_277.20, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("TaxTest beginning: Total tax = $63.86 (exact)", approx(r.totalTax, 63.86, 0.01), `got ${r.totalTax.toFixed(2)}`);
  ok("TaxTest beginning: Total interest after tax = $1,213.34 (exact)", approx(r.totalInterestAfterTax, 1_213.34, 0.01), `got ${r.totalInterestAfterTax.toFixed(2)}`);
  ok("TaxTest beginning: Ending balance = $10,063.34 (exact)", approx(r.endingBalance, 10_063.34, 0.01), `got ${r.endingBalance.toFixed(2)}`);
  ok("TaxTest beginning: Buying power (5% inflation) = $7,884.89 (exact)", approx(r.buyingPower, 7_884.89, 0.01), `got ${r.buyingPower.toFixed(2)}`);
}

{
  const r = calculateInterest({ ...TAX_TEST_INPUTS, contributeAt: "end" });
  ok("TaxTest end: Interest of initial investment = $649.96 (same as beginning — unaffected by timing)", approx(r.interestOfInitial, 649.96, 0.01), `got ${r.interestOfInitial.toFixed(2)}`);
  ok("TaxTest end: Interest of the contributions = $588.44 (exact)", approx(r.interestOfContributions, 588.44, 0.01), `got ${r.interestOfContributions.toFixed(2)}`);
  ok("TaxTest end: Total interest (gross) = $1,238.40 (exact)", approx(r.totalInterest, 1_238.40, 0.01), `got ${r.totalInterest.toFixed(2)}`);
  ok("TaxTest end: Total tax = $61.92 (exact)", approx(r.totalTax, 61.92, 0.01), `got ${r.totalTax.toFixed(2)}`);
  ok("TaxTest end: Total interest after tax = $1,176.48 (exact)", approx(r.totalInterestAfterTax, 1_176.48, 0.01), `got ${r.totalInterestAfterTax.toFixed(2)}`);
  ok("TaxTest end: Ending balance = $10,026.48 (exact)", approx(r.endingBalance, 10_026.48, 0.01), `got ${r.endingBalance.toFixed(2)}`);
  ok("TaxTest end: Buying power (5% inflation) = $7,856.01 (exact)", approx(r.buyingPower, 7_856.01, 0.01), `got ${r.buyingPower.toFixed(2)}`);
}

{
  // Same scenario, 6% inflation (the follow-up round the user tested) —
  // confirms Buying Power's formula still holds exactly with the
  // corrected Ending balance.
  const r6 = { ...TAX_TEST_INPUTS, inflationRatePercent: 6 };
  const beg = calculateInterest({ ...r6, contributeAt: "beginning" });
  const end = calculateInterest({ ...r6, contributeAt: "end" });
  ok("TaxTest beginning, 6% inflation: Buying power = $7,519.92 (exact)", approx(beg.buyingPower, 7_519.92, 0.01), `got ${beg.buyingPower.toFixed(2)}`);
  ok("TaxTest end, 6% inflation: Buying power = $7,492.37 (exact)", approx(end.buyingPower, 7_492.37, 0.01), `got ${end.buyingPower.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Cross-checks between beginning/end and monthly-contribution consistency
// ─────────────────────────────────────────────────────────────────

{
  const beg = calculateInterest({ ...BASE_INPUTS, contributeAt: "beginning" });
  const end = calculateInterest({ ...BASE_INPUTS, contributeAt: "end" });
  ok("Beginning-of-period always yields a higher (or equal) ending balance than end-of-period", beg.endingBalance >= end.endingBalance);
  ok("Interest of initial investment is identical regardless of contribution timing", approx(beg.interestOfInitial, end.interestOfInitial, 0.001));
}

{
  // Monthly-only contribution, monthly compounding — degenerates to a
  // plain single-frequency annuity, independently checkable by hand.
  const r = calculateInterest({
    initialInvestment: 0, annualContribution: 0, monthlyContribution: 100,
    annualRatePercent: 6, compound: "monthly", years: 10, months: 0,
    taxRatePercent: 0, inflationRatePercent: 0, contributeAt: "end",
  });
  const i = 0.06 / 12;
  const n = 120;
  const expected = 100 * (Math.pow(1 + i, n) - 1) / i;
  ok("Monthly-only, monthly-compounding ordinary annuity matches hand calc", approx(r.endingBalance, expected, 0.01), `got ${r.endingBalance.toFixed(2)} expected ${expected.toFixed(2)}`);
  ok("Total contributions = $12,000 (100/mo × 120mo)", approx(r.totalContributions, 12_000, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 0% interest rate: no growth at all, ending balance = total principal
  const r = calculateInterest({ ...BASE_INPUTS, annualRatePercent: 0, contributeAt: "end" });
  ok("0% rate: ending balance = total principal", approx(r.endingBalance, r.totalPrincipal, 0.01));
  ok("0% rate: total interest = 0", approx(r.totalInterest, 0, 0.01));

  // 0 initial investment, contributions only
  const noInitial = calculateInterest({ ...BASE_INPUTS, initialInvestment: 0, contributeAt: "end" });
  ok("$0 initial: interest of initial investment = 0", approx(noInitial.interestOfInitial, 0, 0.01));

  // 100% tax rate: tax is deducted from every period's interest as it's
  // earned (confirmed against the real reference schedule — see
  // interest-calculator-notes.md), so at 100% tax NOTHING ever compounds:
  // the account only grows from contributions, never from reinvested
  // interest. Ending balance therefore drops to exactly the principal.
  const fullTax = calculateInterest({ ...BASE_INPUTS, taxRatePercent: 100, contributeAt: "end" });
  ok("100% tax: Total interest after tax = 0 (nothing ever compounds)", approx(fullTax.totalInterestAfterTax, 0, 0.01));
  ok("100% tax: Ending balance = Total principal", approx(fullTax.endingBalance, fullTax.totalPrincipal, 0.01), `got ${fullTax.endingBalance.toFixed(2)}`);
  ok("100% tax: Total tax = Total interest (all of the gross interest is taxed away)", approx(fullTax.totalTax, fullTax.totalInterest, 0.01));

  // Negative/garbage inputs coerce safely
  const negative = calculateInterest({
    initialInvestment: -1000, annualContribution: -1, monthlyContribution: -1,
    annualRatePercent: -5, compound: "annually", years: -5, months: -3,
    taxRatePercent: -10, inflationRatePercent: -3, contributeAt: "beginning",
  });
  ok("Negative inputs: no NaN, finite ending balance", Number.isFinite(negative.endingBalance) && !Number.isNaN(negative.endingBalance));

  // Continuously compounding produces a higher balance than annual
  // compounding at the same nominal rate (more frequent compounding).
  const annualComp = calculateInterest({ ...BASE_INPUTS, compound: "annually", contributeAt: "end" });
  const continuousComp = calculateInterest({ ...BASE_INPUTS, compound: "continuously", contributeAt: "end" });
  ok("Continuous compounding yields more than annual compounding", continuousComp.endingBalance > annualComp.endingBalance);
}

console.log(`\nInterest Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
