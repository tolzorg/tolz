import { useState } from "react";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { BORROW_DEFAULTS, LTV_CHOICES } from "../../../utils/homeEquityLoanCalculatorEngine";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 4px" };
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };

/** "The loan amount you can borrow" form shared by the Home Equity Loan and HELOC calculators. */
export default function BorrowLimitCalculator({ idPrefix, title, intro, calculate }) {
  const B = BORROW_DEFAULTS;
  const [v, setV] = useState({ houseValue: "", mortgageBalance: "" });
  const [ltv, setLtv] = useState(B.ltv);
  const [submitted, setSubmitted] = useState(false);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // Like the reference, the result follows the inputs; Calculate also reveals errors.
  // With both boxes empty there is no result (the placeholders are examples only).
  const req = useRequiredFields();
  const blank = v.houseValue === "" && v.mortgageBalance === "";
  const result = blank ? null : calculate({ ...v, ltv });
  const submit = () => { req.require(blank ? v : {}); setSubmitted(true); };
  const clear = () => { req.clear(); setV({ houseValue: "", mortgageBalance: "" }); setLtv(B.ltv); setSubmitted(false); };

  return (
    <section aria-labelledby={`${idPrefix}-borrow-title`}>
      <h2 id={`${idPrefix}-borrow-title`} style={sectionTitle}>{title}</h2>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>{intro}</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 440, padding: 16 }}>
          <Row label="Current value of your house"><Req name="houseValue" flagged={req.flagged}><DollarField value={v.houseValue} onChange={set("houseValue")} placeholder={B.houseValue} /></Req></Row>
          <Row label="Outstanding balance of your mortgage"><Req name="mortgageBalance" flagged={req.flagged}><DollarField value={v.mortgageBalance} onChange={set("mortgageBalance")} placeholder={B.mortgageBalance} /></Req></Row>
          <Row label="LTV ratio acceptable by the lender"><SelectField value={ltv} onChange={setLtv} options={LTV_CHOICES} style={{ width: "100%" }} /></Row>
          <ButtonRow onCalculate={submit} onClear={clear} />
        </div>
        <div className="card" style={{ flex: "1 1 300px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={header}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            {!result || result.errors ? (
              submitted && result ? <ErrorPanel messages={result.errors} /> : <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your home value and mortgage balance.</p>
            ) : (
              <>
                <p style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 6px" }}>
                  {result.qualifies ? <>You may borrow up to <strong style={{ color: "var(--success)" }}>{result.amount}</strong>.</> : "You may not qualify for a home equity loan."}
                </p>
                <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 10px" }}>{result.ltvText}</p>
                {result.notes.length > 0 && <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{result.notes.join(" ")}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
