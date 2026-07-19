import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this unit converter free to use?",
    a: "Yes. The tool is completely free, with no subscription, hidden charges, or usage limits.",
  },
  {
    q: "Do I need to sign up or create an account to use it?",
    a: "No signup or account is required. You can open the page and start converting values right away.",
  },
  {
    q: "What types of units can I convert?",
    a: "The tool covers 12 categories: length, weight, temperature, area, volume, speed, time, data, energy, pressure, angle, and frequency, covering both metric and imperial measurement systems.",
  },
  {
    q: "Can I convert digital storage units like MB and GB?",
    a: "Yes. The data category converts between bytes, kilobytes, megabytes, gigabytes, and terabytes.",
  },
  {
    q: "Can I convert pressure units like PSI and bar?",
    a: "Yes. The pressure category supports pascals, bar, PSI, and atmospheres, useful for tire pressure and technical specifications.",
  },
  {
    q: "How accurate are the conversion results?",
    a: "The tool uses standardized, internationally recognized conversion factors, so results match official measurement standards rather than rounded estimates.",
  },
  {
    q: "Can I convert Celsius to Fahrenheit with this tool?",
    a: "Yes. Temperature conversion between Celsius, Fahrenheit, and Kelvin is fully supported and calculated instantly.",
  },
  {
    q: "Is my data stored when I use the converter?",
    a: "No. Values you enter are used only to generate your result and are not stored or shared afterward.",
  },
  {
    q: "Can I use this tool on my phone?",
    a: "Yes. The converter works directly in any mobile or desktop browser without needing an app or software installation.",
  },
  {
    q: "What's the difference between metric and imperial units?",
    a: "The metric system (used by most countries) is based on units like meters, grams, and liters, while the imperial system (used mainly in the US) uses units like feet, pounds, and gallons. This tool converts accurately between both systems.",
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

export default function UnitConverterFaqSection() {
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

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={pStyle}>
          Whether you are adjusting a recipe measured in ounces, converting a travel distance from kilometers
          to miles, or double-checking a weight in a construction spec sheet, getting units right matters. A
          single misplaced decimal or wrong conversion factor can throw off a budget, a dosage, or a design.
          This free unit converter on <Link to="/" className="inline-home-link">Tolz</Link> is built to remove that risk, you enter a value, choose your units,
          and get an accurate result immediately, without opening a spreadsheet or searching for a formula.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unit conversion sounds simple until you're staring at an unfamiliar unit and trying to remember
          whether you multiply or divide. This tool handles that calculation instantly across the measurement
          types people actually need day to day, so you can focus on the task at hand instead of the
          arithmetic behind it.
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Unit Converter Works</h2>
        <p style={pStyle}>
          Using the tool takes three steps. First, select the category of measurement you're working with —
          length, weight, temperature, area, volume, speed, time, data, energy, pressure, angle, or frequency.
          Second, enter the value you want to convert and choose the starting unit (for example, meters or
          pounds). Third, select the unit you want to convert to, and the result appears instantly. There's no
          need to refresh the page or submit a form, the conversion updates in real time as you adjust the
          numbers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This straightforward layout is intentional. Many measurement conversion tools bury the input fields
          behind ads or multi-step wizards. Here, the entire process happens on one screen, which keeps things
          fast whether you're converting a single value or running several conversions back to back.
        </p>
      </div>

      {/* Categories */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Measurement Categories Covered</h2>
        <p style={pStyle}>
          A general-purpose converter is only useful if it actually covers the units people search for, so
          this tool is built around the categories that come up most often in daily, academic, and
          professional contexts.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Length and Distance:</strong> Convert between meters, kilometers, centimeters,
            millimeters, miles, yards, feet, and inches. This is one of the most common lookups, used for
            everything from home improvement measurements to understanding road distances when traveling
            internationally.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Weight and Mass:</strong> Switch between kilograms, grams, pounds, ounces, stones, and
            metric tons. Weight conversion is essential for cooking, shipping, fitness tracking, and any
            situation where a product label uses different units than you're used to.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Temperature:</strong> Convert Celsius, Fahrenheit, and Kelvin. Temperature conversion is
            deceptively tricky because it isn't a simple multiplication, it involves offsets, which is exactly
            the kind of calculation that's easy to get wrong by hand and fast to get right with a dedicated
            tool.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Volume:</strong> Convert liters, milliliters, gallons, quarts, pints, and cups. This
            category is especially useful for recipes, fuel calculations, and liquid measurements in
            scientific or industrial settings.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Area:</strong> Convert square meters, square feet, square kilometers, acres, and hectares.
            Useful for real estate, land measurement, construction planning, and agricultural calculations.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Speed:</strong> Convert between kilometers per hour, miles per hour, meters per second,
            and knots, relevant for travel planning, vehicle specifications, and sports or fitness data.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Time:</strong> Convert seconds, minutes, hours, days, weeks, and years. Useful for project
            scheduling, scientific calculations, and translating durations between the units a task, contract,
            or dataset happens to use.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Data:</strong> Convert bytes, kilobytes, megabytes, gigabytes, and terabytes. This
            category comes up constantly in tech contexts, checking whether a file fits a storage limit,
            comparing plan sizes, or understanding how much space a download actually needs.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Energy:</strong> Convert joules, calories, kilocalories, watt-hours, and kilowatt-hours.
            Common uses include comparing nutritional energy values, reading appliance energy labels, and
            working through physics or engineering problems that mix unit systems.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pressure:</strong> Convert pascals, bar, PSI, and atmospheres. Frequently needed for tire
            pressure checks, weather readings, and technical or industrial specifications that list pressure
            in an unfamiliar unit.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Angle:</strong> Convert degrees, radians, and gradians. Used in trigonometry, engineering
            drawings, navigation, and any calculation involving rotation or direction.
          </li>
          <li>
            <strong>Frequency:</strong> Convert hertz, kilohertz, megahertz, and gigahertz. Relevant for
            understanding electronics specifications, audio and radio signals, and processor or network
            speeds.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Each category uses precise, standardized conversion factors, so the output reflects accurate,
          internationally recognized values rather than rounded approximations.
        </p>
      </div>

      {/* When you'd need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Need a Unit Converter</h2>
        <p style={pStyle}>
          Unit conversion isn't a niche need, it shows up constantly across very different situations, and
          recognizing where it fits can save real time.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Cooking and baking:</strong> Recipes from international sources often use grams,
            milliliters, or Celsius, while others use cups, ounces, and Fahrenheit. Converting accurately
            keeps ratios correct, which matters most in baking, where precision affects the outcome.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Travel:</strong> If you're driving in a country that uses kilometers when you're used to
            miles, or trying to understand a weather forecast in Celsius, quick conversion helps you plan
            realistically — how far a destination actually is, or what to pack based on real temperature
            expectations.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Academic and professional work:</strong> Students working through physics, chemistry, or
            engineering problems frequently need to convert between metric and imperial units mid-calculation.
            Professionals in construction, logistics, manufacturing, and design face the same requirement when
            specs, blueprints, or shipments use different unit systems than their working standard.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Fitness and health tracking:</strong> Body weight, distance run, and liquid intake are
            often tracked in different units depending on the app, device, or country of origin, so converting
            between them keeps records consistent.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Online shopping and product comparison:</strong> Product listings, especially from
            international retailers, often list dimensions or weight in units unfamiliar to the buyer.
            Converting before purchase avoids sizing mistakes.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Home improvement and DIY projects:</strong> Measuring materials, room dimensions, or
            furniture against product specifications frequently requires switching between metric and imperial
            values.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Tech and device management:</strong> Checking whether a file, backup, or download fits
            within a storage plan often means converting between megabytes and gigabytes, especially when a
            device and a cloud service display sizes differently.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Vehicle and equipment checks:</strong> Tire pressure specifications are frequently listed
            in PSI or bar depending on the manufacturer's country of origin, and converting correctly matters
            for both safety and equipment longevity.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Nutrition and energy tracking:</strong> Food packaging from different regions may list
            energy in calories or kilojoules, and converting between them keeps calorie tracking consistent
            across brands and countries.
          </li>
          <li>
            <strong>Engineering, electronics, and design work:</strong> Angle conversions between degrees and
            radians, and frequency conversions across hertz, kilohertz, and megahertz, come up regularly in
            technical drawings, signal specifications, and coursework.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the alternative to a converter tool is either memorizing conversion formulas
          or doing manual math with a calculator, both of which introduce more room for error than a
          purpose-built converter.
        </p>
      </div>

      {/* Accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy You Can Rely On</h2>
        <p style={pStyle}>
          A conversion tool is only as useful as its accuracy, and small errors compound quickly, especially
          in professional or academic contexts. This converter uses standardized, internationally accepted
          conversion factors for every unit category, so results are consistent with official measurement
          standards rather than simplified or rounded shortcuts. That distinction matters most with categories
          like temperature, where the conversion involves a formula rather than a flat multiplier, and with
          area or volume conversions, where small rounding errors can meaningfully skew results at scale.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Manual conversion, doing the math yourself or searching for a formula each time, leaves more room
          for transcription errors, outdated conversion charts, or simple arithmetic slips. A dedicated tool
          removes that variable entirely, returning the same precise result every time regardless of how many
          conversions you run.
        </p>
      </div>

      {/* Free & private */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Ready to Use</h2>
        <p style={pStyle}>
          This unit converter is completely free to use, with no hidden fees, subscription requirements, or
          usage limits. There's no signup or account creation needed, you can open the page and start
          converting immediately.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On the data side, values you enter are processed directly in your browser session to generate the
          result and are not stored, logged, or shared. Nothing about what you convert is saved after you
          leave the page, which makes the tool suitable for casual use as well as more sensitive contexts,
          like professional calculations you'd rather not associate with an account. There are no downloads
          required and no software installation, it works directly from the browser on desktop or mobile.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting the Most Out of the Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few practical habits make repeated use faster. If you're converting the same category multiple
          times in a row, say, several ingredient weights while adjusting a recipe, keep the category selected
          and just update the values, rather than resetting the category each time. For technical or
          professional work where precision matters, double-check which specific unit variant you're using
          (for example, short tons versus metric tons, or US gallons versus imperial gallons), since these
          distinctions are common sources of conversion mistakes even outside of any tool.
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
