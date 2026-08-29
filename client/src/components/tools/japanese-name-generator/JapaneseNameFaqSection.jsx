import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Japanese Name Generator free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "Are the generated full names real, attested Japanese names?",
    a: "No. Full names are composed by pairing a real surname with a real given name from the dataset, and are always clearly labeled \"Generated combination.\" This tool has no dataset of real, attested full names, so it never claims a generated full name belongs to (or was used by) a real person.",
  },
  {
    q: "Where do the Kanji readings and meanings come from?",
    a: "Every name record carries its own source and license fields, visible in each name's Details view. A small hand-curated set has real, sourced meanings; the much larger set (licensed from JMnedict/ENAMDICT) has Kanji, readings, and gender/surname classification, but no meaning data — its Details view says \"Meaning information unavailable\" rather than guessing one.",
  },
  {
    q: "Why do some names show a meaning and others don't?",
    a: "Meaning data only exists for the small, hand-curated portion of the dataset. The much larger portion — over 300,000 records licensed from JMnedict/ENAMDICT — provides Kanji, readings, and classification only, with no meaning glosses in the source data itself. Rather than invent a meaning from a generic Kanji dictionary, those records honestly show \"Meaning information unavailable.\"",
  },
  {
    q: "Why does searching the full dataset work differently from the curated set?",
    a: "The curated set (about 70 names) is small enough to search with full substring matching instantly. The full JMnedict/ENAMDICT-derived dataset is over 300,000 records and is never loaded into your browser all at once — search resolves to the relevant portion of the dataset by the start of the name's reading (or via a Kanji index for Kanji queries), then matches within it. This keeps the tool fast without downloading hundreds of megabytes of data.",
  },
  {
    q: "How accurate is the pronunciation feature?",
    a: "The \"Listen\" button uses your browser's built-in speech synthesis to approximate the selected Hiragana reading. It's labeled \"approximate pronunciation\" because browser text-to-speech is not an authoritative source for Japanese pronunciation.",
  },
  {
    q: "Is \"My Name in Japanese\" my official Japanese name?",
    a: "No. It produces an approximate Katakana phonetic transcription — the common way foreign names are written phonetically in Japanese — not an official or legally recognized Japanese name.",
  },
  {
    q: "Why don't some names show a popularity ranking or \"traditional/modern\" label?",
    a: "Those labels are only shown when the tool has reliable, sourced data behind them. Rather than fabricate a ranking or classification, the tool simply omits it when it can't be backed by a real source.",
  },
  {
    q: "Does the tool store or save my data?",
    a: "Favorites and your name-order preference are saved locally in your browser (localStorage) — no account or server-side storage is used. Nothing you type is sent anywhere for processing.",
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

export default function JapaneseNameFaqSection() {
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
          Explore, search, and generate Japanese given names and surnames with real Kanji, Hiragana readings, and
          Hepburn romaji — plus tools to convert your own name into Japanese phonetic transcription. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online utilities, this is a
          reference and generation tool, not a random-name toy: every factual claim about a name traces back to a
          documented source, and anything the dataset can't reliably support (a popularity ranking, a "traditional"
          label, an official name-character legality check) is simply left out rather than guessed.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two datasets work together here: a small, hand-curated set with real, sourced meanings for each name
          (used for meaning/theme search), and a much larger collection of Kanji, readings, and gender/surname
          classifications licensed from{" "}
          <a href="https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project" target="_blank" rel="noopener noreferrer">
            JMnedict/ENAMDICT
          </a>{" "}
          (CC BY-SA 4.0). The larger set doesn't include name meanings — see the FAQ below for why that's shown
          honestly as "unavailable" rather than guessed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Japanese Name?</h2>
        <p style={pStyle}>
          A Japanese name is typically made up of a family name (surname) and a given name, each written in Kanji
          (Chinese-derived characters), and each Kanji carries at least one standard reading in Hiragana. The same
          Kanji can sometimes be read multiple ways depending on the specific name, and different Kanji can produce
          the same reading — which is why this tool always treats a name as a specific Kanji + reading pairing,
          never a Kanji or reading in isolation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Japanese Naming Order: Family Name First</h2>
        <p style={pStyle}>
          In Japan, the family name conventionally comes before the given name (e.g. Tanaka Yui, not Yui Tanaka).
          This tool defaults to that order and labels it "Japanese," with an "International" toggle (Given + Family)
          for contexts where the Western convention is expected. Switching the toggle only changes how a name is
          displayed — it never changes the underlying Kanji, reading, or any other stored data.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Kanji, Hiragana, and Katakana in Names</h2>
        <p style={{ ...pStyle, marginBottom: 8 }}>
          Japanese names generally use one of three scripts, each with a different role:
        </p>
        <p style={pStyle}>
          <strong>Kanji</strong> — the characters most Japanese given names and surnames are written in, each
          carrying its own meaning. <strong>Hiragana</strong> — the phonetic script used to show how a Kanji name is
          actually read (and occasionally used to write a name directly). <strong>Katakana</strong> — typically used
          for foreign-origin words and names, including the approximate transcription this tool produces for
          non-Japanese names under "My Name in Japanese."
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Japanese Names Are Pronounced</h2>
        <p style={pStyle}>
          Japanese pronunciation is built from mora — timing units roughly the length of one basic kana — rather
          than English-style syllables. This tool calculates an exact mora count for every name from its selected
          Hiragana reading, and displays Hepburn romaji (the most common Latin-alphabet romanization system for
          Japanese) alongside it. The "Listen" button offers an approximate pronunciation using your browser's
          speech synthesis; it's a convenience, not an authoritative pronunciation source.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Do Name Readings Mean?</h2>
        <p style={pStyle}>
          A "reading" is how a specific Kanji is pronounced within a specific name. Many names have exactly one
          standard reading, but some Kanji combinations genuinely have more than one attested reading (shown in this
          tool as "selected" and "alternative" readings) — both are real, just different names in practice depending
          on which one a given person or family uses.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Japanese Names vs. Japanese-Style Names</h2>
        <p style={pStyle}>
          A "Japanese name" in this tool refers to a real, documented Kanji + reading combination drawn from the
          dataset. A "Japanese-style" or creative name — Kanji chosen or combined for their look or meaning, without
          being an attested name — is a different thing, and this tool is careful never to present the two the same
          way: generated full-name combinations are always labeled "Generated combination," and nothing here invents
          a "creative" name and presents it as authentic.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Foreign Names in Japanese</h2>
        <p style={pStyle}>
          Foreign names are conventionally written in Japan using Katakana, approximating the name's sound using
          Japanese phonetics — which don't map perfectly onto every language. The "My Name in Japanese" tool above
          produces this kind of approximate phonetic transcription. It is not the same as choosing a Kanji-based
          Japanese name, and it isn't an "official" Japanese name in any legal sense.
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
