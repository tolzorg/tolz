import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate ROI?",
    a: "ROI = (gain from investment − cost of investment) ÷ cost of investment. In the default example, $1,000 that grows to $2,000 has a gain of $1,000 and an ROI of 100%.",
  },
  {
    q: "What is annualized ROI?",
    a: "Annualized ROI spreads the total return over the investment time as a yearly compound rate: (amount returned ÷ amount invested)^(1 ÷ years) − 1. Doubling your money over 2.5 years is an annualized ROI of 31.95%, while doubling it over 10 years is only 7.18%.",
  },
  {
    q: "How is the investment length counted from dates?",
    a: "The calculator counts whole years between the dates, then adds the remaining days ÷ 365. A full calendar year counts as exactly 1 year even if it contains February 29.",
  },
  {
    q: "What's the difference between ROI and rate of return?",
    a: "They are sometimes used interchangeably, but a rate of return (ROR) usually refers to a period of time, often a year, while ROI has no timeframe. The annualized ROI shown here is a yearly rate.",
  },
  {
    q: "Why can the annualized ROI be huge for short periods?",
    a: "Annualizing assumes the same growth repeats all year. A 100% gain in a few days, compounded over a full year, becomes an astronomically large number, so annualized ROI is most meaningful for investments held about a year or longer.",
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

export default function RoiCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this ROI calculator finds the return on investment
          from the amount invested and the amount returned, along with the investment gain or loss and the annualized ROI
          over a date range or a length of time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In finance, Return on Investment (ROI) is a common metric for judging the expected profitability of different
          investments. It applies to anything with a cost that can produce a gain, from stocks and real estate to employees
          or even a sheep farm. More precise measures of return exist, but ROI is still widely used because it is simple:
          a quick back-of-the-napkin check.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The ROI Formula</h2>
        <p style={{ ...pStyle, textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>
          ROI = (Gain from Investment − Cost of Investment) ÷ Cost of Investment
        </p>
        <p style={pStyle}>
          For example, Bob has invested a total of $50,000 in his sheep farm, and his total gain to date is $70,000:
        </p>
        <p style={{ ...pStyle, textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>
          ($70,000 − $50,000) ÷ $50,000 = 40%
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The formula also works backwards: if Bob wants a 40% ROI on a $50,000 investment, he needs to get back $70,000.
          ROI is sometimes confused with the rate of return (ROR). The two are often used interchangeably, but a rate of return
          usually refers to a period of time, often a year, while ROI doesn&apos;t.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Difficulty in Usage</h2>
        <p style={pStyle}>
          Because ROI can measure almost anything, it is easy to use inconsistently. The formula is simple, but people define
          &quot;cost&quot; and &quot;gain&quot; differently. For a property, one investor may include capital expenditures,
          taxes, and insurance while another uses only the purchase price. For a stock, one may include capital gains taxes
          and another may not. Investors also differ on whether to include the cash flows between the first and the last.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The biggest catch is that ROI has no timeframe. A diamond with a 1,000% ROI looks better than land with a 50% ROI,
          but not if the diamond took 50 years and the land a few months. ROI is a good starting point, but it should be
          supplemented with more precise measures.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Annualized ROI</h2>
        <p style={pStyle}>
          The calculator&apos;s Investment Time input fixes that weakness with the annualized ROI, a yearly rate that is
          usually more meaningful for comparisons, as the diamond and land example shows.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          ROI doesn&apos;t reflect risk, so investments with a lower ROI are often preferred for their lower risk or other
          advantages. Some returns, such as those from advertising, can&apos;t be measured directly and are estimated from
          marginal sales or brand recognition. See also
          the {link("/calculators/financial/investment-calculator", "Investment Calculator")},
          the {link("/calculators/financial/average-return-calculator", "Average Return Calculator")}, and
          the {link("/calculators/financial/irr-calculator", "IRR Calculator")}.
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
