import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate PCB trace width?",
    a: "First find the cross section A = (I / (k × ΔT^0.44))^(1/0.725) in mil², where I is the maximum current in amperes, ΔT the allowed temperature rise in °C, and k = 0.024 for internal or 0.048 for external traces. Then divide by the copper thickness: W = A / (1.378 × t), with t in oz/ft² and W in mils.",
  },
  {
    q: "Why do external traces need less width than internal ones?",
    a: "External traces sit on the surface of the board and shed heat to the air, so they can carry about twice the current density of internal traces buried in the dielectric (k = 0.048 vs 0.024). For the same current and temperature rise, an external trace can be much narrower.",
  },
  {
    q: "What does 1 oz copper mean?",
    a: "Copper thickness on PCBs is given as the weight of copper spread over one square foot: 1 oz/ft² is about 35 µm (1.378 mils) thick. 2 oz is about 70 µm, and so on.",
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

export default function PcbTraceWidthCalculatorFaqSection() {
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
        <h2 style={h2Style}>PCB Trace Width Calculator</h2>
        <p style={pStyle}>
          When designing a PCB (printed circuit board), you need to know how wide the traces should be for your application, and that&apos;s
          what the {link("/", "Tolz")} PCB trace width calculator is for.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It calculates the trace width for both internal and external traces, and can also tell you the trace&apos;s temperature, resistance,
          voltage drop and power dissipation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PCB Traces: A Brief Overview</h2>
        <p style={pStyle}>
          Almost all electronic equipment uses PCBs. They are cheap to produce and use, and they greatly reduce the clutter and size of a
          device.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The traces of a PCB, the metal channels that act as wires, differ in location (external or internal) and properties. They are usually
          copper, which is relatively expensive, so it pays to know how wide they need to be before you design the board.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Wide Should PCB Traces Be?</h2>
        <p style={pStyle}>
          For pure performance, traces should be as wide as possible: that lowers their resistance and heat buildup. In the real world, space
          and materials cost money, so the answer is always the narrowest width that is safe for your application.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That width depends on where the trace is (inside the board or on its surface) and on the current and temperature limits of your
          design.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate the Width of a PCB Trace</h2>
        <p style={formula}>W = A / (1.378 × t)</p>
        <ul style={listStyle}>
          <li>W is the trace width in mils (thousandths of an inch);</li>
          <li>A is the cross section in mil²; and</li>
          <li>t is the trace thickness in oz/ft².</li>
        </ul>
        <p style={pStyle}>The cross section comes from the IPC-2221 formula:</p>
        <p style={formula}>A = (I / (k × T<sub>rise</sub><sup>b</sup>))<sup>1/c</sup></p>
        <ul style={listStyle}>
          <li>I is the maximum current through the trace, in amperes;</li>
          <li>T<sub>rise</sub> is the maximum temperature rise above ambient, in °C;</li>
          <li>b = 0.44 and c = 0.725 are fixed parameters; and</li>
          <li>k = 0.024 for internal traces and 0.048 for external traces.</li>
        </ul>
        <p style={pStyle}>The resistance of the trace is:</p>
        <p style={formula}>R = (ρ × L / A′) × (1 + α × (T<sub>temp</sub> − 25 °C))</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>L is the trace length in cm and A′ the cross section in cm²;</li>
          <li>ρ = 1.7 × 10⁻⁶ Ω·cm is the resistivity of copper;</li>
          <li>α = 3.9 × 10⁻³ °C⁻¹ is copper&apos;s temperature coefficient of resistivity; and</li>
          <li>T<sub>temp</sub> is the trace temperature (ambient temperature + temperature rise).</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the PCB Trace Width Calculator</h2>
        <ol style={olStyle}>
          <li>Select the location of the trace: internal or external.</li>
          <li>Enter the maximum current, the trace thickness and the maximum temperature rise.</li>
          <li>Click Calculate to get the trace width and cross section.</li>
          <li>For more, open <em>Additional inputs</em> and enter the trace length and ambient temperature.</li>
          <li>You also get the trace&apos;s temperature, resistance, voltage drop and power dissipation.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every box accepts several units (A or mA; oz/ft², μm or mils; °C, °F or K), and a temperature rise in °F is converted as a
          difference (× 5/9). For more tools, see the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
