import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the budget calculator work?",
    a: "Enter each income and expense as a monthly or yearly amount. Everything is converted to a yearly figure, income is reduced by your income tax rate, and your expenses are grouped into eight categories. With the default example, $83,000 of income at a 28% tax rate leaves $59,760 after tax, and $59,840 of expenses leaves a deficit of $80 a year ($7 a month).",
  },
  {
    q: "Why are 401k, IRA, and college savings reduced by the tax rate?",
    a: "Those contributions are usually made before tax, but the calculator subtracts expenses from after-tax income. Multiplying them by (1 − tax rate) shows what they actually cost you out of take-home pay. In the example, $10,000 of 401k contributions at 28% counts as $7,200.",
  },
  {
    q: "What do the DTI ratios mean?",
    a: "The debt-to-income ratio divides yearly debt payments (mortgage or rent, property tax, home insurance, HOA fees, auto loan, student loan, credit card, and other loans) by gross income. Below 35% is good, 35% up to 50% is OK with room for improvement, and 50% or more is very high. The front-end ratio counts housing costs only.",
  },
  {
    q: "How much should I save?",
    a: "A common rule of thumb is to put 15% or more of your income into savings and investments. The breakdown table flags the Savings & Investments row in red when it is below 15% of after-tax income.",
  },
  {
    q: "What rules of thumb apply to other categories?",
    a: "Keep housing costs around 30% of gross income or less, car payments under 10% of gross income, total transportation under 15% of income, and food plus meals out under 15% of income.",
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
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;
const calc = (slug, text) => link(`/calculators/financial/${slug}`, text);

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

export default function BudgetCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this budget calculator turns your monthly and yearly
          incomes and expenses into an annual and monthly budget. It shows your after-tax income, your surplus or deficit,
          your debt-to-income ratio, and how your spending breaks down by category, and it flags the areas that need work.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is a Budget?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A budget is an estimate and plan of income and spending, usually a deliberate plan to spend money in a certain way.
          People make budgets to reach financial goals such as paying off credit cards, hitting a savings target, or getting
          income and expenses back on track. Spreadsheets, apps, and calculators like this one all work. The best method is
          the one you will actually stick with.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Budget</h2>
        <p style={pStyle}>Budgeting comes down to two things: living within your means and planning for the future.</p>
        <h3 style={h3Style}>Living Within Your Means</h3>
        <p style={pStyle}>Most people who struggle with this do so for a few common reasons:</p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Spending more than they earn</strong>: over time this snowballs into more and more debt.</li>
          <li style={liStyle}><strong>Keeping up with the Joneses</strong>: buying luxury goods and services to display wealth.</li>
          <li style={liStyle}><strong>Relying too much on credit</strong>: borrowed money lets you live beyond your means only temporarily, and missed repayments get expensive.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Lacking knowledge</strong>: misinformation or gaps in personal-finance knowledge can lead to overspending.</li>
        </ul>
        <h3 style={h3Style}>Planning for the Future</h3>
        <p style={pStyle}>A plan based on realistic forecasts of income and expenses helps you:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>Absorb expected and unexpected life events, and build an emergency fund</li>
          <li style={liStyle}>Get through heavy-debt periods</li>
          <li style={liStyle}>Prepare for a new house, car, or other major purchase</li>
          <li style={liStyle}>Manage investments and prepare for retirement, children, or education</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>Choose the right insurance</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Incomes</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most people, the main income is a salary or wages, followed by investment income and capital gains. You can raise
          income by changing jobs, earning a degree or certification, learning new skills, networking, investing over the long
          term, or taking a second job. In retirement, Social Security is a major source, and payments can start at age 62 at the
          earliest. See the {calc("take-home-pay-calculator", "Take-Home-Paycheck Calculator")},
          the {calc("salary-calculator", "Salary Calculator")}, and
          the {calc("social-security-calculator", "Social Security Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Expenses</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Housing &amp; Utilities</h3>
        <p style={pStyle}>
          Rent or mortgage is usually the largest housing cost. A common rule of thumb is to keep housing at or below about 30%
          of gross income. If yours is much higher, consider refinancing, moving somewhere cheaper, downsizing, or renting out a
          spare room. Energy-efficient upgrades such as programmable thermostats, efficient light bulbs, and solar panels also
          help. See the {calc("house-affordability-calculator", "House Affordability Calculator")},
          the {calc("mortgage-calculator", "Mortgage Calculator")}, and the {calc("rent-calculator", "Rent Calculator")}.
        </p>
        <h3 style={h3Style}>Transportation</h3>
        <p style={pStyle}>
          The car payment is usually the largest transportation cost; keep it under about 10% of gross income, and total
          transportation under about 15% of income. Public transit, carpooling, biking, or walking, a more fuel-efficient car,
          routine maintenance, and gentler driving all cut costs. Traffic violations bring fines and can also raise your
          insurance premiums. See the {calc("auto-loan-calculator", "Auto Loan Calculator")},
          the {calc("cash-back-or-low-interest-calculator", "Cash Back or Low Interest Calculator")}, and
          the {calc("auto-lease-calculator", "Auto Lease Calculator")}.
        </p>
        <h3 style={h3Style}>Other Debt &amp; Loan Payments</h3>
        <p style={pStyle}>
          Credit cards must be repaid on time to avoid large interest charges. Used under strict control, they can save money
          and build credit. Don&apos;t count the same spending twice: a $20 dinner charged to a card belongs in Meals Out
          <em> or</em> Credit Card, not both. The same goes for student loans and tuition. See
          the {calc("credit-card-calculator", "Credit Card Calculator")},
          the {calc("credit-card-payoff-calculator", "Credit Card Payoff Calculator")},
          the {calc("debt-to-income-calculator", "Debt-to-Income Ratio Calculator")}, and
          the {calc("debt-payoff-calculator", "Debt Payoff Calculator")}.
        </p>
        <h3 style={h3Style}>Living Expenses</h3>
        <p style={pStyle}>
          Daily living costs add up quietly. Meals out is one of the easiest categories to trim, because cooking at home is
          usually much cheaper. Food and meals out are shown together in the results, and the combined total should generally
          stay under 15% of income.
        </p>
        <h3 style={h3Style}>Healthcare</h3>
        <p style={pStyle}>
          In the US, healthcare costs about $10,000 per person per year on average and is hard to cut. A healthy lifestyle,
          in-network providers, regularly reviewing your coverage, a Health Savings Account (HSA), and generic drugs can all
          help.
        </p>
        <h3 style={h3Style}>Children &amp; Education</h3>
        <p style={pStyle}>
          Education is often called the best investment a person can make, and having children is one of the biggest costs
          most adults take on. Here the focus is on planning ahead rather than cutting back. Borrowers with several high-rate
          student loans may want to consolidate them. See the {calc("student-loan-calculator", "Student Loan Calculator")} and
          the {calc("college-cost-calculator", "College Cost Calculator")}.
        </p>
        <h3 style={h3Style}>Savings &amp; Investments</h3>
        <p style={pStyle}>
          Healthy budgets set money aside for retirement, an emergency fund, and college. An emergency fund can make the
          difference between staying out of debt and falling into it. Aim for 15% or more of income. See
          the {calc("401k-calculator", "401K Calculator")}, the {calc("roth-ira-calculator", "Roth IRA Calculator")},
          the {calc("retirement-calculator", "Retirement Calculator")}, and the {calc("savings-calculator", "Savings Calculator")}.
        </p>
        <h3 style={h3Style}>Miscellaneous Expenses</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Travel, pets, hobbies, and entertainment are usually the most flexible part of a budget, somewhere between needs and
          wants. Moderate spending here is fine when you can afford it, but if your budget is failing, look here first.
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
