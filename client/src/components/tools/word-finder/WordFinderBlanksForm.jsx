import { useRef } from "react";

export default function WordFinderBlanksForm({ lengthOptions, blankLength, setBlankLength, letterBoxes, setLetterBox, runFillInBlanks, isSearching }) {
  const boxRefs = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runFillInBlanks();
  };

  const handleBoxChange = (index, value) => {
    setLetterBox(index, value);
    if (value && index < letterBoxes.length - 1) boxRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !letterBoxes[index] && index > 0) boxRefs.current[index - 1]?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 20, background: "var(--bg-muted)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, textAlign: "center", color: "var(--text-primary)", marginBottom: 14 }}>
        Fill-in-the-Blanks Search
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <select
          className="input"
          style={{ minWidth: 110, fontWeight: 700 }}
          value={blankLength}
          onChange={(e) => setBlankLength(e.target.value)}
          aria-label="Number of letters"
        >
          {lengthOptions.map((n) => (
            <option key={n} value={n}>{n} Letters</option>
          ))}
        </select>

        {letterBoxes.map((v, i) => (
          <input
            key={i}
            ref={(el) => { boxRefs.current[i] = el; }}
            type="text"
            className="input"
            style={{ width: 40, height: 40, textAlign: "center", fontWeight: 700, fontSize: 16, padding: 0 }}
            value={v}
            maxLength={1}
            onChange={(e) => handleBoxChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Letter ${i + 1} of ${letterBoxes.length} (leave blank for any letter)`}
          />
        ))}

        <button type="submit" className="btn btn-primary" disabled={isSearching} aria-busy={isSearching} style={{ minWidth: 56 }}>
          {isSearching ? "…" : "🔍"}
        </button>
      </div>
    </form>
  );
}
