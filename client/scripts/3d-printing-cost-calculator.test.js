// Plain-Node test suite for the 3D Printing Cost Calculator engine.
// Run with:
//   node scripts/3d-printing-cost-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/3d-printing): its screenshot and live runs.

import { calculatePrintingCost, FIELDS, FIELD_KEYS, DEFAULT_TEXTS, omni, fromSi } from "../src/utils/printing3dCostCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const SHOW = ["density", "diameter", "length", "weight", "price", "materialCost", "time", "rate", "laborCost", "markup", "total"];
/** typed: [[key, text, unit?], ...] in typing order (defaults 1.75 mm and 10% stay untouched unless typed). */
function run(typed, material = "ABS", units = {}) {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, per: FIELDS[k].perUnit, texts: [DEFAULT_TEXTS[k] ?? ""] }]));
  for (const [k, u] of Object.entries(units)) fields[k].unit = u;
  const order = Object.keys(DEFAULT_TEXTS).filter((k) => !typed.some(([t]) => t === k));
  for (const [k, text, unit] of typed) { fields[k] = { ...fields[k], unit: unit || fields[k].unit, texts: [text] }; order.push(k); }
  const r = calculatePrintingCost({ material, fields, order });
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  return SHOW.map((k) => `${r.display[k].join("/")}${r.solved.includes(k) ? "*" : ""}`).join(" ");
}
const BASE = [["length", "34"], ["price", "545"], ["time", "34"], ["rate", "5"]];

// columns: density diameter length weight price materialCost time rate laborCost markup total
eq("screenshot", run(BASE), "1.05 1.75 34 0.00086* 545 0.47* 34 5 170.00* 10 187.51*");
eq("PLA", run(BASE, "PLA"), "1.27 1.75 34 0.00104* 545 0.57* 34 5 170.00* 10 187.62*");
eq("custom density 1.1", run([["density", "1.1"], ...BASE], "custom"), "1.1 1.75 34 0.0009* 545 0.49* 34 5 170.00* 10 187.54*");
eq("custom density blank (labor only, as on the reference)", run(BASE, "custom"), " 1.75 34  545  34 5 170.00* 10 ");
eq("final price typed last → printing time", run([...BASE, ["total", "300"]]), "1.05 1.75 34 0.00086* 545 0.47* 54.45* 5 272.26* 10 300");
eq("time typed after rate, total last → time", run([["length", "34"], ["price", "545"], ["rate", "5"], ["time", "34"], ["total", "300"]]),
  "1.05 1.75 34 0.00086* 545 0.47* 54.45* 5 272.26* 10 300");
eq("labor typed last → time", run([["rate", "5"], ["time", "34"], ["laborCost", "100"]]), "1.05 1.75     20* 5 100 10 ");
eq("material typed last → diameter", run([["price", "545"], ["length", "34"], ["time", "34"], ["rate", "5"], ["materialCost", "1"]]),
  "1.05 2.558* 34 0.00183* 545 1 34 5 170.00* 10 188.10*");
eq("negative markup", run([...BASE, ["markup", "-5"]]), "ERR The markup cannot be less than 0.");
eq("zero time", run([["length", "34"], ["price", "545"], ["time", "0"], ["rate", "5"]]), "ERR The printing time must be more than 0.");
eq("weight → length", run([["weight", "0.5"], ["price", "20"], ["time", "3"], ["rate", "2"]]), "1.05 1.75 19,798* 0.5 20 10.00* 3 2 6.00* 10 17.60*");
eq("blank", run([]), "MISSING length,price,time,rate");
eq("text", run([["length", "abc"]]), "ERR Please enter a number for filament length.");
eq("hrs/min time", run([["length", "100"], ["price", "20"], ["time", "1.5"], ["rate", "3"]], "ABS", { time: "hrsmin" }), "1.05 1.75 100 0.00253* 20 0.05* 1.5 3 4.50* 10 5.01*");

// rounding helpers
eq("omni 1% weight", omni(0.00085870, 0.01), "0.00086");
eq("omni default", omni(19795.6123), "19,796");
eq("composite out", fromSi("time", { unit: "hrsmin" }, 5400).join("/"), "1/30");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
