import express from "express";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { generatePrintSheetPdf } from "../controller/idPhotoController.js";
import { validateImageFiles } from "../../../core/utils/validateMagicBytes.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    cb(null, file.mimetype === "image/png");
  },
});

function uploadMiddleware(req, res, next) {
  upload.single("sheet")(req, res, (err) => {
    if (!err) {
      if (!req.file) return res.status(400).json({ success: false, error: "Only a PNG print sheet is accepted." });
      return next();
    }
    const msg =
      err.code === "LIMIT_FILE_SIZE" ? "The print sheet exceeds the 40 MB limit." : err.message || "Upload error";
    res.status(400).json({ success: false, error: msg });
  });
}

const idPhotoLimiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

router.post(
  "/generate-pdf",
  idPhotoLimiter,
  uploadMiddleware,
  validateImageFiles(new Set(["image/png"])),
  generatePrintSheetPdf,
);

export default router;
