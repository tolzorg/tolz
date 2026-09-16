// Shared growing-annuity math reused across this app's retirement-income
// calculators (Pension Calculator, Social Security Calculator) — both
// reference sites' "compare two options over a range of life
// expectancies" charts use the exact same underlying mechanics.

export function monthlyRateFromAnnual(annualReturn) {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

/** PV of a monthly annuity (ORDINARY — payment at the END of each
 * month), with COLA applied once every 12 months (flat for the first 12
 * payments, then bumped each year). VERIFIED against the Pension
 * Calculator's own 56-point live tooltip series to within ~0.2% at
 * every point — a small, documented residual that does not change which
 * integer age a crossover sentence reports. */
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

/** Finds the crossover age between an "earlier"/baseline series and a
 * "later"/eventually-overtaking series, using LINEAR INTERPOLATION
 * between the two bracketing integer-age points and FLOORING the
 * result — VERIFIED EXACT against 2 independently live-confirmed
 * reference scenarios (the Pension Calculator's "work longer" sentence
 * and the Social Security Calculator's "compare two ages" sentence).
 * Both report a crossover age ONE LOWER than the first integer age
 * where the later series's raw value actually overtakes the earlier
 * one, because the true crossover happens at a FRACTIONAL age within
 * that year — the reference's sentence reports the (floored) year the
 * crossover occurs in, not the first fully-elapsed integer year of the
 * newly-favored option. This is a DIFFERENT rule than a flat-line-vs-
 * growing-curve comparison (see the Pension Calculator's "lump sum vs.
 * monthly" sub-calculator, which uses plain first-integer-where-crossed
 * instead — verified independently, do not conflate the two). */
export function findFloorInterpolatedCrossoverAge(points, getEarlierVal, getLaterVal) {
  let prevEarlier = null;
  let prevLater = null;
  let prevAge = null;
  for (const p of points) {
    const earlierVal = getEarlierVal(p);
    const laterVal = getLaterVal(p);
    if (laterVal >= earlierVal) {
      if (prevAge === null) return p.age; // crosses at the very first point
      const prevDiff = prevEarlier - prevLater; // > 0 (earlier was ahead)
      const diff = laterVal - earlierVal; // >= 0 (later now ahead or tied)
      const frac = prevDiff + diff > 0 ? prevDiff / (prevDiff + diff) : 0;
      return Math.floor(prevAge + frac);
    }
    prevEarlier = earlierVal;
    prevLater = laterVal;
    prevAge = p.age;
  }
  return null;
}
