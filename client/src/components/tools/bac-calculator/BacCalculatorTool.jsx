import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import BacChart from "./BacChart";
import { calculateBac, formatBac, BAC_DEFAULTS, WEIGHT_UNITS, DRINKS, OTHER_UNITS } from "../../../utils/bacCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 };
const labelStyle = { flex: "0 0 132px", fontSize: 13.5, color: "var(--text-primary)" };
const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 8px" };
const sectionBar = { background: "#336699", color: "#fff", fontWeight: 700, fontSize: 14, padding: "7px 10px", margin: "6px 0 8px", borderRadius: 4 };
const cell = { padding: "3px 4px", verticalAlign: "middle" };
const WEIGHT_MENU = WEIGHT_UNITS.map((u) => ({ ...u, short: u.value }));
const TIME_UNITS = [
  { value: "hm", label: "hours / minutes", short: "h / min", parts: ["hours", "minutes"] },
  { value: "h", label: "hours", short: "hours" },
  { value: "min", label: "minutes", short: "min" },
];
/** Minutes in the time boxes (NaN when not numbers). */
const timeMinutes = (unit, a, b) => (unit === "min" ? Number(a || 0) : unit === "h" ? Number(a || 0) * 60 : Number(a || 0) * 60 + Number(b || 0));
const timeBoxes = (unit, minutes) => {
  const r = (x) => String(Math.round(x * 100) / 100);
  if (unit === "min") return [r(minutes), ""];
  if (unit === "h") return [r(minutes / 60), ""];
  return [String(Math.floor(minutes / 60)), r(minutes - Math.floor(minutes / 60) * 60)];
};
/** The engine's hours / minutes from the time boxes. */
const engineTime = (v) => (v.timeUnit === "min" ? { hours: "0", minutes: v.hours } : v.timeUnit === "h" ? { hours: v.hours, minutes: "0" } : { hours: v.hours, minutes: v.minutes });

const D = BAC_DEFAULTS;
// Drink amounts and the time have no example values (blank is 0, as on the reference).
const EMPTY = { ...D, weight: "", timeUnit: "hm", hours: "", minutes: "", beer: "", wine: "", liquor: "", other: "" };
// A blank time is 0 (as on the reference), so its boxes show 0 rather than an example.
const TIME_PLACEHOLDERS = { hm: ["0", "0"], h: ["0", ""], min: ["0", ""] };
const KG = { lb: 0.453592, kg: 1, g: 0.001 };
const weightExample = (unit) => (unit === "kg" ? D.weight : String(Math.round((Number(D.weight) / KG[unit]) * (unit === "g" ? 1 : 10)) / (unit === "g" ? 1 : 10)));
const abvOptions = (key) => DRINKS[key].abvs.map((a) => ({ value: a, label: DRINKS[key].abvLabels[a] || `${a}%` }));

/** Color for the BAC level: green below 0.05%, amber up to the 0.08% US driving limit, red above. */
const levelColor = (bac) => (bac >= 0.08 ? "#dc2626" : bac >= 0.05 ? "#d97706" : "#16a34a");

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your details, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  const shown = formatBac(r.bac);
  return (
    <>
      <HighlightSummary
        label="Estimated BAC" value={`${shown}%`} color={levelColor(r.bac)}
        badge={r.bac >= 0.08 ? "Over 0.08% US driving limit" : r.bac > 0 ? "Under 0.08% US driving limit" : "0%"}
        note={r.bac > 0 ? `0% in about ${r.hoursLeft} hour${r.hoursLeft === 1 ? "" : "s"}` : undefined}
      />
      <p style={{ ...para, fontSize: 18, color: "var(--text-primary)" }}>
        BAC is around <strong style={{ color: "var(--success)" }}>{shown}%</strong>.
      </p>
      {r.bac > 0 && (
        <>
          <p style={para}>It will take around {r.hoursLeft} more hour{r.hoursLeft === 1 ? "" : "s"} to reach 0%.</p>
          <p style={para}>{r.behavior}</p>
          {r.chart && <BacChart past={r.past} future={r.future} />}
        </>
      )}
      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: "12px 0 0" }}>
        * The results are meant for educational purposes only and are not intended to replace the medical advice of doctors or health care
        providers. Please consult your health care provider regarding specific health conditions.
      </p>
    </>
  );
}

function DrinkRow({ kind, v, set }) {
  const d = DRINKS[kind];
  return (
    <tr>
      <td style={cell}>{d.label}</td>
      <td style={{ ...cell, width: 64 }}><TextField value={v[kind]} onChange={set(kind)} /></td>
      <td style={cell}><SelectField value={v[`${kind}Size`]} onChange={set(`${kind}Size`)} options={d.sizes} style={{ width: "100%", minWidth: 0 }} /></td>
      <td style={{ ...cell, width: 96 }}><SelectField value={v[`${kind}Abv`]} onChange={set(`${kind}Abv`)} options={abvOptions(kind)} style={{ width: "100%" }} /></td>
    </tr>
  );
}

export default function BacCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { weight: v.weight },
    (fill) => calculateBac({ ...v, ...engineTime(v), ...(fill.has("weight") ? { weight: weightExample(v.weightUnit) } : {}) }),
  ));
  const clear = () => {
    setV((prev) => ({ ...prev, weight: "", hours: "", minutes: "", beer: "", wine: "", liquor: "", other: "" }));
    req.clear(); setResult(null);
  };
  const changeTimeUnit = (unit) => setV((prev) => {
    const typed = prev.hours !== "" || prev.minutes !== "";
    const total = timeMinutes(prev.timeUnit, prev.hours, prev.minutes);
    const [a, b] = typed && Number.isFinite(total) ? timeBoxes(unit, total) : ["", ""];
    return { ...prev, timeUnit: unit, hours: a, minutes: b };
  });
  const changeWeightUnit = (unit) => setV((prev) => {
    const n = Number(prev.weight);
    const weight = prev.weight === "" || !Number.isFinite(n) ? prev.weight : String(Math.round(((n * KG[prev.weightUnit]) / KG[unit]) * (unit === "g" ? 1 : 10)) / (unit === "g" ? 1 : 10));
    return { ...prev, weightUnit: unit, weight };
  });

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 480 }}>
        <div className="card" style={{ padding: 18 }}>
          <fieldset style={{ ...rowStyle, border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ ...labelStyle, float: "left", padding: 0 }}>Gender</legend>
            <div style={{ display: "flex", gap: 18, marginBottom: -10 }}>
              <RadioOption checked={v.sex !== "female"} onChange={() => set("sex")("male")} label="Male" />
              <RadioOption checked={v.sex === "female"} onChange={() => set("sex")("female")} label="Female" />
            </div>
          </fieldset>
          <div style={rowStyle}>
            <span style={labelStyle}>Body Weight</span>
            <Req name="weight"><UnitMeasureField
              label="Body weight" units={WEIGHT_MENU} unit={v.weightUnit} onUnitChange={changeWeightUnit}
              values={[v.weight, ""]} placeholders={[weightExample(v.weightUnit), ""]} onChange={(_, text) => set("weight")(text)}
            /></Req>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Time Since First Drink</span>
            <Req name="time"><UnitMeasureField
              label="Time since first drink" units={TIME_UNITS} unit={v.timeUnit}
              onUnitChange={changeTimeUnit} values={[v.hours, v.minutes]} placeholders={TIME_PLACEHOLDERS[v.timeUnit]}
              onChange={(i, text) => set(i ? "minutes" : "hours")(text)}
            /></Req>
          </div>

          <div style={sectionBar}>Amount of Alcohol Consumed</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ textAlign: "left", fontWeight: 400 }}>
                  <th style={{ ...cell, fontWeight: 400 }}>Type</th><th style={{ ...cell, fontWeight: 400 }}>Amount</th>
                  <th style={{ ...cell, fontWeight: 400, textAlign: "center" }}>Size</th><th style={{ ...cell, fontWeight: 400, textAlign: "center" }}>ABV</th>
                </tr>
              </thead>
              <tbody>
                <DrinkRow kind="beer" v={v} set={set} />
                <DrinkRow kind="wine" v={v} set={set} />
                <DrinkRow kind="liquor" v={v} set={set} />
                <tr>
                  <td style={cell}>Other</td>
                  <td style={cell}><TextField value={v.other} onChange={set("other")} /></td>
                  <td style={cell}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ width: 64, flex: "0 0 64px" }}><TextField value={v.otherSize} onChange={set("otherSize")} /></div>
                      <SelectField value={v.otherUnit} onChange={set("otherUnit")} options={OTHER_UNITS} style={{ flex: 1, minWidth: 0 }} />
                    </div>
                  </td>
                  <td style={cell}>
                    <div style={{ position: "relative" }}>
                      <TextField value={v.otherAbv} onChange={set("otherAbv")} style={{ paddingRight: 22 }} />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--text-muted)", pointerEvents: "none" }}>%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}><ButtonRow onCalculate={calculate} onClear={clear} /></div>
        </div>
      </div>

      <div className="card" style={{ flex: "1 1 400px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={resultBanner}>Result</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">
          <ResultBody result={result} />
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
