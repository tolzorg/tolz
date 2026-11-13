import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does “split PDF” mean?",
    a: "Splitting a PDF means dividing one multi-page file into two or more separate documents by page range, selected pages, or single pages. The original pages are copied into the new files, so text, images, and layout stay the same.",
  },
  {
    q: "Is it free to split a PDF on Tolz?",
    a: "Yes. The Split PDF tool is completely free with no hidden charges, subscriptions, or trial limits. Every splitting method is available at no cost.",
  },
  {
    q: "Which is the easiest free tool to split PDF files?",
    a: "Tolz Split PDF is a free, browser-based tool with no installation, no signup, and no watermark. Upload your file, choose a page range, specific pages, or individual pages, and download the result.",
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
    q: "Does Chrome have a built-in tool to split PDFs?",
    a: "No. Chrome’s PDF viewer lets you print or save selected page ranges as a new PDF, but it has no dedicated splitting feature. For several ranges, many files, or consistent quality, a PDF splitter is faster.",
  },
  {
    q: "What is the difference between splitting and tiling a PDF?",
    a: "Splitting separates a document into multiple files by pages. Tiling cuts one oversized page into several printable sheets.",
  },
  {
    q: "Can I split a password-protected PDF?",
    a: "Yes, if you have the password. Open the file with it first, then split the unlocked copy. Files you are not authorized to unlock cannot and should not be split.",
  },
  {
    q: "Can I split a single-page PDF saved from a long webpage?",
    a: "Not by page count, since there is only one page. Re-save the webpage using Chrome’s Save as PDF with a standard paper size so it paginates, then split the new file.",
  },
  {
    q: "Are my files safe when I split them online?",
    a: "Yes. Files are processed securely and are not stored permanently. Uploads are removed after the operation completes, and no account or payment information is collected.",
  },
  {
    q: "Is there a limit on file size or page count?",
    a: "There’s no practical page limit, so both short forms and large multi-page reports can be split without restrictions.",
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
const listStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What split means */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does “Split PDF” Mean, and How Does It Work (Including in Google Chrome)?</h2>
        <p style={pStyle}>
          To split a PDF is to divide one multi-page file into two or more independent documents, using page ranges,
          selected pages, or single pages. The original pages are copied into new files rather than edited, so text,
          fonts, images, and layout stay the same.
        </p>
        <p style={pStyle}>
          Many people search for this in connection with Google Chrome, because Chrome opens PDFs in its built-in
          viewer. That viewer is designed for reading, printing, and saving, and it has no dedicated “split” button. The
          usual workaround is to open the PDF in Chrome, press Ctrl+P (Cmd+P on Mac), choose “Save as PDF” as the
          destination, and enter a custom page range. This works for a single range, but Chrome re-renders the pages
          when it saves them. That can change file size or drop interactive elements such as bookmarks and form fields.
          It also becomes tedious if you need several ranges.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A dedicated splitter works differently. You upload the file, the tool reads its page structure, and it copies
          the pages you choose into new PDF files. If you create more than one file, they are delivered together as a
          ZIP. Because the pages are copied rather than re-printed, the result stays much closer to your original. The
          format itself is an open standard, documented as{" "}
          <Ext href="https://www.iso.org/standard/75839.html">ISO 32000-2 (PDF 2.0)</Ext>, and the{" "}
          <Ext href="https://pdfa.org/">PDF Association</Ext> is a good neutral resource if you want to learn how pages
          are stored inside a PDF.
        </p>
      </div>

      {/* Easiest tool */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Which Tool Is the Easiest Free Way to Split PDF Files in 2027?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tolz Split PDF is a free, browser-based option built for this job. There is nothing to install, no account to
          create, no watermark on the output, and no paywalled splitting mode. You upload your file, choose a page
          range, specific pages, or individual pages, and download the result. It works in current versions of Chrome,
          Firefox, Safari, and Edge, on desktop and mobile. For one-off jobs, such as pulling a signature page out of a
          contract or trimming a report to the pages an upload portal asks for, it is usually the quickest route because
          it skips the setup and sign-up steps that most other options require.
        </p>
      </div>

      {/* Split vs tile */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Split PDF vs. Tile PDF: What Is the Difference?</h2>
        <p style={pStyle}>The two features sound similar but solve opposite problems.</p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Split PDF</strong> works at the document level. It separates a file along page boundaries, so a
            40-page PDF becomes, for example, a 15-page file and a 25-page file. Every page stays whole.
          </li>
          <li>
            <strong>Tile PDF</strong> (also called tiling or poster printing) works at the page level. It cuts one
            oversized page, such as an architectural drawing, banner, or large map, into several smaller sheets so it
            can be printed on standard paper and then taped together. The result is usually overlapping sections of a
            single page.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In short, use splitting when you want to separate pages into different files, and use tiling when one page is
          too large to print on regular paper. If your real goal is to print a large page on standard sheets, tiling is
          the right feature. Adobe’s print dialog offers it under “Poster,” and printers’ driver settings often have an
          equivalent. If you want smaller documents or fewer pages per file, splitting is what you need.
        </p>
      </div>

      {/* Encrypted */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Split an Encrypted PDF into Pages?</h2>
        <p style={pStyle}>
          It depends on which kind of protection the file has, because PDF encryption comes in two forms:
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Open password (user password):</strong> The file cannot be opened without it. Because a splitter
            needs to read the pages, you must enter this password first. Without it, no legitimate tool can read or
            divide the file, and you should not expect one to.
          </li>
          <li>
            <strong>Permissions password (owner password):</strong> The file opens freely but carries restrictions such
            as “no copying,” “no editing,” or “no page extraction.” These flags are set by whoever created the file, and
            respecting them is the right default.
          </li>
        </ul>
        <p style={pStyle}>If you own the document or have permission to modify it, the clean approach is:</p>
        <ol style={listStyle}>
          <li style={liStyle}>Open the PDF with the correct password in a PDF viewer.</li>
          <li style={liStyle}>
            Save or print a copy without the password. In Chrome, “Save as PDF” creates an unprotected copy of what you
            can view, but only does this for files you are authorized to alter.
          </li>
          <li>Upload the unlocked copy to the splitter and divide it as usual.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Modern PDFs commonly use AES-256 encryption, which is why guessing or bypassing passwords is not realistic,
          and it is not something a splitter should do. If a document belongs to someone else and is locked, ask the
          sender for an unprotected version or the password.
        </p>
      </div>

      {/* Long webpage */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Split a Very Long, Single-Page PDF Made from a Webpage?</h2>
        <p style={pStyle}>
          This is a common problem. When a long webpage is saved or captured as one continuous page (for example with a
          “full-page screenshot” or a single-page export option), the PDF contains one very tall page rather than many
          normal-sized ones. A page-based splitter has nothing to divide, because the file only has one page.
        </p>
        <p style={pStyle}>You have two practical routes:</p>
        <ol style={listStyle}>
          <li style={liStyle}>
            <strong>Re-export from the source with pagination (best quality).</strong> Open the webpage in Chrome, press
            Ctrl+P, and choose “Save as PDF”. Set the paper size to A4 or Letter, adjust margins and scale, and make sure
            “Headers and footers” and “Background graphics” are set how you want. Chrome will then break the page into
            real pages, which you can split by range with Tolz afterwards. Web developers can control where breaks fall
            with the CSS break-before and break-inside properties, documented on{" "}
            <Ext href="https://developer.mozilla.org/en-US/docs/Web/CSS/break-after">MDN</Ext>.
          </li>
          <li>
            <strong>Cut the tall page into slices (when you only have the PDF).</strong> Use a crop or “slice by height”
            tool to cut the tall page into equal horizontal sections, then convert each section to a normal page size.
            Be aware that slicing can cut through lines of text or images, so check the output before using it.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you can get back to the original webpage, the first method almost always gives cleaner results.
        </p>
      </div>

      {/* Split methods */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Different Ways to Split a PDF File</h2>
        <p style={pStyle}>
          Not every task calls for the same approach, so the tool supports several splitting methods. Understanding
          which one fits your goal helps you avoid extra cleanup afterward.
        </p>
        <h3 style={h3Style}>Split by Page Range</h3>
        <p style={pStyle}>
          This method divides the document at defined points. If you have a 50-page file and want pages 1–20 in one
          document and 21–50 in another, you specify those ranges and the tool produces two clean files. Splitting a PDF
          by page range is ideal when a document has natural sections, an introduction and an appendix, or several
          chapters that belong in separate files.
        </p>
        <h3 style={h3Style}>Extract Specific Pages</h3>
        <p style={pStyle}>
          Sometimes you don't want to divide the whole document; you only need a handful of pages pulled out.
          Extracting lets you name individual pages, say, pages 3, 7, and 12, and save just those into a new PDF. This is
          the fastest way to isolate a single form, a signature page, or one figure from a lengthy report without
          disturbing the rest of the file.
        </p>
        <h3 style={h3Style}>Split into Individual Pages</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you need every page as its own file, this option separates a multi-page PDF into single-page documents in
          one pass. It's especially useful for scanned batches, where a scanner has combined dozens of unrelated pages
          into one PDF and you want each restored as a standalone file for filing or sharing.
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
