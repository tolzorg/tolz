import { TOOLS } from "./tools";

// Human-facing label/emoji/link for each grouping key a tool can match on —
// either its `subCategory` (tight match) or its `category` (broader match).
// "handy" is the last-resort fallback for tools that are the only member of
// their category (e.g. Color Picker) and have no closer peers at all.
const GROUP_META = {
  "health-calc":            { label: "health calculators",              emoji: "💪",  path: "/calculators/health" },
  everyday:                 { label: "everyday life calculators",       emoji: "🌅",  path: "/calculators/everyday-life" },
  "construction-calc":      { label: "construction converters",         emoji: "📐",  path: "/calculators/construction" },
  "construction-materials": { label: "construction materials calculators", emoji: "🧱", path: "/calculators/construction" },
  image:                    { label: "image tools",                     emoji: "🖼️", path: "/#tools" },
  pdf:                      { label: "PDF tools",                       emoji: "📄",  path: "/#tools" },
  "url-tools":               { label: "URL & QR tools",                  emoji: "🔗",  path: "/#tools" },
  "text-tools":              { label: "text tools",                      emoji: "📝",  path: "/#tools" },
  "design-tools":            { label: "design tools",                    emoji: "🎨",  path: "/#tools" },
  converter:                 { label: "converter tools",                 emoji: "🔄",  path: "/#tools" },
  handy:                     { label: "handy tools",                     emoji: "🧰",  path: "/#tools" },
};

function candidatesByKey(tool, key, value) {
  if (!value) return [];
  return TOOLS.filter((t) => t.id !== tool.id && t.available !== false && t[key] === value);
}

// GROUP_META gives well-known categories a polished label, but a brand new
// category/subCategory value (from a tool added without a GROUP_META entry)
// still needs a sensible heading — derive one from the key itself instead of
// silently mislabeling it as "handy tools". Keeps the whole system zero-edit:
// GROUP_META entries are an optional label upgrade, never a requirement.
function humanizeKey(key) {
  const words = key.replace(/[-_]/g, " ").trim();
  const capitalized = `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
  return /tools?$/i.test(words) ? capitalized : `${capitalized} tools`;
}

// Finds related tools with the tightest meaningful match, so the "N similar"
// count genuinely reflects how many close peers a tool has instead of one
// flat number repeated across a broad bucket:
//   1. same subCategory (e.g. "construction-calc" — 6 peers)
//   2. same category (e.g. "image" — 2 peers)
//   3. "handy" fallback: every non-calculator tool, for the few tools that
//      are the sole member of their category (e.g. Color Picker) and would
//      otherwise have zero related tools to show.
export function getRelatedTools(tool, limit = 8) {
  if (!tool) return null;

  let pool = candidatesByKey(tool, "subCategory", tool.subCategory);
  let groupKey = tool.subCategory;

  if (pool.length === 0) {
    pool = candidatesByKey(tool, "category", tool.category);
    groupKey = tool.category;
  }

  if (pool.length === 0) {
    pool = TOOLS.filter((t) => t.id !== tool.id && t.available !== false && t.category !== "utility");
    groupKey = "handy";
  }

  const scored = pool.map((t) => {
    let score = 0;
    if (tool.subCategory && t.subCategory === tool.subCategory) score += 2;
    if (t.category === tool.category) score += 1;
    return { tool: t, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const meta = GROUP_META[groupKey] || {
    label: humanizeKey(groupKey),
    emoji: "🔧",
    path: "/#tools",
  };

  return {
    familyLabel: meta.label,
    familyEmoji: meta.emoji,
    familyPath: meta.path,
    poolSize: pool.length,
    items: scored.slice(0, limit).map((s) => s.tool),
  };
}
