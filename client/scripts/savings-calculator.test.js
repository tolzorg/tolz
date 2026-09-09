// Plain-Node test suite for the Savings Calculator engine. Run with:
//   node scripts/savings-calculator.test.js
//
// Every scenario here was verified against the LIVE
// calculator.net/savings-calculator.html reference via plain GET requests
// (the form submits GET to the same page, server-rendered — no Playwright
// needed) — see savingsCalculatorEngine.js's own doc comment and
// savings-calculator-notes.md for the full derivation. Figures are
// checked to the penny.

import { calculateSavings, validateSavingsInputs } from "../src/utils/savingsCalculatorEngine.js";

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

// ─────────────────────────────────────────────────────────────────
// 1. Default/screenshot scenario — annual contribution + growth, annual
//    compound, no tax. Reference: $20,000 / $5,000 (+3%/yr) / 3% / annually
//    / 10 years / 0% tax → End balance $92,116.99.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 20000, annualContribution: 5000, annualContributionIncreasePercent: 3,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 3, compound: "annually", years: 10, taxRatePercent: 0,
  });
  ok("S1 endingBalance", approx(r.endingBalance, 92116.99), r.endingBalance);
  ok("S1 totalContributions", approx(r.totalContributions, 57319.40), r.totalContributions);
  ok("S1 totalInterestAfterTax", approx(r.totalInterestAfterTax, 14797.59), r.totalInterestAfterTax);
  ok("S1 hasTax is false", r.hasTax === false);
  ok("S1 Year1 deposit (initial + annual)", approx(r.annualSchedule[0].deposit, 25000.00));
  ok("S1 Year1 interest", approx(r.annualSchedule[0].interest, 600.00));
  ok("S1 Year2 deposit (3% escalated)", approx(r.annualSchedule[1].deposit, 5150.00));
  ok("S1 Year10 deposit", approx(r.annualSchedule[9].deposit, 6523.87));
  ok("S1 Month1 interest (EAR-bridged monthly rate)", approx(r.monthlySchedule[0].interest, 49.33));
  ok("S1 Month12 deposit (annual contribution lands here)", approx(r.monthlySchedule[11].deposit, 5000.00));
  ok("S1 Month12 balance matches Year1 balance", approx(r.monthlySchedule[11].balance, 25600.00));
  ok("S1 annual/monthly schedules agree at year end", approx(r.annualSchedule[9].balance, r.monthlySchedule[119].balance));
}

// ─────────────────────────────────────────────────────────────────
// 2. Monthly contribution + growth, monthly compound, no tax. Reference:
//    $1,000 / $100/mo (+5%/yr) / 6% monthly / 3 years → $5,322.21.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 1000, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 100, monthlyContributionIncreasePercent: 5,
    interestRatePercent: 6, compound: "monthly", years: 3, taxRatePercent: 0,
  });
  ok("S2 endingBalance", approx(r.endingBalance, 5322.21));
  ok("S2 totalContributions", approx(r.totalContributions, 3783.00));
  ok("S2 totalInterestAfterTax", approx(r.totalInterestAfterTax, 539.21));
  ok("S2 Month1 deposit (initial + monthly bundled)", approx(r.monthlySchedule[0].deposit, 1100.00));
  ok("S2 Month1 interest (on initial only, pre-deposit)", approx(r.monthlySchedule[0].interest, 5.00));
  ok("S2 Month1 balance", approx(r.monthlySchedule[0].balance, 1105.00));
  ok("S2 Month13 deposit (5% escalated into year 2)", approx(r.monthlySchedule[12].deposit, 105.00));
  ok("S2 Month25 deposit (5% escalated into year 3)", approx(r.monthlySchedule[24].deposit, 110.25));
}

// ─────────────────────────────────────────────────────────────────
// 3. Tax rate 25%, monthly compound, no contributions — isolates the
//    per-period tax deduction. Reference: $10,000 / 6% monthly / 1yr /
//    25% tax → End balance $10,459.40, Total tax $153.13.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 10000, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 6, compound: "monthly", years: 1, taxRatePercent: 25,
  });
  ok("S3 endingBalance", approx(r.endingBalance, 10459.40));
  ok("S3 totalInterestAfterTax", approx(r.totalInterestAfterTax, 459.40));
  ok("S3 totalTax", approx(r.totalTax, 153.13));
  ok("S3 hasTax is true", r.hasTax === true);
}

// ─────────────────────────────────────────────────────────────────
// 4. Default scenario + 25% tax combined — confirms contributions are
//    untouched by tax while interest/tax split correctly. Reference:
//    End balance $88,086.45, Total tax $3,589.02.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 20000, annualContribution: 5000, annualContributionIncreasePercent: 3,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 3, compound: "annually", years: 10, taxRatePercent: 25,
  });
  ok("S4 endingBalance", approx(r.endingBalance, 88086.45));
  ok("S4 totalContributions unaffected by tax", approx(r.totalContributions, 57319.40));
  ok("S4 totalInterestAfterTax", approx(r.totalInterestAfterTax, 10767.06));
  ok("S4 totalTax", approx(r.totalTax, 3589.02));
  ok("S4 Year1 interest is GROSS (pre-tax)", approx(r.annualSchedule[0].interest, 597.96));
  ok("S4 Year1 tax = interest × 25%", approx(r.annualSchedule[0].tax, 149.49));
  ok("S4 Year1 balance", approx(r.annualSchedule[0].balance, 25448.47));
  ok("S4 Year10 balance = endingBalance", approx(r.annualSchedule[9].balance, r.endingBalance));
}

// ─────────────────────────────────────────────────────────────────
// 5. Every compound frequency, spot-checked against the live reference
//    (5yr, $10,000, 6%, no contributions, no tax).
// ─────────────────────────────────────────────────────────────────
{
  const expected = {
    annually: 13382.26, monthly: 13488.50, quarterly: 13468.55, semiannually: 13439.16,
    daily: 13498.26, continuously: 13498.59,
  };
  for (const [compound, exp] of Object.entries(expected)) {
    const r = calculateSavings({
      initialDeposit: 10000, annualContribution: 0, annualContributionIncreasePercent: 0,
      monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
      interestRatePercent: 6, compound, years: 5, taxRatePercent: 0,
    });
    ok(`S5 compound=${compound}`, approx(r.endingBalance, exp), r.endingBalance);
  }
}

// ─────────────────────────────────────────────────────────────────
// 6. Fractional years — a clean half-year (2.5) and an odd fraction
//    (2.02) that forces ceil-rounding of the month count plus a
//    prorated final month, both confirmed against the live reference.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 1000, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 5, compound: "annually", years: 2.5, taxRatePercent: 0,
  });
  ok("S6 endingBalance (2.5yr)", approx(r.endingBalance, 1129.73));
  ok("S6 partial final year has no deposit", approx(r.annualSchedule[2].deposit, 0));
  ok("S6 partial final year interest is fraction-scaled", approx(r.annualSchedule[2].interest, 27.23));
}
{
  const r = calculateSavings({
    initialDeposit: 1000, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 5, compound: "annually", years: 2.02, taxRatePercent: 0,
  });
  ok("S7 totalMonths rounds UP (24.24 → 25)", r.monthlySchedule.length === 25, r.monthlySchedule.length);
  ok("S7 last month's interest prorated by leftover fraction", approx(r.monthlySchedule[24].interest, 1.08));
}

// ─────────────────────────────────────────────────────────────────
// 8. Comprehensive combined scenario — quarterly compound, BOTH
//    contribution streams growing at different rates, AND a 15% tax
//    rate simultaneously. Reference: End balance $50,346.37.
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: 15000, annualContribution: 2000, annualContributionIncreasePercent: 4,
    monthlyContribution: 200, monthlyContributionIncreasePercent: 2,
    interestRatePercent: 4.5, compound: "quarterly", years: 6, taxRatePercent: 15,
  });
  ok("S8 endingBalance", approx(r.endingBalance, 50346.37));
  ok("S8 totalContributions", approx(r.totalContributions, 28405.44));
  ok("S8 totalInterestAfterTax", approx(r.totalInterestAfterTax, 6940.93));
  ok("S8 Year1 deposit (both streams, unescalated)", approx(r.annualSchedule[0].deposit, 19400.00));
  ok("S8 Year1 interest", approx(r.annualSchedule[0].interest, 734.20));
  ok("S8 Year1 tax", approx(r.annualSchedule[0].tax, 110.13));
  ok("S8 Year2 deposit (both streams escalated once)", approx(r.annualSchedule[1].deposit, 4528.00));
  ok("S8 Year3 deposit (both streams escalated twice)", approx(r.annualSchedule[2].deposit, 4660.16));
  ok("S8 Year6 balance = endingBalance", approx(r.annualSchedule[5].balance, r.endingBalance));
}

// ─────────────────────────────────────────────────────────────────
// 9. Validation — confirmed live: negative rate/out-of-range tax/
//    non-positive years are rejected; 0% rate and 100% tax are allowed.
// ─────────────────────────────────────────────────────────────────
ok("validate: negative interest rate blocked", validateSavingsInputs({ interestRatePercent: -1, taxRatePercent: 0, years: 5 }) === "Please provide a positive interest rate value.");
ok("validate: negative tax rate blocked", validateSavingsInputs({ interestRatePercent: 5, taxRatePercent: -1, years: 5 }) === "Please provide a positive tax rate value.");
ok("validate: tax rate over 100 blocked", validateSavingsInputs({ interestRatePercent: 5, taxRatePercent: 150, years: 5 }) === "Please provide a positive tax rate value.");
ok("validate: zero years blocked", validateSavingsInputs({ interestRatePercent: 5, taxRatePercent: 0, years: 0 }) === "Please provide a positive holding years value.");
ok("validate: negative years blocked", validateSavingsInputs({ interestRatePercent: 5, taxRatePercent: 0, years: -3 }) === "Please provide a positive holding years value.");
ok("validate: 0% interest rate allowed", validateSavingsInputs({ interestRatePercent: 0, taxRatePercent: 0, years: 5 }) === null);
ok("validate: 100% tax rate allowed", validateSavingsInputs({ interestRatePercent: 5, taxRatePercent: 100, years: 5 }) === null);
ok("validate: default scenario passes", validateSavingsInputs({ interestRatePercent: 3, taxRatePercent: 0, years: 10 }) === null);

// ─────────────────────────────────────────────────────────────────
// 10. Reference's own permissiveness: negative initial deposit and
//     negative contributions are accepted and computed literally
//     (confirmed live — a -$1,000 deposit at 5% for 1 year produces
//     exactly -$1,050.00, not a clamp to 0 or a validation error).
// ─────────────────────────────────────────────────────────────────
{
  const r = calculateSavings({
    initialDeposit: -1000, annualContribution: 0, annualContributionIncreasePercent: 0,
    monthlyContribution: 0, monthlyContributionIncreasePercent: 0,
    interestRatePercent: 5, compound: "annually", years: 1, taxRatePercent: 0,
  });
  ok("S10 negative initial deposit computed literally", approx(r.endingBalance, -1050.00));
}

console.log(`\nSavings Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
