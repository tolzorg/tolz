import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How to calculate CBM?",
    a: "Find the length, width and height of your package in meters and multiply them together: CBM = length × width × height. That's it: finding the CBM is quick and easy.",
  },
  {
    q: "What is the CBM of a 40 ft container?",
    a: "About 69 cubic meters. A standard 40 ft container is roughly 2.4 m × 2.4 m × 12 m, and multiplying the dimensions gives 69.12 m³. The calculator uses the internal capacity of a 40′ standard dry container, 2,350 cu ft (about 66.5 m³).",
  },
  {
    q: "How do you calculate CBM with inches?",
    a: "Measure the length, width and height of your package in inches, multiply them (CBM = length × width × height) and divide the result by 61,024 to convert cubic inches to cubic meters.",
  },
  {
    q: "Is CBM the same as volume?",
    a: "Yes. In logistics, CBM is the volume of a package or shipment in cubic meters. You can express volume in any unit, while CBM is always in cubic meters, but they describe the same thing.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const CONTAINERS = [
  ["20′ Standard Dry Container", "1,165 cu ft"],
  ["40′ Standard Dry Container", "2,350 cu ft"],
  ["40′ High Cube Dry Container", "2,694 cu ft"],
  ["45′ High Cube Dry Container", "3,043 cu ft"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const olStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "decimal" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 420 };
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

export default function CbmCalculatorFaqSection() {
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
        <h2 style={h2Style}>CBM Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} CBM calculator for shipping is a simple tool that works out the volume and weight of your consignment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It helps you plan your transport: enter the dimensions and weight of the box you&apos;re shipping, and it tells you how many cartons
          of that size fit in a standard container. Read on to learn more about the CBM measurement and how to calculate it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is CBM?</h2>
        <p style={pStyle}>
          CBM stands for cubic meters, a metric unit of volume that describes how much space your consignment takes up. In imperial units:
        </p>
        <p style={formula}>1 CBM = 1 m³ = 35.3147 cu ft</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You don&apos;t need to convert anything yourself: every box in the calculator has its own unit, from millimeters and inches to
          cubic feet and gallons. To compare other units, use the {link("/tools/unit-converter", "unit converter")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate CBM?</h2>
        <ol style={olStyle}>
          <li>Find the dimensions of your package in meters (length, width and height).</li>
          <li>Multiply them together: CBM = length × width × height.</li>
        </ol>
        <p style={pStyle}>Make sure all the values are in the same units. Once you know the CBM of one carton, multiply it by the number of cartons to get the total volume of your consignment:</p>
        <p style={{ ...formula, marginBottom: 0 }}>total volume = CBM × quantity</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Total Weight vs. Volumetric Weight</h2>
        <p style={pStyle}>
          If you enter the weight of one carton, the calculator also gives the total weight and the volumetric weight of your cargo.
          <strong> Total weight</strong> is how much the cargo weighs: the weight of one box times the number of cartons.
        </p>
        <p style={pStyle}>
          <strong>Volumetric weight</strong> (dimensional weight) is an artificial measure of how much space the shipment takes up. Think of very
          light but bulky luggage on a plane: you are charged for its size rather than its weight.
        </p>
        <p style={formula}>volumetric weight (kg) = length (cm) × width (cm) × height (cm) × quantity / 5,000 (cm³/kg)</p>
        <p style={pStyle}>
          5,000 cm³/kg is the metric shipping factor, and it varies between carriers: change it in the <em>Shipping factor</em> box.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When estimating the cost, many companies charge for whichever is higher, the total or the volumetric weight (the Weight or
          Measurement rule, W/M). FedEx and UPS both price this way, so low-density items are usually charged per kilogram of volumetric
          weight. Volumetric weight favors shippers of heavy, dense goods and makes light but bulky packages more expensive to send.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the CBM Calculator: An Example</h2>
        <ol style={olStyle}>
          <li>Measure one shipping box of your consignment: say 50 cm long, 80 cm wide and 60 cm high.</li>
          <li>Weigh one carton: say 35 kg.</li>
          <li>Decide how many boxes to ship: say 20 identical boxes.</li>
          <li>CBM = 0.5 × 0.8 × 0.6 = 0.24 m³.</li>
          <li>Total volume = 0.24 × 20 = 4.8 m³.</li>
          <li>Total weight = 35 × 20 = 700 kg; volumetric weight = 50 × 80 × 60 × 20 / 5,000 = 960 kg. The total weight is lower, so expect to be charged by the volumetric weight.</li>
          <li>Choose a container, for example a 40′ standard dry container: 277 boxes of this size fit in it.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The number of cartons is an approximation: depending on how the packages are arranged, some space may be left unusable, so fewer
          boxes will fit in practice.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Container Types in the CBM Calculator</h2>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Container</th><th>Capacity</th></tr></thead>
            <tbody>{CONTAINERS.map(([name, cap]) => <tr key={name}><td style={{ fontWeight: 700 }}>{name}</td><td style={{ textAlign: "center" }}>{cap}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={pStyle}>
          20′ and 40′ dry (general purpose) containers suit a broad range of cargo. Usually made of steel or aluminum, they have the same width
          and height and differ only in length, and they are by far the most common type. High cube containers are about one foot taller and
          better for voluminous but light goods.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both types are multimodal: they travel by ship, train, barge and truck, which allows door-to-door transport.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate CBM for an Irregularly Shaped Package</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For an irregular package, make sure it doesn&apos;t exceed the box in any dimension. Find the longest, widest and tallest parts of the
          shipment, in other words the smallest cuboid the package fits into, and use those dimensions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why the CBM Calculation Matters for Sea Shipments</h2>
        <p style={pStyle}>
          Most ideas in cargo shipping come from maritime freight and only later reached air and rail transport. Sea transport is still the
          cheapest and most important form of cargo, and its efficiency comes largely from containerization: since the mid-twentieth century,
          containers have had standardized dimensions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Containers enable automation: goods no longer need to be handled by hand, and once a container reaches a port it can be loaded onto
          trucks or trains and sent on. As of 2013, 90% of international trade was seaborne, in 700 million containers, more and more of them
          tracked remotely. More tools for shipping are in the {link("/calculators/logistics", "logistics calculators")}.
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
