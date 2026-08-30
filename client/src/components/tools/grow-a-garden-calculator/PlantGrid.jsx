import GrowAGardenIcon from "./GrowAGardenIcon";
import { plantEmoji } from "../../../data/growAGarden/growAGardenIcons";

export default function PlantGrid({ categories, category, setCategory, plantQuery, setPlantQuery, filteredPlants, selectedPlant, selectPlant }) {
  return (
    <div className="gag-panel">
      <input
        type="text"
        className="gag-input"
        placeholder="Search for a plant..."
        value={plantQuery}
        maxLength={60}
        onChange={(e) => setPlantQuery(e.target.value)}
        aria-label="Search for a plant"
      />

      <div className="gag-tab-row" role="tablist" aria-label="Plant categories">
        {categories.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={category === c} className={`gag-tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="gag-grid">
        {filteredPlants.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`gag-item ${selectedPlant?.id === p.id ? "active" : ""}`}
            onClick={() => selectPlant(p.id)}
            aria-pressed={selectedPlant?.id === p.id}
          >
            <GrowAGardenIcon id={p.id} emoji={plantEmoji(p.id)} />
            <span className="gag-item-label">{p.label}</span>
          </button>
        ))}
        {filteredPlants.length === 0 && <p className="gag-muted">No plants match your search.</p>}
      </div>
    </div>
  );
}
