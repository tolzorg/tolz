import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Currency Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What's the difference between the two calculators on this page?",
    a: "\"With Live Exchange Rate\" converts between two real-world currencies using a current market exchange rate, fetched automatically. \"Customized Currency Exchange Rate\" is entirely offline — you supply your own A/B rate (useful for a rate you were quoted, a historical rate, or a hypothetical scenario) and it just does the arithmetic, with no live data involved.",
  },
  {
    q: "How current is the live exchange rate?",
    a: "Rates are fetched once when you load the page from a free, independent market-data provider and refresh hourly at the source. The exact time they were last updated is shown under your result.",
  },
  {
    q: "What does \"Show most popular currencies only\" do?",
    a: "It shortens the From/To dropdowns to about 16 widely-traded currencies (USD, EUR, GBP, JPY, and similar) so you don't have to scroll through all 163 supported currencies to find a common one. Uncheck it to see the full list.",
  },
  {
    q: "Are Bitcoin and precious metals supported?",
    a: "Not currently. This calculator covers 163 real, actively-traded fiat currencies — Bitcoin, gold/silver/platinum/palladium, and a handful of discontinued currencies (like the pre-2018 São Tomé dobra) aren't included, since they need specialized data sources beyond standard foreign-exchange rates.",
  },
  {
    q: "Is my information stored anywhere?",
    a: "No. Everything runs locally in your browser — nothing you enter is sent to a server or saved. The only outside request is a read-only fetch of current exchange rates.",
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

export default function CurrencyCalculatorFaqSection() {
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
          Convert between currencies using a live market exchange rate, or plug in your own custom rate for a
          quick offline conversion. Free, right in your browser. Also try the{" "}
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
