import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Which depreciation methods does this calculator support?",
    a: "Straight line, declining balance (with any depreciation factor), and sum of the years' digits. For double declining balance, choose Declining Balance and set the depreciation factor to 2.",
  },
  {
    q: "How is straight-line depreciation calculated?",
    a: "Subtract the salvage value from the asset's cost and divide by its useful life in years. An $11,000 asset with a $1,000 salvage value over 5 years depreciates $2,000 a year.",
  },
  {
    q: "How does the declining balance method work?",
    a: "Each year's depreciation is the beginning book value times a fixed rate, where the rate is the depreciation factor divided by the useful life. A factor of 2 over 5 years is a 40% rate. The book value is never depreciated below the salvage value, and the final year brings it down to exactly the salvage value.",
  },
  {
    q: "What is the sum of the years' digits method?",
    a: "It adds up the year numbers of the asset's life (1 + 2 + 3 + 4 + 5 = 15 for a 5-year life) and depreciates the cost minus salvage by a falling fraction each year: 5/15 the first year, then 4/15, 3/15, and so on.",
  },
  {
    q: "What does partial year depreciation do?",
    a: "Most assets aren't placed in service on the first day of the accounting year. With partial year depreciation turned on, the first year only gets the portion of a year that the asset was actually in service, based on the convention you choose, and the remainder is taken in an extra year at the end.",
  },
  {
    q: "What are the partial-year conventions?",
    a: "Count Every Day uses the exact number of days left in the accounting year, divided by 365. Half-Month and Full-Month count the whole months left and add a half or a full month for any leftover days. Half-Quarter and Full-Quarter do the same in quarters. Half-Year always takes half a year in the first year, regardless of the date.",
  },
  {
    q: "Should I round to dollars?",
    a: "Rounding to whole dollars is common for tax and bookkeeping schedules. Choose No to see every figure to the cent. Because each year is rounded on its own, a rounded schedule can end a dollar or so away from the salvage value.",
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
};

const EXAMPLE_HEADERS = ["Year", "Straight Line", "Double Declining", "Sum of Years' Digits"];
const EXAMPLE_ROWS = [
  ["1", "$2,000", "$4,400", "$3,333"],
  ["2", "$2,000", "$2,640", "$2,667"],
  ["3", "$2,000", "$1,584", "$2,000"],
  ["4", "$2,000", "$950", "$1,333"],
  ["5", "$2,000", "$426", "$667"],
  ["Total", "$10,000", "$10,000", "$10,000"],
];

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

export default function DepreciationCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this depreciation calculator builds a
          year-by-year depreciation schedule using the straight line, declining balance, or sum of the years' digits
          method, with optional partial-year depreciation for any accounting-year start date.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Depreciation?</h2>
        <p style={pStyle}>
          In accounting, depreciation spreads the cost of a long-lived asset, like a machine, vehicle, or computer, over
          the years it's expected to be useful. Instead of recording the whole purchase as an expense in the year you buy
          it, you expense a portion each year, which gives a truer picture of profit over time. In the U.S., depreciation
          of business assets is generally tax-deductible.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every method depreciates the same total: the asset's cost minus its salvage value (what it's expected to be
          worth at the end of its life). The methods only differ in timing. Accelerated methods like declining balance and
          sum of the years' digits take more depreciation early on and less later.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Depreciation Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Depreciation method</strong>: straight line, declining balance, or sum of the years' digits.</li>
          <li style={liStyle}><strong>Asset cost</strong>: what you paid for the asset, including costs to get it ready for use.</li>
          <li style={liStyle}><strong>Salvage value</strong>: what you expect it to be worth at the end of its useful life.</li>
          <li style={liStyle}><strong>Depreciation years</strong>: its useful life. Sum of the years' digits needs a whole number of years.</li>
          <li style={liStyle}><strong>Depreciation factor</strong> (declining balance only): 2 for double declining balance, 1.5 for 150% declining balance.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Partial year depreciation</strong>: turn it on if the asset went into service partway through your
            accounting year, then pick a convention, the start date, and when your accounting year begins.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Depreciation Methods and Formulas</h2>
        <p style={pStyle}><strong>Straight line</strong> takes the same amount every year:</p>
        <div style={formulaStyle}>Annual depreciation = (Cost − Salvage value) ÷ Useful life</div>
        <p style={pStyle}>
          <strong>Declining balance</strong> applies a fixed rate to the book value at the start of each year, so the
          amount shrinks as the asset loses value. The book value never drops below the salvage value.
        </p>
        <div style={formulaStyle}>Depreciation = Beginning book value × (Depreciation factor ÷ Useful life)</div>
        <p style={pStyle}>
          <strong>Sum of the years' digits</strong> applies a falling fraction to the depreciable amount. For a life of
          n years, the digits add up to n × (n + 1) ÷ 2.
        </p>
        <div style={formulaStyle}>Depreciation in year k = (Cost − Salvage) × (n − k + 1) ÷ (n × (n + 1) ÷ 2)</div>
        <p style={pStyle}>
          Here's an asset that costs $11,000, has a $1,000 salvage value, and a 5-year life, rounded to dollars:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", fontSize: 13 }}>
            <thead>
              <tr>{EXAMPLE_HEADERS.map((h) => <th key={h} className="data-table-head" style={{ textAlign: "left" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {EXAMPLE_ROWS.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ textAlign: j === 0 ? "left" : "right", fontWeight: row[0] === "Total" ? 700 : 400, color: "var(--text-primary)" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          All three reach the same $10,000 total. Double declining balance front-loads the most: it takes 44% of the
          total in the first year, against 20% for straight line.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Partial-Year Depreciation</h2>
        <p style={pStyle}>
          When an asset is placed in service partway through the accounting year, the first year gets only part of a
          year's depreciation, and the schedule runs one extra year to finish. Conventions decide how that first part is
          measured:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}><strong>Count Every Day</strong>: the exact days remaining in the accounting year, divided by 365.</li>
          <li style={liStyle}><strong>Half-Month / Full-Month</strong>: whole months remaining, plus half a month or a full month for any leftover days.</li>
          <li style={liStyle}><strong>Half-Quarter / Full-Quarter</strong>: the same idea measured in quarters.</li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Half-Year</strong>: half a year's depreciation in the first year no matter when the asset started,
            the convention most often used for U.S. tax depreciation.
          </li>
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
