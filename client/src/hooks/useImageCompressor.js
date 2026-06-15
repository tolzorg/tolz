import { useState, useCallback, useRef, useEffect } from "react";
import { compressImages } from "../services/imageService";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ── Client-side canvas resize (used for "Download Resized" only) ──
const CLIENT_PRESETS = {
  "instagram-post":  { w: 1080, h: 1080 },
  "instagram-story": { w: 1080, h: 1920 },
  "youtube-thumb":   { w: 1280, h: 720  },
  "facebook-cover":  { w: 851,  h: 315  },
  "twitter-post":    { w: 1200, h: 675  },
};

function resizeImageForDownload(file, { resizeMode, resizePct, resizeWidth, resizeHeight, lockAspect, resizePreset }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objUrl);

      let tw = img.naturalWidth;
      let th = img.naturalHeight;
      const ar = img.naturalWidth / img.naturalHeight;

      if (resizeMode === "percentage") {
        const pct = Math.min(100, Math.max(1, Number(resizePct) || 100));
        tw = Math.max(1, Math.round(img.naturalWidth  * pct / 100));
        th = Math.max(1, Math.round(img.naturalHeight * pct / 100));

      } else if (resizeMode === "dimensions") {
        const w = parseInt(resizeWidth)  || 0;
        const h = parseInt(resizeHeight) || 0;
        if (lockAspect) {
          if (w > 0)      { tw = w; th = Math.max(1, Math.round(w / ar)); }
          else if (h > 0) { th = h; tw = Math.max(1, Math.round(h * ar)); }
        } else {
          if (w > 0) tw = w;
          if (h > 0) th = h;
        }

      } else if (resizeMode === "preset") {
        const p = CLIENT_PRESETS[resizePreset];
        if (p) {
          const scale = Math.min(p.w / img.naturalWidth, p.h / img.naturalHeight);
          tw = Math.max(1, Math.round(img.naturalWidth  * scale));
          th = Math.max(1, Math.round(img.naturalHeight * scale));
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = tw;
      canvas.height = th;
      canvas.getContext("2d").drawImage(img, 0, 0, tw, th);

      const outType = file.type === "image/png"  ? "image/png"  :
                      file.type === "image/webp" ? "image/webp" :
                      "image/jpeg";

      canvas.toBlob(
        (blob) => blob
          ? resolve({ blob, width: tw, height: th })
          : reject(new Error("Canvas export failed")),
        outType,
        0.95,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error("Image load failed")); };
    img.src = objUrl;
  });
}
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 15 * 1024 * 1024;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeImageObj(file) {
  return {
    id: makeId(),
    file,
    name: file.name,
    originalSize: file.size,
    preview: URL.createObjectURL(file),
    status: "pending",
    compressedSize: null,
    savings: null,
    data: null,
    mimeType: null,
    error: null,
    outputWidth: null,
    outputHeight: null,
    wasResized: null,
  };
}

export function useImageCompressor() {
  // ── Compression state ──────────────────────────────────────
  const [images, setImages] = useState([]);
  const [quality, setQualityState] = useState(80);
  const [mode, setMode] = useState("quality"); // "quality" | "size"
  const [targetSizeKb, setTargetSizeKbState] = useState(50);
  const [phase, setPhase] = useState("idle");
  const [globalError, setGlobalError] = useState(null);

  // ── Resize state ───────────────────────────────────────────
  const [isResizeDownloading, setIsResizeDownloading] = useState(false);
  const [resizeEnabled,  setResizeEnabledRaw]  = useState(false);
  const [resizeMode,     setResizeModeRaw]     = useState("percentage"); // "percentage" | "dimensions" | "preset"
  const [resizePct,      setResizePctRaw]      = useState(50);
  const [resizeWidth,    setResizeWidthRaw]    = useState("");
  const [resizeHeight,   setResizeHeightRaw]   = useState("");
  const [lockAspect,     setLockAspectRaw]     = useState(true);
  const [resizePreset,   setResizePresetRaw]   = useState("instagram-post");

  // Revoke all object URLs on unmount
  const imagesRef = useRef([]);
  // eslint-disable-next-line react-hooks/refs
  imagesRef.current = images;
  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview));
  }, []);

  // ── Shared reset ───────────────────────────────────────────
  const resetImageResults = useCallback(() => {
    setImages((prev) => {
      if (!prev.some((i) => i.status === "done" || i.status === "error")) return prev;
      return prev.map((img) => ({
        ...img,
        status: "pending",
        compressedSize: null,
        savings: null,
        data: null,
        mimeType: null,
        error: null,
        outputWidth: null,
        outputHeight: null,
        wasResized: null,
      }));
    });
    setPhase((prev) => (prev === "done" || prev === "error" ? "ready" : prev));
    setGlobalError(null);
  }, []);

  // ── File management ────────────────────────────────────────
  const addImages = useCallback((files) => {
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" — unsupported format (use JPEG, PNG, or WebP)`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" — exceeds 15 MB limit`);
      } else {
        validFiles.push(file);
      }
    }

    setImages((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0 || validFiles.length === 0) return prev;
      return [...prev, ...validFiles.slice(0, remaining).map(makeImageObj)];
    });

    setPhase((prev) =>
      prev === "idle" || prev === "done" || prev === "error" ? "ready" : prev
    );
    setGlobalError(null);
    return errors;
  }, []);

  const removeImage = useCallback((id) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) setPhase("idle");
      return next;
    });
    setGlobalError(null);
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
    setPhase("idle");
    setGlobalError(null);
  }, []);

  // ── Compression setters (reset results on change) ──────────
  const setQuality = useCallback((q) => {
    setQualityState(q);
    resetImageResults();
  }, [resetImageResults]);

  const setTargetSizeKb = useCallback((kb) => {
    setTargetSizeKbState(kb);
    resetImageResults();
  }, [resetImageResults]);

  const handleSetMode = useCallback((m) => {
    setMode(m);
    resetImageResults();
  }, [resetImageResults]);

  // ── Resize setters (reset results on change) ───────────────
  const setResizeEnabled = useCallback((v) => {
    setResizeEnabledRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setResizeMode = useCallback((v) => {
    setResizeModeRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setResizePct = useCallback((v) => {
    setResizePctRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setResizeWidth = useCallback((v) => {
    setResizeWidthRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setResizeHeight = useCallback((v) => {
    setResizeHeightRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setLockAspect = useCallback((v) => {
    setLockAspectRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  const setResizePreset = useCallback((v) => {
    setResizePresetRaw(v);
    resetImageResults();
  }, [resetImageResults]);

  // ── Compress ───────────────────────────────────────────────
  const compress = useCallback(async () => {
    if (images.length === 0 || phase === "compressing") return;

    setPhase("compressing");
    setGlobalError(null);
    setImages((prev) => prev.map((img) => ({ ...img, status: "compressing", error: null })));

    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("images", img.file));

      // Compression params
      if (mode === "size") {
        formData.append("targetSizeKb", targetSizeKb);
      } else {
        formData.append("quality", quality);
      }

      // Resize params (only sent when resize is enabled)
      if (resizeEnabled) {
        formData.append("resizeEnabled", "true");
        formData.append("resizeMode", resizeMode);
        if (resizeMode === "percentage") {
          formData.append("resizePct", resizePct);
        } else if (resizeMode === "dimensions") {
          if (resizeWidth)  formData.append("resizeWidth",  String(resizeWidth));
          if (resizeHeight) formData.append("resizeHeight", String(resizeHeight));
          formData.append("lockAspect", lockAspect ? "true" : "false");
        } else if (resizeMode === "preset") {
          formData.append("resizePreset", resizePreset);
        }
      }

      const results = await compressImages(formData);

      setImages((prev) =>
        prev.map((img, i) => {
          const r = results[i];
          if (!r || r.error) {
            return { ...img, status: "error", error: r?.error || "Processing failed" };
          }
          return {
            ...img,
            status: "done",
            compressedSize: r.compressedSize,
            savings: r.savings,
            data: r.data,
            mimeType: r.mimeType,
            error: null,
            outputWidth:  r.outputWidth  ?? null,
            outputHeight: r.outputHeight ?? null,
            wasResized:   r.wasResized   ?? false,
          };
        })
      );

      setPhase("done");
    } catch (err) {
      setGlobalError(err.message || "Compression failed. Please try again.");
      setImages((prev) =>
        prev.map((img) => ({ ...img, status: "error", error: "Processing failed" }))
      );
      setPhase("error");
    }
  }, [images, quality, mode, targetSizeKb, phase, resizeEnabled, resizeMode, resizePct, resizeWidth, resizeHeight, lockAspect, resizePreset]);

  // ── Download ───────────────────────────────────────────────
  const downloadSingle = useCallback((image) => {
    if (!image.data) return;
    const ext = image.mimeType?.split("/")[1] || "jpg";
    const base = image.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = image.data;
    a.download = `${base}_compressed.${ext}`;
    a.click();
  }, []);

  const downloadAll = useCallback(async () => {
    const done = images.filter((i) => i.status === "done" && i.data);
    if (done.length === 0) return;
    if (done.length === 1) { downloadSingle(done[0]); return; }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    done.forEach((img) => {
      const base64 = img.data.split(",")[1];
      const ext = img.mimeType?.split("/")[1] || "jpg";
      const base = img.name.replace(/\.[^.]+$/, "");
      zip.file(`${base}_compressed.${ext}`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [images, downloadSingle]);

  // Download images resized client-side (no server, no compression)
  const downloadResized = useCallback(async () => {
    if (images.length === 0 || isResizeDownloading) return;
    setIsResizeDownloading(true);

    const opts = { resizeMode, resizePct, resizeWidth, resizeHeight, lockAspect, resizePreset };

    try {
      const items = await Promise.all(images.map((img) => resizeImageForDownload(img.file, opts)));

      if (items.length === 1) {
        const { blob } = items[0];
        const ext  = blob.type.split("/")[1] || "jpg";
        const base = images[0].name.replace(/\.[^.]+$/, "");
        const url  = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${base}_resized.${ext}`; a.click();
        URL.revokeObjectURL(url);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        items.forEach(({ blob }, i) => {
          const ext  = blob.type.split("/")[1] || "jpg";
          const base = images[i].name.replace(/\.[^.]+$/, "");
          zip.file(`${base}_resized.${ext}`, blob);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url; a.download = "resized_images.zip"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* silent — individual image errors don't need to surface */ }
    finally { setIsResizeDownloading(false); }
  }, [images, isResizeDownloading, resizeMode, resizePct, resizeWidth, resizeHeight, lockAspect, resizePreset]);

  const doneCount = images.filter((i) => i.status === "done").length;

  return {
    // Compression
    images,
    quality,
    mode,
    targetSizeKb,
    phase,
    globalError,
    doneCount,
    hasResults: doneCount > 0,
    isCompressing: phase === "compressing",
    canCompress: images.length > 0 && phase !== "compressing",
    addImages,
    removeImage,
    clearAll,
    setQuality,
    setTargetSizeKb,
    setMode: handleSetMode,
    compress,
    downloadSingle,
    downloadAll,
    MAX_FILES,
    // Resize download
    isResizeDownloading,
    downloadResized,
    // Resize
    resizeEnabled,
    resizeMode,
    resizePct,
    resizeWidth,
    resizeHeight,
    lockAspect,
    resizePreset,
    setResizeEnabled,
    setResizeMode,
    setResizePct,
    setResizeWidth,
    setResizeHeight,
    setLockAspect,
    setResizePreset,
  };
}
