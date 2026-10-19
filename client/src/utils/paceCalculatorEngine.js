// Pace Calculator engine — matches calculator.net/pace-calculator.html (four
// GET forms, decoded with live probes; see scripts/pace-calculator.test.js):
// the Pace / Time / Distance calculator, the Multipoint Pace Calculator, the
// Pace Converter and the Finish Time Calculator.
//
// Everything works in seconds per meter. 1 mile = 1.60935 km (the reference's
// factor, confirmed live), 1 yard = 0.9144 m.
// Times ("hh:mm:ss") are lenient like the reference: only the last three parts
// count, parts may be blank (0), decimal or over 59 ("5:70" = 6:10), and the
// total must be above 0. Distances and speeds are plain positive numbers (no
// thousands commas).

import { roundTo } from "./bmiCalculatorEngine.js";

const MILE = 1609.35; // the reference's mile (1.60935 km), not the exact 1,609.344 m — confirmed live
const YARD = 0.9144;
const UNIT_METERS = { Miles: MILE, Kilometers: 1000, Meters: 1, Yards: YARD };

export const DISTANCE_UNITS = ["Miles", "Kilometers", "Meters", "Yards"];
export const PACE_UNITS = [
  { value: "tpm", label: "Per Mile", time: true },
  { value: "tpk", label: "Per Kilometer", time: true },
  { value: "mph", label: "Miles Per Hour" },
  { value: "kph", label: "Kilometers Per Hour" },
  { value: "mpm", label: "Meters Per Minute" },
  { value: "mps", label: "Meters Per Second" },
  { value: "ypm", label: "Yards Per Minute" },
  { value: "yps", label: "Yards Per Second" },
];
const PACE_LABEL = Object.fromEntries(PACE_UNITS.map((u) => [u.value, u.label]));
export const isTimeUnit = (unit) => unit === "tpm" || unit === "tpk";

// "-- Or pick an event --" presets: [value, label, distance, unit].
export const EVENTS = [
  ["M", "Marathon", "42.195", "Kilometers"],
  ["HM", "Half-Marathon", "21.0975", "Kilometers"],
  ["1K", "1K", "1", "Kilometers"],
  ["5K", "5K", "5", "Kilometers"],
  ["10K", "10K", "10", "Kilometers"],
  ["1M", "1 Miles", "1", "Miles"],
  ["5M", "5 Miles", "5", "Miles"],
  ["10M", "10 Miles", "10", "Miles"],
  ["800m", "800 meters", "800", "Meters"],
  ["1500m", "1500 meters", "1500", "Meters"],
];

// Example values (the reference's), used as placeholders.
export const PACE_DEFAULTS = { time: "00:50:25", distance: "5", distanceUnit: "Kilometers", pace: "00:08:10", paceUnit: "tpm" };
export const MULTIPOINT_DEFAULTS = [["1", "3:25"], ["2", "6:55"], ["3", "10:25"], ["4", "14:01"], ["5", "17:25"]];
export const CONVERTER_DEFAULTS = { value: "5:30", from: "tpm", to: "tpk" };
export const FINISH_DEFAULTS = { distanceNow: "1", nowUnit: "Kilometers", time: "6:15", distanceFull: "5", fullUnit: "Kilometers" };

const NUMBER = /^(\d+\.?\d*|\.\d+)$/;

/** Seconds from "hh:mm:ss" (lenient), or NaN. */
export function parseTime(text) {
  const parts = String(text ?? "").trim().split(":");
  if (parts.length === 1 && parts[0] === "") return NaN;
  const last3 = parts.slice(-3);
  while (last3.length < 3) last3.unshift("");
  if (!last3.every((p) => p === "" || NUMBER.test(p))) return NaN;
  const [h, m, s] = last3.map((p) => (p === "" ? 0 : Number(p)));
  const total = h * 3600 + m * 60 + s;
  return total > 0 ? total : NaN;
}

/** A positive plain number, or NaN. */
export function parsePositive(text) {
  const t = String(text ?? "").trim();
  return NUMBER.test(t) && Number(t) > 0 ? Number(t) : NaN;
}

/** Rounded, trailing zeros dropped, thousands commas: 3862.44, 1,000, 2.7. */
export function fmtNum(value, decimals) {
  return roundTo(value, decimals).toLocaleString("en-US", { maximumFractionDigits: decimals });
}
/** A speed with 2 decimals; below 0.1 it keeps 2 significant digits (0.036), below 0.0001 it is 0. */
export function fmtSpeed(value) {
  if (value >= 0.1) return fmtNum(value, 2);
  if (value < 0.0001) return "0";
  return String(Number(value.toPrecision(2)));
}
/** Fixed decimals with commas: 304.80. */
const fmtFixed = (value, decimals) => roundTo(value, decimals).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "1 hour, 5 minutes, and 3 seconds", "16 minutes and 13.66 seconds", "2 hours, 0.5 seconds". */
export function durationWords(seconds) {
  const total = roundTo(seconds, 2);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total - h * 3600) / 60);
  const s = roundTo(total - h * 3600 - m * 60, 2);
  const parts = [];
  if (h) parts.push(plural(h, "hour"));
  if (m) parts.push(plural(m, "minute"));
  if (s) parts.push(plural(s, "second"));
  if (!parts.length) return "0 seconds";
  if (h) return parts.length === 3 ? `${parts[0]}, ${parts[1]}, and ${parts[2]}` : parts.join(", ");
  return parts.join(" and ");
}

/** Race / split clock to whole seconds: "4:02", "1:21:08". */
export function clock(seconds) {
  const total = Math.round(roundTo(seconds, 6));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** The multipoint table's clock: seconds to 0.01, unpadded ("7:0", "15:2.67", "1:05:3.5"). */
function mpClock(seconds) {
  const total = roundTo(seconds, 2);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total - h * 3600) / 60);
  const s = String(roundTo(total - h * 3600 - m * 60, 2));
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** A pace (seconds per meter) in a pace unit: seconds for tpm / tpk, speed otherwise. */
function inUnit(spm, unit) {
  switch (unit) {
    case "tpm": return spm * MILE;
    case "tpk": return spm * 1000;
    case "mph": return 3600 / (spm * MILE);
    case "kph": return 3.6 / spm;
    case "mpm": return 60 / spm;
    case "mps": return 1 / spm;
    case "ypm": return 60 / (spm * YARD);
    case "yps": return 1 / (spm * YARD);
    default: return NaN;
  }
}
/** Seconds per meter from a pace value in a unit. */
function fromUnit(value, unit) {
  switch (unit) {
    case "tpm": return value / MILE;
    case "tpk": return value / 1000;
    case "mph": return 3600 / (value * MILE);
    case "kph": return 3.6 / value;
    case "mpm": return 60 / value;
    case "mps": return 1 / value;
    case "ypm": return 60 / (value * YARD);
    case "yps": return 1 / (value * YARD);
    default: return NaN;
  }
}

const TIME_ERROR = "Please provide a valid time in the format of hh:mm:ss.";
const PACE_TIME_ERROR = "Please provide a valid pace value in the format of hh:mm:ss.";
const PACE_SPEED_ERROR = "Please provide a positive pace value.";
const DISTANCE_ERROR = "Please provide positive distance value.";

function readPace(text, unit) {
  return isTimeUnit(unit) ? parseTime(text) : parsePositive(text);
}

const RACES_LEFT = [["1K", 1000], ["3K", 3000], ["5K", 5000], ["10K", 10000], ["Marathon", 42195], ["400 meters", 400]];
const RACES_RIGHT = [["1 mile", MILE], ["3 miles", 3 * MILE], ["5 miles", 5 * MILE], ["10 miles", 10 * MILE], ["½ Marathon", 21097.5], ["800 meters", 800]];

/** Popular race times and (above 2 km) the per-km and per-mile splits. */
function racesAndSplits(spm, meters) {
  const races = RACES_LEFT.map(([label, m], i) => [label, clock(spm * m), RACES_RIGHT[i][0], clock(spm * RACES_RIGHT[i][1])]);
  let splits = null;
  if (meters > 2000) {
    const km = Math.floor(roundTo(meters / 1000, 9));
    const mi = Math.floor(roundTo(meters / MILE, 9));
    splits = {
      km: Array.from({ length: km }, (_, i) => [`${i + 1}K`, clock(spm * 1000 * (i + 1))]),
      miles: Array.from({ length: mi }, (_, i) => [`${i + 1} mile`, clock(spm * MILE * (i + 1))]),
    };
  }
  return { races, splits };
}

/**
 * Pace / Time / Distance calculator.
 * @param {{ mode: "pace" | "time" | "distance", time, distance, distanceUnit, pace, paceUnit }} input  strings.
 */
export function calculatePace(input) {
  const mode = ["time", "distance"].includes(input.mode) ? input.mode : "pace";
  const unitM = UNIT_METERS[input.distanceUnit] ?? 1000;
  const errors = [];
  let time = NaN;
  let meters = NaN;
  let paceValue = NaN;
  if (mode !== "time") { time = parseTime(input.time); if (Number.isNaN(time)) errors.push(TIME_ERROR); }
  if (mode !== "distance") { meters = parsePositive(input.distance) * unitM; if (Number.isNaN(meters)) errors.push(DISTANCE_ERROR); }
  if (mode !== "pace") {
    paceValue = readPace(input.pace, input.paceUnit);
    if (Number.isNaN(paceValue)) errors.push(isTimeUnit(input.paceUnit) ? PACE_TIME_ERROR : PACE_SPEED_ERROR);
  }
  if (errors.length) return { errors };

  let spm;
  const out = { mode };
  if (mode === "pace") {
    spm = time / meters;
    out.paces = [
      [durationWords(inUnit(spm, "tpm")), "per mile"],
      [durationWords(inUnit(spm, "tpk")), "per kilometer"],
      [fmtSpeed(inUnit(spm, "mph")), "miles/hour"],
      [fmtSpeed(inUnit(spm, "kph")), "kilometers/hour"],
      [fmtSpeed(inUnit(spm, "mpm")), "meters/minute"],
      [fmtSpeed(inUnit(spm, "mps")), "meters/second"],
    ];
  } else if (mode === "time") {
    spm = fromUnit(paceValue, input.paceUnit);
    out.time = durationWords(spm * meters);
  } else {
    spm = fromUnit(paceValue, input.paceUnit);
    meters = time / spm;
    out.distances = [
      [fmtNum(meters / MILE, 3), "Miles"],
      [fmtNum(meters / 1000, 3), "Kilometers"],
      [fmtNum(meters, 1), "Meters"],
      [fmtNum(meters / YARD, 1), "Yards"],
    ];
  }
  return { ...out, ...racesAndSplits(spm, meters) };
}

/**
 * Multipoint Pace Calculator.
 * @param {{ points: { distance, unit, time }[], paceUnit }} input  points in order; reading stops at the first blank
 *   (or zero) distance.
 */
export function calculateMultipoint(input) {
  const unit = PACE_UNITS.some((u) => u.value === input.paceUnit) ? input.paceUnit : "tpm";
  // Rows are read until the first blank (or zero) distance, in one pass: each row
  // reports a bad distance or time, then whether it fails to go beyond the row
  // before it (compared only where both values are valid).
  const filled = [];
  for (const p of input.points) {
    const raw = String(p.distance ?? "").trim();
    if (raw === "" || (NUMBER.test(raw) && Number(raw) === 0)) break;
    filled.push(p);
  }
  const errors = [];
  const parsed = filled.map((p) => ({ meters: parsePositive(p.distance) * (UNIT_METERS[p.unit] ?? 1000), time: parseTime(p.time) }));
  parsed.forEach((p, i) => {
    const n = i + 1;
    const prev = parsed[i - 1];
    if (Number.isNaN(p.meters)) errors.push(`Please provide a positive distance for item #${n}.`);
    if (prev && p.meters <= prev.meters) errors.push(`Distance for item #${n} should be larger than previous distances.`);
    if (Number.isNaN(p.time)) errors.push(`Please provide a valid time in the format of hh:mm:ss for item #${n}.`);
    if (prev && p.time <= prev.time) errors.push(`Time for item #${n} should be larger than previous time.`);
  });
  const points = parsed;
  if (errors.length) return { errors };
  if (!points.length) return { errors: ["Please provide at least one point to calculate."] };

  const firstUnit = input.points[0].unit in UNIT_METERS ? input.points[0].unit : "Kilometers";
  const time = isTimeUnit(unit);
  const paceText = (spm) => (time ? mpClock(inUnit(spm, unit)) : fmtFixed(inUnit(spm, unit), 2));
  const rows = points.map((p, i) => {
    const prev = i ? points[i - 1] : { meters: 0, time: 0 };
    const sectionM = p.meters - prev.meters;
    const sectionT = p.time - prev.time;
    return {
      distance: fmtNum(sectionM / UNIT_METERS[firstUnit], 2),
      time: mpClock(sectionT),
      pace: paceText(sectionT / sectionM),
      accumulated: paceText(p.time / p.meters),
      chartValue: inUnit(sectionT / sectionM, unit),
    };
  });
  const last = points[points.length - 1];
  const avg = last.time / last.meters;
  return {
    unitLabel: PACE_LABEL[unit],
    paceHeader: time ? `H:M:S ${PACE_LABEL[unit]}` : PACE_LABEL[unit],
    chartTitle: time ? `Pace (Seconds ${PACE_LABEL[unit]})` : `Pace (${PACE_LABEL[unit]})`,
    distanceUnit: firstUnit,
    rows,
    average: time ? `${durationWords(inUnit(avg, unit))} ${PACE_LABEL[unit]}` : `${fmtNum(inUnit(avg, unit), 2)} ${PACE_LABEL[unit]}`,
  };
}

/** Pace Converter: { value, from, to } → "5 minutes and 30 seconds Per Mile = 3 minutes and 25.05 seconds Per Kilometer". */
export function convertPace(input) {
  const value = readPace(input.value, input.from);
  if (Number.isNaN(value)) return { errors: [isTimeUnit(input.from) ? PACE_TIME_ERROR : PACE_SPEED_ERROR] };
  const spm = fromUnit(value, input.from);
  const describe = (unit, v, rawText) => `${isTimeUnit(unit) ? durationWords(v) : rawText ?? fmtNum(v, 3)} ${PACE_LABEL[unit]}`;
  return {
    from: describe(input.from, value, isTimeUnit(input.from) ? null : String(input.value).trim()),
    to: describe(input.to, inUnit(spm, input.to)),
  };
}

/** Finish Time Calculator. */
export function calculateFinishTime(input) {
  const now = parsePositive(input.distanceNow) * (UNIT_METERS[input.nowUnit] ?? 1000);
  const time = parseTime(input.time);
  const fullNumber = parsePositive(input.distanceFull);
  const full = fullNumber * (UNIT_METERS[input.fullUnit] ?? 1000);
  const errors = [];
  if (Number.isNaN(now)) errors.push('Please provide a positive "current distance traveled" value.');
  if (Number.isNaN(time)) errors.push('Please provide a valid "elapsed time" value in the format of hh:mm:ss.');
  if (Number.isNaN(full)) errors.push('Please provide a positive "full distance" value.');
  if (errors.length) return { errors };
  const spm = time / now;
  return {
    finish: durationWords(spm * full),
    distance: `${String(input.distanceFull).trim()} ${input.fullUnit}`,
    paces: [
      `${durationWords(inUnit(spm, "tpm"))} Per Mile`,
      `${durationWords(inUnit(spm, "tpk"))} Per Kilometer`,
      ...["mph", "kph", "mpm", "mps", "ypm", "yps"].map((u) => `${fmtSpeed(inUnit(spm, u))} ${PACE_LABEL[u]}`),
    ],
  };
}
