// Standard, published readability formulas. All take pre-computed totals
// (words, sentences, syllables, letters) so the caller can reuse a single
// parse pass instead of re-tokenizing the text per metric.

export function fleschReadingEase({ words, sentences, syllables }) {
  if (words === 0 || sentences === 0) return 0;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return round2(clamp(score, 0, 100));
}

export function fleschKincaidGrade({ words, sentences, syllables }) {
  if (words === 0 || sentences === 0) return 0;
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return round2(Math.max(0, grade));
}

// Simplified Gunning Fog — the classic proper-noun/familiar-jargon/
// inflection exceptions are not applied (no dictionary of proper nouns
// exists in this project); this matches the approximation used by most
// free online readability tools.
export function gunningFog({ words, sentences, complexWords }) {
  if (words === 0 || sentences === 0) return 0;
  const fog = 0.4 * ((words / sentences) + 100 * (complexWords / words));
  return round2(Math.max(0, fog));
}

// Standard generalized SMOG formula (scales the 30-sentence sample
// requirement to whatever sentence count is available).
export function smogIndex({ sentences, complexWords }) {
  if (sentences === 0) return 0;
  const smog = 1.0430 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291;
  return round2(Math.max(0, smog));
}

export function colemanLiauIndex({ words, sentences, letters }) {
  if (words === 0) return 0;
  const L = (letters / words) * 100;
  const S = (sentences / words) * 100;
  const score = 0.0588 * L - 0.296 * S - 15.8;
  return round2(Math.max(0, score));
}

export function automatedReadabilityIndex({ words, sentences, characters }) {
  if (words === 0 || sentences === 0) return 0;
  const ari = 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43;
  return round2(Math.max(0, ari));
}

export function fleschDifficultyLevel(score) {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

// Maps a numeric grade-level style score (FK Grade, Fog, SMOG,
// Coleman-Liau, ARI all land on roughly the same US-grade scale) to a
// readable label.
export function gradeLevelLabel(grade) {
  const g = Math.round(grade);
  if (g <= 0) return "Kindergarten";
  if (g <= 12) return `Grade ${g}`;
  if (g <= 16) return "College";
  return "College Graduate";
}

// Combines the grade-based metrics into the six-band overall difficulty
// classification requested for the tool (distinct from Flesch's own
// seven-band scale, which stays as its own separate display).
export function overallDifficulty(avgGrade) {
  if (avgGrade <= 5) return "Very Easy";
  if (avgGrade <= 7) return "Easy";
  if (avgGrade <= 9) return "Standard";
  if (avgGrade <= 12) return "Fairly Difficult";
  if (avgGrade <= 15) return "Difficult";
  return "Very Difficult";
}

export function readingLevelSummary(difficulty) {
  switch (difficulty) {
    case "Very Easy":
      return "This text is suitable for early elementary readers.";
    case "Easy":
      return "This text is suitable for elementary and middle-school readers.";
    case "Standard":
      return "This text is suitable for most adults and high-school students.";
    case "Fairly Difficult":
      return "This text may challenge average readers; suitable for high-school graduates and above.";
    case "Difficult":
      return "This text requires college-level reading ability.";
    default:
      return "This text is highly technical or academic, suitable for graduate-level or specialist readers.";
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
