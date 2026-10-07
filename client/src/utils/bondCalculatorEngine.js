// Bond Calculator engine — matches calculator.net/bond-calculator.html.
//
// Two calculators share the page.
//
// 1. calculateBond: "enter any four values" for a bond traded on a coupon
//    date. With per-period yield r = yield / f, N = years × f periods and
//    coupon C per period:
//      price = C × a(N) + F × v^N,  v = 1 / (1 + r),  a(N) = (1 − v^N) / r
//    (a(N) = N when r = 0). Face value and coupon are solved directly, the
//    time to maturity in closed form (N = ln((P − C/r) / (F − C/r)) / ln v,
//    or (P − F) / C at a 0% yield), and the yield by bisection; it can come
//    out negative (a price above the total cash flows). The yield is
//    nominal: per-period rate × f.
//    Rules confirmed live: with all five fields filled, the price is solved
//    anyway; years × f must be a whole number of periods; errors come in
//    field order with the whole-period check in the years slot, then
//    "Please provide four values to calculate." when 2+ fields are blank.
//    Price and face must be > 0, yield and coupon ≥ 0, years > 0. For no
//    solution the reference prints "nan years" or an empty box; this app
//    shows a short note instead.
//
// 2. calculateBondPricing: a bond between coupon dates, with a day-count
//    convention. Coupon dates step back from maturity by 12/f months,
//    keeping maturity's day of month clamped to the month's length (May 31
//    → Feb 28), but compared with settlement by the UNCLAMPED day (with a
//    May 31 maturity, a Feb 28 settlement is still before that coupon).
//    L = last coupon date ≤ settlement, n = coupons left.
//      A = days accrued, E = days in the coupon period, w = (E − A) / E
//      dirty = Σ_{k=1..n} C / (1+r)^(k−1+w) + F / (1+r)^(n−1+w)
//      accrued = C × A / E,  clean = dirty − accrued
//    Day counts (fitted against 100+ live scenarios):
//      30/360: A = 30 × (whole months from L) + the leftover actual days,
//              where "L + m months" OVERFLOWS like JS/PHP dates (Jan 29 + 1
//              month = Mar 1). This reproduces the reference's non-standard
//              counts (e.g. Jul 29 → Nov 28 = 120, not the textbook 119);
//              E = 360 / f.
//      Actual/360: actual days, E = 360 / f.
//      Actual/365: actual days, E = 365.0004 / f. A plain 365 is a hair
//              off (the reference's accrued interest runs ~1.1 ppm lower);
//              scanning at 1e-6 resolution over 120 live cases, 365.0004
//              is the ONLY year length that matches all of them, so it's
//              evidently the reference's own constant.
//      Actual/Actual: actual days, E = actual days from L to the next
//              coupon date.

export const FREQUENCY_OPTIONS = [
  { value: "a", label: "annually" },
  { value: "s", label: "semiannually" },
  { value: "q", label: "quarterly" },
  { value: "m", label: "monthly" },
];
const PERIODS = { a: 1, s: 2, q: 4, m: 12 };
const PER_PERIOD_WORD = { s: "semiannually", q: "per quarter", m: "per month" };

export const DAY_COUNT_OPTIONS = [
  { value: "b", label: "30/360" },
  { value: "c", label: "Actual/360" },
  { value: "n", label: "Actual/365" },
  { value: "a", label: "Actual/Actual" },
];
const ACTUAL_365_YEAR = 365.0004;

export const DEFAULTS = { price: "", face: "100", yield: "6", years: "3", coupon: "5" };
export const PRICING_DEFAULTS = { face: "100", yield: "6", coupon: "5" };

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function parse(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (text === "") return { blank: true, value: NaN };
  const n = NUMERIC.test(text) ? Number(text) : NaN;
  return { blank: false, value: Number.isFinite(n) ? n : NaN };
}

/** Half-up to 4 decimals after 15-digit pre-rounding, so a true …x.xxxx5
 * that floats just below the half still rounds up (confirmed live: an
 * accrued interest of exactly 1.49625 shows as $1.4963). */
function round4(value) {
  const pre = Number(Math.abs(value).toPrecision(15));
  return (Math.sign(value) * Math.round(Number((pre * 10000).toPrecision(15)))) / 10000;
}
/** "$97.3270", "$925,612.6257", "$-1.5000" — the reference's 4-decimal money. */
export function formatMoney4(value) {
  const s = Math.abs(round4(value)).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return value < 0 ? `$-${s}` : `$${s}`;
}
export function format4(value) {
  return round4(value).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

/** The % ⇄ $ coupon switch: the reference rewrites the field in place —
 * % → $ rounds to whole dollars, $ → % to 3 decimals. Returns null when
 * either value isn't a number (the field is then left unchanged). */
export function convertCouponUnit(couponText, faceText, toUnit) {
  const c = parse(couponText).value;
  const f = parse(faceText).value;
  if (Number.isNaN(c) || Number.isNaN(f)) return null;
  if (toUnit === "d") return String(Math.round((f * c) / 100));
  return String(Math.round((100000 * c) / f) / 1000);
}

function annuityFactor(r, n) {
  return r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r;
}
function bondPrice(face, couponPerPeriod, r, n) {
  return couponPerPeriod * annuityFactor(r, n) + face * Math.pow(1 + r, -n);
}

/** Per-period rate solving bondPrice = price (price is decreasing in r). */
function solveRate(price, face, couponPerPeriod, n) {
  let lo = -0.999999;
  let hi = 1;
  while (bondPrice(face, couponPerPeriod, hi, n) > price && hi < 1e9) hi *= 2;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (bondPrice(face, couponPerPeriod, mid, n) > price) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const FIELD_ERRORS = {
  price: "Please provide a positive price amount.",
  face: "Please provide a positive face value.",
  yield: "Please provide a positive yield value.",
  years: "Please provide a positive time to maturity value.",
  coupon: "Please provide a positive coupon value.",
};
const WHOLE_PERIODS = "The number of period to maturity needs to be an integer.";
const FOUR_VALUES = "Please provide four values to calculate.";

export function calculateBond({ price, face, yield: yieldPct, years, coupon, couponUnit = "p", frequency = "a" }) {
  const f = PERIODS[frequency];
  const v = {
    price: parse(price), face: parse(face), yield: parse(yieldPct),
    years: parse(years), coupon: parse(coupon),
  };
  const positive = (x) => x > 0;
  const nonNegative = (x) => x >= 0;
  const rules = { price: positive, face: positive, yield: nonNegative, years: positive, coupon: nonNegative };

  const errors = [];
  for (const key of ["price", "face", "yield", "years", "coupon"]) {
    const { blank, value } = v[key];
    if (blank) continue;
    if (!rules[key](value)) errors.push(FIELD_ERRORS[key]);
    else if (key === "years" && Math.abs(value * f - Math.round(value * f)) > 1e-9) errors.push(WHOLE_PERIODS);
  }
  const blanks = Object.keys(v).filter((k) => v[k].blank);
  if (blanks.length > 1) errors.push(FOUR_VALUES);
  if (errors.length) return { errors };

  const solveFor = blanks[0] ?? "price";
  const P = v.price.value;
  const F = v.face.value;
  const r = v.yield.value / 100 / f;
  const n = Math.round(v.years.value * f);
  // A % coupon is a share of the face value; a $ coupon is dollars per year.
  const couponPerPeriod = (faceValue) => (couponUnit === "p" ? (faceValue * v.coupon.value) / 100 : v.coupon.value) / f;

  if (solveFor === "price") {
    return { solveFor, value: bondPrice(F, couponPerPeriod(F), r, n),
      sentence: "Given the face value, yield, time to maturity, and annual coupon, the price is:" };
  }
  if (solveFor === "face") {
    const vn = Math.pow(1 + r, -n);
    const value = couponUnit === "p"
      ? P / ((v.coupon.value / 100 / f) * annuityFactor(r, n) + vn)
      : (P - couponPerPeriod(0) * annuityFactor(r, n)) / vn;
    return { solveFor, value, sentence: "Given the price, yield, time to maturity, and annual coupon, the face value is:" };
  }
  if (solveFor === "yield") {
    const rate = solveRate(P, F, couponPerPeriod(F), n);
    return { solveFor, value: rate * f * 100,
      sentence: "Given the price, face value, time to maturity, and annual coupon, the annual yield is:" };
  }
  if (solveFor === "years") {
    const C = couponPerPeriod(F);
    const periods = r === 0 ? (P - F) / C : Math.log((P - C / r) / (F - C / r)) / Math.log(1 / (1 + r));
    return { solveFor, value: periods / f, noSolution: !Number.isFinite(periods),
      sentence: "Given the price, face value, yield, and annual coupon, the time to maturity is:" };
  }
  const perPeriod = (P - F * Math.pow(1 + r, -n)) / annuityFactor(r, n);
  const annual = perPeriod * f;
  return {
    solveFor, value: annual, percent: (annual / F) * 100,
    perPeriod: f > 1 ? { value: perPeriod, percent: (perPeriod / F) * 100, word: PER_PERIOD_WORD[frequency] } : null,
    sentence: "Given the price, face value, yield, and time to maturity, the coupon is:",
  };
}

// ── Pricing between coupon dates ─────────────────────────────────────────

function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? "").trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}
function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
const toUtc = (dt) => Date.UTC(dt.y, dt.m - 1, dt.d);
const daysBetween = (a, b) => Math.round((toUtc(b) - toUtc(a)) / 86400000);

/** Maturity minus k months, keeping maturity's day clamped to the month. */
function couponDateBack(maturity, months) {
  const idx = maturity.y * 12 + (maturity.m - 1) - months;
  const y = Math.floor(idx / 12);
  const m = idx - y * 12 + 1;
  return { y, m, d: Math.min(maturity.d, daysInMonth(y, m)) };
}
/** Date plus k months with JS/PHP-style overflow (Jan 29 + 1 = Mar 1). */
function addMonthsOverflow(dt, months) {
  const t = new Date(Date.UTC(dt.y, dt.m - 1 + months, dt.d));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
function days30360(from, to) {
  let months = 0;
  while (toUtc(addMonthsOverflow(from, months + 1)) <= toUtc(to)) months++;
  return 30 * months + daysBetween(addMonthsOverflow(from, months), to);
}

const PRICING_ERRORS = {
  face: "Please provide a positive face value.",
  yield: "Please provide a positive yield value.",
  coupon: "Please provide a positive coupon value.",
  maturity: "Please provide a valid maturity or call date.",
  settlement: "Please provide a valid settlement date.",
  order: "Please make sure the settlement date is earlier than the maturity or call date.",
};

export function calculateBondPricing({ face, yield: yieldPct, coupon, couponUnit = "p", frequency = "a", maturity, settlement, dayCount = "b" }) {
  const f = PERIODS[frequency];
  const F = parse(face).value;
  const y = parse(yieldPct).value;
  const c = parse(coupon).value;
  const M = parseDate(maturity);
  const S = parseDate(settlement);

  const errors = [];
  if (!(F > 0)) errors.push(PRICING_ERRORS.face);
  if (!(y >= 0)) errors.push(PRICING_ERRORS.yield);
  if (!(c >= 0)) errors.push(PRICING_ERRORS.coupon);
  if (!M) errors.push(PRICING_ERRORS.maturity);
  if (!S) errors.push(PRICING_ERRORS.settlement);
  if (!errors.length && toUtc(S) > toUtc(M)) errors.push(PRICING_ERRORS.order);
  if (errors.length) return { errors };

  // Coupon dates are compared with settlement by their UNCLAMPED day
  // (maturity's own day of month): with maturity on the 29th–31st, a
  // settlement on Feb 28 is still "before" that month's coupon, even
  // though the coupon itself is dated Feb 28 for the day count (confirmed
  // live: 90 days accrued from Nov 30, not 0).
  const settlementKey = S.y * 10000 + S.m * 100 + S.d;
  const isAfterSettlement = (dt) => dt.y * 10000 + dt.m * 100 + M.d > settlementKey;
  const step = 12 / f;
  let n = 0;
  let last = M;
  while (isAfterSettlement(last)) {
    n++;
    last = couponDateBack(M, step * n);
  }
  const next = n === 0 ? M : couponDateBack(M, step * (n - 1));

  let accruedDays;
  let periodDays;
  if (dayCount === "b") {
    accruedDays = days30360(last, S);
    periodDays = 360 / f;
  } else {
    accruedDays = daysBetween(last, S);
    periodDays = dayCount === "c" ? 360 / f : dayCount === "n" ? ACTUAL_365_YEAR / f : daysBetween(last, next);
  }

  const r = y / 100 / f;
  const C = (couponUnit === "p" ? (F * c) / 100 : c) / f;
  const w = (periodDays - accruedDays) / periodDays;
  let dirty = F / Math.pow(1 + r, n - 1 + w);
  for (let k = 1; k <= n; k++) dirty += C / Math.pow(1 + r, k - 1 + w);
  const accrued = (C * accruedDays) / periodDays;

  return { dirty, clean: dirty - accrued, accrued, accruedDays };
}

/** Today (local) as YYYY-MM-DD, plus the reference's default maturity:
 * today + 3 years − 4 days. */
export function defaultDates(now = new Date()) {
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const maturity = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate() - 4);
  return { settlement: iso(now), maturity: iso(maturity) };
}
