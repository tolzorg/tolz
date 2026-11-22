import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a macro calculator?",
    a: "A macro calculator estimates how many calories you need each day and splits them into grams of protein, carbohydrates and fat based on your body details, activity level and goal.",
  },
  {
    q: "How do I calculate my macros?",
    a: "Estimate your daily calories from your age, gender, height, weight and activity level. Choose a split for your goal, then convert each percentage to grams by dividing protein and carb calories by 4 and fat calories by 9. A macro calculator does this for you.",
  },
  {
    q: "What are the three main macronutrients?",
    a: "Protein, carbohydrates and fat. They are called macronutrients because the body needs them in large amounts and they provide most of your calories.",
  },
  {
    q: "How much protein do I need per day?",
    a: "The general adult minimum is about 0.8 grams per kilogram of body weight. Active people, people losing weight and people building muscle often do better with 1.2 to 2.2 grams per kilogram.",
  },
  {
    q: "What are the best macros for weight loss?",
    a: "There’s no single best split, but a moderate calorie deficit with higher protein, moderate carbs and moderate fat works well for most people because protein helps with fullness and with keeping muscle.",
  },
  {
    q: "What is the best macro ratio for building muscle?",
    a: "Roughly 40 to 50 percent carbs, 25 to 30 percent protein and 20 to 30 percent fat, with a small calorie surplus and about 1.6 to 2.2 grams of protein per kilogram of body weight.",
  },
  {
    q: "Are macros more important than calories for weight loss?",
    a: "Calories determine whether you lose weight. Macros affect hunger, muscle retention and how sustainable the plan feels, so both matter.",
  },
  {
    q: "Is the low carb goal the same as keto?",
    a: "No. Low carb reduces carbohydrate intake. A ketogenic diet is much stricter and aims to put the body into ketosis. Use the custom option if you want to enter keto percentages.",
  },
  {
    q: "Is alcohol a macronutrient?",
    a: "Alcohol provides about 7 calories per gram, but it isn’t one of the three essential macronutrients. Its calories count toward your daily total, not toward your protein, carb or fat targets.",
  },
  {
    q: "Is starch a macronutrient?",
    a: "No. Starch is a type of carbohydrate, so it counts as carbs.",
  },
  {
    q: "How accurate is a macro calculator?",
    a: "It gives an estimate. Most people land within a reasonable range of their true needs, but individual differences are real. Track your weight and energy for two to four weeks and adjust.",
  },
  {
    q: "How often should I recalculate my macros?",
    a: "Recalculate when your weight changes noticeably, your activity level shifts or your goal changes. Every four to eight weeks is a sensible habit during active weight change.",
  },
];

// The supplied FAQ schema is the displayed text with straight apostrophes,
// except for two answers worded slightly differently there.
const FAQ_SCHEMA_OVERRIDES = {
  "What are the best macros for weight loss?": "There is no single best split, but a moderate calorie deficit with higher protein, moderate carbs and moderate fat works well for most people because protein helps with fullness and with keeping muscle.",
  "Is alcohol a macronutrient?": "Alcohol provides about 7 calories per gram, but it is not one of the three essential macronutrients. Its calories count toward your daily total, not toward your protein, carb or fat targets.",
};
const straight = (s) => s.replace(/’/g, "'");

const AGE_HEADERS = ["Age group", "Protein", "Carbohydrates", "Fat"];
const AGE_ROWS = [
  ["1 to 3 years", "5% to 20%", "45% to 65%", "30% to 40%"],
  ["4 to 18 years", "10% to 30%", "45% to 65%", "25% to 35%"],
  ["19 years and older", "10% to 35%", "45% to 65%", "20% to 35%"],
];
const FOOD_HEADERS = ["Food", "Serving", "Protein", "Carbs", "Fat"];
const FOOD_ROWS = [
  ["Chicken breast, cooked", "3 oz", "26 g", "0 g", "3 g"],
  ["Egg", "1 large", "6 g", "0.5 g", "5 g"],
  ["Salmon, cooked", "3 oz", "22 g", "0 g", "10 g"],
  ["Greek yogurt, plain nonfat", "1 cup", "23 g", "9 g", "1 g"],
  ["Lentils, cooked", "1 cup", "18 g", "40 g", "1 g"],
  ["White rice, cooked", "1 cup", "4 g", "45 g", "0.5 g"],
  ["Oats, dry", "1/2 cup", "5 g", "27 g", "3 g"],
  ["Banana", "1 medium", "1 g", "27 g", "0.4 g"],
  ["Broccoli, raw", "1 cup", "2.6 g", "6 g", "0.3 g"],
  ["Whole milk", "1 cup", "8 g", "12 g", "8 g"],
  ["Almonds", "1 oz", "6 g", "6 g", "14 g"],
  ["Olive oil", "1 tbsp", "0 g", "0 g", "14 g"],
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
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 420 }}>
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

export default function MacroCalculatorFaqSection() {
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

      <Card title="What This Macro Calculator Does and What You Get">
        <P>
          Macros, short for macronutrients, are the three nutrients that supply most of your calories: protein, carbohydrates and
          fat. Calories tell you how much you eat. Macros tell you what that food is made of. Two people can eat 2,000 calories a day
          and get very different results depending on how those calories are split.
        </P>
        <P>
          This macro calculator estimates your daily energy needs and then divides them into gram targets. Along with protein, carbs
          and fat, it shows a daily guide for sugar and saturated fat, the two numbers most people overlook when they only track the
          big three. Each result comes with a healthy range instead of one rigid figure, because real eating is never exactly the
          same from day to day and a range is easier to live with.
        </P>
        <P>
          Use the results as a nutrition target for meal planning, as a reference when you log food in a tracking app, or as a quick
          check on a diet you already follow.
        </P>
      </Card>

      <Card title="How to Use the Macro Calculator Step by Step">
        <P>The daily macro calculator asks only for details that actually change your numbers:</P>
        <List items={[
          ["Age and gender:", "both affect how fast your body burns energy at rest."],
          ["Height and weight:", "larger bodies need more energy, so these have the biggest effect on your calorie total."],
          ["Activity level:", "choose the option that matches a typical week, not your best week. Overstating activity is the most common reason results come out too high."],
          ["Goal:", "pick balanced, low fat, low carb, high protein or your own custom plan."],
        ]} />
        <P>
          Enter your details, select a goal and calculate. You’ll see your daily calories and your grams of protein, carbs and fat.
          If your weight, routine or goal changes, run the macro calculator again. Your targets should move with you, especially
          after a few pounds of weight change or a switch from desk work to a physical job.
        </P>
      </Card>

      <Card title="What Are Macronutrients, and Why Are They Called Macros?">
        <P>
          Macronutrients are the nutrients your body needs in large amounts, measured in grams rather than milligrams. The prefix
          “macro” simply means large. The three primary macronutrients in the human diet are protein, carbohydrates and fat. Some
          textbooks also count water, and alcohol supplies calories too, but nutrition and fitness tracking focuses on the first
          three. That is what a macro calculator measures.
        </P>
        <P>Each one does a different job:</P>
        <List items={[
          ["Protein", "is built from amino acids. Your body uses it to build and repair muscle, skin, enzymes and hormones. Nine of those amino acids are “essential,” meaning your body can’t make them and you have to get them from food."],
          ["Carbohydrates", "are your body’s main and fastest fuel. Your brain, red blood cells and working muscles rely heavily on glucose, which comes from carbs."],
          ["Fat", "stores energy, protects organs, helps your body absorb vitamins A, D, E and K, and plays a part in hormone production and cell structure."],
        ]} />
        <H3>Protein, Carbs, Fat, Glucose, Fiber and Calories: How They Differ</H3>
        <P>
          These terms get mixed up often, so here is how they relate. Protein, carbohydrates and fat are nutrient groups. Glucose is
          one specific simple sugar, and it’s the form of carbohydrate your blood carries to your cells. Fiber is a carbohydrate your
          body can’t fully digest, so it adds little energy but helps digestion, fullness and blood sugar control. A calorie is not a
          nutrient at all. It is a unit of energy, and the three macros are how food delivers it.
        </P>
        <P>
          Starch is a common point of confusion. Starch is not a separate macronutrient. It is a complex carbohydrate made of many
          glucose units linked together, found in potatoes, rice, bread, corn and beans, and it counts as carbs in your macro totals.
        </P>
      </Card>

      <Card title="Macronutrients vs. Micronutrients">
        <P>
          The difference is amount, not importance. You need macronutrients in large daily quantities, often hundreds of grams in
          total. Micronutrients are vitamins and minerals such as vitamin C, iron, zinc, calcium and iodine, and you need them in tiny
          amounts, from a few micrograms to a few hundred milligrams a day.
        </P>
        <P>
          Macros supply energy. Micronutrients don’t supply calories, but they run the chemical reactions that let your body use that
          energy, carry oxygen and keep your bones, nerves and immune system working. A macro calculator doesn’t track vitamins and
          minerals, so a plan that hits every macro target can still fall short on micronutrients if it leans on processed food.
          Eating a variety of vegetables, fruit, legumes, whole grains and protein foods covers most of that gap.
        </P>
      </Card>

      <Card title="Calories From Protein, Carbs, Fat and Alcohol">
        <P>
          Not all calories come packaged the same way. Protein and carbohydrates each provide about 4 calories per gram. Fat provides
          about 9, which is why oils and nuts are so calorie dense. Alcohol provides about 7 calories per gram, which makes it a source
          of energy even though it is not an essential nutrient. Alcohol doesn’t count toward protein, carb or fat targets, but its
          calories still count toward your daily total. A few drinks can quietly take 300 to 500 calories out of your budget.
        </P>
        <P>
          The calories also behave differently. Protein takes more energy to digest and is the most filling. Carbs digest quickly and
          refill muscle fuel. Fat digests slowly and carries flavor and fat-soluble vitamins. So the source of your calories shapes
          hunger, energy and body composition, even when the total is the same.
        </P>
      </Card>

      <Card title="Choosing a Goal: Balanced, Low Fat, Low Carb, High Protein or Custom">
        <P>
          The goal setting is where a good macro calculator earns its keep, because the same calorie total can be split in several
          valid ways.
        </P>
        <List items={[
          ["Balanced", "spreads calories across all three macros in proportions close to mainstream dietary guidance. It suits most people who want steady energy, regular meals and no foods ruled out."],
          ["Low fat", "shifts more calories toward carbohydrates and protein. People choose it when they’ve been advised to reduce fat intake, or when they simply feel better eating more starches, fruit and grains."],
          ["Low carb", "lowers carbohydrate grams and raises protein and fat. It appeals to people who feel fuller on eggs, meat, fish, nuts and dairy, or who want to cut back on refined starches and sweets. Low carb here means reduced, not zero."],
          ["High protein", "raises protein above the standard share. This is a popular setting for people who lift weights, want to protect muscle while dieting, or find that protein keeps hunger under control."],
          ["Custom", "lets you set your own split. If a dietitian or coach has given you specific percentages, enter them and the macro calculator converts them into daily grams."],
        ]} />
        <P>
          There is no single best ratio. The best split is the one you can follow consistently for months. Try a goal for two to three
          weeks and adjust based on hunger, energy and progress.
        </P>
      </Card>

      <Card title="How Daily Macros Are Calculated">
        <P>
          Understanding the math helps you trust the output and spot when something looks off. Every macro calculator follows the
          same three stages.
        </P>
        <Lead lead="Stage one: basal metabolic rate (BMR).">
          This is the energy your body uses at rest to keep you alive. It is estimated from age, gender, height and weight using a
          published prediction equation. The Mifflin-St Jeor equation is the most widely used in current practice. Another equation,
          Katch-McArdle, uses lean body mass and works best for people who know their body fat percentage. Because this macro
          calculator asks for the basics only, it doesn’t require a body fat measurement.
        </Lead>
        <Lead lead="Stage two: total daily energy expenditure (TDEE).">
          Your BMR is multiplied by an activity factor, from mostly sedentary through very active. The result is roughly how many
          calories you burn in a typical day. Eating at that level maintains your weight. Eating below it creates a deficit, and
          eating above it creates a surplus. For reference, the Dietary Guidelines estimate that adult women need roughly 1,600 to
          2,400 calories a day and adult men roughly 2,000 to 3,000, depending on age and activity.
        </Lead>
        <Lead lead="Stage three: splitting calories into grams.">
          Once your calorie target and percentage split are set, grams follow directly. For example, on 2,000 calories with a 40
          percent carb, 30 percent protein and 30 percent fat split:
        </Lead>
        <List items={[
          ["Carbs:", "800 calories divided by 4 gives 200 g"],
          ["Protein:", "600 calories divided by 4 gives 150 g"],
          ["Fat:", "600 calories divided by 9 gives about 67 g"],
        ]} />
        <P>That’s why fat grams always look smaller than carb grams even when the calorie share is similar.</P>
        <H3>Where the Daily Recommendations Come From</H3>
        <P>
          The percentages used for macros are not arbitrary. In the United States, the National Academies set Dietary Reference
          Intakes by reviewing large bodies of research. The protein recommendation of 0.8 grams per kilogram of body weight came from
          nitrogen balance studies, which measure how much protein the body needs to avoid losing muscle. The minimum carbohydrate
          needed of 130 grams a day reflects how much glucose the brain uses. The percentage ranges for each macro, called Acceptable
          Macronutrient Distribution Ranges, are based on research linking intake patterns to chronic disease risk. The Dietary
          Guidelines for Americans, updated by the USDA and HHS about every five years, turn that science into practical advice.
        </P>
      </Card>

      <Card title="Daily Macro Ranges by Age">
        <P>
          Ranges shift with age because growing children need more fat for brain and body development. These are the standard
          distribution ranges, shown as a percentage of daily calories:
        </P>
        <DataTable headers={AGE_HEADERS} rows={AGE_ROWS} />
        <P>
          Fiber needs follow calories at about 14 grams per 1,000 calories. For most adults that works out to roughly 25 grams a day
          for women and 38 grams for men. Added sugar and saturated fat each have their own limits, covered below.
        </P>
      </Card>

      <Card title="Are Macros More Important Than Calories for Losing Weight?">
        <P>
          Calories decide whether you lose weight. Macros decide how that weight loss feels and what you lose. If you eat fewer
          calories than you burn, you will lose weight on almost any macro split. But two people in the same deficit can end up with
          different results. The one eating enough protein tends to keep more muscle, feel less hungry and have an easier time
          sticking with the plan. The one eating very little protein often loses muscle along with fat and feels hungrier.
        </P>
        <P>
          So don’t think of it as macros versus calories. Calories set the direction, and macros shape the quality of the result. A
          macro calculator handles both: it sets the calorie total first and then divides it so protein, carbs and fat all land in a
          sensible range.
        </P>
      </Card>

      <Card title="What Is the Best Macro Ratio for Building Muscle?">
        <P>
          For most people, a muscle-building split lands around 40 to 50 percent carbs, 25 to 30 percent protein and 20 to 30 percent
          fat. Protein is the number that matters most, and it’s usually best set by body weight rather than by percentage. Research
          on resistance training suggests about 1.6 to 2.2 grams of protein per kilogram of body weight per day covers most people’s
          needs, and going beyond that adds little.
        </P>
        <P>
          Carbs deserve attention too. They fuel hard training sessions and help refill muscle glycogen. Fat should not drop too low,
          because it supports hormone production and helps you absorb fat-soluble vitamins.
        </P>
        <H3>How to Calculate Macros to Gain Muscle</H3>
        <List ordered items={[
          ["Find your maintenance calories.", "The macro calculator estimates this from your body details and activity level."],
          ["Add a small surplus.", "About 200 to 300 calories above maintenance supports muscle growth while limiting fat gain."],
          ["Set protein by body weight.", "An 80 kg (176 lb) lifter would aim for roughly 128 to 176 grams of protein a day."],
          ["Set fat.", "About 20 to 30 percent of calories is a good range."],
          ["Let carbs fill the rest.", "Subtract protein and fat calories from your total and divide what’s left by 4."],
        ]} />
        <P>
          For example, on 2,800 calories with 150 g of protein (600 calories) and 25 percent fat (700 calories, about 78 g), the
          remaining 1,500 calories gives you about 375 g of carbs.
        </P>
        <H3>How to Eat for Lean Muscle</H3>
        <P>
          Spread protein across three or four meals, with roughly 25 to 40 grams each. Eat some carbs and protein in the hours around
          training. Choose whole food sources most of the time: eggs, poultry, fish, dairy, beans, tofu, rice, potatoes, oats and
          fruit. Keep the surplus small. A large surplus mostly adds body fat, not muscle. Weigh yourself weekly, and if your weight
          isn’t moving after two to three weeks, raise calories by 100 to 150.
        </P>
      </Card>

      <Card title="Macro Ratio for an Active but Not Athletic Person">
        <P>
          If you walk daily, work out a few times a week and are not training for a competition, you don’t need an athlete’s plan.
          The balanced setting is usually the right fit: around 45 to 50 percent carbs, 20 to 25 percent protein and 25 to 30 percent
          fat. Protein of about 1.2 to 1.6 grams per kilogram of body weight supports an active lifestyle well. Choose the activity
          level in the macro calculator that matches your real weekly routine and you’ll get a sensible number without much tuning.
        </P>
      </Card>

      <Card title="Macros for Weight Loss and Maintenance">
        <Lead lead="Weight loss.">
          Fat loss requires eating below your TDEE. A moderate deficit of about 300 to 500 calories a day is a common starting point
          and usually produces steady loss without extreme hunger. A deficit larger than that tends to cost muscle and be harder to
          keep up. The high protein or balanced setting is usually the most practical place to start.
        </Lead>
        <Lead lead="Maintenance.">
          If you’re happy with your weight, use your calculated TDEE as the calorie baseline and the balanced setting for the split.
          The macro calculator then works as a steady reference instead of a diet.
        </Lead>
        <P>
          In both cases, treat the first result as a starting estimate. Track your weight and energy for two to four weeks, then
          adjust calories by 100 to 200 if progress stalls.
        </P>
      </Card>

      <Card title="Macros for Specific Diets">
        <H3>Keto</H3>
        <P>
          A ketogenic diet is high in fat, moderate in protein and very low in carbs. The main macronutrient in keto is fat, typically
          around 70 to 75 percent of calories, with protein at about 20 percent and carbs at 5 to 10 percent, often 20 to 50 grams a
          day. The calculator’s low carb goal is a reduced-carb plan, not a strict keto plan. If a clinician or coach has recommended
          keto, use the custom option and enter your own percentages.
        </P>
        <H3>Paleo</H3>
        <P>
          Paleo has no official ratio, since it is defined by food choices (meat, fish, eggs, vegetables, fruit, nuts and seeds)
          rather than numbers. Commonly cited ranges are about 25 to 40 percent carbs, 20 to 35 percent protein and 30 to 45 percent
          fat. Because paleo skips grains, dairy and legumes, the custom setting is the best fit if you want to match those numbers.
        </P>
        <H3>Vegan</H3>
        <P>
          A vegan diet can fit any macro goal, but protein needs more planning. Good sources include lentils, chickpeas, beans, tofu,
          tempeh, seitan, edamame, quinoa, nuts and seeds. Aim toward the upper half of the protein range and include a variety of
          sources through the day. Vegan eaters also need to watch micronutrients, especially vitamin B12, which a macro calculator
          doesn’t track.
        </P>
        <H3>Diabetes and Blood Sugar</H3>
        <P>
          Carbohydrates have the largest direct effect on blood sugar, while protein and fat have smaller effects. For that reason,
          the amount, type and timing of carbs matter most. Fiber-rich carbs such as beans, vegetables, oats and whole grains raise
          blood sugar more slowly than refined starches and sweet drinks. There is no single ideal split for everyone with diabetes,
          and needs differ with medication and type of diabetes. Use the calculator’s numbers as a general reference and work with
          your doctor or dietitian to set targets that fit your treatment.
        </P>
      </Card>

      <Card title="Why Tracking Your Macros Is Helpful">
        <P>
          Most people misjudge portions, and protein is the number people miss most often. Tracking for even a few weeks shows you
          where your calories actually come from, whether you’re getting enough protein and how much sugar sneaks in through drinks
          and sauces. It gives you data to adjust with instead of guessing.
        </P>
        <P>
          Tracking is a tool, not a requirement. Many people track for a month or two, learn their typical portions and then eat by
          habit with occasional check-ins. If counting makes you anxious or obsessive about food, or if you have a history of
          disordered eating, skip it and talk to a professional instead.
        </P>
      </Card>

      <Card title="How to Count Macros">
        <List ordered items={[
          ["Get your targets.", "Use the macro calculator for your daily grams of protein, carbs and fat."],
          ["Pick a tracking method.", "A food tracking app works for most people. A notebook and a food scale work too."],
          ["Weigh or measure food.", "Use a kitchen scale for the first couple of weeks so your eye learns what a portion looks like."],
          ["Read labels.", "Nutrition labels list grams of protein, total carbohydrate and total fat per serving. Check the serving size, since it’s often smaller than what you actually eat."],
          ["Log everything,", "including cooking oil, sauces, drinks and snacks."],
          ["Start with protein.", "Hit your protein target first, then let carbs and fat fill the remaining calories."],
          ["Check weekly averages.", "Judge progress across seven days, not one meal."],
        ]} />
        <P>If you only have calories listed for a food, you can estimate: protein and carb grams times 4, fat grams times 9.</P>
      </Card>

      <Card title="Macronutrient-Friendly Fast Food">
        <P>
          You can fit fast food into your macros if you plan ahead. Most major chains publish full nutrition information online, so
          look up your meal before you order. Some easy choices:
        </P>
        <List items={[
          ["", "Grilled chicken sandwiches or wraps instead of fried"],
          ["", "Burrito bowls with chicken or beans, rice, vegetables and salsa"],
          ["", "Salads with grilled protein, with dressing on the side"],
          ["", "Egg-based breakfast sandwiches"],
          ["", "Chili, or plain baked potatoes with a protein topping"],
          ["", "Yogurt cups, fruit and small side salads instead of fries"],
        ]} />
        <P>
          Fried foods, creamy sauces, large sodas and shakes push fat and sugar up quickly. Swapping a sugary drink for water or a
          zero-calorie option is the easiest macro adjustment you can make.
        </P>
      </Card>

      <Card title="Macros in Common Foods">
        <P>These approximate values help you build meals around your targets. Exact numbers vary by brand and preparation.</P>
        <DataTable headers={FOOD_HEADERS} rows={FOOD_ROWS} />
        <H3>Healthier and Less Healthy Protein Sources</H3>
        <P>
          Protein quality depends on what comes with it. Fish, skinless poultry, lean cuts of beef and pork, eggs, low-fat dairy, soy,
          beans and nuts give you protein with fewer downsides. Processed meats like sausage and deli meat, fried meats, sweetened
          yogurts and many processed protein bars deliver protein along with extra sodium, saturated fat or added sugar.
        </P>
      </Card>

      <Card title="Sugar and Saturated Fat: Why the Calculator Shows Them">
        <P>Most basic calculators stop at protein, carbs and fat, but two sub-nutrients deserve their own targets.</P>
        <Lead lead="Sugar.">
          The <Ext href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">World Health Organization</Ext> recommends
          keeping free sugars below 10 percent of total daily calories, with added benefit from going below 5 percent. On a
          2,000-calorie day, 10 percent is 200 calories, or 50 grams. This limit applies to added sugars and sugars in juices, honey
          and syrups, not the sugar naturally present in whole fruit or plain milk.
        </Lead>
        <Lead lead="Saturated fat.">
          The <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans</Ext> advise keeping saturated fat
          under 10 percent of calories and replacing it with unsaturated fats where possible. On 2,000 calories, that’s about 22
          grams. The American Heart Association recommends a lower target of 5 to 6 percent for people who need to lower LDL
          cholesterol. Trans fats should be avoided as much as possible.
        </Lead>
        <H3>Types of Fat and Carbs</H3>
        <P>
          Not every gram is equal. Among fats, monounsaturated and polyunsaturated fats (olive oil, nuts, seeds, fatty fish) are the
          better choices, while saturated fat (butter, fatty meat, full-fat cheese) should stay limited. Among carbs, those from
          vegetables, fruit, beans and whole grains come with fiber and nutrients. Carbs from sweet drinks, candy and pastries mostly
          add sugar and calories.
        </P>
        <H3>What Happens If You Cut Out Sugar?</H3>
        <P>
          Cutting added sugar is generally safe and often helpful. Your body makes the glucose it needs from other carbs, so you don’t
          need added sugar. In the first week or two, some people notice cravings, irritability or low energy while their taste
          adjusts. Cutting sugar only helps if you don’t replace it with large amounts of refined starch or extra calories elsewhere.
          Keep in mind that honey and syrup are still added sugars, even though they’re less processed than white sugar. Whole fruit
          is fine for most people, since it comes with fiber, water and nutrients.
        </P>
      </Card>

      <Card title="Meal Timing, Breakfast and Energy">
        <P>
          No single macro mix is best for breakfast, but a few patterns work well. Meals with protein and fiber-rich carbs keep you
          full and your energy steady longer than a meal of mostly simple sugars, which can lead to a spike and a crash. Eggs with
          whole-grain toast and fruit, or oatmeal with yogurt and nuts, are balanced examples. If you train early, a lighter
          carb-focused snack beforehand may feel better than a heavy high-fat meal.
        </P>
        <H3>Carbs or Fat for Energy?</H3>
        <P>
          Neither is better overall. Carbs are the fastest fuel and work best for high-intensity exercise and quick energy. Fat is a
          slower, steadier fuel and supports long, low-intensity activity. Your body uses both all the time. For most people, a mix of
          both based on their goal and food preferences works best.
        </P>
      </Card>

      <Card title="When You Would Need a Macro Calculator">
        <P>
          People reach for a macro calculator in very different situations, and each benefits from a slightly different reading of
          the results:
        </P>
        <List items={[
          ["Starting a fat loss phase:", "you want to know how much to eat and how much protein to keep muscle on, without guessing."],
          ["Beginning a gym routine:", "new lifters often under-eat protein simply because they’ve never measured it."],
          ["Switching to low carb or high protein eating:", "the tool shows how many grams of carbs or protein actually fit your body."],
          ["Meal prepping:", "gram targets make it easy to portion batch-cooked meals across the week."],
          ["Following medical or coach guidance:", "a custom split converts a recommended percentage into daily grams."],
          ["Breaking a plateau:", "when progress stalls, recalculating after a weight change often shows your old targets no longer match your body."],
        ]} />
        <P>
          If you have a medical condition such as diabetes, kidney disease or a history of disordered eating, use the figures only as
          a starting point for a conversation with your doctor or dietitian.
        </P>
      </Card>

      <Card title="Is This Macro Calculator Free, Private and Accurate?">
        <P>
          Yes, the macro calculator on Tolz is free to use. It asks only for the details needed to calculate your targets: age,
          gender, height, weight, activity level and goal. It does not ask for your name, email or medical records.
        </P>
        <P>
          On accuracy, be realistic. Prediction equations estimate energy needs for the average person with a similar profile, and
          real needs can differ by several hundred calories because of muscle mass, genetics, sleep, medications and daily movement.
          That’s why the results work best as a well-informed starting point that you refine with your own weight and energy data.
          The numbers are general nutrition information, not medical advice.
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
