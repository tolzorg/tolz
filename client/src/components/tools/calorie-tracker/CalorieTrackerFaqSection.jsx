import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is this calorie calculator?",
    a: "It uses the Mifflin-St Jeor equation, one of the more accurate BMR formulas available for general use, combined with your activity level to estimate TDEE. Results are a strong starting estimate; actual needs can vary slightly by individual and are best fine-tuned based on real progress over a few weeks.",
  },
  {
    q: "How many calories should I eat to lose weight?",
    a: "A moderate deficit of roughly 300–500 calories below your calculated TDEE typically supports steady, sustainable fat loss without excessive muscle loss or energy crashes. This tool calculates your TDEE first so that deficit is based on your actual numbers, not a generic estimate.",
  },
  {
    q: "Is this calorie tracker free to use?",
    a: "Yes. The tool is completely free, with no signup and no hidden charges for any of the results, including BMI, TDEE, macros, and water intake.",
  },
  {
    q: "Do I need to create an account to use this tool?",
    a: "No account or signup is required. You can enter your details and get your results immediately.",
  },
  {
    q: "What's the difference between BMI and TDEE?",
    a: "BMI is a general ratio of weight to height used to categorize weight range, while TDEE estimates the actual number of calories your body burns in a day based on your metabolism and activity level. They measure different things and are most useful when viewed together, which is why this tool calculates both.",
  },
  {
    q: "How is my macro breakdown calculated?",
    a: "Once your daily calorie target is set, the tool splits it into protein, carbohydrate, and fat targets in grams, using standard nutritional ratios suited to general health, fat loss, or muscle gain goals.",
  },
  {
    q: "How much water should I drink per day?",
    a: "Water needs depend on body weight, activity level, and climate. This tool calculates a personalized daily water intake target based on your specific profile rather than a fixed generic recommendation.",
  },
  {
    q: "Will my personal data be stored?",
    a: "No. Your inputs are used only to generate your results in real time and are not stored, sold, or shared.",
  },
  {
    q: "How often should I recalculate my calorie needs?",
    a: "Recalculate every time your weight changes by roughly 5–10 pounds, or whenever your activity level shifts significantly, since TDEE changes as your body weight and training volume change.",
  },
  {
    q: "What's the difference between the Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle formulas?",
    a: "Mifflin-St Jeor and Harris-Benedict both estimate BMR from age, height, and weight, with Mifflin-St Jeor generally considered more accurate for most people. Katch-McArdle instead factors in lean body mass, making it a better option if you know your body fat percentage.",
  },
  {
    q: "How much of a calorie deficit is safe?",
    a: "A daily deficit of around 500 calories, supporting roughly one pound of loss a week, is a commonly recommended starting point. Deficits larger than about 1,000 calories a day are generally discouraged, since they raise the risk of muscle loss and can slow metabolism over time.",
  },
  {
    q: "What is zigzag calorie cycling?",
    a: "It's a method of alternating higher- and lower-calorie days while keeping the same total intake for the week, used to prevent the body from adapting to a flat daily calorie target and to add flexibility around social occasions.",
  },
  {
    q: "What is the lowest number of calories I should eat per day?",
    a: "General health guidance suggests staying above roughly 1,200 calories a day for women and 1,500 for men unless you're under medical supervision, since going lower can leave the body short of what it needs for basic functions.",
  },
  {
    q: "Do all calories affect weight loss the same way?",
    a: "Total calorie balance is what ultimately drives weight change, but food quality still matters — foods that are harder to digest and lower in empty calories tend to support fullness and steadier energy, making a calorie target easier to stick to.",
  },
  {
    q: "How do I know how many calories are in the foods I eat?",
    a: "Most packaged foods list calories per serving on the nutrition label. For whole foods without labels, a quick reference chart of common items — like the one above — combined with a food-tracking app makes it easy to estimate a meal's total without weighing every ingredient.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "How accurate is this calorie calculator?",
    a: "It uses the Mifflin-St Jeor equation, one of the more accurate BMR formulas available for general use, combined with your activity level to estimate TDEE. Results are a strong starting estimate; actual needs can vary slightly by individual and are best fine-tuned based on real progress over a few weeks.",
  },
  {
    q: "How many calories should I eat to lose weight?",
    a: "A moderate deficit of roughly 300-500 calories below your calculated TDEE typically supports steady, sustainable fat loss without excessive muscle loss or energy crashes.",
  },
  {
    q: "Is this calorie tracker free to use?",
    a: "Yes. The tool is completely free, with no signup and no hidden charges for any of the results, including BMI, TDEE, macros, and water intake.",
  },
  {
    q: "Do I need to create an account to use this tool?",
    a: "No account or signup is required. You can enter your details and get your results immediately.",
  },
  {
    q: "What's the difference between BMI and TDEE?",
    a: "BMI is a general ratio of weight to height used to categorize weight range, while TDEE estimates the actual number of calories your body burns in a day based on your metabolism and activity level.",
  },
  {
    q: "How is my macro breakdown calculated?",
    a: "Once your daily calorie target is set, the tool splits it into protein, carbohydrate, and fat targets in grams, using standard nutritional ratios suited to general health, fat loss, or muscle gain goals.",
  },
  {
    q: "How much water should I drink per day?",
    a: "Water needs depend on body weight, activity level, and climate. This tool calculates a personalized daily water intake target based on your specific profile rather than a fixed generic recommendation.",
  },
  {
    q: "Will my personal data be stored?",
    a: "No. Your inputs are used only to generate your results in real time and are not stored, sold, or shared.",
  },
  {
    q: "How often should I recalculate my calorie needs?",
    a: "Recalculate every time your weight changes by roughly 5-10 pounds, or whenever your activity level shifts significantly, since TDEE changes as your body weight and training volume change.",
  },
  {
    q: "What's the difference between the Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle formulas?",
    a: "Mifflin-St Jeor and Harris-Benedict both estimate BMR from age, height, and weight, with Mifflin-St Jeor generally considered more accurate for most people. Katch-McArdle instead factors in lean body mass, making it a better option if you know your body fat percentage.",
  },
  {
    q: "How much of a calorie deficit is safe?",
    a: "A daily deficit of around 500 calories, supporting roughly one pound of loss a week, is a commonly recommended starting point. Deficits larger than about 1,000 calories a day are generally discouraged.",
  },
  {
    q: "What is zigzag calorie cycling?",
    a: "It's a method of alternating higher- and lower-calorie days while keeping the same total intake for the week, used to prevent the body from adapting to a flat daily calorie target.",
  },
  {
    q: "What is the lowest number of calories I should eat per day?",
    a: "General health guidance suggests staying above roughly 1,200 calories a day for women and 1,500 for men unless under medical supervision.",
  },
];

const CALORIES_PER_GRAM_ROWS = [
  ["Fat", "8.8"],
  ["Protein", "4.1"],
  ["Carbohydrates", "4.1"],
  ["Fiber", "1.9"],
  ["Alcohol", "6.9"],
];

const COMMON_FOODS_ROWS = [
  ["Apple", "1 medium (4 oz)", "59"],
  ["Banana", "1 medium (6 oz)", "151"],
  ["Broccoli", "1 cup", "45"],
  ["Carrots", "1 cup", "50"],
  ["Egg", "1 large", "78"],
  ["Chicken breast, cooked", "2 oz", "136"],
  ["Salmon, cooked", "2 oz", "136"],
  ["Tofu", "4 oz", "86"],
  ["White bread", "1 slice (1 oz)", "75"],
  ["Rice, cooked", "1 cup", "206"],
  ["Potato", "6 oz", "130"],
  ["Avocado", "1 medium", "~240"],
  ["Almonds", "1 oz (~23 nuts)", "~165"],
  ["Whole milk", "1 cup", "146"],
  ["Orange juice", "1 cup", "111"],
  ["Regular soda", "1 can", "150"],
  ["Beer", "1 can", "154"],
];

const MEAL_PLAN_ROWS = [
  ["Breakfast", "Bran cereal with milk and a banana", "Greek yogurt with granola and blueberries", "Eggs, buttered toast, banana, and a handful of almonds"],
  ["Lunch", "Grilled cheese with tomato and a side salad", "Chicken and vegetable soup with bread", "Grilled chicken with vegetables and pasta"],
  ["Dinner", "Grilled chicken with brussels sprouts and quinoa", "Steak with mashed potatoes and asparagus", "Grilled salmon with brown rice and green beans"],
  ["Snacks", "Cucumber with avocado dip, or an orange", "Walnuts and an apple, or Greek yogurt with berries", "Peanut butter with crackers, hummus with baby carrots"],
];

const ACTIVITY_CALORIES_ROWS = [
  ["Walking (3.5 mph)", "215", "267", "319"],
  ["Cycling (12–14 mph)", "454", "562", "671"],
  ["Swimming (moderate)", "397", "492", "587"],
  ["Basketball", "340", "422", "503"],
  ["Running (9-min mile)", "624", "773", "923"],
  ["Yard work / gardening", "~200", "~250", "~300"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {cell}
                </td>
              ))}
            </tr>
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
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
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

export default function CalorieTrackerFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out how many calories your body actually needs shouldn't require a nutrition degree or
          five different apps. The calorie calculator on <Link to="/" className="inline-home-link">Tolz</Link>{" "}
          brings your BMI, daily calorie target (TDEE), macronutrient split, water intake, and meal ideas
          together in one free tool, so you get a complete picture of your nutritional needs in a single
          step instead of piecing it together from guesswork.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Calorie Calculator Does</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calorie calculator takes your age, gender, height, weight, and activity level, then runs the
          numbers through established nutrition formulas to give you four connected results: your BMI, your
          total daily energy expenditure (TDEE), a macro breakdown by protein, carbs, and fat, and a
          recommended daily water intake. Instead of using separate tools for each metric, you get an
          integrated view of where you stand and what to adjust, whether your goal is losing fat,
          maintaining your current weight, or building muscle. Because every calculation runs from the same
          input data, the numbers stay consistent with each other, your calorie target and your macro split
          will always match, which isn't always true when you calculate these figures separately across
          different apps.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Your BMI Accurately</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Body Mass Index remains one of the fastest ways to get a general sense of whether your weight
          falls within a typical range for your height. This BMI calculator online uses the standard
          formula, weight in kilograms divided by height in meters squared, and instantly categorizes your
          result as underweight, normal weight, overweight, or obese. BMI isn't a perfect measure on its
          own; it doesn't account for muscle mass, bone density, or body composition, so an athlete with
          significant muscle can show a higher BMI without carrying excess fat. That's precisely why this
          tool pairs your BMI with TDEE and macro data rather than presenting it in isolation. Used
          together, these numbers give a far more useful picture than BMI alone, which is why most credible
          health resources recommend treating BMI as a starting point rather than a final verdict.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>TDEE and Daily Calorie Needs</h2>
        <p style={pStyle}>
          TDEE, or Total Daily Energy Expenditure, is the number that actually answers the question "how
          many calories should I eat a day?" It starts with your Basal Metabolic Rate (BMR), the energy your
          body burns at complete rest just to keep your heart, brain, and organs functioning, and then
          factors in your activity level, from sedentary desk work to intense daily training. This calorie
          calculator estimates BMR using the Mifflin-St Jeor equation, widely regarded as one of the more
          accurate formulas for everyday use compared to older methods like Harris-Benedict. Once your BMR
          is calculated, the tool applies an activity multiplier based on how much you move throughout the
          week, giving you a TDEE figure that represents your maintenance calories, the amount you'd eat to
          keep your current weight stable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          From there, adjusting for a goal becomes straightforward. A moderate calorie deficit below your
          TDEE supports gradual fat loss without the muscle loss and metabolic slowdown that come with
          extreme restriction. A calorie surplus above your TDEE supports weight or muscle gain when paired
          with adequate protein and resistance training. Because crash diets and overly aggressive deficits
          tend to backfire, leading to fatigue, muscle loss, and rebound weight gain, knowing your actual
          TDEE first lets you set a realistic, sustainable target rather than picking an arbitrary calorie
          number off a generic chart.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This Tool Estimates Your BMR</h2>
        <p style={pStyle}>
          There isn't just one accepted way to estimate BMR, and it helps to know where the numbers behind
          this calculator actually come from. The Harris-Benedict formula was one of the first equations
          used to estimate resting energy needs and was updated in 1984 to improve its accuracy, remaining
          the standard reference until the early 1990s. The Mifflin-St Jeor equation replaced it as the more
          widely trusted option, since research has repeatedly found it to be a closer match to measured
          metabolic rates for most people. A third option, the Katch-McArdle formula, takes a different
          approach: instead of relying only on age, height, and weight, it factors in lean body mass, which
          makes it a stronger choice for people who are leaner and already know their body fat percentage.
        </p>
        <p style={pStyle}>
          For general use, this calorie calculator relies on the Mifflin-St Jeor equation, since it offers
          the best balance of accuracy and simplicity for the average person without requiring a body fat
          reading. If you already track your body fat percentage, the Katch-McArdle result can give you a
          slightly sharper estimate, because two people with the same height and weight but different
          amounts of muscle will naturally burn different amounts of energy at rest. Whichever formula is
          used, the output is still an estimate of maintenance calories at rest, before any activity
          multiplier is applied, it's a starting reference point, not a lab-measured number.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once your BMR is set, remember that roughly 3,500 calories is considered equivalent to one pound
          of body weight. That's the basis for the common guideline that cutting about 500 calories a day
          from your maintenance level supports losing around a pound a week. It's worth treating that figure
          as an approximation rather than an exact science, cutting exactly 500 calories won't always
          produce exactly one pound of loss, since individual metabolism, water retention, and activity all
          shift the real-world result. Cutting your intake by more than around 1,000 calories a day is
          generally discouraged, since losing more than about two pounds a week increases the risk of losing
          muscle along with fat, which in turn lowers your BMR and can make the weight harder to keep off
          long-term.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Macro Breakdown: Protein, Carbs, and Fat</h2>
        <p style={pStyle}>
          Total calories only tell part of the story, where those calories come from matters just as much
          for body composition, energy levels, and long-term adherence to a plan. This macro calculator
          function breaks your daily calorie target into protein, carbohydrates, and fat based on standard
          nutritional ratios, giving you gram-level targets rather than vague percentages you'd have to
          calculate yourself. Protein intake is particularly important during a calorie deficit, since
          adequate protein helps preserve lean muscle mass while you lose fat, and it also supports satiety,
          which makes sticking to a lower-calorie diet noticeably easier. Carbohydrates fuel training
          performance and daily energy, while dietary fat supports hormone production and nutrient
          absorption. Rather than treating macros as a rigid rulebook, use the breakdown as a practical
          framework: hit your protein target consistently, and let carbs and fat flex around your remaining
          calories based on your food preferences and training schedule.
        </p>
        <p style={pStyle}>
          Each macronutrient supplies a different amount of energy per gram, which is why swapping fat for
          protein or carbs at the same weight changes your total calorie count. For reference:
        </p>
        <DataTable headers={["Component", "Calories per Gram"]} rows={CALORIES_PER_GRAM_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is also why fattier foods tend to be more calorie-dense than lean or high-fiber ones at the
          same portion size, and why alcohol contributes meaningfully to daily calorie totals even though it
          isn't a traditional macronutrient.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Water Intake Recommendations</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hydration needs vary based on body weight, activity level, and climate, yet water intake is often
          the most overlooked variable in a nutrition plan. This tool calculates a personalized daily water
          intake recommendation alongside your calorie and macro results, since hydration directly affects
          metabolism, digestion, workout performance, and even appetite regulation, mild dehydration is
          frequently mistaken for hunger, which can lead to unnecessary snacking. Rather than relying on the
          generic "eight glasses a day" rule, which doesn't account for individual body size or activity,
          this water intake calculator scales the recommendation to your specific profile, giving you a more
          realistic daily target to work toward.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Personalized Meal Suggestions</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Numbers alone don't fill a plate. Once your calorie and macro targets are calculated, this calorie
          calculator with meal suggestions translates those figures into practical food ideas, giving you a
          starting point for structuring meals that fit your daily targets without needing to build a meal
          plan from scratch. This is especially useful for anyone new to tracking, since translating "1,800
          calories with 140g protein" into an actual day of eating is often the hardest part of getting
          started. The suggestions are meant as a flexible template you can adapt to your own food
          preferences, dietary restrictions, and schedule, rather than a fixed prescription you have to
          follow exactly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Simple Way to Put These Numbers Into Practice</h2>
        <p style={pStyle}>
          Turning your results into actual weight loss comes down to a few practical steps rather than
          anything complicated:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Start with your BMR and TDEE.</strong> Use the figures this calculator gives you as your
            baseline, keeping in mind they're an approximation rather than an exact figure, the real number
            could land a little higher or lower for you personally.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Set a realistic target.</strong> Since roughly 3,500 calories equals about one pound,
            trimming 500 calories a day from your TDEE points toward losing around a pound a week. Keep any
            daily deficit at or below about 1,000 calories, and speak with a doctor or registered dietitian
            before targeting more than two pounds of loss per week.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pick a way to track what you eat.</strong> A phone app, spreadsheet, or notebook all
            work, the method matters less than consistency. Portion sizes are usually the hardest part to
            judge at first, but they get noticeably easier to estimate once you've weighed and logged your
            usual meals a few times.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Review progress weekly, not daily.</strong> Day-to-day weight can swing based on water
            retention, sodium intake, or timing, so weigh yourself under the same conditions (first thing in
            the morning works well) and look at the trend over a full week rather than a single reading.
          </li>
          <li>
            <strong>Adjust as you go.</strong> If your weight isn't moving the way the math suggests it
            should after a couple of weeks, that's a signal to recalculate rather than a reason to cut
            calories further right away.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Counting calories isn't the only path to weight loss, and it isn't the right fit for everyone, but
          it remains one of the more consistently effective approaches because it gives you a concrete,
          measurable target instead of a vague intention to "eat less."
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Zigzag Calorie Cycling: Working Around a Plateau</h2>
        <p style={pStyle}>
          If weight loss stalls even though your intake hasn't changed, it's often because your body has
          adapted to eating the same number of calories every day. Zigzag calorie cycling addresses this by
          varying your daily intake, some higher-calorie days, some lower-calorie days, while keeping the
          same total for the week. For example, someone with a weekly target of 14,000 calories could eat
          2,300 calories on three days and around 1,775 on the other four, rather than a flat 2,000 every
          day. The weekly total stays identical, but the day-to-day variation makes it harder for metabolism
          to settle into a predictable pattern, and it gives you more flexibility to eat more on social
          occasions and less on quieter days.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's no single formula for how to split high and low days, a difference of roughly 200–300
          calories between them is a reasonable starting point, with more active people generally able to
          handle a wider spread. It's a technique worth trying if a straightforward daily deficit has
          stopped producing results, rather than a required part of using this calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Calories Do You Actually Need?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Daily calorie needs vary widely based on age, height, weight, sex, and activity level, which is
          exactly why a one-size-fits-all number isn't very useful. As a general reference, adult men
          typically need somewhere in the range of 2,000–3,000 calories a day to maintain their weight,
          while adult women typically fall in the 1,600–2,400 range, according to U.S. Department of Health
          guidance, though individual needs inside those ranges can differ substantially. Cutting calories
          too aggressively causes the body to conserve energy for essential functions only, at the expense
          of things like energy levels, hormone balance, and general well-being. Health guidance generally
          advises against going below roughly 1,200 calories a day for women or 1,500 for men without
          medical supervision, which is one more reason to treat any deficit as a moderate, sustainable
          adjustment rather than an extreme cut.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Not All Calories Are Equal: Why Food Quality Matters</h2>
        <p style={pStyle}>
          The basic math of calories in versus calories out holds true, but where those calories come from
          still affects hunger, energy, and how sustainable a diet feels. Foods that take more effort to
          chew and digest, vegetables, lean meats, whole grains, cause the body to burn slightly more energy
          processing them and tend to keep you feeling full for longer, while heavily processed foods are
          usually easier to overeat without noticing. Some ingredients, including coffee, tea, chili
          peppers, cinnamon, and ginger, have also been linked to a modest increase in calories burned during
          digestion.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also helps to distinguish between high-calorie foods that are nutritious, like nuts, avocado,
          and whole grains, and empty calories, which supply energy with little nutritional value, such as
          added sugars and heavily refined snacks. Drinks are an easy place for empty calories to add up
          unnoticed, since juice, soda, and sweetened coffee can quietly account for a meaningful share of
          daily intake; choosing water, unsweetened tea, or black coffee more often is a simple way to free
          up calories for actual meals. None of this means certain foods are strictly off-limits, moderation
          and overall dietary balance matter more than treating any single food as good or bad.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calories in Common Foods</h2>
        <p style={pStyle}>
          Having a rough sense of calorie counts for everyday foods makes it much faster to estimate a meal
          without weighing everything. Here's a quick reference for some common items:
        </p>
        <DataTable headers={["Food", "Serving Size", "Calories"]} rows={COMMON_FOODS_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These are approximate values and will vary slightly by brand, preparation method, and exact
          portion, so treat them as a starting point for quick mental math rather than an exact measurement.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sample Meal Plans by Calorie Target</h2>
        <p style={pStyle}>
          If you're not sure what a given calorie target actually looks like on a plate, these simplified
          examples show how breakfast, lunch, and dinner might be structured across three common targets:
        </p>
        <DataTable headers={["Meal", "~1,200 Calorie Plan", "~1,500 Calorie Plan", "~2,000 Calorie Plan"]} rows={MEAL_PLAN_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These are meant purely as a template for portioning meals around a target, not a fixed plan, swap
          in foods you actually enjoy and adjust portions until the totals line up with the numbers this
          calculator gives you.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calories Burned by Common Activities</h2>
        <p style={pStyle}>
          Pairing your calorie target with a sense of what exercise actually costs in calories can make the
          numbers feel more concrete. Approximate calories burned per hour, by body weight:
        </p>
        <DataTable headers={["Activity", "125 lb", "155 lb", "185 lb"]} rows={ACTIVITY_CALORIES_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Heavier body weights burn more calories at the same activity and intensity, since moving more mass
          takes more energy, which is also part of why calorie needs and exercise recommendations aren't
          identical from person to person.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You'd Use This Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are several everyday situations where this calorie tracker becomes genuinely useful rather
          than just informative. Someone starting a weight loss journey needs a realistic calorie deficit
          target instead of guessing a number and hoping it works. Someone trying to build muscle needs to
          know their maintenance calories before calculating an appropriate surplus, since eating too far
          above TDEE just adds unnecessary fat gain alongside muscle. Athletes and active individuals often
          need to recalculate their needs as training volume changes throughout the year, since a heavier
          training block requires meaningfully more fuel than a rest or deload week. People managing health
          conditions where weight monitoring matters, such as those tracking progress alongside a doctor's
          guidance, can use the BMI and TDEE figures as a quick reference point between appointments. Even
          people who already track macros benefit from periodically recalculating their numbers, since TDEE
          shifts as body weight changes, the calorie target that worked at the start of a diet is rarely
          still accurate ten pounds later. In each of these cases, having BMI, TDEE, macros, and hydration
          needs calculated together, from consistent inputs, removes the guesswork and the risk of using
          mismatched numbers from different sources.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and How to Get the Best Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Like any calorie calculator, the output here is an estimate based on validated formulas, not a
          lab-measured metabolic test. Actual calorie needs can vary by a few hundred calories from person
          to person due to genetics, muscle mass, and other individual factors. To get the most accurate
          starting point, enter your current height and weight precisely, select the activity level that
          honestly reflects your typical week rather than your best week, and treat the result as a
          starting target to adjust based on real-world progress. If your weight isn't moving as expected
          after two to three weeks at your calculated intake, that's useful feedback. It means your actual
          TDEE sits slightly above or below the estimate, and the number can be adjusted accordingly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Final Thoughts</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Reliable nutrition planning starts with accurate numbers, and this calorie calculator brings BMI,
          TDEE, macros, and water intake together so you're working from one consistent, personalized data
          set instead of scattered estimates. Whether the goal is fat loss, muscle gain, or simply
          understanding daily calorie needs for the first time, recalculating periodically as your weight
          and activity change will keep your targets aligned with where your body actually is.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
