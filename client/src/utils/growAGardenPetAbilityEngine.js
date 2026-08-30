// Grow a Garden Calculator — pet ability engine. Evaluates a pet's
// ability formulas (from growAGardenPets.js) at both its current and
// projected Age-100 weight, and formats each stat as either a plain
// number or MM:SS time — this pet/stat pairing list is faithfully
// ported from the reference calculator's own formatting rules.

const GROWTH_MULTIPLIER = 0.090909;

// [petId, displayBoxId] pairs whose value should be formatted as MM:SS.
const TIME_FORMAT_PAIRS = new Set([
  "lobster:DisplayBox1", "lobster:DisplayBox3", "mimic:DisplayBox1", "sloth:DisplayBox1",
  "dilo:DisplayBox1", "peacock:DisplayBox1", "seaturtle:DisplayBox1", "frog:DisplayBox1",
  "echofrog:DisplayBox1", "queenbee:DisplayBox1", "queenbee:DisplayBox2", "spinosaurus:DisplayBox1",
  "ckitsune:DisplayBox1", "ferret:DisplayBox1", "goldengoose:DisplayBox1", "kitsune:DisplayBox1",
  "wasp:DisplayBox1", "wasp:DisplayBox2", "cookedowl:DisplayBox1", "butterfly:DisplayBox1",
  "trex:DisplayBox1", "golem:DisplayBox1", "dragonfly:DisplayBox1", "chickenzombie:DisplayBox1",
  "redfox:DisplayBox1", "meerkat:DisplayBox1", "fennecfox:DisplayBox1", "kappa:DisplayBox1",
  "tarantulahawk:DisplayBox1", "tarantulahawk:DisplayBox2", "raccoon:DisplayBox1", "discobee:DisplayBox1",
  "spriggan:DisplayBox1", "hotdog:DisplayBox1", "rainbowhotdog:DisplayBox1", "greenbean:DisplayBox1",
  "lemonlion:DisplayBox1", "rainbowdilo:DisplayBox1", "peachwasp:DisplayBox1", "peachwasp:DisplayBox2",
  "tanuki:DisplayBox1", "flamingo:DisplayBox1", "bee:DisplayBox1", "moth:DisplayBox1",
  "crab:DisplayBox1", "cockatrice:DisplayBox1", "cockatrice:DisplayBox5",
]);

export function formatSeconds(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.round(sec % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * Evaluate one pet's abilities at both its current weight and its
 * projected Age-100 weight. `petsData` is the object returned by
 * createGrowAGardenPetsData(state) (state already carries
 * isGold/isRainbow/toyPct, so formulas here are pure weight functions).
 */
export function evaluatePetAbility(petsData, petId, age, weight) {
  const pet = petsData[petId];
  if (!pet) return null;
  if (!Number.isInteger(age) || !isFinite(weight) || age < 1 || age > 100 || weight <= 0) {
    return { error: "Please enter valid age and weight." };
  }

  const baseWeight = weight / (1 + GROWTH_MULTIPLIER * (age - 1));
  const weightAt100 = baseWeight * (1 + GROWTH_MULTIPLIER * (100 - 1));

  let description = pet.text;
  let description100 = pet.text;
  const currentStats = [];
  const maxStats = [];

  pet.formulas.forEach((item) => {
    const rawCurrent = item.formula(weight);
    const rawMax = item.formula(weightAt100);
    const asTime = TIME_FORMAT_PAIRS.has(`${petId}:${item.id}`);
    const currentVal = asTime ? formatSeconds(rawCurrent) : rawCurrent.toFixed(2);
    const maxVal = asTime ? formatSeconds(rawMax) : rawMax.toFixed(2);

    description = description.replaceAll(item.id, currentVal);
    description100 = description100.replaceAll(item.id, maxVal);
    currentStats.push({ label: `Stat${currentStats.length + 1}`, value: currentVal });
    maxStats.push({ label: `Stat${maxStats.length + 1} (Age 100)`, value: maxVal });
  });

  return { description, description100, currentStats, maxStats, weightAt100 };
}
