import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Word Finder free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "What does \"Including\" search for?",
    a: "It finds words that contain every letter you entered, at least as many times as you entered it, anywhere in the word and in any order — the word can also contain other letters. If you want words made up ONLY of specific letters in specific positions, use Fill-in-the-Blanks instead.",
  },
  {
    q: "What's the difference between \"Including\" and \"Containing in order\"?",
    a: "\"Including\" ignores order — the letters can appear anywhere, in any sequence. \"Containing in order\" requires the letters to appear in that exact relative order somewhere in the word (not necessarily next to each other).",
  },
  {
    q: "How does Fill-in-the-Blanks work?",
    a: "Pick a word length, then type known letters into their exact positions and leave the rest blank. It finds every word of that length matching the letters you specified — perfect for crosswords and games like Wordle.",
  },
  {
    q: "What do the small numbers next to each word mean?",
    a: "That's the word's standard English Scrabble letter-tile score — useful context if you're using this for Scrabble or Words With Friends, not an indicator of how \"good\" or common the word is.",
  },
  {
    q: "Where does the word list come from?",
    a: "From the ENABLE word list, a well-established public-domain word list created specifically for word games, containing over 172,000 words.",
  },
  {
    q: "Does the tool store or save my searches?",
    a: "No. Everything runs locally in your browser — nothing you type is sent to a server, and no account is required.",
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

export default function WordFinderFaqSection() {
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
          Find words by starting letters, ending letters, contained letters, or a fill-in-the-blanks pattern —
          useful for Scrabble, Words With Friends, crosswords, Wordle, and any word game where you need real
          words matching a set of letters. Built as part of <Link to="/" className="inline-home-link">Tolz</Link>'s
          collection of free online utilities, searching a word list of over 172,000 entries entirely in your browser.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Four Search Modes</h2>
        <p style={pStyle}>
          <strong>Starting with</strong> finds words beginning with your letters. <strong>Ending with</strong> finds
          words ending with them. <strong>Including</strong> finds words that contain every one of your letters
          somewhere, in any order. <strong>Containing in order</strong> finds words where your letters appear in
          that exact sequence, though not necessarily next to each other.
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
