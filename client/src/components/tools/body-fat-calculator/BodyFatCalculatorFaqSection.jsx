import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How does a body fat calculator work?",
    a: "It turns body measurements into an estimated body fat percentage using a published equation. This one uses the U.S. Navy method (height, neck, waist, and hips for women).",
  },
  {
    q: "Is the Navy method accurate?",
    a: "It’s a decent estimate for most adults and usually lands within a few points of clinical tests. It’s less reliable for very lean or very high-fat people, and it works best for tracking change over time.",
  },
  {
    q: "What is a healthy body fat percentage?",
    a: "Roughly 8–19% for men and 21–33% for women, rising slightly with age. The calculator shows your ideal range for your age.",
  },
  {
    q: "What body fat percentage is considered obese?",
    a: "By ACE standards, 25% or more for men and 32% or more for women. These are descriptive categories, not diagnoses.",
  },
  {
    q: "Is a body fat calculator better than BMI?",
    a: "Usually, yes. BMI can’t separate muscle from fat, while waist and neck measurements reflect composition more closely.",
  },
  {
    q: "How often should I check my body fat?",
    a: "Every two to four weeks. Measure under the same conditions each time.",
  },
  {
    q: "Why are women’s body fat percentages higher than men’s?",
    a: "Women need more essential fat for hormonal and reproductive health, so healthy ranges run higher at every age.",
  },
  {
    q: "Can I use this calculator if I’m pregnant?",
    a: "No. Pregnancy changes waist and hip measurements for reasons unrelated to fat. Ask your healthcare provider.",
  },
  {
    q: "Do I need special equipment?",
    a: "Just a flexible tape measure and a scale.",
  },
  {
    q: "Can I have 0% body fat?",
    a: "No. Essential fat is required for survival, around 2–5% in men and 10–13% in women.",
  },
  {
    q: "Can I lose fat without losing weight?",
    a: "Yes. If you build muscle while losing fat, the scale may not move, but your body fat percentage drops.",
  },
  {
    q: "Do smart scales measure body fat accurately?",
    a: "They’re consistent enough for trends but affected by hydration. Weigh at the same time each day and watch weekly averages.",
  },
];

// The supplied FAQ schema words its questions and answers differently from the
// displayed FAQ, so it is kept verbatim here.
const FAQ_SCHEMA_ITEMS = [
  { q: "How does a body fat calculator work?", a: "It turns body measurements into an estimated body fat percentage using a published equation. This one uses the U.S. Navy method (height, neck, waist, and hips for women)." },
  { q: "Is the Navy method accurate?", a: "It is a decent estimate for most adults and usually lands within a few points of clinical tests. It is less reliable for very lean or very high-fat people, and it works best for tracking change over time." },
  { q: "What is a healthy body fat percentage?", a: "Roughly 8-19% for men and 21-33% for women, rising slightly with age. The calculator shows your ideal range for your age." },
  { q: "What body fat percentage is considered obese?", a: "By ACE standards, 25% or more for men and 32% or more for women. These are descriptive categories, not diagnoses." },
  { q: "Is a body fat calculator better than BMI?", a: "Usually yes. BMI cannot separate muscle from fat, while waist and neck measurements reflect composition more closely." },
  { q: "How often should I check my body fat?", a: "Every two to four weeks, measured under the same conditions each time." },
  { q: "Can I have 0% body fat?", a: "No. Essential fat is required for survival, around 2-5% in men and 10-13% in women." },
  { q: "Can I lose fat without losing weight?", a: "Yes. If you build muscle while losing fat, the scale may not move, but your body fat percentage drops." },
  { q: "Do smart scales measure body fat accurately?", a: "They are consistent enough for trends but affected by hydration. Weigh at the same time each day and watch weekly averages." },
  { q: "Can I use a body fat calculator if I am pregnant?", a: "No. Pregnancy changes waist and hip measurements for reasons unrelated to fat. Ask your healthcare provider." },
];

const ACE_HEADERS = ["Category", "Women", "Men"];
const ACE_ROWS = [
  ["Essential fat", "10–13%", "2–5%"],
  ["Athletes", "14–20%", "6–13%"],
  ["Fitness", "21–24%", "14–17%"],
  ["Average", "25–31%", "18–24%"],
  ["Obese", "32%+", "25%+"],
];
const IDEAL_HEADERS = ["Age", "Women", "Men"];
const IDEAL_ROWS = [
  ["20", "17.7%", "8.5%"],
  ["25", "18.4%", "10.5%"],
  ["30", "19.3%", "12.7%"],
  ["35", "21.5%", "13.7%"],
  ["40", "22.2%", "15.3%"],
  ["45", "22.9%", "16.4%"],
  ["50", "25.2%", "18.9%"],
  ["55", "26.3%", "20.9%"],
];

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
/** An outside source, opened in a new tab so this page stays open. */
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const CDC = "https://www.cdc.gov/obesity/adult-obesity-facts/index.html";
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>
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

export default function BodyFatCalculatorFaqSection() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is My Body Fat Percentage?">
        <P>
          Your body fat percentage is the share of your total weight that’s fat tissue. A 180-pound person at 20% body fat carries
          about 36 pounds of fat and 144 pounds of everything else: muscle, bone, organs, skin, and water. Put the calculator above
          to work with your height, neck, waist (and hips if you’re a woman), and weight, and you’ll have your number in a few
          seconds.
        </P>
        <P>
          That number beats the scale because two people at the same weight can look and feel completely different. One might sit
          at 14% and the other at 31%. The scale can’t tell them apart. Body fat percentage can.
        </P>
        <H3>If You Had to Guess, What Is My Body Fat Percentage?</H3>
        <P>
          Nobody can guess it accurately from a description, and that includes a trainer eyeballing you in a gym. Fat distribution,
          muscle size, and frame all throw off visual estimates. What I can say is that most people guess too low. People who carry
          weight in their midsection tend to underestimate, and people who’ve been lean their whole lives often overestimate. If
          you want a real estimate, take the five minutes to measure and use the calculator. A rough number with a known method
          beats a guess every time.
        </P>
      </Card>

      <Card title="What Is a Healthy Body Fat Percentage Range?">
        <P>
          There’s no single healthy number. It depends on your sex, your age, and your activity level. For general health, men
          usually land somewhere around 8–19% and women around 21–33%. Going below those ranges isn’t automatically better. Too
          little fat causes its own problems, which we’ll get to below.
        </P>
        <H3>ACE Body Fat Categories</H3>
        <P>
          The American Council on Exercise (ACE) publishes the classification most fitness sites use, and our calculator uses it
          too:
        </P>
        <DataTable headers={ACE_HEADERS} rows={ACE_ROWS} />
        <P>
          You can read ACE’s own explanation in their <Ext href="https://www.acefitness.org/acefit/healthy-living-article/60/112/what-are-the-guidelines-for-percentage-of-body-fat">body fat guidelines article</Ext>. Keep in mind these are labels, not diagnoses.
          “Athlete” doesn’t mean healthier than “Fitness,” and the bottom ranges are hard to hold for any length of time.
        </P>
        <H3>Ideal Body Fat Percentage by Age</H3>
        <P>
          Body fat naturally creeps up as we age, so a target that’s right for a 25-year-old isn’t the right one for a 50-year-old.
          The Jackson &amp; Pollock ideal values show the pattern well:
        </P>
        <DataTable headers={IDEAL_HEADERS} rows={IDEAL_ROWS} />
        <P>
          These are ideals, not cutoffs. Being a few points above or below isn’t a problem. A big, lasting gap, especially paired
          with a large waist, is worth bringing up with your doctor. Our calculator picks the matching age range automatically so
          you don’t have to hunt for it.
        </P>
        <H3>Is 40 Percent Body Fat Normal?</H3>
        <P>
          It’s common, but it isn’t healthy. For women, 40% is well into the obese range by ACE standards, though it sits close to
          the average that national U.S. surveys have recorded for women in past decades. For men, 40% is very high. “Common” and
          “normal for your health” aren’t the same thing. If you’re at 40%, you don’t need to panic. A drop of even 5 points tends
          to improve blood pressure, blood sugar, and cholesterol markers, and that’s a goal you can actually work with.
        </P>
      </Card>

      <Card title="How Do You Measure Body Fat Percentage?">
        <P>There are a lot of ways to do it, and they vary in cost, accuracy, and hassle.</P>
        <H3>What Is the Most Reliable Way to Measure Body Fat Percentage?</H3>
        <P>
          For everyday people, a DEXA scan is the most reliable option that’s easy to get. It’s a low-dose X-ray that splits your
          body into fat, lean tissue, and bone, and it’s usually accurate to within a few percentage points. Hydrostatic
          (underwater) weighing and the Bod Pod, which measures air displacement, are similar in accuracy. Research labs go a step
          further with multi-compartment models, but you won’t find those at the mall.
        </P>
        <P>
          Underwater weighing works because fat is less dense than lean tissue: about 0.9 kg per liter versus roughly 1.1 kg per
          liter. Once you correct for the air in your lungs, you can work out the density of your whole body and get your fat
          percentage from that. It’s accurate but not exactly convenient.
        </P>
        <H3>What Is the Easiest Way to Measure Your Body Fat Percentage Electronically?</H3>
        <P>
          A smart scale or a handheld bioelectrical impedance (BIA) device is the easiest, and a tape-based online calculator like
          this one is the cheapest. Both take under a minute. The scale wins on convenience, since you just step on it. The
          calculator wins because it doesn’t swing based on how much water you drank that morning.
        </P>
        <H3>How Do Body Weight Scales Calculate Body Fat Percent?</H3>
        <P>
          If you’ve ever wondered how some scales measure body fat just by standing on them, here’s what’s going on. Metal plates
          under your feet send a tiny, harmless electrical current up one leg and back down the other. Muscle and body water
          conduct that current easily. Fat doesn’t. The scale measures how hard it is for the current to get through (the
          impedance), then plugs that number, plus your height, age, and sex, into a built-in equation. Some models add hand grips
          or extra sensors for a more complete reading, and the same logic is how scales estimate muscle percentage.
        </P>
        <P>
          The catch is that it’s really a hydration meter in disguise. Drink a big glass of water, work out, eat a salty dinner, or
          step on right after a shower, and your reading can move several points without any real change in fat. For best
          results, weigh in at the same time each day, ideally in the morning, and look at weekly averages rather than any one
          reading. Barefoot, clean, dry feet matter too.
        </P>
        <H3>How Can I Measure Body Fat at Home?</H3>
        <P>You’ve got four realistic home options:</P>
        <List items={[
          ["Tape measure and a calculator.", "This is the Navy method, which is what the tool above uses."],
          ["Smart scale or handheld BIA.", "Quick, but sensitive to hydration."],
          ["Skinfold calipers.", "You pinch the skin at three to seven standard spots and measure the fold. It works in skilled hands, but it only captures the fat just under your skin, not the fat deeper inside your abdomen."],
          ["Photos and mirror checks.", "Not a measurement, but handy for tracking visible change alongside the numbers."],
        ]} />
        <P>
          Ultrasound can also estimate the layer of fat under the skin, but that’s clinic equipment. BMI-based formulas are the
          least reliable, since two people with the same BMI can have totally different amounts of fat.
        </P>
      </Card>

      <Card title="How This Body Fat Calculator Works">
        <P>
          The tool uses the U.S. Navy circumference method, built from equations developed at the Naval Health Research Center by
          Hodgdon and Beckett in 1984. The military wanted a way to screen personnel without fancy equipment, and a tape measure fit
          the bill. It’s still popular because it’s cheap, quick, and reasonably consistent.
        </P>
        <H3>The Measurements You Need</H3>
        <P>
          For men, it’s height, neck, and waist. Women add hips. Weight and age aren’t part of the core Navy equation, but the
          calculator uses weight to split your percentage into fat mass and lean mass, and it uses age to pick your ideal range.
        </P>
        <H3>How to Measure Your Neck, Waist, and Hips Correctly</H3>
        <P>
          Small mistakes matter here. Being off by half an inch (or about a centimeter) can shift your result by roughly a point.
          Measure first thing in the morning before you eat or drink, standing relaxed with your weight even on both feet. Use a
          soft, non-stretch tape, snug but not squeezing, and keep it level all the way around. A mirror helps.
        </P>
        <List items={[
          ["Neck:", "Just below the larynx (Adam’s apple), with the tape sloping slightly down toward the front. Don’t flare your neck or shrug."],
          ["Waist (men):", "At the level of the navel. Don’t suck your stomach in."],
          ["Waist (women):", "At the narrowest part of the torso. If there’s no clear narrow spot, use the navel level."],
          ["Hips (women only):", "Around the widest part, tape horizontal, feet together."],
          ["Height:", "Barefoot, standing straight against a wall."],
        ]} />
        <P>
          Take each measurement twice and average them. If you’re tracking progress, use the same tape, the same time of day, and
          the same landmarks every time. For the best results, measure to the nearest quarter inch (0.5 cm).
        </P>
        <H3>The Navy Formulas, for the Curious</H3>
        <P>You don’t need these to use the tool, but here they are. In inches:</P>
        <Formula>
          Men: Body fat % = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76<br />
          Women: Body fat % = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387
        </Formula>
        <P>Then the tool works out your mass breakdown:</P>
        <Formula>
          Fat mass = body fat % × weight<br />
          Lean mass = weight − fat mass
        </Formula>
        <P>
          The metric versions use different constants, but the idea is the same. These equations are built on population averages,
          so treat the output as an estimate. For tighter numbers, you’d need something like BIA, a DEXA scan, or hydrostatic
          testing.
        </P>
        <H3>The BMI-Based Formula</H3>
        <P>The second estimate our tool shows uses BMI (weight divided by height squared). For adults:</P>
        <Formula>
          Men: Body fat % = 1.20 × BMI + 0.23 × age − 16.2<br />
          Women: Body fat % = 1.20 × BMI + 0.23 × age − 5.4
        </Formula>
        <P>
          Separate equations exist for children, but body fat calculators like this one are meant for adults. If you’re calculating
          for a child or teen, let their pediatrician handle it.
        </P>
      </Card>

      <Card title="Understanding Your Results: Fat Mass, Lean Mass, and ACE Category">
        <P>You get more than one number back, and each one answers a different question.</P>
        <P>
          Fat mass is your weight times your body fat percentage. At 80 kg and 20%, that’s 16 kg of fat. Lean mass is the other
          64 kg. Watching these two separately tells you far more than watching weight alone. If your weight barely moves but your
          fat mass drops and lean mass rises, that’s body recomposition, and the scale would never show it.
        </P>
        <P>
          Your ACE category puts your percentage into the table above, and the ideal range compares you to your age group. Look at
          all of it together. A “Fitness” result with a big waist measurement tells a different story than a “Fitness” result with
          a trim one.
        </P>
      </Card>

      <Card title="Navy Method vs. BMI Method: Which One Should You Trust?">
        <P>
          BMI only needs height, weight, age, and sex, which makes it fast. But it can’t tell muscle from fat. A muscular lifter can
          read as overweight, and a person with little muscle and a lot of fat can look “normal.” Medical groups have been openly
          acknowledging BMI’s limits for years, and newer guidance on diagnosing obesity leans more on waist size and direct body
          fat measures alongside it.
        </P>
        <P>
          The Navy method uses actual dimensions, especially the waist, which tracks closely with abdominal fat. For most people,
          it’s the more personal estimate. If both numbers land close together, you can feel better about the result. If they’re
          far apart, the Navy figure is usually more meaningful for anyone who trains regularly. For a sedentary person of average
          build, the two tend to be closer.
        </P>
      </Card>

      <Card title="Body Fat Calculator for Men and Women">
        <P>
          Men and women store fat differently, so the equations aren’t interchangeable. Men usually put it on around the belly.
          Women tend to carry more in the hips, thighs, and chest. That’s why women enter a hip measurement and men don’t. Pick your
          sex accurately, because the wrong equation can throw the result off by several points.
        </P>
        <P>
          Hormones shift this over time. After about 40, and especially after menopause, lower sex hormones push fat toward the
          midsection in both sexes: the stomach for men, and more around the abdomen (on top of the hips and thighs) for women.
          Pregnancy and the months after childbirth also change how waist and hip measurements relate to actual fat, so this
          calculator isn’t suited for those periods.
        </P>
      </Card>

      <Card title="When Does Body Fat Start Showing? Abs and Body Fat Percentage">
        <P>
          This is the question behind a lot of searches. The short version: abs are there on everyone. Whether you can see them
          depends on how much fat sits on top.
        </P>
        <H3>What Body Fat Percentage Do You Need for Visible Abs?</H3>
        <P>Rough ranges, which vary by genetics and where your body stores fat:</P>
        <List items={[
          ["Men:", "Faint outlines show up around 14–15%. A clearly visible six-pack usually arrives between 10–12%. Sharp, deep lines tend to need 6–9%."],
          ["Women:", "Faint definition often shows around 20–22%. Clear abs usually need roughly 16–19%."],
        ]} />
        <H3>Can You See Abs at 20 Percent Body Fat?</H3>
        <P>
          For most men, no. At 20% you’re in the “Average” bracket, and the stomach tends to look soft, though some guys with
          unusually thick abs and a lean-looking midsection might see a hint when they flex. For women, 20% is the top of the
          athlete range, and you may see some definition depending on how your body stores fat.
        </P>
        <H3>Why the Mirror Test Isn’t Fair</H3>
        <P>
          Flexing and crunching down in the mirror can make faint abs pop, and lighting does a lot of work too. If you only see them
          when you’re tensed up in perfect light, you’re likely close to the threshold but not at a level you’d call visible
          day-to-day. Genetics matter as well: some people have uneven or staggered ab segments, and some store fat in their lower
          belly until they’re very lean.
        </P>
        <H3>Can You Have 0% Body Fat?</H3>
        <P>
          No. Zero body fat isn’t survivable. Essential fat cushions your organs, protects nerves, supports hormone production, and
          helps absorb vitamins. Men need roughly 2–5% and women 10–13% just to function. Anything near those floors is a medical
          issue, not a goal. Bodybuilders on stage might hit 5–8% (men) or 10–15% (women) for a few days, and they usually pay for
          it with poor sleep, low energy, and hormone crashes.
        </P>
        <H3>What About Athletes, Cristiano Ronaldo, and Bruce Lee?</H3>
        <P>
          Elite athletes in lean sports are often in the single digits to low teens for men. Ronaldo has been reported at around
          7%, though that’s from press reports rather than published data. The Bruce Lee “2% body fat” line is a legend, not a
          measurement. Nobody tested him with modern equipment, and a functioning human at 2% would be right at the edge of
          essential fat. He was clearly very lean, but treat the specific number as myth.
        </P>
      </Card>

      <Card title="Why Body Fat Matters: Purpose, Health Risks, and Hormones">
        <H3>What Is Body Fat for?</H3>
        <P>
          The scientific name is adipose tissue. Its main job is storing energy as lipids. It also insulates you, cushions your
          organs, and releases hormones. There are two types. Essential fat keeps you alive and supports reproduction. Storage fat
          is the extra you accumulate, either right under the skin (subcutaneous) or deeper inside the abdomen around your organs
          (visceral). When people say “body fat,” they usually mean storage fat, and some of that is useful too.
        </P>
        <H3>Complications of Too Much Body Fat</H3>
        <P>
          According to the <Ext href={CDC}>CDC</Ext>, roughly 4 in 10 U.S. adults have obesity, and the{" "}
          <Ext href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight">World Health Organization</Ext> treats it as a leading
          preventable health risk worldwide. Excess fat, particularly visceral fat, is linked to:
        </P>
        <List items={[
          ["Heart disease and stroke.", "Higher blood pressure, higher LDL (“bad”) cholesterol, and lower HDL (“good”) cholesterol."],
          ["Type 2 diabetes.", "Visceral fat contributes to insulin resistance, where your cells stop responding to insulin properly and blood sugar climbs."],
          ["Hormone imbalances.", "In women, high body fat can raise androgen levels, leading to acne, unwanted facial hair, and irregular cycles."],
          ["Pregnancy complications.", "Higher risk of premature birth and Cesarean delivery."],
          ["Sleep apnea, certain cancers, and lower quality of life.", ""],
        ]} />
        <P>
          Visceral fat is the troublemaker here. It releases inflammatory proteins called cytokines that can raise cardiovascular
          risk. This is why waist size is such a useful health marker.
        </P>
        <H3>How Body Fat Affects Metabolism and Hormones</H3>
        <P>
          Fat tissue is an active organ, not just storage. It makes leptin, which tells your brain you’ve got enough energy on
          board. It converts some testosterone into estrogen, so higher fat can lower testosterone in men. It also plays into
          insulin sensitivity and thyroid function.
        </P>
        <P>
          It goes both ways. Very low body fat drops leptin, slows down thyroid hormones, and in women can stop periods altogether.
          Your body reads very low fat as a famine signal and starts turning things down to save energy.
        </P>
        <H3>Downsides of Having Very Low Body Fat</H3>
        <P>
          People rarely hear this part. Going too lean can mean low testosterone or missed periods, weaker bones, more injuries,
          getting sick more often, feeling cold all the time, trouble sleeping, mood swings, poor recovery, and fertility problems.
          In sports medicine, the combination of too little fuel for too much training is called relative energy deficiency in
          sport (RED-S). If your result lands in the essential-fat range, talk to a doctor rather than treating it as a win.
        </P>
      </Card>

      <Card title="How Do I Reduce Body Fat Properly?">
        <P>
          The boring answer is also the right one: a modest, steady calorie deficit, enough protein, strength training, regular
          movement, and enough sleep. Here’s how to do each without wrecking yourself.
        </P>
        <H3>What’s the Fastest and Healthiest Way to Lose Body Fat?</H3>
        <P>
          Aim for losing about 0.5–1% of your body weight per week. That’s roughly 1–2 pounds a week for most people, which matches
          what the <Ext href={CDC}>CDC</Ext> suggests for lasting weight loss. Faster than that, and you start losing muscle, water, and energy. If you
          have a lot to lose, the first few weeks can go faster, and that’s fine. Just don’t turn it into a crash diet.
        </P>
        <H3>How Many Calories Are in a Gram of Body Fat?</H3>
        <P>
          Dietary fat has 9 calories per gram. Body fat tissue isn’t pure fat, since it also has some water and protein, so it works
          out to roughly 7 calories per gram, or about 7,700 calories per kilogram (the familiar “3,500 per pound”). Treat that as a
          rough guide. The old rule oversimplifies, because your metabolism slows a bit as you lose weight, so the real-world rate
          drops over time.
        </P>
        <H3>What Are the Most Effective Ways to Reduce Body Fat Through Diet?</H3>
        <List items={[
          ["Pick a moderate deficit.", "About 300–500 calories below maintenance is easier to hold than 1,000."],
          ["Eat enough protein.", "For most active adults, roughly 0.7–1 gram per pound of body weight (1.6–2.2 g/kg) helps protect muscle and keeps you full."],
          ["Build meals around whole foods.", <>Vegetables, fruit, beans, lean meats, fish, eggs, dairy, whole grains. The current <Ext href="https://www.dietaryguidelines.gov/">Dietary Guidelines for Americans</Ext> lean heavily on this.</>],
          ["Cut liquid calories first.", "Soda, sweet coffee drinks, juice, and alcohol add up fast and don’t fill you up."],
          ["Don’t ban whole food groups.", "What works is whatever you can keep doing for six months, not what looks strict on paper."],
        ]} />
        <P>
          There’s no single best weight loss diet. Mediterranean-style, higher-protein, and lower-carb approaches all work in
          studies when people stick to them. Adherence beats the label.
        </P>
        <H3>Does Dietary Fat Directly Turn Into Body Fat?</H3>
        <P>
          Not directly. Body fat comes from eating more energy than you burn, from any source. Dietary fat is calorie-dense, so it’s
          easy to overshoot with it, but you need some for hormones and vitamin absorption. Cutting it to near zero backfires.
        </P>
        <H3>Can I Lose Body Fat Without Losing Weight?</H3>
        <P>
          Yes, and it’s one of the best signs of progress. If you start lifting, eat enough protein, and stay in a small deficit,
          you can drop fat while gaining muscle. The scale barely budges, but your waist shrinks and your body fat percentage falls.
          That’s body recomposition. It’s most common in beginners, people returning after a break, and those with more fat to
          lose.
        </P>
        <H3>How Do I Keep Gaining Muscle While Reducing Body Fat? Can I Make Strength Gains While Cutting?</H3>
        <P>
          Yes, with the right setup. Lift heavy at least two to three days a week, keep the deficit small, hit your protein target,
          and sleep seven or more hours. Beginners often gain strength through an entire cut. More advanced lifters usually
          maintain strength and muscle, which is still a win. The CDC’s <Ext href="https://www.cdc.gov/physical-activity-basics/guidelines/adults.html">physical activity guidelines</Ext> recommend 150 minutes of
          moderate activity a week plus two days of strength work, which is a decent floor.
        </P>
        <H3>What Workouts Help Most?</H3>
        <P>
          Strength training first, since it protects muscle while you lose fat. Add walking, since a high daily step count burns
          calories without wearing you out. Then add a couple of cardio sessions, whichever style you’ll actually stick with.
          Running works because it burns a lot of calories per hour and it’s easy to scale, but it’s not magic and it’s rough on
          some joints. Cycling, swimming, and incline walking get you similar results.
        </P>
        <H3>What Are the Best Workouts for Going From 30% to 9% Body Fat?</H3>
        <P>
          Be realistic about this one. Say you weigh 200 pounds at 30%. You’re carrying 60 pounds of fat and 140 pounds of lean
          mass. To land at 9% while keeping all your muscle, you’d weigh around 154 pounds, so you’d need to lose about 46 pounds of
          pure fat. At a 500-calorie daily deficit, that takes well over a year, and the last few percent are the slowest.
        </P>
        <P>
          The plan that works: lift three to four days a week with progressive overload, walk 8,000–10,000 steps a day, add two or
          three cardio sessions, eat plenty of protein, and keep a moderate deficit. Also ask yourself whether 9% is the right goal.
          For many people it’s hard to hold, and a more moderate target, like 12–15% for men, might serve you better.
        </P>
        <H3>How Do Bodybuilders Cut Their Body Fat?</H3>
        <P>
          They run a long, controlled diet, usually 12–20 weeks, losing about 0.5–1% of body weight per week. Protein stays high,
          training stays heavy so muscle is kept, and cardio and daily steps go up gradually as the diet progresses. Some add short
          diet breaks or refeed days. The final few weeks involve water and carb manipulation that’s only meant for the stage.
          Their off-season body fat is quite different from their stage condition, and the extreme leanness isn’t meant to last.
        </P>
        <H3>Does Water Reduce Fat?</H3>
        <P>
          Not directly. Water has no calories, and drinking more doesn’t burn fat. But it helps in practical ways: swapping sugary
          drinks for water cuts calories, and a glass before meals can take the edge off hunger. Staying hydrated also keeps
          workouts feeling better.
        </P>
        <H3>Does Cutting Sugar in Tea Actually Help?</H3>
        <P>
          It can. A teaspoon of sugar is about 16 calories. Three cups a day with two teaspoons each is roughly 100 calories, which
          over a year is a real number if you don’t make it up elsewhere. It’s not a miracle, but it’s one of the easiest swaps you
          can make.
        </P>
        <H3>Does Eating Curd or Yogurt Burn Body Fat?</H3>
        <P>
          No food burns fat. Plain yogurt is a fine pick because it’s high in protein and filling, so it can help you stay in a
          deficit. Sweetened or flavored versions add sugar, and full-fat versions add calories, so it depends on the type and
          portion.
        </P>
        <H3>Can a Heating Pad Burn Body Fat?</H3>
        <P>
          No. You can’t melt fat with heat, and spot reduction isn’t a thing. Heat pads, sweat suits, and saunas make you lose
          water, which comes right back when you drink. Your body decides where fat comes off, and you can’t pick the spot.
        </P>
      </Card>

      <Card title="Belly Fat: Causes, Fixes, and Myths">
        <H3>What Causes Excess Belly Fat?</H3>
        <P>
          A calorie surplus is the biggest driver, but several things push fat toward the midsection: genetics, age, hormones
          (menopause, low testosterone), chronic stress and high cortisol, poor sleep, heavy drinking, and low activity.
          Medications and conditions like PCOS or thyroid problems can also play a role.
        </P>
        <H3>How Do I Reduce Belly Fat?</H3>
        <P>
          You can’t target it, but you can lower overall body fat, and belly fat usually goes with it. The same plan applies: a
          moderate deficit, protein, strength training, walking, and sleep. Visceral fat actually responds well to exercise, often
          faster than the subcutaneous fat you can pinch. Doing crunches alone won’t shrink your stomach, but they can strengthen
          the muscles underneath.
        </P>
        <H3>What’s the Quickest Way to Lose Belly Fat?</H3>
        <P>
          There’s no shortcut that holds up, but you can speed things along with a consistent deficit, more daily steps, regular
          lifting, and cutting alcohol. Waist size usually drops within a few weeks of doing this consistently.
        </P>
        <H3>How Do I Lose Belly Fat as a Woman?</H3>
        <P>
          The basics are the same, with a few extra notes. Hormone changes around perimenopause and menopause shift fat toward the
          belly, so strength training matters even more to protect muscle and bone. Women should avoid very low-calorie diets,
          since they can disrupt cycles and bone health. If you’ve got irregular periods, acne, or unusual hair growth along with
          belly fat, ask a doctor about PCOS or thyroid issues.
        </P>
        <H3>What Diet Should I Eat to Reduce Belly Fat?</H3>
        <P>
          Nothing special. Focus on fiber (vegetables, beans, oats), lean protein, minimal ultra-processed snacks, less alcohol, and
          fewer sugary drinks. Studies keep linking added sugar and heavy drinking to extra belly fat.
        </P>
        <H3>Which Food Is Good at Night for Weight Loss?</H3>
        <P>
          Pick something small, protein-forward, and not too heavy: plain Greek yogurt, cottage cheese, a hard-boiled egg, or a
          piece of fruit with a few nuts. Late-night eating isn’t evil by itself. It’s just easy to overdo it in front of the TV.
        </P>
        <H3>Does HIIT Help Reduce Belly Fat? What About Skipping Rope?</H3>
        <P>
          HIIT burns a lot in a short time and can help, but it’s not better than other cardio when total calories are equal. It’s
          also tougher on your body, so two sessions a week is plenty. Jumping rope works the same way: it burns a lot of calories
          per minute, but it won’t target the belly. Choose the one you’ll actually keep doing.
        </P>
        <H3>Does Rubbing Vicks on Your Belly Reduce Fat?</H3>
        <P>
          No. Vicks VapoRub is made for cough and congestion relief. The warming sensation doesn’t melt fat, and there’s no credible
          evidence that it slims anything. It’s also not meant to be spread over large areas of skin.
        </P>
        <H3>Is There a Way to Lose Belly Fat Without Surgery?</H3>
        <P>
          Yes, and for most people, lifestyle is the main answer. Some people also work with their doctors on prescription
          weight-loss medications, which are a big part of the conversation in 2027. A word of caution: those medications can cause
          muscle loss along with fat, so protein, resistance training, and tracking body composition matter even more. A body fat
          calculator is useful for catching that early. Talk to your doctor about whether they’re appropriate for you.
        </P>
        <H3>Are There Any Advantages to a Big Belly?</H3>
        <P>
          Not really. A small amount of abdominal fat is normal and protective, but a large belly, especially with a high waist
          measurement, signals higher visceral fat and higher health risk.
        </P>
      </Card>

      <Card title="Why Am I Not Losing Body Fat?">
        <H3>Why Am I Not Losing Body Fat Even When I’m Trying?</H3>
        <P>The usual suspects:</P>
        <List items={[
          ["The deficit isn’t real.", "People underestimate food intake by a lot, and weekend meals can erase a weekday deficit."],
          ["Not enough protein or lifting.", "Without them, a deficit can cost you muscle."],
          ["Poor sleep and high stress.", "Both raise hunger and make sticking to a plan harder."],
          ["Water fluctuations.", "Salt, hormones, and hard workouts can mask fat loss for a week or two."],
          ["Measuring too often.", "Daily changes are mostly noise."],
          ["A medical factor.", "Thyroid issues, PCOS, certain medications, and insulin resistance can slow progress."],
        ]} />
        <P>Give it three to four weeks of consistent tracking before changing your plan, and see a doctor if nothing moves.</P>
        <H3>Why Am I Losing Weight but Not Body Fat?</H3>
        <P>
          Because weight includes more than fat. Crash diets drop water, glycogen, and muscle. If your weight is falling quickly but
          your body fat percentage isn’t budging, you’re probably losing muscle. Slow down, raise protein, and add strength
          training. Track fat mass and lean mass in the calculator, because those two numbers tell the story the scale can’t.
        </P>
        <H3>Can I Lose Weight Quickly, and Does Water Intake Help?</H3>
        <P>
          The safe version of “quickly” is 1–2 pounds a week. Drinking more water helps a little, mostly by replacing higher-calorie
          drinks and making you feel fuller. It isn’t a fat-loss trick on its own.
        </P>
      </Card>

      <Card title="When You Might Need a Body Fat Calculator">
        <P>People use it for plenty of reasons:</P>
        <List items={[
          ["Starting a fat-loss plan.", "A baseline helps you see whether the plan is working when the scale stalls."],
          ["Building muscle.", "To check whether weight gain is mostly lean mass or fat."],
          ["Looking past BMI.", "Lifters and athletes often get misleading BMI categories."],
          ["Setting calories and macros.", "Lean mass is a better base for nutrition math than total weight."],
          ["Monitoring health over time.", "Waist and body fat can creep up before the scale does."],
          ["Tracking progress on GLP-1 medications.", "To make sure you’re losing fat and not just muscle."],
          ["Fitness assessments.", "Trainers use quick circumference-based estimates for check-ins."],
        ]} />
      </Card>

      <Card title="How Accurate Is an Online Body Fat Calculator?">
        <P>
          It’s an estimate, and you should treat it like one. No tape-based calculator matches DEXA or hydrostatic weighing. The
          Navy method usually comes within a few percentage points of reference methods for the average adult, but it can miss by
          more for very lean athletes, people with very high body fat, or anyone with an unusual build or fat distribution. The
          estimated error for BMI-based methods is larger.
        </P>
        <P>
          No calculator replaces a doctor’s visit, and no result is a diagnosis. It can flag when your body fat is far outside the
          recommended range, but a slight difference from the “ideal” isn’t a reason to worry. The real value of this tool is
          tracking. Measure the same way every two to four weeks, and the direction of change tells you more than any single
          reading.
        </P>
      </Card>

      <Card title="Free, Private, and Easy to Use">
        <P>
          This body fat calculator is free to use. You enter a few numbers, not files, so there’s nothing to download or install,
          and results show up instantly on the page.
        </P>
      </Card>

      <Card title="Setting Realistic Goals From Your Results">
        <P>
          Once you’ve got your number, don’t chase the lowest category. Sustainable fat loss is slow, and aggressive cuts usually
          cost muscle. Combine resistance training, enough protein, a modest deficit, and decent sleep. Recheck your measurements
          every few weeks, not every day, since water, salt, and digestion move the numbers around. If you’ve got a medical
          condition, take medication that affects weight, or you’re aiming for a very low target, bring a healthcare professional
          in.
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
