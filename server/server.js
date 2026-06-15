import app from "./app.js";

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

function shutdown(signal) {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("✅ Graceful shutdown complete");
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
