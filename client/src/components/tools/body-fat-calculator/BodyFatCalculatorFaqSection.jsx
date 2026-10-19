import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the calculator estimate body fat?",
    a: "It uses the U.S. Navy method, which estimates body fat percentage from your height and your neck and waist circumference (plus hips for women). It also shows a second estimate from your BMI and age, the BMI method.",
  },
  {
    q: "Can I calculate body fat without measuring my neck and waist?",
    a: "Yes. Choose \"Without measurements\" above the form: body fat is then estimated with the BMI method (the Deurenberg formula) from your height, weight, age and gender, and all other results use that estimate. It needs no tape measure but is less personal, because BMI can't tell muscle from fat, so very muscular people get an estimate that is too high.",
  },
  {
    q: "How do I measure my neck, waist and hips?",
    a: "Use a flexible tape measure. Neck: just below the larynx (Adam's apple), with the tape sloping slightly down at the front. Waist: men at navel level, women at the narrowest point; don't pull your stomach in. Hips (women only): around the widest part.",
  },
  {
    q: "What is a healthy body fat percentage?",
    a: "The American Council on Exercise classes 14-17% as fitness and 18-24% as average for men, and 21-24% and 25-31% for women. Essential fat, the minimum needed for health, is about 2-5% for men and 10-13% for women; 25% and above for men and 32% and above for women is classed as obese.",
  },
  {
    q: "What is the ideal body fat for my age?",
    a: "The calculator shows the Jackson & Pollock ideal for ages 20 to 55, interpolating between the listed ages. It rises with age, from 8.5% at 20 to 20.9% at 55 for men and from 17.7% to 26.3% for women.",
  },
  {
    q: "How accurate is the result?",
    a: "Both methods are estimates built on assumptions that fit most people, so expect an error of a few percentage points. Bioelectrical impedance analysis, DEXA or hydrostatic (underwater) weighing give more precise measurements.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const ACE = [
  ["Essential fat", "10-13%", "2-5%"],
  ["Athletes", "14-20%", "6-13%"],
  ["Fitness", "21-24%", "14-17%"],
  ["Average", "25-31%", "18-24%"],
  ["Obese", "32+%", "25+%"],
];
const JACKSON_POLLOCK = [
  ["20", "17.7%", "8.5%"], ["25", "18.4%", "10.5%"], ["30", "19.3%", "12.7%"], ["35", "21.5%", "13.7%"],
  ["40", "22.2%", "15.3%"], ["45", "22.9%", "16.4%"], ["50", "25.2%", "18.9%"], ["55", "26.3%", "20.9%"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 20, listStyle: "disc" };
const liStyle = { marginBottom: 6 };
const cardStyle = { padding: "20px 20px" };
const formula = { ...pStyle, textAlign: "center", fontWeight: 600, marginBottom: 6, overflowWrap: "anywhere" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", margin: "0 auto", minWidth: 280 }}>
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

export default function BodyFatCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this body fat calculator estimates your body fat percentage with the U.S.
          Navy method from a few tape-measure readings, and shows your fat and lean mass, your body fat category, the ideal body fat for your
          age, and a second estimate from your BMI. No tape measure? Choose "Without measurements" to estimate body fat from your BMI, age and
          gender alone. Pick the unit you prefer next to each box.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To check your BMI on its own, try the {link("/calculators/health/bmi-calculator", "BMI Calculator")}; for daily calories and macros, see the{" "}
          {link("/calculators/health/calorie-tracker", "Calorie Tracker & Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Body Fat Reference Tables</h2>
        <h3 style={h3Style}>The American Council on Exercise Body Fat Categorization</h3>
        <Table headers={["Description", "Women", "Men"]} rows={ACE} />
        <h3 style={h3Style}>Jackson & Pollock Ideal Body Fat Percentages</h3>
        <Table headers={["Age", "Women", "Men"]} rows={JACKSON_POLLOCK} />
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Body Fat, Overweight, and Obesity</h2>
        <p style={pStyle}>
          The scientific name for body fat is adipose tissue. Its main job is to store lipids that the body turns into energy, but it also
          releases important hormones and gives the body cushioning and insulation.
        </p>
        <p style={pStyle}>
          Body fat is made up of essential fat and storage fat. Essential fat is a base level found throughout the body that is needed for life
          and reproduction: typically about 2-5% in men and 10-13% in women. A healthy overall range is usually given as 8-19% for men and
          21-33% for women. Too much body fat harms health, but too little does as well, so a body fat percentage at or below the essential
          range is something to discuss with a doctor.
        </p>
        <p style={pStyle}>
          Storage fat builds up in adipose tissue, either as subcutaneous fat under the skin or as visceral fat inside the abdomen between the
          organs, and it is what people usually mean by body fat. Some storage fat is healthy; too much can seriously affect health.
        </p>
        <p style={pStyle}>
          Excess body fat leads to being overweight and, if nothing is done, to obesity. Being overweight does not always mean having too much
          fat, though: body weight also includes muscle, bone and water, so very muscular people are often classed as overweight.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          How quickly fat builds up differs between people and depends on genetics as well as habits such as too little exercise and overeating.
          Abdominal fat can be particularly hard for some people to lose, but diet and exercise have been shown to reduce stored fat. Men and
          women store fat differently, and this changes with age: after about 40 (or after menopause for some women), lower sex hormone levels
          can lead to more fat around the stomach in men and around the hips and thighs in women.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Potential Complications of Excess Body Fat</h2>
        <p style={pStyle}>
          The World Health Organization counts obesity among the leading preventable causes of death worldwide, with an estimated 111,909 to
          365,000 deaths a year in the U.S., where the Centers for Disease Control and Prevention class 36.5% of adults as obese.
        </p>
        <p style={pStyle}>
          Obesity is linked with a lower quality of life, poorer mental health and obstructive sleep apnea, and with several leading causes of
          death, including cardiovascular disease, stroke, some cancers and diabetes, all of which can shorten life expectancy.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fat produces essential hormones, and studies show that excess fat, especially around the abdomen, disturbs their balance. Visceral fat
          also releases cytokines, signalling proteins that can raise the risk of heart disease, and is linked directly to higher LDL ("bad")
          cholesterol, lower HDL ("good") cholesterol and insulin resistance. High LDL can clog arteries and lead to heart attacks, while insulin
          resistance, where cells stop responding properly to insulin, raises blood sugar and can lead to type 2 diabetes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Measuring Body Fat Percentage</h2>
        <h3 style={h3Style}>U.S. Navy Method</h3>
        <p style={pStyle}>
          There are many ways to measure body fat. This calculator uses equations developed at the Naval Health Research Center by Hodgdon and
          Beckett in 1984. Take the measurements like this:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Waist: measure around the waist at navel level for men, and at the narrowest point for women. Don't pull the stomach in.</li>
          <li style={liStyle}>Neck: measure just below the larynx, with the tape sloping down towards the front. Don't flare the neck out.</li>
          <li style={liStyle}><b>Women only:</b> hips, measured around the widest part.</li>
        </ul>
        <p style={pStyle}>
          The measurements then go into these formulas, one in U.S. customary units (inches) and one in centimeters. The calculator always uses
          the centimeter version, converting inches first:
        </p>
        <h3 style={h3Style}>Body fat percentage (BFP) for men</h3>
        <p style={formula}>USC: BFP = 86.010 × log10(abdomen − neck) − 70.041 × log10(height) + 36.76</p>
        <p style={formula}>SI: BFP = 495 / (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450</p>
        <h3 style={h3Style}>Body fat percentage (BFP) for women</h3>
        <p style={formula}>USC: BFP = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387</p>
        <p style={formula}>SI: BFP = 495 / (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450</p>
        <p style={pStyle}>
          These results are estimates, built on assumptions meant to fit as many people as possible. Bioelectrical impedance analysis or
          hydrostatic density testing give more accurate measurements.
        </p>
        <p style={formula}>Fat mass (FM) = body fat × weight</p>
        <p style={formula}>Lean mass (LM) = weight − fat mass</p>

        <h3 style={h3Style}>BMI Method</h3>
        <p style={pStyle}>
          Body fat can also be estimated from BMI, which comes from your height and weight (see the{" "}
          {link("/calculators/health/bmi-calculator", "BMI Calculator")} for how BMI is calculated and its limitations). Given BMI:
        </p>
        <p style={formula}>Adult men: BFP = 1.20 × BMI + 0.23 × age − 16.2</p>
        <p style={formula}>Adult women: BFP = 1.20 × BMI + 0.23 × age − 5.4</p>
        <p style={formula}>Boys: BFP = 1.51 × BMI − 0.70 × age − 2.2</p>
        <p style={{ ...formula, marginBottom: 0 }}>Girls: BFP = 1.51 × BMI − 0.70 × age + 1.4</p>
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
