import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this color picker tool free to use?",
    a: "Yes, the tool is completely free with no hidden fees, subscriptions, or usage limits.",
  },
  {
    q: "Do I need to create an account to use the color picker?",
    a: "No signup or account creation is required. You can use the tool immediately without providing any personal information.",
  },
  {
    q: "Can I pick a color directly from an uploaded image?",
    a: "Yes, you can upload an image and click on any specific area to extract its exact color code.",
  },
  {
    q: "What color formats does the tool support?",
    a: "The tool provides HEX, RGB, and HSL values for every color you select, so you can use whichever format fits your project.",
  },
  {
    q: "Will my uploaded images be stored or saved?",
    a: "No, images are processed only to extract the requested color information and are not retained after your session.",
  },
  {
    q: "Can I use this tool on my phone or tablet?",
    a: "Yes, the tool works directly in your browser and is compatible with desktop, tablet, and mobile devices without any app installation.",
  },
  {
    q: "Why do I need both HEX and RGB codes for the same color?",
    a: "Different platforms and software use different formats. HEX is common for web design and CSS, while RGB is often used in image editing and some programming environments. Having both saves you from manually converting between them.",
  },
  {
    q: "How accurate is the color picker compared to design software like Photoshop?",
    a: "The tool extracts precise pixel-level color data, giving results consistent with professional design software, provided the source image itself is high quality and not heavily compressed.",
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
const olStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };

export default function ColorPickerFaqSection() {
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
          Choosing the right color is easy, finding its exact digital code is where most people get stuck.
          Whether you're a designer trying to match a brand color, a developer pulling a value for CSS, or
          someone editing a photo who just wants to know what shade of blue is in the sky, you need a fast and
          accurate way to convert visual color into usable code. That's exactly what this tool does. Built as
          part of the free utility collection on Tolz, the online color picker lets you select, extract, and
          convert colors into HEX, RGB, and HSL formats in seconds, without installing any software or
          creating an account.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Color codes aren't just for professional designers anymore. Anyone building a website, customizing
          a document, editing an image, or working on a presentation eventually runs into the need to identify
          or replicate a specific color. Guessing rarely works, the human eye is notoriously bad at judging
          exact shades, and even a slightly wrong RGB value can throw off an entire design. A reliable color
          picker removes that guesswork entirely.
        </p>
      </div>

      {/* What it is */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is an Online Color Picker Tool</h2>
        <p style={pStyle}>
          An online color picker is a browser-based utility that lets you select a color, either by choosing
          it directly from a color spectrum, uploading an image, or entering a known value, and instantly
          returns that color's code in multiple formats. Instead of relying on desktop software like
          Photoshop or manually searching color charts, you get the same functionality directly in your
          browser.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool works by translating visual color data into standardized formats that computers and design
          software understand: HEX codes for web and design use, RGB values for screens and digital displays,
          and HSL for more intuitive hue-based adjustments. This makes it useful across a wide range of tasks,
          from web development to interior design mood boards.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need a Color Picker</h2>
        <p style={pStyle}>
          Color identification comes up more often than people expect, and usually at moments when accuracy
          matters most. Here are common situations where this tool becomes essential:
        </p>
        <ul style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Web and app design.</strong> Developers frequently need to match a color from a reference
            image, competitor website, or brand asset. Instead of estimating the HEX code, you can extract it
            directly and drop it straight into your CSS or design file.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Brand consistency.</strong> Businesses often need their logo, website, and marketing
            materials to use the exact same color across platforms. A single shade of blue can look slightly
            different depending on the format it's saved in, a color picker ensures every asset uses the
            precise, matching code.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Graphic design and print work.</strong> Designers working across digital and print media
            need to convert between color models, since print relies on different systems than screens.
            Extracting an accurate RGB or HEX value is the first step before converting it further for
            specific print needs.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Photo editing.</strong> When editing images, knowing the exact color of a specific pixel,
            a skin tone, a background shade, a product color, helps with accurate retouching, color
            correction, and consistency across a batch of photos.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Interior design and product mockups.</strong> Designers working on physical spaces or
            products often pull colors from reference photos to build palettes, ensuring wall colors,
            furniture, or packaging align with a chosen aesthetic.
          </li>
          <li>
            <strong>Learning and troubleshooting code.</strong> Developers debugging a stylesheet often need
            to quickly verify what color a specific HEX or RGB value actually represents, especially when
            working with unfamiliar codebases.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          In each of these cases, the alternative, installing dedicated software, using a physical color
          reference book, or eyeballing a shade, is slower and far less accurate than a purpose-built online
          tool.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Tolz Color Picker</h2>
        <p style={pStyle}>
          Using the tool requires no technical background. The process is built to be immediate and
          intuitive:
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            Open the color picker tool and either select a color from the interactive color spectrum or upload
            an image containing the color you want to identify.
          </li>
          <li style={{ marginBottom: 8 }}>
            If uploading an image, click directly on the specific pixel or area whose color you want to
            extract.
          </li>
          <li style={{ marginBottom: 8 }}>
            The tool instantly displays the corresponding HEX, RGB, and HSL values for that color.
          </li>
          <li>
            Copy the code in your preferred format and use it directly in your design software, code editor,
            or document.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          There's no software to download, no plugin to install, and no account required to complete the
          process. The entire workflow happens in the browser, which makes it accessible on any device with an
          internet connection, including tablets and mobile phones.
        </p>
      </div>

      {/* Understanding formats */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Understanding HEX, RGB, and HSL Color Codes</h2>
        <p style={pStyle}>
          Not everyone working with color needs to memorize these formats, but understanding the basics helps
          you choose the right one for your project.
        </p>
        <p style={pStyle}>
          <strong>HEX codes</strong> are six-character combinations of numbers and letters (like #3498DB)
          preceded by a hash symbol. They're the standard format for web design and are widely used in CSS,
          HTML, and most design software because they're compact and easy to copy-paste.
        </p>
        <p style={pStyle}>
          <strong>RGB values</strong> represent color as a combination of red, green, and blue light
          intensity, each measured on a scale from 0 to 255 (for example, rgb(52, 152, 219)). This format is
          common in digital displays and is often used when precise control over brightness and channel mixing
          is needed, such as in image editing software.
        </p>
        <p style={pStyle}>
          <strong>HSL values</strong> describe color using hue, saturation, and lightness rather than color
          channels. This format is often more intuitive for adjusting a color's shade, increasing lightness
          makes a color paler, while adjusting saturation makes it more or less vivid, without changing the
          base hue. Developers frequently prefer HSL when they need to programmatically generate color
          variations, such as lighter or darker versions of a brand color.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Having all three formats available from a single color selection saves the extra step of manually
          converting between them, which is a common source of small but costly errors in design work.
        </p>
      </div>

      {/* What makes it different */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Makes This Color Picker Different</h2>
        <p style={pStyle}>
          Many color tools online are cluttered with ads, require software downloads, or only support a single
          color format. This tool is built around a simpler principle: accurate results, delivered instantly,
          without unnecessary friction.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It supports multiple color formats in a single selection, works directly from uploaded images so you
          can extract real colors rather than approximate ones, and returns results immediately without page
          reloads or processing delays. Because it runs entirely in the browser, there's no compatibility
          issue between operating systems, it works the same way on Windows, macOS, Chromebooks, and mobile
          devices. The tool is also designed for repeated use. Designers and developers rarely need to pick
          just one color; they often need to build out an entire palette or check several shades from the same
          image. The interface is built to support that kind of quick, repeated interaction without needing to
          reload the tool or start over each time.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Security, and Free Access</h2>
        <p style={pStyle}>
          Data handling matters, especially when a tool involves uploading images. This color picker is free
          to use, requires no account or signup, and carries no hidden charges or premium tiers, every feature
          is available to every user from the first visit. Images uploaded for color extraction are used only
          to process the color values you request and are not stored or retained on the server after your
          session, so you don't need to worry about sensitive design files, personal photos, or brand assets
          being kept anywhere beyond your immediate use.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are no watermarks added to any output, no limits on how many times you can use the tool in a
          session, and no forced registration walls blocking access to core features. This makes it a
          practical option for freelancers, students, small businesses, and professionals who need a
          dependable utility without navigating subscription models or data-sharing concerns.
        </p>
      </div>

      {/* Mistakes to avoid */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes to Avoid When Picking Colors</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Even with an accurate tool, a few habits can lead to inconsistent results. Screen calibration varies
          between monitors, so a color that looks correct on one display might appear slightly different on
          another, for critical brand work, it's worth cross-checking the extracted code against a known
          reference. Compression artifacts in low-quality images can also distort colors slightly, especially
          in JPEG files with heavy compression; picking colors from a higher-resolution or uncompressed image
          source tends to give more reliable results. Finally, mixing color formats inconsistently across a
          single project, such as using HEX in some places and RGB in others, can create confusion during
          development; it's generally best to standardize on one format per project unless there's a specific
          technical reason to switch.
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
