import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is Normal (Full) Retirement Age?",
    a: "It's the age at which you're entitled to 100% of your Primary Insurance Amount (PIA) — no reduction for claiming early, no bonus for claiming late. It's 67 for anyone born in 1960 or later, and gradually lower (down to 65) for people born before 1960.",
  },
  {
    q: "How much does claiming early or late change my benefit?",
    a: "Claiming before your normal retirement age reduces your benefit by 5/9 of 1% per month for the first 36 months early, then 5/12 of 1% per month for any additional months (down to a maximum 30% reduction at age 62, if your normal retirement age is 67). Claiming after your normal retirement age increases your benefit by 2/3 of 1% per month (8% per year), up until age 70 — delaying further than 70 provides no additional increase.",
  },
  {
    q: "Why does the \"ideal application age\" depend on my investment return and COLA?",
    a: "Claiming earlier means smaller checks but more of them, invested (at your assumed return) for longer. Claiming later means bigger checks, adjusted upward for cost-of-living every year, but fewer years to collect them. This calculator finds which of ages 62-70 produces the highest total value today, given your life expectancy and those two assumptions.",
  },
  {
    q: "Why does the chart only go up to a life expectancy or age of 121?",
    a: "121 is used as a practical upper bound for the comparison charts — it's far beyond any realistic human lifespan, so the full meaningful range of outcomes is always shown.",
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

export default function SocialSecurityCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this Social Security calculator helps
          determine the ideal (financially speaking) age between 62 and 70 to apply for retirement benefits, and
          compares the financial difference between any two application ages.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Full Retirement Age (FRA)</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Full Retirement Age, sometimes called normal retirement age, is the minimum age at which a person is
          entitled to full, unreduced retirement benefits. FRA is 67 for those born in 1960 or later, and between
          66 and 67 for those born between 1943 and 1960. You can start benefits as early as 62, but they'll be
          reduced; delaying past FRA earns delayed retirement credits that increase your benefit, up until age 70.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cost-of-Living Adjustment (COLA)</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Social Security benefits increase slightly from year to year through the cost-of-living adjustment,
          which accounts for inflation based on the Consumer Price Index. COLA applies to your benefit amount
          starting at age 62, whether or not you've actually started collecting yet.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When to Apply for Social Security</h2>
        <p style={pStyle}>
          When determining the ideal age to apply, consider your immediate need for cash, life expectancy, current
          earned income, marital status, and your spouse's relative age, income, and health.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Someone with little savings who needs income right away will likely benefit from claiming as soon as
          possible. Someone in good health with a high life expectancy and adequate savings may find it more
          financially advantageous to wait — just not past age 70, since there's no additional benefit to delaying
          further.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This Social Security calculator is completely free, with no account, email address, or payment
          required. Every calculation runs directly in your browser — nothing you enter is stored, logged, or
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
