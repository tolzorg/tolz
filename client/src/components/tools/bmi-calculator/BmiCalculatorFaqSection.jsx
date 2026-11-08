import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a good BMI for adults?",
    a: "A BMI of 18.5 to 24.9 is the normal range according to the WHO. Studies show the lowest risk of early death at roughly 20 to 25 for non-smokers.",
  },
  {
    q: "How do I calculate my BMI manually?",
    a: "Divide your weight in kilograms by your height in meters squared. In US units, multiply your weight in pounds by 703 and divide by your height in inches squared.",
  },
  {
    q: "Is the BMI calculation different for men and women?",
    a: "Not for adults. The formula and categories are the same. For kids and teens from 2 to 20, age and sex are factored in because the CDC percentiles differ.",
  },
  {
    q: "Is BMI a good indication of health?",
    a: "It’s a useful screening number but not a verdict. It can’t separate muscle from fat or show where fat sits. Combining it with waist measurement, blood work and fitness gives a better picture.",
  },
  {
    q: "What is the best way to lower my BMI?",
    a: "Aim for slow, steady weight loss of about 0.5 to 1 kg a week with a modest calorie deficit, strength training, regular walking, enough protein and good sleep. Talk to a doctor if you have health conditions.",
  },
  {
    q: "Can I lower my BMI without losing weight?",
    a: "No, BMI only changes when weight or height does. You can improve body composition, though, by building muscle and losing fat, which often improves health more than the number itself.",
  },
  {
    q: "What is a healthy BMI for a child?",
    a: "Between the 5th and 85th percentile for their age and sex. Below the 5th is underweight, 85th to below the 95th is overweight, and the 95th or higher is obesity.",
  },
  {
    q: "What is BMI Prime?",
    a: "BMI divided by 25. A value of 0.74 to 0.99 is normal, and 1.0 or higher means you’re above the upper normal limit.",
  },
  {
    q: "What is the Ponderal Index?",
    a: "It’s weight divided by height cubed. It can be a fairer measure for very tall or very short people and is a supporting indicator next to BMI.",
  },
  {
    q: "Is BMI accurate for athletes?",
    a: "Often not. Muscle is dense, so muscular people can show up as overweight even with low body fat. Body fat percentage and waist measurements work better.",
  },
  {
    q: "What can I use instead of BMI?",
    a: "Waist-to-height ratio, waist circumference, waist-to-hip ratio, body fat percentage (DEXA or bioimpedance), blood work and fitness tests.",
  },
  {
    q: "How do I measure BMI with scoliosis?",
    a: "Use your arm span instead of standing height, or ask a doctor for an ulna-length estimate, since spinal curves make you measure shorter than you are.",
  },
  {
    q: "Does the calculator work during pregnancy?",
    a: "BMI isn’t a valid health measure during pregnancy. Your doctor can recommend a weight-gain range based on your pre-pregnancy BMI.",
  },
];

// The supplied FAQ schema lists only these questions; their wording is the
// displayed text with straight apostrophes, except where overridden below.
const FAQ_SCHEMA_QUESTIONS = [
  "What is a good BMI for adults?",
  "How do I calculate my BMI manually?",
  "Is BMI a good indication of health?",
  "Can I lower my BMI without losing weight?",
  "What is a healthy BMI for a child?",
  "What is BMI Prime?",
  "What is the Ponderal Index?",
  "What can I use instead of BMI?",
  "How do I measure BMI with scoliosis?",
];
const FAQ_SCHEMA_OVERRIDES = {
  "Can I lower my BMI without losing weight?": "No, BMI only changes when weight or height does. You can improve body composition by building muscle and losing fat, which often improves health more than the number itself.",
};
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS
  .filter((item) => FAQ_SCHEMA_QUESTIONS.includes(item.q))
  .map((item) => ({ q: straight(item.q), a: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) }));

const WHO_HEADERS = ["Category", "BMI (kg/m²)"];
const WHO_ROWS = [
  ["Severe thinness", "Below 16"],
  ["Moderate thinness", "16 – 16.9"],
  ["Mild thinness", "17 – 18.4"],
  ["Normal weight", "18.5 – 24.9"],
  ["Overweight (pre-obese)", "25 – 29.9"],
  ["Obesity class I", "30 – 34.9"],
  ["Obesity class II", "35 – 39.9"],
  ["Obesity class III", "40 and above"],
];
const CHILD_HEADERS = ["Category", "Percentile"];
const CHILD_ROWS = [
  ["Underweight", "Below the 5th"],
  ["Healthy weight", "5th to below the 85th"],
  ["Overweight", "85th to below the 95th"],
  ["Obesity", "95th or higher"],
];
const PRIME_HEADERS = ["Category", "BMI", "BMI Prime"];
const PRIME_ROWS = [
  ["Severe thinness", "Below 16", "Below 0.64"],
  ["Moderate thinness", "16 – 16.9", "0.64 – 0.67"],
  ["Mild thinness", "17 – 18.4", "0.68 – 0.73"],
  ["Normal", "18.5 – 24.9", "0.74 – 0.99"],
  ["Overweight", "25 – 29.9", "1.0 – 1.19"],
  ["Obesity class I", "30 – 34.9", "1.2 – 1.39"],
  ["Obesity class II", "35 – 39.9", "1.4 – 1.59"],
  ["Obesity class III", "40 and above", "1.6 and above"],
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
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {cell}
                </td>
              ))}
            </tr>
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

export default function BmiCalculatorFaqSection() {
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

      <Card title="What Is Body Mass Index (BMI)?">
        <P>
          BMI is a ratio of your weight to your height. It was built to give a quick read on whether someone’s weight is in a
          reasonable zone for their size. It doesn’t measure fat directly. It’s a screening number, and doctors use it to decide
          whether a closer look is worth it.
        </P>
        <H3>Is BMI Scientific, or Is It Only an Estimate?</H3>
        <P>
          Both, honestly. The math is exact, and the formula never changes. What the math represents is an estimate. BMI doesn’t
          know how much of your weight is muscle, fat, bone or water, and it doesn’t know where you carry it.
        </P>
        <P>
          Where it earns its keep is in big groups of people. Across large studies, higher BMI categories line up with higher rates
          of type 2 diabetes, heart disease and certain cancers. For one individual, it’s a rough first pass. Think of it like a
          smoke detector: it can tell you something might be off, but it can’t tell you whether it’s burnt toast or a real fire.
        </P>
        <H3>How Does BMI Work?</H3>
        <P>
          BMI squares your height because body weight doesn’t rise in a straight line with height. A person who’s 10 percent taller
          is, on average, heavier by more than 10 percent. Dividing weight by height squared corrects for that, so a tall person
          and a short person can be compared on the same scale.
        </P>
        <P>
          The idea goes back to the Belgian mathematician Adolphe Quetelet in the 1830s, which is why you’ll sometimes see it
          called the Quetelet index. The name “Body Mass Index” came in 1972, when researcher Ancel Keys compared several
          height-weight formulas and found this one tracked body fat best across large groups. It stuck because it takes two
          measurements anyone can get.
        </P>
      </Card>

      <Card title="What Is the Best Way to Calculate Body Mass Index?">
        <P>
          For a quick check, an online BMI calculator is the best option because it removes the arithmetic mistakes people make
          when squaring height by hand. It also handles unit conversion, which is where most errors creep in when someone mixes
          pounds with centimeters.
        </P>
        <P>The best way to get an accurate number, though, comes down to your inputs, not the math:</P>
        <List items={[
          ["", "Measure height barefoot, standing against a wall, heels together, looking straight ahead."],
          ["", "Weigh yourself in the morning after using the bathroom, in light clothes."],
          ["", "Use the same scale each time."],
          ["", "Don’t rely on the height from your driver’s license. Plenty of people round up, and an inch matters more than you’d think."],
        ]} />
        <P>
          An inch of height error on a 5'6" person shifts BMI by roughly 0.6 to 0.7 points. That’s enough to move some people
          across a category line.
        </P>
      </Card>

      <Card title="How Do I Calculate My Body Mass Index (BMI)?">
        <P>You can do it by hand with any phone calculator.</P>
        <Formula>
          Metric: weight in kg ÷ (height in meters × height in meters)<br />
          US units: 703 × weight in pounds ÷ (height in inches × height in inches)
        </Formula>
        <P>
          Here’s a metric example. Say you weigh 72.57 kg (160 lb) and you’re 1.778 m tall (5'10"). Square the height: 1.778 ×
          1.778 = 3.161. Then 72.57 ÷ 3.161 = 22.96, which rounds to 23.0.
        </P>
        <P>
          The US version gives the same answer. At 160 lb and 70 inches: 703 × 160 = 112,480. Then 70 × 70 = 4,900. 112,480 ÷
          4,900 = 22.96, again about 23.0.
        </P>
        <P>A second example with different numbers: 70 kg at 1.75 m comes out to 22.9, and 160 lb at 5'9" (69 inches) comes out to 23.6.</P>
      </Card>

      <Card title="What Is the Exact Range of Body Mass Index?">
        <P>
          There isn’t one universal range, since agencies set them differently for adults, kids, and some ethnic groups. For
          adults 20 and older, the WHO ranges are the global standard, and the same ones apply to men and women:
        </P>
        <DataTable headers={WHO_HEADERS} rows={WHO_ROWS} />
        <P>Everything under 18.5 counts as underweight. The three thinness tiers just show how far under you are.</P>
        <H3>Do Asian Populations Use the Same Ranges?</H3>
        <P>
          Not exactly. A WHO expert panel in 2004 found that people of Asian descent tend to develop type 2 diabetes and heart
          disease at lower BMIs. It suggested public health action points of about 23 for increased risk and 27.5 for high risk.
          Many clinics in India, Pakistan, China and Japan use those or similar cut-offs. If you’re of South or East Asian
          background, take a BMI of 23 to 24.9 more seriously than the standard chart would suggest.
        </P>
        <H3>Do Obese People Have a High BMI?</H3>
        <P>
          By definition, yes. A BMI of 30 or more is classified as obesity. But the reverse isn’t always true. Some people with a
          BMI under 30 carry a lot of body fat and have the health problems that come with it, and some people over 30 are muscular
          and metabolically healthy. That gap is the main reason doctors say BMI alone isn’t enough.
        </P>
      </Card>

      <Card title="What Is the Best BMI for the Human Body?">
        <H3>What Is the Best BMI Point?</H3>
        <P>
          There’s no magic number, but the research points to a fairly consistent sweet spot. Large studies that followed hundreds
          of thousands to millions of people, such as the Prospective Studies Collaboration and the Global BMI Mortality
          Collaboration, found the lowest death rates around 20 to 25 for people who never smoked. Some analyses put the low point
          nearer 22 to 24. Risk rises gently on the lower end and more steeply as BMI climbs past 30.
        </P>
        <H3>What Is the Most Optimal BMI to Be At?</H3>
        <P>
          For most adults, somewhere in the low-to-mid 20s is the safest bet, and 18.5 to 24.9 is the range most doctors aim for.
          “Optimal” shifts with the person, though:
        </P>
        <List items={[
          ["Older adults (65+)", "often do fine, or even slightly better, at a BMI of 25 to 27. A little extra reserve helps during illness and surgery, and losing muscle matters more than losing a few pounds."],
          ["Athletes", "can sit above 25 with low body fat and be perfectly healthy."],
          ["People of Asian descent", "are usually advised to stay lower, closer to 18.5 to 22.9."],
        ]} />
        <H3>What Is an Acceptable BMI?</H3>
        <P>
          Acceptable usually means “not raising your risk.” That’s 18.5 to 24.9 for most adults. The overweight range (25 to 29.9)
          isn’t a disease. Some big meta-analyses, including a widely cited 2013 JAMA review, found overweight wasn’t linked to
          higher death rates, and mild obesity showed only a small bump. Risks do climb clearly from class II obesity upward.
        </P>
        <H3>What Is a Good Body Mass Index for a Woman?</H3>
        <P>
          The same 18.5 to 24.9 range applies. Keep in mind that women naturally carry more body fat than men at the same BMI, so a
          woman at 24 isn’t the same as a man at 24 in terms of composition. Pregnancy, breastfeeding, menopause and hormonal
          conditions like PCOS can also shift weight in ways BMI doesn’t reflect. If your cycles have stopped or become irregular
          and your BMI is low, that’s worth a doctor visit regardless of what the chart says.
        </P>
      </Card>

      <Card title="Is BMI a Good Indication of Health?">
        <P>
          It’s a decent starting point and a weak finish line. A BMI in the normal range doesn’t prove you’re healthy, and a BMI in
          the overweight range doesn’t prove you’re not. Two people at BMI 27 can have completely different blood pressure,
          cholesterol, fitness and fat distribution.
        </P>
        <H3>How Important Is My BMI for Overall Health?</H3>
        <P>
          Moderately important, but way less than people assume. Things that predict health better than BMI include
          cardiorespiratory fitness, waist size, blood pressure, blood sugar, blood lipids, sleep, smoking status and how much you
          move. Studies keep showing that fit people at higher BMIs often do better than unfit people at “normal” BMI. Treat it as
          one dial on the dashboard, not the whole dashboard.
        </P>
        <H3>What Are the Benefits of BMI?</H3>
        <P>BMI’s strengths are real, and they’re why it hasn’t been replaced:</P>
        <List items={[
          ["", "It’s free and takes seconds."],
          ["", "It needs no special equipment."],
          ["", "It’s consistent, so you can track change over time."],
          ["", "It works as a screening tool for large populations and for doctors with 15-minute appointments."],
          ["", "Decades of research are tied to it, so we know what the categories mean in terms of risk."],
        ]} />
        <H3>How Flawed and Outdated Is BMI?</H3>
        <P>
          It’s flawed, and it’s old. It was never designed to diagnose an individual. It ignores muscle, bone density, fat
          distribution, age, sex and ethnicity. It can label a lean athlete as overweight and miss excess fat in someone with a
          “normal” number.
        </P>
        <P>
          The medical world has been moving past it. The American Medical Association adopted a policy in 2023 calling BMI an
          imperfect measure and urging doctors to use it alongside other data. In 2025, a Lancet Diabetes &amp; Endocrinology
          commission of international experts proposed redefining clinical obesity. Their view is that BMI can flag possible excess
          fat, but diagnosis should be confirmed with another measure, such as waist circumference, waist-to-height ratio, or direct
          body-fat measurement. Going into 2027, that’s the direction most guidance is heading: BMI first, then a second check.
        </P>
        <H3>What Is the Formula for the Smart Body Mass Index?</H3>
        <P>
          “Smart BMI” is an adjusted formula proposed by Oxford mathematician Nick Trefethen. The standard formula divides by height
          squared, but Trefethen argued that height to the power of 2.5 fits real bodies better. His version is:
        </P>
        <Formula>Smart BMI = 1.3 × weight (kg) ÷ height (m)^2.5</Formula>
        <P>
          The 1.3 keeps the results close to standard BMI for average-height adults. The main effect is that it gives tall people
          lower scores and short people higher scores than standard BMI does. It isn’t an official clinical standard. The official
          categories are all built on regular BMI, so use Smart BMI for curiosity, not for medical decisions.
        </P>
        <H3>How Should You Measure BMI If You Have Scoliosis?</H3>
        <P>
          Scoliosis curves the spine, which makes you shorter when standing than your skeletal height really is. That pushes BMI
          artificially high. Two practical fixes:
        </P>
        <List items={[
          ["", "Measure your arm span (fingertip to fingertip, arms straight out). In most adults it’s close to height, usually within a couple of inches, and it isn’t affected by spinal curvature."],
          ["", "Ask your doctor for an ulna-length estimate or segmental height, which clinicians use for patients with spinal curves."],
        ]} />
        <P>
          Plug the corrected height into the BMI calculator. Also, lean on waist-based measures and body composition more than
          usual, since BMI will be shakier for you.
        </P>
        <H3>Is BMI a Useful Metric for Fitness?</H3>
        <P>
          Not really. BMI says nothing about strength, endurance, mobility or heart health. You can have a normal BMI and be winded
          climbing one flight of stairs. Better fitness markers include resting heart rate, how fast your heart rate recovers after
          exercise, a timed mile or 1.5-mile run, grip strength, push-up count, and how easily you can get up from the floor.
        </P>
        <H3>Which Bodybuilder Has the Highest BMI?</H3>
        <P>
          There’s no official record, but the numbers get wild. Top pro bodybuilders in off-season often carry 280 to 300+ pounds
          on a frame of around 5'10" to 6'0", which puts the BMI somewhere around 40 to 42, squarely in “obesity class III” by the
          chart, even at relatively low body-fat levels on stage. It’s the clearest example of why the number can mislead. (Extreme
          muscle mass at that size comes with its own health strain, though, so it’s not a health goal either.)
        </P>
      </Card>

      <Card title="What Are Better Ways to Measure Health Than BMI?">
        <H3>If BMI Is a Bad Indication of Health, How Do We Measure Good Health?</H3>
        <P>You look at several things together. A solid picture includes:</P>
        <List items={[
          ["Waist-to-height ratio.", "Divide your waist by your height (same units). Keeping it under 0.5 is a common guideline. 0.5 to 0.59 means increased risk, and 0.6 or more means high risk. It works across heights, ages and ethnicities better than BMI does."],
          ["Waist circumference.", "Over 40 inches (102 cm) for men or 35 inches (88 cm) for women is the high-risk line in US guidelines. The lower “increased risk” lines are about 37 and 31.5 inches (94 and 80 cm)."],
          ["Waist-to-hip ratio.", "The WHO flags above 0.90 for men and above 0.85 for women."],
          ["Blood work.", "Fasting glucose or A1C, lipids (LDL, HDL, triglycerides), and blood pressure tell you what’s happening inside."],
          ["Fitness and strength.", "Cardio fitness is one of the strongest predictors of how long you’ll live."],
          ["Body fat percentage.", "Measured by DEXA scan (most accurate in a clinic), bioimpedance scales (convenient, but swings with hydration), calipers (decent in trained hands), or hydrostatic weighing."],
        ]} />
        <H3>What Are Some Alternatives to Calculating BMI?</H3>
        <P>Besides the ones above, a few other formulas you’ll run into:</P>
        <List items={[
          ["Body Roundness Index (BRI).", "Uses waist and height to estimate how “round” you are, which tracks visceral fat."],
          ["A Body Shape Index (ABSI).", "Adjusts waist circumference for weight and height."],
          ["BMI Prime and Ponderal Index.", "These are variations on BMI, covered below."],
          ["Relative Fat Mass.", "Estimates body fat from height and waist, with different formulas for men and women."],
        ]} />
        <H3>Are There Key Studies on BMI, Optimal Health and Longevity?</H3>
        <P>A few worth knowing by name, if you want to look them up:</P>
        <List items={[
          ["Prospective Studies Collaboration (Lancet, 2009).", "Almost 900,000 adults. Lowest mortality at roughly 22.5 to 25."],
          ["Flegal et al. (JAMA, 2013).", "Pooled analysis. Overweight wasn’t tied to higher mortality, and class I obesity wasn’t significantly higher either. Class II and III were."],
          ["Global BMI Mortality Collaboration (Lancet, 2016).", "About 10 million people. Lowest risk between 20 and 25 among never-smokers, with risk rising on both sides."],
          ["Aune et al. (BMJ, 2016).", "Lowest mortality around 23 to 24 for never-smokers."],
        ]} />
        <P>
          The pattern: a U-shaped or J-shaped curve, with the low point in the low-to-mid 20s, and higher risk at both extremes. The
          “overweight is fine” findings are partly explained by smokers and sick people who lose weight dragging down the low end,
          which is why the never-smoker analyses are the cleaner ones.
        </P>
      </Card>

      <Card title="Health Risks at Different BMI Levels">
        <H3>Risks of Being Overweight</H3>
        <P>According to the CDC, carrying excess weight raises the risk of:</P>
        <List items={[
          ["", "High blood pressure"],
          ["", "Unhealthy cholesterol (higher LDL and triglycerides, lower HDL)"],
          ["", "Type 2 diabetes"],
          ["", "Coronary heart disease and stroke"],
          ["", "Gallbladder disease"],
          ["", "Osteoarthritis, from extra load on the joints"],
          ["", "Sleep apnea and breathing problems"],
          ["", "Several cancers, including endometrial, breast, colon, kidney, gallbladder and liver"],
          ["", "Depression and anxiety"],
          ["", "Body pain and trouble with physical tasks"],
          ["", "Lower quality of life and a higher overall risk of early death"],
        ]} />
        <P>Those risks go up gradually, not suddenly. They depend a lot on where the weight sits, and belly fat is the more dangerous kind.</P>
        <H3>Risks of Being Underweight</H3>
        <P>Low weight has its own costs:</P>
        <List items={[
          ["", "Malnutrition, vitamin deficiencies and anemia"],
          ["", "Osteoporosis and a higher chance of fractures"],
          ["", "A weaker immune system"],
          ["", "Slowed growth and development in kids and teens"],
          ["", "Hormonal disruption, missed periods and fertility trouble, plus a higher chance of miscarriage in the first trimester"],
          ["", "More complications from surgery"],
          ["", "A higher overall risk of early death"],
        ]} />
        <P>
          Sometimes low weight points to an underlying cause like thyroid disease, celiac disease, digestive disorders, cancer or an
          eating disorder. If it’s unexplained, see a doctor.
        </P>
        <H3>When Is a BMI Considered Anorexic?</H3>
        <P>
          No BMI number diagnoses anorexia nervosa. It’s a psychiatric diagnosis based on restricting food, intense fear of gaining
          weight, and distorted body image, and doctors use BMI as one piece of the picture to judge severity. Someone can have
          anorexia at a “normal” or even higher BMI (this is called atypical anorexia) and be just as sick. If you or someone you
          know is skipping meals, afraid of food, or exercising compulsively, that matters more than any number. The National
          Alliance for Eating Disorders runs a helpline if you need to talk to someone.
        </P>
        <H3>What About a BMI of 14.6 When You Feel “Huge”?</H3>
        <P>
          A BMI of 14.6 is severely underweight by every standard, and it’s a medical concern in itself. Feeling large at that
          weight is a recognized symptom of body image distortion, which happens in eating disorders and body dysmorphic disorder.
          It isn’t a reflection of what you actually look like. The mirror can’t be trusted when this is going on. Please talk to a
          doctor or a mental health professional about it. This is treatable, and the sooner you get help the better.
        </P>
      </Card>

      <Card title="How to Lower Your BMI Safely">
        <H3>How Can I Lower My BMI Safely and Effectively?</H3>
        <P>
          Only do this if your BMI is in the overweight or obese range, or a doctor has told you to. Safe loss looks boring, and
          that’s the point:
        </P>
        <List items={[
          ["", "Aim for about 0.5 to 1 kg (1 to 2 lb) a week. Losing 5 to 10 percent of your starting weight already improves blood pressure, blood sugar and cholesterol."],
          ["", "Make a modest calorie deficit, not a crash diet. Cutting 300 to 500 calories a day is sustainable for most people."],
          ["", "Eat enough protein (roughly 0.7 to 1 gram per pound of your goal body weight is a common target) so you lose fat instead of muscle."],
          ["", "Lift weights two or three times a week, plus regular walking. Aim for at least 150 minutes of moderate activity weekly."],
          ["", "Sleep 7 or more hours. Short sleep raises hunger hormones and cravings."],
          ["", "Cut back on liquid calories like soda, juice and sweet coffee drinks. It’s often the easiest win."],
          ["", "Ask about medical options. Prescription medications such as semaglutide and tirzepatide, and in some cases surgery, are approved for people with a BMI of 30 or more, or 27 or more with a related condition like type 2 diabetes. They’re serious treatments with side effects, so they need a doctor’s supervision."],
        ]} />
        <H3>How Do I Reduce My BMI?</H3>
        <P>
          It’s the same answer as above. Since BMI is just weight divided by height squared, only two things can change it: your
          weight or your height. For adults, only weight is on the table. For growing kids, getting taller can lower BMI without
          losing a pound, which is why kids are usually told to grow into their weight rather than lose it.
        </P>
        <H3>How Do You Lower Your BMI Without Losing Weight?</H3>
        <P>
          You can’t, technically. The number won’t move unless your weight does. What you can do is improve your body composition:
          build muscle, lose some fat, and end up with the same scale weight but a smaller waist, a better waist-to-height ratio and
          better health markers. This is called body recomposition. It’s slower than regular fat loss, but it works well for
          beginners to strength training. If your goal is health rather than a number, this is often the smarter approach.
        </P>
        <H3>At What BMI Should You Lose Weight?</H3>
        <P>General guidance:</P>
        <List items={[
          ["Under 25:", "usually no need to lose weight. If you’re in the normal range and trying to drop weight, ask yourself why."],
          ["25 to 29.9:", "worth considering if you also have a large waist, high blood pressure, high blood sugar, abnormal cholesterol, sleep apnea or a family history of heart disease or diabetes. If you’re fit and your labs are fine, it’s less urgent."],
          ["30 and up:", "doctors generally recommend weight loss, since the risks climb."],
          ["For Asian populations:", "the threshold is lower, so start paying attention at around 23."],
        ]} />
      </Card>

      <Card title="BMI and How You Look">
        <H3>What BMI Is Considered the Most Attractive?</H3>
        <P>
          There’s no honest single answer. Attractiveness studies have produced numbers, and some Western research on women has
          landed in the high teens to low 20s, but results swing a lot by culture, era, who’s being asked, and whether participants
          see faces, bodies or photos. Waist-to-hip ratio and overall proportions tend to matter more than BMI in those studies.
          Beauty standards also change. What was considered attractive 60 years ago isn’t what’s popular now. Chasing a “most
          attractive BMI” isn’t a good plan, and the low end of the chart comes with real health risks.
        </P>
        <H3>What BMI Do Men Find Most Attractive in Women?</H3>
        <P>
          Some older studies pointed to the 18 to 20 range, but personal preference is all over the map. Many men prefer higher,
          many don’t care, and results change by culture and age group. Plenty of people find fitness, confidence and health
          attractive more than any number.
        </P>
        <H3>At What Point Does BMI Negatively Affect Your Appearance?</H3>
        <P>
          It’s different for everyone. Very low BMI can mean sunken cheeks, thin hair, dull skin and visible bones. Very high BMI
          can bring extra strain on joints, posture and skin. In the middle of the chart, most of what people see depends on muscle,
          posture, fat distribution, height and clothing fit, not BMI.
        </P>
        <H3>Is It Possible to Look Fat With a BMI of 21.5?</H3>
        <P>
          Yes, and it’s more common than people think. Someone at 21.5 with little muscle and more belly fat can look softer than a
          person at BMI 25 who lifts weights. This is sometimes called “normal weight obesity” or “skinny fat.” A higher body fat
          percentage, lower muscle mass, poor posture, bloating and a wider frame all play in. Check your waist-to-height ratio. If
          it’s over 0.5, strength training and a bit more protein will change your look more than dieting down will.
        </P>
      </Card>

      <Card title="Do You Need to Track BMI?">
        <P>
          It’s useful to check it now and then, but you don’t need to obsess over it. Checking every month or two is plenty. Daily
          weigh-ins mostly track water and salt. If you feel yourself getting anxious around the number, or you’ve had a history of
          disordered eating, take a break and track other things instead, like energy, strength and how your clothes fit.
        </P>
      </Card>

      <Card title="What Supplements Help You Stay Healthy?">
        <P>None of them replace food, sleep and exercise. The ones with the best evidence are situational:</P>
        <List items={[
          ["Vitamin D", "if your blood level is low, which is common in people with limited sun exposure."],
          ["Vitamin B12", "if you eat a vegan diet or are over 50."],
          ["Iron", "only if blood work shows you’re low, since too much is harmful."],
          ["Folate", "before and during early pregnancy."],
          ["Omega-3", "if you rarely eat fish."],
        ]} />
        <P>
          Get blood work first instead of guessing. Supplements aren’t approved by the FDA before they hit shelves, so look for
          third-party testing seals like USP or NSF.
        </P>
      </Card>

      <Card title="BMI for Children and Teens (Ages 2 to 20)">
        <P>
          Kids’ BMI can’t be read like an adult’s. A healthy BMI for a 6-year-old is very different from a healthy BMI for a
          16-year-old, and boys and girls grow differently. The CDC compares your child’s BMI with other kids of the same age and
          sex, then gives a percentile.
        </P>
        <DataTable headers={CHILD_HEADERS} rows={CHILD_ROWS} />
        <P>
          You’ll see older sources that call the 85th to 95th range “at risk of overweight” and the 95th or higher “overweight.” The
          CDC updated its wording, and the percentile cut-offs are the same.
        </P>
        <P>
          A child at the 70th percentile has a BMI higher than 70 percent of kids their age and sex, which is perfectly healthy. A
          percentile isn’t a diagnosis. Kids move across percentiles during growth spurts and puberty, so pediatricians look at the
          trend. Never put a child on a restrictive diet based on a single reading.
        </P>
        <P>
          BMI is also a better sign of excess body fat for kids at the high end than the middle. Among the overweight group, the BMI
          could be fat or could be lean mass. Among thin kids, it may come down to lean mass too. For about 90 to 95 percent of
          children, though, BMI lines up reasonably with body fat, which is why pediatricians still use it.
        </P>
      </Card>

      <Card title="How the BMI Calculator Works">
        <P>
          Pick your unit system first. Metric users enter kilograms and centimeters, and US users enter pounds, feet and inches.
          Choose adult or child. For kids and teens, add age and sex. Hit calculate, and you’ll see your BMI, category, healthy
          weight range, BMI Prime and Ponderal Index right away. It runs in your browser on a phone, tablet or computer.
        </P>
        <H3>What Does the Healthy Weight Range Mean?</H3>
        <P>
          It’s the span of weights that would put you between a BMI of 18.5 and 24.9 at your height. For someone 1.75 m (5'9")
          tall, that’s roughly 56.7 to 76.3 kg (125 to 168 lb). The range is wide on purpose, because frame size, muscle and bone
          density differ a lot between people who are the same height.
        </P>
      </Card>

      <Card title="BMI Prime Explained">
        <P>
          BMI Prime is your BMI divided by 25, the top of the normal range. It’s a ratio, so it has no units. Under 0.74 means
          underweight. From 0.74 to 1 is normal. Above 1 is overweight, and above 1.2 starts into obesity.
        </P>
        <DataTable headers={PRIME_HEADERS} rows={PRIME_ROWS} />
        <P>
          Its best feature is that it’s easy to read. A BMI Prime of 1.2 means you’re 20 percent above the top of the normal range.
          A BMI Prime of 0.92 means you’re about 8 percent below it. It also lets you compare groups that use different cut-offs. If
          a population’s upper limit is 23 instead of 25, you just swap the denominator.
        </P>
      </Card>

      <Card title="Ponderal Index Explained">
        <P>
          The Ponderal Index (also called the Rohrer index) is weight divided by height cubed, so kg/m³ in metric. BMI uses height
          squared, which is a shortcut. Bodies are three-dimensional, so cubing makes more sense for very tall and very short
          people. Standard BMI tends to flag tall people as heavier than they are and short people as leaner.
        </P>
        <P>
          For the 160-lb, 5'10" example, the PI comes to 12.9 kg/m³. In US units, the formula is height in inches divided by the
          cube root of weight in pounds, which gives about 12.9 as well (70 ÷ 5.43). For adults, values around 11 to 14 are
          generally considered typical, but there’s no universal clinical standard like there is for BMI, so treat it as a side
          detail. It’s also widely used for newborns, where it helps flag babies who are lean for their length.
        </P>
      </Card>

      <Card title="When You’d Actually Use a BMI Calculator">
        <List items={[
          ["Starting a fitness or weight-loss plan.", "You get a baseline and can set a realistic target."],
          ["Doctor visits, insurance and employer forms.", "Knowing your BMI ahead of time avoids surprises."],
          ["Checking a child’s growth between visits.", "The percentile view helps you see if growth is on track."],
          ["Planning a pregnancy.", "Your pre-pregnancy BMI influences risk and the recommended weight gain."],
          ["Before surgery or medical procedures.", "Some surgeries and medications have BMI thresholds."],
          ["Watching an older relative.", "An unexplained drop toward the underweight range is an early warning sign."],
          ["Medication eligibility.", "Weight-loss prescriptions use BMI cut-offs, so you can see where you stand before the appointment."],
        ]} />
      </Card>

      <Card title="Limits of BMI by Group">
        <List items={[
          ["Adults in general.", "BMI measures excess weight, not excess fat."],
          ["Older adults.", "They tend to have more body fat than younger adults at the same BMI, since muscle fades with age. A normal BMI can hide low muscle mass."],
          ["Women.", "Women usually carry more body fat than men at the same BMI."],
          ["Athletes and very muscular people.", "BMI will overstate their fat."],
          ["Pregnant women.", "BMI isn’t valid during pregnancy."],
          ["Short or very tall people.", "BMI can drift off, which is where the Ponderal Index or Smart BMI sometimes does better."],
          ["People of Asian descent.", "Risk starts at lower BMI."],
          ["Kids and teens.", "Height, maturation and growth all shift BMI, so age-and-sex percentiles are used."],
        ]} />
      </Card>

      <Card title="Can You Trust This BMI Calculator?">
        <P>
          The calculation uses the standard published formulas, with WHO categories for adults and CDC percentiles for kids, the
          same references doctors use. The result is pure math, so the same measurements always give the same number.
        </P>
        <P>
          The BMI calculator on Tolz is free, with no hidden charges or paid tier, and you can run it as many times as you like for
          yourself, family members or clients. Height and weight are personal, so only enter what you’re comfortable sharing. The
          results are for general information and education. They don’t replace advice from a doctor, dietitian or pediatrician.
        </P>
      </Card>

      <Card title="Practical Tips for Reading Your Result">
        <P>
          Write down your BMI with the date, then check again every four to eight weeks. Pair the number with a waist measurement
          before you draw conclusions, particularly if you’re in the overweight range. If your result is below 18.5 and you didn’t
          mean to lose weight, or above 30, bring it up with a doctor and ask about blood pressure, blood sugar and cholesterol
          checks. A number is a prompt for a conversation, not a verdict.
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
