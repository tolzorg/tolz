import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import InvestmentBarChart from "../investment-calculator/InvestmentBarChart";
import {
  calculateSimpleInterest, DEFAULTS, TAB_FIELDS, RATE_BASE_OPTIONS, TERM_BASE_OPTIONS, formatMoney,
} from "../../../utils/simpleInterestCalculatorEngine";

const TABS = [
  { key: "balance", label: "Balance" },
  { key: "principal", label: "Principal" },
  { key: "term", label: "Term" },
  { key: "rate", label: "Rate" },
];

const BAR_LABELS = { starting: "Principal", contributions: null, interest: "Interest" };
const SCHEDULE_COLUMNS = [
  { key: "interest", label: "Interest" },
  { key: "balance", label: "Balance" },
];

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", textAlign: "center", margin: "0 0 10px" };
const stepCell = { padding: "2px 8px 2px 0", fontSize: 13.5, color: "var(--text-primary)", verticalAlign: "top" };

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

function pieSegments(result) {
  return [
    { label: "Principal", value: result.principal, color: "#2b7ddb" },
    { label: "Interest", value: result.interest, color: "#8bbc21" },
  ];
}

function Results({ result }) {
  return (
    <>
      <table style={{ borderCollapse: "collapse", marginBottom: 14 }}>
        <tbody>
          {result.headline.map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: "2px 14px 2px 0", fontSize: 16, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{label}</td>
              <td style={{ padding: "2px 0", fontSize: 16, fontWeight: 800, color: "var(--success)", fontFamily: "var(--font-display)", textAlign: "right" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 4px" }}>Calculation steps:</p>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {result.steps.map(([left, right], i) => (
            <tr key={i}>
              <td style={{ ...stepCell, textAlign: left === "=" ? "right" : "left", whiteSpace: "nowrap" }}>{left}</td>
              <td style={{ ...stepCell, overflowWrap: "anywhere" }}>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Without a schedule (term ≤ 2 or ≥ 100 periods) the reference
          shows the donut alone, directly under the results. */}
      {result.showPie && !result.growth && (
        <div style={{ marginTop: 18 }}>
          <InvestmentPieChart segments={pieSegments(result)} />
        </div>
      )}
    </>
  );
}

export default function SimpleInterestCalculatorTool() {
  const [activeTab, setActiveTab] = useState("balance");
  const [balance, setBalance] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [rateBase, setRateBase] = useState("y");
  const [term, setTerm] = useState("");
  const [termBase, setTermBase] = useState("y");
  const [result, setResult] = useState(null);

  const fields = TAB_FIELDS[activeTab];

  function switchTab(key) {
    setActiveTab(key);
    setResult(null);
  }

  function calculate() {
    setResult(calculateSimpleInterest({
      mode: activeTab,
      balance: balance || DEFAULTS.balance,
      principal: principal || DEFAULTS.principal,
      rate: rate || DEFAULTS.rate,
      rateBase,
      term: term || DEFAULTS.term,
      termBase,
    }));
  }

  function clear() {
    setBalance(""); setPrincipal(""); setRate(""); setRateBase("y");
    setTerm(""); setTermBase("y"); setResult(null);
  }

  const growth = result?.growth;
  const unitWord = growth?.unit === "m" ? "months" : "years";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 300 }}>
          <div role="tablist" aria-label="Solve for" style={{ display: "flex", flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => switchTab(tab.key)}
                style={{
                  flex: "1 1 auto", padding: "10px 8px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: activeTab === tab.key ? "var(--accent)" : "var(--bg-white)",
                  color: activeTab === tab.key ? "#fff" : "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {fields.balance && (
              <FieldRow label="End balance" fieldWidth={230}>
                <DollarField value={balance} onChange={setBalance} placeholder={DEFAULTS.balance} />
              </FieldRow>
            )}
            {fields.principal && (
              <FieldRow label="Principal" fieldWidth={230}>
                <DollarField value={principal} onChange={setPrincipal} placeholder={DEFAULTS.principal} />
              </FieldRow>
            )}
            {fields.rate && (
              <FieldRow label="Interest rate" fieldWidth={230}>
                <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
                  <PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} />
                  <SelectField value={rateBase} onChange={setRateBase} options={RATE_BASE_OPTIONS} style={{ width: 108, flexShrink: 0 }} />
                </div>
              </FieldRow>
            )}
            {fields.term && (
              <FieldRow label="Term" fieldWidth={230}>
                <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
                  <TextField value={term} onChange={setTerm} placeholder={DEFAULTS.term} style={{ flex: 1, minWidth: 0 }} />
                  <SelectField value={termBase} onChange={setTermBase} options={TERM_BASE_OPTIONS} style={{ width: 108, flexShrink: 0 }} />
                </div>
              </FieldRow>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "16px 18px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Pick what to solve for, fill in the other values and click <strong>Calculate</strong>.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : result.message ? (
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{result.message}</p>
            ) : result.empty ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                No result: 1 + rate × term equals 0 for these values, so the principal cannot be solved.
              </p>
            ) : (
              <Results result={result} />
            )}
          </div>
        </div>
      </div>

      {growth && (
        <>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            <div className="card" style={{ flex: "3 1 420px", minWidth: 300, padding: 16 }}>
              <p style={sectionTitle}>Balance Accumulation Graph</p>
              <InvestmentBarChart
                barData={growth.bars}
                labels={BAR_LABELS}
                tickLabels={growth.tickLabels}
                xAxisLabel={`Term in ${unitWord}`}
              />
            </div>
            <div className="card" style={{ flex: "1 1 260px", minWidth: 260, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={sectionTitle}>Breakdown</p>
              <InvestmentPieChart segments={pieSegments(result)} />
            </div>
          </div>

          <div style={{ maxWidth: 480, width: "100%", margin: "0 auto" }}>
            <LoanScheduleTable
              title="Schedule"
              periodLabel={growth.unit === "m" ? "Month" : "Year"}
              schedule={growth.schedule}
              columns={SCHEDULE_COLUMNS}
              formatValue={formatMoney}
            />
          </div>
        </>
      )}
    </div>
  );
}
