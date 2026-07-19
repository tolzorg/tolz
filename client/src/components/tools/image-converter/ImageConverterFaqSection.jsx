import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this image converter free to use?",
    a: "Yes. The Image Converter is completely free with no hidden charges, no subscription, and no signup required. You can convert as many images as you need without creating an account.",
  },
  {
    q: "Which image formats can I convert between?",
    a: "The tool supports the formats people use most, including JPG/JPEG, PNG, WebP, HEIC/HEIF, GIF, BMP, TIFF, and AVIF. You choose the output format for each conversion, so you can move freely between them.",
  },
  {
    q: "How do I convert HEIC to JPG?",
    a: "Upload the HEIC file, choose JPG as the output format, and start the conversion. Once it finishes, download the JPG — it will open on virtually any device, unlike the original HEIC.",
  },
  {
    q: "Will converting an image reduce its quality?",
    a: "It depends on the format. Converting to a lossless format like PNG preserves every pixel, while converting to a lossy format like JPG applies compression to save space. For most everyday conversions the difference is not noticeable, and you can choose a format that matches whether size or maximum detail matters more to you.",
  },
  {
    q: "Does the converter add a watermark to my images?",
    a: "No. Your converted images come out clean, with no watermark added, so they're ready to use immediately.",
  },
  {
    q: "Can I convert several images at once?",
    a: "Yes. You can upload multiple files for a batch conversion and download the results together, which is far faster than converting them one by one.",
  },
  {
    q: "Do I need to install any software or sign up?",
    a: "No. The tool runs entirely in your browser, so there's nothing to download and no account to create. Just open the page and start converting.",
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
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
  color: "var(--text-primary)", marginBottom: 6, marginTop: 12,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

export default function ImageConverterFaqSection() {
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The Image Converter from <Link to="/" className="inline-home-link">Tolz</Link> lets you change any picture from one format to another directly in
          your browser, with no software to install and no account to create. Whether you need to turn a HEIC
          photo from your iPhone into a shareable JPG, shrink a heavy PNG into a lightweight WebP, or prepare
          graphics for a website, this free image converter handles the job in a few clicks. Everything runs
          on a simple upload-and-download flow, so a task that once meant opening a bulky desktop editor now
          takes seconds.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Image Converter Does</h2>
        <p style={pStyle}>
          An image converter takes a file saved in one format and rewrites it into a different one while
          keeping the picture itself intact. This matters because formats such as JPG, PNG, WebP, and HEIC
          store the same image in very different ways — some are built for the smallest possible file size,
          others preserve transparency or maximum detail. The tool reads your original file, decodes its
          pixels, and re-encodes them into the format you select, so the result opens correctly wherever you
          plan to use it. You stay in control of the output, choosing exactly which format you want rather
          than accepting whatever a single-purpose app forces on you.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool is made for anyone who works with images but doesn't want the weight of professional
          editing software. That includes bloggers and site owners tuning page speed, students and office
          workers preparing documents, online sellers formatting product photos, designers swapping files with
          clients, and everyday users who simply want a phone photo to open on a Windows PC. Because the whole
          thing runs in the browser, it behaves the same on Windows, macOS, Linux, Android, and iOS, with no
          version conflicts or compatibility surprises to deal with.
        </p>
      </div>

      {/* Supported formats */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Supported Formats and Popular Conversions</h2>
        <p style={pStyle}>
          The value of any image converter comes down to the range of formats it understands, and this tool
          covers the ones people actually use. JPG (JPEG) remains the universal choice for photographs,
          keeping file sizes small through lossy compression. PNG is the go-to for logos, screenshots, and
          anything that needs crisp edges or a transparent background. WebP is a modern format that produces
          noticeably smaller files than JPG or PNG at comparable quality, which is why it has become a
          favorite for speeding up websites. HEIC and HEIF are the efficient default formats on newer iPhones,
          though they often refuse to open outside the Apple ecosystem. GIF still handles simple animations
          and low-color graphics, while BMP and TIFF serve high-fidelity printing and archiving. AVIF rounds
          out the list as a newer, highly efficient format now supported across most current browsers.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In practice, a handful of conversions come up again and again. Converting PNG to JPG is the classic
          way to cut down a large graphic for email or upload. Converting JPG to PNG is how you move a photo
          into a format that supports transparency. Turning HEIC into JPG solves the frustration of an iPhone
          photo that won't display on another device, and converting images to WebP is one of the quickest
          wins for a site owner chasing faster load times. Because you pick the exact output every time,
          you're never boxed into a single conversion path.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Image Converter</h2>
        <p style={pStyle}>
          The tool is designed so that anyone can complete a conversion without instructions, but here is the
          full flow from start to finish:
        </p>
        <ol style={{ ...pStyle, marginBottom: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Upload your image.</strong> Drag your file into the upload area, or click to browse and
            select it from your device. You can also add several images at once for a batch conversion.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Choose the output format.</strong> Select the format you want to convert to, for example
            JPG, PNG, WebP, or another supported option from the list.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Adjust settings if needed.</strong> Where available, set quality or size preferences to
            balance clarity against file size for your specific use.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Start the conversion.</strong> Confirm your choices and let the tool process the file.
            Most images convert almost instantly.
          </li>
          <li>
            <strong>Download the result.</strong> Save the converted image to your device. When you convert
            several files together, you can download them in one go.
          </li>
        </ol>
      </div>

      {/* Why you might need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Might Need an Image Converter</h2>
        <p style={pStyle}>
          The need for an image converter tends to show up at the worst possible moment, usually when a file
          simply won't cooperate with the place you're trying to put it. A website's upload form rejects your
          PNG because it exceeds the size limit, and converting it to JPG immediately solves the problem. A
          colleague sends photos straight from their iPhone in HEIC, and none of them open on your office
          computer until you convert them to JPG. You're building a logo overlay and the background needs to
          disappear, which means moving from JPG to PNG for its transparency support.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Website owners and content creators run into this constantly. Search engines reward fast pages, and
          heavy images are one of the most common reasons a page loads slowly, so converting photos to WebP or
          a well-compressed JPG can meaningfully improve performance and user experience. Online sellers face
          marketplace rules that specify accepted formats and dimensions, and a quick conversion keeps listings
          compliant. Print shops often require TIFF or high-quality PNG for sharp output, while social
          platforms and messaging apps prefer lighter JPGs. In each of these cases, a reliable image converter
          is the small tool that removes a frustrating roadblock and lets you get on with the real work.
        </p>
      </div>

      {/* Quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Converting Images Without Losing Quality</h2>
        <p style={pStyle}>
          One of the most common worries is whether converting an image will damage it, and understanding the
          difference between two compression types answers most of that concern. Lossy formats like JPG
          shrink files by permanently discarding detail the eye is unlikely to notice, which is perfect for
          photographs but not ideal for repeated re-saving. Lossless formats like PNG keep every pixel exactly
          as it was, producing larger files but no degradation. Knowing this lets you convert with intent: use
          JPG or WebP when small size matters most, and PNG or TIFF when preserving every detail is the
          priority.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Transparency is the other detail worth planning around. PNG and WebP support an alpha channel,
          meaning parts of the image can be see-through, essential for logos and overlays. JPG does not
          support transparency, so converting a transparent PNG to JPG replaces the empty areas with a solid
          background, usually white. If keeping a transparent background is important, choose an output
          format that supports it. For everyday conversions, the tool aims to preserve the original resolution
          and clarity so that your converted file looks the same as what you started with, only in the format
          you actually need.
        </p>
      </div>

      {/* Free/private/secure */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Secure — No Signup Required</h2>
        <p style={pStyle}>
          Trust matters when you're handing a tool your personal photos or work files, so it's worth being
          clear about how this one operates. The Image Converter is completely free to use, with no hidden
          charges, no subscription, and no trial that quietly starts billing you. There is no signup or login
          step — you can open the page and convert a file straight away, without handing over an email address
          or creating an account.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Your files are processed only to perform the conversion you asked for, and the tool doesn't add
          watermarks to your results, so the output is clean and ready to use. Because the tool works right in
          your browser, converting an image is quick and requires no download of desktop software that could
          clutter your machine. That combination — free, no signup, no watermark, and no unnecessary friction —
          is what makes it practical to reach for whenever a stubborn file gets in your way.
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
