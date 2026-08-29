// Input mode selector — Mouse / Touch / Keyboard. Disabled while a test
// is active (spec Section 29: never switch input mode mid-test).

const MODES = [
  { id: "mouse", label: "Mouse", hint: "Left-click the box" },
  { id: "touch", label: "Touch", hint: "Tap the box" },
  { id: "keyboard", label: "Keyboard", hint: "Press your bound key" },
];

export default function CpsModeSelector({
  mode, onSetMode, disabled, keyBinding, isCapturingKey, onStartKeyCapture, onCancelKeyCapture,
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Input mode"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            disabled={disabled}
            onClick={() => onSetMode(m.id)}
            className={`filter-pill ${mode === m.id ? "active" : ""}`}
            style={{ border: "1.5px solid var(--border)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled && mode !== m.id ? 0.5 : 1 }}
            title={m.hint}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === "keyboard" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Testing key:</span>
          <span
            aria-live="polite"
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12.5,
              padding: "4px 10px", borderRadius: 6, background: "var(--bg-muted)", color: "var(--text-primary)",
              minWidth: 60, textAlign: "center",
            }}
          >
            {isCapturingKey ? "Press any key…" : keyBinding.label}
          </span>
          {isCapturingKey ? (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={onCancelKeyCapture}>
              Cancel
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} disabled={disabled} onClick={onStartKeyCapture}>
              Change Key
            </button>
          )}
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0, flexBasis: "100%" }}>
            Any key works except Escape and Tab, which stay reserved for navigation.
          </p>
        </div>
      )}
      {mode === "touch" && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>
          Touch testing may differ from mouse CPS results.
        </p>
      )}
    </div>
  );
}
