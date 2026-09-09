import { useState } from "react";
import { FieldRow, DollarField, ValueUnitField, TextField, ResultTable } from "./HouseAffordabilityFormControls";
import { calculateHouseAffordabilityByBudget, validateBudgetInputs, formatCurrency, formatPercent } from "../../../utils/houseAffordabilityCalculatorEngine";

const DEFAULTS = {
  monthlyBudget: "3500", loanTermYears: "30", interestRate: "6.792",
  downValue: "20", downUnit: "percent",
  taxValue: "1.5", taxUnit: "percent",
  hoaValue: "0", hoaUnit: "percent",
  insValue: "0.5", insUnit: "percent",
  maintenanceValue: "1.5", maintenanceUnit: "percent",
};

const smallInput = { width: "100%", padding: "6px 8px", fontSize: 13, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)" };

/** A plain red error line with a small warning icon — matches the
 * reference's own validation styling exactly, confirmed live for this
 * sub-calculator's own analogous validation message set. */
function ErrorPanel({ message }) {
  return (
    <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

export default function BudgetAffordabilityCard() {
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [loanTermYears, setLoanTermYears] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [downValue, setDownValue] = useState("");
  const [downUnit, setDownUnit] = useState("percent");
  const [includeFees, setIncludeFees] = useState(true);
  const [taxValue, setTaxValue] = useState("");
  const [taxUnit, setTaxUnit] = useState("percent");
  const [hoaValue, setHoaValue] = useState("");
  const [hoaUnit, setHoaUnit] = useState("percent");
  const [insValue, setInsValue] = useState("");
  const [insUnit, setInsUnit] = useState("percent");
  const [maintenanceValue, setMaintenanceValue] = useState("");
  const [maintenanceUnit, setMaintenanceUnit] = useState("percent");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      monthlyBudget: monthlyBudget || DEFAULTS.monthlyBudget,
      loanTermYears: loanTermYears || DEFAULTS.loanTermYears,
      interestRate: interestRate || DEFAULTS.interestRate,
      downValue: downValue || DEFAULTS.downValue,
      taxValue: taxValue || DEFAULTS.taxValue,
      hoaValue: hoaValue || DEFAULTS.hoaValue,
      insValue: insValue || DEFAULTS.insValue,
      maintenanceValue: maintenanceValue || DEFAULTS.maintenanceValue,
    };
    const validationError = validateBudgetInputs(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateHouseAffordabilityByBudget({ ...inputs, downUnit, includeFees, taxUnit, hoaUnit, insUnit, maintenanceUnit }));
  }

  function clear() {
    setMonthlyBudget(""); setLoanTermYears(""); setInterestRate("");
    setDownValue(""); setDownUnit("percent"); setIncludeFees(true);
    setTaxValue(""); setTaxUnit("percent");
    setHoaValue(""); setHoaUnit("percent");
    setInsValue(""); setInsUnit("percent");
    setMaintenanceValue(""); setMaintenanceUnit("percent");
    setResult(null); setError(null);
  }

  const topRows = result ? [
    { label: "You can borrow:", cells: [formatCurrency(result.loan)] },
    { label: "Total price of the house:", cells: [formatCurrency(result.house)] },
    { label: "Down payment:", cells: [formatCurrency(result.downPayment)] },
    { label: "Estimated closing cost (one-time, assume 3%):", cells: [formatCurrency(result.closingCost)] },
    { label: "Total one-time payment at closing:", cells: [formatCurrency(result.totalOneTimeAtClosing)], emphasize: true },
  ] : [];

  const bottomRows = result ? [
    { label: "Monthly mortgage payment:", cells: [formatCurrency(result.monthlyPI)] },
    ...(result.includeFees && result.monthlyPmi > 0 ? [{ label: "Monthly PMI insurance payment:", cells: [formatCurrency(result.monthlyPmi)] }] : []),
    ...(result.includeFees ? [
      { label: "Annual property tax:", cells: [formatCurrency(result.annualTax)] },
      { label: "Annual HOA or co-op fee:", cells: [formatCurrency(result.annualHoa)] },
      { label: "Annual insurance cost:", cells: [formatCurrency(result.annualIns)] },
      { label: "Annual maintenance cost:", cells: [formatCurrency(result.annualMaintenance)] },
    ] : []),
    { label: "Total monthly cost on the house:", cells: [formatCurrency(result.totalMonthlyCost)], emphasize: true },
  ] : [];

  // Confirmed live: this trailing "which is X% of the house price"
  // clause also appears when a percent-mode down payment of 100%+ was
  // silently reinterpreted as a flat dollar amount.
  const downPctText = result && (downUnit === "dollar" || result.downTreatedAsDollar)
    ? `, which is ${formatPercent(result.downPercentActual, 1)} of the house price` : "";

  return (
    <section aria-label="House affordability based on fixed, monthly budgets" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 3 }}>
          House affordability based on fixed, monthly budgets
        </h2>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
          This is a separate calculator used to estimate house affordability based on monthly allocations of a fixed
          amount for housing costs.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: "10px 16px", flex: "0 1 380px", maxWidth: 380, minWidth: 280 }}>
          <FieldRow label="Budget for house" hint="The amount of money you can afford and are willing to pay for the house each month." suffix="per month">
            <DollarField value={monthlyBudget} onChange={setMonthlyBudget} placeholder={DEFAULTS.monthlyBudget} />
          </FieldRow>
          <FieldRow label="Mortgage loan term" suffix="years">
            <TextField value={loanTermYears} onChange={setLoanTermYears} placeholder={DEFAULTS.loanTermYears} style={smallInput} />
          </FieldRow>
          <FieldRow label="Interest rate" suffix="%">
            <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={smallInput} />
          </FieldRow>
          <FieldRow label="Down payment">
            <ValueUnitField value={downValue} unit={downUnit} onValueChange={setDownValue} onUnitChange={setDownUnit} placeholder={DEFAULTS.downValue} />
          </FieldRow>

          <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={includeFees} onChange={(e) => setIncludeFees(e.target.checked)} style={{ width: 13, height: 13, accentColor: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5, color: "var(--text-primary)" }}>
              Include the tax and fees below into the budget
            </span>
          </label>

          {includeFees && (
            <div style={{ paddingLeft: 10, borderLeft: "2px solid var(--border)" }}>
              <FieldRow label="Property tax" suffix="per year">
                <ValueUnitField value={taxValue} unit={taxUnit} onValueChange={setTaxValue} onUnitChange={setTaxUnit} placeholder={DEFAULTS.taxValue} />
              </FieldRow>
              <FieldRow label="HOA or co-op fee" suffix="per year">
                <ValueUnitField value={hoaValue} unit={hoaUnit} onValueChange={setHoaValue} onUnitChange={setHoaUnit} placeholder={DEFAULTS.hoaValue} />
              </FieldRow>
              <FieldRow label="Insurance" suffix="per year">
                <ValueUnitField value={insValue} unit={insUnit} onValueChange={setInsValue} onUnitChange={setInsUnit} placeholder={DEFAULTS.insValue} />
              </FieldRow>
              <FieldRow label="Maintenance cost (repair, utility etc.)" suffix="per year">
                <ValueUnitField value={maintenanceValue} unit={maintenanceUnit} onValueChange={setMaintenanceValue} onUnitChange={setMaintenanceUnit} placeholder={DEFAULTS.maintenanceValue} />
              </FieldRow>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "8px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "0 1 340px", maxWidth: 340, minWidth: 280 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result && !error ? (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see the affordable house price.
                </p>
              ) : error ? (
                <ErrorPanel message={error} />
              ) : (
                <>
                  {result.downTreatedAsDollar && (
                    <p style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8 }}>
                      The down payment was treated as a dollar amount instead of a percentage.
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 13 }}>
                    You can afford a house up to <strong style={{ color: "var(--success)" }}>{formatCurrency(result.house)}</strong>, within
                    which <strong>{formatCurrency(result.loan)}</strong> is the loan and <strong>{formatCurrency(result.downPayment)}</strong> is
                    the down payment{downPctText}.{result.lowDownNote ? ` ${result.lowDownNote}` : ""}
                  </p>
                  <ResultTable columns={["", "Amount"]} rows={topRows} />
                  <ResultTable columns={["", "Amount"]} rows={bottomRows} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
