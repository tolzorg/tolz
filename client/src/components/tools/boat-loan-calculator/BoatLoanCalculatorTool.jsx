import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import AmortizationLineChart from "../amortization-calculator/AmortizationLineChart";
import { formatMoney } from "../../../utils/marginCalculatorEngine";
import { calculateBoatLoan, convertDownPayment, BOAT_LOAN_DEFAULTS } from "../../../utils/boatLoanCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = BOAT_LOAN_DEFAULTS;
const TEXT_KEYS = ["price", "monthlyPay", "term", "interestRate", "downPayment", "tradeIn", "salesTax", "fees"];
const EMPTY = Object.fromEntries(TEXT_KEYS.map((k) => [k, ""]));
const TERM_UNITS = [{ value: "years", label: "years" }, { value: "months", label: "months" }];
const DOWN_UNITS = [{ value: "dollar", label: "$" }, { value: "percent", label: "%" }];
const FEES_HELP = "Includes costs such as title and registration fees, financing charges, trailer purchase costs, and other related fees.";

const cell = { padding: "6px 10px", fontSize: 13, color: "var(--text-primary)", border: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" };
const headCell = { ...cell, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center" };

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
      <div style={{ flex: "1 1 120px", minWidth: 0 }}><FieldLabel hint={help}>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 200px", maxWidth: 250, display: "flex", gap: 6, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function ScheduleTable({ schedule, view }) {
  const annual = view === "annual";
  const rows = annual ? schedule.annual : schedule.monthly;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
        <thead>
          <tr>{[annual ? "Year" : "Month", "Interest", "Principal", "Ending Balance"].map((h) => <th key={h} style={headCell}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.flatMap((r) => {
            const index = annual ? r.year : r.index;
            const line = (
              <tr key={index}>
                <td style={cell}>{index}</td>
                <td style={cell}>{formatMoney(r.interest)}</td>
                <td style={cell}>{formatMoney(r.principal)}</td>
                <td style={cell}>{formatMoney(r.balance)}</td>
              </tr>
            );
            return !annual && index % 12 === 0
              ? [line, <tr key={`y${index}`}><td colSpan={4} style={{ ...cell, textAlign: "center", fontWeight: 700, background: "var(--bg-muted)" }}>End of year {index / 12}</td></tr>]
              : [line];
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BoatLoanCalculatorTool() {
  const [mode, setMode] = useState("price");
  const [v, setV] = useState(EMPTY);
  const [termUnit, setTermUnit] = useState("years");
  const [downUnit, setDownUnit] = useState("dollar");
  const [financeFees, setFinanceFees] = useState(false);
  const [result, setResult] = useState(null);
  const [view, setView] = useState("annual");
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // Switching $ ↔ % converts the entered down payment against the price, as on the reference.
  const changeDownUnit = (unit) => {
    if (unit === downUnit) return;
    setV((p) => (p.downPayment === "" ? p : { ...p, downPayment: convertDownPayment(p.downPayment, unit, p.price || D.price) }));
    setDownUnit(unit);
  };

  // The example applies only while every box is empty; otherwise every box
  // is required, as on the reference.
  const req = useRequiredFields();
  const calculate = () => {
    setResult(req.evaluate(pickFields(v, TEXT_KEYS), (fill) => calculateBoatLoan({ ...withFill(v, D, fill), mode, termUnit, downUnit, financeFees })));
    setView("annual");
  };
  const clear = () => { req.clear(); setV(EMPTY); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the boat and loan details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: r.gap ? "16px 0 7px" : "7px 0", fontSize: 13.5 }}>
                  <FieldLabel hint={r.help}><span style={{ fontWeight: 400, fontSize: 13.5, color: "var(--text-secondary)" }}>{r.label}</span></FieldLabel>
                </td>
                <td style={{ padding: r.gap ? "16px 0 7px" : "7px 0", fontSize: 13.5, color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.note && <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "10px 0 0" }}>{result.note}</p>}
        <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", textAlign: "center", margin: "16px 0 6px" }}>Loan Breakdown</p>
        <InvestmentPieChart segments={result.pie} labelText={(s) => `${s.percent}%`} />
      </>
    );
  }

  const series = result?.schedule
    ? (() => {
      let interest = 0;
      let paid = 0;
      return result.schedule.monthly.map((r) => {
        interest += r.interest;
        paid += r.interest + r.principal;
        return { year: r.index, balance: r.balance, interest, payment: paid };
      });
    })()
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px", minWidth: 280, maxWidth: 480 }}>
          {/* Same tab style as the Auto Loan Calculator: the active tab is the blue one. */}
          <div role="tablist" aria-label="Calculate by" style={{ display: "flex", marginBottom: -1 }}>
            {[["price", "Total Price"], ["payment", "Monthly Payment"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => { setMode(key); setResult(null); }}
                style={{
                  flex: 1, padding: "11px 0", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
                  border: "1px solid var(--border)", borderBottom: mode === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderTopLeftRadius: key === "price" ? "var(--radius-md)" : 0,
                  borderTopRightRadius: key === "payment" ? "var(--radius-md)" : 0,
                  background: mode === key ? "var(--accent)" : "var(--bg-white)",
                  color: mode === key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: mode === key ? 1 : 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="card" role="tabpanel" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {mode === "price"
              ? <Row label="Boat Price"><Req name="price" flagged={req.flagged}><DollarField value={v.price} onChange={set("price")} placeholder={D.price} /></Req></Row>
              : <Row label="Monthly Payment"><Req name="monthlyPay" flagged={req.flagged}><DollarField value={v.monthlyPay} onChange={set("monthlyPay")} placeholder={D.monthlyPay} /></Req></Row>}
            <Row label="Loan Term">
              <Req name="term" flagged={req.flagged}><TextField value={v.term} onChange={set("term")} placeholder={D.term} style={{ flex: 1, minWidth: 0 }} /></Req>
              <SelectField value={termUnit} onChange={setTermUnit} options={TERM_UNITS} style={{ flex: "0 0 96px", minWidth: 0 }} />
            </Row>
            <Row label="Interest Rate"><Req name="interestRate" flagged={req.flagged}><PercentField value={v.interestRate} onChange={set("interestRate")} placeholder={D.interestRate} /></Req></Row>
            <Row label="Down Payment">
              {downUnit === "dollar"
                ? <Req name="downPayment" flagged={req.flagged}><DollarField value={v.downPayment} onChange={set("downPayment")} placeholder={D.downPayment} /></Req>
                : <PercentField value={v.downPayment} onChange={set("downPayment")} placeholder="20" />}
              <SelectField value={downUnit} onChange={changeDownUnit} options={DOWN_UNITS} style={{ flex: "0 0 62px", minWidth: 0 }} />
            </Row>
            <Row label="Trade-in Value"><Req name="tradeIn" flagged={req.flagged}><DollarField value={v.tradeIn} onChange={set("tradeIn")} placeholder={D.tradeIn} /></Req></Row>
            <Row label="Sales Tax"><Req name="salesTax" flagged={req.flagged}><PercentField value={v.salesTax} onChange={set("salesTax")} placeholder={D.salesTax} /></Req></Row>
            <Row label="Fees" help={FEES_HELP}><Req name="fees" flagged={req.flagged}><DollarField value={v.fees} onChange={set("fees")} placeholder={D.fees} /></Req></Row>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer", margin: "6px 0 12px" }}>
              <input type="checkbox" checked={financeFees} onChange={(e) => setFinanceFees(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
              Include all fees in loan
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 360px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {result && !result.errors ? <>{result.header.label}:&nbsp;&nbsp;{result.header.value}</> : "Result"}
          </div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
        </div>
      </div>

      {result && result.schedule && (
        <section aria-labelledby="boat-schedule-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="boat-schedule-title" style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>Amortization schedule</h2>
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
              <AmortizationLineChart series={series} loanAmount={result.loan} termLabel="Month" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
