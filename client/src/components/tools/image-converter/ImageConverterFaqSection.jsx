import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this image converter really free to use?",
    a: "Yes. The tool is completely free with no signup, subscription, or hidden fees. You can convert images and use the OCR feature without creating an account.",
  },
  {
    q: "What image formats can I convert between?",
    a: "You can convert between JPG, PNG, PDF, WebP, BMP, GIF, TIFF, and HEIC, in most directions — for example, JPG to PDF or PNG to JPG.",
  },
  {
    q: "Will converting my image reduce its quality?",
    a: "Quality is preserved as closely as possible during conversion. Lossless formats like PNG retain full quality, while JPG conversions balance file size and clarity without introducing noticeable degradation.",
  },
  {
    q: "Can I convert multiple images into one PDF?",
    a: "Yes, you can combine multiple images into a single PDF file, which is useful for applications, scanned documents, or multi-page submissions.",
  },
  {
    q: "Does the OCR feature work on handwritten text?",
    a: "It works best on clear, printed text. Handwriting recognition is less reliable and may require manual correction after extraction, depending on legibility.",
  },
  {
    q: "Is it safe to convert sensitive documents like IDs or contracts?",
    a: "Uploaded files are processed only to complete your requested conversion and are not stored or shared afterward, making it suitable for sensitive documents.",
  },
  {
    q: "Do I need to install any software to use this converter?",
    a: "No. The tool works entirely in your browser on both desktop and mobile devices, with no downloads or installations required.",
  },
  {
    q: "Why is my HEIC photo not opening on other devices?",
    a: "HEIC is an Apple-specific format not universally supported outside iOS. Converting it to JPG or PNG resolves compatibility issues on other devices and platforms.",
  },
  {
    q: "Can I use this tool on my phone?",
    a: "Yes. The converter works directly through mobile browsers, so no dedicated app is needed to convert images or run OCR on the go.",
  },
  {
    q: "What's the difference between JPG and PNG for my use case?",
    a: "JPG is better for photographs due to smaller file sizes, while PNG is better for images needing transparency or sharp detail, such as logos and screenshots.",
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
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
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

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Convert Images in Seconds, Completely Free</h2>
        <p style={pStyle}>
          Switching an image from one format to another shouldn't require installing software or learning a
          complicated program. This image converter online tool from{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> lets you convert images to JPG, PNG, PDF, and
          several other formats directly in your browser, along with a built-in OCR feature that extracts
          editable text from images. Whether you're preparing a photo for a website, compressing a scanned
          document, or pulling text out of a screenshot, this all-in-one tool handles it without downloads,
          watermarks, or hidden steps. Everything runs in the same interface, so you never have to juggle
          multiple single-purpose converters just to finish one task.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Unlike many single-format tools scattered across the web, this converter combines eight distinct
          functions into a single workflow. That means fewer tabs open, fewer files bouncing between apps,
          and a much faster path from "I have this image" to "I have what I actually need."
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why You Might Need an Image Converter (Practical Scenarios)</h2>
        <p style={pStyle}>
          Image format needs come up more often than people expect, and the right format usually depends on
          where the image is going next.
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Uploading to a website or CMS.</strong> Many platforms only accept specific formats or
            have file-size limits. Converting a large PNG to a compressed JPG, or a HEIC photo from an
            iPhone into a universally supported format, avoids upload errors and speeds up page load times.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Submitting documents or applications.</strong> Scanned IDs, certificates, or receipts
            saved as images often need to become a single PDF for official submissions, job applications, or
            visa paperwork. Combining and converting multiple images into one PDF keeps everything organized
            and easy to send.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Printing photos or designs.</strong> Print services frequently require specific formats
            and resolutions. Converting an image to a print-ready format prevents color shifts, blurring, or
            rejected print jobs.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Digitizing printed or scanned text.</strong> A photographed page of notes, a screenshot
            of a contract, or a scanned book excerpt is only useful if the text inside it can be copied,
            searched, or edited. The OCR function extracts that text automatically, saving the time it would
            take to retype it manually.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Reducing file size for email or storage.</strong> Email providers and cloud storage
            plans often cap attachment sizes. Converting and compressing an image keeps quality intact while
            making the file easier to send or store.
          </li>
          <li>
            <strong>Archiving or backing up photos.</strong> Some formats age better than others for
            long-term storage. Converting older or less common formats into widely supported ones like JPG
            or PNG helps ensure files remain accessible years down the line.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Formats Supported: JPG, PNG, PDF, WebP, and More</h2>
        <p style={pStyle}>
          A reliable image converter needs to support the formats people actually use, not just the common
          ones. This tool handles conversions between JPG, PNG, PDF, WebP, BMP, GIF, TIFF, and HEIC,
          covering nearly every scenario from casual photo sharing to professional document handling.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            JPG remains the standard for photographs and web images due to its balance of quality and
            compact file size.
          </li>
          <li style={{ marginBottom: 8 }}>
            PNG is preferred when transparency or sharp detail matters, such as logos, graphics, or
            screenshots.
          </li>
          <li style={{ marginBottom: 8 }}>
            PDF is the go-to format for documents, applications, and anything meant to be printed or shared
            as a single file.
          </li>
          <li style={{ marginBottom: 8 }}>
            WebP is increasingly used on modern websites because it offers smaller file sizes without a
            noticeable drop in quality.
          </li>
          <li style={{ marginBottom: 8 }}>
            HEIC, common on iPhones, often needs converting to JPG or PNG for compatibility with non-Apple
            devices and older software.
          </li>
          <li>
            TIFF and BMP are still used in specific professional and archival contexts where uncompressed
            image data matters.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10 }}>
          Because the tool covers both directions of conversion, for example, JPG to PDF and PDF to JPG, it
          functions as a single hub rather than requiring a different tool for every format pairing.
        </p>
        <p style={pStyle}>
          Here's a quick breakdown of what each format is actually good for, so choosing the right one takes
          less guesswork:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>JPG</strong> — the most widely supported image format on the web, ideal for photos where
            a small file size matters more than pixel-perfect detail.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>PNG</strong> — the better choice when an image needs a transparent background or sharp
            edges, such as logos, icons, or text-heavy graphics.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>PDF</strong> — the standard for documents, forms, and anything meant to be printed,
            signed, or submitted as one combined file.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>WebP</strong> — a newer format built for the web that shrinks file size noticeably
            without a visible quality drop, which is why more websites use it for faster page loads.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>HEIC</strong> — Apple's default photo format on iPhones; convert it to JPG or PNG when
            sharing with non-Apple devices or apps that don't recognize HEIC.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>BMP</strong> — an older, uncompressed format still used in some legacy software and
            Windows-based systems where exact pixel data matters more than file size.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>GIF</strong> — best known for simple animations and short looping clips, though it also
            works for basic static images with limited colors.
          </li>
          <li>
            <strong>TIFF</strong> — common in printing, publishing, and scanning workflows where preserving
            maximum image detail is more important than file size.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Convert to JPG Specifically?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          JPG deserves a special mention because it's the format most people end up converting to,
          regardless of what they started with. It's the most universally accessible image format, nearly
          every device, browser, app, and photo viewer can open it without issue. Converting a PNG, BMP,
          WebP, HEIC, or even a PDF page into JPG also compresses the file, which means faster uploads,
          quicker page loads, and easier sharing over email or messaging apps, all without a noticeable drop
          in visual quality for everyday use. If you're not sure which format to pick and just need
          something that "works everywhere," JPG is usually the safest default.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Maintaining Image Quality During Conversion</h2>
        <p style={pStyle}>
          A common concern with online converters is quality loss, images that come out blurry, oddly
          compressed, or noticeably different from the original. This tool is built to preserve visual
          quality during conversion, keeping resolution and detail as close to the source file as possible.
          For formats like PNG that don't use lossy compression, no quality is lost in the process at all.
          For JPG conversions, which do use compression by nature, the tool balances file size reduction
          with visual clarity so images stay sharp without becoming unnecessarily large.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If file size is the priority, for example, when preparing images for a website where load speed
          matters, converting to a more compressed format like JPG or WebP can noticeably shrink file size
          while keeping the image looking clean at normal viewing sizes.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Convert an Image (Step-by-Step)</h2>
        <ol style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            Open the image converter tool and upload your file by dragging it into the tool or selecting it
            from your device.
          </li>
          <li style={{ marginBottom: 8 }}>
            Choose the format you want to convert to, JPG, PNG, PDF, WebP, or another supported option.
          </li>
          <li style={{ marginBottom: 8 }}>
            If you're extracting text, select the OCR function instead of a format conversion.
          </li>
          <li style={{ marginBottom: 8 }}>
            Let the tool process the file; most conversions complete within seconds.
          </li>
          <li>Download the converted file directly to your device.</li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          The process works the same way whether you're on a desktop browser or a mobile device, so there's
          no need for a separate app on your phone.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Image Converter Really Free? Privacy & Trust</h2>
        <p style={pStyle}>
          This image converter is completely free to use, with no signup, account creation, or hidden
          charges required at any step. There's no limit disguised behind a paywall and no "free trial" that
          quietly expects payment later, the tool functions fully without asking for personal information.
        </p>
        <p style={pStyle}>
          On the privacy side, uploaded images are processed for the sole purpose of completing the
          requested conversion and are not stored for later use or shared with third parties. You're not
          required to create an account, provide an email address, or install anything on your device, which
          reduces the amount of personal data exposed in the process. For anyone converting sensitive
          documents, IDs, contracts, financial paperwork, this matters as much as conversion quality does,
          since the tool should do its job without becoming a place where files linger longer than
          necessary.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because everything runs directly through the browser, there's also no risk of bundled software,
          browser extensions, or unwanted add-ons that some desktop converter programs are known to install.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes to Avoid When Converting Images</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Converting an already-compressed JPG to PNG expecting quality gains.</strong> Converting
            to a less compressed format doesn't restore detail that was lost in the original compression, it
            only changes the file type.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Ignoring resolution before converting to PDF for printing.</strong> Low-resolution
            images will still look pixelated in a PDF, regardless of format.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Running OCR on low-contrast or skewed images.</strong> Straightening and improving
            lighting on a photo before extraction noticeably improves text accuracy.
          </li>
          <li>
            <strong>Assuming all formats support transparency.</strong> JPG does not support transparent
            backgrounds; PNG does. Converting a transparent PNG to JPG will fill the background with a solid
            color.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Uses This Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This converter is used across a wide range of everyday and professional needs: students
          digitizing notes, freelancers preparing deliverables in the right format for clients, small
          business owners converting product photos for online stores, job seekers assembling application
          documents into a single PDF, and anyone dealing with the common frustration of a file that's
          "almost" the right format but not quite. Because it consolidates eight tools into one interface,
          it also appeals to people who'd rather not bookmark eight different single-purpose websites for
          occasional use.
        </p>
      </div>

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
