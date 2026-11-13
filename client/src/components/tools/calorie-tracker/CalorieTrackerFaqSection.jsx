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
    a: "A moderate deficit of roughly 300–500 calories below your calculated TDEE typically supports steady, sustainable fat loss without excessive muscle loss or energy crashes. This tool calculates your TDEE first so that the deficit is based on your actual numbers, not a generic estimate.",
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
    a: "Total calorie balance is what ultimately drives weight change, but food quality still matters. Foods that are harder to digest and lower in empty calories tend to support fullness and steadier energy, making a calorie target easier to stick to.",
  },
  {
    q: "How do I know how many calories are in the foods I eat?",
    a: "Most packaged foods list calories per serving on the nutrition label. For whole foods without labels, a quick reference chart of common items, like the one above, combined with a food-tracking app makes it easy to estimate a meal's total without weighing every ingredient.",
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

const PAG_URL = "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines";

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const last = { ...pStyle, marginBottom: 0 };
const firstH3 = { ...h3Style, marginTop: 0 };
const cardStyle = { padding: "20px 20px" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* Counting basics */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calorie Counting Basics</h2>
        <h3 style={firstH3}>Are calorie trackers good?</h3>
        <p style={pStyle}>
          For most people, yes. Research on behavioral weight loss has repeatedly found that self-monitoring of food
          intake is one of the strongest predictors of success (
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/?term=Burke+self-monitoring+dietary+intake+systematic+review">
            Burke et al., Journal of the American Dietetic Association
          </Ext>
          ). A tracker turns vague impressions ("I barely ate today") into numbers you can act on. The limits are
          accuracy and mindset. People tend to underreport intake, and database entries can be wrong. If you have ever
          had an eating disorder, or tracking makes you anxious, talk to a clinician before starting. In the US, the
          National Alliance for Eating Disorders helpline is a good support option.
        </p>
        <h3 style={h3Style}>Do calorie trackers usually include your basal metabolic rate?</h3>
        <p style={pStyle}>
          Most do, usually behind the scenes. A good tracker, including the Tolz calculator, estimates your BMR from age,
          sex, height and weight, multiplies it by an activity factor to get your total daily energy expenditure
          (TDEE), and then subtracts or adds calories for your goal. The most common mistake is double counting. If your
          daily target already includes an activity multiplier, logging every workout on top of it overstates how much
          you can eat. Choose one approach and keep it consistent. Wearables usually report "active" calories (movement
          only) and "total" calories (BMR plus movement), so check which number your app is using.
        </p>
        <h3 style={h3Style}>Do I have to include everything I eat on my calorie tracker?</h3>
        <p style={pStyle}>
          To get reliable data, yes. Cooking oil, sauces, coffee creamer, a handful of nuts and weekend drinks are the
          entries most often skipped, and they can add several hundred calories a day. Water, plain black coffee and
          plain tea can be ignored. If you can't weigh or measure something, log your best estimate rather than leaving a
          gap. An approximate entry is far more useful than a blank one, and your weekly average will smooth out the
          errors.
        </p>
        <h3 style={h3Style}>What are some tips on starting to count calories?</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Find your baseline first.</strong> Use the calculator above to estimate your TDEE, then log honestly
            for 1 to 2 weeks before changing anything.
          </li>
          <li style={liStyle}>
            <strong>Use a kitchen scale.</strong> Weighing portions is more accurate than measuring cups or eyeballing.
          </li>
          <li style={liStyle}>
            <strong>Log as you eat.</strong> Entering meals later in the day leads to forgotten items.
          </li>
          <li style={liStyle}>
            <strong>Pick verified entries.</strong> Prefer barcode scans and entries labeled "verified". Packaged-food
            labels are allowed a margin of error of up to 20% under{" "}
            <Ext href="https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label">FDA rules</Ext>
            , so treat all counts as estimates.
          </li>
          <li style={liStyle}>
            <strong>Judge by trends.</strong> Compare weekly average weight and intake, not single days.
          </li>
          <li>
            <strong>Plan ahead.</strong> Pre-logging tomorrow's meals makes it easier to stay on target.
          </li>
        </ul>
        <h3 style={h3Style}>Do you believe counting calories every day is the best way to lose weight?</h3>
        <p style={pStyle}>
          It's one of the best-supported methods, but not the only one, and not the best for everyone. Counting works
          because it forces awareness of portions and makes a calorie deficit measurable. It works poorly if it becomes
          obsessive or unsustainable. The best method is the one you can follow for months. Some people count strictly,
          some count for a few weeks to calibrate their portions and then ease off, and some use simpler structures like
          the plate method (see the alternatives section below). Long-term consistency matters more than daily
          precision.
        </p>
        <h3 style={h3Style}>Is losing weight just "calories in, calories out"? How relevant are calories?</h3>
        <p style={pStyle}>
          Calories are the foundation: to lose fat you must consume less energy than you expend over time. That is
          thermodynamics, and it holds in every controlled feeding study. But the two sides are not independent. Eating
          less can lower your non-exercise movement and resting metabolism slightly, protein burns more calories during
          digestion than fat or carbohydrate, and food type changes hunger. In a tightly controlled NIH study, people
          eating ultra-processed diets consumed roughly 500 more calories a day than when eating minimally processed
          food. So calories are the mechanism, while food quality, sleep and protein influence how easy it is to hit
          your number.
        </p>
        <h3 style={h3Style}>Calorie counting sucks. Does anyone have a better way to lose weight?</h3>
        <p style={pStyle}>You have options if tracking isn't working for you:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Plate method:</strong> half the plate vegetables, a quarter lean protein, a quarter whole-grain or
            starchy carbohydrate.
          </li>
          <li style={liStyle}><strong>Protein and fiber at every meal</strong> to improve fullness.</li>
          <li style={liStyle}>
            <strong>Habit-based changes:</strong> cut liquid calories, keep fixed meal times, and serve smaller portions.
          </li>
          <li style={liStyle}>
            <strong>Step and strength goals</strong> that raise your expenditure without food logging.
          </li>
          <li style={liStyle}>
            <strong>Short tracking phases:</strong> count for two weeks every few months to recalibrate.
          </li>
          <li>
            <strong>Medical options:</strong> if you have obesity or weight-related conditions, ask your doctor about
            prescription treatments such as GLP-1 medications. These are decided with a clinician, not self-prescribed.
          </li>
        </ul>
        <p style={pStyle}>
          Whatever you choose, track one outcome (weekly average weight or waist measurement) so you know whether it is
          working.
        </p>
        <h3 style={h3Style}>Will I be able to lose weight with just counting calories and not worrying about carbs?</h3>
        <p style={pStyle}>
          Yes. Calorie balance drives weight change. A large randomized trial of low-fat versus low-carb diets found no
          significant difference in 12-month weight loss between them. What matters is adherence. Carbs can still affect
          your experience: refined carbohydrates may leave you hungrier, while fiber-rich carbohydrates keep you full. If
          you have diabetes or prediabetes, carbohydrate quality and timing matter more, so follow your healthcare team's
          advice.
        </p>
        <h3 style={h3Style}>Is 2,900 calories a day too much?</h3>
        <p style={pStyle}>
          It depends entirely on your TDEE. For a tall, active young man, 2,900 calories is often a maintenance level.
          The <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans</Ext> estimate that active
          adult men may need roughly 2,600 to 3,000 calories a day, while many women need 2,000 to 2,400. For a smaller or
          sedentary person, 2,900 would be a surplus that gradually adds weight. Enter your details in the calculator
          above, compare the result to 2,900, and adjust.
        </p>
        <h3 style={h3Style}>How much weight can I lose by eating 500 calories a day?</h3>
        <p style={last}>
          On paper, someone with a TDEE of 2,200 would have a 1,700-calorie daily deficit, which the old "3,500 calories
          per pound" rule predicts as about 3.5 pounds a week. In reality, loss is slower because your body adapts, and a
          big portion of early loss is water and lean mass. Eating 500 calories a day is a very-low-calorie diet. It
          carries risks of nutrient deficiency, gallstones, muscle loss, dizziness and rebound weight gain, and should
          only be done under medical supervision. For safe deficit sizes and minimum intake guidance, see the safety FAQs
          further down this page.
        </p>
      </div>

      {/* Calories burned */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Calories Do You Burn?</h2>
        <p style={pStyle}>
          All estimates below use a 70 kg (155 lb) adult and standard MET values from the{" "}
          <Ext href="https://pacompendium.com/">Compendium of Physical Activities</Ext>. Heavier people burn more,
          lighter people burn less, and individual variation is roughly ±15 to 20%. Treat these as ballparks.
        </p>
        <h3 style={h3Style}>How many "active calories" should an individual burn in a day?</h3>
        <p style={pStyle}>
          There is no universal target. Active calories are those burned through movement beyond your resting
          metabolism. Many moderately active adults land between 300 and 600 a day. The{" "}
          <Ext href={PAG_URL}>Physical Activity Guidelines for Americans</Ext> recommend at least 150 minutes of moderate
          activity weekly plus two days of strength training, which works out to roughly 100 to 150 active calories per
          day at the minimum. Set your goal by behavior (steps, workout minutes) rather than a calorie number your watch
          estimates.
        </p>
        <h3 style={h3Style}>How many calories does an inactive person burn in a day?</h3>
        <p style={pStyle}>
          Most of the energy you burn comes from just staying alive. A sedentary adult typically burns about 1,500 to
          2,200 calories a day, depending on size, sex and age. This is your BMR multiplied by about 1.2 for minimal
          movement. Your own number is shown by the calculator above.
        </p>
        <h3 style={h3Style}>How many calories do you burn while sleeping?</h3>
        <p style={pStyle}>
          About 0.9 calories per kilogram per hour, so around 55 to 70 calories an hour for a 70 kg person, or roughly 450
          to 550 over eight hours. Your brain, heart, muscles repair and temperature regulation all keep working. Sleep
          itself doesn't burn extra calories, but poor sleep raises hunger hormones and makes overeating more likely, so
          sleeping well supports weight loss indirectly.
        </p>
        <h3 style={h3Style}>Will I burn calories during sleep if I work out before going to bed?</h3>
        <p style={pStyle}>
          Slightly. After hard exercise, your body spends extra energy on recovery (excess post-exercise oxygen
          consumption), but for typical workouts this adds only tens of calories over the following hours, not hundreds.
          Vigorous exercise within an hour or two of bedtime can also raise body temperature and heart rate and disrupt
          sleep for some people, which can hurt more than it helps. Light evening movement is a safer choice.
        </p>
        <h3 style={h3Style}>How do you burn calories before bed?</h3>
        <p style={pStyle}>
          Keep it gentle: a 10 to 20 minute walk after dinner (about 40 to 70 calories), light stretching, a short
          bodyweight circuit, or household chores. A post-dinner walk also helps blunt the blood sugar spike after meals.
          Avoid intense exercise right before sleep if it keeps you awake.
        </p>
        <h3 style={h3Style}>Does a spoonful of peanut butter before bed help me burn more calories during sleep?</h3>
        <p style={pStyle}>
          No. There is no evidence that peanut butter or any food boosts overnight calorie burn in a meaningful way. A
          tablespoon contains roughly 95 calories, and the digestion cost of protein and fat is only a small fraction of
          that. A small bedtime snack can help some people avoid late-night hunger, but it adds calories rather than
          burning them.
        </p>
        <h3 style={h3Style}>How many calories are burned while sitting down?</h3>
        <p style={pStyle}>
          Sitting quietly burns roughly 1.0 to 1.5 METs, about 70 to 105 calories per hour for a 70 kg person.
          Fidgeting, typing and talking push this toward the higher end. Standing adds only a little more, but breaking
          up long sitting periods with a short walk every 30 to 60 minutes improves blood sugar and circulation.
        </p>
        <h3 style={h3Style}>How many calories do you burn driving?</h3>
        <p style={pStyle}>
          About 1.3 to 2 METs, or roughly 90 to 140 calories per hour, only slightly above sitting. Heavy traffic and
          stress can raise it a little, but driving is not an effective way to burn calories.
        </p>
        <h3 style={h3Style}>How many calories can you burn while crying for an hour?</h3>
        <p style={pStyle}>
          There is no credible evidence that crying burns meaningful calories. The effort is small, and an hour of crying
          likely costs about the same as sitting (70 to 100 calories) or slightly more with the physical tension involved.
          It is an emotional release, not a weight-loss method.
        </p>
        <h3 style={h3Style}>How many calories does one sit-up burn?</h3>
        <p style={pStyle}>
          About 0.3 to 0.5 calories per repetition, so 20 sit-ups burn roughly 6 to 10 calories. Sit-ups strengthen the
          core, but they will not shrink belly fat on their own. Fat loss comes from your overall energy balance, not from
          targeting one area.
        </p>
        <h3 style={h3Style}>Do cold showers make you burn calories?</h3>
        <p style={pStyle}>
          Only a trivial amount. Cold exposure triggers shivering and activates brown fat, which raises energy use, but a
          typical two to five minute cold shower adds perhaps a few extra calories. Cold showers may help alertness and
          mood, but they are not a weight-loss tool.
        </p>
        <h3 style={h3Style}>
          If I donate blood, does that actually burn calories within that day? Should I add that to my calorie tracker
          as calories burned?
        </h3>
        <p style={last}>
          No, don't log it. A commonly cited figure is that replacing a pint of blood costs the body around 650 calories,
          but that cost is spread over days to weeks as your body rebuilds red blood cells and plasma, not on the day you
          donate. Eat and drink normally afterward, and follow the American Red Cross donor guidance on fluids and
          iron-rich foods.
        </p>
      </div>

      {/* Exercise */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Exercise and Calorie Burn</h2>
        <h3 style={firstH3}>How many calories can I burn through light exercise?</h3>
        <p style={pStyle}>
          Light activity (2 to 3.5 METs), such as slow walking, gentle cycling, easy yoga or housework, burns about 140 to
          245 calories per hour at 70 kg. Light movement is underrated: it is easy to sustain, low in injury risk, and
          accumulates across the day as NEAT (non-exercise activity thermogenesis).
        </p>
        <h3 style={h3Style}>How many calories can one burn doing yoga?</h3>
        <p style={pStyle}>
          Hatha or gentle yoga burns roughly 175 to 210 calories an hour. Vinyasa, power and ashtanga styles reach about
          280 to 420. Hot yoga feels harder, but studies show only modest increases over regular yoga. Yoga's bigger
          benefits are flexibility, balance, stress reduction and better sleep.
        </p>
        <h3 style={h3Style}>How many calories do weightlifting exercises burn?</h3>
        <p style={pStyle}>
          Moderate lifting burns about 3 METs (around 210 calories an hour), while vigorous circuit-style training with
          short rests can reach 6 METs (around 420). The main value of lifting for weight loss is preserving and building
          muscle, which protects your metabolic rate and shapes how you look as you lose fat.
        </p>
        <h3 style={h3Style}>What stretches burn the most calories?</h3>
        <p style={pStyle}>
          Static stretching burns very little, about 2 to 2.5 METs (140 to 175 calories an hour). Dynamic flows such as
          sun salutations, lunges with rotation and mobility circuits burn more because they raise your heart rate. Use
          stretching for recovery and range of motion, not as a primary calorie burner.
        </p>
        <h3 style={h3Style}>What exercise burns the most calories in half an hour?</h3>
        <p style={pStyle}>
          For a 70 kg person, high-intensity options lead: jumping rope (about 400 calories), running at 6 mph (about
          350), swimming vigorous laps (about 300 to 350), rowing hard (about 300) and fast cycling (about 280 to 350).
          Intensity matters more than the activity, so the best choice is the one you can do at a high effort safely.
        </p>
        <h3 style={h3Style}>How do I burn maximum calories in an hour?</h3>
        <p style={pStyle}>
          Double the half-hour figures and be realistic about pacing. Running at 8 to 9 mph, vigorous swimming, hard
          rowing or fast cycling can burn about 600 to 800 calories in an hour for a 70 kg person. Maintaining that effort
          for a full hour takes training, so build up gradually, warm up, hydrate and don't increase duration or
          intensity too quickly. Chasing maximum burn is not required for results. Consistency does more than occasional
          extreme sessions.
        </p>
        <h3 style={h3Style}>What sports activity burns the most calories over an hour?</h3>
        <p style={pStyle}>
          Running, swimming, cycling, cross-country skiing, singles tennis, squash, soccer and basketball sit at the top,
          typically 500 to 800 calories an hour at competitive effort. Actual burn depends on how continuously you move.
          A tennis doubles match with lots of standing burns much less than a hard singles set.
        </p>
        <h3 style={h3Style}>Which sports are safer for health and at the same time burn calories?</h3>
        <p style={pStyle}>
          Low-impact options protect joints while still raising the heart rate: swimming, cycling, rowing, brisk walking,
          elliptical training, pickleball and doubles tennis, and water aerobics. They suit beginners, older adults and
          anyone with knee or back issues. Whatever you choose, build up gradually and check with a doctor first if you
          have heart disease or other chronic conditions.
        </p>
        <h3 style={h3Style}>What is the most important exercise to keep doing after 60 to burn calories?</h3>
        <p style={pStyle}>
          Strength training. Muscle declines gradually with age (sarcopenia), and less muscle means a lower metabolic rate
          and higher injury risk. Aim for resistance training at least two days a week, using weights, bands or
          bodyweight, alongside regular walking and balance work, as the{" "}
          <Ext href={PAG_URL}>Physical Activity Guidelines</Ext> recommend for older adults. Brisk walking is the best
          companion habit.
        </p>
        <h3 style={h3Style}>What is the best exercise for a full-body calorie burn?</h3>
        <p style={last}>
          Rowing, swimming and cross-country skiing use the arms, legs and core together and burn about 500 to 700
          calories an hour at vigorous effort. Kettlebell circuits, burpees and battle ropes also recruit the whole body
          but are harder on joints. If you want one machine, a rowing machine is the best full-body choice for most
          people.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This Calorie Calculator Works</h2>
        <h3 style={firstH3}>What This Calorie Calculator Does</h3>
        <p style={pStyle}>
          This calorie calculator takes your age, gender, height, weight, and activity level, then runs the numbers
          through established nutrition formulas to give you four connected results: your BMI, your total daily energy
          expenditure (TDEE), a macro breakdown by protein, carbs, and fat, and a recommended daily water intake. Instead
          of using separate tools for each metric, you get an integrated view of where you stand and what to adjust,
          whether your goal is losing fat, maintaining your current weight, or building muscle. Because every calculation
          runs from the same input data, the numbers stay consistent with each other. Your calorie target and your macro
          split will always match, which isn't always true when you calculate these figures separately across different
          apps.
        </p>
        <h3 style={h3Style}>Calculating Your BMI Accurately</h3>
        <p style={pStyle}>
          Body Mass Index remains one of the fastest ways to get a general sense of whether your weight falls within a
          typical range for your height. This BMI calculator online uses the standard formula, weight in kilograms
          divided by height in meters squared, and instantly categorizes your result as underweight, normal weight,
          overweight, or obese. BMI isn't a perfect measure on its own. It doesn't account for muscle mass, bone density,
          or body composition, so an athlete with significant muscle can show a higher BMI without carrying excess fat.
          That's precisely why this tool pairs your BMI with TDEE and macro data rather than presenting it in isolation.
          Used together, these numbers give a far more useful picture than BMI alone, which is why most credible health
          resources recommend treating BMI as a starting point rather than a final verdict.
        </p>
        <h3 style={h3Style}>TDEE and Daily Calorie Needs</h3>
        <p style={pStyle}>
          TDEE, or Total Daily Energy Expenditure, is the number that actually answers the question "how many calories
          should I eat a day?" It starts with your Basal Metabolic Rate (BMR), the energy your body burns at complete rest
          just to keep your heart, brain, and organs functioning, and then factors in your activity level, from sedentary
          desk work to intense daily training. This calorie calculator estimates BMR using the Mifflin-St Jeor equation,
          widely regarded as one of the more accurate formulas for everyday use compared to older methods like
          Harris-Benedict. Once your BMR is calculated, the tool applies an activity multiplier based on how much you move
          throughout the week, giving you a TDEE figure that represents your maintenance calories, the amount you'd eat to
          keep your current weight stable.
        </p>
        <p style={pStyle}>
          From there, adjusting for a goal becomes straightforward. A moderate calorie deficit below your TDEE supports
          gradual fat loss without the muscle loss and metabolic slowdown that come with extreme restriction. A calorie
          surplus above your TDEE supports weight or muscle gain when paired with adequate protein and resistance
          training. Because crash diets and overly aggressive deficits tend to backfire, leading to fatigue, muscle loss,
          and rebound weight gain, knowing your actual TDEE first lets you set a realistic, sustainable target rather than
          picking an arbitrary calorie number off a generic chart.
        </p>
        <h3 style={h3Style}>How This Tool Estimates Your BMR</h3>
        <p style={pStyle}>
          There isn't just one accepted way to estimate BMR, and it helps to know where the numbers behind this calculator
          actually come from. The Harris-Benedict formula was one of the first equations used to estimate resting energy
          needs and was updated in 1984 to improve its accuracy, remaining the standard reference until the early 1990s.
          The Mifflin-St Jeor equation replaced it as the more widely trusted option, since research has repeatedly found
          it to be a closer match to measured metabolic rates for most people. A third option, the Katch-McArdle formula,
          takes a different approach: instead of relying only on age, height, and weight, it factors in lean body mass,
          which makes it a stronger choice for people who are leaner and already know their body fat percentage.
        </p>
        <p style={pStyle}>
          For general use, this calorie calculator relies on the Mifflin-St Jeor equation, since it offers the best
          balance of accuracy and simplicity for the average person without requiring a body fat reading. If you already
          track your body fat percentage, the Katch-McArdle result can give you a slightly sharper estimate, because two
          people with the same height and weight but different amounts of muscle will naturally burn different amounts of
          energy at rest. Whichever formula is used, the output is still an estimate of maintenance calories at rest,
          before any activity multiplier is applied. It's a starting reference point, not a lab-measured number.
        </p>
        <p style={pStyle}>
          Once your BMR is set, remember that roughly 3,500 calories is considered equivalent to one pound of body weight.
          That's the basis for the common guideline that cutting about 500 calories a day from your maintenance level
          supports losing around a pound a week. It's worth treating that figure as an approximation rather than an exact
          science. Cutting exactly 500 calories won't always produce exactly one pound of loss, since individual
          metabolism, water retention, and activity all shift the real-world result. Cutting your intake by more than
          around 1,000 calories a day is generally discouraged, since losing more than about two pounds a week increases
          the risk of losing muscle along with fat, which in turn lowers your BMR and can make the weight harder to keep
          off long-term.
        </p>
        <h3 style={h3Style}>Macro Breakdown: Protein, Carbs, and Fat</h3>
        <p style={pStyle}>
          Total calories only tell part of the story. Where those calories come from matters just as much for body
          composition, energy levels, and long-term adherence to a plan. This macro calculator function breaks your daily
          calorie target into protein, carbohydrates, and fat based on standard nutritional ratios, giving you gram-level
          targets rather than vague percentages you'd have to calculate yourself. Protein intake is particularly important
          during a calorie deficit, since adequate protein helps preserve lean muscle mass while you lose fat, and it also
          supports satiety, which makes sticking to a lower-calorie diet noticeably easier. Carbohydrates fuel training
          performance and daily energy, while dietary fat supports hormone production and nutrient absorption. Rather than
          treating macros as a rigid rulebook, use the breakdown as a practical framework: hit your protein target
          consistently, and let carbs and fat flex around your remaining calories based on your food preferences and
          training schedule.
        </p>
        <p style={pStyle}>
          Each macronutrient supplies a different amount of energy per gram, which is why swapping fat for protein or
          carbs at the same weight changes your total calorie count. For reference:
        </p>
        <DataTable headers={["Component", "Calories per gram"]} rows={CALORIES_PER_GRAM_ROWS} />
        <p style={pStyle}>
          This is also why fattier foods tend to be more calorie-dense than lean or high-fiber ones at the same portion
          size, and why alcohol contributes meaningfully to daily calorie totals even though it isn't a traditional
          macronutrient.
        </p>
        <h3 style={h3Style}>Water Intake Recommendations</h3>
        <p style={pStyle}>
          Hydration needs vary based on body weight, activity level, and climate, yet water intake is often the most
          overlooked variable in a nutrition plan. This tool calculates a personalized daily water intake recommendation
          alongside your calorie and macro results, since hydration directly affects metabolism, digestion, workout
          performance, and even appetite regulation. Mild dehydration is frequently mistaken for hunger, which can lead to
          unnecessary snacking. Rather than relying on the generic "eight glasses a day" rule, which doesn't account for
          individual body size or activity, this water intake calculator scales the recommendation to your specific
          profile, giving you a more realistic daily target to work toward.
        </p>
        <h3 style={h3Style}>Personalized Meal Suggestions</h3>
        <p style={last}>
          Numbers alone don't fill a plate. Once your calorie and macro targets are calculated, this calorie calculator
          with meal suggestions translates those figures into practical food ideas, giving you a starting point for
          structuring meals that fit your daily targets without needing to build a meal plan from scratch. This is
          especially useful for anyone new to tracking, since translating "1,800 calories with 140g protein" into an
          actual day of eating is often the hardest part of getting started. The suggestions are meant as a flexible
          template you can adapt to your own food preferences, dietary restrictions, and schedule, rather than a fixed
          prescription you have to follow exactly.
        </p>
      </div>

      {/* In practice */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Putting Your Numbers Into Practice</h2>
        <h3 style={firstH3}>A Simple Way to Put These Numbers Into Practice</h3>
        <p style={pStyle}>
          Turning your results into actual weight loss comes down to a few practical steps rather than anything
          complicated:
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Start with your BMR and TDEE.</strong> Use the figures this calculator gives you as your baseline,
            keeping in mind they're an approximation rather than an exact figure. The real number could land a little
            higher or lower for you personally.
          </li>
          <li style={liStyle}>
            <strong>Set a realistic target.</strong> Since roughly 3,500 calories equals about one pound, trimming 500
            calories a day from your TDEE points toward losing around a pound a week. Keep any daily deficit at or below
            about 1,000 calories, and speak with a doctor or registered dietitian before targeting more than two pounds of
            loss per week.
          </li>
          <li style={liStyle}>
            <strong>Pick a way to track what you eat.</strong> A phone app, spreadsheet, or notebook all work. The method
            matters less than consistency. Portion sizes are usually the hardest part to judge at first, but they get
            noticeably easier to estimate once you've weighed and logged your usual meals a few times.
          </li>
          <li style={liStyle}>
            <strong>Review progress weekly, not daily.</strong> Day-to-day weight can swing based on water retention,
            sodium intake, or timing, so weigh yourself under the same conditions (first thing in the morning works well)
            and look at the trend over a full week rather than a single reading.
          </li>
          <li>
            <strong>Adjust as you go.</strong> If your weight isn't moving the way the math suggests it should after a
            couple of weeks, that's a signal to recalculate rather than a reason to cut calories further right away.
          </li>
        </ol>
        <p style={pStyle}>
          Counting calories isn't the only path to weight loss, and it isn't the right fit for everyone, but it remains
          one of the more consistently effective approaches because it gives you a concrete, measurable target instead of
          a vague intention to "eat less."
        </p>
        <h3 style={h3Style}>Zigzag Calorie Cycling: Working Around a Plateau</h3>
        <p style={pStyle}>
          If weight loss stalls even though your intake hasn't changed, it's often because your body has adapted to
          eating the same number of calories every day. Zigzag calorie cycling addresses this by varying your daily
          intake, with some higher-calorie days and some lower-calorie days, while keeping the same total for the week.
          For example, someone with a weekly target of 14,000 calories could eat 2,300 calories on three days and around
          1,775 on the other four, rather than a flat 2,000 every day. The weekly total stays identical, but the
          day-to-day variation makes it harder for metabolism to settle into a predictable pattern, and it gives you more
          flexibility to eat more on social occasions and less on quieter days.
        </p>
        <p style={pStyle}>
          There's no single formula for how to split high and low days. A difference of roughly 200–300 calories between
          them is a reasonable starting point, with more active people generally able to handle a wider spread. It's a
          technique worth trying if a straightforward daily deficit has stopped producing results, rather than a required
          part of using this calculator.
        </p>
        <h3 style={h3Style}>How Many Calories Do You Actually Need?</h3>
        <p style={pStyle}>
          Daily calorie needs vary widely based on age, height, weight, sex, and activity level, which is exactly why a
          one-size-fits-all number isn't very useful. As a general reference, adult men typically need somewhere in the
          range of 2,000–3,000 calories a day to maintain their weight, while adult women typically fall in the
          1,600–2,400 range, according to U.S. Department of Health guidance, though individual needs inside those ranges
          can differ substantially. Cutting calories too aggressively causes the body to conserve energy for essential
          functions only, at the expense of things like energy levels, hormone balance, and general well-being. Health
          guidance generally advises against going below roughly 1,200 calories a day for women or 1,500 for men without
          medical supervision, which is one more reason to treat any deficit as a moderate, sustainable adjustment rather
          than an extreme cut.
        </p>
        <h3 style={h3Style}>Not All Calories Are Equal: Why Food Quality Matters</h3>
        <p style={pStyle}>
          The basic math of calories in versus calories out holds true, but where those calories come from still affects
          hunger, energy, and how sustainable a diet feels. Foods that take more effort to chew and digest (vegetables,
          lean meats, whole grains) cause the body to burn slightly more energy processing them and tend to keep you
          feeling full for longer, while heavily processed foods are usually easier to overeat without noticing. Some
          ingredients, including coffee, tea, chili peppers, cinnamon, and ginger, have also been linked to a modest
          increase in calories burned during digestion.
        </p>
        <p style={pStyle}>
          It also helps to distinguish between high-calorie foods that are nutritious, like nuts, avocado, and whole
          grains, and empty calories, which supply energy with little nutritional value, such as added sugars and heavily
          refined snacks. Drinks are an easy place for empty calories to add up unnoticed, since juice, soda, and
          sweetened coffee can quietly account for a meaningful share of daily intake. Choosing water, unsweetened tea, or
          black coffee more often is a simple way to free up calories for actual meals. None of this means certain foods
          are strictly off-limits. Moderation and overall dietary balance matter more than treating any single food as
          good or bad.
        </p>
        <h3 style={h3Style}>Calories in Common Foods</h3>
        <p style={pStyle}>
          Having a rough sense of calorie counts for everyday foods makes it much faster to estimate a meal without
          weighing everything. Here's a quick reference for some common items:
        </p>
        <DataTable headers={["Food", "Serving Size", "Calories"]} rows={COMMON_FOODS_ROWS} />
        <p style={pStyle}>
          These are approximate values and will vary slightly by brand, preparation method, and exact portion, so treat
          them as a starting point for quick mental math rather than an exact measurement. For exact figures on thousands
          of foods, search the <Ext href="https://fdc.nal.usda.gov/">USDA FoodData Central</Ext> database.
        </p>
        <h3 style={h3Style}>Sample Meal Plans by Calorie Target</h3>
        <p style={pStyle}>
          If you're not sure what a given calorie target actually looks like on a plate, these simplified examples show
          how breakfast, lunch, and dinner might be structured across three common targets:
        </p>
        <DataTable
          headers={["Meal", "~1,200 Calorie Plan", "~1,500 Calorie Plan", "~2,000 Calorie Plan"]}
          rows={MEAL_PLAN_ROWS}
        />
        <p style={pStyle}>
          These are meant purely as a template for portioning meals around a target, not a fixed plan. Swap in foods you
          actually enjoy and adjust portions until the totals line up with the numbers this calculator gives you.
        </p>
        <h3 style={h3Style}>Calories Burned by Common Activities</h3>
        <p style={pStyle}>
          Pairing your calorie target with a sense of what exercise actually costs in calories can make the numbers feel
          more concrete. The table below shows approximate calories burned per hour by body weight. For single-activity
          answers, such as yoga, weightlifting or sit-ups, see Part 3 above.
        </p>
        <DataTable headers={["Activity", "125 lb", "155 lb", "185 lb"]} rows={ACTIVITY_CALORIES_ROWS} />
        <p style={last}>
          Heavier body weights burn more calories at the same activity and intensity, since moving more mass takes more
          energy, which is also part of why calorie needs and exercise recommendations aren't identical from person to
          person.
        </p>
      </div>

      {/* FAQ */}
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
