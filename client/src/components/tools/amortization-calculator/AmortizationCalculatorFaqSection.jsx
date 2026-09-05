import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Amortization Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What does \"amortization\" mean?",
    a: "Amortization is the process of paying off a loan with regular, equal payments over time. Each payment covers that period's interest first, with the rest going toward the principal — so the interest portion shrinks and the principal portion grows with every payment until the balance reaches zero.",
  },
  {
    q: "How is the monthly payment calculated?",
    a: "Using the standard fixed-rate amortization formula: Payment = P × i / (1 − (1+i)⁻ⁿ), where P is the loan amount, i is the monthly interest rate (annual rate ÷ 12), and n is the total number of monthly payments (loan term in years and months, converted to months).",
  },
  {
    q: "How do extra payments affect my loan?",
    a: "Extra payments — monthly, yearly, one-time, or any combination — go straight toward reducing your principal balance, on top of your regular scheduled payment. Because interest is calculated on the remaining balance each period, a smaller balance means less interest going forward, which can pay off the loan faster and save a meaningful amount of total interest, shown as \"Interest to be saved\" once you enable extra payments.",
  },
  {
    q: "What's the difference between the Annual and Monthly schedule?",
    a: "Both show the same loan paid down period by period — the Annual schedule aggregates each year's interest and principal into a single row, while the Monthly schedule breaks out every individual payment. Use Annual for a quick overview and Monthly for the exact numbers behind any specific payment.",
  },
  {
    q: "Is my information stored anywhere?",
    a: "No. Everything runs locally in your browser — nothing you enter is sent to a server or saved.",
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

export default function AmortizationCalculatorFaqSection() {
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
          Calculate the monthly payment for a fixed-rate loan, see how much interest you'll pay in total, and
          explore how extra monthly, yearly, or one-time payments can shorten your payoff time and save you
          interest — with a full annual or monthly amortization schedule. Free, right in your browser. Also try
          the{" "}
          <Link to="/calculators/financial/loan-calculator" className="inline-home-link">Loan Calculator</Link>
          {" "}and{" "}
          <Link to="/calculators/financial/mortgage-calculator" className="inline-home-link">Mortgage Calculator</Link>
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
