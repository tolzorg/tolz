// Size-to-Weight Calculator — pure calculation utilities (rectangular box)

// ── Material database ─────────────────────────────────────────

export const MATERIAL_CATEGORIES = [
  {
    group: "Metals",
    items: [
      { id: "steel",          label: "Steel",           densityKgM3: 7850  },
      { id: "stainless",      label: "Stainless Steel", densityKgM3: 8000  },
      { id: "aluminum",       label: "Aluminum",        densityKgM3: 2700  },
      { id: "copper",         label: "Copper",          densityKgM3: 8960  },
      { id: "brass",          label: "Brass",           densityKgM3: 8500  },
      { id: "bronze",         label: "Bronze",          densityKgM3: 8730  },
      { id: "cast_iron",      label: "Cast Iron",       densityKgM3: 7200  },
      { id: "lead",           label: "Lead",            densityKgM3: 11340 },
      { id: "titanium",       label: "Titanium",        densityKgM3: 4500  },
      { id: "zinc",           label: "Zinc",            densityKgM3: 7130  },
    ],
  },
  {
    group: "Wood",
    items: [
      { id: "oak",   label: "Oak",   densityKgM3: 750 },
      { id: "pine",  label: "Pine",  densityKgM3: 500 },
      { id: "cedar", label: "Cedar", densityKgM3: 380 },
      { id: "maple", label: "Maple", densityKgM3: 705 },
    ],
  },
  {
    group: "Construction",
    items: [
      { id: "concrete",  label: "Concrete",  densityKgM3: 2400 },
      { id: "asphalt",   label: "Asphalt",   densityKgM3: 2243 },
      { id: "granite",   label: "Granite",   densityKgM3: 2750 },
      { id: "limestone", label: "Limestone", densityKgM3: 2711 },
      { id: "sandstone", label: "Sandstone", densityKgM3: 2323 },
      { id: "marble",    label: "Marble",    densityKgM3: 2711 },
    ],
  },
  {
    group: "Plastics",
    items: [
      { id: "pvc",          label: "PVC",          densityKgM3: 1380 },
      { id: "polyethylene", label: "Polyethylene", densityKgM3: 960  },
      { id: "acrylic",      label: "Acrylic",      densityKgM3: 1185 },
    ],
  },
];

// Flat lookup: get material by id
export function getMaterialById(id) {
  for (const cat of MATERIAL_CATEGORIES) {
    const mat = cat.items.find((m) => m.id === id);
    if (mat) return mat;
  }
  return null;
}

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

export const DENSITY_UNITS = [
  { id: "kg_m3",  label: "kg/m³",   symbol: "kg/m³"   },
  { id: "g_cm3",  label: "g/cm³",   symbol: "g/cm³"   },
  { id: "lb_ft3", label: "lb/ft³",  symbol: "lb/ft³"  },
  { id: "lb_in3", label: "lb/in³",  symbol: "lb/in³"  },
];

export const VOLUME_OUTPUT_UNITS = [
  { id: "mm3", label: "Cubic Millimeters (mm³)", symbol: "mm³" },
  { id: "cm3", label: "Cubic Centimeters (cm³)", symbol: "cm³" },
  { id: "m3",  label: "Cubic Meters (m³)",        symbol: "m³"  },
  { id: "in3", label: "Cubic Inches (in³)",        symbol: "in³" },
  { id: "ft3", label: "Cubic Feet (ft³)",          symbol: "ft³" },
  { id: "yd3", label: "Cubic Yards (yd³)",         symbol: "yd³" },
  { id: "L",   label: "Liters (L)",                symbol: "L"   },
];

export const WEIGHT_OUTPUT_UNITS = [
  { id: "mg",        label: "Milligrams (mg)",   symbol: "mg"         },
  { id: "g",         label: "Grams (g)",          symbol: "g"          },
  { id: "kg",        label: "Kilograms (kg)",     symbol: "kg"         },
  { id: "t",         label: "Metric Tons (t)",    symbol: "t"          },
  { id: "oz",        label: "Ounces (oz)",        symbol: "oz"         },
  { id: "lb",        label: "Pounds (lb)",         symbol: "lb"         },
  { id: "short_ton", label: "Short Tons (US)",    symbol: "short tons" },
  { id: "long_ton",  label: "Long Tons (UK)",     symbol: "long tons"  },
];

// ── Conversion functions ──────────────────────────────────────

// Convert dimension to meters; handles compound units (ft_in, m_cm).
export function dimToMeters(val, unit, compA, compB) {
  if (unit === "ft_in") {
    const ft  = parseFloat(compA) || 0;
    const ins = parseFloat(compB) || 0;
    const total = ft * 0.3048 + ins * 0.0254;
    return total > 0 ? total : null;
  }
  if (unit === "m_cm") {
    const m  = parseFloat(compA) || 0;
    const cm = parseFloat(compB) || 0;
    const total = m + cm / 100;
    return total > 0 ? total : null;
  }
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "mm": return n / 1000;
    case "cm": return n / 100;
    case "m":  return n;
    case "km": return n * 1000;
    case "in": return n * 0.0254;
    case "ft": return n * 0.3048;
    case "yd": return n * 0.9144;
    case "mi": return n * 1609.344;
    default:   return n;
  }
}

// Convert density to kg/m³.
// 1 g/cm³  = 1000 kg/m³
// 1 lb/ft³ = 16.0185 kg/m³
// 1 lb/in³ = 27679.9 kg/m³
export function toDensityKgM3(val, unit) {
  const n = parseFloat(val);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "kg_m3":  return n;
    case "g_cm3":  return n * 1000;
    case "lb_ft3": return n * 16.0185;
    case "lb_in3": return n * 27679.9;
    default:       return n;
  }
}

// Convert density from kg/m³ to display unit.
export function fromDensityKgM3(kgM3, unit) {
  if (!isFinite(kgM3) || kgM3 <= 0) return null;
  switch (unit) {
    case "kg_m3":  return kgM3;
    case "g_cm3":  return kgM3 / 1000;
    case "lb_ft3": return kgM3 / 16.0185;
    case "lb_in3": return kgM3 / 27679.9;
    default:       return kgM3;
  }
}

// Volume in m³ from three dimension values in meters.
export function calcVolumeM3(lM, wM, hM) {
  if (!lM || !wM || !hM) return null;
  return lM * wM * hM;
}

// Convert volume from m³ to display unit.
// 1 m³ = 1e6 cm³ = 1e9 mm³ = 61023.7441 in³ = 35.3147 ft³ = 1.30795 yd³ = 1000 L
export function fromVolumeM3(volM3, unit) {
  if (!isFinite(volM3) || volM3 <= 0) return null;
  switch (unit) {
    case "mm3": return volM3 * 1e9;
    case "cm3": return volM3 * 1e6;
    case "m3":  return volM3;
    case "in3": return volM3 * 61023.7441;
    case "ft3": return volM3 * 35.3147;
    case "yd3": return volM3 * 1.30795;
    case "L":   return volM3 * 1000;
    default:    return volM3;
  }
}

// Weight in kg from volume (m³) and density (kg/m³).
export function calcWeightKg(volM3, densityKgM3) {
  if (!volM3 || !densityKgM3) return null;
  return volM3 * densityKgM3;
}

// Convert weight from kg to display unit.
// 1 kg = 1000 g = 1e6 mg | 2.20462 lb | 35.274 oz | /907.185 short ton | /1016.05 long ton
export function fromWeightKg(kg, unit) {
  if (!isFinite(kg) || kg <= 0) return null;
  switch (unit) {
    case "mg":        return kg * 1e6;
    case "g":         return kg * 1000;
    case "kg":        return kg;
    case "t":         return kg / 1000;
    case "oz":        return kg * 35.274;
    case "lb":        return kg * 2.20462;
    case "short_ton": return kg / 907.185;
    case "long_ton":  return kg / 1016.05;
    default:          return kg;
  }
}

// Smart number formatter — strips trailing zeros, uses scientific for extreme values.
export function fmtN(n, dp = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs > 0 && abs < 0.0001)) {
    return n.toExponential(dp);
  }
  return parseFloat(n.toFixed(dp)).toString();
}

// 4dp variant for density display.
export function fmt4(n) {
  return fmtN(n, 4);
}
