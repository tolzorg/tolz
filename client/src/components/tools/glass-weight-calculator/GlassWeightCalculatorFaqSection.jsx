import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { GLASS_TYPES } from "../../../utils/glassWeightCalc";

const FAQ_ITEMS = [
  {
    q: "How do I calculate glass weight in kilograms?",
    a: "Measure the glass pane's height, width, and thickness (converting everything to the same unit, e.g. centimeters), multiply height × width to get the area, then multiply the area by the thickness to get the volume in cm³. Multiply that volume by the glass density (around 2.5 g/cm³ for most annealed, tempered, or laminated glass) and divide by 1,000 to convert grams to kilograms. The calculator above does all of this automatically as soon as you enter your dimensions.",
  },
  {
    q: "How much does glass weigh per cubic foot?",
    a: "It depends on the glass type. Common window glass weighs roughly 157 lb/ft³ (about 2.51 g/cm³), lead crystal is heavier at around 185 lb/ft³ (about 2.96 g/cm³), and flint glass is one of the densest common types at roughly 231 lb/ft³ (about 3.7 g/cm³).",
  },
  {
    q: "How much does a window glass pane weigh?",
    a: "Window glass has a density of about 2.51 g/cm³. A single pane's weight is its volume (height × width × thickness) multiplied by that density — for example, a 100 cm × 60 cm pane, 4 mm thick, has a volume of 2,400 cm³ and weighs about 6.02 kg.",
  },
  {
    q: "What is the density of glass in kg/m³?",
    a: "Most common glass types fall between roughly 2,200 kg/m³ (fused silica/quartz) and 3,700 kg/m³ (flint glass), with everyday annealed, tempered, and laminated glass sitting around 2,480–2,520 kg/m³. Select a glass type in the calculator above to see its exact reference density.",
  },
  {
    q: "How heavy is a 1/2-inch tempered glass panel?",
    a: "A ½-inch (12.7 mm) tempered glass panel weighs approximately 6.5 lb per square foot. For an exact figure based on your panel's actual dimensions, enter the height, width, and thickness into the calculator above and it will compute the precise weight for you.",
  },
];

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
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
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

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

export default function GlassWeightCalculatorFaqSection() {
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

  const referenceTypes = GLASS_TYPES.filter((g) => g.id !== "custom");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Working out how much a piece of glass weighs used to mean digging up a material density chart,
          converting units by hand, and hoping the arithmetic held up once the glass reached the shop floor
          or a delivery truck. The glass weight calculator on <Link to="/" className="inline-home-link">Tolz</Link> removes
          that guesswork entirely: pick a glass type and shape, enter the dimensions, and get an instant,
          accurate weight, no spreadsheets or manual formulas required.
        </p>
      </div>

      {/* What is glass */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Glass?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Glass is an amorphous, non-crystalline material typically made by rapidly cooling molten silica so it
          solidifies without forming a regular crystal lattice. Everyday glass products are often treated to
          change their strength or behavior: <strong>tempered (toughened) glass</strong> is heat-treated so it
          shatters into small, blunt pieces instead of sharp shards; <strong>laminated glass</strong> sandwiches
          a plastic interlayer between glass sheets so it stays intact when cracked; and specialty types like
          borosilicate, lead crystal, or fused silica/quartz are formulated for heat resistance, optical clarity,
          or decorative brilliance. Each of these treatments and formulations slightly changes the glass's
          density, and therefore how much a given sheet or piece weighs, which is why this calculator lets you
          choose the specific glass type rather than assuming one fixed density.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Glass Weight Calculator</h2>
        <p style={pStyle}>Using the tool only takes a few steps, and no technical background is required:</p>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose a glass type</strong> — Select from Annealed, Tempered, Laminated, or one of 16
            other glass types (or pick Custom to enter your own density). The density field auto-fills based
            on your selection.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose a shape</strong> — Rectangular, square, triangular, circular, semi-circular,
            elliptical, round rod, or Other shapes (for anything not listed, where you can type the area
            directly).
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter the dimensions</strong> — Depending on the shape, you'll fill in values like height,
            width, base, or diameter, plus the glass thickness. All common units are supported (mm, cm, m, in,
            ft), so you can enter measurements exactly as they appear on your cut sheet or supplier quote.
          </li>
          <li>
            <strong>Set the quantity and read the result</strong> — Enter how many identical panes or pieces
            you need, and the calculator instantly shows the area, volume, and total weight in your preferred
            unit (kg, g, mg, t, lb, or oz).
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because every value updates instantly as you type, you can quickly compare how weight changes across
          different thicknesses, glass types, or quantities before placing an order.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Glass Weight Is Calculated</h2>
        <p style={pStyle}>
          The underlying formula is simple once you break it down, and knowing it lets you sanity-check the
          calculator's output or do a quick estimate by hand:
        </p>
        <div style={formulaStyle}>Area = shape-specific formula (e.g. Height × Width for a rectangle)</div>
        <div style={formulaStyle}>Volume = Area × Thickness</div>
        <div style={formulaStyle}>Total weight = Volume × Glass density × Quantity</div>
        <p style={pStyle}>
          The thicker a piece of glass is, the greater its volume, and so the heavier it gets — that's why
          thickness matters just as much as the pane's height and width. As a worked example: a rectangular
          annealed glass sheet 40 cm high, 40 cm wide, and 1.2 cm thick has an area of 1,600 cm² and a volume of
          1,920 cm³. Multiplying that volume by annealed glass's density of 2.5 g/cm³ gives a weight of
          4,800 g, or 4.8 kg, per sheet.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Density varies by glass type: soda-lime glass (used in most windows, bottles, and annealed/tempered
          panes) sits around 2.5 g/cm³, while denser types like flint glass or lead crystal run noticeably
          higher, and lighter types like fused silica or borosilicate run lower. The calculator applies the
          correct density automatically once you select a glass type, so you don't need to look up a separate
          chart.
        </p>
      </div>

      {/* Density reference table */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Glass Type Density Reference</h2>
        <p style={pStyle}>
          Reference densities used by the calculator for each supported glass type (grams per cubic centimeter):
        </p>
        <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
          {referenceTypes.map((g, i) => (
            <div
              key={g.id}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 14px",
                borderBottom: i === referenceTypes.length - 1 ? "none" : "1px solid var(--border)",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                {g.label}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)" }}>
                {g.densityGCm3.toLocaleString()} g/cm³
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Glass Weight Calculator</h2>
        <p style={pStyle}>This tool is useful in a wide range of real-world situations, including:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Ordering and shipping</strong> — Confirming how much a window, mirror, tabletop, or shower
            panel will weigh before ordering, since weight affects both packaging requirements and freight
            cost.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Installation planning</strong> — Checking that a wall, frame, hinge, or mounting hardware
            is rated to support the finished glass panel's weight.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fabrication and glazing quotes</strong> — Estimating material weight before cutting glass
            to size, useful for pricing jobs and planning safe handling.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fire pits and landscaping</strong> — Working out how much decorative or fire glass a
            project needs by volume and weight.
          </li>
          <li>
            <strong>Student and hobbyist use</strong> — Verifying manual calculations for a physics, materials
            science, or DIY glasswork project.
          </li>
        </ul>
      </div>

      {/* Accuracy/privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Free Access</h2>
        <p style={pStyle}>
          The calculator is completely free to use, with no signup or account required — open the page and get
          a result immediately. All calculations run instantly in your browser based on the values you enter;
          nothing is uploaded, stored, or transmitted.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool uses standard, widely referenced density values for each of the 19 supported glass types.
          Actual measured weight can differ slightly due to manufacturing tolerances, surface coatings, or
          rounding in the stated dimensions, so for structural, safety-rated, or large-order purposes, always
          confirm the final figure against your glass supplier's specification sheet.
        </p>
      </div>

      {/* FAQ */}
      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
