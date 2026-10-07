// Plain-Node test suite for the RMD Calculator engine. Run with:
//   node scripts/rmd-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/rmd-calculator.html) via plain GET requests — the form
// submits GET to the same server-rendered page. The current year is pinned
// to 2026 (when these were captured) for the "will begin" sentence rule.

import { calculateRmd, DEFAULTS, formatMoney as $, formatPeriod, rmdYearOptions } from "../src/utils/rmdCalculatorEngine.js";
import { UNIFORM_LIFETIME, JOINT_LIFE } from "../src/utils/rmdTables.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const base = { ...DEFAULTS, rmdYear: "2026", spouseIsBeneficiary: true, currentYear: 2026 };
const calc = (over = {}) => calculateRmd({ ...base, ...over });
const row = (x) => `${x.year} ${x.age} ${x.period === null ? "NA" : formatPeriod(x.period)} ${$(x.rmd)} ${$(x.balance)}`;
const first = (r) => `${formatPeriod(r.period)} ${$(r.rmd)}`;

// ─────────────────────────────────────────────────────────────────
// 1. The reference screenshot
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("default RMD", first(r), "24.6 $12,195.12");
  eq("projection rows", r.projection.rows.length, 46);
  eq("2026", row(r.projection.rows[0]), "2026 75 24.6 $12,195.12 $302,804.88");
  eq("2027", row(r.projection.rows[1]), "2027 76 23.7 $12,776.58 $305,168.54");
  eq("2032", row(r.projection.rows[6]), "2032 81 19.4 $15,951.24 $308,975.47");
  eq("2052 (period 6)", row(r.projection.rows[26]), "2052 101 6 $21,725.42 $115,144.74");
  eq("2071 (age 120)", row(r.projection.rows[45]), "2071 120 2 $369.15 $406.06");
  eq("balance echoed as typed", r.balanceText, "300000");
}

// ─────────────────────────────────────────────────────────────────
// 2. Tables, beneficiary rules and ages
// ─────────────────────────────────────────────────────────────────
{
  eq("Uniform Lifetime (IRS 2022)", [73, 74, 75, 80, 90, 100, 110, 120].map((a) => UNIFORM_LIFETIME[a]).join(","), "26.5,25.5,24.6,20.2,12.2,6.4,3.5,2");
  eq("joint table rows complete", Object.keys(JOINT_LIFE).length, 48);
  eq("joint 120 has spouses 20…109", JOINT_LIFE[120].length, 90);
  eq("spouse 19 years younger → joint", first(calc({ spouseYear: "1970" })), "31.5 $9,523.81");
  eq("joint projection end", row(calc({ spouseYear: "1970" }).projection.rows[45]), "2071 120 2.6 $5,847.35 $10,115.91");
  eq("10 years younger → uniform", first(calc({ spouseYear: "1961" })), "24.6 $12,195.12");
  eq("11 years younger → joint", first(calc({ spouseYear: "1962" })), "25.3 $11,857.71");
  eq("spouse older → uniform", first(calc({ spouseYear: "1941" })), "24.6 $12,195.12");
  eq("spouse not beneficiary → uniform", first(calc({ spouseIsBeneficiary: false, spouseYear: "1970" })), "24.6 $12,195.12");
  eq("spouse age 20", first(calc({ spouseYear: "2006" })), "65.1 $4,608.29");
  eq("age 73", first(calc({ birthYear: "1953" })), "26.5 $11,320.75");
  eq("age 74", first(calc({ birthYear: "1952" })), "25.5 $11,764.71");
  eq("age 119", first(calc({ birthYear: "1907", spouseIsBeneficiary: false })), "2.3 $130,434.78");
  eq("age 126 uses the 120 row", first(calc({ birthYear: "1900", spouseIsBeneficiary: false })), "2 $150,000.00");
  eq("age 126, spouse 73 → joint (120, 73)", first(calc({ birthYear: "1900" })), "16.4 $18,292.68");
  eq("age 120, spouse 66 → joint", first(calc({ birthYear: "1906", spouseYear: "1960" })), "22 $13,636.36");
  eq("decimal birth year (age 74.5 → 74 row)", first(calc({ birthYear: "1951.5" })), "25.5 $11,764.71");
  eq("commas in balance", `${calc({ balance: "300,000.50" }).balanceText} ${$(calc({ balance: "300,000.50" }).rmd)}`, "300000.50 $12,195.14");
}

// ─────────────────────────────────────────────────────────────────
// 3. Before RMD age, projection visibility
// ─────────────────────────────────────────────────────────────────
{
  const early = calc({ birthYear: "1955" });
  ok("born 1955: no RMD yet", early.period === null && early.rmd === 0);
  eq("born 1955 sentence", early.begin, "If there are no policy changes, your RMD will begin in 2028, when you turn 73.");
  eq("NA rows", row(early.projection.rows[0]), "2026 71 NA $0.00 $315,000.00");
  eq("born 1959", calc({ birthYear: "1959" }).begin, "If there are no policy changes, your RMD will begin in 2032, when you turn 73.");
  eq("born 1960 (age 75 rule)", calc({ birthYear: "1960", rmdYear: "2027" }).begin,
    "If there are no policy changes and the RMD age increases to 75 in 2033 as scheduled, your RMD will begin in 2035, when you turn 75.");
  ok("start year = this year: no sentence", calc({ birthYear: "1953", rmdYear: "2025" }).begin === null);
  ok("blank rate: no projection", calc({ rate: "" }).projection === null);
  eq("0% rate", row(calc({ rate: "0" }).projection.rows[0]), "2026 75 24.6 $12,195.12 $287,804.88");
  eq("negative rate", row(calc({ rate: "-5" }).projection.rows[1]), "2027 76 23.7 $11,510.75 $247,653.88");
  eq("age 110: projection shown", calc({ birthYear: "1916", spouseIsBeneficiary: false }).projection.rows.length, 11);
  ok("age 111: no projection", calc({ birthYear: "1915", spouseIsBeneficiary: false }).projection === null);
  eq("tiny balance", `${$(calc({ balance: "0.01" }).rmd)} ${$(calc({ balance: "0.01" }).projection.rows[0].balance)}`, "$0.00 $0.01");
  eq("year menu", rmdYearOptions(new Date(2026, 9, 7)).join(","), "2027,2026,2025,2024");
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  eq("all invalid", errs({ birthYear: "x", balance: "x", spouseYear: "x", rate: "x" }),
    "Please provide a valid year of birth. | Please provide a positive retirement account balance. | Please provide a valid spouse's year of birth. | Please provide a valid estimated rate of return for your retirement account.");
  eq("blank (rate is optional)", errs({ birthYear: "", balance: "", spouseYear: "", rate: "" }),
    "Please provide a valid year of birth. | Please provide a positive retirement account balance. | Please provide a valid spouse's year of birth.");
  eq("zero balance", errs({ balance: "0" }), "Please provide a positive retirement account balance.");
  eq("birth 1800 ok", errs({ birthYear: "1800", spouseIsBeneficiary: false }), "");
  eq("birth 1799", errs({ birthYear: "1799" }), "Please provide a valid year of birth.");
  eq("birth 2200 ok", errs({ birthYear: "2200", spouseIsBeneficiary: false }), "");
  eq("birth 2201", errs({ birthYear: "2201", spouseIsBeneficiary: false }), "Please provide a valid year of birth.");
  eq("spouse 1799", errs({ spouseYear: "1799" }), "Please provide a valid spouse's year of birth.");
  eq("spouse 2201", errs({ spouseYear: "2201" }), "Please provide a valid spouse's year of birth.");
  eq("spouse under 20", errs({ spouseYear: "2007" }), "Your spouse's age is out of the range of this calculator.");
  eq("spouse ignored when not beneficiary", errs({ spouseIsBeneficiary: false, spouseYear: "x" }), "");
  eq("rate -100", errs({ rate: "-100" }), "Please provide a valid estimated rate of return for your retirement account.");
  eq("rate 1000 ok", errs({ rate: "1000" }), "");
  eq("rate 5000", errs({ rate: "5000" }), "Please provide a valid estimated rate of return for your retirement account.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
