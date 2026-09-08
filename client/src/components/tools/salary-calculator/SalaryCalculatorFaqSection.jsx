import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does \"unadjusted\" vs. \"holidays & vacation days adjusted\" mean?",
    a: "Unadjusted figures ignore paid time off entirely, treating every one of the 260 working days in the year as a day you're actually working and earning at the rate entered. The adjusted column instead spreads that same total pay across only the days actually worked once holidays and vacation are subtracted, which is why the adjusted per-hour, per-day, and per-week figures come out lower.",
  },
  {
    q: "Why are hourly and daily rates treated differently from every other pay frequency?",
    a: "An hourly or daily rate is naturally an unadjusted figure, it's what you're paid for a specific hour or day actually worked, holidays and vacation don't change that number directly. A weekly, monthly, or annual salary, on the other hand, is normally already expressed as \"what I actually take home over that period,\" holidays and vacation included, so this calculator treats those frequencies as the adjusted figure and works backward to estimate the unadjusted equivalent.",
  },
  {
    q: "Where does the 52-week, 260-day assumption come from?",
    a: "It's simply 52 weeks in a year at 5 working days per week (52 × 5 = 260), used as a fixed reference point for converting between pay frequencies. It doesn't change based on the actual calendar year or which days happen to be weekends, it's a standard simplification most salary calculators and HR systems use.",
  },
  {
    q: "How do hours and days per week affect the result?",
    a: "They control the conversion between hourly, daily, and weekly figures only, a $20/hour rate at 40 hours a week comes out to a very different daily rate than the same $20/hour at 30 hours a week. They don't affect the fixed 52-week-per-year assumption used to get from weekly up to monthly, quarterly, or annual.",
  },
  {
    q: "Does this calculator account for taxes or deductions?",
    a: "No. It converts between gross pay frequencies only, salary before taxes, benefits, or any other withholding. Take-home pay after deductions will always be lower than the figures shown here.",
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

export default function SalaryCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this salary calculator converts a pay rate
          at any frequency, hourly, daily, weekly, monthly, or annual, into every other frequency at once, with a
          side-by-side comparison of the figures before and after accounting for holidays and paid vacation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Two Columns?</h2>
        <p style={pStyle}>
          A salary quoted as "$50 an hour" and a salary quoted as "$104,000 a year" sound like they should convert
          cleanly into each other, but they usually don't, because the annual figure typically already reflects
          paid holidays and vacation while the hourly figure describes only actual hours worked. This calculator
          keeps both perspectives visible side by side: the Unadjusted column shows what the pay rate would be if
          every one of the 260 working days in the year were actually worked, and the Holidays &amp; vacation days
          adjusted column shows the real effective rate once paid time off is factored in.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whichever frequency the salary is originally entered at determines which column that number belongs in:
          hourly and daily entries are treated as Unadjusted, everything from weekly through annual is treated as
          already Adjusted.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter a salary amount and choose the pay frequency it was quoted at, hourly, daily, weekly, biweekly,
          semi-monthly, monthly, quarterly, or annually. Fill in the usual hours and days worked per week, along
          with paid holidays and vacation days per year, then click Calculate to see the full conversion table.
          Changing hours or days per week only affects the hourly/daily/weekly conversions, the calculator always
          assumes exactly 52 working weeks a year when converting up to monthly, quarterly, or annual figures.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This salary calculator is completely free, with no account, email address, or payment required. Every
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
