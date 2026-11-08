import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is takt time?",
    a: "Takt time is the interval at which each product must be produced to meet customer demand. It equals the available production time divided by the consumer demand for the same period.",
  },
  {
    q: "How do you calculate takt time for batch production?",
    a: "Divide the consumer demand by the items per batch to get the number of batches needed, then divide the available production time by it: takt time per batch = available production time / (consumer demand / items per batch). With 24 cookies per batch, 4 hours and 600 cookies, that's 240 min / 25 = 9.6 minutes per batch.",
  },
  {
    q: "What is the difference between takt time and cycle time?",
    a: "Takt time is the pace demand requires; cycle time is how long your process actually takes to make one unit. If the cycle time is longer than the takt time, you can't keep up with demand without more capacity or more production time.",
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
const h3Style = { ...h2Style, fontSize: 15, margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const formula = { ...pStyle, color: "var(--text-primary)", fontWeight: 700, textAlign: "center" };
const cardStyle = { padding: "20px 20px" };
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

export default function TaktTimeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Takt Time Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} takt time calculator tells you how fast to produce each product to meet demand. Whether you run a burger joint,
          manufacture parts or produce specialty items, it keeps you in step with your customers, and it even handles batch production.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>Read on to learn:</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>What takt time is;</li>
          <li>The history of the takt time concept;</li>
          <li>The takt time formula;</li>
          <li>How to use the takt time calculator; and</li>
          <li>A worked takt time example.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Takt Time?</h2>
        <p style={pStyle}>
          Takt time is the time interval at which each product should be produced to meet demand. In mass production, both over- and
          under-production lead to inefficiencies and losses, so the manufacturing pace needs careful control.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The idea is to run your operation like clockwork, finishing a new product at a fixed interval: that interval is the takt time. For
          stock planning, see also the {link("/calculators/logistics/reorder-point-calculator", "reorder point calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>History of the Takt Time Concept</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <em>Takt</em> is German for meter, beat, rate or pace, like the beat of a clock or metronome; <em>Taktzeit</em> means clock cycle, and
          takt can also mean a conductor&apos;s baton. Japan is thought to have adopted the concept in the 1930s, when Germany and Japan
          collaborated on aircraft production. After World War II, Toyota built takt time into the Toyota Production System, also known as
          Just in Time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Takt Time Formula</h2>
        <p style={pStyle}>Takt time is the available production time divided by the consumer demand for the same period:</p>
        <p style={formula}>takt time = available production time / consumer demand</p>
        <p style={pStyle}>For batch production, divide the consumer demand by the items per batch to get the takt time per batch:</p>
        <p style={formula}>takt time per batch = available production time / (consumer demand / items per batch)</p>
        <p style={pStyle}>For a weekly takt time, the available time comes from your working week:</p>
        <p style={{ ...formula, marginBottom: 0 }}>net production time = working days × (hours per day − lunch break − other breaks)</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Takt Time with the Calculator</h2>
        <h3 style={h3Style}>1. Simple calculation</h3>
        <p style={pStyle}>
          A donut shop needs to sell 500 donuts a day but only has 3 hours a day for baking. Enter 3 hours as the available production time and
          500 units as the consumer demand: you must start a new donut every 21.6 seconds.
        </p>
        <h3 style={h3Style}>2. Batch production</h3>
        <ol style={olStyle}>
          <li>A cookie shop bakes 24 cookies per batch, for 4 hours every morning, and sells about 600 cookies a day.</li>
          <li>Select batch production, and enter 24 items per batch, 4 hours of available production time and 600 units of consumer demand.</li>
          <li>A new batch must go into the oven every 9.6 minutes.</li>
        </ol>
        <p style={pStyle}>
          But what if one batch takes 12 minutes to bake? You could bake two batches at once, buy a second oven, or extend the production time
          for a takt time of 12 minutes. Try it: enter 12 minutes as the takt time and leave the available production time blank (it&apos;s 5
          hours).
        </p>
        <h3 style={h3Style}>3. Weekly calculation</h3>
        <p style={pStyle}>
          Use a weekly takt time if you sell every day but only produce on some days. An online shop sells handmade cloth masks all week but
          makes them Monday to Friday:
        </p>
        <ol style={olStyle}>
          <li>Set <em>Working</em> to 5 days per week and <em>Hours per day</em> to 8 hours (one shift).</li>
          <li>Enter the 30-minute lunch break, and 20 minutes of other breaks for setting up and cleaning up.</li>
          <li>The net production time is 35 hours 50 minutes a week.</li>
          <li>With a weekly demand of 100 masks, you must make one mask every 21.5 minutes.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Takt Time Calculation Example</h2>
        <p style={pStyle}>Back to the donuts: 500 donuts in 3 hours. For a takt time in seconds, first convert the hours to seconds:</p>
        <p style={formula}>3 hrs × 3,600 seconds/hour = 10,800 seconds</p>
        <p style={pStyle}>Then apply the takt time formula:</p>
        <p style={formula}>takt time = 10,800 seconds / 500 donuts = 21.6 seconds per donut</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To convert other durations, use the {link("/tools/unit-converter", "unit converter")}. More tools are in the
          {" "}{link("/calculators/logistics", "logistics calculators")}.
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
