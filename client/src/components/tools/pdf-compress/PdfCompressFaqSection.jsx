import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the Compress PDF tool free to use?",
    a: "Yes. Compressing a PDF is completely free with no hidden charges, subscription, or trial limits. You can compress as many files as you need without paying.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No. There's no signup or registration required. You upload your file, compress it, and download the result without providing an email address or creating an account.",
  },
  {
    q: "Will compressing reduce the quality of my PDF?",
    a: "For normal use, no noticeable loss. Text stays sharp and clear, and images are optimised to a resolution that still looks clean on screen and in standard printing. You can compress a PDF without losing the quality that matters for reading, sharing, or everyday printing.",
  },
  {
    q: "How much smaller will my file get?",
    a: "It depends on what's inside. Image-heavy or scanned PDFs often shrink by 70% to 90%, while text-only documents shrink less because text is already compact. The tool shows you the new file size after compression.",
  },
  {
    q: "Is it safe to compress confidential documents online?",
    a: "Your files are processed securely and are not stored or shared, and no account is needed, so you don't leave personal data behind. For highly sensitive files, keeping a local master copy is always a good practice.",
  },
  {
    q: "Does the compressed PDF have a watermark?",
    a: "No. The tool does not add any watermark. Your compressed file looks exactly like the original, just smaller.",
  },
  {
    q: "Can I compress a PDF on my phone?",
    a: "Yes. The tool runs in your browser, so it works on Android and iOS phones and tablets as well as Windows and macOS computers, with nothing to install.",
  },
  {
    q: "Why won't my PDF attach to an email?",
    a: "Most email providers limit attachments to around 25 MB. If your PDF is larger, compress it first to bring it under the limit, then attach and send it as normal.",
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

export default function PdfCompressFaqSection() {
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
        <h2 style={h2Style}>Compress PDF Online — Reduce PDF File Size for Free</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Large PDF files are one of the most common everyday roadblocks: the document won't attach to an
          email, a portal rejects it for exceeding the upload limit, or a folder full of scanned reports
          quietly eats up your storage. The Compress PDF tool from Tolz solves this in seconds by reducing the
          size of any PDF while keeping it readable, printable, and professional. You upload your document,
          let the tool compress the PDF, and download a lighter version — no software installation, no
          account, and no cost. Whether you're dealing with a bloated 40 MB proposal or a stack of
          high-resolution scans, you can compress a PDF right here on the page and get a file that's easy to
          send, share, and store.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Compress PDF Tool Does</h2>
        <p style={pStyle}>
          At its core, this tool shrinks the file size of a PDF by optimising the elements that make documents
          heavy. Most oversized PDFs are large because of embedded images, high-resolution scans, duplicated
          fonts, and uncompressed data streams. The compressor analyses these components and rewrites them
          more efficiently — downsampling images to a sensible resolution, applying smarter image compression,
          and stripping redundant metadata — so the final compressed PDF carries the same content in a
          fraction of the space.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result is a genuine reduction in file size, often cutting a document by 40% to 90% depending on
          what's inside it. A text-heavy PDF may only shrink modestly because text is already compact, while
          an image-heavy or scanned PDF can drop dramatically. Because the tool works on the structure of the
          file rather than deleting pages or content, your document stays intact: the same pages, the same
          layout, the same reading experience, just lighter. This makes it a reliable way to reduce PDF file
          size without rebuilding the document from scratch.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Need to Compress a PDF</h2>
        <p style={pStyle}>
          The clearest sign you need to compress a PDF is when something refuses to accept your file. Email is
          the most frequent culprit — most providers cap attachments at around 25 MB, and a single scanned
          contract or image-rich brochure can blow past that easily. Compressing the file first turns a
          rejected attachment into one that sends instantly.
        </p>
        <p style={pStyle}>
          Online forms and portals are another common trigger. Job applications, university submissions, visa
          and immigration systems, tax portals, and tender platforms almost always enforce strict upload
          limits, sometimes as low as 2 MB or 5 MB. When your CV, transcript, or supporting document is just
          over the threshold, a quick compression is the difference between submitting on time and scrambling
          to fix it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are quieter reasons too. If you archive invoices, statements, or reports, compressed PDFs take
          up far less storage across your device and cloud accounts. Teams that share documents through chat
          apps or project tools benefit from lighter files that load faster for everyone. Anyone publishing a
          PDF on a website will find that a smaller file improves page load speed and the visitor experience.
          And if you routinely scan paperwork, those scans are notoriously large — compressing them keeps your
          digital filing system lean. In each of these situations, the ability to compress a large PDF file
          quickly saves both time and frustration.
        </p>
      </div>

      {/* Without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Compress a PDF Without Losing Quality</h2>
        <p style={pStyle}>
          The concern people raise most often is whether a smaller file means a worse-looking document, and
          it's a fair question. The answer lies in how compression is applied. There are two broad approaches:
          lossless compression, which reduces size by storing the same data more efficiently with no visible
          change at all, and lossy compression, which achieves bigger savings by intelligently reducing image
          detail that the human eye barely registers.
        </p>
        <p style={pStyle}>
          This tool is tuned to strike a practical balance. For everyday documents — contracts, reports,
          presentations, forms — it keeps text razor-sharp because text is preserved as crisp vector data, not
          flattened into a blurry image. For photos and scans, it downsamples resolution to a level that still
          looks clean on screen and in normal printing while removing the excess pixels that inflate file size
          without adding real clarity. In practice, that means you can compress a PDF without losing quality
          that matters for reading, sharing, or standard printing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your document is destined for professional, high-resolution printing, it's worth keeping your
          original master copy and using the compressed version for digital sharing. For the overwhelming
          majority of uses — sending, uploading, storing, and viewing — the compressed output is visually
          indistinguishable from the source while being dramatically smaller.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Compress a PDF in Your Browser</h2>
        <p style={pStyle}>
          Using the tool takes three simple steps and no technical knowledge.
        </p>
        <ol style={olStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Add your file.</strong> Drag it onto the upload area or select it from your device. The
            tool accepts standard PDF files and handles both single-page documents and long, multi-page files.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Let the compressor process the document.</strong> It optimises images, streamlines the
            internal structure, and rebuilds the PDF at a reduced size automatically — there's nothing to
            configure and no confusing settings to decipher. Within moments, the tool reports the new, smaller
            size of your compressed PDF so you can see exactly how much space you've saved.
          </li>
          <li>
            <strong>Download your compressed PDF.</strong> The lighter file is ready to attach to an email,
            upload to a portal, or save wherever you keep your documents.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Because everything runs online, you can compress a PDF from a laptop, desktop, tablet, or phone
          using any modern browser — there's nothing to download or install, and the process works the same
          across Windows, macOS, Android, and iOS.
        </p>
      </div>

      {/* Features */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Features That Make This Compressor Different</h2>
        <p style={pStyle}>
          Several things make this a genuinely convenient tool rather than just another file utility. It's
          completely free, with no hidden charges, trial limits, or paywalls waiting to interrupt you halfway
          through. There's no signup and no registration — you don't hand over an email address or create an
          account just to shrink a document, which keeps the whole task quick and frictionless.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The output is clean, too: your compressed PDF comes back without any watermark stamped across the
          pages, so the file looks exactly as professional as the original. The tool is browser-based, which
          means it works on any device and any operating system without installing heavy desktop software or
          worrying about compatibility. It handles large PDFs and multi-page documents comfortably, and it
          delivers consistent, reliable results whether you're compressing a one-page form or a hundred-page
          report. Sitting alongside the other free utilities on Tolz, it fits naturally into a workflow where
          you might also convert, merge, or edit documents as part of the same task.
        </p>
      </div>

      {/* Safety */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Safe to Compress PDFs Online?</h2>
        <p style={pStyle}>
          Trust matters when your documents can contain contracts, personal details, or confidential business
          information, so it's reasonable to want to know what happens to your file. This tool is built around
          straightforward, privacy-conscious handling: your PDF is processed securely, your files are not
          stored or shared, and the compressed result is yours alone to download. Because there's no account
          and no registration, you aren't leaving behind personal data simply to use the service.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool is free to use with no hidden costs, so there's no upsell that pressures you into handing
          over payment or personal information mid-task. For sensitive documents, this combination — secure
          processing, no permanent storage of your files, no required signup, and no watermark — makes it a
          practical everyday choice for compressing PDFs without giving up control of your data. As with any
          online document you consider especially confidential, keeping a local master copy is always
          sensible, but for the vast majority of files the process is quick, private, and safe.
        </p>
      </div>

      {/* Different file types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compressing Different Types of PDFs</h2>
        <p style={pStyle}>
          Not every PDF responds to compression the same way, and knowing what you're working with helps set
          realistic expectations. Scanned documents — signed contracts, ID copies, or paper receipts run
          through a scanner — are usually the largest files of all, because every page is stored as a full
          image rather than as text. These see the most dramatic reduction, since the tool can downsample
          those page images substantially while keeping them perfectly legible.
        </p>
        <p style={pStyle}>
          Presentations and brochures exported to PDF tend to be heavy with photographs, logos, and full-bleed
          background graphics. When you compress a PDF like this, the tool trims the embedded imagery
          efficiently, which is why a design-rich file can shrink so much without any visible drop in quality
          on screen.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Text-based documents such as ebooks, essays, and plain reports are already lightweight, so the
          savings are smaller, but compressing them still helps by cleaning up duplicated fonts and
          streamlining the internal data. Forms and interactive PDFs compress well too, and the tool preserves
          their fillable fields so the document stays functional after it's optimised. Whatever the mix inside
          your file, the compressor adapts to the content it finds, which is why it works reliably as an
          all-purpose way to reduce PDF file size.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting the Most From the Tool</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few small habits help you get the best results. If your PDF is mostly scanned images, expect the
          largest savings, since that's where excess data usually hides. If a file barely shrinks, it's often
          already well-optimised or made mostly of text, which is a good sign rather than a problem. When you
          need to hit a strict upload limit, compress the PDF first and check the reported size before
          submitting, so you're never caught out by a rejected form. And when a document is heading for both
          print and digital use, keep the original for printing and use the compressed copy for emailing and
          uploading. With those simple habits, the Compress PDF tool becomes a fast, dependable part of
          handling documents day to day.
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
