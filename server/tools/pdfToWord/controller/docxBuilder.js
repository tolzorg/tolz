// Builds a Word document that mirrors the PDF page by page:
//   • each PDF page → one Word section with the same page size, no margins;
//   • vector graphics (table borders, shading, boxes, lines, shapes) → a
//     page-sized picture behind the text;
//   • images → real pictures at their exact position, size, rotation and crop;
//   • text → editable paragraphs in absolutely positioned text frames, keeping
//     font, size, bold/italic, colour, line breaks, line spacing, alignment and
//     indentation.
import {
  Document, Paragraph, TextRun, ImageRun, FrameAnchorType, LineRuleType, AlignmentType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType, PageOrientation, SectionType, ShadingType,
} from "docx";
import sharp from "../../../core/utils/safeSharp.js";

const TW = 20;                 // twips per point
const PX = 96 / 72;            // docx image sizes are in 96-dpi pixels
const EMU = 12700;             // EMUs per point
const BASELINE_RATIO = 0.8;    // Word puts a line's baseline at 80% of an exact line height (measured)
const MAX_IMAGE_DPI = 300;     // images are kept at up to 300 dpi at their printed size
const BACKGROUND_DPI = 150;    // resolution of the vector-graphics layers

const tw = (pt) => Math.round(pt * TW);
const median = (arr) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const hex = (c) => (c || "#000000").replace("#", "").toUpperCase();

// ── Text layout: items → lines → segments → blocks ───────────────────────────
function buildSegments(items) {
  // Whitespace-only items are dropped: pdf.js emits them as separate items whose
  // width can span a whole gap (e.g. between table cells), which would glue
  // separate cells together. Word spaces are re-inserted from real gaps below.
  const sorted = items.filter((it) => it.str.trim() !== "").sort((a, b) => a.y - b.y || a.x - b.x);
  const lines = [];
  for (const it of sorted) {
    const line = lines.find((l) => Math.abs(l.y - it.y) <= Math.max(1.5, Math.min(l.size, it.size) * 0.4));
    if (line) { line.items.push(it); line.size = Math.max(line.size, it.size); }
    else lines.push({ y: it.y, size: it.size, items: [it] });
  }
  const segments = [];
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    let seg = null;
    for (const it of line.items) {
      const gap = seg ? it.x - seg.x1 : 0;
      // A wide gap starts a new segment (next column / table cell / tab stop).
      if (!seg || gap > Math.max(it.size * 1.0, 6)) {
        seg = { x0: it.x, x1: it.x + it.w, y: line.y, size: it.size, items: [it] };
        segments.push(seg);
      } else {
        seg.items.push(it);
        seg.x1 = Math.max(seg.x1, it.x + it.w);
        seg.size = Math.max(seg.size, it.size);
      }
    }
  }
  return segments;
}

/** True when a separator (table border, rule, box edge) runs between two lines. */
function separated(rules, upper, lower) {
  const top = upper.y, bottom = lower.y - lower.size * 0.75;
  const x0 = Math.max(upper.x0, lower.x0), x1 = Math.min(upper.x1, lower.x1);
  return rules.some((r) => r.y > top + 0.5 && r.y < bottom && r.x0 < x1 - 1 && r.x1 > x0 + 1);
}

function buildBlocks(segments, rules = []) {
  const ordered = [...segments].sort((a, b) => a.y - b.y || a.x0 - b.x0);
  const blocks = [];
  for (const seg of ordered) {
    let target = null, bestDy = Infinity;
    for (const b of blocks) {
      const last = b.lines[b.lines.length - 1];
      const dy = seg.y - last.y;
      if (dy <= last.size * 0.7) continue;                         // same row or above
      const lineGap = b.lines.length > 1 ? b.lineGap : Math.max(last.size, seg.size) * 1.25;
      if (dy > Math.max(lineGap * 1.35, Math.max(last.size, seg.size) * 1.9)) continue; // paragraph break
      const sizeRatio = Math.max(seg.size, last.size) / Math.min(seg.size, last.size);
      if (sizeRatio > 1.25) continue;
      const leftAligned = Math.abs(seg.x0 - b.x0) <= Math.max(seg.size * 2.2, 14);
      const centered = Math.abs((seg.x0 + seg.x1) / 2 - (b.x0 + b.x1) / 2) <= 3 && seg.x0 < b.x1 && seg.x1 > b.x0;
      const rightAligned = Math.abs(seg.x1 - b.x1) <= 2 && seg.x0 < b.x1;
      if (!(leftAligned || centered || rightAligned)) continue;
      if (seg.x0 > b.x1 || seg.x1 < b.x0) continue;                // no horizontal overlap
      if (separated(rules, last, seg)) continue;                   // a line/border sits between them
      if (dy < bestDy) { bestDy = dy; target = b; }
    }
    if (target) {
      const dy = seg.y - target.lines[target.lines.length - 1].y;
      target.gaps.push(dy);
      target.lineGap = median(target.gaps);
      target.lines.push(seg);
      target.x0 = Math.min(target.x0, seg.x0);
      target.x1 = Math.max(target.x1, seg.x1);
    } else {
      blocks.push({ lines: [seg], gaps: [], lineGap: 0, x0: seg.x0, x1: seg.x1 });
    }
  }
  return blocks;
}

function runsForSegment(seg) {
  const runs = [];
  let prev = null;
  for (const it of seg.items) {
    let str = it.str;
    if (prev) {
      const gap = it.x - (prev.x + prev.w);
      if (gap > it.size * 0.18 && !/\s$/.test(prev.str) && !/^\s/.test(str)) str = " " + str;
    }
    // Symbol/dingbat fonts only for their private-use characters; pdf.js already maps
    // most symbols (e.g. bullets) to standard Unicode, which those fonts lack.
    const symbolFont = /^(Symbol|Wingdings|Webdings|Zapf ?Dingbats)/i.test(it.font.family);
    const PRIVATE_USE = new RegExp(`[${String.fromCharCode(0xf000)}-${String.fromCharCode(0xf0ff)}]`); // symbol-font code area
    const family = symbolFont && !PRIVATE_USE.test(it.str) ? "Arial" : it.font.family;
    const style = { font: family, bold: it.font.bold, italic: it.font.italic, size: Math.round(it.size * 2) / 2, color: hex(it.color), shade: it.highlight ? hex(it.highlight) : null };
    const last = runs[runs.length - 1];
    if (last && last.font === style.font && last.bold === style.bold && last.italic === style.italic && last.size === style.size && last.color === style.color && last.shade === style.shade) last.text += str;
    else runs.push({ ...style, text: str });
    prev = it;
  }
  return runs;
}

function blockParagraph(block, page) {
  const { lines } = block;
  const maxSize = Math.max(...lines.map((l) => l.size));
  const lineHeight = lines.length > 1 ? block.lineGap : maxSize * 1.2;
  const width = block.x1 - block.x0;

  // Alignment from the line edges.
  let alignment = AlignmentType.LEFT;
  if (lines.length > 1) {
    const lefts = lines.map((l) => l.x0), rights = lines.map((l) => l.x1), centers = lines.map((l) => (l.x0 + l.x1) / 2);
    const spread = (a) => Math.max(...a) - Math.min(...a);
    const body = lines.slice(0, -1);
    if (spread(lefts) > 3 && spread(centers) <= 3) alignment = AlignmentType.CENTER;
    else if (spread(lefts) > 3 && spread(rights) <= 2) alignment = AlignmentType.RIGHT;
    // Justified: every line but the last reaches the right edge (in columns the last may too).
    else if (spread(lefts) <= 3 && body.every((l) => block.x1 - l.x1 <= 2) && (lines.length >= 3 || lines[lines.length - 1].x1 >= block.x1 - 2)) alignment = AlignmentType.JUSTIFIED;
  }

  // Indentation (first-line indent or hanging indent such as bullets).
  let indent;
  if (alignment === AlignmentType.LEFT || alignment === AlignmentType.JUSTIFIED) {
    const first = lines[0].x0 - block.x0;
    const rest = lines.length > 1 ? Math.min(...lines.slice(1).map((l) => l.x0)) - block.x0 : first;
    if (first > 1 || rest > 1) {
      indent = { left: tw(rest) };
      if (first > rest + 0.5) indent.firstLine = tw(first - rest);
      else if (rest > first + 0.5) indent.hanging = tw(rest - first);
    }
  }

  // Slack so slightly wider Word fonts don't wrap lines that fit in the PDF.
  const slack = Math.max(6, width * 0.06);
  let x = block.x0 - 0.5;
  if (alignment === AlignmentType.CENTER) x -= slack / 2;
  if (alignment === AlignmentType.RIGHT) x -= slack;
  x = Math.max(0, x);
  const frameWidth = Math.min(width + slack + 1, page.width - x);
  const top = lines[0].y - lineHeight * BASELINE_RATIO;

  const children = [];
  lines.forEach((line, i) => {
    runsForSegment(line).forEach((r, j) => {
      children.push(new TextRun({
        text: r.text, font: r.font, size: Math.max(2, Math.round(r.size * 2)), bold: r.bold, italics: r.italic, color: r.color,
        shading: r.shade ? { type: ShadingType.CLEAR, color: "auto", fill: r.shade } : undefined,
        break: i > 0 && j === 0 ? 1 : undefined,
      }));
    });
  });

  return new Paragraph({
    frame: {
      type: "absolute",
      position: { x: tw(x), y: tw(Math.max(0, top)) },
      width: tw(frameWidth),
      height: tw(lineHeight * lines.length),
      rule: "atLeast",
      anchor: { horizontal: FrameAnchorType.PAGE, vertical: FrameAnchorType.PAGE },
      wrap: "none",
    },
    alignment,
    indent,
    spacing: { before: 0, after: 0, line: Math.max(tw(lineHeight), 20), lineRule: LineRuleType.EXACT },
    children,
  });
}

function fieldParagraph(f) {
  const size = f.size > 0 ? f.size : Math.min(12, f.h * 0.7);
  const line = Math.max(size * 1.2, 1);
  const baseline = f.y + f.h / 2 + size * 0.35;
  return new Paragraph({
    frame: {
      type: "absolute", position: { x: tw(f.x + 2), y: tw(Math.max(0, baseline - line * BASELINE_RATIO)) },
      width: tw(Math.max(10, f.w - 4)), height: tw(line), rule: "atLeast",
      anchor: { horizontal: FrameAnchorType.PAGE, vertical: FrameAnchorType.PAGE }, wrap: "none",
    },
    spacing: { before: 0, after: 0, line: tw(line), lineRule: LineRuleType.EXACT },
    children: [new TextRun({ text: f.value, font: "Arial", size: Math.round(size * 2) })],
  });
}

// ── Images ───────────────────────────────────────────────────────────────────
function rawImage(img, ImageKind) {
  const { width, height, kind } = img;
  const data = img.data;
  if (!data || !width || !height) return null;
  if (kind === ImageKind.RGBA_32BPP) return { buf: Buffer.from(data.buffer, data.byteOffset, width * height * 4), channels: 4 };
  if (kind === ImageKind.RGB_24BPP) return { buf: Buffer.from(data.buffer, data.byteOffset, width * height * 3), channels: 3 };
  if (kind === ImageKind.GRAYSCALE_1BPP) {
    const out = Buffer.alloc(width * height);
    const rowBytes = (width + 7) >> 3;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      out[y * width + x] = data[y * rowBytes + (x >> 3)] & (128 >> (x & 7)) ? 255 : 0;
    }
    return { buf: out, channels: 1 };
  }
  return null;
}

/** Stencil mask (1 bit) painted with the fill colour → RGBA. Bit set = transparent (as pdf.js paints it). */
function maskImage(img, fillColor) {
  const { width, height, data } = img;
  if (!data || !width || !height) return null;
  const c = hex(fillColor);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  const out = Buffer.alloc(width * height * 4);
  const rowBytes = (width + 7) >> 3;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const on = !(data[y * rowBytes + (x >> 3)] & (128 >> (x & 7)));
    const o = (y * width + x) * 4;
    out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = on ? 255 : 0;
  }
  return { buf: out, channels: 4 };
}

/** Renders a placed image (rotation/flip/scale via an affine transform, then clip crop). */
async function placeImage(entry, page, ImageKind) {
  const src = entry.mask ? maskImage(entry.data, entry.fillColor) : rawImage(entry.data, ImageKind);
  if (!src) return null;
  const W = entry.data.width, H = entry.data.height;
  const { tl, tr, bl, br } = entry.corners;
  const u = [tr[0] - tl[0], tr[1] - tl[1]];     // device direction of an image row
  const v = [bl[0] - tl[0], bl[1] - tl[1]];     // device direction of an image column
  const xs = [tl[0], tr[0], bl[0], br[0]], ys = [tl[1], tr[1], bl[1], br[1]];
  let box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  const placedW = Math.hypot(...u), placedH = Math.hypot(...v);
  if (placedW < 0.5 || placedH < 0.5) return null;

  // Visible part: clip ∩ page.
  let vis = { x0: Math.max(box.x0, 0), y0: Math.max(box.y0, 0), x1: Math.min(box.x1, page.width), y1: Math.min(box.y1, page.height) };
  if (entry.clip) vis = { x0: Math.max(vis.x0, entry.clip.x0), y0: Math.max(vis.y0, entry.clip.y0), x1: Math.min(vis.x1, entry.clip.x1), y1: Math.min(vis.y1, entry.clip.y1) };
  if (vis.x1 - vis.x0 < 0.5 || vis.y1 - vis.y0 < 0.5) return null;

  // Output resolution: the image's own, capped at MAX_IMAGE_DPI at its printed size.
  const nativePxPerPt = Math.max(W / placedW, H / placedH);
  const k = Math.min(nativePxPerPt, MAX_IMAGE_DPI / 72);   // output pixels per point
  const axisAligned = Math.abs(u[1]) < 0.01 * placedW && Math.abs(v[0]) < 0.01 * placedH;
  const normal = axisAligned && u[0] > 0 && v[1] > 0;

  let pipe = sharp(src.buf, { raw: { width: W, height: H, channels: src.channels } });
  let outW, outH;
  if (normal) {
    outW = Math.max(1, Math.round(placedW * k));
    outH = Math.max(1, Math.round(placedH * k));
    pipe = pipe.resize(outW, outH, { fit: "fill" });
  } else {
    // General case (rotation, mirroring, skew): map image pixels onto device space.
    const matrix = [[(u[0] / W) * k, (v[0] / H) * k], [(u[1] / W) * k, (v[1] / H) * k]];
    pipe = pipe.ensureAlpha().affine(matrix, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }
  // Work on raw pixels: one decode, one final encode.
  const { data: pixels, info } = await pipe.raw().toBuffer({ resolveWithObject: true });
  outW = info.width; outH = info.height;
  const rawOpts = { raw: { width: info.width, height: info.height, channels: info.channels } };

  // Crop to the visible part (pixel grid of the bounding box).
  const sx = outW / (box.x1 - box.x0), sy = outH / (box.y1 - box.y0);
  const left = Math.max(0, Math.floor((vis.x0 - box.x0) * sx)), top = Math.max(0, Math.floor((vis.y0 - box.y0) * sy));
  const cw = Math.min(outW - left, Math.ceil((vis.x1 - vis.x0) * sx)), ch = Math.min(outH - top, Math.ceil((vis.y1 - vis.y0) * sy));
  if (cw < 1 || ch < 1) return null;
  const cropped = () => {
    const img = sharp(pixels, rawOpts);
    return left > 0 || top > 0 || cw < outW || ch < outH ? img.extract({ left, top, width: cw, height: ch }) : img;
  };

  // JPEG for opaque photos (much smaller), PNG for transparency and sharp-edged
  // graphics. The choice is made on a small preview so big images are only
  // encoded once.
  const hasAlpha = info.channels === 4 && (await cropped().stats()).channels[3].min < 255;
  let type = "png";
  if (!hasAlpha) {
    const preview = await cropped().resize({ width: 256, height: 256, fit: "inside", withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true });
    const p = () => sharp(preview.data, { raw: { width: preview.info.width, height: preview.info.height, channels: preview.info.channels } });
    const [pj, pp] = await Promise.all([p().removeAlpha().jpeg({ quality: 90, mozjpeg: true }).toBuffer(), p().png({ compressionLevel: 6 }).toBuffer()]);
    if (pj.length * 1.5 < pp.length) type = "jpg";
  }
  const data = type === "jpg"
    ? await cropped().removeAlpha().jpeg({ quality: 90, mozjpeg: true }).toBuffer()
    : await cropped().png({ compressionLevel: 6 }).toBuffer();
  return { type, data, x: vis.x0, y: vis.y0, w: vis.x1 - vis.x0, h: vis.y1 - vis.y0 };
}

function floatingImage({ type, data, x, y, w, h }, zIndex) {
  return new ImageRun({
    type, data,
    transformation: { width: w * PX, height: h * PX },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(x * EMU) },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(y * EMU) },
      behindDocument: true, allowOverlap: true, lockAnchor: true, layoutInCell: true,
      wrap: { type: TextWrappingType.NONE },
      // Word ignores small stacking values (1, 2, 3 …) and then draws the first
      // picture — the page background — on top of the photos. It honours the
      // values it writes itself (251658240 and up, in steps of 1024).
      zIndex: 251658240 + zIndex * 1024,
    },
  });
}

// ── Document ─────────────────────────────────────────────────────────────────
/**
 * One Word section for one analysed page (see pdfPageAnalysis.analyzePage),
 * with each image entry's decoded pixels attached as entry.data. Built page
 * by page so only encoded images stay in memory, not every page's raw pixels.
 */
export async function buildPageSection(page, ImageKind) {
  const floats = [];
  let z = 1;
  // Shapes and pictures are stacked in the PDF's own painting order, so a
  // picture drawn over a box (or a badge drawn over a picture) stays that way.
  for (const layer of page.layers) {
    if (layer.kind === "vector") {
      try {
        const png = await sharp(Buffer.from(layer.markup), { density: BACKGROUND_DPI })
          .png({ palette: !layer.markup.includes("Gradient"), compressionLevel: 9 }).toBuffer();
        floats.push(floatingImage({ type: "png", data: png, x: layer.x, y: layer.y, w: layer.w, h: layer.h }, z++));
      } catch (err) { console.error("[pdfToWord] shapes skipped:", err.message); }
      continue;
    }
    const entry = page.images[layer.index];
    if (!entry?.data) continue;
    try {
      const placed = await placeImage(entry, page, ImageKind);
      if (placed) floats.push(floatingImage(placed, z++));
    } catch (err) { console.error("[pdfToWord] image skipped:", err.message); }
  }

  const children = [new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT }, children: floats })];
  for (const block of buildBlocks(buildSegments(page.items), page.rules)) children.push(blockParagraph(block, page));
  for (const f of page.fields) children.push(fieldParagraph(f));

  const landscape = page.width > page.height;
  return {
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        // The docx library swaps width/height for landscape pages, so pass them portrait-first.
        size: landscape
          ? { width: tw(page.height), height: tw(page.width), orientation: PageOrientation.LANDSCAPE }
          : { width: tw(page.width), height: tw(page.height), orientation: PageOrientation.PORTRAIT },
        margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 },
      },
    },
    children,
  };
}

export function buildDocument(sections, title) {
  if (!sections.length) sections.push({ children: [new Paragraph({ children: [] })] });
  return new Document({ creator: "tolz", title, sections });
}

/** Text blocks for a page's items (exported for diagnostics and tests). */
export function layoutBlocks(items, rules) {
  return buildBlocks(buildSegments(items), rules);
}
