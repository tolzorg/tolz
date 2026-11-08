import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { AP_EXAMS, apScale } from "../../../utils/apScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is the AP® Lang score?",
    a: "AP® Lang score is short for the AP® English Language and Composition score, reported from 1 to 5. The exam has a multiple-choice section and an essay section, and many colleges give credit or placement depending on your score, where 1 is no recommendation and 5 is extremely well qualified.",
  },
  {
    q: "When do AP® Lang scores come out?",
    a: "AP® Lang results usually come out in the first week of July (on July 7 in 2025), about 7-9 weeks after the May exam. To estimate your score earlier, use the AP® Lang score calculator.",
  },
  {
    q: "How is the AP® Lang exam scored?",
    a: "The points from the 45 multiple-choice questions make up 45% of the score and the three essays make up 55%. The College Board combines them into a composite score, which is converted to the 1-5 AP® scale with the score breakdown table.",
  },
  {
    q: "How do I find my AP® Lang score?",
    a: "Count the points you think you will get in each section of the exam, enter them into the AP® Lang score calculator, and read your composite score (0-100) and the matching AP® score (1-5).",
  },
  {
    q: "Is 3 a good AP® Lang score?",
    a: "Yes. The College Board considers a 3 \"qualified\", roughly equivalent to a B-, C+ or C grade, and many colleges will give you placement for a 3. On average, about 60% of students get a 3 or higher. Some more selective schools may require a 4 or 5.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AP_SCALE = apScale(AP_EXAMS.lang);
const DISTRIBUTION_2025 = [["5", "13.4%"], ["4", "28%"], ["3", "32.8%"], ["2", "16.1%"], ["1", "9.7%"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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

export default function ApLangScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is the AP® Lang Score?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} AP® Lang score calculator helps you work out your AP® English Language and Composition score (AP® Lang
          score for short) from the points you think you got in each section of the exam. Taking other AP® exams too? Try the
          {" "}{link("/calculators/education/ap-bio-score-calculator", "AP® Bio")} and
          {" "}{link("/calculators/education/ap-chem-score-calculator", "AP® Chem")} score calculators.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The AP® Lang score ranges from 1 to 5 and covers a multiple-choice section and an essay section. Many colleges give credit or
          placement depending on your score, where 1 is no recommendation and 5 is extremely well qualified.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the AP® Lang Score</h2>
        <p style={pStyle}>
          Count your points in each section of the exam, multiple-choice questions and free-response questions, then use the formula for
          the composite score, which is a weighted average of the two sections:
        </p>
        <p style={{ ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" }}>CS = MCQ + (FRQ₁ + FRQ₂ + FRQ₃) × 55/18</p>
        <ul style={listStyle}>
          <li><strong>MCQ</strong>: points for the multiple-choice questions, between 0 and 45;</li>
          <li><strong>FRQ₁, FRQ₂, FRQ₃</strong>: points for each of the three essays, between 0 and 6; and</li>
          <li><strong>CS</strong>: the composite score, between 0 and 100, rounded to a whole number.</li>
        </ul>
        <p style={pStyle}>
          For example, 43 multiple-choice points and essays scored 6, 3 and 2 give 43 + 11 × 55/18 = 76.61, a composite score of 77 and
          an AP® score of 5. The composite score is then converted to an AP® score. The College Board sets the conversion, which may
          change from year to year with the exam&apos;s difficulty; the calculator uses this breakdown:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Lang score</th><th>Composite score</th><th>Recommendation</th></tr></thead>
            <tbody>
              {AP_SCALE.map((b) => (
                <tr key={b.score}><td style={{ ...center, fontWeight: 700 }}>{b.score}</td><td style={center}>{b.min}-{b.max}</td><td style={center}>{capitalise(b.recommendation)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>AP® Lang Score Distribution</h2>
        <p style={pStyle}>
          How does your AP® Lang score compare with other students? The College Board&apos;s AP Students website publishes the results of
          past AP® Lang exams since 2002. In 2025 the mean score was 3.2, exceptionally high compared with previous years, when it was
          about 2.8-2.9. The 2025 distribution was:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Lang score</th><th>Percentage of students</th></tr></thead>
            <tbody>{DISTRIBUTION_2025.map(([s, pct]) => <tr key={s}><td style={{ ...center, fontWeight: 700 }}>{s}</td><td style={center}>{pct}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the AP® Language and Composition Score Calculator</h2>
        <ol style={listStyle}>
          <li>Start with the multiple-choice questions: enter how many you answered correctly in the Reading box.</li>
          <li>Switch to the free response section and enter your estimated points (0-6) for the synthesis, rhetorical and argument essays.</li>
          <li>Click Calculate to see your composite score and final AP® Lang score, along with the College Board recommendation for that score.</li>
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
