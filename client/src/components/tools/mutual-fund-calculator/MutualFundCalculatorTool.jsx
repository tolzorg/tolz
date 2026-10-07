import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { FieldLabel } from "../mortgage-calculator/MortgageFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateMutualFund, DEFAULTS } from "../../../utils/mutualFundCalculatorEngine";
import { formatMoney } from "../../../utils/simpleInterestCalculatorEngine";

const HINTS = {
  rate: "The annual rate of return you expect from the mutual fund. This is the rate of return before fees and charges. It typically varies across different funds and over time. Most funds provide historical data to help potential investors understand possible returns and risks.",
  sales: "The sales charge is a fee charged upfront when purchasing the fund, also known as a front-end load. It is typically a percentage of the investment amount and directly reduces the amount invested in the fund.",
  deferred: "The deferred sales charge is a fee charged when redeeming or selling the fund, also called a back-end load. It is typically a percentage of the lesser of the initial investment amount or the fund's value at redemption. In many cases, the deferred sales charge decreases with the length of the holding period and may eventually be reduced to zero if the fund is held long enough.",
  operating: "Operating expenses are the fees charged to keep the fund running. They are ongoing annual fees charged continuously as a percentage of the fund's balance. These expenses may include management fees, 12b-1 fees, and other administrative costs.",
  irr: "IRR is the annualized discount rate that considers all cash flows, including all fees. It is an annualized indicator of the investment's true return after all fees are accounted for.",
};

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

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

function ResultRow({ label, hint, value, strong }) {
  const weight = strong ? 700 : 400;
  return (
    <div style={rowStyle}>
      <span style={{ color: strong ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: weight, display: "flex", alignItems: "center", gap: 4 }}>
        {hint ? <FieldLabel hint={hint}>{label}</FieldLabel> : label}
      </span>
      <span style={{ color: "var(--text-primary)", fontWeight: weight, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Results({ r }) {
  return (
    <>
      <ResultRow label="Ending value" value={formatMoney(r.endingValue)} strong />
      {r.show.principal && (
        <>
          <ResultRow label="Total principal" value={formatMoney(r.principal)} />
          <ResultRow label="Total contributions" value={formatMoney(r.contributions)} />
        </>
      )}
      <ResultRow label="Net return" value={formatMoney(r.netReturn)} strong />
      {r.show.irr && <ResultRow label="Net IRR" hint={HINTS.irr} value={`${r.irr.toFixed(3)}% per year`} />}
      {r.show.sales && <ResultRow label="Sales charge" value={formatMoney(r.salesCharge)} />}
      {r.show.deferred && <ResultRow label="Deferred sales charge" value={formatMoney(r.deferredCharge)} />}
      {r.show.operating && <ResultRow label="Operating expenses" value={formatMoney(r.operating)} />}
      {r.show.totalFees && <ResultRow label="Total charges and fees" value={formatMoney(r.totalFees)} strong />}
      {r.show.pie && r.pie.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <InvestmentPieChart segments={r.pie} />
        </div>
      )}
    </>
  );
}

export default function MutualFundCalculatorTool() {
  const [investment, setInvestment] = useState("");
  const [annual, setAnnual] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [sales, setSales] = useState("");
  const [deferred, setDeferred] = useState("");
  const [operating, setOperating] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateMutualFund({
      investment: investment || DEFAULTS.investment,
      annual: annual || DEFAULTS.annual,
      monthly: monthly || DEFAULTS.monthly,
      rate: rate || DEFAULTS.rate,
      years: years || DEFAULTS.years,
      months: months || DEFAULTS.months,
      sales: sales || DEFAULTS.sales,
      deferred: deferred || DEFAULTS.deferred,
      operating: operating || DEFAULTS.operating,
    }));
  }

  function clear() {
    setInvestment(""); setAnnual(""); setMonthly(""); setRate(""); setYears(""); setMonths("");
    setSales(""); setDeferred(""); setOperating(""); setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
        The mutual fund calculator can be used to estimate the ending balance and net return of mutual funds. It can
        also calculate the internal rate of return (IRR) after accounting for charges and fees.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 380px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Initial investment" fieldWidth={220}><DollarField value={investment} onChange={setInvestment} placeholder={DEFAULTS.investment} /></FieldRow>
          <FieldRow label="Annual contribution" fieldWidth={220}><DollarField value={annual} onChange={setAnnual} placeholder={DEFAULTS.annual} /></FieldRow>
          <FieldRow label="Monthly contribution" fieldWidth={220}><DollarField value={monthly} onChange={setMonthly} placeholder={DEFAULTS.monthly} /></FieldRow>
          <FieldRow label="Rate of return" hint={HINTS.rate} suffix="/year" fieldWidth={220}>
            <PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} />
          </FieldRow>
          <FieldRow label="Holding length" fieldWidth={220}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, minWidth: 0 }}>
              <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} style={{ flex: 1, minWidth: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>years</span>
              <TextField value={months} onChange={setMonths} placeholder={DEFAULTS.months} style={{ flex: 1, minWidth: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>months</span>
            </div>
          </FieldRow>
          <FieldRow label="Sales charge" hint={HINTS.sales} fieldWidth={220}>
            <PercentField value={sales} onChange={setSales} placeholder={DEFAULTS.sales} />
          </FieldRow>
          <FieldRow label="Deferred sales charge" hint={HINTS.deferred} fieldWidth={220}>
            <PercentField value={deferred} onChange={setDeferred} placeholder={DEFAULTS.deferred} />
          </FieldRow>
          <FieldRow label="Operating expenses" hint={HINTS.operating} suffix="/year" fieldWidth={220}>
            <PercentField value={operating} onChange={setOperating} placeholder={DEFAULTS.operating} />
          </FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 340px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "12px 18px 16px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter your investment, contributions, expected return and the fund's charges, then click <strong>Calculate</strong>.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <Results r={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
