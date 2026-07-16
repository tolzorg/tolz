import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much river rock do I need for my project?",
    a: "Multiply the length and width of your area in feet to get square footage, then multiply by your desired depth (in feet) to get cubic footage. The River Rock Calculator does this automatically and also converts the result into weight and cost, so you don't need to do the math or unit conversions by hand.",
  },
  {
    q: "How many tons of river rock do I need to cover 100 square feet?",
    a: "This depends on the depth and rock type, since bulk density varies by rock size. For a typical 2-inch depth using a medium river rock, 100 square feet generally requires somewhere around 1 to 1.5 tons, but using the calculator with your specific rock type and exact depth will give a far more precise figure.",
  },
  {
    q: "What depth of river rock should I use?",
    a: "For decorative ground cover, 2–3 inches is usually enough. Walkways typically need 3–4 inches for stability, while drainage beds and dry creek beds often require 4–6 inches to manage water flow effectively.",
  },
  {
    q: "Does river rock size affect how much I need to order?",
    a: "Yes. Larger rocks have more air gaps between pieces and generally weigh less per cubic foot than smaller, more tightly packed rock, even at the same volume. Selecting the correct rock type in the calculator ensures the weight estimate matches the material you're actually purchasing.",
  },
  {
    q: "Why is my river rock calculation different from what my supplier quoted?",
    a: "Small differences are normal and usually come down to bulk density variation between suppliers, how the rock has settled during transport, or a different wastage assumption. Adding a wastage buffer, as this calculator does by default, helps close that gap and reduces the chance of running short.",
  },
  {
    q: "Is the River Rock Calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no limit on how many times you can use it.",
  },
  {
    q: "Does the calculator store any of my data?",
    a: "No. Calculations are processed instantly and nothing you enter is stored or shared.",
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

export default function RiverRockCalculatorFaqSection() {
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
          Planning a landscaping project with river rock is only half the battle, figuring out exactly how
          much to buy is where most people get stuck. Order too little and you're back at the supplier
          mid-project; order too much and you've wasted money on excess material sitting in your driveway.
          The River Rock Calculator on Tolz removes the guesswork entirely. Enter the length, width, and depth
          of the area you're covering, choose from 10 preset rock types with built-in bulk densities, and get
          an instant, accurate breakdown of the volume and weight you need, plus a cost estimate that accounts
          for material wastage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whether you're building a dry creek bed, covering a drainage area, or replacing mulch with a
          low-maintenance rock border, this calculator gives you numbers you can actually take to the
          supplier, not a rough guess.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the River Rock Calculator Works</h2>
        <p style={pStyle}>
          The calculator uses a straightforward but often-overlooked formula: it multiplies the length, width,
          and depth of your project area to determine cubic volume, then converts that volume into weight
          using the bulk density of the specific rock type you select. Bulk density varies noticeably between
          rock types, a smaller, more angular rock packs differently than a large, rounded river stone, which
          is why generic gravel calculators that use a single fixed density often produce inaccurate results.
        </p>
        <p style={pStyle}>
          This tool avoids that problem by offering 10 distinct rock type presets, each with its own bulk
          density value, so the output reflects the material you're actually buying rather than a generic
          average. After calculating the raw volume and weight, the calculator applies a wastage percentage on
          top of the base figure. Wastage accounts for spillage, uneven ground, compaction, and the reality
          that suppliers rarely sell in exact fractional amounts. Skipping this step is one of the most common
          reasons DIY landscaping projects run short on material.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The final output includes total volume in cubic feet and cubic yards, total weight in pounds and
          tons, and an estimated cost based on the price per unit you enter. You can adjust any input and see
          the numbers update instantly, which makes it easy to compare scenarios, for example, checking how
          much a 3-inch depth costs versus a 4-inch depth before committing to an order.
        </p>
      </div>

      {/* Choosing rock/depth */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Choosing the Right Rock Type and Depth</h2>
        <p style={pStyle}>
          Getting an accurate estimate depends on two decisions you make before you even open the calculator:
          which rock type you're using and how deep you plan to lay it.
        </p>
        <p style={pStyle}>
          <strong>Rock type and bulk density.</strong> River rock is sold in a range of sizes, typically from
          small pea-sized stones up to large 3–5 inch cobbles, and each size has a different bulk density
          measured in pounds per cubic foot. Smaller rocks settle more tightly and tend to weigh more per
          cubic foot than larger, more irregularly shaped stones that leave larger air gaps between pieces.
          Selecting the correct rock type in the calculator's preset list ensures the weight and cost figures
          match what you'll actually be charged at the supplier, since most suppliers price and sell river
          rock by the ton rather than by volume alone.
        </p>
        <p style={pStyle}>
          <strong>Depth recommendations by use case.</strong> The right depth depends entirely on the project:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Decorative ground cover or garden borders:</strong> 2–3 inches is typically sufficient to
            suppress weeds and provide visual coverage without excessive material cost.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Walkways and low-traffic paths:</strong> 3–4 inches gives a stable, comfortable walking
            surface.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Drainage beds and dry creek beds:</strong> 4–6 inches or more is common, since these areas
            need enough rock volume to manage water flow effectively and resist displacement during heavy
            rain.
          </li>
          <li>
            <strong>Areas over landscape fabric:</strong> A thinner layer (2 inches) is often adequate since
            the fabric handles weed suppression, and the rock is primarily decorative.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Entering the correct depth matters more than most people expect, doubling the depth doubles both
          the volume and the cost, so a small adjustment here has a real impact on your final order size and
          budget.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a River Rock Calculator (Practical Scenarios)</h2>
        <p style={pStyle}>
          River rock is one of the most versatile landscaping materials, which means the calculator gets used
          across a wide range of project types:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Dry creek beds.</strong> Homeowners building a dry creek bed to manage stormwater runoff
            need to know both the volume for the main channel and the depth required to handle peak water
            flow without the rock shifting.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Foundation and drainage borders.</strong> Rock placed around a home's foundation for
            drainage purposes typically needs a specific minimum depth to be functional, not just decorative,
            making an accurate weight and volume estimate essential for ordering the right amount of material
            in one trip.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Xeriscaping and drought-tolerant landscaping.</strong> As more homeowners replace grass
            lawns with low-water landscaping, river rock has become a common ground cover choice. Calculating
            coverage for larger areas like this is where estimation errors get expensive, since these projects
            can involve hundreds of square feet.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Garden bed mulching alternatives.</strong> Unlike organic mulch, river rock doesn't need
            annual replacement, but the upfront quantity has to be right since topping off later can result in
            visible color or size mismatches between old and new rock.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pathways and stepping stone borders.</strong> Rock used to fill the space around pavers or
            stepping stones needs a precise volume calculation since these areas are often irregularly shaped
            and small errors in estimation are more noticeable.
          </li>
          <li>
            <strong>Contractor and landscaper quoting.</strong> Landscaping professionals use volume and
            weight calculators like this one to quickly generate material estimates for client quotes without
            manually calculating cubic yardage for every job site.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the core challenge is the same: translating a physical area into an accurate
          order quantity, in the units your supplier actually sells in.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Cost Accurately</h2>
        <p style={pStyle}>
          River rock is almost always priced by the ton rather than by the bag or cubic yard, which is why the
          calculator converts volume into weight before applying a cost estimate. Once you know the total
          tonnage required, you can enter your local price per ton (which varies by region, rock type, and
          delivery distance) to get a realistic project budget.
        </p>
        <p style={pStyle}>A few factors worth accounting for before finalizing a purchase:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Delivery minimums.</strong> Many suppliers have a minimum tonnage for delivery, so it's
            worth checking your calculated total against local delivery thresholds before ordering.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Bulk pricing breaks.</strong> Larger orders often come with a lower per-ton rate, so
            calculating your full project volume upfront, rather than ordering in smaller batches, can reduce
            total cost.
          </li>
          <li>
            <strong>Wastage buffer.</strong> The wastage percentage built into the calculator helps prevent
            the common scenario of running short by 10–15% and having to place a second, smaller order at a
            higher effective price.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because the calculator shows both the base estimate and the wastage-adjusted total side by side, you
          can decide how much buffer feels appropriate for your specific site conditions; a flat,
          easy-to-measure area needs less buffer than one with slopes or irregular edges.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Ease of Use</h2>
        <p style={pStyle}>
          The River Rock Calculator is free to use, requires no signup or account creation, and produces
          results instantly in your browser. There are no hidden charges, download requirements, or usage
          limits, you can run the calculation as many times as needed while you compare rock types, depths, or
          project dimensions.
        </p>
        <p style={pStyle}>
          No project data you enter is stored or shared; the calculation happens directly in your session and
          nothing about your inputs is retained afterward. This makes it straightforward to use for quick
          estimates without any privacy concerns, whether you're planning a small garden bed or quoting a
          larger commercial landscaping job.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The bulk density values used for each of the 10 rock type presets are based on standard industry
          figures for those material categories, giving you a dependable starting point for budgeting. That
          said, actual bulk density can vary slightly by supplier and by how tightly rock has settled during
          transport, so treat the output as a strong estimate to order against, most suppliers factor in
          similar variance when fulfilling bulk rock orders.
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
