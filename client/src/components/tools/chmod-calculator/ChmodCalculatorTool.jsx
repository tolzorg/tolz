import { useRef, useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { MODES, CLASSES, PERMISSIONS, SPECIALS, DEFAULT_BITS, findChmod, decodeChmod } from "../../../utils/chmodCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const code = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", background: "var(--accent-light)", color: "var(--text-primary)", padding: "1px 6px", borderRadius: 4, fontSize: 13 };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "8px 0 0", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const YES_NO = [{ value: "1", label: "✔️  Yes" }, { value: "0", label: "❌  No" }];
const MODE_OPTIONS = MODES.map((m) => ({ value: m.value, label: m.label }));

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_BITS));
const EMPTY = () => ({ mode: "find", bits: cloneDefaults(), chmod: "" });
const mark = (on) => <span aria-label={on ? "yes" : "no"} style={{ color: on ? "var(--success)" : "var(--error)", fontWeight: 700 }}>{on ? "✔" : "✘"}</span>;

function CommandBox({ text }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "14px 16px", marginBottom: 12, borderRadius: "var(--radius-md)", background: "var(--accent-light)", borderLeft: "5px solid var(--accent)" }}>
      <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{text}</code>
      <button type="button" onClick={copy} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

function PermissionTable({ rows, specialDigit }) {
  const cells = (fn) => rows.map((r) => <td key={r.key} style={center}>{fn(r)}</td>);
  const pad = specialDigit !== null ? <td style={center} /> : null;
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <table className="data-table data-table-head" style={tableStyle}>
        <thead><tr><th />{specialDigit !== null && <th>Special mode</th>}{rows.map((r) => <th key={r.key}>{r.label === "User / owner" ? "User" : r.label}</th>)}</tr></thead>
        <tbody>
          <tr><th scope="row">Can read</th>{pad}{cells((r) => mark(r.read))}</tr>
          <tr><th scope="row">Can write</th>{pad}{cells((r) => mark(r.write))}</tr>
          <tr><th scope="row">Can execute</th>{pad}{cells((r) => mark(r.execute))}</tr>
          <tr><th scope="row">Symbolic</th>{pad}{cells((r) => <code style={code}>{r.symbolic}</code>)}</tr>
          {specialDigit === null && <tr><th scope="row">Binary</th>{cells((r) => <code style={code}>{r.binary}</code>)}</tr>}
          <tr><th scope="row">Octal</th>{specialDigit !== null && <td style={center}>{specialDigit}</td>}{cells((r) => r.octal)}</tr>
        </tbody>
      </table>
    </div>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Choose the permissions (or enter an octal value to decode), then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.mode === "find") {
    return (
      <>
        <CommandBox text={`chmod ${result.command} file_name`} />
        <StatList>
          <StatRow label="Symbolic"><code style={code}>{result.symbolic}</code></StatRow>
          {!result.hasSpecial && <StatRow label="Binary"><code style={code}>{result.binary}</code></StatRow>}
          {!result.hasSpecial && <StatRow label="Octal"><code style={code}>{result.octal}</code></StatRow>}
        </StatList>
        {result.notes.map((n) => <p key={n} role="note" style={notice}>⚠ {n}</p>)}
        {result.rows && <PermissionTable rows={result.rows} specialDigit={null} />}
      </>
    );
  }
  return (
    <>
      <CommandBox text={`chmod ${result.input} file_name`} />
      {result.hasSpecial ? (
        <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
          The first digit means that you set: <strong>{result.specialModes.join(", ")}</strong>.
        </p>
      ) : (
        <StatList>
          <StatRow label="Binary format"><code style={code}>{result.binary}</code></StatRow>
          <StatRow label="Symbolic format"><code style={code}>{result.symbolic}</code></StatRow>
        </StatList>
      )}
      {result.hasSpecial && <StatList><StatRow label="Symbolic format"><code style={code}>{result.symbolic}</code></StatRow></StatList>}
      {result.notes.map((n) => <p key={n} role="note" style={notice}>⚠ {n}</p>)}
      <PermissionTable rows={result.rows} specialDigit={result.hasSpecial ? result.specialDigit : null} />
    </>
  );
}

export default function ChmodCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const run = (state) => {
    if (state.mode === "find") { req.flag([]); return { mode: "find", ...findChmod(state.bits) }; }
    const r = decodeChmod(state.chmod);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r.errors ? r : { mode: "decode", ...r };
  };
  const update = (next) => { setS(next); if (result) setResult(run(next)); };
  const setPerm = (cls, perm) => (v) => update({ ...s, bits: { ...s.bits, [cls]: { ...s.bits[cls], [perm]: v === "1" } } });
  const setSpecial = (key) => (v) => update({ ...s, bits: { ...s.bits, [key]: v === "1" } });
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Build the chmod command for the file permissions you want, or decode the octal number next to chmod (like 755 or 4755) into its
        symbolic and binary forms and a permissions table.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Mode">
            <label style={{ ...fieldWrap, marginBottom: s.mode === "decode" ? 12 : 0 }}>
              <FieldLabel>I want to</FieldLabel>
              <SelectField value={s.mode} onChange={(v) => update({ ...s, mode: v })} options={MODE_OPTIONS} />
            </label>
            {s.mode === "decode" && (
              <label style={{ ...fieldWrap, marginBottom: 0 }}>
                <FieldLabel>chmod</FieldLabel>
                <Req name="chmod" flagged={req.flagged}><TextField value={s.chmod} onChange={(v) => setS((p) => ({ ...p, chmod: v }))} /></Req>
                <p style={{ ...muted, fontSize: 12 }}>In octal format (e.g., 755 or 4755).</p>
              </label>
            )}
          </section>

          {s.mode === "find" && PERMISSIONS.map((perm) => (
            <section key={perm.key} className="card" style={{ padding: 18 }} aria-label={perm.title}>
              <h3 style={cardTitle}>{perm.title}</h3>
              {CLASSES.map((c) => (
                <label key={c.key} style={fieldWrap}>
                  <FieldLabel>{c.label}</FieldLabel>
                  <SelectField value={s.bits[c.key][perm.key] ? "1" : "0"} onChange={setPerm(c.key, perm.key)} options={YES_NO} />
                </label>
              ))}
            </section>
          ))}

          {s.mode === "find" && (
            <details className="card" style={{ padding: "14px 18px" }}>
              <summary style={summary}>Special modes</summary>
              <div style={{ marginTop: 12 }}>
                {SPECIALS.map((sp) => (
                  <label key={sp.key} style={fieldWrap}>
                    <FieldLabel>{sp.label}</FieldLabel>
                    <SelectField value={s.bits[sp.key] ? "1" : "0"} onChange={setSpecial(sp.key)} options={YES_NO} />
                  </label>
                ))}
              </div>
            </details>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>CHMOD results &amp; interpretation</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
