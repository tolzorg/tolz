#!/usr/bin/env node
// Reference/regression test suite for the CPS Tester measurement engine
// (src/utils/cpsEngine.js). Plain Node + assert — no test framework
// dependency needed for a pure-function measurement engine, matching
// this project's established convention for engine-level test scripts.
//
// Run with: node scripts/cps-engine.test.js

import {
  computeAverageCps, computePeakCps, computeRollingCpsAt, computeClickIntervals,
  getCpsRating, validateCustomDuration, isValidPointerClick, isValidKeyPress, formatKeyLabel,
  UNBINDABLE_KEY_CODES, CpsEngine,
} from "../src/utils/cpsEngine.js";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(detail ? `${name}: ${detail}` : name); }
}
function near(a, b, tol = 1e-9) { return Math.abs(a - b) <= tol; }

// ─────────────────────────────────────────────────────────────────
// Section 31 — Average CPS
// ─────────────────────────────────────────────────────────────────
ok("20 clicks / 5 sec = 4.00 CPS", near(computeAverageCps(20, 5), 4));
ok("100 clicks / 10 sec = 10.00 CPS", near(computeAverageCps(100, 10), 10));
ok("0 clicks / 5 sec = 0.00 CPS", near(computeAverageCps(0, 5), 0));
ok("1 click / 5 sec = 0.20 CPS", near(computeAverageCps(1, 5), 0.2));
ok("50 clicks / 1 sec = 50.00 CPS", near(computeAverageCps(50, 1), 50));
ok("negative duration never produces negative/NaN/Infinity CPS", computeAverageCps(10, -5) === 0);
ok("negative clicks never produce negative CPS", computeAverageCps(-10, 5) === 0);
ok("zero duration never divides by zero", computeAverageCps(10, 0) === 0);

// ─────────────────────────────────────────────────────────────────
// Section 31 — Peak CPS (sliding-window definition)
// ─────────────────────────────────────────────────────────────────
{
  const ts = [0, 100, 200, 300, 400];
  ok("all 5 clicks within 1s window -> Peak CPS = 5", computePeakCps(ts) === 5, `got ${computePeakCps(ts)}`);
}
{
  const ts = [0, 500, 1001];
  const peak = computePeakCps(ts);
  ok("clicks 1 and 3 are NOT in the same window (peak < 3)", peak < 3, `got ${peak}`);
  ok("clicks 2 and 3 (500,1001) ARE within 1s of each other -> peak = 2", peak === 2, `got ${peak}`);
}
ok("empty timestamp array -> Peak CPS = 0", computePeakCps([]) === 0);
ok("single click -> Peak CPS = 1", computePeakCps([42]) === 1);
{
  // Widely spaced clicks — never more than 1 per window
  const ts = [0, 2000, 4000, 6000];
  ok("widely spaced clicks -> Peak CPS = 1", computePeakCps(ts) === 1, `got ${computePeakCps(ts)}`);
}
{
  // Peak CPS must never exceed total valid clicks (Section 6)
  const ts = Array.from({ length: 10 }, (_, i) => i * 50); // 10 clicks in 450ms — all in one window
  ok("Peak CPS never exceeds total clicks", computePeakCps(ts) <= ts.length && computePeakCps(ts) === 10);
}

// ─────────────────────────────────────────────────────────────────
// computeRollingCpsAt — must agree with computePeakCps's definition
// ─────────────────────────────────────────────────────────────────
{
  const ts = [0, 100, 200, 300, 400];
  ok("rolling CPS at t=400 counts all 5 (within 1s)", computeRollingCpsAt(ts, 400) === 5);
  ok("rolling CPS at t=1500 (outside window) counts 0", computeRollingCpsAt(ts, 1500) === 0);
}
{
  const ts = [0, 500, 1001];
  ok("rolling CPS at t=1001 matches peak window (2, not 3)", computeRollingCpsAt(ts, 1001) === 2);
}

// ─────────────────────────────────────────────────────────────────
// Click interval statistics — Sections 8/9
// ─────────────────────────────────────────────────────────────────
{
  const ts = [1000, 1500, 2000, 2500, 3000]; // 5 clicks, first=1000, last=3000
  const { average, fastest, slowest, median } = computeClickIntervals(ts);
  ok("average interval = (last-first)/(N-1) = 500ms", near(average, 500), `got ${average}`);
  ok("fastest interval = 500ms (evenly spaced)", near(fastest, 500));
  ok("slowest interval = 500ms (evenly spaced)", near(slowest, 500));
  ok("median interval = 500ms (evenly spaced)", near(median, 500));
}
{
  const single = computeClickIntervals([1000]);
  ok("N=1 -> average interval is null (N/A)", single.average === null);
  ok("N=1 -> fastest/slowest/median are null (N/A)", single.fastest === null && single.slowest === null && single.median === null);
}
{
  const empty = computeClickIntervals([]);
  ok("N=0 -> all interval stats null (N/A), no divide-by-zero", empty.average === null);
}
{
  const ts = [0, 100, 400]; // intervals: 100, 300 -> fastest 100, slowest 300, median avg(100,300)=200
  const { fastest, slowest, median } = computeClickIntervals(ts);
  ok("fastest/slowest correctly identify min/max interval", fastest === 100 && slowest === 300, `fastest=${fastest} slowest=${slowest}`);
  ok("median of 2 intervals is their average", median === 200, `got ${median}`);
}

// ─────────────────────────────────────────────────────────────────
// CPS Rating — Section 24 exact boundaries
// ─────────────────────────────────────────────────────────────────
ok("4.999 -> Casual", getCpsRating(4.999) === "Casual");
ok("5.000 -> Average", getCpsRating(5.000) === "Average");
ok("7.999 -> Average", getCpsRating(7.999) === "Average");
ok("8.000 -> Fast", getCpsRating(8.000) === "Fast");
ok("10.999 -> Fast", getCpsRating(10.999) === "Fast");
ok("11.000 -> Very Fast", getCpsRating(11.000) === "Very Fast");
ok("14.999 -> Very Fast", getCpsRating(14.999) === "Very Fast");
ok("15.000 -> Extreme", getCpsRating(15.000) === "Extreme");
ok("0 CPS -> Casual", getCpsRating(0) === "Casual");

// ─────────────────────────────────────────────────────────────────
// Custom duration validation — Section 13
// ─────────────────────────────────────────────────────────────────
ok("valid custom duration 10.75 accepted", validateCustomDuration(10.75).valid === true);
ok("valid custom duration normalizes to 2 decimals", validateCustomDuration(10.756).value === 10.76);
ok("0 is rejected", validateCustomDuration(0).valid === false);
ok("negative is rejected", validateCustomDuration(-5).valid === false);
ok("NaN is rejected", validateCustomDuration(NaN).valid === false);
ok("Infinity is rejected", validateCustomDuration(Infinity).valid === false);
ok("empty string is rejected", validateCustomDuration("").valid === false);
ok("non-numeric string is rejected", validateCustomDuration("abc").valid === false);
ok("below minimum (0.5) is rejected", validateCustomDuration(0.5).valid === false);
ok("above maximum (301) is rejected", validateCustomDuration(301).valid === false);
ok("exactly minimum (1) is accepted", validateCustomDuration(1).valid === true);
ok("exactly maximum (300 = 5 minutes) is accepted", validateCustomDuration(300).valid === true);
ok("a duration that used to be rejected (61s) is now accepted", validateCustomDuration(61).valid === true);
ok("a mid-range 5-minute-adjacent duration (180s = 3 min) is accepted", validateCustomDuration(180).valid === true);

// ─────────────────────────────────────────────────────────────────
// Mouse / touch filtering — Section 10/11 (Section 32)
// ─────────────────────────────────────────────────────────────────
ok("mouse mode accepts trusted left-click pointer event", isValidPointerClick("mouse", { pointerType: "mouse", button: 0, isTrusted: true }) === true);
ok("mouse mode rejects right-click (button 2)", isValidPointerClick("mouse", { pointerType: "mouse", button: 2, isTrusted: true }) === false);
ok("mouse mode rejects middle-click (button 1)", isValidPointerClick("mouse", { pointerType: "mouse", button: 1, isTrusted: true }) === false);
ok("mouse mode rejects a touch pointer event", isValidPointerClick("mouse", { pointerType: "touch", button: 0, isTrusted: true }) === false);
ok("touch mode accepts a trusted touch pointer event", isValidPointerClick("touch", { pointerType: "touch", isTrusted: true }) === true);
ok("touch mode rejects a mouse pointer event", isValidPointerClick("touch", { pointerType: "mouse", button: 0, isTrusted: true }) === false);
ok("untrusted (programmatic) events are always rejected", isValidPointerClick("mouse", { pointerType: "mouse", button: 0, isTrusted: false }) === false);

// ─────────────────────────────────────────────────────────────────
// Keyboard mode — bindable to ANY key, not just Space/Enter (Section 12, Section 33)
// ─────────────────────────────────────────────────────────────────
ok("a keydown matching the bound key counts as 1 click", isValidKeyPress({ code: "Space", repeat: false, isTrusted: true }, "Space") === true);
ok("auto-repeated keydown of the bound key does NOT count", isValidKeyPress({ code: "Space", repeat: true, isTrusted: true }, "Space") === false);
ok("a keydown NOT matching the bound key is rejected", isValidKeyPress({ code: "Enter", repeat: false, isTrusted: true }, "Space") === false);
ok("any arbitrary key can be bound and counted — letter key", isValidKeyPress({ code: "KeyA", repeat: false, isTrusted: true }, "KeyA") === true);
ok("any arbitrary key can be bound and counted — digit key", isValidKeyPress({ code: "Digit5", repeat: false, isTrusted: true }, "Digit5") === true);
ok("any arbitrary key can be bound and counted — function key", isValidKeyPress({ code: "F1", repeat: false, isTrusted: true }, "F1") === true);
ok("any arbitrary key can be bound and counted — modifier key", isValidKeyPress({ code: "ShiftLeft", repeat: false, isTrusted: true }, "ShiftLeft") === true);
ok("any arbitrary key can be bound and counted — arrow key", isValidKeyPress({ code: "ArrowUp", repeat: false, isTrusted: true }, "ArrowUp") === true);
ok("untrusted key events are always rejected regardless of binding", isValidKeyPress({ code: "Space", repeat: false, isTrusted: false }, "Space") === false);
ok("a missing/empty target code never matches (no binding = no clicks)", isValidKeyPress({ code: "Space", repeat: false, isTrusted: true }, "") === false);

// ─────────────────────────────────────────────────────────────────
// Key label formatting — "handle special keys and regular character
// keys appropriately"
// ─────────────────────────────────────────────────────────────────
ok("formatKeyLabel(Space) -> 'Space'", formatKeyLabel("Space") === "Space");
ok("formatKeyLabel(KeyA) -> 'A' (regular character key)", formatKeyLabel("KeyA") === "A");
ok("formatKeyLabel(Digit5) -> '5'", formatKeyLabel("Digit5") === "5");
ok("formatKeyLabel(ShiftLeft) -> 'Left Shift' (special key)", formatKeyLabel("ShiftLeft") === "Left Shift");
ok("formatKeyLabel(ArrowUp) -> 'Arrow Up' (special key)", formatKeyLabel("ArrowUp") === "Arrow Up");
ok("formatKeyLabel(NumpadEnter-style Numpad5) -> 'Numpad 5'", formatKeyLabel("Numpad5") === "Numpad 5");
ok("formatKeyLabel(F1) falls back to the raw code for unmapped keys", formatKeyLabel("F1") === "F1");
ok("formatKeyLabel handles an empty/missing code without throwing", formatKeyLabel(undefined) === "" && formatKeyLabel("") === "");

// ─────────────────────────────────────────────────────────────────
// Unbindable keys — Escape/Tab stay reserved for navigation
// ─────────────────────────────────────────────────────────────────
ok("Escape is on the unbindable list", UNBINDABLE_KEY_CODES.includes("Escape"));
ok("Tab is on the unbindable list", UNBINDABLE_KEY_CODES.includes("Tab"));
ok("Space (a normal bindable key) is NOT on the unbindable list", !UNBINDABLE_KEY_CODES.includes("Space"));

// ─────────────────────────────────────────────────────────────────
// CpsEngine — test start/boundary/completion behavior
// ─────────────────────────────────────────────────────────────────
{
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  const r1 = engine.recordClick(1000);
  ok("first click starts the test", r1.testStarted === true && r1.accepted === true);
  ok("first click timestamp becomes testStartTime", engine.startTime === 1000);
  ok("first click is counted (click #1)", engine.clickCount === 1);
  ok("testEndTime = testStartTime + duration", engine.endTime === 1000 + 5000);
}
{
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  engine.recordClick(0);
  const rBoundary = engine.recordClick(5000); // exactly at testEndTime — must be excluded
  ok("click exactly at the end boundary is excluded", rBoundary.accepted === false);
  ok("click exactly at the boundary finalizes the test", engine.status === "completed");
}
{
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  engine.recordClick(0);
  const rJustBefore = engine.recordClick(4999); // just before the boundary — must be included
  ok("click immediately before test end is included", rJustBefore.accepted === true);
  ok("clickCount reflects the included click", engine.clickCount === 2);
}
{
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  engine.recordClick(0);
  engine.checkExpiry(5000);
  ok("checkExpiry finalizes the test once the boundary passes with no further clicks", engine.status === "completed");
  const after = engine.recordClick(5001);
  ok("clicks after test completion are ignored", after.accepted === false);
}
{
  // Reset produces a clean engine — old timestamps/results cannot leak into a new test.
  const first = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  first.recordClick(0);
  first.recordClick(100);
  const second = new CpsEngine({ durationSeconds: 5, mode: "mouse" }); // simulates Reset -> new instance
  ok("a fresh engine starts with zero clicks regardless of a prior instance's state", second.clickCount === 0 && second.timestamps.length === 0);
}
{
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  engine.recordClick(0);
  engine.cancel("tab_hidden", 1200);
  ok("cancelled test has status 'cancelled'", engine.status === "cancelled");
  const snap = engine.getSnapshot(2000);
  ok("a cancelled test produces no completed-test result (averageCps null)", snap.averageCps === null);
  ok("clicks after cancellation are ignored", engine.recordClick(2000).accepted === false);
}
{
  // Full integration: 20 clicks spread across a 5-second test -> Average CPS = 4.00
  const engine = new CpsEngine({ durationSeconds: 5, mode: "mouse" });
  for (let i = 0; i < 20; i++) engine.recordClick(i * 200); // 20 clicks, 200ms apart, spans 3800ms (within 5s)
  engine.checkExpiry(5000);
  const snap = engine.getSnapshot(5000);
  ok("completed 20-click / 5s test -> Average CPS = 4.00", near(snap.averageCps, 4), `got ${snap.averageCps}`);
}

// ─────────────────────────────────────────────────────────────────
// Timestamp resource limit — Section 20
// ─────────────────────────────────────────────────────────────────
{
  const engine = new CpsEngine({ durationSeconds: 60, mode: "mouse", timestampCap: 5 });
  for (let i = 0; i < 10; i++) engine.recordClick(i * 10);
  ok("total click count stays accurate past the timestamp cap", engine.clickCount === 10);
  ok("timestamp array is capped", engine.timestamps.length === 5);
  ok("timestampCapReached flag is set", engine.timestampCapReached === true);
  engine.checkExpiry(60000);
  const snap = engine.getSnapshot(60000);
  ok("Peak CPS is withheld (null) once the cap is reached, never computed from a truncated sample", snap.peakCps === null);
  ok("interval stats are withheld (null) once the cap is reached", snap.intervals === null);
  ok("total click count is still reported accurately even with capped timestamps", snap.clickCount === 10);
}

// ─────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────
console.log(`\nCPS Tester engine reference suite: ${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
