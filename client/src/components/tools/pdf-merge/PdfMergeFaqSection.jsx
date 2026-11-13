import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the Merge PDF tool free to use?",
    a: "Yes. Merging PDF files is completely free with no hidden costs, subscriptions, or charges at download.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No. The tool works without any registration. Just upload your files and merge.",
  },
  {
    q: "Will there be a watermark on my merged PDF?",
    a: "No. The merged document comes out clean, with no watermarks, branding, or added text.",
  },
  {
    q: "How many PDF files can I merge at once?",
    a: "You can combine multiple PDFs in a single operation. Upload all the files you need, arrange them in order, and merge.",
  },
  {
    q: "Can I change the order of the files before merging?",
    a: "Yes. After uploading, drag and drop the files into any sequence you like.",
  },
  {
    q: "Does merging reduce the quality of my PDFs?",
    a: "No. The tool preserves the original text, images, and formatting of each file.",
  },
  {
    q: "Are my uploaded files safe?",
    a: "Files are processed over a secure connection solely to create your merged PDF, and they aren't shared or sold.",
  },
  {
    q: "Can I merge PDF files on my phone?",
    a: "Yes. The tool runs in your browser, so it works on phones, tablets, and computers without installing an app.",
  },
  {
    q: "Can I merge PDFs without uploading them anywhere?",
    a: "Online tools, including Tolz, process files on a server over an encrypted connection. For fully offline merging, use Preview on Mac, PDFsam, or command-line tools such as pdfunite and qpdf, as described above.",
  },
  {
    q: "Can I merge PDFs, Word files, and images together?",
    a: "Yes, once each file is converted to PDF. Convert first, then merge, and quality is preserved.",
  },
];

const LINUX_CODE = `# Poppler utils (simple and fast)
pdfunite file1.pdf file2.pdf merged.pdf

# qpdf (precise page control)
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Ghostscript (re-writes the file, can change size)
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=merged.pdf file1.pdf file2.pdf`;

const PREFIX_UNIX_CODE = `pdfunite invoice_*.pdf invoice_merged.pdf`;

const PREFIX_POWERSHELL_CODE = `cd C:\\Users\\You\\Documents\\Invoices
pdftk (Get-ChildItem invoice_*.pdf | Sort-Object Name).FullName cat output invoice_merged.pdf`;

const ITEXT_CODE = `PdfDocument out = new PdfDocument(new PdfWriter("merged.pdf"));
PdfMerger merger = new PdfMerger(out);
for (String path : paths) {
    PdfDocument src = new PdfDocument(new PdfReader(path));
    int start = out.getNumberOfPages() + 1;
    merger.merge(src, 1, src.getNumberOfPages());
    // store title + start page for the TOC
    src.close();
}
// add outline/bookmark entries or generate a TOC page from stored titles
out.close();`;

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
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const preStyle = {
  ...mono, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-primary)", background: "var(--bg-muted)",
  border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", margin: "0 0 10px", overflowX: "auto",
};
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* Intro */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Merge PDF - Combine Multiple PDF Files Into One, Free and Online</h2>
        <p style={pStyle}>
          Managing separate PDF documents quickly becomes messy: a signed contract split across three scans, an invoice
          here, a receipt there, chapters of a report saved as individual files. The Merge PDF tool on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link> solves this in seconds by joining all of those documents
          into one clean, ordered file you can download, print, or send. There's no software to install and no account
          to create: you upload your files, arrange them the way you want, and merge PDF pages into a single document
          right inside your browser. Whether you're combining two files or twenty, the merge PDF process stays fast,
          private, and completely free.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Below you'll find quick answers for every common situation: merging online, on Windows, Mac, Linux and
          smartphones, and even with command-line tools and code, so you can pick the method that fits your device and
          your workflow.
        </p>
      </div>

      {/* Save multiple as one */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Save Multiple PDFs as One File? (Step-by-Step)</h2>
        <p style={pStyle}>
          Saving several PDFs as a single file simply means merging them, and the quickest route is an online merger.
          Here is the process on Tolz:
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Open the Merge PDF tool.</strong> It loads directly on this page, with no download or installation.
          </li>
          <li style={liStyle}>
            <strong>Upload your PDF files.</strong> Click the upload area or drag and drop several PDFs at once.
          </li>
          <li style={liStyle}>
            <strong>Arrange the order.</strong> Drag files into the sequence you want. The top file becomes the first
            section.
          </li>
          <li style={liStyle}>
            <strong>Review your selection.</strong> Confirm every file is included and positioned correctly.
          </li>
          <li style={liStyle}>
            <strong>Click Merge.</strong> All pages are joined into one continuous PDF with the original quality
            intact.
          </li>
          <li>
            <strong>Download your merged PDF.</strong> Save the single file to your device, ready to share, print, or
            upload.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you spot a mistake, reorder or remove a file and merge again. There's no limit on how many times you can
          use the tool.
        </p>
      </div>

      {/* Best free without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Way to Merge PDFs Online for Free Without Losing Quality?</h2>
        <p style={pStyle}>
          The best method is one that joins the original pages rather than re-rendering them. Quality loss happens
          when a tool converts pages to images, re-compresses them, or flattens text into pictures. A proper merger
          copies each page's content (text, vector graphics, fonts, images) into the new file untouched.
        </p>
        <p style={pStyle}>
          The Tolz Merge PDF tool works this way. It keeps selectable text, original fonts, image resolution, and page
          sizes, adds no watermark, and needs no signup. When choosing any online merger, check for these four things:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>It doesn't compress or flatten pages during the merge</li>
          <li style={liStyle}>It lets you reorder files before combining</li>
          <li style={liStyle}>It doesn't add watermarks or limit you to a trial</li>
          <li>It states clearly how your files are handled and protected</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the result is too large for an email or portal limit, merge first and compress afterwards. That way you
          control the trade-off between size and sharpness instead of the merger deciding for you.
        </p>
      </div>

      {/* Without uploading */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Merge PDF Files Online Without Uploading Them to a Server?</h2>
        <p style={pStyle}>
          Most online PDF tools, including ours, send your files over an encrypted connection to be processed and
          returned. Tolz processes files solely to produce your merged PDF, and files aren't sold, shared, or
          repurposed. For most documents that is a sensible trade-off.
        </p>
        <p style={pStyle}>
          But if a document is too sensitive to leave your device at all (legal filings, medical records, ID scans),
          merge it locally instead. Reliable offline options include:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Mac:</strong> Preview or Finder Quick Actions (see the Mac section below)</li>
          <li style={liStyle}>
            <strong>Windows:</strong> the free open-source PDFsam Basic or PDFtk run locally
          </li>
          <li>
            <strong>Linux and macOS terminal:</strong> <code style={mono}>pdfunite</code> from Poppler or{" "}
            <code style={mono}>qpdf</code>
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          These tools never touch the internet while merging. A quick rule: use an online tool for convenience and
          everyday files, and a local tool when privacy rules or company policy say files must stay on the machine.
        </p>
      </div>

      {/* Windows */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Merge PDF Files in Windows 10 (and Windows 11) for Free?</h2>
        <p style={pStyle}>
          Windows has no built-in command to merge PDFs in File Explorer, so you need a free tool. Windows 10 reached
          end of support in October 2025, but all methods below work identically on Windows 10 and Windows 11.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Use Tolz (fastest).</strong> Open the browser, upload your PDFs, order them, and download the
            result. Nothing to install.
          </li>
          <li style={liStyle}>
            <strong>Use PDFsam Basic.</strong> A free, open-source desktop app. Choose Merge, add your files, set the
            order, and run.
          </li>
          <li>
            <strong>Use PDFtk or qpdf in PowerShell.</strong> Best for batches and automation (see the command-line
            section below).
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Avoid downloading random "free PDF merger" installers from unknown sites. Many bundle adware or add
          watermarks. Stick to open-source projects or a reputable browser-based tool.
        </p>
      </div>

      {/* Mac */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Easiest Way to Combine PDFs on a Mac? (Including Merging With Preview)</h2>
        <p style={pStyle}>Macs include two built-in methods, and both keep text sharp.</p>
        <h3 style={h3Style}>Method 1: Merge PDF files with Preview</h3>
        <ol style={ulStyle}>
          <li style={liStyle}>Open the first PDF in Preview.</li>
          <li style={liStyle}>Choose View &gt; Thumbnails to show the page sidebar.</li>
          <li style={liStyle}>
            Drag the second PDF file from Finder into the thumbnail sidebar, placing it before or after the pages you
            want. To add only some pages, open the second file and drag selected thumbnails across.
          </li>
          <li>Reorder thumbnails by dragging, then choose File &gt; Export as PDF to save the merged file.</li>
        </ol>
        <p style={pStyle}>
          <strong>Method 2: Finder Quick Actions.</strong> Select the PDFs in Finder, right-click, and choose Quick
          Actions &gt; Create PDF. macOS combines them in the order selected. Rename the file afterwards. See Apple's{" "}
          <Ext href="https://support.apple.com/guide/preview/welcome/mac">Preview user guide</Ext> for current steps.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you'd rather skip the drag-and-drop, Tolz gives the same result in a browser on any Mac.
        </p>
      </div>

      {/* Two pages to one on Mac */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Combine a Two-Page PDF Into a One-Page PDF on a Mac?</h2>
        <p style={pStyle}>This can mean two different things:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Show two pages side by side on one sheet.</strong> Open the PDF, choose File &gt; Print, open the
            Layout menu, set Pages per Sheet to 2, then click the PDF dropdown and select Save as PDF. The result is a
            new file where each sheet holds two original pages (a common way to save paper).
          </li>
          <li>
            <strong>Merge two separate one-page PDFs into a two-page file.</strong> Use any merge method above.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Note that this makes the text smaller because each page is scaled to fit. Choosing landscape orientation in
          the print dialog usually gives the most readable result.
        </p>
      </div>

      {/* Linux */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Way to Merge PDFs in Linux?</h2>
        <p style={pStyle}>
          Linux offers excellent command-line tools, and they're ideal for scripting. All are free and available in
          most distribution repositories.
        </p>
        <pre style={preStyle}><code>{LINUX_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a graphical option, PDF Arranger (available through most package managers and Flatpak) lets you drag,
          rotate, and delete pages before saving. We recommend <code style={mono}>pdfunite</code> or{" "}
          <code style={mono}>qpdf</code> when you want the original content preserved exactly; Ghostscript re-processes
          the document, which can alter size and quality. Or use Tolz directly in Firefox or Chromium with no
          installation at all.
        </p>
      </div>

      {/* Smartphone */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Merge PDF Files Into One on Your Smartphone?</h2>
        <p style={pStyle}>
          Smartphones can merge PDFs too, and the browser route is the simplest on both iPhone and Android.
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>Open Tolz Merge PDF in Safari or Chrome.</li>
          <li style={liStyle}>
            Tap the upload area and pick files from your phone's storage, Files app, or Google Drive.
          </li>
          <li>Drag to reorder, tap Merge, and download the combined file.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Alternatives:</strong> iPhone users can build a Shortcut in the Shortcuts app that combines selected
          PDFs, or use a trusted scanner app. Android users can use their scanner or document app, though a browser
          tool avoids installing anything.
        </p>
      </div>

      {/* Phone failures */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Am I Not Able to Merge PDF Files on a Phone?</h2>
        <p style={pStyle}>When merging fails on mobile, the cause is usually one of these:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Password-protected file.</strong> Encrypted PDFs can't be read until unlocked.
          </li>
          <li style={liStyle}>
            <strong>Cloud-only files.</strong> Files stored in iCloud, Drive, or OneDrive that haven't downloaded yet
            may not upload. Make them available offline first.
          </li>
          <li style={liStyle}>
            <strong>Very large files or weak connection.</strong> Large scans can time out on mobile data. Switch to
            Wi-Fi.
          </li>
          <li style={liStyle}>
            <strong>Browser restrictions.</strong> In-app browsers (inside social or email apps) often block file
            uploads. Open the page in Safari or Chrome.
          </li>
          <li style={liStyle}>
            <strong>Low storage or memory.</strong> Close other apps and clear space.
          </li>
          <li>
            <strong>Damaged or non-standard PDF.</strong> Re-export the file or reprint it to PDF, then try again.
          </li>
        </ul>
      </div>

      {/* Same prefix */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Merge PDF Files With the Same File Prefix (PDF, Merge, Admin)?</h2>
        <p style={pStyle}>
          When dozens of files share a prefix like <code style={mono}>invoice_</code>, selecting them by hand is slow.
          Use a wildcard so the computer groups them for you.
        </p>
        <p style={pStyle}><strong>Mac and Linux:</strong></p>
        <pre style={preStyle}><code>{PREFIX_UNIX_CODE}</code></pre>
        <p style={pStyle}>
          <strong>Windows PowerShell with PDFtk</strong> (open PowerShell as administrator only if the folder requires
          it):
        </p>
        <pre style={preStyle}><code>{PREFIX_POWERSHELL_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The <code style={mono}>Sort-Object Name</code> step guarantees alphabetical order, so number files with
          leading zeros (invoice_01, invoice_02) to avoid invoice_10 landing before invoice_2. Save the output with a
          name that doesn't match the prefix, or it may be included next time.
        </p>
      </div>

      {/* No common title */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Merge PDF Files That Don't Have a Common Title?</h2>
        <p style={pStyle}>When filenames have nothing in common, don't rely on names at all. Instead:</p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Select by hand.</strong> In Tolz, upload the files and arrange them visually. This is the most
            reliable method for mixed files.
          </li>
          <li style={liStyle}>
            <strong>Sort by date or type.</strong> In Windows or Mac, sort the folder by date modified, select the
            files with Ctrl/Cmd+click, and drag them into the tool in order.
          </li>
          <li style={liStyle}>
            <strong>Rename quickly.</strong> Add numeric prefixes (01-, 02-) before merging so the order is locked in.
          </li>
          <li>
            <strong>Use a text list in scripts.</strong> Write the exact filenames in order, for example{" "}
            <code style={mono}>pdftk a.pdf b.pdf c.pdf cat output out.pdf</code>.
          </li>
        </ul>
      </div>

      {/* Different file types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Merge Different File Types Into One PDF Without Losing Quality?</h2>
        <p style={pStyle}>
          The key is converting each file to PDF first with a quality-preserving method, then merging.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Word, Excel, PowerPoint:</strong> use Save As or Export &gt; PDF, which keeps text and vector
            graphics.
          </li>
          <li style={liStyle}>
            <strong>Images (JPG, PNG):</strong> use Print &gt; Save as PDF, or convert at original resolution rather
            than a reduced setting.
          </li>
          <li>
            <strong>Scans:</strong> save at 200-300 DPI for a good balance between sharpness and size.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Once everything is a PDF, merge with Tolz. The merge step itself doesn't re-compress, so any quality you keep
          during conversion is retained in the final document. Avoid screenshots of documents, since they discard
          selectable text.
        </p>
      </div>

      {/* Split vs merge */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between Splitting a PDF and Merging a PDF?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Merging combines several PDFs into one document. Splitting does the opposite, dividing one PDF into smaller
          files by page range, page count, or bookmarks. Use merging when you need a single file to send, print, or
          archive. Use splitting to extract a few pages, separate chapters, or break a heavy file into email-friendly
          pieces. The two work well together: split out the pages you need from one document, then merge them with
          pages from others.
        </p>
      </div>

      {/* Editing merged forms */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are Some Effective Methods for Editing and Adding Text to a Merged PDF Form?</h2>
        <p style={pStyle}>
          Merging is best done first, editing second. Combining files that contain interactive form fields can cause
          duplicate field names, which makes fields mirror each other, so check that after merging. To fill in or
          change a merged form:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Fill the fields</strong> in your PDF reader (Preview, Acrobat Reader, or a browser). Most readers
            support typing directly into form fields.
          </li>
          <li style={liStyle}>
            <strong>Use a text or annotation tool</strong> to place text on flat, non-fillable pages.
          </li>
          <li style={liStyle}>
            <strong>Flatten the form</strong> after filling it, if you want to lock the entries in before sending.
          </li>
          <li>
            <strong>Edit original text</strong> in a dedicated PDF editor, or change the source Word document and
            re-export.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Always keep an unedited copy of the merged file in case you need to start again.
        </p>
      </div>

      {/* iText */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Implement Multiple Table of Contents Pages When Merging PDFs Using iText (Java)?</h2>
        <p style={pStyle}>
          With iText 7/8 for Java, <code style={mono}>PdfMerger</code> combines documents and copies pages and
          outlines. To give each source its own table of contents, merge in sequence and record the page numbers as you
          go:
        </p>
        <pre style={preStyle}><code>{ITEXT_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For a visible TOC, generate TOC pages from the stored titles and start pages, then insert them at the front.
          For clickable bookmarks, use <code style={mono}>PdfOutline</code> with destinations pointing at each
          section's start page. For several TOCs (one per section), repeat the pattern per group. Remember that iText is
          dual-licensed (AGPL or commercial).
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Merge PDF Tool Does</h2>
        <p style={pStyle}>
          The Merge PDF tool takes multiple PDF files and stitches them together into one continuous document while
          preserving the original layout, fonts, images, and page dimensions of every source file. Nothing is
          re-compressed into lower quality or flattened into a picture. Each page keeps its selectable text and
          sharpness, so the merged output looks identical to the originals.
        </p>
        <p style={pStyle}>
          Beyond simply combining PDF files, the tool gives you control over the final structure. You decide the order
          in which documents appear, so a cover letter lands before a resume, or an executive summary sits ahead of the
          appendix. If you upload files in the wrong sequence, you can rearrange them before merging rather than
          starting over. The result is a single PDF that behaves like one document: a natural page-to-page flow, one
          file to store, and one file to share.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because everything runs in the browser, there's no dependency on desktop programs like Adobe Acrobat or bulky
          office suites. You get the core function people actually need, reliable PDF merging, without the
          subscription, the learning curve, or the storage footprint.
        </p>
      </div>

      {/* Why and when */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You Need to Merge PDF Files</h2>
        <p style={pStyle}>
          The need to merge PDF files usually appears at the exact moment you're trying to send or submit something.
          Many portals (job applications, university admissions, grant submissions, and government forms) accept only a
          single PDF upload. If your material lives in five separate files, combining them isn't optional; it's the
          only way to complete the task correctly.
        </p>
        <p style={pStyle}>
          Email is another common trigger. Instead of attaching eight documents and hoping the recipient opens them in
          the right order, one merged file arrives clean and self-explanatory. It also sidesteps attachment clutter and
          reduces the chance a page gets missed or lost in a long thread.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There are practical, everyday reasons too. Printing a single ordered PDF avoids the hassle of opening and
          printing each file individually. Archiving one combined document keeps folders organized and makes future
          searches easier. When presenting to a client or team, scrolling through one seamless file looks far more
          professional than juggling multiple windows. In short, you merge PDF documents whenever order, portability,
          and a single point of reference matter, which for most document workflows is often.
        </p>
      </div>

      {/* PDF types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Works With Different Types of PDF Files</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool handles standard PDFs from virtually any source: documents exported from Word, Excel, Google Docs,
          or design software; PDFs generated by invoicing and accounting apps; and scanned files created by printers or
          mobile scanning apps. Text-based PDFs keep their selectable, searchable text after merging, while scanned or
          image-based pages are preserved exactly as they appear. This flexibility means you can mix a digitally created
          cover page with scanned signature pages and still end up with one coherent document. If a file is
          password-protected, you'll typically need to unlock it first, since encrypted files can't be read for merging
          until the password is removed.
        </p>
      </div>

      {/* Free */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, With No Signup and No Watermarks</h2>
        <p style={pStyle}>
          The Merge PDF tool is completely free, and "free" here means what it should: no trial period, no locked
          features, and no surprise charges at the download step. You don't need to create an account, verify an email,
          or hand over payment details to combine your files.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Just as importantly, the merged output is clean. The tool doesn't stamp watermarks, banners, or promotional
          text onto your pages, so the document you download looks exactly the way you intend, suitable for
          professional, academic, or official use. There are no daily caps hidden behind a paywall and no "upgrade to
          remove branding" prompts.
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
