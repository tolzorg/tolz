// A resistor with its color bands: the significant figures and multiplier grouped on the left, the tolerance (and
// temperature coefficient) set apart on the right, as resistors are read.
import { COLORS } from "../../../utils/resistorCalculatorEngine";

const HEX = Object.fromEntries(COLORS.map((c) => [c.value, c.hex]));

export default function ResistorDrawing({ colors, label }) {
  const n = colors.length;
  const lead = colors.length >= 4 ? (n === 6 ? 2 : 1) : 0; // bands on the right-hand side
  const left = colors.slice(0, n - lead);
  const right = colors.slice(n - lead);
  const band = (c, x, i) => (
    <rect key={`${i}-${c}`} x={x} y={14} width={9} height={42} fill={HEX[c]} stroke={c === "white" ? "#bbb" : "none"} strokeWidth="0.8" />
  );
  return (
    <svg viewBox="0 0 300 70" role="img" aria-label={label} style={{ width: "100%", maxWidth: 340, height: "auto", display: "block", margin: "0 auto" }}>
      <line x1="0" y1="35" x2="300" y2="35" stroke="#9a9a9a" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 14 Q62 8 74 8 L226 8 Q238 8 238 14 L238 56 Q238 62 226 62 L74 62 Q62 62 62 56 Z" fill="#e8d3a8" stroke="#c9b083" />
      {left.map((c, i) => band(c, 84 + i * 20, i))}
      {right.map((c, i) => band(c, 196 + i * 18, `r${i}`))}
    </svg>
  );
}
