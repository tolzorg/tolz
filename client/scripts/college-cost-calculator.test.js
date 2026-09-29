// Plain-Node test suite for the College Cost Calculator engine. Run with:
//   node scripts/college-cost-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/college-cost-calculator.html) via plain GET requests —
// the form submits GET to the same server-rendered page.

import { calculateCollegeCost, formatDollars, yearsLabel, DEFAULTS } from "../src/utils/collegeCostCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function money(name, actual, expected) {
  ok(name, formatDollars(actual) === expected, `got ${formatDollars(actual)}, expected ${expected}`);
}
const calc = (over = {}) => calculateCollegeCost({ ...DEFAULTS, ...over });

// ─────────────────────────────────────────────────────────────────
// 1. Default scenario (matches the reference screenshot)
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  money("total cost", r.totalCost, "$154,625");
  money("total today", r.totalToday, "$130,836");
  money("monthly", r.fullMonthly, "$1,773");
  ok("years", r.years === 7 && yearsLabel(r.years) === "7 years");
  ok("no additional row at $0 balance", r.fullAdditional === null && r.percentSection.additional === null);
  money("freshman cost", r.freshman.cost, "$35,875");
  money("freshman now", r.freshman.now, "$30,990");
  const p = r.percentSection;
  ok("percent section", p.percent === 35 && !p.covered);
  money("need to save", p.needToSave, "$54,119");
  money("target today", p.targetToday, "$45,792");
  money("percent monthly", p.monthly, "$621");
  money("freshman needed", p.freshmanNeeded, "$12,556");
}

// ─────────────────────────────────────────────────────────────────
// 2. Disambiguating scenarios for the monthly-saving convention
// ─────────────────────────────────────────────────────────────────
{
  const r = calc({ startIn: "0" });
  money("start 0 total", r.totalCost, "$133,571");
  money("start 0 today", r.totalToday, "$126,218");
  money("start 0 monthly", r.fullMonthly, "$2,836");
  ok("start 0 hides freshman row", r.freshman === null);
  money("start 0 percent monthly", r.percentSection.monthly, "$993");
  money("start 0 freshman needed", r.percentSection.freshmanNeeded, "$10,847");
}
{
  const r = calc({ returnRate: "0" });
  money("return 0 today = total", r.totalToday, "$154,625");
  money("return 0 monthly = total/84", r.fullMonthly, "$1,841");
  money("return 0 percent monthly", r.percentSection.monthly, "$644");
}
{
  const r = calc({ taxRate: "0" });
  money("tax 0 today", r.totalToday, "$123,960");
  money("tax 0 monthly", r.fullMonthly, "$1,752");
  money("tax 0 percent today", r.percentSection.targetToday, "$43,386");
  money("tax 0 percent monthly", r.percentSection.monthly, "$613");
}
{
  const r = calc({ costIncrease: "0" });
  money("increase 0 total", r.totalCost, "$123,960");
  money("increase 0 today", r.totalToday, "$105,124");
  money("increase 0 monthly", r.fullMonthly, "$1,425");
  ok("increase 0 hides freshman row", r.freshman === null);
  money("increase 0 percent monthly", r.percentSection.monthly, "$499");
}
{
  const r = calc({ balanceNow: "10000" });
  money("balance additional", r.fullAdditional, "$120,836");
  money("balance monthly", r.fullMonthly, "$1,638");
  money("balance percent additional", r.percentSection.additional, "$35,792");
  money("balance percent monthly", r.percentSection.monthly, "$485");
}
{
  const r = calc({ costIncrease: "-2" });
  money("negative increase total", r.totalCost, "$113,216");
  money("negative increase today", r.totalToday, "$96,102");
  money("negative increase monthly", r.fullMonthly, "$1,303");
  ok("negative increase hides freshman row", r.freshman === null);
  money("negative increase freshman needed", r.percentSection.freshmanNeeded, "$10,209");
}
{
  const r = calc({ costIncrease: "0", startIn: "0" });
  money("0/0 today", r.totalToday, "$117,400");
  money("0/0 monthly", r.fullMonthly, "$2,638");
  money("0/0 percent monthly", r.percentSection.monthly, "$923");
}
{
  const r = calc({ startIn: "0", balanceNow: "5000" });
  money("start0+balance monthly", r.fullMonthly, "$2,723");
  money("start0+balance percent monthly", r.percentSection.monthly, "$880");
}
{
  const r = calc({ duration: "1", startIn: "0" });
  money("1 year total", r.totalCost, "$30,990");
  money("1 year monthly", r.fullMonthly, "$2,635");
  ok("singular year label", yearsLabel(r.years) === "1 year");
  money("1 year percent monthly", r.percentSection.monthly, "$922");
}
{
  const r = calc({ duration: "1" });
  money("duration 1 today", r.totalToday, "$32,124");
  money("duration 1 monthly", r.fullMonthly, "$722");
  money("duration 1 percent monthly", r.percentSection.monthly, "$253");
}
{
  const r = calc({ startIn: "1" });
  money("start 1 total", r.totalCost, "$140,249");
  money("start 1 today", r.totalToday, "$127,739");
  money("start 1 monthly", r.fullMonthly, "$2,338");
  ok("start 1 freshman label data", r.freshman.startIn === 1 && yearsLabel(r.freshman.startIn) === "1 year");
  money("start 1 freshman", r.freshman.cost, "$32,540");
  money("start 1 percent monthly", r.percentSection.monthly, "$818");
}
{
  const r = calc({ startIn: "40" });
  money("start 40 total", r.totalCost, "$940,337");
  money("start 40 today", r.totalToday, "$203,784");
  money("start 40 monthly", r.fullMonthly, "$789");
  money("start 40 freshman", r.freshman.cost, "$218,169");
  money("start 40 percent monthly", r.percentSection.monthly, "$276");
}
{
  const r = calc({ returnRate: "150" });
  money("return 150 today", r.totalToday, "$6,950");
  money("return 150 monthly", r.fullMonthly, "$652");
  money("return 150 percent monthly", r.percentSection.monthly, "$228");
}
{
  const r = calc({ taxRate: "99.99" });
  money("tax 99.99 today", r.totalToday, "$154,621");
  money("tax 99.99 monthly", r.fullMonthly, "$1,841");
}
money("tax 100 accepted (monthly = total/84 share)", calc({ taxRate: "100" }).percentSection.monthly, "$644");
{
  const r = calc({ savingPercent: "99.99" });
  money("99.99% need to save", r.percentSection.needToSave, "$154,609");
  money("99.99% target", r.percentSection.targetToday, "$130,822");
  money("99.99% freshman", r.percentSection.freshmanNeeded, "$35,871");
}
ok("0% hides percent section", calc({ savingPercent: "0" }).percentSection === null);
ok("100% hides percent section", calc({ savingPercent: "100" }).percentSection === null);
{
  const r = calc({ todayCost: "30,990", balanceNow: "1,000" });
  money("commas: additional", r.fullAdditional, "$129,836");
  money("commas: monthly", r.fullMonthly, "$1,760");
  money("commas: percent additional", r.percentSection.additional, "$44,792");
  money("commas: percent monthly", r.percentSection.monthly, "$607");
}

// ─────────────────────────────────────────────────────────────────
// 3. Covered-by-balance display rules
// ─────────────────────────────────────────────────────────────────
{
  const r = calc({ balanceNow: "200000" });
  ok("fully covered", r.fullCovered && r.percentSection === null && r.fullMonthly === null);
  ok("fully covered keeps freshman row", r.freshman !== null);
}
ok("covered exactly at rounded target", calc({ balanceNow: "130836" }).fullCovered);
{
  const r = calc({ balanceNow: "130835" });
  ok("just below full target not covered", !r.fullCovered);
  money("just below: additional $1", r.fullAdditional, "$1");
  money("just below: monthly $0", r.fullMonthly, "$0");
  ok("just below: percent covered", r.percentSection.covered && r.percentSection.monthly === null && r.percentSection.additional === null);
}
{
  const r = calc({ balanceNow: "50000" });
  money("partial: full additional", r.fullAdditional, "$80,836");
  money("partial: full monthly", r.fullMonthly, "$1,096");
  ok("partial: percent covered", r.percentSection.covered);
  money("partial: percent still shows need to save", r.percentSection.needToSave, "$54,119");
}
{
  const r = calc({ balanceNow: "45792.46" });
  ok("percent covered at 45792.46", r.percentSection.covered);
  money("45792.46 additional", r.fullAdditional, "$85,043");
  money("45792.46 monthly", r.fullMonthly, "$1,153");
}
{
  const r = calc({ todayCost: "0" });
  ok("zero cost is covered by $0 balance", r.fullCovered);
  money("zero cost total", r.totalCost, "$0");
}
{
  const r = calc({ todayCost: "-5" });
  ok("negative cost: covered", r.fullCovered);
  ok("negative cost format", formatDollars(r.totalCost) === "$-25" && formatDollars(r.totalToday) === "$-21", `${formatDollars(r.totalCost)} ${formatDollars(r.totalToday)}`);
  ok("negative freshman format", formatDollars(r.freshman.cost) === "$-6" && formatDollars(r.freshman.now) === "$-5");
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation
// ─────────────────────────────────────────────────────────────────
const err = (over) => calc(over).errors;
const one = (over, msg) => ok(`error: ${JSON.stringify(over)}`, JSON.stringify(err(over)) === JSON.stringify([msg]), JSON.stringify(err(over)));
one({ todayCost: "" }, "Please provide a numerical today's annual college costs value.");
one({ costIncrease: "" }, "Please provide a numerical college cost increase rate value.");
one({ duration: "" }, "Please provide a positive numerical expected college attending years value.");
one({ duration: "0" }, "Please provide a positive numerical expected college attending years value.");
one({ duration: "2.5" }, "The expected college attending years needs to be an integer value.");
one({ savingPercent: "" }, "Please provide a positive numerical value for the percent of costs you plan to pay out of savings.");
one({ savingPercent: "-5" }, "Please provide a positive numerical value for the percent of costs you plan to pay out of savings.");
one({ savingPercent: "120" }, "Please provide a percent of costs that is less than or equal to 100.");
one({ savingPercent: "100.01" }, "Please provide a percent of costs that is less than or equal to 100.");
one({ balanceNow: "" }, "Please provide a positive numerical value for college savings balance now:.");
one({ balanceNow: "-100" }, "Please provide a positive numerical value for college savings balance now:.");
one({ returnRate: "" }, "Please provide a positive numerical value for the average interest or return rate of your savings.");
one({ returnRate: "-3" }, "Please provide a positive numerical value for the average interest or return rate of your savings.");
one({ taxRate: "" }, "Please provide a positive numerical tax rate value.");
one({ taxRate: "-5" }, "Please provide a positive numerical tax rate value.");
one({ taxRate: "120" }, "Please provide a tax rate that is less than 100.");
one({ taxRate: "100.01" }, "Please provide a tax rate that is less than 100.");
one({ startIn: "" }, "Please provide a positive numerical value for the number of years the college will start.");
one({ startIn: "-1" }, "Please provide a positive numerical value for the number of years the college will start.");
one({ startIn: "1.5" }, "The number of years the college will start needs to be an integer value.");
{
  const all = Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, "abc"]));
  ok("all 8 errors in the reference's order (tax before return)", JSON.stringify(err(all)) === JSON.stringify([
    "Please provide a numerical today's annual college costs value.",
    "Please provide a numerical college cost increase rate value.",
    "Please provide a positive numerical expected college attending years value.",
    "Please provide a positive numerical value for the percent of costs you plan to pay out of savings.",
    "Please provide a positive numerical value for college savings balance now:.",
    "Please provide a positive numerical tax rate value.",
    "Please provide a positive numerical value for the average interest or return rate of your savings.",
    "Please provide a positive numerical value for the number of years the college will start.",
  ]));
}

console.log(`\nCollege Cost Calculator engine suite: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
