// Plain-Node test suite for the Dimensional Weight Calculator engine.
// Run with:
//   node scripts/dimensional-weight-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/dimensional-weight) by entering each
// scenario in a browser and reading the boxes and the Shipping weight text back.

import { calculateDimensionalWeight, dimIn, UNITS } from "../src/utils/dimensionalWeightCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** values: [length, width, height, weight], each text or [text, unit] (or [[parts], unit]). */
const calc = (system, values, rate = "139") => {
  const u = UNITS[system];
  const keys = ["length", "width", "height", "weight"];
  const fields = Object.fromEntries(keys.map((k, i) => {
    const v = values[i] ?? "";
    const def = k === "weight" ? u.weightUnit : u.lengthUnit;
    if (Array.isArray(v)) return [k, { unit: v[1], texts: Array.isArray(v[0]) ? v[0] : [v[0]] }];
    return [k, { unit: def, texts: [v] }];
  }));
  return calculateDimensionalWeight({ system, rate, fields });
};
const out = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : r.carriers.map((c) => `${c.name} ${c.dim}→${c.charged}`).join(" ; ") + (r.notes.length ? ` || ${r.notes.join(" / ")}` : ""));

// ── Live ──
eq("screenshot 4 × 5 × 6 cm, 4 kg", out(calc("metric", ["4", "5", "6", "4"])), "UPS 1→4 ; FedEx 1→4");
eq("100 cm cube, 50 kg", out(calc("metric", ["100", "100", "100", "50"])), "UPS 200→200 ; FedEx 200→200");
eq("300 × 10 × 10 cm, 75 kg", out(calc("metric", ["300", "10", "10", "75"])),
  "UPS 6→75 ; FedEx 6→75 || For packages heavier than 70 kg, UPS may charge you extra. With FedEx, you can ship packages weighing up to 70 kg. / UPS may charge you extra if the longest edge of your package exceeds 274 cm.");
eq("20 in cube, 10 lb, daily", out(calc("imperial", ["20", "20", "20", "10"])), "UPS 58→58 ; USPS 49→49 ; FedEx 58→58");
eq("120 × 10 × 10.5 in, 160 lb, retail", out(calc("imperial", ["120", "10", "10.5", "160"], "166")),
  "UPS 76→160 ; USPS 76→160 ; FedEx 91→160 || For packages heavier than 150 pounds, UPS may charge you extra. With FedEx, you can ship packages weighing up to 150 pounds. / USPS will not ship packages heavier than 70 pounds. / UPS may charge you extra if the longest edge of your package exceeds 108 inches.");
eq("decimals, actual 7.25 lb", out(calc("imperial", ["12.345", "10", "8", "7.25"])), "UPS 8→8 ; USPS 6→7.25 ; FedEx 8→8");
eq("length in feet", out(calc("imperial", [["1", "ft"], "20", "20", "10"])), "UPS 35→35 ; USPS 29→29 ; FedEx 35→35");
eq("length in mm", out(calc("metric", [["1000", "mm"], "100", "100", "50"])), "UPS 200→200 ; FedEx 200→200");
eq("4.567 kg under 5 kg", out(calc("metric", ["40", "30", "20", "4.567"])), "UPS 5→5 ; FedEx 5→5");

eq("article: coat hanger 70 × 14 × 14 in, retail", out(calc("imperial", ["70", "14", "14", "10"], "166")), "UPS 83→83 ; USPS 83→83 ; FedEx 99→99");
eq("FAQ: 5 × 3 × 23 in → 3 lb (FedEx)", calc("imperial", ["5", "3", "23", "1"]).carriers[2].dim.toString(), "3");

// ── Extra ──
eq("equal weights: actual charged", out(calc("metric", ["100", "100", "100", "200"])).split(" || ")[0], "UPS 200→200 ; FedEx 200→200");
eq("exact multiple is not rounded up", calc("metric", ["50", "20", "10", "1"]).carriers[0].dim.toString(), "2");
eq("ft / in sides", out(calc("imperial", [[["1", "8"], "ftin"], "20", "20", "10"])), out(calc("imperial", ["20", "20", "20", "10"])));
eq("weight in oz", out(calc("imperial", ["20", "20", "20", ["1000", "oz"]])), "UPS 58→62.5 ; USPS 49→62.5 ; FedEx 58→62.5");
eq("dim weight in oz", dimIn("imperial", "oz", calc("imperial", ["20", "20", "20", "10"]).carriers[0]).join(), "928");
eq("dim weight in g", dimIn("metric", "g", calc("metric", ["4", "5", "6", "4"]).carriers[0]).join(), "1,000");
eq("zero side", out(calc("metric", ["0", "5", "6", "4"])), "ERR Please enter a positive value for the length.");
eq("missing", out(calc("metric", ["4", "5"])), "MISSING height,weight");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
