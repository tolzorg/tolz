import { PDFDocument } from "pdf-lib";

const MAX_OUTPUT_PARTS = 100;

function sanitizeStem(name) {
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  return stem.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "document";
}

function parseRanges(input, totalPages) {
  const tokens = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (!tokens.length) throw new Error("No page ranges specified.");

  const chunks = [];
  for (const token of tokens) {
    if (token.includes("-")) {
      const parts = token.split("-");
      if (parts.length !== 2) throw new Error(`Invalid range "${token}".`);
      const a = parseInt(parts[0].trim(), 10);
      const b = parseInt(parts[1].trim(), 10);
      if (isNaN(a) || isNaN(b))
        throw new Error(`Invalid range "${token}": must be numbers.`);
      if (a < 1 || b < 1)
        throw new Error(`Invalid range "${token}": page numbers must be positive.`);
      if (a > b)
        throw new Error(`Invalid range "${token}": start (${a}) must be ≤ end (${b}).`);
      if (b > totalPages)
        throw new Error(
          `Invalid range "${token}": page ${b} exceeds total pages (${totalPages}).`
        );
      chunks.push({
        label: a === b ? `${a}` : `${a}-${b}`,
        indices: Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i),
      });
    } else {
      const p = parseInt(token, 10);
      if (isNaN(p)) throw new Error(`Invalid page number "${token}".`);
      if (p < 1) throw new Error(`Page number "${token}" must be positive.`);
      if (p > totalPages)
        throw new Error(
          `Page ${p} exceeds total pages (${totalPages}).`
        );
      chunks.push({ label: `${p}`, indices: [p - 1] });
    }
  }
  return chunks;
}

// ── /api/pdf/info ─────────────────────────────────────────────────────────────
export async function getPdfInfo(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF file uploaded." });
  }
  try {
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    return res.json({
      success: true,
      pageCount: pdfDoc.getPageCount(),
      filename: req.file.originalname,
    });
  } catch (err) {
    const msg = err.message || "";
    if (
      msg.toLowerCase().includes("encrypt") ||
      msg.toLowerCase().includes("password")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "This PDF is encrypted or password-protected. Please remove the password first.",
        encrypted: true,
      });
    }
    return res.status(400).json({
      success: false,
      error: "Could not read this PDF. It may be corrupted or invalid.",
    });
  }
}

// ── /api/pdf/split ────────────────────────────────────────────────────────────
export async function splitPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF file uploaded." });
  }

  const mode = (req.body.mode || "ranges").toLowerCase();
  if (!["ranges", "every_page", "every_n"].includes(mode)) {
    return res.status(400).json({ success: false, error: "Invalid split mode." });
  }

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(req.file.buffer);
  } catch (err) {
    const msg = err.message || "";
    if (
      msg.toLowerCase().includes("encrypt") ||
      msg.toLowerCase().includes("password")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "This PDF is encrypted or password-protected. Please remove the password first.",
      });
    }
    return res.status(400).json({
      success: false,
      error: "Could not read this PDF. It may be corrupted or invalid.",
    });
  }

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    return res.status(400).json({
      success: false,
      error: "The uploaded PDF has no pages.",
    });
  }

  const stem = sanitizeStem(req.file.originalname);
  let chunks = [];

  try {
    if (mode === "ranges") {
      const rangesInput = (req.body.ranges || "").trim();
      if (!rangesInput) {
        return res.status(400).json({
          success: false,
          error: "Please specify page ranges.",
          totalPages,
        });
      }
      if (rangesInput.length > 500) {
        return res.status(400).json({
          success: false,
          error: "Page ranges input is too long. Maximum is 500 characters.",
          totalPages,
        });
      }
      chunks = parseRanges(rangesInput, totalPages);
    } else if (mode === "every_page") {
      for (let i = 0; i < totalPages; i++) {
        chunks.push({ label: `${i + 1}`, indices: [i] });
      }
    } else {
      const n = parseInt(req.body.n, 10);
      if (isNaN(n) || n < 1) {
        return res.status(400).json({
          success: false,
          error: "Please specify a valid number of pages per chunk (minimum 1).",
          totalPages,
        });
      }
      if (n >= totalPages) {
        return res.status(400).json({
          success: false,
          error: `N (${n}) must be less than the total page count (${totalPages}).`,
          totalPages,
        });
      }
      for (let i = 0; i < totalPages; i += n) {
        const end = Math.min(i + n - 1, totalPages - 1);
        const indices = Array.from({ length: end - i + 1 }, (_, k) => i + k);
        chunks.push({
          label: i === end ? `${i + 1}` : `${i + 1}-${end + 1}`,
          indices,
        });
      }
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message, totalPages });
  }

  if (!chunks.length) {
    return res.status(400).json({
      success: false,
      error: "No output parts were generated. Check your input.",
      totalPages,
    });
  }

  if (chunks.length > MAX_OUTPUT_PARTS) {
    return res.status(400).json({
      success: false,
      error: `Too many output parts (${chunks.length}). Maximum is ${MAX_OUTPUT_PARTS} parts. Use a larger chunk size or split into fewer sections.`,
      totalPages,
    });
  }

  try {
    const files = [];
    const multi = chunks.length > 1;

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(pdfDoc, chunk.indices);
      copied.forEach((page) => newDoc.addPage(page));
      const pdfBytes = await newDoc.save();

      const name = multi
        ? `${stem}_pages_${chunk.label}.pdf`
        : `${stem}_page_${chunk.label}.pdf`;

      files.push({
        name,
        data: `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`,
        pages: chunk.indices.length,
        size: pdfBytes.length,
      });
    }

    return res.json({
      success: true,
      files,
      totalPages,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error("[pdfSplit] error:", err.message);
    return res.status(500).json({
      success: false,
      error: "PDF splitting failed. Please try again.",
    });
  }
}
