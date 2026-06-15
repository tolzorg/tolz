import express from "express";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { compressImages } from "../controller/imageController.js";
import { validateImageFiles } from "../../../core/utils/validateMagicBytes.js";

const router = express.Router();

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    ALLOWED_MIME.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Unsupported format: ${file.mimetype}`), false);
  },
});

function uploadMiddleware(req, res, next) {
  upload.array("images", 10)(req, res, (err) => {
    if (!err) return next();
    const msg =
      err.code === "LIMIT_FILE_SIZE"  ? "A file exceeds the 15 MB limit." :
      err.code === "LIMIT_FILE_COUNT" ? "Max 10 images per request." :
      err.message || "Upload error";
    res.status(400).json({ success: false, error: msg });
  });
}

const compressLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, error: "Too many requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

router.post("/compress", compressLimiter, uploadMiddleware, validateImageFiles(ALLOWED_MIME), compressImages);

export default router;
