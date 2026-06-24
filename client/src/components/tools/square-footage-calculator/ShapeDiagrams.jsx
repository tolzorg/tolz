// SVG shape diagrams for the Square Footage Calculator

const FILL   = "#dbeafe";
const STROKE = "#3b7bfc";
const SW     = 2;
const TEXT   = { fontSize: 10, fontFamily: "sans-serif", fill: STROKE, fontWeight: "600" };
const DASH   = { stroke: STROKE, strokeWidth: 1.4, strokeDasharray: "4,3", fill: "none" };

function RectangleDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <rect x="18" y="24" width="124" height="72" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Length arrow top */}
      <line x1="18" y1="14" x2="142" y2="14" stroke={STROKE} strokeWidth={1.4} />
      <line x1="18" y1="10" x2="18" y2="18" stroke={STROKE} strokeWidth={1.4} />
      <line x1="142" y1="10" x2="142" y2="18" stroke={STROKE} strokeWidth={1.4} />
      <text x="80" y="11" textAnchor="middle" {...TEXT}>Length</text>
      {/* Width arrow right */}
      <line x1="150" y1="24" x2="150" y2="96" stroke={STROKE} strokeWidth={1.4} />
      <line x1="146" y1="24" x2="154" y2="24" stroke={STROKE} strokeWidth={1.4} />
      <line x1="146" y1="96" x2="154" y2="96" stroke={STROKE} strokeWidth={1.4} />
      <text x="158" y="64" textAnchor="middle" {...TEXT} transform="rotate(90,158,64)">Width</text>
    </svg>
  );
}

function SquareDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <rect x="30" y="10" width="100" height="100" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="30" y1="4" x2="130" y2="4" stroke={STROKE} strokeWidth={1.4} />
      <line x1="30" y1="1" x2="30" y2="7" stroke={STROKE} strokeWidth={1.4} />
      <line x1="130" y1="1" x2="130" y2="7" stroke={STROKE} strokeWidth={1.4} />
      <text x="80" y="2" textAnchor="middle" {...TEXT}>Side</text>
      <line x1="136" y1="10" x2="136" y2="110" stroke={STROKE} strokeWidth={1.4} />
      <line x1="132" y1="10" x2="140" y2="10" stroke={STROKE} strokeWidth={1.4} />
      <line x1="132" y1="110" x2="140" y2="110" stroke={STROKE} strokeWidth={1.4} />
      <text x="155" y="64" textAnchor="middle" {...TEXT} transform="rotate(90,155,64)">Side</text>
    </svg>
  );
}

function CircleDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <circle cx="80" cy="60" r="52" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="80" y1="60" x2="132" y2="60" {...DASH} strokeWidth={1.6} />
      <circle cx="80" cy="60" r="3" fill={STROKE} />
      <text x="108" y="55" textAnchor="middle" {...TEXT}>r</text>
    </svg>
  );
}

function TriangleDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <polygon points="80,12 148,108 12,108" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Height dashed line */}
      <line x1="80" y1="12" x2="80" y2="108" {...DASH} />
      {/* Base label */}
      <text x="80" y="118" textAnchor="middle" {...TEXT}>Base</text>
      {/* Height label */}
      <text x="90" y="64" textAnchor="start" {...TEXT}>H</text>
    </svg>
  );
}

function TrapezoidDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <polygon points="45,18 115,18 148,102 12,102" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Top label a */}
      <text x="80" y="14" textAnchor="middle" {...TEXT}>a</text>
      {/* Bottom label b */}
      <text x="80" y="116" textAnchor="middle" {...TEXT}>b</text>
      {/* Height dashed */}
      <line x1="80" y1="18" x2="80" y2="102" {...DASH} />
      <text x="86" y="64" textAnchor="start" {...TEXT}>H</text>
    </svg>
  );
}

function EllipseDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <ellipse cx="80" cy="60" rx="72" ry="44" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Major axis a */}
      <line x1="80" y1="60" x2="152" y2="60" {...DASH} strokeWidth={1.6} />
      <circle cx="80" cy="60" r="3" fill={STROKE} />
      <text x="118" y="55" textAnchor="middle" {...TEXT}>a</text>
      {/* Minor axis b */}
      <line x1="80" y1="60" x2="80" y2="104" {...DASH} strokeWidth={1.6} />
      <text x="87" y="86" textAnchor="start" {...TEXT}>b</text>
    </svg>
  );
}

function SemiCircleDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <path d="M14,86 A66,66 0 0,1 146,86 Z" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="14" y1="86" x2="146" y2="86" stroke={STROKE} strokeWidth={SW} />
      {/* Radius dashed */}
      <line x1="80" y1="86" x2="146" y2="86" {...DASH} strokeWidth={1.6} />
      <circle cx="80" cy="86" r="3" fill={STROKE} />
      <text x="113" y="80" textAnchor="middle" {...TEXT}>r</text>
    </svg>
  );
}

function LShapeDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      {/* L-shape: top-left rectangle + bottom-right extension */}
      <path d="M12,10 L80,10 L80,60 L148,60 L148,110 L12,110 Z"
            fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* A labels */}
      <text x="46" y="8" textAnchor="middle" {...TEXT}>Length A</text>
      <text x="6" y="62" textAnchor="middle" {...TEXT} transform="rotate(-90,6,62)">Width A</text>
      {/* B labels */}
      <text x="114" y="57" textAnchor="middle" {...TEXT}>Length B</text>
      <text x="155" y="88" textAnchor="middle" {...TEXT} transform="rotate(90,155,88)">Width B</text>
    </svg>
  );
}

function RingDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <defs>
        <mask id="ringMask">
          <circle cx="80" cy="60" r="52" fill="white" />
          <circle cx="80" cy="60" r="25" fill="black" />
        </mask>
      </defs>
      <circle cx="80" cy="60" r="52" fill={FILL} stroke={STROKE} strokeWidth={SW} mask="url(#ringMask)" />
      <circle cx="80" cy="60" r="52" fill="none" stroke={STROKE} strokeWidth={SW} />
      <circle cx="80" cy="60" r="25" fill="none" stroke={STROKE} strokeWidth={SW} />
      {/* R line */}
      <line x1="80" y1="60" x2="132" y2="60" {...DASH} strokeWidth={1.6} />
      <circle cx="80" cy="60" r="3" fill={STROKE} />
      <text x="109" y="55" textAnchor="middle" {...TEXT}>R</text>
      {/* r line */}
      <line x1="80" y1="60" x2="80" y2="35" {...DASH} strokeWidth={1.6} />
      <text x="87" y="50" textAnchor="start" {...TEXT}>r</text>
    </svg>
  );
}

function CustomDiagram() {
  return (
    <svg viewBox="0 0 160 120" width="100%" aria-hidden="true">
      <polygon points="80,10 142,42 125,100 35,100 18,42" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <text x="80" y="62" textAnchor="middle" fontSize={12} fontFamily="sans-serif" fill={STROKE} fontWeight="700">Area</text>
      <text x="80" y="78" textAnchor="middle" {...TEXT}>Enter directly</text>
    </svg>
  );
}

export const SHAPE_DIAGRAMS = {
  rectangle:  <RectangleDiagram />,
  square:     <SquareDiagram />,
  circle:     <CircleDiagram />,
  triangle:   <TriangleDiagram />,
  trapezoid:  <TrapezoidDiagram />,
  ellipse:    <EllipseDiagram />,
  semicircle: <SemiCircleDiagram />,
  lshape:     <LShapeDiagram />,
  ring:       <RingDiagram />,
  custom:     <CustomDiagram />,
};
