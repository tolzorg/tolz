import React, { useState, useCallback } from "react";
import JSZip from "jszip";
import { Spinner, ErrorCard } from "../../ui";
import PdfDropZone from "../pdf-merge/PdfDropZone";
import { convertToWord } from "../../../services/pdfToWordService";

const MAX_FILES = 20;
const MAX_SIZE  = 50 * 1024 * 1024;

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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

async function downloadAllAsZip(results, baseName) {
  const zip = new JSZip();
  for (const r of results) {
    if (r.error) continue;
    const b64 = r.data.split(",")[1];
    zip.file(r.name, b64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${baseName}_word_docs.zip`; a.click();
  URL.revokeObjectURL(url);
}

export default function PdfToWordTool() {
  const [files,     setFiles]     = useState([]);
  const [phase,     setPhase]     = useState("idle"); // idle | converting | done | error
  const [results,   setResults]   = useState([]);
  const [error,     setError]     = useState(null);
  const [addErrors, setAddErrors] = useState([]);
  const [zipping,   setZipping]   = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const isDuplicate = (existing, f) =>
    existing.some((e) => e.name === f.name && e.size === f.size);

  const showAddErrors = (errs) => {
    setAddErrors(errs);
    setTimeout(() => setAddErrors([]), 6000);
  };

  // ── file add ─────────────────────────────────────────────────────────────────
  const handleFiles = useCallback((incoming) => {
    const arr  = Array.from(incoming);
    const errs = [];
    const valid = [];

    for (const f of arr) {
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        errs.push(`"${f.name}" is not a PDF file.`); continue;
      }
      if (f.size > MAX_SIZE) {
        errs.push(`"${f.name}" exceeds the 50 MB limit.`); continue;
      }
      valid.push(f);
    }

    setFiles((prev) => {
      const dupes  = valid.filter((f) => isDuplicate(prev, f)).map((f) => f.name);
      const fresh  = valid.filter((f) => !isDuplicate(prev, f));
      const fitsIn = MAX_FILES - prev.length;

      if (dupes.length)          errs.push(`Already added: ${dupes.join(", ")}`);
      if (fresh.length > fitsIn) errs.push(`Only ${fitsIn} more file(s) allowed (max ${MAX_FILES}).`);

      return [...prev, ...fresh.slice(0, Math.max(0, fitsIn))];
    });

    if (errs.length) showAddErrors(errs);
    setPhase("idle"); setResults([]); setError(null);
  }, []);

  // ── remove / clear ───────────────────────────────────────────────────────────
  const handleRemove = useCallback((idx) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) { setPhase("idle"); setResults([]); setError(null); }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]); setPhase("idle"); setResults([]); setError(null);
  }, []);

  // ── convert ──────────────────────────────────────────────────────────────────
  const convert = useCallback(async () => {
    if (!files.length || phase === "converting") return;
    setPhase("converting"); setError(null); setResults([]);
    try {
      const data = await convertToWord(files);
      setResults(data.results);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Conversion failed. Please try again.");
      setPhase("error");
    }
  }, [files, phase]);

  // ── zip download ─────────────────────────────────────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (zipping || !results.length) return;
    setZipping(true);
    try {
      await downloadAllAsZip(results, "word_documents");
    } finally {
      setZipping(false);
    }
  }, [results, zipping]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const hasFiles      = files.length > 0;
  const isConverting  = phase === "converting";
  const isDone        = phase === "done";
  const successCount  = results.filter((r) => !r.error).length;
  const hasMultipleOk = successCount > 1;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Drop zone ── */}
      <PdfDropZone onFiles={handleFiles} disabled={isConverting} />

      {/* ── File validation errors ── */}
      {addErrors.length > 0 && (
        <div className="error-box animate-fadeUp">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#ef4444" />
          </svg>
          <div style={{ flex: 1 }}>
            {addErrors.map((e, i) => (
              <p key={i} style={{ marginBottom: i < addErrors.length - 1 ? 4 : 0 }}>{e}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Global error ── */}
      {error && <ErrorCard message={error} onRetry={convert} />}

      {/* ── File queue ── */}
      {hasFiles && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              color: "var(--text-primary)",
            }}>
              {files.length} PDF{files.length > 1 ? "s" : ""} queued
            </span>
            {!isConverting && (
              <button
                className="btn btn-ghost"
                onClick={clearAll}
                style={{ fontSize: 12, padding: "4px 10px", color: "var(--text-muted)" }}
              >
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {files.map((file, idx) => (
              <div key={`${file.name}-${file.size}`} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)",
                background: "var(--bg-white)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "var(--radius-sm)",
                  background: "#eff6ff", border: "1px solid #bfdbfe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 15,
                }}>
                  📄
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                    color: "var(--text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={file.name}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    {formatBytes(file.size)}
                  </p>
                </div>
                {!isConverting && (
                  <button
                    onClick={() => handleRemove(idx)}
                    aria-label={`Remove ${file.name}`}
                    style={{
                      width: 26, height: 26, borderRadius: 99,
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
            ))}
          </div>

          {/* Add more */}
          {!isConverting && files.length < MAX_FILES && (
            <label
              style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 10, padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                border: "1.5px dashed var(--border-hover)",
                background: "transparent",
                color: "var(--text-muted)", fontSize: 13,
                fontFamily: "var(--font-display)", fontWeight: 500,
                cursor: "pointer", transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add more PDFs ({MAX_FILES - files.length} slots left)
              <input
                type="file" accept="application/pdf,.pdf" multiple hidden
                onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ""; } }}
              />
            </label>
          )}
        </div>
      )}

      {/* ── Convert button ── */}
      {hasFiles && !isDone && (
        isConverting ? (
          <button className="btn btn-primary" disabled
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
            <Spinner size={16} />
            Converting {files.length} PDF{files.length > 1 ? "s" : ""} to Word…
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={convert}
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="3" y="2" width="11" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M6 6h5M6 9h5M6 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Convert to Word (.docx)
          </button>
        )
      )}

      {/* ── Re-convert button (after done) ── */}
      {isDone && hasFiles && (
        <button
          className="btn btn-primary"
          onClick={convert}
          style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <rect x="3" y="2" width="11" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M6 6h5M6 9h5M6 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Re-convert
        </button>
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
                {successCount} file{successCount !== 1 ? "s" : ""} converted successfully
              </p>
            </div>

            {hasMultipleOk && (
              <button
                onClick={handleDownloadZip}
                disabled={zipping}
                className="btn btn-primary"
                style={{ padding: "8px 14px", fontSize: 12, flexShrink: 0 }}
              >
                {zipping ? (
                  <><Spinner size={12} /> Zipping…</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 1v7M4 6l2.5 2.5L9 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                    Download All (.zip)
                  </>
                )}
              </button>
            )}
          </div>

          {/* Per-file result cards */}
          {results.map((r, i) => (
            r.error ? (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: "var(--radius-md)",
                border: "1px solid #fecaca", background: "#fff5f5",
                fontSize: 13, color: "var(--error)",
                fontFamily: "var(--font-display)", fontWeight: 500,
              }}>
                ⚠️ {r.error}
              </div>
            ) : (
              <React.Fragment key={i}>
              <div className="card" style={{
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
              }}>
                {/* Word doc icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "#e0f2fe", border: "1px solid #7dd3fc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  📝
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                    color: "var(--text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={r.name}>
                    {r.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {formatBytes(r.originalSize)}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5h8M6 2l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 600 }}>
                      {formatBytes(r.size)}
                    </span>
                    <span style={{
                      padding: "2px 7px", borderRadius: 99, fontSize: 10,
                      background: r.method !== "text-extraction" ? "#dcfce7" : "#fef9c3",
                      color: r.method !== "text-extraction" ? "#15803d" : "#92400e",
                      fontFamily: "var(--font-display)", fontWeight: 700,
                    }}>
                      {r.method !== "text-extraction" ? "Full quality" : "Text only"}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => downloadBase64(r.data, r.name)}
                  style={{ padding: "9px 16px", fontSize: 13, flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  Download
                </button>
              </div>
              {r.method === "text-extraction" && (
                <div style={{
                  marginTop: 6, padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "#fefce8", border: "1px solid #fde68a",
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#d97706" strokeWidth="1.3" />
                    <line x1="6.5" y1="4" x2="6.5" y2="7" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="6.5" cy="9" r="0.65" fill="#d97706" />
                  </svg>
                  <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5, margin: 0 }}>
                    <strong>Text-only conversion.</strong> Images, colours, and complex layout could not be extracted. All text content and headings are preserved.
                  </p>
                </div>
              )}
              </React.Fragment>
            )
          ))}

          {/* Convert new files */}
          <button
            onClick={clearAll}
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
            Convert New Files
          </button>
        </div>
      )}

      {/* ── Trust signals (empty state) ── */}
      {!hasFiles && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {["100% Free", "No Signup", "Files Not Stored", "Up to 20 PDFs"].map((tag) => (
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
