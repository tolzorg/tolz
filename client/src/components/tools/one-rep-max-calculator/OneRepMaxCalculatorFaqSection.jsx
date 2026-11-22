import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a one rep max calculator?",
    a: "A one rep max calculator estimates the heaviest weight you could lift for one repetition, based on a lighter set you have already completed. You enter the weight and reps, and a formula projects your 1RM.",
  },
  {
    q: "How do I calculate my one rep max?",
    a: "Enter the weight lifted and the number of reps performed into the calculator, then choose a formula. To do it by hand with Epley, multiply the weight by (1 + reps ÷ 30). For example, 80 kg for 8 reps gives about 101 kg.",
  },
  {
    q: "Which 1RM formula is most accurate?",
    a: "No formula is best for everyone. Brzycki is often preferred for sets of 5 reps or fewer, Epley works well across a broad range, and Lombardi follows a different curve that some lifters find fits them better. Comparing all three gives you a realistic range.",
  },
  {
    q: "How many reps should I use to estimate my 1RM?",
    a: "Sets of 2 to 10 reps give the most reliable estimates, and 3 to 6 reps is a sweet spot for many lifters. Estimates based on 15 or more reps are less dependable.",
  },
  {
    q: "Is a calculated 1RM the same as my true max?",
    a: "Not exactly. It is a prediction based on a submaximal set. Your actual max on a given day can be higher or lower depending on technique, fatigue, recovery and the lift itself.",
  },
  {
    q: "Can I use this calculator for any lift?",
    a: "Yes. The formulas work for any exercise, but they are most accurate for compound barbell lifts like the bench press, squat, deadlift and overhead press. Results for machines like the leg press are fine for tracking your own progress but shouldn’t be compared with other lifts.",
  },
  {
    q: "What percentage of my 1RM should I train at?",
    a: "It depends on your goal. Strength work is often done at about 80% to 95% for low reps, muscle growth at about 65% to 80% for moderate reps, and technique or recovery work below 65%.",
  },
  {
    q: "How long should I rest between one rep max attempts?",
    a: "Rest 3 to 5 minutes between heavy attempts. Shorter rests can cause you to miss lifts you could otherwise complete.",
  },
  {
    q: "How often should I test my one rep max?",
    a: "A true max is best saved for a few times a year or the end of a training block. You can recalculate an estimated 1RM every 4 to 8 weeks from a regular heavy set.",
  },
  {
    q: "Does this tool show weights for different reps and percentages?",
    a: "Yes. Besides your estimated 1RM, it shows weights for 1 to 20 reps and for 50% to 100% of your max.",
  },
  {
    q: "Can I use pounds or kilograms?",
    a: "Yes, the calculator works with either unit.",
  },
  {
    q: "Is the one rep max calculator free, and do I need to sign up?",
    a: "It is free, and no signup is required.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
};

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

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

export default function OneRepMaxCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: straight(item.q),
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is One Rep Max?">
        <P>
          Your one rep max, usually written as 1RM, is the most weight you can lift for a single repetition of an exercise with correct
          form. It is a measure of maximal strength for one specific lift. Your bench press 1RM and your squat 1RM are two separate
          numbers, and one does not tell you much about the other.
        </P>
        <P>
          Lifters care about it because most training plans are written in percentages. A program that calls for 5 sets of 5 at 80% only
          works if you know what 100% is. Your 1RM turns a vague plan into exact loads. It also gives you a clean way to track progress. If
          your estimated bench press 1RM climbs from 80 kg to 90 kg over a training block, you have a concrete number showing that you got
          stronger.
        </P>
        <P>
          The word “correct form” matters here. A rep that is cut short, bounced, or helped by a spotter does not count toward your max. A
          true 1RM is a clean, controlled rep that meets the standard of the lift.
        </P>
      </Card>

      <Card title="How to Use the One Rep Max Calculator">
        <P>Using the tool takes less than a minute:</P>
        <List ordered items={[
          ["", "Enter the weight you lifted, in kilograms or pounds."],
          ["", "Enter the number of reps you completed with that weight."],
          ["", "Select a formula: Epley, Brzycki or Lombardi."],
        ]} />
        <P>
          The calculator then returns your estimated 1RM along with two reference tables. The first shows the weight you should be able to
          lift for every rep count from 1 to 20. The second shows the weight at each percentage of your 1RM from 50% to 100%.
        </P>
        <P>
          For the most dependable result, use a set you actually performed instead of a guess. Count only the reps you finished with good
          form. A set padded with sloppy reps will inflate your estimate and send you into workouts that are too heavy. Sets of 2 to 10 reps
          work best, and a heavy set of 3 to 6 reps is the sweet spot for most people.
        </P>
      </Card>

      <Card title="How to Determine Your One Rep Max for Specific Lifts">
        <P>
          There are two ways to find your 1RM for a given exercise: test it directly, or estimate it from a lighter set. Each has its place,
          and the right choice depends on your experience and your goal.
        </P>
        <H3>Estimating Your 1RM With a Calculator</H3>
        <P>
          Estimating is the safer and faster method. Pick a weight you think you can lift for about 3 to 10 reps, do one set to the point
          where you can’t complete another clean rep, and enter the weight and reps into the calculator. Don’t count a failed rep. Count
          only the reps you finished with good form.
        </P>
        <P>
          How you choose the weight makes a difference. If you get to 9 or 10 reps with room to spare, rest and try a heavier weight. Fewer
          reps means a more accurate estimate, because the formula has less distance to cover between your set and a single rep. If your
          first guess turns out too light, there is no harm in stopping, resting a few minutes and moving up. If it turns out too heavy and
          you only get 1 or 2 reps, you can still enter that set, but a slightly lighter weight that lets you get 3 to 5 reps usually gives
          a steadier number.
        </P>
        <P>
          Estimating also works for people who can’t or shouldn’t max out. That includes beginners still learning technique, people
          returning from a layoff, and anyone with a physical limitation. You get a useful training number without ever putting a
          near-limit weight on your back or over your chest.
        </P>
        <H3>Testing Your 1RM Directly</H3>
        <P>
          A direct test means working up in weight until you reach the heaviest single you can complete with good form. It is the most
          straightforward method, and it is generally more accurate than an estimate. It is also harder on your body and takes longer. The
          usual process looks like this:
        </P>
        <List ordered items={[
          ["", "Warm up the muscles you will use."],
          ["", "Set up safely, with a spotter and safety bars if the lift calls for them."],
          ["", "Start with a weight you could lift for about 5 to 10 reps."],
          ["", "Rest 2 to 5 minutes between attempts."],
          ["", "Add weight each round, using smaller jumps as the bar gets heavier."],
          ["", "Stop when you can only complete one clean rep, and record that weight."],
        ]} />
        <P>
          If your form breaks down, the attempt doesn’t count. You may be able to move more weight with sloppy technique, but that number
          isn’t a real 1RM, and it is how most max-day injuries happen. Beginners are usually better off estimating and putting their time
          into learning the lift.
        </P>
      </Card>

      <Card title="One Rep Max Formulas: Epley, Brzycki and Lombardi Explained">
        <P>
          No single equation predicts every lifter perfectly, so the calculator lets you choose among three well-established 1RM formulas.
          They give similar answers at moderate rep counts and drift apart as reps climb.
        </P>
        <H3>Epley Formula</H3>
        <P>The Epley formula multiplies your weight by one plus the reps divided by 30:</P>
        <Formula>1RM = weight × (1 + reps ÷ 30)</Formula>
        <P>
          It is one of the most widely used equations and tends to give slightly higher estimates than Brzycki at higher rep counts. For a
          set of 100 kg for 5 reps, it returns about 116.7 kg.
        </P>
        <H3>Brzycki Formula</H3>
        <P>The Brzycki formula multiplies the weight by 36 and divides by 37 minus the reps:</P>
        <Formula>1RM = weight × 36 ÷ (37 − reps)</Formula>
        <P>
          It is popular in strength and conditioning circles and works best at lower reps. The same 100 kg for 5 reps gives roughly 112.5
          kg. Because the bottom number shrinks as reps go up, Brzycki gets unreliable above 12 to 15 reps and breaks down completely at 37.
        </P>
        <H3>Lombardi Formula</H3>
        <P>The Lombardi formula raises the number of reps to the power of 0.10 and multiplies by the weight:</P>
        <Formula>1RM = weight × reps<sup>0.10</sup></Formula>
        <P>
          It uses a curve instead of a straight line, which changes how it behaves across rep ranges. For 100 kg and 5 reps, it gives about
          117.5 kg, the highest of the three in this example.
        </P>
        <H3>Which Formula Should You Pick?</H3>
        <P>
          If you are unsure, start with Epley as a general-purpose choice, or Brzycki if your set was 5 reps or fewer. At exactly 10 reps,
          Epley and Brzycki give the same answer, and they only pull apart above or below that point. A practical approach is to calculate
          all three and look at the spread. When the numbers cluster, you can be more confident. When they spread out, treat the lowest
          figure as a conservative working number. Whichever formula you choose, stay with it. Switching between formulas over time muddies
          your progress tracking.
        </P>
        <H3>Converting Between a 1RM and a Set of Several Reps</H3>
        <P>
          The same math works in reverse. If you know your 1RM, you can work out how much weight you can lift for a set of 5, 8 or 12, and
          that is exactly what the rep table in the calculator does. This is the answer to a common question: a good formula for moving
          between a 1RM and a multi-rep max is simply one of the equations above, solved for weight instead of for 1RM. Keep in mind that
          the further you move from 1 rep, the rougher the conversion gets.
        </P>
      </Card>

      <Card title="Reading the Rep Max Chart and 1RM Percentage Table">
        <P>
          The tables beneath your result turn a single number into a usable training plan. The rep max chart lists your estimated weight for
          each rep count from 1 to 20. The 1RM percentage table shows what 50%, 55%, 60% and so on up to 100% of your max actually weighs.
        </P>
        <P>
          The two tables are linked by a rough rule: the heavier the percentage, the fewer reps you can do. As a general guide, around 95% of
          your 1RM is usually a single or a double, 85% is about 5 to 6 reps, 75% is about 10 reps, and 65% is about 15 to 20 reps. These
          pairings vary by person, exercise and training experience, which is why the tool calculates them from your own numbers instead of
          using a fixed template.
        </P>
        <P>
          One thing trips people up: the number of reps a percentage allows is not the number of reps you should do. If 80% of your max is a
          weight you could lift for about 8 reps, that doesn’t mean every set at 80% should be 8 reps. Your goal decides the rep target, as
          the next section explains.
        </P>
      </Card>

      <Card title="What Percent of Your 1RM Should You Train At?">
        <P>Different goals live in different parts of the chart. These ranges are general guidelines, and sources vary slightly, but they are a solid starting point.</P>
        <List items={[
          ["Explosive power and speed work:", "about 50% to 60% for 3 to 5 reps, moving the bar fast with short rests."],
          ["Muscle endurance:", "about 65% to 70% for 10 to 15 reps."],
          ["Muscle growth:", "about 65% to 80% for 6 to 12 reps, with sets taken close to failure."],
          ["Maximal strength:", "about 80% to 95% for 1 to 5 reps."],
        ]} />
        <H3>What Percent of Your 1RM Builds Muscle?</H3>
        <P>
          For building mass, most lifters do well between 65% and 80% of their 1RM for sets of roughly 6 to 12 reps. What matters most is
          that each set gets close to failure, meaning you could only do a rep or two more with good form. Lighter weights can build <Link to="/tools/lean-body-mass-calculator" className="inline-home-link">muscle</Link>{" "}
          too if the sets are hard enough, which is part of why many bodybuilders don’t bother with heavy singles.
        </P>
        <H3>What Percent Should You Use for a 3-Day, Full-Body, 4x4 Program?</H3>
        <P>
          A 4x4 program means 4 sets of 4 reps, and on a full-body split you are hitting large muscle groups three times a week. That calls
          for moderate loads. A good range is 70% to 80% of your 1RM. Start near 70% to 75% in the first weeks, because 4 reps at that weight
          leaves plenty in reserve, and move up slowly as the movements feel crisp. Since 80% is about what you could lift for 8 reps, a set
          of 4 there still leaves you with four reps in the tank. Going much heavier on every compound lift, three days a week, tends to pile
          up fatigue faster than you can recover from it.
        </P>
      </Card>

      <Card title="When You Need a 1RM Calculator">
        <P>There are several practical situations where an estimate beats a true max attempt.</P>
        <List items={[
          ["Starting a new program.", "Many programs, from linear progressions to percentage-based powerlifting cycles, ask for your 1RM or a training max before week one. If you have never maxed out, a recent hard set gives you a starting number."],
          ["Training without a spotter.", "Home gym lifters and people who train alone often can’t safely attempt a single at their limit. Estimating from a 5-rep set keeps the risk low."],
          ["Returning from a break or injury.", "After time away, going for a true max is rarely wise. Estimating from a manageable set helps you rebuild loads gradually and see how much strength has returned."],
          ["Tracking progress between tests.", "Maxing out every month wears you down. Estimating your 1RM from a regular working set lets you see trends without the fatigue and injury exposure."],
          ["Comparing lifts and planning ratios.", "Coaches and athletes often compare relative strength across lifts or check the balance between bench, squat and deadlift. Calculated 1RMs make those comparisons possible without three separate max days."],
          ["Preparing for a competition.", "Powerlifters use estimated maxes to choose sensible opening attempts and plan peaking cycles, then confirm with heavy singles closer to the meet."],
        ]} />
      </Card>

      <Card title="One Rep Max for Bench Press, Squat, Deadlift and Overhead Press">
        <P>
          The formulas don’t change between exercises, but how well they predict does. A 1RM calculator tends to be most accurate for
          compound barbell lifts that you have practiced and perform with a steady rhythm, such as the bench press, back squat, deadlift and
          overhead press.
        </P>
        <P>
          For the bench press, a quality set of 3 to 8 reps gives a solid estimate, and it is easy to verify safely with a spotter. For the
          squat, depth and bar position affect repeatability, so count only reps that meet the same depth standard each time. For the
          deadlift, grip, fatigue and the reset between reps can skew the result, so many lifters get cleaner numbers from sets of 3 to 5
          reps. Research on these three lifts also suggests that formulas tend to underestimate the deadlift, so don’t be surprised if your
          real max turns out higher than the calculator says.
        </P>
        <H3>How to Calculate Your Overhead Press 1RM</H3>
        <P>
          The overhead press works the same way as the other lifts. Do a hard, strict set of 3 to 6 reps, enter the weight and reps, and read
          your estimate. Strictness is the key. If you start using your legs to push the bar up (a push press), those reps no longer measure
          your overhead press, so leave them out of the count. Because the press uses smaller muscles, your numbers will be lower and
          progress in small jumps, so don’t be discouraged if gains come in 2.5 kg or 5 lb steps.
        </P>
        <H3>Can You Use It for a Leg Press?</H3>
        <P>
          Yes. You can enter a leg press set the same way as any other lift. Keep in mind that leg press numbers are not comparable to squat
          numbers, because machines differ in angle, sled weight and range of motion. Your estimate is useful for tracking your own progress
          on the same machine, but not for comparing yourself to someone else or to your squat. The same goes for other machine and
          isolation exercises. The formulas are less predictable there, so treat the result as a working number.
        </P>
        <H3>What Are the Best Lifts to Find a 1RM For?</H3>
        <P>
          The best lifts for 1RM work are the big, stable, multi-joint barbell movements: the squat, bench press, deadlift and overhead
          press. They involve a lot of muscle, are easy to standardize, and are the lifts most programs are built around. Exercises that are
          mostly about isolating a small muscle, like curls or triceps extensions, don’t lend themselves well to max testing.
        </P>
        <H3>What Is the Most Dangerous Lift to Max Out?</H3>
        <P>
          It depends mostly on setup. The back squat and the bench press carry the most risk when done without safeties or a spotter, since
          a failed rep can leave you pinned under the bar. A properly set power rack or safety arms removes most of that danger. The deadlift
          is easier to bail out of, but heavy singles with a rounded back put real stress on your spine. In every case, the real danger is
          poor form, a bad setup or going too heavy too soon, not the lift itself.
        </P>
      </Card>

      <Card title="How Reliable Are Estimated One Rep Max Calculations?">
        <P>
          A 1RM calculator gives an estimate, not a measurement. Studies on these equations, including{" "}
          <Ext href="https://jssm.org/jssm-08-567.xml">a review in the Journal of Sports Science and Medicine</Ext>, show that predictions
          line up best with a tested max when the input set is under about 10 reps, and that sets of 4 to 6 reps predicted more accurately
          than sets of 7 to 10. A{" "}
          <Ext href="https://researchconnect.suny.edu/en/publications/accuracy-of-prediction-equations-for-determining-one-repetition-m/">study of 103 women before and after 12 weeks of training</Ext>{" "}
          reached the same conclusion: equations were more accurate when fewer than 10 reps were used. As a rule of thumb, an estimate from
          a good set is often within about 10% of your real max, though some people will land further off.
        </P>
        <P>
          At 15 or 20 reps, endurance, pacing and tolerance for discomfort start to matter as much as strength, so the same formula becomes
          much less reliable.
        </P>
        <H3>Limitations of a 1RM Test</H3>
        <P>Whether you estimate or test directly, a 1RM number has limits worth knowing:</P>
        <List items={[
          ["It’s a snapshot.", "It reflects one lift in one day. Sleep, stress, food, time of day and warm-up all move your performance."],
          ["Beginners change fast.", "A newer lifter can gain strength every week, so an estimate from last month may already be out of date. Many formulas were also built from data on experienced lifters, so they can be less accurate for beginners."],
          ["Technique decides what counts.", "A formula can’t tell whether your squat depth was honest or your bench press had a bounce. Bad reps give a bad number."],
          ["It’s lift-specific.", "A max in one exercise says little about another."],
          ["Fatigue and risk.", "Testing a true max is hard on your body and can interfere with the training that follows."],
        ]} />
        <P>
          The practical takeaway is to treat the calculator as a planning tool. Use the result to set loads, then adjust based on how the
          first sets feel. If a prescribed weight moves much faster or slower than expected, update your input and recalculate.
        </P>
      </Card>

      <Card title="Tips for Getting a More Reliable Estimate">
        <P>
          Use a heavy but controlled set of 3 to 6 reps whenever possible, and stop when your form would break down instead of grinding to
          complete failure. Do the set after a proper warm-up, not as the first set of the day. Use the same exercise variation, grip, stance
          and equipment each time you test, since small changes alter the number.
        </P>
        <P>
          Be honest about the reps. If the last one was a grinder that needed help from a spotter, it doesn’t count. And if you use the
          result for percentage-based training, consider working from a training max of about 90% of your calculated 1RM. That cushion
          allows for day-to-day swings and keeps your sets clean, which usually produces better long-term progress than chasing the highest
          possible number.
        </P>
      </Card>

      <Card title="How to Warm Up Before a One Rep Max Attempt">
        <P>
          A good warm-up prepares your muscles, joints and nervous system for a heavy load without wearing you out. Start with 5 to 10
          minutes of light movement, such as an easy bike or brisk walk, followed by dynamic mobility work for the joints you’ll use. After
          a stretch and general warm-up, move into lighter sets of the lift itself instead of adding unrelated exercises. For a bench press
          max, for example, a few light sets with the empty bar and some band pull-aparts or shoulder circles are plenty.
        </P>
        <H3>How Close to Your Max Should You Lift While Warming Up?</H3>
        <P>
          A common ramp-up goes like this: the empty bar for 8 to 10 reps, then about 50% for 5 reps, 70% for 3, 80% to 85% for 2, and 90%
          for a single. Most lifters stop warm-ups around 90% and then take their first real attempt, usually a few percent heavier. The
          point is to practice the groove at heavier weights without burning energy. If your warm-up singles feel hard, you went too far,
          too fast, and it may be smarter to call it a day.
        </P>
        <H3>How Long to Rest Between Attempts</H3>
        <P>
          Rest 3 to 5 minutes between heavy attempts, and a bit longer if the last one felt very hard. Short rests are a common reason people
          fail lifts they could otherwise make. During the lighter warm-up sets, 1 to 2 minutes is fine.
        </P>
      </Card>

      <Card title="How Often Should You Test Your One Rep Max?">
        <P>
          A true max attempt is demanding, so most lifters do it only a few times a year, often at the end of a training block or ahead of a
          meet. Powerlifters in peaking phases may test every 8 to 16 weeks. In between, you can estimate your 1RM from a regular heavy set
          as often as every 4 to 8 weeks, which gives you progress data without the recovery cost.
        </P>
        <H3>Is It Ineffective to Always Train at Your One Rep Max?</H3>
        <P>
          Yes, for most people. Lifting maximal weights every session is hard to recover from, and it limits the total volume you can do,
          which is a big driver of strength and size. It also raises injury risk and leaves little room to practice technique. Most
          successful programs mix heavy work (about 80% to 90%) with moderate volume work, and save true maxes for specific moments.
        </P>
        <H3>When Should You Test Your One Rep Max for Deadlifts?</H3>
        <P>
          The deadlift is especially taxing on your back and your recovery, so give it space. Test it when you are fresh, after a lighter
          week or a deload, and keep the next few days easy. Many lifters test deadlifts every 8 to 12 weeks, or less often.
        </P>
        <H3>If You Can Only Do One Rep on the Deadlift, Can You Lift That Weight Every Week?</H3>
        <P>
          It’s not a good idea. If a weight is truly your max, lifting it every week doesn’t leave enough time to recover or improve
          technique. Instead, work with weights around 80% to 90% for sets of 2 to 5 and save the heavy single for planned test days. If you
          can only do one rep at a given weight because of fatigue, it’s likely a sign to back off.
        </P>
      </Card>

      <Card title="Why You Can’t Always Hit Your One Rep Max">
        <P>
          It is very common to hit a max one week and miss it the next. A 1RM isn’t a fixed number. It moves with sleep, stress, nutrition,
          hydration, recovery, warm-up quality, even the time of day and your mood. Fatigue from earlier training can lower your strength by
          several percent, which is enough to turn a smooth lift into a miss. Equipment, bar and gym setup matter as well.
        </P>
        <P>
          That is one reason estimated numbers are useful: they smooth out the day-to-day noise. If you miss a max, don’t take it as proof
          that you lost strength. Check your sleep and recovery, repeat the test after an easier week, and judge your progress by trends over
          several weeks, not one session.
        </P>
      </Card>

      <Card title="Does Testing Your One Rep Max Build Muscle?">
        <P>
          Not much. A single heavy rep is great for practicing maximal effort and building neural efficiency, meaning your ability to recruit
          muscle fibers and control the bar. But one rep creates very little training volume, and volume is what drives most muscle growth.
          If your goal is to build muscle, you’ll get far better results from sets of 6 to 12 reps close to failure. The 1RM test is mainly a
          way to measure strength, not to create it.
        </P>
      </Card>

      <Card title="How to Increase Your One Rep Max">
        <P>
          The basics apply to any lift: train it often, add weight gradually, eat and sleep enough, and keep your form clean. Beyond that, a
          few approaches help most.
        </P>
        <List items={[
          ["Train across a mix of rep ranges.", "Heavy sets of 1 to 5 build strength directly, while moderate sets of 6 to 12 build the muscle that supports it."],
          ["Practice the lift often.", "Frequent practice of the exact lift improves technique, which is a big part of a higher 1RM."],
          ["Progress gradually.", "Small, steady increases beat big jumps that stall you."],
          ["Include rest.", "Strength is built during recovery. Planned lighter weeks keep you from burning out."],
          ["Strengthen supporting muscles.", "Weak links, such as triceps on the bench or upper back on the deadlift, can hold back the main lift."],
          ["Vary your training.", "Pause reps, tempo work and different set styles, such as pyramid sets, can break up a stale routine."],
        ]} />
        <H3>How to Break Through a One Rep Max Plateau</H3>
        <P>
          When your 1RM stops moving, first check the basics: sleep, <Link to="/tools/calorie-tracker" className="inline-home-link">calories</Link>, <Link to="/tools/protein-calculator" className="inline-home-link">protein</Link> and recent training stress. Then change something.
          Try a different rep range for a few weeks, add pause reps to fix a weak point, build up your assistance exercises, or take a deload
          week and come back fresh. Many plateaus break after a short period of lower-intensity work, because accumulated fatigue was the
          real problem, not a lack of strength.
        </P>
        <H3>Will Working on Overhead Press Increase Your Bench Press Max?</H3>
        <P>
          It can help, but only a little. The overhead press builds the shoulders and triceps, which both contribute to the bench press, so a
          stronger press often goes with a stronger bench. The bench press itself is still the best way to improve your bench. Think of the
          overhead press as a support lift, not a replacement.
        </P>
        <H3>If Your Squat Gets Stronger, Will Your Deadlift Go Up Too?</H3>
        <P>
          Not automatically. The two lifts share a lot, including leg, hip and back strength, so gains often carry over. But the deadlift
          also depends on grip, back position and hinge technique that squatting doesn’t train as directly. If you want a higher deadlift,
          you have to train it, though a bigger squat will usually help.
        </P>
        <H3>What Helps Most With a Deadlift Max?</H3>
        <P>
          Lifters who add pulls from slightly elevated positions, build grip strength, work on hip hinge technique and train the upper back
          and hamstrings often see their deadlifts rise. Consistency and recovery matter most, as the deadlift is easy to overtrain.
        </P>
      </Card>

      <Card title="Straps, Belts and Your Deadlift Max">
        <P>
          For many people, grip gives out before the legs and back do. Lifting straps remove that limit, so a deadlift 1RM with straps is
          often higher than one without. They are two different numbers, so track them separately. In powerlifting competitions, straps
          aren’t allowed, so if you are training for a meet, your real number is the one without them.
        </P>
        <P>
          Belts are a bit different. They don’t lift the weight for you, but a belt gives your abdomen something to brace against and can let
          you lift more safely at heavy loads. There is no exact percentage at which you must start wearing one. Many lifters put on a belt
          for sets around 80% to 85% of their 1RM and above, and train lighter work without it so their core stays strong. Do what keeps your
          technique steady.
        </P>
      </Card>

      <Card title="What Is a Good One Rep Max?">
        <P>
          A “good” 1RM depends on your body weight, sex, age, training history and goals. A useful way to judge it is to compare it with your
          body weight. As a rough guide for adult men, a beginner might bench around 0.75 times body weight, squat around 1 times and
          deadlift around 1.25 times. Intermediate lifters often reach about 1 time on the bench, 1.5 times on the squat and 1.75 times on the
          deadlift. Advanced lifters go beyond that. Women’s numbers are usually lower in absolute terms, with comparable standards at
          roughly 60% to 70% of those ratios. These are rough benchmarks, not rules.
        </P>
        <P>
          For high schoolers, there is no single “good” bench press number. It depends on age, size and how long they’ve been training. The
          best approach is steady progress with coaching, and focusing on form and rep-based sets before testing a true max. Competitive
          powerlifters are far above the general average and train for years to get there. What counts most is how your numbers compare
          with where you were a few months ago.
        </P>
      </Card>

      <Card title="One Rep Max vs. Absolute Strength">
        <P>
          One rep max and absolute strength are closely related but not the same. Absolute strength is the maximum force you can produce,
          regardless of your body weight. A 1RM is one way of measuring it in a specific lift. A heavier lifter generally has higher absolute
          strength, while relative strength is your strength compared with your body weight, which is why lifters are often ranked by body
          weight class.
        </P>
        <H3>Is One Rep Max the Only Way to Measure Strength?</H3>
        <P>
          No. A 1RM tells you how much you can lift at once, but strength has other sides: how many reps you can do at a moderate weight, how
          fast you move the bar, how you perform on different lifts, and how your technique holds up under heavy loads. Someone with a modest
          1RM may still have great strength endurance, and vice versa. Use your 1RM as one data point among several.
        </P>
      </Card>

      <Card title="Why Bodybuilders Don’t Chase a Higher 1RM">
        <P>
          Bodybuilders are judged on muscle size and shape, not on how much they can lift once. Heavy singles add a lot of fatigue and risk
          for very little muscle-building benefit, so most spend their time on moderate weights and higher reps. Many still track strength
          through rep-based progress, such as lifting the same weight for more reps, because stronger sets over time usually mean growing
          muscle. A bodybuilder might still use a 1RM estimate to set their training percentages, just without the heavy testing.
        </P>
      </Card>

      <Card title="Free, Private and Simple to Use">
        <P>
          The one rep max calculator on Tolz is free to use, with no payment, trial period or hidden charges, and you can run as many
          calculations as you like. There is no account to create before you start. You only enter two numbers, a weight and a rep count,
          and the page doesn’t ask for personal details such as your name, email or body measurements to produce your result.
        </P>
        <P>
          Results come from standard, publicly documented formulas, so you can check the math yourself using the equations above. The tool
          works in both kilograms and pounds and is built to load quickly on a phone, which helps when you are standing next to the rack
          between sets.
        </P>
        <P>
          Always talk with a qualified fitness professional or healthcare provider before maximal strength testing or starting a new
          exercise program, especially if you have a health condition or an injury.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
