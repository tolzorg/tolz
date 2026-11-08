// Plain-Node test suite for the Battery Life Calculator engine.
// Run with:
//   node scripts/battery-life-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/battery-life): its four screenshots and live runs.

import { calculateBatteryLife, FIELDS, fieldsFor, lifeKey } from "../src/utils/batteryLifeCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

/** typed: [[key, text, unit?], ...] in typing order; the 20% safety stays an untouched default unless typed. */
function run(sleep, param, typed) {
  const fields = Object.fromEntries(Object.keys(FIELDS).map((k) => [k, { unit: FIELDS[k].unit, texts: [k === "safety" ? "20" : ""] }]));
  const order = [];
  for (const [k, text, unit] of typed) { fields[k] = { unit: unit || FIELDS[k].unit, texts: [text] }; order.push(k); }
  const r = calculateBatteryLife({ sleep, param, fields, order, defaults: order.includes("safety") ? [] : ["safety"] });
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  return fieldsFor(sleep, param).map((k) => `${k}=${r.display[k].join("/")}${r.solved.includes(k) ? "*" : ""}`).join(" ");
}

// ── screenshots ──
eq("screenshot 1: 333 mAh, 24 mA", run("none", "current", [["capacity", "333"], ["current", "24"]]),
  "capacity=333 safety=20 current=24 life=11.1*");
eq("screenshot 2: sleep mode, life typed → average", run("sleep", "current", [["capacity", "333"], ["currentAwake", "32"], ["currentSleep", "433"], ["lifeSleep", "33"]]),
  "capacity=333 safety=20 currentAwake=32 awakeTime= currentSleep=433 sleepTime= averageCurrent=8.073* lifeSleep=33");
eq("screenshot 3: wattage, sleep", run("sleep", "wattage", [["capacity", "333"], ["currentAwake", "32"], ["currentSleep", "433"], ["lifeSleep", "33"], ["voltage", "345"]]),
  "capacity=333 safety=20 voltage=345 wattageAwake=11.04* currentAwake=32 awakeTime= wattageSleep=149.39* currentSleep=433 sleepTime= averageCurrent=8.073* lifeSleep=33");
eq("screenshot 4: wattage, no sleep", run("none", "wattage", [["capacity", "333"], ["current", "24"], ["voltage", "345"]]),
  "capacity=333 safety=20 voltage=345 wattage=8.28* current=24 life=11.1*");

// ── live runs ──
eq("life typed last → capacity", run("none", "current", [["capacity", "333"], ["current", "24"], ["life", "33"]]),
  "capacity=990* safety=20 current=24 life=33");
eq("sleep, current", run("sleep", "current", [["capacity", "333"], ["currentAwake", "32"], ["awakeTime", "1"], ["currentSleep", "0.5"], ["sleepTime", "23"]]),
  "capacity=333 safety=20 currentAwake=32 awakeTime=1 currentSleep=0.5 sleepTime=23 averageCurrent=1.8125* lifeSleep=146.98*");
eq("sleep, life typed last", run("sleep", "current", [["capacity", "333"], ["currentAwake", "32"], ["awakeTime", "1"], ["currentSleep", "0.5"], ["sleepTime", "23"], ["lifeSleep", "100"]]),
  "capacity=226.56* safety=20 currentAwake=32 awakeTime=1 currentSleep=0.5 sleepTime=23 averageCurrent=1.8125* lifeSleep=100");
eq("wattage, no sleep", run("none", "wattage", [["capacity", "333"], ["voltage", "3.7"], ["wattage", "0.5"]]),
  "capacity=333 safety=20 voltage=3.7 wattage=0.5 current=135.14* life=1.9714*");
eq("wattage, sleep", run("sleep", "wattage", [["capacity", "2000"], ["voltage", "3.7"], ["wattageAwake", "0.2"], ["awakeTime", "2"], ["wattageSleep", "0.01"], ["sleepTime", "22"]]),
  "capacity=2000 safety=20 voltage=3.7 wattageAwake=0.2 currentAwake=54.05* awakeTime=2 wattageSleep=0.01 currentSleep=2.7027* sleepTime=22 averageCurrent=6.982* lifeSleep=229.16*");
eq("safety 100%", run("none", "current", [["capacity", "333"], ["safety", "100"], ["current", "24"]]), "ERR Discharge safety cannot be greater than or equal to 100%.");
eq("capacity 0", run("none", "current", [["capacity", "0"], ["current", "24"]]), "ERR Battery capacity must be greater than zero.");
eq("negative sleep current", run("sleep", "current", [["capacity", "333"], ["currentAwake", "32"], ["awakeTime", "1"], ["currentSleep", "-1"], ["sleepTime", "0"]]),
  "ERR Sleep mode device consumption cannot be negative.");

// ── solving other boxes, units ──
eq("safety solved from the others", run("none", "current", [["safety", "5"], ["capacity", "100"], ["current", "10"], ["life", "9"]]),
  "capacity=100 safety=10* current=10 life=9");
eq("sleep time solved", run("sleep", "current", [["capacity", "333"], ["currentAwake", "32"], ["awakeTime", "1"], ["currentSleep", "0.5"], ["averageCurrent", "1.8125"]]),
  "capacity=333 safety=20 currentAwake=32 awakeTime=1 currentSleep=0.5 sleepTime=23* averageCurrent=1.8125 lifeSleep=146.98*");
eq("Ah and days", run("none", "current", [["capacity", "2", "Ah"], ["current", "0.1", "A"], ["life", "", "days"]]),
  "capacity=2 safety=20 current=0.1 life=0.6667*");
eq("blank", run("none", "current", []), "MISSING capacity,current");
eq("text", run("none", "current", [["capacity", "abc"]]), "ERR Please enter a number for battery capacity.");
eq("life key", lifeKey("sleep"), "lifeSleep");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
