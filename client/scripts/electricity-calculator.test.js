// Plain-Node test suite for the Electricity Calculator engine.
// Run with:
//   node scripts/electricity-calculator.test.js
//
// Expected values are the reference's own answers (calculator.net/electricity-calculator.html), fetched from its server.

import { calculateElectricity, formatKwh, APPLIANCES } from "../src/utils/electricityCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const BASE = { power: "1000", powerUnit: "W", capacity: "100", usage: "24", usageUnit: "hpd", price: "0.15" };
const run = (p) => {
  const r = calculateElectricity({ ...BASE, ...p });
  if (r.missing) return `MISSING ${r.missing.join(",")}`;
  if (r.errors) return `ERR ${r.errors.join(" | ")}`;
  return r.rows.map((x) => `${x.kwhText} ${x.costText}`).join(" ; ");
};

eq("screenshot", run({}), "24 kWh $3.60 ; 168 kWh $25.20 ; 730.6 kWh $109.58 ; 8,766 kWh $1,314.90");
eq("kW", run({ power: "1", powerUnit: "kW" }), "24 kWh $3.60 ; 168 kWh $25.20 ; 730.6 kWh $109.58 ; 8,766 kWh $1,314.90");
eq("BTU/h", run({ power: "10000", powerUnit: "btu" }), "70.34 kWh $10.55 ; 492.4 kWh $73.85 ; 2,141.1 kWh $321.16 ; 25,691 kWh $3,853.59");
eq("hp", run({ power: "1", powerUnit: "hp" }), "17.65 kWh $2.65 ; 123.6 kWh $18.53 ; 537.3 kWh $80.60 ; 6,447 kWh $967.11");
eq("ton", run({ power: "1", powerUnit: "ton" }), "84.4 kWh $12.66 ; 590.8 kWh $88.62 ; 2,569.3 kWh $385.39 ; 30,829 kWh $4,624.31");
// exact factors via a huge price
eq("BTU/h factor", run({ power: "1", powerUnit: "btu", usage: "1", price: "1000000" }), "0.00029 kWh $293.07 ; 0.002 kWh $2,051.50 ; 0.009 kWh $8,921.08 ; 0 kWh $107,044.22");
eq("hp factor", run({ power: "1", powerUnit: "hp", usage: "1", price: "1000000" }), "0.74 kWh $735,498.75 ; 5.1 kWh $5,148,491.25 ; 22.4 kWh $22,388,581.95 ; 269 kWh $268,640,918.44");
eq("ton factor", run({ power: "1", powerUnit: "ton", usage: "1", price: "1000000" }), "3.52 kWh $3,516,852.84 ; 24.6 kWh $24,617,969.89 ; 107.1 kWh $107,053,000.51 ; 1,285 kWh $1,284,530,500.58");
// usage units
eq("minutes per day", run({ usage: "60", usageUnit: "mpd" }), "1 kWh $0.15 ; 7 kWh $1.05 ; 30.4 kWh $4.57 ; 365 kWh $54.79");
eq("hours per week", run({ usage: "7", usageUnit: "hpw" }), "1 kWh $0.15 ; 7 kWh $1.05 ; 30.4 kWh $4.57 ; 365 kWh $54.79");
eq("days per week", run({ usage: "1", usageUnit: "dpw" }), "3.43 kWh $0.51 ; 24 kWh $3.60 ; 104.4 kWh $15.65 ; 1,252 kWh $187.84");
eq("days per month", run({ usage: "1", usageUnit: "dpm" }), "0.79 kWh $0.12 ; 5.5 kWh $0.83 ; 24 kWh $3.60 ; 288 kWh $43.20");
eq("days per year", run({ usage: "1", usageUnit: "dpy" }), "0.066 kWh $0.01 ; 0.5 kWh $0.07 ; 2 kWh $0.30 ; 24 kWh $3.60");
eq("months per year (30.44-day months)", run({ power: "1", powerUnit: "kW", usage: "1", usageUnit: "mpy", price: "1000" }),
  "2 kWh $2,000.16 ; 14 kWh $14,001.15 ; 60.9 kWh $60,885.00 ; 731 kWh $730,560.00");
eq("hours per month", run({ power: "1", powerUnit: "kW", usage: "1", usageUnit: "hpm", price: "1000" }), "0.033 kWh $32.85 ; 0.2 kWh $229.96 ; 1 kWh $1,000.00 ; 12 kWh $11,999.01");
eq("capacity 50%", run({ capacity: "50" }), "12 kWh $1.80 ; 84 kWh $12.60 ; 365.3 kWh $54.79 ; 4,383 kWh $657.45");
eq("capacity 0%", run({ capacity: "0" }), "0 kWh $0.00 ; 0 kWh $0.00 ; 0 kWh $0.00 ; 0 kWh $0.00");
eq("12 months per year", run({ usage: "12", usageUnit: "mpy" }), "24 kWh $3.60 ; 168 kWh $25.20 ; 730.6 kWh $109.59 ; 8,767 kWh $1,315.01");
// small values
eq("LED 7 W, 8 h", run({ power: "7", usage: "8" }), "0.056 kWh $0.01 ; 0.4 kWh $0.06 ; 1.7 kWh $0.26 ; 20 kWh $3.07");
eq("1 W, 1 min", run({ power: "1", usage: "1", usageUnit: "mpd" }), "0 kWh $0.00 ; 0.0001 kWh $0.00 ; 0.0005 kWh $0.00 ; 0.01 kWh $0.00");
eq("0.05 W, 1 h", run({ power: "0.05", usage: "1" }), "0 kWh $0.00 ; 0.0004 kWh $0.00 ; 0.002 kWh $0.00 ; 0 kWh $0.00");
const f = (x, d) => formatKwh(x, d);
eq("scan: day 0.000105", f(0.000105, 2), "0.00011");
eq("scan: day 0.0977", f(0.0977, 2), "0.098");
eq("scan: week 0.0903", f(0.0903, 1), "0.09");
eq("scan: month 0.0001525", f(0.0001525, 1), "0.0002");
eq("scan: year 0.0818", f(0.08182, 0), "0.1");
eq("scan: year 0.0493", f(0.04931, 0), "0");
eq("scan: year 0.0084", f(0.008364, 0), "0.01");
eq("scan: year 0.6209", f(0.6209, 0), "1");
eq("scan: month 37,580.2", f(37580.2179, 1), "37,580.2");
// limits and messages
eq("24 h ok", run({ usage: "24" }).slice(0, 6), "24 kWh");
eq("24.01 h", run({ usage: "24.01" }), "ERR Please provide a reasonable usage number.");
eq("1441 min", run({ usage: "1441", usageUnit: "mpd" }), "ERR Please provide a reasonable usage number.");
eq("744 h/month ok", run({ usage: "744", usageUnit: "hpm" }).slice(0, 9), "24.44 kWh");
eq("745 h/month", run({ usage: "745", usageUnit: "hpm" }), "ERR Please provide a reasonable usage number.");
eq("31 days/month ok", run({ usage: "31", usageUnit: "dpm" }).slice(0, 9), "24.44 kWh");
eq("366.1 days/year", run({ usage: "366.1", usageUnit: "dpy" }), "ERR Please provide a reasonable usage number.");
eq("12.1 months/year", run({ usage: "12.1", usageUnit: "mpy" }), "ERR Please provide a reasonable usage number.");
eq("capacity 150", run({ capacity: "150" }), "ERR Please provide a use/run at capacity value between 0 and 100.");
eq("all bad", run({ power: "0", capacity: "0", usage: "0", price: "-1" }),
  "ERR Please provide a positive appliance power value. | Please provide a positive usage value. | Please provide a positive price value.");
eq("text capacity", run({ capacity: "abc" }), "ERR Please provide a use/run at capacity value between 0 and 100.");
eq("blank", run({ power: "", usage: "" }), "MISSING power,usage");
eq("$ in price", run({ price: "$0.15" }).slice(-9), "$1,314.90");
eq("appliance presets", `${APPLIANCES.length} ${APPLIANCES[1].power}${APPLIANCES[1].powerUnit}`, "29 6000btu");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
