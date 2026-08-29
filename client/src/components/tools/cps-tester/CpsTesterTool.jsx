import { useCpsTester } from "./useCpsTester";
import CpsModeSelector from "./CpsModeSelector";
import DurationSelector from "./DurationSelector";
import CpsTestArea from "./CpsTestArea";
import CpsResults from "./CpsResults";
import CpsChart from "./CpsChart";
import CpsHistory from "./CpsHistory";

export default function CpsTesterTool() {
  const {
    mode, setMode,
    keyBinding, isCapturingKey, startKeyCapture, cancelKeyCapture,
    durationSeconds, selectPresetDuration, customInput, customError, applyCustomDuration,
    snapshot, cancelMessage, reset,
    handlePointerDown,
    history, clearHistory,
    currentPersonalBest, clearPersonalBests,
  } = useCpsTester();

  const isActive = snapshot?.status === "active";
  const isCompleted = snapshot?.status === "completed";
  const isCancelled = snapshot?.status === "cancelled";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Scoped press-feedback + focus styles — matches the project's
          established pattern of a tool-local <style> tag for CSS that
          only this tool needs (see the TI-84 calculator's focus-ring
          styling for precedent), rather than editing the shared
          global stylesheet. */}
      <style>{`
        .cps-click-area:active { transform: scale(0.98); }
        .cps-click-area:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>
            CPS Tester
          </span>
          {/* Always visible, always enabled — the user can reset the
              current test at any time, including mid-run (spec: "Add
              Reset button" / "reset ... at any time, including while
              it is running"). Distinct from Try Again/Reset inside the
              results card below, which only appear once a test ends. */}
          <button
            type="button"
            className="btn btn-danger"
            onClick={reset}
            aria-label="Reset the current test and clear the timer, clicks, and results"
            style={{ padding: "6px 14px", fontSize: 12.5, fontWeight: 700 }}
          >
            ↺ Reset
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Input Mode
          </div>
          <CpsModeSelector
            mode={mode}
            onSetMode={setMode}
            disabled={isActive}
            keyBinding={keyBinding}
            isCapturingKey={isCapturingKey}
            onStartKeyCapture={startKeyCapture}
            onCancelKeyCapture={cancelKeyCapture}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Test Duration
          </div>
          <DurationSelector
            durationSeconds={durationSeconds}
            onSelectPreset={selectPresetDuration}
            customInput={customInput}
            customError={customError}
            onApplyCustom={applyCustomDuration}
            disabled={isActive}
          />
        </div>

        <CpsTestArea mode={mode} snapshot={snapshot} cancelMessage={cancelMessage} onPointerDown={handlePointerDown} keyLabel={keyBinding.label} />

        {(isActive || isCompleted) && snapshot.timestamps.length >= 2 && (
          <CpsChart timestamps={snapshot.timestamps} elapsedMs={snapshot.elapsedMs} />
        )}

        {(isCancelled) && (
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" onClick={reset}>Try Again</button>
          </div>
        )}

        {!isActive && !isCompleted && !isCancelled && (
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
            Select a duration and click as fast as you can.
          </p>
        )}
      </div>

      <CpsResults
        snapshot={snapshot}
        personalBest={currentPersonalBest}
        onTryAgain={reset}
        onChangeDuration={reset}
        onReset={reset}
      />

      <CpsHistory
        history={history}
        personalBest={currentPersonalBest}
        mode={mode}
        durationSeconds={durationSeconds}
        onClearHistory={clearHistory}
        onClearBests={clearPersonalBests}
      />
    </div>
  );
}
