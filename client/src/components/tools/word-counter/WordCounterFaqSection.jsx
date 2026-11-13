import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a word counter count words?",
    a: "A word counter treats any group of characters separated by spaces or line breaks as one word. Hyphenated terms like \"well-known\" count as one word, which matches how Microsoft Word and Google Docs handle them.",
  },
  {
    q: "Why is a word counter important for writers?",
    a: "It helps you meet length requirements, pace your drafts, and catch writing that is too short, too long, or poorly balanced. It also saves time compared with counting by hand.",
  },
  {
    q: "Does this word counter count characters with spaces or without spaces?",
    a: "Both. Characters with spaces is the total length, which is what most platforms measure, including meta descriptions and ad copy. Characters without spaces is useful for jobs or forms that count only visible characters.",
  },
  {
    q: "Does punctuation count as a character?",
    a: "Yes. Punctuation marks are part of the text, so they are included in both character counts.",
  },
  {
    q: "Is there a word counter on Google Docs?",
    a: "Yes. Go to Tools, then Word count, or press Ctrl + Shift + C (Cmd + Shift + C on a Mac).",
  },
  {
    q: "Is word count a ranking factor in SEO?",
    a: "Not directly. Google looks at how helpful and complete your content is, not how many words it has. Longer content often performs well because it covers a topic in more depth, but length alone won't improve your rankings.",
  },
  {
    q: "What is the minimum word count for a novel?",
    a: "About 50,000 words is the usual minimum. Most published novels fall between 70,000 and 100,000 words.",
  },
  {
    q: "What is the minimum word count for a PhD thesis?",
    a: "There is no universal minimum. Most doctoral theses run between 50,000 and 100,000 words, and many UK universities set a maximum of around 80,000. Check your program's rules.",
  },
  {
    q: "Is there a limit to how much text I can check?",
    a: "No. You can check anything from a short caption to a full-length essay or article.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No. The tool is free and ready to use right away.",
  },
  {
    q: "Is my text saved or stored when I use this tool?",
    a: "No. Your text is used only to generate the counts and is not saved anywhere.",
  },
  {
    q: "How accurate is the reading time estimate?",
    a: "It is based on an average adult reading speed, so it is a close guide for most content. The actual time depends on the reader and how complex the text is.",
  },
  {
    q: "Can I use this word counter for academic essays with strict word limits?",
    a: "Yes. Many students use it to confirm that an essay, dissertation, or assignment meets its required length before submitting. Check whether your instructor counts references, footnotes, or titles, since rules vary.",
  },
];

const JS_CODE = `<textarea id="text" rows="8" cols="50" placeholder="Type or paste your text here..."></textarea>
<p>Words: <span id="words">0</span> | Characters: <span id="chars">0</span></p>

<script>
  const textBox = document.getElementById('text');
  const wordsOut = document.getElementById('words');
  const charsOut = document.getElementById('chars');

  function countWords(text) {
    const trimmed = text.trim();
    return trimmed === '' ? 0 : trimmed.split(/\\s+/).length;
  }

  textBox.addEventListener('input', () => {
    wordsOut.textContent = countWords(textBox.value);
    charsOut.textContent = textBox.value.length;
  });
</script>`;

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
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 12,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const listStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const preStyle = {
  ...mono, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-primary)", background: "var(--bg-muted)",
  border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", margin: "0 0 10px", overflowX: "auto",
};
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What is it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Word Counter and Why Does It Matter?</h2>
        <p style={pStyle}>
          A word counter tells you how many words, characters, sentences, and paragraphs are in a piece of text. You
          paste or type your content into the box, and the numbers show up right away. The Tolz Word Counter runs in
          your browser and updates as you type, so there is nothing to click and no page to refresh.
        </p>
        <p style={pStyle}>
          For writers, this matters more than it might seem. Almost every kind of writing comes with a length target:
          an essay with a strict limit, a blog post aimed at a certain depth, a caption that has to fit a platform's
          cap. Counting by hand is slow and easy to get wrong. A word counter lets you stay focused on the writing, and
          it helps you pace yourself, spot sections that run long, and trim or expand before you hit publish or submit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A good counter also shows more than one number. Students, editors, and content writers usually need character
          counts, sentence counts, and reading time at the same time, which is why this tool shows all of them together
          instead of making you switch between separate utilities.
        </p>
      </div>

      {/* Advantages */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Advantages Does a Word Counter Offer?</h2>
        <p style={pStyle}>The main benefits are simple, but they add up:</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Saves time.</strong> You get an exact count in a second instead of counting lines or estimating by
            page.
          </li>
          <li style={liStyle}>
            <strong>Helps you meet requirements.</strong> Going over or under a limit can cost you grades, rejected
            submissions, or truncated text.
          </li>
          <li style={liStyle}>
            <strong>Improves your writing.</strong> Seeing your sentence and paragraph counts makes it easier to catch
            rambling sentences and uneven structure.
          </li>
          <li style={liStyle}>
            <strong>Keeps you consistent.</strong> If you write articles, scripts, or product descriptions regularly, a
            counter helps you hold a steady length.
          </li>
          <li>
            <strong>Shows everything in one place.</strong> Words, characters, sentences, paragraphs, and reading time
            sit on one screen, so you don't need several tools.
          </li>
        </ul>
      </div>

      {/* Content writers */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Is a Word Counter Essential for Content Writers and Bloggers?</h2>
        <p style={pStyle}>
          Content writers work in briefs. A client might ask for 1,200 words, a 155-character meta description, and a
          60-character title. Missing any of those means rework, so a counter is part of the daily routine, much like a
          spell checker.
        </p>
        <p style={pStyle}>
          It also helps with pacing. If you plan a 1,500-word article with five sections, you can check each section as
          you go and see right away if one is running thin or eating up the whole word budget. Bloggers also use reading
          time to tell readers what to expect, and they use character counts for titles, excerpts, and social posts that
          promote the article.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Finally, it keeps you honest about padding. When you can see the count climb, it is easier to notice when you
          are adding words and not adding value.
        </p>
      </div>

      {/* Other people */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other People Who Rely on a Word Counter</h2>
        <p style={pStyle}>
          <strong>Students and academic writers</strong> deal with strict limits on essays, papers, and dissertations.
          Checking your count before you submit is a basic step, and it removes the guesswork when an instructor sets a
          minimum or maximum.
        </p>
        <p style={pStyle}>
          <strong>Social media managers</strong> work with hard character limits. A tweet, an Instagram caption, and a
          LinkedIn post all cap out at different lengths, and a character counter keeps a good caption from getting cut
          off.
        </p>
        <p style={pStyle}>
          <strong>Copywriters and marketers</strong> need exact lengths for meta titles, meta descriptions, ad
          headlines, and email subject lines. A few extra characters can mean the text gets truncated in search results
          or inboxes.
        </p>
        <p style={pStyle}>
          <strong>Translators and editors</strong> use word counts to estimate project size, calculate per-word rates,
          and check that a translation is close in length to the original.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Job seekers</strong> often face word or character limits in application portals, especially in cover
          letters and "why do you want this job" fields.
        </p>
      </div>

      {/* SEO */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Important Is Word Count for SEO?</h2>
        <p style={pStyle}>
          Word count is not a Google ranking factor on its own. Google has said there is no ideal length, and a short
          page that fully answers a question can outrank a long page that wanders. What matters is whether your content
          is helpful, complete, and written for people. Google explains this in its guidance on{" "}
          <Ext href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content">
            creating helpful, reliable, people-first content
          </Ext>
          .
        </p>
        <p style={pStyle}>
          That said, length still plays an indirect role. Competitive topics often need more space to cover the subject
          properly, and thin pages that skip important details tend to struggle. A practical approach is to look at the
          top results for your keyword, see how deeply they cover the topic, and write enough to answer the question
          better than they do. A counter helps you check that you have done that without padding.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Where character count matters more is in titles and descriptions. Search results usually show about 50 to 60
          characters of a title and about 150 to 160 characters of a description before cutting them off, so those two
          fields are worth checking every time.
        </p>
      </div>

      {/* Novels and theses */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Word Count Targets: Novels and PhD Theses</h2>
        <p style={pStyle}>
          People often use a word counter to track big projects, so here are the numbers writers ask about most. These
          are common guidelines, not strict rules, and publishers and universities set their own.
        </p>
        <h3 style={h3Style}>What is the minimum word count for a novel?</h3>
        <p style={pStyle}>
          Most publishers and writing competitions treat about 50,000 words as the lowest length for a novel. Some
          accept slightly less, around 40,000 words, but anything shorter is usually called a novella. In practice, most
          published adult novels run between 70,000 and 100,000 words. Fantasy and science fiction often go longer,
          sometimes 100,000 to 120,000, while middle grade books are typically much shorter, often 30,000 to 50,000
          words. If you plan to pitch to agents, aim for the typical range for your genre.
        </p>
        <h3 style={h3Style}>What is the minimum word count for a PhD thesis?</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There is no single minimum. It depends on the country, the university, and the field. In the United States,
          most doctoral dissertations fall somewhere between 50,000 and 100,000 words, with humanities and social
          science projects usually longer than lab-based science ones. In the UK, many universities set a maximum of
          around 80,000 words, and some allow up to 100,000. Some programs also set page limits instead of word limits.
          The safest move is to check your program's handbook or ask your supervisor, then use the counter to track
          your chapters against that limit.
        </p>
      </div>

      {/* Google Docs */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is There a Word Counter on Google Docs?</h2>
        <p style={pStyle}>
          Yes. Google Docs has a built-in word counter. Open your document, click <strong>Tools</strong>, then choose{" "}
          <strong>Word count</strong>. You can also press Ctrl + Shift + C on Windows or Cmd + Shift + C on a Mac. A
          small window shows pages, words, characters, and characters excluding spaces. If you check the box for{" "}
          <strong>Display word count while typing</strong>, a live count appears in the corner of the page.
        </p>
        <p style={pStyle}>
          To count only part of a document, highlight that section first and open the tool again. Google Docs shows the
          selection's count next to the full-document count. You can find more detail in the{" "}
          <Ext href="https://support.google.com/docs/">Google Docs Help Center</Ext>.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The built-in tool doesn't show sentence count, paragraph count, or reading time, and it only works inside
          Docs. The Tolz Word Counter is useful when you want those extra numbers or when your text lives somewhere
          else, such as an email, a CMS, or a chat window.
        </p>
      </div>

      {/* JavaScript */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Build a Simple Word Counter in JavaScript</h2>
        <p style={pStyle}>
          If you are learning web development, a word counter is a good small project. The idea is to read the text
          from a box, split it into words, and display the count each time the user types.
        </p>
        <p style={pStyle}>Here is a basic version you can save as an HTML file and open in your browser:</p>
        <pre style={preStyle}><code>{JS_CODE}</code></pre>
        <p style={pStyle}>
          Here is how it works. The <code style={mono}>trim()</code> method removes spaces from both ends, so extra
          spaces don't create a false word. The pattern <code style={mono}>/\s+/</code> splits the text on any run of
          spaces, tabs, or line breaks, which means double spaces and new lines are handled correctly. If the box is
          empty, the function returns 0 because splitting an empty string would otherwise give a count of 1. The{" "}
          <code style={mono}>input</code> event fires every time the text changes, which gives you the live updating
          behavior.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          From here you can add sentence counting by splitting on <code style={mono}>.</code>,{" "}
          <code style={mono}>!</code>, and <code style={mono}>?</code>, paragraph counting by splitting on blank lines,
          and reading time by dividing the word count by 200 or 238. Keep in mind that sentence counting is trickier
          than it looks, since abbreviations like "Dr." and decimals like "3.5" contain periods.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Tolz Word Counter</h2>
        <p style={pStyle}>
          Type directly into the text box, or paste in text from a document, email, or webpage. The counts for words,
          characters, sentences, and paragraphs update automatically as soon as text appears.
        </p>
        <p style={pStyle}>
          To check something new, clear the box and paste in the new text. The counts reset right away. You can use the
          tool on a finished draft or keep it open and write inside it to watch your count in real time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There is no file upload and no special formatting needed. Plain text, text with line breaks, and text copied
          from Word or Google Docs are all counted correctly.
        </p>
      </div>

      {/* What it measures */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Word Counter Measures</h2>
        <p style={pStyle}>One number rarely tells the whole story, so the tool tracks several at once:</p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Words:</strong> the total number of words, counted using standard word processing rules.
          </li>
          <li style={liStyle}>
            <strong>Characters (with and without spaces):</strong> platforms count characters differently. A meta
            description limit, for example, includes spaces, while some forms and translation jobs count only the
            visible characters.
          </li>
          <li style={liStyle}>
            <strong>Sentences:</strong> useful for checking sentence length. If your word count is high and your
            sentence count is low, your sentences are probably too long.
          </li>
          <li style={liStyle}>
            <strong>Paragraphs:</strong> helpful for reports and academic papers where paragraph structure is part of
            the formatting rules.
          </li>
          <li>
            <strong>Estimated reading time:</strong> a rough guide to how long a reader needs, based on an average
            adult reading speed of roughly 200 to 250 words per minute. It is handy for blog posts and newsletters where
            you want to set expectations upfront.
          </li>
        </ul>
      </div>

      {/* Free / private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Word Counter Free, Private, and Safe to Use?</h2>
        <p style={pStyle}>
          Yes to all three. Every feature is free, with no subscription, no hidden charges, and no usage cap. You don't
          need to create an account. Open the page and start counting.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your text is used only to generate the counts. It is not saved to a server, and since counting happens as you
          type in your browser, there is no upload step. That makes the tool a reasonable choice for drafts,
          confidential documents, and unpublished manuscripts. There are also no ads in the way, no watermarks, and no
          limit on how often you use the tool or how much text you check.
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
