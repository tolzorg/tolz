import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is my TDEE calculated?",
    a: "Your basal metabolic rate (BMR) is estimated with the Mifflin St Jeor equation from your age, gender, height and weight (or with Katch-McArdle if you know your body fat), then multiplied by an activity factor from 1.2 (sedentary) to 1.9 (extra active).",
  },
  {
    q: "How many Calories should I eat to lose or gain weight?",
    a: "About 250 Calories a day less than your TDEE to lose 0.5 lb (0.25 kg) a week, 500 less for 1 lb (0.5 kg) and 1,000 less for 2 lb (1 kg); add the same amounts to gain weight. Weight-loss goals below 1,500 Calories a day for men or 1,200 for women are not shown, since eating that little should be supervised by a doctor.",
  },
  {
    q: "Why don't I see weight-loss or weight-gain options?",
    a: "Weight-loss goals are shown only when your BMI is above 18.5 (the bottom of the healthy range), and weight-gain goals only when your BMI is below 35.",
  },
  {
    q: "What is the difference between BMR and TDEE?",
    a: "BMR is the energy your body uses at complete rest just to keep your vital organs working. TDEE adds the energy of everything you do: exercise, work, daily activity and digesting food. Choose \"Basal Metabolic Rate (BMR)\" as the activity to see your BMR alone.",
  },
  {
    q: "Can I see the results in kilojoules?",
    a: "Yes. Open + Settings and choose Kilojoules. One Calorie (kilocalorie) is 4.1868 kJ.",
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

export default function TdeeCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is TDEE?</h2>
        <p style={pStyle}>
          TDEE stands for total daily energy expenditure: the total energy a person uses in a day. It is hard to measure accurately and varies
          from day to day, so it is usually estimated from a person's basal metabolic rate (BMR), activity level and the thermic effect of food.
        </p>
        <h3 style={h3Style}>Basal metabolic rate</h3>
        <p style={pStyle}>
          BMR is the rate at which a person uses energy at rest, in a temperate environment, while the digestive system is inactive. In other
          words, it is the minimum energy needed just to keep the vital organs working. See the{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")}.
        </p>
        <h3 style={h3Style}>Activity level</h3>
        <p style={pStyle}>
          The activity level factor reflects how active a person is, including deliberate exercise and the activity of their job or everyday
          life. More specifically these are called the thermic effect of activity and non-exercise activity thermogenesis (energy spent on
          everything other than sleeping, eating or sports-like exercise).
        </p>
        <h3 style={h3Style}>Thermic effect of food</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The thermic effect of food, also called specific dynamic action, is the energy the body needs to process and use food. It is sometimes
          estimated as 10% of food energy intake, but it varies a lot with the type of food: protein, for example, has a far larger thermic
          effect than dietary fat, because it is harder to process.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is TDEE Calculated?</h2>
        <p style={pStyle}>
          TDEE is calculated from the factors above. The calculation usually starts with an estimate of BMR, using equations developed for the
          purpose from physical characteristics such as age, gender, height and weight.
        </p>
        <p style={pStyle}>
          Commonly used BMR equations include the Mifflin St Jeor equation, the Harris-Benedict equation and the Katch-McArdle formula. They are
          generally quite similar, but the Katch-McArdle formula, which accounts for the difference in metabolic activity between lean body mass
          and body fat, can be more accurate for lean people (find your body fat with the{" "}
          {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")}).
        </p>
        <p style={pStyle}>
          Once BMR is known, it is multiplied by an activity factor based on things like exercise and whether a person's job is sedentary or very
          active.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other factors such as the thermic effect of food can also be included, though they often are not, and they matter much less than BMR
          and activity level. See also the {link("/calculators/health/bmi-calculator", "BMI Calculator")} and the{" "}
          {link("/calculators/health/macro-calculator", "Macro Calculator")}.
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
