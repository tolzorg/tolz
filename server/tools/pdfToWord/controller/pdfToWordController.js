import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

// ── Text-extraction conversion (pdfjs-dist + docx) ───────────────────────────
function getFontSize(item) {
  if (item.height > 0) return item.height;
  const a = item.transform[0];
  const b = item.transform[1];
  return Math.sqrt(a * a + b * b) || 12;
}

function linePartsToText(parts, fontSize) {
  if (!parts.length) return "";
  let text = parts[0].str;
  for (let i = 1; i < parts.length; i++) {
    const prev = parts[i - 1];
    const curr = parts[i];
    const gap  = curr.x - (prev.x + prev.w);
    text += gap > fontSize * 0.3 ? " " + curr.str : curr.str;
  }
  return text.replace(/\s+/g, " ").trim();
}

function extractPageLines(items) {
  const textItems = items.filter((it) => "str" in it && it.str.trim() !== "");
  if (!textItems.length) return [];

  textItems.sort((a, b) => {
    const dy = b.transform[5] - a.transform[5];
    if (Math.abs(dy) > 0.5) return dy;
    return a.transform[4] - b.transform[4];
  });

  const lines = [];
  let cur = null;

  for (const item of textItems) {
    const y  = item.transform[5];
    const fs = getFontSize(item);
    const part = { str: item.str, x: item.transform[4], w: item.width || 0 };

    if (!cur) {
      cur = { y, fontSize: fs, parts: [part] };
    } else {
      const tolerance = Math.max(fs, cur.fontSize) * 0.6;
      if (Math.abs(y - cur.y) <= tolerance) {
        cur.parts.push(part);
        cur.fontSize = Math.max(cur.fontSize, fs);
      } else {
        lines.push(cur);
        cur = { y, fontSize: fs, parts: [part] };
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function buildDocxFromPages(pageLines, title) {
  const allLines = pageLines.flat();

  const freq = new Map();
  for (const ln of allLines) {
    const fs = Math.round(ln.fontSize);
    if (fs > 0) freq.set(fs, (freq.get(fs) || 0) + 1);
  }
  let bodyFs = 12, maxCount = 0;
  for (const [fs, count] of freq) {
    if (count > maxCount) { maxCount = count; bodyFs = fs; }
  }

  const children = [];
  for (let pi = 0; pi < pageLines.length; pi++) {
    const pLines = pageLines[pi];
    for (let i = 0; i < pLines.length; i++) {
      const line = pLines[i];
      const text = linePartsToText(line.parts, line.fontSize);
      if (!text) continue;
      const ratio = line.fontSize / bodyFs;
      let para;
      if (ratio >= 1.8)      para = new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
      else if (ratio >= 1.3) para = new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
      else if (ratio >= 1.1) para = new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
      else                   para = new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });
      children.push(para);
      if (i + 1 < pLines.length) {
        const gap   = line.y - pLines[i + 1].y;
        const lineH = Math.max(line.fontSize, pLines[i + 1].fontSize);
        if (gap > lineH * 2.5) children.push(new Paragraph({ children: [new TextRun("")] }));
      }
    }
    if (pi < pageLines.length - 1 && pLines.length > 0)
      children.push(new Paragraph({ children: [new TextRun("")] }));
  }

  if (!children.length) children.push(new Paragraph({ children: [new TextRun("")] }));
  return new Document({ creator: "tolz", title, sections: [{ children }] });
}

async function convertWithTextExtraction(pdfBuffer, stem) {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    verbosity: 0,
    useSystemFonts: true,
  });

  let pdfDoc;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err) {
    await loadingTask.destroy();
    const msg = (err.message || "").toLowerCase();
    if (msg.includes("encrypt") || msg.includes("password"))
      throw new Error("This PDF is encrypted or password-protected. Please remove the password first.");
    throw new Error("Could not read this PDF. It may be corrupted or invalid.");
  }

  try {
    const pageLines = [];
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      const page    = await pdfDoc.getPage(p);
      const content = await page.getTextContent();
      pageLines.push(extractPageLines(content.items));
      page.cleanup();
    }
    const doc = buildDocxFromPages(pageLines, stem);
    return Packer.toBuffer(doc);
  } finally {
    await loadingTask.destroy();
  }
}

// ── Filename helpers ────────────────────────────────────────────────────────────
function sanitizeStem(name) {
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  return stem.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "document";
}

// ── Main handler ────────────────────────────────────────────────────────────────
export async function convertPdfsToWord(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, error: "Please upload at least one PDF file." });
  }

  const results = [];

  for (const file of req.files) {
    const stem    = sanitizeStem(file.originalname);
    const outName = `${stem}.docx`;

    try {
      const docxBuffer = await convertWithTextExtraction(file.buffer, stem);
      const method = "text-extraction";

      results.push({
        name: outName,
        data: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${Buffer.from(docxBuffer).toString("base64")}`,
        size: docxBuffer.length,
        originalSize: file.buffer.length,
        method,
      });
    } catch (err) {
      console.error("[pdfToWord] error:", file.originalname, err.message);
      results.push({ name: file.originalname, error: `Failed to convert "${file.originalname}". Please ensure it is a valid, unencrypted PDF.` });
    }
  }

  return res.json({ success: true, results });
}
