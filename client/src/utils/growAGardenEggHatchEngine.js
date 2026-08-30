// Grow a Garden Calculator — egg hatch time engine. Pure function,
// faithfully ported from the reference community calculator's
// per-second simulation (Kiwi/Eagle pets periodically knock time off
// an egg's remaining hatch timer; Eagles have a chance to double their
// reduction).

const MAX_SIMULATED_SECONDS = 999999; // matches the reference's own safety cap

/**
 * Simulates egg hatch time second-by-second.
 * `kiwis`/`eagles` — arrays of { cooldown, reduction, chance? } (chance
 * is Eagle-only, 0-100, chance to double that tick's reduction).
 * `rng` is injectable for deterministic tests; defaults to Math.random.
 */
export function simulateEggHatch({ hatchTimeSeconds, speedBonusPercent = 0, kiwis = [], eagles = [] }, rng = Math.random) {
  let hatchTime = hatchTimeSeconds;
  const speedMultiplier = 1 + speedBonusPercent / 100;

  const kiwiState = kiwis.filter((k) => k.cooldown > 0 && k.reduction > 0).map((k) => ({ ...k, next: k.cooldown }));
  const eagleState = eagles.filter((e) => e.cooldown > 0 && e.reduction > 0).map((e) => ({ ...e, next: e.cooldown }));

  let realTime = 0;
  while (hatchTime > 0 && realTime < MAX_SIMULATED_SECONDS) {
    realTime++;
    hatchTime -= speedMultiplier;

    for (const kiwi of kiwiState) {
      kiwi.next--;
      if (kiwi.next <= 0) {
        hatchTime -= kiwi.reduction;
        kiwi.next = kiwi.cooldown;
      }
    }
    for (const eagle of eagleState) {
      eagle.next--;
      if (eagle.next <= 0) {
        let reduction = eagle.reduction;
        if (rng() * 100 < (eagle.chance || 0)) reduction *= 2;
        hatchTime -= reduction;
        eagle.next = eagle.cooldown;
      }
    }
    hatchTime = Math.max(0, hatchTime);
  }

  return {
    totalSeconds: realTime,
    hours: Math.floor(realTime / 3600),
    minutes: Math.floor((realTime % 3600) / 60),
    seconds: Math.floor(realTime % 60),
  };
}
