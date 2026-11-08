import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How can I minimize the dimensional weight of packages?",
    a: "Check the size and weight restrictions before choosing a shipping company; use lightweight materials that don't compromise the product's safety; find custom packaging shaped to the product; and use flat or foldable packaging when possible.",
  },
  {
    q: "How can I calculate dimensional weight in lbs?",
    a: "Measure the length, width and height of your package in inches, multiply them to get its volume, find the dimensional (DIM) factor your shipping company uses and divide: DIM weight = (length × width × height) / DIM factor.",
  },
  {
    q: "What is the best package for a dimensional weight of 3 lbs?",
    a: "The smallest package dimensions for a dimensional weight of 3 lbs are a length of 5 inches, a width of 3 inches and a height of 23 inches. Each dimension should follow the guidelines of shipping companies such as FedEx, UPS and USPS.",
  },
  {
    q: "What is dimensional weight?",
    a: "Dimensional weight is a pricing technique shipping companies use to give any package a value from which the shipping cost can be determined. It is calculated from the package's length, width and height.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
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

export default function DimensionalWeightCalculatorFaqSection() {
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
        <h2 style={h2Style}>Dimensional Weight Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} dimensional weight calculator shows how to calculate dimensional weight, how the FedEx, USPS and UPS
          dimensional weight formulas work, and helps you choose a courier.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The price of shipping depends on the weight and size of your package, and dimensional weight connects the two. Cost also grows with
          distance: in the United States there are 8 zones, and the more zones your parcel crosses, the more it costs. For the volume of a whole
          shipment, see the {link("/calculators/logistics/cbm-calculator", "CBM calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Dimensional Weight and How to Calculate It?</h2>
        <p style={pStyle}>
          Big, light packages are uneconomical for couriers: a truck fits only a few large parcels instead of many small ones. That&apos;s why
          dimensional weight (also called volumetric weight), a weight estimated from the length, width and height, was introduced in 2015.
          Each company sets it slightly differently, but the general formula is:
        </p>
        <p style={formula}>DIM weight = (Length × Width × Height) / DIM factor</p>
        <p style={pStyle}>where the DIM factor (dimensional factor) is a number set by each delivery company.</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Imagine sending a standing coat hanger: light, but quite big. The courier weighs it, measures it, calculates its dimensional weight
          and compares the two. Even if the parcel weighs 10 pounds, you pay for the dimensional weight when it is higher.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>UPS Dimensional Weight</h2>
        <p style={pStyle}>
          UPS uses two dimensional factors, depending on how often you ship. Daily Rates are for customers with scheduled pickups and a UPS
          agreement; Retail Rates are for infrequent shipments from a UPS Store or Customer Center.
        </p>
        <ul style={listStyle}>
          <li>Daily Rates: DIM weight = (Length × Width × Height) / 139</li>
          <li>Retail Rates: DIM weight = (Length × Width × Height) / 166</li>
          <li>In centimeters: DIM weight = (Length × Width × Height) / 5000</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whichever is larger, the dimensional or the actual weight, is the billable weight. Packages longer than 108 inches (274 cm) on their
          longest side, or heavier than 150 pounds (70 kg), may cost extra.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>FedEx Dimensional Weight</h2>
        <ul style={listStyle}>
          <li>Inches and pounds: DIM weight = (Length × Width × Height) / 139</li>
          <li>Centimeters and kilograms: DIM weight = (Length × Width × Height) / 5000</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Check the size and weight restrictions before choosing a company: FedEx ships packages up to 150 pounds or 70 kilograms.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>USPS Dimensional Weight</h2>
        <p style={pStyle}>
          USPS used to be the cheapest option: dimensional weight applied only from zone 5, with a factor of 194. Since mid-2019 the USPS
          dimensional factor is 166:
        </p>
        <p style={formula}>DIM weight = (Length × Width × Height) / 166</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Dimensional weight isn&apos;t applied to packages smaller than one cubic foot, but USPS won&apos;t ship packages heavier than 70 pounds.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Example of Calculations</h2>
        <p style={pStyle}>Back to the coat hanger: say it measures 70 × 14 × 14 inches.</p>
        <ul style={listStyle}>
          <li>FedEx DIM weight = (70 × 14 × 14) / 139 = 99 lb</li>
          <li>UPS DIM weight = (70 × 14 × 14) / 166 = 83 lb (shipping from a retail location)</li>
          <li>USPS DIM weight = (70 × 14 × 14) / 166 = 83 lb</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The UPS and USPS dimensional weights are lower, so they would probably be cheaper than FedEx; which of the two is cheaper depends on
          their distance-based rates. Check each company&apos;s price calculator before sending. More shipping tools are in the
          {" "}{link("/calculators/logistics", "logistics calculators")}.
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
