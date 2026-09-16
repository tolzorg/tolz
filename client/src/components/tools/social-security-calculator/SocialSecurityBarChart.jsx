// "Value comparison of application ages" chart — one bar per candidate
// application age (62-70), height = relative value (0-100%), matching
// the reference's own single-series bar chart exactly (bar color
// #2b7ddb, y-axis labeled in 25% increments).

const WIDTH = 420;
const HEIGHT = 220;
const PAD_LEFT = 40;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 32;

export default function SocialSecurityBarChart({ points }) {
  if (!points.length) return null;

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const barWidth = Math.min(34, (plotW / points.length) * 0.6);
  const gap = plotW / points.length;

  const x = (i) => PAD_LEFT + gap * i + gap / 2;
  const yFor = (pct) => PAD_TOP + plotH - (pct / 100) * plotH;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={yFor(v)} x2={WIDTH - PAD_RIGHT} y2={yFor(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_LEFT - 6} y={yFor(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {v}%
            </text>
          </g>
        ))}
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />
        {points.map((p, i) => {
          const barH = Math.max(0, (p.relativeValue / 100) * plotH);
          return (
            <g key={p.age}>
              <rect x={x(i) - barWidth / 2} y={PAD_TOP + plotH - barH} width={barWidth} height={barH} fill="#2b7ddb" />
              <text x={x(i)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10.5" fill="var(--text-muted)" textAnchor="middle">
                {p.age}
              </text>
            </g>
          );
        })}
        <text x={PAD_LEFT + plotW / 2} y={HEIGHT - 2} fontSize="11" fill="var(--text-secondary)" textAnchor="middle">
          Application age
        </text>
      </svg>
    </div>
  );
}
