// "Estimated max reps": one bar per rep count (1-20) with the weight for that many reps,
// like the reference's chart. Hovering a bar shows "reps: weight" (SVG <title>).

const W = 380;
const H = 150;
const LEFT = 58;
const RIGHT = 8;
const TOP = 10;
const BOTTOM = 34;

/** A "nice" tick step giving about four intervals up to `max`. */
function niceStep(max) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= raw) return m * pow;
  return 10 * pow;
}

export default function OneRepMaxChart({ bars, unit }) {
  const max = Math.max(...bars.map((b) => b.value));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const y = (v) => TOP + plotH - (v / top) * plotH;
  const slot = plotW / bars.length;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  const tickText = (v) => `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${unit}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label="Estimated weight for 1 to 20 repetitions">
      <g style={{ fontFamily: "arial, helvetica, sans-serif" }}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="0.6" />
            <text x={LEFT - 5} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--text-muted)">{tickText(v)}</text>
          </g>
        ))}
        {bars.map((b, i) => (
          <rect key={b.reps} x={LEFT + i * slot + slot * 0.2} y={y(b.value)} width={slot * 0.6} height={Math.max(0, y(0) - y(b.value))} fill="#2b7ddb">
            <title>{`${b.reps}: ${b.label} ${unit}`}</title>
          </rect>
        ))}
        {[5, 10, 15, 20].map((n) => (
          <text key={n} x={LEFT + (n - 0.5) * slot} y={y(0) + 13} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{n}</text>
        ))}
        <text x={LEFT + plotW / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Repetitions</text>
        <text x="11" y={TOP + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" transform={`rotate(-90 11 ${TOP + plotH / 2})`}>Weight</text>
      </g>
    </svg>
  );
}
