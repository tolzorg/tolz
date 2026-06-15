import { useState, useCallback, useRef } from "react";
import JSZip from "jszip";
import { Spinner, ErrorCard } from "../../ui";
import { getPdfInfo, splitPdf } from "../../../services/pdfSplitService";

const MAX_SIZE = 50 * 1024 * 1024;

const MODES = [
  { id: "ranges",     label: "Page Ranges",     hint: "e.g. 1-3, 5, 7-10" },
  { id: "every_page", label: "Every Page",       hint: "One PDF per page" },
  { id: "every_n",    label: "Every N Pages",    hint: "Split into chunks" },
];

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function downloadBase64(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename; a.click();
}

async function downloadAllAsZip(files, baseName) {
  const zip = new JSZip();
  for (const f of files) {
    const b64 = f.data.split(",")[1];
    zip.file(f.name, b64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${baseName}_split.zip`; a.click();
  URL.revokeObjectURL(url);
}

function validateRangesInput(input, totalPages) {
  if (!input.trim()) return "Please enter page ranges.";
  const tokens = input.split(",").map((s) => s.trim()).filter(Boolean);
  for (const token of tokens) {
    if (token.includes("-")) {
      const parts = token.split("-");
      if (parts.length !== 2) return `Invalid range "${token}".`;
      const a = parseInt(parts[0].trim(), 10);
      const b = parseInt(parts[1].trim(), 10);
      if (isNaN(a) || isNaN(b)) return `Range "${token}" must contain numbers.`;
      if (a < 1 || b < 1) return `Page numbers must be positive (got "${token}").`;
      if (a > b) return `Range "${token}": start must be ≤ end.`;
      if (totalPages && b > totalPages)
        return `Page ${b} exceeds total pages (${totalPages}).`;
    } else {
      const p = parseInt(token, 10);
      if (isNaN(p)) return `"${token}" is not a valid page number.`;
      if (p < 1) return `Page numbers must be positive (got "${token}").`;
      if (totalPages && p > totalPages)
        return `Page ${p} exceeds total pages (${totalPages}).`;
    }
  }
  return null;
}

// ── Single-file drop zone ─────────────────────────────────────────────────────
function SinglePdfDropZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef    = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (--dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(false); dragCounter.current = 0;
    if (!disabled && e.dataTransfer.files?.length) onFile(e.dataTransfer.files[0]);
  }, [disabled, onFile]);

  const handleInput = useCallback((e) => {
    if (e.target.files?.length) { onFile(e.target.files[0]); e.target.value = ""; }
  }, [onFile]);

  const open = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && open()}
      aria-label="Upload a PDF file to split"
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-hover)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "44px 24px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: dragging ? "var(--accent-light)" : "var(--bg-white)",
        transition: "all var(--transition)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        opacity: disabled ? 0.6 : 1,
        outline: "none",
      }}
    >
      <div style={{
        width: 60, height: 60, borderRadius: "var(--radius-lg)",
        background: dragging ? "rgba(59,123,252,0.12)" : "var(--bg-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all var(--transition)",
        border: dragging ? "1.5px solid rgba(59,123,252,0.25)" : "1.5px solid transparent",
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="5" y="3" width="14" height="18" rx="2"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1.8" />
          <path d="M19 3v4h4" stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 13h8M10 17h5"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 24l5-5 5 5M14 19v6"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          color: dragging ? "var(--accent)" : "var(--text-primary)",
          transition: "color var(--transition)",
        }}>
          {dragging ? "Drop PDF here" : "Drag & drop a PDF file here"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          or <span style={{ color: "var(--accent)", fontWeight: 600 }}>click to browse</span>
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
        {["PDF only", "Single file", "Max 50 MB"].map((tag) => (
          <span key={tag} style={{
            padding: "3px 10px", borderRadius: 99,
            background: "var(--bg-muted)", color: "var(--text-muted)",
            fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 600,
            border: "1px solid var(--border)",
          }}>
            {tag}
          </span>
        ))}
      </div>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf"
        style={{ display: "none" }} onChange={handleInput} />
    </div>
  );
}

// ── Main tool ─────────────────────────────────────────────────────────────────
export default function PdfSplitTool() {
  const [file,        setFile]        = useState(null);
  const [info,        setInfo]        = useState(null);   // {pageCount, filename}
  const [infoPhase,   setInfoPhase]   = useState("idle"); // idle | loading | ready | error
  const [infoError,   setInfoError]   = useState(null);

  const [mode,        setMode]        = useState("ranges");
  const [ranges,      setRanges]      = useState("");
  const [nPages,      setNPages]      = useState(2);
  const [rangeError,  setRangeError]  = useState(null);

  const [phase,       setPhase]       = useState("idle"); // idle | splitting | done | error
  const [results,     setResults]     = useState([]);
  const [splitError,  setSplitError]  = useState(null);
  const [zipping,     setZipping]     = useState(false);

  // ── file select ──────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (f) => {
    if (!f) return;

    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setInfoError(`"${f.name}" is not a PDF file.`);
      setInfoPhase("error");
      return;
    }
    if (f.size > MAX_SIZE) {
      setInfoError(`"${f.name}" exceeds the 50 MB limit.`);
      setInfoPhase("error");
      return;
    }

    setFile(f);
    setInfo(null);
    setInfoPhase("loading");
    setInfoError(null);
    setPhase("idle");
    setResults([]);
    setSplitError(null);
    setRangeError(null);

    try {
      const data = await getPdfInfo(f);
      setInfo(data);
      setInfoPhase("ready");
    } catch (err) {
      setInfoError(err.message || "Could not read PDF.");
      setInfoPhase("error");
    }
  }, []);

  // ── clear file ───────────────────────────────────────────────────────────────
  const clearFile = useCallback(() => {
    setFile(null); setInfo(null); setInfoPhase("idle"); setInfoError(null);
    setPhase("idle"); setResults([]); setSplitError(null); setRangeError(null);
  }, []);

  // ── mode change ──────────────────────────────────────────────────────────────
  const handleModeChange = useCallback((m) => {
    setMode(m);
    setRangeError(null);
    setPhase("idle");
    setResults([]);
    setSplitError(null);
  }, []);

  // ── range input change ───────────────────────────────────────────────────────
  const handleRangesChange = useCallback((val) => {
    setRanges(val);
    setRangeError(null);
  }, []);

  // ── split ────────────────────────────────────────────────────────────────────
  const handleSplit = useCallback(async () => {
    if (!file || phase === "splitting") return;

    if (mode === "ranges") {
      const err = validateRangesInput(ranges, info?.pageCount ?? null);
      if (err) { setRangeError(err); return; }
    }

    setPhase("splitting");
    setSplitError(null);
    setResults([]);

    try {
      const params = { mode };
      if (mode === "ranges") params.ranges = ranges;
      if (mode === "every_n") params.n = nPages;
      const data = await splitPdf(file, params);
      setResults(data.files);
      setPhase("done");
    } catch (err) {
      setSplitError(err.message || "Split failed. Please try again.");
      setPhase("error");
    }
  }, [file, mode, ranges, nPages, phase, info]);

  // ── zip download ─────────────────────────────────────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (zipping || !results.length) return;
    setZipping(true);
    try {
      const stem = file?.name.replace(/\.pdf$/i, "") || "document";
      await downloadAllAsZip(results, stem);
    } finally {
      setZipping(false);
    }
  }, [results, file, zipping]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const isReady     = infoPhase === "ready";
  const isSplitting = phase === "splitting";
  const isDone      = phase === "done";
  const totalPages  = info?.pageCount ?? null;

  const canSplit = isReady && !isSplitting && (
    mode === "every_page" ||
    (mode === "ranges" && ranges.trim().length > 0) ||
    (mode === "every_n" && nPages >= 1)
  );

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Drop zone (hide after file loaded) ── */}
      {!file && (
        <SinglePdfDropZone onFile={handleFile} disabled={false} />
      )}

      {/* ── Info loading spinner ── */}
      {file && infoPhase === "loading" && (
        <div className="card" style={{
          padding: "20px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Spinner size={18} />
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
            color: "var(--text-secondary)",
          }}>
            Reading PDF…
          </span>
        </div>
      )}

      {/* ── Info error ── */}
      {infoPhase === "error" && infoError && (
        <div className="error-box animate-fadeUp">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#ef4444" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500 }}>{infoError}</p>
            <button
              className="btn btn-ghost"
              onClick={clearFile}
              style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}
            >
              Try a different file
            </button>
          </div>
        </div>
      )}

      {/* ── File card (shown once info is ready) ── */}
      {isReady && info && file && (
        <div className="card" style={{
          padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--radius-md)",
            background: "#eff6ff", border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>
            📄
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              color: "var(--text-primary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} title={file.name}>
              {file.name}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {formatBytes(file.size)}
              </span>
              <span style={{
                padding: "1px 8px", borderRadius: 99, fontSize: 11,
                background: "var(--accent-light)", color: "var(--accent)",
                fontFamily: "var(--font-display)", fontWeight: 700,
              }}>
                {totalPages} page{totalPages !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {!isSplitting && (
            <button
              onClick={clearFile}
              aria-label="Remove file"
              style={{
                width: 28, height: 28, borderRadius: 99,
                border: "none", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, flexShrink: 0, transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff0f0"; e.currentTarget.style.color = "var(--error)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <line x1="1" y1="1" x2="10" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="10" y1="1" x2="1" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Split options ── */}
      {isReady && (
        <div className="card" style={{ padding: 16 }}>

          {/* Mode tabs */}
          <p style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
            color: "var(--text-secondary)", marginBottom: 8,
          }}>
            Split mode
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  disabled={isSplitting}
                  onClick={() => handleModeChange(m.id)}
                  style={{
                    flex: 1, padding: "9px 8px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent-light)" : "var(--bg-white)",
                    cursor: isSplitting ? "not-allowed" : "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    transition: "all var(--transition)",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                    color: active ? "var(--accent)" : "var(--text-primary)",
                  }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                    {m.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Ranges input ── */}
          {mode === "ranges" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                color: "var(--text-primary)",
              }}>
                Page ranges
                {totalPages && (
                  <span style={{ color: "var(--text-muted)", fontWeight: 500, marginLeft: 6 }}>
                    (1 – {totalPages})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={ranges}
                disabled={isSplitting}
                onChange={(e) => handleRangesChange(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                style={{
                  width: "100%", padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${rangeError ? "var(--error)" : "var(--border-hover)"}`,
                  background: "var(--bg-white)",
                  fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14,
                  color: "var(--text-primary)", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color var(--transition)",
                }}
                onFocus={(e) => { if (!rangeError) e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { if (!rangeError) e.currentTarget.style.borderColor = "var(--border-hover)"; }}
              />
              {rangeError ? (
                <p style={{ fontSize: 12, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  {rangeError}
                </p>
              ) : (
                <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  Each comma-separated entry becomes a separate PDF. Use <strong>–</strong> for ranges, single numbers for individual pages.
                </p>
              )}
            </div>
          )}

          {/* ── Every N pages input ── */}
          {mode === "every_n" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                color: "var(--text-primary)", whiteSpace: "nowrap",
              }}>
                Split every
              </span>
              <input
                type="number"
                value={nPages}
                min={1}
                max={totalPages ? totalPages - 1 : undefined}
                disabled={isSplitting}
                onChange={(e) => setNPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{
                  width: 80, padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border-hover)",
                  background: "var(--bg-white)",
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
                  color: "var(--text-primary)", outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
              />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                color: "var(--text-secondary)",
              }}>
                pages
              </span>
              {totalPages && (
                <span style={{
                  fontSize: 12, color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                }}>
                  → {Math.ceil(totalPages / nPages)} output PDF{Math.ceil(totalPages / nPages) !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* ── Every page info ── */}
          {mode === "every_page" && totalPages && (
            <p style={{
              fontSize: 13, color: "var(--text-secondary)",
              fontFamily: "var(--font-display)", fontWeight: 500,
            }}>
              This will produce <strong style={{ color: "var(--accent)" }}>{totalPages}</strong> separate PDF{totalPages !== 1 ? "s" : ""}, one per page.
            </p>
          )}
        </div>
      )}

      {/* ── Global split error ── */}
      {phase === "error" && splitError && (
        <ErrorCard message={splitError} onRetry={handleSplit} />
      )}

      {/* ── Split button ── */}
      {isReady && !isDone && (
        isSplitting ? (
          <button className="btn btn-primary" disabled
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
            <Spinner size={16} />
            Splitting PDF…
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSplit}
            disabled={!canSplit}
            style={{
              width: "100%", padding: "14px 24px", fontSize: 15,
              justifyContent: "center",
              opacity: canSplit ? 1 : 0.5,
              cursor: canSplit ? "pointer" : "not-allowed",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M5 3v11M12 3v11M3 8.5h11"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Split PDF
          </button>
        )
      )}

      {/* ── Results ── */}
      {isDone && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Success banner */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderRadius: "var(--radius-md)",
            background: "var(--success-light)", border: "1px solid #bbf7d0",
            flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="9" cy="9" r="8" stroke="#22c55e" strokeWidth="1.6" />
                <path d="M5.5 9l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                color: "#15803d",
              }}>
                Split into {results.length} PDF{results.length !== 1 ? "s" : ""}
              </p>
            </div>

            {results.length > 1 && (
              <button
                onClick={handleDownloadZip}
                disabled={zipping}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}
              >
                {zipping ? <Spinner size={13} /> : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                )}
                {zipping ? "Zipping…" : "Download All (.zip)"}
              </button>
            )}
          </div>

          {/* Per-file download cards */}
          {results.map((r, i) => (
            <div key={i} className="card" style={{
              padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "var(--radius-md)",
                background: "#eff6ff", border: "1px solid #bfdbfe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                  color: "var(--text-primary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }} title={r.name}>
                  {r.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {formatBytes(r.size)} · {r.pages} page{r.pages !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => downloadBase64(r.data, r.name)}
                style={{ padding: "7px 14px", fontSize: 12, flexShrink: 0 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1v7M4 6l2.5 2.5L9 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                Download
              </button>
            </div>
          ))}

          {/* Split new file */}
          <button
            onClick={clearFile}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 24px", borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--accent)", background: "var(--accent-light)",
              color: "var(--accent)",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              cursor: "pointer", transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Split a New File
          </button>
        </div>
      )}

      {/* ── Trust signals (empty state) ── */}
      {!file && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {["100% Free", "No Signup", "Files Not Stored", "5 Split Modes"].map((tag) => (
            <span key={tag} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: 500,
            }}>
              <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
