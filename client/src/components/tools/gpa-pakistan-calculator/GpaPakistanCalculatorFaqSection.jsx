import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate GPA in Pakistan?", a: "Convert each letter grade to grade points on your university’s scale, multiply by that course’s credit hours, add the results, and divide by total credit hours. The calculator on this page does all of it once you enter your grades and credit hours." },
  { q: "What is the difference between GPA and CGPA?", a: "GPA covers a single semester, while CGPA covers all completed semesters together. CGPA is calculated from total quality points divided by total credit hours across your whole record." },
  { q: "Which grading scale does Pakistan use, 4.0 or 5.0?", a: "The 4.0 scale is the most common, especially in HEC-recognized universities, but some institutions use a 5.0 scale, often for master’s programs. Check your transcript or student handbook. This calculator supports both, plus the QAU MPhil scale." },
  { q: "How do I calculate CGPA from semester GPAs?", a: "Don’t average the GPAs unless every semester had identical credit hours. Multiply each semester’s GPA by its credit hours to get quality points, add them all, and divide by the total credit hours." },
  { q: "How do I convert GPA to percentage?", a: "A common method is GPA × 25 on the 4-point scale and GPA × 20 on the 5-point scale. This is an estimate, not an official rule. For a formal application, request an equivalence letter from your university." },
  { q: "What CGPA is required for a first division in Pakistan?", a: "There’s no universal CGPA for it. A first division traditionally means 60% or above, which works out to roughly 2.4 on the 4-point scale and 3.0 on the 5-point scale with the straight-line conversion. Policies differ by university." },
  { q: "What is a 3.0 GPA from Pakistan equal to in the UK?", a: "It usually falls somewhere between a lower second (2:2) and an upper second (2:1), depending on the UK university and program. It is above the minimum most Pakistani universities require to graduate, so it is a solid result, but check the entry requirements of the program you’re applying to." },
  { q: "How do I convert a Pakistani GPA to an American GPA?", a: "The 4.0 scale is similar to the US system, but many US schools ask for a credential evaluation, such as one from WES, instead of accepting your CGPA as printed. If you’re on the 5-point scale, convert each course grade to the 4-point table instead of scaling the total." },
  { q: "Is a Pakistani GPA the same as a foreign GPA?", a: "The method is the same, but scales, grade values, credit definitions, and repeat policies differ by country and university. Foreign institutions usually evaluate Pakistani transcripts on their own terms." },
  { q: "Does GPA matter for jobs in Pakistan?", a: "It matters most for fresh graduates, since some banks, multinationals, and trainee programs screen by minimum CGPA. With experience, your skills and track record count for much more." },
  { q: "Is this GPA calculator free, and do I need to sign up?", a: "Yes, it’s free, and no signup is required to use it." },
  { q: "Can I use this calculator for MPhil at Quaid-e-Azam University?", a: "Yes. Select the QAU MPhil scale in the calculator. For official figures, always rely on your university’s transcript." },
  { q: "Do repeated courses change my GPA?", a: "They can. Some universities replace the earlier grade with the new one, while others count both attempts. Follow your university’s policy when entering retaken courses." },
  { q: "Does the calculator work on mobile?", a: "Yes, you can use it on a phone, tablet, or computer through your browser." },
];

// The supplied FAQ schema rewords several answers, so it is kept verbatim here
// rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "How do I calculate GPA in Pakistan?", a: "Convert each letter grade to grade points on your university's scale, multiply by that course's credit hours, add the results, and divide by total credit hours. The calculator does this once you enter your grades and credit hours." },
  { q: "What is the difference between GPA and CGPA?", a: "GPA covers a single semester, while CGPA covers all completed semesters together, calculated from total quality points divided by total credit hours across your whole record." },
  { q: "Which grading scale does Pakistan use, 4.0 or 5.0?", a: "The 4.0 scale is the most common, especially in HEC-recognized universities, but some institutions use a 5.0 scale, often for master's programs. Check your transcript or student handbook. This calculator supports both, plus the QAU MPhil scale." },
  { q: "How do I calculate CGPA from semester GPAs?", a: "Multiply each semester's GPA by its credit hours to get quality points, add them all, and divide by the total credit hours. Simply averaging GPAs is only correct when every semester had the same credit hours." },
  { q: "How do I convert GPA to percentage?", a: "A common method is GPA × 25 on the 4-point scale and GPA × 20 on the 5-point scale. This is an estimate, not an official rule. For a formal application, request an equivalence letter from your university." },
  { q: "What CGPA is required for a first division in Pakistan?", a: "There is no universal CGPA for it. A first division traditionally means 60% or above, which works out to roughly 2.4 on the 4-point scale and 3.0 on the 5-point scale with the straight-line conversion. Policies differ by university." },
  { q: "What is a 3.0 GPA from Pakistan equal to in the UK?", a: "It usually falls somewhere between a lower second (2:2) and an upper second (2:1), depending on the UK university and program. It is above the minimum most Pakistani universities require to graduate, but check the entry requirements of the program you are applying to." },
  { q: "How do I convert a Pakistani GPA to an American GPA?", a: "The 4.0 scale is similar to the US system, but many US schools ask for a credential evaluation, such as one from WES, instead of accepting your CGPA as printed. If you are on the 5-point scale, convert each course grade to the 4-point table instead of scaling the total." },
  { q: "Is a Pakistani GPA the same as a foreign GPA?", a: "The method is the same, but scales, grade values, credit definitions, and repeat policies differ by country and university. Foreign institutions usually evaluate Pakistani transcripts on their own terms." },
  { q: "Does GPA matter for jobs in Pakistan?", a: "It matters most for fresh graduates, since some banks, multinationals, and trainee programs screen by minimum CGPA. With experience, your skills and track record count for much more." },
  { q: "Is this GPA calculator free, and do I need to sign up?", a: "Yes, it is free, and no signup is required to use it." },
  { q: "Can I use this calculator for MPhil at Quaid-e-Azam University?", a: "Yes. Select the QAU MPhil scale in the calculator. For official figures, always rely on your university's transcript." },
  { q: "Do repeated courses change my GPA?", a: "They can. Some universities replace the earlier grade with the new one, while others count both attempts. Follow your university's policy when entering retaken courses." },
  { q: "Does the calculator work on mobile?", a: "Yes, you can use it on a phone, tablet, or computer through your browser." },
];

const FOUR_HEADERS = ["Letter Grade", "Grade Points"];
const FOUR_ROWS = [
  ["A", "4.00"], ["A-", "3.67"], ["B+", "3.33"], ["B", "3.00"], ["B-", "2.67"], ["C+", "2.33"], ["C", "2.00"], ["C-", "1.67"], ["D", "1.00"], ["F", "0.00"],
];
const FIVE_ROWS = [
  ["A", "5.00"], ["A-", "4.67"], ["B+", "4.33"], ["B", "4.00"], ["B-", "3.67"], ["C+", "3.33"], ["C", "3.00"], ["C-", "2.67"], ["D+", "2.33"], ["D", "2.00"], ["D-", "1.67"], ["F", "0.00"],
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

export default function GpaPakistanCalculatorFaqSection() {
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

      <Card title="What the GPA Calculator Pakistan Students Use Actually Does">
        <P>
          The tool follows the standard weighted method that universities use. Each letter grade is converted to grade points on your chosen
          scale, and those points are multiplied by the course’s credit hours. The products are called quality points. Add up all the quality
          points, divide by total credit hours, and you have your GPA.
        </P>
        <P>
          That weighting is why a plain average of your grades gives the wrong answer. A 4-credit course affects your GPA more than a 1-credit
          lab, and a calculator that ignores credit hours will mislead you. This one doesn’t.
        </P>
        <P>
          You can use it for a single semester to get your semester GPA, or enter several semesters’ worth of courses to get your CGPA. A CGPA
          calculator Pakistan applicants can use for admission forms works the same way, just across a longer record.
        </P>
      </Card>

      <Card title="The Four-Point GPA Scale">
        <P>
          The 4-point scale is the most widely used system in Pakistani higher education, and it follows the framework promoted by the{" "}
          <Ext href="https://www.hec.gov.pk/">Higher Education Commission (HEC)</Ext>. The highest you can score is 4.0, which corresponds to
          an A. Here is the conversion commonly used:
        </P>
        <DataTable headers={FOUR_HEADERS} rows={FOUR_ROWS} />
        <P>
          Some universities print these values rounded to one decimal, so you may see 3.7 instead of 3.67. The percentage ranges attached to
          each letter also differ from one institution to another. One university may treat 85% and above as an A, while another sets the
          cutoff somewhere else. The calculator works from your letter grades instead of raw percentages, so it follows what your institution
          has already awarded you.
        </P>
        <P>
          If your university uses unusual grade points, such as a different value for A- or a separate D+ grade, compare them against your
          official grading policy before relying on the number for a formal application.
        </P>
      </Card>

      <Card title="The Five-Point GPA Scale">
        <P>
          The 5-point scale is less common, but some institutions use it, especially for master’s programs. The logic is identical to the
          4-point scale. Only the maximum changes, and the scale adds D+ and D- grades that the 4-point table above doesn’t have.
        </P>
        <DataTable headers={FOUR_HEADERS} rows={FIVE_ROWS} />
        <P>
          Choosing the correct scale before you start matters. A 4.0 on one scale and a 4.0 on the other mean very different things. A common
          mistake is comparing a 5-point GPA directly against a 4-point requirement. If a scholarship or foreign program asks for your GPA out
          of 4.0, don’t just shrink your number. Look at the tables above: a B is worth 3.0 on the 4-point scale but 4.0 on the 5-point scale,
          so scaling the total by 4/5 would not give you the right result. The accurate way is to convert each course grade to the 4-point
          table and recalculate.
        </P>
      </Card>

      <Card title="The Quaid-e-Azam University MPhil Scale">
        <P>
          Graduate programs sometimes use different grading rules from undergraduate degrees. Quaid-e-Azam University (QAU) grades its MPhil
          students on a five-point scale with a twist: it uses only the grades A, B, C, and F, with no plus or minus variations. Applying a
          standard 4.0 table to an MPhil transcript can therefore produce the wrong GPA, and the error can be larger than you’d expect.
        </P>
        <P>
          If you’re an MPhil student at QAU, select the QAU MPhil option instead of the standard scales. Use it for checking progress and
          planning your coursework. For anything official, such as degree completion requirements or minimum CGPA thresholds, rely on the
          figures on your university’s transcript.
        </P>
      </Card>

      <Card title="GPA Formula, Explained With a Worked Example">
        <P>The formula is simple:</P>
        <Formula>GPA = Total quality points ÷ Total credit hours</Formula>
        <P>Here’s a semester on the 4.0 scale:</P>
        <List items={[
          ["Course 1:", "3 credit hours, grade A (4.00) → 12.00 quality points"],
          ["Course 2:", "3 credit hours, grade B+ (3.33) → 9.99 quality points"],
          ["Course 3:", "4 credit hours, grade B (3.00) → 12.00 quality points"],
          ["Course 4:", "3 credit hours, grade C+ (2.33) → 6.99 quality points"],
        ]} />
        <P>Total quality points: 40.98. Total credit hours: 13. GPA = 40.98 ÷ 13 = 3.15.</P>
        <P>
          Notice that the 4-credit B counts for more than any one of the 3-credit courses. If you had averaged the four grade points (4.00,
          3.33, 3.00, 2.33), you’d get 3.17. That’s close here, but it can be far off when credit loads are uneven.
        </P>
      </Card>

      <Card title="How CGPA Differs From GPA">
        <P>
          Your semester GPA covers one term. Your CGPA covers everything you’ve completed so far. The calculation is the same, but over a larger
          set of courses: add the quality points from every semester and divide by the total credit hours of every semester.
        </P>
        <P>
          Suppose your next semester has 18 credit hours and 54.00 quality points, a 3.00 GPA. Your CGPA is (40.98 + 54.00) ÷ (13 + 18) =
          94.98 ÷ 31 = 3.06. Averaging the two semester GPAs would give 3.08. The gap is small here, but it grows whenever semesters carry very
          different credit loads.
        </P>
        <P>
          If you only have your previous CGPA and total credit hours on hand, you can still get the answer. Multiply your previous CGPA by your
          previous credit hours to recover your quality points, add the quality points from the new semester, and divide by the combined credit
          hours. This is why a proper CGPA calculator Pakistan universities would accept works from credit hours instead of averaging GPAs.
        </P>
      </Card>

      <Card title="How to Convert GPA to Percentage in Pakistan">
        <P>
          Many students ask this when filling out a form that wants a percentage instead of a GPA. The most common method is a straight-line
          conversion. On a 4-point scale, each GPA point equals 25%, and on a 5-point scale, each point equals 20%:
        </P>
        <Formula>
          4-point scale: Percentage = GPA × 100 ÷ 4 (or GPA × 25)<br />
          5-point scale: Percentage = GPA × 100 ÷ 5 (or GPA × 20)
        </Formula>
        <P>
          For example, a 3.2 on the 4-point scale comes out to 80%, and a 4.0 on the 5-point scale also comes out to 80%. To go the other way,
          divide the percentage by 25 or 20.
        </P>
        <P>
          Keep in mind that this is a rough estimate, not an official rule. There’s no single GPA-to-percentage formula that every Pakistani
          university follows, and HEC does not set one for all programs. Some universities publish their own conversion tables, and the
          straight-line method can understate or overstate your standing depending on how your institution grades. If you need a percentage for
          a formal application, ask your university’s examination department for an official equivalence letter. That document carries more
          weight than any figure you calculate yourself.
        </P>
      </Card>

      <Card title="What CGPA Do You Need for a First Division in Pakistan?">
        <P>
          The “division” system comes from the older annual exam system, where 60% or above counted as a first division. Most semester-based
          universities now report GPA instead of divisions, so there’s no universal CGPA that equals a first division.
        </P>
        <P>
          Using the straight-line conversion above, 60% works out to about 2.4 on the 4-point scale and 3.0 on the 5-point scale. That is only a
          guide. Some institutions set their own thresholds, and employers or other universities may expect a higher CGPA before they treat a
          degree as first-division quality. If you need a division for a form, check the policy on your degree or ask your examination
          department.
        </P>
      </Card>

      <Card title="Is a Pakistani GPA the Same as a Foreign GPA?">
        <P>
          The core idea is the same everywhere: grade points weighted by credit hours. The details are what differ. Countries and universities
          use different maximum values, different plus and minus grades, different rules for repeated courses, and different ways of defining a
          credit hour. A 3.5 from one university does not carry the same weight as a 3.5 from another, even when both are out of 4.0.
        </P>
        <P>
          Because of this, foreign universities rarely accept a Pakistani GPA at face value. Most either evaluate your transcript themselves or
          ask for a credential evaluation from a third party. The sections below cover the countries students ask about most.
        </P>
        <H3>Pakistani GPA to American GPA</H3>
        <P>
          The Pakistani 4.0 scale is built on the same model as the US system, so the numbers often carry over directly. That does not mean a US
          university will simply accept your CGPA as printed. Many American schools ask for a course-by-course evaluation from a service such as{" "}
          <Ext href="https://www.wes.org/">WES</Ext>, which reviews your transcript, checks the institution’s accreditation, and reports a
          US-equivalent GPA.
        </P>
        <P>
          If your university uses the 5-point scale, or your transcript shows percentages or divisions, expect the conversion to be done course
          by course instead of by one simple formula. Start by confirming what the specific program asks for, since requirements differ widely.
        </P>
        <H3>Pakistani GPA to UK Equivalent</H3>
        <P>
          UK universities grade degrees as First, Upper Second (2:1), Lower Second (2:2), and Third. There’s no fixed worldwide table for turning
          a Pakistani GPA into one of these. A 3.0 out of 4.0 generally sits in the range between a lower second and an upper second, depending
          on the university and program. Some admissions teams treat it as a 2:1 equivalent, while others are stricter. Many UK universities also
          publish a page listing their accepted qualifications from Pakistan, and that page is the best place to check.
        </P>
        <P>
          As for “good standing,” a 3.0 is comfortably above the minimum CGPA of around 2.0 that most Pakistani universities require to graduate,
          so academically it is a solid result. For competitive UK master’s programs that ask for a 2:1, however, a 3.0 may fall right on the
          borderline, and other parts of your application will matter more.
        </P>
        <H3>Pakistani GPA to Canadian, German, and Italian Grades</H3>
        <P>
          Canadian universities use different scales depending on the province and school, including 4.0, 4.3, and percentage-based systems,
          and each admissions office decides how to read your transcript.
        </P>
        <P>
          Germany grades in reverse, with 1.0 as the best grade and 4.0 as the lowest passing grade. Many German universities use the modified
          Bavarian formula, which is:
        </P>
        <Formula>German grade = 1 + 3 × (Nmax − Nd) ÷ (Nmax − Nmin)</Formula>
        <P>
          Here, Nmax is the best possible grade on your scale, Nmin is the lowest passing grade, and Nd is your grade. With a 4.0 maximum, a 2.0
          minimum pass, and a 3.5 CGPA, you get 1 + 3 × (0.5 ÷ 2) = 1.75. Treat this as an estimate, since the university or the uni-assist
          service makes the official call.
        </P>
        <P>
          Italy grades individual exams out of 30 and final degrees out of 110, and universities there handle foreign conversions on their own.
          In every case, check the target university’s published guidance for Pakistani applicants before you rely on any formula.
        </P>
      </Card>

      <Card title="Why GPA Gets So Much Attention at Universities Like NUST">
        <P>
          At competitive universities such as NUST, GPA often feels like the whole game, and there are practical reasons for that. Seats in a
          limited program, merit scholarships, academic honors, and eligibility for the next level of study often depend on CGPA. A lower GPA can
          also lead to academic probation, which makes every semester feel high stakes.
        </P>
        <P>
          That pressure is also a good reason to track your numbers early. Knowing your CGPA after each term, and what a strong or weak semester
          will do to it, lets you plan instead of reacting. Keep in mind that GPA is one signal among several. Research work, projects,
          internships, and recommendations also count, especially for graduate admissions.
        </P>
      </Card>

      <Card title="Does GPA Matter for Jobs in Pakistan?">
        <P>
          It depends on where you are in your career. For fresh graduates, GPA matters more than people like to admit. Some banks, multinational
          companies, and management trainee programs set a minimum CGPA to shortlist applicants, since they have little else to go on. Graduate
          school and scholarship panels also look at it closely.
        </P>
        <P>
          Once you have a few years of experience, employers care much more about your skills and track record. A strong GPA won’t make up for a
          weak experience, but a very low one can close doors early. If your CGPA is lower than you’d like, build up practical evidence of your
          ability with internships, projects, and certifications.
        </P>
      </Card>

      <Card title="Common Mistakes That Skew Your GPA">
        <List items={[
          ["Using the wrong scale.", "Choosing 4.0 when your university grades out of 5.0, or ignoring the QAU MPhil rules, is the most common cause of a wrong result."],
          ["Skipping credit hours.", "Entering grades without correct credit hours turns a weighted calculation into a plain average."],
          ["Including non-credit or pass/fail courses.", "Courses that don’t carry grade points usually don’t count toward GPA. Leave them out unless your university says otherwise."],
          ["Forgetting repeats and withdrawals.", "Policies for retaken courses and withdrawals vary. Some universities drop the earlier grade, others count both. Follow your own university’s rules when entering these courses."],
          ["Rounding too early.", "Keep full grade point values such as 3.33 and 3.67 through the calculation and round only the final result. Your university may round to two decimals, so match that when comparing against your transcript."],
        ]} />
      </Card>

      <Card title="Practical Situations Where You’d Need a GPA Calculator">
        <List items={[
          ["Checking your standing mid-semester.", "If you know your expected grades, you can see roughly where your GPA will land before results arrive and decide whether you need to push harder in a particular course."],
          ["Scholarships and financial aid.", "Many scholarships, including need-based and merit-based programs, set a minimum CGPA to apply or to keep the award. Knowing your exact figure early prevents unpleasant surprises."],
          ["Avoiding academic probation.", "Universities typically have a minimum CGPA to remain in good standing. Running the numbers lets you see how many credit hours at a certain grade you need to recover."],
          ["Admissions and applications.", "MPhil, MS, and foreign university applications often ask for CGPA. If your transcript doesn’t state it clearly, you can verify it yourself before filling in the form."],
          ["Planning course loads.", "A heavy semester of 4-credit courses carries more risk than a lighter one. Entering hypothetical grades shows how different combinations affect your CGPA."],
          ["Estimating the effect of a repeat or improvement.", "If your university lets you retake a course to replace a low grade, you can test how much the improvement would raise your CGPA. Check whether your institution replaces the old grade or averages both, since policies vary."],
        ]} />
      </Card>

      <Card title="How to Use the Calculator, Step by Step">
        <List ordered items={[
          ["Select your grading scale.", "Pick the 4-point scale, the 5-point scale, or the QAU MPhil scale, whichever your university or program uses. Check your transcript or student handbook if you’re unsure."],
          ["Add your courses.", "Enter each subject you took in the semester. Most Pakistani undergraduates take five or six courses a term, so a normal semester is quick to fill in. Course names are optional and only help you keep track."],
          ["Choose the letter grade for each course.", "Use the grade printed on your result card or student portal."],
          ["Enter the credit hours.", "This is usually 1, 2, 3, or 4. Lab courses often carry fewer credits than theory courses, so check your course outline instead of assuming."],
          ["Read your result.", "The calculator shows your GPA based on everything you entered."],
        ]} />
        <P>
          If a course grade depends on weighted assessments such as quizzes, midterms, and a final, work out your final letter grade first. The
          calculator needs the grade your university will actually award, not your running score.
        </P>
        <P>
          For CGPA, enter every course from every semester you want included. Don’t stop at the latest semester, or you’ll get that semester’s
          GPA instead of your cumulative figure.
        </P>
      </Card>

      <Card title="Free, No Signup, and Built for Accuracy">
        <P>
          The GPA calculator Pakistan students find on this page is free to use, with no hidden charges and no account to create. You enter your
          courses and grades, and the result appears on the page.
        </P>
        <P>
          On accuracy, the calculator applies the standard weighted GPA formula to the scale you select. The result is only as correct as your
          inputs. Wrong credit hours or a mistyped grade will produce a wrong GPA, so compare your entries with your result card before relying
          on the figure.
        </P>
        <P>
          Treat the result as an accurate estimate for planning and checking. Your official transcript, issued by your university’s examination
          department, remains the final authority for any application or dispute.
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
