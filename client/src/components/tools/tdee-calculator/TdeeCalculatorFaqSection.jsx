import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a TDEE calculator?",
    a: "A TDEE calculator estimates the total calories you burn in a day by combining your basal metabolic rate with an activity multiplier. The result is your maintenance level.",
  },
  {
    q: "Is TDEE the same as maintenance calories?",
    a: "Yes. Your TDEE is the number of calories you can eat each day to keep your weight about the same.",
  },
  {
    q: "Can I get my results in kilojoules?",
    a: "Yes. The tool can show your results in calories or kJ. One calorie equals about 4.184 kilojoules.",
  },
  {
    q: "How often should I recalculate my TDEE?",
    a: "Recalculate after every 10 pounds (4 to 5 kg) of weight change, or whenever your activity level changes in a big way.",
  },
  {
    q: "Should I eat exactly my TDEE?",
    a: "Only if your goal is to maintain your weight. To lose weight, eat below it. To gain, eat above it.",
  },
  {
    q: "Is the TDEE calculator free?",
    a: "Yes. It is free to use, with no hidden charges.",
  },
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

export default function TdeeCalculatorFaqSection() {
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
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a TDEE Calculator and What Does TDEE Mean?">
        <P>
          TDEE stands for total daily energy expenditure. It is the total amount of energy your body uses in 24 hours. A TDEE
          calculator estimates that number from personal details instead of lab equipment, which makes it the most practical option
          for anyone who wants to manage their weight without guessing.
        </P>
        <P>
          The number a TDEE calculator gives you is your maintenance level. Eat around it and your weight should stay about the same
          over several weeks. Eat below it and you lose weight. Eat above it and you gain. Everything else in this guide builds on that
          idea.
        </P>
      </Card>

      <Card title="What Are the Three Factors That Determine Daily Energy Expenditure?">
        <P>Your TDEE comes from three main parts:</P>
        <List items={[
          ["Basal metabolic rate (BMR):", "The energy your body needs just to stay alive at rest, in a comfortable environment, with your digestive system inactive. It covers breathing, blood circulation, body temperature, and cell repair. For most people it makes up 60 to 70 percent of total daily energy use."],
          ["Thermic effect of food (TEF):", "The energy your body spends digesting, absorbing, and processing what you eat. It is often estimated at about 10 percent of your calorie intake, but it varies. Protein has a much higher thermic effect than fat because it takes more work to process."],
          ["Activity (TEA):", "The thermic effect of activity covers all the movement in your day. It has two pieces: planned exercise, such as running or lifting, and non-exercise activity thermogenesis (NEAT), which includes walking around, doing chores, standing at work, and fidgeting."],
        ]} />
        <P>
          Because activity and NEAT differ so much from person to person, two people of the same size can have a TDEE that differs by
          several hundred calories.
        </P>
      </Card>

      <Card title="What Is the Difference Between TDEE and the Calories You Burn in a Day?">
        <P>
          In everyday use, they mean the same thing. TDEE is simply the formal name for the total calories you burn in a day,
          including rest, digestion, and movement. The only difference is how people use the phrase. “Calories burned” often refers
          just to a workout or a tracker’s activity number, while TDEE is the full 24-hour total. If a watch says you burned 400
          calories during a run, that is part of your TDEE, not the whole thing.
        </P>
      </Card>

      <Card title="How to Use the Tolz TDEE Calculator">
        <P>The tool takes under a minute:</P>
        <List ordered items={[
          ["Enter your age and select your gender.", "The equation uses both because average body composition differs between men and women."],
          ["Add your height and current weight.", "A morning weight, taken before eating, gives the most consistent number."],
          ["Choose your activity level.", "This is the field that matters most. Pick the option that matches your typical week, not your best week."],
          ["Submit and read your results:", "maintenance calories (or kJ), suggested daily intakes for losing or gaining weight, and your BMI."],
        ]} />
        <P>
          If you are torn between two activity levels, choose the lower one. Overestimating activity is the most common reason a
          calculated target does not match real results.
        </P>
      </Card>

      <Card title="How Do You Calculate Your BMR and TDEE?">
        <P>Any reliable TDEE calculator works in two steps. It first estimates your BMR, then multiplies it by an activity factor.</P>
        <P>
          For step one, the Mifflin-St Jeor equation is one of the most widely used and best-tested formulas for healthy adults (
          <Ext href="https://pubmed.ncbi.nlm.nih.gov/2305711/">original study</Ext>):
        </P>
        <Formula>
          Men: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5<br />
          Women: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
        </Formula>
        <P>
          Other equations exist. The Harris-Benedict formula is older and gives similar results. The Katch-McArdle formula uses lean
          body mass instead of total weight, so it can be more accurate for very lean or muscular people, but it requires a body fat
          measurement.
        </P>
        <P>For step two, multiply your BMR by an activity factor:</P>
        <List items={[
          ["Sedentary:", "1.2"],
          ["Lightly active:", "1.375"],
          ["Moderately active:", "1.55"],
          ["Very active:", "1.725"],
          ["Extremely active:", "1.9"],
        ]} />
        <P>
          For example, a 30-year-old woman who is 165 cm tall and weighs 65 kg has a BMR of about 1,370 calories. If she exercises a
          few days a week and uses a factor of 1.375, her TDEE is about 1,884 calories.
        </P>
        <H3>How Do You Calculate Your TDEE if Your BMR Is 1,300 Calories and You’re Moderately Active?</H3>
        <P>
          Multiply 1,300 by 1.55. That gives you a TDEE of about 2,015 calories per day. If you ate around 2,015 calories daily, your
          weight should stay roughly the same.
        </P>
        <H3>How Do You Estimate Your BMR and TDEE Without Lab Tests?</H3>
        <P>
          You do not need a lab. Prediction equations were built from lab measurements of thousands of people, so they give a solid
          estimate from just your age, sex, height, and weight. That is exactly what an online TDEE calculator does for you. Then you
          check the estimate against real life by tracking your weight for a few weeks.
        </P>
      </Card>

      <Card title="How Can I Calculate My Exact Total Daily Energy Expenditure?">
        <P>
          You cannot get an exact number from a formula, and your real TDEE changes from day to day anyway. A hard workout day, a day
          on your feet at work, and a lazy Sunday all burn different amounts. A calculator gives you a very good average.
        </P>
        <P>If you want a measured number, researchers use two main methods:</P>
        <List items={[
          ["Doubly labeled water:", "You drink water containing special tracers, and scientists measure how fast they leave your body over one to two weeks. This is the gold standard for real-world TDEE, but it is expensive and done mostly in studies."],
          ["Indirect calorimetry:", "A device measures the oxygen you breathe in and the carbon dioxide you breathe out. It is used to measure resting energy expenditure."],
        ]} />
        <P>
          For most people, the best real-world method is simple. Eat at your estimated maintenance for two to three weeks, weigh
          yourself under consistent conditions, and see what happens. If your average weight stays flat, your estimate is right. If it
          creeps up or down, adjust by 100 to 200 calories.
        </P>
        <H3>How Do Scientists Measure Resting and Total Energy Expenditure in Experimental Animals?</H3>
        <P>
          Researchers use the same principle. Animals are placed in sealed metabolic cages that measure oxygen use and carbon dioxide
          output, usually over 24 hours. Resting energy expenditure (REE) is taken from the quiet periods, and total energy
          expenditure comes from the full day. These are research methods. The Tolz tool is built for people and does not measure
          anything. It uses a formula.
        </P>
      </Card>

      <Card title="What Is the Activity Level in a TDEE Calculation?">
        <P>
          Activity level is a multiplier that tells the calculator how much you move compared with someone at rest. It includes both
          your workouts and your daily movement, such as your job and household tasks.
        </P>
        <List items={[
          ["Sedentary:", "Desk job, little planned exercise."],
          ["Lightly active:", "Light exercise or sports one to three days a week."],
          ["Moderately active:", "Exercise three to five days a week, or a job that keeps you on your feet."],
          ["Very active:", "Hard training six or seven days a week."],
          ["Extremely active:", "Physical labor plus daily training, or heavy athletic preparation."],
        ]} />
        <P>Most office workers who train a few times a week land between light and moderate.</P>
        <H3>What Counts as Exercise for TDEE?</H3>
        <P>
          Any planned physical activity that raises your heart rate counts: running, cycling, swimming, lifting weights, sports,
          fitness classes, or fast walks. Daily movement like walking around the office, cleaning, or gardening counts too, but it
          shows up as part of your baseline activity level rather than as a workout.
        </P>
        <H3>What Is Considered Moderate Exercise?</H3>
        <P>
          Moderate exercise makes you breathe harder, but you can still talk comfortably. You could not sing. Examples are brisk
          walking, easy cycling, water aerobics, and doubles tennis. Vigorous exercise, like running or fast cycling, makes it hard to
          say more than a few words at a time.
        </P>
        <H3>How Do I Figure Out My Activity Level if I’m Not Sure?</H3>
        <P>Try these tips:</P>
        <List items={[
          ["", "Look at your daily step count. As a rough guide, under 5,000 steps is sedentary, 5,000 to 7,500 is lightly active, 7,500 to 10,000 is moderately active, and 10,000 or more is very active."],
          ["", "Think about your whole week, not just your workouts. A gym session does not cancel out ten hours of sitting."],
          ["", "When in doubt, choose the lower option, then test it for two to three weeks and adjust."],
        ]} />
        <H3>Do You Add Exercise Calories to Your TDEE?</H3>
        <P>
          No. Your activity multiplier already includes your exercise. If you add the calories from a workout on top, you count them
          twice. Fitness trackers also tend to overestimate calorie burn, so trust the multiplier instead.
        </P>
      </Card>

      <Card title="How Does Fast Metabolism Affect Your TDEE?">
        <P>
          A “fast” metabolism means a higher basal metabolic rate, and that raises your TDEE because BMR is the biggest part of it.
          Things that push BMR up include having more muscle, being larger or taller, being younger, being male, and having certain
          hormone levels. Genetics matters too.
        </P>
        <P>
          The effect is real but smaller than most people think. Differences between people of the same size are usually a few
          hundred calories per day, not thousands. A fast metabolism does not mean you can eat anything without consequences, and a
          “slow” metabolism is rarely the main reason for weight gain. The calculator cannot measure your personal metabolic speed, so
          if you suspect yours is higher or lower than average, use your weight trend over a few weeks to fine-tune the estimate.
        </P>
      </Card>

      <Card title="What Is the Difference Between EER and TEE?">
        <P>
          Total energy expenditure (TEE) is the energy you actually burn, usually measured in a study with a method like doubly
          labeled water.
        </P>
        <P>
          Estimated energy requirement (EER) is a predicted number from equations developed for U.S. and Canadian dietary guidelines.
          It estimates how many calories a healthy person of a given age, sex, height, weight, and activity level needs to maintain
          their weight.
        </P>
        <P>In short, TEE is measured, and EER is estimated. A TDEE calculator works like EER: it predicts your TEE from a few personal details.</P>
      </Card>

      <Card title="How Accurate Are Online TDEE Calculators?">
        <P>
          Online TDEE calculators are good estimates, not exact answers. For most healthy adults, a prediction can be off by about 10
          percent because of genetics, muscle mass, hormones, sleep, medications, and how accurately you report your activity.
        </P>
        <P>
          The Tolz TDEE calculator uses standard, widely accepted methods, so its results are explainable and repeatable. It does not
          ask for body fat, so very lean, very muscular, or very heavy people may see more error than average. The fix is the same for
          any calculator: treat the result as a starting point, track your weight for two to three weeks, and adjust.
        </P>
        <P>
          People with medical conditions, pregnant or breastfeeding women, and teenagers should check with a doctor or registered
          dietitian before changing how much they eat.
        </P>
      </Card>

      <Card title="Do You Have to Determine Your TDEE?">
        <P>
          No, you can lose or gain weight without it. But knowing it saves time. Without a starting number, you are guessing, and
          guessing often leads to eating too little (which backfires) or too much (which stalls progress). A TDEE calculator gives you
          a realistic target in seconds, and you can refine it from there.
        </P>
      </Card>

      <Card title="Why Is TDEE Important for Healthy Weight Loss?">
        <P>TDEE tells you where “break even” is. Once you know it, you can set a calorie deficit on purpose instead of cutting food at random.</P>
        <List items={[
          ["", "It keeps your deficit moderate, which protects muscle and energy."],
          ["", "It prevents crash dieting, which is hard to stick to."],
          ["", "It gives you a number to adjust as you lose weight, since your TDEE drops as you get lighter."],
          ["", "It makes your progress easy to read. If the scale does not move, you know whether the problem is your intake or your estimate."],
        ]} />
      </Card>

      <Card title="How Do I Use TDEE to Lose Weight?">
        <List ordered items={[
          ["", "Calculate your TDEE."],
          ["", "Subtract 10 to 20 percent, or about 500 calories, to set your daily target."],
          ["", "Eat at that level consistently for two to three weeks."],
          ["", "Weigh yourself under the same conditions and watch the average, not single days."],
          ["", "Recalculate every time you lose 10 or so pounds, because your TDEE gets smaller as you do."],
        ]} />
      </Card>

      <Card title="How Many Calories Less Than Your TDEE Should You Eat a Day?">
        <P>
          For most people, a deficit of 10 to 20 percent below maintenance, or roughly 250 to 500 calories, works well. One pound of
          body fat holds about 3,500 calories (7,700 per kilogram), so a daily 500-calorie deficit leads to about one pound lost per
          week.
        </P>
        <P>
          Stay above 1,200 calories a day for women and 1,500 for men unless a doctor is supervising you. The{" "}
          <Ext href="https://www.niddk.nih.gov/health-information/weight-management/choosing-a-safe-successful-weight-loss-program">National Institute of Diabetes and Digestive and Kidney Diseases</Ext>{" "}
          recommends a gradual pace of about one to two pounds per week for safe weight loss.
        </P>
        <H3>How Much Weight Will I Lose in a Month Eating 1,100 to 1,200 Calories if My TDEE Is 1,691?</H3>
        <P>
          That is a deficit of roughly 500 to 600 calories a day, or about 15,000 to 18,000 calories over 30 days. That works out to
          around four to five pounds of fat in a month, plus some early water loss. It is a reasonable rate, but 1,100 calories is
          below the usual 1,200-calorie minimum. Eating 1,200 or a bit more is a safer choice.
        </P>
        <H3>Is a TDEE of 1,500 Healthy?</H3>
        <P>
          A TDEE number is not healthy or unhealthy by itself. It simply shows how much energy you burn. A TDEE of 1,500 is common for
          smaller, older, or less active people, especially women. What matters is that you eat enough to meet your needs, which means
          eating at or near that level to maintain your weight.
        </P>
        <H3>Should I Base My Cut on BMR or TDEE?</H3>
        <P>
          Base it on TDEE. Your BMR is only the energy you burn at rest, so eating at BMR leaves out everything else you do all day.
          Use TDEE as your starting point and subtract your deficit from it.
        </P>
      </Card>

      <Card title="What Are the Effects of Eating Less Than Your TDEE?">
        <P>When you eat less than your TDEE, you create a calorie deficit, and your body makes up the difference from its stored energy.</P>
        <H3>Expected Effects of a Moderate Deficit</H3>
        <List items={[
          ["", "Steady weight loss"],
          ["", "Smaller waist and clothing sizes over time"],
          ["", "Some hunger, especially in the first weeks"],
          ["", "Slightly lower energy at times"],
        ]} />
        <H3>Consequences of a Deficit That Is Too Big or Goes On Too Long</H3>
        <List items={[
          ["", "Muscle loss"],
          ["", "Constant fatigue, low mood, and irritability"],
          ["", "Strong cravings and rebound overeating"],
          ["", "Poor sleep and trouble concentrating"],
          ["", "Feeling cold, hair thinning, and digestive problems"],
          ["", "Hormonal changes, including irregular periods in women"],
          ["", "Lower daily movement, because your body unconsciously saves energy"],
        ]} />
        <P>The goal is a deficit you can live with for weeks or months, not one that wears you down in days.</P>
        <H3>Where Do the Calories Go When We Eat Less Than Our TDEE?</H3>
        <P>
          Nothing is “extra” when you eat less than your TDEE. You are short on energy, so your body covers the gap from its reserves,
          first using stored carbohydrate (glycogen) and then body fat. When fat is burned, most of it leaves your body as carbon
          dioxide that you breathe out. The rest leaves as water.
        </P>
        <H3>Will Stored Fat Be Burned First?</H3>
        <P>
          Not exactly. Your body uses a mix of fuels all the time, and fat is the main long-term source in a deficit. But if you eat
          too little protein or do no strength training, you can also lose muscle along with fat. Protein and resistance exercise help
          point the loss toward fat.
        </P>
        <H3>Can Eating Below Your TDEE Hinder Fat Loss?</H3>
        <P>
          Yes, if you go too low. A very large deficit can cause muscle loss, tiredness, less daily movement, and a drop in how many
          calories you burn. It also leads to binge eating for many people. A moderate deficit works better in the long run.
        </P>
        <H3>Can Eating Below Your TDEE Lead to Quick Weight Loss?</H3>
        <P>
          Yes, at first. Most of the early drop, especially in week one, is water and glycogen, not fat. True fat loss is slower,
          usually one to two pounds a week at a healthy pace. Fast loss from extreme dieting is hard to keep off and often costs muscle.
        </P>
        <H3>Is It Possible to Lose Weight Eating Less Than Your TDEE Without Exercising?</H3>
        <P>
          Yes. Weight loss comes mainly from the deficit, so you can lose weight with diet alone. Exercise still helps you keep muscle,
          burn more calories, and maintain the loss afterward.
        </P>
        <H3>Can You Create a Calorie Deficit Without Counting Calories?</H3>
        <P>Yes. Many people do it by:</P>
        <List items={[
          ["", "Controlling portion sizes"],
          ["", "Eating more protein and fiber, which keep you full longer"],
          ["", "Cutting back on sugary drinks and snacks"],
          ["", "Choosing mostly whole, minimally processed foods"],
        ]} />
        <P>Check your progress with the scale. If your weight is not changing after a few weeks, your intake is probably still too close to maintenance.</P>
        <H3>If I Eat Anything I Want but No More Than My TDEE, Will I Lose Weight?</H3>
        <P>
          No. Eating up to your TDEE means you will maintain your weight, not lose it. To lose weight, you need to eat below it. Food
          choices still matter for your health, hunger, and energy, even if the calorie total is the same.
        </P>
        <H3>Can Eating Carbs Make You Gain Weight Even Below Your TDEE?</H3>
        <P>
          Carbs do not cause fat gain on their own when you are in a deficit. But carbs are stored with water in your muscles and
          liver, so a high-carb day can raise the number on the scale by a few pounds. That is water, not fat. Fat gain requires eating
          more than you burn over time.
        </P>
        <H3>Is It Possible for Eating Below Your TDEE to Cause Permanent Damage?</H3>
        <P>
          For a healthy adult, a moderate deficit for a limited time is generally safe and does not cause lasting harm. Extreme and
          prolonged under-eating is different. It can lead to bone loss, heart rhythm problems, electrolyte imbalances, gallstones, and
          eating disorders. Many effects improve with proper eating, but some, such as lost bone density, may not fully recover. If you
          are eating very little, feel unwell, or cannot stop restricting, talk to a doctor.
        </P>
      </Card>

      <Card title="Is It Necessary to Eat More Than Your TDEE While Cutting?">
        <P>
          No. Eating above your TDEE will stop fat loss. But some people use planned “diet breaks” or maintenance days, where they eat
          at their TDEE for a few days or a week. This can make long diets easier to stick to. It is optional, not required.
        </P>
      </Card>

      <Card title="High Protein, Low Calories: Will Your Body Build Tissue and Burn Fat?">
        <P>
          Partly. When you eat a lot of protein but fewer calories than your TDEE, your body still needs energy, so it burns fat and
          stored carbs for fuel. Protein is mainly used for repair and maintenance, and the body can also burn some of it for energy or
          convert some to glucose. Eating high protein while strength training helps you keep your muscle during a cut. But a real
          deficit makes building new muscle difficult, except for beginners, people returning to training, and people with a lot of
          body fat to lose.
        </P>
        <H3>If I Eat Less Than My TDEE and Exercise More, Will I Gain Muscle or Just Fat?</H3>
        <P>
          You will not gain fat in a true calorie deficit. Beginners can build some muscle while losing fat if they eat enough protein
          and lift weights. More experienced lifters will mostly preserve their muscle rather than add to it.
        </P>
        <H3>If I Do No Cardio but Do Strength Training in a Deficit, Will I Gain Muscle?</H3>
        <P>
          Strength training is exercise, and it is the best signal for your body to keep or build muscle. Beginners can see small
          gains in a deficit with enough protein. For everyone else, it protects the muscle you already have.
        </P>
        <H3>Do Calories Used to Rebuild Muscle Get Added to My TDEE?</H3>
        <P>
          They are already part of it. Muscle repair and growth use energy, but it is a small amount and is included in your BMR and
          activity. You do not add it separately. Having more muscle does raise your BMR slightly, often estimated at about 6 calories
          per pound of muscle per day.
        </P>
      </Card>

      <Card title="What Happens if You Eat More Than Your TDEE?">
        <P>
          When you eat more than your TDEE, you are in a calorie surplus. Your body stores the extra energy, and over time, most of it
          ends up as body fat unless you are also building muscle through training. You may also notice more water weight, a bit more
          energy, and a slightly higher TDEE, since a larger body burns more.
        </P>
        <H3>Does Going Over Your TDEE Automatically Turn the Extra Calories Into Fat?</H3>
        <P>
          No. One high-calorie day does not turn straight into fat. Your body stores some extra carbs as glycogen, burns some off
          through digestion and extra movement, and stores the rest as fat. A surplus that continues for weeks leads to real fat gain.
        </P>
        <H3>What Happens if You Eat Above Your TDEE While Doing Intermittent Fasting?</H3>
        <P>
          Intermittent fasting limits when you eat, not how much. If you eat more than your TDEE inside your eating window, you will
          still gain weight. Fasting only helps with weight loss if it leads you to eat fewer total calories.
        </P>
      </Card>

      <Card title="How Many Calories Over Your TDEE Should You Eat to Gain Weight or Muscle?">
        <P>
          A surplus of 250 to 500 calories per day works for most people. Beginners can go toward the higher end, while experienced
          lifters should stay lower, around 100 to 250, because their muscle gain is slower and extra calories turn to fat faster.
        </P>
        <H3>Do I Need to Eat the Exact Calories My TDEE Shows While Bulking?</H3>
        <P>
          No. Your TDEE is an estimate, so use it as a starting point. Eat in a range around your surplus, weigh yourself weekly, and
          adjust. A gain of roughly half a pound to one pound per week suits most beginners, and slower is better if you want to stay
          lean.
        </P>
      </Card>

      <Card title="Why Does TDEE Matter on a Ketogenic Diet?">
        <P>
          Keto does not change the rules of energy balance. Your TDEE still decides whether you lose, maintain, or gain. Fat is very
          calorie-dense, so it is easy to overeat on keto without noticing. Knowing your TDEE helps you set a calorie target, and you
          can then work out your fat and protein amounts from it. Much of the early weight loss on keto is water, so judge progress over
          several weeks.
        </P>
      </Card>

      <Card title="Do Micronutrient Needs Rise With Your TDEE?">
        <P>
          Not in direct proportion. Needs for vitamins and minerals depend mostly on age, sex, and life stage. Some B vitamins, such as
          thiamin, riboflavin, and niacin, are tied to energy use, so they rise a little with higher calorie intake. But iron, calcium,
          and vitamin D do not simply increase because you burn more. When you eat less to lose weight, it gets harder to cover all your
          nutrients, so focus on vegetables, fruit, lean protein, dairy or alternatives, and whole grains.
        </P>
      </Card>

      <Card title="Is TDEE the Same as Eating a Set Number of Calories at Each Meal?">
        <P>
          No. TDEE is a daily total. How you split calories across breakfast, lunch, dinner, and snacks does not change the total, so it
          has little effect on weight. Choose the meal pattern that helps you feel full and stay consistent.
        </P>
      </Card>

      <Card title="When and Why Would You Need a TDEE Calculator?">
        <List items={[
          ["Starting a fat-loss plan:", "You need a defensible calorie target before you cut."],
          ["Building muscle:", "A lean bulk depends on knowing where maintenance is."],
          ["Breaking a plateau:", "Your TDEE falls as you lose weight, so a plan that worked at 190 pounds may stall at 170."],
          ["Changing your routine:", "A new job, a new workout program, or an injury changes your activity level."],
          ["Meal planning:", "Protein, carb, and fat targets are set as shares of total calories."],
          ["Staying at your new weight:", "After a diet, knowing maintenance helps you avoid regaining."],
        ]} />
      </Card>

      <Card title="TDEE vs. BMR vs. RMR">
        <P>
          BMR is the energy you use at complete rest under strict conditions. Resting metabolic rate (RMR), or resting energy
          expenditure (REE), is a similar measurement taken under looser, everyday conditions, and it is usually close to BMR. TDEE
          includes both, plus digestion and all movement, which is why it is always higher. If you eat only your BMR in calories, you
          will be under-fueling, because that number leaves out everything you do after waking up.
        </P>
      </Card>

      <Card title="Free and Easy to Trust">
        <P>
          The TDEE calculator on Tolz is free to use, with no payment or hidden charges. It asks only for the details it needs to
          produce your result: age, gender, height, weight, and activity level. The calculation follows standard, openly documented
          methods, so you can see how the figure is built. The tool gives an estimate to support your decisions. It does not replace
          advice from a doctor or dietitian.
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
