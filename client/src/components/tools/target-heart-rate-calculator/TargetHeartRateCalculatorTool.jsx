import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import { RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import {
  calculateTargetHeartRate, TARGET_HR_DEFAULTS, MHR_FORMULAS, INTENSITY_SCALES,
} from "../../../utils/targetHeartRateCalculatorEngine";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const labelText = { fontSize: 13.5, color: "var(--text-primary)", fontWeight: 400 };
const subHead = { fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, width: "100%" };
// The reference's zone colours (light to red); text stays dark on them in both themes.
const ZONE_COLORS = ["#ffff99", "#ffcc00", "#ff9900", "#ff6600", "#ff3b3b"];
const zoneCell = (i) => ({ background: ZONE_COLORS[i], color: "#1a1a2e", textAlign: "center" });
// The reference's RPE row colours: the "no exertion" row stays plain, then yellow → red.
const RPE_COLORS = [null, "#ffff99", "#f9de72", "#ffcc00", "#ffaa00", "#ff8800", "#ff6600", "#ff4400", "#ff2200", "#ff0000"];
const rpeCell = (i, align) => (RPE_COLORS[i] ? { background: RPE_COLORS[i], color: "#1a1a2e", textAlign: align } : { textAlign: align });
const MHR_HINT = "The maximum heart rate (MHR) is the highest theoretical number of beats per minute (bpm) the heart can reach through intense exercise. It can be measured through a cardiac stress test or estimated based on age.";
const RHR_HINT = "The resting heart rate (RHR) is the number of times your heart beats per minute (bpm) while you are at rest. It is typically measured when you are calm, relaxed, and not engaging in any physical activity.";

const D = TARGET_HR_DEFAULTS;
const EMPTY = { ...D, age: "", mhr: "", rhr: "" };

/** A circled "?" (like the field hints) that scrolls to an explanation further down this page. */
function HelpJump({ target, label }) {
  const jump = (e) => {
    e.preventDefault();
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <a
      href={`#${target}`} onClick={jump} title={label} aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", verticalAlign: "middle", marginLeft: 5,
        width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--text-muted)",
        fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", cursor: "pointer",
      }}
    >
      ?
    </a>
  );
}

function BpmField({ value, onChange, placeholder, width = 120 }) {
  return (
    <div style={{ position: "relative", width }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 36 }} />
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--text-muted)", pointerEvents: "none" }}>bpm</span>
    </div>
  );
}

const vo2 = (name) => (name === "VO2 Max" ? <>VO<sub>2</sub> Max</> : name);

function ResultBody({ result }) {
  if (!result) return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your age or tested maximum heart rate, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const r = result;
  return (
    <>
      {r.kind === "karvonen" ? (
        <HighlightSummary label="Target heart rate (aerobic exercise)" value={`${r.summary.low} – ${r.summary.high}`} unit="bpm" color="#ea580c" badge="50 – 85% of HR reserve" note={`Max heart rate: ${r.mhr} bpm`} />
      ) : (
        <HighlightSummary label="Maximum heart rate" value={r.mhr} unit="bpm" color="#ea580c" badge={r.kind === "mhr" ? "% of max heart rate" : r.kind === "borg" ? "Borg RPE scale" : "Borg CR10 scale"} note={r.rhr !== undefined ? `Resting heart rate: ${r.rhr} bpm` : "No resting heart rate entered"} />
      )}

      {r.kind === "karvonen" && (
        <>
          <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 8px" }}>
            Target heart rate during aerobic exercise: <strong>{r.summary.low} to {r.summary.high} bpm</strong> (50 - 85% of heart rate reserve).
          </p>
          <table className="data-table data-table--framed data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Exercise Intensity</th><th>Heart Rate Reserve</th><th>Target Heart Rate (bpm)</th></tr></thead>
            <tbody>
              {r.rows.map((z, i) => (
                <tr key={z.name}>
                  <td style={{ ...zoneCell(i), textAlign: "left" }}>{z.name === "VO2 Max" ? <>VO<sub>2</sub> Max (maximum)</> : z.name}</td>
                  <td style={zoneCell(i)}>{z.from} - {z.to}%</td>
                  <td style={zoneCell(i)}>{z.low} - {z.high}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {r.kind === "mhr" && (
        <table className="data-table data-table--framed data-table-head" style={tableStyle}>
          <thead><tr><th style={{ textAlign: "left" }}>Intensity</th><th>Target Heart Rate (bpm)</th></tr></thead>
          <tbody>
            {r.rows.map((z, i) => (
              <tr key={z.name}>
                <td style={{ ...zoneCell(i), textAlign: "left" }}><strong>{vo2(z.name)}</strong><br /><span style={{ fontSize: 12 }}>{z.use}</span></td>
                <td style={zoneCell(i)}>{z.low} - {z.high} ({z.from} - {z.to}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(r.kind === "borg" || r.kind === "cr10") && (
        <table className="data-table data-table--framed data-table-head" style={tableStyle}>
          <thead><tr><th style={{ textAlign: "left" }}>Intensity</th><th>{r.kind === "borg" ? "RPE Scale" : "RPE CR10 Scale"}</th><th>Target Heart Rate (bpm)</th></tr></thead>
          <tbody>
            {r.rows.map((x, i) => (
              <tr key={x.rpe}>
                <td style={rpeCell(i, "left")}>{x.name}</td>
                <td style={rpeCell(i, "center")}>{x.rpe}</td>
                <td style={rpeCell(i, "center")}><strong>{x.hr}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {r.kind === "mhr" && (
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
          Enter your resting heart rate for zones based on heart rate reserve (the Karvonen method) or the Borg scales.
        </p>
      )}
    </>
  );
}

export default function TargetHeartRateCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const test = v.mode === "test";

  const req = useRequiredFields();
  // The resting heart rate is optional, so only age / tested MHR can be flagged.
  const evaluate = (values) => req.evaluate(
    values.mode === "test" ? { mhr: values.mhr } : { age: values.age },
    (fill) => calculateTargetHeartRate({ ...values, age: fill.has("age") ? D.age : values.age, mhr: fill.has("mhr") ? "190" : values.mhr }),
  );
  const calculate = () => setResult(evaluate(v));
  // Mode and settings recalculate once there is a result.
  const choose = (key, value) => {
    const next = { ...v, [key]: value };
    setV(next);
    if (result) setResult(evaluate(next));
  };
  const clear = () => { setV((prev) => ({ ...prev, age: "", mhr: "", rhr: "" })); req.clear(); setResult(null); };

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 18 }}>
        <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px" }}>
          <legend style={{ marginBottom: 6 }}><FieldLabel hint={MHR_HINT}><span style={labelText}>Max Heart Rate</span></FieldLabel></legend>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <RadioOption checked={!test} onChange={() => choose("mode", "age")} label="Estimate from age" />
            <RadioOption checked={test} onChange={() => choose("mode", "test")} label="Test result" />
          </div>
          {!test ? (
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 24 }}>
              <span style={labelText}>Age</span>
              <div style={{ width: 120 }}><Req name="age"><TextField value={v.age} onChange={set("age")} placeholder={D.age} /></Req></div>
            </label>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 24, flexWrap: "wrap" }}>
              <span style={labelText}>Tested Max Heart Rate</span>
              <Req name="mhr"><BpmField value={v.mhr} onChange={set("mhr")} placeholder="190" /></Req>
            </label>
          )}
        </fieldset>

        <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 6px", flexWrap: "wrap" }}>
          <FieldLabel hint={RHR_HINT}><span style={labelText}>Resting Heart Rate</span></FieldLabel>
          <BpmField value={v.rhr} onChange={set("rhr")} placeholder={D.rhr} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>(optional)</span>
        </label>

        <div style={{ textAlign: "center", margin: "10px 0 12px" }}>
          <button
            type="button" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            {showSettings ? "− Settings" : "+ Settings"}
          </button>
        </div>
        {showSettings && (
          <div style={{ marginBottom: 12 }}>
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px" }}>
              <legend style={subHead}>
                Max heart rate estimation formula:<HelpJump target="mhr-formulas" label="About the maximum heart rate formulas" />
              </legend>
              <div style={{ paddingLeft: 12 }}>
                {MHR_FORMULAS.map((f) => <RadioOption key={f.value} checked={v.formula === f.value} onChange={() => choose("formula", f.value)} label={f.label} />)}
              </div>
            </fieldset>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={subHead}>
                Activity intensity scale:<HelpJump target="intensity-methods" label="About the activity intensity scales" />
              </legend>
              <div style={{ paddingLeft: 12 }}>
                {INTENSITY_SCALES.map((s) => <RadioOption key={s.value} checked={v.scale === s.value} onChange={() => choose("scale", s.value)} label={s.label} />)}
              </div>
            </fieldset>
          </div>
        )}

        <ButtonRow onCalculate={calculate} onClear={clear} />
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
