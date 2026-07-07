// Pure unit-conversion + print-geometry math for the ID Photo Generator.
// No React, no DOM — kept independent so the grid/zone math is easy to reason
// about and test in isolation from the canvas/editor UI.

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10;
export const DEFAULT_DPI = 300;
export const DEFAULT_SAFE_MARGIN_MM = 5; // non-printable paper margin, all sides
export const DEFAULT_PHOTO_GAP_MM = 2;   // spacing between photos on the sheet

export function mmToPx(mm, dpi = DEFAULT_DPI) {
  return (mm / MM_PER_INCH) * dpi;
}

export function pxToMm(px, dpi = DEFAULT_DPI) {
  return (px / dpi) * MM_PER_INCH;
}

export function inToMm(inches) {
  return inches * MM_PER_INCH;
}

export function cmToMm(cm) {
  return cm * MM_PER_CM;
}

export function mmToIn(mm) {
  return mm / MM_PER_INCH;
}

export function mmToCm(mm) {
  return mm / MM_PER_CM;
}

// Convert a raw numeric value in a given unit ("mm" | "cm" | "in") to mm.
export function toMm(value, unit) {
  const v = Number(value);
  if (!isFinite(v) || v <= 0) return null;
  if (unit === "cm") return cmToMm(v);
  if (unit === "in") return inToMm(v);
  return v; // already mm
}

// The printable area is the paper size minus the non-printable margin on
// every side. Printers cannot reliably print edge-to-edge, so layout must
// NEVER use the raw paper dimensions directly.
export function printableAreaMM(paperWidthMM, paperHeightMM, marginMM = DEFAULT_SAFE_MARGIN_MM) {
  return {
    width: Math.max(0, paperWidthMM - marginMM * 2),
    height: Math.max(0, paperHeightMM - marginMM * 2),
    marginMM,
  };
}

// Safe / cut / bleed zone geometry for a single photo cell, in mm, relative
// to the cell's own top-left corner (0,0) at (cellWidthMM, cellHeightMM).
//   - cut: the exact photo boundary (0,0 -> cellWidthMM,cellHeightMM)
//   - safe: inset by safeMM — no important content should sit outside this
//   - bleed: expanded outward by bleedMM (optional, 0 by default)
export function zoneGeometryMM(cellWidthMM, cellHeightMM, { safeMM = 3, bleedMM = 0 } = {}) {
  return {
    cut: { x: 0, y: 0, width: cellWidthMM, height: cellHeightMM },
    safe: {
      x: safeMM, y: safeMM,
      width: Math.max(0, cellWidthMM - safeMM * 2),
      height: Math.max(0, cellHeightMM - safeMM * 2),
    },
    bleed: {
      x: -bleedMM, y: -bleedMM,
      width: cellWidthMM + bleedMM * 2,
      height: cellHeightMM + bleedMM * 2,
    },
  };
}

export function fmtMm(mm, dp = 1) {
  if (!isFinite(mm)) return "—";
  return `${mm.toFixed(dp)} mm`;
}
