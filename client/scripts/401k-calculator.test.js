// Plain-Node test suite for the 401K Calculator engine. Run with:
//   node scripts/401k-calculator.test.js
//
// Every scenario below was verified against the LIVE reference (plain
// GET requests to calculator.net/401k-calculator.html — its 3 forms all
// submit via GET to the same page, computed server-side, no Playwright
// needed), reading the full year-by-year Schedule table it renders for
// maximum precision. See four01k-calculator-notes.md for the full
// derivation.

import { calculateBalanceProjection, calculateEarlyWithdrawal, calculateMaximizeMatch } from "../src/utils/four01kCalculatorEngine.js";

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

function approx(a, b, tolerance = 1) {
  return Math.abs(a - b) <= tolerance;
}

// ─────────────────────────────────────────────────────────────────
// 1. Balance Projection — default reference scenario (age 30, $75,000
//    salary, $35,000 balance, 10% contribution, 50%/3% employer match,
//    retire 65, life expectancy 85, 3% salary increase, 6% return, 3%
//    inflation)
// ─────────────────────────────────────────────────────────────────

{
  const r = calculateBalanceProjection({
    currentAge: 30, currentSalary: 75000, currentBalance: 35000, contributionPercent: 10,
    employerMatchPercent: 50, employerMatchLimitPercent: 3,
    retirementAge: 65, lifeExpectancy: 85, salaryIncreasePercent: 3, avgReturnPercent: 6, inflationPercent: 3,
  });
  ok("default: balanceAtRetirement 1,711,800.47", approx(r.balanceAtRetirement, 1711800.47, 0.5), r.balanceAtRetirement);
  ok("default: todaysPurchasingPower 608,345", approx(r.todaysPurchasingPower, 608345, 1));
  ok("default: employee contributions 488,466", approx(r.contributionsBreakdown.employee, 488466, 1));
  ok("default: employer match 68,020", approx(r.contributionsBreakdown.employer, 68020, 1));
  ok("default: investment returns 1,155,315", approx(r.contributionsBreakdown.investmentReturns, 1155315, 1));

  // Withdrawal figures
  ok("default: flat monthly 12,264", approx(r.flatMonthly.amount, 12264, 0.5));
  ok("default: flat monthly todays@66 4,358", approx(r.flatMonthly.todaysAtRetirement, 4358, 0.5));
  ok("default: flat monthly todays@85 2,413", approx(r.flatMonthly.todaysAtLifeExpectancy, 2413, 0.5));
  ok("default: flat annual 149,243", approx(r.flatAnnual.amount, 149243, 0.5));
  ok("default: flat annual todays@65 53,038", approx(r.flatAnnual.todaysAtRetirement, 53038, 0.5));
  ok("default: flat annual todays@85 29,366", approx(r.flatAnnual.todaysAtLifeExpectancy, 29366, 0.5));
  // "Fixed purchasing power" growing-monthly figure carries the same
  // small (~0.2%) residual as the Retirement Calculator's identical
  // growingAnnuityPayment() formula — see engine comments.
  ok("default: growing monthly ~9,494 (residual)", approx(r.growing.monthlyAtRetirement, 9494, 20));
  ok("default: growing todays ~3,374 (residual)", approx(r.growing.todaysMoney, 3374, 10));

  // Schedule rows (verified exact to the penny against the reference's
  // own 35-row accumulation table)
  ok("default: schedule row1 contribution 8,625.00", approx(r.schedule[0].contribution, 8625, 0.01));
  ok("default: schedule row1 investReturn 2,358.75", approx(r.schedule[0].investmentReturn, 2358.75, 0.01));
  ok("default: schedule row1 endBalance 45,983.75", approx(r.schedule[0].endBalance, 45983.75, 0.01));
  ok("default: schedule row2 contribution 8,883.75", approx(r.schedule[1].contribution, 8883.75, 0.01));
  ok("default: schedule last(35) contribution 23,562.68", approx(r.schedule[34].contribution, 23562.68, 0.02));
  ok("default: schedule last(35) endBalance == balanceAtRetirement", approx(r.schedule[34].endBalance, r.balanceAtRetirement, 0.01));

  // Retirement payout schedule (verified exact against the reference's
  // "Retired (if withdraw a fixed amount annually)" table)
  ok("default: payout row1 investReturn 102,708.03", approx(r.payoutSchedule[0].investmentReturn, 102708.03, 0.02));
  ok("default: payout row1 endBalance 1,665,265.93", approx(r.payoutSchedule[0].endBalance, 1665265.93, 0.02));
  ok("default: payout last endBalance depletes to 0", approx(r.payoutSchedule[19].endBalance, 0, 1));
}

// ─────────────────────────────────────────────────────────────────
// 2. Balance Projection — IRS elective-deferral-limit edge cases
// ─────────────────────────────────────────────────────────────────

{
  // 30% contribution, no employer match, $100k salary, no salary growth —
  // uncapped $30,000/yr exceeds the $24,500 (under-50) IRS limit.
  const r = calculateBalanceProjection({
    currentAge: 30, currentSalary: 100000, currentBalance: 0, contributionPercent: 30,
    employerMatchPercent: 0, employerMatchLimitPercent: 0,
    retirementAge: 32, lifeExpectancy: 90, salaryIncreasePercent: 0, avgReturnPercent: 6, inflationPercent: 3,
  });
  ok("capped-no-match: year1 contribution capped at 24,500", approx(r.schedule[0].contribution, 24500, 0.01));
  // The IRS cap itself grows with inflation: 24,500 × 1.03 = 25,235
  ok("capped-no-match: year2 cap inflates to 25,235", approx(r.schedule[1].contribution, 25235, 0.01));
}

{
  // Same setup but WITH a 50%/3% employer match — confirms the
  // per-month "employer stops matching once the employee hits the
  // annual cap" mechanic (employee hits the cap 9.8 months into year 1).
  const r = calculateBalanceProjection({
    currentAge: 30, currentSalary: 100000, currentBalance: 0, contributionPercent: 30,
    employerMatchPercent: 50, employerMatchLimitPercent: 3,
    retirementAge: 32, lifeExpectancy: 90, salaryIncreasePercent: 0, avgReturnPercent: 6, inflationPercent: 3,
  });
  ok("capped-with-match: year1 total contribution 25,725", approx(r.schedule[0].contribution, 25725, 0.01));
  ok("capped-with-match: year1 investment return 771.75", approx(r.schedule[0].investmentReturn, 771.75, 0.01));
  ok("capped-with-match: year2 total contribution 26,496.75", approx(r.schedule[1].contribution, 26496.75, 0.02));
}

{
  // Age-tier boundary: the IRS cap steps from $24,500 to $32,500 exactly
  // at age 50, using the age at the START of each contribution year.
  const r48 = calculateBalanceProjection({
    currentAge: 48, currentSalary: 1000000, currentBalance: 0, contributionPercent: 50,
    employerMatchPercent: 0, employerMatchLimitPercent: 0,
    retirementAge: 51, lifeExpectancy: 90, salaryIncreasePercent: 0, avgReturnPercent: 0, inflationPercent: 0,
  });
  ok("age-tier: age48 year1(age48) = 24,500", approx(r48.schedule[0].contribution, 24500, 0.01));
  ok("age-tier: age48 year2(age49) = 24,500", approx(r48.schedule[1].contribution, 24500, 0.01));
  ok("age-tier: age48 year3(age50) = 32,500", approx(r48.schedule[2].contribution, 32500, 0.01));
}

// ─────────────────────────────────────────────────────────────────
// 3. Early Withdrawal Costs Calculator
// ─────────────────────────────────────────────────────────────────

function checkEW(label, inputs, expected) {
  const r = calculateEarlyWithdrawal(inputs);
  ok(`early-withdrawal ${label}: amountToReceive`, approx(r.amountToReceive, expected.amountToReceive, 0.01), r.amountToReceive);
  ok(`early-withdrawal ${label}: totalTaxAndPenalty`, approx(r.totalTaxAndPenalty, expected.totalTaxAndPenalty, 0.01));
  ok(`early-withdrawal ${label}: penalty`, approx(r.penalty, expected.penalty, 0.01));
}

checkEW("default (employed, no exemptions)",
  { withdrawalAmount: 10000, federalTaxPercent: 25, stateTaxPercent: 5, localTaxPercent: 0, isEmployed: true, is55OrOlderWhenLeft: false, hasQualifyingDisability: false, hasOtherExemption: false },
  { amountToReceive: 6000, totalTaxAndPenalty: 4000, penalty: 1000 });

checkEW("Rule of 55 (unemployed + 55plus)",
  { withdrawalAmount: 10000, federalTaxPercent: 25, stateTaxPercent: 5, localTaxPercent: 0, isEmployed: false, is55OrOlderWhenLeft: true, hasQualifyingDisability: false, hasOtherExemption: false },
  { amountToReceive: 7000, totalTaxAndPenalty: 3000, penalty: 0 });

checkEW("unemployed but under 55 (penalty still applies)",
  { withdrawalAmount: 10000, federalTaxPercent: 25, stateTaxPercent: 5, localTaxPercent: 0, isEmployed: false, is55OrOlderWhenLeft: false, hasQualifyingDisability: false, hasOtherExemption: false },
  { amountToReceive: 6000, totalTaxAndPenalty: 4000, penalty: 1000 });

checkEW("qualifying disability",
  { withdrawalAmount: 10000, federalTaxPercent: 25, stateTaxPercent: 5, localTaxPercent: 0, isEmployed: true, is55OrOlderWhenLeft: false, hasQualifyingDisability: true, hasOtherExemption: false },
  { amountToReceive: 7000, totalTaxAndPenalty: 3000, penalty: 0 });

checkEW("other penalty exemption",
  { withdrawalAmount: 10000, federalTaxPercent: 25, stateTaxPercent: 5, localTaxPercent: 0, isEmployed: true, is55OrOlderWhenLeft: false, hasQualifyingDisability: false, hasOtherExemption: true },
  { amountToReceive: 7000, totalTaxAndPenalty: 3000, penalty: 0 });

// ─────────────────────────────────────────────────────────────────
// 4. Maximize Employer 401(k) Match Calculator
// ─────────────────────────────────────────────────────────────────

function checkMM(label, inputs, expected) {
  const r = calculateMaximizeMatch(inputs);
  ok(`maximize-match ${label}: lowerBoundPercent`, approx(r.lowerBoundPercent, expected.lowerBoundPercent, 0.01));
  ok(`maximize-match ${label}: upperBoundPercent`, approx(r.upperBoundPercent, expected.upperBoundPercent, 0.01), r.upperBoundPercent);
  ok(`maximize-match ${label}: lower.totalContribution`, approx(r.lower.totalContribution, expected.lowerTotal, 1));
  ok(`maximize-match ${label}: lower.employerMatch`, approx(r.lower.employerMatch, expected.lowerMatch, 1));
  ok(`maximize-match ${label}: upper.totalContribution`, approx(r.upper.totalContribution, expected.upperTotal, 1));
  ok(`maximize-match ${label}: upper.employerMatch`, approx(r.upper.employerMatch, expected.upperMatch, 1));
}

checkMM("default ($75k, age 30)",
  { currentAge: 30, currentSalary: 75000, employerMatch1Percent: 50, employerMatch1LimitPercent: 3, employerMatch2Percent: 20, employerMatch2LimitPercent: 6 },
  { lowerBoundPercent: 6, upperBoundPercent: 32.67, lowerTotal: 6075, lowerMatch: 1575, upperTotal: 26075, upperMatch: 1575 });

checkMM("$150k, age 30 (upper bound halves with double salary)",
  { currentAge: 30, currentSalary: 150000, employerMatch1Percent: 50, employerMatch1LimitPercent: 3, employerMatch2Percent: 20, employerMatch2LimitPercent: 6 },
  { lowerBoundPercent: 6, upperBoundPercent: 16.33, lowerTotal: 12150, lowerMatch: 3150, upperTotal: 27650, upperMatch: 3150 });

checkMM("$150k, age 55 (50+ IRS cap raises upper bound)",
  { currentAge: 55, currentSalary: 150000, employerMatch1Percent: 50, employerMatch1LimitPercent: 3, employerMatch2Percent: 20, employerMatch2LimitPercent: 6 },
  { lowerBoundPercent: 6, upperBoundPercent: 21.67, lowerTotal: 12150, lowerMatch: 3150, upperTotal: 35650, upperMatch: 3150 });

checkMM("$150k, age 61 (reference does NOT implement a 60-63 super-catch-up tier)",
  { currentAge: 61, currentSalary: 150000, employerMatch1Percent: 50, employerMatch1LimitPercent: 3, employerMatch2Percent: 20, employerMatch2LimitPercent: 6 },
  { lowerBoundPercent: 6, upperBoundPercent: 21.67, lowerTotal: 12150, lowerMatch: 3150, upperTotal: 35650, upperMatch: 3150 });

checkMM("low-salary/age-90/inverted-tier-limits (upper bound clamps to 100%)",
  { currentAge: 90, currentSalary: 23234, employerMatch1Percent: 12, employerMatch1LimitPercent: 4, employerMatch2Percent: 53, employerMatch2LimitPercent: 2 },
  { lowerBoundPercent: 4, upperBoundPercent: 100, lowerTotal: 1041, lowerMatch: 112, upperTotal: 23346, upperMatch: 112 });

console.log(`\n401K Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
