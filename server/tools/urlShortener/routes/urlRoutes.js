import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { shortenUrl, getUrlInfo } from "../controller/urlController.js";

const router = express.Router();

// Tighter rate limit for the shorten endpoint to prevent abuse
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, message: "Too many URL shortening requests. Please wait a minute." },
  skip: (req) => req.method === "OPTIONS",
});

router.post("/shorten", shortenLimiter, shortenUrl);
router.get("/info/:slug",              getUrlInfo);

export default router;
