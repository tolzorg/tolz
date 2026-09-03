// Plain-Node test suite for the Auto Loan Calculator engine. Run with:
//   node scripts/auto-loan-calculator.test.js

import { calculateFromPrice, calculateFromPayment } from "../src/utils/autoLoanCalculatorEngine.js";

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
  autoPrice: 50_000, cashIncentives: 0, downPayment: 10_000, tradeInValue: 0, amountOwedOnTradeIn: 0,
  loanTermMonths: 60, annualRatePercent: 5, salesTaxPercent: 7, fees: 2_000,
};

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks — the two screenshot examples (with & without
// "Include taxes and fees in loan")
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateFromPrice({ ...BASE_INPUTS, includeTaxesFeesInLoan: false });
  ok("Not financed: Total Loan Amount = $40,000.00", approx(r.totalLoanAmount, 40_000, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("Not financed: Sale Tax = $3,500.00", approx(r.saleTax, 3_500, 0.01), `got ${r.saleTax.toFixed(2)}`);
  ok("Not financed: Upfront Payment = $15,500.00", approx(r.upfrontPayment, 15_500, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("Not financed: Monthly Pay = $754.85", approx(r.monthlyPayment, 754.85, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("Not financed: Total of 60 Payments = $45,290.96", approx(r.totalOfPayments, 45_290.96, 0.05), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Not financed: Total Loan Interest = $5,290.96", approx(r.totalInterest, 5_290.96, 0.05), `got ${r.totalInterest.toFixed(2)}`);
  ok("Not financed: Total Cost = $60,790.96", approx(r.totalCost, 60_790.96, 0.05), `got ${r.totalCost.toFixed(2)}`);
  ok("Not financed: schedule has 60 rows ending at $0", r.schedule.length === 60 && approx(r.schedule[59].balance, 0, 0.01));
}

{
  const r = calculateFromPrice({ ...BASE_INPUTS, includeTaxesFeesInLoan: true });
  ok("Financed: Total Loan Amount = $45,500.00", approx(r.totalLoanAmount, 45_500, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("Financed: Upfront Payment = $10,000.00 (down payment only)", approx(r.upfrontPayment, 10_000, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("Financed: Monthly Pay = $858.64", approx(r.monthlyPayment, 858.64, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("Financed: Total of 60 Payments = $51,518.47", approx(r.totalOfPayments, 51_518.47, 0.05), `got ${r.totalOfPayments.toFixed(2)}`);
  ok("Financed: Total Loan Interest = $6,018.47", approx(r.totalInterest, 6_018.47, 0.05), `got ${r.totalInterest.toFixed(2)}`);
  ok("Financed: Total Cost = $61,518.47", approx(r.totalCost, 61_518.47, 0.05), `got ${r.totalCost.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks #2 — a second side-by-side comparison, this time
// with every field nonzero (Cash Incentives $32, Down Payment $32,
// Trade-in $32, Amount Owed $32, Sales Tax 32%), across BOTH tabs and
// BOTH the financed/not-financed checkbox. This is what caught the
// Sales-Tax/Total-Cost Cash-Incentives bug: the original example above
// had Cash Incentives = $0, which couldn't distinguish the two formulas.
// ─────────────────────────────────────────────────────────────────

const TAX_TEST_INPUTS = {
  cashIncentives: 32, downPayment: 32, tradeInValue: 32, amountOwedOnTradeIn: 32,
  loanTermMonths: 32, annualRatePercent: 32, salesTaxPercent: 32, fees: 32,
};

{
  // "Total Price" tab, Auto Price $3,000, NOT financed
  const r = calculateFromPrice({ ...TAX_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: false });
  ok("TaxTest not-financed: Total Loan Amount = $2,936.00", approx(r.totalLoanAmount, 2_936, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("TaxTest not-financed: Sale Tax = $939.52", approx(r.saleTax, 939.52, 0.01), `got ${r.saleTax.toFixed(2)}`);
  ok("TaxTest not-financed: Upfront Payment = $1,003.52", approx(r.upfrontPayment, 1_003.52, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("TaxTest not-financed: Monthly Pay = $137.55", approx(r.monthlyPayment, 137.55, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("TaxTest not-financed: Total Cost = $5,404.97", approx(r.totalCost, 5_404.97, 0.02), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Total Price" tab, Auto Price $3,000, financed
  const r = calculateFromPrice({ ...TAX_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: true });
  ok("TaxTest financed: Total Loan Amount = $3,907.52", approx(r.totalLoanAmount, 3_907.52, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("TaxTest financed: Monthly Pay = $183.06", approx(r.monthlyPayment, 183.06, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("TaxTest financed: Upfront Payment = $32.00", approx(r.upfrontPayment, 32, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("TaxTest financed: Total Cost = $5,889.89", approx(r.totalCost, 5_889.89, 0.02), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Monthly Payment" tab, target $780/mo, NOT financed
  const r = calculateFromPayment({ ...TAX_TEST_INPUTS, targetMonthlyPayment: 780, includeTaxesFeesInLoan: false });
  ok("TaxTest reverse not-financed: Vehicle Price = $16,713.64", approx(r.autoPrice, 16_713.64, 0.02), `got ${r.autoPrice.toFixed(2)}`);
  ok("TaxTest reverse not-financed: Total Loan Amount = $16,649.64", approx(r.totalLoanAmount, 16_649.64, 0.02), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("TaxTest reverse not-financed: Sale Tax = $5,327.88", approx(r.saleTax, 5_327.88, 0.05), `got ${r.saleTax.toFixed(2)}`);
  ok("TaxTest reverse not-financed: Upfront Payment = $5,391.88", approx(r.upfrontPayment, 5_391.88, 0.05), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("TaxTest reverse not-financed: Total Cost = $30,351.88", approx(r.totalCost, 30_351.88, 0.05), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Monthly Payment" tab, target $780/mo, financed
  const r = calculateFromPayment({ ...TAX_TEST_INPUTS, targetMonthlyPayment: 780, includeTaxesFeesInLoan: true });
  ok("TaxTest reverse financed: Vehicle Price = $12,653.12", approx(r.autoPrice, 12_653.12, 0.02), `got ${r.autoPrice.toFixed(2)}`);
  ok("TaxTest reverse financed: Sale Tax = $4,028.52", approx(r.saleTax, 4_028.52, 0.05), `got ${r.saleTax.toFixed(2)}`);
  ok("TaxTest reverse financed: Upfront Payment = $32.00", approx(r.upfrontPayment, 32, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("TaxTest reverse financed: Total Cost = $24,992.00", approx(r.totalCost, 24_992.00, 0.05), `got ${r.totalCost.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// Reference cross-checks #3 — same $34-everything shape as #2, but with
// "Your State" set to Alabama, across all four tab/checkbox combos. This
// is what caught the state-dependent Cash-Incentives-tax-exemption bug:
// Alabama does NOT exempt rebates from sales tax, unlike the no-state-
// selected default used in every example above.
// ─────────────────────────────────────────────────────────────────

const ALABAMA_TEST_INPUTS = {
  cashIncentives: 34, downPayment: 34, tradeInValue: 34, amountOwedOnTradeIn: 34,
  loanTermMonths: 34, annualRatePercent: 34, salesTaxPercent: 34, fees: 34, state: "Alabama",
};

{
  // "Total Price" tab, Auto Price $3,000, not financed, Alabama
  const r = calculateFromPrice({ ...ALABAMA_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: false });
  ok("Alabama not-financed: Total Loan Amount = $2,932.00", approx(r.totalLoanAmount, 2_932, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("Alabama not-financed: Sale Tax = $1,008.44 (incentives NOT exempt)", approx(r.saleTax, 1_008.44, 0.01), `got ${r.saleTax.toFixed(2)}`);
  ok("Alabama not-financed: Upfront Payment = $1,076.44", approx(r.upfrontPayment, 1_076.44, 0.01), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("Alabama not-financed: Monthly Pay = $135.47", approx(r.monthlyPayment, 135.47, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("Alabama not-financed: Total Cost = $5,682.33", approx(r.totalCost, 5_682.33, 0.02), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Total Price" tab, Auto Price $3,000, financed, Alabama
  const r = calculateFromPrice({ ...ALABAMA_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: true });
  ok("Alabama financed: Total Loan Amount = $3,974.44", approx(r.totalLoanAmount, 3_974.44, 0.01), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("Alabama financed: Monthly Pay = $183.63", approx(r.monthlyPayment, 183.63, 0.01), `got ${r.monthlyPayment.toFixed(2)}`);
  ok("Alabama financed: Total Cost = $6,277.46", approx(r.totalCost, 6_277.46, 0.02), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Monthly Payment" tab, target $755/mo, not financed, Alabama
  const r = calculateFromPayment({ ...ALABAMA_TEST_INPUTS, targetMonthlyPayment: 755, includeTaxesFeesInLoan: false });
  ok("Alabama reverse not-financed: Vehicle Price = $16,408.91", approx(r.autoPrice, 16_408.91, 0.02), `got ${r.autoPrice.toFixed(2)}`);
  ok("Alabama reverse not-financed: Total Loan Amount = $16,340.91", approx(r.totalLoanAmount, 16_340.91, 0.02), `got ${r.totalLoanAmount.toFixed(2)}`);
  ok("Alabama reverse not-financed: Sale Tax = $5,567.47", approx(r.saleTax, 5_567.47, 0.05), `got ${r.saleTax.toFixed(2)}`);
  ok("Alabama reverse not-financed: Upfront Payment = $5,635.47", approx(r.upfrontPayment, 5_635.47, 0.05), `got ${r.upfrontPayment.toFixed(2)}`);
  ok("Alabama reverse not-financed: Total Cost = $31,305.47", approx(r.totalCost, 31_305.47, 0.05), `got ${r.totalCost.toFixed(2)}`);
}

{
  // "Monthly Payment" tab, target $755/mo, financed, Alabama
  const r = calculateFromPayment({ ...ALABAMA_TEST_INPUTS, targetMonthlyPayment: 755, includeTaxesFeesInLoan: true });
  ok("Alabama reverse financed: Vehicle Price = $12,228.71", approx(r.autoPrice, 12_228.71, 0.02), `got ${r.autoPrice.toFixed(2)}`);
  ok("Alabama reverse financed: Sale Tax = $4,146.20", approx(r.saleTax, 4_146.20, 0.05), `got ${r.saleTax.toFixed(2)}`);
  ok("Alabama reverse financed: Total Cost = $25,704.00", approx(r.totalCost, 25_704.00, 0.05), `got ${r.totalCost.toFixed(2)}`);
}

{
  const alabama = calculateFromPrice({ ...ALABAMA_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: false });
  const noState = calculateFromPrice({ ...ALABAMA_TEST_INPUTS, autoPrice: 3_000, includeTaxesFeesInLoan: false, state: "" });
  ok("Alabama's Sale Tax is higher than no-state-selected (rebate not exempt there)", alabama.saleTax > noState.saleTax, `Alabama ${alabama.saleTax.toFixed(2)} vs unselected ${noState.saleTax.toFixed(2)}`);
}

// ─────────────────────────────────────────────────────────────────
// "Monthly Payment" tab — algebraic inverse of "Total Price", round-trip
// tested (no independent reference example was available for this tab).
// ─────────────────────────────────────────────────────────────────

{
  const forward = calculateFromPrice({ ...BASE_INPUTS, includeTaxesFeesInLoan: false });
  const reverse = calculateFromPayment({
    targetMonthlyPayment: forward.monthlyPayment,
    cashIncentives: BASE_INPUTS.cashIncentives, downPayment: BASE_INPUTS.downPayment,
    tradeInValue: BASE_INPUTS.tradeInValue, amountOwedOnTradeIn: BASE_INPUTS.amountOwedOnTradeIn,
    loanTermMonths: BASE_INPUTS.loanTermMonths, annualRatePercent: BASE_INPUTS.annualRatePercent,
    salesTaxPercent: BASE_INPUTS.salesTaxPercent, fees: BASE_INPUTS.fees, includeTaxesFeesInLoan: false,
  });
  ok("Round-trip (not financed): recovers original Auto Price", approx(reverse.autoPrice, BASE_INPUTS.autoPrice, 0.5), `got ${reverse.autoPrice.toFixed(2)}`);
  ok("Round-trip (not financed): recovers original loan amount", approx(reverse.totalLoanAmount, forward.totalLoanAmount, 0.5));
}

{
  const forward = calculateFromPrice({ ...BASE_INPUTS, includeTaxesFeesInLoan: true });
  const reverse = calculateFromPayment({
    targetMonthlyPayment: forward.monthlyPayment,
    cashIncentives: BASE_INPUTS.cashIncentives, downPayment: BASE_INPUTS.downPayment,
    tradeInValue: BASE_INPUTS.tradeInValue, amountOwedOnTradeIn: BASE_INPUTS.amountOwedOnTradeIn,
    loanTermMonths: BASE_INPUTS.loanTermMonths, annualRatePercent: BASE_INPUTS.annualRatePercent,
    salesTaxPercent: BASE_INPUTS.salesTaxPercent, fees: BASE_INPUTS.fees, includeTaxesFeesInLoan: true,
  });
  ok("Round-trip (financed): recovers original Auto Price", approx(reverse.autoPrice, BASE_INPUTS.autoPrice, 0.5), `got ${reverse.autoPrice.toFixed(2)}`);
  ok("Round-trip (financed): recovers original loan amount", approx(reverse.totalLoanAmount, forward.totalLoanAmount, 0.5));
}

{
  // Round-trip with non-zero cash incentives / trade-in / trade-in payoff
  const inputs = {
    autoPrice: 32_500, cashIncentives: 1_500, downPayment: 3_000, tradeInValue: 6_000, amountOwedOnTradeIn: 2_200,
    loanTermMonths: 72, annualRatePercent: 7.25, salesTaxPercent: 8.25, fees: 650,
  };
  for (const includeTaxesFeesInLoan of [false, true]) {
    const forward = calculateFromPrice({ ...inputs, includeTaxesFeesInLoan });
    const reverse = calculateFromPayment({
      targetMonthlyPayment: forward.monthlyPayment,
      cashIncentives: inputs.cashIncentives, downPayment: inputs.downPayment,
      tradeInValue: inputs.tradeInValue, amountOwedOnTradeIn: inputs.amountOwedOnTradeIn,
      loanTermMonths: inputs.loanTermMonths, annualRatePercent: inputs.annualRatePercent,
      salesTaxPercent: inputs.salesTaxPercent, fees: inputs.fees, includeTaxesFeesInLoan,
    });
    ok(`Round-trip w/ incentives+trade-in (financed=${includeTaxesFeesInLoan}): recovers Auto Price`, approx(reverse.autoPrice, inputs.autoPrice, 0.5), `got ${reverse.autoPrice.toFixed(2)}`);
    ok(`Round-trip w/ incentives+trade-in (financed=${includeTaxesFeesInLoan}): recovers Sale Tax`, approx(reverse.saleTax, forward.saleTax, 0.5), `got ${reverse.saleTax.toFixed(2)} vs ${forward.saleTax.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 0% interest
  const r = calculateFromPrice({ ...BASE_INPUTS, annualRatePercent: 0, includeTaxesFeesInLoan: false });
  ok("0% rate: payment = loan amount / term", approx(r.monthlyPayment, r.totalLoanAmount / 60, 0.01));
  ok("0% rate: total interest = 0", approx(r.totalInterest, 0, 0.01));

  // Trade-in fully covers price credit-wise (large trade-in value)
  const bigTradeIn = calculateFromPrice({ ...BASE_INPUTS, tradeInValue: 45_000, includeTaxesFeesInLoan: false });
  ok("Large trade-in: loan amount clamps at 0, not negative", bigTradeIn.totalLoanAmount === 0);

  // Negative/garbage inputs coerce safely
  const negative = calculateFromPrice({ autoPrice: -1000, cashIncentives: -1, downPayment: -1, tradeInValue: -1, amountOwedOnTradeIn: -1, loanTermMonths: -5, annualRatePercent: -5, salesTaxPercent: -5, fees: -5, includeTaxesFeesInLoan: false });
  ok("Negative inputs: no NaN, finite payment", Number.isFinite(negative.monthlyPayment) && !Number.isNaN(negative.monthlyPayment));

  // Sales tax base nets out BOTH trade-in value and cash incentives —
  // confirmed via a side-by-side comparison with the reference site using
  // nonzero Cash Incentives (see auto-loan-calculator-notes.md).
  const withIncentive = calculateFromPrice({ ...BASE_INPUTS, cashIncentives: 5_000, tradeInValue: 0, includeTaxesFeesInLoan: false });
  ok("Cash incentives DO reduce the sales-tax base", approx(withIncentive.saleTax, 45_000 * 0.07, 0.01), `got ${withIncentive.saleTax.toFixed(2)}`);
  const withTradeIn = calculateFromPrice({ ...BASE_INPUTS, cashIncentives: 0, tradeInValue: 5_000, includeTaxesFeesInLoan: false });
  ok("Trade-in value reduces the sales-tax base", approx(withTradeIn.saleTax, 45_000 * 0.07, 0.01), `got ${withTradeIn.saleTax.toFixed(2)}`);
  // Cash incentives also reduce Total Cost — you don't actually pay the
  // rebated amount, so it comes back out of what "Total Cost" reports.
  ok("Cash incentives reduce Total Cost", withIncentive.totalCost < calculateFromPrice({ ...BASE_INPUTS, cashIncentives: 0, tradeInValue: 0, includeTaxesFeesInLoan: false }).totalCost);

  // Amount owed on trade-in (negative equity) increases the loan amount
  const negEquity = calculateFromPrice({ ...BASE_INPUTS, tradeInValue: 3_000, amountOwedOnTradeIn: 5_000, includeTaxesFeesInLoan: false });
  ok("Negative trade-in equity rolls into the loan amount", approx(negEquity.totalLoanAmount, 50_000 - 0 - 10_000 - 3_000 + 5_000, 0.01), `got ${negEquity.totalLoanAmount.toFixed(2)}`);
}

console.log(`\nAuto Loan Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
