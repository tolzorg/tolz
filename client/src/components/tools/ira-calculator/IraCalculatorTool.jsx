import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import PensionLineChart from "../pension-calculator/PensionLineChart";
import GroupedScheduleTable from "../roth-ira-calculator/GroupedScheduleTable";
import { calculateIra, DEFAULTS, formatDollars } from "../../../utils/iraCalculatorEngine";

// Tooltips copied verbatim from the reference.
const HINTS = {
  contribution: "The before tax amount you plan to contribute to the IRA account each year. The maximum contribution limit is $7,000 for individuals under the age of 50 and increases to $8,000 for individuals aged 50 and above.",
  rate: "The expected average annual return you will earn on your money in the account.",
  taxNow: "The tax rate you pay on additional income. Please includes the combined federal and state/local marginal tax rates, if applicable.",
  taxRetirement: "The expected income tax rate after your retirement. Please includes the combined federal and state/local tax rates, if applicable.",
};

const SCHEDULE_GROUPS = [
  { label: "Traditional/SIMPLE/SEP IRA (Before Tax)", start: "beforeStart", end: "beforeEnd" },
  { label: "Traditional, SIMPLE, or SEP IRA (After Tax)", start: "afterStart", end: "afterEnd" },
  { label: "Roth IRA (After Tax)", start: "rothStart", end: "rothEnd" },
  { label: "Regular Taxable Savings (After Tax)", start: "taxableStart", end: "taxableEnd" },
];

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 10px" };
const cell = { padding: "6px 8px", fontSize: 13, textAlign: "right", borderBottom: "1px solid var(--border)", color: "var(--text-primary)" };

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

function ResultTable({ r }) {
  const rows = [
    [`Balance at age ${r.retirementAge}`, r.balances, false],
    [`Balance at age ${r.retirementAge} (after tax)`, r.afterTax, true],
  ];
  return (
    <table className="data-table data-table-head" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th />
          {["Traditional, SIMPLE, or SEP IRA", "Roth IRA", "Regular Taxable Savings"].map((h) => (
            <th key={h} style={{ ...cell, fontWeight: 700, fontSize: 12.5, verticalAlign: "bottom" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, values, strong]) => (
          <tr key={label}>
            <td style={{ ...cell, textAlign: "left", fontWeight: strong ? 700 : 400 }}>{label}</td>
            {[values.traditional, values.roth, values.taxable].map((value, i) => (
              <td key={i} style={{ ...cell, fontWeight: strong ? 700 : 400, whiteSpace: "nowrap" }}>{formatDollars(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function IraCalculatorTool() {
  const [balance, setBalance] = useState("");
  const [contribution, setContribution] = useState("");
  const [rate, setRate] = useState("");
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [taxNow, setTaxNow] = useState("");
  const [taxRetirement, setTaxRetirement] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateIra({
      balance: balance || DEFAULTS.balance,
      contribution: contribution || DEFAULTS.contribution,
      rate: rate || DEFAULTS.rate,
      currentAge: currentAge || DEFAULTS.currentAge,
      retirementAge: retirementAge || DEFAULTS.retirementAge,
      taxNow: taxNow || DEFAULTS.taxNow,
      taxRetirement: taxRetirement || DEFAULTS.taxRetirement,
    }));
  }

  function clear() {
    setBalance(""); setContribution(""); setRate(""); setCurrentAge("");
    setRetirementAge(""); setTaxNow(""); setTaxRetirement(""); setResult(null);
  }

  const ok = result && !result.errors;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Current balance"><DollarField value={balance} onChange={setBalance} placeholder={DEFAULTS.balance} /></FieldRow>
          <FieldRow label="Annual before tax contribution" hint={HINTS.contribution}><DollarField value={contribution} onChange={setContribution} placeholder={DEFAULTS.contribution} /></FieldRow>
          <FieldRow label="Expected rate of return" hint={HINTS.rate}><PercentField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} /></FieldRow>
          <FieldRow label="Current age"><TextField value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} /></FieldRow>
          <FieldRow label="Retirement age"><TextField value={retirementAge} onChange={setRetirementAge} placeholder={DEFAULTS.retirementAge} /></FieldRow>
          <FieldRow label="Current marginal tax rate" hint={HINTS.taxNow}><PercentField value={taxNow} onChange={setTaxNow} placeholder={DEFAULTS.taxNow} /></FieldRow>
          <FieldRow label="Expected tax rate in retirement" hint={HINTS.taxRetirement}><PercentField value={taxRetirement} onChange={setTaxRetirement} placeholder={DEFAULTS.taxRetirement} /></FieldRow>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <div className="card" style={{ flex: "1 1 420px", minWidth: 300, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 18px" }} aria-live="polite">
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
                Enter your balance, yearly contribution, expected return, ages and tax rates, then click <strong>Calculate</strong> to compare a Traditional IRA, a Roth IRA and a regular taxable account.
              </p>
            ) : result.errors ? (
              <ErrorPanel messages={result.errors} />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}><ResultTable r={result} /></div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "14px 0 0" }}>
                  {result.sentences.join(" ")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {ok && result.showChart && (
        <div className="card" style={{ padding: 16 }}>
          <p style={{ ...sectionTitle, fontSize: 15, textAlign: "center" }}>Balance Accumulation Graph</p>
          <PensionLineChart series={result.chart} xLabel="Age" />
        </div>
      )}

      {ok && (
        <div>
          <h2 style={sectionTitle}>Annual Schedule</h2>
          <GroupedScheduleTable rows={result.rows} groups={SCHEDULE_GROUPS} formatValue={formatDollars} />
        </div>
      )}
    </div>
  );
}
