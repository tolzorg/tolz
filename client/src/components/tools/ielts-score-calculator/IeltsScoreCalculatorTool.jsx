import { useState } from "react";
import { FieldLabel, TextField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  COMPONENTS, AVERAGE, TESTS, pickUnknown, calculateOverall, listeningBand, readingBand, skillLevel,
} from "../../../utils/ieltsScoreCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const titleStyle = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)",
  margin: "0 0 14px", paddingLeft: 10, borderLeft: "4px solid var(--accent)", lineHeight: 1.35,
};
const pair = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 12 };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
// A box filled in by a calculation is tinted, as on the reference.
const solvedStyle = { background: "var(--accent-light)", color: "var(--accent)", fontWeight: 700 };

/** Site colours by band: green from 7, blue from 5, amber from 3, red below; coral outside 0–9. */
const bandColor = (score) => {
  if (!(score >= 0 && score <= 9)) return "var(--accent-2)";
  if (score >= 7) return "var(--success)";
  if (score >= 5) return "var(--accent)";
  if (score >= 3) return "var(--warning)";
  return "var(--error)";
};

const EMPTY_SCORES = { listening: "", reading: "", speaking: "", writing: "", average: "" };

function Field({ name, label, hint, value, onChange, flagged, style }) {
  return (
    <label style={{ ...fieldWrap, marginBottom: 0 }}>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <Req name={name} flagged={flagged}><TextField value={value} onChange={onChange} style={style} /></Req>
    </label>
  );
}

function BandResult({ result, label, prompt }) {
  if (!result) return <p style={muted}>{prompt}</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return <HighlightSummary label={label} value={result.band} color={bandColor(result.band)} badge={skillLevel(result.band)} />;
}

function OverallResult({ result, showAverage }) {
  if (!result) return <p style={muted}>Enter your four band scores, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const level = skillLevel(result.overallValue);
  const solvedLabel = result.unknown === AVERAGE ? null : COMPONENTS.find((c) => c.key === result.unknown).label;
  return (
    <>
      <HighlightSummary
        label="IELTS score" value={result.overall} color={bandColor(result.overallValue)}
        badge={level} note={level ? "Overall band score" : undefined}
      />
      {(showAverage || solvedLabel) && (
        <StatList>
          {showAverage && <StatRow label="Average of the four scores">{result.average}</StatRow>}
          {solvedLabel && (
            <StatRow label={`${solvedLabel} score (calculated)`} tone={result.warning ? "var(--warning)" : "var(--accent)"}>{result.solved}</StatRow>
          )}
        </StatList>
      )}
      {result.warning && (
        <p role="alert" style={{ fontSize: 13, color: "var(--text-primary)", background: "var(--warning-light)", border: "1px solid var(--warning)", borderRadius: "var(--radius-sm)", padding: "8px 10px", margin: "10px 0 0" }}>
          ⚠ {result.warning}
        </p>
      )}
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>The average of each component, rounded to the nearest 0.5 (a .25 or .75 average rounds up).</p>
    </>
  );
}

function OverallCard() {
  const [scores, setScores] = useState(EMPTY_SCORES);
  const [showAverage, setShowAverage] = useState(false);
  const [solved, setSolved] = useState(null);       // box last filled in by a calculation
  const [editOrder, setEditOrder] = useState([]);   // boxes, least recently typed first
  const [result, setResult] = useState(null);       // no result until Calculate
  const req = useRequiredFields();

  const type = (key) => (text) => {
    setScores((prev) => ({ ...prev, [key]: text }));
    setEditOrder((prev) => [...prev.filter((k) => k !== key), key]);
    if (solved === key) setSolved(null);
  };
  const calculate = () => {
    const pick = pickUnknown({ values: scores, showAverage, solved, editOrder });
    if (pick.missing) { req.flag(pick.missing); setResult(null); return; }
    req.clear();
    const res = calculateOverall(scores, pick.unknown);
    setResult(res);
    if (!res.errors) {
      setScores((prev) => ({ ...prev, [pick.unknown]: res.solved }));
      setSolved(pick.unknown);
    }
  };
  const clear = () => { setScores(EMPTY_SCORES); setSolved(null); setEditOrder([]); setResult(null); req.clear(); };
  const field = (key, label, hint) => (
    <Field
      name={key} label={label} hint={hint} value={scores[key]} onChange={type(key)} flagged={req.flagged}
      style={solved === key && scores[key] !== "" ? solvedStyle : undefined}
    />
  );

  return (
    <section className="card" style={{ padding: 18 }} aria-labelledby="ielts-overall-title">
      <h2 id="ielts-overall-title" style={titleStyle}>Find IELTS score from the scores for each component</h2>
      <div style={pair}>{field("listening", "Listening")}{field("reading", "Reading")}</div>
      <div style={pair}>{field("speaking", "Speaking")}{field("writing", "Writing")}</div>
      {showAverage && <div style={fieldWrap}>{field(AVERAGE, "Average")}</div>}
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: showAverage ? 4 : 14, cursor: "pointer" }}>
        <input type="checkbox" checked={showAverage} onChange={(e) => setShowAverage(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
        <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Show average result</span>
      </label>
      {showAverage && <p style={{ ...muted, fontSize: 12.5, marginBottom: 14 }}>Fill in any four boxes and leave one empty to calculate it, e.g. the Writing score you need for a target average.</p>}
      <ButtonRow onCalculate={calculate} onClear={clear} />
      <div style={{ marginTop: 16 }} aria-live="polite"><OverallResult result={result} showAverage={showAverage} /></div>
    </section>
  );
}

function ListeningCard() {
  const [points, setPoints] = useState("");
  const [result, setResult] = useState(null);
  const req = useRequiredFields();
  const calculate = () => setResult(req.require({ points }) ? listeningBand(points) : null);
  const clear = () => { setPoints(""); setResult(null); req.clear(); };
  return (
    <section className="card" style={{ padding: 18 }} aria-labelledby="ielts-listening-title">
      <h2 id="ielts-listening-title" style={titleStyle}>Find listening score from points</h2>
      <div style={fieldWrap}>
        <Field name="points" label="Listening points" hint="Enter the number of correct answers from listening test." value={points} onChange={setPoints} flagged={req.flagged} />
      </div>
      <ButtonRow onCalculate={calculate} onClear={clear} />
      <div style={{ marginTop: 16 }} aria-live="polite">
        <BandResult result={result} label="Listening score" prompt="Enter your correct answers (0–40), then click Calculate." />
      </div>
    </section>
  );
}

function ReadingCard() {
  const [test, setTest] = useState("general");
  const [points, setPoints] = useState("");
  const [result, setResult] = useState(null);
  const req = useRequiredFields();
  const calculate = (t = test) => setResult(req.require({ points }) ? readingBand(points, t) : null);
  const changeTest = (t) => { setTest(t); if (result) calculate(t); };
  const clear = () => { setPoints(""); setResult(null); req.clear(); };
  return (
    <section className="card" style={{ padding: 18 }} aria-labelledby="ielts-reading-title">
      <h2 id="ielts-reading-title" style={titleStyle}>Find reading score from points</h2>
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
        <legend style={{ padding: 0, marginBottom: 8 }}><FieldLabel hint="Which IELTS test have you taken?">General or academic?</FieldLabel></legend>
        {TESTS.map((t) => <RadioOption key={t.value} checked={test === t.value} onChange={() => changeTest(t.value)} label={t.label} />)}
      </fieldset>
      <div style={fieldWrap}>
        <Field name="points" label="Reading points" hint="Enter the number of correct answers from reading test." value={points} onChange={setPoints} flagged={req.flagged} />
      </div>
      <ButtonRow onCalculate={() => calculate()} onClear={clear} />
      <div style={{ marginTop: 16 }} aria-live="polite">
        <BandResult result={result} label={`Reading score (${test === "academic" ? "Academic" : "General Training"})`} prompt="Enter your correct answers (0–40), then click Calculate." />
      </div>
    </section>
  );
}

export default function IeltsScoreCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Estimate your overall International English Language Testing System (IELTS) band score from your listening, reading, speaking and
        writing scores, or convert the number of correct answers in the listening and reading tests into band scores.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, alignItems: "start" }}>
        <OverallCard />
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <ListeningCard />
          <ReadingCard />
        </div>
      </div>
    </div>
  );
}
