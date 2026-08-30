const FRIEND_BOOST_LABELS = ["0%", "10%", "20%", "30%", "40%", "50%"];

export default function ValueResultPanel({
  selectedPlant, weight, setWeight, amount, setAmount, friendBoostStep, setFriendBoostStep,
  valueResultDisplay, valueToWeightMode, setValueToWeightMode, valueInput, setValueInput, weightFromValueResult,
  addToList, plantEntries, removeEntry, clearEntries, entriesTotal,
}) {
  if (!selectedPlant) {
    return <p className="gag-muted" style={{ textAlign: "center", padding: "20px 0" }}>Select a plant above to calculate its value.</p>;
  }

  return (
    <div className="gag-panel">
      <div className="gag-row" style={{ flexWrap: "wrap", gap: 20 }}>
        <label className="gag-field">
          <span>Weight (kg)</span>
          <input type="text" inputMode="decimal" className="gag-input" style={{ width: 110 }} value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))} />
        </label>
        <label className="gag-field">
          <span>Amount of plants</span>
          <input type="number" min="1" className="gag-input" style={{ width: 90 }} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
        </label>
        <label className="gag-field" style={{ minWidth: 180 }}>
          <span>Friend Boost: {FRIEND_BOOST_LABELS[friendBoostStep]}</span>
          <input
            type="range" min="0" max="5" step="1" value={friendBoostStep}
            onChange={(e) => setFriendBoostStep(parseInt(e.target.value, 10))}
            aria-label="Friend boost percentage"
          />
        </label>
      </div>

      {!valueToWeightMode ? (
        <>
          <p className="gag-muted" style={{ marginTop: 14, marginBottom: 4 }}>
            {selectedPlant.label} {parseFloat(weight || 0).toFixed(3)}kg would cost around:
          </p>
          <div className="gag-result">{valueResultDisplay}</div>
        </>
      ) : (
        <div style={{ marginTop: 14 }}>
          <label className="gag-field">
            <span>Target value ($)</span>
            <input type="text" className="gag-input" style={{ width: 160 }} value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="e.g. 9960" />
          </label>
          <p className="gag-result" style={{ fontSize: 20, marginTop: 10 }}>
            {weightFromValueResult
              ? weightFromValueResult.isAtOrBelowMin
                ? `Estimated weight: ≤${weightFromValueResult.weight.toFixed(3)} kg`
                : `Estimated weight: ≈${weightFromValueResult.weight.toFixed(3)} kg`
              : "Enter a valid value above."}
          </p>
        </div>
      )}

      <div className="gag-row" style={{ marginTop: 14 }}>
        <button type="button" className="gag-btn" onClick={addToList}>Add Plant value to list</button>
        <button type="button" className="gag-btn" onClick={() => setValueToWeightMode((v) => !v)}>Toggle Value to Weight Mode</button>
      </div>

      {plantEntries.length > 0 && (
        <div className="gag-panel" style={{ marginTop: 14 }}>
          <ul className="gag-entry-list">
            {plantEntries.map((e) => (
              <li key={e.id}>
                {e.line}
                <button type="button" className="gag-btn-ghost" style={{ marginLeft: 10 }} onClick={() => removeEntry(e.id)} aria-label="Remove entry">🗑</button>
              </li>
            ))}
          </ul>
          <div className="gag-row" style={{ justifyContent: "space-between" }}>
            <strong>Total Value: ${entriesTotal.toLocaleString()}</strong>
            <button type="button" className="gag-btn-ghost" onClick={clearEntries}>Clear List</button>
          </div>
        </div>
      )}
    </div>
  );
}
