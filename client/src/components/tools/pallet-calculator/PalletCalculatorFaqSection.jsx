import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What are the standard pallet sizes?",
    a: "The most common pallet sizes are 1219×1016 mm (48×40 inches, North America), 1200×1000 mm (47.24×39.37 inches, Europe and Asia), 1165×1165 mm (45.90×45.90 inches, Australia), 1100×1100 mm (43.30×43.30 inches, Asia), 1067×1067 mm (42×42 inches, North America, Europe and Asia) and 1200×800 mm (47.24×31.50 inches, Europe).",
  },
  {
    q: "How much weight can a pallet hold?",
    a: "About 4,600 pounds. A standard North American pallet (48×40 inches) can hold a maximum load of about 4,600 lb or 2,087 kg, but the capacity varies a lot with the pallet's material and design.",
  },
  {
    q: "How do I calculate a pallet's volume?",
    a: "Write down the pallet's width and length and the maximum load height (the height of the load only, not of the pallet), then multiply them: width × length × height = volume.",
  },
  {
    q: "How many bricks fit on a pallet?",
    a: "About 1,022 on a standard 48×40 inch (1219×1016 mm) pallet. With a maximum load weight of 4,600 lb and 4.5 lb per brick on average, 4,600 / 4.5 = 1,022.22, rounded down to 1,022.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const SIZES = [
  ["1219×1016 mm or 48×40 inches", "North America"],
  ["1200×1000 mm or 47.24×39.37 inches", "Europe and Asia"],
  ["1165×1165 mm or 45.90×45.90 inches", "Australia"],
  ["1100×1100 mm or 43.30×43.30 inches", "Asia"],
  ["1067×1067 mm or 42×42 inches", "North America, Europe and Asia"],
  ["1200×800 mm or 47.24×31.50 inches", "Europe"],
];
const PATTERNS = [["Side A", "Side B", "Side C"], ["Side A", "Side C", "Side B"], ["Side B", "Side A", "Side C"], ["Side B", "Side C", "Side A"], ["Side C", "Side A", "Side B"], ["Side C", "Side B", "Side A"]];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { ...h2Style, fontSize: 15, margin: "14px 0 8px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
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

export default function PalletCalculatorFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pallet Calculator</h2>
        <p style={pStyle}>
          The {link("/", "Tolz")} pallet calculator finds the maximum number of packages you can fit on a pallet, together with the package
          placement that achieves it. You can set the pallet dimensions, package dimensions, maximum height and maximum load weight.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>Below you&apos;ll find:</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>How many packages fit on a pallet;</li>
          <li>How much weight a pallet can hold;</li>
          <li>How to calculate pallet volume; and</li>
          <li>How to use the pallet calculator, with an example.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of Pallets</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Pallets are used to store, transport or stack goods. They come in standardized sizes and materials depending on the industry, and
          each design supports a different weight, so check with your supplier.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Standard Pallet Sizes?</h2>
        <p style={pStyle}>The most commonly used pallet sizes and the regions where they are used most:</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Size</th><th>Region(s)</th></tr></thead>
            <tbody>{SIZES.map(([size, region]) => <tr key={size}><td style={{ fontWeight: 700 }}>{size}</td><td>{region}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Many Packages Fit on a Pallet?</h2>
        <p style={pStyle}>
          To find the most packages that fit on a pallet within a limited volume, test every possible stacking pattern and keep the one with
          the highest package count.
        </p>
        <h3 style={h3Style}>Possible pallet stacking patterns</h3>
        <p style={pStyle}>
          Picture an empty pallet from above. Put a package in one corner with one of its sides parallel to the pallet&apos;s width and another
          parallel to the pallet&apos;s length, and keep placing packages next to each other until you run out of width. That&apos;s the first row;
          repeat equal rows until you run out of length to complete the first layer.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          For each side placed along the pallet&apos;s width, either of the other two can go along the length, with the third one vertical. That
          gives six arrangements:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Parallel to pallet&apos;s width</th><th>Parallel to pallet&apos;s length</th><th>Vertical</th></tr></thead>
            <tbody>{PATTERNS.map((r) => <tr key={r.join()}>{r.map((c) => <td key={c} style={center}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <h3 style={h3Style}>Finding the maximum number of packages</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Count the boxes in each arrangement and keep the largest. That&apos;s tedious by hand, so let the calculator do it. The same logic works
          for any cube or rectangular cuboid: enter the dimensions of a brick to find how many bricks fit on a pallet.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Weight Can a Pallet Hold?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          About 4,600 pounds: a standard North American pallet (48×40 inches) holds a maximum load of about 4,600 lb or 2,087 kg, though this
          varies a lot with the pallet&apos;s material and design. In the calculator, set <em>Take weight into account?</em> to Yes to enter your
          pallet&apos;s weight limit and the weight of each package.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Pallet Calculator</h2>
        <ol style={olStyle}>
          <li>Select your pallet size, or choose &quot;Custom size&quot; to type in your own.</li>
          <li>Type in the maximum load height (not including the height of the pallet itself).</li>
          <li>Enter the dimensions of one package.</li>
          <li>Click Calculate to see the best arrangement, the number of packages and how to replicate it.</li>
        </ol>
        <p style={pStyle}>Use the <em>Take weight into account?</em> option to add the pallet&apos;s weight limit.</p>
        <h3 style={h3Style}>Example</h3>
        <p style={pStyle}>
          How many 15×20×10 cm boxes fit on a 1200×1000 mm pallet with a maximum load height of 100 cm? Select the 1200×1000 mm pallet type,
          enter 100 cm as the maximum load height, and enter the box sides as Side A, B and C (in any order). The pallet holds 400 boxes of
          this size, in 10 layers of 40.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator also shows the packages per layer and the pallet utilization: the volume of all the packages divided by the pallet
          volume. A higher number means more efficient use of space. For shipping, see also the
          {" "}{link("/calculators/logistics/cbm-calculator", "CBM calculator")} and the
          {" "}{link("/calculators/logistics/container-loading-calculator", "container loading calculator")}.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
