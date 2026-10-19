import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is BMI calculated?",
    a: "BMI is your weight divided by your height squared. In metric units: BMI = kg ÷ m². In US units: BMI = 703 × pounds ÷ inches². For example, 5 ft 10 in (70 inches) and 160 lbs gives 703 × 160 ÷ 70² = 23.0.",
  },
  {
    q: "What is a healthy BMI?",
    a: "For adults (over 20) the World Health Organization classes 18.5 to 25 kg/m² as normal weight. Below 18.5 is thinness (underweight), 25 to 30 is overweight and above 30 is obesity.",
  },
  {
    q: "Why does the result show a percentile for children?",
    a: "Children's body fat changes as they grow and differs between boys and girls, so for ages 2 to 20 BMI is compared with children of the same age and sex using the CDC growth charts. The percentile says what share of those children have a lower BMI: 5th to 85th is a healthy weight, 85th to 95th is at risk of overweight, and above the 95th is overweight.",
  },
  {
    q: "Why can a child's percentile be negative or above 100%?",
    a: "The CDC charts end at the 3rd and 97th percentile curves. For a weight or height beyond them the calculator continues the nearest chart line, as calculator.net does, so very small or very large values can give a figure below 0% or above 100%. For a BMI at or above the 95th percentile it uses the CDC's 2022 extended BMI-for-age method, which stays below 100%.",
  },
  {
    q: "What is BMI Prime?",
    a: "BMI Prime is your BMI divided by 25, the upper limit of normal weight. A value below 0.74 is underweight, 0.74 to 1 is normal, above 1 is overweight and above 1.2 is obese, so 1.1 means 10% above the upper limit.",
  },
  {
    q: "What is the Ponderal Index?",
    a: "The Ponderal Index divides weight by height cubed (kg/m³) instead of squared. It is less affected by height, so it can be more reliable than BMI for very tall or very short people.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const ADULT_TABLE = [
  ["Severe Thinness", "< 16", "< 0.64"],
  ["Moderate Thinness", "16 - 17", "0.64 - 0.68"],
  ["Mild Thinness", "17 - 18.5", "0.68 - 0.74"],
  ["Normal", "18.5 - 25", "0.74 - 1"],
  ["Overweight", "25 - 30", "1 - 1.2"],
  ["Obese Class I", "30 - 35", "1.2 - 1.4"],
  ["Obese Class II", "35 - 40", "1.4 - 1.6"],
  ["Obese Class III", "> 40", "> 1.6"],
];
const CHILD_TABLE = [
  ["Underweight", "< 5%"],
  ["Healthy weight", "5% - 85%"],
  ["At risk of overweight", "85% - 95%"],
  ["Overweight", "> 95%"],
];
const OVERWEIGHT_RISKS = [
  "High blood pressure",
  "Higher LDL (\"bad\") cholesterol, lower HDL (\"good\") cholesterol and high triglycerides",
  "Type II diabetes",
  "Coronary heart disease",
  "Stroke",
  "Gallbladder disease",
  "Osteoarthritis, the breakdown of joint cartilage",
  "Sleep apnea and breathing problems",
  "Certain cancers (endometrial, breast, colon, kidney, gallbladder, liver)",
  "Lower quality of life",
  "Mental health conditions such as clinical depression and anxiety",
  "Body pain and difficulty with some physical activities",
  "A generally higher risk of death than people with a healthy BMI",
];
const UNDERWEIGHT_RISKS = [
  "Malnutrition, vitamin deficiencies and anemia",
  "Osteoporosis, which weakens bones and makes fractures more likely",
  "Weaker immune function",
  "Growth and development problems, especially in children and teenagers",
  "Possible reproductive problems in women from hormonal imbalance, including irregular periods and a higher chance of miscarriage in the first trimester",
  "More complications after surgery",
  "A generally higher risk of death than people with a healthy BMI",
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 4 };
const cardStyle = { padding: "20px 20px" };
const formula = { ...pStyle, textAlign: "center", fontWeight: 600 };
const tableWrap = { overflowX: "auto", margin: "4px 0 12px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", margin: "0 auto", minWidth: 260 };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function InfoTable({ headers, rows }) {
  return (
    <div style={tableWrap}>
      <table className="data-table data-table-head" style={tableStyle}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>{r.map((c, i) => <td key={i} style={{ textAlign: i ? "center" : "left" }}>{c}</td>)}</tr>
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this Body Mass Index (BMI) calculator works out your BMI and the
          weight status that goes with it, taking age into account. Use the "Metric Units" tab for centimeters and kilograms, or the
          "Other Units" tab to convert other units first. It also gives your BMI Prime and Ponderal Index, both explained below.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To turn your weight goal into a daily plan, try the {link("/calculators/health/calorie-tracker", "Calorie Tracker & Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is BMI?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          BMI measures how lean or heavy a person is from their height and weight, as a rough stand-in for body tissue mass. It is widely used
          as a general sign of whether someone's weight is healthy for their height: the value places a person in the underweight, normal,
          overweight or obese range. The ranges vary by region and age and are sometimes split further, for example into severe thinness or
          different classes of obesity. Being overweight or underweight can seriously affect health, so although BMI is an imperfect measure,
          it is a useful first check of whether further tests or changes are needed. The tables below show the categories this calculator uses.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BMI Table for Adults</h2>
        <p style={pStyle}>
          These are the World Health Organization (WHO) weight categories by BMI for adults. They apply to both men and women aged 20 or older.
        </p>
        <InfoTable headers={["Classification", "BMI range - kg/m²"]} rows={ADULT_TABLE.map(([c, b]) => [c, b])} />
        <h2 style={{ ...h2Style, marginTop: 8 }}>BMI Table for Children and Teens, Age 2-20</h2>
        <p style={pStyle}>
          For children and teens from 2 to 20, the Centers for Disease Control and Prevention (CDC) categorize BMI by percentile: how the BMI
          compares with children of the same age and sex.
        </p>
        <InfoTable headers={["Category", "Percentile Range"]} rows={CHILD_TABLE} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator reads these percentiles from the CDC BMI-for-age, weight-for-age and stature-for-age growth charts for boys and girls.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Risks of Being Overweight</h2>
        <p style={pStyle}>According to the CDC, being overweight raises the risk of many serious diseases and health conditions:</p>
        <ul style={ulStyle}>{OVERWEIGHT_RISKS.map((r) => <li key={r} style={liStyle}>{r}</li>)}</ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Some of these outcomes can be fatal. As a general rule, aim to keep your BMI below 25 kg/m², and ask your doctor whether you need
          to change anything in your lifestyle.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Risks of Being Underweight</h2>
        <p style={pStyle}>Being underweight carries its own risks:</p>
        <ul style={ulStyle}>{UNDERWEIGHT_RISKS.map((r) => <li key={r} style={liStyle}>{r}</li>)}</ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Being underweight can also be a sign of an underlying condition, such as anorexia nervosa, which has risks of its own. See a doctor
          if you or someone you know is underweight, especially when there is no obvious reason.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Limitations of BMI</h2>
        <p style={pStyle}>
          BMI is useful but only an estimate: it cannot see body composition. Because body types and the mix of muscle, bone and fat vary so
          much, BMI should be read alongside other measurements rather than used on its own.
        </p>
        <h3 style={h3Style}>In adults</h3>
        <p style={pStyle}>
          BMI measures excess weight, not excess fat, and is affected by age, sex, ethnicity, muscle mass, body fat and activity level. An
          inactive older person of healthy weight may carry a lot of body fat without being heavy, while a younger, muscular person with the
          same BMI is healthy. Athletes, and bodybuilders especially, can be classed as overweight because muscle is heavier than fat, even
          when their weight is healthy for their build. In general, according to the CDC:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Older adults tend to have more body fat than younger adults with the same BMI.</li>
          <li style={liStyle}>Women tend to have more body fat than men with the same BMI.</li>
          <li style={liStyle}>Muscular people and highly trained athletes may have a higher BMI because of their muscle mass.</li>
        </ul>
        <h3 style={h3Style}>In children and teens</h3>
        <p style={pStyle}>
          The same limits apply, and height and sexual maturity also affect BMI and body fat in children. BMI points to excess fat more
          reliably in obese children than in overweight ones, whose higher BMI may come from either fat or fat-free mass (water, organs,
          muscle and everything else that is not fat). In thin children, differences in BMI can also come from fat-free mass.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Even so, BMI reflects body fat fairly well for 90-95% of people and works well together with other measures of healthy weight.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BMI Formula</h2>
        <p style={pStyle}>
          Here is how BMI is calculated in US customary units and in metric (SI) units, using a person 5 ft 10 in tall weighing 160 pounds:
        </p>
        <h3 style={h3Style}>US units</h3>
        <p style={formula}>BMI = 703 × mass (lbs) ÷ height² (in) = 703 × 160 ÷ 70² = 23.0</p>
        <h3 style={h3Style}>Metric (SI) units</h3>
        <p style={{ ...formula, marginBottom: 0 }}>BMI = mass (kg) ÷ height² (m) = 72.57 ÷ 1.778² = 23.0</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BMI Prime</h2>
        <p style={pStyle}>
          BMI Prime compares your BMI with the upper limit of normal weight set by bodies such as the WHO and the CDC. That limit can differ
          in some countries, for example in Asia, but is usually 25 kg/m²:
        </p>
        <p style={formula}>BMI Prime = BMI ÷ 25</p>
        <p style={pStyle}>
          As a ratio of two BMI values it has no unit. Below 0.74 is underweight, 0.74 to 1 is normal, above 1 is overweight and above 1.2 is
          obese:
        </p>
        <InfoTable headers={["Classification", "BMI", "BMI Prime"]} rows={ADULT_TABLE} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          BMI Prime shows at a glance how far a BMI is from the upper normal limit, and lets you compare groups of people whose limits differ.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Ponderal Index</h2>
        <p style={pStyle}>
          Like BMI, the Ponderal Index (PI) measures leanness from height and weight, but it cubes the height instead of squaring it. BMI
          works for large populations but is less reliable for individuals, and it tends to overstate or understate body fat for very tall
          or very short people. The PI has similar limits but is more reliable at those extremes. For the same 5 ft 10 in, 160-pound person:
        </p>
        <h3 style={h3Style}>US units</h3>
        <p style={formula}>PI = height (in) ÷ ∛mass (lbs) = 70 ÷ ∛160 = 12.9</p>
        <h3 style={h3Style}>Metric (SI) units</h3>
        <p style={{ ...formula, marginBottom: 0 }}>PI = mass (kg) ÷ height³ (m) = 72.57 ÷ 1.778³ = 12.9</p>
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
