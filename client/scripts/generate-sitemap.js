#!/usr/bin/env node
// Generates public/sitemap.xml from the app's own route registries, so a new
// tool or page shows up in the sitemap automatically instead of relying on
// someone remembering to hand-edit the file.
//
// Runs automatically before every build (see "prebuild" in package.json).
// Run it manually with `npm run sitemap`.
//
// Source of truth for URLs:
//   - src/utils/tools.js              → individual tool pages (TOOLS) and the
//                                        calculator hub sub-category paths
//                                        (CATEGORIES → "utility".subCategories)
//   - src/utils/toolCategoryConfig.js → tool category landing pages
//                                        (Image, PDF, Converters, ...)
//   - STATIC_PAGES below              → pages with no registry entry
//                                        (home, legal pages, about/contact)
//
// Anything reachable only via a dynamic route (e.g. /tools/image-converter/:toolId,
// /s/:slug short links, the generic /tools/:categorySlug and /calculators/:categorySlug
// matchers) is intentionally left out — those are covered by their landing
// page and shouldn't be enumerated individually.
//
// lastmod: preserved from the existing sitemap.xml for URLs that are still
// present (so unrelated pages don't get bumped on every build); new URLs get
// today's date, which is how you can tell a page was just added.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "../public/sitemap.xml");
// Must match SITE_URL in src/components/SEO.jsx (the canonical/OG domain used
// on every page) so sitemap URLs match canonical URLs exactly.
const SITE_URL = "https://www.tolz.org";

const { TOOLS, CATEGORIES } = await import("../src/utils/tools.js");
const { TOOL_CATEGORY_PAGES } = await import("../src/utils/toolCategoryConfig.js");

const STATIC_PAGES = [
  { path: "/",                changefreq: "weekly",  priority: "1.0" },
  { path: "/browse-all-tools", changefreq: "weekly",  priority: "0.7" },
  { path: "/about",           changefreq: "monthly", priority: "0.5" },
  { path: "/contact",         changefreq: "monthly", priority: "0.5" },
  { path: "/privacy",         changefreq: "monthly", priority: "0.4" },
  { path: "/terms",           changefreq: "monthly", priority: "0.4" },
  { path: "/disclaimer",      changefreq: "monthly", priority: "0.4" },
  { path: "/copyright",       changefreq: "monthly", priority: "0.4" },
];

// Calculators hub + its sub-category landing pages (health / everyday-life / construction)
const utilityCategory = CATEGORIES.find((c) => c.id === "utility");
const CALCULATOR_PAGES = [
  { path: "/calculators", changefreq: "weekly", priority: "0.7" },
  ...(utilityCategory?.subCategories ?? []).map((sub) => ({
    path: sub.path,
    changefreq: "weekly",
    priority: "0.7",
  })),
];

// Tool category landing pages (Image, PDF, Converters, URL, Text, Design)
const TOOL_CATEGORY_URLS = TOOL_CATEGORY_PAGES.map((c) => ({
  path: c.path,
  changefreq: "weekly",
  priority: "0.7",
}));

// Individual tool pages — pulled straight from the tool registry, so any
// tool added to TOOLS (client/src/utils/tools.js) automatically appears here.
const TOOL_URLS = TOOLS.filter((t) => t.available).map((t) => ({
  path: t.path,
  changefreq: "weekly",
  priority: "0.8",
}));

const allPages = [...STATIC_PAGES, ...CALCULATOR_PAGES, ...TOOL_CATEGORY_URLS, ...TOOL_URLS];

// De-dupe by path (a couple of tools are reachable at more than one URL;
// TOOLS.path is treated as the canonical one).
const seen = new Set();
const pages = allPages.filter((p) => {
  if (seen.has(p.path)) return false;
  seen.add(p.path);
  return true;
});

// Preserve lastmod for URLs already in the sitemap; new URLs get today.
// Matched by path (not the full <loc>) so a domain/protocol correction like
// the tolz.org → www.tolz.org fix doesn't reset every date to today.
const today = new Date().toISOString().slice(0, 10);
const existingLastmodByPath = new Map();
if (existsSync(OUT_PATH)) {
  const existingXml = readFileSync(OUT_PATH, "utf8");
  const urlTagRe = /<loc>https?:\/\/[^/]+([^<]*)<\/loc>.*?<lastmod>([^<]+)<\/lastmod>/g;
  let match;
  while ((match = urlTagRe.exec(existingXml))) {
    existingLastmodByPath.set(match[1] || "/", match[2]);
  }
}

const urlLines = pages
  .map((p) => {
    const loc = `${SITE_URL}${p.path}`;
    const lastmod = existingLastmodByPath.get(p.path) || today;
    return `  <url><loc>${loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority><lastmod>${lastmod}</lastmod></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlLines}\n</urlset>\n`;

writeFileSync(OUT_PATH, xml, "utf8");
console.log(`sitemap.xml: wrote ${pages.length} URLs → ${path.relative(process.cwd(), OUT_PATH)}`);
