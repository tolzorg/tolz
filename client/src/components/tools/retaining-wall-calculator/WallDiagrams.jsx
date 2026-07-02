// SVG cross-section diagrams for each retaining wall type

const C = {
  stem:    "#bae6fd",
  stemStk: "#0284c7",
  footing: "#7dd3fc",
  ftgStk:  "#0369a1",
  block:   "#d1d5db",
  blockStk:"#6b7280",
  blockAlt:"#e5e7eb",
  stone:   "#d6d3d1",
  stoneStk:"#78716c",
  soil:    "#fef3c7",
  soilStk: "#92400e",
  gravel:  "#d1fae5",
  grvlStk: "#059669",
  pipe:    "#fca5a5",
  accent:  "#0284c7",
  dim:     "#6b7280",
  label:   "#374151",
  buried:  "#e0f2fe",
  buriedStk: "#0369a1",
};

function Svg({ w = 260, h = 200, children }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block", maxWidth: w }}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

function Txt({ x, y, s = 7, anchor = "middle", fill = C.accent, bold = false, children }) {
  return (
    <text x={x} y={y} fontSize={s} fontFamily="sans-serif" textAnchor={anchor}
      fill={fill} fontWeight={bold ? 700 : 400}>{children}</text>
  );
}

function DimArrow({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth={0.6} strokeDasharray="2,1.5" />;
}

// Annotation bar shown at top when openings present
function OpeningNote({ x, y, w, count }) {
  if (!count || count === 0) return null;
  return (
    <g>
      <rect x={x} y={y - 9} width={w} height={10} rx={2} fill="#fef3c7" stroke="#f59e0b" strokeWidth={0.5} />
      <Txt x={x + w / 2} y={y - 1} s={5.5} fill="#92400e">{count} opening{count > 1 ? "s" : ""} excluded</Txt>
    </g>
  );
}

// ── Concrete Wall ─────────────────────────────────────────────────
export function ConcreteWallDiagram({ footingEnabled, drainageEnabled, openingCount = 0, buriedHeightM = 0, exposedHeightM = 0 }) {
  const W = 240, H = 200;
  const stemX = 100, stemW = 30, stemTopY = 36, stemH = 100;
  const ftgX = 75, ftgW = 80, ftgH = footingEnabled ? 25 : 0;
  const ftgTopY = stemTopY + stemH;
  const baseY = ftgTopY + ftgH;
  const soilX = stemX + stemW;
  const soilW = 75;
  const drainW = 18, drainH = 30;

  // Buried zone: fraction of stem height that is below grade
  const totalH = exposedHeightM + buriedHeightM;
  const buriedFrac = totalH > 0 ? Math.min(buriedHeightM / totalH, 0.9) : 0;
  const buriedPx = Math.round(stemH * buriedFrac);
  const gradeY = ftgTopY - buriedPx;  // grade line moves up if buried

  return (
    <Svg w={W} h={H}>
      <OpeningNote x={stemX} y={stemTopY} w={stemW + soilW} count={openingCount} />

      {/* Soil / backfill */}
      <rect x={soilX} y={stemTopY} width={soilW} height={stemH + ftgH}
        fill={C.soil} stroke={C.soilStk} strokeWidth={0.5} opacity={0.6} />
      <Txt x={soilX + soilW / 2} y={stemTopY + (stemH + ftgH) / 2 + 3} fill={C.soilStk} s={7}>Backfill</Txt>

      {/* Drainage gravel */}
      {drainageEnabled && (
        <>
          <rect x={soilX} y={ftgTopY - drainH} width={drainW} height={drainH + ftgH}
            fill={C.gravel} stroke={C.grvlStk} strokeWidth={0.6} opacity={0.85} />
          <circle cx={soilX + drainW / 2} cy={ftgTopY + ftgH / 2} r={3}
            fill={C.pipe} stroke="#ef4444" strokeWidth={0.5} />
          <Txt x={soilX + drainW / 2} y={ftgTopY - drainH - 3} fill={C.grvlStk} s={6}>Gravel</Txt>
        </>
      )}

      {/* Buried stem zone (below grade) */}
      {buriedFrac > 0 && (
        <rect x={stemX} y={gradeY} width={stemW} height={buriedPx}
          fill={C.buried} stroke={C.buriedStk} strokeWidth={0.5} opacity={0.6} />
      )}

      {/* Exposed stem */}
      <rect x={stemX} y={stemTopY} width={stemW} height={stemH - buriedPx}
        fill={C.stem} stroke={C.stemStk} strokeWidth={1.2} />
      {buriedFrac > 0 && (
        <rect x={stemX} y={gradeY} width={stemW} height={buriedPx}
          fill={C.buried} stroke={C.stemStk} strokeWidth={1.2} />
      )}
      {buriedFrac === 0 && (
        <rect x={stemX} y={stemTopY} width={stemW} height={stemH}
          fill={C.stem} stroke={C.stemStk} strokeWidth={1.2} />
      )}
      <Txt x={stemX + stemW / 2} y={stemTopY + (stemH - buriedPx) / 2 + 3} fill={C.stemStk} s={7} bold>STEM</Txt>

      {/* Footing */}
      {footingEnabled && (
        <rect x={ftgX} y={ftgTopY} width={ftgW} height={ftgH}
          fill={C.footing} stroke={C.ftgStk} strokeWidth={1.2} />
      )}
      {footingEnabled && (
        <Txt x={ftgX + ftgW / 2} y={ftgTopY + ftgH / 2 + 3} fill={C.ftgStk} s={6}>FOOTING</Txt>
      )}

      {/* Ground line */}
      <line x1={40} y1={gradeY} x2={W - 10} y2={gradeY} stroke={C.dim} strokeWidth={1} strokeDasharray="5,3" />
      <Txt x={44} y={gradeY - 3} fill={C.dim} s={6} anchor="start">grade</Txt>

      {buriedFrac > 0 && (
        <Txt x={stemX - 2} y={gradeY + buriedPx / 2 + 3} fill={C.buriedStk} s={5.5} anchor="end">buried</Txt>
      )}

      {/* Dimension: height */}
      <DimArrow x1={stemX - 10} y1={stemTopY} x2={stemX - 10} y2={ftgTopY} />
      <line x1={stemX - 13} y1={stemTopY} x2={stemX - 7} y2={stemTopY} stroke={C.accent} strokeWidth={0.6} />
      <line x1={stemX - 13} y1={ftgTopY} x2={stemX - 7} y2={ftgTopY} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={stemX - 20} y={(stemTopY + ftgTopY) / 2 + 3} fill={C.accent} s={7}>H</Txt>

      {/* Dimension: stem thickness */}
      <DimArrow x1={stemX} y1={stemTopY - 8} x2={stemX + stemW} y2={stemTopY - 8} />
      <line x1={stemX} y1={stemTopY - 11} x2={stemX} y2={stemTopY - 5} stroke={C.accent} strokeWidth={0.6} />
      <line x1={stemX + stemW} y1={stemTopY - 11} x2={stemX + stemW} y2={stemTopY - 5} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={stemX + stemW / 2} y={stemTopY - 11} fill={C.accent} s={6}>T</Txt>

      {/* Dimension: footing width */}
      {footingEnabled && (
        <>
          <DimArrow x1={ftgX} y1={baseY + 10} x2={ftgX + ftgW} y2={baseY + 10} />
          <line x1={ftgX} y1={baseY + 7} x2={ftgX} y2={baseY + 13} stroke={C.accent} strokeWidth={0.6} />
          <line x1={ftgX + ftgW} y1={baseY + 7} x2={ftgX + ftgW} y2={baseY + 13} stroke={C.accent} strokeWidth={0.6} />
          <Txt x={ftgX + ftgW / 2} y={baseY + 20} fill={C.ftgStk} s={6}>Footing Width</Txt>
        </>
      )}

      {/* Title */}
      <Txt x={W / 2} y={H - 5} fill={C.dim} s={8} bold>Poured Concrete Wall — Cross Section</Txt>
    </Svg>
  );
}

// ── CMU Wall ──────────────────────────────────────────────────────
export function CMUWallDiagram({ numCourses = 6, footingEnabled, drainageEnabled, openingCount = 0, buriedHeightM = 0, exposedHeightM = 0 }) {
  const W = 240, H = 200;
  const wallX = 90, wallW = 40;
  const wallTopY = 30;
  const maxCourses = Math.min(numCourses || 6, 10);
  const courseH = 10, mortarH = 2;
  const courseUnit = courseH + mortarH;
  const wallH = maxCourses * courseUnit;
  const ftgH = footingEnabled ? 20 : 0;
  const baseY = wallTopY + wallH + ftgH;
  const soilX = wallX + wallW;
  const drainW = 16;

  const totalH = exposedHeightM + buriedHeightM;
  const buriedFrac = totalH > 0 ? Math.min(buriedHeightM / totalH, 0.9) : 0;
  const buriedPx = Math.round(wallH * buriedFrac);
  const gradeY = wallTopY + wallH - buriedPx;

  return (
    <Svg w={W} h={H}>
      <OpeningNote x={wallX} y={wallTopY} w={wallW + 70} count={openingCount} />

      {/* Soil */}
      <rect x={soilX} y={wallTopY} width={70} height={wallH + ftgH}
        fill={C.soil} stroke={C.soilStk} strokeWidth={0.5} opacity={0.6} />
      <Txt x={soilX + 35} y={wallTopY + (wallH + ftgH) / 2 + 3} fill={C.soilStk} s={7}>Backfill</Txt>

      {/* Drainage gravel */}
      {drainageEnabled && (
        <>
          <rect x={soilX} y={wallTopY + wallH - 20} width={drainW} height={20 + ftgH}
            fill={C.gravel} stroke={C.grvlStk} strokeWidth={0.6} opacity={0.85} />
          <circle cx={soilX + drainW / 2} cy={wallTopY + wallH + ftgH / 2} r={3}
            fill={C.pipe} stroke="#ef4444" strokeWidth={0.5} />
        </>
      )}

      {/* Block courses */}
      {Array.from({ length: maxCourses }).map((_, i) => {
        const y = wallTopY + i * courseUnit;
        const isAlt = i % 2 === 1;
        const isBuried = y >= gradeY;
        return (
          <g key={i}>
            <rect x={wallX} y={y} width={wallW} height={courseH}
              fill={isBuried ? "#bfdbfe" : (isAlt ? C.blockAlt : C.block)}
              stroke={C.blockStk} strokeWidth={0.5} />
            <line x1={wallX + wallW / 2} y1={y} x2={wallX + wallW / 2} y2={y + courseH}
              stroke={C.blockStk} strokeWidth={0.3} strokeDasharray="2,1" />
          </g>
        );
      })}

      {/* Mortar joints */}
      {Array.from({ length: maxCourses - 1 }).map((_, i) => {
        const y = wallTopY + (i + 1) * courseUnit - mortarH;
        return (
          <rect key={i} x={wallX} y={y} width={wallW} height={mortarH}
            fill="#9ca3af" opacity={0.5} />
        );
      })}

      {/* Footing */}
      {footingEnabled && (
        <rect x={wallX - 20} y={wallTopY + wallH} width={wallW + 40} height={ftgH}
          fill={C.footing} stroke={C.ftgStk} strokeWidth={1.2} />
      )}
      {footingEnabled && (
        <Txt x={wallX + wallW / 2} y={wallTopY + wallH + ftgH / 2 + 3} fill={C.ftgStk} s={6}>FOOTING</Txt>
      )}

      {/* Ground line */}
      <line x1={35} y1={gradeY} x2={W - 10} y2={gradeY} stroke={C.dim} strokeWidth={1} strokeDasharray="5,3" />
      <Txt x={38} y={gradeY - 3} fill={C.dim} s={6} anchor="start">grade</Txt>

      {buriedFrac > 0 && (
        <Txt x={wallX - 2} y={gradeY + buriedPx / 2 + 3} fill={C.buriedStk} s={5.5} anchor="end">buried</Txt>
      )}

      {/* Dimension: height */}
      <DimArrow x1={wallX - 12} y1={wallTopY} x2={wallX - 12} y2={wallTopY + wallH} />
      <line x1={wallX - 15} y1={wallTopY} x2={wallX - 9} y2={wallTopY} stroke={C.accent} strokeWidth={0.6} />
      <line x1={wallX - 15} y1={wallTopY + wallH} x2={wallX - 9} y2={wallTopY + wallH} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={wallX - 22} y={(wallTopY * 2 + wallH) / 2 + 3} fill={C.accent} s={7}>H</Txt>

      {/* Course count label */}
      <Txt x={wallX + wallW + 5} y={wallTopY + 8} fill={C.dim} s={6} anchor="start">{maxCourses} courses</Txt>

      {/* Title */}
      <Txt x={W / 2} y={H - 5} fill={C.dim} s={8} bold>CMU Block Wall — Cross Section</Txt>
    </Svg>
  );
}

// ── Segmental Wall ────────────────────────────────────────────────
export function SegmentalWallDiagram({ numCourses = 5, setbackPerCourseM = 0.015, footingEnabled, drainageEnabled, openingCount = 0, buriedHeightM = 0, exposedHeightM = 0 }) {
  const W = 240, H = 200;
  const baseWallX = 100, wallW = 32;
  const wallTopY = 30;
  const maxCourses = Math.min(numCourses || 5, 10);
  const courseH = 11;
  const wallH = maxCourses * courseH;
  const ftgH = footingEnabled ? 20 : 0;
  const baseY = wallTopY + wallH + ftgH;
  const setbackPx = Math.min(setbackPerCourseM * 60, 5);

  const totalH = exposedHeightM + buriedHeightM;
  const buriedFrac = totalH > 0 ? Math.min(buriedHeightM / totalH, 0.9) : 0;
  const buriedCoursesCount = Math.round(maxCourses * buriedFrac);
  const gradeY = wallTopY + (maxCourses - buriedCoursesCount) * courseH;

  return (
    <Svg w={W} h={H}>
      <OpeningNote x={baseWallX} y={wallTopY} w={wallW + 70} count={openingCount} />

      {/* Soil */}
      <rect x={baseWallX + wallW} y={wallTopY} width={70} height={wallH + ftgH}
        fill={C.soil} stroke={C.soilStk} strokeWidth={0.5} opacity={0.6} />
      <Txt x={baseWallX + wallW + 35} y={wallTopY + (wallH + ftgH) / 2 + 3} fill={C.soilStk} s={7}>Backfill</Txt>

      {/* Drainage gravel */}
      {drainageEnabled && (
        <rect x={baseWallX + wallW} y={wallTopY + wallH - 20} width={16} height={20 + ftgH}
          fill={C.gravel} stroke={C.grvlStk} strokeWidth={0.6} opacity={0.85} />
      )}

      {/* Battered block courses (bottom to top) */}
      {Array.from({ length: maxCourses }).map((_, i) => {
        const courseFromBottom = maxCourses - 1 - i;
        const xOffset = courseFromBottom * setbackPx;
        const x = baseWallX + xOffset;
        const y = wallTopY + i * courseH;
        const isBuried = i >= (maxCourses - buriedCoursesCount);
        return (
          <rect key={i} x={x} y={y} width={wallW} height={courseH - 1}
            fill={isBuried ? "#bfdbfe" : (i % 2 === 0 ? C.block : C.blockAlt)}
            stroke={C.blockStk} strokeWidth={0.6} />
        );
      })}

      {/* Footing */}
      {footingEnabled && (
        <rect x={baseWallX - 20} y={wallTopY + wallH} width={wallW + 40} height={ftgH}
          fill={C.footing} stroke={C.ftgStk} strokeWidth={1.2} />
      )}

      {/* Ground line */}
      <line x1={35} y1={gradeY} x2={W - 10} y2={gradeY} stroke={C.dim} strokeWidth={1} strokeDasharray="5,3" />
      <Txt x={38} y={gradeY - 3} fill={C.dim} s={6} anchor="start">grade</Txt>

      {buriedFrac > 0 && (
        <Txt x={baseWallX - 2} y={gradeY + buriedCoursesCount * courseH / 2 + 3} fill={C.buriedStk} s={5.5} anchor="end">buried</Txt>
      )}

      {/* Batter angle indicator */}
      {setbackPerCourseM > 0 && (
        <>
          <line x1={baseWallX} y1={wallTopY + wallH} x2={baseWallX + (maxCourses - 1) * setbackPx} y2={wallTopY}
            stroke={C.accent} strokeWidth={0.7} strokeDasharray="3,2" />
          <Txt x={baseWallX - 15} y={wallTopY + wallH / 2} fill={C.accent} s={6} anchor="end">Batter</Txt>
        </>
      )}

      {/* Dimension: height */}
      <DimArrow x1={baseWallX - 12} y1={wallTopY} x2={baseWallX - 12} y2={wallTopY + wallH} />
      <line x1={baseWallX - 15} y1={wallTopY} x2={baseWallX - 9} y2={wallTopY} stroke={C.accent} strokeWidth={0.6} />
      <line x1={baseWallX - 15} y1={wallTopY + wallH} x2={baseWallX - 9} y2={wallTopY + wallH} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={baseWallX - 22} y={(wallTopY * 2 + wallH) / 2 + 3} fill={C.accent} s={7}>H</Txt>

      <Txt x={W / 2} y={H - 5} fill={C.dim} s={8} bold>Segmental Wall — Cross Section</Txt>
    </Svg>
  );
}

// ── Stone Wall ────────────────────────────────────────────────────
export function StoneWallDiagram({ isMortared = true, footingEnabled, drainageEnabled, openingCount = 0, buriedHeightM = 0, exposedHeightM = 0 }) {
  const W = 240, H = 200;
  const wallX = 88, wallW = 44, wallTopY = 30, wallH = 105;
  const ftgH = footingEnabled ? 22 : 0;
  const baseY = wallTopY + wallH + ftgH;
  const soilX = wallX + wallW;
  const drainW = 16;

  const totalH = exposedHeightM + buriedHeightM;
  const buriedFrac = totalH > 0 ? Math.min(buriedHeightM / totalH, 0.9) : 0;
  const buriedPx = Math.round(wallH * buriedFrac);
  const gradeY = wallTopY + wallH - buriedPx;

  // Randomized-looking stone pattern (deterministic offsets)
  const stones = [
    { x: 2, y: 0,   w: 20, h: 11 }, { x: 22, y: 0,  w: 22, h: 11 },
    { x: 0, y: 13,  w: 14, h: 12 }, { x: 14, y: 13, w: 16, h: 12 }, { x: 30, y: 13, w: 14, h: 12 },
    { x: 3, y: 27,  w: 18, h: 11 }, { x: 21, y: 27, w: 20, h: 11 },
    { x: 0, y: 40,  w: 15, h: 12 }, { x: 15, y: 40, w: 14, h: 12 }, { x: 29, y: 40, w: 15, h: 12 },
    { x: 2, y: 54,  w: 22, h: 11 }, { x: 24, y: 54, w: 18, h: 11 },
    { x: 0, y: 67,  w: 13, h: 12 }, { x: 13, y: 67, w: 18, h: 12 }, { x: 31, y: 67, w: 13, h: 12 },
    { x: 3, y: 81,  w: 17, h: 12 }, { x: 20, y: 81, w: 22, h: 12 },
    { x: 0, y: 95,  w: 22, h: 10 }, { x: 22, y: 95, w: 22, h: 10 },
  ];

  return (
    <Svg w={W} h={H}>
      <OpeningNote x={wallX} y={wallTopY} w={wallW + 72} count={openingCount} />

      {/* Soil */}
      <rect x={soilX} y={wallTopY} width={72} height={wallH + ftgH}
        fill={C.soil} stroke={C.soilStk} strokeWidth={0.5} opacity={0.6} />
      <Txt x={soilX + 36} y={wallTopY + (wallH + ftgH) / 2 + 3} fill={C.soilStk} s={7}>Backfill</Txt>

      {/* Drainage */}
      {drainageEnabled && (
        <>
          <rect x={soilX} y={wallTopY + wallH - 24} width={drainW} height={24 + ftgH}
            fill={C.gravel} stroke={C.grvlStk} strokeWidth={0.6} opacity={0.85} />
          <circle cx={soilX + drainW / 2} cy={wallTopY + wallH + ftgH / 2} r={3}
            fill={C.pipe} stroke="#ef4444" strokeWidth={0.5} />
        </>
      )}

      {/* Stone wall body */}
      <rect x={wallX} y={wallTopY} width={wallW} height={wallH}
        fill={isMortared ? "#e7e5e4" : "#f5f5f4"} stroke={C.stoneStk} strokeWidth={0.5} />
      {stones.map((s, i) => {
        const stoneAbsY = wallTopY + s.y;
        const isBuried = stoneAbsY >= gradeY;
        return (
          <rect key={i} x={wallX + s.x} y={stoneAbsY} width={s.w} height={s.h - 1}
            fill={isBuried ? "#93c5fd" : (i % 3 === 0 ? C.stone : i % 3 === 1 ? "#c7c3c0" : "#d6d3d1")}
            stroke={C.stoneStk} strokeWidth={0.6} rx={1} />
        );
      })}

      {/* Mortar label */}
      {isMortared && <Txt x={wallX + wallW / 2} y={wallTopY + wallH - 5} fill={C.stoneStk} s={5}>Mortared</Txt>}
      {!isMortared && <Txt x={wallX + wallW / 2} y={wallTopY + wallH - 5} fill={C.stoneStk} s={5}>Dry-Stack</Txt>}

      {/* Footing */}
      {footingEnabled && (
        <rect x={wallX - 20} y={wallTopY + wallH} width={wallW + 40} height={ftgH}
          fill={C.footing} stroke={C.ftgStk} strokeWidth={1.2} />
      )}

      {/* Ground line */}
      <line x1={35} y1={gradeY} x2={W - 10} y2={gradeY} stroke={C.dim} strokeWidth={1} strokeDasharray="5,3" />
      <Txt x={38} y={gradeY - 3} fill={C.dim} s={6} anchor="start">grade</Txt>

      {buriedFrac > 0 && (
        <Txt x={wallX - 2} y={gradeY + buriedPx / 2 + 3} fill={C.buriedStk} s={5.5} anchor="end">buried</Txt>
      )}

      {/* Dimension: height */}
      <DimArrow x1={wallX - 12} y1={wallTopY} x2={wallX - 12} y2={wallTopY + wallH} />
      <line x1={wallX - 15} y1={wallTopY} x2={wallX - 9} y2={wallTopY} stroke={C.accent} strokeWidth={0.6} />
      <line x1={wallX - 15} y1={wallTopY + wallH} x2={wallX - 9} y2={wallTopY + wallH} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={wallX - 22} y={(wallTopY * 2 + wallH) / 2 + 3} fill={C.accent} s={7}>H</Txt>

      {/* Dimension: thickness */}
      <DimArrow x1={wallX} y1={wallTopY - 8} x2={wallX + wallW} y2={wallTopY - 8} />
      <line x1={wallX} y1={wallTopY - 11} x2={wallX} y2={wallTopY - 5} stroke={C.accent} strokeWidth={0.6} />
      <line x1={wallX + wallW} y1={wallTopY - 11} x2={wallX + wallW} y2={wallTopY - 5} stroke={C.accent} strokeWidth={0.6} />
      <Txt x={wallX + wallW / 2} y={wallTopY - 12} fill={C.accent} s={6}>Thickness</Txt>

      <Txt x={W / 2} y={H - 5} fill={C.dim} s={8} bold>
        {isMortared ? "Mortared Stone Wall" : "Dry-Stack Stone Wall"} — Cross Section
      </Txt>
    </Svg>
  );
}
