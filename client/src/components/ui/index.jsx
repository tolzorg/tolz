// ── Skeleton loader ──────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, rounded = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: rounded, flexShrink: 0, ...style }}
    />
  );
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ children, type = "muted", style = {} }) {
  return (
    <span className={`badge badge-${type}`} style={style}>
      {children}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────
export function ProgressBar({ pct = 0 }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2.5px solid var(--border)",
        borderTop: "2.5px solid var(--accent)",
        borderRadius: "50%",
        flexShrink: 0,
        animation: "spin 0.75s linear infinite",
      }}
    />
  );
}

// ── Error card ───────────────────────────────────────────────
export function ErrorCard({ message, onRetry }) {
  return (
    <div className="error-box animate-fadeUp">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="8" y1="5" x2="8" y2="9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="#ef4444" />
      </svg>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 500 }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-danger" style={{ marginTop: 10, fontSize: 13 }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Success card ─────────────────────────────────────────────
export function SuccessCard({ children }) {
  return <div className="success-box animate-fadeUp">{children}</div>;
}

// ── Divider with label ───────────────────────────────────────
export function DividerLabel({ label }) {
  return (
    <div className="divider-label">
      <div className="divider" style={{ flex: 1 }} />
      <span>{label}</span>
      <div className="divider" style={{ flex: 1 }} />
    </div>
  );
}
