import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the affordable home price worked out from my cash?",
    a: "Your cash has to cover the down payment and the closing costs, so the home price is the cash divided by the down payment percentage plus the closing-cost percentage. With $100,000, 20% down and 3% closing costs, that is $100,000 ÷ 23% = $434,783. If closing costs are a dollar amount, they are subtracted from the cash first.",
  },
  {
    q: "How much cash do I need for a given home price?",
    a: "The down payment (price × down payment %) plus the closing costs. For a $500,000 home with 20% down and 3% closing costs, you need $100,000 + $15,000 = $115,000.",
  },
  {
    q: "What down payment percentage can I afford?",
    a: "The third calculator subtracts the closing costs from your cash and divides what is left by the home price. With $100,000 for a $500,000 home and 3% closing costs, $85,000 goes to the down payment, or 17.0%. If your closing costs exceed your cash, the result is negative.",
  },
  {
    q: "Why does the calculator mention PMI?",
    a: "With less than 20% down, conventional lenders usually require private mortgage insurance (PMI), and FHA loans charge a mortgage insurance premium. These add to the monthly cost and are not included in the monthly payment shown.",
  },
  {
    q: "What does the monthly payment include?",
    a: "Only principal and interest on the loan amount (home price minus down payment) at the interest rate and term you enter. Property taxes, insurance, HOA fees and PMI are not included; see the Mortgage Calculator for a full breakdown.",
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

export default function DownPaymentCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this down payment calculator answers three questions:
          how much home your upfront cash can buy, how much cash a home will take, and what down payment percentage your cash
          covers. Each one includes closing costs and the resulting loan amount and monthly payment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The first two calculators also compare 3.5% (the FHA minimum), 5%, 10%, 15% and 20% down side by side.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Down Payment?</h2>
        <p style={pStyle}>
          The down payment is the part of the home price you pay upfront; the rest is borrowed. A larger down payment means a
          smaller loan, lower monthly payments and less interest, and at 20% or more it usually avoids private mortgage
          insurance (PMI).
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          {["Conventional loans: as little as 3% to 5% down, with PMI below 20%.", "FHA loans: 3.5% down, with mortgage insurance premiums.", "VA and USDA loans: often no down payment for eligible borrowers."].map((x, k, a) => <li key={x} style={{ ...liStyle, marginBottom: k === a.length - 1 ? 0 : 8 }}>{x}</li>)}
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Closing Costs</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Closing costs, such as origination, appraisal and title fees, are paid at closing on top of the down payment and often
          run 2% to 5% of the price. Enter them as a percentage of the home price or as a dollar amount, or untick the box to
          leave them out. To see the full monthly cost with taxes and insurance, use
          the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}, and to check what you can afford, try
          the {link("/calculators/financial/house-affordability-calculator", "House Affordability Calculator")}.
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
