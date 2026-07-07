import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Uploads the client-composited, already-flattened print-sheet PNG (exact
// px @ 300 DPI) + physical paper size in mm; the server embeds it 1:1 into
// a pdf-lib PDF page (no re-encode, no rescale) and returns a base64 PDF.
export async function generatePrintSheetPdf(formData) {
  try {
    const res = await axios.post(`${BASE_URL}/id-photo/generate-pdf`, formData, {
      timeout: 60_000,
    });
    if (!res.data.success) throw new Error(res.data.error || "PDF generation failed");
    return res.data.data;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try a smaller paper size or fewer copies.");
    if (err.message) throw err;
    throw new Error("PDF generation failed. Please try again.");
  }
}
