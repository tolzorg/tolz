import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is an online calorie calculator?",
    a: "Online calorie calculators use well-established formulas like Mifflin-St Jeor to estimate your BMR and TDEE. They're generally accurate within a reasonable range for most people, though individual metabolism can vary by a few hundred calories. Treat the result as a strong starting estimate and adjust based on real-world progress over a few weeks.",
  },
  {
    q: "What's the difference between a calorie calculator and a calorie tracker?",
    a: "A calorie calculator tells you how many calories you should be eating based on your goals and stats. A calorie tracker (or food diary) logs what you actually eat so you can compare intake against that target. This tool provides the calculation side, giving you the number to track against.",
  },
  {
    q: "Do I need to create an account to use this calorie calculator?",
    a: "No. The tool works instantly without any signup, login, or email verification. You simply enter your details and receive your result immediately.",
  },
  {
    q: "How many calories should I eat to lose weight?",
    a: "Generally, a deficit of 300–500 calories below your TDEE (maintenance calories) supports sustainable weight loss without excessive hunger or muscle loss. The exact number depends on your current weight, activity level, and how quickly you want to see results.",
  },
  {
    q: "What is a good daily calorie intake for weight maintenance?",
    a: "Your maintenance calories equal your TDEE, the total energy your body uses in a day including activity. This number varies significantly by age, sex, weight, height, and activity level, which is why a personalized calculation is more useful than a generic average like \"2,000 calories a day.\"",
  },
  {
    q: "Is this calorie tracker free to use?",
    a: "Yes, the tool is completely free with no hidden charges, premium upgrades, or locked results.",
  },
  {
    q: "Does the tool store my personal health data?",
    a: "No. Your inputs are used only to generate your result during that session and are not stored or linked to any account.",
  },
  {
    q: "How often should I recalculate my calorie needs?",
    a: "It's a good idea to recalculate every few weeks or whenever your weight changes by more than a few pounds, since both BMR and TDEE shift as your weight and activity level change.",
  },
];

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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

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

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Keeping track of what your body actually needs each day is harder than it sounds, especially when
          generic advice ("eat less, move more") doesn't account for your age, weight, height, or activity
          level. This calorie calculator on Tolz removes the guesswork by turning a few personal details into
          a clear, personalized daily calorie target, whether your goal is losing fat, building muscle, or
          simply maintaining your current weight. It's built to give you a reliable starting point in
          seconds, without needing a nutrition degree or a subscription to a paid app.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Calorie Calculator and How Does It Work</h2>
        <p style={pStyle}>
          A calorie calculator estimates how many calories your body burns in a day based on a set of
          biological and lifestyle inputs, typically age, sex, height, current weight, and activity level.
          Behind the scenes, it applies established metabolic formulas (most commonly the Mifflin-St Jeor or
          Harris-Benedict equations) to calculate your Basal Metabolic Rate, then adjusts that number based on
          how physically active you are throughout the week.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result isn't a random estimate, it's a scientifically grounded figure that tells you roughly how
          many calories you'd need to eat to maintain your current weight. From there, you can adjust upward
          or downward depending on whether your goal is weight loss, weight gain, or maintenance. This is
          exactly why a calorie calculator is more useful than a fixed number pulled from a generic chart: it
          reflects your body, not an average stranger's.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Calorie Tracker & Calculator</h2>
        <p style={pStyle}>
          Using the tool takes less than a minute. Enter your age, biological sex, height, and current weight,
          then select your typical activity level, ranging from sedentary (little to no exercise) to very
          active (intense daily training or physical labor). The calculator instantly processes these inputs
          and returns your estimated daily calorie needs, often broken down by goal: maintenance, mild
          deficit, moderate deficit, or surplus.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because everything runs directly in your browser, there's no waiting, no email verification, and no
          multi-step onboarding. You get a number you can act on immediately, whether that means adjusting
          your next grocery list or setting a target in a food diary you already use.
        </p>
      </div>

      {/* BMR/TDEE */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding BMR and TDEE: The Science Behind Your Number</h2>
        <p style={pStyle}>
          Two terms come up constantly in calorie tracking, and understanding them makes the calculator's
          output far more useful. Your BMR (Basal Metabolic Rate) is the number of calories your body burns at
          complete rest just to keep essential functions running — breathing, circulation, cell repair, and
          organ function. It does not account for movement or exercise at all.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your TDEE (Total Daily Energy Expenditure) builds on top of BMR by factoring in your activity level,
          including workouts, walking, standing, and general daily movement. TDEE is the more practical number
          for everyday planning, since it represents your true daily calorie burn. This calculator computes
          both, so you're not just getting a single figure but a fuller picture of how your body uses energy,
          which is especially useful if you're trying to answer the common question, "how many calories should
          I eat a day?"
        </p>
      </div>

      {/* Deficit vs surplus */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calorie Deficit vs. Calorie Surplus: Which Do You Need?</h2>
        <p style={pStyle}>
          Once you know your maintenance calories (your TDEE), the next step depends entirely on your goal:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>For weight loss</strong>, you'll need a calorie deficit — consistently eating fewer
            calories than your body burns. A moderate deficit of 300–500 calories below maintenance is
            generally considered sustainable and is reflected in many of the calculator's suggested ranges,
            helping you avoid the extreme restriction that often leads to burnout or muscle loss.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>For weight gain or muscle building</strong>, a calorie surplus is required — eating more
            than your TDEE so your body has the raw energy and nutrients to build tissue. A surplus of
            200–400 calories above maintenance is a common, controlled starting point.
          </li>
          <li>
            <strong>For maintenance</strong>, the goal is simply matching intake to your TDEE as closely as
            possible, which is useful for people who are happy with their current weight but still want
            visibility into their eating habits.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Rather than guessing at these numbers or relying on outdated one-size-fits-all rules, this
          calculator gives you a personalized range for each scenario, so you can pick the approach that
          matches your actual goal.
        </p>
      </div>

      {/* Practical scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a Calorie Tracker (Practical Scenarios)</h2>
        <p style={pStyle}>
          Calorie tracking isn't only for bodybuilders or people on strict diets, it's relevant in far more
          everyday situations than most people realize.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Starting a weight loss or fitness journey:</strong> Before making any dietary changes,
            knowing your actual maintenance calories prevents both under-eating (which stalls progress and
            drains energy) and over-restricting too aggressively.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Training for an event or sport:</strong> Athletes preparing for a race, competition, or
            strength goal often need to fine-tune intake to match increased training volume, and a quick
            recalculation as activity levels change keeps that target accurate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Recovering from illness or a life change:</strong> Significant weight changes, pregnancy
            recovery, or shifts in activity (like starting a desk job after a physically active one) all
            change calorie needs, and recalculating periodically keeps your targets realistic.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Working with a coach or nutritionist remotely:</strong> Having a quick, shareable baseline
            number saves time in consultations and gives both parties a starting figure to adjust from.
          </li>
          <li>
            <strong>General health awareness:</strong> Even without a specific goal, many people simply want
            to understand their energy balance to make more informed choices about portion sizes and meal
            planning.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the value isn't just the number itself, it's having an easy, repeatable way
          to recheck that number as your weight, age, or activity level changes over time.
        </p>
      </div>

      {/* Why choose */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Choose Tolz's Free Calorie Calculator</h2>
        <p style={pStyle}>
          There are dozens of calorie tracking tools online, many of them locked behind subscriptions, account
          creation, or intrusive ad walls. This calculator is built differently, with a few practical
          distinctions:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Completely free, no hidden costs.</strong> There are no premium tiers, no locked features,
            and no surprise charges for a "detailed" result, every calculation is fully available on the first
            use.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>No signup required.</strong> You don't need to create an account, verify an email, or hand
            over personal information just to get a number. Enter your details, get your result, and move on.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>No data stored.</strong> Your inputs — age, weight, height, activity level — are used only
            to generate your result in that session. Nothing is saved to a server or attached to your
            identity, which matters for a tool dealing with personal health-adjacent information.
          </li>
          <li>
            <strong>Fast and accessible from any device.</strong> Whether you're on a phone during a grocery
            run or on a desktop planning meals for the week, the calculator loads quickly and works the same
            way across devices, with no app download required.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          These aren't just nice extras, for a tool that touches personal health data, privacy and
          transparency are as important as accuracy.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting the Most Accurate Results</h2>
        <p style={pStyle}>
          A calorie calculator is only as useful as the honesty of its inputs. A few practical tips help
          improve accuracy:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Be realistic about your activity level.</strong> Many people overestimate how active they
            are. If you exercise 2–3 times a week but otherwise sit most of the day, "lightly active" is
            usually more accurate than "very active."
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Recalculate periodically.</strong> As your weight changes, even by 5–10 pounds, your
            calorie needs shift too. Rechecking every few weeks keeps your target relevant.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Treat the result as a starting point, not a fixed rule.</strong> Metabolic estimates are
            close approximations, not exact measurements. If you're not seeing expected progress after 2–3
            weeks of consistent tracking, a small adjustment (up or down by 100–150 calories) is normal and
            expected.
          </li>
          <li>
            <strong>Pair the number with actual tracking.</strong> Knowing your target is only half the
            equation, logging what you actually eat, even loosely, is what turns the number into real
            progress.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Used this way, the calculator becomes less of a one-time lookup and more of an ongoing reference
          point you can return to as your body and goals evolve.
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
