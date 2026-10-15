import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the future value calculated?",
    a: "The starting amount grows by the interest rate every period, and each periodic deposit is added at the end (or beginning) of its period and grows from then on. In the default example, $1,000 plus $100 a period for 10 periods at 6% grows to $3,108.93, of which $1,108.93 is interest.",
  },
  {
    q: "What difference does depositing at the beginning make?",
    a: "Each deposit earns interest for one extra period, so the future value is higher: $3,188.01 instead of $3,108.93 in the default example.",
  },
  {
    q: "What is the PV (Present Value) in the results?",
    a: "It is what the starting amount and all the deposits are worth today, discounted at the same rate: $1,736.01 in the default example. Growing it for 10 periods at 6% gives the future value.",
  },
  {
    q: "Can I use a fractional number of periods?",
    a: "Yes. As on calculator.net, the last partial period adds growth and a proportional deposit. With end-of-period deposits, no partial deposit is added when N is a whole number of quarters (such as 2.25, 2.5 or 2.75). N can be up to 10,000.",
  },
  {
    q: "What is a simple example?",
    a: "Put $10 in a savings account at 6% for 1 period with no deposits: the future value is $10.60. Money today grows into more money later, which is the time value of money.",
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

export default function FutureValueCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this future value calculator works out what a starting amount
          plus regular deposits will grow to, with the present value, total deposits and interest, a period-by-period schedule and
          charts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Future value (FV) is what money is expected to be worth in the future. Cash in a savings account or a bond typically earns
          compound interest, so it is worth more later. For example, $10 at 6% for one year grows to $10.60.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Time Value of Money</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          FV, along with present value (PV), the interest rate (I/Y), the number of periods (N) and the payment (PMT), is one of the
          building blocks of the time value of money, which underpins finance: mortgages, auto loans and credit cards all depend on it.
          To work backward to today&apos;s value, use the {link("/calculators/financial/present-value-calculator", "Present Value Calculator")};
          to solve for any of the five values, try the {link("/calculators/financial/finance-calculator", "Finance Calculator")}; and for
          longer-term growth, the {link("/calculators/financial/investment-calculator", "Investment Calculator")}.
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
