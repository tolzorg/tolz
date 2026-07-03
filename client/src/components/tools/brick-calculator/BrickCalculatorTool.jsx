import { useState, useMemo, useRef } from "react";
import {
  WALL_TYPES, LENGTH_UNITS, AREA_OUT_UNITS, VOLUME_OUT_UNITS, WEIGHT_OUT_UNITS, CURRENCIES,
  toMm, fromMm2, fromMm3, fromKgBrick,
  calcBricks, fmtBrick,
} from "../../../utils/brickCalc";

// ── Shared style tokens ───────────────────────────────────────────
const FONT   = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

const LABEL_STYLE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 12,
  color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: "0.06em", userSelect: "none",
};

const INPUT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 14,
  color: "var(--text-primary)", background: "var(--bg-white)",
  border: "none", outline: "none", width: "100%",
  padding: "10px 12px", boxSizing: "border-box",
};

const OUTPUT_BASE = {
  ...INPUT_BASE,
  background: "#eff6ff",
  color: "#1d4ed8",
  cursor: "default",
};

const UNIT_SELECT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 13,
  border: "none", outline: "none", cursor: "pointer",
  padding: "0 28px 0 10px", height: "100%",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  minWidth: 80,
};

// ── Section header with blue gradient ─────────────────────────────
function SectionHeader({ open, onToggle, title }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "13px 18px",
        background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
        border: "none", cursor: "pointer", textAlign: "left",
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "white" }}>
        {title}
      </span>
    </button>
  );
}

// ── Compound input + unit selector ────────────────────────────────
function CompoundField({
  value, onChange, onBlur,
  unit, onUnitChange, units,
  placeholder = "0",
  hasError = false,
  isOutput = false,
  unitLabel = null,
}) {
  const borderColor = isOutput ? "#bfdbfe" : hasError ? "var(--error)" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`,
      borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
      {unitLabel ? (
        <span style={{
          display: "flex", alignItems: "center",
          borderLeft: `1.5px solid ${borderColor}`,
          padding: "0 14px",
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {unitLabel}
        </span>
      ) : (
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          style={{
            ...UNIT_SELECT_BASE,
            borderLeft: `1.5px solid ${borderColor}`,
            background: isOutput ? "#eff6ff" : "var(--bg-muted)",
            color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          }}
        >
          {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Field wrapper: label + hint + children + error ────────────────
function Field({ label, hint, error, note, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && (
          <span title={hint}
            style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>
            ⓘ
          </span>
        )}
      </div>
      {children}
      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
          <span style={{ color: "var(--error)", fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--error)", fontWeight: 500, lineHeight: 1.4 }}>
            {error}
          </span>
        </div>
      )}
      {note && !error && (
        <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>
          {note}
        </span>
      )}
    </div>
  );
}

// ── Wall type radio buttons ───────────────────────────────────────
function WallTypeSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {WALL_TYPES.map((t) => {
        const sel = value === t.id;
        return (
          <label key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            padding: "9px 13px", borderRadius: RADIUS,
            background: sel ? "var(--accent-light)" : "var(--bg-muted)",
            border: `1.5px solid ${sel ? "var(--accent)" : BORDER}`,
            transition: "all 0.15s",
          }}>
            <input type="radio" name="wall-type" value={t.id} checked={sel}
              onChange={() => onChange(t.id)}
              style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }} />
            <span style={{
              fontFamily: FONT, fontWeight: sel ? 700 : 500, fontSize: 13.5,
              color: sel ? "var(--accent)" : "var(--text-primary)",
            }}>
              {t.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ── Shared brick-grid helper ──────────────────────────────────────
function makeBrickGrid(FL, FT, FW, FH, BW = 29, BH = 22, MJ = 3) {
  const out = [];
  for (let r = 0; r < 6; r++) {
    const xo = r % 2 === 1 ? (BW + MJ) / 2 : 0;
    for (let c = -1; c <= 7; c++) {
      const bx = FL + MJ / 2 + c * (BW + MJ) + xo;
      const by = FT + MJ / 2 + r * (BH + MJ);
      const cx = Math.max(bx, FL + 0.5);
      const cw = Math.min(bx + BW, FL + FW - 0.5) - cx;
      const cy = Math.max(by, FT + 0.5);
      const ch = Math.min(by + BH, FT + FH - 0.5) - cy;
      if (cw > 1 && ch > 1) out.push({ x: cx, y: cy, w: cw, h: ch });
    }
  }
  return out;
}

// ── Single wall SVG ───────────────────────────────────────────────
function SingleWallSVG() {
  const FL = 52, FT = 48, FW = 158, FH = 112;
  const DX = 30, DY = -15;          // one-brick-depth offset
  const BW = 29, BH = 22, MJ = 3;
  const C_BRICK = "#e8956d", C_TOP = "#f0a87e", C_MRT = "#c4b9a8", C_ANN = "#111827";

  const bricks = makeBrickGrid(FL, FT, FW, FH, BW, BH, MJ);

  // annotation reference points
  const lRow = 1, lXo = (BW + MJ) / 2;
  const lBx = FL + MJ / 2 + 1 * (BW + MJ) + lXo;
  const lBy = FT + MJ / 2 + lRow * (BH + MJ);
  const hBx = FL + MJ / 2 + 3 * (BW + MJ);
  const hBy = FT + MJ / 2;
  const tAx = FL + FW + 5;
  const tY1 = FT + MJ / 2 + BH, tY2 = tY1 + MJ;

  return (
    <svg viewBox="0 0 268 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <marker id="sw-f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0,1 L9,5 L0,9z" fill={C_ANN} />
        </marker>
        <marker id="sw-r" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9z" fill={C_ANN} />
        </marker>
        <clipPath id="sw-clip"><rect x={FL} y={FT} width={FW} height={FH} /></clipPath>
      </defs>

      {/* Top face (1 brick deep) */}
      <polygon
        points={`${FL},${FT} ${FL + FW},${FT} ${FL + FW + DX},${FT + DY} ${FL + DX},${FT + DY}`}
        fill={C_TOP} stroke={C_MRT} strokeWidth="0.8" />

      {/* Front face */}
      <rect x={FL} y={FT} width={FW} height={FH} fill={C_MRT} />
      <g clipPath="url(#sw-clip)">
        {bricks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={C_BRICK} />)}
      </g>
      <rect x={FL} y={FT} width={FW} height={FH} fill="none" stroke="#a09080" strokeWidth="0.8" />

      {/* H */}
      <line x1={FL - 14} y1={FT} x2={FL - 14} y2={FT + FH}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
      <text x={FL - 25} y={(2 * FT + FH) / 2 + 4} textAnchor="middle" fontSize="11"
        fontFamily="sans-serif" fontWeight="bold" fill={C_ANN}
        transform={`rotate(-90,${FL - 25},${(2 * FT + FH) / 2 + 4})`}>H</text>

      {/* L */}
      <line x1={FL} y1={FT + FH + 11} x2={FL + FW} y2={FT + FH + 11}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
      <text x={FL + FW / 2} y={FT + FH + 22} textAnchor="middle" fontSize="11"
        fontFamily="sans-serif" fontWeight="bold" fill={C_ANN}>L</text>

      {/* l — one brick length */}
      {lBx > FL && lBx + BW < FL + FW && <>
        <line x1={lBx} y1={lBy + BH / 2} x2={lBx + BW} y2={lBy + BH / 2}
          stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
        <text x={lBx + BW / 2} y={lBy + BH / 2 - 5} textAnchor="middle" fontSize="10"
          fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>l</text>
      </>}

      {/* h — one brick height */}
      <line x1={hBx + BW + 5} y1={hBy} x2={hBx + BW + 5} y2={hBy + BH}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
      <text x={hBx + BW + 13} y={hBy + BH / 2 + 4} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>h</text>

      {/* t — mortar joint */}
      <line x1={tAx} y1={tY1} x2={tAx} y2={tY2}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
      <text x={tAx + 7} y={(tY1 + tY2) / 2 + 4} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>t</text>

      {/* w — depth */}
      <line x1={FL + FW} y1={FT} x2={FL + FW + DX} y2={FT + DY}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#sw-r)" markerEnd="url(#sw-f)" />
      <text x={FL + FW + DX + 5} y={FT + DY - 2} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>w</text>
    </svg>
  );
}

// ── Double wall SVG ───────────────────────────────────────────────
function DoubleWallSVG() {
  const FL = 44, FT = 70, FW = 155, FH = 108;
  const DX = 28, DY = -14;
  const BW = 29, BH = 22, MJ = 3;
  const C_BRICK = "#e8956d", C_TOP = "#f0a87e", C_MRT = "#c4b9a8", C_ANN = "#111827";

  const BL = FL + DX, BT = FT + DY;   // back wall origin
  const frontBricks = makeBrickGrid(FL, FT, FW, FH, BW, BH, MJ);
  const backBricks  = makeBrickGrid(BL, BT, FW, FH, BW, BH, MJ);

  const lBx = FL + MJ / 2 + 1 * (BW + MJ) + (BW + MJ) / 2;
  const lBy = FT + MJ / 2 + 1 * (BH + MJ);
  const hBx = FL + MJ / 2 + 3 * (BW + MJ);
  const hBy = FT + MJ / 2;
  const tAx = FL + FW + 4;
  const tY1 = FT + MJ / 2 + BH, tY2 = tY1 + MJ;

  return (
    <svg viewBox="0 0 282 215" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <marker id="dw-f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0,1 L9,5 L0,9z" fill={C_ANN} />
        </marker>
        <marker id="dw-r" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9z" fill={C_ANN} />
        </marker>
        <clipPath id="dw-bc"><rect x={BL} y={BT} width={FW} height={FH} /></clipPath>
        <clipPath id="dw-fc"><rect x={FL} y={FT} width={FW} height={FH} /></clipPath>
      </defs>

      {/* Back wall — top face */}
      <polygon
        points={`${BL},${BT} ${BL + FW},${BT} ${BL + FW + DX},${BT + DY} ${BL + DX},${BT + DY}`}
        fill={C_TOP} stroke={C_MRT} strokeWidth="0.8" />

      {/* Back wall — front face */}
      <rect x={BL} y={BT} width={FW} height={FH} fill={C_MRT} />
      <g clipPath="url(#dw-bc)">
        {backBricks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={C_BRICK} />)}
      </g>
      <rect x={BL} y={BT} width={FW} height={FH} fill="none" stroke="#a09080" strokeWidth="0.8" />

      {/* Front wall — top face (sits over back wall top strip) */}
      <polygon
        points={`${FL},${FT} ${FL + FW},${FT} ${FL + FW + DX},${FT + DY} ${FL + DX},${FT + DY}`}
        fill={C_TOP} stroke={C_MRT} strokeWidth="0.8" />

      {/* Front wall — front face */}
      <rect x={FL} y={FT} width={FW} height={FH} fill={C_MRT} />
      <g clipPath="url(#dw-fc)">
        {frontBricks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={C_BRICK} />)}
      </g>
      <rect x={FL} y={FT} width={FW} height={FH} fill="none" stroke="#a09080" strokeWidth="0.8" />

      {/* H */}
      <line x1={FL - 14} y1={FT} x2={FL - 14} y2={FT + FH}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
      <text x={FL - 25} y={(2 * FT + FH) / 2 + 4} textAnchor="middle" fontSize="11"
        fontFamily="sans-serif" fontWeight="bold" fill={C_ANN}
        transform={`rotate(-90,${FL - 25},${(2 * FT + FH) / 2 + 4})`}>H</text>

      {/* L */}
      <line x1={FL} y1={FT + FH + 11} x2={FL + FW} y2={FT + FH + 11}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
      <text x={FL + FW / 2} y={FT + FH + 22} textAnchor="middle" fontSize="11"
        fontFamily="sans-serif" fontWeight="bold" fill={C_ANN}>L</text>

      {/* l */}
      {lBx > FL && lBx + BW < FL + FW && <>
        <line x1={lBx} y1={lBy + BH / 2} x2={lBx + BW} y2={lBy + BH / 2}
          stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
        <text x={lBx + BW / 2} y={lBy + BH / 2 - 5} textAnchor="middle" fontSize="10"
          fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>l</text>
      </>}

      {/* h */}
      <line x1={hBx + BW + 5} y1={hBy} x2={hBx + BW + 5} y2={hBy + BH}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
      <text x={hBx + BW + 13} y={hBy + BH / 2 + 4} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>h</text>

      {/* t */}
      <line x1={tAx} y1={tY1} x2={tAx} y2={tY2}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
      <text x={tAx + 7} y={(tY1 + tY2) / 2 + 4} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>t</text>

      {/* w — full 2-unit depth arrow */}
      <line x1={FL + FW} y1={FT} x2={FL + FW + 2 * DX} y2={FT + 2 * DY}
        stroke={C_ANN} strokeWidth="1" markerStart="url(#dw-r)" markerEnd="url(#dw-f)" />
      <text x={FL + FW + 2 * DX + 5} y={FT + 2 * DY - 2} fontSize="10"
        fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fill={C_ANN}>w</text>
    </svg>
  );
}

// ── Mortar ingredients section ────────────────────────────────────
function MortarSection({ result }) {
  const [volUnit,  setVolUnit]  = useState("m3");
  const [wgtUnit,  setWgtUnit]  = useState("kg");

  if (!result) {
    return (
      <div style={{
        fontFamily: FONT, fontSize: 12.5, color: "var(--text-muted)",
        fontWeight: 500, padding: "6px 0",
      }}>
        Enter wall and brick dimensions above to see mortar material quantities.
      </div>
    );
  }

  const mortarVol = fromMm3(result.mortarVolMm3, volUnit);
  const cementKg  = result.cementKg;
  const sandVol   = fromMm3(result.sandVolM3 * 1e9, volUnit);
  const water     = result.waterLiters;

  const rows = [
    {
      label: "Mortar volume",
      hint: "Total void space to be filled with mortar in the wall.",
      value: fmtBrick(mortarVol, 4),
      unitEl: (
        <select value={volUnit} onChange={(e) => setVolUnit(e.target.value)}
          style={{ ...UNIT_SELECT_BASE, background: "#eff6ff", color: "#1d4ed8",
            border: "none", borderLeft: `1.5px solid #bfdbfe`, height: "100%", padding: "0 28px 0 10px" }}>
          {VOLUME_OUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      ),
    },
    {
      label: "Cement",
      hint: "Standard 1:3 cement:sand mix. Dry volume ≈ wet volume × 1.3.",
      value: fmtBrick(cementKg, 1),
      unitEl: <span style={{ display: "flex", alignItems: "center", padding: "0 14px", background: "#eff6ff", color: "#1d4ed8", fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", borderLeft: "1.5px solid #bfdbfe" }}>kg</span>,
      sub: `${result.cementBags50} × 50 kg bags  /  ${result.cementBags25} × 25 kg bags`,
    },
    {
      label: "Sand",
      hint: "3 parts sand to 1 part cement by volume.",
      value: fmtBrick(sandVol, 4),
      unitEl: (
        <select value={volUnit} onChange={(e) => setVolUnit(e.target.value)}
          style={{ ...UNIT_SELECT_BASE, background: "#eff6ff", color: "#1d4ed8",
            border: "none", borderLeft: `1.5px solid #bfdbfe`, height: "100%", padding: "0 28px 0 10px" }}>
          {VOLUME_OUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      ),
    },
    {
      label: "Water",
      hint: "Water-cement ratio of 0.5.",
      value: fmtBrick(water, 1),
      unitEl: <span style={{ display: "flex", alignItems: "center", padding: "0 14px", background: "#eff6ff", color: "#1d4ed8", fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", borderLeft: "1.5px solid #bfdbfe" }}>L</span>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Mortar materials (1:3 mix)
      </div>
      {rows.map(({ label, hint, value, unitEl, sub }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={LABEL_STYLE}>{label}</span>
            {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
          </div>
          <div style={{
            display: "flex", alignItems: "stretch",
            border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
          }}>
            <input readOnly value={value} style={OUTPUT_BASE} />
            {unitEl}
          </div>
          {sub && (
            <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>{sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────
function ActionBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: "1 1 auto", padding: "9px 16px", borderRadius: RADIUS,
      fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
      border: "none", background: "var(--bg-muted)", color: "var(--text-primary)",
      transition: "opacity 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />
);

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function BrickCalculatorTool() {

  // ── Wall details state ────────────────────────────────────────────
  const [wallType,    setWallType]    = useState("single");
  const [wallLength,  setWallLength]  = useState("");
  const [wallLenUnit, setWallLenUnit] = useState("m");
  const [wallHeight,  setWallHeight]  = useState("");
  const [wallHgtUnit, setWallHgtUnit] = useState("m");
  const [areaOutUnit, setAreaOutUnit] = useState("m2");

  // ── Brick details state ───────────────────────────────────────────
  const [brickLen,     setBrickLen]     = useState("200");
  const [brickLenUnit, setBrickLenUnit] = useState("mm");
  const [brickHgt,     setBrickHgt]     = useState("100");
  const [brickHgtUnit, setBrickHgtUnit] = useState("mm");
  const [brickWid,     setBrickWid]     = useState("100");
  const [brickWidUnit, setBrickWidUnit] = useState("mm");
  const [mortar,       setMortar]       = useState("10");
  const [mortarUnit,   setMortarUnit]   = useState("mm");

  // ── Bricks required state ─────────────────────────────────────────
  const [wastage,      setWastage]      = useState("5");
  const [showMortar,   setShowMortar]   = useState(false);

  // ── Cost state ────────────────────────────────────────────────────
  const [pricePerBrick, setPricePerBrick] = useState("");
  const [currency,      setCurrency]      = useState("USD");

  // ── Section open state ────────────────────────────────────────────
  const [wallOpen,   setWallOpen]   = useState(true);
  const [brickOpen,  setBrickOpen]  = useState(true);
  const [reqOpen,    setReqOpen]    = useState(true);
  const [costOpen,   setCostOpen]   = useState(true);

  // ── Touched state ─────────────────────────────────────────────────
  const [touched,   setTouched]   = useState({});
  const [feedback,  setFeedback]  = useState(null);
  const [shared,    setShared]    = useState(false);
  const shareTimer = useRef(null);

  // ── Convert to mm ─────────────────────────────────────────────────
  const wallLenMm  = useMemo(() => toMm(wallLength,  wallLenUnit),  [wallLength,  wallLenUnit]);
  const wallHgtMm  = useMemo(() => toMm(wallHeight,  wallHgtUnit),  [wallHeight,  wallHgtUnit]);
  const brickLenMm = useMemo(() => toMm(brickLen,    brickLenUnit), [brickLen,    brickLenUnit]);
  const brickHgtMm = useMemo(() => toMm(brickHgt,    brickHgtUnit), [brickHgt,    brickHgtUnit]);
  const brickWidMm = useMemo(() => toMm(brickWid,    brickWidUnit), [brickWid,    brickWidUnit]);
  const mortarMm   = useMemo(() => {
    const v = parseFloat(mortar);
    return isFinite(v) && v >= 0 ? toMm(mortar, mortarUnit) : 0;
  }, [mortar, mortarUnit]);

  const wastagePct = useMemo(() => {
    const v = parseFloat(wastage);
    return isFinite(v) && v >= 0 ? v : 0;
  }, [wastage]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcBricks({
    wallLengthMm: wallLenMm,
    wallHeightMm: wallHgtMm,
    brickLengthMm: brickLenMm,
    brickHeightMm: brickHgtMm,
    brickWidthMm:  brickWidMm,
    mortarMm:      mortarMm ?? 0,
    wallType,
    wastagePct,
  }), [wallLenMm, wallHgtMm, brickLenMm, brickHgtMm, brickWidMm, mortarMm, wallType, wastagePct]);

  // ── Display values ────────────────────────────────────────────────
  const dispArea        = result ? fmtBrick(fromMm2(result.wallAreaMm2, areaOutUnit), 3) : "";
  const dispBricksNeeded = result ? fmtBrick(result.bricksNeeded, 1)  : "";
  const dispTotalBricks  = result ? fmtBrick(result.totalBricks, 0)   : "";

  const priceNum    = parseFloat(pricePerBrick);
  const costOfBricks = (result && isFinite(priceNum) && priceNum > 0)
    ? fmtBrick(result.totalBricks * priceNum, 2)
    : "";

  // ── Validation errors ─────────────────────────────────────────────
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const lenErr = touched.wallLen && (wallLength === "" || parseFloat(wallLength) <= 0)
    ? "Please enter a positive wall length." : null;
  const hgtErr = touched.wallHgt && (wallHeight === "" || parseFloat(wallHeight) <= 0)
    ? "Please enter a positive wall height." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setWallLength(""); setWallHeight(""); setWastage("5");
    setBrickLen("200"); setBrickHgt("100"); setBrickWid("100"); setMortar("10");
    setPricePerBrick(""); setTouched({}); setFeedback(null); setShared(false);
  }

  function handleReload() {
    handleClear();
    setWallType("single"); setWallLenUnit("m"); setWallHgtUnit("m");
    setBrickLenUnit("mm"); setBrickHgtUnit("mm"); setBrickWidUnit("mm"); setMortarUnit("mm");
    setCurrency("USD"); setShowMortar(false);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShared(false), 2000);
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ══════════════════════════════════════════════════════════
          WALL DETAILS
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={wallOpen} onToggle={() => setWallOpen(!wallOpen)} title="Wall details" />
        {wallOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Type of wall */}
            <Field label="Type of wall"
              hint="Single: one brick thick. Double: two bricks thick — stronger, used for load-bearing walls.">
              <WallTypeSelector value={wallType} onChange={setWallType} />
            </Field>

            {/* Wall diagram — switches based on type */}
            <div style={{
              border: `1px solid ${BORDER}`, borderRadius: RADIUS,
              overflow: "hidden", background: "var(--bg-muted)",
              padding: "8px 8px 4px",
            }}>
              {wallType === "single" ? <SingleWallSVG /> : <DoubleWallSVG />}
            </div>

            <Divider />

            {/* Wall length */}
            <Field label="Wall length (L)"
              hint="The total length of the wall to be built."
              error={lenErr}>
              <CompoundField
                value={wallLength} onChange={setWallLength} onBlur={() => touch("wallLen")}
                unit={wallLenUnit} onUnitChange={setWallLenUnit} units={LENGTH_UNITS}
                placeholder="e.g. 5" hasError={!!lenErr}
              />
            </Field>

            <Divider />

            {/* Wall height */}
            <Field label="Wall height (H)"
              hint="The height of the wall to be built."
              error={hgtErr}>
              <CompoundField
                value={wallHeight} onChange={setWallHeight} onBlur={() => touch("wallHgt")}
                unit={wallHgtUnit} onUnitChange={setWallHgtUnit} units={LENGTH_UNITS}
                placeholder="e.g. 3" hasError={!!hgtErr}
              />
            </Field>

            <Divider />

            {/* Wall area — output */}
            <Field label="Wall area"
              hint="Calculated as Wall length × Wall height."
              note={result === null ? "Enter wall length and height to calculate area." : undefined}>
              <CompoundField
                value={dispArea}
                unit={areaOutUnit} onUnitChange={setAreaOutUnit} units={AREA_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            {/* Formula hint */}
            <div style={{
              background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
              borderRadius: RADIUS, padding: "10px 14px",
              fontFamily: FONT, fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6,
            }}>
              <strong style={{ color: "var(--text-primary)" }}>Formula: </strong>
              bricks needed = <strong>[L × H] / [(l + t) × (h + t)]</strong>
              <span style={{ display: "block", marginTop: 4, fontSize: 11.5 }}>
                L = wall length &nbsp;·&nbsp; H = wall height &nbsp;·&nbsp;
                l = brick length &nbsp;·&nbsp; h = brick height &nbsp;·&nbsp; t = mortar joint
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          BRICK DETAILS
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={brickOpen} onToggle={() => setBrickOpen(!brickOpen)} title="Brick details" />
        {brickOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Brick length */}
            <Field label="Brick length (l)"
              hint="Standard metric brick: 200 mm. Standard US brick: 194 mm.">
              <CompoundField
                value={brickLen} onChange={setBrickLen} onBlur={() => {}}
                unit={brickLenUnit} onUnitChange={setBrickLenUnit}
                units={LENGTH_UNITS.filter((u) => ["mm","cm","in"].includes(u.id))}
                placeholder="200"
              />
            </Field>

            <Divider />

            {/* Brick height */}
            <Field label="Brick height (h)"
              hint="Standard metric brick: 100 mm (65 mm fired + 35 mm mortar is also common).">
              <CompoundField
                value={brickHgt} onChange={setBrickHgt} onBlur={() => {}}
                unit={brickHgtUnit} onUnitChange={setBrickHgtUnit}
                units={LENGTH_UNITS.filter((u) => ["mm","cm","in"].includes(u.id))}
                placeholder="100"
              />
            </Field>

            <Divider />

            {/* Brick width */}
            <Field label="Brick width (w)"
              hint="Depth of the brick (into the wall). Used to calculate mortar volume and double-wall depth.">
              <CompoundField
                value={brickWid} onChange={setBrickWid} onBlur={() => {}}
                unit={brickWidUnit} onUnitChange={setBrickWidUnit}
                units={LENGTH_UNITS.filter((u) => ["mm","cm","in"].includes(u.id))}
                placeholder="100"
              />
            </Field>

            <Divider />

            {/* Mortar joint */}
            <Field label="Mortar joint thickness (t)"
              hint="Typical mortar joint is 10 mm. Ranges from 6 mm (thin-bed) to 16 mm (traditional thick-bed).">
              <CompoundField
                value={mortar} onChange={setMortar} onBlur={() => {}}
                unit={mortarUnit} onUnitChange={setMortarUnit}
                units={LENGTH_UNITS.filter((u) => ["mm","cm","in"].includes(u.id))}
                placeholder="10"
              />
            </Field>

            {/* Brick size summary */}
            {brickLenMm && brickHgtMm && brickWidMm && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { lbl: "l (length)", val: fmtBrick(brickLenMm, 0) + " mm" },
                  { lbl: "h (height)", val: fmtBrick(brickHgtMm, 0) + " mm" },
                  { lbl: "w (width)",  val: fmtBrick(brickWidMm, 0) + " mm" },
                  { lbl: "t (mortar)", val: fmtBrick(mortarMm,   0) + " mm" },
                ].map(({ lbl, val }) => (
                  <div key={lbl} className="card"
                    style={{ flex: "1 1 70px", minWidth: 0, padding: "7px 10px", textAlign: "center" }}>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          BRICKS REQUIRED
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={reqOpen} onToggle={() => setReqOpen(!reqOpen)} title="Bricks required" />
        {reqOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Bricks needed */}
            <Field label="Bricks needed"
              hint="Exact number of bricks for the wall area before wastage."
              note={result === null ? "Enter wall dimensions above to calculate." : undefined}>
              <CompoundField
                value={dispBricksNeeded}
                unitLabel="bricks" placeholder="—" isOutput
              />
            </Field>

            <Divider />

            {/* Wastage */}
            <Field label="Brick wastage"
              hint="Extra bricks for cuts, breakage, and over-ordering. Typical: 5–10%.">
              <CompoundField
                value={wastage} onChange={setWastage} onBlur={() => {}}
                unitLabel="%" placeholder="5"
              />
            </Field>

            <Divider />

            {/* Total bricks needed */}
            <Field label="Total bricks needed"
              hint="Bricks needed × (1 + wastage / 100), rounded up."
              note={result === null ? "Enter wall dimensions above to calculate." : undefined}>
              <CompoundField
                value={dispTotalBricks}
                unitLabel="bricks" placeholder="—" isOutput
              />
            </Field>

            {/* Result breakdown cards */}
            {result && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { lbl: "Exact count",   val: fmtBrick(result.bricksNeeded, 1), note: "before rounding" },
                  { lbl: "With wastage",  val: fmtBrick(result.totalBricks, 0),  note: `+${wastage || 0}%` },
                  { lbl: "Wall area",     val: fmtBrick(fromMm2(result.wallAreaMm2, "m2"), 2) + " m²", note: "L × H" },
                  { lbl: "Wall depth",    val: fmtBrick(result.wallDepthMm, 0) + " mm", note: wallType === "double" ? "double" : "single" },
                ].map(({ lbl, val, note }) => (
                  <div key={lbl} className="card"
                    style={{ flex: "1 1 80px", minWidth: 0, padding: "8px 10px" }}>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>{val}</div>
                    <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{note}</div>
                  </div>
                ))}
              </div>
            )}

            <Divider />

            {/* Mortar checkbox */}
            <label style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              padding: "10px 14px", borderRadius: RADIUS,
              background: showMortar ? "var(--accent-light)" : "var(--bg-muted)",
              border: `1.5px solid ${showMortar ? "var(--accent)" : BORDER}`,
              transition: "all 0.15s",
            }}>
              <input
                type="checkbox" checked={showMortar}
                onChange={(e) => setShowMortar(e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{
                fontFamily: FONT, fontWeight: showMortar ? 700 : 500, fontSize: 13.5,
                color: showMortar ? "var(--accent)" : "var(--text-primary)",
              }}>
                Tick to see materials for your mortar
              </span>
            </label>

            {/* Mortar materials (conditional) */}
            {showMortar && (
              <div style={{
                border: `1.5px solid #bfdbfe`, borderRadius: RADIUS,
                padding: "14px 16px", background: "#f0f9ff",
              }}>
                <MortarSection result={result} />
              </div>
            )}

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          COST OF MATERIALS
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)} title="Cost of materials" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Price per brick */}
            <Field label="Price per brick"
              hint="Unit price of a single brick. Used to estimate total material cost.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <input
                  type="number" inputMode="decimal" step="any" min="0"
                  value={pricePerBrick}
                  onChange={(e) => setPricePerBrick(e.target.value)}
                  placeholder="0.00"
                  style={INPUT_BASE}
                />
                <select
                  value={currency} onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    ...UNIT_SELECT_BASE,
                    borderLeft: `1.5px solid ${BORDER}`,
                    background: "var(--bg-muted)",
                    color: "var(--text-primary)",
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </Field>

            <Divider />

            {/* Cost of bricks — output */}
            <Field label="Cost of bricks"
              note={costOfBricks === "" ? "Enter price per brick and wall dimensions above." : undefined}>
              <div style={{
                display: "flex", alignItems: "stretch",
                border: "1.5px solid #bfdbfe", borderRadius: RADIUS, overflow: "hidden",
              }}>
                <input readOnly value={costOfBricks} placeholder="—" style={OUTPUT_BASE} />
                <span style={{
                  display: "flex", alignItems: "center",
                  borderLeft: "1.5px solid #bfdbfe", padding: "0 14px",
                  background: "#eff6ff", color: "#1d4ed8",
                  fontFamily: FONT, fontSize: 13, fontWeight: 600,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {currency}
                </span>
              </div>
            </Field>

            <Divider />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ActionBtn onClick={handleShare}>
                {shared ? "✓ Link Copied!" : "🔗 Share result"}
              </ActionBtn>
              <ActionBtn onClick={handleReload}>🔄 Reload calculator</ActionBtn>
              <ActionBtn onClick={handleClear}>🗑 Clear all changes</ActionBtn>
            </div>

            {/* Feedback */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "10px 14px", background: "var(--bg-muted)",
              borderRadius: RADIUS, border: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "var(--text-muted)", flex: "1 1 auto" }}>
                Did we solve your problem?
              </span>
              {[{ val: "yes", label: "👍 Yes" }, { val: "no", label: "👎 No" }].map(({ val, label }) => (
                <button key={val} onClick={() => setFeedback(val)} style={{
                  fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  padding: "6px 14px", borderRadius: RADIUS,
                  border: `1.5px solid ${feedback === val ? "var(--accent)" : BORDER}`,
                  background: feedback === val ? "var(--accent-light)" : "var(--bg-white)",
                  color: feedback === val ? "var(--accent)" : "var(--text-primary)",
                  transition: "all 0.15s",
                }}>
                  {label}
                </button>
              ))}
              {feedback && (
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: "var(--accent)" }}>
                  {feedback === "yes" ? "Thank you! 🎉" : "Sorry! We'll improve."}
                </span>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate bricks needed?
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Worked example */}
          <div style={{
            background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
            borderRadius: RADIUS, padding: "13px 15px",
          }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)", marginBottom: 8 }}>
              Example — L = 5 m, H = 3 m, l = 200 mm, h = 100 mm, t = 10 mm, wastage = 5%
            </div>
            {[
              "Wall area   = 5 × 3  =  15 m²  =  15,000,000 mm²",
              "Brick face  = (200 + 10) × (100 + 10)  =  210 × 110  =  23,100 mm²",
              "Bricks needed = 15,000,000 / 23,100  ≈  649.4 bricks",
              "With 5% wastage: ⌈649.4 × 1.05⌉ = ⌈681.9⌉ = 682 bricks",
            ].map((l) => (
              <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>
                {l}
              </div>
            ))}
          </div>

          {/* Double wall note */}
          <div style={{
            background: "#fffbeb", border: "1px solid #fcd34d",
            borderRadius: RADIUS, padding: "10px 14px",
          }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "#92400e", marginBottom: 4 }}>
              Double wall
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12.5, color: "#78350f" }}>
              Same formula × 2. The wall depth doubles: two brick widths + one mortar joint.
              Mortar volume is calculated from total wall volume minus total brick volume.
            </div>
          </div>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: "12px 0 0 0" }}>
          Always add <strong>5–10% extra</strong> for cuts, wastage, and over-ordering.
          Quantities are estimates — verify with your bricklayer or supplier before ordering.
        </p>
      </div>

    </div>
  );
}
