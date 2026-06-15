// ── Color conversion utilities ────────────────────────────────
// All HSL values use degrees (H: 0–359) and percentages (S, L: 0–100).
// All RGB values are integers (0–255).

// ── Core conversions ──────────────────────────────────────────

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full  = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >>  8) & 0xff,
    b:  n        & 0xff,
  };
}

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d   = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if      (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else                 h = ((rn - gn) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(h, s, l) {
  const sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q  = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p  = 2 * ln - q;
  const hn = h / 360;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn)         * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ── Format strings ────────────────────────────────────────────

export function formatHex(hex) {
  return hex.toUpperCase();
}

export function formatRgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ── Validation ────────────────────────────────────────────────

const HEX_RE = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHex(val) {
  return HEX_RE.test(val.trim());
}

export function normalizeHex(val) {
  const clean = val.trim().replace(/^#/, "");
  if (clean.length === 3) return "#" + clean.split("").map(c => c + c).join("");
  return "#" + clean;
}

// ── Palette generation ────────────────────────────────────────

// 9 tonal shades from L=10% to L=90% (same H and S)
export function getShades(h, s) {
  return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(l => ({
    hex: hslToHex(h, s, l),
    hsl: { h, s, l },
    label: `${l}%`,
  }));
}

// Complementary: opposite on the color wheel
export function getComplementary(h, s, l) {
  const ch = (h + 180) % 360;
  return [
    { hex: hslToHex(h,  s, l),  label: "Base"          },
    { hex: hslToHex(ch, s, l),  label: "Complementary" },
  ];
}

// Analogous: ±30° neighbours
export function getAnalogous(h, s, l) {
  return [
    { hex: hslToHex((h - 30 + 360) % 360, s, l), label: "−30°" },
    { hex: hslToHex(h,                     s, l), label: "Base" },
    { hex: hslToHex((h + 30) % 360,        s, l), label: "+30°" },
  ];
}

// Triadic: evenly spaced 120° apart
export function getTriadic(h, s, l) {
  return [
    { hex: hslToHex(h,               s, l), label: "Base" },
    { hex: hslToHex((h + 120) % 360, s, l), label: "+120°" },
    { hex: hslToHex((h + 240) % 360, s, l), label: "+240°" },
  ];
}

// Split-complementary: complement ± 30°
export function getSplitComplementary(h, s, l) {
  return [
    { hex: hslToHex(h,               s, l), label: "Base"   },
    { hex: hslToHex((h + 150) % 360, s, l), label: "+150°"  },
    { hex: hslToHex((h + 210) % 360, s, l), label: "+210°"  },
  ];
}

// Tetradic (square): 4 evenly spaced 90° apart
export function getTetradic(h, s, l) {
  return [
    { hex: hslToHex(h,               s, l), label: "Base"  },
    { hex: hslToHex((h +  90) % 360, s, l), label: "+90°"  },
    { hex: hslToHex((h + 180) % 360, s, l), label: "+180°" },
    { hex: hslToHex((h + 270) % 360, s, l), label: "+270°" },
  ];
}

// ── WCAG contrast ─────────────────────────────────────────────

function linearize(c) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

export function getRelativeLuminance(r, g, b) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function wcagGrade(ratio) {
  if (ratio >= 7)   return { label: "AAA", color: "#16a34a" };
  if (ratio >= 4.5) return { label: "AA",  color: "#16a34a" };
  if (ratio >= 3)   return { label: "AA Large", color: "#d97706" };
  return                    { label: "Fail",     color: "#ef4444" };
}

// ── CSS variable export ───────────────────────────────────────

export function exportCssVars(hex, rgb, hslObj, shades) {
  const lines = [
    "/* Generated by Tolz Color Picker */",
    `:root {`,
    `  --color:     ${hex};`,
    `  --color-rgb: ${formatRgb(rgb.r, rgb.g, rgb.b)};`,
    `  --color-hsl: ${formatHsl(hslObj.h, hslObj.s, hslObj.l)};`,
    ...shades.map((s, i) => `  --color-${(i + 1) * 100}: ${s.hex};`),
    `}`,
  ];
  return lines.join("\n");
}
