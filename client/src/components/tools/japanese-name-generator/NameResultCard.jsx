import { useState } from "react";
import { copyText, formatNameForCopy, formatFullNameForCopy } from "../../../utils/japaneseNameExport";
import { speakApproximatePronunciation } from "../../../utils/japaneseNameSpeech";
import { formatDisplayOrder } from "../../../utils/japaneseNameEngine";

const GENDER_LABEL = { girl: "Girl", boy: "Boy", unisex: "Unisex", unavailable: "Gender classification unavailable" };

/**
 * Displays one name result — either a single given/last-name record, or
 * a generated full-name combination (record.combinationType present).
 * Full-name combos are always visually labeled "Generated combination"
 * (this dataset never claims a full name is a verified/attested name).
 */
export default function NameResultCard({ record, nameOrder = "japanese", isFavorite, onToggleFavorite, onOpenDetails, onGenerateSimilar, isComparing, onToggleCompare }) {
  const [copied, setCopied] = useState(false);
  const isFull = !!record.combinationType;

  const handleCopy = async () => {
    const text = isFull ? formatFullNameForCopy(record, nameOrder) : formatNameForCopy(record);
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleListen = () => {
    const hiragana = isFull ? `${record.surname.hiragana}${record.given.hiragana}` : record.hiragana;
    speakApproximatePronunciation(hiragana);
  };

  const kanji = isFull
    ? nameOrder === "international" ? `${record.given.kanji}${record.surname.kanji}` : record.kanji
    : record.kanji;
  const romaji = isFull ? formatDisplayOrder(record.surname.romaji, record.given.romaji, nameOrder) : record.romaji;

  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>{kanji}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{romaji}</div>
          {!isFull && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{record.hiragana}</div>}
        </div>
        {isFull ? (
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "var(--bg-muted)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Generated combination
          </span>
        ) : record.type === "firstName" ? (
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "var(--accent-light)", color: "var(--accent)", whiteSpace: "nowrap" }}>
            {GENDER_LABEL[record.genderClassification] || GENDER_LABEL.unavailable}
          </span>
        ) : (
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "var(--bg-muted)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Surname
          </span>
        )}
      </div>

      {!isFull && record.meanings?.length > 0 && (
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
          {record.meanings.map((m) => m.text).join(" · ")}
        </div>
      )}

      {!isFull && (
        <div style={{ display: "flex", gap: 10, fontSize: 11.5, color: "var(--text-muted)" }}>
          <span>{record.kanjiCount} kanji</span>
          <span>{record.moraCount} mora</span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
        {onToggleFavorite && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "5px 10px", color: isFavorite ? "var(--accent)" : undefined }}
            onClick={() => onToggleFavorite(record)}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
        )}
        {!isFull && onOpenDetails && (
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => onOpenDetails(record)}>
            Details
          </button>
        )}
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={handleListen} aria-label="Listen to approximate pronunciation">
          🔊 Listen
        </button>
        {!isFull && onGenerateSimilar && (
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => onGenerateSimilar(record)}>
            Similar
          </button>
        )}
        {!isFull && onToggleCompare && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "5px 10px", color: isComparing ? "var(--accent)" : undefined }}
            onClick={() => onToggleCompare(record)}
            aria-pressed={isComparing}
          >
            {isComparing ? "✓ Comparing" : "+ Compare"}
          </button>
        )}
      </div>
    </div>
  );
}
