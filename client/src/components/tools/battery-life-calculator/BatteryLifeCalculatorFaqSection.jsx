import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does battery life mean?",
    a: "Battery life is how long a device can run before it needs recharging. Battery lifespan is something else: how many times the battery can be recharged before it wears out and must be replaced. How you use the device largely decides both.",
  },
  {
    q: "How do I calculate the life of a battery?",
    a: "Find the battery capacity (usually printed on the battery), decide on a discharge safety (assume 20% if unsure), and find the device's average current draw. Then battery life = battery capacity / device consumption × (1 − discharge safety).",
  },
  {
    q: "How do I find the average amp draw of a device?",
    a: "Look for the wattage rating on the device (or search for a typical value for that type of device), find the voltage of the power source (an outlet or a battery), and divide: average current draw = wattage rating / power source voltage.",
  },
  {
    q: "How long does a 4500 mAh battery last?",
    a: "With a 20% discharge safety and an average draw of 1 A (1,000 mA), a 4500 mAh battery lasts 4500 × 0.8 / 1000 = 3.6 hours. A smartphone's real draw varies a lot with what you do (music, downloads, calls, screen time), so enter your own device's consumption for a better estimate.",
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

export default function BatteryLifeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Battery Life Calculator</h2>
        <p style={pStyle}>
          Want to know how long the battery in your new laptop will last, or the runtime of your DIY electronics project? The{" "}
          {link("/", "Tolz")} battery life calculator gives a realistic approximation of a battery&apos;s runtime from its capacity and your
          device&apos;s energy consumption.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It works in two ways. By default it assumes the device runs continuously until the battery is discharged. Choose{" "}
          <em>with awake/sleep modes</em> to see what happens when the device spends part of its time in sleep mode.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Battery Runtime</h2>
        <p style={pStyle}>No battery lasts forever. The calculator estimates its runtime with this formula:</p>
        <p style={{ ...pStyle, ...mono }}>Battery life = Capacity / Consumption × (1 − Discharge safety)</p>
        <ul style={listStyle}>
          <li><strong>Capacity</strong>: the battery&apos;s capacity in ampere-hours (or mAh), usually printed on the battery;</li>
          <li><strong>Consumption</strong>: the average current draw of your device, in amperes; and</li>
          <li>
            <strong>Discharge safety</strong>: the share of the capacity that is never used. A LiPo battery in a drone, for example, should never
            be discharged below 20% or it can be damaged. The calculator starts at 20%, but you can change it.
          </li>
        </ul>
        <p style={pStyle}>
          For example, a 333 mAh battery powering a device that draws 24 mA, with a 20% discharge safety, lasts 333 × 0.8 / 24 = 11.1 hours.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Only know the device&apos;s wattage? Choose <em>wattage rating</em> and enter the battery voltage: the current draw is the wattage
          divided by the voltage (8.28 W at 345 V is 24 mA).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Long Will a Battery Last: Sleep Mode</h2>
        <p style={pStyle}>
          Say you are building an IoT device that spends most of its time asleep. Choose <em>with awake/sleep modes</em> and set:
        </p>
        <ul style={listStyle}>
          <li><strong>Awake mode</strong>: the current the device draws while in use;</li>
          <li><strong>Awake time</strong>: how long the device is awake during one operational cycle, for example 2 seconds;</li>
          <li><strong>Sleep mode</strong>: the current it draws while sleeping, usually much lower than when awake; and</li>
          <li><strong>Sleep time</strong>: how long it sleeps during one cycle.</li>
        </ul>
        <p style={pStyle}>
          If the device sleeps 80% of the time, for instance, set the sleep time to 8 seconds and the awake time to 2 seconds. The calculator then
          finds the average consumption:
        </p>
        <p style={{ ...pStyle, ...mono }}>Average consumption = (Consumption₁ × Time₁ + Consumption₂ × Time₂) / (Time₁ + Time₂)</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          where 1 is the awake mode and 2 the sleep mode, and puts it into the battery life formula above. Drawing 32 mA for 1 hour and 0.5 mA
          for 23 hours averages 1.8125 mA, so a 333 mAh battery lasts about 147 hours. More tools are in the{" "}
          {link("/calculators/tech-electronics", "tech and electronics calculators")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Working Backwards</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every box can be left blank and calculated from the others. Type the battery life you need, for example, and the calculator finds the
          battery capacity (or the current draw) that gives it. When more values are typed than needed, the ones typed most recently are kept
          and the rest recalculated; values the calculator fills in are shown in blue.
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
