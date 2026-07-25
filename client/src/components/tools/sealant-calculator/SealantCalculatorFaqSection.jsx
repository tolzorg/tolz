import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much sealant do I need for a joint?",
    a: "Multiply the joint's depth, width, and length to get the total volume, then add a wastage allowance (typically 5–10%) to account for application loss. The calculator does this automatically and converts the result into the number of cartridges, sausages, or pails you'll need to buy.",
  },
  {
    q: "What is the correct width-to-depth ratio for a sealant joint?",
    a: "Most sealant manufacturers recommend a 2:1 width-to-depth ratio, meaning the joint should be roughly twice as wide as it is deep. This allows the cured sealant bead to flex properly as the joint expands and contracts without tearing.",
  },
  {
    q: "How much sealant does one cartridge cover?",
    a: "Coverage depends on the cartridge's volume and the size of the bead you're applying, a wider or deeper joint uses more sealant per linear foot from the same cartridge. Enter your specific joint dimensions and cartridge size into the calculator to get an exact linear coverage figure rather than a generic estimate.",
  },
  {
    q: "Do I need to account for the backer rod when calculating sealant?",
    a: "Yes. Backer rod fills the base of a deep joint so sealant only needs to fill the top portion, reducing both material use and cost. Measure and enter the depth of sealant above the backer rod, not the full joint depth, for an accurate quantity.",
  },
  {
    q: "What's the difference between a cartridge, sausage, and pail of sealant?",
    a: "Cartridges are the smallest standard package, typically used with a manual or battery caulking gun for detail work. Sausages hold more volume and are used with pneumatic or bulk-loading guns for longer joint runs. Pails are the largest format, generally used for high-volume or poured applications rather than gun-dispensed beads.",
  },
  {
    q: "Is this sealant calculator free to use?",
    a: "Yes, the calculator is completely free with no signup required and no hidden charges. You can run unlimited calculations directly in your browser.",
  },
  {
    q: "Does the calculator store my project measurements?",
    a: "No. All calculations are performed using the values you enter, and no measurements or project details are uploaded or saved.",
  },
  {
    q: "How much wastage should I add when estimating sealant?",
    a: "A wastage allowance of 5–10% is standard for most applications, though less experienced applicators or complex joint geometries may warrant a higher allowance. The calculator lets you adjust this percentage to match your own application accuracy.",
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

export default function SealantCalculatorFaqSection() {
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
    name: "Sealant Calculator",
    url: "https://www.tolz.org/calculators/construction/sealant",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online sealant calculator that estimates how much sealant you need from joint length, width, and depth, with wastage allowance, 10 standard cartridge/sausage/pail sizes, custom tube volume, and instant cost estimation.",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sealant Calculator: Find Out How Much Sealant You Need</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out how much sealant to buy is one of those small planning steps that quietly saves a
          construction project from delays and wasted money. Buy too little and you're making a second trip to
          the supplier mid-job; buy too much and you've paid for cartridges that sit unused on a shelf. The
          sealant calculator above solves this by converting your joint's length, width, and depth into a
          precise volume, then matching that volume against real-world packaging so you know exactly how many
          cartridges, sausages, or pails to order. It's part of the free construction tools available on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, built for anyone, contractors, glaziers,
          facilities managers, or DIY homeowners, who need a fast, reliable answer without doing the math by
          hand.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Sealant Calculator Works</h2>
        <p style={pStyle}>
          The calculator is built around a straightforward idea: sealant fills a joint, and a joint has volume.
          You enter three measurements, the length of the joint you're sealing, its width, and its depth, and
          the tool converts those into the total volume of sealant required to fill it completely. From there,
          it goes a step further than a basic volume calculator in three ways.
        </p>
        <p style={pStyle}>
          First, it accounts for wastage. No matter how steady your hand is with a caulking gun, some sealant is
          lost to smoothing, tooling, overfill, and minor spillage. The calculator lets you add a wastage
          percentage on top of the raw volume so your final number reflects real job-site conditions rather
          than a theoretical minimum.
        </p>
        <p style={pStyle}>
          Second, it converts that adjusted volume into purchasable units. Sealant isn't sold by the cubic inch,
          it's sold in tubes, cartridges, sausages, and pails, each with a fixed volume. The calculator supports
          ten standard package sizes covering the most common cartridge, sausage, and pail formats used across
          the sealant industry, plus a custom option where you can enter the exact volume of a tube that isn't
          on the standard list. This means the output isn't just "you need X ounces of sealant", it's "you need
          Y cartridges," which is the number you actually take to the checkout counter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Third, it handles cost estimation. Once you know the package size and how many units you need,
          entering a price per unit gives you an instant total cost for the sealant portion of your project.
          This is particularly useful when you're comparing suppliers or building a materials budget before a
          job starts, since it removes the guesswork of multiplying quantities by price by hand.
        </p>
      </div>

      {/* When needed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'll Need This Tool</h2>
        <p style={pStyle}>
          Sealant estimation comes up far more often than people expect, and getting it wrong has real
          consequences on both ends, running out mid-application leaves a job half-finished with mismatched
          batch colors, while over-ordering ties up budget in unused product. Here are the situations where
          this calculator earns its keep:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Window and door installation.</strong> Every window and door frame has a perimeter joint
            that needs sealing against air and water infiltration. Multiply the frame perimeter by the number
            of openings and you quickly get a joint length that's easy to miscalculate by eye.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Expansion and control joints in concrete.</strong> Slabs, sidewalks, parking structures, and
            precast panels rely on expansion joints to absorb movement from temperature changes. These joints
            often run for dozens or hundreds of linear feet, and sealant for them is priced by the sausage or
            pail rather than by the tube, so an accurate volume estimate matters for the budget.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Curtain wall and facade glazing.</strong> Structural glazing and metal panel systems use
            continuous sealant joints around every panel edge. Contractors bidding this kind of work need a
            dependable quantity estimate before pricing the job, not after.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bathroom, kitchen, and wet-area sealing.</strong> Around tubs, sinks, backsplashes, and
            shower enclosures, sealant is applied in shorter runs but across many separate joints, and it's
            easy to underestimate how many small tubes that adds up to.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Roofing and siding work.</strong> Flashing, seams, and panel overlaps in metal roofing or
            siding often call for a specific volume of sealant per linear foot, and running short partway
            through a roof section is a scheduling problem no one wants.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Aquarium and tank construction.</strong> Sealing glass panels for aquariums or tanks follows
            the same length-width-depth logic, just with silicone rated for that application, and getting the
            bead volume right avoids leaks after the tank is filled.
          </li>
          <li>
            <strong>Budgeting and bidding.</strong> Estimators preparing a quote need a materials number before
            a single tube is opened. A calculator that outputs both quantity and cost turns a rough guess into
            a defensible line item on a proposal.
          </li>
        </ul>
      </div>

      {/* How calculated */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Sealant Quantity Is Actually Calculated</h2>
        <p style={pStyle}>
          Understanding the math behind the number builds confidence in the result, and it's simpler than it
          looks. Sealant volume is calculated as a rectangular prism: multiply the joint's depth by its width by
          its length, and you get the volume of material required to fill that space completely.
        </p>
        <p style={pStyle}>
          If you're working in inches, multiplying depth × width × length gives you cubic inches, and dividing
          by 231 converts that to gallons, or multiplying by roughly 0.554 converts it to fluid ounces. If
          you're working in metric units, the same logic applies using millimeters or centimeters converted to
          milliliters or liters. The calculator handles these conversions automatically, but the underlying
          principle, volume equals depth times width times length, is the same formula manufacturers,
          estimators, and specification sheets have used for decades.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One detail worth understanding: a properly designed sealant joint isn't just as deep as it is
          convenient, it follows a width-to-depth ratio, typically around 2:1, meaning the joint is roughly
          twice as wide as it is deep. This ratio allows the sealant bead to flex without tearing as the joint
          expands and contracts. If your project specification calls for a particular ratio, entering the
          correct depth (rather than just filling the joint to whatever depth happens to exist) will give you a
          more accurate and code-appropriate volume.
        </p>
      </div>

      {/* Measuring */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Measuring Your Joint Correctly Before You Calculate</h2>
        <p style={pStyle}>
          The accuracy of any sealant estimate depends entirely on the accuracy of the measurements you feed
          into it, so it's worth taking an extra minute at this stage. Length should be measured along the
          actual run of the joint, including any corners or turns rather than a straight-line distance between
          two points; a window frame with four sides needs the full perimeter added up, not just the width of
          the opening. Width is the visible gap between the two surfaces being joined, measured at the surface
          rather than deep inside the joint, since many joints taper slightly with depth. Depth is the trickiest
          of the three: it should reflect how deep the sealant itself will sit, not the full depth of the
          cavity. If a backer rod, foam tape, or a bond breaker is being installed first, only the remaining
          space above that material counts as sealant depth.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For irregular joints, say, a run that varies in width along its length, such as an aging concrete
          expansion joint, it's more accurate to measure a few representative sections and use an average width
          rather than a single spot measurement, since sealant volume is highly sensitive to width. A joint
          that's ⅜" wide in one section and ½" wide in another isn't a rounding error; that's a real difference
          in the amount of material needed per foot. When precision matters, as it does on large facade or
          bid-critical jobs, breaking a long, variable joint into shorter segments with consistent dimensions
          and calculating each separately, then summing the results, produces a far more reliable total than
          averaging across the whole run.
        </p>
      </div>

      {/* Package size / cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Choosing the Right Package Size and Estimating Cost</h2>
        <p style={pStyle}>
          Sealant packaging varies more than most people realize, and buying the wrong format for your
          application wastes both money and product. The calculator's ten standard package options cover the
          sizes most commonly stocked by suppliers: smaller cartridges suited to caulking guns for detail work
          like window trim or bathroom fixtures, mid-size sausages designed for higher-volume application with
          pneumatic or battery-powered guns on longer joint runs, and pails intended for large-scale pours or
          bulk application where a gun isn't practical at all.
        </p>
        <p style={pStyle}>
          If your supplier stocks a tube size that isn't on the standard list, some manufacturers use
          proprietary volumes, the custom tube volume input lets you enter that exact figure so the unit count
          stays accurate rather than relying on a rounded approximation.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once quantity is set, the cost estimation step multiplies the number of units by your entered price
          per unit. This is especially useful when comparing options: a smaller cartridge often costs more per
          ounce of sealant than a larger sausage or pail, so seeing the total cost for each package option side
          by side can reveal meaningful savings on larger jobs, particularly for expansion joints or facade work
          where hundreds of feet of joint are involved.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for a More Accurate Estimate</h2>
        <p style={pStyle}>
          A few practical habits improve the accuracy of any sealant estimate, calculator or not. Measuring
          joints after backer rod is installed, not before, backer rod reduces the effective depth of the joint
          and is specifically used to control how much sealant is needed, so measuring depth without accounting
          for it will overstate your requirement. Group joints with identical width and depth together and sum
          their lengths in one calculation, but keep joints with different dimensions separate, since combining
          mismatched widths or depths into a single average will skew the result. Always build in a wastage
          allowance rather than assuming perfect application, even experienced applicators typically account
          for some loss during tooling and cleanup. Finally, round up to the next whole package rather than
          down; a partially used cartridge left over is a minor cost, while running short mid-bead on a
          continuous joint can create a visible seam or delay.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two mistakes account for most inaccurate sealant estimates. The first is guessing joint depth instead
          of measuring it, especially on jobs where backer rod hasn't been installed yet, estimating "about a
          quarter inch" instead of measuring after the rod is set can throw off the volume calculation more
          than any other single factor, since depth is one of three multiplied values and even a small error
          compounds. The second is forgetting that different sealant chemistries and cartridge brands don't
          share identical volumes; a "standard" 10.1 oz cartridge and a 10.3 oz cartridge from a different
          manufacturer will yield a slightly different number of linear feet covered, which is exactly why
          entering the correct package size, or a custom volume when your product falls outside the standard
          sizes, matters more than rounding to the nearest common figure.
        </p>
      </div>

      {/* Free / private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Ready When You Are</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This sealant calculator is completely free to use, with no signup, account creation, or hidden
          charges involved at any step. You can run as many calculations as you need, comparing package sizes,
          adjusting wastage percentages, or recalculating after a measurement changes, without hitting a
          paywall or usage limit. All calculations happen directly in your browser using the numbers you enter;
          no project details, measurements, or files are uploaded or stored anywhere. That means you can use it
          to estimate materials for a client proposal, an internal budget, or a personal home project without
          worrying about sensitive job information being retained. It's built to be a quick, dependable
          reference you can return to on any device, whether you're on a job site with a tape measure in hand
          or drafting a materials list at a desk.
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
