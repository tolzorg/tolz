import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import {
  clampRowsPerFile, computeChunkRanges, buildChunkFilename, sanitizeBaseFilename, isFileTooLarge,
  DEFAULT_ROWS_PER_FILE,
} from "../../../utils/splitExcelEngine";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

// Removes fully-blank rows from the end of a sheet_to_json(header:1) array
// — spreadsheets very commonly have a "used range" that extends a bit
// past the real data (leftover formatting, an accidental keystroke), which
// would otherwise get counted and split as if it were real data.
function trimTrailingBlankRows(rows) {
  let end = rows.length;
  while (end > 0 && rows[end - 1].every((cell) => cell === null || cell === undefined || cell === "")) end--;
  return rows.slice(0, end);
}

// Drives the Split Excel tool end to end: reads the first worksheet of an
// uploaded spreadsheet, splits its data rows into chunks of N rows (each
// chunk keeping the header row), and produces either a single .xlsx (one
// chunk) or a .zip of multiple .xlsx files — entirely in the browser, no
// upload.
//
// Reading and writing deliberately use two different libraries. SheetJS
// (`xlsx`) reads both legacy .xls (BIFF/OLE2) and modern .xlsx, and is
// dramatically more tolerant of real-world files' quirks than the
// alternative — ExcelJS's own reader is OOXML-only and rejected a genuine
// .xls file outright (the bug this file was rewritten to fix). Writing
// still uses ExcelJS, which produces clean, valid .xlsx output and was
// already working correctly.
export function useSplitExcel() {
  const [status, setStatus] = useState("empty"); // empty | loading | configuring | processing | done
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [totalDataRows, setTotalDataRows] = useState(0);
  const [rowsPerFile, setRowsPerFileState] = useState(DEFAULT_ROWS_PER_FILE);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultFilename, setResultFilename] = useState("");
  const [outputCount, setOutputCount] = useState(0);

  // The parsed rows are only needed imperatively (at load time and when
  // running the split) — never rendered from directly, so this is a ref
  // rather than state to avoid re-rendering on it.
  const parsedRef = useRef(null); // { sheetName, headerValues, dataRows, columnWidths }

  const loadFile = useCallback(async (file) => {
    if (!file) return;
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xls")) {
      setErrorMessage("Please upload an XLS or XLSX file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage("That file is larger than 25 MB. Try a smaller file.");
      return;
    }

    setErrorMessage("");
    setStatus("loading");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = sheetName ? workbook.Sheets[sheetName] : null;
      if (!worksheet) {
        setStatus("empty");
        setErrorMessage("That spreadsheet appears to be empty.");
        return;
      }

      const allRows = trimTrailingBlankRows(XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: true }));
      if (allRows.length === 0) {
        setStatus("empty");
        setErrorMessage("That spreadsheet appears to be empty.");
        return;
      }
      const headerValues = allRows[0];
      const dataRows = allRows.slice(1);
      if (dataRows.length === 0) {
        setStatus("empty");
        setErrorMessage("That spreadsheet only has a header row — nothing to split.");
        return;
      }
      if (isFileTooLarge(dataRows.length)) {
        setStatus("empty");
        setErrorMessage("That spreadsheet has too many rows for this tool to split in your browser.");
        return;
      }

      const columnWidths = (worksheet["!cols"] || []).map((c) => c?.wch).filter((w) => typeof w === "number");

      parsedRef.current = { sheetName, headerValues, dataRows, columnWidths };
      setFileName(file.name);
      setTotalDataRows(dataRows.length);
      setStatus("configuring");
    } catch {
      setStatus("empty");
      setErrorMessage("Could not read that file. Make sure it's a valid, unencrypted XLS or XLSX file.");
    }
  }, []);

  const setRowsPerFile = useCallback((value) => setRowsPerFileState(clampRowsPerFile(value)), []);

  const runSplit = useCallback(async () => {
    const parsed = parsedRef.current;
    if (!parsed) return;
    const { sheetName, headerValues, dataRows, columnWidths } = parsed;

    setStatus("processing");
    setErrorMessage("");
    try {
      const ranges = computeChunkRanges(totalDataRows, rowsPerFile);

      const chunkBuffers = [];
      for (const { start, end } of ranges) {
        const outWorkbook = new ExcelJS.Workbook();
        const outSheet = outWorkbook.addWorksheet(sheetName || "Sheet1");
        if (columnWidths.length) outSheet.columns = columnWidths.map((width) => ({ width }));
        outSheet.addRow(headerValues).font = { bold: true };
        for (let r = start; r < end; r++) outSheet.addRow(dataRows[r]);
        chunkBuffers.push(await outWorkbook.xlsx.writeBuffer());
      }

      const total = chunkBuffers.length;
      if (total === 1) {
        setResultBlob(new Blob([chunkBuffers[0]], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
        setResultFilename(buildChunkFilename(fileName, 0, 1));
      } else {
        const zip = new JSZip();
        chunkBuffers.forEach((buf, i) => zip.file(buildChunkFilename(fileName, i, total), buf));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
        setResultFilename(`${sanitizeBaseFilename(fileName)}_split.zip`);
      }
      setOutputCount(total);
      setStatus("done");
    } catch {
      setStatus("configuring");
      setErrorMessage("Splitting failed. Please try again.");
    }
  }, [totalDataRows, rowsPerFile, fileName]);

  const downloadResult = useCallback(() => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFilename || "split.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [resultBlob, resultFilename]);

  const reset = useCallback(() => {
    parsedRef.current = null;
    setStatus("empty");
    setErrorMessage("");
    setFileName("");
    setTotalDataRows(0);
    setRowsPerFileState(DEFAULT_ROWS_PER_FILE);
    setResultBlob(null);
    setResultFilename("");
    setOutputCount(0);
  }, []);

  return {
    status, errorMessage, fileName, totalDataRows, rowsPerFile, setRowsPerFile,
    outputCount, resultFilename,
    loadFile, runSplit, downloadResult, reset,
  };
}
