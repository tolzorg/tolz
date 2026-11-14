import { useState } from "react";
import { FieldLabel, RadioOption } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  NETWORK_CLASSES, IPV6_PREFIXES, PLACEHOLDERS, DEFAULT_IPV4_PREFIX, DEFAULT_IPV6_PREFIX,
  subnetsForClass, subnetAfterClassChange, calculateIpv4, calculateIpv6,
} from "../../../utils/ipSubnetCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 };
const subTitle = { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-secondary)", margin: "16px 0 0" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const currentRow = { background: "color-mix(in srgb, var(--accent) 12%, transparent)", fontWeight: 700 };

const EMPTY_V4 = () => ({ cls: "any", prefix: DEFAULT_IPV4_PREFIX, ip: "" });
const EMPTY_V6 = () => ({ prefix: DEFAULT_IPV6_PREFIX, ip: "" });

/** A text box for an IP address (letters allowed for IPv6); Enter calculates. */
function IpField({ value, onChange, placeholder, onEnter, label }) {
  const invalid = useRequiredState(value);
  return (
    <input
      type="text" value={value} aria-label={label} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={64}
      {...requiredInputProps(invalid, placeholder)}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
      style={{ ...inputStyle, ...mono, width: "100%" }}
    />
  );
}

function Section({ title, id, form, result }) {
  return (
    <section aria-labelledby={id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 id={id} style={sectionTitle}>{title}</h2>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, padding: 18 }}>{form}</div>
        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{result}</div>
        </div>
      </div>
    </section>
  );
}

function Ipv4Result({ r }) {
  return (
    <>
      <HighlightSummary
        label="Usable hosts" value={r.usableHosts} color="var(--accent)" badge={r.ipType}
        note={<span style={mono}>{r.networkAddress}{r.cidr}</span>}
      />
      <StatList>
        <StatRow label="IP Address"><span style={mono}>{r.ipAddress}</span></StatRow>
        <StatRow label="Network Address" tone="var(--accent)"><span style={mono}>{r.networkAddress}</span></StatRow>
        <StatRow label="Usable Host IP Range" tone="var(--success)"><span style={mono}>{r.usableRange}</span></StatRow>
        <StatRow label="Broadcast Address" tone="var(--accent)"><span style={mono}>{r.broadcastAddress}</span></StatRow>
        <StatRow label="Total Number of Hosts">{r.totalHosts}</StatRow>
        <StatRow label="Number of Usable Hosts">{r.usableHosts}</StatRow>
        <StatRow label="Subnet Mask"><span style={mono}>{r.subnetMask}</span></StatRow>
        <StatRow label="Wildcard Mask"><span style={mono}>{r.wildcardMask}</span></StatRow>
        <StatRow label="Binary Subnet Mask"><span style={mono}>{r.binarySubnetMask}</span></StatRow>
        {r.ipClass && <StatRow label="IP Class">{r.ipClass}</StatRow>}
        <StatRow label="CIDR Notation">{r.cidr}</StatRow>
        <StatRow label="IP Type">{r.ipType}</StatRow>
      </StatList>
      <h3 style={subTitle}>Other formats</h3>
      <StatList>
        <StatRow label="Short"><span style={mono}>{r.short}</span></StatRow>
        <StatRow label="Binary ID"><span style={mono}>{r.binaryId}</span></StatRow>
        <StatRow label="Integer ID"><span style={mono}>{r.integerId}</span></StatRow>
        <StatRow label="Hex ID"><span style={mono}>{r.hexId}</span></StatRow>
        <StatRow label="in-addr.arpa"><span style={mono}>{r.inAddrArpa}</span></StatRow>
        <StatRow label="IPv4 Mapped Address"><span style={mono}>{r.ipv4Mapped}</span></StatRow>
        <StatRow label="6to4 Prefix"><span style={mono}>{r.sixToFour}</span></StatRow>
      </StatList>
    </>
  );
}

function NetworkTable({ table }) {
  return (
    <section className="card" style={{ padding: 18 }} aria-labelledby="ipv4-networks">
      <h3 id="ipv4-networks" style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>{table.title}</h3>
      <div style={{ overflowX: "auto", maxHeight: 520, overflowY: "auto" }}>
        <table className="data-table data-table-head" style={tableStyle}>
          <thead><tr><th>Network Address</th><th>Usable Host Range</th><th>Broadcast Address</th></tr></thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.network} style={row.current ? currentRow : undefined} aria-current={row.current || undefined}>
                <td style={{ ...mono, whiteSpace: "nowrap" }}>{row.network}</td>
                <td style={{ ...mono, whiteSpace: "nowrap" }}>{row.usable}</td>
                <td style={{ ...mono, whiteSpace: "nowrap" }}>{row.broadcast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 8 }}>The highlighted row is the network your IP address belongs to.</p>
    </section>
  );
}

function Ipv6Result({ r }) {
  return (
    <>
      <HighlightSummary
        label="Prefix length" value={`/${r.prefix}`} color="var(--accent)"
        note={<>2<sup>{128 - r.prefix}</sup> IP addresses</>}
      />
      <StatList>
        <StatRow label="IP Address"><span style={mono}>{r.ipAddress}</span></StatRow>
        <StatRow label="Full IP Address"><span style={mono}>{r.fullAddress}</span></StatRow>
        <StatRow label="Total IP Addresses">{r.totalAddresses}</StatRow>
        {r.total64Networks && <StatRow label="Total /64 Networks">{r.total64Networks}</StatRow>}
        <StatRow label="Network" tone="var(--accent)"><span style={mono}>{r.network}</span></StatRow>
        <StatRow label="IP Range" tone="var(--success)"><span style={mono}>{r.range}</span></StatRow>
      </StatList>
    </>
  );
}

const resultView = (result, Body) => {
  if (!result) return <p style={muted}>Enter the values, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  return <Body r={result} />;
};

export default function IpSubnetCalculatorTool() {
  const [v4, setV4] = useState(EMPTY_V4);
  const [v6, setV6] = useState(EMPTY_V6);
  const [r4, setR4] = useState(null); // no result until Calculate
  const [r6, setR6] = useState(null);
  const req4 = useRequiredFields();
  const req6 = useRequiredFields();

  // Inputs never recalculate on their own: a result keeps the settings it was calculated with until Calculate.
  const run = (calc, state, req) => {
    const r = calc(state);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const calc4 = () => setR4(run(calculateIpv4, v4, req4));
  const calc6 = () => setR6(run(calculateIpv6, v6, req6));
  const clear4 = () => { setV4(EMPTY_V4()); setR4(null); req4.clear(); };
  const clear6 = () => { setV6(EMPTY_V6()); setR6(null); req6.clear(); };

  const v4Form = (
    <>
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
        <legend style={{ display: "block", marginBottom: 6 }}><FieldLabel>Network Class</FieldLabel></legend>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {NETWORK_CLASSES.map((c) => (
            <RadioOption
              key={c.value} label={c.label} checked={v4.cls === c.value}
              onChange={() => setV4({ ...v4, cls: c.value, prefix: subnetAfterClassChange(c.value, v4.prefix) })}
            />
          ))}
        </div>
      </fieldset>
      <label style={fieldWrap}>
        <FieldLabel>Subnet</FieldLabel>
        <SelectField value={v4.prefix} onChange={(prefix) => setV4({ ...v4, prefix })} options={subnetsForClass(v4.cls)} style={mono} />
      </label>
      <div style={fieldWrap}>
        <FieldLabel>IP Address</FieldLabel>
        <Req name="ipv4" flagged={req4.flagged}>
          <IpField label="IPv4 address" value={v4.ip} onChange={(ip) => setV4({ ...v4, ip })} placeholder={PLACEHOLDERS.ipv4} onEnter={calc4} />
        </Req>
      </div>
      <ButtonRow onCalculate={calc4} onClear={clear4} />
    </>
  );

  const v6Form = (
    <>
      <label style={fieldWrap}>
        <FieldLabel>Prefix Length</FieldLabel>
        <SelectField value={v6.prefix} onChange={(prefix) => setV6({ ...v6, prefix })} options={IPV6_PREFIXES} />
      </label>
      <div style={fieldWrap}>
        <FieldLabel>IP Address</FieldLabel>
        <Req name="ipv6" flagged={req6.flagged}>
          <IpField label="IPv6 address" value={v6.ip} onChange={(ip) => setV6({ ...v6, ip })} placeholder={PLACEHOLDERS.ipv6} onEnter={calc6} />
        </Req>
      </div>
      <ButtonRow onCalculate={calc6} onClear={clear6} />
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <p style={para}>
        This calculator returns a variety of information about Internet Protocol version 4 (IPv4) and IPv6 subnets, including the possible
        network addresses, usable host ranges, subnet mask and IP class, among others.
      </p>
      <Section title="IPv4 Subnet Calculator" id="ipv4-subnet" form={v4Form} result={resultView(r4, Ipv4Result)} />
      {r4 && r4.table && <NetworkTable table={r4.table} />}
      <Section title="IPv6 Subnet Calculator" id="ipv6-subnet" form={v6Form} result={resultView(r6, Ipv6Result)} />
    </div>
  );
}
