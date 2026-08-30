import GrowAGardenIcon from "./GrowAGardenIcon";
import { petEmoji } from "../../../data/growAGarden/growAGardenIcons";

function labelFor(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function PetAbilityPanel({
  petAbilityQuery, setPetAbilityQuery, filteredAbilityPetIds,
  selectedAbilityPetId, selectAbilityPet,
  abilityAge, setAbilityAge, abilityWeight, setAbilityWeight,
  rarity, setRarity, smallToy, setSmallToy, mediumToy, setMediumToy,
  abilityResult, calculatePetAbility,
}) {
  return (
    <div className="gag-panel">
      <input
        type="text"
        className="gag-input"
        placeholder="Search for a pet..."
        value={petAbilityQuery}
        maxLength={40}
        onChange={(e) => setPetAbilityQuery(e.target.value)}
        aria-label="Search for a pet"
      />

      <div className="gag-grid" style={{ marginTop: 10 }}>
        {filteredAbilityPetIds.map((id) => (
          <button
            key={id}
            type="button"
            className={`gag-item ${selectedAbilityPetId === id ? "active" : ""}`}
            onClick={() => selectAbilityPet(id)}
            aria-pressed={selectedAbilityPetId === id}
          >
            <GrowAGardenIcon id={id} emoji={petEmoji(id)} />
            <span className="gag-item-label">{labelFor(id)}</span>
          </button>
        ))}
      </div>

      {selectedAbilityPetId && (
        <div className="gag-panel" style={{ marginTop: 14 }}>
          <div className="gag-row" style={{ flexWrap: "wrap", gap: 16 }}>
            <label className="gag-field">
              <span>Age</span>
              <input type="number" min="1" max="100" className="gag-input" style={{ width: 80 }} value={abilityAge} onChange={(e) => setAbilityAge(e.target.value)} />
            </label>
            <label className="gag-field">
              <span>Weight</span>
              <input type="number" min="0" step="0.01" className="gag-input" style={{ width: 90 }} value={abilityWeight} onChange={(e) => setAbilityWeight(e.target.value)} />
            </label>
          </div>

          <div className="gag-row" style={{ marginTop: 10, gap: 14 }}>
            <label><input type="radio" name="gagRarity" checked={rarity === "normal"} onChange={() => setRarity("normal")} /> Normal</label>
            <label><input type="radio" name="gagRarity" checked={rarity === "golden"} onChange={() => setRarity("golden")} /> Golden (+10%)</label>
            <label><input type="radio" name="gagRarity" checked={rarity === "rainbow"} onChange={() => setRarity("rainbow")} /> Rainbow (+20%)</label>
          </div>
          <div className="gag-row" style={{ marginTop: 6 }}>
            <label><input type="checkbox" checked={smallToy} onChange={(e) => setSmallToy(e.target.checked)} /> Small Toy (+10%)</label>
            <label><input type="checkbox" checked={mediumToy} onChange={(e) => setMediumToy(e.target.checked)} /> Medium Toy (+20%)</label>
          </div>

          <button type="button" className="gag-btn" style={{ marginTop: 12 }} onClick={calculatePetAbility}>Calculate</button>

          {abilityResult && (
            <div className="gag-result-box">
              {abilityResult.error ? (
                <span style={{ color: "var(--gag-error)" }}>{abilityResult.error}</span>
              ) : (
                <>
                  <p style={{ whiteSpace: "pre-wrap" }}>{abilityResult.description}</p>
                  <div className="gag-row" style={{ flexWrap: "wrap", gap: 10 }}>
                    {abilityResult.currentStats.map((s) => <div key={s.label}><strong>{s.label}:</strong> {s.value}</div>)}
                  </div>
                  <hr style={{ border: "none", borderTop: "1px solid var(--gag-border)", margin: "10px 0" }} />
                  <h4>Stats at Age 100 (Weight: {abilityResult.weightAt100.toFixed(2)}):</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{abilityResult.description100}</p>
                  <div className="gag-row" style={{ flexWrap: "wrap", gap: 10 }}>
                    {abilityResult.maxStats.map((s) => <div key={s.label}><strong>{s.label}:</strong> {s.value}</div>)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
