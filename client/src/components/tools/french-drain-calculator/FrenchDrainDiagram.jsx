// Simple illustrative cross-section of a French drain trench: overall
// width (w) across the top, depth (d) down the side, gravel fill, and
// the perforated pipe with its outside diameter (D_o) labeled.

const GROUND = "#a98a5c";
const GRAVEL = "#9ca3af";
const PIPE   = "#1f2937";
const LINE   = "#1f2937";
const LBL    = "#1f2937";

function ArrowDefs() {
  return (
    <defs>
      <marker id="drainArrowEnd" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={LINE} />
      </marker>
      <marker id="drainArrowStart" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
        <path d="M8,0 L0,4 L8,8 Z" fill={LINE} />
      </marker>
    </defs>
  );
}

export default function FrenchDrainDiagram({ usePipe = true, showOverlap = false }) {
  const trenchLeft = 90, trenchRight = 230, trenchTop = 55, trenchBottom = 175;
  const pipeCx = (trenchLeft + trenchRight) / 2, pipeCy = 150, pipeR = 22;
  const overlapY = trenchTop + 18;

  return (
    <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto", display: "block" }}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ArrowDefs />

      {/* Ground surface, hatched */}
      <line x1={20} y1={55} x2={300} y2={55} stroke={GROUND} strokeWidth={2} />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={20 + i * 20} y1={55} x2={10 + i * 20} y2={42} stroke={GROUND} strokeWidth={1.2} />
      ))}

      {/* Trench outline */}
      <path d={`M ${trenchLeft} ${trenchTop} L ${trenchLeft} ${trenchBottom} L ${trenchRight} ${trenchBottom} L ${trenchRight} ${trenchTop}`}
        fill="rgba(156,163,175,0.15)" stroke={LINE} strokeWidth={1.5} />

      {/* Gravel fill texture (dots) around the pipe */}
      {(usePipe
        ? [
          [110, 90], [130, 75], [150, 95], [170, 78], [190, 92], [210, 80],
          [105, 130], [215, 130], [110, 165], [205, 165], [130, 165], [190, 165],
        ]
        : [
          [110, 90], [130, 75], [150, 95], [170, 78], [190, 92], [210, 80],
          [105, 130], [215, 130], [110, 165], [205, 165], [130, 165], [190, 165],
          [150, 130], [170, 145], [130, 110], [190, 110],
        ]
      ).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={GRAVEL} opacity={0.8} />
      ))}

      {/* Perforated pipe */}
      {usePipe && (
        <>
          <circle cx={pipeCx} cy={pipeCy} r={pipeR} fill="#e5e7eb" stroke={PIPE} strokeWidth={2} />
          <circle cx={pipeCx} cy={pipeCy} r={pipeR - 6} fill="none" stroke={PIPE} strokeWidth={1} strokeDasharray="3,3" />
        </>
      )}

      {/* Width arrow (w) */}
      <line x1={trenchLeft} y1={30} x2={trenchRight} y2={30} stroke={LINE} strokeWidth={1.5}
        markerStart="url(#drainArrowStart)" markerEnd="url(#drainArrowEnd)" />
      <text x={(trenchLeft + trenchRight) / 2} y={23} fontSize={13} fontFamily="sans-serif" fontWeight={700}
        fill={LBL} textAnchor="middle">w</text>

      {/* Depth arrow (d) */}
      <line x1={62} y1={trenchTop} x2={62} y2={trenchBottom} stroke={LINE} strokeWidth={1.5}
        markerStart="url(#drainArrowStart)" markerEnd="url(#drainArrowEnd)" />
      <text x={50} y={(trenchTop + trenchBottom) / 2 + 4} fontSize={13} fontFamily="sans-serif" fontWeight={700}
        fill={LBL} textAnchor="middle">d</text>

      {/* Outside diameter arrow (D_o) */}
      {usePipe && (
        <>
          <line x1={pipeCx - pipeR} y1={pipeCy + pipeR + 12} x2={pipeCx + pipeR} y2={pipeCy + pipeR + 12}
            stroke={LINE} strokeWidth={1.5} markerStart="url(#drainArrowStart)" markerEnd="url(#drainArrowEnd)" />
          <text x={pipeCx} y={pipeCy + pipeR + 28} fontSize={12} fontFamily="sans-serif" fontWeight={700}
            fill={LBL} textAnchor="middle">D_o</text>
        </>
      )}

      {/* Fabric seam overlap arrow (o) — where the wrapped fabric edges meet */}
      {showOverlap && (
        <>
          <line x1={pipeCx - 12} y1={overlapY} x2={pipeCx + 12} y2={overlapY} stroke={LINE} strokeWidth={1.3}
            markerStart="url(#drainArrowStart)" markerEnd="url(#drainArrowEnd)" />
          <text x={pipeCx} y={overlapY - 6} fontSize={11} fontFamily="sans-serif" fontWeight={700}
            fill={LBL} textAnchor="middle">o</text>
        </>
      )}
    </svg>
  );
}
