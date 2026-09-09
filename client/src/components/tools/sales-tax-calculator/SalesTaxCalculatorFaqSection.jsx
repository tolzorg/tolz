import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Which field should I leave blank?",
    a: "Whichever one you don't know. Fill in any two of Before Tax Price, Sales Tax Rate, and After Tax Price, leave the third blank, and it's solved from the other two.",
  },
  {
    q: "What if I fill in all three fields?",
    a: "Before Tax Price and Sales Tax Rate take priority — the After Tax Price is recalculated from them and any value typed into it is overwritten, matching the reference calculator's own behavior.",
  },
  {
    q: "Can the sales tax rate be 0%?",
    a: "Yes. A 0% rate is a valid input (it just means the after-tax price equals the before-tax price) — only a negative rate is rejected.",
  },
  {
    q: "Why does it say the after-tax price can't be smaller than the before-tax price?",
    a: "Sales tax only adds to a price, it never reduces it, so when solving for the tax rate from a before- and after-tax price, the after-tax price must be at least as large as the before-tax price or there's no valid (non-negative) rate that explains the difference.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Every calculation runs directly in your browser. Nothing you enter is transmitted anywhere or stored, and no signup or personal information is required to use it.",
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

export default function SalesTaxCalculatorFaqSection() {
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this sales tax calculator solves for any one
          of before-tax price, sales tax rate, or after-tax price, given the other two.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Sales Tax?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A sales tax is a consumption tax paid to a government on the sale of certain goods and services. Usually
          the vendor collects it from the consumer at the point of purchase, then remits it to the government. Most
          countries express sales tax as a percentage of the sale price, which is added on top of the listed
          (before-tax) price to arrive at the final, after-tax price the buyer actually pays.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter any two of the three fields, Before Tax Price, Sales Tax Rate, and After Tax Price, leave the
          remaining field blank, and click Calculate. The blank field is solved from the other two, along with the
          sales tax amount in dollars.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This sales tax calculator is completely free, with no account, email address, or payment required. Every
          calculation runs directly in your browser, nothing you enter is stored, logged, or transmitted anywhere.
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
