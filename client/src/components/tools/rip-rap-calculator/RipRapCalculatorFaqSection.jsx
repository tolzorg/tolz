import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is D₅₀ in rip rap sizing?",
    a: "D₅₀ is the median stone diameter of a riprap gradation, meaning 50% of the rock by weight is larger than this size and 50% is smaller. It's the primary value used to specify riprap for erosion control projects.",
  },
  {
    q: "What is the Isbash equation used for?",
    a: "The Isbash equation relates water velocity to the minimum stone size needed to resist movement. It's one of the most widely used methods for sizing riprap in channels, spillways, and bank protection projects.",
  },
  {
    q: "How much rip rap do I need for a project?",
    a: "Volume depends on the area to be covered and the placement depth, which is typically 1.5 to 2 times the D₅₀ value. Enter your area and depth into the calculator to get an estimated volume in cubic yards or cubic meters, along with an approximate weight and cost.",
  },
  {
    q: "Is this rip rap calculator free to use?",
    a: "Yes. The calculator is completely free, with no signup, no account, and no usage limits.",
  },
  {
    q: "Does the calculator work in both metric and imperial units?",
    a: "Yes. You can enter values and receive results in either metric or imperial units, so the output matches your project's unit system.",
  },
  {
    q: "Can I use this calculator for a permitted or regulated project?",
    a: "The calculator provides reliable preliminary sizing based on standard engineering assumptions, but permitted, public, or high-consequence projects should have final riprap design reviewed and approved by a licensed engineer familiar with local requirements.",
  },
  {
    q: "What affects the required rip rap size besides velocity?",
    a: "Slope angle, rock specific gravity, and the stability coefficient (flat bed versus sloped embankment) all influence the required D₅₀, in addition to design velocity.",
  },
  {
    q: "Does the tool store any of my project data?",
    a: "No. Inputs are used only to generate your calculation and are not stored, saved, or shared.",
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

export default function RipRapCalculatorFaqSection() {
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Designing erosion control or slope protection starts with one question: how big does the rock need
          to be? This rip rap calculator answers that question in seconds. Built on the widely used Isbash
          equation, it calculates the required median rock diameter (D₅₀) for a given flow velocity, then lets
          you estimate the volume, weight, and approximate cost of material needed for your project. Whether
          you're stabilizing a streambank, protecting a culvert outlet, or armoring a channel slope, this free
          tool from Tolz removes the guesswork from riprap sizing.
        </p>
      </div>

      {/* What is rip rap */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is Rip Rap and Why Does D₅₀ Matter?</h2>
        <p style={pStyle}>
          Rip rap is a layer of large, durable rock placed along shorelines, channel banks, culvert outlets,
          spillways, and slopes to resist the erosive force of moving water. Unlike uniform gravel or crushed
          stone, riprap is deliberately graded, a mix of rock sizes engineered to interlock and stay in place
          under hydraulic stress.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The single most important design value in any riprap project is D₅₀, the median stone diameter. It
          means that 50% of the rock, by weight, is larger than this size and 50% is smaller. Undersized rock
          washes away during high flows, leading to scour, slope failure, and expensive repairs. Oversized
          rock wastes money on material and transport. Getting D₅₀ right the first time is what separates a
          stable installation from a recurring maintenance problem, which is exactly why engineers,
          contractors, and DIY property owners rely on a dedicated riprap size calculator rather than rough
          estimates.
        </p>
      </div>

      {/* Isbash equation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Isbash Equation Powers This Calculator</h2>
        <p style={pStyle}>
          The calculator uses the Isbash equation, one of the most established methods for determining stone
          size based on flow velocity. In simple terms, the Isbash method relates the velocity of water moving
          across the rock to the size and density of stone required to resist being displaced. Faster water
          requires larger, heavier rock; slower water allows for smaller stone sizes.
        </p>
        <p style={pStyle}>
          To use the tool, you enter the design velocity of the water at the point of interest, along with
          relevant parameters such as the specific gravity of the rock and a safety or stability coefficient
          that reflects whether the rock will be positioned on a flat bed or a sloped embankment. The
          calculator processes these inputs through the Isbash formula and returns the required D₅₀ instantly.
          Because the tool supports both metric and imperial units, you can enter velocity in feet per second
          or meters per second and receive results in the unit system that matches your project drawings or
          local building codes, without needing to convert anything manually.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because manual calculation of the Isbash equation is easy to get wrong, a single unit
          mismatch or misplaced decimal can lead to significantly undersized protection. Automating the
          calculation reduces that risk and speeds up the early design phase of any erosion-control project.
        </p>
      </div>

      {/* Volume/weight/cost */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estimating Rip Rap Volume, Weight, and Cost</h2>
        <p style={pStyle}>
          Knowing the required D₅₀ is only the first step. Once you know the target stone size, the next
          practical question is how much material to order and what it will cost. This calculator extends
          beyond basic sizing to handle that second half of the project.
        </p>
        <p style={pStyle}>
          By entering the area you need to cover and the desired placement depth, the tool estimates the
          total volume of rip rap required, typically expressed in cubic yards or cubic meters depending on
          your selected unit system. Placement depth is usually specified as a multiple of D₅₀ (commonly 1.5
          to 2 times the median stone diameter) to ensure adequate layer thickness and interlock between
          stones, and the calculator's volume output reflects that relationship.
        </p>
        <p style={pStyle}>
          From volume, the tool converts to estimated weight using standard rock density assumptions, giving
          you a tonnage figure that aligns with how most quarries and suppliers price and deliver riprap.
          Finally, if you provide a price per ton or per cubic yard, the calculator produces an approximate
          material cost. This lets contractors put together a preliminary budget or material order without
          waiting on a formal quote, and it helps property owners sanity-check bids from suppliers before
          committing to a purchase.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth noting that these figures are engineering estimates meant to guide planning and
          procurement. Actual quantities can vary based on slope irregularities, waste factors during
          placement, and supplier-specific rock density, so a reasonable contingency (commonly 5–10%) is a
          good practice when finalizing an order.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Rip Rap Calculator: Practical Scenarios</h2>
        <p style={pStyle}>
          Rip rap sizing comes up across a wide range of civil, agricultural, and residential projects. Some
          of the most common situations include:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Streambank and shoreline stabilization.</strong> Property owners and municipalities use
            riprap to prevent bank erosion along rivers, creeks, and lakeshores, especially where currents or
            wave action are actively undercutting the soil. Correct D₅₀ sizing is critical here, since
            undersized rock in a fast-moving channel will simply be swept downstream.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Culvert inlet and outlet protection.</strong> Water exiting a culvert at high velocity can
            quickly erode the surrounding soil and undermine the culvert structure itself. Engineers commonly
            specify riprap aprons at these locations, and this calculator provides the sizing data needed to
            spec that apron correctly.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Stormwater channel and spillway lining.</strong> Detention pond outlets, drainage swales,
            and emergency spillways experience intermittent but sometimes intense flows. Riprap lining
            protects the channel bed and sides during these high-flow events.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Driveway and rural road crossings.</strong> Low-water crossings and unpaved roads that
            cross drainage paths often use riprap to resist scour from periodic flooding, particularly in
            rural and agricultural settings.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Construction site erosion control.</strong> Temporary riprap is frequently used during
            construction to protect exposed soil and drainage outlets until permanent vegetation or
            hardscaping is established.
          </li>
          <li>
            <strong>Bidding and budgeting.</strong> Contractors preparing proposals need quick, defensible
            volume and cost estimates before committing to a firm price, and this tool provides that without
            requiring a full geotechnical workup for preliminary numbers.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the calculator serves both the technical sizing question (what D₅₀ do I
          need?) and the practical logistics question (how much rock, and roughly what will it cost?), making
          it useful at multiple stages of a project, from initial planning through material procurement.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Methodology, and Trust</h2>
        <p style={pStyle}>
          This calculator applies the Isbash equation using standard engineering assumptions for specific
          gravity, safety coefficients, and depth-to-D₅₀ ratios that are consistent with common design guidance
          used in erosion-control practice. That said, riprap design for permitted, high-consequence, or
          regulated projects, such as public infrastructure, dams, or projects requiring agency approval,
          should always be reviewed and signed off by a qualified civil or geotechnical engineer familiar with
          local hydraulic conditions and code requirements. This tool is designed to support fast, reliable
          preliminary sizing and budgeting, not to replace stamped engineering design where one is legally or
          contractually required.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the practical side, the tool is completely free to use, requires no signup or account creation,
          and places no limit on how many times you can run a calculation. Nothing you enter is stored, the
          values you input exist only in your browser session for the purpose of generating your result, and
          no personal or project data is collected, saved, or shared. There are no hidden charges,
          subscriptions, or premium tiers gating the core calculation; the full Isbash sizing tool along with
          the volume, weight, and cost estimator is available at no cost, every time you use it.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting Accurate Results</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few practical notes will help you get results you can actually rely on. First, use a realistic
          design velocity rather than an average one, riprap needs to survive peak flow conditions, not
          typical ones, so pull your velocity figure from a hydraulic model or flood study where possible.
          Second, confirm which specific gravity value applies to your local rock source; granite, limestone,
          and basalt have different densities, and this affects both the D₅₀ output and the weight-based cost
          estimate. Third, remember that slope angle matters, rock on a steep embankment requires a larger D₅₀
          than the same velocity would demand on a flat channel bed, so make sure you're selecting the correct
          placement condition in the calculator. Finally, always round up to the nearest commercially available
          riprap class when ordering, since suppliers sell graded rock in standard classes rather than exact
          custom sizes.
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
