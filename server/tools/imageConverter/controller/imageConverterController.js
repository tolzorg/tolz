import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESSDATA_PATH = join(__dirname, "..", "..", "..", "tessdata");

const require = createRequire(import.meta.url);

const A4_W = 595.28;
const A4_H = 841.89;

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

// Fit image dimensions inside A4, preserving aspect ratio
function fitToA4(w, h) {
  const scale = Math.min(A4_W / w, A4_H / h, 1);
  return { width: w * scale, height: h * scale };
}

// Binary search JPEG quality to hit a byte target
async function compressJpegToTarget(buffer, targetBytes) {
  let lo = 1, hi = 85, best = null, bestDiff = Infinity;
  for (let i = 0; i < 12 && lo <= hi; i++) {
    const mid = Math.round((lo + hi) / 2);
    const data = await sharp(buffer).jpeg({ quality: mid }).toBuffer();
    const diff = Math.abs(data.length - targetBytes);
    if (diff < bestDiff) { bestDiff = diff; best = data; }
    if (data.length > targetBytes) hi = mid - 1;
    else lo = mid + 1;
  }
  return best || await sharp(buffer).jpeg({ quality: 1 }).toBuffer();
}

// ─── 1. Convert any image → JPG ─────────────────────────────────────────────
export async function convertToJpg(req, res) {
  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });
  try {
    const results = await Promise.all(req.files.map(async (file) => {
      try {
        const data = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
        return { name: file.originalname.replace(/\.[^.]+$/, ".jpg"), data: toDataUrl(data, "image/jpeg"), size: data.length };
      } catch (err) {
        return { name: file.originalname, error: "Could not convert this image" };
      }
    }));
    res.json({ success: true, results });
  } catch (err) {
    console.error("convertToJpg error:", err.message);
    res.status(500).json({ success: false, error: "Conversion failed" });
  }
}

// ─── 2. HEIC → JPG ──────────────────────────────────────────────────────────
export async function heicToJpg(req, res) {
  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });

  const heicConvert = require("heic-convert");

  try {
    const results = await Promise.all(req.files.map(async (file) => {
      try {
        let jpegBuffer;

        // Strategy 1: sharp native HEIC decoding (works when libvips is built
        // with libheif support — common on Linux servers with sharp ≥ 0.31).
        try {
          jpegBuffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
        } catch (sharpErr) {
          console.error(`heicToJpg [sharp] "${file.originalname}": ${sharpErr.message}`);

          // Strategy 2: heic-convert → heic-decode → libheif-js (WASM).
          // IMPORTANT: pass the Node Buffer (Uint8Array) directly.
          // Previously this extracted an ArrayBuffer via .buffer.slice(), but
          // heic-decode's isHeic() uses the spread operator (...buf.slice())
          // which requires an iterable — ArrayBuffer is NOT iterable, causing a
          // silent TypeError that made every conversion fail at this step.
          try {
            const converted = await heicConvert({ buffer: file.buffer, format: "JPEG", quality: 0.92 });
            // heic-convert returns a Buffer (jpeg-js output); ensure it is a Node Buffer
            jpegBuffer = await sharp(Buffer.from(converted)).jpeg({ quality: 90 }).toBuffer();
          } catch (convertErr) {
            console.error(`heicToJpg [heic-convert] "${file.originalname}": ${convertErr.message}`);
            throw convertErr;
          }
        }

        return {
          name: file.originalname.replace(/\.[^.]+$/, ".jpg"),
          data: toDataUrl(jpegBuffer, "image/jpeg"),
          size: jpegBuffer.length,
        };
      } catch (err) {
        // Surface a specific reason when heic-decode rejects the file so the
        // user understands whether it is a format issue or a corruption issue.
        const msg = (err.message || "").toLowerCase();
        let reason;
        if (msg.includes("not a heic") || msg.includes("not iterable")) {
          reason = "The file does not appear to be a supported HEIC/HEIF variant. "
            + "Files from iPhone, iPad, and most Android devices are supported.";
        } else if (msg.includes("not found") || msg.includes("0 image")) {
          reason = "No image data was found inside the HEIC container. "
            + "The file may be corrupted or a Live Photo video-only fragment.";
        } else {
          reason = "Conversion failed. The file may be corrupted, password-protected, "
            + "or use a HEIC variant that is not yet supported.";
        }
        return { name: file.originalname, error: reason };
      }
    }));
    res.json({ success: true, results });
  } catch (err) {
    console.error("heicToJpg error:", err.message);
    res.status(500).json({ success: false, error: "Conversion failed" });
  }
}

// ─── 3. Images → PDF ────────────────────────────────────────────────────────
export async function imagesToPdf(req, res) {
  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });
  try {
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      let buf = file.buffer;
      let mime = file.mimetype;

      // Convert non-JPEG/PNG to JPEG for PDF embedding
      if (!["image/jpeg", "image/jpg", "image/png"].includes(mime)) {
        buf = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
        mime = "image/jpeg";
      }

      const meta = await sharp(buf).metadata();
      const { width, height } = fitToA4(meta.width, meta.height);

      let embeddedImage;
      if (mime === "image/png") {
        embeddedImage = await pdfDoc.embedPng(buf);
      } else {
        embeddedImage = await pdfDoc.embedJpg(buf);
      }

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();
    res.json({
      success: true,
      data: toDataUrl(Buffer.from(pdfBytes), "application/pdf"),
      name: "images.pdf",
      size: pdfBytes.length,
    });
  } catch (err) {
    console.error("imagesToPdf error:", err.message);
    res.status(500).json({ success: false, error: "PDF creation failed" });
  }
}

// ─── 4. JPG → PDF with size cap (100 KB or 500 KB) ─────────────────────────
export async function jpgToPdfSized(req, res) {
  const maxKb = parseInt(req.body.maxKb) || 100;
  const targetPdfBytes = maxKb * 1024;

  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });

  try {
    // Allocate ~80 % of the budget to image data; leave headroom for PDF metadata
    const perImageBudget = Math.floor((targetPdfBytes * 0.80) / req.files.length);

    const compressedBuffers = await Promise.all(req.files.map(async (file) => {
      let buf = file.buffer;
      if (!["image/jpeg", "image/jpg"].includes(file.mimetype)) {
        buf = await sharp(buf).jpeg({ quality: 85 }).toBuffer();
      }
      return compressJpegToTarget(buf, perImageBudget);
    }));

    const pdfDoc = await PDFDocument.create();
    for (const compressed of compressedBuffers) {
      const meta = await sharp(compressed).metadata();
      const { width, height } = fitToA4(meta.width, meta.height);
      const embeddedImage = await pdfDoc.embedJpg(compressed);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();
    res.json({
      success: true,
      data: toDataUrl(Buffer.from(pdfBytes), "application/pdf"),
      name: `output_under_${maxKb}kb.pdf`,
      size: pdfBytes.length,
    });
  } catch (err) {
    console.error("jpgToPdfSized error:", err.message);
    res.status(500).json({ success: false, error: "PDF creation failed" });
  }
}

// ─── 5. JPEG → PNG ──────────────────────────────────────────────────────────
export async function jpegToPng(req, res) {
  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });
  try {
    const results = await Promise.all(req.files.map(async (file) => {
      try {
        const data = await sharp(file.buffer).png({ compressionLevel: 6 }).toBuffer();
        return { name: file.originalname.replace(/\.[^.]+$/, ".png"), data: toDataUrl(data, "image/png"), size: data.length };
      } catch (err) {
        return { name: file.originalname, error: "Could not convert this image" };
      }
    }));
    res.json({ success: true, results });
  } catch (err) {
    console.error("jpegToPng error:", err.message);
    res.status(500).json({ success: false, error: "Conversion failed" });
  }
}

// ─── OCR helpers ─────────────────────────────────────────────────────────────

// assessOcr — used when tesseract.js populates data.words (word-level path).
//
// Two complementary strategies:
//   A) Statistical gates — all three must pass:
//        avgConf    mean word confidence; noise/photos typically < 25.
//        coverage   fraction of words scoring ≥ CONF_FLOOR (50).
//        confCount  absolute count of confident substantive words.
//   B) High-confidence fast-pass — bypasses A when an image mixes text with
//      graphics (OG images, infographics, posters).  Icon regions produce many
//      low-confidence words that drag the averages below the A thresholds even
//      though the real text words score 65–90.  ≥ HIGH_CONF_COUNT words at
//      ≥ HIGH_CONF_FLOOR is sufficient proof of real text; noise images never
//      yield that many genuinely high-confidence character groups.
function assessOcr(words) {
  const AVG_CONF_MIN    = 35;
  const CONF_FLOOR      = 50;
  const COVERAGE_MIN    = 0.20;
  const CONF_COUNT_MIN  = 3;
  const HIGH_CONF_FLOOR = 65;
  const HIGH_CONF_COUNT = 5;

  if (!words?.length) return { readable: false };

  const confidentWords = words.filter(w => w.confidence >= CONF_FLOOR && w.text.trim().length > 1);
  const highConfWords  = words.filter(w => w.confidence >= HIGH_CONF_FLOOR && w.text.trim().length > 1);
  const avgConf  = words.reduce((s, w) => s + w.confidence, 0) / words.length;
  const coverage = confidentWords.length / words.length;

  if (highConfWords.length >= HIGH_CONF_COUNT)
    return { readable: true, avgConf, coverage, confidentCount: confidentWords.length };

  const readable =
    avgConf  >= AVG_CONF_MIN  &&
    coverage >= COVERAGE_MIN  &&
    confidentWords.length >= CONF_COUNT_MIN;

  return { readable, avgConf, coverage, confidentCount: confidentWords.length };
}

// extractTextFromRaw — used when tesseract.js does NOT populate data.words
// (observed consistently in tesseract.js v7 on this runtime: data.words = [],
// data.lines = [], but data.text contains the recognised content).
//
// Keeps only lines that contain ≥ 2 alphabetic tokens of ≥ 3 characters.
// This removes lines produced by graphic elements ("= LE) Ble", "Toor 2 B={")
// while preserving lines that carry real text
// ("Free Tools Available on Tolz", "PDF tools Image Editing Calculators…").
// Returns an empty string for pure-noise images (no line passes the filter).
function extractTextFromRaw(raw) {
  return (raw || "")
    .split("\n")
    .map(l => l.trim())
    .filter(l => (l.match(/[a-zA-Z]{3,}/g) || []).length >= 1)
    .join("\n")
    .trim();
}

// ─── 6. JPG → Text (OCR) ────────────────────────────────────────────────────
export async function jpgToText(req, res) {
  if (!req.files?.length) return res.status(400).json({ success: false, error: "No images uploaded" });
  let worker;
  try {
    const { createWorker } = await import("tesseract.js");
    worker = await createWorker("eng", 1, {
      logger: () => {},
      langPath: TESSDATA_PATH,
      cacheMethod: "none",
      gzip: false,
    });

    const results = [];
    for (const file of req.files) {
      try {
        // ── Preprocessing ──────────────────────────────────────────────────
        // Greyscale + normalize + sharpen improves contrast for the LSTM model.
        // Images narrower than 1200 px are upscaled; Tesseract accuracy drops
        // sharply at pixel densities below ~150 DPI equivalent.
        const meta = await sharp(file.buffer).metadata();
        let pipeline = sharp(file.buffer).greyscale().normalize().sharpen();
        if ((meta.width || 0) < 1200)
          pipeline = pipeline.resize({ width: 1500, withoutEnlargement: false, fit: "inside" });
        const pngBuffer = await pipeline.png().toBuffer();

        // ── Recognition ───────────────────────────────────────────────────
        const { data } = await worker.recognize(pngBuffer);
        console.log(`[OCR] "${file.originalname}" words:${data.words?.length} text:`, JSON.stringify(data.text?.slice(0, 200)));
        const words = data.words || [];

        // ── Quality gate + output ─────────────────────────────────────────
        // tesseract.js v7 consistently returns data.words = [] while still
        // populating data.text correctly.  The two branches below handle both
        // environments: one with word-level data (confidence-based) and one
        // without (content-based).  Both branches produce the same "no text"
        // message for noise images.

        let cleanText;

        if (words.length > 0) {
          // Word-level path: use confidence gates + line-confidence filtering.
          const assessment = assessOcr(words);
          if (!assessment.readable) {
            results.push({ name: file.originalname, text: "No readable text detected in the image." });
            continue;
          }
          cleanText = (data.lines || [])
            .filter(line => line.confidence >= 40)
            .map(line => line.text.trim())
            .filter(Boolean)
            .join("\n")
            .trim();
        } else {
          // Text-only path: word-level data unavailable; filter raw text by
          // line content instead of by confidence score.
          cleanText = extractTextFromRaw(data.text);
        }

        results.push({
          name: file.originalname,
          text: cleanText || "No readable text detected in the image.",
        });
      } catch {
        results.push({ name: file.originalname, error: "Could not process this image" });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("jpgToText error:", err.message);
    res.status(500).json({ success: false, error: "OCR processing failed. Please try again." });
  } finally {
    await worker?.terminate();
  }
}
