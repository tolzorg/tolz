import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much does it cost to build a DIY shed?",
    a: "Total cost depends on shed size, roof type, and material choices, since these determine your floor, wall, and roof area and the quantity of materials needed. Use the calculator with your planned dimensions and local material prices to get a personalized estimate rather than relying on a generic average.",
  },
  {
    q: "Is this shed cost calculator free to use?",
    a: "Yes, the DIY shed cost calculator on Tolz is completely free, with no signup or account required. You can use it as many times as needed to compare different sizes and roof styles.",
  },
  {
    q: "Which roof type is cheapest for a shed?",
    a: "Flat roofs generally use the least roofing material for a given footprint, followed by slanted roofs, with gable roofs typically requiring the most due to their two angled planes. Actual savings depend on your specific dimensions, rafter length, and overhang.",
  },
  {
    q: "Does the calculator include labor costs?",
    a: "No, the tool estimates material costs based on floor, wall, and roof area. Labor, permits, site preparation, and delivery fees are not included and should be budgeted separately.",
  },
  {
    q: "What is rafter overhang, and why does it matter for cost?",
    a: "Overhang is the portion of the roof that extends beyond the wall line, providing weather protection for the walls. Longer overhangs increase total roof area and therefore material cost, which is why the calculator lets you adjust this value.",
  },
  {
    q: "Can I use this tool for sheds other than storage sheds?",
    a: "Yes. The same floor, wall, and roof area calculations apply to workshops, garden sheds, backyard studios, or any small structure with similar wall and roof configurations.",
  },
  {
    q: "Do I need to create an account to save my results?",
    a: "No account is needed to use the calculator. Since no data is stored, it's best to note down or screenshot your results if you want to reference them later.",
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

export default function DiyShedCostCalculatorFaqSection() {
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
    name: "DIY Shed Cost Calculator",
    url: "https://www.tolz.org/calculators/construction/diy-shed-cost",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web-based)",
    description: "Free online tool to calculate the floor, wall, and roof area of a DIY shed and estimate total material cost. Supports slanted, flat, and gable roof types with rafter length and overhang.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>DIY Shed Cost Calculator: Estimate Your Shed's Material Costs Instantly</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Planning a backyard shed doesn't have to start with guesswork on lumber runs and material invoices.
          This DIY shed cost calculator, available free on <Link to="/" className="inline-home-link">Tolz</Link>,
          gives you an instant breakdown of your shed's floor, wall, and roof area along with an estimated total
          material cost, before you buy a single board. Whether you're sketching plans for a garden shed, a
          workshop, or extra storage space, this tool turns your measurements into a clear cost picture in
          seconds, so you can budget accurately and avoid over-ordering or underestimating materials.
        </p>
      </div>

      {/* Why you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Need a Shed Cost Calculator</h2>
        <p style={pStyle}>
          Building a shed looks simple on paper, but material costs add up quickly once you factor in framing
          lumber, sheathing, roofing, and siding, and most people underestimate at least one of these
          categories. A few real scenarios where this calculator becomes genuinely useful:
        </p>
        <p style={pStyle}>
          <strong>You're comparing shed sizes before committing to a design.</strong> A 10x12 shed and a 12x16
          shed don't just differ in floor space, the wall and roof area scale differently depending on height
          and roof style, which changes the material list substantially. Running a few sizes through the
          calculator shows you exactly how cost scales with dimensions, rather than relying on a rough
          per-square-foot guess.
        </p>
        <p style={pStyle}>
          <strong>You're deciding between roof styles.</strong> A gable roof adds more surface area and rafter
          length than a flat roof of the same footprint, which directly affects sheathing and roofing costs. If
          you're torn between a classic gable look and a simpler flat or slanted roof, calculating both gives
          you a real cost comparison instead of an assumption.
        </p>
        <p style={pStyle}>
          <strong>You're preparing a materials budget before visiting a lumber yard or home improvement
          store.</strong> Contractors and suppliers price by quantity, so knowing your approximate square
          footage for walls, floor, and roof ahead of time helps you request accurate quotes and avoid
          last-minute budget surprises mid-build.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>You're a DIYer building for the first time and need a sanity check.</strong> First-time shed
          builders often either over-buy materials out of caution or under-order and end up on a second
          hardware store trip. A clear area and cost estimate removes much of that uncertainty.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the DIY Shed Cost Calculator Works</h2>
        <p style={pStyle}>
          The calculator asks for your shed's core dimensions, length, width, and wall height, along with your
          chosen roof type. From there, it calculates three separate areas:
        </p>
        <p style={pStyle}>
          <strong>Floor area</strong> is straightforward length multiplied by width, giving you the base
          footprint of the shed and the starting point for flooring material calculations.
        </p>
        <p style={pStyle}>
          <strong>Wall area</strong> is calculated using the perimeter of the shed multiplied by the wall
          height, accounting for all four walls. This figure determines how much siding, sheathing, and framing
          material you'll need to enclose the structure.
        </p>
        <p style={pStyle}>
          <strong>Roof area</strong> is where the calculation gets more nuanced, since it depends entirely on
          which roof type you select. The tool accounts for rafter length and overhang so the roof area
          reflects real-world coverage, not just a flat projection of the footprint, which matters because
          roofing material is typically sold by actual covered area, not floor area.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once these three areas are calculated, the tool applies your material cost inputs to generate a total
          estimated material cost for the project, giving you a single number to work from when budgeting.
        </p>
      </div>

      {/* Roof types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Roof Types Supported: Gable, Flat, and Slanted</h2>
        <p style={pStyle}>
          Roof design has one of the biggest impacts on total shed material cost, which is why this calculator
          supports three common configurations rather than a single generic estimate.
        </p>
        <p style={pStyle}>
          <strong>Gable roofs</strong> are the traditional two-sided, peaked roof style. They offer better water
          runoff and more headroom inside the shed, but the two angled roof planes mean more total roofing
          surface area than the footprint alone would suggest. The calculator factors in rafter length to
          capture this additional coverage accurately.
        </p>
        <p style={pStyle}>
          <strong>Flat roofs</strong> have a single, level (or nearly level) plane. They're simpler to build and
          typically require less roofing material than a gable design of the same footprint, making them a
          popular choice for budget-conscious builds or modern-style sheds. The tradeoff is water drainage,
          which is usually managed with a slight pitch rather than a true flat surface.
        </p>
        <p style={pStyle}>
          <strong>Slanted (skillion) roofs</strong> use a single sloped plane, higher on one side than the
          other. They combine some of the drainage benefits of a gable roof with the simpler construction of a
          flat roof, and their material usage typically falls between the two depending on the slope angle and
          rafter length chosen.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because rafter length and overhang directly affect how far the roof material extends beyond the wall
          line, the calculator includes these as adjustable inputs, a detail many basic online estimators skip,
          but one that can meaningfully shift your roofing material total, especially for larger sheds or
          steeper pitches.
        </p>
      </div>

      {/* What affects cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Affects Your Total Shed Material Cost</h2>
        <p style={pStyle}>
          Several variables influence the final number beyond square footage alone. Understanding them helps
          you interpret the calculator's output and adjust your plans if needed.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Framing lumber</strong> forms the skeleton of the shed, wall studs, top and bottom plates,
            and roof rafters. Larger sheds or taller walls require more linear feet of framing, which scales
            with your wall area input.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Sheathing and siding</strong> cover the framed walls and directly correlate with your
            calculated wall area. Material choice here (plywood, OSB, or finished siding panels) can shift cost
            significantly even at the same square footage.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Roofing material</strong> is priced by covered area, which is why the calculator's
            roof-type-specific calculation matters. Steeper pitches and larger overhangs increase the actual
            material needed beyond the simple footprint.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Flooring material</strong> depends on your floor area calculation and whether you're
            building a raised platform floor or a simpler ground-level base.
          </li>
          <li>
            <strong>Fasteners, trim, and hardware</strong> are smaller line items individually but add up
            across a full build, most builders budget a small percentage on top of core material costs to
            cover these.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Since lumber and material prices vary by region, supplier, and current market conditions, the
          calculator is designed to work with the cost inputs you provide, giving you a personalized estimate
          rather than a fixed national average that may not reflect your local pricing.
        </p>
      </div>

      {/* Accuracy / privacy / cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost - What to Expect</h2>
        <p style={pStyle}>
          This calculator is completely free to use, with no signup, account creation, or hidden charges
          required. You can run as many size and roof combinations as you need to compare options before
          finalizing your plans.
        </p>
        <p style={pStyle}>
          No project details, dimensions, or cost figures you enter are stored or shared, all calculations
          happen directly in your browser session, so your shed plans stay private. There's nothing to
          download, install, or upload, making it a quick reference tool you can return to anytime during the
          planning process.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth noting that this tool provides a material cost estimate based on area calculations and the
          pricing figures you input, it does not account for labor costs, permit fees, site preparation, or
          regional material price fluctuations. For the most accurate budget, use the calculator's area outputs
          alongside current local pricing from your preferred supplier.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Reduce DIY Shed Building Costs</h2>
        <p style={pStyle}>A few practical adjustments can lower your total material cost without compromising the build:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            Choosing a flat or slanted roof over a gable design reduces roofing material needs for the same
            footprint, since there's less total surface area to cover.
          </li>
          <li style={{ marginBottom: 8 }}>
            Standardizing your shed dimensions to common lumber lengths (like multiples of 8 feet) reduces
            waste from cutting down full boards, which often gets overlooked in rough estimates.
          </li>
          <li style={{ marginBottom: 8 }}>
            Reducing roof overhang slightly, where local building codes allow, trims both rafter length and
            roofing material without significantly affecting weather protection.
          </li>
          <li style={{ marginBottom: 8 }}>
            Buying siding and sheathing in bulk sheet sizes that match your calculated wall area minimizes
            offcuts and leftover material.
          </li>
          <li>
            Running your dimensions through the calculator at a slightly smaller size, even a foot narrower or
            shorter, can reveal meaningful savings, since wall and roof area scale with perimeter and footprint,
            not just one dimension.
          </li>
        </ul>
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
