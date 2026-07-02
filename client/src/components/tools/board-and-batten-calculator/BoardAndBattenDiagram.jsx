// SVG front-elevation diagram for Board & Batten wall layout
// Shows boards, battens, openings, margins, and dimension labels.

const COLORS = {
  wallBg:      "#f0f4f8",
  wallStroke:  "#94a3b8",
  board:       "#d4a574",
  boardStroke: "#a0724a",
  batten:      "#8b5e3c",
  battenStroke:"#5c3d20",
  margin:      "#fef3c7",
  marginPat:   "#fcd34d",
  door:        "#ffffff",
  doorStroke:  "#3b82f6",
  window:      "#bfdbfe",
  windowStroke:"#3b82f6",
  garage:      "#ffffff",
  garageStroke:"#6b7280",
  utility:     "#e5e7eb",
  utilStroke:  "#6b7280",
  dim:         "#64748b",
  dimAccent:   "#0284c7",
  label:       "#1e3a5f",
};

function Txt({ x, y, s = 8, anchor = "middle", fill = COLORS.dim, bold = false, children }) {
  return (
    <text x={x} y={y} fontSize={s} fontFamily="sans-serif" textAnchor={anchor}
      fill={fill} fontWeight={bold ? 700 : 400}>{children}</text>
  );
}

function DimLine({ x1, y1, x2, y2, label, labelX, labelY, vertical = false }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.dimAccent} strokeWidth={0.7} strokeDasharray="3,2" />
      {!vertical && (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke={COLORS.dimAccent} strokeWidth={0.8} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke={COLORS.dimAccent} strokeWidth={0.8} />
        </>
      )}
      {vertical && (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke={COLORS.dimAccent} strokeWidth={0.8} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke={COLORS.dimAccent} strokeWidth={0.8} />
        </>
      )}
      <Txt x={labelX} y={labelY} s={7.5} fill={COLORS.dimAccent}>{label}</Txt>
    </g>
  );
}

// Opening shape with label
function Opening({ x, y, w, h, type }) {
  const colors = {
    door:        { fill: COLORS.door,    stroke: COLORS.doorStroke,    label: "DOOR" },
    window:      { fill: COLORS.window,  stroke: COLORS.windowStroke,  label: "WIN" },
    garage_door: { fill: COLORS.garage,  stroke: COLORS.garageStroke,  label: "GARAGE" },
    utility:     { fill: COLORS.utility, stroke: COLORS.utilStroke,    label: "UTIL" },
    custom:      { fill: COLORS.utility, stroke: COLORS.utilStroke,    label: "" },
  };
  const c = colors[type] || colors.custom;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
      {w > 16 && h > 12 && (
        <Txt x={x + w / 2} y={y + h / 2 + 3} s={6} fill={c.stroke} bold>{c.label}</Txt>
      )}
      {/* Window sill line */}
      {type === "window" && h > 10 && (
        <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={c.stroke} strokeWidth={1.5} />
      )}
    </g>
  );
}

// Hatched margin rectangle
function MarginRect({ x, y, w, h }) {
  if (w <= 0 || h <= 0) return null;
  const patId = `hatch_${Math.round(x)}`;
  return (
    <g>
      <defs>
        <pattern id={patId} patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke={COLORS.marginPat} strokeWidth={0.8} opacity={0.5} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${patId})`} stroke={COLORS.marginPat} strokeWidth={0.5} opacity={0.6} />
    </g>
  );
}

export default function BoardAndBattenDiagram({ result, wallIdx = 0, wallWidthM, wallHeightM, openings = [] }) {
  const VW = 620, VH = 300;
  const PAD_L = 44, PAD_R = 20, PAD_T = 24, PAD_B = 46;
  const drawW = VW - PAD_L - PAD_R;
  const drawH = VH - PAD_T - PAD_B;

  const wallW = wallWidthM  > 0 ? wallWidthM  : 7.3152; // 24ft fallback
  const wallH = wallHeightM > 0 ? wallHeightM : 3.048;  // 10ft fallback

  const scaleX = drawW / wallW;
  const scaleH = drawH / wallH;
  const scale  = Math.min(scaleX, scaleH) * 0.92;

  const wallPxW = wallW * scale;
  const wallPxH = wallH * scale;
  const wx = PAD_L + (drawW - wallPxW) / 2;
  const wy = PAD_T + (drawH - wallPxH) / 2;

  // Get per-wall layout positions
  const wallData = result?.perWall?.[wallIdx];
  const positions = wallData?.layout?.positions || [];
  const leftMarginM  = wallData?.layout?.leftMarginM  || 0;
  const rightMarginM = wallData?.layout?.rightMarginM || 0;
  const wallOps = wallData?.wallOpenings || openings.filter(o => o.wallId === (wallData?.wall?.id));

  // Max displayable pieces (compact if too many)
  const maxShow = 60;
  const tooDense = positions.length > maxShow;

  // Convert opening to pixel coords (approximate vertical placement for display)
  function opToPx(op) {
    const ow = (op.widthM  || 0) * scale;
    const oh = (op.heightM || 0) * scale;
    const ox = wx + (op.offsetXM !== undefined ? op.offsetXM * scale : (wallPxW * 0.3));
    const isBottom = op.type === "door" || op.type === "garage_door";
    const oy = isBottom ? wy + wallPxH - oh : wy + wallPxH * 0.2;
    return { ox, oy, ow: Math.max(ow, 6), oh: Math.max(oh, 6) };
  }

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "auto", display: "block" }}
      xmlns="http://www.w3.org/2000/svg" aria-label="Board and batten wall diagram">

      {/* Wall background */}
      <rect x={wx} y={wy} width={wallPxW} height={wallPxH}
        fill={COLORS.wallBg} stroke={COLORS.wallStroke} strokeWidth={1.5} />

      {/* Margin indicators */}
      <MarginRect x={wx} y={wy} w={leftMarginM  * scale} h={wallPxH} />
      <MarginRect x={wx + wallPxW - rightMarginM * scale} y={wy} w={rightMarginM * scale} h={wallPxH} />

      {/* Boards and battens */}
      {!tooDense && positions.map((pos, i) => {
        const px = wx + pos.x * scale;
        const pw = pos.width * scale;
        if (pw < 0.5) return null;
        const isBoard = pos.type === "board";
        return (
          <rect key={i}
            x={px} y={wy} width={pw} height={wallPxH}
            fill={isBoard ? COLORS.board : COLORS.batten}
            stroke={isBoard ? COLORS.boardStroke : COLORS.battenStroke}
            strokeWidth={isBoard ? 0.6 : 0.4}
            rx={isBoard ? 1 : 0}
          />
        );
      })}

      {/* Compact view when too many pieces */}
      {tooDense && (() => {
        const b = positions.filter(p => p.type === "board");
        const t = positions.filter(p => p.type === "batten");
        return (
          <>
            {b.slice(0, 30).map((pos, i) => {
              const px = wx + pos.x * scale;
              const pw = pos.width * scale;
              return <rect key={i} x={px} y={wy} width={Math.max(pw, 1)} height={wallPxH} fill={COLORS.board} stroke={COLORS.boardStroke} strokeWidth={0.4} />;
            })}
            {t.slice(0, 30).map((pos, i) => {
              const px = wx + pos.x * scale;
              const pw = pos.width * scale;
              return <rect key={`b${i}`} x={px} y={wy} width={Math.max(pw, 0.8)} height={wallPxH} fill={COLORS.batten} strokeWidth={0} />;
            })}
          </>
        );
      })()}

      {/* Openings overlay */}
      {wallOps.map((op, i) => {
        const { ox, oy, ow, oh } = opToPx(op);
        if (ox < wx || ox + ow > wx + wallPxW) return null;
        return <Opening key={i} x={ox} y={oy} w={ow} h={oh} type={op.type} />;
      })}

      {/* Wall outline on top */}
      <rect x={wx} y={wy} width={wallPxW} height={wallPxH}
        fill="none" stroke={COLORS.wallStroke} strokeWidth={1.5} />

      {/* Width dimension */}
      <DimLine
        x1={wx} y1={wy + wallPxH + 18}
        x2={wx + wallPxW} y2={wy + wallPxH + 18}
        label={`${(wallW * 3.28084).toFixed(1)} ft (${wallW.toFixed(2)} m)`}
        labelX={wx + wallPxW / 2} labelY={wy + wallPxH + 30}
      />

      {/* Height dimension */}
      <g transform={`translate(${wx - 14}, ${wy + wallPxH / 2})`}>
        <g transform="rotate(-90)">
          <Txt x={0} y={0} s={7.5} fill={COLORS.dimAccent}>
            {`${(wallH * 3.28084).toFixed(1)} ft`}
          </Txt>
        </g>
      </g>
      <line x1={wx - 4} y1={wy} x2={wx - 4} y2={wy + wallPxH} stroke={COLORS.dimAccent} strokeWidth={0.7} strokeDasharray="3,2" />
      <line x1={wx - 7} y1={wy} x2={wx - 1} y2={wy} stroke={COLORS.dimAccent} strokeWidth={0.8} />
      <line x1={wx - 7} y1={wy + wallPxH} x2={wx - 1} y2={wy + wallPxH} stroke={COLORS.dimAccent} strokeWidth={0.8} />

      {/* Legend */}
      <rect x={VW - 120} y={8} width={10} height={10} fill={COLORS.board} stroke={COLORS.boardStroke} strokeWidth={0.6} />
      <Txt x={VW - 106} y={17} s={8} anchor="start" fill={COLORS.label}>Board</Txt>
      <rect x={VW - 120} y={22} width={10} height={10} fill={COLORS.batten} stroke={COLORS.battenStroke} strokeWidth={0.4} />
      <Txt x={VW - 106} y={31} s={8} anchor="start" fill={COLORS.label}>Batten</Txt>
      {(leftMarginM > 0 || rightMarginM > 0) && (
        <>
          <rect x={VW - 120} y={36} width={10} height={10} fill={COLORS.marginPat} opacity={0.5} />
          <Txt x={VW - 106} y={45} s={8} anchor="start" fill={COLORS.label}>Margin</Txt>
        </>
      )}

      {/* Board / batten count */}
      {wallData && (
        <Txt x={wx + wallPxW / 2} y={wy - 10} s={8} fill={COLORS.label} bold>
          {wallData.boardCount} boards · {wallData.battenCount} battens
        </Txt>
      )}
    </svg>
  );
}
