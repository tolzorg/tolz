#!/usr/bin/env node
// Reference/regression test suite for the Grow a Garden Calculator's
// engine modules. Plain Node + assert, matching this project's
// established convention for engine-level test scripts.
//
// Run with: node scripts/grow-a-garden-calculator.test.js

import { GROW_A_GARDEN_PLANTS, GROW_A_GARDEN_PLANT_CATEGORIES } from "../src/data/growAGarden/growAGardenPlants.js";
import {
  GROW_A_GARDEN_MUTATIONS, GROW_A_GARDEN_TIER_MUTATIONS, GROW_A_GARDEN_MUTATION_CONFLICTS, WET_GROUP, PASTA_TRIO,
} from "../src/data/growAGarden/growAGardenMutations.js";
import { toggleMutationWithConflicts, computeLockedMutationIds, computeMaxMutationSet } from "../src/utils/growAGardenMutationEngine.js";
import { createGrowAGardenPetsData, GROW_A_GARDEN_PET_IDS } from "../src/data/growAGarden/growAGardenPets.js";
import {
  calculateBaseValue, fruitTierMultiplier, calculatePlantValue, calculateWeightFromValue,
  getPlantBaseMultiplier, formatShortNumber, formatValueResult,
} from "../src/utils/growAGardenValueEngine.js";
import { xpForAge, sumXpBetweenLevels, calculatePetGrowthTime } from "../src/utils/growAGardenPetGrowthEngine.js";
import { simulateEggHatch } from "../src/utils/growAGardenEggHatchEngine.js";
import { age1BaseWeight, classifyAge1Weight, computeWeightByAgeTable } from "../src/utils/growAGardenPetWeightEngine.js";
import { evaluatePetAbility, formatSeconds } from "../src/utils/growAGardenPetAbilityEngine.js";
import { PLANT_EMOJI, PET_EMOJI, plantEmoji, petEmoji } from "../src/data/growAGarden/growAGardenIcons.js";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(detail ? `${name}: ${detail}` : name); }
}
function near(a, b, tol = 1e-6) { return Math.abs(a - b) <= tol; }

// ─────────────────────────────────────────────────────────────────
// Data integrity
// ─────────────────────────────────────────────────────────────────
ok("172 plants extracted", GROW_A_GARDEN_PLANTS.length === 172, `got ${GROW_A_GARDEN_PLANTS.length}`);
ok("every plant has a unique id", new Set(GROW_A_GARDEN_PLANTS.map((p) => p.id)).size === GROW_A_GARDEN_PLANTS.length);
ok("every plant has positive minWeight/flatValue/coefficient", GROW_A_GARDEN_PLANTS.every((p) => p.minWeight > 0 && p.flatValue > 0 && p.coefficient > 0));
// One plant (greenapple) has no shop/event tag in the reference's own
// source data — it's only reachable via the implicit "All" category,
// which every plant belongs to regardless of its categories[] list.
// That's a faithfully-ported quirk of the source, not an extraction bug.
{
  const untagged = GROW_A_GARDEN_PLANTS.filter((p) => p.categories.length === 0).map((p) => p.id);
  ok("only the known untagged plant lacks an explicit category", untagged.length === 0 || (untagged.length === 1 && untagged[0] === "greenapple"), JSON.stringify(untagged));
}
ok("15 plant categories in the reference's own order", GROW_A_GARDEN_PLANT_CATEGORIES.length === 15);

ok("74 stacking mutations extracted", GROW_A_GARDEN_MUTATIONS.length === 74, `got ${GROW_A_GARDEN_MUTATIONS.length}`);
ok("3 tier mutations (Rainbow/Gold/Silver)", GROW_A_GARDEN_TIER_MUTATIONS.length === 3);
ok("every mutation has a positive multiplier", GROW_A_GARDEN_MUTATIONS.every((m) => m.multiplier > 0));
ok("no duplicate mutation ids", new Set(GROW_A_GARDEN_MUTATIONS.map((m) => m.id)).size === GROW_A_GARDEN_MUTATIONS.length);

ok("73 pets extracted", GROW_A_GARDEN_PET_IDS.length === 73, `got ${GROW_A_GARDEN_PET_IDS.length}`);
{
  const petsData = createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 });
  ok("every pet has at least one formula", Object.values(petsData).every((p) => p.formulas.length > 0));
  ok("every pet formula is callable and returns a finite number", Object.values(petsData).every((p) => p.formulas.every((f) => isFinite(f.formula(5)))));
}

// ─────────────────────────────────────────────────────────────────
// Plant value engine
// ─────────────────────────────────────────────────────────────────
const carrot = GROW_A_GARDEN_PLANTS.find((p) => p.id === "carrot");
ok("carrot exists with expected reference values", carrot && near(carrot.minWeight, 0.24) && carrot.flatValue === 18 && carrot.coefficient === 275);

ok("baseValue at/under minWeight returns flatValue", calculateBaseValue(carrot, carrot.minWeight) === carrot.flatValue);
ok("baseValue above minWeight uses coefficient*weight^2", calculateBaseValue(carrot, carrot.minWeight * 2) === carrot.coefficient * Math.pow(carrot.minWeight * 2, 2));
ok("baseValue handles zero/negative weight safely", calculateBaseValue(carrot, 0) === carrot.flatValue && calculateBaseValue(carrot, -5) === 0);
ok("baseValue handles a missing plant safely", calculateBaseValue(null, 5) === 0);

ok("fruitTierMultiplier: rainbow=50", fruitTierMultiplier("rainbow") === 50);
ok("fruitTierMultiplier: gold=20", fruitTierMultiplier("gold") === 20);
ok("fruitTierMultiplier: silver=5", fruitTierMultiplier("silver") === 5);
ok("fruitTierMultiplier: none=1", fruitTierMultiplier(null) === 1);

{
  const noMods = calculatePlantValue({ plant: carrot, weight: carrot.minWeight, tier: null, activeMutations: [], amount: 1, friendBoostStep: 0 });
  ok("no mutations, no tier -> value = flatValue", noMods === carrot.flatValue, `got ${noMods}`);

  const shocked = GROW_A_GARDEN_MUTATIONS.find((m) => m.id === "shocked");
  const withRainbowShocked = calculatePlantValue({ plant: carrot, weight: carrot.minWeight, tier: "rainbow", activeMutations: [shocked], amount: 1, friendBoostStep: 0 });
  // formula: ceil(18 * 50 * (1 + 100 - 1)) = 18*50*100 = 90000
  ok("rainbow + shocked matches hand-computed formula", withRainbowShocked === 90000, `got ${withRainbowShocked}`);

  const withAmount = calculatePlantValue({ plant: carrot, weight: carrot.minWeight, tier: null, activeMutations: [], amount: 3, friendBoostStep: 0 });
  ok("amount multiplies the result", withAmount === carrot.flatValue * 3, `got ${withAmount}`);

  const withFriendBoost = calculatePlantValue({ plant: carrot, weight: carrot.minWeight, tier: null, activeMutations: [], amount: 1, friendBoostStep: 5 });
  ok("50% friend boost (step 5) multiplies by 1.5", withFriendBoost === Math.ceil(carrot.flatValue) * 1.5, `got ${withFriendBoost}`);
}

ok("formatShortNumber matches reference example (9960 -> 9.960 Thousand)", formatShortNumber(9960) === "9.960 Thousand");
ok("formatValueResult matches reference example exactly", formatValueResult(9960) === "≈$9,960 (9.960 Thousand)");

{
  const coefficient = getPlantBaseMultiplier(carrot);
  ok("getPlantBaseMultiplier returns carrot's own coefficient", near(coefficient, carrot.coefficient, 0.01), `got ${coefficient}`);

  const value = calculatePlantValue({ plant: carrot, weight: 1, tier: null, activeMutations: [], amount: 1, friendBoostStep: 0 });
  const reversed = calculateWeightFromValue({ plant: carrot, value, tier: null, activeMutations: [], amount: 1, friendBoostStep: 0 });
  ok("reverse (value->weight) round-trips forward calculation", reversed && near(reversed.weight, 1, 0.01), `got ${reversed?.weight}`);
}

// ─────────────────────────────────────────────────────────────────
// Pet growth / XP engine
// ─────────────────────────────────────────────────────────────────
ok("xpForAge(1) = 20", xpForAge(1) === 20);
ok("xpForAge(2) = 81", xpForAge(2) === 81);
ok("xpForAge(3) follows the recurrence (2*81-20+43=185)", xpForAge(3) === 185);
ok("sumXpBetweenLevels(1,3) = xpForAge(1)+xpForAge(2)", sumXpBetweenLevels(1, 3) === xpForAge(1) + xpForAge(2));

{
  const result = calculatePetGrowthTime({ currentAge: 1, targetAge: 2, owlXpRates: [] });
  ok("growth time uses baseXpRate=0.52 with no boosts", near(result.totalXpRate, 0.52));
  ok("growth time = totalXpRequired / totalXpRate", near(result.timeInSeconds, 20 / 0.52));
}
ok("growth rejects targetAge <= currentAge", !!calculatePetGrowthTime({ currentAge: 5, targetAge: 2, owlXpRates: [] }).error);
ok("growth rejects out-of-range ages", !!calculatePetGrowthTime({ currentAge: 1, targetAge: 200, owlXpRates: [] }).error);
ok("growth caps owls at 8 without a mouse/starfish", !!calculatePetGrowthTime({ currentAge: 1, targetAge: 2, owlXpRates: Array(9).fill(0.25) }).error);
ok("growth caps owls at 7 when a mouse is active", !!calculatePetGrowthTime({ currentAge: 1, targetAge: 2, owlXpRates: Array(8).fill(0.25), mouseBoost: "brown" }).error);

// ─────────────────────────────────────────────────────────────────
// Egg hatch engine
// ─────────────────────────────────────────────────────────────────
{
  const r = simulateEggHatch({ hatchTimeSeconds: 100, speedBonusPercent: 0, kiwis: [], eagles: [] });
  ok("egg hatch with no boosts takes exactly the input seconds", r.totalSeconds === 100, `got ${r.totalSeconds}`);
}
{
  const r = simulateEggHatch({ hatchTimeSeconds: 100, speedBonusPercent: 100, kiwis: [], eagles: [] }); // 2x speed
  ok("100% speed bonus roughly halves hatch time", r.totalSeconds === 50, `got ${r.totalSeconds}`);
}
{
  const r = simulateEggHatch({ hatchTimeSeconds: 100, speedBonusPercent: 0, kiwis: [{ cooldown: 10, reduction: 5 }], eagles: [] });
  ok("a kiwi reduces hatch time below the unboosted baseline", r.totalSeconds < 100, `got ${r.totalSeconds}`);
}
{
  const r = simulateEggHatch({ hatchTimeSeconds: 100, speedBonusPercent: 0, kiwis: [], eagles: [{ cooldown: 10, reduction: 5, chance: 100 }] }, () => 0); // rng()*100 < 100 always true -> always doubles
  ok("an eagle with 100% double-chance still reduces time (deterministic rng)", r.totalSeconds < 100, `got ${r.totalSeconds}`);
}
ok("egg hatch simulation terminates (never runs away)", simulateEggHatch({ hatchTimeSeconds: 0, speedBonusPercent: 0, kiwis: [], eagles: [] }).totalSeconds === 0);

// ─────────────────────────────────────────────────────────────────
// Pet weight-by-age engine
// ─────────────────────────────────────────────────────────────────
ok("age1BaseWeight at age 1 returns the input weight unchanged", age1BaseWeight(1, 5) === 5);
ok("age1BaseWeight at a higher age returns a smaller base weight", age1BaseWeight(10, 5) < 5);
ok("classifyAge1Weight tiers are ordered correctly", classifyAge1Weight(9).label === "Godly" && classifyAge1Weight(0).label === "Normal");
{
  const table = computeWeightByAgeTable(1, 2);
  ok("weight table has 100 rows (ages 1-100)", table.rows.length === 100);
  ok("weight table row 1 matches the input weight", near(table.rows[0].weight, 2));
  ok("weight table is monotonically increasing", table.rows.every((r, i) => i === 0 || r.weight >= table.rows[i - 1].weight));
}
ok("weight table rejects invalid input", !!computeWeightByAgeTable(200, 5).error);

// ─────────────────────────────────────────────────────────────────
// Pet ability engine
// ─────────────────────────────────────────────────────────────────
ok("formatSeconds formats correctly", formatSeconds(90) === "1:30" && formatSeconds(5) === "0:05");
{
  const petsData = createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 });
  const result = evaluatePetAbility(petsData, "lobster", 1, 5);
  ok("lobster ability at weight=5 matches hand-computed value", near(parseFloat(result.currentStats[0].value.split(":").length > 1 ? NaN : result.currentStats[0].value), 877.5) || result.currentStats[0].value === formatSeconds(877.5), `got ${JSON.stringify(result.currentStats[0])}`);
  ok("evaluatePetAbility fills in the description template", !result.description.includes("DisplayBox1"));
  ok("evaluatePetAbility returns stats for age 100 too", result.maxStats.length === result.currentStats.length);
}
ok("evaluatePetAbility returns null for an unknown pet", evaluatePetAbility(createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 }), "not-a-real-pet", 1, 5) === null);
ok("evaluatePetAbility rejects invalid age/weight", !!evaluatePetAbility(createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 }), "lobster", 1, -5).error);

{
  // Rarity/toy boosts must actually change the pet's computed ability values.
  const normal = createGrowAGardenPetsData({ isGold: false, isRainbow: false, toyPct: 0 });
  const golden = createGrowAGardenPetsData({ isGold: true, isRainbow: false, toyPct: 0.1 });
  const a = normal.lobster.formulas[0].formula(5);
  const b = golden.lobster.formulas[0].formula(5);
  ok("golden rarity + toy boost changes the computed ability value", a !== b, `normal=${a} golden=${b}`);
}

// ─────────────────────────────────────────────────────────────────
// Mutation conflict resolution ("Max Mutations" and manual toggling)
// ─────────────────────────────────────────────────────────────────
{
  // Amber family (conflictGroups): a HARD LOCK, not an auto-switch —
  // while Amber is active, Ancient Amber is un-clickable until Amber
  // is deactivated first, matching the reference's real interaction.
  let active = new Set();
  active = toggleMutationWithConflicts(active, "amber", { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS });
  const lockedWhileAmberActive = computeLockedMutationIds(active, { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS });
  ok("ancientamber is locked while amber is active", lockedWhileAmberActive.has("ancientamber"));

  const afterLockedClick = toggleMutationWithConflicts(active, "ancientamber", { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS });
  ok("clicking a locked conflicting mutation is a no-op", afterLockedClick.has("amber") && !afterLockedClick.has("ancientamber"));

  const afterDeactivate = toggleMutationWithConflicts(active, "amber", { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS });
  const afterSwitch = toggleMutationWithConflicts(afterDeactivate, "ancientamber", { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS });
  ok("deactivating amber first then unlocks ancientamber", !afterSwitch.has("amber") && afterSwitch.has("ancientamber"));
}
{
  // Wet/Chilled/Drenched/Frozen mutual exclusivity as a group.
  let active = new Set();
  active = toggleMutationWithConflicts(active, "wet", { wetGroup: WET_GROUP });
  active = toggleMutationWithConflicts(active, "frozen", { wetGroup: WET_GROUP });
  ok("activating frozen clears wet (WET_GROUP mutual exclusion)", !active.has("wet") && active.has("frozen"));
  const locked = computeLockedMutationIds(active, { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS, wetGroup: WET_GROUP });
  ok("frozen being active locks wet/chilled/drenched", locked.has("wet") && locked.has("chilled") && locked.has("drenched"));
  const afterLockedToggle = toggleMutationWithConflicts(active, "wet", { conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS, wetGroup: WET_GROUP });
  ok("toggling a locked mutation is a no-op", !afterLockedToggle.has("wet"));
}
{
  // Pasta + Sauce + Meatball -> Spaghetti special-case.
  let active = new Set();
  active = toggleMutationWithConflicts(active, "pasta", { pastaTrio: PASTA_TRIO });
  active = toggleMutationWithConflicts(active, "sauce", { pastaTrio: PASTA_TRIO });
  active = toggleMutationWithConflicts(active, "meatball", { pastaTrio: PASTA_TRIO });
  ok("completing the pasta trio collapses into Spaghetti", active.has("spaghetti") && !active.has("pasta") && !active.has("sauce") && !active.has("meatball"));
}
{
  const maxSet = computeMaxMutationSet(GROW_A_GARDEN_MUTATIONS, {
    excludedIds: new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => !m.includedInMaxPreset).map((m) => m.id)),
    adminIds: new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => m.isAdmin).map((m) => m.id)),
    hideAdmin: false,
    conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS,
    wetGroup: WET_GROUP,
    pastaTrio: PASTA_TRIO,
  });
  ok("Max Mutations force-activates Frozen", maxSet.has("frozen"));
  ok("Max Mutations force-deactivates Wet and Chilled", !maxSet.has("wet") && !maxSet.has("chilled"));
  ok("Max Mutations never activates an explicitly-excluded mutation (e.g. Shocked)", !maxSet.has("shocked"));
  ok("Max Mutations includes admin mutations when not hidden (e.g. Plasma)", maxSet.has("plasma"));
  // No two mutually-conflicting mutations ever end up simultaneously active.
  let anyConflict = false;
  for (const id of maxSet) {
    for (const conflictId of GROW_A_GARDEN_MUTATION_CONFLICTS[id] || []) {
      if (maxSet.has(conflictId)) anyConflict = true;
    }
  }
  ok("Max Mutations result contains no pairwise-conflicting mutations", !anyConflict);

  // cosmic/aurora/galactic are mutually conflicting and NONE are
  // excluded — a genuine three-way tie that must resolve to exactly
  // one winner, not zero and not more than one.
  const trioActive = ["cosmic", "aurora", "galactic"].filter((id) => maxSet.has(id));
  ok("a genuine three-way conflict (cosmic/aurora/galactic) resolves to exactly one winner", trioActive.length === 1, JSON.stringify(trioActive));
}
{
  const maxSetHidden = computeMaxMutationSet(GROW_A_GARDEN_MUTATIONS, {
    excludedIds: new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => !m.includedInMaxPreset).map((m) => m.id)),
    adminIds: new Set(GROW_A_GARDEN_MUTATIONS.filter((m) => m.isAdmin).map((m) => m.id)),
    hideAdmin: true,
    conflicts: GROW_A_GARDEN_MUTATION_CONFLICTS,
    wetGroup: WET_GROUP,
    pastaTrio: PASTA_TRIO,
  });
  ok("Max Mutations excludes admin mutations when Hide Admin Mutations is on", !maxSetHidden.has("plasma"));
}

// ─────────────────────────────────────────────────────────────────
// Icon coverage — every real plant/pet id must have its own emoji
// mapping (never silently falls back to a generic placeholder)
// ─────────────────────────────────────────────────────────────────
ok("every plant has an explicit emoji mapping", GROW_A_GARDEN_PLANTS.every((p) => p.id in PLANT_EMOJI), JSON.stringify(GROW_A_GARDEN_PLANTS.filter((p) => !(p.id in PLANT_EMOJI)).map((p) => p.id)));
ok("every pet has an explicit emoji mapping", GROW_A_GARDEN_PET_IDS.every((id) => id in PET_EMOJI), JSON.stringify(GROW_A_GARDEN_PET_IDS.filter((id) => !(id in PET_EMOJI))));
ok("plantEmoji falls back gracefully for an unknown id", plantEmoji("not-a-real-plant") === "🌱");
ok("petEmoji falls back gracefully for an unknown id", petEmoji("not-a-real-pet") === "🐾");

// ─────────────────────────────────────────────────────────────────
// Security / robustness — malicious or malformed input never crashes
// ─────────────────────────────────────────────────────────────────
{
  let threw = false;
  try {
    calculatePlantValue({ plant: carrot, weight: "<script>alert(1)</script>", tier: "rainbow", activeMutations: [], amount: "99999999999999", friendBoostStep: 999 });
  } catch { threw = true; }
  ok("calculatePlantValue never throws on malformed/malicious input", !threw);
}
{
  let threw = false;
  try { simulateEggHatch({ hatchTimeSeconds: -1, speedBonusPercent: -500, kiwis: [{ cooldown: -1, reduction: -1 }], eagles: [] }); } catch { threw = true; }
  ok("simulateEggHatch never throws on negative/malformed input", !threw);
}

// ─────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────
console.log(`\nGrow a Garden Calculator engine suite: ${pass} passed, ${fail} failed.`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
