import { useState, useMemo, useRef } from "react";
import {
  LENGTH_UNITS, VOLUME_OUT_UNITS, PACKAGE_SIZES, CURRENCIES,
  toLengthM, toVolumeM3, fromM3,
  calcSealant, fmtSealant,
} from "../../../utils/sealantCalc";

// ── Style tokens ──────────────────────────────────────────────────
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

const SELECT_BASE = {
  fontFamily: FONT, fontWeight: 600, fontSize: 13,
  border: "none", outline: "none", cursor: "pointer",
  padding: "0 26px 0 10px", height: "100%",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  minWidth: 76,
};

// ── Blue gradient section header ──────────────────────────────────
function SectionHeader({ open, onToggle, title }) {
  return (
    <button onClick={onToggle} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "13px 18px",
      background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
      border: "none", cursor: "pointer", textAlign: "left",
    }}>
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
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput}
        placeholder={placeholder}
        onChange={onChange && !isOutput ? (e) => onChange(e.target.value) : undefined}
        onBlur={!isOutput ? onBlur : undefined}
        style={isOutput ? OUTPUT_BASE : INPUT_BASE}
      />
      {unitLabel ? (
        <span style={{
          display: "flex", alignItems: "center",
          borderLeft: `1.5px solid ${borderColor}`,
          padding: "0 13px",
          background: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
        }}>{unitLabel}</span>
      ) : (
        <select value={unit} onChange={(e) => onUnitChange(e.target.value)}
          style={{
            ...SELECT_BASE,
            borderLeft: `1.5px solid ${borderColor}`,
            backgroundColor: isOutput ? "#eff6ff" : "var(--bg-muted)",
            color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          }}>
          {(units || []).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Field: label + hint icon + children + error/note ──────────────
function Field({ label, hint, error, note, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={LABEL_STYLE}>{label}</span>
        {hint && <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </div>
      {children}
      {error && (
        <div style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
          <span style={{ color: "var(--error)", fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "var(--error)", fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
        </div>
      )}
      {note && !error && (
        <span style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

// ── Price row: [number input] [currency] [/pc] ────────────────────
function PriceRow({ value, onChange, currency, onCurrencyChange, isOutput, suffix, placeholder = "0.00" }) {
  const borderColor = isOutput ? "#bfdbfe" : BORDER;
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      border: `1.5px solid ${borderColor}`, borderRadius: RADIUS, overflow: "hidden",
    }}>
      <input
        type={isOutput ? "text" : "number"}
        inputMode="decimal" step="any" min="0"
        value={value}
        readOnly={isOutput}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={isOutput ? { ...OUTPUT_BASE } : { ...INPUT_BASE }}
      />
      <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)}
        style={{
          ...SELECT_BASE,
          borderLeft: `1.5px solid ${borderColor}`,
          backgroundColor: isOutput ? "#eff6ff" : "var(--bg-muted)",
          color: isOutput ? "#1d4ed8" : "var(--text-primary)",
          minWidth: 65,
        }}>
        {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      {suffix && (
        <span style={{
          display: "flex", alignItems: "center", padding: "0 12px",
          background: "var(--bg-muted)", color: "var(--text-muted)",
          fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
          borderLeft: `1.5px solid ${BORDER}`,
        }}>{suffix}</span>
      )}
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

const Divider = () => <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />;

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function SealantCalculatorTool() {

  // ── What needs sealing ─────────────────────────────────────────────
  const [length,  setLength]  = useState("");
  const [lenUnit, setLenUnit] = useState("m");
  const [width,   setWidth]   = useState("");
  const [widUnit, setWidUnit] = useState("mm");
  const [depth,   setDepth]   = useState("");
  const [depUnit, setDepUnit] = useState("mm");
  const [volUnit,    setVolUnit]    = useState("ml");
  const [wastage,    setWastage]    = useState("5");
  const [actVolUnit, setActVolUnit] = useState("ml");

  // ── Sealant package ────────────────────────────────────────────────
  const [packageId,     setPackageId]     = useState("310ml-cartridge");
  const [customVol,     setCustomVol]     = useState("");
  const [customVolUnit, setCustomVolUnit] = useState("ml");

  // ── Cost ────────────────────────────────────────────────────────────
  const [pricePerPiece, setPricePerPiece] = useState("");
  const [priceCur,      setPriceCur]      = useState("PKR");
  const [costCur,       setCostCur]       = useState("PKR");

  // ── Section open state ────────────────────────────────────────────
  const [sealingOpen, setSealingOpen] = useState(true);
  const [needOpen,    setNeedOpen]    = useState(true);
  const [costOpen,    setCostOpen]    = useState(true);

  // ── Misc ──────────────────────────────────────────────────────────
  const [touched,  setTouched]  = useState({});
  const [feedback, setFeedback] = useState(null);
  const [shared,   setShared]   = useState(false);
  const shareTimer = useRef(null);
  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const pkg = useMemo(() => PACKAGE_SIZES.find((p) => p.id === packageId), [packageId]);
  const isCustomPkg = packageId === "custom";

  // ── Derive SI values ──────────────────────────────────────────────
  const lengthM = useMemo(() => toLengthM(length, lenUnit), [length, lenUnit]);
  const widthM  = useMemo(() => toLengthM(width, widUnit),  [width, widUnit]);
  const depthM  = useMemo(() => toLengthM(depth, depUnit),  [depth, depUnit]);
  const wastePct = useMemo(() => {
    const v = parseFloat(wastage);
    return isFinite(v) && v >= 0 ? v : 0;
  }, [wastage]);

  const packageVolumeM3 = useMemo(() => {
    if (isCustomPkg) return toVolumeM3(customVol, customVolUnit);
    return pkg?.volumeMl != null ? pkg.volumeMl / 1e6 : null;
  }, [isCustomPkg, customVol, customVolUnit, pkg]);

  const pricePerPieceNum = useMemo(() => {
    const v = parseFloat(pricePerPiece);
    return isFinite(v) && v > 0 ? v : null;
  }, [pricePerPiece]);

  // ── Calculate ─────────────────────────────────────────────────────
  const result = useMemo(() => calcSealant({
    lengthM, widthM, depthM, wastagePct: wastePct, packageVolumeM3, pricePerPiece: pricePerPieceNum,
  }), [lengthM, widthM, depthM, wastePct, packageVolumeM3, pricePerPieceNum]);

  // ── Display values ────────────────────────────────────────────────
  const dispVol    = result ? fmtSealant(fromM3(result.volumeNeededM3, volUnit), 3) : "";
  const dispActVol = result ? fmtSealant(fromM3(result.actualVolumeNeededM3, actVolUnit), 3) : "";
  const dispPkgCount = result?.packageCount != null ? String(result.packageCount) : "";
  const dispCost    = result?.totalCost != null ? fmtSealant(result.totalCost, 2) : "";

  // ── Validation ────────────────────────────────────────────────────
  const lenErr = touched.len && (length === "" || parseFloat(length) <= 0)
    ? "Please enter a positive value for the length." : null;
  const widErr = touched.wid && (width === "" || parseFloat(width) <= 0)
    ? "Please enter a positive value for the width." : null;
  const depErr = touched.dep && (depth === "" || parseFloat(depth) <= 0)
    ? "Please enter a positive value for the depth." : null;
  const wasteErr = touched.waste && (wastage !== "" && (parseFloat(wastage) < 0 || parseFloat(wastage) >= 100))
    ? "Wastage must be between 0 and 99%." : null;
  const pkgErr = isCustomPkg && touched.pkgVol && (customVol === "" || parseFloat(customVol) <= 0)
    ? "Please enter a positive tube volume." : null;

  // ── Actions ───────────────────────────────────────────────────────
  function handleClear() {
    setLength(""); setWidth(""); setDepth(""); setWastage("5");
    setCustomVol(""); setPricePerPiece("");
    setTouched({}); setFeedback(null); setShared(false);
  }
  function handleReload() {
    handleClear();
    setLenUnit("m"); setWidUnit("mm"); setDepUnit("mm");
    setVolUnit("ml"); setActVolUnit("ml"); setCustomVolUnit("ml");
    setPackageId("310ml-cartridge");
    setPriceCur("PKR"); setCostCur("PKR");
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

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Details of what needs sealing
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={sealingOpen} onToggle={() => setSealingOpen(!sealingOpen)}
          title="Details of what needs sealing" />
        {sealingOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Length" hint="Length of the joint or gap to be sealed." error={lenErr}>
              <CompoundField
                value={length} onChange={setLength} onBlur={() => touch("len")}
                unit={lenUnit} onUnitChange={setLenUnit} units={LENGTH_UNITS}
                placeholder="e.g. 2" hasError={!!lenErr}
              />
            </Field>

            <Divider />

            <Field label="Width" error={widErr}>
              <CompoundField
                value={width} onChange={setWidth} onBlur={() => touch("wid")}
                unit={widUnit} onUnitChange={setWidUnit} units={LENGTH_UNITS}
                placeholder="e.g. 10" hasError={!!widErr}
              />
            </Field>

            <Divider />

            <Field label="Depth" error={depErr}>
              <CompoundField
                value={depth} onChange={setDepth} onBlur={() => touch("dep")}
                unit={depUnit} onUnitChange={setDepUnit} units={LENGTH_UNITS}
                placeholder="e.g. 10" hasError={!!depErr}
              />
            </Field>

            <Divider />

            <Field label="Volume needed"
              hint="Volume needed = Length × Width × Depth."
              note={result === null ? "Enter length, width, and depth to compute volume." : undefined}>
              <CompoundField
                value={dispVol}
                unit={volUnit} onUnitChange={setVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

            <Divider />

            <Field label="Wastage"
              hint="Extra sealant to account for spillage, tooling, and mistakes."
              error={wasteErr}>
              <CompoundField
                value={wastage} onChange={setWastage} onBlur={() => touch("waste")}
                unitLabel="%" placeholder="5" hasError={!!wasteErr}
              />
            </Field>

            <Divider />

            <Field label="Actual volume needed"
              hint="Actual volume needed = Volume needed ÷ (1 − Wastage / 100)."
              note={result === null ? "Enter all dimensions above to compute this." : undefined}>
              <CompoundField
                value={dispActVol}
                unit={actVolUnit} onUnitChange={setActVolUnit} units={VOLUME_OUT_UNITS}
                placeholder="—" isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Sealant needed
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={needOpen} onToggle={() => setNeedOpen(!needOpen)}
          title="Sealant needed" />
        {needOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Package size" hint="Select the sealant package size you plan to buy, or enter a custom tube volume.">
              <div style={{
                display: "flex", alignItems: "stretch",
                border: `1.5px solid ${BORDER}`, borderRadius: RADIUS, overflow: "hidden",
              }}>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  style={{
                    ...SELECT_BASE,
                    width: "100%", minWidth: 0, padding: "10px 32px 10px 12px",
                    backgroundColor: "var(--bg-white)", color: "var(--text-primary)",
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                  }}
                >
                  {PACKAGE_SIZES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </Field>

            {isCustomPkg && (
              <Field label="Custom tube volume" error={pkgErr}>
                <CompoundField
                  value={customVol} onChange={setCustomVol} onBlur={() => touch("pkgVol")}
                  unit={customVolUnit} onUnitChange={setCustomVolUnit} units={VOLUME_OUT_UNITS}
                  placeholder="e.g. 300" hasError={!!pkgErr}
                />
              </Field>
            )}

            <Divider />

            <Field label="Number of packages needed"
              hint="Actual volume needed ÷ package volume, rounded up to the next whole package."
              note={result?.packageCount == null ? "Select a package size above to compute this." : undefined}>
              <CompoundField value={dispPkgCount} placeholder="—" isOutput unitLabel="pcs" />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Cost
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>
        <SectionHeader open={costOpen} onToggle={() => setCostOpen(!costOpen)}
          title="Cost" />
        {costOpen && (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            <Field label="Price per piece" hint="Cost of a single sealant package.">
              <PriceRow
                value={pricePerPiece}
                onChange={setPricePerPiece}
                currency={priceCur}
                onCurrencyChange={(c) => { setPriceCur(c); setCostCur(c); }}
                suffix="/pc"
              />
            </Field>

            <Divider />

            <Field label="Cost of sealant"
              hint="Cost of sealant = Number of packages needed × Price per piece."
              note={dispCost === "" ? "Enter a price per piece above to calculate." : undefined}>
              <PriceRow
                value={dispCost}
                currency={costCur}
                onCurrencyChange={setCostCur}
                isOutput
              />
            </Field>

          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          EXAMPLES CARD
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 10 }}>
          Check our examples:
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Installing 3 glass doors — sealing the perimeter of each door frame.",
            "Installing 4 double-hung windows — sealing the perimeter of each window frame.",
          ].map((l) => (
            <li key={l} style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.5 }}>{l}</li>
          ))}
        </ul>
      </div>

      {/* ════════════════════════════════════════════════════════════
          ACTIONS + FEEDBACK
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionBtn onClick={handleShare}>
            {shared ? "✓ Link Copied!" : "🔗 Share result"}
          </ActionBtn>
          <ActionBtn onClick={handleReload}>🔄 Reload calculator</ActionBtn>
          <ActionBtn onClick={handleClear}>🗑 Clear all changes</ActionBtn>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "10px 14px", background: "var(--bg-muted)",
          borderRadius: RADIUS, border: `1px solid ${BORDER}`,
        }}>
          <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "var(--text-muted)", flex: "1 1 auto" }}>
            Did we solve your problem today?
          </span>
          {[{ val: "yes", label: "👍 Yes" }, { val: "no", label: "👎 No" }].map(({ val, label }) => (
            <button key={val} onClick={() => setFeedback(val)} style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
              padding: "6px 14px", borderRadius: RADIUS,
              border: `1.5px solid ${feedback === val ? "var(--accent)" : BORDER}`,
              background: feedback === val ? "var(--accent-light)" : "var(--bg-white)",
              color: feedback === val ? "var(--accent)" : "var(--text-primary)",
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
          {feedback && (
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: "var(--accent)" }}>
              {feedback === "yes" ? "Thank you! 🎉" : "Sorry! We'll improve."}
            </span>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          INFO CARD — How is sealant calculated?
          ════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12 }}>
          How do we calculate sealant needed?
        </div>

        <div style={{
          background: "var(--bg-muted)", border: `1px solid ${BORDER}`,
          borderRadius: RADIUS, padding: "13px 15px", marginBottom: 10,
        }}>
          {[
            "Volume needed        = Length × Width × Depth",
            "Actual volume needed = Volume needed ÷ (1 − Wastage ÷ 100)",
            "Packages needed      = ⌈ Actual volume needed ÷ Package volume ⌉",
            "Cost of sealant      = Packages needed × Price per piece",
          ].map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: "var(--accent)", marginBottom: 3 }}>{l}</div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          The <strong>wastage</strong> percentage represents the share of purchased sealant expected to be lost to
          spillage, tooling, and mistakes — so a higher wastage percentage means you need to buy proportionally more
          to end up with enough usable sealant. <strong>Packages needed</strong> is always rounded up to the next
          whole cartridge, sausage, or pail.
        </p>
      </div>

    </div>
  );
}
