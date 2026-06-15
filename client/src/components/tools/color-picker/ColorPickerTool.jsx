import { useState, useRef, useEffect, useCallback } from "react";
import {
  hslToRgb, hslToHex, hexToHsl,
  rgbToHex, formatRgb, formatHsl, formatHex,
  isValidHex, normalizeHex,
  getShades, getComplementary, getAnalogous,
  getTriadic, getSplitComplementary, getTetradic,
  getContrastRatio, wcagGrade,
  exportCssVars,
} from "../../../utils/colorUtils";

// ── Shared label style ────────────────────────────────────────
const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 8,
  userSelect: "none",
};

// ── Copy button with 2-second success state ───────────────────
function CopyBtn({ text, small = false }) {
  const [ok, setOk]   = useState(false);
  const timer         = useRef(null);

  const copy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = Object.assign(document.createElement("textarea"), {
        value: text,
        style: "position:fixed;opacity:0",
      });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setOk(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOk(false), 1800);
  }, [text]);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={copy}
      disabled={!text}
      style={{
        padding: small ? "6px 10px" : "9px 14px",
        fontSize: small ? 12 : 13,
        flexShrink: 0,
        minWidth: small ? 60 : 70,
        background: ok ? "#f0fdf4" : undefined,
        color: ok ? "#16a34a" : undefined,
        borderColor: ok ? "#bbf7d0" : undefined,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      {ok ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Format row (label + mono value + copy) ────────────────────
function FormatRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 11, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.08em",
        minWidth: 32, flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, background: "var(--bg-muted)",
        borderRadius: "var(--radius-md)", padding: "10px 14px",
        fontFamily: "monospace", fontSize: 14.5, fontWeight: 600,
        color: "var(--text-primary)", letterSpacing: "0.04em",
        border: "1px solid var(--border)", overflow: "hidden",
        whiteSpace: "nowrap", textOverflow: "ellipsis",
      }}>
        {value}
      </div>
      <CopyBtn text={value} />
    </div>
  );
}

// ── HSL slider with gradient track ───────────────────────────
function ColorSlider({ label, value, min, max, gradient, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={LBL}>{label}</label>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 13, color: "var(--text-secondary)",
        }}>
          {Math.round(value)}{label === "Hue" ? "°" : "%"}
        </span>
      </div>
      <div style={{ position: "relative", height: 28 }}>
        {/* Gradient track */}
        <div style={{
          position: "absolute", top: 8, left: 0, right: 0, height: 12,
          borderRadius: 99, background: gradient,
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.18)",
          pointerEvents: "none",
        }} />
        <input
          type="range"
          className="cp-slider"
          min={min} max={max} step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

// ── Palette swatch ────────────────────────────────────────────
function Swatch({ hex, label, current = false, onClick, size = 40 }) {
  const [hovered, setHovered] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const timer = useRef(null);

  function handleClick() {
    if (onClick) { onClick(hex); return; }
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    }).catch(() => {});
  }

  return (
    <div
      title={`${label ? label + " — " : ""}${hex} (click to copy)`}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: size, height: size,
          borderRadius: "var(--radius-md)",
          background: hex,
          border: current
            ? "3px solid var(--accent)"
            : hovered ? "2.5px solid rgba(0,0,0,0.25)" : "2px solid rgba(0,0,0,0.1)",
          cursor: "pointer",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s, border 0.15s",
          boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.12)",
          flexShrink: 0,
          outline: "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {copied && (
          <span style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            color: "#fff", fontSize: 12, fontFamily: "var(--font-display)", fontWeight: 700,
          }}>
            ✓
          </span>
        )}
      </button>
      {label && (
        <span style={{
          fontFamily: "var(--font-display)", fontSize: 10.5,
          color: "var(--text-muted)", fontWeight: 500,
          maxWidth: size + 10, textAlign: "center",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Contrast badge ────────────────────────────────────────────
function ContrastBadge({ ratio, against }) {
  const grade = wcagGrade(ratio);
  return (
    <div style={{
      flex: 1, background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
      padding: "12px 14px", border: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        vs {against}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20,
          color: "var(--text-primary)", letterSpacing: "-0.03em",
        }}>
          {ratio}:1
        </span>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: grade.color,
          padding: "2px 7px", borderRadius: 99,
          background: grade.color + "22",
        }}>
          {grade.label}
        </span>
      </div>
    </div>
  );
}

// ── Main tool ─────────────────────────────────────────────────
const INITIAL_HSL = { h: 220, s: 85, l: 55 }; // vivid blue
const MAX_FAVORITES = 16;
const HARMONY_LABELS = {
  complementary:      "Complementary",
  analogous:          "Analogous",
  triadic:            "Triadic",
  splitComplementary: "Split-Comp",
  tetradic:           "Tetradic",
};

export default function ColorPickerTool() {
  const [hsl,        setHsl]        = useState(INITIAL_HSL);
  const [hexInput,   setHexInput]   = useState("");
  const [hexError,   setHexError]   = useState(false);
  const [favorites,  setFavorites]  = useState([]);
  const [activeHarm, setActiveHarm] = useState("complementary");
  const [exported,   setExported]   = useState(false);
  const [eyeErr,     setEyeErr]     = useState(false);

  const colorInputRef = useRef(null);
  const hexInputRef   = useRef(null);
  const hexFocused    = useRef(false);
  const exportTimer   = useRef(null);

  // ── Derived values ─────────────────────────────────────────
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  const hex = hslToHex(hsl.h, hsl.s, hsl.l);

  const hexStr = formatHex(hex);
  const rgbStr = formatRgb(rgb.r, rgb.g, rgb.b);
  const hslStr = formatHsl(hsl.h, hsl.s, hsl.l);

  // Contrast ratios against white and black
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0,   g: 0,   b: 0 };
  const ratioWhite = getContrastRatio(rgb, white);
  const ratioBlack = getContrastRatio(rgb, black);

  // Is this color better shown with white or black text?
  const textOnColor = ratioWhite >= ratioBlack ? "#ffffff" : "#000000";

  // Palettes
  const shades = getShades(hsl.h, hsl.s);

  const harmonies = {
    complementary:      getComplementary(hsl.h, hsl.s, hsl.l),
    analogous:          getAnalogous(hsl.h, hsl.s, hsl.l),
    triadic:            getTriadic(hsl.h, hsl.s, hsl.l),
    splitComplementary: getSplitComplementary(hsl.h, hsl.s, hsl.l),
    tetradic:           getTetradic(hsl.h, hsl.s, hsl.l),
  };

  // Sync hex input when HSL changes (but not while user is editing hex)
  useEffect(() => {
    if (!hexFocused.current) {
      setHexInput(hexStr);
      setHexError(false);
    }
  }, [hexStr]);

  // ── Handlers ──────────────────────────────────────────────

  // Native <input type="color"> gives a #RRGGBB hex string
  function handleNativeColorChange(e) {
    const newHsl = hexToHsl(e.target.value);
    setHsl(newHsl);
  }

  function handleHexInputChange(val) {
    setHexInput(val);
    const candidate = val.startsWith("#") ? val : "#" + val;
    if (isValidHex(candidate)) {
      setHexError(false);
      const newHsl = hexToHsl(normalizeHex(candidate));
      setHsl(newHsl);
    } else {
      setHexError(val.length > 1);
    }
  }

  function handleHexBlur() {
    hexFocused.current = false;
    if (hexError || !isValidHex(hexInput.startsWith("#") ? hexInput : "#" + hexInput)) {
      setHexInput(hexStr);
      setHexError(false);
    }
  }

  function handleSlider(key, val) {
    setHsl(prev => ({ ...prev, [key]: val }));
  }

  function applyHex(h) {
    const newHsl = hexToHsl(h);
    setHsl(newHsl);
  }

  function addFavorite() {
    setFavorites(prev => {
      if (prev.includes(hex)) return prev;
      return [hex, ...prev].slice(0, MAX_FAVORITES);
    });
  }

  function removeFavorite(h) {
    setFavorites(prev => prev.filter(f => f !== h));
  }

  async function handleEyedropper() {
    if (!("EyeDropper" in window)) { setEyeErr(true); return; }
    try {
      setEyeErr(false);
      const dropper = new window.EyeDropper();
      const { sRGBHex } = await dropper.open();
      applyHex(sRGBHex);
    } catch { /* user cancelled */ }
  }

  async function handleExportCss() {
    const css = exportCssVars(hexStr, rgb, hsl, shades);
    try { await navigator.clipboard.writeText(css); } catch { /* ignore */ }
    setExported(true);
    clearTimeout(exportTimer.current);
    exportTimer.current = setTimeout(() => setExported(false), 2000);
  }

  // Gradient strings for sliders
  const hueGradient = [0, 60, 120, 180, 240, 300, 360]
    .map(h => `hsl(${h}, ${hsl.s}%, ${hsl.l}%)`)
    .join(", ");
  const satGradient =
    `hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%)`;
  const litGradient =
    `hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Scoped CSS for slider thumb + swatches ── */}
      <style>{`
        .cp-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
        }
        .cp-slider::-webkit-slider-runnable-track {
          height: 28px;
          background: transparent;
        }
        .cp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid rgba(0,0,0,0.22);
          box-shadow: 0 2px 8px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.6);
          margin-top: 2px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .cp-slider:hover::-webkit-slider-thumb,
        .cp-slider:focus::-webkit-slider-thumb {
          transform: scale(1.15);
        }
        .cp-slider::-moz-range-track {
          height: 28px;
          background: transparent;
          border: none;
        }
        .cp-slider::-moz-range-thumb {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid rgba(0,0,0,0.22);
          box-shadow: 0 2px 8px rgba(0,0,0,0.28);
          cursor: pointer;
        }
        .cp-hex-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(59,123,252,0.12) !important;
        }
        .cp-hex-error {
          border-color: var(--error) !important;
        }
        .cp-harm-tab {
          padding: 6px 10px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border);
          background: var(--bg-white);
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 12px;
          color: var(--text-secondary);
          transition: all var(--transition);
          white-space: nowrap;
        }
        .cp-harm-tab:hover { background: var(--bg-muted); color: var(--text-primary); }
        .cp-harm-tab.cp-harm-active {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
        }
        .cp-fav-swatch {
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.08);
          transition: transform 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .cp-fav-swatch:hover { transform: scale(1.1); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
      `}</style>

      {/* ── Color preview + picker ── */}
      <div className="card animate-fadeUp" style={{ overflow: "hidden" }}>

        {/* Full-width color preview */}
        <div
          onClick={() => colorInputRef.current?.click()}
          style={{
            height: 140,
            background: hex,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.1s",
          }}
        >
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: 26, letterSpacing: "-0.02em",
            color: textOnColor,
            opacity: 0.8,
            userSelect: "none",
          }}>
            {hexStr}
          </span>
          <span style={{
            position: "absolute", bottom: 10, right: 14,
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5,
            color: textOnColor, opacity: 0.55, userSelect: "none",
          }}>
            Click to open picker
          </span>
          {/* Hidden native color input */}
          <input
            ref={colorInputRef}
            type="color"
            value={rgbToHex(rgb.r, rgb.g, rgb.b).toLowerCase()}
            onChange={handleNativeColorChange}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            tabIndex={-1}
          />
        </div>

        {/* Controls row */}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            {/* HEX input */}
            <div style={{ flex: 1, position: "relative" }}>
              <label style={{ ...LBL, marginBottom: 6 }}>HEX</label>
              <input
                ref={hexInputRef}
                type="text"
                className={`cp-hex-input${hexError ? " cp-hex-error" : ""}`}
                value={hexInput}
                onChange={e => handleHexInputChange(e.target.value)}
                onFocus={() => { hexFocused.current = true; }}
                onBlur={handleHexBlur}
                maxLength={7}
                spellCheck={false}
                placeholder="#000000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-white)",
                  border: `1.5px solid ${hexError ? "var(--error)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  fontFamily: "monospace",
                  fontSize: 16, fontWeight: 700,
                  color: "var(--text-primary)",
                  outline: "none",
                  letterSpacing: "0.06em",
                  transition: "border-color var(--transition), box-shadow var(--transition)",
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addFavorite}
                title="Save to favorites"
                style={{ fontSize: 13, padding: "10px 14px", flexShrink: 0 }}
              >
                ♡ Save
              </button>
              {"EyeDropper" in window ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleEyedropper}
                  title="Pick color from screen"
                  style={{ fontSize: 13, padding: "8px 14px", flexShrink: 0 }}
                >
                  💉 Pick
                </button>
              ) : null}
            </div>
          </div>

          {hexError && (
            <div style={{
              fontSize: 12.5, color: "var(--error)",
              fontFamily: "var(--font-display)", fontWeight: 500,
            }}>
              Invalid hex — enter a format like #FF5A5F or #F5A
            </div>
          )}
        </div>
      </div>

      {/* ── HSL Sliders ── */}
      <div className="card animate-fadeUp delay-100" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Adjust Color
        </div>

        <ColorSlider
          label="Hue"
          value={hsl.h}
          min={0} max={359}
          gradient={`linear-gradient(to right, ${hueGradient})`}
          onChange={v => handleSlider("h", v)}
        />
        <ColorSlider
          label="Saturation"
          value={hsl.s}
          min={0} max={100}
          gradient={`linear-gradient(to right, ${satGradient})`}
          onChange={v => handleSlider("s", v)}
        />
        <ColorSlider
          label="Lightness"
          value={hsl.l}
          min={0} max={100}
          gradient={`linear-gradient(to right, ${litGradient})`}
          onChange={v => handleSlider("l", v)}
        />
      </div>

      {/* ── Color formats ── */}
      <div className="card animate-fadeUp delay-100" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 4,
        }}>
          Color Formats
        </div>
        <FormatRow label="HEX" value={hexStr} />
        <FormatRow label="RGB" value={rgbStr} />
        <FormatRow label="HSL" value={hslStr} />

        {/* CSS export */}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleExportCss}
          style={{
            alignSelf: "flex-start", fontSize: 12.5, marginTop: 4,
            padding: "7px 12px",
            background: exported ? "#f0fdf4" : undefined,
            color: exported ? "#16a34a" : undefined,
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {exported ? "✓ CSS variables copied!" : "⎘ Copy as CSS variables"}
        </button>
      </div>

      {/* ── Shades ── */}
      <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Shades & Tints
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
          {shades.map(shade => {
            const isCurrent = Math.abs(shade.hsl.l - hsl.l) < 6;
            return (
              <Swatch
                key={shade.hsl.l}
                hex={shade.hex}
                label={shade.label}
                current={isCurrent}
                onClick={applyHex}
                size={44}
              />
            );
          })}
        </div>
        <p style={{
          fontSize: 12, color: "var(--text-muted)",
          fontFamily: "var(--font-display)", fontWeight: 500, margin: 0,
        }}>
          Click any shade to apply it · Blue ring = closest to current
        </p>
      </div>

      {/* ── Color harmonies ── */}
      <div className="card animate-fadeUp delay-200" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Color Harmonies
        </div>

        {/* Harmony tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {Object.keys(harmonies).map(key => (
            <button
              key={key}
              type="button"
              className={`cp-harm-tab${activeHarm === key ? " cp-harm-active" : ""}`}
              onClick={() => setActiveHarm(key)}
            >
              {HARMONY_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Active harmony swatches */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          {harmonies[activeHarm].map((color, i) => (
            <Swatch
              key={i}
              hex={color.hex}
              label={color.label}
              current={color.hex === hex}
              onClick={applyHex}
              size={52}
            />
          ))}
        </div>
        <p style={{
          fontSize: 12, color: "var(--text-muted)",
          fontFamily: "var(--font-display)", fontWeight: 500, margin: 0,
        }}>
          Click any swatch to apply · Swatches copy on click if no action
        </p>
      </div>

      {/* ── WCAG Contrast ── */}
      <div className="card animate-fadeUp delay-300" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Accessibility — WCAG Contrast
        </div>

        {/* Visual preview */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { bg: hex, fg: "#ffffff", label: "White text on color" },
            { bg: hex, fg: "#000000", label: "Black text on color" },
            { bg: "#ffffff", fg: hex, label: "Color on white" },
          ].map(({ bg, fg, label }) => (
            <div
              key={label}
              style={{
                flex: 1,
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border)",
                minWidth: 0,
              }}
            >
              <div style={{
                background: bg, color: fg,
                padding: "10px 10px 8px",
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 14,
                textAlign: "center", lineHeight: 1.3,
              }}>
                Aa
              </div>
              <div style={{
                background: "var(--bg-muted)",
                padding: "5px 8px",
                fontFamily: "var(--font-display)", fontSize: 10.5,
                color: "var(--text-muted)", textAlign: "center",
                fontWeight: 500,
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Ratio numbers */}
        <div style={{ display: "flex", gap: 10 }}>
          <ContrastBadge ratio={ratioWhite} against="White" />
          <ContrastBadge ratio={ratioBlack} against="Black" />
        </div>

        <div style={{
          fontSize: 12, color: "var(--text-muted)",
          fontFamily: "var(--font-display)", fontWeight: 500,
        }}>
          WCAG AA: 4.5:1 normal text / 3:1 large text · WCAG AAA: 7:1 normal text
        </div>
      </div>

      {/* ── Session Favorites ── */}
      <div className="card animate-fadeUp delay-300" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
            color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Saved Colors ({favorites.length}/{MAX_FAVORITES})
          </div>
          {favorites.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setFavorites([])}
              style={{ fontSize: 12, padding: "4px 10px", color: "var(--text-muted)" }}
            >
              Clear all
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "24px 16px",
            background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
            border: "2px dashed var(--border)",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎨</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5,
              color: "var(--text-secondary)",
            }}>
              No saved colors yet
            </div>
            <div style={{
              fontSize: 12.5, color: "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 4,
            }}>
              Click ♡ Save to add the current color
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {favorites.map(fav => (
              <div key={fav} style={{ position: "relative" }}>
                <button
                  type="button"
                  className="cp-fav-swatch"
                  title={`${fav} — click to apply`}
                  onClick={() => applyHex(fav)}
                  style={{
                    width: 42, height: 42,
                    background: fav,
                    border: fav === hex ? "3px solid var(--accent)" : "2px solid rgba(0,0,0,0.1)",
                    display: "block",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeFavorite(fav)}
                  title="Remove"
                  style={{
                    position: "absolute", top: -5, right: -5,
                    width: 17, height: 17,
                    borderRadius: "50%",
                    background: "var(--bg-card)",
                    border: "1.5px solid var(--border)",
                    cursor: "pointer",
                    fontSize: 9, fontWeight: 800,
                    color: "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Info note ── */}
      <div className="animate-fadeUp delay-300" style={{
        background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
        padding: "12px 16px", fontSize: 12.5,
        color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 500, display: "flex", gap: 8,
        alignItems: "flex-start", border: "1px solid var(--border)",
      }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
        <span>
          Click the color preview to open your browser's native color picker.
          Eyedropper (💉 Pick) lets you sample any color from your screen — Chrome/Edge only.
          Saved colors are session-only and cleared when you close the tab.
        </span>
      </div>
    </div>
  );
}
