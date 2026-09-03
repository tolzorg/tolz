import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Loan Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What's the difference between the three calculators on this page?",
    a: "Amortized Loan is for loans with regular periodic payments (mortgages, auto loans, personal loans) that pay down both principal and interest until the balance reaches zero. Deferred Payment Loan is for loans with no periodic payments at all — the entire principal and interest is due as a single lump sum at maturity. Bond runs that same lump-sum idea in reverse: given a known amount due at maturity, it computes how much you'd receive up front today.",
  },
  {
    q: "How is the periodic payment calculated for an Amortized Loan?",
    a: "Using the standard amortization formula: Payment = P × i / (1 − (1 + i)⁻ⁿ), where P is the loan amount, i is the interest rate per payment period, and n is the total number of payments. When Compound and Pay Back are set to different frequencies (e.g. interest compounds monthly but you pay biweekly), the nominal rate is first converted to an effective annual rate, then re-expressed as the equivalent rate for whatever period you're actually paying on — this is the standard \"general annuity\" method and keeps the result accurate no matter which two frequencies you combine.",
  },
  {
    q: "What does \"Compound\" mean, and how is it different from \"Pay Back\"?",
    a: "Compound is how often interest is calculated and added to the balance (e.g. monthly). Pay Back — only shown for the Amortized Loan — is how often you actually make a payment (e.g. biweekly). They're often the same, but don't have to be: the more frequently interest compounds relative to how often you pay, the more total interest accrues.",
  },
  {
    q: "How are the Deferred Payment Loan and Bond amounts calculated?",
    a: "Deferred Payment Loan compounds the loan amount forward to maturity: Amount Due = P × (1 + i)ⁿ. Bond runs the same formula in reverse to solve for the present value of a known future amount: Amount Received = F ÷ (1 + i)ⁿ, where F is the predetermined amount due. \"Continuously\" compounding uses e^(rt) and e^(−rt) respectively instead of the discrete (1+i)ⁿ form.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR (annual percentage rate) is a nominal annual rate before accounting for compounding. APY (annual percentage yield) is the effective annual rate after compounding is applied. \"Monthly (APR)\" and \"Annually (APY)\" in the Compound dropdown reflect this — an APR compounds further within the year, while an APY already represents the true yearly rate.",
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

export default function LoanCalculatorFaqSection() {
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
          Calculate loan payments, lump-sum payoffs, and bond present values — for amortized loans with regular
          payments, deferred loans due in full at maturity, and bonds priced back from a known face value. Free,
          right in your browser. Also try the{" "}
          <Link to="/calculators/financial/mortgage-calculator" className="inline-home-link">Mortgage Calculator</Link>
          {" "}for a home loan with taxes, insurance, and extra payments, built as part of{" "}
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
