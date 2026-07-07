// Data-driven, versioned template dataset — Phase 1 seed set.
//
// Schema (per template):
//   id, name, category, country, widthMM, heightMM, dpi,
//   headPosition?: { topOffsetMM, eyeLineOffsetMM, faceBoxRatio }
//     - topOffsetMM: recommended clear space from top of photo to crown of head
//     - eyeLineOffsetMM: distance from top of photo down to the eye line
//     - faceBoxRatio: head height (chin to crown) as a fraction of photo height
//   backgroundColor?, minResolutionPX, recommendedResolutionPX,
//   version, authority?, specificationUrl?, lastVerified?
//
// IMPORTANT: these are working approximations of published guidance, not a
// certified/legal database. Government requirements change — the app always
// shows COMPLIANCE_DISCLAIMER (below) alongside Passport/Visa/ID templates.
// `lastVerified` should be re-checked periodically against `specificationUrl`.

export const COMPLIANCE_DISCLAIMER =
  "This tool provides layouts based on published specifications. Government " +
  "requirements may change. Users must verify official requirements before submission.";

export const TEMPLATE_CATEGORIES = [
  { id: "passport", label: "Passport" },
  { id: "visa",     label: "Visa" },
  { id: "id-card",  label: "ID Cards" },
  { id: "studio",   label: "Studio Sizes" },
];

function px(mm, dpi = 300) {
  return Math.round((mm / 25.4) * dpi);
}

function mkResolutions(widthMM, heightMM, dpi = 300) {
  const w = px(widthMM, dpi);
  const h = px(heightMM, dpi);
  return { minResolutionPX: { width: Math.round(w * 0.8), height: Math.round(h * 0.8) }, recommendedResolutionPX: { width: w, height: h } };
}

export const ID_PHOTO_TEMPLATES = [
  // ── Passport ─────────────────────────────────────────────────────────
  {
    id: "passport-icao-35x45", name: "Passport Photo (ICAO 35×45mm)", category: "passport",
    country: "International", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.72 },
    backgroundColor: "#ffffff", ...mkResolutions(35, 45),
    version: 1, authority: "ICAO Doc 9303", specificationUrl: "https://www.icao.int/publications/pages/publication.aspx?docnum=9303", lastVerified: "2026-01-01",
  },
  {
    id: "passport-us-2x2", name: "US Passport Photo (2×2 in)", category: "passport",
    country: "United States", widthMM: 50.8, heightMM: 50.8, dpi: 300,
    headPosition: { topOffsetMM: 3, eyeLineOffsetMM: 19, faceBoxRatio: 0.61 },
    backgroundColor: "#ffffff", ...mkResolutions(50.8, 50.8),
    version: 1, authority: "U.S. Department of State", specificationUrl: "https://travel.state.gov/content/travel/en/passports/how-apply/photos.html", lastVerified: "2026-01-01",
  },
  {
    id: "passport-uk-35x45", name: "UK Passport Photo (35×45mm)", category: "passport",
    country: "United Kingdom", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.72 },
    backgroundColor: "#f0f0f0", ...mkResolutions(35, 45),
    version: 1, authority: "UK Government (HM Passport Office)", specificationUrl: "https://www.gov.uk/photos-for-passports", lastVerified: "2026-01-01",
  },
  {
    id: "passport-canada-50x70", name: "Canada Passport Photo (50×70mm)", category: "passport",
    country: "Canada", widthMM: 50, heightMM: 70, dpi: 300,
    headPosition: { topOffsetMM: 8, eyeLineOffsetMM: 32, faceBoxRatio: 0.5 },
    backgroundColor: "#ffffff", ...mkResolutions(50, 70),
    version: 1, authority: "Government of Canada", specificationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html", lastVerified: "2026-01-01",
  },
  {
    id: "passport-30x40", name: "Passport Photo (30×40mm)", category: "passport",
    country: "International", widthMM: 30, heightMM: 40, dpi: 300,
    headPosition: { topOffsetMM: 3, eyeLineOffsetMM: 15, faceBoxRatio: 0.72 },
    backgroundColor: "#ffffff", ...mkResolutions(30, 40),
    version: 1, authority: "Common national requirement", specificationUrl: "", lastVerified: "2026-01-01",
  },
  {
    id: "passport-33x48", name: "Passport Photo (33×48mm)", category: "passport",
    country: "International", widthMM: 33, heightMM: 48, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 18, faceBoxRatio: 0.7 },
    backgroundColor: "#ffffff", ...mkResolutions(33, 48),
    version: 1, authority: "Common national requirement", specificationUrl: "", lastVerified: "2026-01-01",
  },
  {
    id: "passport-50x50", name: "Passport Photo (50×50mm)", category: "passport",
    country: "International", widthMM: 50, heightMM: 50, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 19, faceBoxRatio: 0.62 },
    backgroundColor: "#ffffff", ...mkResolutions(50, 50),
    version: 1, authority: "Common national requirement", specificationUrl: "", lastVerified: "2026-01-01",
  },

  // ── Visa ─────────────────────────────────────────────────────────────
  {
    id: "visa-us-2x2", name: "US Visa Photo (2×2 in)", category: "visa",
    country: "United States", widthMM: 50.8, heightMM: 50.8, dpi: 300,
    headPosition: { topOffsetMM: 3, eyeLineOffsetMM: 19, faceBoxRatio: 0.61 },
    backgroundColor: "#ffffff", ...mkResolutions(50.8, 50.8),
    version: 1, authority: "U.S. Department of State", specificationUrl: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html", lastVerified: "2026-01-01",
  },
  {
    id: "visa-uk-35x45", name: "UK Visa Photo (35×45mm)", category: "visa",
    country: "United Kingdom", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.72 },
    backgroundColor: "#f0f0f0", ...mkResolutions(35, 45),
    version: 1, authority: "UK Government (UKVI)", specificationUrl: "https://www.gov.uk/photos-for-passports", lastVerified: "2026-01-01",
  },
  {
    id: "visa-schengen-35x45", name: "Schengen Visa Photo (35×45mm)", category: "visa",
    country: "Schengen Area", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.75 },
    backgroundColor: "#ffffff", ...mkResolutions(35, 45),
    version: 1, authority: "Schengen visa requirements", specificationUrl: "https://www.schengenvisainfo.com/photo-requirements/", lastVerified: "2026-01-01",
  },
  {
    id: "visa-canada-50x70", name: "Canada Visa Photo (50×70mm)", category: "visa",
    country: "Canada", widthMM: 50, heightMM: 70, dpi: 300,
    headPosition: { topOffsetMM: 8, eyeLineOffsetMM: 32, faceBoxRatio: 0.5 },
    backgroundColor: "#ffffff", ...mkResolutions(50, 70),
    version: 1, authority: "Government of Canada", specificationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/photos.html", lastVerified: "2026-01-01",
  },

  // ── ID Cards ─────────────────────────────────────────────────────────
  {
    id: "id-driver-license-us", name: "Driver License Photo (US, 2×2 in)", category: "id-card",
    country: "United States", widthMM: 50.8, heightMM: 50.8, dpi: 300,
    headPosition: { topOffsetMM: 3, eyeLineOffsetMM: 19, faceBoxRatio: 0.61 },
    backgroundColor: "#ffffff", ...mkResolutions(50.8, 50.8),
    version: 1, authority: "Varies by state DMV", specificationUrl: "", lastVerified: "2026-01-01",
  },
  {
    id: "id-national-id-35x45", name: "National ID Photo (35×45mm)", category: "id-card",
    country: "International", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.72 },
    backgroundColor: "#ffffff", ...mkResolutions(35, 45),
    version: 1, authority: "Common national ID requirement", specificationUrl: "", lastVerified: "2026-01-01",
  },
  {
    id: "id-student-25x35", name: "Student ID Photo (25×35mm)", category: "id-card",
    country: "International", widthMM: 25, heightMM: 35, dpi: 300,
    headPosition: { topOffsetMM: 3, eyeLineOffsetMM: 13, faceBoxRatio: 0.72 },
    backgroundColor: "#ffffff", ...mkResolutions(25, 35),
    version: 1, authority: "Common institutional requirement", specificationUrl: "", lastVerified: "2026-01-01",
  },
  {
    id: "id-residence-permit-35x45", name: "Residence Permit Photo (35×45mm)", category: "id-card",
    country: "Schengen Area", widthMM: 35, heightMM: 45, dpi: 300,
    headPosition: { topOffsetMM: 4, eyeLineOffsetMM: 17, faceBoxRatio: 0.75 },
    backgroundColor: "#ffffff", ...mkResolutions(35, 45),
    version: 1, authority: "Schengen visa requirements", specificationUrl: "https://www.schengenvisainfo.com/photo-requirements/", lastVerified: "2026-01-01",
  },

  // ── Studio sizes (no head-position guide — generic print sizes) ──────
  { id: "studio-1x1in", name: "Studio 1×1 in", category: "studio", country: "International", widthMM: 25.4, heightMM: 25.4, dpi: 300, backgroundColor: "#ffffff", ...mkResolutions(25.4, 25.4), version: 1 },
  { id: "studio-2x2in", name: "Studio 2×2 in", category: "studio", country: "International", widthMM: 50.8, heightMM: 50.8, dpi: 300, backgroundColor: "#ffffff", ...mkResolutions(50.8, 50.8), version: 1 },
  { id: "studio-3x4cm", name: "Studio 3×4 cm", category: "studio", country: "International", widthMM: 30, heightMM: 40, dpi: 300, backgroundColor: "#ffffff", ...mkResolutions(30, 40), version: 1 },
  { id: "studio-4x6cm", name: "Studio 4×6 cm", category: "studio", country: "International", widthMM: 40, heightMM: 60, dpi: 300, backgroundColor: "#ffffff", ...mkResolutions(40, 60), version: 1 },
  { id: "studio-5x7cm", name: "Studio 5×7 cm", category: "studio", country: "International", widthMM: 50, heightMM: 70, dpi: 300, backgroundColor: "#ffffff", ...mkResolutions(50, 70), version: 1 },
];

export function getTemplatesByCategory(categoryId) {
  return ID_PHOTO_TEMPLATES.filter((t) => t.category === categoryId);
}

export function getCountriesForCategory(categoryId) {
  const set = new Set(ID_PHOTO_TEMPLATES.filter((t) => t.category === categoryId).map((t) => t.country));
  return Array.from(set).sort();
}

export function getTemplateById(id) {
  return ID_PHOTO_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function isOfficialTemplate(template) {
  return template?.category === "passport" || template?.category === "visa" || template?.category === "id-card";
}
