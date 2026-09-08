import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the 401(k) balance at retirement calculated?",
    a: "Each year, your contribution (a percentage of that year's salary) plus any employer match is added to your balance, which then earns your expected annual return. Salary grows by the expected salary increase each year, and the balance compounds year over year until retirement.",
  },
  {
    q: "How does the employer match limit work?",
    a: "The employer only matches your contributions up to a set percentage of your salary. For example, a 50% match with a 3% limit means the employer contributes 50 cents for every dollar you contribute, but only on the first 3% of your salary you contribute, not any percentage you contribute beyond that.",
  },
  {
    q: "What happens if my contributions hit the IRS limit before the end of the year?",
    a: "The IRS caps how much you can defer into a 401(k) each year ($24,500 under age 50, $32,500 at 50 or older, for 2026). If your contribution rate would exceed that cap partway through the year, contributions (and any employer match tied to them) stop for the rest of the year, reducing your total employer match for that year, exactly what the Maximize Employer Match calculator helps you avoid.",
  },
  {
    q: "What is the 10% early withdrawal penalty, and when is it waived?",
    a: "Withdrawing from a 401(k) before age 59½ normally triggers a 10% penalty on top of ordinary income tax. It's commonly waived for a qualifying disability, certain other IRS-recognized exemptions, or the \"Rule of 55\" if you left that employer's job in or after the year you turned 55.",
  },
  {
    q: "What's the difference between \"fixed purchasing power\" and \"fixed amount\" withdrawals?",
    a: "A fixed amount withdrawal stays the same dollar figure every month or year in retirement, so its real buying power shrinks with inflation. A fixed purchasing power withdrawal instead starts lower but increases every year with inflation, so it buys the same amount of goods and services throughout retirement.",
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

export default function Four01kCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this 401(k) calculator estimates your
          balance at retirement and how much you can withdraw from it afterward, plus two related tools: the real
          cost of an early withdrawal, and the contribution percentage window that captures your full employer match.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a 401(k)?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A 401(k) is a U.S. employer-sponsored retirement savings plan with tax benefits, named after subsection
          401(k) of the Internal Revenue Code. Contributions are typically made as pre-tax payroll deductions, and
          the account's dividends, interest, and capital gains grow tax-deferred until withdrawal, usually in
          retirement. Employers can choose to match a portion of what an employee contributes, up to a set limit,
          effectively free additional retirement savings.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use These Calculators</h2>
        <p style={pStyle}>
          The main <strong>401K Calculator</strong> projects your balance at retirement from your current age,
          salary, existing balance, contribution percentage, employer match, and expected salary growth, investment
          return, and inflation, then shows how much could be withdrawn from it afterward.
        </p>
        <p style={pStyle}>
          The <strong>Early Withdrawal Costs Calculator</strong> shows the actual amount you'd receive from an early
          401(k) withdrawal after the 10% penalty (unless exempt) and federal, state, and local income tax.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The <strong>Maximize Employer Match Calculator</strong> finds the contribution percentage window, low
          enough to reach every match tier, high enough to not hit the IRS contribution limit early, that captures
          your full available employer match for the year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These 401(k) calculators are completely free, with no account, email address, or payment required. Every
          calculation runs directly in your browser, nothing you enter is stored, logged, or transmitted anywhere.
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
