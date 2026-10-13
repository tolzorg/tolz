import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What's the difference between the two calculators?",
    a: "The first works out the average annual return of an account from its starting and ending balances plus the dates and amounts of any deposits and withdrawals. The second combines a series of returns, each held for a different length of time, into one cumulative return and one average annual return.",
  },
  {
    q: "How is the average return based on cash flow calculated?",
    a: "It finds the single annual rate that makes the starting balance and every deposit, grown at that rate until the end date, equal the ending balance plus every withdrawal grown the same way. This is a money-weighted return, the same idea as an internal rate of return (IRR or XIRR).",
  },
  {
    q: "Why does the order and timing of deposits matter?",
    a: "Money that's in the account longer has more time to earn a return. A deposit made just before a strong year boosts your money-weighted return more than the same deposit made just after it, so the calculator needs the date of every cash flow.",
  },
  {
    q: "What does \"Sorry! Your data is out of the scope we can calculate!\" mean?",
    a: "Some combinations of balances and cash flows don't have a sensible annual return, for example when withdrawals and deposits are arranged so that no single rate balances them, or when the implied return would be more than 100,000% a year. Check that the amounts, deposit/withdraw choices, and dates are right.",
  },
  {
    q: "How is the cumulative return calculated?",
    a: "Each return is treated as an annual rate held for its years and months, so $100 grows by (1 + return)^(years + months ÷ 12) for each line. The cumulative return is the total growth over all lines, and the average return is that growth spread evenly over the total holding period.",
  },
  {
    q: "What's the difference between average return and cumulative return?",
    a: "Cumulative return is the total percentage gain or loss over the whole period. Average (annualized) return is the steady yearly rate that would produce the same result. For example, a 51.78% cumulative return over 3 years and 10 months is an average of 11.50% a year.",
  },
  {
    q: "Why isn't the average return just the average of the returns?",
    a: "Returns compound, and they cover different lengths of time. A simple average ignores both, which usually overstates performance. A 50% gain followed by a 50% loss averages 0%, but it actually leaves you with 25% less money.",
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

export default function AverageReturnCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this average return calculator works out an
          account's annual return from its cash flows, and combines returns with different holding periods into one
          cumulative and average return.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Average Return Based on Cash Flow</h2>
        <p style={pStyle}>
          When you add money to an account or take some out, the simple "ending balance divided by starting balance"
          calculation stops working, because some of the growth came from your own deposits. The cash-flow calculator
          handles this by finding the one annual rate that ties everything together: the starting balance and each
          deposit, grown at that rate to the end date, equal the ending balance plus each withdrawal grown the same way.
        </p>
        <div style={formulaStyle}>Σ cash flow × (1 + r)^(years until the end date) = 0</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is a money-weighted return, the same thing spreadsheets compute with the XIRR function. With the example
          values (a $5,600 starting balance on Jan 1, 2023, deposits of $5,000 and $3,800, a $1,500 withdrawal, and an
          $18,000 ending balance), the account earned roughly 11.8% a year, depending on the end date.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Average and Cumulative Return</h2>
        <p style={pStyle}>
          The second calculator chains together returns that were each earned over a different stretch of time. Every
          return is an annual rate, so a 10% return held for 1 year and 2 months grows $100 to $100 × 1.10^(14 ÷ 12) =
          $111.76.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Cumulative return</strong>: the total growth across every line, here 51.78%.</li>
          <li style={liStyle}><strong>Average return</strong>: the steady yearly rate that gives the same total over the full holding period, here 11.50% a year.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Total holding period</strong>: the sum of all the holding lengths, here 3 years and 10 months.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Averages Can Mislead</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Adding up yearly returns and dividing by the number of years (an arithmetic mean) ignores compounding. An
          investment that gains 50% and then loses 50% has an arithmetic average of 0%, but $100 becomes $150 and then
          $75. The annualized (geometric) return these calculators report reflects what actually happened to your money,
          which makes it the better number for comparing investments.
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
