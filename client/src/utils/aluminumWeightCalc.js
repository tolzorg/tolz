// Aluminum Weight Calculator — pure calculation utilities

const PI    = Math.PI;
const SQRT3 = Math.sqrt(3);

// ── Alloys ────────────────────────────────────────────────────
// Engineering density values in kg/m³ (ASM / MatWeb references)
export const ALUMINUM_ALLOYS = [
  { id: "pure",   label: "Pure Aluminum (1070/1080)", density: 2710 },
  { id: "1050",   label: "1050",                      density: 2705 },
  { id: "1100",   label: "1100",                      density: 2710 },
  { id: "2011",   label: "2011",                      density: 2830 },
  { id: "2024",   label: "2024",                      density: 2780 },
  { id: "3003",   label: "3003",                      density: 2730 },
  { id: "5052",   label: "5052",                      density: 2680 },
  { id: "5083",   label: "5083",                      density: 2660 },
  { id: "6061",   label: "6061",                      density: 2700 },
  { id: "6063",   label: "6063",                      density: 2700 },
  { id: "6082",   label: "6082",                      density: 2710 },
  { id: "7075",   label: "7075",                      density: 2810 },
  { id: "custom", label: "Custom Density",            density: null },
];

// ── Density units ─────────────────────────────────────────────
export const DENSITY_UNITS = [
  { id: "kg_m3",  label: "kg/m³",  toKgM3: 1         },
  { id: "g_cm3",  label: "g/cm³",  toKgM3: 1000      },
  { id: "lb_in3", label: "lb/in³", toKgM3: 27679.905 },
  { id: "lb_ft3", label: "lb/ft³", toKgM3: 16.01846  },
];

// ── Dimension input units ──────────────────────────────────────
export const AL_DIMENSION_UNITS = [
  { id: "mm", label: "mm", toM: 1e-3    },
  { id: "cm", label: "cm", toM: 1e-2    },
  { id: "m",  label: "m",  toM: 1       },
  { id: "in", label: "in", toM: 0.0254  },
  { id: "ft", label: "ft", toM: 0.3048  },
  { id: "yd", label: "yd", toM: 0.9144  },
];

// ── Volume output units ────────────────────────────────────────
export const AL_VOLUME_UNITS = [
  { id: "mm3", label: "mm³", fromM3: 1e9        },
  { id: "cm3", label: "cm³", fromM3: 1e6        },
  { id: "m3",  label: "m³",  fromM3: 1          },
  { id: "in3", label: "in³", fromM3: 61023.7441 },
  { id: "ft3", label: "ft³", fromM3: 35.31467   },
];

// Volume input units (for Custom Volume shape field)
export const VOLUME_INPUT_UNITS = [
  { id: "mm3", label: "mm³", toM3: 1e-9      },
  { id: "cm3", label: "cm³", toM3: 1e-6      },
  { id: "m3",  label: "m³",  toM3: 1         },
  { id: "in3", label: "in³", toM3: 1.6387e-5 },
  { id: "ft3", label: "ft³", toM3: 0.0283168 },
];

// ── Weight output units ────────────────────────────────────────
export const AL_WEIGHT_UNITS = [
  { id: "mg",     label: "mg",     fromKg: 1e6     },
  { id: "g",      label: "g",      fromKg: 1000    },
  { id: "kg",     label: "kg",     fromKg: 1       },
  { id: "tonnes", label: "tonnes", fromKg: 0.001   },
  { id: "oz",     label: "oz",     fromKg: 35.274  },
  { id: "lb",     label: "lb",     fromKg: 2.20462 },
];

// ── Shapes ────────────────────────────────────────────────────
// All calc() functions receive dimsInMeters and return volume in m³.
// Field type "volume" means use VOLUME_INPUT_UNITS instead of AL_DIMENSION_UNITS.
export const AL_SHAPES = [
  {
    id: "rectangular-bar",
    label: "Rectangular Bar",
    fields: [
      { key: "length", label: "Length", defaultUnit: "m",  placeholder: "2"  },
      { key: "width",  label: "Width",  defaultUnit: "mm", placeholder: "50" },
      { key: "height", label: "Height", defaultUnit: "mm", placeholder: "25" },
    ],
    formula: "V = Length × Width × Height",
    calc: (d) => d.length * d.width * d.height,
  },
  {
    id: "round-bar",
    label: "Round Bar",
    fields: [
      { key: "length",   label: "Length",   defaultUnit: "m",  placeholder: "2"  },
      { key: "diameter", label: "Diameter", defaultUnit: "mm", placeholder: "30" },
    ],
    formula: "V = π × (D / 2)² × Length",
    calc: (d) => PI * (d.diameter / 2) ** 2 * d.length,
  },
  {
    id: "square-bar",
    label: "Square Bar",
    fields: [
      { key: "length", label: "Length",      defaultUnit: "m",  placeholder: "2"  },
      { key: "size",   label: "Side Length", defaultUnit: "mm", placeholder: "25" },
    ],
    formula: "V = Side² × Length",
    calc: (d) => d.size ** 2 * d.length,
  },
  {
    id: "hex-bar",
    label: "Hex Bar",
    fields: [
      { key: "length",      label: "Length",            defaultUnit: "m",  placeholder: "2"  },
      { key: "acrossFlats", label: "Across Flats (AF)", defaultUnit: "mm", placeholder: "30" },
    ],
    // Cross-section area of regular hex = (√3/2) × AF²
    formula: "V = (√3 / 2) × AF² × Length",
    calc: (d) => (SQRT3 / 2) * d.acrossFlats ** 2 * d.length,
  },
  {
    id: "flat-bar",
    label: "Flat Bar",
    fields: [
      { key: "length",    label: "Length",    defaultUnit: "m",  placeholder: "2"   },
      { key: "width",     label: "Width",     defaultUnit: "mm", placeholder: "100" },
      { key: "thickness", label: "Thickness", defaultUnit: "mm", placeholder: "6"   },
    ],
    formula: "V = Length × Width × Thickness",
    calc: (d) => d.length * d.width * d.thickness,
  },
  {
    id: "round-tube",
    label: "Tube (Round Hollow)",
    fields: [
      { key: "length",        label: "Length",         defaultUnit: "m",  placeholder: "3"  },
      { key: "outerDiameter", label: "Outer Diameter", defaultUnit: "mm", placeholder: "50" },
      { key: "innerDiameter", label: "Inner Diameter", defaultUnit: "mm", placeholder: "44" },
    ],
    formula: "V = π × (OD² − ID²) / 4 × Length",
    validate: (d) =>
      d.innerDiameter >= d.outerDiameter
        ? "Inner diameter must be less than outer diameter"
        : null,
    calc: (d) =>
      (PI / 4) * (d.outerDiameter ** 2 - d.innerDiameter ** 2) * d.length,
  },
  {
    id: "square-tube",
    label: "Square Tube",
    fields: [
      { key: "length",        label: "Length",         defaultUnit: "m",  placeholder: "3"  },
      { key: "outerSize",     label: "Outer Size",     defaultUnit: "mm", placeholder: "50" },
      { key: "wallThickness", label: "Wall Thickness", defaultUnit: "mm", placeholder: "3"  },
    ],
    formula: "V = (OS² − (OS − 2×WT)²) × Length",
    validate: (d) =>
      d.wallThickness >= d.outerSize / 2
        ? "Wall thickness must be less than half the outer size"
        : null,
    calc: (d) => {
      const inner = d.outerSize - 2 * d.wallThickness;
      return (d.outerSize ** 2 - inner ** 2) * d.length;
    },
  },
  {
    id: "rectangular-tube",
    label: "Rectangular Tube",
    fields: [
      { key: "length",        label: "Length",         defaultUnit: "m",  placeholder: "3"   },
      { key: "width",         label: "Width",          defaultUnit: "mm", placeholder: "100" },
      { key: "height",        label: "Height",         defaultUnit: "mm", placeholder: "50"  },
      { key: "wallThickness", label: "Wall Thickness", defaultUnit: "mm", placeholder: "3"   },
    ],
    formula: "V = (W×H − (W−2WT)×(H−2WT)) × Length",
    validate: (d) =>
      d.wallThickness >= d.width / 2 || d.wallThickness >= d.height / 2
        ? "Wall thickness must be less than half the smallest dimension"
        : null,
    calc: (d) => {
      const iw = d.width  - 2 * d.wallThickness;
      const ih = d.height - 2 * d.wallThickness;
      return (d.width * d.height - iw * ih) * d.length;
    },
  },
  {
    id: "pipe",
    label: "Pipe",
    fields: [
      { key: "length",        label: "Length",         defaultUnit: "m",  placeholder: "6"   },
      { key: "outerDiameter", label: "Outer Diameter", defaultUnit: "mm", placeholder: "60"  },
      { key: "wallThickness", label: "Wall Thickness", defaultUnit: "mm", placeholder: "3.5" },
    ],
    formula: "V = π × (OD² − (OD − 2WT)²) / 4 × Length",
    validate: (d) =>
      d.wallThickness >= d.outerDiameter / 2
        ? "Wall thickness must be less than half the outer diameter"
        : null,
    calc: (d) => {
      const id = d.outerDiameter - 2 * d.wallThickness;
      return (PI / 4) * (d.outerDiameter ** 2 - id ** 2) * d.length;
    },
  },
  {
    id: "sheet",
    label: "Sheet / Plate",
    fields: [
      { key: "length",    label: "Length",    defaultUnit: "m",  placeholder: "2" },
      { key: "width",     label: "Width",     defaultUnit: "m",  placeholder: "1" },
      { key: "thickness", label: "Thickness", defaultUnit: "mm", placeholder: "3" },
    ],
    formula: "V = Length × Width × Thickness",
    calc: (d) => d.length * d.width * d.thickness,
  },
  {
    id: "angle",
    label: "Angle",
    fields: [
      { key: "length",    label: "Length",    defaultUnit: "m",  placeholder: "3"  },
      { key: "leg1",      label: "Leg 1",     defaultUnit: "mm", placeholder: "50" },
      { key: "leg2",      label: "Leg 2",     defaultUnit: "mm", placeholder: "50" },
      { key: "thickness", label: "Thickness", defaultUnit: "mm", placeholder: "5"  },
    ],
    // Standard equal/unequal angle cross-section area
    formula: "V = (Leg1 + Leg2 − Thickness) × Thickness × Length",
    validate: (d) =>
      d.thickness >= d.leg1 || d.thickness >= d.leg2
        ? "Thickness must be less than each leg length"
        : null,
    calc: (d) => (d.leg1 + d.leg2 - d.thickness) * d.thickness * d.length,
  },
  {
    id: "channel",
    label: "Channel (C-Section)",
    fields: [
      { key: "length",          label: "Length",           defaultUnit: "m",  placeholder: "3"  },
      { key: "flangeWidth",     label: "Flange Width",     defaultUnit: "mm", placeholder: "50" },
      { key: "height",          label: "Height",           defaultUnit: "mm", placeholder: "80" },
      { key: "flangeThickness", label: "Flange Thickness", defaultUnit: "mm", placeholder: "6"  },
      { key: "webThickness",    label: "Web Thickness",    defaultUnit: "mm", placeholder: "5"  },
    ],
    formula: "V = (2×FW×FT + (H − 2×FT)×WT) × Length",
    validate: (d) =>
      d.flangeThickness * 2 >= d.height
        ? "Flanges too tall for given height"
        : null,
    calc: (d) => {
      const webH = d.height - 2 * d.flangeThickness;
      return (2 * d.flangeWidth * d.flangeThickness + webH * d.webThickness) * d.length;
    },
  },
  {
    id: "t-bar",
    label: "T-Bar",
    fields: [
      { key: "length",          label: "Length",           defaultUnit: "m",  placeholder: "3"  },
      { key: "flangeWidth",     label: "Flange Width",     defaultUnit: "mm", placeholder: "60" },
      { key: "webHeight",       label: "Web Height",       defaultUnit: "mm", placeholder: "60" },
      { key: "flangeThickness", label: "Flange Thickness", defaultUnit: "mm", placeholder: "6"  },
      { key: "webThickness",    label: "Web Thickness",    defaultUnit: "mm", placeholder: "5"  },
    ],
    formula: "V = (FW×FT + (WH − FT)×WT) × Length",
    validate: (d) =>
      d.flangeThickness >= d.webHeight
        ? "Flange thickness must be less than web height"
        : null,
    calc: (d) =>
      (d.flangeWidth * d.flangeThickness +
        (d.webHeight - d.flangeThickness) * d.webThickness) *
      d.length,
  },
  {
    id: "i-beam",
    label: "I-Beam",
    fields: [
      { key: "length",          label: "Length",           defaultUnit: "m",  placeholder: "6"   },
      { key: "flangeWidth",     label: "Flange Width",     defaultUnit: "mm", placeholder: "100" },
      { key: "totalHeight",     label: "Total Height",     defaultUnit: "mm", placeholder: "150" },
      { key: "flangeThickness", label: "Flange Thickness", defaultUnit: "mm", placeholder: "8"   },
      { key: "webThickness",    label: "Web Thickness",    defaultUnit: "mm", placeholder: "5"   },
    ],
    formula: "V = (2×FW×FT + (TH − 2×FT)×WT) × Length",
    validate: (d) =>
      d.flangeThickness * 2 >= d.totalHeight
        ? "Flanges too tall for given total height"
        : null,
    calc: (d) => {
      const webH = d.totalHeight - 2 * d.flangeThickness;
      return (2 * d.flangeWidth * d.flangeThickness + webH * d.webThickness) * d.length;
    },
  },
  {
    id: "custom-volume",
    label: "Custom Volume",
    fields: [
      { key: "volume", label: "Volume", type: "volume", defaultUnit: "cm3", placeholder: "1000" },
    ],
    formula: "V = User-defined volume input",
    calc: null, // handled specially: volume field is already in m³ after conversion
  },
];

// ── Conversions ────────────────────────────────────────────────

export function toMeters(value, unit) {
  const v = parseFloat(value);
  if (!isFinite(v) || v <= 0) return null;
  const u = AL_DIMENSION_UNITS.find((u) => u.id === unit);
  return u ? v * u.toM : null;
}

export function volumeInputToM3(value, unit) {
  const v = parseFloat(value);
  if (!isFinite(v) || v <= 0) return null;
  const u = VOLUME_INPUT_UNITS.find((u) => u.id === unit);
  return u ? v * u.toM3 : null;
}

export function convertVolume(volM3, unit) {
  const u = AL_VOLUME_UNITS.find((u) => u.id === unit);
  return u ? volM3 * u.fromM3 : volM3;
}

export function convertWeight(weightKg, unit) {
  const u = AL_WEIGHT_UNITS.find((u) => u.id === unit);
  return u ? weightKg * u.fromKg : weightKg;
}

export function convertDensityToKgM3(density, unitId) {
  const v = parseFloat(density);
  if (!isFinite(v) || v <= 0) return null;
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? v * u.toKgM3 : null;
}

export function convertDensityFromKgM3(densityKgM3, unitId) {
  const u = DENSITY_UNITS.find((u) => u.id === unitId);
  return u ? densityKgM3 / u.toKgM3 : densityKgM3;
}

// Build a { fieldKey: valueInMeters } map for the active shape.
// Returns null if any field is invalid.
export function buildAlDimsInMeters(shape, dims) {
  if (!shape) return null;
  const result = {};
  for (const f of shape.fields) {
    const dim = dims[f.key];
    if (!dim) return null;
    if (f.type === "volume") {
      const m3 = volumeInputToM3(dim.value, dim.unit);
      if (m3 === null) return null;
      result[f.key] = m3;
    } else {
      const m = toMeters(dim.value, dim.unit);
      if (m === null) return null;
      result[f.key] = m;
    }
  }
  return result;
}

// Returns volume in m³ or null.
export function calcAlVolume(shapeId, dimsInMeters) {
  const shape = AL_SHAPES.find((s) => s.id === shapeId);
  if (!shape || !dimsInMeters) return null;

  if (shape.validate) {
    if (shape.validate(dimsInMeters)) return null;
  }

  if (shapeId === "custom-volume") {
    const v = dimsInMeters.volume;
    return isFinite(v) && v > 0 ? v : null;
  }

  if (!shape.calc) return null;
  const vol = shape.calc(dimsInMeters);
  return isFinite(vol) && vol > 0 ? vol : null;
}

// Default dims state for a shape (empty value, correct default unit)
export function getDefaultAlDims(shapeId) {
  const shape = AL_SHAPES.find((s) => s.id === shapeId);
  if (!shape) return {};
  const result = {};
  for (const f of shape.fields) {
    result[f.key] = { value: "", unit: f.defaultUnit || "mm" };
  }
  return result;
}

// Format up to 4 dp, strip trailing zeros
export function formatAl(n, dp = 4) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

// Format weight with 2 dp, strip trailing zeros
export function formatAlWeight(n) {
  return formatAl(n, 2);
}

// Field validation
export function validateAlField(value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = parseFloat(value);
  if (!isFinite(n)) return "Enter a valid number";
  if (n <= 0)        return "Must be greater than zero";
  return null;
}
