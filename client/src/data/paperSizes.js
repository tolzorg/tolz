// Paper size dataset — Phase 1 seeds the most common sizes; the layout
// engine (useSheetLayout) works off plain mm dimensions, so adding more
// entries later (full ISO A0-A6, US Legal/Executive/Tabloid, 3R/8R/10R…)
// is a data-only change, not a re-architecture.

import { toMm } from "../utils/mmPxConversion";

export const PAPER_SIZES = [
  { id: "a4",     label: "A4 (210 × 297 mm)",        widthMM: 210,   heightMM: 297   },
  { id: "letter", label: "US Letter (215.9 × 279.4 mm)", widthMM: 215.9, heightMM: 279.4 },
  { id: "4r",     label: "4R Photo Paper (102 × 152 mm)", widthMM: 101.6, heightMM: 152.4 },
  { id: "5r",     label: "5R Photo Paper (127 × 178 mm)", widthMM: 127,   heightMM: 177.8 },
  { id: "6r",     label: "6R Photo Paper (152 × 203 mm)", widthMM: 152.4, heightMM: 203.2 },
  { id: "custom", label: "Custom size", widthMM: null, heightMM: null },
];

export function getPaperSizeById(id) {
  return PAPER_SIZES.find((p) => p.id === id) ?? null;
}

export function resolvePaperDimensions(paperId, customWidth, customHeight, customUnit) {
  const paper = getPaperSizeById(paperId);
  if (paper && paper.id !== "custom") return { widthMM: paper.widthMM, heightMM: paper.heightMM };
  const w = toMm(customWidth, customUnit);
  const h = toMm(customHeight, customUnit);
  return { widthMM: w, heightMM: h };
}
