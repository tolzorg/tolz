import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I read a resistor color code?",
    a: "Read the bands from left to right, starting at the end opposite the gap. On a 4-band resistor the first two bands are significant figures, the third is the multiplier and the fourth the tolerance. Green (5), red (2), blue (×1M) and gold (±5%) make 52 × 1,000,000 = 52 MΩ ±5%.",
  },
  {
    q: "What does a 3-band resistor's tolerance mean?",
    a: "A 3-band resistor has no tolerance band, which means a tolerance of ±20% (letter M).",
  },
  {
    q: "How do I calculate resistors in parallel?",
    a: "The total is the reciprocal of the sum of the reciprocals: R = 1 / (1/R1 + 1/R2 + … + 1/Rn). It is always smaller than the smallest resistor; two equal resistors in parallel give half of one.",
  },
  {
    q: "How do I calculate resistors in series?",
    a: "Add them up: R = R1 + R2 + … + Rn. 10, 2, 38, 23, 38, 23 and 21 Ω in series make 155 Ω.",
  },
  {
    q: "How do I calculate the resistance of a wire?",
    a: "R = L / (A × σ), where L is the length, A the cross-sectional area (π × (d/2)² for a round wire) and σ the conductivity. 100 m of copper (σ = 59,600,000 S/m) 0.05 cm thick has about 8.545 Ω.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const CHART = [
  ["Black", "#000000", "0", "×1", "", "250 ppm/K (U)"], ["Brown", "#8b4513", "1", "×10", "±1% (F)", "100 ppm/K (S)"],
  ["Red", "#e60000", "2", "×100", "±2% (G)", "50 ppm/K (R)"], ["Orange", "#ff8c00", "3", "×1K", "±0.05% (W)", "15 ppm/K (P)"],
  ["Yellow", "#ffe600", "4", "×10K", "±0.02% (P)", "25 ppm/K (Q)"], ["Green", "#7cbb2e", "5", "×100K", "±0.5% (D)", "20 ppm/K (Z)"],
  ["Blue", "#4a86e8", "6", "×1M", "±0.25% (C)", "10 ppm/K (Z)"], ["Violet", "#8b00c9", "7", "×10M", "±0.1% (B)", "5 ppm/K (M)"],
  ["Grey", "#9a9a9a", "8", "×100M", "±0.01% (L)", "1 ppm/K (K)"], ["White", "#ffffff", "9", "×1G", "", ""],
  ["Gold", "#d4af37", "", "×0.1", "±5% (J)", ""], ["Silver", "#c0c0c0", "", "×0.01", "±10% (K)", ""], ["None", null, "", "", "±20% (M)", ""],
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

export default function ResistorCalculatorFaqSection() {
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
        <h2 style={h2Style}>Resistor Color Code</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} resistor calculator decodes resistor color bands and adds up resistors in parallel and in series. An
          electronic color code specifies the ratings of components such as the resistance of a resistor in ohms. Color codes also rate
          capacitors, inductors and diodes, but they are most often used on resistors, and only resistors are covered here.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The resistor color code is an international standard defined in IEC 60062. Its colors stand for significant figures, a multiplier,
          tolerance, reliability and temperature coefficient, depending on the band&apos;s position. A four-band resistor has a gap between
          the third and the fourth band, showing which way to read it: from left to right, with the lone band after the gap on the right.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Color Coding Works</h2>
        <ul style={listStyle}>
          <li>
            <strong>Significant figures.</strong> On a typical four-band resistor, the first and second bands are significant figures. In the
            example green, red, blue, gold, green is 5 and red is 2.
          </li>
          <li>
            <strong>Multiplier.</strong> The third band, blue, is the multiplier: 1,000,000. Multiplied by the significant figures, 52, it gives
            52,000,000 Ω, or 52 MΩ.
          </li>
          <li>
            <strong>Tolerance.</strong> The fourth band, when present, is the tolerance: how far the value may vary. Gold means ±5% (letter J),
            so the 52 MΩ resistor is somewhere between 49.4 MΩ and 54.6 MΩ.
          </li>
        </ul>
        <p style={pStyle}>
          Coded components have at least three bands: two significant figures and a multiplier. Military-specification resistors often have a
          fifth band for reliability (the failure rate per 1,000 hours of service), and a fifth band can also be the temperature coefficient,
          the change of resistance with ambient temperature in ppm/K.
        </p>
        <p style={pStyle}>
          More common are five-band resistors, which are more precise thanks to a third significant figure; the multiplier and tolerance move to
          the fourth and fifth positions. The most precise resistors may have a sixth band: three significant figures, the multiplier, the
          tolerance, and a sixth band for reliability or temperature coefficient.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Color</th><th>1st, 2nd, 3rd band significant figures</th><th>Multiplier</th><th>Tolerance</th><th>Temperature coefficient</th></tr></thead>
            <tbody>
              {CHART.map(([name, hex, digit, mult, tol, tc]) => (
                <tr key={name}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {hex && <span aria-hidden="true" style={{ display: "inline-block", width: 12, height: 12, marginRight: 6, verticalAlign: "-1px", background: hex, border: "1px solid rgba(0,0,0,0.25)" }} />}
                    {name}
                  </td>
                  <td style={center}>{digit}</td><td style={center}>{mult}</td><td style={center}>{tol}</td><td style={center}>{tc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Resistors in Parallel and in Series</h2>
        <p style={pStyle}>
          Resistors impart electrical resistance to a circuit. However complicated a circuit is, its resistors can usually be broken down into
          groups connected in series or in parallel.
        </p>
        <p style={pStyle}>
          <strong>Resistors in parallel:</strong> the total resistance is the reciprocal of the sum of the reciprocals of each resistor:
        </p>
        <p style={{ ...pStyle, ...mono }}>R<sub>total</sub> = 1 / (1/R<sub>1</sub> + 1/R<sub>2</sub> + 1/R<sub>3</sub> + … + 1/R<sub>n</sub>)</p>
        <p style={pStyle}><strong>Resistors in series:</strong> the total resistance is simply the sum of the resistances:</p>
        <p style={{ ...pStyle, ...mono, marginBottom: 0 }}>R<sub>total</sub> = R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub> + … + R<sub>n</sub></p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Resistance of a Conductor</h2>
        <p style={{ ...pStyle, ...mono }}>R = L / (A × C)</p>
        <ul style={listStyle}>
          <li><strong>L</strong>: the length of the conductor;</li>
          <li><strong>A</strong>: its cross-sectional area (π × (d/2)² for a round conductor of diameter d); and</li>
          <li><strong>C</strong>: the conductivity of the material, in siemens per meter (copper 59,600,000 S/m, aluminium 37,800,000 S/m).</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More tools are in the {link("/calculators/tech-electronics", "tech and electronics calculators")}, including the{" "}
          {link("/calculators/tech-electronics/voltage-drop-calculator", "voltage drop calculator")}.
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
