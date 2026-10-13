import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate a discount?",
    a: "Multiply the original price by the discount percentage to get the amount saved, then subtract it from the original price. A $59.99 item at 15% off saves $9.00 and costs $50.99. In the calculator, enter any two of the four values and it works out the rest.",
  },
  {
    q: "How do I find the original price from a sale price?",
    a: "Divide the sale price by (1 − discount). If something costs $50.99 after 15% off, the original price was $50.99 ÷ 0.85 = $59.99. Enter the discount and the price after discount, and the calculator does this for you.",
  },
  {
    q: "How do I work out what percentage off I got?",
    a: "Divide the amount saved by the original price and multiply by 100. Paying $44.99 for a $59.99 item saves $15, which is $15 ÷ $59.99 × 100 = 25% off. Choose either discount type and enter the two prices.",
  },
  {
    q: "What's the difference between percent off and fixed amount off?",
    a: "A percent-off discount takes a share of the price, so the saving grows with the price. A fixed-amount discount, like a $20 coupon, takes the same dollar amount off no matter what the price is. On a $95 service, 20% off saves $19, while $20 off saves $20.",
  },
  {
    q: "How do stacked discounts work?",
    a: "Each discount applies to the already-discounted price, so 20% off and then another 15% off is not 35% off. $100 becomes $80, then $80 × 0.85 = $68, a total of 32% off. Run the calculator once per discount, using each result as the next price before discount.",
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
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

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

export default function DiscountCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this discount calculator finds the sale price,
          the amount you save, the original price, or the discount itself from any two values, for both percent-off and
          fixed-amount-off deals.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Percent Off</h2>
        <p style={pStyle}>
          The term discount can refer to many forms of reduction in the price of a good or service. The two most common
          are a percent off and a fixed amount off. A percent off takes some percentage, say 10%, off the original price.
          If a good costs $45 with a 10% discount, subtract 10% of $45 from $45, or equivalently take 90% of $45:
        </p>
        <div style={formulaStyle}>
          10% of $45 = 0.10 × 45 = $4.50
          <br />
          $45 − $4.50 = $40.50
          <br />
          or 90% of $45 = 0.90 × 45 = $40.50
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>In this example, you save 10%, or $4.50.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fixed Amount Off</h2>
        <p style={pStyle}>
          A fixed amount off means subtracting that amount from the original price. If a service normally costs $95 and
          you have a coupon for $20 off, the final price is:
        </p>
        <div style={formulaStyle}>$95 − $20 = $75</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In this example, you save the fixed amount of $20. Other schemes can be more confusing, such as stackable
          discounts where you get 20% off the original price and then 15% more off that discounted price. Apply each
          discount in turn, using the previous result as the next price before discount.
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
