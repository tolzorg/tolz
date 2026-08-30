export default function PetXpPanel({
  currentAge, setCurrentAge, targetAge, setTargetAge,
  owlCount, setOwlCount, owlXpInputs, setOwlXpInput,
  mouseBoost, setMouseBoost, brownMouseXp, setBrownMouseXp, greyMouseXp, setGreyMouseXp,
  starfishActive, toggleStarfish, starfishXp, setStarfishXp,
  extraXpPercent, setExtraXpPercent, customXpPerSecond, setCustomXpPerSecond,
  petGrowthResult, calculatePetGrowth,
}) {
  return (
    <div className="gag-panel">
      <div className="gag-row" style={{ flexWrap: "wrap", gap: 20 }}>
        <label className="gag-field">
          <span>Current Age</span>
          <input type="number" min="1" max="100" className="gag-input" style={{ width: 90 }} value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} />
        </label>
        <label className="gag-field">
          <span>Owls (0-8)</span>
          <input type="number" min="0" max="8" className="gag-input" style={{ width: 90 }} value={owlCount} onChange={(e) => setOwlCount(e.target.value)} />
        </label>
        <label className="gag-field">
          <span>Target Age (1-100)</span>
          <input type="number" min="1" max="100" className="gag-input" style={{ width: 90 }} value={targetAge} onChange={(e) => setTargetAge(e.target.value)} />
        </label>
      </div>

      <div className="gag-row" style={{ marginTop: 14, gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="gag-row">
            <button type="button" className={`gag-mutation-btn ${mouseBoost === "brown" ? "active" : ""}`} onClick={() => setMouseBoost("brown")}>Brown Mouse</button>
            <input type="number" className="gag-input" style={{ width: 100 }} placeholder="XP per 8m" value={brownMouseXp} onChange={(e) => setBrownMouseXp(e.target.value)} />
          </div>
          <div className="gag-row">
            <button type="button" className={`gag-mutation-btn ${mouseBoost === "grey" ? "active" : ""}`} onClick={() => setMouseBoost("grey")}>Grey Mouse</button>
            <input type="number" className="gag-input" style={{ width: 100 }} placeholder="XP per 10m" value={greyMouseXp} onChange={(e) => setGreyMouseXp(e.target.value)} />
          </div>
          <div className="gag-row">
            <button type="button" className={`gag-mutation-btn ${starfishActive ? "active" : ""}`} onClick={toggleStarfish}>Starfish</button>
            <input type="number" className="gag-input" style={{ width: 100 }} placeholder="Starfish XP/s" value={starfishXp} onChange={(e) => setStarfishXp(e.target.value)} />
          </div>
          <label className="gag-field">
            <span>Additional XP/s</span>
            <input type="number" className="gag-input" style={{ width: 100 }} value={customXpPerSecond} onChange={(e) => setCustomXpPerSecond(e.target.value)} />
          </label>
          <label className="gag-field">
            <span>Additional XP%</span>
            <input type="number" className="gag-input" style={{ width: 100 }} value={extraXpPercent} onChange={(e) => setExtraXpPercent(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 300 }}>
          <span style={{ width: "100%" }} className="gag-muted">Owls Individual XP/s:</span>
          {owlXpInputs.map((v, i) => (
            <input key={i} type="number" className="gag-input" style={{ width: 90 }} placeholder={`Owl ${i + 1}`} value={v} onChange={(e) => setOwlXpInput(i, e.target.value)} />
          ))}
        </div>
      </div>

      <button type="button" className="gag-btn" style={{ marginTop: 16 }} onClick={calculatePetGrowth}>Calculate Growth</button>

      {petGrowthResult && (
        <div className="gag-result-box">
          {petGrowthResult.error ? (
            <span style={{ color: "var(--gag-error)" }}>{petGrowthResult.error}</span>
          ) : (
            <>
              XP Rate: <strong>≈{petGrowthResult.totalXpRate.toFixed(2)} XP/s</strong><br />
              Total XP Required: <strong>{petGrowthResult.totalXpRequired}</strong><br />
              Time: <strong>{petGrowthResult.timeInSeconds.toFixed(0)}s</strong> ({petGrowthResult.timeInHours.toFixed(2)} hrs)
            </>
          )}
        </div>
      )}
    </div>
  );
}
