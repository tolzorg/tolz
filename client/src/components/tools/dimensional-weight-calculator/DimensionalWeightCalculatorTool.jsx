import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import {
  SYSTEMS, UNITS, RESULT_UNITS, RATES, FIELD_KEYS, FIELD_LABELS, calculateDimensionalWeight, dimIn,
} from "../../../utils/dimensionalWeightCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };

const blankSystem = (system) => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: k === "weight" ? UNITS[system].weightUnit : UNITS[system].lengthUnit, texts: [""] }]));
const EMPTY = () => ({
  system: "metric", rate: "139",
  fields: { imperial: blankSystem("imperial"), metric: blankSystem("metric") },
  resultUnit: { imperial: "lb", metric: "kg" },
});

function ResultBody({ result, system, resultUnit, onResultUnit }) {
  if (!result) return <p style={muted}>Enter the package&apos;s dimensions and actual weight, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const [first] = result.carriers;
  const units = RESULT_UNITS[system];
  const unitLabel = units.find((u) => u.value === resultUnit)?.short ?? "";
  return (
    <>
      <HighlightSummary
        label={`Shipping weight with ${first.name}`} value={first.charged} unit={result.unit}
        color={first.byDim ? "var(--accent-2)" : "var(--success)"} badge={first.byDim ? "Dimensional weight" : "Actual weight"}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, margin: "4px 0 6px" }}>
        <span style={{ ...muted, fontSize: 12.5 }}>Dimensional weight in</span>
        <SelectField value={resultUnit} onChange={onResultUnit} options={units.map((u) => ({ value: u.value, label: u.short }))} style={{ width: "auto", padding: "4px 8px", fontSize: 12.5 }} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>Carrier</th><th>Divisor</th><th>Dimensional weight</th><th>You&apos;ll be charged for</th></tr></thead>
          <tbody>
            {result.carriers.map((c) => (
              <tr key={c.name}>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td style={center}>{c.divisor}</td>
                <td style={center}>{dimIn(system, resultUnit, c).join(" / ")} {unitLabel}</td>
                <td style={{ ...center, fontWeight: 700, color: c.byDim ? "var(--accent-2)" : "var(--success)" }}>{c.charged} {result.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {result.carriers.map((c) => (
          <p key={c.name} style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
            Shipping with <strong>{c.name}</strong>, you will be charged for <strong>{c.charged} {result.unit}</strong>.
          </p>
        ))}
      </div>
      {result.notes.map((n) => <p key={n} role="note" style={notice}>⚠ {n}</p>)}
    </>
  );
}

export default function DimensionalWeightCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { system, rate } = s;
  const fields = s.fields[system];
  const u = UNITS[system];

  const run = (state) => {
    const r = calculateDimensionalWeight({ system: state.system, rate: state.rate, fields: state.fields[state.system] });
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const setField = (key, f) => setS((prev) => ({ ...prev, fields: { ...prev.fields, [prev.system]: { ...prev.fields[prev.system], [key]: f } } }));
  const setTexts = (key) => (i, text) => {
    const texts = [...fields[key].texts];
    texts[i] = text;
    setField(key, { unit: fields[key].unit, texts });
  };
  const setUnit = (key) => (unit) => {
    const units = key === "weight" ? u.weight : u.length;
    setField(key, { unit, texts: convertUnitTexts(units, fields[key].unit, unit, fields[key].texts) });
  };
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Work out the dimensional (volumetric) weight of a package for UPS, USPS and FedEx, and which weight you&apos;ll be charged for: the
        dimensional or the actual one, whichever is higher.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Units">
            <h3 style={cardTitle}>First, choose the units</h3>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>Units</FieldLabel></legend>
              {SYSTEMS.map((o) => <RadioOption key={o.value} checked={system === o.value} onChange={() => update({ system: o.value })} label={o.label} />)}
            </fieldset>
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Measurements">
            <h3 style={cardTitle}>Measurements</h3>
            {FIELD_KEYS.map((k) => (
              <label key={`${system}-${k}`} style={fieldWrap}>
                <FieldLabel>{FIELD_LABELS[k]}</FieldLabel>
                <Req name={k} flagged={req.flagged}>
                  <UnitMeasureField
                    label={FIELD_LABELS[k]} units={k === "weight" ? u.weight : u.length} unit={fields[k].unit}
                    onUnitChange={setUnit(k)} values={fields[k].texts} onChange={setTexts(k)}
                  />
                </Req>
              </label>
            ))}
            {system === "imperial" && (
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
                <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>UPS rate</FieldLabel></legend>
                {RATES.map((o) => <RadioOption key={o.value} checked={rate === o.value} onChange={() => update({ rate: o.value })} label={`${o.label} (÷ ${o.value})`} />)}
              </fieldset>
            )}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Shipping weight</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody
              result={result} system={system} resultUnit={s.resultUnit[system]}
              onResultUnit={(unit) => setS((prev) => ({ ...prev, resultUnit: { ...prev.resultUnit, [prev.system]: unit } }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
