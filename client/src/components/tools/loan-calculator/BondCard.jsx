import { useState } from "react";
import { FieldLabel, TextField, SelectField, TermYearsMonthsField } from "./LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "./LoanScheduleTable";
import { calculateBond, formatCurrency, COMPOUND_OPTIONS } from "../../../utils/loanCalculatorEngine";

const DEFAULTS = { dueAmount: "100000", years: "10", months: "0", interestRate: "6" };
const cardStyle = { padding: 24 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

export default function BondCard() {
  const [dueAmount, setDueAmount] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [compound, setCompound] = useState("annually");
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function calculate() {
    setResult(calculateBond({
      dueAmount: dueAmount || DEFAULTS.dueAmount,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      compound,
    }));
    setShowTable(false);
  }

  function clear() {
    setDueAmount(""); setYears(""); setMonths(""); setInterestRate("");
    setCompound("annually");
    setResult(null); setShowTable(false);
  }

  return (
    <section aria-label="Bond calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          Bond: Paying Back a Predetermined Amount Due at Loan Maturity
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Use this calculator to compute the initial value of a bond/loan based on a predetermined face value to be
          paid back at bond/loan maturity — the reverse of a Deferred Payment Loan.
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ ...cardStyle, flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <FieldLabel>Predetermined Due Amount</FieldLabel>
              <div style={{ position: "relative", marginTop: 6 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
                <TextField value={dueAmount} onChange={setDueAmount} placeholder={DEFAULTS.dueAmount} style={{ paddingLeft: 22 }} />
              </div>
            </div>

            <div>
              <FieldLabel>Loan Term</FieldLabel>
              <div style={{ marginTop: 6 }}>
                <TermYearsMonthsField years={years} months={months} onYearsChange={setYears} onMonthsChange={setMonths} />
              </div>
            </div>

            <div>
              <FieldLabel>Interest Rate</FieldLabel>
              <div style={{ position: "relative", marginTop: 6 }}>
                <TextField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} style={{ paddingRight: 26 }} />
                <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
              </div>
            </div>

            <div>
              <FieldLabel>Compound</FieldLabel>
              <div style={{ marginTop: 6 }}>
                <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={calculate} className="btn-primary" style={{ flex: 1, padding: "12px 0", fontSize: 14.5 }}>Calculate</button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results:
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Fill in the bond details and click <strong>Calculate</strong> to see the amount received when the loan starts.</p>
              ) : (
                <>
                  {[
                    ["Amount Received When the Loan Starts", formatCurrency(result.amountReceived)],
                    ["Total Interest", formatCurrency(result.totalInterest)],
                  ].map(([label, value]) => (
                    <div key={label} style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 18 }}>
                    <MortgagePieChart segments={[
                      { label: "Principal", value: result.amountReceived, color: "#3b7bfc" },
                      { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                    ]} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "14px 0 0", textDecoration: "underline" }}
                  >
                    {showTable ? "Hide Schedule Table" : "View Schedule Table"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && showTable && (
        <LoanScheduleTable
          title="Schedule Table"
          schedule={result.schedule}
          columns={[{ key: "interest", label: "Interest" }, { key: "balance", label: "Balance" }]}
        />
      )}
    </section>
  );
}
