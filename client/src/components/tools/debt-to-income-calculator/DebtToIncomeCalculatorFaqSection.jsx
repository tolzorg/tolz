import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my debt-to-income ratio?",
    a: "Add up your monthly debt payments, divide by your monthly gross (before-tax) income, and multiply by 100. With $5,000 a month of income and $1,650 of rent, credit card, and auto loan payments, the DTI is $1,650 ÷ $5,000 = 33%.",
  },
  {
    q: "What is a good debt-to-income ratio?",
    a: "In the U.S., a DTI of 1/3 (33%) or less is generally considered manageable, and lower is better. The calculator rates anything under 35% as good, 35% to 50% as mid-range, and 50% or more as high, since at least half of income then goes to debt.",
  },
  {
    q: "What's the difference between front-end and back-end DTI?",
    a: "Front-end DTI counts only housing costs: rent or mortgage, property tax, HOA fees, and homeowner insurance. Back-end DTI adds every other debt, such as car loans, student loans, and credit cards. Back-end is the ratio usually meant by \"DTI\".",
  },
  {
    q: "What DTI do mortgage lenders accept?",
    a: "Conventional loans usually cap front-end/back-end DTI at 28/36, FHA loans at 31/43, and VA loans at 41/41. The calculator uses the 28/36 rule to estimate how much you could spend on a new house each month.",
  },
  {
    q: "Should I enter income before or after tax?",
    a: "Before tax. DTI is defined on gross income, which is also what lenders use. Enter each amount per month or per year; the calculator converts everything to monthly.",
  },
  {
    q: "How can I lower my debt-to-income ratio?",
    a: "Raise your income (overtime, a second job, a raise) or reduce your debt payments: pay down balances, cut spending with a budget, ask for a lower credit card rate, or consolidate high-interest debt into a cheaper loan.",
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

const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

export default function DebtToIncomeCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this debt-to-income ratio calculator works out your
          front-end and back-end DTI from your income and monthly debts, rates how healthy it is, and estimates how much
          house you could afford.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is a Debt-to-Income Ratio?</h2>
        <p style={pStyle}>
          Debt-to-income ratio (DTI) is the ratio of total debt payments divided by gross income (before tax), expressed as
          a percentage, usually on a monthly or annual basis. If someone&apos;s monthly income is $1,000 and they spend $480
          on debt each month, their DTI ratio is 48%. With no debt, it is 0%.
        </p>
        <div style={formulaStyle}>DTI = Total monthly debt payments ÷ Gross monthly income × 100%</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A separate ratio, the credit utilization (or debt-to-credit) ratio, compares how much a borrower owes with their
          credit limit. It affects the credit score: the higher the percentage, the lower the score.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why is it Important?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          DTI is an important indicator of a person&apos;s or family&apos;s debt level, and lenders use it to assess the risk of
          lending to them. Credit card issuers, loan companies, and car dealers all look at it, and a high ratio suggests
          someone may not be able to repay what they owe. Standards differ: a credit card issuer might accept a 45% ratio
          that a personal lender considers too high. In general, the lower the ratio, the better.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Front-End and Back-End Ratios</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Front-end ratio</strong> (mortgage-to-income ratio): total monthly housing costs, including rent or mortgage, insurance, property taxes, and HOA/co-op fees, divided by monthly gross income. Conventional U.S. mortgage lenders typically allow up to 28%.</li>
          <li style={liStyle}><strong>Back-end ratio</strong>: everything in the front-end ratio plus all other monthly debt, such as car loans, student loans, and credit cards. This is the ratio commonly called DTI, and conventional mortgages typically allow up to 36%.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For home buyers, front-end/back-end limits are normally 28/36 for conventional loans, 31/43 for FHA loans, and
          41/41 for VA loans. Use the {link("/calculators/financial/house-affordability-calculator", "House Affordability Calculator")} to
          see the maximum mortgage each set of limits allows.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Lower Your Debt-to-Income Ratio</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Increase income</strong>: work overtime, take a second job, ask for a raise, or earn from a hobby. With the same debt, a higher income lowers the ratio.</li>
          <li style={liStyle}><strong>Budget</strong>: tracking spending shows where to cut, such as vacations, dining, or shopping, freeing money to pay down debt.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Make debt more affordable</strong>: ask your card issuer for a lower rate, refinance, or consolidate high-interest debt into a cheaper loan. See the {link("/calculators/financial/credit-card-calculator", "Credit Card Calculator")} and {link("/calculators/financial/debt-consolidation-calculator", "Debt Consolidation Calculator")}.</li>
        </ul>
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
