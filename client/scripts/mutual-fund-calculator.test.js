// Plain-Node test suite for the Mutual Fund Calculator engine. Run with:
//   node scripts/mutual-fund-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/mutual-fund-calculator.html) via plain GET requests — the
// form submits GET to the same server-rendered page.

import { calculateMutualFund, DEFAULTS } from "../src/utils/mutualFundCalculatorEngine.js";
import { formatMoney } from "../src/utils/simpleInterestCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (over = {}) => calculateMutualFund({ ...DEFAULTS, ...over });

/** The visible result rows, the way the reference lays them out. */
function rows(r) {
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  const out = [`Ending value ${formatMoney(r.endingValue)}`];
  if (r.show.principal) out.push(`Total principal ${formatMoney(r.principal)}`, `Total contributions ${formatMoney(r.contributions)}`);
  out.push(`Net return ${formatMoney(r.netReturn)}`);
  if (r.show.irr) out.push(`Net IRR ${r.irr.toFixed(3)}%`);
  if (r.show.sales) out.push(`Sales charge ${formatMoney(r.salesCharge)}`);
  if (r.show.deferred) out.push(`Deferred sales charge ${formatMoney(r.deferredCharge)}`);
  if (r.show.operating) out.push(`Operating expenses ${formatMoney(r.operating)}`);
  if (r.show.totalFees) out.push(`Total charges and fees ${formatMoney(r.totalFees)}`);
  return out.join(" | ");
}
const pie = (r) => (r.show.pie ? r.pie.map((s) => `${s.label} ${formatMoney(s.value)}`).join(" / ") : "(no chart)");
const noFees = { monthly: "0", sales: "0", operating: "0" };

// ─────────────────────────────────────────────────────────────────
// 1. Default scenario (the reference screenshot)
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("default rows", rows(r),
    "Ending value $90,077.09 | Total principal $80,000.00 | Total contributions $60,000.00 | Net return $10,077.09 | Net IRR 3.844% | Sales charge $1,600.00 | Operating expenses $1,323.40 | Total charges and fees $2,923.40");
  eq("default pie", pie(r), "Initial investment $20,000.00 / Total contributions $60,000.00 / Fees and charges $2,923.40 / Net return $10,077.09");
}

// ─────────────────────────────────────────────────────────────────
// 2. Isolated mechanics
// ─────────────────────────────────────────────────────────────────
{
  eq("annual effective growth", rows(calc(noFees)), "Ending value $25,525.63 | Net return $5,525.63");
  eq("1 year", rows(calc({ ...noFees, years: "1" })), "Ending value $21,000.00 | Net return $1,000.00");
  eq("operating 1% (net rate 4%)", rows(calc({ ...noFees, operating: "1", years: "1" })),
    "Ending value $20,800.00 | Net return $800.00 | Net IRR 4.000% | Operating expenses $203.05");
  eq("operating over 2 years", formatMoney(calc({ ...noFees, operating: "1", years: "2" }).operating), "$414.21");
  eq("operating over 5 years", formatMoney(calc({ ...noFees, operating: "1", years: "5" }).operating), "$1,099.76");
  eq("operating 2%", formatMoney(calc({ ...noFees, operating: "2", years: "1" }).operating), "$402.30");
  eq("operating at 10% return", formatMoney(calc({ ...noFees, operating: "1", years: "1", rate: "10" }).operating), "$207.92");
  eq("operating at 0% return", rows(calc({ ...noFees, operating: "1", years: "1", rate: "0" })),
    "Ending value $19,800.00 | Net return $-200.00 | Net IRR -1.000% | Operating expenses $198.09");
  eq("operating, 6 months", formatMoney(calc({ ...noFees, operating: "1", years: "0", months: "6" }).operating), "$100.53");
  eq("operating, 1 month", rows(calc({ ...noFees, operating: "1", years: "0", months: "1" })),
    "Ending value $20,065.47 | Net return $65.47 | Net IRR 4.000% | Operating expenses $16.62");
  eq("sales charge only", rows(calc({ ...noFees, sales: "2", years: "1" })),
    "Ending value $20,580.00 | Net return $580.00 | Net IRR 2.900% | Sales charge $400.00");
  eq("deferred only", rows(calc({ ...noFees, deferred: "3", years: "1" })),
    "Ending value $20,400.00 | Net return $400.00 | Net IRR 2.000% | Deferred sales charge $600.00");
  eq("monthly contributions at month end", rows(calc({ ...noFees, investment: "0", monthly: "1000", years: "1" })),
    "Ending value $12,272.58 | Total principal $12,000.00 | Total contributions $12,000.00 | Net return $272.58");
  eq("annual contributions at year end", rows(calc({ ...noFees, investment: "0", annual: "1000", years: "2" })),
    "Ending value $2,050.00 | Total principal $2,000.00 | Total contributions $2,000.00 | Net return $50.00");
  eq("annual contributions, 2y6m", rows(calc({ ...noFees, annual: "5000", years: "2", months: "6" })),
    "Ending value $33,097.65 | Total principal $30,000.00 | Total contributions $10,000.00 | Net return $3,097.65");
  eq("annual contribution not yet due at 11 months", rows(calc({ ...noFees, annual: "5000", years: "0", months: "11" })),
    "Ending value $20,914.79 | Net return $914.79");
}

// ─────────────────────────────────────────────────────────────────
// 3. Deferred charge base, fractional lengths, extremes
// ─────────────────────────────────────────────────────────────────
{
  eq("deferred on total principal", rows(calc({ deferred: "3" })),
    "Ending value $87,677.09 | Total principal $80,000.00 | Total contributions $60,000.00 | Net return $7,677.09 | Net IRR 2.967% | Sales charge $1,600.00 | Deferred sales charge $2,400.00 | Operating expenses $1,323.40 | Total charges and fees $5,323.40");
  const down = calc({ deferred: "3", rate: "-10" });
  eq("deferred on the (lower) final value", rows(down),
    "Ending value $54,899.02 | Total principal $80,000.00 | Total contributions $60,000.00 | Net return $-25,100.98 | Net IRR -12.132% | Sales charge $1,600.00 | Deferred sales charge $1,697.91 | Operating expenses $980.49 | Total charges and fees $4,278.40");
  eq("no chart on a loss", pie(down), "(no chart)");
  eq("half a month", rows(calc({ years: "0", months: "0.5" })),
    "Ending value $19,635.98 | Net return $-364.02 | Net IRR -35.651% | Sales charge $400.00 | Operating expenses $4.08 | Total charges and fees $404.08");
  eq("1.5 years", rows(calc({ years: "1.5" })),
    "Ending value $39,139.72 | Total principal $38,000.00 | Total contributions $18,000.00 | Net return $1,139.72 | Net IRR 2.654% | Sales charge $760.00 | Operating expenses $215.30 | Total charges and fees $975.30");
  eq("13 months", rows(calc({ years: "0", months: "13" })),
    "Ending value $33,581.99 | Total principal $33,000.00 | Total contributions $13,000.00 | Net return $581.99 | Net IRR 2.066% | Sales charge $660.00 | Operating expenses $140.76 | Total charges and fees $800.76");
  eq("1000% return", rows(calc({ rate: "1000", years: "1" })),
    "Ending value $259,795.20 | Total principal $32,000.00 | Total contributions $12,000.00 | Net return $227,795.20 | Net IRR 976.079% | Sales charge $640.00 | Operating expenses $476.91 | Total charges and fees $1,116.91");
  eq("negative investment (allowed)", rows(calc({ investment: "-20000" })),
    "Ending value $41,226.76 | Total principal $40,000.00 | Total contributions $60,000.00 | Net return $1,226.76 | Sales charge $800.00 | Operating expenses $229.70 | Total charges and fees $1,029.70");
  eq("zero return, no fees", pie(calc({ rate: "0", sales: "0", operating: "0" })), "Initial investment $20,000.00 / Total contributions $60,000.00");
  ok("IRR shown at 223 years", calc({ years: "223" }).show.irr);
  ok("IRR hidden at 224 years (reference solver limit)", !calc({ years: "224" }).show.irr);
  ok("IRR still solvable at 250 years without contributions", calc({ years: "250", monthly: "0" }).show.irr);
  eq("IRR at 250 years", calc({ years: "250", monthly: "0" }).irr.toFixed(3), "4.492");
  ok("IRR hidden at 100 years / 20%", !calc({ years: "100", rate: "20" }).show.irr);
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation (reference order)
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  const all = (v) => Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, v]));
  eq("all invalid", errs(all("x")),
    "Please provide a positive investment amount. | Please provide a positive annual contribution amount. | Please provide a positive monthly contribution amount. | Please provide a positive rate of return value. | Please provide a positive holding years value. | Please provide a positive holding months value. | Please provide a reasonable sales charge value. | Please provide a reasonable deferred sales charge value. | Please provide a reasonable operating expenses value.");
  eq("all blank", errs(all("")), "Please provide a positive investment amount. | Please provide a positive rate of return value.");
  eq("all -1 (investment and rate may be negative)", errs(all("-1")),
    "Please provide a positive annual contribution amount. | Please provide a positive monthly contribution amount. | Please provide a positive holding years value. | Please provide a positive holding months value. | Please provide a reasonable sales charge value. | Please provide a reasonable deferred sales charge value. | Please provide a reasonable operating expenses value.");
  eq("zero length", errs({ years: "0", months: "0" }), "Please provide a positive investment length value.");
  eq("rate -100", errs({ rate: "-100" }), "Please provide a positive rate of return value.");
  eq("rate -99.9 ok", errs({ rate: "-99.9" }), "");
  eq("rate 1000 ok", errs({ rate: "1000" }), "");
  eq("rate 1000.01", errs({ rate: "1000.01" }), "Please provide a positive rate of return value.");
  eq("sales 100", errs({ sales: "100" }), "Please provide a reasonable sales charge value.");
  eq("sales 99.99 ok", errs({ sales: "99.99" }), "");
  eq("deferred 100", errs({ deferred: "100" }), "Please provide a reasonable deferred sales charge value.");
  eq("operating 100", errs({ operating: "100" }), "Please provide a reasonable operating expenses value.");
  eq("years 1000 ok", errs({ years: "1000" }), "");
  eq("years 1000.01", errs({ years: "1000.01" }), "Please provide a positive holding years value.");
  eq("months 10000 ok", errs({ years: "0", months: "10000" }), "");
  eq("months 10000.01", errs({ years: "0", months: "10000.01" }), "Please provide a positive holding months value.");
  eq("999 years + 12 months ok", errs({ years: "999", months: "12" }), "");
  eq("over 1000 years combined", errs({ years: "999", months: "13" }), "Please provide a reasonable investment length value.");
  eq("1000 years + 0.01 months", errs({ years: "1000", months: "0.01" }), "Please provide a reasonable investment length value.");
  eq("combined check waits for valid fields", errs({ years: "1000", months: "x" }), "Please provide a positive holding months value.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
