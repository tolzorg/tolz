import { Spinner } from "../../ui";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncateName(name, max = 28) {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  if (dot > 0) {
    const ext = name.slice(dot);
    return `${name.slice(0, max - ext.length - 3)}…${ext}`;
  }
  return `${name.slice(0, max - 1)}…`;
}

function SavingsBadge({ savings }) {
  const pct = parseFloat(savings);
  if (isNaN(pct) || pct <= 0) {
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 99,
          background: "var(--bg-muted)",
          color: "var(--text-muted)",
          fontSize: 11,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
        }}
      >
        Already optimized
      </span>
    );
  }

  const isGreat = pct > 50;
  const isGood  = pct > 20;
  const color   = isGreat ? "var(--success)"  : isGood ? "var(--warning)"       : "var(--text-muted)";
  const bg      = isGreat ? "var(--success-light)" : isGood ? "var(--warning-light)" : "var(--bg-muted)";

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 99,
        background: bg,
        color,
        fontSize: 11,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
      }}
    >
      ↓ {pct.toFixed(1)}% saved
    </span>
  );
}

export default function ImageResultCard({ image, onDownload, onRemove, isCompressing }) {
  return (
    <div
      className="card"
      style={{
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        opacity: image.status === "compressing" ? 0.75 : 1,
        transition: "opacity var(--transition)",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--bg-muted)",
          border: "1px solid var(--border)",
        }}
      >
        <img
          src={image.preview}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={image.name}
        >
          {truncateName(image.name)}
        </span>

        {/* Status row */}
        {image.status === "pending" && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {formatBytes(image.originalSize)}
          </span>
        )}

        {image.status === "compressing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Spinner size={12} />
            <span
              style={{
                fontSize: 12,
                color: "var(--accent)",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              Compressing…
            </span>
          </div>
        )}

        {image.status === "done" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>
                {formatBytes(image.originalSize)}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>→</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {formatBytes(image.compressedSize)}
              </span>
              <SavingsBadge savings={image.savings} />
            </div>
            {image.wasResized && image.outputWidth && (
              <span style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}>
                ↔ {image.outputWidth}×{image.outputHeight}px
              </span>
            )}
          </>
        )}

        {image.status === "error" && (
          <span style={{ fontSize: 12, color: "var(--error)" }}>
            ✕ {image.error || "Processing failed"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {/* Download button */}
        {image.status === "done" && (
          <button
            onClick={() => onDownload(image)}
            className="btn btn-secondary"
            style={{ padding: "7px 12px", fontSize: 12 }}
            title="Download compressed image"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v7M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Save
          </button>
        )}

        {/* Remove button */}
        {!isCompressing && (
          <button
            onClick={() => onRemove(image.id)}
            aria-label="Remove image"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: 99,
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff0f0";
              e.currentTarget.style.color = "var(--error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
