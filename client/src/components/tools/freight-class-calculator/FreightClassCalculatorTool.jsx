import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import { FIELDS, SPEC_KEYS, FC_WEIGHT_UNITS, CURRENCIES, calculateFreightClass } from "../../../utils/freightClassCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13 };
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));
const RATE_UNIT_OPTIONS = FC_WEIGHT_UNITS.map((u) => ({ value: u.value, label: `/ ${u.short}` }));

const blankFields = () => Object.fromEntries(SPEC_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => ({
  fields: blankFields(), pallets: "1", rate: "", rateUnit: "kg", currency: "USD",
});
const blank = (t) => String(t).trim() === "";

/** Lighter freight (high class) costs more per pound: red from 200, amber from 100, green below. */
const classColor = (c) => (Number(c) >= 200 ? "var(--error)" : Number(c) >= 100 ? "var(--warning)" : "var(--success)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the pallet&apos;s dimensions and mass, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { currency } = result; // the currency the result was calculated in
  return (
    <>
      <HighlightSummary label="Freight class" value={result.freightClass} color={classColor(result.freightClass)} note="NMFC (US) standard" />
      <StatList>
        <StatRow label="Density">{result.densityLbFt3} lb/ft³</StatRow>
        <StatRow label="Density (metric)">{result.densityKgM3} kg/m³</StatRow>
        {result.cost && (
          <>
            <StatRow label="Number of pallets">{result.cost.pallets}</StatRow>
            <StatRow label="Freight rate">{result.cost.rate} {currency} / {result.rateUnitShort}</StatRow>
            <StatRow label="Freight cost" tone="var(--accent)">{result.cost.cost} {currency}</StatRow>
          </>
        )}
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        The denser your cargo, the lower its class, and higher classes are usually charged more per pound.
      </p>
    </>
  );
}

export default function FreightClassCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { fields } = s;

  const run = (state) => {
    // The freight cost is a result only (rate × mass × pallets): it has no input box. A typed rate needs the number of pallets.
    const r = calculateFreightClass({ ...state, cost: "", order: ["pallets", "rate"] });
    const missing = [...(r.missing || []), ...(!blank(state.rate) && blank(state.pallets) ? ["pallets"] : [])];
    req.flag(missing);
    if (missing.length) return null;
    if (r.errors) return r;
    const rateUnitShort = FC_WEIGHT_UNITS.find((u) => u.value === state.rateUnit)?.short ?? "";
    return { ...r, currency: state.currency, rateUnitShort };
  };
  const setText = (key) => (value) => setS((prev) => ({ ...prev, [key]: value }));
  const setTexts = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return { ...prev, fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts } } };
  });
  const setUnit = (key) => (unit) => setS((prev) => ({
    ...prev, fields: { ...prev.fields, [key]: { unit, texts: convertUnitTexts(FIELDS[key].units, prev.fields[key].unit, unit, prev.fields[key].texts) } },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Input the measurements of your shipment, and we&apos;ll calculate its freight class according to the American NMFC standard, plus the
        total freight cost if you know the rate.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Pallet specifications">
            <h3 style={cardTitle}>Pallet specifications</h3>
            {SPEC_KEYS.map((k) => (
              <label key={k} style={fieldWrap}>
                <FieldLabel>{FIELDS[k].label}</FieldLabel>
                <Req name={k} flagged={req.flagged}>
                  <UnitMeasureField
                    label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={setUnit(k)}
                    values={fields[k].texts} onChange={setTexts(k)}
                  />
                </Req>
              </label>
            ))}
          </section>

          <details className="card" style={{ padding: "14px 18px" }}>
            <summary style={summary}>Total freight cost</summary>
            <div style={{ marginTop: 12 }}>
              <label style={fieldWrap}>
                <FieldLabel>Number of pallets</FieldLabel>
                <Req name="pallets" flagged={req.flagged}><TextField value={s.pallets} onChange={setText("pallets")} /></Req>
              </label>
              <div style={fieldWrap}>
                <FieldLabel>Freight rate</FieldLabel>
                <div style={{ display: "flex", gap: 6 }}>
                  <TextField value={s.rate} onChange={setText("rate")} style={{ flex: 1, minWidth: 0 }} />
                  <SelectField value={s.currency} onChange={(v) => setS((p) => ({ ...p, currency: v }))} options={CURRENCY_OPTIONS} style={small} />
                  <SelectField value={s.rateUnit} onChange={(v) => setS((p) => ({ ...p, rateUnit: v }))} options={RATE_UNIT_OPTIONS} style={small} />
                </div>
              </div>
              <p style={{ ...muted, fontSize: 12.5 }}>
                Enter the rate to see the total freight cost (rate × mass × number of pallets) in the result. To convert
                between currencies, use the <Link to="/calculators/financial/currency-calculator" style={{ color: "var(--accent)" }}>currency calculator</Link>.
              </p>
            </div>
          </details>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Freight class</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}

