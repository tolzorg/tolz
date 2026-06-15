import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function getPdfInfo(file) {
  const fd = new FormData();
  fd.append("pdf", file);
  try {
    const res = await axios.post(`${BASE_URL}/pdf/info`, fd, { timeout: 30_000 });
    if (!res.data.success) throw new Error(res.data.error || "Failed to read PDF info.");
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out.");
    if (err.message) throw err;
    throw new Error("Could not read PDF info.");
  }
}

export async function splitPdf(file, params) {
  const fd = new FormData();
  fd.append("pdf", file);
  fd.append("mode", params.mode);
  if (params.mode === "ranges") fd.append("ranges", params.ranges);
  if (params.mode === "every_n") fd.append("n", String(params.n));

  try {
    const res = await axios.post(`${BASE_URL}/pdf/split`, fd, { timeout: 180_000 });
    if (!res.data.success) throw new Error(res.data.error || "Split failed.");
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try a smaller file.");
    if (err.message) throw err;
    throw new Error("PDF split failed. Please try again.");
  }
}
