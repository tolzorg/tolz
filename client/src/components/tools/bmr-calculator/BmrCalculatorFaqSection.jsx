import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is BMR?",
    a: "Basal metabolic rate (BMR) is the energy your body uses at complete rest, in a comfortable temperature and after about 12 hours without food, just to keep vital organs working. For most people it is the largest part of the calories burned each day.",
  },
  {
    q: "How do I get my daily calorie needs from BMR?",
    a: "Multiply your BMR by an activity factor between 1.2 (little or no exercise) and 1.9 (very intense exercise daily or a physical job). The results table does this for six activity levels.",
  },
  {
    q: "Which formula should I use?",
    a: "Mifflin-St Jeor, the default, is considered the most accurate for most people. Revised Harris-Benedict is an older alternative. Katch-McArdle uses lean body mass, so it can be more accurate for lean people who know their body fat percentage (3% to 80%).",
  },
  {
    q: "Is BMR the same as RMR?",
    a: "They are often used interchangeably, but BMR is measured under strict, fully rested conditions, while resting metabolic rate (RMR, also called resting energy expenditure) is measured in a relaxed but less strictly controlled state, so it is usually slightly higher.",
  },
  {
    q: "How accurate is an online BMR calculator?",
    a: "Formulas give an estimate for an average person. Even after accounting for known factors, studies find about 26% of the variation in BMR between people is unexplained. For a precise value, a specialist can measure it with a calorimetry device.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
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
const formula = { ...pStyle, textAlign: "center", fontWeight: 600, marginBottom: 6 };
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

export default function BmrCalculatorFaqSection() {
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
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this BMR calculator estimates the calories your body burns at rest and
          your daily calorie needs at six activity levels, using the Mifflin-St Jeor, revised Harris-Benedict or Katch-McArdle formula. Pick the
          unit you prefer next to each box, and switch the results to kilojoules under Settings.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Related: the {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} (for the body fat % used by Katch-McArdle), the{" "}
          {link("/calculators/health/bmi-calculator", "BMI Calculator")} and the {link("/calculators/health/calorie-tracker", "Calorie Tracker & Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Basal Metabolic Rate?</h2>
        <p style={pStyle}>
          Basal metabolic rate (BMR) is the energy needed at rest, in a comfortable temperature, when the digestive system is inactive. Think of
          it as the fuel an idling car burns while parked: energy goes only to keeping vital organs running, including the heart, brain,
          kidneys, nervous system, intestines, liver, lungs, sex organs, muscles and skin. For most people about 70% of the calories burned each
          day go to this upkeep, about 20% to physical activity and about 10% to digesting food (thermogenesis).
        </p>
        <p style={pStyle}>
          Measuring BMR properly requires very strict conditions while awake: the sympathetic nervous system must be inactive, so the person has
          to be completely rested. BMR is usually the largest part of a person's daily calorie needs, which equal BMR multiplied by a factor of
          1.2 to 1.9 depending on activity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In practice BMR is estimated with equations based on statistical data. The Harris-Benedict equation was one of the first; it was
          revised in 1984 for accuracy and used until 1990, when the Mifflin-St Jeor equation was introduced and shown to be more accurate. The
          Katch-McArdle formula instead estimates resting daily energy expenditure (RDEE) from lean body mass, which the other two ignore.
          Mifflin-St Jeor is generally the most accurate, but Katch-McArdle can be better for lean people who know their body fat percentage.
          You can choose the formula under Settings.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>BMR Formulas</h2>
        <h3 style={h3Style}>Mifflin-St Jeor Equation</h3>
        <p style={formula}>Men: BMR = 10W + 6.25H - 5A + 5</p>
        <p style={formula}>Women: BMR = 10W + 6.25H - 5A - 161</p>
        <h3 style={h3Style}>Revised Harris-Benedict Equation</h3>
        <p style={formula}>Men: BMR = 13.397W + 4.799H - 5.677A + 88.362</p>
        <p style={formula}>Women: BMR = 9.247W + 3.098H - 4.330A + 447.593</p>
        <h3 style={h3Style}>Katch-McArdle Formula</h3>
        <p style={formula}>BMR = 370 + 21.6(1 - F)W</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>where W is body weight in kg, H is height in cm, A is age in years and F is body fat as a percentage.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Affects BMR?</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <b>Muscle mass:</b> aerobic exercise such as running or cycling does not change BMR, but anaerobic exercise such as weight lifting
            raises it indirectly by building muscle, which burns more energy at rest.
          </li>
          <li style={liStyle}><b>Genetics:</b> inherited traits influence BMR.</li>
          <li style={liStyle}>
            <b>Temperature:</b> cold raises BMR because the body works to keep warm, and too much heat also raises it as the body cools itself.
            BMR rises by about 7% for every 1.36°F increase in internal body temperature.
          </li>
          <li style={liStyle}>
            <b>Pregnancy:</b> supporting a growing baby raises BMR, which is why pregnant women tend to eat more. Menopause can raise or lower BMR
            depending on hormonal changes.
          </li>
          <li style={liStyle}><b>Supplements:</b> some supplements and drugs, caffeine being a common one, raise BMR, usually to help weight loss.</li>
        </ul>
        <h3 style={h3Style}>BMR Tests</h3>
        <p style={pStyle}>
          Online calculators with fixed formulas are not the most accurate way to find an individual's BMR. A certified specialist, or a
          calorimetry device of the kind found in many gyms, doctor's offices and weight-loss clinics, gives a better measurement.
        </p>
        <h3 style={h3Style}>Resting Metabolic Rate</h3>
        <p style={pStyle}>
          The terms are often used interchangeably, but resting metabolic rate (RMR), also called resting energy expenditure (REE), is the rate
          at which the body burns energy when relaxed but not fully inactive. BMR requires total physiological equilibrium, while RMR conditions
          can vary with the circumstances.
        </p>
        <h3 style={h3Style}>Modern Wisdom</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A 2005 meta-analysis* found that even after controlling for all the known factors, about 26% of the variation in metabolic rate
          between people remains unexplained. An average person eating an average diet will probably have the expected BMR, but some factors
          that determine it are still not understood.
          <br />
          <span style={{ fontSize: 12 }}>
            * Johnstone AM, Murison SD, Duncan JS, Rance KA, Speakman JR. Factors influencing variation in basal metabolic rate include fat-free
            mass, fat mass, age, and circulating thyroxine but not sex, circulating leptin, or triiodothyronine. Am J Clin Nutr 2005; 82: 941-948.
          </span>
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
