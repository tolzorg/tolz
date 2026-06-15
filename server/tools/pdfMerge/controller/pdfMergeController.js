import { PDFDocument } from "pdf-lib";

export async function mergePdfs(req, res) {
  if (!req.files?.length || req.files.length < 2) {
    return res.status(400).json({
      success: false,
      error: "Please upload at least 2 PDF files to merge.",
    });
  }

  try {
    const merged = await PDFDocument.create();

    for (const file of req.files) {
      let donor;
      try {
        donor = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      } catch {
        return res.status(400).json({
          success: false,
          error: `"${file.originalname}" is not a valid or readable PDF.`,
        });
      }

      const indices = donor.getPageIndices();
      if (indices.length === 0) continue; // skip blank PDFs silently

      const copied = await merged.copyPages(donor, indices);
      copied.forEach((page) => merged.addPage(page));
    }

    if (merged.getPageCount() === 0) {
      return res.status(400).json({ success: false, error: "All uploaded PDFs appear to be empty." });
    }

    const pdfBytes = await merged.save();

    res.json({
      success: true,
      data: `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`,
      name: "merged.pdf",
      size: pdfBytes.length,
      pageCount: merged.getPageCount(),
    });
  } catch (err) {
    console.error("mergePdfs error:", err.message);
    res.status(500).json({
      success: false,
      error: "PDF merge failed. Ensure all files are valid, unencrypted PDFs.",
    });
  }
}
