import app from "./app.js";

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

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
