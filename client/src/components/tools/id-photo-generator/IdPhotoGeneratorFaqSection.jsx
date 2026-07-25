import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this passport photo maker really free to use?",
    a: "Yes. There are no charges for cropping your photo, generating a print sheet, or exporting it as a PDF, PNG, or JPEG.",
  },
  {
    q: "Do I need to create an account to use the ID photo generator?",
    a: "No signup is required. You can upload a photo, generate your print sheet, and download it immediately.",
  },
  {
    q: "What size is a standard US passport photo?",
    a: "A US passport or visa photo must be 2 x 2 inches (51 x 51 mm), with the head measuring between 1 inch and 1⅜ inches from chin to the top of the hair, on a plain white or off-white background.",
  },
  {
    q: "Can I use this tool for visa photos, not just passports?",
    a: "Yes. The tool includes visa-specific templates in addition to passport and national ID formats, since sizing requirements can differ between them.",
  },
  {
    q: "How many passport photos fit on one 4x6 print sheet?",
    a: "A standard 4x6 inch print sheet comfortably fits four 2x2 inch passport photos, which is why it's the most common layout used by photo labs and home printers.",
  },
  {
    q: "What's the difference between the safe zone, cut line, and bleed line on the print sheet?",
    a: "The safe zone marks the area guaranteed to stay within the final photo after trimming, the cut line shows exactly where the photo will be cut, and the bleed line adds a small margin beyond that to account for minor printer or cutting shifts.",
  },
  {
    q: "Can I print the photo sheet at home instead of going to a photo counter?",
    a: "Yes. Exporting as a PDF preserves the correct print dimensions, so the sheet can be printed on a standard home printer or sent to any print shop.",
  },
  {
    q: "Will my photo be stored after I download it?",
    a: "The tool is built for a simple upload-crop-export workflow without requiring an account, so there's no need to keep a stored copy tied to your identity on the platform.",
  },
  {
    q: "Does the tool guarantee my passport photo will be accepted?",
    a: "The templates follow published official size and layout guidelines, but final approval always depends on the reviewing authority, such as a passport office or embassy, so it's worth double-checking current requirements before submitting.",
  },
  {
    q: "Can I make ID photos for something other than a passport, like a school or work badge?",
    a: "Yes. A custom size option is available for studio, school, and employee ID photos that don't follow a government passport format.",
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

export default function IdPhotoGeneratorFaqSection() {
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ID Photo Generator (Print Studio)",
    url: "https://www.tolz.org/tools/id-photo-generator",
    applicationCategory: "PhotoEditingApplication",
    operatingSystem: "Any (Web-based)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online passport photo maker and ID photo generator. Crop photos to official passport, visa, ID, or studio templates, lay out print sheets with safe/cut/bleed guides, and export as PDF, PNG, or JPEG.",
    publisher: { "@type": "Organization", name: "Tolz", url: "https://www.tolz.org/" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareAppSchema} />

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Getting a passport, visa, or ID photo right on the first try is harder than it looks, the margins
          are tight, the head-size rules are specific, and most photo apps aren't built with document
          compliance in mind. This passport photo maker solves that by combining accurate size templates with
          a print studio layout, so you get a photo that's correctly cropped and a print sheet that's actually
          ready to send to a printer. It's part of the free toolkit at{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, where the same "no clutter, just the tool"
          approach applies across every calculator, converter, and utility on the site.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Passport Photo Maker Actually Does</h2>
        <p style={pStyle}>
          Most people searching for a passport photo maker online aren't looking for a photo editor with a
          hundred filters, they need one specific outcome: a photo that meets a government or institution's
          exact size and layout rules. This ID photo generator handles that by working from real document
          templates rather than generic crop ratios. You upload a photo, choose the document type (US
          passport, visa, national ID, or a custom studio size), and the tool automatically applies the correct
          dimensions, head positioning guide, and background requirements for that template. From there, it
          arranges multiple copies of your photo on a single print sheet with the margins a photo lab or home
          printer actually needs, and exports the result as a print-ready PDF, PNG, or JPEG.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because the single biggest reason passport and visa photos get rejected isn't bad
          lighting, it's incorrect sizing. A photo that's a few millimeters off, or a head that's positioned
          slightly too high or low in the frame, is enough for an application to be flagged. A dedicated
          passport photo generator removes that guesswork by locking the crop to the template's exact
          specifications instead of leaving it to manual trial and error in a general-purpose editor.
        </p>
      </div>

      {/* Size requirements */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Passport, Visa, and ID Size Requirements This Tool Covers</h2>
        <p style={pStyle}>
          Photo size rules vary more than most people expect, and getting familiar with them helps explain why
          a purpose-built ID photo generator is worth using instead of a manual crop.
        </p>
        <p style={pStyle}>
          In the United States, passport and visa photos must be 2 x 2 inches (51 x 51 mm), with the head
          measuring between 1 inch and 1⅜ inches from the chin to the top of the hair, and the eyes positioned
          roughly 1⅛ to 1⅜ inches from the bottom edge of the photo. For digital submissions, such as the
          DS-160 visa application, the accepted pixel dimensions typically fall between 600x600 and 1200x1200
          pixels at 300 DPI, with a plain white or off-white background and no shadows.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other countries use different formats entirely, many use a 35 x 45 mm photo, while some ID cards and
          visa categories call for 50 x 70 mm or other regional sizes. Because there's no single global
          standard, a tool that lets you select the correct document template (rather than guessing at a
          generic square crop) is the difference between a photo that gets accepted and one that gets sent
          back. This ID photo generator includes commonly requested passport, visa, and national ID templates,
          along with a custom size option for studio photos, employee badges, school IDs, and similar documents
          that don't follow a standard government format.
        </p>
      </div>

      {/* Print sheets */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Print Sheets, Safe Zones, and Bleed Guides Explained</h2>
        <p style={pStyle}>
          Once a photo is correctly sized, the next problem most people run into is printing it. A single
          passport photo printed on its own wastes paper and money, and most labs expect multiple copies laid
          out on one sheet, typically a 4x6 inch print, which comfortably fits four 2x2 inch passport photos
          with margin to spare.
        </p>
        <p style={pStyle}>
          This is where the "Print Studio" side of the tool comes in. Rather than exporting a single cropped
          image, it lays out multiple copies of your photo on a standard print sheet using three reference
          lines that professional print shops rely on:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Safe zone</strong> — the area guaranteed to stay inside the final trimmed photo, keeping
            your head and shoulders away from any risk of being cut off.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Cut line</strong> — the exact line the photo will be trimmed along, matching the document's
            required dimensions.
          </li>
          <li>
            <strong>Bleed line</strong> — a small margin beyond the cut line that accounts for minor shifts in
            home or commercial printers, preventing thin white edges from appearing after trimming.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Without these guides, home-printed passport photos often come out slightly misaligned, with visible
          white borders or photos that are trimmed too close to the head. Building the sheet with proper bleed
          and cut margins means the output is ready for scissors, a paper cutter, or a photo kiosk without
          additional adjustment.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Need This Tool</h2>
        <p style={pStyle}>
          A passport photo maker is useful well beyond first-time passport applications. Some of the most
          common situations include:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Passport renewals and first-time applications.</strong> Renewing a passport or applying for
            the first time both require a recent photo meeting strict size and background rules, this tool
            produces a compliant crop in the correct format for direct upload or printing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Visa applications.</strong> Tourist, work, and student visas almost always require their
            own photo submission, often with slightly different rules from a passport photo. Selecting the
            correct visa template avoids a mismatch that could delay processing.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>National ID cards and residency documents.</strong> Many countries issue ID cards or
            residency permits that require a photo in a specific, non-passport format, the custom size option
            covers these cases.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>School and employee ID badges.</strong> Institutions issuing physical ID badges often need
            a consistent photo size across many people. Producing a correctly sized, print-ready sheet in
            batches saves a trip to a professional studio.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Replacing a lost or expired document photo.</strong> If an ID photo is needed again but
            there's no time (or budget) for a studio visit, this tool produces a compliant replacement from an
            existing photo in a few minutes.
          </li>
          <li>
            <strong>Printing at home instead of paying a photo counter.</strong> A pharmacy or photo counter
            typically charges a flat fee for passport photos regardless of how many copies are needed.
            Generating your own print sheet and printing it at home or at any standard photo printing service
            is significantly cheaper for multiple copies.
          </li>
        </ul>
      </div>

      {/* Output formats */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Output Formats: PDF, PNG, and JPEG</h2>
        <p style={pStyle}>Different situations call for different file types, so the tool supports exporting in three formats:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>PDF</strong> is the best choice when sending the print sheet to a professional photo lab or
            printing service, since it preserves exact measurements and print quality without compression
            artifacts.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>JPEG</strong> is typically what's required for online applications, such as digital visa or
            passport submissions, where file size limits and specific pixel dimensions apply.
          </li>
          <li>
            <strong>PNG</strong> is useful when the photo needs to be inserted into another document or form,
            such as a resume, ID card template, or application form, where a lossless format keeps image
            quality intact.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          Having all three options available from a single upload means you don't need to run the same photo
          through multiple tools depending on whether you're printing it or submitting it digitally.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Passport Photo Maker</h2>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            Upload a clear, front-facing photo, ideally against a plain background, similar to what's expected
            in the final document photo.
          </li>
          <li style={{ marginBottom: 8 }}>
            Select the document type: US passport, visa, national ID, or a custom size for studio and badge
            photos.
          </li>
          <li style={{ marginBottom: 8 }}>Adjust the crop so the head fits within the guide provided for that template.</li>
          <li style={{ marginBottom: 8 }}>
            Choose how many copies to lay out on the print sheet, along with the paper size (commonly 4x6
            inches).
          </li>
          <li style={{ marginBottom: 8 }}>Review the safe zone, cut line, and bleed guide on the generated sheet.</li>
          <li>Export as PDF for printing, or JPEG/PNG for digital upload.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 12, marginBottom: 0 }}>
          The entire process is designed to take a couple of minutes from upload to export, without needing any
          photo editing background.
        </p>
      </div>

      {/* Privacy / accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost</h2>
        <p style={pStyle}>
          Uploading a personal photo, especially one intended for an official document, naturally raises
          privacy questions, and it's worth being direct about how this tool handles that. No account or
          signup is required to use the ID photo generator, so there's no personal information tied to an
          account for anyone to manage. The tool is free to use, with no hidden charges for exporting your
          print sheet or downloading your file in any of the supported formats.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, the templates used for passport, visa, and ID sizing are built to match official
          published dimensions, including head-size ratios and background expectations. That said,
          requirements can be updated by government agencies, so it's worth confirming the current rules for
          your specific country or document type before submitting, this tool is built to get the sizing and
          layout precisely right, but final acceptance is always determined by the receiving authority.
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
