import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much fat should I eat per day?",
    a: "Most adults should get 20% to 35% of daily calories from fat. At 2,000 calories, that is roughly 44 to 78 grams. The fat intake calculator above gives you a personalized range based on your age, gender, height, weight, activity level and goal.",
  },
  {
    q: "What is the maximum fat intake per day?",
    a: "For most adults, 35% of daily calories is the upper end of the recommended range, which is about 78 grams on a 2,000-calorie diet. Saturated fat should stay under 10% of calories, or about 22 grams.",
  },
  {
    q: "How do I calculate my daily fat intake in grams?",
    a: "Multiply your daily calories by your target fat percentage, then divide by 9, because each gram of fat has 9 calories. For 1,800 calories at 30%, that is 540 ÷ 9 = 60 grams.",
  },
  {
    q: "How many grams of fat is 500 calories?",
    a: "500 calories from fat equals about 55.6 grams of fat. If 500 calories is your total intake, the 20-35% range comes to about 11 to 19 grams.",
  },
  {
    q: "How many grams of fat per day to lose weight?",
    a: "It depends on your calorie target, not just your goal. Someone eating 1,500 calories gets about 33 to 58 grams at 20-35%. Staying within that range, rather than cutting fat sharply, helps you stay full and keep absorbing fat-soluble vitamins.",
  },
  {
    q: "What is the saturated fat limit per day?",
    a: "The Dietary Guidelines for Americans recommend under 10% of calories, which is about 22 grams on a 2,000-calorie diet. A stricter 7% target, about 15 grams, is often used for heart health, and the American Heart Association suggests 5-6% for people who need to lower LDL cholesterol.",
  },
  {
    q: "How much fat should a woman eat per day?",
    a: "Women follow the same 20-35% range as men, but with a lower average calorie need. At 1,800 calories, that is about 40 to 70 grams of fat per day.",
  },
  {
    q: "What is the ideal percentage of carbs, protein and fat?",
    a: "The accepted ranges for adults are 45-65% carbohydrates, 10-35% protein and 20-35% fat. A common balance is 50% carbs, 20% protein and 30% fat.",
  },
  {
    q: "Is 35% of calories from fat too much?",
    a: "No, 35% is the upper end of the accepted range for adults. It can work well if most of the fat comes from unsaturated sources and saturated fat stays under its limit. Going above 35% is not generally recommended without medical guidance.",
  },
  {
    q: "Can I eat less than 20% of calories from fat?",
    a: "It is not recommended for most people. Very low fat intake can make it harder to absorb vitamins A, D, E and K and may affect hormone function. It can also make a diet harder to stick to.",
  },
  {
    q: "Do diabetics need to watch their fat intake?",
    a: "Yes, mainly the type and the total calories. People with diabetes have a higher risk of heart disease, so limiting saturated and trans fat is important, and managing weight helps blood sugar. A doctor or dietitian can tailor the plan.",
  },
  {
    q: "Does the fat intake calculator work for keto or low-carb diets?",
    a: "This calculator is built around the standard 20-35% guideline. Ketogenic diets use much higher fat percentages, so the results will not match a keto plan. Check with a healthcare professional before following one.",
  },
  {
    q: "Does eating fat make you fat?",
    a: "Not on its own. Weight gain comes from eating more calories than you burn. Fat is calorie-dense, so it is easy to overeat, but sugar, processed foods, sleep, activity and genetics also play a role.",
  },
  {
    q: "How can I lower my fat intake?",
    a: "Swap saturated fat for unsaturated fat, measure cooking oil, choose baked or grilled foods over fried, trim visible fat and read labels for saturated and trans fat.",
  },
  {
    q: "Is the fat intake calculator free to use?",
    a: "Yes. The tool is free, and you can recalculate whenever your weight, activity level or goal changes.",
  },
];

// The supplied FAQ schema words these answers slightly differently from the
// page; every other answer is the displayed text.
const FAQ_SCHEMA_OVERRIDES = {
  "How much fat should I eat per day?": "Most adults should get 20% to 35% of daily calories from fat. At 2,000 calories, that is roughly 44 to 78 grams. The fat intake calculator gives you a personalized range based on your age, gender, height, weight, activity level and goal.",
  "What is the maximum fat intake per day?": "For most adults, 35% of daily calories is the upper end of the recommended range, about 78 grams on a 2,000-calorie diet. Saturated fat should stay under 10% of calories, or about 22 grams.",
  "How many grams of fat per day to lose weight?": "It depends on your calorie target. Someone eating 1,500 calories gets about 33 to 58 grams at 20-35%. Staying within that range helps you stay full and keep absorbing fat-soluble vitamins.",
  "What is the saturated fat limit per day?": "The Dietary Guidelines for Americans recommend under 10% of calories, about 22 grams on a 2,000-calorie diet. A stricter 7% target, about 15 grams, is often used for heart health, and the American Heart Association suggests 5-6% for people who need to lower LDL cholesterol.",
  "Is 35% of calories from fat too much?": "No, 35% is the upper end of the accepted range for adults. It can work well if most fat comes from unsaturated sources and saturated fat stays under its limit.",
  "Can I eat less than 20% of calories from fat?": "It is not recommended for most people. Very low fat intake can make it harder to absorb vitamins A, D, E and K and may affect hormone function.",
};
const straight = (s) => s.replace(/’/g, "'");

const AGE_HEADERS = ["Age", "Suggested fat intake (% of total calories)"];
const AGE_ROWS = [
  ["2 to 3 years", "30% to 40%"],
  ["4 to 18 years", "25% to 35%"],
  ["19 years and older", "20% to 35%"],
];
const CAL_HEADERS = ["Calories", "Grams of fat in that many fat calories", "Fat range at 20-35% of that many total calories"];
const CAL_ROWS = [
  ["50", "5.6 g", "1.1 to 1.9 g"],
  ["100", "11.1 g", "2.2 to 3.9 g"],
  ["200", "22.2 g", "4.4 to 7.8 g"],
  ["300", "33.3 g", "6.7 to 11.7 g"],
  ["400", "44.4 g", "8.9 to 15.6 g"],
  ["500", "55.6 g", "11.1 to 19.4 g"],
  ["600", "66.7 g", "13.3 to 23.3 g"],
  ["700", "77.8 g", "15.6 to 27.2 g"],
  ["800", "88.9 g", "17.8 to 31.1 g"],
  ["900", "100 g", "20 to 35 g"],
  ["1,000", "111.1 g", "22.2 to 38.9 g"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
};

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 360 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
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

export default function FatIntakeCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Fat Intake, and Why Does It Matter?">
        <P>
          Fat intake is the amount of dietary fat you eat in a day, from sources like cooking oils, butter, meat, dairy, eggs, nuts,
          seeds, avocados and fish. Along with protein and <Link to="/tools/carbohydrate-calculator" className="inline-home-link">carbohydrates</Link>, fat is one of the three <Link to="/tools/macro-calculator" className="inline-home-link">macronutrients</Link> that supply the energy
          your body runs on. It is also the most concentrated source of that energy, with 9 calories in every gram.
        </P>
        <P>
          Fat does a lot more than provide calories. Your body needs it to absorb vitamins A, D, E and K, build cell membranes, produce
          hormones, protect organs and support brain function. Two fats, linoleic acid (an omega-6) and alpha-linolenic acid (an
          omega-3), are called essential because your body cannot make them. You have to get them from food.
        </P>
        <P>
          The catch is that fat works against you at both extremes. Too little can lead to poor vitamin absorption, constant hunger and
          hormone problems. Too much adds calories quickly, and because fat is so calorie-dense, it is easy to overshoot without
          noticing. The type of fat matters too. Saturated and trans fats raise LDL (“bad”) cholesterol, while unsaturated fats tend to
          improve it. A good daily target accounts for both the amount and the type, which is what this calculator is built to help
          with.
        </P>
      </Card>

      <Card title="How Much Fat Per Day? Maximum Intake and Daily Grams">
        <P>
          There is no single number that fits everyone, because fat needs are tied to calories. For healthy adults, the standard range
          is 20% to 35% of daily calories from fat. The upper end, 35%, is the practical maximum for most adults. The World Health
          Organization uses a slightly lower ceiling of 30% for total fat, so staying in the lower half of the range is a reasonable
          choice if you want to be conservative.
        </P>
        <P>In grams, the range grows with your <Link to="/tools/calorie-tracker" className="inline-home-link">calorie intake</Link>:</P>
        <List items={[
          ["1,500 calories:", "about 33 to 58 grams"],
          ["2,000 calories:", "about 44 to 78 grams"],
          ["2,500 calories:", "about 56 to 97 grams"],
          ["3,000 calories:", "about 67 to 117 grams"],
        ]} />
        <P>
          For saturated fat, the{" "}
          <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans, 2025–2030</Ext> keep the long-standing limit
          of less than 10% of daily calories. That works out to about 22 grams on a 2,000-calorie diet.
        </P>
        <H3>Fat Intake by Age</H3>
        <P>
          The healthy range changes with age. Young children need more fat for growth and brain development, which is also why fat
          should not be restricted for children under 2.
        </P>
        <DataTable headers={AGE_HEADERS} rows={AGE_ROWS} />
        <P>This calculator is built for adults. For a child’s diet, talk to a pediatrician.</P>
        <H3>What Is the Minimum Amount of Fat You Need?</H3>
        <P>
          No one has set an exact “survival” number, but the essential fatty acids give a rough floor. The National Academies set
          adequate intakes of about 12 to 17 grams of linoleic acid and 1.1 to 1.6 grams of alpha-linolenic acid per day for adults,
          depending on gender. In practice, it is hard to meet those needs, along with your vitamin absorption needs, on a very low-fat
          diet. That is why 20% of calories is considered the lower boundary for most adults.
        </P>
      </Card>

      <Card title="What Does a Fat Intake Calculator Actually Tell You?">
        <P>
          A daily fat intake calculator turns a general guideline into a personal number. Percentages are useful, but nobody eats in
          percentages. Packaged foods list grams, so you need your target in grams too.
        </P>
        <P>
          This tool does that conversion for you. First it estimates how many calories your body needs based on your profile and goal.
          Then it applies the 20-35% fat range to that calorie figure and converts the result into grams. It does the same for
          saturated fat, using the standard 10% limit or the stricter 7% limit often recommended when heart health is a priority.
        </P>
        <P>
          The result is a practical range, not a single rigid number. A range is more realistic, because your fat needs shift with your
          diet style, training and preferences.
        </P>
      </Card>

      <Card title="How to Use the Free Fat Intake Calculator Online">
        <P>The inputs are simple, and each one affects the result:</P>
        <List items={[
          ["Age and gender", "help estimate your resting energy needs, which differ between men and women and decline gradually with age."],
          ["Height and weight", "determine how much energy your body burns at rest. A larger body generally needs more calories, and therefore more total fat grams within the same percentage range."],
          ["Activity level", "is the biggest adjustment. A desk-bound person and someone who trains daily can differ by several hundred calories."],
          ["Your goal", "(maintain, lose or gain weight) shifts the calorie target up or down, which changes the fat grams."],
        ]} />
        <P>
          Be honest about activity. People tend to overestimate it, and that inflates the calorie target and the fat range with it. If
          your week varies, pick the level that matches your typical week rather than your best one.
        </P>
      </Card>

      <Card title="How Daily Fat Grams Are Calculated From Calories">
        <P>
          The math behind any fat grams calculator is simple. Fat contains 9 calories per gram, compared with 4 calories per gram for
          protein and carbohydrates. To convert a percentage of calories into grams, multiply your daily calories by the percentage,
          then divide by 9.
        </P>
        <P>Take a person who needs 2,000 calories a day to maintain weight:</P>
        <Formula>
          Total fat at 20%: 400 calories ÷ 9 ≈ 44 g<br />
          Total fat at 35%: 700 calories ÷ 9 ≈ 78 g<br />
          Saturated fat under 10%: 200 calories ÷ 9 ≈ 22 g<br />
          Saturated fat at 7%: 140 calories ÷ 9 ≈ 15.5 g
        </Formula>
        <P>
          The tool runs these steps instantly, but knowing the formula lets you sanity-check any result and recalculate by hand when
          your calorie target changes.
        </P>
      </Card>

      <Card title="How Much Fat Is 50, 100, 200 up to 1,000 Calories?">
        <P>
          People ask this two ways, so here are both. The first column shows how many grams of fat equal a given number of calories
          from fat (divide by 9). The second column shows the 20-35% fat range if that number were your total calorie intake.
        </P>
        <DataTable headers={CAL_HEADERS} rows={CAL_ROWS} />
        <P>
          The second column is also handy for planning a single meal. A 600-calorie dinner, for example, would land at roughly 13 to 23
          grams of fat. Keep in mind that a daily intake of 1,000 calories or less is far below what most adults need and should only
          be followed under medical supervision.
        </P>
      </Card>

      <Card title="Fat Intake for Weight Loss, Maintenance and Weight Gain">
        <P>Your goal changes the calorie target, and the fat range follows.</P>
        <Lead lead="Maintenance.">
          The calculator estimates the calories you need to hold your current weight, then applies the 20-35% range. This is the
          baseline the other two goals adjust.
        </Lead>
        <Lead lead="Weight loss.">
          To lose weight you eat fewer calories than you burn, so the fat range shrinks in grams even though the percentage stays the
          same. Someone eating 1,500 calories a day gets about 33 to 58 grams of fat. Aiming for the lower end of the range can free up
          calories for protein and fiber-rich carbohydrates, which many people find more filling. Going below 20%, however, is rarely a
          good idea, because very low-fat diets tend to be hard to sustain.
        </Lead>
        <Lead lead="Weight gain.">
          To gain weight, you need a calorie surplus. Fat is the most calorie-dense nutrient, so it is an efficient way to add energy
          without adding huge food volume. People with small appetites, or those building muscle alongside resistance training, often
          aim for the middle to upper part of the range, using foods like nuts, nut butters, olive oil, avocado and fatty fish.
        </Lead>
        <P>
          In every case, the number is a starting point. Track your weight and energy for two to three weeks, then adjust your calorie
          target and recalculate.
        </P>
        <H3>Which Matters More for Weight Loss: Fat or Calories?</H3>
        <P>
          Total calories matter most. Studies comparing low-fat and low-carb diets generally find similar weight loss over the long run
          when calories are matched, and the best plan is the one you can stick with. Fat still deserves attention because it is
          dense. One tablespoon of olive oil has about 120 calories, so a few casual pours can erase a calorie deficit.
        </P>
        <H3>Does Eating Fat Make You Gain Weight?</H3>
        <P>
          Not by itself. Weight gain comes from taking in more calories than you burn over time, and obesity has many contributors,
          including sleep, stress, ultra-processed foods, added sugar, physical activity and genetics. Dietary fat is not the only
          factor, and blaming it alone oversimplifies things. But because fat packs 9 calories per gram, it is easier to overeat
          calories from fat than from most other foods, which is why the daily range still matters.
        </P>
        <H3>Fat and Hunger</H3>
        <P>
          Fat slows digestion, so meals that include some fat often keep you satisfied longer. That said, protein and fiber usually
          fill you up more per calorie. A meal with too little fat can leave you hungry soon after, while one loaded with fat can
          quietly push you over your calorie target.
        </P>
        <H3>Losing Belly Fat</H3>
        <P>
          You cannot choose where your body loses fat. Belly fat comes down as overall <Link to="/tools/body-fat-calculator" className="inline-home-link">body fat</Link> comes down, and that takes a steady
          calorie deficit. Cutting back on added sugar, staying within your fat range, eating enough protein and combining cardio with
          strength training all help. Reducing only one of these usually isn’t enough.
        </P>
      </Card>

      <Card title="Suggested Fat Intake for Women">
        <P>
          Health authorities do not set a different fat percentage for women. Women follow the same 20-35% range as men. What differs
          is the calorie target, which is usually lower because women tend to have less muscle mass and a smaller frame, so the gram
          amounts are lower too.
        </P>
        <P>Adult women often need somewhere between 1,600 and 2,400 calories a day, depending on age and activity. Here is what that looks like:</P>
        <List items={[
          ["1,600 calories:", "about 36 to 62 grams of fat"],
          ["1,800 calories:", "about 40 to 70 grams"],
          ["2,000 calories:", "about 44 to 78 grams"],
          ["2,200 calories:", "about 49 to 86 grams"],
          ["2,400 calories:", "about 53 to 93 grams"],
        ]} />
        <P>
          Saturated fat should stay under 10% of calories, which is roughly 18 to 27 grams across that calorie range. Pregnancy and
          breastfeeding raise energy and nutrient needs, so this calculator is not the right tool during those times. A doctor or
          dietitian can set targets that fit.
        </P>
      </Card>

      <Card title="The Ideal Balance of Carbs, Protein and Fat">
        <P>The National Academies publish acceptable ranges for each macronutrient for adults:</P>
        <List items={[
          ["Carbohydrates:", "45% to 65% of calories"],
          ["Protein:", "10% to 35% of calories"],
          ["Fat:", "20% to 35% of calories"],
        ]} />
        <P>
          There is no single perfect split. A common example of 2,000 calories is 50% carbohydrates (250 grams), 20% protein (100
          grams) and 30% fat (about 67 grams). Someone who trains hard might raise protein, while someone who prefers rice, beans and
          fruit might stay near 20-25% fat. Protein is usually set first based on body weight and activity, then carbohydrates and fat
          divide the remaining calories according to preference and how you feel.
        </P>
        <H3>Do You Need to Count Carbs, Protein and Fat?</H3>
        <P>
          Not everyone does. Many people do well by tracking calories and focusing on food quality: whole foods, plenty of vegetables,
          lean protein, and unsaturated fats. Counting macros becomes useful when you have a specific goal, such as losing fat while
          keeping muscle, building muscle, managing cholesterol or blood sugar, or following a plan from a dietitian. If you do track,
          use the calculator once to set your fat range, then use a food label or app to stay within it. If counting numbers makes you
          anxious or leads to restrictive eating, step back and talk to a professional.
        </P>
      </Card>

      <Card title="Saturated Fat Limit Per Day: Why 10% and Why 7%">
        <P>
          Saturated fat gets its own line in the results because it behaves differently from other fats. High intake raises LDL
          cholesterol in most people, and elevated LDL is a major risk factor for heart disease.
        </P>
        <P>
          The commonly cited ceiling is under 10% of daily calories. The 2025–2030 Dietary Guidelines for Americans kept that limit,
          even though they put more emphasis on whole foods and no longer steer people away from full-fat dairy. As{" "}
          <Ext href="https://nutritionsource.hsph.harvard.edu/healthy-weight/dietary-guidelines/">Harvard’s Nutrition Source</Ext>{" "}
          points out, the limit is easy to reach quickly. One cup of whole milk, three-quarters of a cup of full-fat Greek yogurt and an
          ounce of cheddar add up to about 17 grams of saturated fat, which leaves little room on a 2,000-calorie diet.
        </P>
        <P>
          For people managing cholesterol, or with a family history of heart disease, clinicians often suggest a lower target, and 7%
          of calories is a widely used heart-health threshold. The American Heart Association recommends going even lower, about 5-6%
          of calories, for people who need to lower their LDL cholesterol. If you fall into that group, treat the calculator’s 7% figure
          as an upper boundary and ask your doctor about your target.
        </P>
        <P>
          Saturated fat is concentrated in butter, cheese, cream, fatty cuts of red meat, processed meats, coconut oil and many baked
          goods. A single tablespoon of butter has around 7 grams, so a person aiming for 15 grams a day can use up half their allowance
          with a small amount of butter. Replacing some saturated fat with unsaturated fat, such as swapping butter for olive oil, is
          the change with the strongest evidence behind it.
        </P>
        <P>
          If your saturated fat and sodium numbers run high even though you eat “healthy,” look at hidden sources: cheese, creamy
          sauces, deli meats, granola, protein bars, restaurant meals and packaged foods marketed as natural.
        </P>
      </Card>

      <Card title="Understanding the Types of Fat Behind Your Total">
        <P>Your total fat target says how much, but the type of fat matters just as much.</P>
        <Lead lead="Unsaturated fats">
          should make up most of your intake. Monounsaturated fats, found in olive oil, avocados and most nuts, and polyunsaturated
          fats, found in walnuts, seeds and fatty fish, are linked with better cholesterol profiles. Omega-3 fats, such as those in
          salmon, sardines, flaxseed and chia, are essential and have been linked with a lower risk of heart disease.
        </Lead>
        <Lead lead="Saturated fats">are the ones to cap, as covered above.</Lead>
        <Lead lead="Trans fats">
          are the worst type. Most come from partial hydrogenation, a process used in some fried and packaged foods. They raise LDL,
          lower HDL (“good”) cholesterol and have no known health benefit. Keep in mind that U.S. labeling rules allow a food with less
          than 0.5 grams of trans fat per serving to list 0 grams. To avoid it fully, check the ingredient list for “partially
          hydrogenated” oils.
        </Lead>
        <P>
          You may also see advice to keep dietary cholesterol low. Older guidance used a limit of 300 mg a day, and most heart-health
          organizations still suggest keeping it modest, especially if you have high LDL.
        </P>
        <P>
          A practical approach is to use the calculator to find your total range, keep saturated fat under its ceiling, and let
          unsaturated sources fill the rest. A day at 70 grams of fat with 15 grams saturated is a very different diet from 70 grams
          with 30 grams saturated, even though the totals match.
        </P>
      </Card>

      <Card title="Fat Intake, Prediabetes and Diabetes">
        <P>
          There is no single fat target for people with prediabetes or diabetes, but fat still matters in two ways. First, weight loss
          improves insulin sensitivity, so keeping total calories in check, including calories from fat, helps. Second, people with
          diabetes have a higher risk of heart disease, so limiting saturated and trans fat and favoring unsaturated fats is especially
          important.
        </P>
        <P>
          Carbohydrates affect blood sugar more directly than fat does, so most diabetes meal plans focus on carb quality and portions
          first. Fat can still change how quickly a meal’s carbs are absorbed, which is one reason some people see delayed blood sugar
          rises after high-fat meals. If you take insulin or other diabetes medication, ask your care team how to adjust meals. The
          calculator gives a general healthy-adult range and is not designed for medical diets.
        </P>
      </Card>

      <Card title="Low-Carb, High-Fat (LCHF) and Keto Diets">
        <P>
          This calculator is built around the standard 20-35% range. Low-carb, high-fat and ketogenic diets use much higher fat, often
          60% to 80% of calories, so the results will not match those plans. Since many people searching for fat targets are also
          curious about these diets, here is a balanced look.
        </P>
        <H3>Is the LCHF Diet Healthy?</H3>
        <P>
          It depends on the person and on the food choices. Some people lose weight and see better blood sugar on LCHF, mainly because
          it can reduce appetite and make it easier to eat fewer calories. Long-term research is more limited. Possible concerns include
          higher LDL cholesterol (especially when fat comes mostly from butter, cheese and red meat), low fiber, shortfalls in some
          vitamins and minerals, constipation, and difficulty sticking with it.
        </P>
        <H3>What Are the Long-Term Risks?</H3>
        <P>
          Because few studies follow people for many years, the long-term picture is uncertain. The main worries are cholesterol and
          heart health, nutrient gaps from cutting out whole grains, fruit and legumes, and kidney stones in some people. LCHF diets can
          also be unsafe for people with pancreatitis, liver or kidney disease, gallbladder problems, or type 1 diabetes, and for those
          taking certain diabetes drugs, where there is a risk of ketoacidosis. Medical supervision is important for anyone with these
          conditions.
        </P>
        <H3>Is LCHF the Best Diet for Diabetes?</H3>
        <P>
          It is one option, not the only one. Cutting carbs can lower blood sugar in people with type 2 diabetes, and some are able to
          reduce medication under a doctor’s care. But studies have not shown that it beats other well-structured eating patterns over
          the long term. The best diet for diabetes is the one that improves blood sugar, supports weight management, protects the heart
          and that you can follow consistently.
        </P>
        <H3>How Can People Justify LCHF?</H3>
        <P>
          The case for it is practical: it is simple to follow, cuts refined carbs and added sugar, can curb appetite and can help blood
          sugar. That case is much stronger when the fat comes from olive oil, nuts, seeds, avocado and fish rather than processed meat
          and heavy cream, and when a doctor monitors cholesterol and other labs.
        </P>
        <H3>Do You Need High Fat to Be in Ketosis?</H3>
        <P>
          Ketosis is triggered by very low carbohydrate intake, usually under about 50 grams a day, not by fat itself. Fat simply
          replaces the calories that carbs used to provide. If you eat more fat than your body needs, it burns that dietary fat first.
          To burn stored body fat, you still need a calorie deficit. Some people use a lower-fat, higher-protein version of keto. It can
          still produce ketones if carbs stay low, although very high protein can make ketosis harder for some.
        </P>
        <H3>Should You Worry About Fat on Keto?</H3>
        <P>
          Yes, mostly about the type. Keeping saturated fat in check and getting plenty of unsaturated fat from foods like olive oil,
          nuts and fish is wise. It is also worth having your cholesterol checked after a few months.
        </P>
        <H3>Will High Protein, Moderate Fat and Low Carbs Help You Lose Weight?</H3>
        <P>
          Often, yes. Higher protein is filling and helps preserve muscle, and cutting refined carbs reduces calories for many people. A
          moderate fat intake in the 20-35% range fits this approach well, which makes the calculator a useful guide for it.
        </P>
      </Card>

      <Card title="What Happens on a Low-Fat Diet?">
        <P>
          A moderately low-fat diet, around 20% to 25% of calories, is fine for many people and can be a good fit if you prefer
          carbohydrate-based meals. Problems tend to appear when fat drops well below 20%.
        </P>
        <P>
          At very low levels, you may absorb fat-soluble vitamins poorly, feel hungry sooner, struggle to get enough essential fatty
          acids and notice dry skin or hormone changes. If the missing fat is replaced mostly with refined carbs, triglycerides can rise
          and HDL cholesterol can fall, which cancels out the benefit. Very low-fat diets used for heart disease are structured medical
          programs, not something to try on your own. For most people, the sweet spot is somewhere in the standard range, not below it.
        </P>
      </Card>

      <Card title="How to Reduce Your Fat Intake">
        <P>If your results show you are above your range, small, steady changes work better than cutting fat all at once:</P>
        <List items={[
          ["Swap, don’t just remove.", "Replace saturated fat with unsaturated fat. Use olive or canola oil instead of butter, and choose fish, beans, nuts and poultry more often than fatty red meat."],
          ["Measure your oil.", "A tablespoon is about 14 grams of fat. Pouring by eye often means two or three."],
          ["Change how you cook.", "Bake, grill, steam, roast or air-fry instead of deep-frying."],
          ["Trim and skim.", "Remove visible fat and poultry skin, and drain excess fat from cooked ground meat."],
          ["Read labels", "for saturated fat and “partially hydrogenated.” These are the two numbers to watch most closely."],
          ["Watch the extras.", "Dressings, creamy sauces, cheese, pastries, chips and cookies add up fast."],
          ["Choose dairy thoughtfully.", "Low-fat dairy cuts saturated fat. Full-fat dairy is fine in moderation if you account for it in your saturated fat limit."],
          ["Add volume with plants.", "Vegetables, fruit, whole grains and legumes fill your plate with few fat grams."],
          ["Plan restaurant meals.", "Ask for sauces on the side and choose grilled or baked items."],
        ]} />
      </Card>

      <Card title="Fat Intake and Long-Term Health">
        <P>
          Diet patterns high in saturated fat, trans fat and processed meat are linked with higher LDL cholesterol, heart disease and
          type 2 diabetes. When it comes to cancer, the evidence for fat itself is mixed. The clearest link is with processed meat, which
          the International Agency for Research on Cancer classifies as carcinogenic, and with excess body weight, which raises the risk
          of several cancers. No specific fat target has been proven to prevent cancer. The safest approach is to follow a balanced
          pattern, keep a <Link to="/tools/healthy-weight-calculator" className="inline-home-link">healthy weight</Link> and favor unsaturated fats. If you have a specific health concern, a doctor or registered
          dietitian can give guidance that fits you.
        </P>
        <P>
          Fat recommendations vary a little between countries, but they are similar overall. The U.S. and Canada both use a 20-35% range
          for adults, the European Food Safety Authority uses the same range, and the WHO suggests keeping total fat under 30% and
          saturated fat under 10% of calories.
        </P>
      </Card>

      <Card title="When You’d Need a Daily Fat Intake Calculator">
        <P>A fat intake calculator is most useful when a vague guideline stops being good enough. Common situations include:</P>
        <List items={[
          ["Starting a weight-loss plan.", "You have a calorie target but no idea how to split it, and you want to avoid cutting fat too far."],
          ["After a high cholesterol result.", "Your doctor mentioned limiting saturated fat, and you want a concrete daily number rather than “eat less.”"],
          ["Meal planning and tracking.", "You log food in an app and want to sanity-check the fat targets it assigns, which are often generic."],
          ["Building muscle.", "You need a calorie surplus and want to know how much fat fits alongside your protein and carbohydrate goals."],
          ["Following a structured diet.", "Mediterranean, DASH or heart-healthy plans all emphasize fat quality and saturated fat limits."],
          ["Helping an older relative.", "Energy needs fall with age, and so do sensible fat targets."],
          ["Recalculating after a change.", "You have lost or gained weight, changed jobs or started training, and your old numbers no longer fit."],
        ]} />
      </Card>

      <Card title="Choosing Where to Land in the 20-35% Range">
        <P>
          The calculator returns a range, and the right spot depends on how you eat. Lower-fat patterns, near 20-25%, tend to suit
          people who prefer carbohydrate-heavy meals, such as rice, legumes and fruit, or those who need to limit calories tightly.
          Moderate patterns, around 30%, are common in balanced and Mediterranean-style diets. Higher-fat patterns, near 35%, suit people
          who feel fuller on nuts, dairy, eggs and oils, or who need a lot of calories.
        </P>
        <P>
          Fat, protein and carbohydrate share the same calorie budget, so more fat means less of the others. Whichever you choose,
          consistency over weeks matters more than precision on any single day.
        </P>
        <H3>Vegetarians and Vegans</H3>
        <P>
          The calculator works for any eating style because it is based on calories, not food sources. Plant-based eaters can meet their
          range easily with nuts, seeds, avocado, olive oil, tofu and legumes, and they usually have a lower saturated fat intake to begin
          with. Vegans should make sure they get omega-3s from flaxseed, chia, walnuts or an algae-based source.
        </P>
        <H3>Bodybuilders and Bulking</H3>
        <P>
          Athletes typically aim for about 20% to 30% of calories from fat, set protein by body weight (often around 1.4 to 2.0 grams per
          kilogram), and fill the rest with carbohydrates. If your fat grams end up close to your protein grams while bulking, that is not
          a problem on its own. Fat has more than twice the calories per gram, so what matters is that fat stays within the percentage
          range for your calorie target.
        </P>
      </Card>

      <Card title="How Accurate Is This Fat Intake Calculator?">
        <P>
          The results are estimates, and no online calculator can replace individual assessment. The calorie estimate relies on standard
          equations that predict energy needs from age, gender, height, weight and activity. These formulas are well established and
          usually land within a reasonable margin for healthy adults, but two people with identical inputs can still burn different
          amounts because of muscle mass, genetics and daily movement.
        </P>
        <P>
          The tool is designed for generally healthy adults. It is not suited to pregnancy, breastfeeding, children and teenagers, or
          people with medical conditions such as diabetes, kidney disease, pancreatitis or gallbladder problems. In those cases, a
          registered dietitian or doctor should set the targets. If you have a history of disordered eating, use calorie and macro
          tracking only under professional guidance.
        </P>
        <P>
          For best accuracy, enter your current weight, choose your activity level realistically, and recalculate whenever your weight
          changes by about 10 pounds (5 kg) or your routine shifts.
        </P>
      </Card>

      <Card title="Free, Private and Simple to Use">
        <P>
          The fat intake calculator on Tolz is free to use, with no charges for results. You enter your details, get your numbers, and
          can run it again as often as you like, for yourself or for family members. Your inputs are used to produce the result on the
          page, and you do not need to share anything beyond the basic measurements the calculation requires.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
