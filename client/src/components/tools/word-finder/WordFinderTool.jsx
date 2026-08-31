import { useWordFinder } from "./useWordFinder";
import WordFinderSearchForm from "./WordFinderSearchForm";
import WordFinderBlanksForm from "./WordFinderBlanksForm";
import WordFinderResults from "./WordFinderResults";

export default function WordFinderTool() {
  const f = useWordFinder();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <WordFinderSearchForm
        lengthOptions={f.lengthOptions}
        lengthFilter={f.lengthFilter} setLengthFilter={f.setLengthFilter}
        matchType={f.matchType} setMatchType={f.setMatchType} matchModes={f.matchModes}
        lettersInput={f.lettersInput} setLettersInput={f.setLettersInput}
        runSearch={f.runSearch} isSearching={f.isSearching}
      />

      <div style={{ textAlign: "center", fontWeight: 800, color: "var(--text-muted)", fontSize: 13 }}>OR</div>

      <WordFinderBlanksForm
        lengthOptions={f.lengthOptions}
        blankLength={f.blankLength} setBlankLength={f.setBlankLength}
        letterBoxes={f.letterBoxes} setLetterBox={f.setLetterBox}
        runFillInBlanks={f.runFillInBlanks} isSearching={f.isSearching}
      />

      <WordFinderResults
        results={f.results} resultsTotal={f.resultsTotal} lastSearchInfo={f.lastSearchInfo}
        isSearching={f.isSearching} sortBy={f.sortBy} setSortBy={f.setSortBy} sortOptions={f.sortOptions}
        loadMoreResults={f.loadMoreResults} hasMoreResults={f.hasMoreResults} scrabbleScore={f.scrabbleScore}
      />
    </div>
  );
}
