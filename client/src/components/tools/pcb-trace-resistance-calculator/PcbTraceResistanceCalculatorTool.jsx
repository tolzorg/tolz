import { useState } from "react";
import { FieldLabel } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { FIELDS, FIELD_KEYS, calculatePcbTraceResistance, convertText } from "../../../utils/pcbTraceResistanceCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };

const EMPTY = () => ({
  fields: Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [FIELDS[k].default ?? ""] }])),
});
/** Resistance and voltage drop are results only; these boxes are typed (the current is optional). */
const INPUT_KEYS = ["width", "length", "thickness", "ambient", "rho", "alpha", "current"];
const REQUIRED = ["width", "length", "thickness", "ambient", "rho", "alpha"];
const isBlank = (f) => f.texts.every((t) => String(t).trim() === "");
const shortOf = (k, unit) => FIELDS[k].units.find((u) => u.value === unit)?.short ?? "";

/** A copper trace on a board, with its width W, length L and thickness T. */
function TraceSketch() {
  const text = { fontSize: 11, fill: "var(--text-secondary)", fontFamily: "var(--font-body)" };
  const line = { stroke: "var(--text-muted)", strokeWidth: 1 };
  return (
    <svg viewBox="0 0 260 120" role="img" aria-label="PCB trace with width W, length L and thickness T" style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto 12px" }}>
      <polygon points="20,80 170,20 250,50 100,110" fill="#86d68a" />
      <polygon points="20,80 100,110 100,116 20,86" fill="#5fb064" />
      <polygon points="100,110 250,50 250,56 100,116" fill="#6cc271" />
      <polygon points="70,72 185,26 205,34 90,80" fill="#e8b923" />
      <polygon points="90,80 205,34 205,39 90,85" fill="#c99a12" />
      <polygon points="70,72 90,80 90,85 70,77" fill="#d6a917" />
      <line x1="66" y1="66" x2="181" y2="20" {...line} /><text x="112" y="38" {...text}>L</text>
      <line x1="187" y1="20" x2="209" y2="29" {...line} /><text x="196" y="17" {...text}>W</text>
      <line x1="212" y1="34" x2="212" y2="39" {...line} /><text x="216" y="40" {...text}>T</text>
    </svg>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the trace&apos;s width, length, thickness and ambient temperature, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const show = (k) => `${result.display[k][0]} ${shortOf(k, result.units[k])}`;
  return (
    <>
      <HighlightSummary label="Resistance" value={result.display.resistance[0]} unit={shortOf("resistance", result.units.resistance)} color={result.warnings.length ? "var(--error)" : "var(--accent)"} />
      {result.warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
      <StatList>
        {result.display.current[0] !== "" && <StatRow label="Current">{show("current")}</StatRow>}
        {result.display.voltage[0] !== "" && <StatRow label="Voltage drop">{show("voltage")}</StatRow>}
      </StatList>
      {result.display.current[0] === "" && result.display.voltage[0] === "" && (
        <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>Enter a current under <em>Voltage drop calculation</em> to get the voltage drop along the trace (Ohm&apos;s law).</p>
      )}
    </>
  );
}

export default function PcbTraceResistanceCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { fields } = s;

  const run = (state) => {
    const missing = REQUIRED.filter((k) => isBlank(state.fields[k]));
    req.flag(missing);
    if (missing.length) return null;
    // Resistance and voltage drop have no input boxes, so they are always calculated.
    const input = { ...state.fields };
    for (const k of FIELD_KEYS) if (!INPUT_KEYS.includes(k)) input[k] = { ...input[k], texts: [""] };
    const r = calculatePcbTraceResistance(input, INPUT_KEYS, []);
    if (r.missing) { req.flag(r.missing); return null; }
    if (r.errors) return r;
    return { ...r, units: Object.fromEntries(FIELD_KEYS.map((k) => [k, state.fields[k].unit])) };
  };
  const setTexts = (k) => (i, text) => setS((p) => ({
    ...p,
    fields: { ...p.fields, [k]: { unit: p.fields[k].unit, texts: [text] } },
  }));
  const setUnit = (k) => (unit) => setS((p) => ({
    ...p, fields: { ...p.fields, [k]: { unit, texts: convertText(k, p.fields[k].unit, unit, p.fields[k].texts) } },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const field = (k) => (
    <div key={k} style={fieldWrap}>
      <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <FieldLabel>{FIELDS[k].label}</FieldLabel>
        <Req name={k} flagged={req.flagged}>
          <UnitMeasureField label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={setUnit(k)} values={fields[k].texts} onChange={setTexts(k)} />
        </Req>
      </label>
      {FIELDS[k].help && <p style={help}>{FIELDS[k].help}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find the resistance of a PCB trace from its dimensions and temperature, and the voltage drop along it with Ohm&apos;s law. It works for
        copper by default, but you can set the resistivity of any material.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Inputs">
            <h3 style={cardTitle}>Inputs</h3>
            <TraceSketch />
            {["width", "length", "thickness", "ambient"].map(field)}
          </section>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Resistivity properties</summary>
            <div style={{ marginTop: 12 }}>{["rho", "alpha"].map(field)}<p style={{ ...muted, fontSize: 12.5 }}>The defaults are for copper.</p></div>
          </details>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Voltage drop calculation</summary>
            <div style={{ marginTop: 12 }}>
              {field("current")}
              <p style={{ ...muted, fontSize: 12.5 }}>Optional: enter the current to get the voltage drop along the trace in the result.</p>
            </div>
          </details>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Output</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
