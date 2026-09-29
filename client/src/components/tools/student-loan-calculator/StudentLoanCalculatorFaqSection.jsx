import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does \"provide any three values\" mean in the Simple Student Loan Calculator?",
    a: "The loan balance, remaining term, interest rate, and monthly payment are all linked: once you know three of them, the fourth is fixed. Leave the one you want to find blank and the calculator solves for it. If you fill in all four, it recalculates the monthly payment from the balance, term, and rate.",
  },
  {
    q: "How much can extra payments save on a student loan?",
    a: "Every extra dollar goes straight to principal, so less interest builds up each month after that. With the Repayment Calculator's defaults ($30,000 at 6.8% with a $350 monthly payment), paying an extra $150 per month shortens payoff from 9 years and 10 months to 6 years and 2 months and saves $4,421.28 in interest.",
  },
  {
    q: "When are the \"per year\" and \"one time\" extra payments applied?",
    a: "The yearly extra payment is added at the end of every 12th month (month 12, 24, 36, and so on). The one-time extra payment is made together with your first monthly payment. The monthly extra payment is added to every regular payment until the loan is paid off.",
  },
  {
    q: "What is a student loan grace period?",
    a: "The grace period is the time between graduation and when repayment has to start, typically 6 months for federal Direct Loans. Unless you pay the interest as it accrues, interest keeps building during that time and is added to the balance you will repay.",
  },
  {
    q: "What does \"Do you pay interest during school years?\" change?",
    a: "If you answer No, interest builds on your balance while you are in school and during the grace period, so you start repayment owing more than you borrowed. If you answer Yes, as with some subsidized loans or if you pay the interest as it accrues, your balance at repayment equals the amount borrowed, which lowers the monthly payment.",
  },
  {
    q: "Does this calculator include loan fees or income-driven repayment plans?",
    a: "No. It assumes equal monthly payments on a standard fixed-rate schedule starting right after graduation or the grace period, and it doesn't account for origination fees or income-driven, graduated, or extended repayment plans.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
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

export default function StudentLoanCalculatorFaqSection() {
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
          Student loans can shape your finances for a decade or more, so it helps to see the numbers early. This
          student loan calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, combines three
          tools in one page: a quick solver for your balance, term, rate, or payment; a repayment planner that
          shows how extra payments shorten your loan; and a projection of what you'll owe after graduation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={pStyle}>
          <strong>Simple Student Loan Calculator:</strong> enter any three of loan balance, remaining term,
          interest rate, and monthly payment, and leave the fourth blank to solve for it.
        </p>
        <p style={pStyle}>
          <strong>Student Loan Repayment Calculator:</strong> enter the balance, monthly payment, and interest rate
          from your loan statement, then choose to pay off the loan altogether, add extra payments (monthly, yearly,
          or one time), or keep normal repayment. You'll see the new payoff time and the interest saved compared
          with the original schedule.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Student Loan Projection Calculator:</strong> if you're still in school, enter the years until
          graduation, how much you expect to borrow each year, your current balance, the loan term, the grace
          period, and the interest rate. It estimates your balance at graduation and after the grace period, plus
          your monthly payment and total interest.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Federal vs. Private Student Loans</h2>
        <p style={pStyle}>
          Federal student loans usually have fixed rates, don't require a cosigner, and offer protections such as
          income-driven repayment, deferment, and forgiveness programs. Direct Subsidized Loans are need-based and
          don't charge interest while you're in school at least half-time or during the 6-month grace period.
          Direct Unsubsidized Loans charge interest from the day they're paid out.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Private student loans come from banks, credit unions, and online lenders. Their rates depend on your credit
          (or a cosigner's), they can be fixed or variable, and they generally offer fewer repayment options. It's
          usually best to use up grants, scholarships, work-study, and federal loans before borrowing privately.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your financial figures are stored, logged, or shared.
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
