import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a PTE score calculator?",
    a: "A PTE score calculator converts your overall PTE Academic score into other measures of English ability, such as a CEFR level, an estimated IELTS band and an estimated TOEFL score. This tool also lists the kinds of university courses your score may qualify you for.",
  },
  {
    q: "How do I convert my PTE score to IELTS?",
    a: "Enter your overall PTE score into the calculator and it returns the approximate IELTS band. As a general guide, PTE 50 is close to IELTS 6.0, PTE 58 to 6.5, PTE 65 to 7.0, PTE 73 to 7.5 and PTE 79 to 8.0.",
  },
  {
    q: "What PTE score is equal to IELTS 6.5?",
    a: "A PTE score of about 58 is generally treated as equivalent to IELTS 6.5. Some institutions set their own PTE minimums, so check the course page for the exact figure.",
  },
  {
    q: "Are IELTS and PTE scores interchangeable?",
    a: "Only partly. Most universities accept both tests, but a converted score is an estimate. Some institutions and visa authorities name one test or set their own PTE minimums, so always check the stated requirement.",
  },
  { q: "What PTE score is needed for CEFR B2?", a: "B2 begins at a PTE overall score of 59. C1 begins at 76 and C2 at 85." },
  {
    q: "What is the PTE passing score?",
    a: "There is no pass or fail on PTE Academic. The test gives you a score, and each university, employer or visa authority sets its own minimum.",
  },
  {
    q: "What PTE score do I need for Australian PR?",
    a: "Competent English is the minimum for skilled migration and earns no points. Proficient English earns 10 points and Superior English earns 20. For PTE Academic tests taken on or after August 7, 2025, Home Affairs sets a separate minimum for each skill, so check the current figures on its website.",
  },
  {
    q: "How many PTE points are required for New Zealand residence?",
    a: "For skilled residence visas, the main applicant needs an overall PTE Academic score of 58 or more. Partners and dependent children aged 16 and older need 36 overall.",
  },
  {
    q: "Is PTE Academic accepted for Canadian immigration?",
    a: "No. IRCC accepts PTE Core for Express Entry, not PTE Academic. PTE Core is scored by skill and mapped to CLB levels.",
  },
  {
    q: "How long is a PTE score valid?",
    a: "PTE Academic scores are valid for two years from the test date. For Australian visas, results can be used for up to three years, depending on the visa.",
  },
  {
    q: "Does the PTE score depend on the test center?",
    a: "No. Scoring is automated and works the same way at every center. The room, noise level and equipment can still affect how you perform.",
  },
  {
    q: "What does “pending” or “on hold” mean on a PTE score?",
    a: "It means your score has not been released yet. Most results arrive within a couple of business days, but a test can be held for extra review. If the wait is unusually long, contact Pearson Support.",
  },
  {
    q: "Can I challenge my PTE score?",
    a: "Yes. You can request a rescore within 14 days of your score being released. It costs $160, which is refunded if your score changes. A rescore can also lower your score, so consider that risk first.",
  },
  { q: "Is this PTE score calculator free?", a: "Yes, it is free to use, and you only enter a single score." },
  {
    q: "Does the calculator work out my score from my answers?",
    a: "No. It converts a finished overall score. Pearson’s official scoring determines the score itself, and your score report shows it.",
  },
];

// The supplied FAQ schema matches the displayed text with straight apostrophes,
// and writes the "pending" question without quotation marks.
const SCHEMA_QUESTION_OVERRIDES = {
  "What does “pending” or “on hold” mean on a PTE score?": "What does pending or on hold mean on a PTE score?",
};
const straight = (s) => s.replace(/’/g, "'");

const IELTS_HEADERS = ["PTE overall score", "Approximate IELTS band"];
const IELTS_ROWS = [["42", "5.5"], ["50", "6.0"], ["58", "6.5"], ["65", "7.0"], ["73", "7.5"], ["79", "8.0"], ["83+", "8.5 and above"]];
const CEFR_HEADERS = ["PTE overall score", "CEFR level"];
const CEFR_ROWS = [["10–29", "Below A2"], ["30–42", "A2"], ["43–58", "B1"], ["59–75", "B2"], ["76–84", "C1"], ["85–90", "C2"]];
const COUNTRY_HEADERS = ["Country", "Purpose", "PTE requirement"];
const COUNTRY_ROWS = [
  ["Australia", "Skilled migration (points test)", "Competent, Proficient or Superior English, with a minimum in each skill (see below)"],
  ["New Zealand", "Skilled residence visas", "58 overall for the main applicant"],
  ["Canada", "Express Entry and other immigration", "PTE Core, scored by skill and mapped to CLB levels. PTE Academic is not accepted"],
  ["United Kingdom", "Student visa, degree level and above", "59 in each of the four skills on PTE Academic UKVI"],
  ["United States and others", "University admission", "Set by each university, usually listed as an overall score plus skill minimums"],
];
const AUS_HEADERS = ["English level", "Listening", "Reading", "Writing", "Speaking", "Points"];
const AUS_ROWS = [
  ["Competent", "47", "48", "51", "54", "0"],
  ["Proficient", "58", "59", "69", "76", "10"],
  ["Superior", "69", "70", "85", "88", "20"],
];
const CLB_HEADERS = ["CLB level", "Listening", "Reading", "Writing", "Speaking"];
const CLB_ROWS = [["CLB 9", "82", "78", "88", "84"]];

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
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
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

function DataTable({ headers, rows, minWidth = 320 }) {
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

export default function PteScoreCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: SCHEMA_QUESTION_OVERRIDES[item.q] ?? straight(item.q),
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

      <Card title="What Is PTE, and What Does a PTE Score Mean?">
        <P>
          PTE stands for Pearson Test of English. Pearson created it to measure the English skills of people who are not native speakers and
          want to study, work or immigrate where English is used. The version most people mean is PTE Academic. It is accepted by
          universities and by several governments for visa purposes.
        </P>
        <P>
          Your score report shows four communicative skills (listening, reading, speaking and writing), and each is scored from 10 to 90. It
          also shows an overall score on the same 10 to 90 scale. That overall number is the one most institutions ask for first, and it is
          the number this calculator uses.
        </P>
        <P>
          There is also a difference between PTE versions. PTE Academic is for university admission and for migration to countries such as
          Australia and New Zealand. PTE Core is the version Canada accepts for immigration. PTE Academic UKVI is the UK visa version. PTE
          General is an older name for a different exam that Pearson now offers as the Pearson English International Certificate. It is a
          separate exam and is not the same as PTE Academic. Make sure the test you take matches the one your application names.
        </P>
      </Card>

      <Card title="Can You Calculate a PTE Score Yourself?">
        <P>
          Not in any exact way. There is no simple formula that turns your answers into a PTE score. The test is scored by computer, and each
          task can count toward more than one skill. A response to a reading-aloud task, for example, can add to both speaking and reading.
          Pearson’s system combines the evidence from all tasks into the four skill scores and the overall score.
        </P>
        <P>
          For that reason, the overall score is not a plain average of your four skill scores. Two people with the same overall score can
          have very different profiles. One may be strong in writing and weak in speaking, and another the reverse.
        </P>
        <P>
          Pearson’s report also lists six enabling skills: grammar, oral fluency, pronunciation, spelling, vocabulary and written discourse.
          These are shown separately, but they also feed into the communicative skills. If you want to understand why a skill score is low,
          the enabling skills usually point to the cause.
        </P>
      </Card>

      <Card title="What Is the PTE Passing Score?">
        <P>
          There is no pass or fail on PTE Academic. The test reports a score, and each institution or visa authority sets its own minimum. A
          score that is plenty for one program may fall short for another. Many institutions also set minimums for each skill in addition to
          the overall score, and the calculator only works from the overall number. Always check your skill scores against any stated
          requirement.
        </P>
      </Card>

      <Card title="PTE Score to IELTS Conversion">
        <P>
          Converting a PTE score to <Link to="/tools/ielts-score-calculator" className="inline-home-link">IELTS</Link> is the most common reason people use a PTE score calculator. IELTS reports bands from 0 to 9 in
          half-band steps, while PTE uses a 90-point scale, so the match is an estimate and not an exact equivalence. Pearson publishes a
          comparison based on its studies, and institutions often use similar tables. The usual pattern looks like this:
        </P>
        <DataTable headers={IELTS_HEADERS} rows={IELTS_ROWS} />
        <P>
          These are anchor points. A score between two rows maps to the lower band unless the next threshold is met. A PTE 62 is therefore
          treated as roughly IELTS 6.5, not 7.0. The calculator applies this logic so you don’t have to read a table by hand.
        </P>
        <P>
          So are IELTS and PTE scores interchangeable? Only to a point. Most universities accept either test, but an equivalent score is an
          estimate. Some institutions publish their own PTE minimums and ignore conversion tables. When a course lists a PTE score directly,
          use that number.
        </P>
      </Card>

      <Card title="PTE Score to TOEFL Conversion">
        <P>
          TOEFL iBT is scored out of 120, and the link to PTE is lower than the link to IELTS. The studies behind these tables use smaller
          samples, and different organizations round them differently. As a rough guide, a PTE score in the high 50s lines up with a TOEFL
          iBT score in the low 80s, a mid-60s PTE score sits in the mid-90s, and a PTE score in the 70s corresponds to a TOEFL score at or
          above 100.
        </P>
        <P>
          The tool shows an estimated TOEFL score so you can quickly see whether you are near a threshold. If a program asks specifically for
          TOEFL and sets a hard cut-off, such as 90 or 100, check whether it also accepts PTE Academic directly. Many do, which saves you from
          sitting a second exam.
        </P>
      </Card>

      <Card title="PTE Score to CEFR Level">
        <P>
          The Common European Framework of Reference (CEFR) describes language ability from A1 to C2. It appears in visa rules, school
          admissions, employer requirements and many European university policies. Pearson maps PTE scores to CEFR through the Global Scale of
          English:
        </P>
        <DataTable headers={CEFR_HEADERS} rows={CEFR_ROWS} />
        <P>
          B2 is the level that matters most in practice. It is the standard threshold for many undergraduate programs and for several
          immigration and professional registration routes, and it begins at a PTE score of 59. C1 begins at 76 and is the level some
          competitive postgraduate programs look for. When the calculator returns a CEFR level, it is applying these bands to your overall
          score.
        </P>
      </Card>

      <Card title="PTE Score Requirements by Country">
        <P>
          Immigration is where PTE scores carry the most weight, and the rules differ a lot between countries. The table below gives a quick
          comparison. The sections after it explain each country in more detail.
        </P>
        <DataTable headers={COUNTRY_HEADERS} rows={COUNTRY_ROWS} minWidth={520} />
        <P>Immigration rules change often, so confirm the figures on the official government site before you book a test or lodge an application.</P>
        <H3>What Is a Decent PTE Score for Australian PR?</H3>
        <P>
          For Australian skilled migration, English proficiency counts as points, so a “decent” score depends on how many points you need.
          Home Affairs recognizes three levels. Competent English is the minimum to be eligible and earns no points. Proficient English earns
          10 points, and Superior English earns 20 points.
        </P>
        <P>
          The thresholds changed for PTE Academic tests taken on or after August 7, 2025. Home Affairs now sets a different minimum for each
          skill instead of one number for all four. According to the Department’s{" "}
          <Ext href="https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/proficient-english">Proficient English page</Ext>,
          Proficient English requires at least 58 in listening, 59 in reading, 69 in writing and 76 in speaking. Results from tests taken on or
          before August 6, 2025 are judged on the older standard of 65 in each skill.
        </P>
        <DataTable headers={AUS_HEADERS} rows={AUS_ROWS} minWidth={460} />
        <P>
          Under the older standard, Competent was 50 in each skill and Superior was 79 in each skill. The Competent and Superior figures above
          come from published summaries of the new rules, so confirm them on the Home Affairs site before you plan around them.
        </P>
        <P>
          In practice, aim for Proficient English at a minimum if you need points, and Superior English if your points total is close to the
          invitation cutoff. Speaking and writing carry the highest thresholds, so those are the skills to prepare for first.
        </P>
        <P>
          A related question is the partner points. If you apply with a partner, you can claim 5 points when your partner has Competent
          English, among other conditions. Use the Competent figures for the test date of your partner’s result, and check the full partner
          rules on the Home Affairs site.
        </P>
        <P>
          PTE scores used for an Australian visa stay valid for up to three years, depending on the visa. The Department does not accept tests
          taken entirely online or at home, so book a test center.
        </P>
        <H3>How Many PTE Scores Are Required for New Zealand PR?</H3>
        <P>
          For skilled residence visas, including the Skilled Migrant Category, Immigration New Zealand asks the main applicant for an overall
          PTE Academic score of 58 or more. Partners and dependent children aged 16 and older need a lower score, 36 overall. The result must
          be no more than two years old when you lodge your application. Some professions, such as nursing, also have a separate English
          requirement from their registration body.
        </P>
        <H3>What PTE Score Is Required for Canada, and Is PTE Valid for PR?</H3>
        <P>
          This is the most common mix-up. Canada’s immigration department, IRCC, accepts PTE Core for Express Entry and related programs. It
          does not accept PTE Academic for those programs. The two tests share a name and a 10 to 90 scale, but they are different exams, and
          the conversion tables on this page apply to PTE Academic.
        </P>
        <P>
          IRCC converts PTE Core scores to Canadian Language Benchmark (CLB) levels one skill at a time. CLB 9 is a common target for
          applicants who want more points. It requires the following PTE Core scores:
        </P>
        <DataTable headers={CLB_HEADERS} rows={CLB_ROWS} />
        <P>
          Each program sets its own CLB minimum, and every skill is checked on its own. Writing is usually the hardest one to reach. If you
          plan to immigrate to Canada, check the current IRCC charts and register for PTE Core, not PTE Academic.
        </P>
        <P>
          PTE Academic still has a place in Canada for study. Many Canadian universities and colleges accept it for admission, and
          requirements vary by school.
        </P>
        <P>
          Two follow-up questions come up often. For Provincial Nominee Programs (PNP), the language test rules depend on the province and the
          stream, so check the program’s own page. Streams linked to Express Entry generally follow IRCC’s approved tests. For nurses, English
          requirements are set by each provincial nursing regulator, not by IRCC. Several accept PTE Academic, so check with your regulator
          before booking a test.
        </P>
        <H3>What PTE Score Do You Need for the UK?</H3>
        <P>
          For a UK Student visa at degree level or above, the Home Office requires CEFR B2, which Pearson lists as 59 or higher in each of the
          four skills on PTE Academic UKVI. You need the UKVI version of the test for visa purposes, taken at an approved center. Some work
          routes, including Skilled Worker, have their own English levels that have changed over time, so check the current GOV.UK guidance.
          Universities set their own entry scores separately from the visa rule.
        </P>
      </Card>

      <Card title="University Courses and PTE Score Requirements">
        <P>
          Along with the conversions, the tool shows the types of university courses your score may qualify you for. These suggestions are
          based on typical English entry ranges. They are not a promise of admission:
        </P>
        <List items={[
          ["Around 42–50:", "Foundation programs, diploma courses and some pathway programs, often with English support."],
          ["Around 50–58:", "Many undergraduate degrees and some vocational or practice-based postgraduate courses."],
          ["Around 58–65:", "The usual range for most undergraduate and taught postgraduate programs, including business, engineering and IT."],
          ["65 and above:", "Highly competitive courses and fields with heavy writing or communication demands, such as law, journalism, education, and in many places healthcare and medicine, which often also require minimum skill scores."],
        ]} />
        <P>
          Minimum PTE scores differ for every university, and even between courses at the same university. This is also true for Australian
          universities. There is no single mandatory score. A business degree may ask for 58 overall with 50 in each skill, while a nursing or
          law program at the same school asks for more. An English requirement is usually one of several admission criteria, alongside
          grades, work experience or a portfolio. Use the calculator to build a shortlist, then confirm the exact requirement on the
          university’s own admissions page before you apply.
        </P>
      </Card>

      <Card title="When You Need a PTE Score Calculator">
        <P>The scenarios below are the ones people most often bring to this tool.</P>
        <List items={[
          ["Comparing admission offers.", "You have applied to several universities. One asks for IELTS 6.5, another for TOEFL 90, and a third for PTE 58. Converting your score tells you at a glance which are within reach."],
          ["Deciding whether to retake.", "If you are two points short of a threshold, the calculator shows what the next band would unlock. A small improvement can be worth another attempt when it moves you into a higher CEFR level or a different course category."],
          ["Choosing between English tests.", "If you are still deciding between PTE, IELTS and TOEFL, converting a practice score into the other scales shows where you stand on each."],
          ["Filling out applications.", "Some forms ask for an IELTS equivalent even if you took PTE. A quick conversion gives you a figure to enter, although you should attach your official PTE report as evidence."],
          ["Supporting a visa or registration application.", "Employers, professional bodies and visa routes sometimes state requirements in CEFR terms. Converting your PTE score to a CEFR level makes the comparison easy."],
          ["Advising students.", "Teachers, tutors and education counselors use the calculator to give quick, consistent answers without carrying conversion tables around."],
        ]} />
      </Card>

      <Card title="What the PTE Score Calculator Does">
        <P>This PTE score calculator is a conversion and eligibility tool. You enter your overall score, and it returns four things:</P>
        <List items={[
          ["University qualification:", "the types of courses that usually accept that level of English, from foundation programs to postgraduate study."],
          ["CEFR level:", "your level on the Common European Framework of Reference, from A1 to C2."],
          ["IELTS equivalent:", "an approximate IELTS band."],
          ["TOEFL equivalent:", "an approximate TOEFL iBT score."],
        ]} />
        <P>
          The tool does not rebuild your overall score from practice answers or individual task results. Pearson’s scoring system handles
          that, and it cannot be reproduced outside the official test. What the tool does is translate a finished score into the language
          other institutions use. If you have your PTE Academic score report in hand, you have everything you need.
        </P>
      </Card>

      <Card title="How to Use the Free PTE Score Calculator Online">
        <List ordered items={[
          ["", "Find the overall score on your PTE Academic report. It is a whole number from 10 to 90."],
          ["", "Type it into the field above this text."],
          ["", "Read the results: the CEFR level, IELTS band, TOEFL equivalent and course eligibility."],
        ]} />
        <P>
          If you are weighing a retake, try a few nearby numbers. Entering 58 and then 65 shows how much a few points change your IELTS
          equivalent and the courses open to you. That makes the tool useful for setting a realistic target, not only for checking a result
          you already have.
        </P>
      </Card>

      <Card title="Understanding Your PTE Score Report">
        <H3>How Long Is a PTE Score Valid?</H3>
        <P>
          A PTE Academic score report is valid for two years from your test date. After that you can no longer access or send the result, as
          Pearson explains in its <Ext href="https://www.pearsonpte.com/help-center/scoring/">scoring help center</Ext>. A score that converts
          well today can expire before you finish an application cycle, so check the validity period against your plans. Australia is the
          notable exception. It accepts PTE results for visa purposes for up to three years, depending on the visa.
        </P>
        <H3>Is My Earlier Score Still Valid After a Retake?</H3>
        <P>
          Yes. A new test does not cancel the old one. Each score report stays valid for its own two years, and you choose which one to send.
          Each test is also scored on its own. Your latest score is not based on your earlier one, so a retake can move your score up, down or
          not at all.
        </P>
        <H3>How Do I Send My PTE Scores to Institutions?</H3>
        <P>
          Sign in to your myPTE account, open the test under My Activity, and choose Send Scores. Then select the institutions from the list.
          Some institutions ask for a Score Report Code instead. Send your scores only after you are sure you want that result used.
        </P>
        <H3>What Does “Pending” or “On Hold” Mean?</H3>
        <P>
          A “pending” status means your score has not been released yet. Most results arrive within a couple of business days, but some take
          longer. A test may be held for an extra review, such as a technical check or a check on the test session. If your status stays
          pending well beyond the usual window, contact Pearson Support and quote your booking reference. Don’t book a retake or submit an
          application based on a result you haven’t seen.
        </P>
        <H3>How Can I Challenge My PTE Score?</H3>
        <P>
          You can ask Pearson for a rescore. According to Pearson’s rescore policy, you must request it within 14 calendar days of your score
          being released, and the request is handled by phone. The fee is $160, and it is refunded if your overall or communicative skill
          scores change. You can only ask once per test registration, only for your most recent test, and not if you have already booked
          another one. Pearson also warns that a rescore can lower your score, so think about that risk before you ask. If you believe a
          technical problem affected your speaking score, you can ask for a technical review instead.
        </P>
        <H3>How Accurate Is PTE Scoring?</H3>
        <P>
          PTE scoring is automated, and the same system scores every candidate. That removes the human variation you can get with examiner
          marking, and it is why rescores rarely change a result. Accuracy here means consistency. Your score can still differ from one test
          day to another, because your performance does too.
        </P>
        <H3>Does the PTE Score Depend on the Test Center?</H3>
        <P>
          No. The test center does not score your test. Scoring is done by the same system wherever you sit the exam. What does differ between
          centers is the environment: how noisy the room is, the quality of the headset and how comfortable the seat is. Those can affect your
          performance, but the scoring itself is the same.
        </P>
        <H3>Are PTE Scored Practice Tests Similar to the Real Test?</H3>
        <P>
          Pearson’s official scored practice tests are the closest option, because Pearson says they use the same scoring technology as the
          real test. Even so, treat a practice score as an estimate. Your real result can differ because of nerves, the room, or the specific
          questions you get. Scores from third-party practice sites vary widely, so use them to find weak areas and not to predict your final
          number.
        </P>
      </Card>

      <Card title="What Can Affect Your PTE Score?">
        <H3>Does Ambient Noise Affect the PTE Score?</H3>
        <P>
          It can, indirectly. The test does not penalize noise as such, but your speaking responses are recorded and scored from the audio.
          Background sound from other candidates can make your voice harder to capture clearly, which may affect speaking and the enabling
          skills tied to it, such as pronunciation and oral fluency. Check your headset and microphone position before you begin. Speak at a
          steady, normal volume. Don’t raise your voice to compete with other candidates.
        </P>
        <H3>Does Stammering Affect PTE Scoring?</H3>
        <P>
          Oral fluency is one of the scoring enabling skills, and it looks at the rhythm and flow of your speech, including pauses, repeated
          {" "}<Link to="/tools/word-counter" className="inline-home-link">words</Link> and false starts. A stammer can therefore affect that part of your result. If you have a condition or disability that might
          affect your performance, ask Pearson about accommodations before you book the test. Practicing the speaking tasks under timed
          conditions also helps you learn how much a pause or a repeated word costs.
        </P>
        <H3>Can You Get a PTE Score Without Speaking?</H3>
        <P>
          No. Speaking is a required part of PTE Academic, and the overall score includes it. You cannot skip it and still get a full, usable
          result. Because speaking and writing also feed the enabling skills, leaving tasks blank pulls down several scores at once.
        </P>
        <H3>Are PTE Questions Repetitive?</H3>
        <P>
          The task types repeat from test to test, and that is useful for practice. The questions themselves change. Be careful with memorized
          templates and scripted answers. Pearson’s scoring is built to notice responses that are off-topic or not genuine, and that can cost
          you points. Practice the formats, but answer the actual question in front of you.
        </P>
        <H3>Is the PTE Exam Easy or Tough?</H3>
        <P>
          It depends on your English level and on how familiar the format feels. Many candidates find it demanding because speaking and
          writing tasks have tight time limits and the test is taken on a computer. Strong English is necessary, but it is not enough on its
          own. Knowing the task formats and managing your time matter almost as much.
        </P>
      </Card>

      <Card title="How to Improve Your PTE Score">
        <H3>How Can I Prepare for the PTE and Get a Good Score?</H3>
        <P>
          Start with a baseline. Take an official scored practice test, then look at your skill and enabling-skill scores to find the weakest
          area. Spend most of your practice time there. Learn the task formats from Pearson’s official guide and practice materials, then
          practice under real time limits. For speaking, record yourself and listen back for pace, pauses and clarity. For writing, practice
          summarizing and building short, well-organized responses. For reading and listening, build vocabulary and practice following an
          argument without translating in your head.
        </P>
        <H3>What Are the Best Tips for PTE Speaking?</H3>
        <P>
          Speak at a steady pace and keep going when you make a small mistake, instead of stopping to correct it. Pronounce words clearly
          without exaggerating. Keep the microphone in a consistent position, and don’t pause for long before you start. For repeating and
          describing tasks, a smooth, complete response beats a perfect but halting one.
        </P>
        <H3>Why Is My Reading or Speaking Score Poor?</H3>
        <P>
          Low reading scores usually come from time pressure and a limited vocabulary, especially in fill-in-the-blank tasks that test how
          words combine. Low speaking scores usually come from hesitation, unclear pronunciation, a low or uneven volume or a poor microphone
          position. Check the enabling skills on your report to see which one is holding you back.
        </P>
        <H3>How Can I Improve My PTE Score in One Week?</H3>
        <P>
          In a week you won’t change your English level, but you can improve your test performance. Take one scored practice test, fix your
          microphone and timing habits, learn each task format, and practice the two or three tasks that cost you the most points. Don’t
          memorize templates. A short, focused plan works better than studying everything.
        </P>
        <H3>Can I Boost My PTE Score to 90?</H3>
        <P>
          A score of 90 is rare and takes consistently strong performance in every skill, along with clean pronunciation, natural fluency and
          few errors. If you are already scoring in the high 70s or 80s, work on the details: connected speech, precise vocabulary and careful
          proofreading. If you are scoring lower, a more realistic goal is the next threshold you need, such as 65 or 79, and not the maximum.
        </P>
        <H3>Where Can I Practice for PTE?</H3>
        <P>
          Start with Pearson’s own practice resources, including its scored practice tests and official guide, because they match the real
          test most closely. Coaching platforms such as E2Language also offer practice material and reviews. Whichever site you choose, check
          how it estimates your score, and don’t rely on a single provider.
        </P>
      </Card>

      <Card title="Is This PTE Score Calculator Accurate, Free and Private?">
        <P>
          Accuracy first. The tool uses the published relationships between PTE scores, CEFR levels and other English tests. Those
          relationships are approximate by nature. The CEFR mapping is the most reliable because it comes directly from Pearson’s own scale.
          The IELTS and TOEFL figures are estimates, and no conversion replaces an institution’s own stated requirement. If a university
          publishes its own PTE minimum, that number overrides anything in a conversion table.
        </P>
        <P>
          The calculator is free to use, with no payment or hidden charge, and it does not require you to register an account. The only thing
          you enter is a single score. You never need to upload your score report, type your name or share contact details. A score on its
          own does not identify you, so there is little personal data involved.
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
