import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary } from "../calculator-ui/ResultHighlight";
import { calculatePte, TOEFL_TOO_LOW } from "../../../utils/pteScoreCalculatorEngine";
import { skillLevel } from "../../../utils/ieltsScoreCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const segmentText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "-4px 0 16px" };
const TOO_LOW = "var(--error)";

/** One result segment: a highlighted value in the segment's site colour (red when the score is too low), then its text. */
function Segment({ label, value, color, badge, note, children }) {
  return (
    <div>
      <HighlightSummary label={label} value={value ?? "Too low"} color={value ? color : TOO_LOW} badge={badge} note={note} />
      {children}
    </div>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter your overall PTE score, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const { university, cefr, ielts, toefl, toeflLevel } = result;
  const toeflValues = toefl.filter((t) => t !== TOEFL_TOO_LOW);
  const toeflTooLow = toefl.includes(TOEFL_TOO_LOW);
  return (
    <>
      <Segment label="University" value={university.level} color="var(--accent)" note={university.level ? "Highest course level" : undefined}>
        <p style={segmentText}>{university.text}</p>
      </Segment>
      <Segment label="CEFR equivalent" value={cefr.level} color="var(--success)">
        <p style={segmentText}>{cefr.text}</p>
      </Segment>
      <Segment label="IELTS equivalent" value={ielts.band} color="var(--cat-image)" badge={ielts.band ? skillLevel(Number(ielts.band)) : undefined}>
        <p style={segmentText}>{ielts.text}</p>
      </Segment>
      <Segment
        label="TOEFL equivalent" value={toeflValues.length ? toeflValues.join(" / ") : toeflTooLow ? null : "–"} color="var(--cat-ai)"
        badge={toeflLevel ? toeflLevel.name : undefined} note={toeflLevel ? `TOEFL ${toeflLevel.range}` : undefined}
      >
        {toeflTooLow && <p style={segmentText}>{TOEFL_TOO_LOW}</p>}
        {toeflLevel && <p style={segmentText}><strong>{toeflLevel.name}</strong> ({toeflLevel.range}): {toeflLevel.text}</p>}
      </Segment>
    </>
  );
}

export default function PteScoreCalculatorTool() {
  const [score, setScore] = useState("");
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const calculate = () => setResult(req.require({ score }) ? calculatePte(score) : null);
  const clear = () => { setScore(""); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Enter your overall Pearson Test of English (PTE) score to see which university courses it may qualify you for and its CEFR level,
        IELTS band and TOEFL score equivalents.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", minWidth: 260, maxWidth: 420 }}>
          <div className="card" style={{ padding: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
              <FieldLabel hint="Enter your overall PTE score, which ranges from 10 to 90 points.">PTE score</FieldLabel>
              <Req name="score" flagged={req.flagged}><TextField value={score} onChange={setScore} /></Req>
            </label>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 420px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px 2px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
