// Plain-Node test suite for the Lease Calculator engine.
// Run with:
//   node scripts/lease-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/lease-calculator.html) via plain GET requests. A scratch
// comparator also diffed ~400 random scenarios on both tabs: every result
// row, message, pie and error matched, except the solved interest rate on
// the Fixed Pay tab, where the reference's own solver is approximate
// (third-decimal differences in ~30% of cases); this engine solves exactly.

import { calculateLease, formatPiePercent } from "../src/utils/leaseCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const BASE = { mode: "rate", assetValue: "20000", residualValue: "8000", years: "3", months: "0", interestRate: "6", monthlyPay: "400" };
const run = (o = {}) => calculateLease({ ...BASE, ...o });
const view = (r) => (r.errors ? r.errors.join(" | ") : r.message ? r.message
  : [`${r.headline.label} ${r.headline.value}`, ...r.rows.map((x) => `${x.label} ${x.value}`)].join(" / "));
const pie = (r) => (r.pie ? r.pie.map((p) => `${p.label} ${p.value.toFixed(2)} ${formatPiePercent(p.percent)}`).join(", ") : "none");

// ── Screenshots ──
eq("fixed rate", view(run()), "Monthly Pay $405.06 / Total of 36 Monthly Payments $14,582.28 / Total Interest $2,582.28");
eq("fixed rate pie", pie(run()), "Principal 12000.00 82%, Interest 2582.28 18%");
eq("fixed pay", view(run({ mode: "pay" })), "Interest/Return Rate 5.581% / Total of 36 Monthly Payments $14,400.00 / Total Interest $2,400.00");
eq("fixed pay pie", pie(run({ mode: "pay" })), "Principal 12000.00 83%, Interest 2400.00 17%");

// ── Terms, rates, residuals ──
eq("months only", view(run({ years: "0", months: "7" })).split(" / ")[0], "Monthly Pay $1,788.74");
eq("fractional years", view(run({ years: "2.5" })).split(" / ")[1], "Total of 30 Monthly Payments $14,152.41");
eq("fractional months", view(run({ years: "0", months: "6.5", assetValue: "60000" })).split(" / ")[1], "Total of 6.5 Monthly Payments $53,239.46");
eq("blank years", view(run({ years: "", months: "6" })).split(" / ")[0], "Monthly Pay $2,075.15");
eq("0%", view(run({ interestRate: "0" })), "Monthly Pay $333.33 / Total of 36 Monthly Payments $12,000.00 / Total Interest $0.00");
eq("residual above value", view(run({ residualValue: "25000" })), "Monthly Pay $-27.11 / Total of 36 Monthly Payments $-975.95 / Total Interest $4,024.05");
eq("negative pie percents", pie(run({ residualValue: "25000" })), "Principal -5000.00 512%, Interest 4024.05 -412%");
eq("zero asset value allowed", view(run({ assetValue: "0" })).split(" / ")[0], "Monthly Pay $-203.38");
eq("commas", view(run({ assetValue: "20,000" })).split(" / ")[0], "Monthly Pay $405.06");

// ── Fixed Pay edge cases ──
eq("payment too low", view(run({ mode: "pay", monthlyPay: "300" })), "With this monthly payment, the interest/return rate is negative.");
eq("payment exactly covers principal", view(run({ mode: "pay", years: "2.5" })), "With this monthly payment, the interest/return rate is 0%.");
eq("just above zero", view(run({ mode: "pay", monthlyPay: "333.34" })).split(" / ")[0], "Interest/Return Rate 0.001%");
eq("rate with a residual above the value", view(run({ mode: "pay", residualValue: "25000", monthlyPay: "10" })).split(" / ")[0], "Interest/Return Rate 8.001%");
eq("no positive rate: empty", run({ mode: "pay", assetValue: "0", years: "0", months: "6.5", monthlyPay: "150" }).empty, true);

// ── The pie rule (reference quirk) ──
eq("pie hidden at 400/month", pie(run({ assetValue: "22400" })), "none");
eq("pie shown just under", pie(run({ assetValue: "22399.99" })) !== "none", true);
eq("pie follows the Monthly Payment box", pie(run({ assetValue: "35000.5", years: "4", interestRate: "15", monthlyPay: "750.25" })) !== "none", true);
eq("pie hidden for a short term", pie(run({ years: "0", months: "7" })), "none");
eq("pie with zero total", pie(run({ assetValue: "0", residualValue: "0", interestRate: "0" })), "Principal 0.00 0%, Interest 0.00 0%");

// ── Validation ──
eq("three errors", view(run({ assetValue: "x", residualValue: "x", interestRate: "x" })), "Please provide a positive lease product/property value. | Please provide a positive residual value. | Please provide a positive interest value.");
eq("blank asset", view(run({ assetValue: "" })), "Please provide a positive lease product/property value.");
eq("zero term", view(run({ years: "0", months: "0" })), "Please provide a positive lease term value.");
eq("bad month", view(run({ months: "x" })), "Please provide a positive lease month value.");
eq("monthly pay", view(run({ mode: "pay", monthlyPay: "0" })), "Please provide a positive monthly pay value.");
eq("rate ignored on Fixed Pay", run({ mode: "pay", interestRate: "x" }).errors, undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
