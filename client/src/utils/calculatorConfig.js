// Single source of truth for all calculator categories and their tools.
// Navbar, category pages, breadcrumbs, and search all read from here.

export const CALCULATOR_CATEGORIES = [
  {
    id: "health",
    name: "Health Calculators",
    slug: "health",
    path: "/calculators/health",
    tagline: "BMI, calories, sleep cycles & more",
    description:
      "Free health calculators for BMI, daily calories, macros, sleep cycles, and nutrition. No signup required.",
    icon: "🏥",
    iconBg: "#f0fdf4",
    iconColor: "#22c55e",
    calculators: [
      {
        id: "calorie-tracker",
        label: "Calorie Tracker & Calculator",
        slug: "calorie-tracker",
        tagline: "BMI, TDEE, Macros, Water & Meal Planner",
        description:
          "Calculate your BMI, daily calorie needs (TDEE), macro breakdown, water intake and get healthy meal suggestions — all in one free tool.",
        icon: "🥗",
        iconBg: "#f0fdf4",
        iconColor: "#22c55e",
        path: "/calculators/health/calorie-tracker",
        legacyPath: "/tools/calorie-tracker",
        keywords: ["calorie", "bmi", "tdee", "macros", "nutrition", "diet", "weight loss"],
        available: true,
        badge: "New",
        badgeType: "new",
      },
      {
        id: "sleep-calculator",
        label: "Sleep Calculator",
        slug: "sleep-calculator",
        tagline: "Optimal sleep & wake-up times based on sleep cycles",
        description:
          "Find the best time to go to sleep or wake up based on 90-minute sleep cycles. Wake up refreshed, not groggy.",
        icon: "🌙",
        iconBg: "#eef2ff",
        iconColor: "#6366f1",
        path: "/calculators/health/sleep-calculator",
        legacyPath: "/tools/sleep-calculator",
        keywords: ["sleep", "wake up", "sleep cycle", "rest", "insomnia", "REM"],
        available: true,
        badge: "New",
        badgeType: "new",
      },
    ],
  },
  {
    id: "construction",
    name: "Construction Calculators",
    slug: "construction",
    path: "/calculators/construction",
    tagline: "Square footage, cubic yards, board feet, aluminum weight & more",
    description:
      "Free construction calculators — converters for square footage, cubic yards, board feet, paint coverage, and material weight calculators for aluminum, steel, and more.",
    icon: "🏗️",
    iconBg: "#fff7ed",
    iconColor: "#f59e0b",
    groups: [
      {
        id: "construction-converters",
        name: "Construction Converters",
        icon: "🔨",
        calculators: [
          {
            id: "square-footage-calculator",
            label: "Square Footage Calculator",
            slug: "square-footage",
            tagline: "Area for any shape — floor, roof, land",
            description:
              "Calculate square footage for 10 shapes: rectangle, square, circle, triangle, trapezoid, ellipse, semi-circle, L-shape, ring, and custom polygon. Supports all unit systems.",
            icon: "📐",
            iconBg: "#eff6ff",
            iconColor: "#3b7bfc",
            path: "/calculators/construction/square-footage",
            legacyPath: "/tools/square-footage-calculator",
            keywords: ["square footage", "area", "floor", "roof", "land", "square feet"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "square-yards-calculator",
            label: "Square Yards Calculator",
            slug: "square-yards",
            tagline: "Sod, carpet, tile, flooring & landscaping",
            description:
              "Calculate area in square yards for 10 shapes. Built-in material estimator for sod, carpet, tile, mulch, gravel, and artificial grass.",
            icon: "🌿",
            iconBg: "#f0fdf4",
            iconColor: "#16a34a",
            path: "/calculators/construction/square-yards",
            legacyPath: "/tools/square-yards-calculator",
            keywords: ["square yards", "sod", "carpet", "tile", "flooring", "landscaping"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "cubic-yard-calculator",
            label: "Cubic Yard Calculator",
            slug: "cubic-yard",
            tagline: "Concrete, gravel, sand, soil & more",
            description:
              "Calculate volume in cubic yards for concrete, gravel, sand, soil, mulch and fill dirt. Instant results with material weight estimates.",
            icon: "📐",
            iconBg: "#f0fdf4",
            iconColor: "#16a34a",
            path: "/calculators/construction/cubic-yard",
            legacyPath: "/tools/cubic-yard-calculator",
            keywords: ["cubic yard", "concrete", "gravel", "sand", "soil", "mulch", "volume"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "sqft-to-cubic-yards",
            label: "Sq Ft to Cubic Yards Calculator",
            slug: "sqft-to-cubic-yards",
            tagline: "Convert area + depth to cubic yards instantly",
            description:
              "Convert square feet and depth into cubic yards instantly. Supports material weight estimation for concrete, gravel, sand, topsoil, and mulch.",
            icon: "🧱",
            iconBg: "#f0fdf4",
            iconColor: "#16a34a",
            path: "/calculators/construction/sqft-to-cubic-yards",
            legacyPath: "/tools/sqft-to-cubic-yards",
            keywords: ["sq ft to cubic yards", "square feet", "depth", "volume conversion"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "gallons-calculator",
            label: "Gallons per Sq Ft Calculator",
            slug: "gallons",
            tagline: "Paint, sealers, epoxy & coating coverage",
            description:
              "Calculate gallons per square foot, total gallons needed, and coverage area for paint, primer, epoxy, concrete sealers, and waterproofing.",
            icon: "🪣",
            iconBg: "#eff6ff",
            iconColor: "#3b7bfc",
            path: "/calculators/construction/gallons",
            legacyPath: "/tools/gallons-calculator",
            keywords: ["gallons", "paint", "coverage", "sealer", "epoxy", "coating"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "board-foot-calculator",
            label: "Board Foot Calculator",
            slug: "board-foot",
            tagline: "Calculate lumber volume in board feet",
            description:
              "Instantly calculate board feet for any lumber size. Supports inches, mm, cm, feet and meters. Enter thickness, width, length and quantity.",
            icon: "🪵",
            iconBg: "#fef3c7",
            iconColor: "#d97706",
            path: "/calculators/construction/board-foot",
            legacyPath: "/tools/board-foot-calculator",
            keywords: ["board foot", "lumber", "wood", "timber", "board feet"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "size-to-weight-calculator",
            label: "Size to Weight Calculator",
            slug: "size-to-weight",
            tagline: "Weight of steel, aluminum, concrete & more",
            description:
              "Calculate the weight of any rectangular solid from its dimensions and material density. Supports 20+ materials and all major unit systems.",
            icon: "⚖️",
            iconBg: "#fef3c7",
            iconColor: "#d97706",
            path: "/calculators/construction/size-to-weight",
            legacyPath: "/tools/size-to-weight-calculator",
            keywords: ["weight", "steel", "aluminum", "concrete", "density", "material"],
            available: true,
            badge: "New",
            badgeType: "new",
          },
        ],
      },
      {
        id: "construction-materials",
        name: "Construction Materials Calculators",
        icon: "🧱",
        calculators: [
          {
            id: "baluster-calculator",
            label: "Baluster Calculator",
            slug: "baluster",
            tagline: "Baluster count, spacing & building code compliance",
            description:
              "Calculate the exact number of balusters needed for straight and stair railings. Enforces the 4-inch sphere rule (IRC/IBC), supports 3 layout methods, and includes price estimation per baluster, pack, or box.",
            icon: "🪟",
            iconBg: "#fef3c7",
            iconColor: "#d97706",
            path: "/calculators/construction/baluster",
            keywords: [
              "baluster calculator", "baluster spacing", "railing calculator", "deck railing",
              "4-inch sphere rule", "IRC baluster", "spindle spacing", "stair railing calculator",
              "baluster count", "building code railing",
            ],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "rebar-calculator",
            label: "Rebar Calculator",
            slug: "rebar",
            tagline: "Weight, length & cost for reinforcing steel",
            description:
              "Calculate rebar weight, total length, and material cost for concrete slabs, foundations, footings, walls, columns, and beams. Supports metric and US bar sizes, 3 calculation modes, and instant price estimation.",
            icon: "🪨",
            iconBg: "#fef3c7",
            iconColor: "#d97706",
            path: "/calculators/construction/rebar",
            keywords: [
              "rebar", "reinforcing steel", "rebar weight", "rebar calculator",
              "steel bar", "concrete reinforcement", "deformed bar", "ASTM A615",
            ],
            available: true,
            badge: "New",
            badgeType: "new",
          },
          {
            id: "aluminum-weight-calculator",
            label: "Aluminum Weight Calculator",
            slug: "aluminum-weight",
            tagline: "Weight by shape, alloy & dimensions",
            description:
              "Calculate the weight of aluminum bars, tubes, pipes, sheets, angles, channels, I-beams and more. Supports 12 alloys, 15 shapes, all unit systems, and instant price estimation.",
            icon: "⚖️",
            iconBg: "#f0f9ff",
            iconColor: "#0284c7",
            path: "/calculators/construction/aluminum-weight",
            legacyPath: "/tools/aluminum-weight-calculator",
            keywords: [
              "aluminum weight", "aluminium weight", "alloy density", "6061", "6063",
              "metal weight calculator", "bar weight", "tube weight", "sheet weight",
            ],
            available: true,
            badge: "New",
            badgeType: "new",
          },
        ],
      },
    ],
  },
  {
    id: "everyday-life",
    name: "Everyday Life Calculators",
    slug: "everyday-life",
    path: "/calculators/everyday-life",
    tagline: "Anniversaries, numerology & personal milestones",
    description:
      "Free everyday calculators for anniversaries, numerology, life path numbers, destiny matrix, and personal milestones.",
    icon: "🌅",
    iconBg: "#fff0f5",
    iconColor: "#e11d48",
    calculators: [
      {
        id: "anniversary-calculator",
        label: "Anniversary Calculator",
        slug: "anniversary",
        tagline: "Milestones, countdowns & calendar export",
        description:
          "Track relationship or event anniversaries with a live countdown, elapsed time breakdown, milestone tracker, and one-click calendar export (.ics).",
        icon: "💑",
        iconBg: "#fff0f5",
        iconColor: "#e11d48",
        path: "/calculators/everyday-life/anniversary",
        legacyPath: "/tools/anniversary-calculator",
        keywords: ["anniversary", "relationship", "milestone", "countdown", "calendar"],
        available: true,
        badge: "New",
        badgeType: "new",
      },
      {
        id: "destiny-matrix",
        label: "Destiny Matrix Calculator",
        slug: "destiny-matrix",
        tagline: "Life Path, Numerology Chart & Karmic Reading",
        description:
          "Discover your Life Path, Destiny, Soul Urge and Personality numbers. Get your Pythagoras Matrix, karmic lessons, and full numerology reading.",
        icon: "✦",
        iconBg: "#eef2ff",
        iconColor: "#6366f1",
        path: "/calculators/everyday-life/destiny-matrix",
        legacyPath: "/tools/destiny-matrix",
        keywords: ["destiny matrix", "numerology", "life path", "karmic", "pythagoras"],
        available: true,
        badge: "New",
        badgeType: "new",
      },
    ],
  },
];

export function getCategoryBySlug(slug) {
  return CALCULATOR_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryCalculators(category) {
  if (category.calculators) return category.calculators;
  if (category.groups) return category.groups.flatMap((g) => g.calculators);
  return [];
}

export function getCalculatorBySlug(categorySlug, calcSlug) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  return getCategoryCalculators(category).find((c) => c.slug === calcSlug) || null;
}

export function getAllCalculators() {
  return CALCULATOR_CATEGORIES.flatMap((c) =>
    getCategoryCalculators(c).map((calc) => ({
      ...calc,
      categoryId: c.id,
      categoryName: c.name,
      categoryPath: c.path,
    }))
  );
}
