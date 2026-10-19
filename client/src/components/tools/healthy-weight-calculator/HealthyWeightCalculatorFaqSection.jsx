import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the healthy weight range calculated?",
    a: "It comes from BMI. A BMI between 18.5 and 25 counts as a healthy weight for adults, so the range is the weight at BMI 18.5 to the weight at BMI 25 for your height: weight = BMI × height² (kg and meters). For 5 ft 10 in that gives about 129 to 174 lbs.",
  },
  {
    q: "What do the other marks on the scale mean?",
    a: "They are the weights at BMI 16.5 (below it: severely underweight), 18.5 (underweight below, healthy above), 25 (overweight), 30 (obese class I), 35 (obese class II) and 40 (obese class III) for your height.",
  },
  {
    q: "Does the healthy weight range apply to children?",
    a: "No. These BMI categories are for adults aged 18 or older. Children and teens are assessed with BMI-for-age percentiles; see the BMI Calculator for that.",
  },
  {
    q: "Can I be healthy outside this range?",
    a: "Yes. BMI does not account for body composition, so muscular people can fall into \"overweight\" and still be healthy. The range is a guide for an average person; a doctor can give a more personal assessment.",
  },
  {
    q: "Can I get the results in kilograms?",
    a: "Yes. Choose centimeters or meters for your height and the weights are shown in kilograms; feet / inches or inches show pounds.",
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

export default function HealthyWeightCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a Healthy Weight?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The range of healthy body weights is based on BMI. For a given height, the calculator works out the weights that fall into each
          BMI category. An adult aged 18 or older with a BMI between 18.5 and 25 kg/m² is typically considered to have a healthy or normal
          weight. See the {link("/calculators/health/bmi-calculator", "BMI Calculator")} for more, but note that a "healthy body weight" is an
          estimate that ignores factors such as body composition. It works for an "average" person, so it is possible to be classed as
          overweight or underweight and still be healthy; telling the difference takes more than a general calculation, ideally with a
          medical professional.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Effects of Being Underweight, Overweight, and Obese</h2>
        <h3 style={h3Style}>Underweight (BMI &lt; 18.5)</h3>
        <p style={pStyle}>
          Being underweight can result from genetics, lack of food, metabolic issues, drug use or illness. It is linked with conditions such
          as hyperthyroidism, cancer and tuberculosis, and can point to an underlying disease. Studies have found mortality rates among
          underweight people comparable to the morbidly obese, although disease-related weight loss may account for part of this.
        </p>
        <p style={pStyle}>
          Being underweight can also mean low energy and stamina, osteoporosis and a weak immune system. People underweight because of a
          lack of good-quality food can become malnourished, affecting physical and mental development; severe malnutrition can lead to
          kwashiorkor and marasmus. In women, being underweight due to an eating disorder can stop menstruation, cause infertility and
          complicate pregnancy.
        </p>
        <h3 style={h3Style}>Overweight (BMI 25-30)</h3>
        <p style={pStyle}>
          Being overweight usually comes from taking in more calories than the body uses, and is also affected by alcohol, genetics, eating
          disorders, a sedentary lifestyle, poor nutrition and stress. It is generally thought to cause problems similar to obesity, to a
          lesser extent. Some studies have found lower mortality for overweight people than for those at a healthy weight<sup>1</sup>, but
          mortality is not the only measure of health: being overweight raises the risk of diabetes, heart disease and several cancers.
        </p>
        <h3 style={h3Style}>Obese (BMI &gt; 30)</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Obesity is usually caused by too little exercise, too much food and genetic susceptibility; less often by genes alone, hormonal
          disorders, medication or mental health conditions. It greatly increases the risk of heart disease, stroke, high blood pressure,
          type 2 diabetes, osteoarthritis and some cancers, and can cause sleep apnea and depression. It shortens life expectancy and is one
          of the leading preventable causes of death worldwide.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Maintaining a Healthy Weight</h2>
        <p style={pStyle}>
          Underweight, overweight and obesity lead to different health problems, but managing them involves similar areas: diet, exercise
          and, where relevant, mental health. To gain weight healthily, eat nutrient-rich foods such as whole grains, vegetables, lean
          protein, nuts and seeds more often, and consider strength training to build muscle. When an eating disorder such as anorexia or
          bulimia is the cause, treatment addresses the psychological problems alongside physical ones.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Overweight and obesity can largely be reduced through diet and exercise. The WHO recommends limiting calorie-dense foods, total
          fats and sugars, eating more fruit, vegetables, legumes, whole grains and nuts, and being active regularly: 60 minutes a day for
          children and 150 minutes a week for adults<sup>2</sup>. Related: the {link("/calculators/health/ideal-weight-calculator", "Ideal Weight Calculator")},{" "}
          {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")} and{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>References</h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <li>Flegal K. M., Graubard B. I., Williamson D. F., et al. "Excess Deaths Associated With Underweight, Overweight, and Obesity." JAMA 2005; 293(15): 1861-1867.</li>
          <li>WHO. "Obesity and overweight." Fact sheet, June 2021.</li>
        </ol>
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
