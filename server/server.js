import app from "./app.js";

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

// Explicitly pin Node's own HTTP timeout defaults (headersTimeout: 60s,
// requestTimeout: 300s) rather than relying on whatever a future Node
// version defaults to. 300s comfortably covers the slowest existing route
// (PDF compress / convert clients time out client-side at 180s), so no
// legitimate request is affected — this only guards against slow-header /
// stalled-connection resource exhaustion.
server.headersTimeout = 65_000;
server.requestTimeout = 300_000;

function shutdown(signal) {
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});
