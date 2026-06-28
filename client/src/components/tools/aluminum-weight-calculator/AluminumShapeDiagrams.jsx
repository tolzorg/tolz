// SVG shape diagrams for the Aluminum Weight Calculator
// Same color scheme and helper pattern as cubic-yard-calculator/ShapeDiagrams.jsx

const B  = "#0284c7";  // sky-600 accent
const BL = "#e0f2fe";  // sky-100 light fill
const BM = "#bae6fd";  // sky-200 mid fill
const BD = "#7dd3fc";  // sky-300 dark fill

function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {children}
    </svg>
  );
}

function Lbl({ x, y, anchor = "middle", children }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="9" fill={B} fontWeight="700" fontFamily="system-ui,sans-serif">
      {children}
    </text>
  );
}

function DimLine({ x1, y1, x2, y2 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const nx = dx / len, ny = dy / len;
  const t = 4;
  return (
    <g stroke={B} strokeWidth="1">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="3,2" />
      <line x1={x1 - ny * t} y1={y1 + nx * t} x2={x1 + ny * t} y2={y1 - nx * t} />
      <line x1={x2 - ny * t} y1={y2 + nx * t} x2={x2 + ny * t} y2={y2 - nx * t} />
    </g>
  );
}

// ── 1. Rectangular Bar ────────────────────────────────────────
function RectangularBarDiagram() {
  return (
    <Svg>
      <rect x="18" y="46" width="88" height="52" fill={BL} stroke={B} strokeWidth="1.5" />
      <polygon points="18,46 42,26 130,26 106,46" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="106,46 130,26 130,76 106,98" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="18" y1="108" x2="106" y2="108" />
      <Lbl x="62" y="117">Length</Lbl>
      <DimLine x1="134" y1="46" x2="134" y2="98" />
      <Lbl x="150" y="74">H</Lbl>
      <DimLine x1="18" y1="38" x2="106" y2="38" />
      <Lbl x="62" y="34">Width</Lbl>
    </Svg>
  );
}

// ── 2. Round Bar ──────────────────────────────────────────────
function RoundBarDiagram() {
  return (
    <Svg>
      <rect x="38" y="30" width="82" height="70" fill={BL} stroke={B} strokeWidth="1.5" />
      <ellipse cx="79" cy="30" rx="41" ry="13" fill={BM} stroke={B} strokeWidth="1.5" />
      <ellipse cx="79" cy="100" rx="41" ry="13" fill="none" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="79" y1="30" x2="120" y2="30" stroke={B} strokeWidth="1" strokeDasharray="3,2" />
      <Lbl x="100" y="26">D/2</Lbl>
      <DimLine x1="134" y1="30" x2="134" y2="100" />
      <Lbl x="150" y="67">L</Lbl>
    </Svg>
  );
}

// ── 3. Square Bar ─────────────────────────────────────────────
function SquareBarDiagram() {
  return (
    <Svg>
      <rect x="22" y="44" width="72" height="62" fill={BL} stroke={B} strokeWidth="1.5" />
      <polygon points="22,44 50,22 122,22 94,44" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="94,44 122,22 122,84 94,106" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="22" y1="114" x2="94" y2="114" />
      <Lbl x="58" y="119">Length</Lbl>
      <DimLine x1="10" y1="44" x2="10" y2="106" />
      <Lbl x="6" y="77">S</Lbl>
      <Lbl x="36" y="15">Side</Lbl>
    </Svg>
  );
}

// ── 4. Hex Bar ────────────────────────────────────────────────
function HexBarDiagram() {
  return (
    <Svg>
      {/* Front face hexagon */}
      <polygon points="80,14 110,30 110,62 80,78 50,62 50,30" fill={BM} stroke={B} strokeWidth="1.5" />
      {/* Extrusion sides */}
      <polygon points="110,30 138,20 138,52 110,62" fill={BD} stroke={B} strokeWidth="1.5" />
      <polygon points="80,14 108,4 138,20 110,30" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Across-flats line */}
      <line x1="50" y1="46" x2="110" y2="46" stroke={B} strokeWidth="1" strokeDasharray="3,2" />
      <Lbl x="80" y="43">AF</Lbl>
      <DimLine x1="140" y1="20" x2="140" y2="52" />
      <Lbl x="154" y="38">L</Lbl>
      <Lbl x="80" y="98">Across Flats</Lbl>
    </Svg>
  );
}

// ── 5. Flat Bar ───────────────────────────────────────────────
function FlatBarDiagram() {
  return (
    <Svg>
      {/* Very thin flat bar — wide but shallow */}
      <rect x="14" y="58" width="98" height="18" fill={BL} stroke={B} strokeWidth="1.5" />
      <polygon points="14,58 34,44 132,44 112,58" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="112,58 132,44 132,62 112,76" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="14" y1="86" x2="112" y2="86" />
      <Lbl x="63" y="95">Length</Lbl>
      <DimLine x1="14" y1="50" x2="112" y2="50" />
      <Lbl x="63" y="46">Width</Lbl>
      <DimLine x1="138" y1="58" x2="138" y2="76" />
      <Lbl x="153" y="69">T</Lbl>
    </Svg>
  );
}

// ── 6. Round Tube (Hollow) ────────────────────────────────────
function RoundTubeDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="28" rx="50" ry="15" fill={BM} stroke={B} strokeWidth="1.5" />
      <ellipse cx="80" cy="28" rx="28" ry="8"  fill="white" stroke={B} strokeWidth="1.5" />
      <line x1="30" y1="28" x2="30" y2="90" stroke={B} strokeWidth="1.5" />
      <line x1="130" y1="28" x2="130" y2="90" stroke={B} strokeWidth="1.5" />
      <line x1="52" y1="28" x2="52" y2="90" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="108" y1="28" x2="108" y2="90" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <ellipse cx="80" cy="90" rx="50" ry="15" fill={BL} stroke={B} strokeWidth="1.5" />
      <ellipse cx="80" cy="90" rx="28" ry="8"  fill="white" stroke={B} strokeWidth="1.5" />
      <line x1="80" y1="90" x2="130" y2="90" stroke={B} strokeWidth="1" strokeDasharray="3,2" />
      <Lbl x="106" y="87">OD/2</Lbl>
      <line x1="80" y1="82" x2="108" y2="82" stroke={B} strokeWidth="1" strokeDasharray="3,2" />
      <Lbl x="93" y="78">ID/2</Lbl>
      <DimLine x1="136" y1="28" x2="136" y2="90" />
      <Lbl x="150" y="61">L</Lbl>
    </Svg>
  );
}

// ── 7. Square Tube ────────────────────────────────────────────
function SquareTubeDiagram() {
  return (
    <Svg>
      {/* Outer square front face */}
      <rect x="28" y="28" width="68" height="68" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Inner hollow */}
      <rect x="42" y="42" width="40" height="40" fill="white" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      {/* Extrusion */}
      <polygon points="96,28 120,12 120,78 96,96" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="28,28 52,12 120,12 96,28" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="28" y1="106" x2="96" y2="106" />
      <Lbl x="62" y="115">Length</Lbl>
      <DimLine x1="16" y1="28" x2="16" y2="96" />
      <Lbl x="8" y="64">OS</Lbl>
      <Lbl x="62" y="64">WT</Lbl>
    </Svg>
  );
}

// ── 8. Rectangular Tube ───────────────────────────────────────
function RectangularTubeDiagram() {
  return (
    <Svg>
      {/* Outer rect */}
      <rect x="16" y="34" width="86" height="56" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Inner hollow */}
      <rect x="28" y="44" width="62" height="36" fill="white" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      {/* Extrusion */}
      <polygon points="102,34 126,20 126,74 102,90" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="16,34 40,20 126,20 102,34" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="16" y1="100" x2="102" y2="100" />
      <Lbl x="59" y="110">Length</Lbl>
      <DimLine x1="6" y1="34" x2="6" y2="90" />
      <Lbl x="4" y="64">H</Lbl>
      <Lbl x="57" y="30">Width</Lbl>
    </Svg>
  );
}

// ── 9. Pipe ───────────────────────────────────────────────────
function PipeDiagram() {
  return (
    <Svg>
      <ellipse cx="80" cy="26" rx="52" ry="14" fill={BM} stroke={B} strokeWidth="1.5" />
      <ellipse cx="80" cy="26" rx="38" ry="10" fill="white" stroke={B} strokeWidth="1.5" />
      <line x1="28" y1="26" x2="28" y2="92" stroke={B} strokeWidth="1.5" />
      <line x1="132" y1="26" x2="132" y2="92" stroke={B} strokeWidth="1.5" />
      <line x1="42" y1="26" x2="42" y2="92" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="118" y1="26" x2="118" y2="92" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <ellipse cx="80" cy="92" rx="52" ry="14" fill={BL} stroke={B} strokeWidth="1.5" />
      <ellipse cx="80" cy="92" rx="38" ry="10" fill="white" stroke={B} strokeWidth="1.5" />
      {/* OD label */}
      <line x1="80" y1="92" x2="132" y2="92" stroke={B} strokeWidth="1" strokeDasharray="3,2" />
      <Lbl x="107" y="89">OD/2</Lbl>
      {/* WT arrow */}
      <DimLine x1="118" y1="106" x2="132" y2="106" />
      <Lbl x="125" y="116">WT</Lbl>
      <DimLine x1="138" y1="26" x2="138" y2="92" />
      <Lbl x="152" y="61">L</Lbl>
    </Svg>
  );
}

// ── 10. Sheet / Plate ─────────────────────────────────────────
function SheetDiagram() {
  return (
    <Svg>
      <rect x="10" y="62" width="108" height="12" fill={BL} stroke={B} strokeWidth="1.5" />
      <polygon points="10,62 28,50 136,50 118,62" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="118,62 136,50 136,62 118,74" fill={BD} stroke={B} strokeWidth="1.5" />
      <DimLine x1="10" y1="84" x2="118" y2="84" />
      <Lbl x="64" y="93">Length</Lbl>
      <DimLine x1="10" y1="54" x2="118" y2="54" />
      <Lbl x="64" y="50">Width</Lbl>
      <DimLine x1="140" y1="62" x2="140" y2="74" />
      <Lbl x="153" y="70">T</Lbl>
    </Svg>
  );
}

// ── 11. Angle ────────────────────────────────────────────────
function AngleDiagram() {
  return (
    <Svg>
      {/* L-shape cross section (front) */}
      <polygon points="24,30 38,30 38,84 80,84 80,100 24,100" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Extrusion */}
      <polygon points="38,30 62,14 106,14 80,30" fill={BM} stroke={B} strokeWidth="1.5" opacity="0.9" />
      <polygon points="80,30 106,14 106,80 80,96" fill={BD} stroke={B} strokeWidth="1.5" />
      <line x1="38" y1="84" x2="62" y2="68" stroke={B} strokeWidth="1.5" />
      <line x1="80" y1="84" x2="106" y2="68" stroke={B} strokeWidth="1.5" />
      <line x1="62" y1="68" x2="106" y2="68" stroke={B} strokeWidth="1.5" />
      <DimLine x1="14" y1="30" x2="14" y2="100" />
      <Lbl x="8" y="67">L1</Lbl>
      <DimLine x1="24" y1="108" x2="80" y2="108" />
      <Lbl x="52" y="117">L2</Lbl>
      <Lbl x="110" y="50">Length</Lbl>
    </Svg>
  );
}

// ── 12. Channel (C-Section) ───────────────────────────────────
function ChannelDiagram() {
  return (
    <Svg>
      {/* C cross-section front face */}
      <polygon points="24,22 60,22 60,36 38,36 38,80 60,80 60,96 24,96" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Extrusion */}
      <polygon points="60,22 86,8 86,50 60,36" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="24,22 50,8 86,8 60,22" fill={BD} stroke={B} strokeWidth="1.5" opacity="0.9" />
      <line x1="24" y1="96" x2="50" y2="82" stroke={B} strokeWidth="1.5" />
      <line x1="60" y1="80" x2="86" y2="66" stroke={B} strokeWidth="1.5" />
      <line x1="50" y1="82" x2="86" y2="82" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <DimLine x1="14" y1="22" x2="14" y2="96" />
      <Lbl x="6" y="61">H</Lbl>
      <DimLine x1="24" y1="106" x2="60" y2="106" />
      <Lbl x="42" y="116">FW</Lbl>
      <Lbl x="92" y="40">Length</Lbl>
    </Svg>
  );
}

// ── 13. T-Bar ─────────────────────────────────────────────────
function TBarDiagram() {
  return (
    <Svg>
      {/* T cross-section front face */}
      <polygon points="20,22 116,22 116,36 72,36 72,96 64,96 64,36 20,36" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Extrusion */}
      <polygon points="116,22 140,8 140,22 116,36" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="20,22 44,8 140,8 116,22" fill={BD} stroke={B} strokeWidth="1.5" opacity="0.9" />
      <line x1="64" y1="96" x2="88" y2="82" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="72" y1="96" x2="96" y2="82" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <DimLine x1="20" y1="44" x2="116" y2="44" />
      <Lbl x="68" y="40">Flange Width</Lbl>
      <DimLine x1="6" y1="36" x2="6" y2="96" />
      <Lbl x="4" y="68">WH</Lbl>
      <Lbl x="144" y="18">L</Lbl>
    </Svg>
  );
}

// ── 14. I-Beam ────────────────────────────────────────────────
function IBeamDiagram() {
  return (
    <Svg>
      {/* I cross-section */}
      <polygon points="18,18 108,18 108,32 68,32 68,82 108,82 108,96 18,96 18,82 58,82 58,32 18,32" fill={BL} stroke={B} strokeWidth="1.5" />
      {/* Extrusion */}
      <polygon points="108,18 132,6 132,20 108,32" fill={BM} stroke={B} strokeWidth="1.5" />
      <polygon points="18,18 42,6 132,6 108,18" fill={BD} stroke={B} strokeWidth="1.5" opacity="0.9" />
      <line x1="108" y1="82" x2="132" y2="70" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="108" y1="96" x2="132" y2="84" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="132" y1="20" x2="132" y2="84" stroke={B} strokeWidth="1.5" strokeDasharray="4,3" />
      <DimLine x1="18" y1="106" x2="108" y2="106" />
      <Lbl x="63" y="115">Flange W</Lbl>
      <DimLine x1="6" y1="18" x2="6" y2="96" />
      <Lbl x="4" y="59">TH</Lbl>
      <Lbl x="138" y="14">L</Lbl>
    </Svg>
  );
}

// ── 15. Custom Volume ─────────────────────────────────────────
function CustomVolumeDiagram() {
  return (
    <Svg>
      <rect x="28" y="40" width="72" height="60" fill={BL} stroke={B} strokeWidth="1.5" strokeDasharray="6,4" />
      <polygon points="28,40 52,20 124,20 100,40" fill={BM} stroke={B} strokeWidth="1.5" strokeDasharray="6,4" />
      <polygon points="100,40 124,20 124,80 100,100" fill={BD} stroke={B} strokeWidth="1.5" strokeDasharray="6,4" />
      <text x="64" y="76" textAnchor="middle" fontSize="22" fill={B} fontWeight="800" fontFamily="system-ui,sans-serif">V</text>
      <text x="64" y="92" textAnchor="middle" fontSize="9" fill={B} fontWeight="600" fontFamily="system-ui,sans-serif">Any Shape</text>
    </Svg>
  );
}

export const AL_SHAPE_DIAGRAMS = {
  "rectangular-bar":  RectangularBarDiagram,
  "round-bar":        RoundBarDiagram,
  "square-bar":       SquareBarDiagram,
  "hex-bar":          HexBarDiagram,
  "flat-bar":         FlatBarDiagram,
  "round-tube":       RoundTubeDiagram,
  "square-tube":      SquareTubeDiagram,
  "rectangular-tube": RectangularTubeDiagram,
  "pipe":             PipeDiagram,
  "sheet":            SheetDiagram,
  "angle":            AngleDiagram,
  "channel":          ChannelDiagram,
  "t-bar":            TBarDiagram,
  "i-beam":           IBeamDiagram,
  "custom-volume":    CustomVolumeDiagram,
};
