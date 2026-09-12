// Pension Calculator engine — matches calculator.net/pension-calculator.html.
// This is a 3-in-1 calculator (3 independent sub-forms on the reference
// page, `ctype=1/2/3`) with a WORKING GET query-string interface for all
// three, so every formula below was verified via plain curl requests
// (reading the live reference's own chart-tooltip data, which embeds
// exact dollar figures per age/point — a very high-precision source).
// See pension-calculator-notes.md for the full writeup.

export { formatCurrency } from "./financeCalculatorEngine.js";

const CHART_MAX_AGE = 121;

// ── Input validation ────────────────────────────────────────────────
// VERIFIED EXACT via live bisection (found and fixed after a user bug
// report — an unreasonable retirement age like 23 was silently computed
// instead of rejected): the reference validates several fields before
// calculating and shows a warning banner ("⚠ Please provide a
// reasonable ...") in place of the result, leaving the input form
// otherwise untouched. Ranges below are INCLUSIVE unless noted, bisected
// to the exact boundary dollar-for-dollar against the live reference.
const RETIREMENT_AGE_RANGE = [30, 100];
const LIFE_EXPECTANCY_RANGE = [30, 120]; // both the retiree's and the spouse's
const SPOUSES_AGE_RANGE = [16, 100]; // spouse's CURRENT age, a different range than life expectancy
const INVESTMENT_RETURN_RANGE = [-99.999999, 1000]; // confirmed: -100 itself fails, -99 passes; 1000 passes, 1001 fails
const COLA_RANGE = [0, 50];

function inRange(value, [min, max]) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function monthlyRateFromAnnual(annualReturn) {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

// ── Sub-calculator 1 & 3's chart curve: monthly compounding ─────────
// PV of a monthly annuity (ORDINARY — payment at the END of each
// month), with the COLA applied once every 12 months (flat for the
// first 12 payments, then bumped each year). Verified against the
// reference's own 56-point tooltip series (ages 66-121) to within
// ~0.2% at every point — a small residual (see notes) that does not
// change which integer age the crossover sentence reports.
export function pvMonthlyGrowingAnnuity(monthlyPayment, months, annualReturn, colaAnnual) {
  if (months <= 0 || monthlyPayment <= 0) return 0;
  const r = monthlyRateFromAnnual(annualReturn);
  let pv = 0;
  for (let m = 0; m < months; m++) {
    const yearIndex = Math.floor(m / 12);
    const payment = monthlyPayment * Math.pow(1 + colaAnnual, yearIndex);
    pv += payment / Math.pow(1 + r, m + 1);
  }
  return pv;
}

// ── Sub-calculator 2's headline figures: ANNUAL compounding ─────────
// (VERIFIED EXACT — solved to the exact dollar against 3 independent
// live scenarios, including the reference's own screenshot numbers.)

// Growing annuity-DUE (payment at the START of each year).
function pvAnnualGrowingAnnuityDue(annualPayment, years, rate, growth) {
  if (years <= 0 || annualPayment <= 0) return 0;
  let pv = 0;
  for (let k = 0; k < years; k++) pv += annualPayment * Math.pow(1 + growth, k) / Math.pow(1 + rate, k);
  return pv;
}

// Growing annuity future value, ORDINARY (payment at the END of each
// year), valued at time = years (right after the last payment).
function fvAnnualGrowingAnnuityOrdinary(annualPayment, years, rate, growth) {
  if (years <= 0 || annualPayment <= 0) return 0;
  let fv = 0;
  for (let k = 0; k < years; k++) fv += annualPayment * Math.pow(1 + growth, k) * Math.pow(1 + rate, years - 1 - k);
  return fv;
}

// ─────────────────────────────────────────────────────────────────
// 1. Lump sum payout or monthly pension income?
// ─────────────────────────────────────────────────────────────────
export function calculateLumpSumOrMonthly({ retirementAge, lumpSumAmount, investmentReturn, monthlyIncome, cola }) {
  const retAge = Number(retirementAge) || 0;
  const lumpRaw = Number(lumpSumAmount) || 0;
  const returnRaw = Number(investmentReturn) || 0;
  const monthlyRaw = Number(monthlyIncome) || 0;
  const colaRaw = Number(cola) || 0;

  if (!inRange(retAge, RETIREMENT_AGE_RANGE)) return { error: "Please provide a reasonable retirement age." };
  if (lumpRaw < 0) return { error: "Please provide a positive lump sum payment amount." };
  if (monthlyRaw < 0) return { error: "Please provide a positive monthly pension income." };
  if (!inRange(returnRaw, INVESTMENT_RETURN_RANGE)) return { error: "Please provide a reasonable investment return." };
  if (!inRange(colaRaw, COLA_RANGE)) return { error: "Please provide a reasonable cost of living adjustment." };

  const lump = lumpRaw;
  const ret = returnRaw / 100;
  const monthly = monthlyRaw;
  const colaRate = colaRaw / 100;

  const startAge = retAge + 1;
  const endAge = Math.max(startAge, CHART_MAX_AGE);
  const points = [];
  for (let age = startAge; age <= endAge; age++) {
    const months = (age - retAge) * 12;
    points.push({ age, lumpSum: lump, monthly: pvMonthlyGrowingAnnuity(monthly, months, ret, colaRate) });
  }

  let crossoverAge = null;
  for (const p of points) {
    if (p.monthly >= p.lumpSum) { crossoverAge = p.age; break; }
  }

  let sentence;
  if (crossoverAge === startAge) sentence = { kind: "alwaysMonthly" };
  else if (crossoverAge === null) sentence = { kind: "alwaysLumpSum", investmentReturn };
  else sentence = { kind: "crossover", investmentReturn, crossoverAge };

  return {
    points,
    crossoverAge,
    sentence,
    lumpSumSeries: points.map((p) => ({ x: p.age, y: p.lumpSum })),
    monthlySeries: points.map((p) => ({ x: p.age, y: p.monthly })),
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. Single-life or joint-and-survivor pension payout?
// ─────────────────────────────────────────────────────────────────
export function calculateSingleLifeOrJoint({
  retirementAge, lifeExpectancy, spousesAge, spouseLifeExpectancy,
  singleLifePension, jointSurvivorPension, investmentReturn, cola,
}) {
  const retAge = Number(retirementAge) || 0;
  const lifeExp = Number(lifeExpectancy) || 0;
  const spouseAge = Number(spousesAge) || 0;
  const spouseLifeExp = Number(spouseLifeExpectancy) || 0;
  const singleLifeRaw = Number(singleLifePension) || 0;
  const jointSurvivorRaw = Number(jointSurvivorPension) || 0;
  const returnRaw = Number(investmentReturn) || 0;
  const colaRaw = Number(cola) || 0;

  if (!inRange(retAge, RETIREMENT_AGE_RANGE)) return { error: "Please provide a reasonable retirement age." };
  if (!inRange(lifeExp, LIFE_EXPECTANCY_RANGE)) return { error: "Please provide your reasonable life expectancy." };
  if (!inRange(spouseAge, SPOUSES_AGE_RANGE)) return { error: "Please provide a reasonable spouse's age when you retire." };
  if (!inRange(spouseLifeExp, LIFE_EXPECTANCY_RANGE)) return { error: "Please provide your spouse's reasonable life expectancy." };
  if (singleLifeRaw < 0) return { error: "Please provide a positive single life pension amount." };
  if (jointSurvivorRaw < 0) return { error: "Please provide a positive joint survivor pension amount." };
  if (!inRange(returnRaw, INVESTMENT_RETURN_RANGE)) return { error: "Please provide a reasonable investment return." };
  if (!inRange(colaRaw, COLA_RANGE)) return { error: "Please provide a reasonable cost of living adjustment." };

  const singleLife = singleLifeRaw;
  const jointSurvivor = jointSurvivorRaw;
  const ret = returnRaw / 100;
  const colaRate = colaRaw / 100;

  // Lump sum needed today (retiree dies at retirement) to replace the
  // survivor pension the spouse would receive from their current age
  // through their life expectancy — VERIFIED EXACT: n is the INCLUSIVE
  // count of payment-years (spouseLifeExp - spousesAge + 1).
  const lumpSumYears = Math.max(0, spouseLifeExp - spouseAge + 1);
  const lumpSum = pvAnnualGrowingAnnuityDue(12 * jointSurvivor, lumpSumYears, ret, colaRate);
  const insuranceTerm = Math.max(0, spouseLifeExp - spouseAge);
  const paymentDiff = singleLife - jointSurvivor;

  // Investment perspective — VERIFIED EXACT against the reference's
  // screenshot scenario ($514,709 / $428,530):
  //  (a) future value, at retiree's life expectancy, of investing the
  //      payment difference every year (n = lifeExp - retAge + 1,
  //      ORDINARY future value);
  //  (b) present value, AT that same future vantage point, of the
  //      survivor pension still owed to the spouse from their age at
  //      that vantage through their own life expectancy (ANNUITY DUE,
  //      with the payment level having grown by COLA for
  //      vantageYears+1 years by that point).
  const vantageYears = Math.max(0, lifeExp - retAge);
  const fvYears = Math.max(0, lifeExp - retAge + 1);
  const fvDiff = fvAnnualGrowingAnnuityOrdinary(12 * paymentDiff, fvYears, ret, colaRate);

  const spouseAgeAtVantage = spouseAge + vantageYears;
  const remainingYears = Math.max(0, spouseLifeExp - spouseAgeAtVantage);
  const grownAnnualSurvivor = 12 * jointSurvivor * Math.pow(1 + colaRate, vantageYears + 1);
  const pvRemaining = pvAnnualGrowingAnnuityDue(grownAnnualSurvivor, remainingYears, ret, colaRate);

  const betterOption = fvDiff >= pvRemaining ? "single" : "joint";

  return {
    lumpSum, insuranceTerm, paymentDiff,
    lifeExpectancy: lifeExp, spouseAgeAtVantage,
    fvDiff, pvRemaining, remainingYears, betterOption,
    retirementAge: retAge,
  };
}

// ─────────────────────────────────────────────────────────────────
// 3. Should you work longer for a better pension?
// ─────────────────────────────────────────────────────────────────
export function calculateWorkLonger({ retirementAge1, monthlyIncome1, retirementAge2, monthlyIncome2, investmentReturn, cola }) {
  const r1 = Number(retirementAge1) || 0;
  const m1Raw = Number(monthlyIncome1) || 0;
  const r2 = Number(retirementAge2) || 0;
  const m2Raw = Number(monthlyIncome2) || 0;
  const returnRaw = Number(investmentReturn) || 0;
  const colaRaw = Number(cola) || 0;

  if (!inRange(r1, RETIREMENT_AGE_RANGE)) return { error: "Please provide a reasonable retirement age 1." };
  if (!inRange(r2, RETIREMENT_AGE_RANGE)) return { error: "Please provide a reasonable retirement age 2." };
  if (m1Raw < 0) return { error: "Please provide a positive monthly pension income 1." };
  if (m2Raw < 0) return { error: "Please provide a positive monthly pension income 2." };
  if (!inRange(returnRaw, INVESTMENT_RETURN_RANGE)) return { error: "Please provide a reasonable investment return." };
  if (!inRange(colaRaw, COLA_RANGE)) return { error: "Please provide a reasonable cost of living adjustment." };

  const m1 = m1Raw;
  const m2 = m2Raw;
  const ret = returnRaw / 100;
  const colaRate = colaRaw / 100;

  const refAge = Math.min(r1, r2);
  const startAge = refAge + 1;
  const endAge = Math.max(startAge, CHART_MAX_AGE);

  const points = [];
  for (let age = startAge; age <= endAge; age++) {
    const months1 = Math.max(0, age - r1) * 12;
    const pv1raw = age > r1 ? pvMonthlyGrowingAnnuity(m1, months1, ret, colaRate) : 0;
    const pv1 = pv1raw / Math.pow(1 + ret, Math.max(0, r1 - refAge));

    const months2 = Math.max(0, age - r2) * 12;
    const pv2raw = age > r2 ? pvMonthlyGrowingAnnuity(m2, months2, ret, colaRate) : 0;
    const pv2 = pv2raw / Math.pow(1 + ret, Math.max(0, r2 - refAge));

    points.push({ age, option1: pv1, option2: pv2 });
  }

  const laterIsOption2 = r2 >= r1;
  const laterAge = laterIsOption2 ? r2 : r1;
  const earlierAge = laterIsOption2 ? r1 : r2;

  let crossoverAge = null;
  for (const p of points) {
    const laterVal = laterIsOption2 ? p.option2 : p.option1;
    const earlierVal = laterIsOption2 ? p.option1 : p.option2;
    if (laterVal >= earlierVal) { crossoverAge = p.age; break; }
  }

  let sentence;
  if (crossoverAge === startAge) sentence = { kind: "alwaysLater", laterAge };
  else if (crossoverAge === null) sentence = { kind: "alwaysEarlier", earlierAge };
  else sentence = { kind: "crossover", crossoverAge, laterAge, earlierAge };

  return {
    points,
    crossoverAge,
    sentence,
    option1Series: points.map((p) => ({ x: p.age, y: p.option1 })),
    option2Series: points.map((p) => ({ x: p.age, y: p.option2 })),
    retirementAge1: r1, retirementAge2: r2,
  };
}
