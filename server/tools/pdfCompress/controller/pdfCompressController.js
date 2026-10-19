import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFArray, PDFDict, PDFRef, PDFStream, PDFBool } from "pdf-lib";
// Pixel-capped sharp (image-bomb guard), used exactly like sharp.
import sharp from "../../../core/utils/safeSharp.js";
import { deflate as _deflate, createInflate, createInflateRaw } from "zlib";
import { promisify } from "util";
import { optimizeContentStream } from "./contentStreamOptimizer.js";

const deflate = promisify(_deflate);

// ─────────────────────────────────────────────────────────────────────────────
// PDF compressor — content-preserving.
//
// Everything here is either LOSSLESS or VISUALLY SAFE. It never removes
// fonts, ToUnicode maps (copy/search), form-field appearances, layers,
// annotations or bookmarks, which is what made text turn into gibberish and
// content go missing in the earlier version.
//
//   Lossless (every level): drop unreachable leftover objects, re-deflate
//   every Flate stream at level 9, Flate-compress uncompressed streams, and
//   pack objects into object streams.
//
//   Visually safe (Medium / High / target size): re-encode JPEG images and
//   photo-like lossless images at good quality, and downscale only images
//   larger than the level's maximum dimension. Gray, RGB and CMYK JPEGs keep
//   their colour space. Images whose colour data could be misread are left
//   untouched: Indexed / Lab / Separation / DeviceN colour, JPEG 2000, images
//   with a /Decode array, stencil masks, and images used as another image's
//   transparency mask (SMask / Mask).
//
// A result is never larger than the original: if nothing helps, the original
// bytes are returned unchanged.
// ─────────────────────────────────────────────────────────────────────────────

// 50 MB guard: abort decompression if a single stream would exceed this.
// Prevents zlib decompression bombs from exhausting server memory.
const MAX_INFLATED_STREAM_BYTES = 50 * 1024 * 1024;

function inflateWithLimit(data, useRaw = false) {
  return new Promise((resolve, reject) => {
    const inflator = useRaw ? createInflateRaw() : createInflate();
    const chunks = [];
    let total = 0;
    let settled = false;
    const bail = (err) => { if (!settled) { settled = true; reject(err); } };
    inflator.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_INFLATED_STREAM_BYTES) {
        inflator.destroy();
        bail(new Error("inflate_limit"));
      } else {
        chunks.push(chunk);
      }
    });
    inflator.on("end", () => { if (!settled) { settled = true; resolve(Buffer.concat(chunks)); } });
    inflator.on("error", bail);
    inflator.write(Buffer.from(data));
    inflator.end();
  });
}

async function inflateFlate(data) {
  try { return await inflateWithLimit(data, false); }
  catch (err) {
    if (err.message === "inflate_limit") throw err;
    return inflateWithLimit(data, true);
  }
}

// Image settings per level. quality = JPEG quality; maxDim = longest side in
// pixels an image is downscaled to (only if larger); flateToJpeg = also turn
// photo-like lossless images into JPEG. null image settings = lossless only.
const LEVELS = {
  // exactNumbers: drawing-instruction numbers keep their exact value (Low) or
  // are rounded to 6 significant digits (invisible) — see contentStreamOptimizer.js.
  low:    { images: null,                                              stripNonVisual: false, exactNumbers: true  },
  medium: { images: { quality: 80, maxDim: 2400, flateToJpeg: true  }, stripNonVisual: true,  exactNumbers: false },
  high:   { images: { quality: 65, maxDim: 1800, flateToJpeg: true  }, stripNonVisual: true,  exactNumbers: false },
};

// Target-size mode tries these in order of decreasing quality (binary search)
// and keeps the best quality that fits. The last step is the quality floor:
// images stay clearly recognisable even when the target can't be reached.
const TARGET_LADDER = [
  { quality: 85, maxDim: 3000, flateToJpeg: true },
  { quality: 80, maxDim: 2400, flateToJpeg: true },
  { quality: 72, maxDim: 2000, flateToJpeg: true },
  { quality: 65, maxDim: 1800, flateToJpeg: true },
  { quality: 58, maxDim: 1600, flateToJpeg: true },
  { quality: 50, maxDim: 1400, flateToJpeg: true },
  { quality: 42, maxDim: 1200, flateToJpeg: true },
  { quality: 35, maxDim: 1000, flateToJpeg: true },
];

const MAX_SIZE_MODE_FILES = 3;

// A re-encoded image replaces the original only if it is at least 10% smaller.
const MIN_IMAGE_GAIN = 0.9;
// A lossless image becomes JPEG only if the JPEG is under half its size — true
// for photos, false for screenshots, charts and line art (which JPEG blurs).
const PHOTO_GAIN = 0.5;

// ── Small helpers ────────────────────────────────────────────────────────────
const NAME = (n) => PDFName.of(n);

function filterIs(dict, name) {
  const f = dict.get(NAME("Filter"));
  if (!f) return false;
  const target = `/${name}`;
  if (f instanceof PDFName) return f.toString() === target;
  if (f instanceof PDFArray) {
    const arr = f.asArray();
    return arr.length === 1 && arr[0] instanceof PDFName && arr[0].toString() === target;
  }
  return false;
}

function getNumVal(obj) {
  return obj instanceof PDFNumber ? obj.numberValue : undefined;
}

const refKey = (ref) => (ref instanceof PDFRef ? ref.toString() : null);

/** Channels for colour spaces JPEG can carry safely: 1 (gray), 3 (RGB), 4 (CMYK), else -1. */
function safeChannels(context, csObj) {
  const cs = csObj instanceof PDFRef ? context.lookup(csObj) : csObj;
  if (!cs) return -1; // no colour space (e.g. JPEG 2000 / masks) — leave it alone
  if (cs instanceof PDFName) {
    const s = cs.toString();
    if (s === "/DeviceGray" || s === "/CalGray") return 1;
    if (s === "/DeviceRGB" || s === "/CalRGB") return 3;
    if (s === "/DeviceCMYK") return 4;
    return -1;
  }
  if (cs instanceof PDFArray) {
    const arr = cs.asArray();
    const family = arr[0]?.toString();
    if (family === "/CalGray") return 1;
    if (family === "/CalRGB") return 3;
    if (family === "/ICCBased") {
      const profile = arr[1] instanceof PDFRef ? context.lookup(arr[1]) : arr[1];
      const n = profile instanceof PDFStream ? getNumVal(profile.dict.get(NAME("N"))) : undefined;
      return n === 1 || n === 3 || n === 4 ? n : -1;
    }
  }
  return -1; // Indexed, Lab, Separation, DeviceN, Pattern …
}

// ── PNG predictor undo (rows prefixed with a filter-type byte) ───────────────
function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function undoPngPredictor(data, width, channels, height) {
  const stride = width * channels;
  if (data.length < height * (stride + 1)) return null; // truncated — don't guess
  const out = Buffer.allocUnsafe(height * stride);
  let prev = Buffer.alloc(stride, 0);
  let inOff = 0;
  for (let r = 0; r < height; r++) {
    const pType = data[inOff++];
    const curr = Buffer.allocUnsafe(stride);
    for (let i = 0; i < stride; i++) {
      const x = data[inOff++];
      const a = i >= channels ? curr[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      switch (pType) {
        case 0: curr[i] = x; break;
        case 1: curr[i] = (x + a) & 0xFF; break;
        case 2: curr[i] = (x + b) & 0xFF; break;
        case 3: curr[i] = (x + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4: curr[i] = (x + paethPredictor(a, b, c)) & 0xFF; break;
        default: return null; // unknown filter type — leave the image untouched
      }
    }
    curr.copy(out, r * stride);
    prev = curr;
  }
  return out;
}

// ── Lossless: drop objects nothing refers to ─────────────────────────────────
// Leftovers from earlier edits (incremental saves) and replaced resources are
// still stored in many PDFs. Only objects reachable from the document's
// trailer (catalog, info dict) can ever be displayed, so the rest are removed.
function removeUnreachableObjects(pdfDoc) {
  const context = pdfDoc.context;
  const seen = new Set();
  const { Root, Info, Encrypt, ID } = context.trailerInfo;
  const stack = [Root, Info, Encrypt, ID];
  while (stack.length) {
    const obj = stack.pop();
    if (!obj) continue;
    if (obj instanceof PDFRef) {
      const key = obj.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push(context.lookup(obj));
    } else if (obj instanceof PDFDict) {
      for (const [, value] of obj.entries()) stack.push(value);
    } else if (obj instanceof PDFArray) {
      for (const value of obj.asArray()) stack.push(value);
    } else if (obj instanceof PDFStream) {
      stack.push(obj.dict);
    }
  }
  if (!seen.size) return; // couldn't walk the document — don't delete anything
  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!seen.has(ref.toString())) context.delete(ref);
  }
}

// ── Visually safe: drop data no viewer displays ──────────────────────────────
// Page thumbnails (viewers render their own) and PieceInfo (private editing
// data from Illustrator/InDesign). Neither affects how the PDF looks or works.
function stripNonVisualData(pdfDoc) {
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    obj.delete(NAME("Thumb"));
    obj.delete(NAME("PieceInfo"));
  }
  pdfDoc.catalog.delete(NAME("PieceInfo"));
}

// ── Drawing instructions: merge page streams, shorten numbers ────────────────
/** Decoded bytes of a stream we can safely rewrite (Flate without predictor, or unfiltered). */
async function decodeContent(stream) {
  const dict = stream.dict;
  if (dict.get(NAME("DecodeParms"))) return null;
  if (filterIs(dict, "FlateDecode")) return inflateFlate(stream.contents);
  if (!dict.get(NAME("Filter"))) return Buffer.from(stream.contents);
  return null; // other filters (LZW, ASCII85 …): leave as they are
}

function setUncompressed(stream, bytes) {
  // Stored plain here; optimizeStreams() Flate-compresses it at level 9 afterwards.
  stream.contents = new Uint8Array(bytes);
  stream.dict.delete(NAME("Filter"));
  stream.dict.delete(NAME("DecodeParms"));
  stream.dict.set(NAME("Length"), PDFNumber.of(bytes.length));
}

async function optimizeContentStreams(pdfDoc, exact) {
  const context = pdfDoc.context;
  const contentRefs = new Set();

  // 1. A page split into several content streams becomes one stream (it
  //    compresses better as a whole). Streams are joined with a newline, which
  //    is exactly how viewers read them.
  for (const page of pdfDoc.getPages()) {
    const node = page.node;
    let contents = node.get(NAME("Contents"));
    const list = contents instanceof PDFRef ? context.lookup(contents) : contents;
    if (list instanceof PDFArray && list.size() > 1) {
      const decoded = [];
      for (const ref of list.asArray()) {
        const stream = ref instanceof PDFRef ? context.lookup(ref) : null;
        const bytes = stream instanceof PDFRawStream ? await decodeContent(stream).catch(() => null) : null;
        if (!bytes) { decoded.length = 0; break; }
        decoded.push(bytes);
      }
      if (decoded.length) {
        const NEWLINE = Buffer.from([0x0a]);
        const merged = Buffer.concat(decoded.flatMap((b, i) => (i ? [NEWLINE, b] : [b])));
        const ref = context.register(context.stream(new Uint8Array(merged)));
        node.set(NAME("Contents"), ref);
        contents = ref;
      }
    }
    const final = node.get(NAME("Contents"));
    const finalList = final instanceof PDFRef ? context.lookup(final) : final;
    if (finalList instanceof PDFArray) for (const r of finalList.asArray()) { const k = refKey(r); if (k) contentRefs.add(k); }
    else { const k = refKey(final); if (k) contentRefs.add(k); }
  }

  // 2. Other drawing-instruction streams: form XObjects (incl. annotation
  //    appearances), tiling patterns and Type 3 glyph procedures.
  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const subtype = obj.dict.get(NAME("Subtype"))?.toString();
      const patternType = getNumVal(obj.dict.get(NAME("PatternType")));
      if (subtype === "/Form" || patternType === 1) contentRefs.add(ref.toString());
    } else if (obj instanceof PDFDict && obj.get(NAME("Subtype"))?.toString() === "/Type3") {
      let procs = obj.get(NAME("CharProcs"));
      if (procs instanceof PDFRef) procs = context.lookup(procs);
      if (procs instanceof PDFDict) for (const [, v] of procs.entries()) { const k = refKey(v); if (k) contentRefs.add(k); }
    }
  }

  // 3. Shorten the numbers in each of them.
  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (!contentRefs.has(ref.toString()) || !(obj instanceof PDFRawStream)) continue;
    try {
      const bytes = await decodeContent(obj);
      if (!bytes) continue;
      const optimized = optimizeContentStream(bytes, { exact });
      if (optimized) setUncompressed(obj, optimized);
      else if (obj.dict.get(NAME("Filter")) == null) continue;
    } catch { /* unreadable — leave this stream exactly as it was */ }
  }
}

// ── Lossless: re-deflate Flate streams at level 9 and compress raw streams ───
async function optimizeStreams(pdfDoc) {
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (obj.contents.length < 128) continue;
    try {
      if (filterIs(dict, "FlateDecode")) {
        // Same decoded bytes, tighter zlib packing — any DecodeParms still apply.
        const raw = await inflateFlate(obj.contents);
        const recomp = await deflate(raw, { level: 9 });
        if (recomp.length >= obj.contents.length) continue;
        obj.contents = new Uint8Array(recomp);
        dict.set(NAME("Length"), PDFNumber.of(recomp.length));
      } else if (!dict.get(NAME("Filter")) && !dict.get(NAME("DecodeParms"))) {
        // Uncompressed stream (content, font, ICC profile …) → Flate.
        // XMP metadata is left as plain text, as the PDF spec recommends.
        if (dict.get(NAME("Type"))?.toString() === "/Metadata") continue;
        const recomp = await deflate(Buffer.from(obj.contents), { level: 9 });
        if (recomp.length >= obj.contents.length * 0.95) continue;
        obj.contents = new Uint8Array(recomp);
        dict.set(NAME("Filter"), NAME("FlateDecode"));
        dict.set(NAME("Length"), PDFNumber.of(recomp.length));
      }
    } catch { /* unreadable or too large — leave the stream exactly as it was */ }
  }
}

// ── Visually safe image re-encoding ──────────────────────────────────────────
/** Refs of images used as another image's soft mask or stencil mask. */
function collectMaskRefs(context) {
  const masks = new Set();
  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (obj.dict.get(NAME("Subtype"))?.toString() !== "/Image") continue;
    for (const key of ["SMask", "Mask"]) {
      const k = refKey(obj.dict.get(NAME(key)));
      if (k) masks.add(k);
    }
  }
  return masks;
}

async function encodeJpeg(pipe, channels, quality, maxDim) {
  if (maxDim) pipe = pipe.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
  // Keep the colour space the PDF dictionary declares (gray stays gray, RGB stays RGB, CMYK stays CMYK).
  pipe = pipe.toColourspace(channels === 1 ? "b-w" : channels === 4 ? "cmyk" : "srgb");
  const out = await pipe.jpeg({ quality, mozjpeg: true, chromaSubsampling: quality >= 80 ? "4:4:4" : "4:2:0" }).toBuffer();
  const meta = await sharp(out).metadata();
  if (meta.channels !== channels) return null;
  return { out, width: meta.width, height: meta.height };
}

function replaceWithJpeg(obj, { out, width, height }) {
  const dict = obj.dict;
  obj.contents = new Uint8Array(out);
  dict.set(NAME("Filter"), NAME("DCTDecode"));
  dict.delete(NAME("DecodeParms"));
  dict.set(NAME("Length"), PDFNumber.of(out.length));
  dict.set(NAME("Width"), PDFNumber.of(width));
  dict.set(NAME("Height"), PDFNumber.of(height));
}

async function recompressImages(pdfDoc, { quality, maxDim, flateToJpeg }) {
  const context = pdfDoc.context;
  const masks = collectMaskRefs(context);

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (dict.get(NAME("Subtype"))?.toString() !== "/Image") continue;

    // Leave anything whose pixels could be misinterpreted after re-encoding.
    if (masks.has(ref.toString())) continue;                 // transparency of another image
    const imageMask = dict.get(NAME("ImageMask"));
    if (imageMask instanceof PDFBool && imageMask.asBoolean()) continue;
    if (dict.get(NAME("Decode"))) continue;                  // inverted / remapped samples
    if ((getNumVal(dict.get(NAME("BitsPerComponent"))) ?? 8) !== 8) continue;
    const channels = safeChannels(context, dict.get(NAME("ColorSpace")));
    if (channels < 1) continue;                              // Indexed, Lab, DeviceN, …
    const width = getNumVal(dict.get(NAME("Width")));
    const height = getNumVal(dict.get(NAME("Height")));
    if (!width || !height || width * height < 64 * 64) continue;

    try {
      // ── JPEG: re-encode at the level's quality (and size) ──────────────────
      if (filterIs(dict, "DCTDecode")) {
        const src = Buffer.from(obj.contents);
        const meta = await sharp(src).metadata();
        if (meta.width !== width || meta.height !== height) continue;
        if (meta.channels !== channels || (channels === 4) !== (meta.space === "cmyk")) continue;
        const result = await encodeJpeg(sharp(src), channels, quality, maxDim);
        if (result && result.out.length < obj.contents.length * MIN_IMAGE_GAIN) replaceWithJpeg(obj, result);
        continue;
      }

      // ── Lossless (Flate) photo → JPEG ──────────────────────────────────────
      if (!flateToJpeg || !filterIs(dict, "FlateDecode")) continue;
      if (dict.get(NAME("SMask")) || dict.get(NAME("Mask"))) continue; // has transparency
      if (channels === 4) continue; // raw CMYK samples: keep lossless
      let dp = dict.get(NAME("DecodeParms"));
      if (dp instanceof PDFArray) dp = dp.asArray()[0];
      if (dp instanceof PDFRef) dp = context.lookup(dp);
      const predictor = dp instanceof PDFDict ? (getNumVal(dp.get(NAME("Predictor"))) ?? 1) : 1;
      if (predictor !== 1) {
        if (predictor < 10) continue; // TIFF predictor — not handled, leave as is
        const colors = getNumVal(dp.get(NAME("Colors"))) ?? 1;
        const bpc = getNumVal(dp.get(NAME("BitsPerComponent"))) ?? 8;
        const columns = getNumVal(dp.get(NAME("Columns"))) ?? 1;
        if (colors !== channels || bpc !== 8 || columns !== width) continue;
      }
      const raw = await inflateFlate(obj.contents);
      const pixels = predictor >= 10 ? undoPngPredictor(raw, width, channels, height) : raw;
      const expected = width * height * channels;
      if (!pixels || pixels.length < expected) continue;
      const result = await encodeJpeg(sharp(pixels.subarray(0, expected), { raw: { width, height, channels } }), channels, quality, maxDim);
      if (result && result.out.length < obj.contents.length * PHOTO_GAIN) replaceWithJpeg(obj, result);
    } catch { /* undecodable — leave the image exactly as it was */ }
  }
}

// ── One complete compression pass ────────────────────────────────────────────
// images: null for lossless only, or { quality, maxDim, flateToJpeg }.
async function compressDocument(originalBuffer, { images, stripNonVisual, exactNumbers = false }) {
  const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true, updateMetadata: false });
  // Encrypted PDFs: their objects can't be re-packed without the password —
  // return them unchanged rather than risk a broken file.
  if (pdfDoc.context.trailerInfo.Encrypt) return Buffer.from(originalBuffer);

  await optimizeContentStreams(pdfDoc, exactNumbers);
  removeUnreachableObjects(pdfDoc); // also drops the page streams merged above
  if (stripNonVisual) stripNonVisualData(pdfDoc);
  if (images) await recompressImages(pdfDoc, images);
  await optimizeStreams(pdfDoc);
  const out = Buffer.from(await pdfDoc.save({ useObjectStreams: true }));
  return out.length < originalBuffer.length ? out : Buffer.from(originalBuffer);
}

// ── Target-size compression ──────────────────────────────────────────────────
// Returns the highest-quality result that fits the target; if even the
// quality floor doesn't fit, returns the smallest content-preserving result.
async function compressToTargetSize(originalBuffer, targetBytes) {
  const lossless = await compressDocument(originalBuffer, { images: null, stripNonVisual: true, exactNumbers: false });
  if (lossless.length <= targetBytes) return lossless;

  let smallest = lossless;
  let bestFit = null;
  const cache = new Map();
  const attempt = async (i) => {
    if (!cache.has(i)) cache.set(i, await compressDocument(originalBuffer, { images: TARGET_LADDER[i], stripNonVisual: true, exactNumbers: false }));
    const out = cache.get(i);
    if (out.length < smallest.length) smallest = out;
    return out;
  };

  // Sizes shrink as the ladder index grows: binary-search the first (highest
  // quality) step that fits the target.
  let lo = 0, hi = TARGET_LADDER.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const out = await attempt(mid);
    if (out.length <= targetBytes) { bestFit = out; hi = mid - 1; }
    else lo = mid + 1;
  }
  return bestFit ?? smallest;
}

// ── Main request handler ─────────────────────────────────────────────────────
export async function compressPdfs(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, error: "Please upload at least one PDF file." });
  }

  const targetSizeKb = req.body.targetSizeKb ? parseFloat(req.body.targetSizeKb) : null;

  // ── Target size mode ──────────────────────────────────────────────────────
  if (targetSizeKb !== null) {
    if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
      return res.status(400).json({ success: false, error: "Invalid target size." });
    }
    if (req.files.length > MAX_SIZE_MODE_FILES) {
      return res.status(400).json({
        success: false,
        error: `Target size mode supports up to ${MAX_SIZE_MODE_FILES} PDFs at once.`,
      });
    }

    const targetBytes = Math.round(targetSizeKb * 1024);
    const results = [];

    for (const file of req.files) {
      try { await PDFDocument.load(file.buffer, { ignoreEncryption: true }); }
      catch {
        results.push({ name: file.originalname, error: `"${file.originalname}" is not a valid or readable PDF.` });
        continue;
      }
      try {
        const pdfBytes = await compressToTargetSize(file.buffer, targetBytes);
        const originalSize = file.buffer.length;
        const compressedSize = pdfBytes.length;
        const savings = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
        const achievedTarget = compressedSize <= targetBytes;

        results.push({
          name: file.originalname,
          originalSize,
          compressedSize,
          savings,
          targetSizeKb,
          achievedTarget,
          // Helps the UI communicate the minimum achievable size when target was impossible
          minimumAchievableKb: achievedTarget ? null : Math.ceil(compressedSize / 1024),
          data: `data:application/pdf;base64,${pdfBytes.toString("base64")}`,
        });
      } catch (err) {
        console.error("[pdfCompress] compressToTarget error:", file.originalname, err.message);
        results.push({ name: file.originalname, error: `Failed to compress "${file.originalname}".` });
      }
    }

    return res.json({ success: true, results });
  }

  // ── Compression level mode ────────────────────────────────────────────────
  const level = (req.body.level || "medium").toLowerCase();
  if (!LEVELS[level]) {
    return res.status(400).json({ success: false, error: "Invalid compression level. Use low, medium, or high." });
  }

  const results = [];
  for (const file of req.files) {
    try { await PDFDocument.load(file.buffer, { ignoreEncryption: true }); }
    catch {
      results.push({ name: file.originalname, error: `"${file.originalname}" is not a valid or readable PDF.` });
      continue;
    }
    try {
      const pdfBytes = await compressDocument(file.buffer, LEVELS[level]);
      const originalSize = file.buffer.length;
      const compressedSize = pdfBytes.length;
      const savings = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

      results.push({
        name: file.originalname,
        originalSize, compressedSize, savings,
        data: `data:application/pdf;base64,${pdfBytes.toString("base64")}`,
      });
    } catch (err) {
      console.error("[pdfCompress] error:", file.originalname, err.message);
      results.push({ name: file.originalname, error: `Failed to compress "${file.originalname}". Ensure it is a valid, unencrypted PDF.` });
    }
  }

  res.json({ success: true, results });
}
