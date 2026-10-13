// Average Return Calculator engine — matches calculator.net/average-return-calculator.html.
//
// Two independent calculators (both GET forms on the reference, decoded
// with live probes; see scripts/average-return-calculator.test.js):
//
// 1. Average Return Based on Cash Flow — a money-weighted (IRR) return. The
//    starting balance and each deposit are outflows, withdrawals and the
//    ending balance are inflows, and every amount is grown to the end date:
//      Σ amount × (1 + r)^t = 0,  t = years from the flow's date to the end
//    where t counts whole anniversaries plus leftover days ÷ 365 (so a
//    366-day leap year still counts as exactly 1 year). It is solved with a
//    bisection fitted to the reference's own (see solveReturn), including
//    its "Sorry! …" out-of-scope message when no root is bracketed.
//
// 2. Average and Cumulative Return — each return is an ANNUAL rate held for
//    its years + months, so the $100 balance grows by (1 + r)^(years +
//    months ÷ 12) per row; the average is the total growth annualised over
//    the total holding time.
//
// Reference quirks replicated: a blank date counts as 1970-01-01; a return
// of exactly "0" counts toward the two-row minimum but is then left out of
// the calculation ("0.0" is kept); 0 years and 0 months is accepted (blank
// label, no growth); labels echo the trimmed input; a zero total holding
// time gives an empty result.

export const CASH_FLOW_ROWS = 50;
export const RETURN_ROWS = 60;
export const VISIBLE_ROWS = 8;

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
const num = (text) => (NUMERIC.test(text) ? Number(text) : NaN);
const DAY_MS = 86400000;

/** Half-up after a 15-digit pre-round, then en-US grouping with 2 decimals. */
export function format2(value) {
  const pre = Number(Math.abs(value).toPrecision(15));
  const rounded = (Math.sign(value) * Math.round(Number((pre * 100).toPrecision(15)))) / 100;
  return rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "yyyy-mm-dd" → UTC ms; blank or invalid → 1970-01-01, as the reference does. */
function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? "").trim());
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : 0;
}

/** Years from `a` to `b`: whole anniversaries plus leftover days ÷ 365. */
function yearsBetween(a, b) {
  const A = new Date(a);
  const B = new Date(b);
  let years = B.getUTCFullYear() - A.getUTCFullYear();
  const anniversary = (y) => Date.UTC(A.getUTCFullYear() + y, A.getUTCMonth(), A.getUTCDate());
  if (anniversary(years) > b) years--;
  return years + (b - anniversary(years)) / DAY_MS / 365;
}

/** Bisection fitted to the reference's own solver (178 live cases): the
 * search range is −99.99%…100,000% a year; a value already ~0 at −99.99% is
 * returned as-is (an ending balance of $0 shows −99.99%); no sign change —
 * including a root exactly at 100,000% — is "out of scope"; and it stops on a
 * relative bracket width of 1e-7, returning the upper end (which is why very
 * large returns can read one cent above the exact root). */
function solveReturn(f) {
  let lo = -0.9999;
  let hi = 1000;
  if (Math.abs(f(lo)) < 0.005) return lo;
  if (f(lo) * f(hi) >= 0) return null;
  const signHi = Math.sign(f(hi));
  for (let i = 0; i < 3000; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(f(mid)) === signHi) hi = mid;
    else lo = mid;
    if ((hi - lo) / Math.abs(hi) < 1e-7) break;
  }
  return hi;
}

/**
 * input: { startBalance, startDate, endBalance, endDate,
 *          flows: [{ type: "d" | "w", amount, date }] }
 */
export function calculateCashFlowReturn(input) {
  const clean = (x) => String(x ?? "").replace(/,/g, "").trim();
  const startBalance = num(clean(input.startBalance));
  const endBalance = num(clean(input.endBalance));
  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);

  const errors = [];
  if (!(startBalance >= 0)) errors.push("Please provide a positive starting balance.");
  if (!(endBalance >= 0)) errors.push("Please provide a positive ending balance.");
  if (!(start < end)) errors.push("Begin date should be earlier than end date.");

  const flows = [];
  (input.flows || []).forEach((flow, i) => {
    const text = clean(flow.amount);
    if (text === "") return;
    const amount = num(text);
    if (!(amount >= 0)) { errors.push(`Please provide a positive value for item #${i + 1}.`); return; }
    const date = parseDate(flow.date);
    if (date < start || date > end) { errors.push(`Date item #${i + 1} should be between begin and end date.`); return; }
    flows.push({ date, signed: flow.type === "w" ? -amount : amount });
  });
  if (errors.length) return { errors };

  const cash = [
    { amount: -startBalance, date: start },
    ...flows.map((fl) => ({ amount: -fl.signed, date: fl.date })),
    { amount: endBalance, date: end },
  ].map((c) => ({ amount: c.amount, t: yearsBetween(c.date, end) }));
  const f = (r) => cash.reduce((sum, c) => sum + c.amount * Math.pow(1 + r, c.t), 0);
  const r = solveReturn(f);
  if (r === null) return { outOfScope: true };

  return {
    annualReturn: r * 100,
    chart: flows.length ? [{ date: start, amount: startBalance }, ...flows.map((fl) => ({ date: fl.date, amount: fl.signed }))] : null,
  };
}

const trimNumber = (x) => String(Number(x.toFixed(10)));

/** input: { rows: [{ ret, years, months }] } (strings, as typed) */
export function calculateCumulativeReturn(input) {
  const errors = [];
  const rows = [];
  let count = 0;
  (input.rows || []).forEach((row, i) => {
    const ret = String(row.ret ?? "").trim();
    if (ret === "") return;
    count++;
    const yText = String(row.years ?? "").trim();
    const mText = String(row.months ?? "").trim();
    const r = num(ret);
    const y = yText === "" ? 0 : num(yText);
    const m = mText === "" ? 0 : num(mText);
    const k = i + 1;
    if (!(r > -100)) errors.push(`Please provide a numeric return value for item #${k}.`);
    if (!(y >= 0)) errors.push(`Please provide a positive year for item #${k}.`);
    if (!(m >= 0)) errors.push(`Please provide a positive month for item #${k}.`);
    if (yText === "" && mText === "") errors.push(`Please provide a positive year or month for item #${k}.`);
    rows.push({ ret, r, yText, mText, y, m });
  });
  if (count < 2) errors.push("Please provide at least two rows of data.");
  if (errors.length) return { errors };

  const used = rows.filter((row) => row.ret !== "0");
  let balance = 100;
  let totalYears = 0;
  let totalMonths = 0;
  const schedule = used.map((row) => {
    balance *= Math.pow(1 + row.r / 100, row.y + row.m / 12);
    totalYears += row.y;
    totalMonths += row.m;
    const label = [row.y !== 0 && `${row.yText} years`, row.m !== 0 && `${row.mText} months`].filter(Boolean).join(", ");
    return { label, returnText: `${row.ret}%`, balance };
  });
  const T = totalYears + totalMonths / 12;
  if (!used.length || T === 0) return { empty: true };

  const carry = Math.floor(totalMonths / 12);
  const Y = totalYears + carry;
  const M = totalMonths - carry * 12;
  const total = [Y !== 0 && `${trimNumber(Y)} years`, M !== 0 && `${trimNumber(M)} months`].filter(Boolean).join(", ");
  const growth = balance / 100;
  return {
    cumulative: (growth - 1) * 100,
    average: (Math.pow(growth, 1 / T) - 1) * 100,
    totalPeriod: total,
    schedule,
  };
}
