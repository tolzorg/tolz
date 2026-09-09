import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import LoanScheduleTable from "../loan-calculator/LoanScheduleTable";
import FinanceLineChart from "./FinanceLineChart";
import {
  calculateFV, calculatePMT, calculateIY, calculateN, calculatePV,
  DEFAULTS, formatCurrency, formatPercent, formatNumber,
} from "../../../utils/financeCalculatorEngine";

// The 5 tabs, in the reference's own order. Each one solves for the
// field it's named after, and hides exactly that field from the input
// list — the other 4 fields always appear in this same fixed order
// (N, I/Y, PV, PMT, FV), matching the reference's own form layout.
const TABS = [
  { key: "fv", label: "FV" },
  { key: "pmt", label: "PMT" },
  { key: "iy", label: "I/Y" },
  { key: "n", label: "N" },
  { key: "pv", label: "PV" },
];

const FIELD_DEFS = [
  { key: "n", label: "N (# of periods)", kind: "number" },
  { key: "iy", label: "I/Y (Interest per year)", kind: "percent" },
  { key: "pv", label: "PV (Present Value)", kind: "dollar" },
  { key: "pmt", label: "PMT (Periodic Payment)", kind: "dollar" },
  { key: "fv", label: "FV (Future Value)", kind: "dollar" },
];

const RESULT_LABELS = { fv: "FV", pmt: "PMT", iy: "I/Y", n: "N", pv: "PV" };

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 };

// Allows a leading "-" through (the reference's own PMT/FV defaults are
// negative, e.g. "$-2,000") — the site's other DollarField helpers strip
// every non-digit character including the sign, which doesn't work here.
function stripToNumberString(input) {
  const raw = String(input ?? "");
  const negative = raw.trim().startsWith("-");
  let cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return (negative ? "-" : "") + cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned || cleaned === "-") return cleaned;
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;
  const [intPart, decPart] = body.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  return (negative ? "-" : "") + formatted;
}

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19 }}
      />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 26 }} />
      <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>%</span>
    </div>
  );
}

// The I/Y result is shown as up to 3 equivalent-rate lines whenever P/Y
// or C/Y isn't 1 (see financeCalculatorEngine.js's calculateIY for the
// full derivation, verified against 4 live reference combinations) —
// plain "I/Y = X%" when both are 1, otherwise an APR line (skipped only
// when C/Y = 1, since then it's identical to the APY line), an APY
// line (skipped only when C/Y = 1, since then the APR line already IS
// the APY), and an I/period line (skipped when P/Y = 1, since then the
// per-period rate already IS the APY).
function iyResultLines(result, py, cy) {
  const pyNum = Number(py) || 1;
  const cyNum = Number(cy) || 1;
  if (pyNum === 1 && cyNum === 1) {
    return [{ value: formatPercent(result.iy), suffix: "" }];
  }
  const lines = [];
  if (cyNum !== 1) {
    lines.push({ value: formatPercent(result.iy), suffix: ` if interest compound ${cyNum} times per year (APR)` });
    lines.push({ value: formatPercent(result.ear), suffix: " if interest compound once per year (APY)" });
  } else {
    lines.push({ value: formatPercent(result.iy), suffix: " interest per year (APY)" });
  }
  if (pyNum !== 1) {
    lines.push({ label: "I/period", value: formatPercent(result.periodicRatePct), suffix: " interest per period" });
  }
  return lines;
}

function toScheduleRows(schedule) {
  // Round a fractional final period's label to a readable 4 decimals for
  // display — the reference itself renders that row's raw, unrounded
  // float (e.g. "9.6040204965701"), which reads as a display quirk
  // rather than something worth reproducing exactly.
  return schedule.map((row) => ({
    period: Number.isInteger(row.period) ? row.period : Number(row.period.toFixed(4)),
    pv: row.pv, pmt: row.pmt, interest: row.interest, fv: row.fv,
  }));
}
const SCHEDULE_COLUMNS = [
  { key: "pv", label: "PV" },
  { key: "pmt", label: "PMT" },
  { key: "interest", label: "Interest" },
  { key: "fv", label: "FV" },
];

export default function FinanceCalculatorTool() {
  const [activeTab, setActiveTab] = useState("fv");
  const [n, setN] = useState("");
  const [iy, setIy] = useState("");
  const [pv, setPv] = useState("");
  const [pmt, setPmt] = useState("");
  const [fv, setFv] = useState("");
  const [py, setPy] = useState(DEFAULTS.py);
  const [cy, setCy] = useState(DEFAULTS.cy);
  const [pmtAt, setPmtAt] = useState(DEFAULTS.pmtAt);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [result, setResult] = useState(null);

  function switchTab(key) {
    setActiveTab(key);
    setResult(null);
  }

  function calculate() {
    const params = {
      n: Number(n || DEFAULTS.n),
      iy: Number(iy || DEFAULTS.iy),
      pv: Number(pv || DEFAULTS.pv),
      pmt: Number(pmt || DEFAULTS.pmt),
      fv: Number(fv || DEFAULTS.fv),
      py: Number(py || DEFAULTS.py),
      cy: Number(cy || DEFAULTS.cy),
      due: pmtAt === "beginning",
    };
    let r;
    if (activeTab === "fv") r = calculateFV(params);
    else if (activeTab === "pmt") r = calculatePMT(params);
    else if (activeTab === "iy") r = calculateIY(params);
    else if (activeTab === "n") r = calculateN(params);
    else r = calculatePV(params);
    setResult(r);
  }

  function clear() {
    setN(""); setIy(""); setPv(""); setPmt(""); setFv("");
    setPy(DEFAULTS.py); setCy(DEFAULTS.cy); setPmtAt(DEFAULTS.pmtAt);
    setSettingsOpen(false);
    setResult(null);
  }

  const fieldSetters = { n: setN, iy: setIy, pv: setPv, pmt: setPmt, fv: setFv };
  const fieldValues = { n, iy, pv, pmt, fv };

  const headlineValue = result
    ? activeTab === "iy" ? formatPercent(result.iy)
      : activeTab === "n" ? formatNumber(result.n)
        : formatCurrency(result[activeTab])
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Inputs ───────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                style={{
                  flex: "1 1 auto", padding: "10px 8px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
                  cursor: "pointer", border: "1px solid var(--border)", borderBottom: activeTab === tab.key ? "none" : "1px solid var(--border)",
                  background: activeTab === tab.key ? "var(--accent)" : "var(--bg-white)",
                  color: activeTab === tab.key ? "#fff" : "var(--text-primary)",
                  position: "relative", zIndex: activeTab === tab.key ? 1 : 0, whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -1 }}>
            {FIELD_DEFS.filter((f) => f.key !== activeTab).map((f) => (
              <FieldRow key={f.key} label={f.label}>
                {f.kind === "dollar" && (
                  <DollarField value={fieldValues[f.key]} onChange={fieldSetters[f.key]} placeholder={DEFAULTS[f.key]} />
                )}
                {f.kind === "percent" && (
                  <PercentField value={fieldValues[f.key]} onChange={fieldSetters[f.key]} placeholder={DEFAULTS[f.key]} />
                )}
                {f.kind === "number" && (
                  <TextField value={fieldValues[f.key]} onChange={fieldSetters[f.key]} placeholder={DEFAULTS[f.key]} />
                )}
              </FieldRow>
            ))}

            {!settingsOpen ? (
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 13.5, textDecoration: "underline" }}
                >
                  + Settings
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <div style={{ background: "var(--accent)", color: "#fff", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-display)" }}>
                  Settings
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    aria-label="Close settings"
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, background: "#dc2626", border: "none", borderRadius: 3, color: "#fff", fontSize: 11, lineHeight: "18px", cursor: "pointer", padding: 0 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>P/Y (# of periods per year)</span>
                    <TextField value={py} onChange={setPy} style={{ width: 70 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>C/Y (# of times interest compound per year)</span>
                    <TextField value={cy} onChange={setCy} style={{ width: 70 }} />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    PMT made at the{" "}
                    {[["beginning", "beginning"], ["end", "end"]].map(([value, label]) => (
                      <label key={value} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 14, cursor: "pointer" }}>
                        <input type="radio" name="pmtAt" checked={pmtAt === value} onChange={() => setPmtAt(value)} />
                        {label}
                      </label>
                    ))}
                    <br />of each period
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
                Calculate
              </button>
              <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Results
            </div>
            <div style={{ padding: "14px 16px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see the result.
                </p>
              ) : result.noSolution ? (
                <p style={{ fontSize: 13.5, color: "#dc2626", lineHeight: 1.6, fontWeight: 600 }}>
                  Sorry, this calculator can not find the interest rate based on the inputs.
                </p>
              ) : activeTab === "iy" ? (
                <>
                  {iyResultLines(result, py, cy).map((line, i) => (
                    <p key={i} style={{ fontSize: 15.5, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 10 }}>
                      {line.label || "I/Y"} = <span style={{ color: "var(--success)" }}>{line.value}</span>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{line.suffix}</span>
                    </p>
                  ))}
                  <div style={{ ...rowStyle, marginTop: 6 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Sum of all periodic payments</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.sumOfPmt)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Interest</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 16 }}>
                    {RESULT_LABELS[activeTab]} = <span style={{ color: "var(--success)" }}>{headlineValue}</span>
                  </p>
                  <div style={rowStyle}>
                    <span style={{ color: "var(--text-secondary)" }}>Sum of all periodic payments</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.sumOfPmt)}</span>
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Interest</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatCurrency(result.totalInterest)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && result.schedule.length > 0 && (
        <>
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 8px", textAlign: "center" }}>
              Value changes over time
            </p>
            <FinanceLineChart schedule={result.schedule} pv={result.pv} />
          </div>

          <LoanScheduleTable
            title="Schedule"
            schedule={toScheduleRows(result.schedule)}
            columns={SCHEDULE_COLUMNS}
            formatValue={formatCurrency}
          />
        </>
      )}
    </div>
  );
}
