import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the IELTS overall band score calculated?",
    a: "It is the average of your Listening, Reading, Writing, and Speaking bands, rounded to the nearest half or whole band. Averages ending in .25 round up to the next half band, and those ending in .75 round up to the next whole band.",
  },
  { q: "Is this IELTS score calculator free?", a: "Yes. You can use it as often as you like at no cost." },
  {
    q: "Does the calculator work for Academic and General Training?",
    a: "The overall average works the same way for both. The raw-score conversion for Reading differs between the two versions, so use the table that matches your test.",
  },
  {
    q: "How many correct answers do I need for Band 7 in Listening?",
    a: "Around 30 out of 40 correct answers typically corresponds to Band 7.0. The exact threshold can vary slightly between test versions.",
  },
  {
    q: "What is a good IELTS score?",
    a: "It depends on your goal. Many universities ask for 6.0 to 7.0 overall, while competitive programs may ask for higher. Always check the specific requirement.",
  },
  {
    q: "What is the highest score in IELTS?",
    a: "The highest band is 9.0, both for each skill and overall. A perfect 9.0 in every skill is rare.",
  },
  {
    q: "Which is easier, IELTS Academic or General Training?",
    a: "Neither is easier for everyone. General Training texts are simpler, but you need more correct answers for the same Reading band. Choose the version your institution or immigration authority requires.",
  },
  {
    q: "How long should I prepare for the IELTS?",
    a: "It depends on your level and target. If you are close to your target, a month may be enough. Most people benefit from about two months, and larger score gains can take three months or more.",
  },
  {
    q: "Can I pass the IELTS without coaching?",
    a: "Yes. With official practice tests, timed practice, and feedback on Writing and Speaking, many people succeed through self-study.",
  },
  {
    q: "How long is an IELTS score valid?",
    a: "Results are generally considered valid for two years from the test date, but each institution decides what it will accept.",
  },
  {
    q: "Can I immigrate to Canada without IELTS?",
    a: "Yes, in many cases. Canada accepts other approved language tests, but most economic programs still require proof of English.",
  },
  {
    q: "Is IELTS or PTE easier?",
    a: "It depends on your strengths. PTE is fully computer-based with automated scoring, while IELTS includes a live conversation with an examiner. Pick the one that suits your style and is accepted by your institution.",
  },
  {
    q: "How accurate is the raw-score conversion?",
    a: "It reflects commonly published conversion tables and is a good estimate. Official conversions vary slightly by test, so your real band may differ by half a band at boundaries.",
  },
  {
    q: "Is an IELTS calculator result the same as my official score?",
    a: "No. It is a reliable estimate for planning. Only your Test Report Form issued by an authorized test center is official.",
  },
];

// The supplied FAQ schema matches the displayed text, except the first answer
// drops one serial comma ("Writing and Speaking").
const FAQ_SCHEMA_OVERRIDES = {
  "How is the IELTS overall band score calculated?": "It is the average of your Listening, Reading, Writing and Speaking bands, rounded to the nearest half or whole band. Averages ending in .25 round up to the next half band, and those ending in .75 round up to the next whole band.",
};

const RAW_HEADERS = ["Band", "Listening", "Academic Reading", "General Training Reading"];
const RAW_ROWS = [
  ["9.0", "39–40", "39–40", "40"],
  ["8.5", "37–38", "37–38", "39"],
  ["8.0", "35–36", "35–36", "37–38"],
  ["7.5", "32–34", "33–34", "36"],
  ["7.0", "30–31", "30–32", "34–35"],
  ["6.5", "26–29", "27–29", "32–33"],
  ["6.0", "23–25", "23–26", "30–31"],
  ["5.5", "18–22", "19–22", "27–29"],
  ["5.0", "16–17", "15–18", "23–26"],
  ["4.5", "13–15", "13–14", "19–22"],
  ["4.0", "11–12", "10–12", "15–18"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 420 }}>
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

export default function IeltsScoreCalculatorFaqSection() {
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

      <Card title="What Is the IELTS Exam and Why Do People Take It?">
        <P>
          IELTS stands for International English Language Testing System. It is jointly owned by the British Council, IDP Education, and
          Cambridge University Press &amp; Assessment. The test measures how well you can use English in real situations, and the result is
          accepted as proof of English ability by thousands of universities, employers, professional bodies, and government agencies. You
          can browse the full list of organizations on the{" "}
          <Ext href="https://www.ielts.org/en-us/about-ielts/who-accepts-ielts-scores">official IELTS website</Ext>.
        </P>
        <P>
          People take IELTS for three main reasons: to study at an English-speaking university, to work in a job or profession that
          requires proof of English, or to apply for a visa or permanent residency. A single result can be sent to many institutions, which
          is why it is so widely used. Even if you are not sure which school or country you will choose, a good score keeps your options
          open.
        </P>
        <P>
          IELTS also helps you see where your English stands. The four separate skill scores show which area is strong and which one needs
          work, and that information is useful long before you submit an application.
        </P>
      </Card>

      <Card title="What Does the IELTS Test Consist Of?">
        <P>The test has four parts, and you take all of them in one sitting, except that the Speaking test may be scheduled on a different day.</P>
        <List items={[
          ["Listening (about 30 minutes):", "You hear four recordings and answer 40 questions. On the paper-based test, you get 10 extra minutes to copy your answers to the answer sheet."],
          ["Reading (60 minutes):", "You read three long texts and answer 40 questions. The texts are different for the Academic and General Training versions."],
          ["Writing (60 minutes):", "You complete two tasks. Task 1 is a short report (Academic) or a letter (General Training). Task 2 is an essay."],
          ["Speaking (11 to 14 minutes):", "You have a face-to-face conversation with a trained examiner in three parts: a short introduction, a talk on a topic card, and a deeper discussion."],
        ]} />
        <P>
          In total, the Listening, Reading, and Writing sections take about two hours and 45 minutes. Each skill earns a band score from 0 to
          9, in whole or half bands. The four scores are averaged to produce your overall band, which is where the calculator comes in.
        </P>
      </Card>

      <Card title="How the IELTS Score Calculator Works">
        <P>
          The tool does three jobs. First, it calculates your overall band from four inputs: Listening, Reading, Writing, and Speaking.
          Second, it works backward from a target, so you can enter the bands you already have and see what is needed in the rest. Third, it
          converts raw scores, meaning the number of correct answers out of 40 in Listening and Reading, into band scores.
        </P>
        <P>
          Most people use it in order. Count your correct answers on a practice test, convert them to bands, add your Writing and Speaking
          estimates, and read the overall result. Because the calculator uses the standard rounding convention, the number you see should
          match how an official Test Report Form is averaged.
        </P>
      </Card>

      <Card title="How Your Overall IELTS Band Score Is Calculated">
        <P>
          Your overall band is the average of the four skill bands, rounded to the nearest half or whole band. The rounding rule is where
          people most often make mistakes:
        </P>
        <List items={[
          ["", "An average ending in .25 rounds up to the next half band."],
          ["", "An average ending in .75 rounds up to the next whole band."],
          ["", "Other averages round to the nearest half or whole band."],
        ]} />
        <P>
          For example, Listening 7.0, Reading 6.5, Writing 6.0, and Speaking 6.5 add up to 26.0. Divided by four, that is 6.5, so your
          overall band is 6.5. Change Speaking to 7.0 and the total becomes 26.5, an average of 6.625, which still rounds to 6.5. Raise
          Writing to 6.5 as well and the total is 27.0, an average of 6.75, which rounds up to 7.0.
        </P>
        <P>
          The overall band counts all four skills equally. A weak Writing score can’t be hidden behind a strong Listening score, and rounding
          can work for you or against you depending on where your average lands.
        </P>
      </Card>

      <Card title="Convert IELTS Listening and Reading Raw Scores to Band Scores">
        <P>
          Listening and Reading each have 40 questions, and each correct answer earns one mark. Your raw score is then converted to a band.
          There is no fixed formula, and the tables vary slightly from one test version to the next. Academic Reading and General Training
          Reading also use different tables. General Training needs more correct answers for the same band because its texts are generally
          easier.
        </P>
        <P>The table below shows the commonly published conversions:</P>
        <DataTable headers={RAW_HEADERS} rows={RAW_ROWS} />
        <P>
          Treat these as estimates. Your official band depends on the exact paper you sit. If your practice score falls right on the edge of
          a band, give yourself a safety margin when you set goals.
        </P>
        <P>Speaking and Writing have no raw scores. They are graded by examiners, which is covered below.</P>
      </Card>

      <Card title="Which Is Easier: IELTS Academic or IELTS General Training?">
        <P>Both versions share the same Listening and Speaking tests. The difference is in Reading and Writing.</P>
        <P>
          Academic Reading uses texts taken from books, journals, and magazines, and the vocabulary can be more demanding. Academic Writing
          Task 1 asks you to describe a chart, graph, table, map, or process. General Training Reading uses everyday material such as
          notices, advertisements, and work-related documents. General Training Writing Task 1 is a letter, and Task 2 is an essay, with a
          slightly less formal tone than the Academic version.
        </P>
        <P>
          Many people assume General Training is easier because the texts are simpler. The scoring cancels part of that advantage, though,
          because you need more correct answers for the same band, as the table shows. The better question is which version fits your goal.
          Universities generally ask for Academic. Work and migration purposes often ask for General Training. Check what your institution
          or immigration authority requires before you register.
        </P>
      </Card>

      <Card title="Find the Score You Need for a Target Overall Band">
        <P>
          The target feature answers a practical question: “I need 7.0 overall. What do I need in Writing?” Enter the bands you already have,
          or expect to have, and the calculator shows the average you must reach and what the missing skill needs to be.
        </P>
        <P>
          This depends on how rounding works. To land on an overall 7.0, your four bands must average at least 6.75, which means a total of
          27.0 or more. If you have Listening 7.5, Reading 7.0, and Speaking 6.5, your total so far is 21.0, so Writing must be at least 6.0
          to reach 27.0.
        </P>
        <P>
          Some targets have more than one route. A 7.0 overall can come from four 7.0s, or from 8.0 in Listening and Reading balanced by 6.0
          in Writing and Speaking. Knowing the options helps you decide where your study time will pay off most.
        </P>
        <P>
          Many institutions also set a minimum score for each skill, which a simple average ignores. A 7.0 overall with 5.5 in Writing can
          still fail a “no band below 6.0” rule. Check the requirement on the institution’s website and compare your result against both the
          overall rule and the per-skill rule.
        </P>
      </Card>

      <Card title="How Writing and Speaking Bands Are Determined">
        <P>
          Listening and Reading are marked against an answer key. Writing and Speaking are judged by trained examiners using published band
          descriptors, which makes them harder to score yourself.
        </P>
        <P>
          Writing has two tasks, and Task 2 counts for roughly twice as much as Task 1. Each task is assessed on four criteria: Task
          Achievement (Task 1) or Task Response (Task 2), Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. These
          combine into one Writing band.
        </P>
        <P>
          Speaking is assessed across all three parts of the interview on Fluency and Coherence, Lexical Resource, Grammatical Range and
          Accuracy, and Pronunciation. Each criterion carries equal weight.
        </P>
        <P>
          Because these two bands involve judgment, estimate them conservatively. If a teacher or a qualified marker has graded your work,
          use that score. If you are grading yourself, enter a number slightly lower than you hope for. An optimistic input will give you an
          optimistic result.
        </P>
      </Card>

      <Card title="IELTS Band Scale: What Is a Good IELTS Score?">
        <P>Once you have your overall band, it helps to know what it means. The scale runs from 0 to 9, and each level describes a type of English user:</P>
        <List items={[
          ["Band 9, Expert user:", "Fully operational command of English. Use is accurate, fluent, and appropriate, with complete understanding."],
          ["Band 8, Very good user:", "Fully operational command with only occasional unsystematic mistakes. May misunderstand things in unfamiliar situations but handles complex arguments well."],
          ["Band 7, Good user:", "Operational command with some inaccuracies and misunderstandings in certain situations. Generally handles complex language and detailed reasoning well."],
          ["Band 6, Competent user:", "Effective command despite some errors. Can use and understand fairly complex language, especially in familiar situations."],
          ["Band 5, Modest user:", "Partial command. Copes with overall meaning in most situations but makes many mistakes."],
          ["Band 4, Limited user:", "Basic competence limited to familiar situations, with frequent problems in understanding and expression."],
          ["Band 3 and below:", "Extremely limited ability to communicate, with frequent breakdowns, down to Band 0 for a test taker who did not attempt the test."],
        ]} />
        <P>
          So what counts as a good score? It depends on your goal. Many universities ask for 6.0 to 7.0 overall, and highly competitive
          programs and some professions ask for 7.0 or higher. A “good” score is the one that meets your requirement with a little room to
          spare.
        </P>
      </Card>

      <Card title="Is the IELTS Difficult? Can You Score All 9s?">
        <P>
          Whether IELTS is difficult depends on your current English level and how familiar you are with the format. The language itself is
          not unusual, but the test is timed, the questions are designed to catch careless reading, and Writing and Speaking require you to
          produce English on demand. Many strong English speakers lose points because they have never practiced the question types or
          managed their time.
        </P>
        <P>
          The highest possible score is 9.0, both overall and in each skill. It is achievable, but it is rare, and it takes consistent
          accuracy across every section. Reaching a 9 in a single skill, especially Listening or Reading, is more common than a perfect 9.0
          overall, because Writing and Speaking leave less room for a flawless performance. Most test takers should aim for the band their
          goal requires, not for a perfect score.
        </P>
      </Card>

      <Card title="When You Need an IELTS Band Score Calculator">
        <P>The calculator is most useful in a few common situations:</P>
        <List items={[
          ["After a mock test.", "You have four rough scores and want to know if you are on track before booking the real exam."],
          ["Planning a retake.", "You scored 6.5 overall but need 7.0. The tool shows which skill to lift and by how much."],
          ["Checking a test report.", "If you want to confirm that rounding was applied correctly, you can recompute it yourself."],
          ["University and visa applications.", "Programs and immigration routes set minimum overall and per-skill scores, so you can test different combinations before committing."],
          ["Teachers and coaches.", "Tutors can show students how one weak skill drags down the average."],
          ["Setting a study plan.", "Working backward from a target tells you where improvement is cheapest."],
        ]} />
      </Card>

      <Card title="IELTS Score Requirements for Study, Work, and Immigration">
        <P>Requirements change often and vary by institution, so treat the following as general guidance and confirm the current figures before you apply.</P>
        <Lead lead="Universities.">
          Most undergraduate programs ask for about 6.0 to 6.5 overall, and many graduate programs ask for 6.5 to 7.5. Medicine, law, and
          nursing programs often set higher minimums, and many programs add a minimum for each skill. Some universities waive the requirement
          if you studied in English or hold a degree from an English-speaking country, and some accept other tests such as TOEFL, <Link to="/tools/pte-score-calculator" className="inline-home-link">PTE</Link>, or
          Duolingo instead. Check each school’s admissions page.
        </Lead>
        <Lead lead="Canada.">
          Canada’s immigration programs measure English with Canadian Language Benchmark (CLB) levels. For Express Entry, you need to take
          IELTS General Training. The Federal Skilled Worker Program asks for CLB 7 at minimum, which corresponds to roughly 6.0 in Listening,
          6.0 in Reading, 6.5 in Writing, and 6.0 in Speaking. Higher bands earn more points toward your ranking. Canada also accepts other
          approved tests, so IELTS is not the only route. Check the official Immigration, Refugees and Citizenship Canada site for the current
          rules and point values.
        </Lead>
        <Lead lead="United Kingdom.">
          UK visa routes set English requirements using the CEFR scale, and the level depends on the visa type. For visa purposes, you usually
          must take IELTS for UKVI at an approved center, not a standard IELTS test. Universities also set their own minimums for admission.
        </Lead>
        <Lead lead="Australia.">
          Skilled migration awards points based on English level. Bands of 6.0 in each skill count as competent English, 7.0 as proficient,
          and 8.0 as superior, with higher levels earning more points. Student visas and individual universities have their own requirements.
        </Lead>
        <Lead lead="United States.">
          There is no single national IELTS requirement. Most U.S. immigration categories do not require IELTS at all, and each university
          sets its own minimum, commonly between 6.5 and 7.0 for graduate programs. Many U.S. schools also accept TOEFL or Duolingo.
        </Lead>
        <P>
          Is it possible to immigrate to Canada without IELTS? Yes, because other approved tests, such as CELPIP and PTE, are accepted for many
          Canadian programs. A language test is still required for most economic programs, so you can’t skip proof of English altogether.
        </P>
      </Card>

      <Card title="How Long Is an IELTS Score Valid, and What Happens After the Test?">
        <P>
          IELTS results are generally considered valid for two years from the test date. Institutions and immigration authorities decide
          whether they accept an older result, and some require a newer one, so check before you apply.
        </P>
        <P>
          After you take the test, you receive an online result. Results for the computer-delivered test often arrive within a few days, and
          results for the paper-based test usually take about two weeks. Your Test Report Form lists your band for each skill and your overall
          band. You can send your results electronically to institutions, and test centers handle the process. Once you have the score you
          need, the next step is to submit it with your application.
        </P>
      </Card>

      <Card title="How Can I Get a High Score in the IELTS?">
        <P>A high score usually comes from preparation that is specific to the test. A few habits make the biggest difference:</P>
        <List items={[
          ["Know the format cold.", "Learn every question type in Listening and Reading so nothing is a surprise on test day."],
          ["Practice under time pressure.", "Many people understand the material but run out of time. Take full timed practice tests regularly."],
          ["Study the band descriptors.", "The official descriptors for Writing and Speaking tell you exactly what examiners look for."],
          ["Review your mistakes.", "After every practice test, find out why you lost each mark, then fix that specific problem."],
          ["Get outside feedback.", "You can’t judge your own Writing or Speaking objectively, so have a teacher or experienced marker review your work."],
        ]} />
      </Card>

      <Card title="How Do I Score 7.5 or 8.0 in the IELTS?">
        <P>Moving from the 6s to 7.5 or 8.0 is less about new knowledge and more about accuracy and range.</P>
        <P>
          In Listening and Reading, you need about 33 to 36 correct answers out of 40. That means very few careless errors, so focus on
          spelling, plural forms, word limits, and reading instructions carefully. In Writing, higher bands require a clear position,
          well-developed ideas with specific support, natural linking, a wide range of vocabulary used accurately, and a mix of complex and
          simple <Link to="/tools/sentence-counter" className="inline-home-link">sentences</Link> with few errors. In Speaking, aim for fluent, relaxed answers that go beyond one-sentence replies, using precise
          vocabulary and natural expressions without sounding memorized.
        </P>
        <P>Don’t memorize model answers. Examiners are trained to spot prepared scripts, and they score them lower.</P>
      </Card>

      <Card title="How Long Does It Take to Prepare for the IELTS?">
        <P>The right amount of time depends on your starting level and your target. As a rough guide:</P>
        <List items={[
          ["One week:", "Only realistic if your English is already strong. Focus on learning the format, taking one or two full practice tests, and fixing your most obvious weaknesses. Don’t expect to raise your level much."],
          ["One month:", "Enough to improve your technique if your level is already close to your target. Practice a bit every day, take weekly timed tests, and get feedback on your Writing and Speaking."],
          ["Two months:", "A solid plan for most people. Spend the first weeks building the weakest skill, then shift to full practice tests and timed Writing in the last weeks."],
          ["Three months or more:", "Better if you need to raise your overall band by a full point or more, since real improvement in English takes time."],
        ]} />
        <P>
          Use the calculator at the start to see the gap between your current level and your target. A small gap needs weeks, and a large one
          may need several months.
        </P>
      </Card>

      <Card title="What Is the Best Way to Prepare for the IELTS?">
        <P>
          Start with a diagnostic test under real conditions. Score it, enter the results into the calculator, and see which skill is pulling
          your average down. Then build a weekly plan that gives the most time to your weakest skill and keeps the others active.
        </P>
        <P>
          A good routine has four parts: learn the format and strategy, practice each skill separately, take full timed tests, and review your
          errors. Keep a notebook of mistakes, new vocabulary, and useful phrases. Practice at home by setting a timer, using real test papers,
          and following the actual test rules, such as no pausing the audio and no dictionary.
        </P>
      </Card>

      <Card title="How Can I Prepare for the IELTS for Free?">
        <P>
          You can build a strong study plan without spending much. The British Council and IDP both publish free practice materials, sample
          tests, and tips on their official sites. For listening practice, use podcasts, news broadcasts, and talks in English, including BBC
          programs and TED talks. For reading, read newspapers, magazines, and long articles on science, society, and education. Many free
          practice tests are also available online. Be careful with unofficial sources, because their questions are sometimes less accurate
          than the real test.
        </P>
      </Card>

      <Card title="Can I Crack the IELTS Without Coaching?">
        <P>
          Yes. Many people reach their target using self-study alone, particularly if their English is already good and they are disciplined.
          What you need is official practice material, a timed practice routine, and a way to get your Writing and Speaking checked.
        </P>
        <P>
          Coaching is most useful when you are stuck, when you need a big score jump, or when you want regular feedback on Writing and
          Speaking. If you decide to join a class, whether online or in person, look for qualified instructors with real IELTS experience,
          personalized feedback on your essays and speaking, full mock tests, and a clear refund or trial policy. This applies in any country,
          including India, Pakistan, and Bangladesh, where there are many choices. Compare a few options and read recent reviews before you
          pay.
        </P>
      </Card>

      <Card title="Best Books, Websites, Apps, and YouTube Channels for IELTS Preparation">
        <H3>Books</H3>
        <List items={[
          ["Cambridge IELTS series (Cambridge University Press & Assessment).", "Each volume has four real past-style tests for Academic and General Training, with answer keys, Listening audio, and sample Writing answers. Start with the most recent volumes, then work backward."],
          ["The Official Cambridge Guide to IELTS (Pauline Cullen, Amanda French, Vanessa Jakeman).", "It covers all four skills with strategy, practice, and a test-style walkthrough."],
          ["Official IELTS Practice Materials (IELTS partners: British Council, IDP, Cambridge).", "Extra full practice tests from the test owners."],
          ["Vocabulary for IELTS and Grammar for IELTS (Cambridge).", "Good for targeted skill-building once you know your weak areas."],
        ]} />
        <H3>Websites</H3>
        <List items={[
          ["ielts.org.", "The official source for test format, band descriptors, and sample questions."],
          ["British Council (takeielts.britishcouncil.org / LearnEnglish).", "Free practice tasks, tips, and paid online practice tests."],
          ["IDP IELTS (ielts.idp.com).", "Free sample tests, preparation guides, and webinars."],
          ["IELTS Liz and IELTS Advantage.", "Popular free sites with lessons, model answers, and tips for each skill. Check their advice against the official band descriptors."],
        ]} />
        <H3>YouTube</H3>
        <List items={[
          ["IELTS Liz.", "Clear lessons on Speaking, Writing, Reading, and Listening question types."],
          ["E2 IELTS.", "Detailed Writing and Speaking breakdowns with worked examples."],
          ["IELTS Advantage.", "Strategy-focused videos on all four sections."],
          ["IDP IELTS and British Council IELTS.", "Official channels with test-day guidance and sample Speaking interviews."],
        ]} />
        <H3>Apps</H3>
        <List items={[
          ["British Council IELTS Prep.", "Practice questions, tips, and mock-style tasks from an official partner."],
          ["IDP IELTS Prep tools.", "Practice material and test information from IDP."],
          ["Cambridge Dictionary.", "Useful for checking word meanings, collocations, and pronunciation."],
          ["Anki or Quizlet.", "For building and reviewing your own IELTS vocabulary decks."],
        ]} />
        <P>
          Apps are best for short daily practice, such as vocabulary and listening drills. They don’t replace full timed practice tests, so
          complete at least a few Cambridge tests under exam conditions before test day. App names and features change, so check the current
          listings in your app store.
        </P>
      </Card>

      <Card title="How Do I Improve My IELTS Listening?">
        <P>
          Listen to English every day, using varied accents such as British, Australian, American, and Canadian, because the test uses all of
          them. In practice, read the questions before the audio starts, underline keywords, and predict what type of answer you need.
          Remember that you hear the audio only once. Write answers as you listen, check spelling carefully, and watch for distractors, where a
          speaker changes or corrects an answer. Review every wrong answer by listening again with the transcript.
        </P>
      </Card>

      <Card title="How Do I Improve Reading Skills for IELTS?">
        <P>
          Build your reading speed and accuracy together. Read a variety of long English texts every day, and then practice timed passages of
          about 20 minutes each. Learn to skim for the main idea, scan for names, dates, and numbers, and match paraphrased wording, since the
          questions rarely use the exact <Link to="/tools/word-counter" className="inline-home-link">words</Link> from the text. Don’t spend too long on one question. Skip it and return later.
        </P>
        <P>
          A few tips for specific question types: True/False/Not Given questions require you to decide whether the text states something,
          contradicts it, or doesn’t mention it, so avoid using your own knowledge. For matching headings, read the first and last sentences of
          each paragraph. Always follow the word limit in the instructions.
        </P>
      </Card>

      <Card title="What Is the Best Way to Write for IELTS?">
        <P>
          Plan before you write. Spend two to five minutes outlining your main points. In Task 1, describe the key features and trends without
          adding opinions, and include an overview. In Task 2, answer the question directly, state your position clearly, and support each
          main idea with an explanation or example.
        </P>
        <P>
          Manage your time: about 20 minutes for Task 1 and 40 minutes for Task 2, since Task 2 is worth more. Aim for natural, accurate
          language over rare vocabulary used incorrectly. Leave a couple of minutes at the end to check grammar and spelling.
        </P>
        <H3>How Do I Get My IELTS Writing Checked Online?</H3>
        <P>
          You can send your essays to a teacher or a tutor for detailed feedback against the four criteria. There are also online writing
          correction services, some of them free, though the quality and depth of feedback vary. Free services are fine for catching basic
          errors, but a trained marker is better for working out your actual band. Whatever you use, ask for feedback by criterion so you know
          exactly what to fix.
        </P>
      </Card>

      <Card title="How Can I Prepare for the IELTS Speaking Test?">
        <P>
          Practice speaking out loud, since reading about speaking won’t build fluency. Record yourself answering practice questions, then
          listen for pauses, repeated words, and pronunciation problems. Practice with a partner or teacher if you can.
        </P>
        <P>
          Common topics include your hometown, work or studies, family, hobbies, food, travel, technology, books, and free time. In Part 2,
          practice talking for the full one to two minutes on a topic card, using the one minute of preparation time to jot down key points.
          In Part 3, give extended, reasoned answers rather than one-word replies. If you don’t know a word, explain it in other words instead
          of stopping.
        </P>
      </Card>

      <Card title="How Do I Improve Vocabulary and Grammar for IELTS?">
        <P>
          For vocabulary, learn words in context and in groups of related phrases, not as isolated lists. Keep a notebook of new words from
          your reading and listening, and use each one in a sentence of your own. Topic vocabulary for education, health, environment,
          technology, and work comes up often in Writing and Speaking. Accuracy matters more than rarity, so choose words you can use
          correctly.
        </P>
        <P>
          For grammar, focus on the areas that cost the most marks: verb tenses, subject-verb agreement, articles, prepositions, and complex
          sentences. Write short practice paragraphs, then check them against a grammar guide or have them corrected. Aim for a mix of simple
          and complex structures with few errors.
        </P>
      </Card>

      <Card title="IELTS vs. PTE vs. TOEFL vs. Duolingo: Which Is Easier?">
        <P>No test is easier for everyone, because each one rewards different strengths.</P>
        <Lead lead="IELTS vs. PTE.">
          PTE Academic is taken entirely on a computer, including Speaking, which you record by speaking into a microphone. It is scored by an
          automated system, and results often come back within a couple of days. IELTS has a live conversation with a human examiner and
          offers both paper and computer formats. People who are comfortable with computers and prefer not to speak to an examiner often like
          PTE, and people who prefer human interaction often like IELTS.
        </Lead>
        <Lead lead="IELTS vs. TOEFL.">
          TOEFL is an alternative accepted mainly by universities, especially in North America. Its format and scoring have been updated
          recently, so check the current comparison on the official TOEFL site before converting any scores. If you are choosing between them,
          confirm which test your institution accepts.
        </Lead>
        <Lead lead="IELTS vs. Duolingo.">
          The Duolingo English Test is shorter and taken online, and many universities accept it. Immigration authorities generally do not
          accept it, so IELTS is safer if migration is your goal.
        </Lead>
        <Lead lead="GRE and GMAT.">
          These are different kinds of tests. They are admission tests for graduate and business schools, measuring reasoning and academic
          skills, not English proficiency. Some applicants need both an English test and one of these.
        </Lead>
        <P>The best choice is the test your target institution or authority accepts, and the one where your skills show best.</P>
      </Card>

      <Card title="Where to Take the IELTS Exam">
        <P>
          Register only through official channels, either the <Ext href="https://takeielts.britishcouncil.org/">British Council</Ext> or IDP,
          or an authorized test center they list. When choosing a center, compare the location, the available dates, whether it offers
          computer-delivered or paper-based testing, and when the Speaking test is scheduled. Avoid unofficial agents who promise guaranteed
          scores or special access, because there is no legitimate way to guarantee a result.
        </P>
      </Card>

      <Card title="Accuracy, Privacy, and Free Use">
        <P>
          The IELTS score calculator follows the standard averaging and rounding method used on test report forms, so overall scores
          calculated from your four bands should match the official method. The raw-score conversion is an estimate based on commonly
          published tables, because the official conversion varies from one test to another.
        </P>
        <P>
          The calculator is free to use, with no payment step and no hidden charges. It only needs your band scores or correct-answer counts,
          and it never asks for your name, test registration number, or any identity details. If you are on a shared device, close the tab
          when you are done.
        </P>
        <P>Treat every result as a planning guide. Only your official Test Report Form from an authorized test center confirms your score.</P>
      </Card>

      <Card title="Use Your Result to Improve">
        <P>
          A result is only useful if it changes what you do next. If one skill sits more than a full band below the others, it is usually your
          best investment. Raising Writing from 5.5 to 6.5 adds 1.0 to your total, which lifts your average by 0.25 and can move your overall
          score up by half a band.
        </P>
        <P>
          For Listening and Reading, check how many correct answers you are from the next band. The gap is often only two or three questions,
          which is a matter of timing and technique, not new knowledge. For Writing and Speaking, get feedback from a trained marker or
          teacher.
        </P>
        <P>
          Re-run the calculator after each mock test. Watching your overall band move over several weeks is a more reliable gauge of readiness
          than any single practice result.
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
