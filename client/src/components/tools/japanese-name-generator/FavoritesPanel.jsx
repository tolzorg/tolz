import { useMemo, useState } from "react";
import { copyText, exportNamesTxt, exportNamesCsv, exportNamesJson, formatNameForCopy, formatFullNameForCopy } from "../../../utils/japaneseNameExport";
import { fuzzyIncludes } from "../../../utils/japaneseNameSearch";
import { speakApproximatePronunciation } from "../../../utils/japaneseNameSpeech";

/** Resolve a favorite entry (snapshot + optional live record) into the shape exports/copy expect. */
function resolveForExport(fav) {
  if (fav.live) return fav.live;
  // Live record no longer exists (dataset update) — degrade gracefully to the preserved snapshot.
  return fav;
}

export default function FavoritesPanel({ favorites, removeFavorite, clearFavorites, nameOrder }) {
  const [query, setQuery] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  const filtered = useMemo(
    () => (query.trim() ? favorites.filter((f) => fuzzyIncludes(f.kanji, query) || fuzzyIncludes(f.hiragana || "", query) || fuzzyIncludes(f.romaji || "", query)) : favorites),
    [favorites, query]
  );

  const handleCopyAll = async () => {
    const text = filtered
      .map((f) => (f.type === "fullName" ? formatFullNameForCopy(resolveForExport(f), nameOrder) : formatNameForCopy(resolveForExport(f))))
      .join("\n");
    if (await copyText(text)) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    }
  };

  const exportable = filtered.map(resolveForExport);

  if (favorites.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
        No favorites yet. Use the ☆ Favorite button on any name to save it here.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="text"
          className="input"
          style={{ width: "100%", padding: "10px 12px" }}
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your favorites"
          aria-label="Search favorites"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={handleCopyAll}>{copiedAll ? "Copied!" : "Copy All"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => exportNamesTxt(exportable, "japanese-name-favorites")}>Export .txt</button>
          <button type="button" className="btn btn-ghost" onClick={() => exportNamesCsv(exportable, "japanese-name-favorites")}>Export .csv</button>
          <button type="button" className="btn btn-ghost" onClick={() => exportNamesJson(exportable, "japanese-name-favorites")}>Export .json</button>
          <button type="button" className="btn btn-danger" onClick={clearFavorites}>Clear All</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {filtered.map((f) => {
          const record = resolveForExport(f);
          return (
            <div key={f.id} className="card" style={{ padding: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>{record.kanji}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{record.romaji}</div>
              {record.hiragana && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{record.hiragana}</div>}
              {!f.live && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  (Saved details — this record is no longer in the current dataset.)
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => speakApproximatePronunciation(record.hiragana || "")}>
                  🔊 Listen
                </button>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => copyText(formatNameForCopy(record))}>
                  Copy
                </button>
                <button type="button" className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => removeFavorite(f.id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
