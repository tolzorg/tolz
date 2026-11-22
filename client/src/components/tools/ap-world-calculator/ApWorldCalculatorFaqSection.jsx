import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my AP World History score?", a: "Add up your points in each section, apply the exam weights (multiple-choice 40%, short-answer 20%, DBQ 25%, LEQ 15%) and total them into a composite out of 130. The calculator does this automatically and then maps the composite to a 1–5 AP score." },
  { q: "What is a good AP World History score?", a: "A 3 is considered qualified and earns credit at many colleges, a 4 is well qualified, and a 5 is the highest. What counts as “good” depends on your target colleges, since credit policies differ. In 2026, about 50% of test takers earned a 4 or 5." },
  { q: "What composite score do I need for a 5?", a: "There’s no fixed number. Cut points change each year, but a 5 generally requires a high composite with strong results in both multiple-choice and writing. Use the calculator to see how close you are, and treat the result as an estimate." },
  { q: "Is the AP World History exam curved?", a: "Not in the sense of ranking you against other test takers. Scores reflect performance against defined standards, and the College Board adjusts the cut points annually so each score keeps a consistent meaning." },
  { q: "How is the AP World History exam scored?", a: "The multiple-choice section is scored by the number of correct answers, and the free-response questions are scored by trained readers using rubrics. The section scores are weighted and combined into a composite, which is converted to a 1–5 score." },
  { q: "How is the DBQ scored?", a: "It’s scored out of 7: 1 point for the thesis, 1 for contextualization, 3 for evidence (using documents and adding outside evidence), and 2 for analysis and reasoning, including sourcing and complexity." },
  { q: "How many points is each section worth?", a: "Multiple-choice is worth up to 55 raw points, short-answer up to 9, the DBQ up to 7 and the LEQ up to 6. After weighting, they combine into the 130-point composite." },
  { q: "How long is the AP World History exam?", a: "About three hours and fifteen minutes. It includes the multiple-choice section, the short-answer questions, the DBQ and the long essay." },
  { q: "What changes on the 2027 exam?", a: "All three short-answer questions are required and include source material, the long essay has one required prompt, and the DBQ covers a wider time range. The multiple-choice section, course content and scoring rubrics stay the same." },
  { q: "Can I use this calculator for practice tests I graded myself?", a: "Yes. Just score honestly, especially on essays, where the complexity point is the hardest to earn. Conservative self-grading gives a more realistic projection." },
  { q: "Does a 3 get me college credit?", a: "At some colleges, yes. Others require a 4 or 5, or grant placement without credit. Check each school’s AP policy." },
  { q: "Should I take AP World History in sophomore year?", a: "It’s common, and there are no required prerequisites. It works well if you’re comfortable with reading and writing. If you’d like to build study skills first, junior year is also a good choice." },
  { q: "Can I self-study AP World History?", a: "Yes. Follow the nine units, use the College Board’s free materials, practice writing, and take timed practice exams. If your school doesn’t offer the course, ask your counselor about registering for the exam." },
  { q: "Is this AP World History score calculator free?", a: "Yes, it’s completely free to use, and you don’t need to create an account." },
  { q: "How accurate is the estimate?", a: "It uses the exam’s official weighting, so the composite is dependable. The AP score conversion is an estimate, because the College Board sets final cut points each year." },
];

// The supplied FAQ schema is a shorter, separately worded set of questions,
// so it is kept verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate my AP World History score?", a: "Add up your points in each section, apply the exam weights (multiple-choice 40%, short-answer 20%, DBQ 25%, LEQ 15%) and total them into a composite out of 130. The calculator does this automatically and then maps the composite to a 1-5 AP score." },
  { q: "What is a good AP World History score?", a: "A 3 is considered qualified and earns credit at many colleges, a 4 is well qualified, and a 5 is the highest. What counts as good depends on your target colleges, since credit policies differ." },
  { q: "What composite score do I need for a 5?", a: "There is no fixed number. Cut points change each year, but a 5 generally requires a high composite with strong results in both multiple-choice and writing." },
  { q: "Is the AP World History exam curved?", a: "Not in the sense of ranking you against other test takers. Scores reflect performance against defined standards, and the College Board adjusts cut points annually so each score keeps a consistent meaning." },
  { q: "How is the AP World History exam scored?", a: "The multiple-choice section is scored by the number of correct answers, and the free-response questions are scored by trained readers using rubrics. The section scores are weighted and combined into a composite, which is converted to a 1-5 score." },
  { q: "How is the DBQ scored?", a: "It is scored out of 7: 1 point for the thesis, 1 for contextualization, 3 for evidence, and 2 for analysis and reasoning." },
  { q: "How many points is each section worth?", a: "Multiple-choice is worth up to 55 raw points, short-answer up to 9, the DBQ up to 7 and the LEQ up to 6. After weighting, they combine into the 130-point composite." },
  { q: "How long is the AP World History exam?", a: "About three hours and fifteen minutes, including the multiple-choice section, the short-answer questions, the DBQ and the long essay." },
  { q: "What changes on the 2027 AP World History exam?", a: "All three short-answer questions are required and include source material, the long essay has one required prompt, and the DBQ covers a wider time range. The multiple-choice section, course content and scoring rubrics stay the same." },
  { q: "Does a 3 get me college credit?", a: "At some colleges, yes. Others require a 4 or 5, or grant placement without credit. Check each school's AP policy." },
  { q: "Should I take AP World History in sophomore year?", a: "It is common, and there are no required prerequisites. It works well if you are comfortable with reading and writing. If you would like to build study skills first, junior year is also a good choice." },
  { q: "Can I self-study AP World History?", a: "Yes. Follow the nine units, use the College Board's free materials, practice writing, and take timed practice exams. If your school does not offer the course, ask your counselor about registering for the exam." },
  { q: "Is this AP World History score calculator free?", a: "Yes, it is completely free to use, and you do not need to create an account." },
];

const UNIT_HEADERS = ["Years (approx.)", "Unit", "Approximate exam weight"];
const UNIT_ROWS = [
  ["1200–1450", "Unit 1: The Global Tapestry", "8–10%"],
  ["1200–1450", "Unit 2: Networks of Exchange", "8–10%"],
  ["1450–1750", "Unit 3: Land-Based Empires", "12–15%"],
  ["1450–1750", "Unit 4: Transoceanic Interconnections", "12–15%"],
  ["1750–1900", "Unit 5: Revolutions", "12–15%"],
  ["1750–1900", "Unit 6: Consequences of Industrialization", "8–10%"],
  ["1900–present", "Unit 7: Global Conflict", "8–10%"],
  ["1900–present", "Unit 8: Cold War and Decolonization", "8–10%"],
  ["1900–present", "Unit 9: Globalization", "8–10%"],
];
const DIST_HEADERS = ["Year", "5", "4", "3", "2", "1", "3 or higher"];
const DIST_ROWS = [
  ["2026", "14%", "36%", "16%", "26%", "8%", "66%"],
  ["2025", "13.9%", "33.4%", "17.0%", "26.5%", "9.2%", "64.3%"],
  ["2024", "11.9%", "32.3%", "19.6%", "27.4%", "8.8%", "63.7%"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

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
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows, minWidth = 360 }) {
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

export default function ApWorldCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is AP World History and What Is Its Purpose?">
        <P>
          AP World History: Modern is a <Link to="/tools/college-gpa-calculator" className="inline-home-link">College</Link> Board course that works like an introductory college class in modern world history. It
          follows the story of the world from about 1200 CE to the present. You learn how empires rose and fell, how trade and technology
          connected distant regions, how revolutions reshaped societies, and how wars and globalization built the world we live in now.
        </P>
        <P>
          The course has two goals. The first is knowledge: understanding the major developments, causes and effects of the last 800 years.
          The second is skill. You practice building an argument, analyzing sources, comparing events across regions, and explaining change
          over time. The <Link to="/tools/test-grade-calculator" className="inline-home-link">exam</Link> in May tests both, and a strong score can earn college credit or let you skip an entry-level history course.
          The College Board lists no prerequisites, which is why many students take it as their first AP class, often in sophomore year.
        </P>
      </Card>

      <Card title="AP World History Exam Format and Section Weighting">
        <P>The exam has two parts and four scoring components. Knowing them explains why the calculator asks for each input separately.</P>
        <List items={[
          ["Multiple-choice (Section I, Part A)", "has 55 questions in 55 minutes and counts for 40% of your score. Questions are built around sources such as texts, images, maps and data, and they test historical thinking as well as recall."],
          ["Short-answer questions (Section I, Part B)", "has three questions, worth 20% of your score. Each one is scored out of 3 points."],
          ["The document-based question (Section II)", "is one question scored out of 7 and worth 25%. You analyze a set of documents and build an argument from them."],
          ["The long essay question (Section II)", "is one essay scored out of 6 and worth 15%."],
        ]} />
        <P>
          The whole exam takes about three hours and fifteen minutes. Because the sections carry different weights, one DBQ point is worth far
          more than one multiple-choice point. Each DBQ point adds roughly 4.6 composite points, an LEQ point roughly 3.25, and a short-answer
          point roughly 2.9. One multiple-choice point adds a little under 1. That’s why a calculator is more reliable than counting what you
          got right.
        </P>
      </Card>

      <Card title="What’s New on the 2027 AP World History Exam">
        <P>
          If you’re asking whether AP World History is changing, the answer is yes, in a limited way. Starting with the May 2027 exam, the
          College Board has updated the free-response section for AP World History: Modern, AP U.S. History and AP European History. Course
          content and skills stay the same. The multiple-choice section stays the same. The scoring rubrics stay the same, including how
          students earn each point.
        </P>
        <P>Here’s what changes:</P>
        <List items={[
          ["Short-answer questions:", "All three are required, so there’s no more choosing between two options. Question 1 includes one or more secondary sources, question 2 includes a primary text source, and question 3 includes a primary or secondary non-text source, such as an image or map. Each question covers a different time period."],
          ["Long essay question:", "You answer one required prompt instead of choosing from three. The prompt is broad, and it comes with a short introductory statement that helps you get oriented and points to possible lines of analysis."],
          ["Document-based question:", "The documents cover a wider range of time, so you can draw on evidence from across the course."],
        ]} />
        <P>
          The College Board says students don’t need to provide more evidence than before. The amount and type of evidence needed to earn
          points is the same. The calculator still works the same way, because the point totals (9 for short-answer, 6 for the LEQ, 7 for the
          DBQ) haven’t changed. If you practice with an older released exam, you’ll see the old choices on the short-answer and essay sections,
          but you score them the same way. The College Board plans to release updated practice exams during the 2026–27 school year.
        </P>
      </Card>

      <Card title="What Are AP World Units?">
        <P>
          The course is organized around four eras and nine units. Together they cover global developments from 1200 CE to the present, with a
          focus on patterns and connections rather than memorizing isolated facts.
        </P>
        <DataTable headers={UNIT_HEADERS} rows={UNIT_ROWS} />
        <P>
          The middle three units carry the most weight on the multiple-choice section, so don’t skip them in your review. The course begins at
          1200 CE, so older prep books that start with ancient civilizations cover material the exam no longer tests. Some historians dislike
          that start date, and others say a narrower window leaves room for more depth. Either way, the exam only covers 1200 onward, so that’s
          what you should study.
        </P>
      </Card>

      <Card title="From Composite Score to AP Score: What the Numbers Mean">
        <P>
          Once your section points are weighted and added up, you get a composite on the 0–130 scale. The College Board describes each AP score
          this way: 5 is extremely well qualified, 4 is well qualified, 3 is qualified, 2 is possibly qualified, and 1 is no recommendation.
        </P>
        <P>
          The composite needed for each score isn’t fixed. The College Board sets cut points each year after studying how students performed,
          so the same composite can land on either side of a boundary from one year to the next. That’s why any AP World History score
          calculator gives an estimate, not a guarantee.
        </P>
        <P>
          Many students also ask about a “curve.” The exam isn’t graded against your classmates. Scores reflect performance against set
          standards, and the yearly cut points are adjusted so each score keeps the same meaning from year to year.
        </P>
      </Card>

      <Card title="AP World Score Distribution">
        <P>
          A score distribution shows what percent of all test takers earned each score. It’s a quick way to see how your estimate compares with
          everyone else. These figures come from the College Board’s published score distributions.
        </P>
        <DataTable headers={DIST_HEADERS} rows={DIST_ROWS} minWidth={460} />
        <P>
          (The 2026 numbers are rounded to whole percentages.) About 64–66% of students score a 3 or higher, and nearly half score a 4 or 5.
          More than a quarter earn a 2, which is a larger group than on many other AP exams. That tells you many students land just below the
          line, and the gap is often a few points in the essays.
        </P>
      </Card>

      <Card title="Understanding the College Board Recommendation">
        <P>
          Beyond the number, the tool shows a recommendation label that matches the College Board’s descriptors, from “extremely well
          qualified” down to “no recommendation.” It’s a quick read on how a college might view your result.
        </P>
        <P>
          Credit policies vary widely. Some colleges grant credit for a 3, many require a 4, and selective schools may require a 5 or give only
          placement without credit. Credit is also measured differently. Many colleges award somewhere around three to six credit hours for a
          qualifying score, but the amount depends on the school. Check the AP credit policy page of each college you’re considering. The score
          tells you where you stand, and the college’s policy tells you what that standing is worth.
        </P>
      </Card>

      <Card title="When You Would Actually Use This Calculator">
        <List items={[
          ["After a full-length practice test.", "Take a timed exam, score it, and enter your points. The composite and projected AP score give you a baseline to compare against later attempts."],
          ["To decide where to spend study time.", "Your results show which section is holding you back. A student scoring 50 of 55 on multiple-choice but 2 of 7 on the DBQ will gain far more from DBQ practice than from another stack of flashcards."],
          ["To set a realistic target.", "If you want a 4 for college credit, change the inputs until the projected score reaches that level. Then you can see how many extra points you need in each section."],
          ["During the school year.", "Teachers often grade unit essays with the AP rubric. Plug those scores in alongside multiple-choice results from AP Classroom, and you get a running estimate, so your progress doesn’t depend on one high-pressure day in May."],
          ["For parents and tutors.", "The tool turns rubric scores into an AP score people recognize, which helps in conversations about readiness."],
        ]} />
      </Card>

      <Card title="Is AP World History Hard?">
        <P>
          It depends on what you find hard. The course covers a lot of ground, with many regions, time periods and vocabulary terms. And because
          it’s often a student’s first AP class, the jump in reading and writing can feel large. By pass rate, though, it isn’t among the
          hardest AP exams. About two-thirds of students score a 3 or higher, while an exam like AP Statistics had a pass rate around 60% in
          2025. When people say AP World is “the hardest AP class,” they usually mean the workload for a first-time AP student, not the exam
          statistics.
        </P>
        <P>
          The course is also not mostly memorization. You do need to know facts, but the exam rewards students who can explain why events
          happened and how they connect. A student who memorizes dates without understanding cause and effect will struggle on the DBQ and LEQ.
          A student who understands the big patterns and backs them up with a handful of precise examples will do well.
        </P>
        <P>
          If you’re asking whether the modern course is harder than the older one, it covers fewer centuries, so there is more room to go deep.
          The skills it tests are the same kind of historical thinking.
        </P>
      </Card>

      <Card title="Who Should Take AP World History?">
        <P>
          AP World History is a good fit if you like reading, enjoy connecting events across regions, and are willing to write regularly. It
          suits students who want college credit in history or want to show they can handle college-level work.
        </P>
        <Lead lead="Sophomore year or later?">
          Many schools place AP World in sophomore year, and many students do fine there. If you’re a strong reader and writer, sophomore year
          works. If you’d rather build study habits first, junior or senior year is a fine choice too. Talk to your counselor about your
          school’s course sequence.
        </Lead>
        <Lead lead="AP World or AP U.S. History?">
          Neither is “better.” AP World covers the whole globe from 1200, while APUSH goes deep on one country. APUSH had a higher pass rate in
          recent years, but that doesn’t mean it’s easier. Choose the one that fits your interests and your school’s requirements.
        </Lead>
        <Lead lead="AP World or AP European History?">
          AP Euro is narrower and more detailed, with a focus on Europe from about 1450. AP World gives you a wider view. Some students take
          both, and many find that the skills overlap a lot, especially in the DBQ.
        </Lead>
        <Lead lead="AP World or honors World History?">
          The honors class usually has a lighter workload and no College Board exam. The AP class is faster and more demanding, but it offers
          the chance to earn college credit. Pre-AP is different from both. It’s a College Board program that builds the skills you need for AP
          courses, but it has no AP exam.
        </Lead>
        <Lead lead="Does skipping it hurt college chances?">
          Not by itself. Admissions officers look at how rigorous your schedule is compared with what your school offers. If you take other
          challenging courses, you aren’t penalized for skipping one AP class. Taking AP World can help show that you’re ready for college
          work, especially if you do well.
        </Lead>
        <Lead lead="Can it replace required world history?">
          Some schools let an AP course satisfy a graduation requirement, and some don’t. Ask your counselor, since it’s decided by your school
          or district.
        </Lead>
        <Lead lead="Do I have to take the exam?">The College Board doesn’t require it, but your school or teacher might. Ask early.</Lead>
      </Card>

      <Card title="How to Get an A in AP World History">
        <P>Your class <Link to="/tools/grade-calculator" className="inline-home-link">grade</Link> and your AP exam score are different things, and what works for one helps the other. Here’s what tends to work:</P>
        <List items={[
          ["Read before class.", "Even a quick skim of the chapter makes lectures easier to follow."],
          ["Keep a running timeline.", "Write down major events from 1200 to today, with dates and regions. Seeing everything in one place helps you spot patterns."],
          ["Take notes by theme.", "Group your notes by topics like trade, empires, religion, technology and revolution, instead of copying a textbook page by page."],
          ["Practice writing early.", "Don’t wait until a test. Write a few practice paragraphs each week."],
          ["Use your teacher.", "Ask for feedback on your essays and how they were scored."],
        ]} />
        <P>
          If you’re struggling or falling behind, act early. Start with one unit at a time, go to office hours, and focus on the rubric, since
          essay skills often turn around grades the fastest. One low grade, even a C+ in your first AP class, isn’t a disaster. Most students
          improve once they learn what the writing tasks expect.
        </P>
      </Card>

      <Card title="How to Study for the AP World History Exam">
        <P>Start with the official materials, then add a few outside resources.</P>
        <P><strong>Core tools:</strong></P>
        <List items={[
          ["AP Classroom.", "Your teacher can assign practice questions and unit checks that match the exam. You need a class code from your teacher to use it."],
          ["The course page.", <>The College Board’s <Ext href="https://apstudents.collegeboard.org/courses/ap-world-history-modern">AP World History: Modern page</Ext> explains what the course covers, how the exam works, and how to find colleges that grant credit.</>],
          ["A textbook or review book.", "Your class textbook is a good start. Many students also use a review guide from publishers like Barron’s or Princeton Review. Pick one that is updated for the modern course, which starts in 1200. If you’re unsure, a guide published recently and labeled “Modern” is a safe choice."],
          ["Free video lessons.", "Khan Academy, Heimler’s History on YouTube and Fiveable all offer unit reviews for AP World History: Modern."],
        ]} />
        <P><strong>A simple plan:</strong></P>
        <List ordered items={[
          ["", "Review one unit at a time and use the unit weights to decide how much time each one gets."],
          ["", "Take a practice multiple-choice set after each unit and review every wrong answer."],
          ["", "Write one DBQ or LEQ every couple of weeks, and score it with the rubric."],
          ["", "Take a full timed practice exam a few weeks before the test. Enter your points into the calculator to see where you stand."],
          ["", "Spend your last weeks on your weakest section."],
        ]} />
        <Lead lead="Studying on your own.">
          You can self-study AP World History, and many people do, even while taking a regular world history class. Give yourself a schedule,
          work through the units in order, and practice writing. If your school doesn’t offer the course, ask your counselor about other ways to
          take it and how to register for the exam as an outside student.
        </Lead>
        <Lead lead="Short on time?">
          If your exam is a week away, or even five days, don’t try to relearn everything. Review the timeline, learn the big themes of each
          era, drill multiple-choice questions on the heavily weighted units, and practice one DBQ and one LEQ outline. No cramming method can
          replace months of study, but a focused review can still raise your score a point or two.
        </Lead>
      </Card>

      <Card title="How Do You Write Your First AP World History Essay?">
        <P>Whether it’s your first practice DBQ or a unit test, the same simple structure works.</P>
        <List ordered items={[
          ["Read the prompt twice", "and underline the task, such as “evaluate the extent to which” or “compare.”"],
          ["Write a thesis that answers the question.", "It should take a clear position and give a line of reasoning, not just restate the prompt. This earns one point."],
          ["Add context.", "Two or three sentences about the broader events leading up to the topic earn the contextualization point. Don’t make it a list of facts. Explain what was going on."],
          ["Support your argument with evidence.", "On the DBQ, use at least six of the documents and add at least one piece of outside evidence. On the LEQ, use at least two specific pieces of evidence."],
          ["Explain your evidence.", "Don’t just name an example. Say how it proves your point. This is where analysis points come from."],
          ["Show complexity.", "Compare across regions or eras, explain a counterpoint, or show that a cause had several effects."],
        ]} />
        <P>
          For the DBQ, sourcing is the skill students miss most. Pick three documents and explain how the author’s point of view, purpose,
          situation or audience affects the document’s usefulness. For the LEQ, which now has one required prompt, read the introductory
          statement and think about which examples you know best. A well-organized essay with a few precise examples beats a broad one built on
          generalities.
        </P>
      </Card>

      <Card title="Strategies for the Multiple-Choice Section">
        <List items={[
          ["Read the source first.", "Note the author, date and purpose before you look at the answers. Many wrong choices sound plausible but don’t match the source."],
          ["Identify the time and place.", "Knowing the era often removes two answer choices right away."],
          ["Don’t leave blanks.", "There is no penalty for guessing."],
          ["Watch for words like “primary reason” or “most directly.”", "These ask for the best answer, not just a true one."],
          ["Practice in sets.", "Timed sets of ten or fifteen questions build speed and focus."],
        ]} />
      </Card>

      <Card title="How Do I Get a 5 on the AP World History Exam?">
        <P>
          A 5 comes from steady strength across all four sections, not one perfect section. Because writing makes up 60% of the score, essays
          are the best place to gain points. Secure the easy ones first: thesis and contextualization on both the DBQ and LEQ, plus full credit
          on the short-answer parts you know. Then work on the harder points, like sourcing, complexity, and precise evidence. On
          multiple-choice, keep your accuracy high on the heavy units.
        </P>
        <P>
          As you practice, use the calculator. Enter your results, see how far you are from a 5, and decide which section to improve. Small
          gains in several sections often add up to a full score level.
        </P>
      </Card>

      <Card title="Where to Find Past AP World History Exams">
        <P>
          The best source for real exam questions is the College Board’s{" "}
          <Ext href="https://apcentral.collegeboard.org/courses/past-exam-questions">Past Free-Response Questions page on AP Central</Ext>.
          You can find past DBQs, LEQs and short-answer questions for AP World History: Modern there, along with scoring guidelines and sample
          student responses. The sample responses are especially useful. They show what graders reward and where students lose points. Your
          teacher can also share full practice exams through AP Classroom.
        </P>
        <P>
          Keep in mind that older questions follow the old format, with choices on the short-answer and essay sections. They’re still excellent
          practice, since the rubrics haven’t changed. As updated practice exams come out, use them for your final review.
        </P>
      </Card>

      <Card title="How the AP World History Score Calculator Works">
        <P>
          The calculator follows the way the College Board builds a final score. Your raw points in each section are multiplied by a weight, so
          each section contributes its official share. The weighted results are added into a composite score on a 0–130 scale, and that
          composite is matched to an AP score of 1 to 5.
        </P>
        <P>
          Raw points can mislead you. A student with 45 of 55 multiple-choice points and a weak DBQ may feel confident, while someone with 38
          multiple-choice points and strong essays may actually be ahead. Weighting shows how each section moves your result, so you can see
          where your points come from.
        </P>
        <P>
          The tool also shows a credit recommendation. That tells you whether your estimated score would likely earn credit or placement at many
          colleges, which makes it useful for planning as well as scoring.
        </P>
      </Card>

      <Card title="How to Use the AP World History Score Calculator">
        <P>If you’re not sure how to estimate your score, follow these steps:</P>
        <List ordered items={[
          ["", "Review your practice exam and count the points you earned in each section."],
          ["", "Enter those points into the matching fields of the calculator."],
          ["", "Read your results: composite score (0–130), projected AP score (1–5) and the College Board recommendation."],
          ["", "Compare your result with the score distribution table further up this page to see how it stacks up against other students."],
        ]} />
        <P>Here is how to fill in each field.</P>
        <List items={[
          ["Multiple-choice:", "Enter the number of questions you answered correctly, from 0 to 55. The AP exam doesn’t penalize wrong answers, so don’t subtract anything."],
          ["Short-answer:", "Enter your total across all three questions, up to 9. Each question has parts (a), (b) and (c), and each part earns one point for a specific, accurate response."],
          ["DBQ:", "Enter your rubric score out of 7. The points come from a thesis (1), contextualization (1), evidence (3, split between using the documents and bringing in outside evidence) and analysis and reasoning (2, covering sourcing and complexity)."],
          ["LEQ:", "Enter your score out of 6. The rubric is the same as the DBQ but without documents: thesis (1), contextualization (1), evidence (2) and analysis and reasoning (2)."],
        ]} />
        <P>
          If you grade your own essays, grade conservatively. Students tend to give themselves the complexity point, but graders save it for
          essays that show real nuance, such as comparing evidence across contexts or weighing competing interpretations. When in doubt, take
          the lower score. A cautious estimate protects you from a bad surprise in July.
        </P>
      </Card>

      <Card title="Accuracy and Limitations of Any Score Estimate">
        <P>
          The calculator applies the exam’s published section weights, so the composite it reports reflects how your points would combine. The
          least certain step is the conversion from composite to AP score, since the College Board adjusts cut points yearly and doesn’t announce
          them in advance.
        </P>
        <P>
          Treat your result as a range, not a promise. If your composite sits close to a boundary, say between a 3 and a 4, plan as though you
          could land on either side. Self-scored essays add more uncertainty, because official graders are trained and calibrated in ways
          individual students and teachers aren’t. For the most dependable estimate, use released free-response questions and the scoring
          guidelines the College Board publishes with them.
        </P>
      </Card>

      <Card title="Free to Use, With Your Data in Mind">
        <P>
          This tool is free, with no payment or hidden charges, and you don’t need to create an account. You only enter point totals, never
          names, school details or other personal information, so there is nothing sensitive to protect. Run it as often as you like with
          different scenarios, on any device.
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
