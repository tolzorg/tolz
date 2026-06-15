import express from "express";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { getPdfInfo, splitPdf } from "../controller/pdfSplitController.js";
import { validatePdfFiles } from "../../../core/utils/validateMagicBytes.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    ok
      ? cb(null, true)
      : cb(new Error(`"${file.originalname}" is not a PDF file.`), false);
  },
});

function uploadSingle(req, res, next) {
  upload.single("pdf")(req, res, (err) => {
    if (!err) return next();
    const msg =
      err.code === "LIMIT_FILE_SIZE" ? "File exceeds the 25 MB limit." :
      err.message || "Upload error";
    res.status(400).json({ success: false, error: msg });
  });
}

const splitLimiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

router.post("/info",  splitLimiter, uploadSingle, validatePdfFiles, getPdfInfo);
router.post("/split", splitLimiter, uploadSingle, validatePdfFiles, splitPdf);

export default router;
