import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is the difference between true offset and travel in a rolling offset?",
    a: "True offset is the actual diagonal distance between the two pipe centerlines, calculated from the roll and set using the Pythagorean theorem. Travel is the length of pipe needed to physically complete that offset, factoring in the fitting angle being used. Travel is always equal to or greater than the true offset, except at 90°, where they are equal.",
  },
  {
    q: "How do you calculate a rolling offset by hand?",
    a: "Calculate the true offset using √(Roll² + Set²), then multiply the true offset by the constant that corresponds to your fitting angle (for example, 1.414 for 45° fittings) to get the travel length. Run is found by multiplying the true offset by the cotangent of the fitting angle.",
  },
  {
    q: "What fitting angle is most common for rolling offsets?",
    a: "45° fittings are the most widely used for rolling offsets because they offer a practical balance between a compact offset footprint and manageable pipe travel length, though 22½°, 60°, and 90° fittings are also used depending on space and layout requirements.",
  },
  {
    q: "Can this calculator be used for HVAC ductwork as well as pipe?",
    a: "Yes. The same roll, set, true offset, travel, and run principles apply to sheet metal ductwork layout, so the calculator is useful for HVAC fabrication as well as plumbing and industrial piping.",
  },
  {
    q: "Do I need to create an account to use the rolling offset calculator?",
    a: "No. The tool is free to use with no signup, no login, and no usage limits.",
  },
  {
    q: "Is my project data stored when I use the calculator?",
    a: "No. Calculations are performed directly based on the values you enter and are not stored or shared, so the tool is safe to use for confidential or client project figures.",
  },
  {
    q: "What if my fitting angle isn't 22½°, 45°, 60°, or 90°?",
    a: "The calculator includes a custom angle option, allowing you to input any bend angle and receive an accurate true offset, travel, and run based on that specific angle.",
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

export default function RollingOffsetCalculatorFaqSection() {
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

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rolling Offset Calculator",
    url: "https://www.tolz.org/calculators/construction/rolling-offset",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: "Free online rolling offset calculator that computes true offset, travel, and run for pipe fitting using roll and set distances, supporting 22½°, 45°, 60°, 90°, and custom fitting angles.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rolling Offset Calculator - Find True Offset, Travel, and Run Instantly</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Laying out a rolling pipe offset by hand means juggling roll, set, and a fitting angle before you
          even get to the trigonometry, one miscalculation and the pipe won't land where it needs to. The
          rolling offset calculator on <Link to="/" className="inline-home-link">Tolz</Link> removes that
          guesswork. Enter your roll and set distances, choose your fitting angle, and the tool instantly
          returns the true offset, travel, and run you need to cut and fit pipe accurately the first time. It's
          built for pipefitters, plumbers, HVAC technicians, and estimators who need fast, dependable numbers on
          the job site or in the drafting office.
        </p>
      </div>

      {/* What is a rolling offset */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Rolling Offset in Pipe Fitting?</h2>
        <p style={pStyle}>
          A rolling offset occurs when a pipe run needs to shift in two directions at once, horizontally and
          vertically, to route around an obstruction, connect to a fitting at a different elevation, or tie
          into equipment that isn't aligned with the existing run. Unlike a simple offset, which moves a pipe
          in a single plane, a rolling offset combines a horizontal shift (called the roll) with a vertical
          shift (called the set). Because the pipe moves diagonally through three-dimensional space rather than
          staying in one flat plane, the actual distance the pipe travels, the true offset, is longer than
          either the roll or the set measured on its own.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is where many field calculations go wrong. Estimating the true offset by eye, or by adding roll
          and set together, produces an inaccurate cut length and a fitting that won't seat properly. The
          correct approach uses the roll and set as two legs of a right triangle to calculate the true offset,
          then applies a trigonometric constant based on the fitting angle to determine travel and run. Rolling
          offsets show up constantly in plumbing, industrial piping, and HVAC ductwork, which is why
          understanding the concept, not just the tool, helps you sanity-check the results.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Rolling Offset Calculator</h2>
        <p style={pStyle}>Using the calculator takes three steps:</p>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter the roll</strong> — the horizontal distance between the centerlines of the two pipe
            runs.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter the set</strong> — the vertical distance between the centerlines of the two pipe
            runs.
          </li>
          <li>
            <strong>Select the fitting angle</strong> — choose from 22½°, 45°, 60°, 90°, or input a custom bend
            angle if your fittings don't match the standard set.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 12 }}>Once you submit these values, the calculator returns:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>True Offset</strong> — the actual straight-line diagonal distance between the two
            centerlines, combining roll and set.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Travel</strong> — the length of pipe needed between the two fittings to complete the
            offset, based on the true offset and the fitting angle's constant.
          </li>
          <li>
            <strong>Run</strong> — the horizontal center-to-center distance used for layout and marking, useful
            when transferring measurements to the pipe itself.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          There's no need to memorize offset constants or work through the trigonometry manually. The
          calculator applies the correct formula for whichever fitting angle you select, so the output is
          accurate regardless of whether you're working with standard elbows or an unusual custom bend.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Rolling Offset Formula: True Offset, Travel, and Run</h2>
        <p style={pStyle}>
          Rolling offset math is grounded in basic trigonometry, and understanding the formula helps you verify
          results or explain them to a crew member or inspector.
        </p>
        <p style={pStyle}>
          <strong>Step 1 — True Offset:</strong> Because roll and set form the two legs of a right triangle, the
          true offset is calculated using the Pythagorean theorem:
        </p>
        <div style={formulaStyle}>True Offset = √(Roll² + Set²)</div>
        <p style={pStyle}>
          This gives the actual diagonal distance the pipe must travel between the two centerlines, rather than
          the horizontal or vertical distance alone.
        </p>
        <p style={pStyle}>
          <strong>Step 2 — Travel:</strong> Once the true offset is known, travel is calculated by multiplying
          the true offset by a constant that corresponds to the fitting angle being used:
        </p>
        <div style={formulaStyle}>Travel = True Offset × Constant (based on fitting angle)</div>
        <p style={pStyle}>
          The constant comes from the cosecant of the fitting angle. For example, 45° fittings use a constant
          of approximately 1.414, while 22½° fittings use approximately 2.613. Travel represents the exact
          length of pipe required between the two fittings to complete the offset cleanly.
        </p>
        <p style={pStyle}>
          <strong>Step 3 — Run:</strong> Run is the horizontal projection of the travel distance and is used
          primarily for marking and layout purposes on the shop floor:
        </p>
        <div style={formulaStyle}>Run = True Offset × Cotangent (based on fitting angle)</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Together, these three values, true offset, travel, and run, give a pipefitter everything needed to
          cut, mark, and install the offset section without trial and error.
        </p>
      </div>

      {/* Fitting angles */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fitting Angles and Rolling Offset Constants</h2>
        <p style={pStyle}>
          Different fitting angles change the geometry of the offset, and each angle has its own multiplication
          constant. The calculator supports the angles most commonly used in real installations:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>22½° fittings</strong> — used for long, gradual offsets where space allows a wider turn
            radius. Constant ≈ 2.613.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>45° fittings</strong> — the most common choice for rolling offsets, balancing a compact
            footprint with manageable travel length. Constant ≈ 1.414.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>60° fittings</strong> — used less frequently, typically when a tighter offset is needed
            than a 45° allows but a full 90° turn isn't practical. Constant ≈ 1.155.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>90° fittings</strong> — used for sharp direction changes, often in tight mechanical rooms
            or where the offset needs to happen over a very short distance. Constant ≈ 1.000 (true offset
            equals travel).
          </li>
          <li>
            <strong>Custom angles</strong> — for non-standard fittings, the calculator accepts any bend angle
            and computes the correct constant automatically, which is useful for fabricated fittings or
            unusual manufacturer specifications.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Choosing the right fitting angle depends on available space, the degree of directional change
          required, and pressure or flow considerations in the system being installed.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When Do You Need a Rolling Offset Calculator?</h2>
        <p style={pStyle}>
          Rolling offsets aren't a rare edge case, they come up in a wide range of everyday piping and ductwork
          scenarios:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Routing around structural obstacles</strong> — Beams, ductwork, or existing pipe runs often
            force a line to shift both horizontally and vertically to clear the obstruction.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Connecting to misaligned equipment</strong> — Pumps, tanks, and mechanical units are
            frequently installed at elevations or positions that don't line up with the main pipe run,
            requiring a rolling offset to make the connection.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Tying into existing risers or branch lines</strong> — When a new run needs to join an
            existing vertical or horizontal line that isn't in the same plane, a rolling offset provides the
            transition.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>HVAC ductwork layout</strong> — Sheet metal fabricators use the same roll-and-set
            principles when a duct run needs to shift around framing or other trades' work.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pre-fabrication and shop drawings</strong> — Estimators and detailers use rolling offset
            calculations before pipe ever reaches the field, ensuring prefabricated spool pieces will fit
            correctly on installation day.
          </li>
          <li>
            <strong>Field verification</strong> — Even when a drawing specifies dimensions, a quick calculation
            on-site confirms the cut length before pipe is cut, saving material and rework time.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          In each of these situations, an incorrect manual calculation can mean a wasted length of pipe, a
          misaligned fitting, or a return trip to the shop, all of which the calculator helps you avoid.
        </p>
      </div>

      {/* Why use Tolz */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use Tolz's Rolling Offset Calculator</h2>
        <p style={pStyle}>
          This tool is free to use, requires no signup or account creation, and doesn't place any limit on how
          many calculations you can run. Values you enter are processed directly in your browser to generate
          the result, nothing is stored or shared, so you can use the calculator for proprietary or
          client-specific project measurements without concern. There are no hidden charges, watermarks, or
          premium tiers; the full functionality, including support for custom fitting angles, is available
          every time you use it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because the calculator applies standard trigonometric formulas consistently, results are reliable
          across every fitting angle it supports, giving you the same accuracy as a manual calculation in a
          fraction of the time.
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
