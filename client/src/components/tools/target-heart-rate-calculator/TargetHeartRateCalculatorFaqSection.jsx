import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a good target heart rate for my age?",
    a: "It depends on your goal and intensity. For a 40-year-old with a 180 bpm estimated maximum, moderate intensity is about 90 to 126 bpm and vigorous intensity is about 126 to 153 bpm using the percentage method. Enter your age to see your own ranges.",
  },
  {
    q: "How do I calculate my target heart rate?",
    a: "Estimate your maximum (for example 220 − age or 208 − 0.7 × age), then multiply by your chosen intensity percentage. For the Karvonen method, subtract your resting heart rate from your maximum, multiply by the intensity, and add the resting rate back.",
  },
  {
    q: "What is the Karvonen formula?",
    a: "Target heart rate = (maximum heart rate − resting heart rate) × intensity + resting heart rate. It uses heart rate reserve, so it adjusts for your fitness level in a way plain percentages don’t.",
  },
  {
    q: "Which max heart rate formula is the most accurate?",
    a: "Tanaka and Nes tend to perform better than 220 − age, especially after 40, but none is accurate for every individual. A tested maximum from a supervised or field effort beats any formula.",
  },
  {
    q: "What are the five heart rate zones?",
    a: "They are Zone 1 (50–60% of maximum), Zone 2 (60–70%), Zone 3 (70–80%), Zone 4 (80–90%) and Zone 5 (90–100%). They range from recovery and easy aerobic work to maximal short efforts.",
  },
  {
    q: "What heart rate zone is best for burning fat?",
    a: "Zones 1 and 2 (roughly 50 to 70% of maximum) burn the highest share of fat. Higher zones burn more total calories, so a mix of both, repeated consistently, works best for most goals.",
  },
  {
    q: "Is it safe to work out at 100% of my target heart rate or higher?",
    a: "Short, all-out efforts are part of interval training for healthy, conditioned people, but they are not suitable for beginners or anyone with heart problems. Stop if you feel chest pain, dizziness or unusual breathlessness.",
  },
  {
    q: "What should I do if my heart rate is below my target during exercise?",
    a: "Give it a few minutes to catch up, then raise your pace or incline slightly. If the effort feels hard but your heart rate stays low, check your sensor and consider medication or fatigue as causes.",
  },
  {
    q: "What is the difference between Borg RPE and CR10?",
    a: "RPE uses a 6 to 20 scale designed to loosely track heart rate (rating × 10). CR10 uses a 0 to 10 scale that is simpler for in-workout use. Both measure how hard the effort feels.",
  },
  {
    q: "Is this target heart rate calculator free?",
    a: "Yes. It is free to use online and does not require an account.",
  },
];

// The supplied FAQ schema spells out the math symbols and percentages in words,
// so it is kept verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a good target heart rate for my age?", a: "It depends on your goal and intensity. For a 40-year-old with a 180 bpm estimated maximum, moderate intensity is about 90 to 126 bpm and vigorous intensity is about 126 to 153 bpm using the percentage method. Enter your age to see your own ranges." },
  { q: "How do I calculate my target heart rate?", a: "Estimate your maximum heart rate (for example 220 minus age or 208 minus 0.7 times age), then multiply by your chosen intensity percentage. For the Karvonen method, subtract your resting heart rate from your maximum, multiply by the intensity, and add the resting rate back." },
  { q: "What is the Karvonen formula?", a: "Target heart rate = (maximum heart rate minus resting heart rate) x intensity + resting heart rate. It uses heart rate reserve, so it adjusts for your fitness level in a way plain percentages do not." },
  { q: "Which max heart rate formula is the most accurate?", a: "Tanaka and Nes tend to perform better than 220 minus age, especially after 40, but none is accurate for every individual. A tested maximum from a supervised or field effort beats any formula." },
  { q: "What are the five heart rate zones?", a: "They are Zone 1 (50 to 60 percent of maximum), Zone 2 (60 to 70 percent), Zone 3 (70 to 80 percent), Zone 4 (80 to 90 percent) and Zone 5 (90 to 100 percent). They range from recovery and easy aerobic work to maximal short efforts." },
  { q: "What heart rate zone is best for burning fat?", a: "Zones 1 and 2 (roughly 50 to 70 percent of maximum) burn the highest share of fat. Higher zones burn more total calories, so a mix of both, repeated consistently, works best for most goals." },
  { q: "Is it safe to work out at 100% of my target heart rate or higher?", a: "Short, all-out efforts are part of interval training for healthy, conditioned people, but they are not suitable for beginners or anyone with heart problems. Stop if you feel chest pain, dizziness or unusual breathlessness." },
  { q: "What should I do if my heart rate is below my target during exercise?", a: "Give it a few minutes to catch up, then raise your pace or incline slightly. If the effort feels hard but your heart rate stays low, check your sensor and consider medication or fatigue as causes." },
  { q: "What is the difference between Borg RPE and CR10?", a: "RPE uses a 6 to 20 scale designed to loosely track heart rate (rating times 10). CR10 uses a 0 to 10 scale that is simpler for in-workout use. Both measure how hard the effort feels." },
  { q: "Is this target heart rate calculator free?", a: "Yes. It is free to use online and does not require an account." },
];

const FORMULA_HEADERS = ["Age", "Haskell & Fox", "Tanaka", "Nes"];
const FORMULA_ROWS = [
  ["20", "200 bpm", "194 bpm", "198 bpm"],
  ["40", "180 bpm", "180 bpm", "185 bpm"],
  ["60", "160 bpm", "166 bpm", "173 bpm"],
];
const BORG_HEADERS = ["Rating", "Effort"];
const BORG_ROWS = [
  ["6", "No exertion"],
  ["7–8", "Extremely light"],
  ["9–10", "Very light"],
  ["11–12", "Light"],
  ["13–14", "Somewhat hard"],
  ["15–16", "Hard"],
  ["17–18", "Very hard"],
  ["19", "Extremely hard"],
  ["20", "Maximal"],
];
const CR10_ROWS = [
  ["0", "No exertion"],
  ["1", "Very light"],
  ["2", "Light"],
  ["3", "Moderate"],
  ["4", "Somewhat difficult"],
  ["5", "Difficult"],
  ["7", "Very difficult"],
  ["9", "Almost maximal"],
  ["10", "Maximal"],
];
const AGE_HEADERS = ["Age", "Estimated max", "Moderate (50–70%)", "Vigorous (70–85%)"];
const AGE_ROWS = [
  ["20", "200 bpm", "100–140 bpm", "140–170 bpm"],
  ["30", "190 bpm", "95–133 bpm", "133–162 bpm"],
  ["40", "180 bpm", "90–126 bpm", "126–153 bpm"],
  ["50", "170 bpm", "85–119 bpm", "119–145 bpm"],
  ["60", "160 bpm", "80–112 bpm", "112–136 bpm"],
  ["70", "150 bpm", "75–105 bpm", "105–128 bpm"],
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
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
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

export default function TargetHeartRateCalculatorFaqSection() {
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

      <Card title="What Is Heart Rate?">
        <P>
          Heart rate is the number of times your heart contracts in one minute. It is measured in beats per minute (bpm), and it is the
          same number you feel as your pulse at the wrist or neck. Your heart rate changes all day. It drops when you sleep and rises when
          you stand up, climb stairs, feel stressed, drink coffee, or go for a run.
        </P>
        <P>
          Three numbers matter when you work with a target heart rate calculator: your resting heart rate, your maximum heart rate, and the
          gap between them, called heart rate reserve.
        </P>
        <H3>What Is Resting Heart Rate?</H3>
        <P>
          Resting heart rate is how fast your heart beats when you are awake, calm, and not active. The{" "}
          <Ext href="https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse">American Heart Association</Ext>{" "}
          describes a normal resting rate for most adults as 60 to 100 bpm, though some sources narrow the typical range to 50 to 90.
          Well-trained athletes often sit in the 40s or 50s because their hearts pump more blood with each beat.
        </P>
        <P>
          A resting rate above 100 bpm is called tachycardia, and a rate below 60 is called bradycardia. A low rate is not a problem for a
          fit person with no symptoms. If a low or high rate comes with dizziness, fainting, chest discomfort or shortness of breath, see a
          doctor.
        </P>
        <P>
          The best way to measure it is to count your pulse for a full 60 seconds right after you wake up, before you get out of bed. Do
          this on three or four mornings and average the results. Poor sleep, illness, alcohol, caffeine and stress can all push a single
          reading higher.
        </P>
        <H3>What Is Minimum Heart Rate?</H3>
        <P>
          Minimum heart rate is the lowest your heart beats over a period, usually during deep sleep. Many fitness watches record it
          overnight. It is typically a few beats lower than your morning resting rate. You don’t need it for training zones, so the
          calculator asks for your resting rate instead.
        </P>
        <H3>What Is Maximum Heart Rate?</H3>
        <P>
          Maximum heart rate is the highest rate your heart can reach during all-out effort. It tends to fall with age and is mostly
          genetic, so training does not raise it much. The most accurate way to find it is a supervised cardiac stress test. You exercise
          on a treadmill while an electrocardiogram (ECG) monitors your heart, and the intensity increases in steps until your maximum is
          reached.
        </P>
        <P>
          Since most people never take that test, they estimate it with a formula. Estimates are useful, but they describe averages. Two
          healthy people of the same age can have maximums that differ by 20 bpm or more, and that holds true even among elite athletes.
        </P>
        <H3>What Is Heart Rate Reserve?</H3>
        <P>Heart rate reserve (HRR) is the difference between your maximum and resting heart rates:</P>
        <Formula>HRR = maximum heart rate − resting heart rate</Formula>
        <P>
          If your maximum is 180 bpm and your resting rate is 68, your reserve is 112 bpm. This is the working range your heart has
          available, and it is the basis of the Karvonen method.
        </P>
      </Card>

      <Card title="What Is a Target Heart Rate?">
        <P>
          Your target heart rate, also called your training heart rate range, is the range of beats per minute you aim to stay within while
          you exercise. It is expressed as a percentage of your maximum heart rate or your heart rate reserve. The idea behind it is simple.
          Heart rate rises in step with exercise intensity, so it gives you a number to measure effort with instead of guessing.
        </P>
        <P>
          For a person who exercises, a target range works like a guardrail. Staying too far below it gives your body little reason to
          adapt. Staying too far above it burns extra energy without added benefit, raises injury risk, and lengthens recovery. That is why
          the target heart rate is considered important for both fitness and safety. It tells you when to push and when to back off.
        </P>
        <H3>Target Heart Rate vs. Maximum Heart Rate</H3>
        <P>
          These two numbers are often confused. Your maximum heart rate is a ceiling, a single number you would hit only at all-out effort.
          Your target heart rate is a range below that ceiling. With a maximum of 180 bpm, a target range of 50 to 70 percent is 90 to 126
          bpm, and you would spend most of your exercise time there.
        </P>
        <H3>What Is Not True About Target Heart Rate?</H3>
        <P>A few common beliefs are wrong:</P>
        <List items={[
          ["", "It is not a fixed number. It changes with your age, fitness, resting heart rate and the formula used."],
          ["", "It is not exact. The maximum behind it is usually an estimate, so the range is a guide."],
          ["", "Higher is not always better. Most of your training should happen at moderate effort, with hard work added in small doses."],
          ["", "There is no single “fat-burning” number that works for everyone."],
          ["", "You do not need to hold the range every minute. Heart rate lags at the start of exercise, climbs during long efforts, and dips during recovery."],
        ]} />
      </Card>

      <Card title="How to Use the Target Heart Rate Calculator">
        <P>
          Start by choosing how to supply your maximum. If you don’t know it, enter your age and the calculator estimates it with the formula
          you pick. If you have measured your maximum in a lab test, a field test or a hard race finish, enter that number instead. A
          measured value is better than an estimate.
        </P>
        <P>
          Next, choose your method. The percentage method multiplies your maximum by each intensity level and only needs your age. The
          Karvonen method also uses your resting heart rate, which personalizes the zones to your current fitness. Then select the intensity
          scale you prefer, Borg RPE (6–20) or CR10 (0–10), and read your zones.
        </P>
        <P>
          Save your results in a training log or enter them in your watch, and recalculate every couple of months. Resting heart rate falls
          as fitness improves, and your zones should move with it.
        </P>
        <P>
          You don’t need to learn the math yourself, since the calculator handles it. But two skills are worth having: measuring your resting
          rate accurately and checking your pulse by hand. They make your results more reliable and keep you from depending on a watch that
          may be wrong.
        </P>
      </Card>

      <Card title="When You Need a Target Heart Rate Calculator">
        <List items={[
          ["Starting an exercise routine.", "Beginners often push too hard and quit. Lower zones keep early workouts manageable."],
          ["Building an endurance base.", "Runners, cyclists and swimmers use zones to keep easy days easy so hard days can be hard."],
          ["Managing weight.", "Zones help you plan sessions you can sustain without guessing whether a walk is too light or a run too intense."],
          ["Returning after illness or a long break.", "Capping your intensity at a set percentage prevents overreaching while fitness rebuilds."],
          ["Setting up a fitness watch.", "Many devices default to generic age-based zones. Your own maximum or Karvonen values give more meaningful alerts."],
          ["Planning interval sessions.", "The upper zones give you concrete targets for hard repeats."],
        ]} />
        <P>
          If you have a heart condition or high blood pressure, or you take medication that affects heart rate, talk to your doctor before
          using any zone calculator.
        </P>
      </Card>

      <Card title="Max Heart Rate Formulas: Haskell & Fox, Tanaka and Nes">
        <P>No formula predicts maximum heart rate perfectly, which is why the calculator offers three.</P>
        <List items={[
          ["Haskell & Fox (1971): 220 − age.", "This is the classic rule and the easiest to remember. It was built from limited data and tends to underestimate maximum heart rate in older adults."],
          ["Tanaka, Monahan & Seals (2001): 208 − 0.7 × age.", "This one comes from a meta-analysis of more than 18,000 people. Many coaches consider it a better fit for adults over 40."],
          ["Nes and colleagues (2013): 211 − 0.64 × age.", "It was developed from a large group of healthy adults in Norway and gives slightly higher estimates than the other two as age increases."],
        ]} />
        <DataTable headers={FORMULA_HEADERS} rows={FORMULA_ROWS} />
        <P>
          The formulas agree fairly well in young adulthood and drift apart with age. If the classic result feels too low during hard
          efforts after 50, that is probably why. Every formula also carries a margin of error of roughly 10 to 12 bpm, so treat the output
          as a well-informed starting point and refine it with how the effort feels.
        </P>
      </Card>

      <Card title="Karvonen Method vs. Percentage of Maximum">
        <P>The percentage method is simple: 70 percent of a 180 bpm maximum is 126 bpm. The Karvonen method uses heart rate reserve:</P>
        <Formula>Target heart rate = (maximum − resting) × intensity + resting</Formula>
        <P>
          Take a 40-year-old with a maximum of 180 bpm and a resting rate of 60. The reserve is 120. At 70 percent intensity, 120 × 0.7 = 84,
          and adding the resting rate gives 144 bpm. The percentage method gives 126 bpm for the same person at the same intensity, a gap of
          18 bpm. That is the difference between a comfortable jog and a steady aerobic effort.
        </P>
        <P>
          Karvonen is more individual because your resting rate reflects your conditioning. The two methods differ most when resting heart
          rate is unusually high or low. If you can measure your resting rate reliably, Karvonen is usually the better choice. If you only
          want a quick estimate from your age, the percentage method is fine.
        </P>
      </Card>

      <Card title="The Five Heart Rate Zones Explained">
        <P>
          Training intensity is usually divided into five zones, shown here as a percentage of maximum heart rate. Each one has a different
          purpose, which is why a well-built week includes more than one.
        </P>
        <List items={[
          ["Zone 1 (50–60%)", "is a very light effort for warm-ups, cool-downs, rest days and easy days. You can talk in full sentences without thinking about it."],
          ["Zone 2 (60–70%)", "is the aerobic base zone. Breathing is controlled and you can hold a conversation. This zone builds endurance and fat-use efficiency, so endurance athletes spend a lot of time here. If you searched for a Zone 2 heart rate calculator, this is the range."],
          ["Zone 3 (70–80%)", "is moderate to tempo effort. Talking becomes choppy. It builds stamina and strength but is tiring, so it is easy to overuse."],
          ["Zone 4 (80–90%)", "sits near your lactate threshold. It is hard and sustainable for only minutes at a time, and it trains your ability to hold a strong pace longer."],
          ["Zone 5 (90–100%)", "is maximal or near-maximal effort for short repeats with full recovery in between. It improves top-end performance but should never make up all your training."],
        ]} />
        <P>
          For general health, the American Heart Association puts moderate-intensity exercise at about 50 to 70 percent of maximum heart rate
          and vigorous exercise at about 70 to 85 percent. If you use the Karvonen method, the same percentages apply to your heart rate
          reserve instead, with your resting rate added back.
        </P>
      </Card>

      <Card title="Borg RPE and CR10 Scales: Training by Feel">
        <P>
          Heart rate is a lagging, noisy signal. It rises slowly at the start of an effort, drifts upward in heat, and shifts with sleep,
          caffeine, stress and medication. Rating of perceived exertion (RPE) gives you a second reference based on how hard the effort
          feels. It requires no equipment, and research shows people can match their effort to words like “moderate” and “hard” quite
          consistently.
        </P>
        <H3>Borg RPE Scale (6–20)</H3>
        <P>
          The original Borg scale runs from 6 (no exertion) to 20 (maximal exertion). It was designed so that each rating multiplied by 10
          roughly matches heart rate in healthy adults. A 13 corresponds to about 130 bpm.
        </P>
        <DataTable headers={BORG_HEADERS} rows={BORG_ROWS} />
        <P>With this scale, the target heart rate is:</P>
        <Formula>THR = RHR + (MHR − RHR) × (rating − 6) ÷ 14</Formula>
        <P>For example, with a maximum of 180, a resting rate of 60 and a rating of 13: 60 + 120 × (7 ÷ 14) = 120 bpm.</P>
        <H3>Borg CR10 Scale (0–10)</H3>
        <P>The CR10 scale is a simpler version. Zero means no effort, and 10 means the strongest effort you have ever experienced.</P>
        <DataTable headers={BORG_HEADERS} rows={CR10_ROWS} />
        <P>Here the formula is:</P>
        <Formula>THR = RHR + (MHR − RHR) × rating ÷ 10</Formula>
        <P>With the same numbers and a rating of 4: 60 + 120 × 0.4 = 108 bpm.</P>
        <P>
          If your watch says Zone 2 but the effort feels like a 7 on CR10, trust the sensation and look for a cause. Fatigue, illness, heat
          or a bad sensor reading are common ones.
        </P>
      </Card>

      <Card title="What Is a Good Heart Rate by Age?">
        <P>
          Your target range gets lower as you get older because your maximum heart rate declines. The table below uses the 220 − age formula
          and the standard ranges of 50–70 percent for moderate effort and 70–85 percent for vigorous effort.
        </P>
        <DataTable headers={AGE_HEADERS} rows={AGE_ROWS} />
        <P>
          These are averages, not personal limits. A fit 50-year-old may comfortably exceed the numbers above, and a beginner of the same age
          may need to stay at the low end. Your own numbers will also shift if you use a different formula or the Karvonen method with your
          resting rate.
        </P>
      </Card>

      <Card title="Target Heart Rate for Different Activities">
        <P>Your zones don’t change from one activity to the next, but the zone you aim for does. Here is how that plays out in common situations.</P>
        <H3>Cardio and Aerobic Exercise</H3>
        <P>
          For general cardio, such as brisk walking, cycling, swimming or an elliptical session, most people aim for moderate intensity
          (50–70%) and add vigorous efforts (70–85%) as fitness improves. The American Heart Association recommends at least 150 minutes of
          moderate activity or 75 minutes of vigorous activity per week. To find your range during aerobic exercise, calculate your zones
          first, then check your pulse or watch at the midpoint of the session.
        </P>
        <H3>Walking, Running and the Treadmill</H3>
        <P>
          Walking usually falls in Zones 1 and 2, and a brisk or inclined walk can reach Zone 3. Running often pushes into Zones 3 and 4 unless
          you deliberately slow down. A treadmill is helpful because you can change speed and incline in small steps and watch your heart rate
          respond. It is a good place to learn what each zone feels like before you try to hold it outdoors.
        </P>
        <H3>HIIT Workouts</H3>
        <P>
          High-intensity interval training alternates hard efforts with recovery. Work intervals typically target Zone 4 to low Zone 5,
          around 80 to 95 percent of maximum. Recovery periods should bring you back down to Zone 1 or 2. Because the heart rate takes a
          minute or more to climb, short intervals often finish before it reaches the target, so use perceived effort as well. A rating of 8
          or 9 on CR10 is a good match for the hard portion. HIIT is demanding, so beginners should build an aerobic base first.
        </P>
        <H3>Older Adults and Seniors</H3>
        <P>
          Older adults can use the same percentage ranges, but most do best starting at the low end of moderate intensity (about 50 to 60
          percent) and building gradually. The talk test is a useful backup: you should be able to speak in short sentences. Mix aerobic work
          with strength and balance training. Seniors who take blood pressure or heart medication should check with their doctor first, since
          some drugs lower heart rate and make age-based zones less accurate.
        </P>
        <H3>If Your Fitness Is Low</H3>
        <P>
          If you are new to exercise or coming back after a long break, start in Zone 1 and the lower part of Zone 2, around 50 to 60 percent.
          Short sessions of 10 to 15 minutes are enough at first. Add a few minutes each week, and move up to higher zones only when the
          current one feels easy. Your resting heart rate will gradually drop as you get fitter, and your Karvonen zones will move with it.
        </P>
        <H3>Higher Body Weight</H3>
        <P>
          Body weight is not part of any target heart rate formula, so a person who weighs 250 pounds uses the same age-based method as anyone
          else. In practice, though, carrying more weight means the heart works harder at any given pace, so heart rate climbs faster.
          Walking, cycling, swimming and water exercise are good starting points because they raise heart rate without heavy joint impact.
          Start at the lower end of the range and talk to a doctor if you have other health concerns.
        </P>
        <H3>Target Heart Rate for a Stress Test</H3>
        <P>
          A medical stress test is different from a normal workout. Doctors often aim for about 85 percent of your age-predicted maximum,
          while monitoring your ECG and blood pressure. The goal is to see how your heart behaves under strain. It happens in a clinical
          setting, so don’t use that number as a goal for your own training.
        </P>
      </Card>

      <Card title="Target Heart Rate for Weight Loss and Fat Burning">
        <P>
          Fat loss depends on using more energy than you take in over weeks and months. Heart rate zones help you choose workouts you can
          repeat consistently.
        </P>
        <P>
          At lower intensities, such as Zones 1 and 2, a higher share of your calories comes from fat. At higher intensities, a smaller share
          comes from fat, but you burn more calories per minute overall. Neither is better on its own. A good weekly plan mixes both: longer
          steady sessions in Zone 2, plus one or two harder sessions in Zones 3 and 4.
        </P>
        <P>
          If you walk near the bottom of your target zone, you will burn fat, but at a slow rate per minute. Walking longer or faster raises
          the total. A few ways to get more from your sessions:
        </P>
        <List items={[
          ["", "Build up duration before intensity, since more minutes in your zone matter more than a few hard ones."],
          ["", "Add one interval session per week once you have a base."],
          ["", "Do strength training two or more days per week to hold on to muscle."],
          ["", "Track weekly totals, not single workouts."],
        ]} />
        <P>
          On a treadmill, staying in moderate zones will not by itself make you lose muscle. Muscle loss is more closely tied to a large
          calorie deficit, low protein intake and no resistance training. If you want to keep muscle, lift weights regularly, eat enough
          protein, and use cardio at a moderate intensity to support your goals.
        </P>
      </Card>

      <Card title="Is It Harmful to Work Out Above Your Target Heart Rate?">
        <P>
          Briefly going above your target range is normal. It happens during hills, sprints and intervals. What matters is how long and how
          often. Spending extended time above your zone leads to early fatigue, poor recovery, a higher risk of overuse injury and a drop in
          workout quality.
        </P>
        <P>
          Working at or above 100 percent of your estimated maximum is a different matter. Because the maximum is an estimate, you may exceed
          it without any trouble, and short all-out efforts are part of race and interval training. But it is not appropriate for beginners,
          for people with heart disease or risk factors, or for anyone on medication that affects heart rate. Stop exercising and get medical
          help if you have chest pain, pressure, dizziness, fainting, an irregular or racing heartbeat, or unusual shortness of breath.
        </P>
        <P>
          When you reach your target heart rate, your heart is pumping more blood, your breathing is deeper, and your muscles are using more
          oxygen. Doing this regularly builds cardiovascular fitness. There is no switch that turns on at a certain number. The benefit comes
          from repeating it over weeks.
        </P>
      </Card>

      <Card title="How to Stay in Your Target Heart Rate Zone">
        <List items={[
          ["Warm up first.", "Spend five to ten minutes at an easy pace. Heart rate takes a few minutes to catch up with effort, so it won’t hit your zone immediately."],
          ["Change pace in small steps.", "Adjust speed, incline or resistance a little at a time and wait 30 to 60 seconds to see the result."],
          ["Use two measures.", "Watch your heart rate, and compare it with the talk test or your RPE."],
          ["Expect drift.", "In long efforts, heat and dehydration push heart rate up even at the same pace. Slow down slightly, or drink water."],
          ["Check by hand.", "Place two fingers on your wrist or neck, count beats for 15 seconds, and multiply by four."],
        ]} />
        <H3>What If Your Heart Rate Is Below the Range?</H3>
        <P>
          If your pulse is under your target during exercise, first check whether it is a timing issue. If you are still in your first few
          minutes, wait. If you are well into the workout and the effort feels easy, increase your speed or incline a little. If it feels hard
          but the number is low, the reading may be wrong, or something else may be at play, such as fatigue or medication.
        </P>
        <H3>What If You Can’t Raise Your Heart Rate?</H3>
        <P>
          Some people struggle to reach their zones. Common reasons include beta blockers or other heart medications, very high fitness, a
          poor sensor reading, or simply not working hard enough. Try a different sensor, such as a chest strap, and rely on RPE instead of
          numbers. If you are working hard but your heart rate will not rise, or this is a new change, see your doctor.
        </P>
      </Card>

      <Card title="Will Your Target Heart Rate Change Over Time?">
        <P>
          Yes, for several reasons. Maximum heart rate drops slowly with age, by roughly 0.6 to 0.7 bpm per year according to the Tanaka and
          Nes equations. Resting heart rate usually decreases as you get fitter, which changes your Karvonen zones. Illness, weight change,
          stress and new medications can also shift your numbers. Recalculate every six to eight weeks, or whenever your fitness changes
          noticeably.
        </P>
      </Card>

      <Card title="How Accurate Are the Results?">
        <P>
          The calculations are exact, but the maximum they start from is an estimate. Age-based formulas describe groups of people, not
          individuals, so your real maximum may sit 10 or more bpm away from the predicted value. A tested maximum, entered directly, is the
          most reliable input.
        </P>
        <P>
          Measurement matters too. Chest straps track heart rate more accurately than optical wrist sensors, especially during intervals or
          in cold weather. Heat, humidity, dehydration, altitude and lack of sleep all raise heart rate for the same workload. Use your zones
          as guides, and combine them with RPE or CR10 before deciding whether a session was on target.
        </P>
      </Card>

      <Card title="Free to Use, With No Signup">
        <P>
          The Tolz target heart rate calculator is free to use, with no account and no registration, and there are no paid tiers to unlock
          your zones. The details you enter, such as age and resting heart rate, are used only to calculate your results. The output is
          general fitness guidance, not medical advice.
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
