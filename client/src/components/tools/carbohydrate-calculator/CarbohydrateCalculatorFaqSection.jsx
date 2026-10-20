import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is my daily carb intake calculated?",
    a: "First your daily Calories: BMR (Mifflin St Jeor, or Katch-McArdle if you know your body fat) × your activity level, then 500 or 1,000 Calories less or more a day to lose or gain 1 or 2 lb (0.5 or 1 kg) a week. Carbohydrates are then 40%, 55%, 65% and 75% of those Calories, at about 3.75 Calories per gram.",
  },
  {
    q: "Why 40% to 75%?",
    a: "The Institute of Medicine recommends that American and Canadian adults get 40% to 65% of their dietary energy from carbohydrates, while the Food and Agriculture Organization and the World Health Organization jointly recommend 55% to 75%, with only 10% directly from sugars. The table shows both ranges.",
  },
  {
    q: "Why do my results say 130 grams?",
    a: "The Institute of Medicine sets a minimum of 130 grams of carbohydrates a day for adults. When 40% of your maintenance Calories comes to less than that, the calculator shows each goal as a sentence and never suggests less than 130 grams.",
  },
  {
    q: "How many grams of carbs are in a pound or an ounce?",
    a: "One ounce is about 28.35 grams and one pound about 453.6 grams. With pounds selected for weight, the table also shows each amount in ounces and pounds.",
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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
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

export default function CarbohydrateCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Are Carbohydrates?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Carbohydrates (carbs) are one of the three primary macronutrients that provide energy, along with fats and proteins. The body
          breaks them down or converts them into glucose, its main source of energy. They can also be stored as energy in the form of
          glycogen, or converted to fat (which can also be used for energy). See the {link("/calculators/health/macro-calculator", "Macro Calculator")}{" "}
          for protein and fat as well.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Carbohydrates</h2>
        <p style={pStyle}>
          Carbohydrates are often classed as simple (monosaccharides and disaccharides) or complex (polysaccharides or oligosaccharides),
          originally to separate sugars from other carbohydrates. Many foods, such as fruits and vegetables, contain several types, which can
          make the classification ambiguous. Although carbohydrates are not essential nutrients (ones the body needs but cannot make), they
          are an efficient source of energy that, eaten in controlled amounts, may lower the risk of cardiovascular disease, obesity and
          type 2 diabetes.
        </p>
        <p style={{ ...pStyle, marginBottom: 4 }}>The three main types of carbohydrates are sugar, starch and fiber:</p>
        <ul style={listStyle}>
          <li><strong>Sugars</strong> are the simplest form. They occur naturally in fruits, dairy and vegetables, and in processed form in candy, cookies, cakes and many drinks.</li>
          <li><strong>Starches</strong> are complex carbohydrates found naturally in many beans, vegetables and grains.</li>
          <li><strong>Fibers</strong> are complex carbohydrates found in fruits, whole grains, vegetables and many beans. Fiber is essential for digestion.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Complex carbohydrates generally have more nutritional value than simple ones, sometimes called "empty carbs". Added sugars have
          little nutritional value and are not needed: the body does need some carbohydrate, but fiber-rich fruits and vegetables, whole
          grains and legumes supply it along with many other nutrients. Complex carbs are also digested more slowly, keeping you full for
          longer, which can help with weight control. Foods made mostly of simple carbohydrates, such as soda, cookies, juice and baked goods,
          often carry large amounts of sugar and fat, are easy to overeat, and may lead to weight gain and diabetes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Carbs Should I Eat?</h2>
        <p style={pStyle}>
          It depends on many factors, but the Institute of Medicine recommends a minimum of 130 grams of carbohydrates a day for adults, and
          other sources recommend that carbohydrates make up 40-75% of daily Calories. Although carbs are not essential nutrients and many fad
          diets restrict or cut them out, a controlled amount of "good" carbs has benefits. Carbs eaten beyond what can be stored as glycogen
          are converted to fat. When too few carbs and fats are available for energy, the body starts breaking down protein instead, which
          can be a problem, since protein builds tissues and organs, drives chemical reactions, carries messages and transports molecules
          around the body.
        </p>
        <p style={pStyle}>
          Not all carbohydrates are equal. Whole grains, vegetables, fruits and beans are better sources than white bread, white rice and
          processed foods. The main difference between simple and complex carbohydrates, sometimes called "refined" and "whole" or "bad" and
          "good", is that refined carbs have been stripped of their natural fiber, as in juices, pastries, bread and pasta. Fiber aids
          digestion, promotes healthy bowel movements and can lower the risk of some chronic diseases, according to the US Department of
          Agriculture.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px" }}>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Good carbs:</strong></p>
            <ul style={listStyle}>
              <li>contain a low or moderate number of Calories</li>
              <li>are high in nutrients</li>
              <li>do not contain refined sugars or grains</li>
              <li>are high in natural fibers</li>
              <li>are low in sodium and saturated fats</li>
              <li>are low in, or free of, cholesterol and trans fats</li>
            </ul>
          </div>
          <div style={{ flex: "1 1 240px" }}>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Bad carbs:</strong></p>
            <ul style={listStyle}>
              <li>are high in Calories</li>
              <li>are low in many nutrients</li>
              <li>are full of refined sugars (e.g. corn syrup, white sugar, honey, fruit juices)</li>
              <li>are low in fiber</li>
              <li>are high in sodium and may be high in saturated fat</li>
              <li>may be high in cholesterol and trans fats</li>
              <li>are high in refined grains (e.g. white flour)</li>
            </ul>
          </div>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          How many carbs you need really depends on you. A low-carb diet can be life-changing for one person and bring no benefit to another.
          Many nutritious foods, such as vegetables, legumes, whole fruits, nuts, seeds and whole grains, contain carbohydrates. Carbs are not
          inherently bad as long as sugary drinks, fruit juices and processed foods like cookies and candy are avoided or eaten in moderation.
          Eat enough carbs to suit your lifestyle, and consider seeing a dietitian before any drastic change to your diet. See also the{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")} and the{" "}
          {link("/calculators/health/calorie-tracker", "Calorie Tracker")}.
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
