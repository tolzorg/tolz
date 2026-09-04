import { formatCompactCurrency } from "../../../utils/retirementCalculatorEngine";

const WIDTH = 380;
const HEIGHT = 200;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 10;
const PAD_BOTTOM = 24;

/** Simple hand-rolled SVG line chart for the "Balance by age" comparison
 * — two series (have/need) plotted against age, no charting library
 * needed for two lines. `need` is optional: the reference only draws (and
 * legends) a second "need" line when the current plan falls SHORT of the
 * target — once your plan already meets or exceeds it, it shows only
 * your own plan's trajectory, single-line, no legend. */
export default function BalanceByAgeChart({ have, need, haveLabel, needLabel }) {
  const showNeed = Array.isArray(need) && need.length > 0;
  const allPoints = showNeed ? [...have, ...need] : have;
  if (!allPoints.length) return null;

  const minAge = Math.min(...allPoints.map((p) => p.age));
  const maxAge = Math.max(...allPoints.map((p) => p.age));
  const maxBalance = Math.max(1, ...allPoints.map((p) => p.balance));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (age) => PAD_LEFT + ((age - minAge) / Math.max(1, maxAge - minAge)) * plotW;
  const y = (balance) => PAD_TOP + plotH - (balance / maxBalance) * plotH;

  const toPath = (series) => series.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(2)} ${y(p.balance).toFixed(2)}`).join(" ");

  // Y-axis gridlines at nice round fractions of the max balance
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxBalance);
  // X-axis gridlines every ~10 years
  const xStep = Math.max(1, Math.round((maxAge - minAge) / 4 / 5) * 5);
  const xTicks = [];
  for (let age = Math.ceil(minAge / xStep) * xStep; age <= maxAge; age += xStep) xTicks.push(age);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
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
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />

        <path d={toPath(have)} fill="none" stroke="#3b7bfc" strokeWidth="2" />
        {showNeed && <path d={toPath(need)} fill="none" stroke="#16a34a" strokeWidth="2" />}
      </svg>
      {showNeed && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8, fontSize: 12.5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <span style={{ width: 14, height: 3, background: "#3b7bfc", display: "inline-block", borderRadius: 2 }} />
            {haveLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <span style={{ width: 14, height: 3, background: "#16a34a", display: "inline-block", borderRadius: 2 }} />
            {needLabel}
          </span>
        </div>
      )}
    </div>
  );
}
