import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a test grade?", a: "A test grade is the score a student earns on one test, shown as a percentage, a letter, or both. It tells you how much of the material the student got right on that assessment." },
  { q: "How do I calculate my test grade?", a: "Divide the points you earned by the total points possible and multiply by 100. For example, 45 out of 60 is 75%. The calculator does this instantly and also shows the letter grade." },
  { q: "How do I calculate a test grade from correct and wrong answers?", a: "Divide the number of correct answers by the total number of questions, then multiply by 100. If you only know the wrong answers, subtract them from the total first. This works when every question has the same value." },
  { q: "What percentage is an A, B, C, D, and F?", a: "On the common scale, A is 90–100%, B is 80–89%, C is 70–79%, D is 60–69%, and F is below 60%. Schools that use plus and minus grades split each letter into three parts. Your school may use different cutoffs, which is why a custom scale option is included." },
  { q: "Can I use my own grading scale?", a: "Yes. Set the minimum percentage for each letter, and the calculator applies your cutoffs to the result and the grading table." },
  { q: "What grade is 17 out of 20?", a: "17 out of 20 is 85%. That is a B on both the simple A–F scale and the plus/minus scale, where B covers 83–86%. A school with stricter cutoffs could assign a different letter." },
  { q: "Do unanswered questions count as wrong?", a: "Yes, in most classrooms. The grade is based on all questions on the test, so blank answers are treated the same as incorrect ones." },
  { q: "Does the calculator work for tests with different point values per question?", a: "Yes. Use the points method and enter the total points earned and the total points possible, including any partial credit." },
  { q: "How much will one test affect my class grade?", a: "It depends on how much the test is worth. A 60% on a test that counts for 10% of the course lowers a 99% average to about 95%, while the same score on a test worth 40% lowers it to about 83%. Check your syllabus for the weights." },
  { q: "What is a passing grade on a test?", a: "It depends on the school or course. Many use 60% as the minimum, while others require 65%, 70%, or higher. Check your syllabus for the exact policy." },
  { q: "Is the test grade calculator free, and do I need to sign up?", a: "It is free to use, and you do not need to register to get a result." },
];

// The supplied FAQ schema matches the list above except that it writes ranges
// with plain hyphens (90-100%, A-F, 83-86%).
const plainDashes = (s) => s.replace(/–/g, "-");

const SCALE_HEADERS = ["Letter grade", "Percentage range"];
const SCALE_ROWS = [
  ["A+", "97–100%"], ["A", "93–96%"], ["A−", "90–92%"],
  ["B+", "87–89%"], ["B", "83–86%"], ["B−", "80–82%"],
  ["C+", "77–79%"], ["C", "73–76%"], ["C−", "70–72%"],
  ["D+", "67–69%"], ["D", "63–66%"], ["D−", "60–62%"],
  ["F", "Below 60%"],
];

const TABLE_HEADERS = ["Correct answers", "Percentage", "Letter grade (A–F scale)"];
const TABLE_ROWS = [
  ["20", "100%", "A"], ["18", "90%", "A"], ["16", "80%", "B"],
  ["14", "70%", "C"], ["12", "60%", "D"], ["11", "55%", "F"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
};

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 280 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
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

export default function TestGradeCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: plainDashes(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a Test Grade? Purpose and Grading Table">
        <P>
          A test grade is the score a student receives for a single test, quiz, or exam. It is usually shown in two ways: a percentage, which
          tells you what share of the available points you earned, and a letter grade, which places that percentage on a scale such as A through
          F. A score of 42 out of 50 is 84%, and on most scales that is a B.
        </P>
        <P>
          The purpose of a test grade is simple. It gives students, teachers, and parents a clear, consistent way to see how well a student
          understood the material at a given point in time. A percentage is precise, and a letter grade is easy to read at a glance. Together
          they make it possible to compare results across different tests, even when the tests have different numbers of questions.
        </P>
        <P>Most U.S. schools and colleges use a grading table to turn percentages into letters. The version below includes plus and minus grades:</P>
        <DataTable headers={SCALE_HEADERS} rows={SCALE_ROWS} />
        <P>
          Many schools skip the plus and minus grades and use a simpler scale: A is 90–100%, B is 80–89%, C is 70–79%, D is 60–69%, and F is
          anything below 60%. In that system, F is not a passing grade.
        </P>
        <P>
          Neither version is universal. Cutoffs differ between schools, departments, and even individual teachers. Some set the passing line at
          65% or 70%, and some use 50%. Always check which scale applies to your class before you rely on a letter grade, and use the custom
          scale option described later if yours is different.
        </P>
      </Card>

      <Card title="How the Test Grade Calculator Works">
        <P>
          The calculator converts a raw score into a percentage and a letter grade. You choose how to enter the result. If you know the points
          earned and the total points available, enter those two numbers. If you only have the number of questions answered correctly or
          incorrectly, enter the answer counts instead, and the calculator works out the rest.
        </P>
        <P>
          Once the numbers are in, the tool divides the score by the total, multiplies by 100, and checks the result against a grading scale.
          That scale is either the standard A–F scale or one you set yourself. The output is the exact percentage, the matching letter grade,
          and a grading table showing what every possible score on that test is worth.
        </P>
        <P>
          Here is a quick example. A teacher builds a 30-question test, and a student gets 5 wrong. The student’s score is 25 out of 30, which is
          83.33%, a B. The table below the result then shows the grade for every other possible score, so the teacher can grade the next paper
          with a quick lookup or by entering a new number.
        </P>
        <P>
          Everything happens on the page. There is no spreadsheet to build and no formula to remember, which helps most when you are grading
          many papers in a row and need the same logic applied to each one.
        </P>
      </Card>

      <Card title="How to Calculate a Test Grade Percentage">
        <P>The basic formula is short:</P>
        <Formula>Percentage = (points earned ÷ total points possible) × 100</Formula>
        <P>When every question is worth one point, “points earned” is just the number of correct answers, so the formula becomes:</P>
        <Formula>Percentage = (correct answers ÷ total questions) × 100</Formula>
        <P>Because correct answers plus wrong answers equals the total, you can also work from the mistakes:</P>
        <Formula>Percentage = (total questions − wrong answers) ÷ total questions × 100</Formula>
        <P>
          All three versions give the same result. Use whichever matches the information you have. After you find the percentage, compare it
          with your grading scale to get the letter grade.
        </P>
        <H3>Calculating From Points</H3>
        <P>If a student earns 43 points on a test worth 50, the calculation is 43 ÷ 50 = 0.86, and 0.86 × 100 gives 86%. On the standard scale, that is a B.</P>
        <P>
          Points-based grading is the right choice when questions carry different weights. A test might have ten multiple-choice questions worth
          2 points each and three short-answer questions worth 10 points each, for 50 points in total. Counting correct answers would hide the
          fact that the short-answer questions matter far more. Entering points keeps the weighting intact.
        </P>
        <P>Partial credit works the same way. If a teacher gives 7 out of 10 on a written response, that 7 goes into the earned-points total like any other number.</P>
        <H3>Calculating From Correct and Wrong Answers</H3>
        <P>
          Many tests are simple counts. A 40-question quiz where every item is worth one point does not need a points total. You enter the number
          of questions on the test, plus either the correct answers or the wrong ones.
        </P>
        <P>
          The wrong-answers option saves time when you are grading. It is often quicker to count mistakes than to tally right answers. If a
          25-question test has 4 wrong answers, the calculator treats 21 as correct and returns 84%, with no hand subtraction.
        </P>
        <P>
          Count unanswered questions as wrong. A grade is based on every question on the test, not only the ones the student attempted. If a
          student leaves 3 blanks on a 20-question test and misses 2 others, that is 5 wrong answers and a score of 15 out of 20, or 75%.
        </P>
        <P>
          This method assumes every question is worth the same amount and that wrong answers carry no penalty. If your test uses negative
          marking, where an incorrect answer subtracts points, work out the final points first and use the points method. That keeps the penalty
          in the score.
        </P>
        <H3>A Note on Rounding</H3>
        <P>
          Percentages often come out as long decimals. A score of 26 out of 31 is 83.870967…%, which is usually shown as 83.87%. Whether you round
          to the nearest whole number matters when a score sits right at a cutoff. Some instructors round 89.5% up to 90%, and others do not.
          Follow your own grading policy.
        </P>
      </Card>

      <Card title="Using Your Own Custom Grading Scale">
        <P>
          The custom scale option lets you replace the standard cutoffs with your own. You set the minimum percentage for each letter, and the
          calculator applies those cutoffs to every result and to the grading table.
        </P>
        <P>
          This helps in several situations. Suppose a test was unusually hard and the teacher decides that 50% should be a passing grade instead
          of 60% or 65%. Lowering the lowest passing cutoff to 50% does exactly that. A teacher whose syllabus defines an A as 93% and above can
          enter that threshold. A school with a 7-point scale, where 93–100 is an A and 85–92 is a B, can reproduce it in seconds. A tutor
          preparing a student for a course with unusual cutoffs can see how a practice test would score under the real rules instead of a close
          guess.
        </P>
        <P>If you do not use plus and minus grades, simply ignore them and set only the main letter cutoffs.</P>
        <P>
          Changing the scale is not the same as curving. A new scale changes the cutoffs, and the student’s percentage stays the same. A curve
          changes the scores themselves, for example by adding points to every paper. If you want to keep scores as they are and only adjust what
          counts as an A or a pass, the custom scale is the right tool. Check your syllabus or grading policy first, since the cutoffs printed
          there are the ones that count.
        </P>
      </Card>

      <Card title="Understanding the Grading Table">
        <P>
          Along with a single result, the tool produces a full grading table that lists every possible score on your test with its percentage
          and letter grade. For a 20-question test with equal points, part of that table looks like this:
        </P>
        <DataTable headers={TABLE_HEADERS} rows={TABLE_ROWS} />
        <P>
          The table turns one calculation into a reusable answer sheet. A teacher can print it once and keep it next to the answer key, so each
          paper is graded by a quick lookup. Students can use it before a test to see how many questions they can miss and still reach a target
          grade. If you need at least a B on a 20-question quiz, the table shows right away that 16 correct answers is the cutoff.
        </P>
      </Card>

      <Card title="Benefits of Using a Test Grade Calculator">
        <P>A calculator may seem like a small convenience, but it solves real problems for both teachers and students.</P>
        <P>
          For teachers, the biggest benefit is consistency. Doing percentages by hand across thirty or more papers invites small errors, and one
          slip can change a student’s letter grade. Applying the same formula and scale to every paper keeps grading fair. It also saves time,
          especially when the grading table is printed and used as a lookup sheet. And when a student asks why they received a certain grade, the
          teacher can point to the exact percentage and scale.
        </P>
        <P>
          For students, a calculator removes guesswork. A returned paper marked “34/40” does not always make the grade obvious, and the tool turns
          it into 85% and a letter right away. The grading table also supports planning: you can see how many questions you can miss and still
          hit a target, which makes study goals more concrete.
        </P>
        <P>For parents and tutors, it provides a simple, shared reference for understanding results without needing to know the school’s grading policy by heart.</P>
      </Card>

      <Card title="When You Need a Test Grade Calculator">
        <P>The need for a quick, accurate conversion comes up more often than most people expect, and the situations differ in useful ways.</P>
        <Lead lead="Checking results after an exam.">You may know your points but not your grade. Entering them gives you an immediate answer.</Lead>
        <Lead lead="Grading in bulk.">When you are working through a whole class, a printed grading table keeps every paper on the same standard.</Lead>
        <Lead lead="Reviewing a child’s schoolwork.">A paper returned with only a fraction is easy to misread, and a percentage makes the performance clear.</Lead>
        <Lead lead="Homeschool and tutoring.">
          When there is no official gradebook, you still need a defensible way to convert scores into grades. A custom scale gives you one you
          control.
        </Lead>
        <Lead lead="Test preparation.">
          Practice tests are most useful when you know what each score means. Working backward from a target grade tells you how many questions
          you can afford to miss.
        </Lead>
      </Card>

      <Card title="Worked Examples">
        <P>Seeing the numbers makes the logic clear.</P>
        <Lead lead="Example 1: points.">A student scores 68 out of 80. The calculation is 68 ÷ 80 = 0.85, so the result is 85%, a B on the standard scale.</Lead>
        <Lead lead="Example 2: wrong answers.">
          A 30-question test has 6 wrong answers. That leaves 24 correct, and 24 ÷ 30 = 0.80, or 80%, a B. This score sits right on the standard
          B cutoff. On a custom scale that sets B at 82%, the same paper becomes a C, which shows why the scale matters.
        </Lead>
        <Lead lead="Example 3: partial credit.">
          A 100-point exam awards 91 points after partial credit is applied. The percentage is 91%, an A. The points method accepts any earned
          total, so no adjustment is needed.
        </Lead>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
