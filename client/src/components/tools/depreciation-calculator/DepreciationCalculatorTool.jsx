import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { YesNoField } from "../401k-calculator/Four01kFormControls";
import DepreciationBarChart from "./DepreciationBarChart";
import {
  calculateDepreciation, formatAmount, formatPercent, todayIso,
  DEFAULTS, METHOD_OPTIONS, CONVENTION_OPTIONS, MONTH_NAMES,
} from "../../../utils/depreciationCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }));
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const EMPTY = { cost: "", salvage: "", years: "", factor: "" };
const HEADERS = ["Year", "Beginning Book Value", "Depreciation Percent", "Depreciation Amount", "Accumulated Depreciation Amount", "Ending Book Value"];

const sentenceStyle = { fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" };
const th = { textAlign: "left", fontSize: 12, fontWeight: 700, color: "#fff", background: "#333", verticalAlign: "bottom", lineHeight: 1.3 };
const td = { fontSize: 13, color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" };

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

function Results({ result }) {
  const money = (x) => formatAmount(x, result.cents);
  return (
    <>
      {result.partialSentence && <p style={sentenceStyle}>{result.partialSentence}</p>}
      {result.methodSentence && (
        <p style={sentenceStyle}>
          {result.methodSentence.text ?? (
            <>
              {result.methodSentence.prefix}
              <strong style={{ color: "var(--success)" }}>{result.methodSentence.amount}</strong>
              {result.methodSentence.suffix}
            </>
          )}
        </p>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>{HEADERS.map((h) => <th key={h} scope="col" style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label}>
                <td style={{ ...td, textAlign: "left" }}>{r.label}</td>
                <td style={td}>{money(r.begin)}</td>
                <td style={td}>{formatPercent(r.percent)}</td>
                <td style={td}>{money(r.amount)}</td>
                <td style={td}>{money(r.accumulated)}</td>
                <td style={td}>{money(r.end)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.showChart && (
        <div style={{ marginTop: 18 }}>
          <DepreciationBarChart points={result.chart} />
        </div>
      )}
    </>
  );
}

export default function DepreciationCalculatorTool() {
  const [method, setMethod] = useState("straight");
  const [v, setV] = useState(EMPTY);
  const [roundToDollars, setRoundToDollars] = useState(true);
  const [partial, setPartial] = useState(false);
  const [convention, setConvention] = useState("halfmonth");
  const [startDate, setStartDate] = useState(todayIso);
  const [accMonth, setAccMonth] = useState("1");
  const [accDay, setAccDay] = useState("1");
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  function calculate() {
    // Salvage value may stay empty (0); the factor is needed only for declining balance.
    if (!req.require({ cost: v.cost, years: v.years, ...(method === "declining" ? { factor: v.factor } : {}) })) { setResult(null); return; }
    setResult(calculateDepreciation({
      ...v, method, roundToDollars, partial, convention, startDate: startDate || todayIso(),
      accMonth: Number(accMonth), accDay: Number(accDay),
    }));
  }

  function clear() {
    req.clear();
    setV(EMPTY);
    setMethod("straight");
    setRoundToDollars(true);
    setPartial(false);
    setConvention("halfmonth");
    setStartDate(todayIso());
    setAccMonth("1");
    setAccDay("1");
    setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ─────────────────────────────────────────────────── */}
      <div style={{ flex: "1 1 330px", minWidth: 290, maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            Print
          </button>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <FieldRow label="Depreciation method" fieldWidth={190}>
            <SelectField value={method} onChange={setMethod} options={METHOD_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
          </FieldRow>
          <FieldRow label="Asset cost"><Req name="cost" flagged={req.flagged}><DollarField value={v.cost} onChange={set("cost")} placeholder={DEFAULTS.cost} /></Req></FieldRow>
          <FieldRow label="Salvage value"><DollarField value={v.salvage} onChange={set("salvage")} placeholder={DEFAULTS.salvage} /></FieldRow>
          <FieldRow label="Depreciation years"><Req name="years" flagged={req.flagged}><TextField value={v.years} onChange={set("years")} placeholder={DEFAULTS.years} /></Req></FieldRow>
          {method === "declining" && (
            <FieldRow label="Depreciation factor"><Req name="factor" flagged={req.flagged}><TextField value={v.factor} onChange={set("factor")} placeholder={DEFAULTS.factor} /></Req></FieldRow>
          )}

          <YesNoField label="Round to dollars?" value={roundToDollars} onChange={setRoundToDollars} />
          <YesNoField label="Partial year depreciation?" value={partial} onChange={setPartial} />

          {partial && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
              <FieldRow label="Convention" fieldWidth={190}>
                <SelectField value={convention} onChange={setConvention} options={CONVENTION_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
              </FieldRow>
              <FieldRow label="Start of asset service" fieldWidth={190}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Start of asset service"
                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", fontSize: 13, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontFamily: "var(--font-display)", color: "var(--text-primary)", background: "var(--bg-white)" }}
                />
              </FieldRow>
              <FieldRow label="Start of accounting year" fieldWidth={190}>
                <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
                  <SelectField value={accMonth} onChange={setAccMonth} options={MONTH_OPTIONS} style={{ flex: "1 1 auto", minWidth: 0 }} />
                  <SelectField value={accDay} onChange={setAccDay} options={DAY_OPTIONS} style={{ flex: "0 0 58px" }} />
                </div>
              </FieldRow>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: "2 1 460px", minWidth: 290, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Result
        </div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Enter the asset's cost, salvage value, and useful life, pick a method, and click <strong>Calculate</strong> to
              see the year-by-year depreciation schedule.
            </p>
          ) : result.errors ? (
            <ErrorPanel messages={result.errors} />
          ) : result.message ? (
            <p style={{ ...sentenceStyle, margin: 0 }}>{result.message}</p>
          ) : (
            <Results result={result} />
          )}
        </div>
      </div>
    </div>
  );
}
