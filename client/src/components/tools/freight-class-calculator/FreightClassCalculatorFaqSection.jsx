import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate freight class?",
    a: "Measure one pallet of your shipment (say 3 ft × 4 ft × 5 ft) and weigh it (say 260 lb). Multiply the dimensions to get the volume, 3 × 4 × 5 = 60 cu ft, and divide the weight by the volume to get the density: 260 / 60 = 4.33 lb/cu ft. Look the density up in the NMFC table: this shipment is freight class 200.",
  },
  {
    q: "Does a higher freight class cost more?",
    a: "Usually, yes. Light, bulky freight gets a high class number (up to 500) and is charged more per pound, while dense freight gets a low class number (down to 50) and cheaper rates. Making your cargo denser can move it to a cheaper class.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const CLASSES = [
  ["Less than 1", "500"], ["1 to less than 2", "400"], ["2 to less than 3", "300"], ["3 to less than 4", "250"], ["4 to less than 5", "200"],
  ["5 to less than 6", "175"], ["6 to less than 7", "150"], ["7 to less than 8", "125"], ["8 to less than 9", "110"], ["9 to less than 10", "100"],
  ["10 to less than 12", "92.5"], ["12 to less than 13", "85"], ["13 to less than 15", "77.5"], ["15 to less than 22", "70"],
  ["22 to less than 30", "65"], ["30 to less than 35", "60"], ["35 to less than 50", "55"], ["50 or more", "50"],
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
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 420 };
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

export default function FreightClassCalculatorFaqSection() {
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
        <h2 style={h2Style}>Freight Class Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With the {link("/", "Tolz")} freight class calculator, freight quotes won&apos;t surprise you again. From a pallet&apos;s weight and
          dimensions it calculates the class of your freight in the blink of an eye. New to shipping and not sure how freight class works? Read
          on: it only takes a minute.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Freight Class?</h2>
        <p style={pStyle}>
          Freight classes categorize shipments by their dimensions and weight, and they follow the density of the consignment. Dense cargo gets a
          low class number and is usually charged less per pound, so make your cargo as compact as you can. The calculator follows the American
          NMFC (National Motor Freight Classification):
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Density (lb/ft³)</th><th>Freight class</th></tr></thead>
            <tbody>{CLASSES.map(([d, c]) => <tr key={c}><td style={center}>{d}</td><td style={{ ...center, fontWeight: 700 }}>{c}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Calculate Freight Class?</h2>
        <ol style={olStyle}>
          <li>Find the dimensions of one pallet in your shipment, for example boxes of 3 ft × 4 ft × 5 ft.</li>
          <li>Weigh the pallet: say it weighs 260 lb.</li>
          <li>Multiply the dimensions to get the volume: 3 × 4 × 5 = 60 cu ft.</li>
          <li>Divide the weight by the volume to get the density: 260 / 60 = 4.33 lb/cu ft.</li>
          <li>Find the density in the table above: this shipment is freight class 200.</li>
        </ol>
        <p style={formula}>density = weight / (length × width × height)</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator accepts metric and imperial units in every box and converts the density to lb/ft³ for the NMFC table. To convert units
          yourself, use the {link("/tools/unit-converter", "unit converter")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Further Steps</h2>
        <p style={pStyle}>Now that you know your cargo&apos;s freight class, see if you can optimize it:</p>
        <ul style={listStyle}>
          <li>
            If the density is just below a class boundary (for example 7.98 lb/cu ft), adding a little weight can move the pallet to the next,
            lower-numbered class with cheaper rates per pound, so you may pay less in the end.
          </li>
          <li>Alternatively, compact the shipment a little: reducing the volume by a few cubic inches can give a more economical class.</li>
          <li>To work out the total volume of your cargo, use the {link("/calculators/logistics/cbm-calculator", "CBM calculator")}.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Open the <em>Total freight cost</em> section of the calculator to enter the freight rate per unit of weight and get the freight cost
          (rate × mass × number of pallets). It doesn&apos;t include extra payments such as insurance or fragile-cargo fees: it is the lowest
          possible sum to get your cargo shipped. More tools are in the {link("/calculators/logistics", "logistics calculators")}.
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
