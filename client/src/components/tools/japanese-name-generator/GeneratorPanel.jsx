import { QUANTITIES } from "../../../utils/japaneseNameEngine";
import NameResultCard from "./NameResultCard";

const NAME_TYPES = [
  { id: "firstName", label: "First Name" },
  { id: "lastName", label: "Last Name" },
  { id: "fullName", label: "Full Name" },
];
const GENDERS = [
  { id: "any", label: "Any" },
  { id: "girl", label: "Girl" },
  { id: "boy", label: "Boy" },
  { id: "unisex", label: "Unisex" },
];
const THEMES = [
  "love", "beauty", "strength", "moon", "sun", "nature", "flower", "sky", "sea",
  "light", "spirit", "harmony", "blessing", "sincerity", "dignity",
];

export default function GeneratorPanel({
  nameType, setNameType, gender, setGender, quantity, setQuantity,
  filters, setFilters, resetFilters, generate, generatedResults, lastGenerationInfo, isGenerating,
  nameOrder, isFavorite, onToggleFavorite, onOpenDetails, onGenerateSimilar,
  compareIds, onToggleCompare,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
              Name Type
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {NAME_TYPES.map((t) => (
                <button key={t.id} type="button" className={`filter-pill ${nameType === t.id ? "active" : ""}`} onClick={() => setNameType(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {nameType !== "lastName" && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                Gender
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GENDERS.map((g) => (
                  <button key={g.id} type="button" className={`filter-pill ${gender === g.id ? "active" : ""}`} onClick={() => setGender(g.id)}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
              Quantity
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {QUANTITIES.map((q) => (
                <button key={q} type="button" className={`filter-pill ${quantity === q ? "active" : ""}`} onClick={() => setQuantity(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
              Meaning / Theme (optional)
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className={`filter-pill ${!filters.meaningTheme ? "active" : ""}`} onClick={() => setFilters({ meaningTheme: "" })}>
                Any
              </button>
              {THEMES.map((t) => (
                <button key={t} type="button" className={`filter-pill ${filters.meaningTheme === t ? "active" : ""}`} onClick={() => setFilters({ meaningTheme: t })}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              Initial (from reading)
              <input
                type="text"
                maxLength={1}
                className="input"
                style={{ width: 70, padding: "6px 10px" }}
                value={filters.initial}
                onChange={(e) => setFilters({ initial: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase() })}
                aria-label="Filter by first letter of the selected reading"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              Kanji count
              <input
                type="number"
                min="1"
                max="4"
                className="input"
                style={{ width: 80, padding: "6px 10px" }}
                value={filters.kanjiCount}
                onChange={(e) => setFilters({ kanjiCount: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              Mora count
              <input
                type="number"
                min="1"
                max="6"
                className="input"
                style={{ width: 80, padding: "6px 10px" }}
                value={filters.moraCount}
                onChange={(e) => setFilters({ moraCount: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={generate} disabled={isGenerating} aria-busy={isGenerating}>
              {isGenerating ? "Generating…" : "Generate"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetFilters} disabled={isGenerating}>Reset Filters</button>
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {lastGenerationInfo?.similarTo && (
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10 }}>
            Similar to <strong>{lastGenerationInfo.similarTo.kanji}</strong> ({lastGenerationInfo.similarTo.romaji}), based on shared gender classification, theme, mora count, or initial —
            not a fabricated similarity score.
          </p>
        )}
        {generatedResults.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            {lastGenerationInfo?.similarTo
              ? "No sufficiently similar names are available in the dataset."
              : lastGenerationInfo ? "No names match your current filters." : "Choose your options above and click Generate."}
          </p>
        ) : (
          <>
            {lastGenerationInfo && !lastGenerationInfo.similarTo && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                {lastGenerationInfo.isBulkAugmented
                  ? `Showing ${generatedResults.length} names, drawn from the curated dataset plus the full JMnedict/ENAMDICT-derived collection.`
                  : `Showing ${generatedResults.length} of ${lastGenerationInfo.availableCount} matching ${lastGenerationInfo.availableCount === 1 ? "record" : "records"} in the curated dataset.`}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {generatedResults.map((r) => (
                <NameResultCard
                  key={r.id}
                  record={r}
                  nameOrder={nameOrder}
                  isFavorite={isFavorite?.(r.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDetails={onOpenDetails}
                  onGenerateSimilar={onGenerateSimilar}
                  isComparing={compareIds?.includes(r.id)}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
