import { useState } from "react";
import { FieldLabel, TextField, SelectField, TermYearsMonthsField } from "../loan-calculator/LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import { calculateInterest, formatCurrency, COMPOUND_OPTIONS, DEFAULT_COMPOUND } from "../../../utils/interestCalculatorEngine";

// Demo numbers shown only as placeholder hint text, not pre-filled values
// — the established convention from the Mortgage/Loan/Auto Loan calculators.
const DEFAULTS = {
  initialInvestment: "20000", annualContribution: "5000", monthlyContribution: "0",
  interestRate: "5", years: "5", months: "0", taxRate: "0", inflationRate: "3",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingLeft: 22 }} />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
    </div>
  );
}

export default function InterestCalculatorTool() {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [annualContribution, setAnnualContribution] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [contributeAt, setContributeAt] = useState("end");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState(DEFAULT_COMPOUND);
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [result, setResult] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual"); // annual | monthly

  function calculate() {
    setResult(calculateInterest({
      initialInvestment: initialInvestment || DEFAULTS.initialInvestment,
      annualContribution: annualContribution || DEFAULTS.annualContribution,
      monthlyContribution: monthlyContribution || DEFAULTS.monthlyContribution,
      contributeAt,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      compound,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      taxRatePercent: taxRate || DEFAULTS.taxRate,
      inflationRatePercent: inflationRate || DEFAULTS.inflationRate,
    }));
  }

  function clear() {
    setInitialInvestment(""); setAnnualContribution(""); setMonthlyContribution("");
    setContributeAt("end"); setInterestRate(""); setCompound(DEFAULT_COMPOUND);
    setYears(""); setMonths(""); setTaxRate(""); setInflationRate("");
    setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 24, flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Print
            </button>
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Initial investment</FieldLabel>
            <DollarField value={initialInvestment} onChange={setInitialInvestment} placeholder={DEFAULTS.initialInvestment} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Annual contribution</FieldLabel>
            <DollarField value={annualContribution} onChange={setAnnualContribution} placeholder={DEFAULTS.annualContribution} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Monthly contribution</FieldLabel>
            <DollarField value={monthlyContribution} onChange={setMonthlyContribution} placeholder={DEFAULTS.monthlyContribution} />
          </div>

          <div style={{ ...fieldWrap, fontSize: 13.5, color: "var(--text-secondary)" }}>
            <span>Contribute at the</span>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {[["beginning", "beginning"], ["end", "end"]].map(([value, label]) => (
                <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio" name="contributeAt" checked={contributeAt === value}
                    onChange={() => setContributeAt(value)}
                    style={{ width: 15, height: 15, accentColor: "var(--accent)" }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>of each compounding period</span>
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Interest rate</FieldLabel>
            <PercentField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Compound</FieldLabel>
            <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Investment length</FieldLabel>
            <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel hint="Your marginal tax rate. Growth compounds tax-free throughout the term; this percentage is deducted from the total interest earned only once, at the end.">Tax rate</FieldLabel>
            <PercentField value={taxRate} onChange={setTaxRate} placeholder={DEFAULTS.taxRate} />
          </div>

          <div style={fieldWrap}>
            <FieldLabel>Inflation rate</FieldLabel>
            <PercentField value={inflationRate} onChange={setInflationRate} placeholder={DEFAULTS.inflationRate} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the investment details and click <strong>Calculate</strong> to see your projected balance.
                </p>
              ) : (
                <>
                  {[
                    ["Ending balance", formatCurrency(result.endingBalance), true],
                    ["Total principal", formatCurrency(result.totalPrincipal), false],
                    ["Total contributions", formatCurrency(result.totalContributions), false],
                    ["Total interest", formatCurrency(result.totalInterest), true],
                    ["Interest of initial investment", formatCurrency(result.interestOfInitial), false],
                    ["Interest of the contributions", formatCurrency(result.interestOfContributions), false],
                    // These two only appear once tax actually reduces the
                    // result — matches the reference, which omits them
                    // entirely at a 0% tax rate rather than showing $0 rows.
                    ...(result.totalTax > 0
                      ? [
                          ["Total tax", formatCurrency(result.totalTax), false],
                          ["Total interest after tax", formatCurrency(result.totalInterestAfterTax), false],
                        ]
                      : []),
                    ["Buying power of the end balance after inflation adjustment", formatCurrency(result.buyingPower), false],
                  ].map(([label, value, bold]) => (
                    <div key={label} style={{ ...rowStyle, fontWeight: bold ? 700 : 500, color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      <span>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 18 }}>
                    <MortgagePieChart segments={[
                      { label: "Initial investment", value: Math.max(0, result.totalPrincipal - result.totalContributions), color: "#3b7bfc" },
                      { label: "Contributions", value: result.totalContributions, color: "#16a34a" },
                      ...(result.totalTax > 0
                        ? [
                            { label: "Interest after tax", value: result.totalInterestAfterTax, color: "#b91c1c" },
                            { label: "Tax", value: result.totalTax, color: "#0ea5e9" },
                          ]
                        : [{ label: "Interest", value: result.totalInterest, color: "#b91c1c" }]),
                    ]} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>
              Accumulation Schedule
            </p>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScheduleView(key)}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: scheduleView === key ? "var(--text-primary)" : "var(--accent)",
                  textDecoration: scheduleView === key ? "none" : "underline",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <LoanScheduleTable
            title={scheduleView === "annual" ? "Annual Schedule" : "Monthly Schedule"}
            schedule={scheduleView === "annual" ? result.annualSchedule : result.monthlySchedule}
            columns={[
              { key: "deposit", label: "Deposit" },
              { key: "interest", label: "Interest" },
              // Matches the reference: a Tax column only appears once tax
              // actually applies, same as the Results panel's rows.
              ...(result.totalTax > 0 ? [{ key: "tax", label: "Tax" }] : []),
              { key: "balance", label: "Balance" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
