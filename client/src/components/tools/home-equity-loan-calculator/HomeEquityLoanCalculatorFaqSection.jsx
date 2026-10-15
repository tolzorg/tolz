import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the monthly payment calculated?",
    a: "It is the standard fixed-rate payment that repays the loan amount over the term in equal monthly installments. In the default example, $150,000 at 8% for 15 years costs $1,433.48 a month, or $258,026.06 over 180 payments.",
  },
  {
    q: "How are closing costs handled?",
    a: "Enter them in dollars or as a percentage of the loan. If they are deducted from the loan, you receive the loan amount minus the costs (\"Cash received\") but still repay the full loan; if they are paid upfront, you pay them out of pocket. Either way the cost of the loan is the total interest plus the closing costs.",
  },
  {
    q: "How is the APR worked out?",
    a: "The APR is the annual rate, compounded monthly, at which your monthly payments are worth exactly the loan amount minus the closing costs. With $7,500 of closing costs on the default loan, the APR is 8.860% against an 8% interest rate. It is shown for loans with more than 12 payments.",
  },
  {
    q: "How much can I borrow against my home?",
    a: "Lenders usually cap the total of your mortgage and the new loan at a share of the home's value, often 80%. The second calculator works out LTV × home value − mortgage balance: a $600,000 home with a $250,000 balance at 80% LTV allows up to $230,000.",
  },
  {
    q: "Why can't I see an amortization schedule?",
    a: "As on the reference calculator, the schedule is shown for loans of 13 to 719 monthly payments.",
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

export default function HomeEquityLoanCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this home equity loan calculator works out the monthly
          payment, total interest, cost and APR of a home equity loan, with optional closing costs and an amortization schedule.
          A second calculator estimates how much you may be able to borrow from your home&apos;s value, your mortgage balance and
          the lender&apos;s loan-to-value (LTV) limit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>Both calculators are primarily intended for U.S. residents.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Home Equity Loan?</h2>
        <p style={pStyle}>
          A home equity loan, also called a second mortgage, is a one-time installment loan that uses your home as collateral.
          You receive a lump sum upfront and repay it over a fixed term, usually with a fixed rate and fixed monthly payments.
          Because the loan is secured by your home, its rate is typically lower than credit cards or personal loans.
        </p>
        <p style={pStyle}>
          Most lenders cap borrowing at 80% of the home&apos;s value, including your existing mortgage. For a $500,000 home with
          a $230,000 balance at 80% LTV, the maximum is $500,000 × 80% − $230,000 = $170,000. Some lenders accept 70%, 85% or
          even 90%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Lenders also look at your credit (applicants with scores below 630 may not qualify), your other debts (a
          debt-to-income ratio of 43% or 50% is often the limit), the condition of the house, existing liens and insurance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Costs of a Home Equity Loan</h2>
        <p style={pStyle}>
          Upfront or closing costs include origination, appraisal and document fees and title searches, and can reach
          thousands of dollars or 2–5% of the loan. They can be paid at closing or rolled into the loan. No-closing-cost loans
          exist, but usually carry higher rates and limits or penalties on early payoff.
        </p>
        <p style={pStyle}>
          Ongoing costs are mainly interest. Each fixed payment covers principal and interest; the interest share starts large
          and shrinks as the balance falls. Some lenders charge recurring fees or require insurance at high LTVs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because lenders mix rates and fees differently, include the closing costs in the calculator: the APR combines interest
          and closing costs into one annual rate, which makes offers easier to compare.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Uses and Alternatives</h2>
        <p style={pStyle}>Common uses of a home equity loan include:</p>
        <ul style={ulStyle}>
          {["Major home improvements and repairs, such as remodels or a new roof.", "Debt consolidation, replacing high-interest credit card balances.", "Education costs, though it's worth comparing student loan options.", "Major bills or events, such as medical expenses, a new business or a wedding."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <p style={pStyle}>Other ways to borrow against your home:</p>
        <ul style={ulStyle}>
          {["Cash-out refinance: replaces your mortgage with a larger loan and pays you the difference. It makes sense when market rates are below your current rate.", "Home equity line of credit (HELOC): lets you draw funds as needed during a draw period, usually at a variable rate."].map((x) => <li key={x} style={liStyle}>{x}</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A home equity loan is a relatively low-cost option, but your home is at stake: use it for a clear need, with affordable
          payments and full awareness of the costs. See also the {link("/calculators/financial/mortgage-calculator", "Mortgage Calculator")} and
          the {link("/calculators/financial/loan-calculator", "Loan Calculator")}.
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
