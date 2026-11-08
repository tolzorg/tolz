import { useState } from "react";
import { FieldLabel, TextField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import { MODES, FIELDS, MODE_FIELDS, calculateTaktTime, taktSummary } from "../../../utils/taktTimeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const suffixStyle = { fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };

const blankFields = () => Object.fromEntries(Object.keys(FIELDS).map((k) => {
  const unit = FIELDS[k].units.find((u) => u.value === FIELDS[k].unit);
  return [k, { unit: FIELDS[k].unit, texts: unit?.parts ? ["", ""] : [""] }];
}));
const EMPTY = () => ({ mode: "simple", fields: blankFields() });
/** Takt time and the weekly net production time are results only; every other box of a mode is an input. */
const RESULT_KEYS = ["taktTime", "weeklyNetTime"];
const inputKeys = (mode) => MODE_FIELDS[mode].filter((k) => !RESULT_KEYS.includes(k));
const shortOf = (k, unit) => FIELDS[k].units.find((u) => u.value === unit);
const show = (k, unit, texts) => {
  const u = shortOf(k, unit);
  return u?.parts ? `${texts[0] || 0} ${u.parts[0]} ${texts[1] || 0} ${u.parts[1]}` : `${texts[0]}${u?.short ? ` ${u.short}` : ""}`;
};

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the values, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { mode } = result; // the mode the result was calculated in
  const per = mode === "batch" ? "batch" : "unit";
  const takt = show("taktTime", result.units.taktTime, result.display.taktTime);
  const sum = taktSummary(result.taktSeconds);
  return (
    <>
      <HighlightSummary label="Takt time" value={takt} unit={`/${per}`} color={result.warnings.length ? "var(--error)" : "var(--accent)"} />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
        To meet demand, one {per} must be finished every <strong>{takt}</strong>.
      </p>
      {result.warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
      <StatList>
        <StatRow label="Takt time in seconds">{sum.seconds} sec/{per}</StatRow>
        <StatRow label="Takt time in minutes">{sum.minutes} min/{per}</StatRow>
        {sum.perHour && <StatRow label={`Required pace`}>{sum.perHour} {per === "batch" ? "batches" : "units"}/hour</StatRow>}
        {mode === "weekly" && <StatRow label={FIELDS.weeklyNetTime.label}>{show("weeklyNetTime", result.units.weeklyNetTime, result.display.weeklyNetTime)}/wk</StatRow>}
      </StatList>
    </>
  );
}

export default function TaktTimeCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { mode, fields } = s;

  const run = (state) => {
    // Result boxes have no input, so they are always calculated.
    const input = { ...state.fields };
    for (const k of RESULT_KEYS) input[k] = { ...input[k], texts: input[k].texts.map(() => "") };
    const r = calculateTaktTime(state.mode, input, inputKeys(state.mode));
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    if (r.errors) return r;
    return { ...r, mode: state.mode, units: Object.fromEntries(Object.keys(FIELDS).map((k) => [k, state.fields[k].unit])) };
  };
  const setTexts = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return {
      ...prev,
      fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts } },
    };
  });
  const setUnit = (key) => (unit) => setS((prev) => ({
    ...prev, fields: { ...prev.fields, [key]: { unit, texts: convertUnitTexts(FIELDS[key].units, prev.fields[key].unit, unit, prev.fields[key].texts) } },
  }));
  const setMode = (value) => setS((prev) => ({ ...prev, mode: value })); // the result updates on Calculate only
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const field = (k) => {
    const def = FIELDS[k];
    const unitless = def.units.length === 1;
    return (
      <div key={`${mode}-${k}`} style={fieldWrap}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <FieldLabel>{def.label}</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Req name={k} flagged={req.flagged}>
              {unitless ? (
                <TextField value={fields[k].texts[0]} onChange={(t) => setTexts(k)(0, t)} />
              ) : (
                <UnitMeasureField
                  label={def.label} units={def.units} unit={fields[k].unit} onUnitChange={setUnit(k)}
                  values={fields[k].texts} onChange={setTexts(k)}
                />
              )}
            </Req>
            {def.suffix && <span style={suffixStyle}>{def.suffix}</span>}
          </div>
        </label>
        {def.help && <p style={help}>{def.help}</p>}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find how fast each product must be made to meet demand: simple takt time, takt time for batch production, or a weekly takt time
        from your working days, hours and breaks.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Takt time">
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px" }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>Calculate</FieldLabel></legend>
              {MODES.map((m) => <RadioOption key={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} label={m.label} />)}
            </fieldset>
            {inputKeys(mode).map(field)}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
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
