import { FieldLabel, TextField, ValueUnitField, MonthYearField } from "./MortgageFormControls";
import { MORTGAGE_PLACEHOLDERS } from "./useMortgageCalculator";

const fieldWrapStyle = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const increaseRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 };

export default function MortgageInputsPanel({
  inputs, setField,
  showMoreOptions, setShowMoreOptions,
  increaseRates, setIncreaseRates,
  extraMonthly, setExtraMonthly,
  extraYearly, setExtraYearly,
  extraOneTime, setExtraOneTime,
  showAdditionalOneTime, toggleAdditionalOneTime, additionalOneTimePayments, updateOneTimePayment,
  showBiweekly, setShowBiweekly,
  onCalculate, onClear,
}) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Print
        </button>
      </div>

      <div style={{
        background: "var(--accent)", color: "#fff", borderRadius: "var(--radius-md)",
        padding: "10px 16px", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600,
        marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
      }}>
        <span aria-hidden="true">ℹ️</span> Modify the values and click the Calculate button to use
      </div>

      <div style={fieldWrapStyle}>
        <FieldLabel>Home Price</FieldLabel>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
          <TextField value={inputs.homePrice} onChange={(v) => setField("homePrice", v)} placeholder={MORTGAGE_PLACEHOLDERS.homePrice} style={{ paddingLeft: 22 }} />
        </div>
      </div>

      <div style={fieldWrapStyle}>
        <FieldLabel hint="How much you're putting down upfront, as a dollar amount or percent of the home price.">Down Payment</FieldLabel>
        <ValueUnitField
          value={inputs.downPaymentValue} unit={inputs.downPaymentUnit} placeholder={MORTGAGE_PLACEHOLDERS.downPaymentValue}
          onValueChange={(v) => setField("downPaymentValue", v)} onUnitChange={(u) => setField("downPaymentUnit", u)}
        />
      </div>

      <div style={fieldWrapStyle}>
        <FieldLabel hint="The length of the mortgage, in years.">Loan Term</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TextField value={inputs.loanTermYears} onChange={(v) => setField("loanTermYears", v)} placeholder={MORTGAGE_PLACEHOLDERS.loanTermYears} style={{ width: 100, flex: "none" }} />
          <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>years</span>
        </div>
      </div>

      <div style={fieldWrapStyle}>
        <FieldLabel hint="The annual interest rate for the loan.">Interest Rate</FieldLabel>
        <div style={{ position: "relative" }}>
          <TextField value={inputs.interestRate} onChange={(v) => setField("interestRate", v)} placeholder={MORTGAGE_PLACEHOLDERS.interestRate} style={{ paddingRight: 26 }} />
          <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
        </div>
      </div>

      <div style={fieldWrapStyle}>
        <FieldLabel>Start Date</FieldLabel>
        <MonthYearField
          month={inputs.startMonth} year={inputs.startYear}
          onMonthChange={(v) => setField("startMonth", v)} onYearChange={(v) => setField("startYear", v)}
        />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0 14px", cursor: "pointer" }}>
        <input
          type="checkbox" checked={inputs.includeTaxesAndCosts}
          onChange={(e) => setField("includeTaxesAndCosts", e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
        />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          {inputs.includeTaxesAndCosts ? "Include Taxes & Costs Below" : "Include Taxes & Costs"}
        </span>
      </label>

      {inputs.includeTaxesAndCosts && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 10 }}>
            Annual Tax &amp; Cost
          </p>

          <div style={fieldWrapStyle}>
            <FieldLabel hint="Annual property tax, as a percent of home price or a flat yearly dollar amount.">Property Taxes</FieldLabel>
            <ValueUnitField value={inputs.propertyTaxValue} unit={inputs.propertyTaxUnit} placeholder={MORTGAGE_PLACEHOLDERS.propertyTaxValue} onValueChange={(v) => setField("propertyTaxValue", v)} onUnitChange={(u) => setField("propertyTaxUnit", u)} />
          </div>
          <div style={fieldWrapStyle}>
            <FieldLabel hint="Annual homeowner's insurance premium.">Home Insurance</FieldLabel>
            <ValueUnitField value={inputs.homeInsuranceValue} unit={inputs.homeInsuranceUnit} placeholder={MORTGAGE_PLACEHOLDERS.homeInsuranceValue} onValueChange={(v) => setField("homeInsuranceValue", v)} onUnitChange={(u) => setField("homeInsuranceUnit", u)} />
          </div>
          <div style={fieldWrapStyle}>
            <FieldLabel hint="Private Mortgage Insurance, typically required below 20% down. Percent is based on the loan amount. Automatically stops once your balance reaches 78% of the home price, per federal law.">PMI Insurance</FieldLabel>
            <ValueUnitField value={inputs.pmiValue} unit={inputs.pmiUnit} placeholder={MORTGAGE_PLACEHOLDERS.pmiValue} onValueChange={(v) => setField("pmiValue", v)} onUnitChange={(u) => setField("pmiUnit", u)} />
          </div>
          <div style={fieldWrapStyle}>
            <FieldLabel hint="Annual homeowners association fee, if applicable.">HOA Fee</FieldLabel>
            <ValueUnitField value={inputs.hoaValue} unit={inputs.hoaUnit} placeholder={MORTGAGE_PLACEHOLDERS.hoaValue} onValueChange={(v) => setField("hoaValue", v)} onUnitChange={(u) => setField("hoaUnit", u)} />
          </div>
          <div style={fieldWrapStyle}>
            <FieldLabel hint="Any other annual homeownership costs — maintenance, utilities, etc.">Other Costs</FieldLabel>
            <ValueUnitField value={inputs.otherCostsValue} unit={inputs.otherCostsUnit} placeholder={MORTGAGE_PLACEHOLDERS.otherCostsValue} onValueChange={(v) => setField("otherCostsValue", v)} onUnitChange={(u) => setField("otherCostsUnit", u)} />
          </div>
        </div>
      )}

      {inputs.includeTaxesAndCosts && (
        <button
          type="button"
          onClick={() => setShowMoreOptions((v) => !v)}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 4 }}
        >
          {showMoreOptions ? "− Fewer Options" : "+ More Options"}
        </button>
      )}

      {inputs.includeTaxesAndCosts && showMoreOptions && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 10 }}>
            Annual Tax &amp; Cost Increase
          </p>
          <div style={{ marginBottom: 18 }}>
            {[
              ["propertyTax", "Property Taxes Increase"],
              ["homeInsurance", "Home Insurance Increase"],
              ["hoa", "HOA Fee Increase"],
              ["otherCosts", "Other Costs Increase"],
            ].map(([key, label]) => (
              <div key={key} style={increaseRowStyle}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                <div style={{ position: "relative", width: 80, flexShrink: 0 }}>
                  <TextField
                    value={increaseRates[key]} placeholder="0"
                    onChange={(v) => setIncreaseRates((prev) => ({ ...prev, [key]: v }))}
                    style={{ paddingRight: 22, fontSize: 13 }}
                  />
                  <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12.5 }}>%</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 10 }}>
            Extra Payments
          </p>

          <div style={fieldWrapStyle}>
            <FieldLabel hint="An extra amount added to every monthly payment, starting from the month you choose.">Extra Monthly Pay</FieldLabel>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <TextField value={extraMonthly.amount} onChange={(v) => setExtraMonthly((p) => ({ ...p, amount: v }))} style={{ flex: 1, minWidth: 0 }} placeholder="$0" />
              <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>from</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <MonthYearField month={extraMonthly.month} year={extraMonthly.year} onMonthChange={(v) => setExtraMonthly((p) => ({ ...p, month: v }))} onYearChange={(v) => setExtraMonthly((p) => ({ ...p, year: v }))} />
              </div>
            </div>
          </div>

          <div style={fieldWrapStyle}>
            <FieldLabel hint="An extra amount added once a year, starting from the year you choose.">Extra Yearly Pay</FieldLabel>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <TextField value={extraYearly.amount} onChange={(v) => setExtraYearly((p) => ({ ...p, amount: v }))} style={{ flex: 1, minWidth: 0 }} placeholder="$0" />
              <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>from</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <MonthYearField month={extraYearly.month} year={extraYearly.year} onMonthChange={(v) => setExtraYearly((p) => ({ ...p, month: v }))} onYearChange={(v) => setExtraYearly((p) => ({ ...p, year: v }))} />
              </div>
            </div>
          </div>

          <div style={fieldWrapStyle}>
            <FieldLabel hint="A single lump-sum extra payment applied in the month you choose.">Extra One-time Pay</FieldLabel>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <TextField value={extraOneTime.amount} onChange={(v) => setExtraOneTime((p) => ({ ...p, amount: v }))} style={{ flex: 1, minWidth: 0 }} placeholder="$0" />
              <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>in</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <MonthYearField month={extraOneTime.month} year={extraOneTime.year} onMonthChange={(v) => setExtraOneTime((p) => ({ ...p, month: v }))} onYearChange={(v) => setExtraOneTime((p) => ({ ...p, year: v }))} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAdditionalOneTime}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "4px 0 12px", textDecoration: "underline" }}
          >
            {showAdditionalOneTime ? "− Hide Below Inputs" : "+ Additional One-Time Payments"}
          </button>

          {showAdditionalOneTime && (
            <div style={{ marginBottom: 6 }}>
              {additionalOneTimePayments.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                  <TextField value={p.amount} onChange={(v) => updateOneTimePayment(i, "amount", v)} style={{ flex: 1, minWidth: 0 }} placeholder="$0" />
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 }}>in</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <MonthYearField month={p.month} year={p.year} onMonthChange={(v) => updateOneTimePayment(i, "month", v)} onYearChange={(v) => updateOneTimePayment(i, "year", v)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 10 }}>
            <input type="checkbox" checked={showBiweekly} onChange={(e) => setShowBiweekly(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Show Biweekly Payback Results</span>
          </label>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button type="button" onClick={onCalculate} className="btn-primary" style={{ flex: 1, padding: "13px 0", fontSize: 15 }}>
          Calculate
        </button>
        <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "13px 22px", fontSize: 14 }}>
          Clear
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10 }}>
        This calculator is for estimation purposes only and isn't financial advice.
      </p>
    </div>
  );
}
