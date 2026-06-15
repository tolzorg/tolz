import { useCallback, useRef, useState } from "react";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

export default function DropZone({ onFiles, compact = false, disabled = false, currentCount = 0, maxFiles = 10 }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (--dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (!disabled && e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }, [disabled, onFiles]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      onFiles(e.target.files);
      e.target.value = "";
    }
  }, [onFiles]);

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const remaining = maxFiles - currentCount;

  if (compact) {
    return (
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || remaining <= 0}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border-hover)"}`,
            background: dragging ? "var(--accent-light)" : "var(--bg-muted)",
            color: dragging ? "var(--accent)" : "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            cursor: disabled || remaining <= 0 ? "not-allowed" : "pointer",
            transition: "all var(--transition)",
            opacity: disabled ? 0.5 : 1,
            width: "100%",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {remaining > 0
            ? `Add more images (${remaining} slot${remaining === 1 ? "" : "s"} left)`
            : "Maximum 10 images reached"}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: "none" }} onChange={handleFileInput} />
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openPicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openPicker()}
      aria-label="Upload images"
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-hover)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "48px 24px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: dragging ? "var(--accent-light)" : "var(--bg-white)",
        transition: "all var(--transition)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity: disabled ? 0.6 : 1,
        outline: "none",
      }}
    >
      {/* Upload icon */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "var(--radius-lg)",
          background: dragging ? "rgba(59,123,252,0.12)" : "var(--bg-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all var(--transition)",
          border: dragging ? "1.5px solid rgba(59,123,252,0.25)" : "1.5px solid transparent",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M4.5 18V20a2 2 0 002 2h13a2 2 0 002-2v-2"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13 4v13M9 8l4-4 4 4"
            stroke={dragging ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            color: dragging ? "var(--accent)" : "var(--text-primary)",
            transition: "color var(--transition)",
          }}
        >
          {dragging ? "Drop images here" : "Drag & drop images here"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          or{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>click to browse</span>{" "}
          your files
        </p>
      </div>

      {/* Format + limit pills */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
        {["JPEG", "PNG", "WebP"].map((fmt) => (
          <span
            key={fmt}
            style={{
              padding: "3px 10px",
              borderRadius: 99,
              background: "var(--bg-muted)",
              color: "var(--text-muted)",
              fontSize: 11,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              border: "1px solid var(--border)",
            }}
          >
            {fmt}
          </span>
        ))}
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            fontSize: 11,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            border: "1px solid var(--border)",
          }}
        >
          Up to {maxFiles} images
        </span>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            fontSize: 11,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            border: "1px solid var(--border)",
          }}
        >
          Max 15 MB each
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        style={{ display: "none" }}
        onChange={handleFileInput}
      />
    </div>
  );
}
