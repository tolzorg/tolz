// Grow a Garden Calculator — mutation reference data.
//
// Faithfully ported from the community value-calculator mutation set,
// including its actual conflict-resolution rules (not just multipliers):
//
// - "tier" mutations (Rainbow/Gold/Silver) replace the fruit multiplier
//   entirely rather than stacking; "stacking" mutations sum together per
//   the formula: value × (1 + sum(multipliers) − count(active)).
// - conflictGroups: activating a mutation deactivates any currently-active
//   mutation it conflicts with (e.g. Amber/Ancient Amber/Old Amber are
//   mutually exclusive). Ported verbatim, including one upstream typo
//   ("cylonic" instead of "cyclonic" in twisted's list) — harmless, since
//   it just never matches a real mutation id.
// - WET_GROUP: Wet/Chilled/Drenched/Frozen are mutually exclusive as a
//   group, and Frozen additionally locks the other three while active.
// - PASTA_TRIO: Pasta/Sauce/Meatball aren't pairwise-conflicting, but
//   activating the 3rd while the other 2 are already active clears all
//   3 and activates Spaghetti instead — a real bespoke rule in the source.
// - isAdmin marks mutations only obtainable via admin/dev events — hidden
//   by default via "Hide Admin Mutations". "Max Mutations" includes them
//   UNLESS admin mutations are currently hidden (matches the source's
//   own `!adminHidden || !isAdmin` condition — this is why "Max Mutations"
//   activates admin mutations too when they're visible).
// - includedInMaxPreset controls the "Max Mutations" quick-select baseline
//   (before the admin/conflict rules above are applied on top).

export const GROW_A_GARDEN_TIER_MUTATIONS = [
  { id: "rainbow", label: "Rainbow", multiplier: 50 },
  { id: "gold", label: "Gold", multiplier: 20 },
  { id: "silver", label: "Silver", multiplier: 5 },
];

export const WET_GROUP = ["wet", "chilled", "drenched", "frozen"];
export const PASTA_TRIO = ["pasta", "sauce", "meatball"];

export const GROW_A_GARDEN_MUTATION_CONFLICTS = {"burnt":["cooked","ceramic"],"cooked":["burnt","ceramic"],"fried":["cooked","ceramic"],"gold":["rainbow","silver"],"rainbow":["gold","silver"],"silver":["gold","rainbow"],"amber":["ancientamber","oldamber"],"ancientamber":["amber","oldamber"],"oldamber":["amber","ancientamber"],"clay":["ceramic","sandy"],"ceramic":["clay","fried","burnt","cooked"],"sandy":["clay","wet","drenched"],"paradisal":["sundried","verdant"],"sundried":["paradisal","verdant"],"verdant":["sundried","paradisal"],"twisted":["windstruck","tempestous","cylonic","maelstrom"],"windstruck":["tempestous","twisted","cyclonic"],"tempestous":["windstruck","twisted","cyclonic","maelstrom"],"cylonic":["twisted","windstruck","tempestous","maelstrom"],"maelstrom":["twisted","tempestous","cyclonic"],"chakra":["harmonisedchakra"],"harmonisedchakra":["chakra"],"foxfire":["harmonisedfoxfire"],"harmonisedfoxfire":["foxfire"],"sauce":["spaghetti"],"meatball":["spaghetti"],"pasta":["spaghetti"],"spaghetti":["pasta","meatball","sauce"],"gloom":["rot","bloom"],"bloom":["rot","gloom"],"rot":["gloom","bloom"],"acidic":["corrosive","toxic"],"cosmic":["aurora","galactic"],"aurora":["galactic","cosmic"],"galactic":["aurora","cosmic"],"stormcharged":["shocked","tempestous","static"],"shocked":["stormcharged"],"static":["stormcharged"],"corrosive":["toxic","acidic"],"toxic":["corrosive","acidic"]};

export const GROW_A_GARDEN_MUTATIONS = [
  { id: "shocked", label: "Shocked", multiplier: 100, color: "#ffe66d", isAdmin: false, includedInMaxPreset: false },
  { id: "frozen", label: "Frozen", multiplier: 10, color: "#72bff5", isAdmin: false, includedInMaxPreset: true },
  { id: "wet", label: "Wet", multiplier: 2, color: "#66b6e3", isAdmin: false, includedInMaxPreset: false },
  { id: "chilled", label: "Chilled", multiplier: 2, color: "#72bff5", isAdmin: false, includedInMaxPreset: false },
  { id: "choc", label: "Choc", multiplier: 2, color: "#3d2218", isAdmin: false, includedInMaxPreset: true },
  { id: "moonlit", label: "Moonlit", multiplier: 2, color: "#999dff", isAdmin: false, includedInMaxPreset: true },
  { id: "bloodlit", label: "Bloodlit", multiplier: 4, color: "#B00000", isAdmin: false, includedInMaxPreset: true },
  { id: "celestial", label: "Celestial", multiplier: 120, color: "#f04ac3", isAdmin: false, includedInMaxPreset: true },
  { id: "disco", label: "Disco", multiplier: 125, color: "#f48fd6", isAdmin: false, includedInMaxPreset: true },
  { id: "zombified", label: "Zombified", multiplier: 25, color: "#4bb973", isAdmin: false, includedInMaxPreset: true },
  { id: "plasma", label: "Plasma", multiplier: 5, color: "#9d2d6f", isAdmin: true, includedInMaxPreset: true },
  { id: "voidtouched", label: "Voidtouched", multiplier: 135, color: "#D24CFF", isAdmin: true, includedInMaxPreset: true },
  { id: "pollinated", label: "Pollinated", multiplier: 3, color: "#ffaa1c", isAdmin: false, includedInMaxPreset: true },
  { id: "honeyglazed", label: "Honeyglazed", multiplier: 5, color: "#ffc94d", isAdmin: false, includedInMaxPreset: true },
  { id: "dawnbound", label: "Dawnbound", multiplier: 150, color: "#ffccff", isAdmin: false, includedInMaxPreset: true },
  { id: "heavenly", label: "Heavenly", multiplier: 5, color: "#F2EB99", isAdmin: true, includedInMaxPreset: true },
  { id: "cooked", label: "Cooked", multiplier: 10, color: "#cc6600", isAdmin: false, includedInMaxPreset: false },
  { id: "burnt", label: "Burnt", multiplier: 4, color: "#1e1e1e", isAdmin: false, includedInMaxPreset: false },
  { id: "molten", label: "Molten", multiplier: 25, color: "#e76a0b", isAdmin: true, includedInMaxPreset: true },
  { id: "meteoric", label: "Meteoric", multiplier: 125, color: "#403483", isAdmin: true, includedInMaxPreset: true },
  { id: "windstruck", label: "Windstruck", multiplier: 2, color: "#a2b9d1", isAdmin: false, includedInMaxPreset: true },
  { id: "alienlike", label: "Alienlike", multiplier: 100, color: "#5cc6b1", isAdmin: true, includedInMaxPreset: true },
  { id: "sundried", label: "Sundried", multiplier: 85, color: "#cf5d00", isAdmin: false, includedInMaxPreset: false },
  { id: "verdant", label: "Verdant", multiplier: 4, color: "#386f28", isAdmin: false, includedInMaxPreset: false },
  { id: "paradisal", label: "Paradisal", multiplier: 100, color: "#9dc237", isAdmin: false, includedInMaxPreset: true },
  { id: "twisted", label: "Twisted", multiplier: 5, color: "#b8b8b8", isAdmin: false, includedInMaxPreset: false },
  { id: "galactic", label: "Galactic", multiplier: 120, color: "#a96cd4", isAdmin: true, includedInMaxPreset: true },
  { id: "aurora", label: "Aurora", multiplier: 90, color: "#6258ac", isAdmin: false, includedInMaxPreset: true },
  { id: "foxfire", label: "Foxfire", multiplier: 90, color: "#cccccc", isAdmin: false, includedInMaxPreset: false },
  { id: "cloudtouched", label: "Cloudtouched", multiplier: 5, color: "#defcfc", isAdmin: false, includedInMaxPreset: true },
  { id: "drenched", label: "Drenched", multiplier: 5, color: "#5ab7eb", isAdmin: false, includedInMaxPreset: false },
  { id: "fried", label: "Fried", multiplier: 8, color: "#974d1c", isAdmin: true, includedInMaxPreset: false },
  { id: "amber", label: "Amber", multiplier: 10, color: "#ffc000", isAdmin: false, includedInMaxPreset: false },
  { id: "ceramic", label: "Ceramic", multiplier: 32, color: "#eab892", isAdmin: false, includedInMaxPreset: true },
  { id: "ancientamber", label: "Ancientamber", multiplier: 50, color: "#893314", isAdmin: false, includedInMaxPreset: true },
  { id: "sandy", label: "Sandy", multiplier: 3, color: "#d4bf8d", isAdmin: false, includedInMaxPreset: true },
  { id: "clay", label: "Clay", multiplier: 5, color: "#966450", isAdmin: false, includedInMaxPreset: false },
  { id: "oldamber", label: "Oldamber", multiplier: 20, color: "#ac6e5e", isAdmin: false, includedInMaxPreset: false },
  { id: "friendbound", label: "Friendbound", multiplier: 70, color: "#e9267e", isAdmin: false, includedInMaxPreset: true },
  { id: "tempestous", label: "Tempestous", multiplier: 12, color: "#cccccc", isAdmin: false, includedInMaxPreset: false },
  { id: "infected", label: "Infected", multiplier: 75, color: "#43a700", isAdmin: true, includedInMaxPreset: true },
  { id: "toxic", label: "Toxic", multiplier: 15, color: "#cccccc", isAdmin: false, includedInMaxPreset: false },
  { id: "jackpot", label: "Jackpot", multiplier: 15, color: "#84f570", isAdmin: true, includedInMaxPreset: true },
  { id: "subzero", label: "Subzero", multiplier: 40, color: "#00ffff", isAdmin: true, includedInMaxPreset: true },
  { id: "blitzshock", label: "Blitzshock", multiplier: 50, color: "#00bbef", isAdmin: true, includedInMaxPreset: true },
  { id: "touchdown", label: "Touchdown", multiplier: 105, color: "#cb5f00", isAdmin: true, includedInMaxPreset: true },
  { id: "static", label: "Static", multiplier: 8, color: "#fdfddf", isAdmin: false, includedInMaxPreset: false },
  { id: "harmonisedfoxfire", label: "Harmonisedfoxfire", multiplier: 190, color: "#cccccc", isAdmin: false, includedInMaxPreset: true },
  { id: "harmonisedchakra", label: "Harmonisedchakra", multiplier: 35, color: "#cccccc", isAdmin: false, includedInMaxPreset: true },
  { id: "sliced", label: "Sliced", multiplier: 50, color: "#dfdfdf", isAdmin: true, includedInMaxPreset: true },
  { id: "acidic", label: "Acidic", multiplier: 15, color: "#8cf947", isAdmin: false, includedInMaxPreset: false },
  { id: "meatball", label: "Meatball", multiplier: 3, color: "#843431", isAdmin: false, includedInMaxPreset: false },
  { id: "spaghetti", label: "Spaghetti", multiplier: 15, color: "#f8ba8e", isAdmin: false, includedInMaxPreset: true },
  { id: "aromatic", label: "Aromatic", multiplier: 15, color: "#8d8130", isAdmin: false, includedInMaxPreset: true },
  { id: "oil", label: "Oil", multiplier: 15, color: "#32324b", isAdmin: false, includedInMaxPreset: true },
  { id: "boil", label: "Boil", multiplier: 15, color: "#8aa4cf", isAdmin: false, includedInMaxPreset: true },
  { id: "junkshock", label: "Junkshock", multiplier: 45, color: "#93f700", isAdmin: false, includedInMaxPreset: true },
  { id: "bloom", label: "Bloom", multiplier: 8, color: "#97c738", isAdmin: false, includedInMaxPreset: false },
  { id: "eclipsed", label: "Eclipsed", multiplier: 20, color: "#24405a", isAdmin: false, includedInMaxPreset: true },
  { id: "fortune", label: "Fortune", multiplier: 50, color: "#FFD700", isAdmin: false, includedInMaxPreset: true },
  { id: "lightcycle", label: "Lightcycle", multiplier: 50, color: "#ffffff", isAdmin: true, includedInMaxPreset: true },
  { id: "cyclonic", label: "Cyclonic", multiplier: 50, color: "#cccccc", isAdmin: false, includedInMaxPreset: false },
  { id: "brainrot", label: "Brainrot", multiplier: 100, color: "#fd6b6d", isAdmin: false, includedInMaxPreset: true },
  { id: "rot", label: "Rot", multiplier: 8, color: "#cccccc", isAdmin: false, includedInMaxPreset: false },
  { id: "warped", label: "Warped", multiplier: 75, color: "#bd33fb", isAdmin: false, includedInMaxPreset: true },
  { id: "gnomed", label: "Gnomed", multiplier: 15, color: "#cccccc", isAdmin: false, includedInMaxPreset: true },
  { id: "beanbound", label: "Beanbound", multiplier: 100, color: "#cccccc", isAdmin: true, includedInMaxPreset: false },
  { id: "gloom", label: "Gloom", multiplier: 30, color: "#444564", isAdmin: false, includedInMaxPreset: true },
  { id: "maelstrom", label: "Maelstrom", multiplier: 100, color: " #0f43d7", isAdmin: false, includedInMaxPreset: true },
  { id: "radioactive", label: "Radioactive", multiplier: 55, color: "#62ff00", isAdmin: true, includedInMaxPreset: true },
  { id: "cosmic", label: "Cosmic", multiplier: 210, color: "#8b8eca", isAdmin: false, includedInMaxPreset: true },
  { id: "glitched", label: "Glitched", multiplier: 85, color: "#d053c6", isAdmin: false, includedInMaxPreset: true },
  { id: "glimmering", label: "Glimmering", multiplier: 2, color: "#ff87f5", isAdmin: false, includedInMaxPreset: true },
  { id: "corrosive", label: "Corrosive", multiplier: 40, color: "#cccccc", isAdmin: false, includedInMaxPreset: true },
];
