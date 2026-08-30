import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Grow a Garden Calculator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "How is a plant's value calculated?",
    a: "Value = base value (from weight) × the Rainbow/Gold/Silver tier multiplier × (1 + sum of active mutation multipliers − number of active mutations), then multiplied by amount and any Friend Boost. This is the same formula used across the Grow a Garden community's value calculators.",
  },
  {
    q: "Why do Rainbow, Gold, and Silver work differently from other mutations?",
    a: "Rainbow, Gold, and Silver are tier mutations that replace the base multiplier entirely (Rainbow ×50, Gold ×20, Silver ×5) rather than stacking additively with other mutations like Shocked or Frozen.",
  },
  {
    q: "What are Admin Mutations, and why are some hidden by default?",
    a: "Admin Mutations are mutations only obtainable through admin or developer events, not normal gameplay. They're shown by default but can be hidden with the \"Hide Admin Mutations\" toggle to keep the list focused on mutations you can actually obtain in-game.",
  },
  {
    q: "How accurate are the Pet XP, Egg Hatch, and Pet Weight calculators?",
    a: "They use the same growth-curve and XP formulas as the community's reference calculator. Pet Weight by Age is explicitly an approximation (the game's actual weight-gain has some randomness), and the calculator says so directly in its result.",
  },
  {
    q: "Does this calculator use official Grow a Garden data?",
    a: "The formulas are the same widely-used, community-verified formulas found across Grow a Garden value calculators. This is not an official tool from the game's developers.",
  },
  {
    q: "Does the tool store or save my data?",
    a: "No. Everything runs locally in your browser — nothing you enter is sent to a server, and no account is required.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

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

export default function GrowAGardenFaqSection() {
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
        <p style={pStyle}>
          Calculate plant/crop values, pet growth XP, egg hatch time, pet weight by age, and pet ability
          stats for the Grow a Garden Roblox game — all in one place. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online calculators,
          using the same community-verified formulas found across Grow a Garden value calculators.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Plant Values Are Calculated</h2>
        <p style={pStyle}>
          Each plant has its own base-value curve derived from its weight. That base value is then
          multiplied by a tier multiplier (Rainbow ×50, Gold ×20, Silver ×5, or ×1 with none selected)
          and by a mutation multiplier — 1 plus the sum of every active mutation's multiplier, minus the
          number of active mutations. The result is multiplied by how many plants you're calculating and
          by any Friend Boost percentage.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pet XP, Egg Hatch, Weight & Ability</h2>
        <p style={pStyle}>
          Pet XP calculates the real time needed to grow a pet from one age to another, accounting for
          Owls, Mice, Starfish, and any bonus XP sources. Egg Hatch Speed simulates hatch time
          second-by-second, including Kiwi and Eagle pets' periodic time reductions. Pet Weight by Age
          projects a pet's weight across ages 1-100 from a single known age/weight pair — labeled as an
          approximation, since it doesn't account for in-game randomness. Pet Ability shows a selected
          pet's ability stats at its current weight and at a projected Age 100, factoring in rarity
          (Normal/Golden/Rainbow) and equipped toy boosts.
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
