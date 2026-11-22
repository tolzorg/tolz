import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my high school GPA?", a: "Convert each letter grade into grade points (A = 4.0, B = 3.0 and so on), multiply by the course credit if your school uses credits, add the results and divide by the total credits. The calculator on this page does all of that automatically." },
  { q: "What is the difference between weighted and unweighted GPA?", a: "An unweighted GPA scores every class on the same 4.0 scale. A weighted GPA adds extra points for Honors, AP, IB and college courses, so it can go above 4.0. Many colleges look at both." },
  { q: "Is a 4.0 weighted GPA the same as a 4.0 unweighted GPA?", a: "No. A 4.0 unweighted GPA means straight A’s in every course. A 4.0 weighted GPA can come from a mix of A’s and B’s in advanced classes, so it is not directly comparable." },
  { q: "How much extra do AP and Honors classes add to my GPA?", a: "Most schools add 0.5 for Honors and 1.0 for AP, IB and college-level courses, but policies vary. Check your school’s grading policy to confirm the exact values." },
  { q: "Can a GPA be higher than 4.0?", a: "Yes. Weighted GPAs can reach 5.0 or more, and some schools score an A+ as 4.3 even on the unweighted scale." },
  { q: "Do colleges use weighted or unweighted GPA?", a: "It depends on the college. Some use your school’s weighted GPA, some recalculate an unweighted GPA, and some focus only on core academic subjects. Providing both is a good habit." },
  { q: "Do colleges recalculate my GPA?", a: "Many do. They may count only core academic courses, apply their own weighting, or look at specific grade levels. Highly selective schools usually read your grades in context instead of using one formula." },
  { q: "What GPA do I need to get into college?", a: "Requirements vary widely. Many four-year colleges look for 3.0 or higher, while selective universities typically see applicants at 3.8 or above, along with strong course rigor and test scores where required." },
  { q: "Is GPA more important than SAT or ACT scores?", a: "For most colleges, grades and course rigor count for more because they reflect years of work. Test scores can support your GPA, and their role depends on each school’s testing policy." },
  { q: "Does my high school GPA show up on my college transcript?", a: "No. A college transcript shows college courses and college grades only. Your high school GPA stays on your high school transcript." },
  { q: "How do I calculate my cumulative GPA?", a: "Combine all your terms by weighting each by its credits, not by averaging semester GPAs. Enter every course in the calculator, or add a new term to your existing GPA and credits." },
  { q: "Do I need credits to calculate my GPA?", a: "Only if your courses carry different credit values. If every class counts equally, you can leave credits out and the result will be a simple average of grade points." },
  { q: "Does a plus or minus change my GPA?", a: "On most scales, yes. A B+ is typically 3.3, a B is 3.0 and a B- is 2.7. Some schools ignore pluses and minuses, so follow your school’s scale." },
  { q: "Does retaking a class replace the old grade?", a: "That depends on your school. Some replace the old grade, some average both grades, and your transcript may still show both attempts." },
  { q: "Can I raise my GPA without retaking classes?", a: "Yes. Turn in missing work, ask about extra credit or makeup assignments, get help early, and focus on classes with the most credits. Strong grades in later terms raise your cumulative GPA over time." },
  { q: "Can I graduate high school with a 1.9 GPA?", a: "It depends on your state and district. Many require specific credits and passing grades, and some also set a minimum GPA, often around 2.0. Your counselor can confirm the rule." },
  { q: "Should I put my high school GPA on my resume?", a: "Only if it is strong, with 3.5 or higher a common guideline. Once you have college grades, use your college GPA instead." },
  { q: "Do employers check high school GPA?", a: "Most do not once you have work experience. Some ask for transcripts for internships or entry-level jobs." },
  { q: "Where can I find my high school GPA?", a: "Check your official transcript, report card or your school’s student portal. If your school does not report one, you can calculate it with this tool using your school’s scale." },
  { q: "Is this high school GPA calculator free, and do I need to sign up?", a: "Yes, it is free to use, and no account or signup is required." },
  { q: "Can I calculate my GPA from freshman year only or one semester?", a: "Yes. Enter only the courses from the term you want, and the calculator will give you a GPA for that period. Add more terms to see your cumulative result." },
];

// The supplied FAQ schema lists only these six questions; their wording is the
// displayed text with straight apostrophes.
const FAQ_SCHEMA_QUESTIONS = [
  "How do I calculate my high school GPA?",
  "What is the difference between weighted and unweighted GPA?",
  "How much extra do AP and Honors classes add to my GPA?",
  "How do I calculate my cumulative GPA?",
  "Do I need credits to calculate my GPA?",
  "Is this high school GPA calculator free, and do I need to sign up?",
];
const straight = (s) => s.replace(/’/g, "'");

const SCALE_HEADERS = ["Letter grade", "Typical percentage", "Unweighted", "Honors", "AP / IB / College"];
const SCALE_ROWS = [
  ["A+", "97-100", "4.0", "4.5", "5.0"],
  ["A", "93-96", "4.0", "4.5", "5.0"],
  ["A-", "90-92", "3.7", "4.2", "4.7"],
  ["B+", "87-89", "3.3", "3.8", "4.3"],
  ["B", "83-86", "3.0", "3.5", "4.0"],
  ["B-", "80-82", "2.7", "3.2", "3.7"],
  ["C+", "77-79", "2.3", "2.8", "3.3"],
  ["C", "73-76", "2.0", "2.5", "3.0"],
  ["C-", "70-72", "1.7", "2.2", "2.7"],
  ["D+", "67-69", "1.3", "1.8", "2.3"],
  ["D", "65-66", "1.0", "1.5", "2.0"],
  ["F", "Below 65", "0.0", "0.0", "0.0"],
];
const SAMPLE_HEADERS = ["Course", "Level", "Credits", "Grade", "Unweighted points", "Weighted points"];
const SAMPLE_ROWS = [
  ["Algebra II", "Honors", "1", "A", "4.0", "4.5"],
  ["English Language", "AP", "1", "B+", "3.3", "4.3"],
  ["Chemistry", "Regular", "1", "B", "3.0", "3.0"],
  ["Spanish II", "Regular", "1", "A-", "3.7", "3.7"],
  ["Physical Education", "Regular", "0.5", "A", "4.0", "4.0"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
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
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows, minWidth = 420 }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth }}>
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

export default function HighSchoolGpaCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q)).map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a High School GPA, and Why Does It Matter?">
        <P>
          GPA stands for grade point average. It turns the letter grades on your report card into numbers and averages them, so your whole
          academic record fits into a single figure. Most U.S. high schools use a 4.0 scale, where an A is worth 4.0 points and an F is worth
          zero.
        </P>
        <P>
          Colleges care about it because it shows how you performed over several years, not on one test day. In surveys of admissions offices,
          grades in college-prep courses have ranked among the most important admissions factors year after year. A strong GPA also opens doors
          outside of admissions. Merit scholarships, state aid programs, honors college invitations, athletic eligibility and even good-student
          car insurance discounts often set a minimum GPA, so a higher number means more options and, in many cases, more money.
        </P>
        <P>
          A GPA is not a perfect measure of ability. Grading standards differ from school to school, and average GPAs have crept upward over the
          past decade, which is one reason colleges also look at course difficulty and, at some schools, test scores. Even so, it remains the
          clearest long-term record of how consistently you do the work, which is why it is worth calculating correctly.
        </P>
      </Card>

      <Card title="High School GPA Scale">
        <P>
          Most schools use a scale like the one below to turn percentages and letter grades into grade points. The unweighted column applies to
          every class. The Honors and AP/IB/College columns show what the same letter grade is worth when a school adds the common weighting of
          0.5 and 1.0 points.
        </P>
        <DataTable headers={SCALE_HEADERS} rows={SCALE_ROWS} />
        <P>
          These values are typical, not universal. Some schools score an A+ as 4.3 on the unweighted scale, which means a GPA above 4.0 is
          possible even without weighting. Others skip pluses and minuses and use a straight 4-3-2-1 scale. Percentage cutoffs vary too, and
          plenty of schools simply use 90, 80, 70 and 60 as the lines between letters. A few districts do not add weighting to a D or an F. Your
          school’s grading policy, usually in the student handbook or on the back of your transcript, always overrules a general chart.
        </P>
      </Card>

      <Card title="Unweighted vs Weighted GPA: What Is the Difference?">
        <P>
          An unweighted GPA treats every class equally. An A in regular English and an A in AP English Literature are both worth 4.0 points. The
          result always falls between 0.0 and 4.0, which makes it a clean measure of how consistently you earned top grades.
        </P>
        <P>
          A weighted GPA gives extra points for harder courses. The idea is simple: a B in a demanding AP class can reflect more effort and skill
          than an A in a standard class, so the weighted system rewards students who challenge themselves. Weighted GPAs commonly run up to 5.0,
          though some schools cap them at 4.5 or use another maximum.
        </P>
        <P>
          Neither number is better. They answer different questions. Unweighted GPA shows performance. Weighted GPA shows performance in
          context. A 4.0 unweighted GPA does not necessarily mean you took the hardest schedule, and a 4.5 weighted GPA does not necessarily mean
          you earned all A’s.
        </P>
        <P>
          Which one better reflects how you will do in college? Neither predicts it perfectly. College GPAs run on an unweighted 4.0 scale, so
          many admissions offices find the unweighted number easier to compare across applicants, and then judge course difficulty separately.
          Many colleges also recalculate GPAs using their own methods, so it helps to know both of your numbers before you apply.
        </P>
      </Card>

      <Card title="Honors, AP, IB and College Courses: How Weighting Changes Your GPA">
        <P>
          Most schools add a fixed bonus to the grade points for advanced courses. The most common pattern is +0.5 for Honors and +1.0 for AP, IB
          and college-level courses such as dual enrollment. Under that system, an A in AP Biology is worth 5.0 points, an A in Honors Geometry is
          worth 4.5, and an A in a regular class is worth 4.0.
        </P>
        <P>
          Here is why this matters in practice. Say you earn an A in one AP course and a B in another. Weighted, those grades are 5.0 and 4.0.
          Unweighted, they are 4.0 and 3.0. The weighted average is 4.5 and the unweighted average is 3.5. The same transcript produces a
          one-point gap, and that is the difference you will see when you switch between weighted and unweighted results in the calculator.
        </P>
        <P>
          Schools do not all follow the same formula. Some give a full point to Honors, some weight only AP and IB, and others weight by course
          level instead of a flat bonus. IB Standard Level and Higher Level courses are sometimes treated differently, and dual enrollment courses
          may be weighted or unweighted depending on the district. The bonus is also the same for every advanced class, so a notoriously tough
          course like AP Calculus BC or AP Physics earns no more than an easier AP elective. If your school publishes its weighting policy, check
          it first and apply the same values here.
        </P>
      </Card>

      <Card title="How to Calculate High School GPA by Hand">
        <P>It helps to understand the math, even when a calculator does it for you. Calculating a GPA manually takes four steps.</P>
        <List items={[
          ["Step 1: Convert each grade to points.", "Use your school’s scale. A B+ becomes 3.3, an A becomes 4.0, and so on."],
          ["Step 2: Multiply by credits, if applicable.", "A one-credit course counts as one unit, and a half-credit course counts as half. Multiply each grade’s points by the course credit to get quality points."],
          ["Step 3: Add everything up.", "Total all the quality points, and separately total all the credits."],
          ["Step 4: Divide.", "Total quality points divided by total credits is your GPA."],
        ]} />
        <Formula>GPA = Σ (grade points × credits) ÷ Σ credits</Formula>
        <P>
          If your courses have no credit values, treat every course as one credit, which turns the formula into a plain average. For example,
          five classes with grades of A, A, B+, B and C+ are worth 4.0, 4.0, 3.3, 3.0 and 2.3 points. Those total 16.6, and 16.6 divided by five
          is a 3.32 GPA.
        </P>
        <P>Things get more interesting when credits and weighting both come into play. Here is a sample schedule:</P>
        <DataTable headers={SAMPLE_HEADERS} rows={SAMPLE_ROWS} minWidth={520} />
        <P>
          The same five courses produce four different results. Unweighted without credits, the GPA is 3.60. Unweighted with credits, it is 16.0
          quality points divided by 4.5 credits, or 3.56. Weighted without credits, it is 3.90, and weighted with credits it is 17.5 divided by
          4.5, or 3.89. The credit-based numbers come out slightly lower because the half-credit PE grade, an A, counts for less. Some schools
          ignore credits when they report an unweighted GPA and others keep them, so check which method your school uses.
        </P>
        <P>
          The manual method works fine for a single semester, but it becomes error-prone across eight terms and 30 or more courses. A single
          misplaced decimal can push you into a different scholarship bracket, so a reliable high school GPA calculator is worth using even when
          you understand the formula.
        </P>
      </Card>

      <Card title="GPA Calculator With Credits vs Without Credits">
        <P>
          The credits option exists because courses are not always equal in length. A full-year class might carry 1.0 credit while a semester
          elective carries 0.5. Some schools using block schedules or college-style credit hours may also assign values such as 3 or 4 per
          course.
        </P>
        <P>
          Use the credits option when your transcript lists credit values or when your courses clearly differ in length. A half-credit PE class
          should not influence your GPA as much as a full-year Algebra II course, and a credit-based calculation reflects that.
        </P>
        <P>
          Skip credits when your school treats every course equally. In that case, the calculator averages grade points directly, giving you the
          same answer you would get from a simple mean. If you are unsure which applies to you, look at your report card or transcript. If a
          credit column is printed next to each course, include credits. If there is none, you almost certainly do not need them.
        </P>
      </Card>

      <Card title="How to Calculate Your Cumulative GPA">
        <P>
          Your cumulative GPA is the running average across every term you have completed, and it is the number colleges, scholarship committees
          and eligibility offices care about most. It is different from a semester GPA, which only covers one grading period.
        </P>
        <P>
          The correct way to combine terms is to weight each by credits, not to average the semester GPAs. If you earned a 3.8 over 6 credits one
          semester and a 3.2 over 3 credits the next, the cumulative result is (3.8 × 6 + 3.2 × 3) ÷ 9, which is 3.6. A plain average of 3.8 and
          3.2 would give 3.5, which understates the semester that carried more weight.
        </P>
        <P>
          There are two practical ways to get a cumulative GPA. You can enter every course from every year in one list. Or you can enter your
          current cumulative GPA and the credits it covers, then add the new term. Say your GPA is 3.45 over 20 credits and this term you earn
          3.80 over 6 credits. The new cumulative GPA is (3.45 × 20 + 3.80 × 6) ÷ 26, which comes to 3.53. The second method only works if the
          prior credits match the GPA you enter, so use the exact figures from your transcript. Either way, you end up with a single number for
          applications and forms.
        </P>
      </Card>

      <Card title="How This High School GPA Calculator Works">
        <P>
          The tool above follows the way schools report grades. You add each course, select the letter grade you earned, and, if you want a
          weighted result, mark the course level as regular, Honors, AP, IB or college. If your school assigns credit values, you can include
          those too. The calculator converts every letter grade to grade points, applies any weighting, and averages the result.
        </P>
        <P>
          There are three common ways to use it. The first is a quick unweighted GPA for a single semester. The second is a weighted GPA that
          reflects the difficulty of your schedule. The third is a cumulative GPA that combines every term from freshman year onward. Because you
          can change a grade and recalculate, you can also test scenarios, such as how a B+ instead of a B in AP Chemistry would change your
          overall number.
        </P>
      </Card>

      <Card title="Does High School GPA Still Matter Compared to SAT, ACT and Activities?">
        <P>
          Yes, though its role depends on the school. Your GPA covers years of work, while a test score reflects a few hours. That is why most
          colleges treat grades and course rigor as the foundation of an application. Test policies have shifted a lot in recent years. Many
          colleges are test-optional, and a number of selective schools have brought back testing requirements. A strong SAT or ACT score can
          back up a GPA when a school’s grading is unfamiliar to admissions readers or when one semester dragged your average down. It rarely
          replaces solid grades.
        </P>
        <P>
          Extracurriculars work differently. At selective colleges, activities, leadership and long-term commitments help separate applicants who
          have similar grades. At many public universities, admission runs mostly on GPA and course requirements, and activities count for less.
          A simple way to think about it: your GPA gets you into the conversation, and the rest of your application explains who you are.
        </P>
        <P>
          GPA is also a reasonable but imperfect signal of potential. It rewards steady effort, which predicts a lot about college performance,
          but it can be shaped by a school’s grading habits. Admissions offices know this, so they read your GPA next to your course choices,
          your school’s profile and your grade trend.
        </P>
      </Card>

      <Card title="How Colleges Calculate and Recalculate Your GPA">
        <P>
          Many colleges do not simply accept the GPA printed on your transcript. Some recalculate it using only core academic subjects such as
          English, math, science, social studies and foreign language, and drop electives and PE. Some apply their own weighting. The University
          of California, for example, looks at grades from 10th and 11th grade college-prep courses and limits the number of Honors points it
          will count. Other public universities add weight for AP and IB courses in their own formula. Many schools use your school’s reported
          GPA as is.
        </P>
        <P>
          Highly selective schools such as Harvard, MIT and Stanford do not publish a minimum GPA, and they do not rely on a single formula. They
          read your grades in the context of your school and the courses it offered. In practice, most admitted students have almost all A’s in
          the most demanding classes available to them, so there is no magic threshold to chase. Universities outside the U.S., including Oxford,
          generally focus on exam results such as AP, A-level or IB scores rather than a U.S. style GPA. Check each school’s admissions page for
          its own rules.
        </P>
        <P>
          What does that mean for you? Calculate more than one version. Get your weighted and unweighted GPA, and if you want a core-subject
          number, enter only your academic courses and leave out electives. That gives you a quick idea of how a college that recalculates might
          see your record.
        </P>
      </Card>

      <Card title="What Happens to Your GPA When You Retake a Class">
        <P>
          Schools handle retakes in one of two ways. Some replace the old grade with the new one in the GPA, and some average the two. A few cap
          the replacement grade. Your transcript will usually still show both attempts, and a college that recalculates may count both even if
          your school does not.
        </P>
        <P>
          To see the effect in the calculator, enter the course once with the new grade if your school replaces grades, or enter both attempts if
          it averages them. A retake can help, but a single improved grade moves a cumulative GPA only a little, and a clear upward trend in your
          later years often matters just as much.
        </P>
      </Card>

      <Card title="How to Improve Your High School GPA">
        <Lead lead="Understand the math first.">
          Your cumulative GPA is an average across all the credits you have earned, so the more credits behind it, the slower it moves. Going back
          to the earlier example, a 3.80 term lifted a 3.45 GPA only to 3.53. Starting strong in ninth and tenth grade matters, and each future
          term still counts.
        </Lead>
        <Lead lead="Ask what your school allows.">
          Grade replacement, credit recovery, summer courses and retakes are handled differently from district to district. Your counselor can
          tell you what is available and whether a new grade replaces or averages with the old one.
        </Lead>
        <Lead lead="Raise grades without retaking anything.">
          Turn in missing assignments, ask about makeup work or extra credit, and get help early in the classes with the most credits. Pulling a C
          up to a B in a full-credit course changes your GPA more than the same improvement in a half-credit elective.
        </Lead>
        <Lead lead="Recover from a rough start or a weak school.">
          You cannot change grades already on your transcript, but you can change the direction. Strong grades in later years, harder courses you
          can handle, and dual enrollment classes show colleges you are ready. If a hard year had a clear cause, a counselor can note it in a
          recommendation.
        </Lead>
        <Lead lead="Stay motivated when your GPA drops.">
          Set a specific target and work backward. Use the calculator to find the grades you need this semester to reach a goal such as 3.5, then
          break that into one class at a time. A number you can see is easier to work toward than a vague wish to do better.
        </Lead>
      </Card>

      <Card title="What Can Lower Your GPA">
        <P>
          One failing grade does more damage than most students expect. If five of your six equal-credit classes are A’s and one is an F, your
          unweighted GPA is about 3.33. A single C in the same situation gives you about 3.67.
        </P>
        <P>
          Missing school affects your GPA indirectly. Absences lead to missed assignments, lower participation grades and, at some schools,
          attendance rules that can cost you credit. Getting notes and making up work quickly protects your grades.
        </P>
        <P>
          Changing schools can also shift your GPA. Some schools bring over your grades from the old school, while others record transferred
          courses as credit only, with no grade, so they do not affect the new GPA. Grading scales can differ too. Ask the registrar how your
          transcript will be handled before you assume anything.
        </P>
      </Card>

      <Card title="High School GPA After Graduation">
        <H3>Does It Appear on a College Transcript?</H3>
        <P>
          No. A college transcript lists college courses and college grades only. Your high school GPA stays on your high school transcript, which
          colleges receive during admissions. Some schools keep it in your file for scholarship or honors program decisions, but it does not
          become part of your college GPA.
        </P>
        <H3>High School GPA vs College GPA</H3>
        <P>
          Your college GPA starts fresh. It is built from college credits, often with different credit hours, and it follows the same 4.0 idea. If
          your high school and college use different systems, such as different credit values or term lengths, calculate each separately and do
          not combine them. After your first year or two of college, graduate programs and employers care much more about your college GPA.
        </P>
        <H3>Transferring Colleges</H3>
        <P>Transfer admission focuses on your college record. Your high school GPA matters more if you have only a semester or two of college credit.</P>
        <H3>Putting It on a Resume</H3>
        <P>
          Include your high school GPA only if it is strong, and a 3.5 or higher is a common rule of thumb. Once you have college grades, switch
          to your college GPA or leave the number off.
        </P>
        <H3>Employers</H3>
        <P>
          Most employers do not ask about your high school GPA once you have any work history. Some ask for transcripts for internships,
          scholarships or entry-level roles, so keep an accurate number on hand.
        </P>
      </Card>

      <Card title="Studying or Applying From Outside the U.S.">
        <P>
          International students applying to U.S. colleges usually submit their own school’s transcript and grading scale. Colleges review these
          in context, and some use a credential evaluation service. A U.S. style GPA calculated here can help you understand your record, but it
          is not an official conversion. Going the other way, universities in countries like Germany use their own conversion tables for U.S.
          grades. This calculator works on the U.S. 4.0 scale and does not convert grades between countries, so ask the admitting school which
          method it uses.
        </P>
      </Card>

      <Card title="When You Will Need a High School GPA Calculator">
        <P>A high school GPA calculator is useful far more often than most students expect. Here are the situations where it pays off.</P>
        <List items={[
          ["Tracking progress mid-semester.", "Plug in your current grades to see where you will land and whether a rough class needs more attention before finals."],
          ["Setting realistic goals.", "If you want a 3.5 cumulative GPA for a scholarship or a 3.0 for athletic eligibility, you can work backward and see which grades you need in upcoming terms."],
          ["Preparing college applications.", "Applications like the Common App ask for your GPA, class rank or both. Calculating both your weighted and unweighted GPA ahead of time means you will have accurate numbers ready, and you can check them against your school’s reported values."],
          ["Applying for scholarships and programs.", "Merit scholarships, National Honor Society chapters, dual enrollment programs and summer academies often set minimum GPAs, and the cutoff may be specified as weighted or unweighted. Knowing both prevents surprises."],
          ["Transferring schools.", "Different schools use different scales and weighting rules. A transfer student can calculate a GPA under the new school’s policy to see how the transcript will translate."],
          ["Parents and counselors.", "Families checking progress or counselors running quick estimates can use the tool to model what-if scenarios without needing access to the school’s grading software."],
        ]} />
      </Card>

      <Card title="What Counts as a Good High School GPA?">
        <P>
          Context matters, but some benchmarks are widely used. On an unweighted 4.0 scale, a 3.0 is a solid B average and meets the minimum for
          many scholarships and programs. A 3.5 or higher is competitive for most four-year colleges, and 3.8 or above is typical for selective
          universities. The average high school GPA in the United States has been reported at around 3.0 to 3.4 in recent national studies,
          though the number varies by source and year.
        </P>
        <P>
          Weighted GPAs can exceed 4.0, so a 4.3 is not unusual for students taking several AP or IB classes. Admissions readers usually judge
          the number alongside the rigor of your course load. A 3.7 with a heavy AP schedule often reads better than a 4.0 with minimal
          challenge, which is part of the reason weighted calculations exist.
        </P>
        <P>
          Eligibility rules are stricter and more specific. NCAA Division I and II, for example, calculate a separate core-course GPA from
          approved courses only and set their own minimums, so your school GPA and your NCAA GPA can differ. If you are a student-athlete, review
          the{" "}
          <Ext href="https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-i/">NCAA Division I initial eligibility requirements</Ext>{" "}
          rather than relying on a general calculation.
        </P>
        <P>
          How hard is a 4.0 unweighted GPA? It depends on your school, your course load and your study habits. It takes consistency more than
          anything else, because a single B in four years ends it. Graduation is a separate question. Many states and districts base a diploma
          on earning required credits and passing required courses, and some also set a minimum GPA, often around 2.0. If your GPA is low, such
          as 1.9, ask your counselor what your district requires.
        </P>
      </Card>

      <Card title="Why Use Tolz for Your GPA Calculation">
        <P>
          Tolz offers this calculator as a free tool. There are no hidden charges, and you do not need to create an account to use it. You can
          calculate as many GPAs as you like, including different scenarios for different terms.
        </P>
        <P>
          Privacy matters when the data involves your grades. The course names and grades you enter are used to produce your result on the page,
          and they are not stored on a profile or shared with third parties. You can run a calculation, close the tab and leave no record behind.
        </P>
        <P>
          Accuracy is built on the same formulas used by schools: grade points multiplied by credits, divided by total credits, with the weighting
          values applied only when you ask for a weighted result. The calculator will not replace your official transcript, because your
          school’s registrar holds the authoritative record, but it will match the result you would get by following your school’s published
          policy.
        </P>
      </Card>

      <Card title="Tips for Getting an Accurate Result">
        <P>
          Before entering anything, find your school’s grading scale and weighting policy. These are usually in the student handbook, on the back
          of the transcript or on the counseling office page of your school’s website.
        </P>
        <P>
          Enter courses exactly as they appear on your transcript. Include every graded course, and leave out pass/fail classes, audited courses
          and any others your school excludes from the GPA. Some schools also exclude certain electives from the weighted calculation, so check
          before you include everything.
        </P>
        <P>If you retook a class, follow your school’s rule for replacing or averaging the grades, as described above.</P>
        <P>
          Finally, treat the calculator’s result as a precise estimate. If it differs from the number on your transcript, the cause is almost
          always a different scale, a different weighting rule or a course the school counts or excludes differently. Ask your counselor which
          policy applies.
        </P>
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
