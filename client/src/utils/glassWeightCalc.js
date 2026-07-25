// Glass Weight Calculator — pure calculation utilities

const PI = Math.PI;

// ── Length units (glass dimensions: height/width/side/base/diameter/axes) ──
export const LENGTH_UNITS = [
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Thickness units (glass pane thickness / round rod length) ──────────────
export const THICKNESS_UNITS = [
  { id: "mm", label: "mm", toM: 0.001   },
  { id: "cm", label: "cm", toM: 0.01    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
];

// ── Area units (computed output, or direct input for "Other shapes") ───────
export const AREA_UNITS = [
  { id: "cm2", label: "cm²", fromM2: 10000,     toM2: 1 / 10000     },
  { id: "mm2", label: "mm²", fromM2: 1e6,       toM2: 1 / 1e6       },
  { id: "m2",  label: "m²",  fromM2: 1,         toM2: 1             },
  { id: "in2", label: "in²", fromM2: 1550.003,  toM2: 1 / 1550.003  },
  { id: "ft2", label: "ft²", fromM2: 10.7639,   toM2: 1 / 10.7639   },
];

// ── Volume output units ─────────────────────────────────────────────────
export const VOLUME_UNITS = [
  { id: "cm3", label: "cm³", fromM3: 1e6      },
  { id: "mm3", label: "mm³", fromM3: 1e9      },
  { id: "m3",  label: "m³",  fromM3: 1        },
  { id: "l",   label: "L",   fromM3: 1000     },
  { id: "in3", label: "in³", fromM3: 61023.7  },
  { id: "ft3", label: "ft³", fromM3: 35.3147  },
];

// ── Weight output units ─────────────────────────────────────────────────
export const WEIGHT_UNITS = [
  { id: "kg", label: "kg", fromKg: 1       },
  { id: "g",  label: "g",  fromKg: 1000    },
  { id: "mg", label: "mg", fromKg: 1e6     },
  { id: "t",  label: "t",  fromKg: 0.001   },
  { id: "lb", label: "lb", fromKg: 2.20462 },
  { id: "oz", label: "oz", fromKg: 35.274  },
];

// ── Density input units ─────────────────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "g/cm3",  label: "g/cm³",  toKgM3: 1000    },
  { id: "kg/m3",  label: "kg/m³",  toKgM3: 1       },
  { id: "lb/in3", label: "lb/in³", toKgM3: 27679.905 },
  { id: "lb/ft3", label: "lb/ft³", toKgM3: 16.0185 },
];

// ── Glass types with reference densities (g/cm³) ────────────────────────
// The first three (Annealed / Tempered / Laminated) are the most commonly
// used glass types and are shown at the top of the dropdown, ungrouped —
// the rest are grouped under "Other glass types", matching the reference
// calculator's layout.
export const GLASS_TYPES = [
  { id: "annealed",  label: "Annealed glass",  densityGCm3: 2.5,    group: "common" },
  { id: "tempered",  label: "Tempered glass",  densityGCm3: 2.52,   group: "common" },
  { id: "laminated", label: "Laminated glass", densityGCm3: 2.48,   group: "common" },

  { id: "alkali-silicate",      label: "Alkali silicate",           densityGCm3: 3.02,    group: "other" },
  { id: "aluminosilicate",      label: "Aluminosilicate glass",     densityGCm3: 2.64,    group: "other" },
  { id: "blue-ornamental",      label: "Blue ornamental",           densityGCm3: 2.488,   group: "other" },
  { id: "borosilicate",         label: "Borosilicate glass",        densityGCm3: 2.23,    group: "other" },
  { id: "bottle",                label: "Bottle glass",             densityGCm3: 2.5,     group: "other" },
  { id: "crown",                 label: "Crown glass",              densityGCm3: 2.5,     group: "other" },
  { id: "double-glazing",        label: "Double glazing",           densityGCm3: 2.5125,  group: "other" },
  { id: "flint",                 label: "Flint",                    densityGCm3: 3.7,     group: "other" },
  { id: "lead-crystal",          label: "Lead crystal",             densityGCm3: 2.96,    group: "other" },
  { id: "pyrex",                 label: "Pyrex",                    densityGCm3: 2.27,    group: "other" },
  { id: "quartz",                label: "Quartz",                   densityGCm3: 2.211,   group: "other" },
  { id: "red-ornamental",        label: "Red ornamental",           densityGCm3: 2.554,   group: "other" },
  { id: "silica",                label: "Silica glass",             densityGCm3: 2.2,     group: "other" },
  { id: "soda-lime-silicate",    label: "Soda lime silicate glass", densityGCm3: 2.486,   group: "other" },
  { id: "window",                label: "Window glass",             densityGCm3: 2.51,    group: "other" },
  { id: "zinc-titania",          label: "Zinc titania",             densityGCm3: 2.531,   group: "other" },

  { id: "custom", label: "Custom glass density", densityGCm3: null, group: "other" },
];

export const DEFAULT_GLASS_TYPE_ID = "annealed";
export const DEFAULT_DENSITY_GCM3 = GLASS_TYPES.find((g) => g.id === DEFAULT_GLASS_TYPE_ID).densityGCm3;

// ── Glass shapes ─────────────────────────────────────────────────────────
// Each shape defines its own dimension fields (besides the common
// Thickness) and how to compute its area (in m²) from those fields
// (also in m). `thicknessLabel` lets a shape rename the Thickness field
// (e.g. Round rod uses its length as the extrusion dimension).
// `directAreaInput: true` (Other shapes) skips dimension fields entirely
// and lets the user type the Area directly.
export const SHAPES = [
  {
    id: "rectangular",
    label: "Rectangular",
    fields: [
      { id: "height", label: "Height (h)" },
      { id: "width",  label: "Width (w)"  },
    ],
    areaM2: (v) => v.height * v.width,
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
    id: "triangular",
    label: "Triangular",
    fields: [
      { id: "base",   label: "Base (b)"   },
      { id: "height", label: "Height (h)" },
    ],
    areaM2: (v) => 0.5 * v.base * v.height,
  },
  {
    id: "circular",
    label: "Circular",
    fields: [
      { id: "diameter", label: "Diameter (⌀)" },
    ],
    areaM2: (v) => PI * (v.diameter / 2) ** 2,
  },
  {
    id: "semi-circular",
    label: "Semi-circular",
    fields: [
      { id: "diameter", label: "Diameter (⌀)" },
    ],
    areaM2: (v) => 0.5 * PI * (v.diameter / 2) ** 2,
  },
  {
    id: "elliptical",
    label: "Elliptical",
    fields: [
      { id: "major", label: "Major axis (a)" },
      { id: "minor", label: "Minor axis (b)" },
    ],
    areaM2: (v) => PI * (v.major / 2) * (v.minor / 2),
  },
  {
    id: "round-rod",
    label: "Round rod",
    fields: [
      { id: "diameter", label: "Diameter (⌀)" },
    ],
    areaM2: (v) => PI * (v.diameter / 2) ** 2,
    thicknessLabel: "Length (l)",
  },
  {
    id: "other",
    label: "Other shapes",
    fields: [],
    directAreaInput: true,
    areaM2: null,
  },
];

// ── Unit converters ──────────────────────────────────────────────────────

export function toLengthM(val, unitId, units = LENGTH_UNITS) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = units.find((u) => u.id === unitId);
  return u ? v * u.toM : null;
}

export function toDensityKgM3(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toKgM3 : null;
}

export function areaToM2(val, unitId) {
  const v = parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const u = AREA_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toM2 : null;
}

export function fromM2(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = AREA_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM2 : val;
}

export function fromM3(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = VOLUME_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromM3 : val;
}

export function fromKgGlass(val, unitId) {
  if (val === null || !isFinite(val)) return null;
  const u = WEIGHT_UNITS.find((u) => u.id === unitId);
  return u ? val * u.fromKg : val;
}

// ── Core calculation ─────────────────────────────────────────────────────
// `dimsM` holds the shape's own dimension values (in metres), keyed by each
// shape's field ids. `areaInputM2` is used instead for the "Other shapes"
// (direct area entry) option. Area is returned as soon as its inputs are
// set; volume and weight only once thickness (and, for weight, density)
// are also set, and total weight also factors in quantity.
export function calcGlassWeight({ shapeId, dimsM, areaInputM2, thicknessM, densityKgM3, quantity }) {
  const shape = SHAPES.find((s) => s.id === shapeId) || SHAPES[0];

  let areaM2;
  if (shape.directAreaInput) {
    areaM2 = isFinite(areaInputM2) && areaInputM2 > 0 ? areaInputM2 : null;
  } else {
    const allDimsSet = shape.fields.every((f) => isFinite(dimsM[f.id]) && dimsM[f.id] > 0);
    areaM2 = allDimsSet ? shape.areaM2(dimsM) : null;
    if (areaM2 !== null && (!isFinite(areaM2) || areaM2 <= 0)) areaM2 = null;
  }
  if (areaM2 === null) return null;

  let volumeM3 = null;
  let weightKgSingle = null;
  let weightKgTotal = null;

  if (isFinite(thicknessM) && thicknessM > 0) {
    volumeM3 = areaM2 * thicknessM;
    if (isFinite(densityKgM3) && densityKgM3 > 0) {
      weightKgSingle = volumeM3 * densityKgM3;
      const qty = isFinite(quantity) && quantity > 0 ? quantity : 1;
      weightKgTotal = weightKgSingle * qty;
    }
  }

  return { areaM2, volumeM3, weightKgSingle, weightKgTotal };
}

// ── Formatter ─────────────────────────────────────────────────────────────
export function fmtGlass(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}
