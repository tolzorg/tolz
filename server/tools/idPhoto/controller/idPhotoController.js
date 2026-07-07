import { PDFDocument } from "pdf-lib";
import { mmToPt } from "../utils/mmToPt.js";

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

// Embeds the client's already-composited, already-flattened print-sheet PNG
// (exact px @ 300 DPI) 1:1 into a PDF page sized to the exact physical paper
// dimensions (mm -> pt). No re-encoding, no resampling, no auto-scaling —
// the goal is byte-for-byte fidelity between the on-screen preview and the
// printed page.
export async function generatePrintSheetPdf(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: "No print sheet image uploaded" });

  const paperWidthMM = parseFloat(req.body.paperWidthMM);
  const paperHeightMM = parseFloat(req.body.paperHeightMM);
  if (!isFinite(paperWidthMM) || !isFinite(paperHeightMM) || paperWidthMM <= 0 || paperHeightMM <= 0) {
    return res.status(400).json({ success: false, error: "Invalid paper dimensions" });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const embeddedImage = await pdfDoc.embedPng(req.file.buffer);

    const width = mmToPt(paperWidthMM);
    const height = mmToPt(paperHeightMM);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

    pdfDoc.setTitle("ID Photo Print Sheet");
    pdfDoc.setProducer("ID Photo Generator (Print Studio)");
    pdfDoc.setSubject(`Print at 100% / Actual Size — ${paperWidthMM}x${paperHeightMM}mm, 300 DPI, sRGB`);

    const pdfBytes = await pdfDoc.save();
    res.json({
      success: true,
      data: toDataUrl(Buffer.from(pdfBytes), "application/pdf"),
      name: "print_sheet.pdf",
      size: pdfBytes.length,
    });
  } catch (err) {
    console.error("generatePrintSheetPdf error:", err.message);
    res.status(500).json({ success: false, error: "PDF creation failed" });
  }
}
