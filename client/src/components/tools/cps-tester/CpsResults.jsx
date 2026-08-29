import { useCallback, useRef, useState } from "react";
import { getCpsRating } from "../../../utils/cpsEngine";
import { formatResultForCopy, exportResultTxt, copyText } from "../../../utils/cpsExport";

const fmt = (n) => (n === null || n === undefined ? "N/A" : n.toFixed(2));
const fmtMs = (n) => (n === null || n === undefined ? "N/A" : `${n.toFixed(0)} ms`);

export default function CpsResults({ snapshot, personalBest, onTryAgain, onChangeDuration, onReset }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const handleCopy = useCallback(async () => {
    const success = await copyText(formatResultForCopy(snapshot));
    if (success) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [snapshot]);

  if (!snapshot || snapshot.status !== "completed") return null;

  const { averageCps, peakCps, clickCount, durationSeconds, intervals, timestampCapReached, peakIsTrivial } = snapshot;
  const rating = getCpsRating(averageCps);
  const isNewAvgBest = personalBest && averageCps > personalBest.averageCps;
  const isNewPeakBest = personalBest && peakCps !== null && peakCps > personalBest.peakCps;

  return (
    <div className="card" style={{ padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
          CPS Test Complete
        </h2>
        <span
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, padding: "4px 10px",
            borderRadius: 99, background: "var(--accent-light)", color: "var(--accent)",
          }}
        >
          {rating}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
        <ResultStat label="Average CPS" value={fmt(averageCps)} highlight isNewBest={isNewAvgBest} />
        <ResultStat
          label="Peak CPS"
          value={peakCps === null ? (timestampCapReached ? "Unavailable" : "N/A") : fmt(peakCps)}
          isNewBest={isNewPeakBest}
          note={peakIsTrivial ? "Equals average for 1s tests" : null}
        />
        <ResultStat label="Total Clicks" value={String(clickCount)} />
        <ResultStat label="Duration" value={`${durationSeconds}s`} />
      </div>

      {intervals && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Click Interval
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 12.5 }}>
            <IntervalStat label="Average" value={fmtMs(intervals.average)} />
            <IntervalStat label="Fastest" value={fmtMs(intervals.fastest)} />
            <IntervalStat label="Slowest" value={fmtMs(intervals.slowest)} />
            <IntervalStat label="Median" value={fmtMs(intervals.median)} />
          </div>
        </div>
      )}
      {!intervals && timestampCapReached && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
          Click-interval statistics are unavailable for this test (an extremely high click count exceeded the
          detailed-timing sample limit; your total click count above is still accurate).
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="btn btn-primary" onClick={onTryAgain}>Try Again</button>
        <button type="button" className="btn btn-secondary" onClick={onChangeDuration}>Change Duration</button>
        <button type="button" className="btn btn-secondary" onClick={handleCopy}>{copied ? "Copied!" : "Copy Results"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { exportResultTxt(snapshot); }}>Download .txt</button>
        <button type="button" className="btn btn-danger" onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

function ResultStat({ label, value, highlight, isNewBest, note }) {
  return (
    <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: "12px 10px" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: highlight ? 26 : 20, color: highlight ? "var(--accent)" : "var(--text-primary)" }}>
        {value}
      </div>
      {isNewBest && <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}>🏆 New personal best!</div>}
      {note && <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{note}</div>}
    </div>
  );
}

function IntervalStat({ label, value }) {
  return (
    <div>
      <div style={{ color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
