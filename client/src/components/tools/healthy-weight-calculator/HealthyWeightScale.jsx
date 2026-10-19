// The reference's weight scale for a height: a red → green → red bar split into the BMI
// categories, with the weight at each cut point marked above it. Equal-width bands keep
// the labels readable (the reference crowds them, e.g. "53.559.9").

const BANDS = [
  ["severely", "underweight", "#dc2626"],
  ["underweight", "", "#f59e0b"],
  ["healthy", "", "#22c55e"],
  ["overweight", "", "#a3b818"],
  ["obese", "class I", "#e0a21b"],
  ["obese", "class II", "#e86b1f"],
  ["obese", "class III", "#c81e1e"],
];
const W = 420;
const BAND = W / BANDS.length;

export default function HealthyWeightScale({ weights, decimals, unit }) {
  const label = (x) => x.toFixed(decimals);
  return (
    <svg
      viewBox={`-4 0 ${W + 8} 92`} style={{ width: "100%", maxWidth: 480, height: "auto", display: "block", margin: "4px 0 0" }}
      role="img" aria-label={`Weight scale in ${unit}: ${weights.map(label).join(", ")}`}
    >
      <defs>
        <linearGradient id="hw-scale" x1="0" x2="1">
          {BANDS.map(([, , color], i) => <stop key={i} offset={(i + 0.5) / BANDS.length} stopColor={color} />)}
        </linearGradient>
      </defs>
      <g style={{ fontFamily: "arial, helvetica, sans-serif" }}>
        <rect x="0" y="24" width={W} height="22" rx="3" fill="url(#hw-scale)" />
        {weights.map((w, i) => {
          const x = BAND * (i + 1);
          return (
            <g key={i}>
              <text x={x} y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-primary)">{label(w)}</text>
              <polygon points={`${x - 4},16 ${x + 4},16 ${x},23`} fill="var(--text-primary)" />
              <line x1={x} x2={x} y1="24" y2="46" stroke="#1a1a2e" strokeWidth="1.2" />
            </g>
          );
        })}
        {BANDS.map(([a, b], i) => (
          <text key={i} x={BAND * (i + 0.5)} y="60" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            <tspan x={BAND * (i + 0.5)}>{a}</tspan>
            {b && <tspan x={BAND * (i + 0.5)} dy="12">{b}</tspan>}
          </text>
        ))}
      </g>
    </svg>
  );
}
