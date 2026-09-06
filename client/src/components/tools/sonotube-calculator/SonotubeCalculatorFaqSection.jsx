import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many bags of concrete do I need for a Sonotube?",
    a: "It depends on the tube's diameter, height, and the bag size you're using. An 80 lb bag yields roughly 0.6 cubic feet of mixed concrete, so a typical 10-inch diameter, 4-foot-tall footing needs approximately 3–4 bags. Enter your exact dimensions into the calculator for a precise count rather than relying on general averages, since even small diameter differences change the bag count meaningfully.",
  },
  {
    q: "How do I calculate concrete volume for a round form?",
    a: "Multiply π (approximately 3.14) by the radius squared (half the diameter, squared), then by the height, to get cubic feet. Divide by 27 to convert to cubic yards if you're ordering ready-mix concrete. The calculator performs this automatically and adjusts for multiple tubes at once.",
  },
  {
    q: "What's the difference between Sonotube and generic concrete form tubes?",
    a: "Sonotube is a specific manufacturer's brand name that has become a common generic term for cylindrical concrete forms, similar to how \"Kleenex\" is used for tissues. The calculator works for any round concrete form regardless of brand, since the volume math is identical.",
  },
  {
    q: "How deep should a Sonotube footing be for a deck or fence post?",
    a: "Depth requirements depend on your local frost line and building code, and typically range from 12 inches for light fence posts to well below the frost line (often 36–48 inches in colder climates) for structural deck footings. Check with your local building department before finalizing depth.",
  },
  {
    q: "Can I use this calculator for both bagged concrete and ready-mix?",
    a: "Yes. The tool provides a bag-count output for pre-mixed bags and a cement-sand-gravel ratio for those mixing from raw materials or ordering ready-mix by volume, so you can choose whichever matches your project size and sourcing method.",
  },
  {
    q: "Is this Sonotube calculator really free with no signup?",
    a: "Yes. The tool is completely free, requires no account or signup, and doesn't limit the number of calculations you can run.",
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

export default function SonotubeCalculatorFaqSection() {
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
        <h2 style={h2Style}>Sonotube Calculator: Concrete Volume, Bags & Cost Estimator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Pouring concrete into a round form is only as good as the math behind it, and guessing almost always
          ends in either a wasted half-bag of mix or a second trip to the hardware store. The sonotube
          calculator on <Link to="/" className="inline-home-link">Tolz</Link> takes that guesswork out of the
          process entirely. Enter the diameter, height, and number of tubes you're pouring, and the tool
          instantly returns the concrete volume you need, along with either a pre-mixed bag count or a full
          cement, sand, and gravel breakdown, plus an estimated cost. It's built for anyone setting fence
          posts, deck footings, or structural columns who wants a number they can trust before they start
          mixing.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Sonotube Calculator Does</h2>
        <p style={pStyle}>
          A Sonotube (and similar cylindrical forms from other manufacturers) is a cardboard or fiber tube used
          to pour round concrete footings and columns. Because the shape is a cylinder, the volume math is
          straightforward in theory, but manual calculations get error-prone once you're converting cubic
          inches to cubic feet, then to cubic yards, then to bag counts, especially when pouring multiple tubes
          of different sizes on the same job.
        </p>
        <p style={pStyle}>
          This calculator handles that conversion chain automatically. You provide three inputs: diameter,
          height, and quantity of tubes. The tool then calculates:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>Total concrete volume, shown in cubic feet and cubic yards</li>
          <li style={{ marginBottom: 8 }}>Estimated weight of the concrete once cured</li>
          <li style={{ marginBottom: 8 }}>The number of pre-mixed bags required (commonly available in 40 lb, 60 lb, and 80 lb sizes)</li>
          <li style={{ marginBottom: 8 }}>A cement, sand, and gravel ratio breakdown for anyone mixing from raw materials rather than bags</li>
          <li>An instant cost estimate based on your inputs</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Because it recalculates in real time, you can test different tube diameters or quantities side by
          side before committing to a material order, useful when you're deciding between, say, 8-inch and
          10-inch footings for a deck.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You'd Need a Sonotube Calculator</h2>
        <p style={pStyle}>
          Sonotube forms show up across a fairly narrow but common set of projects, and the concrete math
          matters differently depending on which one you're doing.
        </p>
        <p style={pStyle}>
          <strong>Deck and porch footings.</strong> Building codes typically require footings below the frost
          line, and the footing diameter is often specified by local code based on the load the deck will
          carry. Once you know the required diameter and depth, this tool tells you exactly how much concrete
          to order rather than relying on a rough per-footing estimate that's usually padded (and expensive) or
          under-poured (and unsafe).
        </p>
        <p style={pStyle}>
          <strong>Fence post footings.</strong> Fence contractors and DIYers alike use Sonotube-style forms to
          set posts in a clean, code-compliant column of concrete rather than an irregular hand-dug hole. Since
          fence lines often involve a dozen or more identical postholes, the "quantity" field in the calculator
          becomes especially valuable, you calculate the volume for one hole and multiply automatically instead
          of doing the math repeatedly by hand.
        </p>
        <p style={pStyle}>
          <strong>Structural columns and piers.</strong> Pole barns, carports, and freestanding structures
          frequently use round concrete piers as their foundation. These tend to be taller and wider than fence
          or deck footings, meaning small measurement errors translate into a much larger volume discrepancy,
          exactly where a calculator earns its keep.
        </p>
        <p style={pStyle}>
          <strong>Mailbox posts, sign posts, and light poles.</strong> Smaller-scale projects still benefit from
          knowing precisely how many bags to buy, since running short mid-pour on a single-batch job is
          inconvenient and running long means paying for concrete you didn't need.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Estimating and bidding.</strong> Contractors quoting jobs with multiple footings use the tool
          to generate a fast, defensible material estimate for a proposal without opening a spreadsheet or
          doing cylinder-volume math by hand.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Calculation Works</h2>
        <p style={pStyle}>
          The underlying formula is the standard volume of a cylinder: π × radius² × height, where the radius
          is half the diameter you enter. The calculator converts your diameter and height (regardless of
          whether you input inches or feet) into a consistent unit, computes the volume, then multiplies by
          your tube quantity to get the total job volume.
        </p>
        <p style={pStyle}>
          From there, cubic feet are converted to cubic yards (dividing by 27) since ready-mix concrete is
          typically ordered and priced by the cubic yard, while bagged concrete is priced and measured
          individually. This is the step most manual calculations get wrong, it's easy to correctly compute
          cubic feet and then make an arithmetic error converting to yards or bags, especially across multiple
          tubes of different sizes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For those mixing concrete from raw materials rather than using pre-blended bags, the tool also
          outputs a cement-to-sand-to-gravel ratio breakdown (a common structural mix is roughly 1 part cement,
          2 parts sand, 3 parts gravel by volume), scaled to your total required volume. This is particularly
          useful on larger jobs where buying bulk raw materials is more economical than dozens of pre-mixed
          bags.
        </p>
      </div>

      {/* Bags vs ratio */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bag Count vs. Mix Ratio: Which Should You Use?</h2>
        <p style={pStyle}>
          Deciding between pre-mixed bags and a raw cement-sand-gravel mix usually comes down to job size and
          access to bulk materials.
        </p>
        <p style={pStyle}>
          Pre-mixed bags (40 lb, 60 lb, or 80 lb) are the more practical choice for smaller jobs, a handful of
          fence posts, a single deck footing, or any pour where you're mixing by hand or with a small drum
          mixer. They're consistent in strength, require no separate material sourcing, and the calculator's
          bag-count output tells you exactly how many to load into the cart, factoring in typical yield per bag
          size.
        </p>
        <p style={pStyle}>
          Raw mix ratios make more sense once volume climbs, multiple large piers, a long fence line with many
          postholes, or any job where ready-mix delivery or bulk material purchase becomes more cost-effective
          than buying dozens of individual bags. The ratio breakdown lets you calculate exactly how much
          cement, sand, and gravel to have on-site, which is especially useful when working with a concrete
          mixer or coordinating a ready-mix truck order.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Many users run the calculation both ways before deciding, which is easy to do since the tool updates
          instantly when you switch options.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Concrete Cost Accurately</h2>
        <p style={pStyle}>
          Because concrete pricing varies by region, brand, and whether you're buying bags or ready-mix by the
          yard, the calculator's cost estimate is based on the inputs and pricing assumptions you provide,
          giving you a working budget figure rather than a fixed national price. This is still far more useful
          than a rough per-footing guess, particularly when you're comparing the cost of, say, six 10-inch
          footings against eight 8-inch footings for the same structure, a comparison that's difficult to
          eyeball but takes seconds with the tool.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For anyone bidding jobs or working within a tight material budget, running a few diameter and depth
          combinations through the calculator before finalizing footing specs can reveal meaningful cost
          differences without compromising the structural requirement.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Accurate Results</h2>
        <p style={pStyle}>A few practical points improve the accuracy of any Sonotube concrete estimate, calculator or not:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            Measure the tube's inside diameter, not the outer packaging size. Sonotube diameters are typically
            labeled by nominal size, but actual inside measurements can vary slightly by manufacturer.
          </li>
          <li style={{ marginBottom: 8 }}>
            Account for the portion of the tube below and above grade separately if needed. If your footing
            extends above ground level (common for deck posts), measure the full poured height, not just the
            below-grade portion.
          </li>
          <li style={{ marginBottom: 8 }}>
            Round up on bag counts. Bag yield is rarely exact, and having a small amount of leftover mix is far
            less costly than an interrupted pour.
          </li>
          <li style={{ marginBottom: 8 }}>
            Factor in waste. Spillage, over-excavation, and uneven tube bottoms typically account for a small
            but real volume loss on real job sites, many contractors add a 5–10% buffer to calculated volume
            for this reason.
          </li>
          <li>
            Confirm local code requirements before finalizing diameter and depth. The calculator gives you
            accurate volume and cost for whatever dimensions you enter, but the dimensions themselves should
            come from your local building code or an engineer for structural applications.
          </li>
        </ul>
      </div>

      {/* Privacy / cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Data Privacy, Cost & Accessibility</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is free to use, requires no signup or account creation, and runs directly in your
          browser with no hidden fees or premium tier gating the results. Nothing you enter, diameter, height,
          quantity, or pricing inputs, is stored or transmitted for any purpose beyond generating your
          calculation, and no personal or project data is required to get a result. It's designed to be opened,
          used, and closed in under a minute, whether you're on a job site checking a number on your phone or
          planning material orders from a desktop at home.
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
