import { useState } from "react";
import { FieldLabel, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, ResultTable, ValidationWarning } from "./RetirementFormControls";
import { calculateWithdrawal, validateRetirementAges, formatCurrency } from "../../../utils/retirementCalculatorEngine";

const DEFAULTS = {
  currentAge: "35", retireAge: "67", lifeExpectancy: "85", currentSavings: "30000",
  annualContribution: "0", monthlyContribution: "500", avgReturn: "6", inflation: "3",
};
const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 };

function Field({ label, value, onChange, placeholder, suffix }) {
  return (
    <div style={fieldRow}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ flex: "0 0 130px", display: "flex", alignItems: "center", gap: 4 }}>
        <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ textAlign: "right" }} />
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function WithdrawalCard() {
  const [currentAge, setCurrentAge] = useState("");
  const [retireAge, setRetireAge] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [annualContribution, setAnnualContribution] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [avgReturn, setAvgReturn] = useState("");
  const [inflation, setInflation] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      currentAge: currentAge || DEFAULTS.currentAge,
      retireAge: retireAge || DEFAULTS.retireAge,
      lifeExpectancy: lifeExpectancy || DEFAULTS.lifeExpectancy,
    };
    const validationError = validateRetirementAges(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateWithdrawal({
      ...inputs,
      currentSavings: currentSavings || DEFAULTS.currentSavings,
      annualContribution: annualContribution || DEFAULTS.annualContribution,
      monthlyContribution: monthlyContribution || DEFAULTS.monthlyContribution,
      avgReturnPercent: avgReturn || DEFAULTS.avgReturn,
      inflationPercent: inflation || DEFAULTS.inflation,
    }));
  }

  function clear() {
    setCurrentAge(""); setRetireAge(""); setLifeExpectancy(""); setCurrentSavings("");
    setAnnualContribution(""); setMonthlyContribution(""); setAvgReturn(""); setInflation("");
    setResult(null); setError(null);
  }

  const retireAgeDisplay = retireAge || DEFAULTS.retireAge;
  const lifeExpectancyDisplay = lifeExpectancy || DEFAULTS.lifeExpectancy;

  return (
    <section aria-label="How much can you withdraw after retirement calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          How much can you withdraw after retirement?
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          This calculation estimates the amount a person can withdraw every month in retirement.
        </p>
      </div>

      {error && <ValidationWarning message={error} />}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 20, flex: "1 1 320px", minWidth: 300 }}>
          <Field label="Your age now" value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} />
          <Field label="Your planned retirement age" value={retireAge} onChange={setRetireAge} placeholder={DEFAULTS.retireAge} />
          <Field label="Your life expectancy" value={lifeExpectancy} onChange={setLifeExpectancy} placeholder={DEFAULTS.lifeExpectancy} />
          <DollarField label="Your retirement savings today" value={currentSavings} onChange={setCurrentSavings} placeholder={DEFAULTS.currentSavings} />
          <DollarField label="Annual contribution" value={annualContribution} onChange={setAnnualContribution} placeholder={DEFAULTS.annualContribution} />
          <DollarField label="Monthly contribution" value={monthlyContribution} onChange={setMonthlyContribution} placeholder={DEFAULTS.monthlyContribution} />
          <PercentField label="Average investment return" value={avgReturn} onChange={setAvgReturn} placeholder={DEFAULTS.avgReturn} />
          <PercentField label="Inflation rate (annual)" value={inflation} onChange={setInflation} placeholder={DEFAULTS.inflation} />

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
                  Fill in the details and click <strong>Calculate</strong> to see how much you can withdraw.
                </p>
              ) : (
                <>
                  <ResultTable
                    columns={["", "Actual amount", "Today's money"]}
                    rows={[
                      {
                        label: `Balance at the retirement age of ${retireAgeDisplay}:`, emphasize: true,
                        cells: [formatCurrency(result.balanceAtRetirement, { decimals: 0 }), formatCurrency(result.todaysPurchasingPower, { decimals: 0 })],
                      },
                    ]}
                  />

                  <ResultTable
                    title="If withdraw at fixed purchasing power amount after retirement"
                    columns={["", "Actual amount", "Today's money"]}
                    rows={[
                      {
                        label: `Monthly at ${retireAgeDisplay}, increasing 3%/year:`, emphasize: true,
                        cells: [formatCurrency(result.growing.monthlyAtRetirement, { decimals: 0 }), formatCurrency(result.growing.todaysMoney, { decimals: 0 })],
                      },
                    ]}
                  />

                  <ResultTable
                    title="If withdraw at fixed amount after retirement"
                    columns={["", "Amount"]}
                    rows={[
                      { label: `Monthly withdrawal (${retireAgeDisplay} to ${lifeExpectancyDisplay}):`, emphasize: true, cells: [formatCurrency(result.flat.monthly, { decimals: 0 })] },
                      { label: `Today's purchasing power at age ${retireAgeDisplay}:`, indent: true, cells: [formatCurrency(result.flat.todaysAtRetirement, { decimals: 0 })] },
                      { label: `Today's purchasing power at age ${lifeExpectancyDisplay}:`, indent: true, cells: [formatCurrency(result.flat.todaysAtLifeExpectancy, { decimals: 0 })] },
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
