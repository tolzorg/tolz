// Real background removal (subject segmentation) for the ID Photo Generator.
// Unlike simple transparency flattening (which only affects pixels that are
// already transparent), this detects the subject in ANY photo — JPEG
// included — and lets the background be replaced with a solid color.
//
// Uses @imgly/background-removal, a purpose-built client-side photo-matting
// library (runs fully in the browser via WASM/ONNX — no server round-trip,
// no persistent storage). Its model is trained specifically for cutting
// subjects out of photos, unlike general-purpose video-call segmenters,
// which gives noticeably cleaner hair/edge precision. The model is fetched
// lazily on first use (from the library's CDN) and cached by the browser
// for the rest of the session.

import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

// Use the full-precision "isnet" model rather than the quantized
// "isnet_quint8" variant. Quantization shrinks the download but measurably
// hurts accuracy on anything outside easy/clean backgrounds — on a busy or
// textured real-world background (e.g. a damaged/mottled wall) the quantized
// model misclassified large chunks of it as foreground, leaking the original
// photo through instead of the replacement color. The full model is a larger
// one-time download but is the actual fix for that failure mode.
const REMOVAL_CONFIG = {
  model: "isnet",
  output: { format: "image/png", quality: 1 },
};

// Detects the subject in `sourceCanvas` and composites it onto a solid
// `backgroundColor` fill, replacing whatever background the photo actually
// had (works on JPEGs and opaque PNGs, not just transparent ones).
export async function removeBackgroundToCanvas(sourceCanvas, backgroundColor) {
  const sourceBlob = await new Promise((resolve) => sourceCanvas.toBlob(resolve, "image/png"));
  if (!sourceBlob) throw new Error("Could not prepare the image for background removal.");

  const cutoutBlob = await imglyRemoveBackground(sourceBlob, REMOVAL_CONFIG);
  const cutoutBitmap = await createImageBitmap(cutoutBlob);

  const out = document.createElement("canvas");
  out.width = sourceCanvas.width;
  out.height = sourceCanvas.height;
  const ctx = out.getContext("2d");
  ctx.fillStyle = backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(cutoutBitmap, 0, 0, out.width, out.height);

  if (cutoutBitmap.close) cutoutBitmap.close();
  return out;
}
