import sharp from "sharp";

// ── Resize presets ────────────────────────────────────────────
const RESIZE_PRESETS = {
  "instagram-post":  { width: 1080, height: 1080 },
  "instagram-story": { width: 1080, height: 1920 },
  "youtube-thumb":   { width: 1280, height: 720  },
  "facebook-cover":  { width: 851,  height: 315  },
  "twitter-post":    { width: 1200, height: 675  },
};

// ── Apply optional resize before compression ──────────────────
// Returns { buffer, wasResized } — buffer is unchanged if resize is not needed.
async function applyResize(buffer, body) {
  if (body.resizeEnabled !== "true") return { buffer, wasResized: false };

  const mode = body.resizeMode || "percentage";
  let resizeOpts = null;

  if (mode === "percentage") {
    const pct = Math.min(100, Math.max(1, parseFloat(body.resizePct) || 100));
    if (pct >= 100) return { buffer, wasResized: false };
    const { width } = await sharp(buffer).metadata();
    const newWidth = Math.max(1, Math.round(width * pct / 100));
    resizeOpts = { width: newWidth };

  } else if (mode === "dimensions") {
    const w = parseInt(body.resizeWidth)  || 0;
    const h = parseInt(body.resizeHeight) || 0;
    if (!w && !h) return { buffer, wasResized: false };
    const lock = body.lockAspect !== "false";
    resizeOpts = {};
    if (w > 0) resizeOpts.width  = w;
    if (h > 0) resizeOpts.height = h;
    // fit only meaningful when both dimensions are given
    if (w > 0 && h > 0) resizeOpts.fit = lock ? "inside" : "fill";

  } else if (mode === "preset") {
    const preset = RESIZE_PRESETS[body.resizePreset];
    if (!preset) return { buffer, wasResized: false };
    resizeOpts = { width: preset.width, height: preset.height, fit: "inside" };
  }

  if (!resizeOpts) return { buffer, wasResized: false };

  try {
    const resized = await sharp(buffer).resize(resizeOpts).toBuffer();
    return { buffer: resized, wasResized: true };
  } catch {
    return { buffer, wasResized: false };
  }
}

// ── Compression helpers ───────────────────────────────────────

async function compressAtQuality(buffer, mimetype, quality) {
  if (mimetype === "image/png") {
    const opts = { compressionLevel: 9, adaptiveFiltering: true };
    if (quality < 80) { opts.palette = true; opts.quality = quality; }
    return { data: await sharp(buffer).png(opts).toBuffer(), mime: "image/png" };
  }
  if (mimetype === "image/webp") {
    return { data: await sharp(buffer).webp({ quality }).toBuffer(), mime: "image/webp" };
  }
  return { data: await sharp(buffer).jpeg({ quality }).toBuffer(), mime: "image/jpeg" };
}

async function compressToTargetSize(buffer, mimetype, targetBytes) {
  const meta = await sharp(buffer).metadata();
  const origWidth = meta.width;
  // PNG → JPEG for target-size mode: lossy compression can reach any target
  const outMime = mimetype === "image/webp" ? "image/webp" : "image/jpeg";

  const encode = (buf, q) =>
    outMime === "image/webp"
      ? sharp(buf).webp({ quality: q }).toBuffer()
      : sharp(buf).jpeg({ quality: q }).toBuffer();

  // Phase 1: binary search quality 1–85 at original dimensions
  let lo = 1, hi = 85, best = null, bestDiff = Infinity;
  for (let iter = 0; iter < 12 && lo <= hi; iter++) {
    const mid = Math.round((lo + hi) / 2);
    const data = await encode(buffer, mid);
    const diff = Math.abs(data.length - targetBytes);
    if (diff < bestDiff) { bestDiff = diff; best = { data, mime: outMime }; }
    if (data.length > targetBytes) hi = mid - 1;
    else lo = mid + 1;
  }

  // Phase 2: if quality=1 at original size still exceeds target, shrink dimensions
  const atMinQuality = await encode(buffer, 1);
  if (atMinQuality.length > targetBytes) {
    const diff0 = Math.abs(atMinQuality.length - targetBytes);
    if (diff0 < bestDiff) { bestDiff = diff0; best = { data: atMinQuality, mime: outMime }; }

    let scaleLo = 0.02, scaleHi = 0.98;
    for (let iter = 0; iter < 14 && scaleHi - scaleLo > 0.005; iter++) {
      const scale = (scaleLo + scaleHi) / 2;
      const newWidth = Math.max(4, Math.round(origWidth * scale));
      const resized = await sharp(buffer).resize({ width: newWidth }).toBuffer();
      const data = await encode(resized, 1);
      const diff = Math.abs(data.length - targetBytes);
      if (diff < bestDiff) { bestDiff = diff; best = { data, mime: outMime }; }
      if (data.length > targetBytes) scaleHi = scale;
      else scaleLo = scale;
    }
  }

  return best;
}

// ── Route handler ─────────────────────────────────────────────

export async function compressImages(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, error: "No images uploaded" });
  }

  const targetSizeKb = parseFloat(req.body.targetSizeKb);
  const useTargetSize = !isNaN(targetSizeKb) && targetSizeKb > 0;
  const targetBytes = useTargetSize ? Math.round(targetSizeKb * 1024) : null;
  const quality = Math.min(100, Math.max(10, parseInt(req.body.quality) || 80));

  try {
    const results = await Promise.all(
      req.files.map(async (file) => {
        const { originalname, buffer, mimetype, size } = file;
        try {
          // Step 1: resize (no-op if resizeEnabled !== "true")
          const { buffer: workBuf, wasResized } = await applyResize(buffer, req.body);

          // Step 2: compress the (possibly resized) buffer
          let compressed, outputMime;
          if (useTargetSize) {
            const result = await compressToTargetSize(workBuf, mimetype, targetBytes);
            compressed = result.data;
            outputMime = result.mime;
          } else {
            const result = await compressAtQuality(workBuf, mimetype, quality);
            compressed = result.data;
            outputMime = result.mime;
          }

          const compressedSize = compressed.length;
          const savings = Math.max(0, ((size - compressedSize) / size) * 100).toFixed(1);

          // Get final output dimensions
          const outMeta = await sharp(compressed).metadata();

          return {
            name: originalname,
            originalSize: size,
            compressedSize,
            savings,
            mimeType: outputMime,
            data: `data:${outputMime};base64,${compressed.toString("base64")}`,
            outputWidth:  outMeta.width,
            outputHeight: outMeta.height,
            wasResized,
          };
        } catch (err) {
          console.error(`❌ Failed to compress "${originalname}":`, err.message);
          return { name: originalname, error: "Could not process this image" };
        }
      })
    );

    res.json({ success: true, results });
  } catch (err) {
    console.error("❌ Image compress error:", err.message);
    res.status(500).json({ success: false, error: "Compression failed" });
  }
}
