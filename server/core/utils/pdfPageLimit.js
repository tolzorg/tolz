import { PDFDocument } from "pdf-lib";

// A small PDF can contain thousands of (near-empty) pages, and the PDF tools
// process every page on the main thread — work that can't be interrupted.
// This middleware rejects requests whose PDFs have more pages in total than
// the route allows, before any heavy processing starts. Limits are generous
// so normal documents are never affected.

async function countPages(buffer) {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
  return doc.getPageCount();
}

/** Express middleware: total pages across the uploaded PDFs must be ≤ maxPages. */
export function limitPdfPages(maxPages) {
  return async (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    let total = 0;
    for (const file of files) {
      try {
        total += await countPages(file.buffer);
      } catch {
        // Unreadable here — let the tool's own error handling report it.
        continue;
      }
      if (total > maxPages) {
        return res.status(413).json({
          success: false,
          error: `PDFs can have at most ${maxPages.toLocaleString("en-US")} pages in total for this tool.`,
        });
      }
    }
    next();
  };
}
