// Anniversary Calculator — static reference data.
// Pure data, no logic. Traditional/modern gift lists follow the commonly
// published Western (US/UK) anniversary gift conventions.

export const EVENT_TYPES = [
  { id: "wedding",      label: "Wedding Anniversary",      icon: "💍" },
  { id: "relationship", label: "Relationship Anniversary", icon: "💑" },
  { id: "company",      label: "Company Anniversary",      icon: "🏢" },
  { id: "birthday",     label: "Birthday",                 icon: "🎂" },
  { id: "memorial",     label: "Memorial",                 icon: "🕊️" },
  { id: "friendship",   label: "Friendship Anniversary",   icon: "🤝" },
  { id: "employment",   label: "Work Anniversary",         icon: "💼" },
  { id: "graduation",   label: "Graduation",               icon: "🎓" },
  { id: "custom",       label: "Custom Event",             icon: "⭐" },
];

export function getEventTypeLabel(id) {
  return EVENT_TYPES.find((t) => t.id === id)?.label || "Anniversary";
}

export function getEventTypeIcon(id) {
  return EVENT_TYPES.find((t) => t.id === id)?.icon || "⭐";
}

// Traditional / modern wedding-anniversary gift, gemstone, flower & color
// conventions. Years not listed fall back to the nearest defined year at
// or below them (see getGiftInfo below).
export const GIFTS_BY_YEAR = {
  1:  { traditional: "Paper",   modern: "Clocks",          gemstone: "Gold Jewelry",  flower: "Carnation",   color: "Yellow" },
  2:  { traditional: "Cotton",  modern: "China",           gemstone: "Garnet",        flower: "Lily of the Valley", color: "Cotton White" },
  3:  { traditional: "Leather", modern: "Crystal/Glass",   gemstone: "Pearl",         flower: "Sunflower",   color: "Amber" },
  4:  { traditional: "Fruit / Flowers", modern: "Appliances", gemstone: "Blue Topaz", flower: "Hydrangea",  color: "Blue" },
  5:  { traditional: "Wood",    modern: "Silverware",      gemstone: "Sapphire",      flower: "Daisy",       color: "Light Blue" },
  6:  { traditional: "Sugar / Candy", modern: "Wood",      gemstone: "Amethyst",      flower: "Calla Lily",  color: "Purple" },
  7:  { traditional: "Wool / Copper", modern: "Desk Sets", gemstone: "Onyx",          flower: "Freesia",     color: "Copper" },
  8:  { traditional: "Pottery / Bronze", modern: "Linens/Lace", gemstone: "Tourmaline", flower: "Lilac",     color: "Bronze" },
  9:  { traditional: "Willow / Pottery", modern: "Leather", gemstone: "Lapis Lazuli", flower: "Bird of Paradise", color: "Copper/Terracotta" },
  10: { traditional: "Tin / Aluminum", modern: "Diamond Jewelry", gemstone: "Diamond", flower: "Daffodil", color: "Silver" },
  11: { traditional: "Steel",   modern: "Fashion Jewelry", gemstone: "Turquoise",     flower: "Tulip",       color: "Turquoise" },
  12: { traditional: "Silk / Linen", modern: "Pearls",     gemstone: "Jade",          flower: "Peony",       color: "Cream" },
  13: { traditional: "Lace",    modern: "Textiles/Furs",   gemstone: "Citrine",       flower: "Chrysanthemum", color: "Yellow Gold" },
  14: { traditional: "Ivory",   modern: "Gold Jewelry",    gemstone: "Opal",          flower: "Dahlia",      color: "Ivory" },
  15: { traditional: "Crystal", modern: "Watches",         gemstone: "Ruby",          flower: "Rose",        color: "Red" },
  20: { traditional: "China",   modern: "Platinum",        gemstone: "Emerald",       flower: "Aster",       color: "Emerald Green" },
  25: { traditional: "Silver",  modern: "Silver Jewelry",  gemstone: "Silver",        flower: "Iris",        color: "Silver" },
  30: { traditional: "Pearl",   modern: "Diamond",         gemstone: "Pearl",         flower: "Lily",        color: "Ivory / Pearl" },
  35: { traditional: "Coral",   modern: "Jade",            gemstone: "Emerald",       flower: "Tulip",       color: "Coral" },
  40: { traditional: "Ruby",    modern: "Ruby Jewelry",    gemstone: "Ruby",          flower: "Gladiolus",   color: "Ruby Red" },
  45: { traditional: "Sapphire", modern: "Sapphire Jewelry", gemstone: "Sapphire",    flower: "Violet",      color: "Sapphire Blue" },
  50: { traditional: "Gold",    modern: "Gold Jewelry",    gemstone: "Gold",          flower: "Yellow Rose", color: "Gold" },
  55: { traditional: "Emerald", modern: "Emerald Jewelry", gemstone: "Emerald",       flower: "Calla Lily",  color: "Emerald Green" },
  60: { traditional: "Diamond", modern: "Diamond Jewelry", gemstone: "Diamond",       flower: "Orchid",      color: "Diamond White" },
  70: { traditional: "Platinum", modern: "Platinum Jewelry", gemstone: "Diamond",     flower: "Orchid",      color: "Platinum" },
  75: { traditional: "Diamond", modern: "Diamond Jewelry", gemstone: "Diamond",       flower: "Orchid",      color: "Diamond White" },
  80: { traditional: "Oak",     modern: "Diamond Jewelry", gemstone: "Diamond",       flower: "Orchid",      color: "Deep Gold" },
  100: { traditional: "Diamond", modern: "Diamond Jewelry", gemstone: "Diamond",      flower: "Orchid",      color: "Diamond White" },
};

const DEFINED_GIFT_YEARS = Object.keys(GIFTS_BY_YEAR).map(Number).sort((a, b) => a - b);

// Returns gift info for the given anniversary year, falling back to the
// nearest defined year at or below it (e.g. year 17 → year 15's data).
export function getGiftInfo(years) {
  if (years <= 0) return null;
  let match = null;
  for (const y of DEFINED_GIFT_YEARS) {
    if (y <= years) match = y;
    else break;
  }
  if (match === null) return null;
  return { anniversaryYear: match, exact: match === years, ...GIFTS_BY_YEAR[match] };
}
