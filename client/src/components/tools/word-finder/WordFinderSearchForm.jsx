const MAX_LETTERS_INPUT = 30;

export default function WordFinderSearchForm({
  lengthOptions, lengthFilter, setLengthFilter, matchType, setMatchType, matchModes,
  lettersInput, setLettersInput, runSearch, isSearching,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 18, background: "var(--text-primary)", borderColor: "transparent" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <select
          className="input"
          style={{ minWidth: 150, fontWeight: 700 }}
          value={lengthFilter}
          onChange={(e) => setLengthFilter(e.target.value)}
          aria-label="Word length"
        >
          <option value="any">Any Words</option>
          {lengthOptions.map((n) => (
            <option key={n} value={n}>{n}-Letter Words</option>
          ))}
        </select>

        <select
          className="input"
          style={{ minWidth: 160, fontWeight: 700 }}
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          aria-label="Match type"
        >
          {matchModes.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <input
          type="text"
          className="input"
          style={{ flex: "1 1 200px", minWidth: 160 }}
          placeholder="These letters"
          value={lettersInput}
          maxLength={MAX_LETTERS_INPUT}
          onChange={(e) => setLettersInput(e.target.value)}
          aria-label="Letters to search for"
        />

        <button type="submit" className="btn btn-primary" disabled={isSearching} aria-busy={isSearching} style={{ minWidth: 56 }}>
          {isSearching ? "…" : "🔍"}
        </button>
      </div>
    </form>
  );
}
