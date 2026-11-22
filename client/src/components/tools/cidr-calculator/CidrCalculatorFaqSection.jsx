import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a CIDR calculator?", a: "A CIDR calculator converts a CIDR block into its IPv4 details: subnet mask, wildcard bits, network and broadcast addresses, range, and host count. It can also convert a start and end IP into CIDR notation." },
  { q: "How do I convert CIDR to an IP range?", a: "Choose CIDR to IPv4 range, enter the address and prefix, such as 192.168.10.0/26, and click Calculate. The tool returns the first and last addresses (192.168.10.0 to 192.168.10.63) along with the mask and host counts." },
  { q: "How do I convert an IP range to CIDR?", a: "Choose IPv4 range to CIDR and enter the first and last IP addresses. If the range fits one block, you get a single CIDR entry. If it does not, you get the list of blocks that covers it exactly." },
  { q: "How many IP addresses are in a /24?", a: "A /24 contains 256 addresses, of which 254 are available for hosts. The subnet mask is 255.255.255.0." },
  { q: "What CIDR notation is 255.255.248.0?", a: "It is /21. The mask has 8 + 8 + 5 = 21 one-bits. A /21 holds 2,048 addresses." },
  { q: "What CIDR is 255.255.255.252?", a: "It is /30, which holds 4 addresses and 2 usable hosts." },
  { q: "What is the CIDR for 255.255.240.0?", a: "It is /20, which holds 4,096 addresses." },
  { q: "What is the difference between a subnet mask and a wildcard mask?", a: "A wildcard mask is the inverse of the subnet mask. For 255.255.255.0 the wildcard is 0.0.0.255. Subnet masks are used for interface configuration, while wildcard masks appear in ACLs and routing protocol statements on some platforms." },
  { q: "Why are two addresses unavailable in a subnet?", a: "The first address identifies the network and the last is the broadcast address. Neither can be assigned to a host. The exceptions are /31 point-to-point links under RFC 3021 and /32 single-host routes." },
  { q: "What is the CIDR for a single IP address?", a: "A single IPv4 address is written as /32, for example 203.0.113.25/32." },
  { q: "What is the difference between CIDR and VLSM?", a: "CIDR is the addressing system that allows any prefix length. VLSM is the practice of using different prefix lengths for different subnets inside one network." },
  { q: "Is CIDR used in IPv6?", a: "Yes. IPv6 uses the same slash notation, with a prefix between /0 and /128. This calculator supports IPv4 only." },
  { q: "What is the minimum and maximum VPC CIDR size in AWS?", a: "For IPv4, AWS allows VPC blocks from /16 down to /28." },
  { q: "Is this CIDR calculator free?", a: "Yes. It is free to use, with no hidden charges and no signup." },
];
// The supplied FAQ schema matches the list above word for word (its last two
// entries were cut off in the paste, so they are taken from the visible FAQ).

const MASK_HEADERS = ["Subnet Mask", "CIDR Prefix"];
const MASK_ROWS = [
  ["255.255.255.0", "/24"], ["255.255.255.252", "/30"], ["255.255.248.0", "/21"], ["255.255.240.0", "/20"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 260 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is CIDR?">
        <P>
          CIDR stands for Classless Inter-Domain Routing. It is the method the internet uses to allocate and route IP addresses, and it replaced the
          older system of fixed Class A, B, and C networks in the early 1990s. The word “classless” is the key. Instead of forcing every network
          into one of three set sizes, CIDR lets a network be almost any size by attaching a prefix length to the address. That prefix tells you
          how many leading bits identify the network and how many are left over for hosts.
        </P>
        <H3>What Is CIDR in a Computer Network?</H3>
        <P>
          In a working network, CIDR is how addresses are divided up, written down, and advertised. When an administrator carves out a block for an
          office, a cloud network, or a customer, that block is described in CIDR. When a router decides where to send a packet, it compares the
          destination address against CIDR prefixes in its routing table and picks the best match.
        </P>
        <H3>What Is a CIDR Address?</H3>
        <P>
          People often say “CIDR address,” but there is no separate kind of address. A CIDR address is an ordinary IPv4 address written together
          with a prefix, like 10.4.0.0/16. The address part identifies a spot in the address space, and the prefix describes how large the block
          is. Together they describe a whole group of addresses, not just one.
        </P>
        <H3>What Is the Purpose of a CIDR Block?</H3>
        <P>
          A CIDR block is a range of consecutive IP addresses managed as one unit. Its purpose is to let you assign, route, and filter traffic for a
          whole group of addresses with a single entry. A firewall rule that allows 203.0.113.0/24 replaces 256 separate rules. A routing table
          entry for 10.8.0.0/16 covers 65,536 addresses.
        </P>
        <H3>Why CIDR Is Important</H3>
        <P>
          Before CIDR, address space was wasted at a rate the internet could not sustain. A company that needed 500 addresses was too big for a
          Class C network, which holds 254 hosts, so it received a Class B, which holds more than 65,000. Most of those addresses sat unused, and
          routing tables kept growing as the number of networks increased. CIDR solved both problems. That same company can take a /23, which
          provides 510 usable hosts, and leave the rest of the space for someone else.
        </P>
      </Card>

      <Card title="CIDR Notation Explained">
        <H3>How Does CIDR Notation for IP Addresses Work?</H3>
        <P>
          CIDR notation has three parts: an IP address, a slash, and a number between 0 and 32. The number is the count of consecutive 1-bits at
          the start of the 32-bit <Link to="/tools/ip-subnet-calculator" className="inline-home-link">subnet mask</Link>. In 10.4.0.0/16, the first 16 bits are the network portion and the remaining 16 bits identify hosts.
          The longer the prefix, the smaller the block. A /8 is huge, a /24 is a typical LAN, and a /32 is a single address.
        </P>
        <P>
          The number of addresses in any block is 2 raised to the power of (32 minus the prefix). A /24 holds 256 addresses, a /16 holds 65,536,
          and a /8 holds 16,777,216. Each step in the prefix halves or doubles the size, which is why a /25 is exactly half of a /24.
        </P>
        <H3>What Is IPv4 CIDR?</H3>
        <P>
          IPv4 CIDR is simply CIDR applied to 32-bit IPv4 addresses, which is what this calculator handles. An IPv4 address is four numbers from 0
          to 255, and each number is 8 bits. The prefix length can be anywhere from /0 to /32, and every valid value corresponds to a subnet mask.
        </P>
        <H3>What Is a Subnet CIDR, and What Is the CIDR Value of a Subnet?</H3>
        <P>
          A subnet CIDR is the CIDR block assigned to one subnet, such as 192.168.20.0/24 for a floor of an office. The “CIDR value” is the prefix
          length, the number after the slash. It tells you how big the subnet is and what its mask is. A value of 24 means 255.255.255.0, a value
          of 26 means 255.255.255.192, and so on.
        </P>
        <H3>Is the Subnet Mask in CIDR Notation 24?</H3>
        <P>
          Not exactly. The 24 in a /24 is the prefix length, which is the number of 1-bits in the mask. The subnet mask itself is 255.255.255.0.
          They describe the same thing in two formats, and /24 is a very common value, which is why people often use the two interchangeably.
        </P>
        <H3>Which Class of Network Does CIDR Use?</H3>
        <P>
          None. CIDR does not use classes, and that is the whole point. In the old classful system, the first few bits of an address decided its
          class: Class A networks had a fixed /8, Class B a fixed /16, and Class C a fixed /24. CIDR ignores those boundaries, so a /22, a /19, or a
          /27 is perfectly valid. You will still hear the old class names used as shorthand for those three sizes.
        </P>
        <H3>What Is the Difference Between Classless Addressing and CIDR?</H3>
        <P>
          There is no practical difference. Classless addressing is the concept, and CIDR is the standard that defines it, along with the slash
          notation and the routing method that goes with it. The most important distinction is the one between CIDR and classful routing. In
          classful routing, a device assumed the mask from the address’s class. In CIDR, the mask always travels with the address, so a router
          never has to guess.
        </P>
      </Card>

      <Card title="Benefits and Advantages of CIDR">
        <P>The main advantages of CIDR are practical ones:</P>
        <List items={[
          ["Less wasted address space.", "Blocks can be sized to fit actual need, not rounded up to a class boundary."],
          ["Smaller routing tables.", "Many contiguous networks can be advertised as one prefix."],
          ["Flexible subnetting.", "One organization can use different prefix lengths in different places."],
          ["Simpler documentation.", "One compact entry like 172.16.0.0/20 describes an entire range."],
          ["Cleaner security rules.", "Firewalls and cloud security groups accept CIDR, so one line can allow or block a whole range."],
        ]} />
        <H3>How CIDR Reduced the Size of Routing Tables</H3>
        <P>
          Under the old system, each network needed its own entry in internet routers. CIDR allows route aggregation, also called supernetting. If
          an ISP holds four consecutive /24 blocks starting at 192.168.0.0, it does not have to advertise four routes. It can advertise one:
          192.168.0.0/22. Routers elsewhere store a single entry instead of four, and multiplied across the whole internet, this kept routing tables
          from growing out of control. The method is defined in <Ext href="https://www.rfc-editor.org/rfc/rfc4632">RFC 4632</Ext>, which is still
          the reference for CIDR address allocation.
        </P>
      </Card>

      <Card title="How to Use the CIDR Calculator">
        <P>The tool has two modes, which you pick from the “I want to convert...” menu at the top.</P>
        <Lead lead="CIDR to IPv4 range.">
          Type the four octets of the IP address (the numbers separated by dots) and the subnet mask width, which is the number after the slash.
          For example, enter 172.16.5.0 and 24. Click Calculate and the result panel lists the CIDR block, the total number of IP addresses, the
          subnet mask width, the subnet mask, the prefix, the wildcard bits, the first IP (the network address), the last IP (the broadcast
          address), the full range, and the number of host addresses. Click Clear to start over.
        </Lead>
        <Lead lead="IPv4 range to CIDR.">
          Switch modes, enter the first and last IP address of the range, and calculate. If the range fits neatly into one block, you get a single
          CIDR entry. If it does not, you get several blocks that together cover the range exactly. You can copy those blocks into a firewall rule
          set or an allowlist. To learn more about any one of them, switch back to CIDR to IPv4 range mode and run it through.
        </Lead>
        <P>
          One thing to watch: if you enter an address that is not on a block boundary, such as 192.168.1.77/24, the result is still based on the
          prefix, so the network address shows as 192.168.1.0. Compare it with what you intended before you use it.
        </P>
      </Card>

      <Card title="Subnet Masks, Wildcard Bits, and How They Relate">
        <H3>What Is a Subnet Mask?</H3>
        <P>
          A subnet mask is a 32-bit value that splits an IP address into a network part and a host part. Wherever the mask has a 1, that bit
          belongs to the network. Wherever it has a 0, that bit belongs to the host. In dotted-decimal, a /24 is 255.255.255.0, a /26 is
          255.255.255.192, and a /20 is 255.255.240.0.
        </P>
        <H3>Why Do We Need a Subnet Mask, and What Is Its Purpose?</H3>
        <P>
          A device uses its subnet mask to decide whether another address is local or remote. If the destination falls inside its own network, it
          sends the traffic directly. If not, it hands the traffic to the default gateway, which is the router interface on the same subnet that
          leads elsewhere. Without a mask, a host could not tell the difference. Routers use masks the same way, when matching destinations to
          routes.
        </P>
        <H3>What Is the Difference Between a Subnet and a Subnet Mask?</H3>
        <P>
          A subnet is the group of addresses. A subnet mask is the value that defines the boundaries of that group. The subnet 192.168.10.0 with
          mask 255.255.255.192, or 192.168.10.0/26, covers the 64 addresses from .0 to .63. The subnet is the “what,” and the mask is how you
          describe its size.
        </P>
        <H3>How Do Subnet, Netmask, Broadcast Address, and CIDR Relate?</H3>
        <P>
          They are all views of the same block. The CIDR prefix gives the mask. The mask, applied to any address in the block, gives the network
          address. Setting all the host bits to 1 gives the broadcast address. Everything between those two is available for hosts. Change the
          prefix and every one of those values changes with it, which is why the calculator shows them together.
        </P>
        <H3>How Do I Calculate a Subnet Mask From an IP Address?</H3>
        <P>
          You can’t get a mask from an IP address alone, because the address does not say how many bits belong to the network. You need the prefix
          length or the mask itself. Once you have the prefix, write that many 1-bits followed by 0-bits to fill 32 and convert each group of eight
          to decimal. A /21 is 11111111.11111111.11111000.00000000, which is 255.255.248.0.
        </P>
        <H3>Wildcard Bits and Wildcard Masks in Firewalls</H3>
        <P>
          The wildcard mask is the bitwise inverse of the subnet mask. For 255.255.255.0 the wildcard is 0.0.0.255. Where a subnet mask marks the
          network portion, the wildcard marks the portion allowed to vary. In a Cisco-style access control list, a wildcard of 0.0.0.63 paired with
          192.168.10.0 matches the 64 addresses in that /26. OSPF network statements use the same format. Many newer firewalls and cloud security
          groups accept CIDR directly instead, but when a device asks for wildcard bits, the calculator gives them to you next to the subnet mask
          so you do not have to invert octets in your head. Mixing up the two masks is a common ACL mistake, and it reverses what the rule does.
        </P>
      </Card>

      <Card title="Reading the Results: Network, Broadcast, and Hosts">
        <P>
          The network address is the first address in the block, with all host bits set to zero. It identifies the subnet and is not assigned to a
          device. The broadcast address is the last address, with all host bits set to one, and it reaches every host on the subnet at once. In the
          tool, these appear as the first IP and last IP.
        </P>
        <P>
          Everything between them is available for hosts. That is why a /24 has 256 total addresses but 254 host addresses: two are reserved. The
          calculator reports both the total and the host count, because total size matters for allocation and host count matters for device
          planning. For example, the tool’s default entry, 248.0.0.0/5, returns 134,217,728 addresses in the range and 134,217,726 host addresses.
        </P>
        <P>
          Two small blocks break the usual rule. A /32 is a single address, common in routing tables and loopback interfaces. A /31 holds two
          addresses and, under RFC 3021, both can be used on point-to-point links. A /30 gives two usable hosts and remains common on older router
          links. For these three, double-check the host count against your own design instead of relying on the standard “total minus two” rule.
        </P>
      </Card>

      <Card title="How to Calculate an IP Range From CIDR">
        <P>You can do this by hand in three steps. Let’s use 10.20.30.200/26.</P>
        <List ordered items={[
          ["Find the subnet mask.", "The /26 means 26 one-bits followed by 6 zero-bits, so the mask is 255.255.255.192."],
          ["Apply the mask.", "Write the address in binary and keep only the first 26 bits, using a bitwise AND. The last octet, 200, is 11001000. The mask’s last octet, 192, is 11000000. AND them together and you get 11000000, which is 192. The network address is 10.20.30.192."],
          ["Fill in the host bits.", "The 6 bits not covered by the mask are the wildcard bits. Set them all to 0 for the first address (10.20.30.192) and all to 1 for the last (10.20.30.255). The block holds 2^6 = 64 addresses, and 62 of them are available for hosts."],
        ]} />
        <P>The calculator does these steps for you, so it is a good way to check your manual work.</P>
      </Card>

      <Card title="CIDR to IP Range: A Worked Example">
        <P>Take 192.168.10.0/26. The prefix leaves 6 host bits, so the block holds 64 addresses.</P>
        <List items={[
          ["Subnet mask:", "255.255.255.192"],
          ["Wildcard bits:", "0.0.0.63"],
          ["First IP (network address):", "192.168.10.0"],
          ["Last IP (broadcast address):", "192.168.10.63"],
          ["Host addresses:", "62, running from 192.168.10.1 to 192.168.10.62"],
        ]} />
        <P>
          The next /26 begins at 192.168.10.64, then .128, then .192, so a single /24 splits into four equal /26 subnets. Seeing these boundaries is
          what makes the tool useful for subnet planning. You can step through each block and confirm nothing overlaps before assigning it to a
          VLAN or branch office.
        </P>
      </Card>

      <Card title="How Do You Calculate CIDR From a Mask, an IP, or a Range?">
        <H3>How Do You Calculate the CIDR Value?</H3>
        <P>
          If you have a subnet mask, count the one-bits. Each 255 is eight bits, and partial octets use these values: 128 is 1 bit, 192 is 2, 224 is
          3, 240 is 4, 248 is 5, 252 is 6, and 254 is 7. Add them up and that is your prefix. A few common ones:
        </P>
        <DataTable headers={MASK_HEADERS} rows={MASK_ROWS} />
        <P>
          So 255.255.248.0 is 8 + 8 + 5 = /21, 255.255.240.0 is 8 + 8 + 4 = /20, and 255.255.255.252 is 8 + 8 + 8 + 6 = /30. A network with mask
          255.255.255.0 is a /24.
        </P>
        <H3>How Do You Determine CIDR From an IP Address?</H3>
        <P>
          A single IP address does not carry its own prefix. If someone asks for the CIDR of a public address like 102.91.4.152, the answer depends
          on what you mean. On its own it is a /32. The larger block it belongs to is decided by whoever holds the allocation, and you can find that
          by searching the address in a WHOIS or RDAP lookup at the regional internet registry. For a private or internal address, check the
          interface or router configuration, which shows the mask in use.
        </P>
        <H3>IP Range to CIDR: Converting Start and End Addresses</H3>
        <P>
          Ranges are common in vendor documents, abuse reports, geolocation data, and cloud provider lists, but most firewalls and route tables want
          CIDR. The conversion is simple when the range is aligned to a power-of-two boundary. The range 10.0.0.0 to 10.0.3.255 covers exactly
          1,024 addresses and becomes a single block, 10.0.0.0/22.
        </P>
        <P>
          Many ranges are not aligned. Consider 192.168.1.10 to 192.168.1.20. No single prefix covers it without including extra addresses, so the
          exact answer is four blocks: 192.168.1.10/31, 192.168.1.12/30, 192.168.1.16/30, and 192.168.1.20/32.
        </P>
        <P>
          The method is to start at the first address, choose the largest block that begins on a valid boundary and does not run past the end of
          the range, then repeat from the next address until you reach the end. There is no shortcut, and an off-by-one mistake can leave a host
          unblocked or accidentally allow a neighbor. The tool returns the exact list of blocks, so what you paste in matches the range and nothing
          more.
        </P>
      </Card>

      <Card title="How Do You Split a CIDR Block Into Subnets?">
        <P>
          Each bit you add to the prefix cuts a block in half. A /24 splits into two /25 blocks, four /26 blocks, eight /27 blocks, or sixteen /28
          blocks. To find the starting address of each new subnet, add the block size to the previous start. For a /26, the size is 64, so a /24
          starting at 192.168.10.0 splits at .0, .64, .128, and .192.
        </P>
        <P>
          The calculator shows one block at a time, so to verify a split, run each new block through it and confirm that the ranges touch but do not
          overlap. Variable-length subnet masking (VLSM) lets you mix sizes, giving a 200-device floor a /24 and a 10-device lab a /28.
        </P>
      </Card>

      <Card title="CIDR vs. Subnetting, Supernetting, and VLSM">
        <P>These terms overlap, and people mix them up. Here is how they differ.</P>
        <P>
          Subnetting divides one network into smaller ones by lengthening the prefix. Supernetting does the reverse: it combines several contiguous
          networks into one larger block by shortening the prefix, as in the 192.168.0.0/22 example above. CIDR is the overall addressing system
          that makes both possible, because it allows any prefix length. VLSM is a technique within that system. It means using subnets of
          different sizes inside the same network, so each segment gets only as many addresses as it needs. In short, CIDR is the framework,
          subnetting and supernetting are the two directions you can move, and VLSM is the practice of mixing sizes.
        </P>
      </Card>

      <Card title="Does CIDR Still Apply to IPv6?">
        <P>
          Yes. IPv6 uses the same slash notation with a prefix length, but over 128 bits. A typical home or site assignment is a /48 or /64, such
          as 2001:db8:1234::/48. The concept is identical, but the planning conventions are different, and this calculator handles IPv4 only.
        </P>
      </Card>

      <Card title="CIDR in AWS and Other Cloud Networks">
        <P>Cloud platforms ask for CIDR at the start, so it helps to understand how they use it. This section uses AWS as an example, and other providers work in a similar way.</P>
        <H3>What Is CIDR in AWS?</H3>
        <P>
          When you create a virtual private cloud (VPC) in AWS, you give it a primary IPv4 CIDR block. Every subnet you create inside it takes a
          smaller CIDR block from that range. Security group and network ACL rules also use CIDR to define which addresses are allowed in or out.
          In a rule, 0.0.0.0/0 means all IPv4 addresses, and 203.0.113.25/32 means exactly one.
        </P>
        <H3>What Is the Minimum and Maximum VPC CIDR Range?</H3>
        <P>
          For IPv4, AWS allows a VPC block between /16 and /28, according to the{" "}
          <Ext href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html">AWS VPC documentation</Ext>. A /16 gives you 65,536
          addresses and a /28 gives you 16. Keep in mind that AWS reserves five addresses in every subnet, so the usable count is lower than the
          standard total minus two.
        </P>
        <H3>How Do I Choose a CIDR for a VPC?</H3>
        <P>Start with the private ranges from RFC 1918: 10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16. Then:</P>
        <List items={[
          ["", "Pick a block large enough for growth. Resizing later is harder than starting with room to spare."],
          ["", "Avoid overlapping with your office network, other VPCs, or partners. Overlaps block peering and VPN connections."],
          ["", "Plan how you will divide it, such as separate subnets for public, private, and database tiers, and check each subnet’s range in the calculator before you build."],
        ]} />
        <H3>CIDR Rules for Access in AWS</H3>
        <P>
          Access rules take CIDR blocks as their source or destination. Use the narrowest block that does the job. A /32 for a single
          administrator’s IP is much safer than opening a /16, and 0.0.0.0/0 should be reserved for services that truly need public access. Before
          you save a rule, confirm what the block spans.
        </P>
      </Card>

      <Card title="CIDR Notation Cheat Sheet for Common Prefixes">
        <P>
          A few prefixes show up constantly. A /8 holds about 16.7 million addresses, a /12 holds 1,048,576, and a /16 holds 65,536. A /20 holds
          4,096, a /24 holds 256, a /27 holds 32, a /28 holds 16, a /29 holds 8, and a /30 holds 4. The private ranges defined in RFC 1918 are
          10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. Many networks also use 169.254.0.0/16 for link-local addressing and 127.0.0.0/8 for
          loopback. For anything outside these, run the prefix through the CIDR calculator instead of trusting memory.
        </P>
      </Card>

      <Card title="When You Need a CIDR Calculator">
        <List items={[
          ["Designing a cloud network.", "Cloud virtual networks need a CIDR block up front, and subnets inside them must fit without overlap. Mapping subnet sizes before deploying saves painful rebuilds later."],
          ["Writing firewall and security group rules.", "A vague or oversized prefix can expose more than you intended. Confirm exactly what a block spans before it goes live."],
          ["Planning VLANs and office subnets.", "Check that each block is big enough for its devices and see where each one starts and ends."],
          ["Summarizing routes.", "Network engineers combine contiguous subnets into one summary prefix to shrink routing tables. Checking that the summary covers only the intended blocks avoids black-holing traffic."],
          ["Converting vendor IP lists.", "Cloud providers, CDNs, and abuse reports often publish plain ranges. Converting them to CIDR makes them ready to load into a firewall or allowlist."],
          ["Studying for networking exams.", "Students preparing for CCNA, Network+, or similar certifications can verify manual subnetting work and spot where they slipped."],
          ["Troubleshooting.", "When two hosts cannot communicate, comparing their addresses against the same mask often reveals that one sits in a different subnet than expected."],
        ]} />
      </Card>

      <Card title="Common CIDR and Subnetting Mistakes">
        <P>
          The most frequent error is assigning the network or broadcast address to a device. The second is entering a host address with a prefix
          and assuming it is the network address. The tool’s output makes the true boundary obvious. A third is overlapping subnets: 10.0.0.0/23
          already contains 10.0.1.0/24, so allocating both causes routing conflicts. Another is mixing up subnet and wildcard masks when writing
          ACLs, which flips the rule’s meaning. Finally, people often forget that a prefix is not a mask: /24 is a count of bits, not the number 24
          in an octet.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
