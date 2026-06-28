// Pure calculation engine for Baluster Calculator

export const BAL_LENGTH_UNITS = [
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

export const BAL_WIDTH_UNITS = [
  { id: "mm", label: "mm", toM: 0.001  },
  { id: "cm", label: "cm", toM: 0.01   },
  { id: "in", label: "in", toM: 0.0254 },
];

export const BAL_OUT_UNITS = [
  { id: "mm", label: "mm", fromM: 1000     },
  { id: "cm", label: "cm", fromM: 100      },
  { id: "in", label: "in", fromM: 39.3701  },
  { id: "ft", label: "ft", fromM: 3.28084  },
];

export const MEASURE_METHODS = [
  {
    id: "clearOpening",
    label: "Clear Opening Between Posts",
    desc: "Enter the clear span between the inside faces of two posts. Most direct measurement for railing sections.",
  },
  {
    id: "overallRailLength",
    label: "Overall Rail Length + Post Widths",
    desc: "Enter the total rail length and each post width; the clear opening is computed automatically.",
  },
];

export const LAYOUT_METHODS = [
  {
    id: "equalEndMargins",
    label: "Equal End Margins",
    desc: "End margins match the gap between balusters — fully symmetrical, even distribution.",
  },
  {
    id: "fixedOffsets",
    label: "Fixed End Offsets",
    desc: "Set exact distances from each post to the first/last baluster. Useful for standoff requirements.",
  },
  {
    id: "centered",
    label: "Centered Layout",
    desc: "Baluster group is centered on the rail. End margins are equal and auto-calculated.",
  },
];

export const CALC_MODES = [
  {
    id: "straight",
    label: "Straight Railing",
    desc: "Flat horizontal railing — decks, balconies, landings, fences.",
  },
  {
    id: "stair",
    label: "Stair Railing",
    desc: "Inclined railing following a staircase. Enter angle or rise/run to get slope-length results.",
  },
];

export const DEFAULT_MAX_OPENING_M = 4 * 0.0254; // 4 inches = 0.1016 m

// ── Unit conversion helpers ───────────────────────────────────────

export function toMeters(value, unitId, unitArr) {
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0) return null;
  const u = (unitArr || BAL_LENGTH_UNITS).find((u) => u.id === unitId);
  return u ? n * u.toM : null;
}

export function convertOut(meters, unitId) {
  if (meters === null || !isFinite(meters)) return null;
  const u = BAL_OUT_UNITS.find((u) => u.id === unitId);
  return u ? meters * u.fromM : null;
}

export function fmtBal(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

// ── Stair angle helper ────────────────────────────────────────────

export function calcStairAngle(rise, run) {
  const r = parseFloat(rise);
  const n = parseFloat(run);
  if (!isFinite(r) || !isFinite(n) || r <= 0 || n <= 0) return null;
  return (Math.atan2(r, n) * 180) / Math.PI;
}

// ── Main calculation ──────────────────────────────────────────────
//
// Algorithm:
//   equalEndMargins / centered:
//     N×w + (N+1)×gap = clearOpening
//     gap = (clearOpening − N×w) / (N+1) ≤ maxOpening
//     → N_min = ceil((clearOpening − maxOpening) / (w + maxOpening))
//
//   fixedOffsets:
//     netSpace = clearOpening − leftOffset − rightOffset
//     N×w + (N−1)×gap = netSpace
//     gap = (netSpace − N×w) / (N−1) ≤ maxOpening  [N≥2]
//     → N_min = ceil((netSpace + maxOpening) / (w + maxOpening))

export function calcBaluster({
  clearOpeningM,
  balusterWidthM,
  maxOpeningM,
  layoutMethod,
  leftOffsetM = 0,
  rightOffsetM = 0,
  stairAngleDeg = null,
}) {
  if (!clearOpeningM || clearOpeningM <= 0) return null;
  if (!balusterWidthM || balusterWidthM <= 0) return null;
  if (!maxOpeningM || maxOpeningM <= 0) return null;
  if (balusterWidthM >= clearOpeningM) return null;

  let N, gap, leftMargin, rightMargin;

  if (layoutMethod === "fixedOffsets") {
    const lo = leftOffsetM > 0 ? leftOffsetM : 0;
    const ro = rightOffsetM > 0 ? rightOffsetM : 0;
    const netSpace = clearOpeningM - lo - ro;
    if (netSpace <= 0 || netSpace < balusterWidthM) return null;

    N = Math.max(1, Math.ceil((netSpace + maxOpeningM) / (balusterWidthM + maxOpeningM)));
    if (N * balusterWidthM > netSpace) return null;

    gap = N > 1 ? (netSpace - N * balusterWidthM) / (N - 1) : 0;
    while (N > 1 && gap > maxOpeningM + 1e-9 && N < 10000) {
      N++;
      if (N * balusterWidthM > netSpace) return null;
      gap = (netSpace - N * balusterWidthM) / (N - 1);
    }
    leftMargin = lo;
    rightMargin = ro;
  } else {
    // equalEndMargins or centered
    N = Math.max(1, Math.ceil((clearOpeningM - maxOpeningM) / (balusterWidthM + maxOpeningM)));
    if (N * balusterWidthM > clearOpeningM) return null;

    gap = (clearOpeningM - N * balusterWidthM) / (N + 1);
    while (gap > maxOpeningM + 1e-9 && N < 10000) {
      N++;
      if (N * balusterWidthM > clearOpeningM) return null;
      gap = (clearOpeningM - N * balusterWidthM) / (N + 1);
    }
    leftMargin = gap;
    rightMargin = gap;
  }

  if (gap < -1e-6) return null;
  gap = Math.max(0, gap);

  const codePass =
    gap <= maxOpeningM + 1e-6 &&
    leftMargin <= maxOpeningM + 1e-6 &&
    rightMargin <= maxOpeningM + 1e-6;

  const centerToCenterM = balusterWidthM + gap;

  let stairSlopeLengthM = null;
  let spacingAlongSlopeM = null;
  const validAngle =
    stairAngleDeg !== null && isFinite(stairAngleDeg) && stairAngleDeg > 0 && stairAngleDeg < 85;
  if (validAngle) {
    const cosA = Math.cos(stairAngleDeg * Math.PI / 180);
    stairSlopeLengthM = clearOpeningM / cosA;
    spacingAlongSlopeM = centerToCenterM / cosA;
  }

  return {
    totalBalusters: N,
    numberOfOpenings: N + 1,
    actualClearOpeningM: gap,
    centerToCenterM,
    leftMarginM: leftMargin,
    rightMarginM: rightMargin,
    codePass,
    stairAngleDeg: validAngle ? stairAngleDeg : null,
    stairSlopeLengthM,
    spacingAlongSlopeM,
  };
}

// ── Validation ────────────────────────────────────────────────────

export function validatePositive(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0) return "Must be greater than zero";
  return null;
}

export function validateNonNeg(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = parseFloat(value);
  if (!isFinite(n) || n < 0) return "Must be zero or greater";
  return null;
}

export function validateAngle(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0 || n >= 90) return "Must be between 0° and 90°";
  return null;
}
