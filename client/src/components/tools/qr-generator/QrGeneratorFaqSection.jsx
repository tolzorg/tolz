import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this QR code generator free to use?",
    a: "Yes. The tool is completely free, with no hidden fees or paid tiers required to generate and download a QR code.",
  },
  {
    q: "Do I need to create an account to generate a QR code?",
    a: "No signup or account is required. You can enter your information and download your QR code directly.",
  },
  {
    q: "Will my QR code have a watermark on it?",
    a: "No. The generated QR code is clean and ready to use without any watermark or branding added.",
  },
  {
    q: "What types of QR codes can I create?",
    a: "You can generate QR codes for website URLs, plain text, Wi-Fi network access, email addresses, phone numbers, and contact (vCard) details.",
  },
  {
    q: "Can I use a generated QR code for printing?",
    a: "Yes, as long as you download it at an adequate size and resolution. For print materials, it's best to generate a larger version and test-scan it before mass printing.",
  },
  {
    q: "Why isn't my QR code scanning correctly?",
    a: "The most common causes are low contrast between the code and background, a code that's too small for print, incorrect input data, or a low-resolution download. Testing the code before wide distribution helps catch these issues early.",
  },
  {
    q: "Is the information I enter stored or shared?",
    a: "The details you enter are used only to generate the QR code you requested and are not required for any account or profile on our end.",
  },
  {
    q: "What's the difference between a static and dynamic QR code?",
    a: "A static QR code encodes fixed data that can't be changed after creation, if the link or details change, you need a new code. A dynamic QR code redirects through an editable link, allowing the destination to be updated without reprinting the code. This tool generates standard static QR codes suited to most one-time or fixed-content needs.",
  },
  {
    q: "Can I add a logo or custom design to my QR code?",
    a: "Design customization depends on the options available in the generator interface; where supported, keep any added logo small and central so it doesn't interfere with the code's scannability.",
  },
  {
    q: "Do QR codes expire?",
    a: "A standard (static) QR code does not expire, it will keep working as long as the encoded content (like a URL) remains active and valid.",
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

export default function QrGeneratorFaqSection() {
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
        <h2 style={h2Style}>Turn Any Link, Text, or Detail Into a Scannable QR Code</h2>
        <p style={pStyle}>
          A QR code generator gives you a fast, reliable way to turn a website link, a block of text, contact
          details, or Wi-Fi credentials into a scannable image that any smartphone camera can read in seconds.
          Whether you're printing a menu, adding a code to a business card, or sharing a link at an event,
          this free QR code generator on Tolz lets you create a clean, high-quality QR code in moments, no
          design software, no account creation, and no cost involved. It's built to be simple enough for a
          first-time user and flexible enough for someone generating codes regularly for business or
          marketing work.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unlike many QR tools that lock basic features behind a paywall or stamp a watermark on your
          download, this generator focuses on giving you a usable, print-ready output right away. You type or
          paste your content, adjust a few settings if needed, and download the finished code. That
          straightforward workflow is exactly what most people searching for a QR code generator are looking
          for, a fast result without unnecessary steps.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a QR Code Generator</h2>
        <p style={pStyle}>
          QR codes have become a normal part of daily life because they solve a simple problem: getting
          someone from a physical object or space to a digital destination without them having to type
          anything. Understanding the real situations where this tool is useful makes it easier to see why
          it's worth having on hand.
        </p>
        <p style={pStyle}>
          <strong>Business and marketing materials.</strong> Restaurants use QR codes to link directly to
          digital menus instead of reprinting paper ones every time a price or dish changes. Retailers place
          them on packaging or shelf tags to link to product pages, reviews, or instructional videos.
          Marketers add them to flyers, posters, and business cards so a printed piece can drive traffic
          straight to a website, landing page, or social profile.
        </p>
        <p style={pStyle}>
          <strong>Events and hospitality.</strong> Event organizers generate QR codes for ticket check-in,
          schedules, or feedback forms. Hotels and short-term rentals use them to share Wi-Fi credentials or
          house guides with guests without requiring an app or account setup.
        </p>
        <p style={pStyle}>
          <strong>Personal and everyday use.</strong> People generate a QR code to quickly share a Wi-Fi
          password with visitors, put contact details on a resume, or attach a code to a gift that links to a
          video message or playlist. Students and professionals also use QR codes to share portfolio links or
          documents during presentations.
        </p>
        <p style={pStyle}>
          <strong>Print and packaging.</strong> Because QR codes can be scaled and printed, they're commonly
          used on physical products, signage, vehicle wraps, and packaging inserts where a clickable link
          isn't possible but a scannable one is.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In each of these cases, the requirement is the same: a clean, accurately encoded QR code that scans
          reliably the first time, without extra software or a paid subscription.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the QR Code Generator (Step-by-Step)</h2>
        <p style={pStyle}>Generating a QR code with this tool takes only a few steps:</p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose your content type.</strong> Decide what the code should point to, a website URL,
            plain text, an email address, a phone number, Wi-Fi details, or contact information.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Enter your information.</strong> Paste the URL or type the text/detail you want encoded.
            Double-check the input, especially links, since an incorrect URL will produce a code that leads
            nowhere useful.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Adjust settings if needed.</strong> Depending on your use case, you can typically set the
            size and, where offered, the error correction level, which affects how well the code scans if it's
            partially damaged, dirty, or printed small.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Generate the code.</strong> The tool instantly renders a preview so you can confirm it
            looks correct before downloading.
          </li>
          <li>
            <strong>Download and test.</strong> Save the QR code in your preferred format, then scan it with a
            phone camera to confirm it opens the correct destination before printing or distributing it
            widely.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          This process is intentionally short because most people generating a QR code are doing it in the
          middle of another task, designing a flyer, finishing a menu, or setting up a Wi-Fi sign, and don't
          want the code creation step to slow them down.
        </p>
      </div>

      {/* Types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Types of QR Codes You Can Create</h2>
        <p style={pStyle}>
          Not all QR codes serve the same purpose, and knowing the difference helps you pick the right one for
          your situation.
        </p>
        <p style={pStyle}>
          <strong>URL QR codes</strong> are the most common type, redirecting a scan directly to a website,
          landing page, product page, or social media profile. This is the go-to choice for marketing
          materials and packaging.
        </p>
        <p style={pStyle}>
          <strong>Text QR codes</strong> encode a plain message directly into the code, useful for
          instructions, short notes, or messages that don't require an internet connection to read once
          scanned.
        </p>
        <p style={pStyle}>
          <strong>Wi-Fi QR codes</strong> store a network name and password so guests can connect
          automatically by scanning, rather than typing a long password manually, a common addition to cafes,
          offices, and rental properties.
        </p>
        <p style={pStyle}>
          <strong>Contact (vCard) QR codes</strong> hold a name, phone number, email, and sometimes a company
          or job title, letting someone add your details straight to their phone contacts after scanning, a
          practical upgrade over a paper business card.
        </p>
        <p style={pStyle}>
          <strong>Email and phone QR codes</strong> pre-fill an email draft or a phone dialer when scanned,
          which speeds up the process of reaching a business or individual directly from printed material.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Choosing the right type up front matters because it affects both the scanning experience and how
          the recipient's phone reacts. Some phones open a browser automatically for URLs, while others prompt
          to save a contact or connect to a network, depending on the code's data structure.
        </p>
      </div>

      {/* Customization */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Customization and Output Quality</h2>
        <p style={pStyle}>
          A QR code is only useful if it scans cleanly, and scan reliability depends on a few technical
          factors this tool accounts for. Error correction allows a QR code to still be read even if part of
          it is smudged, torn, or partially covered by a logo, helpful for codes placed on physical products
          or outdoor signage. Size and resolution matter especially for print use; a code that looks fine on a
          screen can become unreadable if scaled down too far or printed at low resolution, so it's worth
          generating a slightly larger, higher-resolution version for anything going to print.
        </p>
        <p style={pStyle}>
          Output format also affects usability. A downloadable image works for most digital and print needs,
          while contrast between the code and its background should always remain high, light-colored codes
          on light backgrounds, or heavily stylized designs with low contrast, are a common reason QR codes
          fail to scan even when the underlying data is correct.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before distributing any QR code widely, especially on printed materials that can't be easily
          corrected, it's worth testing it across a couple of different phones and lighting conditions to
          confirm it scans smoothly every time.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost, and Trust</h2>
        <p style={pStyle}>
          For a tool this simple, trust comes down to a few practical points. This QR code generator is
          completely free to use, with no hidden charges, subscription requirement, or paywalled features
          blocking basic generation. There's no signup or account creation needed, you can open the page,
          enter your information, and download your QR code without providing an email address or personal
          details.
        </p>
        <p style={pStyle}>
          On the privacy side, the information you enter is used only to generate the code you requested and
          is not required for any account, profile, or ongoing storage on our end. This makes the tool a
          reasonable choice for quick, one-off tasks like generating a Wi-Fi code for guests or a link for a
          flyer, where you don't want to create an account just to complete a small task.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's worth noting that once a QR code is generated and downloaded, the resulting image itself
          contains the data you entered, so if you're encoding sensitive information like a personal phone
          number or private link, treat the printed or shared code the same way you'd treat that information
          in any other public-facing format, since anyone who scans it can access what's encoded.
        </p>
      </div>

      {/* Why this tool */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Use This QR Code Generator Over Other Tools</h2>
        <p style={pStyle}>
          Many QR code tools online restrict basic functionality, limiting downloads, adding watermarks, or
          requiring an account before you can even preview your code. This tool is built around the opposite
          approach: generate, preview, and download without friction. It supports the common QR code types
          people actually search for, produces clean output suitable for both digital sharing and print, and
          doesn't require repeat visits to a paid dashboard just to create a single code for a one-time need.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For anyone who needs a dependable QR code generator without extra steps, students, small business
          owners, event planners, or anyone printing a single flyer, that combination of speed, clarity, and
          no cost is usually the deciding factor over more complex, sign-up-required alternatives.
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
