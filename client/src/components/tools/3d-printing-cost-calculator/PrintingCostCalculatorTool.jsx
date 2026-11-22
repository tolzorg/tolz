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
// Bold hint under each card title telling users which values the card needs.
const inputHint = { margin: "-6px 0 12px", fontSize: 13, fontWeight: 700, color: "var(--warning)" };
const solvedText = { color: "var(--accent)", fontWeight: 700 };
const WEIGHT_OPTIONS = FIELDS.weight.units.map((u) => ({ value: u.value, label: u.short }));

const MATERIAL_OPTIONS = MATERIALS.map((m) => ({ value: m.value, label: m.label }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));
const perOptions = (k) => FIELDS[k].per.map((u) => ({ value: u.value, label: u.short }));

// Every box, as on the reference: any one can be left blank and worked out from the others on Calculate.
// The prefilled diameter and markup count as typed (least recent).
const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, per: FIELDS[k].perUnit, texts: [DEFAULT_TEXTS[k] ?? ""] }]));
const EMPTY = () => ({ material: "ABS", fields: blankFields(), currency: "USD", order: Object.keys(DEFAULT_TEXTS), solved: [] });

function ResultBody({ result, weightUnit, setWeightUnit }) {
  if (!result) return <p style={muted}>Enter the filament length (or weight) and price, the printing time and the cost per hour, then click Calculate. Any box can be left blank to work it out.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { values: v, currency, solved } = result; // the currency the result was calculated in
  const has = (k) => v[k] !== undefined;
  const cur = (x) => `${money(x)} ${currency}`;
  const tone = (k) => (solved.includes(k) ? "var(--accent)" : undefined);
  const main = has("total") ? ["total", "Final price"] : has("materialCost") ? ["materialCost", "Material cost"] : has("laborCost") ? ["laborCost", "Labor cost"] : null;
  const subtotal = has("materialCost") && has("laborCost") ? v.materialCost + v.laborCost : null;
  // Inputs the calculator worked out (other than the costs) are listed too.
  const otherSolved = ["density", "diameter", "length", "price", "time", "rate", "markup"].filter((k) => solved.includes(k));
  return (
    <>
      {main && <HighlightSummary label={main[1]} value={money(v[main[0]])} unit={currency} color="var(--success)" note={main[0] === "total" && has("markup") ? `incl. ${omni(v.markup * 100)}% markup` : undefined} />}
      <StatList>
        {has("materialCost") && <StatRow label="Material cost" tone={tone("materialCost")}>{cur(v.materialCost)}</StatRow>}
        {has("laborCost") && <StatRow label="Labor cost" tone={tone("laborCost")}>{cur(v.laborCost)}</StatRow>}
        {subtotal !== null && <StatRow label="Cost before markup">{cur(subtotal)}</StatRow>}
        {subtotal !== null && has("total") && <StatRow label="Markup (profit)">{cur(v.total - subtotal)}</StatRow>}
        {has("weight") && (
          <StatRow label="Filament weight" tone={tone("weight")}>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {fromSi("weight", { unit: weightUnit }, v.weight)[0]}
              <SelectField value={weightUnit} onChange={setWeightUnit} options={WEIGHT_OPTIONS} style={unitSelect} />
            </span>
          </StatRow>
        )}
        {otherSolved.map((k) => (
          <StatRow key={k} label={FIELDS[k].label} tone="var(--accent)">
            {result.display[k].join(" ")}{" "}
            {FIELDS[k].money ? `${currency}${FIELDS[k].per ? ` / ${FIELDS[k].per.find((u) => u.value === result.boxes[k].per)?.short}` : ""}` : FIELDS[k].units.find((u) => u.value === result.boxes[k].unit)?.short}
          </StatRow>
        ))}
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        {has("total") ? "Values the calculator worked out are highlighted in blue." : "Fill in both the material and the labor boxes for the final price."}
      </p>
    </>
  );
}

export default function PrintingCostCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const [weightUnit, setWeightUnit] = useState("g"); // display unit of the filament weight in the result
  const req = useRequiredFields();
  const { fields, material, currency, solved } = s;
  const mat = MATERIALS.find((m) => m.value === material);

  const run = (state) => {
    // Boxes the calculator filled in last time are blanked, so only the user's values drive this calculation.
    const input = { ...state.fields };
    for (const k of state.solved) input[k] = { ...input[k], texts: input[k].texts.map(() => "") };
    const order = state.order.filter((k) => !state.solved.includes(k));
    const r = calculatePrintingCost({ material: state.material, fields: input, order });
    if (r.missing) {
      req.flag(r.missing);
      setS({ ...state, fields: input, solved: [] });
      return null;
    }
    req.flag([]);
    if (r.errors) { setS(state); return r; }
    const next = { ...input };
    for (const k of r.solved) next[k] = { ...input[k], texts: r.display[k] };
    setS({ ...state, fields: next, solved: r.solved });
    return { ...r, currency: state.currency, boxes: input };
  };
  const setText = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return {
      ...prev,
      fields: { ...prev.fields, [key]: { ...prev.fields[key], texts } },
      order: [...prev.order.filter((k) => k !== key), key],
      solved: prev.solved.filter((k) => k !== key), // typed over: it's the user's value now
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
          values={fields[k].texts} onChange={setText(k)} highlight={solved.includes(k)} {...extra}
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
            <TextField value={fields[k].texts[0]} onChange={(t) => setText(k)(0, t)} style={{ width: "100%", ...(solved.includes(k) ? solvedText : null) }} />
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
        Work out what a 3D print costs: the filament (material) cost from its length or weight, the labor cost from the printing time, and
        the final price with your markup. Any box can be left blank and worked out from the others.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Cost of material">
            <h3 style={cardTitle}>Cost of material</h3>
            <p style={inputHint}>Enter the price and the filament length or weight; any one value can be worked out from the others</p>
            <label style={fieldWrap}>
              <FieldLabel>Material type</FieldLabel>
              <SelectField value={material} onChange={setMaterial} options={MATERIAL_OPTIONS} />
            </label>
            <label style={fieldWrap}>
              <FieldLabel>Density</FieldLabel>
              <Req name="density" flagged={req.flagged}>
                <UnitMeasureField
                  label="Density" units={FIELDS.density.units} unit={fields.density.unit} onUnitChange={(unit) => convert("density", { unit })}
                  values={densityTexts} onChange={setText("density")} disabled={mat.density !== null} highlight={solved.includes("density")}
                />
              </Req>
            </label>
            {mat.density !== null && <p style={{ ...muted, fontSize: 12, marginTop: -6, marginBottom: 12 }}>Choose <em>Custom material</em> to enter your own density.</p>}
            {unitField("diameter")}
            {unitField("length")}
            {unitField("weight")}
            {moneyField("price")}
            {moneyField("materialCost")}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Labor cost">
            <h3 style={cardTitle}>Labor cost</h3>
            <p style={inputHint}>Any two values are enough to get the result</p>
            {unitField("time")}
            {moneyField("rate")}
            {moneyField("laborCost")}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Final price">
            <h3 style={cardTitle}>Final price</h3>
            <p style={inputHint}>Enter the markup to get the final price, or the final price to find the markup</p>
            {unitField("markup")}
            {moneyField("total")}
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
