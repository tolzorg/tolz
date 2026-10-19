// Time entry for the Pace Calculator: one box per part (hrs | min | sec) with a
// unit dropdown, converted to seconds for the engine. Multi-part units show just
// the dropdown arrow, since each box already names its part.

import { roundTo } from "../../../utils/bmiCalculatorEngine";

export const TIME_UNITS = [
  { value: "sec", label: "seconds (sec)", short: "sec" },
  { value: "min", label: "minutes (min)", short: "min" },
  { value: "hrs", label: "hours (hrs)", short: "hrs" },
  { value: "min-sec", label: "minutes / seconds (min / sec)", short: "", parts: ["min", "sec"] },
  { value: "hrs-min", label: "hours / minutes (hrs / min)", short: "", parts: ["hrs", "min"] },
  { value: "hms", label: "hours / minutes / seconds (hrs / min / sec)", short: "", parts: ["hrs", "min", "sec"] },
];

const FACTORS = { sec: [1], min: [60], hrs: [3600], "min-sec": [60, 1], "hrs-min": [3600, 60], hms: [3600, 60, 1] };
const NUMBER = /^(\d+\.?\d*|\.\d+)$/;

export const boxCount = (unit) => FACTORS[unit].length;
export const blankTime = (unit) => Array(boxCount(unit)).fill("");
export const isBlank = (values) => values.every((v) => String(v ?? "").trim() === "");

/** Seconds from the boxes (a blank box counts as 0), or NaN when all are blank or one is not a number. */
export function timeToSeconds(unit, values) {
  if (isBlank(values)) return NaN;
  let total = 0;
  for (const [i, f] of FACTORS[unit].entries()) {
    const t = String(values[i] ?? "").trim();
    if (t === "") continue;
    if (!NUMBER.test(t)) return NaN;
    total += Number(t) * f;
  }
  return total;
}

/** The text the engine reads: a number of seconds, or "" (shown as an invalid time). */
export function timeToEngine(unit, values) {
  const s = timeToSeconds(unit, values);
  return Number.isNaN(s) ? "" : String(s);
}

/** The boxes for a number of seconds in a unit (used for placeholders and when switching unit). */
export function secondsToTime(unit, seconds) {
  if (!(seconds > 0)) return blankTime(unit);
  const t = (x, d) => String(roundTo(x, d));
  switch (unit) {
    case "sec": return [t(seconds, 2)];
    case "min": return [t(seconds / 60, 4)];
    case "hrs": return [t(seconds / 3600, 5)];
    case "min-sec": { const m = Math.floor(seconds / 60); return [String(m), t(seconds - m * 60, 2)]; }
    case "hrs-min": { const h = Math.floor(seconds / 3600); return [String(h), t((seconds - h * 3600) / 60, 4)]; }
    default: {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds - h * 3600) / 60);
      return [String(h), String(m), t(seconds - h * 3600 - m * 60, 2)];
    }
  }
}
