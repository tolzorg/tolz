import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { SCALES } from "../../../utils/gpaPakistanCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What does GPA stand for?",
    a: "GPA stands for \"grade point average\", sometimes also called \"average grade point\". It represents the score you earned during a semester: each letter grade (A, B, C, D, E and F) corresponds to grade points, which, combined with each course's credit hours, give your GPA. Universities use it around the world to grade students.",
  },
  {
    q: "How can I calculate cGPA from GPA?",
    a: "Multiply each semester's GPA by that semester's total credit hours, add the results, and divide by the total credit hours of all the semesters. The result is your cGPA.",
  },
  {
    q: "I scored 86% marks, what is my GPA?",
    a: "On a 4-point scale, 86% is equivalent to a GPA of about 3.4: one GPA point equals 25%, so divide the percentage by 100 and multiply by 4 (0.86 × 4 = 3.44 ≈ 3.4).",
  },
  {
    q: "How is cGPA different from GPA?",
    a: "GPA is the average grade point you earn in one semester and describes that semester only. cGPA (cumulative GPA) is the average over all your completed semesters; the cGPA at the end of your degree depends on the GPA you earn each semester.",
  },
  {
    q: "I scored straight A's, what is my GPA?",
    a: "Straight A's are the top result, congratulations! On a 4-point GPA scale your GPA is 4; on a 5-point scale it is 5.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const [FOUR, FIVE, QAU] = SCALES;

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function ScaleTable({ scale, heading = "Grade" }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table className="data-table data-table-head" style={{ ...tableStyle, maxWidth: 460 }}>
        <thead><tr><th>{heading}</th><th>Grade points</th></tr></thead>
        <tbody>{scale.grades.map((x) => <tr key={x.label}><td style={{ ...center, fontWeight: 700 }}>{x.label}</td><td style={center}>{x.points.toFixed(1)}</td></tr>)}</tbody>
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

export default function GpaPakistanCalculatorFaqSection() {
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
        <h2 style={h2Style}>GPA Calculator Pakistan</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} GPA calculator for Pakistan is for anyone who has wondered &quot;Did I score enough?&quot; or &quot;How much
          do I need for a good grade?&quot;, and for professors and examination or administration staff who calculate GPA for their students.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It focuses on universities and students in Pakistan, but works for any institute that uses a 4-point or 5-point GPA scale. Below
          you&apos;ll find the GPA formula, the GPA scale charts and how to convert your GPA to a percentage and back.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the GPA Calculator Pakistan</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>First select the grading scale your institute uses:</p>
        <ul style={listStyle}>
          <li>the 4-point scale;</li>
          <li>the 5-point scale; or</li>
          <li>the Quaid-e-Azam University scale for MPhil students: a 5-point scale based on percentage marks, with only the grades A, B, C and F.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}>Then:</p>
        <ol style={listStyle}>
          <li>Choose the grade and enter the credit hours for each course. You can enter up to 20 courses (10 on the Quaid-e-Azam scale), more than enough as Pakistani university students usually take 5 or 6 courses a semester.</li>
          <li>Click Calculate to see your GPA, with your total courses, credit hours and grade points.</li>
          <li>For your cGPA, tick <strong>Calculate cGPA</strong> and enter your previous GPA and the sum of your previous credit hours.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For other systems, try the {link("/calculators/education/college-gpa-calculator", "college GPA calculator")}, the
          {" "}{link("/calculators/education/gpa-calculator", "GPA calculator")} or the
          {" "}{link("/calculators/education/high-school-gpa-calculator", "high school GPA calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>GPA Calculation Formula</h2>
        <p style={pStyle}>All you need are the grade points and credit hours of each course you took in the semester:</p>
        <p style={formula}>GPA = Σ (grade point × credit hours) / total credit hours</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Multiply the grade point earned in each course by its credit hours, add the results and divide by the semester&apos;s total
          credit hours. The calculator shows the GPA to 2 significant figures (e.g., 3.12 is shown as 3.1).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Your GPA</h2>
        <ol style={listStyle}>
          <li>Convert the grade of each course into grade points with the GPA scale chart; for example, on the 4-point scale A is 4 and B+ is 3.3.</li>
          <li>Multiply each grade point by the course&apos;s credit hours. Most courses at Pakistani universities are 3 credit hours, or 4 with a practical lab.</li>
          <li>Add up the results.</li>
          <li>Divide the sum by the total credit hours of the semester. The result is your GPA.</li>
        </ol>
        <p style={pStyle}>For example, grades A, B+, A-, B and B in five 3-credit-hour courses are worth 4, 3.3, 3.7, 3 and 3 grade points:</p>
        <p style={{ ...formula, marginBottom: 0 }}>GPA = (4 × 3 + 3.3 × 3 + 3.7 × 3 + 3 × 3 + 3 × 3) / 15 = 51 / 15 = 3.4</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>GPA Scale Chart and Grade Points</h2>
        <p style={pStyle}>
          Your institute&apos;s GPA chart is usually on your student portal, but to calculate your GPA yourself you need a GPA scale chart showing
          the grade points of each grade.
        </p>
        <h3 style={h3Style}>Four-point GPA scale</h3>
        <p style={pStyle}>The most commonly used scale, for a GPA out of four: the highest score is 4, for an A grade.</p>
        <ScaleTable scale={FOUR} />
        <h3 style={h3Style}>Five-point GPA scale</h3>
        <p style={pStyle}>
          Less common, but used by some institutes, especially for master&apos;s degrees. An A (the highest grade) is worth 5, and the scale
          also has D+ and D- grades.
        </p>
        <ScaleTable scale={FIVE} />
        <h3 style={h3Style}>Quaid-e-Azam University (MPhil)</h3>
        <p style={pStyle}>A 5-point scale based on percentage marks:</p>
        <div style={{ maxHeight: 360, overflowY: "auto" }}><ScaleTable scale={QAU} heading="Percentage marks (grade)" /></div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Convert GPA to Percentage</h2>
        <p style={pStyle}>
          Converting GPA to a percentage and back is straightforward: one GPA point equals 25% on a 4-point scale and 20% on a 5-point scale.
        </p>
        <p style={formula}>4-point scale: percentage (%) = GPA × 100 / 4</p>
        <p style={formula}>5-point scale: percentage (%) = GPA × 100 / 5</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>More tools for students are in the {link("/calculators/education", "education calculators")}.</p>
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
