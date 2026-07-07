import { useState, useCallback, useRef, useEffect } from "react";
import { mmToPx } from "../utils/mmPxConversion";
import { removeBackgroundToCanvas } from "../utils/backgroundRemoval";

export const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const DEFAULT_TRANSFORM = { zoom: 1, panX: 0, panY: 0, rotationDeg: 0, flipH: false, flipV: false };

// Decode a File into an orientation-corrected canvas, alpha preserved as-is
// (not yet flattened/background-processed — that happens separately so it
// can be redone cheaply when the user changes the background color or
// toggles background removal, without re-decoding the original file).
// EXIF orientation is fixed at decode time via createImageBitmap's
// `imageOrientation: 'from-image'` (native, zero-dependency) with a
// fallback to a plain <img> for browsers that don't support it.
async function decodeOrientedCanvas(file) {
  let bitmap;
  let width, height;

  if (typeof createImageBitmap === "function") {
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      width = bitmap.width;
      height = bitmap.height;
    } catch {
      bitmap = null;
    }
  }

  if (!bitmap) {
    // Fallback path for browsers without createImageBitmap support.
    const objUrl = URL.createObjectURL(file);
    try {
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("This file could not be decoded as an image."));
        img.src = objUrl;
      });
      width = bitmap.naturalWidth;
      height = bitmap.naturalHeight;
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  }

  if (!width || !height) throw new Error("This file could not be decoded as an image.");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

  if (bitmap.close) bitmap.close();
  return canvas;
}

// Flattens transparency (if any) onto a solid background — a plain fill
// only shows through pixels that are actually transparent, so this has no
// visible effect on already-opaque photos (JPEGs, flattened PNGs).
function flattenOntoColor(canvas, backgroundColor) {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  ctx.fillStyle = backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  return out;
}

// Composite the current non-destructive transform onto an output canvas of
// exact pixel size. Never mutates `sourceCanvas` — this is the one function
// used for both the live preview and the final export raster, so preview
// always matches output exactly.
export function renderCrop(sourceCanvas, targetWidthPx, targetHeightPx, transform) {
  const { zoom, panX, panY, rotationDeg, flipH, flipV } = transform;
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(targetWidthPx));
  out.height = Math.max(1, Math.round(targetHeightPx));
  const ctx = out.getContext("2d");

  // "Cover" fit at zoom=1 so the source always fills the crop box by default
  // — this doubles as "reset to template framing" (same as default transform).
  const baseScale = Math.max(out.width / sourceCanvas.width, out.height / sourceCanvas.height);
  const scale = baseScale * Math.max(0.05, zoom);

  ctx.save();
  ctx.translate(out.width / 2 + panX * out.width, out.height / 2 + panY * out.height);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(scale * (flipH ? -1 : 1), scale * (flipV ? -1 : 1));
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
  ctx.restore();

  return out;
}

// How many *source* pixels actually land in the output crop, at the current
// transform — used for the low-resolution / max-printable-size warning.
function effectiveSourcePx(sourceCanvas, targetWidthPx, targetHeightPx, transform) {
  const baseScale = Math.max(targetWidthPx / sourceCanvas.width, targetHeightPx / sourceCanvas.height);
  const scale = baseScale * Math.max(0.05, transform.zoom);
  return {
    width: targetWidthPx / scale,
    height: targetHeightPx / scale,
  };
}

export function useIdPhotoEditor() {
  const [file, setFile] = useState(null);
  const [sourceCanvas, setSourceCanvas] = useState(null); // the background-processed, EXIF-corrected working canvas
  const [previewUrl, setPreviewUrl] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [removeBackground, setRemoveBackgroundState] = useState(false);
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);

  // The true immutable "original" — decoded + EXIF-corrected, alpha intact,
  // never flattened. `reprocess` re-derives `sourceCanvas` from this whenever
  // the background color or removal toggle changes, without re-decoding the
  // file. Kept in refs (not state) so async callbacks always read the latest
  // value instead of one captured in a stale closure.
  const orientedCanvasRef = useRef(null);
  const backgroundColorRef = useRef("#ffffff");
  const removeBackgroundRef = useRef(false);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const validateFile = useCallback((f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `"${f.name}" — unsupported format (use JPEG, PNG, or WebP).`;
    }
    if (f.size > MAX_FILE_SIZE) {
      return `"${f.name}" — exceeds the 20 MB limit.`;
    }
    if (f.size === 0) {
      return `"${f.name}" — the file is empty or corrupted.`;
    }
    return null;
  }, []);

  // Re-derives `sourceCanvas` from the immutable oriented canvas, given
  // explicit (never closed-over/stale) color + removeBg values.
  const reprocess = useCallback(async (color, removeBg) => {
    const oriented = orientedCanvasRef.current;
    if (!oriented) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      let canvas;
      if (removeBg) {
        setIsSegmenting(true);
        try {
          canvas = await removeBackgroundToCanvas(oriented, color);
        } catch (segErr) {
          console.error("Background removal failed, falling back to a plain flatten:", segErr.message);
          canvas = flattenOntoColor(oriented, color);
          setLoadError("Background removal isn't available right now — showing a flattened background instead.");
        } finally {
          setIsSegmenting(false);
        }
      } else {
        canvas = flattenOntoColor(oriented, color);
      }

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const blobUrl = await new Promise((resolve) => canvas.toBlob((b) => resolve(URL.createObjectURL(b)), "image/png"));
      setSourceCanvas(canvas);
      setPreviewUrl(blobUrl);
    } catch (e) {
      setLoadError(e.message || "This file could not be processed. It may be corrupted.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFile = useCallback(async (f) => {
    const err = validateFile(f);
    if (err) {
      setLoadError(err);
      return false;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const oriented = await decodeOrientedCanvas(f);
      orientedCanvasRef.current = oriented;
      setFile(f);
      setTransform(DEFAULT_TRANSFORM);
      await reprocess(backgroundColorRef.current, removeBackgroundRef.current);
      return true;
    } catch (e) {
      setLoadError(e.message || "This file could not be processed. It may be corrupted.");
      setIsLoading(false);
      return false;
    }
  }, [validateFile, reprocess]);

  // Re-flatten/re-segment against a newly chosen background color, preserving
  // the current crop/zoom/pan/rotate transform.
  const applyBackgroundColor = useCallback((color) => {
    backgroundColorRef.current = color;
    setBackgroundColor(color);
    return reprocess(color, removeBackgroundRef.current);
  }, [reprocess]);

  // Toggle real background removal (ML subject segmentation) on/off — works
  // on any photo format, unlike plain transparency flattening.
  const toggleRemoveBackground = useCallback((enabled) => {
    removeBackgroundRef.current = enabled;
    setRemoveBackgroundState(enabled);
    return reprocess(backgroundColorRef.current, enabled);
  }, [reprocess]);

  const clearImage = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    orientedCanvasRef.current = null;
    setFile(null);
    setSourceCanvas(null);
    setPreviewUrl(null);
    setTransform(DEFAULT_TRANSFORM);
    setLoadError(null);
  }, []);

  const resetToOriginal = useCallback(() => setTransform(DEFAULT_TRANSFORM), []);
  const resetToTemplateFraming = useCallback(() => setTransform(DEFAULT_TRANSFORM), []);

  const setZoom = useCallback((z) => setTransform((t) => ({ ...t, zoom: Math.max(0.1, Math.min(8, z)) })), []);
  const setPan = useCallback((panX, panY) => setTransform((t) => ({ ...t, panX, panY })), []);
  const setRotationDeg = useCallback((deg) => {
    const norm = ((Number(deg) % 360) + 360) % 360;
    setTransform((t) => ({ ...t, rotationDeg: norm }));
  }, []);
  const rotateBy = useCallback((deltaDeg) => setTransform((t) => ({ ...t, rotationDeg: ((t.rotationDeg + deltaDeg) % 360 + 360) % 360 })), []);
  const toggleFlipH = useCallback(() => setTransform((t) => ({ ...t, flipH: !t.flipH })), []);
  const toggleFlipV = useCallback(() => setTransform((t) => ({ ...t, flipV: !t.flipV })), []);

  // Render the current crop at a given template's exact pixel size.
  const renderAtTemplate = useCallback((template) => {
    if (!sourceCanvas || !template) return null;
    const wPx = mmToPx(template.widthMM, template.dpi || 300);
    const hPx = mmToPx(template.heightMM, template.dpi || 300);
    return renderCrop(sourceCanvas, wPx, hPx, transform);
  }, [sourceCanvas, transform]);

  // Resolution/quality check against a template's requirements.
  const getQualityInfo = useCallback((template) => {
    if (!sourceCanvas || !template) return null;
    const wPx = mmToPx(template.widthMM, template.dpi || 300);
    const hPx = mmToPx(template.heightMM, template.dpi || 300);
    const eff = effectiveSourcePx(sourceCanvas, wPx, hPx, transform);

    const meetsRecommended = eff.width >= (template.recommendedResolutionPX?.width || wPx)
      && eff.height >= (template.recommendedResolutionPX?.height || hPx);
    const meetsMinimum = eff.width >= (template.minResolutionPX?.width || wPx * 0.8)
      && eff.height >= (template.minResolutionPX?.height || hPx * 0.8);

    const maxPrintWidthMM = (eff.width / (template.dpi || 300)) * 25.4;
    const maxPrintHeightMM = (eff.height / (template.dpi || 300)) * 25.4;

    return {
      meetsRecommended,
      meetsMinimum,
      effectivePx: { width: Math.round(eff.width), height: Math.round(eff.height) },
      maxPrintMM: { width: maxPrintWidthMM, height: maxPrintHeightMM },
      warning: !meetsMinimum
        ? "Image may look blurry when printed — resolution is below the minimum recommended for this template."
        : !meetsRecommended
        ? "Image resolution is below the recommended level for the sharpest print result."
        : null,
    };
  }, [sourceCanvas, transform]);

  return {
    file, sourceCanvas, previewUrl, backgroundColor, removeBackground, transform,
    loadError, isLoading, isSegmenting,
    loadFile, clearImage, applyBackgroundColor, toggleRemoveBackground,
    resetToOriginal, resetToTemplateFraming,
    setZoom, setPan, setRotationDeg, rotateBy, toggleFlipH, toggleFlipV,
    renderAtTemplate, getQualityInfo,
  };
}
