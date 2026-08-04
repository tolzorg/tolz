import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does the Sentence Counter detect sentence boundaries?",
    a: "It uses Unicode-aware sentence segmentation (Intl.Segmenter where supported by your browser, falling back to a rule-based parser and finally a lightweight regex parser). A built-in abbreviation dictionary (Dr., Mr., U.S., e.g., etc.) prevents common titles and abbreviations from being mistaken for sentence endings.",
  },
  {
    q: "Are the readability scores accurate?",
    a: "They're estimates based on standard published formulas (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG, Coleman-Liau, and ARI). Actual readability can vary depending on how sentences are segmented, subject matter, and reader background — use the scores as a general guide, not an exact measurement.",
  },
  {
    q: "Does this tool handle abbreviations like 'Dr.' or 'U.S.' correctly?",
    a: "Yes. A reusable abbreviation dictionary covering titles (Mr., Mrs., Dr., Prof., Sr., Jr.) and general abbreviations (U.S., U.K., e.g., i.e., etc., Inc., Ltd., Fig., Vol.) is used to avoid false sentence splits after these terms.",
  },
  {
    q: "Can I search for a specific sentence?",
    a: "Yes. Use the search box under the sentence list to filter by keyword, with optional Match Case and Whole Word toggles. Matches are highlighted both in the list and directly inside the editor.",
  },
  {
    q: "How do I highlight the longest or shortest sentence?",
    a: "Click \"Highlight in editor\" on the Longest & Shortest Sentence cards, or click any row in the sentence list — the editor scrolls to and highlights that exact sentence.",
  },
  {
    q: "Can I export the results?",
    a: "Yes. Export the full sentence list as TXT, CSV, or JSON, export statistics as TXT or JSON, or use \"Print / Save as PDF\" to generate a printable summary.",
  },
  {
    q: "Is my text uploaded or stored anywhere?",
    a: "No. Everything — parsing, statistics, and readability analysis — runs entirely in your browser. Nothing is uploaded, logged, or stored.",
  },
  {
    q: "Does it work with very large documents?",
    a: "Yes. The tool is built to handle documents in the tens of thousands of words. Analysis is deferred so typing stays responsive, and the sentence list loads incrementally rather than rendering everything at once.",
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

export default function SentenceCounterFaqSection() {
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
        <h2 style={h2Style}>What Is a Sentence Counter?</h2>
        <p style={pStyle}>
          A Sentence Counter analyzes text and breaks it down into individual sentences, giving you
          accurate counts, averages, and readability insights instead of just a raw word tally. This
          free tool on <Link to="/" className="inline-home-link">Tolz</Link> goes further than a basic
          count — it identifies every sentence using Unicode-aware segmentation, lists them individually,
          and calculates industry-standard readability scores in real time as you type.
        </p>
        <p style={pStyle}>
          It's useful anywhere sentence structure matters: meeting word or sentence limits, checking
          writing complexity, editing for flow, or simply understanding how a piece of text is put
          together.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Needs a Sentence Counter?</h2>
        <p style={pStyle}>
          <strong>Students</strong> checking essay structure and sentence variety.{" "}
          <strong>Writers and bloggers</strong> keeping sentences readable and engaging.{" "}
          <strong>Editors</strong> spotting overly long or repetitive sentences.{" "}
          <strong>Researchers</strong> analyzing writing complexity in academic text.{" "}
          <strong>Marketers</strong> keeping ad copy and headlines punchy.{" "}
          <strong>Teachers</strong> assessing student writing at a glance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Sentence Detection Works</h2>
        <p style={pStyle}>
          Sentence boundaries are detected using a three-tier approach: first{" "}
          <code>Intl.Segmenter</code>, the browser's native Unicode text segmentation API, when
          available; then a rule-based parser that understands abbreviations, initials, decimal
          numbers, quotes, and ellipses; and finally a lightweight regex parser as a last-resort
          safety net. A built-in abbreviation dictionary (Mr., Dr., Prof., U.S., e.g., i.e., etc.,
          Inc., Fig., and more) prevents these from being mistaken for sentence endings — for example,
          "Dr. Smith arrived early." is correctly counted as one sentence, not two.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Formula Explanations</h2>
        <p style={pStyle}><strong>Word Counting.</strong> Words are counted using Unicode-aware segmentation, correctly handling contractions, accented characters, and non-Latin scripts.</p>
        <p style={pStyle}><strong>Paragraph Detection.</strong> A paragraph is a group of non-empty lines separated by one or more blank lines.</p>
        <p style={pStyle}><strong>Average Words per Sentence.</strong> Total Words ÷ Total Sentences.</p>
        <p style={pStyle}><strong>Average Sentences per Paragraph.</strong> Total Sentences ÷ Total Paragraphs.</p>
        <p style={pStyle}><strong>Sentence Density.</strong> (Total Sentences ÷ Total Words) × 100 — expressed as sentences per 100 words.</p>
        <p style={pStyle}><strong>Reading Time.</strong> Total Words ÷ selected words-per-minute speed (200/225/250 WPM).</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Readability scores</strong> (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog,
          SMOG, Coleman-Liau, ARI) use their standard published formulas, computed from word, sentence,
          and syllable counts derived from the same Unicode-aware parse and abbreviation dictionary
          described above.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Verified Examples</h2>
        <p style={pStyle}>
          <strong>Simple text:</strong> "The cat sat on the mat. It was warm and soft." — 2 sentences,
          scores at the very easy end of the Flesch Reading Ease scale.
        </p>
        <p style={pStyle}>
          <strong>Abbreviations:</strong> "Dr. Smith arrived early. He was pleased." — correctly
          counted as 2 sentences, not 3, thanks to the abbreviation dictionary.
        </p>
        <p style={pStyle}>
          <strong>Ellipsis and quotes:</strong> {'"Wait... what happened?" she asked. He said "Stop!" and left.'} —
          correctly counted as 2 sentences despite the embedded ellipsis and quoted exclamation.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Complex academic text</strong> with long, multi-clause sentences and dense vocabulary
          scores toward the difficult end of every readability metric, illustrating how sentence and
          word complexity move the scores in the expected direction.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Free, Private, and Safe to Use?</h2>
        <p style={pStyle}>
          Yes — completely free, with no signup. All parsing, counting, and readability analysis run
          entirely in your browser using <Link to="/" className="inline-home-link">Tolz</Link>'s
          Sentence Counter. Nothing you type or upload is sent to a server, logged, or stored.
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
