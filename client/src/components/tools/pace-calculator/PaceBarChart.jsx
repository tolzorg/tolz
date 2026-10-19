// "Pace Trends for Sections": one bar per section, like the reference's chart.

/** A round axis step giving about 4–7 grid lines up to `max`. */
function niceStep(max) {
  const raw = max / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => raw <= s);
  return step || pow * 10;
}
const tickLabel = (v) => (v >= 1000 && v % 1000 === 0 ? `${v / 1000}K` : String(Number(v.toPrecision(6))));

export default function PaceBarChart({ values, yTitle }) {
  const W = 500;
  const H = 220;
  const left = 56;
  const right = 10;
  const top = 34;
  const bottom = 26;
  const max = Math.max(...values, 0) || 1;
  const step = niceStep(max);
  const top0 = Math.ceil(max / step) * step;
  const y = (v) => top + (H - top - bottom) * (1 - v / top0);
  const ticks = [];
  for (let v = 0; v <= top0 + step / 2; v += step) ticks.push(v);
  const band = (W - left - right) / values.length;
  const barW = Math.min(46, band * 0.55);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 520, height: "auto", display: "block", margin: "14px auto 0" }} role="img" aria-label={`Pace trends for sections: ${values.map((v) => v.toFixed(2)).join(", ")}`}>
      <g style={{ fontFamily: "arial, helvetica, sans-serif" }}>
        <text x={W / 2} y="16" textAnchor="middle" fontSize="15" fontWeight="bold" fill="var(--text-primary)">Pace Trends for Sections</text>
        <text x="12" y={(top + H - bottom) / 2} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" transform={`rotate(-90 12 ${(top + H - bottom) / 2})`}>{yTitle}</text>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={left} x2={W - right} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
            <text x={left - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-secondary)">{tickLabel(v)}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = left + band * (i + 0.5);
          return (
            <g key={i}>
              <rect x={cx - barW / 2} y={y(v)} width={barW} height={y(0) - y(v)} fill="var(--accent)" rx="2">
                <title>{`Section ${i + 1}: ${v.toFixed(2)}`}</title>
              </rect>
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">{i + 1}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
