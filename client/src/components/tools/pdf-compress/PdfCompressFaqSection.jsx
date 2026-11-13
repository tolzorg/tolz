import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is the Compress PDF tool free to use?",
    a: "Yes. Compressing a PDF is completely free with no hidden charges, subscription, or trial limits.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "No. Upload your file, compress it, and download the result without providing an email address.",
  },
  {
    q: "Will compressing reduce the quality of my PDF?",
    a: "Not noticeably for normal use. Text stays sharp, and images are optimised to a resolution that looks clean on screen and in standard printing.",
  },
  {
    q: "How much smaller will my file get?",
    a: "It depends on the contents. Image-heavy or scanned PDFs often shrink by 70% to 90%, while text-only documents shrink less. The tool shows the new size after compression.",
  },
  {
    q: "Is it safe to compress confidential documents online?",
    a: "Your files are processed securely and are not stored or shared. For highly sensitive files, consider offline compression and keep a local master copy.",
  },
  {
    q: "Does the compressed PDF have a watermark?",
    a: "No. Your compressed file looks like the original, just smaller.",
  },
  {
    q: "Can I compress a PDF on my phone?",
    a: "Yes. The tool runs in your browser on Android, iOS, Windows, and macOS with nothing to install.",
  },
  {
    q: "Can I compress a PDF that is already compressed?",
    a: "Often, yes, if it still contains large images. Gains are smaller each time, so start from the original when you can.",
  },
  {
    q: "Why won't my PDF attach to an email?",
    a: "Most providers limit attachments to around 25 MB. Compress the file first, then attach it.",
  },
];

const BATCH_CODE = `mkdir compressed
Get-ChildItem *.pdf | ForEach-Object {
  gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="compressed\\$($_.Name)" $_.FullName
}`;

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
const olStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const preStyle = {
  ...mono, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-primary)", background: "var(--bg-muted)",
  border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", margin: "0 0 10px", overflowX: "auto",
};
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

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

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* What compressing does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does Compressing a PDF Do?</h2>
        <p style={pStyle}>
          Compression removes redundancy. Any file contains patterns and repetition that take up more space than the
          actual information requires. A simple analogy is text shorthand: writing "gr8" instead of "great" conveys the
          same idea in fewer characters. Real compression algorithms do the same thing far more cleverly, finding
          repeated sequences and storing them once, then referencing them. Well-designed algorithms can shrink plain
          English text by roughly a factor of three to four.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The key distinction is whether the process can be reversed. <strong>Lossless compression</strong> is fully
          reversible: the original data can be rebuilt exactly, with no errors. Shorthand like "gr8" is not lossless,
          because you cannot be sure whether the original said "great" or "gr8". <strong>Lossy compression</strong>{" "}
          deliberately discards detail that is hard to notice, which is how it achieves much bigger savings. At its
          simplest, compressing a PDF means running an algorithm over the file's data and writing out a smaller version
          of it. That is the whole principle; everything else is about choosing what to compress and how hard.
        </p>
      </div>

      {/* How tools work */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do PDF Compression Tools Work, and What Makes PDF Special?</h2>
        <p style={pStyle}>
          A PDF is not one block of data. It is a container holding text, fonts, vector graphics, images, metadata, and
          an internal structure, and each part compresses differently. This is what makes PDF compression more
          interesting than zipping a file. A compressor can treat each component on its own terms:
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Images</strong> usually make up most of a PDF's weight. The tool downsamples them to a sensible
            resolution and re-encodes them more efficiently, for example as JPEG, so a 600 dpi scan becomes a clean 150
            dpi page that still reads well on screen.
          </li>
          <li style={liStyle}>
            <strong>Fonts</strong> are often embedded in full, sometimes more than once. The tool keeps only the
            characters the document actually uses (subsetting) and removes duplicates.
          </li>
          <li style={liStyle}>
            <strong>Text and vector content</strong> stays as text and vectors, so it remains sharp and searchable.
          </li>
          <li>
            <strong>Hidden data</strong> such as unused objects, old edit history, thumbnails, and redundant metadata
            is stripped out, and the file's internal structure is rewritten more compactly.
          </li>
        </ul>
        <p style={pStyle}>
          The PDF format itself, standardised as <Ext href="https://www.iso.org/standard/75839.html">ISO 32000</Ext>,
          supports several compression filters, which is why a well-built tool can shrink a document dramatically
          without changing a single page of its layout.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Can you do it manually?</strong> Yes, though results vary. Acrobat's File &gt; Save as Other &gt;
          Reduced Size PDF applies one fixed preset, which is why people often find it shrinks less than a dedicated
          compressor. Acrobat's more advanced PDF Optimizer lets you control image quality, fonts, and cleanup
          separately, but it needs a paid licence and some trial and error. Command-line tools such as Ghostscript offer
          similar control for free. A browser tool like Tolz applies sensible optimisation settings automatically, so
          you get comparable savings without configuring anything.
        </p>
      </div>

      {/* Is it bad */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is It Bad to Compress a PDF? Does It Always Reduce Quality?</h2>
        <p style={pStyle}>
          No, compressing a PDF is not harmful. The original file is untouched, and you receive a separate, smaller
          copy. The only question is how much visual detail the copy gives up, and the answer depends on the kind of
          compression used.
        </p>
        <p style={pStyle}>
          Image quality does not have to drop noticeably. Lossless steps (removing duplicate fonts, dropping unused
          objects, packing the structure efficiently) change nothing visible. Lossy steps affect only images, and
          moderate downsampling of a photo or scan is rarely visible at normal viewing sizes. Text and line art are kept
          as crisp vector data, so they stay sharp at any zoom level.
        </p>
        <p style={pStyle}>What can change after compression:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>File size drops</strong>, and this is the goal. Image-heavy files often shrink by 70% to 90%;
            text-only files shrink less.
          </li>
          <li style={liStyle}>
            <strong>Image sharpness may reduce slightly</strong>, which matters only if you zoom in heavily or print at
            poster size.
          </li>
          <li style={liStyle}>
            <strong>Metadata</strong> such as author fields or edit history may be removed.
          </li>
          <li>
            <strong>Page content, layout, links, and fillable fields</strong> stay the same.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The one scenario to be careful with is professional print production. Keep your original as a master and use
          the compressed copy for email, uploads, and everyday reading.
        </p>
      </div>

      {/* Without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Compress a PDF Without Losing Quality?</h2>
        <p style={pStyle}>The practical goal is not zero change, it is no visible change. To get there:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Start from the original file</strong>, not a copy that has already been compressed or re-saved
            several times. Each lossy pass degrades images a little more.
          </li>
          <li style={liStyle}>
            <strong>Use a tool that preserves text as text.</strong> Tolz keeps text and vector graphics intact and only
            optimises embedded images.
          </li>
          <li style={liStyle}>
            <strong>Check the result before sending.</strong> Open the compressed file, zoom to around 100%, and scan a
            few pages with images or small print.
          </li>
          <li>
            <strong>Keep the original.</strong> If the compressed version is too soft for a specific purpose, you can
            always try again from the source.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you control the source document, you can also prevent bloat before it starts: export from Word,
          PowerPoint, or Google Docs using a "minimum size" or "standard" option, and avoid pasting oversized images.
        </p>
      </div>

      {/* Best software */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Software to Compress PDF Files?</h2>
        <p style={pStyle}>
          The best option depends on what you need. For quick, one-off jobs on any device, an online compressor with no
          signup is the fastest route, and that is exactly what Tolz Compress PDF is built for: free, no watermark, no
          installation, and no settings to learn. It is a strong fit for email attachments, form uploads, and everyday
          sharing.
        </p>
        <p style={pStyle}>Other routes make sense in other situations:</p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Adobe Acrobat</strong> (official guide) is best when you already pay for it and want fine control
            over images, fonts, and cleanup.
          </li>
          <li style={liStyle}>
            <strong>Preview on macOS</strong> has a built-in "Reduce File Size" Quartz filter, which is convenient but
            often over-compresses images and gives mixed results.
          </li>
          <li>
            <strong>Ghostscript</strong> is a free, open-source command-line tool suited to scripting and large batches.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For most people compressing a document now and then, the simplest tool that gives a clean result is the best
          one.
        </p>
      </div>

      {/* Offline */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Compress PDF Files Offline?</h2>
        <p style={pStyle}>
          If you cannot or prefer not to upload a file, you can compress PDFs locally on your own computer:
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>Adobe Acrobat (Windows and Mac):</strong> open the file, choose File &gt; Save as Other &gt; Reduced
            Size PDF, or use Optimize PDF for more control.
          </li>
          <li style={liStyle}>
            <strong>Preview (Mac):</strong> open the PDF, choose File &gt; Export, and set the Quartz Filter to Reduce
            File Size. Check the output carefully, as image quality can drop noticeably.
          </li>
          <li style={liStyle}>
            <strong>Ghostscript (Windows, Mac, Linux):</strong> a free command-line option that works fully offline.
            See the batch example below.
          </li>
          <li>
            <strong>Microsoft Word or PowerPoint:</strong> if you still have the source file, use File &gt; Save As
            &gt; PDF and choose Minimum size instead of Standard.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Offline tools take more setup than a browser tool, but they keep files on your device from start to finish.
        </p>
      </div>

      {/* Batch on Windows */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Batch Resize and Compress PDF Files in Windows?</h2>
        <p style={pStyle}>
          For a whole folder, a short{" "}
          <Ext href="https://ghostscript.com/releases/gsdnld.html">Ghostscript</Ext> script is the most reliable free
          method. After installing Ghostscript, open PowerShell in the folder containing your PDFs and run:
        </p>
        <pre style={preStyle}><code>{BATCH_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The <code style={mono}>/ebook</code> setting targets roughly 150 dpi images, a good balance for screen
          reading. Use <code style={mono}>/screen</code> for the smallest files (about 72 dpi) or{" "}
          <code style={mono}>/printer</code> for higher quality. Each file is saved in the new{" "}
          <code style={mono}>compressed</code> folder, so your originals stay safe. If you have Acrobat Pro, its Action
          Wizard can run an Optimize action across a folder with no scripting. For occasional single files, the Tolz
          tool remains quicker.
        </p>
      </div>

      {/* Already compressed */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can I Compress an Already Compressed PDF Further, From 20 MB to 12 MB?</h2>
        <p style={pStyle}>
          Often yes, but with diminishing returns. A file that has already been compressed has had the easy savings
          taken, so what is left depends on what the PDF contains.
        </p>
        <ul style={olStyle}>
          <li style={liStyle}>
            <strong>If it is still image-heavy</strong>, a second pass at a lower image resolution can still cut a
            large amount. Going from 20 MB to 12 MB (a 40% cut) is usually realistic for scans and photo-rich files.
          </li>
          <li style={liStyle}>
            <strong>If it is mostly text</strong>, there is little left to remove, and a second pass may change almost
            nothing.
          </li>
          <li>
            <strong>Quality is the trade-off.</strong> Repeated lossy compression compounds image degradation, so always
            try again from the original if you still have it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the file will not reach your target, try these in order: compress again with Tolz and compare sizes; split
          the document into parts; remove unneeded pages, attachments, or embedded media; or re-scan at a lower
          resolution (150 to 200 dpi is enough for most documents). Always check the final size before submitting to a
          portal with a strict limit.
        </p>
      </div>

      {/* Confidential */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Compress a PDF That Contains Confidential Data?</h2>
        <p style={pStyle}>Treat sensitive files with the same care you would any private document:</p>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Use a tool that states clearly how files are handled.</strong> Tolz processes your PDF securely,
            does not share it, and does not require an account.
          </li>
          <li style={liStyle}>
            <strong>Prefer offline compression for highly sensitive files</strong>, such as legal, medical, or financial
            records, if your policy forbids uploading them anywhere. Acrobat or Ghostscript on your own machine keeps
            data local.
          </li>
          <li style={liStyle}>
            <strong>Remove what should not be there.</strong> Compression is not redaction. Hidden text, comments, and
            metadata can persist, so use a proper redaction tool if parts must be hidden.
          </li>
          <li style={liStyle}>
            <strong>Protect the result.</strong> Add a password or send via a secure sharing link rather than a plain
            attachment. Guidance from the{" "}
            <Ext href="https://csrc.nist.gov/">NIST Computer Security Resource Center</Ext> is a useful reference for
            handling sensitive information.
          </li>
          <li>
            <strong>Delete temporary copies</strong> from shared computers and download folders.
          </li>
        </ul>
      </div>

      {/* PDF types */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Different Types of PDFs Compress</h2>
        <ul style={{ ...olStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Scanned documents</strong> (contracts, ID copies, receipts) are stored as full-page images and see
            the biggest reductions.
          </li>
          <li style={liStyle}>
            <strong>Presentations and brochures</strong> carry photos, logos, and backgrounds, and shrink substantially
            with little visible change.
          </li>
          <li style={liStyle}>
            <strong>Text-based files</strong> (ebooks, essays, reports) are already compact, so savings are modest. If a
            file barely shrinks, it was likely well optimised already.
          </li>
          <li>
            <strong>Forms and interactive PDFs</strong> keep their fillable fields after compression.
          </li>
        </ul>
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
