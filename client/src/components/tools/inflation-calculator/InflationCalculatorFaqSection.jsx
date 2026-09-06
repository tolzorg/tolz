import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { CPI_START_YEAR } from "../../../utils/inflationCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "Is this Inflation Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What's the difference between the three calculators on this page?",
    a: `The first uses real historical U.S. CPI data (${CPI_START_YEAR}–present) to find the actual equivalent value of a dollar amount between any two months. The other two are simpler "what if" tools: Forward projects an amount ahead using a flat inflation rate you choose, and Backward discounts an amount back in time using a flat rate — useful for estimates when you don't need real historical data.`,
  },
  {
    q: "What does \"Average\" mean in the month dropdown?",
    a: "It uses that year's average CPI (the mean of its 12 monthly values) instead of one specific month — useful when you want a single figure representing \"that year\" rather than picking a particular month.",
  },
  {
    q: "How current is the CPI data?",
    a: "It updates itself automatically: this tool checks for a newer month's CPI figure each time you load the page, straight from the U.S. Bureau of Labor Statistics, and extends its built-in dataset the moment a new one is published — usually within about two weeks of that month ending. If that check ever fails (no connection, the data source is down), it quietly falls back to its last known data with no interruption.",
  },
  {
    q: "Is my information stored anywhere?",
    a: "No. Everything runs locally in your browser using a built-in CPI dataset — nothing you enter is sent to a server or saved.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

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

export default function InflationCalculatorFaqSection() {
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
        <p style={pStyle}>
          Find the equivalent value of a dollar amount between any two points in time using real U.S. CPI data, or
          project a flat inflation rate forward or backward. Free, right in your browser. Also try the{" "}
          <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link>
          {" "}and{" "}
          <Link to="/calculators/financial/investment-calculator" className="inline-home-link">Investment Calculator</Link>
          , built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online calculators.
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
