import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { unitToSi, convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import { FIELDS, FIELD_KEYS, PALLET_TYPES, TOO_LARGE, calculatePallet, palletVolume, presetDisplay } from "../../../utils/palletCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const help = { ...muted, fontSize: 12.5, marginTop: -6, marginBottom: 12 };
const steps = { fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "12px 0 0", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--accent-light)" };
const TYPE_OPTIONS = PALLET_TYPES.map((t) => ({ value: t.value, label: t.label }));
const PALLET_VOLUME_UNIT = FIELDS.pVolume.units.find((u) => u.value === FIELDS.pVolume.unit)?.short ?? "";

const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => ({ type: "48x40", useWeight: false, fields: blankFields() });

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Your result will appear here after filling all the fields and clicking Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.tooLarge) return <ErrorPanel messages={[TOO_LARGE]} />;
  return (
    <>
      <HighlightSummary label="Max. no. of packages" value={result.boxes} color="var(--success)" note="on one pallet" />
      <StatList>
        <StatRow label="Pallet utilization" tone="var(--accent)">{result.packing.utilization}%</StatRow>
        <StatRow label="Layers">{result.layers}</StatRow>
        <StatRow label="Packages per layer">{result.perLayer}</StatRow>
        {result.volume && <StatRow label="Pallet volume">{result.volume[0]} {PALLET_VOLUME_UNIT}</StatRow>}
      </StatList>
      <div style={steps}>
        <strong>Arrangement</strong>: Starting from any corner on the pallet, place <strong>{result.arrangement.width}</strong> parallel to the
        pallet&apos;s width, and <strong>{result.arrangement.length}</strong> parallel to the pallet&apos;s length. Keep placing packages next to
        each other using this orientation until you run out of space. Repeat the process until you reach the maximum number of layers.
      </div>
    </>
  );
}

export default function PalletCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { type, useWeight, fields } = s;
  const custom = type === "custom";

  const run = (state) => {
    const r = calculatePallet(state);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    // The pallet volume (height × width × length) is a result only: it has no input box.
    return r.errors || r.tooLarge ? r : { ...r, volume: palletVolume(state.type, state.fields) };
  };
  const update = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const setTexts = (key) => (i, text) => setS((prev) => {
    const texts = [...prev.fields[key].texts];
    texts[i] = text;
    return { ...prev, fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts } } };
  });
  // A new unit keeps the quantity: the text is converted, and its exact value kept for the next calculation.
  const setUnit = (key) => (unit) => setS((prev) => {
    const f = prev.fields[key];
    const units = FIELDS[key].units;
    const si = f.si && f.siTexts?.join("|") === f.texts.join("|") ? f.si : unitToSi(units, f.unit, f.texts);
    const texts = convertUnitTexts(units, f.unit, unit, f.texts);
    return { ...prev, fields: { ...prev.fields, [key]: si ? { unit, texts, si, siTexts: texts } : { unit, texts } } };
  });
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const measure = (key) => (
    <label style={fieldWrap}>
      <FieldLabel>{FIELDS[key].label}</FieldLabel>
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
        Find the maximum number of packages that fit on a pallet and how to arrange them: choose the pallet size, the maximum load height
        (and, optionally, the weight limits) and the package dimensions.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Pallet dimensions">
            <h3 style={cardTitle}>Pallet Dimensions</h3>
            <label style={fieldWrap}>
              <FieldLabel>Pallet type</FieldLabel>
              <SelectField value={type} onChange={(v) => update({ type: v })} options={TYPE_OPTIONS} />
            </label>
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 4px" }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>Take weight into account?</FieldLabel></legend>
              <RadioOption checked={!useWeight} onChange={() => update({ useWeight: false })} label="No" />
              <RadioOption checked={useWeight} onChange={() => update({ useWeight: true })} label="Yes" />
            </fieldset>
            <p style={{ ...help, marginTop: 0 }}>Yes adds the pallet&apos;s maximum load weight and each package&apos;s weight to the calculation.</p>
            {custom ? (
              <>
                {measure("pWidth")}
                {measure("pLength")}
              </>
            ) : (
              <p style={help}>
                {presetDisplay(type, "pWidth", "cm")} cm × {presetDisplay(type, "pLength", "cm")} cm (width × length). Choose &quot;Custom size&quot;
                for other pallets.
              </p>
            )}
            {measure("pHeight")}
            <p style={help}>The maximum height that the load can reach, measured from the top of the pallet.</p>
            {useWeight && measure("pWeight")}
            {useWeight && <p style={help}>The maximum weight that the pallet can support.</p>}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Package dimensions">
            <h3 style={cardTitle}>Package dimensions</h3>
            {measure("bSide1")}
            {measure("bSide2")}
            {measure("bSide3")}
            {useWeight && measure("bWeight")}
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
