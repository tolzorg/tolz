import { useState } from "react";
import { copyText } from "../../../utils/japaneseNameExport";
import { speakApproximatePronunciation } from "../../../utils/japaneseNameSpeech";

const MAX_LENGTH = 80;

export default function MyNameInJapanesePanel({ foreignName, setForeignName, foreignNameResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!foreignNameResult) return;
    if (await copyText(foreignNameResult.katakana)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
          Enter your name
        </label>
        <input
          type="text"
          className="input"
          style={{ width: "100%", padding: "10px 12px" }}
          value={foreignName}
          maxLength={MAX_LENGTH}
          onChange={(e) => setForeignName(e.target.value)}
          placeholder="e.g. James, Emily, Sarah"
          aria-label="Enter your name to convert to Japanese phonetic transcription"
        />
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8, marginBottom: 0 }}>
          This produces an <strong>approximate Japanese phonetic transcription</strong> (Katakana), the way foreign
          names are commonly written phonetically in Japanese. It is <strong>not</strong> your "official" Japanese
          name — Japanese phonetic conventions don't map perfectly onto every language's pronunciation or spelling.
        </p>
      </div>

      {foreignNameResult && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Katakana (phonetic transcription)
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--text-primary)", marginBottom: 10 }}>
            {foreignNameResult.katakana}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Hiragana: {foreignNameResult.hiragana}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Romaji: {foreignNameResult.romaji}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={() => speakApproximatePronunciation(foreignNameResult.katakana)}>
              🔊 Listen (approximate pronunciation)
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>{copied ? "Copied!" : "Copy Katakana"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
