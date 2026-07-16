// Post-processes the raw alpha matte produced by @imgly/background-removal
// before it gets composited onto a background color.
//
// The library runs its segmentation network at a fixed 1024x1024
// resolution and upsamples the predicted mask back to the source size, but
// otherwise does NO cleanup: the RGB channels it returns are the original,
// completely unblended photo pixels, and the alpha channel is the raw
// per-pixel model confidence with no decontamination, no feathering, and
// no removal of stray misclassified specks. Compositing that directly onto
// a new background color leaks the *original* real-world background color
// through every semi-transparent edge pixel (visible as a colored
// halo/fringe around hair and shoulders), and leaves speckled artifacts
// wherever the model briefly misclassified background texture as
// foreground.
//
// This module fixes both, operating at the image's full resolution (no
// downscaling) so the refined mask maps 1:1 onto the original pixels.

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// 3x3 min filter — shrinks the alpha matte by a very small, fixed amount.
// Used both to remove single-pixel speckle (as half of an "opening") and,
// on its own, to shave the thin contaminated rim off the final edge.
function erode(alpha, w, h) {
  const out = new Uint8ClampedArray(alpha.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let min = 255;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) { min = 0; continue; }
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const v = xx < 0 || xx >= w ? 0 : alpha[yy * w + xx];
          if (v < min) min = v;
        }
      }
      out[y * w + x] = min;
    }
  }
  return out;
}

// 3x3 max filter — the other half of "opening" (erode then dilate), which
// removes small isolated noise without shrinking the main silhouette back.
function dilate(alpha, w, h) {
  const out = new Uint8ClampedArray(alpha.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let max = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          const v = alpha[yy * w + xx];
          if (v > max) max = v;
        }
      }
      out[y * w + x] = max;
    }
  }
  return out;
}

// Cheap separable box blur (edge-replicated) used only to feather the alpha
// edge by a very small, fixed radius — smooths jagged/aliased pixel-stair
// edges without visibly softening the subject.
function boxBlur(alpha, w, h, radius) {
  const tmp = new Float32Array(alpha.length);
  const out = new Uint8ClampedArray(alpha.length);
  const size = radius * 2 + 1;

  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += alpha[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / size;
      const addX = Math.min(w - 1, x + radius + 1);
      const subX = Math.max(0, x - radius);
      sum += alpha[row + addX] - alpha[row + subX];
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = Math.round(sum / size);
      const addY = Math.min(h - 1, y + radius + 1);
      const subY = Math.max(0, y - radius);
      sum += tmp[addY * w + x] - tmp[subY * w + x];
    }
  }
  return out;
}

// Removes small isolated islands of high-alpha pixels (misclassified
// background texture, stray specks) via 4-connected flood fill, while
// keeping any component that's a meaningful fraction of the largest one —
// so a genuinely separate body part (e.g. a hand held away from the torso)
// isn't deleted along with real noise.
function removeStrayIslands(alpha, w, h, threshold = 32, minRatioOfLargest = 0.015) {
  const n = w * h;
  const isFg = new Uint8Array(n);
  for (let i = 0; i < n; i++) isFg[i] = alpha[i] >= threshold ? 1 : 0;

  const visited = new Uint8Array(n);
  const labels = new Int32Array(n).fill(-1);
  const stack = new Int32Array(n);
  const sizes = [];
  let label = 0;

  for (let start = 0; start < n; start++) {
    if (!isFg[start] || visited[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    visited[start] = 1;
    let count = 0;
    while (sp > 0) {
      const p = stack[--sp];
      labels[p] = label;
      count++;
      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0) { const q = p - 1; if (isFg[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (x < w - 1) { const q = p + 1; if (isFg[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (y > 0) { const q = p - w; if (isFg[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
      if (y < h - 1) { const q = p + w; if (isFg[q] && !visited[q]) { visited[q] = 1; stack[sp++] = q; } }
    }
    sizes.push(count);
    label++;
  }

  if (sizes.length <= 1) return alpha;

  const largest = Math.max(...sizes);
  const minSize = largest * minRatioOfLargest;
  const keep = sizes.map((s) => s >= minSize);

  const out = new Uint8ClampedArray(alpha);
  for (let i = 0; i < n; i++) {
    if (isFg[i] && !keep[labels[i]]) out[i] = 0;
  }
  return out;
}

// Estimates the true local background color under each translucent edge
// pixel by diffusing outward a few pixels from confidently-background
// pixels (raw alpha ~0, whose RGB is guaranteed by the library to be the
// real, unblended original pixel). Only the boundary band needs an
// estimate, so a handful of diffusion passes is enough — no full inpaint.
function estimateLocalBackground(rgba, alpha, w, h, iterations = 6) {
  const n = w * h;
  const bg = new Float32Array(n * 3);
  let frontier = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    if (alpha[i] < 8) {
      bg[i * 3] = rgba[i * 4];
      bg[i * 3 + 1] = rgba[i * 4 + 1];
      bg[i * 3 + 2] = rgba[i * 4 + 2];
      frontier[i] = 1;
    }
  }

  for (let it = 0; it < iterations; it++) {
    const next = new Uint8Array(frontier);
    let changed = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (frontier[i]) continue;
        let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
        if (x > 0 && frontier[i - 1]) { sumR += bg[(i - 1) * 3]; sumG += bg[(i - 1) * 3 + 1]; sumB += bg[(i - 1) * 3 + 2]; cnt++; }
        if (x < w - 1 && frontier[i + 1]) { sumR += bg[(i + 1) * 3]; sumG += bg[(i + 1) * 3 + 1]; sumB += bg[(i + 1) * 3 + 2]; cnt++; }
        if (y > 0 && frontier[i - w]) { sumR += bg[(i - w) * 3]; sumG += bg[(i - w) * 3 + 1]; sumB += bg[(i - w) * 3 + 2]; cnt++; }
        if (y < h - 1 && frontier[i + w]) { sumR += bg[(i + w) * 3]; sumG += bg[(i + w) * 3 + 1]; sumB += bg[(i + w) * 3 + 2]; cnt++; }
        if (cnt > 0) {
          bg[i * 3] = sumR / cnt;
          bg[i * 3 + 1] = sumG / cnt;
          bg[i * 3 + 2] = sumB / cnt;
          next[i] = 1;
          changed = true;
        }
      }
    }
    frontier = next;
    if (!changed) break;
  }

  return { bg, known: frontier };
}

// Takes the raw ImageBitmap returned by @imgly/background-removal and
// returns a same-size canvas with a decontaminated, cleaned-up matte:
// decontaminate edge colors -> level remap -> despeckle -> drop stray
// islands -> shave a hairline rim -> feather. All amounts are deliberately
// tiny (1-2px) so thin details (hair strands, ear edges) survive.
export function refineCutout(cutoutBitmap) {
  const w = cutoutBitmap.width;
  const h = cutoutBitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(cutoutBitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const n = w * h;

  const rawAlpha = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) rawAlpha[i] = data[i * 4 + 3];

  // Decontaminate: recover the true foreground color for translucent edge
  // pixels, using the raw (pre-cleanup) alpha and a local background
  // estimate, so old-background hue can't bleed through after compositing.
  const { bg, known } = estimateLocalBackground(data, rawAlpha, w, h);
  for (let i = 0; i < n; i++) {
    const a = rawAlpha[i] / 255;
    if (a > 0.02 && a < 0.98 && known[i]) {
      const idx = i * 4;
      const safeA = Math.max(a, 0.15);
      data[idx] = clamp255((data[idx] - (1 - a) * bg[i * 3]) / safeA);
      data[idx + 1] = clamp255((data[idx + 1] - (1 - a) * bg[i * 3 + 1]) / safeA);
      data[idx + 2] = clamp255((data[idx + 2] - (1 - a) * bg[i * 3 + 2]) / safeA);
    }
  }

  // Level remap: crush near-empty/near-full confidence to clean extremes
  // so low-confidence background haze disappears instead of showing up as
  // a faint ghost, while keeping a smooth ramp across real edges.
  let alpha = rawAlpha;
  const lo = 12, hi = 240;
  for (let i = 0; i < n; i++) {
    const a = alpha[i];
    alpha[i] = a <= lo ? 0 : a >= hi ? 255 : Math.round(((a - lo) / (hi - lo)) * 255);
  }

  // Opening (erode then dilate, 1px) removes single-pixel speckle noise
  // without shrinking the main silhouette.
  alpha = dilate(erode(alpha, w, h), w, h);

  // Drop any remaining stray islands (larger patches of misclassified
  // background) while preserving separate, sizeable body parts.
  alpha = removeStrayIslands(alpha, w, h);

  // Shave a hairline (1px) rim off the whole boundary — this is where any
  // residual contamination concentrates even after decontamination above —
  // then feather with a small blur for smooth, anti-aliased edges.
  alpha = erode(alpha, w, h);
  alpha = boxBlur(alpha, w, h, 1);

  for (let i = 0; i < n; i++) data[i * 4 + 3] = alpha[i];

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
