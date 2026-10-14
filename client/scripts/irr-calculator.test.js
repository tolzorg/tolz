// Plain-Node test suite for the IRR Calculator engine.
// Run with:
//   node scripts/irr-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/irr-calculator.html) via plain GET requests. A scratch
// comparator also diffed random scenarios: the fixed-cash-flow form matched
// 239/240 (and its fitted solver 330/331 on a separate set); the irregular
// form matched 224/240, the rest differing only where the reference's own
// root finder is imprecise or odd (see the engine header).

import { calculateFixedIrr, calculateIrregularIrr, FIXED_DEFAULTS, IRREGULAR_DEFAULTS, formatNumber } from "../src/utils/irrCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const fixed = (o = {}) => calculateFixedIrr({ ...FIXED_DEFAULTS, ...o });
const flows = (...xs) => [...xs.map(String), ...Array(50 - xs.length).fill("")];
const irregular = (initial, ...xs) => calculateIrregularIrr({ initial: String(initial), flows: flows(...xs) });
const rows = (r) => r.rows.map((x) => x.join(" ")).join(" / ");
const pie = (r) => r.pie.map((p) => `${p.label} ${p.text} ${p.color}`).join(" / ");

// ── Fixed cash flow: default example (screenshot) ──
{
  const r = fixed();
  eq("default IRR", r.irr, "29.768%");
  eq("default rows", rows(r), "Cumulative Withdrawals: $3,000.00 / Total Return: $8,000.00 / Gross Return: 80.000%");
  eq("default pie", pie(r), "Initial Investment $10,000 #2b7ddb / Total Return $8,000 #8bbc21");
  eq("no 52-week note", r.note, null);
}
eq("deposit", fixed({ flowType: "d" }).irr, "6.674%");
eq("deposit rows", rows(fixed({ flowType: "d" })), "Cumulative Deposits: $3,000.00 / Total Return: $2,000.00 / Gross Return: 15.385%");
eq("deposit pie", pie(fixed({ flowType: "d" })), "Initial Investment $10,000 #2b7ddb / Cumulative Deposits $3,000 #8bbc21 / Total Return $2,000 #910000");
eq("beginning adds a payment", rows(fixed({ timing: "b" })).split(" / ")[0], "Cumulative Withdrawals: $3,100.00");
eq("beginning IRR", fixed({ timing: "b" }).irr, "30.361%");
eq("deposit at beginning", fixed({ flowType: "d", timing: "b" }).irr, "6.301%");
eq("no payment (closed form)", rows(fixed({ amount: "0" })), "Total Return: $5,000.00 / Gross Return: 50.000%");
eq("no payment IRR", fixed({ amount: "0" }).irr, "17.608%");
for (const [f, irr] of [["a", "18.349%"], ["sa", "19.474%"], ["q", "21.454%"], ["sm", "43.518%"], ["bw", "45.971%"], ["w", "82.720%"]]) eq(`frequency ${f}`, fixed({ frequency: f }).irr, irr);
eq("biweekly note", fixed({ frequency: "bw" }).note, "*The calculation assumes a 52-week year.");
eq("13 months", fixed({ months: "13" }).irr, "25.887%");
eq("loss", rows(fixed({ ending: "5000" })), "Cumulative Withdrawals: $3,000.00 / Total Loss: $2,000.00 / Gross Return: -20.000%");
eq("loss IRR", fixed({ ending: "5000" }).irr, "-10.197%");
eq("deposit loss pie", pie(fixed({ flowType: "d", ending: "1000" })), "Initial Investment $10,000 #2b7ddb / Cumulative Deposits $3,000 #8bbc21 / Total Loss $12,000 #910000");
eq("zero return: no pie", fixed({ ending: "7000" }).pie, null);
eq("zero return IRR", fixed({ ending: "7000" }).irr, "0.000%");
eq("half year, annual, end: no payment", rows(fixed({ years: "0", months: "6", frequency: "a" })), "Total Return: $5,000.00 / Gross Return: 50.000%");
eq("half year, annual, beginning", fixed({ years: "0", months: "6", frequency: "a", timing: "b" }).irr, "129.568%");
eq("huge IRR digits", fixed({ years: "0", months: "1", ending: "200000", amount: "0" }).irr, "409,599,999,999,999,872.000%");
eq("blank years", fixed({ years: "" }).irr, "147.455%");
eq("1,000 years exactly ok", fixed({ years: "1000", months: "0", amount: "0" }).irr, "0.041%");
eq("commas", fixed({ initial: "1,000" }).irr, "379.622%");
// Out of scope
eq("0 initial", fixed({ initial: "0" }).sorry !== undefined, true);
eq("-100%", fixed({ ending: "0", amount: "0" }).sorry !== undefined, true);
eq("1019 periods", fixed({ years: "0", months: "1019" }).sorry !== undefined, true);
eq("1018 periods ok", fixed({ years: "0", months: "1018" }).irr, "12.683%");
eq("1019 periods, $1", fixed({ years: "0", months: "1019", amount: "1" }).irr, "0.578%");
// Validation
eq("every field", fixed({ initial: "x", years: "x", months: "x", ending: "x", amount: "x" }).errors.join(" | "),
  "Please provide a positive initial investment. | Please provide a positive holding year. | Please provide a positive holding month. | Please provide a positive ending balance. | Please provide a positive withdraw amount.");
eq("deposit wording", fixed({ flowType: "d", amount: "" }).errors.join(), "Please provide a positive deposit amount.");
eq("no holding time", fixed({ years: "", months: "" }).errors.join(), "Please provide a positive holding time.");
eq("over 1,000 years", fixed({ years: "1000" }).errors.join(), "This calculator can handle a holding period of up to 1,000 years only.");
eq("negative month", fixed({ months: "-1" }).errors.join(), "Please provide a positive holding month.");

// ── Irregular cash flow ──
{
  const r = calculateIrregularIrr(IRREGULAR_DEFAULTS);
  eq("irregular default IRR", r.irr, "12.446%");
  eq("irregular rows", rows(r), "Further Investments: $10,000.00 / Investment Length: 3 years / Total Return: $20,000.00 / Gross Return: 33.333%");
  eq("irregular pie", pie(r), "Initial Investment $50,000 #2b7ddb / Further Investments $10,000 #8bbc21 / Total Return $20,000 #910000");
}
eq("article example 1", irregular(40000, 10000, 20000, 30000).irr, "19.438%");
eq("article investment A", irregular(100000, 5000, 20000, 25000, 40000, 60000).irr, "11.290%");
eq("article investment B", irregular(100000, 0, 10000, 30000, 30000, 80000).irr, "10.259%");
eq("blank year counts 0", irregular(50000, "", 30000, 50000).irr, "19.784%");
eq("length = last filled year", rows(irregular(50000, -10000, 30000, "", "", 5000)), "Further Investments: $10,000.00 / Investment Length: 5 years / Total Loss: $25,000.00 / Gross Return: -41.667%");
eq("singular year", rows(irregular(50000, 10000)), "Investment Length: 1 year / Total Loss: $40,000.00 / Gross Return: -80.000%");
eq("zero initial allowed", irregular(0, -10000, 30000, 50000).irr, "319.258%");
eq("zero initial pie", pie(irregular(0, -10000, 30000, 50000)), "Further Investments $10,000 #2b7ddb / Total Return $70,000 #8bbc21");
eq("explicit 0 counts toward length", rows(irregular(50000, -10000, 30000, 0)).includes("3 years"), true);
eq("all negative", irregular(50000, -10000, -30000, -50000).sorry !== undefined, true);
eq("all zero", irregular(0, 0, 0, 0).sorry !== undefined, true);
eq("zero return", irregular(50000, 0, 0, 50000).irr, "0.000%");
eq("year 50", irregular(50000, -10000, 30000, 50000, ...Array(46).fill(""), 1000).irr, "12.449%");
eq("irregular errors", calculateIrregularIrr({ initial: "x", flows: flows("", "x", "", "y") }).errors.join(" | "),
  "Please provide a positive initial investment. | Please provide a valid number for year #2. | Please provide a valid number for year #4. | Please provide some cash flow to calculate.");
eq("no cash flow", calculateIrregularIrr({ initial: "50000", flows: flows() }).errors.join(), "Please provide some cash flow to calculate.");
eq("negative initial", irregular(-5, 100).errors.join(), "Please provide a positive initial investment.");

// ── Formatting ──
eq("grouping", formatNumber(13951.521994, 3), "13,951.522");
eq("negative zero", formatNumber(-0.0000001, 3), "0.000");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
