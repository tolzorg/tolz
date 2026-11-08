// Plain-Node test suite for the Battery Capacity Calculator engine.
// Run with:
//   node scripts/battery-capacity-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/battery-capacity): its screenshot and live runs.

import { calculateBatteryCapacity, FIELDS, matchingExample } from "../src/utils/batteryCapacityCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const blank = () => Object.fromEntries(Object.keys(FIELDS).map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
/** typed: [[key, text, unit?], ...] in typing order; units: { key: unit } for boxes left blank. */
function run(typed, units = {}) {
  const fields = blank();
  for (const [k, unit] of Object.entries(units)) fields[k].unit = unit;
  const order = [];
  for (const [k, text, unit] of typed) { fields[k] = { unit: unit || fields[k].unit, texts: [text] }; order.push(k); }
  const r = calculateBatteryCapacity(fields, order);
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  return Object.keys(FIELDS).map((k) => `${k}=${r.display[k][0]}${r.solved.includes(k) ? "*" : ""}`).join(" ");
}

eq("screenshot: 34 V, 5 Ah, 5C", run([["voltage", "34"], ["capacity", "5"], ["cRate", "5"]]),
  "voltage=34 capacity=5 energy=170* cRate=5 current=25* runtime=12*");
eq("C-rate only → runtime", run([["cRate", "2"]]), "voltage= capacity= energy= cRate=2 current= runtime=30*");
eq("mAh", run([["voltage", "3.7"], ["capacity", "2000", "mAh"], ["cRate", "0.5"]]),
  "voltage=3.7 capacity=2000 energy=7.4* cRate=0.5 current=1* runtime=120*");
eq("mA and seconds", run([["capacity", "5"], ["cRate", "2"]], { current: "mA", runtime: "sec" }),
  "voltage= capacity=5 energy= cRate=2 current=10,000* runtime=1,800*");
eq("capacity typed first is re-solved", run([["capacity", "5"], ["current", "10"], ["runtime", "45"]]),
  "voltage= capacity=7.5* energy= cRate=1.3333* current=10 runtime=45");
eq("runtime → C → capacity → energy", run([["runtime", "30"], ["current", "4"], ["voltage", "12"]]),
  "voltage=12 capacity=2* energy=24* cRate=2* current=4 runtime=30");
eq("example 2 (drone)", run([["voltage", "22.2"], ["energy", "97.7"]]), "voltage=22.2 capacity=4.401* energy=97.7 cRate= current= runtime=");
eq("example 1 (medical)", run([["voltage", "14.8"], ["capacity", "3.65"]]), "voltage=14.8 capacity=3.65 energy=54.02* cRate= current= runtime=");
eq("zero voltage", run([["voltage", "0"], ["capacity", "5"]]), "ERR Voltage must be greater than zero.");
eq("negative C-rate", run([["cRate", "-2"]]), "ERR C-rate must be greater than zero.");
eq("blank", run([]), "MISSING voltage,capacity");
eq("only voltage", run([["voltage", "12"]]), "MISSING capacity");
eq("kWh", run([["voltage", "48"], ["capacity", "100"]], { energy: "kWh" }), "voltage=48 capacity=100 energy=4.8* cRate= current= runtime=");

const ex = (v, q) => { const f = blank(); f.voltage.texts = [v]; f.capacity.texts = [q]; return matchingExample(f)?.id ?? null; };
eq("example note shown", ex("14.8", "3.65"), 1);
eq("no example note", ex("14.8", "3.6"), null);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
