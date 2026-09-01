import { useCallback, useRef, useState } from "react";

const ACCEPT = ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

// Upload step for Split Excel — mirrors the reference tool's two-button
// layout ("Upload from PC or Mobile" + "My Files", both opening the same
// local file picker since there's no server-side file storage to browse)
// plus drag/drop, matching the drag/drop pattern established elsewhere in
// this project (id-photo-generator/IdPhotoDropZone.jsx).
export default function SplitExcelDropZone({ onFile, disabled = false }) {
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
    setDragging(false);
    dragCounter.current = 0;
    if (!disabled && e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  }, [disabled, onFile]);
  const handleFileInput = useCallback((e) => {
    if (e.target.files?.[0]) onFile(e.target.files[0]);
    e.target.value = "";
  }, [onFile]);
  const openPicker = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "rgba(59,123,252,0.35)"}`,
        borderRadius: "var(--radius-xl)", padding: "56px 24px",
        background: dragging ? "var(--accent-light)" : "rgba(59,123,252,0.05)",
        transition: "all var(--transition)", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 16, opacity: disabled ? 0.6 : 1,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 2v5h5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", fontSize: 14 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 10.5V2M8 2L4.5 5.5M8 2l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 11v1.5A1.5 1.5 0 004 14h8a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload from PC or Mobile
        </button>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontSize: 14 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1.5 4.5A1.5 1.5 0 013 3h2.5l1.2 1.5H13a1.5 1.5 0 011.5 1.5v5.5A1.5 1.5 0 0113 13H3a1.5 1.5 0 01-1.5-1.5v-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          My Files
        </button>
      </div>

      <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>or Drag files here</p>

      <button
        type="button"
        disabled
        title="Google Drive isn't connected in this build — use Upload from PC or Mobile instead."
        style={{
          width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)",
          background: "var(--bg-white)", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "not-allowed", opacity: 0.55,
        }}
        aria-label="Import from Google Drive (not available)"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M17.6 6h12.8l14.6 25.3-6.4 11.1H10.4z" opacity="0" />
          <path fill="#00AC47" d="M17.1 6L4.1 28.6l6.4 11.1L23.5 17z" />
          <path fill="#EA4335" d="M17.1 6h13.8l13 22.6H30z" />
          <path fill="#FFBA00" d="M10.5 39.7h27l6.4-11.1H17z" />
        </svg>
      </button>

      <input ref={inputRef} type="file" accept={ACCEPT} style={{ display: "none" }} onChange={handleFileInput} />
    </div>
  );
}
