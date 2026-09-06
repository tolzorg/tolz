import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How accurate is the decking calculator?",
    a: "The calculator provides a strong estimate based on standard board spacing, joist spacing, and fastening patterns, plus a 10% waste allowance. Actual material needs can vary slightly depending on deck shape, cutouts, and local building requirements, so treat the result as a reliable planning figure rather than a final structural specification.",
  },
  {
    q: "Do I need to sign up to use this decking calculator?",
    a: "No. The tool is completely free and doesn't require an account, email address, or any personal information to use.",
  },
  {
    q: "Does the calculator work for composite decking as well as timber?",
    a: "Yes. The board and cost calculations apply to any material type, since you enter your own board dimensions and unit prices. This makes it suitable for timber, composite, and PVC decking alike.",
  },
  {
    q: "How many screws do I need per decking board?",
    a: "The standard pattern used by the calculator is two fasteners per board at each joist crossing. The exact count scales with the number of joists your deck has, so entering accurate joist spacing gives the most precise fastener total.",
  },
  {
    q: "What's the difference between using screws and hidden clips?",
    a: "Screws and nails are visible on the board surface and are generally the lower-cost option. Hidden clips create a fastener-free surface and can reduce water pooling around fastener holes, but typically cost more per linear foot of decking covered.",
  },
  {
    q: "Why does the calculator add 10% extra material?",
    a: "The 10% waste factor accounts for cutting losses around edges, stairs, and irregular layouts, plus occasional defective boards. It reflects a practical purchase quantity rather than the bare theoretical minimum.",
  },
  {
    q: "Can I use this calculator for a small patio or balcony with decking tiles?",
    a: "Yes. The tool supports square-profile decking tiles, calculating the number of tiles needed based on total deck area and individual tile coverage, with the same waste allowance applied.",
  },
  {
    q: "Is the cost estimate from the calculator final?",
    a: "No. The cost figure is generated from the unit prices you enter, so it reflects your specific supplier's pricing rather than a fixed rate. Always confirm final material prices with your supplier before purchasing.",
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

export default function DeckingCalculatorFaqSection() {
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
        <h2 style={h2Style}>Decking Calculator: Estimate Boards, Fasteners, and Total Cost</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Planning a deck starts with knowing exactly what to buy, and that's where a reliable decking
          calculator makes the difference between an accurate materials list and a guessing game. This free
          tool from <Link to="/" className="inline-home-link">Tolz</Link> is built to take the manual math out
          of deck planning, enter your deck dimensions and board specifications, and it works out how many
          decking boards you need, the fasteners required (screws, nails, or hidden clips), and the total
          estimated cost, including a built-in 10% waste allowance. Whether you're building a small patio deck
          or replacing boards on an existing structure, this calculator gives you numbers you can actually plan
          a purchase around.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Decking Calculator Works</h2>
        <p style={pStyle}>
          The calculator uses your deck's length and width, along with the dimensions of the decking boards you
          plan to use, to determine the total square footage of your project and how many individual boards are
          required to cover it. It accounts for standard board coverage width, so gaps between boards used for
          drainage and expansion are already factored into the layout, rather than being an afterthought you
          have to calculate separately. Once the board count is established, the tool moves to fasteners,
          calculating either the number of screws or nails needed per board based on typical fastening
          patterns, or the number of hidden clips required if you're using a clip-based, screw-free
          installation system. Finally, it multiplies board count and fastener count against the unit prices
          you enter to produce a full material cost estimate, so you leave with both a shopping list and a
          budget figure in one pass.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because manual decking takeoffs are one of the most common sources of budget overruns in
          small construction and home improvement projects. A single miscalculation in board count can mean an
          extra trip to the supplier, mismatched batch colors on stained composite decking, or a fastener
          shortfall discovered mid-install. Automating the arithmetic removes that risk and gives you a number
          you can rely on before you place an order.
        </p>
      </div>

      {/* How many boards */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Decking Boards Do You Need?</h2>
        <p style={pStyle}>
          The number of decking boards required depends on three variables: the total area of the deck, the
          width of each board (including the gap left for spacing), and the length of the boards you intend to
          buy or have cut. For example, a deck measuring 12 feet by 16 feet covers 192 square feet. If you're
          using boards that are 5.5 inches wide with a standard ⅛-inch gap, the calculator determines how many
          board-widths fit across the deck's width, then multiplies that by the number of board lengths needed
          to cover the deck's length, factoring in how boards are typically laid perpendicular to the joists.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is where doing the math by hand tends to go wrong. Homeowners often forget to account for the
          spacing gap, which compounds across a large deck and can throw off a board count by several units.
          Others miscalculate when board lengths don't divide evenly into deck dimensions, leading to
          unaccounted-for offcuts. The calculator handles both of these automatically, giving a board count
          that reflects how the deck will actually be built, not just a simple area-divided-by-board-width
          estimate.
        </p>
      </div>

      {/* Fasteners */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Screws, Nails, or Hidden Clips: Calculating Fasteners</h2>
        <p style={pStyle}>
          Fastener choice affects both the finished look of a deck and the total cost, so the calculator lets
          you choose between traditional screws or nails and hidden clip systems. For screw or nail-based
          installations, the tool estimates two fasteners per board at every joist crossing, which is the
          standard fastening pattern recommended for most decking materials to prevent board movement, cupping,
          and squeaking over time. This means the fastener count scales directly with both the number of boards
          and the number of joists your deck substructure has, so an accurate joist spacing input matters for a
          precise result.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Hidden clip systems work differently, clips sit between boards along the joists and are covered once
          the next board is installed, producing a screw-free surface. The calculator adjusts its fastener math
          accordingly when clips are selected, since clip spacing and quantity per board differ from screw
          patterns. Choosing between the two isn't purely aesthetic: hidden clips typically cost more per
          linear foot of coverage than screws, but they eliminate visible fastener heads and reduce the risk of
          water pooling around screw holes, which can extend the lifespan of the decking surface. Running both
          options through the calculator before committing lets you compare the real cost difference rather
          than estimating it.
        </p>
      </div>

      {/* Cost estimation */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Total Decking Cost Estimation</h2>
        <p style={pStyle}>
          Once board count and fastener count are established, the calculator produces a total cost estimate by
          applying the unit prices you provide for boards and fasteners. This is intentionally left as a user
          input rather than a fixed price, since decking material costs vary significantly by region, supplier,
          and material type, timber, composite, and PVC decking all sit in different price brackets, and prices
          shift with lumber markets and seasonal demand. By entering your actual quoted prices, the output
          reflects a realistic budget for your specific project rather than a generic national average that may
          not match what you'll actually pay.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This cost estimate is useful beyond the initial purchase decision. It gives you a baseline figure to
          compare against supplier quotes, helps you evaluate whether a material upgrade (such as moving from
          pressure-treated lumber to composite boards) fits your budget, and provides a documented estimate if
          you're seeking approval or financing for a larger deck build. Because the calculator recalculates
          instantly when you change any input, you can quickly compare several material and fastener
          combinations side by side before finalizing your order.
        </p>
      </div>

      {/* Waste factor */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why the 10% Waste Factor Matters</h2>
        <p style={pStyle}>
          Every decking project generates waste, boards get cut to fit around posts, stairs, or irregular deck
          shapes, and offcuts from those cuts usually aren't reusable for the next section. The calculator
          applies a 10% waste allowance on top of the raw board count to account for this, which aligns with
          the waste margin generally recommended for straightforward rectangular deck layouts. This means the
          number you see isn't just the theoretical minimum required to cover your deck's square footage, it's
          a practical purchase quantity that accounts for cutting losses, occasional board defects discovered
          during installation, and minor layout adjustments made on-site.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Skipping a waste allowance is one of the most common reasons deck installations run short on materials
          partway through the build, particularly around stair cutouts, curved edges, or deck sections with
          multiple angles. Ordering to the exact theoretical minimum almost always results in a mid-project
          shortfall, so the built-in buffer removes that risk without requiring you to manually pad your order
          and guess at a safe margin.
        </p>
      </div>

      {/* Tiles */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Square-Profile Decking Tiles</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond standard board-and-joist decking, the calculator also supports square-profile decking tiles, a
          popular option for balconies, rooftop decks, and smaller patio areas where interlocking tiles are laid
          directly over an existing hard surface rather than built on a joist substructure. Because tiles are
          sold as fixed-size units rather than continuous boards, the calculation approach differs: instead of
          dividing deck length by board length, the tool divides your total deck area by the coverage area of a
          single tile to determine how many tiles are needed, again applying the 10% waste factor to account for
          edge cuts and pattern adjustments. This makes the calculator equally useful whether you're planning a
          full timber deck build or a quicker tile-based patio refresh.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need This Tool: Practical Scenarios</h2>
        <p style={pStyle}>
          A decking calculator is useful at several distinct points in a project, not just at the very
          beginning. If you're in the early planning stage and comparing whether a deck fits your budget,
          running your rough dimensions through the tool gives you a realistic cost range before you commit to a
          design. If you've already finalized your deck plan and are ready to order materials, the calculator
          gives you the precise board, fastener, and cost figures needed to place an accurate order with your
          supplier, reducing the chance of under-ordering or over-ordering.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool is equally useful for repair and replacement projects. If sections of an existing deck have
          rotted, warped, or need replacing, entering just the affected area's dimensions gives you a targeted
          materials list without having to recalculate the entire deck. Contractors and tradespeople quoting
          multiple jobs can also use it to quickly generate consistent, defensible material estimates for
          clients, rather than relying on rough mental math that can vary from quote to quote. And for anyone
          comparing material options, timber versus composite, screws versus hidden clips, running each scenario
          through the calculator turns an abstract cost comparison into concrete numbers.
        </p>
      </div>

      {/* Accuracy / privacy / trust */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Trust</h2>
        <p style={pStyle}>
          This decking calculator is free to use with no signup required, so you can run as many calculations as
          you need without creating an account or providing personal information. No data you enter, deck
          dimensions, material choices, or pricing, is stored or shared; calculations happen directly in your
          browser session and are discarded once you close or refresh the page. There are no hidden charges,
          upsells, or premium tiers gating the results; every feature described in this guide, from board
          counts to cost totals, is available in the free version.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That said, the tool is designed to produce a strong planning-grade estimate, not a substitute for a
          structural plan or a formal quote from a licensed contractor. Local building codes may require
          specific joist spacing, fastening patterns, or permit approvals that affect material quantities beyond
          what a general calculator can account for. For any deck involving structural framing, elevated
          platforms, or load-bearing considerations, use this tool for budgeting and initial planning, and
          confirm final specifications with a qualified professional before construction begins.
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
