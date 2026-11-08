// Plain-Node test suite for the CBM Calculator engine.
// Run with:
//   node scripts/cbm-calculator.test.js
//
// Expected values were read from the LIVE reference (omnicalculator.com/other/cbm-shipping) by entering each scenario
// in a browser and reading the boxes back.

import { calculateCbm, convertTexts, toSi, FIELDS, FIELD_KEYS, formatCount } from "../src/utils/cbmCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text | [texts], unit?], …] in typing order; quantity 1 and factor 5000 cm³/kg are the defaults,
 * which count as the most recent values until typed over (as in the tool). */
const calc = (typed, container = "20std", defaults = true) => {
  const fields = Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
  const order = [];
  const untouched = defaults ? ["quantity", "factor"] : [];
  if (defaults) { fields.quantity.texts = ["1"]; fields.factor.texts = ["5000"]; }
  for (const [k, t, unit] of typed) {
    fields[k] = { unit: unit ?? fields[k].unit, texts: Array.isArray(t) ? t : [t] };
    if (untouched.includes(k)) untouched.splice(untouched.indexOf(k), 1);
    if (!order.includes(k)) order.push(k); else { order.splice(order.indexOf(k), 1); order.push(k); }
  }
  return calculateCbm(fields, [...order, ...untouched], container);
};
const show = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `${FIELD_KEYS.map((k) => { const t = r.display[k].join("+"); return r.solved.includes(k) ? `[${t}]` : t; }).join(" ")} → ${formatCount(r.cartons)}`);

// [length width height weight quantity cbm totalVolume totalWeight factor volWeight] → cartons
eq("screenshot 3 × 2 × 3 cm", show(calc([["length", "3"], ["width", "2"], ["height", "3"]])), "3 2 3  1 [0.000018] [0.000018]  5000 [0.0036] → 1,832,729");
eq("weight and quantity", show(calc([["length", "50"], ["width", "40"], ["height", "30"], ["weight", "2"], ["quantity", "10"]])),
  "50 40 30 2 10 [0.06] [0.6] [20] 5000 [120] → 549");
eq("height from CBM", show(calc([["length", "50"], ["width", "40"], ["cbm", "0.06"]])), "50 40 [30]  1 0.06 [0.06]  5000 [12] → 549");
eq("height from volumetric weight", show(calc([["length", "50"], ["width", "40"], ["volWeight", "24"]])), "50 40 [60]  1 [0.12] [0.12]  5000 24 → 274");
eq("45′ container, length in inches", show(calc([["length", "120", "in"], ["width", "100"], ["height", "90"]], "45hc")),
  "120 100 90  1 [2.743] [2.743]  5000 [548.6] → 31");
eq("factor switched to in³/lb", show(calc([["length", "20", "in"], ["width", "10"], ["height", "10"], ["factor", "138.4", "in3lb"]])).split(" → ")[0].split(" ").slice(5).join(" "),
  "[0.00508] [0.00508]  138.4 [1.016]");

eq("article example: 50 × 80 × 60 cm, 35 kg × 20, 40′", show(calc([["length", "50"], ["width", "80"], ["height", "60"], ["weight", "35"], ["quantity", "20"]], "40std")),
  "50 80 60 35 20 [0.24] [4.8] [700] 5000 [960] → 277");

eq("total volume keeps the default quantity, recalculates the length", show(calc([["length", "30"], ["width", "30"], ["height", "30"], ["totalVolume", "0.54"]])),
  "[600] 30 30  1 [0.54] 0.54  5000 [108] → 61");
eq("total weight back to weight", show(calc([["length", "30"], ["width", "30"], ["height", "30"], ["quantity", "4"], ["totalWeight", "50"]])),
  "30 30 30 [12.5] 4 [0.027] [0.108] 50 5000 [21.6] → 1,221");
eq("ft/in height solved", show(calc([["length", "50"], ["width", "40"], ["height", ["", ""], "ftin"], ["cbm", "0.1"]])).split(" ")[2], "[1+7.685]");
eq("inches, cu ft and lb", show(calc([["length", "24", "in"], ["width", "18", "in"], ["height", "12", "in"], ["cbm", ["", ""].slice(0, 1), "cuft"], ["volWeight", [""], "lb"], ["quantity", "7"]])),
  "24 18 12  7 [3] [0.5947]  5000 [262.2] → 388");

// ── Units ──
eq("3 cm → in", convertTexts("length", "cm", "in", ["3"]).join(), "1.181");
eq("5000 cm³/kg → in³/lb", convertTexts("factor", "cm3kg", "in3lb", ["5000"]).join(), "138.4");
eq("ft/in composite", convertTexts("length", "cm", "ftin", ["190"]).join("|"), "6|2.803");
eq("m/cm composite back", convertTexts("length", "mcm", "cm", ["1", "85"]).join(), "185");
const n = (d) => Number(`${d.n}e-${d.s}`);
eq("ft/in to SI", n(toSi("length", "ftin", ["1", "6"])), n(toSi("length", "in", ["18"])));

// ── Most recent wins, validation, missing ──
eq("4 typed: the least recent (length) is recalculated", show(calc([["length", "50"], ["width", "40"], ["height", "30"], ["cbm", "0.1"]])).split(" ")[0], "[83.33]");
eq("retyping the length makes the width the oldest", show(calc([["length", "50"], ["width", "40"], ["height", "30"], ["cbm", "0.1"], ["length", "50"]])).split(" ")[1], "[66.67]");
eq("zero length", show(calc([["length", "0"], ["width", "2"], ["height", "3"]])), "ERR Length must be greater than 0.");
eq("negative weight", show(calc([["length", "1"], ["width", "2"], ["height", "3"], ["weight", "-2"]])), "ERR Weight must be greater than 0.");
eq("not a number", show(calc([["length", "abc"], ["width", "2"], ["height", "3"]])), "ERR Length must be greater than 0.");
eq("missing height", show(calc([["length", "3"], ["width", "2"]])), "MISSING height");
eq("nothing", show(calc([])), "MISSING length,width,height");
eq("box bigger than the container", show(calc([["length", "10", "m"], ["width", "10", "m"], ["height", "10", "m"]], "20std", true)).split(" → ")[1], "0");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
