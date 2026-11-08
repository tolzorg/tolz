import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { equivalenceTable } from "../../../utils/pteScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is a good PTE score?",
    a: "A good PTE score is usually 65 or above. It indicates strong English skills, is often enough for university admission and some visa applications, and shows you can handle most English-speaking environments well.",
  },
  {
    q: "Is a 65 PTE score enough for Australian PR?",
    a: "For Australian Permanent Residency (PR) you typically need a PTE score of 65, so yes, it is usually enough to apply. It shows you have the good English that matters if you want to live and work in Australia.",
  },
  {
    q: "What PTE score is required for Canada?",
    a: "It depends on the program or purpose. Most immigration programs need the equivalent of CLB 7, which is around 70 in each PTE section; higher programs or jobs may need CLB 9, closer to 85 in each section. Requirements differ between programs, so check the details for your situation.",
  },
  {
    q: "How can I take the PTE exam?",
    a: "Visit the Pearson PTE website to find a test center near you, choose a convenient test date and time, then register and book your exam slot. The Pearson PTE website has more details on booking the PTE Academic exam.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SEGMENTS = [
  ["Listening", "up to 90 points for understanding spoken English."],
  ["Reading", "up to 90 points for interpreting written English."],
  ["Speaking", "up to 90 points for English speaking proficiency."],
  ["Writing", "up to 90 points for written English communication skills."],
];
const TABLE = equivalenceTable();

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const cardStyle = { padding: "20px 20px" };
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

export default function PteScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a PTE Score?</h2>
        <p style={pStyle}>
          If you are planning your future and need to understand your English proficiency, the {link("/", "Tolz")} PTE score calculator
          shows where your score stands, whether you are considering studying abroad, a new job or immigration.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          PTE stands for Pearson Test of English, a widely used measure of English language proficiency run by the Pearson PLC Group. It
          assesses the English skills of non-native speakers who want to study or work in English-speaking environments, giving a detailed
          picture of their listening, reading, speaking and writing abilities. That is why universities, employers and immigration
          authorities often ask for it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is the PTE Score Calculated?</h2>
        <p style={pStyle}>
          There is no simple formula. Pearson calculates the overall score from your performance across the whole test: 52 to 64 questions
          and tasks covering 20 types of activity, which test listening, reading, speaking and writing in various combinations. The skill
          scores are:
        </p>
        <ul style={listStyle}>
          {SEGMENTS.map(([skill, text]) => <li key={skill}><strong>{skill}</strong>: {text}</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your overall PTE score ranges from 10 to 90 points. It is not simply the average of the four skill scores, as it reflects your
          performance across all tasks, and it is the score this calculator uses.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the PTE Score Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          The only way to get a PTE score is to take the test. Enter the overall score from your results and click Calculate to see four
          results:
        </p>
        <ul style={listStyle}>
          <li><strong>University</strong>: whether your score meets the usual requirements for postgraduate, undergraduate and foundation courses.</li>
          <li><strong>CEFR level</strong>: your level on the Common European Framework of Reference for Languages, from A1 (beginner) to C2 (mastery).</li>
          <li>
            <strong>IELTS equivalent</strong>: the matching International English Language Testing System band. If you have IELTS results, the
            {" "}{link("/calculators/education/ielts-score-calculator", "IELTS score calculator")} works out your overall band.
          </li>
          <li><strong>TOEFL equivalent</strong>: the matching Test of English as a Foreign Language score and level.</li>
        </ul>
        <p style={pStyle}>The table shows how each overall PTE score compares with CEFR, IELTS and TOEFL:</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" }}>
            <thead><tr><th>PTE</th><th>CEFR</th><th>IELTS</th><th>TOEFL</th></tr></thead>
            <tbody>
              {TABLE.map((r) => (
                <tr key={r.pte}>
                  <td style={{ ...center, fontWeight: 700 }}>{r.pte}</td><td style={center}>{r.cefr}</td>
                  <td style={center}>{r.ielts}</td><td style={center}>{r.toefl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PTE Score for Immigration</h2>
        <p style={pStyle}>For people planning to immigrate, the PTE score is a key part of the journey, especially for Canada and Australia.</p>
        <p style={pStyle}>
          In Canada, PTE is accepted for many immigration programs, and scores are matched to Canadian Language Benchmark (CLB) levels. For
          example, CLB 9, which many applicants aim for, requires PTE scores of 78-87 in reading, 88-89 in writing, 82-88 in listening and
          84-88 in speaking.
        </p>
        <p style={pStyle}>
          Australia uses PTE Academic for immigration, and each visa category has its own score requirements. For example, the
          &quot;Proficient English&quot; level, which many applicants aim for, requires at least 65 points in all four skills. For Australian
          immigration, a PTE score can be valid for up to three years, depending on the visa category.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Check the requirements for your program and aim for the highest score you can: every point can make a difference, so prepare
          thoroughly for the test.
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
