// SVG shape illustrations for the Construction Volume Calculator

const B  = "#3b7bfc";   // accent blue
const BL = "#dbeafe";   // light blue fill
const BM = "#bfdbfe";   // mid blue fill
const BD = "#93c5fd";   // dark blue fill

function Svg({ children }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      {children}
    </svg>
  );
}
function Lbl({ x, y, anchor = "middle", children }) {
  return <text x={x} y={y} textAnchor={anchor} fontSize="9" fill={B} fontWeight="700" fontFamily="system-ui,sans-serif">{children}</text>;
}
function DimLine({ x1, y1, x2, y2 }) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx+dy*dy);
  if (len === 0) return null;
  const nx = dx/len, ny = dy/len;
  const tickLen = 4;
  return (
    <g stroke={B} strokeWidth="1">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="3,2" />
      <line x1={x1-ny*tickLen} y1={y1+nx*tickLen} x2={x1+ny*tickLen} y2={y1-nx*tickLen} />
      <line x1={x2-ny*tickLen} y1={y2+nx*tickLen} x2={x2+ny*tickLen} y2={y2-nx*tickLen} />
    </g>
  );
}

function RectangleDiagram() {
  return (
    <Svg>
      <rect x="18" y="48" width="88" height="52" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="18,48 42,28 130,28 106,48" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="106,48 130,28 130,76 106,100" fill={BD} stroke={B} strokeWidth="1.5"/>
      <DimLine x1="18" y1="110" x2="106" y2="110"/>
      <Lbl x="62" y="118">Length</Lbl>
      <DimLine x1="134" y1="28" x2="134" y2="76"/>
      <Lbl x="150" y="54">H</Lbl>
      <Lbl x="10" y="72">D</Lbl>
    </Svg>
  );
}

function CylinderDiagram() {
  return (
    <Svg>
      <rect x="40" y="30" width="80" height="70" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="30" rx="40" ry="12" fill={BM} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="100" rx="40" ry="12" fill="none" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <DimLine x1="83" y1="30" x2="118" y2="30"/>
      <Lbl x="100" y="26">Radius</Lbl>
      <DimLine x1="132" y1="30" x2="132" y2="100"/>
      <Lbl x="150" y="66">H</Lbl>
    </Svg>
  );
}

function CircularDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="50" rx="52" ry="16" fill={BM} stroke={B} strokeWidth="1.5"/>
      <rect x="28" y="50" width="104" height="40" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="90" rx="52" ry="16" fill="none" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="80" y1="50" x2="132" y2="50" stroke={B} strokeWidth="1.2" strokeDasharray="3,2"/>
      <Lbl x="107" y="46">Diameter/2</Lbl>
      <DimLine x1="136" y1="50" x2="136" y2="90"/>
      <Lbl x="152" y="72">D</Lbl>
    </Svg>
  );
}

function TubeDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="28" rx="50" ry="15" fill={BM} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="28" rx="26" ry="8"  fill="white" stroke={B} strokeWidth="1.5"/>
      <line x1="30" y1="28" x2="30" y2="88" stroke={B} strokeWidth="1.5"/>
      <line x1="130" y1="28" x2="130" y2="88" stroke={B} strokeWidth="1.5"/>
      <line x1="54" y1="28" x2="54" y2="88" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="106" y1="28" x2="106" y2="88" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <ellipse cx="80" cy="88" rx="50" ry="15" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="88" rx="26" ry="8"  fill="white" stroke={B} strokeWidth="1.5"/>
      <line x1="80" y1="88" x2="130" y2="88" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <Lbl x="105" y="85">Outer R</Lbl>
      <line x1="80" y1="80" x2="106" y2="80" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <Lbl x="92" y="76">Inner R</Lbl>
      <DimLine x1="136" y1="28" x2="136" y2="88"/>
      <Lbl x="152" y="60">H</Lbl>
    </Svg>
  );
}

function TriangleDiagram() {
  return (
    <Svg>
      <polygon points="30,95 80,25 80,95" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="80,25 130,55 130,95 80,95" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="30,95 80,95 130,95 80,55" fill={BD} stroke={B} strokeWidth="1.5" opacity="0.7"/>
      <line x1="80" y1="25" x2="80" y2="95" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <DimLine x1="30" y1="103" x2="80" y2="103"/>
      <Lbl x="55" y="114">Base</Lbl>
      <Lbl x="86" y="58">H</Lbl>
      <Lbl x="110" y="80">Depth</Lbl>
    </Svg>
  );
}

function TrapezoidDiagram() {
  return (
    <Svg>
      <polygon points="40,30 120,30 135,90 25,90" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="120,30 148,48 148,108 135,90" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="40,30 120,30 148,48 68,48" fill={BD} stroke={B} strokeWidth="1.5"/>
      <DimLine x1="40" y1="22" x2="120" y2="22"/>
      <Lbl x="80" y="18">Top</Lbl>
      <DimLine x1="25" y1="99" x2="135" y2="99"/>
      <Lbl x="80" y="112">Bottom</Lbl>
      <DimLine x1="17" y1="30" x2="17" y2="90"/>
      <Lbl x="8" y="62">H</Lbl>
      <Lbl x="142" y="78">L</Lbl>
    </Svg>
  );
}

function SqFootingDiagram() {
  return (
    <Svg>
      <rect x="28" y="52" width="84" height="48" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="28,52 52,34 136,34 112,52" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="112,52 136,34 136,80 112,100" fill={BD} stroke={B} strokeWidth="1.5"/>
      <DimLine x1="28" y1="108" x2="112" y2="108"/>
      <Lbl x="70" y="117">Length</Lbl>
      <DimLine x1="140" y1="34" x2="140" y2="80"/>
      <Lbl x="152" y="60">D</Lbl>
    </Svg>
  );
}

function CircFootingDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="44" rx="52" ry="15" fill={BM} stroke={B} strokeWidth="1.5"/>
      <rect x="28" y="44" width="104" height="44" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="88" rx="52" ry="15" fill="none" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="80" y1="44" x2="132" y2="44" stroke={B} strokeWidth="1.2" strokeDasharray="3,2"/>
      <Lbl x="106" y="40">Diameter/2</Lbl>
      <DimLine x1="138" y1="44" x2="138" y2="88"/>
      <Lbl x="152" y="68">D</Lbl>
    </Svg>
  );
}

function ColumnDiagram() {
  return (
    <Svg>
      <rect x="52" y="20" width="56" height="84" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="20" rx="28" ry="9" fill={BM} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="104" rx="28" ry="9" fill="none" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="80" y1="20" x2="108" y2="20" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <Lbl x="94" y="16">D/2</Lbl>
      <DimLine x1="116" y1="20" x2="116" y2="104"/>
      <Lbl x="140" y="64">Height</Lbl>
    </Svg>
  );
}

function WallDiagram() {
  return (
    <Svg>
      <rect x="10" y="42" width="120" height="48" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="10,42 20,28 140,28 130,42" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="130,42 140,28 140,70 130,90" fill={BD} stroke={B} strokeWidth="1.5"/>
      <DimLine x1="10" y1="100" x2="130" y2="100"/>
      <Lbl x="70" y="112">Length</Lbl>
      <DimLine x1="4" y1="42" x2="4" y2="90"/>
      <Lbl x="14" y="72">H</Lbl>
      <Lbl x="136" y="60">T</Lbl>
    </Svg>
  );
}

function CurbDiagram() {
  return (
    <Svg>
      {/* L-shape cross section */}
      <polygon points="20,40 50,40 50,70 100,70 100,90 20,90" fill={BL} stroke={B} strokeWidth="1.5"/>
      {/* depth extrusion */}
      <polygon points="50,40 80,22 130,22 100,40" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="100,40 130,22 130,60 100,70" fill={BD} stroke={B} strokeWidth="1.5"/>
      <line x1="130" y1="60" x2="130" y2="78" stroke={B} strokeWidth="1.5"/>
      <line x1="100" y1="70" x2="130" y2="78" stroke={B} strokeWidth="1.5"/>
      <DimLine x1="20" y1="98" x2="100" y2="98"/>
      <Lbl x="60" y="110">Length</Lbl>
      <DimLine x1="4" y1="40" x2="4" y2="90"/>
      <Lbl x="16" y="68">H</Lbl>
    </Svg>
  );
}

function StairDiagram() {
  return (
    <Svg>
      {/* stair profile side view - 4 steps */}
      <polygon points="16,100 16,76 46,76 46,52 76,52 76,28 106,28 106,100" fill={BL} stroke={B} strokeWidth="1.5"/>
      {/* width extrusion lines */}
      <line x1="106" y1="28" x2="130" y2="14" stroke={B} strokeWidth="1.5"/>
      <line x1="106" y1="100" x2="130" y2="86" stroke={B} strokeWidth="1.5"/>
      <line x1="16"  y1="100" x2="40"  y2="86" stroke={B} strokeWidth="1.5"/>
      <line x1="130" y1="14"  x2="130" y2="86" stroke={B} strokeWidth="1.5"/>
      <polygon points="106,28 130,14 130,86 106,100" fill={BM} stroke={B} strokeWidth="1.5" opacity="0.8"/>
      <DimLine x1="8" y1="100" x2="8" y2="76"/>
      <Lbl x="4" y="89">Rise</Lbl>
      <DimLine x1="16" y1="108" x2="46" y2="108"/>
      <Lbl x="31" y="117">Run</Lbl>
      <Lbl x="122" y="55">W</Lbl>
    </Svg>
  );
}

function RingDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="44" rx="56" ry="17" fill={BM} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="44" rx="28" ry="8"  fill="white" stroke={B} strokeWidth="1.5"/>
      <rect x="24" y="44" width="112" height="40" fill={BL} stroke={B} strokeWidth="0"/>
      <rect x="52" y="44" width="56"  height="40" fill="white" stroke={B} strokeWidth="0"/>
      <line x1="24"  y1="44" x2="24"  y2="84" stroke={B} strokeWidth="1.5"/>
      <line x1="136" y1="44" x2="136" y2="84" stroke={B} strokeWidth="1.5"/>
      <line x1="52"  y1="44" x2="52"  y2="84" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="108" y1="44" x2="108" y2="84" stroke={B} strokeWidth="1.5" strokeDasharray="4,3"/>
      <ellipse cx="80" cy="84" rx="56" ry="17" fill={BL} stroke={B} strokeWidth="1.5"/>
      <ellipse cx="80" cy="84" rx="28" ry="8"  fill="white" stroke={B} strokeWidth="1.5"/>
      <line x1="80" y1="44" x2="136" y2="44" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <Lbl x="110" y="40">Outer R</Lbl>
      <line x1="80" y1="36" x2="108" y2="36" stroke={B} strokeWidth="1" strokeDasharray="3,2"/>
      <Lbl x="93" y="32">Inner R</Lbl>
      <DimLine x1="142" y1="44" x2="142" y2="84"/>
      <Lbl x="156" y="66">H</Lbl>
    </Svg>
  );
}

function CustomBoxDiagram() {
  return (
    <Svg>
      <rect x="18" y="44" width="90" height="56" fill={BL} stroke={B} strokeWidth="1.5"/>
      <polygon points="18,44 44,22 134,22 108,44" fill={BM} stroke={B} strokeWidth="1.5"/>
      <polygon points="108,44 134,22 134,78 108,100" fill={BD} stroke={B} strokeWidth="1.5"/>
      <DimLine x1="18" y1="110" x2="108" y2="110"/>
      <Lbl x="63" y="118">Length</Lbl>
      <DimLine x1="138" y1="22" x2="138" y2="78"/>
      <Lbl x="152" y="52">H</Lbl>
      <DimLine x1="44" y1="14" x2="134" y2="14"/>
      <Lbl x="90" y="10">Width</Lbl>
    </Svg>
  );
}

export const SHAPE_DIAGRAMS = {
  rectangle:   RectangleDiagram,
  cylinder:    CylinderDiagram,
  circular:    CircularDiagram,
  tube:        TubeDiagram,
  triangle:    TriangleDiagram,
  trapezoid:   TrapezoidDiagram,
  sqfooting:   SqFootingDiagram,
  circfooting: CircFootingDiagram,
  column:      ColumnDiagram,
  wall:        WallDiagram,
  curb:        CurbDiagram,
  stair:       StairDiagram,
  ring:        RingDiagram,
  custombox:   CustomBoxDiagram,
};
