import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the cost of 3D printing per foot of filament?",
    a: "About $0.019 per foot: a standard 2.2 lb (1 kg) spool of PLA costs around $20 and holds roughly 1,080 feet of filament, and $20 / 1,080 ft ≈ $0.019 per foot. It varies with the filament type (PLA, ABS, PETG) and where you buy it, and it leaves out electricity.",
  },
  {
    q: "How do I calculate the 3D print cost?",
    a: "Find your material's price per kilogram and its density, get the volume of the model (your design software gives the most precise figure), multiply the volume by the density for the mass, and multiply the mass by the price per kilogram for the material cost. Then add labor costs such as electricity and design time, and your markup.",
  },
  {
    q: "Can you make a business with a 3D printer?",
    a: "Yes. Choose materials carefully, since quality and usability matter most, include labor costs such as electricity and working time, and add a markup on top of your costs as your profit.",
  },
  {
    q: "How do I 3D print?",
    a: "Create or find a design, save it as an STL file, level the printer bed so it is parallel to and close enough to the nozzle, preheat the bed and follow any other manufacturer recommendations, then print.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const FILAMENTS = [
  ["ABS", "Acrylonitrile Butadiene Styrene", "1.05"], ["PLA", "Polylactic Acid", "1.27"], ["PETG", "Polyethylene Terephthalate", "1.25"],
  ["PETT", "T-Glase filament", "1.45"], ["HIPS", "High Impact Polystyrene", "1.04"], ["TPU", "Thermoplastic Polyurethane", "1.30"],
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

export default function PrintingCostCalculatorFaqSection() {
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
        <h2 style={h2Style}>3D Printing Cost Calculator</h2>
        <p style={pStyle}>
          Whether you&apos;re just starting out or running a professional 3D printing business, the {link("/", "Tolz")} 3D printing cost
          calculator tells you what to charge for any job from a few basic parameters.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It&apos;s just as useful if you don&apos;t own a printer and want to know what a print would cost. Read on for the formulas behind it
          and the densities of the most common filaments.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Does It Cost to 3D Print?</h2>
        <p style={pStyle}>
          The calculator splits the cost of a 3D printing job into the <strong>material cost</strong>, for the filament used, and the{" "}
          <strong>labor cost</strong>, for the printing time, then adds a <strong>markup</strong> so you make a profit on each print. The
          material cost is:
        </p>
        <p style={{ ...pStyle, ...mono }}>material cost = ρ × π × (d/2)² × L × price</p>
        <ul style={listStyle}>
          <li><strong>ρ</strong>: the density of the material;</li>
          <li><strong>d</strong>: the diameter of the filament;</li>
          <li><strong>L</strong>: the length of filament used for the print; and</li>
          <li><strong>price</strong>: the cost of the material per unit weight (per kilogram or pound).</li>
        </ul>
        <p style={pStyle}>The first part, ρ × π × (d/2)² × L, is the filament weight. The labor cost is:</p>
        <p style={{ ...pStyle, ...mono }}>labor cost = time × hourly rate</p>
        <p style={pStyle}>where time is how long the job takes and the hourly rate is the cost of one hour of printing. Finally, the markup is added:</p>
        <p style={{ ...pStyle, ...mono }}>final price = (material cost + labor cost) × (100% + markup)</p>
        <p style={pStyle}>
          For example, 34 cm of 1.75 mm ABS filament weighs about 0.86 g; at 545 per kg that is 0.47 of material. Printing for 34 hours at 5 per
          hour costs 170, and a 10% markup gives a final price of 187.51.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Experiment with the result: change your hourly rate, or add half an hour of printing time to allow for a jammed extruder you need to
          fix. You can also type a final price you want to charge and see what it allows for.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>3D Printer Filaments</h2>
        <p style={pStyle}>
          The material cost depends on the volume of material, its density and its price. The volume depends only on what you print; the
          density and price depend on the filament. The calculator lists the six most common filaments; for anything else, choose{" "}
          <em>Custom material</em> and enter its density.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Filament type</th><th>Full name</th><th>Density (g/cm³)</th></tr></thead>
            <tbody>{FILAMENTS.map(([t, n, d]) => <tr key={t}><td style={{ fontWeight: 600 }}>{t}</td><td>{n}</td><td style={center}>{d}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More tools are in the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
