import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a sleep calculator work?",
    a: "A sleep calculator works backward or forward from a fixed time, either your bedtime or wake-up time, in increments of roughly 90 minutes, which matches the average length of a full sleep cycle. It also adds a short buffer for the time it typically takes to fall asleep, giving you several recommended times that align with completing full sleep cycles rather than waking mid-cycle.",
  },
  {
    q: "How many hours of sleep do I actually need?",
    a: "Most adults need between seven and nine hours per night, though this varies by age and individual physiology. Rather than fixating on a single hour total, aligning your sleep with complete 90-minute cycles, typically five to six cycles for a full night, tends to produce more consistent, restorative results.",
  },
  {
    q: "What time should I go to bed if I need to wake up at 6 a.m.?",
    a: "This depends on how many complete sleep cycles you want before waking. Working backward in 90-minute increments from 6:00 a.m., with an added allowance for falling asleep, gives you several options; the calculator generates these instantly based on your exact wake-up time.",
  },
  {
    q: "Why do I feel tired even after 8 hours of sleep?",
    a: "Feeling groggy despite a full night's sleep often happens when your alarm interrupts you mid-cycle, particularly during deep sleep or REM sleep. Timing your wake-up to the end of a complete cycle, rather than a flat hour count, is the main way to reduce this grogginess.",
  },
  {
    q: "Is this sleep calculator free to use?",
    a: "Yes, the tool is completely free with no signup, no account creation, and no hidden fees. You can use it as many times as needed.",
  },
  {
    q: "Does this sleep calculator store any of my data?",
    a: "No. The tool calculates results instantly on the page without storing, saving, or sharing any information you enter.",
  },
  {
    q: "Can I use this tool to plan a nap instead of nighttime sleep?",
    a: "Yes, the same 90-minute cycle logic applies to naps. A full 90-minute nap tends to leave you more refreshed than a shorter nap that risks cutting off deep sleep mid-stage.",
  },
  {
    q: "Is a 90-minute sleep cycle accurate for everyone?",
    a: "It's an average based on sleep science research, and it's accurate for most adults, though individual cycle length can range from about 80 to 120 minutes. The calculator uses the 90-minute standard as a reliable general guideline.",
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

export default function SleepCalculatorFaqSection() {
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

      {/* Why timing matters */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Timing Your Sleep Matters More Than Just Counting Hours</h2>
        <p style={pStyle}>
          Most people think about sleep in terms of total hours, eight is the magic number, or so we're told.
          But the quality of your rest depends less on how long you're in bed and more on when you fall asleep
          and when you wake up relative to your natural sleep cycles. That's exactly what this sleep
          calculator on Tolz is built to solve. Instead of guessing, you simply enter either your intended
          bedtime or your required wake-up time, and the tool works backward or forward through complete
          90-minute sleep cycles to suggest the healthiest, least groggy option. It's a small shift in
          approach that makes a noticeable difference in how rested you actually feel.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Waking up in the middle of a deep sleep phase is the main reason people feel foggy and exhausted
          even after a full night in bed. A sleep calculator removes the guesswork by aligning your wake-up
          moment with the end of a sleep cycle rather than the middle of one, so you open your eyes during a
          lighter stage of sleep when your body is naturally closer to waking anyway.
        </p>
      </div>

      {/* How sleep cycles work */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Sleep Cycles Work (And Why the Calculator Uses Them)</h2>
        <p style={pStyle}>
          Sleep isn't a single, uniform state, it moves through a repeating cycle roughly every 90 minutes,
          made up of several distinct stages. It starts with light sleep, where your body begins to relax and
          your heart rate slows. This transitions into deep sleep, the stage responsible for physical repair,
          immune function, and memory consolidation. The cycle then moves into REM sleep, where most dreaming
          occurs and the brain processes emotional and cognitive information. After REM, the cycle either
          repeats or briefly surfaces toward wakefulness before starting again.
        </p>
        <p style={pStyle}>
          Across a typical night, a person moves through four to six of these cycles. Waking up at the
          boundary between cycles, rather than in the middle of deep or REM sleep, is what makes the
          difference between a groggy, disoriented start to the day and a clear-headed one. This is the core
          science behind why the calculator recommends times in 90-minute increments rather than simply
          subtracting or adding a flat eight hours.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth noting that sleep cycle length varies slightly from person to person, typically between
          80 and 120 minutes. The calculator uses the widely cited 90-minute average, which is accurate for
          most adults and offers a reliable, evidence-based starting point. If you find the suggested times
          don't perfectly match how you feel, it's worth tracking your own patterns over a week or two to
          fine-tune your personal rhythm around the calculator's baseline.
        </p>
      </div>

      {/* Circadian rhythm */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Circadian Rhythm and the Role of Consistency</h2>
        <p style={pStyle}>
          While sleep cycles determine sleep stages within a night, your circadian rhythm governs the broader
          24-hour pattern of alertness and drowsiness. This internal clock responds strongly to light
          exposure, meal timing, and, most importantly for this tool, consistency. Going to bed and waking up
          at similar times each day reinforces your circadian rhythm, making it easier to fall asleep quickly
          and wake up naturally, often before an alarm even goes off.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is why the sleep calculator is most useful not as a one-time lookup, but as a recurring
          reference point. Using it to plan a consistent bedtime and wake-up window, night after night, helps
          train your body's internal clock alongside the mechanical benefit of cycle-based timing.
        </p>
      </div>

      {/* When and why */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You'd Use a Sleep Calculator</h2>
        <p style={pStyle}>
          There are several everyday situations where knowing the ideal time to sleep or wake up makes a real
          difference:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Setting an alarm for an early commitment.</strong> If you know you need to be up at 6:00
            a.m. for work, a flight, or an exam, the calculator shows you several bedtime options, each
            landing you at the end of a full cycle, so you're not left guessing whether 10:30 p.m. or 11:00
            p.m. is the better choice.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Recovering from irregular sleep.</strong> After a late night, a shift change, or travel
            across time zones, your sleep pattern gets disrupted. Using the calculator to rebuild a
            cycle-aligned schedule helps you reset faster than randomly picking a bedtime.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning around shift work.</strong> People working night shifts or rotating schedules
            often need to sleep at unconventional hours. The same 90-minute logic applies regardless of the
            time of day, making the tool useful for daytime sleep planning as well.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Improving how a child or teenager wakes up.</strong> Parents managing school-morning
            routines often find that a cycle-timed wake-up reduces the resistance and grogginess that comes
            with waking a child mid-cycle.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Optimizing a nap.</strong> While the tool is primarily designed for nighttime sleep, the
            same cycle-based principle explains why a 90-minute nap often leaves people feeling more refreshed
            than a 45-minute one, the shorter nap risks interrupting deep sleep, while the longer one completes
            a full cycle.
          </li>
          <li>
            <strong>Preparing for a demanding day.</strong> Before an interview, a presentation, or physical
            exertion like a race or workout, timing sleep around full cycles supports better cognitive
            sharpness and physical recovery than simply aiming for "enough hours."
          </li>
        </ul>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Sleep Calculator</h2>
        <p style={pStyle}>
          Using the tool takes only a few seconds. Choose whether you want to calculate a bedtime based on a
          fixed wake-up time, or a wake-up time based on when you plan to go to sleep. Enter that single time
          value, and the calculator instantly generates a list of suggested times, each one representing the
          end of a complete 90-minute sleep cycle. It also factors in a short buffer for sleep latency, the
          average 10–20 minutes it takes most people to actually fall asleep after getting into bed, so the
          recommendations reflect real-world sleep timing rather than a theoretical instant lights-out.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          From there, you can pick the option that best fits your schedule, whether that means the earliest
          suggested time to maximize total rest or a later one that still lands on a clean cycle boundary.
          There's no need to create an account, install anything, or provide personal details, you get your
          results immediately and can adjust and recheck as many times as you like.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Data Privacy, Accuracy, and Trust</h2>
        <p style={pStyle}>
          This sleep calculator is completely free to use, with no signup, no email requirement, and no
          hidden charges of any kind. All calculations happen instantly on the page, no sleep data,
          timestamps, or personal information you enter are stored, tracked, or shared. You can use the tool
          as often as you'd like without creating a profile or leaving any trace of your activity.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The underlying calculation is based on the well-established 90-minute average sleep cycle length
          used in sleep science research, combined with a standard sleep latency buffer. While individual
          variation exists, this method is the same evidence-based approach referenced by sleep clinics and
          health resources worldwide, making the output a reliable general guideline rather than an arbitrary
          estimate. As with any general wellness tool, it's not a substitute for professional medical advice,
          if you're dealing with persistent sleep issues like insomnia or sleep apnea, a healthcare provider is
          the right resource for a personalized evaluation.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Practical Tips to Get More Out of Your Sleep Schedule</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Pairing the calculator's recommendations with a few supporting habits makes the results more
          effective. Keeping a consistent sleep and wake time, even on weekends, reinforces your circadian
          rhythm so you fall asleep faster and wake more naturally. Reducing screen exposure in the hour
          before bed limits blue light interference with melatonin production, helping you fall asleep closer
          to your intended time rather than drifting past it. Keeping your bedroom cool, dark, and quiet
          supports uninterrupted cycling through sleep stages, while avoiding caffeine in the afternoon and
          heavy meals close to bedtime reduces the chances of waking mid-cycle. None of these replace the
          value of cycle-based timing, but together they help you actually hit the times the calculator
          suggests rather than lying awake past your planned bedtime.
        </p>
      </div>

      {/* Who benefits */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Benefits Most From This Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Students juggling early classes, professionals managing demanding schedules, parents coordinating
          family routines, shift workers navigating non-traditional hours, and travelers adjusting to new time
          zones all face the same underlying question: what time should I actually go to sleep or wake up?
          Rather than relying on rough rules of thumb, this calculator gives a specific, science-backed answer
          tailored to the exact time constraint you're working with, making it a practical daily-use tool
          rather than a one-off curiosity.
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
