import express from "express";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import {
  convertToJpg,
  heicToJpg,
  imagesToPdf,
  jpgToPdfSized,
  jpegToPng,
  jpgToText,
} from "../controller/imageConverterController.js";
import { validateImageFiles } from "../../../core/utils/validateMagicBytes.js";

const router = express.Router();

const ALLOWED_GENERAL = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/bmp", "image/tiff", "image/gif", "image/avif",
]);

const ALLOWED_HEIC = new Set([
  "image/heic", "image/heif", "image/jpeg", "image/jpg",
  "image/png", "image/webp",
]);

const ALLOWED_JPEG_ONLY = new Set(["image/jpeg", "image/jpg"]);

function makeUpload(allowedSet, maxFiles = 10) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: maxFiles },
    fileFilter(_req, file, cb) {
      // HEIC files often arrive with application/octet-stream — allow by extension
      const isHeicByExt = /\.(heic|heif)$/i.test(file.originalname);
      if (allowedSet.has(file.mimetype) || isHeicByExt) return cb(null, true);
      cb(new Error(`Unsupported format: ${file.mimetype}`), false);
    },
  });
}

function upload(allowedSet, maxFiles = 10) {
  const uploader = makeUpload(allowedSet, maxFiles);
  return (req, res, next) => {
    uploader.array("images", maxFiles)(req, res, (err) => {
      if (!err) return next();
      const msg =
        err.code === "LIMIT_FILE_SIZE"  ? "A file exceeds the 25 MB limit." :
        err.code === "LIMIT_FILE_COUNT" ? `Max ${maxFiles} images per request.` :
        err.message || "Upload error";
      res.status(400).json({ success: false, error: msg });
    });
  };
}

const heicLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

const pdfLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

// Image → JPG  (also handles to-jpeg — identical format)
router.post("/to-jpg",   upload(ALLOWED_GENERAL), validateImageFiles(ALLOWED_GENERAL), convertToJpg);
router.post("/to-jpeg",  upload(ALLOWED_GENERAL), validateImageFiles(ALLOWED_GENERAL), convertToJpg);

// HEIC → JPG
router.post("/heic-to-jpg", heicLimiter, upload(ALLOWED_HEIC), validateImageFiles(ALLOWED_HEIC), heicToJpg);

// Images → PDF (capped at 10 files)
router.post("/images-to-pdf", pdfLimiter, upload(ALLOWED_GENERAL, 10), validateImageFiles(ALLOWED_GENERAL), imagesToPdf);

// JPG → PDF under size cap
router.post("/jpg-to-pdf-100kb", upload(ALLOWED_JPEG_ONLY, 10), validateImageFiles(ALLOWED_JPEG_ONLY), (req, res) => {
  req.body.maxKb = "100";
  return jpgToPdfSized(req, res);
});
router.post("/jpg-to-pdf-500kb", upload(ALLOWED_JPEG_ONLY, 10), validateImageFiles(ALLOWED_JPEG_ONLY), (req, res) => {
  req.body.maxKb = "500";
  return jpgToPdfSized(req, res);
});

// JPEG → PNG
router.post("/jpeg-to-png", upload(ALLOWED_JPEG_ONLY), validateImageFiles(ALLOWED_JPEG_ONLY), jpegToPng);

const ocrLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many OCR requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

const OCR_ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png"]);

// JPG → Text (OCR) — limit to 5 files; OCR is CPU-intensive
router.post("/jpg-to-text", ocrLimiter, upload(OCR_ALLOWED, 5), validateImageFiles(OCR_ALLOWED), jpgToText);

export default router;
