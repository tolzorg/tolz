import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does a sentence counter actually count?",
    a: "It counts the number of sentences and paragraphs in a piece of text by identifying sentence-ending punctuation and paragraph breaks, then uses that data to calculate readability scores like Flesch, Fog, and SMOG.",
  },
  {
    q: "Is this Sentence Counter tool free to use?",
    a: "Yes. The tool is completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "Do I need to create an account to use it?",
    a: "No. You can paste your text and get instant results without registering or logging in.",
  },
  {
    q: "What is a good Flesch Reading Ease score?",
    a: "For most general web content, a score between 60 and 70 is considered easy to read for a broad audience. Higher scores indicate simpler text; lower scores indicate more complex, formal writing.",
  },
  {
    q: "What's the difference between the Fog Index and the SMOG Index?",
    a: "Both estimate the education level needed to understand a text, but they weigh complex words and sentence length slightly differently. SMOG is often considered stricter and is commonly used for healthcare and public communication, while the Fog Index is widely used in business and journalism.",
  },
  {
    q: "How many sentences should a paragraph have?",
    a: "There's no fixed rule, but for web content, 2–4 sentences per paragraph is common, since shorter paragraphs are easier to scan, especially on mobile devices.",
  },
  {
    q: "Can I use this tool to check readability for SEO content?",
    a: "Yes. Many content style guides recommend target readability scores for web content, and this tool lets you check your draft against Flesch, Fog, and SMOG scores before publishing.",
  },
  {
    q: "Does the tool store or save the text I enter?",
    a: "No text is required to be saved for the tool to function — you simply paste your content, view your results, and the analysis happens directly based on what you enter.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const olStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
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
        <p style={pStyle}>
          Good writing depends on more than just correct grammar, it depends on rhythm, clarity, and
          how easily a reader can follow your ideas from one sentence to the next. The Sentence Counter
          tool above gives you an instant breakdown of your text's sentence count, paragraph count, and
          readability scores, so you can see exactly how your writing reads before you publish, submit,
          or send it. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online utilities,
          this tool is designed for writers, students, editors, and marketers who want fast, reliable
          text insights without installing software or creating an account.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Sentence Counter and Why It Matters</h2>
        <p style={pStyle}>
          A sentence counter is a text analysis tool that scans a piece of writing and reports how many
          sentences and paragraphs it contains, along with how those sentences are structured. On the
          surface, this sounds simple, but sentence count and structure directly affect how readable a
          piece of content is. A page filled with long, dense sentences tends to feel heavier and harder
          to follow, even if the vocabulary is simple. A page with short, varied sentences generally
          reads faster and holds attention better.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters for more than style. Search engines, content editors, academic reviewers, and
          readability standards used in journalism and technical writing all factor in sentence length
          and complexity when judging how accessible a piece of writing is. Knowing your sentence count
          and average sentence length gives you a concrete, measurable way to improve clarity instead of
          relying on guesswork.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Sentence Counter Tool</h2>
        <p style={pStyle}>Using the tool takes only a few seconds:</p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>Paste or type your text into the input box above.</li>
          <li style={{ marginBottom: 8 }}>The tool automatically counts your sentences and paragraphs as you type.</li>
          <li style={{ marginBottom: 8 }}>Readability scores, including Flesch, Fog, and SMOG, update in real time alongside the counts.</li>
          <li>Review the results, revise your text if needed, and re-check instantly, there's no need to reload the page or resubmit your content.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because the results update live, you can edit your draft and watch the readability metrics
          shift with each change, making it easy to see which edits actually improve clarity.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding Sentence and Paragraph Counts</h2>
        <p style={pStyle}>
          Sentence count alone tells you the scope of a piece of writing, but it becomes far more useful
          when paired with paragraph count and average sentence length. A blog post with 40 sentences
          spread across 15 short paragraphs reads very differently from the same 40 sentences crammed
          into 3 dense paragraphs. Paragraph breaks give readers visual rest points and help them
          process information in digestible chunks, which is especially important for content read on
          mobile screens.
        </p>
        <p style={pStyle}>
          The tool identifies sentence boundaries by analyzing punctuation and sentence-ending patterns,
          then groups sentences into paragraphs based on line breaks in your text. This gives you an
          accurate picture of your document's structure rather than a rough estimate, which matters if
          you're working against a strict sentence or paragraph limit for an assignment, script, or
          content brief.
        </p>
        <p style={pStyle}>
          Sentence detection sounds straightforward until you account for the exceptions that trip up
          simple word processors: abbreviations like "e.g." or "Dr.", decimal numbers, ellipses, and
          quoted dialogue can all be mistaken for sentence endings if a tool relies on periods alone. A
          more reliable sentence count looks at the broader context around punctuation rather than
          treating every period as a hard stop, which is why manually counting sentences in a long
          document is both slow and prone to error. Getting this right matters most when you're working
          against a precise requirement, for example, a college essay prompt asking for "no more than 15
          sentences per section," or a script format that limits dialogue blocks to a set number of lines.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Average sentence length, calculated automatically from your total word and sentence counts, is
          often more informative than either number on its own. Two documents can have the same total
          sentence count and still read completely differently if one averages 12 words per sentence and
          the other averages 28. Tracking this figure over the course of a draft, and rechecking it after
          each editing pass, is one of the simplest ways to see whether your revisions are actually
          making the text easier to follow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Flesch, Fog, and SMOG Readability Scores Explained</h2>
        <p style={pStyle}>
          Readability formulas convert sentence length and word complexity into a single score that
          predicts how easy or difficult a text is to read. The Sentence Counter tool calculates several
          of the most widely used formulas automatically.
        </p>
        <p style={pStyle}>
          <strong>Flesch Reading Ease</strong> scores text on a 0–100 scale, where higher scores mean
          easier reading. Most general-audience web content performs best in the 60–70 range, which
          corresponds to a level easily understood by 13- to 15-year-old readers. Legal and academic
          writing often scores much lower, while marketing copy and news articles typically score higher.
        </p>
        <p style={pStyle}>
          <strong>Gunning Fog Index</strong> estimates the number of years of formal education a reader
          needs to understand a piece of text on the first read. It weighs both sentence length and the
          frequency of complex, multi-syllable words. A Fog Index above 12 usually signals that a
          document may be too dense for a general audience.
        </p>
        <p style={pStyle}>
          <strong>SMOG Index</strong> (Simple Measure of Gobbledygook) is commonly used in healthcare,
          government, and consumer communication because it's considered one of the more reliable
          predictors of comprehension. It calculates grade-level reading difficulty based on the number
          of complex words in a sample of sentences, and it's often stricter than Flesch-Kincaid scoring.
        </p>
        <p style={pStyle}>
          Seeing all three scores side by side, rather than relying on just one, gives a more balanced
          view of your writing's difficulty, since each formula weighs sentence and word complexity
          slightly differently. A document might score comfortably on Flesch Reading Ease while still
          returning a high Fog Index if it leans heavily on multi-syllable technical terms, which is
          common in industries like finance, law, and medicine where the vocabulary itself is inherently
          complex regardless of sentence length. Comparing formulas side by side helps you tell whether a
          low readability score is coming from long sentences, difficult word choice, or both — and that
          distinction changes how you should edit the text.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also worth noting that readability formulas measure structural complexity, not accuracy,
          tone, or persuasiveness. A technically "easy to read" score doesn't guarantee a piece of
          writing is well-argued or engaging, and a lower score isn't automatically a problem if your
          audience is specialized, a peer-reviewed research paper or a legal contract is expected to
          score differently than a product landing page. The value of these scores comes from using them
          as a directional signal for your specific audience, not as an absolute pass-or-fail benchmark.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Sentence Length Affects Readability</h2>
        <p style={pStyle}>
          Average sentence length is one of the strongest predictors used across every major readability
          formula. Long sentences aren't inherently wrong, but stacking several 25-plus-word sentences in
          a row forces readers to hold more information in working memory before reaching a full stop,
          which increases the chance they lose the thread of the idea.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Varying sentence length is one of the most effective ways to improve flow. Short sentences
          after a long one create emphasis and give the reader a breather. Writers, editors, and content
          teams often use sentence-length data specifically to identify sections that need to be broken
          up or simplified, rather than rewriting an entire document from scratch. The Sentence Counter's
          real-time insights make this kind of targeted editing possible, because you can see immediately
          which changes shift your readability score in the right direction.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Needs a Sentence Counter: Practical Use Cases</h2>
        <p style={pStyle}>
          This tool is useful in situations where sentence structure and readability directly affect the
          outcome of a piece of writing:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Students and academics</strong> checking essays, theses, or reports against word- and
            sentence-count requirements, or aiming for a specific grade-level readability target set by
            an instructor.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bloggers and content writers</strong> who want their articles to stay within an
            accessible reading level for a general audience, since overly complex writing tends to
            increase bounce rates.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>SEO professionals and marketers</strong> optimizing on-page content, since many
            content briefs and style guides specify target readability scores alongside keyword usage.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Editors and proofreaders</strong> scanning drafts quickly to flag overly long or
            complex sentences before a final review pass.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Technical and UX writers</strong> simplifying documentation, instructions, or
            interface copy so it's understandable to non-expert users.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Public sector and healthcare communicators</strong> who are often required to meet
            specific SMOG or Flesch-Kincaid thresholds for public-facing materials.
          </li>
          <li>
            <strong>Non-native English speakers and ESL learners</strong> who want to check whether their
            writing is clear and appropriately paced for their intended audience.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each case, the value isn't just the raw sentence count, it's the ability to connect
          structure to comprehension and make informed edits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Improve Your Readability Score</h2>
        <p style={pStyle}>
          Once you know your current sentence count and readability scores, a few targeted edits usually
          produce the biggest improvements:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Break up sentences over 25 words.</strong> Look for coordinating conjunctions like
            "and," "but," or "which", these are often natural points to split one long sentence into two
            shorter ones.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Swap complex words for simpler synonyms</strong> where meaning allows. Words with
            three or more syllables raise Fog and SMOG scores fastest, so replacing "utilize" with "use"
            or "facilitate" with "help" can move your score without changing your meaning.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Vary sentence length deliberately.</strong> A short sentence placed after two or
            three longer ones creates a natural pause and improves flow, which readability formulas
            reflect as improved scores.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Re-check after every edit, not just at the end.</strong> Because the tool updates in
            real time, you can treat readability scoring as part of your editing process rather than a
            final check, catching problem sentences as you go instead of rewriting large sections later.
          </li>
          <li>
            <strong>Read your text aloud.</strong> Sentences that are hard to say in one breath are
            usually the same ones flagged as overly long by readability formulas, this is a fast manual
            check to pair with the tool's scores.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          These changes tend to compound: shortening a handful of the longest sentences in a document
          often improves the overall readability score more than making small edits throughout the
          entire piece.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost: Why You Can Trust This Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Sentence Counter is completely free to use, with no hidden charges, subscriptions, or
          usage limits. There's no signup or account creation required, you can paste your text and get
          results immediately. Readability calculations are based on standard, widely accepted formulas
          (Flesch Reading Ease, Gunning Fog, and SMOG), so the scores you see align with the same methods
          used in academic and professional writing standards. The tool is built to give consistent,
          repeatable results, so re-checking the same text will always return the same scores unless the
          content itself changes.
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
