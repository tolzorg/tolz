import { useState } from "react";
import { FieldRow } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { calculateDiscount, DISCOUNT_DEFAULTS } from "../../../utils/discountCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const EMPTY = { before: "", discount: "", after: "", saved: "" };
const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" };

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

export default function DiscountCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [type, setType] = useState("percent");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const fixed = type === "fixed";
  // Which boxes are blank decides what gets solved, so the example (price
  // before and discount) is used only while every visible box is empty.
  const visible = fixed ? ["before", "discount", "after"] : ["before", "discount", "after", "saved"];
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(pickFields(v, visible), (fill) => calculateDiscount({ ...withFill(v, DISCOUNT_DEFAULTS, fill), type })));

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter any two values, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    body = (
      <>
        <p style={{ fontSize: 14, color: "var(--text-primary)", margin: "0 0 10px", overflowWrap: "anywhere" }}>{result.intro}</p>
        {result.rows.map((r) => (
          <p key={r.label} style={{ fontSize: 20, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.35 }}>
            {r.label}: <strong style={{ color: "var(--success)" }}>{r.value}</strong>
          </p>
        ))}
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>Please provide any 2 values below to calculate.</p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 18 }}>
          <FieldRow label="Price before discount"><Req name="before" flagged={req.flagged}><DollarField value={v.before} onChange={set("before")} placeholder={DISCOUNT_DEFAULTS.before} /></Req></FieldRow>
          <FieldRow label="Discount">
            {fixed
              ? <Req name="discount" flagged={req.flagged}><DollarField value={v.discount} onChange={set("discount")} placeholder={DISCOUNT_DEFAULTS.discount} /></Req>
              : <Req name="discount" flagged={req.flagged}><PercentField value={v.discount} onChange={set("discount")} placeholder={DISCOUNT_DEFAULTS.discount} /></Req>}
          </FieldRow>
          <FieldRow label="Price after discount"><DollarField value={v.after} onChange={set("after")} /></FieldRow>
          {!fixed && <FieldRow label="You saved"><DollarField value={v.saved} onChange={set("saved")} /></FieldRow>}
          <fieldset style={{ border: "none", padding: 0, margin: "10px 0 0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <legend style={{ float: "left", fontSize: 13.5, color: "var(--text-primary)", marginRight: 16, padding: 0 }}>Discount type</legend>
            <div>
              <RadioOption checked={!fixed} onChange={() => setType("percent")} label="Percent off" />
              <RadioOption checked={fixed} onChange={() => setType("fixed")} label="Fixed amount off" />
            </div>
          </fieldset>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={() => { req.clear(); setV(EMPTY); setResult(null); }} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
        </div>
      </div>
    </div>
  );
}
