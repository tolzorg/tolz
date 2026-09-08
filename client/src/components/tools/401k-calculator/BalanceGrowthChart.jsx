// Stacked bar chart for the 401(k) balance projection — one bar per age,
// stacked Employee contributions / Employer match / Investment returns,
// matching the reference's own chart (colors and legend order confirmed
// against the reference screenshot). Adapted directly from the
// Investment Calculator's own InvestmentBarChart.jsx (same shape of
// problem — a 3-series cumulative stacked bar by period).

const WIDTH = 420;
const HEIGHT = 220;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 40;

export default function BalanceGrowthChart({ chartData }) {
  if (!chartData.length) return null;

  const minAge = chartData[0].age;
  const maxAge = chartData[chartData.length - 1].age;
  const maxValue = Math.max(1, ...chartData.map((p) => p.total));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const span = Math.max(1, maxAge - minAge);

  const x = (age) => PAD_LEFT + ((age - minAge) / span) * plotW;
  const yFor = (value) => PAD_TOP + plotH - (value / maxValue) * plotH;
  const barWidth = Math.max(2, Math.min(18, plotW / chartData.length - 2));

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
  const xStep = Math.max(1, Math.round(span / 5));
  const xTicks = [];
  for (let age = minAge; age <= maxAge; age += xStep) xTicks.push(age);
  if (xTicks[xTicks.length - 1] !== maxAge) xTicks.push(maxAge);

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
        {xTicks.map((age) => (
          <text key={age} x={x(age)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {age}
          </text>
        ))}
        <text x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2} y={HEIGHT - 6} fontSize="10.5" fill="var(--text-secondary)" textAnchor="middle">
          Age
        </text>
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />

        {chartData.map((bar) => {
          const bx = x(bar.age) - barWidth / 2;
          const employeeH = Math.max(0, (bar.employee / maxValue) * plotH);
          const employerH = Math.max(0, (bar.employer / maxValue) * plotH);
          const investH = Math.max(0, (bar.investment / maxValue) * plotH);
          const baseY = PAD_TOP + plotH;
          return (
            <g key={bar.age}>
              <rect x={bx} y={baseY - employeeH} width={barWidth} height={employeeH} fill="#2b7ddb" />
              <rect x={bx} y={baseY - employeeH - employerH} width={barWidth} height={employerH} fill="#8bbc21" />
              <rect x={bx} y={baseY - employeeH - employerH - investH} width={barWidth} height={investH} fill="#910000" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#2b7ddb", display: "inline-block", borderRadius: 2 }} />
          Employee contributions
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#8bbc21", display: "inline-block", borderRadius: 2 }} />
          Employer match
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#910000", display: "inline-block", borderRadius: 2 }} />
          Investment returns
        </span>
      </div>
    </div>
  );
}
