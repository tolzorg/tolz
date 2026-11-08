import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import {
  FIELDS, FIELD_KEYS, CONTAINERS, calculateCbm, convertTexts, toSi, formatCount, containerVolumeM3,
} from "../../../utils/cbmCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const pair = { display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: 12 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const CONTAINER_OPTIONS = CONTAINERS.map((c) => ({ value: c.value, label: c.label }));

/** The boxes the user types in; CBM per box, total volume, total weight and volumetric weight are results only. */
const INPUT_KEYS = ["length", "width", "height", "weight", "quantity", "factor"];
const REQUIRED_KEYS = ["length", "width", "height", "quantity", "factor"]; // weight per box is optional

const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => {
  const fields = blankFields();
  fields.quantity.texts = ["1"];
  fields.factor.texts = ["5000"];
  return { fields, container: CONTAINERS[0].value };
};
const unitShort = (key, unit) => FIELDS[key].units.find((u) => u.value === unit)?.short ?? "";
const isBlank = (f) => f.texts.every((t) => String(t).trim() === "");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the carton&apos;s dimensions, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { container } = result; // the container the result was calculated for
  const c = CONTAINERS.find((x) => x.value === container);
  const has = (k) => result.si[k];
  const val = (k) => `${result.display[k][0]} ${unitShort(k, result.units[k])}`;
  return (
    <>
      <HighlightSummary
        label="Number of cartons" value={formatCount(result.cartons)} color={result.cartons > 0n ? "var(--success)" : "var(--error)"}
        note={`fit in a ${c.label.replace(" container", "")} (${containerVolumeM3(container)} m³)`}
      />
      <StatList>
        <StatRow label="CBM per box">{val("cbm")}</StatRow>
        {has("totalVolume") && <StatRow label="Total volume">{val("totalVolume")}</StatRow>}
        {has("totalWeight") && <StatRow label="Total weight">{val("totalWeight")}</StatRow>}
        {has("volWeight") && <StatRow label="Volumetric weight">{val("volWeight")}</StatRow>}
      </StatList>
      {!has("totalWeight") && <p style={{ ...muted, fontSize: 12.5, marginTop: 8 }}>Enter the weight per box to see the total weight.</p>}
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        The number of cartons is the container&apos;s internal volume divided by the CBM of one carton, rounded down. Real loads fit fewer
        because of carton orientation and packing gaps.
      </p>
    </>
  );
}

export default function CbmCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { fields } = s;

  const run = (state) => {
    const missing = REQUIRED_KEYS.filter((k) => isBlank(state.fields[k]));
    req.flag(missing);
    if (missing.length) return null;
    // Results come back in m³ for volumes and in the weight box's unit for weights.
    const units = { ...Object.fromEntries(FIELD_KEYS.map((k) => [k, FIELDS[k].unit])), totalWeight: state.fields.weight.unit, volWeight: state.fields.weight.unit };
    const input = Object.fromEntries(FIELD_KEYS.map((k) => [k, INPUT_KEYS.includes(k) ? state.fields[k] : { unit: units[k], texts: [""] }]));
    const r = calculateCbm(input, INPUT_KEYS, state.container);
    if (r.missing) { req.flag(r.missing); return null; }
    return r.errors ? r : { ...r, units, container: state.container };
  };
  const setTexts = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return { ...prev, fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts } } };
  });
  // A new unit keeps the quantity: the text is converted, and its exact value kept for the next calculation.
  const setUnit = (key) => (unit) => setS((prev) => {
    const f = prev.fields[key];
    const si = f.si && f.siTexts?.join("|") === f.texts.join("|") ? f.si : toSi(key, f.unit, f.texts);
    const texts = convertTexts(key, f.unit, unit, f.texts);
    return { ...prev, fields: { ...prev.fields, [key]: si ? { unit, texts, si, siTexts: texts } : { unit, texts } } };
  });
  const setContainer = (container) => setS((prev) => ({ ...prev, container })); // the result updates on Calculate only
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const measure = (key, help) => (
    <label style={fieldWrap} title={help}>
      <FieldLabel>{FIELDS[key].label}{key === "weight" ? " (optional)" : ""}</FieldLabel>
      <Req name={key} flagged={req.flagged}>
        <UnitMeasureField
          label={FIELDS[key].label} units={FIELDS[key].units} unit={fields[key].unit} onUnitChange={setUnit(key)}
          values={fields[key].texts} onChange={setTexts(key)}
        />
      </Req>
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Work out the volume (CBM) and weight of your shipment and how many cartons of this size fit in a standard shipping container.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Carton properties">
            <h3 style={cardTitle}>Carton properties</h3>
            {measure("length")}
            {measure("width")}
            {measure("height")}
            <div style={pair}>
              {measure("weight")}
              <label style={fieldWrap}>
                <FieldLabel>Quantity</FieldLabel>
                <Req name="quantity" flagged={req.flagged}>
                  <TextField value={fields.quantity.texts[0]} onChange={(t) => setTexts("quantity")(0, t)} />
                </Req>
              </label>
            </div>
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Shipping">
            <h3 style={cardTitle}>Shipping</h3>
            {measure("factor", "Length (cm) × width (cm) × height (cm) / 5000 (cm³/kg)")}
            <p style={{ ...muted, fontSize: 12.5, marginTop: -4, marginBottom: 12 }}>
              Volumetric weight = total volume / shipping factor, e.g. L (cm) × W (cm) × H (cm) / 5,000 (cm³/kg).
            </p>
            <label style={fieldWrap}>
              <FieldLabel>Container type</FieldLabel>
              <SelectField value={s.container} onChange={setContainer} options={CONTAINER_OPTIONS} />
            </label>
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
