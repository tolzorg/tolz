import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is an AP Lang score?",
    a: "It is your final result on the AP English Language and Composition exam, reported on a scale from 1 to 5. It combines your multiple-choice and essay performance, and colleges may use it to award credit or placement.",
  },
  {
    q: "How do I calculate my AP Lang score?",
    a: "Count your correct multiple-choice answers (out of 45) and add your three essay scores (each 0–6). The multiple-choice total counts as is, the essay total is multiplied by about 3.06, and the sum is your composite out of 100, which maps to an AP score from 1 to 5.",
  },
  {
    q: "What is a good AP Lang score?",
    a: "A 3 is “qualified” and earns credit at many colleges, while a 4 or 5 opens credit at more selective schools. A good score ultimately depends on the AP policies of the colleges you are considering.",
  },
  {
    q: "What composite score do I need for a 5 on AP Lang?",
    a: "Most unofficial estimates put it at about 75 out of 100, though the exact cut score changes from year to year.",
  },
  {
    q: "How many multiple-choice questions do I need to get a 3?",
    a: "There is no single number because essays carry more weight per point. With a 3 on each essay, you would need roughly 22 to 25 correct answers to reach the low end of the 3 range. With a 4 on each essay, far fewer are needed.",
  },
  {
    q: "Is AP Lang curved?",
    a: "Not with a fixed percentage. Cut scores are set each year based on exam performance and score standards, so there is no preset curve, but the boundaries do move a little.",
  },
  {
    q: "How are the AP Lang essays scored?",
    a: "Trained readers score each essay from 0 to 6 using a rubric: thesis (1 point), evidence and commentary (up to 4 points), and sophistication (1 point).",
  },
  {
    q: "Can one essay point change my AP score?",
    a: "Yes. One essay point is worth roughly three composite points, which is enough to move you across a score boundary if you are close.",
  },
  {
    q: "What is the maximum score if I fail one essay?",
    a: "If you earn 0 on one essay but get a perfect multiple-choice section and 6s on the other two, your composite is about 82, which is still in the 5 range. Realistically, one failed essay often pulls a strong exam down to a 4.",
  },
  {
    q: "Is AP Lang or AP Lit easier?",
    a: "Neither is clearly easier. About 74 percent of students earned a 3 or higher on each exam in 2025. Choose based on whether you prefer nonfiction and argument (Lang) or fiction and poetry (Lit).",
  },
  { q: "Is this AP Lang score calculator free, and do I need to sign up?", a: "It is free, and no account is required." },
  { q: "When are AP scores released?", a: "The College Board releases AP scores in July." },
];

// The supplied FAQ schema matches the displayed text, except for these two
// answers ("0-6" with a hyphen; "qualified" without quotes and no "ultimately").
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate my AP Lang score?": "Count your correct multiple-choice answers (out of 45) and add your three essay scores (each 0-6). The multiple-choice total counts as is, the essay total is multiplied by about 3.06, and the sum is your composite out of 100, which maps to an AP score from 1 to 5.",
  "What is a good AP Lang score?": "A 3 is qualified and earns credit at many colleges, while a 4 or 5 opens credit at more selective schools. A good score depends on the AP policies of the colleges you are considering.",
};

const DIST_HEADERS = ["AP score", "2025", "2026"];
const DIST_ROWS = [
  ["5", "13.4%", "15%"],
  ["4", "28.0%", "28%"],
  ["3", "32.8%", "32%"],
  ["2", "16.1%", "15%"],
  ["1", "9.7%", "10%"],
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

export default function ApLangScoreCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is AP Lang, and What Is It For?">
        <P>
          AP Lang is the common name for AP English Language and Composition, a college-level course and exam in the College Board’s Advanced
          Placement program. The course focuses on nonfiction. You read essays, speeches, articles, letters, and other real-world texts, then
          learn how writers use language to inform, persuade, and argue. You also practice making strong arguments of your own.
        </P>
        <P>
          The course has two purposes. In class, it builds the reading and writing skills you will need in college. On exam day, it gives you
          the chance to earn a score from 1 to 5. Many colleges use that score to award credit or placement in a first-year writing course. A 1
          means no recommendation, and a 5 means extremely well qualified. Your “AP Lang score” is that final 1–5 result, built from the
          multiple-choice section and the three essays.
        </P>
      </Card>

      <Card title="Is AP Lang Hard?">
        <P>
          It depends on what you find difficult. AP Lang doesn’t ask you to memorize dates, formulas, or vocabulary lists. It tests skills:
          reading dense nonfiction closely, seeing how a writer builds an argument, and writing clear, well-supported essays under time
          pressure. Students who read and write regularly often find it manageable. Students who rarely write essays usually find the pace and
          the timed writing the hardest parts.
        </P>
        <P>
          The national numbers help put that in perspective. According to the College Board’s{" "}
          <Ext href="https://apstudents.collegeboard.org/about-ap-scores/score-distributions/ap-english-language-and-composition">AP Lang score distribution page</Ext>,
          about 74 percent of students earned a 3 or higher in 2025, and about 75 percent did in 2026. Passing is common, but a 5 takes strong,
          consistent writing. Keep in mind that the 2024 pass rate was much lower, around 55 percent, before the College Board updated its
          scoring standards in 2025. That makes comparisons across years tricky.
        </P>
      </Card>

      <Card title="The Three AP Lang Essays and How They Differ">
        <P>Section II has three questions, and each one asks for a different kind of writing.</P>
        <List items={[
          ["The synthesis essay", "gives you a short set of sources on a single topic. You form your own position and use at least three of the sources to support it. The sources back up your argument; they are not the subject of it."],
          ["The rhetorical analysis essay", "gives you one passage. You explain how the writer’s choices, such as tone, word choice, structure, and evidence, help achieve the writer’s purpose. You are not asked whether you agree with the author."],
          ["The argument essay", "gives you a prompt about a broad issue, often built around a short quote. You take a position and defend it with evidence from your reading, observations, or personal experience. No outside sources are provided."],
        ]} />
        <P>
          The section lasts 2 hours and 15 minutes, including a 15-minute reading period. That leaves about 40 minutes per essay if you split
          your time evenly, which is the pace most students aim for.
        </P>
      </Card>

      <Card title="How to Write an AP Lang Essay">
        <P>
          The same basic process works for all three essays. Read the prompt twice and underline exactly what it asks you to do. Spend three to
          five minutes planning: decide on your thesis and pick the two or three pieces of evidence you will use. Then write a thesis that
          answers the prompt directly, such as a clear position for the argument and synthesis essays or a claim about the writer’s strategy for
          the rhetorical analysis.
        </P>
        <P>
          In each body paragraph, make a point, support it with specific evidence, and then explain how that evidence proves your point. That
          explanation is called commentary, and it is the most important part of your writing. The rubric gives up to four of the six points to
          evidence and commentary, and most low scores come from students who name examples without explaining them. In the conclusion, add one
          last thought about why your argument matters instead of simply repeating your thesis.
        </P>
        <P>
          For the synthesis essay, use your 15-minute reading period to skim every source, choose at least three that fit your position, and
          cite them by source letter or title. Include a point that pushes back on your own view, then explain why you still hold your
          position. For the argument essay, pick examples you know well. A detailed example from history, current events, or your own life
          works better than a vague reference to something you half remember.
        </P>
        <P>
          Strong AP Lang writing is clear, direct, and varied. Use plain words, vary your sentence length, and skip filler. A rigid
          five-paragraph template is fine for practice, but a flexible structure that follows your reasoning usually reads better, and it will
          serve you well in college writing too.
        </P>
      </Card>

      <Card title="AP Lang vs. AP Lit: What’s the Difference?">
        <P>
          AP Lang centers on nonfiction, rhetoric, and argument. You study how real writers persuade, and you practice writing arguments. AP Lit
          centers on fiction, poetry, and drama. You analyze literary works and write about how authors create meaning.
        </P>
        <P>
          Neither is clearly easier. The 2025 results were nearly identical: about 74 percent of students earned a 3 or higher on each exam.
          The better fit depends on your strengths. Students who like debating ideas and analyzing speeches or articles tend to prefer Lang,
          while students who love novels and poetry often prefer Lit. Many schools offer Lang in 11th grade and Lit in 12th. If you are choosing
          an order, Lang is a common first step because its argument and analysis skills carry over to literary writing.
        </P>
      </Card>

      <Card title="Should You Take AP Lang?">
        <H3>AP Lang as a Junior</H3>
        <P>
          Junior year is the most common time to take it. You have had enough writing experience by then, and you will have a score before you
          apply to colleges.
        </P>
        <H3>AP Lang or Honors English 3</H3>
        <P>
          Both are strong options. AP Lang moves faster and puts more weight on timed writing and analysis. Honors English 3 may feel a little
          less intense and can focus more on literature, depending on your school. If you write comfortably and want the chance at college
          credit, AP Lang is worth it. If your writing needs more support, an honors class can build that foundation first. Your English teacher
          or counselor can tell you how your school’s version of each class works.
        </P>
        <H3>AP Lang and APUSH Together</H3>
        <P>
          Many juniors take both, and the two classes support each other. APUSH asks you to read primary sources and build arguments from
          evidence, which is close to the synthesis essay. The workload is the real concern. Both classes involve heavy reading and regular
          essays, so check your schedule honestly before you commit.
        </P>
        <H3>How to Know If You’re Ready</H3>
        <P>
          You are likely ready if you can read a long article without losing the thread, write a clear multi-paragraph argument, and revise your
          work after feedback. A simple test is to write one 40-minute argument essay from a released prompt and have a teacher score it. A 3 or
          4 on the six-point rubric is a good sign that you can build on.
        </P>
        <H3>Does AP Lang Look Good to Colleges?</H3>
        <P>
          Admissions officers generally want to see that you challenged yourself, and AP Lang is a widely recognized rigorous course. Your grade
          in the class and your overall course load matter more than any single AP label, so take it if you can handle it well. A strong score
          can also earn credit or placement in first-year writing, which can save you time and money.
        </P>
      </Card>

      <Card title="How to Use the AP Lang Score Calculator">
        <P>
          Start with Section I. The multiple-choice section has 45 questions and no penalty for wrong answers, so enter the number you answered
          correctly. Next, enter your points for the three free-response questions: the synthesis essay, the rhetorical analysis essay, and the
          argument essay. Each is scored from 0 to 6. If a teacher graded your essays, use those scores. If you graded them yourself, read the
          self-scoring section below first.
        </P>
        <P>
          Once everything is filled in, the AP Lang score calculator weights each section, adds them into a composite, and maps that composite
          to an AP score and recommendation. Because essay scoring involves judgment, try running it three times: once with your own scores,
          once with each essay one point lower, and once with each one point higher. If your AP score stays the same across all three runs,
          trust it. If it swings between a 3 and a 4, you have found exactly where your preparation matters most.
        </P>
      </Card>

      <Card title="How the AP English Language Composite Score Works">
        <P>
          The exam has two sections that are not equally weighted. Section I, multiple choice, runs 60 minutes and counts for 45 percent of your
          exam score. Section II, free response, takes 2 hours and 15 minutes and counts for 55 percent.
        </P>
        <P>The composite formula looks like this:</P>
        <Formula>Composite score = MCQ + (FRQ 1 + FRQ 2 + FRQ 3) × 55 ÷ 18</Formula>
        <P>
          MCQ is your number of correct answers, from 0 to 45. Each FRQ is an essay score from 0 to 6. Each correct multiple-choice answer is
          worth one point, so a perfect section contributes 45. The three essays can total 18 raw points, and multiplying that total by 55/18,
          which is about 3.06, makes the section top out at 55. In practice, every essay point is worth roughly three composite points, while
          every multiple-choice question is worth one. One extra essay point can outweigh three additional correct answers.
        </P>
        <P>
          Here is a worked example. Suppose you answer 32 multiple-choice questions correctly and score 4, 4, and 3 on the essays. Your
          multiple-choice contribution is 32. Your essay total is 11, and 11 × 3.06 is about 34. Your composite is roughly 66, which usually
          falls in the AP score 4 range. Raise that last essay from a 3 to a 4 and your composite climbs to about 69. That is still a 4, but you
          are now about two essay points away from the 5 range.
        </P>
      </Card>

      <Card title="AP Lang Score Ranges: What a 1 to 5 Means">
        <P>
          The College Board does not publish a fixed conversion chart ahead of the exam. Cut scores are set after each exam based on how the
          questions performed and what level of work each score represents, so the boundaries shift from year to year. That is why every
          conversion chart you find online, including the one behind this calculator, is an estimate.
        </P>
        <P>
          As a rough guide, most unofficial estimates put a 5 at about 75 and above, a 4 from about 65 to 74, a 3 from about 50 to 64, a 2 from
          about 35 to 49, and a 1 below that. Each score carries an official label: 5 is extremely well qualified, 4 is well qualified, 3 is
          qualified, 2 is possibly qualified, and 1 is no recommendation.
        </P>
        <P>
          What that means for you depends on your colleges. Many schools grant credit or placement in first-year composition at a 3, while more
          selective ones require a 4 or 5, and some grant no credit for this exam. Always check each college’s published AP policy.
        </P>
      </Card>

      <Card title="AP Lang Score Distribution">
        <P>
          Once you have your estimate, it helps to see how it compares with other students. Here is how test takers scored on the two most
          recent exams, based on College Board data:
        </P>
        <DataTable headers={DIST_HEADERS} rows={DIST_ROWS} />
        <P>
          The 2025 mean score was 3.19, which is noticeably higher than in earlier years, when it hovered around 2.8 to 2.9. A 3 was the most
          common result, and more than four out of ten students earned a 4 or a 5. If your estimate lands in the 3 range, you are right in the
          middle of the national pack. A 4 puts you in the top half of all test takers.
        </P>
      </Card>

      <Card title="Section I: Making Sense of Your Multiple-Choice Total">
        <P>
          The 45 questions split roughly evenly between reading and writing. Reading questions ask about rhetorical situations, claims,
          evidence, reasoning, and the effect of language choices in nonfiction passages. Writing questions ask you to revise a draft for
          clarity, organization, and effectiveness. Since the calculator needs only your count of correct answers, tally them from an answer key
          and enter the total. If your multiple-choice number is strong but your essays are weak, the results show how much ground the
          free-response section can recover, and the reverse is true too.
        </P>
      </Card>

      <Card title="How to Grade Your Own AP Lang Essays">
        <P>
          All three essays use the same six-point rubric, built from three rows. The thesis row is worth 1 point and rewards a defensible
          position that responds to the prompt rather than restating it. The evidence and commentary row is worth up to 4 points and decides
          most scores. Naming an example earns little. You need to select specific evidence and explain how it supports your reasoning,
          consistently across the essay. The sophistication row is worth 1 point for a nuanced understanding of the situation or for especially
          effective prose. Most students should treat it as a bonus rather than a target.
        </P>
        <P>
          To grade your own essay, compare it with the sample responses in the College Board’s released scoring guidelines and assign the score
          of the sample it most resembles. Students tend to be more generous with their own writing than trained readers are, so have a teacher
          or classmate score it too before you enter the number.
        </P>
      </Card>

      <Card title="What Is the Maximum AP Lang Score If You Fail One Essay?">
        <P>
          A bad essay hurts, but it does not end your chances. Say you earn 0 on one essay, which is the lowest possible result and usually
          means a blank or off-topic response. Even with a perfect multiple-choice section and 6s on the other two essays, your composite would
          be 45 plus 12 × 3.06, which is about 82. That is still in the 5 range.
        </P>
        <P>
          A more realistic case is 36 correct multiple-choice answers with scores of 5, 5, and 0. That works out to roughly 67 and lands in the
          4 range. So one weak essay can cost you a 5, but it rarely drops you below a 3 if the rest of your exam is solid. This is also a good
          reason to write something in every essay. Even a short response with a clear thesis can earn a point.
        </P>
      </Card>

      <Card title="When You Need an AP Lang Score Calculator">
        <P>
          The most common use is straight after a practice test. A raw total of 31 correct answers and essay scores of 4, 3, and 4 means little
          on its own. Converted into a composite and an AP score, it tells you whether you are on track. Teachers use the same approach to turn
          a mock exam into feedback students understand instead of a bare percentage.
        </P>
        <P>
          It also helps you decide what to study. Compare two or three practice tests and you can see whether your composite is rising because
          of multiple choice, essays, or both. If you sit just below a score boundary, you will know whether to chase a few more multiple-choice
          answers or one more essay point.
        </P>
        <P>
          Other situations come up too: setting a realistic target before choosing between AP Lang and another course, deciding whether a 4 is
          within reach for college credit, or checking a predicted score before you talk with a parent or counselor. Whatever the reason, an AP
          English Language score calculator replaces guesswork with a number you can act on.
        </P>
      </Card>

      <Card title="How to Prepare for AP Lang">
        <P>
          The best preparation is steady practice with real exam material. Start with the College Board’s{" "}
          <Ext href="https://apcentral.collegeboard.org/pdf/ap-english-language-and-composition-course-and-exam-description.pdf">course and exam description</Ext>,
          which explains the skills, the rubrics, and the question types. Then work through released free-response questions and the matching
          scoring guidelines. Write at least one timed essay a week as the exam gets closer, and read good nonfiction in between, such as
          newspaper opinion pieces, magazine essays, and speeches, so that analyzing an argument becomes a habit.
        </P>
        <H3>Best Books for AP Lang</H3>
        <List items={[
          ["They Say / I Say", "by Gerald Graff and Cathy Birkenstein teaches you how to respond to other writers’ ideas, which is useful for synthesis and argument."],
          ["Thank You for Arguing", "by Jay Heinrichs explains rhetorical techniques in a clear and entertaining way."],
          ["Everything’s an Argument", "by Andrea Lunsford and John Ruszkiewicz is a college-level guide to reading and writing arguments."],
          ["The Language of Composition", "by Renee Shea, Lawrence Scanlon, and Robin Dissin Aufses is a textbook used in many AP Lang classrooms."],
        ]} />
        <H3>Free Video Help</H3>
        <P>
          For video lessons, the College Board’s AP Daily videos walk through each skill, including all three essay types, and they are
          available in AP Classroom and on the AP YouTube channel. Khan Academy offers free English Language lessons and practice. Garden of
          English is a YouTube channel with essay tips for both AP Lang and AP Lit. Use videos to learn a skill, then practice it by writing,
          since watching alone will not improve your essays.
        </P>
      </Card>

      <Card title="Will AP Lang Help With the SAT Essay?">
        <P>
          The old SAT Essay asked students to analyze how an author builds an argument, which is close to the AP Lang rhetorical analysis essay.
          However, the College Board discontinued the SAT Essay, and the digital SAT does not include one. The skills still carry over. Reading
          closely, finding an author’s main claim, and judging how evidence is used all help on the SAT’s Reading and Writing section. And of
          course, they help in every college class that requires writing.
        </P>
      </Card>

      <Card title="Using Your Estimate to Raise Your Score">
        <P>
          Treat the result as a diagnostic. Look at the gap between your composite and the next score band, then turn it into work. Three extra
          correct answers close a three-point gap, and so does a single essay point. For most students the essay route is faster to practice,
          because thesis and commentary habits can improve within weeks.
        </P>
        <P>
          If your essays score below 4, check the thesis first. It is the easiest point to secure, and students often lose it by restating the
          prompt. Then work on commentary, explaining why each piece of evidence matters instead of summarizing it. For multiple choice,
          practice annotating passages, eliminating answers that go beyond the text, and pacing yourself at about 80 seconds per question. Rerun
          the calculator after each practice exam and track the trend. Steady growth matters more than any single result.
        </P>
      </Card>

      <Card title="Common Mistakes to Avoid When Entering Your Scores">
        <P>
          Older practice exams cause the most trouble. Papers released before the 2019 redesign graded essays on a 9-point scale and used a
          different multiple-choice format. Entering those numbers into a calculator built for the current exam inflates your result, so rescore
          old essays against today’s six-point rubric and, where the question count differs, use a recent exam instead. Another slip is entering
          a percentage instead of a count. Type 34, not 75 percent. Finally, don’t award yourself partial points. Rubric scores are whole
          numbers, and rounding up out of hope produces the same inflated estimate you were trying to avoid.
        </P>
      </Card>

      <Card title="How Accurate Is This AP Lang Score Calculator?">
        <P>
          The arithmetic is exact: the sections are weighted the way the College Board weights them. The uncertainty comes from two places.
          First, final cut scores are not published until the exam has been scored, so any conversion is an approximation. Second, essay
          scoring is partly subjective, and your practice scores may run a little higher or lower than what official readers would give.
          Practice exams also vary in difficulty. Read your result as a plausible range, and treat an estimate that lands right on a boundary as
          a coin flip rather than a verdict.
        </P>
      </Card>

      <Card title="Free, Simple, and Private">
        <P>
          The calculator is free, with no hidden charges and no premium tier for the result. You do not need an account to use it, and it never
          asks for your name, school, or other personal details. The only things you enter are your multiple-choice total and three essay
          scores.
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
