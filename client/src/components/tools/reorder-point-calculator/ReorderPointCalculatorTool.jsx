import { useState } from "react";
import { FieldLabel } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import { FIELDS, FIELD_KEYS, calculateReorderPoint } from "../../../utils/reorderPointCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };

const blankFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, { unit: FIELDS[k].unit, texts: [""] }]));
const EMPTY = () => ({ fields: blankFields() });
/** The boxes the user types in; the reorder point is a result only. */
const INPUT_KEYS = FIELD_KEYS.filter((k) => k !== "reorderPoint");
const shortOf = (k, unit) => FIELDS[k].units.find((u) => u.value === unit)?.short ?? "";

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter your stock, lead time and unit sales, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const row = (k) => `${result.display[k][0]} ${shortOf(k, result.units[k])}`;
  return (
    <>
      <HighlightSummary label="Reorder point" value={result.reorderPoint} unit="items" color={result.warnings.length ? "var(--error)" : "var(--accent)"} />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
        You should reorder when you have exactly <strong>{result.reorderPoint}</strong> items in stock.
      </p>
      {result.warnings.map((w) => <p key={w} role="alert" style={notice}>⚠ {w}</p>)}
      <StatList>
        {INPUT_KEYS.map((k) => <StatRow key={k} label={FIELDS[k].label}>{row(k)}</StatRow>)}
      </StatList>
    </>
  );
}

export default function ReorderPointCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const { fields } = s;

  const run = (state) => {
    // The reorder point has no input box, so it is always the value calculated.
    const input = { ...state.fields, reorderPoint: { unit: FIELDS.reorderPoint.unit, texts: [""] } };
    const r = calculateReorderPoint(input, INPUT_KEYS);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    if (r.errors) return r;
    return { ...r, units: Object.fromEntries(FIELD_KEYS.map((k) => [k, state.fields[k].unit])) };
  };
  const setTexts = (key) => (i, text) => setS((prev) => ({
    ...prev,
    fields: { ...prev.fields, [key]: { unit: prev.fields[key].unit, texts: [text] } },
  }));
  const setUnit = (key) => (unit) => setS((prev) => ({
    ...prev, fields: { ...prev.fields, [key]: { unit, texts: convertUnitTexts(FIELDS[key].units, prev.fields[key].unit, unit, prev.fields[key].texts) } },
  }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Don&apos;t know when to reorder? Afraid of shortages and overstock? Find the stock level at which to order a new batch of items:
        enter your stock in days&apos; worth, the lead time and your sales.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Reorder point">
            {INPUT_KEYS.map((k) => (
              <div key={k} style={fieldWrap}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <FieldLabel>{FIELDS[k].label}</FieldLabel>
                  <Req name={k} flagged={req.flagged}>
                    <UnitMeasureField
                      label={FIELDS[k].label} units={FIELDS[k].units} unit={fields[k].unit} onUnitChange={setUnit(k)}
                      values={fields[k].texts} onChange={setTexts(k)}
                    />
                  </Req>
                </label>
                <p style={help}>{FIELDS[k].help}</p>
              </div>
            ))}
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
