import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate my semester grade from quarter grades?", a: "Multiply each quarter grade and the final exam score by its weight, then add the results. With 40 percent for each quarter and 20 percent for the final, the formula is (Q1 × 0.40) + (Q2 × 0.40) + (Final × 0.20). The semester grade calculator does this automatically once you enter the grades and weights." },
  { q: "What do I need on my final exam to get an A?", a: "It depends on your quarter grades and the final’s weight. Subtract your current weighted points from the target grade, then divide by the final’s weight. With quarter grades of 88 and 82 and a 20 percent final, a semester 90 would need 110, which isn’t possible without extra credit." },
  { q: "How much is a final exam worth in a semester grade?", a: "Most schools weigh the final between 10 and 25 percent, and 20 percent is common. Your syllabus or school handbook gives the exact figure." },
  { q: "Is the semester grade just the average of two quarter grades?", a: "Not usually. If the final exam counts toward the grade, a plain average of the quarters ignores it. Each part carries the percentage your school assigns." },
  { q: "Do semester grades affect GPA?", a: "Yes. Semester grades are the course grades that feed into your GPA, though schools differ on whether they use semester grades or final course grades for the year." },
  { q: "Do colleges look at semester grades or quarter grades?", a: "Colleges see what your transcript shows. Many transcripts list semester or final course grades, and some also list quarter grades." },
  { q: "Can colleges rescind an offer for bad grades after admission?", a: "Yes. Offers are usually conditional on a final transcript, and a sharp drop in grades can put an offer at risk. A small dip is much less likely to matter." },
  { q: "Can I make up a low first semester grade with a good second semester?", a: "You can’t erase the first semester grade, but a strong second semester improves your overall GPA and shows an upward trend. Colleges often notice that improvement." },
  { q: "Can I appeal my semester grade?", a: "Yes. Check for an error first, talk to your teacher, and then follow your school’s formal appeal process if needed. Appeals are strongest when they point to a specific mistake." },
  { q: "What if the grade I need on the final is over 100?", a: "It means the target can’t be reached through the exam alone under the stated weights. Ask your teacher about extra credit, or choose a lower, achievable target." },
  { q: "Can I use this for a different weighting than 40/40/20?", a: "Yes. Enter whatever weights your school or teacher uses, as long as they add up to 100 percent." },
  { q: "Is this semester grade calculator free, and do I need to sign up?", a: "It’s free to use, and you don’t need to create an account to calculate your grade." },
];

// The supplied FAQ schema trims or rewords several answers, so it is kept
// verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate my semester grade from quarter grades?", a: "Multiply each quarter grade and the final exam score by its weight, then add the results. With 40 percent for each quarter and 20 percent for the final, the formula is (Q1 × 0.40) + (Q2 × 0.40) + (Final × 0.20)." },
  { q: "What do I need on my final exam to get an A?", a: "Subtract your current weighted points from the target grade, then divide by the final's weight. The result depends on your quarter grades and how much the final is worth." },
  { q: "How much is a final exam worth in a semester grade?", a: "Most schools weigh the final between 10 and 25 percent, and 20 percent is common. Check your syllabus or school handbook for the exact figure." },
  { q: "Is the semester grade just the average of two quarter grades?", a: "Not usually. If the final exam counts toward the grade, a weighted calculation is needed, with the quarters and final each carrying the percentage your school assigns." },
  { q: "Do semester grades affect GPA?", a: "Yes. Semester grades are the course grades that feed into your GPA, though schools differ on whether they use semester grades or final course grades for the year." },
  { q: "Do colleges look at semester grades or quarter grades?", a: "Colleges see what your transcript shows. Many transcripts list semester or final course grades, and some also list quarter grades." },
  { q: "Can colleges rescind an offer for bad grades after admission?", a: "Yes. Offers are usually conditional on a final transcript, and a sharp drop in grades can put an offer at risk. A small dip is much less likely to matter." },
  { q: "Can I make up a low first semester grade with a good second semester?", a: "You can't erase the first semester grade, but a strong second semester improves your overall GPA and shows an upward trend." },
  { q: "Can I appeal my semester grade?", a: "Yes. Check for an error first, talk to your teacher, and then follow your school's formal appeal process if needed. Appeals are strongest when they point to a specific mistake." },
  { q: "What if the grade I need on the final is over 100?", a: "It means the target can't be reached through the exam alone under the stated weights. Ask your teacher about extra credit or choose a lower, achievable target." },
  { q: "Can I use this for a different weighting than 40/40/20?", a: "Yes. Enter whatever weights your school or teacher uses, as long as they add up to 100 percent." },
  { q: "Is this semester grade calculator free, and do I need to sign up?", a: "It's free to use, and you don't need to create an account to calculate your grade." },
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
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
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

export default function SemesterGradeCalculatorFaqSection() {
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

      <Card title="How Do Semester Grades Work?">
        <P>
          In most schools, a semester is half of the school year, and the semester grade is the single number that summarizes your performance
          in a course for that half. In a quarter system, the semester is built from three parts: the first quarter, the second quarter, and a
          final exam. Each part counts for a set percentage of the semester grade.
        </P>
        <P>
          That setup explains why a semester grade is not simply the average of your quarters. The final exam usually carries real weight, and
          some schools also give the quarters different weights. The semester grade is what typically appears on your report card and
          transcript, which is why it matters more than any single test or marking period.
        </P>
        <P>
          Systems differ. Some schools skip quarters and use midterms and finals. Others give one grade per semester based on points earned across
          the whole term. The calculator covers the common quarter-quarter-final structure, so confirm that your school grades the same way.
        </P>
      </Card>

      <Card title="How Do Semester Grades Add Up?">
        <P>A semester grade is a weighted average. Each component is multiplied by its weight, and the products are added together:</P>
        <Formula>Semester grade = (Quarter 1 × weight) + (Quarter 2 × weight) + (Final exam × weight)</Formula>
        <P>
          Weights are written as decimals, so 40 percent becomes 0.40. Suppose a school weighs each quarter at 40 percent and the final at 20
          percent. A student with an 88 in quarter one, an 82 in quarter two, and a 90 on the final would calculate 35.2 + 32.8 + 18, which gives
          a semester grade of 86.0.
        </P>
        <P>
          Here is a second example with uneven weights. A student earns 78 in quarter one (35 percent), 84 in quarter two (35 percent), and 72 on
          the final (30 percent). The math is 27.3 + 29.4 + 21.6, so the semester grade is 78.3. The strong second quarter helped, but the heavy
          final pulled the result down.
        </P>
        <H3>Do Semester Grades Average Out?</H3>
        <P>
          Only when every part has the same weight. A plain average treats each score as equally important, and that is rarely how schools grade.
          Using the first example, the plain average of 88, 82, and 90 is 86.67, slightly higher than the true 86.0 because the final is worth
          only a fifth of the grade. The gap grows when the final differs a lot from the quarters. With a 70 on the final instead, the plain
          average is 80, but the weighted result is 82.0 because the two quarters carry 80 percent of the grade.
        </P>
        <P>
          If you only want to average two grades and the weights don’t add up to 100, multiply each grade by its weight, add the results, and
          divide by the sum of the weights. A grade of 80 and a grade of 90, each weighted at 40 percent, give (32 + 36) ÷ 0.80, which equals 85.
        </P>
        <H3>What About Diploma or Total-Marks Programs?</H3>
        <P>
          Some diploma programs and boards don’t use percentages with weights. They add up marks across subjects or semesters. In that case, the
          usual method is total marks earned divided by total marks possible, multiplied by 100. Because boards set their own rules, follow the
          scheme in your program’s handbook. This calculator is built for weighted quarter and final exam grades, not for credit-based or
          marks-based aggregates.
        </P>
        <H3>Rounding</H3>
        <P>
          Some schools round 89.5 up to 90, while others cut off at 89.4 and keep the lower letter. The calculator reports the precise result, so
          compare it with your school’s rounding policy before you decide whether a borderline grade counts as an A or a B.
        </P>
      </Card>

      <Card title="Find the Grade You Need on Your Final Exam">
        <P>
          For many students, the most useful feature of a semester <Link to="/tools/grade-calculator" className="inline-home-link">grade calculator</Link> is the reverse calculation. When the final is still coming,
          you can set a target and work backward.
        </P>
        <P>The formula is:</P>
        <Formula>Needed final score = (Target grade − Current weighted points) ÷ Final exam weight</Formula>
        <P>
          “Current weighted points” means your quarter grades multiplied by their weights and added together. Using the 40/40/20 setup with
          quarter grades of 88 and 82, your current weighted points are 68. If you want a semester grade of 80, you need (80 − 68) ÷ 0.20, which is
          60 on the final. For an 85, you need 85. For a 90, the formula gives 110, which tells you the target can’t be reached through the exam
          alone.
        </P>
        <P>
          That last result is useful information, not bad news. If the number comes out above 100, the grade is out of reach unless your teacher
          offers extra credit or a different weighting. Knowing this before finals week lets you set a realistic goal, such as aiming for the
          highest B+ instead of burning out chasing an A that the math won’t allow.
        </P>
        <P>
          The same calculation answers “what do I need on my final to pass?” Enter your passing threshold, usually 60 or 70 percent, as the
          target. Say a student has 65 in both quarters with a 40/40/20 split. Their current weighted points are 52. To reach a 60, they need only
          40 on the final. To reach a 70, they need 90. The same exam carries very different pressure depending on the goal.
        </P>
      </Card>

      <Card title="Common Weighting Setups for Quarter Grades and Finals">
        <P>
          No single weighting is universal, which is why a flexible semester grade calculator is more useful than a fixed one. A common
          arrangement in U.S. high schools gives each quarter 40 percent and the final 20 percent. Some districts use 45/45/10 so the exam matters
          less, and others use 37.5/37.5/25 to make the final count for a quarter of the grade. Individual teachers sometimes set their own
          weights within district limits, so the setup can differ from class to class.
        </P>
        <P>
          Certain schools also exempt students from the final when their quarter grades are high enough, and others let a strong final replace a
          weaker quarter. If your school uses an exemption or replacement rule, the standard weighted formula won’t capture it. Run the calculator
          on the normal weights first, then apply your school’s rule to the result.
        </P>
        <P>Always trust the weights written in your course materials over any default. If your syllabus uses unusual percentages, enter them exactly as stated.</P>
      </Card>

      <Card title="Do Semester Grades Affect GPA?">
        <P>
          Yes. Your semester grades are the course grades that feed into your <Link to="/tools/gpa-calculator" className="inline-home-link">GPA</Link>. The semester grade is the percentage for one course, while GPA
          turns the letter grades from all your courses into one point average.
        </P>
        <P>
          On an unweighted scale, an A is worth 4 points, a B is 3, a C is 2, a D is 1, and an F is 0. Many high schools add extra points for
          honors, AP, or IB classes, so check your school’s scale. In college, each course is also multiplied by its credit hours.
        </P>
        <P>
          Here is a college-style example. A student earns an A in a 3-credit class, a B in a 4-credit class, and a B in another 3-credit class.
          The calculation is (3 × 4) + (4 × 3) + (3 × 3) = 33 grade points. Divide by 10 total credits, and the semester GPA is 3.3.
        </P>
        <P>
          High schools handle this differently. Some calculate GPA from each semester grade separately. Others use a final course grade for the
          year. Ask your counselor which method your school uses. Use the calculator for the percentage, convert it to a letter grade with your
          school’s scale, and then calculate GPA.
        </P>
      </Card>

      <Card title="Do Colleges Look at Semester Grades or Quarter Grades?">
        <P>
          Colleges look at your transcript, and what appears on it depends on your high school. Many transcripts list semester or final course
          grades, and some also show quarter grades. A college only sees what your school reports. For most applicants, the semester grade is the
          number that counts.
        </P>
        <P>
          Admissions offices review the full record, not one semester in isolation. They look at which courses you took, how hard they were, and
          whether your grades are steady, rising, or falling. This applies to selective schools too. A single weak semester rarely decides an
          application, but a pattern of decline can.
        </P>
        <P>
          Freshman-year grades are on your transcript, and colleges can see them. Many admissions offices pay closer attention to the trend and to
          junior and senior year work, but each school sets its own approach. Graduate schools mainly look at your overall undergraduate GPA, the
          grades in your major, and the direction your grades have moved. A rough first semester can be offset by solid work afterward.
        </P>
        <H3>Can Colleges Rescind an Offer Because of Bad Second-Semester Grades?</H3>
        <P>
          Yes, it can happen. Admission offers are typically conditional on a final transcript, and colleges may expect your work to stay
          consistent with what they saw when they admitted you. The University of South Florida, for example, explains that its{" "}
          <Ext href="https://admissions.usf.edu/blog/does-the-last-semester-of-your-senior-year-matter">offer of admission depends on its review of the final transcript</Ext>.
          Colleges rarely revoke offers over a small dip. A sharp drop, a failing grade, or a dropped core class is a bigger risk. If your grades
          slip, contact the admissions office early instead of waiting for them to find out.
        </P>
      </Card>

      <Card title="How Important Are First Semester Grades?">
        <P>
          First semester grades matter for a few reasons. They set your starting GPA, they show colleges and employers how you handle new
          coursework, and in college they can affect scholarships, financial aid eligibility, and academic standing. Many scholarships require a
          minimum GPA to renew, so check the terms of any award you receive.
        </P>
        <P>
          First semester grades are also not permanent damage. Your <Link to="/tools/college-gpa-calculator" className="inline-home-link">cumulative GPA</Link> is an average, and it becomes harder to move as you take more
          courses. That means a low first semester has the most room to be recovered early, while you still have many courses ahead.
        </P>
        <H3>I’m a Freshman and My First Semester Grades Are Bad. What Should I Do?</H3>
        <P>
          Start by finding the cause. Missing homework, weak test preparation, and unclear material are all common and fixable. Use the calculator
          to see how much your final or second semester can still change the year. Then talk to your teachers, ask what specific work would raise
          your grade, and set up a regular study routine. Freshman year is early enough that a strong comeback shows up clearly as an upward
          trend.
        </P>
        <H3>Can I Make Up a Low First Semester Grade With a Good Second Semester?</H3>
        <P>
          Partly. The first semester grade stays on your transcript, so a good second semester doesn’t erase it. It does improve your overall GPA
          and shows improvement. In schools that also give a yearly grade made from both semesters, a strong second half raises that number
          directly. Colleges tend to respond well to a clear upward trend.
        </P>
        <H3>Does a Low Midterm Matter If My Overall Semester Grade Is Decent?</H3>
        <P>
          It depends on how much the midterm counts. If it is part of a quarter grade or a separate weighted item, it already shows up in your
          semester result. Once the semester grade is final, colleges and your GPA use that number, not the midterm. Use the calculator with your
          current grades to see whether the midterm really changed your result. If it did, the final is your best chance to recover.
        </P>
      </Card>

      <Card title="How to Use the Semester Grade Calculator">
        <P>
          Using the semester grade calculator takes under a minute. Enter your first-quarter and second-quarter grades as percentages, then add the
          weight your school assigns to each quarter and to the final exam. If your final has already happened, add your exam score and the tool
          returns your semester grade. If the final is still ahead, use the tool the other way around: enter the semester grade you want, and it
          shows the score you need on the exam.
        </P>
        <P>
          Check your weights before calculating. Most errors come from guessing the weighting instead of confirming it. Your syllabus, student
          handbook, or course page usually states it, and if it doesn’t, a short message to your teacher settles the question. The three weights
          should add up to 100 percent. If you know the two quarter weights, you can find the final’s weight by subtracting them from 100. For
          example, quarters worth 35 percent each leave 30 percent for the final.
        </P>
        <P>
          Enter percentages rather than letters. A B+ can mean 87 or 89 depending on the grading scale, so the result is far more precise when you
          use the percentage shown in your student portal or report card. If you only have a letter, use the middle of that letter’s range and
          treat the result as an estimate.
        </P>
        <P>
          If your class has more than a few graded parts, such as homework, quizzes, and tests, work those out first. Most gradebooks already show
          a quarter percentage, and that single number is what the calculator needs.
        </P>
      </Card>

      <Card title="Practical Situations Where This Calculator Helps">
        <P>The calculator is most useful at specific moments in the school year.</P>
        <Lead lead="Before finals week.">
          Once quarter two closes, you know two of the three inputs and can see how much the exam can still change your result. That tells you
          how many hours to spend on each subject, since a class where you need a 55 deserves less panic than one where you need a 95.
        </Lead>
        <Lead lead="Protecting eligibility.">
          Sports teams, clubs, scholarships, and honor rolls often set minimum grades. Running the numbers early shows whether you’re safe or at
          risk, which leaves time to talk with a teacher or arrange tutoring.
        </Lead>
        <Lead lead="Checking the gradebook.">
          Teacher software and student portals occasionally apply weights incorrectly, especially after a mid-semester change. If the grade posted
          online doesn’t match your calculation, you have a specific question to raise instead of a vague complaint.
        </Lead>
        <Lead lead="College and scholarship planning.">
          Semester grades feed into transcripts and GPA, so students applying to colleges or scholarship programs often want to forecast them.
          Parents and tutors also use the tool to plan realistically before an exam.
        </Lead>
        <Lead lead="Deciding priorities across classes.">
          When several finals land in the same week, comparing the needed scores for each subject shows where extra study time will matter most.
        </Lead>
      </Card>

      <Card title="How to Improve Your Semester Grade Before the Final">
        <P>
          The calculation tells you where you stand, and a few habits turn it into a plan. Run several scenarios instead of one. Check the score
          needed for an A, a B, and a pass. The spread shows how much each additional point of effort is worth.
        </P>
        <P>
          Put your time where the weight sits. If the final is worth only 10 percent, a bad exam can’t undo a strong semester, so keep your daily
          work steady. If the final is worth 25 percent or more, it deserves structured review, and past exams or practice sets are usually the
          best investment.
        </P>
        <H3>How Do I Improve My Semester Grades in Two Weeks?</H3>
        <P>Two weeks won’t change everything, but it can move a grade, especially if the final carries real weight.</P>
        <List items={[
          ["", "Find out what can still count: missing assignments, extra credit, corrections, or retakes. Ask your teacher right away, since these options often close once finals begin."],
          ["", "Use the calculator to find the subject where a few points on the final matter most, and start there."],
          ["", "Study in short, focused blocks. A Pomodoro-style routine, with about 25 minutes of work followed by a short break, keeps you from burning out."],
          ["", "Spend extra time on the topics you find hardest, and work on practice problems instead of rereading notes."],
          ["", "Keep your phone and TV out of study time, and get enough sleep before test days."],
          ["", "Find the study method that works for you, such as writing notes, watching explanations, or teaching the material out loud to someone else."],
          ["", "Ask a classmate or tutor for help early instead of waiting until the night before."],
        ]} />
      </Card>

      <Card title="Can I Appeal My Semester Grade?">
        <P>
          Yes, in most schools. Start by checking for a simple error, such as a wrong weight, a missing score, or a calculation mistake. Run your
          numbers through the calculator and compare them with the gradebook. If they differ, bring your work to the teacher and ask politely for a
          review.
        </P>
        <P>
          If that doesn’t settle it, follow the school’s formal process. In high schools this often goes through the department head, a counselor,
          and then the principal. Colleges usually have a written grade appeal policy with deadlines, so check your student handbook and act
          quickly. Keep copies of graded work, the syllabus, and any emails.
        </P>
        <P>
          An appeal works best when it points to a specific mistake. Disagreeing with a teacher’s judgment about your work is much harder to win.
          Federal privacy law also has limits here. Under FERPA, the right to ask a school to amend education records can be used when a grade is
          recorded incorrectly, but it isn’t a way to challenge a grade the teacher assigned.
        </P>
        <H3>Can a Professor Change a Semester Grade After It Is Finalized?</H3>
        <P>
          Usually only through a formal change-of-grade process. Instructors can fix real errors, such as a miscalculation, a missed assignment, or
          a recording mistake, but the change typically needs approval from a department or registrar’s office, and there are deadlines. A grade
          is rarely changed after the fact just because a student asks for a better one. If you think there is an error, contact the instructor as
          soon as possible.
        </P>
      </Card>

      <Card title="Are There Scholarships Based on Semester Grades?">
        <P>
          Many scholarships and merit awards are tied to academic performance, and some are reviewed each semester. Common requirements include a
          minimum GPA, a minimum percentage, or a full course load. Failing to meet the standard can mean losing the award or being placed on
          probation. Rules vary by school and program, so read the terms of any scholarship you hold. Use the calculator to confirm that you can
          meet the required semester result before the final, while there is still time to act.
        </P>
      </Card>

      <Card title="Free, Private and Accurate Results">
        <P>
          This semester grade calculator is free to use, with no hidden charges and no account to create. You enter your numbers, read your
          result, and leave. The values you type are used to produce your result and nothing more, so you can try as many what-if scenarios as you
          like without any commitment.
        </P>
        <P>
          The tool applies the standard weighted-average formula that schools use to produce semester grades. If your inputs match your
          gradebook, the output will too. The result is still an estimate of your official grade, because teachers may apply rounding rules, drop
          low scores, or adjust marks in ways the formula can’t see. Treat the number as a reliable guide for planning and your school’s records as
          the final word.
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
