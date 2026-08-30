import { useGrowAGardenCalculator } from "./useGrowAGardenCalculator";
import PlantGrid from "./PlantGrid";
import MutationPanel from "./MutationPanel";
import ValueResultPanel from "./ValueResultPanel";
import PetXpPanel from "./PetXpPanel";
import EggHatchPanel from "./EggHatchPanel";
import PetWeightPanel from "./PetWeightPanel";
import PetAbilityPanel from "./PetAbilityPanel";

const SPECIAL_MODES = [
  { id: "petXp", label: "Pet XP" },
  { id: "eggHatch", label: "Egg Hatch Speed" },
  { id: "petWeight", label: "Pet Weight by Age" },
  { id: "petAbility", label: "Pet Ability" },
];

export default function GrowAGardenCalculatorTool() {
  const g = useGrowAGardenCalculator();

  return (
    <div className="gag-root">
      {/* Scoped dark theme — matches the reference calculator's own dark
          UI, kept local to this tool (not a site-wide dark mode) via a
          component-scoped stylesheet, same pattern as other tools'
          tool-local <style> blocks. */}
      <style>{`
        .gag-root {
          --gag-bg: #14161a; --gag-panel: #1c1f26; --gag-border: #2b2f38;
          --gag-text: #e8e8ea; --gag-muted: #9a9fab; --gag-accent: #6ee7a0;
          --gag-error: #ff8a8a;
          background: var(--gag-bg); color: var(--gag-text);
          border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px;
          font-family: var(--font-body, inherit);
        }
        .gag-panel { background: var(--gag-panel); border: 1px solid var(--gag-border); border-radius: 10px; padding: 16px; }
        .gag-heading { font-size: 16px; }
        .gag-muted { color: var(--gag-muted); font-size: 14px; }
        .gag-row { display: flex; align-items: center; gap: 10px; }
        .gag-field { display: flex; flex-direction: column; gap: 5px; font-size: 14px; color: var(--gag-muted); }
        .gag-input {
          background: #0f1115; border: 1px solid var(--gag-border); color: var(--gag-text);
          border-radius: 6px; padding: 9px 12px; font-size: 15px; outline: none;
        }
        .gag-input:focus-visible { border-color: var(--gag-accent); }
        .gag-tab-row { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0; }
        .gag-tab {
          background: #23262e; border: 1px solid var(--gag-border); color: var(--gag-muted);
          border-radius: 6px; padding: 8px 15px; font-size: 14.5px; cursor: pointer;
        }
        .gag-tab.active, .gag-tab:hover { color: var(--gag-text); border-color: var(--gag-accent); }
        .gag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 10px; max-height: 480px; overflow-y: auto; padding: 4px; }
        .gag-item {
          background: #23262e; border: 1px solid var(--gag-border); border-radius: 8px; padding: 10px 6px;
          display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; color: var(--gag-text);
        }
        .gag-item.active { border-color: var(--gag-accent); box-shadow: 0 0 0 1px var(--gag-accent); }
        .gag-item-label { font-size: 13.5px; text-align: center; word-break: break-word; }
        .gag-mutation-grid { display: flex; flex-wrap: wrap; gap: 7px; max-height: 300px; overflow-y: auto; padding: 4px 0; }
        .gag-mutation-btn {
          background: #23262e; border: 1px solid var(--gag-border); color: var(--gag-muted);
          border-radius: 6px; padding: 7px 13px; font-size: 14px; cursor: pointer;
        }
        .gag-mutation-btn.active { background: #2c313c; font-weight: 700; }
        .gag-mutation-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .gag-formula { font-size: 14px; color: var(--gag-accent); margin: 6px 0; }
        .gag-btn {
          background: var(--gag-accent); color: #0f1115; border: none; border-radius: 6px;
          padding: 10px 16px; font-size: 15px; font-weight: 700; cursor: pointer;
        }
        .gag-btn-ghost {
          background: transparent; color: var(--gag-muted); border: 1px solid var(--gag-border);
          border-radius: 6px; padding: 9px 14px; font-size: 14.5px; cursor: pointer;
        }
        .gag-result { font-size: 36px; font-weight: 800; color: var(--gag-accent); }
        .gag-result-box { background: #0f1115; border: 1px solid var(--gag-border); border-radius: 8px; padding: 14px; margin-top: 12px; font-size: 15.5px; color: var(--gag-accent); }
        .gag-entry-list { list-style: none; margin: 0 0 10px; padding: 0; display: flex; flex-direction: column; gap: 7px; font-size: 14px; }
        .gag-age-list { max-height: 220px; overflow-y: auto; background: #0f1115; border: 1px solid var(--gag-border); border-radius: 6px; padding: 10px; color: var(--gag-muted); font-size: 14px; }
        .gag-root input[type="radio"], .gag-root input[type="checkbox"] { accent-color: var(--gag-accent); width: 15px; height: 15px; }
        .gag-root label { color: var(--gag-muted); font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
      `}</style>

      <div className="gag-panel">
        <div className="gag-tab-row" role="tablist" aria-label="Calculator mode" style={{ margin: 0 }}>
          <button type="button" role="tab" aria-selected={g.mode === "value"} className={`gag-tab ${g.mode === "value" ? "active" : ""}`} onClick={() => g.setMode("value")}>
            Plant Value
          </button>
          {SPECIAL_MODES.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={g.mode === m.id} className={`gag-tab ${g.mode === m.id ? "active" : ""}`} onClick={() => g.setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {g.mode === "value" && (
        <>
          <PlantGrid
            categories={g.categories} category={g.category} setCategory={g.setCategory}
            plantQuery={g.plantQuery} setPlantQuery={g.setPlantQuery}
            filteredPlants={g.filteredPlants} selectedPlant={g.selectedPlant} selectPlant={g.selectPlant}
          />
          <MutationPanel
            tierMutations={g.tierMutations} activeTier={g.activeTier} setTier={g.setTier}
            visibleMutations={g.visibleMutations} activeMutationIds={g.activeMutationIds} lockedMutationIds={g.lockedMutationIds}
            toggleMutation={g.toggleMutation} clearMutations={g.clearMutations} maxMutations={g.maxMutations}
            hideAdminMutations={g.hideAdminMutations} setHideAdminMutations={g.setHideAdminMutations}
            mutationQuery={g.mutationQuery} setMutationQuery={g.setMutationQuery}
          />
          <ValueResultPanel
            selectedPlant={g.selectedPlant} weight={g.weight} setWeight={g.setWeight}
            amount={g.amount} setAmount={g.setAmount} friendBoostStep={g.friendBoostStep} setFriendBoostStep={g.setFriendBoostStep}
            valueResultDisplay={g.valueResultDisplay}
            valueToWeightMode={g.valueToWeightMode} setValueToWeightMode={g.setValueToWeightMode}
            valueInput={g.valueInput} setValueInput={g.setValueInput} weightFromValueResult={g.weightFromValueResult}
            addToList={g.addToList} plantEntries={g.plantEntries} removeEntry={g.removeEntry}
            clearEntries={g.clearEntries} entriesTotal={g.entriesTotal}
          />
        </>
      )}

      {g.mode === "petXp" && (
        <PetXpPanel
          currentAge={g.currentAge} setCurrentAge={g.setCurrentAge} targetAge={g.targetAge} setTargetAge={g.setTargetAge}
          owlCount={g.owlCount} setOwlCount={g.setOwlCount} owlXpInputs={g.owlXpInputs} setOwlXpInput={g.setOwlXpInput}
          mouseBoost={g.mouseBoost} setMouseBoost={g.setMouseBoost} brownMouseXp={g.brownMouseXp} setBrownMouseXp={g.setBrownMouseXp}
          greyMouseXp={g.greyMouseXp} setGreyMouseXp={g.setGreyMouseXp}
          starfishActive={g.starfishActive} toggleStarfish={g.toggleStarfish} starfishXp={g.starfishXp} setStarfishXp={g.setStarfishXp}
          extraXpPercent={g.extraXpPercent} setExtraXpPercent={g.setExtraXpPercent}
          customXpPerSecond={g.customXpPerSecond} setCustomXpPerSecond={g.setCustomXpPerSecond}
          petGrowthResult={g.petGrowthResult} calculatePetGrowth={g.calculatePetGrowth}
        />
      )}

      {g.mode === "eggHatch" && (
        <EggHatchPanel
          eggHatchHours={g.eggHatchHours} setEggHatchHours={g.setEggHatchHours}
          eggHatchMinutes={g.eggHatchMinutes} setEggHatchMinutes={g.setEggHatchMinutes}
          hatchSpeedBonus={g.hatchSpeedBonus} setHatchSpeedBonus={g.setHatchSpeedBonus}
          kiwiCount={g.kiwiCount} setKiwiCount={g.setKiwiCount} kiwiRows={g.kiwiRows} setKiwiRow={g.setKiwiRow}
          eagleCount={g.eagleCount} setEagleCount={g.setEagleCount} eagleRows={g.eagleRows} setEagleRow={g.setEagleRow}
          eggHatchResult={g.eggHatchResult} calculateEggHatch={g.calculateEggHatch} resetEggHatch={g.resetEggHatch}
        />
      )}

      {g.mode === "petWeight" && (
        <PetWeightPanel
          petWeightAge={g.petWeightAge} setPetWeightAge={g.setPetWeightAge}
          petWeightCurrent={g.petWeightCurrent} setPetWeightCurrent={g.setPetWeightCurrent}
          age1Tier={g.age1Tier} petWeightTable={g.petWeightTable} calculatePetWeight={g.calculatePetWeight}
          showAgeList={g.showAgeList} setShowAgeList={g.setShowAgeList}
        />
      )}

      {g.mode === "petAbility" && (
        <PetAbilityPanel
          petAbilityQuery={g.petAbilityQuery} setPetAbilityQuery={g.setPetAbilityQuery}
          filteredAbilityPetIds={g.filteredAbilityPetIds}
          selectedAbilityPetId={g.selectedAbilityPetId} selectAbilityPet={g.selectAbilityPet}
          abilityAge={g.abilityAge} setAbilityAge={g.setAbilityAge} abilityWeight={g.abilityWeight} setAbilityWeight={g.setAbilityWeight}
          rarity={g.rarity} setRarity={g.setRarity} smallToy={g.smallToy} setSmallToy={g.setSmallToy}
          mediumToy={g.mediumToy} setMediumToy={g.setMediumToy}
          abilityResult={g.abilityResult} calculatePetAbility={g.calculatePetAbility}
        />
      )}
    </div>
  );
}
