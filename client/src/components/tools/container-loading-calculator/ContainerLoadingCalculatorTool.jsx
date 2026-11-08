import { useState } from "react";
import { FieldLabel } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { unitToSi, convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import {
  FIELDS, FIELD_KEYS, CONTAINER_TYPES, calculateContainerLoading, arrangementText, presetDisplay,
} from "../../../utils/containerLoadingCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const steps = { fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "12px 0 0", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--accent-light)" };
const TYPE_OPTIONS = CONTAINER_TYPES.map((t) => ({ value: t.value, label: t.label }));
const CONTAINER_KEYS = ["cntL", "cntW", "cntH"];
const PACKAGE_KEYS = ["pkgL", "pkgW", "pkgH"];
/** The boxes the user types in; the container and package volumes are results only. */
const INPUT_KEYS = [...CONTAINER_KEYS, ...PACKAGE_KEYS];

const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => ({ type: "std20", fields: blankFields() });
const isBlank = (f) => f.texts.every((t) => String(t).trim() === "");
const unitShort = (key) => FIELDS[key].units.find((u) => u.value === FIELDS[key].unit)?.short ?? "";

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose a container and enter the package&apos;s dimensions, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const a = arrangementText(result.packing);
  const one = result.packing.boxes === 1n;
  return (
    <>
      <HighlightSummary label="Packages that fit" value={result.boxes} color="var(--success)" note="of this size into the chosen container" />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
        You can fit up to <strong>{result.boxes}</strong> {one ? "package" : "packages"} of this size into the chosen container.
      </p>
      <StatList>
        <StatRow label="Container utilization" tone="var(--accent)">{result.packing.utilization}%</StatRow>
        <StatRow label="Number of layers">{result.layers}</StatRow>
        <StatRow label="Packages per layer">{result.perLayer}</StatRow>
        <StatRow label="Container's volume">{result.display.cntVol[0]} {unitShort("cntVol")}</StatRow>
        <StatRow label="Single package volume">{result.display.pkgVol[0]} {unitShort("pkgVol")}</StatRow>
      </StatList>
      <div style={steps}>
        <strong style={{ display: "block", marginBottom: 4 }}>Arrangement instructions:</strong>
        Starting from any corner of the container, place <strong>{a.width}</strong> parallel to the container&apos;s width, and{" "}
        <strong>{a.length}</strong> parallel to the container&apos;s length.
        <span style={{ display: "block", marginTop: 8 }}>
          Keep placing packages next to each other using this orientation until you run out of space. Repeat the process until you reach the
          maximum number of layers.
        </span>
      </div>
    </>
  );
}

export default function ContainerLoadingCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { fields, type } = s;
  const preset = type !== "custom";

  const run = (state) => {
    const needed = state.type === "custom" ? INPUT_KEYS : PACKAGE_KEYS;
    const missing = needed.filter((k) => isBlank(state.fields[k]));
    req.flag(missing);
    if (missing.length) return null;
    // Volumes are never typed: they come back in their default units (m³ for the container, cm³ for a package).
    const input = Object.fromEntries(FIELD_KEYS.map((k) => [k, INPUT_KEYS.includes(k) ? state.fields[k] : { unit: FIELDS[k].unit, texts: [""] }]));
    const r = calculateContainerLoading(state.type, input, INPUT_KEYS);
    if (r.missing) { req.flag(r.missing); return null; }
    return r;
  };
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
  // Picking a type shows its dimensions; "Custom" starts with empty, editable boxes (as on the reference).
  // The result updates on Calculate only.
  const setType = (value) => setS((prev) => {
    const fieldsNext = { ...prev.fields };
    for (const k of CONTAINER_KEYS) fieldsNext[k] = { unit: prev.fields[k].unit, texts: [""] };
    return { ...prev, type: value, fields: fieldsNext };
  });
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  const measure = (key) => {
    const isPresetBox = preset && CONTAINER_KEYS.includes(key);
    const values = isPresetBox ? presetDisplay(type, key, fields[key].unit) : fields[key].texts;
    return (
      <label style={fieldWrap}>
        <FieldLabel>{FIELDS[key].label}</FieldLabel>
        <Req name={key} flagged={req.flagged}>
          <UnitMeasureField
            label={FIELDS[key].label} units={FIELDS[key].units} unit={fields[key].unit} onUnitChange={setUnit(key)}
            values={values} onChange={setTexts(key)} disabled={isPresetBox}
          />
        </Req>
      </label>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find out how many boxes fit in a shipping container, how full it will be and how to arrange them: pick a container type (or enter
        your own dimensions) and the size of one package.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Container information">
            <h3 style={cardTitle}>Container information</h3>
            <label style={fieldWrap}>
              <FieldLabel>Container type</FieldLabel>
              <SelectField value={type} onChange={setType} options={TYPE_OPTIONS} />
            </label>
            {measure("cntL")}
            {measure("cntW")}
            {measure("cntH")}
            {preset && <p style={{ ...muted, fontSize: 12.5, marginTop: -4 }}>Choose &quot;Custom&quot; to enter your own container dimensions.</p>}
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Package information">
            <h3 style={cardTitle}>Package information</h3>
            {measure("pkgL")}
            {measure("pkgW")}
            {measure("pkgH")}
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
