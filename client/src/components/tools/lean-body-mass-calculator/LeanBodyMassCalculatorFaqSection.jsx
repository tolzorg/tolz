import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a lean body mass calculator?",
    a: "It is an online tool that estimates how much of your body weight is not fat. Using height, weight, gender and age with formulas such as Boer, James and Hume, it returns your estimated lean mass, fat mass and body fat percentage.",
  },
  {
    q: "How do I calculate lean body mass manually?",
    a: "If you know your body fat percentage, multiply your weight by that percentage and subtract the result from your weight. If you don’t, use a formula such as Boer. For men: 0.407 × weight (kg) + 0.267 × height (cm) − 19.2. For women: 0.252 × weight (kg) + 0.473 × height (cm) − 48.3.",
  },
  {
    q: "Which lean body mass formula is the most accurate?",
    a: "No single formula wins in every case. Boer is the most commonly used and works well for average builds, James can underestimate at very high weights, and Hume is a good cross-check. Comparing all three gives a more reliable range.",
  },
  {
    q: "What is a good lean body mass percentage?",
    a: "It depends on age, gender and fitness level. Lean mass percentage equals 100% minus body fat percentage. A typical healthy adult falls somewhere around 75% to 90%, with men usually higher than women.",
  },
  {
    q: "Is lean body mass the same as muscle mass?",
    a: "No. Lean body mass includes muscle, bones, organs, skin, blood and body water. Skeletal muscle is typically about 40% to 55% of it.",
  },
  {
    q: "Is lean body mass the same as fat-free mass?",
    a: "Almost. Lean body mass includes a small amount of essential fat, while fat-free mass doesn’t. The difference is about 2% to 3% of body weight in men and 5% to 12% in women.",
  },
  {
    q: "How much protein do I need based on lean body mass?",
    a: "A common guideline is 0.8 to 1 gram per pound of lean body mass per day, or about 1.8 to 2.2 grams per kilogram. Check with a doctor if you have kidney problems.",
  },
  {
    q: "Can I use this calculator for children?",
    a: "Yes. For children, the tool uses the Peters formula, which is designed for growing bodies and is suggested for ages 13 to 14 and younger. Adult formulas aren’t reliable for children.",
  },
  {
    q: "Why does my lean body mass change from day to day?",
    a: "Mostly because of water, sodium, carbohydrates and food in your system. These shift your weight without changing your muscle. Track the trend over weeks instead of daily readings.",
  },
  {
    q: "Can I build lean body mass at an older age?",
    a: "Yes. Strength training and enough protein help adults build and keep lean mass well into their 60s, 70s and beyond.",
  },
  {
    q: "Is this lean body mass calculator free, and do I need to sign up?",
    a: "It is free to use, and no signup or account is required.",
  },
  {
    q: "How accurate is a lean body mass calculator compared with a DEXA scan?",
    a: "A calculator gives a reasonable estimate from population-based equations, while a DEXA scan measures your actual composition. Use the calculator for quick checks and trend tracking, and a scan when you need precise numbers.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

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
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
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

export default function LeanBodyMassCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Lean Body Mass?">
        <P>
          Lean body mass is everything in your body except stored fat. That includes skeletal muscle, bones, organs, blood, skin,
          connective tissue and body water. Another way to think about it is what you would weigh if you had no <Link to="/tools/body-fat-calculator" className="inline-home-link">body fat</Link> at all.
        </P>
        <P>
          For most people, LBM makes up about 60% to 90% of total body weight. Men usually carry a higher share than women, mainly
          because women naturally store more essential fat.
        </P>
        <P>
          LBM is not the same as muscle mass. Muscle is one part of lean mass, not the whole thing. Someone who gains muscle will see
          their lean mass rise, but so will someone who simply carries more body water. That is why LBM is always larger than muscle
          mass alone.
        </P>
        <P>
          Lean mass matters because it is the metabolically active part of your body. It drives your resting calorie burn, sets your
          strength potential, and affects how your body handles food and medication.
        </P>
      </Card>

      <Card title="What Is the Difference Between Total Body Mass and Lean Body Mass?">
        <P>
          Total body mass is your full weight on the scale. It includes lean mass plus every pound of fat. Lean body mass is what
          remains after you subtract fat mass.
        </P>
        <P>
          This difference explains why two people who weigh the same can look and feel very different. If both weigh 170 pounds, but
          one has 15% body fat and the other has 30%, the first person carries far more lean tissue. Total weight alone hides that.
        </P>
        <H3>Lean Body Mass vs. Fat-Free Mass</H3>
        <P>
          People often use these two terms as if they were identical, and for everyday purposes that is fine. Technically, though,
          they differ by a small amount.
        </P>
        <P>
          Lean body mass includes a small amount of essential fat found inside organs, nerves and bone marrow. Fat-free mass removes
          all fat, including that essential fat. The gap is roughly 2% to 3% of body weight in men and 5% to 12% in women. The
          formulas in this calculator estimate lean body mass, so if you compare the results with a lab report that lists fat-free
          mass, expect a small difference.
        </P>
      </Card>

      <Card title="How the Lean Body Mass Calculator Works">
        <P>The calculator needs four inputs: height, weight, gender and age. Here is how to use it:</P>
        <List ordered items={[
          ["", "Enter your height and current body weight."],
          ["", "Select your gender. The formulas differ for men and women because average body composition differs."],
          ["", "Enter your age. Adults are calculated with the Boer, James and Hume formulas. Children are calculated with the Peters formula."],
          ["", "Calculate, then review your estimated lean body mass, fat mass and body fat percentage."],
        ]} />
        <P>
          Because the tool runs three adult formulas side by side, you can compare the results instead of relying on one estimate. If
          the numbers land close together, you can be fairly confident in the range. If they spread out, expect more uncertainty.
        </P>
      </Card>

      <Card title="How Do I Calculate Lean Body Mass?">
        <P>You can calculate lean body mass by hand in two ways, depending on what you already know.</P>
        <P>If you know your body fat percentage, use this simple method:</P>
        <Formula>Lean Body Mass = Body Weight − (Body Weight × Body Fat %)</Formula>
        <P>
          Multiply your weight by your body fat percentage to get fat mass, then subtract that from your total weight. Someone who
          weighs 180 pounds at 20% body fat has 36 pounds of fat and 144 pounds of lean mass. This is the most accurate approach, but
          only as accurate as your body fat measurement.
        </P>
        <P>
          If you don’t know your body fat percentage, use a formula that predicts LBM from height and weight. That is what the
          calculator does. In the formulas below, W is weight in kilograms and H is height in centimeters.
        </P>
        <H3>Boer Formula</H3>
        <P>Published in 1984, this is probably the most widely used equation, and it is common in clinical settings.</P>
        <Formula>
          Men: LBM = 0.407W + 0.267H − 19.2<br />
          Women: LBM = 0.252W + 0.473H − 48.3
        </Formula>
        <H3>James Formula</H3>
        <P>This equation uses the squared ratio of weight to height.</P>
        <Formula>
          Men: LBM = 1.1W − 128 × (W ÷ H)²<br />
          Women: LBM = 1.07W − 148 × (W ÷ H)²
        </Formula>
        <P>
          Because of the squared term, the James formula can underestimate lean mass at very high body weights. Read results for
          people with obesity with extra caution.
        </P>
        <H3>Hume Formula</H3>
        <P>
          Developed in the 1960s, this equation tends to hold up across a wide range of body sizes, so it works well as a
          cross-check.
        </P>
        <Formula>
          Men: LBM = 0.32810W + 0.33929H − 29.5336<br />
          Women: LBM = 0.29569W + 0.41813H − 43.2933
        </Formula>
        <H3>Peters Formula for Children</H3>
        <P>
          Adult equations don’t work for growing bodies. The Peters method first estimates extracellular fluid volume, then converts
          it to lean mass:
        </P>
        <Formula>
          eECV = 0.0215 × W<sup>0.6469</sup> × H<sup>0.7236</sup><br />
          LBM = 3.8 × eECV
        </Formula>
        <P>
          The author suggests this formula applies to children aged 13 to 14 or younger. If you enter a child’s age, the calculator
          uses this method.
        </P>
        <P>None of these formulas measures your body directly. They predict LBM from population data, so treat every result as an estimate.</P>
        <H3>A Worked Example</H3>
        <P>Take a man who is 180 cm tall and weighs 80 kg. Using the Boer formula:</P>
        <Formula>(0.407 × 80) + (0.267 × 180) − 19.2 = 32.56 + 48.06 − 19.2 = 61.4 kg of lean body mass</Formula>
        <P>His fat mass is 80 − 61.4 = 18.6 kg, which is about 23% body fat.</P>
        <P>Now take a woman who is 165 cm and 65 kg:</P>
        <Formula>(0.252 × 65) + (0.473 × 165) − 48.3 = 16.38 + 78.05 − 48.3 = 46.1 kg of lean body mass</Formula>
        <P>Her fat mass is about 18.9 kg, or roughly 29% body fat. The calculator does this math for all three formulas instantly.</P>
      </Card>

      <Card title="Why Is Lean Body Mass Important for Our Health?">
        <P>Lean mass does more than make you look fit. Here is what it does for your health:</P>
        <List items={[
          ["It supports your metabolism.", "Muscles and organs burn calories even at rest, so more lean tissue means a higher resting energy need."],
          ["It protects your strength and mobility.", "Lean mass is what lets you climb stairs, carry groceries and get up from a chair easily as you age."],
          ["It supports bone health.", "Strong muscles put healthy stress on bones, which helps keep them dense."],
          ["It helps blood sugar control.", "Muscle is a major place where your body stores and uses glucose."],
          ["It improves your odds during illness and recovery.", "People with more lean mass generally handle hospital stays, surgery and illness better."],
        ]} />
        <P>
          This is also why tracking LBM beats tracking weight alone, especially while dieting. If you lose 10 pounds but 4 of them are
          muscle, the result is a weaker, softer body and a slower metabolism. Watching your lean mass shows you whether you are
          losing the right kind of weight.
        </P>
      </Card>

      <Card title="Lean Body Mass vs. Body Fat Percentage vs. BMI">
        <P>These three measures are related, but they answer different questions.</P>
        <List items={[
          ["BMI", "compares weight to height and nothing else. It can’t tell muscle from fat, so a muscular athlete and a sedentary person of the same size can share a BMI while having very different health profiles."],
          ["Body fat percentage", "shows what share of your weight is fat. It is more informative than BMI but harder to measure accurately at home."],
          ["Lean body mass", "shows what remains after fat is removed. If your weight stays flat while your lean mass rises and fat mass falls, you are improving your composition even though the scale hasn’t moved."],
        ]} />
      </Card>

      <Card title="Why Does Lean Body Mass Fluctuate Every Day?">
        <P>
          If you weigh yourself daily, you will notice your numbers move up and down. Your actual muscle doesn’t change that fast.
          Several short-term factors shift the scale:
        </P>
        <List items={[
          ["Water.", "Lean tissue holds a lot of water, so hydration changes can move your weight by a few pounds in a day."],
          ["Sodium and carbohydrates.", "A salty meal or a high-carb day makes your body hold extra water. Each gram of stored glycogen holds about three grams of water with it."],
          ["Food in your digestive system.", "A heavy meal adds weight until it passes through."],
          ["Hormones.", "For women, the menstrual cycle can change water retention noticeably."],
          ["Training.", "Hard workouts cause temporary swelling and fluid shifts in muscle."],
        ]} />
        <P>
          This calculator estimates LBM from the weight you enter, so its results move whenever your weight moves. A one-day jump
          doesn’t mean you gained or lost muscle. Weigh yourself under the same conditions each time, such as first thing in the
          morning, and look at the trend over several weeks.
        </P>
      </Card>

      <Card title="How Accurate Are Your Results?">
        <P>
          Formula-based estimates are convenient, but they have limits. Because the equations rely only on height, weight, gender and
          age, they can’t see your actual muscle, bone density or hydration. Two people with identical measurements but different
          training histories will get identical results. Very muscular people tend to be underestimated, and results for people with
          high body fat can swing in either direction depending on the formula.
        </P>
        <P>
          For a closer measurement, methods such as DEXA scans, hydrostatic weighing and bioelectrical impedance assess composition
          directly. A DEXA scan is generally considered the most practical gold standard. Even these methods vary with hydration,
          meal timing and equipment.
        </P>
        <P>
          Use the tool for consistency. Compare Boer, James and Hume together to get a sensible range, and track the trend over time.
          A calculator gives an estimate, not a diagnosis. If your result worries you, talk to a doctor or registered dietitian.
        </P>
      </Card>

      <Card title="How Do I Calculate Muscle Mass From Lean Body Mass?">
        <P>
          You can’t calculate muscle mass exactly from LBM, because lean mass also includes bones, organs, blood and water. You can
          get a rough idea, though.
        </P>
        <P>
          Skeletal muscle typically makes up about 40% to 55% of lean body mass, and the share tends to be higher in men than in women
          and in people who strength train. So if your LBM is 60 kg, your skeletal muscle is probably somewhere around 24 to 33 kg.
          Treat that as a ballpark, not a measurement. For a real number, you need a DEXA scan or a quality body composition analyzer.
        </P>
      </Card>

      <Card title="Is a Lean Body Mass Percentage of 98% Good or Bad?">
        <P>
          It is not good. A 98% lean body mass percentage means only 2% body fat. Your body needs essential fat to protect organs,
          regulate hormones and absorb certain vitamins. Essential fat is roughly 2% to 5% of body weight in men and 10% to 13% in
          women, and even elite athletes rarely stay near the bottom of those ranges for long.
        </P>
        <P>
          If a tool or scale gives you 98%, a measurement error is the most likely cause. Cheap bioelectrical impedance scales are
          known for this, especially when you are dehydrated. If the number is real, it is a medical concern, and you should see a
          doctor.
        </P>
        <P>
          For most healthy adults, a lean mass percentage in the range of about 75% to 90% is typical, depending on age, gender and
          fitness level. Because lean percentage is simply 100% minus body fat percentage, lower body fat does not always mean better
          health.
        </P>
      </Card>

      <Card title="Is Low Lean Body Mass Unhealthy?">
        <P>
          It can be. Low lean mass, especially when combined with weakness, is linked to higher risks of falls, fractures, slower
          recovery and loss of independence in older adults. In younger people, it often reflects undereating, heavy dieting or
          inactivity.
        </P>
        <P>
          On the other hand, there is no health problem with having a high lean mass. The concern is mainly the loss of lean tissue,
          not how much you carry. If you are losing weight and your lean mass is dropping with it, adjust your approach with more
          protein, strength training and a smaller <Link to="/tools/calorie-tracker" className="inline-home-link">calorie deficit</Link>.
        </P>
      </Card>

      <Card title="Does Low Blood Volume Cause Lean Body Mass to Be Lower?">
        <P>
          It can lower a measured value, yes. Blood and body water are part of lean body mass, so dehydration or low blood volume
          reduces lean mass on methods that measure it, such as bioelectrical impedance. This is one reason those readings change
          from day to day.
        </P>
        <P>
          This calculator doesn’t measure blood or water. It estimates LBM from your height, weight, age and gender, so it can’t
          detect low blood volume. If you suspect a medical issue such as ongoing dizziness or fatigue, see a healthcare provider
          instead of relying on a calculator.
        </P>
      </Card>

      <Card title="Can an Overweight Person Gain Lean Body Mass?">
        <P>
          Yes, and they often respond well. People carrying extra body fat can build muscle while losing fat at the same time, a
          process often called body recomposition. It works best when you lift weights consistently, eat enough protein and keep your
          calorie deficit modest.
        </P>
        <P>
          People with more body weight also tend to have more lean mass to start with, because carrying extra weight acts as a
          constant training load. Beginners of any size usually see the fastest gains in their first several months.
        </P>
      </Card>

      <Card title="How Much Lean Body Mass Can You Gain Naturally?">
        <P>
          It depends on your training history, age, genetics, sleep and diet. As a rough guide, many men who train consistently gain
          around 20 to 25 pounds of muscle in their first year, and women gain about half of that. Gains slow down a lot after that.
          In the second year, the amount is typically half of the first year, and each year after that is smaller.
        </P>
        <P>
          These are averages, not promises. Some people gain faster and some slower, and adding muscle with no fat gain is harder the
          longer you have trained.
        </P>
      </Card>

      <Card title="How Do I Get a Lean Body Quickly?">
        <P>
          Be careful with the word “quickly.” There is no safe shortcut, and crash diets mostly burn muscle along with fat. A
          realistic timeline is that you may notice changes in how your clothes fit within 4 to 8 weeks and clearer changes in the
          mirror within 12 weeks.
        </P>
        <P>The fastest sustainable approach combines four things:</P>
        <List items={[
          ["", "Strength train three to four days a week."],
          ["", "Eat in a moderate calorie deficit, about 300 to 500 calories below maintenance."],
          ["", "Eat enough protein to protect muscle."],
          ["", "Sleep seven to nine hours a night."],
        ]} />
        <P>Aggressive deficits cost you lean mass, which makes you look softer and slows your metabolism.</P>
      </Card>

      <Card title="What Is the Best Workout Plan to Lose Fat and Gain a Lean Body?">
        <P>The best plan is one you can stick with, but the structure below works for most people:</P>
        <List items={[
          ["Strength training, three to four days per week.", "Use a full-body or upper/lower split built around squats, deadlifts or hip hinges, presses, rows and pull-downs. Aim for 8 to 12 reps per set with challenging weight."],
          ["Progressive overload.", "Add weight, reps or sets over time. Without progress, your body has no reason to build muscle."],
          ["Daily walking.", "7,000 to 10,000 steps burns calories without hurting recovery."],
          ["Cardio, one to three sessions per week.", "Moderate cardio of 20 to 40 minutes helps heart health and fat loss without cutting into muscle if you eat enough."],
          ["Rest days.", "Muscle repairs between workouts, not during them."],
        ]} />
      </Card>

      <Card title="What Does the Body Need to Build Lean Body Mass?">
        <P>Your body needs four things to build lean tissue:</P>
        <List items={[
          ["A training signal.", "Resistance training tells your body to build muscle."],
          ["Enough protein.", "Protein supplies the amino acids that repair and grow muscle fibers."],
          ["Enough total calories.", "Building tissue takes energy. Eating too little makes gains very slow, especially for lean people."],
          ["Recovery.", "Sleep and rest days are when growth happens. Chronic sleep loss and high stress both work against it."],
        ]} />
      </Card>

      <Card title="How Do You Calculate Your Protein Needs With Lean Body Mass?">
        <P>
          Basing protein on lean mass is fairer than basing it on total weight, because fat tissue doesn’t need much protein to
          maintain it. A common rule of thumb is 0.8 to 1 gram of protein per pound of lean body mass per day, or about 1.8 to 2.2
          grams per kilogram. This lines up with the 1.4 to 2.0 grams per kilogram of body weight range that the International Society
          of Sports Nutrition cites for exercising adults in its{" "}
          <Ext href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8">position stand on protein and exercise</Ext>.
        </P>
        <P>
          Here is how it works. Suppose the calculator gives you 61.4 kg of LBM, which is about 135 pounds. Multiply by 0.8 to 1.0,
          and your daily target is about 108 to 135 grams of protein. Spread it over three or four meals, roughly 25 to 40 grams each.
        </P>
        <P>People with kidney disease or other medical conditions should check with a doctor before raising <Link to="/tools/protein-calculator" className="inline-home-link">protein intake</Link>.</P>
      </Card>

      <Card title="What Is the Micro and Macro Nutrient Requirement per Pound of Lean Body Mass?">
        <P>Protein is the only macro that is commonly set by lean mass. A reasonable framework looks like this:</P>
        <List items={[
          ["Protein:", "0.8 to 1 gram per pound of LBM."],
          ["Fat:", "about 0.3 to 0.45 grams per pound of total body weight. This helps keep hormones working normally."],
          ["Carbohydrates:", "fill in the rest of your calories, with more on heavy training days."],
        ]} />
        <P>
          Total calories also matter. If you want a rough estimate, the Katch-McArdle equation uses LBM directly: resting calories =
          370 + (21.6 × LBM in kg). Multiply the result by an activity factor to estimate daily needs.
        </P>
        <P>
          Micronutrients don’t scale with lean mass. Vitamin and mineral needs are set by age, gender and life stage, not by pounds of
          muscle. That said, people who train hard should pay attention to iron, zinc, magnesium, calcium, vitamin D and B vitamins,
          and a varied diet covers most of them.
        </P>
      </Card>

      <Card title="What Can I Eat to Increase My Protein Intake and Build Lean Body Mass?">
        <P>Whole foods should come first. Good choices include:</P>
        <List items={[
          ["", "Chicken breast, turkey and lean beef"],
          ["", "Eggs and egg whites"],
          ["", "Fish such as salmon, tuna and cod"],
          ["", "Greek yogurt, cottage cheese and milk"],
          ["", "Lentils, beans, chickpeas and edamame"],
          ["", "Tofu, tempeh and seitan"],
          ["", "Nuts, seeds and nut butters"],
        ]} />
        <P>
          Pair these with whole grains, fruit and vegetables so you get the <Link to="/tools/carbohydrate-calculator" className="inline-home-link">carbohydrates</Link>, fiber and micronutrients your training
          needs.
        </P>
      </Card>

      <Card title="A Vegetarian Diet Plan for Lean Body Mass Gain">
        <P>You can build lean mass on a vegetarian diet, but it takes a little more planning. A simple day might look like this:</P>
        <List items={[
          ["Breakfast:", "Greek yogurt with oats, berries and chia seeds, or scrambled eggs on whole-grain toast."],
          ["Lunch:", "Lentil and quinoa bowl with roasted vegetables and tahini."],
          ["Snack:", "Cottage cheese with fruit, or a protein shake."],
          ["Dinner:", "Tofu or tempeh stir-fry with brown rice and broccoli."],
          ["Evening:", "Milk or a casein-based shake, plus a handful of almonds."],
        ]} />
        <P>
          Plant proteins are slightly less digestible and lower in certain amino acids than animal proteins, so aim for the higher end
          of the protein range and mix sources throughout the day. Vegetarians should also watch vitamin B12, iron, zinc and omega-3
          fats. Vegans especially need a reliable B12 source.
        </P>
      </Card>

      <Card title="What Supplements Can Help Build Lean Body Mass?">
        <P>No supplement builds muscle without training and good food, and none is required.</P>
        <List items={[
          ["Protein powder.", "Powder is a convenient way to reach your protein target, not a magic product. Whey works well for most people, casein digests more slowly, and soy or pea blends suit people who avoid dairy. Look for products that are independently tested by a third party, such as NSF Certified for Sport or Informed Choice. We can’t tell you which brand is best. Pick one that tastes good, mixes well, fits your budget and is third-party tested."],
          ["Creatine.", "Creatine monohydrate is one of the most researched supplements for strength and lean mass. The usual dose is 3 to 5 grams a day. Brand matters less than purity, so choose a tested creatine monohydrate. It can raise body water slightly, which may raise your scale weight by a pound or two."],
          ["Chromium picolinate.", "Evidence that chromium picolinate helps preserve lean mass or support weight loss is weak, and it should not replace training, protein and sleep. Talk to your doctor before taking it, especially if you manage blood sugar or take medication."],
        ]} />
      </Card>

      <Card title="Can Intermittent Fasting Help Maintain Lean Body Mass While Losing Fat?">
        <P>
          It can work, but it isn’t better than other methods. Research generally finds that intermittent fasting produces fat loss
          similar to a regular calorie deficit. What protects your lean mass is the same either way: lifting weights, hitting your
          protein target and avoiding an extreme deficit.
        </P>
        <P>
          If you fast, make sure your eating window leaves room for enough protein, ideally split across at least two or three meals.
          Try to schedule strength workouts near your meals. If fasting leaves you tired, weak or short on protein, a regular eating
          schedule may suit you better.
        </P>
      </Card>

      <Card title="What Is the Best Way to Maintain Lean Body Mass While Bulking?">
        <P>The goal of a bulk is to add lean mass with as little fat as possible. These steps help:</P>
        <List items={[
          ["Use a small surplus.", "About 250 to 500 calories above maintenance is enough. Larger surpluses mostly add fat."],
          ["Keep gains slow.", "Aim for about 0.25% to 0.5% of body weight per week."],
          ["Train with progressive overload.", "Surplus calories only build muscle if your training gives them a reason to."],
          ["Keep protein high.", "Stick to the 0.8 to 1 gram per pound of LBM range."],
          ["Track your trend.", "Weigh in regularly, and recalculate your lean mass and body fat every few weeks. If fat mass is rising much faster than lean mass, trim your calories a little."],
        ]} />
      </Card>

      <Card title="How Can You Increase Your Stamina While Maintaining Lean Body Mass?">
        <P>Endurance and muscle can coexist as long as you feed and recover properly. A few habits help:</P>
        <List items={[
          ["Keep lifting.", "Two to three strength sessions a week protect your muscle while you add cardio."],
          ["Build your aerobic base slowly.", "Add easy cardio such as brisk walking, cycling or swimming, and increase time gradually."],
          ["Fuel your workouts.", "Carbs before and after long sessions protect muscle by giving your body fuel other than its own tissue."],
          ["Don’t skimp on calories.", "Heavy cardio on a low-calorie diet is a common way to lose muscle."],
          ["Sleep and recover.", "Stamina improves during rest, not during the session."],
        ]} />
      </Card>

      <Card title="Can a Woman at 66 Build and Keep Lean Body Mass?">
        <P>
          Yes. Muscle loss with age, known as sarcopenia, is real, and people can lose a noticeable amount of muscle each decade after
          about 50. But the body keeps responding to strength training well into the later decades of life.
        </P>
        <P>For a woman at 66, a few points matter most:</P>
        <List items={[
          ["Lift weights two to three times a week.", "Use resistance bands, machines, dumbbells or bodyweight exercises. Start light and build slowly."],
          ["Eat enough protein.", "Older adults often need more protein than younger adults, commonly 1.0 to 1.2 grams per kilogram of body weight or higher, spread across meals."],
          ["Add balance and walking.", "These lower fall risk and support daily movement."],
          ["Check vitamin D and calcium.", "Both matter for bone and muscle health."],
          ["Talk to your doctor first", "if you have a heart condition, osteoporosis, kidney disease or any other health problem."],
        ]} />
        <P>It is never too late to start, and gains in strength often show up within a few weeks.</P>
      </Card>

      <Card title="When You Need a Lean Body Mass Calculator">
        <P>People use an LBM calculator in several practical situations:</P>
        <List items={[
          ["Fitness and bodybuilding.", "Track whether a bulk is adding muscle or mostly fat, and whether a cut is preserving muscle."],
          ["Setting protein targets.", "Base your intake on lean mass instead of total weight."],
          ["Estimating calorie needs.", "Equations such as Katch-McArdle need LBM as an input."],
          ["Weight-loss planning.", "Knowing your lean mass helps you set a realistic goal weight that doesn’t require losing muscle."],
          ["Medical dosing.", "Some anesthetic agents, especially water-soluble drugs, are dosed by lean mass instead of total weight. These decisions belong to healthcare professionals, but formulas like Boer and James are where such estimates come from."],
          ["Children’s growth checks.", "The Peters option provides a rough reference for lean mass in younger children."],
        ]} />
      </Card>

      <Card title="Free, Private and No Signup Required">
        <P>
          This lean body mass calculator is free to use. There are no hidden charges, and you don’t need to register or create an
          account to get your results. You enter basic body measurements, such as height, weight, age and gender, and nothing more.
          No name, email address or health records are asked for. Use it as often as you like and compare different scenarios
          without limits.
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
