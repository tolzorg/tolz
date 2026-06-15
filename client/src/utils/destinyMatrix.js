// ─────────────────────────────────────────────────────────────
// Destiny Matrix Numerology — pure calculation engine
// Pythagorean system + Pythagoras Square (Destiny Matrix)
// All functions are pure and deterministic.
// ─────────────────────────────────────────────────────────────

// Pythagorean letter-to-number mapping (A=1 … Z=8, cycles through 1–9)
const LETTER_VALUES = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};

const VOWELS = new Set(["A","E","I","O","U"]);

// Master numbers are NOT further reduced
const MASTER_NUMBERS = new Set([11, 22, 33]);

// ─── Core reduction ───────────────────────────────────────────
// Reduces a positive integer to a single digit, preserving 11/22/33
function reduce(n) {
  let v = Math.abs(Math.round(n));
  while (v > 9 && !MASTER_NUMBERS.has(v)) {
    v = String(v).split("").reduce((s, d) => s + Number(d), 0);
  }
  return v;
}

// Sum all digits of a number or string
function digitSum(n) {
  return String(n).split("").reduce((s, c) => s + (Number(c) || 0), 0);
}

// ─── Life Path Number ─────────────────────────────────────────
// Reduce day, month, year separately then sum and reduce again.
// This correctly preserves master numbers at each step.
export function calcLifePath(day, month, year) {
  const d = reduce(digitSum(day));
  const m = reduce(digitSum(month));
  const y = reduce(digitSum(year));
  return reduce(d + m + y);
}

// ─── Destiny / Expression Number ─────────────────────────────
// Sum of all Pythagorean letter values in the full name
export function calcDestiny(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const sum = letters.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
  return sum === 0 ? 1 : reduce(sum);
}

// ─── Soul Urge / Heart's Desire Number ───────────────────────
// Sum of vowel values only
export function calcSoulUrge(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const sum = letters.filter(c => VOWELS.has(c)).reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
  return sum === 0 ? 9 : reduce(sum);
}

// ─── Personality Number ───────────────────────────────────────
// Sum of consonant values only
export function calcPersonality(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const sum = letters.filter(c => !VOWELS.has(c)).reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
  return sum === 0 ? 1 : reduce(sum);
}

// ─── Birthday Number ──────────────────────────────────────────
// Day of birth reduced (master numbers preserved)
export function calcBirthday(day) {
  return reduce(Number(day));
}

// ─── Maturity Number ─────────────────────────────────────────
// Life Path + Destiny, then reduce
export function calcMaturity(lifePath, destiny) {
  return reduce(lifePath + destiny);
}

// ─── Karmic Lessons ──────────────────────────────────────────
// Digits 1–9 absent from the name
export function calcKarmicLessons(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const present = new Set(letters.map(c => LETTER_VALUES[c]).filter(Boolean));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !present.has(n));
}

// ─── Karmic Debt Numbers ─────────────────────────────────────
// Check if 13, 14, 16, or 19 appear as intermediate (unreduced) sums
export function calcKarmicDebt(day, month, year, name) {
  const DEBT = new Set([13, 14, 16, 19]);
  const found = new Set();

  const rawD = digitSum(day);
  const rawM = digitSum(month);
  const rawY = digitSum(year);
  [rawD, rawM, rawY, rawD + rawM + rawY].forEach(n => { if (DEBT.has(n)) found.add(n); });

  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const rawDest = letters.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
  if (DEBT.has(rawDest)) found.add(rawDest);

  return [...found].sort((a, b) => a - b);
}

// ─── Pythagoras Matrix Grid ───────────────────────────────────
// Count frequency of digits 1–9 in the full birth date string (DD MM YYYY)
export function calcMatrixGrid(day, month, year) {
  const str = `${String(day).padStart(2,"0")}${String(month).padStart(2,"0")}${year}`;
  const counts = Object.fromEntries([1,2,3,4,5,6,7,8,9].map(n => [n, 0]));
  str.split("").map(Number).forEach(d => { if (d >= 1 && d <= 9) counts[d]++; });
  return counts;
}

// ─── Missing / Repeated ───────────────────────────────────────
export function calcMissingNumbers(counts) {
  return [1,2,3,4,5,6,7,8,9].filter(n => counts[n] === 0);
}

export function calcRepeatedNumbers(counts) {
  return [1,2,3,4,5,6,7,8,9]
    .filter(n => counts[n] > 1)
    .map(n => ({ num: n, count: counts[n] }));
}

// ─── Energy Strength ──────────────────────────────────────────
export function calcEnergyStrength(counts) {
  return [1,2,3,4,5,6,7,8,9].map(n => ({
    num: n,
    count: counts[n],
    label: ["Absent","Present","Strong","Very Strong"][Math.min(counts[n], 3)],
  }));
}

// ─── Lucky Numbers ────────────────────────────────────────────
export function calcLuckyNumbers(lifePath, destiny, soulUrge, birthday) {
  const set = new Set(
    [lifePath, destiny, soulUrge, birthday]
      .map(n => MASTER_NUMBERS.has(n) ? [Math.floor(n / 10), n % 10] : [n])
      .flat()
      .filter(n => n > 0)
  );
  return [...set].slice(0, 5);
}

// ─── Master calculation ───────────────────────────────────────
export function calculateDestinyMatrix(name, day, month, year) {
  const lifePath      = calcLifePath(day, month, year);
  const destiny       = calcDestiny(name);
  const soulUrge      = calcSoulUrge(name);
  const personality   = calcPersonality(name);
  const birthday      = calcBirthday(day);
  const maturity      = calcMaturity(lifePath, destiny);
  const karmicLessons = calcKarmicLessons(name);
  const karmicDebt    = calcKarmicDebt(day, month, year, name);
  const matrixGrid    = calcMatrixGrid(day, month, year);
  const missingNums   = calcMissingNumbers(matrixGrid);
  const repeatedNums  = calcRepeatedNumbers(matrixGrid);
  const energyStrength = calcEnergyStrength(matrixGrid);
  const luckyNumbers  = calcLuckyNumbers(lifePath, destiny, soulUrge, birthday);

  return {
    lifePath, destiny, soulUrge, personality, birthday,
    maturity, karmicLessons, karmicDebt,
    matrixGrid, missingNums, repeatedNums, energyStrength,
    luckyNumbers,
  };
}

// ─────────────────────────────────────────────────────────────
// Interpretation data
// ─────────────────────────────────────────────────────────────

// Full meaning for each number 1–9 + master numbers
export const NUMBER_MEANINGS = {
  1: {
    title: "The Leader",
    keywords: ["Independence","Leadership","Ambition","Originality"],
    description: "Number 1 is the number of new beginnings, pioneering spirit, and self-reliance. You were born to lead and forge your own path with courage and originality.",
    strengths: ["Natural leadership ability","Strong drive and ambition","Original and creative thinker","Confident and decisive"],
    weaknesses: ["Can be egotistical or domineering","Impatient with others","Stubborn when challenged","May struggle with delegation"],
    career: "Entrepreneurship, executive leadership, military, athletics, invention, or any field where independence and initiative are valued.",
    relationships: "You seek a partner who respects your independence and matches your ambition. You lead in relationships and need space to be yourself.",
    spiritual: "Your soul journey involves mastering self-reliance, developing the courage to take risks, and learning to lead with humility.",
    color: "#ef4444", bg: "#fef2f2",
  },
  2: {
    title: "The Peacemaker",
    keywords: ["Harmony","Cooperation","Diplomacy","Sensitivity"],
    description: "Number 2 is the number of partnership, balance, and deep emotional intelligence. You are a natural mediator, deeply empathetic and a beloved companion.",
    strengths: ["Deeply empathetic and sensitive","Natural diplomat and mediator","Cooperative team player","Highly intuitive and perceptive"],
    weaknesses: ["Can be overly sensitive or easily hurt","Indecisive under pressure","May become dependent or passive","Tends toward self-doubt"],
    career: "Counseling, social work, diplomacy, teaching, healthcare, music, or any field requiring sensitivity and teamwork.",
    relationships: "You thrive in committed partnerships and need emotional security. You give deeply to relationships and expect the same in return.",
    spiritual: "Your soul journey involves learning to balance giving and receiving, establishing healthy boundaries while maintaining compassion.",
    color: "#f59e0b", bg: "#fffbeb",
  },
  3: {
    title: "The Creative",
    keywords: ["Creativity","Expression","Joy","Communication"],
    description: "Number 3 is the number of creative self-expression, joy, and vibrant communication. Your life force radiates through artistic gifts and natural optimism.",
    strengths: ["Highly creative and artistic","Naturally charismatic","Optimistic and uplifting","Gifted communicator and storyteller"],
    weaknesses: ["Can scatter energy across too many projects","Prone to mood swings","May avoid depth or commitment","Can be superficial at times"],
    career: "Arts, writing, acting, public speaking, design, marketing, entertainment, or any creative field.",
    relationships: "You are a fun, affectionate, and stimulating partner who needs intellectual and creative engagement in love.",
    spiritual: "Your soul journey involves expressing your authentic truth, developing focus, and using creativity as a path to joy and service.",
    color: "#22c55e", bg: "#f0fdf4",
  },
  4: {
    title: "The Builder",
    keywords: ["Stability","Discipline","Hard Work","Foundation"],
    description: "Number 4 is the number of practical mastery, discipline, and solid foundations. You build what others only dream of through persistence and methodical effort.",
    strengths: ["Highly disciplined and organized","Reliable and trustworthy","Methodical problem-solver","Loyal and deeply dedicated"],
    weaknesses: ["Can be rigid or inflexible","Resistant to change and new ideas","Workaholic tendencies","Difficulty expressing emotions freely"],
    career: "Engineering, construction, finance, law, management, accounting, or any structured field that values precision.",
    relationships: "You are a loyal, dependable partner who values stability. You show love through consistent action rather than flowery words.",
    spiritual: "Your soul journey involves creating lasting structures, mastering patience, and learning that rest is as vital as work.",
    color: "#3b7bfc", bg: "#eff6ff",
  },
  5: {
    title: "The Adventurer",
    keywords: ["Freedom","Adventure","Change","Versatility"],
    description: "Number 5 is the number of dynamic change, freedom, and multifaceted experience. You are a seeker of life's infinite variety, energized by new challenges.",
    strengths: ["Highly adaptable and versatile","Courageous and adventurous","Progressive and forward-thinking","Magnetic and charismatic personality"],
    weaknesses: ["Restlessness and inability to commit","Impulsive decision-making","Inconsistency in effort","Tendency toward overindulgence"],
    career: "Travel, sales, media, entrepreneurship, acting, sports, exploration, or any field with variety and freedom.",
    relationships: "You need a partner who values your freedom and shares your love of adventure. Routine and possessiveness stifle you.",
    spiritual: "Your soul journey involves embracing change without fear, developing consistency, and using freedom responsibly.",
    color: "#8b5cf6", bg: "#f3f0ff",
  },
  6: {
    title: "The Nurturer",
    keywords: ["Responsibility","Nurturing","Harmony","Service"],
    description: "Number 6 is the number of love, responsibility, and beauty. You are the heart of every home and community you belong to, healing through your presence.",
    strengths: ["Deeply caring and nurturing","Strong sense of responsibility","Artistic eye for beauty and harmony","Natural healer and helper"],
    weaknesses: ["Perfectionism and impossibly high standards","Tendency to be controlling","Martyr complex from giving too much","Difficulty accepting help"],
    career: "Healthcare, education, counseling, arts, social work, family services, or any caring profession.",
    relationships: "You are a devoted, loving partner who prioritizes family and harmony. You give everything to relationships and need appreciation.",
    spiritual: "Your soul journey involves mastering unconditional love — including self-love — and understanding that true service flows from fullness.",
    color: "#06b6d4", bg: "#ecfeff",
  },
  7: {
    title: "The Seeker",
    keywords: ["Analysis","Wisdom","Introspection","Mysticism"],
    description: "Number 7 is the number of spiritual wisdom, deep analysis, and sacred truth. You are a bridge between the material and spiritual worlds.",
    strengths: ["Deeply analytical and intelligent","Strong intuition and perception","Scholarly and genuinely wise","Spiritually aware and perceptive"],
    weaknesses: ["Can be aloof or emotionally distant","Perfectionist and overly critical","Distrustful of others' motives","Tendency toward isolation"],
    career: "Research, science, philosophy, psychology, writing, technology, or spiritual and metaphysical fields.",
    relationships: "You are selective in relationships and value intellectual depth above all. You need space, privacy, and a partner who respects boundaries.",
    spiritual: "Your soul journey involves trusting your inner wisdom, integrating analysis with intuition, and sharing your insights with the world.",
    color: "#d97706", bg: "#fffbeb",
  },
  8: {
    title: "The Powerhouse",
    keywords: ["Power","Success","Abundance","Authority"],
    description: "Number 8 is the number of material mastery, personal power, and abundance. You are a natural executive with the drive and vision to achieve great things.",
    strengths: ["Exceptional executive ability","Highly ambitious and strategic","Remarkably resilient under pressure","Commands natural authority"],
    weaknesses: ["Can be overly materialistic","Workaholic tendencies","Controlling behavior","Difficulty showing vulnerability"],
    career: "Business, finance, real estate, law, politics, corporate leadership, or any field where power and achievement are rewarded.",
    relationships: "You are a strong, protective partner who respects ambition. You express love through providing and achieving for your loved ones.",
    spiritual: "Your soul journey involves balancing material ambition with spiritual values and using your power to uplift others.",
    color: "#64748b", bg: "#f8fafc",
  },
  9: {
    title: "The Humanitarian",
    keywords: ["Compassion","Wisdom","Completion","Universality"],
    description: "Number 9 is the number of completion, universal love, and broad wisdom. Your life carries the energy of all other numbers, and you feel deeply connected to humanity.",
    strengths: ["Deeply compassionate and empathetic","Broad, universal perspective","Generous and giving by nature","Carries natural wisdom"],
    weaknesses: ["Idealism that leads to disappointment","Martyr tendencies","Emotional volatility","Difficulty with endings and letting go"],
    career: "Social work, medicine, arts, philosophy, activism, teaching, or any humanitarian field.",
    relationships: "You love deeply and universally, but may give more than you receive. You need a partner who values depth, meaning, and service.",
    spiritual: "Your soul journey involves learning to complete cycles gracefully, embrace universal love, and release attachments to outcomes.",
    color: "#ec4899", bg: "#fdf2f8",
  },
  11: {
    title: "The Visionary",
    keywords: ["Intuition","Inspiration","Illumination","Spiritual Mastery"],
    description: "Master Number 11 carries the gift of divine inspiration and heightened spiritual consciousness. You are a natural channel for higher wisdom, here to illuminate others.",
    strengths: ["Extraordinarily intuitive and perceptive","Visionary and genuinely inspiring","Spiritually gifted and aware","Illuminating, uplifting presence"],
    weaknesses: ["Nervous tension and anxiety from sensitivity","Can be impractical or dreamy","Fear of stepping into your own power","Overwhelmed by others' energies"],
    career: "Spiritual leadership, counseling, healing arts, philosophy, performing arts, politics, or visionary entrepreneurship.",
    relationships: "You connect at the soul level and seek deep spiritual bonds. You feel your partner's emotions almost as your own.",
    spiritual: "Your master path requires trusting your gifts, managing your sensitivity, and becoming a clear channel of divine inspiration.",
    color: "#6366f1", bg: "#eef2ff",
  },
  22: {
    title: "The Master Builder",
    keywords: ["Mastery","Vision","Global Impact","Legacy"],
    description: "Master Number 22 is the most powerful in numerology. You combine the visionary sensitivity of 11 with the practical mastery of 4 — capable of manifesting grand visions.",
    strengths: ["Exceptional vision grounded in practicality","Capacity for global-scale impact","Strong leadership paired with discipline","Ability to manifest the seemingly impossible"],
    weaknesses: ["Enormous self-imposed pressure","Perfectionism that can paralyze","May underestimate your own potential","Can overwhelm those around you"],
    career: "Architecture, global diplomacy, large-scale entrepreneurship, engineering, or any field requiring lasting, world-scale impact.",
    relationships: "You build relationships like you build everything — for permanence and purpose. You need a partner who supports your life mission.",
    spiritual: "Your master path involves using your extraordinary gifts to manifest something of enduring value for all of humanity.",
    color: "#0891b2", bg: "#ecfeff",
  },
  33: {
    title: "The Master Teacher",
    keywords: ["Service","Compassion","Healing","Enlightenment"],
    description: "Master Number 33 is the rarest and most spiritually elevated number — the master healer and teacher of unconditional love.",
    strengths: ["Boundless compassion for all beings","Powerful healing and teaching ability","Profound spiritual wisdom","Embodies love as a living practice"],
    weaknesses: ["Tendency to take on others' suffering","Sets unrealistic expectations","Self-sacrifice to the point of exhaustion","Martyr complex"],
    career: "Spiritual teaching, medicine, healing arts, counseling, community leadership, or any work of deep, selfless service.",
    relationships: "You love with absolute devotion and see the divine in everyone. You must maintain boundaries to avoid depleting yourself.",
    spiritual: "Your master path is to embody and teach unconditional love — not as sacrifice but as the highest form of spiritual power.",
    color: "#7c3aed", bg: "#f5f3ff",
  },
};

// Soul Urge / Heart's Desire descriptions
export const SOUL_MEANINGS = {
  1: "Your soul craves independence, self-expression, and the freedom to pioneer your own path without constraint.",
  2: "Your soul craves love, harmony, deep emotional connection, and the peace of true partnership.",
  3: "Your soul craves creative expression, joy, playfulness, and authentic communication with the world.",
  4: "Your soul craves security, order, and the deep satisfaction of building something of lasting value.",
  5: "Your soul craves adventure, freedom, variety, and the thrill of constant discovery and change.",
  6: "Your soul craves love, beauty, harmony, and the fulfillment of nurturing those you care for.",
  7: "Your soul craves wisdom, truth, solitude, and the deep understanding of life's sacred mysteries.",
  8: "Your soul craves power, abundance, recognition, and the satisfaction of mastery and achievement.",
  9: "Your soul craves universal love, wisdom, completion, and the chance to make a real difference.",
  11: "Your soul craves spiritual connection, enlightenment, and the ability to inspire and awaken others.",
  22: "Your soul craves mastery, grand achievement, and the chance to build something that transforms the world.",
  33: "Your soul craves selfless service, deep compassion, healing, and the teaching of unconditional love.",
};

// Destiny / Expression extra descriptions
export const DESTINY_EXTRAS = {
  1: "Your destiny calls you to step into leadership, forge new pathways, and inspire others through courageous independence.",
  2: "Your destiny calls you to be a peaceful bridge between people — a diplomat, mediator, and loving companion.",
  3: "Your destiny calls you to share your creativity and joy, uplifting others through authentic self-expression.",
  4: "Your destiny calls you to build systems, structures, and foundations that create lasting security for yourself and others.",
  5: "Your destiny calls you to experience the full breadth of life and guide others toward freedom and adaptability.",
  6: "Your destiny calls you to create beauty, harmony, and healing — nurturing others into their highest potential.",
  7: "Your destiny calls you to seek, discover, and share sacred wisdom that bridges the spiritual and material worlds.",
  8: "Your destiny calls you to master the material world and use your power to create abundance for yourself and others.",
  9: "Your destiny calls you to serve humanity with wisdom and compassion, completing the cycle of spiritual evolution.",
  11: "Your master destiny calls you to be a channel of divine inspiration — illuminating truth for those ready to awaken.",
  22: "Your master destiny calls you to manifest grand visions into reality, leaving an enduring legacy for generations.",
  33: "Your master destiny calls you to heal and teach through unconditional love, embodying compassion in its purest form.",
};

// Karmic Debt interpretations
export const KARMIC_DEBT_MEANINGS = {
  13: {
    title: "Karmic Debt 13 (→4)",
    description: "Past-life lesson around avoiding responsibility and hard work. This lifetime calls for discipline, consistency, and seeing things through to completion.",
    guidance: "Embrace hard work, honor your commitments, and resist the urge to take shortcuts. True mastery comes through sustained, focused effort.",
  },
  14: {
    title: "Karmic Debt 14 (→5)",
    description: "Past-life lesson around misuse of freedom or overindulgence. This lifetime calls for moderation, discipline, and emotional stability.",
    guidance: "Develop a healthy relationship with pleasure and freedom. Balance adventure with responsibility and impulsiveness with thoughtful action.",
  },
  16: {
    title: "Karmic Debt 16 (→7)",
    description: "Past-life lesson around ego, pride, or betrayal in love. This lifetime often brings humbling experiences that strip away false self-image.",
    guidance: "Cultivate genuine humility, honesty in relationships, and spiritual connection. True wisdom emerges after ego is transcended.",
  },
  19: {
    title: "Karmic Debt 19 (→1)",
    description: "Past-life lesson around selfish use of power or disregard for others. This lifetime calls for independence achieved through — not at the expense of — cooperation.",
    guidance: "Learn to ask for help gracefully. True leadership means empowering others, not dominating them. Interdependence is strength.",
  },
};

// Karmic Lesson descriptions (missing numbers in name)
export const KARMIC_LESSON_MEANINGS = {
  1: "You may struggle with taking initiative, asserting yourself, or believing in your own uniqueness and value.",
  2: "You may find it difficult to be sensitive to others, cooperate gracefully, or navigate relationships with tact.",
  3: "You may undervalue creative expression, optimism, and the importance of finding genuine joy in daily life.",
  4: "You may resist the structure, discipline, and practical steps needed to make your dreams a reality.",
  5: "You may avoid change, risk, and new experiences — inadvertently limiting your growth and personal freedom.",
  6: "You may struggle with responsibility, nurturing, or creating harmony in family, home, or community life.",
  7: "You may distrust introspection, avoid depth, or be skeptical of spiritual and philosophical inquiry.",
  8: "You may struggle with business, material matters, authority figures, or claiming your personal power.",
  9: "You may find it difficult to let go, embrace compassion for strangers, or see beyond personal concerns.",
};

// Energy quality description for matrix cells
export const ENERGY_QUALITY = {
  0: { label: "Absent", tip: "This energy is missing. Its lessons are learned through seeking it." },
  1: { label: "Present", tip: "Balanced presence of this energy in your field." },
  2: { label: "Strong", tip: "A dominant energy — both a gift and a challenge to master." },
  3: { label: "Very Strong", tip: "Extremely powerful energy — use it consciously to avoid overwhelm." },
};
