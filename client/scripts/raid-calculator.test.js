// Plain-Node test suite for the RAID Calculator engine.
// Run with:
//   node scripts/raid-calculator.test.js
//
// Expected values were read live from the reference (omnicalculator.com/other/raid), shown as
// usable | unavailable | utilization % | read | write | fault | cost per TB | total cost.

import { calculateRaid, diskNote, fmt, inUnit, money } from "../src/utils/raidCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const run = (level, size, disks, cost = "", extra = {}) => calculateRaid({
  level, size: String(size), sizeUnit: "TB", target: "", targetUnit: "TB", disks: String(disks), sets: "2", cost: String(cost), ...extra,
});
const sum = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : [fmt(inUnit(r.usable, "TB")), fmt(inUnit(r.unavailable, "TB")), fmt(r.utilization * 100), fmt(r.read), fmt(r.write), r.fault,
    r.costPerTb === null ? "-" : money(r.costPerTb), r.totalCost === null ? "-" : money(r.totalCost)].join(" | "));

// ── live reference values ──
eq("screenshot RAID 0, 3 TB × 2, cost 4", sum(run("0", 3, 2, 4)), "6 | 0 | 100 | 2 | 2 | 0 | 1.33 | 8.00");
eq("RAID 0 without a cost", sum(run("0", 3, 2)), "6 | 0 | 100 | 2 | 2 | 0 | - | -");
eq("RAID 1, 3 disks", sum(run("1", 3, 3, 7)), "3 | 6 | 33.33 | 3 | 1 | 2 | 7.00 | 21.00");
eq("RAID 1E, 4 disks", sum(run("1E", 3, 4, 7)), "6 | 6 | 50 | 2.5 | 2.5 | 1 | 4.67 | 28.00");
eq("RAID 1E, 1.7 TB × 3", sum(run("1E", 1.7, 3, 9.99)), "2.55 | 2.55 | 50 | 2 | 2 | 1 | 11.75 | 29.97");
eq("RAID 10, 6 disks", sum(run("10", 3, 6, 7)), "9 | 9 | 50 | 6 | 3 | 2 | 4.67 | 42.00");
eq("RAID 5E/5EE capacity, 6 disks", sum(run("5EE", 3, 6, 7)), "12 | 6 | 66.67 | 4 | 1 | 1 | 3.50 | 42.00");
eq("RAID 5E read = n − 1", run("5E", 3, 6).read, 5);
eq("RAID 60, 8 disks / 2 sets", sum(run("60", 3, 8, 7)), "12 | 12 | 50 | 4 | 1 | 4 | 4.67 | 56.00");
eq("RAID 50, 6 disks / 2 sets", sum(run("50", 3, 6)), "12 | 6 | 66.67 | 4 | 1 | 2 | - | -");
eq("RAID 5, 3 disks", sum(run("5", 3, 3, 7)), "6 | 3 | 66.67 | 2 | 1 | 1 | 3.50 | 21.00");
// Article worked example: RAID 6, 5 × 1 TB at $50 → 3 TB usable, 60 %, 3x read, 83.33 $/TB; RAID 10, 6 × 1 TB → 100 $/TB.
eq("article RAID 6", sum(run("6", 1, 5, 50)), "3 | 2 | 60 | 3 | 1 | 2 | 83.33 | 250.00");
eq("article RAID 10", sum(run("10", 1, 6, 50)), "3 | 3 | 50 | 6 | 3 | 2 | 100.00 | 300.00");

// ── validation (reference messages) ──
eq("RAID 10 odd", sum(run("10", 3, 5)), "ERR RAID 10 requires an even number of disks.");
eq("RAID 50 7/2", sum(run("50", 3, 7)), "ERR Invalid configuration: RAID 50 should consist of a number of RAID 5 sub-arrays, which require 3 or more disks each.");
eq("RAID 60 1 set", sum(run("60", 3, 8, "", { sets: "1" })), "ERR RAID 60 needs at least 2 RAID 6 sub-arrays.");
eq("RAID 5 min", sum(run("5", 3, 2)), "ERR At least 3 disks are required for RAID 5.");
eq("RAID 0 min", sum(run("0", 3, 1)), "ERR At least 2 disks are required for RAID 0.");
eq("zero size", sum(run("0", 0, 2)), "ERR The size of a single disk needs to be greater than zero.");
eq("fractional disks", sum(run("0", 3, 2.5)), "ERR The number of disks must be a whole number.");
eq("negative cost", sum(run("0", 3, 2, -1)), "ERR The disk cost cannot be negative.");
eq("blank", sum(run("0", "", "")), "MISSING size,disks");
eq("text", sum(run("0", "abc", 2)), "ERR Please enter a number for the disk size.");

// ── units and solving the disk size from a usable capacity ──
eq("GiB disk shown in GB", fmt(inUnit(run("5", 500, 4, "", { sizeUnit: "GiB" }).usable, "GB")), "1,610.6");
const solved = calculateRaid({ level: "6", size: "", sizeUnit: "TB", target: "12", targetUnit: "TB", disks: "6", sets: "2", cost: "" });
eq("solve disk size", `${solved.solvedSize} ${fmt(inUnit(solved.diskSize, "TB"))} ${fmt(inUnit(solved.unavailable, "TB"))}`, "true 3 6");
const recent = calculateRaid({ level: "0", size: "1", sizeUnit: "TB", target: "8", targetUnit: "TB", source: "size", disks: "2", sets: "2", cost: "" });
eq("disk size typed last wins", fmt(inUnit(recent.usable, "TB")), "2");

// ── notes ──
eq("RAID 1 note", diskNote("1", "3")?.slice(0, 30), "While it is possible to use mo");
eq("RAID 1E even note", diskNote("1E", "4")?.slice(0, 30), "While it is possible to use an");
eq("RAID 1E odd: no note", diskNote("1E", "3"), null);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
