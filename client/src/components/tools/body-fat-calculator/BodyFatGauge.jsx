// The reference's coloured body-fat scale with an arrow over the result,
// drawn as SVG over 0–40% (the reference shows it only for 0 < BF < 40).

const SCALE = {
  male: [[0, 2, "#8b0000"], [2, 6, "#ffd400"], [6, 14, "#4ade80"], [14, 18, "#008137"], [18, 25, "#ffd400"], [25, 40, "#8b0000"]],
  female: [[0, 10, "#8b0000"], [10, 14, "#ffd400"], [14, 21, "#4ade80"], [21, 25, "#008137"], [25, 32, "#ffd400"], [32, 40, "#8b0000"]],
};
const NAMES = ["Essential", "Athletes", "Fitness", "Average", "Obese"];
const W = 320;
const x = (pct) => (pct / 40) * W;

export default function BodyFatGauge({ sex, percent, label }) {
  const bands = SCALE[sex];
  const ax = Math.min(W - 1, Math.max(1, x(percent)));
  return (
    <svg viewBox={`-6 0 ${W + 12} 86`} style={{ width: "100%", maxWidth: 360, height: "auto", display: "block", margin: "4px auto 0" }} role="img" aria-label={`Body fat scale showing ${label}`}>
      <g style={{ fontFamily: "arial, helvetica, sans-serif" }}>
        <text x={ax} y="13" textAnchor="middle" fontSize="13" fontWeight="bold" fill="var(--text-primary)">{label}</text>
        <polygon points={`${ax - 7},18 ${ax + 7},18 ${ax},28`} fill="var(--text-primary)" />
        {bands.map(([from, to, color]) => <rect key={from} x={x(from)} y="30" width={x(to) - x(from)} height="16" fill={color} />)}
        <rect x="0" y="30" width={W} height="16" fill="none" stroke="var(--border)" />
        {bands.slice(1).map(([from]) => (
          <text key={from} x={x(from)} y="58" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{from}%</text>
        ))}
        {bands.slice(1).map(([from, to], i) => (
          <text key={NAMES[i]} x={x((from + to) / 2)} y="74" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{NAMES[i]}</text>
        ))}
      </g>
    </svg>
  );
}
