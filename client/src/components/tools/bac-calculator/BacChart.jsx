// "BAC Change with Time": the past (blue) and future (green) BAC lines, as on the reference, with a dot and
// a tooltip on every point. Axis steps are "nice" numbers (1, 2, 5 × 10ⁿ) so long timelines stay readable.

const WIDTH = 420;
const HEIGHT = 210;
const PAD = { left: 48, right: 12, top: 14, bottom: 34 };
const PAST = "#2b7ddb";
const FUTURE = "#8bbc21";

function niceStep(max, target) {
  const raw = max / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
const hourText = (t) => `${+t.toFixed(3)}h`;

export default function BacChart({ past, future }) {
  const all = [...past, ...future];
  const maxT = Math.max(...all.map((p) => p.t));
  const maxB = Math.max(...all.map((p) => p.bac));
  const tStep = niceStep(Math.max(maxT, 1), 5);
  const bStep = niceStep(maxB || 0.01, 5);
  const tMax = Math.ceil(maxT / tStep) * tStep;
  const bMax = Math.ceil(maxB / bStep) * bStep;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (t) => PAD.left + (t / tMax) * plotW;
  const y = (b) => PAD.top + plotH - (b / bMax) * plotH;
  const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"} ${x(p.t).toFixed(2)} ${y(p.bac).toFixed(2)}`).join(" ");
  const ticks = (max, step) => Array.from({ length: Math.round(max / step) + 1 }, (_, i) => +(i * step).toPrecision(10));
  const dots = (pts, color, name) => pts.map((p, i) => (
    <circle key={`${name}${i}`} cx={x(p.t)} cy={y(p.bac)} r="3.5" fill={color}>
      <title>{`${name} — Time: ${hourText(p.t)}, BAC: ${p.bac.toFixed(3)}%`}</title>
    </circle>
  ));
  // Very long timelines: dots only at the ends of each line.
  const ends = (pts) => (pts.length > 60 ? [pts[0], pts[pts.length - 1]] : pts);

  return (
    <figure style={{ margin: "6px auto 0", maxWidth: 440 }}>
      <figcaption style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>BAC Change with Time</figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="BAC over time: past and future" style={{ display: "block" }}>
        {ticks(bMax, bStep).map((b) => (
          <g key={`b${b}`}>
            <line x1={PAD.left} y1={y(b)} x2={WIDTH - PAD.right} y2={y(b)} stroke="var(--border)" strokeWidth="0.6" />
            <text x={PAD.left - 5} y={y(b)} fontSize="10" fill="var(--text-muted)" textAnchor="end" dominantBaseline="middle">{b}</text>
          </g>
        ))}
        {ticks(tMax, tStep).map((t) => (
          <g key={`t${t}`}>
            <line x1={x(t)} y1={PAD.top} x2={x(t)} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth="0.6" />
            <text x={x(t)} y={PAD.top + plotH + 13} fontSize="10" fill="var(--text-muted)" textAnchor="middle">{t}h</text>
          </g>
        ))}
        <text x={PAD.left + plotW / 2} y={HEIGHT - 3} fontSize="11" fill="var(--text-secondary)" textAnchor="middle">Time</text>
        <text x="11" y={PAD.top + plotH / 2} fontSize="11" fill="var(--text-secondary)" textAnchor="middle" transform={`rotate(-90 11 ${PAD.top + plotH / 2})`}>BAC (%)</text>
        <path d={path(past)} fill="none" stroke={PAST} strokeWidth="3" />
        <path d={path(future)} fill="none" stroke={FUTURE} strokeWidth="3" />
        {dots(ends(past), PAST, "Past")}
        {dots(ends(future), FUTURE, "Future")}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
        {[[PAST, "Past"], [FUTURE, "Future"]].map(([color, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 3, background: color, display: "inline-block", borderRadius: 2 }} />{label}
          </span>
        ))}
      </div>
    </figure>
  );
}
