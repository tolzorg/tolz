import { useCallback, useRef, useState } from "react";

export default function PdfDropZone({ onFiles, disabled = false }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
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
    if (!disabled && e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }, [disabled, onFiles]);

  const handleInput = useCallback((e) => {
    if (e.target.files?.length) { onFiles(e.target.files); e.target.value = ""; }
  }, [onFiles]);

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
      aria-label="Upload PDF files"
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
      {/* Icon */}
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
          <path d="M19 7l4 0" stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 13h8M10 17h5"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 22v4M11 24l3 3 3-3"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          color: dragging ? "var(--accent)" : "var(--text-primary)",
          transition: "color var(--transition)",
        }}>
          {dragging ? "Drop PDFs here" : "Drag & drop PDF files here"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          or <span style={{ color: "var(--accent)", fontWeight: 600 }}>click to browse</span>
        </p>
      </div>

      {/* Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
        {["PDF only", "Up to 20 files", "Max 50 MB each"].map((tag) => (
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
        multiple style={{ display: "none" }} onChange={handleInput} />
    </div>
  );
}
