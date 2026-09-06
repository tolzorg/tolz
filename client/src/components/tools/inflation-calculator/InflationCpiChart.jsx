// Single-series line chart for "Purchasing power of $X over time" —
// matches the reference's own single-blue-line chart. `points` is the
// engine's `chart` array: [{ year, month, value }, ...], one per real
// calendar month spanning the chronologically earlier to later period.

const WIDTH = 500;
const HEIGHT = 220;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 34;

function formatCompact(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function InflationCpiChart({ points }) {
  if (!points || points.length < 2) return null;

  const minValue = Math.min(...points.map((p) => p.value));
  const maxValue = Math.max(...points.map((p) => p.value));
  const pad = Math.max(1, (maxValue - minValue) * 0.1);
  const yMin = Math.max(0, minValue - pad);
  const yMax = maxValue + pad;

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const n = points.length;
  const x = (i) => PAD_LEFT + (i / Math.max(1, n - 1)) * plotW;
  const y = (value) => PAD_TOP + plotH - ((value - yMin) / Math.max(1e-9, yMax - yMin)) * plotH;

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMin + f * (yMax - yMin));

  // Year tick marks: label the first point of each year that appears,
  // thinned out so labels don't overlap on a long multi-decade span.
  const yearFirstIndex = new Map();
  points.forEach((p, i) => { if (!yearFirstIndex.has(p.year)) yearFirstIndex.set(p.year, i); });
  const years = [...yearFirstIndex.keys()];
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(years.length / maxLabels));
  const xTicks = years.filter((_, i) => i % step === 0).map((yr) => ({ year: yr, i: yearFirstIndex.get(yr) }));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 560, display: "block", margin: "0 auto" }}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD_LEFT} y1={y(v)} x2={WIDTH - PAD_RIGHT} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
          <text x={PAD_LEFT - 6} y={y(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
            {formatCompact(v)}
          </text>
        </g>
      ))}
      {xTicks.map(({ year, i }) => (
        <text key={year} x={x(i)} y={HEIGHT - PAD_BOTTOM + 16} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
          {year}
        </text>
      ))}
      <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" />
    </svg>
  );
}
