// Auto Loan Calculator engine — matches calculator.net/auto-loan-calculator.html.
//
// Two modes, mirroring the reference's own "Total Price" / "Monthly
// Payment" tabs:
//   - fromPrice(): given the vehicle's Auto Price, compute the resulting
//     Monthly Pay (the direct/forward calculation).
//   - fromPayment(): given a target Monthly Pay, solve backward for the
//     Auto Price that would produce it (the reverse calculation) — same
//     formulas, solved for the other variable algebraically.
//
// Every figure here has been verified to the penny against the reference
// across ten separate worked examples spanning both tabs, both states of
// "Include taxes and fees in loan", and both a no-state-selected and an
// Alabama-selected configuration (the two differ in whether Cash
// Incentives are exempt from sales tax — see incentivesAreTaxExempt()
// below). See auto-loan-calculator-notes.md for the full verification
// history, including two rounds of bugs this caught.

const MAX_TERM_MONTHS = 1200; // 100 years, generous upper guard

function monthlyRate(annualRatePercent) {
  return Math.max(0, (Number(annualRatePercent) || 0) / 100) / 12;
}

function clampTermMonths(months) {
  return Math.max(1, Math.min(MAX_TERM_MONTHS, Math.round(Number(months) || 0) || 1));
}

/** Standard fixed-payment amortization: payment that fully retires
 * `principal` over `n` monthly payments at monthly rate `i`. */
function paymentForLoan(principal, i, n) {
  if (principal <= 0) return 0;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

/** Loan amount a given fixed `payment` fully retires over `n` payments at
 * monthly rate `i` — the inverse of paymentForLoan(). */
function loanForPayment(payment, i, n) {
  if (i === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + i, -n))) / i;
}

function buildSchedule(principal, i, n) {
  const schedule = [];
  let balance = principal;
  const payment = paymentForLoan(principal, i, n);
  for (let period = 1; period <= n; period++) {
    const interest = balance * i;
    let principalPaid = payment - interest;
    if (period === n || principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ period, payment: principalPaid + interest, interest, principal: principalPaid, balance });
  }
  return schedule;
}

/** Whether Cash Incentives are exempt from sales tax depends on which
 * state is selected — this is real state tax policy, not a calculator
 * quirk: most states give a "rebate credit" (tax only the post-rebate
 * price), but a substantial minority tax the full pre-rebate price
 * regardless of any manufacturer rebate. Trade-in Value's credit, by
 * contrast, does NOT vary by state in this calculator (confirmed).
 *
 * This list is the set of states that DO exempt incentives (sourced from
 * a commonly-cited car-buying tax-treatment survey — see
 * auto-loan-calculator-notes.md for the citation and its caveats). Every
 * state NOT in this set, plus every state left unselected ("-- Select --"
 * defaults to exempt, matching the reference's own default behavior), is
 * treated accordingly. Verified directly against the reference site for
 * two configurations: no state selected (exempt) and Alabama (NOT
 * exempt, i.e. not in this set) — both matched to the penny. */
const INCENTIVE_TAX_EXEMPT_STATES = new Set([
  "Alaska", "Arizona", "Delaware", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Massachusetts", "Minnesota", "Missouri", "Montana", "Nebraska",
  "New Hampshire", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "Texas", "Utah", "Vermont", "Wyoming",
]);

function incentivesAreTaxExempt(state) {
  return !state || INCENTIVE_TAX_EXEMPT_STATES.has(state);
}

/** Sales tax is charged on Auto Price minus Trade-in Value, minus Cash
 * Incentives too when the selected state exempts rebates from tax. */
function computeSaleTax(autoPrice, tradeInValue, cashIncentives, salesTaxPercent, state) {
  const incentiveCredit = incentivesAreTaxExempt(state) ? cashIncentives : 0;
  const taxable = Math.max(0, autoPrice - tradeInValue - incentiveCredit);
  return taxable * (Math.max(0, Number(salesTaxPercent) || 0) / 100);
}

/** The amount actually financed before any tax/fee rollup: the vehicle
 * price less every credit toward it (cash incentives, down payment,
 * trade-in equity), plus any negative trade-in equity (amount still owed
 * on the trade-in) rolled into the new loan. */
function baseLoanAmount({ autoPrice, cashIncentives, downPayment, tradeInValue, amountOwedOnTradeIn }) {
  return Math.max(0, autoPrice - cashIncentives - downPayment - tradeInValue + amountOwedOnTradeIn);
}

function finalize({ autoPrice, saleTax, fees, cashIncentives, downPayment, includeTaxesFeesInLoan, totalLoanAmount, i, n }) {
  const payment = paymentForLoan(totalLoanAmount, i, n);
  const totalOfPayments = payment * n;
  const totalInterest = totalOfPayments - totalLoanAmount;
  const upfrontPayment = downPayment + (includeTaxesFeesInLoan ? 0 : saleTax + fees);
  // Cash Incentives reduce what you actually end up paying overall, same
  // as they reduce the taxable amount above — verified against the same
  // nonzero-incentive worked example.
  const totalCost = autoPrice + totalInterest + saleTax + fees - cashIncentives;
  const schedule = buildSchedule(totalLoanAmount, i, n);

  return {
    autoPrice, monthlyPayment: payment, totalLoanAmount, saleTax, upfrontPayment,
    totalOfPayments, totalInterest, totalCost, loanTermMonths: n, schedule,
  };
}

export function calculateFromPrice({
  autoPrice, cashIncentives, downPayment, tradeInValue, amountOwedOnTradeIn,
  loanTermMonths, annualRatePercent, salesTaxPercent, fees, includeTaxesFeesInLoan, state,
}) {
  const price = Math.max(0, Number(autoPrice) || 0);
  const incentives = Math.max(0, Number(cashIncentives) || 0);
  const down = Math.max(0, Number(downPayment) || 0);
  const tradeIn = Math.max(0, Number(tradeInValue) || 0);
  const owed = Math.max(0, Number(amountOwedOnTradeIn) || 0);
  const feesAmt = Math.max(0, Number(fees) || 0);
  const n = clampTermMonths(loanTermMonths);
  const i = monthlyRate(annualRatePercent);

  const saleTax = computeSaleTax(price, tradeIn, incentives, salesTaxPercent, state);
  const base = baseLoanAmount({ autoPrice: price, cashIncentives: incentives, downPayment: down, tradeInValue: tradeIn, amountOwedOnTradeIn: owed });
  const totalLoanAmount = base + (includeTaxesFeesInLoan ? saleTax + feesAmt : 0);

  return finalize({ autoPrice: price, saleTax, fees: feesAmt, cashIncentives: incentives, downPayment: down, includeTaxesFeesInLoan, totalLoanAmount, i, n });
}

export function calculateFromPayment({
  targetMonthlyPayment, cashIncentives, downPayment, tradeInValue, amountOwedOnTradeIn,
  loanTermMonths, annualRatePercent, salesTaxPercent, fees, includeTaxesFeesInLoan, state,
}) {
  const payment = Math.max(0, Number(targetMonthlyPayment) || 0);
  const incentives = Math.max(0, Number(cashIncentives) || 0);
  const down = Math.max(0, Number(downPayment) || 0);
  const tradeIn = Math.max(0, Number(tradeInValue) || 0);
  const owed = Math.max(0, Number(amountOwedOnTradeIn) || 0);
  const feesAmt = Math.max(0, Number(fees) || 0);
  const taxRate = Math.max(0, Number(salesTaxPercent) || 0) / 100;
  const n = clampTermMonths(loanTermMonths);
  const i = monthlyRate(annualRatePercent);
  const exempt = incentivesAreTaxExempt(state);

  const totalLoanAmount = loanForPayment(payment, i, n);

  // Solve for Auto Price — two different algebraic inverses depending on
  // whether the selected state exempts Cash Incentives from sales tax
  // (both cases are linear in price, no circularity):
  //
  //   Not financed (either state bucket): loanAmount doesn't involve tax
  //   at all, so this is state-independent:
  //     loanAmount = price - incentives - down - tradeIn + owed
  //     => price = loanAmount + incentives + down + tradeIn - owed
  //
  //   Financed, incentives EXEMPT: loanAmount = (price - incentives -
  //   down - tradeIn + owed) + (price - tradeIn - incentives) * taxRate + fees
  //     => price = [loanAmount + down - owed - fees] / (1 + taxRate) + incentives + tradeIn
  //
  //   Financed, incentives TAXABLE: loanAmount = (price - incentives -
  //   down - tradeIn + owed) + (price - tradeIn) * taxRate + fees
  //     => price = [loanAmount + incentives + down - owed - fees] / (1 + taxRate) + tradeIn
  let autoPrice;
  if (!includeTaxesFeesInLoan) {
    autoPrice = Math.max(0, totalLoanAmount + incentives + down + tradeIn - owed);
  } else if (exempt) {
    autoPrice = Math.max(0, (totalLoanAmount + down - owed - feesAmt) / (1 + taxRate)) + incentives + tradeIn;
  } else {
    autoPrice = Math.max(0, (totalLoanAmount + incentives + down - owed - feesAmt) / (1 + taxRate)) + tradeIn;
  }

  const saleTax = computeSaleTax(autoPrice, tradeIn, incentives, salesTaxPercent, state);

  return finalize({ autoPrice, saleTax, fees: feesAmt, cashIncentives: incentives, downPayment: down, includeTaxesFeesInLoan, totalLoanAmount, i, n });
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
