import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate the weight of an aluminum bar?",
    a: "Multiply the cross-sectional area of the bar by its length, then multiply that volume by the density of the specific aluminum alloy (approximately 2.70 g/cm³ for most common grades). The aluminum weight calculator does this automatically once you select the shape, alloy, and dimensions.",
  },
  {
    q: "Is this aluminum weight calculator free to use?",
    a: "Yes. The tool is completely free, requires no signup, and has no hidden charges or usage limits.",
  },
  {
    q: "Does the calculator account for different aluminum alloys?",
    a: "Yes. It supports 12 aluminum alloys, each with its own density value, so the calculated weight reflects the specific grade you select rather than a single generic figure.",
  },
  {
    q: "What shapes does the aluminum weight calculator support?",
    a: "It supports 15 shapes, including round and square bars, round and rectangular tubes, pipes, sheets/plates, angles, channels, and I-beams.",
  },
  {
    q: "Can I use the calculator with both metric and imperial units?",
    a: "Yes. The tool supports all common unit systems, so you can enter dimensions in millimeters, centimeters, inches, or feet and receive results in kilograms, grams, pounds, or ounces.",
  },
  {
    q: "How accurate is the aluminum weight calculator?",
    a: "It uses standard density values for each supported alloy and applies shape-specific geometric formulas, which produces results closely aligned with actual measured weight. For critical or safety-rated applications, cross-check results against an official alloy datasheet.",
  },
  {
    q: "Can this tool estimate the cost of aluminum, not just the weight?",
    a: "Yes. Once the weight is calculated, you can enter a price per unit weight to get an instant estimated material cost, useful for comparing supplier quotes or budgeting a project.",
  },
  {
    q: "Why does aluminum alloy affect the weight calculation?",
    a: "Different alloys contain different alloying elements (such as magnesium, silicon, zinc, or copper), which slightly change the material's density. Even small density differences add up over long stock lengths or large sheet areas, so selecting the correct alloy matters for an accurate weight figure.",
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

export default function AluminumWeightCalculatorFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Calculating the exact weight of aluminum stock used to mean digging up a density chart, converting
          units by hand, and hoping the math held up once the material reached the shop floor. The aluminum
          weight calculator on Tolz removes that guesswork by handling the entire calculation for you,
          instantly, accurately, and for free. Whether you're pricing out a fabrication job, ordering raw
          stock for a construction project, or simply trying to confirm how much a piece of aluminum will
          weigh before shipping it, this tool gives you a precise answer in seconds, without spreadsheets or
          manual formulas.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Aluminum Weight Calculator Does</h2>
        <p style={pStyle}>
          This is a free online aluminum weight calculator built for engineers, metal fabricators,
          contractors, students, and hobbyists who need fast, reliable weight figures for aluminum stock. It
          supports 15 different shapes, including round bars, square and rectangular bars, round tubes, square
          and rectangular tubes, pipes, flat sheets and plates, angles, channels, and I-beams, so it covers
          nearly every profile you'd encounter in a metal supplier's catalog. It also supports 12 aluminum
          alloys, meaning the calculator doesn't rely on a single generic density value; it adjusts the
          calculation based on the actual alloy you select, which matters because different aluminum grades
          (such as 6061, 6063, 5052, or 7075) have slightly different densities and therefore different
          weights even at identical dimensions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond raw weight, the calculator includes instant price estimation, letting you convert a
          calculated weight into an approximate cost figure. This is particularly useful when you're comparing
          suppliers, budgeting a project, or trying to determine whether a custom-cut piece is priced fairly
          relative to its actual material weight.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Aluminum Weight Calculator</h2>
        <p style={pStyle}>Using the tool takes only a few steps, and no technical background is required:</p>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Select the shape</strong> — Choose the profile that matches your material: round bar,
            square bar, tube, pipe, sheet, angle, channel, I-beam, or one of the other supported shapes.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose the alloy</strong> — Pick from the 12 supported aluminum alloys. If you're not sure
            which grade you have, check the mill certificate, supplier invoice, or stamped markings on the
            stock itself.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter the dimensions</strong> — Depending on the shape selected, you'll input values like
            length, diameter, wall thickness, width, or height. The calculator supports all common unit
            systems, so you can enter measurements in millimeters, inches, centimeters, or feet without
            needing to convert anything manually.
          </li>
          <li>
            <strong>Get instant results</strong> — The tool immediately displays the calculated weight in your
            preferred unit (kilograms, pounds, grams, or ounces), along with an estimated price if you choose
            to enter a per-unit cost.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because the calculation happens instantly as you adjust values, you can quickly test different
          dimensions or alloys side by side, useful when you're deciding between stock sizes or comparing
          material options for a project.
        </p>
      </div>

      {/* Shapes and alloys */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Supported Shapes and Alloys Explained</h2>
        <p style={pStyle}>
          Aluminum stock comes in a wide range of profiles, and each one requires a different cross-sectional
          area formula to calculate weight correctly. This calculator accounts for that automatically:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Bars (round, square, rectangular, hexagonal)</strong> — common in machining and structural
            fabrication
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Tubes (round and rectangular, both with defined wall thickness)</strong> — used in
            framing, railings, and lightweight structures
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Pipes</strong> — similar to tubes but typically classified by schedule and nominal
            diameter
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Sheets and plates</strong> — flat stock measured by length, width, and thickness, widely
            used in construction cladding, signage, and enclosures
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Angles</strong> — L-shaped profiles common in bracing and structural support
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Channels</strong> — C-shaped profiles used in framing and structural applications
          </li>
          <li>
            <strong>I-beams</strong> — structural beams used in load-bearing construction
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          On the alloy side, supporting 12 grades means the tool can reflect real-world density differences.
          For example, 7075 aluminum (used in aerospace and high-strength applications) has a noticeably
          different density than 1100 aluminum (a nearly pure, softer grade used in chemical and food-grade
          applications). Selecting the correct alloy ensures the weight figure you get matches what you'd see
          on an actual scale, not just a generic estimate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're unsure which alloy you're working with, a few general guidelines can help narrow it down.
          6061 and 6063 are the most common extrusion alloys, widely used in framing, railings, and general
          fabrication because they balance strength, weldability, and corrosion resistance. 5052 is favored
          for sheet metal work, particularly where forming and marine-grade corrosion resistance matter, such
          as boat hulls and fuel tanks. 7075 and 2024 are higher-strength alloys typically reserved for
          aerospace or performance applications, and they tend to be more expensive and harder to weld. 1100
          and 3003 are softer, more corrosion-resistant grades often used in chemical processing equipment,
          cookware, and roofing. When in doubt, the supplier's packing slip, mill certificate, or stamped part
          markings on the stock itself are the most reliable source for confirming the exact grade before
          running your calculation.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Aluminum Weight Is Calculated</h2>
        <p style={pStyle}>
          The underlying formula is straightforward once you understand it, and knowing it helps you
          sanity-check the tool's output or perform quick estimates when you don't have access to a
          calculator. Aluminum weight is calculated as:
        </p>
        <div style={formulaStyle}>Weight = Volume × Density</div>
        <p style={pStyle}>
          Volume depends on the shape's dimensions, for a round bar, that means calculating the
          cross-sectional area (π × radius²) and multiplying it by length. For a rectangular sheet, it's
          length × width × thickness. For hollow shapes like tubes and pipes, the calculator subtracts the
          inner volume from the outer volume to account for the wall thickness.
        </p>
        <p style={pStyle}>
          Density varies by alloy, but pure aluminum has a density of approximately 2.70 g/cm³, and most
          structural alloys fall within a close range of that figure, typically between 2.63 g/cm³ and 2.85
          g/cm³ depending on the specific alloying elements used. This is why alloy selection matters: even a
          small density difference compounds significantly over long bar stock or large sheet quantities. The
          calculator applies the correct density value automatically based on the alloy you select, so you
          don't need to look up density charts separately.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To put the formula into practice, consider a 6061 round bar with a 25 mm diameter and a length of 1
          meter. The cross-sectional area works out to roughly 4.91 cm², and multiplying that by a length of
          100 cm gives a volume of about 491 cm³. Multiplying that volume by the alloy's density of
          approximately 2.70 g/cm³ produces a weight of around 1.33 kg. Running the same dimensions through a
          hollow tube instead of a solid bar would require subtracting the inner void from the outer volume
          before applying density, which is where manual calculation becomes more error-prone and where the
          calculator saves the most time — particularly for multi-piece orders where a small formula mistake
          gets multiplied across dozens of parts.
        </p>
      </div>

      {/* Price estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Instant Price Estimation</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once the weight is calculated, the tool can also estimate the material cost if you provide a price
          per unit weight (such as price per kilogram or per pound). This is a practical addition for anyone
          sourcing material, since aluminum pricing fluctuates with market conditions and supplier markups.
          Rather than calculating weight in one tool and cost in a separate spreadsheet, you get both figures
          in a single pass, useful for quickly comparing quotes from different suppliers or estimating the
          material portion of a project budget before committing to a purchase order.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need an Aluminum Weight Calculator</h2>
        <p style={pStyle}>This tool is useful in a wide range of real-world situations, including:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Ordering raw material</strong> — Confirming how much a specific length of bar, tube, or
            sheet will weigh before placing a supplier order, which affects both shipping cost and total
            price.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Structural and construction planning</strong> — Estimating the weight of aluminum beams,
            channels, or angles used in a build, which matters for load calculations and transport logistics.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fabrication and machining quotes</strong> — Calculating material weight before cutting or
            machining, so shops can price jobs accurately based on actual stock consumed.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Shipping and freight calculations</strong> — Determining accurate weight figures for
            freight quotes, since shipping costs are often based on weight brackets.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Scrap and recycling valuation</strong> — Estimating the weight of aluminum scrap to get a
            fair price when selling to a recycler.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Student and educational use</strong> — Verifying manual calculations for engineering,
            materials science, or shop class assignments.
          </li>
          <li>
            <strong>DIY and hobbyist projects</strong> — Figuring out how much a custom aluminum part will
            weigh before building, especially relevant for applications like drone frames, boat fittings, or
            vehicle fabrication where weight directly affects performance.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          In each of these cases, manually calculating volume, looking up alloy-specific density, and
          converting units introduces room for error, particularly when working across metric and imperial
          systems. The calculator removes that friction entirely.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unit mismatches are one of the most common sources of costly mistakes in material ordering. A
          supplier quote listed in pounds per foot, a drawing dimensioned in millimeters, and a purchase order
          written in kilograms can easily lead to an order that's significantly under- or over-sized if
          converted incorrectly by hand. Because this calculator lets you enter dimensions in whichever unit
          system matches your source document and instantly view the result in your preferred output unit, it
          removes the extra conversion step that's often where errors creep in, especially on jobs that
          involve suppliers or teams working across different regional unit standards.
        </p>
      </div>

      {/* Accuracy/privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Free Access</h2>
        <p style={pStyle}>
          The calculator is free to use, with no signup or account creation required, you can open the page
          and get a result immediately. All calculations are performed instantly based on the values you
          enter; there are no files to upload and no personal or project data stored or transmitted anywhere,
          since the tool works entirely from the dimensions and alloy you input on the page. There are no
          hidden charges, subscription requirements, or usage limits for using the calculator itself.
        </p>
        <p style={pStyle}>
          On the accuracy side, the tool uses standard, industry-recognized density values for each of the 12
          supported alloys and applies the correct geometric formula for each of the 15 supported shapes. That
          said, for critical structural or safety-rated engineering work, results should always be
          cross-checked against official mill certificates or alloy datasheets, since minor variances in
          manufacturing tolerances can produce small deviations between calculated and actual measured weight.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also worth understanding why calculated weight and actual scale weight sometimes differ
          slightly, so you know when a discrepancy is normal versus something worth double-checking. Extruded
          and rolled aluminum stock is produced to a tolerance range, not an exact dimension, a bar labeled as
          25 mm in diameter might measure 24.9 mm or 25.1 mm depending on the mill's tolerance class, and that
          small variance carries through to the final weight. Surface coatings, anodizing, or paint finishes
          can add a small amount of additional weight that a raw-material calculation won't capture. For most
          purchasing, budgeting, and planning purposes, these differences are negligible, typically well under
          one percent, but for precision manufacturing or aerospace-grade work, it's standard practice to
          weigh finished parts on a calibrated scale rather than relying solely on calculated figures.
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
