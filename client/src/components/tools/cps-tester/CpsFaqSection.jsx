import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is CPS calculated?",
    a: "Average CPS is your total valid clicks divided by the test's selected duration in seconds — for example, 62 clicks in a 5-second test is 62 ÷ 5 = 12.40 CPS. This tool measures your actual click events using the browser's high-resolution timing API; it never estimates or simulates clicks.",
  },
  {
    q: "What is Peak CPS, exactly?",
    a: "Peak CPS is the highest number of clicks found in any rolling 1-second window during your test — not your total clicks divided by a short slice of time, which can produce misleading spikes. If you click 6 times, all within a single second, your Peak CPS is 6, even if the rest of the test was slower.",
  },
  {
    q: "Why do Peak CPS and Average CPS show the same number on a 1-second test?",
    a: "With a 1-second test, the only possible 1-second window is the entire test, so the rolling-window Peak CPS calculation always equals the Average CPS by definition. That's expected — not a bug.",
  },
  {
    q: "Is this a real, accurate CPS test?",
    a: "Yes. Every click you see counted is a real, trusted pointer, touch, or key event — the tool never simulates or estimates clicks. Timing uses performance.now(), a monotonic high-resolution clock unaffected by system clock changes, so elapsed time and click intervals are measured precisely.",
  },
  {
    q: "Can this tool detect click-speed cheating or auto-clickers?",
    a: "No — this is a personal testing tool, not a competitive anti-cheat system. It filters out obviously invalid input (programmatic events, duplicate event types, clicks after a test ends), but it cannot reliably detect sophisticated hardware or software auto-clickers, and it doesn't claim to.",
  },
  {
    q: "Why did my test get cancelled?",
    a: "If you switch away from this browser tab while a test is running, the test is automatically cancelled rather than silently producing an inaccurate result — browsers throttle timers in inactive tabs, which would otherwise skew your CPS. Just start a new test when you're ready.",
  },
  {
    q: "Is touch/tap CPS the same as mouse CPS?",
    a: "Not necessarily. Touchscreen tapping engages different muscles and has different latency characteristics than a physical mouse button, so Mouse and Touch results are tracked and compared separately rather than mixed together.",
  },
  {
    q: "Can I test keys other than Space in Keyboard mode?",
    a: "Yes. Click \"Change Key\" in Keyboard mode and press whichever key you want to test — letters, numbers, arrow keys, modifier keys, function keys, all work. Only Escape and Tab can't be bound, since browsers reserve them for navigation.",
  },
  {
    q: "Does this tool store my results anywhere?",
    a: "Your test history and personal bests are stored only in this browser's local storage, tied to this device — never uploaded to a server or account. Clear History or Clear Personal Bests removes them at any time.",
  },
  {
    q: "What's a good CPS score?",
    a: "As a rough, entertainment-only guide: under 5 CPS is Casual, 5–8 is Average, 8–11 is Fast, 11–15 is Very Fast, and 15+ is Extreme. Most competitive Minecraft PvP players fall in the Fast-to-Very-Fast range with practice; these labels aren't a scientific or competitive ranking.",
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
        <p style={pStyle}>
          A CPS (Clicks Per Second) test measures how fast you can physically click a mouse button, tap
          a touchscreen, or press a key in a set amount of time. It's a favorite warm-up and bragging-rights
          tool for Minecraft PvP players, competitive gamers, and anyone curious how their clicking speed
          compares to typical benchmarks. The tester above measures your real click events directly — it
          never simulates or estimates a result. Built as part of{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>'s collection of free online utilities.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the CPS Tester Works</h2>
        <p style={pStyle}>
          Pick a test duration, then click, tap, or press your bound key (Space by default — bind any key
          you like) inside the test area as fast as you can.
          Your very first valid click both starts the timer and counts as click #1 — there's no separate
          "Start" button to fumble with. The test automatically ends the instant your selected duration
          elapses, and every click is timestamped using the browser's high-resolution monotonic clock
          (<code style={{ fontFamily: "monospace", background: "var(--bg-muted)", padding: "1px 5px", borderRadius: 4 }}>performance.now()</code>),
          not the number of times a display timer happened to tick.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>Choose Mouse, Touch, or Keyboard mode and a test duration (or set a custom one, 1 second up to 5 minutes). In Keyboard mode, bind any key you like — not just Space.</li>
          <li style={{ marginBottom: 8 }}>Click/tap/press inside the test area — your first input starts the clock.</li>
          <li style={{ marginBottom: 8 }}>Watch your live click count, elapsed/remaining time, and current CPS update in real time.</li>
          <li>When time's up, see your Average CPS, Peak CPS, total clicks, and click-interval breakdown instantly.</li>
        </ol>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The CPS Formula</h2>
        <p style={pStyle}>
          <strong>Average CPS = Total Valid Clicks ÷ Test Duration (seconds).</strong> For example, 20
          clicks in a 5-second test is 20 ÷ 5 = 4.00 CPS. This is the number shown as your final result,
          and it always uses the full selected test duration — not just the time between your first and
          last click.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Peak CPS</strong> is calculated differently: it's the highest number of clicks found
          inside any rolling 1-second window during the test, not a scaled-up fraction of a short burst.
          This avoids the misleading "extrapolated" peak values simpler CPS testers sometimes show.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Improve Your CPS</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}><strong>Try different click techniques.</strong> Jitter clicking (vibrating your forearm/wrist) and butterfly clicking (alternating two fingers) can both produce higher CPS than a single-finger click for short bursts.</li>
          <li style={{ marginBottom: 8 }}><strong>Relax your grip.</strong> A tense hand tires faster and often clicks slower — a light, relaxed grip on the mouse generally sustains a higher rate over longer tests.</li>
          <li style={{ marginBottom: 8 }}><strong>Test at multiple durations.</strong> A 1-second burst measures raw peak speed; a 30- or 60-second test measures sustained speed; a longer custom test (up to 5 minutes) measures real endurance — they train different things.</li>
          <li><strong>Watch for wrist strain.</strong> If rapid clicking causes discomfort, take breaks — this tool is for casual testing and practice, not an endurance challenge.</li>
        </ul>
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
