import { Fragment, useMemo } from "react";
import { useNameBrowse } from "./useNameBrowse";
import NameResultCard from "./NameResultCard";

const SORTS = [
  { id: "az", label: "A-Z" },
  { id: "random", label: "Random" },
  { id: "fewest", label: "Fewest Characters" },
];

/**
 * A-Z browse UI for one bulk category (girl | boy | surname), used by
 * the Girl Names / Boy Names / Last Names tabs of the main Japanese
 * Name Generator tool. Only ONE shard (the selected letter's) is ever
 * fetched/rendered at a time; within that, results are paginated
 * (48/page) — never renders thousands of names at once. Attribution
 * is rendered once at the tool level, not per-tab, so it's not
 * repeated here.
 */
export default function NameBrowseSection({ category, title, nameOrder, isFavorite, onToggleFavorite, onOpenDetails, onGenerateSimilar, compareIds, onToggleCompare }) {
  const b = useNameBrowse(category);

  // Japanese has many surnames/given names that are different Kanji
  // sharing the exact same reading (e.g. 佐, 左, 査, 沙, 崔 all read さ).
  // Sorted A-Z by romaji, those land right next to each other — same
  // romaji, same Hiragana, only the Kanji glyph differs — which reads
  // as duplication even though every record is distinct. Grouping
  // consecutive same-reading records under one shared-reading header
  // makes that relationship explicit instead of leaving it to look
  // like a bug. Only meaningful for the "az" sort, where same-reading
  // records are actually adjacent (random/fewest-characters sorts
  // scatter them, so grouping wouldn't reflect anything real there).
  const groups = useMemo(() => {
    if (b.sortBy !== "az") return b.records.map((r) => ({ key: r.id, hiragana: null, records: [r] }));
    const out = [];
    for (const r of b.records) {
      const last = out[out.length - 1];
      if (last && last.hiragana === r.hiragana) last.records.push(r);
      else out.push({ key: r.id, hiragana: r.hiragana, records: [r] });
    }
    return out;
  }, [b.records, b.sortBy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 14 }}>
          {b.manifest
            ? `Browse ${b.manifest.total.toLocaleString()} ${title} by first letter of the Hepburn romaji reading.`
            : "Loading dataset size…"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gap: 6 }}>
          {b.letters.map((letter) => {
            const count = b.manifest?.shardSizes?.[letter] || 0;
            return (
              <button
                key={letter}
                type="button"
                className={`filter-pill ${b.selectedLetter === letter ? "active" : ""}`}
                onClick={() => b.selectLetter(letter)}
                disabled={count === 0}
                style={{ padding: "6px 0", fontSize: 12.5, opacity: count === 0 ? 0.35 : 1 }}
                aria-label={`Browse names starting with ${letter} (${count})`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {b.selectedLetter && (
        <div className="card" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            {b.isLoadingShard ? "Loading…" : `${b.totalMatches.toLocaleString()} names starting with "${b.selectedLetter}"`}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center", marginRight: 4 }}>Sort:</span>
            {SORTS.map((s) => (
              <button key={s.id} type="button" className={`filter-pill ${b.sortBy === s.id ? "active" : ""}`} onClick={() => b.setSortBy(s.id)} style={{ fontSize: 12, padding: "4px 10px" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div aria-live="polite">
        {!b.selectedLetter ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            Select a letter above to browse names.
          </p>
        ) : b.isLoadingShard ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>Loading names…</p>
        ) : b.records.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No names found.</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {groups.map((group) => (
                <Fragment key={group.key}>
                  {group.records.length > 1 && (
                    <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>
                      {group.records.length} different Kanji share the reading "{group.hiragana}" ({group.records[0].romaji}):
                    </div>
                  )}
                  {group.records.map((r) => (
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
                </Fragment>
              ))}
            </div>
            {b.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" disabled={b.page <= 1} onClick={() => b.goToPage(b.page - 1)}>Previous</button>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Page {b.page} of {b.totalPages}</span>
                <button type="button" className="btn btn-secondary" disabled={b.page >= b.totalPages} onClick={() => b.goToPage(b.page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
