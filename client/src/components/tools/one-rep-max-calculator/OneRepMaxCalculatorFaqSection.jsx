import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a one rep max?",
    a: "Your one rep max (1RM) is the most weight you can lift for one complete repetition of a specific exercise with proper form. It differs from exercise to exercise, so measure it separately for the bench press, squat, deadlift and so on.",
  },
  {
    q: "Which 1RM formula should I use?",
    a: "Epley and Brzycki are the two most popular. They give the same result at 10 repetitions and slightly different results otherwise; Lombardi tends to give higher estimates at high rep counts. All are usually within about 10% of a true one rep max, and they are most accurate at low rep counts (3-5).",
  },
  {
    q: "Why is the limit 10 repetitions?",
    a: "You can certainly do more than 10 reps, but the formulas lose accuracy as the number of repetitions grows, so the calculator accepts 1 to 10. For the best estimate, pick a weight you can lift for about 3 to 10 reps with good form.",
  },
  {
    q: "What do the two tables show?",
    a: "The first gives the estimated weight you can lift for 1-20 repetitions and its percentage of your 1RM. The second gives the weight at each percentage of your 1RM (100% down to 50%) and roughly how many repetitions you can do at it.",
  },
  {
    q: "Can I enter pounds and get kilograms?",
    a: "Yes. Choose the unit of the weight you lifted next to the box, and open Settings to pick the unit for the results (Kilogram or Pound). 1 pound = 0.453592 kg.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 10px", paddingLeft: 20 };
const cardStyle = { padding: "20px 20px" };
const formula = { fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)" };
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

export default function OneRepMaxCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is a One Rep Max?</h2>
        <p style={pStyle}>
          A one rep max (one-repetition maximum) is the most weight a person can lift for one complete repetition of a specific exercise
          while keeping proper form. It is widely used in weightlifting competitions because it shows the peak force your muscles can produce
          in an all-out effort.
        </p>
        <p style={pStyle}>
          Your one rep max differs from exercise to exercise (bench press, squat, deadlift, overhead press and so on), so measure it for each
          exercise rather than applying one exercise's 1RM to another.
        </p>
        <h3 style={h3Style}>Why one rep max is important</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Knowing your 1RM gives a number for your maximal strength in an exercise, so you can plan your training around your goals: choosing
          an intensity that is challenging enough to build strength while keeping technique and safety in check. It also lets you track your
          progress and set goals; seeing your 1RM rise is motivating, and if it doesn't, you know to adjust your program.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Measure One Rep Max</h2>
        <p style={pStyle}>
          There are two ways to find your one rep max: measure it directly with a strength test, or estimate it with a formula. Both have
          advantages and disadvantages.
        </p>
        <h3 style={h3Style}>Measuring directly</h3>
        <p style={pStyle}>
          Direct measurement means gradually increasing the weight, resting between attempts, until you can only complete one repetition with
          proper form. It can be dangerous, so only try it for exercises you are experienced with, ideally with a spotter:
        </p>
        <ol style={listStyle}>
          <li><strong>Warm up</strong> the muscle groups you will use.</li>
          <li><strong>Find a spotter</strong> to help you push your limits safely.</li>
          <li><strong>Start with a comfortable weight</strong> you can lift for about 5-10 reps.</li>
          <li><strong>Rest and recover</strong> fully between sets, usually 2-5 minutes.</li>
          <li><strong>Increase the weight</strong> after each rest: by a lot if the last set was easy, by less if it was close to your limit.</li>
          <li><strong>Repeat</strong> until you can do only one repetition with good form. Lifting more with poor form is not a valid 1RM and risks injury.</li>
          <li><strong>Record your 1RM</strong> so you can track your progress.</li>
        </ol>
        <p style={pStyle}>
          Direct measurement is straightforward and generally more accurate than estimation, but it carries a higher risk of injury and takes
          longer because you need full rest between attempts. Beginners are better off learning proper form first and using an estimate.
        </p>
        <h3 id="estimation-methods" style={{ ...h3Style, scrollMarginTop: 80 }}>Estimation methods</h3>
        <p style={pStyle}>This calculator estimates your one rep max with three formulas:</p>
        <ul style={listStyle}>
          <li><strong>Epley:</strong> <span style={formula}>1RM = weight lifted × (1 + repetitions / 30)</span></li>
          <li><strong>Brzycki:</strong> <span style={formula}>1RM = weight lifted × 36 / (37 − repetitions)</span></li>
          <li><strong>Lombardi:</strong> <span style={formula}>1RM = weight lifted × repetitions<sup>0.10</sup></span></li>
        </ul>
        <p style={pStyle}>
          Epley and Brzycki are the most popular; they give the same result at 10 repetitions and slightly different results otherwise. The
          estimates are usually within about 10% of a true one rep max. To use them, pick a challenging but safe weight you can lift for 3-10
          reps, rest and increase the weight until you reach failure within that range, then enter the weight and the number of good
          repetitions (don't count the failed one). The fewer reps to failure, the more accurate the estimate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Estimation is safer, quicker and more accessible to beginners, but less accurate: the formulas are based on data that leans toward
          experienced lifters, and beginners' strength can rise faster than the estimates keep up with.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use Your One Rep Max</h2>
        <p style={pStyle}>
          Training at different percentages of your 1RM targets different goals. Sources vary, but a general guide is:
        </p>
        <ul style={listStyle}>
          <li><strong>50-60% for 3-5 reps (4-6 sets):</strong> explosive power; keep rests between sets short.</li>
          <li><strong>~70% for 10-15 reps (4-6 sets):</strong> muscular endurance.</li>
          <li><strong>70-80% for 7-12 reps (3-5 sets):</strong> muscle growth.</li>
          <li><strong>80-100% for 1-3 reps (3-4 sets):</strong> muscle growth, power and overall strength; use a spotter whenever possible.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The repetitions shown next to each percentage in the results are not necessarily how many you should do in a workout; that depends
          on your goals, as above.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Improve Your One Rep Max</h2>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li><strong>Prioritize safety:</strong> keep proper form, know when to stop and train with a spotter, especially with heavy weights.</li>
          <li><strong>Train consistently:</strong> train at around 85-100% of your 1RM when working to raise it, but a lighter session still beats skipping.</li>
          <li><strong>Rest:</strong> muscles need time to recover and grow; overtraining and injuries set you back.</li>
          <li><strong>Vary your workouts:</strong> repeating the same exercise eventually leads to a plateau, so add exercises that work the same muscles in different ways.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
        <p style={{ ...pStyle, margin: "14px 0 0" }}>
          Related: the {link("/calculators/health/lean-body-mass-calculator", "Lean Body Mass Calculator")} and the{" "}
          {link("/calculators/health/bmr-calculator", "BMR Calculator")}.
        </p>
      </div>
    </div>
  );
}
