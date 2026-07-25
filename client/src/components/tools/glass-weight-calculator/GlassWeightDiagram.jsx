// Simple illustrative 3D outline of the selected glass shape, showing which
// dimensions (height/width/side/base/diameter/axes + thickness) feed into
// the area and volume formulas.

const EDGE   = "#2563eb";
const HIDDEN = "#94a3b8";
const LBL    = "#1f2937";

const DX = 40, DY = -30; // extrusion offset (thickness direction, drawn back-right)

function Prism({ front }) {
  const back = front.map(([x, y]) => [x + DX, y + DY]);
  const path = (pts) => `M ${pts.map((p) => p.join(",")).join(" L ")} Z`;
  return (
    <g>
      <path d={path(back)} fill="none" stroke={HIDDEN} strokeWidth={1.5} />
      {front.map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={back[i][0]} y2={back[i][1]} stroke={HIDDEN} strokeWidth={1.5} />
      ))}
      <path d={path(front)} fill="rgba(37,99,235,0.06)" stroke={EDGE} strokeWidth={2} />
    </g>
  );
}

function Label({ x, y, children, anchor = "middle" }) {
  return (
    <text x={x} y={y} fontSize={13} fontFamily="sans-serif" fontWeight={700}
      fill={LBL} textAnchor={anchor}>{children}</text>
  );
}

export default function GlassWeightDiagram({ shape = "rectangular" }) {
  return (
    <svg viewBox="0 0 300 190" style={{ width: "100%", height: "auto", display: "block" }}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

      {(shape === "rectangular" || shape === "square") && (
        <>
          <Prism front={[[70, 150], [190, 150], [190, 70], [70, 70]]} />
          <Label x={130} y={168}>{shape === "square" ? "s" : "h"}</Label>
          <Label x={222} y={98}>{shape === "square" ? "s" : "w"}</Label>
          <Label x={202} y={112}>t</Label>
        </>
      )}

      {shape === "triangular" && (
        <>
          <Prism front={[[60, 150], [180, 150], [120, 70]]} />
          <line x1={120} y1={150} x2={120} y2={70} stroke={HIDDEN} strokeWidth={1.5} strokeDasharray="3,3" />
          <Label x={120} y={168}>b</Label>
          <Label x={106} y={112}>h</Label>
          <Label x={222} y={98}>t</Label>
        </>
      )}

      {shape === "circular" && (
        <>
          <ellipse cx={140} cy={130} rx={70} ry={22} fill="none" stroke={HIDDEN} strokeWidth={1.5} strokeDasharray="4,4" />
          <line x1={70}  y1={130} x2={70}  y2={70} stroke={EDGE} strokeWidth={2} />
          <line x1={210} y1={130} x2={210} y2={70} stroke={EDGE} strokeWidth={2} />
          <path d="M 70 70 A 70 22 0 0 1 210 70" fill="none" stroke={EDGE} strokeWidth={2} />
          <ellipse cx={140} cy={70} rx={70} ry={22} fill="rgba(37,99,235,0.06)" stroke="none" />
          <line x1={70} y1={70} x2={210} y2={70} stroke={EDGE} strokeWidth={1.5} strokeDasharray="3,3" />
          <Label x={140} y={64}>⌀</Label>
          <Label x={225} y={102}>t</Label>
        </>
      )}

      {shape === "semi-circular" && (
        <>
          <path d="M 70 130 A 70 22 0 0 1 210 130" fill="none" stroke={HIDDEN} strokeWidth={1.5} strokeDasharray="4,4" />
          <line x1={70}  y1={130} x2={70}  y2={70} stroke={EDGE} strokeWidth={2} />
          <line x1={210} y1={130} x2={210} y2={70} stroke={EDGE} strokeWidth={2} />
          <path d="M 70 70 A 70 22 0 0 1 210 70" fill="none" stroke={EDGE} strokeWidth={2} />
          <path d="M 70 70 A 70 22 0 0 1 210 70 L 210 130 A 70 22 0 0 1 70 130 Z" fill="rgba(37,99,235,0.06)" stroke="none" />
          <line x1={70} y1={130} x2={210} y2={130} stroke={EDGE} strokeWidth={2} />
          <line x1={70} y1={70} x2={210} y2={70} stroke={EDGE} strokeWidth={1.5} strokeDasharray="3,3" />
          <Label x={140} y={64}>⌀</Label>
          <Label x={225} y={102}>t</Label>
        </>
      )}

      {shape === "elliptical" && (
        <>
          <ellipse cx={140} cy={130} rx={70} ry={16} fill="none" stroke={HIDDEN} strokeWidth={1.5} strokeDasharray="4,4" />
          <line x1={70}  y1={130} x2={70}  y2={70} stroke={EDGE} strokeWidth={2} />
          <line x1={210} y1={130} x2={210} y2={70} stroke={EDGE} strokeWidth={2} />
          <path d="M 70 70 A 70 16 0 0 1 210 70" fill="none" stroke={EDGE} strokeWidth={2} />
          <ellipse cx={140} cy={70} rx={70} ry={16} fill="rgba(37,99,235,0.06)" stroke="none" />
          <line x1={140} y1={54} x2={140} y2={86} stroke={EDGE} strokeWidth={1.5} strokeDasharray="3,3" />
          <line x1={70} y1={70} x2={210} y2={70} stroke={EDGE} strokeWidth={1.5} strokeDasharray="3,3" />
          <Label x={140} y={48}>b</Label>
          <Label x={140} y={100}>a</Label>
          <Label x={225} y={102}>t</Label>
        </>
      )}

      {shape === "round-rod" && (
        <>
          <ellipse cx={80} cy={100} rx={14} ry={30} fill="none" stroke={HIDDEN} strokeWidth={1.5} strokeDasharray="4,4" />
          <line x1={80}  y1={70}  x2={220} y2={70}  stroke={EDGE} strokeWidth={2} />
          <line x1={80}  y1={130} x2={220} y2={130} stroke={EDGE} strokeWidth={2} />
          <path d="M 220 70 A 14 30 0 0 1 220 130" fill="none" stroke={EDGE} strokeWidth={2} />
          <ellipse cx={220} cy={100} rx={14} ry={30} fill="rgba(37,99,235,0.06)" stroke="none" />
          <path d="M 220 70 A 14 30 0 0 1 220 130" fill="none" stroke={EDGE} strokeWidth={2} />
          <line x1={220} y1={70} x2={220} y2={130} stroke={EDGE} strokeWidth={1.5} strokeDasharray="3,3" />
          <Label x={220} y={64}>⌀</Label>
          <Label x={150} y={155}>l</Label>
        </>
      )}

      {shape === "other" && (
        <>
          <path d="M 90 145 L 65 100 L 100 65 L 175 70 L 205 110 L 165 150 Z"
            fill="rgba(37,99,235,0.06)" stroke={EDGE} strokeWidth={2} strokeDasharray="5,3" />
          <Label x={135} y={112}>A</Label>
          <Label x={135} y={175} anchor="middle">Custom area</Label>
        </>
      )}
    </svg>
  );
}
