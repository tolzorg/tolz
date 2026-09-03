import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import MortgagePieChart from "../mortgage-calculator/MortgagePieChart";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import { calculateFromPrice, calculateFromPayment, formatCurrency, US_STATES } from "../../../utils/autoLoanCalculatorEngine";

// Demo numbers shown only as placeholder hint text, not pre-filled values
// — the established convention from the Mortgage/Loan calculators.
const DEFAULTS = {
  autoPrice: "50000", targetMonthlyPayment: "755", loanTermMonths: "60", interestRate: "5",
  cashIncentives: "0", downPayment: "10000", tradeInValue: "0", amountOwedOnTradeIn: "0",
  salesTaxPercent: "7", fees: "2000",
};

const STATE_OPTIONS = [{ value: "", label: "-- Select --" }, ...US_STATES.map((s) => ({ value: s, label: s }))];

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

export default function AutoLoanCalculatorTool() {
  const [tab, setTab] = useState("totalPrice"); // totalPrice | monthlyPayment
  const [autoPrice, setAutoPrice] = useState("");
  const [targetMonthlyPayment, setTargetMonthlyPayment] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [cashIncentives, setCashIncentives] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [tradeInValue, setTradeInValue] = useState("");
  const [amountOwedOnTradeIn, setAmountOwedOnTradeIn] = useState("");
  const [stateName, setStateName] = useState("");
  const [salesTaxPercent, setSalesTaxPercent] = useState("");
  const [fees, setFees] = useState("");
  const [includeTaxesFeesInLoan, setIncludeTaxesFeesInLoan] = useState(false);
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function calculate() {
    const shared = {
      cashIncentives: cashIncentives || DEFAULTS.cashIncentives,
      downPayment: downPayment || DEFAULTS.downPayment,
      tradeInValue: tradeInValue || DEFAULTS.tradeInValue,
      amountOwedOnTradeIn: amountOwedOnTradeIn || DEFAULTS.amountOwedOnTradeIn,
      loanTermMonths: loanTermMonths || DEFAULTS.loanTermMonths,
      annualRatePercent: interestRate || DEFAULTS.interestRate,
      salesTaxPercent: salesTaxPercent || DEFAULTS.salesTaxPercent,
      fees: fees || DEFAULTS.fees,
      includeTaxesFeesInLoan, state: stateName,
    };
    setResult(
      tab === "totalPrice"
        ? calculateFromPrice({ ...shared, autoPrice: autoPrice || DEFAULTS.autoPrice })
        : calculateFromPayment({ ...shared, targetMonthlyPayment: targetMonthlyPayment || DEFAULTS.targetMonthlyPayment })
    );
    setShowTable(false);
  }

  function clear() {
    setAutoPrice(""); setTargetMonthlyPayment(""); setLoanTermMonths(""); setInterestRate("");
    setCashIncentives(""); setDownPayment(""); setTradeInValue(""); setAmountOwedOnTradeIn("");
    setStateName(""); setSalesTaxPercent(""); setFees(""); setIncludeTaxesFeesInLoan(false);
    setResult(null); setShowTable(false);
  }

  function switchTab(next) {
    setTab(next);
    setResult(null);
    setShowTable(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Print
            </button>
          </div>

          <div style={{ display: "flex", marginBottom: -1 }}>
            {[["totalPrice", "Total Price"], ["monthlyPayment", "Monthly Payment"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                style={{
                  flex: 1, padding: "11px 0", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)", borderBottom: tab === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: key === "totalPrice" ? "var(--radius-md)" : 0,
                  borderTopRightRadius: key === "monthlyPayment" ? "var(--radius-md)" : 0,
                  // The clicked/active tab (whose fields are showing below)
                  // is the highlighted blue one — matches how a tab control
                  // is normally expected to behave.
                  background: tab === key ? "var(--accent)" : "var(--bg-white)",
                  color: tab === key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: tab === key ? 1 : 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 24, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {tab === "totalPrice" ? (
              <div style={fieldWrap}>
                <FieldLabel>Auto Price</FieldLabel>
                <DollarField value={autoPrice} onChange={setAutoPrice} placeholder={DEFAULTS.autoPrice} />
              </div>
            ) : (
              <div style={fieldWrap}>
                <FieldLabel>Monthly Pay</FieldLabel>
                <DollarField value={targetMonthlyPayment} onChange={setTargetMonthlyPayment} placeholder={DEFAULTS.targetMonthlyPayment} />
              </div>
            )}

            <div style={fieldWrap}>
              <FieldLabel>Loan Term</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TextField value={loanTermMonths} onChange={setLoanTermMonths} placeholder={DEFAULTS.loanTermMonths} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>months</span>
              </div>
            </div>

            <div style={fieldWrap}>
              <FieldLabel>Interest Rate</FieldLabel>
              <PercentField value={interestRate} onChange={setInterestRate} placeholder={DEFAULTS.interestRate} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel hint="Manufacturer or dealer cash rebates that reduce what you need to finance. Whether they're also exempt from sales tax depends on your state (see Your State below).">Cash Incentives</FieldLabel>
              <DollarField value={cashIncentives} onChange={setCashIncentives} placeholder={DEFAULTS.cashIncentives} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel>Down Payment</FieldLabel>
              <DollarField value={downPayment} onChange={setDownPayment} placeholder={DEFAULTS.downPayment} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel>Trade-in Value</FieldLabel>
              <DollarField value={tradeInValue} onChange={setTradeInValue} placeholder={DEFAULTS.tradeInValue} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel hint="Any remaining loan balance on your trade-in vehicle — rolled into the new loan as negative equity.">Amount Owed on Trade-in</FieldLabel>
              <DollarField value={amountOwedOnTradeIn} onChange={setAmountOwedOnTradeIn} placeholder={DEFAULTS.amountOwedOnTradeIn} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel hint="Some states charge sales tax on the vehicle's full price even after a manufacturer rebate; most exempt the rebated amount. Selecting your state applies the correct rule to Cash Incentives above.">Your State</FieldLabel>
              <SelectField value={stateName} onChange={setStateName} options={STATE_OPTIONS} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel hint="Your state or local sales tax rate, applied to the vehicle price after any trade-in credit.">Sales Tax</FieldLabel>
              <PercentField value={salesTaxPercent} onChange={setSalesTaxPercent} placeholder={DEFAULTS.salesTaxPercent} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel hint="DMV title, registration, documentation, and other one-time fees.">Title, Registration and Other Fees</FieldLabel>
              <DollarField value={fees} onChange={setFees} placeholder={DEFAULTS.fees} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
              <input
                type="checkbox" checked={includeTaxesFeesInLoan}
                onChange={(e) => setIncludeTaxesFeesInLoan(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Include taxes and fees in loan</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* On "Total Price", Auto Price is the input and Monthly Pay
                  is solved for — header shows Monthly Pay. On "Monthly
                  Payment", it's reversed: Monthly Pay is the input and
                  Auto Price (labeled "Vehicle Price" here, matching the
                  reference) is solved for — header shows Vehicle Price. */}
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                {tab === "totalPrice" ? "Monthly Pay:" : "Vehicle Price:"}
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {result ? formatCurrency(tab === "totalPrice" ? result.monthlyPayment : result.autoPrice) : "$0.00"}
              </span>
            </div>

            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the loan details and click <strong>Calculate</strong> to see your monthly payment and full breakdown.
                </p>
              ) : (
                <>
                  {[
                    ["Total Loan Amount", formatCurrency(result.totalLoanAmount)],
                    ["Sale Tax", formatCurrency(result.saleTax)],
                    ["Upfront Payment", formatCurrency(result.upfrontPayment)],
                  ].map(([label, value]) => (
                    <div key={label} style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ height: 10 }} />

                  {[
                    [`Total of ${result.loanTermMonths} Loan Payments`, formatCurrency(result.totalOfPayments)],
                    ["Total Loan Interest", formatCurrency(result.totalInterest)],
                    ["Total Cost (price, interest, tax, fees)", formatCurrency(result.totalCost)],
                  ].map(([label, value]) => (
                    <div key={label} style={rowStyle}>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "18px 0 10px" }}>
                    Loan Breakdown
                  </p>
                  <MortgagePieChart segments={[
                    { label: "Principal", value: result.totalLoanAmount, color: "#3b7bfc" },
                    { label: "Interest", value: result.totalInterest, color: "#16a34a" },
                  ]} />

                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "16px 0 0", textDecoration: "underline" }}
                  >
                    {showTable ? "Hide Amortization Schedule" : "View Amortization Schedule"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && showTable && (
        <LoanScheduleTable
          title="Amortization Schedule"
          schedule={result.schedule}
          columns={[{ key: "payment", label: "Payment" }, { key: "interest", label: "Interest" }, { key: "principal", label: "Principal" }, { key: "balance", label: "Balance" }]}
        />
      )}
    </div>
  );
}
