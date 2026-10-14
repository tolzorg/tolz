import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the internal rate of return (IRR)?",
    a: "IRR is the discount rate at which the net present value of all of an investment's cash flows equals zero. It is the break-even, annualized rate of return after accounting for the time value of money. If it beats your required rate of return (hurdle rate or cost of capital), the investment is generally worthwhile.",
  },
  {
    q: "What's the difference between the two calculators?",
    a: "The fixed cash flow calculator handles an initial investment, a holding time, an ending balance, and an optional recurring deposit or withdrawal at a set frequency. The irregular cash flow calculator takes an initial investment and a different cash flow for each year, up to 50 years; enter further investments as negative numbers.",
  },
  {
    q: "How is a monthly or weekly cash flow turned into a yearly IRR?",
    a: "The calculator solves the rate per period, then compounds it to a year: IRR = (1 + periodic rate)^(periods per year) − 1. In the default example, withdrawing $100 a month from a $10,000 investment that grows to $15,000 in 2 years and 6 months gives 2.195% a month, or 29.768% a year. Biweekly and weekly schedules assume a 52-week year.",
  },
  {
    q: "What do gross return and total return mean?",
    a: "Total return is what you end up with (ending balance plus withdrawals, or all yearly cash flows) minus everything you put in. Gross return is that total return as a percentage of the money invested. Unlike IRR, gross return ignores timing.",
  },
  {
    q: "Why do I get \"Sorry! Your data is beyond the scope of what we can calculate!\"?",
    a: "Some cash flows have no rate that sets the net present value to zero, for example when every cash flow is negative or zero. Others imply rates or schedules too extreme to compute reliably, such as very large payments over hundreds of periods.",
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

export default function IrrCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this IRR calculator finds the internal rate of return
          of an investment, either from a fixed recurring deposit or withdrawal with an ending balance, or from irregular yearly
          cash flows, along with the total return and gross return.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When comparing investment opportunities, each comes with an upfront cost, a forecast of future cash flows, and some
          risk. The internal rate of return is one of the most popular ways to judge their profitability, and it is useful in
          capital budgeting, corporate finance, personal investing, and any decision about a project that generates cash flow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is the Internal Rate of Return?</h2>
        <p style={pStyle}>
          The internal rate of return is the discount rate at which the net present value (NPV) of a project&apos;s cash flows
          equals zero. An investment usually costs money upfront, may need further investments, and returns cash over time.
          Because money today is worth more than the same amount later, future cash flows are discounted back to their present
          value. The IRR is the rate that makes the total exactly zero.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In other words, IRR is the break-even rate of return once the time value of money is considered. If a project&apos;s
          IRR is above the required rate of return or cost of capital, it is generally worthwhile; if it is below, the project
          may not earn enough to justify the investment.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How is IRR Calculated?</h2>
        <p style={pStyle}>IRR uses the net present value formula, solved for the rate that makes NPV zero:</p>
        <p style={{ ...pStyle, textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>
          NPV = Σ CF<sub>t</sub> ÷ (1 + r)<sup>t</sup> = 0, for t = 0 … n
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>CF<sub>t</sub></strong> is the cash flow in period t (CF<sub>0</sub> is usually negative: the initial investment).</li>
          <li style={liStyle}><strong>r</strong> is the discount rate, here the IRR.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>t</strong> is the time period, from 0 to n.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most real projects this can&apos;t be solved algebraically, so calculators like this one search for the rate
          numerically until the NPV reaches zero.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What is IRR Used For?</h2>
        <p style={pStyle}>
          IRR turns a complicated pattern of cash inflows and outflows into a single number you can compare with alternatives
          or a benchmark, whether you are buying equipment, evaluating a real estate deal, or planning an expansion.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Investment decisions</strong>: an opportunity whose IRR beats the hurdle rate is considered a good one.</li>
          <li style={liStyle}><strong>Capital budgeting</strong>: companies compare projects and often prioritize the ones with higher IRRs.</li>
          <li style={liStyle}><strong>Loan and lease analysis</strong>: lenders and analysts assess the cost of financing and lease agreements.</li>
          <li style={liStyle}><strong>Private equity and venture capital</strong>: IRR measures return on investment over time.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Real estate</strong>: investors weigh purchase price, rent, maintenance, and sale price; see the {link("/calculators/financial/rental-property-calculator", "Rental Property Calculator")}.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Example 1: A Simple Investment Project</h2>
        <p style={pStyle}>
          A small manufacturer considers a $40,000 machine expected to bring in $10,000, $20,000, and $30,000 at the end of
          years 1, 2, and 3. Enter $40,000 as the initial investment and those amounts for years 1–3 in the irregular cash flow
          calculator: the IRR is 19.438%.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With a 12% cost of capital, a 19.438% IRR comfortably clears the hurdle, so the purchase looks appealing. With a 20%
          cost of capital, it would fall short.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Example 2: Comparing Two Investments</h2>
        <p style={pStyle}>Two real estate investments each cost $100,000 and pay out $150,000 over five years:</p>
        <div style={{ overflowX: "auto", position: "relative", marginBottom: 10 }}>
          <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>{["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "IRR"].map((h) => <th key={h} style={{ padding: "5px 8px", border: "1px solid var(--border)", background: "var(--bg-muted)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[["Investment A", "$5,000", "$20,000", "$25,000", "$40,000", "$60,000", "11.290%"], ["Investment B", "$0", "$10,000", "$30,000", "$30,000", "$80,000", "10.259%"]].map((r) => (
                <tr key={r[0]}>{r.map((c, k) => <td key={k} style={{ padding: "5px 8px", border: "1px solid var(--border)", textAlign: k ? "right" : "left", background: k ? undefined : "var(--bg-muted)", whiteSpace: "nowrap" }}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A simple ROI of ($150,000 − $100,000) ÷ $100,000 = 50% is the same for both. But Investment A pays out sooner, so its
          IRR is higher (11.290% vs. 10.259%): money received earlier can be reinvested and carries less risk. This is why IRR
          gives more insight than basic ROI.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Limitations of IRR</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Scale</strong>: IRR ignores project size. A small project with a high IRR may earn less total profit than a larger one with a lower IRR.</li>
          <li style={liStyle}><strong>Risk</strong>: IRR assumes the cash flows happen as forecast. A lower-IRR project with little uncertainty may beat a risky high-IRR one.</li>
          <li style={liStyle}><strong>Reinvestment rate</strong>: IRR implicitly assumes interim cash flows are reinvested at the IRR itself, which may not be realistic.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}><strong>Multiple IRRs</strong>: when cash flows change sign more than once (for example negative, positive, then negative), there can be more than one IRR.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          IRR isn&apos;t a one-size-fits-all metric. NPV, the modified internal rate of return (MIRR), and the payback period add
          other perspectives, and analysts usually look at several together. See also
          the {link("/calculators/financial/investment-calculator", "Investment Calculator")} and
          the {link("/calculators/financial/interest-calculator", "Interest Calculator")}.
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
