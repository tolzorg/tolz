import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my high school GPA?",
    a: "Convert each letter grade into its grade value (A = 4.0, B+ = 3.3 and so on). For an unweighted GPA, add the values and divide by the number of courses. If your courses have credits, multiply each value by its credits and divide by the total credits. For a weighted GPA, first add 0.5 for honors courses and 1 for AP, IB or college prep courses.",
  },
  {
    q: "What is the difference between weighted and unweighted GPA?",
    a: "An unweighted GPA grades every course on the same 0-4.0 scale, no matter how difficult it is. A weighted GPA takes course difficulty into account: honors courses usually add 0.5 points and AP, IB and college prep courses 1 point, so a weighted GPA can go above 4.0.",
  },
  {
    q: "What is a good GPA in high school?",
    a: "It depends on your ambitions and the colleges you apply to. The average high school GPA was 3.0 in a 2009 NCES study and 3.38 in a 2017 study. Very selective colleges expect more: admitted students at Ivy League schools average around 3.9 to 4.2.",
  },
  {
    q: "How do I calculate my cumulative high school GPA?",
    a: "Tick \"Calculate your cumulative GPA\" and enter your prior GPA and the sum of previous credits (or previous number of courses). For example, a GPA of 3.8 from 3 credits this term and a prior GPA of 3.60 from 23 credits give (3.8 × 3 + 3.6 × 23) / 26 = 3.62.",
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
const WEIGHTED = [
  ["A+", "4", "4.5", "5"], ["A", "4", "4.5", "5"], ["A-", "3.7", "4.2", "4.7"], ["B+", "3.3", "3.8", "4.3"], ["B", "3", "3.5", "4"],
  ["B-", "2.7", "3.2", "3.7"], ["C+", "2.3", "2.8", "3.3"], ["C", "2", "2.5", "3"], ["C-", "1.7", "2.2", "2.7"],
  ["D+", "1.3", "1.8", "2.3"], ["D", "1", "1.5", "2"], ["F", "0", "0", "0"],
];
const EXAMPLE = [["Maths", "0.5", "A", "Honors", "4.5"], ["Physics", "1", "B+", "Regular", "3.3"], ["Physics lab", "0.5", "C+", "Regular", "2.3"], ["English", "1", "A-", "AP", "4.7"]];
const IVY = [["Brown University", "4.05"], ["Columbia University", "4.13"], ["Dartmouth College", "4.01"], ["Harvard University", "4.10"], ["University of Pennsylvania", "4.04"], ["Princeton University", "3.90"], ["Yale University", "3.90"], ["Cornell University", "4.19"]];

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

export default function HighSchoolGpaCalculatorFaqSection() {
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
        <h2 style={h2Style}>High School GPA Scale</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} high school GPA calculator finds your unweighted, weighted and cumulative GPA, a useful measure of your
          performance and your chances of getting into the college of your dreams. Enter up to 20 courses, optionally with their types and
          credits, and your previous results if you wish. For college grades, use the
          {" "}{link("/calculators/education/college-gpa-calculator", "college GPA calculator")}, or the
          {" "}{link("/calculators/education/gpa-calculator", "GPA calculator")} for both.
        </p>
        <p style={pStyle}>
          GPA (Grade Point Average) is one of the measures of students&apos; academic performance. Most US high schools use a 4.0 GPA scale,
          a 4-point grading scale. A typical letter grade to GPA conversion:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Letter grade</th><th>Percentage</th><th>4.0 scale</th><th>+4.0 scale</th></tr></thead>
            <tbody>{SCALE.map(([g, pct, a, b]) => <tr key={g}><td style={{ ...center, fontWeight: 700 }}>{g}</td><td style={center}>{pct}</td><td style={center}>{a}</td><td style={center}>{b}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some schools reward an A+ with 4.3, so a score above the standard maximum of 4.0 is possible (the calculator uses this +4.0
          scale). The values are typical, but percentage intervals and GPA scales may differ slightly between schools, and some courses
          give extra points for their difficulty.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Weighted vs. Unweighted GPA</h2>
        <h3 style={h3Style}>Unweighted GPA</h3>
        <p style={pStyle}>
          An unweighted GPA grades all courses on the same scale, whatever their level: if one course is graded 0.0-4.0, so are the others.
          Without credits it is the plain average of the grade values. For grades A, B+, C+ and A-:
        </p>
        <p style={formula}>GPA = (4.0 + 3.3 + 2.3 + 3.7) / 4 = 13.3 / 4 = 3.325 ≈ 3.33</p>
        <p style={pStyle}>
          If your classes have credits, take the weighted average of the grades by their credits (still not what is usually called a
          weighted GPA). With the credits in the table below:
        </p>
        <p style={formula}>GPA = (4.0 × 0.5 + 3.3 × 1 + 2.3 × 0.5 + 3.7 × 1) / 3 = 10.15 / 3 = 3.3833… ≈ 3.38</p>
        <h3 style={h3Style}>Weighted GPA</h3>
        <p style={{ ...pStyle, marginBottom: 6 }}>A weighted GPA takes course difficulty into account by adding points to the grade:</p>
        <ul style={listStyle}>
          <li><strong>AP</strong> (Advanced Placement) courses usually add 1 point;</li>
          <li><strong>IB</strong> (International Baccalaureate) courses also add 1 point;</li>
          <li><strong>College prep</strong> classes can add 1 point; and</li>
          <li><strong>Honors</strong> courses most often add 0.5 points (some schools give 1 point, so check your school&apos;s rules).</li>
        </ul>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Letter grade</th><th>Regular GPA</th><th>Honors GPA</th><th>AP / IB / College prep GPA</th></tr></thead>
            <tbody>{WEIGHTED.map(([g, a, b, c]) => <tr key={g}><td style={{ ...center, fontWeight: 700 }}>{g}</td><td style={center}>{a}</td><td style={center}>{b}</td><td style={center}>{c}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={pStyle}>So a 4.0 unweighted GPA doesn&apos;t necessarily mean you are the best: maybe you chose the easiest courses. With course types:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>Course type</th><th>GPA scale</th></tr></thead>
            <tbody>{EXAMPLE.map(([c, cr, g, t, v]) => <tr key={c}><td style={{ fontWeight: 600 }}>{c}</td><td style={center}>{cr}</td><td style={center}>{g}</td><td style={center}>{t}</td><td style={center}>{v}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={formula}>Without credits: GPA = (4.5 + 3.3 + 2.3 + 4.7) / 4 = 14.8 / 4 = 3.7</p>
        <p style={{ ...formula, marginBottom: 0 }}>With credits: GPA = (4.5 × 0.5 + 3.3 × 1 + 2.3 × 0.5 + 4.7 × 1) / 3 = 11.4 / 3 = 3.8</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate High School GPA</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>High school GPA formulas are ratios:</p>
        <ul style={listStyle}>
          <li>Unweighted, no credits: GPA = Σ grade value / Σ courses;</li>
          <li>Unweighted, with credits: GPA = Σ (grade value × credits) / Σ credits;</li>
          <li>Weighted, no credits: GPA = Σ weighted grade value / Σ courses;</li>
          <li>Weighted, with credits: GPA = Σ (weighted grade value × credits) / Σ credits,</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}>where the weighted grade value is the grade value + 0 (regular), + 0.5 (honors) or + 1 (AP / IB / college prep). With the calculator:</p>
        <ol style={listStyle}>
          <li>Choose whether your courses have equal weights or different credits, and whether they include Honors / AP / IB / College courses.</li>
          <li>Pick the grade for each course (A for Maths in the example), its credits (0.5) and its course type (Honors).</li>
          <li>Repeat for all your courses; new boxes appear as you fill in the last one, and blank boxes are ignored.</li>
          <li>Click Calculate. For the example: &quot;You&apos;ve entered 4 courses. The sum of your credits is 3 credits. Your GPA is 3.8. This is your GPA weighted with credits and course difficulty.&quot;</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculate High School Cumulative GPA</h2>
        <p style={pStyle}>
          Tick <strong>Calculate your cumulative GPA</strong> and two boxes appear: your prior GPA and the sum of previous credits (or
          previous number of courses, with equal weights). The result is only valid if you enter the credits your prior GPA was calculated
          from.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Continuing the example, say your cumulative GPA from all previous semesters is 3.60 from 23 credits. Enter 3.60 as the prior GPA
          and 23 as the sum of previous credits: the cumulative GPA is (3.8 × 3 + 3.6 × 23) / 26 = 3.62, and the sum of your credits
          updates to 26 credits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Good GPA in High School?</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          There is no single answer: it depends on you, your ambitions, the college you want to apply to and more. Averages differ by
          gender, ethnicity, school and state, but according to a 2009 NCES (National Center for Education Statistics) study, the average
          high school GPA was:
        </p>
        <ul style={listStyle}>
          <li>3.0 overall (up from 2.68 in 1990);</li>
          <li>2.79 in core academic courses (math, science, English and social studies);</li>
          <li>3.14 in other academic courses (foreign languages and other non-core academic classes); and</li>
          <li>3.39 in other classes (PE, cooking).</li>
        </ul>
        <p style={pStyle}>
          Grades keep rising, and a 2017 study puts the overall average at 3.38. As a college candidate you should aim higher than average;
          for an Ivy League school, your scores should be almost perfect:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Ivy League school</th><th>Average GPA of admitted students</th></tr></thead>
            <tbody>{IVY.map(([school, gpa]) => <tr key={school}><td>{school}</td><td style={{ ...center, fontWeight: 700 }}>{gpa}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Don&apos;t panic if your GPA seems too low: keep trying, and remember that GPA is only one of many academic and non-academic
          factors in an application. More tools for students are in the {link("/calculators/education", "education calculators")}.
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
