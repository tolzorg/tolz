import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { AP_EXAMS, apScale } from "../../../utils/apScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is the AP® Biology score?",
    a: "The AP® Bio score is the final score you receive on the AP® Biology exam, reported on a 1-5 scale. It is based on two sections that each count for 50%: 60 multiple-choice questions and 6 free-response questions (2 long and 4 short).",
  },
  {
    q: "How long is the AP® Bio exam?",
    a: "3 hours in total: 90 minutes for the multiple-choice section (60 questions) and 90 minutes for the free-response section (2 long and 4 short questions), with a short break between the two sections.",
  },
  {
    q: "How hard is AP® Biology?",
    a: "It is considered moderately to very challenging, depending on your background. It combines memorization with understanding, scientific reasoning and data analysis in the free-response questions, and the multiple-choice section is fast-paced. Consistent studying matters more than cramming.",
  },
  {
    q: "Is 4 a good AP® Bio score?",
    a: "Yes, a 4 is considered strong. The College Board's recommendation for a 4 is \"very well qualified\", and only about 40% of students earn a 4 or 5 on the AP® Bio exam. However, top-tier colleges may still prefer a 5 for credit in some cases.",
  },
  {
    q: "When do AP® Bio scores come out?",
    a: "AP® Bio scores are released in early July, a few weeks after the exam in May. Scores aren't released to everyone at once, and results may come later for students who took a late exam.",
  },
  {
    q: "How do I calculate my AP® Bio score?",
    a: "Estimate the points you earned for the multiple-choice and free-response questions, enter them into the AP® Bio score calculator, and read your predicted composite score (0-120) and AP® score (1-5).",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const AP_SCALE = apScale(AP_EXAMS.bio);
const DISTRIBUTION_2025 = [["5", "18.9%"], ["4", "24.1%"], ["3", "27.4%"], ["2", "21.0%"], ["1", "8.6%"]];

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

export default function ApBioScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is the AP® Biology Score?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} AP® Bio score calculator estimates your AP® Biology exam score from the points you expect to earn in each
          section. Keep in mind that your official score may differ, as the College Board adjusts it each year to account for exam
          difficulty.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          The AP® Bio score is the final score you receive on the AP® Biology exam. It is based on two sections, each contributing 50% of
          the total:
        </p>
        <ul style={listStyle}>
          <li><strong>Multiple-choice section</strong>: 60 questions.</li>
          <li><strong>Free-response section</strong>: 6 questions (2 long-response and 4 short-response).</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>The College Board combines the results into the final AP® score, reported on a 1-5 scale.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Your AP® Bio Score</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>To estimate your final AP® score by hand:</p>
        <ol style={listStyle}>
          <li>Write down the points you earned in the multiple-choice (MCQ) and free-response (FRQ) sections.</li>
          <li>
            Calculate your composite score. Each section counts for 50%, scaled to a maximum of 120 points:
            <strong> composite = MCQ + FRQ × 60/36</strong>, rounded to a whole number.
          </li>
          <li>Find your composite score in the conversion chart below to get your score on the 1-5 scale.</li>
        </ol>
        <p style={pStyle}>
          For example, 23 multiple-choice points and 22 free-response points give 23 + 22 × 60/36 = 59.67, a composite score of 60 and an
          AP® score of 3.
        </p>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" }}>
          AP® Biology score conversion chart
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Bio score</th><th>Composite score</th><th>Qualification</th></tr></thead>
            <tbody>
              {AP_SCALE.map((b) => (
                <tr key={b.score}><td style={{ ...center, fontWeight: 700 }}>{b.score}</td><td style={center}>{b.min}-{b.max}</td><td style={center}>{capitalise(b.recommendation)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          ⚠️ The chart is an estimate: each year, the College Board adjusts the AP® Bio score boundaries to the difficulty of the exam.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>AP® Biology Score Distribution</h2>
        <p style={pStyle}>
          The score distribution shows how your result compares with other students. In 2025, the average AP® Bio score was 3.2; in
          previous years the mean typically hovered around 2.9, making 2025 a relatively strong year. The College Board has published the
          AP® Biology score distribution every year since 2002. The 2025 distribution was:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>AP® Bio score</th><th>Percentage of students</th></tr></thead>
            <tbody>{DISTRIBUTION_2025.map(([s, pct]) => <tr key={s}><td style={{ ...center, fontWeight: 700 }}>{s}</td><td style={center}>{pct}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the AP® Bio Score Calculator</h2>
        <ol style={listStyle}>
          <li>Estimate how many points you earned in each section of the AP® Biology exam and enter them in the matching boxes.</li>
          <li>Click Calculate to see your composite score (0-120) and projected AP® score on the 1-5 scale.</li>
          <li>Read the College Board recommendation for your AP® score.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Preparing for an English language test too? See the other {link("/calculators/education", "education calculators")}.
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
