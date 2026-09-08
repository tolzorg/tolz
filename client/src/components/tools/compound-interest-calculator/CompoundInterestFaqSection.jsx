import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does this calculator actually do?",
    a: "It converts a stated interest rate from one compounding frequency into the equivalent rate at a different compounding frequency, nothing more. It doesn't project a balance forward over time, that's a separate calculation. If a rate is quoted as \"6% compounding monthly,\" this tool answers the question \"what annual rate would produce the exact same growth?\"",
  },
  {
    q: "Why isn't a 6% rate just 6% no matter how it compounds?",
    a: "The stated (nominal) rate only tells you the ANNUAL total before accounting for compounding within the year. Once interest starts earning its own interest partway through the year, the true annual growth ends up slightly higher than the nominal rate, and the more frequently it compounds, the bigger that gap gets. A 6% rate compounding monthly actually grows a balance faster over a year than a flat 6% compounding once annually.",
  },
  {
    q: "What's the difference between APR and APY?",
    a: "APR (annual percentage rate) is the nominal rate before accounting for compounding within the year, commonly quoted for loans. APY (annual percentage yield) is the true effective annual rate after compounding is factored in, commonly quoted for savings products. The two are identical only when compounding happens once a year; otherwise APY is always the higher number.",
  },
  {
    q: "What does \"compounding continuously\" mean?",
    a: "Continuous compounding is the mathematical limit of compounding infinitely often, every instant rather than at fixed intervals. No real account actually compounds continuously, but it's a useful theoretical reference point and shows up in some financial formulas. It produces the highest possible effective rate for a given nominal rate.",
  },
  {
    q: "Why do biweekly, weekly, and daily results carry a footnote?",
    a: "Those frequencies don't divide evenly into a calendar year. This calculator follows the same convention this figure is built on: 52 weeks for weekly and biweekly compounding, and 365.25 days (accounting for leap years) for daily compounding, both noted directly under the result whenever they're used.",
  },
  {
    q: "How is compound interest different from simple interest?",
    a: "Simple interest is calculated only on the original principal for the entire term, so it grows at a constant, linear rate. Compound interest is calculated on the principal PLUS all previously accumulated interest, so growth accelerates over time. Simple interest is rarely used in practice, almost every loan, mortgage, and savings account compounds.",
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

export default function CompoundInterestFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this compound interest calculator compares
          or converts an interest rate between different compounding periods, so a loan rate compounding monthly and
          a savings rate compounding daily can be judged on equal terms.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Simple Interest vs. Compound Interest</h2>
        <p style={pStyle}>
          Simple interest is earned only on the original principal, so a $100 loan at 10% simple interest for two
          years costs exactly $20 in interest, $10 each year, no more. Compound interest is earned on the principal
          PLUS whatever interest has already accumulated, so that same $100 at 10% compound interest costs $10 the
          first year, then 10% of $110 ($11) the second year, $21 total, more than simple interest and growing
          faster with every additional period.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Over long stretches of time this difference compounds dramatically: a 20-year-old investing $1,000 at a
          10% average annual return would see it grow to roughly $72,890 by age 65, nearly 73 times the original
          amount, purely from interest earning its own interest year after year.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Compounding Frequency Matters</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The same nominal rate produces different actual growth depending on how often it compounds within the
          year. A 10% rate compounding semiannually splits into 5% every half-year; the first half-year earns $5 on
          every $100, and the second half-year earns 5% on $105 instead of $100, adding up to slightly more than a
          flat 10% would over the full year. The more frequently interest compounds, the larger this effect
          becomes, which is exactly what this calculator converts between: a rate quoted at one frequency into the
          equivalent rate at another.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter the rate as it was quoted, choose how often it compounds under "Compound" on the left, then choose
          the compounding frequency to convert it TO on the right. Click Calculate to see the equivalent rate, along
          with the shorter-period rate it works out to whenever the target frequency compounds more often than once
          a year. To actually project how a balance grows over time rather than just converting the rate, use the{" "}
          <Link to="/tools/interest-calculator" className="inline-home-link">Interest Calculator</Link> instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This compound interest calculator is completely free, with no account, email address, or payment
          required. Every calculation runs directly in your browser, nothing you enter is stored, logged, or
          transmitted anywhere.
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
