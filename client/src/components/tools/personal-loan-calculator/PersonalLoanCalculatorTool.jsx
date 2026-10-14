import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { MonthYearField } from "../mortgage-calculator/MortgageFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import AmortizationLineChart from "../amortization-calculator/AmortizationLineChart";
import { calculatePersonalLoan, formatScheduleMoney, PERSONAL_LOAN_DEFAULTS } from "../../../utils/personalLoanCalculatorEngine";

const D = PERSONAL_LOAN_DEFAULTS;
const TEXT_KEYS = ["loanAmount", "interestRate", "years", "months", "feeAmount", "insurance"];
const EMPTY = Object.fromEntries(TEXT_KEYS.map((k) => [k, ""]));
const FEE_TYPES = [{ value: "percentage", label: "%" }, { value: "amount", label: "$" }];

const cell = { padding: "6px 10px", fontSize: 13, color: "var(--text-primary)", border: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" };
const headCell = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" };

function today() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: String(now.getFullYear()) };
}

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function Row({ label, help, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 110px", minWidth: 0 }}><FieldLabel hint={help}>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 210px", maxWidth: 260, display: "flex", minWidth: 0 }}>{children}</div>
    </div>
  );
}

function UnitField({ value, onChange, placeholder, unit, Field = TextField, pad = 50 }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex" }}>
      <Field value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: pad }} />
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12, pointerEvents: "none" }}>{unit}</span>
    </div>
  );
}

function ScheduleTable({ schedule, view }) {
  const annual = view === "annual";
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
        <thead>
          <tr>
            {[annual ? "Year" : "Month", "Date", "Interest", "Principal", "Ending Balance"].map((h) => <th key={h} style={headCell}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {annual
            ? schedule.annual.map((r) => (
              <tr key={r.year}>
                <td style={cell}>{r.year}</td>
                <td style={cell}>{r.date}</td>
                <td style={cell}>{formatScheduleMoney(r.interest)}</td>
                <td style={cell}>{formatScheduleMoney(r.principal)}</td>
                <td style={cell}>{formatScheduleMoney(r.balance)}</td>
              </tr>
            ))
            : schedule.monthly.flatMap((r) => [
              <tr key={r.index}>
                <td style={cell}>{r.index}</td>
                <td style={cell}>{r.dateText}</td>
                <td style={cell}>{formatScheduleMoney(r.interest)}</td>
                <td style={cell}>{formatScheduleMoney(r.principal)}</td>
                <td style={cell}>{formatScheduleMoney(r.balance)}</td>
              </tr>,
              ...(r.index % 12 === 0 ? [
                <tr key={`y${r.index}`}>
                  <td colSpan={5} style={{ ...cell, textAlign: "center", fontWeight: 700, background: "var(--bg-muted)" }}>End of year {r.index / 12}</td>
                </tr>,
              ] : []),
            ])}
        </tbody>
      </table>
    </div>
  );
}

export default function PersonalLoanCalculatorTool() {
  const start = today();
  const [v, setV] = useState(EMPTY);
  const [startMonth, setStartMonth] = useState(start.month);
  const [startYear, setStartYear] = useState(start.year);
  const [includeFees, setIncludeFees] = useState(false);
  const [feeType, setFeeType] = useState("percentage");
  const [feePaid, setFeePaid] = useState("deduct");
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // The example applies only while every box is empty; otherwise a blank
  // fee, insurance, years or months box counts as 0, as on the reference.
  const calculate = () => {
    const values = TEXT_KEYS.every((k) => v[k] === "") ? D : v;
    setResult(calculatePersonalLoan({ ...values, startMonth, startYear, includeFees, feeType, feePaid }));
    setView("annual");
  };
  const clear = () => { setV(EMPTY); setStartYear(""); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the loan details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "7px 0", fontSize: 13.5, color: "var(--text-secondary)" }}>
                  <FieldLabel hint={r.help}><span style={{ fontWeight: 400, fontSize: 13.5, color: "var(--text-secondary)" }}>{r.label}</span></FieldLabel>
                </td>
                <td style={{ padding: "7px 0", fontSize: 13.5, color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14 }}>
          <InvestmentPieChart segments={result.pie} labelText={(s) => `${s.percent}%`} />
        </div>
      </>
    );
  }

  const series = result?.schedule
    ? (() => {
      let interest = 0;
      let paid = 0;
      return result.schedule.annual.map((r) => {
        interest += r.interest;
        paid += r.interest + r.principal;
        return { year: r.year, balance: r.balance, interest, payment: paid };
      });
    })()
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 480, padding: 18 }}>
          <Row label="Loan amount"><DollarField value={v.loanAmount} onChange={set("loanAmount")} placeholder={D.loanAmount} /></Row>
          <Row label="Interest rate"><PercentField value={v.interestRate} onChange={set("interestRate")} placeholder={D.interestRate} /></Row>
          <Row label="Loan term">
            <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
              <UnitField value={v.years} onChange={set("years")} placeholder={D.years} unit="years" />
              <UnitField value={v.months} onChange={set("months")} placeholder={D.months} unit="months" pad={58} />
            </div>
          </Row>
          <Row label="Start date">
            <div style={{ flex: 1, minWidth: 0 }}>
              <MonthYearField month={startMonth} year={startYear} onMonthChange={setStartMonth} onYearChange={setStartYear} />
            </div>
          </Row>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", margin: "10px 0" }}>
            <input type="checkbox" checked={includeFees} onChange={(e) => setIncludeFees(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
            {includeFees ? "Include fee and insurance below" : "Include fee and insurance"}
          </label>

          {includeFees && (
            <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 10 }}>
              <div style={{ marginBottom: 6 }}>
                <FieldLabel hint="It is the fee that the lender charges the borrower for providing the loan. The origination fee may encompass the costs associated with processing the application, underwriting, funding the loan, as well as other administrative services.">
                  Origination fee
                </FieldLabel>
              </div>
              <Row label="Amount">
                <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
                  {feeType === "percentage"
                    ? <PercentField value={v.feeAmount} onChange={set("feeAmount")} placeholder={D.feeAmount} />
                    : <DollarField value={v.feeAmount} onChange={set("feeAmount")} placeholder="0" />}
                  <SelectField value={feeType} onChange={setFeeType} options={FEE_TYPES} style={{ flex: "0 0 64px", minWidth: 0 }} />
                </div>
              </Row>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 8px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                <legend style={{ float: "left", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, padding: "2px 0 0", marginRight: 6 }}>to be</legend>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[["deduct", "deducted from loan"], ["upfront", "paid upfront"]].map(([value, label]) => (
                    <label key={value} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
                      <input type="radio" name="pl-fee-paid" checked={feePaid === value} onChange={() => setFeePaid(value)} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Row label="Insurance" help="Some lenders may require the borrower to purchase credit insurance for personal loans as a form of protection.">
                <UnitField value={v.insurance} onChange={set("insurance")} placeholder={D.insurance} unit="/month" Field={DollarField} pad={56} />
              </Row>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {result && !result.errors ? <>Monthly pay:&nbsp;&nbsp;{result.payment}</> : "Result"}
          </div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
        </div>
      </div>

      {result && result.schedule && (
        <section aria-labelledby="pl-schedule-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="pl-schedule-title" style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>Amortization schedule</h2>
          <div style={{ display: "flex", gap: 18, fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: view === key ? "var(--text-primary)" : "var(--accent)",
                  textDecoration: view === key ? "none" : "underline",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 14, maxHeight: view === "monthly" ? 520 : undefined, overflowY: view === "monthly" ? "auto" : undefined }}>
              <ScheduleTable schedule={result.schedule} view={view} />
            </div>
            <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 16 }}>
              <AmortizationLineChart series={series} loanAmount={result.principal} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
