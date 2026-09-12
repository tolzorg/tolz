import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Where do the 28% and 36% figures come from?",
    a: "They're the same front-end and back-end thresholds lenders commonly use to judge mortgage affordability, borrowed here as rules of thumb for rent: 28% of gross monthly income is a conservative, \"safe\" rent payment, while 36% is treated as the upper, more aggressive limit — both applied after subtracting your other monthly debt payments.",
  },
  {
    q: "Why does my monthly debt reduce both figures by the same dollar amount?",
    a: "Both the 28% and 36% figures are really debt-to-income limits — 28% and 36% of your gross income is the MOST your rent plus other debt payments should total, so whatever you already owe each month (car loan, student loan, credit cards, etc.) comes straight off the top of each figure.",
  },
  {
    q: "What's the separate \"1/3 of gross income\" rule about?",
    a: "It's a common landlord screening rule, independent of the calculator's own math — many landlords and property managers simply won't approve an applicant whose rent exceeds one third of their gross (pre-tax, pre-debt) income. This calculator only shows that figure when it would actually be a stricter cap than your own 36% affordability limit.",
  },
  {
    q: "What does \"it will be hard to meet rent payments\" mean?",
    a: "It appears when your monthly debt is high enough relative to your income that 36% of your gross monthly income minus your debt payments is zero or negative — in other words, there's no rent payment left over after debt that would keep you within even the aggressive threshold.",
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

export default function RentCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this rent calculator estimates how much
          rent you can afford based on your gross income and existing monthly debt, using the same 28%/36%
          debt-to-income guidelines lenders use for mortgages.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Should You Spend on Rent?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's no single right answer — it depends on your income, existing debts, savings goals, and cost of
          living. A common guideline is to keep rent at or below 30% of gross income, but this calculator uses the
          more detailed 28% (safe) / 36% (aggressive) range, adjusted for whatever debt you're already carrying,
          to give a more personalized picture than a flat percentage would.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your gross (pre-tax) income, either per year or per month, and your total monthly debt payments —
          car loans, student loans, credit cards, and similar recurring obligations. Click Calculate to see the
          rent range you can afford, along with a note if the common "1/3 of gross income" landlord screening rule
          would be a tighter limit than your own affordability range.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This rent calculator is completely free, with no account, email address, or payment required. Every
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
