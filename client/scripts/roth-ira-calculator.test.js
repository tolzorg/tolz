// Plain-Node test suite for the Roth IRA Calculator engine. Run with:
//   node scripts/roth-ira-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/roth-ira-calculator.html) via plain GET requests — the
// form submits GET to the same server-rendered page.

import { calculateRothIra, DEFAULTS, formatDollars as $ } from "../src/utils/rothIraCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (over = {}) => calculateRothIra({ ...DEFAULTS, maximize: false, ...over });
const head = (r) => [r.roth.balance, r.taxable.balance, r.roth.principal, r.roth.interest, r.taxable.interest, r.taxable.tax, r.advantage].map($).join(" ");
const row = (x) => [x.age, x.principalStart, x.principalEnd, x.rothStart, x.rothEnd, x.taxableStart, x.taxableEnd].map((v, i) => (i ? $(v) : v)).join(" ");

// ─────────────────────────────────────────────────────────────────
// 1. The two reference screenshots
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("default headline", head(r), "$1,066,343 $751,245 $292,500 $781,343 $611,660 $152,915 $315,098");
  eq("default rows", r.rows.length, 35);
  eq("row 30", row(r.rows[0]), "30 $30,000 $37,500 $30,000 $39,300 $30,000 $38,850");
  eq("row 31", row(r.rows[1]), "31 $37,500 $45,000 $39,300 $49,158 $38,850 $48,098");
  eq("row 64", row(r.rows[34]), "64 $285,000 $292,500 $998,909 $1,066,343 $711,718 $751,245");
  ok("no notice", r.notice === null);
  ok("chart shown", r.showChart);

  const m = calc({ maximize: true });
  eq("maximize headline", head(m), "$1,091,947 $774,108 $309,000 $791,547 $620,143 $155,036 $317,839");
  eq("maximize: $7,500 at 49", row(m.rows[19]), "49 $172,500 $180,000 $343,968 $372,106 $287,213 $307,637");
  eq("maximize: $8,600 from 50", row(m.rows[20]), "50 $180,000 $188,600 $372,106 $403,032 $307,637 $330,081");
  eq("maximize ignores the amount field", head(calc({ maximize: true, contribution: "x" })), head(m));
}

// ─────────────────────────────────────────────────────────────────
// 2. Contribution limits and the notice
// ─────────────────────────────────────────────────────────────────
{
  const over = calc({ contribution: "10000" });
  eq("over the limit is capped", head(over), head(calc()));
  eq("notice", over.notice,
    "The annual contribution is higher than the limit imposed by the IRS for the age, which is $7500. As a result, the calculator used the adjusted contribution amount to meet the IRS requirement.");
  ok("notice quotes $8600 at 52", calc({ contribution: "9000", currentAge: "52" }).notice.includes("which is $8600."));
  eq("$9,000 at 52 → $8,600", head(calc({ contribution: "9000", currentAge: "52" })), "$226,374 $200,741 $141,800 $93,174 $78,588 $19,647 $25,633");
  ok("exactly $8,600 at 52: no notice", calc({ contribution: "8600", currentAge: "52" }).notice === null);
  const capOnce = calc({ contribution: "8600", currentAge: "49", retirementAge: "51" });
  eq("cap set once by current age (49 → $7,500 even at 50)", capOnce.rows.map(row).join(" | "),
    "49 $30,000 $37,500 $30,000 $39,300 $30,000 $38,850 | 50 $37,500 $45,000 $39,300 $49,158 $38,850 $48,098");
  eq("$8,000 at 45 → $7,500 throughout", head(calc({ contribution: "8000", currentAge: "45", retirementAge: "55" })).split(" ").slice(0, 3).join(" "),
    "$152,581 $138,751 $105,000");
  eq("maximize 48 → 55", head(calc({ maximize: true, currentAge: "48", retirementAge: "55" })), "$114,263 $106,987 $88,000 $34,863 $25,316 $6,329 $7,276");
  eq("maximize 60 → 65", head(calc({ maximize: true, currentAge: "60", retirementAge: "65" })), "$88,626 $84,434 $73,000 $24,226 $15,245 $3,811 $4,192");
}

// ─────────────────────────────────────────────────────────────────
// 3. Edge cases and replicated quirks
// ─────────────────────────────────────────────────────────────────
{
  eq("current age 52", head(calc({ currentAge: "52" })), "$205,604 $181,865 $127,500 $85,604 $72,487 $18,122 $23,739");
  eq("0% tax", head(calc({ tax: "0" })), "$1,066,343 $1,066,343 $292,500 $781,343 $773,843 $0 $0");
  eq("0% return: Roth interest quirk ($7,500)", head(calc({ rate: "0" })), "$292,500 $292,500 $292,500 $7,500 $0 $0 $0");
  eq("no contributions", head(calc({ contribution: "0" })), "$230,583 $140,020 $30,000 $200,583 $146,694 $36,673 $90,562");
  eq("all zero", head(calc({ balance: "0", contribution: "0" })), "$0 $0 $0 $0 $0 $0 $0");
  eq("ages round half-up (30.7 → 31, 65.7 → 66)", `${calc({ currentAge: "30.7", retirementAge: "65.7" }).rows[0].age} ${calc({ currentAge: "30.7", retirementAge: "65.7" }).retirementAge}`, "31 66");
  eq("30.2 rounds down", calc({ currentAge: "30.2" }).rows.length, 35);
  eq("0.2 → 0.5 is one row", calc({ currentAge: "0.2", retirementAge: "0.5" }).rows.length, 1);
  ok("3-year span: no chart", !calc({ retirementAge: "33" }).showChart);
  ok("4-year span: chart", calc({ retirementAge: "34" }).showChart);
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  const ALL = "Please provide a positive current balance. | Please provide a positive annual contribution. | Please provide a positive expected investment return rate value. | Please provide a positive current age value. | Please provide a positive retirement age value. | Please provide a positive marginal tax rate value.";
  eq("all invalid", errs({ balance: "x", contribution: "x", rate: "x", currentAge: "x", retirementAge: "x", tax: "x" }), ALL);
  eq("all blank", errs({ balance: "", contribution: "", rate: "", currentAge: "", retirementAge: "", tax: "" }), ALL);
  eq("all negative", errs({ balance: "-1", contribution: "-1", rate: "-1", currentAge: "-1", retirementAge: "-1", tax: "-1" }), ALL);
  eq("equal ages", errs({ currentAge: "65" }), "Current age should be lower than retirement age.");
  eq("64.5 rounds to 65", errs({ currentAge: "64.5" }), "Current age should be lower than retirement age.");
  eq("tax 99 ok", errs({ tax: "99" }), "");
  eq("tax 99.01", errs({ tax: "99.01" }), "Please provide a positive marginal tax rate value.");
  eq("rate 1000 ok", errs({ rate: "1000" }), "");
  eq("rate 1000.01", errs({ rate: "1000.01" }), "Please provide a positive expected investment return rate value.");
  eq("retirement 120 ok", errs({ retirementAge: "120" }), "");
  eq("retirement 120.01", errs({ retirementAge: "120.01" }), "Please provide a positive retirement age value.");
  eq("current age 0 ok", errs({ currentAge: "0" }), "");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
