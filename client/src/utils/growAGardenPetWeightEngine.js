// Grow a Garden Calculator — pet weight-by-age engine. Pure functions,
// faithfully ported from the reference community calculator's linear
// weight-growth model and Age-1 weight-class tiers. Explicitly
// approximate — the reference labels its own result "THESE ARE
// APPROXIMATIONS!!!" and this port preserves that caveat.

const GROWTH_MULTIPLIER = 0.090909;

/** Reverse the growth curve: derive a pet's Age-1 (base) weight from its current age/weight. */
export function age1BaseWeight(age, currentWeight) {
  if (age === 1) return currentWeight;
  return currentWeight / (1 + GROWTH_MULTIPLIER * (age - 1));
}

/** Weight class tiers for a pet's Age-1 (base) weight. */
export function classifyAge1Weight(w1) {
  if (w1 >= 9) return { label: "Godly", color: "#ffd700" };
  if (w1 >= 8) return { label: "Titanic", color: "#ff6b6b" };
  if (w1 >= 7) return { label: "Semi Titanic", color: "#ffa94d" };
  if (w1 >= 5) return { label: "Huge", color: "#74c0fc" };
  if (w1 >= 4) return { label: "Semi Huge", color: "#b2f2bb" };
  return { label: "Normal", color: "#ced4da" };
}

/** Full weight table for ages 1-100, given a known (age, weight) data point. */
export function computeWeightByAgeTable(age, weight) {
  if (!Number.isInteger(age) || !isFinite(weight) || age < 1 || age > 100 || weight < 0) {
    return { error: "Please enter valid inputs." };
  }
  const baseWeight = age1BaseWeight(age, weight);
  const rows = [];
  for (let a = 1; a <= 100; a++) {
    rows.push({ age: a, weight: baseWeight + GROWTH_MULTIPLIER * baseWeight * (a - 1) });
  }
  return { baseWeight, rows, tier: classifyAge1Weight(baseWeight) };
}
