// Plain-Node test suite for the CD Calculator engine. Run with:
//   node scripts/cd-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/cd-calculator.html) via plain GET requests — the form
// submits GET to the same server-rendered page.

import { calculateCd, DEFAULTS, formatMoney } from "../src/utils/cdCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (over = {}) => calculateCd({ ...DEFAULTS, compound: "annually", ...over });
const row = (r, tax) => [r.period, formatMoney(r.deposit), formatMoney(r.interest), ...(tax ? [formatMoney(r.tax)] : []), formatMoney(r.balance)].join(" ");
const head = (r) => [r.endBalance, r.totalInterest, ...(r.hasTax ? [r.totalTax, r.interestAfterTax] : [])].map(formatMoney).join(" ");

// ─────────────────────────────────────────────────────────────────
// 1. Default scenario (the reference screenshot)
// ─────────────────────────────────────────────────────────────────
{
  const r = calc();
  eq("default headline", head(r), "$11,576.25 $1,576.25");
  eq("no footnote for annual", r.footnote, null);
  eq("annual rows", r.schedule.annual.map((x) => row(x)).join(" | "),
    "1 $10,000.00 $500.00 $10,500.00 | 2 $0.00 $525.00 $11,025.00 | 3 $0.00 $551.25 $11,576.25");
  eq("monthly row 1 (EAR-bridged rate)", row(r.schedule.monthly[0]), "1 $10,000.00 $40.74 $10,040.74");
  eq("monthly row 13", row(r.schedule.monthly[12]), "13 $0.00 $42.78 $10,542.78");
  eq("monthly row 36", row(r.schedule.monthly[35]), "36 $0.00 $46.97 $11,576.25");
  eq("pie", r.pie.map((s) => `${s.label} ${formatMoney(s.value)}`).join(" / "), "Initial deposit $10,000.00 / Interest $1,576.25");
  ok("charts shown", r.showCharts && r.barUnit === "Year" && r.bars.length === 3);
}

// ─────────────────────────────────────────────────────────────────
// 2. Compounding, tax and partial years
// ─────────────────────────────────────────────────────────────────
{
  let r = calc({ tax: "25" });
  eq("tax headline", head(r), "$11,160.92 $1,547.90 $386.97 $1,160.92");
  eq("tax monthly row 1", row(r.schedule.monthly[0], true), "1 $10,000.00 $40.74 $10.19 $10,030.56");
  eq("tax annual row 1", row(r.schedule.annual[0], true), "1 $10,000.00 $497.20 $124.30 $10,372.90");
  eq("tax pie labels", r.pie.map((s) => s.label).join(" / "), "Initial deposit / Interest after tax / Tax");

  r = calc({ compound: "monthly" });
  eq("monthly headline", head(r), "$11,614.72 $1,614.72");
  eq("monthly footnote", r.footnote, "* interest rate of 5% compound monthly is equivalent to annual rate of 5.116%");
  eq("monthly annual row 2", row(r.schedule.annual[1]), "2 $0.00 $537.79 $11,049.41");

  r = calc({ compound: "continuously" });
  eq("continuous headline", head(r), "$11,618.34 $1,618.34");
  eq("continuous footnote", r.footnote, "* interest rate of 5% compound continuously is equivalent to annual rate of 5.127%");

  r = calc({ compound: "quarterly", years: "2", months: "5" });
  eq("2y5m quarterly", head(r), "$11,275.92 $1,275.92");
  eq("partial final year row", row(r.schedule.annual[2]), "3 $0.00 $231.06 $11,275.92");
  eq("2y5m monthly rows", r.schedule.monthly.length, 29);

  r = calc({ compound: "semiannually", years: "0", months: "7", tax: "10" });
  eq("7 months semiannual taxed", head(r), "$10,262.72 $291.91 $29.19 $262.72");
  ok("≤ 12 months: monthly only", r.schedule.monthlyOnly && r.schedule.annual === null && r.barUnit === "Month");

  eq("rate echoed as typed", calc({ rate: "5.50", compound: "monthly", years: "1" }).footnote,
    "* interest rate of 5.50% compound monthly is equivalent to annual rate of 5.641%");
  eq("rate 0 footnote", calc({ rate: "0", compound: "monthly", years: "2" }).footnote,
    "* interest rate of 0% compound monthly is equivalent to annual rate of 0.000%");
  eq("1.5 years", head(calc({ years: "1.5" })), "$10,759.30 $759.30");
  eq("1 year 2.5 months", head(calc({ years: "1", months: "2.5" })), "$10,607.27 $607.27");
  eq("months over 12 allowed", head(calc({ years: "1", months: "15" })), "$11,160.30 $1,160.30");
  eq("blank years counts as 0", head(calc({ years: "", months: "6" })), "$10,246.95 $246.95");
  eq("commas accepted", head(calc({ deposit: "10,000" })), "$11,576.25 $1,576.25");
  eq("100% tax", head(calc({ tax: "100" })), "$10,000.00 $1,466.68 $1,466.68 $0.00");
  eq("101 years still computes", head(calc({ years: "101" })), "$1,380,763.21 $1,370,763.21");
}

// The half-cent case on its own (true value $89,544.495; reference rounds up).
{
  const r = calculateCd({ deposit: "85894", rate: "8.5", compound: "semiannually", years: "3", months: "3", tax: "0" });
  eq("half-cent row 6", row(r.schedule.monthly[5]), "6 $0.00 $619.02 $89,544.50");
}

// ─────────────────────────────────────────────────────────────────
// 3. Visibility rules
// ─────────────────────────────────────────────────────────────────
{
  const vis = (over) => { const r = calc(over); return `${r.schedule ? (r.schedule.monthlyOnly ? "monthly" : "both") : "none"}/${r.showCharts ? "charts" : "-"}`; };
  eq("1 month: no schedule", vis({ years: "0", months: "1" }), "none/charts");
  eq("0.5 month: no schedule", vis({ years: "0", months: "0.5" }), "none/charts");
  eq("1.5 months: monthly", vis({ years: "0", months: "1.5" }), "monthly/charts");
  eq("12 months: monthly only", vis({ years: "0", months: "12" }), "monthly/charts");
  eq("1 year: monthly only", vis({ years: "1" }), "monthly/charts");
  eq("13 months: both", vis({ years: "0", months: "13" }), "both/charts");
  eq("100 years: both", vis({ years: "100" }), "both/charts");
  eq("100.5 years: none", vis({ years: "100.5" }), "none/charts");
  eq("negative deposit: no charts", vis({ deposit: "-10000" }), "both/-");
  eq("zero deposit: no charts", vis({ deposit: "0" }), "both/-");
  eq("negative deposit computed", head(calc({ deposit: "-10000" })), "$-11,576.25 $-1,576.25");
  eq("rate 0", head(calc({ rate: "0" })), "$10,000.00 $0.00");
}

// ─────────────────────────────────────────────────────────────────
// 4. Validation (reference order: deposit, rate, years, months, tax)
// ─────────────────────────────────────────────────────────────────
{
  const errs = (over) => (calc(over).errors || []).join(" | ");
  eq("all invalid", errs({ deposit: "x", rate: "x", years: "x", months: "x", tax: "x" }),
    "Please provide a positive initial deposit amount. | Please provide a positive interest rate value. | Please provide a positive holding years value. | Please provide a positive holding months value. | Please provide a positive tax rate value.");
  eq("length error suppressed while others fail", errs({ deposit: "x", rate: "x", years: "0", months: "0", tax: "x" }),
    "Please provide a positive initial deposit amount. | Please provide a positive interest rate value. | Please provide a positive tax rate value.");
  eq("zero length", errs({ years: "0", months: "0" }), "Please provide a positive deposit length value.");
  eq("blank length", errs({ years: "", months: "" }), "Please provide a positive deposit length value.");
  eq("blank deposit", errs({ deposit: "" }), "Please provide a positive initial deposit amount.");
  eq("$ prefix", errs({ deposit: "$10000" }), "Please provide a positive initial deposit amount.");
  eq("negative rate", errs({ rate: "-5" }), "Please provide a positive interest rate value.");
  eq("negative years", errs({ years: "-1" }), "Please provide a positive holding years value.");
  eq("negative months", errs({ years: "1", months: "-3" }), "Please provide a positive holding months value.");
  eq("years 1000 ok", errs({ years: "1000" }), "");
  eq("years 1000.01", errs({ years: "1000.01" }), "Please provide a positive holding years value.");
  eq("months 1000 ok", errs({ years: "0", months: "1000" }), "");
  eq("months 1000.01", errs({ years: "0", months: "1000.01" }), "Please provide a positive holding months value.");
  eq("1000 years + 1000 months ok", errs({ years: "1000", months: "1000" }), "");
  eq("tax over 100", errs({ tax: "101" }), "Please provide a positive tax rate value.");
  eq("negative tax", errs({ tax: "-5" }), "Please provide a positive tax rate value.");
  eq("blank tax", errs({ tax: "" }), "Please provide a positive tax rate value.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
