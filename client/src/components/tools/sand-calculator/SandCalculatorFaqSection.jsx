import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much sand do I need for a given area?",
    a: "Multiply the length, width, and depth of the area (converting all measurements to the same unit) to get the volume. This calculator does that conversion automatically and also returns the weight based on standard sand density, so you get both figures without doing the math by hand.",
  },
  {
    q: "How do I convert sand volume to weight?",
    a: "Multiply the volume by the bulk density of the sand type you're using, typically around 1,440 to 1,600 kg per cubic meter for standard construction sand. This calculator applies that conversion automatically once you enter your project dimensions.",
  },
  {
    q: "Is this sand calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no hidden charges.",
  },
  {
    q: "How much sand do I need for a concrete mix?",
    a: "The exact amount depends on your mix ratio, but you can use this calculator to determine the total sand volume required for the area or slab you're pouring, then apply your specific mix proportions to that figure.",
  },
  {
    q: "How much extra sand should I order to avoid running short?",
    a: "A buffer of around 10% on top of the calculated volume is a common practice, accounting for compaction, spillage, and minor measurement variance, particularly for base layers under pavers or patios.",
  },
  {
    q: "Does sand type affect how much I need?",
    a: "Yes. Different sand types, river sand, coarse sand, manufactured sand, and fine sand, have different densities and compaction behavior, which affects the weight figure for a given volume, even if the space you're filling stays the same.",
  },
  {
    q: "Can I calculate sand cost as well as volume?",
    a: "Yes, once the calculator returns your volume and weight, you can apply your local price per ton or price per cubic yard to get an instant cost estimate for the project.",
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

export default function SandCalculatorFaqSection() {
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
        <h2 style={h2Style}>Sand Calculator: Estimate Sand Volume, Weight, and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out exactly how much sand a project requires is one of those calculations that looks simple
          on paper but often goes wrong in practice, leading to wasted material or a second trip to the
          supplier. This sand calculator, available on <Link to="/" className="inline-home-link">Tolz</Link>,
          removes the guesswork by converting your project's length, width, and depth into a precise volume and
          weight, along with an instant cost estimate based on your local pricing. Whether you're pouring a
          concrete slab, filling a sandbox, laying a paver base, or bedding pipes for a drainage project, this
          tool gives you a reliable number to work from before you place an order.
        </p>
      </div>

      {/* What is / how it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Sand Calculator and How Does It Work</h2>
        <p style={pStyle}>
          A sand calculator is a purpose-built estimating tool that converts the physical dimensions of a space
          into the exact amount of sand needed to fill it. Instead of manually working through volume formulas
          and density conversions, you simply enter the length, width, and depth of the area, in whatever unit
          you're already measuring in, and the calculator returns the volume in cubic feet, cubic yards, or
          cubic meters, along with the corresponding weight in kilograms, pounds, or tons.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The weight conversion is where most manual estimates fall apart, because sand isn't a fixed-weight
          material. Its density changes depending on moisture content, grain size, and compaction, so a
          calculator that applies a realistic bulk density figure is far more dependable than a rough guess
          based on bag counts alone. This tool applies standard density assumptions used in construction
          estimating, giving you a weight figure that lines up closely with what a supplier will quote, and
          then layers a cost estimate on top based on either the weight or the volume you're purchasing.
        </p>
      </div>

      {/* Manual calculation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Sand Quantity Manually</h2>
        <p style={pStyle}>
          Understanding the underlying formula helps you sanity-check the calculator's output and adjust for
          unusual project shapes. The basic volume formula is:
        </p>
        <div style={formulaStyle}>Volume = Length × Width × Depth</div>
        <p style={pStyle}>
          If you're working in feet, this gives you cubic feet directly. Since sand is typically sold by the
          cubic yard or by the ton, you'll often need a second conversion step: divide cubic feet by 27 to get
          cubic yards, or multiply the volume by the sand's bulk density to get weight.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For an irregularly shaped area, an L-shaped patio base or a curved garden border, for example, the
          most accurate manual approach is to break the space into smaller rectangles or triangles, calculate
          each section separately, and add the volumes together. Depth is the measurement most people get
          wrong, since it's usually specified in inches for construction projects but needs to be converted to
          feet (divide by 12) before it's plugged into the formula. Skipping this conversion is the single most
          common reason manual sand estimates come out significantly too high or too low, and it's exactly the
          kind of error an automated calculator eliminates by handling the unit conversion internally.
        </p>
      </div>

      {/* Density */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Sand Density and Material Types</h2>
        <p style={pStyle}>
          Sand density is the variable that turns a volume calculation into a usable weight figure, and it
          isn't a single universal number. Dry, loose sand typically weighs less per cubic foot than damp or
          compacted sand, because moisture and compaction reduce the air gaps between grains. Construction
          estimators commonly use a bulk density figure in the range of roughly 1,440 to 1,600 kilograms per
          cubic meter (about 90 to 100 pounds per cubic foot) for standard building sand, though the exact
          figure shifts based on the type of sand involved.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Different sand types are suited to different jobs, and knowing which one applies to your project
          affects both the density assumption and the final order. River sand, valued for its rounded grains,
          is a common choice for concrete and plastering work. Coarse sand, sometimes called sharp sand, is
          preferred for structural concrete and bedding because its larger particles compact well and drain
          efficiently. Manufactured sand, or M-sand, produced by crushing rock, has become a widely used
          substitute in regions where natural river sand is regulated or scarce, and it typically carries a
          slightly different density profile than river sand. Fine sand, often used for masonry mortar joints
          or as a base beneath pavers, packs more tightly and can affect volume calculations if you're not
          accounting for compaction. If your project has specific structural requirements, it's worth
          confirming the exact density figure your supplier uses, since it can shift the final weight estimate
          by a meaningful margin on larger jobs.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Sand Calculator</h2>
        <p style={pStyle}>
          Sand estimation comes up across a wide range of projects, and getting the number right matters
          differently depending on the job. For concrete work, sand is a core ingredient in the mix alongside
          cement and aggregate, and an inaccurate sand estimate can throw off the entire batch ratio, affecting
          the strength and consistency of the finished concrete. Anyone mixing concrete on-site, whether for a
          foundation, footing, or driveway, needs a dependable sand volume figure before ordering materials.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Paver and patio installations rely on a compacted sand base layer beneath the pavers to provide a
          stable, even surface, and underestimating this layer is one of the most common reasons paved surfaces
          settle unevenly over time. Sandbox and playground projects need a straightforward volume-to-weight
          conversion, since these are typically ordered by the bag or by weight rather than by the yard.
          Drainage and pipe-bedding work uses sand as a cushioning layer around pipes to prevent shifting and
          damage, where consistent depth matters more than in most other applications. Landscaping projects,
          leveling uneven ground, building a beach-style yard feature, or backfilling around a retaining wall,
          also depend on accurate volume figures to avoid ordering multiple deliveries. In every one of these
          cases, calculating the volume and weight in advance means you can place a single, correctly sized
          order instead of guessing and adjusting mid-project.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Sand Cost by Weight or Volume</h2>
        <p style={pStyle}>
          Sand is priced differently depending on the supplier and the scale of the order, which is why this
          calculator provides cost estimates by both weight and volume. Smaller residential projects are often
          quoted by the ton or by the bag, while larger commercial deliveries are typically priced by the cubic
          yard or cubic meter. Once you've entered your project dimensions and the calculator has produced a
          volume and weight figure, you can apply your local price per ton or price per cubic yard to get an
          instant cost estimate for the entire job.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This dual approach matters because sand pricing varies significantly by region, driven by
          transportation distance, local availability, and the type of sand requested. A project quoted by
          weight in one area might be quoted by volume in another, and having both figures on hand means you
          can compare supplier quotes accurately regardless of how they structure their pricing. It also helps
          with budgeting on multi-material projects, where sand is one line item among several, since knowing
          the cost upfront avoids surprises when the final invoice arrives.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Avoid Under-Ordering or Over-Ordering Sand</h2>
        <p style={pStyle}>
          A common practice among contractors and experienced DIYers is to add a buffer of roughly 10% on top
          of the calculated volume to account for compaction, spillage, and minor measurement variance. This is
          particularly relevant for base layers under pavers or patios, where the sand settles and compacts
          once weight is applied to it, meaning the loose volume you order needs to be slightly higher than the
          finished, compacted depth suggests.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Measuring depth consistently across the entire area is another detail that's easy to overlook,
          especially on uneven ground where the depth might vary from one corner to another. Taking multiple
          depth measurements and averaging them produces a more reliable input than a single measurement taken
          at the most convenient spot. It's also worth checking whether your supplier sells sand by weight or by
          volume before finalizing an order, since converting between the two after the fact introduces
          additional rounding error. Running the numbers through the calculator with both a minimum and a
          slightly padded depth gives you a practical range to work with, rather than a single figure that
          assumes everything on-site goes exactly to plan.
        </p>
      </div>

      {/* Free / safe */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Sand Calculator Free and Safe to Use?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This sand calculator is completely free to use, with no signup, account creation, or hidden charges
          at any point. You can calculate sand volume, weight, and cost as many times as your project requires
          without providing any personal information. All calculations run directly based on the numbers you
          enter, and nothing about your project details is stored or shared. It's built to be a quick,
          dependable reference you can return to for every project without friction, whether you're estimating
          once for a small backyard job or repeatedly across multiple job-site orders.
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
