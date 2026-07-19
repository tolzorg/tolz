import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many gallons of paint do I need for 1,000 square feet?",
    a: "It depends on the product's coverage rate, but most standard interior paints cover 350–400 sq ft per gallon per coat. For a 1,000 sq ft area with two coats, you'd typically need 5–6 gallons. Enter your specific coverage rate into the calculator for an exact figure.",
  },
  {
    q: "Is the gallons per sq ft calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no limit on how many times you can use it.",
  },
  {
    q: "How do I find the coverage rate for my specific product?",
    a: "Coverage rate is listed on the product label or technical data sheet, usually as \"square feet per gallon\" or \"square meters per liter.\" If it's not on the label, check the manufacturer's website or product documentation.",
  },
  {
    q: "Does this calculator work for epoxy and concrete sealer, or just paint?",
    a: "It works for any liquid material with a known coverage rate, including epoxy coatings, concrete sealers, waterproofing membranes, primers, and stains, not just paint.",
  },
  {
    q: "Why does my actual paint usage differ from the calculator's estimate?",
    a: "Real-world usage can vary based on surface porosity, texture, application method, and how many coats are actually applied. The calculator gives an accurate estimate based on the coverage rate you enter, but porous or textured surfaces may use more material than a smooth, previously painted wall.",
  },
  {
    q: "Can I calculate coverage in liters instead of gallons?",
    a: "Yes, the calculator supports US gallons, imperial gallons, and liters, so you can work in whichever unit matches your product labeling.",
  },
  {
    q: "Should I round up the gallons calculated, or buy the exact amount?",
    a: "It's generally wise to round up slightly, since paint and coatings are sold in fixed container sizes and having a small reserve helps with touch-ups later without needing to color-match a new batch.",
  },
  {
    q: "Does this tool account for multiple coats automatically?",
    a: "Yes, you can specify the number of coats and the calculator will multiply your total gallons needed accordingly.",
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
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

export default function GallonsCalculatorFaqSection() {
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
          Figuring out exactly how much paint, primer, epoxy, or sealer to buy is one of those small
          calculations that causes big headaches when it's wrong. Buy too little, and you're stuck
          mid-project waiting on a second trip to the store, hoping the new can matches the batch you already
          opened. Buy too much, and you've spent money on material that dries out in the garage. The Gallons
          per Sq Ft Calculator on <Link to="/" className="inline-home-link">Tolz</Link> solves this by converting your surface area and desired coverage rate
          into an exact gallon figure, so you order the right amount the first time, no guesswork, no rounding
          up "just in case."
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator isn't limited to paint. It works for any liquid or semi-liquid material applied
          across a surface at a known spread rate, including epoxy coatings, concrete sealers, waterproofing
          membranes, primers, and stains. You simply enter your area and the coverage rate specified by the
          manufacturer, and the tool returns the gallons required, along with the flexibility to work in US
          gallons, imperial gallons, or liters depending on where you're sourcing your materials.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Gallons per Sq Ft Calculation?</h2>
        <p style={pStyle}>
          A gallons-per-square-foot calculation tells you how far one gallon of a given product will stretch
          across a surface, and by extension, how many gallons you need for a specific area. Every paint,
          sealer, or coating product has a manufacturer-listed coverage rate, usually printed as "covers
          approximately 350–400 sq ft per gallon" on the can or technical data sheet. That number isn't
          universal; it changes based on the product's viscosity, solids content, and intended film thickness.
          The calculator takes that coverage rate and your total square footage, then does the division for
          you, converting an abstract spec-sheet number into a real quantity you can take to the checkout
          counter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because coverage rates aren't intuitive to work with manually, especially when a
          project involves multiple coats, irregular room shapes, or materials priced by the liter rather
          than the gallon. A quick manual estimate ("this room looks like it needs about two cans") is how
          most people end up over-ordering or under-ordering. A precise calculation based on actual area and
          actual coverage rate removes that uncertainty.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Gallons per Sq Ft Calculator</h2>
        <p style={pStyle}>Using the tool takes under a minute:</p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            Enter your surface area in square feet (or square meters, depending on your preferred unit). If
            you don't already know the area, measure the length and width of each surface and multiply them
            together, then add the surfaces up.
          </li>
          <li style={{ marginBottom: 8 }}>
            Enter the coverage rate listed on your product's label or data sheet, typically expressed as
            square feet per gallon (or liters per square meter for imported products).
          </li>
          <li style={{ marginBottom: 8 }}>
            Select your preferred output unit, US gallons, imperial gallons, or liters.
          </li>
          <li style={{ marginBottom: 8 }}>
            Specify the number of coats, if your project requires more than one application, so the tool
            multiplies the total accordingly.
          </li>
          <li>
            Review your result, which shows the exact gallons needed along with a rounded "gallons to buy"
            figure based on standard container sizes.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          The calculator handles the conversion math instantly, which is particularly useful when a product's
          coverage is listed in a unit that doesn't match how it's sold, for example, a coverage rate given in
          square meters per liter but sold in US gallon containers.
        </p>
      </div>

      {/* Practical scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need This Tool (Practical Scenarios)</h2>
        <p style={pStyle}>
          <strong>Interior and exterior painting.</strong> Before starting a room repaint or repainting a
          house exterior, calculating gallons needed prevents mismatched paint batches from a return trip and
          avoids leftover cans of custom-tinted color that can't be returned.
        </p>
        <p style={pStyle}>
          <strong>Primer application.</strong> Primer often has a different coverage rate than topcoat paint,
          especially on porous drywall, raw wood, or masonry. Calculating primer separately from paint avoids
          underestimating the first coat, which is the coat that determines how well everything above it
          adheres.
        </p>
        <p style={pStyle}>
          <strong>Epoxy flooring projects.</strong> Garage floor epoxy, industrial epoxy coatings, and
          countertop epoxy are sold in kits with strict coverage specifications tied to film thickness.
          Ordering short on epoxy mid-pour is a serious problem since most epoxy systems have a limited working
          time and can't be easily "topped up" once cured, getting the gallons right before you start is
          essential.
        </p>
        <p style={pStyle}>
          <strong>Concrete sealers and driveway coatings.</strong> Sealer coverage varies significantly
          depending on whether the concrete is broom-finished, stamped, or previously sealed. Porous or
          textured concrete absorbs more sealer per square foot, so calculating based on the product's
          specific coverage rate, rather than a rough estimate, prevents an unsealed patch from being missed.
        </p>
        <p style={pStyle}>
          <strong>Waterproofing membranes.</strong> Basement walls, roof decks, and below-grade foundations
          often require waterproofing coatings applied at a specific wet-film thickness to meet the
          manufacturer's warranty terms. Under-application can void that warranty, making an accurate gallons
          calculation more than just a budgeting exercise.
        </p>
        <p style={pStyle}>
          <strong>Stains and wood finishes.</strong> Deck stains and wood finishes vary in coverage based on
          wood porosity and age, and this tool helps estimate quantity before a project where matching stain
          batches mid-job is difficult.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Contractors and estimators.</strong> For anyone quoting jobs professionally, quickly
          converting square footage into material cost via gallons needed speeds up estimate preparation and
          keeps material budgets accurate across multiple job sites.
        </p>
      </div>

      {/* Formula */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Formula Behind the Calculation</h2>
        <p style={pStyle}>The underlying math is straightforward once broken down:</p>
        <div style={formulaStyle}>
          Gallons needed = (Total Area in Sq Ft × Number of Coats) ÷ Coverage Rate (Sq Ft per Gallon)
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, a 1,000 sq ft wall with a product rated at 350 sq ft per gallon, applied in two coats,
          would need (1,000 × 2) ÷ 350 = approximately 5.71 gallons, which most people would round up to 6
          gallons to account for the container sizes available at the store. The calculator performs this
          exact calculation instantly, while also handling unit conversions between gallons, imperial gallons,
          and liters, so you're not manually converting a European product's liter-based coverage rate into US
          gallon quantities.
        </p>
      </div>

      {/* Factors affecting coverage */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Factors That Affect Real-World Coverage Rates</h2>
        <p style={pStyle}>
          The manufacturer's stated coverage rate is a starting point, not a guarantee, and several variables
          shift how far a gallon actually goes on your specific surface:
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Surface porosity.</strong> Unpainted drywall, raw concrete, and untreated wood absorb
            significantly more material than a previously painted or sealed surface.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Application method.</strong> Spraying typically uses more product than rolling or brushing
            due to overspray, while brushing can leave a thinner, less consistent film.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Surface texture.</strong> Textured walls, stucco, and rough concrete require more material
            to achieve full coverage compared to smooth surfaces.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Film thickness requirements.</strong> Some coatings, particularly epoxy and waterproofing
            products, specify a minimum wet or dry film thickness in mils, which directly affects how far the
            product spreads.
          </li>
          <li>
            <strong>Number of coats.</strong> Darker color changes, stain-blocking primers, and
            high-performance coatings often require two or more coats to reach full opacity or protective
            thickness.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because of these variables, it's good practice to calculate your gallons needed and then check that
          figure against the "coverage range" (rather than a single number) listed on the product's technical
          data sheet, since most manufacturers provide a range to account for surface differences.
        </p>
      </div>

      {/* Units */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Units Supported</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator supports US gallons, imperial gallons, and liters, along with area inputs in square
          feet or square meters. This matters for anyone sourcing materials internationally or working from a
          product data sheet that lists coverage in metric units, a common situation with imported epoxy
          systems, European coatings, and specialty sealers. Rather than manually converting liters per square
          meter into gallons per square foot, the calculator handles the conversion in the background so the
          final figure is ready to use for purchasing.
        </p>
      </div>

      {/* Accuracy/privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator is free to use, requires no signup or account creation, and runs entirely in your
          browser with no files uploaded or stored. Because it performs a direct mathematical conversion based
          on the numbers you enter, results are consistent and repeatable every time, the same inputs will
          always produce the same output. There are no hidden charges, download requirements, or watermarks on
          the results; it's built to be used as many times as needed across an entire project, from initial
          estimate to final material order, accessible through Tolz.
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
