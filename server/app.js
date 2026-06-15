import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import urlRedirectRoutes from "./tools/urlShortener/routes/urlRedirectRoutes.js";
import { apiLimiter } from "./core/middleware/rateLimiter.js";

const app = express();

// ===============================
// SECURITY HEADERS
// ===============================
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains"
  );
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// ===============================
// REQUEST SIZE PROTECTION
// ===============================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ===============================
// CORS (LOCKED FOR PRODUCTION)
// ===============================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman) only in dev
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

// ===============================
// RATE LIMITING
// ===============================
app.use("/api", apiLimiter);

// ===============================
// ROUTES
// ===============================
app.use("/api", routes);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===============================
// SHORT URL REDIRECTS (/s/:slug)
// ===============================
app.use("/s", urlRedirectRoutes);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;