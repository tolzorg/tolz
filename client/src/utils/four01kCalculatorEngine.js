// 401K Calculator engine — matches calculator.net/401k-calculator.html.
//
// Three independent sub-calculators, reverse-engineered by driving the
// ACTUAL reference site with plain GET requests (its forms submit via
// GET to the same page — no Playwright needed) and reading the full
// year-by-year Schedule table it renders (far more precise than reading
// chart tooltips or screenshots) — see four01k-calculator-notes.md for
// the full derivation and every scenario checked. Every formula below
// was verified to match the reference EXACTLY (to the penny, across
// multiple scenarios including IRS-limit edge cases), with one small,
// explicitly-documented residual on the "fixed purchasing power" growing
// monthly withdrawal figure (same category of residual as the Retirement
// Calculator's growingAnnuityPV/Payment — see that engine's comments).

/** 2026 IRS 401(k) employee elective-deferral limits, AS IMPLEMENTED by
 * the reference calculator's actual JS (verified by live-testing ages
 * 48 through 64): $24,500 under age 50, $32,500 at age 50 or older.
 * NOTE: the reference page's own prose mentions a "$35,750 for ages
 * 60-63" super-catch-up tier, but live GET requests with age=59..64 all
 * returned the plain $32,500 figure uniformly — the calculator's actual
 * logic does NOT implement that third tier despite the copy describing
 * it. This function replicates the reference's verified BEHAVIOR, not
 * its prose. */
function irsElectiveDeferralLimit(age) {
  return age >= 50 ? 32500 : 24500;
}

function toRate(percent) {
  return Math.max(0, (Number(percent) || 0) / 100);
}

/** Level payment that fully pays out `P` over `n` periods at periodic
 * rate `i` (the standard annuity-payment formula) — used here for both
 * the annual "fixed amount annually" and monthly "fixed amount monthly"
 * withdrawal figures, verified exact against the reference for both. */
function levelPayment(P, i, n) {
  if (P <= 0 || n <= 0) return 0;
  return i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n));
}

/** Present value of a withdrawal stream that starts at W0 and grows at
 * rate g each period while the balance itself grows at rate r, fully
 * depleting after n periods — the closed-form "growing annuity" used for
 * the "fixed purchasing power" withdrawal mode. */
function growingAnnuityPV(W0, r, g, n) {
  if (n <= 0 || W0 <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return W0 * n / (1 + r);
  const ratio = Math.pow((1 + g) / (1 + r), n);
  return W0 / (r - g) * (1 - ratio);
}

/** Algebraic inverse of growingAnnuityPV(): the first-period withdrawal
 * that fully depletes a starting balance PV over n periods. Matches the
 * reference within ~0.2% (the "fixed purchasing power" monthly figure) —
 * the same small, previously-documented residual category as the
 * Retirement Calculator's identical formula; every other figure in this
 * engine (including the ANNUAL/flat withdrawal modes) is verified exact
 * to the penny, so this one residual is isolated and not chased further. */
function growingAnnuityPayment(PV, r, g, n) {
  if (n <= 0 || PV <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return PV * (1 + r) / n;
  const ratio = Math.pow((1 + g) / (1 + r), n);
  return PV * (r - g) / (1 - ratio);
}

/** Validates that life expectancy exceeds retirement age (mirrors the
 * Retirement Calculator's own validation — not separately confirmed
 * against a reference warning banner for THIS calculator specifically,
 * since the reference didn't expose one in any tested scenario, but
 * applied defensively since an inverted age range would otherwise
 * silently produce a zero/negative-length retirement). Returns null when
 * valid. */
export function validate401kAges({ currentAge, retirementAge, lifeExpectancy }) {
  const age0 = Math.max(0, Number(currentAge) || 0);
  const ageR = Math.max(age0, Number(retirementAge) || 0);
  const ageL = Number(lifeExpectancy) || 0;
  if (ageL <= ageR) {
    return ageR > age0
      ? "Life expectancy needs to be larger than expected retirement age."
      : "Life expectancy needs to be larger than your current age.";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// 1. Main 401(k) Calculator — balance projection + withdrawal analysis
// ─────────────────────────────────────────────────────────────────

/**
 * Per-year accumulation model verified EXACT (to the penny) against the
 * reference's own 35-row Schedule table, including two IRS-limit-binding
 * edge-case scenarios:
 *   - contribution_y = min(contributionPct * salary_y, irsCap_y)  [employee]
 *                     + employerMatch_y                            [employer]
 *   - employerMatch_y is earned monthly (employerMatchPct * min(contributionPct,
 *     matchLimitPct) * salary_y / 12) for as many of the 12 months as the
 *     employee's contributions haven't yet hit that year's IRS cap —
 *     confirmed via a scenario where a 30%-of-salary contribution rate
 *     hits the cap 9.8 months into the year: the employer match for that
 *     year was reduced to 9.8/12 of its full-year amount, matching the
 *     reference's own description ("employers will not match for the
 *     rest of the year" once the limit is reached) to the penny.
 *   - irsCap_y = irsElectiveDeferralLimit(age at START of year y) *
 *     (1+inflation)^(y-1) — the cap itself grows with inflation each
 *     year, confirmed via a two-year capped scenario ($24,500 → $25,235
 *     = ×1.03 exactly).
 *   - investmentReturn_y = balance_{y-1}*r + contribution_y*r*0.5 (a
 *     "mid-year contribution" approximation — contributions are treated
 *     as earning half a year's return, on average, rather than a full
 *     year's) — verified exact across every tested scenario.
 *   - balance_y = balance_{y-1} + contribution_y + investmentReturn_y
 * The reference's own results breakdown buckets the STARTING balance
 * under "Employee contributions" (not shown separately) — confirmed by
 * the $35,000 gap between a naive sum-of-employee-contributions total
 * and the reference's displayed "Employee contributions" figure exactly
 * matching the entered starting balance.
 */
export function calculateBalanceProjection({
  currentAge, currentSalary, currentBalance, contributionPercent,
  employerMatchPercent, employerMatchLimitPercent,
  retirementAge, lifeExpectancy, salaryIncreasePercent, avgReturnPercent, inflationPercent,
}) {
  const age0 = Math.max(0, Number(currentAge) || 0);
  const ageR = Math.max(age0, Number(retirementAge) || 0);
  const ageL = Math.max(ageR, Number(lifeExpectancy) || 0);
  const salary0 = Math.max(0, Number(currentSalary) || 0);
  const balance0 = Math.max(0, Number(currentBalance) || 0);
  const contribPct = toRate(contributionPercent);
  const matchPct = toRate(employerMatchPercent);
  const matchLimitPct = toRate(employerMatchLimitPercent);
  const salaryIncrease = toRate(salaryIncreasePercent);
  const avgReturn = toRate(avgReturnPercent);
  const inflation = toRate(inflationPercent);

  const yearsToRetirement = ageR - age0;
  const yearsInRetirement = ageL - ageR;

  let balance = balance0;
  let salary = salary0;
  let employeeTotal = balance0; // starting balance is bucketed as "employee" — see doc comment above
  let employerTotal = 0;
  let investTotal = 0;
  const schedule = [];
  const chartData = [];

  for (let y = 1; y <= yearsToRetirement; y++) {
    const ageAtStart = age0 + (y - 1);
    const cap = irsElectiveDeferralLimit(ageAtStart) * Math.pow(1 + inflation, y - 1);
    const uncappedEmployee = contribPct * salary;
    const cappedEmployee = Math.min(uncappedEmployee, cap);
    const monthlyEmployee = uncappedEmployee / 12;
    const monthsFull = monthlyEmployee <= 0 || uncappedEmployee <= cap ? 12 : cap / monthlyEmployee;
    const monthlyEmployerRate = matchPct * Math.min(contribPct, matchLimitPct) * salary / 12;
    const employerAnnual = monthlyEmployerRate * Math.min(monthsFull, 12);
    const totalContribution = cappedEmployee + employerAnnual;
    const investmentReturn = balance * avgReturn + totalContribution * avgReturn * 0.5;
    balance = balance + totalContribution + investmentReturn;

    employeeTotal += cappedEmployee;
    employerTotal += employerAnnual;
    investTotal += investmentReturn;

    schedule.push({ age: age0 + y, contribution: totalContribution, investmentReturn, endBalance: balance });
    chartData.push({ age: age0 + y, employee: employeeTotal, employer: employerTotal, investment: investTotal, total: balance });

    salary *= 1 + salaryIncrease;
  }

  const balanceAtRetirement = balance;
  const todaysPurchasingPower = balanceAtRetirement / Math.pow(1 + inflation, yearsToRetirement);

  // Withdrawal figures — all confirmed to use SIMPLE (annual/12) monthly
  // rates, NOT an EAR-bridged monthly rate (unlike the Retirement
  // Calculator): the "fixed amount monthly" figure matched the reference
  // exactly with rM = avgReturn/12, but was ~1.3% off with an EAR-bridged
  // rate — confirmed by testing both against the reference's own figure.
  const monthlyReturn = avgReturn / 12;
  const monthlyInflation = inflation / 12;
  const retMonths = yearsInRetirement * 12;

  const growingMonthlyAtRetirement = growingAnnuityPayment(balanceAtRetirement, monthlyReturn, monthlyInflation, retMonths);
  const growingTodaysMoney = growingMonthlyAtRetirement / Math.pow(1 + inflation, yearsToRetirement);

  const flatMonthly = levelPayment(balanceAtRetirement, monthlyReturn, retMonths);
  const flatMonthlyTodaysAtRetirement = flatMonthly / Math.pow(1 + inflation, yearsToRetirement);
  const flatMonthlyTodaysAtLifeExpectancy = flatMonthly / Math.pow(1 + inflation, yearsToRetirement + yearsInRetirement);

  const flatAnnual = levelPayment(balanceAtRetirement, avgReturn, yearsInRetirement);
  const flatAnnualTodaysAtRetirement = flatAnnual / Math.pow(1 + inflation, yearsToRetirement);
  const flatAnnualTodaysAtLifeExpectancy = flatAnnual / Math.pow(1 + inflation, yearsToRetirement + yearsInRetirement);

  // Retirement/payout schedule — verified exact against the reference's
  // own "Retired (if withdraw a fixed amount annually)" table: the FULL
  // year's investment return is earned on the balance BEFORE that year's
  // payout is subtracted (not mid-year averaging, unlike the
  // accumulation phase) — confirmed row-by-row (e.g. age 66: return
  // $102,708.03 = $1,711,800.47 × 6% exactly; end balance =
  // start + return − payout).
  let payoutBalance = balanceAtRetirement;
  const payoutSchedule = [];
  for (let y = 1; y <= yearsInRetirement; y++) {
    const investmentReturn = payoutBalance * avgReturn;
    const endBalance = Math.max(0, payoutBalance + investmentReturn - flatAnnual);
    payoutSchedule.push({ age: ageR + y, payout: flatAnnual, investmentReturn, endBalance });
    payoutBalance = endBalance;
  }

  return {
    effectiveRetireAge: ageR,
    // True when retirement age <= current age (clamped to 0 years, never
    // negative) — the accumulation loop above runs zero times, so
    // balanceAtRetirement is just the entered starting balance with NO
    // growth applied. Confirmed live: in this case the reference collapses
    // its entire headline+chart+breakdown-table result section down to a
    // single "Total investment returns: $0" line (there's nothing to
    // project), and simplifies each Withdrawal sentence to drop the
    // "today's money AT RETIREMENT AGE" sub-clause (trivially equal to the
    // actual amount when zero years have passed) — see
    // BalanceProjectionCard.jsx for the matching UI branch.
    alreadyRetired: yearsToRetirement === 0,
    yearsToRetirement, yearsInRetirement,
    balanceAtRetirement, todaysPurchasingPower,
    contributionsBreakdown: { employee: employeeTotal, employer: employerTotal, investmentReturns: investTotal, total: balanceAtRetirement },
    growing: { monthlyAtRetirement: growingMonthlyAtRetirement, todaysMoney: growingTodaysMoney },
    flatMonthly: { amount: flatMonthly, todaysAtRetirement: flatMonthlyTodaysAtRetirement, todaysAtLifeExpectancy: flatMonthlyTodaysAtLifeExpectancy },
    flatAnnual: { amount: flatAnnual, todaysAtRetirement: flatAnnualTodaysAtRetirement, todaysAtLifeExpectancy: flatAnnualTodaysAtLifeExpectancy },
    schedule, payoutSchedule, chartData,
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. 401(k) Early Withdrawal Costs Calculator
// ─────────────────────────────────────────────────────────────────

/**
 * Verified exact against the reference for the default scenario and all
 * 4 penalty-exemption combinations: a flat 10% early-withdrawal penalty
 * applies UNLESS the withdrawer has a qualifying disability, qualifies
 * for another penalty exemption, or is unemployed AND was 55 or older
 * when they left that employment (the "Rule of 55") — confirmed live:
 * being simply "not employed" alone (without also being 55+) does NOT
 * waive the penalty, and being "employed" skips the 55+ question
 * entirely (the Rule of 55 only applies after separation from service).
 * Federal/state/local income tax are each a flat, independent percentage
 * of the withdrawal amount — no interaction with the penalty exemptions.
 */
export function calculateEarlyWithdrawal({
  withdrawalAmount, federalTaxPercent, stateTaxPercent, localTaxPercent,
  isEmployed, is55OrOlderWhenLeft, hasQualifyingDisability, hasOtherExemption,
}) {
  const amount = Math.max(0, Number(withdrawalAmount) || 0);
  const fedRate = toRate(federalTaxPercent);
  const stateRate = toRate(stateTaxPercent);
  const localRate = toRate(localTaxPercent);

  const penaltyWaived = !!hasQualifyingDisability || !!hasOtherExemption || (!isEmployed && !!is55OrOlderWhenLeft);
  const penalty = penaltyWaived ? 0 : amount * 0.10;
  const federalTax = amount * fedRate;
  const stateTax = amount * stateRate;
  const localTax = amount * localRate;
  const totalTaxAndPenalty = penalty + federalTax + stateTax + localTax;
  const amountToReceive = amount - totalTaxAndPenalty;

  return { amountToReceive, totalTaxAndPenalty, penalty, federalTax, stateTax, localTax, penaltyWaived };
}

// ─────────────────────────────────────────────────────────────────
// 3. Maximize Employer 401(k) Match Calculator
// ─────────────────────────────────────────────────────────────────

/**
 * Verified exact against the reference across 4 scenarios (2 salaries ×
 * 2 ages spanning the IRS-limit age tiers). The contribution "window"
 * that captures the FULL employer match without losing any of it to
 * hitting the IRS limit early is:
 *   - lower bound = employer-match-2 limit (%) — the lowest contribution
 *     rate that still reaches both match tiers for the full year.
 *   - upper bound = irsCap / salary × 100 — the highest rate whose
 *     annual employee total exactly reaches (but doesn't exceed) the IRS
 *     cap by year-end, so all 12 months are still matched.
 * Employer match is a two-tier structure: tier 1 matches
 * employerMatch1% of the first employerMatch1Limit% of salary
 * contributed; tier 2 additionally matches employerMatch2% of the
 * INCREMENTAL band between employerMatch1Limit% and employerMatch2Limit%
 * — confirmed exact via the reference's own combined match figures at
 * both window boundaries (e.g. 50%-to-3%/20%-to-6% on a $75,000 salary:
 * $1,125 + $450 = $1,575 total match, matching at both 6% and 32.67%).
 */
export function calculateMaximizeMatch({
  currentAge, currentSalary, employerMatch1Percent, employerMatch1LimitPercent,
  employerMatch2Percent, employerMatch2LimitPercent,
}) {
  const age = Math.max(0, Number(currentAge) || 0);
  const salary = Math.max(0, Number(currentSalary) || 0);
  const match1Pct = toRate(employerMatch1Percent);
  const match1LimitPct = toRate(employerMatch1LimitPercent);
  const match2Pct = toRate(employerMatch2Percent);
  const match2LimitPct = toRate(employerMatch2LimitPercent);

  const cap = irsElectiveDeferralLimit(age);
  const lowerBoundPercent = Math.min(100, Math.max(0, Number(employerMatch1LimitPercent) || 0) >= Math.max(0, Number(employerMatch2LimitPercent) || 0)
    ? Math.max(0, Number(employerMatch1LimitPercent) || 0)
    : Math.max(0, Number(employerMatch2LimitPercent) || 0));
  // Contribution percentage can never exceed 100% of salary — confirmed
  // live: a low-salary/older-age scenario where the raw irsCap/salary
  // ratio comes out to 139.88% instead shows an upper bound of exactly
  // "100%" (not the raw over-100% figure), with the employee contribution
  // at that bound equal to the full salary itself ($23,234), not the IRS
  // cap ($32,500) — the cap was never actually reached in that scenario.
  const upperBoundPercent = salary > 0 ? Math.min(100, (cap / salary) * 100) : 0;

  function totalMatchAt(contribPct) {
    const tier1 = match1Pct * Math.min(contribPct, match1LimitPct) * salary;
    const tier2Band = Math.max(0, Math.min(contribPct, match2LimitPct) - match1LimitPct);
    const tier2 = match2Pct * tier2Band * salary;
    return tier1 + tier2;
  }

  const lowerPctRate = lowerBoundPercent / 100;
  const upperPctRate = upperBoundPercent / 100;
  const lowerEmployeeContribution = lowerPctRate * salary;
  const upperEmployeeContribution = Math.min(upperPctRate * salary, cap);
  const lowerEmployerMatch = totalMatchAt(lowerPctRate);
  const upperEmployerMatch = totalMatchAt(upperPctRate);

  return {
    irsLimit: cap,
    lowerBoundPercent, upperBoundPercent,
    lower: { totalContribution: lowerEmployeeContribution + lowerEmployerMatch, employeeContribution: lowerEmployeeContribution, employerMatch: lowerEmployerMatch },
    upper: { totalContribution: upperEmployeeContribution + upperEmployerMatch, employeeContribution: upperEmployeeContribution, employerMatch: upperEmployerMatch },
    isHighContribution: upperBoundPercent >= 20,
  };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 2) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals).replace(/\.?0+$/, "")}%`;
}
