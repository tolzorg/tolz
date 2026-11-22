import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is an IP subnet calculator?", a: "An IP subnet calculator takes an IP address and a subnet mask or prefix length and returns the network address, broadcast address, usable host range, wildcard mask, IP class and other networks of the same size. It removes the need for manual binary conversion." },
  { q: "How many usable hosts are in a /26 subnet?", a: "A /26 has 64 addresses in total and 62 usable hosts. The first address is the network address and the last is the broadcast address." },
  { q: "How many usable hosts are in a /24 subnet?", a: "A /24 has 256 addresses in total and 254 usable hosts, because the network address and broadcast address are reserved." },
  { q: "What is the difference between a subnet mask and a wildcard mask?", a: "A wildcard mask is the bitwise inverse of the subnet mask. A subnet mask marks which bits belong to the network, while a wildcard mask marks which bits can vary. Cisco ACLs and OSPF configurations use wildcard masks." },
  { q: "How do I find my subnet mask?", a: "On Windows, run ipconfig in Command Prompt. On macOS or Linux, run ifconfig or ip addr. You can also check the network details on your router or phone. Then enter your IP address and mask in the calculator to see your full subnet." },
  { q: "Does CIDR notation replace the subnet mask?", a: "No. CIDR notation is a shorter way to write the same information. A /24 and 255.255.255.0 mean the same thing. What CIDR changed is that networks no longer have to follow fixed class sizes." },
  { q: "Can this calculator handle IPv6 subnets?", a: "Yes. Enter an IPv6 address and a prefix length such as /64 or /58, and the tool returns the full address, network, address range, total number of addresses and the number of /64 networks. IPv6 has no broadcast address." },
  { q: "Why are two addresses unusable in every IPv4 subnet?", a: "The first address identifies the network and the last address is used for broadcasts to all hosts in the subnet. Neither can be assigned to a device, except on /31 point-to-point links, where both addresses can be used." },
  { q: "Can I use subnet zero?", a: "Yes. Modern routers and operating systems support subnet zero, and it’s treated like any other subnet. Only very old equipment may have trouble with it." },
  { q: "Is this IP subnet calculator free to use?", a: "Yes. The tool is free to use online." },
];

// The supplied FAQ schema matches the list above with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const PREFIX_HEADERS = ["Prefix", "Subnet Mask", "Usable Hosts"];
const PREFIX_ROWS = [
  ["/8", "255.0.0.0", "16,777,214"], ["/9", "255.128.0.0", "8,388,606"], ["/10", "255.192.0.0", "4,194,302"],
  ["/11", "255.224.0.0", "2,097,150"], ["/12", "255.240.0.0", "1,048,574"], ["/13", "255.248.0.0", "524,286"],
  ["/14", "255.252.0.0", "262,142"], ["/15", "255.254.0.0", "131,070"], ["/16", "255.255.0.0", "65,534"],
  ["/17", "255.255.128.0", "32,766"], ["/18", "255.255.192.0", "16,382"], ["/19", "255.255.224.0", "8,190"],
  ["/20", "255.255.240.0", "4,094"], ["/21", "255.255.248.0", "2,046"], ["/22", "255.255.252.0", "1,022"],
  ["/23", "255.255.254.0", "510"], ["/24", "255.255.255.0", "254"], ["/25", "255.255.255.128", "126"],
  ["/26", "255.255.255.192", "62"], ["/27", "255.255.255.224", "30"], ["/28", "255.255.255.240", "14"],
  ["/29", "255.255.255.248", "6"], ["/30", "255.255.255.252", "2"], ["/31", "255.255.255.254", "0 (2 on point-to-point links)"],
  ["/32", "255.255.255.255", "Single address"],
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
const codeStyle = { fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--text-primary)", wordBreak: "break-all" };

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
const C = ({ children }) => <code style={codeStyle}>{children}</code>;
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
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

export default function IpSubnetCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is an IP Subnet?">
        <P>
          An IP subnet, short for subnetwork, is a smaller section of a larger IP network. Devices on the same subnet share the same network prefix
          and can reach each other directly. To reach a device on a different subnet, traffic has to pass through a router, which acts as the
          boundary between the two. The “IP” here is the Internet Protocol, the addressing system in TCP/IP that the internet and most private
          networks run on.
        </P>
        <P>
          Every IP address has two parts. The first is the network portion, also called the routing prefix. It’s the same for every device in the
          subnet. The second is the host portion, or host identifier, which is unique to each device or network interface. The subnet mask (or
          prefix length) decides where one part ends and the other begins. IPv4 is still the most widely used addressing system, though IPv6
          adoption has been growing steadily for years.
        </P>
      </Card>

      <Card title="What Is IP Subnetting?">
        <P>
          Subnetting is the process of splitting one network into two or more smaller ones. You do it by borrowing bits from the host portion of the
          address and using them as extra network bits. Each borrowed bit doubles the number of subnets and cuts the number of hosts in each one in
          half.
        </P>
        <P>
          Networks get subnetted for a few practical reasons. Smaller subnets mean smaller broadcast domains, which cuts unnecessary traffic. They
          make it easier to write security rules for one group of devices, such as servers, guest Wi-Fi or a finance department. They also let you
          use address space without wasting it. If you’ve seen “subnetting” and “IP subnetting” used as if they were different things, they aren’t.
          Both mean dividing an IP network into smaller parts.
        </P>
      </Card>

      <Card title="What Is an IP Subnet Mask and What Is It Used For?">
        <P>
          An IPv4 subnet mask is a 32-bit number that marks which bits of an address belong to the network and which belong to the host. It’s
          written in four decimal groups, like 255.255.255.0. Every 1 bit in the mask is a network bit, and every 0 bit is a host bit.
        </P>
        <P>
          The mask does one main job: it tells a device whether another address is local or remote. A device compares its own address and the
          destination address using the mask. If both land on the same network address, it delivers the traffic directly. If not, it sends the
          traffic to the default gateway. For example, a computer at 192.168.1.10 with a mask of 255.255.255.0 will talk straight to 192.168.1.50,
          but it will send traffic for 192.168.2.5 to its router.
        </P>
        <P>
          The mask also defines how big the subnet is. A mask of 255.255.255.0 leaves 8 host bits, which gives 256 addresses. A mask of
          255.255.255.192 leaves 6 host bits, which gives 64. That’s why the same IP address behaves very differently depending on the mask paired
          with it.
        </P>
      </Card>

      <Card title="What Is the IPv4 Subnet Prefix Length, and Does CIDR Replace the Mask?">
        <P>
          The prefix length is the number of leading 1 bits in the subnet mask, written after a slash. A /27 means 27 network bits, which is the same
          as the mask 255.255.255.224. For IPv4, the prefix length can run from /0 to /32.
        </P>
        <P>
          CIDR (Classless Inter-Domain Routing) is the system that made this notation standard. Before CIDR, a device could work out the network
          portion from the address class alone. Since CIDR, an address always has to come with its mask or prefix length. CIDR doesn’t do away with
          the mask. The slash is just a shorter way to write the same information, so 192.168.1.0/24 and 192.168.1.0 with 255.255.255.0 mean
          exactly the same thing. What CIDR did remove is the old requirement that networks be sized only as /8, /16 or /24. You can now use any
          prefix, such as /22 or /27, anywhere.
        </P>
      </Card>

      <Card title="IP Subnet Classes: What Are They Called?">
        <P>The original IPv4 system sorted addresses into five classes by the value of the first octet:</P>
        <List items={[
          ["Class A:", "1–126, default mask /8 (255.0.0.0)"],
          ["Class B:", "128–191, default mask /16 (255.255.0.0)"],
          ["Class C:", "192–223, default mask /24 (255.255.255.0)"],
          ["Class D:", "224–239, reserved for multicast"],
          ["Class E:", "240–255, reserved for experimental use"],
        ]} />
        <P>
          The 127.x.x.x range is set aside for loopback, which is why Class A stops at 126. Classes A, B and C are the ones you assign to hosts.
          Classful addressing has been replaced by CIDR in real networks, but the class is still useful context, and it still shows up in
          certification exams and older documentation. The calculator reports the class of the address you enter, and you can set the network class
          to Any, A, B or C.
        </P>
      </Card>

      <Card title="What Is Subnet Zero?">
        <P>
          When you split a network into subnets, “subnet zero” is the very first subnet, the one where all the subnet bits are 0. For example, if you
          divide 192.168.1.0/24 into four /26 subnets, subnet zero is 192.168.1.0/26. The last subnet, where all the subnet bits are 1, is sometimes
          called the all-ones subnet.
        </P>
        <P>
          Older classful guidance told engineers to avoid both, because they could be confused with the original network address and broadcast
          address. Modern routers and operating systems handle them without trouble, and Cisco IOS has allowed subnet zero by default for many
          years. Today, treat subnet zero as a normal, usable subnet unless you’re working with very old equipment.
        </P>
      </Card>

      <Card title="What Is a Private IP Subnet?">
        <P>
          A private IP subnet uses addresses that aren’t routed on the public internet. <Ext href="https://www.rfc-editor.org/rfc/rfc1918">RFC 1918</Ext>{" "}
          reserves three IPv4 blocks for this purpose:
        </P>
        <List items={[
          ["10.0.0.0/8", "(10.0.0.0 to 10.255.255.255)"],
          ["172.16.0.0/12", "(172.16.0.0 to 172.31.255.255)"],
          ["192.168.0.0/16", "(192.168.0.0 to 192.168.255.255)"],
        ]} />
        <P>
          Any home, office or cloud network can reuse these ranges, because they never appear on the public internet. To let private devices reach
          the internet, a router performs NAT (Network Address Translation), swapping the private address for a public one.
        </P>
        <P>
          That said, subnets aren’t a feature of NAT. Subnetting is about dividing address space, and it works exactly the same with public
          addresses. NAT is a separate technology that happens to be used alongside private subnets. When you enter an IPv4 address, the calculator
          labels it as public or private so you can tell right away which kind you’re dealing with.
        </P>
      </Card>

      <Card title="Default Gateway and the Subnet Mask">
        <P>
          The default gateway is the router interface a device uses to reach anything outside its own subnet. It has to sit inside the subnet’s
          usable host range, or the device couldn’t reach it. Many networks give the gateway the first usable address (such as 192.168.1.1) or the
          last one (such as 192.168.1.254), but that’s only a habit, not a rule.
        </P>
        <P>
          The mask and the gateway work as a pair. If the mask is wrong, a device may think a remote address is local and never send the traffic to
          the gateway, or the reverse. When a device can reach some addresses but not others, a mismatched mask is one of the first things to
          check.
        </P>
      </Card>

      <Card title="IP Subnet vs. Ethernet Network">
        <P>
          These two terms describe different layers. An Ethernet network is a Layer 2 concept: devices connected by switches that forward frames
          using MAC addresses. An IP subnet is a Layer 3 concept: a group of devices that share an IP network prefix.
        </P>
        <P>
          In most designs, one subnet maps to one VLAN, which is one Ethernet broadcast domain. Routers connect different subnets. It’s technically
          possible to run several subnets over one physical Ethernet segment, or to stretch one subnet across several switches, but the usual
          practice is to keep one subnet per VLAN. Spreading a single subnet across multiple VLANs isn’t standard and tends to create
          troubleshooting problems.
        </P>
      </Card>

      <Card title="How to Use the IP Subnet Calculator">
        <P>The tool has two calculators on one page: one for IPv4 and one for IPv6.</P>
        <P>
          For IPv4, choose a network class (or leave it on Any), pick the subnet mask from the Subnet dropdown, such as 255.255.255.224 /27, and type
          the IP address, for example 74.13.134.54. Click Calculate. Clear resets the form.
        </P>
        <P>
          For IPv6, pick the prefix length, such as /58, type the address, for example <C>2001:db8:85a3::8a2e:370:7334</C>, and click Calculate.
        </P>
        <P>
          In the IPv4 example above, the tool shows that 74.13.134.54/27 belongs to the network 74.13.134.32. Usable hosts run from 74.13.134.33 to
          74.13.134.62, and the broadcast address is 74.13.134.63. Change the prefix and calculate again to compare sizes. Moving from /27 to /26
          doubles the block, which is a quick way to find the right fit for your requirements.
        </P>
      </Card>

      <Card title="What the Results Mean">
        <P>The IPv4 results include the following fields.</P>
        <H3>Network Address</H3>
        <P>
          The first address in the block. It identifies the subnet and can’t be assigned to a device in a standard IPv4 setup. In the example above,
          it’s 74.13.134.32.
        </P>
        <H3>Broadcast Address</H3>
        <P>
          The last address in the block. A packet sent to it reaches every host in the subnet, so it can’t be assigned to a device either. In the
          example, it’s 74.13.134.63. IPv6 has no broadcast address and uses multicast instead.
        </P>
        <H3>Usable Host Range, Total Hosts and Usable Hosts</H3>
        <P>
          Everything between the network and broadcast addresses can be assigned to devices. The tool shows the first and last usable address, the
          total number of addresses (32 for a /27) and the number of usable hosts (30). Usable hosts are always the total minus two.
        </P>
        <H3>Subnet Mask, Binary Subnet Mask and CIDR Notation</H3>
        <P>
          The same mask shown three ways: dotted decimal (255.255.255.224), binary (11111111.11111111.11111111.11100000) and CIDR (/27). The binary
          view makes it easy to see exactly where the network bits end.
        </P>
        <H3>Wildcard Mask</H3>
        <P>
          The wildcard mask is the inverse of the subnet mask. Where the subnet mask has a 1, the wildcard has a 0, and the other way around. For a
          /27 it’s 0.0.0.31. Cisco access control lists and OSPF network statements use wildcard masks, and mixing them up with subnet masks can open
          or block far more traffic than you intended.
        </P>
        <H3>IP Class and IP Type</H3>
        <P>The IP class (A, B or C) and whether the address is public or private, as covered above.</P>
        <H3>Other Formats</H3>
        <P>
          The tool also shows the same address in several other forms. The binary ID, integer ID and hex ID are the address written as a binary
          string, a single decimal number and a hexadecimal value. The in-addr.arpa entry is the name used for reverse DNS lookups. The IPv4-mapped
          address is the way IPv4 addresses are written inside IPv6 software. The 6to4 prefix is an IPv6 prefix derived from an IPv4 address, from an
          older transition method that has largely been retired.
        </P>
        <H3>All Possible Networks</H3>
        <P>
          Below the results, the tool lists every network of the same size within the same range, with each network’s address, usable host range
          and broadcast address. The row that contains your address is highlighted. For a /27 in 74.13.134.*, that’s eight networks. Use this list to
          plan how a block divides between departments, sites or customers without overlap.
        </P>
      </Card>

      <Card title="IPv4 Subnet Table: Prefix Size, Mask and Usable Hosts">
        <P>Here are the common prefixes, with the default boundaries for Class A (/8), Class B (/16) and Class C (/24).</P>
        <DataTable headers={PREFIX_HEADERS} rows={PREFIX_ROWS} />
        <P>
          A /31 leaves no room for a network and broadcast address under the standard formula, but RFC 3021 allows both addresses to be used on
          point-to-point links between two routers. A /32 identifies one host and is common in routing tables and loopback interfaces. Prefixes
          shorter than /8 exist but are rarely used on real networks.
        </P>
      </Card>

      <Card title="How to Find Your Own Subnet Mask">
        <P>
          On Windows, open Command Prompt and run <C>ipconfig</C>. The subnet mask appears under your active connection. On macOS or Linux, run{" "}
          <C>ifconfig</C> or <C>ip addr</C>. Linux often shows the prefix length (like /24) instead of the dotted mask. On a phone or router, look in
          the Wi-Fi or network details screen. Once you have your IP address and mask, enter them into the calculator to see your network address,
          broadcast address and usable host range.
        </P>
      </Card>

      <Card title="In IPv4 Subnets, How Do You Know Which Range to Use?">
        <P>
          There are two parts to this question. The first is which block to pick for your network. For internal networks, choose from the private
          ranges listed above. Start from the number of devices you need, add room for growth, and choose the smallest prefix that fits. Make sure
          the block doesn’t overlap any subnet you already use. Public addresses are assigned by your internet provider or a regional registry, so
          you don’t pick them freely.
        </P>
        <P>
          The second part is which addresses inside a subnet you can hand out. The answer is every address from one above the network address to one
          below the broadcast address, which the calculator shows as the usable host range. A /26 is a good example: it gives 62 usable hosts, from
          the network address plus one to the broadcast address minus one.
        </P>
      </Card>

      <Card title="IPv6 Subnetting and How It Differs From IPv4">
        <P>
          IPv6 addresses are 128 bits long, written as eight groups of hexadecimal digits. Leading zeros can be dropped, and one run of zero groups
          can be replaced with a double colon. The idea is the same as IPv4: a prefix length tells you how many leading bits identify the network.
          But IPv6 works a little differently in practice.
        </P>
        <P>
          There are no subnet masks in dotted form, only prefix lengths. There’s no broadcast address, so the range is described by its first and
          last address. The standard subnet size for a LAN is a /64, which leaves 64 bits for the interface identifier. An organization typically
          gets a /48 from its provider, which holds 65,536 separate /64 subnets. Home connections often get a /56 or /60.
        </P>
        <P>
          In the IPv6 calculator, entering <C>2001:db8:85a3::8a2e:370:7334</C> with a /58 prefix shows the full expanded address, the network (
          <C>2001:0db8:85a3:0000::</C>), the full address range, the total number of IP addresses and how many /64 networks the prefix contains (64
          for a /58).
        </P>
        <Lead lead="Do smaller subnets still matter in IPv6?">
          Yes, but for a different reason. IPv6 has so much space that conserving addresses isn’t the goal. Subnetting still matters for organizing
          the network, applying security policies, limiting the size of broadcast-like traffic and summarizing routes. Most IPv6 LANs should stay at
          /64, because features such as stateless address autoconfiguration depend on it.
        </Lead>
        <Lead lead="Can IPv6 be added to an existing IPv4 subnet?">
          You don’t place IPv6 addresses inside an IPv4 subnet. Instead, devices run both protocols side by side, which is called dual stack. The
          router advertises an IPv6 /64 prefix on the same link, and each device gets an IPv4 address and an IPv6 address. The two address plans are
          separate, so you plan and calculate them separately.
        </Lead>
      </Card>

      <Card title="How to Calculate a Subnet Manually">
        <P>Knowing the manual method helps you read the calculator’s output and remains a standard exam skill. Take 192.168.10.77/26.</P>
        <List ordered items={[
          ["", "The /26 mask is 255.255.255.192."],
          ["", "Find the block size: 256 − 192 = 64. Subnets in the last octet start at 0, 64, 128 and 192."],
          ["", "The address 77 falls in the 64–127 block, so the network address is 192.168.10.64 and the broadcast address is 192.168.10.127."],
          ["", "The usable range is 192.168.10.65 to 192.168.10.126, which is 62 hosts."],
          ["", "The wildcard mask is 255 minus each mask octet: 0.0.0.63."],
        ]} />
        <P>
          This works for any prefix, but it gets error-prone when the mask falls in the second or third octet, or when you’re splitting a block into
          unequal pieces using VLSM. In those cases, use the calculator and treat your manual work as a cross-check.
        </P>
      </Card>

      <Card title="What Is the Quickest Way to Learn Subnetting?">
        <P>
          The fastest way to learn is to memorize a few things and practice with real numbers. Learn the powers of two up to 128 (128, 64, 32, 16, 8,
          4, 2, 1), because every mask octet is built from them. Learn the mask octet values that go with them: 128, 192, 224, 240, 248, 252, 254,
          255.
        </P>
        <P>Then use these mental shortcuts:</P>
        <List items={[
          ["Block size:", "256 minus the interesting mask octet. It tells you where subnets start."],
          ["Host bits:", "32 minus the prefix gives the host bits. Usable hosts are 2 to that power, minus 2. For a /27, that’s 5 host bits, 32 addresses and 30 usable hosts."],
          ["Find the block:", "Count up in multiples of the block size until you pass your address. The number just below it is the network address, and the one just before the next multiple is the broadcast."],
        ]} />
        <P>
          Practice by picking a random address and prefix, predicting the network, broadcast and host range, and then checking your answer in the
          calculator. A few dozen rounds will make this feel natural.
        </P>
      </Card>

      <Card title="When You Need an IP Subnet Calculator">
        <Lead lead="Designing a new network.">
          Before assigning addresses to an office, you need to know whether a /24 is enough or a /23 is safer for growth. Calculating host counts for
          each VLAN up front prevents painful renumbering later.
        </Lead>
        <Lead lead="Writing firewall and ACL rules.">
          Rules often reference a network and wildcard mask or a CIDR block. Confirming exactly which addresses a rule covers stops you from
          permitting a whole range by accident.
        </Lead>
        <Lead lead="Cloud and VPC planning.">
          AWS, Azure and Google Cloud all ask for CIDR blocks when you create virtual networks. Overlapping ranges make peering and VPN connections
          impossible, so checking boundaries first saves hours of rework.
        </Lead>
        <Lead lead="Troubleshooting connectivity.">
          If two devices can’t talk, a wrong mask is a common cause. Calculating the subnet for each address shows right away whether they share a
          network.
        </Lead>
        <Lead lead="Studying for certifications.">
          CCNA, Network+ and similar exams test subnetting heavily. A calculator lets you check each answer instantly and understand why it was
          right or wrong.
        </Lead>
        <Lead lead="Splitting address space between clients or sites.">
          Service providers and IT teams divide a block among customers. The list of possible networks shows each slice without overlap.
        </Lead>
      </Card>

      <Card title="Common Subnetting Mistakes and How to Fix Them">
        <P>
          The most frequent error is assigning the network or broadcast address to a host, which causes intermittent or total failure on that
          device. The second is mixing up the subnet mask and the wildcard mask in ACLs, which reverses a rule’s intent. A third is choosing a block
          that fits today’s host count with no room for growth.
        </P>
        <P>
          People also forget that gateways, printers, servers and management addresses use part of the usable range, so the free addresses left are
          fewer than the calculator’s total. Overlapping subnets across sites or cloud networks break routing, so always check a new block against
          what already exists.
        </P>
        <P>
          If a subnet isn’t working, start by confirming the mask on every device matches the design. Next, check that each address falls inside the
          usable range, and that the gateway address is inside the same subnet. Then run the address and mask through the calculator to confirm the
          network and broadcast addresses are what you expected.
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
