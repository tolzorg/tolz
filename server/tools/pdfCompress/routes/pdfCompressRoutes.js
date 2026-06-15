import express from "express";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { compressPdfs } from "../controller/pdfCompressController.js";
import { validatePdfFiles } from "../../../core/utils/validateMagicBytes.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    ok
      ? cb(null, true)
      : cb(new Error(`"${file.originalname}" is not a PDF file.`), false);
  },
});

function uploadMiddleware(req, res, next) {
  upload.array("pdfs", 5)(req, res, (err) => {
    if (!err) return next();
    const msg =
      err.code === "LIMIT_FILE_SIZE"  ? "A file exceeds the 20 MB limit." :
      err.code === "LIMIT_FILE_COUNT" ? "Maximum 5 PDF files per request." :
      err.message || "Upload error";
    res.status(400).json({ success: false, error: msg });
  });
}

const heavyLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many compress requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

router.post("/compress", heavyLimiter, uploadMiddleware, validatePdfFiles, compressPdfs);

export default router;
