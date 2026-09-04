// Retirement Calculator engine — matches calculator.net/retirement-calculator.html.
//
// Four independent sub-calculators. Every formula below was reverse-
// engineered by driving the ACTUAL reference site with Playwright (not
// just reading screenshots) and reading its real responses, including
// year-by-year balance data embedded in its own chart tooltips — see
// retirement-calculator-notes.md for the full derivation and the specific
// figures each formula was checked against.
//
// Two formulas have a small, explicitly-documented residual (~0.02%-0.5%)
// that resisted exact reverse-engineering despite extensive testing of
// alternative conventions — see the comments on growingAnnuityPV() and
// the monthly sinking-fund contribution in calculateSavingsPlan(). Every
// other formula here (accumulation with monthly contributions, flat/level
// withdrawal payout, annual sinking-fund contribution, lump-sum-today
// present value, target replacement income, "today's money" deflation,
// and money-longevity payoff time) was verified to match the reference
// exactly.

const MONTHS_PER_YEAR = 12;

/** EAR-bridges a nominal annual rate down to an equivalent monthly rate —
 * proven exact against the reference for every monthly-granularity
 * calculation in this engine (accumulation with monthly contributions,
 * flat-payout withdrawals, lump-sum-today discounting, money-longevity). */
function monthlyRateFromAnnual(annualRatePercent) {
  const r = Math.max(0, (Number(annualRatePercent) || 0) / 100);
  return Math.pow(1 + r, 1 / 12) - 1;
}

function toRate(percent) {
  return Math.max(0, (Number(percent) || 0) / 100);
}

/** Future value of a lump sum. */
function futureValueLumpSum(P, i, n) {
  return P * Math.pow(1 + i, n);
}

/** Present value of a future lump sum. */
function presentValueLumpSum(FV, i, n) {
  return FV / Math.pow(1 + i, n);
}

/** Future value of a stream of equal periodic contributions (ordinary —
 * end of period). */
function annuityFV(contribution, i, n) {
  if (n <= 0 || contribution === 0) return 0;
  return i === 0 ? contribution * n : contribution * (Math.pow(1 + i, n) - 1) / i;
}

/** Future value of a stream of contributions that itself GROWS at rate g
 * each period (e.g. a contribution that's a fixed % of a growing income),
 * discounted/grown at rate r. C1 = first period's contribution. Verified
 * exact against the reference's own "save 18.69% of your income" figure. */
function growingAnnuityFV(C1, r, g, n) {
  if (n <= 0 || C1 === 0) return 0;
  if (Math.abs(r - g) < 1e-9) return C1 * n * Math.pow(1 + r, n - 1);
  return C1 * (Math.pow(1 + r, n) - Math.pow(1 + g, n)) / (r - g);
}

/** The periodic contribution (ordinary, end-of-period) needed to reach a
 * future value target — the "sinking fund" formula. Verified exact for
 * annual-frequency contributions; for MONTHLY contributions specifically,
 * a small (~0.02%) residual remains even after testing several
 * alternative conventions (mid-period timing, due timing, various period
 * counts) — the mid-period adjustment below is the closest fit found. */
function sinkingFundContribution(FV, i, n) {
  if (n <= 0) return 0;
  return i === 0 ? FV / n : FV * i / (Math.pow(1 + i, n) - 1);
}

/** Level payment that fully pays out (or pays off) `P` over `n` periods
 * at periodic rate `i` — verified exact against the reference's "fixed
 * amount" withdrawal mode and the Payment/Loan calculators' own formula. */
function levelPayment(P, i, n) {
  if (P <= 0 || n <= 0) return 0;
  return i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n));
}

/** Present value needed to sustain a withdrawal that starts at W0 and
 * GROWS at rate g each period, given the balance itself grows at rate r,
 * fully depleting after n periods (a "growing annuity"). This is the
 * standard closed-form used throughout the calculator for inflation-
 * adjusted ("fixed purchasing power") withdrawal planning.
 *
 * NOT verified to the penny: extensive testing (annual vs. monthly
 * granularity, ordinary vs. due timing, stepped vs. smooth growth, 2-15
 * different period-compounding conventions) against the reference's own
 * chart data and result figures got within ~0.1%-0.5% but never found an
 * exact match — the reference's real implementation appears to use some
 * other internal convention that wasn't identified. This is the
 * best-fit, most standard formula found; flagged clearly here and in
 * retirement-calculator-notes.md. */
function growingAnnuityPV(W0, r, g, n) {
  if (n <= 0 || W0 <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return W0 * n / (1 + r);
  const ratio = Math.pow((1 + g) / (1 + r), n);
  return W0 / (r - g) * (1 - ratio);
}

/** The algebraic inverse of growingAnnuityPV(): given a starting balance
 * (PV), the first-period withdrawal that fully depletes it over n periods
 * while growing at rate g, with the balance itself growing at rate r.
 * Because growingAnnuityPV() is linear in W0, this is exact wherever
 * growingAnnuityPV() itself is (same documented residual, not a new one) —
 * used so the "have" (current-plan) scenario's sustainable income is
 * solved directly from ITS OWN balance rather than scaled from the "need"
 * scenario by amountWillHave/amountNeeded. The scaled version breaks down
 * (silently returns $0) whenever amountNeeded is $0 or near-$0 — e.g. when
 * other retirement income already covers the whole target — even though a
 * real, positive "have" balance can still sustain real withdrawals. */
function growingAnnuityPayment(PV, r, g, n) {
  if (n <= 0 || PV <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return PV * (1 + r) / n;
  const ratio = Math.pow((1 + g) / (1 + r), n);
  return PV * (r - g) / (1 - ratio);
}

function resolveValueOrPercent(value, unit, basisAmount) {
  const n = Math.max(0, Number(value) || 0);
  return unit === "percent" ? (n / 100) * basisAmount : n;
}

/** Validates that life expectancy exceeds the EFFECTIVE retirement age
 * (current age, if the entered retirement age is already <= current age
 * — see the "already retired" handling in calculateRetirementNeed() —
 * otherwise the entered retirement age itself). Both
 * calculateRetirementNeed() and calculateWithdrawal() internally clamp
 * `ageL = max(ageR, lifeExpectancy)`, which silently "corrects" an
 * invalid life-expectancy-before-retirement input into a degenerate
 * zero-length retirement instead of rejecting it — the reference instead
 * blocks calculation entirely with a warning ("Life expectancy needs to
 * be larger than planned retirement age."). UI cards should call this
 * BEFORE calling into the engine and show the returned message instead
 * of computing a result when it's non-null. Returns null when valid. */
export function validateRetirementAges({ currentAge, retireAge, lifeExpectancy }) {
  const age0 = Math.max(0, Number(currentAge) || 0);
  const ageR = Math.max(age0, Number(retireAge) || 0);
  const ageL = Number(lifeExpectancy) || 0;
  if (ageL <= ageR) {
    return ageR > age0
      ? "Life expectancy needs to be larger than planned retirement age."
      : "Life expectancy needs to be larger than your current age.";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// 1. "How much do you need to retire?"
// ─────────────────────────────────────────────────────────────────

export function calculateRetirementNeed({
  currentAge, retireAge, lifeExpectancy, currentIncome, incomeIncreasePercent,
  retIncomeLevel, retIncomeUnit, avgReturnPercent, inflationPercent,
  otherIncomeMonthly, currentSavings, futureSavings, futureSavingsUnit,
}) {
  const age0 = Math.max(0, Number(currentAge) || 0);
  const ageR = Math.max(age0, Number(retireAge) || 0);
  const ageL = Math.max(ageR, Number(lifeExpectancy) || 0);
  const yearsToRetirement = Math.max(0, ageR - age0);
  const yearsInRetirement = Math.max(0, ageL - ageR);
  const income0 = Math.max(0, Number(currentIncome) || 0);
  const incomeGrowth = toRate(incomeIncreasePercent);
  const avgReturn = toRate(avgReturnPercent);
  const inflation = toRate(inflationPercent);
  const otherIncomeAnnual = Math.max(0, Number(otherIncomeMonthly) || 0) * 12;
  const savings0 = Math.max(0, Number(currentSavings) || 0);

  // The retirement-income TARGET (both "% of current income" and "$
  // amount" modes) is projected to retirement age via INFLATION, not the
  // "current income increase" rate — confirmed by driving the live
  // reference with a scenario where the two rates genuinely differ
  // (3% income increase vs. 7% inflation): using incomeGrowth here gave
  // amountNeeded 125% too low; switching to inflation closed it to ~2.6%
  // (the usual small residual). Every previously-verified scenario had
  // used EQUAL income-increase/inflation rates (or yearsToRetirement=0),
  // which is why this was invisible until a scenario with genuinely
  // different rates was tested. `incomeGrowth` is still used, correctly,
  // for growing the user's actual income during the ACCUMULATION/
  // contribution simulation below — that's a separate, independently-
  // verified computation this doesn't affect.
  const incomeAtRetirement = income0 * Math.pow(1 + inflation, yearsToRetirement);
  const grossTargetAnnual = retIncomeUnit === "percent"
    ? Math.max(0, Number(retIncomeLevel) || 0) / 100 * incomeAtRetirement
    : Math.max(0, Number(retIncomeLevel) || 0) * Math.pow(1 + inflation, yearsToRetirement);
  const targetAnnualIncome = Math.max(0, grossTargetAnnual - otherIncomeAnnual);

  // "Amount needed" uses the growing-annuity formula at MONTHLY
  // granularity (both the investment return and the inflation-driven
  // withdrawal growth EAR-bridged down to monthly) — verified noticeably
  // closer to the reference than a purely annual version, though still
  // carrying the documented residual (see growingAnnuityPV()'s comment).
  const monthlyReturnRate = monthlyRateFromAnnual(avgReturnPercent);
  const monthlyInflationRate = monthlyRateFromAnnual(inflationPercent);
  const retirementMonths = yearsInRetirement * 12;
  const amountNeeded = growingAnnuityPV(targetAnnualIncome / 12, monthlyReturnRate, monthlyInflationRate, retirementMonths);

  // "Current plan" accumulation — a pure annual simulation (verified
  // exact against the reference's own year-by-year chart data): each
  // year, that year's contribution (a % of THAT year's income, still at
  // its pre-growth value, or a flat $ amount) is added to a balance that
  // grows at avgReturn — THEN income grows for the following year. Chart
  // points are labeled by "completed years of age": the point labeled
  // `currentAge` is the balance after ONE full year has elapsed (matches
  // the reference's own chart exactly — it has no "year zero" point).
  function simulateAccumulation(contributionForYear) {
    let balance = savings0;
    let income = income0;
    const path = [];
    for (let year = 1; year <= yearsToRetirement; year++) {
      const contribution = contributionForYear(income, year);
      balance = balance * (1 + avgReturn) + contribution;
      income *= 1 + incomeGrowth;
      path.push({ age: age0 + year - 1, balance });
    }
    return { finalBalance: balance, path };
  }

  const currentPlanContribution = (income) => resolveValueOrPercent(futureSavings, futureSavingsUnit, income);
  const { finalBalance: amountWillHave, path: havePath } = simulateAccumulation(currentPlanContribution);

  // Informational only (shown nowhere critical to the math below) — the
  // "have" scenario's own income/chart are solved independently via
  // growingAnnuityPayment(), not by scaling through this ratio, so this
  // stays well-defined even when amountNeeded is $0.
  const haveRatio = amountNeeded > 0 ? amountWillHave / amountNeeded : 1;

  // Savings-plan suggestions to hit `amountNeeded` exactly.
  const neededFromContrib = Math.max(0, amountNeeded - savings0 * Math.pow(1 + avgReturn, yearsToRetirement));
  const monthlyRate = monthlyRateFromAnnual(avgReturnPercent);
  const monthlyMonths = yearsToRetirement * 12;
  const monthlySavingsAmount = sinkingFundContribution(neededFromContrib, monthlyRate, monthlyMonths);
  const yearlySavingsAmount = sinkingFundContribution(neededFromContrib, avgReturn, yearsToRetirement);
  const percentOfIncomeNeeded = solvePercentOfIncome(neededFromContrib, income0, avgReturn, incomeGrowth, yearsToRetirement);

  // Balance-by-age chart: accumulation phase (pure annual, verified
  // exact) + retirement/withdrawal phase (growing-annuity depletion, best
  // effort — see growingAnnuityPV()).
  const targetContribution = () => yearlySavingsAmount;
  const { path: targetAccumPath } = simulateAccumulation(targetContribution);

  const retirementPath = buildRetirementDepletionPath({
    startBalance: amountNeeded, startAge: ageR, endAge: ageL,
    firstMonthlyWithdrawal: targetAnnualIncome / 12, monthlyReturnRate, monthlyInflationRate,
  });

  // Each scenario's sustainable withdrawal-FROM-SAVINGS is solved directly
  // from ITS OWN starting balance via growingAnnuityPayment() (the inverse
  // of the formula used to derive amountNeeded above) — not scaled from
  // the other scenario. This is mathematically identical to ratio-scaling
  // whenever amountNeeded > 0 (growingAnnuityPV/Payment are linear in
  // balance), but stays correct in the edge case where amountNeeded is $0
  // (e.g. other retirement income alone already covers the target) — a
  // real "have" balance can still sustain real withdrawals even though
  // "need" is $0.
  //
  // The reference's own result table reports "Income" as the SUM of two
  // separately-shown rows: "from savings" (this withdrawal) and "other
  // income" (the user's input, entered as a nominal/future-dollar figure
  // "at time of retirement age" per the reference's own tooltip). Its
  // ACTUAL AMOUNT column shows that input flat/unchanged (it's already
  // future dollars), but its TODAY'S MONEY column deflates it by
  // inflation over yearsToRetirement — the SAME treatment as every other
  // "today's money" figure in this calculator, not a special flat
  // exception. (An earlier version of this code kept other income flat
  // in BOTH columns; that went unnoticed because the first scenario
  // tested had a short timeframe and low inflation, where the deflated
  // and flat figures round to the same displayed dollar — a scenario
  // with a longer timeframe and higher inflation (16 years, 7%) exposed
  // it: reference shows "$40/month actual, $14/month today's money",
  // not "$40/$40".) Verified against a reference scenario with a small
  // nonzero other-income ($2/mo): "from savings" matched our own
  // growingAnnuityPayment() figure almost exactly, confirming other
  // income needs to be added back in for the displayed total — it was
  // previously silently dropped from display (only ever used to reduce
  // the SAVINGS-derived target, never re-added for the shown total).
  const otherIncomeMonthlyFlat = Math.max(0, Number(otherIncomeMonthly) || 0);
  const otherIncomeMonthlyTodays = otherIncomeMonthlyFlat / Math.pow(1 + inflation, yearsToRetirement);
  function retirementIncomeBreakdown(balance) {
    const fromSavingsActual = growingAnnuityPayment(balance, monthlyReturnRate, monthlyInflationRate, retirementMonths);
    const fromSavingsTodays = fromSavingsActual / Math.pow(1 + inflation, yearsToRetirement);
    return {
      actual: fromSavingsActual + otherIncomeMonthlyFlat,
      todays: fromSavingsTodays + otherIncomeMonthlyTodays,
      fromSavings: { actual: fromSavingsActual, todays: fromSavingsTodays },
      otherIncome: { actual: otherIncomeMonthlyFlat, todays: otherIncomeMonthlyTodays },
    };
  }

  const incomeNow = retirementIncomeBreakdown(amountWillHave);

  const haveAccumPath = havePath;
  const haveRetirementPath = buildRetirementDepletionPath({
    // Only the from-savings portion actually depletes the savings
    // balance — the flat "other income" isn't drawn from it.
    startBalance: amountWillHave, startAge: ageR, endAge: ageL,
    firstMonthlyWithdrawal: incomeNow.fromSavings.actual, monthlyReturnRate, monthlyInflationRate,
  });

  const balanceByAge = {
    have: [...haveAccumPath, ...haveRetirementPath],
    need: [...targetAccumPath, ...retirementPath],
  };

  return {
    amountNeeded, amountWillHave, haveRatio,
    // The EFFECTIVE retirement age used throughout this calculation —
    // clamped to at least `currentAge` (see `ageR` above). The reference
    // clamps the same way internally but, critically, also DISPLAYS this
    // clamped age rather than echoing back a nonsensical raw input (e.g.
    // "at the age of 7" for someone who is already 50) — the UI must use
    // this field, not the raw form input, for every age shown in result
    // text. `alreadyRetired` flags the degenerate case (yearsToRetirement
    // === 0, i.e. the entered retirement age was <= current age) that the
    // reference narrates differently ("You are in retirement...") rather
    // than talking about a future retirement date.
    effectiveRetireAge: ageR,
    alreadyRetired: yearsToRetirement === 0,
    incomeNow,
    incomeTarget: retirementIncomeBreakdown(amountNeeded),
    monthlySavingsAmount, yearlySavingsAmount, percentOfIncomeNeeded,
    balanceByAge,
  };
}

function solvePercentOfIncome(targetFV, income0, r, g, n) {
  if (targetFV <= 0 || income0 <= 0 || n <= 0) return 0;
  let lo = 0, hi = 100;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const fv = growingAnnuityFV((mid / 100) * income0, r, g, n);
    if (fv < targetFV) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Monthly-granularity depletion of a retirement balance (grown/withdrawn
 * every month, using the same monthly EAR-bridged rates as
 * `amountNeeded` above, so the chart's starting point ties out to it
 * exactly), sampled once per year for the chart. Withdrawal starts at
 * `firstMonthlyWithdrawal` and grows every month; the balance grows every
 * month. See growingAnnuityPV()'s doc comment re: the small residual in
 * this formula. */
function buildRetirementDepletionPath({ startBalance, startAge, endAge, firstMonthlyWithdrawal, monthlyReturnRate, monthlyInflationRate }) {
  const years = Math.max(0, endAge - startAge);
  const path = [];
  let balance = startBalance;
  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      const monthIndex = (year - 1) * 12 + m;
      const withdrawal = firstMonthlyWithdrawal * Math.pow(1 + monthlyInflationRate, monthIndex);
      balance = Math.max(0, balance * (1 + monthlyReturnRate) - withdrawal);
    }
    // Same "completed years" labeling as the accumulation phase: the
    // point labeled `startAge` already reflects one full year of
    // withdrawals, matching the reference's own chart exactly.
    path.push({ age: startAge + year - 1, balance });
  }
  return path;
}

// ─────────────────────────────────────────────────────────────────
// 2. "How can you save for retirement?"
// ─────────────────────────────────────────────────────────────────

export function calculateSavingsPlan({ currentAge, retireAge, amountNeeded, currentSavings, avgReturnPercent }) {
  const yearsToRetirement = Math.max(0, (Number(retireAge) || 0) - (Number(currentAge) || 0));
  const target = Math.max(0, Number(amountNeeded) || 0);
  const savings0 = Math.max(0, Number(currentSavings) || 0);
  const avgReturn = toRate(avgReturnPercent);

  const neededFromContrib = Math.max(0, target - savings0 * Math.pow(1 + avgReturn, yearsToRetirement));

  const monthlyRate = monthlyRateFromAnnual(avgReturnPercent);
  const months = yearsToRetirement * 12;
  // Mid-period adjustment: the closest-fitting convention found after
  // testing ordinary/due timing and several period counts against the
  // reference's own precise result — see growingAnnuityPV()'s comment for
  // the same category of residual. Ordinary timing alone was ~0.3% off;
  // this gets within ~0.02%.
  const monthlyOrdinary = sinkingFundContribution(neededFromContrib, monthlyRate, months);
  const monthlyAmount = monthlyOrdinary / Math.pow(1 + monthlyRate, 0.5);
  const monthlyTotalPrincipal = savings0 + monthlyAmount * months;
  const monthlyTotalInterest = target - monthlyTotalPrincipal;

  const yearlyAmount = sinkingFundContribution(neededFromContrib, avgReturn, yearsToRetirement);
  const yearlyTotalPrincipal = savings0 + yearlyAmount * yearsToRetirement;
  const yearlyTotalInterest = target - yearlyTotalPrincipal;

  const additionalNow = presentValueLumpSum(neededFromContrib, monthlyRate, months);
  const lumpTotalPrincipal = savings0 + additionalNow;
  const lumpTotalInterest = target - lumpTotalPrincipal;

  return {
    target,
    monthly: { amount: monthlyAmount, totalPrincipal: monthlyTotalPrincipal, totalInterest: monthlyTotalInterest },
    yearly: { amount: yearlyAmount, totalPrincipal: yearlyTotalPrincipal, totalInterest: yearlyTotalInterest },
    lump: { additionalNow, totalPrincipal: lumpTotalPrincipal, totalInterest: lumpTotalInterest },
  };
}

// ─────────────────────────────────────────────────────────────────
// 3. "How much can you withdraw after retirement?"
// ─────────────────────────────────────────────────────────────────

export function calculateWithdrawal({
  currentAge, retireAge, lifeExpectancy, currentSavings, annualContribution,
  monthlyContribution, avgReturnPercent, inflationPercent,
}) {
  const age0 = Math.max(0, Number(currentAge) || 0);
  const ageR = Math.max(age0, Number(retireAge) || 0);
  const ageL = Math.max(ageR, Number(lifeExpectancy) || 0);
  const yearsToRetirement = ageR - age0;
  const yearsInRetirement = ageL - ageR;
  const savings0 = Math.max(0, Number(currentSavings) || 0);
  const annualC = Math.max(0, Number(annualContribution) || 0);
  const monthlyC = Math.max(0, Number(monthlyContribution) || 0);
  const avgReturn = toRate(avgReturnPercent);
  const inflation = toRate(inflationPercent);

  const monthlyRate = monthlyRateFromAnnual(avgReturnPercent);
  const months = yearsToRetirement * 12;

  const initialFV = futureValueLumpSum(savings0, monthlyRate, months);
  const annualContribFV = annuityFV(annualC, avgReturn, yearsToRetirement);
  const monthlyContribFV = annuityFV(monthlyC, monthlyRate, months);
  const balanceAtRetirement = initialFV + annualContribFV + monthlyContribFV;
  const todaysPurchasingPower = presentValueLumpSum(balanceAtRetirement, inflation, yearsToRetirement);

  const retMonths = yearsInRetirement * 12;
  const growingW0 = solveGrowingWithdrawal(balanceAtRetirement, monthlyRate, monthlyRateFromAnnual(inflationPercent), retMonths);
  const growingTodays = growingW0 / Math.pow(1 + inflation, yearsToRetirement);

  const flatMonthly = levelPayment(balanceAtRetirement, monthlyRate, retMonths);
  const flatTodaysAtRetirement = flatMonthly / Math.pow(1 + inflation, yearsToRetirement);
  const flatTodaysAtLifeExpectancy = flatMonthly / Math.pow(1 + inflation, ageL - age0);

  return {
    balanceAtRetirement, todaysPurchasingPower,
    growing: { monthlyAtRetirement: growingW0, todaysMoney: growingTodays },
    flat: { monthly: flatMonthly, todaysAtRetirement: flatTodaysAtRetirement, todaysAtLifeExpectancy: flatTodaysAtLifeExpectancy },
  };
}

/** Solves for the first-month growing withdrawal via the closed-form
 * growing-annuity formula, monthly-granularity — see growingAnnuityPV()'s
 * doc comment for the residual. */
function solveGrowingWithdrawal(balance, rM, gM, months) {
  if (months <= 0 || balance <= 0) return 0;
  if (Math.abs(rM - gM) < 1e-9) return balance * (rM - gM === 0 ? 1 / months : 1) * (1 + rM);
  const ratio = Math.pow((1 + gM) / (1 + rM), months);
  return balance * (rM - gM) / (1 - ratio);
}

// ─────────────────────────────────────────────────────────────────
// 4. "How long can your money last?"
// ─────────────────────────────────────────────────────────────────

export function calculateMoneyLongevity({ amountYouHave, monthlyWithdraw, avgReturnPercent }) {
  const P = Math.max(0, Number(amountYouHave) || 0);
  const M = Math.max(0, Number(monthlyWithdraw) || 0);
  const i = monthlyRateFromAnnual(avgReturnPercent);

  let months;
  if (P <= 0 || M <= 0) {
    months = 0;
  } else if (i === 0) {
    months = P / M;
  } else if (M <= P * i) {
    months = Infinity; // withdrawal doesn't even cover the interest — never depletes
  } else {
    months = Math.log(1 / (1 - (P * i) / M)) / Math.log(1 + i);
  }

  const withdrawLengthTable = [1, 2, 3, 4, 5, 6, 7, 8].map((years) => ({
    years, monthlyAmount: levelPayment(P, i, years * 12),
  }));

  return { months, withdrawLengthTable };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** "$1.88M" / "$450K" style compact formatting — used ONLY for the
 * balance-by-age chart's Y-axis gridline labels, which the reference
 * keeps compact regardless of scale. */
export function formatCompactCurrency(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return formatCurrency(n, { decimals: 0 });
}

/** The reference's headline/bar-chart/results-text formatting: EXACT
 * comma-separated dollars (no "K" abbreviation at all) below $1,000,000,
 * "$X.XXM" only at/above it. Confirmed against the reference showing
 * "$79,625" and "$304,000" verbatim (not "$80K"/"$304K") while an
 * earlier, larger scenario showed "$1.89M" — the K-abbreviation tier
 * that formatCompactCurrency() uses for the chart axis does NOT apply
 * here. */
export function formatHeadlineMoney(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  return formatCurrency(n, { decimals: 0 });
}

/** "3 years and 11.7 months" style, matching the reference's Money
 * Longevity result. */
export function formatYearsAndDecimalMonths(totalMonths) {
  if (!Number.isFinite(totalMonths)) return "forever";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths - years * 12;
  const yearLabel = years === 1 ? "year" : "years";
  return `${years} ${yearLabel} and ${months.toFixed(1)} months`;
}
