import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a good CPS score?",
    a: "For regular clicking without special techniques, an average of 6 to 9 clicks per second is considered good. Scores above 10 usually involve techniques like jitter or butterfly clicking.",
  },
  {
    q: "How is CPS calculated?",
    a: "CPS is calculated by dividing your total number of clicks by the total time in seconds. For example, 30 clicks in 5 seconds equals a CPS of 6.",
  },
  {
    q: "How long should a CPS test be?",
    a: "It depends on what you're measuring. Short tests (5–10 seconds) show your burst speed and peak CPS, while longer tests (30 seconds to a few minutes) reveal how well you sustain speed over time. This tool supports both, with custom durations up to five minutes.",
  },
  {
    q: "Does mouse type affect CPS test results?",
    a: "Yes. Mice differ in click actuation force, debounce delay, and switch type, all of which affect how quickly clicks register.",
  },
  {
    q: "Is jitter clicking or butterfly clicking better for CPS?",
    a: "Butterfly clicking generally produces a higher raw CPS since it uses two fingers alternating clicks, while jitter clicking uses arm tension with a single finger and is usually more sustainable over longer periods. Many competitive games restrict butterfly clicking, so check the rules of the game you're testing for before relying on it.",
  },
  {
    q: "What is the world record for most clicks in 10 seconds?",
    a: "According to Recordsetter.com, Dylan Allred of Las Vegas, Nevada holds the record with 1,051 clicks in 10 seconds, far beyond what typical manual clicking can achieve.",
  },
  {
    q: "What CPS should I aim for in Minecraft PvP?",
    a: "For casual play, 6 to 10 CPS is generally enough. Competitive players tend to prioritize consistent, well-timed clicking over raw maximum speed, since Minecraft's attack cooldown limits how much extra clicking actually translates into more hits.",
  },
  {
    q: "Can I use this CPS tester without creating an account?",
    a: "Yes. No signup, login, or personal information is required. You can start testing immediately and your personal best is tracked automatically during your session.",
  },
  {
    q: "Why do my CPS results vary between tests?",
    a: "Click speed naturally fluctuates due to hand fatigue, focus, grip position, and even the surface your mouse is on. Running multiple tests and comparing your average over several attempts gives a more reliable picture than a single result.",
  },
  {
    q: "Is this CPS test accurate?",
    a: "Yes. The tool uses precise browser-based timing to record each click, calculating average CPS, peak CPS, and click intervals directly from that data rather than estimating results.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5,
  color: "var(--text-primary)", marginTop: 16, marginBottom: 6,
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

const RANKING_ROWS = [
  ["0–3 CPS", "Very slow", "Clicking pace is well below average; technique adjustments can help."],
  ["3–5 CPS", "Casual", "Typical of everyday, non-competitive computer use."],
  ["5–7 CPS", "Solid", "A comfortable pace suitable for most gaming and daily tasks."],
  ["7–10 CPS", "Above average", "Effective for competitive gaming scenarios."],
  ["10–14 CPS", "Advanced", "Usually achieved with jitter or butterfly clicking."],
  ["14+ CPS", "Elite", "Reached almost exclusively through specialized techniques."],
];

const thStyle = {
  textAlign: "left", padding: "8px 10px", fontSize: 12, fontWeight: 700,
  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em",
  borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
};
const tdStyle = { padding: "8px 10px", fontSize: 13, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };

export default function CpsFaqSection() {
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
          Testing how fast you can click is one of the simplest ways to measure reflexes, mouse
          responsiveness, and hand coordination. Whether you're a competitive gamer chasing faster
          reaction times, curious about your clicking limits, or checking whether your mouse can keep up
          with rapid input, a reliable CPS test gives you the numbers instantly. This CPS tester from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> lets you run a quick, accurate click speed
          test directly in your browser, with flexible timers, detailed stats, and no account required.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a CPS Test?</h2>
        <p style={pStyle}>
          CPS stands for Clicks Per Second, a measurement of how many times you can press a mouse button
          within a set time frame. A CPS test tracks every click you make during a session and calculates
          your speed, giving you a clear number that represents your clicking performance. This metric
          matters most in fast-paced games where rapid clicking directly affects gameplay outcomes, such as
          building structures quickly, attacking repeatedly, or interacting with on-screen elements at
          speed.
        </p>
        <p style={pStyle}>
          Unlike a simple stopwatch and manual count, an automated click speed test removes human error
          from the equation. Every click is timestamped precisely, so the results reflect your actual
          performance rather than an estimate. Beyond gaming, plenty of people use a CPS test simply to
          unwind, treating the fast, repetitive clicking as a quick, low-stakes way to blow off stress
          during a break.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Interestingly, some players take clicking speed extremely seriously. According to
          Recordsetter.com, the fastest recorded mouse clicking belongs to Dylan Allred of Las Vegas,
          Nevada, who managed 1,051 clicks in 10 seconds, a pace far beyond what any manual technique could
          realistically sustain. Most everyday testers land nowhere near that number, and that's completely
          normal; it's a useful benchmark for context, not a target.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How This CPS Tester Works</h2>
        <p style={pStyle}>
          This tool is built to give you more than just a single final number. Here's what you get during
          and after every session:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Flexible Duration Options.</strong> Choose from common presets or set a custom duration
            of up to five minutes. Shorter tests (like 5 or 10 seconds) are ideal for measuring burst speed,
            while longer durations reveal how well you can sustain a fast clicking pace without your hand
            tiring or your rhythm breaking down.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Peak CPS Tracking.</strong> Beyond your average score, the tool identifies the fastest
            moment in your session, your peak CPS. This is useful because clicking speed rarely stays
            constant. Peak CPS shows your true upper limit, which matters if you're trying to understand
            your maximum physical capability rather than just your average pace.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Click-Interval Statistics.</strong> The tool measures the time gap between each
            individual click, giving you a breakdown of consistency rather than just a final total. Two
            people can have the same average CPS but very different rhythms, one might click in short, even
            bursts, while another might click in irregular spurts. Interval data helps you see which pattern
            describes your own technique.
          </li>
          <li>
            <strong>Personal Best Tracking.</strong> Your highest recorded score is saved locally so you
            can track improvement over repeated sessions. This turns a one-time test into a practice tool,
            letting you see whether your clicking speed is actually getting faster over days or weeks of
            use.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Using the tool is straightforward: select your preferred duration, click the start area, click as
          fast as you can until the timer ends, and review your results, including total clicks, average
          CPS, peak CPS, and interval consistency.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Is CPS Calculated?</h2>
        <p style={pStyle}>
          CPS is simply a rate: how many clicks happen per second, on average, across your test session.
          The formula behind it is straightforward:
        </p>
        <p style={{ ...pStyle, fontWeight: 700, color: "var(--text-primary)" }}>
          CPS = Total Number of Clicks ÷ Total Time in Seconds
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For example, if you click 30 times within a 5-second test, your CPS works out to 30 ÷ 5 = 6
          clicks per second. Or, if you register 50 clicks in a 10-second session, that's 50 ÷ 10 = 5 CPS.
          This tool runs that calculation automatically and in real time using precise browser timing, so
          you don't need to do the math yourself, but understanding the formula helps explain why longer
          tests often show a slightly lower average than short bursts: sustaining a fast pace over more time
          is naturally harder than a quick sprint.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need a Click Speed Test</h2>
        <p style={pStyle}>
          A CPS test isn't only for competitive gamers, though that's the most common use case. Here are
          the practical scenarios where this tool comes in handy:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Gaming performance checks.</strong> Many games, particularly sandbox and PvP-focused
            titles, reward players who can click rapidly and consistently. Testing your CPS beforehand helps
            you understand your baseline before a match, tournament, or ranked session, so you know what to
            expect from your own performance. Some players also use a CPS test as a warm-up before
            precision-timing games like Geometry Dash, where quick, repeated inputs help during difficult
            sections.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Mouse hardware testing.</strong> If you've just bought a new mouse or are comparing two
            models, a CPS test reveals real differences in responsiveness. Some mice have input lag or
            debounce delays that cap how fast your clicks actually register, even if your finger is moving
            quickly. Running the same test across different mice highlights these gaps clearly.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Clicking technique practice.</strong> Players learning jitter clicking, butterfly
            clicking, or drag clicking need a way to measure whether the new technique is actually faster
            than their normal click. Repeated testing during practice sessions shows measurable progress
            instead of guesswork.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Friendly competitions and challenges.</strong> Comparing scores with friends,
            classmates, or online communities is one of the most common reasons people search for a CPS test
            in the first place. A shareable, consistent scoring method makes these comparisons fair.
          </li>
          <li>
            <strong>General curiosity and reflex checks.</strong> Not every use case is competitive. Many
            people simply want to know their clicking speed compared to typical benchmarks, treating it as a
            quick reflex or coordination check.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Clicking Techniques: Step-by-Step and CPS Benchmarks</h2>
        <p style={pStyle}>
          Clicking speed varies significantly based on technique. Below is a practical breakdown of each
          method, roughly how much CPS it tends to produce, and how to try it yourself.
        </p>

        <h3 style={h3Style}>Regular Clicking (around 4–7 CPS)</h3>
        <p style={pStyle}>
          This is how most people click without any special technique, using one finger in a natural
          press-and-release motion.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 6 }}>Rest your index finger lightly on the left mouse button.</li>
          <li style={{ marginBottom: 6 }}>Press down and release in a smooth, rhythmic motion.</li>
          <li>Keep your wrist relaxed and maintain a steady pace rather than rushing.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 8 }}>
          A consistent rhythm usually produces a better score than clicking as hard and fast as possible in
          an uneven burst.
        </p>

        <h3 style={h3Style}>Jitter Clicking (around 9–14 CPS)</h3>
        <p style={pStyle}>
          This technique uses rapid muscle vibrations in the arm and wrist to generate fast clicks without
          fully lifting the finger between presses.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 6 }}>Place your index finger firmly on the left mouse button.</li>
          <li style={{ marginBottom: 6 }}>Tense your arm and wrist muscles until your hand begins to vibrate naturally.</li>
          <li>Let the vibration drive the clicks rather than consciously pressing each one individually.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 8 }}>
          Jitter clicking places real strain on the hand, wrist, and arm, so stop immediately if you feel
          any discomfort, and avoid long sessions without breaks.
        </p>

        <h3 style={h3Style}>Butterfly Clicking (around 12–20 CPS)</h3>
        <p style={pStyle}>
          This method uses two fingers alternating rapidly on the same button, which pushes scores
          noticeably higher than single-finger techniques.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 6 }}>Place your index and middle fingers both on the left mouse button.</li>
          <li style={{ marginBottom: 6 }}>Alternate between the two fingers as quickly as possible in a light flapping motion.</li>
          <li>Keep both fingers close to the button to minimize unnecessary movement.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 8 }}>
          Some game servers flag butterfly clicking as similar to double-clicking exploits, so it's worth
          checking the rules of any competitive platform before relying on it.
        </p>

        <h3 style={h3Style}>Drag Clicking (20 CPS and often much higher)</h3>
        <p style={pStyle}>
          Drag clicking produces multiple clicks from a single dragging motion, relying on the friction
          between your finger and the mouse button surface rather than repeated presses.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 6 }}>Place your finger at the back edge of the mouse button.</li>
          <li style={{ marginBottom: 6 }}>Apply light downward pressure and drag your finger forward across the button in one smooth motion.</li>
          <li>The friction generated registers multiple rapid clicks from that single drag.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 8, marginBottom: 0 }}>
          This technique is hardware-dependent. It typically only works on gaming mice with specific button
          surfaces and switch types, so it's worth checking whether your mouse model actually supports it
          before assuming a low score means poor technique.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>CPS Score Rankings — How Do You Compare?</h2>
        <p style={pStyle}>
          Once you have a result, it helps to know where it falls relative to typical performance. These
          general bands give you a rough sense of where most testers land:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Range</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>What It Usually Means</th>
              </tr>
            </thead>
            <tbody>
              {RANKING_ROWS.map(([range, level, meaning]) => (
                <tr key={range}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{range}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{level}</td>
                  <td style={tdStyle}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most casual and competitive purposes, a score between 6 and 10 CPS using regular clicking is
          considered solid. If your result sits below 5, it's usually more effective to work on rhythm and
          finger relaxation first before assuming your hardware is the limiting factor.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>CPS in Minecraft PvP</h2>
        <p style={pStyle}>
          Minecraft PvP is one of the most common reasons players run a CPS test in the first place, since
          click speed directly influences combat, bridging, and knockback control.
        </p>
        <p style={pStyle}>
          It's worth knowing that Minecraft's Java Edition can only register a limited number of hits per
          second regardless of how fast you physically click, roughly around 2 effective hits per second in
          many cases, due to the game's attack cooldown system. That means clicking far beyond what the game
          can register doesn't always translate into extra damage, but it still affects timing,
          consistency, and how quickly you can react during fast exchanges.
        </p>
        <p style={pStyle}>Within Minecraft PvP, clicking speed is often grouped into rough categories:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>1–3 CPS (extremely slow):</strong> Clicking this slow generally only makes sense in very
            specific situations, such as chasing-hitting a slowed opponent, and isn't practical for regular
            combat.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>4–7 CPS (moderately slow):</strong> A comfortable, steady pace that works fine for most
            PvP without straining your hand.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>8–13 CPS (moderately high):</strong> Starts to complicate aim and control, since faster
            clicking can come at the cost of precision.
          </li>
          <li>
            <strong>14+ CPS (extremely fast):</strong> Can interrupt an opponent's sprint more frequently
            during hits, effectively increasing your reach advantage, though it typically requires jitter or
            butterfly clicking to sustain.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Click speed matters in a few specific ways during Minecraft PvP:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Combat.</strong> Each hit is subject to an attack cooldown, so a higher CPS gives you
            more chances to land hits during the brief windows created by knockback, but consistency tends
            to matter more than raw speed alone.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bridging.</strong> Placing blocks rapidly while moving benefits directly from faster,
            more consistent clicking, which is why competitive players often use jitter or butterfly
            clicking specifically to speed up bridging.
          </li>
          <li>
            <strong>Knockback control.</strong> Interrupting an opponent's movement depends on timing clicks
            correctly during the short window after knockback occurs. A higher CPS provides more
            opportunities within that window, but uncontrolled fast clicking that sacrifices accuracy is
            usually less effective than a steady, well-timed pace.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          For casual Minecraft PvP, a CPS between 6 and 10 is generally enough. For more competitive play,
          prioritizing consistency and timing over raw maximum speed tends to produce better results than
          clicking as fast as physically possible.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Improve Your Click Speed</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you're testing your CPS with the goal of improving it, a few practical adjustments make a
          measurable difference. Keeping your wrist and forearm relaxed rather than tense reduces fatigue
          and allows for quicker repeated motion. Using a gaming mouse with a lighter click actuation force
          can shave milliseconds off each press, which adds up significantly over a testing period, and
          often produces a noticeable score boost compared to a standard laptop touchpad or basic mouse.
          Practicing in short, frequent sessions rather than long single sessions helps build muscle memory
          without overworking your finger tendons; even around 10 minutes of consistent daily practice
          tends to produce a measurable improvement over time. Finally, testing across different durations,
          not just short 5-second bursts, gives a more complete picture of your real-world clicking
          stamina, since many games require sustained speed rather than a single quick burst.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 4 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </div>
  );
}
