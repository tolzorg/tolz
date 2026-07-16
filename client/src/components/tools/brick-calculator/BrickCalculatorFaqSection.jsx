import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many bricks do I need for a wall?",
    a: "The number depends on your wall's area (length x height), the brick size you're using, and the mortar joint thickness. As a rough reference, a single-layer wall using standard-size bricks with a 10mm mortar joint typically needs around 50–60 bricks per square meter, but this figure shifts with different brick dimensions. Enter your specific measurements into the calculator above for an exact count.",
  },
  {
    q: "What's the difference between a single wall and double wall brick calculation?",
    a: "A single wall uses one layer of bricks, while a double wall (cavity wall) uses two layers, roughly doubling the brick and mortar requirement. Double walls are standard for exterior, load-bearing, or insulated structures.",
  },
  {
    q: "Does this calculator include mortar quantities, or just bricks?",
    a: "It includes both. Alongside the total brick count, the tool calculates the cement, sand, and water needed for the mortar based on your wall dimensions and mortar joint thickness.",
  },
  {
    q: "Is the brick calculator free to use?",
    a: "Yes, it's completely free with no hidden charges or premium features, and no signup is required to access any part of it.",
  },
  {
    q: "How accurate is the brick calculator's cost estimate?",
    a: "The cost estimate is as accurate as the pricing information you enter for bricks, cement, and sand. Since material prices vary by region and supplier, the tool calculates costs based on your specific input figures rather than a fixed average.",
  },
  {
    q: "Does the calculator account for wastage or breakage?",
    a: "Standard estimation practice includes a wastage allowance of roughly 5–10% to cover cutting, breakage, and handling losses, which is reflected in the calculation logic.",
  },
  {
    q: "Can I use this calculator for different brick sizes?",
    a: "Yes, you can input custom brick dimensions instead of relying on a default size, which is useful since brick sizes vary by region, manufacturer, and brick type (standard, modular, or engineering bricks).",
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
const olStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function BrickCalculatorFaqSection() {
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
        <p style={pStyle}>
          Planning a construction project starts with knowing exactly what materials you need, and that's
          precisely what this brick calculator is built for. Whether you're a homeowner budgeting for a garden
          wall, a contractor quoting a client, or a student working through a masonry assignment, this tool
          from Tolz removes the guesswork from brickwork estimation. Instead of manually working through area
          formulas and mortar ratios, you enter your wall dimensions and get an instant, accurate breakdown of
          bricks, cement, sand, and water, along with an estimated total cost.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Brick estimation might look simple on the surface, but small errors compound quickly on real job
          sites. Under-ordering means work stoppages and delayed deliveries; over-ordering ties up money in
          materials you don't need. This calculator is designed to eliminate both problems by applying the
          same standard area formula that professional estimators use, adjusted for your specific wall type,
          brick size, and mortar joint thickness.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Brick Calculator Works</h2>
        <p style={pStyle}>
          The tool is built around the standard brick wall estimation formula used across the construction
          industry. At its core, the calculation divides the total wall area by the effective area of a
          single brick, including the mortar joint around it. Here's the logic in plain terms:
        </p>
        <p style={pStyle}>
          First, the calculator determines the wall's surface area by multiplying length by height. Next, it
          accounts for the actual brick dimensions you specify, since brick sizes vary by region and
          manufacturer, standard bricks in many markets run around 9 x 4.5 x 3 inches, but modular,
          engineering, and regional bricks differ. The tool then adds the mortar joint thickness (commonly
          10mm) to each brick's dimensions, because mortar occupies real space in the wall and directly
          affects how many bricks fit into a given area.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once the effective brick area (brick plus mortar joint) is established, the total wall area is
          divided by this figure to produce the number of bricks required. For double walls, sometimes called
          cavity walls or two-layer walls, the calculation doubles the brick requirement per unit area to
          reflect the additional layer, while still accounting for the cavity gap where relevant. A wastage
          allowance, typically 5–10%, is also factored in to cover breakage, cutting, and on-site handling
          losses that occur on virtually every project.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Step-by-Step: How to Use This Tool</h2>
        <p style={pStyle}>Using the calculator takes less than a minute:</p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter your wall dimensions</strong> — input the length and height of the wall you're
            building, in your preferred unit.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Select wall type</strong> — choose single wall (one brick layer) or double wall (two
            layers, common for load-bearing or exterior walls).
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Specify brick size</strong> — enter the dimensions of the bricks you're using, or use the
            standard default if you're unsure.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Set mortar joint thickness</strong> — the standard is around 10mm, but you can adjust this
            based on your project specifications.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Add cost inputs (optional)</strong> — enter the price per brick and cost per bag of cement
            or unit of sand if you want a full cost estimate alongside the material quantities.
          </li>
          <li>
            <strong>Get instant results</strong> — the calculator displays the total number of bricks needed,
            along with a full mortar material breakdown and, if cost data was entered, an estimated total
            project cost.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          There's no signup, no account creation, and no software to install. You get results the moment you
          input your numbers.
        </p>
      </div>

      {/* Mortar breakdown */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mortar Material Breakdown: Cement, Sand & Water</h2>
        <p style={pStyle}>
          Bricks alone don't build a wall, mortar holds everything together, and estimating it accurately
          matters just as much as counting bricks. This calculator automatically works out the mortar
          quantities based on the volume of mortar joints in your wall, using a standard mix ratio (commonly
          1:6 cement to sand for general brickwork, though this can be adjusted for structural applications).
        </p>
        <p style={pStyle}>
          The process works like this: once the tool knows how many bricks are needed and the joint thickness
          between them, it calculates the total volume of mortar required to fill those joints across the
          entire wall. That volume is then converted into practical quantities, how many bags of cement, how
          much sand (usually measured in cubic feet or cubic meters), and how much water is needed to mix a
          workable batch. Water quantity is typically estimated as a percentage of the cement weight, since
          too much water weakens the mortar's bonding strength while too little makes it unworkable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This breakdown matters because mortar is often under-ordered on smaller projects, leading to
          mid-project delays while more cement or sand is sourced. Having cement, sand, and water quantities
          calculated together with the brick count means you can place a single, complete material order
          instead of estimating each component separately.
        </p>
      </div>

      {/* Cost estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Cost Estimation: Know Your Budget Before You Build</h2>
        <p style={pStyle}>
          Beyond material quantities, this calculator provides a total cost estimate when you input pricing
          information. This is particularly useful during the planning and budgeting phase of a project,
          before you've committed to a supplier or finalized your construction budget.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The cost calculation combines the total brick count multiplied by your entered price per brick, plus
          the mortar material costs based on cement and sand pricing you provide. Because material prices vary
          significantly by region, supplier, and market conditions, the calculator uses whatever pricing
          figures you enter rather than fixed defaults, keeping your estimate accurate to your local market
          rather than a generic average. This feature is especially valuable for comparing scenarios. You can
          quickly test how switching from a single wall to a double wall affects your budget, or see how a
          change in brick size influences total cost, without manually recalculating each time.
        </p>
      </div>

      {/* Single vs double */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Single Wall vs. Double Wall: Which Do You Need?</h2>
        <p style={pStyle}>
          One of the most common points of confusion in brick estimation is the difference between single and
          double wall construction, and getting this wrong throws off every downstream calculation.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A single wall (also called a single-skin or half-brick wall) uses one layer of bricks and is
          typically used for internal partition walls, garden walls, or non-load-bearing structures where full
          structural strength isn't required. A double wall (cavity wall or full-brick wall) uses two layers
          of bricks, often with a gap or cavity between them, and is standard for exterior walls, load-bearing
          structures, and buildings that need better thermal insulation and structural strength. Selecting the
          correct wall type in the calculator isn't a minor detail, it roughly doubles the brick and mortar
          quantities, so confirming this with your building plans or a structural reference before calculating
          is worth the extra minute.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Brick Calculator: Practical Scenarios</h2>
        <p style={pStyle}>This tool is useful across a wide range of real-world situations:</p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Homeowners planning a DIY project</strong> — building a garden wall, boundary fence, or
            backyard barbecue structure, benefit from knowing exact material needs before a hardware store
            trip, avoiding multiple visits for missed quantities.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Contractors preparing quotes</strong> — quickly generating accurate material estimates for
            client proposals saves time compared to manual calculations, especially when quoting multiple wall
            configurations for the same project.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Self-builders and renovators</strong> — anyone extending a property, adding a boundary
            wall, or repairing damaged brickwork needs a reliable material count before ordering, since bulk
            brick orders are costly to return or exchange.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Construction students and apprentices</strong> — learning how brick estimation formulas
            work in practice, this tool doubles as a way to verify manual calculations and understand how wall
            type and brick size affect final quantities.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Budget planning before a project starts</strong> — getting a realistic cost picture before
            committing to a construction loan, savings withdrawal, or contractor agreement helps set accurate
            expectations early.
          </li>
          <li>
            <strong>Site supervisors ordering materials</strong> — confirming quantities mid-project when wall
            dimensions change or additional sections are added avoids under-ordering delays.
          </li>
        </ul>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy & Cost: What You Should Know</h2>
        <p style={pStyle}>
          This brick calculator is completely free to use, with no hidden charges, subscription requirements,
          or premium tiers, the full tool, including the mortar breakdown and cost estimation features, is
          available without payment.
        </p>
        <p style={pStyle}>
          No signup or account creation is required. You can use the calculator immediately without providing
          an email address, creating a password, or completing any registration step. Your wall dimensions,
          material choices, and cost inputs are used only to generate your results and are not stored or tied
          to any personal profile.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, the calculator applies standard, widely used construction estimation formulas. However,
          real-world material needs can vary slightly based on brick manufacturer tolerances, actual mortar
          mix ratios used on site, wastage from cutting or breakage, and regional construction practices. For
          that reason, we recommend using the calculator's output as a strong planning estimate and adding
          your own buffer for large or structurally critical projects, and confirming final quantities with a
          site supervisor or structural engineer where the project scope requires it.
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
