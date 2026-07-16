import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // All /api routes go to the Express server.
      // proxyTimeout / timeout are generous (10 minutes) to comfortably
      // cover the slowest tool requests (PDF compression via Ghostscript,
      // OCR) without the dev proxy cutting them off mid-request.
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        proxyTimeout: 600_000,
        timeout: 600_000,
      },
      // Short URL redirects — must hit Express so /s/:slug can 302 redirect
      // Use "/s/" (trailing slash) so Vite does NOT proxy its own /src/... module requests
      "/s/": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom")
          ) return "vendor";
          if (id.includes("node_modules/axios")) return "axios";
        },
      },
    },
  },
});
