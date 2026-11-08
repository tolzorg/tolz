// Cross-section sketch of a PCB trace (internal or external), shared by the PCB trace calculators.

/** Cross-section sketch of the trace: inside the board between two copper planes, or on its surface. */
export default function PcbTraceDiagram({ type }) {
  const copper = "#e8b923";
  const board = "#86d68a";
  const text = { fontSize: 11, fill: "var(--text-secondary)", fontFamily: "var(--font-body)" };
  const line = { stroke: "var(--text-muted)", strokeWidth: 1 };
  return type === "internal" ? (
    <svg viewBox="0 0 260 110" role="img" aria-label="Internal PCB trace between two copper planes" style={{ width: "100%", maxWidth: 320, display: "block", margin: "6px auto 0" }}>
      <rect x="30" y="28" width="220" height="5" fill={copper} />
      <rect x="30" y="33" width="220" height="46" fill={board} />
      <rect x="30" y="79" width="220" height="5" fill={copper} />
      <rect x="125" y="58" width="34" height="9" fill={copper} />
      <line x1="125" y1="12" x2="125" y2="58" {...line} strokeDasharray="2 2" /><line x1="159" y1="12" x2="159" y2="58" {...line} strokeDasharray="2 2" />
      <line x1="125" y1="16" x2="159" y2="16" {...line} /><text x="138" y="12" {...text}>W</text>
      <line x1="20" y1="33" x2="20" y2="58" {...line} /><text x="4" y="49" {...text}>H2</text>
      <line x1="20" y1="58" x2="20" y2="67" {...line} /><text x="8" y="66" {...text}>T</text>
      <line x1="20" y1="67" x2="20" y2="79" {...line} /><text x="4" y="78" {...text}>H1</text>
    </svg>
  ) : (
    <svg viewBox="0 0 260 110" role="img" aria-label="External PCB trace on the board surface" style={{ width: "100%", maxWidth: 320, display: "block", margin: "6px auto 0" }}>
      <rect x="120" y="30" width="34" height="9" fill={copper} />
      <rect x="30" y="39" width="220" height="50" fill={board} />
      <rect x="30" y="89" width="220" height="5" fill={copper} />
      <line x1="120" y1="12" x2="120" y2="30" {...line} strokeDasharray="2 2" /><line x1="154" y1="12" x2="154" y2="30" {...line} strokeDasharray="2 2" />
      <line x1="120" y1="16" x2="154" y2="16" {...line} /><text x="133" y="12" {...text}>W</text>
      <line x1="20" y1="30" x2="20" y2="39" {...line} /><text x="8" y="38" {...text}>T</text>
      <line x1="20" y1="39" x2="20" y2="89" {...line} /><text x="8" y="68" {...text}>H</text>
    </svg>
  );
}
