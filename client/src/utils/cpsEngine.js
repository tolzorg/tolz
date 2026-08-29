// CPS Tester — measurement engine. Deliberately framework-agnostic (no
// React import here) so it can be exercised directly by plain-Node
// tests (scripts/cps-engine.test.js) and driven by any UI layer.
//
// Accuracy priority (spec Section 30): correct click counting > correct
// timestamps > correct test boundary > correct CPS calculation >
// correct Peak CPS calculation > correct state cleanup > UI animation.
// Every function below is pure except CpsEngine's own instance methods,
// which mutate only that instance's own state.

import {
  ROLLING_WINDOW_MS, LIVE_CPS_DISPLAY_THRESHOLD_MS, TIMESTAMP_CAP,
  CPS_RATING_THRESHOLDS, MIN_DURATION, MAX_DURATION,
} from "./cpsConfig.js";

/** Monotonic high-resolution timestamp (ms). Never affected by system clock changes. */
export function now() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  // Fallback only — Date.now() is not monotonic, but this path only runs
  // in environments with no Performance API at all (Section 1).
  return Date.now();
}

/** Average CPS for a completed test — Sections 3/25. Never NaN/Infinity/negative. */
export function computeAverageCps(totalClicks, durationSeconds) {
  if (!(durationSeconds > 0) || !(totalClicks >= 0)) return 0;
  return totalClicks / durationSeconds;
}

/**
 * Peak CPS — Sections 5/18: the maximum number of valid clicks inside
 * any right-aligned rolling `ROLLING_WINDOW_MS` window, i.e. for every
 * click timestamp t, count clicks satisfying t - 1000ms < clickTime <= t.
 * O(N) two-pointer sliding window over ascending, deduplicated-by-order
 * timestamps (caller must pass timestamps in chronological order, which
 * CpsEngine always guarantees since clicks are recorded in real time).
 */
export function computePeakCps(timestampsMs) {
  if (!timestampsMs || timestampsMs.length === 0) return 0;
  let left = 0;
  let peak = 0;
  for (let right = 0; right < timestampsMs.length; right++) {
    while (timestampsMs[right] - timestampsMs[left] >= ROLLING_WINDOW_MS) left++;
    const windowCount = right - left + 1;
    if (windowCount > peak) peak = windowCount;
  }
  return peak;
}

/**
 * Rolling CPS at a specific instant `t` — Section 19. Uses the exact
 * same window definition as computePeakCps() (never a different,
 * bucket-based definition), so the click-rate graph and Peak CPS always
 * agree. `timestampsMs` must be ascending.
 */
export function computeRollingCpsAt(timestampsMs, t) {
  if (!timestampsMs || timestampsMs.length === 0) return 0;
  let count = 0;
  for (let i = timestampsMs.length - 1; i >= 0; i--) {
    const ts = timestampsMs[i];
    if (ts > t) continue;
    if (t - ts < ROLLING_WINDOW_MS) count++;
    else break; // ascending order — everything earlier is even further outside the window
  }
  return count;
}

/**
 * Click interval statistics — Sections 8/9. Returns nulls ("N/A") when
 * fewer than 2 clicks exist; never divides by zero.
 */
export function computeClickIntervals(timestampsMs) {
  if (!timestampsMs || timestampsMs.length < 2) {
    return { average: null, fastest: null, slowest: null, median: null };
  }
  const n = timestampsMs.length;
  const average = (timestampsMs[n - 1] - timestampsMs[0]) / (n - 1);

  const intervals = [];
  for (let i = 1; i < n; i++) intervals.push(timestampsMs[i] - timestampsMs[i - 1]);
  const sorted = [...intervals].sort((a, b) => a - b);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return { average, fastest, slowest, median };
}

/** CPS rating label — Section 24. Exact numeric boundaries, not rounded-display comparisons. */
export function getCpsRating(cps) {
  for (const tier of CPS_RATING_THRESHOLDS) {
    if (cps < tier.max) return tier.label;
  }
  return CPS_RATING_THRESHOLDS[CPS_RATING_THRESHOLDS.length - 1].label;
}

/**
 * Validates/normalizes a custom duration — Section 13. Accepts up to 2
 * decimal places, rejects 0/negative/NaN/Infinity/empty/non-numeric/
 * above-maximum values.
 */
export function validateCustomDuration(rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return { valid: false, error: "Enter a duration" };
  }
  const n = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!isFinite(n)) return { valid: false, error: "Duration must be a valid number" };
  if (n <= 0) return { valid: false, error: "Duration must be greater than 0" };
  if (n < MIN_DURATION) return { valid: false, error: `Minimum duration is ${MIN_DURATION} second` };
  if (n > MAX_DURATION) return { valid: false, error: `Maximum duration is ${MAX_DURATION} seconds (${MAX_DURATION / 60} minutes)` };
  return { valid: true, value: Math.round(n * 100) / 100 };
}

/**
 * Whether a pointer event should count as one valid click for the given
 * input mode — Sections 10/11. Takes a plain object (not a real
 * PointerEvent) so this stays pure and unit-testable. `mode` is
 * "mouse" | "touch"; keyboard is validated separately (isValidKeyPress).
 */
export function isValidPointerClick(mode, evt) {
  if (!evt || evt.isTrusted === false) return false; // Section: "only count trusted user-generated events"
  if (mode === "mouse") return evt.pointerType === "mouse" && evt.button === 0;
  if (mode === "touch") return evt.pointerType === "touch";
  return false;
}

/**
 * Whether a keydown should count as one valid keyboard click — Section
 * 12. Keyboard mode is bindable to any single physical key (not just
 * Space/Enter) — `targetCode` is that key's `event.code` (layout-
 * independent, so e.g. a bound "KeyA" matches regardless of the
 * keyboard's language layout). Auto-repeat is always ignored.
 */
export function isValidKeyPress(evt, targetCode) {
  if (!evt || evt.isTrusted === false) return false;
  if (evt.repeat) return false; // ignore browser key auto-repeat
  return !!targetCode && evt.code === targetCode;
}

// Keys excluded from key-binding capture — both are relied on
// elsewhere for standard browser/accessibility navigation (closing
// dialogs, moving focus), so binding the CPS "click" to either would
// be more confusing than useful.
export const UNBINDABLE_KEY_CODES = ["Escape", "Tab"];

const KEY_LABELS = {
  Space: "Space", Enter: "Enter", Backspace: "Backspace", CapsLock: "Caps Lock",
  ShiftLeft: "Left Shift", ShiftRight: "Right Shift",
  ControlLeft: "Left Ctrl", ControlRight: "Right Ctrl",
  AltLeft: "Left Alt", AltRight: "Right Alt",
  MetaLeft: "Left Meta", MetaRight: "Right Meta",
  ArrowUp: "Arrow Up", ArrowDown: "Arrow Down", ArrowLeft: "Arrow Left", ArrowRight: "Arrow Right",
};

/** Friendly display label for a KeyboardEvent.code — Section: "handle special keys and regular character keys appropriately." */
export function formatKeyLabel(code) {
  if (!code) return "";
  if (KEY_LABELS[code]) return KEY_LABELS[code];
  if (code.startsWith("Key")) return code.slice(3); // "KeyA" -> "A"
  if (code.startsWith("Digit")) return code.slice(5); // "Digit1" -> "1"
  if (code.startsWith("Numpad")) return `Numpad ${code.slice(6)}`; // "Numpad5" -> "Numpad 5"
  return code; // F1-F12 and anything unrecognized display as their raw code
}

const STATUS = { READY: "ready", ACTIVE: "active", COMPLETED: "completed", CANCELLED: "cancelled" };
export { STATUS as CPS_STATUS };

/**
 * The measurement engine itself — owns test state, start/end time, click
 * timestamps, click count, and produces derived statistics on demand.
 * One instance per test; the UI layer creates a fresh instance for each
 * new test (see useCpsTester.js) so no state can leak between tests
 * (Section 28).
 */
export class CpsEngine {
  constructor({ durationSeconds, mode, timestampCap = TIMESTAMP_CAP }) {
    this.durationSeconds = durationSeconds;
    this.mode = mode;
    this.timestampCap = timestampCap;

    this.status = STATUS.READY;
    this.startTime = null;
    this.endTime = null;
    this.timestamps = [];
    this.clickCount = 0;
    this.timestampCapReached = false;
    this.cancelReason = null;
  }

  /**
   * Record one already-validated click at time `t` (ms, from now()).
   * Section 15: a click is valid only when testStartTime <= t < testEndTime.
   * The very first click both starts the test and counts as click #1.
   * Returns { accepted, testStarted, testCompleted }.
   */
  recordClick(t) {
    if (this.status === STATUS.COMPLETED || this.status === STATUS.CANCELLED) {
      return { accepted: false, testStarted: false, testCompleted: false };
    }

    let testStarted = false;
    if (this.status === STATUS.READY) {
      this.status = STATUS.ACTIVE;
      this.startTime = t;
      this.endTime = t + this.durationSeconds * 1000;
      testStarted = true;
    }

    if (t >= this.endTime) {
      // Boundary already passed — finalize instead of counting this click.
      this._complete();
      return { accepted: false, testStarted, testCompleted: true };
    }

    this.clickCount += 1;
    if (this.timestamps.length < this.timestampCap) {
      this.timestamps.push(t);
    } else {
      this.timestampCapReached = true;
    }
    return { accepted: true, testStarted, testCompleted: false };
  }

  /** Call periodically (e.g. once per animation frame) so the test auto-completes even with no further clicks. */
  checkExpiry(t) {
    if (this.status === STATUS.ACTIVE && t >= this.endTime) {
      this._complete();
      return true;
    }
    return false;
  }

  _complete() {
    this.status = STATUS.COMPLETED;
  }

  /** Cancel the test (e.g. tab became hidden — Section 16). No result is produced for a cancelled test. */
  cancel(reason, t) {
    if (this.status === STATUS.ACTIVE || this.status === STATUS.READY) {
      this.status = STATUS.CANCELLED;
      this.cancelReason = reason;
      this.cancelledAt = t;
    }
  }

  /** Read-only snapshot for the UI to render — never mutates engine state. */
  getSnapshot(t) {
    const isActive = this.status === STATUS.ACTIVE;
    const isCancelled = this.status === STATUS.CANCELLED;
    const elapsedMs = isActive ? Math.max(0, t - this.startTime)
      : isCancelled ? (this.startTime !== null ? Math.max(0, this.cancelledAt - this.startTime) : 0)
      : (this.endTime !== null ? this.endTime - this.startTime : 0);
    const totalMs = this.durationSeconds * 1000;
    const remainingMs = isActive ? Math.max(0, totalMs - elapsedMs) : 0;

    let liveCps = null;
    if (isActive && elapsedMs >= LIVE_CPS_DISPLAY_THRESHOLD_MS) {
      liveCps = this.clickCount / (elapsedMs / 1000);
    }

    const statsAvailable = !this.timestampCapReached;
    const isCompleted = this.status === STATUS.COMPLETED;

    return {
      status: this.status,
      mode: this.mode,
      durationSeconds: this.durationSeconds,
      clickCount: this.clickCount,
      elapsedMs,
      remainingMs,
      liveCps,
      timestampCapReached: this.timestampCapReached,
      cancelReason: this.cancelReason,
      // Final results — only meaningful once the test has completed.
      averageCps: isCompleted ? computeAverageCps(this.clickCount, this.durationSeconds) : null,
      peakCps: isCompleted && statsAvailable ? computePeakCps(this.timestamps) : null,
      peakIsTrivial: this.durationSeconds <= 1, // Section 6 — peak necessarily equals average for 1s tests
      intervals: isCompleted && statsAvailable ? computeClickIntervals(this.timestamps) : null,
      timestamps: this.timestamps, // exposed read-only for the chart; UI must not mutate this array
    };
  }
}
