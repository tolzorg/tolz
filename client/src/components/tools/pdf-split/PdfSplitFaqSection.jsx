import { useState } from "react";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is it free to split a PDF on Tolz?",
    a: "Yes. The Split PDF tool is completely free with no hidden charges, subscriptions, or trial limits. Every splitting method is available at no cost.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No signup is required. You can split PDF files immediately without registering, providing an email, or logging in.",
  },
  {
    q: "Will splitting reduce the quality of my PDF?",
    a: "No. Splitting only rearranges existing pages into new files. Text stays selectable, images keep their resolution, and no watermark or compression is applied.",
  },
  {
    q: "Can I extract just one page from a PDF?",
    a: "Yes. Use the extract option, enter the page number you want, and download that single page as its own PDF while the rest of the document stays untouched.",
  },
  {
    q: "How do I split a PDF into multiple files at once?",
    a: "Choose the split-into-individual-pages or page-range method, define your divisions, and the tool generates all the files together, usually delivered as a single ZIP download.",
  },
  {
    q: "Are my files safe when I split them online?",
    a: "Yes. Files are processed securely and are not stored permanently. Uploads are removed after the operation completes, and no account or payment information is collected.",
  },
  {
    q: "Is there a limit on file size or page count?",
    a: "There's no practical page limit, so both short forms and large multi-page reports can be split without restrictions.",
  },
  {
    q: "Can I split a PDF on my phone?",
    a: "Yes. The tool runs in any modern mobile browser, so you can split or extract pages on a phone or tablet without installing an app.",
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

export default function PdfSplitFaqSection() {
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
          Working with one large document is convenient until you only need a few pages from it. The Split
          PDF tool from Tolz lets you take a single file and break it into smaller, more manageable documents
          directly in your browser. Whether you want to pull out a single contract page, divide a long report
          into chapters, or turn a 200-page scan into separate files, you can split PDF documents in a few
          clicks without installing software or creating an account. Everything runs on the page above this
          text, so you upload, choose how you want the file divided, and download the result.
        </p>
      </div>

      {/* What it means to split */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What It Means to Split a PDF</h2>
        <p style={pStyle}>
          To split a PDF is to take one file containing multiple pages and separate it into two or more
          independent documents. This is different from deleting or compressing pages — the original content
          stays intact, but instead of one continuous file you end up with several. You might split PDF pages
          so each ends up as its own file, break the document at specific page numbers, or carve out one
          defined range while leaving the rest untouched.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The important detail is that a proper split preserves the source exactly. Text remains selectable
          and searchable, images keep their resolution, and the layout of every page carries over without
          re-compression. A good PDF splitter never flattens your document into images or degrades quality, it
          simply rearranges the existing pages into new files. That distinction matters when the pages hold
          legal agreements, invoices, or academic work where formatting and text integrity can't be lost.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Split a PDF Online in a Few Steps</h2>
        <p style={pStyle}>
          The process is designed to be quick even for people who have never used a PDF splitter before.
          First, upload your document by dragging it into the tool or selecting it from your device. Once it
          loads, choose how you want to split the PDF — by a page range, by extracting specific pages, or by
          separating every page into its own file. Enter the page numbers or ranges that match what you need,
          then start the process.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When the split finishes, you download the results. If the operation produces several files at once,
          they're typically bundled into a single ZIP archive so you can save everything in one step and
          unpack it locally. There's no waiting on email confirmations, no plugins to configure, and no limit
          hidden behind a paywall. The whole point is to let you split a PDF and get back to your work in
          under a minute.
        </p>
      </div>

      {/* Different ways to split */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Different Ways to Split a PDF File</h2>
        <p style={pStyle}>
          Not every task calls for the same approach, so the tool supports several splitting methods.
          Understanding which one fits your goal helps you avoid extra cleanup afterward.
        </p>
        <h3 style={h3Style}>Split by Page Range</h3>
        <p style={pStyle}>
          This method divides the document at defined points. If you have a 50-page file and want pages 1–20
          in one document and 21–50 in another, you specify those ranges and the tool produces two clean
          files. Splitting a PDF by page range is ideal when a document has natural sections — an introduction
          and an appendix, or several chapters that belong in separate files.
        </p>
        <h3 style={h3Style}>Extract Specific Pages</h3>
        <p style={pStyle}>
          Sometimes you don't want to divide the whole document; you only need a handful of pages pulled out.
          Extracting lets you name individual pages — say, pages 3, 7, and 12 — and save just those into a new
          PDF. This is the fastest way to isolate a single form, a signature page, or one figure from a
          lengthy report without disturbing the rest of the file.
        </p>
        <h3 style={h3Style}>Split into Individual Pages</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you need every page as its own file, this option separates a multi-page PDF into single-page
          documents in one pass. It's especially useful for scanned batches, where a scanner has combined
          dozens of unrelated pages into one PDF and you want each restored as a standalone file for filing or
          sharing.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When and Why You Might Need to Split a PDF</h2>
        <p style={pStyle}>
          The need to split PDF files comes up more often than most people expect, and the reasons are usually
          practical. Email and upload systems frequently cap attachment size, so dividing a large PDF into
          smaller parts is often the only way to send it. Portals for job applications, government forms, or
          school submissions may accept just one section, splitting lets you supply exactly what's requested
          and nothing more.
        </p>
        <p style={pStyle}>
          Privacy is another common driver. A single PDF may contain both pages you're happy to share and
          pages holding personal or financial details. Rather than send the whole thing, you can split the PDF
          and pass along only the relevant portion. The same logic applies to collaboration: handing a
          colleague the two pages they're responsible for is cleaner than forwarding a fifty-page master
          document and hoping they find the right section.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Organization also benefits. Long PDFs assembled from meeting notes, receipts, or scanned paperwork
          are hard to navigate. Breaking them into logical, individually named files makes them far easier to
          store, search, and reuse later. Anyone who regularly deals with contracts, e-books, statements, or
          archived scans will find a reliable way to split a PDF saves real time.
        </p>
      </div>

      {/* What the tool offers */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Split PDF Tool Offers</h2>
        <p style={pStyle}>
          Beyond the core function, a few characteristics make the difference between a tool you'll return to
          and one you use once. This Split PDF tool is completely free with no hidden charges, trial periods,
          or feature gates — every splitting method is available to everyone. There's no signup, so you don't
          hand over an email address or create a password just to divide a document.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Output quality stays faithful to the original. The tool doesn't add watermarks, stamp branding
          across your pages, or reduce resolution, which means your finished files look exactly like the
          source. There's no practical restriction on the number of pages you can process, so both short forms
          and hefty reports are handled the same way. And because it runs in the browser, there's nothing to
          download or update — the current version is always the one you're using.
        </p>
      </div>

      {/* Safety */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Safe to Split PDF Files Online?</h2>
        <p style={pStyle}>
          Handling documents online reasonably raises questions about privacy, and it's a fair concern when
          files may hold sensitive information. When you split PDF documents with this tool, your files are
          processed securely and are not stored permanently on any server. Uploads are handled only for as
          long as the operation needs and are removed afterward, so your content doesn't linger where others
          could reach it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because no account is required, there's no profile tied to your activity and no history collected
          against your name. You aren't asked for payment details, so there's no billing information to
          protect either. For anyone splitting confidential agreements, medical records, or financial
          statements, the goal is to let you divide a file without trading away control of its contents. If a
          document is especially sensitive, the fact that files aren't retained after processing gives an
          added layer of reassurance that many desktop-free workflows can't match.
        </p>
      </div>

      {/* Cross-device */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Works Across Devices and Browsers</h2>
        <p style={pStyle}>
          One advantage of a browser-based PDF splitter is that it isn't tied to a single operating system.
          You can split a PDF on Windows, macOS, or Linux, and just as easily on a phone or tablet when you're
          away from a computer. Modern browsers — Chrome, Firefox, Safari, and Edge — are all supported, so
          you're not forced to switch programs or install an app to get the job done.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This flexibility is genuinely useful in the moment. If you're on a mobile device and a form portal
          only accepts one page, you can extract that page and upload it without ever opening a laptop. The
          interface adapts to the screen you're on, and the drag-and-drop area works with both file pickers
          and touch input, so the experience stays consistent whether you're at a desk or on the go.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting the Best Results</h2>
        <p style={pStyle}>
          A little preparation makes splitting smoother. Before you start, open the document and note the
          exact page numbers you need — it's easy to be off by one in a long file, and confirming beforehand
          saves a redo. If you're extracting several non-consecutive pages, list them out first so you can
          enter them in one pass rather than running the tool multiple times.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you plan to split a PDF into many separate files, expect a ZIP download and make sure you know
          where your browser saves it, so unpacking is quick. And if your original is a scanned document,
          remember that splitting preserves whatever quality the scan already has — it won't improve blurry
          pages, but it also won't make them any worse. Keeping the source file until you've checked the
          output is a sensible habit, giving you a fallback if you want to re-split with different ranges.
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
