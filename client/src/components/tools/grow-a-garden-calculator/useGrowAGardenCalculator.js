// Grow a Garden Calculator — React hook. Owns UI-facing state only;
// all calculation logic lives in the framework-agnostic engine modules
// under src/utils/growAGarden*.js.

import { useCallback, useMemo, useState } from "react";
import { GROW_A_GARDEN_PLANTS, GROW_A_GARDEN_PLANT_CATEGORIES } from "../../../data/growAGarden/growAGardenPlants";
import {
  GROW_A_GARDEN_MUTATIONS, GROW_A_GARDEN_TIER_MUTATIONS, GROW_A_GARDEN_MUTATION_CONFLICTS, WET_GROUP, PASTA_TRIO,
} from "../../../data/growAGarden/growAGardenMutations";
import { createGrowAGardenPetsData, GROW_A_GARDEN_PET_IDS } from "../../../data/growAGarden/growAGardenPets";
import {
  calculatePlantValue, calculateWeightFromValue, formatValueResult, FRIEND_BOOST_MULTIPLIERS,
} from "../../../utils/growAGardenValueEngine";
import { toggleMutationWithConflicts, computeMaxMutationSet, computeLockedMutationIds } from "../../../utils/growAGardenMutationEngine";
import { calculatePetGrowthTime } from "../../../utils/growAGardenPetGrowthEngine";
import { simulateEggHatch } from "../../../utils/growAGardenEggHatchEngine";
import { computeWeightByAgeTable, age1BaseWeight, classifyAge1Weight } from "../../../utils/growAGardenPetWeightEngine";
import { evaluatePetAbility } from "../../../utils/growAGardenPetAbilityEngine";

const ADMIN_MUTATION_IDS = new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => m.isAdmin).map((m) => m.id));
const EXCLUDED_FROM_MAX_IDS = new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => !m.includedInMaxPreset).map((m) => m.id));

const MODES = ["value", "petXp", "eggHatch", "petWeight", "petAbility"];
const MAX_OWLS = 8;
const MAX_KIWIS = 8;
const MAX_EAGLES = 10;

function parseNum(v, fallback = 0) {
  const n = parseFloat(v);
  return isFinite(n) ? n : fallback;
}

export function useGrowAGardenCalculator() {
  const [mode, setModeState] = useState("value");
  const setMode = useCallback((m) => setModeState(MODES.includes(m) ? m : "value"), []);

  // ── Value calculator ──────────────────────────────────────────────
  const [category, setCategory] = useState("All");
  const [plantQuery, setPlantQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [activeTier, setActiveTierState] = useState(null); // "rainbow" | "gold" | "silver" | null
  const [activeMutationIds, setActiveMutationIds] = useState(() => new Set());
  const [hideAdminMutations, setHideAdminMutations] = useState(false);
  const [mutationQuery, setMutationQuery] = useState("");
  const [weight, setWeight] = useState("1");
  const [amount, setAmount] = useState("1");
  const [friendBoostStep, setFriendBoostStep] = useState(0);
  const [valueToWeightMode, setValueToWeightMode] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [plantEntries, setPlantEntries] = useState([]);

  const selectedPlant = useMemo(() => GROW_A_GARDEN_PLANTS.find((p) => p.id === selectedPlantId) || null, [selectedPlantId]);

  const filteredPlants = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    return GROW_A_GARDEN_PLANTS.filter((p) => {
      const inCategory = category === "All" || p.categories.includes(category);
      const matchesQuery = !q || p.label.toLowerCase().includes(q);
      return inCategory && matchesQuery;
    });
  }, [category, plantQuery]);

  const visibleMutations = useMemo(() => {
    const q = mutationQuery.trim().toLowerCase();
    return GROW_A_GARDEN_MUTATIONS.filter((m) => (!hideAdminMutations || !m.isAdmin) && (!q || m.label.toLowerCase().includes(q)));
  }, [mutationQuery, hideAdminMutations]);

  const selectPlant = useCallback((id) => {
    setSelectedPlantId(id);
    const plant = GROW_A_GARDEN_PLANTS.find((p) => p.id === id);
    if (plant) setWeight(plant.minWeight.toFixed(3));
  }, []);

  const setTier = useCallback((tier) => setActiveTierState((prev) => (prev === tier ? null : tier)), []);

  // Toggling respects the reference's real conflict-resolution rules —
  // activating a mutation deactivates anything it conflicts with (e.g.
  // Amber/Ancient Amber/Old Amber are mutually exclusive), Wet/Chilled/
  // Drenched/Frozen are mutually exclusive as a group (Frozen also locks
  // the other three while active), and Pasta+Sauce+Meatball collapse
  // into Spaghetti if all three would end up active at once. Locked
  // (conflict-disabled) mutations are no-ops, matching the reference.
  const toggleMutation = useCallback((id) => {
    setActiveMutationIds((prev) =>
      toggleMutationWithConflicts(prev, id, { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS, wetGroup: WET_GROUP, pastaTrio: PASTA_TRIO })
    );
  }, []);

  const lockedMutationIds = useMemo(
    () => computeLockedMutationIds(activeMutationIds, { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS, wetGroup: WET_GROUP }),
    [activeMutationIds]
  );

  const clearMutations = useCallback(() => {
    setActiveTierState(null);
    setActiveMutationIds(new Set());
  }, []);

  // "Max Mutations" activates every eligible mutation through the same
  // conflict resolution (so genuinely-conflicting mutations never end
  // up simultaneously active), then force-activates Frozen and
  // force-deactivates Wet/Chilled — matching the reference's own final
  // step exactly. Admin mutations are included UNLESS currently hidden.
  const maxMutations = useCallback(() => {
    setActiveMutationIds(
      computeMaxMutationSet(GROW_A_GARDEN_MUTATIONS, {
        excludedIds: EXCLUDED_FROM_MAX_IDS,
        adminIds: ADMIN_MUTATION_IDS,
        hideAdmin: hideAdminMutations,
        conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS,
        wetGroup: WET_GROUP,
        pastaTrio: PASTA_TRIO,
      })
    );
  }, [hideAdminMutations]);

  const activeMutations = useMemo(
    () => GROW_A_GARDEN_MUTATIONS.filter((m) => activeMutationIds.has(m.id)),
    [activeMutationIds]
  );

  const valueResult = useMemo(() => {
    if (!selectedPlant) return null;
    return calculatePlantValue({
      plant: selectedPlant,
      weight: parseNum(weight),
      tier: activeTier,
      activeMutations,
      amount: parseInt(amount, 10) || 1,
      friendBoostStep,
    });
  }, [selectedPlant, weight, activeTier, activeMutations, amount, friendBoostStep]);

  const weightFromValueResult = useMemo(() => {
    if (!selectedPlant || !valueToWeightMode) return null;
    return calculateWeightFromValue({
      plant: selectedPlant,
      value: parseNum(valueInput.replace(/,/g, "")),
      tier: activeTier,
      activeMutations,
      amount: parseInt(amount, 10) || 1,
      friendBoostStep,
    });
  }, [selectedPlant, valueToWeightMode, valueInput, activeTier, activeMutations, amount, friendBoostStep]);

  const addToList = useCallback(() => {
    if (!selectedPlant || valueResult === null) return;
    const modDisplay = [...(activeTier ? [{ label: activeTier.charAt(0).toUpperCase() + activeTier.slice(1) }] : []), ...activeMutations]
      .map((m) => m.label)
      .join(" + ") || "No mutations";
    setPlantEntries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        line: `${amount}x (${modDisplay}) ${parseNum(weight).toFixed(2)}kg ${selectedPlant.label} = $${valueResult.toLocaleString()}`,
        value: valueResult,
      },
    ]);
  }, [selectedPlant, valueResult, activeTier, activeMutations, amount, weight]);

  const removeEntry = useCallback((id) => setPlantEntries((prev) => prev.filter((e) => e.id !== id)), []);
  const clearEntries = useCallback(() => setPlantEntries([]), []);
  const entriesTotal = useMemo(() => plantEntries.reduce((sum, e) => sum + e.value, 0), [plantEntries]);

  // ── Pet XP / Growth ──────────────────────────────────────────────
  const [currentAge, setCurrentAge] = useState("1");
  const [targetAge, setTargetAge] = useState("2");
  const [owlCount, setOwlCount] = useState("0");
  const [owlXpInputs, setOwlXpInputs] = useState([]);
  const [mouseBoost, setMouseBoostState] = useState(null); // "brown" | "grey" | null
  const [brownMouseXp, setBrownMouseXp] = useState("750");
  const [greyMouseXp, setGreyMouseXp] = useState("500");
  const [starfishActive, setStarfishActiveState] = useState(false);
  const [starfishXp, setStarfishXp] = useState("6.3");
  const [extraXpPercent, setExtraXpPercent] = useState("0");
  const [customXpPerSecond, setCustomXpPerSecond] = useState("0");
  const [petGrowthResult, setPetGrowthResult] = useState(null);

  const setOwlCountClamped = useCallback((v) => {
    const n = Math.min(MAX_OWLS, Math.max(0, parseInt(v, 10) || 0));
    setOwlCount(String(n));
    setOwlXpInputs((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? "0.25"));
  }, []);
  const setOwlXpInput = useCallback((i, v) => setOwlXpInputs((prev) => prev.map((x, idx) => (idx === i ? v : x))), []);

  const setMouseBoost = useCallback((type) => {
    setMouseBoostState((prev) => (prev === type ? null : type));
    setStarfishActiveState(false);
  }, []);
  const toggleStarfish = useCallback(() => {
    setStarfishActiveState((prev) => !prev);
    setMouseBoostState(null);
  }, []);

  const calculatePetGrowth = useCallback(() => {
    const result = calculatePetGrowthTime({
      currentAge: parseInt(currentAge, 10),
      targetAge: parseInt(targetAge, 10),
      owlXpRates: owlXpInputs.map((v) => parseNum(v)),
      mouseBoost,
      mouseXpPerInterval: mouseBoost === "brown" ? parseNum(brownMouseXp, 750) : mouseBoost === "grey" ? parseNum(greyMouseXp, 500) : null,
      starfishActive,
      starfishXpPerSecond: parseNum(starfishXp),
      extraXpPercent: parseNum(extraXpPercent),
      customXpPerSecond: parseNum(customXpPerSecond),
    });
    setPetGrowthResult(result);
  }, [currentAge, targetAge, owlXpInputs, mouseBoost, brownMouseXp, greyMouseXp, starfishActive, starfishXp, extraXpPercent, customXpPerSecond]);

  // ── Egg Hatch Speed ──────────────────────────────────────────────
  const [eggHatchHours, setEggHatchHours] = useState("");
  const [eggHatchMinutes, setEggHatchMinutes] = useState("");
  const [hatchSpeedBonus, setHatchSpeedBonus] = useState("0");
  const [kiwiCount, setKiwiCount] = useState("0");
  const [kiwiRows, setKiwiRows] = useState([]);
  const [eagleCount, setEagleCount] = useState("0");
  const [eagleRows, setEagleRows] = useState([]);
  const [eggHatchResult, setEggHatchResult] = useState(null);

  const setKiwiCountClamped = useCallback((v) => {
    setEagleCount((prevEagle) => {
      const eagleN = parseInt(prevEagle, 10) || 0;
      let n = Math.min(MAX_KIWIS, Math.max(0, parseInt(v, 10) || 0));
      if (n + eagleN > 8) n = Math.max(0, 8 - eagleN);
      setKiwiCount(String(n));
      setKiwiRows((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? { cooldown: "", reduction: "" }));
      return prevEagle;
    });
  }, []);
  const setEagleCountClamped = useCallback((v) => {
    setKiwiCount((prevKiwi) => {
      const kiwiN = parseInt(prevKiwi, 10) || 0;
      let n = Math.min(MAX_EAGLES, Math.max(0, parseInt(v, 10) || 0));
      if (n + kiwiN > 8) n = Math.max(0, 8 - kiwiN);
      setEagleCount(String(n));
      setEagleRows((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? { cooldown: "", reduction: "", chance: "" }));
      return prevKiwi;
    });
  }, []);
  const setKiwiRow = useCallback((i, field, v) => setKiwiRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: v } : r))), []);
  const setEagleRow = useCallback((i, field, v) => setEagleRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: v } : r))), []);

  const calculateEggHatch = useCallback(() => {
    const hatchTimeSeconds = parseNum(eggHatchHours) * 3600 + parseNum(eggHatchMinutes) * 60;
    const result = simulateEggHatch({
      hatchTimeSeconds,
      speedBonusPercent: parseNum(hatchSpeedBonus),
      kiwis: kiwiRows.map((r) => ({ cooldown: parseNum(r.cooldown), reduction: parseNum(r.reduction) })),
      eagles: eagleRows.map((r) => ({ cooldown: parseNum(r.cooldown), reduction: parseNum(r.reduction), chance: parseNum(r.chance) })),
    });
    setEggHatchResult(result);
  }, [eggHatchHours, eggHatchMinutes, hatchSpeedBonus, kiwiRows, eagleRows]);

  const resetEggHatch = useCallback(() => {
    setEggHatchHours(""); setEggHatchMinutes(""); setHatchSpeedBonus("0");
    setKiwiCount("0"); setKiwiRows([]); setEagleCount("0"); setEagleRows([]);
    setEggHatchResult(null);
  }, []);

  // ── Pet Weight by Age ────────────────────────────────────────────
  const [petWeightAge, setPetWeightAge] = useState("1");
  const [petWeightCurrent, setPetWeightCurrent] = useState("1.00");
  const [petWeightTable, setPetWeightTable] = useState(null);
  const [showAgeList, setShowAgeList] = useState(false);

  const age1Tier = useMemo(() => {
    const age = parseInt(petWeightAge, 10);
    const w = parseNum(petWeightCurrent, NaN);
    if (!Number.isInteger(age) || !isFinite(w) || age < 1 || age > 100 || w < 0) return null;
    const base = age1BaseWeight(age, w);
    return { base, ...classifyAge1Weight(base) };
  }, [petWeightAge, petWeightCurrent]);

  const calculatePetWeight = useCallback(() => {
    const result = computeWeightByAgeTable(parseInt(petWeightAge, 10), parseNum(petWeightCurrent, NaN));
    setPetWeightTable(result);
    setShowAgeList(true);
  }, [petWeightAge, petWeightCurrent]);

  // ── Pet Ability ──────────────────────────────────────────────────
  const [petAbilityQuery, setPetAbilityQuery] = useState("");
  const [selectedAbilityPetId, setSelectedAbilityPetId] = useState(null);
  const [abilityAge, setAbilityAge] = useState("1");
  const [abilityWeight, setAbilityWeight] = useState("1.00");
  const [rarity, setRarity] = useState("normal"); // normal | golden | rainbow
  const [smallToy, setSmallToy] = useState(false);
  const [mediumToy, setMediumToy] = useState(false);
  const [abilityResult, setAbilityResult] = useState(null);

  const filteredAbilityPetIds = useMemo(() => {
    const q = petAbilityQuery.trim().toLowerCase();
    return GROW_A_GARDEN_PET_IDS.filter((id) => !q || id.includes(q));
  }, [petAbilityQuery]);

  const petsData = useMemo(
    () => createGrowAGardenPetsData({ isGold: rarity === "golden", isRainbow: rarity === "rainbow", toyPct: (smallToy ? 0.1 : 0) + (mediumToy ? 0.2 : 0) }),
    [rarity, smallToy, mediumToy]
  );

  const selectAbilityPet = useCallback((id) => setSelectedAbilityPetId(id), []);

  const calculatePetAbility = useCallback(() => {
    if (!selectedAbilityPetId) return;
    const result = evaluatePetAbility(petsData, selectedAbilityPetId, parseInt(abilityAge, 10), parseNum(abilityWeight, NaN));
    setAbilityResult(result);
  }, [petsData, selectedAbilityPetId, abilityAge, abilityWeight]);

  return {
    mode, setMode,
    // value calculator
    category, setCategory, categories: GROW_A_GARDEN_PLANT_CATEGORIES,
    plantQuery, setPlantQuery, filteredPlants,
    selectedPlant, selectPlant,
    tierMutations: GROW_A_GARDEN_TIER_MUTATIONS, activeTier, setTier,
    visibleMutations, activeMutationIds, lockedMutationIds, toggleMutation, clearMutations, maxMutations,
    hideAdminMutations, setHideAdminMutations, mutationQuery, setMutationQuery,
    weight, setWeight, amount, setAmount, friendBoostStep, setFriendBoostStep, friendBoostMultipliers: FRIEND_BOOST_MULTIPLIERS,
    valueResult, valueResultDisplay: valueResult !== null ? formatValueResult(valueResult) : null,
    valueToWeightMode, setValueToWeightMode, valueInput, setValueInput, weightFromValueResult,
    plantEntries, addToList, removeEntry, clearEntries, entriesTotal,
    // pet xp/growth
    currentAge, setCurrentAge, targetAge, setTargetAge,
    owlCount, setOwlCount: setOwlCountClamped, owlXpInputs, setOwlXpInput,
    mouseBoost, setMouseBoost, brownMouseXp, setBrownMouseXp, greyMouseXp, setGreyMouseXp,
    starfishActive, toggleStarfish, starfishXp, setStarfishXp,
    extraXpPercent, setExtraXpPercent, customXpPerSecond, setCustomXpPerSecond,
    petGrowthResult, calculatePetGrowth,
    // egg hatch
    eggHatchHours, setEggHatchHours, eggHatchMinutes, setEggHatchMinutes, hatchSpeedBonus, setHatchSpeedBonus,
    kiwiCount, setKiwiCount: setKiwiCountClamped, kiwiRows, setKiwiRow,
    eagleCount, setEagleCount: setEagleCountClamped, eagleRows, setEagleRow,
    eggHatchResult, calculateEggHatch, resetEggHatch,
    // pet weight by age
    petWeightAge, setPetWeightAge, petWeightCurrent, setPetWeightCurrent,
    age1Tier, petWeightTable, calculatePetWeight, showAgeList, setShowAgeList,
    // pet ability
    petAbilityQuery, setPetAbilityQuery, filteredAbilityPetIds,
    selectedAbilityPetId, selectAbilityPet,
    abilityAge, setAbilityAge, abilityWeight, setAbilityWeight,
    rarity, setRarity, smallToy, setSmallToy, mediumToy, setMediumToy,
    abilityResult, calculatePetAbility,
  };
}
