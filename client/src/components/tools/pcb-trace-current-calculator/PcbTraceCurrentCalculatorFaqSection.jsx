import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much current can a PCB trace carry?",
    a: "It depends on the trace's cross section (width × copper thickness), the temperature rise you allow and whether the trace is on the surface or inside the board. IPC-2221 gives I = k × ΔT^0.44 × A^0.725, with A in mil², ΔT in °C and k = 0.048 for external or 0.024 for internal traces. For example, a 3 mm × 6 mm internal trace allowed to warm by 2 °C can carry about 54 A.",
  },
  {
    q: "Why can external traces carry more current?",
    a: "External traces lose heat to the surrounding air, while internal traces are surrounded by insulating board material. IPC-2221 reflects this with k = 0.048 for external and 0.024 for internal traces, so an external trace carries twice the current for the same size and temperature rise.",
  },
  {
    q: "How do I calculate the voltage drop along a PCB trace?",
    a: "Find the trace resistance, R = 1.7 × 10⁻⁶ Ω·cm × length / cross section × (1 + 0.0039 × (trace temperature − 25 °C)), then use Ohm's law: voltage drop = current × R. The power dissipated in the trace is R × I².",
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

export default function PcbTraceCurrentCalculatorFaqSection() {
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
        <h2 style={h2Style}>PCB Trace Current Calculator</h2>
        <p style={pStyle}>
          With the {link("/", "Tolz")} PCB trace current calculator you can work out the current capacity of a PCB trace in a breeze. How much
          current a trace can carry limits your design, so check it now instead of going back to the drawing board later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Need the width for a given current instead? Use the {link("/calculators/tech-electronics/pcb-trace-width-calculator", "PCB trace width calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Current Can a PCB Trace Carry, and Why Does It Matter?</h2>
        <p style={pStyle}>
          The current capacity of a trace is one of the many constraints of an electronics project. Many home projects never get near the
          limits, but better safe than sorry.
        </p>
        <p style={pStyle}>
          The maximum current of a trace depends on its width, its copper thickness and how much it may heat up. Current-vs-width charts are a
          good start, but the calculator gives the exact figure from the IPC-2221 formula:
        </p>
        <p style={formula}>I = k × ΔT<sup>0.44</sup> × A<sup>0.725</sup></p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>I is the maximum current, in amperes;</li>
          <li>ΔT is the maximum temperature rise above ambient, in °C;</li>
          <li>A is the cross section (width × thickness), in mil²; and</li>
          <li>k = 0.024 for internal traces and 0.048 for external traces.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the PCB Trace Current Calculator</h2>
        <p style={pStyle}>The inputs are:</p>
        <ul style={listStyle}>
          <li>The location of the trace on the board: internal or external;</li>
          <li><strong>Trace width</strong>: the distance across the trace;</li>
          <li><strong>Trace thickness</strong>: the copper height of the trace; and</li>
          <li><strong>Max. desired temperature rise</strong>: the largest allowed difference between the trace and the ambient temperature.</li>
        </ul>
        <p style={pStyle}>In the additional inputs and outputs you&apos;ll find:</p>
        <ul style={listStyle}>
          <li>The ambient temperature and the length of the trace;</li>
          <li>The maximum current and the cross section of the trace;</li>
          <li>The trace temperature during operation and its resistance at the maximum current;</li>
          <li>The voltage drop, from Ohm&apos;s law; and</li>
          <li>The power dissipation at the maximum current.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You don&apos;t have to follow the inputs and outputs order: enter the maximum current and leave the width, thickness or temperature rise
          blank, and the calculator finds it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>More Than a PCB Trace Current Capacity Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Besides how much current a trace can carry, the calculator gives the voltage drop at that current, the power dissipation, the
          resistance and the cross section. More tools are in the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
