// Plain-Node test suite for the Discount Calculator engine.
// Run with:
//   node scripts/discount-calculator.test.js
//
// Every expected line below was read from the LIVE reference
// (calculator.net/discount-calculator.html) via plain GET requests (sending
// every field — an omitted one falls back to the page default). A scratch
// comparator also diffed 48 hand-picked cases and 800 random scenarios
// across both discount types: all identical.

import { calculateDiscount } from "../src/utils/discountCalculatorEngine.js";

let passed = 0;
let failed = 0;

function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (before, discount, after, saved, type = "percent") => {
  const r = calculateDiscount({ before, discount, after, saved, type });
  return r.errors ? r.errors.join(" | ") : `${r.intro} ${r.rows.map((x) => `${x.label}: ${x.value}`).join(" / ")}`;
};

// ── Percent off: every pair, then priority ──
eq("before + discount (screenshot)", run("59.99", "15", "", ""), "With original price $59.99 and 15% discount, Price after discount: $50.99 / You saved: $9.00");
eq("before + after", run("59.99", "", "50", ""), "With original price $59.99 and after discount price $50, Discount: 16.7% / You saved: $9.99");
eq("before + saved", run("59.99", "", "", "9"), "With original price $59.99 and you saved $9, Discount: 15% / Price after discount: $50.99");
eq("discount + after", run("", "15", "50.99", ""), "With 15% discount and after discount price $50.99, Price before discount: $59.99 / You saved: $9.00");
eq("discount + saved", run("", "15", "", "9"), "With 15% discount and you saved $9, Price before discount: $60.00 / Price after discount: $51.00");
eq("after + saved", run("", "", "50.99", "9"), "With after discount price $50.99 and you saved $9, Price before discount: $59.99 / Discount: 15%");
eq("priority: before + discount first", run("59.99", "15", "50", "9"), run("59.99", "15", "", ""));
eq("priority: before + after beats before + saved", run("59.99", "", "50", "9"), run("59.99", "", "50", ""));
eq("priority: discount + after beats discount + saved", run("", "15", "50", "9"), "With 15% discount and after discount price $50, Price before discount: $58.82 / You saved: $8.82");

// ── Discount % format: 1 decimal, one significant digit when small ──
eq("pct 0.2", run("300", "", "299.5", ""), "With original price $300 and after discount price $299.5, Discount: 0.2% / You saved: $0.50");
eq("pct 0.09 (float just under 0.095)", run("100", "", "99.905", "").split(", ")[1], "Discount: 0.09% / You saved: $0.09");
eq("pct 0.1", run("100", "", "99.904", "").split(", ")[1], "Discount: 0.1% / You saved: $0.10");
eq("pct 0.001", run("100", "", "99.999", "").split(", ")[1], "Discount: 0.001% / You saved: $0.00");
eq("pct 0.0001", run("100", "", "99.9999", "").split(", ")[1], "Discount: 0.0001% / You saved: $0.00");
eq("pct below 0.0001 is 0", run("100", "", "99.99994", "").split(", ")[1], "Discount: 0% / You saved: $0.00");
eq("pct 33.35 rounds up", run("100", "", "66.65", "").split(", ")[1], "Discount: 33.4% / You saved: $33.35");
eq("small negative pct is 0", run("100", "", "100.04", "").split(", ")[1], "Discount: 0% / You saved: $-0.04");
eq("negative pct", run("100", "", "100.15", "").split(", ")[1], "Discount: -0.2% / You saved: $-0.15");
eq("grouped pct", run("1", "", "", "12345.678").split(", ")[1], "Discount: 1,234,567.8% / Price after discount: $-12,344.68");

// ── Echo and parsing ──
eq("echo keeps raw text", run("50.00", "15.50", "", ""), "With original price $50.00 and 15.50% discount, Price after discount: $42.25 / You saved: $7.75");
eq("commas stripped", run("1,000", "15", "", "").split(", ")[0], "With original price $1000 and 15% discount");
eq("exponent accepted", run("1e2", "10", "", "").split(", ")[1], "Price after discount: $90.00 / You saved: $10.00");
eq("half-cent rounds up", run("1", "0.5", "", "").split(", ")[1], "Price after discount: $1.00 / You saved: $0.01");
eq("float just under half-cent", run("1.005", "", "", "1").split(", ")[1], "Discount: 99.5% / Price after discount: $0.00");
eq("discount over 100%", run("100", "150", "", "").split(", ")[1], "Price after discount: $-50.00 / You saved: $150.00");

// ── Validation ──
eq("all field errors", run("x", "y", "z", "w"),
  "Please provide a positive price before discount value. | Please provide a positive discount value. | Please provide a positive price after discount value. | Please provide a positive you saved amount.");
eq("zero discount", run("100", "0", "", ""), "Please provide a positive discount value.");
eq("unused bad box still checked", run("59.99", "15", "abc", ""), "Please provide a positive price after discount value.");
eq("one value", run("59.99", "", "", ""), "Please provide 2 values to calculate.");
eq("100% with price after", run("", "100", "50", ""), "Can not calculate with 100% discount.");
eq("hex rejected", run("0x10", "10", "", ""), "Please provide a positive price before discount value.");

// ── Fixed amount off ──
eq("fixed: before + discount (screenshot)", run("59.99", "15", "", "", "fixed"), "With original price $59.99 and $15 discount, Price after discount: $44.99 / Discount percentage: 25%");
eq("fixed: before + after", run("59.99", "", "44.99", "", "fixed"), "With original price $59.99 and after discount price $44.99, Discount amount: $15.00 / Discount percentage: 25%");
eq("fixed: discount + after", run("", "70", "20", "", "fixed"), "With $70 discount and after discount price $20, Price before discount: $90.00 / Discount percentage: 77.8%");
eq("fixed: saved box ignored", run("59.99", "15", "", "xyz", "fixed"), run("59.99", "15", "", "", "fixed"));
eq("fixed: discount above price", run("59.99", "70", "", "", "fixed").split(", ")[1], "Price after discount: $-10.01 / Discount percentage: 116.7%");
eq("fixed: saved does not count as a value", run("59.99", "", "", "9", "fixed"), "Please provide 2 values to calculate.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
