import { useState } from "react";
import { FieldLabel, inputStyle } from "../mortgage-calculator/MortgageFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { StatRow, StatList } from "../calculator-ui/ResultHighlight";
import {
  Section, ActionButtons, InputTextarea, TextOutput, DownloadIcon,
} from "../calculator-ui/EncodeDecodeParts";
import { muted, fieldWrap, linkBtn, resultTitle } from "../calculator-ui/encodeDecodeStyles";
import ConversionDropZone from "../image-converter/ConversionDropZone";
import { downloadBlob } from "../../../utils/cpsExport";
import {
  CHARSETS, DEFAULT_CHARSET, FILE_OPERATIONS, OUTPUT_TYPES, MESSAGES, MAX_FILE_MB, MAX_FILE_BYTES,
  encodeText, decodeText, encodeFile, decodeFile, downloadName, formatBytes,
} from "../../../utils/base64EncodeDecodeEngine";

const fileChip = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, padding: "8px 10px",
  borderRadius: "var(--radius-sm)", background: "var(--bg-muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)",
};
const titleOf = (r) => (r.mode === "encode" ? "Encoded result" : "Decoded result");

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
          <InputTextarea id="b64-input" value={text} onChange={setText} />
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
  else body = <><TextOutput title={titleOf(result)} text={result.output} downloadAs={() => downloadName("", true)} /><Sizes result={result} /></>;

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
          <strong style={resultTitle}>Decoded result:</strong>
          <button type="button" style={linkBtn} onClick={() => saveBinary(result.binary, result.filename)}><DownloadIcon />Download</button>
        </div>
        <p style={{ ...muted, marginTop: 8 }}>The decoded file has been downloaded. Click Download to save it again.</p>
        <Sizes result={result} />
      </>
    );
  } else body = <><TextOutput title={titleOf(result)} text={result.output} downloadAs={() => downloadName(result.filename, true)} /><Sizes result={result} /></>;

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
