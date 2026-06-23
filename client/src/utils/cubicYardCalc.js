// Cubic yard calculation utilities (pure, no React dependencies)
// Formula: Cubic Feet = L_ft × W_ft × D_ft  →  Cubic Yards = Cubic Feet ÷ 27

export const DIMENSION_UNITS = [
  { id: "ft",  label: "Feet (ft)" },
  { id: "in",  label: "Inches (in)" },
  { id: "yd",  label: "Yards (yd)" },
  { id: "cm",  label: "Centimeters (cm)" },
  { id: "m",   label: "Meters (m)" },
];

export const MATERIALS = [
  { id: "concrete", label: "Concrete",  lbsPerCuYd: 4000 },
  { id: "gravel",   label: "Gravel",    lbsPerCuYd: 2800 },
  { id: "sand",     label: "Sand",      lbsPerCuYd: 2700 },
  { id: "topsoil",  label: "Topsoil",   lbsPerCuYd: 2200 },
  { id: "mulch",    label: "Mulch",     lbsPerCuYd:  800 },
];

function toFeet(value, unit) {
  switch (unit) {
    case "ft": return value;
    case "in": return value / 12;
    case "yd": return value * 3;
    case "cm": return value / 30.48;
    case "m":  return value * 3.28084;
    default:   return value;
  }
}

// Returns null when any required value is invalid.
export function calcCubicYards({ length, lengthUnit, width, widthUnit, depth, depthUnit, quantity }) {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);
  const q = parseFloat(quantity);

  if (!isFinite(l) || l <= 0) return null;
  if (!isFinite(w) || w <= 0) return null;
  if (!isFinite(d) || d <= 0) return null;
  if (!isFinite(q) || q <= 0) return null;

  const lFt = toFeet(l, lengthUnit);
  const wFt = toFeet(w, widthUnit);
  const dFt = toFeet(d, depthUnit);

  const cubicFeet  = lFt * wFt * dFt;
  const cubicYards = cubicFeet / 27;
  const total      = cubicYards * q;

  return { cubicFeet, cubicYards, total };
}

// Format: 2 dp, strip trailing zeros.
export function formatCY(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(2)).toString();
}
