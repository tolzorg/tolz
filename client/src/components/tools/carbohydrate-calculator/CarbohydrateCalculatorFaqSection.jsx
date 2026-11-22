import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many carbs should I eat per day?",
    a: "It depends on your calorie needs. Health guidelines suggest 45% to 65% of daily calories from carbohydrates for most adults, and at least 130 grams a day as a minimum. This calculator converts percentages into grams for your own body and goal.",
  },
  {
    q: "How many carbs per day to lose weight?",
    a: "There’s no single figure. Weight loss comes mainly from eating fewer calories than you burn. Choose a carb percentage you can sustain, such as 40% or 55%, and let the calculator show the grams at your reduced calorie level.",
  },
  {
    q: "How do I calculate grams of carbs from calories?",
    a: "Multiply your total daily calories by your carb percentage, then divide by 4, since a gram of carbohydrate has about 4 calories. For 2,000 calories at 50%, that’s 1,000 ÷ 4 = 250 grams.",
  },
  {
    q: "Are carbohydrates the same as sugar?",
    a: "No. Sugar is one type of carbohydrate. The others are starch and fiber. Total carbohydrate on a food label includes all three.",
  },
  {
    q: "Are carbohydrates essential nutrients?",
    a: "Not strictly. Your body can make glucose from protein and fat. But carb-rich whole foods supply fiber and nutrients you need, and health guidelines still recommend at least 130 grams a day.",
  },
  {
    q: "What are net carbs?",
    a: "Net carbs are total carbohydrates minus fiber, and sometimes minus sugar alcohols. They’re mostly used on low-carb diets. This calculator gives a total carbohydrate target.",
  },
  {
    q: "Is 40% carbs considered low-carb?",
    a: "It’s a lower-carb, moderate approach rather than a strict low-carb or ketogenic diet, which usually allows far less. It’s popular among people who want fewer refined carbs without drastic restriction.",
  },
  {
    q: "What happens if you eat no carbs?",
    a: "Your body switches to burning fat and making ketones, a state called ketosis. Many people feel tired or get headaches at first, and long-term fiber and nutrient intake can suffer.",
  },
  {
    q: "Does eating carbs cause diabetes?",
    a: "Not directly. Excess weight, inactivity and genetics are the main risk factors. A diet high in added sugar and refined grains can raise the risk indirectly, while fiber-rich whole foods are linked to a lower risk.",
  },
  {
    q: "Do I need carbs to build muscle?",
    a: "Carbs aren’t required, but they fuel hard workouts and help your muscles recover. Many lifters do well with 45% to 65% of calories from carbs.",
  },
  {
    q: "Is the carbohydrate calculator accurate?",
    a: "It gives a reliable estimate for most healthy adults, but individual needs vary. Track your results for a few weeks and adjust your calories or carb share based on how your weight and energy respond.",
  },
  {
    q: "Can I eat fewer than 130 grams of carbs a day?",
    a: "Some people do, usually as a planned low-carb diet. If you have a medical condition or take medication such as insulin, speak with your doctor first.",
  },
];

// The supplied FAQ schema spells out the contractions in these answers;
// every other answer is the displayed text with straight apostrophes.
const FAQ_SCHEMA_OVERRIDES = {
  "How many carbs per day to lose weight?": "There is no single figure. Weight loss comes mainly from eating fewer calories than you burn. Choose a carb percentage you can sustain, such as 40% or 55%, and let the calculator show the grams at your reduced calorie level.",
  "How do I calculate grams of carbs from calories?": "Multiply your total daily calories by your carb percentage, then divide by 4, since a gram of carbohydrate has about 4 calories. For 2,000 calories at 50%, that is 1,000 ÷ 4 = 250 grams.",
  "What are net carbs?": "Net carbs are total carbohydrates minus fiber, and sometimes minus sugar alcohols. They are mostly used on low-carb diets. This calculator gives a total carbohydrate target.",
  "Is 40% carbs considered low-carb?": "It is a lower-carb, moderate approach rather than a strict low-carb or ketogenic diet, which usually allows far less. It is popular among people who want fewer refined carbs without drastic restriction.",
  "Do I need carbs to build muscle?": "Carbs are not required, but they fuel hard workouts and help your muscles recover. Many lifters do well with 45% to 65% of calories from carbs.",
};
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
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card title="What Are Carbohydrates?">
        <P>
          Carbohydrates, or carbs, are one of the three <Link to="/tools/macro-calculator" className="inline-home-link">macronutrients</Link>, along with protein and fat. They are your body’s main and
          fastest source of fuel. When you eat them, your body breaks most of them down into glucose, a simple sugar that your cells
          use for energy. Your brain, red blood cells and muscles all rely heavily on it.
        </P>
        <H3>Elements, Formula and Structure</H3>
        <P>
          Carbohydrates are made of just three elements: carbon, hydrogen and oxygen. Their general formula is Cₙ(H₂O)ₙ, which is
          where the name comes from. It literally means “hydrated carbon.” Glucose, for example, is C₆H₁₂O₆. In most carbohydrates,
          hydrogen and oxygen appear in the same 2-to-1 ratio found in water.
        </P>
        <P>
          Structurally, carbohydrates are built from small sugar units. A single unit is called a monosaccharide, and glucose,
          fructose and galactose are the main ones in food. These units act as the monomers, or building blocks. When two units join,
          you get a disaccharide such as table sugar (sucrose) or milk sugar (lactose). When many units link into long chains, you
          get a polymer called a polysaccharide, such as starch, glycogen and fiber.
        </P>
        <H3>Functions and General Characteristics</H3>
        <P>The most important job of carbohydrates is energy. Each gram provides about 4 calories. Beyond that, they do several other things:</P>
        <List items={[
          ["", "They are stored as glycogen in your liver and muscles, which gives you a quick energy reserve between meals and during exercise."],
          ["", "They help spare protein, so your body doesn’t have to break down muscle for fuel."],
          ["", "Fiber supports digestion and helps keep you full."],
          ["", "Some carbohydrates, such as certain fibers, feed the helpful bacteria in your gut."],
        ]} />
        <P>
          In general, carbohydrates are made of carbon, hydrogen and oxygen, and most dissolve in water. The small ones taste sweet,
          and the large ones, such as starch and fiber, usually do not. All of them supply energy except fiber, which your body can’t
          fully digest.
        </P>
      </Card>

      <Card title="What Are the Different Types of Carbohydrates?">
        <P>Nutrition labels and dietitians usually group carbohydrates into three types: sugars, starches and fiber.</P>
        <List items={[
          ["Sugars", "are the simplest carbohydrates, made of one or two sugar units. They occur naturally in fruit, milk and some vegetables. They are also added to soda, candy, baked goods and many packaged foods. Because they digest quickly, they raise blood sugar fast, and the energy often fades quickly too."],
          ["Starches", "are long chains of glucose, which makes them complex carbohydrates. You’ll find them in potatoes, corn, oats, rice, bread, beans and lentils. Your body takes longer to break them down, so the energy arrives more steadily."],
          ["Fiber", "is the part of plant foods your body can’t fully digest. It’s found in whole grains, beans, vegetables, fruit, nuts and seeds. It slows digestion, helps control blood sugar and cholesterol, and keeps your bowels regular."],
        ]} />
        <H3>Complex Carbs vs. Simple Carbs</H3>
        <P>
          Simple carbohydrates are the sugars, and complex carbohydrates are the starches and fiber. Simple carbs digest fast, spike
          blood sugar quickly and leave many people hungry again soon. Complex carbs digest more slowly and usually bring fiber,
          vitamins and minerals with them.
        </P>
        <P>
          The line isn’t always clean, though. An apple contains simple sugars, but the fiber in it slows absorption. White bread is
          technically a starch, but it’s so refined that your body handles it much like sugar. It helps to think in terms of whole
          versus refined rather than simple versus complex alone.
        </P>
      </Card>

      <Card title="Are Carbohydrates the Same as Sugar?">
        <P>
          No. Sugar is one type of carbohydrate, but carbohydrates also include starch and fiber. When a label says “total
          carbohydrate,” it counts all three. Sugar appears as a separate line underneath, and “added sugars” appears below that.
        </P>
        <P>
          The class of carbohydrates that is not sugar is made up of the polysaccharides, mainly starch and fiber. They are long
          chains of sugar units, but they don’t taste sweet and they behave differently in your body. Fiber is the one carbohydrate
          that provides little or no usable energy, which is why many people subtract it when they count net carbs.
        </P>
      </Card>

      <Card title="What Is a Carbohydrate Calculator?">
        <P>
          A carbohydrate calculator estimates how many grams of carbs fit into your daily calorie budget. Once you know how many
          calories your body needs, you can assign a share of them to carbs and convert that share into grams.
        </P>
        <P>
          That conversion is what makes a carb calculator more useful than a generic rule of thumb. A 5'2" office worker and a 6'1"
          construction worker have very different energy needs, so a single “eat 200 grams” answer fits neither of them. This daily
          carbohydrate calculator personalizes the number by working from your body measurements and how active you are.
        </P>
      </Card>

      <Card title="How to Use the Carbohydrate Calculator">
        <P>
          Using the tool takes under a minute. Enter your age in years and select your gender. Then enter your height and weight in
          the units offered, and choose the activity level that best describes a typical week. Submit the form and the results appear
          right away.
        </P>
        <P>
          The activity level is where people most often go wrong. Pick the level that matches your average week, not your best one.
          If you exercise intensely twice a month but sit most days, “sedentary” or “lightly active” is more accurate than “very
          active.” Overestimating activity inflates your calorie estimate, which inflates your carb target.
        </P>
        <P>
          The results list carbohydrate grams at 40%, 55%, 65% and 75% of your calories for each goal. You don’t need to follow all
          four. They’re options, and the next section explains how to choose.
        </P>
      </Card>

      <Card title="What 40%, 55%, 65% and 75% of Calories Actually Mean">
        <P>Each percentage describes how much of your total <Link to="/tools/calorie-tracker" className="inline-home-link">calorie intake</Link> comes from carbohydrates. They map onto familiar eating styles.</P>
        <List items={[
          ["40% of calories", "is a lower-carb, moderate approach. It leaves more room for protein and fat, which some people find more filling. It suits people who feel better with fewer starches, or who want to cut back on refined carbs without going strict low-carb."],
          ["55% of calories", "sits in the middle of the range most health authorities consider typical. For most healthy people, it’s a sensible default."],
          ["65% of calories", "is the upper end of the recommended range. It works well for people who train often, such as runners, cyclists and team-sport athletes, whose muscles draw heavily on stored glycogen."],
          ["75% of calories", "is a high-carb pattern. It’s common in endurance training blocks and in traditional diets built around rice, potatoes or legumes. It leaves less room for fat and protein, so it takes planning to keep those adequate."],
        ]} />
        <P>
          None of these is the “correct” answer on its own. The right level depends on your activity, preferences, food culture and
          how your body responds.
        </P>
      </Card>

      <Card title="How Many Grams of Carbs Do We Need Daily?">
        <P>
          There’s no single number that fits everyone, but two benchmarks give you a solid frame. The Dietary Reference Intakes from
          the National Academies set the minimum at 130 grams per day for adults. That’s the amount the brain is estimated to need as
          fuel. They also set the Acceptable Macronutrient Distribution Range (AMDR) for carbohydrates at 45% to 65% of daily
          calories (see the <Ext href="https://nap.nationalacademies.org/catalog/10490">National Academies report</Ext> for
          details). Many other sources allow a wider span, from roughly 40% to 75%, which is the span this calculator covers.
        </P>
        <P>Two more limits are worth knowing:</P>
        <List items={[
          ["Added sugars:", <>The <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans</Ext> recommend keeping added sugars under 10% of daily calories. On a 2,000-calorie diet, that’s about 50 grams. Sugary drinks, sweets and baked goods are the usual culprits, and high intakes are linked to weight gain, type 2 diabetes and heart disease.</>],
          ["Fiber:", "A common target is about 14 grams for every 1,000 calories, which works out to roughly 25 to 34 grams a day for most adults. Most Americans fall short."],
        ]} />
        <P>
          Your carb grams will land above the 130-gram minimum in almost every case. The more useful question is how much above it,
          and that depends on your calories, your activity and the share you choose.
        </P>
      </Card>

      <Card title="How Many Carbs Per Day to Lose, Maintain or Gain Weight">
        <P>
          Your weight changes when your intake differs from your energy expenditure. The calculator therefore works from three
          calorie levels, and your carbohydrate grams change with them.
        </P>
        <Lead lead="To maintain weight,">
          you eat roughly the calories your body uses. Carb grams at each percentage reflect that full amount.
        </Lead>
        <Lead lead="To lose weight,">
          you eat below maintenance. Typical plans trim a few hundred calories a day, which produces gradual loss. Because the calorie
          total is lower, the carb grams at the same percentage are lower too. A 55% carb share of 1,700 calories is fewer grams than
          55% of 2,200.
        </Lead>
        <Lead lead="To gain weight,">
          you eat above maintenance. Carbs are an efficient way to add calories, particularly for people building muscle who need
          energy for hard training.
        </Lead>
        <P>
          Many people searching “how many carbs should I eat to lose weight” assume that cutting carbs is the key. Research comparing
          diets with different macronutrient mixes generally finds that the calorie deficit matters most, and that the diet you can
          stick to beats the one that looks best on paper. Use the lower percentages if they help you stay full and consistent, and
          the higher ones if they fit your training and lifestyle.
        </P>
      </Card>

      <Card title="How Your Daily Calories Are Estimated">
        <P>
          Behind every carb target is a calorie estimate, and understanding it explains why your inputs matter. Nutrition calculators
          generally estimate your <Link to="/tools/bmr-calculator" className="inline-home-link">basal metabolic rate</Link> (BMR), the energy your body burns at rest, from your age, gender, height and
          weight. They then multiply it by an activity factor to approximate your <Link to="/tools/tdee-calculator" className="inline-home-link">total daily energy expenditure</Link> (TDEE).
        </P>
        <P>
          Each input pulls the estimate in a predictable direction. Taller and heavier people burn more. Energy needs typically
          decline gradually with age, mainly as lean mass is lost. Men on average carry more lean mass than women of the same weight,
          which raises their estimated needs. Activity level has the largest swing, because the gap between a sedentary lifestyle and
          a very active one can be many hundreds of calories.
        </P>
        <P>
          Remember that this is an estimate. Two people with identical stats can differ in real energy expenditure by several percent
          because of genetics, body composition, sleep, stress and everyday movement. Treat the result as a starting point, then
          adjust based on real-world feedback, as described below.
        </P>
      </Card>

      <Card title="A Worked Example">
        <P>
          Suppose your estimated maintenance intake comes out at 2,000 calories a day. Since carbohydrates provide 4 calories per
          gram, the grams at each level are:
        </P>
        <Formula>
          40%: 800 calories ÷ 4 = 200 grams<br />
          55%: 1,100 calories ÷ 4 = 275 grams<br />
          65%: 1,300 calories ÷ 4 = 325 grams<br />
          75%: 1,500 calories ÷ 4 = 375 grams
        </Formula>
        <P>
          If the same person aimed to lose weight at 1,700 calories, the 55% figure would drop to about 234 grams. This shows why the
          calculator asks for your goal. The percentage stays the same while the grams shift with your calorie target.
        </P>
        <P>
          You may wonder why carbs and protein get 4 calories per gram while fat gets 9. Fat molecules are packed with energy-rich
          carbon-hydrogen bonds and contain very little oxygen, so they release more energy when broken down. The body also stores fat
          without water, while stored glycogen holds on to water. That’s why fat is the body’s long-term energy reserve and carbs are
          the quick-access one.
        </P>
      </Card>

      <Card title="Total Carbs, Net Carbs and Fiber">
        <P>
          The calculator gives a total carbohydrate target in grams, which matches what most nutrition labels list as “total
          carbohydrate.” That figure includes starch, sugars and dietary fiber.
        </P>
        <H3>What Are Net Carbohydrates?</H3>
        <P>
          Net carbs are total carbs minus fiber, and sometimes minus certain sugar alcohols. Because fiber isn’t digested for energy
          the way starch is, net carbs are a closer estimate of what actually raises blood sugar. People on low-carb diets often count
          them. Keep in mind that “net carbs” isn’t an official label term in the U.S., so the numbers printed on packages can vary
          between brands. If you track net carbs, subtract your fiber grams from your total, and make sure you stay consistent with
          whichever method you choose.
        </P>
      </Card>

      <Card title="What Kind of Carbohydrates Should We Eat?">
        <P>Quality matters as much as quantity. Two plans with the same carb grams can feel very different depending on where those grams come from.</P>
        <Lead lead="Better choices">
          are whole, minimally processed foods: vegetables, whole fruit, beans, lentils, oats, brown rice, quinoa, whole-grain bread
          and potatoes with the skin on. They bring fiber, vitamins, minerals and a slower rise in blood sugar.
        </Lead>
        <Lead lead="Choices to limit">
          are sodas, fruit juice, candy, pastries, white bread, sweetened cereal and many packaged snacks. Refined grains have had
          their fiber stripped out, and added sugars bring calories with little else. These foods are also easy to overeat. The
          difference isn’t a moral one. It’s simply that refined carbs digest fast and are less filling.
        </Lead>
        <P>
          The glycemic index (GI) ranks foods by how quickly they raise blood sugar. High-GI foods such as white bread and sugary
          drinks raise it fast, while oats, beans and most non-starchy vegetables raise it slowly. You don’t need to memorize GI
          values, but choosing fiber-rich foods generally gets you the same result.
        </P>
        <P>A simple approach is to build most of your carb allowance from whole foods and let sweets and refined snacks fill whatever room is left.</P>
      </Card>

      <Card title="What Foods Contain Carbohydrates?">
        <P>Carbs are in more foods than most people realize. The main sources include:</P>
        <List items={[
          ["Grains and grain products:", "bread, rice, pasta, oats, cereal, tortillas and crackers"],
          ["Starchy vegetables:", "potatoes, corn, peas, winter squash and sweet potatoes"],
          ["Legumes:", "beans, lentils and chickpeas"],
          ["Fruit:", "fresh, frozen, dried or juiced"],
          ["Dairy:", "milk and yogurt (cheese has very little)"],
          ["Sweets and snacks:", "candy, cookies, cake, ice cream and sweetened drinks"],
        ]} />
        <P>Meat, fish, eggs, oils and butter contain little to no carbohydrate.</P>
        <H3>Carbohydrates in Vegetables</H3>
        <P>
          Vegetables contain three kinds of carbohydrates: starch, natural sugars and fiber. Starchy vegetables are the highest in
          carbs. A medium baked potato has roughly 35 to 37 grams, a cup of cooked corn or peas has about 25 to 30, and a medium sweet
          potato has about 25 to 27. Beets, parsnips and winter squash are moderate. Non-starchy vegetables such as spinach, lettuce,
          broccoli, cauliflower, zucchini and peppers are low, usually around 5 grams or less per cup, and much of that is fiber.
        </P>
        <H3>Fruits That Are High in Carbohydrates</H3>
        <P>
          Fruit carbs come mostly from natural sugars, along with fiber. A medium banana has about 27 grams, a cup of grapes about 27,
          a cup of mango about 25, and a cup of cherries about 25. Dried fruit is much more concentrated. A small handful of raisins
          can carry as many carbs as a whole banana. Berries are the lower-carb option, at roughly 12 to 20 grams per cup.
        </P>
        <H3>Do Oats Contain Carbohydrates?</H3>
        <P>
          Yes. Oats are a high-carb food, but a healthy one. A half cup of dry rolled oats has roughly 27 grams of carbohydrate,
          including about 4 grams of fiber. That includes beta-glucan, a soluble fiber linked to lower cholesterol. Oats digest
          slowly, which makes them a good choice for steady energy, though sweetened instant packets can add a lot of sugar.
        </P>
      </Card>

      <Card title="How Are Carbohydrates Digested?">
        <P>
          Digestion begins in your mouth, where an enzyme in saliva (amylase) starts breaking starch into smaller pieces. The process
          pauses in the stomach, then picks up in the small intestine, where more enzymes finish the job. Disaccharides like sucrose
          and lactose are split into single sugars too.
        </P>
        <H3>What Are the End Products of Carbohydrate Digestion?</H3>
        <P>
          The end products are monosaccharides: mainly glucose, along with fructose and galactose. These small sugars are absorbed
          through the wall of the small intestine into the bloodstream. Fiber isn’t broken down by your own enzymes. It travels to the
          large intestine, where gut bacteria ferment part of it into short-chain fatty acids that help nourish the colon.
        </P>
        <H3>Carbohydrate Metabolism, Briefly</H3>
        <P>
          Once glucose enters your blood, your pancreas releases insulin, which helps cells take it in. Your cells use what they need
          right away. Extra glucose is packed into glycogen in the liver and muscles. When those stores are full, the body can convert
          some of the surplus to fat, although this conversion is a fairly inefficient process in humans. In practice, weight gain
          comes mostly from eating more total calories than you burn. Carbs, fat and protein can all contribute to that surplus.
          Between meals, your liver releases stored glucose to keep your blood sugar steady.
        </P>
      </Card>

      <Card title="Are Carbohydrates Essential or Non-Essential Nutrients?">
        <P>
          Strictly speaking, carbohydrates are classed as non-essential. Your body can make glucose from protein and fat through a
          process called gluconeogenesis, so there’s no specific carbohydrate you must eat to survive, unlike certain fats and amino
          acids.
        </P>
        <P>
          But non-essential doesn’t mean unimportant. A diet with no carbohydrate-containing foods would also cut out fiber, many
          vitamins and most fruits, vegetables and whole grains. That’s why health authorities still set a daily minimum and a
          recommended range.
        </P>
      </Card>

      <Card title="What Happens If You Don’t Eat Any Carbohydrates?">
        <P>
          If you stop eating carbs entirely, your body adjusts. Once glycogen runs out, usually within a day or two, your liver starts
          making ketones from fat to fuel the brain, and it makes some glucose from protein. This state is called ketosis, and it’s
          the basis of ketogenic diets.
        </P>
        <P>
          The adjustment period can be rough. Common short-term effects include fatigue, headaches, dizziness, irritability, muscle
          cramps, constipation and bad breath. These often ease after a couple of weeks. Over the long term, a diet with almost no
          carbs makes it harder to get enough fiber and micronutrients, and it may not suit people with certain medical conditions.
        </P>
        <H3>What Diseases Are Caused by a Lack of Carbohydrates?</H3>
        <P>
          Eating too few carbs doesn’t cause one specific named disease in healthy people the way a vitamin shortage can. The risk is
          in what comes with it: low fiber and constipation, poor workout performance, and muscle breakdown if total calories and
          protein are also too low. In people with diabetes who take insulin or certain medications, very low carbohydrate intake can
          contribute to dangerously low blood sugar or, in some cases, ketoacidosis. If you have any health condition, talk to your
          doctor before restricting carbs sharply.
        </P>
      </Card>

      <Card title="What Happens When You Have Too Many Carbohydrates?">
        <P>
          Eating too many carbs, especially refined ones, usually means eating too many calories. The extra energy is stored as
          glycogen first, then as body fat. Over time, this can lead to weight gain, and a diet heavy in sugary drinks and refined
          grains is linked to higher rates of obesity, type 2 diabetes and heart disease. In the short term, big carb-heavy meals can
          cause energy swings and strong hunger a few hours later.
        </P>
        <H3>Does Eating Carbohydrates Increase the Risk of Diabetes?</H3>
        <P>
          Carbohydrates don’t directly cause type 2 diabetes. The main risk factors are excess body weight, inactivity, family history
          and age. That said, regularly eating large amounts of added sugar and refined grains can make weight gain more likely and
          may contribute to insulin resistance over time. Diets rich in whole grains, vegetables and fiber are linked to a lower risk.
        </P>
        <H3>What Carbohydrates Should a Diabetic Eat?</H3>
        <P>
          People with diabetes can still eat carbohydrates. The focus is usually on choosing high-fiber, slowly digested sources such
          as beans, lentils, non-starchy vegetables, whole grains, berries and plain Greek yogurt, and keeping portions consistent from
          meal to meal. Many people work with a doctor or registered dietitian to set a personal carb target and to match it with
          medication. This calculator can give a starting estimate, but it isn’t designed for medical diets.
        </P>
      </Card>

      <Card title="Do We Need Carbohydrates to Build Muscle?">
        <P>
          You can build muscle without a high-carb diet, but carbohydrates make the process easier. They fuel hard training, help you
          recover by refilling glycogen, and reduce the amount of protein your body burns for energy. Protein provides the building
          material, while carbs provide the fuel to train hard enough to need it.
        </P>
        <P>
          Lifters often do well in the 45% to 65% range, and endurance athletes may go higher during heavy training. For muscle gain,
          a calorie surplus matters more than the exact split, so the 55% and 65% options are good starting points.
        </P>
      </Card>

      <Card title="Low-Carb Diets: Best Carbs to Eat and Easy Breakfast Ideas">
        <P>
          If you choose the 40% option or go lower, the quality of your carbs matters even more, because you have fewer grams to
          spend. Good choices include:
        </P>
        <List items={[
          ["", "Non-starchy vegetables such as leafy greens, broccoli, cauliflower, zucchini, peppers and tomatoes"],
          ["", "Berries, which are the lowest-carb fruit"],
          ["", "Beans and lentils in moderate portions, for fiber and protein"],
          ["", "Nuts and seeds"],
          ["", "Plain Greek yogurt or cottage cheese"],
          ["", "Small portions of oats, quinoa or sweet potatoes, if your target allows"],
        ]} />
        <P>Breakfast is where many people struggle, since the usual options are cereal, toast and juice. These lower-carb alternatives work well:</P>
        <List items={[
          ["", "Scrambled eggs with spinach and tomatoes"],
          ["", "Greek yogurt with berries and chopped nuts"],
          ["", "A vegetable omelet with a side of avocado"],
          ["", "Cottage cheese with cucumber or sliced peaches"],
          ["", "Chia pudding made with unsweetened milk"],
        ]} />
        <P>Most of these are under 15 grams of carbohydrate, but check labels, since sauces and flavored yogurts add up quickly.</P>
      </Card>

      <Card title="When You Would Need a Carb Calculator">
        <P>People reach for this tool in a handful of common situations.</P>
        <List items={[
          ["Starting a weight-loss plan.", "You want a sensible carbohydrate figure rather than guessing or copying someone else’s macros. The calculator gives you a number tied to your own body and goal."],
          ["Meal planning and prepping.", "Once you have a daily gram target, you can split it across meals and snacks and shop accordingly."],
          ["Training for an event.", "Endurance and strength athletes often raise their carb share during heavy training weeks. Comparing 55%, 65% and 75% shows how much extra fuel that means in grams."],
          ["Trying a lower-carb approach.", "If you’re curious about a moderate low-carb way of eating, the 40% option shows what it looks like in practice before you commit."],
          ["Checking an existing diet.", "You may already be tracking food in an app and wonder whether your carbs are too high or too low for your size and activity. The calculator gives you a quick benchmark."],
          ["Supporting a general health goal.", "Parents, students and busy professionals use it to build better habits without strict dieting."],
        ]} />
        <P>
          If you have diabetes, prediabetes, kidney disease or any other condition that affects how you handle carbohydrates, your
          care team’s guidance should take priority. This tool can complement their advice but can’t replace it.
        </P>
      </Card>

      <Card title="Practical Tips for Hitting Your Carb Target">
        <P>
          Start by choosing one percentage and following it for two to three weeks. Weigh yourself at consistent times and note your
          energy, hunger and performance. If your weight moves the wrong way, adjust total calories first, then fine-tune the carb
          share.
        </P>
        <P>
          Spread carbs across the day rather than loading them into one meal, especially around workouts. Pair them with protein and
          fiber to stay full longer. Reading labels also helps, since many “healthy” packaged foods contain more carbohydrate than
          you’d expect. Finally, recalculate whenever your weight, activity or goal changes meaningfully. A target that fit you at 200
          pounds may not suit you at 175.
        </P>
      </Card>

      <Card title="Free, Private and Reliable">
        <P>This carbohydrate calculator is free to use, with no hidden charges. You get the full results without paying for a premium tier.</P>
        <P>
          On accuracy, the results are estimates based on established nutrition principles, not a clinical assessment. They’re a
          strong starting point for most healthy adults. They aren’t intended for children, pregnant or breastfeeding women, people
          with medical conditions affecting metabolism, or anyone with a history of disordered eating. In those cases, consult a doctor
          or registered dietitian.
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
