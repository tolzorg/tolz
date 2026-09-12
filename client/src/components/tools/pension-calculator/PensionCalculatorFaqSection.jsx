import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does \"cost-of-living adjustment\" (COLA) mean here?",
    a: "It's an annual percentage increase applied to your pension payments to help them keep pace with inflation. Most private pensions are NOT adjusted for inflation — enter \"0\" if your plan doesn't have a COLA, which is the more common case.",
  },
  {
    q: "Why does the lump sum option show a flat line on the chart?",
    a: "A lump sum payout is received once, in full, at retirement, so its \"equivalent present value\" doesn't depend on how long you live — it's simply the lump sum amount itself, whether you live one more year or fifty.",
  },
  {
    q: "What's the difference between a single-life and joint-and-survivor pension?",
    a: "A single-life pension pays the retiree the highest possible monthly amount, but payments stop entirely when the retiree dies. A joint-and-survivor pension pays a smaller monthly amount, but continues paying the surviving spouse for the rest of their life after the retiree dies.",
  },
  {
    q: "What is the \"lump sum needed to replace your survivor pension\" figure?",
    a: "It's the amount of money — for example, from a term life insurance payout — that would need to be invested today, at your assumed investment return, to fully replace the income stream your spouse would have received under the joint-and-survivor option, if you died the moment you retired.",
  },
  {
    q: "Does this calculator include salary income in the \"work longer\" comparison?",
    a: "No — it only compares the financial value of the two pension options themselves. If you'd need salary income to cover living expenses during the extra working years, that's a separate consideration this calculator doesn't account for.",
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

export default function PensionCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this pension calculator helps evaluate three
          of the most common pension-related decisions: lump sum vs. monthly income, single-life vs.
          joint-and-survivor payout, and whether working longer is worth it financially.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Single-Life vs. Joint-and-Survivor Pensions</h2>
        <p style={pStyle}>
          Single-life plans pay a monthly benefit for the remainder of the retiree's life, but payments halt
          entirely as soon as they pass away — leaving a surviving spouse without that source of income. This
          option is most commonly used by retirees without a spouse or dependents.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Joint-and-survivor plans add the retiree's spouse as a second beneficiary, with monthly benefits
          continuing until both have passed away. Because the benefit has to potentially outlive two people
          instead of one, the monthly payout is generally lower than a single-life pension's.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cost-of-Living Adjustment (COLA)</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Due to inflation, the cost of goods and services tends to rise over time, and a cost-of-living
          adjustment helps pension payments keep pace by increasing periodically. COLA is standard for U.S. Social
          Security, but most private pension plans do NOT include one — enter "0" for this field if your plan
          doesn't have a COLA.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This pension calculator is completely free, with no account, email address, or payment required. Every
          calculation runs directly in your browser — nothing you enter is stored, logged, or transmitted anywhere.
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
