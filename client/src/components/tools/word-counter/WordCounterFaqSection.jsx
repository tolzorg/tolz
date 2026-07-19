import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a word counter count words?",
    a: "A word counter identifies words by detecting spaces and line breaks between groups of characters. Hyphenated terms (like \"well-known\") are typically counted as one word, while standard word-processing conventions are followed to keep results consistent with what you'd see in tools like Microsoft Word or Google Docs.",
  },
  {
    q: "Does this word counter count characters with spaces or without spaces?",
    a: "The tool shows both figures. Character count with spaces reflects the total length including all spacing, which is what most platforms (like meta description or ad character limits) actually measure. Character count without spaces is useful when you need a pure text-length figure.",
  },
  {
    q: "Is there a limit to how much text I can check?",
    a: "No. You can paste and check text of any length, from a short social media caption to a full-length essay or article, without running into a cap.",
  },
  {
    q: "Do I need to sign up or create an account to use this tool?",
    a: "No signup or account is required. The tool is accessible directly on the page and ready to use immediately.",
  },
  {
    q: "Is my text saved or stored when I use this tool?",
    a: "No. Your text is processed only to generate the count results and is not stored or saved anywhere.",
  },
  {
    q: "How accurate is the reading time estimate?",
    a: "The reading time is calculated based on an average adult reading speed and gives a close estimate for most standard content. Actual reading time can vary depending on the reader and the complexity of the text.",
  },
  {
    q: "Can I use this word counter for academic essays with strict word limits?",
    a: "Yes. It's commonly used by students to verify their essay, dissertation, or assignment falls within a required word count before submission.",
  },
  {
    q: "Does punctuation count as a character?",
    a: "Yes, punctuation marks are included in the character count, since they are part of the total text length.",
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

export default function WordCounterFaqSection() {
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

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Word Counter and What Does It Measure</h2>
        <p style={pStyle}>
          A word counter is a simple but essential writing tool that tells you exactly how many words,
          characters, sentences, and paragraphs are in a piece of text. Instead of manually counting or
          guessing, you paste or type your content into the tool and get an instant, accurate breakdown. The
          Word Counter on <Link to="/" className="inline-home-link">Tolz</Link> does exactly this, it processes your text directly in your browser and returns
          real-time counts as you type, with no waiting and no manual refreshing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          While the name suggests it only counts words, a good word counter goes further. It should account
          for how spacing, punctuation, and formatting affect the final number, since these small details
          change results depending on the platform you're writing for. A word count tool that only counts
          words isn't enough for most modern writing tasks, students, editors, and content writers usually
          need character counts, sentence counts, and reading-time estimates in the same place, which is why
          this tool covers all of them together rather than making you switch between separate utilities.
        </p>
      </div>

      {/* Who needs it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Needs a Word Counter (Practical Scenarios)</h2>
        <p style={pStyle}>
          Word counting isn't just an academic exercise, it solves real, everyday problems across many types
          of writing work.
        </p>
        <p style={pStyle}>
          <strong>Students and academic writers</strong> frequently face strict word limits on essays,
          dissertations, and assignments. Going even slightly over or under a required count can affect
          grading, so checking word count before submission is a standard part of the writing process. A word
          counter takes the guesswork out of meeting professor- or institution-set requirements.
        </p>
        <p style={pStyle}>
          <strong>Content writers and bloggers</strong> use word counters to track article length against SEO
          targets, since search engines often favor comprehensive content within a certain range. Knowing your
          live word count while drafting helps you pace sections and avoid writing something too thin or
          unnecessarily long.
        </p>
        <p style={pStyle}>
          <strong>Social media managers</strong> deal with hard character limits — a tweet, an Instagram
          caption, or a LinkedIn post all cap out at different lengths. A character counter prevents the
          frustration of writing a great caption only to find it's been cut off or rejected for exceeding the
          platform's limit.
        </p>
        <p style={pStyle}>
          <strong>Copywriters and marketers</strong> rely on precise character counts for meta titles, meta
          descriptions, ad headlines, and email subject lines, where a few extra characters can mean the
          difference between text displaying fully or getting truncated in search results.
        </p>
        <p style={pStyle}>
          <strong>Translators and editors</strong> use word counts to estimate project scope, calculate
          per-word rates, or verify that a translated document matches the expected length of the source
          material.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Job seekers</strong> writing resumes and cover letters often need to stay within word or
          character limits set by application portals, especially for cover letter fields that cap input
          length.
        </p>
      </div>

      {/* What it measures */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Word Counter Measures Beyond Words</h2>
        <p style={pStyle}>
          A single word count number rarely tells the full story about a piece of text, which is why this tool
          tracks several metrics simultaneously.
        </p>
        <p style={pStyle}>
          <strong>Character count</strong> is shown both with and without spaces, which matters because
          platforms and forms count characters differently. A meta description limit, for example, is based
          on character count, not word count, so writers optimizing for search snippets need this figure
          specifically.
        </p>
        <p style={pStyle}>
          <strong>Sentence count</strong> helps writers gauge sentence length and variation, both of which
          affect readability. Long stretches of run-on sentences can hurt comprehension, and tracking sentence
          count alongside word count gives a rough sense of average sentence length.
        </p>
        <p style={pStyle}>
          <strong>Paragraph count</strong> is useful for structuring longer documents, particularly academic
          papers or reports where paragraph density is part of formatting guidelines.
        </p>
        <p style={pStyle}>
          <strong>Estimated reading time</strong> converts your word count into an approximate time a reader
          would need to get through the text, based on typical reading speed. This is especially useful for
          bloggers and email marketers who want to set reader expectations upfront ("a 4-minute read," for
          instance).
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Having all of these metrics update together, in real time, means you don't have to run your text
          through multiple separate tools to get a complete picture of its length and structure.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Tolz Word Counter</h2>
        <p style={pStyle}>
          Using the tool requires no special steps or technical knowledge. Type directly into the text box, or
          paste in content copied from a document, email, or webpage. As soon as text appears, the counts for
          words, characters, sentences, and paragraphs update automatically, there's no separate "calculate"
          button to click and no page reload required.
        </p>
        <p style={pStyle}>
          If you need to check a different piece of text, simply clear the box and paste in the new content;
          the counts will reset and recalculate instantly. Because everything runs in real time, the tool is
          equally useful for checking a finished document all at once or for monitoring your word count live
          while you write directly inside the tool.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's no file upload requirement and no need to format your text in any particular way
          beforehand, plain text, text with line breaks, and text copied from formatted documents like Word or
          Google Docs will all be counted correctly.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Word Counter Free, Private, and Safe to Use</h2>
        <p style={pStyle}>
          Every feature of this tool is free to use, with no hidden charges, subscription requirements, or
          usage caps. There's no account creation or signup needed, you can open the page and start counting
          words immediately.
        </p>
        <p style={pStyle}>
          On the privacy side, the text you enter is processed for the sole purpose of generating your word,
          character, sentence, and paragraph counts, and is not stored or saved on any server. Because
          counting happens as you type, there's no upload step involved, which means your content never has
          to leave your device to get a result. This makes the tool suitable for sensitive or unpublished
          material, drafts, confidential documents, or unfinished manuscripts, where you don't want your text
          saved or shared anywhere.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are also no ads interrupting the counting experience, no watermarks added to anything you
          type, and no limit on how many times you can use the tool or how much text you can check in a single
          session.
        </p>
      </div>

      {/* Why choose */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Choose the Tolz Word Counter</h2>
        <p style={pStyle}>
          Many word counters online are cluttered with ads, require signup for "advanced" features, or only
          display a single word count number without the additional detail serious writers actually need. The
          Tolz Word Counter is built to avoid all three problems: it's clean, fast, and shows every relevant
          metric — words, characters (with and without spaces), sentences, paragraphs, and estimated reading
          time — on one screen, updated live as you type.
        </p>
        <p style={pStyle}>
          It's also part of a broader collection of free tools on Tolz, meaning if your workflow requires
          converting a file, generating a PDF, or using another calculator, you're working within the same
          trusted, no-signup environment rather than bouncing between unfamiliar third-party sites for each
          task.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Accuracy is a core design priority. The counting logic correctly handles edge cases like multiple
          spaces, line breaks, hyphenated words, and punctuation, so the numbers you see reflect standard
          word-processing conventions rather than a rough approximation.
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
