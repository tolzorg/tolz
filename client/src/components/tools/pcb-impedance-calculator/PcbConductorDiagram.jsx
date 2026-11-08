// Cross-section sketches of the nine PCB conductor types (board in green, copper in gold), drawn from one set of shapes.

const COPPER = "#e8b923";
const BOARD = "#86d68a";

/** @param {{ type: number }} props  a TYPES value of the PCB impedance calculator. */
export default function PcbConductorDiagram({ type }) {
  const text = { fontSize: 11, fill: "var(--text-secondary)", fontFamily: "var(--font-body)" };
  const line = { stroke: "var(--text-muted)", strokeWidth: 1 };
  const stripline = type >= 4;
  const wire = type === 2 || type === 4;
  const coupled = type === 1 || type === 5;
  const broadside = type === 6;
  const embedded = type === 3 || type === 8;
  // Board between y = top and y = 94, ground plane(s) as copper bars.
  const top = stripline ? 26 : 44;
  const traceY = type === 0 || type === 1 ? 37 : embedded ? 58 : stripline ? 56 : 0;
  const trace = (x) => <rect key={x} x={x} y={traceY} width="34" height="7" fill={COPPER} />;
  return (
    <svg viewBox="0 0 260 112" role="img" aria-label="Cross-section of the selected PCB conductor" style={{ width: "100%", maxWidth: 320, display: "block", margin: "6px auto 0" }}>
      {stripline && <rect x="30" y={top - 5} width="220" height="5" fill={COPPER} />}
      <rect x="30" y={top} width="220" height={94 - top} fill={BOARD} />
      <rect x="30" y="94" width="220" height="5" fill={COPPER} />
      {wire && <circle cx="140" cy={type === 2 ? 62 : 60} r="9" fill={COPPER} />}
      {!wire && !coupled && !broadside && trace(123)}
      {coupled && [trace(100), trace(150)]}
      {broadside && [<rect key="a" x="123" y="44" width="34" height="7" fill={COPPER} />, <rect key="b" x="123" y="66" width="34" height="7" fill={COPPER} />]}
      {/* labels */}
      {!wire && <><line x1={coupled ? 100 : 123} y1="16" x2={coupled ? 134 : 157} y2="16" {...line} /><text x={coupled ? 113 : 136} y="12" {...text}>W</text></>}
      {coupled && <><line x1="134" y1="22" x2="150" y2="22" {...line} /><text x="138" y="19" {...text}>S</text></>}
      {broadside && <><line x1="166" y1="51" x2="166" y2="66" {...line} /><text x="170" y="62" {...text}>S</text></>}
      {wire && <text x="153" y={type === 2 ? 60 : 58} {...text}>D</text>}
      <line x1="20" y1={type === 0 || type === 1 ? 44 : top} x2="20" y2="94" {...line} />
      <text x="4" y="72" {...text}>{type === 5 || type === 6 ? "B" : embedded ? "H2" : "H"}</text>
      {embedded && <><line x1="24" y1={traceY + 7} x2="24" y2="94" {...line} /><text x="26" y="86" {...text}>H1</text></>}
      {!wire && <text x="161" y={traceY + 7} {...text}>T</text>}
    </svg>
  );
}
