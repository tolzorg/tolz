// Fire Glass Calculator — pure calculation utilities

// ── Length units (fire pit dimensions) ─────────────────────────────
export const LENGTH_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Depth units ───────────────────────────────────────────────────
export const DEPTH_UNITS = [
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Area output units ─────────────────────────────────────────────
export const AREA_OUT_UNITS = [
  { id: "cm2", label: "cm²", fromM2: 10000    },
  { id: "m2",  label: "m²",  fromM2: 1        },
  { id: "ft2", label: "ft²", fromM2: 10.7639  },
  { id: "in2", label: "in²", fromM2: 1550.003 },
];

// ── Volume output units ───────────────────────────────────────────
export const VOLUME_OUT_UNITS = [
  { id: "cm3", label: "cm³", fromM3: 1e6       },
  { id: "m3",  label: "m³",  fromM3: 1         },
  { id: "l",   label: "L",   fromM3: 1000      },
  { id: "ft3", label: "ft³", fromM3: 35.3147   },
  { id: "in3", label: "in³", fromM3: 61023.7   },
];

// ── Weight output units ───────────────────────────────────────────
export const WEIGHT_OUT_UNITS = [
  { id: "kg", label: "kg", fromKg: 1       },
  { id: "g",  label: "g",  fromKg: 1000    },
  { id: "lb", label: "lb", fromKg: 2.20462 },
  { id: "t",  label: "t",  fromKg: 0.001   },
];

// ── Density input units ───────────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "g/cm3",  label: "g/cm³",  toKgM3: 1000    },
  { id: "kg/m3",  label: "kg/m³",  toKgM3: 1       },
  { id: "lb/ft3", label: "lb/ft³", toKgM3: 16.0185 },
];

// ── Glass types with reference densities (g/cm³) ───────────────────
export const GLASS_TYPES = [
  { id: "reflective", label: "Reflective fire glass", densityGCm3: 1.457 },
  { id: "recycled",   label: "Recycled fire glass",   densityGCm3: 1.445 },
  { id: "custom",     label: "Enter a custom glass density", densityGCm3: null },
];

// ── Fire pit shapes ─────────────────────────────────────────────────
// Each shape defines its own dimension fields (besides the common Depth)
// and how to compute its base area (in m²) from those fields (also in m).
export const SHAPES = [
  {
    id: "rectangular",
    label: "Rectangular",
    fields: [
      { id: "length", label: "Length (l)" },
      { id: "width",  label: "Width (w)"  },
    ],
    areaM2: (v) => v.length * v.width,
  },
  {
    id: "square",
    label: "Square",
    fields: [
      { id: "side", label: "Side (s)" },
    ],
    areaM2: (v) => v.side * v.side,
  },
  {
    id: "round",
    label: "Round",
    fields: [
      { id: "diameter", label: "Diameter (⌀)" },
    ],
    areaM2: (v) => Math.PI * (v.diameter / 2) ** 2,
  },
  {
    id: "triangular",
    label: "Triangular",
    fields: [
      { id: "base",   label: "Base (b)"   },
      { id: "height", label: "Height (h)" },
    ],
    areaM2: (v) => 0.5 * v.base * v.height,
  },
  {
    id: "trapezoidal",
    label: "Trapezoidal",
    fields: [
      { id: "topWidth",    label: "Top width (a)"    },
      { id: "bottomWidth", label: "Bottom width (b)" },
      { id: "height",      label: "Height (h)"       },
    ],
    areaM2: (v) => 0.5 * (v.topWidth + v.bottomWidth) * v.height,
  },
];

// Typical fire glass density (g/cm³) shown as the calculator's starting point.
export const DEFAULT_DENSITY_GCM3 = GLASS_TYPES[0].densityGCm3;

// ── Unit converters ───────────────────────────────────────────────

export function toLengthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = LENGTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toDepthM(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DEPTH_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toDensityKgM3(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toKgM3 : null;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

export function fromM3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM3 : val;
}

export function fromKgGlass(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_OUT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// ── Core calculation ──────────────────────────────────────────────
// `dimsM` holds the shape's own dimension values (in metres), keyed by
// each shape's field ids (e.g. { length, width } or { diameter }).
// Area is returned as soon as the shape's own dimensions are set; volume
// and weight only once depth (and, for weight, density) are also set —
// so the Area field updates immediately without waiting for Depth.
export function calcFireGlass({ shapeId, dimsM, depthM, densityKgM3 }) {
  const shape = SHAPES.find((s) => s.id === shapeId) || SHAPES[0];

  const allDimsSet = shape.fields.every((f) => isFinite(dimsM[f.id]) && dimsM[f.id] > 0);
  if (!allDimsSet) return null;

  const areaM2 = shape.areaM2(dimsM);
  if (!isFinite(areaM2) || areaM2 <= 0) return null;

  let volumeM3 = null;
  let weightKg = null;
  if (isFinite(depthM) && depthM > 0) {
    volumeM3 = areaM2 * depthM;
    weightKg = isFinite(densityKgM3) && densityKgM3 > 0 ? volumeM3 * densityKgM3 : null;
  }

  return { areaM2, volumeM3, weightKg };
}

// ── Formatter ────────────────────────────────────────────────────
export function fmtGlass(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
