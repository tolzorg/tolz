import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my GPA?", a: "Convert each letter grade to grade points, multiply by the course’s credit hours, add everything up, and divide by total credits. Without credits, add the grade points and divide by the number of courses. The calculator above does all of this for you." },
  { q: "What is CGPA?", a: "CGPA is your cumulative grade point average, the average across all semesters or terms. In the U.S. it means the same as cumulative GPA. In India and some other countries, it usually refers to an average on a 10-point scale." },
  { q: "What is the difference between weighted and unweighted GPA?", a: "An unweighted GPA treats every class equally on a 4.0 scale. A weighted GPA adds extra points for honors, AP, IB, or college-level courses, so it can go above 4.0." },
  { q: "Can I calculate my GPA without credits?", a: "Yes. If your school counts every course equally, leave out the credit values and the tool averages your grade points directly." },
  { q: "How do I calculate my cumulative GPA?", a: "Add your total grade points from all semesters and divide by your total credits. You can also enter your current GPA and credits completed, then add new courses to see the updated total." },
  { q: "Does this GPA calculator work for college and high school?", a: "Yes. Select your level, enter your courses and grades, and add credits and course types if they apply." },
  { q: "Is an AP class really worth more in GPA?", a: "In most weighted systems, yes. AP and IB courses typically add one extra point, and honors courses add half a point, though your school sets the exact weighting." },
  { q: "What is a good GPA?", a: "A 3.0 is solid, 3.5 or above is strong, and 3.7 or above is competitive for selective programs. What counts as good depends on your goals and your course load." },
  { q: "Does GPA matter for jobs?", a: "It matters most for internships and entry-level jobs, and some employers set a minimum such as 3.0. After a few years of experience, most employers stop asking." },
  { q: "How do I convert a 10-point CGPA to a 4.0 GPA?", a: "There’s no single official formula. A rough estimate is CGPA ÷ 10 × 4, but it tends to understate strong results. For applications, use the conversion method or evaluation service your target school accepts." },
  { q: "What GPA do I need for a scholarship or the dean’s list?", a: "It varies by institution and program. Many merit scholarships require a 3.0 to 3.5, and dean’s lists commonly start around 3.5. Check the official requirements for yours." },
  { q: "Can I get into medical school with a 3.0 GPA?", a: "It’s difficult, but possible with a strong MCAT score, an upward grade trend, post-baccalaureate coursework, and solid clinical experience. Averages for admitted students are much higher, so plan for a longer path." },
  { q: "Why doesn’t my result match my transcript exactly?", a: "Schools use different scales, rounding rules, and policies for repeated or transferred courses. If the numbers differ, your registrar can confirm how the official GPA is calculated." },
  { q: "Is this GPA calculator free?", a: "Yes. It’s free to use with no signup required." },
];

// The supplied FAQ schema matches the displayed text with straight apostrophes,
// except for these answers, which it words slightly differently.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate my GPA?": "Convert each letter grade to grade points, multiply by the course's credit hours, add everything up, and divide by total credits. Without credits, add the grade points and divide by the number of courses.",
  "How do I convert a 10-point CGPA to a 4.0 GPA?": "There is no single official formula. A rough estimate is CGPA divided by 10 and multiplied by 4, but it tends to understate strong results. For applications, use the conversion method or evaluation service your target school accepts.",
  "Can I get into medical school with a 3.0 GPA?": "It is difficult but possible with a strong MCAT score, an upward grade trend, post-baccalaureate coursework, and solid clinical experience. Averages for admitted students are much higher, so plan for a longer path.",
  "Is this GPA calculator free?": "Yes. It is free to use with no signup required.",
};
const straight = (s) => s.replace(/’/g, "'");

const SCALE_HEADERS = ["Letter grade", "Grade points"];
const SCALE_ROWS = [
  ["A+", "4.0 (4.3 at some schools)"], ["A", "4.0"], ["A-", "3.7"], ["B+", "3.3"], ["B", "3.0"], ["B-", "2.7"], ["C+", "2.3"],
  ["C", "2.0"], ["C-", "1.7"], ["D+", "1.3"], ["D", "1.0"], ["D-", "0.7"], ["F", "0.0"],
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

export default function GpaCalculatorFaqSection() {
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

      <Card title="What Is GPA? What Is CGPA? And Why Do They Matter?">
        <P>
          GPA stands for grade point average. It is the average of the grades you earn, with each <Link to="/tools/grade-calculator" className="inline-home-link">letter grade</Link> converted to a number and each
          course counted according to its credit value. Instead of reading through a full transcript, a school, scholarship committee, or
          employer can look at one figure, such as 3.4 or 3.9, to get a quick sense of how a student has performed.
        </P>
        <P>
          {" "}<Link to="/tools/gpa-calculator-pakistan" className="inline-home-link">CGPA</Link> stands for cumulative grade point average. It covers every graded course you have taken, not just one term. In the United
          States, “<Link to="/tools/college-gpa-calculator" className="inline-home-link">cumulative GPA</Link>” and “CGPA” mean the same thing. In India and some other countries, CGPA usually refers to an average on a
          10-point scale across all semesters, so a CGPA of 8.4 is a different number from a 3.4 GPA in the U.S. Both measure the same idea,
          which is your overall academic performance, but the scales are not interchangeable.
        </P>
        <P>
          GPA matters because many decisions use it as a first filter. Colleges look at it during admissions, scholarship programs set
          minimums, and honors lists and academic standing depend on it. Graduate programs, internships, and some employers ask for it too.
          Your GPA also tells you something useful about yourself. A falling number early on is a signal to change your study habits before it
          becomes harder to fix.
        </P>
      </Card>

      <Card title="Why Does GPA Exist?">
        <P>
          Schools grade differently. One teacher’s A might mean 90 percent, another’s might mean 93, and a class in one state may be graded on
          a completely different scale from a class in another. GPA exists to give admissions officers, scholarship committees, and employers a
          single common measure that can be compared across students, courses, and schools.
        </P>
        <P>
          It also does a second job. It rewards consistency. One great exam score can’t hide a weak semester, and one bad test won’t erase a
          strong year. By averaging everything, GPA shows a pattern over time, which is more informative than any single grade.
        </P>
        <P>
          It is not a perfect system. It can’t show how hard a course was, how much you improved, or what you learned beyond the grade. That is
          why weighted GPAs, class rank, test scores, essays, and recommendation letters exist alongside it.
        </P>
      </Card>

      <Card title="How GPA Is Calculated: Grades, Credits, and the 4.0 Scale">
        <P>
          Every GPA calculation follows the same logic. Each letter grade converts to grade points, each course’s grade points are multiplied by
          its credit hours, and the total is divided by the total credits attempted. Credits act as the weight of the course. A 4-credit class
          moves your GPA more than a 1-credit class.
        </P>
        <P>The standard 4.0 scale looks like this:</P>
        <DataTable headers={SCALE_HEADERS} rows={SCALE_ROWS} />
        <P>
          Schools differ on the details. Some count an A+ as 4.3 and others cap it at 4.0. Some don’t use plus or minus grades, and a few use
          “E” instead of “F” for a failing grade. Pass/fail, incomplete, and withdrawal marks (P, NP, I, W) are usually left out of the GPA, so
          don’t enter them as grades. Check your school’s grading policy if your transcript GPA differs slightly from the result here.
        </P>
        <P>Here is a worked example with credits. Suppose you took five courses in a semester:</P>
        <List items={[
          ["English,", "3 credits, A: 4.0 × 3 = 12.0"],
          ["Biology,", "4 credits, B+: 3.3 × 4 = 13.2"],
          ["Calculus,", "4 credits, B: 3.0 × 4 = 12.0"],
          ["History,", "3 credits, A-: 3.7 × 3 = 11.1"],
          ["Physical Education,", "1 credit, A: 4.0 × 1 = 4.0"],
        ]} />
        <P>Total grade points are 52.3 across 15 credits, so the semester GPA is 52.3 ÷ 15 = 3.49.</P>
        <P>
          Now a version without credits, the way many high schools do it. Say you earned an A, B+, A-, B, and C+. The grade points are 4.0,
          3.3, 3.7, 3.0, and 2.3, which add up to 16.3. Divide by 5 courses and your GPA is 3.26.
        </P>
        <P>
          If someone asks “what is my GPA score?”, this is what they mean: the number you get from this division, usually between 0.0 and 4.0
          on the standard scale.
        </P>
      </Card>

      <Card title="Weighted vs. Unweighted GPA">
        <P>
          Most high school students deal with two GPAs. The unweighted GPA uses the plain 4.0 scale, so an A in any class is worth 4.0. The
          {" "}<Link to="/tools/high-school-gpa-calculator" className="inline-home-link">weighted GPA</Link> adds extra points for more demanding courses, which is why students in advanced programs can have a GPA above 4.0.
        </P>
        <P>
          The most common weighting system adds 0.5 points for honors classes and 1.0 point for AP, IB, and dual-enrollment courses. Under that
          system, a B in <Link to="/tools/ap-bio-score-calculator" className="inline-home-link">AP Biology</Link> counts as 4.0 instead of 3.0, and an A in an honors course counts as 4.5. Some districts use a 5.0 maximum,
          some use different increments, and a few don’t weight grades at all. The course-level selector in this high school GPA calculator
          lets you apply the common weights so you can see both versions side by side.
        </P>
        <Lead lead="Do colleges calculate GPA differently?">
          Yes. Many admissions offices recalculate your GPA with their own method. They may drop electives, count only core academic subjects,
          or remove the extra weighting your school added. The University of California system, for example, uses its own formula and caps the
          honors points it counts. Your school’s reported GPA still shows up on your transcript and in class rank, but it isn’t always the
          figure an admissions office uses. Scholarship programs also set minimums on one specific version, so check which one they mean before
          assuming you qualify.
        </Lead>
        <Lead lead="What is the highest possible GPA?">
          On the standard unweighted scale, 4.0 is the top (4.3 at schools that give an A+ extra credit). Weighted GPAs have no universal
          ceiling. A school with a 5.0 scale tops out at 5.0, and some use higher caps.
        </Lead>
      </Card>

      <Card title="College GPA Calculator: Credits and Cumulative GPA">
        <P>
          College GPA works on the same principle as high school GPA, but credit hours carry more weight. A 4-credit lab science affects your
          average more than a 1-credit seminar. That’s why a college GPA calculator needs a credits field, and why this tool includes one.
        </P>
        <P>
          Your semester GPA covers a single term. Your cumulative GPA covers every graded course you’ve taken at your institution. To update it
          after a new term, add the new grade points to your previous total and divide by total credits. For example, if you have 60 credits at
          a 3.40 GPA (204 total grade points) and you earn 52.3 points over 15 more credits, your new cumulative GPA is (204 + 52.3) ÷ 75 =
          3.42.
        </P>
        <P>A few details trip students up when using a cumulative GPA calculator:</P>
        <List items={[
          ["Repeated courses.", "Some colleges replace the old grade with the new one, while others average both. Your registrar can confirm the policy."],
          ["Pass/fail courses.", "These usually don’t count toward GPA, though a failing grade sometimes does."],
          ["Transfer credits.", "Credits often transfer, but the grades may not, so they may not count toward your GPA at the new school."],
          ["Withdrawals.", "A “W” generally has no effect on GPA, but it can affect your financial aid progress."],
          ["Incomplete.", "An “I” usually stays out of your GPA until you finish the work and the grade is posted."],
        ]} />
      </Card>

      <Card title="Do Grades Really Matter, and Does GPA Matter in College?">
        <P>
          Yes, though how much depends on what you plan to do next. In high school, GPA is one of the main factors in college admissions. In
          college, it affects your academic standing, scholarship renewal, honors, and eligibility for graduate programs, and it can matter for
          your first job or internship. A GPA below 2.0 at many schools can lead to academic probation, and falling below the minimum can put
          financial aid at risk.
        </P>
        <P>
          After that, its weight fades. A few years into a career, employers care far more about your work history and skills than your college
          grades. For some paths, like medicine, law, and research careers, GPA stays important for longer.
        </P>
        <Lead lead="What is the difference between a 3.8 and a 4.0?">
          Less than most people think. Over a typical four-year degree of about 40 courses, a 3.8 means roughly eight B’s and the rest A’s, or a
          mix of A-minuses. Admissions and hiring teams know that one tough course can account for the gap. What they notice more is the trend,
          the difficulty of your courses, and everything else in your application.
        </Lead>
        <Lead lead="How do some students get near-4.0 GPAs?">
          Usually through habits rather than talent: attending every class, starting assignments early, going to office hours, and reviewing
          material weekly instead of cramming. We cover these in detail below. Course choice matters too. A student who spreads out difficult
          classes across semesters has a better shot than one who stacks them together.
        </Lead>
      </Card>

      <Card title="When You Need a GPA Calculator">
        <P>People reach for a GPA calculator in more situations than you might expect.</P>
        <Lead lead="Applications and scholarships.">
          Many applications and scholarships ask for a GPA or set a minimum, such as 3.0 or 3.5. Checking your number ahead of time tells you
          whether you’re eligible before you spend hours on forms.
        </Lead>
        <Lead lead="Grade planning.">
          If you want to reach a 3.5 by the end of the year, you can enter hypothetical grades and see what’s required. This is especially
          useful before finals, when one result could move your cumulative GPA noticeably.
        </Lead>
        <Lead lead="Academic standing.">
          Many colleges require a minimum GPA, often 2.0, to stay in good standing, and honors lists and programs set higher cutoffs. Knowing
          where you stand early gives you time to adjust.
        </Lead>
        <Lead lead="Transfers and graduate applications.">
          Transfer admissions and graduate programs often look at overall GPA and major-specific GPA separately. You can run the calculator
          once for all courses and again with only your major courses.
        </Lead>
        <Lead lead="Checking your transcript.">
          If you suspect a school-reported GPA is wrong, recalculating it from your grades is a quick check.
        </Lead>
      </Card>

      <Card title="What Counts as a Good GPA?">
        <P>
          There’s no universal answer, because the right target depends on your goals. In general, a 3.0 is considered solid, a 3.5 or above is
          strong and often meets the cutoffs for merit scholarships and honors lists, and a 3.7 or above is competitive for selective programs.
          A 2.0 is typically the minimum for graduation and good standing.
        </P>
        <P>
          Context matters too. A 3.4 in a rigorous course load with several AP or IB classes can say more than a 3.8 in a lighter schedule.
          Competitive majors such as engineering, nursing, and pre-med often grade more strictly, and admissions teams know it. Use your result
          as a guide, then compare it against the requirements of the specific school or program you’re targeting.
        </P>
      </Card>

      <Card title="What Is a Good GPA in the USA, UK, Canada, Australia, New Zealand, Italy, and France?">
        <P>Grading systems vary widely around the world, so a “good” number in one country can look odd in another.</P>
        <List items={[
          ["United States:", "The 4.0 scale is the standard. A 3.0 is solid and 3.5 or higher is strong."],
          ["United Kingdom:", "Universities use degree classifications instead of GPA. A First is typically 70 percent or higher, a 2:1 is 60 to 69, and a 2:2 is 50 to 59. A 2:1 or better is the usual benchmark for graduate study and many graduate jobs."],
          ["Canada:", "Many universities use a 4.0 or 4.3 scale, but the exact conversion varies by school and province. A B average (around 3.0) is a common benchmark for good standing, and graduate programs often look for a B+ or higher."],
          ["Australia:", "Many universities use a 7-point scale, where 7 is a High Distinction and 4 is a Pass. A Credit average (about 5) or better is often the threshold for postgraduate pathways, and 6 or above is considered excellent."],
          ["New Zealand:", "Universities such as Auckland use a 9-point grade scale. A B average is a common requirement for honors and postgraduate entry."],
          ["Italy:", "Exams are scored out of 30, with 18 as the pass mark. Final degrees are scored out of 110, with 66 as the minimum and 110 e lode (with honors) as the top."],
          ["France:", "Grades are out of 20, with 10 as the pass mark. Scores of 12, 14, and 16 correspond to the honors levels assez bien, bien, and très bien. Scores above 16 are rare, so a 15 is stronger than it looks to someone used to U.S. grading."],
          ["Germany:", "The scale runs backward. 1.0 is the best grade and 4.0 is the lowest passing grade. Master’s programs set their own requirements, so there’s no single national minimum."],
        ]} />
        <Lead lead="Why doesn’t the UK use GPA?">
          The UK system grew up around final exams and overall degree classifications rather than course-by-course averages. A few universities
          have tested GPA-style reporting, but classifications are still the standard. If you’re applying from the UK to a U.S. school, a
          credential evaluation service can translate your result.
        </Lead>
        <Lead lead="How do I convert a 10-point CGPA to a 4.0 GPA?">
          There’s no single official formula. A rough estimate is to divide your CGPA by 10 and multiply by 4, so an 8.0 becomes about 3.2. That
          usually understates strong performance, because an 8.0 on a 10-point scale is often treated as stronger than a 3.2 in the U.S. Many
          schools ask for a credential evaluation from a service such as WES, so check what your target school accepts.
        </Lead>
        <Lead lead="Does GPA matter for international students?">
          Yes. U.S. colleges and graduate programs review international transcripts and often convert them to the 4.0 scale. Admissions teams
          also look at test scores, English proficiency, and the grading culture of your home country.
        </Lead>
      </Card>

      <Card title="GPA and College Admissions: Stanford, MIT, Harvard, Oxford, and UCLA">
        <P>Admissions at top schools is competitive at every level, so a lower GPA hurts. Still, none of these schools sets an automatic cutoff.</P>
        <P>
          MIT and Stanford both review applications as a whole. MIT doesn’t publish a minimum GPA. Admitted students almost always have
          excellent grades in demanding courses, so a GPA that is strong for your school and course load matters, but it’s one factor among
          many.
        </P>
        <P>
          Harvard is similar. Grades are strong across the admitted class, and that continues in college. According to a report covered by The
          Harvard Crimson,{" "}
          <Ext href="https://www.thecrimson.com/article/2025/10/27/grading-workload-report">the median GPA at Harvard College was 3.83 for the Class of 2025</Ext>,
          up from 3.64 for the Class of 2015. This reflects grade inflation as well as a strong student body.
        </P>
        <P>
          Oxford doesn’t use GPA the way U.S. schools do. For most applicants, it looks at exam results, admissions tests, and interviews. U.S.
          applicants are assessed through their high school record and AP or similar scores.
        </P>
        <P>
          UCLA and other University of California campuses require a minimum GPA just to be eligible (3.0 for California residents and 3.4 for
          nonresidents, in the required courses). Admitted students, though, usually have GPAs well above that minimum, often near the top of
          the scale.
        </P>
        <Lead lead="Can you get into a top school with a poor GPA?">
          It’s possible but difficult. The most realistic ways are an upward trend in your grades, hard courses, high test scores where
          required, and a strong record outside the classroom, such as research, awards, or a significant project. An honest explanation of a
          hard year, if there is one, can also help. A top school with a low GPA is a reach, so build a school list with a range of options.
        </Lead>
      </Card>

      <Card title="GPA for Graduate School, Medical School, and PhD Programs">
        <Lead lead="Graduate school:">
          Many programs set a minimum GPA of around 3.0, and competitive ones often look for 3.5 or higher. A strong application also depends on
          test scores where required, recommendation letters, a clear statement of purpose, and relevant experience.
        </Lead>
        <Lead lead="PhD programs:">
          GPA is used mostly as a screening tool. After that, research experience, letters from faculty, and fit with a lab or advisor tend to
          count for more. Your grades in major-related courses matter more than your overall number.
        </Lead>
        <Lead lead="Medical school:">
          GPA matters a lot here. Data from the AAMC shows matriculants to U.S. MD programs in 2025 had a mean GPA of 3.81, compared with 3.67
          for all applicants. Those are averages, not minimums, and osteopathic (DO) schools tend to have somewhat lower averages, around 3.6.
        </Lead>
        <Lead lead="How is it possible to get into medical school with a 3.0?">
          It’s hard, but some people do it. Common routes include a strong MCAT score, a post-baccalaureate or special master’s program that
          shows you can handle science coursework, a clear upward trend in grades, meaningful clinical experience, and applying to DO programs,
          some of which let you replace a retaken course grade. Expect a longer timeline and plan for it.
        </Lead>
      </Card>

      <Card title="Is GPA Important for Jobs, Internships, and Your Resume?">
        <P>
          It depends on your experience. For new graduates, GPA can matter, and some employers set a cutoff such as 3.0 for internships and
          entry-level programs, especially in finance, consulting, engineering, and large corporate programs. After you have a couple of years
          of work experience, most employers stop asking.
        </P>
        <Lead lead="Should you put your GPA on your resume?">
          A reasonable rule is to include it if it’s 3.5 or above, or if the employer asks. If it’s lower and you have strong projects,
          internships, or skills, you can leave it off, unless the application requires it. Never round up or misstate it, because background
          checks and transcript requests are common.
        </Lead>
        <Lead lead="Can you get a job at Google or similar companies with a low GPA?">
          Google’s former head of people operations said in 2013 that GPA and test scores were poor predictors of job performance, and that the
          company largely stopped asking for them from people a few years out of school. Student and entry-level programs may still ask for
          academic information, so check each posting. A 2.6 GPA doesn’t automatically rule you out for a technical internship, but you’ll need
          to stand out through projects, skills, and referrals.
        </Lead>
        <Lead lead="Do airlines look at GPA for new pilots?">
          Mostly no. Airlines focus on your pilot certificates, ratings, flight hours, and medical certificate. Some cadet and pathway programs,
          and some university-based programs, set a minimum GPA, often in the 2.5 to 3.0 range, so check the requirements of the program you’re
          considering.
        </Lead>
      </Card>

      <Card title="Advantages and Disadvantages of a Low GPA">
        <P>
          A low GPA has a few indirect upsides, and they only help if you use them. Students with lower grades sometimes spend more time on work
          experience, projects, or research. Many also learn resilience and a better sense of what actually works for them. Some find that a bad
          stretch pushes them to change their study approach or major, which can lead to a better fit.
        </P>
        <P>
          The disadvantages are more concrete. A low GPA can disqualify you from scholarships, honors programs, and competitive majors. It can
          put you on academic probation if it falls below your school’s minimum, and it can affect your financial aid eligibility. It can also
          make graduate admissions, some internships, and certain first jobs harder to get.
        </P>
        <P>
          If your GPA is low, the best response is to look at the numbers and plan. Use this GPA calculator to see how many credits of strong
          grades it would take to reach your goal, since the effect of each new semester shrinks as your total credits grow. Also ask whether
          your school allows grade replacement or forgiveness for repeated courses, because that can raise your GPA faster than new classes
          alone.
        </P>
      </Card>

      <Card title="How to Raise Your GPA">
        <P>There’s no guaranteed formula, and what works for one student may not work for another. These habits do help most people.</P>
        <Lead lead="Go to class and take part.">
          Even when notes are posted online, class is where you hear what the professor stresses, catch changes to deadlines or exam formats,
          and get questions answered on the spot. Professors also tend to be more understanding of a student they recognize if an emergency
          comes up.
        </Lead>
        <Lead lead="Plan around your own style.">
          Some people work best in long sessions, and others do better with short bursts and breaks. Pick the approach that gets the most done
          in the time you have. Keep notes organized so you can find them later, because notes you can’t use don’t help you study.
        </Lead>
        <Lead lead="Manage your time and course load.">
          A packed schedule can lower your grades in every class. After you register, estimate the weekly hours each course needs and map them
          onto your calendar. If the total doesn’t fit, it’s better to find out before the semester starts.
        </Lead>
        <Lead lead="Review a little every week.">
          Short, regular review sessions work better than cramming the night before. They also save time overall, because you aren’t relearning
          everything at once.
        </Lead>
        <Lead lead="Use office hours and tutoring.">
          Most students never go, which is why the ones who do get an edge. A ten-minute conversation can clear up something you’ve been stuck on
          for a week.
        </Lead>
        <Lead lead="Check the syllabus for grade weights.">
          If a final exam is worth 40 percent, that’s where your effort should go. Knowing the weights also tells you how much room you have left
          to recover from a bad grade.
        </Lead>
        <Lead lead="Use the calculator to set targets.">
          Enter the grades you need in each class to hit a goal GPA. It turns a vague goal into a specific one.
        </Lead>
      </Card>

      <Card title="Why Changing Grades Illegally Backfires">
        <P>
          Some students, in a panic over a transcript, search for someone to hack their university’s system and change their grades. We won’t
          point you to anyone, and you shouldn’t look. Anyone offering this service online is either a scammer who will take your money and
          disappear or someone who will use your information against you.
        </P>
        <P>
          The risks are serious. Altering academic records is a crime in most countries and can lead to criminal charges. Schools take it
          seriously too. Consequences include expulsion, a revoked degree (even years later), a permanent mark on your record, and difficulty
          getting into other schools or jobs. Hacked records are also often caught, because registrars audit changes and compare them against
          course and instructor records.
        </P>
        <P>
          There are legitimate options that work. You can appeal a grade if you believe it was a mistake, ask about an incomplete or late
          withdrawal in case of illness or emergency, retake the course under a grade replacement policy, or meet with an academic advisor about
          a recovery plan. These take effort, but they leave your record and your future intact.
        </P>
      </Card>

      <Card title="Accuracy, Privacy, and Cost">
        <P>
          This tool is free and doesn’t require an account or signup. The calculations follow the standard grade-point formulas shown above, so
          results match what you’d get working it out by hand. Because grading policies vary, treat the output as a reliable estimate. Your
          official GPA is the one your school’s registrar or transcript reports, and the two can differ if your institution uses an unusual
          scale, rounding rule, or repeat-course policy.
        </P>
        <P>
          The tool only asks for course details such as grades, credits, and course level. It doesn’t ask for your name, email, or student ID,
          so you don’t need to share anything personal to get a result.
        </P>
      </Card>

      <Card title="How to Use the GPA Calculator Step by Step">
        <P>
          Start by choosing whether you’re calculating a high school or college GPA, and whether your courses carry credits. Then add one row
          per course.
        </P>
        <List ordered items={[
          ["", "Enter the course name. This is optional, but it helps when you’re checking against a transcript."],
          ["", "Select the letter grade you earned or expect to earn. Plus and minus grades are supported."],
          ["", "Add the credit hours, if your school uses them. College courses are typically 3 or 4 credits, while many high school courses are 1 credit or count equally."],
          ["", "Mark the course level (regular, honors, AP, IB, or college-level) if you want a weighted result."],
          ["", "Read your GPA as it updates."],
        ]} />
        <P>
          If your school reports percentage grades, such as 91 or 84, convert them to letter grades first using your school’s grading scale, then
          enter the letters. To calculate a cumulative GPA, enter your current GPA and the total credits you’ve completed, then add the new
          semester’s courses. The tool merges both into one running figure.
        </P>
        <P>
          If you’re still in the middle of a term, you can enter projected grades to see where you’d land. That turns the calculator into a
          planning tool as well as a record-keeping one.
        </P>
      </Card>

      <Card title="What This GPA Calculator Does">
        <P>
          The tool covers the situations students run into most often. You can calculate a single semester or your whole academic record. You
          can use a plain unweighted scale, or a weighted one that gives extra points for harder classes. If your school counts credits, add
          them. If it treats every class equally, leave them out and the tool averages your grade points directly.
        </P>
        <P>
          That flexibility matters because “GPA” isn’t one fixed formula. A high school student with six equal-weight classes, a college
          sophomore with a mix of 3- and 4-credit courses, and a student who took AP Calculus all need slightly different math. This GPA
          calculator adjusts to each case instead of forcing everyone into one method.
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
