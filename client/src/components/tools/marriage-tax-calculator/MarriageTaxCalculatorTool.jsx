import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import {
  calculateMarriageTax, FILE_STATUS_OPTIONS, DEFAULTS, formatCurrency,
} from "../../../utils/marriageTaxCalculatorEngine";

const SPOUSE1_BG = "#eef4fc";
const SPOUSE2_BG = "#eef8ee";

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
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
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12.5, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 17, fontSize: 12.5, padding: "6px 8px 6px 17px", width: "100%" }}
      />
    </div>
  );
}

function PercentField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <TextField
        value={value} onChange={onChange} placeholder={placeholder}
        style={{ paddingRight: 20, fontSize: 12.5, padding: "6px 20px 6px 8px", width: "100%" }}
      />
      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12.5, pointerEvents: "none" }}>%</span>
    </div>
  );
}

function YesNo({ value, onChange, name }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
      {[["yes", "yes"], ["no", "no"]].map(([v, label]) => (
        <label key={v} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
          {label}
        </label>
      ))}
    </div>
  );
}

const rowLabelStyle = { fontSize: 12.5, color: "var(--text-primary)", fontWeight: 600, textAlign: "right", paddingRight: 10, verticalAlign: "middle" };
const cellStyle = (bg) => ({ background: bg, padding: "6px 8px", verticalAlign: "middle" });

function Row({ label, hint, children1, children2 }) {
  return (
    <tr>
      <td style={rowLabelStyle}>
        {label}
        {hint && <span title={hint} style={{ marginLeft: 4, fontSize: 11, color: "var(--text-muted)", cursor: "help" }}>ⓘ</span>}
      </td>
      <td style={cellStyle(SPOUSE1_BG)}>{children1}</td>
      <td style={cellStyle(SPOUSE2_BG)}>{children2}</td>
    </tr>
  );
}

const resultRowStyle = { padding: "5px 10px", fontSize: 12.5, borderBottom: "1px solid var(--border)" };
const resultLabelStyle = { ...resultRowStyle, textAlign: "left", color: "var(--text-secondary)" };
const resultValStyle = { ...resultRowStyle, textAlign: "right", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" };

function ResultRow({ label, cells, emphasize }) {
  return (
    <tr>
      <td style={{ ...resultLabelStyle, fontWeight: emphasize ? 700 : 500 }}>{label}</td>
      {cells.map((c, i) => <td key={i} style={{ ...resultValStyle, fontWeight: emphasize ? 700 : 600 }}>{c}</td>)}
    </tr>
  );
}

function fmtPct(rate) { return `${Math.round(rate * 100)}%`; }

function emptySpouse(defaults, suffix) {
  return {
    salary: "", interest: "", rental: "", stcg: "", ltcg: "", qdiv: "", k401: "",
    status: defaults[`status${suffix}`], dependents: "",
    useStandard: true, itemized: "", stateRatePercent: "", selfEmployed: false,
  };
}

export default function MarriageTaxCalculatorTool() {
  const [s1, setS1] = useState(() => emptySpouse(DEFAULTS, 1));
  const [s2, setS2] = useState(() => emptySpouse(DEFAULTS, 2));
  const [result, setResult] = useState(null);

  function field1(key) { return (v) => setS1((p) => ({ ...p, [key]: v })); }
  function field2(key) { return (v) => setS2((p) => ({ ...p, [key]: v })); }

  function calculate() {
    const spouse1 = {
      salary: s1.salary || DEFAULTS.salary1, interest: s1.interest || DEFAULTS.interest1,
      rental: s1.rental || DEFAULTS.rental1, stcg: s1.stcg || DEFAULTS.stcg1,
      ltcg: s1.ltcg || DEFAULTS.ltcg1, qdiv: s1.qdiv || DEFAULTS.qdiv1,
      k401: s1.k401 || DEFAULTS.k401_1, status: s1.status,
      dependents: s1.dependents || DEFAULTS.dependents1,
      useStandard: s1.useStandard, itemized: s1.itemized || "0",
      stateRatePercent: s1.stateRatePercent || DEFAULTS.stateTax1, selfEmployed: s1.selfEmployed,
    };
    const spouse2 = {
      salary: s2.salary || DEFAULTS.salary2, interest: s2.interest || DEFAULTS.interest2,
      rental: s2.rental || DEFAULTS.rental2, stcg: s2.stcg || DEFAULTS.stcg2,
      ltcg: s2.ltcg || DEFAULTS.ltcg2, qdiv: s2.qdiv || DEFAULTS.qdiv2,
      k401: s2.k401 || DEFAULTS.k401_2, status: s2.status,
      dependents: s2.dependents || DEFAULTS.dependents2,
      useStandard: s2.useStandard, itemized: s2.itemized || "0",
      stateRatePercent: s2.stateRatePercent || DEFAULTS.stateTax2, selfEmployed: s2.selfEmployed,
    };
    setResult(calculateMarriageTax({ spouse1, spouse2 }));
  }

  function clear() {
    setS1(emptySpouse(DEFAULTS, 1));
    setS2(emptySpouse(DEFAULTS, 2));
    setResult(null);
  }

  const delta = result ? Math.round(result.federalTaxDelta) : 0;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ───────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 460px", minWidth: 380, padding: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 10px" }}></th>
              <th style={{ ...cellStyle(SPOUSE1_BG), fontSize: 12.5, fontFamily: "var(--font-display)", fontWeight: 700 }}>Spouse 1</th>
              <th style={{ ...cellStyle(SPOUSE2_BG), fontSize: 12.5, fontFamily: "var(--font-display)", fontWeight: 700 }}>Spouse 2</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Salary+Business Income" children1={<DollarField value={s1.salary} onChange={field1("salary")} placeholder={DEFAULTS.salary1} />} children2={<DollarField value={s2.salary} onChange={field2("salary")} placeholder={DEFAULTS.salary2} />} />
            <Row label="Interest+Dividends Income" children1={<DollarField value={s1.interest} onChange={field1("interest")} placeholder={DEFAULTS.interest1} />} children2={<DollarField value={s2.interest} onChange={field2("interest")} placeholder={DEFAULTS.interest2} />} />
            <Row label="Rental, Royalty, Passive Income" children1={<DollarField value={s1.rental} onChange={field1("rental")} placeholder={DEFAULTS.rental1} />} children2={<DollarField value={s2.rental} onChange={field2("rental")} placeholder={DEFAULTS.rental2} />} />
            <Row label="Short Term Capital Gain" children1={<DollarField value={s1.stcg} onChange={field1("stcg")} placeholder={DEFAULTS.stcg1} />} children2={<DollarField value={s2.stcg} onChange={field2("stcg")} placeholder={DEFAULTS.stcg2} />} />
            <Row label="Long Term Capital Gain" children1={<DollarField value={s1.ltcg} onChange={field1("ltcg")} placeholder={DEFAULTS.ltcg1} />} children2={<DollarField value={s2.ltcg} onChange={field2("ltcg")} placeholder={DEFAULTS.ltcg2} />} />
            <Row label="Qualified Dividends" children1={<DollarField value={s1.qdiv} onChange={field1("qdiv")} placeholder={DEFAULTS.qdiv1} />} children2={<DollarField value={s2.qdiv} onChange={field2("qdiv")} placeholder={DEFAULTS.qdiv2} />} />
            <Row label="401K, IRA... Savings" children1={<DollarField value={s1.k401} onChange={field1("k401")} placeholder={DEFAULTS.k401_1} />} children2={<DollarField value={s2.k401} onChange={field2("k401")} placeholder={DEFAULTS.k401_2} />} />
            <Row label="File Status (Before Marriage)"
              children1={<SelectField value={s1.status} onChange={field1("status")} options={FILE_STATUS_OPTIONS} style={{ width: "100%", fontSize: 12, padding: "6px 8px" }} />}
              children2={<SelectField value={s2.status} onChange={field2("status")} options={FILE_STATUS_OPTIONS} style={{ width: "100%", fontSize: 12, padding: "6px 8px" }} />}
            />
            <Row label="No. of Dependents" children1={<TextField value={s1.dependents} onChange={field1("dependents")} placeholder={DEFAULTS.dependents1} style={{ width: "100%", fontSize: 12.5, padding: "6px 8px" }} />} children2={<TextField value={s2.dependents} onChange={field2("dependents")} placeholder={DEFAULTS.dependents2} style={{ width: "100%", fontSize: 12.5, padding: "6px 8px" }} />} />

            <tr>
              <td style={{ ...rowLabelStyle, verticalAlign: "top", paddingTop: 8 }}>
                Deductions:
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.5, marginTop: 2 }}>
                  Mortgage Interest<br />Charitable Donations<br />Student Loan Interest, $2,500 Max<br />Child Care Expenses, $3,000 Max<br />Education Tuition, $4,000 Max
                </div>
              </td>
              <td style={{ ...cellStyle(SPOUSE1_BG), verticalAlign: "top" }}>
                <div style={{ fontSize: 11.5, marginBottom: 4 }}>Use Standard Deduction?</div>
                <YesNo name="std1" value={s1.useStandard ? "yes" : "no"} onChange={(v) => setS1((p) => ({ ...p, useStandard: v === "yes" }))} />
                {!s1.useStandard && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 11, marginBottom: 3 }}>Total Deductions:</div>
                    <DollarField value={s1.itemized} onChange={field1("itemized")} placeholder="0" />
                  </div>
                )}
              </td>
              <td style={{ ...cellStyle(SPOUSE2_BG), verticalAlign: "top" }}>
                <div style={{ fontSize: 11.5, marginBottom: 4 }}>Use Standard Deduction?</div>
                <YesNo name="std2" value={s2.useStandard ? "yes" : "no"} onChange={(v) => setS2((p) => ({ ...p, useStandard: v === "yes" }))} />
                {!s2.useStandard && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 11, marginBottom: 3 }}>Total Deductions:</div>
                    <DollarField value={s2.itemized} onChange={field2("itemized")} placeholder="0" />
                  </div>
                )}
              </td>
            </tr>

            <Row label="State+City Tax Rate" children1={<PercentField value={s1.stateRatePercent} onChange={field1("stateRatePercent")} placeholder={DEFAULTS.stateTax1} />} children2={<PercentField value={s2.stateRatePercent} onChange={field2("stateRatePercent")} placeholder={DEFAULTS.stateTax2} />} />
            <Row label="Self-Employed"
              children1={<YesNo name="se1" value={s1.selfEmployed ? "yes" : "no"} onChange={(v) => setS1((p) => ({ ...p, selfEmployed: v === "yes" }))} />}
              children2={<YesNo name="se2" value={s2.selfEmployed ? "yes" : "no"} onChange={(v) => setS2((p) => ({ ...p, selfEmployed: v === "yes" }))} />}
            />
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
          <button type="button" onClick={calculate} style={{ padding: "9px 24px", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 20px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 460px", minWidth: 380, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Results:
        </div>
        <div style={{ padding: "16px 18px" }}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in both spouses&rsquo; details below and click <strong>Calculate</strong> to compare filing separately vs. jointly.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 14px" }}>
                {delta === 0 ? (
                  "Your federal income tax before and after marriage will be similar."
                ) : delta > 0 ? (
                  <>Unfortunately, you will pay <strong style={{ color: "#dc2626" }}>~{formatCurrency(Math.abs(delta), { decimals: 0 })} more</strong> federal income tax if married.</>
                ) : (
                  <>Congratulations! You will pay <strong style={{ color: "var(--success)" }}>~{formatCurrency(Math.abs(delta), { decimals: 0 })} less</strong> federal income tax if married.</>
                )}
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead>
                    <tr>
                      <th style={{ ...resultLabelStyle, borderBottom: "2px solid var(--border)" }}></th>
                      <th colSpan={3} style={{ ...resultValStyle, textAlign: "center", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontWeight: 700, fontSize: 11.5 }}>If Not Married</th>
                      <th style={{ ...resultValStyle, textAlign: "center", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontWeight: 700, fontSize: 11.5 }}>If Married</th>
                    </tr>
                    <tr>
                      <th style={resultLabelStyle}></th>
                      <th style={{ ...resultValStyle, fontSize: 11 }}>Spouse 1</th>
                      <th style={{ ...resultValStyle, fontSize: 11 }}>Spouse 2</th>
                      <th style={{ ...resultValStyle, fontSize: 11 }}>Combined</th>
                      <th style={{ ...resultValStyle, fontSize: 11 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <ResultRow label="All Income" cells={[
                      formatCurrency(result.spouse1.allIncome, { decimals: 0 }),
                      formatCurrency(result.spouse2.allIncome, { decimals: 0 }),
                      formatCurrency(result.combined.allIncome, { decimals: 0 }),
                      formatCurrency(result.married.allIncome, { decimals: 0 }),
                    ]} />
                    <ResultRow label="Federal Income Tax" cells={[
                      formatCurrency(result.spouse1.federalIncomeTax, { decimals: 0 }),
                      formatCurrency(result.spouse2.federalIncomeTax, { decimals: 0 }),
                      formatCurrency(result.combined.federalIncomeTax, { decimals: 0 }),
                      formatCurrency(result.married.federalIncomeTax, { decimals: 0 }),
                    ]} />
                    <ResultRow label="Marginal Tax Rate" cells={[
                      fmtPct(result.spouse1.marginalRate), fmtPct(result.spouse2.marginalRate), "", fmtPct(result.married.marginalRate),
                    ]} />
                    <ResultRow label="Social Security Tax" cells={[
                      formatCurrency(result.spouse1.socialSecurityTax, { decimals: 0 }),
                      formatCurrency(result.spouse2.socialSecurityTax, { decimals: 0 }),
                      formatCurrency(result.combined.socialSecurityTax, { decimals: 0 }),
                      formatCurrency(result.married.socialSecurityTax, { decimals: 0 }),
                    ]} />
                    <ResultRow label="Medicare Tax" cells={[
                      formatCurrency(result.spouse1.medicareTax, { decimals: 0 }),
                      formatCurrency(result.spouse2.medicareTax, { decimals: 0 }),
                      formatCurrency(result.combined.medicareTax, { decimals: 0 }),
                      formatCurrency(result.married.medicareTax, { decimals: 0 }),
                    ]} />
                    <ResultRow label="State+City Income Tax" cells={[
                      formatCurrency(result.spouse1.stateCityTax, { decimals: 0 }),
                      formatCurrency(result.spouse2.stateCityTax, { decimals: 0 }),
                      formatCurrency(result.combined.stateCityTax, { decimals: 0 }),
                      formatCurrency(result.married.stateCityTax, { decimals: 0 }),
                    ]} />
                    <ResultRow label="401K, IRA..." cells={[
                      formatCurrency(result.spouse1.k401, { decimals: 0 }),
                      formatCurrency(result.spouse2.k401, { decimals: 0 }),
                      formatCurrency(result.combined.k401, { decimals: 0 }),
                      formatCurrency(result.married.k401, { decimals: 0 }),
                    ]} />
                    <ResultRow emphasize label="Final Take Home" cells={[
                      formatCurrency(result.spouse1.finalTakeHome, { decimals: 0 }),
                      formatCurrency(result.spouse2.finalTakeHome, { decimals: 0 }),
                      formatCurrency(result.combined.finalTakeHome, { decimals: 0 }),
                      formatCurrency(result.married.finalTakeHome, { decimals: 0 }),
                    ]} />
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "10px 0 0" }}>
                * The results above are estimation only. They are based on many assumptions to balance accuracy and simplicity.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
