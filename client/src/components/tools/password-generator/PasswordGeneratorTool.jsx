import { useCallback, useEffect, useRef, useState } from "react";
import { FieldLabel, inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { ErrorPanel, Checkbox } from "../fha-loan-calculator/MortgageResultParts";
import { Section } from "../calculator-ui/EncodeDecodeParts";
import { mono, linkBtn } from "../calculator-ui/encodeDecodeStyles";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { copyText } from "../../../utils/cpsExport";
import {
  generatePassword, clampLength, sanitizeSettings, MIN_LENGTH, SLIDER_MAX, MAX_LENGTH,
} from "../../../utils/passwordGeneratorEngine";

const STORAGE_KEY = "tolz-password-generator-settings";
// Like the reference, each generation flashes through 20 random passwords, 50 ms apart; the last one stays.
const FRAMES = 20;
const FRAME_MS = 50;

const STRENGTH_COLORS = {
  "Very Weak": "var(--error)",
  Weak: "var(--warning)",
  Good: "color-mix(in srgb, var(--success) 65%, var(--warning))",
  Strong: "var(--success)",
  "Very Strong": "color-mix(in srgb, var(--success) 75%, #000)",
};

const OPTIONS = [
  { key: "lower", label: <>Include Lower Case (a-z)</> },
  { key: "upper", label: <>Include Upper Case (A-Z)</> },
  { key: "numbers", label: <>Include Numbers (0-9)</> },
  { key: "symbols", label: <>Include Symbols (<span style={mono}>!&quot;#$%&amp;&apos;()*+,-./:;&lt;=&gt;?@[\]^_`{"{|}"}~</span>)</> },
  { key: "excludeAmbiguous", label: <><u>Exclude</u> Ambiguous Characters (<span style={mono}>iIl1L| o0O `&apos;-_&quot;:;.,</span>)</> },
  { key: "excludeBrackets", label: <><u>Exclude</u> Brackets (<span style={mono}>&lt;&gt;()[]{"{}"}</span>)</> },
  { key: "noRepeat", label: <>No Repeated Characters</> },
];

const smallBtn = { ...linkBtn, fontSize: 13 };

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 3.5V3a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 002 3v6a1.5 1.5 0 001.5 1.5H4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StrengthMeter({ strength }) {
  const color = STRENGTH_COLORS[strength.label];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 150 }}>
      <strong style={{ color, fontSize: 14, fontFamily: "var(--font-display)" }}>{strength.label}</strong>
      <div style={{ display: "flex", gap: 3 }} role="img" aria-label={`${strength.bars} of 5 strength bars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i <= strength.bars ? color : "var(--bg-muted)", border: "1px solid var(--border)" }} />
        ))}
      </div>
    </div>
  );
}

function PasswordResult({ result, animating, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!result) return <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Generating…</p>;
  if (result.error) return <ErrorPanel messages={[result.error]} />;

  const copy = async () => {
    const ok = await copyText(result.password);
    setCopied(ok ? "Copied!" : "Copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <>
      <div
        style={{
          ...mono, fontSize: result.length > 40 ? 16 : 24, fontWeight: 700, color: "var(--text-primary)", overflowWrap: "anywhere",
          wordBreak: "break-all", padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-light)",
          border: "1px solid var(--accent)", marginBottom: 14, maxHeight: 320, overflowY: "auto",
        }}
        aria-label={animating ? "Generating password" : "Generated password"}
      >
        {result.password}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "10px 16px", fontSize: 13.5, color: "var(--text-primary)" }}>
        <span>Password Strength:</span>
        <StrengthMeter strength={result.strength} />
        <span>Password Entropy:</span>
        <strong>{result.entropy} bits</strong>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <button type="button" style={smallBtn} onClick={copy} disabled={animating}><CopyIcon />{copied || "Copy Password"}</button>
        <button type="button" style={smallBtn} onClick={onRegenerate}><RefreshIcon />Regenerate</button>
      </div>
    </>
  );
}

export default function PasswordGeneratorTool() {
  // Saved Settings (preferences only, never the password) live in this browser's storage.
  const [saved, setSaved] = useLocalStorage(STORAGE_KEY, null);
  const [settings, setSettings] = useState(() => sanitizeSettings(saved));
  const [lengthText, setLengthText] = useState(() => String(sanitizeSettings(saved).length));
  const [result, setResult] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const timer = useRef(null);

  const generate = useCallback((s) => {
    clearTimeout(timer.current);
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frame = reduce ? FRAMES - 1 : 0;
    const step = () => {
      const r = generatePassword(s);
      frame++;
      const done = frame >= FRAMES || Boolean(r.error);
      setSavedNote(false); // the reference clears "Saved!" whenever it generates
      setResult(r);
      setAnimating(!done);
      if (!done) timer.current = setTimeout(step, FRAME_MS);
    };
    timer.current = setTimeout(step, reduce ? 0 : FRAME_MS);
  }, []);

  // A password is generated when the page opens, as on the reference.
  useEffect(() => {
    generate(settings);
    return () => clearTimeout(timer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    generate(next);
  };

  const onLengthText = (text) => {
    setLengthText(text);
    const n = Number(text);
    if (text.trim() !== "" && Number.isInteger(n) && n >= MIN_LENGTH && n <= MAX_LENGTH && n !== settings.length) update({ length: n });
  };
  const commitLength = () => {
    const n = clampLength(lengthText);
    setLengthText(String(n));
    if (n !== settings.length) update({ length: n });
  };
  const onSlider = (n) => { setLengthText(String(n)); update({ length: n }); };

  const save = () => { setSaved(settings); setSavedNote(true); };

  const form = (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <label htmlFor="pw-length"><FieldLabel>Password Length</FieldLabel></label>
        <input
          id="pw-length" type="number" inputMode="numeric" min={MIN_LENGTH} max={MAX_LENGTH} step={1} value={lengthText}
          onChange={(e) => onLengthText(e.target.value)}
          onBlur={commitLength}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitLength(); } }}
          style={{ ...inputStyle, background: "var(--bg-white)" }}
        />
        <input
          type="range" min={MIN_LENGTH} max={SLIDER_MAX} step={1} value={Math.min(settings.length, SLIDER_MAX)}
          onChange={(e) => onSlider(Number(e.target.value))}
          aria-label="Password length slider" aria-valuetext={`${settings.length} characters`}
          style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
        />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Slider: {MIN_LENGTH}–{SLIDER_MAX}. Type up to {MAX_LENGTH.toLocaleString("en-US")} in the box.
        </span>
      </div>
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
        <legend style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Password options</legend>
        {OPTIONS.map((o) => (
          <Checkbox key={o.key} checked={settings[o.key]} onChange={(v) => update({ [o.key]: v })}>
            <span style={{ fontWeight: 500, overflowWrap: "anywhere" }}>{o.label}</span>
          </Checkbox>
        ))}
      </fieldset>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
        <button
          type="button" onClick={() => generate(settings)}
          style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}
        >
          Generate
        </button>
        <button type="button" onClick={save} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>
          {savedNote ? "Saved!" : "Save Settings"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
        Save Settings keeps these options (not the password) in this browser for your next visit.
      </p>
    </>
  );

  return (
    <Section
      id="pw-tool" banner="Password" busy={animating}
      intro="This tool can generate secure, strong, random passwords. To ensure security, the password is generated completely on this page, in your browser, without being sent across the internet."
      form={form}
      result={<PasswordResult result={result} animating={animating} onRegenerate={() => generate(settings)} />}
    />
  );
}
