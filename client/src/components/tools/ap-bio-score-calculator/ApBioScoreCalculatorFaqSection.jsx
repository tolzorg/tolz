import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my AP Bio score?",
    a: "Add your correct multiple-choice answers to your free-response points scaled by 60 divided by the free-response maximum. The result is your composite score out of 120, which maps to a score from 1 to 5. The calculator does this for you.",
  },
  {
    q: "What composite score do I need for a 5 on AP Biology?",
    a: "Estimates put a 5 at about 93 or higher out of 120, roughly 78% of the available points. The exact cutoff changes each year.",
  },
  {
    q: "Is the AP Bio multiple-choice section worth more than the free-response section?",
    a: "No. Each section counts for 50%. Free-response points are scaled so that section matches the 60 composite points from multiple choice.",
  },
  {
    q: "How many questions are on the AP Biology exam?",
    a: "There are 60 multiple-choice questions and 6 free-response questions: two long questions and four short questions.",
  },
  {
    q: "Is there a penalty for wrong answers on AP Bio?",
    a: "No. You earn a point for each correct multiple-choice answer, and wrong answers don’t subtract points, so you should answer every question.",
  },
  {
    q: "Is a 3 a passing score on AP Bio?",
    a: "A 3 is labeled “qualified” and is generally treated as passing. Whether it earns college credit depends on each college’s policy.",
  },
  {
    q: "What percentage is a low 3 on the AP Bio exam?",
    a: "A low 3 is roughly a composite of 51 to 55 out of 120, or about 43% to 46%. AP scoring is national, so there is no separate scale for New York or any other state.",
  },
  {
    q: "Is AP Bio hard?",
    a: "It’s challenging because of the amount of content and the data-based questions. In 2025, about 70% of students earned a 3 or higher, so students who prepare consistently do well.",
  },
  {
    q: "Can you get a perfect score on the AP Bio multiple-choice section?",
    a: "Yes, answering all 60 questions correctly is possible, and some students do it on practice sets. You don’t need a perfect multiple-choice score to earn a 5, though.",
  },
  {
    q: "Is this AP Bio score calculator accurate?",
    a: "The composite score comes from the points you enter. The 1–5 score is an estimate because the College Board adjusts cutoffs each year, so use it as a guide for planning and tracking progress.",
  },
];

// The supplied FAQ schema matches the displayed text with straight apostrophes,
// except it drops the quotation marks around "qualified" and writes "1-5".
const FAQ_SCHEMA_OVERRIDES = {
  "Is a 3 a passing score on AP Bio?": "A 3 is labeled qualified and is generally treated as passing. Whether it earns college credit depends on each college's policy.",
  "Is this AP Bio score calculator accurate?": "The composite score comes from the points you enter. The 1-5 score is an estimate because the College Board adjusts cutoffs each year, so use it as a guide for planning and tracking progress.",
};
const straight = (s) => s.replace(/’/g, "'");

const CHART_HEADERS = ["AP Score", "Estimated Composite Score", "College Board Recommendation"];
const CHART_ROWS = [
  ["5", "93–120", "Extremely well qualified"],
  ["4", "74–92", "Well qualified"],
  ["3", "51–73", "Qualified"],
  ["2", "28–50", "Possibly qualified"],
  ["1", "0–27", "No recommendation"],
];
const DIST_HEADERS = ["AP Score", "Percent of Students"];
const DIST_ROWS = [["5", "18.8%"], ["4", "24.1%"], ["3", "27.4%"], ["2", "21.1%"], ["1", "8.6%"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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

export default function ApBioScoreCalculatorFaqSection() {
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

      <Card title="What Is the AP Bio Course?">
        <P>
          AP Bio stands for Advanced Placement Biology. It is a college-level biology course offered in high schools, built to match a
          first-year college biology class. The course is organized into eight units, covering topics such as the chemistry of life, cell
          structure and energy, cell communication, heredity, gene expression, natural selection, and ecology. Along the way, students
          practice reading data, designing experiments, and supporting claims with evidence.
        </P>
        <P>
          At the end of the year, students can take the AP Biology exam in May. The exam score is separate from your class grade. Your
          teacher decides your report card grade, while the College Board scores the exam. The calculator on this page estimates the second
          one. You can read the official course outline on the{" "}
          <Ext href="https://apstudents.collegeboard.org/courses/ap-biology">College Board’s AP Biology page</Ext>.
        </P>
      </Card>

      <Card title="AP Biology Exam Format and Scoring Breakdown">
        <P>The exam has two sections of equal weight, and that is what shapes the composite score.</P>
        <P>
          Section I has 60 multiple-choice questions in 90 minutes and counts for 50% of your exam score. Many questions are built around
          data sets, graphs, experimental descriptions, and models, so recall alone isn’t enough.
        </P>
        <P>
          Section II has six free-response questions in 90 minutes and also counts for 50%. Two are long questions, and four are short. The
          long questions focus on interpreting and evaluating experimental results, and one of them involves graphing. The short questions
          cover scientific investigation, conceptual analysis, analysis of a model or visual, and data analysis. Short questions are worth 4
          points each, while the College Board describes the long questions as worth roughly 8 to 10 points each, depending on the exam form.
        </P>
        <P>
          Because the two sections carry the same weight, but the free-response section has fewer raw points, FRQ points are scaled up to
          match the multiple-choice section. That scaling is the most useful fact for planning your study time, and the next section shows
          how it works.
        </P>
      </Card>

      <Card title="How to Calculate Your AP Bio Composite Score by Hand">
        <P>
          Each section is worth 60 composite points, so the maximum composite is 120. The multiple-choice section counts one point per
          correct answer. The free-response section is scaled so its total equals 60.
        </P>
        <Formula>Composite score = multiple-choice correct + (free-response points × 60 ÷ free-response maximum)</Formula>
        <P>
          Many score charts use 36 as the free-response maximum, which makes the multiplier about 1.67 (60 ÷ 36). Because the long questions
          can vary in point value from year to year, the exact multiplier can shift a little.
        </P>
        <P>Here are two worked examples using the 36-point version:</P>
        <List items={[
          ["", "A student answers 42 multiple-choice questions correctly and earns 20 FRQ points. The FRQ contribution is 20 × 60 ÷ 36 = 33.3, so the composite is about 75. That falls in the 4 range."],
          ["", "A student answers 35 correctly and earns 18 FRQ points. The FRQ contribution is 30, so the composite is 65. That falls in the 3 range."],
        ]} />
        <P>
          One more detail: there is no penalty for wrong answers on the multiple-choice section. Your raw score is simply the number you got
          right, so a blank answer never helps you.
        </P>
      </Card>

      <Card title="AP Bio Score Conversion Chart">
        <P>
          The College Board does not publish a fixed conversion table. Cutoffs are set each year after the exam, based on how difficult that
          year’s questions were, so they move slightly from one administration to the next. The chart below shows widely used estimates.
          Treat it as a guide, not an official table.
        </P>
        <DataTable headers={CHART_HEADERS} rows={CHART_ROWS} />
        <P>
          In percentage terms, a 3 starts at roughly 43% of the available composite points, a 4 at about 62%, and a 5 at about 78%. A result
          close to a boundary could go either way on exam day, so if you land within a few points of a cutoff, plan as if you are on the
          lower side.
        </P>
      </Card>

      <Card title="What Each AP Score Means">
        <P>
          The recommendation labels describe how well your performance reflects the work of a comparable introductory college course. A 5 is
          extremely well qualified, a 4 is well qualified, a 3 is qualified, a 2 is possibly qualified, and a 1 means no recommendation.
          These labels are advisory. They don’t decide whether a particular college gives you credit, which is covered below.
        </P>
      </Card>

      <Card title="AP Biology Score Distribution">
        <P>
          Once you have an estimate, it helps to see how other students did. The College Board publishes a score distribution for every AP
          subject each year. Here is the 2025 AP Biology distribution:
        </P>
        <DataTable headers={DIST_HEADERS} rows={DIST_ROWS} />
        <P>
          The mean score was 3.24, and about 70% of students earned a 3 or higher. The most common single result was a 3. These numbers come
          from the College Board’s published data, and you can check newer years on its{" "}
          <Ext href="https://apstudents.collegeboard.org/about-ap-scores/score-distributions/ap-biology">AP Biology score distribution page</Ext>.
          If your estimate is a 3 or above, you’re in the majority. If it’s a 4 or 5, you’re in roughly the top 43%.
        </P>
      </Card>

      <Card title="How Hard Is AP Bio?">
        <P>
          AP Bio is demanding mostly because of volume and application. There is a lot of content, and the exam expects you to use it on
          unfamiliar experiments rather than repeat definitions. Students who do well usually combine steady review with plenty of practice
          reading graphs and writing out explanations.
        </P>
        <P>
          The numbers give some perspective. Fewer than one in ten students earn a 1, and about seven in ten earn a 3 or better. So the exam
          is challenging but very passable for students who prepare. The hardest parts for most people are the free-response section, where
          partial understanding costs rubric points, and data questions that mix several concepts at once.
        </P>
      </Card>

      <Card title="How Hard Was the AP Bio Test in 2024, 2025, and 2026?">
        <P>
          Exam difficulty changes from year to year, and so do the score cutoffs, which is one reason a calculator can only estimate. The 2025
          results were comparatively strong, with a mean of 3.24, and scores were somewhat lower in 2024. For the 2026 exam and later, the
          College Board posts updated distributions every summer. A higher or lower average doesn’t always mean an easier or harder test,
          because it also reflects who took the exam. Students who feel a particular year was difficult can still land in the same score
          range, since cutoffs are adjusted to the exam’s difficulty.
        </P>
      </Card>

      <Card title="Is AP Bio Too Hard for a Freshman?">
        <P>
          It can be done, but it works best for students who are ready for it. AP Bio assumes you can read dense text, handle basic math such
          as percentages, rates, and simple statistics, and write clear explanations. Many schools expect students to have completed a first
          biology course, and some require teacher approval.
        </P>
        <P>
          If you’re a freshman considering it, ask your counselor about prerequisites, talk to the teacher about the weekly workload, and think
          honestly about your schedule. A strong freshman with good study habits can succeed. A freshman who is already stretched across
          several demanding classes may be better off waiting a year.
        </P>
      </Card>

      <Card title="How Fast-Paced Is AP Bio?">
        <P>
          Quite fast. The course covers eight units, and most classes finish the content several weeks before the exam to leave time for
          review. That means new material arrives quickly, often with a quiz or lab report attached. Falling behind in one unit is risky
          because later units build on earlier ones. Cell energy, for example, connects to genetics and evolution. Keeping up week by week is
          much easier than catching up in April.
        </P>
      </Card>

      <Card title="AP Bio or AP Chemistry: Which Should You Take?">
        <P>
          Choose based on your interests and your plans. AP Biology leans toward understanding systems, reading experiments, and writing
          explanations. AP Chemistry leans toward math, problem-solving, and calculation. If you plan to study biology, health, or
          environmental science, AP Bio is usually the more direct fit. If you’re headed toward chemistry, engineering, or chemical
          engineering, AP Chem makes more sense.
        </P>
        <P>
          Many pre-med students eventually take both, but not always in the same year. If you’re only taking one right now, pick the one that
          matches your strengths, since a strong score in the course you enjoy will do more for you than a weak score in the one you thought
          looked more impressive.
        </P>
      </Card>

      <Card title="Is AP Chem Harder Than AP Bio?">
        <P>
          Neither is harder for everyone, because they test different skills. AP Chem students often say the math and problem types are the
          difficulty, while AP Bio students more often point to the amount of material and the free-response writing. If you like memorizing
          and connecting concepts, Bio may feel easier. If you’re comfortable with algebra and enjoy working through multistep problems, Chem
          may feel easier. A good way to decide is to look at a sample question from each course and see which one you’d rather work on.
        </P>
      </Card>

      <Card title="Should I Take AP Bio or AP Environmental Science?">
        <P>
          The two courses overlap in ecology, but they aim at different goals. AP Environmental Science focuses on ecosystems, populations,
          energy, pollution, and the human impact on the environment, with less molecular biology. AP Bio goes deeper into cells, genetics,
          and evolution.
        </P>
        <P>
          If you want a more science-heavy path toward biology or medicine, AP Bio is generally the better choice. If you’re interested in
          environmental topics or want a lighter course load, AP Environmental Science may suit you better. Colleges treat the two differently
          for credit, so if you already know your target schools, check their AP credit policies first.
        </P>
      </Card>

      <Card title="Should I Take AP Bio and AP Physics the Same Year?">
        <P>
          It’s possible, but it’s a heavy combination. Both courses include labs, data analysis, and a steady stream of homework, and AP
          Physics adds a significant amount of math. Students who handle both usually have a lighter load in other classes, strong study
          habits, and some interest in both subjects. If your schedule already includes several advanced courses, spreading the two across
          different years is often the safer choice. Talk with your counselor about which course you’re better prepared for and which one
          helps your goals more.
        </P>
      </Card>

      <Card title="Should I Drop AP Bio?">
        <P>
          This decision depends on your situation, and it shouldn’t be made in a panic. Before dropping, find out the school’s deadline and
          what a drop does to your transcript, since late withdrawals may show on your record. Then ask yourself why you’re struggling. If the
          cause is temporary, such as a rough semester or a missed unit, extra help can solve it. If the course is clearly crowding out other
          priorities or hurting your health, a change might be reasonable.
        </P>
        <P>
          Talk to your teacher and counselor first. Also try the calculator with your most recent practice test. If your estimate is a 2 and
          rising, you may be closer to your goal than it feels.
        </P>
      </Card>

      <Card title="How Do I Stop Failing AP Bio as a Class?">
        <P>
          Start by finding where the points are going. Look at your test scores, labs, and homework separately. If you’re losing points mostly
          on tests, review how you study. If it’s labs and homework, it may be a time-management problem.
        </P>
        <P>From there, a few steps help most students:</P>
        <List items={[
          ["", "Go to office hours and ask the teacher to explain missed questions."],
          ["", "Redo missed test questions without notes, then check the answers."],
          ["", "Study in short sessions across the week rather than the night before."],
          ["", "Use free resources such as Khan Academy’s AP Biology lessons to fill gaps."],
          ["", "Form a small study group so you can explain topics out loud."],
        ]} />
        <P>
          A low class grade doesn’t automatically mean a low exam score. Many students improve once they start practicing the exam’s question
          styles.
        </P>
      </Card>

      <Card title="AP Bio Scores and College Credit">
        <P>
          Credit and placement decisions belong to each college, and policies vary widely. Many colleges award credit or advanced placement
          for a 4 or 5, some accept a 3, and some use AP Biology only for elective credit. Pre-med and life-science majors often face stricter
          rules, and some programs require students to take introductory lab courses regardless of AP results.
        </P>
        <P>
          Check each college’s AP credit policy before building a plan around an estimated score. For instance, if you’re asking whether a 3
          meets the biology requirement at a specific school such as UC Riverside, the answer is on that campus’s published AP credit chart,
          and it can differ by major. Most schools list the minimum score, the credit awarded, and the course it replaces.
        </P>
      </Card>

      <Card title="Is Getting a 4 in AP Bio Impressive Enough for Colleges?">
        <P>
          Yes, a 4 is a strong result. It falls in the “well qualified” range and is accepted for credit at many colleges. In admissions,
          though, your high school grades and the rigor of your courses usually matter more than any single AP score, and most colleges don’t
          require AP scores to decide on your application. A 4 supports your transcript but isn’t something to worry about if you narrowly
          miss a 5. Its bigger value is often in credit and placement once you enroll.
        </P>
      </Card>

      <Card title="When and Why to Use an AP Bio Score Calculator">
        <P>A score estimate is most useful in situations like these:</P>
        <List items={[
          ["After a full practice exam.", "Raw numbers like “44 out of 60” don’t say much. Converting them to a composite and a 1–5 estimate shows where you stand against your goal."],
          ["During FRQ practice.", "Score one or two free-response sets and enter them with your latest multiple-choice results to see how much the written section moves your composite."],
          ["Setting a target.", "If you want a 4, choose a composite goal and work backward to the multiple-choice and FRQ points it requires."],
          ["Deciding where to spend limited time.", "Comparing your two sections makes your weaker one obvious."],
          ["Estimating after the real exam.", "Many students leave the test unsure how it went. Counting the questions you’re confident about and estimating FRQ points gives a rough preview before scores come out, usually in July."],
          ["Supporting teachers and tutors.", "Instructors can convert class practice results into AP-style scores without keeping their own spreadsheet."],
        ]} />
      </Card>

      <Card title="Using Your Results to Improve">
        <P>
          Each FRQ point is worth about 1.67 multiple-choice points under the 36-point version of the formula. Gaining three extra FRQ points
          adds 5 to your composite, about the same as five more multiple-choice questions. For many students, FRQ points are the faster
          gains, because rubric points come from specific, learnable habits.
        </P>
        <P>Several habits raise FRQ scores reliably:</P>
        <List items={[
          ["", "Answer exactly what the prompt asks, using the verb in the question: identify, describe, explain, justify, or predict."],
          ["", "Support claims with evidence from the data you’re given."],
          ["", "Label graph axes with units and use consistent scales."],
          ["", "When designing an experiment, name the independent variable, dependent variable, control group, and what will be measured."],
        ]} />
        <P>
          For multiple choice, practice the question types the course emphasizes: interpreting graphs, spotting experimental flaws, reading
          models, and applying concepts to unfamiliar scenarios. For every missed question, decide whether the problem was missing content
          knowledge or misreading the data, because the fix is different for each.
        </P>
        <P>Run the calculator after each practice test and track the trend. Steady growth is better evidence of progress than a single good result.</P>
      </Card>

      <Card title="How Can You Study for an AP Bio Test?">
        <P>Good preparation combines three things: content review, practice questions, and FRQ writing.</P>
        <List items={[
          ["Review by unit.", "Use your class notes and the course outline to make sure you can explain each unit in plain words."],
          ["Practice under test conditions.", "Do timed multiple-choice sets so graphs and experiment questions feel familiar."],
          ["Write FRQs and score them.", "Compare your answers to official scoring guidelines, and note which rubric points you missed."],
          ["Review mistakes.", "Keep a short list of recurring errors and revisit it weekly."],
          ["Take full practice exams.", "Do at least a couple closer to the exam date, and use the calculator to track your estimate."],
        ]} />
      </Card>

      <Card title="What Are the Best Things to Study for the AP Bio Exam?">
        <P>
          Focus on the topics and skills the exam returns to most often. On the content side, make sure you’re solid on cell structure and
          energy (photosynthesis and cellular respiration), the cell cycle, heredity and Mendelian genetics, gene expression and regulation,
          natural selection and evolution, and ecology. Know the key vocabulary, but also be able to explain how processes connect.
        </P>
        <P>
          On the skills side, practice reading graphs and tables, calculating simple statistics, writing hypotheses, identifying variables and
          controls, and justifying a claim with evidence. These skills show up in both sections, and they’re often what separates a 3 from a 4
          or 5.
        </P>
      </Card>

      <Card title="How Can You Prepare for AP Bio With 2–3 Weeks Left?">
        <P>
          With limited time, be selective. Take a full practice test right away and use the calculator to find your starting point. Then spend
          the first week on your weakest units and the most commonly tested topics. In the second week, shift toward timed practice, doing
          multiple-choice sets and a few FRQs each day. Use the final days for review of your error list and one last practice test.
        </P>
        <P>
          Don’t try to relearn everything. Concentrate on the topics that cost you the most points, and spend time on FRQ habits, since those
          can improve quickly. Sleep and pacing matter more than an extra late-night cram.
        </P>
      </Card>

      <Card title="How Should I Self-Study for AP Bio?">
        <P>
          Self-studying is realistic, but it takes structure. Start with the official course outline so you know the eight units and what is
          tested. Pick one main resource, such as a review book or a free online course, and set a weekly schedule that finishes the material
          a month or two before the exam. Add practice from past College Board free-response questions, which come with scoring guidelines, so
          you can grade yourself honestly.
        </P>
        <P>
          Check with your school about registering for the exam as an outside student, since arrangements and deadlines vary. Labs are part of
          the course, so try to find ways to practice experiment design and data analysis even without a classroom.
        </P>
      </Card>

      <Card title="Are There Any Good AP Bio Forums?">
        <P>
          Yes. Online communities such as the AP Students community on Reddit (r/APStudents) and College Confidential can be useful for study
          tips, resource recommendations, and reactions after the exam. Keep in mind that forum posts are individual opinions. Unofficial score
          predictions and “leaked” cutoffs shouldn’t be treated as facts. For anything official, rely on the College Board and your teacher.
        </P>
      </Card>

      <Card title="How Is the SAT Biology Test Different From the AP Bio Test?">
        <P>
          The SAT Biology Subject Test, including the molecular (M) version, was a one-hour, all multiple-choice exam. The AP exam is three
          hours with both multiple-choice and free-response sections, and it tests analysis and experimental reasoning more deeply. The College
          Board has discontinued SAT Subject Tests in the U.S., so today AP Biology is the main way to show college-level biology achievement
          through the College Board.
        </P>
      </Card>

      <Card title="What to Expect From the AP Bio Test in 2027">
        <P>
          The AP Biology exam is given each May. The College Board has kept the same structure in recent years, with 60 multiple-choice
          questions and 6 free-response questions, but details can change. Check the College Board’s AP calendar and course page for the
          official exam date and format before you register, and rely on your teacher for any updates to the course.
        </P>
      </Card>

      <Card title="Accuracy and Limitations of Score Estimates">
        <P>
          The composite score comes straight from the points you enter and the section weights. The 1–5 conversion is the uncertain part,
          because actual cutoffs change each year and can’t be known in advance.
        </P>
        <P>
          A few other factors affect how much to trust the estimate. Practice exams from different publishers vary in difficulty, so the same
          composite may mean slightly different things on different tests. Self-scored FRQs tend to run high. And a section taken in a relaxed
          setting may overstate what you would score under real time pressure.
        </P>
        <P>Treat the output as a planning tool. If your estimate sits within a few points of a cutoff, prepare as if you are on the lower side.</P>
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
