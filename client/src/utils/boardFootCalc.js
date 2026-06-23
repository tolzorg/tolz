// Board foot calculation utilities (pure, no React dependencies)
// Formula: Board Feet = (Thickness_in × Width_in × Length_ft) / 12

export const THICKNESS_UNITS = [
  { id: "in",  label: "Inches (in)" },
  { id: "mm",  label: "Millimeters (mm)" },
  { id: "cm",  label: "Centimeters (cm)" },
];

export const WIDTH_UNITS = [
  { id: "in",  label: "Inches (in)" },
  { id: "mm",  label: "Millimeters (mm)" },
  { id: "cm",  label: "Centimeters (cm)" },
];

export const LENGTH_UNITS = [
  { id: "ft",  label: "Feet (ft)" },
  { id: "in",  label: "Inches (in)" },
  { id: "m",   label: "Meters (m)" },
  { id: "cm",  label: "Centimeters (cm)" },
];

function toInches(value, unit) {
  switch (unit) {
    case "in":  return value;
    case "mm":  return value / 25.4;
    case "cm":  return value / 2.54;
    default:    return value;
  }
}

function toFeet(value, unit) {
  switch (unit) {
    case "ft":  return value;
    case "in":  return value / 12;
    case "m":   return value * 3.28084;
    case "cm":  return value / 30.48;
    default:    return value;
  }
}

// Returns null when any required value is invalid.
export function calcBoardFeet({ thickness, thicknessUnit, width, widthUnit, length, lengthUnit, quantity }) {
  const t = parseFloat(thickness);
  const w = parseFloat(width);
  const l = parseFloat(length);
  const q = parseFloat(quantity);

  if (!isFinite(t) || t <= 0) return null;
  if (!isFinite(w) || w <= 0) return null;
  if (!isFinite(l) || l <= 0) return null;
  if (!isFinite(q) || q <= 0) return null;

  const tIn  = toInches(t, thicknessUnit);
  const wIn  = toInches(w, widthUnit);
  const lFt  = toFeet(l, lengthUnit);

  const perPiece = (tIn * wIn * lFt) / 12;
  const total    = perPiece * q;

  return { perPiece, total };
}

// Format a number: 2 dp, strip trailing zeros.
export function formatBF(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  const s = n.toFixed(2);
  return parseFloat(s).toString();
}
