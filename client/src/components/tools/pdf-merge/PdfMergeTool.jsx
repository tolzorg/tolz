import { useState, useCallback } from "react";
import { Spinner, ErrorCard } from "../../ui";
import PdfDropZone from "./PdfDropZone";
import PdfFileList from "./PdfFileList";
import { mergePdfs } from "../../../services/pdfMergeService";

const MAX_FILES = 20;
const MAX_SIZE  = 50 * 1024 * 1024; // 50 MB

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

export default function PdfMergeTool() {
  const [files,     setFiles]     = useState([]);
  const [phase,     setPhase]     = useState("idle"); // idle | merging | done | error
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const [addErrors, setAddErrors] = useState([]);

  // ── helpers ─────────────────────────────────────────────────────────────────
  const isDuplicate = (existing, f) =>
    existing.some((e) => e.name === f.name && e.size === f.size);

  const showAddErrors = (errs) => {
    setAddErrors(errs);
    setTimeout(() => setAddErrors([]), 6000);
  };

  // ── file add ─────────────────────────────────────────────────────────────────
  const handleFiles = useCallback((incoming) => {
    const arr   = Array.from(incoming);
    const errs  = [];
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
      const dupes   = valid.filter((f) => isDuplicate(prev, f)).map((f) => f.name);
      const fresh   = valid.filter((f) => !isDuplicate(prev, f));
      const fitsIn  = MAX_FILES - prev.length;

      if (dupes.length) errs.push(`Already added: ${dupes.join(", ")}`);
      if (fresh.length > fitsIn) errs.push(`Only ${fitsIn} more file(s) allowed (max ${MAX_FILES}).`);

      return [...prev, ...fresh.slice(0, fitsIn)];
    });

    if (errs.length) showAddErrors(errs);

    // Reset to idle so user can merge again with the new set
    setPhase("idle");
    setResult(null);
    setError(null);
  }, []);

  // ── reorder & remove ─────────────────────────────────────────────────────────
  const handleReorder = useCallback((next) => {
    setFiles(next);
    if (phase === "done") { setPhase("idle"); setResult(null); }
  }, [phase]);

  const handleRemove = useCallback((idx) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) { setPhase("idle"); setResult(null); setError(null); }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]); setPhase("idle"); setResult(null); setError(null);
  }, []);

  // ── merge ────────────────────────────────────────────────────────────────────
  const merge = useCallback(async () => {
    if (files.length < 2 || phase === "merging") return;
    setPhase("merging"); setError(null); setResult(null);
    try {
      const data = await mergePdfs(files);
      setResult(data); setPhase("done");
    } catch (err) {
      setError(err.message || "Merge failed. Please try again.");
      setPhase("error");
    }
  }, [files, phase]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const hasFiles    = files.length > 0;
  const canMerge    = files.length >= 2;
  const isMerging   = phase === "merging";

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Drop zone (always visible so user can add more) ── */}
      <PdfDropZone onFiles={handleFiles} disabled={isMerging} />

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
      {error && <ErrorCard message={error} onRetry={merge} />}

      {/* ── File list ── */}
      {hasFiles && (
        <div className="card" style={{ padding: 16 }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                color: "var(--text-primary)",
              }}>
                {files.length} PDF{files.length > 1 ? "s" : ""} queued
              </span>
              <span style={{
                padding: "2px 8px", borderRadius: 99,
                background: "var(--accent-light)",
                color: "var(--accent)",
                fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700,
              }}>
                {files.length < 2 ? "Need 1 more" : "Ready to merge"}
              </span>
            </div>
            {!isMerging && (
              <button
                className="btn btn-ghost"
                onClick={clearAll}
                style={{ fontSize: 12, padding: "4px 10px", color: "var(--text-muted)" }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sortable list */}
          <PdfFileList
            files={files}
            onReorder={handleReorder}
            onRemove={handleRemove}
            disabled={isMerging}
          />

          {/* Add more */}
          {!isMerging && files.length < MAX_FILES && (
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
              Add more PDFs ({MAX_FILES - files.length} slots left)
              <input
                type="file" accept="application/pdf,.pdf" multiple hidden
                onChange={(e) => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ""; } }}
              />
            </label>
          )}
        </div>
      )}

      {/* ── Minimum-files notice ── */}
      {hasFiles && !canMerge && (
        <div style={{
          padding: "11px 14px", borderRadius: "var(--radius-md)",
          background: "#fefce8", border: "1px solid #fde68a",
          fontSize: 13, color: "#92400e",
          fontFamily: "var(--font-display)", fontWeight: 500,
        }}>
          ℹ️ Add at least one more PDF to enable merging.
        </div>
      )}

      {/* ── Merge / loading button ── */}
      {canMerge && (
        isMerging ? (
          <button className="btn btn-primary" disabled
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}>
            <Spinner size={16} />
            Merging {files.length} PDFs…
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={merge}
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3 8.5h11M9.5 4l4.5 4.5L9.5 13" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {phase === "done" ? `Re-merge ${files.length} PDFs` : `Merge ${files.length} PDFs`}
          </button>
        )
      )}

      {/* ── Result ── */}
      {phase === "done" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Success banner */}
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
              Merged successfully — {result.pageCount} page{result.pageCount !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* Download card */}
          <div className="card" style={{
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "#eff6ff", border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>
              📄
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                {result.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                {formatBytes(result.size)} · {result.pageCount} page{result.pageCount !== 1 ? "s" : ""} · {files.length} PDFs merged
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => downloadBase64(result.data, result.name)}
              style={{ padding: "10px 20px", fontSize: 14, flexShrink: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5v8M4.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.5 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              Download PDF
            </button>
          </div>

          {/* Merge again / start over */}
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
            Merge New Files
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
