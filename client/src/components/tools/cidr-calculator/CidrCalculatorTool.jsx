import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { MODES, DEFAULT_CIDR, cidrToRange, rangeToCidr, formatThousands } from "../../../utils/cidrCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const sep = { fontSize: 18, fontWeight: 700, color: "var(--text-muted)", padding: "0 2px" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };

const EMPTY = () => ({ mode: "cidr", cidr: [...DEFAULT_CIDR], first: ["", "", "", ""], last: ["", "", "", ""] });
const OCTET_NAMES = ["First octet", "Second octet", "Third octet", "Fourth octet"];

/** Four octet boxes (and optionally the mask width) in one row; typing or pasting "a.b.c.d/w" fills them all. */
function IpRow({ values, onChange, names, flagged, withWidth = false }) {
  const set = (i, text) => {
    const parts = text.split(/[./]/);
    if (parts.length > 1 && i === 0) {
      const next = [...values];
      parts.slice(0, values.length).forEach((p, j) => { next[j] = p.trim(); });
      onChange(next);
      return;
    }
    onChange(values.map((v, j) => (j === i ? text : v)));
  };
  const box = (i, label) => {
    const bad = flagged.includes(names[i]) && String(values[i]).trim() === "";
    return (
      <input
        key={i} type="text" inputMode="numeric" value={values[i]} aria-label={label} onChange={(e) => set(i, e.target.value)}
        className={bad ? "input-required" : undefined} aria-invalid={bad || undefined}
        style={{ ...inputStyle, ...mono, textAlign: "center", width: "100%", minWidth: 0, padding: "9px 4px" }}
      />
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: withWidth ? "1fr auto 1fr auto 1fr auto 1fr auto 0.8fr" : "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 2 }}>
      {box(0, OCTET_NAMES[0])}<span style={sep}>.</span>{box(1, OCTET_NAMES[1])}<span style={sep}>.</span>{box(2, OCTET_NAMES[2])}<span style={sep}>.</span>{box(3, OCTET_NAMES[3])}
      {withWidth && <><span style={sep}>/</span>{box(4, "Subnet mask width")}</>}
    </div>
  );
}

function Summary({ b, intro }) {
  return (
    <>
      <HighlightSummary label="CIDR block" value={`${b.firstIp}/${b.width}`} color="var(--accent)" note={`${formatThousands(b.range)} IP addresses`} />
      {intro}
      <StatList>
        <StatRow label="IP"><span style={mono}>{b.ip}</span></StatRow>
        <StatRow label="Subnet mask width">{b.width}</StatRow>
        <StatRow label="Subnet mask"><span style={mono}>{b.subnetMask}</span></StatRow>
        <StatRow label="Prefix"><span style={mono}>{b.prefix}</span></StatRow>
        <StatRow label="Wildcard bits"><span style={mono}>{b.wildcard}</span></StatRow>
        <StatRow label="First IP (network address)" tone="var(--accent)"><span style={mono}>{b.firstIp}</span></StatRow>
        <StatRow label="Last IP (broadcast address)" tone="var(--accent)"><span style={mono}>{b.lastIp}</span></StatRow>
        <StatRow label="Range">{formatThousands(b.range)} IP addresses</StatRow>
        <StatRow label="Number of host addresses">{formatThousands(b.hosts)} IP addresses</StatRow>
      </StatList>
    </>
  );
}

function ResultBody({ result }) {
  if (!result) return <p style={muted}>Enter the IP and subnet mask width (or two IP addresses), then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.mode === "cidr") return <Summary b={result} intro={null} />;
  if (result.single) {
    const b = result.single;
    return (
      <Summary
        b={{ ...b, ip: b.firstIp }}
        intro={(
          <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>
            The range <strong>{b.firstIp}</strong> to <strong>{b.lastIp}</strong> is perfectly covered by the CIDR notation{" "}
            <strong>{b.firstIp}/{b.width}</strong>. The CIDR block is summarized below.
          </p>
        )}
      />
    );
  }
  return (
    <>
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: "0 0 10px" }}>
        This range isn&apos;t a single CIDR block; it is covered by these <strong>{result.blocks.length}</strong> blocks:
      </p>
      <div style={{ overflowX: "auto", maxHeight: 460, overflowY: "auto" }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>CIDR</th><th>Range</th><th>#</th></tr></thead>
          <tbody>{result.blocks.map((b) => <tr key={b.cidr}><td style={mono}>{b.cidr}</td><td style={mono}>{b.range}</td><td style={{ textAlign: "right" }}>{b.count}</td></tr>)}</tbody>
        </table>
      </div>
      {result.capped && <p style={{ ...muted, fontSize: 12.5, marginTop: 8 }}>Only the first 100 blocks are listed.</p>}
    </>
  );
}

export default function CidrCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();

  const run = (state) => {
    const r = state.mode === "cidr" ? cidrToRange(state.cidr) : rangeToCidr(state.first, state.last);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r.errors ? r : { mode: state.mode, ...r };
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };
  const missingNote = req.flagged.length > 0 && <p style={{ fontSize: 12.5, color: "var(--error)", margin: "6px 0 0" }}>Please enter a value in every box.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Convert a CIDR block into its IPv4 range (subnet mask, wildcard bits, network and broadcast addresses, number of hosts), or find
        the CIDR notation that covers a range of IP addresses.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="Conversion">
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>I want to convert...</FieldLabel></legend>
              {MODES.map((m) => <RadioOption key={m.value} checked={s.mode === m.value} onChange={() => update({ mode: m.value })} label={m.label} />)}
            </fieldset>
            {s.mode === "cidr" ? (
              <div style={{ marginTop: 12 }}>
                <p style={{ ...muted, marginBottom: 10 }}>Enter your <strong>IP&apos;s octets</strong> (the numbers separated by dots) and the <strong>subnet mask width</strong> (the number after the slash):</p>
                <IpRow values={s.cidr} onChange={(v) => update({ cidr: v })} names={["o1", "o2", "o3", "o4", "width"]} flagged={req.flagged} withWidth />
                {missingNote}
              </div>
            ) : (
              <p style={{ ...muted, marginTop: 12 }}>Enter <strong>any two IP addresses</strong> below (the first IP should be lower than the last IP).</p>
            )}
          </section>

          {s.mode === "range" && (
            <>
              <section className="card" style={{ padding: 18 }} aria-label="First IP">
                <h3 style={cardTitle}>First IP</h3>
                <IpRow values={s.first} onChange={(v) => update({ first: v })} names={["f1", "f2", "f3", "f4"]} flagged={req.flagged} />
              </section>
              <section className="card" style={{ padding: 18 }} aria-label="Last IP">
                <h3 style={cardTitle}>Last IP</h3>
                <IpRow values={s.last} onChange={(v) => update({ last: v })} names={["l1", "l2", "l3", "l4"]} flagged={req.flagged} />
                {missingNote}
              </section>
            </>
          )}
          <ButtonRow onCalculate={calculate} onClear={clear} />
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
