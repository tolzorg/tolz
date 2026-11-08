import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate weighted grades?",
    a: "Use the formula (g₁ × w₁ + g₂ × w₂ + … + gₙ × wₙ) / (w₁ + w₂ + … + wₙ), where g is a grade and w its weight: multiply each grade by its weight, add the results, and divide by the sum of the weights.",
  },
  {
    q: "How do I calculate my grade points?",
    a: "Convert the point grades to percentages and, if needed, assign a letter equivalent: (p₁ / p₁,max × w₁ + p₂ / p₂,max × w₂ + … + pₙ / pₙ,max × wₙ) / (w₁ + w₂ + … + wₙ), where p is the points on a test, pmax the maximum points on that test and w the grade's weight.",
  },
  {
    q: "What's a 75 in letter grade?",
    a: "A 75% is a C, which is considered a passing grade. A C is generally between 70 and 79 percent; with +/- grades, a C- is 70-72%, a C is 73-76% and a C+ is 77-79%.",
  },
  {
    q: "How do I calculate my final grade in percentage?",
    a: "Add up the points you received on all assignments, tests and projects, divide by the total points possible, and multiply by 100. For example, scores of 15/20, 18/20 and 12/20 give 45 / 60 = 0.75, a final grade of 75%.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SCALE = [
  ["A+", "97-100", "4.3"], ["A", "93-96", "4.0-4.29"], ["A-", "90-92", "3.7-3.99"], ["B+", "87-89", "3.3-3.69"], ["B", "83-86", "3.0-3.29"],
  ["B-", "80-82", "2.7-2.99"], ["C+", "77-79", "2.3-2.69"], ["C", "73-76", "2.0-2.29"], ["C-", "70-72", "1.7-1.99"], ["D+", "67-69", "1.3-1.69"],
  ["D", "63-66", "1.0-1.29"], ["D-", "60-62", "0.7-0.99"], ["F", "Below 60", "0.0-0.69"],
];
const SIMPLE = [["A", "90-100", "3.7-4.0"], ["B", "80-89", "2.7-3.69"], ["C", "70-79", "1.7-2.69"], ["D", "60-69", "0.7-1.69"], ["E / F", "0-59", "0.0-0.69"]];

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

function ScaleTable({ rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table className="data-table data-table-head" style={tableStyle}>
        <thead><tr><th>Letter grade</th><th>Percentage</th><th>GPA (grade point average)</th></tr></thead>
        <tbody>{rows.map(([l, p, g]) => <tr key={l}><td style={{ ...center, fontWeight: 700 }}>{l}</td><td style={center}>{p}</td><td style={center}>{g}</td></tr>)}</tbody>
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

export default function GradeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Grade Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} grade calculator estimates your overall grade from your component marks. It handles the three grading
          systems common in the US: it is a letter grade calculator, a grade percentage calculator and a point grade calculator.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use it as an unweighted or weighted grade calculator, and set the grading scale your teachers use. If your grades are final grades
          from different college courses rather than parts of one course, the
          {" "}{link("/calculators/education/college-gpa-calculator", "college GPA calculator")} combines them by their credits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This Grading Calculator Works</h2>
        <p style={pStyle}>
          The tool has three parts: a letter grade calculator, a grade percentage calculator and a point grade calculator. Choose the
          grades type and how many grades to enter, up to 15.
        </p>
        <p style={pStyle}>
          The weights are set to 1 by default: leave them for an unweighted average, or set them if your grades have weights. A weight can be a
          decimal (1 = 100%, 0.5 = 50%, 0.2 = 20%) or, by switching its unit to %, a percentage.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          US schools and universities use different grading scales; set your teachers&apos; thresholds in the <em>Grading scale (thresholds)</em>{" "}
          section of the calculator. By default it uses this common scale:
        </p>
        <ScaleTable rows={SCALE} />
        <p style={{ ...pStyle, marginBottom: 6 }}>Some schools don&apos;t use +/-; the most popular scale then looks like this:</p>
        <ScaleTable rows={SIMPLE} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          See the {link("/calculators/education/gpa-calculator", "GPA calculator")} for more about grade point averages.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Letter Grade Calculator</h2>
        <ol style={listStyle}>
          <li>If your school&apos;s grading scale differs from the one above, set it in <em>Grading scale (thresholds)</em>.</li>
          <li>Set the grades type to &quot;Letters&quot; and enter how many grades you want to add.</li>
          <li>Choose the grade of your first assignment, test, exam or subject.</li>
          <li>If your grades have weights or credits, enter the first grade&apos;s weight; for an unweighted average, leave the weights at 1.</li>
          <li>Do the same for all your marks and click Calculate to see your overall grade, its GPA value and its percentage range.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Grade Percentage Calculator</h2>
        <ol style={listStyle}>
          <li>Set the grades type to &quot;Percentage&quot; and choose the number of grades.</li>
          <li>Type in the percentage result of each test, task or subject, with its weight or credits (leave it at 1 if your teacher doesn&apos;t use weights).</li>
          <li>Click Calculate to see the average of your marks and its equivalent letter grade on your grading scale.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Grade Calculator Points</h2>
        <ol style={listStyle}>
          <li>Set the grades type to &quot;Points&quot;.</li>
          <li>Enter the points you got for each task, assignment or subject, the maximum points for it and, if applicable, its weight.</li>
          <li>Click Calculate to see the points you achieved out of the maximum you could have got (ignoring the weights), and the equivalent percentage and letter.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Weighted Grades?</h2>
        <p style={formula}>(g₁ × w₁ + g₂ × w₂ + … + gₙ × wₙ) / (w₁ + w₂ + … + wₙ)</p>
        <p style={pStyle}>
          where g is a grade and w its weight: multiply all your grades by their weights, add them up, and divide by the sum of the weights.
          The weights show how important each grade is: a B with a weight of 2 and an A with a weight of 5 count as two Bs and five As.
        </p>
        <p style={{ ...formula, marginBottom: 6 }}>(3 × 2 + 4 × 5) / (2 + 5) = 26 / 7 ≈ 3.71</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>With A = 4 and B = 3, the result, 3.71, is an A-.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Grade Percentage?</h2>
        <p style={pStyle}>
          Use the same formula. For example, 67% on an essay worth 15% of the grade, 75% on a midterm worth 35% and 72% on a final worth 50%
          (weights as decimals adding up to 1, so the denominator can be skipped):
        </p>
        <p style={{ ...formula, marginBottom: 6 }}>67% × 0.15 + 75% × 0.35 + 72% × 0.5 = 10.05% + 26.25% + 36% = 72.3% ≈ 72%</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>The final grade is 72%, a C-.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate My Grade Points?</h2>
        <p style={pStyle}>Convert point grades to percentages, then assign a letter if needed:</p>
        <p style={formula}>(p₁ / p₁,max × w₁ + p₂ / p₂,max × w₂ + … + pₙ / pₙ,max × wₙ) / (w₁ + w₂ + … + wₙ)</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          where p is the points you got on a test, pmax the maximum points on it and w its weight. More tools for students are in the
          {" "}{link("/calculators/education", "education calculators")}.
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
