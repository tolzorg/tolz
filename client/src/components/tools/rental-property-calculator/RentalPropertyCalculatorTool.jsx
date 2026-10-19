import { useState } from "react";
import { FieldLabel } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, YearsField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateRentalProperty, RENTAL_DEFAULTS } from "../../../utils/rentalPropertyCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = RENTAL_DEFAULTS;
const TEXT_KEYS = Object.keys(D).filter((k) => typeof D[k] === "string");
const EMPTY = Object.fromEntries(TEXT_KEYS.map((k) => [k, ""]));
const LOAN_KEYS = ["downPayment", "interestRate", "loanTerm"];
const REPAIR_KEYS = ["repairCost", "afterRepairValue"];
const GOOD = "var(--success)";
const BAD = "#dc2626";

const sectionTitle = { background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-display)", padding: "7px 10px", borderRadius: "var(--radius-sm)", margin: "4px 0 10px" };
const resultTitle = { fontWeight: 700, fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px" };
// Full grid like the reference's tables: every cell bordered, labels shaded.
const td = { padding: "5px 10px", fontSize: 13.5, color: "var(--text-primary)", verticalAlign: "middle", border: "1px solid var(--border)", lineHeight: 1.4, textAlign: "right", whiteSpace: "nowrap" };
const th = { ...td, background: "var(--bg-muted)", fontWeight: 700, textAlign: "center", whiteSpace: "normal" };
const labelTd = { ...td, background: "var(--bg-muted)", textAlign: "left", fontWeight: 400, whiteSpace: "normal" };
const tableStyle = { borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%" };
const srOnly = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

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

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4, marginBottom: 8 }}>
      <div style={{ flex: "1 1 130px", minWidth: 0 }}><FieldLabel>{label}</FieldLabel></div>
      <div style={{ flex: "1 1 200px", maxWidth: 250, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function YesNo({ label, name, value, onChange }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "2px 0 10px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
      <legend style={{ float: "left", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginRight: 14, padding: 0 }}>{label}</legend>
      {[["Yes", true], ["No", false]].map(([text, v]) => (
        <label key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer", fontWeight: value === v ? 700 : 400 }}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          {text}
        </label>
      ))}
    </fieldset>
  );
}

/** Amount plus its yearly increase, as in the reference's two-column blocks. */
function GrowRow({ label, amount, increase, v, set }) {
  return (
    <Row label={label}>
      <DollarField value={v[amount]} onChange={set(amount)} placeholder={D[amount]} style={{ minWidth: 0 }} />
      <div style={{ flex: "0 0 84px" }}><PercentField value={v[increase]} onChange={set(increase)} placeholder={D[increase]} /></div>
    </Row>
  );
}

function ColumnHeads({ first, second }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, margin: "-2px 0 6px" }}>
      <div style={{ flex: "1 1 200px", maxWidth: 250, display: "flex", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>
        <span style={{ flex: 1, textAlign: "center" }}>{first}</span>
        <span style={{ flex: "0 0 84px", textAlign: "center" }}>{second}</span>
      </div>
    </div>
  );
}

function Results({ r }) {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <p style={resultTitle}>{r.holdingLabel}</p>
          <div style={{ overflowX: "auto", position: "relative" }}>
            <table className="data-table data-table--framed" style={tableStyle}>
              <tbody>
                {r.summary.map((s) => (
                  <tr key={s.label}>
                    <th scope="row" style={{ ...labelTd, fontSize: s.big ? 14.5 : 13.5 }}>{s.label}</th>
                    <td style={{ ...td, textAlign: "left", fontSize: s.big ? 14.5 : 13.5 }}>
                      {s.big ? <strong style={{ color: GOOD }}>{s.value}</strong> : s.value}{s.suffix}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <p style={resultTitle}>First Year Income and Expense</p>
          <div style={{ overflowX: "auto", position: "relative" }}>
            <table className="data-table data-table--framed" style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}><span style={srOnly}>Item</span></th>
                  <th style={th}>Monthly</th>
                  <th style={th}>Annual</th>
                </tr>
              </thead>
              <tbody>
                {r.firstYear.map((x) => (
                  <tr key={x.label}>
                    <th scope="row" style={labelTd}>{x.label}:</th>
                    <td style={td}>{x.monthly}</td>
                    <td style={td}>{x.annual}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" style={labelTd}>Cash Flow:</th>
                  {[r.cashFlow.monthly, r.cashFlow.annual].map((x, k) => (
                    <td key={k} style={td}><strong style={{ color: r.cashFlow.negative ? BAD : "inherit" }}>{x}</strong></td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" style={labelTd}>Net Operating Income (NOI):</th>
                  <td style={td}>{r.noi.monthly}</td>
                  <td style={td}>{r.noi.annual}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {r.pie && (
        <div style={{ marginTop: 18 }}>
          <p style={resultTitle}>First Year Expense Breakdown</p>
          {/* Thin slices sit side by side and their ring labels collide, so the
              ring labels only slices ≥ 5% and the legend carries every percent. */}
          <InvestmentPieChart
            segments={r.pie.map((p) => ({ ...p, label: `${p.label} (${p.percent}%)` }))}
            labelText={(s, pct) => (pct >= 5 ? `${s.percent}%` : null)}
          />
        </div>
      )}

      <p style={{ ...resultTitle, marginTop: 18 }}>Breakdown Over Time</p>
      <div style={{ overflowX: "auto", position: "relative" }}>
        <table className="data-table data-table--framed" style={tableStyle}>
          <thead>
            <tr>
              {["Year", "Annual Income", "Mortgage", "Expenses", "Cash Flow", "Cash on Cash Return", "Equity Accumulated"].map((h) => (
                <th key={h} rowSpan={2} style={th}>{h}</th>
              ))}
              <th colSpan={2} style={th}>If Sold at Year End</th>
            </tr>
            <tr>
              <th style={th}>Cash to Receive</th>
              <th style={th}>Return (IRR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" style={labelTd}>Begin</th>
              <td style={td} /><td style={td} /><td style={td} />
              <td style={td}>{r.begin.replace("$-", "-$")}</td>
              <td style={td} /><td style={td} /><td style={td} /><td style={td} />
            </tr>
            {r.rows.map((x) => (
              <tr key={x.year}>
                <th scope="row" style={labelTd}>{x.year}</th>
                {[x.income, x.mortgage, x.expense, x.cashFlow, x.coc, x.equity, x.cashToReceive, x.irr].map((c, k) => <td key={k} style={td}>{c}</td>)}
              </tr>
            ))}
            <tr>
              <th scope="row" style={{ ...labelTd, fontWeight: 700 }}>Total</th>
              {[r.totals.income, r.totals.mortgage, r.totals.expense, r.totals.cashFlow, r.totals.coc].map((c, k) => <td key={k} style={{ ...td, fontWeight: 700 }}>{c}</td>)}
              <td style={td} /><td style={td} /><td style={td} />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function RentalPropertyCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [useLoan, setUseLoan] = useState(D.useLoan);
  const [needRepair, setNeedRepair] = useState(D.needRepair);
  const [knowSellPrice, setKnowSellPrice] = useState(D.knowSellPrice);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  // The example applies only while every visible box is empty; otherwise a
  // blank box is an error, exactly as on the reference.
  const req = useRequiredFields();
  const calculate = () => {
    const visible = TEXT_KEYS.filter((k) => (useLoan || !LOAN_KEYS.includes(k))
      && (needRepair || !REPAIR_KEYS.includes(k))
      && k !== (knowSellPrice ? "appreciation" : "sellPrice"));
    setResult(req.evaluate(pickFields(v, visible), (fill) => calculateRentalProperty({ ...withFill(v, D, fill), useLoan, needRepair, knowSellPrice })));
  };
  const clear = () => {
    req.clear(); setV(EMPTY); setUseLoan(D.useLoan); setNeedRepair(D.needRepair); setKnowSellPrice(D.knowSellPrice); setResult(null);
  };

  let body;
  if (!result) body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter the property details, then click Calculate.</p>;
  else if (result.errors) body = <ErrorPanel messages={result.errors} />;
  else body = <Results r={result} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 380px", minWidth: 280, padding: 18 }}>
          <div style={sectionTitle}>Purchase</div>
          <Row label="Purchase Price"><Req name="price" flagged={req.flagged}><DollarField value={v.price} onChange={set("price")} placeholder={D.price} /></Req></Row>
          <YesNo label="Use Loan?" name="rp-use-loan" value={useLoan} onChange={setUseLoan} />
          {useLoan && (
            <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--border)", marginBottom: 8 }}>
              <Row label="Down Payment"><Req name="downPayment" flagged={req.flagged}><PercentField value={v.downPayment} onChange={set("downPayment")} placeholder={D.downPayment} /></Req></Row>
              <Row label="Interest Rate"><Req name="interestRate" flagged={req.flagged}><PercentField value={v.interestRate} onChange={set("interestRate")} placeholder={D.interestRate} /></Req></Row>
              <Row label="Loan Term"><Req name="loanTerm" flagged={req.flagged}><YearsField value={v.loanTerm} onChange={set("loanTerm")} placeholder={D.loanTerm} /></Req></Row>
            </div>
          )}
          <Row label="Closing Cost"><Req name="closingCost" flagged={req.flagged}><DollarField value={v.closingCost} onChange={set("closingCost")} placeholder={D.closingCost} /></Req></Row>
          <YesNo label="Need Repairs?" name="rp-need-repair" value={needRepair} onChange={setNeedRepair} />
          {needRepair && (
            <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--border)", marginBottom: 8 }}>
              <Row label="Repair Cost"><Req name="repairCost" flagged={req.flagged}><DollarField value={v.repairCost} onChange={set("repairCost")} placeholder={D.repairCost} /></Req></Row>
              <Row label="Value after Repairs"><Req name="afterRepairValue" flagged={req.flagged}><DollarField value={v.afterRepairValue} onChange={set("afterRepairValue")} placeholder={D.afterRepairValue} /></Req></Row>
            </div>
          )}

          <div style={{ ...sectionTitle, marginTop: 16 }}>Recurring Operating Expenses</div>
          <ColumnHeads first="Annual" second="Annual Increase" />
          <GrowRow label="Property Tax" amount="tax" increase="taxIncrease" v={v} set={set} />
          <GrowRow label="Total Insurance" amount="insurance" increase="insuranceIncrease" v={v} set={set} />
          <GrowRow label="HOA Fee" amount="hoa" increase="hoaIncrease" v={v} set={set} />
          <GrowRow label="Maintenance" amount="maintenance" increase="maintenanceIncrease" v={v} set={set} />
          <GrowRow label="Other Costs" amount="otherCost" increase="otherCostIncrease" v={v} set={set} />
        </div>

        <div className="card" style={{ flex: "1 1 380px", minWidth: 280, padding: 18 }}>
          <div style={sectionTitle}>Income</div>
          <ColumnHeads first="" second="Annual Increase" />
          <GrowRow label="Monthly Rent" amount="rent" increase="rentIncrease" v={v} set={set} />
          <GrowRow label="Other Monthly Income" amount="otherIncome" increase="otherIncomeIncrease" v={v} set={set} />
          <Row label="Vacancy Rate"><Req name="vacancy" flagged={req.flagged}><PercentField value={v.vacancy} onChange={set("vacancy")} placeholder={D.vacancy} /></Req></Row>
          <Row label="Management Fee"><Req name="management" flagged={req.flagged}><PercentField value={v.management} onChange={set("management")} placeholder={D.management} /></Req></Row>

          <div style={{ ...sectionTitle, marginTop: 16 }}>Sell</div>
          <YesNo label="Do You Know the Sell Price?" name="rp-know-sell" value={knowSellPrice} onChange={setKnowSellPrice} />
          {knowSellPrice ? (
            <Row label="Sell Price"><Req name="sellPrice" flagged={req.flagged}><DollarField value={v.sellPrice} onChange={set("sellPrice")} placeholder={D.sellPrice} /></Req></Row>
          ) : (
            <Row label="Value Appreciation">
              <Req name="appreciation" flagged={req.flagged}><PercentField value={v.appreciation} onChange={set("appreciation")} placeholder={D.appreciation} /></Req>
              <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>per year</span>
            </Row>
          )}
          <Row label="Holding Length"><Req name="holding" flagged={req.flagged}><YearsField value={v.holding} onChange={set("holding")} placeholder={D.holding} /></Req></Row>
          <Row label="Cost to Sell"><Req name="sellCost" flagged={req.flagged}><PercentField value={v.sellCost} onChange={set("sellCost")} placeholder={D.sellCost} /></Req></Row>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Results</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
