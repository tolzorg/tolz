import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the weighted grade for a class?",
    a: "Gather all your grades so far and their weights (the percentage of the whole semester each grade makes up). Multiply each grade by its weight, writing percentage weights as decimals (10% → 0.1, 30% → 0.3), and add up the products: weighted grade = (grade 1 × weight 1) + (grade 2 × weight 2) + (grade 3 × weight 3) + …",
  },
  {
    q: "How do I calculate my semester grade?",
    a: "Multiply each term's grade by its weight and add the results. With 65%, 70% and 75% weighted 0.3, 0.4 and 0.3: 65% × 0.3 = 19.5%, 70% × 0.4 = 28% and 75% × 0.3 = 22.5%, so the semester grade is 19.5% + 28% + 22.5% = 70%.",
  },
  {
    q: "How do I calculate what final exam grade I need?",
    a: "Multiply your current grades by their weights and add them up to get your current weighted grade. Subtract it from the semester grade you want to get the weighted final exam grade you need, then divide that by the weight of the final exam: final exam grade = (semester grade − current weighted grade) / final exam weight.",
  },
  {
    q: "How do I average two grades from a semester?",
    a: "Multiply each grade by its weight, add the two products and divide by the sum of the weights: average = ((grade 1 × weight 1) + (grade 2 × weight 2)) / (weight 1 + weight 2).",
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
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
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

export default function SemesterGradeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Semester Grade Calculator</h2>
        <p style={pStyle}>
          Is the end of the semester coming? The {link("/", "Tolz")} semester grade calculator works out your semester grade from your
          quarter grades and final exam, each counted by its weight.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also answers the question &quot;what grade do I need in my finals to pass?&quot;. Below you&apos;ll find some tips for getting
          through your midterms, how the calculator works and a worked example.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Grade Do I Need to Pass?</h2>
        <p style={pStyle}>
          Grades don&apos;t define you as a person, but finishing school is an important step towards the job you want, and a passing grade
          matters. In college, better grades may even help you pay off your student loan sooner (see the
          {" "}{link("/calculators/financial/student-loan-calculator", "student loan calculator")}).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With this grade average calculator you can plan your work for the whole semester. Just before your finals, enter your results so
          far, the weight of each quarter and the semester grade you want, and it tells you the grade you need on the final exam.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Improve My Grades?</h2>
        <ul style={listStyle}>
          <li>Organize your time, for example with the Pomodoro technique.</li>
          <li>Pay attention in class: it cuts the time you spend learning the topic at home.</li>
          <li>Give extra time to the topics you find hardest.</li>
          <li>Don&apos;t let social media and TV distract you: one episode in the evening is fine, a binge-watch isn&apos;t.</li>
          <li>Improve your study style: notes with lots of diagrams, explainer videos, or explaining what you learn in your own words. Find what suits you.</li>
          <li>Ask friends for help or find a tutor. Sometimes a topic simply takes more time, so don&apos;t be afraid to ask.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These are just suggestions; if you need more help, ask your teachers. To find the grade you need on one final exam from your current
          grade or up to nine previous exams, use the {link("/calculators/education/final-grade-calculator", "final grade calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Semester Grade Calculator</h2>
        <p style={pStyle}>Enter three pairs of values:</p>
        <ol style={olStyle}>
          <li>Your first quarter grade and the percent of the semester grade it makes up (its weight).</li>
          <li>Your second quarter grade and its weight.</li>
          <li>Your final exam grade and its weight.</li>
        </ol>
        <p style={pStyle}>
          Leave one weight blank and it is set to what is left of 100%. Click Calculate to see your semester grade and a chart of the weights.
        </p>
        <p style={pStyle}>
          To answer &quot;what grade do I need to finish the semester with X?&quot;, use the calculator backwards: enter steps 1 and 2, leave the
          final exam grade blank and type the semester grade you want. The grade you need on the final appears. Values filled in by the
          calculator are shown in blue, and any one of the grades can be found this way.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your course has more than these three parts, use the {link("/calculators/education/grade-calculator", "grade calculator")}, where
          you can enter more grades with their own weights.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Grade Average Calculator in Practice</h2>
        <p style={pStyle}>
          Elizabeth is a 7th-grade student. She got 70% in the first quarter, which is 40% of her semester grade, and 65% in the harder
          second quarter, which is 30%. On the final exam she got 80%; its weight is 100% − 40% − 30% = 30%.
        </p>
        <p style={formula}>Semester grade = 70% × 0.4 + 65% × 0.3 + 80% × 0.3 = 71.5%</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Her semester grade is 71.5%: her final exam brought her grade up. Once you have the final grades for your high school courses,
          combine them with the {link("/calculators/education/high-school-gpa-calculator", "high school GPA calculator")}. More tools for
          students are in the {link("/calculators/education", "education calculators")}.
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
