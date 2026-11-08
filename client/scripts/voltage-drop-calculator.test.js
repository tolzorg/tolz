// Plain-Node test suite for the Voltage Drop Calculator engine.
// Run with:
//   node scripts/voltage-drop-calculator.test.js
//
// Expected values are the reference's own answers (calculator.net/voltage-drop-calculator.html), fetched from its server.

import { calculateVoltageDrop, DEFAULTS } from "../src/utils/voltageDropCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const BASE = { tab: "nec", ...DEFAULTS, pf: "0.85", resistance: "1.2", voltage: "120", distance: "500", current: "1" };
const run = (p) => {
  const r = calculateVoltageDrop({ ...BASE, ...p });
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  if (r.unlikely) return r.unlikely;
  return `${r.dropText} | ${r.percentText} | ${r.endText}`;
};

// screenshots
eq("NEC: 3 AWG Cu, steel, PF 0.85", run({}), "0.80 | 0.67% | 119.2");
eq("Estimated: 1 AWG Cu", run({ tab: "size" }), "0.41 | 0.34% | 119.59");
// phases, conductors, materials, tabs (live)
eq("NEC DC uses R only", run({ phase: "dc" }), "0.82 | 0.68% | 119.18");
eq("NEC 3-phase", run({ phase: "ac3" }), "0.69 | 0.58% | 119.31");
eq("NEC 2 in parallel", run({ conductors: "2" }), "0.40 | 0.33% | 119.6");
eq("NEC PF 0 (reactance only)", run({ pf: "0" }), "0.19 | 0.16% | 119.81");
eq("NEC R at PF 1, 1000 ft, 1000 A", run({ pf: "1", voltage: "1000000", distance: "1000", distanceUnit: "feet", current: "1000" }), "499.87 | 0.050% | 999500.13");
eq("Estimated aluminum", run({ tab: "size", sizeMaterial: "aluminum" }), "0.64 | 0.53% | 119.36");
eq("Estimated silver", run({ tab: "size", sizeMaterial: "silver" }), "0.38 | 0.32% | 119.62");
eq("Estimated gold", run({ tab: "size", sizeMaterial: "gold" }), "0.54 | 0.45% | 119.46");
eq("Estimated 3-phase", run({ tab: "size", phase: "ac3" }), "0.35 | 0.29% | 119.65");
{
  const cu = calculateVoltageDrop({ ...BASE, tab: "size" }).impedance;
  eq("Al / Cu = 5.96 / 3.78 (live 1,576,719.58 per 10⁶)", (calculateVoltageDrop({ ...BASE, tab: "size", sizeMaterial: "aluminum" }).impedance / cu).toFixed(10), "1.5767195767");
}
eq("Other Ω/km", run({ tab: "other" }), "1.20 | 1.00% | 118.8");
eq("Other miles", run({ tab: "other", resistance: "1", distance: "1", distanceUnit: "miles", current: "1000", voltage: "1000000000" }), "3,218.68 | 0.00032% | 999996781.32");
eq("Other Ω/1000ft", run({ tab: "other", resistance: "1", resistanceUnit: "okf", distance: "1", distanceUnit: "kilometers", current: "1000", voltage: "1000000000" }), "6,561.68 | 0.00066% | 999993438.32");
// thresholds and formatting (live)
eq("drop = voltage", run({ tab: "other", resistance: "120", distance: "0.5", distanceUnit: "kilometers" }), "120.00 | 100.00% | 0");
eq("drop > voltage", run({ tab: "other", resistance: "121", distance: "0.5", distanceUnit: "kilometers" }), "It is unlikely that this wire can support 1 amperes of current at a distance of 0.5 kilometers.");
const fmt = (r, v = "1000") => run({ tab: "other", resistance: r, distance: "0.5", distanceUnit: "kilometers", voltage: v });
eq("0.123", fmt("0.123"), "0.12 | 0.012% | 999.88");
eq("0.0123", fmt("0.0123"), "0.012 | 0.0012% | 999.988");
eq("0.0099", fmt("0.0099"), "0.0099 | 0.00099% | 999.9901");
eq("0.01", fmt("0.01"), "0.010 | 0.0010% | 999.99");
eq("0.0105", fmt("0.0105"), "0.011 | 0.0011% | 999.989");
eq("0.0996", fmt("0.0996"), "0.100 | 0.0100% | 999.9");
eq("1.005 half-up", fmt("1.005"), "1.01 | 0.10% | 998.99");
eq("0.996 → 0.100%", fmt("0.996"), "1.00 | 0.100% | 999");
eq("tiny", run({ tab: "other", resistance: "0.00001", distance: "1", distanceUnit: "meters" }), "0.000000020 | 0.000000017% | 119.99999998");
// validation (live messages, in the reference's order)
eq("several errors", run({ pf: "2", voltage: "0", distance: "-1", current: "0" }),
  "ERR Please provide a Power factor (PF) value between 0 and 1. | Please provide a positive voltage value. | Please provide a positive distance value. | Please provide a positive load current value.");
eq("negative resistance", run({ tab: "other", resistance: "-1" }), "ERR Please provide a positive wire resistance value.");
eq("14 AWG aluminum", run({ necMaterial: "aluminum", necSize: 0 }), "ERR Sorry, we do not have NEC resistance and reactance data for 14 AWG aluminum wire.");
eq("text voltage", run({ voltage: "abc" }), "ERR Please provide a positive voltage value.");
eq("blank", run({ pf: "", voltage: "", distance: "", current: "" }), "MISSING pf,voltage,distance,current");
eq("PF not needed outside NEC", run({ tab: "size", pf: "" }), "0.41 | 0.34% | 119.59");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
