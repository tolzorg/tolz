import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my college GPA?",
    a: "Convert each letter grade into its grade value (A = 4.0, B+ = 3.3 and so on), multiply it by the course's credits, add the results and divide by the total credits. For example, A (3 credits), B+ (4), C (2) and B- (2) give 34.6 / 11 = 3.15.",
  },
  {
    q: "What if my courses have no credits?",
    a: "Enter one (1) credit for each course. Every course is then treated equally, and the GPA is the plain arithmetic average of your grades instead of a weighted average.",
  },
  {
    q: "What is the average college GPA?",
    a: "Around 3.15: about 3.0 at public schools and 3.3 at private colleges and universities, according to 2010 studies. It also depends a lot on the major, with science majors tending to have lower GPAs than humanities majors.",
  },
  {
    q: "What is a good GPA in college?",
    a: "It depends on your ambitions, college and major. A 3.0 GPA is a B, which stands for average, and is often the lowest score that lets you continue specific majors or courses. A 3.5 GPA is often seen as above average, good or even very good.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SCALE = [
  ["A+", "97-100", "4", "4.3"], ["A", "93-96", "4", "4"], ["A-", "90-92", "3.7", "3.7"], ["B+", "87-89", "3.3", "3.3"],
  ["B", "83-86", "3", "3"], ["B-", "80-82", "2.7", "2.7"], ["C+", "77-79", "2.3", "2.3"], ["C", "73-76", "2", "2"],
  ["C-", "70-72", "1.7", "1.7"], ["D+", "67-69", "1.3", "1.3"], ["D", "65-66", "1", "1"], ["F", "Below 65", "0", "0"],
];
const EXAMPLE = [["Maths", "3", "A", "4.0"], ["Physics", "4", "B+", "3.3"], ["Biology", "2", "C", "2.0"], ["Chemistry", "2", "B-", "2.7"]];

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

export default function CollegeGpaCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is GPA?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} college GPA calculator finds your GPA from the grades and credits of your courses, and your cumulative GPA
          across semesters. For high school students or courses graded with extra points (honors, AP, IB), the
          {" "}{link("/calculators/education/gpa-calculator", "GPA calculator")} has more weighting options.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          GPA stands for Grade Point Average, one of the measures of students&apos; achievement and academic performance. Grades are
          converted to a numerical scale and averaged according to their credits (weights), over a semester, a year or your whole academic
          career. GPA may vary a bit between schools, but academic institutions and employers often use it to assess and rank students for:
        </p>
        <ul style={listStyle}>
          <li>Scholarships, merit-based financial aid and funding programs;</li>
          <li>Graduation honors and awards; and</li>
          <li>Job interviews and admission decisions.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>College GPA Scale (4.0 GPA Scale)</h2>
        <p style={pStyle}>Most US schools use a 4.0 GPA scale, a 4-point grading scale. A typical letter grade to GPA conversion:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Letter grade</th><th>Percentile</th><th>4.0 scale</th><th>+4.0 scale</th></tr></thead>
            <tbody>{SCALE.map(([g, pct, a, b]) => <tr key={g}><td style={{ ...center, fontWeight: 700 }}>{g}</td><td style={center}>{pct}</td><td style={center}>{a}</td><td style={center}>{b}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some schools give 4.3 for an A+, so a final score above the standard maximum of 4.0 is possible; the calculator uses this +4.0
          scale. Percentage intervals and GPA scales differ between schools, so check your school&apos;s rules.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate College GPA? College GPA Formula</h2>
        <p style={formula}>GPA = Σ (grade value × credit points) / Σ credit points</p>
        <p style={pStyle}>In other words, the sum of the weighted grades divided by all the credit points. For example, take these four courses:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>Grade value</th></tr></thead>
            <tbody>{EXAMPLE.map(([c, cr, g, v]) => <tr key={c}><td style={{ fontWeight: 600 }}>{c}</td><td style={center}>{cr}</td><td style={center}>{g}</td><td style={center}>{v}</td></tr>)}</tbody>
          </table>
        </div>
        <ol style={listStyle}>
          <li>Convert the letter grades into numbers with the scale above.</li>
          <li>Add up each grade multiplied by its credits: 3 × 4.0 + 4 × 3.3 + 2 × 2.0 + 2 × 2.7 = 34.6.</li>
          <li>Divide by the sum of the credits: 34.6 / (3 + 4 + 2 + 2) = 3.1454… ≈ 3.15.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With the calculator, choose the grade and enter the credits for each course; new boxes appear as you fill in the last pair, for up
          to 30 courses. If your courses have no credits, enter 1 credit for each course to get the plain average.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Use the Tool as a College Cumulative GPA Calculator</h2>
        <p style={pStyle}>
          Tick <strong>Calculate your cumulative GPA</strong> and two boxes appear, for your prior GPA and the total credits behind it.
          Continuing the example: say the courses above were the second semester and the first semester ended with a GPA of 3.3 from 16
          credits. Enter 3.3 as the prior GPA and 16 as the total credits of prior GPA.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator shows the semester GPA (3.15) and the cumulative GPA: (34.6 + 3.3 × 16) / (11 + 16) = 87.4 / 27 ≈ 3.24.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Average College GPA</h2>
        <p style={pStyle}>
          It is hard to pick one number for the average college GPA: grades have risen over the years, and they differ between schools,
          fields of study and other factors. As a guide, the average college GPA is around 3.15: 3.0 at public schools and 3.3 at private
          colleges and universities, according to 2010 studies. A is now the most common grade in all types of colleges, and GPAs have
          risen about 0.1 points every ten years; in the 1950s the average was 2.52.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The average also depends a lot on the major: science majors tend to have lower GPAs than humanities majors (about 2.78 in
          Chemistry and 2.90 in Maths, compared with 3.36 in Education), and highly selective colleges have higher average GPAs than schools
          with high acceptance rates.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good GPA in College?</h2>
        <p style={pStyle}>
          It depends on your ambitions, your college, your major and many other factors. Generally, a 3.0 GPA is a B, which stands for
          average, and is often the lowest score that lets you continue specific majors or courses. A 3.5 GPA is often seen as above
          average, good or even very good, though this varies by major and school.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your GPA is lower than you would like, don&apos;t worry too much: employers rank GPA relatively low compared with internships
          and work experience, your major, volunteering and extracurricular activities. More tools for students are in the
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
