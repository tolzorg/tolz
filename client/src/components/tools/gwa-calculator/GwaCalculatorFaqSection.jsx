import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is GWA and what is it used for?", a: "GWA, or general weighted average, is a single number that summarizes your grades across all subjects, with each grade weighted by the subject’s units. Schools use it for honors, scholarships, retention and program admission, and employers and graduate programs may ask for it too." },
  { q: "How do I compute my GWA?", a: "Multiply each subject’s grade by its units, add all of those products together, then divide by your total units. For example, 20.00 weighted points over 12 units gives a GWA of 1.67." },
  { q: "What is a good GWA?", a: "On the 1.00–5.00 scale, lower is better, and a GWA of 1.75 or lower is generally considered strong, with many honors and scholarships set around that range. On a 4.00 scale, higher is better, and 3.50 or above is typically viewed as excellent. Always check your school’s own standards." },
  { q: "Is a lower GWA better?", a: "On the 1.00–5.00 scale, yes. 1.00 is the highest possible mark and 5.00 is a failing grade. On the 4.00–1.00 scale the opposite is true, and higher numbers are better." },
  { q: "What is the difference between GWA and GPA?", a: "Both are weighted averages of grades by units. GWA is the term commonly used in Philippine colleges, usually on the 1.00–5.00 scale, while GPA is more often reported on a 4.00 scale." },
  { q: "Can I calculate my cumulative GWA?", a: "Yes. Enter every subject from every semester in one list rather than averaging your semester GWAs, because semesters usually carry different unit loads." },
  { q: "Does the GWA calculator work with letter grades?", a: "Yes. You can choose the letter grading option and enter grades such as A, B or C. Confirm how your school treats plus and minus grades before relying on the conversion." },
  { q: "How do I compute my GWA if my grades are percentages?", a: "If your school reports percentages, use the same formula with the percentages. If you need a GWA on the 1.00–5.00 scale, convert each percentage to its grade equivalent using your school’s table first, then enter the grades and units." },
  { q: "How do I convert GWA to a percentage?", a: "There is no universal formula. Each school publishes its own conversion table, and the same grade can match different percentage ranges at different schools. Ask your registrar or check your student handbook." },
  { q: "Can I raise my GWA to 1.20 after a low first year?", a: "It depends on how many units you have left. Use the required-average formula: (target × total units − points earned) ÷ units left. If the answer is below 1.00, the target cannot be reached." },
  { q: "Is GWA important for an internship?", a: "It can be. Some employers and internship programs set a minimum GWA, while others focus on skills and projects. Check each posting and your school’s internship requirements." },
  { q: "How do graduate schools treat a GWA when they ask for a GPA?", a: "Policies vary. Many schools apply their own conversion to the grading scale on your transcript, or ask your registrar to certify it. Follow each school’s instructions rather than converting it yourself." },
  { q: "Is this GWA calculator free to use?", a: "Yes, the tool is free to use. You can calculate as many times as you need." },
  { q: "Will my result match my school’s official GWA?", a: "It should match when you enter the correct grades and units and your school uses the standard weighted average method. Differences usually come from school-specific rounding or from subjects the school excludes." },
];

// The supplied FAQ schema writes ranges with hyphens, spells the formula in
// plain ASCII and trims one answer, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is GWA and what is it used for?", a: "GWA, or general weighted average, is a single number that summarizes your grades across all subjects, with each grade weighted by the subject's units. Schools use it for honors, scholarships, retention and program admission, and employers and graduate programs may ask for it too." },
  { q: "How do I compute my GWA?", a: "Multiply each subject's grade by its units, add all of those products together, then divide by your total units. For example, 20.00 weighted points over 12 units gives a GWA of 1.67." },
  { q: "What is a good GWA?", a: "On the 1.00-5.00 scale, lower is better, and a GWA of 1.75 or lower is generally considered strong. On a 4.00 scale, higher is better, and 3.50 or above is typically viewed as excellent. Always check your school's own standards." },
  { q: "Is a lower GWA better?", a: "On the 1.00-5.00 scale, yes. 1.00 is the highest possible mark and 5.00 is a failing grade. On the 4.00-1.00 scale the opposite is true, and higher numbers are better." },
  { q: "What is the difference between GWA and GPA?", a: "Both are weighted averages of grades by units. GWA is the term commonly used in Philippine colleges, usually on the 1.00-5.00 scale, while GPA is more often reported on a 4.00 scale." },
  { q: "Can I calculate my cumulative GWA?", a: "Yes. Enter every subject from every semester in one list rather than averaging your semester GWAs, because semesters usually carry different unit loads." },
  { q: "Does the GWA calculator work with letter grades?", a: "Yes. You can choose the letter grading option and enter grades such as A, B or C. Confirm how your school treats plus and minus grades before relying on the conversion." },
  { q: "How do I compute my GWA if my grades are percentages?", a: "If your school reports percentages, use the same formula with the percentages. If you need a GWA on the 1.00-5.00 scale, convert each percentage to its grade equivalent using your school's table first, then enter the grades and units." },
  { q: "How do I convert GWA to a percentage?", a: "There is no universal formula. Each school publishes its own conversion table, and the same grade can match different percentage ranges at different schools. Ask your registrar or check your student handbook." },
  { q: "Can I raise my GWA to 1.20 after a low first year?", a: "It depends on how many units you have left. Use the required-average formula: (target x total units - points earned) / units left. If the answer is below 1.00, the target cannot be reached." },
  { q: "Is GWA important for an internship?", a: "It can be. Some employers and internship programs set a minimum GWA, while others focus on skills and projects. Check each posting and your school's internship requirements." },
  { q: "How do graduate schools treat a GWA when they ask for a GPA?", a: "Policies vary. Many schools apply their own conversion to the grading scale on your transcript, or ask your registrar to certify it. Follow each school's instructions rather than converting it yourself." },
  { q: "Is this GWA calculator free to use?", a: "Yes, the tool is free to use. You can calculate as many times as you need." },
  { q: "Will my result match my school's official GWA?", a: "It should match when you enter the correct grades and units and your school uses the standard weighted average method. Differences usually come from school-specific rounding or from subjects the school excludes." },
];

const LETTER_HEADERS = ["Letter", "Simple scale", "Plus/minus scale"];
const LETTER_ROWS = [
  ["A", "4.0", "4.0"], ["A−", "—", "3.7"], ["B+", "3.5", "3.3"], ["B", "3.0", "3.0"], ["B−", "—", "2.7"], ["C+", "2.5", "2.3"],
  ["C", "2.0", "2.0"], ["C−", "—", "1.7"], ["D+", "—", "1.3"], ["D", "1.0", "1.0"], ["D−", "—", "0.7"], ["F", "0.0", "0.0"],
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

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
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

export default function GwaCalculatorFaqSection() {
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

      <Card title="What Is General Weighted Average (GWA) and What Is It Used For?">
        <P>
          GWA, short for general weighted average, is one number that sums up your grades across every subject you have taken in college. Many
          Philippine colleges and universities use it as the standard measure of academic performance. The word “weighted” means each grade
          counts in proportion to the units of its subject. A 5-unit major subject moves your average more than a 1-unit elective, which makes
          sense because it asks more time and effort from you.
        </P>
        <P>
          Units usually reflect how much work a subject carries in your degree program, and major subjects often carry more units than minor
          ones. That is why a plain average of your grades can mislead you. A weighted average matches your real workload.
        </P>
        <P>
          The purpose of GWA is to give you, your school and anyone who reads your transcript one comparable figure for your overall standing.
          Schools use it to decide whether you can stay in your program, who earns honors and who qualifies for a scholarship. Employers and
          graduate programs look at it too. Keep in mind that the Philippines has no national grading system, so each school sets its own scale
          and rules, as <Ext href="https://www.nuffic.nl/en/node/159">Nuffic’s overview of Philippine grading</Ext> points out. Always read your
          GWA against your own school’s grading table.
        </P>
      </Card>

      <Card title="Is GWA Important for an Internship?">
        <P>
          Sometimes, and it depends on who is asking. Some companies and structured internship programs set a minimum GWA for applicants,
          especially in competitive fields. Others barely look at it and focus on your skills, projects and interview. Some schools also require
          a certain academic standing before you can enroll in an internship or practicum course, so check your student handbook.
        </P>
        <P>
          The safest approach is to know your exact GWA to two decimals, read each posting for its requirements and decide from there. If your
          GWA is strong, put it on your résumé. If it is lower than you would like, lead with projects, relevant coursework and a recommendation
          from a professor. You can also use the calculator to average only your major subjects by entering just those rows. That number is
          often easier to defend when the internship is in your field.
        </P>
      </Card>

      <Card title="The GWA Formula Explained">
        <P>
          A general weighted average is not a simple average of your grades. Each grade is weighted by the units of its subject, so a heavier
          subject pulls the result harder than a light one. The GWA computation formula is:
        </P>
        <Formula>GWA = Σ (gᵢ × uᵢ) ÷ Σ uᵢ, for i = 1 to n</Formula>
        <P>
          Here, g is the grade in each subject, u is the units of that subject, and n is the number of subjects you are counting. In plain words:
          multiply each grade by its units, add those products, then divide by your total units.
        </P>
        <P>Here is a worked example on the 1.00–5.00 scale. Suppose you took four subjects in a semester:</P>
        <List items={[
          ["Mathematics,", "3 units, grade 1.50: 1.50 × 3 = 4.50"],
          ["English,", "3 units, grade 2.00: 2.00 × 3 = 6.00"],
          ["Physics,", "4 units, grade 1.75: 1.75 × 4 = 7.00"],
          ["Physical Education,", "2 units, grade 1.25: 1.25 × 2 = 2.50"],
        ]} />
        <P>
          The weighted grade points add up to 20.00, and the total units are 12. Dividing 20.00 by 12 gives 1.6667, which rounds to a GWA of
          1.67. The simple average of the four grades would be 1.625. The gap looks small here, but it grows when unit loads differ sharply, and
          a few hundredths can decide whether you reach a cutoff. The same steps work on any grading scale, which is why the GWA calculator can
          handle all of them.
        </P>
      </Card>

      <Card title="Can You Raise Your GWA After a Low First Year?">
        <P>
          Yes, but how much you can raise it depends on how many units you have left. The grades you have already earned are locked in. Only
          your remaining units can change the result. To see what you need, use this formula:
        </P>
        <Formula>Required average = ((target GWA × total units) − points already earned) ÷ units left</Formula>
        <P>
          Say your program has 144 units (check your own curriculum, since totals vary). In your first year you finished 36 units with a GWA of
          2.00, which is 72 grade points. Now look at two goals:
        </P>
        <List items={[
          ["Target of 1.20:", "You would need 172.80 total points, so 100.80 points from the remaining 108 units. That is an average of about 0.93, which is better than 1.00, the best grade possible. This target is out of reach."],
          ["Target of 1.50:", "You would need 216 total points, so 144 points from the remaining 108 units. That is an average of about 1.33. It is demanding, since you would need mostly 1.25 and 1.50 grades, but it is possible."],
        ]} />
        <P>
          The lesson is that the earlier you start, the more units you have left to change the outcome. To test your own numbers, enter your
          finished subjects first, then add rows for upcoming subjects with the grades you are aiming for. Also check your school’s rules on
          retaking subjects or removing grades, because those policies differ.
        </P>
      </Card>

      <Card title="Computing GWA From Percentage Grades and Converting GWA to a Percentage">
        <P>
          Some schools record grades as percentages or give you a percentage average at the end of the term. How you compute your GWA depends on
          what your school wants to see.
        </P>
        <P>
          If your school reports the final result as a percentage, use the same formula with percentages in place of grades. For example, 90 in a
          3-unit subject, 85 in a 3-unit subject and 88 in a 4-unit subject give (270 + 255 + 352) ÷ 10, which is 87.7 percent. If your school
          wants a GWA on the 1.00–5.00 scale instead, convert each percentage to its grade equivalent using your school’s table first, then enter
          those grades and units into the calculator. Convert first and average second. Averaging the percentages and converting the result
          afterward can give a slightly different answer.
        </P>
        <P>
          Going the other way, there is no single formula for converting a GWA to a percentage. Each school publishes its own table, and
          published tables show the same grade of 1.50 tied to different percentage ranges at different schools. Look in your student handbook or
          ask your registrar, and do not borrow a table from another school.
        </P>
      </Card>

      <Card title="GWA Calculator for the 1.00–5.00 Scale">
        <P>
          The 1.00–5.00 scale is widely used in Philippine universities, and it runs in the opposite direction from what many students expect:
          1.00 is the highest mark and 5.00 is a failing grade. At many schools 3.00 is the lowest passing grade, with 4.00 often reserved for a
          conditional or removal-exam status. Because lower numbers are better, a falling GWA means your standing is improving.
        </P>
        <P>
          When you select this scale, the GWA calculator treats every grade exactly as you enter it, with no conversion in the background.
          Schools differ in the increments they award. Some give only 1.00, 1.25, 1.50 and so on in steps of 0.25, while others allow 1.10 or
          1.35. Whatever your school uses, type the grade as printed on your record. Rounding rules also vary by institution; some round the final
          GWA to two decimals and others carry more digits, so a registrar’s official figure can differ from the calculator’s by a hundredth.
          Treat the calculator result as an accurate working figure and the registrar’s record as the final word.
        </P>
      </Card>

      <Card title="4.00–1.00 Scale and Letter Grades">
        <P>
          Some schools, and most programs that follow a US-style system, use a 4.00 scale where higher is better. A 4.00 is the top mark and 1.00
          is typically the lowest pass, with 0.00 for a failure. The GWA calculator supports this scale directly, so you can enter grade points
          such as 3.50 or 2.75 and receive an average on the same scale.
        </P>
        <P>
          If your grades appear as letters, choose the letter grading option instead. Schools use one of two common conversions. Some use whole
          and half steps, and others use plus and minus grades:
        </P>
        <DataTable headers={LETTER_HEADERS} rows={LETTER_ROWS} />
        <P>
          These are common examples, not a rule. Schools do not all agree on the in-between values, so check your school’s table before relying
          on a plus/minus conversion.
        </P>
        <P>
          A quick example on this scale: three units at 4.0 contribute 12 points, three units at 3.0 contribute 9 points, and four units at 3.5
          contribute 14 points. The total is 35 points over 10 units, giving a GWA of 3.50. Whichever format you use, the logic stays the same:
          multiply, add, then divide by total units.
        </P>
      </Card>

      <Card title="GWA vs GPA, QPI and CGPA">
        <P>
          Students often search for a GWA calculator and a GPA calculator as if they were different tools. In practice, GWA, GPA, QPI and CGPA are
          all weighted averages of grades by units. The differences are mostly about naming and scale. GWA is the standard term in many
          Philippine colleges and is usually reported on the 1.00–5.00 scale. GPA is the common term elsewhere and is almost always on a 4.00
          scale. QPI (quality point index) and CGPA (cumulative grade point average) are the labels certain universities use for their own
          versions.
        </P>
        <P>
          The practical takeaway is that you should use the scale and terminology your school uses, and never compare numbers across schools
          without checking the scale. A 1.75 GWA and a 3.25 GPA can describe a similar performance, but only if both are read against their own
          grading tables.
        </P>
      </Card>

      <Card title="How Graduate Schools Treat a GWA When They Ask for a GPA">
        <P>
          If you apply for a master’s or law degree and the school asks for a GPA, you do not need to invent a number. Policies differ, but many
          schools evaluate your transcript using the grading scale printed on it and apply their own conversion. Others ask for a certification
          of your grading system from your registrar, or send your records to a credential evaluation service.
        </P>
        <P>
          Because GWA is already a unit-weighted average, the conversion usually works on your final GWA or on your individual grades, depending
          on the school. Your best move is to read the application instructions, report your GWA as it appears on your transcript, and include
          your school’s grading scale. Only calculate a converted GPA yourself if the school tells you which method to use.
        </P>
      </Card>

      <Card title="Semester GWA vs Cumulative GWA">
        <P>
          A semester GWA covers one term. A cumulative GWA covers every graded subject across your whole program so far. The distinction matters
          because you cannot get a correct cumulative figure by averaging your semester GWAs, unless every semester happened to carry the same
          number of units.
        </P>
        <P>
          Consider a first semester with 15 units at a GWA of 1.50 and a second semester with 21 units at 2.00. Averaging the two semester figures
          gives 1.75, but the weighted result is (15 × 1.50 + 21 × 2.00) ÷ 36, or about 1.79. To compute a cumulative GWA correctly, list every
          subject from every term in a single set of rows and let the GWA calculator weigh them all together. Also keep your scales consistent: do
          not mix 1.00–5.00 grades with 4.00-scale grades in one calculation, and avoid rounding individual grades before you enter them, because
          early rounding quietly shifts the final figure.
        </P>
      </Card>

      <Card title="When You Need to Calculate Your GWA">
        <P>Most students look up a GWA calculator at moments when a specific number carries consequences. These are the situations that come up most often:</P>
        <Lead lead="Scholarship and grant retention.">
          Many scholarships require a minimum GWA each semester, often something like 2.00 or better, though the exact figure depends on the
          sponsor. Calculating your average before grades are final tells you how much room you have.
        </Lead>
        <Lead lead="Dean’s list and Latin honors.">
          Academic distinctions are tied to GWA cutoffs that differ by university. The University of the Philippines, for example, lists 1.75 or
          better for cum laude, 1.45 or better for magna cum laude and 1.20 or better for summa cum laude in its{" "}
          <Ext href="https://our.upv.edu.ph/index.php/academics/graduation/graduation-requirements">UP Visayas graduation requirements</Ext>.
          Check your own school’s published rules, then use the calculator to see how close you are.
        </Lead>
        <Lead lead="Staying in your program.">
          Some colleges set a minimum GWA per semester for retention, so a low term can put you on probation. Knowing your number early gives you
          time to act.
        </Lead>
        <Lead lead="Program shifting, transfer and admission.">
          Competitive programs often screen applicants by GWA. If you plan to shift courses or transfer, your exact average helps you decide
          whether to apply.
        </Lead>
        <Lead lead="Graduate school and job applications.">
          Employers and graduate programs frequently ask for your GWA on a résumé or form. Computing it yourself avoids relying on an outdated
          figure.
        </Lead>
        <Lead lead="Planning your remaining semesters.">
          Enter your current subjects, then add placeholder rows with the grades you hope to earn. You will see whether a target GWA is realistic
          and which heavy subjects deserve the most effort.
        </Lead>
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
