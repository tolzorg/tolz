// RAID Calculator engine — matches omnicalculator.com/other/raid (its calculator definition was read from the page and
// its outputs checked live, see scripts/raid-calculator.test.js).
//
// With n disks of size d (and S sub-arrays for RAID 50/60):
//   RAID 0   usable n·d          read n        write n        fault tolerance 0
//   RAID 1   usable d            read n        write 1        n − 1
//   RAID 1E  usable n·d/2        read (n+1)/2  write (n+1)/2  1
//   RAID 10  usable n·d/2        read n        write n/2      2 (nominally: one disk per mirrored set)
//   RAID 5   usable (n−1)·d      read n − 1    write 1        1
//   RAID 50  usable (n−S)·d      read n − S    write 1        up to S
//   RAID 5E  usable (n−2)·d      read n − 1    write 1        1
//   RAID 5EE usable (n−2)·d      read n − 2    write 1        1
//   RAID 6   usable (n−2)·d      read n − 2    write 1        2
//   RAID 60  usable (n/S−2)·S·d  read (n/S−2)·S write 1       up to 2S
// unavailable = n·d − usable; utilization = usable / (n·d); total cost = disk cost × n; cost per usable TB = total cost /
// usable capacity in TB (10¹² bytes). Like the reference, a target usable capacity can be entered instead of the disk
// size, and the disk size is solved from it (whichever of the two was typed last is kept).
//
// Deviations (flagged to the user): the number of disks and of sub-arrays must be whole numbers (the reference accepts
// e.g. 2.5 disks); RAID 5EE shows only its own read speed gain (n − 2; the reference also shows RAID 5E's n − 1 under the
// same label); a negative disk cost is rejected.

export const DATA_UNITS = [
  { value: "MB", label: "megabytes (MB)", short: "MB", factor: 1e6 },
  { value: "GB", label: "gigabytes (GB)", short: "GB", factor: 1e9 },
  { value: "TB", label: "terabytes (TB)", short: "TB", factor: 1e12 },
  { value: "MiB", label: "mebibytes (MiB)", short: "MiB", factor: 1048576 },
  { value: "GiB", label: "gibibytes (GiB)", short: "GiB", factor: 1073741824 },
  { value: "TiB", label: "tebibytes (TiB)", short: "TiB", factor: 1099511627776 },
];
const factorOf = (unit) => DATA_UNITS.find((u) => u.value === unit)?.factor ?? 1e12;

const DISKS_PER = "disks";
/** In the reference's order. `disks`: the box holding the number of disks (RAID 5E and 5EE share one). */
export const LEVELS = [
  { value: "0", label: "RAID 0", disks: "raid0", min: 2, def: "2" },
  { value: "1", label: "RAID 1", disks: "raid1", min: 2, def: "2" },
  { value: "1E", label: "RAID 1E", disks: "raid1e", min: 3, def: "3" },
  { value: "10", label: "RAID 10", disks: "raid10", min: 4, def: "4" },
  { value: "5", label: "RAID 5", disks: "raid5", min: 3, def: "3" },
  { value: "50", label: "RAID 50 (5+0)", disks: "raid50", min: 6, def: "6", sets: 3 },
  { value: "5E", label: "RAID 5E", disks: "raid5e", min: 4, def: "4" },
  { value: "5EE", label: "RAID 5EE", disks: "raid5e", min: 4, def: "4" },
  { value: "6", label: "RAID 6", disks: "raid6", min: 4, def: "4" },
  { value: "60", label: "RAID 60", disks: "raid60", min: 8, def: "8", sets: 4 },
];
export const levelOf = (value) => LEVELS.find((l) => l.value === value) || LEVELS[0];
/** The prefilled number of disks for each box, as on the reference (sub-arrays default to 2). */
export const DEFAULT_DISKS = Object.fromEntries(LEVELS.map((l) => [l.disks, l.def]));
export const DEFAULT_SETS = "2";

const MIN_MESSAGE = {
  0: "At least 2 disks are required for RAID 0.", 1: "At least 2 disks are required for RAID 1.",
  "1E": "At least 3 disks are required for RAID 1E.", 10: "At least 4 disks are required for RAID 10.",
  5: "At least 3 disks are required for RAID 5.", "5E": "At least 4 disks are required for RAID 5E.",
  "5EE": "At least 4 disks are required for RAID 5EE.", 6: "At least 4 disks are required for RAID 6.",
};
const SETS_MESSAGE = { 50: "RAID 50 needs at least 2 RAID 5 sub-arrays.", 60: "RAID 60 needs at least 2 RAID 6 sub-arrays." };
const CONFIG_MESSAGE = {
  50: "Invalid configuration: RAID 50 should consist of a number of RAID 5 sub-arrays, which require 3 or more disks each.",
  60: "Invalid configuration: RAID 60 should consist of a number of RAID 6 sub-arrays, which require 4 or more disks each.",
};
const SIZE_MESSAGE = "The size of a single disk needs to be greater than zero.";
const TARGET_MESSAGE = "The usable capacity needs to be greater than zero.";

const FAULT = {
  0: { label: "Fault tolerance", unit: DISKS_PER, help: "The number of disks that can fail without data loss." },
  1: { label: "Fault tolerance", unit: DISKS_PER, help: "The number of disks that can fail without data loss." },
  "1E": { label: "Fault tolerance", unit: DISKS_PER, help: "The number of disks that can fail without data loss." },
  10: { label: "Fault tolerance", unit: "", help: "One disk in each RAID 1 set can fail without losing data." },
  5: { label: "Fault tolerance", unit: "disk", help: "The number of disks that can fail without data loss." },
  50: { label: "Fault tolerance (up to)", unit: DISKS_PER, help: "One disk in each RAID 5 set can fail without losing data." },
  "5E": { label: "Fault tolerance", unit: "disk", help: "The number of disks that can fail without data loss." },
  "5EE": { label: "Fault tolerance", unit: "disk", help: "The number of disks that can fail without data loss." },
  6: { label: "Fault tolerance", unit: DISKS_PER, help: "The number of disks that can fail without data loss." },
  60: { label: "Fault tolerance (up to)", unit: DISKS_PER, help: "Two disks per RAID 6 sub-array can fail without losing data." },
};

const num = (t) => {
  const s = String(t ?? "").replace(/,/g, "").trim();
  if (s === "") return null;
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? Number(s) : NaN;
};

/** Usable disks' worth of capacity, read and write gains and fault tolerance for n disks (S sub-arrays). */
function model(level, n, S) {
  switch (level) {
    case "0": return { data: n, read: n, write: n, fault: 0 };
    case "1": return { data: 1, read: n, write: 1, fault: n - 1 };
    case "1E": return { data: n / 2, read: (n + 1) / 2, write: (n + 1) / 2, fault: 1 };
    case "10": return { data: n / 2, read: n, write: n / 2, fault: 2 };
    case "5": return { data: n - 1, read: n - 1, write: 1, fault: 1 };
    case "50": return { data: n - S, read: n - S, write: 1, fault: S };
    case "5E": return { data: n - 2, read: n - 1, write: 1, fault: 1 };
    case "5EE": return { data: n - 2, read: n - 2, write: 1, fault: 1 };
    case "6": return { data: n - 2, read: n - 2, write: 1, fault: 2 };
    default: return { data: (n / S - 2) * S, read: (n / S - 2) * S, write: 1, fault: 2 * S }; // 60
  }
}

/** The reference's notes under the number of disks. */
export function diskNote(level, disksText) {
  const n = num(disksText);
  if (n === null || Number.isNaN(n)) return null;
  if (level === "1" && n > 2) return "While it is possible to use more than 2 drives in RAID 1, other RAID types will offer better capacity utilization.";
  if (level === "1E" && 1 - (n % 2) === 1) {
    return "While it is possible to use an even number of drives for RAID 1E, a better solution is RAID 10, as it allows for multiple disk failures.";
  }
  return null;
}

/**
 * @param {{ level: string, size: string, sizeUnit: string, target: string, targetUnit: string, source: "size"|"target",
 *   disks: string, sets: string, cost: string }} input  `source`: which of disk size / usable capacity was typed last.
 * @returns {{ missing: string[] } | { errors: string[] } | { diskSize, solvedSize: boolean, usable, unavailable, total,
 *   utilization, read, write, fault, faultInfo, totalCost: number|null, costPerTb: number|null }}  capacities in bytes.
 */
export function calculateRaid({ level, size, sizeUnit, target, targetUnit, source = "size", disks, sets, cost }) {
  const lv = levelOf(level);
  const raw = { size: num(size), target: num(target), disks: num(disks), sets: lv.sets ? num(sets) : 1, cost: num(cost) };
  const missing = [];
  if (raw.size === null && raw.target === null) missing.push("size");
  if (raw.disks === null) missing.push("disks");
  if (lv.sets && raw.sets === null) missing.push("sets");
  if (missing.length) return { missing };

  const errors = [];
  const labels = { size: "the disk size", target: "the usable capacity", disks: "the number of disks", sets: "the number of sub-arrays", cost: "the disk cost" };
  for (const k of Object.keys(raw)) if (Number.isNaN(raw[k])) errors.push(`Please enter a number for ${labels[k]}.`);
  if (errors.length) return { errors };

  const useTarget = raw.target !== null && (raw.size === null || source === "target");
  if (!useTarget && !(raw.size > 0)) errors.push(SIZE_MESSAGE);
  if (useTarget && !(raw.target > 0)) errors.push(TARGET_MESSAGE);
  const n = raw.disks;
  const S = raw.sets;
  if (!Number.isInteger(n)) errors.push("The number of disks must be a whole number.");
  else if (lv.sets) {
    if (!Number.isInteger(S)) errors.push("The number of sub-arrays must be a whole number.");
    else {
      if (S < 2) errors.push(SETS_MESSAGE[level]);
      if (!(n / S >= lv.sets && Number.isInteger(n / S))) errors.push(CONFIG_MESSAGE[level]);
    }
  } else {
    if (n < lv.min) errors.push(MIN_MESSAGE[level]);
    if (level === "10" && n % 2 !== 0) errors.push("RAID 10 requires an even number of disks.");
  }
  if (raw.cost !== null && raw.cost < 0) errors.push("The disk cost cannot be negative.");
  if (errors.length) return { errors };

  const m = model(level, n, S);
  const diskSize = useTarget ? (raw.target * factorOf(targetUnit)) / m.data : raw.size * factorOf(sizeUnit);
  const total = n * diskSize;
  const usable = useTarget ? raw.target * factorOf(targetUnit) : m.data * diskSize;
  const totalCost = raw.cost === null ? null : raw.cost * n;
  return {
    diskSize, solvedSize: useTarget, usable, unavailable: total - usable, total,
    utilization: usable / total, read: m.read, write: m.write, fault: m.fault, faultInfo: FAULT[level],
    totalCost, costPerTb: totalCost === null ? null : totalCost / (usable / 1e12),
  };
}

/** A data size in a unit, Omni-rounded (≈ 4 significant decimals), e.g. "2.55", "5,456.97". */
export { fmt } from "./pcbTraceWidthCalculatorEngine.js";
export const inUnit = (bytes, unit) => bytes / factorOf(unit);
/** Money with 2 decimals and grouping, as the reference shows costs ("1,234.50"). */
export const money = (x) => x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
