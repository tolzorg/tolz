// Salary Calculator engine — matches calculator.net/salary-calculator.html.
// A pure pay-frequency converter: given a salary amount at ANY one pay
// frequency, computes the equivalent amount at every other frequency,
// in two parallel columns — "Unadjusted" (ignores holidays/vacation)
// and "Holidays & vacation days adjusted" (accounts for them).
//
// Every formula below was verified EXACT against the live reference
// (plain GET requests — this page's form is GET-based and computes
// server-side, same technique as the Finance/Compound Interest
// calculators) across 3 input directions (Hourly, Daily, Annual) with
// both default and non-default hours/days-per-week and holiday/vacation
// values. See salary-calculator-notes.md for the full worked verification.

export const UNIT_OPTIONS = [
  { value: "Hourly", label: "Hour" },
  { value: "Daily", label: "Day" },
  { value: "Weekly", label: "Week" },
  { value: "Bi-Weekly", label: "Bi-week" },
  { value: "Semi-Monthly", label: "Semi-month" },
  { value: "Monthly", label: "Month" },
  { value: "Quarterly", label: "Quarter" },
  { value: "Annual", label: "Year" },
];

// The reference's own fixed assumption, stated directly in its
// descriptive text and confirmed by every verified scenario: exactly
// 52 working weeks (260 weekdays, at the default 5 days/week) per
// year — NOT derived from the user's own hours/days-per-week inputs,
// which only affect the Hourly/Daily<->Weekly conversion, not the
// Weekly<->Annual one.
const WEEKS_PER_YEAR = 52;
const BASE_WORKING_DAYS_PER_YEAR = 260;

const ANNUAL_MULTIPLIER = {
  Weekly: WEEKS_PER_YEAR,
  "Bi-Weekly": WEEKS_PER_YEAR / 2,
  "Semi-Monthly": 24,
  Monthly: 12,
  Quarterly: 4,
  Annual: 1,
};

/** Builds the full 8-row Unadjusted table from a known ANNUAL
 * (unadjusted) figure and the hours/days-per-week inputs. */
function buildUnadjustedFromAnnual(annual, hoursPerWeek, daysPerWeek) {
  const weekly = annual / WEEKS_PER_YEAR;
  return {
    hourly: hoursPerWeek > 0 ? weekly / hoursPerWeek : 0,
    daily: daysPerWeek > 0 ? weekly / daysPerWeek : 0,
    weekly,
    biweekly: weekly * 2,
    semimonthly: annual / 24,
    monthly: annual / 12,
    quarterly: annual / 4,
    annual,
  };
}

export function calculateSalary({ amount, unit, hoursPerWeek, daysPerWeek, holidaysPerYear, vacationDaysPerYear }) {
  const A = Math.max(0, Number(amount) || 0);
  const H = Math.max(0, Number(hoursPerWeek) || 0);
  const D = Math.max(0, Number(daysPerWeek) || 0);
  const holidays = Math.max(0, Number(holidaysPerYear) || 0);
  const vacation = Math.max(0, Number(vacationDaysPerYear) || 0);

  // Verified exact: paid time off is subtracted from the fixed 260-day
  // base (never below 0), giving one ratio applied UNIFORMLY across
  // every row — Adjusted = Unadjusted × ratio, in every direction
  // tested (Hourly-in, Daily-in, and Annual-in all reproduce this
  // identically), so the cleanest correct implementation computes the
  // full Unadjusted table once, then derives Adjusted from it row by
  // row rather than re-deriving each frequency independently.
  const paidDaysOff = Math.min(BASE_WORKING_DAYS_PER_YEAR, holidays + vacation);
  const adjustRatio = (BASE_WORKING_DAYS_PER_YEAR - paidDaysOff) / BASE_WORKING_DAYS_PER_YEAR;

  // Verified exact: the reference treats ONLY Hourly and Daily inputs
  // as already-Unadjusted values; every other frequency (Weekly through
  // Annual) is treated as an already-Adjusted value, and the calculator
  // works BACKWARD from it to reconstruct the Unadjusted annual figure
  // (annualUnadjusted = annualAdjusted / adjustRatio) before building
  // the rest of the Unadjusted table the normal way.
  let unadjusted;
  if (unit === "Hourly") {
    const weekly = A * H;
    unadjusted = buildUnadjustedFromAnnual(weekly * WEEKS_PER_YEAR, H, D);
  } else if (unit === "Daily") {
    const weekly = A * D;
    unadjusted = buildUnadjustedFromAnnual(weekly * WEEKS_PER_YEAR, H, D);
  } else {
    const annualAdjusted = A * ANNUAL_MULTIPLIER[unit];
    const annualUnadjusted = adjustRatio > 0 ? annualAdjusted / adjustRatio : 0;
    unadjusted = buildUnadjustedFromAnnual(annualUnadjusted, H, D);
  }

  const adjusted = Object.fromEntries(Object.entries(unadjusted).map(([key, value]) => [key, value * adjustRatio]));

  return { unadjusted, adjusted, adjustRatio, paidDaysOff };
}

export function formatCurrency(value, { decimals = 0 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
