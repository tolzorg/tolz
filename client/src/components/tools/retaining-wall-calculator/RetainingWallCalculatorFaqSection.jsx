import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is a retaining wall calculator?",
    a: "It's accurate for planning and budgeting purposes, since it's based on standard material ratios and your entered dimensions. Site-specific factors like soil type, slope, and local code requirements can shift the final numbers, so treat the output as a strong planning estimate rather than a final structural or purchasing figure.",
  },
  {
    q: "What's the cheapest type of retaining wall to build?",
    a: "Dry-stack stone and basic CMU block walls are typically the lowest-cost options in material terms, especially for walls under a few feet tall. Poured concrete and segmental systems usually cost more upfront but can offer faster installation and longer service life depending on the application.",
  },
  {
    q: "Do I need a permit to build a retaining wall?",
    a: "Many areas require a permit once a wall exceeds a certain height, commonly around 3 to 4 feet, though this varies by municipality. Always check local building codes before starting construction, particularly for walls near property lines or structures.",
  },
  {
    q: "How do I calculate how much concrete I need for a retaining wall?",
    a: "Concrete volume is calculated by multiplying the wall's length, height, and thickness to get cubic footage, then converting to cubic yards. This calculator does that conversion automatically once you enter your wall dimensions.",
  },
  {
    q: "What is the difference between a segmental retaining wall and a CMU block wall?",
    a: "Segmental retaining wall units interlock without mortar and typically use geogrid reinforcement, while CMU block walls use mortar and grout with vertical rebar for reinforcement. Segmental systems are generally faster to install; CMU walls can handle certain loads differently depending on design.",
  },
  {
    q: "Why is drainage important behind a retaining wall?",
    a: "Without adequate drainage, water pressure builds up behind the wall and is one of the most common causes of retaining wall failure, bowing, or collapse. Including gravel backfill and, in many cases, a drainage pipe helps redirect water away from the wall structure.",
  },
  {
    q: "Is this retaining wall calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no hidden fees for accessing the full material and cost estimate.",
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

export default function RetainingWallCalculatorFaqSection() {
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
    name: "Retaining Wall Calculator",
    url: "https://www.tolz.org/calculators/construction/retaining-wall",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online retaining wall calculator to estimate materials and costs for poured concrete, CMU block, segmental, mortared stone, and dry-stack retaining walls, including footing, drainage, backfill, and conceptual rebar estimates.",
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Retaining Wall Calculator: Estimate Materials and Costs for Any Wall Type</h2>
        <p style={pStyle}>
          Planning a retaining wall means juggling wall height, length, material type, footing depth, and
          drainage all at once, and getting any one of those numbers wrong can throw off your entire budget.
          The retaining wall calculator above, built by <Link to="/" className="inline-home-link">Tolz</Link>,
          takes the guesswork out of that process by generating a clear, itemized material and cost estimate in
          seconds. Whether you're pricing out a poured concrete wall, a CMU block wall, a segmental retaining
          wall system, or a dry-stack stone wall, this tool gives you the quantities you need to plan the
          project or request accurate quotes from contractors and suppliers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This retaining wall cost calculator is designed for homeowners, landscapers, DIY builders, and
          contractors who need fast, reliable material quantity estimates without opening a spreadsheet or
          manually running volume calculations. It's free to use, requires no signup, and works entirely in
          your browser.
        </p>
      </div>

      {/* What this calculator does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Retaining Wall Calculator Does</h2>
        <p style={pStyle}>
          The calculator estimates the core materials needed to build a retaining wall based on the dimensions
          and wall type you enter. It accounts for footing requirements, backfill volume, drainage material,
          and, where structurally relevant, a conceptual rebar estimate. You enter your wall's length, height,
          and preferred construction method, and the tool returns a breakdown you can use for budgeting,
          comparing material options, or preparing a supply list before you start digging.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's important to understand the scope of the tool: this is a material quantity and cost estimator,
          not a structural engineering calculator. Retaining walls above a certain height, or walls holding
          back significant soil loads, slopes, or surcharge from structures and driveways, typically require a
          stamped engineering design and local permitting. Use this calculator to plan quantities and budget,
          then have a qualified engineer or licensed contractor confirm structural requirements for anything
          beyond a small garden wall.
        </p>
      </div>

      {/* Wall types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Wall Types Covered: Concrete, Block, Segmental, and Stone</h2>
        <p style={pStyle}>
          One of the reasons this tool stands out from basic retaining wall calculators is that it supports
          multiple construction methods, each with different material logic.
        </p>
        <p style={pStyle}>
          Poured concrete retaining walls require calculating concrete volume based on wall thickness, height,
          and length, along with formwork considerations and rebar for reinforcement. The calculator converts
          your wall dimensions into cubic yards of concrete and estimates rebar length based on standard
          spacing assumptions for a wall of that scale.
        </p>
        <p style={pStyle}>
          CMU block retaining walls are priced by block count rather than volume. The tool calculates how many
          concrete masonry units you'll need based on standard block dimensions, then factors in the mortar,
          core fill (grout), and vertical rebar typically used to reinforce block walls above a couple of
          courses high.
        </p>
        <p style={pStyle}>
          Segmental retaining wall (SRW) systems use interlocking concrete units that don't require mortar,
          which changes the material list significantly. Instead of mortar and grout, segmental walls rely more
          heavily on compacted base material, geogrid reinforcement at intervals, and drainage aggregate behind
          the wall face. The calculator adjusts its estimate accordingly, giving you a base rock volume, unit
          count, and gravel backfill quantity.
        </p>
        <p style={pStyle}>
          Mortared stone retaining walls combine natural or manufactured stone with mortar joints, so the
          estimate leans on wall face area combined with a coverage rate per unit of stone, plus mortar volume
          for the joints.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Dry-stack stone walls skip mortar entirely and rely on stone selection, batter (the backward lean of
          the wall for stability), and proper base preparation. The calculator estimates stone volume needed
          based on wall face area and a standard waste allowance for cutting and fitting. By supporting all
          five methods in one tool, you can compare material costs and labor complexity across wall types
          before committing to a design, rather than running separate calculations for each option.
        </p>
      </div>

      {/* Footing, drainage, backfill */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Footing, Drainage, and Backfill: Why They Matter</h2>
        <p style={pStyle}>
          A retaining wall is only as good as what's behind and beneath it, and this is where a lot of basic
          calculators fall short. This tool factors in three elements that directly affect both cost and wall
          performance:
        </p>
        <p style={pStyle}>
          <strong>Footing depth</strong> provides the foundation the wall sits on and is critical for
          preventing settling, shifting, or frost heave in colder climates. The calculator estimates footing
          concrete or compacted base material volume based on your wall height and regional frost-depth
          assumptions you provide.
        </p>
        <p style={pStyle}>
          <strong>Drainage</strong> is arguably the most commonly underestimated cost in retaining wall
          projects. Without proper drainage, hydrostatic pressure builds up behind the wall and is a leading
          cause of wall failure. The calculator includes an estimate for drainage gravel and, where applicable,
          perforated pipe, based on the wall's height and length.
        </p>
        <p style={pStyle}>
          <strong>Backfill volume</strong> determines how much material is needed to fill the space behind the
          wall once it's built. This is calculated from the wall's height, length, and the excavation width you
          specify, giving you a realistic backfill quantity rather than a rough guess.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Together, these three elements often account for a significant share of total project cost, so
          including them in the estimate, rather than only pricing the visible wall material, gives you a far
          more accurate budget picture.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Does a Retaining Wall Cost? Understanding the Estimate</h2>
        <p style={pStyle}>
          Retaining wall cost varies enormously based on wall type, height, site accessibility, and regional
          material and labor pricing, which is exactly why a generic per-square-foot number found online is
          rarely useful for real budgeting. This calculator instead builds your estimate from the ground up
          using the actual dimensions and material type you specify, giving you a cost range grounded in real
          material quantities rather than a national average.
        </p>
        <p style={pStyle}>
          Generally speaking, dry-stack stone and CMU block walls tend to sit at the lower end of material cost
          but can require more labor time, while poured concrete and segmental systems often cost more in
          material but go up faster with less skilled labor. Mortared stone tends to be the most expensive
          option due to both material and labor demands. The calculator's output reflects material costs only,
          labor, equipment rental, permits, and site preparation (such as excavation or slope grading) should
          be added separately based on local rates and site conditions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because material prices for concrete, aggregate, block, and stone fluctuate by region and over time,
          treat the calculator's dollar figures as a planning estimate to refine with current local supplier
          quotes rather than a final, binding number.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Retaining Wall Calculator: Practical Scenarios</h2>
        <p style={pStyle}>This tool is useful across a wide range of real situations, not just large landscaping projects:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Sloped yard leveling</strong> — If you're creating a flat patio, garden bed, or usable lawn
            area on a sloped property, you need to know how much wall material and backfill the project will
            require before you start.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Erosion control</strong> — Homeowners dealing with soil erosion on a slope often need a low
            retaining wall to stabilize the area, and this calculator helps size the project appropriately.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Driveway or foundation grading</strong> — Walls that support a driveway edge or protect a
            foundation from soil movement need accurate footing and drainage estimates, since these walls carry
            more load than a simple garden wall.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Tiered garden or terrace construction</strong> — Multi-level garden terraces typically use
            several shorter walls rather than one tall wall, and the calculator can be run per tier to plan
            material purchasing in stages.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Contractor quote comparison</strong> — If you're collecting bids from multiple contractors,
            running your own estimate first gives you a baseline to evaluate whether a quote's material pricing
            is reasonable.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>DIY budgeting before permitting</strong> — Many municipalities require a rough project
            scope for permit applications; this tool gives you defensible numbers to include.
          </li>
          <li>
            <strong>Material comparison before design finalization</strong> — If you're undecided between
            segmental block and poured concrete, running both scenarios through the calculator quickly shows
            the cost and material difference.
          </li>
        </ul>
      </div>

      {/* Accuracy / best practices */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Limitations, and Best Practices</h2>
        <p style={pStyle}>
          This calculator uses standard construction ratios and common industry assumptions, such as typical
          block dimensions, standard concrete mix coverage, and conventional drainage gravel depth, to generate
          its estimates. These are the same baseline assumptions most contractors use for early-stage material
          planning. However, real-world results can shift based on soil type, local frost depth requirements,
          site slope, and the specific products available from local suppliers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For best results, measure your wall length and height as accurately as possible, and round up
          slightly for material quantities to account for waste, cutting, and minor site adjustments. If your
          wall will exceed roughly 3 to 4 feet in height, retain significant soil load, or sit near a
          structure, consult a structural engineer or your local building department before finalizing your
          design, many jurisdictions require engineering sign-off and permits above that height regardless of
          wall type.
        </p>
      </div>

      {/* Privacy / cost / ease of use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost, and Ease of Use</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This retaining wall calculator is completely free to use, with no signup, account creation, or email
          requirement. You can enter your project details and get a full material and cost breakdown
          immediately. All calculations run in your browser session, and no project data, measurements, or
          personal information are stored or shared. There are no hidden charges, download limits, or premium
          tiers gating the core estimate, the full tool is available to every visitor at no cost.
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
