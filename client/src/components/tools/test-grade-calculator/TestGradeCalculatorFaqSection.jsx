import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my test grade?",
    a: "Find the total number of points available on the test and add up the points you earned. Divide the points you earned by the total points available and multiply by 100 to get your percentage score, then look it up on your grading scale.",
  },
  {
    q: "Is 27 out of 40 a passing grade?",
    a: "It depends on your teacher's grading scale. If a passing score is 60% (a D-), then 27 out of 40 is 67.5% (a D+), which passes. With a different scale the passing score could be higher or lower.",
  },
  {
    q: "What grade is 7 wrong out of 40?",
    a: "A B-, or 82.5%: percentage score = 100 × (total − wrong) / total = 100 × (40 − 7) / 40 = 82.5%, which is a B- on the default grading scale. Grading varies, so check with your teacher.",
  },
  {
    q: "Is 75 out of 80 an A?",
    a: "Yes. 75 out of 80 is 93.75%, an A on the default grading scale.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SCALE = [
  ["A+", "97-100"], ["A", "93-96"], ["A-", "90-92"], ["B+", "87-89"], ["B", "83-86"], ["B-", "80-82"], ["C+", "77-79"],
  ["C", "73-76"], ["C-", "70-72"], ["D+", "67-69"], ["D", "63-66"], ["D-", "60-62"], ["F", "Below 60"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 360 };
const center = { textAlign: "center" };
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

export default function TestGradeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Test Grade Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} test grade calculator is a must if you need to set a grading scale. Also known as a test score calculator or
          teacher grader, it finds the percentage and grade from the number of points and the wrong (or correct) answers, and you can change
          the default grading scale to your own.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If it isn&apos;t quite the tool you need, try the {link("/calculators/education/grade-calculator", "grade calculator")}, the
          {" "}{link("/calculators/education/semester-grade-calculator", "semester grade calculator")} or the
          {" "}{link("/calculators/education/final-grade-calculator", "final grade calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate a Test Score</h2>
        <p style={pStyle}>Divide the points earned by the total points possible; in other words, find the percentage of correct answers:</p>
        <p style={formula}>percentage score = (#correct / #total) × 100</p>
        <p style={pStyle}>As #correct + #wrong = #total, you can also write it as:</p>
        <p style={formula}>percentage score = 100 × (#total − #wrong) / #total</p>
        <p style={{ ...pStyle, marginBottom: 6 }}>Then convert the percentage into a letter grade. The default grading scale is:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Letter grade</th><th>Percentage</th></tr></thead>
            <tbody>{SCALE.map(([l, p]) => <tr key={l}><td style={{ ...center, fontWeight: 700 }}>{l}</td><td style={center}>{p}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 6 }}>Without +/- grades, the scale may look like this:</p>
        <ul style={listStyle}>
          <li>A is 90% to 100%;</li>
          <li>B is 80% to 89%;</li>
          <li>C is 70% to 79%;</li>
          <li>D is 60% to 69%; and</li>
          <li>F is 59% and below, which is not a passing grade.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is the standard grading system for US schools and universities, but grading varies between schools, classes and teachers, so
          check which one applies to you. If the passing score isn&apos;t 60% but, say, 50% or 65%, change the ranges in the calculator&apos;s
          Grade scale section (see the advanced usage below).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Test Grade Calculator: How to Use It</h2>
        <ol style={olStyle}>
          <li>Enter the number of questions, points or problems in the test, quiz or exam. Say the test has 18 questions.</li>
          <li>Enter how many the student got wrong, or, if you prefer, the number of correct answers or points. Say the student missed 3 questions.</li>
          <li>Click Calculate to see the percentage and grade for that score: here 83.33%, a B.</li>
          <li>
            Below the result is the full grading scale table. To grade the next students, enter how many questions they got wrong, or just
            use the table.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Any two of the four values work: for example, the number of points and the percentage give the number of correct and wrong
          answers. The percentage on its own gives the letter grade.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Test Grade Calculator: Advanced Usage</h2>
        <p style={pStyle}>Open the Grade scale and Grade table sections of the calculator to customize it:</p>
        <ul style={listStyle}>
          <li>
            <strong>Percentage scale</strong>: change the grading scale from the default. If a test was hard and you want 50% to be a passing
            grade (usually it is 60% or even 65%), change <em>Grade D- ≥</em> from 60% to 50%, and adjust the other ranges if you like. Don&apos;t
            need +/- grades? Just ignore the signs.
          </li>
          <li>
            <strong>Increment by</strong>: change the steps of the grade table. The default, 1, means whole points; if half-points are
            possible, use 0.5.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More tools for students and teachers are in the {link("/calculators/education", "education calculators")}.
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
