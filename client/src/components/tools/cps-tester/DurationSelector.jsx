import { PRESET_DURATIONS, MIN_DURATION, MAX_DURATION } from "../../../utils/cpsConfig";

// Preset duration buttons + a custom-duration field. Disabled while a
// test is active — changing duration mid-test isn't supported (the
// selected duration is fixed for the life of one test).

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${seconds}s (${m}m)` : `${seconds}s (${m}m ${s}s)`;
}

export default function DurationSelector({ durationSeconds, onSelectPreset, customInput, customError, onApplyCustom, disabled }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {PRESET_DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(d)}
            className={`filter-pill ${durationSeconds === d && customInput === "" ? "active" : ""}`}
            style={{ border: "1.5px solid var(--border)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}
          >
            {d}s
          </button>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>Custom:</span>
          <input
            type="text"
            inputMode="decimal"
            value={customInput}
            disabled={disabled}
            onChange={(e) => onApplyCustom(e.target.value)}
            placeholder={`${MIN_DURATION}–${MAX_DURATION}s`}
            aria-label={`Custom test duration in seconds, ${MIN_DURATION} to ${MAX_DURATION}`}
            className="input"
            style={{ width: 110, padding: "6px 10px", fontSize: 13 }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>(up to {MAX_DURATION / 60} min)</span>
        </label>
      </div>
      {customError && (
        <p role="alert" style={{ fontSize: 12, color: "var(--error)", marginTop: 6, marginBottom: 0 }}>
          {customError}
        </p>
      )}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>
        Selected: <strong style={{ color: "var(--text-primary)" }}>{formatDuration(durationSeconds)}</strong>
      </p>
    </div>
  );
}
