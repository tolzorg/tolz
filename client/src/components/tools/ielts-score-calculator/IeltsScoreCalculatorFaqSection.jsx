import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { LISTENING_TABLE, READING_TABLES } from "../../../utils/ieltsScoreCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my IELTS score?",
    a: "Take the band scores you received for listening, reading, speaking and writing, add them together and divide by four. Round the result to the nearest half band, rounding up from .25 and .75 (for example, 6.25 becomes 6.5 and 6.75 becomes 7). That is your overall IELTS score.",
  },
  {
    q: "What is the IELTS listening score with 32 correct answers?",
    a: "A band score of 7.5, which covers 32 to 34 correct answers. You would need three more correct answers to reach 8. The listening test is the same for the Academic and General Training versions of IELTS: you answer 40 questions after listening to four recordings, each played once.",
  },
  {
    q: "What is the IELTS reading score with 34 correct answers?",
    a: "Your reading score is 7 in the General Training test, or 7.5 in the Academic test. The Academic test uses more specialised vocabulary and more complex sentences, so fewer correct answers are needed for the same band.",
  },
  {
    q: "What is the difference between TOEFL and IELTS?",
    a: "The main difference is the speaking part: in IELTS you have a face-to-face interview with an examiner, while in TOEFL you record your answers with a microphone. IELTS is scored from 0 to 9 and TOEFL from 0 to 120, and IELTS goes up to the C2 proficiency level while TOEFL goes up to C1.",
  },
  {
    q: "How long is an IELTS score valid?",
    a: "In most cases two years, counted from the date on your IELTS Test Report Form. In Australia, results are valid for three years for skilled migration applications. Each organisation chooses its own validity period, so check its requirements first.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const LEVELS = [
  [9, "Expert user", "The test taker has a fully operational command of the language. Their use of English is appropriate, accurate and fluent and shows complete understanding."],
  [8, "Very good user", "The test taker has a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. They may misunderstand some things in unfamiliar situations. They handle complex and detailed argumentation well."],
  [7, "Good user", "The test taker has operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. They generally handle complex language well and understand detailed reasoning."],
  [6, "Competent user", "The test taker has an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. They can use and understand fairly complex language, particularly in familiar situations."],
  [5, "Modest user", "The test taker has partial command of the language and copes with overall meaning in most situations, although they are likely to make many mistakes. They should be able to handle basic communication in their own field."],
  [4, "Limited user", "The test taker's basic competence is limited to familiar situations. They frequently show problems in understanding and expression. They are not able to use complex language."],
  [3, "Extremely limited user", "The test taker conveys and understands only general meaning in very familiar situations. There are frequent breakdowns in communication."],
  [2, "Intermittent user", "The test taker has great difficulty understanding spoken and written English."],
  [1, "Non-user", "The test taker has no ability to use the language except for a few isolated words."],
  [0, "Did not attempt the test", "The test taker did not answer the questions."],
];
const TOEFL = [["118", "9"], ["115", "8.5"], ["110", "8"], ["102", "7.5"], ["94", "7"], ["79", "6.5"], ["60", "6"], ["46", "5.5"], ["35", "5"], ["32", "4.5"], ["0-31", "0-4"]];
const DIFFERENCES = [["Test format", "Paper-based or computer-based", "Computer-based"], ["Score range", "0-9", "0-120"], ["Proficiency level", "Up to C2", "Up to C1"], ["Speaking test", "Face-to-face with an examiner", "Recorded with a microphone"]];

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

function BandTable({ rows, heading }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 12 }}>
      <table className="data-table data-table-head" style={tableStyle}>
        <thead><tr><th>No. correct answers</th><th>{heading}</th></tr></thead>
        <tbody>{rows.map(([range, band]) => <tr key={range}><td style={center}>{range}</td><td style={{ ...center, fontWeight: 700 }}>{band}</td></tr>)}</tbody>
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

export default function IeltsScoreCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is the IELTS Exam?</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} IELTS score calculator estimates your score in the International English Language Testing System (IELTS), an
          English language proficiency test for non-native English speakers. The exam verifies your English skills when you apply for a job or
          a university place, or move to another country, and it is accepted by thousands of organisations around the world as a reliable
          English certificate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          IELTS is jointly owned by the British Council, IDP Education and Cambridge English. The test has four components: listening,
          reading, writing and speaking. Each one gives you an individual band score, and the rounded average of the four is your overall
          score.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is IELTS Scored?</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>The test has four sections:</p>
        <ul style={listStyle}>
          <li><strong>Listening</strong>: listen to audio recordings and answer questions about them;</li>
          <li><strong>Reading</strong>: read texts and answer questions about them;</li>
          <li><strong>Writing</strong>: write two pieces of writing; and</li>
          <li><strong>Speaking</strong>: have a conversation with an examiner.</li>
        </ul>
        <p style={pStyle}>
          Each section gives a whole or half band score, from 0 (test not taken) to 9 (expert). Listening and reading scores come from the
          number of correct answers out of 40; speaking and writing are assessed by examiners against set criteria, so they have no points.
        </p>
        <h3 style={h3Style}>How to use the IELTS score calculator</h3>
        <ol style={listStyle}>
          <li>Check your band score for each component of the test.</li>
          <li>Enter them in the Listening, Reading, Speaking and Writing boxes and click Calculate.</li>
          <li>The calculator averages the four scores; tick <strong>Show average result</strong> to see the average.</li>
          <li>The average is rounded to the nearest 0.5 to give your IELTS score.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With the average box shown you can also work backwards: enter a target average and three of your scores, leave the fourth box
          empty, and the calculator shows the score you need in it. The two smaller calculators convert your number of correct answers in the
          listening and reading tests into band scores. To practise reading and writing in English, the {link("/tools/word-counter", "word counter")} can
          help you track the length of your essays.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IELTS Listening Score</h2>
        <p style={pStyle}>
          In the listening test, count your correct answers and find the matching band score in the table below (fewer than 11 correct
          answers scores 0 in the calculator).
        </p>
        <BandTable rows={LISTENING_TABLE} heading="Listening score" />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IELTS Reading Score</h2>
        <p style={pStyle}>
          You can take the Academic or the General Training reading test, which use different kinds of texts. The Academic test may include
          more difficult vocabulary and be harder to understand, so the same number of correct answers gives a higher band. The calculator
          supports both.
        </p>
        <h3 style={h3Style}>Academic reading test</h3>
        <BandTable rows={READING_TABLES.academic} heading="Reading score (Academic)" />
        <h3 style={h3Style}>General Training reading test</h3>
        <BandTable rows={READING_TABLES.general} heading="Reading score (General)" />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IELTS Score Range: What Is a Good IELTS Score?</h2>
        <p style={pStyle}>The table below describes the level of English for each band score. Source: the official IELTS website.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Band score</th><th>Skill level</th><th style={{ textAlign: "left" }}>Description</th></tr></thead>
            <tbody>
              {LEVELS.map(([band, level, text]) => (
                <tr key={band}><td style={{ ...center, fontWeight: 700 }}>{band}</td><td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>{level}</td><td>{text}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>IELTS to TOEFL Conversion</h2>
        <p style={pStyle}>
          TOEFL (Test of English as a Foreign Language) is an alternative to IELTS. Institutions accept the two tests differently, so check
          which one meets your requirements. The official TOEFL website suggests the following comparison:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>TOEFL score</th><th>IELTS band</th></tr></thead>
            <tbody>{TOEFL.map(([toefl, ielts]) => <tr key={toefl}><td style={center}>{toefl}</td><td style={{ ...center, fontWeight: 700 }}>{ielts}</td></tr>)}</tbody>
          </table>
        </div>
        <h3 style={h3Style}>IELTS vs. TOEFL</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>&nbsp;</th><th>IELTS</th><th>TOEFL</th></tr></thead>
            <tbody>{DIFFERENCES.map(([what, ielts, toefl]) => <tr key={what}><td style={{ fontWeight: 600 }}>{what}</td><td style={center}>{ielts}</td><td style={center}>{toefl}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, margin: "12px 0 0" }}>
          The Pearson Test of English (PTE) is another alternative; if you already have a PTE result, the
          {" "}{link("/calculators/education/pte-score-calculator", "PTE score calculator")} shows its IELTS equivalent.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Accepts IELTS?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          IELTS is accepted as proof of English proficiency by more than 11,000 organisations worldwide, including universities, colleges,
          training programmes, employers, government bodies and professional registration bodies; the official IELTS website has the full
          list. It is accepted as proof of English for study, work and migration in Australia, Canada, New Zealand and the UK.
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
