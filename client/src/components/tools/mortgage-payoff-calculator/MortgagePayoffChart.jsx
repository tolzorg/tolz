import { formatCompactCurrency } from "../amortization-calculator/chartFormat";

const WIDTH = 460;
const HEIGHT = 240;
const PAD_LEFT = 55;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 30;

/** Turns a monthly schedule into yearly (Balance, cumulative Interest)
 * sample points, offset by `startYear` on the x-axis — mirrors the
 * reference's own chart mechanics exactly: it keeps ONE shared x-axis
 * running from year 0 (the ORIGINAL loan's start), and positions the
 * "new" schedule starting at whatever year "now" actually is (elapsed
 * time), not at year 0 — confirmed from its own chart-building JS,
 * which offsets the new schedule's index by `ctotalMonthSoFar` before
 * plotting. Interest is CUMULATIVE (running total), not the per-month
 * amount — confirmed since the reference's own "Interest" line rises
 * monotonically across the full term rather than mirroring the
 * strictly-declining per-month interest portion. */
function toYearlyPoints(schedule, startYear = 0) {
  if (!schedule || !schedule.length) return { balance: [{ x: startYear, y: 0 }], interest: [{ x: startYear, y: 0 }] };
  const startBalance = schedule[0].balance + schedule[0].principal;
  const balance = [{ x: startYear, y: startBalance }];
  const interest = [{ x: startYear, y: 0 }];
  let cumInterest = 0;
  for (let i = 0; i < schedule.length; i++) {
    cumInterest += schedule[i].interest;
    if ((i + 1) % 12 === 0 || i === schedule.length - 1) {
      const x = startYear + (i + 1) / 12;
      balance.push({ x, y: schedule[i].balance });
      interest.push({ x, y: cumInterest });
    }
  }
  return { balance, interest };
}

/** 2-line (Balance/Interest) or 4-line (Old Balance/Old Interest/New
 * Balance/New Interest) chart, matching the reference's own colors and
 * shared-timeline layout. `newSchedule`/`elapsedYears` are omitted for
 * "Payback altogether"/"Normal repayment" (2-line mode). */
export default function MortgagePayoffChart({ oldSchedule, newSchedule, elapsedYears = 0 }) {
  const old = toYearlyPoints(oldSchedule, 0);
  const hasNew = Array.isArray(newSchedule) && newSchedule.length > 0;
  const fresh = hasNew ? toYearlyPoints(newSchedule, elapsedYears) : null;

  const maxX = Math.max(
    ...old.balance.map((p) => p.x),
    ...(fresh ? fresh.balance.map((p) => p.x) : [0]),
  );
  const maxY = Math.max(
    1,
    ...old.balance.map((p) => p.y), ...old.interest.map((p) => p.y),
    ...(fresh ? [...fresh.balance.map((p) => p.y), ...fresh.interest.map((p) => p.y)] : []),
  );

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const x = (year) => PAD_LEFT + (year / Math.max(1, maxX)) * plotW;
  const y = (value) => PAD_TOP + plotH - (value / maxY) * plotH;
  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.x).toFixed(2)} ${y(p.y).toFixed(2)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);
  const xStep = Math.max(1, Math.round(maxX / 6));
  const xTicks = [];
  for (let yr = 0; yr <= maxX; yr += xStep) xTicks.push(yr);
  if (xTicks[xTicks.length - 1] !== Math.round(maxX)) xTicks.push(Math.round(maxX));

  const series = hasNew
    ? [
        { points: old.balance, color: "#2b7ddb", label: "Old Balance" },
        { points: old.interest, color: "#333333", label: "Old Interest" },
        { points: fresh.balance, color: "#71a831", label: "New Balance" },
        { points: fresh.interest, color: "#c0392b", label: "New Interest" },
      ]
    : [
        { points: old.balance, color: "#2b7ddb", label: "Balance" },
        { points: old.interest, color: "#333333", label: "Interest" },
      ];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: 500, display: "block", margin: "0 auto" }}>
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
            {yr}yr
          </text>
        ))}
        <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="var(--text-muted)" strokeWidth="0.5" />
        {series.map((s) => (
          <path key={s.label} d={toPath(s.points)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
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
