import { useState, useCallback } from "react";
import { Spinner, ErrorCard } from "../../ui";
import PdfDropZone from "../pdf-merge/PdfDropZone";
import { compressPdfs } from "../../../services/pdfCompressService";

const MAX_FILES      = 20;
const MAX_FILES_SIZE = 3;   // limit when using target-size mode
const MAX_SIZE       = 50 * 1024 * 1024;

const LEVELS = [
  { id: "low",    label: "Low",    sub: "Best quality",  icon: "🔵" },
  { id: "medium", label: "Medium", sub: "Balanced",      icon: "🟡" },
  { id: "high",   label: "High",   sub: "Smallest size", icon: "🔴" },
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

function getCompressedName(original) {
  const dot = original.lastIndexOf(".");
  if (dot === -1) return original + "-compressed";
  return original.slice(0, dot) + "-compressed" + original.slice(dot);
}

export default function PdfCompressTool() {
  const [files,        setFiles]        = useState([]);
  const [mode,         setMode]         = useState("level"); // "level" | "size"
  const [targetSizeKb, setTargetSizeKb] = useState(50);
  const [level,        setLevel]        = useState("medium");
  const [phase,        setPhase]        = useState("idle"); // idle | compressing | done | error
  const [results,      setResults]      = useState([]);
  const [error,        setError]        = useState(null);
  const [addErrors,    setAddErrors]    = useState([]);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const isDuplicate = (existing, f) =>
    existing.some((e) => e.name === f.name && e.size === f.size);

  const showAddErrors = (errs) => {
    setAddErrors(errs);
    setTimeout(() => setAddErrors([]), 6000);
  };

  // ── mode switch ───────────────────────────────────────────────────────────────
  const handleSetMode = (newMode) => {
    setMode(newMode);
    if (newMode === "size") {
      setFiles((prev) => prev.slice(0, MAX_FILES_SIZE));
    }
    setPhase("idle"); setResults([]); setError(null);
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
      const limit  = mode === "size" ? MAX_FILES_SIZE : MAX_FILES;
      const dupes  = valid.filter((f) => isDuplicate(prev, f)).map((f) => f.name);
      const fresh  = valid.filter((f) => !isDuplicate(prev, f));
      const fitsIn = limit - prev.length;

      if (dupes.length) errs.push(`Already added: ${dupes.join(", ")}`);
      if (fresh.length > fitsIn) errs.push(`Only ${fitsIn} more file(s) allowed (max ${limit}).`);

      return [...prev, ...fresh.slice(0, Math.max(0, fitsIn))];
    });

    if (errs.length) showAddErrors(errs);
    setPhase("idle"); setResults([]); setError(null);
  }, [mode]);

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

  // ── compress ─────────────────────────────────────────────────────────────────
  const compress = useCallback(async () => {
    if (!files.length || phase === "compressing") return;
    setPhase("compressing"); setError(null); setResults([]);
    try {
      const data = mode === "size"
        ? await compressPdfs(files, null, targetSizeKb)
        : await compressPdfs(files, level, null);
      setResults(data.results); setPhase("done");
    } catch (err) {
      setError(err.message || "Compression failed. Please try again.");
      setPhase("error");
    }
  }, [files, mode, level, targetSizeKb, phase]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const hasFiles      = files.length > 0;
  const isCompressing = phase === "compressing";
  const isDone        = phase === "done";
  const successCount  = results.filter((r) => !r.error).length;
  const maxForMode    = mode === "size" ? MAX_FILES_SIZE : MAX_FILES;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Drop zone ── */}
      <PdfDropZone onFiles={handleFiles} disabled={isCompressing} />

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
      {error && <ErrorCard message={error} onRetry={compress} />}

      {/* ── Mode selector + settings ── */}
      {hasFiles && (
        <div className="card" style={{ padding: 16 }}>

          {/* Mode toggle buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { id: "size",  label: "Specific Size" },
              { id: "level", label: "Compression Level" },
            ].map((opt) => {
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={isCompressing}
                  onClick={() => handleSetMode(opt.id)}
                  style={{
                    flex: 1, padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent-light)" : "var(--bg-white)",
                    cursor: isCompressing ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    transition: "all var(--transition)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* ── Size mode: inline input row ── */}
          {mode === "size" && (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                  color: "var(--text-primary)", whiteSpace: "nowrap",
                }}>
                  PDF Size:
                </span>

                <input
                  type="number"
                  value={targetSizeKb}
                  min={1}
                  disabled={isCompressing}
                  onChange={(e) => setTargetSizeKb(Math.max(1, Number(e.target.value) || 1))}
                  style={{
                    flex: 1, minWidth: 80, maxWidth: 160,
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-hover)",
                    background: "var(--bg-white)",
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                />

                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                  color: "var(--text-secondary)",
                }}>
                  Kb
                </span>

                {isCompressing ? (
                  <button className="btn btn-primary" disabled
                    style={{ padding: "9px 20px", fontSize: 14 }}>
                    <Spinner size={14} />
                    Compressing…
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={compress}
                    style={{ padding: "9px 20px", fontSize: 14 }}
                  >
                    {isDone ? "Re-compress" : "Compress"}
                  </button>
                )}
              </div>

              <p style={{
                marginTop: 10, textAlign: "center",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
                color: "var(--accent)",
              }}>
                Note:- You Can Compress {MAX_FILES_SIZE} PDFs At Once
              </p>
            </>
          )}

          {/* ── Level mode: 3-button selector ── */}
          {mode === "level" && (
            <div style={{ display: "flex", gap: 8 }}>
              {LEVELS.map((l) => {
                const active = level === l.id;
                return (
                  <button
                    key={l.id}
                    disabled={isCompressing}
                    onClick={() => setLevel(l.id)}
                    style={{
                      flex: 1, padding: "10px 8px",
                      borderRadius: "var(--radius-md)",
                      border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-light)" : "var(--bg-white)",
                      cursor: isCompressing ? "not-allowed" : "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      transition: "all var(--transition)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{l.icon}</span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                      color: active ? "var(--accent)" : "var(--text-primary)",
                    }}>
                      {l.label}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                      {l.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

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
            {!isCompressing && (
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
                {!isCompressing && (
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

          {/* Add more (respects per-mode limit) */}
          {!isCompressing && files.length < maxForMode && (
            <label style={{
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
              Add more PDFs ({maxForMode - files.length} slots left)
              <input
                type="file" accept="application/pdf,.pdf" multiple hidden
                onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ""; } }}
              />
            </label>
          )}
        </div>
      )}

      {/* ── Full-width Compress button (level mode only) ── */}
      {hasFiles && mode === "level" && (
        isCompressing ? (
          <button className="btn btn-primary" disabled
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
            <Spinner size={16} />
            Compressing {files.length} PDF{files.length > 1 ? "s" : ""}…
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={compress}
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M8.5 2v10M4 8l4.5 4.5L13 8" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 15h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {isDone ? `Re-compress ${files.length} PDF${files.length > 1 ? "s" : ""}` : `Compress ${files.length} PDF${files.length > 1 ? "s" : ""}`}
          </button>
        )
      )}

      {/* ── Results ── */}
      {isDone && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Summary banner */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: "var(--radius-md)",
            background: "var(--success-light)", border: "1px solid #bbf7d0",
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="9" cy="9" r="8" stroke="#22c55e" strokeWidth="1.6" />
              <path d="M5.5 9l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
              color: "#15803d",
            }}>
              {successCount} PDF{successCount !== 1 ? "s" : ""} compressed successfully
            </p>
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
              <div key={i} className="card" style={{
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
                      {formatBytes(r.compressedSize)}
                    </span>
                    <span style={{
                      padding: "2px 7px", borderRadius: 99, fontSize: 10,
                      background: r.savings > 0 ? "#dcfce7" : "var(--bg-muted)",
                      color: r.savings > 0 ? "#15803d" : "var(--text-muted)",
                      fontFamily: "var(--font-display)", fontWeight: 700,
                    }}>
                      {r.savings > 0 ? `-${r.savings}%` : "No change"}
                    </span>
                    {r.targetSizeKb && !r.achievedTarget && (
                      <span style={{
                        padding: "2px 7px", borderRadius: 99, fontSize: 10,
                        background: "#fef9c3", color: "#92400e",
                        fontFamily: "var(--font-display)", fontWeight: 600,
                      }}>
                        {r.minimumAchievableKb
                          ? `Best possible — min ~${r.minimumAchievableKb} KB (target ${r.targetSizeKb} KB unreachable)`
                          : `Best possible (target ${r.targetSizeKb} KB unreachable)`}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => downloadBase64(r.data, getCompressedName(r.name))}
                  style={{ padding: "9px 16px", fontSize: 13, flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  Download
                </button>
              </div>
            )
          ))}

          {/* Compress new files */}
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
            Compress New Files
          </button>
        </div>
      )}

      {/* ── Trust signals ── */}
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
