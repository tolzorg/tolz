export default function EggHatchPanel({
  eggHatchHours, setEggHatchHours, eggHatchMinutes, setEggHatchMinutes, hatchSpeedBonus, setHatchSpeedBonus,
  kiwiCount, setKiwiCount, kiwiRows, setKiwiRow,
  eagleCount, setEagleCount, eagleRows, setEagleRow,
  eggHatchResult, calculateEggHatch, resetEggHatch,
}) {
  return (
    <div className="gag-panel">
      <div className="gag-row" style={{ flexWrap: "wrap", gap: 30 }}>
        <label className="gag-field">
          <span>Egg Hatch Time</span>
          <div className="gag-row">
            <input type="number" min="0" className="gag-input" style={{ width: 70 }} placeholder="Hours" value={eggHatchHours} onChange={(e) => setEggHatchHours(e.target.value)} /> h
            <input type="number" min="0" max="59" className="gag-input" style={{ width: 70 }} placeholder="Minutes" value={eggHatchMinutes} onChange={(e) => setEggHatchMinutes(e.target.value)} /> min
          </div>
        </label>
        <label className="gag-field">
          <span>Total Hatch Speed Bonus (%)</span>
          <input type="number" min="0" max="1000" step="0.01" className="gag-input" style={{ width: 100 }} value={hatchSpeedBonus} onChange={(e) => setHatchSpeedBonus(e.target.value)} />
        </label>
        <label className="gag-field">
          <span>Number of Kiwis</span>
          <input type="number" min="0" max="8" className="gag-input" style={{ width: 70 }} value={kiwiCount} onChange={(e) => setKiwiCount(e.target.value)} />
        </label>
        <label className="gag-field">
          <span>Number of Eagles</span>
          <input type="number" min="0" max="10" className="gag-input" style={{ width: 70 }} value={eagleCount} onChange={(e) => setEagleCount(e.target.value)} />
        </label>
      </div>

      <div className="gag-row" style={{ marginTop: 16, alignItems: "flex-start", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {kiwiRows.map((row, i) => (
            <div key={i} className="gag-muted">
              Kiwi {i + 1}: Every <input type="number" className="gag-input" style={{ width: 70 }} placeholder="Cooldown (s)" value={row.cooldown} onChange={(e) => setKiwiRow(i, "cooldown", e.target.value)} />s,
              reduce by <input type="number" className="gag-input" style={{ width: 70 }} placeholder="Reduce (s)" value={row.reduction} onChange={(e) => setKiwiRow(i, "reduction", e.target.value)} />s
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {eagleRows.map((row, i) => (
            <div key={i} className="gag-muted">
              Eagle {i + 1}: Every <input type="number" className="gag-input" style={{ width: 70 }} placeholder="Cooldown (s)" value={row.cooldown} onChange={(e) => setEagleRow(i, "cooldown", e.target.value)} />s,
              reduce by <input type="number" className="gag-input" style={{ width: 70 }} placeholder="Reduce (s)" value={row.reduction} onChange={(e) => setEagleRow(i, "reduction", e.target.value)} />s,
              2x: <input type="number" className="gag-input" style={{ width: 50 }} placeholder="%" value={row.chance} onChange={(e) => setEagleRow(i, "chance", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="gag-row" style={{ marginTop: 16 }}>
        <button type="button" className="gag-btn" onClick={calculateEggHatch}>Calculate Hatch Time</button>
        <button type="button" className="gag-btn-ghost" onClick={resetEggHatch}>Reset</button>
      </div>

      {eggHatchResult && (
        <div className="gag-result-box">
          Final hatch time: <strong>{eggHatchResult.hours}h {eggHatchResult.minutes}min {eggHatchResult.seconds}s</strong>
        </div>
      )}
    </div>
  );
}
