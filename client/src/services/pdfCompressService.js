import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function compressPdfs(files, level) {
  const fd = new FormData();
  files.forEach((f) => fd.append("pdfs", f));
  fd.append("level", level);

  try {
    const res = await axios.post(`${BASE_URL}/pdf/compress`, fd, {
      // Large PDFs on the small production server can take a few minutes; this matches
      // the server's own 300 s request limit (server.js).
      timeout: 300_000,
    });
    if (!res.data.success) throw new Error(res.data.error || "Compression failed");
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error)   throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try fewer or smaller files.");
    if (err.message) throw err;
    throw new Error("PDF compression failed. Please try again.");
  }
}
