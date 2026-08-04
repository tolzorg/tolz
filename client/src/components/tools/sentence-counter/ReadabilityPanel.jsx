import { useState } from "react";
import DistributionChart from "./DistributionChart";
import { computeDuration, formatDuration } from "../../../utils/sentenceCounterAnalysis";

const cardStyle = { padding: "20px 20px" };
const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4,
};
const noteStyle = { fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 };

function MetricCard({ label, score, sub }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-white)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-display)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{score}</div>
      <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function SentenceHighlightCard({ title, sentence, onHighlight, wpm }) {
  if (!sentence) return null;
  const duration = computeDuration(sentence.words, wpm);
  return (
    <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-white)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</span>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 11.5, padding: "4px 10px", fontWeight: 600 }} onClick={() => onHighlight(sentence.index)}>
          Highlight in editor
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>{sentence.text}</p>
      <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--text-muted)" }}>
        <span>Sentence #{sentence.index}</span>
        <span>{sentence.words} words</span>
        <span>{sentence.chars} characters</span>
        <span>{formatDuration(duration)} to read</span>
      </div>
    </div>
  );
}

export default function ReadabilityPanel({ analysis, onHighlightSentence, readingWpm, onReadingWpmChange }) {
  const [speakingWpm, setSpeakingWpm] = useState(130);

  const { readability, insights, distribution, vocabulary, complexity, counts } = analysis;

  const readingDuration = computeDuration(counts.words, readingWpm);
  const speakingDuration = computeDuration(counts.words, speakingWpm);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Readability metrics */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Advanced Readability Analysis</h2>
        <p style={noteStyle}>
          Estimates only — actual readability may vary depending on sentence segmentation, subject matter, and reader background.
        </p>

        {readability ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
              <MetricCard label="Flesch Reading Ease" score={readability.flesch.score} sub={readability.flesch.level} />
              <MetricCard label="Flesch-Kincaid Grade" score={readability.fkGrade.score} sub={readability.fkGrade.label} />
              <MetricCard label="Gunning Fog Index" score={readability.fog.score} sub={readability.fog.label} />
              <MetricCard label="SMOG Index" score={readability.smog.score} sub={readability.smog.label} />
              <MetricCard label="Coleman-Liau Index" score={readability.colemanLiau.score} sub={readability.colemanLiau.label} />
              <MetricCard label="Automated Readability Index" score={readability.ari.score} sub={readability.ari.label} />
            </div>

            {readability.difficulty && (
              <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--accent-light)", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                  Overall Reading Difficulty: {readability.difficulty}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{readability.summary}</div>
              </div>
            )}

            {insights.length > 0 && (
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontFamily: "var(--font-display)" }}>Writing Insights</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                  {insights.map((tip, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Add at least a few sentences to see readability metrics.</p>
        )}
      </div>

      {/* Distribution */}
      {counts.sentences > 0 && (
        <div className="card" style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: 14 }}>Sentence Length Distribution</h2>
          <DistributionChart distribution={distribution} />
        </div>
      )}

      {/* Reading statistics */}
      {counts.words > 0 && (
        <div className="card" style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: 14 }}>Reading Statistics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Estimated Reading Time</span>
                <select className="input" value={readingWpm} onChange={(e) => onReadingWpmChange(Number(e.target.value))} style={{ width: "auto", padding: "4px 8px", fontSize: 12 }} aria-label="Reading speed">
                  <option value={200}>200 WPM</option>
                  <option value={225}>225 WPM (default)</option>
                  <option value={250}>250 WPM</option>
                </select>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{formatDuration(readingDuration)}</div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Estimated Speaking Time</span>
                <select className="input" value={speakingWpm} onChange={(e) => setSpeakingWpm(Number(e.target.value))} style={{ width: "auto", padding: "4px 8px", fontSize: 12 }} aria-label="Speaking speed">
                  <option value={110}>110 WPM</option>
                  <option value={130}>130 WPM (default)</option>
                  <option value={150}>150 WPM</option>
                </select>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{formatDuration(speakingDuration)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Longest / shortest sentence */}
      {(complexity.longestSentence || complexity.shortestSentence) && (
        <div className="card" style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: 14 }}>Longest &amp; Shortest Sentence</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <SentenceHighlightCard title="Longest Sentence" sentence={complexity.longestSentence} onHighlight={onHighlightSentence} wpm={readingWpm} />
            <SentenceHighlightCard title="Shortest Sentence" sentence={complexity.shortestSentence} onHighlight={onHighlightSentence} wpm={readingWpm} />
          </div>
        </div>
      )}

      {/* Vocabulary */}
      {counts.words > 0 && (
        <div className="card" style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: 14 }}>Vocabulary Statistics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
            <MetricCard label="Unique Words" score={vocabulary.uniqueWords} sub="distinct words" />
            <MetricCard label="Repeated Words" score={vocabulary.repeatedWords} sub="repeat occurrences" />
            <MetricCard label="Vocabulary Diversity" score={`${vocabulary.diversityPercent}%`} sub={`TTR ${vocabulary.diversityRatio}`} />
          </div>
          {vocabulary.topWords.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontFamily: "var(--font-display)" }}>Most Frequent Words</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {vocabulary.topWords.map((w) => (
                  <span key={w.word} className="filter-pill" style={{ cursor: "default" }}>
                    {w.word} <span style={{ opacity: 0.6 }}>×{w.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complexity indicators */}
      {counts.words > 0 && (
        <div className="card" style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: 14 }}>Complexity Indicators</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <MetricCard label="Avg Word Length" score={complexity.avgWordLength} sub="characters" />
            <MetricCard label="Avg Sentence Length" score={complexity.avgSentenceLength} sub="words" />
            <MetricCard label="Longest Word" score={complexity.longestWord || "—"} sub={`${complexity.longestWord.length} chars`} />
            <MetricCard label="Complex Words" score={complexity.complexWordCount} sub={`${complexity.complexWordPercent}% of text`} />
          </div>
        </div>
      )}
    </div>
  );
}
