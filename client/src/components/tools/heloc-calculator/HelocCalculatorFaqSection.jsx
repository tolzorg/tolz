import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How are HELOC payments calculated?",
    a: "During the draw period you pay interest only: the balance times the rate divided by 12. After that, the balance is repaid in equal monthly payments over the repayment period. In the default example, a $50,000 line at 8% costs $333.33 a month for 5 years, then $477.83 a month for 15 years.",
  },
  {
    q: "Does the calculator assume I borrow the whole line?",
    a: "Yes. Like the reference calculator, it assumes the full loan amount is drawn at the start and only interest is paid during the draw period, which shows the most you could owe and pay.",
  },
  {
    q: "How are closing costs and the annual fee handled?",
    a: "Closing costs can be entered in dollars or as a percentage, and paid upfront or deducted from the loan (\"Cash received\"). The annual fee is charged for each year of the draw period. The cost of the loan adds the interest, closing costs and annual fees together.",
  },
  {
    q: "How is the APR worked out?",
    a: "The APR is the annual rate, compounded monthly, at which the repayment-period payments and the annual fees are worth the loan amount minus the closing costs. calculator.net's own HELOC APR adds a small amount on top when there is a draw period (up to about 0.04 points for draws of around a year), so results there can differ slightly.",
  },
  {
    q: "How much can I borrow with a HELOC?",
    a: "Lenders usually cap your mortgage plus the line of credit at 80% or 85% of the home's value. The second calculator works out LTV × home value − mortgage balance: a $600,000 home with a $250,000 balance at 80% LTV allows up to $230,000.",
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

export default function HelocCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this HELOC calculator works out the draw-period and
          repayment-period payments, total interest, cost and APR of a home equity line of credit, with optional closing costs
          and annual fees and an amortization schedule. A second calculator estimates how large a line of credit you may qualify
          for from your home&apos;s value, your mortgage balance and the lender&apos;s loan-to-value (LTV) limit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>Both calculators are primarily intended for U.S. residents.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a HELOC?</h2>
        <p style={pStyle}>
          A home equity line of credit (HELOC) is a revolving line of credit secured by your home. Instead of a lump sum, you
          borrow as needed up to the credit limit, much like a credit card. Its term has two phases:
        </p>
        <ul style={ulStyle}>
          {["Draw period: you can withdraw, repay and redraw funds up to the limit, usually paying interest only. It typically lasts 5 to 10 years.", "Repayment period: no more withdrawals; monthly payments cover principal and interest, like a conventional loan. It typically lasts 10 to 20 years."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <p style={pStyle}>
          Because it is secured by your home, a HELOC usually has a relatively low rate, but the rate is often variable (an index
          plus a margin), which adds long-term uncertainty.
        </p>
        <p style={pStyle}>
          Most lenders cap the line at 80% or 85% of the home&apos;s value minus the existing mortgage. For a $500,000 home with a
          $210,000 balance at 80% LTV, the limit is $500,000 × 80% − $210,000 = $190,000. Many lenders also cap HELOCs at
          $1 million.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders also weigh your credit (applicants below 630 may not qualify), your debt-to-income ratio (often 43% or 50% at
          most), the condition of the house, existing liens and insurance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Costs of a HELOC</h2>
        <p style={pStyle}>
          Upfront or closing costs include origination, appraisal and document fees and title searches, often 1–5% of the
          loan. No-closing-cost HELOCs roll these into the loan through a higher rate or early termination fees.
        </p>
        <p style={pStyle}>
          Ongoing costs are interest and fees: many HELOCs charge an annual fee during the draw period, and some charge
          maintenance or transaction fees.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Include the closing costs and annual fee in the calculator to compare offers: the APR combines interest, closing costs
          and fees into one annual rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Uses and Alternatives</h2>
        <p style={pStyle}>
          A HELOC suits ongoing costs such as tuition or a remodel, since you borrow only what you need. But the rate is usually
          variable, and interest-only payments during the draw period push the larger payments into the future.
        </p>
        <ul style={ulStyle}>
          {["Home equity loan: a one-time lump sum with fixed payments and usually a fixed rate, which gives a more predictable schedule.", "Cash-out refinance: replaces your mortgage with a larger loan and pays you the difference; it makes sense when market rates are below your current rate."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A HELOC is a flexible, relatively low-cost way to borrow, but your home is at stake. Compare it with
          the {link("/calculators/financial/home-equity-loan-calculator", "Home Equity Loan Calculator")} and
          the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")}.
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
