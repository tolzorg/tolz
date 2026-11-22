import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my college GPA?", a: "Multiply each course’s grade points by its credit hours, add those results together, and divide by your total credits. For example, a 3.0 in a 3-credit course gives you 9 quality points. This calculator does all of those steps for you." },
  { q: "How do I calculate my cumulative GPA across semesters?", a: "Combine every course from every semester, add up all the quality points, and divide by total credits. Do not average your semester GPAs, since that ignores differences in credit load. Entering all your courses into the calculator gives you the correct number." },
  { q: "How many courses can I add to this GPA calculator?", a: "You can enter up to 30 courses, which is enough to cover several semesters or a large share of a bachelor’s degree." },
  { q: "Is this college GPA calculator free?", a: "Yes. It is free to use, and you can calculate without creating an account." },
  { q: "What is the 4.0 scale?", a: "It is a grading system where an A equals 4.0, a B equals 3.0, a C equals 2.0, a D equals 1.0, and an F equals 0. Many schools add plus and minus values, such as 3.7 for an A- and 3.3 for a B+." },
  { q: "Does an A+ count as 4.3?", a: "At some schools, yes, but most cap the scale at 4.0. Check your school’s grading policy and use the values that match it." },
  { q: "What GPA do I need to stay in good standing?", a: "Most colleges require a 2.0 cumulative GPA, though some programs and scholarships set higher minimums. Your student handbook or registrar can confirm the exact requirement." },
  { q: "Do withdrawals and pass/fail courses affect my GPA?", a: "Typically no. W, P, and CR grades are usually left out of GPA, though policies vary, especially for failing grades in pass/fail courses." },
  { q: "Can I use this calculator to plan future grades?", a: "Yes. Enter your completed courses, then add upcoming courses with the grades you are aiming for to see your projected GPA." },
  { q: "What is a good GPA in college?", a: "A 3.0 is often the baseline for scholarships and many programs, while 3.5 or higher is considered strong. Competitive graduate and professional programs typically expect higher." },
  { q: "What is considered a low college GPA?", a: "Below 2.5 is generally seen as low, and below 2.0 can lead to academic probation. A GPA under 3.0 may also fall below many employer and scholarship cutoffs." },
  { q: "Do employers care about college GPA?", a: "Many do for entry-level roles, and some set a 3.0 minimum. The importance fades as you gain work experience." },
  { q: "Should I put my GPA on my resume or LinkedIn?", a: "If it is 3.5 or higher and you graduated recently, it usually helps. If it is below 3.0, many people leave it off and highlight skills and experience. Never list a GPA that is not accurate." },
  { q: "Will dual enrollment classes affect my college GPA?", a: "They can. Grades from dual enrollment usually become part of your record at the college that offered the course, and they may count toward your GPA there. Policies differ when you transfer to another school." },
  { q: "Is my calculated GPA the same as my official GPA?", a: "It should match if your school uses the standard 4.0 scale and you enter every course accurately. Your official transcript is always the final record." },
];

// The supplied FAQ schema is a shorter set of nine questions, two of them with
// trimmed answers, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate my college GPA?", a: "Multiply each course's grade points by its credit hours, add those results together, and divide by your total credits. This calculator does all of those steps for you." },
  { q: "How do I calculate my cumulative GPA across semesters?", a: "Combine every course from every semester, add up all the quality points, and divide by total credits. Do not average your semester GPAs, since that ignores differences in credit load." },
  { q: "How many courses can I add to this GPA calculator?", a: "You can enter up to 30 courses, which is enough to cover several semesters or a large share of a bachelor's degree." },
  { q: "Is this college GPA calculator free?", a: "Yes. It is free to use, and you can calculate without creating an account." },
  { q: "What is considered a low college GPA?", a: "Below 2.5 is generally seen as low, and below 2.0 can lead to academic probation. A GPA under 3.0 may also fall below many employer and scholarship cutoffs." },
  { q: "Do employers care about college GPA?", a: "Many do for entry-level roles, and some set a 3.0 minimum. The importance fades as you gain work experience." },
  { q: "Should I put my GPA on my resume or LinkedIn?", a: "If it is 3.5 or higher and you graduated recently, it usually helps. If it is below 3.0, many people leave it off and highlight skills and experience. Never list a GPA that is not accurate." },
  { q: "Will dual enrollment classes affect my college GPA?", a: "They can. Grades from dual enrollment usually become part of your record at the college that offered the course, and they may count toward your GPA there. Policies differ when you transfer to another school." },
  { q: "Does an A+ count as 4.3?", a: "At some schools, yes, but most cap the scale at 4.0. Check your school's grading policy and use the values that match it." },
];

const SCALE_HEADERS = ["Letter Grade", "Grade Points"];
const SCALE_ROWS = [
  ["A", "4.0"], ["A-", "3.7"], ["B+", "3.3"], ["B", "3.0"], ["B-", "2.7"], ["C+", "2.3"], ["C", "2.0"],
  ["C-", "1.7"], ["D+", "1.3"], ["D", "1.0"], ["D-", "0.7"], ["F", "0.0"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 260 }}>
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

export default function CollegeGpaCalculatorFaqSection() {
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

      <Card title="What Is College GPA?">
        <P>
          GPA stands for grade point average. In college, it is a number from 0.0 to 4.0 that summarizes your grades across all your courses. It
          is not a plain average of your letter grades. Each course is weighted by its credit hours, so a 4-credit chemistry class affects your
          GPA more than a 1-credit seminar. That weighting is what registrars use, and it is the step people most often miss when they calculate
          by hand.
        </P>
        <P>
          Schools use GPA to decide whether you are in good standing, whether you qualify for honors, and whether you are eligible for certain
          majors, scholarships, and programs. Employers sometimes use it as a quick first filter for entry-level jobs, and graduate schools look
          at it alongside your coursework and your grade trend.
        </P>
        <P>
          A college GPA calculator does the math for you. You enter each course, its letter grade, and its credits. The tool multiplies, adds,
          and divides, then shows your result. Because it supports up to 30 courses, you can calculate a single semester, a full year, or most of
          a four-year degree in one session.
        </P>
      </Card>

      <Card title="How to Calculate Your College GPA">
        <P>Knowing the formula helps you trust the result and catch entry mistakes. Each letter grade has a grade point value on the 4.0 scale:</P>
        <DataTable headers={SCALE_HEADERS} rows={SCALE_ROWS} />
        <P>
          The calculation has three steps. First, multiply each course’s grade points by its credits to get quality points. Second, add all the
          quality points together. Third, divide that total by your total credits attempted.
        </P>
        <P>
          Here is a worked example. Say you took Calculus (4 credits, B+), English Composition (3 credits, A), Psychology (3 credits, B), and a
          lab (1 credit, A-).
        </P>
        <List items={[
          ["Calculus:", "3.3 × 4 = 13.2"],
          ["English:", "4.0 × 3 = 12.0"],
          ["Psychology:", "3.0 × 3 = 9.0"],
          ["Lab:", "3.7 × 1 = 3.7"],
        ]} />
        <P>Total quality points: 37.9. Total credits: 11. GPA: 37.9 ÷ 11 = 3.45.</P>
        <P>
          A simple average of the four grade values (3.3, 4.0, 3.0, 3.7) would give 3.5. The gap is small here, but it grows when credit loads
          differ a lot. That is why a credit-aware calculator matters.
        </P>
        <P>
          Some schools differ slightly. A few award 4.3 for an A+, and some do not use plus/minus grades at all. If your school’s scale is
          different from the table above, check your registrar’s grading policy before relying on any result as an official figure.
        </P>
      </Card>

      <Card title="Semester GPA vs. Cumulative GPA">
        <P>
          These two numbers answer different questions. Your semester GPA covers only the courses from one term. Your cumulative GPA covers
          everything you have taken at your school so far.
        </P>
        <P>
          Your cumulative GPA is not an average of your semester GPAs. If you earned a 3.8 in a 12-credit semester and a 3.0 in an 18-credit
          semester, the heavier semester pulls your cumulative GPA below the midpoint of 3.4. The correct method is to combine all quality points
          and all credits across semesters, then divide once. Entering every course into this tool does exactly that.
        </P>
        <P>
          Cumulative GPA is what appears on your transcript and what most requirements refer to. Semester GPA helps you spot trends, qualify for
          the Dean’s List, and tell whether a rough term was a one-time dip or the start of a pattern.
        </P>
      </Card>

      <Card title="How Do I Look Up My College GPA?">
        <P>
          If you just want to know your current GPA, you can usually find it without calculating anything. Start with your school’s student
          portal. Most colleges show your semester and cumulative GPA under “academic record,” “grades,” or “unofficial transcript.” If you cannot
          find it there, try your degree audit, which often lists your GPA along with your progress toward graduation.
        </P>
        <P>
          For an official number, request a transcript from your registrar’s office. Official transcripts can be sent directly to employers,
          scholarship programs, or other schools. Your academic advisor can also tell you your GPA and explain how your school counts repeated
          courses or transfer credits.
        </P>
        <P>
          Your portal shows the number your school has already calculated. A calculator is for when you want to know your GPA before grades post,
          after a hypothetical grade change, or after a future semester. If your calculated result and your portal number do not match, the
          difference usually comes from a school policy, such as grade replacement or a different value for A+.
        </P>
      </Card>

      <Card title="When You Would Need a College GPA Calculator">
        <P>Several situations come up often, and many are time-sensitive:</P>
        <List items={[
          ["Scholarship renewal.", "Many scholarships require a minimum cumulative GPA, often 3.0 or higher. Calculating your standing before grades post tells you whether a final exam could change your eligibility."],
          ["Academic probation and good standing.", <>Most schools require a 2.0 cumulative GPA to stay in good standing, and federal financial aid also requires students to make satisfactory academic progress. You can read the basics on the <Ext href="https://studentaid.gov/">Federal Student Aid website</Ext>. If you are close to the line, a precise calculation shows what grades you need to recover.</>],
          ["Graduate and professional school applications.", "Admissions committees see your cumulative GPA and often a major GPA. Knowing both early helps you decide which courses to prioritize."],
          ["Honors and Dean’s List.", "Latin honors such as cum laude, magna cum laude, and summa cum laude use GPA cutoffs that vary by school. A calculator lets you measure yourself against your school’s published numbers."],
          ["Course planning.", "Before choosing a lighter or heavier load, you can enter hypothetical grades to see how each option would change your cumulative GPA."],
          ["Applications and resumes.", "Internship and job applications often ask for your GPA, and an exact figure is better than a rounded guess."],
        ]} />
      </Card>

      <Card title="Special Cases That Affect Your GPA">
        <P>Real transcripts are messier than a four-course example. Here is how common complications usually work, though your school’s policy always has the final say.</P>
        <List items={[
          ["Plus/minus grades.", "If your school uses them, select the exact grade so the right decimal value is applied. If your school only gives whole letter grades, use A, B, C, D, and F."],
          ["Repeated courses.", "Policies vary widely. Some schools replace the old grade with the new one, others average both, and others count both attempts. To mirror a replacement policy, leave out the original attempt."],
          ["Pass/fail and withdrawals.", "A pass (P), credit (CR), or withdrawal (W) typically does not affect GPA, so leave those courses out. A failing grade in a pass/fail course may count as an F at some schools, so check your policy."],
          ["Transfer credits.", "Transfer credits usually count toward degree requirements but not toward your GPA at your current school. Leave them out unless your school says it includes them."],
          ["Weighted vs. unweighted.", "College GPAs are almost always unweighted, meaning an A in any course earns 4.0 no matter how hard the course is. Weighted scales, where honors or AP classes can earn 5.0, are a high school convention, so this tool is not built for them."],
        ]} />
      </Card>

      <Card title="Will a Dual Enrollment Class Affect My College GPA?">
        <P>
          It can. When you take a college course while still in high school, the college creates a transcript for you, and your grade becomes
          part of that record. If you later enroll at that same college, those grades usually count toward your cumulative GPA there, for better
          or worse.
        </P>
        <P>
          If you move to a different college, the credits may transfer, but the grades often do not count in your new GPA. Some schools do
          include them, so ask the registrar or admissions office. A low grade in a dual enrollment class can still matter, because colleges that
          review your application may see that transcript, and it may affect your aid eligibility at the school where you took the course.
        </P>
        <P>
          When you use this calculator, include dual enrollment courses only if your college counts them in your GPA. If you are unsure, run the
          numbers both ways to see how much difference it makes.
        </P>
      </Card>

      <Card title="How Much Does College GPA Matter in the Real World?">
        <P>
          It matters most at the start of your career and at key checkpoints along the way. During college, your GPA controls things that are
          easy to measure: scholarships, good standing, honors, and entry into competitive majors. After college, its influence is real but fades
          with time.
        </P>
        <P>
          For your first job or internship, GPA can open or close doors, especially at large employers that screen many applicants. For graduate
          school, it is one of the main numbers reviewers see. After a few years of work experience, most employers care more about what you have
          done than what you scored in school.
        </P>
        <P>
          It also helps to remember that GPA is not read in a vacuum. A 3.3 in a demanding major at a rigorous school can carry more weight than a
          3.8 in an easier program. Readers know this, and they look at your course load, your major, and whether your grades improved over time.
        </P>
      </Card>

      <Card title="Do Jobs Care About Your College GPA?">
        <P>
          Some do, and some do not. Large companies and structured recruiting programs often set a GPA minimum, commonly 3.0, to narrow a big pool
          of applicants. According to the National Association of Colleges and Employers, a majority of employers report screening candidates by
          GPA, though that share has changed over the years. You can see the latest findings on the{" "}
          <Ext href="https://www.naceweb.org/">NACE website</Ext>.
        </P>
        <P>
          Smaller companies, startups, and employers hiring for hands-on roles tend to care less. They often look at projects, internships,
          portfolios, and interviews. Once you have a year or two of relevant experience, GPA usually drops off your resume or becomes a minor
          detail.
        </P>
        <P>
          If a job posting lists a minimum GPA, take it seriously. An automated screening tool may filter you out before a person reads your
          application. If your GPA is below the cutoff, focus on roles that do not list one and on getting your resume in front of a real person
          through networking.
        </P>
      </Card>

      <Card title="Does a College GPA Matter for Engineering Jobs?">
        <P>
          Yes, particularly early on. Many engineering employers ask for your GPA on applications for internships, co-ops, and entry-level roles,
          and a 3.0 minimum is common. Because engineering coursework is demanding, many hiring managers understand that grades in these programs
          tend to run lower than in other fields.
        </P>
        <P>
          Your major GPA, meaning your grades in engineering and technical courses, can matter as much as your overall number. Hands-on experience
          counts for a great deal in this field. Internships, co-op placements, lab work, design projects, and student teams like robotics or
          Formula SAE often make up for a modest GPA. If you plan to go to graduate school in engineering, expect GPA to carry more weight.
        </P>
      </Card>

      <Card title="Does College GPA Matter in Recruitment at Top Business Schools?">
        <P>
          For MBA programs, GPA is one piece of a larger application. Admissions teams review your undergraduate GPA along with your GMAT or GRE
          score, work experience, essays, recommendations, and interview. At the most selective programs, admitted students often have a GPA above
          3.5, but there is no single cutoff, and the average is only an average.
        </P>
        <P>
          A lower GPA is not the end of the road. A strong test score, steady career progress, and a clear story can balance it out. Many programs
          also allow an optional essay where you can explain a rough semester or a weak start, as long as you keep it brief and honest. Admissions
          teams also notice upward trends and the difficulty of your major.
        </P>
        <P>
          If you are applying for undergraduate business programs or recruiting for finance and consulting jobs, expect GPA to be weighed more
          heavily. Some firms in those fields have informal cutoffs, often reported around 3.5. Check each employer’s stated requirements.
        </P>
      </Card>

      <Card title="Should I Put My College GPA on My LinkedIn Profile?">
        <P>
          LinkedIn lets you add your GPA in the education section, but it is optional. A simple rule works well for most people. If your GPA is
          3.5 or higher and you graduated recently, listing it helps. If it is between 3.0 and 3.5, it is your call, and many people include it
          when applying to roles that ask for it. If it is below 3.0, most people leave it off and highlight skills, projects, internships, and
          certifications instead.
        </P>
        <P>
          Once you have a few years of work experience, your GPA matters less, and your job history should take the lead. Whatever you decide,
          never round up or change your number. Employers can verify it, and a false GPA can cost you an offer. If an application asks for your
          GPA directly, give the exact figure. You can also list your major GPA if it is higher and you label it clearly.
        </P>
      </Card>

      <Card title="Does College GPA Correlate With Salary?">
        <P>
          The connection is weaker than most students expect. Some research suggests that GPA has a small effect on early-career pay, mostly
          because it can help you land a first job at a higher-paying employer. Over time, that effect fades, and other factors take over: your
          major, industry, location, skills, and work record.
        </P>
        <P>
          In other words, a higher GPA may help you start with a better offer, but it does not set your earning potential for life. Choosing a
          high-demand field and building real experience usually does more for your income than a few tenths of a point.
        </P>
      </Card>

      <Card title="Why Is the Average Millionaire’s College GPA 2.9?">
        <P>
          This figure comes from researcher Thomas Stanley, who surveyed self-made millionaires for his book The Millionaire Mind and reported an
          average college GPA of about 2.9. It gets repeated often because it feels surprising.
        </P>
        <P>
          Before you read too much into it, keep a few things in mind. The study looked at a specific group, many of them business owners, and it
          was conducted years ago. An average of 2.9 also means that many of those millionaires had higher GPAs, and some had lower. And the data
          shows what the group had in common, not that a lower GPA causes wealth.
        </P>
        <P>
          What the finding does suggest is that traits GPA does not measure well, like persistence, willingness to take risks, people skills, and
          good judgment, play a big role in long-term success, especially in running a business. It does not mean grades are pointless, and it is
          not a reason to stop trying.
        </P>
      </Card>

      <Card title="What Is the Correlation Between SAT Scores and College GPA?">
        <P>
          SAT scores have a moderate relationship with college GPA, especially in the first year. Students with higher scores tend to earn higher
          grades on average, but the link is far from perfect. Plenty of students with modest scores do very well, and some with high scores
          struggle.
        </P>
        <P>
          Research on college admissions has also found that high school GPA is a strong predictor of college GPA, and that using both together
          predicts better than either alone. Habits like attendance, time management, and asking for help matter a lot once you are in college,
          and no test score captures them. Many schools are now test-optional, so your high school record and your college grades carry more
          weight for you than a single exam.
        </P>
      </Card>

      <Card title="How Important Is College GPA to a Person?">
        <P>
          It depends on your goals. If you want to go to law school, medical school, or a competitive graduate program, your GPA is very
          important, since it is one of the main numbers reviewers use. If you need to keep a scholarship, your GPA is important in a very direct
          way.
        </P>
        <P>
          If you plan to work in a field that values portfolios or hands-on skills, like design, software development, or the trades, your GPA is
          usually less important than your work. Even then, a very low GPA can limit your options for a first job.
        </P>
        <P>
          On a personal level, GPA can also affect how you feel about your progress. A single number can seem like a verdict on your ability, but
          it is only a record of your grades under particular circumstances. It is worth tracking, but it should not be the only measure you use
          to judge yourself.
        </P>
      </Card>

      <Card title="What Can a College GPA Never Measure?">
        <P>
          GPA tells you how you performed on graded work. It cannot show how much you learned beyond the exam, how well you work on a team, how
          creative you are, or how you handle pressure. It does not reflect leadership, communication skills, work ethic outside of class, or the
          obstacles you may have faced, such as working long hours, caring for family, or dealing with health issues.
        </P>
        <P>
          It also cannot compare courses that vary in difficulty. A 3.5 from a student who took hard lab sciences and a 3.5 from a student who
          took lighter electives look identical on paper. This is why employers and admissions committees look at other evidence, such as
          projects, internships, recommendations, and interviews. You should do the same when you describe your strengths.
        </P>
      </Card>

      <Card title="What Is Considered a Low College GPA?">
        <P>
          Most people consider a GPA below 2.5 to be low, and anything under 2.0 puts you at risk. A 2.0 is the usual minimum for good standing,
          so a cumulative GPA below that often leads to academic probation, loss of financial aid, or in some cases dismissal from the school.
        </P>
        <P>
          Between 2.0 and 3.0, your GPA is passing but may fall under cutoffs for scholarships, honors programs, and many employer screens, which
          commonly sit at 3.0. A 3.0 is often seen as average to solid, a 3.5 as strong, and a 3.7 or higher as excellent. Competitive graduate
          programs usually expect at least 3.5. These ranges are general, and the standards for your major, school, and career goals may differ.
        </P>
      </Card>

      <Card title="What Are Some Ways to Overcome a Low College GPA?">
        <P>A low GPA is easier to fix the earlier you start, because later grades have more room to move the average. These steps help:</P>
        <Lead lead="Find out exactly what you need.">
          Enter your current courses into the calculator, then add the courses you plan to take with target grades. Change the grades until you
          reach the GPA you want. This shows the average grade you need going forward, so you are working toward a clear number.
        </Lead>
        <P>
          For example, suppose you have 60 credits at a 2.5 GPA, which is 150 quality points. If you earn a 3.5 across your next 30 credits, you
          add 105 quality points. Your new total is 255 points over 90 credits, which comes to about 2.83. Seeing the math makes the goal feel
          more realistic.
        </P>
        <Lead lead="Retake courses if your school allows grade replacement.">
          Replacing a D or F can raise your GPA right away. Ask your advisor how your school handles retakes before you sign up.
        </Lead>
        <Lead lead="Put extra effort into high-credit courses.">
          A 4-credit class moves your GPA more than a 2-credit class, so a better grade there pays off more.
        </Lead>
        <Lead lead="Use the support your school offers.">
          Tutoring centers, office hours, writing labs, and study groups help many students raise their grades. Meeting with your advisor can
          also help you choose a balanced schedule.
        </Lead>
        <Lead lead="Build an upward trend.">
          Admissions committees and employers pay attention to improvement. Strong grades in your last two years can offset a weak start.
        </Lead>
        <Lead lead="Strengthen the rest of your profile.">
          Internships, research, projects, certifications, and good recommendations give readers other reasons to take you seriously. If a gap in
          your record has an explanation, such as illness or family issues, a short, honest note in your application can provide context.
        </Lead>
      </Card>

      <Card title="Accuracy, Privacy, and Cost">
        <P>
          The calculator uses the standard grade-point formula explained above. For schools that use the common 4.0 scale, results should match
          your transcript’s cumulative GPA when you enter the same courses, grades, and credits. Differences usually come from school policies
          like repeat-course replacement or an A+ valued at 4.3. For official certification, such as a scholarship application, confirm your GPA
          with your registrar.
        </P>
        <P>
          The tool is free to use. You can calculate your GPA without creating an account, and you do not need to enter your name or student ID.
          The calculator only needs your grades and credit numbers, so there is no reason to share personal details.
        </P>
      </Card>

      <Card title="How to Use the College GPA Calculator">
        <P>Using the tool takes less than a minute:</P>
        <List ordered items={[
          ["", "Add a row for each course you took or are taking."],
          ["", "Select the letter grade for each course."],
          ["", "Enter the credit hours, which are listed on your transcript or registration page."],
          ["", "Repeat for every course in the semester you want to calculate."],
          ["", "To get a cumulative result, add courses from your earlier semesters too."],
          ["", "Read your GPA from the results, then change any grade to test different outcomes."],
        ]} />
        <P>
          Use credits exactly as your school lists them. If your school uses a quarter system or assigns units instead of credits, enter those
          numbers in the credit field. The math works the same way.
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
