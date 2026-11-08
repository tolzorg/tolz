import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import {
  FIELDS, MAIN_KEYS, OTHER_KEYS, EXAMPLES, calculateBatteryCapacity, matchingExample, showIn,
} from "../../../utils/batteryCapacityCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const groupHead = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5, color: "var(--text-primary)", margin: "16px 0 0" };
const exampleBtn = {
  textAlign: "left", padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-white)",
  cursor: "pointer", fontSize: 13, color: "var(--text-primary)", lineHeight: 1.45,
};
const stepsBox = { margin: "12px 0 0", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--accent-light)", border: "1px solid var(--accent)" };

const blankFields = () => Object.fromEntries(Object.keys(FIELDS).map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => ({ fields: blankFields(), order: [], solved: [] });
const unitShort = (k, unit) => FIELDS[k].units.find((u) => u.value === unit)?.short ?? "";

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the voltage and the battery capacity (or any two of voltage, capacity and stored energy), then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { values: v, display, units, solved } = result;
  const text = (k) => `${display[k][0]} ${unitShort(k, units[k])}`.trim();
  const row = (k) => display[k][0] !== "" && (
    <StatRow key={k} label={FIELDS[k].label} tone={solved.includes(k) ? "var(--accent)" : undefined}>{text(k)}</StatRow>
  );
  // The headline is the answer: a solved voltage / capacity / energy, else the stored energy, else the runtime.
  const main = MAIN_KEYS.find((k) => solved.includes(k)) || (v.energy ? "energy" : v.runtime ? "runtime" : OTHER_KEYS.find((k) => solved.includes(k)));
  const note = main === "energy" ? [
    units.energy !== "Wh" && `${showIn("energy", "Wh", v.energy)} Wh`,
    units.energy !== "kWh" && `${showIn("energy", "kWh", v.energy)} kWh`,
  ].filter(Boolean).join(" · ") : undefined;
  return (
    <>
      <HighlightSummary label={FIELDS[main].label} value={display[main][0]} unit={unitShort(main, units[main])} color="var(--success)" note={note} />
      {MAIN_KEYS.some((k) => display[k][0] !== "") && (
        <>
          <h3 style={groupHead}>Battery</h3>
          <StatList>{MAIN_KEYS.map(row)}</StatList>
        </>
      )}
      {OTHER_KEYS.some((k) => display[k][0] !== "") && (
        <>
          <h3 style={groupHead}>Other battery parameters</h3>
          <StatList>{OTHER_KEYS.map(row)}</StatList>
        </>
      )}
      {result.example && (
        <div style={stepsBox}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>How the result is calculated:</p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>
            {result.example.steps.map((st) => <li key={st}>{st}</li>)}
          </ol>
        </div>
      )}
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        Values the calculator worked out are highlighted in blue. To see how long a device will run on this battery, try the{" "}
        <Link to="/calculators/tech-electronics/battery-life-calculator" style={{ color: "var(--accent)" }}>battery life calculator</Link>.
      </p>
    </>
  );
}

export default function BatteryCapacityCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const [otherOpen, setOtherOpen] = useState(false);
  const req = useRequiredFields();
  const { fields, solved } = s;

  const run = (state) => {
    const input = { ...state.fields };
    for (const k of state.solved) input[k] = { ...input[k], texts: [""] };
    const r = calculateBatteryCapacity(input, state.order.filter((k) => !state.solved.includes(k)));
    if (r.missing) {
      req.flag(r.missing);
      setS({ ...state, fields: input, solved: [] });
      return null;
    }
    req.flag([]);
    if (r.errors) { setS(state); return r; }
    const next = { ...input };
    for (const k of r.solved) next[k] = { unit: input[k].unit, texts: r.display[k] };
    setS({ ...state, fields: next, solved: r.solved });
    return { ...r, units: Object.fromEntries(Object.keys(FIELDS).map((k) => [k, state.fields[k].unit])), example: matchingExample(input) };
  };
  const setTexts = (key) => (i, text) => setS((prev) => ({
    ...prev,
    fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts: [text] } },
    order: [...prev.order.filter((k) => k !== key), key],
    solved: prev.solved.filter((k) => k !== key), // typed over: it's the user's value now
  }));
  const setUnit = (key) => (unit) => setS((prev) => ({
    ...prev, fields: { ...prev.fields, [key]: { unit, texts: convertUnitTexts(FIELDS[key].units, prev.fields[key].unit, unit, prev.fields[key].texts) } },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };
  const loadExample = (ex) => {
    const next = EMPTY();
    for (const [k, text] of Object.entries(ex.values)) next.fields[k] = { unit: FIELDS[k].unit, texts: [text] };
    next.order = Object.keys(ex.values);
    req.clear();
    setResult(run(next));
  };

  const field = (k) => (
    <div key={k} style={fieldWrap}>
      <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <FieldLabel>{FIELDS[k].label}</FieldLabel>
        <Req name={k} flagged={req.flagged}>
          <UnitMeasureField
            label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={setUnit(k)}
            values={fields[k].texts} onChange={setTexts(k)} highlight={solved.includes(k)}
          />
        </Req>
      </label>
      {FIELDS[k].help && <p style={help}>{FIELDS[k].help}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Convert between amp-hours and watt-hours (stored energy = voltage × capacity), and find a battery&apos;s C-rate, charge or discharge
        current and runtime to full capacity. Any value can be left blank to calculate it.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Battery">
            {MAIN_KEYS.map(field)}
          </section>

          <details className="card" style={{ padding: "14px 18px" }} open={otherOpen} onToggle={(e) => setOtherOpen(e.currentTarget.open)}>
            <summary style={summary}>Other battery parameters</summary>
            <div style={{ marginTop: 12 }}>{OTHER_KEYS.map(field)}</div>
          </details>

          <section className="card" style={{ padding: 18 }} aria-label="Examples">
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Check our examples:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex.id} type="button" style={exampleBtn} onClick={() => loadExample(ex)}>
                  <strong>Example {ex.id}: {ex.title}</strong>
                  <span style={{ display: "block", color: "var(--text-secondary)", fontSize: 12.5 }}>{ex.question}</span>
                </button>
              ))}
            </div>
            <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
              Values the calculator fills in are shown in blue. When more values are typed than needed, the ones typed last are kept.
            </p>
          </section>
          <ButtonRow onCalculate={calculate} onClear={clear} />
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
