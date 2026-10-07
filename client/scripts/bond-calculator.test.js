// Plain-Node test suite for the Bond Calculator engine. Run with:
//   node scripts/bond-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/bond-calculator.html) via plain GET requests — both forms
// on the page submit GET to the same server-rendered page.

import {
  calculateBond, calculateBondPricing, convertCouponUnit, defaultDates, formatMoney4, format4,
} from "../src/utils/bondCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const base = { price: "", face: "100", yield: "6", years: "3", coupon: "5", couponUnit: "p", frequency: "a" };
const solve = (over) => calculateBond({ ...base, ...over });
const money = (over) => formatMoney4(solve(over).value);

// ─────────────────────────────────────────────────────────────────
// 1. Four-of-five solver
// ─────────────────────────────────────────────────────────────────
{
  eq("price (screenshot)", money({}), "$97.3270");
  eq("price sentence", solve({}).sentence, "Given the face value, yield, time to maturity, and annual coupon, the price is:");
  eq("face", money({ price: "97.327", face: "" }), "$100.0000");
  eq("years", format4(solve({ price: "97.327", years: "" }).value), "3.0000");
  const c = solve({ price: "97.327", coupon: "" });
  eq("coupon", `${formatMoney4(c.value)} (${format4(c.percent)}%)`, "$5.0000 (5.0000%)");
  ok("annual coupon has no per-period part", c.perPeriod === null);

  eq("textbook example (semiannual)", money({ face: "1000", years: "10", frequency: "s" }), "$925.6126");
  eq("thousands separator", money({ face: "1000000", years: "10", frequency: "s" }), "$925,612.6257");
  eq("quarterly", money({ frequency: "q" }), "$97.2731");
  eq("monthly", money({ frequency: "m" }), "$97.2607");
  eq("$ coupon", money({ coupon: "7", couponUnit: "d" }), "$102.6730");
  eq("0% yield", money({ yield: "0" }), "$115.0000");
  eq("0% coupon", money({ coupon: "0" }), "$83.9619");
  eq("all five given → price", money({ price: "95" }), "$97.3270");
  eq("face with $ coupon", money({ price: "95", face: "", coupon: "5", couponUnit: "d" }), "$97.2285");
  eq("face with % coupon", money({ price: "95", face: "" }), "$97.6091");
  eq("commas (exact 1.72355; reference shows 1.7235)", format4(solve({ price: "1,095", face: "1,000", yield: "" }).value), "1.7236");

  eq("years closed form (semiannual)", format4(solve({ price: "95", years: "", frequency: "s" }).value), "6.0333");
  eq("years can be negative", format4(solve({ price: "120", years: "" }).value), "-13.5314");
  eq("years at 0% yield", format4(solve({ price: "95", yield: "0", years: "" }).value), "-1.0000");
  ok("years: no solution (reference prints nan)", solve({ price: "80", years: "" }).noSolution);
  ok("years: no solution (reference prints nothing)", solve({ price: "100", yield: "5", years: "" }).noSolution);

  const q = solve({ price: "95", coupon: "", frequency: "q" });
  eq("quarterly coupon", `${formatMoney4(q.value)} (${format4(q.percent)}%) or ${formatMoney4(q.perPeriod.value)} (${format4(q.perPeriod.percent)}%) ${q.perPeriod.word}`,
    "$4.1664 (4.1664%) or $1.0416 (1.0416%) per quarter");
  const s = solve({ price: "95", coupon: "", frequency: "s", couponUnit: "d" });
  eq("semiannual coupon wording", `${formatMoney4(s.perPeriod.value)} ${s.perPeriod.word}`, "$2.0770 semiannually");
  eq("monthly coupon wording", solve({ price: "95", coupon: "", frequency: "m" }).perPeriod.word, "per month");

  // The yield is solved exactly. The reference's own iterative solver
  // stops early, so its 4th decimal can differ by up to ~0.001 (it shows
  // 6.8486 here; the exact yield is 6.848472).
  eq("yield (monthly)", format4(solve({ price: "95", yield: "", frequency: "m" }).value), "6.8485");
  eq("yield (semiannual, 2.5 years)", format4(solve({ price: "95", yield: "", years: "2.5", frequency: "s" }).value), "7.2218");
  ok("negative yield solvable", solve({ price: "200", yield: "" }).value < -17);
  ok("solved yield reprices exactly", Math.abs(
    calculateBond({ ...base, yield: String(solve({ price: "97.327", yield: "" }).value) }).value - 97.327) < 1e-9);
}

// ─────────────────────────────────────────────────────────────────
// 2. Solver validation
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (solve(over).errors || []).join(" | ");
  eq("all invalid, in field order", errs({ price: "-5", face: "0", yield: "-6", years: "-3", coupon: "-5" }),
    "Please provide a positive price amount. | Please provide a positive face value. | Please provide a positive yield value. | Please provide a positive time to maturity value. | Please provide a positive coupon value.");
  eq("non-numeric", errs({ face: "abc" }), "Please provide a positive face value.");
  eq("zero price", errs({ price: "0", yield: "" }), "Please provide a positive price amount.");
  eq("$ prefix rejected", errs({ price: "$95", yield: "" }), "Please provide a positive price amount.");
  eq("two blanks", errs({ face: "" }), "Please provide four values to calculate.");
  eq("two blanks plus invalid", errs({ face: "", yield: "x", years: "x", coupon: "x" }),
    "Please provide a positive yield value. | Please provide a positive time to maturity value. | Please provide a positive coupon value. | Please provide four values to calculate.");
  eq("fractional periods", errs({ years: "2.5" }), "The number of period to maturity needs to be an integer.");
  eq("fractional periods sit in the years slot", errs({ years: "2.5", coupon: "-5" }),
    "The number of period to maturity needs to be an integer. | Please provide a positive coupon value.");
  eq("2.5 years semiannual is whole", errs({ years: "2.5", frequency: "s" }), "");
  eq("0.25 years quarterly is whole", errs({ years: "0.25", frequency: "q" }), "");
  eq("years 0", errs({ years: "0" }), "Please provide a positive time to maturity value.");
}

// ─────────────────────────────────────────────────────────────────
// 3. Pricing between coupon dates
// ─────────────────────────────────────────────────────────────────
const pr = { face: "100", yield: "6", coupon: "5", couponUnit: "p", frequency: "a", maturity: "2029-10-02", settlement: "2026-10-06", dayCount: "b" };
const priced = (over) => {
  const r = calculateBondPricing({ ...pr, ...over });
  return r.errors ? `ERR ${r.errors.join(" | ")}` : `${formatMoney4(r.dirty)} ${formatMoney4(r.clean)} ${formatMoney4(r.accrued)} ${r.accruedDays}`;
};
{
  eq("30/360 (screenshot)", priced({}), "$97.3900 $97.3345 $0.0556 4");
  eq("Actual/360 (screenshot)", priced({ dayCount: "c" }), "$97.3900 $97.3345 $0.0556 4");
  eq("Actual/365 (screenshot)", priced({ dayCount: "n" }), "$97.3892 $97.3344 $0.0548 4");
  eq("Actual/Actual (screenshot)", priced({ dayCount: "a" }), "$97.3892 $97.3344 $0.0548 4");
  eq("3 days accrued", priced({ maturity: "2029-10-03" }), "$97.3743 $97.3326 $0.0417 3");

  // The reference's non-standard 30/360 (whole months + leftover actual days).
  const days30 = (settlement, maturity) => calculateBondPricing({ ...pr, settlement, maturity }).accruedDays;
  eq("Jul 29 → Nov 28 = 120 (textbook: 119)", days30("2026-11-28", "2032-07-29"), 120);
  eq("Jul 25 → Nov 28 = 123", days30("2026-11-28", "2032-07-25"), 123);
  eq("Jul 30 → Nov 28 = 119", days30("2026-11-28", "2032-07-30"), 119);
  eq("Jul 31 → Nov 28 = 118", days30("2026-11-28", "2032-07-31"), 118);
  eq("Jul 29 → Aug 1 = 3", days30("2026-08-01", "2032-07-29"), 3);
  eq("Jul 29 → Dec 1 = 122", days30("2026-12-01", "2032-07-29"), 122);
  eq("Feb 29 maturity clamps to Feb 28", days30("2026-11-28", "2032-02-29"), 270);
  eq("Mar 31 → Oct 13 = 192 (month overflow)", days30("2026-10-13", "2031-03-31"), 192);
  eq("30/360 full figures", priced({ settlement: "2026-11-28", maturity: "2032-07-29" }), "$96.9475 $95.2808 $1.6667 120");

  // Coupon dates clamp to month end; Actual/Actual uses the real period length.
  eq("quarterly May 31 → Feb 28 (Act/365)", priced({ frequency: "q", dayCount: "n", maturity: "2031-05-31", settlement: "2026-03-05" }),
    "$95.6029 $95.5344 $0.0685 5");
  eq("quarterly Act/Act (92-day period)", priced({ frequency: "q", dayCount: "a", maturity: "2031-05-31", settlement: "2026-03-05" }),
    "$95.6023 $95.5344 $0.0679 5");
  eq("semiannual Act/Act (181-day period)", priced({ frequency: "s", dayCount: "a", maturity: "2031-08-31", settlement: "2026-09-01" }),
    "$95.7505 $95.7367 $0.0138 1");

  // Actual/365 needs the 365.00044-day year to match the 4th decimal.
  eq("Act/365 year length (a)", priced({ face: "5000", yield: "4.92", coupon: "2.00", frequency: "q", dayCount: "n", maturity: "2031-02-28", settlement: "2026-03-20" }),
    "$4,368.0314 $4,362.5519 $5.4794 20");
  eq("Act/365 year length (b)", priced({ face: "5000", yield: "5.23", coupon: "6.99", frequency: "s", dayCount: "n", maturity: "2032-11-17", settlement: "2026-11-03" }),
    "$5,613.0317 $5,450.2511 $162.7806 170");

  eq("settlement on a coupon date", priced({ maturity: "2029-10-06" }), "$97.3270 $97.3270 $0.0000 0");
  eq("settlement = maturity", priced({ maturity: "2026-10-06" }), "$100.0000 $100.0000 $0.0000 0");
  eq("one day before maturity", priced({ maturity: "2026-10-07" }), "$104.9830 $99.9969 $4.9861 359");
  eq("0% yield and coupon", priced({ yield: "0", coupon: "0" }), "$100.0000 $100.0000 $0.0000 4");
  eq("$ coupon", priced({ coupon: "7", couponUnit: "d" }), "$102.7395 $102.6617 $0.0778 4");
  eq("face 1,000", priced({ face: "1,000" }), "$973.9002 $973.3447 $0.5556 4");
  eq("100-year bond", priced({ maturity: "2129-10-02" }), "$83.4286 $83.3730 $0.0556 4");
}

// ─────────────────────────────────────────────────────────────────
// 4. Pricing validation, unit switch, default dates
// ─────────────────────────────────────────────────────────────────
{
  eq("all blank", priced({ face: "", yield: "", coupon: "", maturity: "", settlement: "" }),
    "ERR Please provide a positive face value. | Please provide a positive yield value. | Please provide a positive coupon value. | Please provide a valid maturity or call date. | Please provide a valid settlement date.");
  eq("negatives", priced({ face: "0", yield: "-1", coupon: "-1" }),
    "ERR Please provide a positive face value. | Please provide a positive yield value. | Please provide a positive coupon value.");
  eq("settlement after maturity", priced({ maturity: "2026-10-01" }),
    "ERR Please make sure the settlement date is earlier than the maturity or call date.");

  eq("% → $ rounds to whole dollars", convertCouponUnit("5", "100", "d"), "5");
  eq("% → $ (1,000 face)", convertCouponUnit("5.25", "1,000", "d"), "53");
  eq("$ → % to 3 decimals", convertCouponUnit("7", "300", "p"), "2.333");
  eq("non-numeric left alone", convertCouponUnit("", "100", "d"), null);

  const d = defaultDates(new Date(2026, 9, 7));
  eq("default dates", `${d.settlement} ${d.maturity}`, "2026-10-07 2029-10-03");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
