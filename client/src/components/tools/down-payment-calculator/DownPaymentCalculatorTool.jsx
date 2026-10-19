import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import {
  calculateFromCash, calculateFromPrice, calculateDownPercent, DEFAULTS, OTHER_PERCENTS,
} from "../../../utils/downPaymentCalculatorEngine";
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { useRequiredFields, pickFields, withFill, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const sectionText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
// Compact cells so the six-column comparison fits a phone screen.
const cmpTd = { padding: "4px 5px", fontSize: 11.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.35, textAlign: "right", whiteSpace: "nowrap" };
// Dollar example for the closing-cost box when its unit is "$".
const CLOSING_DOLLAR_EXAMPLE = "15000";

const FORMS = {
  cash: {
    title: "Use the Upfront Cash Available",
    intro: "If the amount of upfront cash available and down payment percentages are known, use the calculator below to calculate an estimate for an affordable home price.",
    fields: [["cash", "Upfront Cash Available", "dollar"], ["downPercent", "Down Payment", "percent"]],
    calculate: calculateFromCash,
  },
  price: {
    title: "Use the Home Price",
    intro: "If the home price and down payment percentages are known, use the calculator below to calculate an estimate for an amount needed in cash available for upfront costs.",
    fields: [["price", "Home Price", "dollar"], ["downPercent", "Down Payment", "percent"]],
    calculate: calculateFromPrice,
  },
  both: {
    title: "Use the Home Price and Upfront Cash Available",
    intro: "If the home price and amount of upfront cash available are known, use the calculator below to calculate an estimate for a down payment percentage.",
    fields: [["price", "Home Price", "dollar"], ["cash", "Upfront Cash Available", "dollar"]],
    calculate: calculateDownPercent,
  },
};

function ClosingCostsRow({ include, setInclude, value, onValue, unit, setUnit }) {
  const invalid = useRequiredState(value);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <label style={{ flex: "1 1 120px", minWidth: 0, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
        <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
        <FieldLabel>Include Closing Costs</FieldLabel>
      </label>
      <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", gap: 6, minWidth: 0 }}>
        <input
          type="text" inputMode="decimal" value={value} disabled={!include} aria-label="Closing costs"
          {...requiredInputProps(invalid, unit === "dollar" ? CLOSING_DOLLAR_EXAMPLE : "3")} onChange={(e) => onValue(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 0, opacity: include ? 1 : 0.55 }}
        />
        <select value={unit} disabled={!include} onChange={(e) => setUnit(e.target.value)} aria-label="Closing costs unit"
          style={{ ...inputStyle, width: 54, flexShrink: 0, cursor: include ? "pointer" : "not-allowed" }}>
          <option value="percent">%</option>
          <option value="dollar">$</option>
        </select>
      </div>
    </div>
  );
}

function OtherPercentsTable({ table }) {
  return (
    <div style={{ marginTop: 6 }}>
      <p style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" }}>
        Results for other possible down payment percentages
      </p>
      {/* Phones: one small table per percentage, so no value is pushed off-screen. */}
      <div className="mobile-only" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {OTHER_PERCENTS.map((p, i) => (
          <table key={p} className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
            <thead>
              <tr><th colSpan={2} style={{ ...cmpTd, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center" }}>{p === 3.5 ? "3.5% (FHA)" : `${p}%`} down</th></tr>
            </thead>
            <tbody>
              {table.map(([label, values]) => (
                <tr key={label}>
                  <th scope="row" style={{ ...cmpTd, fontWeight: 400, textAlign: "left", whiteSpace: "normal" }}>{label}</th>
                  <td style={cmpTd}>{values[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <div className="desktop-only" style={{ overflowX: "auto", maxWidth: 640 }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...cmpTd, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" }}>Down Payment Percentages</th>
              {OTHER_PERCENTS.map((p) => (
                <th key={p} style={{ ...cmpTd, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" }}>{p === 3.5 ? "3.5% (FHA)" : `${p}%`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map(([label, values]) => (
              <tr key={label}>
                <th scope="row" style={{ ...cmpTd, fontWeight: 400, whiteSpace: "normal" }}>{label}</th>
                {values.map((v, i) => <td key={i} style={cmpTd}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DownPaymentForm({ id, form, defaults }) {
  const keys = [...form.fields.map(([k]) => k), "closingCosts", "rate", "years"];
  const blank = () => Object.fromEntries(keys.map((k) => [k, ""]));
  const [v, setV] = useState(blank);
  const [includeClosing, setIncludeClosing] = useState(true);
  const [closingUnit, setClosingUnit] = useState("percent");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const req = useRequiredFields();
  const calculate = () => {
    const visible = keys.filter((k) => k !== "closingCosts" || includeClosing);
    const examples = { ...defaults, closingCosts: closingUnit === "dollar" ? CLOSING_DOLLAR_EXAMPLE : defaults.closingCosts };
    setResult(req.evaluate(pickFields(v, visible), (fill) => form.calculate({ ...withFill(v, examples, fill), includeClosing, closingUnit })));
  };
  const clear = () => { req.clear(); setV(blank()); setIncludeClosing(true); setClosingUnit("percent"); setResult(null); };

  const ok = result && !result.errors && !result.empty;
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} style={sectionTitle}>{form.title}</h2>
      <p style={sectionText}>{form.intro}</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          {form.fields.map(([key, label, kind]) => (
            <Row key={key} label={label}>
              {kind === "dollar"
                ? <Req name={key} flagged={req.flagged}><DollarField value={v[key]} onChange={set(key)} placeholder={defaults[key]} /></Req>
                : <Req name={key} flagged={req.flagged}><PercentField value={v[key]} onChange={set(key)} placeholder={defaults[key]} /></Req>}
            </Row>
          ))}
          <Req name="closingCosts" flagged={req.flagged}><ClosingCostsRow include={includeClosing} setInclude={setIncludeClosing} value={v.closingCosts} onValue={set("closingCosts")} unit={closingUnit} setUnit={setClosingUnit} /></Req>
          <Row label="Interest Rate"><Req name="rate" flagged={req.flagged}><PercentField value={v.rate} onChange={set("rate")} placeholder={defaults.rate} /></Req></Row>
          <Row label="Loan Term" suffix="years"><Req name="years" flagged={req.flagged}><TextField value={v.years} onChange={set("years")} placeholder={defaults.years} /></Req></Row>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>{ok ? result.title : "Result"}</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }} aria-live="polite">
            {!result && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the details, then click Calculate.</p>}
            {result?.errors && <ErrorPanel messages={result.errors} />}
            {result?.empty && <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>There is nothing to calculate for these values.</p>}
            {ok && result.message && <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>{result.message}</p>}
            {ok && result.rows && (
              <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", alignSelf: "center", maxWidth: "100%" }}>
                <tbody>
                  {result.rows.map(([label, value]) => (
                    <tr key={label}>
                      <th scope="row" style={{ ...td, textAlign: "right", fontWeight: 400, whiteSpace: "normal", background: "var(--bg-muted)" }}>{label}</th>
                      <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {ok && result.note && <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{result.note}</p>}
          </div>
        </div>
      </div>
      {ok && result.table && <OtherPercentsTable table={result.table} />}
    </section>
  );
}

export default function DownPaymentCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <p style={{ ...sectionText, margin: 0 }}>The three calculations below offer different ways to help calculate an estimated down payment.</p>
      <DownPaymentForm id="dp-cash" form={FORMS.cash} defaults={DEFAULTS.cash} />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <DownPaymentForm id="dp-price" form={FORMS.price} defaults={DEFAULTS.price} />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <DownPaymentForm id="dp-both" form={FORMS.both} defaults={DEFAULTS.both} />
    </div>
  );
}
