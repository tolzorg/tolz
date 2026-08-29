// CPS Tester — tunable constants, kept in one file so thresholds/limits
// can be changed without touching engine or UI logic.

// Preset test durations shown as buttons (seconds).
export const PRESET_DURATIONS = [1, 5, 10, 15, 30, 60];

// Custom duration bounds (seconds) — Section 13. Presets stop at 60s;
// the custom field allows up to 5 minutes for endurance/stamina testing.
export const MIN_DURATION = 1;
export const MAX_DURATION = 300;

// Rolling-window size used for Peak CPS and the click-rate graph — both
// MUST share this exact constant (Sections 5 and 19).
export const ROLLING_WINDOW_MS = 1000;

// Before this much elapsed time has passed, live CPS is not yet
// meaningful to display (Section 4).
export const LIVE_CPS_DISPLAY_THRESHOLD_MS = 100;

// Resource limit — maximum click timestamps retained per test (Section 20).
// Total click COUNT is never capped; only the timestamp array (used for
// Peak CPS / graph / interval stats) is capped for memory safety.
export const TIMESTAMP_CAP = 100000;

// CPS rating labels — entertainment/general guidance only, not a
// scientific or competitive standard (Section 24). Boundaries are
// inclusive on the lower bound of each tier.
export const CPS_RATING_THRESHOLDS = [
  { max: 5, label: "Casual" },
  { max: 8, label: "Average" },
  { max: 11, label: "Fast" },
  { max: 15, label: "Very Fast" },
  { max: Infinity, label: "Extreme" },
];

// How many recent test results to keep in session history.
export const MAX_HISTORY_ENTRIES = 20;

// localStorage keys (via the project's shared useLocalStorage hook).
export const HISTORY_STORAGE_KEY = "tolz:cps-tester:history";
export const PERSONAL_BEST_STORAGE_KEY = "tolz:cps-tester:personal-best";

export const INPUT_MODES = ["mouse", "touch", "keyboard"];
