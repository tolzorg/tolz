// Plain-Node test suite for the VAT Calculator engine. Run with:
//   node scripts/vat-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/vat-calculator.html) via plain GET requests — the form
// submits GET to the same server-rendered page.

import { calculateVat } from "../src/utils/vatCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}
const calc = (o) => calculateVat({ rate: "", net: "", gross: "", tax: "", ...o });
/** The result box text plus pie labels, the way the reference shows them. */
function show(o) {
  const r = calc(o);
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  if (r.resultError) return `BOX ${r.resultError}`;
  if (r.empty) return "EMPTY";
  return `${r.solved.map((x) => `${x.label}: ${x.text}`).join(" ")} | pie ${r.pieLabels.join(" ")}`;
}

// ─────────────────────────────────────────────────────────────────
// 1. Every pair, plus the screenshot's priority case
// ─────────────────────────────────────────────────────────────────
eq("rate + net", show({ rate: "20", net: "1200" }), "Gross price: 1,440 Tax amount: 240 | pie 1,200 240");
eq("rate + gross", show({ rate: "20", gross: "1440" }), "Net price: 1,200 Tax amount: 240 | pie 1,200 240");
eq("rate + tax", show({ rate: "20", tax: "240" }), "Net price: 1,200 Gross price: 1,440 | pie 1,200 240");
eq("net + gross", show({ net: "1200", gross: "1440" }), "VAT rate: 20% Tax amount: 240 | pie 1,200 240");
eq("net + tax", show({ net: "1200", tax: "240" }), "VAT rate: 20% Gross price: 1,440 | pie 1,200 240");
eq("gross + tax", show({ gross: "1440", tax: "240" }), "VAT rate: 20% Net price: 1,200 | pie 1,200 240");
eq("screenshot: all four filled → rate + net wins", show({ rate: "20", net: "1292", gross: "34", tax: "21" }),
  "Gross price: 1,550.4 Tax amount: 258.4 | pie 1,292.00 258.40");
eq("rate + gross beats tax", show({ rate: "20", gross: "1440", tax: "5" }), "Net price: 1,200 Tax amount: 240 | pie 1,200 240");
eq("rate + net beats gross", show({ rate: "20", net: "1200", gross: "1500" }), "Gross price: 1,440 Tax amount: 240 | pie 1,200 240");
eq("net + gross beats tax", show({ net: "1200", gross: "1500", tax: "21" }), "VAT rate: 25% Tax amount: 300 | pie 1,200 300");

// ─────────────────────────────────────────────────────────────────
// 2. Rounding and the pie labels' raw-value decimal rule
// ─────────────────────────────────────────────────────────────────
eq("7.5% of 33.33", show({ rate: "7.5", net: "33.33" }).split(" | ")[0], "Gross price: 35.83 Tax amount: 2.5");
eq("17% from gross 100", show({ rate: "17", gross: "100" }).split(" | ")[0], "Net price: 85.47 Tax amount: 14.53");
eq("rate 33.33%", show({ net: "3", gross: "4" }).split(" | ")[0], "VAT rate: 33.33% Tax amount: 1");
eq("big numbers", show({ rate: "20", net: "1234567.891" }).split(" | ")[0], "Gross price: 1,481,481.47 Tax amount: 246,913.58");
eq("commas in input", show({ rate: "20", net: "1,200" }), "Gross price: 1,440 Tax amount: 240 | pie 1,200 240");
eq("100 at 7%: tax = 100 × 0.07 = 7.000000000000001", show({ rate: "7", net: "100" }).split(" | ")[1], "pie 100.00 7.00");
eq("100 at 10%: tax exactly 10", show({ rate: "10", net: "100" }).split(" | ")[1], "pie 100 10");
eq("100 at 15%: tax exactly 15", show({ rate: "15", net: "100" }).split(" | ")[1], "pie 100 15");
eq("gross 107 at 7%: net exactly 100", show({ rate: "7", gross: "107" }).split(" | ")[1], "pie 100 7");
eq("gross 535 at 7%: net 499.999…", show({ rate: "7", gross: "535" }).split(" | ")[1], "pie 500.00 35.00");
eq("gross 135 at 8%", show({ rate: "8", gross: "135" }).split(" | ")[1], "pie 125.00 10.00");
eq("tax 21 at 7%: net = 21 × 100 ÷ 7 = 300", show({ rate: "7", tax: "21" }).split(" | ")[1], "pie 300 21");
eq("gross 6108 at 25.99%", show({ rate: "25.99", gross: "6108", tax: "554" }).split(" | ")[1], "pie 4,848.00 1,260.00");

// ─────────────────────────────────────────────────────────────────
// 3. Zeros, result-box errors, validation
// ─────────────────────────────────────────────────────────────────
eq("0% rate", show({ rate: "0", net: "100" }), "Gross price: 100 Tax amount: 0 | pie 100 0");
eq("net = gross", show({ net: "100", gross: "100" }), "VAT rate: 0% Tax amount: 0 | pie 100 0");
eq("tax 0 at 20%", show({ rate: "20", tax: "0" }), "Net price: 0 Gross price: 0 | pie 0 0");
eq("gross with zero tax", show({ gross: "100", tax: "0" }), "VAT rate: 0% Net price: 100 | pie 100 0");
eq("rate 0 + tax: unsolvable", show({ rate: "0", tax: "5" }), "EMPTY");
eq("rate 1000%", show({ rate: "1000", net: "100" }), "Gross price: 1,100 Tax amount: 1,000 | pie 100 1,000");
eq("gross < net", show({ net: "100", gross: "90" }), "BOX The gross price cannot be smaller than The net price.");
eq("gross 0 < net", show({ net: "100", gross: "0" }), "BOX The gross price cannot be smaller than The net price.");
eq("gross = tax", show({ gross: "100", tax: "100" }), "BOX The gross price cannot be smaller than the tax amount.");
eq("gross < tax", show({ gross: "100", tax: "150" }), "BOX The gross price cannot be smaller than the tax amount.");
eq("gross 0 = tax 0", show({ gross: "0", tax: "0" }), "BOX The gross price cannot be smaller than the tax amount.");
eq("one value", show({ rate: "20" }), "ERR Please provide two values to calculate.");
eq("all blank", show({}), "ERR Please provide two values to calculate.");
eq("all invalid", show({ rate: "x", net: "y", gross: "z", tax: "w" }),
  "ERR Please provide a valid VAT rate. | Please provide a valid net price. | Please provide a valid gross price. | Please provide a valid tax amount.");
eq("invalid blocks a solvable pair", show({ rate: "x", net: "100", gross: "120" }), "ERR Please provide a valid VAT rate.");
eq("lone invalid rate", show({ rate: "x" }), "ERR Please provide a valid VAT rate.");
eq("negative rate", show({ rate: "-5", net: "100" }), "ERR Please provide a valid VAT rate.");
eq("net 0", show({ rate: "20", net: "0" }), "ERR Please provide a valid net price.");
eq("negative net", show({ rate: "20", net: "-100" }), "ERR Please provide a valid net price.");
eq("negative gross", show({ rate: "20", gross: "-5" }), "ERR Please provide a valid gross price.");
eq("negative tax", show({ net: "100", tax: "-5" }), "ERR Please provide a valid tax amount.");
eq("$ prefix", show({ rate: "20", net: "$100" }), "ERR Please provide a valid net price.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
