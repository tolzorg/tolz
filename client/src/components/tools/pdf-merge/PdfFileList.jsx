import { useRef, useState } from "react";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export default function PdfFileList({ files, onReorder, onRemove, disabled }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const dragNode = useRef(null);

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    dragNode.current = e.currentTarget;
    // Delay so the ghost image renders before we change styles
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, idx) => {
    e.preventDefault();
    if (idx !== dragIdx) setOverIdx(idx);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) return;
    const next = [...files];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(dropIdx, 0, moved);
    onReorder(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    dragNode.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {files.map((file, idx) => {
        const isDragging = dragIdx === idx;
        const isOver    = overIdx === idx && dragIdx !== idx;

        return (
          <div
            key={`${file.name}-${file.size}`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnter={(e) => handleDragEnter(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              border: `1.5px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
              background: isOver ? "var(--accent-light)" : "var(--bg-white)",
              transition: "border-color 0.15s, background 0.15s",
              cursor: disabled ? "default" : "grab",
              opacity: isDragging ? 0.4 : 1,
              userSelect: "none",
            }}
          >
            {/* Drag handle */}
            {!disabled && (
              <div style={{
                display: "flex", flexDirection: "column", gap: 3,
                padding: "2px 4px", flexShrink: 0, opacity: 0.35,
                cursor: "grab",
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 14, height: 2, borderRadius: 2,
                    background: "var(--text-primary)",
                  }} />
                ))}
              </div>
            )}

            {/* Order badge */}
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "var(--accent-light)",
              border: "1.5px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 11, color: "var(--accent)",
            }}>
              {idx + 1}
            </div>

            {/* PDF icon */}
            <div style={{
              width: 32, height: 32, borderRadius: "var(--radius-sm)",
              background: "#eff6ff", border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 15,
            }}>
              📄
            </div>

            {/* File info */}
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

            {/* Remove */}
            {!disabled && (
              <button
                onClick={() => onRemove(idx)}
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
        );
      })}

      {/* Reorder hint */}
      {!disabled && files.length > 1 && (
        <p style={{
          textAlign: "center", fontSize: 11,
          color: "var(--text-muted)", fontFamily: "var(--font-display)",
          fontWeight: 500, marginTop: 2,
        }}>
          ↕ Drag rows to reorder before merging
        </p>
      )}
    </div>
  );
}
