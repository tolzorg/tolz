import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What is a body type calculator?", a: "A body type calculator is an online tool that finds your body shape from your measurements, usually bust, waist, and hips. This one also uses your high hip and gives you your waist-hip ratio." },
  { q: "What is meant by body shape?", a: "Body shape is the outline your body makes, based on how your bust, waist, and hips compare in size. It is about proportion, not weight, so people of very different sizes can share the same shape." },
  { q: "Is body type the same as body shape?", a: "Not exactly. Body shape describes your outline, such as hourglass or rectangle. Body type is often used in fitness to describe build, such as ectomorph or endomorph. This calculator works with shape." },
  { q: "How do I know what body shape I have?", a: "Measure your bust, waist, high hip, and hip with a soft tape, enter the numbers into the calculator, and read the result. Guessing from a mirror is unreliable because posture, lighting, and clothing change how you look." },
  { q: "How do I measure my bust, waist, and hips?", a: "Stand straight with your arms at your sides. Measure around the fullest part of your chest for the bust, the narrowest part of your torso for the waist, the upper curve of your hips for the high hip, and the widest part of your hips and buttocks for the hip. Keep the tape snug but not tight." },
  { q: "What is meant by bust size?", a: "Bust size is the full distance around your chest at its fullest point, with the tape level across your back. It is not the same as your bra size, which combines a band number and a cup letter." },
  { q: "What does waist size mean?", a: "Waist size is the distance around your natural waist, which is the narrowest part of your torso, usually just above the belly button. It is not always the same as the waist size on a pair of pants, since pants often sit lower and run larger than the label." },
  { q: "What is meant by high hip?", a: "The high hip is the upper part of your hips, where the hip bones start to curve outward. It sits about 4 to 7 inches (10 to 18 cm) below your natural waist. The calculator uses it to tell a spoon shape from a bottom hourglass." },
  { q: "How do I find my hip size without a tape measure?", a: "Wrap a piece of string or a ribbon around the widest part of your hips and buttocks. Mark where it meets, lay it flat, and measure it with a ruler. A cloth tape is more accurate, but this method gives a close estimate." },
  { q: "What is the real pant size: hip size or waist size?", a: "It depends on the cut, but fit usually comes down to whichever measurement is larger relative to the garment. If your hips are much bigger than your waist, buy for the hips and have the waist taken in by a tailor." },
  { q: "What are the different female body shapes?", a: "This tool sorts results into hourglass, top hourglass, bottom hourglass, spoon, triangle, inverted triangle, and rectangle. Other sources use names like apple, pear, or banana for similar patterns." },
  { q: "What is the most common body shape?", a: "In a 2005 North Carolina State University study of more than 6,000 women, the rectangle (banana) shape was the most common at about 46%. The hourglass was the least common at about 8%." },
  { q: "Is there an ideal body shape for men and women?", a: "No. Ideals change with culture and era, and no single shape is the right one. For health, waist size and fat distribution matter more than the name of your shape." },
  { q: "Is there an ideal body shape for young vs. old people?", a: "Bodies change with age, so the same standard does not fit every stage of life. After menopause, many women store more fat around the abdomen, which raises the waist-hip ratio. In older adults, staying active and keeping waist size in check matters more than matching a shape." },
  { q: "Which is the least desirable body shape for women?", a: "None. Every shape is a normal variation, and ideas about what is desirable come from fashion trends, not from health. The only distinction with real medical meaning is extra abdominal fat, which can affect a person of any shape." },
  { q: "What body shape is the most attractive?", a: "It depends on the person and the culture. Some studies link a lower waist-hip ratio to perceived attractiveness, but results vary across cultures and time periods, and personal taste matters more than any ratio." },
  { q: "What is attractive about the hourglass figure?", a: "The hourglass is associated with a low waist-hip ratio, and some research has linked that ratio to perceived attractiveness. Fashion and media have also promoted it as a standard for decades. It is an appearance preference, not a measure of health or worth." },
  { q: "Is the hourglass figure more common in one race than another?", a: "Average body shape and fat distribution can differ between groups, but the differences are small compared with the variation within each group. Genetics, hormones, diet, and activity all play a part, so it is not accurate to assign a shape to an ethnicity." },
  { q: "Why do many Latina women have curvaceous body shapes?", a: "Some women of Latin American ancestry do tend to store more fat around the hips and thighs, which is influenced by genetics and hormones. But this is an average, and body shapes vary widely among Latina women just as they do in every group." },
  { q: "Why do American and East Asian body shapes differ?", a: "Average body size, frame, and lifestyle differ between populations. In the U.S., average body weight is higher than in many East Asian countries, while some Asian groups carry more abdominal fat at a lower weight. These are averages and say little about any one person." },
  { q: "Why does body shape matter?", a: "It matters mainly for clothing fit, and it can hint at where your body stores fat. Fat stored around the abdomen is linked to higher health risk than fat stored on the hips and thighs." },
  { q: "Why is there more variation in female body shape than male body shape?", a: "Hormones are a major reason. Estrogen promotes fat storage in the hips, thighs, and buttocks, and women’s pelvic structure also varies more. Men more often store fat around the abdomen, so their shapes tend to look more alike." },
  { q: "Are body shapes natural?", a: "Yes. Your shape is largely determined by your bone structure, genetics, and hormones. Diet and exercise can change your measurements, but not the underlying frame." },
  { q: "Is body shape inherited?", a: "Largely, yes. The width of your shoulders, ribcage, and pelvis is inherited, and so is much of your tendency to store fat in certain places. That is why body shapes often run in families." },
  { q: "Will my body shape change as I grow?", a: "Yes. Puberty, weight changes, muscle gain, pregnancy, and menopause can all shift your proportions. The result is most reliable for adults, since teenagers’ bodies are still changing." },
  { q: "Can exercise change my body shape?", a: "It can change your measurements and muscle tone, but not your bone structure. You also can’t choose where fat comes off. Strength training can reshape your outline by building muscle in areas like the shoulders and glutes." },
  { q: "Can weight loss guarantee a certain body shape?", a: "No. Weight loss can lower your waist and change your ratios, but it will not turn one shape into another. Your frame and fat distribution pattern stay largely the same." },
  { q: "What are some good exercises for a “perfect” body shape?", a: "There is no perfect shape, but a balanced routine works well for most people: strength training two to three times a week, regular cardio, and daily movement like walking. Squats, lunges, rows, and overhead presses cover the major muscle groups." },
  { q: "How can I improve my body shape?", a: "Build muscle with strength training, eat enough protein, sleep well, and stay active. These changes improve tone and posture and can shift how your proportions look. Tailored clothing is another simple way to improve how your shape looks." },
  { q: "What can I do to fix an awkward body shape?", a: "There is nothing to fix. What feels awkward is often a fit problem, not a body problem. Tailoring, clothes cut for your proportions, and strength training in areas you want to build can make a big difference." },
  { q: "What is an ideal workout for an inverted triangle body shape?", a: "Inverted triangles often focus on lower-body strength to balance broad shoulders. Squats, lunges, hip thrusts, and step-ups build the glutes and legs. You can go lighter on heavy shoulder and lat work if you don’t want more upper-body width." },
  { q: "Which cardio exercises are good for specific body shapes?", a: "No cardio exercise targets a specific shape. Walking, running, cycling, swimming, and rowing all support overall fat loss and heart health, so pick what you enjoy and will keep doing." },
  { q: "How does cycling change your body shape?", a: "Cycling builds the quadriceps, hamstrings, and glutes, and it burns calories that can reduce overall body fat. It will not target one area, and it will not change your bone structure." },
  { q: "Is cycling good for body shape?", a: "It is good for heart health and leg strength, and it can help with overall fat loss. As with any cardio, it shapes your body through muscle and fat changes across the whole body." },
  { q: "Does running change your body shape?", a: "Running can lower overall body fat and make your legs and midsection look leaner. It does not change your frame, and it won’t reduce fat from one specific area." },
  { q: "What body shapes do different sports make?", a: "Swimmers often develop broad shoulders and strong backs, cyclists build strong legs and glutes, and runners tend to be lean overall. Gymnasts and equestrians build strong cores and legs. Part of this comes from training and part from people with certain builds being drawn to certain sports." },
  { q: "Why do CrossFit athletes sometimes look different from the “ideal” shape?", a: "CrossFit trains for strength and performance, not for a particular look. Building muscle in the shoulders, back, and core can make the waist look thicker and the outline straighter, which is simply a different shape, not a worse one." },
  { q: "Why do thin people with a “good” body shape look better?", a: "Often it is the way clothes drape on a smaller or straighter frame, along with the way fashion photography is styled. How a body looks in clothing says nothing about how healthy it is." },
  { q: "Does milk contain enough estrogen to change your body shape?", a: "No. The amount of estrogen in cow’s milk is very small compared with what your body produces, so it does not change your body shape." },
  { q: "What is considered a normal waist size for a man and a woman?", a: "It depends on frame and height. The National Institutes of Health treats a waist above 35 inches (88 cm) in women and 40 inches (102 cm) in men as a sign of higher health risk." },
  { q: "Is waist size genetic?", a: "Partly. Your ribcage and pelvis width are inherited, and genetics influence where you store fat, so there is a natural limit to how small your waist can get. Lifestyle still affects it within that range." },
  { q: "Can I reduce my waist size in 4 days?", a: "Not by losing fat. Fat loss takes weeks. In a few days you can only reduce temporary bloating by cutting back on salt, drinking enough water, and eating more fiber." },
  { q: "How long will it take to reduce my waist size?", a: "It varies by person. Safe, steady weight loss is generally about 1 to 2 pounds per week, and a noticeable change in waist size often takes several weeks to a few months of consistent effort." },
  { q: "How can I reduce my waist and thighs with exercise?", a: "Combine strength training with cardio and a modest calorie deficit. You can’t spot-reduce fat from one area, so the waist and thighs shrink as overall body fat drops." },
  { q: "What is the best exercise to reduce belly and waist size: swimming, cycling, or running?", a: "No single exercise is best. All three burn calories and support fat loss, and the best choice is the one you can do consistently. Strength training also helps by building muscle that raises the calories you burn at rest." },
  { q: "Are stretching exercises good for shrinking waist size?", a: "Stretching does not burn fat or shrink your waist. It can improve flexibility and posture, which may make your midsection look a bit straighter, but fat loss depends on diet and overall activity." },
  { q: "Do exercises reduce bust size?", a: "Not reliably. Breasts are mostly fatty and glandular tissue, so exercise has little effect on size unless overall weight drops. Chest exercises build muscle underneath the breast but do not shrink it." },
  { q: "Can I increase my bust size with yoga or exercise?", a: "Not in a meaningful way. Yoga and chest exercises can strengthen the muscle under the breast and improve posture, which may make the chest look slightly fuller, but they do not grow breast tissue." },
  { q: "How can I increase my bust size while losing weight?", a: "It is hard to do both, since bust size often drops along with overall weight. Strength training for the chest and back and a well-fitted bra can improve how the bust looks. For a larger change, talk with a doctor about your options." },
  { q: "Can I increase my hip size naturally?", a: "You can build the glutes with squats, hip thrusts, lunges, and step-ups, and gaining weight can add to your hips. Your bone width stays the same, so the change has limits." },
  { q: "Can I increase my thighs, hips, and waist size?", a: "Yes, through strength training and eating enough calories and protein. Where you gain is influenced by genetics, so you can’t control exactly which areas grow." },
  { q: "Does skipping or swimming increase hip size?", a: "Not by itself. Skipping works the calves and glutes and swimming works the shoulders and back, but neither is known to add much to hip size. Strength training does more for the glutes." },
  { q: "Does hip size stay the same after weight loss?", a: "Usually not completely. Your hips often get somewhat smaller because you lose fat, but the width of your pelvis does not change." },
  { q: "Does hip size affect health?", a: "Research suggests that carrying weight on the hips and thighs is less risky than carrying it around the abdomen. A larger hip measurement relative to your waist generally gives a lower waist-hip ratio, which is linked to lower health risk." },
  { q: "What hip size is considered big enough?", a: "There is no standard. What matters for body shape is the relationship between your hips, bust, and waist, not the size of your hips alone." },
  { q: "How can I reduce my hip size in 1 week?", a: "You can’t lose real fat from the hips in a week. Any quick change comes from water or bloating. Steady fat loss through diet, strength training, and cardio is the reliable way." },
  { q: "What can I do to reduce belly fat and hip size without exercise or dieting?", a: "There is no proven way to reduce fat without changing diet or activity. Good sleep, lower stress, and better posture can help your midsection look flatter. Shapewear changes how clothes fit, but not your body." },
  { q: "How can I dress for my body shape?", a: "Use your result as a starting point. Choose cuts that follow your natural waist if you have a defined one, add interest at the shoulders to balance wider hips, or add volume below to balance broader shoulders. Comfort and personal taste should come first." },
  { q: "What is a good waist-hip ratio?", a: "The WHO treats a ratio of 0.85 or above in women and 0.90 or above in men as a sign of abdominal obesity. NIDDK points to higher risk above 0.8 in women and 1.0 in men. Lower ratios are generally linked to lower risk, but WHR is a screening measure, not a diagnosis." },
  { q: "Is the body type calculator accurate?", a: "It is accurate for sorting your proportions as long as your measurements are. Use a soft tape, measure at the same time of day, and take each reading twice. Results near category boundaries can reasonably fit two shapes." },
  { q: "Is the body type calculator free?", a: "Yes, the calculator is free to use online. It only asks for body measurements, not personal identification." },
];

// The supplied FAQ schema is a shorter, separately worded set of questions,
// so it is kept verbatim here rather than derived from the list above.
const FAQ_SCHEMA_ITEMS = [
  { q: "What is a body type calculator?", a: "A body type calculator is an online tool that determines your body shape from your measurements, usually bust, waist, and hips. This one also uses your high hip and gives your waist-hip ratio." },
  { q: "How do I know what body shape I have?", a: "Measure your bust, waist, high hip, and hip with a soft tape, enter the numbers into the calculator, and read the result. The shape shown reflects how your measurements compare with each other." },
  { q: "Is body type the same as body shape?", a: "Not exactly. Body shape describes your outline based on bust, waist, and hip proportions. Body type is often used in fitness to describe build, such as ectomorph or endomorph. This calculator works with shape." },
  { q: "What are the different female body shapes?", a: "This tool classifies results as hourglass, top hourglass, bottom hourglass, spoon, triangle, inverted triangle, or rectangle. Other sources use names like apple, pear, or banana for similar patterns." },
  { q: "What is the most common body shape?", a: "In a 2005 North Carolina State University study of more than 6,000 women, the rectangle (banana) shape was the most common at about 46%. The hourglass was the least common at about 8%." },
  { q: "Is there an ideal body shape?", a: "No. Ideals vary by culture and era, and no shape is better or worse. Health depends more on waist size and fat distribution than on shape name." },
  { q: "What is a good waist-hip ratio?", a: "The WHO treats a ratio of 0.85 or above in women and 0.90 or above in men as a sign of abdominal obesity. NIDDK points to higher risk above 0.8 in women and 1.0 in men. Lower ratios are generally linked to lower risk, but WHR is a screening measure, not a diagnosis." },
  { q: "What is a normal waist size?", a: "It depends on your frame and height. The National Institutes of Health treats a waist above 35 inches (88 cm) in women and 40 inches (102 cm) in men as a sign of higher health risk." },
  { q: "Can exercise change my body shape?", a: "It can change your measurements and muscle tone, but not your bone structure. You also can't choose where fat comes off. Strength training can reshape your outline by building muscle in areas like the shoulders and glutes." },
  { q: "Is body shape inherited?", a: "Largely, yes. Bone structure and the tendency to store fat in certain places are both influenced by genetics, and hormones also play a part. That is why shapes often run in families." },
  { q: "Can my body shape change over time?", a: "Yes. Puberty, weight changes, muscle gain, pregnancy, and menopause can all shift your proportions. Re-measuring every few months shows whether your shape or ratio has changed." },
  { q: "Is the body type calculator accurate?", a: "It is accurate for sorting your proportions as long as your measurements are. Use a soft tape, measure at the same time of day, and take each reading twice. Results near category boundaries can reasonably fit two shapes." },
  { q: "Is the body type calculator free?", a: "Yes, the calculator is free to use online. It only asks for body measurements, not personal identification." },
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
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

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

export default function BodyTypeCalculatorFaqSection() {
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

      <Card title="What Is Meant by Body Shape?">
        <P>
          Body shape is the outline your body makes, based on how your shoulders, bust, waist, and hips compare in size. It is about
          proportion, not weight. A person who is petite and a person who is tall and broad can have the same body shape if their
          measurements relate to each other in the same way.
        </P>
        <P>
          The idea comes mostly from the clothing industry. Designers and pattern makers needed a simple way to group customers so
          garments would fit well, so they sorted bodies into a handful of categories and gave them familiar names like hourglass, pear,
          and rectangle. Researchers later turned those descriptions into measurement rules, which is what makes a calculator possible.
          Instead of judging by eye in a mirror, you compare actual numbers.
        </P>
      </Card>

      <Card title="Body Type vs. Body Shape: Is There a Difference?">
        <P>
          People use the two terms interchangeably, and in search results they often mean the same thing. Strictly speaking, though, they
          can mean different things.
        </P>
        <P>
          Body shape refers to the outline described above: where your bust, waist, and hips sit in relation to each other. Body type is
          more often used in fitness circles to describe build and composition, such as ectomorph, mesomorph, and endomorph. Those labels
          describe things like frame size, muscle tendency, and how easily you gain or lose weight.
        </P>
        <P>
          This body type calculator works with shape. It measures four circumferences and compares them. It does not estimate muscle,
          body fat, or metabolism, so it will not tell you whether you are an ectomorph or an endomorph.
        </P>
      </Card>

      <Card title="How Do I Know What Body Shape I Have?">
        <P>
          The most reliable way is to measure yourself and run the numbers. Guessing from a mirror or from how clothes fit is unreliable,
          because posture, clothing, and lighting all change what you see.
        </P>
        <P>
          Use a soft, flexible tape measure, the kind used for sewing. Stand up straight with your feet together and your arms relaxed at
          your sides. Keep the tape snug against your body, but not so tight that it presses into your skin, since that gives a smaller
          number than the true measurement. Breathe out normally instead of holding your breath or pulling your stomach in. Measure in the
          morning if you can, because bloating and water retention can change your waist by a centimeter or more over the day. Take each
          measurement twice and use the average if the two numbers differ.
        </P>
        <H3>What Is Meant by Bust Size?</H3>
        <P>
          Bust size is the distance around your chest at its fullest point, usually across the nipples, with the tape level across your
          back. Wear a well-fitted, non-padded bra so the measurement reflects your natural shape.
        </P>
        <P>
          This is not the same as bra size. A bra size combines two numbers: the band size (around your ribcage) and the cup size (the
          difference between your bust and band). The calculator needs the full bust circumference, not your cup letter.
        </P>
        <H3>What Is Waist Size, and What Is Considered Normal?</H3>
        <P>
          Your natural waist is the narrowest part of your torso, usually just above the belly button and below the ribs. If you can’t
          see a clear narrowing, bend sideways and note where your body creases. That is your natural waist.
        </P>
        <P>
          Waist size is not the same as pant size. Many pants are sized by a waist number, but they often sit lower on the body and run
          larger than the label suggests.
        </P>
        <P>
          There is no single “normal” waist size, since it depends on frame and height. For health screening, though, the National
          Institutes of Health treats a waist above 35 inches (88 cm) in women and above 40 inches (102 cm) in men as a sign of higher
          risk, because it points to extra fat around the abdomen. These are general guides, not a diagnosis.
        </P>
        <H3>What Is Meant by High Hip?</H3>
        <P>
          The high hip is the upper part of the hips, where the hip bones begin to curve outward. It sits between the waist and the
          fullest part of the hips, usually 4 to 7 inches (10 to 18 cm) below the natural waist, depending on how long your torso is.
          Measure around that upper swell with the tape parallel to the floor.
        </P>
        <P>
          It is the least familiar of the four measurements, but it is the one that separates a spoon shape from a bottom hourglass. Both
          have hips wider than the bust, but the way the body curves out from the waist is different, and the high hip is what shows it.
        </P>
        <H3>What Is Meant by Hip Size?</H3>
        <P>
          Hip size is the distance around the widest part of your hips and buttocks. The tape should be level all the way around, not
          dipping in the back or riding up in the front. Your hip measurement reflects bone structure, muscle, and fat together, which is
          why two people with the same weight can have noticeably different hip sizes.
        </P>
        <P>
          If you don’t have a tape measure, you can use a piece of string or a ribbon. Wrap it around the area, pinch or mark where it
          meets, then lay it flat against a ruler or yardstick. A well-fitting, non-stretchy garment can also give you a rough idea. A
          proper cloth tape is still more precise.
        </P>
      </Card>

      <Card title="The Seven Body Shapes Explained">
        <P>
          The calculator sorts results into seven categories: hourglass, top hourglass, bottom hourglass, spoon, triangle, inverted
          triangle, and rectangle. These follow a classification system from research published in the International Journal of Clothing
          Science and Technology, which sorts shapes by comparing the differences between your measurements. The descriptions below also
          include the general logic behind each category.
        </P>
        <H3>Hourglass</H3>
        <P>
          Your bust and hips are close in size, and your waist is clearly smaller than both. In this system, the hips are less than about
          3.6 inches larger than the bust (or the bust is no more than about 1 inch larger than the hips), and the waist is at least 9
          inches smaller than the bust or 10 inches smaller than the hips. The upper and lower body look balanced, with a defined waist
          between them.
        </P>
        <H3>Top Hourglass</H3>
        <P>
          Your waist is well defined, but your bust is larger than your hips by more than 1 inch (and by less than 10). The balance tips
          toward the upper body, so the chest and shoulders tend to be the visual focus.
        </P>
        <H3>Bottom Hourglass</H3>
        <P>
          This is the opposite of a top hourglass. Your hips are larger than your bust by 3.6 to 10 inches, and your waist is at least 9
          inches smaller than your hips. The high hip is not much bigger than the waist, so the curve goes in at the waist and out again
          at the hip. The hips and thighs are the dominant feature.
        </P>
        <H3>Spoon</H3>
        <P>
          Your hips are wider than your bust, with a waist that is smaller than the hips by at least 7 inches, but your high hip is
          relatively large compared with your waist. In this system, that means the high hip is at least 1.193 times the waist. The body
          curves outward right below the waist rather than dipping in and flaring out again. The name comes from the profile of a spoon: a
          narrower top and a rounded, fuller base.
        </P>
        <H3>Triangle</H3>
        <P>
          Also called the pear shape, a triangle has hips at least 3.6 inches larger than the bust, with a waist less than 9 inches smaller
          than the hips. The shoulders and bust are narrower, and weight tends to sit in the hips, buttocks, and thighs.
        </P>
        <H3>Inverted Triangle</H3>
        <P>
          Your bust is at least 3.6 inches larger than your hips, and your waist is less than 9 inches smaller than the bust. The upper
          body carries the width, and the lower body tapers. This is common among people with broad shoulders or a fuller bust relative to
          their hips. Some sources call it an apple shape.
        </P>
        <H3>Rectangle</H3>
        <P>
          Your bust and hips are within 3.6 inches of each other, and your waist is less than 9 inches smaller than the bust and less than
          10 inches smaller than the hips. The silhouette is relatively straight with subtle waist definition. You may also see this
          called a banana or straight shape.
        </P>
        <P>
          These categories are descriptions, not rankings. Real bodies don’t always fit neatly, and some people land near the border
          between two shapes. There is also a very wide range of actual sizes within each shape.
        </P>
      </Card>

      <Card title="How Common Is Each Body Shape?">
        <P>
          A 2005 study of more than 6,000 women at North Carolina State University found that rectangle (banana) shapes were the most
          common at about 46%. Pear shapes made up just over 20%, apple shapes just under 14%, and hourglass shapes only about 8%. Despite
          the hourglass being treated as the standard in fashion and media, it was the rarest in that group.
        </P>
        <P>
          Keep in mind that this study used a four-shape system, so the numbers don’t map exactly onto the seven categories in this
          calculator. They do show something useful: if your result is a rectangle, you are in the biggest group, not an outlier.
        </P>
      </Card>

      <Card title="Understanding Your Waist-Hip Ratio">
        <P>
          Your waist-hip ratio (WHR) is your waist measurement divided by your hip measurement. A 34-inch waist and 40-inch hips give a
          ratio of 34 ÷ 40, or 0.85.
        </P>
        <P>
          WHR is widely used because it shows how fat is distributed, which relates to health risk more closely than weight alone. Fat
          stored around the abdomen is more strongly linked to heart disease and metabolic problems than fat stored on the hips and
          thighs. A higher ratio means more weight around the middle.
        </P>
        <P>Several organizations set their own cut-offs, and they don’t all agree:</P>
        <List items={[
          ["", <>The World Health Organization identifies abdominal obesity at a WHR of 0.90 or above for men and 0.85 or above for women. You can read the details in the <Ext href="https://www.who.int/publications/i/item/9789241501491">WHO expert consultation report on waist circumference and waist-hip ratio</Ext>.</>],
          ["", "The National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) points to higher health risks for women above 0.8 and men above 1.0."],
        ]} />
        <P>
          WHR has some real strengths. Research has found it to be a better predictor of cardiovascular disease than BMI or waist size
          alone, and in adults over 75 it has predicted mortality better than either of those measures. A large international heart
          attack study led by Yusuf and colleagues estimated that if obesity were defined by WHR instead of BMI, the share of people
          flagged as at risk of heart attack would roughly triple.
        </P>
        <P>
          WHR has also been studied in relation to fertility. In women, ratios above 0.80 have been linked to lower pregnancy rates than
          ratios between 0.70 and 0.79. Treat that as a population trend, not a prediction for any one person.
        </P>
        <P>
          Use the number with some care. WHR is a screening indicator, not a diagnosis. It does not account for age, ethnicity, height,
          or muscle mass. A ratio above a cut-off is a good reason to talk with a doctor, but it does not prove a health problem, and a
          lower ratio does not guarantee good health. For the same reason, tracking your WHR over time tells you more than a single
          reading.
        </P>
      </Card>

      <Card title="Why Does Body Shape Matter?">
        <P>
          Body shape matters most in practical ways. It affects how clothes fit, which is why it comes up so often in shopping, tailoring,
          and sewing. It also hints at where your body stores weight, which links to the waist-hip ratio and the health context above.
        </P>
        <P>Here are the situations where people most often use a body type calculator:</P>
        <List items={[
          ["Shopping for clothes online.", "Without a fitting room, knowing your proportions helps you choose cuts that work for you. If your hips are much larger than your bust, you may need different sizes on top and on the bottom."],
          ["Ordering tailored or custom clothing.", "Dressmakers ask for these same measurements, and knowing your shape helps you describe changes like taking in the waist or letting out the hip."],
          ["Choosing swimwear, jeans, and formalwear.", "These are the garments where proportion matters most and standard sizing most often falls short."],
          ["Building a wardrobe.", "Understanding your silhouette helps you spend on pieces that fit well instead of buying and returning."],
          ["Tracking changes during a fitness plan.", "Measurements capture progress the scale misses, especially when you are gaining muscle and losing fat at the same time."],
          ["Pregnancy and postpartum changes.", "Proportions often shift, and rechecking your shape helps you rebuild your wardrobe."],
          ["Sewing, costume, and cosplay projects.", "Pattern drafting depends on the same measurements."],
        ]} />
        <P>
          It also helps to know what the real pant size is: waist or hip? It depends on the cut. If you carry more weight in the hips than
          the waist, fitting the hip and having the waist tailored usually works better than the other way around.
        </P>
      </Card>

      <Card title="Is There an Ideal Body Shape?">
        <P>
          No. There is no single ideal body shape for men or women, and the idea of a “perfect” body is a moving target. The standard of
          beauty has changed across decades and varies from one culture to another. The hourglass is often presented as the ideal, but the
          study cited earlier shows it is also the least common, which tells you how much of that ideal comes from fashion and media and
          not from the body itself.
        </P>
        <P>A few more points that often come up:</P>
        <List items={[
          ["Ideal for men and women.", "Men and women tend to store fat differently, so the shapes that appear in discussions are different. In women, shape is usually discussed in terms of bust, waist, and hip. In men, it is more often described by shoulder and waist proportions. From a health standpoint, what matters more than the outline is the waist circumference and waist-hip ratio discussed earlier."],
          ["Young vs. old.", "Bodies change with age. In women, hormonal shifts around menopause tend to move fat from the hips and thighs toward the abdomen, which raises the waist-hip ratio even if weight stays the same. Muscle mass also declines with age, and posture and height can change. So the “ideal” at 25 is not a fair comparison at 65. At older ages, staying active and keeping waist size in check usually matters more than matching any shape."],
          ["The least desirable body shape.", "No shape is undesirable, and none is a flaw. The idea that some shapes are better than others comes from trends in fashion and media. The only distinction with real health meaning is abdominal fat, which is linked to higher risk than fat stored elsewhere. That is a matter of fat distribution, and it can affect people of any shape."],
          ["What is attractive?", "Attraction is personal and cultural. Studies have looked at waist-hip ratio and perceived attractiveness, but results vary between cultures and time periods. Confidence, health, and personal style usually count for more in real life than a ratio."],
        ]} />
      </Card>

      <Card title="Are Body Shapes Natural, and Can You Inherit Them?">
        <P>
          Yes to both. Your body shape is largely set by genetics. Your bone structure, such as the width of your shoulders, ribcage, and
          pelvis, is inherited. So is a lot of your tendency to store fat in certain places. That is why body shapes often run in
          families, and why you may notice you look like a parent or grandparent. Hormones also play a role. Estrogen tends to promote fat
          storage in the hips, thighs, and buttocks, which is one reason women often store fat there while men more often store it around
          the abdomen. It also helps explain why female body shapes vary so much from person to person.
        </P>
        <P>
          Ethnicity and ancestry can also influence average body shape and fat distribution. For example, some health organizations use
          lower waist cut-offs for people of South Asian descent, because they tend to carry more abdominal fat at a lower weight. But
          averages across a group say very little about any one person. Genetics, diet, activity, and hormones all vary within every
          group, so it is not accurate to assign a body shape to an ethnicity.
        </P>
        <P>
          Your shape also changes over time. Puberty, pregnancy, weight changes, muscle gain, and menopause can all shift your
          proportions. Teenagers who are still growing may see their shape change as their body matures, so the result is most reliable
          for adults.
        </P>
      </Card>

      <Card title="Can Exercise or Weight Loss Change Your Body Shape?">
        <P>
          Partly. Exercise and weight changes can change your measurements, but they cannot change your bone structure. Your pelvis and
          ribcage stay the same, which is why hip width after weight loss may shrink somewhat but will not change completely. Here is what
          is realistic:
        </P>
        <List items={[
          ["Spot reduction doesn’t work.", "You can’t choose where fat comes off. Crunches don’t shrink the waist, and leg exercises don’t shrink the hips on their own. Fat loss happens across the body, in a pattern set largely by genetics. Claims about reducing your waist or hips in a few days are really about temporary water and bloating, not fat."],
          ["Strength training can reshape your outline.", "Building muscle in the shoulders, back, or glutes changes how proportions look. Squats, hip thrusts, and lunges build the glutes, which can add to hip measurements. Shoulder and upper-back work can add width on top, which may help balance a triangle shape."],
          ["Cardio supports overall fat loss and health.", "Walking, running, cycling, and swimming all burn calories and improve heart health. Cycling tends to build the thighs and glutes, while running tends to be leaner overall, and swimming works the shoulders and back. None of these will target one body area on its own. Skipping and swimming are not known to increase hip size by themselves."],
          ["Different sports build different physiques.", "Swimmers often develop broader shoulders, cyclists stronger legs, and runners leaner builds. This reflects both training and the people who naturally gravitate toward each sport."],
          ["Weight loss doesn’t guarantee a particular shape.", "It can lower your waist and change your ratios, but it won’t turn a rectangle into an hourglass. It is better to treat a shape result as a starting point and not a target."],
          ["Bust size is mostly outside your control.", "Breasts are mostly fatty and glandular tissue, not muscle, so exercise does not reliably reduce or increase them. Chest exercises build the muscle underneath but do little for size. Bust size more often changes with overall weight, hormones, pregnancy, and breastfeeding."],
        ]} />
        <P>If you want to change your measurements for health reasons, a doctor or registered dietitian is a better guide than any online plan.</P>
      </Card>

      <Card title="Using Your Result for Clothing and Styling">
        <P>
          Your shape gives you a direction, not a rule. Most fit advice comes down to balance: highlight what you like and create
          proportion where you want it.
        </P>
        <P>
          If you are an hourglass, fitted and wrap styles follow your natural waist, and high-waisted bottoms work well. A top hourglass
          often does well with V-necks and simpler tops, with detail or volume at the hip to even out the outline. A bottom hourglass may
          prefer structured shoulders or statement tops paired with clean-lined bottoms.
        </P>
        <P>
          Spoon and triangle shapes often find that interest at the shoulders and neckline, such as boat necks, structured jackets, or
          lighter colors on top, balances wider hips. A-line skirts and mid-rise bottoms are frequently comfortable. An inverted triangle
          may favor softer necklines on top and volume or pattern below, such as wide-leg trousers or flared skirts. A rectangle can
          create the look of a waist with belts, peplum tops, and ruching, or can lean into a straight silhouette with boxy and tailored
          cuts.
        </P>
        <P>
          None of this is a requirement. Comfort, personal taste, and the occasion should lead. Use your result to understand why some
          garments fit the way they do, then wear what you like.
        </P>
      </Card>

      <Card title="What a Body Type Calculator Cannot Tell You">
        <P>
          Being clear about limits makes any tool more useful. This calculator classifies proportions from four measurements. It does not
          assess your health, body fat, fitness level, or ideal weight, and it does not suggest that one shape is better than another. The
          waist-hip ratio it shows is a screening figure, not a medical result.
        </P>
        <P>
          Shape categories are also simplifications. Real bodies vary in shoulder width, torso length, leg length, and where weight sits,
          none of which four measurements can capture. Some bodies don’t fit neatly into any category at all. If your numbers fall near a
          boundary, you may fit two categories partly, and that is normal. If you have a medical concern about weight or body
          composition, talk with a doctor or registered dietitian.
        </P>
      </Card>

      <Card title="Free, Private, and Simple to Use">
        <P>
          This body type calculator is free to use online. You enter your measurements, and the shape and waist-hip ratio appear on the
          page with no purchase required. The tool only needs four numbers and nothing that identifies you, so there is no reason to share
          personal details to get a result.
        </P>
        <P>
          You can use it as many times as you like, which is handy for comparing results across weeks or testing how a different waist
          measurement changes your shape.
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
