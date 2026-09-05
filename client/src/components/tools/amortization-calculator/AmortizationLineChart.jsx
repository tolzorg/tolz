import { formatCompactCurrency } from "./chartFormat";

const WIDTH = 420;
const HEIGHT = 220;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 40;

/** Hand-rolled SVG line chart for the amortization "Balance / Interest /
 * Payment" chart — three series plotted against loan year: the declining
 * remaining balance (starting at `loanAmount`), and the two RUNNING
 * TOTALS (cumulative interest paid, cumulative total payments made, both
 * starting at $0) — matching the reference's own chart exactly (running
 * totals, not each year's individual interest/payment amount). */
export default function AmortizationLineChart({ series, loanAmount, termLabel = "Year" }) {
  if (!series.length) return null;

  const minYear = 0;
  const maxYear = Math.max(...series.map((p) => p.year));
  const maxValue = Math.max(1, loanAmount, ...series.map((p) => Math.max(p.balance, p.interest, p.payment)));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (year) => PAD_LEFT + ((year - minYear) / Math.max(1, maxYear - minYear)) * plotW;
  const y = (value) => PAD_TOP + plotH - (value / maxValue) * plotH;

  const withOrigin = (key, originValue) => [{ year: 0, value: originValue }, ...series.map((p) => ({ year: p.year, value: p[key] }))];
  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(2)} ${y(p.value).toFixed(2)}`).join(" ");

  const balancePoints = withOrigin("balance", loanAmount);
  const interestPoints = withOrigin("interest", 0);
  const paymentPoints = withOrigin("payment", 0);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
  const xStep = Math.max(1, Math.round(maxYear / 5));
  const xTicks = [];
  for (let yr = 0; yr <= maxYear; yr += xStep) xTicks.push(yr);
  if (xTicks[xTicks.length - 1] !== maxYear) xTicks.push(maxYear);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} y1={y(v)} x2={WIDTH - PAD_RIGHT} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_LEFT - 6} y={y(v)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">
              {formatCompactCurrency(v)}
            </text>
          </g>
        ))}
        {xTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={HEIGHT - PAD_BOTTOM + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {yr}
          </text>
        ))}
        <text x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2} y={HEIGHT - 6} fontSize="10.5" fill="var(--text-secondary)" textAnchor="middle">
          {termLabel}
        </text>
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />

        <path d={toPath(paymentPoints)} fill="none" stroke="#b91c1c" strokeWidth="2" />
        <path d={toPath(balancePoints)} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={toPath(interestPoints)} fill="none" stroke="#16a34a" strokeWidth="2" />
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#2563eb", display: "inline-block", borderRadius: 2 }} />
          Balance
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#16a34a", display: "inline-block", borderRadius: 2 }} />
          Interest
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#b91c1c", display: "inline-block", borderRadius: 2 }} />
          Payment
        </span>
      </div>
    </div>
  );
}
