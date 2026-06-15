import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFArray, PDFDict } from "pdf-lib";
import sharp from "sharp";
import { inflate as _inflate, inflateRaw as _inflateRaw, deflate as _deflate, createInflate, createInflateRaw } from "zlib";
import { promisify } from "util";
import { execFile as _execFile } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, readFile, unlink, readdir, rm } from "fs/promises";
import { randomUUID } from "crypto";

const inflate    = promisify(_inflate);
const inflateRaw = promisify(_inflateRaw);
const deflate    = promisify(_deflate);

// 50 MB guard: abort decompression if a single content stream would exceed this.
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

const isDev = process.env.NODE_ENV !== "production";

const LEVELS = {
  low:    { quality: 72, maxDim: null, useObjectStreams: false, stripFonts: false, allowPngToJpeg: false },
  medium: { quality: 50, maxDim: 1800, useObjectStreams: true,  stripFonts: false, allowPngToJpeg: false },
  high:   { quality: 28, maxDim: 1200, useObjectStreams: true,  stripFonts: true,  allowPngToJpeg: true  },
};

const MAX_SIZE_MODE_FILES = 3;

// ── Filter helpers ─────────────────────────────────────────────────────────────
function filterIs(dict, name) {
  const f = dict.get(PDFName.of("Filter"));
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

function getChannels(dict) {
  const cs  = dict.get(PDFName.of("ColorSpace"));
  if (!cs)  return 3;
  const str = cs.toString();
  if (str === "/DeviceGray" || str === "/CalGray") return 1;
  if (str === "/DeviceRGB"  || str === "/CalRGB")  return 3;
  return -1; // CMYK, indexed, ICC — skip
}

// ── PNG predictor undo ─────────────────────────────────────────────────────────
function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function undoPngPredictor(data, width, channels, height) {
  const stride = width * channels;
  const out    = Buffer.allocUnsafe(height * stride);
  let prev     = Buffer.alloc(stride, 0);
  let inOff    = 0;
  for (let r = 0; r < height; r++) {
    if (inOff + stride + 1 > data.length) break;
    const pType = data[inOff++];
    const curr  = Buffer.allocUnsafe(stride);
    for (let i = 0; i < stride; i++) {
      const x = data[inOff++];
      const a = i >= channels ? curr[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      switch (pType) {
        case 0:  curr[i] = x; break;
        case 1:  curr[i] = (x + a) & 0xFF; break;
        case 2:  curr[i] = (x + b) & 0xFF; break;
        case 3:  curr[i] = (x + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4:  curr[i] = (x + paethPredictor(a, b, c)) & 0xFF; break;
        default: curr[i] = x;
      }
    }
    curr.copy(out, r * stride);
    prev = curr;
  }
  return out;
}

// ── Ghostscript ────────────────────────────────────────────────────────────────
let _gsPath = undefined;

// Ghostscript is not installed on Render free tier — skip the candidate scan
// (which has a 4s timeout per candidate) and go straight to the pdf-lib fallback.
if (process.platform !== "win32" && process.env.NODE_ENV === "production") {
  _gsPath = null;
}

function execFileP(cmd, args, opts) {
  return new Promise((resolve, reject) =>
    _execFile(cmd, args, opts, (err, stdout, stderr) =>
      err ? reject(err) : resolve({ stdout, stderr })
    )
  );
}

async function getGsPath() {
  if (_gsPath !== undefined) return _gsPath;

  const candidates = [];
  if (process.platform === "win32") {
    candidates.push("gswin64c", "gswin32c", "gs");
    const gsDirs = [
      join("C:", "Program Files", "gs"),
      join("C:", "Program Files (x86)", "gs"),
    ];
    const { readdir } = await import("fs/promises");
    for (const gsDir of gsDirs) {
      try {
        const versions = await readdir(gsDir);
        for (const ver of versions.sort().reverse()) {
          candidates.push(
            join(gsDir, ver, "bin", "gswin64c.exe"),
            join(gsDir, ver, "bin", "gswin32c.exe"),
          );
        }
      } catch { /* directory doesn't exist */ }
    }
  } else {
    candidates.push("gs");
  }

  for (const cmd of candidates) {
    try {
      await execFileP(cmd, ["--version"], { timeout: 4000 });
      console.log("[pdfCompress] Ghostscript found:", cmd);
      return (_gsPath = cmd);
    } catch { /* try next */ }
  }
  console.log("[pdfCompress] Ghostscript not found — using pdf-lib fallback");
  return (_gsPath = null);
}

// qFactor → JPEG quality mapping (distillerparams convention)
// 0.15 ≈ q85, 0.40 ≈ q70, 0.76 ≈ q55, 1.30 ≈ q35, 2.40 ≈ q15, 5.00 ≈ q5
// noFonts=true adds -dNoOutputFonts which strips all font programs from the output —
// text remains positioned but is rendered via viewer system fonts (not selectable as
// original font, but visually acceptable in most modern PDF viewers).
async function gsCompress(pdfBuffer, dpi, qFactor = 0.76, noFonts = false) {
  const gs = await getGsPath();
  if (!gs) throw new Error("ghostscript unavailable");
  const id      = randomUUID();
  const inFile  = join(tmpdir(), `pdf_in_${id}.pdf`);
  const outFile = join(tmpdir(), `pdf_out_${id}.pdf`);
  await writeFile(inFile, pdfBuffer);
  try {
    const args = [
      "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
      "-dNOPAUSE", "-dQUIET", "-dBATCH",
      "-dSubsetFonts=true", "-dCompressFonts=true", "-dEmbedAllFonts=false",
      "-dDetectDuplicateImages=true",
      "-dDownsampleColorImages=true",  `-dColorImageResolution=${dpi}`,
      "-dColorImageDownsampleType=/Bicubic",
      "-dEncodeColorImages=true", "-dColorImageFilter=/DCTEncode",
      "-dAutoFilterColorImages=false",
      "-dDownsampleGrayImages=true",   `-dGrayImageResolution=${dpi}`,
      "-dGrayImageDownsampleType=/Bicubic",
      "-dEncodeGrayImages=true",  "-dGrayImageFilter=/DCTEncode",
      "-dAutoFilterGrayImages=false",
      "-dDownsampleMonoImages=true",   `-dMonoImageResolution=${Math.max(dpi, 36)}`,
      "-dCompressPages=true",
    ];
    if (noFonts) args.push("-dNoOutputFonts");
    args.push(
      `-sOutputFile=${outFile}`,
      "-c",
      `<< /ColorACSImageDict << /QFactor ${qFactor} /Blend 1 /ColorTransform 1 /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> /GrayACSImageDict << /QFactor ${qFactor} /Blend 1 /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> >> setdistillerparams`,
      "-f", inFile,
    );
    await execFileP(gs, args, { timeout: 90_000 });
    return await readFile(outFile);
  } finally {
    try { await unlink(inFile); }  catch { /* ignore */ }
    try { await unlink(outFile); } catch { /* ignore */ }
  }
}

// ── Ghostscript: rasterize PDF pages to PNG buffers ───────────────────────────
// Returns an array of raw PNG buffers (one per page). PNG is lossless so it
// serves as a clean reference for the downstream quality binary-search.
async function gsRasterizePages(pdfBuffer, dpi) {
  const gs = await getGsPath();
  if (!gs) throw new Error("ghostscript unavailable");

  const id      = randomUUID();
  const inFile  = join(tmpdir(), `pdf_in_${id}.pdf`);
  const pattern = join(tmpdir(), `pgs_${id}_%04d.png`);
  const prefix  = `pgs_${id}_`;
  const pageFiles = [];

  await writeFile(inFile, pdfBuffer);
  try {
    await execFileP(gs, [
      `-sDEVICE=png16m`, `-r${dpi}`,
      `-dNOPAUSE`, `-dBATCH`, `-dQUIET`,
      `-sOutputFile=${pattern}`,
      inFile,
    ], { timeout: 120_000 });

    const allTmp = await readdir(tmpdir());
    pageFiles.push(
      ...allTmp
        .filter(f => f.startsWith(prefix) && f.endsWith(".png"))
        .sort()
        .map(f => join(tmpdir(), f))
    );
    if (!pageFiles.length) throw new Error("gsRasterizePages: no pages produced");

    return await Promise.all(pageFiles.map(f => readFile(f)));
  } finally {
    try { await unlink(inFile); } catch {}
    for (const f of pageFiles) try { await unlink(f); } catch {}
  }
}

// ── Build an image-based PDF from PNG page buffers at a given JPEG quality ─────
// Encodes each PNG page as JPEG (via sharp/MozJPEG), then embeds all images
// into a new PDF with pdf-lib. Text is non-selectable but file is tiny.
async function buildImagePdf(pageBuffers, jpegQuality) {
  const doc = await PDFDocument.create();
  for (const buf of pageBuffers) {
    const jpeg = await sharp(buf)
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toBuffer();
    const img  = await doc.embedJpg(jpeg);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return Buffer.from(await doc.save({ useObjectStreams: true }));
}

// ── Comprehensive data stripper ────────────────────────────────────────────────
// Removes all data not needed for visual rendering:
//   • Font programs (TrueType/CFF/Type1)
//   • ToUnicode CMaps
//   • Widget AP streams
//   • XMP metadata streams
//   • Page thumbnails
//   • JavaScript actions (/OpenAction, /AA, /Names->JavaScript)
//   • Embedded file attachments (/EmbeddedFiles)
//   • Accessibility structure trees (/StructTreeRoot, /MarkInfo)
//   • Private application data (/PieceInfo)
//   • Document outlines/bookmarks (/Outlines)
async function stripUnneededData(pdfDoc) {
  const context = pdfDoc.context;

  const byRef = new Map();
  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    byRef.set(ref.toString(), obj);
  }

  const zeroStream = (s) => {
    s.contents = new Uint8Array(0);
    s.dict.set(PDFName.of("Length"), PDFNumber.of(0));
    try { s.dict.delete(PDFName.of("Filter")); }      catch {}
    try { s.dict.delete(PDFName.of("DecodeParms")); } catch {}
  };

  const resolveRef = (val) => {
    if (!val) return undefined;
    if (val instanceof PDFRawStream || val instanceof PDFDict) return val;
    return byRef.get(val.toString?.());
  };

  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) {
      if (obj instanceof PDFRawStream) {
        if (obj.dict.get(PDFName.of("Type"))?.toString() === "/Metadata") zeroStream(obj);
      }
      continue;
    }

    const type    = obj.get(PDFName.of("Type"))?.toString();
    const subtype = obj.get(PDFName.of("Subtype"))?.toString();

    // ── Font program streams ──────────────────────────────────────────────────
    const isFontDesc = type === "/FontDescriptor" ||
      (!type && (
        obj.get(PDFName.of("FontFile"))  != null ||
        obj.get(PDFName.of("FontFile2")) != null ||
        obj.get(PDFName.of("FontFile3")) != null
      ));
    if (isFontDesc) {
      for (const keyName of ["FontFile", "FontFile2", "FontFile3"]) {
        const key = PDFName.of(keyName);
        const val = obj.get(key);
        if (!val) continue;
        const stream = resolveRef(val);
        if (stream instanceof PDFRawStream) zeroStream(stream);
        try { obj.delete(key); } catch {}
      }
    }

    // ── ToUnicode CMaps ───────────────────────────────────────────────────────
    if (type === "/Font" || subtype === "/TrueType" || subtype === "/Type1" ||
        subtype === "/Type0" || subtype === "/CIDFontType0" || subtype === "/CIDFontType2") {
      const touKey = PDFName.of("ToUnicode");
      const touVal = obj.get(touKey);
      if (touVal) {
        const stream = resolveRef(touVal);
        if (stream instanceof PDFRawStream) zeroStream(stream);
        try { obj.delete(touKey); } catch {}
      }
    }

    // ── Widget AP streams ─────────────────────────────────────────────────────
    if (subtype === "/Widget") {
      const apKey = PDFName.of("AP");
      const apVal = obj.get(apKey);
      if (apVal) {
        const apDict = resolveRef(apVal);
        if (apDict instanceof PDFDict) {
          for (const apEntry of ["N", "R", "D"]) {
            const entryVal = apDict.get(PDFName.of(apEntry));
            if (!entryVal) continue;
            const resolved = resolveRef(entryVal);
            if (resolved instanceof PDFRawStream) {
              zeroStream(resolved);
            } else if (resolved instanceof PDFDict) {
              try {
                for (const [, sv] of resolved.entries()) {
                  const s = resolveRef(sv);
                  if (s instanceof PDFRawStream) zeroStream(s);
                }
              } catch {}
            }
          }
        }
        try { obj.delete(apKey); } catch {}
      }
    }

    // ── Page thumbnails ───────────────────────────────────────────────────────
    try { obj.delete(PDFName.of("Thumb")); } catch {}

    // ── JavaScript actions on any dict (/AA, /OpenAction on pages/catalog) ───
    for (const actionKey of ["AA", "OpenAction"]) {
      try { obj.delete(PDFName.of(actionKey)); } catch {}
    }

    // ── Embedded files on XObject dicts (/AF) ────────────────────────────────
    try { obj.delete(PDFName.of("AF")); } catch {}

    // ── PieceInfo (private app data stored by Illustrator, InDesign, etc.) ───
    try { obj.delete(PDFName.of("PieceInfo")); } catch {}

    // ── SpiderInfo / Web Capture remnants ────────────────────────────────────
    try { obj.delete(PDFName.of("SpiderInfo")); } catch {}

    // ── Page-level metadata ───────────────────────────────────────────────────
    try { obj.delete(PDFName.of("Metadata")); } catch {}
  }

  // ── Catalog-level removals ────────────────────────────────────────────────
  const catalog = pdfDoc.catalog;
  const catalogRemovals = [
    "Metadata",        // XMP metadata stream pointer
    "OpenAction",      // JS/action on open
    "AA",              // additional actions
    "Outlines",        // bookmarks (can be significant on large docs)
    "StructTreeRoot",  // accessibility tree
    "MarkInfo",        // marking info (PDF/UA tag)
    "PieceInfo",       // private data
    "SpiderInfo",      // Web Capture
    "OutputIntents",   // ICC/color profiles for print
    "OCProperties",    // optional content (layers) properties — safe to remove if no layers visible
    "AcroForm",        // CAUTION: only zero out DA/DR defaults, not field values
  ];

  // Zero the AcroForm's default appearance and default resources (DR/DA) only
  // — preserve field values (/V) so form data isn't destroyed
  try {
    const acroFormRef = catalog.get(PDFName.of("AcroForm"));
    if (acroFormRef) {
      const acroForm = resolveRef(acroFormRef);
      if (acroForm instanceof PDFDict) {
        try { acroForm.delete(PDFName.of("DR")); } catch {}
        try { acroForm.delete(PDFName.of("DA")); } catch {}
        try { acroForm.delete(PDFName.of("XFA")); } catch {} // XFA = large XML form data
      }
    }
  } catch {}

  for (const key of catalogRemovals.filter(k => k !== "AcroForm")) {
    try { catalog.delete(PDFName.of(key)); } catch {}
  }

  // ── Names dict — remove JavaScript and EmbeddedFiles trees ──────────────
  try {
    const namesRef = catalog.get(PDFName.of("Names"));
    if (namesRef) {
      const namesDict = resolveRef(namesRef);
      if (namesDict instanceof PDFDict) {
        try { namesDict.delete(PDFName.of("JavaScript")); }     catch {}
        try { namesDict.delete(PDFName.of("EmbeddedFiles")); }  catch {}
        try { namesDict.delete(PDFName.of("AlternatePresentations")); } catch {}
        try { namesDict.delete(PDFName.of("Renditions")); }     catch {}
      }
    }
  } catch {}

  // ── Document info dict — zero optional fields only ───────────────────────
  try {
    const infoRef = pdfDoc.context.trailerInfo?.get?.(PDFName.of("Info"));
    if (infoRef) {
      const info = resolveRef(infoRef);
      if (info instanceof PDFDict) {
        for (const k of ["Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate"]) {
          try { info.delete(PDFName.of(k)); } catch {}
        }
      }
    }
  } catch {}
}

// ── FlateDecode content-stream re-compressor ──────────────────────────────────
async function recompressContentStreams(pdfDoc) {
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (dict.get(PDFName.of("Subtype"))?.toString() === "/Image") continue;
    if (!filterIs(dict, "FlateDecode")) continue;
    if (obj.contents.length < 128) continue;
    try {
      let raw;
      try       { raw = await inflateWithLimit(obj.contents, false); }
      catch     { raw = await inflateWithLimit(obj.contents, true); }
      const recomp = await deflate(raw, { level: 9 });
      if (recomp.length >= obj.contents.length) continue;
      obj.contents = new Uint8Array(recomp);
      dict.set(PDFName.of("Length"), PDFNumber.of(recomp.length));
    } catch { /* skip */ }
  }
}

const stripFontPrograms = stripUnneededData;

// ── Compressible image analysis ────────────────────────────────────────────────
// Returns the total bytes occupied by compressible image streams so we can
// decide whether image compression can meaningfully reduce the output size.
function countCompressibleImageBytes(pdfDoc) {
  let totalBytes = 0;
  let count = 0;
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict    = obj.dict;
    const subtype = dict.get(PDFName.of("Subtype"));
    if (!subtype || subtype.toString() !== "/Image") continue;
    const bpc = getNumVal(dict.get(PDFName.of("BitsPerComponent"))) ?? 8;
    if (bpc !== 8) continue;
    if (filterIs(dict, "DCTDecode") || filterIs(dict, "JPXDecode") || filterIs(dict, "FlateDecode")) {
      totalBytes += obj.contents.length;
      count++;
    }
  }
  return { totalBytes, count };
}

// ── Image re-compressor ────────────────────────────────────────────────────────
async function recompressImages(pdfDoc, quality, maxDim, allowPngToJpeg = false) {
  const context = pdfDoc.context;

  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;

    const dict    = obj.dict;
    const subtype = dict.get(PDFName.of("Subtype"));
    if (!subtype || subtype.toString() !== "/Image") continue;

    const bpc = getNumVal(dict.get(PDFName.of("BitsPerComponent"))) ?? 8;
    if (bpc !== 8) continue;

    // ── JPEG (DCTDecode) ──────────────────────────────────────────────────────
    if (filterIs(dict, "DCTDecode")) {
      try {
        const src = Buffer.from(obj.contents);
        let pipe = sharp(src);
        if (maxDim) pipe = pipe.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
        const out = await pipe.jpeg({ quality, mozjpeg: true }).toBuffer();
        if (out.length >= obj.contents.length) continue;
        const meta = await sharp(out).metadata();
        obj.contents = new Uint8Array(out);
        dict.set(PDFName.of("Length"), PDFNumber.of(out.length));
        dict.set(PDFName.of("Width"),  PDFNumber.of(meta.width));
        dict.set(PDFName.of("Height"), PDFNumber.of(meta.height));
      } catch { /* skip */ }
      continue;
    }

    // ── JPEG 2000 (JPXDecode) ─────────────────────────────────────────────────
    if (filterIs(dict, "JPXDecode")) {
      try {
        const src = Buffer.from(obj.contents);
        let pipe = sharp(src);
        if (maxDim) pipe = pipe.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
        const out = await pipe.jpeg({ quality, mozjpeg: true }).toBuffer();
        if (out.length >= obj.contents.length) continue;
        const meta = await sharp(out).metadata();
        obj.contents = new Uint8Array(out);
        dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
        dict.set(PDFName.of("Length"), PDFNumber.of(out.length));
        dict.set(PDFName.of("Width"),  PDFNumber.of(meta.width));
        dict.set(PDFName.of("Height"), PDFNumber.of(meta.height));
        try { dict.delete(PDFName.of("DecodeParms")); } catch {}
      } catch { /* skip */ }
      continue;
    }

    // ── FlateDecode (PNG-like lossless images) → convert to JPEG ─────────────
    if (!allowPngToJpeg || !filterIs(dict, "FlateDecode")) continue;
    if (dict.get(PDFName.of("SMask")) || dict.get(PDFName.of("Mask"))) continue;

    const channels = getChannels(dict);
    if (channels < 1) continue;

    const width  = getNumVal(dict.get(PDFName.of("Width")));
    const height = getNumVal(dict.get(PDFName.of("Height")));
    if (!width || !height) continue;

    try {
      let raw;
      try { raw = await inflateWithLimit(obj.contents, false); }
      catch { raw = await inflateWithLimit(obj.contents, true); }

      let dp = dict.get(PDFName.of("DecodeParms"));
      if (dp instanceof PDFArray) dp = dp.asArray()[0];
      const predictor = dp instanceof PDFDict
        ? (getNumVal(dp.get(PDFName.of("Predictor"))) ?? 1) : 1;

      const pixels   = predictor >= 10 ? undoPngPredictor(raw, width, channels, height) : raw;
      const expected = width * height * channels;
      if (pixels.length < expected) continue;

      let pipe = sharp(pixels.subarray(0, expected), { raw: { width, height, channels } });
      if (maxDim) pipe = pipe.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
      const out = await pipe.jpeg({ quality, mozjpeg: true }).toBuffer();
      if (out.length >= obj.contents.length) continue;

      const meta = await sharp(out).metadata();
      obj.contents = new Uint8Array(out);
      dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      dict.set(PDFName.of("Length"), PDFNumber.of(out.length));
      dict.set(PDFName.of("Width"),  PDFNumber.of(meta.width));
      dict.set(PDFName.of("Height"), PDFNumber.of(meta.height));
      try { dict.delete(PDFName.of("DecodeParms")); } catch {}
    } catch { /* skip */ }
  }
}

// ── Single-pass pdf-lib compress ───────────────────────────────────────────────
// intensity 0   → quality 72, no resize  (minimal change)
// intensity 100 → quality 2,  maxDim 36  (maximum squeeze)
async function pdfLibCompress(originalBuffer, intensity, stripFonts = false) {
  // Allow quality down to 2 (not 5) and maxDim down to 36px for extreme compression
  const quality = Math.max(2, Math.round(72 - intensity * 0.70));
  const maxDim  = intensity > 15
    ? Math.max(36, Math.round(1980 - (intensity - 15) * 23))
    : null;

  const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
  if (stripFonts) await stripFontPrograms(pdfDoc);
  await recompressImages(pdfDoc, quality, maxDim, true);
  return Buffer.from(await pdfDoc.save({ useObjectStreams: true }));
}

// ── Target-size compression ────────────────────────────────────────────────────
async function compressToTargetSize(originalBuffer, targetBytes) {

  // ── Strategy 1: Ghostscript — three escalating phases ─────────────────────
  if (await getGsPath()) {
    let gsBest = null, gsBestSize = Infinity;

    const trackBest = (buf) => {
      if (buf.length < gsBestSize) { gsBestSize = buf.length; gsBest = buf; }
    };

    // ── Phase 1: vector PDF, fonts subsetted ──────────────────────────────────
    // Best quality: text remains selectable. Covers moderate compression targets.
    const phase1 = [
      { dpi: 150, q: 0.40 }, { dpi: 100, q: 0.51 }, { dpi: 72,  q: 0.76 },
      { dpi: 50,  q: 1.00 }, { dpi: 36,  q: 1.30 }, { dpi: 24,  q: 1.80 },
      { dpi: 18,  q: 2.40 }, { dpi: 12,  q: 3.00 },
    ];
    for (const { dpi, q } of phase1) {
      try {
        trackBest(await gsCompress(originalBuffer, dpi, q, false));
        if (gsBestSize <= targetBytes) break;
      } catch (e) { console.error(`[pdfCompress] GS P1 @${dpi}dpi:`, e.message); }
    }
    if (isDev) console.log(`[pdfCompress] After Phase 1: ${Math.round(gsBestSize / 1024)} KB`);

    // ── Phase 2: vector PDF, no font programs (-dNoOutputFonts) ──────────────
    // Removes embedded font data; viewer substitutes system fonts.
    // Typically saves another 30-60% on font-heavy documents.
    if (gsBestSize > targetBytes) {
      const phase2 = [
        { dpi: 72, q: 0.76 }, { dpi: 36, q: 1.30 },
        { dpi: 18, q: 2.40 }, { dpi: 8,  q: 5.00 },
      ];
      for (const { dpi, q } of phase2) {
        try {
          trackBest(await gsCompress(originalBuffer, dpi, q, true));
          if (gsBestSize <= targetBytes) break;
        } catch (e) { console.error(`[pdfCompress] GS P2 @${dpi}dpi:`, e.message); }
      }
      if (isDev) console.log(`[pdfCompress] After Phase 2: ${Math.round(gsBestSize / 1024)} KB`);
    }

    // ── Phase 3: rasterize → JPEG quality binary search ──────────────────────
    // Converts each page to a JPEG image (like Smallpdf/iLovePDF extreme mode).
    // Text becomes non-selectable. Uses binary search on quality to hit target
    // precisely — this can reach ANY size target as long as it's physically
    // possible (i.e. larger than the minimum PDF structure overhead ~5 KB).
    if (gsBestSize > targetBytes) {
      // Choose DPI based on how aggressively we need to compress.
      // Lower ratio = smaller target relative to original = use lower DPI.
      const ratio  = targetBytes / originalBuffer.length;
      const rDpi   = ratio < 0.04 ? 36 : ratio < 0.08 ? 50 : ratio < 0.15 ? 72 : 96;

      try {
        if (isDev) console.log(`[pdfCompress] Phase 3: rasterizing at ${rDpi} DPI…`);
        const pages = await gsRasterizePages(originalBuffer, rDpi);
        if (isDev) console.log(`[pdfCompress] Rasterized ${pages.length} page(s). Binary-searching quality…`);

        // Binary search: find the highest JPEG quality that still fits in targetBytes.
        // If target is unreachable even at quality 1, we still return the minimum.
        let lo = 1, hi = 85;
        let bestBelow = null, bestBelowSize = 0;   // largest result ≤ target
        let bestAbove = null, bestAboveSize = Infinity; // smallest result > target

        for (let iter = 0; iter < 14 && lo <= hi; iter++) {
          const mid = Math.round((lo + hi) / 2);
          const pdf = await buildImagePdf(pages, mid);
          if (isDev) console.log(`[pdfCompress] Raster q${mid}: ${Math.round(pdf.length / 1024)} KB`);

          if (pdf.length <= targetBytes) {
            // At or below target — record and try higher quality (bigger file, still ≤ target)
            if (pdf.length > bestBelowSize) { bestBelowSize = pdf.length; bestBelow = pdf; }
            lo = mid + 1;
          } else {
            // Over target — record minimum and try lower quality
            if (pdf.length < bestAboveSize) { bestAboveSize = pdf.length; bestAbove = pdf; }
            hi = mid - 1;
          }
        }

        const rasterBest = bestBelow ?? bestAbove;
        if (rasterBest) trackBest(rasterBest);
        if (isDev) console.log(`[pdfCompress] After Phase 3: ${Math.round(gsBestSize / 1024)} KB`);
      } catch (e) {
        console.error(`[pdfCompress] GS Phase 3 failed:`, e.message);
      }
    }

    if (gsBest) {
      const hit = gsBestSize <= targetBytes ? "✓ target achieved" : "✗ best possible";
      if (isDev) console.log(`[pdfCompress] GS final: ${Math.round(gsBestSize / 1024)} KB (${hit})`);
      return gsBest;
    }
  }

  // ── Strategy 2: pdf-lib path ────────────────────────────────────────────────

  // Step A: Strip everything non-visual (fonts, metadata, JS, attachments, etc.)
  const pdfDocBase = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
  await stripUnneededData(pdfDocBase);
  await recompressContentStreams(pdfDocBase);
  const strippedBuffer = Buffer.from(await pdfDocBase.save({ useObjectStreams: true }));

  const strippedKB = Math.round(strippedBuffer.length / 1024);
  const targetKB   = Math.round(targetBytes / 1024);
  if (isDev) console.log(`[pdfCompress] After strip: ${strippedKB} KB, target: ${targetKB} KB`);

  if (strippedBuffer.length <= targetBytes) return strippedBuffer;

  // Step B: Analyze whether there are compressible images in the stripped buffer.
  // If image bytes are < 5% of the stripped size there is nothing meaningful to
  // gain from image compression — skip the entire binary search.
  const { totalBytes: imgBytes, count: imgCount } = (() => {
    try {
      // We need a loaded PDFDocument to enumerate — use a sync-ish approach
      // by re-using the already-loaded pdfDocBase (still in memory)
      return countCompressibleImageBytes(pdfDocBase);
    } catch { return { totalBytes: 0, count: 0 }; }
  })();

  const imageRatio = imgBytes / strippedBuffer.length;
  if (isDev) console.log(`[pdfCompress] Compressible images: ${imgCount} streams, ${Math.round(imgBytes / 1024)} KB (${Math.round(imageRatio * 100)}% of stripped)`);

  // Step C: Maximum-intensity probe — determines the theoretical minimum size
  // achievable via pdf-lib. This costs one compression pass but saves up to
  // 15 wasted passes in the binary search when images can't help.
  const maxProbe = await pdfLibCompress(strippedBuffer, 100, false);
  const maxProbeKB = Math.round(maxProbe.length / 1024);
  if (isDev) console.log(`[pdfCompress] Max-intensity probe: ${maxProbeKB} KB`);

  if (maxProbe.length <= targetBytes) {
    if (isDev) console.log("[pdfCompress] Target achieved at max intensity.");
    return maxProbe;
  }

  // If max compression improved stripped by less than 3%, images contribute
  // negligibly — the binary search will waste iterations for no gain.
  const probeImprovedSignificantly = maxProbe.length < strippedBuffer.length * 0.97;
  if (!probeImprovedSignificantly) {
    if (isDev) console.log(`[pdfCompress] Image compression ineffective (<3% gain). Returning stripped buffer. ` +
      `Minimum achievable: ${strippedKB} KB (target ${targetKB} KB unreachable via pdf-lib without Ghostscript).`);
    return strippedBuffer;
  }

  // Step D: Binary search between intensity 0 and 99 to find the closest to
  // target from below; if target is unreachable, return the smallest result.
  let lo = 0, hi = 99;

  // best starts as maxProbe (minimum size we know we can reach) so the
  // binary search only needs to find if we can land AT or BELOW target
  // while being as large as possible (best quality at target size).
  let best      = maxProbe;
  let lastSize  = -1;
  let stuckRuns = 0;

  for (let iter = 0; iter < 14 && lo <= hi; iter++) {
    const mid  = Math.round((lo + hi) / 2);
    const comp = await pdfLibCompress(strippedBuffer, mid, false);

    // Prefer results that are AT OR BELOW target (quality-preserving at target)
    // over smaller results that over-compress.
    if (comp.length <= targetBytes) {
      // Hit the target — prefer the LARGEST below-target result (best quality)
      if (best.length > targetBytes || comp.length > best.length) {
        best = comp;
      }
      hi = mid - 1; // ease off compression — try to be closer to target
    } else {
      // Still above target — prefer the SMALLEST above-target result
      if (comp.length < best.length) best = comp;
      lo = mid + 1; // need more compression
    }

    // Early exit: if 3 consecutive iterations produce the same size, we're stuck
    if (comp.length === lastSize) {
      if (++stuckRuns >= 3) {
        if (isDev) console.log("[pdfCompress] Binary search stuck — same output size. Exiting early.");
        break;
      }
    } else {
      stuckRuns = 0;
    }
    lastSize = comp.length;
  }

  if (isDev) console.log(`[pdfCompress] Binary search result: ${Math.round(best.length / 1024)} KB`);
  return best;
}

// ── Main request handler ───────────────────────────────────────────────────────
export async function compressPdfs(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, error: "Please upload at least one PDF file." });
  }

  const targetSizeKb = req.body.targetSizeKb ? parseFloat(req.body.targetSizeKb) : null;

  // ── Target size mode ──────────────────────────────────────────────────────────
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
    const results     = [];

    for (const file of req.files) {
      try { await PDFDocument.load(file.buffer, { ignoreEncryption: true }); }
      catch {
        results.push({ name: file.originalname, error: `"${file.originalname}" is not a valid or readable PDF.` });
        continue;
      }
      try {
        const pdfBytes       = await compressToTargetSize(file.buffer, targetBytes);
        const originalSize   = file.buffer.length;
        const compressedSize = pdfBytes.length;
        const savings        = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
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

  // ── Compression level mode ────────────────────────────────────────────────────
  const level = (req.body.level || "medium").toLowerCase();
  if (!LEVELS[level]) {
    return res.status(400).json({ success: false, error: "Invalid compression level. Use low, medium, or high." });
  }

  const { quality, maxDim, useObjectStreams, stripFonts, allowPngToJpeg } = LEVELS[level];
  const results = [];

  for (const file of req.files) {
    let pdfDoc;
    try { pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true }); }
    catch {
      results.push({ name: file.originalname, error: `"${file.originalname}" is not a valid or readable PDF.` });
      continue;
    }
    try {
      if (stripFonts) {
        await stripUnneededData(pdfDoc);
        await recompressContentStreams(pdfDoc);
      }
      if (level !== "low") await recompressImages(pdfDoc, quality, maxDim, allowPngToJpeg);

      const pdfBytes       = await pdfDoc.save({ useObjectStreams });
      const originalSize   = file.buffer.length;
      const compressedSize = pdfBytes.length;
      const savings        = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

      results.push({
        name: file.originalname,
        originalSize, compressedSize, savings,
        data: `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`,
      });
    } catch (err) {
      console.error("[pdfCompress] error:", file.originalname, err.message);
      results.push({ name: file.originalname, error: `Failed to compress "${file.originalname}". Ensure it is a valid, unencrypted PDF.` });
    }
  }

  res.json({ success: true, results });
}
