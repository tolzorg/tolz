export default function PetWeightPanel({
  petWeightAge, setPetWeightAge, petWeightCurrent, setPetWeightCurrent,
  age1Tier, petWeightTable, calculatePetWeight, showAgeList, setShowAgeList,
}) {
  return (
    <div className="gag-panel">
      <div className="gag-row" style={{ alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
          <label className="gag-field">
            <span>Current Weight (kg)</span>
            <input type="number" min="0" step="0.01" className="gag-input" value={petWeightCurrent} onChange={(e) => setPetWeightCurrent(e.target.value)} />
          </label>
          <label className="gag-field">
            <span>Pet Age (1-100)</span>
            <input type="number" min="1" max="100" className="gag-input" value={petWeightAge} onChange={(e) => setPetWeightAge(e.target.value)} />
          </label>
          <button type="button" className="gag-btn" onClick={calculatePetWeight}>Calculate</button>
          <div className="gag-muted">
            Weight class: <strong style={{ color: age1Tier?.color }}>{age1Tier ? `${age1Tier.label} · Age 1 ≈ ${age1Tier.base.toFixed(2)} kg` : "—"}</strong>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          {petWeightTable?.error && <p style={{ color: "var(--gag-error)" }}>{petWeightTable.error}</p>}
          {petWeightTable && !petWeightTable.error && (
            <>
              <p className="gag-result" style={{ fontSize: 14, color: "#ffd700" }}>THESE ARE APPROXIMATIONS!!!</p>
              <button type="button" className="gag-btn-ghost" onClick={() => setShowAgeList((v) => !v)}>
                {showAgeList ? "Hide Age 1-100" : "Show Age 1-100"}
              </button>
              {showAgeList && (
                <pre className="gag-age-list">
                  {petWeightTable.rows.map((r) => `Age ${r.age}: ${r.weight.toFixed(2)} kg`).join("\n")}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
