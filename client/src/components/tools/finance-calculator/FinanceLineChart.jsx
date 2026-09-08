import { formatCompactCurrency } from "../amortization-calculator/chartFormat";

const WIDTH = 460;
const HEIGHT = 240;
const PAD_LEFT = 60;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 30;

/** "Value changes over time" chart — matches the reference's own 4-series
 * line chart exactly (same colors, confirmed from its embedded tooltip
 * markup: PV #2b7ddb, FV #8bbc21, Sum of PMT #910000, Accumulated
 * Interest #1aadce). Series definitions were reverse-engineered from
 * that same tooltip data (`ttlineShowTT(evt, '#hex', 'Name <br>x: $val')`)
 * rather than guessed:
 *   PV               — point 0 is the given PV; point k (1..N-1) is
 *                       schedule row (k+1)'s own `pv` (the balance
 *                       BEFORE that period) — one point short of N
 *                       because there's no "PV" left to report once the
 *                       final period completes.
 *   FV                — schedule row k's `fv`, for k = 1..N (no point 0).
 *   Sum of PMT         — cumulative PMT through row k, for k = 1..N,
 *                        starting from an implicit (0, 0) origin.
 *   Accumulated Interest — cumulative interest through row k, same shape.
 * Unlike the Amortization Calculator's chart (all-positive balances),
 * this one routinely has both positive and negative values (PV/FV are
 * opposite-signed by construction), so the y-axis is scaled around an
 * explicit 0 line rather than assuming the bottom of the plot is 0. */
export default function FinanceLineChart({ schedule, pv }) {
  if (!schedule.length) return null;

  const pvPoints = [{ x: 0, y: pv }, ...schedule.slice(0, -1).map((row, i) => ({ x: i + 1, y: schedule[i + 1].pv }))];
  const fvPoints = schedule.map((row) => ({ x: row.period, y: row.fv }));
  const runningSum = (key) => schedule.reduce((acc, row) => {
    const total = acc.length ? acc[acc.length - 1].y + row[key] : row[key];
    return [...acc, { x: row.period, y: total }];
  }, []);
  const pmtPoints = [{ x: 0, y: 0 }, ...runningSum("pmt")];
  const interestPoints = [{ x: 0, y: 0 }, ...runningSum("interest")];

  const allValues = [...pvPoints, ...fvPoints, ...pmtPoints, ...interestPoints].map((p) => p.y);
  const extent = Math.max(1, ...allValues.map((v) => Math.abs(v)));
  const maxX = Math.max(...schedule.map((row) => row.period));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (period) => PAD_LEFT + (period / maxX) * plotW;
  const y = (value) => PAD_TOP + plotH / 2 - (value / extent) * (plotH / 2);
  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.x).toFixed(2)} ${y(p.y).toFixed(2)}`).join(" ");

  const yTicks = [-extent, -extent / 2, 0, extent / 2, extent];
  const xStep = Math.max(1, Math.round(maxX / 5));
  const xTicks = [];
  for (let period = 0; period <= maxX; period += xStep) xTicks.push(period);
  if (xTicks[xTicks.length - 1] !== maxX) xTicks.push(Math.round(maxX));

  const series = [
    { points: pvPoints, color: "#2b7ddb", label: "PV" },
    { points: fvPoints, color: "#8bbc21", label: "FV" },
    { points: pmtPoints, color: "#910000", label: "Sum of PMT" },
    { points: interestPoints, color: "#1aadce", label: "Accumulated Interest" },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 500, display: "block", margin: "0 auto" }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={y(v)} x2={WIDTH - PAD_RIGHT} y2={y(v)} stroke={v === 0 ? "var(--text-muted)" : "var(--border)"} strokeWidth={v === 0 ? "1" : "0.5"} />
            <text x={PAD_LEFT - 6} y={y(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {formatCompactCurrency(v)}
            </text>
          </g>
        ))}
        {xTicks.map((period) => (
          <text key={period} x={x(period)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {period}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.label} d={toPath(s.points)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
        {series.map((s) => s.points.map((p) => (
          <circle key={`${s.label}-${p.x}`} cx={x(p.x)} cy={y(p.y)} r="2.2" fill={s.color} />
        )))}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
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
