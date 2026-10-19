import { useState } from "react";
import { FieldLabel } from "../loan-calculator/LoanFormControls";
import { DollarField, YearsField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateRoi, ROI_DEFAULTS } from "../../../utils/roiCalculatorEngine";
import { todayIso } from "../../../utils/depreciationCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = ROI_DEFAULTS;
const GOOD = "var(--success)";
const BAD = "#dc2626";
const td = { padding: "6px 12px", fontSize: 14, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4, whiteSpace: "nowrap" };
const labelTd = { ...td, background: "var(--bg-muted)", textAlign: "left", fontWeight: 400 };
const dateInputStyle = {
  flex: 1, minWidth: 0, padding: "8px 10px", fontSize: 13, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
  fontFamily: "var(--font-display)", color: "var(--text-primary)", background: "var(--bg-white)",
};

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: BAD, fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function Row({ label, htmlFor, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 120px", minWidth: 0 }}>
        {htmlFor ? <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</label> : <FieldLabel>{label}</FieldLabel>}
      </div>
      <div style={{ flex: "1 1 200px", maxWidth: 260, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export default function RoiCalculatorTool() {
  const [invested, setInvested] = useState("");
  const [returned, setReturned] = useState("");
  const [useLength, setUseLength] = useState(false);
  const [length, setLength] = useState("");
  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(D.endDate);
  const [result, setResult] = useState(null);

  // A blank box is an error, as on the reference (flagged "Please enter a value").
  // Dates aren't text boxes, so they keep their own values.
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { invested, returned, ...(useLength ? { length } : {}) },
    (fill) => calculateRoi({
      invested: fill.has("invested") ? D.invested : invested,
      returned: fill.has("returned") ? D.returned : returned,
      useLength,
      length: fill.has("length") ? D.length : length,
      startDate, endDate, today: todayIso(),
    }),
  ));
  const clear = () => {
    req.clear(); setInvested(""); setReturned(""); setLength(""); setUseLength(false);
    setStartDate(todayIso()); setEndDate(D.endDate); setResult(null);
  };

  let body;
  if (!result) body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the amounts and the investment time, then click Calculate.</p>;
  else if (result.errors) body = <ErrorPanel messages={result.errors} />;
  else {
    const color = result.loss ? BAD : GOOD;
    body = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
        <div style={{ flex: "1 0 auto", maxWidth: "100%", minWidth: 0 }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", maxWidth: "100%" }}>
            <tbody>
              {result.rows.map(([label, value, colored]) => (
                <tr key={label}>
                  <th scope="row" style={labelTd}>{label}</th>
                  {/* Very short holding times give annualized ROIs with dozens of
                      digits; let them wrap inside the cell instead of overflowing. */}
                  <td style={{ ...td, textAlign: "right", whiteSpace: "normal", overflowWrap: "anywhere" }}>{colored ? <strong style={{ color }}>{value}</strong> : value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <InvestmentPieChart segments={result.pie} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 340px", minWidth: 280, maxWidth: 460, padding: 18 }}>
        <Row label="Amount Invested"><Req name="invested" flagged={req.flagged}><DollarField value={invested} onChange={setInvested} placeholder={D.invested} /></Req></Row>
        <Row label="Amount Returned"><Req name="returned" flagged={req.flagged}><DollarField value={returned} onChange={setReturned} placeholder={D.returned} /></Req></Row>
        <fieldset style={{ border: "none", padding: 0, margin: "10px 0 0" }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", padding: 0, marginBottom: 8 }}>Investment Time:</legend>
          <div style={{ display: "flex", gap: 18, paddingLeft: 12, marginBottom: 10 }}>
            {[[false, "Use Dates"], [true, "Use Length"]].map(([value, label]) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer", fontWeight: useLength === value ? 700 : 400 }}>
                <input type="radio" name="roi-time" checked={useLength === value} onChange={() => setUseLength(value)} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ paddingLeft: 12 }}>
            {useLength ? (
              <Row label="Investment Length"><Req name="length" flagged={req.flagged}><YearsField value={length} onChange={setLength} placeholder={D.length} /></Req></Row>
            ) : (
              <>
                <Row label="From" htmlFor="roi-from"><input id="roi-from" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateInputStyle} /></Row>
                <Row label="To" htmlFor="roi-to"><input id="roi-to" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateInputStyle} /></Row>
              </>
            )}
          </div>
        </fieldset>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>
      <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Result</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
