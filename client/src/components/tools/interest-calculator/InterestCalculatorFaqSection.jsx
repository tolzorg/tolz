import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Interest Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "How is the ending balance calculated?",
    a: "Your initial investment grows on its own via standard compound interest for the full investment length. Your annual and monthly contributions are each treated as their own separate stream of equal periodic deposits, growing via the standard annuity formula, then all three amounts are added together for the ending balance.",
  },
  {
    q: "What's the difference between contributing at the \"beginning\" vs \"end\" of each period?",
    a: "At the beginning, each contribution earns interest for that same period too (an \"annuity due\") — so your money grows a little more. At the end, a contribution only starts earning interest the following period (an \"ordinary annuity\"). Your initial investment isn't affected either way, since it's already invested from day one.",
  },
  {
    q: "What does \"Compound\" control, if I also have Annual and Monthly contributions?",
    a: "Compound sets how often your interest rate is applied to the balance. Annual and monthly contributions can happen at a different frequency than that — the calculator converts your nominal rate to the equivalent rate for each, so the math stays accurate no matter which combination you pick.",
  },
  {
    q: "How does Tax rate affect the result?",
    a: "Your money still grows at the full nominal rate throughout the term — tax isn't deducted period by period. Instead, at the end, your tax rate is applied once as a flat percentage of the total interest earned: Total tax = Total interest × tax rate, and your Ending balance is Total principal plus whatever interest remains after that. Leave it at 0% to see pre-tax growth, with no Total tax or Total interest after tax rows shown.",
  },
  {
    q: "What's \"Buying power of the end balance after inflation adjustment\"?",
    a: "Your ending balance in today's dollars — it divides the nominal ending balance by (1 + inflation rate) raised to the number of years, showing what that future amount would actually be worth if prices keep rising at your assumed inflation rate.",
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

export default function InterestCalculatorFaqSection() {
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
          Project the growth of a lump-sum investment plus annual and monthly contributions, with any compounding
          frequency, tax rate, and inflation adjustment — with a full annual or monthly accumulation schedule. Free,
          right in your browser. Also try the{" "}
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
