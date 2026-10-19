import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my running pace?",
    a: "Divide the time by the distance. A 5K run in 25 minutes is 5 minutes per kilometer, or about 8:03 per mile. Choose the Pace tab, enter the time and distance, and the calculator shows your pace per mile and per kilometer and your speed in mph, km/h, meters per minute and meters per second.",
  },
  {
    q: "How do I enter times?",
    a: "Use hh:mm:ss, but leading zeros are optional: 5 minutes 3 seconds can be typed as 5:3 instead of 00:05:03, and seconds can have decimals (1:30.25). A single number is read as seconds.",
  },
  {
    q: "What are splits?",
    a: "Splits are the times at which you would pass each kilometer and each mile at your pace, useful for checking you are on target during a race. They are listed for distances over 2 km.",
  },
  {
    q: "What does the Multipoint Pace Calculator do?",
    a: "Enter the cumulative distance and time at up to 12 points of a run, and it works out the pace of each section between points, your accumulated pace and your average, with a chart of how the pace changed. Run the same route again to compare sections.",
  },
  {
    q: "How is the finish time estimated?",
    a: "It assumes you keep your current pace: finish time = elapsed time × full distance ÷ distance covered so far. For example, 1 km in 6:15 means 31:15 for 5 km.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const RECORDS = [
  ["100 meters", "2:35/mile or 1:36/km", "2:49/mile or 1:45/km"],
  ["200 meters", "2:35/mile or 1:36/km", "2:52/mile or 1:47/km"],
  ["400 meters", "2:54/mile or 1:48/km", "3:12/mile or 1:59/km"],
  ["800 meters", "3:23/mile or 2:06/km", "3:48/mile or 2:21/km"],
  ["1,500 meters", "3:41/mile or 2:17/km", "4:07/mile or 2:34/km"],
  ["1 mile", "3:43/mile or 2:19/km", "4:13/mile or 2:37/km"],
  ["5K", "4:04/mile or 2:31/km", "4:34/mile or 2:50/km"],
  ["10K", "4:14/mile or 2:38/km", "4:45/mile or 2:57/km"],
  ["Half Marathon (13.11 miles / 21.098 km)", "4:27/mile or 2:46/km", "4:58/mile or 3:05/km"],
  ["Marathon (26.22 miles / 42.195 km)", "4:41/mile or 2:55/km", "5:10/mile or 3:13/km"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const formula = { ...pStyle, textAlign: "center", fontWeight: 600 };
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

export default function PaceCalculatorFaqSection() {
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
        <p style={pStyle}>
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this pace calculator works out your pace, finish time or distance for
          running, walking or cycling, with race times and splits, a multipoint calculator for the sections of a run, a pace converter and a
          finish-time estimator.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To see how many calories your training needs, try the {link("/calculators/health/bmr-calculator", "BMR Calculator")} or the{" "}
          {link("/calculators/health/calorie-tracker", "Calorie Tracker & Calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Typical Races and World Record Paces</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 460 }}>
            <thead><tr><th style={{ textAlign: "left" }}>Category</th><th style={{ textAlign: "left" }}>Men's World Record Pace</th><th style={{ textAlign: "left" }}>Women's World Record Pace</th></tr></thead>
            <tbody>{RECORDS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Training Through Pace and Heart Rate</h2>
        <p style={pStyle}>
          Pace is how fast you move; heart rate is how many times your heart beats in a minute. The two rise together, and using both in
          training helps you improve performance, avoid over-training and track your fitness over time.
        </p>
        <h3 style={h3Style}>Measuring and Estimating Heart Rate and Heart Rate Zones</h3>
        <p style={pStyle}>
          Heart rate can be measured with a heart rate monitor, or simply by counting your pulse at the wrist or neck against a watch. Two
          important measures are resting heart rate and maximum heart rate (MHR), which are used to set target heart rate zones for different
          levels of exercise. MHR is best measured with a supervised stress test at gradually increasing effort, which takes ten to twenty
          minutes, so it is usually estimated from age instead. There is little agreement on the best formula; the most quoted one is:
        </p>
        <p style={formula}>MHR = 220 − age</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It has no stated margin of error and fitness professionals do not consider it a good predictor, as MHR varies widely even between
          people of the same age and training. It is still a common reference for training zones. An intensity of 60-70% of maximum heart
          rate is considered ideal for burning fat.
        </p>
        <h3 style={h3Style}>Aerobic vs. Anaerobic Exercise</h3>
        <p style={pStyle}>
          The two differ in how long and how hard the muscles work and how they produce energy. Anaerobic exercise (about 80-90% of MHR) is short,
          intense bursts; aerobic exercise (about 70-80% of MHR) is lighter activity kept up for a long time. For aerobic benefit, 20-30 minutes
          at 55-85% of MHR is generally recommended.
        </p>
        <p style={pStyle}>
          In aerobic exercise the muscles get enough oxygen to produce all the energy they need. In anaerobic exercise the heart and lungs cannot
          deliver oxygen fast enough, so muscles break down sugar instead, producing excess lactate. That causes the familiar burning feeling and
          eventually forces you to stop unless the lactate has time to clear. Lactate is also made during aerobic exercise, but at low intensity
          it is used almost as fast as it is produced.
        </p>
        <p style={pStyle}>
          Aerobic fitness matters most for long events such as a marathon. Your "aerobic threshold pace", the pace you can hold mainly on aerobic
          energy, balances the use of fat and carbohydrates, is fairly easy and can be held for hours. Raising it lets you run faster for longer,
          and it is a big part of many marathon plans.
        </p>
        <p style={pStyle}>
          The anaerobic threshold is, for some, the point where glycogen rather than oxygen becomes the body's main energy source. Anaerobic
          training improves overall fitness but is not ideal marathon training, as an anaerobic pace can't be held for long. Some training at or
          slightly above the anaerobic threshold (where lactic acid builds up faster than it can be cleared) is still useful.
        </p>
        <p style={pStyle}>
          Lab tests measure these thresholds best, but they can be estimated. A 2005 study found the most accurate field method to be a 30-minute
          solo time trial at maximum effort: your average heart rate over the last 20 minutes estimates your anaerobic (lactate) threshold heart
          rate, LTHR. In a group, extend the trial to 60 minutes. Subtract 30 beats per minute from it to estimate the aerobic threshold heart rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In short, threshold training pushes back the point where lactate starts to build up, which delays fatigue and can let you run farther
          and faster.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
