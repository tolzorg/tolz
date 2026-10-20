import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is my daily fat intake calculated?",
    a: "First your daily Calories: BMR (Mifflin St Jeor, or Katch-McArdle if you know your body fat) × your activity level, then 500 or 1,000 Calories less or more a day to lose or gain 1 or 2 lb (0.5 or 1 kg) a week. Fat is then 20% to 35% of those Calories, saturated fat under 10% (under 7% to help reduce heart disease), at about 8.8 Calories per gram.",
  },
  {
    q: "Why 20% to 35%?",
    a: "That is the range of total daily Calories from fat recommended for adults (19 and over). Children need relatively more: 30% to 40% at ages 2-3 and 25% to 35% at ages 4-18 (see the table above).",
  },
  {
    q: "Why limit saturated fat to 10% or 7%?",
    a: "Saturated fat raises levels of \"bad\" LDL cholesterol, which can increase the risk of cardiovascular disease and type 2 diabetes. Keeping it under 10% of daily Calories is the general guideline, and under 7% has been shown to reduce the risk of heart disease.",
  },
  {
    q: "Which fats are healthiest?",
    a: "Monounsaturated and polyunsaturated fats, such as those in olive oil, nuts, seeds and fish, can help lower LDL cholesterol, and omega-3 fatty acids (rich in certain fish) lower the risk of coronary artery disease. Trans fats, from partially hydrogenated oils, are the worst and best avoided.",
  },
  {
    q: "Can I enter metric units?",
    a: "Yes. Choose centimeters, meters or feet and inches for height, and kilograms, pounds or stones for weight, from the unit menus next to each box. With kilograms, the goals are shown as 0.5 and 1 kg a week.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const BY_AGE = [["2 - 3", "30% to 40% of Total Calories"], ["4 - 18", "25% to 35% of Total Calories"], ["19+", "20% to 35% of Total Calories"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 10px", paddingLeft: 20 };
const cardStyle = { padding: "20px 20px" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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

export default function FatIntakeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Different Types of Fat</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fat, along with carbohydrates and proteins, is one of the three macronutrients that provide the energy the body's metabolism needs,
          and it comes from many foods. There are numerous types of dietary fat, including saturated fat, trans fat, monounsaturated fat,
          polyunsaturated fat and omega-3 fatty acids. Dietary fat is essential to proper body function, but too much leads to weight gain,
          and excess weight is linked to poor health. See the {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} for
          more about excess body fat.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Unhealthy Dietary Fat</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>Saturated fat</h3>
        <p style={pStyle}>
          Some types of dietary fat are more harmful than others. Saturated fat is one of the more harmful types and is found mostly in foods
          from animals: red meat, poultry and dairy products. It is also found in various nuts, oils and seeds. Its effect on disease risk is
          somewhat controversial, but saturated fat is largely considered harmful. Sources such as the Mayo Clinic and the American Heart
          Association, among many others, recommend a diet low in saturated fat, since it raises levels of "bad" low-density lipoprotein
          (LDL) cholesterol and can increase the risk of cardiovascular disease and type 2 diabetes.
        </p>
        <h3 style={h3Style}>Trans fat</h3>
        <p style={pStyle}>
          Trans fat occurs naturally in small amounts in some foods, but most of the trans fat people eat comes from a food processing method
          called partial hydrogenation. Highly processed foods, such as fast food, tend to be high in trans fats, and eating less of them is
          generally good for your health.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Trans fats are commonly regarded as the "worst" type of dietary fat: they are not essential and have no known health benefits. They
          raise the risk of coronary artery disease by increasing "bad" LDL cholesterol while lowering "good" high-density lipoprotein (HDL)
          cholesterol, and can also increase the risk of obesity and type 2 diabetes. By law, a serving with less than 0.5 grams of trans fat
          can be labeled as having 0 grams, so to avoid trans fat from processed foods completely, check that foods labeled 0 grams have no
          ingredient described as "partially hydrogenated".
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Healthier Dietary Fat</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Monounsaturated and polyunsaturated fats are two types of unsaturated fat found in a variety of foods and oils, polyunsaturated fat
          more often in plant-based foods and oils. Studies show that both, in small amounts, can help lower LDL cholesterol and may raise HDL
          cholesterol. Omega-3 fatty acids, a type of polyunsaturated fat rich in certain fish, have also been found to lower the risk of
          coronary artery disease.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Daily Fat Intake</h2>
        <p style={{ ...pStyle, marginBottom: 4 }}>
          There is no golden rule for daily fat intake yet. Generally, some fat, especially unsaturated fat, is good for the body, and children
          in particular need some fat to be healthy: once they stop breastfeeding, whole milk is generally recommended over low-fat or fat-free
          milk. However, any type of fat, healthier fats included, can be harmful in excess. Some guidelines on how much and which fat to eat:
        </p>
        <ul style={listStyle}>
          <li>Eat less than 10% of your daily Calories as saturated fat. Keeping it under 7% has been shown to reduce the risk of heart disease.</li>
          <li>Replace saturated fats with unsaturated fats where possible.</li>
          <li>Keep trans fats to a minimum.</li>
          <li>Eat less than 300 mg of dietary cholesterol a day.</li>
        </ul>
        <h3 style={h3Style}>Fat intake by age</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" }}>
            <thead><tr><th style={{ textAlign: "left" }}>Age</th><th style={{ textAlign: "left" }}>Suggested fat intake limit</th></tr></thead>
            <tbody>{BY_AGE.map(([age, limit]) => <tr key={age}><td>{age}</td><td>{limit}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, margin: "10px 0 0" }}>
          See also the {link("/calculators/health/macro-calculator", "Macro Calculator")},{" "}
          {link("/calculators/health/carbohydrate-calculator", "Carbohydrate Calculator")} and{" "}
          {link("/calculators/health/protein-calculator", "Protein Calculator")}.
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
