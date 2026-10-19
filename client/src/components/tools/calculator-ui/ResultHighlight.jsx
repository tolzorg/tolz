// Highlighted result pieces shared by the calculators: a tinted summary panel
// with the main value large and a coloured status badge, and label / value
// rows for the details.

// Light badge colours (yellows) need dark text.
const LIGHT = new Set(["#ffe400", "#d8c419", "#ffd400"]);

/**
 * @param {{ label: string, value: React.ReactNode, unit?: React.ReactNode, color: string,
 *   badge?: React.ReactNode, note?: React.ReactNode }} props  color is a #rrggbb hex.
 */
export function HighlightSummary({ label, value, unit, color, badge, note }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        padding: "14px 16px", marginBottom: 12, borderRadius: "var(--radius-md)",
        background: `${color}1a`, border: `1px solid ${color}55`, borderLeft: `5px solid ${color}`,
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-secondary)" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{value}</span>
          {unit && <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{unit}</span>}
        </div>
      </div>
      {(badge || note) && (
        <div style={{ textAlign: "right" }}>
          {badge && (
            <span
              style={{
                display: "inline-block", padding: "6px 14px", borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                background: color, color: LIGHT.has(color) ? "#1a1a2e" : "#fff",
              }}
            >
              {badge}
            </span>
          )}
          {note && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 5 }}>{note}</div>}
        </div>
      )}
    </div>
  );
}

/** One label / value line of a details list; `tone` (#rrggbb) highlights it. */
export function StatRow({ label, children, tone }) {
  return (
    <div
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap",
        padding: "9px 12px", borderBottom: "1px solid var(--border)", fontSize: 14,
        background: tone ? `${tone}14` : undefined, borderLeft: tone ? `3px solid ${tone}` : "3px solid transparent",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong style={{ color: "var(--text-primary)", textAlign: "right", overflowWrap: "anywhere" }}>{children}</strong>
    </div>
  );
}

/** Wraps StatRows with the top border. */
export function StatList({ children }) {
  return <div style={{ marginTop: 12, borderTop: "1px solid var(--border)" }}>{children}</div>;
}
