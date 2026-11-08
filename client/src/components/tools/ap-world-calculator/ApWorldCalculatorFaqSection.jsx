import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { AP_EXAMS, apScale } from "../../../utils/apScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is AP® World?",
    a: "AP® World is a college-level history course and exam offered by the College Board for high school students. Its full name is AP® World History: Modern, and it covers material from 1200 C.E. to the present. The exam has multiple-choice and free-response questions with different weights, and the score ranges from 1 to 5.",
  },
  {
    q: "How long is the AP® World History exam?",
    a: "3 hours and 15 minutes in total. Section I has the multiple-choice questions (55 questions, 55 minutes) and the short-answer questions (3 questions, 40 minutes); Section II has a document-based question (60 minutes) and a long essay question (40 minutes). There is a short break between the two sections.",
  },
  {
    q: "When do AP® World scores come out?",
    a: "AP® World History scores are typically released in early July, about 8-9 weeks after the exam. The College Board notes that some scores may take longer to process because of later testing dates or other circumstances.",
  },
  {
    q: "Is AP® World History hard?",
    a: "Yes, it is generally considered a challenging course and exam. It covers more than 800 years of global history in 9 units and asks you to analyze developments across different regions and time periods, and the exam's time limits make good time management essential.",
  },
  {
    q: "How do I calculate my AP® World score?",
    a: "Estimate your raw points for each question on the exam, enter them into the AP® World calculator, and review your composite score and estimated AP® score. The estimate may not exactly match your official score, as the College Board accounts for exam difficulty across all test-takers.",
  },
  {
    q: "Is 4 a good AP® World score?",
    a: "Yes. A 4 is a strong AP® World History score: the College Board classifies it as \"very well qualified\", showing strong readiness for college-level work. It is above the average score (around 3), though it may not be enough for more selective colleges.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AP_SCALE = apScale(AP_EXAMS.world);
const DISTRIBUTION_2025 = [["5", "13.9%"], ["4", "33.4%"], ["3", "17.0%"], ["2", "26.5%"], ["1", "9.2%"]];
const SECTIONS = [
  ["55 multiple-choice questions (MCQ)", "55 points scaled to 52", "MCQ × 52/55"],
  ["3 short-answer questions (SAQ)", "9 points scaled to 26", "SAQ × 26/9"],
  ["1 document-based question (DBQ)", "7 points scaled to 32", "DBQ × 32/7"],
  ["1 long essay question (LEQ)", "6 points scaled to 20", "LEQ × 20/6"],
];
const UNITS = [
  ["1200-1450", ["Unit 1: The Global Tapestry", "Unit 2: Networks of Exchange"]],
  ["1450-1750", ["Unit 3: Land-Based Empires", "Unit 4: Transoceanic Interconnections"]],
  ["1750-1900", ["Unit 5: Revolutions", "Unit 6: Consequences of Industrialization"]],
  ["1900-present", ["Unit 7: Global Conflict", "Unit 8: Cold War and Decolonization", "Unit 9: Globalization"]],
];

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

export default function ApWorldCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is AP® World?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} AP® World calculator helps you predict your AP® World History score from the points you think you will
          get on the exam, along with the matching College Board qualification level. Official scores may differ slightly, as the scale is
          adjusted each year for exam difficulty.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          AP® World is a college-level history course and exam offered by the College Board for high school students. Its full name is
          AP® World History: Modern, and it covers material from 1200 C.E. to the present. The exam includes multiple-choice and
          free-response questions with different weights, which together give an AP® World score from 1 to 5.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the AP® World Calculator</h2>
        <ol style={listStyle}>
          <li>Review your exam responses and estimate the points you earned on each section.</li>
          <li>Enter your points in the matching boxes and click Calculate.</li>
          <li>View your composite score (0-130) and predicted AP® World score (1-5).</li>
          <li>Compare your result with the AP® World History score distribution below.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Taking other AP® exams? Try the {link("/calculators/education/ap-lang-score-calculator", "AP® Lang score calculator")}, or see
          all the {link("/calculators/education", "education calculators")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>AP® World Score Distribution</h2>
        <p style={pStyle}>
          How does your score compare with other test-takers? In 2025, the mean AP® World score was 3.16, and 64.3% of students earned a 3
          or higher. The official 2025 AP® World History score distribution was:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® World score</th><th>Percentage of students</th><th>Recommendation</th></tr></thead>
            <tbody>
              {DISTRIBUTION_2025.map(([s, pct]) => (
                <tr key={s}><td style={{ ...center, fontWeight: 700 }}>{s}</td><td style={center}>{pct}</td><td style={center}>{capitalise(AP_SCALE.find((b) => String(b.score) === s).recommendation)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the AP® World Score</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          The AP® World score is one of the more complex AP® scores to work out, because four different weights scale the raw points:
        </p>
        <ul style={listStyle}>
          {SECTIONS.map(([part, scale, formula]) => <li key={part}><strong>{part}</strong>: max. {scale}, {formula}.</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}>Add up the scaled points to get the composite score (0-130), rounded to a whole number:</p>
        <p style={{ ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" }}>
          Composite score = MCQ × 52/55 + SAQ × 26/9 + DBQ × 32/7 + LEQ × 20/6
        </p>
        <p style={pStyle}>
          For example, 34 multiple-choice points, 8 short-answer points, 4 DBQ points and 3 LEQ points give 32.15 + 23.11 + 18.29 + 10 =
          83.54, a composite score of 84 and an AP® World score of 4. Finally, find the AP® score for your composite score; this is the
          approximate mapping the calculator uses:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® World score</th><th>Composite score</th><th>Recommendation</th></tr></thead>
            <tbody>
              {AP_SCALE.map((b) => (
                <tr key={b.score}><td style={{ ...center, fontWeight: 700 }}>{b.score}</td><td style={center}>{b.min}-{b.max}</td><td style={center}>{capitalise(b.recommendation)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the AP® World Units?</h2>
        <p style={pStyle}>The AP® World History: Modern course is organized around four eras and divided into nine units:</p>
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Years (approx.)</th><th style={{ textAlign: "left" }}>Units</th></tr></thead>
            <tbody>
              {UNITS.map(([years, units]) => (
                <tr key={years}><td style={{ ...center, fontWeight: 700, whiteSpace: "nowrap" }}>{years}</td><td>{units.map((u) => <div key={u}>{u}</div>)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The units cover major global developments from 1200 C.E. to the present, focusing on patterns, connections and historical
          thinking skills rather than memorizing isolated facts, which is why many students find AP® World History hard.
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
