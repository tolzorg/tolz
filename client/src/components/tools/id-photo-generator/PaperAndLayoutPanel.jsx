import { PAPER_SIZES } from "../../../data/paperSizes";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

const inputStyle = {
  padding: "9px 12px", borderRadius: RADIUS, border: `1.5px solid ${BORDER}`,
  background: "var(--bg-white)", color: "var(--text-primary)",
  fontFamily: FONT, fontSize: 13.5, fontWeight: 600, width: "100%", boxSizing: "border-box",
};

export default function PaperAndLayoutPanel({
  paperId, onPaperChange,
  customWidth, customHeight, customUnit, onCustomChange,
  duplicateMode, onDuplicateModeChange, manualCount, onManualCountChange,
  layout,
}) {
  const isCustom = paperId === "custom";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
          Paper size
        </label>
        <select value={paperId} onChange={(e) => onPaperChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {PAPER_SIZES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {isCustom && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Width</label>
            <input type="number" min="0" step="any" value={customWidth} onChange={(e) => onCustomChange({ width: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Height</label>
            <input type="number" min="0" step="any" value={customHeight} onChange={(e) => onCustomChange({ height: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ width: 90 }}>
            <label style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Unit</label>
            <select value={customUnit} onChange={(e) => onCustomChange({ unit: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
          Copies per sheet
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => onDuplicateModeChange("auto")}
            style={{
              flex: 1, padding: "9px 12px", borderRadius: RADIUS,
              border: `1.5px solid ${duplicateMode === "auto" ? "var(--accent)" : BORDER}`,
              background: duplicateMode === "auto" ? "var(--accent-light)" : "var(--bg-white)",
              color: duplicateMode === "auto" ? "var(--accent)" : "var(--text-primary)",
              fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Auto (fill max)
          </button>
          <button
            type="button"
            onClick={() => onDuplicateModeChange("manual")}
            style={{
              flex: 1, padding: "9px 12px", borderRadius: RADIUS,
              border: `1.5px solid ${duplicateMode === "manual" ? "var(--accent)" : BORDER}`,
              background: duplicateMode === "manual" ? "var(--accent-light)" : "var(--bg-white)",
              color: duplicateMode === "manual" ? "var(--accent)" : "var(--text-primary)",
              fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Manual
          </button>
        </div>
        {duplicateMode === "manual" && (
          <input
            type="number" min="1" max={layout?.maxTotal || 99} step="1"
            value={manualCount}
            onChange={(e) => onManualCountChange(parseInt(e.target.value, 10) || 1)}
            style={{ ...inputStyle, marginTop: 8 }}
          />
        )}
      </div>

      {layout && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px",
          borderRadius: RADIUS, background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>
            {layout.count} photo{layout.count === 1 ? "" : "s"} on this sheet ({layout.cols} × {layout.rows} grid)
          </span>
          <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)" }}>
            {layout.orientationDeg === 90 ? "Photos rotated 90° to fit more copies" : "Standard orientation"} · {layout.marginMM}mm print margin
          </span>
        </div>
      )}
    </div>
  );
}
