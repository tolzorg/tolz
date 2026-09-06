// Inflation Calculator engine — matches calculator.net/inflation-calculator.html.
//
// Three independent calculators on that page:
//   "Inflation Calculator with U.S. CPI Data" — the equivalent value of a
//     dollar amount between any two months/years (or annual averages)
//     from 1913 to the present, using real historical CPI-U data.
//   "Forward Flat Rate Inflation Calculator" — a plain compound-growth
//     projection at a user-chosen flat annual rate.
//   "Backward Flat Rate Inflation Calculator" — the same formula run in
//     reverse (discounting instead of compounding).
//
// Every formula/threshold below was reverse-engineered from live
// reference results (not guessed), by picking scenarios specifically
// designed to disambiguate between competing theories — see
// inflation-calculator-notes.md for the full derivation, including two
// theories that looked plausible from a single example each but failed
// once tested against a second, deliberately different one.

import {
  CPI_START_YEAR, CPI_LATEST_YEAR as STATIC_LATEST_YEAR, CPI_LATEST_MONTH as STATIC_LATEST_MONTH, CPI_MONTHLY,
} from "./cpiData.js";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const AVERAGE_MONTH = 13;

export { CPI_START_YEAR };

// ─────────────────────────────────────────────────────────────────
// LIVE UPDATE LAYER — cpiData.js is a static snapshot that drifts from
// BLS's own live data in two ways: a brand new month gets published
// every ~2 weeks after that month ends, and BLS occasionally revises a
// recent figure (or, here, could replace this dataset's one SYNTHETIC
// value — the interpolated Oct 2025 gap-fill — with a real one). A live
// fetch (see cpiLiveUpdate.js) re-checks a small RECENT rolling window
// every page load and its answer is treated as authoritative for
// whatever months it covers — overriding the static array where they
// overlap, which handles both a new month AND a revision/replacement
// with one mechanism. Everything below reads through
// `getLatestYear()`/`getLatestMonth()` rather than the static constants
// directly, so the calculator automatically recognizes whatever
// `applyLiveCpiWindow()` last applied — no code change needed here when
// a new month or a revision comes in.
// ─────────────────────────────────────────────────────────────────

// Map of "year-month" -> value, populated by applyLiveCpiWindow() with
// BLS's own live answer for the recent window it checked (see
// cpiLiveUpdate.js for why this window is bounded rather than the full
// 113-year history). Always takes priority over the static array for
// any month it contains — BLS's live API is more current/authoritative
// than a point-in-time snapshot for whatever window was actually asked.
const liveOverrides = new Map();
let latestYear = STATIC_LATEST_YEAR;
let latestMonth = STATIC_LATEST_MONTH;

export function getLatestYear() { return latestYear; }
export function getLatestMonth() { return latestMonth; }
/** For tests/diagnostics: has anything been merged in beyond the static
 * snapshot baked into cpiData.js at build time? */
export function isLiveDataApplied() { return liveOverrides.size > 0; }

/** Merges a freshly-fetched recent window (see fetchRecentCpiWindow)
 * into the live layer: every month it contains becomes authoritative
 * (overriding the static array if they overlap), and the effective
 * "latest" pointer advances if the window reached further than before.
 * Safe to call with an empty array (a failed fetch) or repeatedly (e.g.
 * a page left open across a data refresh). Returns
 * `{ year, month, changed, extended }` — the effective latest after
 * merging; whether anything's VALUE actually differs from what was
 * already effectively in place (a brand new month, a genuine BLS
 * revision, or this dataset's one synthetic estimate finally being
 * replaced by a real figure — all look the same here: "changed"); and
 * `extended` specifically, whether the latest-available month moved
 * forward (as opposed to a change to an older month within the window,
 * which is a correction, not new data to surface as "now current
 * through..."). */
export function applyLiveCpiWindow(recentMonths) {
  let changed = false;
  let extended = false;
  for (const { year, month, value } of recentMonths) {
    const previous = monthlyCpi(year, month);
    if (previous == null || Math.abs(previous - value) > 1e-9) changed = true;
    liveOverrides.set(`${year}-${month}`, value);
    if (year > latestYear || (year === latestYear && month > latestMonth)) { latestYear = year; latestMonth = month; extended = true; }
  }
  return { year: latestYear, month: latestMonth, changed, extended };
}

/** The last selectable month for a given year — 13 ("Average") for every
 * completed year, but capped at the current latest month (no full-year
 * average exists yet) for the still-in-progress latest year — exactly
 * matching the reference's own `updateMonths()` JS logic. Reads the
 * LIVE latest year/month, so newly-arrived months are reflected
 * immediately without this function itself needing to change. */
export function maxMonthForYear(year) {
  return year === latestYear ? latestMonth : AVERAGE_MONTH;
}

export function monthOptions(year) {
  const max = maxMonthForYear(year);
  const opts = [];
  for (let m = 1; m <= 12 && m <= max; m++) opts.push({ value: m, label: MONTH_NAMES[m - 1] });
  if (max === AVERAGE_MONTH) opts.push({ value: AVERAGE_MONTH, label: "Average" });
  return opts;
}

export function yearOptions() {
  const opts = [];
  for (let y = latestYear; y >= CPI_START_YEAR; y--) opts.push({ value: y, label: String(y) });
  return opts;
}

function monthlyCpi(year, month) {
  // A live override — whether extending forward past the static array
  // or correcting/replacing a value within it — always wins.
  const live = liveOverrides.get(`${year}-${month}`);
  if (live != null) return live;
  const idx = (year - CPI_START_YEAR) * 12 + (month - 1);
  return idx >= 0 && idx < CPI_MONTHLY.length ? CPI_MONTHLY[idx] : null;
}

function annualAverageCpi(year) {
  if (year === latestYear) return null; // no full-year average yet — same rule as maxMonthForYear
  let sum = 0;
  for (let m = 1; m <= 12; m++) {
    const v = monthlyCpi(year, m);
    if (v == null) return null;
    sum += v;
  }
  return sum / 12;
}

/** The CPI for a (year, month) pair — `month` may be 1-12 or
 * AVERAGE_MONTH (13), matching the reference's own form-field
 * convention exactly (its `cinmonth1`/`coutmonth1` values). */
export function getCpi(year, month) {
  return month === AVERAGE_MONTH ? annualAverageCpi(year) : monthlyCpi(year, month);
}

export function formatPeriodLabel(year, month) {
  return month === AVERAGE_MONTH ? `${year} (Average)` : `${MONTH_NAMES[month - 1].slice(0, 3)}. ${year}`;
}

// Reverse-engineered live: for ELAPSED-TIME purposes only (the
// annualized-rate calculation, and which of two periods counts as
// "earlier"), an "Average" (month 13) period behaves as if it were
// month 7 — verified by constructing scenarios that mix a specific
// month against an "Average" period and solving for the exact month
// value that reproduces the reference's own displayed annualized rate;
// month 7 matched exactly (to 4 significant figures) while every
// neighboring month value (6 or 8) did not. This does NOT affect the
// actual CPI value used (that's the true annual average) — only the
// elapsed-time arithmetic.
function monthProxy(month) {
  return month === AVERAGE_MONTH ? 7 : month;
}
function absoluteMonthIndex(year, month) {
  return year * 12 + monthProxy(month);
}

// For the chart only: the real calendar month a period's data should
// start/end at when walking a monthly series — an "Average" period
// spans its whole year, so it contributes January (as a start) or
// December (as an end), not the proxy month 7 used for elapsed-time math.
function realStartMonth(month) { return month === AVERAGE_MONTH ? 1 : month; }
function realEndMonth(month) { return month === AVERAGE_MONTH ? 12 : month; }

/** Builds the "Purchasing power of $X over time" chart data: one point
 * per real calendar month, walking from whichever of `from`/`to` is
 * chronologically earlier to whichever is later, each valued as
 * `amount * cpi(thatMonth) / cpiFrom` — always relative to the literal
 * "from" input (so the chart's value AT the from-period always equals
 * `amount` exactly, matching the headline result). This is an own,
 * clearly-documented design for the chart's construction (the
 * reference's actual chart-rendering internals aren't inspectable) —
 * the underlying CPI data and math driving every point are the same,
 * verified-exact dataset and ratio used everywhere else in this file. */
function buildChart({ fromYear, fromMonth, toYear, toMonth, amount, cpiFrom }) {
  const fromAbs = absoluteMonthIndex(fromYear, fromMonth);
  const toAbs = absoluteMonthIndex(toYear, toMonth);
  const fromIsEarlier = fromAbs <= toAbs;

  const startYear = fromIsEarlier ? fromYear : toYear;
  const startMonth = realStartMonth(fromIsEarlier ? fromMonth : toMonth);
  const endYear = fromIsEarlier ? toYear : fromYear;
  const endMonth = realEndMonth(fromIsEarlier ? toMonth : fromMonth);

  const points = [];
  let y = startYear, m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    const cpi = monthlyCpi(y, m);
    if (cpi != null && cpiFrom) points.push({ year: y, month: m, value: amount * (cpi / cpiFrom) });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return points;
}

export function calculateCpiInflation({ amount, fromYear, fromMonth, toYear, toMonth }) {
  const amt = Number(amount) || 0;
  const cpiFrom = getCpi(fromYear, fromMonth);
  const cpiTo = getCpi(toYear, toMonth);
  if (cpiFrom == null || cpiTo == null || cpiFrom === 0) return null;

  const value = amt * (cpiTo / cpiFrom);

  const fromAbs = absoluteMonthIndex(fromYear, fromMonth);
  const toAbs = absoluteMonthIndex(toYear, toMonth);
  const fromIsEarlier = fromAbs <= toAbs;
  const elapsedMonths = Math.abs(toAbs - fromAbs);
  const cpiEarlier = fromIsEarlier ? cpiFrom : cpiTo;
  const cpiLater = fromIsEarlier ? cpiTo : cpiFrom;

  const totalPercent = cpiEarlier !== 0 ? (cpiLater / cpiEarlier - 1) * 100 : 0;
  // Verified live: the "total ... / average ... per year" two-sentence
  // form only appears once the elapsed period exceeds a full year
  // (tested the exact boundary: 12 months still shows the short,
  // single-rate form; 13 months already shows the annualized form).
  const showAnnualized = elapsedMonths > 12;
  const avgAnnualPercent = showAnnualized ? (Math.pow(cpiLater / cpiEarlier, 12 / elapsedMonths) - 1) * 100 : null;

  const chart = buildChart({ fromYear, fromMonth, toYear, toMonth, amount: amt, cpiFrom });

  return {
    value, cpiFrom, cpiTo, amount: amt,
    fromLabel: formatPeriodLabel(fromYear, fromMonth),
    toLabel: formatPeriodLabel(toYear, toMonth),
    earlierLabel: fromIsEarlier ? formatPeriodLabel(fromYear, fromMonth) : formatPeriodLabel(toYear, toMonth),
    laterLabel: fromIsEarlier ? formatPeriodLabel(toYear, toMonth) : formatPeriodLabel(fromYear, fromMonth),
    totalPercent, avgAnnualPercent, showAnnualized,
    chart,
  };
}

/** Forward Flat Rate Inflation Calculator — plain annual compounding.
 * Verified live: $500, 4.5%, 7 years -> $680.43. */
export function calculateForwardFlatRate({ amount, ratePercent, years }) {
  const amt = Number(amount) || 0;
  const rate = (Number(ratePercent) || 0) / 100;
  const yrs = Number(years) || 0;
  return { value: amt * Math.pow(1 + rate, yrs) };
}

/** Backward Flat Rate Inflation Calculator — the same formula, inverted.
 * Verified live: $500, 4.5%, 7 years ago -> $367.41. */
export function calculateBackwardFlatRate({ amount, ratePercent, years }) {
  const amt = Number(amount) || 0;
  const rate = (Number(ratePercent) || 0) / 100;
  const yrs = Number(years) || 0;
  const divisor = Math.pow(1 + rate, yrs);
  return { value: divisor !== 0 ? amt / divisor : 0 };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 2) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
