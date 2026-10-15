// Plain-Node test suite for the Payback Period Calculator engine.
// Run with:
//   node scripts/payback-period-calculator.test.js
//
// Expected figures were read from the LIVE reference
// (calculator.net/payback-period-calculator.html) via plain GET requests.
// Irregular cash flows and fixed cash flows without growth match the
// reference exactly (random comparisons: 344/360 identical, the rest odd IRR
// edge cases). With a cash flow change rate, this engine uses the exact
// growing-annuity formulas; the reference's own figures differ slightly there
// (e.g. 3.144/3.943 years vs 3.159/3.919 for its default example).

import { calculateFixedCashFlow, calculateIrregularCashFlow, FIXED_DEFAULTS, IRREGULAR_DEFAULTS } from "../src/utils/paybackPeriodCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const fixed = (o = {}) => calculateFixedCashFlow({ ...FIXED_DEFAULTS, direction: "increase", ...o });
const irregular = (o = {}) => calculateIrregularCashFlow({ ...IRREGULAR_DEFAULTS, ...o });
const lines = (r) => r.lines.map((l) => l.text || `${l.label}: ${l.value}`).join(" | ");
const row = (r, i) => { const x = r.rows[i]; return `${x.label} ${x.cash} ${x.net} ${x.disc} ${x.netDisc}`; };

// ── Fixed, no growth (exact on the reference) ──
{
  const r = fixed({ changeRate: "0" });
  eq("level cash flow", lines(r), "Payback Period: 3.333 years | Discounted Payback Period: 4.254 years | Cash Flow Return Rate: 15.24% per year");
  eq("level row 4", row(r, 4), "Year 4 $30,000.00 $20,000.00 $20,490.40 $-4,904.04");
}
eq("10 years", lines(fixed({ changeRate: "0", years: "10" })).split(" | ")[2], "Cash Flow Return Rate: 27.32% per year");
eq("never at 10%", lines(fixed({ cashFlow: "9000", changeRate: "0" })), "Payback Period: 11.111 years | The investment will never be paidback at the discount rate of 10%. | Cash Flow Return Rate: -21.83% per year");
eq("negative cash flow", lines(fixed({ cashFlow: "-1000" })).split(" | ").slice(0, 2).join(" | "), "The investment will never be paidback. | The investment will never be paidback at the discount rate of 10%.");
eq("growing below discount: never", lines(fixed({ cashFlow: "1000" })).split(" | ")[1], "The investment will never be paidback at the discount rate of 10%.");
eq("no discount: no DPP line", fixed({ discountRate: "0" }).lines.some((l) => l.label === "Discounted Payback Period"), false);
eq("no discount: two columns", fixed({ discountRate: "0" }).discounted, false);
eq("years 2.5 uses 2 flows", lines(fixed({ years: "2.5" })).split(" | ")[2], "Cash Flow Return Rate: -26.91% per year");
eq("years 0: no rate", fixed({ years: "0" }).lines.length, 2);
eq("growth = discount", lines(fixed({ changeRate: "10" })).split(" | ")[1], "Discounted Payback Period: 3.667 years");

// ── Fixed with growth (schedule and IRR exact; periods by exact formula) ──
{
  const r = fixed();
  eq("default rows", [1, 2, 3, 4, 5].map((i) => row(r, i)).join(" / "), "Year 1 $30,000.00 $-70,000.00 $27,272.73 $-72,727.27 / Year 2 $31,500.00 $-38,500.00 $26,033.06 $-46,694.21 / Year 3 $33,075.00 $-5,425.00 $24,849.74 $-21,844.48 / Year 4 $34,728.75 $29,303.75 $23,720.20 $1,875.73 / Year 5 $36,465.19 $65,768.94 $22,642.01 $24,517.74");
  eq("default IRR", lines(r).split(" | ")[2], "Cash Flow Return Rate: 18.86% per year");
  eq("default periods (exact formula)", lines(r).split(" | ").slice(0, 2).join(" | "), "Payback Period: 3.159 years | Discounted Payback Period: 3.919 years");
}
eq("decrease table", row(fixed({ direction: "decrease", changeRate: "30", years: "2" }), 2), "Year 2 $21,000.00 $-49,000.00 $17,355.37 $-55,371.90");

// ── Irregular (exact on the reference) ──
{
  const r = irregular();
  eq("irregular default", lines(r), "Payback Period: 3.875 years | Discounted Payback Period: 5.452 years | Cash Flow Return Rate: 10.96% per year");
  eq("irregular row 6", row(r, 6), "Year 6 $10,000.00 $45,000.00 $5,644.74 $3,095.55");
}
eq("never within years", lines(irregular({ flows: ["5000", "25000", "35000"] })),
  "The Investment won't pay back in 3 years. Average payback is $21,666.67/year in the first 3 years. If continues, the payback period is 4.615 years. | With the discount rate of 10%, the Investment won't pay back in 3 years. Average discounted payback is $17,167.54/year in the first 3 years. If continues, the discounted payback period is 5.825 years. | Cash Flow Return Rate: -15.86% per year");
{
  const r = irregular({ investment: "67247", discountRate: "8.9", flows: ["31711", "23252", "", "19689", "18888", "2069"] });
  eq("blank year spans the step", lines(r).split(" | ")[0], "Payback Period: 3.248 years");
  eq("blank year has no row", r.rows.map((x) => x.label).join(","), "Year 0,Year 1,Year 2,Year 4,Year 5,Year 6");
}
eq("blank counts as zero", lines(irregular({ flows: ["5000", "25000", "", "40000", "30000", "10000"] })).split(" | ")[0], "Payback Period: 5.000 years");
eq("rate echoed as typed", lines(irregular({ discountRate: "9.0", flows: ["5000", "25000", "35000"] })).split(" | ")[1].slice(0, 32), "With the discount rate of 9.0%, ");
eq("discount 0", lines(irregular({ discountRate: "0" })).split(" | ").slice(0, 2).join(" | "), "Payback Period: 3.875 years | Discounted Payback Period: 3.875 years");
eq("negative discount", lines(irregular({ discountRate: "-5" })).split(" | ")[1], "Discounted Payback Period: 3.534 years");
eq("single negative flow IRR", lines(irregular({ flows: ["-50000"] })).split(" | ")[2], "Cash Flow Return Rate: -150.00% per year");

// ── Validation ──
eq("fixed errors", fixed({ investment: "x", cashFlow: "x", changeRate: "x", years: "x", discountRate: "x" }).errors.join(" | "),
  "Please provide a positive initial investment value. | Please provide a numerical cash flow value. | Please provide a numerical cash flow change rate. | Please provide a positive number of years that is 100 or less. | Please provide a numerical discount rate that is 100 or smaller.");
eq("101 years", fixed({ years: "101" }).errors.join(), "Please provide a positive number of years that is 100 or less.");
eq("zero investment", fixed({ investment: "0" }).errors.join(), "Please provide a positive initial investment value.");
eq("irregular errors", irregular({ investment: "x", discountRate: "x", flows: ["x"] }).errors.join(" | "),
  "Please provide a positive initial investment value. | Please provide a numerical discount rate that is 100 or smaller. | Please provide a numerical value for item #1.");
eq("no flows", irregular({ flows: ["", ""] }).errors.join(), "Please provide at least one year of cash flow.");
eq("discount over 100", irregular({ discountRate: "101" }).errors.join(), "Please provide a numerical discount rate that is 100 or smaller.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
