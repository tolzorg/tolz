import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the total college cost calculated?",
    a: "Each year of college is priced by growing today's annual cost at the cost increase rate until that year starts. With the defaults ($30,990 today, 5% per year, starting in 3 years, 4 years of college), freshman year costs about $35,875, and the four years together come to $154,625.",
  },
  {
    q: "What does \"in today's money\" mean?",
    a: "It's the amount you would need to set aside today, earning your after-tax investment return, to cover every future year's cost. The after-tax return is your return rate reduced by your tax rate on that return; for example, 5% taxed at 25% leaves 3.75%.",
  },
  {
    q: "How is the equivalent monthly saving worked out?",
    a: "The calculator spreads the today's-money target, minus any savings you already have, over equal monthly deposits from now until the last year of college, earning the after-tax return. If your current balance already covers the target, it tells you that no more saving is needed.",
  },
  {
    q: "What college cost increase rate should I use?",
    a: "5% per year is a common planning assumption, since college prices have historically risen faster than general inflation. If you have a specific school's cost history, use its recent average increase instead.",
  },
  {
    q: "Why use 0% tax for 529 plan savings?",
    a: "Growth in a 529 college savings plan is tax-free when withdrawals are used for qualified education expenses, so there is no tax on the investment return. With a 0% tax rate, more of your return stays invested and the monthly saving needed is lower.",
  },
  {
    q: "What if only part of the cost will come from savings?",
    a: "Set \"Percent of costs from savings\" to the share you plan to cover yourself. The second results section shows the smaller savings target and monthly amount, assuming grants, scholarships, student loans, or other financial aid cover the rest.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
  },
];

const AVERAGE_COSTS = [
  ["4-year private", "$65,470"],
  ["4-year public (in-state)", "$30,990"],
  ["4-year public (out-of-state)", "$50,920"],
  ["2-year public", "$21,320"],
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

export default function CollegeCostCalculatorFaqSection() {
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
          College is one of the biggest expenses a family plans for, and prices keep rising every year. This college
          cost calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, estimates the total cost of a
          degree when your student starts, what that cost is worth in today's money, and how much you'd need to save
          each month to cover all of it or just the share you plan to pay from savings. It's mainly intended for
          U.S. colleges.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter today's annual college cost, or pick a national average from the dropdown. Then enter the yearly cost
          increase, the number of years of college, the percent of costs you plan to pay from savings, what you've
          saved so far, your expected investment return and the tax rate on it, and how many years until college
          starts. Click <strong>Calculate</strong> to see the total cost, the cost in today's money, the freshman-year
          cost, and the monthly saving needed. Planning to borrow for the rest? Estimate the payments with
          the <Link to="/calculators/financial/student-loan-calculator" className="inline-home-link">Student Loan Calculator</Link>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Average Annual U.S. College Cost (2025–2026)</h2>
        <p style={pStyle}>Including tuition, fees, and living costs:</p>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden", maxWidth: 420 }}>
          {AVERAGE_COSTS.map(([label, value], i) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 13.5,
              borderBottom: i < AVERAGE_COSTS.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
        <p style={{ ...pStyle, fontSize: 12.5, margin: "8px 0 0" }}>
          Source: the College Board. For school-specific costs, see the{" "}
          <a href="https://nces.ed.gov/collegenavigator/" target="_blank" rel="noopener noreferrer" className="inline-home-link">College Navigator</a>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What College Costs Include</h2>
        <p style={pStyle}>
          <strong>Tuition and fees</strong> are usually the largest cost. They vary by school, program, credit hours,
          and whether you pay in-state or out-of-state rates. <strong>Room and board</strong> covers on-campus
          housing and meal plans. <strong>Textbooks and supplies</strong>, <strong>transportation</strong>, and{" "}
          <strong>personal expenses</strong> add to the total as well.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every U.S. college must provide a net price calculator on its website that estimates what a student will
          actually pay after grants and scholarships. Use those school-specific figures alongside this calculator
          for a more precise plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free, with no account, email address, or payment required. All calculations
          run in your browser, and none of your financial figures are stored, logged, or shared.
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
