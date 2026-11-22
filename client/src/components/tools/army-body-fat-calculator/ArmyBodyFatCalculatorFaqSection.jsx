import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the Army body fat standard now?",
    a: "The Army uses the waist-to-height ratio. Your waist at the navel divided by your height must be below 0.55. The old height and weight tables, tape test, and body fat percentage limits have been replaced.",
  },
  {
    q: "How do I calculate Army body fat?",
    a: "Divide your waist circumference at the navel by your height, using the same unit for both. For example, a 36-inch waist at 70 inches tall gives about 0.51, which passes. This calculator does the math for you.",
  },
  {
    q: "What is the Army body fat cutoff?",
    a: "The cutoff is a waist-to-height ratio of 0.55. Soldiers at 0.55 or higher are flagged and enrolled in the Army Body Composition Program. The cutoff is the same for men and women of all ages.",
  },
  {
    q: "Does the Army still use the tape test?",
    a: "No. The circumference-based tape test and the supplemental body fat assessments were replaced by the waist-to-height ratio, and they can’t be used to challenge a WHtR result.",
  },
  {
    q: "Where do you measure your waist for the Army WHtR?",
    a: "At the navel, also called the belly button, with the tape level around your body. Stand upright, keep your arms at your sides, and take the average of at least three measurements.",
  },
  {
    q: "What happens if I fail the Army waist-to-height ratio?",
    a: "A second team confirms the measurement on the same duty day. If you fail again, you are flagged and enrolled in the Army Body Composition Program until you meet the standard. No separation actions will occur during the initial 180-day assessment period.",
  },
  {
    q: "Can I join the Army if I’m overweight but muscular?",
    a: "Enlistment screening has historically checked body fat for applicants who are over the weight limit, and applicants who meet the body fat standard can generally continue. The Army changed its body composition policy in 2026, so ask your recruiter which method applies to you.",
  },
  {
    q: "Do the Army Reserve and National Guard use the same standard?",
    a: "Yes. The waist-to-height ratio standard applies to the Regular Army, the Army National Guard, and the Army Reserve.",
  },
  {
    q: "Can I calculate body fat without instruments?",
    a: "For the Army standard, yes. You need a tape measure and your height. The WHtR doesn’t require scales, calipers, or scanners.",
  },
  {
    q: "Is this Army body fat calculator free?",
    a: "Yes. It’s free to use, with no signup required.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const WAIST_HEADERS = ["Height", "Waist must be below"];
const WAIST_ROWS = [
  ["60 in (152 cm)", "33.0 in (83.8 cm)"],
  ["62 in (157 cm)", "34.1 in (86.6 cm)"],
  ["64 in (163 cm)", "35.2 in (89.4 cm)"],
  ["66 in (168 cm)", "36.3 in (92.2 cm)"],
  ["68 in (173 cm)", "37.4 in (95.0 cm)"],
  ["70 in (178 cm)", "38.5 in (97.8 cm)"],
  ["72 in (183 cm)", "39.6 in (100.6 cm)"],
  ["74 in (188 cm)", "40.7 in (103.4 cm)"],
  ["76 in (193 cm)", "41.8 in (106.2 cm)"],
];
const OLD_HEADERS = ["Age", "Men", "Women"];
const OLD_ROWS = [
  ["17–20", "20%", "30%"],
  ["21–27", "22%", "32%"],
  ["28–39", "24%", "34%"],
  ["40 and over", "26%", "36%"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
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

export default function ArmyBodyFatCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
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

      <Card title="How Can I Calculate Army Body Fat?">
        <P>
          Today the Army uses the waist-to-height ratio, usually shortened to WHtR. The formula is simple: divide your waist
          circumference at the navel by your height, with both numbers in the same unit. To meet the standard, your result must be
          below 0.55.
        </P>
        <P>Here is how to use the calculator:</P>
        <List ordered items={[
          ["", "Measure your height."],
          ["", "Measure your waist at the navel (the next section explains how)."],
          ["", "Enter both numbers, using the same unit for each."],
          ["", "Read your ratio, your pass or fail result, and the waist size you need to pass."],
        ]} />
        <P>
          The ratio comes out the same in inches or centimeters, but mixing units gives a meaningless result. Here is a quick
          example. A soldier who is 70 inches tall multiplies 70 by 0.55 and gets 38.5. Any waist below 38.5 inches passes. A
          36-inch waist gives a ratio of about 0.51, which passes. A 39-inch waist gives about 0.557, which does not.
        </P>
        <P>
          Because WHtR is a ratio, this Army body fat calculator won’t show a body fat percentage. You’ll see a number like 0.51 or
          0.56. A result of 0.55 or higher does not meet the standard.
        </P>
        <H3>How Do You Calculate Body Fat Without Instruments?</H3>
        <P>
          For the Army standard, you only need a soft tape measure and a way to check your height. The WHtR doesn’t require
          calipers, scales, or scanners. That makes it easy to check yourself at home as often as you like.
        </P>
        <P>
          If you want a body fat percentage specifically, the old Army tape method estimated it from a belly-button measurement and
          body weight. That method is no longer used to decide compliance, so a percentage estimate won’t tell you whether you meet
          today’s standard.
        </P>
      </Card>

      <Card title="What Is the New Way the Army Measures Body Fat?">
        <P>
          The Army replaced the height and weight tables, the circumference-based tape test, and the supplemental body fat
          assessments with the waist-to-height ratio. The change followed a January 2026 Department of Defense directive that made
          WHtR the primary body composition tool. The Army announced its own version on July 7, 2026.
        </P>
        <P>
          Under the new policy, the tape test and other body fat assessments can no longer be used to challenge a WHtR result. A
          high score on the Army Fitness Test also doesn’t excuse you from the measurement. The old system allowed that kind of
          exemption for top performers, and it’s gone.
        </P>
        <P>
          The Army says the ratio is a medically validated screening tool and that it fits a wider range of body types than weight
          tables did. Weight isn’t part of the formula at all.
        </P>
      </Card>

      <Card title="What Is the Army Body Fat Cutoff?">
        <P>
          People often ask for the Army’s body fat percentage limit. The current cutoff is a waist-to-height ratio below 0.55. A
          ratio of 0.55 or higher leads to flagging and enrollment in the Army Body Composition Program.
        </P>
        <P>
          The cutoff is the same for men and women, and it doesn’t change with age. The old system was different, as the comparison
          later in this article shows.
        </P>
      </Card>

      <Card title="How Are Soldiers Screened for Body Fat?">
        <P>
          All soldiers get a WHtR assessment twice per calendar year. The assessment measures your waist at the navel and divides it
          by your height. Commanders can also direct a soldier to be assessed at any time if they have concerns about whether the
          soldier meets the standard.
        </P>
        <P>
          If your ratio is 0.55 or higher, a different team confirms the result on the same duty day. If you fail the second
          measurement, you are flagged and placed in the Army Body Composition Program.
        </P>
      </Card>

      <Card title="How to Measure Your Waist Correctly at the Navel">
        <P>
          Your result is only as accurate as your measurement. The standard uses the waistline at the navel, also called the belly
          button. Don’t measure at the narrowest part of your torso or at your belt line.
        </P>
        <P>A few habits keep the number consistent:</P>
        <List items={[
          ["Stand upright and relaxed.", "Keep your feet shoulder-width apart and your arms at your sides. Don’t pull your stomach in."],
          ["Keep the tape level.", "It should run parallel to the floor all the way around. A tape that dips at the back can add an inch or more."],
          ["Measure against bare skin or a thin layer.", "Thick clothing and a belt add false inches."],
          ["Read at the end of a normal exhale.", "Don’t measure after a deep breath in, and don’t force the air out."],
          ["Make the tape snug, not tight.", "It should touch the skin without pressing into it."],
          ["Take at least three measurements and use the average.", "The old Army method used the same approach, rounding the average to the nearest half inch, and it’s a good habit here too. A half-inch of difference matters when you’re close to the limit. For height, stand against a wall and use a flat object on your head. Don’t guess, since a one-inch height error changes the ratio."],
        ]} />
      </Card>

      <Card title="Maximum Passing Waist by Height">
        <P>
          You can find your number in the table below, or let the Army body fat calculator do it for you. Each figure is height
          multiplied by 0.55. Your waist must be below it.
        </P>
        <DataTable headers={WAIST_HEADERS} rows={WAIST_ROWS} />
        <P>
          A useful rule of thumb: your waist should be a little more than half your height. For each extra inch of height, you gain
          about 0.55 inches of allowable waist.
        </P>
      </Card>

      <Card title="Old Army Body Fat Standards vs. the Waist-to-Height Ratio">
        <P>
          Many people still search for an Army body fat percentage chart or an Army tape test calculator, because that system
          lasted for decades. It’s useful to know what it looked like, since it explains why the Army made the change.
        </P>
        <P>
          The first step was a height and weight screening table. Soldiers over the table limit moved on to a tape test. By the most
          recent version, the tape test used one abdominal measurement at the belly button plus body weight to estimate body fat.
          The result was compared against age-based limits:
        </P>
        <DataTable headers={OLD_HEADERS} rows={OLD_ROWS} />
        <P>
          Soldiers who failed the tape test could request a supplemental assessment, such as a DXA scan, an InBody 770 analyzer, or
          a Bod Pod, if one was reasonably available. Soldiers who scored 540 or higher on the Army Combat Fitness Test, with at
          least 80 points in every event, were exempt from the assessment altogether.
        </P>
        <P>None of that applies now. Those tables, tests, and exemptions are gone. Here is why the Army moved on:</P>
        <List items={[
          ["Weight tables flagged muscular soldiers.", "Lifters and athletes were often marked overweight because they were heavy for their height."],
          ["The tape test was harder to apply the same way everywhere.", "It needed formulas, age tables, and often a second round of testing."],
          ["The new method is simpler.", "It uses one measurement and one threshold."],
        ]} />
      </Card>

      <Card title="What Are the Army’s Body Fat Standards, and What Happens If Someone Fails?">
        <P>
          The standard is a waist-to-height ratio below 0.55. Soldiers no longer do a separate weigh-in against a height and weight
          table. Your weight isn’t part of the formula, so the old situation of failing the weigh-in, the body fat measurement, or
          both doesn’t exist in the same way.
        </P>
        <P>Here is what happens if your ratio is 0.55 or higher:</P>
        <List items={[
          ["", "A second team confirms the measurement on the same duty day."],
          ["", "If you fail again, you are flagged and enrolled in the Army Body Composition Program, often called the ABCP. Some soldiers informally call it “fat camp,” but it is a monitoring and support program, not a school. Soldiers in it work on diet and exercise until they meet the standard."],
          ["", "You stay in the program until your ratio is below 0.55."],
          ["", "A flag generally puts favorable personnel actions on hold, such as promotions and some schools, until it’s lifted. Ask your chain of command how it applies to your situation."],
        ]} />
        <P>
          The Army is running an initial 180-day assessment of the new standard. No separation actions for failing the WHtR will
          happen during that period. The standard still applies, though, and flagging and ABCP enrollment continue. The Army may
          adjust the policy after the review, so check current guidance from your unit.
        </P>
      </Card>

      <Card title="Does a Soldier Have to Have a Perfect Body?">
        <P>
          No. The Army standard is a health and readiness screen, not an appearance test. A soldier only needs to stay below 0.55.
          Soldiers come in many sizes and builds, and a ratio below 0.55 leaves plenty of room for different frames.
        </P>
        <P>
          Muscle and height are also less of a problem than they used to be. Weight isn’t in the formula, so being heavy because of
          muscle doesn’t count against you. Taller soldiers also get a larger allowable waist, since the limit grows with height. A
          thick midsection can still push the ratio up, even on a muscular person, so the waist number is what matters.
        </P>
      </Card>

      <Card title="What Are the Reasons the Army Cares About Body Fat?">
        <P>The Army gives a few main reasons for tracking body composition.</P>
        <Lead lead="Physical performance.">
          In 2021, Army leaders studied the link between Army Combat Fitness Test scores and body composition. Soldiers with higher
          body fat tended to score lower. The Army’s job demands running, carrying, dragging, and lifting under stress, and body
          composition affects how well soldiers do those things.
        </Lead>
        <Lead lead="Long-term health.">
          Extra fat around the waist is linked to higher risk of heart disease and type 2 diabetes. A waist measurement is a quick
          way to spot the risk early, before it turns into a medical problem. The Army calls this a health assessment tool.
        </Lead>
        <Lead lead="Readiness and fairness.">
          The Army needs soldiers who can deploy and perform. It also wants a standard that is measured the same way for everyone.
          One tape measurement and one threshold are easier to apply fairly than a table of weights and formulas.
        </Lead>
        <P>
          Physical fitness matters in the Army beyond the waist measurement. Soldiers also take the Army Fitness Test, which includes
          the three-repetition maximum deadlift, hand-release push-up, sprint-drag-carry, plank, and two-mile run. Falling short on
          fitness can limit promotions and other opportunities. Body composition is one piece of the overall picture of a soldier’s
          readiness.
        </P>
      </Card>

      <Card title="Standards for the Reserve and National Guard">
        <P>
          The new policy covers the Regular Army, the Army National Guard, and the Army Reserve. Reserve and Guard soldiers face the
          same waist-to-height ratio below 0.55 and the same twice-a-year assessments. There is no separate, looser standard for
          part-time soldiers.
        </P>
      </Card>

      <Card title="Body Composition at MEPS and Enlistment">
        <P>
          Enlistment screening works separately from the in-service Army Body Composition Program. Applicants are screened at the
          Military Entrance Processing Station, or MEPS, under Department of Defense medical standards. Historically, applicants were
          checked against a weight-for-height limit, and anyone over the limit got a body fat measurement. Because the Army changed
          its policy in 2026, ask your recruiter which method applies on your screening date.
        </P>
        <P>These are the questions applicants ask most often:</P>
        <List items={[
          ["What if I’m over the weight limit but my body fat is within the standard?", "Under the weight-then-body-fat method, going over the weight limit triggers a body fat measurement. Applicants who meet the body fat standard can generally continue, and that includes people who carry a lot of muscle."],
          ["What if I’m over the body fat standard?", "Applicants are usually asked to lose the excess before they can ship. Your recruiter can tell you your target and how much time you have, and whether a waiver is an option in your case."],
          ["Do Reserve and National Guard applicants face different rules?", "They also go through MEPS, and the same screening generally applies. Confirm details with the recruiter for your component."],
        ]} />
        <P>
          Checking your waist-to-height ratio with this calculator before you visit is a smart move. It won’t replace the official
          screening, but it shows whether your waist is in a safe range.
        </P>
      </Card>

      <Card title="What Height and Weight Are Required in the Army?">
        <P>
          Soldiers no longer have to meet a maximum weight for their height. The waist-to-height ratio replaced those tables for
          serving soldiers. For enlistment, the Army has a set height range, commonly listed as 60 to 80 inches. A recruiter can
          confirm the exact limits and any exceptions.
        </P>
      </Card>

      <Card title="What Is the Average Weight and Body Fat of a Soldier?">
        <P>
          The Army doesn’t publish a standard average, and the standards set limits instead of averages. Under the old system, the
          maximum allowable body fat for men ran from 20% to 26% depending on age, and for women from 30% to 36%. Those were
          ceilings, not typical values. Soldiers vary a lot in height, build, and training, so there’s no single “average soldier”
          number to aim for. Your goal is simply a ratio below 0.55.
        </P>
      </Card>

      <Card title="When You’d Use This Army Body Fat Calculator">
        <P>The tool is useful in more situations than a routine assessment.</P>
        <List items={[
          ["Before a scheduled assessment.", "The most common use. Check where you stand a few weeks out, then recheck as the date approaches."],
          ["After leave, an injury, or a deployment.", "Waist size can change quickly with shifts in activity, sleep, and diet. A quick calculation shows whether you’ve drifted."],
          ["While in the ABCP.", "If you’re flagged, you need a target. The waist size you need to pass tells you how many inches to lose, which is easier to track than a vague goal."],
          ["Before enlisting or commissioning.", "Recruits and cadets can see how they measure up before they talk to a recruiter or start training."],
          ["For leaders and trainers.", "NCOs, officers, and fitness staff can run quick checks on their own or when counseling a soldier."],
        ]} />
      </Card>

      <Card title="Practical Ways to Lower Your Waist-to-Height Ratio">
        <P>The calculator is a screening check, but if your result is close to or above the limit, a few habits help.</P>
        <List items={[
          ["Reduce your overall calorie surplus.", "Waist size responds to total energy balance. Stomach exercises on their own don’t shrink the waist."],
          ["Combine cardio and resistance training.", "Both support fat loss, and strength work helps you keep muscle as your waist comes down."],
          ["Prioritize protein and fiber.", "They help you feel full, which makes a modest calorie deficit easier to keep."],
          ["Get enough sleep and manage stress.", "Poor sleep and chronic stress are both linked to more abdominal fat."],
          ["Cut back on alcohol and liquid calories.", "These are often the quickest place to find savings."],
        ]} />
        <H3>How Do I Fix Uneven Body Fat Distribution?</H3>
        <P>
          Many people carry fat in one area, often the midsection, while the rest of the body looks lean. Where your body stores fat
          depends largely on genetics, age, hormones, and lifestyle, and you can’t choose where fat comes off. Losing fat overall is
          what reduces the waist over time, and the belly often responds as total body fat drops. Strength training can improve
          shape and muscle tone. Because the Army standard looks at your waist directly, steady fat loss paired with regular exercise
          is the most reliable approach.
        </P>
        <P>
          Aim for steady progress. Crash dieting or dehydration tactics can hurt your performance and health, and they don’t produce
          lasting change. If you have a medical condition or aren’t sure what is safe for you, talk to a healthcare professional or
          your unit’s health and fitness resources before making big changes.
        </P>
      </Card>

      <Card title="Accuracy, Privacy, and Cost">
        <P>
          The math behind this calculator is straightforward: waist divided by height, compared against 0.55, with the passing waist
          found by multiplying your height by 0.55. There is no estimate or hidden model involved, so the output is only as accurate
          as the numbers you enter. That’s why the measuring tips above matter.
        </P>
        <P>
          The tool is free, with no payment or hidden charges, and you don’t need an account to use it. It only needs your height
          and your waist measurement. It doesn’t ask for your name, rank, or other personal details.
        </P>
        <P>
          This Army body fat calculator is an informational tool. It is not an official Army assessment, and a result here doesn’t
          replace a measurement taken by your unit. Official results come from the measurement taken at your assessment. Policy can
          change, so confirm current requirements with your chain of command or the latest Army guidance.
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
