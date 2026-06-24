// Gallons per Square Foot — pure calculation utilities
// All existing exports preserved; new exports added below the existing ones.

// ── Existing exports (unchanged) ─────────────────────────────

export const LENGTH_UNITS = [
  { id: "ft",  label: "Feet (ft)" },
  { id: "in",  label: "Inches (in)" },
  { id: "yd",  label: "Yards (yd)" },
  { id: "mm",  label: "Millimeters (mm)" },
  { id: "cm",  label: "Centimeters (cm)" },
  { id: "m",   label: "Meters (m)" },
];

export const THICKNESS_UNITS = [
  { id: "in",  label: "Inches (in)" },
  { id: "ft",  label: "Feet (ft)" },
  { id: "mm",  label: "Millimeters (mm)" },
  { id: "cm",  label: "Centimeters (cm)" },
  { id: "m",   label: "Meters (m)" },
];

export const VOLUME_UNITS = [
  { id: "usgal",  label: "US Gallons" },
  { id: "impgal", label: "Imperial Gallons" },
  { id: "L",      label: "Liters (L)" },
  { id: "ft3",    label: "Cubic Feet (ft³)" },
  { id: "yd3",    label: "Cubic Yards (yd³)" },
  { id: "m3",     label: "Cubic Meters (m³)" },
];

export const AREA_DISPLAY_UNITS = [
  { id: "sqft", label: "sq ft" },
  { id: "sqin", label: "sq in" },
  { id: "sqyd", label: "sq yd" },
  { id: "sqm",  label: "sq m" },
];

export const COVERAGE_RATE_UNITS = [
  { id: "sqft_usgal", label: "sq ft / US gal" },
  { id: "sqm_L",      label: "sq m / L" },
];

export const GAL_PER_SQFT_UNITS = [
  { id: "usgal_sqft",  label: "US gal / sq ft" },
  { id: "impgal_sqft", label: "Imp gal / sq ft" },
  { id: "L_sqm",       label: "L / sq m" },
];

export const WASTE_OPTIONS = [
  { id: 0,  label: "No waste (0%)" },
  { id: 5,  label: "5% extra" },
  { id: 10, label: "10% extra" },
  { id: 15, label: "15% extra" },
  { id: 20, label: "20% extra" },
];

export const MATERIAL_TYPES = [
  { id: "none",       label: "Select material…",    coverageSqFtPerGal: null },
  { id: "paint",      label: "Paint",                coverageSqFtPerGal: 350  },
  { id: "primer",     label: "Primer",               coverageSqFtPerGal: 300  },
  { id: "epoxy",      label: "Epoxy",                coverageSqFtPerGal: 250  },
  { id: "sealer",     label: "Concrete Sealer",      coverageSqFtPerGal: 200  },
  { id: "stain",      label: "Wood Stain",           coverageSqFtPerGal: 300  },
  { id: "roof",       label: "Roof Coating",         coverageSqFtPerGal: 100  },
  { id: "waterproof", label: "Waterproof Membrane",  coverageSqFtPerGal:  50  },
  { id: "pool",       label: "Pool Coating",         coverageSqFtPerGal: 200  },
];

export function toLengthFt(v, unit) {
  const n = parseFloat(v);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "ft": return n;
    case "in": return n / 12;
    case "yd": return n * 3;
    case "mm": return n / 304.8;
    case "cm": return n / 30.48;
    case "m":  return n * 3.28084;
    default:   return n;
  }
}

export function toThicknessFt(v, unit) {
  const n = parseFloat(v);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "ft": return n;
    case "in": return n / 12;
    case "mm": return n / 304.8;
    case "cm": return n / 30.48;
    case "m":  return n * 3.28084;
    default:   return n;
  }
}

export function toVolumeUSGal(v, unit) {
  const n = parseFloat(v);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "usgal":  return n;
    case "impgal": return n * 1.20095;
    case "L":      return n * 0.264172;
    case "ft3":    return n * 7.48052;
    case "yd3":    return n * 201.974;
    case "m3":     return n * 264.172;
    default:       return n;
  }
}

export function toCoverageRateSqFtPerGal(v, unit) {
  const n = parseFloat(v);
  if (!isFinite(n) || n <= 0) return null;
  switch (unit) {
    case "sqft_usgal": return n;
    case "sqm_L":      return n * 40.7458;
    default:           return n;
  }
}

export function convertArea(sqFt, unit) {
  if (!isFinite(sqFt) || sqFt <= 0) return null;
  switch (unit) {
    case "sqft": return sqFt;
    case "sqin": return sqFt * 144;
    case "sqyd": return sqFt / 9;
    case "sqm":  return sqFt * 0.0929030;
    default:     return sqFt;
  }
}

export function convertGalPerSqFt(galPerSqFt, unit) {
  if (!isFinite(galPerSqFt) || galPerSqFt <= 0) return null;
  switch (unit) {
    case "usgal_sqft":  return galPerSqFt;
    case "impgal_sqft": return galPerSqFt / 1.20095;
    case "L_sqm":       return galPerSqFt * 40.7458;
    default:            return galPerSqFt;
  }
}

export function calcAreaSqFt(lengthFt, widthFt) {
  if (!lengthFt || !widthFt) return null;
  return lengthFt * widthFt;
}

export function calcGalPerSqFt(volUSGal, areaSqFt) {
  if (!volUSGal || !areaSqFt) return null;
  return volUSGal / areaSqFt;
}

export function calcGallonsNeeded(areaSqFt, coverageRateSqFtPerGal, numCoats, wastePct) {
  if (!areaSqFt || !coverageRateSqFtPerGal || numCoats < 1) return null;
  const base = (areaSqFt / coverageRateSqFtPerGal) * numCoats;
  return base * (1 + (wastePct || 0) / 100);
}

export function calcCoverageArea(volUSGal, coverageRateSqFtPerGal) {
  if (!volUSGal || !coverageRateSqFtPerGal) return null;
  return volUSGal * coverageRateSqFtPerGal;
}

export function calcWasteGallons(gallonsNeededBase, wastePct) {
  if (!gallonsNeededBase || !wastePct) return null;
  return gallonsNeededBase * (wastePct / 100);
}

export function fmtG(n, dp = 4) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(dp)).toString();
}

export function fmt2(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(2)).toString();
}

// ── New exports ───────────────────────────────────────────────

// Extended dimension units (length, width, height/thickness)
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

// Area units for direct area entry
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

// Volume output display units (for auto-computed volume)
export const VOLUME_OUTPUT_UNITS = [
  { id: "cuft",   label: "Cubic Feet (ft³)",   symbol: "ft³"  },
  { id: "cuyd",   label: "Cubic Yards (yd³)",   symbol: "yd³"  },
  { id: "cum",    label: "Cubic Meters (m³)",    symbol: "m³"   },
  { id: "cuin",   label: "Cubic Inches (in³)",   symbol: "in³"  },
  { id: "mL",     label: "Milliliters (mL)",      symbol: "mL"   },
  { id: "L",      label: "Liters (L)",            symbol: "L"    },
  { id: "usgal",  label: "US Gallons",            symbol: "US gal" },
  { id: "ukgal",  label: "UK Gallons",            symbol: "UK gal" },
];

// Extended gal/sq ft output units
export const GPSF_OUTPUT_UNITS = [
  { id: "usgal_sqft",  label: "US gal/ft²",    symbol: "US gal/ft²"  },
  { id: "ukgal_sqft",  label: "UK gal/ft²",    symbol: "UK gal/ft²"  },
  { id: "L_sqft",      label: "L/ft²",          symbol: "L/ft²"       },
  { id: "mL_sqft",     label: "mL/ft²",         symbol: "mL/ft²"      },
  { id: "cl_sqft",     label: "cl/ft²",          symbol: "cl/ft²"      },
  { id: "cuft_sqft",   label: "cu ft/ft²",      symbol: "ft³/ft²"     },
  { id: "cuin_sqft",   label: "cu in/ft²",      symbol: "in³/ft²"     },
  { id: "cuyd_sqft",   label: "cu yd/ft²",      symbol: "yd³/ft²"     },
  { id: "cum_sqft",    label: "m³/ft²",          symbol: "m³/ft²"      },
  { id: "usfloz_sqft", label: "US fl oz/ft²",   symbol: "US fl oz/ft²"},
  { id: "ukfloz_sqft", label: "UK fl oz/ft²",   symbol: "UK fl oz/ft²"},
];

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
    case "ft": return n;
    case "in": return n / 12;
    case "yd": return n * 3;
    case "mm": return n / 304.8;
    case "cm": return n / 30.48;
    case "m":  return n * 3.28084;
    case "km": return n * 3280.84;
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
    case "decare": return n * 10763.9;        // 1 decare = 1000 m²
    case "ha":     return n * 107639.0;       // 1 ha = 10000 m²
    case "ac":     return n * 43560;          // 1 acre = 43560 ft²
    case "sf":     return n * 76854.4;        // soccer field ≈ 105 m × 68 m
    default:       return n;
  }
}

// Convert cubic feet to volume display unit.
export function fromCubicFt(cuFt, unit) {
  if (!isFinite(cuFt) || cuFt <= 0) return null;
  switch (unit) {
    case "cuft":  return cuFt;
    case "cuin":  return cuFt * 1728;
    case "cuyd":  return cuFt / 27;
    case "cum":   return cuFt * 0.0283168;
    case "mL":    return cuFt * 28316.8;
    case "L":     return cuFt * 28.3168;
    case "usgal": return cuFt * 7.48052;
    case "ukgal": return cuFt * 6.22884;
    default:      return cuFt;
  }
}

// Convert US gal/sq ft to display unit.
// 1 US gal = 3.78541 L = 3785.41 mL = 378.541 cL = 231 in³
//           = 0.133681 ft³ = 0.832674 UK gal = 128 US fl oz = 133.228 UK fl oz
export function fromUSGalPerSqFt(gpsf, unit) {
  if (!isFinite(gpsf) || gpsf <= 0) return null;
  switch (unit) {
    case "usgal_sqft":  return gpsf;
    case "ukgal_sqft":  return gpsf * 0.832674;
    case "L_sqft":      return gpsf * 3.78541;
    case "mL_sqft":     return gpsf * 3785.41;
    case "cl_sqft":     return gpsf * 378.541;
    case "cuft_sqft":   return gpsf * 0.133681;
    case "cuin_sqft":   return gpsf * 231;
    case "cuyd_sqft":   return gpsf / 201.974;
    case "cum_sqft":    return gpsf * 0.00378541;
    case "usfloz_sqft": return gpsf * 128;
    case "ukfloz_sqft": return gpsf * 133.228;
    default:            return gpsf;
  }
}
