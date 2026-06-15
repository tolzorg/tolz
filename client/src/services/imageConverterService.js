import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function post(endpoint, formData) {
  try {
    const res = await axios.post(`${BASE_URL}/image-converter/${endpoint}`, formData, {
      timeout: 180_000,
    });
    if (!res.data.success) throw new Error(res.data.error || "Processing failed");
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    if (err.code === "ECONNABORTED") throw new Error("Request timed out. Try fewer or smaller images.");
    if (err.message) throw err;
    throw new Error("Processing failed. Please try again.");
  }
}

export function buildFormData(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("images", f));
  return fd;
}

export const convertToJpg     = (files) => post("to-jpg",         buildFormData(files));
export const convertToJpeg    = (files) => post("to-jpeg",        buildFormData(files));
export const convertHeicToJpg = (files) => post("heic-to-jpg",    buildFormData(files));
export const convertImagesToPdf  = (files) => post("images-to-pdf",   buildFormData(files));
export const convertToPdf100kb   = (files) => post("jpg-to-pdf-100kb", buildFormData(files));
export const convertToPdf500kb   = (files) => post("jpg-to-pdf-500kb", buildFormData(files));
export const convertJpegToPng    = (files) => post("jpeg-to-png",      buildFormData(files));
export const convertJpgToText    = (files) => post("jpg-to-text",      buildFormData(files));
