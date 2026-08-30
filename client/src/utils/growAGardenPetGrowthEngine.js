// Grow a Garden Calculator — pet growth/XP engine. Pure functions,
// faithfully ported from the reference community calculator's
// age/XP-curve and growth-time formulas.

/** XP required to advance FROM a given age to the next age (age 1->2 needs xpForAge(1), etc). */
export function xpForAge(age) {
  if (age === 1) return 20;
  if (age === 2) return 81;
  let xpPrev2 = 20;
  let xpPrev1 = 81;
  let xpCurrent = 0;
  for (let i = 3; i <= age; i++) {
    xpCurrent = 2 * xpPrev1 - xpPrev2 + 43;
    xpPrev2 = xpPrev1;
    xpPrev1 = xpCurrent;
  }
  return xpCurrent;
}

/** Total XP needed to go from startAge to targetAge. */
export function sumXpBetweenLevels(startAge, targetAge) {
  let total = 0;
  for (let age = startAge; age <= targetAge - 1; age++) total += xpForAge(age);
  return total;
}

// Mouse boosts grant a burst of XP on a fixed interval (brown: every 8
// minutes, grey: every 10) — expressed here as an average XP/s rate.
// NOTE: the reference calculator's own source computes this rate twice
// (once from the user-adjustable XP-per-interval input, once again
// from a hardcoded default) and adds both into the final result — an
// apparent double-count bug in the source. This port intentionally
// adds it once, using the user-adjustable value, which is the
// mechanically correct behavior.
function mouseRatePerSecond(type, xpPerInterval) {
  const intervalSeconds = type === "brown" ? 8 * 60 : 10 * 60;
  return (xpPerInterval ?? (type === "brown" ? 750 : 500)) / intervalSeconds;
}

/**
 * Total time (seconds) to grow a pet from currentAge to targetAge.
 * `owlXpRates` — array of individual owl XP/s values (max 8, fewer
 * allowed when a mouse/starfish boost is active, per the reference's
 * 7-owl cap in that case). `mouseBoost` — "brown" | "grey" | null.
 * `mouseXpPerInterval` — the mouse's XP granted per its interval
 * (defaults 750 for brown, 500 for grey, both user-adjustable in the UI).
 */
export function calculatePetGrowthTime({
  currentAge, targetAge, owlXpRates = [], mouseBoost = null, mouseXpPerInterval = null,
  starfishActive = false, starfishXpPerSecond = 0, extraXpPercent = 0, customXpPerSecond = 0,
}) {
  if (!Number.isInteger(currentAge) || !Number.isInteger(targetAge) || currentAge < 1 || targetAge > 100 || targetAge <= currentAge) {
    return { error: "Please enter valid ages (1-100) and ensure target age > current age." };
  }
  const maxOwls = mouseBoost || starfishActive ? 7 : 8;
  if (owlXpRates.length > maxOwls) {
    return { error: `You can only have up to ${maxOwls} owls in total${mouseBoost || starfishActive ? " when a mouse or starfish is selected." : "."}` };
  }

  const totalXpRequired = sumXpBetweenLevels(currentAge, targetAge);

  let totalXpRate = 0.52; // baseXpRate
  for (const xp of owlXpRates) if (isFinite(xp)) totalXpRate += xp;
  if (mouseBoost === "brown" || mouseBoost === "grey") totalXpRate += mouseRatePerSecond(mouseBoost, mouseXpPerInterval);
  if (starfishActive && isFinite(starfishXpPerSecond)) totalXpRate += starfishXpPerSecond;
  if (isFinite(customXpPerSecond)) totalXpRate += customXpPerSecond;
  totalXpRate *= 1 + (extraXpPercent || 0) / 100;

  const timeInSeconds = totalXpRequired / totalXpRate;
  return {
    totalXpRate,
    totalXpRequired,
    timeInSeconds,
    timeInHours: timeInSeconds / 3600,
  };
}
