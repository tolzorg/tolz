import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Retirement Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What do the four calculators on this page do?",
    a: "\"How much do you need to retire?\" projects the nest egg required to support your desired retirement income and compares it against what your current savings plan will actually produce. \"How can you save for retirement?\" turns a target amount into a monthly, yearly, or one-time lump-sum savings plan. \"How much can you withdraw after retirement?\" projects your balance at retirement and estimates a sustainable withdrawal amount. \"How long can your money last?\" tells you how many years a fixed monthly withdrawal can be sustained from a given balance.",
  },
  {
    q: "What's the difference between a \"fixed purchasing power\" and a \"fixed amount\" withdrawal?",
    a: "A fixed-amount withdrawal stays the same dollar figure every month, so inflation erodes its real value over time. A fixed-purchasing-power withdrawal increases each year (by the inflation rate you enter) so it buys the same amount of goods and services throughout retirement — it starts smaller but keeps pace with rising prices.",
  },
  {
    q: "Why is my \"amount you will have\" different from the \"amount you need\"?",
    a: "The \"amount you need\" is the nest egg required, at your average investment return and inflation assumptions, to fund your target retirement income for your full life expectancy. The \"amount you will have\" is a projection of your current savings plan (current savings plus your planned future contributions) growing until retirement. If your planned contributions fall short of what's needed, the two numbers — and the retirement income they can support — will differ.",
  },
  {
    q: "How are inflation and investment return used in these calculations?",
    a: "Average investment return grows your savings balance year over year, both before and during retirement. Inflation is used to grow your income target and withdrawal amounts over time (so they keep pace with rising prices) and to convert future dollar figures back into today's purchasing power for an easier comparison.",
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

export default function RetirementCalculatorFaqSection() {
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
          Plan for retirement with four calculators in one place: how much you need to retire, how you can save for
          it, how much you can withdraw once retired, and how long your savings can last. Free, right in your
          browser. Also try the{" "}
          <Link to="/calculators/financial/interest-calculator" className="inline-home-link">Interest Calculator</Link>
          {" "}and{" "}
          <Link to="/calculators/financial/payment-calculator" className="inline-home-link">Payment Calculator</Link>
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
