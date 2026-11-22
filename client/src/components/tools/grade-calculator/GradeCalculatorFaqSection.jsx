import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a grade calculator?", a: "A grade calculator is an online tool that combines your assignment scores into one overall course grade. It can work with letter grades, percentages or points, and it can apply category weights when your syllabus uses them." },
  { q: "How do I calculate my overall grade?", a: "For an unweighted course, divide the total points you have earned by the total points possible, then multiply by 100. For a weighted course, find the average in each category, multiply it by that category’s weight, and add the results. The grade calculator above does both in one step." },
  { q: "What is the difference between a weighted and unweighted grade?", a: "An unweighted grade treats every point equally, so larger assignments count for more. A weighted grade gives each category, such as exams or homework, a fixed percentage of the final grade, no matter how many items it contains." },
  { q: "How do I calculate a weighted grade?", a: "Multiply each category’s average score by its weight written as a decimal, then add the products. For instance, a 90 average in a category worth 30 percent contributes 27 points to the final grade. Make sure all weights add up to 100 percent." },
  { q: "How do I convert a percentage to a letter grade?", a: "Find your percentage on your school’s grading scale. On a common US 10-point scale, 90 to 100 is an A, 80 to 89 is a B, 70 to 79 is a C, 60 to 69 is a D, and below 60 is an F. Some schools use plus and minus grades or different cutoffs." },
  { q: "Can I use the grade calculator with letter grades?", a: "Yes. Letter grades are converted to numeric values using the grading scale and then averaged. For the most precise result, use percentages or points when you have them, since a letter hides the exact score behind it." },
  { q: "Can I change the grading scale?", a: "Yes. The scale is adjustable, so you can set the percentage ranges for A, B, C and so on to match your school or instructor, including plus and minus grades." },
  { q: "What is a passing grade in high school?", a: "In most US high schools, a D (about 60 percent) is the lowest passing grade, though some districts require 65 or 70 percent. Many Canadian high schools pass students at 50 percent. Check your school’s handbook for the exact rule." },
  { q: "How does extra credit affect my grade?", a: "In a points-based class, extra credit is usually added to your earned points but not to the total possible, which raises your percentage. In a weighted class, it raises the average of one category, so its effect depends on that category’s weight." },
  { q: "Is this grade calculator free, and do I need to sign up?", a: "It is free to use, and you do not need to create an account to get your result." },
  { q: "Does the calculator work for college courses?", a: "Yes. It handles points-based and weighted syllabi, which are the two formats most college courses use. Enter your categories, weights and scores as listed in your syllabus." },
  { q: "Why is my calculated grade different from my school portal?", a: "Common causes are different weights, dropped lowest scores, extra credit handling, missing assignments, ungraded work and rounding rules. Compare your entries with the syllabus and the portal’s itemized list to find the difference." },
];

// The supplied FAQ schema trims several of these answers, so it is kept
// verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a grade calculator?", a: "A grade calculator is an online tool that combines your assignment scores into one overall course grade. It can work with letter grades, percentages or points, and it can apply category weights when your syllabus uses them." },
  { q: "How do I calculate my overall grade?", a: "For an unweighted course, divide the total points you have earned by the total points possible, then multiply by 100. For a weighted course, find the average in each category, multiply it by that category's weight, and add the results." },
  { q: "What is the difference between a weighted and unweighted grade?", a: "An unweighted grade treats every point equally, so larger assignments count for more. A weighted grade gives each category a fixed percentage of the final grade, no matter how many items it contains." },
  { q: "How do I calculate a weighted grade?", a: "Multiply each category's average score by its weight as a decimal, then add the products. Make sure all weights add up to 100 percent." },
  { q: "How do I convert a percentage to a letter grade?", a: "Find your percentage on your school's grading scale. On a common US 10-point scale, 90 to 100 is an A, 80 to 89 is a B, 70 to 79 is a C, 60 to 69 is a D, and below 60 is an F. Some schools use plus and minus grades or different cutoffs." },
  { q: "Can I use the grade calculator with letter grades?", a: "Yes. Letter grades are converted to numeric values using the grading scale and then averaged. For the most precise result, use percentages or points when you have them." },
  { q: "Can I change the grading scale?", a: "Yes. The scale is adjustable, so you can set the percentage ranges for each letter grade to match your school or instructor." },
  { q: "What is a passing grade in high school?", a: "In most US high schools, a D (about 60 percent) is the lowest passing grade, though some districts require 65 or 70 percent. Many Canadian high schools pass students at 50 percent. Check your school's handbook for the exact rule." },
  { q: "How does extra credit affect my grade?", a: "In a points-based class, extra credit is usually added to your earned points but not to the total possible, which raises your percentage. In a weighted class, it raises the average of one category, so its effect depends on that category's weight." },
  { q: "Is this grade calculator free, and do I need to sign up?", a: "It is free to use, and you do not need to create an account to get your result." },
  { q: "Does the calculator work for college courses?", a: "Yes. It handles points-based and weighted syllabi, which are the two formats most college courses use." },
  { q: "Why is my calculated grade different from my school portal?", a: "Common causes are different weights, dropped lowest scores, extra credit handling, missing assignments, ungraded work and rounding rules." },
];

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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function GradeCalculatorFaqSection() {
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

      <Card title="What Is Score Grading? A Short History">
        <P>
          Score grading is the way a school turns your work into a number or letter that can be recorded, compared and averaged. The score shows
          how much of an assignment you got right, and the grade tells you what that score means. An 85 percent, for example, is a B on most
          scales.
        </P>
        <P>
          Schools did not always work this way. In 1785, Yale president Ezra Stiles ranked students with four Latin labels, running from
          “optimi” at the top down to “pejores” at the bottom. Harvard later sorted students into numbered classes, with the last class meaning
          failure. Every college did it differently, so a ranking from one school told you little about another. Mount Holyoke College is
          usually credited with the first letter scale close to the one we use today, in the late 1800s. It ran from A to E, counted anything
          under 75 percent as failing, and soon added the letter F. According to{" "}
          <Ext href="https://stacker.com/stories/careers-education/history-letter-grading-system">this overview of the history of letter grading</Ext>,
          most colleges had dropped the E by about 1930, and letter grades became the most common system in US schools by the 1940s.
        </P>
        <P>
          A letter grade is a summary, not feedback. It is quick to read and easy to compare, and it works well for work with clear right and
          wrong answers, like an algebra test. It says much less about an essay, where a B does not tell you what to fix. A few schools skip
          letter grades and write narrative reports instead, but that takes a lot of teacher time, so most schools still use scores and letters.
          That is why it helps to know exactly how your points turn into a final grade.
        </P>
      </Card>

      <Card title="How Do the US, UK and Canadian Grading Systems Work?">
        <P>There is no single worldwide standard, so the same score can mean different things depending on where you study.</P>
        <P>
          In the United States, most schools use letters from A to F, usually tied to percentages. A common 10-point scale gives an A for 90 and
          above, a B for 80 to 89, a C for 70 to 79, a D for 60 to 69 and an F below 60. Letters also convert to grade points on a 4.0 scale,
          where an A is 4.0 and an F is 0.
        </P>
        <P>
          The United Kingdom works differently. At university, a bachelor’s degree is classified by overall percentage: a first for 70 percent
          and above, an upper second (2:1) for 60 to 69, a lower second (2:2) for 50 to 59, and a third for 40 to 49. Master’s degrees use
          distinction (70 and above), merit (60 to 69) and pass (50 to 59). These are standard boundaries, though they can shift slightly
          between universities, as Prospects explains in its guide to UK university grades. Before university, students in England sit GCSEs
          graded 9 to 1 and A-levels graded A* to E.
        </P>
        <P>
          Canada has no national system. Each province and territory sets its own rules, and individual schools add their own. Many high schools
          report percentages, some use letters, and many universities convert marks to a 4.0 scale or a similar <Link to="/tools/gpa-calculator" className="inline-home-link">GPA</Link> scale. Always check your
          school’s grading policy before you rely on a conversion chart.
        </P>
        <P>
          The takeaway is simple: percentages are fairly universal, but the cutoffs for each letter are not. That is why this grade calculator
          lets you adjust the grading scale.
        </P>
      </Card>

      <Card title="What Is a Passing Grade in High School?">
        <P>
          In most US high schools, the lowest passing grade is a D, which usually means 60 percent. Some districts set the bar at 65 or 70
          percent, and others do not count a D toward graduation requirements even though it is technically a pass. In Canada, high school
          courses are commonly passed at 50 percent, though this varies by province. The only reliable source is your student handbook or
          course syllabus.
        </P>
        <P>
          Keep in mind that passing and being in good standing are different things. A D may earn you credit, but it can lower your GPA, and some
          colleges, sports programs and scholarships ask for a C or higher. Online courses, such as those on Coursera, set their own passing
          score for each course, which is usually shown in the course’s grade or syllabus section.
        </P>
      </Card>

      <Card title="What a Grade Calculator Does">
        <P>
          A grade calculator, sometimes called a grading calculator, takes the scores you have earned so far and turns them into a single overall
          grade. That sounds simple, but real courses rarely make it easy. Homework might count for 20 percent, exams for 50 and participation
          for the rest, with some assignments marked out of 10 and others out of 150. Averaging those numbers by hand usually gives the wrong
          answer, because a 9 out of 10 quiz and a 90 out of 100 exam do not carry equal weight unless your instructor says they do.
        </P>
        <P>
          This online grade calculator handles that math for you. It accepts the formats teachers actually use, applies the correct averaging
          method and maps the outcome to your grading scale. Because the logic mirrors how a school gradebook works, the number you see is a
          dependable estimate of where you stand, not a rough guess.
        </P>
      </Card>

      <Card title="How to Use the Free Online Grade Calculator">
        <P>
          Start by choosing how your course reports scores. If your syllabus lists letters, use letter grades. If your portal shows results such
          as 43/50, use points. If it shows only percentages, use percentages. Then add one row for each assignment, test or category and enter
          the score.
        </P>
        <P>
          Next, decide whether the course is unweighted or weighted. For an unweighted calculation, every entry counts according to its own
          value, so nothing more is needed. For a weighted calculation, enter the percentage each category is worth, exactly as the syllabus
          lists it. The grade calculator then produces your overall result right away.
        </P>
        <P>
          The most useful habit is to change one score and watch what happens. Raising a quiz mark by five points and seeing the overall grade
          barely move tells you something very different from seeing a final exam shift it by a full letter. It takes seconds and saves you from
          starting the math over every time.
        </P>
      </Card>

      <Card title="Letter Grades, Percentages or Points: Which Input Should You Choose?">
        <P>The best input type is whichever one matches your gradebook, because converting between formats by hand is where most mistakes happen.</P>
        <Lead lead="Letter grades">
          suit courses where work is returned as A, B+ or C- and you have no underlying numbers. Each letter is converted to a numeric value on
          the grading scale, and those values are averaged. This works for a quick estimate, but it is less precise than numbers, since a B could
          be an 83 or an 87.
        </Lead>
        <Lead lead="Percentages">
          are ideal for online portals and most college courses. A percentage grade calculator is the fastest route when every assignment already
          shows a score out of 100, and it pairs naturally with weighted categories.
        </Lead>
        <Lead lead="Points">
          are the most accurate option for classes that run on a running total. If a course has 1,000 points available across the term, enter
          points earned and points possible for each item. You can mix formats across different courses without any problem. Just keep each
          calculation consistent within a single class.
        </Lead>
      </Card>

      <Card title="How to Convert a Percentage to a Letter Grade">
        <P>
          To convert a percentage to a letter grade, find the range that contains your percentage on your school’s grading scale. On the most
          common US scale with plus and minus grades, the ranges look like this:
        </P>
        <List items={[
          ["", "A+: 97–100, A: 93–96, A-: 90–92"],
          ["", "B+: 87–89, B: 83–86, B-: 80–82"],
          ["", "C+: 77–79, C: 73–76, C-: 70–72"],
          ["", "D+: 67–69, D: 63–66, D-: 60–62"],
          ["", "F: below 60"],
        ]} />
        <P>
          If your school does not use plus and minus grades, the ranges are wider: 90 and above is an A, 80 to 89 a B, 70 to 79 a C, 60 to 69 a
          D, and anything lower is an F. Some schools use a 7-point scale instead, where an A starts at 93. If your result is 89.6 percent, check
          whether your instructor rounds up. That one-tenth of a point is the difference between a B and an A in some classes.
        </P>
      </Card>

      <Card title="How to Calculate Grades Using Points">
        <P>
          In a points-based course, your grade is the points you earned divided by the points that were possible, multiplied by 100. Every
          assignment adds to both totals, so larger assignments count more without any extra setup.
        </P>
        <P>
          For example, say you scored 45 out of 50 on a lab, 88 out of 100 on a midterm, 18 out of 20 on a quiz and 27 out of 30 on a project. You
          earned 178 points out of 200 possible, so your grade is 178 ÷ 200 = 0.89, or 89 percent. That is a high B, one point from an A on a
          standard scale.
        </P>
        <P>
          One mistake to avoid: do not average the four percentages (90, 88, 90 and 90). That treats the 20-point quiz as equal to the 100-point
          midterm. Add the points first, then divide once.
        </P>
      </Card>

      <Card title="How to Calculate Your Grade With Different Assignment Weights">
        <P>
          When categories carry different weights, each category has a fixed share of the final grade, no matter how many assignments it
          contains. The method has two steps. First, find the average for each category. Second, multiply each average by its weight (written as
          a decimal) and add the results.
        </P>
        <P>Take homework at 20 percent with an average of 92, quizzes at 15 percent averaging 85, a midterm at 25 percent scoring 78, and a final at 40 percent scoring 88:</P>
        <List items={[
          ["Homework:", "92 × 0.20 = 18.40"],
          ["Quizzes:", "85 × 0.15 = 12.75"],
          ["Midterm:", "78 × 0.25 = 19.50"],
          ["Final:", "88 × 0.40 = 35.20"],
        ]} />
        <P>
          The total is 85.85 percent, a B on most scales. A simple average of those four numbers would be 85.75, which is close here but can be
          far off when one heavily weighted exam goes badly.
        </P>
        <P>
          A quick way to decide which mode you need: if your syllabus says something like “exams are worth 60% of your grade,” use weighted. If it
          says the grade is based on total points, use unweighted. If weights are listed, make sure they add up to 100 percent, because a total
          that falls short or runs over will distort the result.
        </P>
        <P>
          Weighted scoring is also different from the <Link to="/tools/high-school-gpa-calculator" className="inline-home-link">weighted GPA</Link> some high schools use, where honors and AP classes earn extra grade points.
          That system is applied to the final course grade, after the course grade has been calculated.
        </P>
        <P>
          You can also work backward to see what you need on the final. If your current average is 82 on the work that makes up 70 percent of the
          course, the final is worth 30 percent and you want an 85 overall, use this formula:
        </P>
        <Formula>Needed on final = (target − current × 0.70) ÷ 0.30</Formula>
        <P>That is (85 − 57.4) ÷ 0.30 = 92. Enter a few different final exam scores into the calculator to test the result.</P>
      </Card>

      <Card title="How Does Extra Credit Affect Your Grade?">
        <P>
          Extra credit raises your grade only by the amount your instructor assigns it, and how it is counted depends on the course. In most
          points-based classes, extra credit points are added to the points you earned but not to the points possible. If you have 410 out of 500
          points (82 percent) and earn 10 points of extra credit, you move to 420 out of 500, or 84 percent.
        </P>
        <P>
          In a weighted course, extra credit usually raises the average of a single category. If your quiz average goes up 3 points and quizzes
          are worth 15 percent, your overall grade rises by only 0.45 points (3 × 0.15). Extra credit in a heavily weighted category helps far
          more than the same points in a light one.
        </P>
        <P>
          Two cautions. Some instructors cap extra credit, so a score above 100 percent may not be allowed. Others only count it if it lifts you to
          a certain level. Read your syllabus, then enter your scores exactly the way your instructor records them.
        </P>
      </Card>

      <Card title="Adjusting the Grading Scale to Match Your School">
        <P>
          There is no universal definition of a B or a C. Many US schools use a 10-point scale, others use a 7-point scale, and some colleges add
          plus and minus grades. Schools outside the US use different numeric systems altogether.
        </P>
        <P>
          Because of this, the grading scale in the calculator is adjustable. You can change the percentage ranges so that the letter you see
          reflects your own school’s rules instead of a default. This matters most near the boundaries. An 89.4 percent is a B under a standard
          10-point scale but may round up under a different policy. If you are using letter grades as input, the same scale controls how each
          letter is converted to a number, so setting it correctly at the start improves accuracy on both ends.
        </P>
      </Card>

      <Card title="What Is a Passing Grade in College in the USA, UK, Canada, Italy, Germany, Australia and New Zealand?">
        <P>College passing marks vary widely. These are typical rules, but individual universities and programs can set their own, so confirm with your school.</P>
        <List items={[
          ["United States:", "A D (about 60 percent) usually earns credit, but many majors require a C or higher in required courses, and graduate programs commonly expect a B (3.0) average."],
          ["United Kingdom:", "The pass mark for undergraduate modules is typically 40 percent. Postgraduate taught courses often require 50 percent."],
          ["Canada:", "The usual pass mark is 50 percent, though some programs, especially graduate programs, set it higher."],
          ["Italy:", "Exams are scored out of 30. The minimum pass is 18, and top marks are 30, sometimes with honors (30 e lode)."],
          ["Germany:", "The scale runs from 1.0 to 5.0, where lower is better. A 4.0 is the lowest passing grade and 5.0 is a fail."],
          ["Australia:", "Most universities use Pass (50 to 64), Credit (65 to 74), Distinction (75 to 84) and High Distinction (85 to 100). Below 50 is a fail."],
          ["New Zealand:", "Universities typically use letter grades from A+ to E, with a C- (about 50 percent) as the lowest pass."],
        ]} />
        <P>Because these scales differ, set your grading scale in the calculator to match your own school instead of using a default.</P>
      </Card>

      <Card title="When You Need a Grade Calculator: Practical Scenarios">
        <Lead lead="Mid-semester check-ins.">
          Many students do not know their standing until the portal updates, and some portals only show raw scores with no overall figure. A
          college grade calculator gives you a working number any time you have new marks, so you can decide whether to ask for help early.
        </Lead>
        <Lead lead="Planning your effort before finals.">
          When the final is worth 30 or 40 percent of the course, your current standing tells you whether to protect a strong grade or recover a
          weak one. Adjust the <Link to="/tools/final-grade-calculator" className="inline-home-link">final exam score</Link> in the calculator to see which outcomes keep you above a threshold.
        </Lead>
        <Lead lead="Scholarship, program and eligibility thresholds.">
          Scholarships, sports eligibility, honors programs and graduate admissions often set minimum grades. Checking the likely result ahead of
          time lets you act while there is still time to improve it.
        </Lead>
        <Lead lead="Parents and tutors.">
          If a student only mentions a few scores, a quick calculation shows the full picture and helps start a useful conversation instead of a
          stressful one.
        </Lead>
        <Lead lead="Teachers and homeschool educators.">
          For a quick check without opening a full gradebook, or to show a student how a weighted syllabus works, a calculator gives a clear
          worked result.
        </Lead>
        <Lead lead="Verifying a grade you disagree with.">
          If the posted grade looks wrong, recalculate it from your own scores and the syllabus weights before you contact your instructor. Many
          differences come from a missing assignment or an incorrect weight. Do this early. Once a course is over, and especially after
          graduation, schools generally change a grade only to fix a recording error or after a successful formal appeal, and the deadlines vary.
          Your registrar’s office can explain the process at your school.
        </Lead>
      </Card>

      <Card title="Free, Private and Reliable: What to Expect From This Grade Calculator">
        <P>
          This grade calculator is free to use, with no payment and no account required to get a result. There are no hidden charges for
          switching between weighted and unweighted modes or for customizing the grading scale.
        </P>
        <P>
          On privacy, the calculation needs only the scores, weights and grading scale you type in. You do not need to enter your name, school,
          student ID or any login details, so nothing personally identifying is required to use it.
        </P>
        <P>
          On accuracy, the tool applies standard math: totals divided by possible points for unweighted grades, and weighted averages for
          category-based grades. The output is only as accurate as the inputs, which is why matching your syllabus’s weights and cutoffs matters.
          Use it to plan and double-check, and rely on your school’s records for anything official.
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
