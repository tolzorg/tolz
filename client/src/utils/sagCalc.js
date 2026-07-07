// SAG (Sagitta) Calculator — pure calculation utilities
//
// Relationship between radius of curvature (R), diameter/chord (D), and sag (S):
//   S = R - sqrt(R^2 - (D/2)^2)
// Rearranged for the other two variables:
//   R = (S^2 + (D/2)^2) / (2*S)
//   D = 2 * sqrt(2*R*S - S^2)

// ── Length units ────────────────────────────────────────────────────
export const LENGTH_UNITS = [
  { id: "m",  label: "m",  toM: 1       },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
  { id: "in", label: "in", toM: 0.0254  },
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

// ── Core formulas (all inputs/outputs in metres) ──────────────────

export function sagFromRadiusDiameter(rM, dM) {
  if (!isFinite(rM) || rM <= 0 || !isFinite(dM) || dM <= 0) return null;
  const half = dM / 2;
  const inner = rM * rM - half * half;
  if (inner < 0) return null; // diameter too large for this radius
  return rM - Math.sqrt(inner);
}

export function radiusFromSagDiameter(sM, dM) {
  if (!isFinite(sM) || sM <= 0 || !isFinite(dM) || dM <= 0) return null;
  const half = dM / 2;
  return (sM * sM + half * half) / (2 * sM);
}

export function diameterFromSagRadius(sM, rM) {
  if (!isFinite(sM) || sM <= 0 || !isFinite(rM) || rM <= 0) return null;
  const inner = 2 * rM * sM - sM * sM;
  if (inner < 0) return null; // sag can't exceed the circle's own diameter
  return 2 * Math.sqrt(inner);
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtSag(n, dp = 4) {
  if (n === null || n === undefined || !isFinite(n)) return "";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
