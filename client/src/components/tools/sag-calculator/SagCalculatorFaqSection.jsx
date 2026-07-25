import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is sagitta in construction?",
    a: "Sagitta is the height measured from the midpoint of a straight chord line to the highest point of a curved arc above it. In construction, it's commonly used to describe the rise of an arch, curved roof, or cable sag relative to the span it covers.",
  },
  {
    q: "How do I calculate sagitta without a calculator?",
    a: "You can calculate sagitta manually using the formula s = r − √(r² − (c/2)²), where r is the radius and c is the chord length. This requires squaring, subtracting, and taking a square root, which is where manual calculations are most prone to error.",
  },
  {
    q: "What's the difference between sagitta and radius of curvature?",
    a: "Sagitta is the height of the arc measured from the chord to the arc's peak, while radius of curvature describes the size of the full circle the arc belongs to. They are related mathematically but represent different physical measurements.",
  },
  {
    q: "Can this SAG calculator find the diameter of a curve?",
    a: "Yes. Since diameter is simply twice the radius, once the calculator solves for radius using your sagitta and chord values, the diameter is calculated directly from that result.",
  },
  {
    q: "Is the SAG calculator free to use?",
    a: "Yes, the calculator is completely free with no signup, subscription, or usage limit. You can run unlimited calculations for as many projects as needed.",
  },
  {
    q: "What units does the SAG calculator support?",
    a: "The calculator works with any unit of length — millimeters, centimeters, inches, feet, or meters — as long as all values entered use the same unit consistently.",
  },
  {
    q: "Why is sagitta important for cable sag calculations?",
    a: "Excessive cable sag between support points can create clearance issues, added mechanical stress, or code violations, particularly for overhead electrical lines. Calculating sagitta accurately helps confirm the cable's droop stays within acceptable limits.",
  },
  {
    q: "Does this tool store the values I enter?",
    a: "No. Values entered into the calculator are used only to perform the calculation and are not stored, logged, or shared.",
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

export default function SagCalculatorFaqSection() {
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SAG Calculator",
    url: "https://www.tolz.org/calculators/construction/sag",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online SAG calculator that solves for sagitta, radius of curvature, or diameter of a circular arc. Enter any two known values and the third is calculated instantly.",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareAppSchema} />

      {/* What is sagitta */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Sagitta (SAG) and Why It Matters</h2>
        <p style={pStyle}>
          Sagitta, often shortened to "sag" or "SAG," is the distance measured from the midpoint of a chord to
          the highest point of the arc it subtends. In plain terms, if you draw a straight line (the chord)
          across the base of a curve and measure straight up to the curve's peak, that vertical distance is the
          sagitta. The term comes from the Latin word for "arrow," a nod to how the measurement resembles an
          arrow resting on a drawn bow.
        </p>
        <p style={pStyle}>
          Sagitta is a foundational measurement in circular geometry because it links three values that are
          otherwise awkward to calculate by hand: the radius of curvature, the chord length, and the height of
          the arc itself. Anyone working with curved forms — a mason setting out an arch, an electrician
          calculating cable droop between poles, a fabricator bending sheet metal to a specific curvature —
          eventually needs to convert between these three figures. Knowing any two lets you solve for the
          third, which is exactly what this calculator automates.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The radius of curvature describes how "tight" or "gentle" an arc is. A small radius produces a
          sharply curved arc, while a large radius produces a nearly flat one. Diameter is simply twice the
          radius and is often the more practical figure when specifying pipe, formwork, or curved stock that's
          sold or manufactured by diameter rather than radius.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the SAG Calculator</h2>
        <p style={pStyle}>
          The calculator is built around a simple principle: enter any two of the three values (sagitta,
          radius, or diameter, along with chord length where required), and the tool solves for the missing one
          automatically. There's no need to memorize which formula applies to which combination of known
          values, the calculator handles the math internally and returns a precise result in seconds.
        </p>
        <p style={pStyle}>
          To use it, identify which two measurements you already have. If you know the chord length and the
          sagitta, the tool calculates the radius of curvature. If you know the radius and the chord, it
          returns the sagitta. If you have the sagitta and the radius, it works out the chord length. Enter
          your known figures into the corresponding fields, and the result populates instantly without needing
          to press through multiple screens or wait for a page reload.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the tool works with any consistent unit of measurement, millimeters, inches, feet, or meters,
          you can use it for anything from small-scale fabrication work to large architectural spans, as long
          as your inputs use the same unit throughout. Double-checking that your chord and sagitta measurements
          are in matching units is the most common source of error when calculating sag manually, and it's
          worth confirming before you enter your figures.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Sagitta Formula Explained</h2>
        <p style={pStyle}>
          For readers who want to understand the math behind the result, the relationship between sagitta,
          radius, and chord length is derived from the geometry of a circle. Given a chord of length c and a
          radius r, the sagitta s can be found using:
        </p>
        <div style={formulaStyle}>s = r − √(r² − (c/2)²)</div>
        <p style={pStyle}>
          This formula comes directly from the Pythagorean relationship between the radius, half the chord
          length, and the distance from the circle's center to the chord. Rearranged, the same relationship
          lets you solve for radius when sagitta and chord are known:
        </p>
        <div style={formulaStyle}>r = (s/2) + (c²/8s)</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This second form is particularly useful in construction and fabrication, where the sagitta and chord
          are usually the two measurements taken directly on site, while the radius is the value being solved
          for, often to specify the correct curvature for a jig, form, or cutting template. The SAG calculator
          performs this algebra instantly, removing the risk of a transposition error or an incorrectly squared
          term, which is easy to introduce when working the formula by hand under time pressure.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You'd Need a SAG Calculator</h2>
        <ul style={{ ...ulStyle, marginBottom: 10 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Curved and arched roofing.</strong> Roofers and framers building barrel-vault or arched
            roof sections need to know the rise (sagitta) of the curve relative to the span (chord) in order to
            cut rafters or ribs to the correct radius. Getting this wrong by even a small margin compounds
            across the width of the structure.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Masonry and stone arches.</strong> Bricklayers and stonemasons setting out arches, whether
            structural lintels or decorative features, use sagitta and chord measurements to determine the
            correct radius for the arch centering (the temporary support form the arch is built over).
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Cable and wire sag.</strong> Electricians and riggers calculating the droop of a cable,
            wire, or rope between two support points use sagitta calculations to confirm the sag falls within
            safe or code-specified limits, particularly for overhead lines and suspended cabling where
            excessive sag creates clearance or tension problems.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Curved formwork and fabrication.</strong> Fabricators bending metal, plastic, or composite
            panels to a specified curve need an accurate radius to set up rollers, brakes, or molds correctly.
            A sagitta measurement taken from a physical template or drawing is often the fastest way to
            reverse-engineer the required radius.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bridge and civil engineering layouts.</strong> Engineers checking the curvature of arch
            bridges, culverts, or curved retaining structures use the same sagitta-radius-chord relationship at
            a larger scale, where precision in the initial layout affects the accuracy of everything built on
            top of it.
          </li>
          <li>
            <strong>Optics and lens work.</strong> Sagitta calculations also appear in optics, where the
            curvature of a lens surface is described using the same geometric relationship between chord
            (aperture diameter) and sagitta (surface depth).
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In each of these scenarios, the practical need is the same: two measurements are known or measurable,
          and a third is required to move forward with cutting, ordering material, or verifying a design meets
          specification. Manually working through the algebra each time is slow and introduces room for error,
          especially when measurements involve decimals or non-round numbers. Entering the same values into a
          calculator built specifically for this relationship removes that risk entirely.
        </p>
      </div>

      {/* Accuracy / privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Why You Can Trust This Tool</h2>
        <p style={pStyle}>
          The SAG calculator uses the standard geometric formulas for sagitta, radius, and diameter, so results
          are mathematically exact for the values you enter, there's no rounding shortcut or approximation
          built into the calculation. Because the tool is free to use with no signup required, you can run as
          many calculations as a project needs without creating an account, entering payment details, or
          hitting a usage limit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          No data you enter into the calculator is stored or transmitted anywhere, your input values are used
          only to perform the calculation in your browser session and are not saved, logged, or shared. This
          makes the tool suitable for repeated use across multiple projects without any privacy concerns, and
          there are no hidden charges or premium tiers gating the core functionality.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting Accurate Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Measure chord length as a straight line, not along the curve itself, this is the most common mistake
          when taking field measurements for arch or roof layouts. Keep all inputs in the same unit of
          measurement, since mixing millimeters and inches will produce a result that looks plausible but is
          incorrect. Where possible, take chord and sagitta measurements from the same reference points used in
          your drawings or specifications, rather than estimating from a physical template, to avoid
          compounding small measurement errors into the final radius or diameter figure.
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
