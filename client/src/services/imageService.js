import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function compressImages(formData) {
  try {
    const res = await axios.post(`${BASE_URL}/image/compress`, formData, {
      timeout: 120_000,
    });
    if (!res.data.success) throw new Error(res.data.error || "Compression failed");
    return res.data.results;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try fewer or smaller images.");
    if (err.message) throw err;
    throw new Error("Compression failed. Please try again.");
  }
}
