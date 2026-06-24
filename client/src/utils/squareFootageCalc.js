// Square Footage Calculator — utility functions and shape definitions

export const DIM_UNITS = [
  { id: "ft",    label: "Feet (ft)" },
  { id: "in",    label: "Inches (in)" },
  { id: "yd",    label: "Yards (yd)" },
  { id: "mm",    label: "Millimeters (mm)" },
  { id: "cm",    label: "Centimeters (cm)" },
  { id: "m",     label: "Meters (m)" },
  { id: "km",    label: "Kilometers (km)" },
  { id: "mi",    label: "Miles (mi)" },
  { id: "ft_in", label: "Feet / Inches" },
  { id: "m_cm",  label: "Meters / Centimeters" },
];

export const AREA_OUTPUT_UNITS = [
  { id: "sqft",   label: "ft²  (square feet)",         symbol: "ft²"  },
  { id: "sqin",   label: "in²  (square inches)",        symbol: "in²"  },
  { id: "sqyd",   label: "yd²  (square yards)",         symbol: "yd²"  },
  { id: "sqmm",   label: "mm²  (square millimeters)",   symbol: "mm²"  },
  { id: "sqcm",   label: "cm²  (square centimeters)",   symbol: "cm²"  },
  { id: "sqdm",   label: "dm²  (square decimeters)",    symbol: "dm²"  },
  { id: "sqm",    label: "m²   (square meters)",        symbol: "m²"   },
  { id: "sqkm",   label: "km²  (square kilometers)",    symbol: "km²"  },
  { id: "sqmi",   label: "mi²  (square miles)",         symbol: "mi²"  },
  { id: "are",    label: "a    (ares)",                  symbol: "a"    },
  { id: "decare", label: "da   (decares)",               symbol: "da"   },
  { id: "ha",     label: "ha   (hectares)",              symbol: "ha"   },
  { id: "ac",     label: "ac   (acres)",                 symbol: "ac"   },
  { id: "sf",     label: "sf   (soccer fields)",         symbol: "sf"   },
];

// Convert any dimension value → feet
export function dimToFt(val, unit, compA, compB) {
  if (unit === "ft_in") {
    const f = parseFloat(compA) || 0;
    const i = parseFloat(compB) || 0;
    const total = f + i / 12;
    return total > 0 ? total : null;
  }
  if (unit === "m_cm") {
    const m  = parseFloat(compA) || 0;
    const cm = parseFloat(compB) || 0;
    const total = (m + cm / 100) / 0.3048;
    return total > 0 ? total : null;
  }
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "ft": return n;
    case "in": return n / 12;
    case "yd": return n * 3;
    case "mm": return n / 304.8;
    case "cm": return n / 30.48;
    case "m":  return n / 0.3048;
    case "km": return n / 0.0003048;
    case "mi": return n * 5280;
    default:   return n;
  }
}

// Convert area in sqFt → display unit
export function fromSqFt(sqFt, unit) {
  if (!sqFt || !isFinite(sqFt) || sqFt <= 0) return null;
  switch (unit) {
    case "sqft":   return sqFt;
    case "sqin":   return sqFt * 144;
    case "sqyd":   return sqFt / 9;
    case "sqmm":   return sqFt * 92903.04;
    case "sqcm":   return sqFt * 929.0304;
    case "sqdm":   return sqFt * 9.29030;
    case "sqm":    return sqFt * 0.092903;
    case "sqkm":   return sqFt * 9.2903e-8;
    case "sqmi":   return sqFt / 27878400;
    case "are":    return sqFt / 1076.391;
    case "decare": return sqFt / 10763.91;
    case "ha":     return sqFt / 107639.1;
    case "ac":     return sqFt / 43560;
    case "sf":     return sqFt / 76854.4;
    default:       return sqFt;
  }
}

// Convert area in any AREA_OUTPUT_UNITS unit → sqFt (for custom polygon input)
export function toSqFt(val, unit) {
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "sqft":   return n;
    case "sqin":   return n / 144;
    case "sqyd":   return n * 9;
    case "sqmm":   return n / 92903.04;
    case "sqcm":   return n / 929.0304;
    case "sqdm":   return n / 9.29030;
    case "sqm":    return n * 10.7639;
    case "sqkm":   return n * 10763910.4;
    case "sqmi":   return n * 27878400;
    case "are":    return n * 1076.391;
    case "decare": return n * 10763.91;
    case "ha":     return n * 107639.1;
    case "ac":     return n * 43560;
    case "sf":     return n * 76854.4;
    default:       return n;
  }
}

// Format number: strip trailing zeros, scientific notation for extremes
export function fmtN(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(dp);
  }
  return parseFloat(n.toFixed(dp)).toString();
}

const PI = Math.PI;
const sq = (x) => x * x;

export const SHAPES = [
  {
    id: "rectangle",
    label: "Rectangle",
    fields: [
      { id: "length", label: "Length", placeholder: "e.g. 20" },
      { id: "width",  label: "Width",  placeholder: "e.g. 15" },
    ],
    calc(f) {
      if (!f.length || !f.width) return null;
      return {
        areaSqFt:      f.length * f.width,
        perimeterFt:   2 * (f.length + f.width),
        perimeterLabel: "Perimeter",
      };
    },
    validate: null,
    formulaLines: [
      "Area = Length × Width",
      "Perimeter = 2 × (Length + Width)",
    ],
    example: {
      rows: [
        ["Length", "20 ft"],
        ["Width",  "15 ft"],
        ["Area",   "20 × 15 = 300 ft²"],
        ["Perimeter", "2 × (20 + 15) = 70 ft"],
      ],
      result: "300 ft²",
    },
  },

  {
    id: "square",
    label: "Square",
    fields: [
      { id: "side", label: "Side", placeholder: "e.g. 10" },
    ],
    calc(f) {
      if (!f.side) return null;
      return {
        areaSqFt:      sq(f.side),
        perimeterFt:   4 * f.side,
        perimeterLabel: "Perimeter",
      };
    },
    validate: null,
    formulaLines: [
      "Area = Side²",
      "Perimeter = 4 × Side",
    ],
    example: {
      rows: [
        ["Side",      "10 ft"],
        ["Area",      "10² = 100 ft²"],
        ["Perimeter", "4 × 10 = 40 ft"],
      ],
      result: "100 ft²",
    },
  },

  {
    id: "circle",
    label: "Circle",
    fields: [],   // handled in component with radius/diameter toggle
    isCircle: true,
    calc(f) {
      const r = f.radius;
      if (!r) return null;
      return {
        areaSqFt:          PI * sq(r),
        circumferenceFt:   2 * PI * r,
        perimeterLabel:    "Circumference",
      };
    },
    validate: null,
    formulaLines: [
      "Area = π × r²",
      "Circumference = 2 × π × r",
      "Diameter = 2 × r",
    ],
    example: {
      rows: [
        ["Radius",        "5 ft"],
        ["Area",          "π × 5² = 78.54 ft²"],
        ["Circumference", "2 × π × 5 = 31.42 ft"],
      ],
      result: "78.54 ft²",
    },
  },

  {
    id: "triangle",
    label: "Triangle",
    fields: [
      { id: "base",   label: "Base",   placeholder: "e.g. 10" },
      { id: "height", label: "Height", placeholder: "e.g. 8"  },
    ],
    calc(f) {
      if (!f.base || !f.height) return null;
      const leg = Math.sqrt(sq(f.height) + sq(f.base / 2));
      return {
        areaSqFt:      0.5 * f.base * f.height,
        perimeterFt:   f.base + 2 * leg,
        perimeterLabel: "Perimeter (isosceles)",
      };
    },
    validate: null,
    formulaLines: [
      "Area = ½ × Base × Height",
      "Perimeter = Base + 2 × √(Height² + (Base/2)²)  [isosceles]",
    ],
    example: {
      rows: [
        ["Base",      "10 ft"],
        ["Height",    "8 ft"],
        ["Area",      "½ × 10 × 8 = 40 ft²"],
        ["Leg",       "√(8² + 5²) = √89 ≈ 9.43 ft"],
        ["Perimeter", "10 + 2×9.43 = 28.87 ft"],
      ],
      result: "40 ft²",
    },
  },

  {
    id: "trapezoid",
    label: "Trapezoid",
    fields: [
      { id: "topWidth",    label: "Top Width (a)",    placeholder: "e.g. 5"  },
      { id: "bottomWidth", label: "Bottom Width (b)", placeholder: "e.g. 10" },
      { id: "height",      label: "Height",           placeholder: "e.g. 6"  },
    ],
    calc(f) {
      if (!f.topWidth || !f.bottomWidth || !f.height) return null;
      const leg = Math.sqrt(sq(f.height) + sq((f.bottomWidth - f.topWidth) / 2));
      return {
        areaSqFt:      0.5 * (f.topWidth + f.bottomWidth) * f.height,
        perimeterFt:   f.topWidth + f.bottomWidth + 2 * leg,
        perimeterLabel: "Perimeter (isosceles)",
      };
    },
    validate: null,
    formulaLines: [
      "Area = ½ × (a + b) × Height",
      "Perimeter = a + b + 2 × √(H² + ((b−a)/2)²)  [isosceles]",
    ],
    example: {
      rows: [
        ["Top (a)",    "5 ft"],
        ["Bottom (b)", "10 ft"],
        ["Height",     "6 ft"],
        ["Area",       "½ × (5+10) × 6 = 45 ft²"],
        ["Leg",        "√(6² + 2.5²) = 6.5 ft"],
        ["Perimeter",  "5 + 10 + 2×6.5 = 28 ft"],
      ],
      result: "45 ft²",
    },
  },

  {
    id: "ellipse",
    label: "Ellipse",
    fields: [
      { id: "majorAxis", label: "Major Axis (a)", placeholder: "e.g. 8" },
      { id: "minorAxis", label: "Minor Axis (b)", placeholder: "e.g. 5" },
    ],
    calc(f) {
      if (!f.majorAxis || !f.minorAxis) return null;
      const a = f.majorAxis, b = f.minorAxis;
      const h = sq((a - b) / (a + b));
      const perim = PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      return {
        areaSqFt:      PI * a * b,
        perimeterFt:   perim,
        perimeterLabel: "Perimeter (Ramanujan approx.)",
      };
    },
    validate(f) {
      if (f.majorAxis && f.minorAxis && f.minorAxis > f.majorAxis) {
        return "Major axis (a) must be ≥ minor axis (b).";
      }
      return null;
    },
    formulaLines: [
      "Area = π × a × b",
      "Perimeter ≈ π(a+b)[1 + 3h/(10+√(4−3h))],  h = ((a−b)/(a+b))²",
    ],
    example: {
      rows: [
        ["Major axis (a)", "8 ft"],
        ["Minor axis (b)", "5 ft"],
        ["Area",           "π × 8 × 5 = 125.66 ft²"],
        ["Perimeter",      "≈ 41.39 ft (Ramanujan)"],
      ],
      result: "125.66 ft²",
    },
  },

  {
    id: "semicircle",
    label: "Semi-Circle",
    fields: [
      { id: "radius", label: "Radius", placeholder: "e.g. 5" },
    ],
    calc(f) {
      if (!f.radius) return null;
      const r = f.radius;
      return {
        areaSqFt:      0.5 * PI * sq(r),
        perimeterFt:   PI * r + 2 * r,
        perimeterLabel: "Perimeter",
      };
    },
    validate: null,
    formulaLines: [
      "Area = ½ × π × r²",
      "Perimeter = π × r + 2r  (curved arc + diameter)",
    ],
    example: {
      rows: [
        ["Radius",    "5 ft"],
        ["Area",      "½ × π × 5² = 39.27 ft²"],
        ["Perimeter", "π×5 + 2×5 = 25.71 ft"],
      ],
      result: "39.27 ft²",
    },
  },

  {
    id: "lshape",
    label: "L-Shape",
    fields: [
      { id: "lengthA", label: "Length A", placeholder: "e.g. 10" },
      { id: "widthA",  label: "Width A",  placeholder: "e.g. 3"  },
      { id: "lengthB", label: "Length B", placeholder: "e.g. 5"  },
      { id: "widthB",  label: "Width B",  placeholder: "e.g. 4"  },
    ],
    calc(f) {
      if (!f.lengthA || !f.widthA || !f.lengthB || !f.widthB) return null;
      return {
        areaSqFt:      f.lengthA * f.widthA + f.lengthB * f.widthB,
        perimeterFt:   null,
        perimeterLabel: null,
      };
    },
    validate: null,
    formulaLines: [
      "Area = (Length A × Width A) + (Length B × Width B)",
      "Two rectangles joined at a corner",
    ],
    example: {
      rows: [
        ["Length A", "10 ft"],
        ["Width A",  "3 ft"],
        ["Length B", "5 ft"],
        ["Width B",  "4 ft"],
        ["Area",     "(10×3) + (5×4) = 30 + 20 = 50 ft²"],
      ],
      result: "50 ft²",
    },
  },

  {
    id: "ring",
    label: "Ring / Annulus",
    fields: [
      { id: "outerRadius", label: "Outer Radius (R)", placeholder: "e.g. 8" },
      { id: "innerRadius", label: "Inner Radius (r)", placeholder: "e.g. 4" },
    ],
    calc(f) {
      if (!f.outerRadius || !f.innerRadius) return null;
      if (f.innerRadius >= f.outerRadius)   return null;
      const R = f.outerRadius, r = f.innerRadius;
      return {
        areaSqFt:      PI * (sq(R) - sq(r)),
        perimeterFt:   2 * PI * (R + r),
        perimeterLabel: "Total Circumference (outer + inner)",
      };
    },
    validate(f) {
      if (f.outerRadius && f.innerRadius && f.innerRadius >= f.outerRadius) {
        return "Inner radius (r) must be less than outer radius (R).";
      }
      return null;
    },
    formulaLines: [
      "Area = π × (R² − r²)",
      "Total Circumference = 2π × (R + r)",
    ],
    example: {
      rows: [
        ["Outer radius (R)", "8 ft"],
        ["Inner radius (r)", "4 ft"],
        ["Area",             "π × (64 − 16) = 150.80 ft²"],
        ["Circumference",    "2π × (8+4) = 75.40 ft"],
      ],
      result: "150.80 ft²",
    },
  },

  {
    id: "custom",
    label: "Custom Polygon",
    fields: [],
    isCustom: true,
    calc(f) {
      if (!f.customArea) return null;
      return {
        areaSqFt:      f.customArea,
        perimeterFt:   null,
        perimeterLabel: null,
      };
    },
    validate: null,
    formulaLines: [
      "Area = User-entered value (converted to ft²)",
    ],
    example: null,
  },
];

export function getShapeById(id) {
  return SHAPES.find((s) => s.id === id) || null;
}
