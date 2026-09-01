import SplitExcelDropZone from "./SplitExcelDropZone";
import { useSplitExcel } from "./useSplitExcel";
import { MIN_ROWS_PER_FILE, MAX_ROWS_PER_FILE } from "../../../utils/splitExcelEngine";

export default function SplitExcelTool() {
  const {
    status, errorMessage, fileName, totalDataRows, rowsPerFile, setRowsPerFile,
    outputCount, resultFilename,
    loadFile, runSplit, downloadResult, reset,
  } = useSplitExcel();

  if (status === "empty" || status === "loading") {
    return (
      <div className="card" style={{ padding: 28 }}>
        <SplitExcelDropZone onFile={loadFile} disabled={status === "loading"} />
        {status === "loading" && (
          <p style={{ marginTop: 14, fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Reading your spreadsheet…</p>
        )}
        {errorMessage && (
          <p style={{ marginTop: 14, fontSize: 13, color: "#dc2626", fontWeight: 600, textAlign: "center" }}>{errorMessage}</p>
        )}
        <p style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-muted)", textAlign: "center" }}>
          XLS and XLSX files up to 25 MB. Splits the first sheet by row count — nothing is uploaded, it all runs in your browser.
        </p>
      </div>
    );
  }

  if (status === "configuring" || status === "processing") {
    const isProcessing = status === "processing";
    return (
      <div className="card" style={{ padding: 36 }}>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 24 }}>
          <strong style={{ color: "var(--text-primary)" }}>{fileName}</strong> — {totalDataRows.toLocaleString()} data row{totalDataRows === 1 ? "" : "s"} (plus header)
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "center", padding: "40px 0" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>Rows per file</span>
            <input
              type="number"
              min={MIN_ROWS_PER_FILE}
              max={MAX_ROWS_PER_FILE}
              value={rowsPerFile}
              onChange={(e) => setRowsPerFile(e.target.value)}
              disabled={isProcessing}
              style={{
                width: 180, padding: "10px 12px", fontSize: 15, borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)",
              }}
            />
          </label>
          <button
            type="button"
            onClick={runSplit}
            disabled={isProcessing}
            className="btn-primary"
            style={{ padding: "12px 28px", fontSize: 15 }}
          >
            {isProcessing ? "Splitting…" : "Split"}
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: "var(--text-muted)", textAlign: "center" }}>
          This will produce {Math.max(1, Math.ceil(totalDataRows / Math.max(1, rowsPerFile))).toLocaleString()} file
          {Math.ceil(totalDataRows / Math.max(1, rowsPerFile)) === 1 ? "" : "s"}, each with the header row plus up to {rowsPerFile.toLocaleString()} data rows.
        </p>

        {errorMessage && (
          <p style={{ marginTop: 14, fontSize: 13, color: "#dc2626", fontWeight: 600, textAlign: "center" }}>{errorMessage}</p>
        )}

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button type="button" onClick={reset} disabled={isProcessing} className="btn-secondary" style={{ padding: "10px 18px", fontSize: 13 }}>
            Upload a different file
          </button>
        </div>
      </div>
    );
  }

  // status === "done"
  return (
    <div className="card" style={{ padding: 40, textAlign: "center" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
        Your file has been split!
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        {outputCount} file{outputCount === 1 ? "" : "s"} {outputCount === 1 ? "is" : "bundled into a zip and is"} ready to download.
      </p>

      <button type="button" onClick={downloadResult} className="btn-primary" style={{ padding: "13px 32px", fontSize: 15, marginBottom: 14 }}>
        Download{outputCount > 1 ? ` (${resultFilename})` : ""}
      </button>

      <div>
        <button
          type="button"
          disabled
          title="Google Drive isn't connected in this build — use Download instead."
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent",
            color: "var(--text-muted)", fontSize: 13.5, cursor: "not-allowed", opacity: 0.65, padding: "6px 0",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#00AC47" d="M17.1 6L4.1 28.6l6.4 11.1L23.5 17z" />
            <path fill="#EA4335" d="M17.1 6h13.8l13 22.6H30z" />
            <path fill="#FFBA00" d="M10.5 39.7h27l6.4-11.1H17z" />
          </svg>
          Google Drive
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <button type="button" onClick={reset} className="btn-secondary" style={{ padding: "10px 22px", fontSize: 13.5 }}>
          Start Over
        </button>
      </div>
    </div>
  );
}
