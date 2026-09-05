// Stacked bar chart for the Accumulation Schedule — one bar per year,
// stacked Starting Amount / Contributions / Interest, matching the
// reference's own chart (a static rendering here, no hover tooltips,
// consistent with the other hand-rolled SVG charts in this app).

const WIDTH = 420;
const HEIGHT = 220;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 40;

export default function InvestmentBarChart({ barData }) {
  if (!barData.length) return null;

  const maxYear = Math.max(...barData.map((p) => p.year));
  const maxValue = Math.max(1, ...barData.map((p) => p.total));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (year) => PAD_LEFT + (year / Math.max(1, maxYear)) * plotW;
  const yFor = (value) => PAD_TOP + plotH - (value / maxValue) * plotH;
  const barWidth = Math.max(2, Math.min(18, plotW / barData.length - 2));

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
  const xStep = Math.max(1, Math.round(maxYear / 5));
  const xTicks = [];
  for (let yr = 0; yr <= maxYear; yr += xStep) xTicks.push(yr);
  if (xTicks[xTicks.length - 1] !== Math.round(maxYear)) xTicks.push(Math.round(maxYear));

  function formatCompact(value) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
    if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={yFor(v)} x2={WIDTH - PAD_RIGHT} y2={yFor(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_LEFT - 6} y={yFor(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {formatCompact(v)}
            </text>
          </g>
        ))}
        {xTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {yr}
          </text>
        ))}
        <text x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2} y={HEIGHT - 6} fontSize="10.5" fill="var(--text-secondary)" textAnchor="middle">
          Year
        </text>
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />

        {barData.map((bar) => {
          const bx = x(bar.year) - barWidth / 2;
          // Interest can be NEGATIVE (a Return Rate solve can legitimately
          // land on a negative annual rate — see investment-calculator-
          // notes.md) — SVG rejects a negative `height` outright, so each
          // segment is clamped to zero for rendering. This slightly
          // understates the total bar height in that edge case rather
          // than drawing a below-baseline segment, a reasonable tradeoff
          // for a rare corner case (the exact figure is still shown
          // correctly in the results table and pie chart either way).
          const startingH = Math.max(0, (bar.startingAmount / maxValue) * plotH);
          const contribH = Math.max(0, (bar.contributions / maxValue) * plotH);
          const interestH = Math.max(0, (bar.interest / maxValue) * plotH);
          const baseY = PAD_TOP + plotH;
          return (
            <g key={bar.year}>
              <rect x={bx} y={baseY - startingH} width={barWidth} height={startingH} fill="#2b7ddb" />
              <rect x={bx} y={baseY - startingH - contribH} width={barWidth} height={contribH} fill="#8bbc21" />
              <rect x={bx} y={baseY - startingH - contribH - interestH} width={barWidth} height={interestH} fill="#910000" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#2b7ddb", display: "inline-block", borderRadius: 2 }} />
          Starting Amount
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#8bbc21", display: "inline-block", borderRadius: 2 }} />
          Contributions
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#910000", display: "inline-block", borderRadius: 2 }} />
          Interest
        </span>
      </div>
    </div>
  );
}
