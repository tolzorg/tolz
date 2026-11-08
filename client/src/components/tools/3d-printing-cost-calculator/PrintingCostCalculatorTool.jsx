import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import {
  MATERIALS, FIELDS, FIELD_KEYS, DEFAULT_TEXTS, calculatePrintingCost, convertBox, fromSi, money, omni,
} from "../../../utils/printing3dCostCalculatorEngine";
import { CURRENCIES } from "../../../utils/freightClassCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13 };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 };
const unitSelect = { width: "auto", padding: "3px 6px", fontSize: 12.5, marginLeft: 6 };
const WEIGHT_OPTIONS = FIELDS.weight.units.map((u) => ({ value: u.value, label: u.short }));

const MATERIAL_OPTIONS = MATERIALS.map((m) => ({ value: m.value, label: m.label }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));
const perOptions = (k) => FIELDS[k].per.map((u) => ({ value: u.value, label: u.short }));

const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, per: FIELDS[k].perUnit, texts: [DEFAULT_TEXTS[k] ?? ""] }]));
const EMPTY = () => ({ material: "ABS", fields: blankFields(), currency: "USD" });
/** The boxes the user types; filament weight, material cost, labor cost and final price are results only. */
const INPUT_KEYS = ["density", "diameter", "length", "price", "time", "rate", "markup"];
const MATERIAL_PAIR = ["length", "price"];
const LABOR_PAIR = ["time", "rate"];
const isBlank = (f) => f.texts.every((t) => String(t).trim() === "");

function ResultBody({ result, weightUnit, setWeightUnit }) {
  if (!result) return <p style={muted}>Enter the filament length and price, the printing time and the cost per hour, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { values: v, currency } = result; // the currency the result was calculated in
  const has = (k) => v[k] !== undefined;
  const cur = (x) => `${money(x)} ${currency}`;
  const main = has("total") ? ["total", "Final price"] : has("materialCost") ? ["materialCost", "Material cost"] : has("laborCost") ? ["laborCost", "Labor cost"] : null;
  const subtotal = has("materialCost") && has("laborCost") ? v.materialCost + v.laborCost : null;
  return (
    <>
      {main && <HighlightSummary label={main[1]} value={money(v[main[0]])} unit={currency} color="var(--success)" note={main[0] === "total" && has("markup") ? `incl. ${omni(v.markup * 100)}% markup` : undefined} />}
      <StatList>
        {has("materialCost") && <StatRow label="Material cost">{cur(v.materialCost)}</StatRow>}
        {has("laborCost") && <StatRow label="Labor cost">{cur(v.laborCost)}</StatRow>}
        {subtotal !== null && <StatRow label="Cost before markup">{cur(subtotal)}</StatRow>}
        {subtotal !== null && has("total") && <StatRow label="Markup (profit)">{cur(v.total - subtotal)}</StatRow>}
        {has("weight") && (
          <StatRow label="Filament weight">
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {fromSi("weight", { unit: weightUnit }, v.weight)[0]}
              <SelectField value={weightUnit} onChange={setWeightUnit} options={WEIGHT_OPTIONS} style={unitSelect} />
            </span>
          </StatRow>
        )}
      </StatList>
      {!has("total") && (
        <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
          Fill in both the material and the labor boxes for the final price.
        </p>
      )}
    </>
  );
}

export default function PrintingCostCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const [weightUnit, setWeightUnit] = useState("g"); // display unit of the filament weight in the result
  const req = useRequiredFields();
  const { fields, material, currency } = s;
  const mat = MATERIALS.find((m) => m.value === material);

  const run = (state) => {
    // The material pair and the labor pair are each all-or-nothing, and at least one is needed.
    const blankIn = (keys) => keys.filter((k) => isBlank(state.fields[k]));
    const partly = (keys) => { const b = blankIn(keys); return b.length < keys.length ? b : []; };
    const custom = MATERIALS.find((m) => m.value === state.material)?.density === null;
    let missing = [...partly(MATERIAL_PAIR), ...partly(LABOR_PAIR), ...blankIn(["diameter", "markup", ...(custom ? ["density"] : [])])];
    if (blankIn(MATERIAL_PAIR).length === 2 && blankIn(LABOR_PAIR).length === 2) missing = [...missing, ...MATERIAL_PAIR, ...LABOR_PAIR];
    req.flag(missing);
    if (missing.length) return null;
    // Result boxes have no input, so they are always calculated.
    const input = Object.fromEntries(FIELD_KEYS.map((k) => [k, INPUT_KEYS.includes(k) ? state.fields[k] : { ...state.fields[k], texts: state.fields[k].texts.map(() => "") }]));
    const r = calculatePrintingCost({ material: state.material, fields: input, order: INPUT_KEYS });
    if (r.missing) { req.flag(r.missing); return null; }
    return r.errors ? r : { ...r, currency: state.currency };
  };
  const setText = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return {
      ...prev,
      fields: { ...prev.fields, [key]: { ...prev.fields[key], texts } },
    };
  });
  const convert = (key, patch) => setS((prev) => ({ ...prev, fields: { ...prev.fields, [key]: convertBox(key, prev.fields[key], patch) } }));
  const setMaterial = (value) => setS((prev) => ({ ...prev, material: value })); // the result updates on Calculate only
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const unitField = (k, extra = {}) => (
    <label key={k} style={fieldWrap}>
      <FieldLabel>{FIELDS[k].label}</FieldLabel>
      <Req name={k} flagged={req.flagged}>
        <UnitMeasureField
          label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={(unit) => convert(k, { unit })}
          values={fields[k].texts} onChange={setText(k)} {...extra}
        />
      </Req>
    </label>
  );
  // The label wraps only the text box, so the currency / unit selects stay out of its accessible name.
  const moneyField = (k) => (
    <div key={k} style={fieldWrap}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
          <FieldLabel>{FIELDS[k].label}</FieldLabel>
          <Req name={k} flagged={req.flagged}>
            <TextField value={fields[k].texts[0]} onChange={(t) => setText(k)(0, t)} style={{ width: "100%" }} />
          </Req>
        </label>
        {FIELDS[k].per ? (
          <>
            <SelectField value={currency} onChange={(c) => setS((p) => ({ ...p, currency: c }))} options={CURRENCY_OPTIONS} style={small} />
            <span style={{ ...suffix, paddingBottom: 10 }}>/</span>
            <SelectField value={fields[k].per} onChange={(per) => convert(k, { per })} options={perOptions(k)} style={small} />
          </>
        ) : <span style={{ ...suffix, paddingBottom: 10 }}>{currency}</span>}
      </div>
    </div>
  );
  const densityTexts = mat.density !== null ? fromSi("density", fields.density, mat.density * 1000) : fields.density.texts;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Work out what a 3D print costs: the filament (material) cost from its length, the labor cost from the printing time, and the
        final price with your markup.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Cost of material">
            <h3 style={cardTitle}>Cost of material</h3>
            <label style={fieldWrap}>
              <FieldLabel>Material type</FieldLabel>
              <SelectField value={material} onChange={setMaterial} options={MATERIAL_OPTIONS} />
            </label>
            <label style={fieldWrap}>
              <FieldLabel>Density</FieldLabel>
              <Req name="density" flagged={req.flagged}>
                <UnitMeasureField
                  label="Density" units={FIELDS.density.units} unit={fields.density.unit} onUnitChange={(unit) => convert("density", { unit })}
                  values={densityTexts} onChange={setText("density")} disabled={mat.density !== null}
                />
              </Req>
            </label>
            {mat.density !== null && <p style={{ ...muted, fontSize: 12, marginTop: -6, marginBottom: 12 }}>Choose <em>Custom material</em> to enter your own density.</p>}
            {unitField("diameter")}
            {unitField("length")}
            {moneyField("price")}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Labor cost">
            <h3 style={cardTitle}>Labor cost</h3>
            {unitField("time")}
            {moneyField("rate")}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Final price">
            <h3 style={cardTitle}>Final price</h3>
            {unitField("markup")}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} weightUnit={weightUnit} setWeightUnit={setWeightUnit} />
          </div>
        </div>
      </div>
    </div>
  );
}
