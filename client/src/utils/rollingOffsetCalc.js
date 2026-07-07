// Rolling Offset Calculator — pure calculation utilities

// ── Length units ────────────────────────────────────────────────────
export const LENGTH_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

// ── Fitting bend presets ────────────────────────────────────────────
// Multiplier = 1 / sin(angle) — travel = true offset × multiplier.
export const FITTING_BENDS = [
  { id: "22.5", label: "22 ½°", deg: 22.5, multiplier: 2.6131 },
  { id: "45",   label: "45°",   deg: 45,   multiplier: 1.4142 },
  { id: "60",   label: "60°",   deg: 60,   multiplier: 1.1547 },
  { id: "90",   label: "90°",   deg: 90,   multiplier: 1.0000 },
  { id: "custom", label: "Custom", deg: null, multiplier: null },
];

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function fromLengthM(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? val / u.toM : val;
}

// ── Core calculation ──────────────────────────────────────────────
// Returns result object, or null if h/v/angle aren't all valid.
export function calcRollingOffset({ hM, vM, bendDeg }) {
  if (!isFinite(hM) || hM <= 0) return null;
  if (!isFinite(vM) || vM <= 0) return null;
  if (!isFinite(bendDeg) || bendDeg <= 0 || bendDeg > 90) return null;

  const trueOffsetM = Math.sqrt(hM * hM + vM * vM);
  const rad = (bendDeg * Math.PI) / 180;
  const travelM = trueOffsetM / Math.sin(rad);
  const runM = bendDeg === 90 ? 0 : trueOffsetM / Math.tan(rad);

  return { trueOffsetM, travelM, runM };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtRollOff(n, dp = 3) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
