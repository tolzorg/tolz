import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is classless inter-domain routing (CIDR)?",
    a: "CIDR is a method of allocating and routing IP addresses. Before CIDR, the internet used a wasteful scheme of fixed address classes for subnetworks and their hosts, and it was quickly running out of IP addresses. CIDR is called \"classless\" because it doesn't use those IP classes.",
  },
  {
    q: "What is CIDR notation?",
    a: "A compact way of writing an IP address and its subnet mask: the IP address, a slash (/), and a number from 0 to 32. That number is how many consecutive 1-bits (followed by 0-bits) make up the 32-bit subnet mask.",
  },
  {
    q: "How do I calculate the IP range from a CIDR?",
    a: "Work out the subnet mask from the number after the slash, apply it to the IP address in binary to get the network prefix, then fill the wildcard bits (those not covered by the mask) with 0s for the start of the range and with 1s for the end of the range.",
  },
  {
    q: "What is the IP range of the CIDR 10.0.0.0/8?",
    a: "10.0.0.0/8 covers the IP addresses from 10.0.0.0 to 10.255.255.255, which is 16,777,216 unique addresses.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const EXAMPLE = [
  ["IP address (172.161.25.102)", "10101100.10100001.00011001.0", "1100110"],
  ["Subnet mask /25 (255.255.255.128)", "11111111.11111111.11111111.1", "0000000"],
  ["Network prefix (172.161.25.0)", "10101100.10100001.00011001.0", "0000000"],
  ["Wildcard bits (0.0.0.127)", "00000000.00000000.00000000.0", "1111111"],
  ["First IP (172.161.25.0)", "10101100.10100001.00011001.0", "0000000"],
  ["Last IP (172.161.25.127)", "10101100.10100001.00011001.0", "1111111"],
];
const BLOCKS = [
  ["10.0.0.1/32", "10.0.0.1", "10.0.0.1", "1"], ["10.0.0.2/31", "10.0.0.2", "10.0.0.3", "2"], ["10.0.0.4/30", "10.0.0.4", "10.0.0.7", "4"],
  ["10.0.0.8/29", "10.0.0.8", "10.0.0.15", "8"], ["10.0.0.16/28", "10.0.0.16", "10.0.0.31", "16"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function FaqRow({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, padding: "13px 2px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
          {item.q}
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }} aria-hidden="true">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function CidrCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>CIDR Calculator</h2>
        <p style={pStyle}>
          Classless inter-domain routing (CIDR) changed how IP addresses are assigned, but CIDR notation isn&apos;t simple at first. The{" "}
          {link("/", "Tolz")} CIDR calculator converts a CIDR block into an IP range and, given an IP range, finds the CIDR notation that
          captures it. Below we cover:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>What classless inter-domain routing is;</li>
          <li>How to calculate the subnet mask from CIDR notation;</li>
          <li>How to calculate the IP range from a CIDR; and</li>
          <li>How to calculate the CIDR from an IP range.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the CIDR Range Calculator</h2>
        <p style={pStyle}>The calculator has two modes, chosen with <em>I want to convert...</em></p>
        <p style={{ ...pStyle, marginBottom: 6 }}>In <strong>CIDR to IPv4 range</strong> mode it finds the range of IP addresses covered by a CIDR block:</p>
        <ol style={olStyle}>
          <li>Enter the CIDR notation: the IP address and the subnet mask width.</li>
          <li>Check that the notation is correct.</li>
          <li>Read the results: the subnet mask, the network prefix, the wildcard bits, the first and last IP and the number of addresses.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 6 }}>In <strong>IPv4 range to CIDR</strong> mode it finds the network block(s) covering the range between two IP addresses:</p>
        <ol style={olStyle}>
          <li>Enter the first and the last IP address of the range.</li>
          <li>Read the matching network block(s). A single block might not fit the range exactly; then the calculator lists several blocks that cover it.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>You can check each block and learn more about it in the CIDR to IPv4 range mode.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Classless Inter-Domain Routing (CIDR)?</h2>
        <p style={pStyle}>
          CIDR is a method of allocating and routing IP addresses. Before CIDR, the internet used a rather wasteful way of allocating IP
          addresses to subnetworks and their hosts, and because of this it was quickly running out of addresses.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          CIDR is called &quot;classless&quot; because it doesn&apos;t use the &quot;IP classes&quot; that made the previous system so inefficient.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is CIDR Notation?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          CIDR notation is a compact way of writing an IP address together with its subnet mask: the IP address, a slash (/), and a number
          between 0 and 32. The number is how many consecutive 1-bits (followed by 0-bits) make up the 32-bit subnet mask, so
          192.168.0.0/24 has the mask 255.255.255.0.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the IP Range From a CIDR</h2>
        <p style={pStyle}>
          There are three steps: find the subnet mask, apply it, and use the wildcard bits to get the range. Take{" "}
          <code style={mono}>172.161.25.102/25</code> as an example.
        </p>
        <ol style={olStyle}>
          <li>
            <strong>Find the subnet mask.</strong> The number after the slash is the mask width: 25 means 25 1-bits followed by 7 0-bits (32
            bits in total), i.e. 255.255.255.128.
          </li>
          <li>
            <strong>Apply the subnet mask.</strong> Combine the mask with the IP address in binary using the bitwise AND: keep the first 25 bits
            and clear the rest. What&apos;s left is the network prefix, 172.161.25.0, which identifies the block the address belongs to.
          </li>
          <li>
            <strong>Determine the IP range.</strong> The bits not covered by the mask are the wildcard bits. The range starts at the address
            with all wildcard bits set to 0 and ends at the address with all of them set to 1.
          </li>
        </ol>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Value</th><th>Binary (wildcard bits highlighted)</th></tr></thead>
            <tbody>
              {EXAMPLE.map(([label, net, wild]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td style={{ ...mono, whiteSpace: "nowrap" }}>{net}<span style={{ color: "var(--accent)", fontWeight: 700 }}>{wild}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So the block 172.161.25.102/25 runs from 172.161.25.0 to 172.161.25.127: 2<sup>7</sup> = 128 unique IP addresses. Two of them, the
          network and the broadcast address, are usually reserved, leaving 126 host addresses.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the CIDR From an IP Range</h2>
        <p style={pStyle}>
          Going the other way is harder, because only some IP ranges are covered by exactly one CIDR block. The range 10.0.0.0 to 10.0.0.31
          is covered by the single block 10.0.0.0/27. But change the first address by one, to 10.0.0.1, and the range 10.0.0.1 to 10.0.0.31
          needs five blocks:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>CIDR</th><th>Starts at</th><th>Ends at</th><th>#</th></tr></thead>
            <tbody>{BLOCKS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={i === 3 ? center : mono}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There&apos;s no shortcut for finding these blocks by hand: each one is the largest aligned block that starts at the next uncovered
          address and still fits inside the range. The calculator&apos;s IPv4 range to CIDR mode does this for you. More tools are in the{" "}
          {link("/calculators/tech-electronics", "tech and electronics calculators")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
