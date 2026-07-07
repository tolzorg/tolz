// Front-view / side-view SVG diagrams for each shed roof type,
// with labeled dimension arrows (W, H, R, S, O, L).

const WALL_FILL = "#f7c893";
const WALL_STK  = "#c2793a";
const ROOF_FILL = "#0f6b1f";
const ROOF_STK  = "#0a4d16";
const DIM       = "#111827";

function ArrowDefs({ id }) {
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
        <path d="M0,0 L8,4 L0,8 Z" fill={DIM} />
      </marker>
    </defs>
  );
}

function DimLine({ x1, y1, x2, y2, arrowId, rotate }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth={1.3}
      markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`}
      transform={rotate ? `rotate(${rotate.deg} ${rotate.cx} ${rotate.cy})` : undefined} />
  );
}

function Bracket({ x, y1, y2, tick = 5 }) {
  return (
    <g stroke={DIM} strokeWidth={1.3}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - tick} y1={y1} x2={x + tick} y2={y1} />
      <line x1={x - tick} y1={y2} x2={x + tick} y2={y2} />
    </g>
  );
}

function Label({ x, y, children, anchor = "middle", rotate }) {
  return (
    <text x={x} y={y} fontSize={15} fontFamily="sans-serif" fontWeight={700} fill={DIM}
      textAnchor={anchor} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      {children}
    </text>
  );
}

// ── Front views (show width W, wall height H, roof rise R, rafter S, overhang O) ──
function SlantedFront() {
  return (
    <svg viewBox="-15 0 260 190" width="100%" aria-hidden="true">
      {/* wall (right trapezoid: tall on the left, short on the right) */}
      <polygon points="60,160 190,160 190,95 60,45" fill={WALL_FILL} stroke={WALL_STK} strokeWidth={2} />
      {/* roof slab, extended past both ends for the overhang */}
      <polygon points="35,53 205,103 213,88 43,38" fill="#ffffff" stroke={WALL_STK} strokeWidth={2} />

      <Bracket x={24} y1={95} y2={45} />
      <Label x={11} y={74} anchor="start">R</Label>

      <Bracket x={8} y1={160} y2={95} />
      <Label x={-5} y={131} anchor="start">H</Label>

      <ArrowDefs id="shedArrFrontSlant" />
      <DimLine x1={55} y1={40} x2={197} y2={90} arrowId="shedArrFrontSlant" />
      <Label x={126} y={55} rotate={21}>S</Label>

      <DimLine x1={190} y1={112} x2={213} y2={112} arrowId="shedArrFrontSlant" />
      <Label x={201} y={128} anchor="middle">O</Label>

      <DimLine x1={60} y1={175} x2={190} y2={175} arrowId="shedArrFrontSlant" />
      <Label x={125} y={188}>W</Label>
    </svg>
  );
}

function FlatFront() {
  return (
    <svg viewBox="-15 0 260 190" width="100%" aria-hidden="true">
      <polygon points="60,160 190,160 190,70 60,70" fill={WALL_FILL} stroke={WALL_STK} strokeWidth={2} />
      <polygon points="40,70 210,70 210,53 40,53" fill={ROOF_FILL} stroke={ROOF_STK} strokeWidth={1.5} />

      <Bracket x={8} y1={160} y2={70} />
      <Label x={-5} y={118} anchor="start">H</Label>

      <ArrowDefs id="shedArrFrontFlat" />
      <DimLine x1={40} y1={88} x2={60} y2={88} arrowId="shedArrFrontFlat" />
      <Label x={50} y={102}>O</Label>
      <DimLine x1={190} y1={88} x2={210} y2={88} arrowId="shedArrFrontFlat" />
      <Label x={200} y={102}>O</Label>

      <DimLine x1={60} y1={175} x2={190} y2={175} arrowId="shedArrFrontFlat" />
      <Label x={125} y={188}>W</Label>
    </svg>
  );
}

function GableFront() {
  return (
    <svg viewBox="-15 0 260 190" width="100%" aria-hidden="true">
      <polygon points="60,160 190,160 190,90 60,90" fill={WALL_FILL} stroke={WALL_STK} strokeWidth={2} />
      {/* symmetric gable roof, peak in the middle, overhanging both eaves */}
      <polygon points="40,92 125,35 210,92 198,92 125,52 52,92" fill="#ffffff" stroke={WALL_STK} strokeWidth={2} />

      <Bracket x={24} y1={90} y2={35} />
      <Label x={11} y={65} anchor="start">R</Label>

      <Bracket x={8} y1={160} y2={90} />
      <Label x={-5} y={128} anchor="start">H</Label>

      <ArrowDefs id="shedArrFrontGable" />
      <DimLine x1={55} y1={92} x2={120} y2={40} arrowId="shedArrFrontGable" />
      <Label x={73} y={62} rotate={-52}>S</Label>

      <DimLine x1={40} y1={104} x2={60} y2={104} arrowId="shedArrFrontGable" />
      <Label x={50} y={118}>O</Label>
      <DimLine x1={190} y1={104} x2={210} y2={104} arrowId="shedArrFrontGable" />
      <Label x={200} y={118}>O</Label>

      <DimLine x1={60} y1={175} x2={190} y2={175} arrowId="shedArrFrontGable" />
      <Label x={125} y={188}>W</Label>
    </svg>
  );
}

const FRONT_BY_ROOF = { slanted: SlantedFront, flat: FlatFront, gable: GableFront };

export function ShedFrontDiagram({ roofType }) {
  const Cmp = FRONT_BY_ROOF[roofType] || SlantedFront;
  return <Cmp />;
}

// ── Side view (shows length L and overhang O) — same silhouette for every roof type
export function ShedSideDiagram({ roofType }) {
  const roofRect = roofType === "gable"
    ? { x: 40, y: 78, w: 170, h: 17 }
    : { x: 40, y: 78, w: 170, h: roofType === "flat" ? 12 : 17 };
  return (
    <svg viewBox="0 0 260 190" width="100%" aria-hidden="true">
      <rect x={60} y={95} width={130} height={65} fill={WALL_FILL} stroke={WALL_STK} strokeWidth={2} />
      <rect x={roofRect.x} y={roofRect.y} width={roofRect.w} height={roofRect.h} fill={ROOF_FILL} stroke={ROOF_STK} strokeWidth={1.5} />

      <ArrowDefs id="shedArrSide" />
      <DimLine x1={40} y1={105} x2={60} y2={105} arrowId="shedArrSide" />
      <Label x={50} y={120}>O</Label>
      <DimLine x1={190} y1={105} x2={210} y2={105} arrowId="shedArrSide" />
      <Label x={200} y={120}>O</Label>

      <DimLine x1={60} y1={175} x2={190} y2={175} arrowId="shedArrSide" />
      <Label x={125} y={188}>L</Label>
    </svg>
  );
}
