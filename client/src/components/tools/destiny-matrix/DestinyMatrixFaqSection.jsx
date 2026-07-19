import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a Destiny Matrix calculator?",
    a: "It's a tool that takes your date of birth and generates a personal numerology-based chart, mapping numbers to specific life areas like core personality, relationships, finances, and talents.",
  },
  {
    q: "Is the Destiny Matrix Calculator free to use?",
    a: "Yes. The calculator on this page is completely free, with no signup, no hidden fees, and no limit on how many times you can generate a chart.",
  },
  {
    q: "Do I need my exact birth time to calculate my Destiny Matrix?",
    a: "No. Unlike astrology, the Destiny Matrix method only requires your full date of birth, day, month, and year. Birth time and location aren't part of the calculation.",
  },
  {
    q: "How accurate is a Destiny Matrix reading?",
    a: "The numbers themselves are calculated consistently using a fixed numerological method, so the chart itself is accurate to the system's rules. How well the personality descriptions match your real life is subjective, similar to other numerology and self-reflection frameworks.",
  },
  {
    q: "Can I calculate a Destiny Matrix for someone else?",
    a: "Yes. You can generate a chart for a partner, friend, child, or any other person as long as you have their date of birth.",
  },
  {
    q: "What is the karmic tail in a Destiny Matrix chart?",
    a: "The karmic tail is a specific position in the chart believed to represent a recurring pattern or lesson that shows up repeatedly across different situations in a person's life.",
  },
  {
    q: "What's the difference between a Destiny Matrix and a life path number?",
    a: "A life path number is a single digit derived from your birth date used in traditional numerology. A Destiny Matrix goes further, calculating multiple interconnected positions, center, corners, and lines, to build a fuller chart rather than one summary number.",
  },
  {
    q: "Do I need to create an account to see my full chart?",
    a: "No. Your complete Destiny Matrix chart is generated and displayed as soon as you enter your date of birth, no account or email required.",
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
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function DestinyMatrixFaqSection() {
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

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={pStyle}>
          Your date of birth carries more information than most people realize. The Destiny Matrix Calculator
          on <Link to="/" className="inline-home-link">Tolz</Link> turns that single piece of information into a complete personal chart in seconds — no birth
          time, no location, and no signup required. Just enter your birth date above, and the tool maps out
          your core numbers across every major area of your life, from your natural talents to your karmic
          patterns, love dynamics, and financial tendencies.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Destiny Matrix, sometimes called the Matrix of Destiny, is a self-discovery system that draws on
          numerology, the 22 Major Arcana, and elements of chakra symbolism to build a layered picture of a
          person from their birth numbers. Unlike single-number numerology systems that reduce you to one life
          path number, the Destiny Matrix calculates several interconnected positions — a center number,
          corner numbers, and connecting lines — each representing a different dimension of your personality
          and life experience. This calculator automates that entire process, so you get an accurate,
          instantly readable chart without doing the arithmetic by hand.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Destiny Matrix Calculator Works</h2>
        <p style={pStyle}>
          Using the tool is straightforward. Enter your full date of birth in the format requested, and the
          calculator instantly generates your personal matrix, a geometric chart with numbers placed at the
          center, corners, and connecting lines. Each position corresponds to a specific area of life, and
          each number carries its own meaning within the 22-arcana framework this method is built on.
        </p>
        <p style={pStyle}>
          Behind the scenes, the calculator performs a series of additions and reductions on the digits of
          your birth date, following the standard Destiny Matrix methodology. What would normally take a
          trained practitioner several minutes of manual calculation happens instantly here, with the same
          numerical logic applied consistently every time. Because the output depends only on arithmetic
          performed on the date you provide, results are consistent — enter the same birth date twice and
          you'll get the same chart both times.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You don't need to create an account, verify an email, or provide any information beyond your birth
          date. The chart appears on the page immediately after you submit the date, ready to read,
          screenshot, or note down.
        </p>
      </div>

      {/* What it reveals */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Your Destiny Matrix Chart Reveals</h2>
        <p style={pStyle}>
          A completed chart is organized into distinct positions, and understanding what each one represents
          makes the reading far more useful than looking at isolated numbers.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Core Essence.</strong> The center number is generally treated as the anchor of the whole
            chart — the underlying energy or temperament that shapes how you approach the rest of your life.
            Many people find this number the easiest starting point when learning to read their chart for the
            first time.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Karmic Tail.</strong> This position looks at recurring patterns, situations or reactions
            that seem to repeat across different relationships, jobs, or years, regardless of the specific
            people or circumstances involved. It's one of the more discussed parts of the system because it
            tries to name a pattern rather than just describe a trait.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Love Line.</strong> This line focuses on relationship tendencies: what you're drawn to in
            a partner, and the emotional dynamic that tends to surface once a relationship gets serious. It's
            frequently the section people return to when trying to understand a specific relationship pattern.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Money Line.</strong> This position addresses financial energy, where money tends to flow
            easily for you, and where blocks or hesitation tend to show up. It's read alongside the core
            essence number, since financial behavior is often tied to broader personality traits.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Talent Zone.</strong> This area highlights natural abilities, often ones a person has had
            for so long they no longer register them as a "talent" — skills that came easily rather than
            through deliberate practice.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Portrait Zone.</strong> Sometimes called the mirror zone, this position reflects how you
            tend to come across to other people, which doesn't always match how you experience yourself
            internally.
          </li>
          <li>
            <strong>Life Purpose Numbers.</strong> These positions point toward the kind of contribution or
            direction a person's life tends to organize itself around, often split between an earlier and a
            later stage of life.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Each of these numbers can express itself in a more constructive way or a more limiting way, and
          reading a chart well usually means considering both sides rather than treating any single number as
          fixed or purely positive or negative.
        </p>
      </div>

      {/* When and why */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why People Use a Destiny Matrix Calculator</h2>
        <p style={pStyle}>
          People turn to this tool for a range of reasons, and the use cases tend to fall into a few
          recognizable situations.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Starting a self-reflection practice.</strong> Many people come to the Destiny Matrix after
            trying journaling, personality frameworks, or therapy, looking for another lens on why certain
            patterns in their life keep showing up. The chart gives specific starting points for that
            reflection rather than a generic personality description.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Understanding a relationship pattern.</strong> The love line and karmic tail sections are
            often used by people trying to make sense of a recurring dynamic in dating or in a long-term
            relationship — why the same disagreement resurfaces, or why a particular type of partner keeps
            appearing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Looking at financial habits.</strong> The money line section is commonly checked by people
            who feel like they work hard but keep hitting the same financial ceiling, as a way of framing
            where their effort and their results seem to disconnect.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Reading a child's or family member's chart.</strong> Parents sometimes generate a chart
            for a child using only the child's date of birth, as a way to think through the child's
            temperament, learning style, or emotional needs from a different angle than typical parenting
            advice offers.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Comparing two people.</strong> Because the calculator only needs a date of birth, it's
            easy to generate charts for two people — a partner, a friend, a business partner — and look at
            where the two charts complement or clash.
          </li>
          <li>
            <strong>Curiosity and first-time exploration.</strong> A large share of visitors are simply trying
            the system for the first time after hearing about it, and want a fast, no-commitment way to see
            their own chart before reading more about how to interpret it.
          </li>
        </ul>
      </div>

      {/* Accuracy and privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and What You Should Know Before You Start</h2>
        <p style={pStyle}>
          The calculator follows the standard Destiny Matrix numerological method consistently, so the numbers
          generated for your chart are calculated the same way every time from your date of birth, there's no
          randomness or guesswork built into the output. That said, the Destiny Matrix is a self-discovery and
          reflection framework rooted in numerology and symbolic systems, not a scientifically validated
          psychological or predictive tool. It's best approached as a structured way to reflect on your own
          patterns rather than as a factual forecast of what will happen in your life.
        </p>
        <p style={pStyle}>
          On the practical side, using the tool is completely free, with no hidden charges, subscriptions, or
          upsells required to see your full chart. You don't need to create an account or submit an email
          address to generate a reading, only your date of birth is required, and that's the only information
          the calculation depends on. The tool is built to give you the complete chart in one view rather than
          locking sections behind a paywall.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If privacy is a concern, know that a date of birth on its own isn't tied to identifying information
          unless you choose to share more. Treat the calculator the way you would any online tool: avoid
          entering additional personal details beyond what's actually requested, and you control entirely what
          you do with your results afterward — save them, screenshot them, or simply read them on the page.
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
