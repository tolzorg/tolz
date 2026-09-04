import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, ResultTable } from "./RetirementFormControls";
import { calculateSavingsPlan, formatCurrency } from "../../../utils/retirementCalculatorEngine";

const DEFAULTS = { currentAge: "35", retireAge: "67", amountNeeded: "600000", currentSavings: "30000", avgReturn: "6" };
const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 };

function Field({ label, value, onChange, placeholder, suffix }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ flex: "0 0 140px", display: "flex", alignItems: "center", gap: 4 }}>
        <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ textAlign: "right" }} />
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function SavingsPlanCard() {
  const [currentAge, setCurrentAge] = useState("");
  const [retireAge, setRetireAge] = useState("");
  const [amountNeeded, setAmountNeeded] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [avgReturn, setAvgReturn] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateSavingsPlan({
      currentAge: currentAge || DEFAULTS.currentAge,
      retireAge: retireAge || DEFAULTS.retireAge,
      amountNeeded: amountNeeded || DEFAULTS.amountNeeded,
      currentSavings: currentSavings || DEFAULTS.currentSavings,
      avgReturnPercent: avgReturn || DEFAULTS.avgReturn,
    }));
  }

  function clear() {
    setCurrentAge(""); setRetireAge(""); setAmountNeeded(""); setCurrentSavings(""); setAvgReturn("");
    setResult(null);
  }

  const retireAgeDisplay = retireAge || DEFAULTS.retireAge;

  return (
    <section aria-label="How can you save for retirement calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          How can you save for retirement?
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          This calculation presents potential savings plans based on desired savings at retirement.
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 20, flex: "1 1 320px", minWidth: 300 }}>
          <Field label="Your age now" value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} />
          <Field label="Your planned retirement age" value={retireAge} onChange={setRetireAge} placeholder={DEFAULTS.retireAge} />
          <DollarField label="Amount needed at the retirement age" value={amountNeeded} onChange={setAmountNeeded} placeholder={DEFAULTS.amountNeeded} fieldWidth={140} />
          <DollarField label="Your retirement savings now" value={currentSavings} onChange={setCurrentSavings} placeholder={DEFAULTS.currentSavings} fieldWidth={140} />
          <PercentField label="Average investment return" value={avgReturn} onChange={setAvgReturn} placeholder={DEFAULTS.avgReturn} fieldWidth={140} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your savings plan options.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    Following one of savings plans below will help you accumulate <strong>{formatCurrency(result.target, { decimals: 0 })}</strong> at the retirement age of {retireAgeDisplay}.
                  </p>

                  <ResultTable
                    title={`If you save every month until ${retireAgeDisplay}`}
                    rows={[
                      { label: "Amount to Save Every Month:", emphasize: true, cells: [formatCurrency(result.monthly.amount)] },
                      { label: "Total Principal:", cells: [formatCurrency(result.monthly.totalPrincipal, { decimals: 0 })] },
                      { label: "Total Interest:", cells: [formatCurrency(result.monthly.totalInterest, { decimals: 0 })] },
                    ]}
                  />
                  <ResultTable
                    title={`If you save every year until ${retireAgeDisplay}`}
                    rows={[
                      { label: "Amount to Save Every Year:", emphasize: true, cells: [formatCurrency(result.yearly.amount)] },
                      { label: "Total Principal:", cells: [formatCurrency(result.yearly.totalPrincipal, { decimals: 0 })] },
                      { label: "Total Interest:", cells: [formatCurrency(result.yearly.totalInterest, { decimals: 0 })] },
                    ]}
                  />
                  <ResultTable
                    title="If you have it now"
                    rows={[
                      { label: "Additional Amount Needed:", emphasize: true, cells: [formatCurrency(result.lump.additionalNow)] },
                      { label: "Total Principal:", cells: [formatCurrency(result.lump.totalPrincipal, { decimals: 0 })] },
                      { label: "Total Interest:", cells: [formatCurrency(result.lump.totalInterest, { decimals: 0 })] },
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
