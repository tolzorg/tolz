// Plain-Node test suite for the Average Return Calculator engine.
// Run with:
//   node scripts/average-return-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/average-return-calculator.html) via plain GET requests.
// A scratch comparator also diffed 87 hand-picked cases and 400 random
// scenarios: the cumulative-return form matched every case, and the cash-flow
// form matched 564/575 labelled cases. Its residuals are cent-level gaps at
// returns over ~500% a year and multiple-IRR cash flows, where the
// reference's own iteration picks differently (documented, not replicated).

import { calculateCashFlowReturn, calculateCumulativeReturn, format2 } from "../src/utils/averageReturnCalculatorEngine.js";

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) passed++;
  else { failed++; console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

const FLOWS = [{ type: "d", amount: "5000", date: "2024-01-15" }, { type: "w", amount: "1500", date: "2024-06-01" }, { type: "d", amount: "3800", date: "2025-01-18" }];
const cf = (over = {}) => calculateCashFlowReturn({ startBalance: "5600", startDate: "2023-01-01", endBalance: "18000", endDate: "2026-10-13", flows: FLOWS, ...over });
const pct = (r) => (r.errors ? r.errors.join(" | ") : r.outOfScope ? "SORRY" : `${format2(r.annualReturn)}%`);
const simple = (bb, bd, eb, ed, flows = []) => pct(calculateCashFlowReturn({ startBalance: bb, startDate: bd, endBalance: eb, endDate: ed, flows }));

// ─────────────────────────────────────────────────────────────────
// 1. Average Return Based on Cash Flow
// ─────────────────────────────────────────────────────────────────
{
  eq("reference screenshot", pct(cf()), "11.83%");
  eq("chart points (input order, withdrawals negative)", cf().chart.map((p) => `${new Date(p.date).toISOString().slice(0, 10)}:${p.amount}`).join(" "),
    "2023-01-01:5600 2024-01-15:5000 2024-06-01:-1500 2025-01-18:3800");
  eq("no flows: no chart", cf({ flows: [] }).chart, null);
  eq("no flows", pct(cf({ flows: [] })), "36.18%");
  eq("366-day leap year counts as 1 year", simple("1000", "2024-01-01", "1100", "2025-01-01"), "10.00%");
  eq("365-day year", simple("1000", "2023-01-01", "1100", "2024-01-01"), "10.00%");
  eq("half year counts 182/365", simple("1000", "2024-01-01", "1100", "2024-07-01"), "21.06%");
  eq("loss", simple("1000", "2024-01-01", "500", "2025-01-01"), "-50.00%");
  eq("1000× in a year", simple("100", "2024-01-01", "100000", "2025-01-01"), "99,900.00%");
  eq("exactly 100,000% is out of scope", simple("100", "2023-01-01", "100100", "2024-01-01"), "SORRY");
  eq("ending balance 0", pct(cf({ endBalance: "0" })), "-99.99%");
  eq("starting balance 0", pct(cf({ startBalance: "0", flows: [{ type: "d", amount: "5000", date: "2024-01-15" }] })), "59.53%");
  eq("flow on the start date", pct(cf({ flows: [{ type: "d", amount: "5000", date: "2023-01-01" }] })), "15.03%");
  eq("flow on the end date", pct(cf({ flows: [{ type: "d", amount: "5000", date: "2026-10-13" }] })), "24.95%");
  eq("commas in amounts", pct(cf({ flows: [{ type: "d", amount: "5,000", date: "2024-01-15" }] })), "17.33%");
  eq("unsorted flows", pct(cf({ flows: [...FLOWS].reverse() })), "11.83%");
  eq("big withdrawal", pct(cf({ flows: [{ type: "w", amount: "50000", date: "2024-01-15" }] })), "724.37%");
  eq("blank start date = 1970-01-01", pct(cf({ startDate: "" })), "1.12%");
  eq("$0 flow is fine", pct(cf({ flows: [{ type: "d", amount: "0", date: "2024-01-15" }] })), "36.18%");
  eq("reference solver's early stop (exact root 2,043.2749%)", simple("5832", "2022-07-15", "1575", "2023-01-11", [{ type: "w", amount: "8926", date: "2022-09-11" }]), "2,043.28%");
  eq("no solution", simple("6535", "2017-01-22", "2740", "2019-03-22", [
    { type: "w", amount: "3744", date: "2018-07-28" }, { type: "w", amount: "4603", date: "2018-05-08" },
    { type: "d", amount: "7990", date: "2019-02-10" }, { type: "d", amount: "5857", date: "2018-07-18" }]), "SORRY");

  eq("all errors in order", pct(cf({ startBalance: "", endBalance: "-1", startDate: "2027-01-01", flows: [{ type: "d", amount: "abc", date: "2024-01-15" }, { type: "d", amount: "50", date: "2030-01-01" }] })),
    "Please provide a positive starting balance. | Please provide a positive ending balance. | Begin date should be earlier than end date. | Please provide a positive value for item #1. | Date item #2 should be between begin and end date.");
  eq("bad amount skips the date check", pct(cf({ flows: [{ type: "d", amount: "abc", date: "2030-01-15" }] })), "Please provide a positive value for item #1.");
  eq("same start and end date", simple("1000", "2024-01-01", "1100", "2024-01-01"), "Begin date should be earlier than end date.");
  eq("blank flow date is out of range", pct(cf({ flows: [{ type: "d", amount: "5000", date: "" }] })), "Date item #1 should be between begin and end date.");
}

// ─────────────────────────────────────────────────────────────────
// 2. Average and Cumulative Return
// ─────────────────────────────────────────────────────────────────
{
  const cr = (rows) => calculateCumulativeReturn({ rows: rows.map(([ret, years, months]) => ({ ret, years, months })) });
  const show = (r) => (r.errors ? r.errors.join(" | ") : r.empty ? "EMPTY"
    : `${format2(r.cumulative)}% / ${format2(r.average)}% / ${r.totalPeriod} / ${r.schedule.map((s) => `${s.label}|${s.returnText}|$${format2(s.balance)}`).join(" ; ")}`);
  const two = ["5", "1", ""];

  eq("reference screenshot", show(cr([["10", "1", "2"], ["-2", "", "5"], ["15", "2", "3"]])),
    "51.78% / 11.50% / 3 years, 10 months / 1 years, 2 months|10%|$111.76 ; 5 months|-2%|$110.82 ; 2 years, 3 months|15%|$151.78");
  eq("months carry into years in the total only", show(cr([["10", "", "14"], two])), "17.35% / 7.66% / 2 years, 2 months / 14 months|10%|$111.76 ; 1 years|5%|$117.35");
  eq("fractional years", show(cr([["10", "1.5", ""], two])).split(" / ").slice(0, 3).join(" / "), "21.14% / 7.97% / 2.5 years");
  eq("fractional months", show(cr([["10", "", "2.5"], two])).split(" / ").slice(0, 3).join(" / "), "7.11% / 5.85% / 1 years, 2.5 months");
  eq("labels echo the trimmed input", show(cr([["10", "1.50", "02"], two])).split(" / ")[3].split(" ; ")[0], "1.50 years, 02 months|10%|$117.22");
  eq("return text echoed as typed", show(cr([["+10", "1", ""], two])).split(" / ")[3].split(" ; ")[0], "1 years|+10%|$110.00");
  eq("exact \"0\" return is left out", show(cr([["0", "1", ""], two])), "5.00% / 5.00% / 1 years / 1 years|5%|$105.00");
  eq("\"0.0\" return is kept", show(cr([["0.0", "1", ""], two])), "5.00% / 2.47% / 2 years / 1 years|0.0%|$100.00 ; 1 years|5%|$105.00");
  eq("0 years and 0 months: blank label, no growth", show(cr([["10", "0", "0"], two])), "5.00% / 5.00% / 1 years / |10%|$100.00 ; 1 years|5%|$105.00");
  eq("zero total time: empty result", show(cr([["10", "0", "0"], ["5", "0", "0"]])), "EMPTY");
  eq("only \"0\" returns: empty result", show(cr([["0", "1", ""], ["0", "1", ""]])), "EMPTY");
  eq("large return", show(cr([["1000", "1", ""], two])).split(" / ").slice(0, 2).join(" / "), "1,055.00% / 239.85%");
  eq("blank-return rows are skipped", show(cr([["", "1", "2"], two, two])).split(" / ")[0], "10.25%");

  eq("fewer than two rows", show(cr([["10", "1", ""]])), "Please provide at least two rows of data.");
  eq("no holding length", show(cr([["10", "", ""], two])), "Please provide a positive year or month for item #1.");
  eq("-100% and below rejected", show(cr([["-100", "1", ""], two])), "Please provide a numeric return value for item #1.");
  eq("comma in return rejected", show(cr([["1,000", "1", ""], two])), "Please provide a numeric return value for item #1.");
  eq("all problems on a row, numbered by row", show(cr([two, ["", "", ""], ["abc", "-1", "-2"]])),
    "Please provide a numeric return value for item #3. | Please provide a positive year for item #3. | Please provide a positive month for item #3.");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
