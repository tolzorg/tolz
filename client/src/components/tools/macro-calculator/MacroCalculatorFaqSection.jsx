import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How are my macros calculated?",
    a: "First your daily Calories: BMR (Mifflin St Jeor, or Katch-McArdle if you know your body fat) × your activity level, adjusted for your goal (±250, 500 or 1,000 Calories a day for 0.5, 1 or 2 lb a week). Each plan then splits those Calories: Balanced is 25% protein, 50% carbs and 25% fat; protein and carbs are counted at about 4 Calories per gram and fat at about 9.",
  },
  {
    q: "Which plan should I choose?",
    a: "Balanced suits most people. Low Fat (20% fat) and Low Carb (40% carbs) shift Calories away from one macronutrient; High Protein (35% protein) can help when building muscle or losing weight while keeping muscle. Create Your Own lets you set your own split within healthy ranges.",
  },
  {
    q: "What do the ranges mean?",
    a: "They are the healthy limits for each macronutrient at your Calorie level: protein from about 0.8-1 g per kg of body weight (at least 60 g, and at least 10% of Calories) up to the high-protein amount; fat from 20% to 35% of Calories; carbs from 40% of Calories up to whatever the minimum protein and fat leave.",
  },
  {
    q: "Why does it say to consult a doctor instead of showing results?",
    a: "If your daily Calories come out below 1,500 (men) or 1,200 (women), for example with an extreme weight-loss goal, the calculator doesn't suggest a plan, because eating that little should be supervised.",
  },
  {
    q: "Can I enter metric units?",
    a: "Yes. Choose centimeters, meters or feet and inches for height, and kilograms, pounds or stones for weight, from the unit menus next to each box.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const FOODS = [
  ["Fruit", [
    ["Apple", "1 (4 oz.)", "0.27g", "14.36g", "0.18g"], ["Banana", "1 (6 oz.)", "1.85g", "38.85g", "0.56g"], ["Grapes", "1 cup", "1.15g", "28.96g", "0.26g"],
    ["Orange", "1 (4 oz.)", "0.79g", "11.79g", "0.23g"], ["Pear", "1 (5 oz.)", "0.54g", "21.91g", "0.17g"], ["Peach", "1 (6 oz.)", "1.2g", "12.59g", "0.33g"],
    ["Pineapple", "1 cup", "0.84g", "19.58g", "0.19g"], ["Strawberry", "1 cup", "1.11g", "12.75g", "0.5g"], ["Watermelon", "1 cup", "0.93g", "11.48g", "0.23g"],
  ]],
  ["Vegetables", [
    ["Asparagus", "1 cup", "2.95g", "5.2g", "0.16g"], ["Broccoli", "1 cup", "2.57g", "6.04g", "0.34g"], ["Carrots", "1 cup", "1.19g", "12.26g", "0.31g"],
    ["Cucumber", "4 oz.", "0.67g", "2.45g", "0.18g"], ["Eggplant", "1 cup", "0.98g", "5.88g", "0.18g"], ["Lettuce", "1 cup", "0.5g", "1.63g", "0.08g"],
    ["Tomato", "1 cup", "1.58g", "7.06g", "0.36g"],
  ]],
  ["Proteins", [
    ["Beef, regular, cooked", "2 oz.", "14.2g", "0g", "10.4g"], ["Chicken, cooked", "2 oz.", "16g", "0g", "1.84g"], ["Tofu", "4 oz.", "7.82g", "2.72g", "3.06g"],
    ["Egg", "1 large", "6.29g", "0.38g", "4.97g"], ["Fish, Catfish, cooked", "2 oz.", "9.96g", "4.84g", "8.24g"], ["Pork, cooked", "2 oz.", "15.82g", "0g", "8.26g"],
    ["Shrimp, cooked", "2 oz.", "15.45g", "0.69g", "1.32g"],
  ]],
  ["Common Meals/Snacks", [
    ["Bread, white", "1 slice (1 oz.)", "1.91g", "12.65g", "0.82g"], ["Butter", "1 tablespoon", "0.12g", "0.01g", "11.52g"], ["Caesar salad", "3 cups", "16.3g", "21.12g", "45.91g"],
    ["Cheeseburger", "1 sandwich", "14.77g", "31.75g", "15.15g"], ["Hamburger", "1 sandwich", "14.61g", "26.81g", "10.97g"], ["Dark Chocolate", "1 oz.", "1.57g", "16.84g", "9.19g"],
    ["Corn", "1 cup", "4.3g", "30.49g", "1.64g"], ["Pizza", "1 slice (14\")", "13.32g", "33.98g", "12.13g"], ["Potato", "6 oz.", "4.47g", "36.47g", "0.22g"],
    ["Rice", "1 cup cooked", "4.2g", "44.08g", "0.44g"], ["Sandwich", "1 (6\" turkey sandwich)", "18g", "46g", "3.5g"],
  ]],
  ["Beverages/Dairy", [
    ["Beer", "1 can", "1.64g", "12.64g", "0g"], ["Cola", "1 can", "0g", "39g", "0g"], ["Diet cola", "1 can", "0g", "0g", "0g"],
    ["Milk (1%)", "1 cup", "8.22g", "12.18g", "2.37g"], ["Milk (2%)", "1 cup", "8.05g", "11.42g", "4.81g"], ["Milk (Whole)", "1 cup", "7.86g", "11.03g", "7.93g"],
    ["Orange Juice", "1 cup", "1.74g", "25.79g", "0.5g"], ["Apple cider", "1 cup", "0.15g", "28.97g", "0.27g"], ["Yogurt (low-fat)", "1 cup", "12.86g", "17.25g", "3.8g"],
    ["Yogurt (non-fat)", "1 cup", "13.01g", "17.43g", "0.41g"],
  ]],
];

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

export default function MacroCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Are Macronutrients (Macros)?</h2>
        <p style={pStyle}>
          In health and fitness, macronutrients are the chemical compounds we eat in large amounts that provide bulk energy: carbohydrates,
          proteins and fats. Some definitions also include water, air, calcium, sodium, chloride ions and other substances the body needs in
          large quantities; this calculator works out daily carbohydrate, protein and fat needs only.
        </p>
        <p style={pStyle}>
          Micronutrients, such as vitamin A, copper, iron and iodine, are the other essential part of nutrition. Macronutrients are needed
          daily in grams, while people usually need less than 100 milligrams of micronutrients a day.
        </p>
        <h3 style={h3Style}>Protein</h3>
        <p style={pStyle}>
          Proteins are organic compounds made of amino acids. Some amino acids, the "essential amino acids", can only come from food, which is
          why protein is a necessary part of the diet. It comes from animal sources (meat, dairy and so on) and plants (beans, legumes, nuts,
          seeds), and some people trying to build muscle use protein supplements. As with most things, moderation matters, and some proteins
          are healthier than others.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Healthier proteins:</strong></p>
            <ul style={listStyle}>{["Soy", "Beans", "Nuts", "Fish", "Skinless poultry", "Lean beef", "Pork", "Low-fat dairy products"].map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Less healthy proteins:</strong></p>
            <ul style={listStyle}>{["Fried meats", "Processed meats (deli meats, sausages, fast-food burgers, etc.)", "High-sugar yogurts", "Processed protein bars", "Many kinds of cheese"].map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
        <h3 style={h3Style}>Carbohydrates (Carbs)</h3>
        <p style={pStyle}>
          Carbohydrates are usually classed as sugar, starch or fiber. Sugar is the simplest form; starch and fiber are complex
          carbohydrates. By the number of saccharides, monosaccharides and disaccharides are "simple carbohydrates", and oligosaccharides and
          polysaccharides "complex carbohydrates".
        </p>
        <p style={pStyle}>
          Glucose, a monosaccharide, is one of the body's key energy sources. Polysaccharides such as cellulose are hard for humans to digest
          but provide valuable dietary fiber. Too much sugar (common in processed foods) is harmful, but complex carbohydrates from vegetables,
          fruit, whole grains and legumes, especially those with fiber, are beneficial and necessary.
        </p>
        <h3 style={h3Style}>Fat</h3>
        <p style={pStyle}>
          Fats are molecules made mainly of carbon and hydrogen, such as cholesterol, phospholipids and triglycerides. Although often seen as
          unhealthy, they have structural and metabolic roles, are a necessary part of the diet, and are the most energy-dense and efficient
          form of energy storage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Saturated and trans fats are generally considered unhealthy, while monounsaturated and polyunsaturated fats and omega-3 fatty acids
          are healthier sources. The Dietary Guidelines for Americans recommend avoiding trans fats where possible, keeping saturated fat
          under 10% of daily Calories, and replacing saturated fats with monounsaturated and polyunsaturated fats.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Daily Calorie Needs</h2>
        <p style={pStyle}>
          How many Calories you need each day depends mainly on your height, weight, age and activity level, and on whether you want to
          maintain, lose or gain weight. The calculator estimates your basal metabolic rate (BMR) or resting daily energy expenditure (RDEE)
          and multiplies it by an activity factor. The Mifflin-St Jeor equation, widely used, works from body weight and height; the
          Katch-McArdle formula takes lean body mass into account and can be more accurate for leaner people who know their body fat
          percentage (find yours with the {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")}).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An average person may need anywhere from 1,600 to 3,000 Calories a day; generally more for men (2,000-3,000) than women
          (1,600-2,400), more with higher activity and less when sedentary. Because carbohydrates, proteins and fats supply nearly all of the
          body's energy, their daily needs follow from your Calorie needs, based on guidelines from institutions such as the American
          Dietetic Association, the Centers for Disease Control and Prevention and the World Health Organization. See also the{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Macronutrients in Common Foods</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 480 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Food</th><th style={{ textAlign: "left" }}>Serving Size</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead>
            <tbody>
              {FOODS.flatMap(([group, rows]) => [
                <tr key={group}><td colSpan={5} style={{ fontWeight: 700, background: "var(--bg-light, #f5f7fa)" }}>{group}</td></tr>,
                ...rows.map(([food, size, p, c, f]) => (
                  <tr key={food}><td>{food}</td><td>{size}</td><td style={{ textAlign: "center" }}>{p}</td><td style={{ textAlign: "center" }}>{c}</td><td style={{ textAlign: "center" }}>{f}</td></tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
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
