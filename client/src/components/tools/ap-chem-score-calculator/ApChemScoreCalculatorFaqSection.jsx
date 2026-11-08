import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { AP_EXAMS, apScale } from "../../../utils/apScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is AP® Chemistry?",
    a: "AP® Chemistry is a college-level exam for high school students that covers core chemical concepts and laboratory skills. It has two equally weighted sections: 60 multiple-choice questions and 7 free-response questions (3 long and 4 short). The score is reported from 1 (no recommendation) to 5 (extremely well qualified).",
  },
  {
    q: "When do AP® Chem scores come out?",
    a: "AP® Chem scores usually appear in students' College Board accounts in the first week of July, 8-9 weeks after the May exams. They are released at the same time as other AP® exam scores, but may come later for students who took a late exam.",
  },
  {
    q: "How long is the AP® Chem exam?",
    a: "3 hours and 15 minutes in total: 1 hour 30 minutes for the 60 multiple-choice questions and 1 hour 45 minutes for the 7 free-response questions, with a short break between the two sections. Both sections test problem-solving, concepts and data analysis.",
  },
  {
    q: "Is AP® Chem hard?",
    a: "Yes, it is generally considered one of the harder AP® science courses. It combines conceptual understanding (why reactions happen, not just memorizing) with math-based problem solving, including interpreting lab and experiment data, all under time pressure. It is still manageable with consistent practice and by keeping up with the course.",
  },
  {
    q: "How many units are in AP® Chemistry?",
    a: "AP® Chemistry has 9 units, from atomic structure and properties to chemical reactions, thermodynamics and applications. Each unit builds on the earlier ones, so it helps to review previous topics as you go.",
  },
  {
    q: "Is 4 a good AP® Chem score?",
    a: "Yes. A 4 is a strong AP® Chemistry score, which the College Board describes as \"very well qualified\". It is above the 2025 mean of 3.36: only 46.5% of students scored 4 or higher.",
  },
  {
    q: "How do I calculate my AP® Chem score?",
    a: "Count the points you expect to get for the multiple-choice and free-response questions, enter them into the AP® Chem score calculator, and read your predicted composite score (0-100) and AP® Chem score (1-5).",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AP_SCALE = apScale(AP_EXAMS.chem);
const DISTRIBUTION_2025 = [["5", "17.9%"], ["4", "28.6%"], ["3", "31.4%"], ["2", "15.9%"], ["1", "6.2%"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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

export default function ApChemScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is AP® Chemistry?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} AP® Chem score calculator converts the points you earn in each section of the AP® Chemistry exam into a
          composite score (0-100) and an estimated AP® score (1-5). The College Board adjusts the AP® Chem scale each year based on exam
          difficulty, so your actual AP® score may differ slightly from the estimate. Taking other AP® exams? The
          {" "}{link("/calculators/education/ap-bio-score-calculator", "AP® Bio score calculator")} may help too.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          AP® Chemistry is a college-level exam for high school students that assesses readiness for college, covering core chemical
          concepts and laboratory-based skills. It has two sections with equal weights:
        </p>
        <ul style={listStyle}>
          <li><strong>Multiple-choice questions</strong>: 60 questions.</li>
          <li><strong>Free-response questions</strong>: 3 long and 4 short questions.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>The AP® Chem score is reported on a scale from 1 (no recommendation) to 5 (extremely well qualified).</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>AP® Chem Score Breakdown</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>The calculator estimates your final AP® score in two steps:</p>
        <ol style={listStyle}>
          <li>Count your raw points for each section: multiple-choice questions (MCQ) and free-response questions (FRQ).</li>
          <li>
            Scale each section to 0-50 by multiplying its points by 50 and dividing by the section&apos;s maximum, then add the two:
            <strong> composite = MCQ × 50/60 + FRQ × 50/46</strong>, rounded to a whole number.
          </li>
        </ol>
        <p style={pStyle}>
          For example, 34 multiple-choice points and 25 free-response points give 34 × 50/60 + 25 × 50/46 = 28.33 + 27.17 = 55.51, a
          composite score of 56 and an AP® score of 3. The composite score is matched to an AP® score with the table below; the cut-offs
          can vary slightly each year, as the College Board adjusts them to the exam&apos;s difficulty.
        </p>
        <h3 style={h3Style}>AP® Chemistry score conversion chart</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Chem score</th><th>Composite score</th><th>Recommendation</th></tr></thead>
            <tbody>
              {AP_SCALE.map((b) => (
                <tr key={b.score}><td style={{ ...center, fontWeight: 700 }}>{b.score}</td><td style={center}>{b.min}-{b.max}</td><td style={center}>{capitalise(b.recommendation)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>AP® Chem Score Distribution</h2>
        <p style={pStyle}>
          It helps to compare your result with how other students did on the same exam, as college places are limited and admissions are
          competitive. In 2025, the mean AP® Chemistry score was 3.36, relatively high compared with previous years, when the average was
          closer to 2.8. The table shows the percentage of students who received each score (official College Board data):
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Chem score</th><th>Percentage of students</th></tr></thead>
            <tbody>{DISTRIBUTION_2025.map(([s, pct]) => <tr key={s}><td style={{ ...center, fontWeight: 700 }}>{s}</td><td style={center}>{pct}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the AP® Chem Score Calculator</h2>
        <ol style={listStyle}>
          <li>Estimate your raw score for the multiple-choice part and for each of the 7 free-response questions.</li>
          <li>Enter these values in the matching boxes and click Calculate.</li>
          <li>
            Read your results: the <strong>composite score</strong> (0-100) across both sections, your predicted <strong>AP® Chem
            score</strong> (1-5) from the conversion chart, and the matching College Board <strong>recommendation</strong>.
          </li>
        </ol>
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
