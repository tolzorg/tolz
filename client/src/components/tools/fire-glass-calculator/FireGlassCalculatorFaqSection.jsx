import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much fire glass do I need for my fire pit?",
    a: "It depends on your fire pit's shape, size, and desired fill depth. As a general reference, a 2-foot round fire pit filled to a 2-inch depth typically needs somewhere around 15–20 pounds of fire glass, but the exact amount varies by glass density. Using the calculator with your specific measurements gives a far more accurate figure than general estimates.",
  },
  {
    q: "What's the difference between reflective and recycled fire glass?",
    a: "Reflective fire glass has a metallic coating that enhances light and flame reflection, giving it a brighter, more vivid appearance, while recycled fire glass is made from repurposed glass with a more natural, matte finish. They can also differ slightly in density, which affects how much weight is needed to fill the same pit.",
  },
  {
    q: "How deep should fire glass be in a fire pit?",
    a: "Most fire pits look best and function properly with a 2 to 4-inch layer of fire glass. Two inches is typically the minimum for gas fire pits to keep burner ports clear, while three to four inches gives a fuller, more polished appearance.",
  },
  {
    q: "Can I use this calculator for a custom-shaped fire pit?",
    a: "Yes. The calculator supports round, square, rectangular, triangular, and trapezoidal fire pits, and includes a custom density option for glass types that don't match the standard reflective or recycled presets.",
  },
  {
    q: "Is fire glass sold by weight or volume?",
    a: "Fire glass is almost always sold by weight (typically in pound-based bags), not by volume. That's why a calculator that converts your fire pit's dimensions into a weight-based figure is more useful than a volume estimate alone.",
  },
  {
    q: "Do I need to buy extra fire glass beyond the calculated amount?",
    a: "It's generally a good idea to round up by 5–10% to account for settling and minor measurement differences, and because fire glass is typically sold in fixed bag sizes rather than exact custom amounts.",
  },
  {
    q: "Is the fire glass calculator free to use?",
    a: "Yes, the tool is completely free with no signup required and no hidden costs. Your entered measurements aren't stored, so you can use it as many times as needed for different fire pit shapes or projects.",
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

export default function FireGlassCalculatorFaqSection() {
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
    name: "Fire Glass Calculator",
    url: "https://www.tolz.org/calculators/construction/fire-glass",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online fire glass calculator to determine how much fire glass you need for round, square, rectangular, triangular, or trapezoidal fire pits, based on reflective, recycled, or custom glass density.",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={webAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Fire Glass Calculator: Find the Exact Amount of Fire Glass You Need</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out how much fire glass to buy is one of those small details that can throw off an entire
          fire pit project, order too little and you're stuck with a dull, uneven flame bed; order too much
          and you've overspent on glass you didn't need. The fire glass calculator on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> removes that guesswork. Enter your fire pit's
          shape and dimensions, choose a glass density preset or set a custom one, and the tool instantly
          returns the exact weight of fire glass required to fill your pit properly. It works for round,
          square, rectangular, triangular, and trapezoidal fire pits, so whether you're building a custom
          outdoor feature or replacing glass in an existing one, you get a number you can actually shop with.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Fire Glass Calculator Works</h2>
        <p style={pStyle}>
          The calculator asks for two things: the shape and size of your fire pit, and the type of fire glass
          you're using. Once you select a shape, you'll fill in the relevant measurements, diameter for a round
          pit, length and width for a square or rectangular one, base and height for a triangular pit, or the
          parallel sides and height for a trapezoidal design. From there, you set your desired fill depth (most
          fire pits use two to four inches of glass) and choose a density preset.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because fire glass isn't sold by volume the way sand or gravel often is, but by weight, the
          calculator converts your fire pit's volume into pounds based on the density of the glass type you've
          selected. This is the step most manual calculations get wrong, people estimate volume correctly but
          then guess at the weight, which either wastes money on unnecessary purchases or leaves the pit
          under-filled. The tool handles that conversion automatically, so the final number reflects what
          you'll actually need to order.
        </p>
      </div>

      {/* Density */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Fire Glass Density: Reflective, Recycled, or Custom</h2>
        <p style={pStyle}>
          Fire glass isn't a single uniform product, and density varies noticeably between types, which is why
          the calculator offers separate presets rather than a single fixed number.
        </p>
        <p style={pStyle}>
          <strong>Reflective fire glass</strong> is tempered glass with a metallic coating that catches and
          amplifies light from the flame, giving it a brighter, more dramatic look. It tends to be slightly
          heavier per cubic foot than untreated glass because of the coating and manufacturing process, and
          it's the most common choice for gas fire pits and fire tables where visual effect matters.
        </p>
        <p style={pStyle}>
          <strong>Recycled fire glass</strong> is made from repurposed glass, tumbled smooth for safety, and
          typically has a more matte or semi-transparent finish. Its density can vary a bit more depending on
          the manufacturer and glass source, which is why checking the packaging for a stated weight-per-volume
          figure is worth doing before you buy.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Custom density</strong> is included for cases where your supplier lists a specific density
          that doesn't match either standard preset, or when you're working with a specialty glass type.
          Entering that number directly keeps the calculation accurate instead of forcing you to round to a
          generic average, a meaningful difference on larger fire pits where even a small density error
          compounds into pounds of over- or under-ordering.
        </p>
      </div>

      {/* Shapes */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Fire Glass by Fire Pit Shape</h2>
        <p style={pStyle}>
          Fire pits come in more shapes than most calculators account for, and each one requires a different
          formula to get an accurate volume. This is where a dedicated fire glass calculator earns its value
          over a rough manual estimate.
        </p>
        <p style={pStyle}>
          <strong>Round fire pits</strong> are the most common residential shape. The calculator uses the
          radius (half the diameter) to determine the circular area, then multiplies by your chosen fill depth
          to get volume. Because round pits are symmetrical, this is usually the most forgiving shape to
          measure accurately at home, a single diameter reading is often all you need.
        </p>
        <p style={pStyle}>
          <strong>Square and rectangular fire pits</strong> are common in built-in patio installations and fire
          tables. Volume here is simply length multiplied by width multiplied by fill depth, but accuracy
          depends on measuring the interior of the pit, the actual glass-holding area, rather than the outer
          dimensions of the structure, which is a mistake that leads to over-ordering.
        </p>
        <p style={pStyle}>
          <strong>Triangular fire pits</strong>, while less common, show up in modern angular patio designs.
          The calculator uses the base and height of the triangle to determine area before applying depth,
          which is harder to eyeball manually than rectangular shapes and is where a calculator saves the most
          time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Trapezoidal fire pits</strong> appear in custom-built or architecturally designed outdoor
          features, often as a transitional shape between a square base and a narrower opening. The calculator
          averages the two parallel sides and multiplies by the height to get area, a calculation most people
          wouldn't attempt manually, which makes this shape option particularly useful for anyone with a
          non-standard build.
        </p>
      </div>

      {/* Depth */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Deep Should Your Fire Glass Layer Be?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Fill depth affects both appearance and function, and it's one of the most searched practical
          questions around fire glass. A depth of two inches is generally enough for a clean, even look and is
          the minimum recommended for most gas fire pits, since burner ports need to stay clear for proper
          flame distribution. Three to four inches gives a fuller, more finished appearance and is common in
          fire tables and decorative installations where the glass bed is highly visible. Going beyond four
          inches rarely improves the look and can actually restrict gas flow or create uneven flames, so it's
          worth checking your fire pit burner's manufacturer guidance before maximizing depth. The calculator
          lets you adjust this figure directly, so you can compare how a two-inch fill versus a four-inch fill
          changes your total glass requirement before you commit to a purchase.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Fire Glass Calculator (Practical Scenarios)</h2>
        <p style={pStyle}>A few situations come up repeatedly for anyone searching for this kind of tool:</p>
        <ul style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Building a new fire pit.</strong> Whether it's a DIY backyard build or a professionally
            installed gas fire feature, knowing the exact glass weight upfront prevents multiple return trips
            to a supplier or paying for rush shipping on a second order.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Replacing old or discolored glass.</strong> Fire glass can dull or discolor over years of
            use from heat exposure and weather, and homeowners often want to refresh a pit without over-buying
            replacement glass for a space they already know the dimensions of.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Switching glass types.</strong> Moving from recycled to reflective glass, or adjusting
            depth for a different look, changes the required weight even if the fire pit itself hasn't changed,
            recalculating avoids buying based on outdated assumptions.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Quoting a project.</strong> Landscapers, patio installers, and outdoor living contractors
            often need quick, shape-specific volume-to-weight conversions across multiple client fire pits, and
            a calculator standardizes that process instead of relying on rough per-job estimates.
          </li>
          <li>
            <strong>Comparing supplier costs.</strong> Since fire glass is priced per pound, having an accurate
            total weight makes it much easier to compare pricing across different sellers or bag sizes before
            ordering.
          </li>
        </ul>
      </div>

      {/* Buying accurately */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Buying Fire Glass Accurately</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once you have your calculated weight, it's worth buying slightly more than the exact figure, most
          experienced installers round up by five to ten percent to account for settling, uneven pit bottoms,
          or minor measurement variance. Fire glass is also commonly sold in fixed bag sizes (10, 25, or 50
          pounds), so your final order will usually round up to the nearest available size anyway. Keeping your
          calculated number on hand makes that conversation with a supplier faster and helps you avoid both
          wasted product and awkward mid-project shortages.
        </p>
      </div>

      {/* Free / private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and No Signup Required</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The fire glass calculator on Tolz is completely free to use, with no hidden charges, subscriptions,
          or paywalled results. There's no account creation or signup required, you can open the tool, enter
          your fire pit's measurements, and get your result immediately. No data you enter into the calculator
          is stored or shared; the calculation happens directly in your session, so you're not creating an
          account, submitting personal information, or leaving a data trail just to get a fire glass estimate.
          That makes it just as suitable for a quick personal project as it is for a contractor running the
          numbers on multiple client jobs.
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
