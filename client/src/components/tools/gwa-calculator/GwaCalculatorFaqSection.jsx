import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my GWA?",
    a: "Multiply each course's grade by its units, add the products, and divide by the total units. For example, a 5-unit math course graded 1.50, a 3-unit science course graded 2.25 and a 3-unit art course graded 1.00 give 7.50 + 6.75 + 3.00 = 17.25, and 17.25 / 11 = 1.56818 ≈ 1.57.",
  },
  {
    q: "How is overall GWA calculated?",
    a: "The overall GWA of a college student is the sum of the products of all course grades and their units, divided by the total number of units taken throughout their university stay.",
  },
  {
    q: "What is the passing GWA in the Philippines?",
    a: "It depends on the university's grading system. Universities that use a 1.00 to 5.00 grade point scale, where 1.00 is the highest, usually consider 3.00 the passing GWA. Institutions that use a 4.00 to 1.00 scale consider 1.00 passing.",
  },
  {
    q: "What is the equivalent GPA of a 1.00 GWA?",
    a: "On a 1.00 to 5.00 grade point scale, a GWA of 1.00 is the top grade, equivalent to an A+. On a 4.00 to 1.00 scale (where 4.00 is the A+), a GWA of 1.00 is equivalent to a D.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const EXAMPLE = [["1", "3", "1.00"], ["2", "1", "1.25"], ["3", "5", "1.50"]];
const HALF_STEP = [["4.0", "A"], ["3.5", "B+"], ["3.0", "B"], ["2.5", "C+"], ["2.0", "C"], ["1.5", "D+"], ["1.0", "D"], ["0.0", "F"]];
const PLUS_MINUS = [["4.0", "A"], ["3.7", "A-"], ["3.3", "B+"], ["3.0", "B"], ["2.7", "B-"], ["2.3", "C+"], ["2.0", "C"], ["1.7", "C-"], ["1.3", "D+"], ["1.0", "D"], ["0.7", "D-"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function Equivalence({ rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table className="data-table data-table-head" style={{ ...tableStyle, maxWidth: 420 }}>
        <thead><tr><th>Grade point</th><th>Letter grade</th></tr></thead>
        <tbody>{rows.map(([gp, l]) => <tr key={l}><td style={center}>{gp}</td><td style={{ ...center, fontWeight: 700 }}>{l}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

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

export default function GwaCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is GWA?</h2>
        <p style={pStyle}>
          If you&apos;re wondering how to compute the general weighted average in college, the {link("/", "Tolz")} GWA calculator is for you.
          Knowing your GWA helps you reach your academic goals, but remember to study well, focus on your dreams, and also enjoy your
          university years and connect with other people. 🙂
        </p>
        <p style={pStyle}>
          GWA, or general weighted average, is the usual system in the Philippines for grading a college or university student&apos;s
          academic performance. A student&apos;s overall performance has to take into account the weight of each course or subject.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Each course&apos;s weight reflects its difficulty or importance through the credits or units it contributes to the degree&apos;s
          curriculum. Major courses usually weigh more than minor courses and are worth more units.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Compute GWA in College</h2>
        <p style={pStyle}>
          The general weighted average is a weighted average of your course grades, with the course units as the weights:
        </p>
        <p style={formula}>GWA = Σ (g<sub>i</sub> × u<sub>i</sub>) / Σ u<sub>i</sub></p>
        <ul style={listStyle}>
          <li><strong>GWA</strong>: general weighted average;</li>
          <li><strong>g<sub>i</sub></strong>: grade of each course or subject;</li>
          <li><strong>u<sub>i</sub></strong>: units or credits of each course; and</li>
          <li><strong>i</strong> runs from 1 to <strong>n</strong>, the number of courses in the calculation.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Example of How to Compute General Weighted Average in College</h2>
        <p style={pStyle}>Take these course grades:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={{ ...tableStyle, maxWidth: 460 }}>
            <thead><tr><th>Course number</th><th>Course units</th><th>Course grade</th></tr></thead>
            <tbody>{EXAMPLE.map(([n, u, g]) => <tr key={n}><td style={center}>{n}</td><td style={center}>{u}</td><td style={center}>{g}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={pStyle}>Add the products of the course grades and their units, then divide by the total units:</p>
        <p style={formula}>GWA = (1.00 × 3 + 1.25 × 1 + 1.50 × 5) / (3 + 1 + 5) = 11.75 / 9 = 1.30555 ≈ 1.31</p>
        <p style={pStyle}>
          Universities and colleges in the Philippines use different grading systems: some use a grade point scale where 1.00 is the
          highest grade, some have 4.00 as the highest, and others follow the US-style GPA grading system. The calculation is the same. For
          letter grades, first convert them to grade points; some universities use this equivalence table:
        </p>
        <Equivalence rows={HALF_STEP} />
        <p style={pStyle}>and some use this one:</p>
        <Equivalence rows={PLUS_MINUS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To learn more about GPA, see the {link("/calculators/education/gpa-calculator", "GPA calculator")}, the
          {" "}{link("/calculators/education/college-gpa-calculator", "college GPA calculator")} or the
          {" "}{link("/calculators/education/high-school-gpa-calculator", "high school GPA calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use This GWA Calculator</h2>
        <ol style={listStyle}>
          <li>Choose the grading system your university uses.</li>
          <li>Select the grade and enter the units of your first course or subject.</li>
          <li>Repeat for your other subjects; new rows appear as you fill in the last one, for up to 30 courses.</li>
          <li>Click Calculate to see your general weighted average (and, for the letter systems, its equivalent letter grade).</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Units entered without a grade still count in the total units, as in the reference calculator, so fill in both for every course.
          More tools for students are in the {link("/calculators/education", "education calculators")}.
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
