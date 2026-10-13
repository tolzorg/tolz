// Depreciation Calculator engine — matches calculator.net/depreciation-calculator.html.
//
// Methods: straight line, declining balance (rate = factor ÷ years; factor 2
// = double declining), and sum of the years' digits. Optional partial-year
// depreciation with six conventions and any accounting-year start date.
//
// Every rule below was confirmed against the live page via GET requests
// (see scripts/depreciation-calculator.test.js); several are the reference's
// own quirks and are reproduced on purpose so results match it exactly:
//  - Amounts are rounded per row (to dollars, or to cents with "Round to
//    dollars? No"), half-up, and accumulated from the rounded amounts.
//  - Straight line has no last-year correction when the years are a whole
//    number (11,000 − 1,000 over 3 years ends at $1,001). A fractional final
//    year, or the extra row of a partial-year schedule, takes the remainder.
//  - Sum of the years' digits: the last row always takes the remainder.
//  - Declining balance: each row is capped at book value − salvage. The last
//    row is book value − salvage for a whole number of years; otherwise (a
//    fractional life, or any partial-year schedule) it is
//    (cost − 2 × salvage) − accumulated, with the ending value shown as the
//    salvage — which can print a negative last-year amount, as the reference does.
//  - Percent column: amount ÷ beginning book value for declining balance,
//    amount ÷ (cost − salvage) otherwise.
//  - Partial year, sum of the years' digits: each accounting year takes the
//    tail (1 − f) of one life year plus the head (f) of the next. On row n
//    the reference checks, in floating point, whether the rounded
//    accumulation plus the last row's rounded amount equals cost − salvage;
//    when it doesn't, row n is printed as fully depreciated and the extra
//    row restarts from the true book value.
//  - Partial-year fraction f: "Count Every Day" = days ÷ 365 (365 even in
//    leap years); Half-/Full-Month = months plus ½ / 1 for leftover days;
//    Half-/Full-Quarter = (months + days ÷ 30) ÷ 3, up to the half / whole
//    quarter; Half-Year = ½ always. Dates roll over like JavaScript Dates
//    (Nov 31 → Dec 1), and the accounting day is validated against the
//    FOLLOWING month in a non-leap year (Jan 29–31 and May 31 are rejected;
//    Apr 31 is accepted).

import { cleanInput, toNumber } from "./simpleInterestCalculatorEngine.js";

export const DEFAULTS = { cost: "11000", salvage: "1000", years: "5", factor: "2" };

export const METHOD_OPTIONS = [
  { value: "straight", label: "Straight Line" },
  { value: "declining", label: "Declining Balance" },
  { value: "sum", label: "Sum of the Year's Digits" },
];

export const CONVENTION_OPTIONS = [
  { value: "day", label: "Count Every Day" },
  { value: "halfmonth", label: "Half-Month" },
  { value: "fullmonth", label: "Full-Month" },
  { value: "halfquarter", label: "Half-Quarter" },
  { value: "fullquarter", label: "Full-Quarter" },
  { value: "halfyear", label: "Half-Year" },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_MS = 86400000;
const NON_LEAP_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** "Today" as yyyy-mm-dd (the reference's default start of service). */
export function todayIso(now = new Date()) {
  const p = (x) => String(x).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

const utc = (y, m0, d) => Date.UTC(y, m0, d);
const ymd = (t) => {
  const d = new Date(t);
  return { y: d.getUTCFullYear(), m0: d.getUTCMonth(), d: d.getUTCDate() };
};
const pad2 = (x) => String(x).padStart(2, "0");
const slashDate = (t) => { const x = ymd(t); return `${x.y}/${pad2(x.m0 + 1)}/${pad2(x.d)}`; };

/** Half-up (away from zero) after a 15-digit pre-round, so a true …x.295
 * that floats as …x.29499999 still rounds up, as the reference does. */
function roundTo(x, dp) {
  const k = dp === 0 ? 1 : 100;
  const pre = Number(Math.abs(x).toPrecision(15));
  return (Math.sign(x) * Math.round(Number((pre * k).toPrecision(15)))) / k;
}

/** "12,345", "$-1,000.00" style money; percent with 2 decimals. */
export function formatAmount(value, cents) {
  const dp = cents ? 2 : 0;
  const abs = Math.abs(roundTo(value, dp));
  const text = abs.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return value < 0 && abs !== 0 ? `$-${text}` : `$${text}`;
}
export function formatPercent(value) {
  if (value === null) return "NA";
  return `${roundTo(value, 2).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
const trimNumber = (x) => String(Number(x.toFixed(10)));

/** Works out the partial first year: the fraction of a year, the sentence,
 * and the date of the next accounting year. Returns { fullYear: true } when
 * service starts exactly on the accounting-year start. */
function partialYear({ startDate, convention, accMonth, accDay }) {
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const start = utc(sy, sm - 1, sd);
  const S = ymd(start);
  const thisYear = utc(S.y, accMonth - 1, accDay);
  if (start === thisYear) return { fullYear: true };
  const nextY = start < thisYear ? S.y : S.y + 1;
  const next = utc(nextY, accMonth - 1, accDay);

  // The message and row labels pick the year by comparing months only, so a
  // start a few days before the accounting date in the same month is labelled
  // with next year. The months-and-days count still uses the true next date,
  // but "Count Every Day" counts the days to the labelled year's date (which
  // can exceed a year).
  const labelY = S.m0 + 1 < accMonth ? S.y : S.y + 1;

  let months = 0;
  while (utc(S.y, S.m0 + months + 1, S.d) <= next) months++;
  const days = Math.round((next - utc(S.y, S.m0 + months, S.d)) / DAY_MS);
  const totalDays = Math.round((utc(labelY, accMonth - 1, accDay) - start) / DAY_MS);

  let f;
  let converted = null;
  if (convention === "day") {
    f = totalDays / 365;
  } else if (convention === "halfmonth" || convention === "fullmonth") {
    const m = months + (days > 0 ? (convention === "halfmonth" ? 0.5 : 1) : 0);
    f = m / 12;
    converted = `${trimNumber(m)} months`;
  } else if (convention === "halfquarter" || convention === "fullquarter") {
    const q = (months + days / 30) / 3;
    const whole = Math.floor(q);
    const quarters = convention === "fullquarter" ? Math.ceil(q) : whole + (q > whole ? 0.5 : 0);
    f = quarters / 4;
    converted = `${trimNumber(quarters)} quarters`;
  } else {
    f = 0.5;
    converted = "half year";
  }

  const sentence = `It is ${months} months and ${days} days before the start of the next accounting year on ${labelY}-${accMonth}-${accDay}`
    + (converted ? `, which is converted to ${converted} for depreciation.` : ".");
  const label = (row) => (accMonth === 1 && accDay === 1
    ? String(labelY - 1 + row)
    : `${slashDate(utc(labelY - 1 + row, accMonth - 1, accDay))} - ${slashDate(utc(labelY + row, accMonth - 1, accDay) - DAY_MS)}`);
  return { fullYear: false, f, sentence, label };
}

function validate(v, method) {
  const errors = [];
  if (!(v.cost > 0)) errors.push("Please provide a positive asset cost.");
  if (!Number.isFinite(v.salvage)) errors.push("Please provide a positive salvage/residual value.");
  if (method === "sum") {
    if (!(v.years > 1 && Number.isInteger(v.years))) errors.push("Please provide a number of depreciation years that is integer and larger than 1.");
  } else if (!(v.years > 1)) {
    errors.push("Please provide a depreciation years value that is larger than 1.");
  }
  if (method === "declining" && !(v.factor >= 0)) errors.push("Please provide a positive depreciation factor.");
  return errors;
}

const percentOf = (amount, base) => (base === 0 ? null : (amount / base) * 100);

export function calculateDepreciation(input) {
  const method = ["declining", "sum"].includes(input.method) ? input.method : "straight";
  const cents = input.roundToDollars === false;
  const R = (x) => roundTo(x, cents ? 2 : 0);
  const text = {
    cost: cleanInput(input.cost), salvage: cleanInput(input.salvage),
    years: cleanInput(input.years), factor: cleanInput(input.factor),
  };
  const v = { cost: toNumber(text.cost), salvage: toNumber(text.salvage), years: toNumber(text.years), factor: toNumber(text.factor) };

  const errors = validate(v, method);
  const accMonth = Number(input.accMonth) || 1;
  const accDay = Number(input.accDay) || 1;
  if (input.partial && accDay > NON_LEAP_DAYS[accMonth % 12]) errors.push("Please provide a valid account year begin date.");
  if (errors.length) return { errors };
  if (v.cost === v.salvage) return { message: "The asset cost and the salvage value are the same. No depreciation involved." };

  // The reference rounds the cost and salvage to the display unit first.
  const cost = R(v.cost);
  const salvage = R(v.salvage);
  const n = v.years;
  const dep = cost - salvage;

  let partial = null;
  let partialSentence = null;
  if (input.partial) {
    const p = partialYear({ startDate: input.startDate || todayIso(), convention: input.convention, accMonth, accDay });
    if (p.fullYear) partialSentence = "It is an full accounting year since the start of service.";
    else { partial = p; partialSentence = p.sentence; }
  }

  let methodSentence = null;
  if (method === "straight") {
    methodSentence = { prefix: "With the straight line method, the depreciation per year is ", amount: formatAmount(R(dep / n), cents), suffix: "." };
  } else if (method === "declining") {
    methodSentence = { text: `Depreciation factor of ${text.factor} is equivalent to annual depreciation rate of ${formatPercent((v.factor / n) * 100)} for ${text.years} years.` };
  }

  // A partial first year that rounds up to a whole year (e.g. "4 quarters")
  // is scheduled exactly like a full-year start.
  const rows = partial && partial.f !== 1 ? partialSchedule({ method, cost, salvage, dep, n, factor: v.factor, f: partial.f, R })
    : fullSchedule({ method, cost, salvage, dep, n, factor: v.factor, R });

  const table = rows.map((row, i) => ({
    label: partial ? partial.label(i) : `${i + 1}.`,
    begin: row.begin,
    // null prints as "NA" (the reference's output for a zero base).
    percent: percentOf(row.amount, method === "declining" ? row.begin : dep),
    amount: row.amount,
    accumulated: row.acc,
    end: row.end,
  }));

  return {
    cents,
    partialSentence,
    methodSentence,
    rows: table,
    // The reference draws the chart only when the life is longer than 2 years.
    showChart: n > 2,
    chart: [{ x: 0, bookValue: cost, amount: 0 }, ...table.map((r, i) => ({ x: i + 1, bookValue: r.end, amount: r.amount }))],
  };
}

function fullSchedule({ method, cost, salvage, dep, n, factor, R }) {
  const count = Math.ceil(n);
  const whole = Number.isInteger(n);
  const rate = factor / n;
  const S = (n * (n + 1)) / 2;
  const rows = [];
  let bv = cost;
  let acc = 0;
  for (let i = 1; i <= count; i++) {
    const begin = bv;
    let amount;
    let end = null;
    if (method === "straight") {
      amount = i > Math.floor(n) ? dep - acc : R(dep / n);
    } else if (method === "sum") {
      amount = i === count ? dep - acc : R((dep * (n - i + 1)) / S);
    } else if (i < count) {
      amount = Math.min(R(bv * rate), bv - salvage);
    } else {
      amount = whole ? bv - salvage : cost - 2 * salvage - acc;
      end = salvage;
    }
    acc += amount;
    bv = end ?? begin - amount;
    rows.push({ begin, amount, acc, end: bv });
  }
  return rows;
}

function partialSchedule({ method, cost, salvage, dep, n, factor, f, R }) {
  const count = 1 + Math.ceil(n - f - 1e-9);
  const rows = [];
  let bv = cost;
  let acc = 0;

  if (method === "sum") {
    const S = (n * (n + 1)) / 2;
    const Y = (k) => (k >= 1 && k <= n ? (dep * (n - k + 1)) / S : 0);
    const raw = (j) => (j === 1 ? f * Y(1) : (1 - f) * Y(j - 1) + f * Y(j));
    for (let j = 1; j <= n; j++) {
      const begin = bv;
      const amount = R(raw(j));
      acc += amount;
      bv = begin - amount;
      rows.push({ begin, amount, acc, end: bv });
    }
    if (f < 1) {
      const last = R(raw(n + 1));
      if (acc + last !== dep) rows[n - 1] = { ...rows[n - 1], acc: dep, end: salvage };
      const begin = cost - acc;
      const finalAcc = acc + last;
      rows.push({ begin, amount: begin - salvage, acc: finalAcc, end: cost - finalAcc });
    }
    return rows;
  }

  const per = dep / n;
  const rate = factor / n;
  for (let i = 1; i <= count; i++) {
    const begin = bv;
    let amount;
    let end = null;
    if (method === "straight") {
      if (i === 1) amount = R(per * f);
      else if (i < count || Number.isInteger(n - f)) amount = R(per);
      else amount = dep - acc;
    } else if (i === 1) {
      amount = Math.min(R(bv * rate * f), bv - salvage);
    } else if (i < count) {
      amount = Math.min(R(bv * rate), bv - salvage);
    } else {
      amount = Number.isInteger(n - f) ? bv - salvage : cost - 2 * salvage - acc;
      end = salvage;
    }
    acc += amount;
    bv = end ?? begin - amount;
    rows.push({ begin, amount, acc, end: bv });
  }
  return rows;
}
