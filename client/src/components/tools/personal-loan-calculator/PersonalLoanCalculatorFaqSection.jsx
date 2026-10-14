import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is a personal loan payment calculated?",
    a: "With the standard amortization formula: payment = loan × r ÷ (1 − (1 + r)^−n), where r is the monthly rate (annual rate ÷ 12) and n is the number of monthly payments. A $20,000 loan at 10% over 5 years costs $424.94 a month, $25,496.45 in total.",
  },
  {
    q: "What is the APR of a personal loan?",
    a: "The APR is the interest rate that accounts for fees and insurance as well as interest. Because an origination fee reduces the money you actually receive while your payments stay the same, the APR is higher than the stated rate. A $20,000 loan at 10% for 5 years with a 5% fee has an APR of about 12.24%.",
  },
  {
    q: "What is an origination fee?",
    a: "A one-time charge for processing the loan, typically 1% to 5% of the loan amount. Most lenders deduct it from the money they pay out, so a $10,000 loan with a 3% fee nets $9,700, while you still repay $10,000 plus interest. Some lenders ask for it upfront instead.",
  },
  {
    q: "Is personal loan insurance required?",
    a: "No. Some lenders offer or ask for credit insurance that covers events like death, disability, or job loss, but it isn't required by law. If you take it, the calculator adds the monthly premium to your cost of loan and APR.",
  },
  {
    q: "Is a personal loan good for consolidating credit card debt?",
    a: "Often. About half of personal loans are used for debt consolidation because their rates are usually lower than credit cards. For example, a $16,000 loan for 5 years at 12% with a 5% fee has an APR of about 14.28%, well below credit cards at 19.99% and 24.99%. Compare APRs, not just interest rates.",
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

export default function PersonalLoanCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this personal loan calculator shows your monthly
          payment, total cost, payoff date, and amortization schedule, and works out the real APR once origination fees and
          insurance are included, which is the better figure for comparing loan offers.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What are Personal Loans?</h2>
        <p style={pStyle}>
          Personal loans have a fixed amount, interest rate, and monthly payment over a set term. In the U.S. they typically
          range from $5,000 to $35,000 over 3 or 5 years. Most are unsecured: instead of collateral, lenders look at your
          credit score, income, and debt to decide whether to lend and at what rate. Because of that risk, rates are usually
          higher than secured loans, sometimes 25% or more.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Secured personal loans</strong>: less common, backed by a car, savings, or CDs, usually from banks and credit unions.</li>
          <li style={liStyle}><strong>Traditional lenders</strong>: banks, credit unions, and other financial institutions.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Peer-to-peer (P2P) lenders</strong>: online platforms that match borrowers with individual investors, often at better terms thanks to their lower costs.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use a Personal Loan?</h2>
        <p style={pStyle}>
          About half of all personal loans are used for debt consolidation, since their rates are usually lower than credit
          cards. Other common uses include medical bills, home renovations, small business expenses, weddings, vacations, and
          other large purchases. When comparing offers, use the APR with fees included rather than the interest rate. See also
          the {link("/calculators/financial/debt-consolidation-calculator", "Debt Consolidation Calculator")} and
          the {link("/calculators/financial/credit-card-calculator", "Credit Card Calculator")}.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Watch out for predatory lenders: be wary of offers made without a credit check, loans advertised by mail or phone,
          and payday, title, and cash-advance loans with very high rates, large fees, and short terms.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Personal Loan Fees</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Origination fee</strong>: usually 1% to 5% of the loan, most often deducted from the money paid out.</li>
          <li style={liStyle}><strong>Prepayment fee</strong>: charged by some lenders if you pay the loan off early; less common today.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Late payment fee</strong>: a flat amount or a percentage of the missed payment.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some lenders also offer personal loan insurance covering death, disability, or job loss. It isn&apos;t required by law.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Applying and Your Credit</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your creditworthiness is the main factor in getting approved and in the rate you are offered; good or excellent
          credit matters. Lenders usually ask for personal, employment, and income details, such as tax returns, pay stubs,
          or W-2s. Many decide quickly and can fund a loan within a day. Missing payments can damage your credit score.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Alternatives to Personal Loans</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>Borrow from family or friends, often at little or no interest.</li>
          <li style={liStyle}>Ask someone with good credit to cosign, knowing they become responsible if you can&apos;t pay.</li>
          <li style={liStyle}>Use a 0% or low introductory-rate credit card if you can repay before the promotion ends.</li>
          <li style={liStyle}>Take a secured loan, such as a home equity line of credit, keeping in mind the collateral is at risk.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>Seek help from nonprofit or community organizations, or try crowdfunding.</li>
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
