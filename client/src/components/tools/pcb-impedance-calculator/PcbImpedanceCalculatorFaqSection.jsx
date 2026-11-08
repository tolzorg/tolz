import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the difference between a microstrip and a stripline?",
    a: "A microstrip is a trace on the outer surface of the board, with a ground plane below it and air above it. A stripline is buried inside the board between two ground planes. Striplines are better shielded; microstrips are easier to route and their effective dielectric constant is lower, because part of the field runs through air.",
  },
  {
    q: "What are odd, even, differential and common-mode impedance?",
    a: "For a coupled pair of traces, the odd-mode impedance is seen when the two carry opposite signals and the even-mode impedance when they carry the same signal. The differential impedance is twice the odd-mode impedance, and the common-mode impedance is half the even-mode impedance.",
  },
  {
    q: "What is the effective dielectric constant?",
    a: "For a microstrip, the electric field runs partly through the board and partly through the air above it, so the signal sees a dielectric constant between 1 and the board's relative permittivity. That effective value, ε_eff, sets the signal speed and is used to calculate the impedance.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const TYPES = [
  "Microstrip", "Edge-coupled microstrip", "Wire microstrip", "Embedded microstrip", "Wire stripline", "Edge-coupled stripline",
  "Broadside-coupled stripline", "Symmetric stripline", "Asymmetric stripline",
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

export default function PcbImpedanceCalculatorFaqSection() {
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
        <h2 style={h2Style}>PCB Impedance Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Working out the impedance of a PCB conductor by hand is complicated. With the {link("/", "Tolz")} PCB impedance calculator you get the
          answer in seconds, without needing to know the equations behind it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the PCB Impedance Calculator</h2>
        <p style={pStyle}>
          Choose the type of conductor, fill in its dimensions and the substrate&apos;s dielectric constant, and click Calculate to get its
          impedance (or impedances, for coupled pairs). You can choose from:
        </p>
        <ul style={listStyle}>{TYPES.map((t) => <li key={t}>{t}</li>)}</ul>
        <p style={pStyle}>
          Not sure which one you have? The calculator shows a diagram of the selected conductor with every dimension it needs. Tick <em>Show
          effective signal width</em> to see w′, the width of the trace corrected for its thickness.
        </p>
        <p style={pStyle}>For a single microstrip, the impedance comes from the effective signal width w′ and the board&apos;s height H and permittivity εr:</p>
        <p style={{ ...formula, marginBottom: 0 }}>Z₀ = 60 / √((εr + 1) / 2) × ln(1 + 4H/w′ × (4H/w′ × (14εr + 8)/(11εr) + √(…)))</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>PCB Design in Your Project</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Designing a PCB involves more than impedance. Find the trace width for your current with the
          {" "}{link("/calculators/tech-electronics/pcb-trace-width-calculator", "PCB trace width calculator")}, check how much current a trace can
          carry with the {link("/calculators/tech-electronics/pcb-trace-current-calculator", "PCB trace current calculator")}, and work out its
          resistance with the {link("/calculators/tech-electronics/pcb-trace-resistance-calculator", "PCB trace resistance calculator")}. The
          formulas follow the widely used eeweb.com PCB impedance equations.
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
