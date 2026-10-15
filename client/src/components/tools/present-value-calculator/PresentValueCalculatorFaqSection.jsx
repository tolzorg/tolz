import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the present value of future money calculated?",
    a: "PV = FV ÷ (1 + I/Y)^N. In the default example, $1,000 received in 10 periods at 6% is worth $1,000 ÷ 1.06^10 = $558.39 today, so $441.61 is interest.",
  },
  {
    q: "How is the present value of periodical deposits calculated?",
    a: "Each deposit is discounted back to today and the results are added up. Ten deposits of $100 at the end of each period at 6% are worth $736.01 today; made at the beginning of each period, they are worth $780.17, because each one is discounted for one period less.",
  },
  {
    q: "What do the future value and schedule show?",
    a: "The future value is what the deposits grow to by the end of the last period ($1,318.08 in the default example). The schedule lists, for each period, the total deposited so far, the interest earned in that period and the end balance.",
  },
  {
    q: "What happens with a fractional number of periods?",
    a: "As on calculator.net, the last partial period adds growth and a proportional deposit. With deposits at the end of the period, no partial deposit is added when N is a whole number of quarters (such as 2.25, 2.5 or 2.75).",
  },
  {
    q: "What is the difference between PV and NPV?",
    a: "Present value is today's value of a sum or series of cash flows. Net present value nets all cash inflows against all outflows, which is why it is used in capital budgeting and investment analysis.",
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

export default function PresentValueCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this present value calculator finds what a future sum of
          money, or a series of regular deposits, is worth today, with the future value, total interest, a period-by-period schedule
          and charts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Present value (PV) is the value today of a sum of money, as opposed to the different value it will have in the future
          once it has been invested and compounded at a certain rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Net Present Value</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Net present value (NPV) is a related concept with more everyday uses in financial analysis and accounting, such as
          evaluating capital expenditures. While PV is the present value of a sum or a cash flow, NPV nets all cash inflows against
          all cash outflows, much like a business&apos;s net income after revenue and expenses. The word &quot;net&quot; signals that
          positive and negative values are combined.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Time Value of Money</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          PV, along with future value (FV), the interest rate (I/Y), the number of periods (N) and the payment (PMT), is one of the
          building blocks of the time value of money, which underpins finance: mortgages, auto loans and credit cards all depend on it.
          To solve for other values, try the {link("/calculators/financial/finance-calculator", "Finance Calculator")}, and for
          growth over time, the {link("/calculators/financial/investment-calculator", "Investment Calculator")} and
          the {link("/calculators/financial/compound-interest-calculator", "Compound Interest Calculator")}.
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
