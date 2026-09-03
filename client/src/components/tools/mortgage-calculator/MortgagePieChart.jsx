// Simple SVG donut chart for the 4-category payment breakdown — no
// charting library needed for 4 static segments.

const RADIUS = 52;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MortgagePieChart({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        {total <= 0 ? (
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--bg-muted)" strokeWidth={STROKE} />
        ) : segments.filter((s) => s.value > 0).map((s) => {
          const fraction = s.value / total;
          const dash = fraction * CIRCUMFERENCE;
          const circle = (
            <circle
              key={s.label}
              cx="70" cy="70" r={RADIUS} fill="none" stroke={s.color} strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
