import { useRef, useState } from "react";
import { FieldLabel, inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields, useRequiredState, requiredInputProps } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { StatRow, StatList } from "../calculator-ui/ResultHighlight";
import ConversionDropZone from "../image-converter/ConversionDropZone";
import { copyText, downloadBlob } from "../../../utils/cpsExport";
import {
  CHARSETS, DEFAULT_CHARSET, FILE_OPERATIONS, OUTPUT_TYPES, MESSAGES, MAX_FILE_MB, MAX_FILE_BYTES,
  encodeText, decodeText, encodeFile, decodeFile, downloadName, formatBytes,
} from "../../../utils/base64EncodeDecodeEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const textareaStyle = {
  ...inputStyle, ...mono, fontSize: 13, lineHeight: 1.5, minHeight: 110, resize: "vertical", background: "var(--bg-white)", wordBreak: "break-all",
};
const outputStyle = {
  ...textareaStyle, minHeight: 140, background: "var(--accent-light)", border: "1px solid var(--accent)", color: "var(--text-primary)",
};
const actionBtn = {
  flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none",
  borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer",
};
const linkBtn = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 12.5, fontWeight: 600,
  fontFamily: "var(--font-display)", color: "var(--accent)", background: "var(--bg-white)", border: "1px solid var(--accent)",
  borderRadius: "var(--radius-sm)", cursor: "pointer",
};
const fileChip = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, padding: "8px 10px",
  borderRadius: "var(--radius-sm)", background: "var(--bg-muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)",
};

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 3.5V3a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 002 3v6a1.5 1.5 0 001.5 1.5H4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Section({ title, id, intro, form, result }) {
  return (
    <section aria-labelledby={id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 id={id} style={sectionTitle}>{title}</h2>
      {intro && <p style={para}>{intro}</p>}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, padding: 18 }}>{form}</div>
        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">{result}</div>
        </div>
      </div>
    </section>
  );
}

function ActionButtons({ actions, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      {actions.map(({ label, onClick }) => (
        <button key={label} type="button" onClick={onClick} style={actionBtn}>{label}</button>
      ))}
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
    </div>
  );
}

function InputTextarea({ value, onChange }) {
  const invalid = useRequiredState(value);
  return (
    <textarea
      id="b64-input" value={value} rows={5} spellCheck={false} autoComplete="off" autoCapitalize="off"
      {...requiredInputProps(invalid, "")}
      onChange={(e) => onChange(e.target.value)}
      style={textareaStyle}
    />
  );
}

/** "Encoded result:  [copy] [download]" + the read-only output box. */
function TextOutput({ result, filename }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const title = result.mode === "encode" ? "Encoded result" : "Decoded result";
  const copy = async () => {
    const ok = await copyText(result.output);
    setCopied(ok ? "Copied!" : "Copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  const download = () => downloadBlob(result.output, downloadName(filename, true), "text/plain");
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <strong style={{ fontSize: 14, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{title}:</strong>
        <button type="button" style={linkBtn} onClick={copy} aria-label={`Copy ${title.toLowerCase()}`}><CopyIcon />{copied || "Copy"}</button>
        <button type="button" style={linkBtn} onClick={download} aria-label={`Download ${title.toLowerCase()} as a text file`}><DownloadIcon />Download</button>
      </div>
      <textarea readOnly value={result.output} rows={6} aria-label={title} spellCheck={false} style={outputStyle} />
    </>
  );
}

function Sizes({ result }) {
  return (
    <div style={{ marginTop: 12 }}>
      <StatList>
        {result.inputBytes !== undefined && <StatRow label="Input size">{formatBytes(result.inputBytes)}</StatRow>}
        {result.outputBytes !== undefined && <StatRow label="Decoded size">{formatBytes(result.outputBytes)}</StatRow>}
        {result.output !== undefined && (
          <StatRow label={result.mode === "encode" ? "Base64 length" : "Characters"} tone="var(--accent)">
            {[...result.output].length.toLocaleString("en-US")}
          </StatRow>
        )}
      </StatList>
    </div>
  );
}

/* ───────────────────────── Text ───────────────────────── */

function TextTool() {
  const [text, setText] = useState("");
  const [charset, setCharset] = useState(DEFAULT_CHARSET);
  const [result, setResult] = useState(null); // nothing until Encode / Decode
  const req = useRequiredFields();

  const run = (r) => {
    if (r.missing) { req.flag(r.missing); setResult(null); return; }
    req.flag([]);
    setResult(r);
  };
  const clear = () => { setText(""); setCharset(DEFAULT_CHARSET); setResult(null); req.clear(); };

  const form = (
    <>
      <div style={fieldWrap}>
        <label htmlFor="b64-input"><FieldLabel>Text to encode or decode</FieldLabel></label>
        <Req name="text" flagged={req.flagged}>
          <InputTextarea value={text} onChange={setText} />
        </Req>
      </div>
      <label style={fieldWrap}>
        <FieldLabel hint="Used when decoding: the character set the decoded bytes are read in. Encoding always uses UTF-8.">Character</FieldLabel>
        <SelectField value={charset} onChange={setCharset} options={CHARSETS} />
      </label>
      <ActionButtons
        actions={[
          { label: "Encode", onClick: () => run(encodeText(text)) },
          { label: "Decode", onClick: () => run(decodeText(text, charset)) },
        ]}
        onClear={clear}
      />
    </>
  );

  let body;
  if (!result) body = <p style={muted}>{MESSAGES.prompt}</p>;
  else if (result.error) body = <ErrorPanel messages={[result.error]} />;
  else body = <><TextOutput result={result} filename="" /><Sizes result={result} /></>;

  return (
    <Section
      title="Base64 Encode / Decode" id="b64-text"
      intro="Use the tools below to Base64-encode or decode text, images, and files. To keep your data safe, the encoding and decoding are done in your browser and nothing is sent across the internet."
      form={form} result={body}
    />
  );
}

/* ───────────────────────── File ───────────────────────── */

const EMPTY_FILE = () => ({ op: "en", outputType: "txt", charset: DEFAULT_CHARSET, filename: "" });

function FileTool() {
  const [v, setV] = useState(EMPTY_FILE);
  const [file, setFile] = useState(null); // { name, size, read: Promise<Uint8Array> }
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (patch) => setV((old) => ({ ...old, ...patch }));

  const pickFile = (files) => {
    const f = files && files[0];
    setResult(null);
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) { setFile(null); setFileError(MESSAGES.tooLarge); return; }
    setFileError("");
    // Read once on selection (as the reference does), in memory only.
    const read = f.arrayBuffer().then((buf) => new Uint8Array(buf));
    read.catch(() => {});
    setFile({ name: f.name, size: f.size, read });
  };
  const removeFile = () => { setFile(null); setFileError(""); setResult(null); };

  // Switching between encode and decode clears the output, like the reference.
  const changeOp = (op) => { set({ op }); setResult(null); };
  const clear = () => { setV(EMPTY_FILE()); setFile(null); setFileError(""); setResult(null); };

  const saveBinary = (bytes, filename) => downloadBlob(bytes, downloadName(filename, false), "application/octet-stream");

  const run = async () => {
    if (busy) return;
    const encode = v.op === "en";
    if (!file) { setResult({ error: encode ? MESSAGES.noFileEncode : MESSAGES.noFileDecode }); return; }
    setBusy(true);
    try {
      let bytes;
      try { bytes = await file.read; } catch { setResult({ error: MESSAGES.unreadable }); return; }
      // Settings are captured with the result, so later dropdown changes don't relabel it.
      const r = encode ? encodeFile(bytes) : decodeFile(bytes, v.outputType, v.charset);
      if (!r.error) r.filename = encode ? "" : v.filename;
      if (r.binary) saveBinary(r.binary, r.filename); // binary/image output downloads straight away
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  const decoding = v.op === "de";
  const form = (
    <>
      <label style={fieldWrap}>
        <FieldLabel>I want to</FieldLabel>
        <SelectField value={v.op} onChange={changeOp} options={FILE_OPERATIONS} />
      </label>
      <div style={{ marginBottom: 12 }}>
        <ConversionDropZone onFiles={pickFile} accept="" acceptLabel={decoding ? "Base64 text file" : "Any file"} multiple={false} maxMb={MAX_FILE_MB} />
        {file && (
          <div style={fileChip}>
            <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <strong>{file.name}</strong> <span style={{ color: "var(--text-muted)" }}>({formatBytes(file.size)})</span>
            </span>
            <button type="button" className="btn-secondary" onClick={removeFile} style={{ padding: "4px 10px", fontSize: 12 }} aria-label={`Remove ${file.name}`}>Remove</button>
          </div>
        )}
        {fileError && <div style={{ marginTop: 8 }}><ErrorPanel messages={[fileError]} /></div>}
      </div>
      {decoding && (
        <>
          <label style={fieldWrap}>
            <FieldLabel>Output file type</FieldLabel>
            <SelectField value={v.outputType} onChange={(outputType) => set({ outputType })} options={OUTPUT_TYPES} />
          </label>
          {v.outputType === "txt" && (
            <label style={fieldWrap}>
              <FieldLabel>Character</FieldLabel>
              <SelectField value={v.charset} onChange={(charset) => set({ charset })} options={CHARSETS} />
            </label>
          )}
          <label style={fieldWrap}>
            <FieldLabel hint="Optional. Leave blank for an automatic name such as base64-1234.">Output file name</FieldLabel>
            <input
              type="text" value={v.filename} maxLength={200} autoComplete="off" spellCheck={false}
              placeholder={v.outputType === "img" ? "e.g. image.png" : "e.g. decoded.txt"}
              onChange={(e) => set({ filename: e.target.value })}
              style={{ ...inputStyle, background: "var(--bg-white)" }}
            />
          </label>
        </>
      )}
      <ActionButtons actions={[{ label: busy ? "Processing…" : decoding ? "Decode" : "Encode", onClick: run }]} onClear={clear} />
    </>
  );

  let body;
  if (!result) body = <p style={muted}>{MESSAGES.filePrompt}</p>;
  else if (result.error) body = <ErrorPanel messages={[result.error]} />;
  else if (result.binary) {
    body = (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 14, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Decoded result:</strong>
          <button type="button" style={linkBtn} onClick={() => saveBinary(result.binary, result.filename)}><DownloadIcon />Download</button>
        </div>
        <p style={{ ...muted, marginTop: 8 }}>The decoded file has been downloaded. Click Download to save it again.</p>
        <Sizes result={result} />
      </>
    );
  } else body = <><TextOutput result={result} filename={result.filename} /><Sizes result={result} /></>;

  return (
    <Section
      title="Base64 Encode / Decode an Image or File" id="b64-file"
      intro={`Use the tool below to Base64-encode or decode images and files (up to ${MAX_FILE_MB} MB). For text output, the result is shown in a text box you can copy or download. For image and binary output, the file is downloaded directly. Large files can take a few seconds.`}
      form={form} result={body}
    />
  );
}

export default function Base64EncodeDecodeTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <TextTool />
      <FileTool />
    </div>
  );
}
