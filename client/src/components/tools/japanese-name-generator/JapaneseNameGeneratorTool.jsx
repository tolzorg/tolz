import { useState } from "react";
import { useJapaneseNameGenerator } from "./useJapaneseNameGenerator";
import GeneratorPanel from "./GeneratorPanel";
import SearchPanel from "./SearchPanel";
import FavoritesPanel from "./FavoritesPanel";
import ComparePanel from "./ComparePanel";
import MyNameInJapanesePanel from "./MyNameInJapanesePanel";
import KanaChartPanel from "./KanaChartPanel";
import NameBrowseSection from "./NameBrowseSection";
import NameDetailsDialog from "./NameDetailsDialog";
import JapaneseNameAttribution from "./JapaneseNameAttribution";

const TABS = [
  { id: "generate", label: "Generate" },
  { id: "girl-names", label: "Girl Names" },
  { id: "boy-names", label: "Boy Names" },
  { id: "last-names", label: "Last Names" },
  { id: "search", label: "Search" },
  { id: "favorites", label: "Favorites" },
  { id: "compare", label: "Compare" },
  { id: "myname", label: "My Name in Japanese" },
  { id: "kana", label: "Kana Chart" },
];

export default function JapaneseNameGeneratorTool() {
  const [tab, setTab] = useState("generate");
  const g = useJapaneseNameGenerator();

  const handleGenerateSimilar = (record) => {
    g.showSimilar(record);
    setTab("generate");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div role="tablist" aria-label="Japanese Name Generator sections" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`filter-pill ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === "favorites" && g.favorites.length > 0 ? ` (${g.favorites.length})` : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Name order:</span>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "5px 10px" }}
            onClick={() => g.setNameOrder(g.nameOrder === "japanese" ? "international" : "japanese")}
            aria-label="Toggle name order between Japanese (Family + Given) and International (Given + Family)"
          >
            {g.nameOrder === "japanese" ? "Japanese (Family Given)" : "International (Given Family)"}
          </button>
        </div>
      </div>

      <div role="tabpanel">
        {tab === "generate" && (
          <GeneratorPanel
            nameType={g.nameType} setNameType={g.setNameType}
            gender={g.gender} setGender={g.setGender}
            quantity={g.quantity} setQuantity={g.setQuantity}
            filters={g.filters} setFilters={g.setFilters} resetFilters={g.resetFilters}
            generate={g.generate} generatedResults={g.generatedResults} lastGenerationInfo={g.lastGenerationInfo} isGenerating={g.isGenerating}
            nameOrder={g.nameOrder}
            isFavorite={g.isFavorite} onToggleFavorite={g.addFavorite}
            onOpenDetails={g.openDetails} onGenerateSimilar={handleGenerateSimilar}
            compareIds={g.compareIds} onToggleCompare={g.toggleCompare}
          />
        )}
        {tab === "girl-names" && (
          <NameBrowseSection
            category="girl" title="Japanese girl names" nameOrder={g.nameOrder}
            isFavorite={g.isFavorite} onToggleFavorite={g.addFavorite}
            onOpenDetails={g.openDetails} onGenerateSimilar={g.openDetails}
            compareIds={g.compareIds} onToggleCompare={g.toggleCompare}
          />
        )}
        {tab === "boy-names" && (
          <NameBrowseSection
            category="boy" title="Japanese boy names" nameOrder={g.nameOrder}
            isFavorite={g.isFavorite} onToggleFavorite={g.addFavorite}
            onOpenDetails={g.openDetails} onGenerateSimilar={g.openDetails}
            compareIds={g.compareIds} onToggleCompare={g.toggleCompare}
          />
        )}
        {tab === "last-names" && (
          <NameBrowseSection
            category="surname" title="Japanese surnames" nameOrder={g.nameOrder}
            isFavorite={g.isFavorite} onToggleFavorite={g.addFavorite}
            onOpenDetails={g.openDetails} onGenerateSimilar={g.openDetails}
            compareIds={g.compareIds} onToggleCompare={g.toggleCompare}
          />
        )}
        {tab === "search" && (
          <SearchPanel
            searchQuery={g.searchQuery} runSearch={g.runSearch}
            searchResults={g.searchResults} searchResultsTotal={g.searchResultsTotal} loadMoreSearchResults={g.loadMoreSearchResults}
            bulkSearchResults={g.bulkSearchResults} isSearchingBulk={g.isSearchingBulk}
            nameOrder={g.nameOrder}
            isFavorite={g.isFavorite} onToggleFavorite={g.addFavorite}
            onOpenDetails={g.openDetails} onGenerateSimilar={handleGenerateSimilar}
            compareIds={g.compareIds} onToggleCompare={g.toggleCompare}
          />
        )}
        {tab === "favorites" && (
          <FavoritesPanel favorites={g.favorites} removeFavorite={g.removeFavorite} clearFavorites={g.clearFavorites} nameOrder={g.nameOrder} />
        )}
        {tab === "compare" && (
          <ComparePanel compareRecords={g.compareRecords} clearCompare={g.clearCompare} />
        )}
        {tab === "myname" && (
          <MyNameInJapanesePanel foreignName={g.foreignName} setForeignName={g.setForeignName} foreignNameResult={g.foreignNameResult} />
        )}
        {tab === "kana" && <KanaChartPanel />}
      </div>

      <JapaneseNameAttribution />

      <NameDetailsDialog record={g.detailsRecord} onClose={g.closeDetails} />
    </div>
  );
}
