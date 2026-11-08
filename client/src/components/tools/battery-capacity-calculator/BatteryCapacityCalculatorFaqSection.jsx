import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the capacity of a battery?",
    a: "The total amount of electrical energy the battery's electrochemical reactions can deliver, usually expressed in watt-hours or amp-hours. A 50 Ah battery, for example, can deliver 1 A for 50 hours or 5 A for 10 hours.",
  },
  {
    q: "How long does it take to fully charge a 200 Ah battery?",
    a: "About 5 hours for a 12 V, 200 Ah car battery charged at 0.2C: the runtime to full capacity is t = 1/C = 1/0.2 = 5 hours, or 300 minutes.",
  },
  {
    q: "What factors affect battery capacity?",
    a: "The discharge current, internal resistance, state of charge and temperature. The higher the discharge current and the temperature during charging and use, the shorter the battery life.",
  },
  {
    q: "How can I measure battery capacity?",
    a: "Connect the battery to a constant-current load I and measure the time T it takes to discharge to a set voltage: the capacity is Q = I × T in amp-hours. With a constant-power load P instead, Q = P × T gives the capacity in watt-hours.",
  },
  {
    q: "What is the C rating of a battery?",
    a: "The rate at which the battery charges or discharges relative to its capacity. A 60 Ah battery rated at 1C can deliver 60 A continuously for 1 hour; higher discharge rates (higher C ratings) lower the total capacity you get out of the battery.",
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
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
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

export default function BatteryCapacityCalculatorFaqSection() {
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
        <h2 style={h2Style}>Battery Capacity Calculator</h2>
        <p style={pStyle}>
          Want to convert between amp-hours and watt-hours, or find the C-rate of a battery? The {link("/", "Tolz")} battery capacity
          calculator shows how much energy is stored in the battery your smartphone or drone runs on, and the steps below show how to work out
          amp-hours and watt-hours yourself.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Wondering how long your device will run on that battery? Try the{" "}
          {link("/calculators/tech-electronics/battery-life-calculator", "battery life calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are Battery Amp-Hours?</h2>
        <p style={pStyle}>
          A battery&apos;s job is to store energy, which we usually measure in watt-hours: one watt of power sustained for one hour.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To find how many watt-hours a battery holds, we need its electric charge, commonly given in amp-hours: amps (electric current)
          multiplied by hours (time).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Battery Capacity Formula</h2>
        <p style={pStyle}>The power P of an electrical device is its voltage V multiplied by its current I:</p>
        <p style={{ ...pStyle, ...mono }}>P = V × I</p>
        <p style={pStyle}>Energy E is power multiplied by time T, so multiplying both sides by time gives:</p>
        <p style={{ ...pStyle, ...mono }}>E = V × I × T</p>
        <p style={pStyle}>Amp-hours measure electric charge Q (the battery capacity), so the battery capacity formula is:</p>
        <p style={{ ...pStyle, ...mono }}>E = V × Q</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li><strong>E</strong>: energy stored in the battery, in watt-hours;</li>
          <li><strong>V</strong>: the battery&apos;s voltage; and</li>
          <li><strong>Q</strong>: the battery capacity, in amp-hours.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Amp-Hours</h2>
        <p style={pStyle}>Say you know a battery&apos;s voltage and stored energy and want its capacity:</p>
        <ol style={olStyle}>
          <li>Note down the voltage, for example a standard 12 V battery.</li>
          <li>Note down the stored energy, say 26.4 Wh.</li>
          <li>Enter both in the calculator, which rearranges E = V × Q to Q = E / V = 26.4 / 12 = 2.2 Ah.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>The battery capacity is 2.2 Ah. Going the other way, 14.8 V × 3.65 Ah = 54.02 Wh.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Battery Parameters</h2>
        <p style={pStyle}>Open <em>Other battery parameters</em> to work out three more values:</p>
        <ul style={listStyle}>
          <li>
            <strong>C-rate</strong>: how fast the battery charges and discharges. A 1C battery takes one hour at 100 A to charge 100 Ah; a 2C
            battery needs just half an hour, and a 0.5C battery two hours.
          </li>
          <li><strong>Discharge current</strong>: the current I used to charge or discharge the battery, I = C-rate × Q.</li>
          <li><strong>Runtime to full capacity</strong>: the time t to fully charge or discharge the battery at that current, t = 1/C hours.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, a 5 Ah battery at 5C draws 5 × 5 = 25 A and is fully discharged in 1/5 hour, or 12 minutes. More tools are in the{" "}
          {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
