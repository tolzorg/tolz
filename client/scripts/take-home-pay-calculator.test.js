// Plain-Node test suite for the Take-Home-Paycheck Calculator engine.
// Run with:
//   node scripts/take-home-pay-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/take-home-pay-calculator.html) via plain GET requests. A
// scratch comparator also diffed 20 hand-picked cases and 240 random
// scenarios mixing every input (statuses, frequencies, dependents, other
// income, all deduction types, other jobs, state/city tax, age 65,
// self-employment, invalid values): every row, title, note, W-4 block and
// privacy paragraph was identical.

import { calculateTakeHomePay, TAKE_HOME_DEFAULTS, multipleJobsAmount } from "../src/utils/takeHomePayCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const run = (o = {}) => calculateTakeHomePay({ ...TAKE_HOME_DEFAULTS, ...o });
const row = (r, label) => r.rows.find((x) => x.label === label).value;
const fed = (o) => row(run({ payFrequency: "Annual", pretaxDeductions: "0", ...o }), "Federal Income Tax");
const step4b = (o) => run({ payFrequency: "Annual", pretaxDeductions: "0", ...o }).w4.main.b;

// ── Screenshot ──
{
  const r = run();
  eq("title", r.title, "2026 Bi-weekly Paycheck Based on Income of $80,000/year.");
  eq("rows", r.rows.map((x) => x.value).join(" "), "$3,076.92 $234.75 $190.77 $44.62 $0.00 $0.00 $230.77 $2,376.02");
  eq("note", r.note, "based on 52 weeks per year");
  eq("W-4", JSON.stringify(r.w4.main), JSON.stringify({ step3: { children: "$0", others: "$0", total: "$0" }, a: "$0", b: "$0", c: "$0.00" }));
  eq("no privacy paragraph", r.w4.privacy, null);
}

// ── Frequencies and core tax ──
eq("daily", row(run({ payFrequency: "Daily" }), "Final Pay Check"), "$237.60");
eq("daily note", run({ payFrequency: "Daily" }).note, "based on 260 working days per year");
eq("semi-monthly", row(run({ payFrequency: "Semi-monthly" }), "Federal Income Tax"), "$254.32");
eq("monthly has no note", run({ payFrequency: "Monthly" }).note, null);
eq("title says Annual", run({ payFrequency: "Annual" }).title, "2026 Annual Paycheck Based on Income of $80,000/year.");
eq("FICA comes off taxable income", fed({ salary: "30000" }), "$1,160.50");
eq("Social Security cap", row(run({ payFrequency: "Annual", salary: "300000" }), "Social Security Tax"), "$11,439.00");
eq("additional Medicare", row(run({ payFrequency: "Annual", salary: "300000" }), "Medicare Tax"), "$5,250.00");
eq("top brackets", fed({ salary: "300000" }), "$62,293.10");
eq("joint", fed({ filingStatus: "MarriedJoint" }), "$4,505.60");
eq("head of household", fed({ filingStatus: "HeadofHousehold" }), "$5,613.60");
eq("separately: 0.9% Medicare from $0", row(run({ payFrequency: "Annual", filingStatus: "MarriedSeparately" }), "Medicare Tax"), "$1,880.00");
eq("separately uses Single brackets", row(run({ payFrequency: "Monthly", filingStatus: "MarriedSeparately", salary: "450000", pretaxDeductions: "20000" }), "Federal Income Tax"), "$8,827.45");
eq("HoH 24%/32% at $201,750", fed({ filingStatus: "HeadofHousehold", salary: "241230" }), "$39,214.07");
eq("negative final rounds away from zero", row(run({ salary: "15000", payFrequency: "Quarterly", filingStatus: "MarriedJoint", pretaxDeductions: "20000" }), "Final Pay Check"), "$-1,536.88");
eq("title rounds the salary", run({ salary: "80000.567" }).title, "2026 Bi-weekly Paycheck Based on Income of $80,001/year.");
eq("state and city on salary", `${row(run({ payFrequency: "Annual", stateRate: "5", cityRate: "2" }), "State Income Tax")} ${row(run({ payFrequency: "Annual", stateRate: "5", cityRate: "2" }), "City Income Tax")}`, "$4,000.00 $1,600.00");

// ── Credits ──
eq("two children", fed({ children: "2" }), "$3,023.60");
eq("fractional dependents", JSON.stringify(run({ children: "1.5", otherDependents: "0.5" }).w4.main.step3), JSON.stringify({ children: "$3,300", others: "$250", total: "$3,550" }));
eq("credit at $200,000", fed({ salary: "200000", children: "1" }), "$31,092.64");
eq("no credit above $200,000", fed({ salary: "205000", children: "1" }), fed({ salary: "205000" }));
eq("other income counts toward the credit limit", fed({ salary: "195000", otherIncome: "6000", children: "1" }), fed({ salary: "195000", otherIncome: "6000" }));

// ── Deductions ──
eq("itemized", fed({ itemizedDeductions: "30000" }), "$5,017.60");
eq("itemized step 4(b)", step4b({ itemizedDeductions: "30000" }), "$13,900");
eq("separately ignores itemized", fed({ filingStatus: "MarriedSeparately", itemizedDeductions: "30000" }), fed({ filingStatus: "MarriedSeparately" }));
eq("tips cap $25,000", step4b({ tips: "30000" }), "$25,000");
eq("tips cutoff $150,000", step4b({ salary: "150000", tips: "10000" }), "$0");
eq("tips just under the cutoff", step4b({ salary: "149999", tips: "10000" }), "$10,000");
eq("overtime has no cap of its own", step4b({ overtime: "30000" }), "$30,000");
eq("loan interest cutoff $100,000", step4b({ salary: "100000", vehicleLoanInterest: "5000" }), "$0");
eq("charity cap", step4b({ charityGifts: "3000" }), "$1,000");
eq("charity cap joint", step4b({ filingStatus: "MarriedJoint", charityGifts: "3000" }), "$2,000");
eq("no charity when itemizing", step4b({ itemizedDeductions: "30000", charityGifts: "1000" }), "$13,900");
eq("senior under $75,000", step4b({ salary: "74999", age65: true }), "$6,000");
eq("senior cutoff $75,000", step4b({ salary: "75000", age65: true }), "$0");
eq("joint seniors", step4b({ filingStatus: "MarriedJoint", age65: true, spouse65: true }), "$12,000");
eq("spouse ignored unless joint", step4b({ salary: "60000", spouse65: true }), "$0");
eq("quirk: tips over the overtime cap set overtime to the cap", step4b({ tips: "26000", overtime: "1000" }), "$37,500");
eq("quirk: tips over $10,000 set loan interest to $10,000", step4b({ tips: "20000", vehicleLoanInterest: "2000" }), "$30,000");

// ── Other income and jobs ──
{
  const r = run({ payFrequency: "Annual", otherIncome: "5000" });
  eq("other income 4(a)", r.w4.main.a, "$5,000");
  eq("privacy quarterly", r.w4.privacy.quarterly, "$275");
}
eq("W-4 table single", multipleJobsAmount("Single", 80000, 20000), 5100);
eq("W-4 table joint top", multipleJobsAmount("MarriedJoint", 600000, 130000), 33990);
eq("W-4 table head of household", multipleJobsAmount("HeadofHousehold", 100000, 30000), 7630);
{
  const r = run({ payFrequency: "Annual", hasOtherJobs: true, job2: "20000", job3: "10000" });
  eq("three jobs", row(r, "Federal Income Tax"), "$15,393.60");
  eq("three jobs 4(c)", r.w4.main.c, "$9,290.00");
  eq("three jobs privacy", r.w4.privacy.quarterly, "$2,323");
}
{
  const r = run({ payFrequency: "Daily", hasOtherJobs: true, job2: "20000", otherIncome: "3000" });
  eq("per-period extra", r.w4.main.c, "$19.62");
  eq("privacy adds other-income tax", r.w4.privacy.quarterly, "$1,440");
}
{
  const r = run({ salary: "100000", payFrequency: "Monthly", filingStatus: "HeadofHousehold", pretaxDeductions: "3000", children: "1", otherDependents: "2", otherIncome: "15000", hasOtherJobs: true, job2: "150000" });
  eq("not the highest job", r.w4.highest, false);
  eq("not highest: W-4 block", JSON.stringify(r.w4.main), JSON.stringify({ step3: { children: "$0", others: "$0", total: "$0" }, a: "$0", b: "$0", c: "$1,574.17" }));
  eq("not highest: privacy", r.w4.privacy.quarterly, "$4,723");
  eq("not highest: federal", row(r, "Federal Income Tax"), "$2,452.92");
}
eq("a tie counts as highest", run({ hasOtherJobs: true, job2: "80000" }).w4.highest, true);
eq("tie federal", row(run({ hasOtherJobs: true, job2: "80000" }), "Federal Income Tax"), "$623.22");

// ── Self-employed ──
{
  const r = run({ payFrequency: "Annual", selfEmployed: true });
  eq("self-employed FICA", `${row(r, "Social Security Tax")} ${row(r, "Medicare Tax")}`, "$9,920.00 $2,320.00");
  eq("self-employed federal", row(r, "Federal Income Tax"), "$5,231.20");
  eq("self-employed: no W-4", r.w4, null);
}

// ── Validation ──
eq("several errors in order", run({ salary: "x", children: "x", tips: "x", stateRate: "x" }).errors.join(" | "),
  "Please provide a positive annual income value. | Please provide a positive number of children under age 17. | Please provide a positive state tax rate value. | Please provide a positive qualified tips value.");
eq("blank salary", run({ salary: "" }).errors.join(), "Please provide a positive annual income value.");
eq("blank children is 0", run({ children: "" }).errors, undefined);
eq("jobs need a value", run({ hasOtherJobs: true, job2: "0", job3: "0" }).errors.join(), "Please provide a 2nd, 3rd, or spouse income value.");
eq("job fields validated", run({ hasOtherJobs: true, job2: "x", job3: "y" }).errors.join(" | "), "Please provide a positive Income #2 value. | Please provide a positive Income #3 value.");
eq("job fields ignored when No", run({ hasOtherJobs: false, job2: "x" }).errors, undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
