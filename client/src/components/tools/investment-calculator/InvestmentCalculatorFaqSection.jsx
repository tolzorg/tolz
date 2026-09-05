import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Investment Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What do the five tabs do?",
    a: "Each tab solves for a different unknown in the same investment growth equation, holding everything else fixed. \"End Amount\" projects how much your investment will grow to. \"Additional Contribution\", \"Return Rate\", \"Starting Amount\", and \"Investment Length\" instead work backward from a target you enter, solving for the periodic contribution, the annual return needed, the lump sum needed today, or the number of years needed to reach it.",
  },
  {
    q: "Why doesn't the \"Return Rate\" tab have a Compound option?",
    a: "The other four tabs let you pick how often your return compounds (annually, monthly, daily, etc.), which changes the result. The Return Rate tab always solves assuming annual compounding — since you're solving for the rate itself, adding a separate compounding-frequency knob wouldn't add anything you couldn't already capture by simply describing an equivalent annual rate.",
  },
  {
    q: "What's the difference between contributing at the \"beginning\" vs. \"end\" of each period?",
    a: "It's about when each contribution starts earning a return. \"Beginning\" (an annuity due) means each deposit earns a return for its own period right away; \"end\" (an ordinary annuity) means that period's return is earned first, and the deposit lands afterward, one period behind. Beginning-of-period contributions always produce a slightly larger ending balance, all else equal.",
  },
  {
    q: "How is the Additional Contribution amount related to \"month\" vs. \"year\"?",
    a: "The dollar amount you enter is contributed at that frequency — a $1,000 contribution \"of each month\" adds up to $12,000/year, while the same $1,000 \"of each year\" adds up to just $1,000/year. Switching between them changes your total contributions dramatically, even with the same entered amount.",
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

export default function InvestmentCalculatorFaqSection() {
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
          Project how an investment will grow, or work backward from a target to find the contribution, return
          rate, starting amount, or time needed to reach it — with a full accumulation schedule and chart. Free,
          right in your browser. Also try the{" "}
          <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link>
          {" "}and{" "}
          <Link to="/calculators/financial/retirement-calculator" className="inline-home-link">Retirement Calculator</Link>
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
