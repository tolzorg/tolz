import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import ResistorDrawing from "./ResistorDrawing";
import {
  COLORS, BAND_COLORS, BAND_COUNTS, DEFAULT_BANDS, LENGTH_UNITS, DIAMETER_UNITS, MATERIALS,
  resistorFromColors, parallelResistance, seriesResistance, conductorResistance,
} from "../../../utils/resistorCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.01em" };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13 };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 };
const tableStyle = { borderCollapse: "collapse", fontSize: 12.5, color: "var(--text-primary)", width: "100%" };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--text-primary)" };
const byValue = Object.fromEntries(COLORS.map((c) => [c.value, c]));
const opts = (list) => list.map((o) => ({ value: o.value, label: o.label }));

/** Two-column block: inputs on the left, result card on the right (as the other calculators). */
function Block({ id, title, intro, inputs, result }) {
  return (
    <section id={id} aria-label={title} style={{ display: "flex", flexDirection: "column", gap: 10, scrollMarginTop: 90 }}>
      <div>
        <h2 style={sectionTitle}>{title}</h2>
        <p style={{ ...para, margin: 0 }}>{intro}</p>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 520, padding: 18 }}>{inputs}</div>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{result}</div>
        </div>
      </div>
    </section>
  );
}

/** One band's colors as radio "chips" (swatch + name), like the reference's radio rows. */
function BandPicker({ legend, name, colors, value, onChange }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
      <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>{legend}</FieldLabel></legend>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {colors.map((c) => {
          const col = byValue[c];
          const on = value === c;
          return (
            <label
              key={c}
              style={{
                position: "relative", display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px 4px 5px", borderRadius: 999, cursor: "pointer", fontSize: 12.5,
                border: on ? "2px solid var(--accent)" : "1px solid var(--border)", background: on ? "var(--accent-light)" : "var(--bg-white)",
                color: "var(--text-primary)", fontWeight: on ? 700 : 500,
              }}
            >
              <input type="radio" name={name} value={c} checked={on} onChange={() => onChange(c)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
              <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", background: col.hex, border: "1px solid rgba(0,0,0,0.25)" }} />
              {col.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ListArea({ value, onChange, placeholder, label }) {
  const invalid = useRequiredState(value);
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)} rows={3} aria-label={label} {...requiredInputProps(invalid, placeholder)}
      style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
    />
  );
}

function ColorChart() {
  const tol = (c) => (c.tol ? `±${c.tol[0]}% (${c.tol[1]})` : "");
  const mult = (c) => ({ "-2": "×0.01", "-1": "×0.1", 0: "×1", 1: "×10", 2: "×100", 3: "×1K", 4: "×10K", 5: "×100K", 6: "×1M", 7: "×10M", 8: "×100M", 9: "×1G" }[c.mult]);
  return (
    <details style={{ marginTop: 4 }}>
      <summary style={summary}>Resistor color code chart</summary>
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>Color</th><th>Significant figures</th><th>Multiplier</th><th>Tolerance</th><th>Temp. coefficient</th></tr></thead>
          <tbody>
            {COLORS.map((c) => (
              <tr key={c.value}>
                <td style={{ whiteSpace: "nowrap" }}>
                  <span aria-hidden="true" style={{ display: "inline-block", width: 12, height: 12, marginRight: 6, verticalAlign: "-1px", background: c.hex, border: "1px solid rgba(0,0,0,0.25)" }} />
                  {c.label}
                </td>
                <td style={{ textAlign: "center" }}>{c.digit ?? ""}</td>
                <td style={{ textAlign: "center" }}>{mult(c)}</td>
                <td style={{ textAlign: "center" }}>{tol(c)}</td>
                <td style={{ textAlign: "center" }}>{c.tc ? `${c.tc[0]} ppm/K (${c.tc[1]})` : ""}</td>
              </tr>
            ))}
            <tr><td>None</td><td /><td /><td style={{ textAlign: "center" }}>±20% (M)</td><td /></tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}

function ColorCodeCalculator() {
  const [s, setS] = useState({ bands: 4, ...DEFAULT_BANDS });
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const preview = resistorFromColors(s);
  const picker = (legend, key, list) => (
    <BandPicker legend={legend} name={`resistor-${key}`} colors={list} value={s[key]} onChange={(c) => set({ [key]: c })} />
  );
  return (
    <Block
      id="color-code" title="Resistor color code calculator"
      intro="Find the ohm value and tolerance of a resistor from its color bands."
      inputs={(
        <>
          <ResistorDrawing colors={preview.colors} label={`Resistor with ${s.bands} bands: ${preview.colors.join(", ")}`} />
          <label style={{ ...fieldWrap, marginTop: 10 }}>
            <FieldLabel>Number of bands</FieldLabel>
            <SelectField value={String(s.bands)} onChange={(v) => set({ bands: Number(v) })} options={BAND_COUNTS.map((n) => ({ value: String(n), label: `${n} Band` }))} />
          </label>
          {picker("1st band color", "band1", BAND_COLORS.digit)}
          {picker("2nd band color", "band2", BAND_COLORS.digit)}
          {s.bands >= 5 && picker("3rd band color", "band3", BAND_COLORS.digit)}
          {picker("Multiplier color", "multiplier", BAND_COLORS.multiplier)}
          {s.bands >= 4 && picker("Tolerance color", "tolerance", BAND_COLORS.tolerance)}
          {s.bands === 6 && picker("Temperature coefficient color", "tc", BAND_COLORS.tc)}
          <ButtonRow onCalculate={() => setResult(resistorFromColors(s))} onClear={() => { setS({ bands: 4, ...DEFAULT_BANDS }); setResult(null); }} />
        </>
      )}
      result={result ? (
        <>
          <HighlightSummary label="Resistance" value={result.value} unit={result.unit} color="var(--accent)" note={`±${result.tolerance[0]}% (${result.tolerance[1]})`} />
          <ResistorDrawing colors={result.colors} label={`Bands: ${result.colors.join(", ")}`} />
          <StatList>
            <StatRow label="Value">{result.text}</StatRow>
            <StatRow label="Tolerance">±{result.tolerance[0]}% ({result.tolerance[1]})</StatRow>
            <StatRow label="Range" tone="var(--success)">{result.min} – {result.max}</StatRow>
            {result.tc && <StatRow label="Temperature coefficient">{result.tc[0]} ppm/K ({result.tc[1]})</StatRow>}
          </StatList>
          <div style={{ marginTop: 12 }}><ColorChart /></div>
        </>
      ) : (
        <>
          <p style={{ ...muted, marginBottom: 12 }}>Pick the color of each band, then click Calculate.</p>
          <ColorChart />
        </>
      )}
    />
  );
}

function ListCalculator({ id, title, intro, kind, fn }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const req = useRequiredFields();
  const run = (t) => {
    if (t.trim() === "") { req.flag(["list"]); return null; }
    req.flag([]);
    return fn(t);
  };
  return (
    <Block
      id={id} title={title} intro={intro}
      inputs={(
        <>
          <label style={fieldWrap}>
            <FieldLabel>Resistances (Ω), separated by commas</FieldLabel>
            <Req name="list" flagged={req.flagged}>
              <ListArea value={text} label={`${title}: resistances`} placeholder="10,2,38,23,38,23,21" onChange={setText} />
            </Req>
          </label>
          <ButtonRow onCalculate={() => setResult(run(text))} onClear={() => { setText(""); setResult(null); req.clear(); }} />
        </>
      )}
      result={!result ? <p style={muted}>Enter at least two resistances, then click Calculate.</p>
        : result.errors ? <ErrorPanel messages={result.errors} />
          : (
            <>
              <HighlightSummary label={`Total resistance in ${kind}`} value={result.text} unit="Ω" color="var(--accent)" note={`${result.count} resistors`} />
              <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
                Total resistance in {kind} is <strong>{result.text}</strong>.
              </p>
            </>
          )}
    />
  );
}

const EMPTY_CONDUCTOR = () => ({ length: "", lengthUnit: "meter", diameter: "", diameterUnit: "centimeter", conductivity: "59600000", material: "59600000" });
function ConductorCalculator() {
  const [s, setS] = useState(EMPTY_CONDUCTOR);
  const [result, setResult] = useState(null);
  const req = useRequiredFields();
  const run = (state) => {
    const r = conductorResistance(state);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const set = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const field = (label, k, after, placeholder) => (
    <div style={fieldWrap}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
          <FieldLabel>{label}</FieldLabel>
          <Req name={k} flagged={req.flagged}><TextField value={s[k]} onChange={(v) => set({ [k]: v })} placeholder={placeholder} style={{ width: "100%" }} /></Req>
        </label>
        {after}
      </div>
    </div>
  );
  return (
    <Block
      id="conductor" title="Resistance of a conductor"
      intro="Calculate the resistance of a round conductor from its length, diameter and conductivity."
      inputs={(
        <>
          {field("Length", "length", <SelectField value={s.lengthUnit} onChange={(v) => set({ lengthUnit: v })} options={opts(LENGTH_UNITS)} style={small} />, "100")}
          {field("Diameter", "diameter", <SelectField value={s.diameterUnit} onChange={(v) => set({ diameterUnit: v })} options={opts(DIAMETER_UNITS)} style={small} />, "0.05")}
          {field("Conductivity", "conductivity", <span style={{ ...suffix, paddingBottom: 10 }}>S/m</span>)}
          <label style={fieldWrap}>
            <FieldLabel>Or select material</FieldLabel>
            <SelectField value={s.material} onChange={(v) => set({ material: v, conductivity: v })} options={opts(MATERIALS)} />
          </label>
          <ButtonRow onCalculate={() => setResult(run(s))} onClear={() => { setS(EMPTY_CONDUCTOR()); setResult(null); req.clear(); }} />
        </>
      )}
      result={!result ? <p style={muted}>Enter the length and diameter of the conductor, then click Calculate.</p>
        : result.errors ? <ErrorPanel messages={result.errors} />
          : (
            <>
              <HighlightSummary label="Resistance of the conductor" value={result.text} unit="Ω" color="var(--accent)" note="R = L / (A × σ)" />
              <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
                Total resistance of the conductor is <strong>{result.text} ohm (Ω)</strong>.
              </p>
              <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>The conductor is assumed to be round, with a cross-sectional area A = π (d/2)².</p>
            </>
          )}
    />
  );
}

export default function ResistorCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <p style={{ ...para, margin: 0 }}>
        Calculate the ohm value and tolerance of a resistor from its color code, the total resistance of resistors in parallel or in series,
        and the resistance of a conductor from its size and conductivity.
      </p>
      <ColorCodeCalculator />
      <ListCalculator
        id="parallel" title="Parallel resistor calculator" kind="parallel" fn={parallelResistance}
        intro="Enter all the resistance values in parallel, separated by commas, then click Calculate for the total resistance."
      />
      <ListCalculator
        id="series" title="Resistors in series calculator" kind="series" fn={seriesResistance}
        intro="Enter all the resistance values in series, separated by commas, then click Calculate for the total resistance."
      />
      <ConductorCalculator />
    </div>
  );
}
