import { formatCompactCurrency } from "../amortization-calculator/chartFormat";

// "Equivalent present value of the options" chart — matches the
// reference's own 2-series line chart (colors #2b7ddb / #8bbc21, same
// as its embedded tooltip markup), x-axis "Life expectancy (age)".

const WIDTH = 460;
const HEIGHT = 260;
const PAD_LEFT = 60;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 30;

export default function PensionLineChart({ series }) {
  const allPoints = series.flatMap((s) => s.points);
  if (!allPoints.length) return null;

  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const maxY = Math.max(1, ...allPoints.map((p) => p.y));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (age) => PAD_LEFT + ((age - minX) / (maxX - minX || 1)) * plotW;
  const y = (value) => PAD_TOP + plotH - (value / maxY) * plotH;
  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.x).toFixed(2)} ${y(p.y).toFixed(2)}`).join(" ");

  const yTicks = [0, maxY / 4, maxY / 2, (maxY * 3) / 4, maxY];
  const xStep = Math.max(1, Math.round((maxX - minX) / 5 / 10) * 10);
  const xTicks = [];
  for (let age = Math.ceil(minX / 10) * 10; age <= maxX; age += xStep) xTicks.push(age);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 480, display: "block", margin: "0 auto" }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={y(v)} x2={WIDTH - PAD_RIGHT} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_LEFT - 6} y={y(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {formatCompactCurrency(v)}
            </text>
          </g>
        ))}
        {xTicks.map((age) => (
          <text key={age} x={x(age)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {age}
          </text>
        ))}
        <text x={PAD_LEFT + plotW / 2} y={HEIGHT - 2} fontSize="11" fill="var(--text-secondary)" textAnchor="middle">
          Life expectancy (age)
        </text>
        {series.map((s) => (
          <path key={s.label} d={toPath(s.points)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6, fontSize: 12.5, flexWrap: "wrap" }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <span style={{ width: 14, height: 3, background: s.color, display: "inline-block", borderRadius: 2 }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
