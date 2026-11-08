import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import PcbTraceDiagram from "../pcb-trace-width-calculator/PcbTraceDiagram";
import {
  TRACE_TYPES, INPUTS, OUTPUT_UNITS, DEFAULT_OUTPUT_UNITS, calculatePcbTraceCurrent, convertText, showIn,
} from "../../../utils/pcbTraceCurrentCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const unitSelect = { width: "auto", padding: "3px 6px", fontSize: 12.5, marginLeft: 6 };
/** The current is a result only; these three are always typed. */
const REQUIRED = ["width", "thickness", "rise"];

const EMPTY = () => ({
  type: "internal",
  values: Object.fromEntries(Object.keys(INPUTS).map((k) => [k, ""])),
  units: Object.fromEntries(Object.entries(INPUTS).map(([k, d]) => [k, d.unit])),
  outUnits: { ...DEFAULT_OUTPUT_UNITS },
});

function UnitPick({ k, outUnits, setOutUnit }) {
  return <SelectField value={outUnits[k]} onChange={(u) => setOutUnit(k, u)} options={OUTPUT_UNITS[k].map((u) => ({ value: u.value, label: u.short }))} style={unitSelect} />;
}

function ResultBody({ result, outUnits, setOutUnit }) {
  if (!result) return <p style={muted}>Enter the trace width, thickness and temperature rise, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const row = (k, label) => (
    <StatRow label={label}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>{showIn(k, outUnits[k], result[k])}<UnitPick k={k} outUnits={outUnits} setOutUnit={setOutUnit} /></span>
    </StatRow>
  );
  const currentShort = OUTPUT_UNITS.current.find((u) => u.value === outUnits.current)?.short;
  return (
    <>
      <HighlightSummary label="Maximum current" value={showIn("current", outUnits.current, result.current)} unit={currentShort} color="var(--success)" note="the trace can carry" />
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: -4 }}>
        <span style={{ ...muted, fontSize: 12.5 }}>Current in</span><UnitPick k="current" outUnits={outUnits} setOutUnit={setOutUnit} />
      </div>
      {result.warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
      <StatList>
        {row("crossSection", "Cross section")}
        {result.traceTemperature !== null && row("traceTemperature", "Trace temperature")}
        {result.resistance !== null && row("resistance", "Resistance")}
        {result.voltageDrop !== null && row("voltageDrop", "Voltage drop")}
        {result.power !== null && row("power", "Power dissipation")}
      </StatList>
      {result.traceTemperature === null && (
        <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>Add the ambient temperature and the trace length under <em>Additional inputs</em> for the trace temperature, resistance, voltage drop and power dissipation.</p>
      )}
    </>
  );
}

export default function PcbTraceCurrentCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const run = (state) => {
    // The current has no input box, so it is always the value calculated.
    const r = calculatePcbTraceCurrent({ ...state, values: { ...state.values, current: "" }, order: REQUIRED });
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const update = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const setValue = (k) => (i, text) => setS((p) => ({ ...p, values: { ...p.values, [k]: text } }));
  const setUnit = (k) => (unit) => setS((p) => ({
    ...p, units: { ...p.units, [k]: unit }, values: { ...p.values, [k]: convertText(k, p.units[k], unit, p.values[k]) },
  }));
  const setOutUnit = (k, unit) => setS((p) => ({ ...p, outUnits: { ...p.outUnits, [k]: unit } }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const field = (k) => (
    <label key={k} style={fieldWrap}>
      <FieldLabel>{INPUTS[k].label}</FieldLabel>
      <Req name={k} flagged={req.flagged}>
        <UnitMeasureField label={INPUTS[k].label} units={INPUTS[k].units} unit={s.units[k]} onUnitChange={setUnit(k)} values={[s.values[k]]} onChange={setValue(k)} />
      </Req>
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find the maximum current a PCB trace can carry (IPC-2221) from its width, copper thickness and allowed temperature rise, for internal
        and external traces, plus its resistance, voltage drop and power dissipation.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Trace type">
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>The trace is...</FieldLabel></legend>
              {TRACE_TYPES.map((t) => <RadioOption key={t.value} checked={s.type === t.value} onChange={() => update({ type: t.value })} label={t.label} />)}
            </fieldset>
            <PcbTraceDiagram type={s.type} />
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Inputs">
            <h3 style={cardTitle}>Inputs</h3>
            {field("width")}
            {field("thickness")}
            {field("rise")}
          </section>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Additional inputs</summary>
            <div style={{ marginTop: 12 }}>
              {field("ambient")}
              {field("length")}
            </div>
          </details>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Outputs</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} outUnits={s.outUnits} setOutUnit={setOutUnit} />
          </div>
        </div>
      </div>
    </div>
  );
}
