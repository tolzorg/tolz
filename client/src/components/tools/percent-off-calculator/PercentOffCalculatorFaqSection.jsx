import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a percent off?",
    a: "Multiply the original price by the percentage to get the amount saved, then subtract it. For 15% off $39.99: 0.15 × $39.99 = $6.00 saved, for a final price of $33.99. Any two of the four values are enough; the calculator works out the other two.",
  },
  {
    q: "Are two discounts the same as adding the percentages?",
    a: "No. A stackable discount applies to the already discounted price, so 20% off then 15% off is (0.80 × 0.85) = 68% of the original price: 32% off in total, not 35%.",
  },
  {
    q: "What is the \"1st percent off\" result?",
    a: "With a stackable discount, if you enter the original or final price and the amount saved, the calculator works out the first discount that, combined with the additional one, gives that price. For example, $39.99 down to $30.59 with an additional 10% off means a 1st discount of 15%.",
  },
  {
    q: "Can the percent off be more than 100%?",
    a: "Yes, as on calculator.net: the result is then a negative final price. A final price higher than the original gives a negative percent off. The additional discount must be between 0 and 100%.",
  },
  {
    q: "Why can't it find the original price from a 100% discount?",
    a: "At 100% off every original price ends at $0, so the final price can't tell you what it was. Enter the amount saved instead: with 100% off it equals the original price.",
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
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
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

const formula = { ...pStyle, textAlign: "center", fontWeight: 600 };

export default function PercentOffCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this percent off calculator finds the final price, amount saved,
          percent off or original price from any two values, including a stackable additional discount.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a fixed amount off, try the {link("/calculators/financial/discount-calculator", "Discount Calculator")}; to add tax to the final
          price, use the {link("/calculators/financial/sales-tax-calculator", "Sales Tax Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Percent Off?</h2>
        <p style={pStyle}>
          A percent off is a common discount format: the price is reduced by that percentage of the original price. For a $279 product at 20%
          off, subtract 20% of the original price from the original price:
        </p>
        <p style={formula}>20% of $279 = 0.20 × 279 = $55.80</p>
        <p style={formula}>$279 − $55.80 = $223.20</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>You save $55.80, for a final price of $223.20.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Stackable Additional Discounts</h2>
        <p style={pStyle}>
          A stackable additional discount is a further percent off taken after the first discount is applied. Suppose the store takes 20% off
          the $279 product and you have a coupon for another 15% off. The 15% applies to the discounted $223.20, so it is not 35% off the
          original price but less:
        </p>
        <p style={formula}>15% of $223.20 = $33.48</p>
        <p style={formula}>$223.20 − $33.48 = $189.72</p>
        <p style={pStyle}>In total you save:</p>
        <p style={formula}>$55.80 + $33.48 = $89.28</p>
        <p style={pStyle}>
          That is a 32% discount rather than 35%, and it is how this calculator treats stacked discounts. A quicker way to work it out:
        </p>
        <p style={formula}>Final price = (0.80 × 279) × 0.85 = $189.72</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Paying 80% of the original price is the same as subtracting 20% of it, and paying 85% of the discounted price is the same as
          taking a further 15% off.
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
