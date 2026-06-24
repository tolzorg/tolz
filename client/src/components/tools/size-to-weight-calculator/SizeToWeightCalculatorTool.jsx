import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  MATERIAL_CATEGORIES, DIM_UNITS, DENSITY_UNITS, VOLUME_OUTPUT_UNITS, WEIGHT_OUTPUT_UNITS,
  dimToMeters, toDensityKgM3, fromDensityKgM3, calcVolumeM3, fromVolumeM3,
  calcWeightKg, fromWeightKg, getMaterialById, fmtN, fmt4,
} from "../../../utils/sizeToWeightCalc";
import PriceCheckerCard from "../construction/PriceCheckerCard";

// ── Design tokens (matching existing calculators) ────────────

const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 7,
  userSelect: "none",
};

const INPUT = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--bg-white)",
  outline: "none",
  transition: "border-color var(--transition)",
  boxSizing: "border-box",
};

const SELECT = {
  ...INPUT,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

// ── Shared primitives ─────────────────────────────────────────

function SectionCard({ id, title, icon, open, onToggle, children }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 20px", background: "none", border: "none",
          borderBottom: open ? "1px solid var(--border)" : "none",
          cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 14, color: "var(--text-primary)", textAlign: "left",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </span>
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

function FieldGroup({ label, hint, error, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <label style={{ ...LBL, marginBottom: 0 }}>{label}</label>
        {hint && (
          <span title={hint} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "help", lineHeight: 1 }}>ⓘ</span>
        )}
      </div>
      {children}
      {error && (
        <p style={{ fontSize: 11.5, color: "var(--error)", fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function ResultRow({ label, value, unit, accent, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "9px 0", borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: bold ? 800 : 700,
        fontSize: bold ? 16 : 14, color: accent ? "var(--accent)" : "var(--text-primary)",
      }}>
        {value}{" "}
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{unit}</span>
      </span>
    </div>
  );
}

function FormulaBox({ text }) {
  return (
    <div style={{
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "11px 16px",
      fontFamily: "var(--font-display)", fontWeight: 700,
      fontSize: "clamp(12px, 2vw, 13.5px)", color: "var(--text-primary)", textAlign: "center",
    }}>
      {text}
    </div>
  );
}

function InfoPill({ text }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "var(--accent-light)", borderRadius: 99, padding: "4px 12px",
      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)",
    }}>
      {text}
    </div>
  );
}

// ── DimensionInput: simple and compound (ft/in, m/cm) ────────

function DimensionInput({ val, setVal, unit, setUnit, compA, setCompA, compB, setCompB, placeholder, onBlurField, hasError }) {
  const isCompound = unit === "ft_in" || unit === "m_cm";
  const [labelA, labelB] = unit === "ft_in" ? ["ft", "in"] : ["m", "cm"];
  const borderColor = hasError ? "var(--error)" : "var(--border)";
  const focusColor  = hasError ? "var(--error)" : "var(--accent)";

  function mkInput(v, set, ph) {
    return (
      <input
        type="number" inputMode="decimal" min="0" step="any"
        value={v} placeholder={ph || "0"}
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = focusColor)}
        onBlur={(e) => { e.target.style.borderColor = borderColor; if (onBlurField) onBlurField(); }}
        style={{ ...INPUT, flex: "1 1 70px", minWidth: 0, borderColor }}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {isCompound ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 100px", minWidth: 0 }}>
            {mkInput(compA, setCompA, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{labelA}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 100px", minWidth: 0 }}>
            {mkInput(compB, setCompB, "0")}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{labelB}</span>
          </div>
        </>
      ) : (
        mkInput(val, setVal, placeholder || "0")
      )}
      <select
        value={unit} onChange={(e) => setUnit(e.target.value)}
        style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 190 }}
      >
        {DIM_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
      </select>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function isDimValid(val, unit, compA, compB) {
  if (unit === "ft_in" || unit === "m_cm") {
    return (parseFloat(compA) || 0) + (parseFloat(compB) || 0) > 0;
  }
  const n = parseFloat(val);
  return isFinite(n) && n > 0;
}

// ── Main component ────────────────────────────────────────────

export default function SizeToWeightCalculatorTool() {
  // Dimensions
  const [lenVal,   setLenVal]   = useState("");
  const [lenUnit,  setLenUnit]  = useState("ft");
  const [lenCompA, setLenCompA] = useState("");
  const [lenCompB, setLenCompB] = useState("");

  const [widVal,   setWidVal]   = useState("");
  const [widUnit,  setWidUnit]  = useState("ft");
  const [widCompA, setWidCompA] = useState("");
  const [widCompB, setWidCompB] = useState("");

  const [hgtVal,   setHgtVal]   = useState("");
  const [hgtUnit,  setHgtUnit]  = useState("ft");
  const [hgtCompA, setHgtCompA] = useState("");
  const [hgtCompB, setHgtCompB] = useState("");

  // Material & density
  const [materialId,     setMaterialId]     = useState("none");
  const [densityInputVal, setDensityInputVal] = useState("");
  const [densityUnit,    setDensityUnit]    = useState("kg_m3");

  // Output units
  const [volOutputUnit,    setVolOutputUnit]    = useState("ft3");
  const [weightOutputUnit, setWeightOutputUnit] = useState("lb");

  // UI state
  const [touched,  setTouched]  = useState({});
  const [open,     setOpen]     = useState(new Set(["material", "dimensions", "density"]));
  const [copied,   setCopied]   = useState(false);
  const copyTimer               = useRef(null);

  const touch = useCallback((k) => setTouched((p) => ({ ...p, [k]: true })), []);
  const toggleSection = useCallback((id) => setOpen((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  }), []);

  // When material changes → auto-fill density
  function handleMaterialChange(id) {
    setMaterialId(id);
    if (id !== "none" && id !== "custom") {
      const mat = getMaterialById(id);
      if (mat?.densityKgM3) {
        const displayed = fromDensityKgM3(mat.densityKgM3, densityUnit);
        setDensityInputVal(fmt4(displayed) ?? "");
      }
    } else if (id === "none") {
      setDensityInputVal("");
    }
    // "custom" → keep whatever the user typed
  }

  // When density unit changes → re-express the current density in the new unit
  function handleDensityUnitChange(newUnit) {
    const kgM3 = toDensityKgM3(densityInputVal, densityUnit);
    if (kgM3) {
      const converted = fromDensityKgM3(kgM3, newUnit);
      setDensityInputVal(fmt4(converted) ?? "");
    }
    setDensityUnit(newUnit);
  }

  // ── Computed values ─────────────────────────────────────────

  const lM = useMemo(() => dimToMeters(lenVal, lenUnit, lenCompA, lenCompB), [lenVal, lenUnit, lenCompA, lenCompB]);
  const wM = useMemo(() => dimToMeters(widVal, widUnit, widCompA, widCompB), [widVal, widUnit, widCompA, widCompB]);
  const hM = useMemo(() => dimToMeters(hgtVal, hgtUnit, hgtCompA, hgtCompB), [hgtVal, hgtUnit, hgtCompA, hgtCompB]);

  const volM3      = useMemo(() => calcVolumeM3(lM, wM, hM),                             [lM, wM, hM]);
  const densityKgM3 = useMemo(() => toDensityKgM3(densityInputVal, densityUnit),          [densityInputVal, densityUnit]);
  const weightKg   = useMemo(() => calcWeightKg(volM3, densityKgM3),                      [volM3, densityKgM3]);

  const volDisplay    = useMemo(() => fromVolumeM3(volM3, volOutputUnit),                  [volM3, volOutputUnit]);
  const weightDisplay = useMemo(() => fromWeightKg(weightKg, weightOutputUnit),            [weightKg, weightOutputUnit]);

  // Weight in common units for the price checker
  const weightLb         = useMemo(() => weightKg ? weightKg * 2.20462  : null, [weightKg]);
  const weightUstons     = useMemo(() => weightKg ? weightKg / 907.185  : null, [weightKg]);
  const weightMetrictons = useMemo(() => weightKg ? weightKg / 1000     : null, [weightKg]);

  // Derived: weight per unit volume (= density in those units)
  const wPerFt3 = useMemo(() => densityKgM3 ? densityKgM3 / 16.0185 : null,               [densityKgM3]);
  const wPerM3  = densityKgM3;

  const hasResults = !!(volM3 && weightKg);

  // Auto-open results when computable
  useEffect(() => {
    if (hasResults) setOpen((prev) => { const n = new Set(prev); n.add("results"); return n; });
  }, [hasResults]);

  // Symbol lookups
  const volSymbol    = VOLUME_OUTPUT_UNITS.find((u) => u.id === volOutputUnit)?.symbol    || volOutputUnit;
  const weightSymbol = WEIGHT_OUTPUT_UNITS.find((u) => u.id === weightOutputUnit)?.symbol || weightOutputUnit;
  const densSymbol   = DENSITY_UNITS.find((u) => u.id === densityUnit)?.symbol            || densityUnit;

  // Material label for InfoPill
  const matLabel = materialId !== "none" && materialId !== "custom"
    ? getMaterialById(materialId)?.label || ""
    : materialId === "custom" ? "Custom" : "";

  function handleCopy() {
    if (!hasResults) return;
    const lines = [
      "Size to Weight Calculator Results",
      `Volume:              ${fmtN(volDisplay)} ${volSymbol}`,
      `Density:             ${densityInputVal} ${densSymbol}`,
      `Weight:              ${fmtN(weightDisplay)} ${weightSymbol}`,
      `Weight per ft³:      ${fmtN(wPerFt3)} lb/ft³`,
      `Weight per m³:       ${fmtN(wPerM3)} kg/m³`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setLenVal(""); setLenUnit("ft"); setLenCompA(""); setLenCompB("");
    setWidVal(""); setWidUnit("ft"); setWidCompA(""); setWidCompB("");
    setHgtVal(""); setHgtUnit("ft"); setHgtCompA(""); setHgtCompB("");
    setMaterialId("none"); setDensityInputVal(""); setDensityUnit("kg_m3");
    setVolOutputUnit("ft3"); setWeightOutputUnit("lb");
    setTouched({}); setCopied(false);
  }

  // Validation errors (only after touch)
  const lenErr  = touched.len  ? (isDimValid(lenVal, lenUnit, lenCompA, lenCompB) ? null : "Enter a positive length.")  : null;
  const widErr  = touched.wid  ? (isDimValid(widVal, widUnit, widCompA, widCompB) ? null : "Enter a positive width.")   : null;
  const hgtErr  = touched.hgt  ? (isDimValid(hgtVal, hgtUnit, hgtCompA, hgtCompB) ? null : "Enter a positive height.") : null;
  const densErr = touched.dens ? (!toDensityKgM3(densityInputVal, densityUnit) ? "Enter a valid positive density." : null) : null;

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Material ── */}
      <SectionCard id="material" title="Material" icon="🏗️" open={open.has("material")} onToggle={toggleSection}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <FieldGroup label="Material" hint="Selecting a material auto-fills the density">
              <select
                value={materialId}
                onChange={(e) => handleMaterialChange(e.target.value)}
                style={{ ...SELECT, width: "100%" }}
              >
                <option value="none">Select a material…</option>
                <option value="custom">Custom density</option>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <optgroup key={cat.group} label={cat.group}>
                    {cat.items.map((mat) => (
                      <option key={mat.id} value={mat.id}>{mat.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FieldGroup>
          </div>
          {matLabel && (
            <InfoPill text={`${matLabel}: ${densityInputVal || "—"} ${densSymbol}`} />
          )}
        </div>
      </SectionCard>

      {/* ── Dimensions ── */}
      <SectionCard id="dimensions" title="Dimensions" icon="📐" open={open.has("dimensions")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Length" error={lenErr}>
                <DimensionInput
                  val={lenVal} setVal={setLenVal} unit={lenUnit} setUnit={setLenUnit}
                  compA={lenCompA} setCompA={setLenCompA} compB={lenCompB} setCompB={setLenCompB}
                  placeholder="e.g. 2" onBlurField={() => touch("len")} hasError={!!lenErr}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <FieldGroup label="Width" error={widErr}>
                <DimensionInput
                  val={widVal} setVal={setWidVal} unit={widUnit} setUnit={setWidUnit}
                  compA={widCompA} setCompA={setWidCompA} compB={widCompB} setCompB={setWidCompB}
                  placeholder="e.g. 1" onBlurField={() => touch("wid")} hasError={!!widErr}
                />
              </FieldGroup>
            </div>
          </div>
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <FieldGroup label="Height" error={hgtErr}>
              <DimensionInput
                val={hgtVal} setVal={setHgtVal} unit={hgtUnit} setUnit={setHgtUnit}
                compA={hgtCompA} setCompA={setHgtCompA} compB={hgtCompB} setCompB={setHgtCompB}
                placeholder="e.g. 0.5" onBlurField={() => touch("hgt")} hasError={!!hgtErr}
              />
            </FieldGroup>
          </div>

          {/* Live volume preview */}
          {volM3 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
              <div style={{
                background: "var(--accent-light)", border: "1.5px solid var(--accent)",
                borderRadius: "var(--radius-md)", padding: "10px 16px",
                display: "flex", alignItems: "baseline", gap: 8,
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Volume</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {fmtN(volDisplay, 4)}
                </span>
              </div>
              <select value={volOutputUnit} onChange={(e) => setVolOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 190 }}>
                {VOLUME_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Density ── */}
      <SectionCard id="density" title="Density" icon="⚗️" open={open.has("density")} onToggle={toggleSection}>
        <FieldGroup
          label="Density"
          hint="Auto-filled from material. Override to use a custom value."
          error={densErr}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="number" inputMode="decimal" min="0" step="any"
              value={densityInputVal} placeholder="e.g. 7850"
              onChange={(e) => { setDensityInputVal(e.target.value); setMaterialId("custom"); }}
              onFocus={(e) => (e.target.style.borderColor = densErr ? "var(--error)" : "var(--accent)")}
              onBlur={(e) => { e.target.style.borderColor = densErr ? "var(--error)" : "var(--border)"; touch("dens"); }}
              style={{ ...INPUT, flex: "1 1 100px", minWidth: 0, borderColor: densErr ? "var(--error)" : "var(--border)" }}
            />
            <select
              value={densityUnit}
              onChange={(e) => handleDensityUnitChange(e.target.value)}
              style={{ ...SELECT, flex: "0 0 auto", width: "auto", minWidth: 120 }}
            >
              {DENSITY_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </FieldGroup>

        {/* Density quick reference */}
        {densityKgM3 && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["kg/m³",  densityKgM3],
              ["g/cm³",  densityKgM3 / 1000],
              ["lb/ft³", densityKgM3 / 16.0185],
              ["lb/in³", densityKgM3 / 27679.9],
            ].map(([unit, val]) => (
              <div key={unit} style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{fmtN(val, 4)}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{unit}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Results ── */}
      <SectionCard id="results" title="Results" icon="📊" open={open.has("results")} onToggle={toggleSection}>
        {!hasResults ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, textAlign: "center", padding: "12px 0" }}>
            Enter dimensions and density above to see results.
          </p>
        ) : (
          <>
            {/* Weight unit selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <label style={{ ...LBL, marginBottom: 0 }}>Weight unit</label>
              <select value={weightOutputUnit} onChange={(e) => setWeightOutputUnit(e.target.value)} style={{ ...SELECT, width: "auto", minWidth: 190 }}>
                {WEIGHT_OUTPUT_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>

            <div>
              <ResultRow label="Volume"               value={fmtN(volDisplay, 4)}    unit={volSymbol}    />
              <ResultRow label="Density"              value={densityInputVal}          unit={densSymbol}   />
              <ResultRow label={`Weight (${weightSymbol})`} value={fmtN(weightDisplay, 2)} unit={weightSymbol} accent bold />
              <ResultRow label="Weight per ft³"       value={fmtN(wPerFt3, 2)}        unit="lb/ft³"       />
              <ResultRow label="Weight per m³"        value={fmtN(wPerM3,  2)}        unit="kg/m³"        />
            </div>

            {/* Highlight box */}
            <div style={{
              marginTop: 14, padding: "14px 18px",
              background: "var(--accent-light)", border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-md)", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Total Weight
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px, 5vw, 36px)", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {fmtN(weightDisplay, 2)}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--accent)", marginTop: 4 }}>
                {weightSymbol}
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={handleCopy}
                style={{
                  fontSize: 13, padding: "8px 16px",
                  background: copied ? "#f0fdf4" : undefined,
                  color:      copied ? "#16a34a" : undefined,
                  borderColor: copied ? "#86efac" : undefined,
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Results"}
              </button>
              <button
                className="btn btn-ghost" onClick={handleReset}
                style={{ fontSize: 13, padding: "8px 16px", color: "var(--text-muted)" }}
              >
                ↺ Reset
              </button>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Price Checker ── */}
      <PriceCheckerCard
        quantities={{
          lb:         weightLb,
          kg:         weightKg,
          ustons:     weightUstons,
          metrictons: weightMetrictons,
        }}
        priceUnits={[
          { id: "lb",         label: "per lb",         display: "lb"         },
          { id: "kg",         label: "per kg",         display: "kg"         },
          { id: "ustons",     label: "per short ton",  display: "short ton"  },
          { id: "metrictons", label: "per metric ton", display: "metric ton" },
        ]}
        defaultPriceUnit="lb"
      />

      {/* ── Formula ── */}
      <SectionCard id="formula" title="Formula" icon="🔢" open={open.has("formula")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FormulaBox text="Volume = Length × Width × Height" />
          <FormulaBox text="Weight = Volume × Density" />
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            All dimensions are converted to meters internally. Volume is computed in m³, then multiplied by
            density (kg/m³) to give weight in kg. Results are converted to the selected display units.
            Weight per ft³ = density ÷ 16.0185. Weight per m³ = density in kg/m³.
          </p>
        </div>
      </SectionCard>

      {/* ── Example ── */}
      <SectionCard id="example" title="Example" icon="📝" open={open.has("example")} onToggle={toggleSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Length",         "2 ft"],
            ["Width",          "1 ft"],
            ["Height",         "0.5 ft"],
            ["Material",       "Steel"],
            ["Density",        "490 lb/ft³  (≈ 7849 kg/m³)"],
            ["Volume",         "2 × 1 × 0.5 = 1 ft³  (= 0.02832 m³)"],
            ["Weight",         "1 × 490 = 490 lb"],
            ["Weight (kg)",    "0.02832 × 7849 = 222.26 kg"],
            ["Weight / ft³",   "490 lb/ft³"],
            ["Weight / m³",    "7849 kg/m³"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", minWidth: 140, flexShrink: 0 }}>{k}:</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, padding: "10px 14px", background: "var(--accent-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
              Result: 1 ft³ of Steel @ 490 lb/ft³ = 490 lb (222.26 kg)
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Notes ── */}
      <SectionCard id="notes" title="Notes" icon="💡" open={open.has("notes")} onToggle={toggleSection}>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "All material densities are approximate — actual values vary by alloy, grade, moisture content, and temperature.",
            "Compound units (ft/in, m/cm) let you enter mixed measurements without converting.",
            "For hollow or non-solid shapes, multiply the result by the fill factor (e.g. × 0.5 for half-filled).",
            "1 short ton (US) = 2000 lb. 1 long ton (UK) = 2240 lb. 1 metric ton (t) = 1000 kg = 2204.6 lb.",
            "Steel reference: 490 lb/ft³ = 7849 kg/m³. Aluminum: 168.5 lb/ft³ = 2700 kg/m³.",
            "For wood, density can vary widely by moisture content — air-dried values are used here.",
            "Weight per ft³ and weight per m³ are equal to the material density in those units.",
          ].map((tip) => (
            <li key={tip} style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)", lineHeight: 1.6 }}>{tip}</li>
          ))}
        </ul>
      </SectionCard>

    </div>
  );
}
