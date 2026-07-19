import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I convert square feet to cubic yards?",
    a: "Multiply your square footage by the depth in inches, then divide the result by 324. This accounts for converting inches to feet and cubic feet to cubic yards in a single step. This calculator does that math instantly once you enter your area and depth.",
  },
  {
    q: "How many square feet are in a cubic yard?",
    a: "It depends on depth, since a cubic yard is a volume measurement and square feet is an area measurement. At a 3-inch depth, one cubic yard covers about 108 square feet; at a 4-inch depth, it covers about 81 square feet.",
  },
  {
    q: "How much concrete do I need for a 10x10 area?",
    a: "For a 10x10 foot area (100 square feet) at a standard 4-inch slab depth, you'd need approximately 1.23 cubic yards of concrete. Enter your exact dimensions into the calculator above to get a precise figure for your specific depth.",
  },
  {
    q: "How many cubic yards of gravel do I need for a driveway?",
    a: "This depends on the driveway's length, width, and desired gravel depth, which is typically 4 to 6 inches for a base layer. Enter your driveway dimensions and depth into the calculator to get an exact cubic yard figure, plus an estimated weight.",
  },
  {
    q: "What depth of topsoil do I need for a new lawn?",
    a: "New lawns typically need 4 to 6 inches of topsoil, while raised garden beds often require 8 to 12 inches or more depending on what's being planted. Adjust the depth field in the calculator to compare different scenarios.",
  },
  {
    q: "How much mulch do I need per square foot?",
    a: "At a standard 2 to 3 inch depth, one cubic yard of mulch covers roughly 100 to 160 square feet. Enter your bed's square footage and preferred depth into the calculator for an exact yardage figure.",
  },
  {
    q: "Is this sq ft to cubic yards calculator free to use?",
    a: "Yes, the calculator is completely free with no signup required and no hidden charges. Results appear instantly as you enter your measurements.",
  },
  {
    q: "Does this tool store my measurements or data?",
    a: "No. Calculations are performed directly without saving, logging, or sharing any of the numbers you enter.",
  },
  {
    q: "Can I calculate cubic yards without knowing the exact square footage?",
    a: "Yes. If you know the length and width of the space instead, you can enter those directly and the calculator will multiply them into square footage automatically before converting to cubic yards.",
  },
  {
    q: "Why do suppliers quote material in tons instead of cubic yards?",
    a: "Some materials, particularly gravel and sand, are dense enough that suppliers find it more practical to price and deliver by weight. This calculator includes a material weight estimator so you can convert your cubic yard result into an approximate weight for comparison.",
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

export default function SqftToCubicYardsFaqSection() {
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
          Figuring out how much concrete, gravel, or topsoil to order shouldn't require a math textbook. This
          sq ft to cubic yards calculator takes your square footage and depth and instantly converts them into
          cubic yards, so you can order the right amount of material the first time. It's built for
          homeowners, contractors, and landscapers alike, and it's part of the free suite of construction and
          measurement tools available on <Link to="/" className="inline-home-link">Tolz</Link>, where every calculator is designed to give you a fast, accurate
          answer without extra steps.
        </p>
      </div>

      {/* Understanding conversion */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding the Sq Ft to Cubic Yards Conversion</h2>
        <p style={pStyle}>
          Square feet measure area, a flat, two-dimensional space. Cubic yards measure volume — a
          three-dimensional quantity that accounts for depth. This distinction matters because most building
          and landscaping materials, from concrete to mulch, are sold and priced by volume, not by area. If
          you only know the square footage of a driveway, patio, or garden bed, you can't order material
          correctly until you factor in how deep that material needs to be.
        </p>
        <p style={pStyle}>The standard formula for converting square feet to cubic yards is straightforward:</p>
        <div style={formulaStyle}>
          Cubic Yards = (Square Feet × Depth in Inches) ÷ 324
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The number 324 comes from converting inches of depth into feet (divide by 12) and then converting
          cubic feet into cubic yards (divide by 27), combined into a single constant. For example, a 200
          square foot area at a 4-inch depth works out to (200 × 4) ÷ 324, which equals roughly 2.47 cubic
          yards. Doing this calculation by hand is easy to get wrong, especially when depth is expressed in
          fractions of an inch or when a project involves multiple sections with different depths, which is
          exactly the kind of error this calculator eliminates.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Sq Ft to Cubic Yards Calculator Works</h2>
        <p style={pStyle}>
          This tool is built to match how people actually plan projects, since not everyone starts with a
          known square footage. You can enter your area in one of two ways:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Length × Width Entry:</strong> If you know the dimensions of the space, say a 12-foot by
            15-foot patio, enter both measurements and the calculator multiplies them into square footage
            automatically. This is the most common entry method for rectangular spaces like driveways,
            patios, garden beds, and slab foundations.
          </li>
          <li>
            <strong>Direct Area Entry:</strong> If you already know the square footage from a site plan,
            blueprint, or previous measurement, you can skip the multiplication step and enter the area
            directly. This is useful for irregular shapes where you've already calculated the total area
            using a different method.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Once your area is set, enter the depth of material you plan to add. The calculator processes both
          inputs instantly, there's no calculate button to press and no page reload to wait for. As soon as
          you adjust a number, the cubic yard result updates in real time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool also outputs volume in 10 different units beyond cubic yards, including cubic feet, cubic
          meters, and liters, which is useful if you're comparing supplier quotes that use different
          measurement standards or working on a project that spans both imperial and metric specifications.
        </p>
      </div>

      {/* Material weight estimator */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Material Weight Estimator: Concrete, Gravel, Sand, Topsoil, and Mulch</h2>
        <p style={pStyle}>
          Volume alone doesn't tell the whole story when you're ordering material, because different materials
          have very different densities. A cubic yard of gravel weighs significantly more than a cubic yard
          of mulch, and suppliers often price or deliver material by weight as well as volume. That's why this
          calculator includes a built-in material weight estimator covering five of the most commonly ordered
          materials:
        </p>
        <p style={pStyle}>
          <strong>Concrete:</strong> Concrete is typically calculated by cubic yard for slabs, footings, and
          foundations. Because ready-mix concrete is usually sold in full cubic yard increments, getting an
          accurate volume figure helps avoid ordering a partial yard you don't need or falling short
          mid-pour.
        </p>
        <p style={pStyle}>
          <strong>Gravel:</strong> Gravel volume calculations matter for driveways, drainage beds, and base
          layers under pavers. Gravel is denser than most landscaping materials, so the weight estimate helps
          when a supplier quotes delivery by the ton rather than the yard.
        </p>
        <p style={pStyle}>
          <strong>Sand:</strong> Sand is commonly used under pavers, in playgrounds, or for leveling before
          laying sod or turf. Since sand compacts differently than loose soil, knowing both volume and
          estimated weight helps when budgeting for bulk delivery.
        </p>
        <p style={pStyle}>
          <strong>Topsoil:</strong> Topsoil calculations are essential for garden beds, lawn leveling, and
          raised planting areas. Because topsoil depth requirements vary widely by plant type, a few inches
          for lawns versus a foot or more for raised vegetable beds, this calculator makes it easy to test
          different depth scenarios before ordering.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Mulch:</strong> Mulch is typically applied at a shallower depth than soil or gravel, often
          just 2 to 3 inches. Because mulch is usually the most cost-sensitive material per cubic yard in a
          landscaping budget, an accurate calculation prevents both overspending on excess material and
          running short mid-project.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Sq Ft to Cubic Yards Calculator</h2>
        <p style={pStyle}>
          This tool solves a problem that comes up constantly across construction, landscaping, and home
          improvement projects:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Pouring a concrete slab or driveway.</strong> Contractors and DIYers alike need precise
            cubic yard figures before ordering ready-mix concrete, since ordering too little means a delayed
            pour and ordering too much means wasted money on unused material.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Building a gravel driveway or base layer.</strong> Gravel is often applied in multiple
            layers of different depths, and calculating each layer separately produces a more accurate total
            order than estimating the whole project at once.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Installing a mulch or garden bed.</strong> Homeowners refreshing garden beds each season
            need a quick way to figure out how many yards of mulch or topsoil to order without
            over-purchasing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Leveling a yard or laying new sod.</strong> Sand and topsoil calculations help determine
            how much fill material is needed to level uneven ground before installing sod, pavers, or turf.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Estimating material costs for a budget.</strong> Since most suppliers price by the cubic
            yard or by weight, having an accurate volume figure upfront makes it far easier to request quotes
            and compare pricing across multiple suppliers.
          </li>
          <li>
            <strong>Comparing supplier delivery quotes.</strong> Because some suppliers quote by weight and
            others by volume, the built-in weight estimator lets you convert between the two so you can
            compare quotes on equal terms.
          </li>
        </ul>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Ease of Use</h2>
        <p style={pStyle}>
          This calculator is free to use, requires no signup, and produces results with no hidden charges or
          premium tiers. It's designed to be used as often as needed, whether you're planning a single weekend
          landscaping project or estimating multiple phases of a larger construction job.
        </p>
        <p style={pStyle}>
          No data entered into this calculator is stored, the tool performs the calculation directly, and your
          inputs aren't saved, logged, or shared. Because everything runs instantly in the browser as you
          type, there's no waiting, no file uploads, and nothing to install.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The formula and unit conversions used in this calculator follow standard construction industry
          measurement conventions, and the material weight estimates are based on commonly referenced density
          figures for concrete, gravel, sand, topsoil, and mulch. As with any estimating tool, actual material
          density can vary slightly by supplier and product type, so it's worth confirming exact figures with
          your material supplier for large-scale or high-precision projects.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for More Accurate Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few practical habits make cubic yard estimates more reliable regardless of which calculator you
          use. Always round depth measurements up slightly rather than down, since running short on material
          mid-project is far more costly than having a small surplus. For irregularly shaped areas, break the
          space into smaller rectangular sections, calculate each one separately, and add the totals together
          rather than trying to average an odd shape into a single measurement. It's also worth adding a small
          buffer, typically 5 to 10 percent, to account for material compaction, spillage, or uneven ground,
          particularly with gravel and topsoil, which settle after placement.
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
