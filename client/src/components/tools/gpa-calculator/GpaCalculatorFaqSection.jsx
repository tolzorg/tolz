import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my GPA?",
    a: "Convert each letter grade into its grade point equivalent (A = 4.0, B = 3.0, C+ = 2.3 and so on), add them up and divide by the number of courses. If your courses have credits, multiply each grade point by the course's credits, add the results and divide by the total credits. For honors or AP courses, add the extra points (+0.5 or +1) to the grade point first.",
  },
  {
    q: "What is a good GPA?",
    a: "Generally, a GPA of 3.0 or above is considered good, and 3.5 to 4.0 is excellent. A GPA close to 4.0 is often seen as ideal for highly competitive programs or schools. Different schools and employers may have their own definitions of a \"good\" GPA.",
  },
  {
    q: "What does GPA stand for?",
    a: "GPA stands for Grade Point Average: a number representing your average performance across all your courses. Each grade is assigned a point value (an A might be 4 points), and your GPA is the average of these points, typically from 0 to 4.0.",
  },
  {
    q: "How do I calculate cumulative GPA?",
    a: "Multiply your prior GPA by your prior credits (or number of courses), multiply your new GPA by your new credits, add the two and divide by the total credits. For example, 3.65 from 15 credits and 3.83 from 18 credits give (3.65 × 15 + 3.83 × 18) / 33 = 3.75.",
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
const EXAMPLE = [["Maths", "A", "4.0", "Honors (+0.5)", "4.5", "2"], ["Biology", "C+", "2.3", "Regular", "2.3", "1"], ["History", "B", "3", "Regular", "3", "1"], ["English", "A-", "3.7", "AP (+1)", "4.7", "3"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
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

export default function GpaCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is GPA? GPA Meaning</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} GPA calculator works out your GPA as a high school or college student, with or without credits
          (including extra-graded courses), and your cumulative GPA.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          GPA stands for Grade Point Average. It measures your academic achievement and is used throughout your education: in middle
          school, high school and college. The basic formula divides the total grade points earned by the number of courses. If your
          courses have credits, or are graded differently (e.g., honors courses), you need a weighted average instead.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>GPA Scale: GPA Converter Chart</h2>
        <p style={pStyle}>The GPA scale table shows the grade point equivalent of each letter grade:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Grade</th><th>Percentage grade</th><th>Grade point (4.0 scale)</th><th>Grade point (+4.0 scale)</th></tr></thead>
            <tbody>{SCALE.map(([g, pct, a, b]) => <tr key={g}><td style={{ ...center, fontWeight: 700 }}>{g}</td><td style={center}>{pct}</td><td style={center}>{a}</td><td style={center}>{b}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is one of the standard 4.0 GPA scales, but schools use different systems, so check that this is your school&apos;s
          grading scale before using the calculator. The calculator uses the +4.0 scale, where A+ is worth 4.3 and E/F is 0.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate My GPA</h2>
        <p style={pStyle}>First convert your letter grades into grade points with the GPA scale. Take this example grade card:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Course</th><th>Grade</th><th>Grade point</th><th>Course type</th><th>Weighted grade point</th><th>Credits</th></tr></thead>
            <tbody>{EXAMPLE.map(([c, g, gp, t, w, cr]) => <tr key={c}><td style={{ fontWeight: 600 }}>{c}</td><td style={center}>{g}</td><td style={center}>{gp}</td><td style={center}>{t}</td><td style={center}>{w}</td><td style={center}>{cr}</td></tr>)}</tbody>
          </table>
        </div>
        <h3 style={h3Style}>High school: only regular classes (unweighted GPA)</h3>
        <p style={pStyle}>The unweighted GPA is the plain average of the grade points:</p>
        <p style={formula}>GPA = (4.0 + 2.3 + 3 + 3.7) / 4 = 13 / 4 = 3.25</p>
        <h3 style={h3Style}>High school: courses with extra points (weighted GPA)</h3>
        <p style={pStyle}>
          Some high school courses are graded with their difficulty in mind: AP (Advanced Placement), IB (International Baccalaureate) and
          college preparatory classes usually add 1 point to the grade, and honors courses 0.5 points (this varies between schools). Average
          the weighted grade points instead:
        </p>
        <p style={formula}>GPA = (4.5 + 2.3 + 3 + 4.7) / 4 = 14.5 / 4 = 3.625 ≈ 3.63</p>
        <h3 style={h3Style}>College GPA with credits</h3>
        <p style={pStyle}>
          College courses usually have credits. Multiply each grade point by its credits, add the products and divide by the total credits.
          GPA is usually rounded to 2 decimals:
        </p>
        <p style={formula}>GPA = (4.0 × 2 + 2.3 × 1 + 3 × 1 + 3.7 × 3) / 7 = 24.4 / 7 = 3.48571 ≈ 3.49</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your courses have no credits (or all are worth the same), the college GPA is the plain average, as for the unweighted high
          school GPA: 3.25 in this example.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cumulative GPA</h2>
        <p style={pStyle}>
          A cumulative GPA is your grade point average across several semesters or terms: a weighted average of the terms&apos; GPAs.
        </p>
        <h3 style={h3Style}>Cumulative GPA with course credits</h3>
        <p style={formula}>GPA<sub>cumulative</sub> = (GPA<sub>prior</sub> × credits<sub>prior</sub> + GPA<sub>new</sub> × credits<sub>new</sub>) / credits<sub>total</sub></p>
        <p style={pStyle}>
          For example, a GPA of 3.65 from 15 credits in the fall semester and 3.83 from 18 credits in the spring semester give 33 credits in
          total and a cumulative GPA of (3.65 × 15 + 3.83 × 18) / 33 = (54.75 + 68.94) / 33 = 3.748… ≈ 3.75.
        </p>
        <h3 style={h3Style}>Cumulative GPA without course credits</h3>
        <p style={pStyle}>
          If your classes have no credits (or are all worth the same), use the number of courses instead. A GPA of 3.65 from 5 courses and
          3.83 from 10 courses give (3.65 × 5 + 3.83 × 10) / 15 = 56.55 / 15 = 3.77. In high school this may be called your unweighted
          cumulative GPA.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a weighted cumulative GPA, do the same with the weighted grade points (e.g., 4.5 for an A in an honors course instead of 4.0).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Grade Point Average Calculator</h2>
        <ol style={listStyle}>
          <li>Choose the type of school you attend: high school (the default) or college.</li>
          <li>Select whether your courses have equal weights or different credits.</li>
          <li>For high school, choose whether you took only regular courses or also Honors / AP / IB / College courses.</li>
          <li>Choose each course&apos;s grade (and its credits or course type when asked); the next course appears as you fill in the last one.</li>
          <li>To find your cumulative GPA, tick the checkbox and enter your prior GPA and previous credits or number of courses.</li>
          <li>Click Calculate to see your GPA, the type of GPA it is and, if you asked for it, your cumulative GPA.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>Preparing for exams too? See the other {link("/calculators/education", "education calculators")}.</p>
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
