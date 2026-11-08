import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import {
  FIELDS, DEFAULT_TEXTS, SLEEP_OPTIONS, PARAM_OPTIONS, LIFE_UNITS, CURRENT_UNITS, NEEDED, fieldsFor, lifeKey, calculateBatteryLife, showSi, usableMah,
} from "../../../utils/batteryLifeCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const pairRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", columnGap: 10 };

const blankFields = () => Object.fromEntries(Object.keys(FIELDS).map((k) => {
  const unit = FIELDS[k].units.find((u) => u.value === FIELDS[k].unit);
  return [k, { unit: FIELDS[k].unit, texts: unit?.parts ? ["", ""] : [DEFAULT_TEXTS[k] ?? ""] }];
}));
const EMPTY = () => ({ sleep: "none", param: "current", fields: blankFields() });
/** The boxes typed for these options; battery life, the average current and (from wattage) the current draws are results only. */
const inputsFor = (sleep, param) => NEEDED[`${sleep}-${param}`];
const unitOf = (k, unit) => FIELDS[k].units.find((u) => u.value === unit);
const show = (k, unit, texts) => {
  const u = unitOf(k, unit);
  return u?.parts ? `${texts[0] || 0} ${u.parts[0]} ${texts[1] || 0} ${u.parts[1]}` : `${texts[0]} ${u?.short ?? ""}`.trim();
};

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the battery capacity and your device&apos;s consumption, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const life = lifeKey(result.sleep);
  const seconds = result.values[life];
  const lifeText = show(life, result.units[life], result.display[life]);
  const alt = ["hrs", "days"].filter((u) => u !== result.units[life]).map((u) => `${showSi(LIFE_UNITS, u, seconds)} ${u}`).join(" · ");
  const current = result.sleep === "none" ? "current" : "averageCurrent";
  const keys = fieldsFor(result.sleep, result.param);
  return (
    <>
      <HighlightSummary label="Battery life" value={lifeText} color="var(--success)" note={alt} />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
        The battery will last about <strong>{lifeText}</strong> before it reaches the discharge safety limit.
      </p>
      <StatList>
        <StatRow label="Usable capacity">{usableMah(result.values)} mAh</StatRow>
        {result.values[current] && !result.solved.includes(current) && (
          <StatRow label={result.sleep === "none" ? "Device current draw" : "Average current draw"}>{showSi(CURRENT_UNITS, "mA", result.values[current])} mA</StatRow>
        )}
        {keys.filter((k) => k !== life && result.solved.includes(k)).map((k) => (
          <StatRow key={k} label={FIELDS[k].label}>{show(k, result.units[k], result.display[k])}</StatRow>
        ))}
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        An approximation: real runtime also depends on temperature, battery age and how the load changes over time.
      </p>
    </>
  );
}

export default function BatteryLifeCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { sleep, param, fields } = s;

  const run = (state) => {
    // Result boxes have no input, so they are always calculated.
    const inputs = inputsFor(state.sleep, state.param);
    const input = Object.fromEntries(Object.entries(state.fields).map(([k, f]) => [k, inputs.includes(k) ? f : { ...f, texts: f.texts.map(() => "") }]));
    const r = calculateBatteryLife({ sleep: state.sleep, param: state.param, fields: input, order: inputs, defaults: [] });
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    if (r.errors) return r;
    return { ...r, sleep: state.sleep, param: state.param, units: Object.fromEntries(Object.keys(FIELDS).map((k) => [k, state.fields[k].unit])) };
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
  const setOption = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const field = (k) => (
    <div key={k} style={fieldWrap}>
      <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <FieldLabel>{FIELDS[k].label}</FieldLabel>
        <Req name={k} flagged={req.flagged}>
          <UnitMeasureField
            label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={setUnit(k)}
            values={fields[k].texts} onChange={setTexts(k)}
          />
        </Req>
      </label>
      {FIELDS[k].help && <p style={help}>{FIELDS[k].help}</p>}
    </div>
  );
  const deviceKeys = inputsFor(sleep, param).filter((k) => !["capacity", "safety"].includes(k));
  const pair = (a, b) => <div key={a} style={pairRow}>{field(a)}{field(b)}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Estimate how long a battery will run your device from its capacity and the device&apos;s current draw or wattage, with or without a
        sleep mode.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Battery and device">
            {field("capacity")}
            {field("safety")}
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>Find battery life for device:</FieldLabel></legend>
              {SLEEP_OPTIONS.map((o) => <RadioOption key={o.value} checked={sleep === o.value} onChange={() => setOption({ sleep: o.value })} label={o.label} />)}
            </fieldset>
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>I know my device&apos;s...</FieldLabel></legend>
              {PARAM_OPTIONS.map((o) => <RadioOption key={o.value} checked={param === o.value} onChange={() => setOption({ param: o.value })} label={o.label} />)}
            </fieldset>
            {deviceKeys.map((k) => {
              if (k === "awakeTime" || k === "sleepTime") return null;
              if (k === "currentAwake" || k === "wattageAwake") return pair(k, "awakeTime");
              if (k === "currentSleep" || k === "wattageSleep") return pair(k, "sleepTime");
              return field(k);
            })}
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
