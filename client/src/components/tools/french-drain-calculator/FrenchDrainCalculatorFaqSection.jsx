import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much gravel do I need for a French drain?",
    a: "It depends on your trench width, depth, and length, minus the volume the pipe displaces. For a typical 100-foot trench that's 12 inches wide and 18 inches deep with a 4-inch pipe, expect roughly 4 to 5 cubic yards of gravel after accounting for pipe displacement. Enter your exact measurements into the calculator above for a precise figure.",
  },
  {
    q: "What is the standard width and depth for a French drain trench?",
    a: "Most residential yard drains use a trench 6 to 12 inches wide and 12 to 24 inches deep. Foundation or footing drains are typically deeper to sit below the frost line or footing level, often 18 to 24 inches or more depending on local building codes.",
  },
  {
    q: "Should I use Schedule 40 or SDR35 pipe for my French drain?",
    a: "Schedule 40 has a thicker wall and higher load rating, making it the better choice under driveways or areas with vehicle traffic. SDR35 is thinner-walled and more cost-effective for standard yard or foundation drains that stay below grade without surface loading.",
  },
  {
    q: "Do I need filter fabric for a French drain?",
    a: "Filter fabric isn't strictly required, but it significantly extends the life of the system by keeping fine soil particles from washing into the gravel and clogging the pipe's perforations. Most installers wrap the entire gravel-and-pipe assembly in non-woven geotextile fabric.",
  },
  {
    q: "What slope does a French drain need?",
    a: "A minimum slope of about 1%, roughly 1 inch of drop for every 8 to 10 feet of trench length, is generally recommended so water flows consistently toward the outlet instead of pooling in low points along the pipe.",
  },
  {
    q: "Is this French drain calculator free to use?",
    a: "Yes. The calculator is completely free, requires no signup, and doesn't store any of the measurements or details you enter.",
  },
  {
    q: "Can this calculator estimate the total project cost, not just materials?",
    a: "It provides a cost estimate based on the gravel volume, pipe length, and optional fabric coverage you select, giving you a solid budget baseline. Labor costs and regional material pricing will still vary, so treat the figure as a planning estimate rather than a final quote.",
  },
  {
    q: "How is the gravel volume different from the total trench volume?",
    a: "Total trench volume is simply length × width × depth. Gravel volume is smaller because it subtracts the space the pipe itself occupies, giving you the actual amount of aggregate you need to purchase rather than the full excavated volume.",
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

export default function FrenchDrainCalculatorFaqSection() {
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
        <h2 style={h2Style}>French Drain Calculator: Estimate Trench Volume, Gravel, and Pipe Length</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Standing water along a foundation, a soggy patch of lawn that never dries out, or a retaining wall
          showing signs of hydrostatic pressure, these are the moments a French drain earns its keep. Before
          anyone breaks ground, though, there's a question that trips up even experienced landscapers: how much
          gravel, pipe, and excavation will this actually take? This calculator, built by{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, removes the guesswork by turning your trench
          dimensions into an exact material list, so you can order the right amount the first time instead of
          making a second trip to the supply yard.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This French Drain Calculator Does</h2>
        <p style={pStyle}>
          A French drain is a simple system in concept, a sloped trench, a layer of gravel, a perforated pipe,
          and often a fabric liner, but the material quantities behind it are anything but simple to eyeball.
          This tool takes your trench width, depth, and length, then calculates three things that matter most
          before you start digging: total trench volume, the length of perforated drain pipe required, and the
          net volume of gravel needed once the space taken up by the pipe itself is subtracted out. It also
          gives an instant cost estimate based on typical material pricing, so you have a budget figure before
          you commit to a supplier.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unlike a rough mental estimate, the calculator accounts for pipe displacement, the volume the pipe
          occupies inside the trench that gravel does not need to fill. Skipping this step is one of the most
          common reasons people over-order gravel by a noticeable margin on longer runs. The tool also lets you
          choose between Schedule 40 and SDR35 pipe and toggle an optional fabric filter layer, so the output
          reflects the specific system you're planning to install rather than a generic average.
        </p>
      </div>

      {/* Inputs */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Trench Width, Depth, and Length Inputs</h2>
        <p style={pStyle}>The calculator only needs three core measurements to produce accurate results:</p>
        <p style={pStyle}>
          <strong>Trench length</strong> is the total run of the drain from its starting point to the outlet.
          Measure along the planned path, including any gentle curves, rather than a straight-line distance
          between two points.
        </p>
        <p style={pStyle}>
          <strong>Trench width</strong> is typically between 6 and 12 inches for residential yard drainage,
          though foundation and footing drains sometimes run wider to accommodate a larger pipe and more gravel
          coverage. Enter the width you intend to excavate, not the pipe diameter.
        </p>
        <p style={pStyle}>
          <strong>Trench depth</strong> usually falls between 12 and 24 inches for standard yard drains, and
          deeper for footing drains that need to sit below a foundation's frost line or slab edge. Depth
          affects both the gravel volume and the excavation total, so it's worth confirming your local frost
          depth requirement before finalizing this number, especially in colder climates where digging shallow
          can lead to freeze-related pipe damage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once these three values are entered, the calculator immediately returns trench volume, pipe length,
          gravel volume, and an estimated cost, all without needing to open a separate spreadsheet or do manual
          conversions between cubic feet and cubic yards.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Calculation Works: Trench Volume, Pipe Length, and Gravel</h2>
        <p style={pStyle}>
          Understanding the math behind the output helps you sanity-check the numbers and adjust confidently if
          your site conditions change.
        </p>
        <p style={pStyle}>
          <strong>Trench volume</strong> is calculated as length × width × depth, giving you the total
          excavated space in cubic feet before any materials go back in. This figure is useful on its own if
          you're hiring excavation separately from drainage installation, since contractors often quote by
          cubic yard of soil removed.
        </p>
        <p style={pStyle}>
          <strong>Pipe length</strong> typically matches your entered trench length directly, since the
          perforated pipe runs the full length of the drain from the collection point to the outlet. The
          calculator factors in your selected pipe type, Schedule 40 or SDR35, because outer diameter varies
          slightly between the two, which in turn affects how much gravel volume the pipe displaces.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Gravel volume</strong> is the number most people actually came here for. The calculator takes
          the total trench volume and subtracts the volume displaced by the pipe (calculated from the pipe's
          outer diameter and length), leaving the net cubic footage of gravel or drain rock needed to properly
          surround and cover the pipe. This total is then converted to cubic yards, which is how most gravel
          suppliers price and deliver material. Ordering by the calculator's net figure, rather than the raw
          trench volume, is what prevents the common mistake of paying for gravel that was never going to fit
          once the pipe was in place.
        </p>
      </div>

      {/* Pipe types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Schedule 40 vs SDR35 Pipe: Which One Changes Your Numbers</h2>
        <p style={pStyle}>
          The pipe type you select isn't just a checkbox, it changes the physical dimensions the calculator
          uses, which shifts your gravel total slightly.
        </p>
        <p style={pStyle}>
          <strong>Schedule 40 PVC</strong> is a thicker-walled pipe rated for higher pressure and load-bearing
          situations, commonly used where the drain runs under a driveway, patio, or any area that will see
          vehicle or heavy foot traffic overhead. Its added wall thickness gives it a marginally larger outer
          diameter for the same nominal size compared to SDR35.
        </p>
        <p style={pStyle}>
          <strong>SDR35 pipe</strong> has a thinner wall relative to its diameter and is standard for most
          residential yard and foundation drains that won't bear significant surface load. It's typically the
          more economical choice for straightforward lawn or basement perimeter drainage where the pipe stays a
          foot or more below grade and isn't under a driving surface.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Choosing the correct type in the calculator ensures the pipe displacement used in the gravel
          calculation matches what you'll actually be installing, keeping the material estimate accurate rather
          than approximate.
        </p>
      </div>

      {/* Filter fabric */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Role of Filter Fabric in Your Estimate</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Toggling the optional fabric filter setting reflects a decision most installers make anyway: wrapping
          the gravel and pipe assembly in non-woven geotextile fabric to keep fine soil particles from
          migrating into the gravel and clogging the system over time. This is sometimes called the "burrito
          method," where the fabric lines the trench, the pipe and gravel go inside, and the fabric folds back
          over the top before backfilling. While fabric doesn't change your gravel or pipe totals, including it
          in your planning affects the overall project cost and materials list, which is why the calculator
          lets you factor it into the cost estimate directly rather than requiring a separate calculation.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Instant Cost Estimation</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once your trench dimensions, pipe type, and fabric selection are set, the calculator produces a cost
          estimate based on the resulting gravel volume, pipe length, and fabric coverage. This gives you a
          working budget figure to compare against contractor quotes or to plan a DIY materials run, without
          needing to price out gravel per yard and pipe per foot separately and add it up by hand. Because
          pricing varies by region and supplier, treat the figure as a solid planning baseline and confirm
          final numbers with your local supply yard before purchasing.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a French Drain Calculator</h2>
        <p style={pStyle}>
          <strong>Planning a DIY yard drainage project.</strong> Homeowners dealing with a low spot that pools
          water after rain, or a lawn area that stays soft and muddy for days, often turn to a shallow French
          drain to redirect surface water toward a daylight outlet or dry well. Knowing the gravel and pipe
          totals upfront means one trip to the supply store instead of two or three.
        </p>
        <p style={pStyle}>
          <strong>Protecting a foundation from hydrostatic pressure.</strong> A basement or crawlspace with
          damp walls or minor seepage often points to groundwater building up against the foundation. A
          footing-level French drain, installed deeper and often paired with Schedule 40 pipe under
          load-bearing areas, requires more precise volume planning since the depth and pipe type both shift
          materially.
        </p>
        <p style={pStyle}>
          <strong>Bidding or quoting a landscaping job.</strong> Contractors estimating drainage work for a
          client benefit from a fast, repeatable way to generate accurate material lists across multiple trench
          configurations, especially when comparing a standard yard drain against a heavier-duty footing drain
          in the same proposal.
        </p>
        <p style={pStyle}>
          <strong>Budgeting before a retaining wall or hardscape project.</strong> Retaining walls almost always
          need drainage behind them to relieve water pressure. Calculating the gravel and pipe needs early lets
          that cost get folded into the overall project budget instead of surfacing as a surprise mid-build.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Comparing pipe types before purchasing.</strong> Someone deciding between Schedule 40 and
          SDR35 for a specific application can run both scenarios through the calculator to see the actual
          difference in gravel volume and total cost before committing to a supplier order.
        </p>
      </div>

      {/* Accuracy / privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Trust, and Data Privacy</h2>
        <p style={pStyle}>
          This calculator is free to use, requires no signup or account creation, and runs entirely with the
          numbers you enter, no measurements, project details, or personal information are stored or shared.
          The calculations rely on straightforward, transparent geometry (trench volume minus pipe
          displacement, converted to standard supplier units), so the output is consistent and repeatable
          rather than a black-box estimate. There are no hidden charges, download limits, or watermarks on the
          results; you can run as many trench configurations as your project needs, compare pipe types side by
          side, and walk away with numbers you can hand directly to a supplier or contractor.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That said, the tool is a planning aid, not a substitute for local code review. Frost depth
          requirements, minimum slope regulations, and setback rules from property lines all vary by
          municipality, so confirm those specifics with local building guidelines before finalizing trench
          depth and placement.
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
