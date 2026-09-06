import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the Grow A Garden Calculator free to use?",
    a: "Yes. The calculator is completely free, with no signup, login, or payment required for any of its features.",
  },
  {
    q: "How accurate is the plant value calculation?",
    a: "Values are based on the game's known base prices and mutation multipliers, with weight factored in where it affects the final number. Figures are reviewed as the game updates, though very recently added content may take a short time to be verified.",
  },
  {
    q: "Do I need a Roblox account to use this calculator?",
    a: "No. The calculator works independently of your Roblox account — you just enter the plant, mutation, weight, or pet details manually.",
  },
  {
    q: "Can this calculator tell me if a trade is fair?",
    a: "It gives you an estimated value for each side of a trade based on mutations and weight, which you can compare directly. It's a strong reference point, though final trade decisions are still up to you.",
  },
  {
    q: "How does weight affect crop value in Grow a Garden?",
    a: "Heavier crops of the same plant and mutation combination are worth more than lighter ones, since weight has a compounding effect on the base value rather than a flat addition.",
  },
  {
    q: "What's the difference between the pet XP calculator and the pet weight calculator?",
    a: "The XP calculator tells you how much experience your pet needs to reach its next level. The weight calculator estimates how heavy your pet will be based on its age and starting weight — these are two separate stats that both affect a pet's overall value.",
  },
  {
    q: "Does egg hatch time change with boosts?",
    a: "Yes. Base hatch time varies by egg type, and active speed boosts reduce that time. The calculator accounts for common boosts when estimating your hatch countdown.",
  },
  {
    q: "Why do two pets of the same type have different values?",
    a: "Even identical pet types can differ in value once weight and age are factored in — a pet further along its weight curve is generally worth more than a younger, lighter one of the same species.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Figuring out what a mutated crop or a growing pet is actually worth in Grow a Garden usually
          means digging through spreadsheets, Discord servers, or trial and error while trading. The grow a
          garden calculator on <Link to="/" className="inline-home-link">Tolz</Link> removes that
          guesswork. It's built to handle every number-heavy part of the game in one place: plant and crop
          value based on weight and mutations, pet XP growth timing, egg hatch speed, pet weight
          progression by age, and pet ability stats. Instead of switching between five different fan sites,
          you get one calculator that covers the full loop, grow, mutate, hatch, and trade, with numbers
          you can actually trust before you commit to a deal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Grow A Garden Calculator Does</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          At its core, this is a multi-function calculator built around how Grow a Garden's economy
          actually works. You select a plant, apply any mutations it has, and enter its weight, the
          calculator returns an estimated sell value based on the game's value logic, where mutations
          multiply the base price and weight has a compounding effect on the final number. On the pet
          side, you can check how much experience a pet still needs to hit its next level, estimate how
          long an egg will take to hatch, see how a pet's weight changes as it ages, and review how
          ability stats scale. Because all of these mechanics interact, a heavier pet often has stronger
          abilities, a longer hatch time can mean a rarer pet, having them under one tool means you're not
          cross-referencing three tabs to make one decision.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Plant and Crop Value With Mutations</h2>
        <p style={pStyle}>
          Crop value in Grow a Garden isn't a flat number. Every plant has a base value tied to its
          rarity, and that number changes dramatically once mutations enter the picture. A plain,
          unmutated crop might sell for a modest amount, but stack a growth mutation like Gold or Rainbow
          on top of an environmental one like Wet, Chilled, or Shocked, and the value can jump by a large
          multiplier, sometimes into the thousands. Weight compounds this further, since heavier crops of
          the same type are worth noticeably more than lighter ones of the same mutation set.
        </p>
        <p style={pStyle}>
          The calculator handles this by letting you pick the plant, tick the mutations that apply, and
          enter the measured weight. It then works out the combined multiplier and returns the estimated
          value, so you're not manually multiplying base price by mutation percentages in your head or on
          a scrap calculator. This matters most in two situations: deciding whether a crop is worth
          harvesting immediately or growing further for more weight, and checking that a trade offer
          roughly matches real value before you accept it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Mutations also stack in different ways depending on their category. Growth mutations like Gold
          or Rainbow tend to apply the largest single multiplier and are usually mutually exclusive with
          each other on the same crop. Environmental mutations, Wet, Chilled, Frozen, Shocked, and similar
          effects tied to in-game weather or events, can often be layered on top of a growth mutation
          rather than replacing it, which is where the biggest value jumps come from. Because the combined
          effect isn't just addition, guessing at a stacked mutation's total value by eye is where most
          players either overestimate what they're holding or accidentally undervalue it in a trade.
          Entering the exact combination into the calculator removes that guesswork and shows the real
          multiplier rather than an approximation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pet XP Growth and Leveling Time</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Pets in Grow a Garden level up through accumulated experience, and knowing how much XP stands
          between your pet and its next level (or max level) helps you plan feeding and playtime instead
          of guessing. The pet XP portion of the calculator takes your pet's current experience and level,
          then calculates how much additional XP is needed to reach a target level. This is especially
          useful for players managing several pets at once, since it lets you prioritize which pet is
          closest to leveling and worth focusing resources on right now, rather than spreading XP-boosting
          items thin across pets that are still far from their next tier.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Egg Hatch Speed and Timing</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Eggs in Grow a Garden hatch on a timer that varies depending on egg type and any active speed
          boosts. Waiting without a clear estimate makes it hard to plan around, especially if you're
          trying to line up a hatch with a specific play session or event window. The egg hatch calculator
          takes the base hatch duration for the egg type you're incubating and factors in relevant boosts
          to give you a more accurate countdown, so you know roughly when to check back instead of leaving
          a browser tab open out of habit.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pet Weight by Age</h2>
        <p style={pStyle}>
          Pet weight in Grow a Garden isn't static, pets gain weight as they age, and that weight directly
          affects both their size classification and their trade value. A pet hatched at a low starting
          weight can grow substantially heavier over time, moving from a standard classification up toward
          larger, rarer weight brackets that carry noticeably higher trade value. The pet weight calculator
          takes your pet's starting weight and current age, then projects its weight at that point in its
          growth curve. This is particularly useful before a trade, since two pets of the same species and
          rarity can have very different values purely based on where they sit on the weight curve, a
          heavier pet of the same type is almost always the better asset to hold onto or trade for.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Weight also determines size classification, which most players use as shorthand when discussing
          a pet's tier, terms like Small, Normal, Large, Huge, Titanic, and Godly correspond to specific
          weight ranges rather than being purely visual descriptions. A pet that looks similar to another
          of the same species can sit in a completely different classification once you check the actual
          number, which is exactly the kind of detail that's easy to misjudge without running the
          calculation. Knowing which bracket a pet falls into also helps when browsing trade offers, since
          sellers and traders frequently reference classification instead of exact weight, and mismatching
          the two can lead to a lopsided deal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Pet Ability Stats</h2>
        <p style={pStyle}>
          Beyond weight and XP, pets carry ability stats that scale with level and, in some cases, weight
          class. These abilities affect gameplay directly, things like collection bonuses, growth speed
          boosts, or other passive effects that stack as a pet develops. The calculator's ability stat
          section shows how these numbers scale, giving you a clearer picture of what a pet is actually
          capable of at a given level rather than relying on rough in-game tooltips. This is useful when
          deciding which pet to actively use versus which one to keep in storage, since a maxed-out ability
          stat can make a meaningful gameplay difference even between two pets of the same type.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also matters for trading decisions that go beyond raw crop or pet value. Two players might
          agree a pet is "worth" roughly the same amount as a set of crops, but if that pet's ability is
          one that actively boosts future harvests, a growth speed bonus or a collection multiplier, for
          example, its practical value to an active player can be higher than its raw trade number
          suggests. Checking ability scaling alongside weight and XP level gives a fuller picture than any
          single stat on its own.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use This Tool</h2>
        <p style={pStyle}>A few common scenarios cover most of why players reach for a calculator like this:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Before accepting or making a trade.</strong> Trading is where inaccurate value
            estimates cost the most. Checking both sides of a trade, crop mutations and weight, or pet
            weight and ability level, against the calculator takes a few seconds and prevents an obviously
            lopsided deal.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Deciding whether to harvest now or let a crop keep growing.</strong> Since weight
            compounds value, it's often worth waiting for a crop to put on more weight before selling,
            especially if it already has a strong mutation. Running the numbers at different weight
            estimates shows whether the wait is worth it.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning pet feeding sessions.</strong> Rather than feeding XP items randomly across
            every pet you own, checking which pet is closest to its next level lets you use limited
            feeding resources more efficiently.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Timing hatches around your schedule.</strong> If you're about to log off or start a
            longer session, knowing roughly how long an egg has left helps you decide whether it's worth
            waiting around or checking back later.
          </li>
          <li>
            <strong>Comparing two pets of the same species.</strong> When weight and age differ, the
            calculator makes it obvious which pet is actually the better hold, rather than guessing based
            on appearance alone.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and How Values Are Calculated</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator is built around the same value logic the game itself uses — base value by plant
          or pet type, multiplied by applicable mutation modifiers, adjusted for weight where relevant.
          Grow a Garden receives frequent updates that can introduce new plants, pets, mutations, or adjust
          existing values, so figures are reviewed and updated to reflect current in-game data as changes
          roll out. If a very recently released mutation or plant seems off, it's worth double-checking
          in-game, since brand-new content sometimes needs a short window to be verified and added.
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
