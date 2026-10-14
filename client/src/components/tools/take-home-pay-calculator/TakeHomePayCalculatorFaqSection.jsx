import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { BRACKETS, STANDARD_DEDUCTION, TAX_YEAR } from "../../../utils/takeHomePayCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "How is take-home pay calculated?",
    a: "Start with gross pay for the period, then subtract federal income tax, Social Security (6.2%), Medicare (1.45%), any state and city income tax, and pretax deductions such as 401(k) and health insurance. On an $80,000 salary paid bi-weekly with $6,000 of pretax deductions, gross pay of $3,076.92 becomes a take-home paycheck of about $2,376.",
  },
  {
    q: "What's the difference between bi-weekly and semi-monthly pay?",
    a: "Bi-weekly means every other week, which is 26 paychecks a year. Semi-monthly means twice a month, usually the 15th and the last day, which is 24 paychecks. Bi-weekly paychecks are slightly smaller, but you get two extra each year.",
  },
  {
    q: "How do I fill out Steps 3 and 4 of the W-4?",
    a: "Step 3 is $2,200 for each qualifying child under 17 plus $500 for each other dependent. Step 4(a) is income from sources other than jobs, 4(b) is deductions beyond the standard deduction, and 4(c) is extra tax to withhold each pay period. The calculator works out all of these from your inputs.",
  },
  {
    q: "What if I have more than one job, or my spouse works?",
    a: "Each employer withholds as if its job were your only one, so together they can withhold too little. The calculator uses the IRS W-4 Multiple Jobs Worksheet to work out the extra amount to withhold per pay period, and puts it on the W-4 of the highest-paying job.",
  },
  {
    q: "Why do self-employed people pay more FICA tax?",
    a: "Employees pay half of Social Security and Medicare and their employer pays the other half. Self-employed people and independent contractors are both, so they pay the full 12.4% Social Security and 2.9% Medicare themselves.",
  },
  {
    q: "What are the new deductions for tips, overtime, and seniors?",
    a: "The One Big Beautiful Bill added temporary deductions for 2025 through 2028: up to $25,000 of qualified tips, qualified overtime pay, up to $10,000 of interest on a loan for a qualifying new vehicle, and $6,000 for each person aged 65 or older. Each is limited for higher incomes.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const STATUS_COLUMNS = [["Single", "Single"], ["MarriedJoint", "Joint"], ["HeadofHousehold", "Head of Household"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const td = { padding: "6px 10px", fontSize: 13, color: "var(--text-secondary)", border: "1px solid var(--border)" };
const th = { ...td, fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-muted)", textAlign: "left" };

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

const money = (n) => `$${n.toLocaleString("en-US")}`;
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

export default function TakeHomePayCalculatorFaqSection() {
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

  const bracketRows = BRACKETS.Single.map(([, rate], i) => ({
    rate,
    ranges: STATUS_COLUMNS.map(([key]) => {
      const lower = i === 0 ? 0 : BRACKETS[key][i - 1][0];
      const upper = BRACKETS[key][i][0];
      return upper === Infinity ? `${money(lower)}+` : `${money(lower)} to ${money(upper)}`;
    }),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this take-home-paycheck calculator estimates what
          you actually bring home each pay period after federal, state, and city income tax, Social Security, Medicare, and
          pretax deductions, using the {TAX_YEAR} tax brackets and the One Big Beautiful Bill changes. It also works out the
          numbers for Steps 3 and 4 of your W-4.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Before-Tax vs. After-Tax Income</h2>
        <p style={pStyle}>
          In the U.S., salary usually means the before-tax amount, called gross pay. It is the figure used on mortgage
          applications, to set tax brackets, and to compare salaries. For personal finance, though, the more practical figure
          is after-tax income (also called disposable or net income), because it is what you actually receive.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Enter your salary before tax; the &quot;Final Pay Check&quot; result is the amount after taxes and deductions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pay Frequency</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Daily</strong>: every working day (260 a year). Uncommon for salaried jobs.</li>
          <li style={liStyle}><strong>Weekly</strong>: each week, 52 paychecks a year.</li>
          <li style={liStyle}><strong>Bi-weekly</strong>: every other week, 26 paychecks a year.</li>
          <li style={liStyle}><strong>Semi-monthly</strong>: twice a month, usually the 15th and the 30th; 24 paychecks a year.</li>
          <li style={liStyle}><strong>Monthly</strong>: once a month.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Quarterly, semi-annually, annually</strong>: 4, 2, or 1 paycheck a year. Uncommon.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Pay frequency doesn&apos;t change your total tax for the year, only how it is split across paychecks.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Deductions</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={liStyle}><strong>Pretax deductions withheld</strong>: taken from your pay before tax, such as 401(k) contributions, your share of health insurance premiums, HSA contributions, and union dues.</li>
          <li style={liStyle}><strong>Deductions not withheld</strong>: not taken by your employer but still deductible, such as IRA contributions and student loan interest.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Itemized deductions</strong>: mortgage interest, state and local taxes, charitable donations, and similar expenses. You take either these or the standard deduction ({money(STANDARD_DEDUCTION.Single)} single, {money(STANDARD_DEDUCTION.MarriedJoint)} joint, {money(STANDARD_DEDUCTION.HeadofHousehold)} head of household for {TAX_YEAR}), whichever is larger.</li>
        </ul>
        <h3 style={h3Style}>One Big Beautiful Bill Deductions (2025–2028)</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Tips</strong>: up to $25,000 of qualified tips, for incomes under $150,000 ($300,000 joint).</li>
          <li style={liStyle}><strong>Overtime</strong>: qualified overtime pay (up to $12,500, or $25,000 joint, under the law), for incomes under $150,000 ($300,000 joint).</li>
          <li style={liStyle}><strong>Car loan interest</strong>: up to $10,000 of interest on a loan for a qualifying vehicle, for incomes under $100,000 ($200,000 joint).</li>
          <li style={liStyle}><strong>Seniors</strong>: $6,000 for each person aged 65 or older, for incomes under $75,000 ($150,000 joint).</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Charitable gifts</strong>: up to $1,000 ($2,000 joint) of cash gifts if you don&apos;t itemize.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Payroll Taxes</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Federal income tax</strong>: a progressive tax that tops out at 37% in {TAX_YEAR}, usually the largest deduction from a paycheck.</li>
          <li style={liStyle}><strong>State and city income tax</strong>: most states tax income, and some cities do too. Seven states (Alaska, Florida, Nevada, South Dakota, Texas, Washington, and Wyoming) have no income tax.</li>
          <li style={liStyle}><strong>Social Security</strong>: 6.2% of wages up to {money(184500)} for {TAX_YEAR}; employers pay another 6.2%.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Medicare</strong>: 1.45% of all wages, plus 0.9% above $200,000 ($250,000 joint). Employers pay another 1.45%. See the {link("/calculators/financial/social-security-calculator", "Social Security Calculator")} for benefits.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>{TAX_YEAR} Tax Brackets</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
            <thead>
              <tr>
                {STATUS_COLUMNS.map(([, label]) => <th key={label} style={th}>{label}</th>)}
                <th style={th}>Tax Rate</th>
              </tr>
            </thead>
            <tbody>
              {bracketRows.map((r) => (
                <tr key={r.rate}>
                  {r.ranges.map((text, i) => <td key={STATUS_COLUMNS[i][0]} style={td}>{text}</td>)}
                  <td style={td}>{Math.round(r.rate * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Increase Your Take-Home Pay</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Ask for a raise</strong> or look for a better-paying job; see the {link("/calculators/financial/salary-calculator", "Salary Calculator")}.</li>
          <li style={liStyle}><strong>Review payroll deductions</strong>, such as choosing a cheaper health plan if it still meets your needs.</li>
          <li style={liStyle}><strong>Use a flexible spending account</strong> for expenses you will pay anyway, since contributions come out before tax.</li>
          <li style={liStyle}><strong>Work overtime</strong>: non-exempt employees earn at least 1.5 times their regular rate for hours over 40 a week.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Cash out unused PTO</strong> if your employer allows it.</li>
        </ul>
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
