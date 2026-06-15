import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function convertToWord(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("pdfs", f));

  try {
    const res = await axios.post(`${BASE_URL}/pdf/to-word`, fd, {
      timeout: 180_000,
    });
    if (!res.data.success) throw new Error(res.data.error || "Conversion failed");
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error)   throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try fewer or smaller files.");
    if (err.message) throw err;
    throw new Error("PDF to Word conversion failed. Please try again.");
  }
}
