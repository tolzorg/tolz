import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate board feet from inches?",
    a: "Multiply the thickness in inches by the width in inches by the length in inches, then divide the result by 144. This gives you the board footage for a single piece of lumber based on its full volume.",
  },
  {
    q: "What is the formula for board feet if the length is in feet instead of inches?",
    a: "Multiply thickness (inches) by width (inches) by length (feet), then divide by 12. This version of the formula is common when lumber length is listed in feet on a supplier's spec sheet.",
  },
  {
    q: "Is a board foot the same as a square foot?",
    a: "No. A square foot measures only width and length (area), while a board foot measures thickness, width, and length together (volume). They're only equivalent for lumber exactly 1 inch thick.",
  },
  {
    q: "How many board feet are in a 2x4 that's 8 feet long?",
    a: "Using actual dimensions of roughly 1.5 x 3.5 inches, an 8-foot 2x4 comes to about 3.5 board feet. Using the nominal 2 x 4 inch size, it calculates to 5.33 board feet, which is why it's important to know whether a supplier is pricing by nominal or actual dimensions.",
  },
  {
    q: "Why do lumberyards price hardwood by the board foot instead of the linear foot?",
    a: "Hardwood boards vary in thickness and width from piece to piece, so a linear foot measurement alone wouldn't reflect the actual amount of material in each board. Board footage accounts for the full volume, making it a fairer and more consistent basis for pricing.",
  },
  {
    q: "Do I use nominal or actual size when calculating board feet?",
    a: "Use actual measured dimensions for planed or surfaced lumber, since milling reduces the size from its nominal label. Use nominal thickness for rough-sawn lumber, which is typically priced and sold at close to its labeled size.",
  },
  {
    q: "Can this calculator be used for metric lumber measurements?",
    a: "Yes. The calculator accepts millimeters, centimeters, and meters in addition to inches and feet, so it works for both imperial lumber specifications and metric sizing used in many international markets.",
  },
  {
    q: "Is this board foot calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no limit on how many times you can use it.",
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

export default function BoardFootCalculatorFaqSection() {
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
    name: "Board Foot Calculator",
    url: "https://www.tolz.org/tools/board-foot-calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web-based)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online board foot calculator that instantly calculates board feet for any lumber size. Supports inches, millimeters, centimeters, feet, and meters. Enter thickness, width, length, and quantity to get per-piece and total board feet.",
    featureList: [
      "Instant board foot calculation",
      "Supports inches, mm, cm, feet, and meters",
      "Per-piece and total board foot results",
      "No signup required",
      "Free to use",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Measuring lumber accurately is the difference between an order that fits your project and one that
          leaves you short on material or paying for wood you don't need. The Board Foot Calculator on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> converts the thickness, width, and length of
          any piece of lumber into an exact board foot measurement, working out both the per-piece volume and
          the total for however many pieces you're buying. Whether you're pricing out a custom furniture
          build, estimating material for a framing job, or checking a supplier's invoice, this calculator
          removes the guesswork and the manual math. It's part of a broader set of free, browser-based
          utilities on <Link to="/" className="inline-home-link">Tolz</Link>, built to handle everyday
          calculations without forcing you through logins or paywalls.
        </p>
      </div>

      {/* What is a board foot */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Board Foot and How Is It Calculated?</h2>
        <p style={pStyle}>
          A board foot is the standard unit of volume used across the lumber industry in the United States and
          several other markets to price and measure wood. One board foot equals a piece of lumber measuring 1
          inch thick, 12 inches wide, and 12 inches long, or any combination of dimensions that produces the
          same total volume, which is 144 cubic inches.
        </p>
        <p style={pStyle}>The board foot formula is straightforward once you know the three inputs:</p>
        <div style={formulaStyle}>Board Feet = (Thickness in inches × Width in inches × Length in inches) ÷ 144</div>
        <p style={pStyle}>For lumber measured in feet rather than inches, the formula adjusts to:</p>
        <div style={formulaStyle}>Board Feet = Thickness (in) × Width (in) × Length (ft) ÷ 12</div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because lumber is rarely sold by a simple length or area measurement the way drywall or
          flooring might be. A thick slab and a thin board of the same width and length contain very different
          amounts of wood, and board feet account for that volume directly. It's why lumberyards, sawmills, and
          hardwood suppliers price by the board foot rather than by the linear foot for anything other than
          standard dimensional lumber.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Board Foot Calculator</h2>
        <p style={pStyle}>
          Using the tool takes only a few seconds. Enter the thickness, width, and length of your lumber piece,
          select the unit of measurement that matches how your board is specified, inches, millimeters,
          centimeters, feet, or meters, and input the quantity of pieces if you're calculating for more than one
          board. The calculator instantly returns the board footage for a single piece as well as the combined
          total for the full quantity entered.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because it supports both imperial and metric units, the tool works equally well whether you're
          reading dimensions off a U.S. lumberyard price sheet in inches and feet, or working from a metric spec
          sheet in millimeters or meters, which is common in international sourcing, European hardwood
          suppliers, and metric-based building projects. There's no need to convert units manually before
          entering your numbers, the calculator handles the conversion internally and gives you a result in
          board feet regardless of which measurement system you started with.
        </p>
      </div>

      {/* Why / when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need a Board Foot Calculator</h2>
        <p style={pStyle}>
          Board foot calculations come up constantly, but the specific reasons people reach for this tool tend
          to fall into a few recurring scenarios.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Buying hardwood for a furniture or woodworking project.</strong> Hardwood is almost always
            priced per board foot, unlike standard dimensional softwood lumber, which is typically sold by the
            linear foot. If you're building a table, cabinet, or any project using walnut, oak, maple, or
            similar species, you need to know the board footage of every piece to get an accurate quote and
            avoid overordering expensive stock.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Estimating material costs before placing an order.</strong> Contractors and hobbyists alike
            use board foot totals to multiply against a supplier's price-per-board-foot rate, giving a fast,
            accurate cost estimate before committing to a purchase. This is especially useful when comparing
            prices across multiple lumber suppliers who quote per board foot.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Checking a sawmill or supplier's math.</strong> Custom sawmill orders, live-edge slabs, and
            rough-cut lumber purchases are frequently invoiced by board foot, and mistakes in that calculation
            aren't rare. Running the same dimensions through an independent calculator is a quick way to
            confirm you're being charged correctly.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning cut lists and material takeoffs.</strong> When a project calls for multiple pieces
            of varying sizes, calculating each one by hand and adding the totals is slow and error-prone.
            Entering thickness, width, length, and quantity at once produces an accurate combined total in a
            single step.
          </li>
          <li>
            <strong>Working with irregular or non-standard lumber sizes.</strong> Rough-sawn boards, live-edge
            slabs, and custom-milled lumber rarely match standard dimensional sizing, which makes manual
            estimation unreliable. A calculator that accepts exact measurements handles these irregular sizes
            without any extra conversion work.
          </li>
        </ul>
      </div>

      {/* Comparison of units */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Board Foot vs. Linear Foot, Square Foot, and Cubic Foot</h2>
        <p style={pStyle}>
          Confusion between these units is one of the most common mistakes when ordering lumber, so it's worth
          being precise about the difference.
        </p>
        <p style={pStyle}>
          A <strong>linear foot</strong> measures only length, regardless of the board's thickness or width.
          It's used for standard dimensional lumber like 2x4s, where the cross-section is fixed and
          consistent, so length alone is enough to price the material.
        </p>
        <p style={pStyle}>
          A <strong>square foot</strong> measures area, width multiplied by length, and is typically used for
          flooring, sheet goods, and materials where thickness is standardized or irrelevant to the pricing.
        </p>
        <p style={pStyle}>
          A <strong>cubic foot</strong> measures volume using all three dimensions but expressed in feet rather
          than the board foot's inch-based 144 cubic inch unit. One cubic foot equals 12 board feet.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A <strong>board foot</strong>, by contrast, accounts for thickness, width, and length together, which
          makes it the appropriate unit whenever the thickness of the material varies from piece to piece,
          exactly the case with hardwood and rough-cut lumber. Using the wrong unit when comparing prices
          between suppliers can lead to costly misunderstandings, so confirming which measurement a quote is
          based on is always worth doing before ordering.
        </p>
      </div>

      {/* Nominal vs actual */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Nominal vs. Actual Lumber Dimensions</h2>
        <p style={pStyle}>
          One detail that trips up many first-time calculations is the difference between nominal and actual
          lumber size. A board sold as a "1-inch" or "2-inch" thick piece is rarely that exact thickness once
          it's been surfaced and dried. Rough-sawn lumber is typically cut close to its nominal size, but
          planed or "surfaced" boards (commonly marked S2S or S4S) lose material during milling, so a nominal
          1-inch board might actually measure closer to 13/16 of an inch once finished.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the most accurate board foot total, it's best to use the actual measured dimensions of your
          lumber rather than the nominal size printed on a price tag, particularly for finished or surfaced
          stock. Rough sawmill lumber, on the other hand, is usually priced and measured using its nominal
          thickness since it hasn't been reduced through planing. Entering the correct figure into the
          calculator, actual or nominal, depending on the type of lumber you're working with, ensures the
          result matches what you'll actually be charged or need to budget for.
        </p>
      </div>

      {/* Accuracy / privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Ease of Use</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator performs the standard board foot formula precisely, with no rounding shortcuts that
          could throw off a bulk order calculation. All figures are computed directly in your browser as you
          enter them, so nothing is uploaded, stored, or sent to a server for processing. There's no account to
          create and no signup required to get a result, you enter your dimensions and receive the calculation
          immediately. The tool is completely free to use, with no hidden charges, usage limits, or premium
          tier gating the core functionality. It's built to be used as often as needed, whether that's for a
          single furniture project or repeated use pricing out multiple lumberyard orders.
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
