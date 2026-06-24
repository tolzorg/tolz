// Square Feet to Cubic Yards Calculator — pure calculation utilities

// ── Unit lists ────────────────────────────────────────────────

export const DIM_UNITS = [
  { id: "mm",    label: "Millimeters (mm)" },
  { id: "cm",    label: "Centimeters (cm)" },
  { id: "m",     label: "Meters (m)" },
  { id: "km",    label: "Kilometers (km)" },
  { id: "in",    label: "Inches (in)" },
  { id: "ft",    label: "Feet (ft)" },
  { id: "yd",    label: "Yards (yd)" },
  { id: "mi",    label: "Miles (mi)" },
  { id: "ft_in", label: "Feet / Inches" },
  { id: "m_cm",  label: "Meters / Centimeters" },
];

export const DIRECT_AREA_UNITS = [
  { id: "sqft",   label: "ft²  (square feet)" },
  { id: "sqin",   label: "in²  (square inches)" },
  { id: "sqyd",   label: "yd²  (square yards)" },
  { id: "sqmm",   label: "mm²  (square millimeters)" },
  { id: "sqcm",   label: "cm²  (square centimeters)" },
  { id: "sqdm",   label: "dm²  (square decimeters)" },
  { id: "sqm",    label: "m²   (square meters)" },
  { id: "sqkm",   label: "km²  (square kilometers)" },
  { id: "sqmi",   label: "mi²  (square miles)" },
  { id: "are",    label: "a    (ares)" },
  { id: "decare", label: "da   (decares)" },
  { id: "ha",     label: "ha   (hectares)" },
  { id: "ac",     label: "ac   (acres)" },
  { id: "sf",     label: "sf   (soccer fields)" },
];

export const AREA_DISPLAY_UNITS = [
  { id: "sqft", label: "sq ft" },
  { id: "sqin", label: "sq in" },
  { id: "sqyd", label: "sq yd" },
  { id: "sqm",  label: "sq m"  },
];

export const VOLUME_OUTPUT_UNITS = [
  { id: "yd3",   label: "Cubic Yards (yd³)",         symbol: "yd³"    },
  { id: "ft3",   label: "Cubic Feet (ft³)",           symbol: "ft³"    },
  { id: "m3",    label: "Cubic Meters (m³)",           symbol: "m³"     },
  { id: "cm3",   label: "Cubic Centimeters (cm³)",    symbol: "cm³"    },
  { id: "mm3",   label: "Cubic Millimeters (mm³)",    symbol: "mm³"    },
  { id: "in3",   label: "Cubic Inches (in³)",          symbol: "in³"    },
  { id: "mL",    label: "Milliliters (mL)",            symbol: "mL"     },
  { id: "L",     label: "Liters (L)",                  symbol: "L"      },
  { id: "usgal", label: "US Gallons",                  symbol: "US gal" },
  { id: "ukgal", label: "UK Gallons",                  symbol: "UK gal" },
];

// ── Materials ─────────────────────────────────────────────────

export const MATERIALS = [
  { id: "none",         label: "Select material…",  lbPerYd3: null },
  { id: "concrete",     label: "Concrete",           lbPerYd3: 4000  },
  { id: "gravel",       label: "Gravel",             lbPerYd3: 2800  },
  { id: "sand",         label: "Sand",               lbPerYd3: 2700  },
  { id: "topsoil",      label: "Topsoil",            lbPerYd3: 2200  },
  { id: "mulch",        label: "Mulch",              lbPerYd3: 800   },
  { id: "asphalt",      label: "Asphalt",            lbPerYd3: 4050  },
  { id: "crushed_stone",label: "Crushed Stone",      lbPerYd3: 2700  },
];

export const WEIGHT_OUTPUT_UNITS = [
  { id: "lb",        label: "Pounds (lb)",      symbol: "lb"         },
  { id: "kg",        label: "Kilograms (kg)",   symbol: "kg"         },
  { id: "t",         label: "Metric Tons (t)",  symbol: "metric tons"},
  { id: "short_ton", label: "Short Tons (US)",  symbol: "short tons" },
];

// ── Conversion functions ──────────────────────────────────────

// Convert dimension to feet; handles compound units (ft_in, m_cm).
export function dimToFt(val, unit, compA, compB) {
  if (unit === "ft_in") {
    const ft  = parseFloat(compA) || 0;
    const ins = parseFloat(compB) || 0;
    const total = ft + ins / 12;
    return total > 0 ? total : null;
  }
  if (unit === "m_cm") {
    const m  = parseFloat(compA) || 0;
    const cm = parseFloat(compB) || 0;
    const total = m + cm / 100;
    return total > 0 ? total * 3.28084 : null;
  }
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "mm": return n / 304.8;
    case "cm": return n / 30.48;
    case "m":  return n * 3.28084;
    case "km": return n * 3280.84;
    case "in": return n / 12;
    case "ft": return n;
    case "yd": return n * 3;
    case "mi": return n * 5280;
    default:   return n;
  }
}

// Convert direct area entry to sq ft.
export function toDirectAreaSqFt(val, unit) {
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "sqft":   return n;
    case "sqin":   return n / 144;
    case "sqyd":   return n * 9;
    case "sqmm":   return n / 92903.0;
    case "sqcm":   return n / 929.030;
    case "sqdm":   return n * 0.107639;      // 1 dm² = 0.01 m² = 0.107639 ft²
    case "sqm":    return n * 10.7639;
    case "sqkm":   return n * 10763910.4;
    case "sqmi":   return n * 27878400;
    case "are":    return n * 1076.39;        // 1 are = 100 m²
    case "decare": return n * 10763.9;
    case "ha":     return n * 107639.0;
    case "ac":     return n * 43560;
    case "sf":     return n * 76854.4;        // FIFA soccer field: 105m × 68m
    default:       return n;
  }
}

// Convert area from sq ft to display unit.
export function fromSqFt(sqFt, unit) {
  if (!isFinite(sqFt) || sqFt <= 0) return null;
  switch (unit) {
    case "sqft": return sqFt;
    case "sqin": return sqFt * 144;
    case "sqyd": return sqFt / 9;
    case "sqm":  return sqFt * 0.092903;
    default:     return sqFt;
  }
}

// Calculate area in sq ft from two dimension values in feet.
export function calcAreaSqFt(lFt, wFt) {
  if (!lFt || !wFt) return null;
  return lFt * wFt;
}

// Convert cubic feet to volume display unit.
// 1 ft³ = 1728 in³ = 28316.846592 mL = 28.316846592 L
//       = 7.48052 US gal = 6.22884 UK gal = 0.0283168 m³ / 27 yd³
export function fromCubicFt(cuFt, unit) {
  if (!isFinite(cuFt) || cuFt <= 0) return null;
  switch (unit) {
    case "mm3":   return cuFt * 28316846.592;
    case "cm3":   return cuFt * 28316.846592;
    case "m3":    return cuFt * 0.0283168;
    case "in3":   return cuFt * 1728;
    case "ft3":   return cuFt;
    case "yd3":   return cuFt / 27;
    case "mL":    return cuFt * 28316.8;
    case "L":     return cuFt * 28.3168;
    case "usgal": return cuFt * 7.48052;
    case "ukgal": return cuFt * 6.22884;
    default:      return cuFt;
  }
}

// Convert weight from lb to display unit.
export function fromWeightLb(lb, unit) {
  if (!isFinite(lb) || lb <= 0) return null;
  switch (unit) {
    case "lb":        return lb;
    case "kg":        return lb * 0.453592;
    case "t":         return lb * 0.000453592;
    case "short_ton": return lb / 2000;
    default:          return lb;
  }
}

// Smart number formatter — strips trailing zeros, uses scientific notation for extreme values.
export function fmtN(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs > 0 && abs < 0.0001)) {
    return n.toExponential(dp);
  }
  return parseFloat(n.toFixed(dp)).toString();
}
