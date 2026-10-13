// Grouped (side-by-side) bar chart of Book Value and Depreciation Amount per
// year, matching the reference's own chart: year 0 shows the cost and no
// depreciation, then one pair of bars per schedule row, in the reference's
// colours (#2b7ddb / #8bbc21). A static SVG like the app's other charts.

const WIDTH = 460;
const HEIGHT = 230;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 40;
const SERIES = [
  { key: "bookValue", label: "Book Value", color: "#2b7ddb" },
  { key: "amount", label: "Depreciation Amount", color: "#8bbc21" },
];

/** A round axis step (1, 2, 2.5 or 5 × a power of ten) giving about five gridlines. */
function niceStep(max) {
  const rough = max / 5;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  return ([1, 2, 2.5, 5, 10].find((c) => c >= norm) ?? 10) * mag;
}

/** "$0", "$2.5K", "$1.25M" — axis labels like the reference's. */
function formatAxis(value) {
  const trim = (x) => String(Number(x.toFixed(2)));
  if (value >= 1e6) return `$${trim(value / 1e6)}M`;
  if (value >= 1e3) return `$${trim(value / 1e3)}K`;
  return `$${trim(value)}`;
}

export default function DepreciationBarChart({ points }) {
  if (!points.length) return null;
  const dataMax = Math.max(1, ...points.map((p) => Math.max(p.bookValue, p.amount)));
  const step = niceStep(dataMax);
  const maxValue = Math.ceil(dataMax / step) * step;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = plotW / points.length;
  const barWidth = Math.max(1.5, Math.min(22, slot * 0.38));
  const baseY = PAD_TOP + plotH;
  const yFor = (value) => baseY - (value / maxValue) * plotH;
  const yTicks = Array.from({ length: Math.round(maxValue / step) + 1 }, (_, i) => i * step);
  // Label every slot when they fit; thin out labels on long schedules.
  const labelEvery = Math.max(1, Math.ceil(points.length / 16));

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 520, display: "block", margin: "0 auto" }} role="img" aria-label="Book value and depreciation amount by year">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={yFor(v)} x2={WIDTH - PAD_RIGHT} y2={yFor(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_LEFT - 6} y={yFor(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {formatAxis(v)}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const center = PAD_LEFT + (i + 0.5) * slot;
          return (
            <g key={p.x}>
              {SERIES.map((s, k) => {
                // SVG rejects a negative height; a negative amount (possible
                // in the reference's own odd final rows) is drawn as zero.
                const h = Math.max(0, (p[s.key] / maxValue) * plotH);
                return <rect key={s.key} x={center - barWidth + k * barWidth} y={baseY - h} width={barWidth} height={h} fill={s.color} />;
              })}
              {i % labelEvery === 0 && (
                <text x={center} y={baseY + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">{p.x}</text>
              )}
            </g>
          );
        })}
        <line x1={PAD_LEFT} y1={baseY} x2={WIDTH - PAD_RIGHT} y2={baseY} stroke="var(--text-muted)" strokeWidth="0.5" />
        <text x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2} y={HEIGHT - 6} fontSize="10.5" fill="var(--text-secondary)" textAnchor="middle">Year</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
        {SERIES.map((s) => (
          <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <span style={{ width: 14, height: 6, background: s.color, display: "inline-block", borderRadius: 1 }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
