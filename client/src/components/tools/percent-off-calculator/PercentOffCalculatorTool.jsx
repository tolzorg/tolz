import { useState } from "react";
import { FieldRow } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { calculatePercentOff, PERCENT_OFF_DEFAULTS } from "../../../utils/percentOffCalculatorEngine";

const D = PERCENT_OFF_DEFAULTS;
const EMPTY = { original: "", percent: "", final: "", saved: "", extra: "" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const First = () => <>1<sup>st</sup></>;

export default function PercentOffCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [stack, setStack] = useState(false);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  // Which boxes are blank decides what gets solved, so the example (original
  // price and percent off) is used only while every visible box is empty.
  const calculate = () => {
    const visible = ["original", "percent", "final", "saved", ...(stack ? ["extra"] : [])];
    setResult(calculatePercentOff({ ...(visible.every((k) => v[k] === "") ? D : v), stack }));
  };
  const clear = () => { setV(EMPTY); setStack(false); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter any two values, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 10px", overflowWrap: "anywhere" }}>{result.intro}</p>
        {result.rows.map((r) => (
          <p key={r.label} style={{ fontSize: 20, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.35, overflowWrap: "anywhere" }}>
            {r.first ? <><First /> percent off</> : r.label}: <strong style={{ color: "var(--success)" }}>{r.value}</strong>
          </p>
        ))}
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>Please provide two values below to calculate.</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 18 }}>
          <FieldRow label="Original price"><DollarField value={v.original} onChange={set("original")} placeholder={D.original} /></FieldRow>
          <FieldRow label={stack ? <><First /> Percent off</> : "Percent off"}>
            <PercentField value={v.percent} onChange={set("percent")} placeholder={D.percent} />
          </FieldRow>
          <FieldRow label="Final price"><DollarField value={v.final} onChange={set("final")} /></FieldRow>
          <FieldRow label="Saved"><DollarField value={v.saved} onChange={set("saved")} /></FieldRow>
          <fieldset style={{ border: "none", padding: 0, margin: "10px 0 4px" }}>
            <legend style={{ fontSize: 13.5, color: "var(--text-primary)", padding: 0, marginBottom: 6 }}>Has stackable additional discount?</legend>
            <div style={{ display: "flex", gap: 18 }}>
              <RadioOption checked={!stack} onChange={() => setStack(false)} label="No" />
              <RadioOption checked={stack} onChange={() => setStack(true)} label="Yes" />
            </div>
          </fieldset>
          {stack && (
            <FieldRow label="Additional discount"><PercentField value={v.extra} onChange={set("extra")} placeholder={D.extra} /></FieldRow>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
        </div>
      </div>
    </div>
  );
}
