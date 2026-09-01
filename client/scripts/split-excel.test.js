#!/usr/bin/env node
// Reference/regression test suite for the Split Excel engine's pure
// helpers (chunk-range math, validation, filename generation). Plain
// Node + assert, matching this project's established convention. Actual
// .xlsx reading/writing (ExcelJS) needs the real library and is exercised
// via the Playwright smoke test instead, not here.
//
// Run with: node scripts/split-excel.test.js

import {
  clampRowsPerFile, computeChunkRanges, sanitizeBaseFilename, buildChunkFilename, isFileTooLarge,
  MIN_ROWS_PER_FILE, MAX_ROWS_PER_FILE, DEFAULT_ROWS_PER_FILE, MAX_DATA_ROWS,
} from "../src/utils/splitExcelEngine.js";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(detail ? `${name}: ${detail}` : name); }
}

// ─────────────────────────────────────────────────────────────────
// clampRowsPerFile
// ─────────────────────────────────────────────────────────────────
ok("clampRowsPerFile: mid-range value passes through", clampRowsPerFile(250) === 250);
ok("clampRowsPerFile: below minimum clamps up", clampRowsPerFile(0) === MIN_ROWS_PER_FILE);
ok("clampRowsPerFile: negative clamps up", clampRowsPerFile(-50) === MIN_ROWS_PER_FILE);
ok("clampRowsPerFile: above maximum clamps down", clampRowsPerFile(999_999) === MAX_ROWS_PER_FILE);
ok("clampRowsPerFile: NaN/garbage falls back to the default", clampRowsPerFile("banana") === DEFAULT_ROWS_PER_FILE);
ok("clampRowsPerFile: undefined falls back to the default", clampRowsPerFile(undefined) === DEFAULT_ROWS_PER_FILE);
ok("clampRowsPerFile: truncates fractional input", clampRowsPerFile(100.9) === 100);

// ─────────────────────────────────────────────────────────────────
// computeChunkRanges
// ─────────────────────────────────────────────────────────────────
ok("computeChunkRanges: zero rows produces no chunks", computeChunkRanges(0, 100).length === 0);
ok("computeChunkRanges: negative rows produces no chunks", computeChunkRanges(-10, 100).length === 0);

{
  const ranges = computeChunkRanges(250, 100);
  ok("computeChunkRanges: 250 rows / 100 per file -> 3 chunks", ranges.length === 3);
  ok("computeChunkRanges: first chunk is [0,100)", ranges[0].start === 0 && ranges[0].end === 100);
  ok("computeChunkRanges: second chunk is [100,200)", ranges[1].start === 100 && ranges[1].end === 200);
  ok("computeChunkRanges: last (partial) chunk is [200,250)", ranges[2].start === 200 && ranges[2].end === 250);
}

{
  const exact = computeChunkRanges(300, 100);
  ok("computeChunkRanges: evenly-divisible row count produces no trailing empty chunk", exact.length === 3 && exact[2].end === 300);
}

{
  const single = computeChunkRanges(50, 100);
  ok("computeChunkRanges: fewer rows than rowsPerFile -> a single chunk", single.length === 1 && single[0].start === 0 && single[0].end === 50);
}

{
  const oneEach = computeChunkRanges(5, 1);
  ok("computeChunkRanges: rowsPerFile=1 -> one chunk per row", oneEach.length === 5);
}

{
  // Chunks must be contiguous and cover every row exactly once.
  const ranges = computeChunkRanges(1000, 137);
  let covered = 0;
  let contiguous = true;
  for (let i = 0; i < ranges.length; i++) {
    covered += ranges[i].end - ranges[i].start;
    if (i > 0 && ranges[i].start !== ranges[i - 1].end) contiguous = false;
  }
  ok("computeChunkRanges: chunks are contiguous with no gaps or overlaps", contiguous);
  ok("computeChunkRanges: chunks cover every row exactly once", covered === 1000);
}

// ─────────────────────────────────────────────────────────────────
// sanitizeBaseFilename
// ─────────────────────────────────────────────────────────────────
ok("sanitizeBaseFilename: strips .xlsx extension", sanitizeBaseFilename("report.xlsx") === "report");
ok("sanitizeBaseFilename: strips .xls extension case-insensitively", sanitizeBaseFilename("Report.XLS") === "Report");
ok("sanitizeBaseFilename: replaces unsafe filesystem characters", sanitizeBaseFilename('a/b\\c:d*e?f"g<h>i|j') === "a_b_c_d_e_f_g_h_i_j");
ok("sanitizeBaseFilename: empty/missing name falls back to a default", sanitizeBaseFilename("") === "spreadsheet" && sanitizeBaseFilename(null) === "spreadsheet");
ok("sanitizeBaseFilename: plain names pass through unchanged", sanitizeBaseFilename("Q1 Sales") === "Q1 Sales");

// ─────────────────────────────────────────────────────────────────
// buildChunkFilename
// ─────────────────────────────────────────────────────────────────
ok("buildChunkFilename: first of many parts", buildChunkFilename("report.xlsx", 0, 12) === "report_part01.xlsx");
ok("buildChunkFilename: last of many parts", buildChunkFilename("report.xlsx", 11, 12) === "report_part12.xlsx");
ok("buildChunkFilename: pads to the width of the total count", buildChunkFilename("report.xlsx", 0, 250) === "report_part001.xlsx");
ok("buildChunkFilename: single-digit totals still pad to 2 digits", buildChunkFilename("report.xlsx", 0, 3) === "report_part01.xlsx");
{
  const names = new Set();
  for (let i = 0; i < 15; i++) names.add(buildChunkFilename("data.xlsx", i, 15));
  ok("buildChunkFilename: every part in a run gets a unique filename", names.size === 15);
}

// ─────────────────────────────────────────────────────────────────
// isFileTooLarge
// ─────────────────────────────────────────────────────────────────
ok("isFileTooLarge: under the cap is fine", !isFileTooLarge(1000));
ok("isFileTooLarge: exactly at the cap is fine", !isFileTooLarge(MAX_DATA_ROWS));
ok("isFileTooLarge: over the cap is rejected", isFileTooLarge(MAX_DATA_ROWS + 1));

// ─────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────
console.log(`\nSplit Excel engine suite: ${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
