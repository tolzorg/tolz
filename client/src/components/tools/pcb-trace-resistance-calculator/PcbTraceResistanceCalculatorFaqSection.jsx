import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate the resistance of a PCB trace?",
    a: "Use R = ρ × L / (T × W) × (1 + α × (ambient temperature − 25 °C)), where L, T and W are the trace's length, thickness and width, ρ is the resistivity (1.7 × 10⁻⁶ Ω·cm for copper) and α its temperature coefficient (0.0039 per °C for copper). A 2 mm × 6 mm × 5 cm copper trace at 25 °C has about 0.0000708 Ω.",
  },
  {
    q: "How do I find the voltage drop along a PCB trace?",
    a: "Multiply the trace resistance by the current flowing through it (Ohm's law): V = I × R. In the calculator, open Voltage drop calculation and enter the current (or the voltage drop) to get the other.",
  },
  {
    q: "Can I use it for metals other than copper?",
    a: "Yes. Open Resistivity properties and change the resistivity and its temperature coefficient to those of your material; the defaults are for copper.",
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

export default function PcbTraceResistanceCalculatorFaqSection() {
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
        <h2 style={h2Style}>PCB Trace Resistance Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The {link("/", "Tolz")} PCB trace resistance calculator works out the resistance of the traces on a PCB, and doubles as a PCB trace
          voltage drop calculator thanks to Ohm&apos;s law. Enter the trace&apos;s dimensions to get the result. By default it calculates copper
          traces, but you can adapt it to any material.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PCB Trace Resistance Equation: Ohm&apos;s Law Made Practical</h2>
        <p style={pStyle}>
          Ohm&apos;s law in its basic form, R = V / I, isn&apos;t always practical: while designing a PCB, you usually can&apos;t measure the voltage
          drop along a trace or the current through it. Instead, the calculator uses the resistance equation for a trace on a PCB:
        </p>
        <p style={formula}>R = ρ × L / (T × W) × (1 + α × (T<sub>amb</sub> − 25 °C))</p>
        <ul style={listStyle}>
          <li>R is the resistance;</li>
          <li>L is the length of the trace;</li>
          <li>T is the thickness of the trace;</li>
          <li>W is the width of the trace; and</li>
          <li>T<sub>amb</sub> is the ambient temperature.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The two constants, ρ and α, are the resistivity and its temperature coefficient. By default they are set for copper (1.7 × 10⁻⁶ Ω·cm
          and 0.0039 per °C).
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the PCB Trace Resistance Calculator</h2>
        <p style={pStyle}>Fill in the inputs and you get the output. The main fields are:</p>
        <ul style={listStyle}>
          <li><strong>Trace width</strong>, which you can get from the {link("/calculators/tech-electronics/pcb-trace-width-calculator", "PCB trace width calculator")};</li>
          <li><strong>Length</strong>: the distance from the beginning to the end of the trace;</li>
          <li><strong>Trace thickness</strong>: the &quot;height&quot; of the trace; and</li>
          <li><strong>Ambient temperature</strong>: the temperature of the environment the PCB works in.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In <em>Resistivity properties</em> you can change the resistivity and its temperature coefficient for metals other than copper. The
          calculator also works in reverse: enter the resistance and leave another value blank (such as the length or ambient temperature) to
          calculate it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PCB Trace Voltage Drop Calculator: The Hidden Feature</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once you know the resistance, Ohm&apos;s law gives the voltage drop for a current, or the current for a voltage drop. Open <em>Voltage
          drop calculation</em> and fill in one of the two to get the other. Check that the current is within the trace&apos;s limits with the
          {" "}{link("/calculators/tech-electronics/pcb-trace-current-calculator", "PCB trace current calculator")}.
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
