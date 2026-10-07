import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { UNIFORM_LIFETIME } from "../../../utils/rmdTables";

const FAQ_ITEMS = [
  {
    q: "How is my RMD calculated?",
    a: "Take your account balance on December 31 of the previous year and divide it by the distribution period for your age from the IRS table. With the defaults, a $300,000 balance at age 75 (period 24.6) gives an RMD of $12,195.12.",
  },
  {
    q: "When do I have to start taking RMDs?",
    a: "If you were born from 1951 through 1959, RMDs start at 73; if you were born in 1960 or later, they're scheduled to start at 75. You can take your first RMD as late as April 1 of the year after you reach that age, but then you'll owe a second RMD by December 31 of that same year.",
  },
  {
    q: "Which IRS table applies to me?",
    a: "Most people use the Uniform Lifetime Table. If your spouse is the sole beneficiary of the account and is more than 10 years younger than you, you use the Joint Life and Last Survivor Expectancy Table instead, which gives a longer distribution period and therefore a smaller RMD.",
  },
  {
    q: "Which accounts require RMDs?",
    a: "Traditional, SEP, SIMPLE and rollover IRAs, traditional 401(k)s, most 403(b) and 457(b) plans, qualified annuities, and profit-sharing plans. Roth IRAs don't require RMDs during the owner's lifetime.",
  },
  {
    q: "Do I have to calculate an RMD for each account?",
    a: "Yes, each account's RMD is calculated separately. You can usually withdraw the combined total for all your traditional IRAs from any one of them (the same goes for 403(b)s), but each 401(k)'s RMD must be taken from that 401(k).",
  },
  {
    q: "What does the projection show?",
    a: "If you enter an expected rate of return, the calculator projects every year to age 120, assuming you withdraw only the RMD at the end of each year and the rest keeps growing at that rate. Leave the rate blank to see only this year's RMD.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Nothing you enter is stored or sent anywhere to be saved. The calculation runs in your browser, and you don't need to sign up or give any personal information.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const tableCell = { fontSize: 13, textAlign: "center", color: "var(--text-secondary)" };

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

/** The Uniform Lifetime Table (73–120), four age/period column pairs wide. */
function UniformTable() {
  const ages = Object.keys(UNIFORM_LIFETIME).map(Number).sort((a, b) => a - b);
  const perColumn = Math.ceil(ages.length / 4);
  const columns = [0, 1, 2, 3].map((c) => ages.slice(c * perColumn, (c + 1) * perColumn));
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table data-table-head" style={{ width: "100%", maxWidth: 640 }}>
        <thead>
          <tr>
            {columns.flatMap((_, c) => [
              <th key={`a${c}`} style={tableCell}>Age</th>,
              <th key={`p${c}`} style={tableCell}>Distribution period</th>,
            ])}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: perColumn }, (_, i) => (
            <tr key={i}>
              {columns.flatMap((col, c) => {
                const age = col[i];
                if (age === undefined) return [<td key={`a${c}`} />, <td key={`p${c}`} />];
                return [
                  <td key={`a${c}`} style={tableCell}>{age === 120 ? "120+" : age}</td>,
                  <td key={`p${c}`} style={tableCell}>{UNIFORM_LIFETIME[age].toFixed(1)}</td>,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RmdCalculatorFaqSection() {
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
          This RMD calculator, free on <Link to="/" className="inline-home-link">Tolz</Link>, works out your required
          minimum distribution for the year from your age, your account balance, and whether your spouse is your
          beneficiary, using the IRS life-expectancy tables in Publication 590-B. Add an expected return to project
          your RMDs and balance for every year ahead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Required Minimum Distribution?</h2>
        <p style={pStyle}>
          A required minimum distribution (RMD) is the least you must withdraw each year from most tax-deferred
          retirement accounts once you reach a certain age. The amount depends on your account balance and IRS life
          expectancy, and withdrawals are generally taxed as income. It's only a minimum: you can always take more.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The RMD age is 73 since the SECURE 2.0 Act of 2022, and it's scheduled to rise to 75 in 2033. It was 70½
          before 2019 and 72 from 2020 to 2022. Your first RMD can be delayed until April 1 of the following year,
          but later RMDs are due by December 31 each year. Taking two in one year creates two taxable withdrawals,
          which could push you into a higher bracket. If you still work for the company that sponsors your plan
          and own less than 5% of it, you can usually delay that plan's RMDs until you retire.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How RMDs Are Calculated</h2>
        <ul style={listStyle}>
          <li>Find your account balance as of December 31 of the previous year.</li>
          <li>Look up the distribution period for your age in the right IRS table.</li>
          <li>Divide the balance by the distribution period.</li>
        </ul>
        <p style={pStyle}>
          Use the Uniform Lifetime Table below unless your spouse is your sole beneficiary and more than 10 years
          younger. In that case, use the Joint Life and Last Survivor Expectancy Table, which this calculator applies
          automatically.
        </p>
        <UniformTable />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Which Accounts Require RMDs?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Traditional, SEP, SIMPLE and rollover IRAs; traditional 401(k)s; most 403(b) and 457(b) plans; IRA-held
          variable annuities; profit-sharing plans; and other small-business retirement accounts. Roth IRAs are the main
          exception, with no RMDs during the owner's lifetime. To plan the years before RMDs begin, try
          the <Link to="/calculators/financial/ira-calculator" className="inline-home-link">IRA Calculator</Link> or
          the <Link to="/calculators/financial/retirement-calculator" className="inline-home-link">Retirement Calculator</Link>.
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
