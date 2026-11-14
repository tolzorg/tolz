import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { IPV4_SUBNETS, formatThousands } from "../../../utils/ipSubnetCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is a subnet?",
    a: "A subnet (subnetwork) is a division of an IP network. Subnetting splits one network into two or more smaller networks, and routers pass traffic between them, acting as the boundary between subnets.",
  },
  {
    q: "How do I find the network and broadcast address?",
    a: "Write the IP address and the subnet mask in binary. The network address keeps the network bits of the IP and sets every host bit to 0 (a bitwise AND with the mask). The broadcast address keeps the same network bits and sets every host bit to 1.",
  },
  {
    q: "How many usable hosts does a subnet have?",
    a: "A /n IPv4 subnet has 2^(32 − n) addresses. Two of them, the network and the broadcast address, can't be given to a host, so the usable hosts are 2^(32 − n) − 2. A /31 (a point-to-point link) and a /32 (a single address) have no usable host range in the usual sense.",
  },
  {
    q: "What is a wildcard mask?",
    a: "The wildcard mask is the subnet mask with every bit flipped, so 255.255.255.252 becomes 0.0.0.3. Routers and firewalls, for example in Cisco access lists, use it to say which bits of an address can vary.",
  },
  {
    q: "Which IP addresses are private?",
    a: "The private IPv4 ranges set aside by RFC 1918 are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. They are used inside home and company networks and aren't routed on the public internet. The calculator marks every other address as public.",
  },
  {
    q: "Why does the calculator show the IP class of the subnet?",
    a: "As on the reference calculator, the IP class shown follows the prefix length: /8 to /15 is class A, /16 to /23 class B and /24 to /32 class C. The Network Class option only limits the subnet list to masks that fit that class.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. The addresses you enter aren't sent anywhere or stored, and you don't need to sign up.",
  },
];

const CLASS_BEFORE = { 8: "Class A", 16: "Class B", 24: "Class C" };
const TYPICAL = [...IPV4_SUBNETS].reverse().map(({ value, label }) => {
  const p = Number(value);
  return { p, mask: label.split(" ")[0], hosts: formatThousands(p >= 31 ? 0 : 2 ** (32 - p) - 2) };
});

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 520 };
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

export default function IpSubnetCalculatorFaqSection() {
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
        <h2 style={h2Style}>IP Subnet Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} IP subnet calculator takes an IP address and a subnet mask (or an IPv6 prefix length) and returns everything
          about the subnet it belongs to:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>The network and broadcast addresses and the usable host range;</li>
          <li>The total and usable number of hosts;</li>
          <li>The subnet mask, wildcard mask and binary subnet mask;</li>
          <li>The IP class, CIDR notation and whether the address is public or private;</li>
          <li>The address in binary, integer, hex, in-addr.arpa, IPv4-mapped IPv6 and 6to4 form;</li>
          <li>Every other subnet of the same size in the surrounding class block;</li>
          <li>For IPv6: the full address, the number of addresses and /64 networks, the network and the address range.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Subnet?</h2>
        <p style={pStyle}>
          A subnet is a division of an IP network. The Internet Protocol suite, usually called TCP/IP (Transmission Control Protocol /
          Internet Protocol), is the set of communication protocols used on the internet and on similar networks.
        </p>
        <p style={pStyle}>
          Dividing a network into two or more separate networks is called subnetting. Routers exchange traffic between the subnetworks and
          act as the physical boundary between them. IPv4 is still the most common addressing architecture, though IPv6 use has been growing
          since 2006.
        </p>
        <p style={pStyle}>
          An IP address is made of a network number (the routing prefix) and a rest field (the host identifier), which is specific to one host
          or network interface. The routing prefix is often written in Classless Inter-Domain Routing (CIDR) notation for both IPv4 and IPv6,
          as the address, a slash and the prefix length. In IPv4 the network can also be described by a subnet mask in dot-decimal notation,
          as in the calculator&apos;s Subnet field. All hosts on a subnet share the same network prefix, while each host identifier is unique.
          In IPv6 the prefix length does the job of the subnet mask: it is the number of bits that belong to the network.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before CIDR, an IPv4 network prefix could be read straight from the address&apos;s class (A, B or C, each covering a range of
          addresses). Since CIDR, assigning an address to a network interface needs both the address and its network mask. To turn a CIDR
          block into an address range, or a range into CIDR blocks, see the{" "}
          {link("/calculators/tech-electronics/cidr-calculator", "CIDR calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Typical IPv4 Subnets</h2>
        <p style={pStyle}>The table below lists every IPv4 prefix size with its network mask and the number of usable hosts per subnet.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Prefix size</th><th>Network mask</th><th style={{ textAlign: "right" }}>Usable hosts per subnet</th></tr></thead>
            <tbody>
              {TYPICAL.map(({ p, mask, hosts }) => (
                <FragmentRows key={p} p={p} mask={mask} hosts={hosts} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Calculator Works</h2>
        <p style={pStyle}>For an IPv4 address and a /n subnet mask:</p>
        <ul style={listStyle}>
          <li><strong>Network address</strong> = IP address AND subnet mask (host bits set to 0);</li>
          <li><strong>Broadcast address</strong> = network address OR wildcard mask (host bits set to 1);</li>
          <li><strong>Total hosts</strong> = 2<sup>32 − n</sup>, and <strong>usable hosts</strong> = 2<sup>32 − n</sup> − 2 (0 for /31 and /32);</li>
          <li><strong>Usable host range</strong> = network address + 1 to broadcast address − 1.</li>
        </ul>
        <p style={pStyle}>
          For example, 39.60.120.63 with the mask 255.255.255.252 (/30) belongs to the network 39.60.120.60. Its broadcast address is
          39.60.120.63, so the usable hosts are 39.60.120.61 and 39.60.120.62.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For IPv6 the same logic applies to 128 bits: a /n prefix holds 2<sup>128 − n</sup> addresses, and a prefix shorter than /64 holds
          2<sup>64 − n</sup> /64 networks, the usual size of a single IPv6 subnet. Valid IPv6 shorthand such as <span style={mono}>::1</span>{" "}
          and embedded IPv4 addresses such as <span style={mono}>::ffff:192.168.1.1</span> are accepted. More tools are in the{" "}
          {link("/calculators/internet-network", "internet and network calculators")}.
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

/** One prefix row, preceded by a class label row at /8, /16 and /24 (as the reference's table). */
function FragmentRows({ p, mask, hosts }) {
  return (
    <>
      {CLASS_BEFORE[p] && <tr><td colSpan={3} style={{ textAlign: "center", fontWeight: 700 }}>{CLASS_BEFORE[p]}</td></tr>}
      <tr><td>/{p}</td><td style={mono}>{mask}</td><td style={{ textAlign: "right" }}>{hosts}</td></tr>
    </>
  );
}
