import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General API limiter — covers all /api routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { success: false, message: "Too many requests, please try again later" },
  skip: (req) => req.method === "OPTIONS",
});
