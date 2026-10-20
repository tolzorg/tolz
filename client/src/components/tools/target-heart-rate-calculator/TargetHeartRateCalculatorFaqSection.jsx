import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { BORG, CR10 } from "../../../utils/targetHeartRateCalculatorEngine";

const FAQ_ITEMS = [
  {
    q: "How do I calculate my target heart rate?",
    a: "Estimate your maximum heart rate (for example 220 − age), then take the percentages for the zone you want. With a resting heart rate, the Karvonen method uses your heart rate reserve instead: target = (max − resting) × % + resting. For a 30-year-old with a resting heart rate of 70, the 50-85% range is 130 to 172 bpm.",
  },
  {
    q: "Do I need to enter my resting heart rate?",
    a: "No, it's optional. Without it, the zones are simple percentages of your maximum heart rate. With it, the calculator uses your heart rate reserve (Karvonen) or, if you choose, the Borg RPE scales, which are usually more personal.",
  },
  {
    q: "Which maximum heart rate formula is best?",
    a: "Haskell & Fox (220 − age) is the simplest and most widely used. Tanaka (208 − 0.7 × age) and Nes (211 − 0.64 × age) were developed later from larger studies and tend to fit older adults better. All are population averages; a cardiac stress test gives your actual maximum.",
  },
  {
    q: "What is a normal resting heart rate?",
    a: "For adults it is typically 50-90 bpm (some sources still say 60-100). Very fit athletes are often lower. A rate above the range is called tachycardia and one below it bradycardia.",
  },
  {
    q: "Which zone should I train in?",
    a: "It depends on your goal: zone 1 (50-60%) for warm-ups and recovery, zone 2 (60-70%) for fat burning and endurance, zone 3 (70-80%) for aerobic fitness, zone 4 (80-90%) for anaerobic capacity, and zone 5 (90-100%) only in short bursts. Balance hard zones with recovery.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const ZONES = [
  ["Zone 1 (50-60%)", "Light to moderate activity: warm-up, cooldown, rest days or an easy training day."],
  ["Zone 2 (60-70%)", "Fat burning and endurance: some effort, but sustainable for a long time."],
  ["Zone 3 (70-80%)", "More effort; helps build speed and strength."],
  ["Zone 4 (80-90%)", "Close to your maximum; trains how long you can hold a high output."],
  ["Zone 5 (90-100%)", "Your maximum effort, sustainable only briefly. Improves muscle efficiency and cardiovascular fitness, but needs plenty of recovery and should not be your only zone."],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: "14px 0 6px", scrollMarginTop: 80 };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 10px", paddingLeft: 20 };
const cardStyle = { padding: "20px 20px" };
const formula = { fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

function ScaleTable({ rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", maxWidth: 360 }}>
        <thead><tr><th style={{ textAlign: "center" }}>RPE scale</th><th style={{ textAlign: "left" }}>Intensity</th></tr></thead>
        <tbody>{rows.map(([b, name]) => <tr key={b}><td style={{ textAlign: "center" }}>{b}</td><td>{name}</td></tr>)}</tbody>
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
        <h2 style={h2Style}>What Is Heart Rate?</h2>
        <p style={pStyle}>
          Heart rate is the number of times the heart contracts per minute, measured in beats per minute (bpm). To use this calculator well,
          it helps to understand maximum heart rate, resting heart rate and heart rate reserve.
        </p>
        <h3 style={h3Style}>Maximum heart rate</h3>
        <p style={pStyle}>
          Maximum heart rate is the highest number of beats per minute your heart reaches during intense exercise. It is measured most
          accurately with a cardiac stress test, usually on a treadmill with an electrocardiogram (ECG), where the intensity rises until the
          heart shows its maximum. The theoretical maximum human heart rate is 300 bpm.
        </p>
        <p style={pStyle}>
          More often it is estimated with a formula. These are criticized because they give population averages, and an individual can differ
          a lot: Dr. Fritz Hagerman found that men in their 20s on Olympic rowing teams had maximum heart rates anywhere from 160 to 220 bpm.
          Common formulas, based mainly on age:
        </p>
        <ul id="mhr-formulas" style={{ ...listStyle, scrollMarginTop: 90 }}>
          <li><strong>Haskell &amp; Fox (1971):</strong> <span style={formula}>maximum heart rate = 220 − age</span></li>
          <li><strong>Tanaka, Monahan, &amp; Seals (2001):</strong> <span style={formula}>maximum heart rate = 208 − 0.7 × age</span></li>
          <li><strong>Nes, Janszky, Wisloff, Stoylen, Karlsen (2013):</strong> <span style={formula}>maximum heart rate = 211 − 0.64 × age</span></li>
        </ul>
        <h3 style={h3Style}>Resting heart rate</h3>
        <p style={pStyle}>
          Resting heart rate is your heart rate while awake and at rest, in a neutral environment, neither too hot nor cold, and free of
          stress or surprise. Measure it with a device or by counting your pulse for a full minute. A typical adult range is 50-90 bpm (some
          sources say 60-100, which is slightly dated). Above the range is tachycardia, below it bradycardia, though very fit athletes often
          have resting rates of 50-60 or even lower.
        </p>
        <h3 style={h3Style}>Heart rate reserve</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Heart rate reserve is the difference between your maximum and resting heart rates:{" "}
          <span style={formula}>HR reserve = MHR − RHR</span>. For example, with a maximum of 180 bpm and a resting rate of 68:{" "}
          <span style={formula}>HR reserve = 180 − 68 = 112</span>.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Target Heart Rate Zones</h2>
        <p style={pStyle}>
          The harder you exercise, the higher your heart rate. Keeping it within a target range (the training heart rate range) is
          beneficial: far above it you spend energy with little extra benefit and risk injury and longer recovery; far below it, the exercise
          may do little. Target heart rate is usually split into five zones:
        </p>
        <ul style={listStyle}>
          {ZONES.map(([z, t]) => <li key={z}><strong>{z}:</strong> {t}</li>)}
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Each zone has its benefits, so plan your workouts around them to balance improvement and recovery.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 id="intensity-methods" style={{ ...h2Style, scrollMarginTop: 90 }}>Methods for Measuring Intensity</h2>
        <p style={pStyle}>
          There is no single agreed way to measure exercise intensity, so the calculator lets you choose the maximum heart rate formula and
          the intensity scale (under Settings).
        </p>
        <h3 style={h3Style}>Percentage of maximum heart rate (Haskell &amp; Fox zones)</h3>
        <p style={pStyle}>
          The simplest and most widely used method: multiply your maximum heart rate by the zone percentages. The calculator uses it when you
          enter an age but no resting heart rate. For a 36-year-old, <span style={formula}>MHR = 220 − 36 = 184</span>, so the moderate zone
          (70-80%) is <span style={formula}>184 × 0.70 = 129</span> to <span style={formula}>184 × 0.80 = 147</span> bpm. Target ranges are
          often given as 50-85%.
        </p>
        <h3 style={h3Style}>Karvonen method</h3>
        <p style={pStyle}>
          The Karvonen method uses heart rate reserve, so it accounts for your resting heart rate. It is the default when you enter both an
          age and a resting heart rate: multiply the percentages by HR reserve and add the resting rate. For the same 36-year-old with a
          resting rate of 70: <span style={formula}>HR reserve = 184 − 70 = 114</span>,{" "}
          <span style={formula}>0.70 × 114 + 70 = 150</span> and <span style={formula}>0.80 × 114 + 70 = 161</span>, so the 70-80% zone is
          150-161 bpm.
        </p>
        <h3 style={h3Style}>Rating of perceived exertion (RPE)</h3>
        <p style={pStyle}>
          RPE lets you rate how hard you are working without measuring anything; studies show people judge terms like "moderate" and
          "intense" accurately. There are two common scales.
        </p>
        <p style={pStyle}>
          <strong>Borg scale (6-20):</strong> 6 means no exertion and 20 maximum exertion; each value × 10 roughly matches the heart rate
          (6 ≈ 60 bpm, 20 ≈ 200 bpm). Target heart rate: <span style={formula}>THR = RHR + (MHR − RHR) × (B − 6) / 14</span>. For example,
          "somewhat hard" (13) with a maximum of 190 and a resting rate of 60: 60 + 130 × 7/14 = 125 bpm.
        </p>
        <ScaleTable rows={BORG.map(([b, n], i) => [b, i === 0 ? "No exertion at all" : n])} />
        <p style={pStyle}>
          <strong>Borg CR10 scale (0-10):</strong> a modified version where 0 is no exertion and 10 the strongest exertion you have
          experienced. Target heart rate: <span style={formula}>THR = RHR + (MHR − RHR) × B / 10</span>. For example, "somewhat difficult" (4)
          with a maximum of 190 and a resting rate of 60: 60 + 130 × 0.4 = 112 bpm.
        </p>
        <ScaleTable rows={CR10} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Related: the {link("/calculators/sports/pace-calculator", "Pace Calculator")} and the{" "}
          {link("/calculators/sports/one-rep-max-calculator", "One Rep Max Calculator")}.
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
