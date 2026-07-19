import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the Merge PDF tool free to use?",
    a: "Yes. Merging PDF files is completely free with no hidden costs, subscriptions, or charges at download. You can combine as many documents as you need without paying.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No. The tool works without any registration. You don't need an email address, login, or personal details — just upload your files and merge.",
  },
  {
    q: "Will there be a watermark on my merged PDF?",
    a: "No. The merged document comes out clean, with no watermarks, branding, or added text, so it's ready for professional and official use.",
  },
  {
    q: "How many PDF files can I merge at once?",
    a: "You can combine multiple PDFs in a single operation. Upload all the files you need, arrange them in order, and merge them into one document.",
  },
  {
    q: "Can I change the order of the files before merging?",
    a: "Yes. After uploading, you can drag and drop the files into any sequence you like, so the final PDF follows the exact order you want.",
  },
  {
    q: "Does merging reduce the quality of my PDFs?",
    a: "No. The tool preserves the original text, images, and formatting of each file, so the combined PDF matches the quality of your source documents.",
  },
  {
    q: "Are my uploaded files safe?",
    a: "Files are processed over a secure connection solely to create your merged PDF, and they aren't shared or sold. With no signup required, you also keep your personal information to yourself.",
  },
  {
    q: "Can I merge PDF files on my phone?",
    a: "Yes. The tool runs in your browser, so it works on phones, tablets, and computers without installing an app.",
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

export default function PdfMergeFaqSection() {
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
        <h2 style={h2Style}>Merge PDF — Combine Multiple PDF Files Into One, Free and Online</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Managing separate PDF documents quickly becomes messy — a signed contract split across three scans,
          an invoice here, a receipt there, chapters of a report saved as individual files. The Merge PDF tool
          on <Link to="/" className="inline-home-link">Tolz</Link> solves this in seconds by joining all of those documents into one clean, ordered file you
          can download, print, or send. There's no software to install and no account to create: you upload
          your files, arrange them the way you want, and merge PDF pages into a single document right inside
          your browser. Whether you're combining two files or twenty, the merge PDF process stays fast,
          private, and completely free.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Merge PDF Tool Does</h2>
        <p style={pStyle}>
          The Merge PDF tool takes multiple PDF files and stitches them together into one continuous document
          while preserving the original layout, fonts, images, and page dimensions of every source file.
          Nothing is re-compressed into lower quality or flattened into a picture — each page keeps its
          selectable text and sharpness, so the merged output looks identical to the originals.
        </p>
        <p style={pStyle}>
          Beyond simply combining PDF files, the tool gives you control over the final structure. You decide
          the order in which documents appear, so a cover letter lands before a resume, or an executive
          summary sits ahead of the appendix. If you upload files in the wrong sequence, you can rearrange them
          before merging rather than starting over. The result is a single PDF that behaves like one document:
          a natural page-to-page flow, one file to store, and one file to share.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because everything runs in the browser, there's no dependency on desktop programs like Adobe Acrobat
          or bulky office suites. You get the core function people actually need — reliable PDF merging —
          without the subscription, the learning curve, or the storage footprint.
        </p>
      </div>

      {/* Who and use cases */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Should Use This PDF Merger, and Common Use Cases</h2>
        <p style={pStyle}>
          Almost anyone who works with documents runs into a moment where several files need to become one.
          Students combine research notes, assignment pages, and reference material into a single submission.
          Freelancers and small business owners merge quotes, contracts, and invoices for a client into one
          tidy file. HR teams assemble offer letters, policy documents, and onboarding forms. Accountants and
          bookkeepers join monthly statements and receipts for clean records at tax time.
        </p>
        <p style={pStyle}>Common use cases for the merge PDF tool include:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>Combining a resume, cover letter, and portfolio into one application file</li>
          <li style={{ marginBottom: 6 }}>Merging scanned pages of a signed contract or agreement into a single legal document</li>
          <li style={{ marginBottom: 6 }}>Joining multiple invoices, receipts, or bank statements for expense reports and accounting</li>
          <li style={{ marginBottom: 6 }}>Assembling chapters, sections, or drafts into a complete e-book, manual, or report</li>
          <li style={{ marginBottom: 6 }}>Bringing together handouts, brochures, and supporting material for a meeting</li>
          <li>Consolidating forms, certificates, and identity documents for applications or submissions</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          If your work involves sending, archiving, or printing documents, a dependable way to merge PDF files
          removes a recurring source of friction.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need to Merge PDF Files</h2>
        <p style={pStyle}>
          The need to merge PDF files usually appears at the exact moment you're trying to send or submit
          something. Many portals — job applications, university admissions, grant submissions, and government
          forms — accept only a single PDF upload. If your material lives in five separate files, combining
          them isn't optional; it's the only way to complete the task correctly.
        </p>
        <p style={pStyle}>
          Email is another common trigger. Instead of attaching eight documents and hoping the recipient opens
          them in the right order, one merged file arrives clean and self-explanatory. It also sidesteps
          attachment clutter and reduces the chance a page gets missed or lost in a long thread.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are practical, everyday reasons too. Printing a single ordered PDF avoids the hassle of
          opening and printing each file individually. Archiving one combined document keeps folders organized
          and makes future searches easier. When presenting to a client or team, scrolling through one
          seamless file looks far more professional than juggling multiple windows. In short, you merge PDF
          documents whenever order, portability, and a single point of reference matter, which, for most
          document workflows, is often.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Merge PDF Files: Step-by-Step</h2>
        <p style={pStyle}>Combining your documents takes less than a minute. Follow these steps:</p>
        <ol style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Open the Merge PDF tool.</strong> The tool loads directly on this page, no download or
            installation required.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Upload your PDF files.</strong> Click the upload area to browse your device, or drag and
            drop the files you want to combine. You can add several PDFs at once.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Arrange the order.</strong> Drag the files into the sequence you want them to appear in
            the final document. The top file becomes the first section, and so on down the list.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Review your selection.</strong> Double-check that every file you need is included and
            positioned correctly before merging.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Click Merge.</strong> The tool joins all pages into one continuous PDF while keeping the
            original quality intact.
          </li>
          <li>
            <strong>Download your merged PDF.</strong> Save the single combined file to your device, ready to
            share, print, or upload.
          </li>
        </ol>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          If you spot a mistake, simply reorder or remove a file and merge again — there's no limit on how
          many times you can use the tool.
        </p>
      </div>

      {/* File types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Works With Different Types of PDF Files</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool handles standard PDFs from virtually any source — documents exported from Word, Excel,
          Google Docs, or design software; PDFs generated by invoicing and accounting apps; and scanned files
          created by printers or mobile scanning apps. Text-based PDFs keep their selectable, searchable text
          after merging, while scanned or image-based pages are preserved exactly as they appear. This
          flexibility means you can mix a digitally created cover page with scanned signature pages and still
          end up with one coherent document. If a file is password-protected, you'll typically need to unlock
          it first, since encrypted files can't be read for merging until the password is removed — a quick
          step that ensures every page is available to combine.
        </p>
      </div>

      {/* Free, no watermark */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, With No Signup and No Watermarks</h2>
        <p style={pStyle}>
          The Merge PDF tool is completely free, and "free" here means what it should: no trial period, no
          locked features, and no surprise charges at the download step. You don't need to create an account,
          verify an email, or hand over payment details to combine your files.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Just as importantly, the merged output is clean. The tool doesn't stamp watermarks, banners, or
          promotional text onto your pages, so the document you download looks exactly the way you intend,
          suitable for professional, academic, or official use. There are no daily caps hidden behind a
          paywall and no "upgrade to remove branding" prompts. You get a straightforward PDF merger that does
          the job and stays out of your way.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Your Files Stay Private and Secure</h2>
        <p style={pStyle}>
          Documents you merge are often personal or confidential — contracts, financial records,
          identification, or private correspondence — so how they're handled matters. Files are transferred
          over a secure, encrypted connection and processed solely to produce your merged PDF. They aren't
          sold, shared, or repurposed, and you never need to expose a personal account to use the tool.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because there's no signup, there's no profile quietly building a history of everything you've
          uploaded. The tool is designed to do one thing — combine your PDFs — and then hand the finished file
          back to you. For sensitive material, this stripped-down, no-account approach means fewer places your
          data can travel and less to worry about once the job is done.
        </p>
      </div>

      {/* Tips */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting the Best Merged PDF</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few small habits make the results even cleaner. Name your files in the order you want them (for
          example, 01-cover, 02-resume, 03-references) so arranging them before the merge is quick and
          error-free. If some pages are scanned images, make sure they're rotated the right way first, since
          the tool preserves each page as-is. When combining documents from different sources, a quick scroll
          through the final file confirms the page flow reads naturally from start to finish. For very large
          collections, merging in logical batches, then combining those results, keeps everything manageable
          and easy to verify.
        </p>
      </div>

      {/* Large files */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Handling Larger Documents and File Size</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you merge PDF files that contain high-resolution scans or lots of images, the combined document
          can grow fairly large. That's expected — the tool keeps every page at its original quality rather
          than degrading it to shrink the result. If the final size matters for an email limit or an upload
          cap, it helps to start from reasonably optimized source files: scans saved at a sensible resolution
          and image-heavy pages exported without unnecessary bulk. You can always merge PDF documents first
          and then run a separate compression pass when a smaller file is required. Thinking about size before
          you combine everything saves a round trip and keeps your finished document easy to send and open on
          any device.
        </p>
      </div>

      {/* Online vs desktop */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Merge PDF Online vs. Desktop Software</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Traditional desktop applications can merge PDF files, but they come with trade-offs: paid licenses,
          ongoing subscriptions, installation and updates, and system requirements that not every device
          meets. For occasional or even regular merging, that's a lot of overhead for a simple task. An online
          merge PDF tool removes all of it. It works on any device with a browser — Windows, Mac, Chromebook,
          tablet, or phone — and it's ready the moment you need it. You get the same core outcome, a single
          well-ordered PDF, without cost or setup. For anyone who doesn't need heavyweight PDF editing every
          day, merging PDF online is simply the faster, lighter choice.
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
