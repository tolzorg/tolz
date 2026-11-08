import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  TABS, NEC_SIZES, NEC_MATERIALS, CONDUITS, SIZE_MATERIALS, WIRE_SIZES, RESISTANCE_UNITS, PHASES, CONDUCTORS, DISTANCE_UNITS,
  PLACEHOLDERS, DEFAULTS, calculateVoltageDrop,
} from "../../../utils/voltageDropCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13 };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: 0, padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };

const opts = (list) => list.map((o) => ({ value: o.value, label: o.label }));
const SIZE_OPTIONS = NEC_SIZES.map((l, i) => ({ value: String(i), label: l }));
const WIRE_OPTIONS = WIRE_SIZES.map(([l], i) => ({ value: String(i), label: l }));
const EMPTY = () => ({ tab: "nec", ...DEFAULTS, pf: "", resistance: "", voltage: "", distance: "", current: "" });
/** Under 3% is comfortable, up to the recommended 5% is acceptable, beyond that the wire is too small or too long. */
const toneFor = (pct) => (pct <= 3 ? "var(--success)" : pct <= 5 ? "var(--warning)" : "var(--error)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose the wire, enter the voltage, distance and load current, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.unlikely) return <p role="alert" style={notice}>⚠ {result.unlikely}</p>;
  const tone = toneFor(result.percent);
  return (
    <>
      <HighlightSummary label="Voltage drop" value={result.dropText} unit="V" color={tone} note={`${result.percentText} of the supply`} />
      <StatList>
        <StatRow label="Voltage drop">{result.dropText} V</StatRow>
        <StatRow label="Voltage drop percentage" tone={tone}>{result.percentText}</StatRow>
        <StatRow label="Voltage at the end" tone="var(--accent)">{result.endText} V</StatRow>
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        {result.percent <= 5 ? "Within" : "Above"} the recommended maximum of 5% voltage drop under full load.
      </p>
      {result.note && <p style={{ ...muted, fontSize: 12.5, marginTop: 8 }}>{result.note}</p>}
    </>
  );
}

export default function VoltageDropCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const [started, setStarted] = useState(false); // after the first Calculate, every change recalculates (even from a flagged state)
  const req = useRequiredFields();

  const run = (state) => {
    const r = calculateVoltageDrop({ ...state, necSize: Number(state.necSize), wireSize: Number(state.wireSize) });
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (started) setResult(run(next));
  };
  const set = (k) => (v) => update({ [k]: v });
  const calculate = () => { setStarted(true); setResult(run(s)); };
  const clear = () => { setS(EMPTY()); setResult(null); setStarted(false); req.clear(); };

  const select = (label, k, options) => (
    <label style={fieldWrap}>
      <FieldLabel>{label}</FieldLabel>
      <SelectField value={String(s[k])} onChange={set(k)} options={options} />
    </label>
  );
  const text = (label, k, after) => (
    <div style={fieldWrap}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
          <FieldLabel>{label}</FieldLabel>
          <Req name={k} flagged={req.flagged}><TextField value={s[k]} onChange={set(k)} placeholder={PLACEHOLDERS[k]} style={{ width: "100%" }} /></Req>
        </label>
        {after}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Estimate the voltage drop of an electrical circuit. <strong>NEC data</strong> uses the resistance and reactance values of the National
        Electrical Code, <strong>Estimated resistance</strong> estimates the resistance from the wire size, and <strong>Other</strong> takes your
        own resistance or impedance data, for example from other standards or a wire manufacturer.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 480 }}>
          {/* Same tab style as the Auto Loan / Boat Loan calculators: the active tab is the blue one. */}
          <div role="tablist" aria-label="Wire data" style={{ display: "flex", marginBottom: -1 }}>
            {TABS.map(({ value, label }, i) => (
              <button
                key={value} type="button" role="tab" aria-selected={s.tab === value} onClick={() => update({ tab: value })}
                style={{
                  flex: 1, padding: "11px 4px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
                  border: "1px solid var(--border)", borderBottom: s.tab === value ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: i === 0 ? "var(--radius-md)" : 0, borderTopRightRadius: i === TABS.length - 1 ? "var(--radius-md)" : 0,
                  background: s.tab === value ? "var(--accent)" : "var(--bg-white)", color: s.tab === value ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: s.tab === value ? 1 : 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="card" role="tabpanel" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {s.tab === "nec" && (
              <>
                {select("Wire material", "necMaterial", opts(NEC_MATERIALS))}
                {select("Wire size", "necSize", SIZE_OPTIONS)}
                {select("Material of conduit", "conduit", opts(CONDUITS))}
                {text("Power factor (PF)", "pf")}
              </>
            )}
            {s.tab === "size" && (
              <>
                {select("Wire material", "sizeMaterial", opts(SIZE_MATERIALS))}
                {select("Wire size", "wireSize", WIRE_OPTIONS)}
              </>
            )}
            {s.tab === "other" && text("Wire impedance or resistance", "resistance",
              <SelectField value={s.resistanceUnit} onChange={set("resistanceUnit")} options={opts(RESISTANCE_UNITS)} style={small} />)}
            {text("Voltage", "voltage", <span style={{ ...suffix, paddingBottom: 10 }}>V</span>)}
            {select("Phase", "phase", opts(PHASES))}
            {select("Number of conductors", "conductors", opts(CONDUCTORS))}
            {text("Distance (one-way)", "distance",
              <SelectField value={s.distanceUnit} onChange={set("distanceUnit")} options={opts(DISTANCE_UNITS)} style={small} />)}
            {text("Load current", "current", <span style={{ ...suffix, paddingBottom: 10 }}>Amps</span>)}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
