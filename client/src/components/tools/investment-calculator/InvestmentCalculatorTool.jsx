import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import InvestmentPieChart from "./InvestmentPieChart";
import InvestmentBarChart from "./InvestmentBarChart";
import {
  calculateEndAmount, calculateAdditionalContribution, calculateReturnRate,
  calculateStartingAmount, calculateInvestmentLength,
  COMPOUND_OPTIONS, formatCurrency, formatPercent,
} from "../../../utils/investmentCalculatorEngine";

// Reference's own default values, shown as placeholder hints only —
// fields start blank, Calculate falls back to these (the established
// convention across every calculator in this app).
const DEFAULTS = {
  target: "1000000", startingAmount: "20000", years: "10", returnRate: "6",
  compound: "annually", contribution: "1000",
};

const TABS = [
  { key: "endamount", label: "End Amount" },
  { key: "contributeamount", label: "Additional Contribution" },
  { key: "returnrate", label: "Return Rate" },
  { key: "startingamount", label: "Starting Amount" },
  { key: "investlength", label: "Investment Length" },
];

// Which of the 6 shared fields each tab shows — every tab hides exactly
// the one field it's solving for; only "Return Rate" additionally hides
// Compound (it has no selector at all — confirmed live that the
// reference's Return Rate tab ignores Compound entirely either way).
const TAB_FIELDS = {
  endamount: { target: false, startingAmount: true, years: true, returnRate: true, compound: true, contribution: true },
  contributeamount: { target: true, startingAmount: true, years: true, returnRate: true, compound: true, contribution: false },
  returnrate: { target: true, startingAmount: true, years: true, returnRate: false, compound: false, contribution: true },
  startingamount: { target: true, startingAmount: false, years: true, returnRate: true, compound: true, contribution: true },
  investlength: { target: true, startingAmount: true, years: false, returnRate: true, compound: true, contribution: true },
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 22 }}
      />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
    </div>
  );
}

function toTableRows(rows) {
  return rows.map((row) => ({ period: row.period, deposit: row.deposit, interest: row.interest, balance: row.balance }));
}
const SCHEDULE_COLUMNS = [
  { key: "deposit", label: "Deposit" },
  { key: "interest", label: "Interest" },
  { key: "balance", label: "Ending balance" },
];

export default function InvestmentCalculatorTool() {
  const [activeTab, setActiveTab] = useState("endamount");
  const [target, setTarget] = useState("");
  const [startingAmount, setStartingAmount] = useState("");
  const [years, setYears] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [compound, setCompound] = useState(DEFAULTS.compound);
  const [contribution, setContribution] = useState("");
  const [contributeAt, setContributeAt] = useState("end");
  const [contributionFrequency, setContributionFrequency] = useState("monthly");
  const [result, setResult] = useState(null);
  const [scheduleView, setScheduleView] = useState("annual");

  const fields = TAB_FIELDS[activeTab];

  function switchTab(key) {
    setActiveTab(key);
    setResult(null);
  }

  function calculate() {
    const shared = {
      startingAmount: startingAmount || DEFAULTS.startingAmount,
      years: years || DEFAULTS.years,
      annualRatePercent: returnRate || DEFAULTS.returnRate,
      compound,
      contribution: contribution || DEFAULTS.contribution,
      contributeAt,
      contributionFrequency,
    };
    let r;
    if (activeTab === "endamount") {
      r = { mode: "endamount", ...calculateEndAmount(shared) };
    } else if (activeTab === "contributeamount") {
      r = { mode: "contributeamount", ...calculateAdditionalContribution({ targetAmount: target || DEFAULTS.target, ...shared }) };
    } else if (activeTab === "returnrate") {
      r = { mode: "returnrate", ...calculateReturnRate({ targetAmount: target || DEFAULTS.target, ...shared }) };
    } else if (activeTab === "startingamount") {
      r = { mode: "startingamount", ...calculateStartingAmount({ targetAmount: target || DEFAULTS.target, ...shared }) };
    } else {
      r = { mode: "investlength", ...calculateInvestmentLength({ targetAmount: target || DEFAULTS.target, ...shared }) };
    }
    setResult(r);
    setScheduleView("annual");
  }

  function clear() {
    setTarget(""); setStartingAmount(""); setYears(""); setReturnRate("");
    setCompound(DEFAULTS.compound); setContribution("");
    setContributeAt("end"); setContributionFrequency("monthly");
    setResult(null);
  }

  const contributionNoun = contributionFrequency === "monthly" ? "month" : "year";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tab strip spans the FULL width, above both columns — matching
          the reference's own layout (its tab menu sits above the entire
          two-column area, not squeezed above just the narrower input
          column, which is what left "Investment Length" wrapping
          awkwardly when this was nested inside the input column below). */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchTab(tab.key)}
            style={{
              flex: "1 1 auto", padding: "10px 8px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)",
              cursor: "pointer", border: "1px solid var(--border)",
              background: activeTab === tab.key ? "var(--accent)" : "var(--bg-white)",
              color: activeTab === tab.key ? "#fff" : "var(--text-primary)",
              position: "relative", zIndex: activeTab === tab.key ? 1 : 0, whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 24 }}>
            {fields.target && (
              <div style={fieldWrap}>
                <FieldLabel>Your Target</FieldLabel>
                <DollarField value={target} onChange={setTarget} placeholder={DEFAULTS.target} />
              </div>
            )}
            {fields.startingAmount && (
              <div style={fieldWrap}>
                <FieldLabel>Starting Amount</FieldLabel>
                <DollarField value={startingAmount} onChange={setStartingAmount} placeholder={DEFAULTS.startingAmount} />
              </div>
            )}
            {fields.years && (
              <div style={fieldWrap}>
                <FieldLabel>After</FieldLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} style={{ flex: 1 }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>years</span>
                </div>
              </div>
            )}
            {fields.returnRate && (
              <div style={fieldWrap}>
                <FieldLabel>Return Rate</FieldLabel>
                <PercentField value={returnRate} onChange={setReturnRate} placeholder={DEFAULTS.returnRate} />
              </div>
            )}
            {fields.compound && (
              <div style={fieldWrap}>
                <FieldLabel>Compound</FieldLabel>
                <SelectField value={compound} onChange={setCompound} options={COMPOUND_OPTIONS} />
              </div>
            )}
            {fields.contribution && (
              <div style={fieldWrap}>
                <FieldLabel>Additional Contribution</FieldLabel>
                <DollarField value={contribution} onChange={setContribution} placeholder={DEFAULTS.contribution} />
              </div>
            )}

            <div style={{ ...fieldWrap, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-secondary)" }}>Contribute at the</span>
                {[["beginning", "beginning"], ["end", "end"]].map(([value, label]) => (
                  <label key={value} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                    <input type="radio" name="contributeAt" checked={contributeAt === value} onChange={() => setContributeAt(value)} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-secondary)" }}>of each</span>
                {[["monthly", "month"], ["annually", "year"]].map(([value, label]) => (
                  <label key={value} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                    <input type="radio" name="contributionFrequency" checked={contributionFrequency === value} onChange={() => setContributionFrequency(value)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see your investment breakdown.
                </p>
              ) : (
                <>
                  {result.mode === "contributeamount" && (
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      You will need to contribute <strong style={{ color: "var(--success)" }}>{formatCurrency(result.contribution)}</strong> at the {contributeAt} of each {contributionNoun} to reach the target of {formatCurrency(target || DEFAULTS.target, { decimals: 2 })}.
                    </p>
                  )}
                  {result.mode === "returnrate" && (
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      You will need an annual return rate of <strong style={{ color: "var(--success)" }}>{formatPercent(result.annualRatePercent)}</strong> to reach the target of {formatCurrency(target || DEFAULTS.target, { decimals: 2 })}.
                    </p>
                  )}
                  {result.mode === "startingamount" && (
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      You will need to invest <strong style={{ color: "var(--success)" }}>{formatCurrency(result.startingAmountSolved)}</strong> at the beginning to reach the target of {formatCurrency(target || DEFAULTS.target, { decimals: 2 })}.
                    </p>
                  )}
                  {result.mode === "investlength" && (
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      You will need to invest <strong style={{ color: "var(--success)" }}>{result.years.toFixed(3)}</strong> years to reach the target of {formatCurrency(target || DEFAULTS.target, { decimals: 2 })}.
                    </p>
                  )}

                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>End Balance</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(result.endBalance)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Starting Amount</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.startingAmount)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Contributions</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalContributions)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Interest</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <InvestmentPieChart segments={[
                      { label: "Starting Amount", value: result.startingAmount, color: "#2b7ddb" },
                      { label: "Total Contributions", value: result.totalContributions, color: "#8bbc21" },
                      { label: "Interest", value: result.totalInterest, color: "#910000" },
                    ]} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: 0 }}>
            Accumulation Schedule
          </p>
          <div style={{ display: "flex", gap: 18, fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {[["annual", "Annual Schedule"], ["monthly", "Monthly Schedule"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScheduleView(key)}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: scheduleView === key ? "var(--text-primary)" : "var(--accent)",
                  textDecoration: scheduleView === key ? "none" : "underline",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 380px", minWidth: 300 }}>
              <LoanScheduleTable
                title={scheduleView === "annual" ? "Annual Schedule" : "Monthly Schedule"}
                periodLabel={scheduleView === "annual" ? "Year" : "Month"}
                schedule={toTableRows(scheduleView === "annual" ? result.annualSchedule : result.monthlySchedule)}
                columns={SCHEDULE_COLUMNS}
              />
            </div>
            <div className="card" style={{ flex: "1 1 380px", minWidth: 320, padding: 20 }}>
              <InvestmentBarChart barData={result.barData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
