// Social Security Calculator engine — matches
// calculator.net/social-security-calculator.html. This reference page
// HAS a working GET query-string interface, and its charts' tooltips
// embed exact figures per data point, so every formula below was
// verified via plain curl requests. See social-security-calculator-notes.md
// for the full writeup.

import { pvMonthlyGrowingAnnuity, findFloorInterpolatedCrossoverAge } from "./growingAnnuityMath.js";
import { getNraMonths, percentOfPia, formatNra, MIN_CLAIM_AGE, MAX_CLAIM_AGE } from "./socialSecurityLawParams.js";

export { formatCurrency } from "./financeCalculatorEngine.js";

const CHART_MAX_AGE = 121;

// ── Input validation ────────────────────────────────────────────────
// VERIFIED EXACT via live bisection against the reference.
const BIRTH_YEAR_MIN = 1900; // 1899 rejected, 1900 accepted
const RETIREMENT_AGE_RANGE = [30, 100]; // same range as the Pension Calculator's own retirement-age fields — shares that backend validator
const INVESTMENT_RETURN_RANGE = [-99.999999, 1000]; // -100 itself fails, -99 passes; 1000 passes, 1001 fails
const COLA_RANGE = [0, 50];

function inRange(value, [min, max]) {
  return Number.isFinite(value) && value >= min && value <= max;
}

// ─────────────────────────────────────────────────────────────────
// 1. Determine the ideal application age
// ─────────────────────────────────────────────────────────────────
export function calculateIdealApplicationAge({ birthYear, lifeExpectancy, investmentReturn, cola }) {
  const birth = Number(birthYear) || 0;
  const lifeExp = Number(lifeExpectancy) || 0;
  const returnRaw = Number(investmentReturn) || 0;
  const colaRaw = Number(cola) || 0;

  if (!Number.isFinite(birth) || birth < BIRTH_YEAR_MIN) return { error: "Please provide a reasonable birth year." };
  if (!(lifeExp > 0)) return { error: "Please provide a reasonable life expectancy." };
  if (!inRange(returnRaw, INVESTMENT_RETURN_RANGE)) return { error: "Please provide a reasonable investment return." };
  if (!inRange(colaRaw, COLA_RANGE)) return { error: "Please provide a reasonable cost of living adjustment." };

  const ret = returnRaw / 100;
  const colaRate = colaRaw / 100;

  // VERIFIED EXACT: the reference computes your CURRENT age from the
  // real calendar year (not a fixed date), and if you're already 70 or
  // older, skips the whole comparison in favor of a direct "apply now"
  // message — confirmed live at exactly this boundary (69 computes
  // normally, 70 shows this message).
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birth;
  if (currentAge >= MAX_CLAIM_AGE) {
    return {
      alreadyTooOld: true,
      currentAge,
      points: [],
    };
  }

  const nraMonths = getNraMonths(birth);
  const refAge = MIN_CLAIM_AGE;

  const points = [];
  for (let age = MIN_CLAIM_AGE; age <= MAX_CLAIM_AGE; age++) {
    const pct = percentOfPia(age, nraMonths);
    // VERIFIED EXACT: Social Security benefit amounts are COLA-adjusted
    // starting at age 62 REGARDLESS of whether you've actually claimed
    // yet (a real SSA mechanic) — so the percentage-of-PIA figure also
    // compounds by COLA for every year of deferral before being turned
    // into a growing monthly annuity of its own.
    const deferralGrowth = Math.pow(1 + colaRate, age - refAge);
    const effectiveMonthly = pct * deferralGrowth;
    // VERIFIED EXACT: the number of YEARS of payments is INCLUSIVE —
    // (lifeExpectancy - age + 1), not a plain difference — confirmed by
    // fitting to a residual of $0.005 (effectively exact) against the
    // reference's own 9-point relative-value bar chart.
    const months = Math.max(0, lifeExp - age + 1) * 12;
    const pvAtClaim = pvMonthlyGrowingAnnuity(effectiveMonthly, months, ret, colaRate);
    const pvAtRef = pvAtClaim / Math.pow(1 + ret, age - refAge);
    points.push({ age, pv: pvAtRef, pctOfPia: pct });
  }

  const maxPv = Math.max(...points.map((p) => p.pv));
  for (const p of points) p.relativeValue = maxPv > 0 ? (p.pv / maxPv) * 100 : 0;

  const best = points.reduce((a, b) => (b.pv > a.pv ? b : a));
  const bestAge = best.age;
  const monthsDiff = bestAge * 12 - nraMonths;

  return {
    points,
    bestAge,
    bestPctOfPia: best.pctOfPia,
    nraMonths,
    nraLabel: formatNra(nraMonths),
    monthsDiff, // positive = after NRA, negative = before NRA, 0 = at NRA
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. Compare two application ages
// ─────────────────────────────────────────────────────────────────
export function calculateCompareTwoAges({ retirementAge1, monthlyIncome1, retirementAge2, monthlyIncome2, investmentReturn, cola }) {
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

  const ret = returnRaw / 100;
  const colaRate = colaRaw / 100;
  const refAge = Math.min(r1, r2);
  const startAge = refAge + 1;
  const endAge = Math.max(startAge, CHART_MAX_AGE);

  // VERIFIED EXACT: unlike the Pension Calculator's own "work longer"
  // comparison (arbitrary user-provided monthly incomes, no COLA-during-
  // deferral growth needed), Social Security benefit dollar amounts DO
  // grow by COLA every year starting from the EARLIER of the two
  // retirement ages, even before actually being claimed — confirmed
  // live via a scenario where NEITHER retirement age was 62 (65 vs 70),
  // which only fit once this deferral growth used the earlier age (65)
  // as its own reference point rather than a fixed age 62.
  function pvOption(monthly, retAge, age) {
    if (age <= retAge) return 0;
    const deferralGrowth = Math.pow(1 + colaRate, retAge - refAge);
    const effectiveMonthly = monthly * deferralGrowth;
    const months = (age - retAge) * 12;
    const raw = pvMonthlyGrowingAnnuity(effectiveMonthly, months, ret, colaRate);
    return raw / Math.pow(1 + ret, retAge - refAge);
  }

  const points = [];
  for (let age = startAge; age <= endAge; age++) {
    points.push({ age, option1: pvOption(m1Raw, r1, age), option2: pvOption(m2Raw, r2, age) });
  }

  const laterIsOption2 = r2 >= r1;
  const laterAge = laterIsOption2 ? r2 : r1;
  const earlierAge = laterIsOption2 ? r1 : r2;

  // Floor-of-linearly-interpolated crossover — see growingAnnuityMath.js.
  const crossoverAge = findFloorInterpolatedCrossoverAge(
    points,
    (p) => (laterIsOption2 ? p.option1 : p.option2),
    (p) => (laterIsOption2 ? p.option2 : p.option1),
  );

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
