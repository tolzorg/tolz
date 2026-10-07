// RMD Calculator engine — matches calculator.net/rmd-calculator.html.
//
// Rules (all confirmed live via GET):
//  - Age = RMD year − birth year (decimals kept for display, floored for the
//    table lookup). Ages above 120 use the "120 and over" row.
//  - RMD start: born before 1960 → 73; born 1960 or later → 75. Before
//    that age the RMD is $0 and a "your RMD will begin in …" sentence
//    explains when (two different wordings) — shown only while that start
//    year is still after the current calendar year.
//  - Distribution period: the Uniform Lifetime Table, unless the spouse is
//    the sole beneficiary AND more than 10 years younger (by birth year),
//    in which case the Joint Life and Last Survivor table is used.
//  - RMD = prior year-end balance ÷ distribution period.
//  - Projection (only when a return rate is given and the owner is ≤ 110):
//    one row per year up to age 120, withdrawing the RMD at the END of the
//    year: end balance = balance × (1 + r) − RMD; the next RMD uses it.
//  - Validation, in order: birth year 1800…2200; balance > 0; spouse's
//    birth year 1800…2200 (only when the spouse is the beneficiary); rate
//    blank or in (−100, 1000]. Then a spouse beneficiary under 20 is "out
//    of the range of this calculator".

import { UNIFORM_LIFETIME, JOINT_LIFE } from "./rmdTables.js";

export const DEFAULTS = { birthYear: "1951", balance: "300000", spouseYear: "1953", rate: "5" };

/** The reference's year menu: next year, this year (selected), and the two before. */
export function rmdYearOptions(now = new Date()) {
  const y = now.getFullYear();
  return [y + 1, y, y - 1, y - 2].map(String);
}

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
function clean(value) {
  return String(value ?? "").replace(/,/g, "").trim();
}
function parse(text) {
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

const MESSAGES = {
  birthYear: "Please provide a valid year of birth.",
  balance: "Please provide a positive retirement account balance.",
  spouseYear: "Please provide a valid spouse's year of birth.",
  rate: "Please provide a valid estimated rate of return for your retirement account.",
  spouseRange: "Your spouse's age is out of the range of this calculator.",
};

function distributionPeriod(ownerAge, spouseAge, useJoint) {
  const owner = Math.min(120, Math.floor(ownerAge));
  if (useJoint) return JOINT_LIFE[owner]?.[Math.floor(spouseAge) - 20] ?? 2;
  return UNIFORM_LIFETIME[owner];
}

/** "24.6", "22", "2" — the period as the reference prints it. */
export const formatPeriod = (p) => String(p);

/** "$12,195.12" — 2-decimal money, half-up after 15-digit pre-rounding. */
export function formatMoney(value) {
  const pre = Number(Math.abs(value).toPrecision(15));
  const cents = Math.round(Number((pre * 100).toPrecision(15))) / 100;
  const s = cents.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 && cents !== 0 ? `$-${s}` : `$${s}`;
}

export function calculateRmd({ birthYear, rmdYear, balance, spouseIsBeneficiary = true, spouseYear, rate, currentYear = new Date().getFullYear() }) {
  const text = { birthYear: clean(birthYear), balance: clean(balance), spouseYear: clean(spouseYear), rate: clean(rate) };
  const by = parse(text.birthYear);
  const bal = parse(text.balance);
  const sy = parse(text.spouseYear);
  const r = text.rate === "" ? null : parse(text.rate);
  const year = Number(rmdYear);

  const errors = [];
  if (!(by >= 1800 && by <= 2200)) errors.push(MESSAGES.birthYear);
  if (!(bal > 0)) errors.push(MESSAGES.balance);
  if (spouseIsBeneficiary && !(sy >= 1800 && sy <= 2200)) errors.push(MESSAGES.spouseYear);
  if (r !== null && !(r > -100 && r <= 1000)) errors.push(MESSAGES.rate);
  if (errors.length) return { errors };
  if (spouseIsBeneficiary && year - sy < 20) return { errors: [MESSAGES.spouseRange] };

  const rmdAge = by < 1960 ? 73 : 75;
  const useJoint = spouseIsBeneficiary && sy - by > 10;
  const ownerAge = (y) => y - by;
  const periodFor = (y) => (ownerAge(y) < rmdAge ? null : distributionPeriod(ownerAge(y), y - sy, useJoint));

  const period = periodFor(year);
  const result = {
    year,
    rmd: period === null ? 0 : bal / period,
    period,
    balanceText: text.balance,
    begin: null,
    projection: null,
  };
  const startYear = by + rmdAge;
  // The "will begin" sentence only appears while that start year is still in
  // the future (confirmed live: hidden when the start year is this year).
  if (period === null && startYear > currentYear) {
    result.begin = rmdAge === 73
      ? `If there are no policy changes, your RMD will begin in ${startYear}, when you turn 73.`
      : `If there are no policy changes and the RMD age increases to 75 in 2033 as scheduled, your RMD will begin in ${startYear}, when you turn 75.`;
  }

  if (r !== null && ownerAge(year) <= 110) {
    const rows = [];
    let b = bal;
    for (let y = year; ownerAge(y) <= 120; y++) {
      const p = periodFor(y);
      const withdrawal = p === null ? 0 : b / p;
      const end = b * (1 + r / 100) - withdrawal;
      rows.push({ year: y, age: ownerAge(y), period: p, rmd: withdrawal, balance: end });
      b = end;
    }
    result.projection = { rateText: text.rate, rows };
  }
  return result;
}
