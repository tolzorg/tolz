import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is my protein intake calculated?",
    a: "Three ways. The American Dietetic Association range is 0.8-1 g per kg of body weight if you are sedentary, or 1-1.8 g per kg if you exercise. The CDC range is 10-35% of your daily Calories (BMR × activity, by Mifflin St Jeor or Katch-McArdle) at about 4 Calories per gram. The World Health Organization safe lower limit is 0.83 g per kg.",
  },
  {
    q: "Why are the three ranges different?",
    a: "The ADA and WHO figures depend only on your body weight, while the CDC range follows your daily Calorie needs, which also depend on your height, age, gender and activity. Very active people or those building muscle are usually toward the top of the range; the WHO figure is a minimum.",
  },
  {
    q: "How much protein do I need if I am pregnant or breastfeeding?",
    a: "More than usual: about 1 extra gram a day in the first trimester, 10 g in the second, 31 g in the third, 19 g in the first 6 months of breastfeeding and 13 g after that (see the table above). Ask your doctor or midwife for advice for your situation.",
  },
  {
    q: "Can I eat too much protein?",
    a: "Most healthy adults are fine up to about 1.8-2 g per kg of body weight. People with kidney or liver disease, diabetes or other conditions may need to limit protein and should follow their doctor's or dietitian's advice.",
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

const RDA = [["Age 1 - 3", "13"], ["Age 4 - 8", "19"], ["Age 9 - 13", "34"], ["Age 14 - 18 (Girls)", "46"], ["Age 14 - 18 (Boys)", "52"], ["Age 19 - 70+ (Women)", "46"], ["Age 19 - 70+ (Men)", "56"]];
const PREGNANCY = [
  ["Pregnancy trimester 1", "1", "375", "0.04"], ["Pregnancy trimester 2", "10", "1,200", "0.11"], ["Pregnancy trimester 3", "31", "1,950", "0.23"],
  ["Lactation first 6 months", "19", "2,800", "0.11"], ["Lactation after 6 months", "13", "1,925", "0.11"],
];
const FOODS = [
  ["Milk (1 cup / 8 oz)", "8 g"], ["Egg (1 large / 50 g)", "6 g"], ["Meat (1 slice / 2 oz)", "14 g"], ["Seafood (2 oz)", "16 g"],
  ["Bread (1 slice / 64 g)", "8 g"], ["Corn (1 cup / 166 g)", "16 g"], ["Rice (1 cup / 195 g)", "5 g"], ["Dry beans (1 cup / 92 g)", "16 g"],
  ["Nuts (1 cup / 92 g)", "20 g"], ["Fruits and vegetables (1 cup)", "0-1 g"], ["Pizza (1 slice / 107 g)", "12 g"], ["Hamburger (fast-food, medium)", "20 g"],
];
const COMPLETE_ANIMAL = ["Eggs", "Chicken breast", "Cottage cheese", "Greek yogurt", "Milk", "Lean beef", "Tuna", "Turkey breast", "Fish", "Shrimp"];
const COMPLETE_PLANT = ["Buckwheat", "Hummus and pita", "Soy products (tofu, tempeh, edamame beans)", "Peanut butter on toast or other bread", "Beans and rice", "Quinoa", "Hemp and chia seeds", "Spirulina"];
const INCOMPLETE = ["Almonds", "Oats", "Broccoli", "Lentils", "Ezekiel bread", "Chia seeds", "Pumpkin seeds", "Peanuts", "Brussels sprouts", "Grapefruit", "Green peas", "Avocados", "Mushrooms"];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 10px", paddingLeft: 20 };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
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

export default function ProteinCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Are Proteins?</h2>
        <p style={pStyle}>
          Proteins are one of the three primary macronutrients that provide energy to the body, along with fats and carbohydrates. They also do
          much of the work in cells: they are needed for the structure, function and regulation of tissues and organs. Proteins are made of
          amino acids, the building blocks of body tissue.
        </p>
        <p style={pStyle}>
          There are 20 amino acids, and their sequence determines a protein's structure and function. Some can be made by the body, but 9,
          the essential amino acids, can only come from food (too little of them can be fatal). Foods that provide all of the essential amino
          acids are called complete protein sources, and include animal sources (meat, dairy, eggs, fish) and plant sources (soy, quinoa,
          buckwheat).
        </p>
        <p style={{ ...pStyle, marginBottom: 4 }}>Proteins can be grouped by the job they do in the body:</p>
        <ul style={listStyle}>
          <li><strong>Antibody</strong>: protects the body from foreign particles, such as viruses and bacteria, by binding to them</li>
          <li><strong>Enzyme</strong>: helps form new molecules and carries out the many chemical reactions in the body</li>
          <li><strong>Messenger</strong>: transmits signals around the body to keep its processes running</li>
          <li><strong>Structural component</strong>: the building blocks of cells that ultimately let the body move</li>
          <li><strong>Transport / storage</strong>: moves molecules around the body</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because proteins have so many important roles, it is important to eat enough to keep healthy protein levels. See also the{" "}
          {link("/calculators/health/macro-calculator", "Macro Calculator")} and the{" "}
          {link("/calculators/health/carbohydrate-calculator", "Carbohydrate Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Protein Do I Need?</h2>
        <p style={pStyle}>
          The amount of protein the body needs each day depends on many things, including overall energy intake, growth and physical activity.
          It is often estimated from body weight, as a percentage of total Calories (10-35%), or from age alone. 0.8 g per kg of body weight
          is a commonly cited recommended dietary allowance (RDA). That is the minimum to meet basic nutritional needs; eating more protein,
          up to a point, may be beneficial, depending on its sources.
        </p>
        <p style={pStyle}>
          The recommended range is 0.8 g/kg to 1.8 g/kg of body weight, depending on the factors above. People who are highly active or want to
          build muscle should generally eat more protein, and some sources suggest 1.8 to 2 g/kg for highly active people. How much protein a
          person should eat is not an exact science, so ask a specialist, such as a dietitian, doctor or personal trainer, about your own needs.
        </p>
        <h3 style={h3Style}>Recommended dietary allowance (RDA) of protein, by age</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Age</th><th>Protein needed (grams/day)</th></tr></thead>
            <tbody>{RDA.map(([age, g]) => <tr key={age}><td>{age}</td><td style={{ textAlign: "center" }}>{g}</td></tr>)}</tbody>
          </table>
        </div>
        <h3 style={h3Style}>Extra protein for pregnancy and breastfeeding</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ ...tableStyle, minWidth: 520 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Stage</th><th>Safe intake (grams/day)</th><th>Additional energy requirement (kJ/day)</th><th>Protein : energy ratio</th></tr></thead>
            <tbody>
              {PREGNANCY.map(([stage, ...cells]) => (
                <tr key={stage}><td>{stage}</td>{cells.map((c, i) => <td key={i} style={{ textAlign: "center" }}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Foods High in Protein</h2>
        <p style={pStyle}>
          Many combinations of food can meet your protein needs. For many people much of their protein comes from meat and dairy, but it is
          possible to get enough with dietary restrictions too. Meat and dairy make the RDA easier to reach, though too much of either can
          harm your health; plant-based options are plentiful but usually carry less protein per serving. Ideally, eat a mix of meat, dairy
          and plant foods to meet your RDA with a balanced, nutrient-rich diet.
        </p>
        <p style={{ ...pStyle, marginBottom: 4 }}>
          Where possible, eat a variety of complete proteins, which contain a good amount of each of the nine essential amino acids. Examples:
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Meat / dairy</strong></p>
            <ul style={listStyle}>{COMPLETE_ANIMAL.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Vegan / plant-based</strong></p>
            <ul style={listStyle}>{COMPLETE_PLANT.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        </div>
        <p style={{ ...pStyle, marginBottom: 4 }}>
          Meat, poultry, fish, eggs and dairy are generally complete proteins; nuts, seeds, legumes, grains and vegetables are usually
          incomplete. There is nothing wrong with incomplete proteins: eat a good variety and you get all the amino acids you need, while some
          complete sources, such as fatty red meat, can be unhealthy. High-protein foods that are not complete proteins include:
        </p>
        <ul style={{ ...listStyle, columns: "3 140px" }}>{INCOMPLETE.map((f) => <li key={f}>{f}</li>)}</ul>
        <p style={pStyle}>
          These lists are not exhaustive. As with everything, balance matters; the examples above are healthier protein options when eaten in moderation.
        </p>
        <h3 style={h3Style}>Amount of protein in common food</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th style={{ textAlign: "left" }}>Food</th><th>Protein amount</th></tr></thead>
            <tbody>{FOODS.map(([food, g]) => <tr key={food}><td>{food}</td><td style={{ textAlign: "center" }}>{g}</td></tr>)}</tbody>
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
