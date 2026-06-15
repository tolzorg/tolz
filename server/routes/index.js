import express from "express";

// 🔥 Tool routes
import imageRoutes from "../tools/imageCompressor/routes/imageRoutes.js";
import imageConverterRoutes from "../tools/imageConverter/routes/imageConverterRoutes.js";
import pdfMergeRoutes    from "../tools/pdfMerge/routes/pdfMergeRoutes.js";
import pdfCompressRoutes from "../tools/pdfCompress/routes/pdfCompressRoutes.js";
import pdfSplitRoutes    from "../tools/pdfSplit/routes/pdfSplitRoutes.js";
import pdfToWordRoutes   from "../tools/pdfToWord/routes/pdfToWordRoutes.js";
import urlShortenerRoutes from "../tools/urlShortener/routes/urlRoutes.js";

const router = express.Router();

// ===============================
// TOOL REGISTRATION
// ===============================

// Image Compressor Tool
router.use("/image", imageRoutes);

// Image Converter Tool
router.use("/image-converter", imageConverterRoutes);

// PDF Tools
router.use("/pdf", pdfMergeRoutes);
router.use("/pdf", pdfCompressRoutes);
router.use("/pdf", pdfSplitRoutes);
router.use("/pdf", pdfToWordRoutes);

// URL Shortener Tool
router.use("/urls", urlShortenerRoutes);

export default router;