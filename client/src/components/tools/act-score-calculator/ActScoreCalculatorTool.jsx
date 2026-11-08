import { useState } from "react";
import { FieldLabel, SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { ACT_SECTIONS, rawOptions, calculateAct } from "../../../utils/actScoreCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 };

const OPTIONS = Object.fromEntries(ACT_SECTIONS.map((s) => [s.key, rawOptions(s).map((v) => ({ value: v, label: v }))]));
const EMPTY = Object.fromEntries(ACT_SECTIONS.map((s) => [s.key, ""]));

/** Site colours by score (composite or section): 30+ excellent (green), 24+ good (blue), 17+ average (amber), below red. */
const compositeColor = (c) => (c >= 30 ? "var(--success)" : c >= 24 ? "var(--accent)" : c >= 17 ? "var(--warning)" : "var(--error)");

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose your raw score for each section, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return (
    <>
      <HighlightSummary
        label="Composite ACT score" value={result.composite} unit="/ 36" color={compositeColor(result.composite)}
        badge={`${result.percentile} percentile`} note="Among ACT test takers"
      />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 4px" }}>
        A composite ACT score of <strong>{result.composite}</strong> places you in the <strong>{result.percentile}</strong> percentile.
      </p>
      {result.great && <p style={{ fontSize: 13.5, color: "var(--success)", fontWeight: 700, margin: "0 0 4px" }}>Congratulations, that&apos;s a great result!</p>}
      <StatList>
        {result.sections.map((s) => (
          <StatRow key={s.name} label={`Your ACT ${s.name} Section Score (raw ${s.raw})`} tone={compositeColor(s.scaled)}>{s.scaled}</StatRow>
        ))}
      </StatList>
    </>
  );
}

export default function ActScoreCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const calculate = () => setResult(req.require(v) ? calculateAct(v) : null);
  const clear = () => { setV(EMPTY); setResult(null); req.clear(); };

  return (
    <RequiredProvider flagged={req.flagged}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Choose the number of correct answers (raw score) for each section of the ACT to see your section scores, your composite ACT score
        and the percentile it places you in among ACT test takers.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 260, maxWidth: 460, padding: 18 }}>
          {ACT_SECTIONS.map((s) => (
            <label key={s.key} style={fieldWrap}>
              <FieldLabel hint={s.help}>{s.label} (0-{s.max})</FieldLabel>
              <Req name={s.key}><SelectField value={v[s.key]} onChange={set(s.key)} options={OPTIONS[s.key]} placeholder="Select" /></Req>
            </label>
          ))}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Composite ACT score</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
    </RequiredProvider>
  );
}
