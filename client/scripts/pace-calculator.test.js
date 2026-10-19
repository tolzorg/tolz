// Plain-Node test suite for the Pace Calculator engine (all four calculators).
// Run with:
//   node scripts/pace-calculator.test.js
//
// Every expected figure below was read from the LIVE reference
// (calculator.net/pace-calculator.html) via plain GET requests. Scratch
// comparators also diffed random scenarios: pace / time / distance 700/700
// (race tables and splits included), multipoint 599/600 (the miss: a distance
// typed as "-0.0"), converter and finish time 180/180.

import {
  calculatePace, calculateMultipoint, convertPace, calculateFinishTime, durationWords, parseTime,
} from "../src/utils/paceCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

const pace = (o = {}) => calculatePace({ mode: "pace", time: "00:50:25", distance: "5", distanceUnit: "Kilometers", pace: "00:08:10", paceUnit: "tpm", ...o });
const head = (r) => {
  if (r.errors) return r.errors.join(" ");
  if (r.mode === "pace") return r.paces.map((p) => p.join(" ")).join(" | ");
  if (r.mode === "time") return r.time;
  return r.distances.map((d) => d.join(" ")).join(" | ");
};

// ── Pace / Time / Distance (the reference's examples) ──
eq("pace", head(pace()), "16 minutes and 13.66 seconds per mile | 10 minutes and 5 seconds per kilometer | 3.7 miles/hour | 5.95 kilometers/hour | 99.17 meters/minute | 1.65 meters/second");
eq("races", pace().races.map((r) => r.join(" ")).join(" | "),
  "1K 10:05 1 mile 16:14 | 3K 30:15 3 miles 48:41 | 5K 50:25 5 miles 1:21:08 | 10K 1:40:50 10 miles 2:42:17 | Marathon 7:05:28 ½ Marathon 3:32:44 | 400 meters 4:02 800 meters 8:04");
eq("splits", `${pace().splits.km.map((s) => s.join(" ")).join(", ")} / ${pace().splits.miles.map((s) => s.join(" ")).join(", ")}`,
  "1K 10:05, 2K 20:10, 3K 30:15, 4K 40:20, 5K 50:25 / 1 mile 16:14, 2 mile 32:27, 3 mile 48:41");
eq("time mode", head(pace({ mode: "time" })), "25 minutes and 22.35 seconds");
eq("distance mode", head(pace({ mode: "distance" })), "6.173 Miles | 9.935 Kilometers | 9,935.3 Meters | 10,865.3 Yards");
eq("distance mode splits", `${pace({ mode: "distance" }).splits.km.length}K ${pace({ mode: "distance" }).splits.miles.length}mi`, "9K 6mi");
eq("marathon pace", head(pace({ time: "3:30:00", distance: "42.195" })).split(" | ")[0], "8 minutes and 0.57 seconds per mile");
eq("800 m", head(pace({ time: "1:5", distance: "800", distanceUnit: "Meters" })).split(" | ").slice(0, 2).join(" | "), "2 minutes and 10.76 seconds per mile | 1 minute and 21.25 seconds per kilometer");
eq("800 m: no splits", pace({ time: "1:5", distance: "800", distanceUnit: "Meters" }).splits, null);
eq("2 km: no splits", pace({ distance: "2" }).splits, null);
eq("2.01 km: splits", pace({ distance: "2.01" }).splits.km.length, 2);
eq("1.25 mi: splits", pace({ distance: "1.25", distanceUnit: "Miles" }).splits.miles.length, 1);
eq("25 s / mile", head(pace({ time: "25", distance: "1", distanceUnit: "Miles" })), "25 seconds per mile | 15.53 seconds per kilometer | 144 miles/hour | 231.75 kilometers/hour | 3,862.44 meters/minute | 64.37 meters/second");
eq("kph pace mode", head(pace({ time: "1:00:00", distance: "30" })).split(" | ").slice(0, 2).join(" | "), "3 minutes and 13.12 seconds per mile | 2 minutes per kilometer");
eq("time 10 hours", head(pace({ mode: "time", distance: "100", distanceUnit: "Miles", pace: "6:00" })), "10 hours");
eq("100 mi splits", pace({ mode: "time", distance: "100", distanceUnit: "Miles", pace: "6:00" }).splits.km.length, 160);
eq("kph pace", head(pace({ mode: "time", pace: "12", paceUnit: "kph", distance: "10" })), "50 minutes");
eq("mps distance", head(pace({ mode: "distance", pace: "5", paceUnit: "mps", time: "1:00:00" })), "11.185 Miles | 18 Kilometers | 18,000 Meters | 19,685 Yards");
eq("small speeds", head(pace({ time: "27:46:40", distance: "1", distanceUnit: "Miles" })).split(" | ").slice(2).join(" | "), "0.036 miles/hour | 0.058 kilometers/hour | 0.97 meters/minute | 0.016 meters/second");
eq("tiny speeds", head(pace({ time: "27:46:40", distance: "1", distanceUnit: "Meters" })).split(" | ").slice(2).join(" | "), "0 miles/hour | 0 kilometers/hour | 0.0006 meters/minute | 0 meters/second");

// ── Duration wording ──
eq("h m s", durationWords(3600 + 5 * 60 + 5), "1 hour, 5 minutes, and 5 seconds");
eq("h m s singular", durationWords(3661), "1 hour, 1 minute, and 1 second");
eq("h m", durationWords(3 * 3600 + 60), "3 hours, 1 minute");
eq("h s", durationWords(3601), "1 hour, 1 second");
eq("h 0.5 s", durationWords(7200.5), "2 hours, 0.5 seconds");
eq("m s", durationWords(973.657), "16 minutes and 13.66 seconds");
eq("s only", durationWords(15.534), "15.53 seconds");
eq("1 second", durationWords(1), "1 second");

// ── Time parsing (lenient, like the reference) ──
eq("5:3", parseTime("5:3"), 303);
eq(":30", parseTime(":30"), 30);
eq("5:70 overflows", parseTime("5:70"), 370);
eq("5::00 = 5 h", parseTime("5::00"), 18000);
eq("last three parts", parseTime("1:2:3:4"), 7384);
eq("spaces", parseTime(" 5:00 "), 300);
eq("decimals", parseTime("1:30.25"), 90.25);
eq("letters", Number.isNaN(parseTime("a:30")), true);
eq("zero", Number.isNaN(parseTime("0")), true);
eq("negative", Number.isNaN(parseTime("-5")), true);

// ── Pace calculator errors ──
eq("bad time", head(pace({ time: "abc" })), "Please provide a valid time in the format of hh:mm:ss.");
eq("zero distance", head(pace({ distance: "0" })), "Please provide positive distance value.");
eq("comma distance", head(pace({ distance: "1,000", distanceUnit: "Meters" })), "Please provide positive distance value.");
eq("blank pace", head(pace({ mode: "time", pace: "" })), "Please provide a valid pace value in the format of hh:mm:ss.");
eq("speed pace", head(pace({ mode: "time", pace: "1:30", paceUnit: "kph" })), "Please provide a positive pace value.");
eq("time + pace errors", head(pace({ mode: "distance", time: "abc", pace: "abc" })), "Please provide a valid time in the format of hh:mm:ss. Please provide a valid pace value in the format of hh:mm:ss.");
eq("time + distance errors", head(pace({ time: "abc", distance: "-1" })), "Please provide a valid time in the format of hh:mm:ss. Please provide positive distance value.");

// ── Multipoint ──
const km = (pts, paceUnit = "tpm") => calculateMultipoint({ paceUnit, points: pts.map(([distance, time, unit = "Kilometers"]) => ({ distance, time, unit })) });
const mp = (r) => (r.errors ? r.errors.join(" ") : `${r.rows.map((x) => `${x.distance} ${x.time} ${x.pace} ${x.accumulated}`).join(" | ")} :: ${r.average}`);
const EX = [["1", "3:25"], ["2", "6:55"], ["3", "10:25"], ["4", "14:01"], ["5", "17:25"]];
eq("multipoint example", mp(km(EX)), "1 3:25 5:29.92 5:29.92 | 1 3:30 5:37.96 5:33.94 | 1 3:30 5:37.96 5:35.28 | 1 3:36 5:47.62 5:38.37 | 1 3:24 5:28.31 5:36.35 :: 5 minutes and 36.35 seconds Per Mile");
eq("multipoint kph", mp(km(EX.slice(0, 3), "kph")), "1 3:25 17.56 17.56 | 1 3:30 17.14 17.35 | 1 3:30 17.14 17.28 :: 17.28 Kilometers Per Hour");
eq("multipoint per km", mp(km(EX.slice(0, 3), "tpk")), "1 3:25 3:25 3:25 | 1 3:30 3:30 3:27.5 | 1 3:30 3:30 3:28.33 :: 3 minutes and 28.33 seconds Per Kilometer");
eq("mixed units", mp(km([["1", "7:00", "Miles"], ["3", "20:00", "Kilometers"]])), "1 7:0 7:0 7:0 | 0.86 13:0 15:2.67 10:43.74 :: 10 minutes and 43.74 seconds Per Mile");
eq("hours", mp(km([["1", "1:05:03.5", "Miles"], ["2", "2:30:00", "Miles"]])), "1 1:05:3.5 1:05:3.5 1:05:3.5 | 1 1:24:56.5 1:24:56.5 1:15:0 :: 1 hour, 15 minutes Per Mile");
eq("fixed 2 decimals", mp(km([["1.2345", "0:01", "Meters"], ["1000", "3:00", "Yards"]], "mpm")), "1.23 0:1 74.07 74.07 | 913.17 2:59 306.09 304.80 :: 304.8 Meters Per Minute");
eq("seconds carry", mp(km([["1", "0:59.999"], ["2", "1:59.995"]], "tpk")), "1 1:0 1:0 1:0 | 1 1:0 1:0 1:0 :: 1 minute Per Kilometer");
eq("stops at a blank row", km([["1", "4:00"], ["", ""], ["3", "12:00"]], "tpk").rows.length, 1);
eq("distance order", mp(km([["2", "4:00"], ["1", "6:00"]])), "Distance for item #2 should be larger than previous distances.");
eq("time order", mp(km([["1", "4:00"], ["2", "3:00"]])), "Time for item #2 should be larger than previous time.");
eq("bad time", mp(km([["1", "abc"]])), "Please provide a valid time in the format of hh:mm:ss for item #1.");
eq("all errors in one pass", mp(km([["3216.130", "13:44", "Yards"], ["abc", "13:13.9", "Yards"], ["8659.7", "x", "Yards"], ["8112.9", "x", "Yards"]])),
  "Please provide a positive distance for item #2. Time for item #2 should be larger than previous time. Please provide a valid time in the format of hh:mm:ss for item #3. Distance for item #4 should be larger than previous distances. Please provide a valid time in the format of hh:mm:ss for item #4.");
eq("no points", mp(km([])), "Please provide at least one point to calculate.");
eq("chart title", km(EX).chartTitle, "Pace (Seconds Per Mile)");

// ── Pace converter ──
const cv = (value, from, to) => { const r = convertPace({ value, from, to }); return r.errors ? r.errors.join(" ") : `${r.from} = ${r.to}`; };
eq("converter example", cv("5:30", "tpm", "tpk"), "5 minutes and 30 seconds Per Mile = 3 minutes and 25.05 seconds Per Kilometer");
eq("to mph", cv("5:30", "tpm", "mph"), "5 minutes and 30 seconds Per Mile = 10.909 Miles Per Hour");
eq("kph to per mile", cv("10", "kph", "tpm"), "10 Kilometers Per Hour = 9 minutes and 39.37 seconds Per Mile");
eq("mps to yps", cv("3", "mps", "yps"), "3 Meters Per Second = 3.281 Yards Per Second");
eq("hours", cv("1:05:03", "tpk", "tpm"), "1 hour, 5 minutes, and 3 seconds Per Kilometer = 1 hour, 44 minutes, and 41.29 seconds Per Mile");
eq("echo as typed", cv("12345.678", "mpm", "ypm"), "12345.678 Meters Per Minute = 13,501.398 Yards Per Minute");
eq("bad time", cv("abc", "tpm", "tpk"), "Please provide a valid pace value in the format of hh:mm:ss.");
eq("bad speed", cv("abc", "kph", "tpk"), "Please provide a positive pace value.");

// ── Finish time ──
const ft = (o) => { const r = calculateFinishTime({ distanceNow: "1", nowUnit: "Kilometers", time: "6:15", distanceFull: "5", fullUnit: "Kilometers", ...o }); return r.errors ? r.errors.join(" ") : `${r.finish} to finish ${r.distance} :: ${r.paces.join(" | ")}`; };
eq("finish example", ft({}), "31 minutes and 15 seconds to finish 5 Kilometers :: 10 minutes and 3.51 seconds Per Mile | 6 minutes and 15 seconds Per Kilometer | 5.97 Miles Per Hour | 9.6 Kilometers Per Hour | 160 Meters Per Minute | 2.67 Meters Per Second | 174.98 Yards Per Minute | 2.92 Yards Per Second");
eq("marathon", ft({ distanceNow: "10", time: "1:05:00", distanceFull: "42.195" }).split(" :: ")[0], "4 hours, 34 minutes, and 16.05 seconds to finish 42.195 Kilometers");
eq("mixed units", ft({ distanceNow: "400", nowUnit: "Meters", time: "1:30", distanceFull: "1500", fullUnit: "Yards" }).split(" :: ")[0], "5 minutes and 8.61 seconds to finish 1500 Yards");
eq("already past", ft({ distanceNow: "6", time: "30:00" }).split(" :: ")[0], "25 minutes to finish 5 Kilometers");
eq("all errors", ft({ distanceNow: "abc", time: "abc", distanceFull: "abc" }),
  'Please provide a positive "current distance traveled" value. Please provide a valid "elapsed time" value in the format of hh:mm:ss. Please provide a positive "full distance" value.');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
