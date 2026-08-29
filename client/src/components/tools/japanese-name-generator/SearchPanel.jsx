import NameResultCard from "./NameResultCard";

const MAX_QUERY_LENGTH = 100;

export default function SearchPanel({
  searchQuery, runSearch, searchResults, searchResultsTotal, loadMoreSearchResults,
  bulkSearchResults, isSearchingBulk,
  nameOrder, isFavorite, onToggleFavorite, onOpenDetails, onGenerateSimilar, compareIds, onToggleCompare,
}) {
  const hasAnyResults = searchResults.length > 0 || bulkSearchResults.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
          Search by Romaji, Hiragana, Katakana, or Kanji
        </label>
        <input
          type="text"
          className="input"
          style={{ width: "100%", padding: "10px 12px" }}
          value={searchQuery}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="e.g. Sakura, さくら, サクラ, or 桜"
          aria-label="Search Japanese names"
        />
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, marginBottom: 0 }}>
          Curated results support full substring matching. Results from the full ~320,000-record dataset are matched
          from the start of the name's reading — see the FAQ below for why.
        </p>
      </div>

      <div aria-live="polite">
        {!searchQuery.trim() ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            Start typing to search the dataset.
          </p>
        ) : !hasAnyResults && !isSearchingBulk ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No names match your current filters.
          </p>
        ) : (
          <>
            {searchResults.length > 0 && (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                  {searchResults.length} of {searchResultsTotal} matching {searchResultsTotal === 1 ? "record" : "records"} in the curated dataset.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {searchResults.map((r) => (
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
                {searchResults.length < searchResultsTotal && (
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <button type="button" className="btn btn-secondary" onClick={loadMoreSearchResults}>Load More Curated Results</button>
                  </div>
                )}
              </>
            )}

            {(bulkSearchResults.length > 0 || isSearchingBulk) && (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                  {isSearchingBulk ? "Searching the full dataset…" : `${bulkSearchResults.length} additional results from the full dataset.`}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                  {bulkSearchResults.map((r) => (
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
          </>
        )}
      </div>
    </div>
  );
}
