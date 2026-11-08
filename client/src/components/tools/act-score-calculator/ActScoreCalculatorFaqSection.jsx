import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { ACT_SECTIONS, PERCENTILE_TABLE, scaledScore } from "../../../utils/actScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "What is the average ACT score?",
    a: "ACT reports that the average ACT score ranges from 17 to 24. This range covers the middle 50% of test takers and indicates a typical performance level.",
  },
  {
    q: "Is 37 a good ACT score?",
    a: "A score of 37 is impossible on the ACT, as the highest score you can achieve is 36. A composite score of 36 means every section was scaled to the maximum: excellence.",
  },
  {
    q: "How do I calculate my ACT math score?",
    a: "Count your correct answers in the math section (your raw score), then use the ACT conversion table for math to turn the raw score into a scaled score from 1 to 36. The result is your math section ACT score.",
  },
  {
    q: "I got a raw score of 45 in English. What's my ACT score?",
    a: "With a raw score of 45 in English, your ACT English score is 21. Raw scores are converted into ACT scores from 1 to 36 with the ACT's conversion tables.",
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
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

/** Raw-score ranges giving each scaled score, per section (e.g. "72-75"), from 36 down. */
function conversionRows() {
  const rows = [];
  for (let scaled = 36; scaled >= 1; scaled--) {
    rows.push([scaled, ...ACT_SECTIONS.map((s) => {
      const raws = Array.from({ length: s.max + 1 }, (_, r) => r).filter((r) => scaledScore(s, r) === scaled);
      if (!raws.length) return "–";
      const lo = raws[0];
      const hi = raws[raws.length - 1];
      return lo === hi ? String(lo) : `${lo}-${hi}`;
    })]);
  }
  return rows;
}
const CONVERSION = conversionRows();

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

export default function ActScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a Good ACT Score?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} ACT score calculator converts your raw scores into ACT section scores, your composite ACT score and its
          percentile. The ACT (American College Testing) is a standardized test used for college admissions in the United States. It shows
          how prepared a student is for college and gives colleges a way to compare applicants.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The composite ACT score and each section score (English, Mathematics, Reading, Science) range from 1 (lowest) to 36 (highest). A
          good ACT score can boost a college application, making it easier to get into top schools and qualify for scholarships. Usually,
          a score above 24 is considered good, and 30 or higher is excellent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is the ACT Scored?</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>Each section of the ACT is scored from 1 to 36. The four sections and their maximum raw scores are:</p>
        <ul style={listStyle}>
          <li><strong>English</strong>: 75 questions;</li>
          <li><strong>Math</strong>: 60 questions;</li>
          <li><strong>Reading</strong>: 40 questions; and</li>
          <li><strong>Science</strong>: 40 questions.</li>
        </ul>
        <p style={pStyle}>
          Your raw score is the number of questions you got right in each section. Raw scores are converted to scaled scores between 1 and
          36 with the conversion chart below. The composite ACT score, your total ACT score, is the average of the four scaled scores,
          rounded to the nearest whole number. For example, section scores of 36, 30, 22 and 22 average 27.5, a composite score of 28.
        </p>
        <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Scaled score</th>{ACT_SECTIONS.map((s) => <th key={s.key}>{s.name} raw score</th>)}</tr></thead>
            <tbody>
              {CONVERSION.map(([scaled, ...ranges]) => (
                <tr key={scaled}><td style={{ ...center, fontWeight: 700 }}>{scaled}</td>{ranges.map((r, i) => <td key={ACT_SECTIONS[i].key} style={center}>{r}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the ACT Score Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>Choose your raw score (number of correct answers) for each section of the test:</p>
        <ul style={listStyle}>
          <li>English;</li>
          <li>Mathematics;</li>
          <li>Reading; and</li>
          <li>Science.</li>
        </ul>
        <p style={pStyle}>
          Click Calculate to see your ACT score for each section, your composite ACT score and the percentile you fall into among ACT test
          takers, which shows how your score compares with others and where you stand. The percentile for each composite score:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ ...tableStyle, maxWidth: 520 }}>
            <thead><tr><th>Composite score</th><th>Percentile</th><th>Composite score</th><th>Percentile</th></tr></thead>
            <tbody>
              {PERCENTILE_TABLE.slice(0, 18).map(([score, pct], i) => {
                const [score2, pct2] = PERCENTILE_TABLE[i + 18];
                return (
                  <tr key={score}>
                    <td style={{ ...center, fontWeight: 700 }}>{score}</td><td style={center}>{pct}</td>
                    <td style={{ ...center, fontWeight: 700 }}>{score2}</td><td style={center}>{pct2}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is the ACT Harder Than the SAT?</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>Neither test is necessarily harder; it depends on what you are good at:</p>
        <ul style={listStyle}>
          <li><strong>ACT</strong>: faster-paced, with more questions and a Science section.</li>
          <li><strong>SAT</strong>: slower-paced, more focused on problem-solving and critical thinking.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both tests include Math, Reading and English sections. The ACT might feel harder if you struggle with time, while the SAT might be
          more challenging if you prefer more straightforward questions. Preparing for other exams too? See the
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
