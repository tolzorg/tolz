// Construction Volume Calculator — pure calculation utilities

const PI = Math.PI;

export const DIMENSION_UNITS = [
  { id: "ft",  label: "Feet (ft)" },
  { id: "in",  label: "Inches (in)" },
  { id: "yd",  label: "Yards (yd)" },
  { id: "mm",  label: "Millimeters (mm)" },
  { id: "cm",  label: "Centimeters (cm)" },
  { id: "m",   label: "Meters (m)" },
];

export const CURRENCIES = [
  { id: "USD", symbol: "$",    label: "USD ($)" },
  { id: "EUR", symbol: "€",    label: "EUR (€)" },
  { id: "GBP", symbol: "£",    label: "GBP (£)" },
  { id: "PKR", symbol: "₨",   label: "PKR (₨)" },
  { id: "INR", symbol: "₹",    label: "INR (₹)" },
  { id: "AED", symbol: "د.إ", label: "AED (د.إ)" },
  { id: "SAR", symbol: "﷼",   label: "SAR (﷼)" },
];

export const PRICE_UNITS = [
  { id: "per_yd3", label: "Per Cubic Yard" },
  { id: "per_ft3", label: "Per Cubic Foot" },
  { id: "per_m3",  label: "Per Cubic Meter" },
];

export const MATERIALS = [
  { id: "concrete",      label: "Concrete",      lbsPerCuYd: 4000 },
  { id: "gravel",        label: "Gravel",        lbsPerCuYd: 2800 },
  { id: "sand",          label: "Sand",          lbsPerCuYd: 2700 },
  { id: "topsoil",       label: "Topsoil",       lbsPerCuYd: 2200 },
  { id: "mulch",         label: "Mulch",         lbsPerCuYd:  800 },
  { id: "crushed_stone", label: "Crushed Stone", lbsPerCuYd: 2700 },
  { id: "fill_dirt",     label: "Fill Dirt",     lbsPerCuYd: 2000 },
];

// field.type === "count" means no unit selector (integer count)
export const SHAPES = [
  {
    id: "rectangle",
    label: "Rectangle / Slab",
    fields: [
      { key: "length", label: "Length", defaultUnit: "ft", placeholder: "10" },
      { key: "width",  label: "Width",  defaultUnit: "ft", placeholder: "10" },
      { key: "depth",  label: "Depth",  defaultUnit: "in", placeholder: "4"  },
    ],
    formula: "V = Length × Width × Depth",
    calc: (d) => d.length * d.width * d.depth,
  },
  {
    id: "cylinder",
    label: "Cylinder",
    fields: [
      { key: "radius", label: "Radius", defaultUnit: "ft", placeholder: "2" },
      { key: "height", label: "Height", defaultUnit: "ft", placeholder: "4" },
    ],
    formula: "V = π × Radius² × Height",
    calc: (d) => PI * d.radius * d.radius * d.height,
  },
  {
    id: "circular",
    label: "Circular Area",
    fields: [
      { key: "diameter", label: "Diameter", defaultUnit: "ft", placeholder: "10" },
      { key: "depth",    label: "Depth",    defaultUnit: "in", placeholder: "4"  },
    ],
    formula: "V = π × (Diameter ÷ 2)² × Depth",
    calc: (d) => PI * (d.diameter / 2) ** 2 * d.depth,
  },
  {
    id: "tube",
    label: "Tube (Hollow Cylinder)",
    fields: [
      { key: "outerRadius", label: "Outer Radius", defaultUnit: "ft", placeholder: "2"   },
      { key: "innerRadius", label: "Inner Radius", defaultUnit: "ft", placeholder: "1.5" },
      { key: "height",      label: "Height",       defaultUnit: "ft", placeholder: "4"   },
    ],
    formula: "V = π × (Outer² − Inner²) × Height",
    validate: (d) => d.innerRadius >= d.outerRadius ? "Inner radius must be less than outer radius" : null,
    calc: (d) => PI * (d.outerRadius ** 2 - d.innerRadius ** 2) * d.height,
  },
  {
    id: "triangle",
    label: "Triangle Prism",
    fields: [
      { key: "base",      label: "Base",          defaultUnit: "ft", placeholder: "4"  },
      { key: "triHeight", label: "Height (tri)",  defaultUnit: "ft", placeholder: "3"  },
      { key: "depth",     label: "Length / Depth",defaultUnit: "ft", placeholder: "10" },
    ],
    formula: "V = 0.5 × Base × Height × Length",
    calc: (d) => 0.5 * d.base * d.triHeight * d.depth,
  },
  {
    id: "trapezoid",
    label: "Trapezoid Prism",
    fields: [
      { key: "topWidth",    label: "Top Width",    defaultUnit: "ft", placeholder: "4"  },
      { key: "bottomWidth", label: "Bottom Width", defaultUnit: "ft", placeholder: "6"  },
      { key: "trapHeight",  label: "Height",       defaultUnit: "ft", placeholder: "3"  },
      { key: "length",      label: "Length",       defaultUnit: "ft", placeholder: "10" },
    ],
    formula: "V = ((Top + Bottom) ÷ 2) × Height × Length",
    calc: (d) => ((d.topWidth + d.bottomWidth) / 2) * d.trapHeight * d.length,
  },
  {
    id: "sqfooting",
    label: "Square Footing",
    fields: [
      { key: "length", label: "Length", defaultUnit: "ft", placeholder: "2"  },
      { key: "width",  label: "Width",  defaultUnit: "ft", placeholder: "2"  },
      { key: "depth",  label: "Depth",  defaultUnit: "in", placeholder: "12" },
    ],
    formula: "V = Length × Width × Depth",
    calc: (d) => d.length * d.width * d.depth,
  },
  {
    id: "circfooting",
    label: "Circular Footing",
    fields: [
      { key: "diameter", label: "Diameter", defaultUnit: "ft", placeholder: "2"  },
      { key: "depth",    label: "Depth",    defaultUnit: "in", placeholder: "12" },
    ],
    formula: "V = π × (Diameter ÷ 2)² × Depth",
    calc: (d) => PI * (d.diameter / 2) ** 2 * d.depth,
  },
  {
    id: "column",
    label: "Column",
    fields: [
      { key: "diameter", label: "Diameter", defaultUnit: "in", placeholder: "12" },
      { key: "height",   label: "Height",   defaultUnit: "ft", placeholder: "8"  },
    ],
    formula: "V = π × (Diameter ÷ 2)² × Height",
    calc: (d) => PI * (d.diameter / 2) ** 2 * d.height,
  },
  {
    id: "wall",
    label: "Wall",
    fields: [
      { key: "length",    label: "Length",    defaultUnit: "ft", placeholder: "20" },
      { key: "height",    label: "Height",    defaultUnit: "ft", placeholder: "8"  },
      { key: "thickness", label: "Thickness", defaultUnit: "in", placeholder: "6"  },
    ],
    formula: "V = Length × Height × Thickness",
    calc: (d) => d.length * d.height * d.thickness,
  },
  {
    id: "curb",
    label: "Curb and Gutter",
    fields: [
      { key: "length", label: "Length", defaultUnit: "ft", placeholder: "50" },
      { key: "width",  label: "Width",  defaultUnit: "in", placeholder: "12" },
      { key: "depth",  label: "Depth",  defaultUnit: "in", placeholder: "6"  },
    ],
    formula: "V = Length × Width × Depth",
    calc: (d) => d.length * d.width * d.depth,
  },
  {
    id: "stair",
    label: "Stair",
    fields: [
      { key: "width",    label: "Width",            defaultUnit: "ft",     placeholder: "4" },
      { key: "run",      label: "Run (per step)",   defaultUnit: "in",     placeholder: "12" },
      { key: "rise",     label: "Rise (per step)",  defaultUnit: "in",     placeholder: "7" },
      { key: "numSteps", label: "Number of Steps",  type: "count",         placeholder: "5" },
    ],
    formula: "V = Width × Run × Rise × Steps",
    calc: (d) => d.width * d.run * d.rise * d.numSteps,
  },
  {
    id: "ring",
    label: "Ring / Annulus",
    fields: [
      { key: "outerRadius", label: "Outer Radius", defaultUnit: "ft", placeholder: "5"   },
      { key: "innerRadius", label: "Inner Radius", defaultUnit: "ft", placeholder: "3"   },
      { key: "height",      label: "Height",       defaultUnit: "in", placeholder: "4"   },
    ],
    formula: "V = π × (Outer² − Inner²) × Height",
    validate: (d) => d.innerRadius >= d.outerRadius ? "Inner radius must be less than outer radius" : null,
    calc: (d) => PI * (d.outerRadius ** 2 - d.innerRadius ** 2) * d.height,
  },
  {
    id: "custombox",
    label: "Custom Box",
    fields: [
      { key: "length", label: "Length", defaultUnit: "ft", placeholder: "5" },
      { key: "width",  label: "Width",  defaultUnit: "ft", placeholder: "4" },
      { key: "height", label: "Height", defaultUnit: "ft", placeholder: "3" },
    ],
    formula: "V = Length × Width × Height",
    calc: (d) => d.length * d.width * d.height,
  },
];

// Convert any value+unit to feet. Returns null for invalid input.
export function toFeet(value, unit) {
  const v = parseFloat(value);
  if (!isFinite(v) || v <= 0) return null;
  switch (unit) {
    case "ft": return v;
    case "in": return v / 12;
    case "yd": return v * 3;
    case "mm": return v / 304.8;
    case "cm": return v / 30.48;
    case "m":  return v * 3.28084;
    default:   return v;
  }
}

// Build feet-converted dims object. Returns null if any required field is invalid.
export function buildDimsInFeet(shape, dims) {
  const result = {};
  for (const f of shape.fields) {
    const dim = dims[f.key];
    if (!dim) return null;
    if (f.type === "count") {
      const n = parseFloat(dim.value);
      if (!isFinite(n) || n <= 0 || !Number.isInteger(n)) return null;
      result[f.key] = n;
    } else {
      const ft = toFeet(dim.value, dim.unit);
      if (ft === null) return null;
      result[f.key] = ft;
    }
  }
  return result;
}

// Main calculation. Returns result object or null.
export function calcShape(shapeId, dimsInFeet) {
  const shape = SHAPES.find((s) => s.id === shapeId);
  if (!shape || !dimsInFeet) return null;

  if (shape.validate) {
    const err = shape.validate(dimsInFeet);
    if (err) return null;
  }

  const cubicFeet = shape.calc(dimsInFeet);
  if (!isFinite(cubicFeet) || cubicFeet <= 0) return null;

  const cubicYards  = cubicFeet / 27;
  const cubicMeters = cubicFeet * 0.0283168;

  return { cubicFeet, cubicYards, cubicMeters };
}

// Calculate material cost.
export function calcCost(cubicYards, price, priceUnit) {
  const p = parseFloat(price);
  if (!isFinite(p) || p <= 0 || !cubicYards) return null;
  switch (priceUnit) {
    case "per_yd3": return cubicYards * p;
    case "per_ft3": return cubicYards * 27 * p;
    case "per_m3":  return cubicYards * 0.764555 * p;
    default:        return cubicYards * p;
  }
}

// Get default dims state for a shape.
export function getDefaultDims(shapeId) {
  const shape = SHAPES.find((s) => s.id === shapeId);
  if (!shape) return {};
  const result = {};
  for (const f of shape.fields) {
    result[f.key] = { value: "", unit: f.defaultUnit || "ft" };
  }
  return result;
}

// Format: 2 dp, strip trailing zeros.
export function formatCY(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(2)).toString();
}
