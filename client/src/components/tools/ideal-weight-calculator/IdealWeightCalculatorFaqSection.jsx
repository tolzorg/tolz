import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is ideal body weight calculated?",
    a: "Each formula starts from a base weight for someone 5 feet tall and adds a fixed amount for every inch above that. For a 5'10\" man, the Devine formula gives 50 kg + 2.3 kg × 10 = 73 kg, about 161 lbs. The calculator shows four formulas side by side, plus the weight range for a healthy BMI.",
  },
  {
    q: "Which ideal weight formula is the most accurate?",
    a: "None is accurate for everyone, because they consider only height and gender. Devine (1974) is the most widely used; Robinson and Miller (both 1983) are modifications of it, and Hamwi (1964) is the oldest. The healthy BMI range is often the most useful guide.",
  },
  {
    q: "Why are no formulas shown for my height?",
    a: "The formulas add weight per inch over 5 feet, so they don't apply at 5 feet (152.4 cm) or shorter. For those heights the calculator shows the healthy weight range from BMI instead.",
  },
  {
    q: "How does it work for children?",
    a: "For ages 2 to 20 the healthy weight range comes from the CDC BMI-for-age charts: a BMI between the 5th and 85th percentile for the child's age and sex. The ideal weight formulas are designed for adults.",
  },
  {
    q: "Can I be healthy above or below my ideal weight?",
    a: "Yes. These formulas ignore body composition, so muscular athletes can come out \"overweight\". Treat the results as a general reference; healthy habits such as regular exercise, varied unprocessed food and enough sleep matter more than reaching a number.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const FRAMES = [
  ["Women, under 5'2\"", "less than 5.5\"", "5.5\" to 5.75\"", "over 5.75\""],
  ["Women, 5'2\" to 5'5\"", "less than 6\"", "6\" to 6.25\"", "over 6.25\""],
  ["Women, over 5'5\"", "less than 6.25\"", "6.25\" to 6.5\"", "over 6.5\""],
  ["Men, over 5'5\"", "5.5\" to 6.5\"", "6.5\" to 7.5\"", "over 7.5\""],
];
const FORMULAS = [
  ["G. J. Hamwi (1964)", "48.0 kg + 2.7 kg", "45.5 kg + 2.2 kg", "Invented for working out medicine doses."],
  ["B. J. Devine (1974)", "50.0 kg + 2.3 kg", "45.5 kg + 2.3 kg", "Also meant for medicine doses; over time it became the standard measure of IBW."],
  ["J. D. Robinson (1983)", "52 kg + 1.9 kg", "49 kg + 1.7 kg", "A modification of the Devine formula."],
  ["D. R. Miller (1983)", "56.2 kg + 1.41 kg", "53.1 kg + 1.36 kg", "A modification of the Devine formula."],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 420 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
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

export default function IdealWeightCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={pStyle}>
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this ideal weight calculator compares the Robinson, Miller, Devine and
          Hamwi formulas with the healthy weight range from BMI, for adults and for children aged 2 to 20. Enter your height in any unit and
          choose whether to see the weights in kilograms, pounds or stones.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Related: the {link("/calculators/health/bmi-calculator", "BMI Calculator")}, the{" "}
          {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} and the{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Should I Weigh?</h2>
        <p style={pStyle}>
          Most people have tried to lose weight at some point, often because of an "ideal" body shape promoted on social media, TV, films and
          magazines. Ideal body weight (IBW), however, was introduced to estimate medicine doses, and its formulas have nothing to do with how
          someone looks. The body's handling of some drugs has since been found to depend more on IBW than on total weight, and IBW is also used
          widely in sport, where many competitions group people by body weight.
        </p>
        <p style={pStyle}>
          IBW is not a perfect measure. It ignores how much of the body is fat or muscle, so very fit athletes can come out as overweight. Treat it
          as a rough reference rather than a target: you can be above or below your "IBW" and perfectly healthy.
        </p>
        <p style={pStyle}>
          How much a person should weigh is not an exact science and differs from one person to the next. No measure, whether IBW, body mass index
          (BMI) or anything else, can say for certain what is healthy. Habits such as regular exercise, a varied diet of unprocessed foods and
          enough sleep matter more than chasing a number from a general formula.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The main factors that affect ideal weight are below; others include health conditions, fat distribution and genetics.
        </p>
        <h3 style={h3Style}>Age</h3>
        <p style={pStyle}>
          Age should matter little after about 14-15 for girls and 16-17 for boys, when most people stop growing. By 70, men typically lose about
          1.5 inches of height and women about 2 inches. With age, lean muscle decreases and body fat builds up more easily; diet, exercise,
          stress management and sleep can slow this natural process.
        </p>
        <h3 style={h3Style}>Gender</h3>
        <p style={pStyle}>
          Women generally weigh less than men, even though they naturally carry a higher percentage of body fat, because men usually have more
          muscle (which is heavier than fat), denser bones and greater height.
        </p>
        <h3 style={h3Style}>Height</h3>
        <p style={pStyle}>
          Taller people carry more muscle and fat, so they weigh more. A man of the same height as a woman should weigh roughly 10-20% more.
        </p>
        <h3 style={h3Style}>Body Frame Size</h3>
        <p style={pStyle}>
          Frame size, usually described as small, medium or large boned, also matters. It is judged from wrist circumference relative to height:
        </p>
        <Table headers={["Height", "Small boned (wrist)", "Medium boned", "Large boned"]} rows={FRAMES} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A large-boned person naturally weighs more than a small-boned person of the same height, which affects measures such as IBW and BMI.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Formulas for Finding the Ideal Weight</h2>
        <p style={pStyle}>
          IBW formulas were developed mainly to help calculate medicine doses. They all take a base weight for a height of 5 feet and add a fixed
          amount for each inch above 5 feet. For example, a 5'10" man using the Devine formula adds 2.3 kg × 10 to 50 kg, giving 73 kg, or
          about 161 lbs. The numbers differ because each comes from different research; Devine is the most widely used.
        </p>
        <Table headers={["Formula", "Men (per inch over 5 ft)", "Women (per inch over 5 ft)", "Notes"]} rows={FORMULAS} />
        <h3 style={h3Style}>Healthy BMI Range</h3>
        <p style={pStyle}>
          The World Health Organization recommends a BMI of 18.5 to 25 for both men and women, which gives a healthy weight range for any height.
          BMI is widely used in medicine as a quick sign of possible health problems: in general, the higher the BMI, the higher the risk of
          obesity, diabetes, heart disease and more. Doctors use it to warn patients of potential problems, especially when it rises steadily, and
          it is the official measure for classifying levels of obesity.
        </p>
        <h3 style={h3Style}>Healthy BMI Range for Children</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The formulas above are for adults 18 and over. For children and teens aged 2 to 20, the Centers for Disease Control and Prevention
          (CDC) recommends a BMI between the 5th and 85th percentile for their age, which this calculator uses for the healthy range.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Limitations of the Ideal Weight Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every formula has limits. Because they are designed to fit as many people as possible, they cannot be precise for each individual. They
          consider only height and gender, not physical disabilities, people at the extremes of the range, activity level or body composition
          (the ratio of muscle to fat). Use the results as a general guide, not as a weight you must reach to be "ideal".
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
