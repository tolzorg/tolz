// Simple illustrative diagram of a stud wall: overall wall length across
// the top, evenly spaced vertical studs, and the on-center (OC) spacing
// between two adjacent studs highlighted in red.

const WOOD  = "#b98a53";
const WOOD_D = "#8a6238";
const LINE  = "#1f2937";
const OC    = "#dc2626";

function ArrowDefs() {
  return (
    <defs>
      <marker id="studArrowEnd" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={LINE} />
      </marker>
      <marker id="studArrowStart" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
        <path d="M8,0 L0,4 L8,8 Z" fill={LINE} />
      </marker>
      <marker id="ocArrowEnd" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={OC} />
      </marker>
      <marker id="ocArrowStart" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
        <path d="M8,0 L0,4 L8,8 Z" fill={OC} />
      </marker>
    </defs>
  );
}

export default function StudWallDiagram() {
  const wallLeft = 30, wallRight = 370, wallTop = 42, wallBottom = 168;
  const studCount = 7;
  const studWidth = 9;
  const step = (wallRight - wallLeft) / (studCount - 1);
  const studXs = Array.from({ length: studCount }, (_, i) => wallLeft + i * step);

  const ocIndex = 3; // highlight spacing between studs 4 and 5 (middle pair)
  const ocX1 = studXs[ocIndex] + studWidth / 2;
  const ocX2 = studXs[ocIndex + 1] - studWidth / 2;
  const ocY = (wallTop + wallBottom) / 2;

  return (
    <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", display: "block" }}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ArrowDefs />

      {/* Length of wall */}
      <line x1={wallLeft} y1={20} x2={wallRight} y2={20} stroke={LINE} strokeWidth={1.5}
        markerStart="url(#studArrowStart)" markerEnd="url(#studArrowEnd)" />
      <text x={200} y={13} fontSize={12} fontFamily="sans-serif" fontWeight={700}
        fill={LINE} textAnchor="middle">length of wall</text>

      {/* Wall frame */}
      <rect x={wallLeft} y={wallTop} width={wallRight - wallLeft} height={wallBottom - wallTop}
        fill="rgba(185,138,83,0.12)" stroke={WOOD_D} strokeWidth={1.5} />

      {/* Studs */}
      {studXs.map((x, i) => (
        <rect key={i} x={x - studWidth / 2} y={wallTop} width={studWidth} height={wallBottom - wallTop}
          fill={WOOD} stroke={WOOD_D} strokeWidth={1} />
      ))}

      {/* OC spacing between two middle studs */}
      <line x1={ocX1} y1={ocY} x2={ocX2} y2={ocY} stroke={OC} strokeWidth={2}
        markerStart="url(#ocArrowStart)" markerEnd="url(#ocArrowEnd)" />
      <text x={(ocX1 + ocX2) / 2} y={198} fontSize={12} fontFamily="sans-serif" fontWeight={700}
        fill={OC} textAnchor="middle">stud placement (OC)</text>
    </svg>
  );
}
