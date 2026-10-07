// Plain-Node test suite for the IRA Calculator engine. Run with:
//   node scripts/ira-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/ira-calculator.html) via plain GET requests — the form
// submits GET to the same server-rendered page.

import { calculateIra, DEFAULTS, formatDollars as $ } from "../src/utils/iraCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (over = {}) => calculateIra({ ...DEFAULTS, ...over });
const head = (r) => [r.balances.traditional, r.balances.roth, r.balances.taxable, r.afterTax.traditional].map($).join(" ");
const KEYS = ["beforeStart", "beforeEnd", "afterStart", "afterEnd", "rothStart", "rothEnd", "taxableStart", "taxableEnd"];
const row = (x) => [x.age, ...KEYS.map((k) => $(x[k]))].join(" ");

// ─────────────────────────────────────────────────────────────────
// 1. Default scenario (the reference screenshot)
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("default balances", head(r), "$1,066,343 $799,758 $563,434 $906,392");
  eq("default sentences", r.sentences.join(" "),
    "A Traditional, SIMPLE, or SEP IRA account can accumulate $106,634 more after-tax balance than a Roth IRA account at age 65. A Roth IRA account can accumulate $236,324 more than a regular taxable savings account.");
  eq("row 30", row(r.rows[0]), "30 $30,000 $39,300 $25,500 $33,405 $22,500 $29,475 $22,500 $29,138");
  eq("row 31", row(r.rows[1]), "31 $39,300 $49,158 $33,405 $41,784 $29,475 $36,869 $29,138 $36,074");
  eq("row 64", row(r.rows[34]), "64 $998,909 $1,066,343 $849,073 $906,392 $749,182 $799,758 $533,788 $563,434");
  ok("chart shown", r.showChart);
  eq("chart quirk: after-tax lines start at balance × (1 − tax)", r.chart.map((s) => s.points[0].y).join(","), "30000,22500,22500,22500,22500");
  eq("principal line ends at pre-tax principal", r.chart[4].points.at(-1).y, 292500);
}

// ─────────────────────────────────────────────────────────────────
// 2. Sentence variants and other scenarios
// ─────────────────────────────────────────────────────────────────
{
  const roth = calc({ taxRetirement: "30" });
  eq("Roth ahead", head(roth), "$1,066,343 $799,758 $563,434 $746,440");
  eq("Roth-ahead sentences ('after tax', no hyphen)", roth.sentences.join(" "),
    "A Roth IRA account can accumulate $53,317 more after tax balance than a Traditional, SIMPLE, or SEP IRA account at age 65. A Traditional, SIMPLE, or SEP IRA account can accumulate $183,007 more than a regular taxable savings account.");
  eq("equal tax rates", calc({ taxRetirement: "25" }).sentences.join(" "),
    "A Traditional, SIMPLE, or SEP IRA account can accumulate the same after tax balance as a Roth IRA account at age 65. They both can accumulate $236,324 more than a regular taxable savings account.");
  eq("0% current tax (negative second figure)", calc({ taxNow: "0" }).sentences[1],
    "A Traditional, SIMPLE, or SEP IRA account can accumulate $-159,952 more than a regular taxable savings account.");
  eq("no contribution cap ($10,000)", head(calc({ contribution: "10000" })), "$1,344,930 $1,008,698 $716,240 $1,143,191");
  eq("age 52, $9,000", head(calc({ contribution: "9000", currentAge: "52" })), "$233,927 $175,445 $155,704 $198,838");
  eq("0% return", head(calc({ rate: "0" })), "$292,500 $219,375 $219,375 $248,625");
  eq("0% return second sentence", calc({ rate: "0" }).sentences[1], "A Roth IRA account can accumulate $0 more than a regular taxable savings account.");
  const small = calc({ balance: "0", contribution: "1000", retirementAge: "33" });
  eq("small rows", small.rows.map(row).join(" | "),
    "30 $0 $1,000 $0 $850 $0 $750 $0 $750 | 31 $1,000 $2,060 $850 $1,751 $750 $1,545 $750 $1,534 | 32 $2,060 $3,184 $1,751 $2,706 $1,545 $2,388 $1,534 $2,353");
  eq("commas", row(calc({ balance: "1,000", contribution: "2,000" }).rows[0]), "30 $1,000 $3,060 $850 $2,601 $750 $2,295 $750 $2,284");
  eq("99% current tax", row(calc({ taxNow: "99" }).rows[0]), "30 $30,000 $39,300 $25,500 $33,405 $300 $393 $300 $375");
  eq("retirement 120", calc({ retirementAge: "120" }).rows.length, 90);
  ok("3-year span: no chart", !calc({ retirementAge: "33" }).showChart);
  ok("4-year span: chart", calc({ retirementAge: "34" }).showChart);
}

// ─────────────────────────────────────────────────────────────────
// 3. Validation (reference order and wording)
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  const ALL = "Please provide a positive current balance. | Please provide a positive annual contribution. | Please provide a positive annual investment return rate value. | Please provide a positive current age value. | Please provide a positive retirement age value. | Please provide a positive marginal tax rate now value. | Please provide a positive marginal tax rate after retirement value.";
  const every = (v) => Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, v]));
  eq("all invalid", errs(every("x")), ALL);
  eq("all blank", errs(every("")), ALL);
  eq("all negative", errs(every("-1")), ALL);
  eq("zero contribution", errs({ contribution: "0" }), "Please provide a positive annual contribution.");
  eq("tiny contribution ok", errs({ contribution: "0.01" }), "");
  eq("zero balance ok", errs({ balance: "0" }), "");
  eq("equal ages (message verbatim)", errs({ currentAge: "65" }), "Please provide a current age should be lower than retirement age.");
  eq("64.5 rounds to 65", errs({ currentAge: "64.5" }), "Please provide a current age should be lower than retirement age.");
  eq("retirement 0", errs({ retirementAge: "0" }), "Please provide a current age should be lower than retirement age.");
  eq("current tax 99 ok", errs({ taxNow: "99" }), "");
  eq("current tax 99.01", errs({ taxNow: "99.01" }), "Please provide a positive marginal tax rate now value.");
  eq("retirement tax 100", errs({ taxRetirement: "100" }), "Please provide a positive marginal tax rate after retirement value.");
  eq("rate 1000 ok", errs({ rate: "1000" }), "");
  eq("rate 1000.01", errs({ rate: "1000.01" }), "Please provide a positive annual investment return rate value.");
  eq("retirement 120.01", errs({ retirementAge: "120.01" }), "Please provide a positive retirement age value.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
