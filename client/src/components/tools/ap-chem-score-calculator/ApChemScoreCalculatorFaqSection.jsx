import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the AP Chem score calculator work?",
    a: "It converts your multiple-choice and free-response points into weighted components, adds them into a composite score out of 100, and maps that composite to an estimated AP score of 1–5.",
  },
  {
    q: "What composite score do I need for a 5 in AP Chem?",
    a: "The College Board doesn’t publish fixed cutoffs, and they change from year to year. Estimates generally place a 5 at a composite of about 72 or higher.",
  },
  {
    q: "What is a good AP Chem score?",
    a: "A 3 is considered “qualified,” and a 4 or 5 is the usual target for college credit at competitive schools. In 2025, 77.9% of students scored 3 or higher.",
  },
  {
    q: "Is there a penalty for wrong answers on the AP Chem exam?",
    a: "No. Points are awarded for correct answers only, so you should answer every multiple-choice question.",
  },
  {
    q: "Is AP Chemistry hard?",
    a: "Yes, it’s one of the more demanding AP courses because it combines math, abstract concepts, and written explanations. Still, most students pass, and steady practice with released exam questions makes a big difference.",
  },
  {
    q: "Can I take AP Chem without taking regular chemistry first?",
    a: "It’s possible, but the College Board recommends a first-year chemistry course and Algebra II beforehand. If you skip regular chemistry, learn the basics, such as the mole, stoichiometry, and periodic trends, before the course starts.",
  },
  { q: "Do I need calculus for AP Chem?", a: "No. The course uses algebra, logarithms, and graph reading, not calculus." },
  {
    q: "Is the AP Chem score calculator accurate?",
    a: "The composite score is precise because it follows the exam’s structure. The 1–5 result is an estimate, since official cut scores are set after each exam.",
  },
  {
    q: "Do I need to sign up to use the calculator?",
    a: "No. There’s no account or login required. Enter your scores and read your result.",
  },
];

// The supplied FAQ schema matches the displayed text with straight apostrophes,
// except it writes "1-5" with a hyphen and drops the quotes around "qualified".
const FAQ_SCHEMA_OVERRIDES = {
  "How does the AP Chem score calculator work?": "It converts your multiple-choice and free-response points into weighted components, adds them into a composite score out of 100, and maps that composite to an estimated AP score of 1-5.",
  "What is a good AP Chem score?": "A 3 is considered qualified, and a 4 or 5 is the usual target for college credit at competitive schools. In 2025, 77.9% of students scored 3 or higher.",
  "Is the AP Chem score calculator accurate?": "The composite score is precise because it follows the exam's structure. The 1-5 result is an estimate, since official cut scores are set after each exam.",
};
const straight = (s) => s.replace(/’/g, "'");

const CHART_HEADERS = ["AP score", "Estimated composite range", "College Board recommendation"];
const CHART_ROWS = [
  ["5", "72–100", "Extremely well qualified"],
  ["4", "58–71", "Well qualified"],
  ["3", "42–57", "Qualified"],
  ["2", "27–41", "Possibly qualified"],
  ["1", "0–26", "No recommendation"],
];
const DIST_HEADERS = ["AP score", "2025", "2026"];
const DIST_ROWS = [
  ["5", "17.9%", "15%"],
  ["4", "28.6%", "31%"],
  ["3", "31.4%", "30%"],
  ["2", "15.9%", "18%"],
  ["1", "6.2%", "6%"],
  ["3 or higher", "77.9%", "76%"],
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

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
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

export default function ApChemScoreCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is AP Chemistry, and What Is Its Purpose?">
        <P>
          AP Chemistry is a college-level course and <Link to="/tools/test-grade-calculator" className="inline-home-link">exam</Link> for high school students. The <Link to="/tools/college-gpa-calculator" className="inline-home-link">College</Link> Board designed it to match a first-year
          college general chemistry class. The course is organized into nine units: atomic structure and properties, compound structure and
          properties, properties of substances and mixtures, chemical reactions, kinetics, thermochemistry, equilibrium, acids and bases, and
          thermodynamics and electrochemistry. It also builds lab skills, such as designing experiments, analyzing data, and explaining
          results in writing.
        </P>
        <P>
          The purpose of the course is twofold. It prepares you for college science by teaching you to reason about matter at the particle
          level and to solve quantitative problems. And the exam gives you a chance to earn college credit or placement into higher-level
          chemistry courses, depending on the policy of the school you attend.
        </P>
        <P>
          The exam has two sections of equal weight. Section I has 60 multiple-choice questions. Section II has seven free-response questions:
          three long ones and four short ones. Your final result is reported as an AP score from 1 (no recommendation) to 5 (extremely well
          qualified).
        </P>
      </Card>

      <Card title="How Hard Is AP Chemistry? Why Do So Many Students Find It Difficult?">
        <P>
          AP Chemistry has a reputation as one of the tougher AP courses, and the reputation is earned. Most of the difficulty comes from a few
          places. The course mixes math with abstract ideas, so you have to calculate and explain the same problem. The units build on each
          other, which means a weak spot in stoichiometry or equilibrium will cause trouble later in acids and bases or thermodynamics. And the
          free-response section rewards precise written explanations, not just right answers.
        </P>
        <P>
          The exam data backs this up. On the 2025 free-response section, the{" "}
          <Ext href="https://apcentral.collegeboard.org/media/pdf/ap25-chemistry-scoring-statistics.pdf">College Board’s scoring statistics</Ext>{" "}
          show average scores of 4.78, 4.29, and 3.61 out of 10 on the three long questions, and between about 1.3 and 2.3 out of 4 on the
          short ones. Added together, the typical student earned roughly 20 of 46 free-response points. That’s less than half, and it still
          helped many of those students land a 3 or higher.
        </P>
        <P>
          So the course is hard, but it’s very doable. Students who practice consistently and learn from their mistakes do well, and the
          distribution later in this article shows that most test takers earn a passing score.
        </P>
      </Card>

      <Card title="Should You Take AP Chem Without Taking Regular Chemistry First?">
        <H3>Making the Decision</H3>
        <P>
          The College Board recommends that students complete a first-year high school chemistry course and Algebra II before taking AP
          Chemistry. There’s a practical reason for that. The class moves fast and assumes you already know how to work with moles, balance
          equations, read the periodic table, and handle significant figures. Teachers usually spend little time on those basics.
        </P>
        <P>
          Skipping regular chemistry can work if you’re strong in math, comfortable teaching yourself, and have a teacher who supports the
          decision. If any of those is missing, taking regular chemistry first is usually the safer path, because it gives you a solid base and
          a better shot at a 4 or 5 later. Talk to your chemistry teacher and counselor before you decide, since schools set their own
          prerequisites.
        </P>
        <H3>How to Approach AP Chem Without a Prior Chemistry Class</H3>
        <P>
          If you’re going in without a chemistry background, start before the school year begins. Spend the first few weeks on the
          foundations: units and conversions, significant figures, atomic structure, the periodic table and its trends, naming compounds,
          balancing equations, the mole, and basic stoichiometry. Practice these until they feel automatic.
        </P>
        <P>
          Once the course starts, work problems every day instead of only reading. Chemistry skills come from repetition. Ask your teacher for
          summer assignments or a topic list, keep a short notebook of formulas and rules you keep forgetting, and ask for help early. Falling
          behind in the first two units is the most common way self-starters get into trouble. The free resources listed below are a good
          place to fill gaps.
        </P>
      </Card>

      <Card title="Do You Need Calculus to Score High in AP Chem?">
        <P>
          No. AP Chemistry does not use calculus. The math is algebra-based: solving for unknowns, working with ratios, using logarithms for pH
          and some kinetics problems, solving simple quadratic or approximation-based equilibrium problems, and reading graphs. Even the
          integrated rate laws are handled with algebra and logs, not derivatives or integrals.
        </P>
        <P>
          What you do need is comfort with algebra, scientific notation, and your calculator. Both sections allow a scientific or graphing
          calculator, so practice with the exact one you’ll bring to the exam. If your algebra is shaky, strengthening it will help your
          chemistry score far more than learning calculus would.
        </P>
      </Card>

      <Card title="How to Use the AP Chem Score Calculator">
        <P>The tool asks for two numbers, so it takes under a minute.</P>
        <P>
          First, enter the number of multiple-choice questions you answered correctly, out of 60. Count only correct answers. The exam has no
          guessing penalty, so unanswered questions simply score zero.
        </P>
        <P>
          Second, enter your free-response points. There are seven questions: three long questions worth 10 points each and four short
          questions worth 4 points each, for 46 points total. Add up the points from all seven questions using the official scoring
          guidelines, and <Link to="/tools/grade-calculator" className="inline-home-link">grade</Link> yourself strictly. Partial credit exists, but only for steps the rubric actually rewards.
        </P>
        <P>
          After you enter both numbers, the calculator returns three results: your composite score from 0 to 100, your estimated AP score from
          1 to 5, and the College Board’s recommendation for that level. Try changing one input at a time to see how each section moves the
          result. You’ll often find that a few extra points on a long free-response question help more than several extra multiple-choice
          answers.
        </P>
      </Card>

      <Card title="How the AP Chemistry Exam Is Scored">
        <P>
          The exam runs about three hours and fifteen minutes. Section I is 90 minutes, and Section II is 105 minutes. Each section counts for
          50% of your result.
        </P>
        <P>
          Because the sections have different lengths, raw points can’t simply be added together. Each section is first scaled to a 0–50 range
          by dividing your points by the section’s maximum and multiplying by 50. The two scaled numbers are then added to give the composite
          score. The full formula is:
        </P>
        <Formula>Composite = (MCQ correct × 50 ÷ 60) + (FRQ points × 50 ÷ 46)</Formula>
        <P>
          Here’s a worked example. A student answers 42 multiple-choice questions correctly and earns 28 free-response points. The
          multiple-choice part comes to 35.0, the free-response part to about 30.4, and the composite to roughly 65. A student with 48 correct
          and 30 free-response points lands at about 73.
        </P>
        <P>
          This weighting also shows you where points are most valuable. One multiple-choice question adds about 0.83 to your composite, while
          one free-response point adds about 1.09. A fully correct long question is worth roughly 10.9 composite points, the same as about 13
          multiple-choice questions. That’s why leaving a long free-response question blank can quietly cost you a whole AP score.
        </P>
      </Card>

      <Card title="From Composite Score to an AP Score of 1–5">
        <P>
          The last step is matching your composite to a 1–5 score. The College Board doesn’t publish a fixed conversion table. It sets cut
          scores after each exam, based on question difficulty and the performance standards behind each level, so the cutoffs shift a little
          from year to year. That’s why every AP Chem curve you see online is an estimate. The ranges below are the approximate bands this
          calculator uses, based on how past exams have scored.
        </P>
        <DataTable headers={CHART_HEADERS} rows={CHART_ROWS} />
        <P>
          If your composite sits within a few points of a boundary, plan as if you’re on the lower side. Also keep in mind that colleges decide
          for themselves what each score earns. Many selective schools want a 4 or 5 for credit or placement out of general chemistry, while
          others accept a 3. Check each school’s AP credit policy before deciding what score you need.
        </P>
      </Card>

      <Card title="What the Score Distribution Says About a Good Result">
        <P>It helps to compare your estimate with how other students did. The table below uses the College Board’s published score distributions.</P>
        <DataTable headers={DIST_HEADERS} rows={DIST_ROWS} />
        <P>
          In 2025, the mean AP Chemistry score was 3.36 across roughly 169,000 test takers. That’s higher than the average of about 3.0 across
          earlier years. Passing rates were well below 60% in years before 2023, so advice based on older AP Chem curves can make the exam look
          harder than recent results suggest.
        </P>
        <P>
          The takeaway: a 3 or better is the typical outcome, and roughly one student in six earns a 5. A distribution describes what happened
          to past students, though, so it can’t tell you what a given composite will earn this year.
        </P>
      </Card>

      <Card title="When an AP Chem Exam Score Calculator Helps">
        <P>A calculator is most useful at specific moments in the school year:</P>
        <List items={[
          ["After a full practice test.", "A raw result like “41 out of 60 and 25 out of 46” says little on its own. Converting it shows whether you’re tracking toward a 3, 4, or 5."],
          ["When deciding where to study.", "Entering “what if” numbers, such as gaining six free-response points, shows which section offers the faster payoff."],
          ["Before deciding how much more to push.", "If a mock exam puts you at a safe 4, your time may be better spent on other classes. If you’re near a 3, a focused push could be worth it."],
          ["When setting credit goals.", "If your target school wants a 4, you can work backward to the composite you need."],
          ["For teachers and tutors.", "Quick conversions give classes consistent feedback on unit tests, mock exams, and released free-response questions."],
          ["While waiting for official results.", "After the exam, you can recall roughly how many multiple-choice questions you got right and estimate your free-response points from the released scoring guidelines."],
        ]} />
      </Card>

      <Card title="How to Score a 5 in AP Chemistry">
        <P>
          Students who earn a 5 rarely do it with last-minute cramming. Most of them follow the same habits. They keep up with the material
          every week, practice with real exam questions, and study their mistakes instead of just checking answers.
        </P>
        <P>
          Start by treating your calculator results as a diagnostic. After each full practice exam, work out which section is holding your
          composite down. If multiple-choice is the weak side, review the units that produce the most misses and practice timed sets. You have
          about 90 seconds per question, so pacing matters. Don’t skip particulate diagrams and graph questions, which reward careful reading
          more than memorization.
        </P>
        <P>
          If free-response is the weak side, work through released questions under timed conditions, then grade them against the official
          scoring guidelines. Notice the language the rubric rewards. It wants specific claims backed by evidence, such as naming the
          intermolecular force that explains a boiling-point difference, or writing out an equilibrium expression before plugging in numbers.
          Keep an error log with the question, what went wrong, and the fix. Reviewing it every week will catch repeat mistakes before test
          day.
        </P>
        <P>
          Aim for a composite of at least 72, and recalculate after each full practice test. Look at the trend over three or four attempts
          instead of a single score.
        </P>
      </Card>

      <Card title="Practical AP Chem Tips">
        <P>A few habits pay off on almost every exam:</P>
        <List items={[
          ["Show your setup and units.", "Free-response graders award points for correct method, even when your final number is off. Include units and keep an eye on significant figures."],
          ["Answer every multiple-choice question.", "With no penalty for wrong answers, a blank is always a wasted chance. If you’re stuck, mark it, move on, and come back."],
          ["Never leave a free-response question empty.", "Partial credit is real, and a correct equation or a correct first step can earn points."],
          ["Explain, don’t just state.", "When a question says “justify” or “explain,” connect your answer to a specific principle, such as particle interactions, energy changes, or Le Châtelier’s principle."],
          ["Know the common labs.", "Titration, calorimetry, gravimetric analysis, and spectrophotometry (Beer’s law) show up often in experimental-design and data questions."],
          ["Use the reference sheet.", "The exam provides a periodic table and an equations-and-constants sheet, so learn where things are and practice with them instead of memorizing everything."],
        ]} />
      </Card>

      <Card title="What Are the Best Free Resources for AP Chem Notes?">
        <P>You don’t need to spend money to study well. These free resources are good ones, and several are updated regularly:</P>
        <List items={[
          ["AP Central (College Board).", "It posts past free-response questions, scoring guidelines, sample student responses, and each year’s scoring statistics. Because new exam materials are added every year, it’s the best source for what the exam currently looks like."],
          ["AP Classroom.", "If your teacher uses it, you get unit-based practice questions and progress checks that match the course framework."],
          ["Khan Academy.", "It offers a free AP Chemistry course with video lessons and practice problems organized by topic."],
          ["LibreTexts Chemistry.", "A free online library of college-level chemistry textbooks that’s good for deeper explanations when your class notes aren’t enough."],
          ["The AP Chemistry Course and Exam Description.", "This College Board document lists every topic and skill that can be tested, so it works well as a checklist."],
        ]} />
        <P>Pair these with your own notes. Reading alone isn’t enough. Work practice problems after every topic.</P>
      </Card>

      <Card title="Do You Have to Take AP Chem to Go Pre-Med?">
        <P>
          No. AP Chemistry isn’t a requirement for pre-med. Medical schools typically ask for college-level general chemistry and organic
          chemistry with labs. Whether your AP credit counts toward those requirements depends on each school. Some accept it, and others
          prefer or require you to take the course in college or move on to a higher-level chemistry class.
        </P>
        <P>
          Even so, AP Chemistry can help. It gives you a strong base for college chemistry, and the problem-solving habits carry over to the
          chemistry on the MCAT. If you’re aiming for medical school, check the policies of the schools you’re interested in, and confirm how
          your college handles AP credit before you skip a course.
        </P>
      </Card>

      <Card title="Can You Major in Chemistry With a B in AP Chem?">
        <P>
          Yes. A B in AP Chemistry won’t stop you from majoring in chemistry. Colleges look at your full academic record, and the major itself
          is built on college coursework, not on your high school grade.
        </P>
        <P>
          It also helps to separate two things. Your class grade comes from your teacher, while your AP score comes from the exam in May.
          Either one can differ from the other. If you earned a B but scored a 4 or 5 on the exam, that shows strong command of the material.
          If your result was lower than you hoped, you can still succeed by building a solid foundation in college general chemistry and
          using campus tutoring and office hours. Interest and steady effort matter far more than one grade.
        </P>
      </Card>

      <Card title="Accuracy, Privacy, and Cost">
        <P>
          The calculator is free to use and doesn’t ask for your name, email, school, or any account details. All it needs are your two point
          totals.
        </P>
        <P>
          On accuracy, the composite calculation follows the published section weights and point values, so that part is dependable. The AP
          score conversion is an estimate because the College Board sets final cut scores after each exam. Use the result as a planning tool,
          not a guarantee. Only the College Board releases official scores.
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
