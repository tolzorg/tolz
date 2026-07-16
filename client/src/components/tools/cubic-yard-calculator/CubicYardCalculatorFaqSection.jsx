import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many cubic yards are in a ton?",
    a: "This depends on the material. As a rough guide, one cubic yard of gravel or sand weighs about 1.3 to 1.5 tons, one cubic yard of topsoil weighs roughly 1 ton, and one cubic yard of mulch weighs closer to 0.2 to 0.4 tons. Always check with your specific supplier, since moisture content and material grade shift these numbers.",
  },
  {
    q: "How do I calculate cubic yards for a circular area, like a fire pit or tree ring?",
    a: "Use the formula for a cylinder: π × radius² × depth, then divide by 27 to convert to cubic yards. If your calculator only accepts rectangular dimensions, you can approximate by measuring the diameter, treating it as a square area, and slightly reducing the result, though a dedicated circular calculation will always be more precise.",
  },
  {
    q: "Should I order extra material beyond my calculated cubic yards?",
    a: "Yes, for most materials. Gravel, soil, and fill dirt are typically compact after placement, so ordering 5–10% more than your calculated volume helps avoid running short. Concrete is the exception, contractors usually round up to the nearest quarter or half yard rather than adding a large buffer, since excess concrete is costly to dispose of.",
  },
  {
    q: "Why does my supplier quote me in cubic yards instead of pounds or tons?",
    a: "Volume is the standard unit for bulk materials because it reflects how much space the material will fill, not just how heavy it is. Two materials with the same weight can occupy very different volumes, so cubic yards give both the buyer and supplier a consistent way to price and measure delivery loads.",
  },
  {
    q: "Can this calculator handle mixed units, like feet and inches together?",
    a: "Yes. You can enter measurements in feet, inches, yards, meters, or centimeters, and the calculator converts everything internally before computing the final cubic yard figure, so there's no need to convert units manually beforehand.",
  },
  {
    q: "How many bags of concrete or soil equal one cubic yard?",
    a: "For concrete, roughly 60 standard 60-lb bags or about 45 80-lb bags make one cubic yard. For soil or mulch sold in 2-cubic-foot bags, it takes about 13.5 bags to equal one cubic yard, since 27 cubic feet make up a full yard.",
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

export default function CubicYardCalculatorFaqSection() {
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
        <h2 style={h2Style}>Everything You Need to Calculate Cubic Yards Accurately</h2>
        <p style={pStyle}>
          Ordering the wrong amount of concrete, gravel, or soil is one of the most common — and expensive,
          mistakes in any construction or landscaping project. Too little material means a second delivery
          and wasted labor; too much means paying for a product you'll never use. The cubic yard calculator
          above solves this problem in seconds by converting your project's length, width, and depth into an
          exact volume in cubic yards, along with an estimated material weight. Built by Tolz, it's designed
          for homeowners, contractors, and landscapers who need dependable numbers before they call a supplier
          or place an order.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unlike generic volume calculators, this tool is tuned specifically for the materials people actually
          order in bulk, concrete, gravel, sand, soil, mulch, and fill dirt, so the result you get isn't just
          a number, but a number you can act on.
        </p>
      </div>

      {/* What is a cubic yard */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Cubic Yard, and Why Does It Matter?</h2>
        <p style={pStyle}>
          A cubic yard is a unit of volume equal to a cube measuring three feet on every side, 3 feet long, 3
          feet wide, and 3 feet deep, or 27 cubic feet total. It's the standard unit that ready-mix concrete
          plants, gravel yards, and topsoil suppliers use for pricing and delivery, which is why almost every
          material calculator in construction and landscaping is built around it. If you ask a supplier for
          "10 yards of gravel," you're really asking for 10 cubic yards, not 10 linear yards, a distinction
          that trips up a lot of first-time DIYers and even some experienced project planners when they're
          working from unfamiliar measurements.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because suppliers sell and price by the cubic yard, getting this number right directly affects your
          budget. Underestimating means a mid-project scramble for more material at a higher last-minute
          price; overestimating means paying for excess you'll have to dispose of or store. This calculator
          removes the guesswork from that decision.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Cubic Yard Calculator Works</h2>
        <p style={pStyle}>
          The tool asks for three basic dimensions of your project area: length, width, and depth (or height,
          for retaining walls and raised beds). You can enter these measurements in feet, inches, yards,
          meters, or centimeters, whichever unit matches your tape measure or site plan, and the calculator
          automatically converts everything into a single, accurate cubic yard figure. There's no need to
          manually convert inches to feet or meters to yards beforehand; the tool handles mixed units
          internally so your result stays precise regardless of how you measured the space.
        </p>
        <p style={pStyle}>Once you enter your dimensions, the calculator instantly returns:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>Total volume in cubic yards, rounded appropriately for ordering purposes</li>
          <li style={{ marginBottom: 6 }}>Equivalent cubic feet, useful for smaller projects like planters or fire pits</li>
          <li>Estimated material weight, based on the density of the material you select</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          This last feature matters more than it might seem. Volume tells a supplier how much space the
          material will fill, but weight determines what kind of vehicle or trailer you'll need to haul it,
          and whether your truck or trailer's payload capacity can handle the load safely.
        </p>
      </div>

      {/* Materials */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Cubic Yards for Specific Materials</h2>
        <p style={pStyle}>
          Different materials have different densities, which means two projects with identical dimensions
          can require very different delivery arrangements. The calculator accounts for this by letting you
          select your material type so the weight estimate reflects reality, not a generic average.
        </p>
        <p style={pStyle}>
          <strong>Concrete.</strong> For slabs, footings, driveways, and sidewalks, concrete is typically
          ordered in quarter- or half-yard increments because ready-mix trucks charge minimums and short-load
          fees. A standard 4-inch slab, for example, uses roughly one cubic yard of concrete per 80 square
          feet. Concrete is also one of the densest common building materials, weighing around 4,000 pounds
          per cubic yard when wet, so even modest volumes translate into a serious load.
        </p>
        <p style={pStyle}>
          <strong>Gravel.</strong> Driveways, drainage beds, and pathway bases commonly use gravel, which
          weighs considerably less than concrete, generally between 2,400 and 2,900 pounds per cubic yard
          depending on the stone size and moisture content. Because gravel compacts after placement, many
          contractors add a 10% buffer to their calculated volume to account for settling.
        </p>
        <p style={pStyle}>
          <strong>Sand.</strong> Used for paver bases, playgrounds, and concrete mixing, sand density varies by
          type (dry, wet, or compacted), generally falling between 2,600 and 3,000 pounds per cubic yard. Wet
          sand weighs meaningfully more than dry sand, which matters if you're calculating delivery logistics
          after a rainy week.
        </p>
        <p style={pStyle}>
          <strong>Soil.</strong> Topsoil for garden beds, lawns, and grading projects is lighter than gravel or
          sand but still substantial, roughly 2,000 pounds per cubic yard for standard topsoil, less for loose
          or screened varieties. Since soil settles significantly once watered and compacted, many landscapers
          calculate their volume and then order slightly more than the raw number suggests.
        </p>
        <p style={pStyle}>
          <strong>Mulch.</strong> Mulch is by far the lightest material this calculator handles, typically
          weighing between 400 and 800 pounds per cubic yard depending on whether it's bark, wood chips, or a
          compost blend. A single cubic yard of mulch covers about 100 square feet at a 3-inch depth, making
          it one of the more forgiving materials to estimate for.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Fill dirt.</strong> Used to level low spots, fill excavations, and build up grade before
          landscaping, fill dirt sits close to topsoil in weight but often contains more rock and debris,
          which can push density higher. Getting this estimate right avoids paying for a second load
          mid-project.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Cubic Yard Calculator</h2>
        <p style={pStyle}>
          This tool comes up in far more situations than a single home renovation. Common scenarios include:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>Pouring a concrete driveway, patio, or foundation and needing an exact order quantity before calling a ready-mix supplier.</li>
          <li style={{ marginBottom: 6 }}>Building a gravel driveway or French drain, where under-ordering means a visibly incomplete surface and a second delivery fee.</li>
          <li style={{ marginBottom: 6 }}>Filling raised garden beds or planter boxes with topsoil, where precision keeps costs proportional to a small project.</li>
          <li style={{ marginBottom: 6 }}>Spreading mulch across landscaping beds before a seasonal refresh, where knowing the exact yardage prevents leftover bags going to waste.</li>
          <li style={{ marginBottom: 6 }}>Leveling a yard or filling a low spot with dirt before laying sod or building a structure.</li>
          <li style={{ marginBottom: 6 }}>Estimating cost from a supplier's price-per-yard rate, since most bulk material vendors quote by the cubic yard, not by weight or square footage.</li>
          <li>Comparing bagged versus bulk material costs, since bagged products list cubic feet, and converting to yards clarifies which option is actually cheaper at scale.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, an accurate volume figure isn't just convenient, it's the number that
          determines your final invoice.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Cubic Yards Manually (The Formula Behind the Tool)</h2>
        <p style={pStyle}>
          If you ever want to sanity-check the calculator's result or work it out by hand, the underlying
          formula is straightforward:
        </p>
        <div style={formulaStyle}>
          Length (ft) × Width (ft) × Depth (ft) ÷ 27 = Cubic Yards
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Dividing by 27 converts cubic feet into cubic yards, since a cubic yard contains 27 cubic feet. For
          example, a patio measuring 12 feet by 10 feet at a 4-inch (0.33-foot) depth works out to 12 × 10 ×
          0.33 ÷ 27, or roughly 1.47 cubic yards. Most suppliers will round this up to 1.5 yards to account for
          compaction and spillage. The calculator performs this same math automatically, but also handles unit
          conversions and material-specific weight estimates that would otherwise require separate reference
          tables.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting an Accurate Measurement</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator is only as accurate as the numbers you feed it, so a few measurement habits make a
          meaningful difference. Measure depth at multiple points across the project area rather than a single
          spot, since ground level often varies more than expected, and average those readings before entering
          them. For irregularly shaped areas, break the space into smaller rectangles or triangles, calculate
          each separately, and add the totals together rather than estimating one blended figure. Finally,
          always round your final order up slightly rather than down, running short mid-pour or mid-spread is
          far more disruptive than having a small surplus.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost, and Reliability</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is completely free to use, with no signup, account creation, or payment information
          required at any step. All calculations happen directly on the page, so the dimensions and project
          details you enter are not stored, logged, or shared, you can use the tool as many times as needed
          for different projects without creating any kind of account or leaving a data trail. There are no
          hidden charges, premium tiers, or usage limits attached to this tool; it's built to be a quick,
          dependable reference you can return to for every project without friction.
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
