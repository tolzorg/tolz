const BAR_COLORS = ["#3b7bfc", "#22c55e", "#f59e0b", "#f97316", "#ef4444"];

export default function DistributionChart({ distribution }) {
  const max = Math.max(1, ...distribution.map((b) => b.count));

  return (
    <div role="img" aria-label={`Sentence length distribution: ${distribution.map((b) => `${b.label} ${b.count}`).join(", ")}`}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: 140,
          padding: "0 4px",
        }}
      >
        {distribution.map((b, i) => {
          const heightPct = Math.round((b.count / max) * 100);
          return (
            <div key={b.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {b.count}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 44,
                  height: `${Math.max(heightPct, b.count > 0 ? 4 : 1)}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  borderRadius: "6px 6px 2px 2px",
                  opacity: b.count > 0 ? 1 : 0.15,
                  transition: "height 0.25s ease",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "10px 4px 0", borderTop: "1px solid var(--border)" }}>
        {distribution.map((b) => (
          <div key={b.key} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {b.label}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{b.range}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{b.percent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
