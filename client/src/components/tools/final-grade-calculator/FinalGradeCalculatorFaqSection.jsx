import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate what I need on my final exam?", a: "Use the formula (Target − Current × (1 − Final weight)) ÷ Final weight, with weights as decimals. Or enter your current grade, final weight and target into the calculator above, and it does the math for you." },
  { q: "How do I calculate a final grade with percentages?", a: "Multiply each score by its weight, then add the results. For example, a 90% homework score worth 20% adds 18 points to your total. Add every category, and make sure the weights total 100%." },
  { q: "What do I need on my final to get an A?", a: "It depends on your current grade and the final’s weight. With 92% going in and a final worth 25%, you’d need 84% to reach 90%. With 85% going in and a final worth 30%, you’d need about 101.7%, which means an A is out of reach unless extra credit is available. Enter your own numbers for the exact figure." },
  { q: "What do I need on my final to pass the class?", a: "Set your target to your school’s passing grade, commonly 60% or 70%, and the calculator shows the minimum final score. Check your syllabus, since some courses also require passing the final itself." },
  { q: "Is a 70 passing in the US?", a: "In most US schools, yes. A 70% is usually a C- or C. Some districts set passing at 60% or 65%, and some college programs require a C or higher for a course to count toward a major." },
  { q: "Can the final grade calculator tell me if an A is impossible?", a: "Yes. If the result is above 100%, the target can’t be reached through the final alone. You may still have options such as extra credit, so ask your instructor." },
  { q: "How much is a final exam usually worth?", a: "Typically 10% to 40% of the course grade, with 20% to 30% being common in college courses. Your syllabus gives the exact figure." },
  { q: "Do universities round up final grades?", a: "There is no universal rule. Some instructors round 89.5% to 90%, and others use strict cutoffs. Your syllabus or instructor can confirm the policy." },
  { q: "Can teachers change final grades?", a: "Yes, usually to fix errors such as a miscalculated score or a recording mistake. Most schools require a formal grade change process with approval after grades are posted." },
  { q: "Can I appeal my final grade?", a: "Yes. Start with your instructor, then follow your school’s formal appeal process. Appeals are usually accepted for errors or for grading that did not follow the syllabus, and deadlines can be short." },
  { q: "How do teachers calculate final grades?", a: "They use either weighted categories or total points, as outlined in the syllabus. Policies such as dropped scores, extra credit and rounding can change the final number." },
  { q: "Does it work with points instead of percentages?", a: "Yes. Enter points earned, points possible and the final’s point value, and the tool finds the points you need. You can convert that to a percentage for comparison." },
  { q: "Can I use letter grades as my target?", a: "Yes. Choose a letter, and the calculator converts it to a percentage using a standard scale. If your school uses different cutoffs, enter the percentage directly." },
  { q: "Is this final grade calculator free?", a: "Yes. It’s free to use, and it asks only for grade numbers, not personal details." },
];

// The supplied FAQ schema rewords a few questions and answers, so it is kept
// verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate what I need on my final exam?", a: "Use the formula (Target − Current × (1 − Final weight)) ÷ Final weight, with weights as decimals. Or enter your current grade, final weight and target into the calculator above, and it does the math for you." },
  { q: "How do I calculate a final grade with percentages?", a: "Multiply each score by its weight, then add the results. For example, a 90% homework score worth 20% adds 18 points to your total. Add every category, and make sure the weights total 100%." },
  { q: "What do I need on my final to get an A?", a: "It depends on your current grade and the final's weight. With 92% going in and a final worth 25%, you would need 84% to reach 90%. With 85% going in and a final worth 30%, you would need about 101.7%, which means an A is out of reach unless extra credit is available." },
  { q: "What do I need on my final to pass the class?", a: "Set your target to your school's passing grade, commonly 60% or 70%, and the calculator shows the minimum final score. Check your syllabus, since some courses also require passing the final itself." },
  { q: "Is a 70 passing in the US?", a: "In most US schools, yes. A 70% is usually a C- or C. Some districts set passing at 60% or 65%, and some college programs require a C or higher for a course to count toward a major." },
  { q: "Can the final grade calculator tell me if an A is impossible?", a: "Yes. If the result is above 100%, the target can't be reached through the final alone. You may still have options such as extra credit, so ask your instructor." },
  { q: "How much is a final exam usually worth?", a: "Typically 10% to 40% of the course grade, with 20% to 30% being common in college courses. Your syllabus gives the exact figure." },
  { q: "Do universities round up final grades?", a: "There is no universal rule. Some instructors round 89.5% to 90%, and others use strict cutoffs. Your syllabus or instructor can confirm the policy." },
  { q: "Can teachers change final grades?", a: "Yes, usually to fix errors such as a miscalculated score or a recording mistake. Most schools require a formal grade change process with approval after grades are posted." },
  { q: "Can I appeal my final grade?", a: "Yes. Start with your instructor, then follow your school's formal appeal process. Appeals are usually accepted for errors or for grading that did not follow the syllabus, and deadlines can be short." },
  { q: "How do teachers calculate final grades?", a: "They use either weighted categories or total points, as outlined in the syllabus. Policies such as dropped scores, extra credit and rounding can change the final number." },
  { q: "Does the final grade calculator work with points instead of percentages?", a: "Yes. Enter points earned, points possible and the final's point value, and the tool finds the points you need. You can convert that to a percentage for comparison." },
  { q: "Can I use letter grades as my target?", a: "Yes. Choose a letter, and the calculator converts it to a percentage using a standard scale. If your school uses different cutoffs, enter the percentage directly." },
  { q: "Is this final grade calculator free?", a: "Yes. It's free to use, and it asks only for grade numbers, not personal details." },
];

const COMPONENT_HEADERS = ["Component", "Score", "Weight", "Contribution"];
const COMPONENT_ROWS = [
  ["Homework", "90%", "20%", "18.0"],
  ["Quizzes", "85%", "10%", "8.5"],
  ["Midterm", "78%", "25%", "19.5"],
  ["Project", "92%", "15%", "13.8"],
  ["Final exam", "80%", "30%", "24.0"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 340 }}>
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

export default function FinalGradeCalculatorFaqSection() {
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

      <Card title="What Is Meant by Final Grades, and Why They Matter">
        <P>
          The phrase “final grade” can mean two different things, and it helps to know which one you are dealing with. Sometimes it means the
          score you earn on the final exam itself. More often it means your <Link to="/tools/grade-calculator" className="inline-home-link">overall grade</Link> for the course, which is the weighted average of
          everything you were graded on: homework, quizzes, projects, midterms and the final exam. Each part counts for a set share of the total,
          and that share is its weight.
        </P>
        <P>
          Weights are usually written as percentages, such as 20% for homework and 30% for the final. They can also be written as decimals from
          0 to 1, so 30% is 0.30. The two forms mean the same thing. In a few courses the final exam is the only graded item. In that case your
          final grade is your exam score, and there is nothing to calculate.
        </P>
        <P>
          There is also a final <Link to="/tools/semester-grade-calculator" className="inline-home-link">semester grade</Link>, which most schools express as a <Link to="/tools/gpa-calculator" className="inline-home-link">GPA</Link>. It combines your results across all of your courses,
          usually weighted by credit hours, so a four-credit class counts more than a two-credit class. This calculator focuses on a single
          course and the final exam inside it.
        </P>
        <P>
          Grading systems also differ. Many American schools use a 0–100 percentage scale with letter grades attached. Other schools and
          countries use 4.0 scales or different numeric ranges, and the passing mark is set by each school. The examples on this page use the
          0–100 scale. If your school grades differently, convert your numbers to percentages first.
        </P>
        <P>Final grades matter for practical reasons:</P>
        <List items={[
          ["Scholarships and grants.", "Most programs set a minimum GPA or course grade, and many look at your average when choosing recipients."],
          ["Financial aid.", "Schools that take part in federal student aid programs must require students to keep making satisfactory academic progress, which usually includes a minimum GPA."],
          ["Prerequisites and majors.", "Many programs require a C or better in certain courses before you can move on."],
          ["Graduate and professional school.", "Admissions committees look closely at grades in your major."],
          ["Early job searches.", "With little work history, graded coursework is often one of the few things an employer can see. Employers also weigh projects, internships and skills, so a grade is not the whole picture."],
        ]} />
      </Card>

      <Card title="How Do I Calculate a Final Grade With Percentages?">
        <P>To calculate a final grade with percentages, multiply each score by its weight, then add the results. The weights need to total 100%.</P>
        <P>Say a course is graded like this:</P>
        <DataTable headers={COMPONENT_HEADERS} rows={COMPONENT_ROWS} />
        <P>Adding the contributions gives 18.0 + 8.5 + 19.5 + 13.8 + 24.0 = 83.8%, which is a B in most US schools.</P>
        <P>
          Notice how much the weights matter. A 78% on the midterm pulls the grade down more than a 90% on homework lifts it, because the midterm
          is worth more. If every item had equal weight, you could simply add the scores and divide by the number of items. Most courses do not
          work that way, so check the syllabus.
        </P>
        <P>
          When some work is still ungraded, the same method runs in reverse. You know every weight, you know your scores so far, and you solve
          for the one score you don’t have yet. That is what the calculator does.
        </P>
      </Card>

      <Card title="How Do Teachers Calculate Final Grades?">
        <P>Teachers usually use one of two methods, and the syllabus says which.</P>
        <Lead lead="Weighted categories.">
          Work is grouped into categories, such as homework, tests and participation, and each category has a percentage. This is the method
          shown above.
        </Lead>
        <Lead lead="Total points.">
          Every assignment is worth a certain number of points, and your grade is points earned divided by points possible. A 1,000-point course
          where you earned 870 points gives you 87%. In this system, larger assignments count more simply because they are worth more points.
        </Lead>
        <P>
          Most teachers use gradebook software that does the math automatically, but the rules behind it still come from the instructor. A few
          policies can change the result:
        </P>
        <List items={[
          ["", "Some instructors drop the lowest quiz or homework score."],
          ["", "Missing work is often entered as a zero until it is submitted."],
          ["", "Some courses allow extra credit or apply a curve."],
          ["", "Some set a minimum score you must reach on the final to pass, no matter what your average is."],
        ]} />
        <P>If your gradebook total doesn’t match your own math, one of these is usually the reason. The syllabus will tell you, and so will your instructor.</P>
      </Card>

      <Card title="What Is a Final Grade Calculator?">
        <P>
          A final grade calculator works out the minimum score you must earn on your last exam to finish a course with a specific overall grade.
          Instead of guessing or doing the arithmetic by hand, you get a precise number to study toward.
        </P>
        <P>
          Most syllabi weight the final exam at somewhere between 10% and 40% of the course grade. The rest comes from homework, quizzes,
          projects and midterms. Because the final carries only part of the weight, the score you need is rarely the same as the grade you want
          overall. If you’re sitting at 88% and want to finish with an A, you may need far less than 90% on the exam. In other cases you may need
          far more than you’d expect. The calculator removes the guesswork.
        </P>
        <P>
          People also search for this as a final exam grade calculator, or ask “what do I need on my final to pass.” These all describe the same
          job, and the tool handles each version.
        </P>
      </Card>

      <Card title="How the Final Exam Grade Calculator Works">
        <P>The calculation is a weighted average solved for one unknown. The formula is:</P>
        <Formula>Required final score = (Target grade − Current grade × (1 − Final weight)) ÷ Final weight</Formula>
        <P>The final weight is written as a decimal, so 25% becomes 0.25.</P>
        <H3>Example 1</H3>
        <P>You have 78% going into the final, the exam is worth 25%, and you want to finish with an 80%.</P>
        <List items={[["", "78 × 0.75 = 58.5"], ["", "80 − 58.5 = 21.5"], ["", "21.5 ÷ 0.25 = 86%"]]} />
        <P>You need 86% on the final to end the course at 80%.</P>
        <H3>Example 2</H3>
        <P>You have 82%, the final is worth 30%, and you want 90%.</P>
        <List items={[["", "82 × 0.70 = 57.4"], ["", "90 − 57.4 = 32.6"], ["", "32.6 ÷ 0.30 = 108.7%"]]} />
        <P>
          A result above 100% means the target is out of reach through the final alone, unless extra credit is available. Knowing that early
          lets you set a realistic goal, such as a B+, instead of studying toward something mathematically impossible.
        </P>
        <P>
          The same logic works as a weighted final grade calculator for courses where every category has its own percentage. The formula never
          changes. Only the inputs do.
        </P>
      </Card>

      <Card title="Using Percentages, Points or Letter Grades">
        <P>Instructors grade differently, so the calculator accepts the formats you’re most likely to see.</P>
        <Lead lead="Percentages.">
          Enter your current percentage, the final’s weight and your target percentage. This is the most common setup and the quickest.
        </Lead>
        <Lead lead="Points.">
          Some courses total points instead of percentages, for example 1,000 points across the term. If you have 640 points earned out of 800
          possible so far and the final is worth 200 points, the tool finds the points you need on the final to reach a given total. You can then
          convert the result to a percentage for easier planning.
        </Lead>
        <Lead lead="Letter grades.">
          If you only know you want an A or a B, choose a letter. The calculator converts it to a percentage using a standard scale, typically 90%
          for an A, 80% for a B, 70% for a C and 60% for a D. Schools differ, and some use A- or B+ cutoffs, so check your syllabus. If your
          course uses a different scale, enter the exact percentage instead of the letter.
        </Lead>
      </Card>

      <Card title="Adding Previous Exams and Assignments">
        <P>
          If you don’t have a single current grade, you can build one from your individual scores. This helps when your gradebook doesn’t show a
          running total, or when you want to see where you stand in each category.
        </P>
        <P>List each graded component with its score and weight. Suppose you have:</P>
        <List items={[
          ["Midterm 1:", "80% (worth 20%)"],
          ["Midterm 2:", "70% (worth 20%)"],
          ["Homework:", "90% (worth 20%)"],
          ["Final exam:", "worth the remaining 40%"],
        ]} />
        <P>
          The three finished components carry equal weight, so your current grade is (80 + 70 + 90) ÷ 3 = 80%. If your target is 85%, the
          calculation is (85 − 80 × 0.60) ÷ 0.40 = 92.5% needed on the final.
        </P>
        <P>
          Make sure your weights add up to 100% including the final. If they don’t, the result will be off, and a missing category is the most
          common reason for a number that doesn’t match what your instructor posts.
        </P>
      </Card>

      <Card title="When and Why You Would Use This Tool">
        <P>Knowing the score you need changes how you spend your time. Here are the situations where it helps most.</P>
        <Lead lead="You’re close to a grade boundary.">
          If you’re at 89.2% and an A starts at 90%, the calculator shows how little you may need on the final. If you’re at 79.8% and want a B,
          it shows whether the final can realistically get you there.
        </Lead>
        <Lead lead="You’re worried about passing.">
          Many students searching “what grade do I need on my final to pass” are at risk of failing and want clarity. The tool shows the minimum
          score for a passing grade, so you know how much margin you have.
        </Lead>
        <Lead lead="You’re balancing several finals.">
          When exams cluster in one week, you can run the calculation for each course and divide your study time based on need. A course where
          you only need 65% deserves less effort than one where you need 95%.
        </Lead>
        <Lead lead="You’re protecting a scholarship or GPA threshold.">
          Running the numbers before exam week shows whether a specific score is required to stay eligible.
        </Lead>
        <Lead lead="You’re deciding whether to retake or drop.">
          If the required score is far above anything you’ve achieved, you can make an informed decision about withdrawing or planning a retake,
          ideally before deadlines pass.
        </Lead>
        <Lead lead="You’re a parent or tutor.">
          Showing a student the exact number needed turns a vague worry into a concrete target, which is easier to act on.
        </Lead>
      </Card>

      <Card title="What the Result Means (and What It Doesn’t)">
        <P>
          The calculator gives you the mathematical minimum. It doesn’t predict your performance, and it can’t account for policies your
          instructor controls.
        </P>
        <P>A few details can shift your real outcome:</P>
        <List items={[
          ["Rounding policies.", "Some instructors round 89.5% up to an A, while others don’t round at all. The calculator shows the raw requirement, so confirm the policy in your syllabus."],
          ["Dropped scores.", "If your instructor drops the lowest quiz or homework, your current grade may rise. Enter the adjusted figure if you know it."],
          ["Curves.", "A curve can lower the score you effectively need, but it’s never guaranteed, so plan against the uncurved number."],
          ["Extra credit.", "If extra credit is still available, your required final score may be lower than shown."],
          ["Minimum final requirements.", "A few courses require a passing score on the final regardless of your overall average. Check for this clause."],
        ]} />
        <P>Treat the result as a planning number, and confirm the details with your instructor when the stakes are high.</P>
      </Card>

      <Card title="What Should Your Final Grade Be?">
        <P>
          There is no single right answer, because the grade you need depends on what it has to accomplish. Your actual grade is whatever your
          weighted scores produce under the syllabus. It isn’t based on effort or need, and it shouldn’t be. What you can decide is your target,
          and a few questions help set it:
        </P>
        <List items={[
          ["", "What is the minimum to pass the course?"],
          ["", "Does your major or program require a certain grade, such as a C or better, to count the class?"],
          ["", "Is there a GPA cutoff for a scholarship, honors program or transfer?"],
          ["", "Is this a course where a higher grade matters, such as one in your major, or one where a pass is enough?"],
        ]} />
        <P>
          Once you have a target, enter it in the calculator and see what it takes. If the required score is realistic, you have a plan. If it
          isn’t, you can adjust your goal early instead of finding out after the exam.
        </P>
      </Card>

      <Card title="Is 70 Still Passing in the US?">
        <P>In most American schools, yes. A 70% is typically a C- or C, which counts as passing. But it isn’t the same everywhere:</P>
        <List items={[
          ["", "Some school districts set the passing mark at 60% (a D) or 65%."],
          ["", "Some use a different letter scale, so a 70 may land as a C-minus or a plain C depending on the cutoffs."],
          ["", "In college, a D usually passes the course but may not count toward your major or satisfy a prerequisite. Many programs want a C or higher."],
          ["", "Graduate programs often require a B, which is usually 80% or higher."],
        ]} />
        <P>
          So a 70 can be a comfortable pass in one place and a problem in another. Your syllabus, student handbook or program requirements give
          the real answer. To see what a 70 would take on your final, set 70% as the target in the calculator.
        </P>
      </Card>

      <Card title="Do Universities Round Up Final Grades?">
        <P>
          There is no universal rule. Rounding is set by the instructor, department or school, and practices vary. Some instructors round 89.5%
          up to 90%, so it becomes an A. Others use strict cutoffs and treat 89.9% as a B+. Some use a rounding rule only for borderline cases,
          or look at overall improvement and participation. GPA is a separate matter, since schools handle rounding of the <Link to="/tools/college-gpa-calculator" className="inline-home-link">cumulative GPA</Link> in
          their own way.
        </P>
        <P>
          Because of this, don’t count on a round-up. Plan to reach the real cutoff, and read the syllabus before the final to see what it says.
          If the syllabus is silent, ask your instructor before the exam instead of afterward. A question about policy asked in advance is
          reasonable. A request for special treatment after grades are posted is much harder to grant.
        </P>
      </Card>

      <Card title="Can Teachers Change Final Grades?">
        <P>
          Yes, but only in limited ways. Before grades are submitted, an instructor can correct mistakes, enter late work they agreed to accept,
          or fix a scoring error. After grades are posted, most schools require a formal grade change process. That usually means a written
          form, an explanation, and approval from a department chair, dean or registrar.
        </P>
        <P>The usual reasons a grade gets changed are mistakes:</P>
        <List items={[
          ["", "A math error in totaling the score"],
          ["", "A score entered incorrectly in the gradebook"],
          ["", "An assignment that was graded but never counted"],
          ["", "An incomplete grade that was resolved"],
        ]} />
        <P>
          Changing a grade for reasons unrelated to the student’s work, such as a personal request, is generally against academic policy. If you
          think there’s an error, bring specific details to your instructor, such as the assignment, the score you received and the total you
          expected.
        </P>
      </Card>

      <Card title="Can I Appeal My Final Grade?">
        <P>Yes. Most schools have a grade appeal process, though the steps and deadlines differ. It usually goes like this:</P>
        <List ordered items={[
          ["Talk to your instructor first.", "Many problems are fixed here, especially if it’s a calculation or recording error."],
          ["Go to the department chair or program director", "if you can’t resolve it."],
          ["File a formal appeal", "with a dean, registrar or appeals committee if it still isn’t settled."],
        ]} />
        <P>
          Deadlines are often short, sometimes just a few weeks after grades post or the start of the next term, so check your school’s policy
          right away. Appeals are generally accepted on specific grounds, such as a calculation or recording error, grading that didn’t follow
          the criteria in the syllabus, or a violation of school procedure. Simply disagreeing with an instructor’s academic judgment usually
          isn’t enough.
        </P>
        <P>
          Gather your evidence before you start: the syllabus, graded work, emails, and your own calculation. You can use this calculator to show
          how your scores add up under the stated weights.
        </P>
        <P>
          It also helps to know what federal law does and doesn’t cover. According to the U.S. Department of Education’s FERPA guidance, the
          right to seek amendment of education records can’t be used to challenge a grade unless it was inaccurately recorded. Challenging the
          grade itself goes through your school’s own appeal process.
        </P>
      </Card>

      <Card title="Is It Acceptable to Negotiate a Final Grade?">
        <P>
          It depends on what you mean by negotiating. Asking your instructor to review your work for a possible error is fair, and so is asking
          how a score was calculated. Asking for a higher grade than the work earned, just because you want or need it, is different. Most
          instructors and schools see that as unfair to the rest of the class, who were graded by the same rules.
        </P>
        <P>
          Some students think negotiating is acceptable for understandable reasons. Grades carry high stakes for scholarships and graduation.
          {" "}<Link to="/tools/college-cost-calculator" className="inline-home-link">Tuition</Link> is expensive, which makes some feel they are paying for a result. And some instructors have been flexible in the past, which
          sets an expectation.
        </P>
        <P>
          The better approach is to protect your grade during the term. Use the calculator before the final, talk to your instructor early if
          you’re near a cutoff, and ask about extra credit or review options while they’re still available.
        </P>
      </Card>

      <Card title="Tips to Get Better Final Grades">
        <P>A better final grade usually comes from a few steady habits.</P>
        <List items={[
          ["Start with the numbers.", "Use the calculator to learn what the final must be, so you can set priorities. A course where you need 95% deserves more of your time than one where you need 70%."],
          ["Know what the exam covers.", "Read the syllabus, study guide and any review sheet. Ask your instructor which topics get the most weight."],
          ["Review your graded work.", "Look at past midterms, quizzes and homework for patterns. If you keep losing points on one type of problem, fix that first."],
          ["Test yourself instead of rereading.", "Practice problems, flashcards and old exams show what you actually know. Rereading notes feels productive but is less effective."],
          ["Spread out your studying.", "Several shorter sessions over a week or two work better than one long cram session the night before."],
          ["Use office hours.", "Instructors can clear up confusing topics and often tell you where students struggle most."],
          ["Protect your sleep.", "Staying up all night to study usually costs more in focus and memory than it gains."],
          ["Plan for exam day.", "Read the directions, skim the whole exam, start with questions you know, and keep track of time."],
          ["Ask about extra credit early.", "If it’s offered, it has to be done before the deadline, not after the final."],
          ["Recalculate as grades post.", "Your target score changes every time a new grade is entered."],
        ]} />
      </Card>

      <Card title="Free and Easy to Use">
        <P>
          This tool is free to use, with no hidden charges, and the calculation runs instantly on the page. It asks only for the numbers it
          needs: your current grade or previous scores, the final’s weight and your target. You don’t have to enter your name, school or any
          personal details to get a result. You can change the inputs and recalculate as many times as you want, such as with a higher target, a
          different weight or an updated current grade.
        </P>
        <P>
          Accuracy matters here because the decision is real. The calculator uses the standard weighted-average formula and follows the numbers
          you enter exactly. The most common source of error is a typo in the weight or an incomplete current grade, so double-check those two
          fields first.
        </P>
      </Card>

      <Card title="Tips for Getting the Most Accurate Answer">
        <List items={[
          ["Use your current grade from the gradebook,", "not an estimate. Even a two-point difference can change the required score noticeably."],
          ["Confirm the final’s exact weight in the syllabus.", "“About a third” is not the same as 30%."],
          ["Run multiple targets.", "Calculate for an A, a B+ and a B so you know what each one costs you."],
          ["Account for ungraded work.", "If assignments are still outstanding, either wait for them to be graded or estimate conservatively."],
          ["Check that your weights total 100%.", "A missing category throws off the result."],
        ]} />
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
