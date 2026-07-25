import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many boards do I need for a board and batten wall?",
    a: "It depends on your wall width, board width, and the on-center spacing between boards. As a general rule, divide your wall width by the on-center spacing to get the number of boards, then subtract for any openings. The calculator does this automatically for each wall you enter, including deductions for windows and doors.",
  },
  {
    q: "What size boards are typically used for board and batten siding?",
    a: "Most exterior board and batten projects use 1x8, 1x10, or 1x12 nominal boards, while interior accent walls often use narrower 1x6 or 1x8 boards. Battens are usually cut from 1x2 to 1x4 stock, depending on the desired shadow-line thickness.",
  },
  {
    q: "How much does board and batten siding material cost?",
    a: "Material cost depends heavily on lumber type, wall size, and local pricing, but it's generally higher per square foot than standard lap siding because of the added batten strips. Getting an accurate board and batten count from the calculator first makes it much easier to price out materials against current local lumber costs.",
  },
  {
    q: "What is the difference between board and batten and reverse board and batten?",
    a: "Traditional board and batten uses wide boards with narrow battens covering the seams. Reverse board and batten flips this, using narrower boards with wider battens on top, which creates a bolder, more pronounced shadow line across the wall.",
  },
  {
    q: "Do I need to account for windows and doors when calculating board and batten materials?",
    a: "Yes. Openings reduce the total surface area that needs boards and battens, and skipping this step is one of the most common causes of over-ordering. The calculator lets you enter openings for each wall so the material count reflects only the area that will actually be clad.",
  },
  {
    q: "Is this board and batten calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no hidden costs. You can run as many calculations as you need for different walls, profiles, or spacing options.",
  },
  {
    q: "Can I use this calculator for interior accent walls, not just exterior siding?",
    a: "Yes. The calculator works for both exterior siding and interior accent wall projects. Interior walls typically involve smaller dimensions and tighter spacing, and the same input fields apply to both use cases.",
  },
  {
    q: "What batten spacing should I use for board and batten siding?",
    a: "On-center spacing typically ranges from 12 to 24 inches depending on board width and the desired look, with narrower spacing creating a more traditional farmhouse appearance. You can adjust the spacing value in the calculator to compare material totals across different spacing options before finalizing your plan.",
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

export default function BoardAndBattenCalculatorFaqSection() {
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
    name: "Board and Batten Calculator",
    url: "https://www.tolz.org/calculators/construction/board-and-batten",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: "Free online board and batten calculator that estimates boards, battens, trim, fasteners, and paint needed for exterior or interior board and batten siding. Supports multiple walls, window and door openings, seven board profiles, and standard North American lumber sizing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* What is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Board and Batten Calculator?</h2>
        <p style={pStyle}>
          Planning a board and batten project by hand means juggling wall dimensions, board widths, batten
          spacing, corner trim, and fastener counts, and one miscalculation can mean an extra trip to the
          lumber yard or a leftover pile of boards you can't return. The board and batten calculator on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> removes that guesswork. Enter your wall
          measurements, choose a board profile, and the tool instantly calculates how many boards and battens
          you need, along with trim, fasteners, and paint quantities, so you can order materials once and get
          it right the first time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Board and batten is one of the most popular siding and wall-cladding styles in North America, prized
          for its clean vertical lines and durability, but it's also one of the more math-heavy DIY projects to
          plan. This calculator was built specifically to handle that complexity, supporting multiple walls,
          window and door openings, and seven distinct board profiles, so both first-time DIYers and
          experienced contractors can generate a reliable material list in minutes instead of hours.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You'd Need This Calculator: Practical Scenarios</h2>
        <p style={pStyle}>
          Board and batten projects come up in several real situations, and each one benefits from having exact
          numbers before a single board is cut:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Exterior siding installation or replacement.</strong> Homeowners upgrading curb appeal or
            replacing aging siding need to know exactly how many linear feet of boards and battens a full
            exterior requires, factoring in multiple walls, gables, and varying wall heights.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Interior accent walls.</strong> Board and batten has become a standard feature in
            entryways, dining rooms, and bedrooms. Interior projects usually involve smaller wall sections but
            tighter spacing tolerances, since the finished look is viewed up close.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Renovation and remodeling estimates.</strong> Contractors quoting a job need a fast,
            defensible materials breakdown to present to clients. A consistent calculation method also makes it
            easier to compare labor-only versus materials-included pricing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Budgeting before a purchase.</strong> Lumber prices fluctuate, and board and batten uses
            more linear footage than plain lap siding because of the added battens. Knowing the total board
            count and estimated paint coverage in advance prevents budget surprises mid-project.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Custom spacing and pattern planning.</strong> Some homeowners want wider reveal spacing or a
            specific batten rhythm for aesthetic reasons. Adjusting board width and spacing in the calculator
            shows how those choices affect total material count before committing.
          </li>
          <li>
            <strong>Multi-wall and irregular structures.</strong> Sheds, garages, dormers, and additions rarely
            have identical wall dimensions. A calculator that supports multiple walls in a single estimate
            avoids the error-prone process of adding up separate hand calculations for each section.
          </li>
        </ul>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Board and Batten Calculator Works</h2>
        <p style={pStyle}>
          The calculator is built around the standard board and batten construction method: wide vertical
          boards (or sheet panels) installed first, with narrower battens nailed over the seams between them.
          To generate an estimate, the tool needs a few core inputs.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Wall dimensions.</strong> Enter the width and height of each wall you're covering. The
            calculator supports multiple walls in one project, so you can total an entire exterior or a
            multi-wall interior feature without running separate calculations.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Openings.</strong> Windows and doors reduce the actual surface area that needs covering.
            Subtracting openings prevents over-ordering boards and battens for space that won't be clad, which
            is one of the most common manual calculation errors.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Board width and spacing.</strong> You select the nominal board width you plan to use and
            the on-center spacing between boards. This determines how many boards fit across each wall and, by
            extension, how many battens are needed to cover the seams.
          </li>
          <li>
            <strong>Board profile.</strong> With seven supported profiles, the calculator adjusts its math
            depending on whether you're installing traditional board and batten, board-on-board, reverse board
            and batten, or another configuration, since each style uses a different ratio of boards to battens.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Once these inputs are entered, the calculator returns a full material breakdown: total boards needed,
          total battens needed, linear feet of trim (including corner boards and edge trim), an estimated
          fastener count based on standard nailing schedules, and paint or primer coverage based on total
          square footage. Because the math accounts for standard lumber lengths and North American sizing
          conventions, the output maps directly to what you'd order at a lumber yard or home improvement store.
        </p>
      </div>

      {/* Profiles */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Board and Batten Profiles Explained</h2>
        <p style={pStyle}>
          Not all board and batten installations look the same, and the profile you choose changes both the
          material list and the finished appearance. The calculator supports the full range of common styles
          used across residential and light commercial projects.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Traditional board and batten</strong> uses wide boards installed edge-to-edge with narrower
            battens covering each seam, the classic farmhouse look.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Reverse board and batten</strong> flips the visual weight, using narrower boards up front
            with wider battens over the seams, creating a bolder shadow line.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Board-on-board</strong> overlaps wider boards directly over one another rather than using
            separate narrow battens, giving a heavier, more rustic profile with fewer visible seams.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Batten-on-board</strong> applies narrow strips directly over a continuous base panel rather
            than individual boards, often used for a more uniform, budget-friendly finish.
          </li>
          <li>
            <strong>Channel and shiplap-style variations</strong> use interlocking or overlapping edges instead
            of flush board seams, which changes both the spacing calculation and the batten requirement.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Selecting the correct profile in the calculator matters because board-to-batten ratios vary
          significantly between styles, a board-on-board wall might need zero separate battens, while a
          traditional layout needs roughly one batten per seam. Getting this selection right is the single
          biggest factor in estimating accuracy.
        </p>
      </div>

      {/* Lumber sizing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding North American Lumber Sizing</h2>
        <p style={pStyle}>
          Board and batten projects rely on standard nominal lumber dimensions, and the calculator's output is
          built around real-world stock sizes rather than rounded approximations. Common board widths used for
          the "board" portion include 1x6, 1x8, 1x10, and 1x12 nominal lumber, while battens are typically cut
          from 1x2, 1x3, or 1x4 stock.
        </p>
        <p style={pStyle}>
          Because nominal sizing differs from actual milled dimensions (a "1x6" board is actually about 5.5
          inches wide), an accurate calculator has to work from actual dimensions when computing coverage, not
          the nominal label. This is where hand calculations most often go wrong, using nominal width instead
          of actual width can throw off a board count by a full board or more across a large wall. The tool
          handles this conversion automatically, so the board and batten counts it returns reflect what will
          actually fit on the wall, not a rounded estimate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Standard lumber lengths (8, 10, 12, and 16 feet) also factor into the trim and corner board
          calculations, helping minimize waste from unnecessary cuts and reducing the number of seams needed on
          taller walls.
        </p>
      </div>

      {/* Measurement tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting an Accurate Estimate: Measurement Tips</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator's output is only as reliable as the measurements entered, so a few practices improve
          accuracy significantly. Measure wall width at the widest point and height from the base trim line to
          the top of the wall or soffit, rather than relying on rough estimates or blueprint dimensions, which
          can differ from as-built conditions. Always measure and enter openings individually rather than
          estimating a flat percentage deduction, since window and door sizes vary enough to meaningfully
          affect the board count on smaller walls. For multi-wall projects, measure each wall separately even
          if they appear similar, since minor variations in framing add up across a full exterior. Finally,
          most professional installers add a 5–10% waste allowance for cutting losses and mistakes; while the
          calculator returns exact material counts based on your inputs, it's worth rounding up slightly when
          placing your final lumber order, especially for exterior projects exposed to on-site cutting and
          adjustment.
        </p>
      </div>

      {/* Privacy / cost / reliability */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost & Reliability</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The board and batten calculator on Tolz is
          completely free to use, with no hidden charges, subscriptions, or paywalled results. There's no
          signup or account creation required, you can enter your wall dimensions and get a full material
          breakdown immediately. All calculations run directly in your browser session, and no project data,
          measurements, or personal information are stored or shared. The underlying formulas are based on
          standard construction industry methods for board and batten estimation, including actual lumber
          dimensions and recognized nailing schedules, so the results are built to be dependable enough to use
          for real material orders, not just rough planning.
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
