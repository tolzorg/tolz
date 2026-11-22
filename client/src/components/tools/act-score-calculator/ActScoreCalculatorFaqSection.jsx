import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my ACT score?", a: "Count the questions you answered correctly in English, Math, Reading and Science, enter those raw scores into the ACT score calculator, and it converts each one to a 1–36 section score. Your composite is the average of those section scores, rounded to the nearest whole number." },
  { q: "What is a good ACT score?", a: "A composite above 24 is generally considered good, and 30 or higher is excellent. The score you need depends on the middle-50% range at your target colleges and any scholarship cutoffs." },
  { q: "What is the average ACT score?", a: "The national average composite is usually around 19 to 20. First-time test-takers tend to score a bit below students who retest." },
  { q: "What is the lowest and highest ACT score?", a: "The lowest section or composite score is 1 and the highest is 36. There is no 37." },
  { q: "How is the ACT composite score calculated?", a: "In the traditional format, add your four section scores, divide by four and round to the nearest whole number. In the enhanced format, the composite averages only English, Math and Reading. A decimal of .5 or above rounds up." },
  { q: "What is a raw score on the ACT?", a: "It’s the number of questions you answered correctly in a section. There’s no penalty for wrong answers, so you simply count the right ones before converting to the 1–36 scale." },
  { q: "Is there a penalty for guessing on the ACT?", a: "No. Incorrect and blank answers both count as zero, so you should answer every question." },
  { q: "What ACT percentile is a 30?", a: "A composite of 30 generally falls in the mid-90s percentile range. Exact figures shift slightly each year." },
  { q: "What ACT score do you need to get into Harvard?", a: "Applicants who submit scores typically fall between 34 and 36. No score guarantees admission, since schools review grades, essays and activities too." },
  { q: "What ACT score gets you a full ride?", a: "There’s no single number. Many full-tuition merit scholarships ask for a composite of 30 or higher plus a strong GPA, but requirements vary by school and award." },
  { q: "Is the ACT harder than the SAT?", a: "Neither is harder overall. The ACT has a quicker pace, while the SAT leans toward deeper problem-solving. Take a practice test in each format and compare your percentiles." },
  { q: "How many times can you take the ACT?", a: "You can generally test on each national date, though ACT, Inc. has set a lifetime limit on attempts. Check act.org for the current policy." },
  { q: "How long are ACT scores valid?", a: "ACT, Inc. keeps scores available to send for a set number of years, traditionally around five. Colleges also set their own limits, so confirm with each school." },
  { q: "Does the ACT score calculator work for any practice test?", a: "Yes, as long as you enter raw scores within the correct range for your test’s format. For the most precise result on a specific released test, compare against its official conversion table." },
  { q: "Do I have to sign up to use the ACT score calculator?", a: "No account is required to enter your raw scores and see your results." },
  { q: "What is an ACT superscore?", a: "A superscore combines your highest section scores across different test dates into a new composite. Policies vary by school, so confirm whether your colleges use it." },
  { q: "How many questions can I miss and still get a 36?", a: "It depends on the test form. On many forms, a 36 requires missing only a question or two across the entire exam, and some sections allow no misses at all." },
];

// The supplied FAQ schema matches the displayed text with straight apostrophes,
// except the composite answer starts "On the traditional format … On the enhanced format".
const FAQ_SCHEMA_OVERRIDES = {
  "How is the ACT composite score calculated?": "On the traditional format, add your four section scores, divide by four and round to the nearest whole number. On the enhanced format, the composite averages only English, Math and Reading. A decimal of .5 or above rounds up.",
};
const straight = (s) => s.replace(/’/g, "'");

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
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

export default function ActScoreCalculatorFaqSection() {
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

      <Card title="What Is the ACT Exam?">
        <P>
          The ACT, short for American College Testing, is a standardized exam used in college admissions across the United States. It
          measures the skills students build in high school and gives colleges a common yardstick for comparing applicants from different
          schools, states and grading systems. The ACT is run by ACT, Inc., a nonprofit organization, and is accepted by virtually every
          four-year college in the country.
        </P>
        <P>
          Students usually take it in their junior or senior year of high school, though some test earlier to see where they stand. Many
          students also take it more than once, which is one reason an ACT score calculator comes in handy during preparation.
        </P>
      </Card>

      <Card title="ACT Exam Details: Format, Sections and Timing">
        <P>The ACT now comes in two formats, and you need to know which one your practice test follows before you enter any numbers.</P>
        <P>
          On the traditional format, the ACT had four required sections: English (75 questions, 45 minutes), Math (60 questions, 60 minutes),
          Reading (40 questions, 35 minutes) and Science (40 questions, 35 minutes). An optional essay followed.
        </P>
        <P>
          The enhanced ACT is shorter. English has 50 questions in 35 minutes, Math has 45 questions in 50 minutes and Reading has 36 questions
          in 40 minutes. Science is now optional, with 40 questions in 40 minutes, and the writing section is still optional. Math questions also
          have four answer choices instead of five. Some questions in each section are unscored field-test items, so the number of scored
          questions can be slightly lower than the totals above. Your answer key will tell you how many count.
        </P>
        <P>
          Every section is timed, including Math. Students sometimes assume the Math section isn’t, but the clock runs the whole way through,
          and pacing is a big part of how scores are earned. ACT, Inc. explains the format changes in its{" "}
          <Ext href="https://counselorblog.act.org/the-enhanced-act-explained">enhanced ACT overview for counselors</Ext>.
        </P>
      </Card>

      <Card title="How Is the ACT Scored?">
        <P>
          Each section is scored from 1 to 36. Your raw score, the number of questions you answered correctly, is converted to a scaled score
          using a conversion table for that specific test form. The composite is the average of your section scores, rounded to the nearest
          whole number. A fraction of .5 or higher rounds up, and anything below rounds down.
        </P>
        <P>
          On the traditional four-section format, suppose you score 28 in English, 26 in Math, 30 in Reading and 27 in Science. The average is
          27.75, so your composite is 28. On the enhanced format, the same English, Math and Reading scores would average 28, so the composite
          would also be 28. If you take the optional Science section on the enhanced test, it’s reported separately and feeds a STEM score
          alongside Math, but it doesn’t change your composite.
        </P>
        <P>
          Raw scores don’t convert one-to-one into scaled scores. A single missed question near the top of the range can cost you a full point
          or more, while in the middle of the range one question may move your score only slightly. That’s why scores near 36 are so demanding:
          on some forms, one or two errors separate a 36 from a 34. The calculator accounts for this uneven curve instead of treating every
          correct answer as equal.
        </P>
        <P>
          The rounding rule also creates a useful insight. A composite sitting just under a threshold, like 26.25, can often be pushed over by
          raising one section by a single point. Running different raw-score combinations through the ACT composite score calculator shows you
          which section offers the cheapest improvement.
        </P>
      </Card>

      <Card title="What Is the Lowest and Highest Possible ACT Score?">
        <P>
          The lowest possible score on any section or on the composite is 1, and the highest is 36. There is no 37, so if you’ve seen a question
          like “Is 37 a good ACT score?”, the answer is that the scale simply ends at 36. A perfect 36 is rare. Only a small fraction of
          test-takers earn it in a given year.
        </P>
        <P>
          Raw scores follow their own limits. A raw score of zero still converts to a scaled score of 1, because the scale starts there. The
          maximum raw score depends on the format and form you took, which is why it’s worth confirming the number of scored questions before
          you enter your results.
        </P>
      </Card>

      <Card title="ACT Percentiles: What Your Score Means Against Other Students">
        <P>
          A percentile tells you what share of test-takers you scored at or above. As a rough guide, a composite of 21 is a little above the
          middle of the pack, 24 lands around the 75th percentile, 25 sits in roughly the top quarter, 30 is in the mid-90s, and 34 or higher is
          at the very top, around the 99th percentile.
        </P>
        <P>
          Percentiles shift slightly from year to year as the testing population changes. Treat the figure the ACT score calculator gives you as
          a reliable estimate rather than a fixed truth. It’s most useful as a quick reality check: is your practice score competitive for the
          colleges on your list, or is there a gap to close?
        </P>
      </Card>

      <Card title="What Is the Average ACT Score?">
        <P>
          The national average composite has hovered around 19 to 20 in recent years. A score of 21 or 22 is already above average, though it
          may still fall short of what a selective school expects. Averages dip and rise a little each year, partly because the group of
          students who take the test changes.
        </P>
        <P>
          First-time test-takers tend to score a bit lower on average than students who retest. That isn’t because retaking magically adds
          points. Students who retake usually study between attempts, and those who did well the first time often stop. If your first practice
          or official score lands near the average, you’re on normal footing, and you have room to improve with focused work.
        </P>
      </Card>

      <Card title="What Is a Good ACT Score?">
        <P>
          “Good” depends on your target schools and scholarship goals. A composite above 24 is commonly treated as good, and 30 or higher is
          excellent. Many state universities admit students with composites in the low-to-mid 20s. Highly selective schools often report
          middle-50% ranges that begin around 32 or 33.
        </P>
        <Lead lead="Top-tier schools.">
          Applicants who submit scores to universities like Harvard, Stanford and Brown typically sit between 34 and 36. No single score
          guarantees admission anywhere, because grades, coursework, essays and activities matter too, but scores in that range keep you
          competitive. Colleges that report only a middle-50% range are telling you that a quarter of admitted students scored below the bottom
          number, so a score slightly under it isn’t automatically disqualifying.
        </Lead>
        <Lead lead="Scholarships and full rides.">
          There’s no universal ACT score that earns a full ride. Merit awards are set school by school, and many pair a score cutoff with a
          minimum GPA. Some scholarships start at a composite in the low 20s, while the most generous full-tuition awards often ask for 30 or
          higher. A cutoff of 28 for one tier and 30 for the next is common, which makes the exact composite matter more than most people
          expect. Always check the published requirements for the specific award.
        </Lead>
        <P>
          A practical approach is to look up the middle-50% ACT range for each school you’re considering, enter your practice results into the
          calculator, and see whether you land below, within or above that band. If you’re below, you can work backward to estimate how many
          additional correct answers per section you’d need.
        </P>
      </Card>

      <Card title="Is the ACT Harder Than the SAT?">
        <P>
          Neither test is harder across the board. It depends on how you work. The ACT has historically been faster-paced, with more questions
          per minute, though the enhanced version gives students more time per question than before. The SAT is digital and adaptive, and its
          math and reading questions lean toward problem-solving and careful analysis.
        </P>
        <P>
          If time pressure bothers you, the ACT may feel tougher. If you’d rather work through fewer, more involved questions, the SAT may fit
          you better. Both cover English, math and reading skills, and colleges that accept both treat them equally. Taking a full practice test
          in each format and comparing your percentiles is the most reliable way to decide.
        </P>
      </Card>

      <Card title="How Much Do Colleges Care About ACT Scores?">
        <P>
          It varies. Colleges that require scores treat them as one of the most important parts of an application, since they’re the only
          measure taken under identical conditions for everyone. Many other colleges are test-optional, which means you can apply without
          scores. Some highly selective schools that went test-optional have since started requiring scores again, so check each college’s
          current policy rather than relying on older advice.
        </P>
        <P>
          Even at test-optional schools, a strong score can help. It can offset a weaker GPA, support a scholarship application, or place you
          into the right college courses. If your score sits well below a school’s typical range, applying without it may be the smarter move.
          Transfer applicants are often asked for scores less often, but policies differ.
        </P>
      </Card>

      <Card title="When You Need an ACT Score Calculator: Practical Scenarios">
        <Lead lead="Grading a full-length practice test.">
          This is the most common use. You finish a timed exam, tally your correct answers, and need a scaled score to know whether your prep is
          working. Using the same calculator each time also makes progress easy to compare from one test to the next.
        </Lead>
        <Lead lead="Setting a target score.">
          Say you want a 30 composite. By entering hypothetical raw scores, you can build a section-by-section plan, such as aiming for a
          specific number of correct answers in English and Math, instead of studying with no clear finish line.
        </Lead>
        <Lead lead="Deciding whether to retake the test.">
          After your official results arrive, you may wonder how much improvement is realistic. Comparing your current score with the raw-score
          gains needed to reach the next level helps you decide if a retake is worth the registration fee and the study time.
        </Lead>
        <Lead lead="Checking a single section’s impact.">
          If your Reading score is dragging down an otherwise strong composite, the calculator shows how much the composite would rise if you
          improved that one section.
        </Lead>
        <Lead lead="Supporting students and families.">
          Parents, tutors and counselors can use the tool to translate a student’s raw practice results into something comparable to college
          admissions data, without learning every scoring rule.
        </Lead>
      </Card>

      <Card title="Superscoring, Score Choice and Retaking the ACT">
        <P>
          Many colleges superscore the ACT, meaning they take your highest section scores across multiple test dates and recompute a new
          composite. If you’ve tested more than once, run each attempt through the calculator, then combine your best sections to see what a
          superscore might look like. Not every school superscores, and some ask for every attempt, so confirm each college’s policy.
        </P>
        <P>
          Score Choice, the option to decide which test dates you send, also varies by institution. Students sometimes ask whether colleges can
          see scores they’ve tried to hide. If you choose not to send a test date, that score isn’t reported to the college, but a school that
          requires all scores will ask for them.
        </P>
        <Lead lead="How many times can you take the ACT?">
          You can generally test on each national test date, and ACT, Inc. has historically set a lifetime cap on total attempts. ACT has also
          introduced options for retaking individual sections, so check act.org for the current rules before you plan your schedule.
        </Lead>
        <Lead lead="How long are ACT scores valid and kept?">
          ACT, Inc. keeps scores available to send for a set number of years, traditionally around five. Colleges set their own rules about how
          old a score can be, and many accept scores from the last several years. Once you’ve applied, a college generally keeps your score on
          file as part of your application record under its own retention policy.
        </Lead>
        <Lead lead="How do you view your ACT scores?">
          Log in to your account on act.org, where your scores are posted after each test date. If you also want to know whether a college
          received your report, check your applicant portal or ask the admissions office to confirm.
        </Lead>
      </Card>

      <Card title="How Accurate Is This ACT Score Calculator?">
        <P>
          The raw-to-scale conversion changes slightly from one test form to the next. The ACT adjusts each form’s scale so a given scaled score
          represents the same level of performance whether the test was a little easier or harder. That’s why the official conversion table
          printed with a specific practice test is the gold standard for that test.
        </P>
        <P>
          A general-purpose ACT raw score to scaled score calculator, including this one, gives you a close estimate, typically within a point
          or so for a section. That’s precise enough for tracking progress, setting goals and spotting weak areas. For an exact number on a
          specific released test, compare the result against the official scoring table that came with it. Also remember that practice
          conditions matter. A score earned with extra time or breaks won’t predict test-day performance.
        </P>
      </Card>

      <Card title="Free, Simple and Private">
        <P>
          The ACT score calculator is free to use, and there’s nothing to download. You enter four numbers and read your results. The inputs
          are raw scores from a practice test, not names, school details or other personal information, so there’s no sensitive data to protect
          in the first place. You can run as many calculations as you like, which makes it easy to test different scenarios without worrying
          about limits.
        </P>
      </Card>

      <Card title="How to Raise Your ACT Score After You Calculate It">
        <P>
          Once you know your scaled scores, use them to guide your prep. Review every missed question and sort the errors into three groups:
          content gaps, careless mistakes and timing problems. Each has a different fix. Content gaps call for targeted review, careless errors
          respond to slower checking habits, and timing problems improve with timed practice.
        </P>
        <Lead lead="Failed or disappointed with your score?">
          There’s no pass or fail on the ACT, so a low result isn’t the end of anything. If a score comes back lower than expected, treat it as a
          diagnostic. Look at which section scored lowest, find out which question types you missed most, and rebuild your plan around those.
          Many students gain several points on a retake after a few weeks of structured practice. A low score also doesn’t hurt you at
          test-optional schools, since you can choose not to send it.
        </Lead>
        <Lead lead="Which section is the easiest?">
          It depends on the student. English tends to be the most improvable because it tests a fixed set of grammar and usage rules you can
          learn. Reading depends more on pacing and practice. Math rewards both content knowledge and speed. Look at your own section scores
          before assuming anything.
        </Lead>
        <P>
          Because there’s no penalty for wrong answers, never leave a question blank. A guess has a chance of being right and no downside. If you
          want to move up quickly, take a full practice test every week or two, calculate the score the same way each time, and track the trend.
          Gaining 10 points on a composite isn’t realistic for most people, but steady gains of a few points over a couple of months are common
          with consistent work.
        </P>
        <Lead lead="Good prep resources.">
          Start with the official materials, since they use real test content and real scoring tables: The Official ACT Prep Guide and the free
          practice tests on act.org. For extra instruction and drills, popular choices include Kaplan’s ACT Prep Plus, The Princeton Review’s
          ACT Prep and Barron’s ACT. Pair a book with timed practice tests, and score each one with the calculator above so you can see how your
          results change.
        </Lead>
      </Card>

      <Card title="Do Colleges Outside the U.S. Accept ACT Scores?">
        <P>
          Some do, but policies vary a lot. Several Canadian universities accept ACT or SAT scores, especially from applicants who studied in
          the U.S. system. Some universities in Australia, the UK and parts of Europe or Asia also take them for international admissions, while
          others rely only on national exams or their own entrance tests. There’s no single European equivalent. Most European countries use
          their own school-leaving exams, and the SAT is the closest comparison to the ACT in international use. Check the admissions page of
          each school you’re considering.
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
