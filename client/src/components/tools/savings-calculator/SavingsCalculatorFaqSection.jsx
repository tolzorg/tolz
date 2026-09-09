import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the annual and monthly contribution 'increase %/year' work?",
    a: "Each contribution amount grows by its own percentage once per full year — the first year always uses the base amount you entered, the second year uses base × (1 + increase), the third year uses base × (1 + increase)², and so on. This models a savings plan where you increase how much you set aside as your income grows.",
  },
  {
    q: "When do contributions get added — the beginning or end of the period?",
    a: "This calculator always adds contributions at the end of each period (each month for the monthly contribution, each year for the annual contribution). The initial deposit is the exception — it starts earning interest immediately, since it isn't a recurring contribution.",
  },
  {
    q: "How is the tax rate applied?",
    a: "Tax is deducted from the interest as it's earned in every single period, not as one lump sum at the end. This matters because taxed interest can't compound the following period — the account effectively grows at a permanently lower after-tax rate rather than a full rate followed by one final tax bill.",
  },
  {
    q: "Why does 'Compound' change my results even though everything shows up on a monthly schedule?",
    a: "Compound sets the nominal annual rate's own compounding frequency (e.g. 6% compounded monthly vs. 6% compounded annually aren't the same effective rate). That effective annual rate is then converted to an equivalent monthly rate so every contribution stream — annual and monthly — can accumulate on one consistent monthly grid, regardless of which frequency you picked.",
  },
  {
    q: "What does the pie chart show?",
    a: "The three components that make up your final End balance: your Initial deposit, the sum of all contributions actually made (after any yearly increases), and the interest earned on top of both — net of tax, if a tax rate is entered.",
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

export default function SavingsCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this savings calculator projects how a
          starting deposit plus regular annual and monthly contributions — each optionally growing every year — will
          accumulate over time, with a full year-by-year and month-by-month schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Save?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          People save for all kinds of reasons — a home down payment, a car, college tuition, a wedding, a vacation,
          or retirement. A savings account is one of the simplest ways to do it: FDIC-insured up to legal limits,
          highly liquid compared to CDs or investments, and interest-bearing, though usually at a lower rate than
          riskier alternatives. This calculator helps you see roughly how much a plan like that could grow to before
          you commit to it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your initial deposit, any recurring annual and/or monthly contribution (with an optional yearly
          increase percentage for each), the interest rate and how often it compounds, how many years you plan to
          save, and an optional tax rate on the interest earned. Click Calculate to see your projected end balance,
          a breakdown of deposits vs. contributions vs. interest, and the full accumulation schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This savings calculator is completely free, with no account, email address, or payment required. Every
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
