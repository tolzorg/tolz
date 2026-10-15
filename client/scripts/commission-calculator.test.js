// Plain-Node test suite for the Commission Calculator engine.
// Run with:
//   node scripts/commission-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/commission-calculator.html) via plain GET requests. A
// scratch comparator also diffed random scenarios: simple form 346/350 and
// tiered form 200/200 identical. Every simple-form miss is a 0% rate with no
// sales price, which breaks the reference page; we show an error instead.

import {
  calculateSimpleCommission, calculateTieredCommission, formatCommissionNumber, SIMPLE_DEFAULTS, TIERED_DEFAULTS, TIER_COUNT,
} from "../src/utils/commissionCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const simple = (o = {}) => calculateSimpleCommission({ ...SIMPLE_DEFAULTS, ...o });
const show = (r) => (r.errors ? r.errors.join(" | ") : `${r.label} = ${r.value} | ${r.steps.map((s) => s.join(" ")).join(" | ")}`);

// ── Simple ──
eq("default", show(simple()), "Commission = $6,000 | commission = sales price × commission rate | = $200,000 × 3% | = $6,000");
eq("solve price", show(simple({ price: "", commission: "6000" })), "Sales Price = $200,000 | sales price = commission ÷ commission rate | = $6,000 ÷ 3% | = $200,000");
eq("solve rate", show(simple({ rate: "", commission: "6000" })), "Commission Rate = 3% | commission rate = commission ÷ sales price | = $6,000 ÷ $200,000 | = 3%");
eq("all three: commission recomputed", simple({ commission: "1" }).value, "$6,000");
eq("decimals", show(simple({ price: "1234.567", rate: "3.3333" })), "Commission = $41.15 | commission = sales price × commission rate | = $1,234.57 × 3.3333% | = $41.15");
eq("rate echoed as typed", simple({ price: "1000", rate: "3.123456789" }).steps[1][1], "$1,000 × 3.123456789%");
eq("trailing zeros dropped", simple({ price: "1234.5", rate: "10" }).value, "$123.45");
eq("$0.5", simple({ price: "0.5", rate: "100" }).value, "$0.5");
eq("two significant digits", simple({ price: "0.0123", rate: "50" }).value, "$0.0062");
eq("0.996 → $1", simple({ price: "0.996", rate: "100" }).value, "$1");
eq("half-up cents", simple({ price: "1.005", rate: "100" }).value, "$1.01");
eq("below 0.0001 is $0", simple({ price: "0.0001", rate: "10" }).value, "$0");
eq("0.0001 kept", simple({ price: "0.0001", rate: "100" }).value, "$0.0001");
eq("input echo keeps tiny digits", simple({ price: "0.000015", rate: "1000000" }).steps[1][1], "$0.000015 × 1000000%");
eq("rate 14.29%", simple({ price: "7", rate: "", commission: "1" }).value, "14.29%");
eq("rate 0.033%", simple({ price: "3", rate: "", commission: "0.001" }).value, "0.033%");
eq("tiny rate is 0%", simple({ price: "1000", rate: "", commission: "0.0005" }).value, "0%");
eq("price 333.33", simple({ price: "", commission: "10" }).value, "$333.33");
eq("big exact digits", simple({ price: "12345678901234567", rate: "100" }).value, "$12,345,678,901,234,568");
eq("commas accepted", simple({ price: "1,000,000.555", rate: "2.5" }).value, "$25,000.01");
eq("zero rate", simple({ rate: "0" }).value, "$0");
eq("fewer than two", show(simple({ rate: "" })), "Please provide at least two values to calculate.");
eq("none", show(simple({ price: "", rate: "" })), "Please provide at least two values to calculate.");
eq("all invalid", show(simple({ price: "abc", rate: "x", commission: "y" })),
  "Please provide a valid sales price. | Please provide a valid commission rate. | Please provide a valid commission.");
eq("invalid beats too-few", show(simple({ price: "abc", rate: "" })), "Please provide a valid sales price.");
eq("zero price invalid", show(simple({ price: "0", rate: "", commission: "50" })), "Please provide a valid sales price.");
eq("negative rate", show(simple({ rate: "-3" })), "Please provide a valid commission rate.");
eq("negative commission", show(simple({ price: "", commission: "-30" })), "Please provide a valid commission.");
eq("0% rate cannot give a price", simple({ price: "", rate: "0", commission: "5" }).errors.length, 1);

// ── Tiered ──
const tiers = (list) => Array.from({ length: TIER_COUNT }, (_, i) => ({ to: "", rate: "", unit: "percent", ...list[i] }));
const tier = (o = {}) => calculateTieredCommission({
  hasBase: false, varies: true, ...TIERED_DEFAULTS, ...o, tiers: tiers(o.tiers ?? TIERED_DEFAULTS.tiers),
});
const tshow = (r) => (r.errors ? r.errors.join(" | ") : `${r.total} | ${r.rows.map((x) => x.join(" ")).join(" | ")}`);

eq("tiered default", tshow(tier()), "$9,600 | Commission of $0 - $20,000 $600 | Commission of $20,000+ $9,000");
eq("below first tier", tshow(tier({ price: "10000" })), "$300 | Commission of $0 - $20,000 $300");
eq("at the tier limit", tshow(tier({ price: "20000" })), "$600 | Commission of $0 - $20,000 $600");
eq("just past", tshow(tier({ price: "20000.5" })), "$600.03 | Commission of $0 - $20,000 $600 | Commission of $20,000+ $0.025");
eq("base $", tshow(tier({ hasBase: true })), "$10,600 | Base commission $1,000 | Commission of $0 - $20,000 $600 | Commission of $20,000+ $9,000");
eq("base %", tier({ hasBase: true, baseUnit: "percent" }).total, "$2,009,600");
eq("fixed %", tshow(tier({ varies: false })), "$6,000 | Additional commission $6,000");
eq("fixed $", tshow(tier({ varies: false, fixedUnit: "dollar" })), "$3 | Additional commission $3");
eq("fixed + base", tier({ varies: false, hasBase: true }).total, "$7,000");
eq("$ tier", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { rate: "5", unit: "dollar" }] })), "$605 | Commission of $0 - $20,000 $600 | Commission of $20,000+ $5");
eq("three tiers", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { to: "50000", rate: "5" }, { rate: "10" }] })),
  "$17,100 | Commission of $0 - $20,000 $600 | Commission of $20,000 - $50,000 $1,500 | Commission of $50,000+ $15,000");
eq("last tier capped, no rate after", tier({ tiers: [{ to: "20000", rate: "3" }, { to: "50000", rate: "5" }] }).total, "$2,100");
eq("blank rows skipped", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, {}, { to: "50000", rate: "7" }] })),
  "$2,700 | Commission of $0 - $20,000 $600 | Commission of $20,000 - $50,000 $2,100");
eq("blank first row skipped", tshow(tier({ tiers: [{}, { rate: "5" }] })), "$10,000 | Commission of $0+ $10,000");
eq("open first tier stops", tier({ tiers: [{ rate: "3" }, { rate: "5" }] }).total, "$6,000");
eq("equal limits allowed", tier({ tiers: [{ to: "20000", rate: "3" }, { to: "20000", rate: "5" }, { rate: "10" }] }).total, "$18,600");
eq("decimal limits", tshow(tier({ tiers: [{ to: "20,000.5", rate: "3" }, { to: "100000", rate: "5" }, { rate: "2" }] })),
  "$6,599.99 | Commission of $0 - $20,000.5 $600.02 | Commission of $20,000.5 - $100,000 $3,999.98 | Commission of $100,000+ $2,000");
eq("tiny tier amount is $0", tier({ price: "20000.0001" }).rows[1][1], "$0");
eq("negative small amount uses 2 dp", formatCommissionNumber(-0.0945), "-0.09");

eq("tiered errors", tshow(tier({ price: "abc", hasBase: true, base: "x", tiers: [{ to: "20000", rate: "abc" }] })),
  "Please provide a valid sales price. | Please provide a valid base commission value. | Please provide a valid commission value for range #1.");
eq("fixed error", tshow(tier({ varies: false, fixed: "-1" })), "Please provide a valid commission value.");
eq("hidden boxes ignored", tier({ base: "abc", fixed: "abc" }).total, "$9,600");
eq("all tiers empty", tshow(tier({ tiers: [] })), "Please provide a valid commission value for range #1.");
eq("limit not larger", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { to: "10000", rate: "abc" }] })),
  "Please provide a to value for range #2 that is larger than #1. | Please provide a valid commission value for range #2.");
eq("after an open tier", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { rate: "5" }, { to: "50000", rate: "7" }] })),
  "Please provide a to value for range #3 that is larger than #2.");
eq("numbered by position", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, {}, { to: "10000", rate: "7" }] })),
  "Please provide a to value for range #2 that is larger than #1.");
eq("invalid limit", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { to: "abc", rate: "x" }] })), "Please provide a valid to value for range #2.");
eq("limit without rate", tshow(tier({ tiers: [{ to: "20000", rate: "3" }, { to: "50000" }, { rate: "10" }] })),
  "Please provide a valid commission value for range #2.");
eq("zero sales price", tshow(tier({ price: "0" })), "Please provide a valid sales price.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
