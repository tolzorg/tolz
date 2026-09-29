import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How long is one sleep cycle?",
    a: "A typical sleep cycle lasts about 90 minutes, though it can range from 70 to 120 minutes depending on the individual and the night. Each cycle moves through light sleep, deep sleep, and REM sleep in sequence.",
  },
  {
    q: "What's the difference between REM and non-REM sleep?",
    a: "Non-REM sleep comes first in each cycle and includes light and deep sleep, during which the body repairs itself physically. REM sleep follows, bringing near-total muscle paralysis, high brain activity, and most dreaming, it's closely tied to memory and emotional processing.",
  },
  {
    q: "Why do I feel more tired after 8 hours of sleep than after 6?",
    a: "This usually happens when an 8-hour sleep window ends in the middle of a sleep cycle, particularly during deep sleep, while a 6-hour window happens to align with a natural cycle boundary. Waking up mid-cycle causes sleep inertia, which can make you feel groggier even though you slept longer.",
  },
  {
    q: "Is it better to sleep for 6 hours or 7 hours?",
    a: "Neither is universally better, what matters is whether the total time aligns with complete 90-minute cycles. Six hours equals four full cycles, while seven hours falls in between cycles and may result in a mid-cycle wake-up. In this case, 7.5 hours (five cycles) would typically feel better than 7.",
  },
  {
    q: "How much sleep do I need for my age?",
    a: "Sleep needs shrink steadily from infancy to adulthood. Newborns need around 14–17 hours a day, school-age children need about 9–12 hours, teenagers need 8–10 hours, and most adults need 7 or more hours per night, with slightly less required for older adults.",
  },
  {
    q: "Does the tool store or share my sleep schedule data?",
    a: "No. The calculator processes the times you enter to generate your results and does not store or share your sleep data.",
  },
  {
    q: "Can I use this calculator for naps?",
    a: "While the tool is designed primarily for full nighttime sleep planning, the same 90-minute cycle logic can be applied to longer naps. Short naps (20–30 minutes) intentionally avoid entering deep sleep, while longer naps of around 90 minutes aim to complete a full cycle to reduce grogginess upon waking.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "How many sleep cycles do I need per night?",
    a: "Most healthy adults need 4 to 6 complete sleep cycles per night, roughly 6 to 9 hours of sleep. Five to six cycles (7.5–9 hours) is generally considered ideal for most people, though individual needs vary.",
  },
  {
    q: "How long is one sleep cycle?",
    a: "A typical sleep cycle lasts about 90 minutes, ranging from 70 to 120 minutes depending on the individual. Each cycle moves through light sleep, deep sleep, and REM sleep.",
  },
  {
    q: "What's the difference between REM and non-REM sleep?",
    a: "Non-REM sleep includes light and deep sleep, when the body physically repairs itself. REM sleep follows, bringing muscle paralysis, high brain activity, and most dreaming, and is linked to memory and emotional processing.",
  },
  {
    q: "Why do I feel more tired after 8 hours of sleep than after 6?",
    a: "This happens when an 8-hour sleep window ends mid-cycle, often during deep sleep, causing sleep inertia. A 6-hour window may align better with a natural cycle boundary and feel more restful.",
  },
  {
    q: "Is it better to sleep for 6 hours or 7 hours?",
    a: "What matters most is whether the total sleep time aligns with complete 90-minute cycles. Six hours equals four full cycles, while seven falls between cycles, so 7.5 hours (five cycles) often feels better.",
  },
  {
    q: "How much sleep do I need for my age?",
    a: "Sleep needs decrease with age. Newborns need 14–17 hours a day, school-age children need 9–12 hours, teenagers need 8–10 hours, and most adults need 7 or more hours per night.",
  },
  {
    q: "Does this sleep calculator account for the time it takes to fall asleep?",
    a: "The calculator's results start from the moment you fall asleep. Since most people take 15–20 minutes to fall asleep, it's best to go to bed slightly earlier than the suggested time.",
  },
  {
    q: "Is this sleep calculator free to use?",
    a: "Yes, the tool is completely free with no signup, subscription, or hidden charges required.",
  },
  {
    q: "Does the tool store or share my sleep schedule data?",
    a: "No, the calculator processes the times you enter to generate results and does not store or share your sleep data.",
  },
  {
    q: "Can I use this calculator for naps?",
    a: "The tool is designed primarily for nighttime sleep planning, but the same 90-minute cycle logic can be applied to longer naps aimed at completing a full sleep cycle.",
  },
];

const AGE_SLEEP_ROWS = [
  ["0–3 months", "14–17 hours"],
  ["4–12 months", "12–16 hours (including naps)"],
  ["1–2 years", "11–14 hours (including naps)"],
  ["3–5 years", "10–13 hours (including naps)"],
  ["6–12 years", "9–12 hours"],
  ["13–18 years", "8–10 hours"],
  ["18–60 years", "7 or more hours per night"],
  ["61–64 years", "7–9 hours"],
  ["65 years and older", "7–8 hours"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

export default function SleepCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
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
          Waking up tired even after eight hours in bed is one of the most common, and most misunderstood,
          sleep complaints. The problem usually isn't how long you sleep, but when you wake up relative to
          your sleep cycle. The sleep calculator above from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> solves this by working backward or forward
          through complete 90-minute sleep cycles, so you can time your night around your body's natural
          rhythm instead of an arbitrary number of hours. Whether you're setting an alarm for tomorrow or
          planning what time to go to bed tonight, this tool gives you a personalized schedule built around
          4, 5, or 6 full cycles.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Sleep Cycle Calculator Works</h2>
        <p style={pStyle}>
          Sleep isn't one continuous state, it moves through repeating cycles, and each cycle lasts roughly
          90 minutes, though it can run anywhere from 70 to 120 minutes depending on the person and the
          night. A healthy night's sleep usually includes 4 to 6 of these cycles back to back. Waking up in
          the middle of a cycle, especially during deep sleep, is what causes that heavy, disoriented
          feeling known as sleep inertia. Waking up at the boundary between cycles, when your body is
          naturally in a lighter stage of sleep, produces a noticeably easier and more alert wake-up.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The calculator uses this 90-minute framework to do the math for you. Enter either your intended
          wake-up time or your intended bedtime, and the tool calculates the corresponding times in
          multiples of 90 minutes, giving you options for 4, 5, or 6 complete cycles (roughly 6, 7.5, or 9
          hours). Instead of guessing, you get a set of scientifically grounded options and can choose the
          one that fits your schedule and how much time you actually have available.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Your Ideal Bedtime</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you already know what time you need to wake up, for work, school, or an early flight, the tool
          works backward from that time. Say you need to be up at 6:30 AM. Rather than assuming "8 hours
          before" is automatically your best bedtime, the calculator shows you several sleep-cycle-aligned
          bedtime options, such as going to sleep around 9:00 PM (six full cycles), 10:30 PM (five cycles),
          or 12:00 AM (four cycles). Each option represents a point where you're likely to wake up between
          cycles rather than in the middle of one. From there, it's worth adding another 15–20 minutes to
          account for the time it typically takes to actually fall asleep after getting into bed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Your Ideal Wake-Up Time</h2>
        <p style={pStyle}>
          The reverse works just as well. If you're heading to bed right now and want to know when to set
          your alarm, enter your bedtime and the calculator projects forward through the cycle count,
          showing wake-up times at the 4, 5, and 6-cycle marks. Try to leave room for at least four full
          cycles, going shorter than that tends to cut sleep short in a way that's hard to make up for with
          caffeine alone. This is especially useful for people without a fixed wake-up requirement, students
          studying late, people working irregular hours, or anyone who wants to avoid an alarm that lands
          mid-cycle.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It also helps to keep your wake-up time consistent from day to day, including weekends. A steady
          schedule trains your body to expect sleep and wakefulness at the same time, which makes the
          cycle-based timing from the calculator even more reliable over time.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens Inside a Sleep Cycle: REM and Non-REM Sleep</h2>
        <p style={pStyle}>
          Each 90-minute cycle is made up of two very different types of sleep: non-REM sleep and REM (rapid
          eye movement) sleep.
        </p>
        <p style={pStyle}>
          Non-REM sleep comes first and unfolds in stages. It starts light, with your body and mind
          gradually slowing down, then moves into deep sleep, sometimes called slow-wave sleep. During deep
          sleep, your heart rate and body temperature drop, brain activity slows considerably, and the body
          focuses on physical repair: restoring energy stores, secreting growth hormone, and supporting
          muscle and tissue recovery. This stage is widely considered the most physically restorative part
          of the night.
        </p>
        <p style={pStyle}>
          REM sleep follows and is quite different. During REM, the body is essentially paralyzed while the
          brain becomes highly active, this is when most vivid dreaming happens. REM sleep plays an
          important role in memory, learning, and emotional processing. In the earlier cycles of the night,
          you spend more time in non-REM sleep; as the night goes on, each cycle contains progressively more
          REM sleep. This is one reason the final stretch of a full night's sleep matters so much for how
          sharp and emotionally steady you feel the next day.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If REM sleep is repeatedly cut short, for example, by consistently waking up too early, the body
          tends to compensate later by pushing harder to get into REM sleep and spending more time there
          once it can. This rebound effect is one of the clearest signs that REM sleep serves a real
          biological purpose, even though researchers are still working out exactly how it benefits the
          brain.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Your Body's Internal Clock (Circadian Rhythm)</h2>
        <p style={pStyle}>
          Sleep timing isn't only about how many hours you get, it's also guided by your circadian rhythm,
          an internal 24-hour clock driven by hormonal signals. This clock naturally lines up with outside
          cues like daylight and darkness, and it keeps running on its own rough schedule even if those cues
          disappear for a while.
        </p>
        <p style={pStyle}>
          Jet lag is a good example of what happens when this internal clock falls out of sync. After a
          long-distance flight across time zones, your circadian rhythm is still set to your original
          location, so your body feels like it's a different time than the clock on the wall says. That
          mismatch is what makes it hard to fall asleep, wake up, or feel alert at the "right" local times
          until your body gradually adjusts.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Beyond travel, several everyday factors can shift or disrupt your circadian rhythm and sleep
          timing, including exposure to light (especially in the evening), your social and work schedule,
          napping habits, and individual genetic differences. Understanding this helps explain why two
          people with the same bedtime and wake-up time can still feel very differently rested, the
          underlying rhythm matters just as much as the number of hours logged.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What "Good" Sleep Quality Actually Means</h2>
        <p style={pStyle}>
          Sleep quality isn't just about total hours, it's also about how easily you fall asleep, how often
          you wake during the night, and how rested you feel afterward. Frequent interruptions disrupt the
          natural progression through sleep stages, which is part of why a full night that's constantly
          broken up can leave you feeling worse than a shorter, uninterrupted one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the best sleep quality, timing matters as much as duration. Ideally, your body's melatonin
          levels should peak and your core body temperature should hit its lowest point sometime after the
          middle of your sleep period and before you wake up. This is another reason a consistent,
          cycle-aligned schedule tends to produce better results than sleeping at random or wildly different
          times each night.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Sleep Do You Actually Need?</h2>
        <p style={pStyle}>
          Sleep needs aren't identical for everyone, age is one of the biggest factors, though individual
          variation matters too. As a general benchmark, getting 7 or more hours per night is associated
          with a range of positive health outcomes for most adults, though the right amount also depends on
          lifestyle, health, and how rested you feel during the day. A person getting enough sleep should
          generally be free of daytime sleepiness or dysfunction.
        </p>
        <p style={pStyle}>
          Sleep needs also change dramatically with age, newborns require far more sleep than adults, and
          this gap narrows steadily until sleep needs resemble adult levels by around age 5. The table below
          reflects general age-based sleep guidance:
        </p>
        <DataTable headers={["Age Group", "Recommended Sleep Per Day"]} rows={AGE_SLEEP_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Use these ranges as a starting point, then pair them with the calculator to find bedtime and
          wake-up times that both meet your total sleep need and align with full 90-minute cycles.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Use a Sleep Calculator</h2>
        <p style={pStyle}>
          A sleep calculator isn't only useful the night before a big day, it solves several everyday
          scheduling problems:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Setting an alarm for an early commitment.</strong> Before an exam, flight, interview, or
            early meeting, working backward from your required wake-up time helps you choose a bedtime that
            avoids a mid-cycle wake-up, rather than just picking a round number of hours.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning a short night realistically.</strong> If you know you'll only get five or six
            hours before a busy day, the calculator helps you choose the closest cycle-aligned option (four
            full cycles, for example) instead of an arbitrary time that might land you mid-cycle and leave
            you feeling worse than if you'd slept slightly less.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Recovering from jet lag or shift changes.</strong> Travelers adjusting to a new time
            zone and shift workers moving between day and night schedules can use the tool to re-anchor
            their sleep timing around complete cycles as they adapt.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Building a consistent sleep routine.</strong> People trying to establish better sleep
            hygiene can use the calculator regularly to identify a bedtime and wake-time pair that
            consistently lines up with full cycles, making it easier to stick to a schedule that actually
            feels restful.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>New parents and irregular sleepers.</strong> For anyone getting broken or shortened
            sleep, understanding cycle length helps in choosing nap or rest windows that are more likely to
            end in a lighter sleep stage rather than an abrupt wake from deep sleep.
          </li>
          <li>
            <strong>Students and night-shift workers.</strong> Those who need to sleep at unconventional
            hours can still apply the same 90-minute logic to daytime or split-schedule sleep, improving
            alertness even when the sleep window itself isn't ideal.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens When You Don't Get Enough Sleep</h2>
        <p style={pStyle}>
          Skipping sleep, or repeatedly waking up mid-cycle, doesn't just leave you tired, it interrupts the
          normal balance of non-REM and REM sleep your body relies on, and the effects show up quickly. In
          the short term, poor sleep tends to bring low energy, excessive daytime sleepiness, and difficulty
          concentrating. Reaction times slow down, which raises the risk of accidents, especially while
          driving. It's also linked to irritability, mood swings, and a harder time with memory,
          decision-making, and problem-solving, all of which can affect performance at school or work.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Physically, insufficient sleep can weaken the immune system, making you more likely to get sick,
          and it can reduce physical performance and coordination. Over the long term, chronic lack of sleep
          has been associated with a wide range of health issues, including weight gain, higher diabetes
          risk, heart and cardiovascular problems, anxiety and depression, chronic pain, and hormonal
          imbalances. Consistently poor sleep is one of the most well-documented factors linked to reduced
          overall quality of life, which is exactly why getting the timing right, not just the hours, makes
          such a meaningful difference.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Get the Most Out of Your Sleep Schedule</h2>
        <p style={pStyle}>
          The calculator gives you the timing, but a few habits help you actually hit those targets
          consistently:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Keep a consistent schedule.</strong> Go to bed and wake up at the same time every day,
            even on weekends, since irregular timing disrupts your circadian rhythm and makes cycle-based
            planning less accurate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Build a wind-down routine.</strong> Light activities like reading, stretching,
            journaling, or a few minutes of quiet breathing before bed signal to your body that it's time to
            slow down.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Watch your caffeine intake.</strong> Limit caffeine in the six to eight hours before
            your planned bedtime, since it can delay sleep onset and push your first cycle later than
            intended.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Go easy on alcohol before bed.</strong> Alcohol may make you feel drowsy at first, but
            it tends to reduce overall sleep quality and disrupt normal sleep cycles later in the night.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Put screens away.</strong> Reduce phone, tablet, and TV exposure in the hour before bed —
            the blue light they emit can interfere with melatonin production and delay sleep onset.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Get natural light during the day.</strong> Daytime sunlight exposure helps keep
            melatonin production on the right schedule, supporting better alertness during the day and
            easier sleep onset at night.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Move your body.</strong> Even light daily activity, like a 30-minute walk, has a
            measurable positive effect on sleep quality.
          </li>
          <li>
            <strong>Optimize your sleep environment.</strong> A cool, dark, quiet room, with a comfortable,
            supportive mattress, reduces the chances of waking mid-cycle from an environmental disruption.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          The 90-minute figure used in the calculator is an average, individual cycle length can vary
          slightly, so treat the results as a strong starting point and adjust by 10–15 minutes if you
          consistently notice a specific offset works better for you.
        </p>
      </div>

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
