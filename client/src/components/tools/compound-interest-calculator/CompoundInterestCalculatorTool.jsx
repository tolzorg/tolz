import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import {
  calculateCompoundInterest, COMPOUND_OPTIONS, DEFAULT_IN_COMPOUND, DEFAULT_OUT_COMPOUND, formatPercent,
} from "../../../utils/compoundInterestCalculatorEngine";

const DEFAULT_RATE = "6";

export default function CompoundInterestCalculatorTool() {
  const [rate, setRate] = useState("");
  const [inCompound, setInCompound] = useState(DEFAULT_IN_COMPOUND);
  const [outCompound, setOutCompound] = useState(DEFAULT_OUT_COMPOUND);
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateCompoundInterest({
      ratePercent: rate || DEFAULT_RATE,
      inCompound, outCompound,
    }));
  }

  function clear() {
    setRate(""); setInCompound(DEFAULT_IN_COMPOUND); setOutCompound(DEFAULT_OUT_COMPOUND);
    setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Result
        </div>
        <div style={{ padding: "18px 20px" }}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in the details and click <strong>Calculate</strong> to see the equivalent rate.
            </p>
          ) : (
            <p style={{ fontSize: 15.5, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}>
              {result.sentencePrefix}
              <span style={{ color: "var(--success)" }}>{formatPercent(result.outputRate)}</span>
              {result.sentenceSuffix}
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 140px", minWidth: 110 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textAlign: "center" }}>Input Interest</div>
            <div style={{ position: "relative" }}>
              <TextField value={rate} onChange={setRate} placeholder={DEFAULT_RATE} style={{ paddingRight: 24, textAlign: "center" }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
            </div>
          </div>

          <div style={{ flex: "1 1 170px", minWidth: 150 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textAlign: "center" }}>Compound</div>
            <SelectField value={inCompound} onChange={setInCompound} options={COMPOUND_OPTIONS} />
          </div>

          <div style={{ flexShrink: 0, fontSize: 22, fontWeight: 700, color: "var(--text-secondary)", padding: "0 4px 8px" }}>=</div>

          <div style={{ flex: "1 1 120px", minWidth: 100 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textAlign: "center" }}>Output Interest</div>
            <div style={{
              padding: "9px 11px", fontSize: 15, fontWeight: 700, textAlign: "center", color: "var(--success)",
              fontFamily: "var(--font-display)", background: "var(--bg-white)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            }}>
              {result ? formatPercent(result.outputRate) : "—"}
            </div>
          </div>

          <div style={{ flex: "1 1 170px", minWidth: 150 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textAlign: "center" }}>Compound</div>
            <SelectField value={outCompound} onChange={setOutCompound} options={COMPOUND_OPTIONS} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
          <button type="button" onClick={calculate} style={{ padding: "12px 28px", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
        </div>

        {result && result.footnotes.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
            {result.footnotes.map((note) => (
              <p key={note} style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{note}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
