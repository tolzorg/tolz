import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a good BMR?",
    a: "One that fits your age, sex, size and body composition. Most adult women fall around 1,200 to 1,600 calories per day and most adult men around 1,500 to 2,000.",
  },
  {
    q: "Which BMR formula is most accurate?",
    a: "Mifflin-St Jeor for most people. Katch-McArdle can do better if you’re lean and know your body fat percentage.",
  },
  {
    q: "How do I calculate BMR manually?",
    a: "For men, use 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5. For women, use the same formula and subtract 161 instead.",
  },
  {
    q: "What’s the difference between BMR and RMR?",
    a: "BMR is measured under strict resting, fasted conditions. RMR is measured under looser ones and usually reads a bit higher.",
  },
  {
    q: "What’s the difference between BMR and TDEE?",
    a: "BMR is what you burn at rest. TDEE is BMR times an activity factor, covering everything you do in a day.",
  },
  {
    q: "Should I eat my BMR in calories?",
    a: "Not as a standard target. Most people need more once movement is included, and eating well under your BMR for long periods can hurt energy, mood and health.",
  },
  {
    q: "How can I increase my BMR?",
    a: "Build muscle with strength training, eat enough protein, avoid crash dieting, sleep well and get thyroid problems checked.",
  },
  {
    q: "Does BMR change with age or weight loss?",
    a: "Yes. It tends to decline with age and drops as you lose weight, so recalculate after significant changes.",
  },
  {
    q: "Is the calculator different for men and women?",
    a: "Mifflin-St Jeor and Harris-Benedict include sex. Katch-McArdle uses lean body mass instead.",
  },
  {
    q: "Do I need to sign up to use this BMR calculator?",
    a: "No. It’s free and works without registration.",
  },
];

// The supplied FAQ schema words its questions and answers differently from the
// displayed FAQ, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a good BMR?", a: "One that fits your age, sex, size and body composition. Most adult women fall around 1,200 to 1,600 calories per day and most adult men around 1,500 to 2,000." },
  { q: "Which BMR formula is most accurate?", a: "Mifflin-St Jeor for most people. Katch-McArdle can do better if you are lean and know your body fat percentage." },
  { q: "How do I calculate BMR manually?", a: "For men, use 10 x weight (kg) + 6.25 x height (cm) - 5 x age + 5. For women, use the same formula and subtract 161 instead." },
  { q: "What is the difference between BMR and RMR?", a: "BMR is measured under strict resting, fasted conditions. RMR is measured under looser conditions and usually reads a bit higher." },
  { q: "What is the difference between BMR and TDEE?", a: "BMR is what you burn at rest. TDEE is BMR multiplied by an activity factor and covers everything you do in a day." },
  { q: "Should I eat my BMR in calories?", a: "Not as a standard target. Most people need more once movement is included, and eating well under your BMR for long periods can hurt energy, mood and health." },
  { q: "How can I increase my BMR?", a: "Build muscle with strength training, eat enough protein, avoid crash dieting, sleep well and get thyroid problems checked." },
  { q: "Does BMR change with age or weight loss?", a: "Yes. It tends to decline with age and drops as you lose weight, so recalculate after significant changes." },
  { q: "Do I need to sign up to use this BMR calculator?", a: "No. It is free and works without registration." },
];

const TYPICAL_HEADERS = ["Person", "Height", "Weight", "BMR (Mifflin-St Jeor)"];
const TYPICAL_ROWS = [
  ["Woman, 30", "165 cm (5'5\")", "65 kg (143 lb)", "about 1,370 kcal"],
  ["Woman, 50", "160 cm (5'3\")", "70 kg (154 lb)", "about 1,289 kcal"],
  ["Man, 30", "178 cm (5'10\")", "80 kg (176 lb)", "about 1,768 kcal"],
  ["Man, 50", "175 cm (5'9\")", "85 kg (187 lb)", "about 1,699 kcal"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const h4Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: "12px 0 6px" };
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
/** An outside source, opened in a new tab so this page stays open. */
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const H4 = ({ children }) => <h4 style={h4Style}>{children}</h4>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items, ordered }) => {
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
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function BmrCalculatorFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is the Basal Metabolic Rate?">
        <P>
          Basal metabolic rate (BMR) is the energy your body needs to stay alive at complete rest. It covers your heartbeat,
          breathing, blood circulation, body temperature, cell repair, hormone production, nutrient processing and brain activity.
          It’s measured in kilocalories (what most people just call calories) per day.
        </P>
        <P>
          A common comparison is an idle car. The engine’s running, the gas is burning, but you’re parked. BMR is that idle burn.
          For most people it makes up around 60 to 70 percent of total daily energy use. Physical activity accounts for about 20
          percent, and digesting food (the thermic effect of food) takes roughly 10 percent. That’s why BMR sits at the base of
          every calorie plan.
        </P>
        <P>
          Strictly speaking, BMR is measured under tight conditions: you’re awake but completely rested, you’ve fasted for around 12
          hours, the room is a comfortable temperature, and your nervous system isn’t revved up. That’s the “post-absorptive” state
          you’ll see in textbooks. It just means your digestive system has settled down and isn’t burning extra energy to process
          food.
        </P>
        <H3>BMR vs. Daily Calorie Needs</H3>
        <P>
          BMR isn’t what you should eat. It’s the floor. Your actual daily need, called total daily energy expenditure (TDEE), is
          your BMR multiplied by an activity factor, usually between 1.2 and 1.9. We’ll walk through that below.
        </P>
        <H3>What’s the Difference Between Metabolism and Basal Metabolic Rate?</H3>
        <P>
          “Metabolism” is the big umbrella: every chemical reaction in your body that turns food into energy and builds or breaks
          down tissue. It includes what you burn at rest, what you burn moving around, and what you burn digesting lunch. BMR is
          just one slice, the resting part. People say “my metabolism is slow” when they usually mean their total daily burn is
          lower than they’d like, which depends on far more than BMR.
        </P>
        <H3>Basal Metabolism vs. Basal Metabolic Rate</H3>
        <P>
          These two are basically the same idea said two ways. “Basal metabolism” describes the process, meaning the baseline
          chemistry that keeps you alive. “Basal metabolic rate” puts a number on it: how fast that process runs, in calories per
          day. In everyday conversation and in most calculators, nobody treats them differently.
        </P>
      </Card>

      <Card title="What Is a Healthy Basal Metabolic Rate?">
        <P>
          There’s no single healthy number, because BMR depends on how big you are, how much muscle you have, how old you are and
          your sex. A healthy BMR is one that fits your body and is in the expected range for someone with your stats. If a
          calculator says 1,400 and you’re a 5'4" woman in your forties, that’s perfectly normal. The same number for a 6'3" man
          would be unusually low.
        </P>
        <H3>What Is the Normal Basal Metabolic Rate for Males and Females?</H3>
        <P>Most healthy adults fall in these ballparks:</P>
        <List items={[
          ["Adult women:", "about 1,200 to 1,600 calories per day"],
          ["Adult men:", "about 1,500 to 2,000 calories per day"],
        ]} />
        <P>Here’s what the Mifflin-St Jeor equation gives for a few typical adults, so you can see how much it moves:</P>
        <DataTable headers={TYPICAL_HEADERS} rows={TYPICAL_ROWS} />
        <P>
          Men usually run higher because they carry more lean mass and tend to be bigger. That gap shows up in the formulas as the
          +5 for men versus −161 for women, a 166-calorie swing before anything else is counted.
        </P>
        <H3>How Do You Know If Your Basal Metabolic Rate Is Good?</H3>
        <P>
          Compare your result to the range for your age, sex and size, then check it against how you actually feel and what the
          scale does. If you eat around your estimated maintenance for a few weeks and your weight holds steady, your numbers are
          working. If your weight keeps drifting well away from what the math predicts, your real metabolism is a bit different
          from the estimate. That doesn’t mean something is “wrong.” It means you adjust.
        </P>
        <P>
          If you want a more objective read, a lab test or a calorimetry device (more on that below) is the real answer. An online
          BMR calculator can only estimate.
        </P>
        <H3>Are People With a High BMR Healthier?</H3>
        <P>
          Not automatically. A high BMR tied to more muscle and good fitness is a good sign. A high BMR caused by an overactive
          thyroid, fever, or some other medical issue is not. What matters is why your number is what it is. A bigger engine isn’t
          “better” if the cause is a problem.
        </P>
      </Card>

      <Card title="What Does a Low Basal Metabolic Rate Mean?">
        <P>
          A low BMR means your body is using fewer calories at rest than expected for someone your size and age. Sometimes that’s
          simply how you’re built: smaller frame, less muscle, older age, or genetics. Sometimes it’s a response to something, like
          long-term aggressive dieting or an underactive thyroid.
        </P>
        <H3>Symptoms of a Low Resting Metabolic Rate</H3>
        <P>
          There’s no symptom checklist that proves a slow metabolism, but these tend to show up together when it’s related to
          thyroid problems or chronic under-eating:
        </P>
        <List items={[
          ["", "Constant tiredness, even after enough sleep"],
          ["", "Feeling cold when others are comfortable"],
          ["", "Dry skin, thinning hair or brittle nails"],
          ["", "Constipation"],
          ["", "Weight gain you can’t explain, or trouble losing weight"],
          ["", "Low mood or brain fog"],
          ["", "In women, irregular or missing periods"],
        ]} />
        <P>
          If several of these sound familiar, see a doctor and ask about thyroid testing. Don’t try to fix it with extreme dieting
          or supplements. That usually makes it worse.
        </P>
        <H3>Is There Anything I Can Do About an Extremely Low Basal Metabolic Rate?</H3>
        <P>
          Yes, and it depends on the cause. If you’ve been eating very little for months, the fix is usually eating more
          consistently, getting enough protein, and lifting weights, ideally with a doctor or dietitian guiding the pace. If it’s
          thyroid-related, treatment from a doctor is what actually moves it. If it’s mostly age, size or genetics, you can’t change
          those, but you can build lean mass, which is the one big lever you do control.
        </P>
        <H3>How Do I Get From a Very Low Metabolic Rate Back to Normal?</H3>
        <P>
          Slowly, and without crash dieting. Raise your intake in steps rather than jumping straight to full maintenance (a
          dietitian can help set that pace if you’ve been restricting for a long time). Eat enough protein, strength train two to
          three times a week, sleep seven or more hours, and get any thyroid or hormone issues checked. Metabolic adaptation from
          dieting is real but it’s not permanent. It tends to ease as weight stabilizes and intake returns to a reasonable level. If
          you’ve been under-eating for a long period, or this connects to an eating disorder, work with a healthcare professional
          rather than doing this alone.
        </P>
        <H3>Do People With a Low Metabolic Rate Live Longer?</H3>
        <P>
          The honest answer is that it’s unclear. Calorie restriction extends lifespan in some animal studies, which led to the idea
          that a slower metabolism might protect against aging. In humans, the evidence is mixed. A low BMR caused by a thyroid
          problem or lost muscle isn’t linked to better health, and low muscle mass in older adults is tied to worse outcomes. Don’t
          aim for a low metabolism. Aim for a healthy body composition and let the number land where it lands.
        </P>
      </Card>

      <Card title="What Is the Difference Between Resting Metabolic Rate and Basal Metabolic Rate?">
        <P>
          People use the two terms like they’re identical, and for calculator purposes they’re close enough. The real difference is
          how strict the measurement is.
        </P>
        <P>
          BMR requires nearly perfect conditions: you’ve fasted about 12 hours, slept well, you’re lying still in a temperate room,
          and your body is completely rested. Resting metabolic rate (RMR), sometimes called resting energy expenditure (REE), is
          measured while you’re relaxed but not under such rigid rules. It’s easier to do in a clinic or gym, and it usually comes
          out a bit higher, often by something like 10 percent, since your body isn’t in the deepest rest state.
        </P>
        <P>
          So when a lab gives you an “RMR” number and a calculator gives you a “BMR” number, they’ll land close but are rarely
          identical.
        </P>
        <H3>Basal vs. Active Metabolic Rate</H3>
        <P>
          Active metabolic rate (AMR) is the energy you burn while moving: walking, working, exercising, even fidgeting. Add your BMR
          and AMR together, plus digestion, and you get TDEE. Basically, BMR is the idle burn, AMR is the driving burn.
        </P>
        <H3>What About Basal, Standard and Field Metabolic Rate?</H3>
        <P>
          You’ll see these terms in biology courses. Basal metabolic rate is used for warm-blooded animals (humans, mammals, birds)
          at rest in their comfortable temperature zone. Standard metabolic rate is the equivalent measurement for cold-blooded
          animals like reptiles and fish, since their body temperature follows the environment. Field metabolic rate is the total
          energy an animal burns living its normal life in the wild.
        </P>
        <P>
          Body size matters across all three. Larger animals burn more total energy but less per pound than smaller ones. A mouse
          burns far more energy per gram than an elephant. A big reason is surface area: small bodies lose heat faster relative to
          their size, so they run hotter. For humans, this is why taller and heavier people have higher BMRs, but not in a straight
          line with weight.
        </P>
      </Card>

      <Card title="What Is the Major Factor That Determines BMR?">
        <P>
          Body composition, meaning how much lean mass you have. Fat-free mass (muscle, organs, bone, water) explains the biggest
          share of the difference in BMR between people. Age, thyroid hormones and fat mass add smaller pieces. That’s also why the
          Katch-McArdle formula, which is built around lean mass, can be more accurate for people who know their body fat
          percentage.
        </P>
        <H3>Who Has a Higher BMR: Someone With More Muscle or More Fat?</H3>
        <P>
          The person with more muscle, at the same weight. Research commonly puts resting muscle at about 13 calories per kilogram
          per day (roughly 6 per pound), and fat at about 4.5 per kilogram (roughly 2 per pound). The gap is real but smaller than
          gym lore suggests. Adding 5 pounds of muscle might raise your BMR by around 30 calories, not hundreds. It’s worth doing for
          strength and health, but it isn’t a metabolic cheat code.
        </P>
        <H3>Why Do Overweight People Often Have Higher BMRs?</H3>
        <P>
          A larger body has more tissue to keep running. More fat mass, and also more lean mass (carrying extra weight builds some
          muscle and organ mass too). So in absolute calories per day, people with higher body weight usually have higher BMRs than
          lean people of the same height. Per kilogram of body weight it’s the other way around, since fat burns less than muscle.
          People with obesity don’t have “slow metabolisms” as a rule. The research is pretty consistent on that.
        </P>
        <H3>Why Do Men Have Higher BMRs Than Women?</H3>
        <P>
          Mostly body composition. Men on average have more muscle, less body fat and larger frames. When you compare men and women
          with the same lean mass, most of the gap shrinks a lot. That’s why Katch-McArdle doesn’t ask for sex.
        </P>
      </Card>

      <Card title="What Is the Best Formula for Calculating BMR?">
        <P>
          Mifflin-St Jeor is the best general-purpose pick. A major review of predictive equations from the Academy of Nutrition
          and Dietetics found it the most reliable for estimating resting energy in healthy adults (<Ext href="https://pubmed.ncbi.nlm.nih.gov/15883556/">Frankenfield et al., 2005</Ext>). It
          came out of the original <Ext href="https://pubmed.ncbi.nlm.nih.gov/2305711/">Mifflin et al. study in 1990</Ext>, which was built on a more modern population than older equations.
        </P>
        <P>
          The history is pretty straightforward. Harris-Benedict came first in 1919, was revised in 1984 and held on as the standard
          until Mifflin-St Jeor showed up in 1990 and tested better. Katch-McArdle works differently by using lean body mass, which
          neither of the other two considers.
        </P>
        <H3>The Three Equations This Calculator Uses</H3>
        <H4>Mifflin-St Jeor</H4>
        <Formula>
          Men: BMR = 10W + 6.25H − 5A + 5<br />
          Women: BMR = 10W + 6.25H − 5A − 161
        </Formula>
        <H4>Revised Harris-Benedict (1984)</H4>
        <Formula>
          Men: BMR = 13.397W + 4.799H − 5.677A + 88.362<br />
          Women: BMR = 9.247W + 3.098H − 4.330A + 447.593
        </Formula>
        <H4>Katch-McArdle</H4>
        <Formula>BMR = 370 + 21.6 × (1 − F) × W</Formula>
        <P>
          Here W is weight in kg, H is height in cm, A is age in years, and F is body fat as a decimal (so 20 percent is 0.20).
          Technically, Katch-McArdle estimates resting daily energy expenditure (RDEE), but it’s used the same way.
        </P>
        <H4>Which One Should You Pick?</H4>
        <P>
          If you don’t know your body fat, go with Mifflin-St Jeor. If you have a decent measurement (a DEXA scan, or a reliable
          skinfold or bioimpedance reading) and you’re lean, muscular or an athlete, Katch-McArdle is worth trying. Use
          Harris-Benedict mainly when you want to compare against older books, apps or diet plans that still use it. Running all
          three and looking at the spread gives you a realistic range, which is more honest than one number.
        </P>
      </Card>

      <Card title="How to Use This Free BMR Calculator">
        <P>It takes less than a minute:</P>
        <List ordered items={[
          ["Pick a formula.", "Open the settings to switch between Mifflin-St Jeor, Harris-Benedict and Katch-McArdle."],
          ["Enter your details.", "Choose metric or imperial, then add sex, age, height and weight. If you picked Katch-McArdle, add body fat percentage."],
          ["Choose an activity level", "from the six options."],
          ["Read your results.", "You’ll get BMR plus the calories needed at each activity level."],
        ]} />
        <P>
          Use your current weight, not your goal weight. If you’re losing or gaining, rerun it every time you’ve moved by a few
          kilograms, because BMR shifts with body size.
        </P>
      </Card>

      <Card title="From BMR to Daily Calories: The Six Activity Levels">
        <P>
          Your BMR times an activity factor gives you maintenance calories (TDEE). The factors run from about 1.2 for mostly sitting
          to about 1.9 for very hard daily training or a physically demanding job. The calculator shows all six at once.
        </P>
        <P>
          That’s on purpose. Most people overestimate how active they are. A desk job with three workouts a week is usually lighter
          than people think, and the jump between two neighboring levels can easily be 300 calories or more. If you’re torn between
          two, take the lower one, track for a couple of weeks, and adjust.
        </P>
        <P>
          Once you have maintenance, the rest is simple: eat below it for a deficit, above it for a surplus. A gap of around 300 to
          500 calories either way is a common starting point for gradual change, but your body’s response over a few weeks matters
          more than any formula.
        </P>
        <H3>A Worked Example</H3>
        <P>Take a 35-year-old man, 180 cm and 80 kg.</P>
        <List items={[
          ["Mifflin-St Jeor:", "800 + 1,125 − 175 + 5 = 1,755 kcal"],
          ["Harris-Benedict:", "about 1,825 kcal"],
          ["Katch-McArdle at 12.5% body fat (70 kg lean mass):", "370 + (21.6 × 70) = 1,882 kcal"],
        ]} />
        <P>
          The spread is about 130 calories, which is normal. Katch-McArdle is higher here because he’s leaner and more muscular than
          the average guy his size, something the other two can’t see. At a moderate activity factor of 1.55, his maintenance using
          Mifflin-St Jeor is about 2,720 calories.
        </P>
      </Card>

      <Card title="Does Eating at Your BMR Help You Lose Weight?">
        <H3>The Relationship Between BMR and Weight Loss</H3>
        <P>
          BMR is the biggest chunk of what you burn, so it sets the baseline for any deficit. Lose weight and your BMR drops a bit,
          because there’s less of you to keep running. That’s part of why progress slows over time and why recalculating matters.
        </P>
        <H3>If You Eat Just Your BMR in Calories, Will You Lose Weight?</H3>
        <P>
          Probably yes, since your BMR is lower than your total daily burn. But that doesn’t make it a good plan. If your TDEE is
          2,200 and you eat 1,500 (your BMR), that’s a big 700-calorie deficit, and it’s hard to hold. It also makes getting enough
          protein and nutrients tougher, and tends to cost muscle. Eating well below your BMR for a long time can leave you tired,
          irritable and cold, and it can slow your metabolism. For most people, a moderate deficit from TDEE works better than
          eating “your BMR.”
        </P>
      </Card>

      <Card title="How to Increase Your Basal Metabolic Rate">
        <P>
          Let’s keep expectations realistic. Most of your BMR is fixed by body size, age and genetics. But some things do move it,
          and a few that people swear by don’t.
        </P>
        <H3>Scientific Ways to Increase BMR</H3>
        <List items={[
          ["Build muscle.", "Strength training is the main lever. Lifting two to three times a week with progressive overload adds lean mass, which raises resting burn. The gain is modest but it also protects you against the age-related muscle loss that does lower BMR."],
          ["Eat enough protein.", "Protein has the highest thermic effect (your body spends around 20 to 30 percent of its calories just processing it) and helps you hold on to muscle while dieting."],
          ["Don’t crash diet.", "Severe restriction can cut BMR by something like 10 to 30 percent as the body conserves energy, according to commonly cited starvation research."],
          ["Sleep enough.", "Poor sleep messes with hormones tied to appetite and metabolism."],
          ["Treat thyroid problems.", "If a doctor finds an underactive thyroid, treatment is the most direct way to restore normal metabolic rate."],
        ]} />
        <H3>Ways to Increase BMR Besides Food and Exercise</H3>
        <P>
          Honestly, there aren’t many. Getting enough sleep, managing a thyroid condition if you have one, and staying out of
          extreme under-eating are the real ones. Everything else (special teas, “metabolism-boosting” pills, cold plunges as a
          weight-loss trick) shows small or short-lived effects at best, and some supplements aren’t safe. Caffeine can bump your
          burn a few percent for a couple of hours, but you’ll adapt, and it’s not a fat-loss plan.
        </P>
        <H3>How to Increase BMR Without Exercising</H3>
        <P>
          Mostly this means protecting what you have. Eat enough protein, don’t diet too hard, sleep well and stay out of the
          long-term under-eating trap. You can also raise total daily burn (not BMR itself) by moving more in everyday life. NEAT,
          or non-exercise activity thermogenesis, covers things like walking, standing, cleaning and fidgeting, and for some people
          it adds up to hundreds of calories a day.
        </P>
        <H3>How Can Women Increase BMR Naturally?</H3>
        <P>
          The same basics apply, with a few extra points. Women often get told to avoid lifting, which is bad advice, because
          strength training is the best natural tool for keeping lean mass. Eating enough matters too, since chronic under-eating
          can disrupt hormones and periods. And around menopause, BMR can shift along with hormones and muscle mass, so strength
          training and enough protein become even more useful. Talk to a doctor if you notice big changes.
        </P>
        <H3>Does Aerobic Exercise Increase BMR?</H3>
        <P>
          Not directly. Running, cycling and swimming burn plenty of calories while you’re doing them, but they don’t build much
          muscle, so your resting rate doesn’t change much. There’s a small afterburn effect following hard sessions, but it’s
          minor. Cardio is great for heart health and total daily burn. Strength work is what moves BMR.
        </P>
      </Card>

      <Card title="What Affects Your Basal Metabolic Rate?">
        <H3>Muscle Mass</H3>
        <P>More lean tissue means a higher resting burn. This is the main controllable factor.</P>
        <H3>Age and Why BMR Drops Over Time</H3>
        <P>
          BMR tends to decline with age, partly because people lose muscle. Interestingly, a large 2021 study published in Science
          found that, once body size is accounted for, metabolism stays remarkably stable from your 20s through your 50s and only
          starts to decline gradually after about age 60 (Pontzer et al., 2021). That challenges the idea that your metabolism
          crashes at 30 or 40. Keeping muscle matters more than the calendar.
        </P>
        <H3>Genetics</H3>
        <P>
          Your parents’ traits play a role in how your body runs at rest. You can’t change this, but you can work around it.
        </P>
        <H3>Temperature and Weather</H3>
        <P>
          Cold makes your body spend extra energy to stay warm (shivering, and activating brown fat in some people). Very hot
          weather can also push it up a bit as your body works to cool down. These effects are small for most people living in
          normal conditions, so staying warm or sleeping cold won’t transform your weight.
        </P>
        <H3>Diet</H3>
        <P>
          Eating regularly keeps things steady. Severe calorie restriction can lower BMR substantially. A useful comparison is a
          phone in battery-saver mode: when fuel runs short, the body cuts back on energy, mood, hormone production and even brain
          function to make what it has last.
        </P>
        <H3>Pregnancy and Hormones</H3>
        <P>
          Pregnancy raises energy needs because the body supports another growing person, which is part of why appetite increases.
          Menopause can raise or lower BMR depending on how hormones and body composition change.
        </P>
        <H3>Fever and Illness</H3>
        <P>
          A fever raises BMR. A common rule of thumb is roughly 10 to 13 percent for each degree Celsius your core temperature
          climbs, though the exact figure varies from person to person and illness to illness.
        </P>
        <H3>Supplements and Medications</H3>
        <P>
          Stimulants like caffeine raise burn slightly. Thyroid hormone medication changes it significantly. Some other drugs also
          affect metabolism, so ask your doctor if you take prescriptions.
        </P>
      </Card>

      <Card title="Common Metabolism Questions, Answered">
        <H3>Does Hot Weather Increase Your Metabolism?</H3>
        <P>
          A bit, but not by much. Your body does burn some extra energy cooling itself in heat, though people living in hot climates
          don’t have dramatically higher BMRs. Heat can also suppress appetite, which makes it feel like something bigger is
          happening.
        </P>
        <H3>Does Cool Temperature or Staying Warm Change It?</H3>
        <P>
          Cool temperatures can nudge your burn up through shivering and brown fat activity. Staying warm does the opposite,
          slightly. The effect is real but small compared to muscle, age and diet.
        </P>
        <H3>Does Coffee Speed Up Metabolism?</H3>
        <P>
          Slightly and briefly. Caffeine can raise resting energy use by a few percent for a few hours. It won’t offset a bad week of
          eating, and tolerance builds.
        </P>
        <H3>Does Eating Slowly Increase Metabolism?</H3>
        <P>
          Not in any meaningful way. Eating slowly can help you feel full and eat less, which is useful, but the metabolic effect
          itself is tiny.
        </P>
        <H3>Does Chronic Anxiety Affect Metabolic Rate?</H3>
        <P>
          It can. Ongoing stress activates your sympathetic nervous system and stress hormones, which may nudge resting energy use
          up slightly in some people. Long-term stress also affects sleep, appetite and eating habits, which often matter more for
          weight. The research is mixed, so there’s no clean “anxiety burns calories” answer, and it’s not a healthy way to lose
          weight.
        </P>
        <H3>Does a Person’s Metabolism Stay Constant?</H3>
        <P>
          No. It moves with weight changes, muscle mass, age, illness, hormones, sleep, and how much you eat. That’s why a
          calculation from three years ago may not fit you today.
        </P>
        <H3>Is a Very High Metabolism a Real Condition?</H3>
        <P>
          A naturally fast metabolism is just variation between people, but a very high resting rate caused by something medical,
          like an overactive thyroid (hyperthyroidism), is a condition and needs treatment. See a doctor if you’re losing weight
          without trying and also have a racing heart, sweating, shakiness or heat intolerance.
        </P>
        <H3>Signs of a High Metabolism</H3>
        <P>
          Common signs include getting hungry often, running warm, staying lean without much effort, and sleeping lightly. In women,
          symptoms that go along with a medically high metabolism can include irregular periods, anxiety and unexplained weight
          loss. A person can have some of these without any problem, so only a doctor can say for sure.
        </P>
        <H3>Is Basal Metabolic Rate a Homeostatic Mechanism?</H3>
        <P>
          Not exactly. BMR itself is just the baseline energy cost of staying alive. But the body uses metabolic adjustments to keep
          conditions stable, like shivering or sweating to hold temperature, and slowing down energy use during prolonged
          under-eating. Those adaptive responses are homeostatic. BMR is the starting level they work from.
        </P>
        <H3>What Is Not a Factor That Lowers BMR?</H3>
        <P>
          Strength training and eating enough protein won’t lower it. Neither will drinking water or eating regularly. The things
          that tend to lower it are muscle loss, aging, severe calorie restriction, an underactive thyroid and weight loss itself.
        </P>
        <H3>How Do I Boost My Metabolism?</H3>
        <P>
          Lift weights, eat enough protein, sleep, stay active during the day and avoid crash diets. That’s the unglamorous but
          evidence-backed list.
        </P>
      </Card>

      <Card title="How Is BMR Measured? When Should You Test It?">
        <H3>Analytically Measuring Your BMR</H3>
        <P>
          The gold standard is indirect calorimetry. It measures how much oxygen you use and how much carbon dioxide you breathe out,
          which reveals your energy burn. Handheld devices and metabolic carts are used at some gyms, clinics, weight-loss centers
          and doctor’s offices. Whole-room calorimeters and the “doubly labeled water” method are used in research.
        </P>
        <H3>When Should BMR Be Measured?</H3>
        <P>
          For a true basal reading, first thing in the morning after about 12 hours without food, after a full night’s sleep,
          without having exercised hard or had caffeine, and while resting quietly in a comfortable room. For RMR, the conditions
          are looser but still best done in the morning, relaxed and fasted.
        </P>
        <H3>How Do I Know If My Resting Metabolic Rate Went Up or Down?</H3>
        <P>
          You can’t feel it directly. Track your weight trend, appetite, energy and body composition while eating consistently for
          two to three weeks. If you’re eating the same and your weight shifts steadily, your real burn has changed. If you want
          solid numbers, repeat a calorimetry test under the same conditions.
        </P>
      </Card>

      <Card title="Why a BMR Calculator Is Only an Estimate">
        <P>
          A <Ext href="https://pubmed.ncbi.nlm.nih.gov/15941872/">2005 analysis of BMR research</Ext> found that even after accounting for body composition, age and other known factors,
          around a quarter of the difference between individuals stayed unexplained. So even the best specialist measurement leaves
          some uncertainty, and an online equation is a rougher estimate still.
        </P>
        <P>
          So, for most healthy adults, the formulas land within roughly 10 percent of measured values. They’re less reliable for
          very lean athletes, people with obesity, older adults and people with medical conditions. Use the result as a starting
          point, not a verdict.
        </P>
        <P>
          The best method is the boring one: pick a calorie target, follow it for two to three weeks, track your weight trend, and
          adjust by 100 to 200 calories if reality doesn’t match the math. A simple food and exercise log makes it much easier to
          see what’s working and what isn’t.
        </P>
      </Card>

      <Card title="When You’d Actually Use a BMR Calculator">
        <List items={[
          ["Weight loss.", "You can’t set a sensible deficit without knowing maintenance."],
          ["Muscle gain.", "A surplus only makes sense measured from a decent baseline."],
          ["Meal planning.", "Coaches, dietitians and home cooks use it to size portions."],
          ["Plateaus.", "If progress stalls, recalculating shows whether your intake still fits your body."],
          ["Life changes.", "New job, injury, age milestones, a different training schedule or pregnancy planning all change your needs."],
          ["School and training.", "Nutrition students use it to check hand calculations."],
        ]} />
      </Card>

      <Card title="Free, Private and Simple to Use">
        <P>
          This BMR calculator is free, and you don’t need an account or a sign-up to see your results. There’s no payment step and
          no hidden fees. The numbers you enter are used to produce your estimate, and you can rerun it as many times as you want to
          compare formulas and activity levels. The formulas are standard and published above, so you can verify any result by
          hand.
        </P>
        <P>
          <strong>Please note:</strong> This calculator is for healthy adults and is for general information only. It doesn’t
          replace medical advice. If you have a thyroid condition, diabetes, a history of disordered eating or you’re pregnant, talk
          to a doctor or registered dietitian before making big changes. For more on healthy activity levels, see the{" "}
          <Ext href="https://www.cdc.gov/physical-activity-basics/guidelines/adults.html">CDC’s physical activity guidelines for adults</Ext>, and for a
          general overview of metabolism, see{" "}
          <Ext href="https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/metabolism/art-20046508">Mayo Clinic’s guide to metabolism and weight</Ext>.
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
