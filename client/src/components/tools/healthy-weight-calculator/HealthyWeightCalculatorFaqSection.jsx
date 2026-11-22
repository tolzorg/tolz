import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a healthy weight for my height?",
    a: "A healthy weight is the range that gives a BMI between 18.5 and 25. At 5 ft 7 in (about 170 cm), that is roughly 118 to 159 pounds (53.6 to 72.4 kg). Enter your own height in the healthy weight calculator for your exact range.",
  },
  {
    q: "How do you calculate healthy weight from height?",
    a: "Multiply 18.5 and 25 by your height in meters squared to get the lower and upper limits in kilograms. In pounds, multiply by your height in inches squared and divide by 703.",
  },
  {
    q: "Is BMI 25 healthy?",
    a: "A BMI of exactly 25 is the top edge of the healthy range and where overweight begins. It is not a medical problem by itself. Waist size, fitness and blood markers give more context.",
  },
  {
    q: "What are the BMI ranges for underweight, overweight and obesity?",
    a: "Underweight is below 18.5, healthy is 18.5 to 24.9, overweight is 25 to 29.9, obesity class I is 30 to 34.9, class II is 35 to 39.9 and class III is 40 or higher.",
  },
  {
    q: "Is a healthy weight the same for men and women?",
    a: "The BMI range is the same for adult men and women. Body fat and frame size differ, though, so two people with the same BMI can look and feel different.",
  },
  {
    q: "Can I be healthy at a weight outside the range?",
    a: "Sometimes. Athletes and very muscular people may have a high BMI with low body fat. Because BMI is a screening tool, check your waist size and ask a doctor if you’re unsure.",
  },
  {
    q: "Does the calculator work for children or teenagers?",
    a: "No. It is for adults. Children and teens are assessed with BMI-for-age percentiles, so use a pediatric growth chart or ask a pediatrician.",
  },
  {
    q: "How much weight should I lose per week?",
    a: "The CDC says about 1 to 2 pounds (0.5 to 1 kg) per week is a healthy pace for most people. Faster loss is harder to keep off and should only happen under a doctor’s care.",
  },
  {
    q: "Is a BMI of 19 healthy?",
    a: "Yes. A BMI of 19 is in the healthy range, near the lower end. If you want to lose weight at this BMI, talk to a doctor first, since losing more could move you into underweight.",
  },
  {
    q: "Is a healthy weight calculator accurate?",
    a: "The math is exact and the BMI categories are widely accepted. How well it reflects your health depends on your body composition, so use it as a guide, not a diagnosis.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const CATEGORY_HEADERS = ["Category", "BMI", "Weight at 5 ft 7 in"];
const CATEGORY_ROWS = [
  ["Underweight", "Below 18.5", "Under 118 lb"],
  ["Healthy weight", "18.5 to 24.9", "118 to 159 lb"],
  ["Overweight", "25 to 29.9", "160 to 191 lb"],
  ["Obesity class I", "30 to 34.9", "192 to 223 lb"],
  ["Obesity class II", "35 to 39.9", "224 to 255 lb"],
  ["Obesity class III", "40 and above", "256 lb and up"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
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

export default function HealthyWeightCalculatorFaqSection() {
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

      <Card title="What Is a Healthy Weight?">
        <P>
          A healthy weight is a weight at which your body works well and your risk of weight-related health problems is low. Doctors
          usually measure it with <Link to="/tools/bmi-calculator" className="inline-home-link">body mass index</Link> (BMI), a number that compares your weight to your height. For adults, a BMI from
          18.5 to 24.9 is called a healthy weight. Below 18.5 is underweight, 25 to 29.9 is overweight, and 30 or higher is obesity.
        </P>
        <P>
          A healthy weight is not one exact number. At any height, it covers a spread of many pounds. For an adult who is 5 ft 9 in
          tall, the CDC lists a healthy range of roughly 125 to 168 pounds. Anywhere inside that span counts as healthy by BMI, which
          is why this healthy weight calculator gives you a range instead of a single target.
        </P>
      </Card>

      <Card title="What Does a Healthy Weight Mean, and How Do I Know If I Am at One?">
        <P>
          In practical terms, a healthy weight means your weight is not raising your risk of conditions like type 2 diabetes, high
          blood pressure, heart disease or joint problems, and it is not so low that it weakens your body. To find out where you
          stand, take three steps. First, measure your height without shoes. Second, enter it in the calculator to get your range.
          Third, step on a scale and see which category your weight falls into.
        </P>
        <P>
          The number is only part of the answer. Your waist size, blood pressure, blood sugar, cholesterol, energy level and fitness
          matter too. If your weight is in the healthy range but those numbers are off, or if your weight is slightly outside the
          range but everything else looks good, your doctor can help you make sense of it.
        </P>
      </Card>

      <Card title="Is a Healthy Weight the Same for Everyone?">
        <P>
          The BMI cutoffs are the same, but the weight is not. For adults, the CDC applies the same BMI categories regardless of age,
          sex or race, so the calculation is identical for everyone. What changes from person to person is the weight that fits your
          height, and how your body carries it.
        </P>
        <P>A few things explain why two people with the same BMI can look and feel very different:</P>
        <List items={[
          ["Sex:", "Women usually carry more body fat than men at the same BMI."],
          ["Age:", "Body fat tends to rise and muscle tends to fall as we get older, even when the scale doesn’t move. Some doctors accept a slightly higher BMI in adults over 65 because extra reserves help during illness."],
          ["Frame and muscle:", "Someone with a large frame or a lot of muscle may be healthy near the top of the range. Someone with a small frame may feel best near the bottom."],
          ["Ethnicity:", "The World Health Organization notes that people of Asian descent can face higher health risks at lower BMI values, and many Asian health guidelines use 23 instead of 25 as the point where risk starts to climb. If that applies to you, take the top of the range with extra care."],
        ]} />
        <P>
          This calculator is for adults. Children and teens are measured with BMI-for-age percentiles instead, so ask a pediatrician
          or use a growth chart for anyone under 20. Pregnancy is also different, and your doctor will give you weight gain guidance
          for that.
        </P>
      </Card>

      <Card title="What Is the Healthy Weight BMI Range for a Pear Body Type?">
        <P>
          A pear <Link to="/tools/body-type-calculator" className="inline-home-link">body type</Link> carries more weight in the hips, thighs and buttocks than in the belly. The healthy BMI range for a pear
          shape is the same as for everyone else: 18.5 to 24.9. BMI only uses height and weight, so it can’t tell where your body
          stores fat, and there is no separate chart for pear, apple or hourglass shapes.
        </P>
        <P>
          Where pear shapes do differ is in risk. Fat stored on the hips and thighs is generally less tied to heart disease and
          diabetes than fat around the abdomen. That is good news, but it doesn’t make a BMI above 25 harmless. If you are a pear,
          use the calculator to find your range, then check your waist-to-hip ratio as a second look. The WHO flags a ratio above
          0.90 for men and 0.85 for women as higher risk. To find yours, measure around your natural waist and around the widest
          part of your hips, then divide the waist number by the hip number. For someone who is 5 ft 5 in, the healthy range works
          out to about 111 to 150 pounds, no matter whether they carry weight in the hips or the waist.
        </P>
      </Card>

      <Card title="How the Healthy Weight Calculator Works">
        <P>
          Every result comes from the body mass index formula: BMI equals weight in kilograms divided by height in meters squared. A
          healthy weight calculator runs that formula backward. Since BMI = weight ÷ height², weight = BMI × height². The tool
          squares your height and multiplies by 18.5 to get the lowest healthy weight, then by 25 to get the highest. In pounds and
          inches, the same idea uses the number 703: weight in pounds = BMI × height in inches² ÷ 703.
        </P>
        <P>
          Here is a worked example. For someone who is 5 ft 7 in (67 inches, about 170 cm), the healthy range is about 118 to 159
          pounds (53.6 to 72.4 kg). Below 118 pounds, BMI falls under 18.5. At 160 pounds and above, it passes 25. Nothing is
          guessed. It is plain arithmetic, so the same height always gives the same range.
        </P>
      </Card>

      <Card title="Healthy Weight Range for Your Height: BMI Categories at a Glance">
        <P>
          These cutoffs match the adult BMI categories published by the{" "}
          <Ext href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">CDC</Ext>. The last column shows what each
          category looks like for a person who is 5 ft 7 in tall.
        </P>
        <DataTable headers={CATEGORY_HEADERS} rows={CATEGORY_ROWS} />
        <P>
          Your healthy weight range is the band from 18.5 to 24.9. It is a range, not a target. Being anywhere inside it is a good
          sign. Sitting right at the top or bottom is a reason to look at other health markers, not a verdict.
        </P>
      </Card>

      <Card title="Underweight, Overweight and Obesity Class Weights Explained">
        <P>
          Most calculators stop at the healthy range. This one also lists where each category begins, so you can see how far you are
          from a line. If you weigh 150 pounds and the overweight line for your height is 160, you know you have a 10-pound cushion.
          If you weigh 165, you can see how much separates you from the healthy zone.
        </P>
        <P>
          Underweight matters as much as being overweight. A BMI below 18.5 can go along with nutrient gaps, a weaker immune system,
          bone loss and fertility problems, and it sometimes points to an underlying condition. Overweight and obesity are linked to
          a higher risk of type 2 diabetes, high blood pressure, heart disease and joint strain. The obesity classes exist because
          risk is not flat. Class III carries much more health risk than class I, and doctors use the classes to decide how much
          care someone needs. The classes also give you milestones. Moving from class II to class I is real progress, even when the
          healthy range is still a way off.
        </P>
      </Card>

      <Card title="Healthy Weight Calculator in Pounds and Kilograms">
        <P>
          This healthy weight calculator works in both pounds and kilograms, so you don’t have to convert anything yourself. Pick the
          unit that matches your scale and read your range in the same unit. If you need to compare with a medical record that uses
          the other unit, remember that one kilogram equals about 2.2 pounds.
        </P>
        <P>
          For the best result, measure your height without shoes, standing straight against a wall. Height is squared in the
          formula, so even a one-inch error moves the range by a couple of pounds. Weigh yourself separately, ideally in the morning
          before eating and in light clothing, then compare that number with your range. Enter your height, select your unit and run
          the calculation. You’ll see your healthy range first, followed by the weights where underweight, overweight and obesity
          classes I, II and III begin. Run it again anytime your height changes or when you want to check someone else.
        </P>
      </Card>

      <Card title="When and Why You Would Use a Healthy Weight Calculator">
        <P>People use a healthy weight calculator for many reasons besides losing weight:</P>
        <List items={[
          ["Setting a realistic goal.", "Many people pick a goal weight from memory, like what they weighed at 21. A height-based range shows whether that goal makes sense or whether a closer target would already put you in the healthy zone."],
          ["Gaining weight safely.", "If you are underweight, recovering from an illness or struggling to add muscle, the lower end of your range gives you a clear minimum to aim for."],
          ["Starting a fitness plan.", "Before a new training or nutrition plan, it helps to have a baseline to measure against."],
          ["Health forms and checkups.", "Insurance, medical and fitness forms often ask about your BMI category, and it’s easier to answer when you already know it."],
          ["Checking goals you found online.", "Social media targets and “ideal weight” formulas often land outside the healthy range. The calculator gives you a neutral, evidence-based reference."],
        ]} />
      </Card>

      <Card title="Limits of BMI: Healthy Weight but Still Looking Soft or Heavy">
        <P>
          BMI is a screening tool, not a diagnosis. It can’t tell muscle from fat, which is why a very muscular athlete can land in the
          overweight range with low <Link to="/tools/body-fat-calculator" className="inline-home-link">body fat</Link>. It also can’t tell where fat is stored.
        </P>
        <P>
          The reverse happens too. It is completely possible to have a healthy BMI and still look soft or carry extra fat, especially
          around the middle. Doctors sometimes call this normal weight with high body fat. It usually comes from low muscle mass,
          little physical activity, poor sleep or a diet heavy in processed food. Two people can weigh the same and look very
          different because one has more muscle and the other has more fat.
        </P>
        <P>
          If this sounds like you, don’t chase a lower number on the scale. Strength training two or three days a week, enough
          protein, regular walking and better sleep will change your body composition without changing your BMI much. Measuring your
          waist gives a useful check: health organizations flag a waist above about 40 inches (102 cm) for men and 35 inches (88 cm)
          for women as higher risk. A doctor or trainer can also estimate body fat percentage if you want a closer look. Treat your
          BMI result as a strong starting point that works best alongside waist size, blood pressure, blood tests and a talk with
          your doctor.
        </P>
      </Card>

      <Card title="What Exactly Is Healthy Weight Loss?">
        <P>
          Healthy weight loss means losing body fat at a steady pace through habits you can keep, without harming your health along
          the way. The CDC says people who lose weight gradually, about 1 to 2 pounds (0.5 to 1 kg) per week, are more likely to keep
          it off than people who lose it fast. Healthy weight loss doesn’t mean cutting out whole food groups, skipping meals or
          relying on pills and teas.
        </P>
        <P>
          Warning signs that you are losing weight the wrong way include constant tiredness, dizziness, hair loss, feeling cold all
          the time, extreme hunger and losing more than 2 pounds a week for several weeks in a row. Fast loss also tends to come back
          quickly. The only usual exception is weight loss supervised by a doctor.
        </P>
      </Card>

      <Card title="What’s a Healthy Weight Loss Option?">
        <P>
          The option with the strongest track record is a moderate calorie reduction combined with more physical activity, built
          around foods you actually like. In practice, that means slightly smaller portions, more vegetables, lean protein and fiber,
          fewer sugary drinks and regular walking or exercise.
        </P>
        <P>
          If your BMI is 30 or higher, or you have a condition like type 2 diabetes or high blood pressure, ask your doctor about
          stronger support. That might include a registered dietitian, a structured program, or in some cases medication or surgery.
          Stay away from crash diets, detox products and any plan that promises very fast results.
        </P>
      </Card>

      <Card title="What Are the Best Ways to Lose Weight?">
        <P>
          Three things do most of the work: eat a little less than your body burns, move regularly, and keep going long enough for it
          to matter. Everything else is detailed. The best plan is the one you can follow for months, not the strictest one you can
          survive for two weeks. Add strength training so you lose fat rather than muscle, and give yourself some flexibility so one
          off day doesn’t turn into an off month.
        </P>
      </Card>

      <Card title="How Can I Achieve Healthy Weight Loss?">
        <P>
          Start by finding your healthy weight range with the calculator and noting how far you are from the top of it. Then change
          one or two habits at a time instead of overhauling your whole life. Weigh yourself about once a week, look at the trend over
          a few weeks, and adjust only if the scale stalls. Most people do better with small changes they repeat than with big
          changes they abandon.
        </P>
      </Card>

      <Card title="What Are 10 Steps to a Pleasant and Healthy Weight Loss?">
        <List ordered items={[
          ["Set a realistic goal.", "Aim for the upper end of your healthy range first, not the lowest number in it."],
          ["Start with a small calorie cut.", "About 500 fewer calories a day leads to roughly 1 pound a week for many people."],
          ["Build meals around protein and vegetables.", "They keep you full longer than refined carbs and sweets."],
          ["Cut liquid calories.", "Soda, juice, sweet coffee drinks and alcohol add up fast and don’t fill you up."],
          ["Aim for 150 minutes of moderate activity a week.", "Brisk walking counts."],
          ["Lift or use resistance bands twice a week.", "Muscle helps protect your metabolism."],
          ["Sleep at least seven hours.", "Short sleep raises hunger and cravings."],
          ["Track something.", "A weekly weigh-in or a few weeks of food logging shows patterns you can’t see by memory."],
          ["Plan for slip-ups.", "One big dinner doesn’t undo progress. Go back to your normal routine at the next meal."],
          ["Get support.", "A friend, a group, a dietitian or your doctor makes it easier to stay on track."],
        ]} />
      </Card>

      <Card title="What Are the Benefits of Healthy Weight Loss?">
        <P>
          Even modest weight loss helps. Losing 5 to 10 percent of your body weight can lower blood pressure, blood sugar and
          cholesterol. For a 200-pound person, that is 10 to 20 pounds. Many people also notice less joint pain, easier breathing,
          better sleep, more energy and an easier time moving through the day. You don’t have to reach the healthy range to see
          benefits, which is a good reason to celebrate smaller milestones along the way.
        </P>
      </Card>

      <Card title="How Long Should Healthy Weight Loss Take?">
        <P>
          At 1 to 2 pounds per week, you can expect about 4 to 8 pounds a month. That means 12 to 24 pounds over three months and
          roughly 50 to 100 pounds over a year, though most people slow down as they get lighter. The first week or two often shows
          faster results because of water weight, and plateaus are normal. If you are 30 pounds above the top of your healthy range,
          plan on several months, not several weeks. Slower loss is easier on your body and more likely to last.
        </P>
      </Card>

      <Card title="How Do You Calculate Healthy Weight Loss Per Week?">
        <P>
          Use this simple method. Subtract your goal weight from your current weight, then divide by a weekly rate of 1 to 2 pounds
          (0.5 to 1 kg). For example, a person who is 5 ft 7 in and weighs 190 pounds has a healthy range topping out at 159 pounds.
          That is about 31 pounds to lose. At 1 pound a week it takes around 31 weeks, and at 2 pounds a week about 15 weeks. In
          metric, someone who weighs 86 kg and wants to reach 72 kg has 14 kg to lose, which takes roughly 15 to 30 weeks at 0.5 to 1
          kg per week.
        </P>
        <P>
          A common rule says one pound of body fat equals about 3,500 calories, so a 500-calorie daily gap leads to about 1 pound a
          week. It is only an estimate, because your body adjusts as you lose weight. Use it to plan, then let your real progress
          guide you.
        </P>
      </Card>

      <Card title="How Do You Maintain a Healthy Body Weight?">
        <P>
          Maintenance comes down to the same habits that helped you get there, practiced at a level you can keep for years. Eat
          mostly whole foods, keep portions reasonable, move most days, sleep well and manage stress. Weigh yourself weekly so small
          gains don’t turn into big ones. Most people who keep weight off stay active and keep paying attention to what they eat,
          rather than going back to old routines.
        </P>
      </Card>

      <Card title="What Is the Importance of Maintaining a Healthy Weight?">
        <P>
          Staying in a healthy range lowers your risk of type 2 diabetes, heart disease, high blood pressure, stroke, sleep apnea and
          several cancers. It also protects your joints, since every extra pound adds load to your knees and hips. On the other side,
          staying out of the underweight range protects your bones, immune system and energy. Weight is one of the few risk factors
          you can influence every day.
        </P>
      </Card>

      <Card title="What Are the Reasons to Maintain a Healthy Weight?">
        <P>
          Beyond lab numbers, there are everyday reasons. You’ll likely have more energy, move more easily, sleep better and recover
          faster from illness or surgery. Fertility and pregnancy tend to go more smoothly at a healthy weight. As you age, staying
          active and in range makes it easier to keep your independence. Some people also find they spend less on health care and
          feel more confident doing the things they enjoy.
        </P>
      </Card>

      <Card title="What Is a Good Strategy for Achieving and Maintaining a Healthy Body Weight?">
        <P>
          Think of it in four parts. First, know your range and pick a target inside it. Second, change your habits slowly so each
          one sticks. Third, set a trigger point once you arrive. For example, decide that if you gain 3 to 5 pounds, you’ll tighten
          up your routine for a few weeks. Fourth, review every few months and adjust for life changes like a new job, an injury or a
          move. A strategy that includes some flexibility will outlast one that depends on being perfect.
        </P>
      </Card>

      <Card title="Do Women at a Healthy Weight Have to Work Hard to Maintain It?">
        <P>
          Not necessarily. Most women at a healthy weight keep it with ordinary habits rather than strict dieting: regular meals,
          daily movement, enough sleep and some strength work. That said, hormones, pregnancy, perimenopause and menopause can change
          how the body stores fat, and muscle naturally declines with age. Those shifts don’t mean you have to work harder than
          anyone else. They mean it helps to keep strength training and daily activity in your routine, and to expect that what
          worked at 25 may need small adjustments at 45.
        </P>
      </Card>

      <Card title="Recovering From an Eating Disorder and Reaching a Healthy Weight">
        <P>
          Recovery from an eating disorder is about restoring regular eating, physical health and a calmer relationship with food and
          your body. It is not about staying thin. A healthy weight in recovery is decided with your treatment team, which usually
          includes a doctor, a therapist and a dietitian, and it may not match a standard BMI chart.
        </P>
        <P>
          If you are in treatment or in recovery, don’t use this or any calculator to set weight targets on your own. Let your care
          team guide the numbers, and focus on regular meals, rest and support. If you or someone you know needs help, talk to a
          doctor or reach out to the National Alliance for Eating Disorders helpline.
        </P>
      </Card>

      <Card title="Is It Normal to Want to Lose Weight at a Healthy Weight (BMI 19)?">
        <P>
          Wanting to lose weight at a BMI of 19 is common, but it isn’t a medical need. A BMI of 19 sits inside the healthy range,
          close to the lower end. Losing more could push you toward being underweight, which carries its own health risks. Many
          people feel pressure from social media, friends or past comments about their body, and that can make a healthy weight feel
          like too much.
        </P>
        <P>
          It helps to ask what you want to change. If the goal is feeling stronger or more toned, strength training and good
          nutrition will do more than losing weight. If you often feel anxious about food, skip meals to control your weight or can’t
          stop thinking about your body, talk to a doctor or a mental health professional. Those are signs worth taking seriously,
          whatever the scale says.
        </P>
      </Card>

      <Card title="Free, Private and Reliable">
        <P>
          This healthy weight calculator is free to use, with no hidden charges. It asks only for your height and preferred unit, not
          your name, email or medical history. The calculation is a standard formula based on internationally recognized BMI cutoffs,
          so the results are consistent and easy to check by hand using the method above. Health information is personal, so share
          only what a calculation needs, and rely on your doctor for medical decisions.
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
