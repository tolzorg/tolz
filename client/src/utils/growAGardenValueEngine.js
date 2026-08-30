// Grow a Garden Calculator — plant value engine. Pure functions,
// faithfully ported from the reference community calculator's formula:
//   fruitMultiplier = Rainbow ? 50 : Gold ? 20 : Silver ? 5 : 1
//   modifierMultiplier = 1 + sum(active mutation multipliers) − count(active mutations)
//   value = ceil(baseValue(weight) × fruitMultiplier × modifierMultiplier) × amount × friendBoostMultiplier
// where baseValue(weight) = weight <= plant.minWeight ? plant.flatValue : plant.coefficient × weight²

export const FRIEND_BOOST_MULTIPLIERS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]; // index = slider step (0%,10%,...,50%)

/** Base value for a plant at a given weight (kg) — the piecewise per-plant formula. */
export function calculateBaseValue(plant, weight) {
  if (!plant || !isFinite(weight) || weight < 0) return 0;
  return weight <= plant.minWeight ? plant.flatValue : plant.coefficient * Math.pow(weight, 2);
}

/** Which tier multiplier applies — Rainbow/Gold/Silver are mutually exclusive and override stacking mutations' role, never combine with each other. */
export function fruitTierMultiplier(tier) {
  if (tier === "rainbow") return 50;
  if (tier === "gold") return 20;
  if (tier === "silver") return 5;
  return 1;
}

/**
 * Full value calculation. `activeMutations` is an array of mutation
 * records ({ id, multiplier }) currently toggled on — stacking
 * mutations only, never rainbow/gold/silver (those go in `tier`).
 */
export function calculatePlantValue({ plant, weight, tier, activeMutations = [], amount = 1, friendBoostStep = 0 }) {
  const baseValue = calculateBaseValue(plant, weight);
  const fruitMultiplier = fruitTierMultiplier(tier);
  const modifierSum = activeMutations.reduce((sum, m) => sum + m.multiplier, 0);
  const modifierCount = activeMutations.length;
  const modifierMultiplier = 1 + modifierSum - modifierCount;

  let result = Math.ceil(baseValue * fruitMultiplier * modifierMultiplier);
  result *= Math.max(1, Math.floor(amount) || 1);
  result *= FRIEND_BOOST_MULTIPLIERS[friendBoostStep] ?? 1;
  return result;
}

/** The per-weight² coefficient the reference calls "base multiplier" — used by the reverse (value -> weight) calculation. */
export function getPlantBaseMultiplier(plant) {
  const testWeight = (plant?.minWeight ?? 1) + 1;
  const value = calculateBaseValue(plant, testWeight);
  return value / Math.pow(testWeight, 2);
}

/** Reverse calculation: estimate weight from a target value. Returns { weight, isAtOrBelowMin }. */
export function calculateWeightFromValue({ plant, value, tier, activeMutations = [], amount = 1, friendBoostStep = 0 }) {
  if (!plant || !isFinite(value) || value <= 0) return null;
  const fruitMultiplier = fruitTierMultiplier(tier);
  const modifierSum = activeMutations.reduce((sum, m) => sum + m.multiplier, 0);
  const modifierCount = activeMutations.length;
  const modifierMultiplier = 1 + modifierSum - modifierCount;
  const friendMultiplier = FRIEND_BOOST_MULTIPLIERS[friendBoostStep] ?? 1;

  const divisor = fruitMultiplier * modifierMultiplier * Math.max(1, Math.floor(amount) || 1) * friendMultiplier;
  if (!divisor) return null;
  const baseValue = value / divisor;

  const coefficient = getPlantBaseMultiplier(plant);
  if (!coefficient) return null;
  const weight = Math.sqrt(baseValue / coefficient);

  return { weight, isAtOrBelowMin: weight < plant.minWeight };
}

const SHORT_UNITS = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"];

/** Short-scale formatting (e.g. 9960 -> "9.960 Thousand"), matching the reference display. */
export function formatShortNumber(num) {
  let n = Math.abs(num);
  let unitIndex = 0;
  while (n >= 1000 && unitIndex < SHORT_UNITS.length - 1) {
    n /= 1000;
    unitIndex++;
  }
  const sign = num < 0 ? "-" : "";
  return `${sign}${n.toFixed(3)} ${SHORT_UNITS[unitIndex]}`.trim();
}

/** "≈$9,960 (9.960 Thousand)" — the reference's exact result-line format. */
export function formatValueResult(result) {
  return `≈$${result.toLocaleString()} (${formatShortNumber(result)})`;
}
