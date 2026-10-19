import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the Army body composition standard?",
    a: "Since July 7, 2026 the Army uses the waist-to-height ratio: waist circumference at the navel divided by height. A ratio below 0.55 meets the standard; 0.55 or higher is flagged, and the soldier is enrolled in the Army Body Composition Program until the standard is met.",
  },
  {
    q: "How do I calculate my waist-to-height ratio?",
    a: "Measure your waist at the belly button and your height in the same unit, then divide waist by height. For example, a 34-inch waist at 5 ft 10 in (70 inches) gives 34 ÷ 70 = 0.486, which meets the standard. The calculator also accepts centimeters, meters or feet and inches.",
  },
  {
    q: "What waist size do I need to pass?",
    a: "Multiply your height by 0.55: your waist must be below that. At 70 inches tall the limit is 38.5 inches; at 175 cm it is 96.25 cm. The calculator shows the waist you need and, if you are over, how much you need to reduce it.",
  },
  {
    q: "Does the Army still use the tape test or body fat percentage?",
    a: "No. The July 2026 change replaced the height and weight tables, the circumference-based tape test and the supplemental body fat assessments (such as DXA) with the waist-to-height ratio. Weight, age and gender are no longer part of the assessment.",
  },
  {
    q: "Why does the Army use the waist-to-height ratio?",
    a: "Waist size relative to height is a simple, widely used measure of abdominal fat, which is closely linked to health risks. A single tape measurement and a height measurement are quick to take and easy to repeat.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don’t need to sign up.",
  },
];

// Heights from 5 ft to 6 ft 4 in, every 2 inches.
const WAIST_TABLE = Array.from({ length: 9 }, (_, i) => {
  const inches = 60 + i * 2;
  return [`${Math.floor(inches / 12)} ft ${inches % 12} in`, inches];
});

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
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

export default function ArmyBodyFatCalculatorFaqSection() {
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
        <h2 style={h2Style}>The Army Waist-to-Height Ratio Standard</h2>
        <p style={pStyle}>
          On July 7, 2026 the Army replaced its long-standing height and weight tables, the circumference-based tape test and supplemental
          body fat assessments with a single health assessment: the waist-to-height ratio (WHtR). The ratio is your waist circumference at
          the navel divided by your height. A ratio <strong>below 0.55</strong> meets the standard; soldiers at 0.55 or higher are flagged and
          enrolled in the Army Body Composition Program until they meet it.
        </p>
        <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
          <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
            <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 700, fontSize: 13, padding: "0 0 6px" }}>
              Largest waist that meets the standard (below 0.55 × height)
            </caption>
            <thead><tr><th style={{ textAlign: "left" }}>Height</th><th style={{ textAlign: "left" }}>Waist must be under</th></tr></thead>
            <tbody>
              {WAIST_TABLE.map(([label, inches]) => (
                <tr key={label}><td>{label}</td><td>{(inches * 0.55).toFixed(1)} in ({(inches * 0.55 * 2.54).toFixed(1)} cm)</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Measure</h2>
        <p style={pStyle}>
          Stand upright with your arms relaxed at your sides. Wrap a non-stretch tape measure around your waist at the level of your belly
          button, keeping it parallel to the floor and snug without compressing the skin, and read it at the end of a normal, relaxed breath.
          Take the measurement three times and use the average. Measure your height standing straight, without shoes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a body fat percentage estimate, try the {link("/calculators/health/body-fat-calculator", "Body Fat Calculator")}; related: the{" "}
          {link("/calculators/health/bmi-calculator", "BMI Calculator")} and the{" "}
          {link("/calculators/health/ideal-weight-calculator", "Ideal Weight Calculator")}.
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
