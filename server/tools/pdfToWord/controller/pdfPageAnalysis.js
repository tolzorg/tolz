// Reads one PDF page with pdf.js and returns everything needed to rebuild it
// in Word: text (with font, size, colour and position), images (with their
// placement and crop) and vector graphics (rendered to an SVG for the page
// background: table borders, cell shading, coloured boxes, lines, shapes).
//
// All coordinates returned are PDF points with the origin at the TOP-LEFT of
// the page (the page viewport at scale 1, so page rotation and crop boxes are
// already applied).

const IDENTITY = [1, 0, 0, 1, 0, 0];

// pdf.js OPS values for path painting (constructPath's first argument).
const PAINT = { stroke: 20, closeStroke: 21, fill: 22, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27, endPath: 28 };
// Segment codes inside constructPath's path data.
const SEG = { moveTo: 0, lineTo: 1, curveTo: 2, quadraticCurveTo: 3, closePath: 4 };

const mul = (m1, m2) => [
  m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1],
  m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3],
  m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const scaleOf = (m) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;

function bboxOf(points) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}
const intersect = (a, b) => (!a ? b : !b ? a : { x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });
const isEmpty = (r) => !r || r.x1 - r.x0 <= 0.01 || r.y1 - r.y0 <= 0.01;

const fmt = (n) => (Math.round(n * 100) / 100).toString();

/** "#rrggbb" or null for colours pdf.js reports as patterns/shadings. */
function normColor(c) {
  if (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase();
  if (Array.isArray(c) && c.length === 3 && c.every((v) => typeof v === "number")) {
    return "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  return null;
}

/** pdf.js linear/radial gradient pattern → SVG gradient element, or null. */
function gradientFor(ir, id, ctmToDevice) {
  if (!Array.isArray(ir) || ir[0] !== "RadialAxial") return null;
  const [, type, , stops, p0, p1, r0, r1, matrix] = ir;
  if (!Array.isArray(stops) || !p0 || !p1) return null;
  const m = matrix ? mul(ctmToDevice, matrix) : ctmToDevice;
  const stopXml = stops.map(([off, col]) => `<stop offset="${fmt(off)}" stop-color="${normColor(col) || "#000000"}"/>`).join("");
  const tf = `gradientTransform="matrix(${m.map(fmt).join(" ")})"`;
  if (type === "axial") return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(p0[0])}" y1="${fmt(p0[1])}" x2="${fmt(p1[0])}" y2="${fmt(p1[1])}" ${tf}>${stopXml}</linearGradient>`;
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" fx="${fmt(p0[0])}" fy="${fmt(p0[1])}" fr="${fmt(r0 || 0)}" cx="${fmt(p1[0])}" cy="${fmt(p1[1])}" r="${fmt(r1 || 0)}" ${tf}>${stopXml}</radialGradient>`;
}

function pathToSvg(pathData, m) {
  let d = "";
  let i = 0;
  const pt = (x, y) => { const [a, b] = apply(m, x, y); return `${fmt(a)} ${fmt(b)}`; };
  while (i < pathData.length) {
    const op = pathData[i++];
    if (op === SEG.moveTo) { d += `M${pt(pathData[i], pathData[i + 1])}`; i += 2; }
    else if (op === SEG.lineTo) { d += `L${pt(pathData[i], pathData[i + 1])}`; i += 2; }
    else if (op === SEG.curveTo) { d += `C${pt(pathData[i], pathData[i + 1])} ${pt(pathData[i + 2], pathData[i + 3])} ${pt(pathData[i + 4], pathData[i + 5])}`; i += 6; }
    else if (op === SEG.quadraticCurveTo) { d += `Q${pt(pathData[i], pathData[i + 1])} ${pt(pathData[i + 2], pathData[i + 3])}`; i += 4; }
    else if (op === SEG.closePath) { d += "Z"; }
    else break; // unknown segment code — stop rather than draw garbage
  }
  return d;
}

/** Waits for a pdf.js object (images, fonts) without hanging on missing ones. */
function getObj(store, id, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try { store.get(id, (obj) => { clearTimeout(timer); resolve(obj); }); }
    catch { clearTimeout(timer); resolve(null); }
  });
}

/**
 * Analyses one page.
 * @returns {Promise<{ width, height, items, images, layers, fields, rules }>}
 *   layers: in painting order — { kind: "vector", x, y, w, h, markup } (an SVG
 *     cropped to its area) or { kind: "image", index } (into images)
 *   items: text items { str, x, y (baseline), w, size, font, color, invisible }
 *   images: { imgId | inlineData, mask, fillColor, corners (4 device points), clip }
 *   fields: filled-in form text fields { x, y, w, h, value, size }
 */
export async function analyzePage(page, pdfjs) {
  const OPS = pdfjs.OPS;
  const viewport = page.getViewport({ scale: 1 });
  const vt = viewport.transform; // PDF user space → top-left points
  const width = viewport.width, height = viewport.height;

  const opList = await page.getOperatorList({ annotationMode: pdfjs.AnnotationMode.ENABLE });
  const { fnArray, argsArray } = opList;

  // ── Walk the operator list ─────────────────────────────────────────────────
  let st = { ctm: IDENTITY, fill: "#000000", stroke: "#000000", fillAlpha: 1, strokeAlpha: 1, lineWidth: 1, fillPattern: null, clip: null, dash: null };
  const stack = [];
  const text = { tm: IDENTITY, tlm: IDENTITY, font: null, size: 12, charSpacing: 0, wordSpacing: 0, hScale: 1, leading: 0, rise: 0, mode: 0 };
  const textRuns = [];   // showText records { x, y, color, invisible, size }
  const images = [];
  const svgParts = [];
  const rules = [];      // horizontal separators { x0, x1, y }
  const fillRects = [];  // plain filled rectangles (candidates for text highlights)
  const defs = [];
  let gradCount = 0;
  let pendingClip = false;
  // Drawing order: runs of vector shapes and individual images, in the order
  // the PDF paints them, so pictures and shapes overlap exactly as in the PDF.
  const layers = [];
  let currentGroup = null;
  const addImageLayer = () => { layers.push({ kind: "image", index: images.length - 1 }); currentGroup = null; };

  const device = () => mul(vt, st.ctm);
  const fontCache = new Map();

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];
    switch (fn) {
      case OPS.save:
      case OPS.beginGroup:
        stack.push({ ...st }); break;
      case OPS.restore:
      case OPS.endGroup:
        if (stack.length) st = stack.pop(); break;
      case OPS.paintFormXObjectBegin:
        stack.push({ ...st });
        if (Array.isArray(args?.[0]) && args[0].length === 6) st.ctm = mul(st.ctm, args[0]);
        break;
      case OPS.paintFormXObjectEnd:
      case OPS.endAnnotation:
        if (stack.length) st = stack.pop(); break;
      case OPS.beginAnnotation: {
        // Annotation appearances (form fields, stamps): map the appearance onto the annotation's rectangle.
        stack.push({ ...st });
        const [, , transform, matrix] = args || [];
        if (Array.isArray(transform) && transform.length === 6) st.ctm = mul(st.ctm, transform);
        if (Array.isArray(matrix) && matrix.length === 6) st.ctm = mul(st.ctm, matrix);
        break;
      }
      case OPS.transform:
        st.ctm = mul(st.ctm, args); break;
      case OPS.setFillRGBColor:
        st.fill = normColor(args[0]) || st.fill; st.fillPattern = null; break;
      case OPS.setStrokeRGBColor:
        st.stroke = normColor(args[0]) || st.stroke; break;
      case OPS.setFillColorN: {
        // Gradients arrive either inline or as ["Shading", objId, patternMatrix].
        st.fillPattern = null;
        if (Array.isArray(args?.[0]) && args[0][0] === "RadialAxial") st.fillPattern = { ir: args[0], matrix: null };
        else if (args?.[0] === "Shading" && typeof args[1] === "string") {
          const ir = await getObj(args[1].startsWith("g_") ? page.commonObjs : page.objs, args[1], 3000);
          if (Array.isArray(ir) && ir[0] === "RadialAxial") st.fillPattern = { ir, matrix: Array.isArray(args[2]) ? args[2] : null };
        }
        if (!st.fillPattern) st.fillPattern = { unsupported: true }; // tiling patterns etc.: don't paint them black
        break;
      }
      case OPS.setLineWidth:
        st.lineWidth = args[0]; break;
      case OPS.setDash:
        st.dash = Array.isArray(args?.[0]) && args[0].length ? args[0] : null; break;
      case OPS.setGState:
        for (const [key, value] of args[0] || []) {
          if (key === "ca") st.fillAlpha = value;
          else if (key === "CA") st.strokeAlpha = value;
          else if (key === "LW") st.lineWidth = value;
        }
        break;
      case OPS.clip:
      case OPS.eoClip:
        pendingClip = true; break;
      case OPS.constructPath: {
        const [paintOp, paths, minMax] = args;
        const m = device();
        if (pendingClip && minMax) {
          // Track the clip's rectangular bounds (enough for cropped pictures and page clips).
          const b = bboxOf([apply(m, minMax[0], minMax[1]), apply(m, minMax[2], minMax[3]), apply(m, minMax[0], minMax[3]), apply(m, minMax[2], minMax[1])]);
          st.clip = intersect(st.clip, b);
          pendingClip = false;
        }
        if (paintOp === PAINT.endPath) break;
        const doFill = [PAINT.fill, PAINT.eoFill, PAINT.fillStroke, PAINT.eoFillStroke, PAINT.closeFillStroke, PAINT.closeEOFillStroke].includes(paintOp);
        const doStroke = [PAINT.stroke, PAINT.closeStroke, PAINT.fillStroke, PAINT.eoFillStroke, PAINT.closeFillStroke, PAINT.closeEOFillStroke].includes(paintOp);
        const evenOdd = [PAINT.eoFill, PAINT.eoFillStroke, PAINT.closeEOFillStroke].includes(paintOp);
        let d = "";
        for (const p of paths || []) d += pathToSvg(p, m);
        if (!d) break;
        if ([PAINT.closeStroke, PAINT.closeFillStroke, PAINT.closeEOFillStroke].includes(paintOp)) d += "Z";
        let fillAttr = "none";
        if (doFill) {
          if (st.fillPattern) {
            const id = `g${++gradCount}`;
            // A pattern's matrix maps pattern space to the page's default space.
            const g = st.fillPattern.ir ? gradientFor(st.fillPattern.ir, id, st.fillPattern.matrix ? mul(vt, st.fillPattern.matrix) : m) : null;
            if (g) { defs.push(g); fillAttr = `url(#${id})`; }
          } else fillAttr = st.fill;
        }
        if (fillAttr === "none" && !doStroke) break;
        const sw = Math.max(0.35, st.lineWidth * scaleOf(m));
        let attrs = `d="${d}" fill="${fillAttr}"`;
        if (doFill && evenOdd) attrs += ` fill-rule="evenodd"`;
        if (doFill && st.fillAlpha < 1) attrs += ` fill-opacity="${fmt(st.fillAlpha)}"`;
        if (doStroke) {
          attrs += ` stroke="${st.stroke}" stroke-width="${fmt(sw)}"`;
          if (st.strokeAlpha < 1) attrs += ` stroke-opacity="${fmt(st.strokeAlpha)}"`;
          if (st.dash) attrs += ` stroke-dasharray="${st.dash.map((v) => fmt(Math.max(0.1, v * scaleOf(m)))).join(" ")}"`;
        }
        if (st.clip && !isEmpty(st.clip)) {
          const id = `c${defs.length}`;
          defs.push(`<clipPath id="${id}"><rect x="${fmt(st.clip.x0)}" y="${fmt(st.clip.y0)}" width="${fmt(st.clip.x1 - st.clip.x0)}" height="${fmt(st.clip.y1 - st.clip.y0)}"/></clipPath>`);
          attrs += ` clip-path="url(#${id})"`;
        } else if (st.clip) break; // fully clipped away
        // Separators for text grouping: thin lines and the edges of boxes.
        const bb = minMax ? bboxOf([apply(m, minMax[0], minMax[1]), apply(m, minMax[2], minMax[3]), apply(m, minMax[0], minMax[3]), apply(m, minMax[2], minMax[1])]) : null;
        const edges = [];
        if (bb && bb.x1 - bb.x0 >= 8) {
          if (bb.y1 - bb.y0 <= 2.5) edges.push({ x0: bb.x0, x1: bb.x1, y: (bb.y0 + bb.y1) / 2 });
          else edges.push({ x0: bb.x0, x1: bb.x1, y: bb.y0 }, { x0: bb.x0, x1: bb.x1, y: bb.y1 });
          rules.push(...edges);
        }
        if (bb && doFill && !doStroke && !st.fillPattern && st.fillAlpha >= 1 && isAxisRect(paths)) {
          fillRects.push({ ...bb, color: st.fill, svgIndex: svgParts.length, edges });
        }
        if (!currentGroup) { currentGroup = { kind: "vector", parts: [], bbox: null }; layers.push(currentGroup); }
        currentGroup.parts.push(svgParts.length);
        if (bb) {
          const pad = doStroke ? sw : 0;
          let area = { x0: bb.x0 - pad, y0: bb.y0 - pad, x1: bb.x1 + pad, y1: bb.y1 + pad };
          if (st.clip) area = intersect(area, st.clip);
          currentGroup.bbox = currentGroup.bbox ? { x0: Math.min(currentGroup.bbox.x0, area.x0), y0: Math.min(currentGroup.bbox.y0, area.y0), x1: Math.max(currentGroup.bbox.x1, area.x1), y1: Math.max(currentGroup.bbox.y1, area.y1) } : area;
        } else currentGroup.bbox = { x0: 0, y0: 0, x1: width, y1: height };
        svgParts.push(`<path ${attrs}/>`);
        break;
      }

      // ── Text state ──
      case OPS.beginText:
        text.tm = IDENTITY; text.tlm = IDENTITY; break;
      case OPS.setFont: {
        text.font = args[0];
        text.size = args[1];
        if (!fontCache.has(args[0])) fontCache.set(args[0], await getObj(page.commonObjs, args[0], 3000));
        break;
      }
      case OPS.setTextMatrix:
        text.tm = Array.from(args.length === 6 ? args : args[0]); text.tlm = text.tm; break;
      case OPS.moveText:
        text.tlm = mul(text.tlm, [1, 0, 0, 1, args[0], args[1]]); text.tm = text.tlm; break;
      case OPS.setLeadingMoveText:
        text.leading = -args[1]; text.tlm = mul(text.tlm, [1, 0, 0, 1, args[0], args[1]]); text.tm = text.tlm; break;
      case OPS.nextLine:
        text.tlm = mul(text.tlm, [1, 0, 0, 1, 0, -text.leading]); text.tm = text.tlm; break;
      case OPS.setLeading: text.leading = args[0]; break;
      case OPS.setCharSpacing: text.charSpacing = args[0]; break;
      case OPS.setWordSpacing: text.wordSpacing = args[0]; break;
      case OPS.setHScale: text.hScale = args[0] / 100; break;
      case OPS.setTextRise: text.rise = args[0]; break;
      case OPS.setTextRenderingMode: text.mode = args[0]; break;
      case OPS.showText:
      case OPS.showSpacedText: {
        const glyphs = args[0] || [];
        const m = mul(device(), text.tm);
        const [x, y] = apply(m, 0, text.rise);
        const mode = text.mode & 3; // ignore the "add to clip" bit
        const run = {
          x, y, x1: x,
          color: mode === 1 ? st.stroke : st.fill,
          invisible: mode === 3,
          size: text.size * Math.hypot(m[2], m[3]),
          text: glyphs.map((g) => (g && typeof g === "object" ? g.unicode || "" : "")).join(""),
        };
        textRuns.push(run);
        // Advance the text matrix by the glyph widths (needed when several
        // differently-coloured runs follow each other without repositioning).
        const font = fontCache.get(text.font);
        const fm = font?.fontMatrix || [0.001, 0, 0, 0.001, 0, 0];
        let tx = 0;
        for (const g of glyphs) {
          if (typeof g === "number") { tx -= (g / 1000) * text.size * text.hScale; continue; }
          if (!g) continue;
          const w = (g.width || 0) * fm[0] * text.size;
          tx += (w + text.charSpacing + (g.isSpace ? text.wordSpacing : 0)) * text.hScale;
        }
        text.tm = mul(text.tm, [1, 0, 0, 1, tx, 0]);
        run.x1 = apply(mul(device(), text.tm), 0, text.rise)[0];
        break;
      }

      // ── Images ──
      case OPS.paintImageXObject:
      case OPS.paintImageXObjectRepeat:
        images.push({ imgId: args[0], corners: unitCorners(device()), clip: st.clip });
        addImageLayer();
        break;
      case OPS.paintInlineImageXObject:
        images.push({ inlineData: args[0], corners: unitCorners(device()), clip: st.clip });
        addImageLayer();
        break;
      case OPS.paintImageMaskXObject:
        images.push({ inlineData: args[0], mask: true, fillColor: st.fill, corners: unitCorners(device()), clip: st.clip });
        addImageLayer();
        break;
      default: break;
    }
  }

  // ── Text content (exact strings) + colour/visibility from the walk ─────────
  const tc = await page.getTextContent({ disableNormalization: false });
  const items = [];
  for (const it of tc.items) {
    if (!("str" in it) || !it.str) continue;
    const [x, y] = viewport.convertToViewportPoint(it.transform[4], it.transform[5]);
    const size = Math.hypot(it.transform[2], it.transform[3]) || it.height || 12;
    // Text that isn't horizontal is kept, but laid out horizontally.
    const w = Math.abs(it.width) || it.str.length * size * 0.5;
    const fontObj = fontCache.get(it.fontName) || (await getObj(page.commonObjs, it.fontName, 3000));
    const font = describeFont(fontObj, tc.styles?.[it.fontName]);
    // pdf.js merges differently-coloured runs that share a font into one item:
    // split it again at the drawing runs' boundaries.
    for (const part of splitByRuns(it.str, x, y, w, size, textRuns)) {
      if (part.invisible) continue; // OCR layers of scans: invisible in the PDF, keep them invisible
      items.push({ str: part.str, x: part.x, y, w: part.w, size, font, color: part.color || "#000000" });
    }
  }

  // ── Filled-in form fields (their text isn't in the page's text content) ───
  const fields = [];
  try {
    for (const a of await page.getAnnotations()) {
      if (a.subtype !== "Widget" || a.fieldType !== "Tx" || !a.fieldValue || typeof a.fieldValue !== "string") continue;
      const [x0, y0] = viewport.convertToViewportPoint(a.rect[0], a.rect[1]);
      const [x1, y1] = viewport.convertToViewportPoint(a.rect[2], a.rect[3]);
      const size = a.textSize || (a.defaultAppearanceData?.fontSize) || 11;
      fields.push({ x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0), value: a.fieldValue, size: size || 11 });
    }
  } catch { /* annotations are optional */ }

  // ── Text highlights: a tight coloured box behind text on one line becomes a
  // real Word highlight (it then moves with the text) instead of a shape.
  for (const r of fillRects) {
    if (r.color === "#ffffff") continue;
    // Only real characters count: pdf.js space items can span a whole cell.
    const inside = items.filter((it) => it.str.trim() && it.x + it.w / 2 > r.x0 && it.x + it.w / 2 < r.x1 && it.y > r.y0 && it.y - it.size * 0.7 < r.y1);
    if (!inside.length) continue;
    const size = Math.max(...inside.map((it) => it.size));
    const oneLine = inside.every((it) => Math.abs(it.y - inside[0].y) < size * 0.4);
    const textX0 = Math.min(...inside.map((it) => it.x)), textX1 = Math.max(...inside.map((it) => it.x + it.w));
    const tight = r.y1 - r.y0 <= size * 1.5 && textX0 - r.x0 <= size * 0.6 && r.x1 - textX1 <= size * 0.6;
    if (!oneLine || !tight) continue;
    for (const it of inside) it.highlight = r.color;
    for (const e of r.edges) e.ignore = true; // a highlight doesn't separate lines
    svgParts[r.svgIndex] = "";
  }

  // Each run of shapes becomes one SVG cropped to its own area (small and
  // transparent elsewhere); highlights moved onto the text are left out.
  const svgFor = (group) => {
    const body = group.parts.map((i) => svgParts[i]).join("");
    if (!body || !group.bbox) return null;
    const b = { x0: Math.max(0, group.bbox.x0 - 1), y0: Math.max(0, group.bbox.y0 - 1), x1: Math.min(width, group.bbox.x1 + 1), y1: Math.min(height, group.bbox.y1 + 1) };
    if (b.x1 - b.x0 < 0.5 || b.y1 - b.y0 < 0.5) return null;
    const used = defs.filter((d) => body.includes(`url(#${/id="([^"]+)"/.exec(d)[1]})`));
    const w = b.x1 - b.x0, h = b.y1 - b.y0;
    return { x: b.x0, y: b.y0, w, h, markup: `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(w)}" height="${fmt(h)}" viewBox="${fmt(b.x0)} ${fmt(b.y0)} ${fmt(w)} ${fmt(h)}"><defs>${used.join("")}</defs>${body}</svg>` };
  };
  const drawing = [];
  for (const layer of layers) {
    if (layer.kind === "image") drawing.push(layer);
    else { const v = svgFor(layer); if (v) drawing.push({ kind: "vector", ...v }); }
  }

  return { width, height, items, images, layers: drawing, fields, rules: rules.filter((r) => !r.ignore) };
}

/** True when the path is a single axis-aligned rectangle. */
function isAxisRect(paths) {
  if (!paths || paths.length !== 1) return false;
  const p = paths[0];
  const pts = [];
  for (let i = 0; i < p.length;) {
    const op = p[i++];
    if (op === SEG.moveTo || op === SEG.lineTo) { pts.push([p[i], p[i + 1]]); i += 2; }
    else if (op === SEG.closePath) continue;
    else return false;
  }
  if (pts.length < 4 || pts.length > 5) return false;
  const xs = new Set(pts.map((q) => Math.round(q[0] * 100))), ys = new Set(pts.map((q) => Math.round(q[1] * 100)));
  return xs.size === 2 && ys.size === 2;
}

/** Device-space corners of the unit square an image is painted into. */
function unitCorners(m) {
  // Image row 0 is the TOP of the image, which sits at user-space y = 1.
  return { tl: apply(m, 0, 1), tr: apply(m, 1, 1), bl: apply(m, 0, 0), br: apply(m, 1, 0) };
}

/**
 * Splits a text item into parts with the colour/visibility of the drawing runs
 * it covers. Characters are matched by count (whitespace ignored), so the split
 * follows the actual text of each run.
 */
function splitByRuns(str, x, y, w, size, runs) {
  const tol = Math.max(2, size * 0.5);
  let covered = runs
    .filter((r) => Math.abs(r.y - y) <= tol && r.x >= x - 1 && r.x <= x + w - 0.5 && r.text.trim())
    .sort((a, b) => a.x - b.x);
  const colors = new Set(covered.map((r) => `${r.color}|${r.invisible}`));
  if (covered.length < 2 || colors.size < 2) {
    const r = nearestRun(runs, x, y, size);
    return [{ str, x, w, color: r?.color, invisible: r?.invisible }];
  }
  // Group consecutive runs of the same colour (some PDFs draw every letter as
  // its own run, e.g. justified text from Chrome), so parts only break where
  // the colour really changes.
  const groups = [];
  for (const r of covered) {
    const g = groups[groups.length - 1];
    if (g && g.color === r.color && g.invisible === r.invisible) g.text += r.text;
    else groups.push({ x: r.x, color: r.color, invisible: r.invisible, text: r.text });
  }
  covered = groups;
  const parts = [];
  let pos = 0;
  covered.forEach((r, i) => {
    let need = r.text.replace(/\s/g, "").length;
    let end = pos;
    if (i === covered.length - 1) end = str.length;
    else {
      while (end < str.length && need > 0) { if (!/\s/.test(str[end])) need--; end++; }
      while (end < str.length && /\s/.test(str[end])) end++; // trailing spaces stay with this part
    }
    if (end > pos) {
      const px = i === 0 ? x : r.x;
      const next = covered[i + 1];
      const px1 = next ? next.x : x + w;
      parts.push({ str: str.slice(pos, end), x: px, w: Math.max(0.1, px1 - px), color: r.color, invisible: r.invisible });
    }
    pos = end;
  });
  return parts.length ? parts : [{ str, x, w }];
}

function nearestRun(runs, x, y, size) {
  let best = null, bestScore = Infinity;
  for (const r of runs) {
    const dy = Math.abs(r.y - y);
    if (dy > Math.max(2, size * 0.5)) continue;
    const dx = x - r.x; // runs start at or before the item
    const score = dx >= -1 ? dx + dy * 4 : 1000 + Math.abs(dx) + dy * 4;
    if (score < bestScore) { bestScore = score; best = r; }
  }
  return best;
}

// ── Fonts ────────────────────────────────────────────────────────────────────
const FAMILY_MAP = {
  helvetica: "Arial", arial: "Arial", arialmt: "Arial", "arial narrow": "Arial Narrow",
  times: "Times New Roman", "times roman": "Times New Roman", "times new roman": "Times New Roman", timesnewroman: "Times New Roman",
  courier: "Courier New", "courier new": "Courier New", couriernew: "Courier New",
  symbol: "Symbol", zapfdingbats: "Wingdings", dingbats: "Wingdings",
};

/** { family, bold, italic } from the PDF font's PostScript name. */
export function describeFont(fontObj, style) {
  let raw = String(fontObj?.name || "").replace(/^[A-Z]{6}\+/, "");
  const lower = raw.toLowerCase();
  const bold = !!fontObj?.bold || !!fontObj?.black || /bold|black|heavy|semibold|demibold|extrabold|ultrabold|,bd|-bd\b/.test(lower);
  const italic = !!fontObj?.italic || /italic|oblique|,it\b|-it\b/.test(lower);
  // Strip style suffixes: "Arial-BoldMT" → "Arial", "Calibri,Bold" → "Calibri", "TimesNewRomanPSMT" → "TimesNewRoman".
  let family = raw.split(/[-,]/)[0].replace(/(PSMT|PS|MT)$/, "");
  family = family.replace(/(Bold|Italic|Oblique|Regular|Roman|Book|Medium|Light|Semibold|Black)+$/i, "") || family;
  // CamelCase → spaced: "SegoeUI" → "Segoe UI", "CourierNew" → "Courier New".
  family = family.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").trim();
  const mapped = FAMILY_MAP[family.toLowerCase()] || FAMILY_MAP[family.toLowerCase().replace(/\s+/g, "")];
  if (mapped) family = mapped;
  if (!family) {
    const fallback = style?.fontFamily || fontObj?.fallbackName || "sans-serif";
    family = fallback === "serif" ? "Times New Roman" : fallback === "monospace" ? "Courier New" : "Arial";
  }
  return { family, bold, italic };
}
