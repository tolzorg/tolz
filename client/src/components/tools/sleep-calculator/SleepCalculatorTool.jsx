import { useState, useEffect, useRef } from "react";
import { Spinner } from "../../ui";
import { calcSleepTimes, calcWakeUpTimes } from "../../../utils/sleepCalc";

// ── Drum picker constants ────────────────────────────────────
const ITEM_H   = 40;
const VISIBLE  = 5;
const PICKER_BG = "#0c1629";
const HOURS   = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const AMPM    = ["AM", "PM"];

function getInitialTime() {
  const now = new Date();
  let h  = now.getHours();
  const m  = now.getMinutes();
  const ap = h >= 12 ? 1 : 0;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hIdx: h - 1, mIdx: m, apIdx: ap };
}

function toTimeStr(hIdx, mIdx, apIdx) {
  let h = hIdx + 1;
  if (apIdx === 0 && h === 12) h = 0;
  else if (apIdx === 1 && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(mIdx).padStart(2, "0")}`;
}

// ── Scroll column ────────────────────────────────────────────
function ScrollColumn({ items, selectedIdx, onSelect }) {
  const ref        = useRef(null);
  const snapTimer  = useRef(null);
  const prog       = useRef(false);

  // Set position on mount (no animation)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIdx * ITEM_H;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Respond to external selectedIdx changes (e.g. reset)
  useEffect(() => {
    if (!ref.current || prog.current) return;
    const cur = Math.round(ref.current.scrollTop / ITEM_H);
    if (cur === selectedIdx) return;
    prog.current = true;
    ref.current.scrollTo({ top: selectedIdx * ITEM_H, behavior: "smooth" });
    const t = setTimeout(() => { prog.current = false; }, 500);
    return () => clearTimeout(t);
  }, [selectedIdx]);

  function handleScroll() {
    if (prog.current) return;
    const raw = ref.current?.scrollTop ?? 0;
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(raw / ITEM_H)));
    onSelect(idx);

    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!ref.current || prog.current) return;
      const final = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      const target = final * ITEM_H;
      if (Math.abs(ref.current.scrollTop - target) > 0.5) {
        prog.current = true;
        ref.current.scrollTo({ top: target, behavior: "smooth" });
        setTimeout(() => { prog.current = false; }, 400);
      }
      onSelect(final);
    }, 150);
  }

  return (
    <div style={{ position: "relative", flex: 1, height: ITEM_H * VISIBLE, overflow: "hidden" }}>

      {/* Top fade */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: ITEM_H * 2.2,
        background: `linear-gradient(to bottom, ${PICKER_BG} 20%, transparent 100%)`,
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Selection line — top */}
      <div style={{
        position: "absolute", top: ITEM_H * 2, left: 0, right: 0, height: 1,
        background: "rgba(245,158,11,0.55)", pointerEvents: "none", zIndex: 4,
      }} />
      {/* Selection line — bottom */}
      <div style={{
        position: "absolute", top: ITEM_H * 3 - 1, left: 0, right: 0, height: 1,
        background: "rgba(245,158,11,0.55)", pointerEvents: "none", zIndex: 4,
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: ITEM_H * 2.2,
        background: `linear-gradient(to top, ${PICKER_BG} 20%, transparent 100%)`,
        pointerEvents: "none", zIndex: 3,
      }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="sleep-picker-col"
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollPaddingTop: `${ITEM_H * 2}px`,
        }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              if (prog.current) return;
              prog.current = true;
              ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
              onSelect(i);
              setTimeout(() => { prog.current = false; }, 500);
            }}
            style={{
              height: ITEM_H,
              scrollSnapAlign: "start",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              userSelect: "none",
              WebkitUserSelect: "none",
              fontFamily: "var(--font-display)",
              fontWeight: i === selectedIdx ? 700 : 400,
              fontSize: i === selectedIdx ? 22 : 15,
              letterSpacing: i === selectedIdx ? "-0.02em" : "0",
              color: i === selectedIdx ? "#ffffff" : "rgba(255,255,255,0.22)",
              transition: "color 0.12s, font-size 0.12s",
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

// ── Quality card styles ──────────────────────────────────────
const QUALITY_STYLES = {
  best: {
    border: "1.5px solid #bbf7d0",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    accent: "#16a34a",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
  },
  good: {
    border: "1.5px solid #bfdbfe",
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    accent: "#2563eb",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
  },
  short: {
    border: "1.5px solid #fde68a",
    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    accent: "#d97706",
    badgeBg: "#fef3c7",
    badgeColor: "#b45309",
  },
};

function ResultCard({ result, delay, mode }) {
  const s      = QUALITY_STYLES[result.quality];
  const isBest = result.quality === "best";

  return (
    <div
      className="animate-fadeUp"
      style={{
        animationDelay: `${delay * 80}ms`,
        border: isBest ? "2px solid #16a34a" : s.border,
        background: s.background,
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: isBest ? "0 4px 16px rgba(22,163,74,0.15)" : "var(--shadow-xs)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isBest && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #16a34a, #22c55e)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: 28, color: s.accent,
          letterSpacing: "-0.03em", lineHeight: 1,
        }}>
          {result.time}
        </div>
        <div style={{
          fontSize: 13, color: "var(--text-secondary)",
          fontFamily: "var(--font-display)", fontWeight: 500,
        }}>
          {mode === "wake" ? "Go to sleep at" : "Wake up at"} this time
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 99,
          fontSize: 12, fontWeight: 700,
          fontFamily: "var(--font-display)",
          background: s.badgeBg, color: s.badgeColor,
          border: `1px solid ${s.border.split(" ")[2]}`,
        }}>
          {result.label}
        </span>
        <div style={{
          fontSize: 12, color: "var(--text-muted)",
          fontFamily: "var(--font-display)", fontWeight: 500,
          textAlign: "right",
        }}>
          {result.duration} · {result.cycles} cycles
        </div>
      </div>
    </div>
  );
}

// ── Main tool ────────────────────────────────────────────────
const INIT = getInitialTime();

export default function SleepCalculatorTool() {
  const [mode,    setMode]    = useState("wake");
  const [hIdx,    setHIdx]    = useState(INIT.hIdx);
  const [mIdx,    setMIdx]    = useState(INIT.mIdx);
  const [apIdx,   setApIdx]   = useState(INIT.apIdx);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const timeInput   = toTimeStr(hIdx, mIdx, apIdx);
  const displayTime = `${HOURS[hIdx]}:${MINUTES[mIdx]} ${AMPM[apIdx]}`;

  function handleModeSwitch(newMode) {
    if (newMode === mode) return;
    setMode(newMode);
    setResults(null);
  }

  function handleCalculate() {
    setLoading(true);
    setResults(null);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const computed = mode === "wake"
        ? calcSleepTimes(timeInput)
        : calcWakeUpTimes(timeInput);
      setResults(computed);
      setLoading(false);
    }, 350);
  }

  function handleReset() {
    clearTimeout(timerRef.current);
    setHIdx(INIT.hIdx);
    setMIdx(INIT.mIdx);
    setApIdx(INIT.apIdx);
    setResults(null);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hide scrollbars inside drum picker */}
      <style>{`.sleep-picker-col::-webkit-scrollbar { display: none; }`}</style>

      {/* ── Mode toggle ── */}
      <div className="card animate-fadeUp" style={{ padding: 6, display: "flex", gap: 4 }}>
        {[
          { id: "wake",  label: "I want to wake up at" },
          { id: "sleep", label: "I want to go to sleep at" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleModeSwitch(opt.id)}
            style={{
              flex: 1, padding: "11px 12px",
              borderRadius: "var(--radius-md)", border: "none",
              cursor: "pointer", fontFamily: "var(--font-display)",
              fontWeight: 600, fontSize: 13,
              transition: "all var(--transition)",
              background: mode === opt.id ? "var(--accent)" : "transparent",
              color:      mode === opt.id ? "#fff" : "var(--text-muted)",
              boxShadow:  mode === opt.id ? "0 2px 8px rgba(59,123,252,0.25)" : "none",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Time picker card ── */}
      <div className="card animate-fadeUp delay-100" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

        <label style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: 14, color: "var(--text-primary)",
        }}>
          {mode === "wake"
            ? "What time do you need to wake up?"
            : "What time do you plan to go to sleep?"}
        </label>

        {/* Drum picker */}
        <div style={{
          background: PICKER_BG,
          border: "1.5px solid rgba(245,158,11,0.65)",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          <div style={{ display: "flex" }}>
            <ScrollColumn items={HOURS}   selectedIdx={hIdx}  onSelect={setHIdx}  />
            <div style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: `${ITEM_H}px 0` }} />
            <ScrollColumn items={MINUTES} selectedIdx={mIdx}  onSelect={setMIdx}  />
            <div style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: `${ITEM_H}px 0` }} />
            <ScrollColumn items={AMPM}    selectedIdx={apIdx} onSelect={setApIdx} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={loading}
            style={{ flex: 1, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? <Spinner size={15} /> : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zM7.5 3v4.5l3 1.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {loading ? "Calculating…" : "Calculate"}
          </button>
          {results && (
            <button className="btn btn-secondary" onClick={handleReset} style={{ flexShrink: 0 }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="animate-fadeUp" style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 13, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {mode === "wake"
              ? `Suggested bedtimes to wake at ${displayTime}`
              : `Suggested wake-up times if sleeping at ${displayTime}`}
          </div>
          {results.map((r, i) => (
            <ResultCard key={r.cycles} result={r} delay={i} mode={mode} />
          ))}
        </div>
      )}

      {/* ── Info note ── */}
      <div className="animate-fadeUp delay-200" style={{
        background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
        padding: "12px 16px", fontSize: 12.5,
        color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 500, display: "flex", gap: 8,
        alignItems: "flex-start", border: "1px solid var(--border)",
      }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
        <span>
          Based on the science of{" "}
          <strong style={{ color: "var(--text-secondary)" }}>90-minute sleep cycles</strong>.
          Includes an average of 15 minutes to fall asleep. Times may cross into the next day.
        </span>
      </div>
    </div>
  );
}
