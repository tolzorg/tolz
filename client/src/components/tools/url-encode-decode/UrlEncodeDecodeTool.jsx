import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FieldLabel } from "../mortgage-calculator/MortgageFormControls";
import { ErrorPanel } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { StatRow, StatList } from "../calculator-ui/ResultHighlight";
import { Section, ActionButtons, InputTextarea, TextOutput } from "../calculator-ui/EncodeDecodeParts";
import { muted, fieldWrap } from "../calculator-ui/encodeDecodeStyles";
import { MESSAGES, encodeUrl, decodeUrl, prefillFrom } from "../../../utils/urlEncodeDecodeEngine";

const count = (s) => [...s].length.toLocaleString("en-US");

export default function UrlEncodeDecodeTool() {
  const { search } = useLocation();
  // Like the reference, ?toprocess=… only fills the box; nothing is calculated until Encode / Decode.
  const [text, setText] = useState(() => prefillFrom(search));
  const [result, setResult] = useState(null);
  const req = useRequiredFields();

  const run = (r) => {
    if (r.missing) { req.flag(r.missing); setResult(null); return; }
    req.flag([]);
    setResult({ ...r, inputLength: count(text.trim()) });
  };
  const clear = () => { setText(""); setResult(null); req.clear(); };

  const form = (
    <>
      <div style={fieldWrap}>
        <label htmlFor="url-input"><FieldLabel>Text to encode or decode</FieldLabel></label>
        <Req name="text" flagged={req.flagged}>
          <InputTextarea id="url-input" value={text} onChange={setText} />
        </Req>
      </div>
      <ActionButtons
        actions={[
          { label: "Encode", onClick: () => run(encodeUrl(text)) },
          { label: "Decode", onClick: () => run(decodeUrl(text)) },
        ]}
        onClear={clear}
      />
    </>
  );

  let body;
  if (!result) body = <p style={muted}>{MESSAGES.prompt}</p>;
  else if (result.error) body = <ErrorPanel messages={[result.error]} />;
  else {
    body = (
      <>
        <TextOutput title={result.mode === "encode" ? "Encoded result" : "Decoded result"} text={result.output} />
        <div style={{ marginTop: 12 }}>
          <StatList>
            <StatRow label="Input characters">{result.inputLength}</StatRow>
            <StatRow label="Output characters" tone="var(--accent)">{count(result.output)}</StatRow>
          </StatList>
        </div>
      </>
    );
  }

  return (
    <Section
      id="url-tool"
      intro="Use the tool below to encode or decode data to and from a URL-compatible format. To keep your data safe, the encoding and decoding are done in your browser and nothing is sent across the internet."
      form={form} result={body}
    />
  );
}
