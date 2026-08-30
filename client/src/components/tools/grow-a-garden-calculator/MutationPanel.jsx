export default function MutationPanel({
  tierMutations, activeTier, setTier,
  visibleMutations, activeMutationIds, lockedMutationIds, toggleMutation, clearMutations, maxMutations,
  hideAdminMutations, setHideAdminMutations, mutationQuery, setMutationQuery,
}) {
  const activeCount = activeMutationIds.size + (activeTier ? 1 : 0);
  return (
    <div className="gag-panel">
      <div className="gag-row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <strong className="gag-heading">Modifiers</strong>
        <div className="gag-row">
          <button type="button" className="gag-btn-ghost" onClick={() => setHideAdminMutations((v) => !v)}>
            {hideAdminMutations ? "Show Admin Mutations" : "Hide Admin Mutations"}
          </button>
        </div>
      </div>

      <p className="gag-formula">
        (Rainbow/Gold/Silver) × (1 + Sum of Modifiers − Number of Modifiers)
      </p>

      <input
        type="text"
        className="gag-input"
        placeholder="Search for a mutation..."
        value={mutationQuery}
        maxLength={40}
        onChange={(e) => setMutationQuery(e.target.value)}
        aria-label="Search for a mutation"
      />

      <div className="gag-mutation-grid">
        {tierMutations.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`gag-mutation-btn ${activeTier === t.id ? "active" : ""}`}
            onClick={() => setTier(t.id)}
            aria-pressed={activeTier === t.id}
          >
            {t.label} ({t.multiplier}x)
          </button>
        ))}
        {visibleMutations.map((m) => {
          const isLocked = lockedMutationIds.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              className={`gag-mutation-btn ${activeMutationIds.has(m.id) ? "active" : ""}`}
              style={activeMutationIds.has(m.id) ? { borderColor: m.color, color: m.color } : undefined}
              onClick={() => toggleMutation(m.id)}
              disabled={isLocked}
              aria-pressed={activeMutationIds.has(m.id)}
              aria-disabled={isLocked}
              title={isLocked ? `${m.label} — unavailable while a conflicting mutation is active` : `${m.label} (${m.multiplier}x)`}
            >
              {m.label} ({m.multiplier}x)
            </button>
          );
        })}
      </div>

      <div className="gag-row" style={{ marginTop: 10 }}>
        <button type="button" className="gag-btn" onClick={clearMutations}>Clear Mutations</button>
        <button type="button" className="gag-btn" onClick={maxMutations}>Max Mutations</button>
        <span className="gag-muted" style={{ marginLeft: "auto" }}>{activeCount} active</span>
      </div>
    </div>
  );
}
