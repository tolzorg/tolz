import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I fill a container?",
    a: "To fill a container efficiently with packages of the same size: measure the package's length, width and height; find the container's dimensions and volume; then work out how many packages fit along each side and stack them to make the most of the space.",
  },
  {
    q: "Can I fit an 8-meter-long item in a container?",
    a: "Yes, in a 40-foot container, which is about 12 meters long inside; a standard 20-foot container is too short. Check the item's width and height too, to make sure it fits.",
  },
  {
    q: "How many 5x5x5 inch packages can I fit in a standard 20ft container?",
    a: "14,904 packages. 46 boxes fit along the length, 18 along the width and 18 layers up to the roof: 46 × 18 × 18 = 14,904.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SIZES = [
  ["Standard 10ft", "2.83 m", "9' 3\"", "2.35 m", "7' 8.5\"", "2.39 m", "7' 10.1\""],
  ["Standard 20ft", "5.90 m", "19' 4.2\"", "2.35 m", "7' 8.5\"", "2.39 m", "7' 10.1\""],
  ["Standard 40ft", "12.03 m", "39' 5.7\"", "2.35 m", "7' 8.5\"", "2.39 m", "7' 10.1\""],
  ["High Cube 20ft", "5.90 m", "19' 4.2\"", "2.35 m", "7' 8.5\"", "2.69 m", "8' 10.2\""],
  ["High Cube 40ft", "12.03 m", "39' 5.7\"", "2.35 m", "7' 8.5\"", "2.69 m", "8' 10.2\""],
  ["High Cube 45ft", "13.56 m", "44' 6\"", "2.35 m", "7' 8.5\"", "2.69 m", "8' 10.2\""],
  ["Pallet Wide 20ft", "5.89 m", "19' 4\"", "2.44 m", "8' 0\"", "2.39 m", "7' 10.1\""],
  ["Pallet Wide 40ft", "12.02 m", "39' 5\"", "2.44 m", "8' 0\"", "2.39 m", "7' 10.1\""],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
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

export default function ContainerLoadingCalculatorFaqSection() {
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
        <h2 style={h2Style}>Container Loading Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The {link("/", "Tolz")} container loading calculator helps with everything from figuring out how many boxes fit in a container to
          making the most of your shipping space. With a container size chart and a step-by-step guide to filling a container, you have
          everything you need to get the most out of your shipments.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Fill a Container?</h2>
        <p style={pStyle}>
          Filling a container sounds easy: throw your stuff in and you&apos;re done. That works only if you don&apos;t care about the cost. Shipping
          containers are expensive, so you want to use as much of the space as you can.
        </p>
        <p style={pStyle}>
          The calculator works out the most efficient way to stack your packages, how many boxes fit and the container&apos;s volume. Select
          your container type, enter the dimensions of your package, and you&apos;ll see the results, including instructions on how to pack
          your items. Below you&apos;ll learn:
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>How many packages fit in a container;</li>
          <li>How to calculate container volume; and</li>
          <li>How to use the container loading calculator.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Container Size Chart</h2>
        <p style={pStyle}>The most popular container sizes, in metric and imperial units:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead>
              <tr><th rowSpan={2}>Type</th><th colSpan={2}>Internal length</th><th colSpan={2}>Internal width</th><th colSpan={2}>Internal height</th></tr>
              <tr><th>m</th><th>ft / in</th><th>m</th><th>ft / in</th><th>m</th><th>ft / in</th></tr>
            </thead>
            <tbody>
              {SIZES.map(([name, ...cells]) => (
                <tr key={name}><td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{name}</td>{cells.map((c, i) => <td key={i} style={center}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Don&apos;t see your container here? Select &quot;Custom&quot; and enter your own dimensions: they directly affect how many boxes fit. To
          convert between length units, use the {link("/tools/unit-converter", "unit converter")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Container Volume</h2>
        <p style={pStyle}>A container is essentially a large box, so multiply its length, width and height:</p>
        <p style={formula}>Volume = Length × Width × Height</p>
        <p style={pStyle}>
          The same formula gives the volume of your package. Dividing the container volume by the package volume gives a rough idea of how
          many packages fit, but it isn&apos;t always accurate: the package&apos;s shape and orientation can stop you from filling the whole space.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That&apos;s why this calculator also works out the best way to position your packages, trying every orientation, for a more realistic
          count of how many will actually fit. For the CBM, total and volumetric weight of a shipment, use the
          {" "}{link("/calculators/logistics/cbm-calculator", "CBM calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Container Loading Calculator</h2>
        <ol style={olStyle}>
          <li>
            <strong>Select the container type</strong> from the list. For a custom container, or to experiment, select &quot;Custom&quot; and enter
            the container&apos;s length, width and height in the units you choose.
          </li>
          <li><strong>Enter the package information</strong>: the package&apos;s length, width and height. Accurate measurements give the best results.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 6 }}>The calculator then shows:</p>
        <ul style={listStyle}>
          <li>The volume of a single package;</li>
          <li>The total number of packages that fit inside the container;</li>
          <li>How much of the container is used (utilization percentage);</li>
          <li>The number of layers and the number of packages per layer; and</li>
          <li>How to position your packages inside the container.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>More tools for shipping are in the {link("/calculators/logistics", "logistics calculators")}.</p>
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
