// Plain-Node test suite for the Freight Class Calculator engine.
// Run with:
//   node scripts/freight-class-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/freight-class) by entering each scenario
// in a browser and reading the boxes back.

import { calculateFreightClass, freightClass, FIELDS, SPEC_KEYS } from "../src/utils/freightClassCalculatorEngine.js";
import { decimalOf } from "../src/utils/ieltsScoreCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** specs: [length, width, height, mass] (text or [text, unit]); cost: { pallets, rate, cost, rateUnit, order, defaults } */
const calc = (specs, cost = {}) => {
  const fields = Object.fromEntries(SPEC_KEYS.map((k, i) => {
    const v = specs[i] ?? "";
    return [k, Array.isArray(v) ? { unit: v[1], texts: [v[0]] } : { unit: FIELDS[k].unit, texts: [v] }];
  }));
  return calculateFreightClass({ fields, pallets: "1", rate: "", cost: "", rateUnit: "kg", order: [], defaults: ["pallets"], ...cost });
};
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `class ${r.freightClass}${r.cost ? ` | ${r.cost.pallets} × ${r.cost.rate} → ${r.cost.cost} [${r.cost.solved.join(",")}]` : ""}`);

// ── Live ──
eq("screenshot 3 × 4 × 5 m, 3 kg", out(calc(["3", "4", "5", "3"])), "class 500");
eq("screenshot cost 4 / kg", out(calc(["3", "4", "5", "3"], { rate: "4", order: ["rate"] })), "class 500 | 1 × 4.00 → 12.00 [cost]");
eq("1 m³ at 160 kg (9.99 lb/ft³)", out(calc(["1", "1", "1", "160"])), "class 100");
eq("1 m³ at 30 kg", out(calc(["1", "1", "1", "30"])), "class 400");
eq("1 m³ at 900 kg", out(calc(["1", "1", "1", "900"])), "class 50");
eq("1.2 × 1 × 1.5 m, 250 kg, 3 pallets at 0.35", out(calc(["1.2", "1", "1.5", "250"], { pallets: "3", rate: "0.35", order: ["pallets", "rate"], defaults: [] })),
  "class 110 | 3 × 0.35 → 262.50 [cost]");
eq("rate from cost", out(calc(["1.2", "1", "1.5", "250"], { pallets: "2", cost: "100", order: ["pallets", "cost"], defaults: [] })),
  "class 110 | 2 × 0.20 → 100.00 [rate]");

eq("FAQ: 3 × 4 × 5 ft, 260 lb (4.33 lb/ft³)", out(calc([["3", "ft"], ["4", "ft"], ["5", "ft"], ["260", "lb"]])), "class 200");

// ── Classes at the boundaries (lb/ft³) ──
const cls = (x) => freightClass(decimalOf(x));
eq("0.999 → 500", cls("0.999"), "500");
eq("1 → 400", cls("1"), "400");
eq("9.99 → 100", cls("9.99"), "100");
eq("10 → 92.5", cls("10"), "92.5");
eq("12 → 85", cls("12"), "85");
eq("14.9 → 77.5", cls("14.9"), "77.5");
eq("49.99 → 55", cls("49.99"), "55");
eq("50 → 50", cls("50"), "50");

// ── Units, cost solving, validation ──
eq("feet and pounds: exactly 10 lb/ft³", out(calc([["4", "ft"], ["4", "ft"], ["4", "ft"], ["640", "lb"]])), "class 92.5");
eq("feet and pounds: just under 10 lb/ft³", out(calc([["4", "ft"], ["4", "ft"], ["4", "ft"], ["639.9", "lb"]])), "class 100");
eq("density shown", calc(["1", "1", "1", "160"]).densityLbFt3, "9.988");
eq("rate per lb", out(calc(["1.2", "1", "1.5", "250"], { pallets: "3", rate: "0.35", rateUnit: "lb", order: ["pallets", "rate"], defaults: [] })),
  "class 110 | 3 × 0.35 → 578.71 [cost]");
eq("pallets from cost and rate", out(calc(["1.2", "1", "1.5", "250"], { pallets: "", rate: "0.5", cost: "500", order: ["rate", "cost"], defaults: [] })),
  "class 110 | 4 × 0.50 → 500.00 [pallets]");
eq("untouched 1 pallet is kept: the rate is recalculated", out(calc(["1.2", "1", "1.5", "250"], { rate: "9", cost: "50", order: ["rate", "cost"] })),
  "class 110 | 1 × 0.20 → 50.00 [rate]");
eq("no rate: class only", out(calc(["1", "1", "1", "160"], { pallets: "4", order: ["pallets"], defaults: [] })), "class 100");
eq("zero height", out(calc(["1", "1", "0", "160"])), "ERR Height should be greater than zero.");
eq("negative rate", out(calc(["1", "1", "1", "160"], { rate: "-1", order: ["rate"] })), "ERR Freight rate should be greater than zero.");
eq("missing mass", out(calc(["1", "1", "1"])), "MISSING mass");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
