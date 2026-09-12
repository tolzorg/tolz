import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the \"marriage penalty\" (or bonus)?",
    a: "It's the difference between what a couple pays filing one joint married return vs. what they'd each pay filing on their own, pre-marriage status. Couples with a big income gap between spouses usually see a bonus (lower combined tax), because the higher earner effectively borrows some of the lower earner's unused lower tax brackets. Couples with two similar, high incomes more often see a penalty, since combining pushes more income into higher brackets than either return alone would.",
  },
  {
    q: "Why do Social Security, Medicare, and state tax stay the same whether married or not?",
    a: "These are calculated per person, on that person's own income — Social Security and Medicare are payroll taxes on wages, and this calculator's State+City Tax Rate is applied to each spouse's own income. None of them depend on filing status, so combining two people's numbers never changes the total.",
  },
  {
    q: "What does \"File Status (Before Marriage)\" mean if the options don't include Married?",
    a: "This field is specifically about how each spouse WOULD file if they weren't getting married — so the choices are Single, Head of Household, or Qualified Widow(er) (which uses the same tax brackets as Married Filing Jointly under real tax law, for someone who lost a spouse in recent years). The \"if married\" column always assumes Married Filing Jointly, which the calculator does not let you opt out of — see the note below.",
  },
  {
    q: "Why doesn't this calculator show Married Filing Separately?",
    a: "Because it's financially beneficial in only very rare cases, most married couples file jointly, so this tool focuses on comparing that single most common choice against each spouse's own pre-marriage filing status.",
  },
  {
    q: "What should I enter for \"Total Deductions\" if I'm not using the standard deduction?",
    a: "Add up everything you'd itemize — mortgage interest, charitable donations, and (subject to their listed caps) student loan interest, child care expenses, and education tuition — into one combined dollar amount. The calculator compares your entry directly; it does not enforce the listed caps for you.",
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

export default function MarriageTaxCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this marriage tax calculator estimates the
          financial impact of filing a joint tax return as a married couple compared to each spouse filing on their
          own pre-marriage status, based on federal income tax brackets and data specific to the United States.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Benefits of Filing Jointly as Married Spouses</h2>
        <p style={pStyle}>Spouses usually choose to file their taxes jointly once married. Some benefits that come with filing jointly:</p>
        <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: 20 }}>
          <li>Single filers miss out on certain tax benefits (earned income credit, education tax credits, student loan interest deduction, credit for the elderly and disabled, etc.) that joint filers have access to.</li>
          <li>Filing jointly is usually better when the income disparity between spouses is high, since combining incomes can result in more of the total being taxed at lower bracket rates than either return alone.</li>
          <li>Filing jointly allows for a spousal IRA, letting a non-working or stay-at-home spouse contribute to retirement even without earned income of their own.</li>
          <li>Marriage can help protect assets — federal law allows assets to transfer to a surviving spouse without being subject to the federal estate tax.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Marriage Penalty</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In some situations, married couples end up paying more in taxes than they would as single, otherwise
          equivalent individuals — this is the marriage penalty. It tends to show up when both spouses have similar,
          high incomes, since combining them can push the joint return into a higher bracket than either return
          alone would reach. A lower joint income doesn't automatically avoid this either, since some credits and
          deductions phase out based on combined household income rather than either individual's income. Marriage
          can still bring long-term tax benefits even when there's a short-term penalty, so this is one factor among
          many when deciding how and when to file.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter each spouse's income (salary, interest, rental, capital gains, qualified dividends), 401(k)/IRA
          contributions, pre-marriage filing status, number of dependents, deduction choice, state+city tax rate,
          and self-employment status. Click Calculate to see each spouse's tax if filing separately, the combined
          total of those two, and what the same household would pay filing one joint return instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This marriage tax calculator is completely free, with no account, email address, or payment required.
          Every calculation runs directly in your browser — nothing you enter is stored, logged, or transmitted
          anywhere.
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
