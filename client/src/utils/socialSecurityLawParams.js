// Pure Social Security law data for the Social Security Calculator,
// matching calculator.net/social-security-calculator.html.
//
// VERIFIED EXACT against the live reference (this page DOES have a
// working GET query-string interface — every figure below was checked
// via plain curl requests):
//  - Normal (full) Retirement Age (NRA/FRA) by birth year — the real,
//    standard published SSA schedule.
//  - Early-retirement reduction: 5/9 of 1% per month for the first 36
//    months before NRA, then 5/12 of 1% per month for any additional
//    months beyond that (up to the 60-month-early ceiling at age 62 for
//    anyone with NRA=67). Confirmed exact via the reference's own
//    "your benefit will be X% of your primary insurance amount" line
//    for several birth years (1958 → 66y8mo NRA → 110.67% at 68;
//    1959 → 66y10mo NRA → 109.33% at 68; 1960+ → 67 NRA → 108% at 68).
//  - Delayed-retirement credit: 2/3 of 1% per month (8%/year) after NRA,
//    up to age 70 — the real, current rate for anyone born 1943+ (this
//    calculator doesn't support birth years old enough to hit the
//    lower historical delayed-credit rates).

// [birthYearFrom, birthYearTo, NRA in months past age 65] — NRA in
// months lets fractional ages (e.g. 66 years 8 months) be represented
// exactly. `to: null` means "and later".
export const NRA_SCHEDULE = [
  { from: 1900, to: 1937, nraMonths: 65 * 12 },
  { from: 1938, to: 1938, nraMonths: 65 * 12 + 2 },
  { from: 1939, to: 1939, nraMonths: 65 * 12 + 4 },
  { from: 1940, to: 1940, nraMonths: 65 * 12 + 6 },
  { from: 1941, to: 1941, nraMonths: 65 * 12 + 8 },
  { from: 1942, to: 1942, nraMonths: 65 * 12 + 10 },
  { from: 1943, to: 1954, nraMonths: 66 * 12 },
  { from: 1955, to: 1955, nraMonths: 66 * 12 + 2 },
  { from: 1956, to: 1956, nraMonths: 66 * 12 + 4 },
  { from: 1957, to: 1957, nraMonths: 66 * 12 + 6 },
  { from: 1958, to: 1958, nraMonths: 66 * 12 + 8 },
  { from: 1959, to: 1959, nraMonths: 66 * 12 + 10 },
  { from: 1960, to: null, nraMonths: 67 * 12 },
];

export const EARLY_REDUCTION_RATE_FIRST_36 = 5 / 900; // 5/9 of 1% per month, as a decimal
export const EARLY_REDUCTION_RATE_BEYOND_36 = 5 / 1200; // 5/12 of 1% per month, as a decimal
export const DELAYED_CREDIT_RATE_PER_MONTH = 2 / 300; // 2/3 of 1% per month (8%/year), as a decimal

export const MIN_CLAIM_AGE = 62;
export const MAX_CLAIM_AGE = 70;

/** Normal Retirement Age, in whole months past age 0 (i.e. total months
 * of age), for a given birth year. Anyone before 1900 or after the
 * table isn't realistically supported by this tool (birth year is
 * validated separately). */
export function getNraMonths(birthYear) {
  for (const row of NRA_SCHEDULE) {
    if (birthYear >= row.from && (row.to === null || birthYear <= row.to)) return row.nraMonths;
  }
  // Birth years before the table's start use the earliest known NRA;
  // this only matters if birth-year validation is ever loosened.
  return NRA_SCHEDULE[0].nraMonths;
}

/** Percentage of the Primary Insurance Amount (PIA) payable at a given
 * whole-number claim age, given the NRA in months. Returns e.g. 108 for
 * 108%, matching the reference's own display convention exactly. */
export function percentOfPia(claimAge, nraMonths) {
  const claimMonths = claimAge * 12;
  if (claimMonths < nraMonths) {
    const monthsEarly = nraMonths - claimMonths;
    const first36 = Math.min(monthsEarly, 36);
    const beyond36 = Math.max(0, monthsEarly - 36);
    const reduction = first36 * EARLY_REDUCTION_RATE_FIRST_36 + beyond36 * EARLY_REDUCTION_RATE_BEYOND_36;
    return (1 - reduction) * 100;
  }
  const monthsLate = claimMonths - nraMonths;
  return (1 + monthsLate * DELAYED_CREDIT_RATE_PER_MONTH) * 100;
}

/** Formats an NRA-in-months value as "67" or "66 and 8 months", matching
 * the reference's own sentence wording exactly. */
export function formatNra(nraMonths) {
  const years = Math.floor(nraMonths / 12);
  const months = nraMonths % 12;
  return months === 0 ? `${years}` : `${years} and ${months} months`;
}
