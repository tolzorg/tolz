// Donut chart for the "Payment Breakdown" (Principal/Interest), with
// percentage labels placed OUTSIDE the ring next to each arc (matching
// the reference's own chart exactly) rather than in the side legend.
// Adapted directly from the Amortization Calculator's own
// AmortizationPieChart.jsx (identical chart on the same reference site).

const SIZE = 160;
const CENTER = SIZE / 2;
const RADIUS = 52;
const STROKE = 30;
const LABEL_RADIUS = RADIUS + STROKE / 2 + 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function InterestRatePieChart({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;
  const arcs = [];
  const labels = [];

  if (total > 0) {
    for (const s of segments.filter((x) => x.value > 0)) {
      const fraction = s.value / total;
      const dash = fraction * CIRCUMFERENCE;
      arcs.push(
        <circle
          key={s.label}
          cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={s.color} strokeWidth={STROKE}
          strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
          strokeDashoffset={-offset}
        />
      );
      const midFraction = (offset + dash / 2) / CIRCUMFERENCE;
      const angleRad = (midFraction * 360 - 90) * (Math.PI / 180);
      const x = CENTER + LABEL_RADIUS * Math.cos(angleRad);
      const y = CENTER + LABEL_RADIUS * Math.sin(angleRad);
      labels.push(
        <span
          key={s.label}
          style={{
            position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)",
            fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap",
          }}
        >
          {Math.round(fraction * 100)}%
        </span>
      );
      offset += dash;
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: "rotate(-90deg)" }}>
          {total <= 0 ? (
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--bg-muted)" strokeWidth={STROKE} />
          ) : arcs}
        </svg>
        {labels}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <span style={{ width: 13, height: 13, borderRadius: 3, background: s.color, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
