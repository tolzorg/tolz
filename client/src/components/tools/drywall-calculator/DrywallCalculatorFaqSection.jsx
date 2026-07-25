import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much drywall do I need for a 12x12 room?",
    a: "For a standard 12x12 room with 8-foot ceilings, the four walls total roughly 384 square feet before subtracting doors and windows. After typical openings are deducted and a waste allowance is applied, this generally works out to around 10–12 standard 4x8 sheets, though the exact number depends on ceiling height, panel size, and how many openings the room has. Entering your specific dimensions into the calculator gives an exact figure rather than a rough average.",
  },
  {
    q: "What size drywall sheet should I use?",
    a: "Standard sizes are typically 4 feet wide with lengths of 8, 10, or 12 feet, though other metric sizes are available depending on the project. Larger sheets reduce the number of seams on tall or long walls, while smaller sheets are easier to handle in tight spaces or rooms with many corners and cutouts.",
  },
  {
    q: "Does the calculator account for doors and windows?",
    a: "Yes. You can enter door and window dimensions directly, and the calculator automatically subtracts that area from the total wall area so you're not ordering material for space that won't be covered.",
  },
  {
    q: "Can I calculate drywall for sloped ceilings or attic spaces?",
    a: "Yes. The tool includes a dedicated input for sloped-wall areas, which is essential for attics, dormers, and rooms with angled ceilings where standard rectangular math would produce an inaccurate estimate.",
  },
  {
    q: "Is this drywall calculator really free, and do I need to sign up?",
    a: "Yes, the tool is completely free with no signup, account creation, or hidden charges. You enter your measurements and receive results immediately.",
  },
  {
    q: "How accurate is the cost estimate?",
    a: "The cost estimate is based on the number of panels calculated from your dimensions and panel size selection, giving a realistic materials-only figure. Actual pricing can vary by supplier and region, so it's a strong planning estimate rather than a final quote.",
  },
  {
    q: "How much waste should I account for when ordering drywall?",
    a: "Most professional estimators build in an allowance of roughly 10–15% for cuts, seams, and fitting around corners and fixtures, which helps avoid running short on the last wall of a project.",
  },
  {
    q: "Do I need different drywall for ceilings versus walls?",
    a: "Ceiling applications often use a slightly thicker or sag-resistant panel to prevent drooping over time, while standard wall panels are typically thinner. If your project includes both, calculating them separately gives a more accurate material list for each.",
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

export default function DrywallCalculatorFaqSection() {
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
    name: "Drywall Calculator",
    url: "https://www.tolz.org/calculators/construction/drywall",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: "Free online drywall calculator that estimates the amount of drywall needed from room dimensions, sloped-wall areas, doors, and windows. Supports 9 standard panel sizes and instant cost estimation.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Drywall Calculator: Estimate Sheets, Materials & Cost Instantly</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out how much drywall a project actually needs is one of those calculations that looks simple
          until you're staring at a room with a sloped ceiling, two doors, and three windows, wondering whether
          to round up or down. Overestimate and you're paying for sheets that sit in the garage for years;
          underestimate and you're making a second trip to the supplier mid-project, hoping they still stock
          the same batch. The drywall calculator on <Link to="/" className="inline-home-link">Tolz</Link>
          {" "}removes that guesswork by turning your room dimensions into a precise material list in seconds,
          accounting for wall area, sloped sections, door and window cutouts, and panel size, so you know
          exactly what to buy before you pick up a single sheet.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Drywall Calculator Does</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool takes the raw numbers of your space, length, width, height, and any sloped-wall or ceiling
          sections, and converts them into a usable material estimate. Instead of manually working out square
          footage for every wall, subtracting door and window openings by hand, and then dividing that number
          by a panel size you're only half sure of, the calculator does it all at once. You get the total
          drywall area needed, the number of panels required based on the size you select, and an estimated
          cost, all recalculated instantly if you change a single measurement. It's built for anyone planning a
          renovation, a new build, or a repair job who wants a reliable number without opening a spreadsheet.
        </p>
      </div>

      {/* How much drywall */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Drywall Do I Need? Understanding the Calculation</h2>
        <p style={pStyle}>
          The core of any drywall estimate is straightforward in theory: multiply the height and width of each
          wall (and ceiling, if applicable) to get square footage, add those figures together, then subtract
          the area taken up by doors and windows since those sections don't need board. In practice, most
          people get tripped up by three things, sloped walls that don't have a single consistent height,
          openings that are easy to forget or miscount, and the leftover waste that comes from cutting sheets
          to fit corners, outlets, and odd angles.
        </p>
        <p style={pStyle}>
          The calculator handles sloped-wall areas by letting you enter the relevant dimensions separately
          rather than forcing a flat rectangular assumption onto an angled ceiling or knee wall, which is where
          most manual estimates go wrong. It also lets you input door and window measurements directly, so
          those openings are automatically deducted from the total area rather than left for you to subtract
          afterward. This matters because even a single miscounted doorway can throw off a material order by a
          full sheet or more, and on larger jobs those small errors compound quickly.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A well-built estimate also builds in a reasonable allowance for waste and cutoffs. Drywall sheets
          rarely divide perfectly into a room's actual dimensions, so a portion of every panel is typically
          trimmed away at seams, corners, and around fixtures. Professional estimators commonly work with a
          waste margin in the range of 10–15% depending on room complexity, and factoring this in upfront
          avoids the frustration of running short by half a sheet on the final wall.
        </p>
      </div>

      {/* Panel sizes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Standard Drywall Panel Sizes Explained</h2>
        <p style={pStyle}>
          Drywall doesn't come in a single universal size, and choosing the wrong one for your project can mean
          more seams, more joint compound, and more labor than necessary. The calculator supports nine standard
          metric panel sizes, giving you the flexibility to match your material order to the actual dimensions
          of your walls and ceilings rather than defaulting to whatever size happens to be most common.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Smaller panels are easier to maneuver in tight spaces, stairwells, or rooms with a lot of corners and
          cutouts, which reduces waste in complex layouts even though it means more seams to finish. Larger
          panels cover more surface area per sheet, which reduces the number of joints that need taping and
          sanding, a real advantage on tall walls or long, uninterrupted runs where fewer seams mean a smoother
          finished surface and less finishing labor overall. Selecting the right panel size for the specific
          wall or ceiling section you're working on, rather than using one size for the entire project, is one
          of the most effective ways to control both material cost and finishing time.
        </p>
      </div>

      {/* Cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Drywall Cost</h2>
        <p style={pStyle}>
          Once the calculator determines how many panels your project requires, it converts that figure into an
          instant cost estimate. This gives you a realistic budget figure before you contact a supplier, which
          is particularly useful when you're comparing project options or deciding whether a DIY approach makes
          financial sense compared to hiring a contractor who sources material at trade pricing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Cost estimation is also useful for phased projects. If you're renovating room by room rather than all
          at once, running the numbers for each space separately lets you budget accurately per phase instead
          of relying on a single rough total for the entire home. Because the tool recalculates instantly when
          you adjust dimensions or panel size, it's easy to compare a few different configurations, say,
          standard panels versus a mix of sizes, and see which option keeps material cost lower without
          compromising the finish.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need a Drywall Calculator: Practical Scenarios</h2>
        <ul style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning a full room renovation.</strong> Whether you're finishing a basement, converting a
            garage, or gutting and rebuilding a bedroom, knowing the total drywall requirement upfront lets you
            order materials in one trip and avoid mid-project delays waiting on a supplier restock.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Building an addition or new construction.</strong> Contractors and homeowners working on
            new-build spaces need accurate material takeoffs for budgeting and ordering, especially when
            multiple rooms are being framed and finished on a tight schedule.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Repairing water or impact damage.</strong> Not every job involves an entire room. If you're
            replacing a damaged section of wall or ceiling, entering just that area's dimensions gives you a
            precise, small-scale estimate instead of over-ordering a full sheet count meant for larger jobs.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Finishing an attic or sloped-ceiling space.</strong> Attics, dormers, and rooms with angled
            ceilings are notoriously difficult to estimate by hand because standard square-footage math doesn't
            account for the slope. This is exactly the scenario the sloped-wall input is designed to solve.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing DIY versus contractor costs.</strong> Homeowners weighing whether to do the work
            themselves often want a realistic materials-only cost figure to compare against contractor quotes,
            which typically bundle labor and material together.
          </li>
          <li>
            <strong>Bidding or quoting a job.</strong> Contractors preparing a quote for a client benefit from a
            fast, repeatable way to generate material estimates for multiple rooms without recalculating
            formulas manually for each space.
          </li>
        </ul>
      </div>

      {/* Accuracy / privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Ease of Use</h2>
        <p style={pStyle}>
          The calculator is free to use, requires no signup or account creation, and carries no hidden charges,
          you enter your measurements and get results immediately, with no email address or payment information
          requested at any point. Because all calculations run directly in your browser based on the numbers
          you provide, there's no file upload involved and nothing about your project is stored or shared; the
          tool simply processes the dimensions you enter and returns an estimate for that session.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Accuracy depends primarily on the quality of the measurements you input, so it's worth double-checking
          wall heights, especially on sloped sections, and confirming door and window dimensions against actual
          frame sizes rather than rough estimates. The calculator's job is to eliminate arithmetic errors and
          ensure nothing is forgotten in the calculation; your job is to measure the space correctly. Use this
          way, it produces results reliable enough to take directly to a supplier for an order.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting the Most Accurate Estimate</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Measure each wall individually rather than assuming all walls in a room share the same dimensions,
          even small variations in height between walls, common in older homes, can affect your total. When
          measuring sloped walls or ceilings, take the measurement at the point where the slope changes rather
          than averaging it, since the tool is designed to handle these sections as distinct inputs. Round door
          and window measurements up slightly rather than down, since underestimating openings inflates your
          material need while overestimating them simply means a marginally more conservative (and still
          accurate) order. Finally, always factor in a waste allowance for cuts and seams rather than ordering
          the exact bare-minimum square footage, since almost no real-world room uses 100% of every panel
          without trim.
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
