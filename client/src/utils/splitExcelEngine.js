// Pure, unit-tested helpers for the Split Excel tool — chunk-range math,
// input validation, and output-filename generation. The actual file
// reading/writing (ExcelJS) lives in useSplitExcel.js since it needs a
// real workbook object; this file is everything about that logic that
// doesn't.

export const MIN_ROWS_PER_FILE = 1;
export const MAX_ROWS_PER_FILE = 100_000;
export const DEFAULT_ROWS_PER_FILE = 100;

// Guards against a pathological upload (a "spreadsheet" with millions of
// rows) locking up the browser tab while ExcelJS parses/re-serializes it.
export const MAX_DATA_ROWS = 200_000;

export function clampRowsPerFile(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_ROWS_PER_FILE;
  return Math.min(MAX_ROWS_PER_FILE, Math.max(MIN_ROWS_PER_FILE, n));
}

/**
 * Splits `totalDataRows` (the data rows, i.e. not counting the header) into
 * consecutive chunks of at most `rowsPerFile` rows each.
 *
 * @returns {Array<{start:number, end:number}>} 0-indexed, end-exclusive
 *   ranges into the data-rows array — e.g. totalDataRows=250, rowsPerFile=100
 *   -> [{start:0,end:100},{start:100,end:200},{start:200,end:250}].
 *   Returns [] for totalDataRows <= 0.
 */
export function computeChunkRanges(totalDataRows, rowsPerFile) {
  const total = Math.max(0, Math.trunc(Number(totalDataRows) || 0));
  const size = clampRowsPerFile(rowsPerFile);
  if (total === 0) return [];

  const ranges = [];
  for (let start = 0; start < total; start += size) {
    ranges.push({ start, end: Math.min(start + size, total) });
  }
  return ranges;
}

/** Strips a trailing .xlsx/.xls (case-insensitive) and unsafe filesystem characters. */
export function sanitizeBaseFilename(name) {
  const base = String(name || "spreadsheet").replace(/\.(xlsx|xls)$/i, "");
  const cleaned = base.replace(/[\\/:*?"<>|]+/g, "_").trim();
  return cleaned || "spreadsheet";
}

/**
 * Builds the output filename for chunk `index` (0-based) out of `total`
 * chunks, e.g. ("report", 0, 12) -> "report_part01.xlsx".
 */
export function buildChunkFilename(baseName, index, total) {
  const base = sanitizeBaseFilename(baseName);
  const width = String(Math.max(1, total)).length;
  const partNumber = String(index + 1).padStart(Math.max(2, width), "0");
  return `${base}_part${partNumber}.xlsx`;
}

export function isFileTooLarge(dataRowCount) {
  return dataRowCount > MAX_DATA_ROWS;
}
