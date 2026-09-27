import { formatCompactCurrency } from "../amortization-calculator/chartFormat";

const WIDTH = 420;
const HEIGHT = 220;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 40;

/** Hand-rolled SVG line chart for the "Annuity Balances" chart — exactly
 * two series plotted against year: the declining remaining Balance
 * (starting at `startingPrincipal`) and the RUNNING TOTAL of
 * Interest/return earned so far (starting at $0) — matching the
 * reference's own chart exactly, including its colors (#2b7ddb / #8bbc21,
 * the same palette as the accumulation Annuity Calculator's own charts).
 * Same structure as AmortizationLineChart, but with only 2 series (no
 * "Payment" line) and this calculator's own colors/labels.
 *
 * `xKey`/`xLabel`/`interestLabel` are optional overrides (all default to
 * the Annuity Payout Calculator's own "year"/"Year"/"Interest/return") —
 * added so the Credit Card Calculator's identically-structured chart
 * (month-granularity, "Interest" not "Interest/return") can reuse this
 * component instead of duplicating it. */
export default function AnnuityPayoutLineChart({ lineData, startingPrincipal, xKey = "year", xLabel = "Year", interestLabel = "Interest/return" }) {
  if (!lineData.length) return null;

  const maxYear = Math.max(...lineData.map((p) => p[xKey]));
  const maxValue = Math.max(1, startingPrincipal, ...lineData.map((p) => Math.max(p.balance, p.interest)));

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (year) => PAD_LEFT + (year / Math.max(1, maxYear)) * plotW;
  const y = (value) => PAD_TOP + plotH - (value / maxValue) * plotH;

  const toPath = (key) => lineData.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p[xKey]).toFixed(2)} ${y(p[key]).toFixed(2)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
  const xStep = Math.max(1, Math.round(maxYear / 5));
  const xTicks = [];
  for (let yr = 0; yr <= maxYear; yr += xStep) xTicks.push(yr);
  // Append the exact final point only if it's far enough from the last
  // regular tick to read cleanly — otherwise replace that tick instead of
  // adding a second one right next to it (was overlapping into "6062" for
  // a maxYear like 62 with an xStep of 12).
  const lastTick = xTicks[xTicks.length - 1];
  if (lastTick !== maxYear) {
    if (maxYear - lastTick < xStep / 2) xTicks[xTicks.length - 1] = maxYear;
    else xTicks.push(maxYear);
  }

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
          {xLabel}
        </text>
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />

        <path d={toPath("balance")} fill="none" stroke="#2b7ddb" strokeWidth="2.5" />
        <path d={toPath("interest")} fill="none" stroke="#8bbc21" strokeWidth="2.5" />
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8, fontSize: 12.5, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#2b7ddb", display: "inline-block", borderRadius: 2 }} />
          Balance
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <span style={{ width: 14, height: 3, background: "#8bbc21", display: "inline-block", borderRadius: 2 }} />
          {interestLabel}
        </span>
      </div>
    </div>
  );
}
