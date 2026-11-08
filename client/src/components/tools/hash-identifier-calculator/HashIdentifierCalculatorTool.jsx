import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { MESSAGES, EXAMPLES, identifyHash, noteFor } from "../../../utils/hashIdentifierCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const summary = { cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "0 0 10px", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const exampleBtn = {
  ...mono, textAlign: "left", padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-white)",
  cursor: "pointer", fontSize: 12.5, color: "var(--text-primary)", wordBreak: "break-all",
};
const bytesText = (b) => (Number.isInteger(b) ? String(b) : `${b} (not a whole number of bytes)`);

function ResultBody({ result }) {
  if (!result) return <p style={muted}>{MESSAGES.prompt} Paste a hash (digest) and click Calculate to see which hash functions could have produced it.</p>;
  if (result.notHex) return <ErrorPanel messages={[MESSAGES.notHex]} />;
  const stats = (
    <StatList>
      <StatRow label="Hex digits">{result.length}</StatRow>
      <StatRow label="Digest size">{result.bits} bits</StatRow>
      <StatRow label="Bytes">{bytesText(result.bytes)}</StatRow>
    </StatList>
  );
  if (!result.candidates.length) {
    return (
      <>
        <p role="alert" style={notice}>⚠ {MESSAGES.unknown} No common hash function produces a {result.length}-digit hex digest.</p>
        {stats}
      </>
    );
  }
  return (
    <>
      <HighlightSummary
        label="Possible algorithms" value={result.candidates.length} color="var(--accent)"
        note={`${result.bits}-bit digest`}
      />
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 10px" }}>
        Possible algorithms: <strong>{result.candidates.join(", ")}</strong>
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>Algorithm</th><th>Size</th><th>Notes</th></tr></thead>
          <tbody>
            {result.candidates.map((n) => (
              <tr key={n}><td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{n}</td><td style={{ whiteSpace: "nowrap" }}>{result.bits} bits</td><td>{noteFor(n)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {stats}
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        Hashes are identified by their length only: every function listed produces digests of this size, so the hash alone can&apos;t tell
        which one was used.
      </p>
    </>
  );
}

export default function HashIdentifierCalculatorTool() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const run = (text) => {
    const r = identifyHash(text);
    if (r.empty) { req.flag(["hash"]); return null; }
    req.flag([]);
    return r;
  };
  // Typing or picking an example only fills the box; the result updates on Calculate only.
  const change = (text) => setHash(text);
  const calculate = () => setResult(run(hash));
  const clear = () => { setHash(""); setResult(null); req.clear(); };
  const loadExample = (text) => { setHash(text); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Paste a hash (message digest) to find which hash functions could have produced it: MD5, SHA-1, SHA-256, SHA-512, RIPEMD, Tiger, CRC,
        FNV and more, recognized by the digest&apos;s length.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Hash">
            <label style={fieldWrap}>
              <FieldLabel>Hash</FieldLabel>
              <Req name="hash" flagged={req.flagged}>
                <TextField value={hash} onChange={change} style={{ ...mono, fontSize: 13 }} />
              </Req>
            </label>
            <p style={{ ...muted, fontSize: 12.5, marginBottom: 12 }}>
              Hexadecimal digits only (0-9, a-f); an optional 0x prefix and upper case are fine.
            </p>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>

          <details className="card" style={{ padding: "14px 18px" }} open>
            <summary style={summary}>Examples of hashes</summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" style={exampleBtn} onClick={() => loadExample(ex)} aria-label={`Use example hash ${ex}`}>{ex}</button>
              ))}
            </div>
          </details>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
