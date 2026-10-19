import { useId } from "react";

// The reference's half-circle gauge, same geometry: the coloured bands are
// drawn as pie slices around (140, 140) and a white half-disc covers the
// middle. The needle starts pointing left (angle 0) and swings clockwise.
// Adults: BMI 13–43 over 180°, 6° per unit. Children: percentile 0–100.

const ADULT_BANDS = [
  ["M0 140 A140 140, 0, 0, 1, 6.9 96.7 L140 140 Z", "#bc2020"],
  ["M6.9 96.7 A140 140, 0, 0, 1, 12.1 83.1 L140 140 Z", "#d38888"],
  ["M12.1 83.1 A140 140, 0, 0, 1, 22.6 63.8 L140 140 Z", "#ffe400"],
  ["M22.6 63.8 A140 140, 0, 0, 1, 96.7 6.9 L140 140 Z", "#008137"],
  ["M96.7 6.9 A140 140, 0, 0, 1, 169.1 3.1 L140 140 Z", "#ffe400"],
  ["M169.1 3.1 A140 140, 0, 0, 1, 233.7 36 L140 140 Z", "#d38888"],
  ["M233.7 36 A140 140, 0, 0, 1, 273.1 96.7 L140 140 Z", "#bc2020"],
  ["M273.1 96.7 A140 140, 0, 0, 1, 280 140 L140 140 Z", "#8a0101"],
];
const ADULT_TICKS = [
  ["16", 25, 111, -72], ["17", 30, 96, -66], ["18.5", 35, 83, -57], ["25", 97, 29, -18],
  ["30", 157, 20, 12], ["35", 214, 45, 42], ["40", 252, 95, 72],
];
const ADULT_LABELS = [
  ["Underweight", "M-4 140 A140 140, 0, 0, 1, 284 140"],
  ["Normal", "M33 43.6 A140 140, 0, 0, 1, 280 140"],
  ["Overweight", "M95 3 A140 140, 0, 0, 1, 284 140"],
  ["Obesity", "M235.4 33 A140 140, 0, 0, 1, 284 140"],
];
const CHILD_BANDS = [
  ["M0 140 A140 140, 0, 0, 1, 280 140 L140 140 Z", "#e49b2a"],
  ["M1.7 118.1 A140 140, 0, 0, 1, 264.7 76.4 L140 140 Z", "#008137"],
  ["M264.7 76.4 A140 140, 0, 0, 1, 280 140 L140 140 Z", "#ffe400"],
  ["M278.3 118.1 A140 140, 0, 0, 1, 280 140 L140 140 Z", "#b90606"],
];
const CHILD_TICKS = [["5%", 18, 130, -81], ["85%", 243, 72, 63], ["95%", 258, 105, 81]];

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function BmiGauge({ kind, angle, bmi }) {
  const uid = useId().replace(/:/g, "");
  const adult = kind === "adult";
  const [width, height, shift] = adult ? [300, 163, 18] : [284, 148, 2];
  const halo = { paintOrder: "stroke", stroke: "var(--bg-card)", strokeWidth: adult ? 2 : 5 };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: width, height: "auto", display: "block", margin: "0 auto" }}
      role="img"
      aria-label={`BMI gauge showing BMI = ${bmi}`}
    >
      <g transform={`translate(${shift},${shift})`} style={{ fontFamily: "arial, helvetica, sans-serif", fontSize: adult ? 12 : 14 }}>
        <defs>
          <marker id={`${uid}-arrow`} markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-primary)" />
          </marker>
          {adult && ADULT_LABELS.map(([label, d]) => <path key={label} id={`${uid}-${label}`} d={d} fill="none" />)}
        </defs>
        {(adult ? ADULT_BANDS : CHILD_BANDS).map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
        <path d="M45 140 A90 90, 0, 0, 1, 230 140 Z" fill="var(--bg-card)" />
        <circle cx="140" cy="140" r="5" fill="#666" />
        <g style={halo} fill="var(--text-primary)">
          {(adult ? ADULT_TICKS : CHILD_TICKS).map(([text, x, y, rotate]) => (
            <text key={text} x={x} y={y} transform={`rotate(${rotate}, ${x}, ${y})`}>{text}</text>
          ))}
        </g>
        {adult && (
          <g style={{ fontSize: 14 }} fill="var(--text-primary)">
            {ADULT_LABELS.map(([label]) => (
              <text key={label}><textPath href={`#${uid}-${label}`}>{label}</textPath></text>
            ))}
          </g>
        )}
        <line
          key={`${kind}-${angle}`}
          x1="140" y1="140" x2="65" y2="140" stroke="#666" strokeWidth="2" markerEnd={`url(#${uid}-arrow)`}
          transform={reducedMotion() ? `rotate(${angle} 140 140)` : undefined}
        >
          {!reducedMotion() && (
            <animateTransform
              attributeName="transform" attributeType="XML" type="rotate"
              from="0 140 140" to={`${angle} 140 140`} dur="1s" fill="freeze" repeatCount="1"
            />
          )}
        </line>
        <text x="67" y="120" fill="var(--text-primary)" style={{ fontSize: 30, fontWeight: "bold" }}>BMI = {bmi}</text>
      </g>
    </svg>
  );
}
