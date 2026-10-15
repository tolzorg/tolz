import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the payback period calculated?",
    a: "It is the time it takes for the cash flows to add up to the initial investment. With a level cash flow it is simply the investment divided by the yearly cash flow: $100 returning $20 a year pays back in 5 years. With irregular cash flows, the calculator finds the year the running total turns positive and interpolates within it.",
  },
  {
    q: "What is the discounted payback period?",
    a: "The same idea, but each cash flow is first discounted to today's value at your discount rate, so it accounts for the time value of money. For a level cash flow it is −ln(1 − investment × rate ÷ cash flow) ÷ ln(1 + rate): $100 returning $20 a year at 10% takes 7.27 years.",
  },
  {
    q: "How does the cash flow increase or decrease work?",
    a: "In the fixed cash flow calculator, the first year's cash flow grows (or shrinks) by the rate you enter every year after that. The payback periods are then worked out exactly from the growing series.",
  },
  {
    q: "What is the cash flow return rate?",
    a: "It is the internal rate of return (IRR) of the investment over the years listed: the discount rate at which the present value of all cash flows equals the initial investment.",
  },
  {
    q: "What if the investment never pays back?",
    a: "If the cash flows can never cover the investment, the calculator says so. For irregular cash flows that haven't paid back by the last year, it shows the average yearly payback so far and how long it would take if that average continued.",
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

export default function PaybackPeriodCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this payback period calculator works out the payback period,
          discounted payback period and cash flow return rate (IRR) of an investment, with a year-by-year schedule, for a cash flow
          that grows or shrinks at a fixed rate or for irregular cash flows of up to 100 years.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Cash flow is the money flowing into and out of a project, person or business. Positive cash flow, such as revenue, adds
          to liquid assets; negative cash flow, such as expenses, rent and taxes, reduces them. The calculator works with net
          yearly cash flows.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Discounted Cash Flow and the Discount Rate</h2>
        <p style={pStyle}>
          Discounted cash flow (DCF) values an investment using the time value of money: money today is worth more than money
          tomorrow, so future cash flows are discounted back to a present value. Businesses often use their weighted average cost
          of capital (WACC) as the discount rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The discount rate works like an inverse interest rate: it brings payments from different years to a single point in time
          so they can be compared, for example to find an investment&apos;s net present value (NPV).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Payback Period and Discounted Payback Period</h2>
        <p style={pStyle}>
          The payback period, common in capital budgeting, is how long an investment takes to break even. A $2,000 investment
          returning $1,500 after the first year and $500 after the second pays back in two years. Shorter is generally better,
          but the simple payback period ignores the time value of money.
        </p>
        <p style={pStyle}>
          The discounted payback period fixes that by using discounted cash flows. It is usually longer than the simple payback
          period: a $100 investment returning $20 a year pays back in 5 years, but in 7.27 years at a 10% discount rate. If the
          discounted payback period is shorter than the investment&apos;s useful life, the investment is generally viable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Neither measure accounts for risk or opportunity costs, so use them alongside others such as the internal rate of return.
          See the {link("/calculators/financial/irr-calculator", "IRR Calculator")}, the {link("/calculators/financial/roi-calculator", "ROI Calculator")} and
          the {link("/calculators/financial/investment-calculator", "Investment Calculator")}.
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
