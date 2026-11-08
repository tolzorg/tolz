// Plain-Node test suite for the Pallet Calculator engine.
// Run with:
//   node scripts/pallet-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/pallet) by entering each scenario in a
// browser and reading the Results box back.

import { calculatePallet, palletVolume, FIELDS, FIELD_KEYS } from "../src/utils/palletCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** values: { key: text | [text, unit] } */
const input = (type, values, useWeight = false) => {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
  for (const [k, v] of Object.entries(values)) fields[k] = Array.isArray(v) ? { unit: v[1], texts: [v[0]] } : { unit: FIELDS[k].unit, texts: [v] };
  return { type, useWeight, fields };
};
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}` : r.tooLarge ? "TOO LARGE"
  : `${r.boxes} ${r.packing.utilization}% ${r.layers}×${r.perLayer} W:${r.arrangement.width} L:${r.arrangement.length}`);
const box = (a, b, c) => ({ bSide1: a, bSide2: b, bSide3: c });

// ── Live ──
eq("screenshot 48×40, 4 cm high, 5 × 3 × 3", out(calculatePallet(input("48x40", { pHeight: "4", ...box("5", "3", "3") }))), "800 72.67% 1×800 W:side B L:side A");
eq("screenshot volume", palletVolume("48x40", input("48x40", { pHeight: "4" }).fields).join(), "49,540");
eq("weight cap 500 kg / 12 kg", out(calculatePallet(input("48x40", { pHeight: "100", pWeight: "500", ...box("30", "20", "25"), bWeight: "12" }, true))),
  "41 49.66% 3×20 W:side A L:side B");
eq("weight volume", palletVolume("48x40", input("48x40", { pHeight: "100" }).fields).join(), "1,238,504");
eq("too large", out(calculatePallet(input("48x40", { pHeight: "50", ...box("130", "130", "60") }))), "TOO LARGE");
eq("custom 70 × 30, 30 high, 10 cm boxes", out(calculatePallet(input("custom", { pWidth: "70", pLength: "30", pHeight: "30", ...box("10", "10", "10") }))),
  "63 100% 3×21 W:side A L:side B");

// ── 1200 × 1000 (the reference's data says 120 × 120 cm: 144 boxes) ──
eq("1200 × 1000 pallet", out(calculatePallet(input("1200x1000", { pHeight: "10", ...box("10", "10", "10") }))), "120 100% 1×120 W:side A L:side B");
eq("1200 × 1000 volume", palletVolume("1200x1000", input("1200x1000", { pHeight: "10" }).fields).join(), "120,000");

eq("article example on a real 1200 × 1000 pallet (the reference says 480 with its 120 × 120 data)", out(calculatePallet(input("1200x1000", { pHeight: "100", ...box("15", "20", "10") }))).split(" ")[0], "400");
eq("bricks: 4600 lb / 4.5 lb", out(calculatePallet(input("48x40", { pHeight: "200", pWeight: ["4600", "lb"], ...box("5", "5", "5"), bWeight: ["4.5", "lb"] }, true))).split(" ")[0], "1,022");

// ── Weight, validation, units ──
eq("weight off ignores weights", out(calculatePallet(input("48x40", { pHeight: "100", pWeight: "1", ...box("30", "20", "25"), bWeight: "12" }))), out(calculatePallet(input("48x40", { pHeight: "100", ...box("30", "20", "25") }))));
eq("weight cap above the fit", out(calculatePallet(input("48x40", { pHeight: "4", pWeight: "10000", ...box("5", "3", "3"), bWeight: "1" }, true))), "800 72.67% 1×800 W:side B L:side A");
eq("package heavier than the pallet allows", out(calculatePallet(input("48x40", { pHeight: "100", pWeight: "10", ...box("30", "20", "25"), bWeight: "12" }, true))),
  "ERR The package's weight exceeds the pallet's weight capacity. | The pallet's weight capacity is smaller than the package's weight.");
eq("zero height", out(calculatePallet(input("48x40", { pHeight: "0", ...box("5", "3", "3") }))), "ERR Load height must be greater than zero!");
eq("zero side", out(calculatePallet(input("48x40", { pHeight: "4", ...box("0", "3", "-3") }))), "ERR Package's dimensions must be greater than zero!");
eq("missing", out(calculatePallet(input("custom", { pHeight: "4", ...box("5", "3", "") }))), "MISSING pWidth,pLength,bSide3");
eq("missing weights", out(calculatePallet(input("48x40", { pHeight: "4", ...box("5", "3", "3") }, true))), "MISSING pWeight,bWeight");
eq("inches", out(calculatePallet(input("48x40", { pHeight: ["10", "in"], ...box(["2", "in"], ["2", "in"], ["2", "in"]) }))),
  out(calculatePallet(input("48x40", { pHeight: "25.4", ...box("5.08", "5.08", "5.08") }))));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
