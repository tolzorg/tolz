// Plain-Node test suite for the Rent vs. Buy Calculator engine.
// Run with:
//   node scripts/rent-vs-buy-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/rent-vs-buy-calculator.html) via plain GET requests. A
// scratch comparator also diffed 270 random scenarios: all 270 thirty-year
// tables were identical; the break-even sentence matched in 262 — the others
// break even within the first year, where the reference's "year 0" rule could
// only be approximated (12 × price × buying+selling % against the first
// year's rent fits 148 of 163 such cases).

import { calculateRentVsBuy, RVB_DEFAULTS } from "../src/utils/rentVsBuyCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const rvb = (o = {}) => calculateRentVsBuy({ ...RVB_DEFAULTS, filingStatus: "MarriedJoint", ...o });
const row = (r, y) => { const x = r.table[y - 1]; return `${x.buyMonthly} ${x.buyAnnual} ${x.rentMonthly} ${x.rentAnnual}`; };

// ── Default example (screenshot) ──
{
  const r = rvb();
  eq("verdict", r.verdict, "Buying is cheaper if you stay for 6.0 years or longer. Otherwise, renting is cheaper.");
  eq("year 1", row(r, 1), "$6,424 $77,092 $3,123 $37,482");
  eq("year 6", row(r, 6), "$3,679 $44,144 $3,678 $44,139");
  eq("year 7", row(r, 7), "$3,672 $44,066 $3,802 $45,625");
  eq("year 27 (gains tax)", row(r, 27), "$5,556 $66,674 $7,388 $88,655");
  eq("year 30 (final loan year)", row(r, 30), "$5,955 $71,460 $8,164 $97,965");
  eq("shading", `${r.table[5].buyCheaper} ${r.table[6].buyCheaper}`, "false true");
  eq("30 rows", r.table.length, 30);
}

// ── Rent side ──
const rentOnly = { rentIncrease: "0", rentInsurance: "0", deposit: "0", upfront: "0", investReturn: "0" };
eq("flat rent", row(rvb(rentOnly), 2).split(" ").slice(2).join(" "), "$3,000 $36,000");
eq("after-tax return 3.75%", row(rvb({ ...rentOnly, investReturn: "5" }), 2).split(" ").slice(2).join(" "), "$3,056 $36,675");
eq("rent increase from year 1", row(rvb({ ...rentOnly, rentIncrease: "3" }), 1).split(" ").slice(2).join(" "), "$3,090 $37,080");
eq("deposit lost return", row(rvb({ ...rentOnly, rent: "0", deposit: "10000", investReturn: "10", federalTax: "0" }), 2).split(" ").slice(2).join(" "), "$88 $1,050");
eq("upfront compounded", row(rvb({ ...rentOnly, rent: "0", upfront: "1000", investReturn: "10", federalTax: "0" }), 2).split(" ").slice(2).join(" "), "$50 $605");

// ── Buy side ──
const bare = { price: "100000", downPayment: "100", buyClosing: "0", propertyTax: "0", propertyTaxIncrease: "0", insurance: "0", hoa: "0", maintenance: "0", appreciation: "0", costIncrease: "0", sellClosing: "0", investReturn: "0" };
eq("nothing to pay", row(rvb(bare), 1).split(" ").slice(0, 2).join(" "), "$0 $0");
eq("appreciation", row(rvb({ ...bare, appreciation: "3" }), 2).split(" ")[1], "$-3,045");
eq("maintenance on value", row(rvb({ ...bare, maintenance: "1", appreciation: "10" }), 1).split(" ")[1], "$-8,900");
eq("lost return on cash", row(rvb({ ...bare, investReturn: "10", federalTax: "0" }), 2).split(" ")[1], "$10,500");
const loan = { ...bare, downPayment: "0", rate: "6" };
eq("interest below threshold", row(rvb({ ...loan, federalTax: "25" }), 1).split(" ")[1], "$5,967");
eq("deduction over $15,000", row(rvb({ ...loan, price: "1000000", federalTax: "25" }), 1).split(" ")[1], "$48,508");
eq("head of household $22,500", row(rvb({ ...loan, price: "500000", federalTax: "25", filingStatus: "HeadofHousehold" }), 1).split(" ")[1], "$28,004");
eq("property tax, no SALT cap", row(rvb({ ...bare, price: "2000000", propertyTax: "2", federalTax: "25" }), 1).split(" ")[1], "$33,750");
eq("10-year loan deduction", row(rvb({ ...loan, price: "10000000", years: "10", federalTax: "25" }), 1).split(" ")[1], "$438,919");

// ── Verdicts ──
eq("renting always", rvb({ rent: "2000", rentIncrease: "0" }).verdict, "Renting is cheaper in the next 30 years.");
eq("first-year crossing", rvb({ rent: "20000" }).verdict, "Buying is cheaper if you stay for 0.6 years or longer. Otherwise, renting is cheaper.");
eq("reference quirk at huge rent", rvb({ rent: "50000" }).verdict, "Renting is cheaper in the next 30 years.");
eq("rent 3500", rvb({ rent: "3500", rentIncrease: "0" }).verdict, "Buying is cheaper if you stay for 4.6 years or longer. Otherwise, renting is cheaper.");
eq("fractional term", rvb({ years: "10.3" }).verdict, "Buying is cheaper if you stay for 5.2 years or longer. Otherwise, renting is cheaper.");

// ── Validation ──
eq("term under 2", rvb({ years: "1.99" }).errors.join(), "Please provide a positive loan term.");
eq("down over 100", rvb({ downPayment: "100.1" }).errors.join(), "Please provide a down payment percentage between 0 and 100.");
eq("negative increases allowed", rvb({ appreciation: "-5", rentIncrease: "-2", propertyTaxIncrease: "-1", costIncrease: "-1" }).errors, undefined);
eq("negative return", rvb({ investReturn: "-1" }).errors.join(), "Please provide a positive average investment return rate.");
eq("all fields", rvb(Object.fromEntries(Object.keys(RVB_DEFAULTS).map((k) => [k, "x"]))).errors.length, 21);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
