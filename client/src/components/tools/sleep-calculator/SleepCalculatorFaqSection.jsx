import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How long is one sleep cycle?",
    a: "About 90 minutes on average, though it can range from 70 to 120 minutes depending on the person and the night. Each cycle moves through light sleep, deep sleep, and REM sleep.",
  },
  {
    q: "How many sleep cycles do I need per night?",
    a: "Most adults need five to six cycles (7.5 to 9 hours). Four cycles (6 hours) is a minimum for occasional short nights, not a long-term goal.",
  },
  {
    q: "What's the difference between REM and non-REM sleep?",
    a: "Non-REM sleep includes light and deep sleep, when the body physically repairs itself. REM follows, with near-total muscle paralysis, high brain activity, and most dreaming, and it is closely tied to memory and emotional processing.",
  },
  {
    q: "Why do I feel more tired after 8 hours of sleep than after 6?",
    a: "An 8-hour window may end mid-cycle, often in deep sleep, causing sleep inertia. A shorter window that happens to end near a cycle boundary can feel better, but regularly sleeping six hours is still below what most adults need.",
  },
  {
    q: "Is it better to sleep 6 or 7 hours?",
    a: "Seven is closer to the recommended minimum, but because 7 hours falls between cycles, 7.5 hours (five cycles) will often feel best.",
  },
  {
    q: "Does the calculator account for the time it takes to fall asleep?",
    a: "Yes. The calculator adds an average of 15 minutes to fall asleep, so the bedtimes it shows are the times to get into bed. If you usually take longer to drift off, go to bed a little earlier than the suggested time.",
  },
  {
    q: "How much sleep do I need for my age?",
    a: "Newborns need 14 to 17 hours a day, school-age children 9 to 12, teenagers 8 to 10, and most adults seven or more hours per night.",
  },
  {
    q: "Can I use this calculator for naps?",
    a: "Yes. Short naps of 20 to 30 minutes help avoid deep sleep, and a nap of about 90 minutes completes one cycle.",
  },
  {
    q: "Does the tool store or share my sleep schedule data?",
    a: "No. The calculator processes the times you enter to produce results and does not store or share your sleep data.",
  },
  {
    q: "Is this sleep calculator free?",
    a: "Yes. It is completely free, with no signup, subscription, or hidden charges.",
  },
];

const WAKE_AT_FIVE_ROWS = [
  ["6 cycles", "9 hours", "8:00 PM", "7:45 PM"],
  ["5 cycles", "7.5 hours", "9:30 PM", "9:15 PM"],
  ["4 cycles", "6 hours", "11:00 PM", "10:45 PM"],
];

const AGE_SLEEP_ROWS = [
  ["0–3 months", "14–17 hours"],
  ["4–12 months", "12–16 hours (including naps)"],
  ["1–2 years", "11–14 hours (including naps)"],
  ["3–5 years", "10–13 hours (including naps)"],
  ["6–12 years", "9–12 hours"],
  ["13–18 years", "8–10 hours"],
  ["18–60 years", "7 or more hours"],
  ["61–64 years", "7–9 hours"],
  ["65 years and older", "7–8 hours"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const last = { ...pStyle, marginBottom: 0 };
const firstH3 = { ...h3Style, marginTop: 0 };
const cardStyle = { padding: "20px 20px" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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
        <p style={last}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Sleep Cycle Calculator Works</h2>
        <p style={pStyle}>
          Sleep isn't one continuous state. It moves through repeating cycles of light sleep, deep sleep, and REM
          (rapid eye movement) sleep. A cycle lasts about 90 minutes on average, though it can run from roughly 70
          to 120 minutes depending on the person, their age, and the night. Adults usually complete 4 to 6 cycles in
          a night. Waking in the middle of a cycle, especially out of deep sleep, is a common cause of sleep
          inertia, the heavy, disoriented grogginess that can last 15 to 30 minutes or longer. Waking near the end
          of a cycle, when sleep is naturally lighter, tends to feel easier.
        </p>
        <p style={pStyle}>
          Enter either the time you want to wake up or the time you plan to go to bed, and the calculator returns
          times in multiples of 90 minutes: 4 cycles (6 hours), 5 cycles (7.5 hours), or 6 cycles (9 hours). Two
          practical notes make the results more accurate:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            The calculator already allows for falling asleep. Most people need about 15 to 20 minutes to drift
            off, so the bedtimes it shows include an average of 15 minutes. They are the times to get into bed, not
            the times you fall asleep. If you usually take longer, go to bed a little earlier.
          </li>
          <li style={liStyle}>
            Treat 90 minutes as a well-informed average, not a law. Your own cycles may be a little shorter or
            longer. If you consistently feel better with a specific offset, shift your times by 10 to 15 minutes.
            Sleep science supports the cycle structure itself, but the exact benefit of waking at a boundary
            varies from person to person, so use the results as a strong starting point.
          </li>
        </ul>
        <p style={last}>
          For a deeper look at how each stage works, the{" "}
          <Ext href="https://www.sleepfoundation.org/stages-of-sleep">Sleep Foundation's guide to the stages of sleep</Ext>{" "}
          is a useful reference.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Your Ideal Bedtime</h2>
        <p style={pStyle}>
          If you already know when you need to be up, for work, school, or an early flight, the calculator works
          backward from that time. Say you need to wake at 6:30 AM. Instead of assuming that "eight hours before"
          is automatically best, you would see cycle-aligned options such as:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>9:30 PM asleep for 6 cycles (9 hours)</li>
          <li style={liStyle}>11:00 PM asleep for 5 cycles (7.5 hours)</li>
          <li style={liStyle}>12:30 AM asleep for 4 cycles (6 hours)</li>
        </ul>
        <p style={pStyle}>
          Each option puts your alarm near a cycle boundary. These are the times to be asleep. The calculator adds
          about 15 minutes to fall asleep, so it shows the matching times to get into bed: 9:15 PM, 10:45 PM, and
          12:15 AM.
        </p>

        <h3 style={h3Style}>What time should you sleep if you need to wake at 5:00 AM?</h3>
        <p style={pStyle}>
          For a 5:00 AM wake-up, these are the cycle-aligned times to be asleep, along with the time to actually
          get into bed:
        </p>
        <DataTable headers={["Cycles", "Total sleep", "Fall asleep by", "Get into bed by"]} rows={WAKE_AT_FIVE_ROWS} />
        <p style={last}>
          For most adults, being in bed by about 9:15 PM (five cycles) is the best balance, because it meets the
          recommended seven or more hours. Four cycles is a fallback for occasional short nights, not a routine. If
          you are not used to going to bed that early, move your bedtime earlier by 15 to 30 minutes every few days
          rather than all at once, and get bright light soon after you wake up to anchor the new schedule.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Calculating Your Ideal Wake-Up Time</h2>
        <p style={pStyle}>
          The reverse works just as well. If you are going to bed right now and want to know when to set your
          alarm, enter the time you get into bed (the calculator adds about 15 minutes to fall asleep) and it
          projects forward to the 4-, 5-, and 6-cycle marks. Aim for at least four cycles, and ideally five or six.
          This is also handy for students studying late, people with irregular hours, and anyone without a fixed
          wake-up time.
        </p>

        <h3 style={h3Style}>What if I wake up in the middle of the night?</h3>
        <p style={pStyle}>
          The same logic helps at 3:00 AM. Treat the moment you fall back asleep as a new starting point and count
          forward in 90-minute steps to pick an alarm time, rather than lying awake worrying about how much sleep you
          have lost. If you are very short on time, a shortened night that ends at a cycle boundary usually feels
          better than a slightly longer one that ends mid-cycle.
        </p>

        <h3 style={h3Style}>I slept the whole day. How can I sleep if I need to wake up early tomorrow?</h3>
        <p style={pStyle}>
          A long daytime sleep reduces your sleep pressure, the built-up need for sleep that makes you drowsy at
          night, so it's normal to feel wide awake at bedtime. Don't try to force it. Instead:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Fix your wake-up time first.</strong> Set the alarm for the time you need, using the
            calculator, and get up when it rings even if you slept poorly.
          </li>
          <li style={liStyle}>
            <strong>Get bright light and move.</strong> Morning sunlight and some activity help reset your body
            clock.
          </li>
          <li style={liStyle}>Avoid further naps and keep caffeine to the morning.</li>
          <li style={liStyle}>
            Wind down in dim light for an hour before your target bedtime and keep the room cool and dark.
          </li>
          <li style={liStyle}>
            If you can't sleep after about 20 minutes, get up, do something quiet in low light, and return to bed
            when sleepy.
          </li>
        </ul>
        <p style={last}>
          Even if tonight is short, you will be sleepier tomorrow night, and a steady wake-up time puts you back on
          track quickly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Sleep Do You Actually Need?</h2>
        <p style={pStyle}>
          Sleep needs vary with age and individual biology, but most adults do best with seven or more hours per
          night. A person who is getting enough sleep should generally be free of daytime sleepiness. The ranges
          below reflect widely used age-based guidance (see the{" "}
          <Ext href="https://www.cdc.gov/sleep/about/index.html">CDC's sleep recommendations</Ext> for the source
          guidelines):
        </p>
        <DataTable headers={["Age group", "Recommended sleep per 24 hours"]} rows={AGE_SLEEP_ROWS} />
        <p style={pStyle}>
          Use these ranges as a starting point, then use the calculator to find a bedtime and wake time that both
          meet your total need and line up with full cycles.
        </p>

        <h3 style={h3Style}>Is it okay to sleep 5 hours?</h3>
        <p style={pStyle}>
          For most adults, regularly sleeping five hours is not enough. It falls below the seven-hour minimum linked
          to better health outcomes, and chronic short sleep is associated with higher risks of weight gain, high
          blood pressure, diabetes, and depression, along with slower reaction times and poorer memory. Some people
          function on less for a while, but they usually underestimate how impaired they are. An occasional
          five-hour night is survivable. A habit is something to fix.
        </p>

        <h3 style={h3Style}>Can you survive on 3 hours of sleep per night for months?</h3>
        <p style={last}>
          Survive, technically, but not safely or well. Three hours is far below the biological need of virtually
          every adult. Over weeks to months, you would expect severe daytime sleepiness, microsleeps (involuntary
          lapses of a few seconds), impaired judgment, mood problems, a weaker immune system, and a significantly
          higher risk of accidents. Rare people carry gene variants that let them feel rested for around six hours,
          but there is no good evidence that anyone thrives on three. If you are only managing a few hours each
          night, treat it as a sign to look for a cause, such as stress, a schedule problem, insomnia, or sleep
          apnea, and talk to a doctor if it continues.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why a Consistent Sleep and Wake-Up Time Matters</h2>
        <p style={pStyle}>
          Your internal clock runs best on regularity. Going to bed and waking at similar times every day helps your
          body release sleep and wake hormones on schedule, which makes you sleepy at bedtime and alert in the
          morning, and makes the calculator's cycle timing more reliable.
        </p>

        <h3 style={h3Style}>Can waking up and sleeping at the same time be healthy for you?</h3>
        <p style={pStyle}>
          Yes. Large observational studies, including analyses of wearable-tracker data from tens of thousands of
          people, have found that a regular sleep schedule is associated with lower risk of early death and of
          cardiovascular and metabolic disease, in some analyses more strongly than the total hours slept. These
          studies show association rather than proof, but the finding fits what we know about circadian biology:
          your body does better when its signals are predictable.
        </p>

        <h3 style={h3Style}>How to sleep on time and wake up on time</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Pick a fixed wake-up time first.</strong> Your wake time anchors your body clock more than your
            bedtime does. Use the calculator to work backward to bedtime.
          </li>
          <li style={liStyle}>
            <strong>Hold it on weekends, within about an hour.</strong> Large weekend shifts create "social jet
            lag."
          </li>
          <li style={liStyle}>
            <strong>Move bedtime gradually.</strong> Shift by 15 to 30 minutes every two or three days.
          </li>
          <li style={liStyle}>
            <strong>Use light as a tool.</strong> Get bright light, ideally sunlight, within an hour of waking, and
            dim the lights in the evening.
          </li>
          <li style={liStyle}>
            Set a "start winding down" alarm, not only a wake-up alarm, about an hour before bed.
          </li>
          <li style={liStyle}>
            Keep your evening cues the same: a similar dinner time, last caffeine cut-off, and wind-down routine.
          </li>
        </ul>

        <h3 style={h3Style}>Sleep hacks for a consistent schedule every day</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Anchor with morning light.</strong> It is the strongest cue for keeping your clock on 24 hours.
          </li>
          <li style={liStyle}>
            <strong>Exercise earlier in the day.</strong> Moderate daily activity improves sleep quality; very
            intense exercise right before bed can make some people feel wired.
          </li>
          <li style={liStyle}>
            <strong>Cool the room.</strong> Most people sleep best at roughly 16 to 19 °C (about 60 to 67 °F).
          </li>
          <li style={liStyle}>
            <strong>Take a warm bath or shower one to two hours before bed.</strong> The post-bath drop in core
            temperature helps trigger sleepiness, and a meta-analysis found it can shorten the time it takes to fall
            asleep.
          </li>
          <li style={liStyle}>
            <strong>Keep your bed for sleep.</strong> Avoid working or scrolling in bed so your brain links bed
            with sleep.
          </li>
          <li style={liStyle}>
            <strong>Use the same short wind-down routine nightly.</strong> Reading, stretching, or quiet breathing
            works well.
          </li>
          <li>
            <strong>Track your pattern for two weeks.</strong> A simple sleep diary shows what truly affects your
            nights.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Fall Asleep Fast</h2>
        <p style={pStyle}>
          Most trouble falling asleep comes down to an alert body or a busy mind at bedtime. These methods address
          both.
        </p>

        <h3 style={h3Style}>What do you do when you can't sleep at night?</h3>
        <p style={pStyle}>
          Stay calm and avoid checking the clock, since clock-watching raises stress and makes it harder to sleep.
          If you are still awake after roughly 20 minutes, get out of bed, go to another room, and do something
          quiet in dim light, such as reading a paper book, gentle stretching, or listening to calm audio. Go back
          when you feel sleepy. This approach, called stimulus control, teaches your brain that bed means sleep.
          Don't reach for your phone, and don't "try harder"; effort works against sleep.
        </p>

        <h3 style={h3Style}>How can I fall asleep fast at night?</h3>
        <p style={pStyle}>
          The most reliable steps are not tricks but habits: a fixed wake-up time, morning light, no caffeine for
          six to eight hours before bed, a cool dark room, screens away for the last hour, and a warm shower one to
          two hours before bed. Slow breathing with a longer exhale than inhale (for example, in for four seconds,
          out for six) lowers arousal and is a gentle tool you can use in bed. Falling asleep in a few minutes is
          not a goal to chase; taking 10 to 20 minutes is normal.
        </p>

        <h3 style={h3Style}>What is the military method to get to sleep in 10 seconds?</h3>
        <p style={pStyle}>
          This technique was popularized by Bud Winter, a sports coach who taught it to Navy pre-flight cadets
          during World War II so pilots could sleep under stress. The steps are:
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            Relax your whole face, including your forehead, jaw, tongue, and the muscles around your eyes.
          </li>
          <li style={liStyle}>
            Drop your shoulders as low as they will go, then relax your upper arms, forearms, and hands, one side at
            a time.
          </li>
          <li style={liStyle}>Breathe out slowly and let your chest relax.</li>
          <li style={liStyle}>Relax your thighs, calves, and feet.</li>
          <li style={liStyle}>
            Clear your mind for about 10 seconds with a calming image, such as lying in a canoe on a calm lake or in
            a black velvet hammock. If thoughts intrude, repeat "don't think" for 10 seconds.
          </li>
        </ol>
        <p style={pStyle}>
          Winter claimed that most cadets mastered it after about six weeks of daily practice. That figure comes from
          his own account rather than controlled research, and nobody falls asleep in 10 seconds on night one. It is
          essentially progressive muscle relaxation plus mental imagery, both of which have genuine support for
          helping people unwind, so it is worth practicing.
        </p>

        <h3 style={h3Style}>What are other military methods for good sleep?</h3>
        <p style={pStyle}>
          Military sleep guidance relies on discipline rather than gimmicks: protect a regular sleep window whenever
          the mission allows, use short "tactical" naps of 20 to 30 minutes to recover alertness, build up extra
          sleep before expected sleep loss (sometimes called sleep banking), keep light low at night, and use
          caffeine strategically instead of constantly. Civilians can borrow all of these.
        </p>

        <h3 style={h3Style}>How can I stop thinking so I can fall asleep?</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Do a brain dump earlier.</strong> Writing a to-do list for tomorrow for about five minutes
            before bed helped people fall asleep faster in one controlled study.
          </li>
          <li style={liStyle}>
            <strong>Schedule worry time earlier in the evening</strong> so problems have somewhere to go.
          </li>
          <li style={liStyle}>
            <strong>Occupy your mind with something neutral.</strong> Picture a calm scene in detail, or silently
            name unrelated objects in a category (for example, animals or kitchen items) one letter at a time.
          </li>
          <li style={liStyle}>
            <strong>Try paradoxical intention.</strong> Lie in bed trying to keep your eyes open gently; the
            pressure to fall asleep fades, and sleep often arrives.
          </li>
          <li>
            <strong>Let thoughts pass.</strong> Treat them like cars driving by rather than something you must
            answer.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Stay Asleep Through the Night</h2>
        <p style={pStyle}>
          Waking briefly once or twice a night is normal, especially near cycle transitions, and most of these
          awakenings are forgotten by morning. It becomes a problem when you are awake for long stretches or feel
          unrefreshed.
        </p>

        <h3 style={h3Style}>How can I sleep without waking up in the middle of the night?</h3>
        <p style={pStyle}>
          Address the most common triggers: alcohol (it helps you fall asleep but fragments the second half of the
          night), late caffeine, heavy late meals, a warm or noisy bedroom, large evening drinks that send you to the
          bathroom, and unmanaged stress. A cool, dark, quiet room and a regular schedule help most. If you snore
          loudly, gasp, or wake with a dry mouth or headache, ask a doctor about sleep apnea, a common and treatable
          cause of broken sleep. Hormonal changes such as perimenopause can also cause night waking, which a doctor
          can help with.
        </p>

        <h3 style={h3Style}>What's the best way to get back to sleep after waking up?</h3>
        <p style={pStyle}>
          Keep the lights low, don't look at the time, and avoid screens. Try slow breathing or a body scan from
          head to toe. If 20 minutes pass, get up and do something dull in dim light until you feel drowsy. Then use
          the calculator trick above: count forward in 90-minute steps from when you drift back off and set your
          alarm accordingly, so you can stop doing the math in the dark.
        </p>

        <h3 style={h3Style}>Why am I waking up in the middle of the night when I go to bed early?</h3>
        <p style={pStyle}>
          If you go to bed before you are sleepy, your sleep pressure is still low and your body clock hasn't
          reached its sleep window, so you may get a first block of deep sleep and then wake wide awake. An early
          bedtime also lengthens the time you spend in lighter, more easily disrupted sleep later in the night. To
          fix it:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Go to bed when you feel sleepy, then move bedtime earlier by 15 minutes every few days.
          </li>
          <li style={liStyle}>Keep your wake-up time fixed, as it is the strongest anchor.</li>
          <li style={liStyle}>Get bright light in the morning and avoid naps late in the day.</li>
          <li style={liStyle}>Limit alcohol and caffeine, and keep the room cool and dark.</li>
        </ul>

        <h3 style={h3Style}>Why can't I sleep longer than six hours without waking up?</h3>
        <p style={pStyle}>
          Common reasons include a body clock that has shifted earlier (typical with age), stress and anxiety
          (which can raise morning cortisol), alcohol, light in the bedroom, sleep apnea, pain, and depression. Some
          people also simply need around six hours. If you wake rested and alert, six hours may be enough for you.
          If you are tired, anxious, or low in mood during the day, or the problem lasts more than a few weeks, speak
          to a doctor. Meanwhile, use a consistent bedtime, keep evening light low, and avoid checking the clock when
          you wake.
        </p>

        <h3 style={h3Style}>How can I fall asleep fast and stay asleep?</h3>
        <p style={last}>
          Combine the two sets of habits: a stable schedule, morning light, a cool dark room, no late caffeine,
          little or no evening alcohol, a warm shower before bed, and a calming wind-down routine. Treat any
          persistent trouble that lasts three months or more as a medical issue, not a habit problem, and talk to
          your doctor.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Insomnia: What Actually Works</h2>
        <p style={pStyle}>
          Insomnia means trouble falling asleep, staying asleep, or waking too early, despite having the opportunity
          to sleep, along with daytime problems. It is considered chronic when it happens at least three nights a
          week for three months or longer.
        </p>

        <h3 style={h3Style}>What are the best sleep hacks for chronic insomnia?</h3>
        <p style={pStyle}>
          The best-supported treatment is cognitive behavioral therapy for insomnia (CBT-I), which major medical
          guidelines recommend as the first-line approach, ahead of sleeping pills. It is typically delivered by a
          therapist, a program, or an app, and it combines:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Sleep restriction:</strong> limiting time in bed to roughly the time you actually sleep, then
            slowly extending it, which builds sleep pressure.
          </li>
          <li style={liStyle}>
            <strong>Stimulus control:</strong> using the bed only for sleep, and getting up when awake for about 20
            minutes.
          </li>
          <li style={liStyle}>
            <strong>Fixed wake-up time,</strong> seven days a week.
          </li>
          <li style={liStyle}>
            <strong>Cognitive work:</strong> challenging unhelpful beliefs such as "I must get eight hours or
            tomorrow is ruined."
          </li>
          <li style={liStyle}>
            <strong>Relaxation training:</strong> breathing, muscle relaxation, or imagery.
          </li>
        </ul>
        <p style={pStyle}>
          Because sleep restriction can cause temporary sleepiness, it should be done carefully, ideally with
          professional guidance. See a doctor if insomnia is long-lasting, if you suspect sleep apnea or restless
          legs, or if you feel persistently low or anxious.
        </p>

        <h3 style={h3Style}>What are some tricks to sleep despite insomnia?</h3>
        <p style={last}>
          On bad nights, lower the pressure. Rest quietly even if you aren't asleep, since lying calmly still
          provides some recovery. Don't cancel your morning routine or sleep in to "catch up," as that deepens the
          cycle. Keep your wake-up time, get morning light, move your body during the day, and avoid long daytime
          naps. Remind yourself that one poor night rarely harms your health, and that worry about sleep is itself a
          major cause of sleeplessness. Supplements such as melatonin may help in specific situations like jet lag,
          but they are not a long-term fix for chronic insomnia, so speak with a doctor or pharmacist before using
          them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Waking Up Early: Habits, Benefits, and Natural Waking</h2>

        <h3 style={firstH3}>How can I make a habit of waking up early?</h3>
        <p style={pStyle}>
          Start small and be patient. Move your wake-up time earlier by 15 minutes every few days, and move bedtime
          earlier at the same pace. Place your alarm across the room, open the curtains or turn on a bright light
          immediately, drink water, and plan something you look forward to for the first 30 minutes. Keep the same
          wake time on weekends. Within two to four weeks, your body clock usually shifts, though night owls with a
          strongly late chronotype may find it harder and may need more light exposure and more patience.
        </p>

        <h3 style={h3Style}>How has waking up early improved people's lives?</h3>
        <p style={pStyle}>
          People who switch to early rising often report more time for exercise, quiet focus, and unhurried
          mornings. There is also research pointing to a link between earlier sleep timing and better mood: one
          large genetic analysis found that sleeping about an hour earlier was associated with a noticeably lower
          risk of depression. Importantly, these benefits seem to come from regular, adequate sleep aligned with
          daylight, not from cutting sleep short. Waking up at 5:00 AM on five hours of sleep is not a health
          upgrade.
        </p>

        <h3 style={h3Style}>Why is waking up early so difficult, and how can you wake up easily?</h3>
        <p style={pStyle}>
          The usual causes are too little sleep, a late bedtime, a late chronotype, evening light exposure, and the
          sleep inertia that follows being woken from deep sleep. To make it easier:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Go to bed earlier using the calculator so the alarm lands near a cycle boundary.</li>
          <li style={liStyle}>Use a sunrise-simulating light or open the curtains.</li>
          <li style={liStyle}>Put the alarm out of reach and get up as soon as it rings.</li>
          <li style={liStyle}>Drink water and get light and movement quickly.</li>
          <li style={liStyle}>
            <strong>Avoid snooze:</strong> fragmented extra sleep isn't restorative and prolongs grogginess.
          </li>
          <li style={liStyle}>Keep caffeine for at least 60 to 90 minutes after waking, if you use it.</li>
        </ul>

        <h3 style={h3Style}>Does waking up naturally mean you got enough sleep?</h3>
        <p style={pStyle}>
          Not always. Waking naturally without an alarm is a good sign if you wake refreshed and stay alert all day.
          But some people wake early because of stress, depression, sleep apnea, alcohol, or an advanced body clock,
          and they are still sleep-deprived. Others sleep through a ringing alarm because they are chronically short
          on sleep. The best test is how you feel in the afternoon: if you are alert without relying on caffeine, you
          are likely getting enough.
        </p>

        <h3 style={h3Style}>What causes the body to wake up on its own?</h3>
        <p style={pStyle}>
          Several processes line up in the early morning: your body clock lowers melatonin and raises cortisol, your
          core temperature starts to rise, the sleep pressure that built up during the day has been largely cleared,
          and sleep gets lighter and more REM-rich. Light, noise, and a full bladder can tip you over. The brain can
          even anticipate a planned wake-up time, with cortisol rising shortly before the expected hour, which is why
          you sometimes wake just before an alarm.
        </p>

        <h3 style={h3Style}>How is waking naturally different from waking with an alarm or splashed water?</h3>
        <p style={last}>
          Natural waking is gradual. Hormones, temperature, and brain activity rise together over a period of time.
          An alarm produces an abrupt arousal, often out of deep sleep, which can cause heavier sleep inertia and a
          short spike in heart rate and blood pressure. Gentler alarms (rising volume, sunrise lights) and
          cycle-aligned timing soften this. Splashing water is simply a strong sensory shock that wakes you faster,
          but it doesn't improve sleep quality, and there is no good evidence that it helps your body wake up more
          healthily. Cool water on the face after you are already awake can feel refreshing and is harmless.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Science of Sleep Timing</h2>

        <h3 style={firstH3}>What happens inside a sleep cycle: REM and non-REM sleep</h3>
        <p style={pStyle}>
          Each cycle has two types of sleep. Non-REM sleep comes first and moves from light stages into deep,
          slow-wave sleep. During deep sleep, heart rate, breathing, and body temperature fall, brain activity slows,
          and the body focuses on physical repair, including growth hormone release and tissue recovery. REM sleep
          follows: the brain becomes very active, most vivid dreaming happens, and the body is largely paralyzed.
          REM supports memory, learning, and emotional processing. Early cycles contain more deep sleep, and later
          cycles contain progressively more REM, which is why cutting a night short at the end costs you the most
          REM. If REM is repeatedly cut short, the body tends to make up for it later with a rebound of REM sleep.
        </p>

        <h3 style={h3Style}>Your body's internal clock: circadian rhythm</h3>
        <p style={pStyle}>
          The circadian rhythm is a roughly 24-hour internal clock, run by a small region of the brain called the
          suprachiasmatic nucleus. It synchronizes with daylight and darkness and keeps ticking even without outside
          cues. When it falls out of sync with the environment, as in jet lag, you feel sleepy, alert, or hungry at
          the wrong times. Evening light, irregular schedules, naps, shift work, and individual genetics all
          influence it, which explains why two people with the same bedtime can feel very differently rested.
        </p>

        <h3 style={h3Style}>Does the human body have a natural timing for sleep and wake-up?</h3>
        <p style={pStyle}>
          Yes, but it varies by person. Your chronotype, whether you naturally lean "lark" or "owl," is partly
          genetic. Teenagers' clocks shift later at puberty, and older adults' clocks tend to shift earlier. Most
          adults have a natural sleep window somewhere between about 10:00 PM and 1:00 AM, with a wake time between
          about 6:00 and 9:00 AM, and a natural dip in alertness in the early afternoon.
        </p>

        <h3 style={h3Style}>How can I estimate my best sleep and wake-up times and my circadian cycle length?</h3>
        <p style={pStyle}>
          In humans, the average internal clock runs slightly longer than 24 hours (about 24.2 hours in classic
          studies), and it is reset to 24 hours daily by light. Measuring your own precisely requires a lab, but you
          can find your natural timing at home:
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            For one to two weeks, such as during a holiday, go to bed when sleepy and wake without an alarm.
          </li>
          <li style={liStyle}>Record when you fall asleep and wake each day.</li>
          <li style={liStyle}>
            Find the midpoint of your sleep on days free of obligations. This is a good estimate of your chronotype.
          </li>
          <li style={liStyle}>
            Use the calculator to build a schedule near your natural window that also fits your obligations, and
            adjust by 10 to 15 minutes until you feel best.
          </li>
        </ol>
        <p style={pStyle}>
          Validated questionnaires such as the Munich Chronotype Questionnaire can help, and a doctor can arrange
          formal testing if you suspect a circadian disorder.
        </p>

        <h3 style={h3Style}>What does it mean that individual cortical columns in the brain go to sleep and wake up at different times?</h3>
        <p style={pStyle}>
          Sleep researchers have found that sleep isn't always an all-or-nothing state of the whole brain. Small
          groups of neurons called cortical columns can show sleep-like activity while the rest of the brain, and the
          animal itself, is awake, particularly after long wakefulness or heavy use of that region. This "local
          sleep" idea helps explain mental lapses and clumsy errors when you are sleep-deprived, and why sleepwalking
          and similar states can blend waking behavior with sleeping brain activity. Evidence mostly comes from
          animal studies and some human recordings, so it is an active area of research.
        </p>

        <h3 style={h3Style}>Does our brain recreate who we are every time we sleep and wake up?</h3>
        <p style={pStyle}>
          No. Your sense of self is carried by stable memories, learned habits, and brain connectivity that persist
          through the night. What sleep does is maintain and refine them: it consolidates new memories, trims weaker
          synaptic connections, and clears metabolic waste. You wake up as the same person, with a better-organized
          memory, not a rebuilt one. "Resetting" is a useful metaphor, not a literal description.
        </p>

        <h3 style={h3Style}>What is the best time to sleep and wake up in winter?</h3>
        <p style={pStyle}>
          There is no special winter bedtime, but shorter days and later sunrises can make mornings harder and extend
          melatonin release. Keep your wake-up time regular, get outdoors in the morning light, even on cloudy days,
          exercise during daylight hours, and avoid sleeping in. Some people sleep a little longer in winter, which
          is fine if you feel good. If you experience low mood, low energy, and oversleeping that returns each
          winter, ask a doctor about seasonal affective disorder, for which light therapy is a standard treatment.
        </p>

        <h3 style={h3Style}>What is the best time to sleep and wake up according to science?</h3>
        <p style={last}>
          The answer science offers is a pattern, not one clock time: sleep when your body is naturally sleepy,
          usually between about 10:00 PM and midnight for most adults. Get seven to nine hours, wake at the same time
          every day, and be exposed to bright light after waking. Aligning your timing with your chronotype and with
          full 90-minute cycles gives the best chance of waking refreshed.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Best Sleep and Wake-Up Times by Age and Lifestyle</h2>

        <h3 style={firstH3}>What is the best time to go to bed and get up for children, young adults, and older people?</h3>
        <p style={pStyle}>The right time depends on age and on your natural clock, but these are sensible targets:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Children (6–12):</strong> 9 to 12 hours. A bedtime around 8:00 to 9:00 PM and a wake time
            around 6:30 to 7:30 AM suits most school-age kids.
          </li>
          <li style={liStyle}>
            <strong>Teens (13–18):</strong> 8 to 10 hours. Their body clocks naturally shift later, so asking for a
            10:00 PM bedtime and a 6:00 AM wake-up is a recipe for chronic sleep loss.
          </li>
          <li style={liStyle}>
            <strong>Young adults (18–25) and adults:</strong> 7 to 9 hours. Bedtimes between about 10:00 PM and
            midnight, with a consistent wake-up time, work for most.
          </li>
          <li style={liStyle}>
            <strong>Older adults (65+):</strong> 7 to 8 hours. Clocks tend to shift earlier, so earlier bedtimes
            feel natural, and a daytime nap should be short (20 to 30 minutes) and early in the afternoon so it
            doesn't steal nighttime sleep.
          </li>
        </ul>

        <h3 style={h3Style}>What time do most teens sleep and wake up on weekends?</h3>
        <p style={pStyle}>
          Surveys consistently show that teenagers go to bed later and sleep in far later on weekends, often falling
          asleep after midnight and waking around 10:00 AM or later. That swing is a form of social jet lag: it
          pushes the body clock later, which makes Sunday night and Monday morning harder. Pediatric groups recommend
          later school start times for this reason. A good compromise for teens is to keep weekend wake-up times
          within about one to two hours of school-day wake-ups.
        </p>

        <h3 style={h3Style}>Should babies be on a schedule of sleeping and waking times?</h3>
        <p style={pStyle}>
          Not strictly at first. Newborns have no day-night rhythm and need to feed every few hours, so follow their
          cues. Their body clocks begin to mature at around two to four months, and by about four to six months most
          babies benefit from a consistent bedtime routine (bath, feed, lullaby, bed), regular nap windows, and
          daytime light and nighttime dark. Follow safe-sleep guidance: place babies on their backs on a firm, flat
          surface. Talk to a pediatrician if you are unsure about your child's needs.
        </p>

        <h3 style={h3Style}>What is the perfect time to sleep and wake up for high school, college, and university students?</h3>
        <p style={pStyle}>
          There is no single perfect time, but high school students should aim for 8 to 10 hours (for example, 10:30
          PM to 6:30 AM at the earliest wake-up time), and college students for 7 to 9 hours. Wake at a consistent
          time even on days without class, avoid all-nighters, and put caffeine and screens away well before bed.
          Students tend to be chronic sleep-deprived, so treat sleep as part of studying, not a cost to it.
        </p>

        <h3 style={h3Style}>What time do medical students usually sleep and wake up?</h3>
        <p style={pStyle}>
          There is no standard schedule. Surveys of medical students in many countries report average sleep of
          roughly six to seven hours, with late bedtimes (often after midnight) and early wake-ups driven by
          lectures, clinical rotations, and night duties. Shorter and more irregular sleep is associated with poorer
          concentration, higher stress, and a higher risk of burnout, so the recommendations are the same as for
          other adults: protect seven or more hours and keep timing as regular as possible, using strategic 20-minute
          naps during long shifts.
        </p>

        <h3 style={h3Style}>What is the best time to sleep and wake up for a student preparing for a competitive exam?</h3>
        <p style={pStyle}>
          Sleep consolidates what you learn, so cutting it short for extra study hours usually backfires. A
          practical plan: fix your wake-up time (for instance, 5:30 or 6:00 AM), count backward to a bedtime that
          gives 7 to 8 hours (around 10:00 to 10:30 PM), study your hardest material when you are most alert, review
          key notes in the evening, and stop studying about an hour before bed. In the final week, keep your schedule
          the same so your body clock peaks at exam time, and don't pull an all-nighter the night before.
        </p>

        <h3 style={h3Style}>What is the best time to sleep and wake up for weight loss?</h3>
        <p style={pStyle}>
          There is no magic bedtime for weight loss, but sleep affects it. Short sleep is associated with higher
          hunger hormones, stronger cravings, lower activity, and higher calorie intake. Aim for 7 to 9 hours, keep a
          regular schedule, and finish your last substantial meal two to three hours before bed. Eating later in the
          evening and a late body clock are both associated with weight gain, so shifting earlier in a healthy way
          can help.
        </p>

        <h3 style={h3Style}>How can I balance part-time work, studies, free time, sleep, and an early wake-up?</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Schedule sleep first.</strong> Decide your wake-up time, use the calculator to find your
            bedtime, and block it on your calendar like an appointment.
          </li>
          <li style={liStyle}>
            <strong>Time-block the rest of the day.</strong> Put study or work in the hours when you are most alert
            and flexible on tasks in your dips.
          </li>
          <li style={liStyle}>
            <strong>Protect one weekly block of free time</strong> so you don't trade sleep for leisure.
          </li>
          <li style={liStyle}>
            <strong>Use gaps well.</strong> Brief study sessions during commutes and breaks free up evenings.
          </li>
          <li>
            <strong>Cut what you can.</strong> If you consistently get under seven hours, remove or reduce a
            commitment instead of squeezing out sleep.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sleep Paralysis: What It Is and What to Do</h2>
        <p style={pStyle}>
          Sleep paralysis happens when you become aware while your body is still in REM-sleep muscle paralysis. You
          can't move or speak for seconds to a couple of minutes, and you may sense a presence, pressure on your
          chest, or see vivid images. It is frightening but generally harmless, and roughly one in five people
          experience it at least once.
        </p>

        <h3 style={h3Style}>What happens if you wake someone who is experiencing sleep paralysis?</h3>
        <p style={pStyle}>
          Waking them is generally safe and often helps, since a touch or a calm voice can break the episode.
          Approach gently: say their name in a soft voice or touch their shoulder rather than shaking or shouting,
          because they will be frightened and disoriented. Reassure them that they are safe and that it will pass.
          They may be confused afterwards, so stay with them for a moment.
        </p>

        <h3 style={h3Style}>How do I avoid sleep paralysis, and how do I end an episode sooner?</h3>
        <p style={pStyle}>
          Episodes are more likely with sleep deprivation, irregular schedules, high stress, sleeping on your back,
          and sleep disorders such as narcolepsy. To reduce them, get enough sleep on a regular schedule, manage
          stress, limit alcohol, and try sleeping on your side. If you wake in an episode:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>Stay calm and remind yourself that it is a known, temporary condition.</li>
          <li style={liStyle}>Breathe slowly and steadily.</li>
          <li style={liStyle}>
            Try to move something small, such as your toes, fingers, or facial muscles. Even a small movement can
            break the paralysis.
          </li>
          <li style={liStyle}>Don't struggle against the whole body; that often increases fear.</li>
          <li>
            See a doctor if episodes are frequent, cause distress, or come with extreme daytime sleepiness.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sleep Around the World and Through History</h2>

        <h3 style={firstH3}>At what time do most people go to sleep and wake up?</h3>
        <p style={pStyle}>
          Across surveys in many countries, the typical adult goes to bed between about 10:00 PM and midnight and
          wakes between about 6:00 and 7:30 AM on workdays, later on days off. Averages differ by country, culture,
          and work hours: smartphone-based data from large samples found that people in some places, such as the
          Netherlands, slept longer on average, while people in places such as Japan and Singapore reported fewer
          hours. Late dinners, long commutes, and work culture all push bedtimes later. These are averages. The
          number that matters is your own need.
        </p>

        <h3 style={h3Style}>What would happen if everyone around the world slept and woke at the same time?</h3>
        <p style={pStyle}>
          It couldn't work without major disruption. Half the planet would be asleep in daylight and the other half
          in darkness, so a worldwide sleep window would put billions of people at odds with their body clocks and
          make the circadian mismatch of jet lag permanent for many. Emergency services, hospitals, transportation,
          power plants, and communications would all go unstaffed at once. Human societies work precisely because
          sleep is staggered around the clock.
        </p>

        <h3 style={h3Style}>Did the ancient Romans have fixed sleeping and waking times?</h3>
        <p style={pStyle}>
          Not in the clock sense, because they had none. Romans tied their days to daylight, dividing day and night
          into twelve "hours" that stretched and shrank with the seasons, and they split the night into watches.
          Many people rose around dawn, and wealthy households started the day early with visits and business. A
          midday rest (the meridiatio, the root of "siesta") was common. Historians also describe "segmented" sleep
          in pre-industrial Europe: a first sleep, a quiet hour or two awake, then a second sleep.
        </p>

        <h3 style={h3Style}>Is it bad to sleep and wake up multiple times?</h3>
        <p style={pStyle}>
          Not if it is brief and you can fall asleep again. Brief awakenings between cycles are normal, and cultures
          with a midday siesta or a two-part night sleep have been healthy for centuries. What matters is total sleep
          over 24 hours, regularity, and how you feel. Frequent, long awakenings that leave you tired are a sign to
          look into causes such as stress, alcohol, apnea, or insomnia.
        </p>

        <h3 style={h3Style}>Does polyphasic sleeping get easier, especially the wake-up time?</h3>
        <p style={pStyle}>
          Extreme polyphasic schedules, such as multiple 20-minute naps adding up to two or three hours a day, are not
          supported by good evidence. Most people who try them experience deep sleep deprivation, poorer memory and
          attention, and unsafe sleepiness, and most return to normal sleep within weeks. Adapting does not change the
          biology of needing roughly seven to nine hours. Biphasic patterns, a night sleep plus an early-afternoon
          nap, are far more natural and well supported.
        </p>

        <h3 style={h3Style}>What were the sleeping and waking times of Mahatma Gandhi and other leaders?</h3>
        <p style={pStyle}>
          Daily routines are usually reported in biographies and are not precise records, but the patterns are
          interesting:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Mahatma Gandhi:</strong> In his ashram routine he is described as rising around 4:00 AM for
            prayer and going to bed around 9:00 or 10:00 PM, which gives about six to seven hours and often a short
            rest in the day.
          </li>
          <li style={liStyle}>
            <strong>Winston Churchill:</strong> Famously worked late into the night but took a regular afternoon
            nap, effectively sleeping in two blocks.
          </li>
          <li style={liStyle}>
            <strong>Benjamin Franklin:</strong> Promoted the maxim about early to bed and early to rise, though he
            also admitted to varying habits.
          </li>
          <li style={liStyle}>
            <strong>Margaret Thatcher and Napoleon:</strong> Often said to have slept only four hours or less,
            claims that are widely repeated but not well documented. Modern research suggests that very short
            sleepers are rare.
          </li>
        </ul>
        <p style={pStyle}>
          The lesson is that disciplined routines matter, while the idea of thriving on very little sleep is best
          treated with caution.
        </p>

        <h3 style={h3Style}>What were the sleeping and wake-up patterns of Prophet Muhammad (peace be upon him), as mentioned by Aisha (may Allah be pleased with her)?</h3>
        <p style={last}>
          Narrations attributed to Aisha (may Allah be pleased with her), found in the major hadith collections,
          describe a rhythm of early rest and pre-dawn worship. The Prophet (peace be upon him) would sleep early
          after the Isha prayer, disliking sleeping before it and idle talk after it, and would wake in the last part
          of the night to pray. She also reported that he would sometimes lie down briefly again before the Fajr call
          to prayer. In addition, he encouraged a short midday rest (qaylulah) to help with night prayer. The
          narrations don't give exact clock times, so any specific hour you see online is an estimate. Taken
          together, the pattern is a biphasic day (night sleep plus a midday nap), a consistent evening routine, and
          waking before dawn, much like the early-to-bed, early-to-rise rhythm that circadian science supports. For
          religious questions about the exact narrations, consult a qualified scholar or a reliable hadith source.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens When You Don't Get Enough Sleep</h2>
        <p style={pStyle}>
          Skipping sleep, or often waking mid-cycle, doesn't just make you tired. In the short term, poor sleep leads
          to low energy, excessive daytime sleepiness, difficulty concentrating, slower reaction times (raising the
          risk of accidents, especially when driving), irritability, and weaker memory, decision-making, and
          problem-solving.
        </p>
        <p style={last}>
          Physically, insufficient sleep can weaken the immune system and reduce coordination and performance. Over
          the long term, chronic sleep loss is associated with weight gain, higher diabetes risk, cardiovascular
          problems, anxiety and depression, chronic pain, and hormonal imbalance. If you often fall asleep while
          driving or in meetings, don't wait: talk to a doctor.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What "Good" Sleep Quality Means</h2>
        <p style={last}>
          Sleep quality is more than hours. It includes how easily you fall asleep (ideally within 30 minutes), how
          often and how long you wake in the night, and how rested you feel in the morning. Frequent interruptions
          disrupt the normal progression through sleep stages, which is why a broken eight hours can feel worse than
          an uninterrupted six or seven. Timing counts too. Melatonin should peak, and your core temperature should
          reach its lowest point, in the second half of the night, before you wake, and a consistent, cycle-aligned
          schedule helps keep that pattern on track.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When to Use a Sleep Calculator</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Setting an alarm for an early commitment:</strong> work backward from your wake-up time to avoid
            a mid-cycle alarm.
          </li>
          <li style={liStyle}>
            <strong>Planning a short night:</strong> if you only have five or six hours, pick the closest
            cycle-aligned option instead of a random time.
          </li>
          <li style={liStyle}>
            <strong>Recovering from jet lag or shift changes:</strong> re-anchor your sleep around complete cycles as
            you adapt.
          </li>
          <li style={liStyle}>
            <strong>Building a routine:</strong> find a bedtime and wake time pair that fits full cycles and repeat
            it.
          </li>
          <li style={liStyle}>
            <strong>New parents and irregular sleepers:</strong> choose nap or rest windows that end in lighter
            sleep.
          </li>
          <li style={liStyle}>
            <strong>Students and night-shift workers:</strong> apply the same 90-minute logic to daytime or split
            sleep.
          </li>
          <li>
            <strong>Naps:</strong> short naps of 20 to 30 minutes avoid deep sleep, while a nap of about 90 minutes
            completes a full cycle and often reduces grogginess.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips to Get the Most Out of Your Sleep Schedule</h2>

        <h3 style={firstH3}>What are the best sleep hacks and tips overall?</h3>
        <p style={pStyle}>
          The calculator gives you timing, but these habits help you hit the target consistently. The ones with the
          strongest evidence come first.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Keep a consistent schedule,</strong> including weekends.
          </li>
          <li style={liStyle}>
            <strong>Get morning light and dim evenings</strong> to keep your body clock on time.
          </li>
          <li style={liStyle}>
            <strong>Watch caffeine.</strong> Stop it six to eight hours before bed.
          </li>
          <li style={liStyle}>
            <strong>Go easy on alcohol.</strong> It may make you drowsy but fragments sleep and reduces REM.
          </li>
          <li style={liStyle}>
            <strong>Put screens away in the hour before bed.</strong> The light, and the stimulation, can delay
            sleep.
          </li>
          <li style={liStyle}>
            <strong>Build a wind-down routine</strong> with reading, stretching, journaling, or quiet breathing.
          </li>
          <li style={liStyle}>
            <strong>Move your body.</strong> Even a 30-minute daily walk improves sleep quality.
          </li>
          <li style={liStyle}>
            <strong>Optimize your bedroom:</strong> cool, dark, quiet, with a supportive mattress.
          </li>
          <li style={liStyle}>
            <strong>Skip gimmicks.</strong> Heavily marketed sleep products rarely beat the basics above.
          </li>
        </ul>

        <h3 style={h3Style}>What are the key things about sleep and wake-up timing for a healthy lifestyle?</h3>
        <p style={last}>
          In short: sleep long enough for your age, keep your times regular, get light in the morning and darkness
          at night, protect your bedroom for sleep, and ask for help when problems persist. The calculator makes the
          timing easy, and these habits make it stick.
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

      <div className="card" style={cardStyle}>
        <p style={last}>
          <strong>Disclaimer:</strong> This page is for general information and does not replace medical advice. If
          you have persistent sleep problems, loud snoring, gasping at night, or severe daytime sleepiness, see a
          healthcare professional.
        </p>
      </div>
    </div>
  );
}
