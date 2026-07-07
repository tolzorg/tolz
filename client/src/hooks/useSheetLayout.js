import { useMemo } from "react";
import { printableAreaMM, DEFAULT_SAFE_MARGIN_MM, DEFAULT_PHOTO_GAP_MM } from "../utils/mmPxConversion";

function fitGrid(printableW, printableH, cellW, cellH, gap) {
  const cols = Math.max(0, Math.floor((printableW + gap) / (cellW + gap)));
  const rows = Math.max(0, Math.floor((printableH + gap) / (cellH + gap)));
  return { cols, rows, total: cols * rows };
}

// Pure calculation — given a template + paper + margins, works out the
// optimal print grid: printable area, auto-rotation (0° vs 90°, whichever
// fits more copies), duplicate count (auto-max or capped manual), and the
// centered, equally-spaced cell positions (mm, relative to paper origin).
export function calcSheetLayout({
  templateWidthMM, templateHeightMM,
  paperWidthMM, paperHeightMM,
  marginMM = DEFAULT_SAFE_MARGIN_MM,
  gapMM = DEFAULT_PHOTO_GAP_MM,
  duplicateMode = "auto", // "auto" | "manual"
  manualCount = 1,
}) {
  if (!templateWidthMM || !templateHeightMM || !paperWidthMM || !paperHeightMM) return null;

  const printable = printableAreaMM(paperWidthMM, paperHeightMM, marginMM);
  if (printable.width <= 0 || printable.height <= 0) return null;

  // Auto-rotation optimization: evaluate both orientations, pick whichever
  // fits more copies inside the printable area.
  const normal = fitGrid(printable.width, printable.height, templateWidthMM, templateHeightMM, gapMM);
  const rotated = fitGrid(printable.width, printable.height, templateHeightMM, templateWidthMM, gapMM);
  const useRotated = rotated.total > normal.total;
  const chosen = useRotated ? rotated : normal;
  const cellWidthMM = useRotated ? templateHeightMM : templateWidthMM;
  const cellHeightMM = useRotated ? templateWidthMM : templateHeightMM;

  const maxTotal = chosen.total;
  const count = duplicateMode === "manual"
    ? Math.max(0, Math.min(Math.round(manualCount) || 0, maxTotal))
    : maxTotal;

  // For a manual count smaller than the max grid, re-derive a tighter
  // rows/cols so the layout doesn't reserve a near-empty final row.
  let { cols, rows } = chosen;
  if (duplicateMode === "manual" && count > 0 && count < maxTotal) {
    const idealCols = Math.max(1, Math.ceil(Math.sqrt(count * (cellWidthMM / cellHeightMM))));
    cols = Math.min(chosen.cols, idealCols);
    rows = Math.min(chosen.rows, Math.ceil(count / cols));
  }

  const usedWidth = cols > 0 ? cols * cellWidthMM + (cols - 1) * gapMM : 0;
  const usedHeight = rows > 0 ? rows * cellHeightMM + (rows - 1) * gapMM : 0;
  const offsetX = marginMM + Math.max(0, (printable.width - usedWidth) / 2);
  const offsetY = marginMM + Math.max(0, (printable.height - usedHeight) / 2);

  const cells = [];
  for (let r = 0; r < rows && cells.length < count; r++) {
    for (let c = 0; c < cols && cells.length < count; c++) {
      cells.push({
        x: offsetX + c * (cellWidthMM + gapMM),
        y: offsetY + r * (cellHeightMM + gapMM),
      });
    }
  }

  return {
    paperWidthMM, paperHeightMM, printable,
    orientationDeg: useRotated ? 90 : 0,
    cellWidthMM, cellHeightMM,
    cols, rows, maxTotal, count: cells.length,
    gapMM, marginMM,
    cells,
  };
}

export function useSheetLayout(params) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => calcSheetLayout(params), [
    params.templateWidthMM, params.templateHeightMM,
    params.paperWidthMM, params.paperHeightMM,
    params.marginMM, params.gapMM,
    params.duplicateMode, params.manualCount,
  ]);
}
