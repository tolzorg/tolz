// Plain-Node test suite for the Margin Calculator engine.
// Run with:
//   node scripts/margin-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/margin-calculator.html) via plain GET requests (sending
// all of a form's fields — an omitted one falls back to the page default).
// A scratch comparator also diffed 39 hand-picked cases and 600 random
// scenarios across all three calculators: all identical, pie included.

import { calculateProfitMargin, calculateStockMargin, calculateCurrencyMargin, formatMoney } from "../src/utils/marginCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

const pm = (cost, revenue, margin, profit) => calculateProfitMargin({ cost, revenue, margin, profit });
const show = (r) => (r.errors ? r.errors.join(" | ") : r.empty ? "EMPTY"
  : r.rows.map((x) => `${x.strong ? "*" : ""}${x.label}: ${x.value}`).join(" / ") + (r.pie ? ` / pie ${r.pie.map((s) => `${s.label} ${formatMoney(s.value)} ${s.percent}%`).join(", ")}` : " / no pie"));

// ─────────────────────────────────────────────────────────────────
// 1. Profit Margin
// ─────────────────────────────────────────────────────────────────
{
  const pie = " / pie Cost $120.00 75%, Profit margin $40.00 25%";
  eq("cost + revenue (screenshot)", show(pm("120", "160", "", "")), "*Margin: 25.00% / Profit: $40.00 / Markup: 33.33%" + pie);
  eq("cost + margin", show(pm("120", "", "25", "")), "Revenue: $160.00 / Profit: $40.00 / Markup: 33.33%" + pie);
  eq("cost + profit", show(pm("120", "", "", "40")), "*Margin: 25.00% / Revenue: $160.00 / Markup: 33.33%" + pie);
  eq("revenue + margin", show(pm("", "160", "25", "")), "Cost: $120.00 / Profit: $40.00 / Markup: 33.33%" + pie);
  eq("revenue + profit", show(pm("", "160", "", "40")), "*Margin: 25.00% / Cost: $120.00 / Markup: 33.33%" + pie);
  eq("margin + profit", show(pm("", "", "25", "40")), "Cost: $120.00 / Revenue: $160.00 / Markup: 33.33%" + pie);

  eq("priority: cost + margin beats cost + profit", show(pm("120", "", "25", "50")).split(" / ")[0], "Revenue: $160.00");
  eq("priority: revenue + profit beats revenue + margin", show(pm("", "160", "25", "50")).split(" / ")[0], "*Margin: 31.25%");
  eq("priority: cost + revenue first", show(pm("120", "160", "50", "99")).split(" / ")[0], "*Margin: 25.00%");
  eq("pie percents round half-up", show(pm("100", "160", "", "")).split(" / pie ")[1], "Cost $100.00 63%, Profit margin $60.00 38%");

  eq("loss: no pie", show(pm("200", "160", "", "")), "*Margin: -25.00% / Profit: $-40.00 / Markup: -20.00% / no pie");
  eq("negative margin allowed", show(pm("120", "", "-20", "")), "Revenue: $100.00 / Profit: $-20.00 / Markup: -16.67% / no pie");
  eq("profit above revenue", show(pm("", "160", "", "200")), "*Margin: 125.00% / Cost: $-40.00 / Markup: -500.00% / no pie");
  eq("margin 99.99%", show(pm("120", "", "99.99", "")).split(" / ").slice(0, 3).join(" / "), "Revenue: $1,200,000.00 / Profit: $1,199,880.00 / Markup: 999,900.00%");
  eq("0% margin with a profit: empty", show(pm("", "", "0", "40")), "EMPTY");
  eq("zero cost (revenue = profit): empty", show(pm("", "160", "", "160")), "EMPTY");
  eq("commas", show(pm("1,200", "1,600.5", "", "")).split(" / ")[0], "*Margin: 25.02%");
  eq("big numbers", show(pm("1234567.891", "9876543.21", "", "")).split(" / ").slice(0, 2).join(" / "), "*Margin: 87.50% / Profit: $8,641,975.32");

  eq("all field errors in order", show(pm("x", "-1", "y", "z")),
    "Please provide a positive cost value. | Please provide a positive revenue value. | Please provide a numerical margin value. | Please provide a numerical profit value.");
  eq("revenue must be > 0", show(pm("120", "0", "", "")), "Please provide a positive revenue value.");
  eq("profit must be > 0", show(pm("120", "", "", "0")), "Please provide a numerical profit value.");
  eq("margin must be below 100%", show(pm("120", "", "100", "")), "This calculator can only handle a margin below 100%.");
  eq("one value", show(pm("120", "", "", "")), "Please provide two values.");
  eq("bad single value", show(pm("x", "", "", "")), "Please provide a positive cost value. | Please provide two values.");
}

// ─────────────────────────────────────────────────────────────────
// 2. Stock Trading Margin
// ─────────────────────────────────────────────────────────────────
{
  const st = (price, shares, requirement) => { const r = calculateStockMargin({ price, shares, requirement }); return r.errors ? r.errors.join(" | ") : r.amount; };
  eq("screenshot", st("18.3", "100", "30"), "$549.00");
  eq("fractional shares, half-up", st("18.3", "1.5", "30"), "$8.24");
  eq("tiny amount rounds up", st("0.005", "1", "100"), "$0.01");
  eq("requirement above 100% allowed", st("18.3", "100", "150"), "$2,745.00");
  eq("zeros allowed", st("0", "100", "30"), "$0.00");
  eq("commas", st("1,234.567", "1,000", "33.333"), "$411,518.22");
  eq("errors", st("x", "", "-5"), "Please provide a positive stock price value. | Please provide a positive number of shares value. | Please provide a positive margin requirement value.");
}

// ─────────────────────────────────────────────────────────────────
// 3. Currency Exchange Margin
// ─────────────────────────────────────────────────────────────────
{
  const cx = (rate, ratio, units) => { const r = calculateCurrencyMargin({ rate, ratio, units }); return r.errors ? r.errors.join(" | ") : r.amount; };
  eq("screenshot", cx("1.3", "20", "100"), "6.500");
  eq("1:1", cx("1.3", "1", "100"), "130.000");
  eq("3 decimals, half-up", cx("1.3", "20", "1.5"), "0.098");
  eq("grouping", cx("1000000", "1", "1000"), "1,000,000,000.000");
  eq("commas in units", cx("1.23456", "30", "1,000"), "41.152");
  eq("errors", cx("x", "20", ""), "Please provide a positive exchange rate value. | Please provide a positive units value.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
