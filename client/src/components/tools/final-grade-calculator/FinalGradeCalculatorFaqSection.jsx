import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my final grade?",
    a: "Find the weight of each task and exam in your syllabus (for example 25% for presentations and 75% for the final exam), multiply each score by its weight (84 out of 100 on the final: 84 × 0.75 = 63), and add up the results from all parts. The total is your grade for the subject as a percentage.",
  },
  {
    q: "What grade do I need on my final exam?",
    a: "Use the formula final exam grade = (wanted grade − (1 − w) × current grade) / w, where w is the final exam's weight as a decimal. With a current grade of 65%, a final worth 70% and a passing grade of 50%, you need (50 − 0.3 × 65) / 0.7 ≈ 43.6% on the final.",
  },
  {
    q: "What score do I need to get an A?",
    a: "Usually 90% or more, but it depends on your grading system and your syllabus. On the USA standard scale used here, an A starts at about 92.75% and an A+ at about 96.4%.",
  },
  {
    q: "How much is needed to pass a GCSE exam?",
    a: "Since the 2022 update you need at least Grade 4 to pass GCSE exams. Grade 4 is generally considered a standard pass, while Grade 5 is a strong pass.",
  },
  {
    q: "What is my final exam percentage if I scored 15 out of 20?",
    a: "75%, since 15 / 20 × 100 = 75. This may not be your final grade if other tasks or scores from your class count too.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SYSTEMS = [
  ["Numbers", "Any numeric scale, such as 0–10 or 1–5"],
  ["Percentage (%)", "0–100%"],
  ["USA Standard", "A+ to F, with +/−"],
  ["USA (Advanced Program)", "A, B, C, D, E/F"],
  ["Canada", "A+ to D−, and R"],
  ["GCSE", "A* to E, and Fail"],
  ["Australian (Schools)", "Band 6 to Band 1"],
  ["Australian (University)", "HD, D, Cr, P, F"],
  ["India (CCE)", "A1 to E2"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
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

export default function FinalGradeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Final Grade Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} final grade calculator answers the question &quot;what grade do I need on my final?&quot; so you can stop
          doing the maths and focus on studying. It works as a finals calculator for one subject or as a semester grade calculator, and the
          sections below show how to calculate the grade you need by hand.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To combine several grades by their weights instead, use the {link("/calculators/education/grade-calculator", "grade calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Your Final Grade?</h2>
        <p style={pStyle}>
          The final grade of a subject (or of a semester) combines all your relevant grades, each counted by its weight. For some subjects the
          final grade is simply the grade on the final and only exam. Many others mix mid-term exams, coursework, essays or presentations, and
          then you need to know the weight of each one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A weight is just a number for how much a grade counts, usually written as a percentage of the total grade or as a decimal from 0 to
          1. The final semester grade works the same way: it combines the grades of all your subjects in a semester, often with equal weights,
          sometimes weighted by credits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Final Grade Calculator</h2>
        <p style={pStyle}>The calculator has two ways of finding the grade you need on your final exam:</p>
        <ul style={listStyle}>
          <li>
            <strong>Current grade</strong>: enter your current grade in the subject, the final grade you want, and how much the final exam is
            worth.
          </li>
          <li>
            <strong>Previous exams</strong>: enter the grade and weight of each exam you have already taken (up to 9; a new one appears as
            you fill in the last) and the final grade you want. Whatever weight is left over is the weight of the final exam.
          </li>
        </ul>
        <p style={pStyle}>
          The first mode is the same as the second with a single previous exam. In both, choose your grading system: numbers or percentages
          for numeric systems, or one of the letter-grade systems below.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the result is above the maximum possible grade, the grade you want can&apos;t be reached with your current grades. If it is zero
          or below, you will reach it whatever you score, but check whether your subject has a minimum grade requirement on the final exam.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Grade You Need on Your Final</h2>
        <p style={formula}>Final exam grade = (wanted grade − (1 − w) × current grade) / w</p>
        <p style={pStyle}>
          where w is the weight of the final exam as a decimal. For example, say your current grade is 65% and the final exam is worth 70% of
          the total grade. You have already collected (1 − 0.7) × 65 = 19.5 points out of 100: with nothing on the final, your final grade
          would be 19.5.
        </p>
        <p style={pStyle}>
          If a passing grade is 50 points, you still need 50 − 19.5 = 30.5 points. The final exam carries 70% of the grade, so those 30.5
          points mean 30.5 / 0.7 ≈ 43.6 points on the final exam itself:
        </p>
        <p style={formula}>(50 − 0.3 × 65) / 0.7 = 30.5 / 0.7 ≈ 43.6%</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Getting 43.6% of the final exam right guarantees a pass, but aim higher, just in case. With several previous exams, replace
          (1 − w) × current grade by the sum of each exam&apos;s grade times its weight, and w by 1 minus the sum of their weights.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Not All Final Grades Are Equal: Grading Systems</h2>
        <p style={pStyle}>
          Some grading systems are simple numbers, such as 0–10 with 5 to pass, or 1–5 with 3 to pass. Others use letters: A to F in the USA,
          or HD, D, Cr, P and F at Australian universities. Most systems are defined as a percentage of the maximum grade, so converting
          between them is a matter of turning the grade into a percentage and looking it up in a table. The calculator supports:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Grading system</th><th>Grades</th></tr></thead>
            <tbody>{SYSTEMS.map(([name, grades]) => <tr key={name}><td style={{ fontWeight: 700 }}>{name}</td><td>{grades}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With a letter system, each letter counts as a typical percentage within its band, and the grade you need on the final is shown as
          a letter. &quot;No grade (0)&quot; means that even a zero on the final is enough.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Grade Do I Need on My Final? Managing Your Time</h2>
        <p style={pStyle}>
          Knowing the grade you need on each final is a good way to plan your study time. When finals are close, your first goal is usually
          to pass every subject and your second to get the best grades you can. Work out what you need in each subject and spend more time
          on the ones that are harder for you or where you need a higher score.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once you are sure of passing, focus on the subjects that matter most for your future or that you enjoy most: liking a subject
          raises your motivation and the effort you put in.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>After Your Final Exams</h2>
        <p style={pStyle}>
          Grades don&apos;t perfectly measure knowledge, but they are still what schools, employers and grant programs look at, especially
          when you have little work experience. If you are applying abroad, convert your grades to a GPA, the de facto international standard,
          with the {link("/calculators/education/high-school-gpa-calculator", "high school GPA calculator")} or the
          {" "}{link("/calculators/education/college-gpa-calculator", "college GPA calculator")}.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          And try to keep exam stress in proportion: no single exam decides your whole future. More tools for students are in the
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
