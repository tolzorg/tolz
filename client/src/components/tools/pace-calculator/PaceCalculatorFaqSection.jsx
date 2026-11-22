import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I calculate pace?",
    a: "Divide your total time by your distance. If you run 10 km in 50 minutes, your pace is 5 minutes per kilometer. The pace calculator does this instantly and also converts to minutes per mile.",
  },
  {
    q: "What is a good running pace?",
    a: "It depends on age, fitness and goals. Many recreational runners average between 5:30 and 7:30 per kilometer, and a good pace is best judged against your own progress and the distance you are training for.",
  },
  {
    q: "What is an average running pace per kilometer?",
    a: "Most recreational runners fall between 6:00 and 7:00 per kilometer, which is roughly 9:40 to 11:15 per mile.",
  },
  {
    q: "How do I convert min/km to min/mile?",
    a: "Multiply your pace per kilometer by 1.609344. For example, 5:00 per kilometer is about 8:03 per mile.",
  },
  {
    q: "What pace do I need for a 4-hour marathon?",
    a: "You need an average of about 5:41 per kilometer, or roughly 9:09 per mile, from start to finish.",
  },
  {
    q: "How do I plan my pace for a half marathon?",
    a: "Start with a goal time based on a recent 10K or 5K result, then use the calculator to find your target pace and splits. Many runners go out a little slower for the first few kilometers and hold steady through the middle.",
  },
  {
    q: "How can I increase my running pace?",
    a: "Run mostly easy miles, add one interval or tempo session each week, include strides and hill sprints, and allow enough recovery. Pace improves gradually with consistent training.",
  },
  {
    q: "Can I use the pace calculator for walking or cycling?",
    a: "Yes. Enter your distance and time to find your average walking pace, or your cycling distance and time to see average speed and pace per kilometer.",
  },
  {
    q: "How do you calculate swimming pace?",
    a: "Divide your total time by the number of 100-meter blocks you swam. Swimming 1,000 meters in 20:00 gives a pace of 2:00 per 100 meters. The Tolz calculator is designed for running, walking and cycling, so swim pace is done by hand.",
  },
  {
    q: "What are race splits?",
    a: "Splits are the times you should reach at set checkpoints, such as every kilometer or mile. They help you hold a steady pace and avoid starting too fast.",
  },
  {
    q: "How accurate is the finish-time estimate?",
    a: "It is a projection based on your current pace. It is most reliable when based on a recent race or hard effort and when you have trained for the target distance. Hills, weather and course conditions can change the result.",
  },
  {
    q: "Is this pace calculator free, and do I need to sign up?",
    a: "It is free to use, and you can get your results without creating an account.",
  },
];

// The supplied FAQ schema matches the displayed text, except for one word in
// the first answer ("ran" instead of "run").
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate pace?": "Divide your total time by your distance. If you ran 10 km in 50 minutes, your pace is 5 minutes per kilometer. The pace calculator does this instantly and also converts to minutes per mile.",
};

const AGE_HEADERS = ["Age Group", "Men (min/km)", "Women (min/km)"];
const AGE_ROWS = [
  ["12–15", "5:45–8:00", "6:15–8:30"],
  ["16–19", "5:15–7:00", "5:45–7:30"],
  ["20–29", "5:15–7:00", "6:00–7:45"],
  ["30–39", "5:30–7:15", "6:15–8:00"],
  ["40+", "5:45–7:30", "6:30–8:15"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

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
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 360 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
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

export default function PaceCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ_SCHEMA_OVERRIDES[item.q] ?? item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is Pace in Running, Cycling and Swimming?">
        <P>
          Pace is the amount of time it takes you to cover a fixed distance. Runners usually express it as minutes per kilometer or
          minutes per mile. A 5:30 per kilometer pace means each kilometer takes you five minutes and thirty seconds. A lower number
          means you are moving faster.
        </P>
        <P>
          Speed is the same idea turned around. It measures how much distance you cover in a fixed amount of time, such as kilometers per
          hour or miles per hour. Pace and speed describe one movement in two ways, so you can always convert one into the other.
        </P>
        <P>
          Each sport has its own habit. Running and walking use pace, because race results and training plans are built around it.
          Cycling almost always uses speed, since bike computers display km/h or mph. Swimming uses pace per 100 meters (or per 100
          yards), because pool lengths are short and the numbers stay manageable. The math behind all of them is the same: time divided
          by distance.
        </P>
      </Card>

      <Card title="What the Pace Calculator Does">
        <P>
          The tool has three core modes. If you know your distance and time, it gives your average pace. If you know your pace and
          distance, it gives the time you will need. If you know your pace and time, it tells you how far you will go. Around those
          modes, it adds race-time projections, splits, multipoint section paces, a pace converter and a finish-time estimate. One page
          covers most of what you would otherwise do with a stopwatch and a notepad.
        </P>
      </Card>

      <Card title="How to Use the Pace Calculator">
        <P>
          Choose what you want to solve for, then fill in the other two values. For average pace, enter the distance (5 km, 10 miles or a
          custom figure) and your time in hours, minutes and seconds. The result appears in your chosen unit. To plan a target instead,
          enter the distance and the pace you can hold, and the tool returns your finish time.
        </P>
        <P>
          A few habits improve accuracy. Enter distance as precisely as you can, because a GPS watch reading 10.2 km on a “10K” course
          will skew your pace if you type 10. Use seconds as well as minutes, since a 4-second-per-kilometer difference adds up to nearly
          three minutes over a marathon. Also check that your unit matches the one you think in, so you are not comparing a min/mile
          target with a min/km result.
        </P>
      </Card>

      <Card title="What Is a Good Running Pace?">
        <P>
          There is no single answer, because a good pace depends on your age, fitness, experience and goal. The most useful way to judge
          it is against your own history and the distance you are training for. A pace you can hold comfortably for the full distance is
          a good pace.
        </P>
        <H3>What Is an Average Running Pace per Kilometer?</H3>
        <P>
          Most recreational runners fall between about 6:00 and 7:00 per kilometer, which is roughly 9:40 to 11:15 per mile. Newer
          runners often land at the slower end, and runners with a few years of consistent training tend to settle between 5:00 and 6:00
          per kilometer. Averages are a reference point, not a standard you have to meet.
        </P>
        <H3>What Is a Suggested Running Pace for Normal People?</H3>
        <P>
          If you run for health and enjoyment, the best pace is one where you can still speak in short sentences. For most beginners that
          is around 6:30 to 8:00 per kilometer (10:30 to 12:50 per mile). If you cannot talk, you are going too fast for an easy run.
          Run-walk intervals are also a perfectly good way to build up, and the calculator can show you your overall average when you mix
          the two.
        </P>
        <H3>What Is a Good Running Pace in Min/km, by Age and Gender?</H3>
        <P>
          The table below shows typical ranges for recreational runners on 5K to 10K distances. These are general ranges based on how most
          casual runners perform, not official standards. To get min/mile, multiply the min/km value by 1.609.
        </P>
        <DataTable headers={AGE_HEADERS} rows={AGE_ROWS} />
        <P>
          A good running pace for a woman is the one that fits her fitness and goals, and the female column above gives a realistic
          range. Young runners between 12 and 15 vary widely because of growth, training age and school sports, so treat their numbers
          loosely.
        </P>
        <H3>What Is a Realistic Running Pace Goal?</H3>
        <P>
          A realistic goal comes from something you have actually run. Take a recent race or a hard, honest effort and aim for a small
          improvement. New runners can often improve by several percent over a training block. Experienced runners usually gain 1 to 3
          percent per cycle, and those gains get harder over time. If your 5K is 30:00 today, aiming for 28:30 in two months is
          realistic, and the calculator will show that means about 5:42 per kilometer instead of 6:00.
        </P>
      </Card>

      <Card title="How to Improve Your Running Pace">
        <P>Getting faster comes down to training the right systems and giving your body time to adapt. The questions below cover the most common ones.</P>
        <H3>How Do I Increase My Running Pace?</H3>
        <P>
          Improve three things together: aerobic base, speed work and recovery. Run most of your miles at an easy effort so you can build
          volume safely. Add one faster session per week, such as intervals or a tempo run. Include short strides after easy runs to
          practice good form at higher speed. <Link to="/tools/one-rep-max-calculator" className="inline-home-link">Strength training</Link> for the legs and core also helps, and so do sleep and fueling. Most people
          get slower results from training harder, not smarter, so protect your easy days.
        </P>
        <H3>What Is Better for Pace: Intervals or Long Distance?</H3>
        <P>
          You need both. Long, steady runs build the aerobic engine that supports every race distance. Intervals raise your top-end speed
          and teach you to run efficiently when tired. A simple balance for most runners is two or three easy runs, one interval or tempo
          session, and one long run each week. If you are training for a marathon, lean more on long runs. For a 5K, give intervals more
          weight.
        </P>
        <H3>How Do You Increase an Easy Run Pace?</H3>
        <P>
          Easy pace improves as a side effect of aerobic fitness, so you should not force it. Run consistently for several weeks, increase
          weekly mileage gradually, and keep most runs conversational. Over time, the same <Link to="/tools/target-heart-rate-calculator" className="inline-home-link">heart rate</Link> and effort will produce a faster
          pace. Adding strides, hill work and strength training speeds up that process. If you rush easy runs to look faster on paper, you
          tend to arrive at harder workouts tired and slow.
        </P>
        <H3>Are Hill Sprints Effective?</H3>
        <P>
          Yes. Hill sprints are short, hard efforts of about 8 to 12 seconds on a steep hill, with a full walk-back recovery. They build
          leg power, improve running mechanics and strengthen tendons, and the uphill angle reduces impact compared with sprinting on flat
          ground. Start with four to six repeats once a week and increase gradually. Stop if you feel sharp pain in a calf or hamstring.
        </P>
        <H3>Will Treadmill Running Improve My Outdoor Pace?</H3>
        <P>
          It can. A treadmill lets you hold a precise pace with no wind, traffic or hills getting in the way, which makes it excellent for
          tempo runs and intervals. Setting the incline to 1 percent is a common way to better match outdoor effort, since it makes up for
          the lack of air resistance. Remember that outdoor surfaces, wind and turns feel different, so mix in outdoor runs, especially
          before a race.
        </P>
        <H3>Can You Improve Your Pace in Two Weeks?</H3>
        <P>
          Small gains are possible, but large ones are not. Two weeks is not enough time for your body to build new fitness, so the
          realistic wins come from better execution. Pace the first kilometer sensibly, taper your mileage in the final days, sleep well,
          warm up properly, and avoid starting too fast. A runner who goes out too hard often loses more than a minute in the final
          kilometers.
        </P>
        <P>
          Cutting five minutes from a 5K in two weeks is not realistic. For a 30:00 runner, that would mean running a full minute per
          kilometer faster, an improvement of about 17 percent. Plan for that kind of change over several months instead.
        </P>
        <H3>How Do I Increase My Running Speed in a Marathon?</H3>
        <P>
          Marathon speed is mostly about pacing and endurance. Build your long run gradually, include marathon-pace segments in some long
          runs, and add a weekly tempo run to raise your sustainable pace. Practice your fueling plan in training. On race day, start at or
          slightly below goal pace and save your effort for the second half. Runners who go out fast almost always pay for it after 30 km.
        </P>
        <H3>What Long Run Pace Should a Sub-3 Hour Marathoner Use?</H3>
        <P>
          A sub-3:00 marathon requires about 4:16 per kilometer, or 6:52 per mile. Most runners at this level do their easy long runs well
          below that pace, often around 4:50 to 5:20 per kilometer (roughly 7:45 to 8:35 per mile). Some long runs include blocks at goal
          pace, such as 10 to 16 km at 4:10 to 4:16 per kilometer, to practice holding the effort on tired legs. Long runs build
          endurance, so they are not meant to match race pace from start to finish.
        </P>
      </Card>

      <Card title="Running Pace Calculator: Targets from 5K to Marathon">
        <P>
          Most people searching for a running pace calculator have a goal time in mind. The standard race distances are 5 km, 10 km,
          21.0975 km for the half marathon, and 42.195 km (26.2 miles) for the marathon. Enter your goal time for any of them and you get
          the pace you must average from start to finish.
        </P>
        <P>
          A few examples show how the numbers play out. A 25:00 5K requires 5:00 per kilometer. Holding 5:00 per kilometer for a full
          marathon gives a finish of about 3:30:58, and for a half marathon about 1:45:29. A 4:00:00 marathon, a popular goal, needs about
          5:41 per kilometer, or roughly 9:09 per mile.
        </P>
        <P>
          This is where a race pace calculator helps most. Instead of guessing, you can test several goal times and see how much faster
          each one asks you to run. A 3:45 marathon is not just “15 minutes quicker” than 4:00. It means shaving about 21 seconds off
          every kilometer for 42 kilometers, and seeing that figure early lets you judge whether the goal fits your training.
        </P>
        <H3>How to Plan Your Pace for a Half Marathon</H3>
        <P>
          Start with a goal time that matches your recent 10K or 5K results. A 2:00:00 half marathon needs about 5:41 per kilometer (9:09
          per mile), while 1:45:00 needs about 4:59 per kilometer (8:01 per mile). Enter the goal in the calculator to get your target pace
          and a set of splits.
        </P>
        <P>
          Then plan how you will spread the effort. Many runners go out slightly slower for the first 3 to 5 km, settle into goal pace
          through the middle, and push only in the final 3 to 5 km if they feel strong. For a 2:00 goal, that could mean 5:45 per kilometer
          early, 5:40 through the middle, and 5:35 near the end. Look at the course map as well. If a big hill sits at kilometer 14, build
          in a little time to spend there, and do not hold the same pace on the climb as you do on flat ground.
        </P>
      </Card>

      <Card title="Race Splits and Pacing Strategy">
        <P>
          A finish time tells you where you end up, but splits tell you how to get there. The calculator breaks a race into checkpoints,
          such as every kilometer, every mile or every 5K, and shows the time you should reach each one. You can write these on your wrist,
          set them in a watch alert, or hand them to a pacer.
        </P>
        <P>
          Splits also let you plan a deliberate strategy. With even pacing, every split is the same, which is efficient on flat courses and
          in steady conditions. A negative split means running the second half faster than the first. For a 3:50 marathon, you might aim
          for a first half of 1:56 and a second of 1:54. Many runners find this approach more forgiving, because the early kilometers feel
          easy and the finish is strong rather than survival. Running a positive split by accident is the more common problem, because
          adrenaline pushes pace too hard in the first 5K. Looking at your planned splits beforehand is a cheap way to protect yourself
          from that.
        </P>
      </Card>

      <Card title="Multipoint Section Paces">
        <P>
          Real routes are rarely uniform. A trail run might include a steep climb, a flat middle and a long descent. A cycling route might
          have a headwind leg and a tailwind return. The multipoint feature breaks a route into sections, so you can see the pace for each
          part instead of one overall average.
        </P>
        <P>
          Here is how it works in practice. Say you run from point A to point B, then on to point C, and you note the time at each point.
          Using a map or a route-planning app, you find the distance between the points. The calculator then shows how fast you traveled
          between each pair. This is useful for training, because you can run the same route again and again and compare section paces. If
          the second half of your loop is consistently slower, you know where to focus.
        </P>
        <P>
          It also helps with planning. Before an event, you can set a pace for each section and see the overall finish time that plan
          produces. Because sections can differ in length, the total is properly weighted, so a short fast section does not distort the
          result the way a simple average of paces would.
        </P>
      </Card>

      <Card title="Pace Converter: Minutes per Kilometer, Minutes per Mile and Speed">
        <P>
          Pace conversion is one of the most common small headaches in training. A race might be marked in kilometers while your watch is
          set to miles, and a treadmill might show speed while your plan lists pace. The pace converter handles each case.
        </P>
        <P>
          The math is straightforward. One mile equals 1.609344 kilometers, so a pace in minutes per kilometer multiplied by that figure
          gives minutes per mile. A pace of 5:00 per kilometer equals about 8:03 per mile, and 6:00 per kilometer equals about 9:39 per
          mile. To convert pace into speed, divide 60 by your pace in minutes. A pace of 5:00 per kilometer is 12 km/h, and 4:00 per
          kilometer is 15 km/h.
        </P>
        <P>
          Doing this by hand is fine once, but errors creep in when you convert across several distances, which is why a dedicated
          converter saves time. It matters most with treadmill work: if your plan calls for 5:30 per kilometer, you need to know exactly
          which speed to set on the console.
        </P>
      </Card>

      <Card title="Walking and Cycling Pace">
        <P>
          Pace calculators are often associated with running, but the same arithmetic applies to every steady-state activity. A walking
          pace calculator is useful for hikes, charity walks and fitness plans. A relaxed adult walking speed is about 5 km/h, which is a
          pace of 12:00 per kilometer, or just over 19 minutes per mile. Brisk walking is commonly considered to be around 6 km/h, or 10:00
          per kilometer. For a 20 km hike, that 1 km/h difference is the gap between four hours and three hours twenty minutes of walking,
          before you count rest stops.
        </P>
        <P>
          For cycling, speed is the usual measure. Enter distance and time to find your average speed, or enter the speed you expect to
          hold and see how long a ride will take. Riding 40 km in 1 hour 20 minutes means an average of 30 km/h, which corresponds to a pace
          of 2:00 per kilometer. Keep in mind that average speed includes only moving time if your device pauses when you stop, so compare
          like with like when you plan group rides or sportives.
        </P>
      </Card>

      <Card title="Swim Pace: How to Calculate It">
        <P>
          The Tolz pace calculator is built for running, walking and cycling, but swimmers can use the same math by hand. Swim pace is
          measured per 100 meters (or per 100 yards). Divide your total time by your distance in hundreds. If you swim 1,000 meters in
          20:00, you have ten 100-meter blocks, so your pace is 2:00 per 100 meters.
        </P>
        <P>
          To convert swim pace into a per-mile figure, multiply the seconds per 100 meters by 16.09, since a mile is about 1,609 meters. A
          pace of 2:00 per 100 meters is 120 seconds, which comes to about 1,931 seconds, or roughly 32:11 per mile. If your pool is
          measured in yards, multiply your seconds per 100 yards by 1.0936 to get seconds per 100 meters.
        </P>
        <P>
          A slow swim pace for adults is usually anything above about 2:15 per 100 meters, and many beginners start between 2:00 and 2:30.
          Recreational lap swimmers often hold 1:45 to 2:15, while competitive swimmers go well under 1:30. To keep a steady pace in the
          pool, use a pace clock on the wall, count strokes per length, and rest for the same amount of time between sets. If your first 200
          is much faster than your last, you started too hard.
        </P>
      </Card>

      <Card title="Finish-Time Estimate: What It Can and Cannot Tell You">
        <P>
          The finish-time estimate projects a result from the pace you can currently sustain. A common use is entering a recent 10K time and
          seeing what that suggests for a half marathon or marathon. This is a reasonable planning guide, but it is not a promise.
          Projections assume you have trained for the longer distance, and a runner who has only trained for 10K will usually slow down more
          than any formula predicts.
        </P>
        <P>
          The course and conditions matter too. Hills, heat, wind, altitude and crowded starts all add time that a flat-course calculation
          ignores. Treat the estimate as a starting point, then adjust: build in a few seconds per kilometer for a hilly route, and be
          cautious about the earliest part of any long race. The estimate is most reliable when it is based on a recent, honest, all-out
          effort rather than a training run.
        </P>
      </Card>

      <Card title="What Affects Your Pace">
        <P>Pace is not only about fitness. Several outside factors can move your numbers up or down, and knowing them helps you read your results correctly.</P>
        <H3>How Does Elevation Gain Affect Running Pace?</H3>
        <P>
          Uphill running slows you down, and downhill running does not give all of that time back. A rough rule of thumb is that every 1
          percent of uphill grade costs about 10 to 15 seconds per mile (about 6 to 9 seconds per kilometer), and a downhill gives back less
          than you lost. For a race with a lot of climbing, add time to your planned pace on those sections rather than trying to hold the
          flat-ground number. Running by effort on hills, instead of by watch, saves energy.
        </P>
        <H3>How Much Slower Is Trail Pace Compared With Road Pace?</H3>
        <P>
          Trail running is usually slower than road running, often by 10 to 25 percent depending on the terrain. Roots, rocks, mud, sand and
          steep climbs all slow you down. A runner who holds 6:00 per kilometer on the road might run around 6:35 to 7:30 per kilometer on a
          trail. Use the multipoint feature to check your section paces on trails, and set your expectations by effort instead of by road
          speed.
        </P>
        <H3>Is Jogging the Same as Slow Running?</H3>
        <P>
          Mostly, yes. There is no strict line between the two. Many people describe jogging as a relaxed pace slower than roughly 10:00 per
          mile (about 6:15 per kilometer), and running as anything faster. The movement is the same, and the main difference is effort. If
          you can chat easily and the pace feels comfortable, you are jogging, and you are still training your aerobic system.
        </P>
        <H3>What Is the Impact of Losing Weight on Running Pace?</H3>
        <P>
          Carrying less body weight usually makes running easier, because your legs move less mass with every step. A commonly cited rule of
          thumb is a couple of seconds per mile for each pound lost, though results vary by person. This only holds when the weight loss is
          gradual and you keep eating enough to fuel training. Cutting <Link to="/tools/calorie-tracker" className="inline-home-link">calories</Link> too hard can cost you muscle and energy, and your pace will
          drop instead of improving.
        </P>
        <H3>What Is a Good Running Pace to Lose Belly Fat?</H3>
        <P>
          You cannot choose where your body loses fat, so no pace targets belly fat specifically. Fat loss depends on your overall energy
          balance across weeks, which includes diet, sleep and total activity. For running, a moderate pace you can sustain for 30 to 60
          minutes is more useful than sprinting until you quit. The American Heart Association lists moderate intensity as roughly 50 to 70
          percent of maximum heart rate. Consistency matters more than any single pace.
        </P>
      </Card>

      <Card title="Training With Pace and Heart Rate">
        <P>
          Pace tells you how fast you are moving, and heart rate tells you how hard your body is working. They usually rise together, but
          they do not always match. Heat, hills, stress, poor sleep and caffeine can push your heart rate up at the same pace. Using both
          gives you a fuller picture and helps you avoid overtraining.
        </P>
        <P>
          The most common estimate for maximum heart rate is 220 minus your age. It is easy to use, but it is only a rough guide, and
          individual maximums can differ by 10 or more beats from the result. A lab test or a hard field test gives better numbers. The{" "}
          <Ext href="https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates">American Heart Association</Ext>{" "}
          publishes target heart rate ranges for different intensity levels.
        </P>
        <P>
          It also helps to understand the two broad kinds of effort. Aerobic running is steady and uses oxygen efficiently, which is why you
          can keep it going for hours. Anaerobic running is faster and relies more on stored sugars, producing lactate quicker than your body
          clears it, which is the burning feeling that forces you to slow down. For marathon training, most of your running should be
          aerobic, with some work near your threshold pace. Threshold training is simply running at the edge of what you can sustain, and it
          gradually raises the pace you can hold before fatigue sets in.
        </P>
        <P>
          One popular field test is a 30-minute solo time trial at maximum steady effort. Your average heart rate over the final 20 minutes
          gives a rough estimate of your lactate threshold heart rate. Do it alone, on a flat route, and treat the result as an estimate.
        </P>
      </Card>

      <Card title="What Does a Winning Running Pace Look Like?">
        <P>
          It depends entirely on the field. At a local 5K, winners often run somewhere around 3:30 to 4:30 per kilometer. At the elite
          level, the numbers are far faster. Top men now run marathons at about 2:50 per kilometer (roughly 4:35 per mile), and the best
          women run about 3:05 per kilometer (roughly 4:57 per mile). Elite men over 5K hold about 2:31 per kilometer, and elite women just
          under 2:50. Records change, so check <Ext href="https://worldathletics.org/records">World Athletics</Ext> for current marks. To see
          what any of these paces means over a different distance, enter them into the calculator.
        </P>
      </Card>

      <Card title="When You Need a Pace Calculator">
        <P>
          The tool is useful in more situations than race day. Marathon and half marathon runners use it in the final weeks to confirm goal
          pace and write out splits. Beginners use it to see what pace they actually run on a casual route, which is often slower than they
          assumed and perfectly fine. Coaches use it to set interval and tempo targets for athletes across different distances.
        </P>
        <P>
          Outside racing, it helps with logistics. Walkers can work out how long a trail will take before the daylight runs out. Cyclists
          planning a charity ride can check whether a 100 km route fits into a morning. Triathletes can model the run leg after a long bike
          ride. Even someone commuting on foot can find out how fast they need to walk to catch a connection. In each case the question is
          the same: given what I know, what do I need to find out?
        </P>
      </Card>

      <Card title="Free, Private and Accurate">
        <P>
          The pace calculator is free to use, with no payment and no hidden charges. It does not require you to create an account or sign up
          before getting your result. You enter distances and times, not personal documents, so there is nothing sensitive to upload.
        </P>
        <P>
          On accuracy, the calculations use standard unit definitions, including the exact kilometer-to-mile ratio and official race
          distances, so the numbers match what a stopwatch and a calculator would give you. The results are only as good as the inputs, so
          use the true measured distance and your real time. For the best outcome, treat every projection as a planning tool, and combine it
          with how you actually feel in training.
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
