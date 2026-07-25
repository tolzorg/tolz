import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many studs do I need for a 10-foot wall at 16″ OC?",
    a: "A 10-foot (120-inch) wall at 16″ OC requires 9 studs: 120 ÷ 16 = 7.5, rounded up to 8, plus one additional starting stud.",
  },
  {
    q: "What's the difference between 16″, 19.2″, and 24″ OC spacing?",
    a: "The numbers refer to the distance between the centers of adjacent studs. 16″ OC is the standard for most load-bearing residential walls, 19.2″ OC is used with certain engineered lumber and code-approved applications, and 24″ OC is generally limited to non-load-bearing partitions or advanced framing designs.",
  },
  {
    q: "Does this framing calculator account for doors and windows?",
    a: "The base calculation covers the standard run of a wall. Rough openings for doors and windows require additional king studs, jack studs, cripple studs, and headers, which should be added on top of the calculator's baseline count.",
  },
  {
    q: "Is 24″ OC spacing strong enough for a load-bearing wall?",
    a: "It depends on local building codes, the structural load, and the lumber species and grade used. Many jurisdictions restrict 24″ OC to non-load-bearing walls unless an engineer has approved the design, so always confirm with your local building department before framing.",
  },
  {
    q: "How much waste percentage should I add to my stud count?",
    a: "A 10 to 15 percent waste allowance is typical for simple, uninterrupted wall runs. Walls with multiple corners, angles, or openings often warrant a higher allowance, closer to 15 to 20 percent, to account for additional cut-offs.",
  },
  {
    q: "Do I need to create an account to use this framing calculator?",
    a: "No. The tool is free to use with no signup, no login, and no hidden fees. Enter your wall length and spacing to get an instant result.",
  },
  {
    q: "Can I use this calculator for metal stud framing?",
    a: "The stud-count formula is based on spacing math that applies to both wood and metal studs, since both follow the same on-center principle. However, waste percentages and pricing inputs should be adjusted to reflect metal stud costs and cutting practices, which differ from wood.",
  },
  {
    q: "Should I use 2×4 or 2×6 studs for my wall?",
    a: "2×4 studs are standard for most non-load-bearing interior walls, while 2×6 studs are common on exterior or load-bearing walls, or where extra wall depth is needed for insulation or plumbing. The stud count itself is based on spacing, not lumber size, so you can run the same calculation and simply update your price-per-stud input for whichever dimension you're buying.",
  },
  {
    q: "Why does the calculator add one extra stud to my count?",
    a: "Every wall needs a stud at its starting edge in addition to the studs spaced out across its length. Dividing wall length by OC spacing tells you how many spacing intervals fit into the wall, but you still need one more stud to mark the beginning of the first interval, which is why that extra stud is added to the total.",
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

export default function FramingCalculatorFaqSection() {
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
    name: "Framing Calculator",
    url: "https://www.tolz.org/calculators/construction/framing",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web-based)",
    description: "A free online framing calculator that determines the number of wall studs needed based on wall length and on-center (OC) spacing (16\", 19.2\", or 24\"), including waste allowance and estimated material cost.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free Framing Calculator: Calculate Wall Studs, Spacing, and Material Cost</h2>
        <p style={pStyle}>
          Framing a wall looks simple until you're standing at the lumber yard trying to figure out exactly how
          many studs to buy. Get the count wrong and you're either making a second trip or paying for lumber
          you'll never use. The framing calculator on <Link to="/" className="inline-home-link">Tolz</Link>
          {" "}removes that guesswork by turning your wall length and chosen on-center spacing into an exact
          stud count, along with a waste allowance and an estimated material cost, in seconds.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This page explains how the calculator works, how the underlying math is derived, and how to read the
          results so you can walk into your next framing job with numbers you can actually rely on.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Framing Calculator Does and How to Use It</h2>
        <p style={pStyle}>
          The tool takes two core inputs: your wall length and your on-center (OC) spacing preference. Enter
          the length of the wall in feet or inches, choose between standard 16″, 19.2″, or 24″ OC spacing, and
          the calculator instantly returns the number of studs required, factoring in the end studs on both
          sides of the wall. From there, it layers in a waste percentage to account for cut-offs, damaged
          boards, and layout errors, then multiplies the adjusted stud count by your entered price per stud to
          give you a total estimated cost.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's no need to manually count studs on a tape measure or run the spacing formula by hand. You get
          a ready-to-use number for ordering lumber, whether you're framing a single interior partition or
          estimating material for an entire addition.
        </p>
      </div>

      {/* OC spacing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding On-Center (OC) Spacing: 16″, 19.2″, and 24″</h2>
        <p style={pStyle}>
          On-center spacing refers to the distance measured from the center of one stud to the center of the
          next, not the gap between them. This distinction matters because it's the number contractors,
          inspectors, and lumber suppliers all reference, and it's the standard the calculator uses internally.
        </p>
        <p style={pStyle}>
          <strong>16″ OC</strong> is the most common spacing for residential wall framing in the United States.
          It offers a strong balance of structural support and material efficiency, and it lines up cleanly
          with standard 4×8 sheet goods like drywall and plywood, since 48 inches divides evenly into three
          16-inch sections.
        </p>
        <p style={pStyle}>
          <strong>19.2″ OC</strong> shows up less often but is still code-compliant in many jurisdictions for
          non-load-bearing and some load-bearing applications, particularly with engineered lumber like
          I-joists. It reduces the number of studs needed compared to 16″ OC, which can lower material costs on
          larger projects, though it's worth confirming compatibility with local building codes before relying
          on it.
        </p>
        <p style={pStyle}>
          <strong>24″ OC</strong> is typically reserved for non-load-bearing partition walls or advanced
          framing techniques designed to reduce lumber use and improve insulation performance. It uses the
          fewest studs of the three options but isn't appropriate for every structural situation, so it's
          important to know whether your wall is load-bearing before choosing this spacing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Selecting the correct OC spacing in the calculator isn't just about getting a stud count, it directly
          affects whether your finished wall meets local building code requirements, so always verify spacing
          rules with your local building department before finalizing a framing plan.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Stud Count Formula Works</h2>
        <p style={pStyle}>
          The math behind the framing calculator follows a standard construction industry formula: divide the
          wall length in inches by the OC spacing, then add one additional stud to account for the starting
          stud at the beginning of the wall. For example, a 10-foot wall (120 inches) framed at 16″ OC works
          out to 120 ÷ 16 = 7.5, rounded up to 8, plus one starting stud, for a total of 9 studs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This baseline formula assumes a straightforward, uninterrupted wall run. Real walls, of course,
          include doors, windows, and corners, each of which typically requires additional framing members such
          as king studs, jack studs, cripple studs, and headers around rough openings. The calculator's stud
          count reflects the standard run of the wall itself; openings and corners should be added on top of
          that base number, which is exactly why the built-in waste allowance exists; it gives you a practical
          buffer for these real-world additions without requiring you to calculate every opening manually.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Framing Calculator: Practical Scenarios</h2>
        <p style={pStyle}>
          A framing calculator earns its place in a surprisingly wide range of projects. DIY homeowners
          building a basement partition, closet, or garage wall use it to avoid over-ordering lumber for a
          one-off project where every extra stud is wasted money. General contractors and framers use it during
          the bidding stage to quickly generate a material estimate for a client without pulling out a full
          takeoff sheet, especially useful when comparing costs across different OC spacing options for the
          same wall.
        </p>
        <p style={pStyle}>
          Remodelers reworking interior layouts rely on it when reconfiguring multiple short wall segments,
          where manual counting across several walls becomes tedious and error-prone. Students and apprentices
          studying residential construction use it to check their hand calculations and build an intuitive
          sense of how spacing choices affect material quantities. And shed, workshop, or accessory structure
          builders who are working outside of a formal blueprint use it to plan material purchases before a
          single trip to the lumber yard, rather than guessing and making multiple return visits.
        </p>
        <p style={pStyle}>
          Property flippers and rental owners planning multiple similar units, such as an accessory dwelling
          unit or a set of identical rental units, use the calculator to quickly repeat the same estimate
          across several walls with slightly different lengths, without redoing the arithmetic from scratch
          each time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In each of these cases, the value isn't just the final number, it's the speed of testing different
          scenarios. Comparing a wall framed at 16″ OC versus 24″ OC takes seconds, letting you weigh the cost
          savings of wider spacing against your structural and code requirements before committing to an order.
        </p>
      </div>

      {/* Waste / cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Waste and Material Cost</h2>
        <p style={pStyle}>
          Lumber waste is unavoidable on any real job site. Boards get miscut, damaged during transport, or set
          aside because of warping and knots. The calculator's waste percentage input lets you build that
          reality into your estimate rather than discovering it mid-project. A common practice is to apply a 10
          to 15 percent waste factor for straightforward wall runs, and to push that higher, closer to 15 to 20
          percent, for walls with multiple openings, angles, or corners where offcuts pile up faster.
        </p>
        <p style={pStyle}>
          Once the waste-adjusted stud count is calculated, entering your local price per stud produces a total
          estimated material cost for the wall. This is particularly useful for comparing spacing options side
          by side: a wall that needs 9 studs at 16″ OC but only 6 at 24″ OC represents a real cost difference,
          and seeing that gap in dollars, not just stud count, makes it easier to decide whether the wider
          spacing is worth pursuing for a non-load-bearing wall.
        </p>
        <p style={pStyle}>
          Keep in mind that this cost figure covers studs only. Plates, headers, sheathing, fasteners, and
          insulation are separate line items that should be added to get a full material budget for the wall.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also helps to think about lumber dimension alongside spacing. Most residential interior walls use
          2×4 studs, while exterior or load-bearing walls, and walls that need extra depth for plumbing or
          insulation, often call for 2×6 studs. Switching from 2×4 to 2×6 doesn't change the stud count math,
          since that's driven purely by wall length and OC spacing, but it does change your per-stud price, so
          it's worth entering the price for the lumber size you're actually planning to buy rather than a
          generic average.
        </p>
      </div>

      {/* Choosing spacing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Choosing the Right Spacing for Your Project</h2>
        <p style={pStyle}>
          Deciding between 16″, 19.2″, and 24″ OC isn't only a cost question, it's a structural one.
          Load-bearing exterior walls and walls supporting roof or floor loads typically default to 16″ OC
          unless an engineer or local code explicitly approves wider spacing. Interior partition walls that
          carry no structural load have more flexibility, which is where 19.2″ or 24″ OC can meaningfully
          reduce lumber use without compromising the wall's function.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Insulation and drywall planning factor in here too. Standard fiberglass batts are manufactured to fit
          snugly in either 16″ or 24″ stud bays, so mixing an unusual spacing with off-the-shelf insulation can
          lead to extra cutting and waste elsewhere in the project, even if it saves on studs themselves.
          Running the numbers for more than one spacing option in the calculator before finalizing your framing
          plan is a quick way to catch that kind of trade-off early, and it costs nothing but a few extra
          seconds.
        </p>
      </div>

      {/* Accuracy / privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Why You Can Trust This Tool</h2>
        <p style={pStyle}>
          The calculator applies the same on-center spacing formula used throughout residential construction,
          so the stud counts it returns match what you'd get from a manual takeoff for a standard wall run.
          Because the math is straightforward and transparent, you can double-check any result by hand using
          the wall length and spacing you entered.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the privacy side, the tool runs entirely in your browser with no signup or account creation
          required. You don't need to submit an email address or personal details to get a result, and there
          are no hidden charges or premium paywalls blocking the calculation. It's free to use for as many
          walls and projects as you need, whether you're running one quick estimate or comparing spacing
          options across an entire house.
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
