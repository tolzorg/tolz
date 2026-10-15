import { useState } from "react";
import { FieldLabel, ValueUnitField } from "../mortgage-calculator/MortgageFormControls";
import { DollarField, PercentField, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, Row, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import {
  calculateSimpleCommission, calculateTieredCommission, SIMPLE_DEFAULTS, TIERED_DEFAULTS, TIER_COUNT,
} from "../../../utils/commissionCalculatorEngine";

const S = SIMPLE_DEFAULTS;
const T = TIERED_DEFAULTS;
const header = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 6px" };
const intro = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 };
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)", lineHeight: 1.4 };
const muted = { fontSize: 13.5, color: "var(--text-muted)", margin: 0 };
const question = { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", margin: "10px 0 6px" };

const BASE_HINT = "A base commission is an amount that will be paid regardless of whether or not a sale occurs.";
const TIER_HINT = "A tiered commission structure is one in which the commission changes based on the sale price. For example, a sales rep earns 3% on sales up to $10,000. After surpassing that, the sales rep will earn 5% on the portion of the sales above $10,000.";

const emptyTiers = () => Array.from({ length: TIER_COUNT }, () => ({ to: "", rate: "", unit: "percent" }));
const withCommas = (t) => {
  const [int, dec] = t.split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${dec !== undefined ? `.${dec}` : ""}`;
};

function ResultCard({ children }) {
  return (
    <div className="card" style={{ flex: "1 1 340px", minWidth: 280, padding: 0, overflow: "hidden" }}>
      <div style={header}>Result</div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }} aria-live="polite">{children}</div>
    </div>
  );
}

function YesNo({ label, hint, value, onChange }) {
  return (
    <div style={question}>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div style={{ display: "flex", gap: 14 }}>
        <RadioOption checked={value} onChange={() => onChange(true)} label="Yes" />
        <RadioOption checked={!value} onChange={() => onChange(false)} label="No" />
      </div>
    </div>
  );
}

function SimpleCalculator() {
  const [v, setV] = useState({ price: "", rate: "", commission: "" });
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  // Which boxes are blank decides what gets solved, so the example is used only when all three are empty.
  const calculate = () => setResult(calculateSimpleCommission(Object.values(v).every((x) => x === "") ? S : v));

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 420, padding: 16 }}>
        <Row label="Sales Price"><DollarField value={v.price} onChange={set("price")} placeholder={S.price} /></Row>
        <Row label="Commission Rate"><PercentField value={v.rate} onChange={set("rate")} placeholder={S.rate} /></Row>
        <Row label="Commission"><DollarField value={v.commission} onChange={set("commission")} /></Row>
        <ButtonRow onCalculate={calculate} onClear={() => { setV({ price: "", rate: "", commission: "" }); setResult(null); }} />
      </div>
      <ResultCard>
        {!result && <p style={muted}>Enter any two of the three values, then click Calculate.</p>}
        {result?.errors && <ErrorPanel messages={result.errors} />}
        {result && !result.errors && (
          <>
            <p style={{ fontSize: 20, color: "var(--text-primary)", margin: 0, overflowWrap: "anywhere" }}>
              {result.label} = <strong style={{ color: "var(--success)" }}>{result.value}</strong>
            </p>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>Steps:</p>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 6, rowGap: 3, fontSize: 13.5, color: "var(--text-primary)" }}>
                {result.steps.map(([left, right], i) => (
                  <div key={i} style={{ display: "contents" }}>
                    <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>{left}</span>
                    <span style={{ overflowWrap: "anywhere" }}>{right}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </ResultCard>
    </div>
  );
}

function TieredCalculator() {
  const [price, setPrice] = useState("");
  const [hasBase, setHasBase] = useState(false);
  const [base, setBase] = useState("");
  const [baseUnit, setBaseUnit] = useState(T.baseUnit);
  const [varies, setVaries] = useState(true);
  const [fixed, setFixed] = useState("");
  const [fixedUnit, setFixedUnit] = useState(T.fixedUnit);
  const [tiers, setTiers] = useState(emptyTiers);
  const [result, setResult] = useState(null);
  const setTier = (i, key) => (value) => setTiers((p) => p.map((t, k) => (k === i ? { ...t, [key]: value } : t)));
  const placeholder = (i, key) => T.tiers[i]?.[key] || undefined;
  const tiersEmpty = tiers.every((t) => t.to === "" && t.rate === "");

  const calculate = () => {
    const visible = [price, ...(hasBase ? [base] : []), ...(varies ? tiers.flatMap((t) => [t.to, t.rate]) : [fixed])];
    const allEmpty = visible.every((x) => x === "");
    const exampleTiers = emptyTiers().map((t, i) => ({ ...t, ...T.tiers[i], unit: tiers[i].unit }));
    setResult(calculateTieredCommission({
      price: allEmpty ? T.price : price, hasBase, base: allEmpty ? T.base : base, baseUnit,
      varies, fixed: allEmpty ? T.fixed : fixed, fixedUnit, tiers: allEmpty ? exampleTiers : tiers,
    }));
  };
  const clear = () => {
    setPrice(""); setHasBase(false); setBase(""); setBaseUnit(T.baseUnit); setVaries(true);
    setFixed(""); setFixedUnit(T.fixedUnit); setTiers(emptyTiers()); setResult(null);
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 440, padding: 16 }}>
        <Row label="Sales Price"><DollarField value={price} onChange={setPrice} placeholder={T.price} /></Row>
        <YesNo label="Has a base commission?" hint={BASE_HINT} value={hasBase} onChange={setHasBase} />
        {hasBase && (
          <Row label="Base commission">
            <ValueUnitField value={base} unit={baseUnit} onValueChange={setBase} onUnitChange={setBaseUnit} placeholder={T.base} />
          </Row>
        )}
        <YesNo label="Commission varies with price?" hint={TIER_HINT} value={varies} onChange={setVaries} />
        {!varies && (
          <Row label="Commission">
            <ValueUnitField value={fixed} unit={fixedUnit} onValueChange={setFixed} onUnitChange={setFixedUnit} placeholder={T.fixed} />
          </Row>
        )}
        {varies && (
          <div style={{ margin: "4px 0 10px" }}>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 8px" }}>
              Please define the tiered commission structure below. Leave the &quot;To&quot; value blank if there is no upper limit.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(52px, auto) minmax(0, 1fr) minmax(0, 1.1fr)", columnGap: 6, rowGap: 6, alignItems: "center" }}>
              <FieldLabel>From:</FieldLabel><FieldLabel>To:</FieldLabel><FieldLabel>Commission</FieldLabel>
              {tiers.map((t, i) => {
                // "From" mirrors the previous row's "To", as typed (the first row starts at $0).
                // While the table is empty it echoes the example placeholders, muted like them.
                const typed = i === 0 ? "0" : tiers[i - 1].to;
                const example = !typed && tiersEmpty ? T.tiers[i - 1]?.to || "" : "";
                const prev = typed || example;
                return (
                  <div key={i} style={{ display: "contents" }}>
                    <span style={{ fontSize: 12.5, color: example ? "var(--text-muted)" : "var(--text-primary)", overflowWrap: "anywhere" }}>{prev !== "" ? `$${withCommas(prev)}` : ""}</span>
                    <DollarField value={t.to} onChange={setTier(i, "to")} placeholder={placeholder(i, "to")} />
                    <ValueUnitField value={t.rate} unit={t.unit} onValueChange={setTier(i, "rate")} onUnitChange={setTier(i, "unit")} placeholder={placeholder(i, "rate")} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <ButtonRow onCalculate={calculate} onClear={clear} />
      </div>
      <ResultCard>
        {!result && <p style={muted}>Enter the sales price and commission structure, then click Calculate.</p>}
        {result?.errors && <ErrorPanel messages={result.errors} />}
        {result && !result.errors && (
          <>
            <p style={{ fontSize: 20, color: "var(--text-primary)", margin: 0, overflowWrap: "anywhere" }}>
              Total commission: <strong style={{ color: "var(--success)" }}>{result.total}</strong>
            </p>
            <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" }}>
              <tbody>
                {result.rows.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 400, background: "var(--bg-muted)", overflowWrap: "anywhere" }}>{label}</th>
                    <td style={{ ...td, textAlign: "right", overflowWrap: "anywhere" }}>{value}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 700, background: "var(--bg-muted)" }}>Total:</th>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700, overflowWrap: "anywhere" }}>{result.total}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </ResultCard>
    </div>
  );
}

export default function CommissionCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <section aria-labelledby="commission-simple-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="commission-simple-title" style={sectionTitle}>Commission Calculator</h2>
        <p style={intro}>
          The Commission Calculator can compute any one of the following, given inputs for the remaining two: sales price, commission rate,
          or commission for a simple percentage commission structure.
        </p>
        <SimpleCalculator />
      </section>
      <section aria-labelledby="commission-tiered-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="commission-tiered-title" style={sectionTitle}>Tiered Commission Calculator</h2>
        <p style={intro}>
          This calculator can calculate more complex commission structures, including tiered commissions and commissions that include a base amount.
        </p>
        <TieredCalculator />
      </section>
    </div>
  );
}
