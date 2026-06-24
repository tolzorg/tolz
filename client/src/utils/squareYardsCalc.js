// Square Yards Calculator — material estimator data and shape examples

export const MATERIALS = [
  {
    id: "none",
    label: "— Select a material —",
    coverageSqYd: null,
    unitLabel: null,
    hint: null,
  },
  {
    id: "sod",
    label: "Sod",
    coverageSqYd: 1,
    unitLabel: "yd²",
    hint: "Sod is typically sold and installed by sq yd",
  },
  {
    id: "mulch",
    label: "Mulch",
    coverageSqYd: 1.33,
    unitLabel: "bag",
    hint: "2 cu ft bag covers ~12 sq ft (~1.33 yd²) at 2\" depth",
  },
  {
    id: "gravel",
    label: "Gravel",
    coverageSqYd: 0.33,
    unitLabel: "bag",
    hint: "0.5 cu ft bag covers ~3 sq ft (~0.33 yd²) at 2\" depth",
  },
  {
    id: "tile",
    label: "Tile (12\" × 12\")",
    coverageSqYd: 1.33,
    unitLabel: "box",
    hint: "12 tiles per box = 12 sq ft ≈ 1.33 yd²; adjust for your tile size",
  },
  {
    id: "carpet",
    label: "Carpet",
    coverageSqYd: 1,
    unitLabel: "yd²",
    hint: "Carpet is sold and installed by sq yd",
  },
  {
    id: "grass",
    label: "Artificial Grass",
    coverageSqYd: 1,
    unitLabel: "yd²",
    hint: "Artificial grass is typically sold by sq yd",
  },
];

// Shape-specific examples shown in sq yd context
export const SHAPE_EXAMPLES = {
  rectangle: {
    rows: [
      ["Length",         "15 ft"],
      ["Width",          "12 ft"],
      ["Area (ft²)",     "15 × 12 = 180 ft²"],
      ["Area (yd²)",     "180 ÷ 9 = 20 yd²"],
      ["Perimeter",      "2 × (15 + 12) = 54 ft"],
    ],
    result: "20 yd²",
  },
  square: {
    rows: [
      ["Side",       "9 ft"],
      ["Area (ft²)", "9² = 81 ft²"],
      ["Area (yd²)", "81 ÷ 9 = 9 yd²"],
      ["Perimeter",  "4 × 9 = 36 ft"],
    ],
    result: "9 yd²",
  },
  circle: {
    rows: [
      ["Radius",        "3 yd"],
      ["Area",          "π × 3² = 28.27 yd²"],
      ["Circumference", "2π × 3 = 18.85 yd"],
    ],
    result: "28.27 yd²",
  },
  triangle: {
    rows: [
      ["Base",       "9 ft (= 3 yd)"],
      ["Height",     "6 ft (= 2 yd)"],
      ["Area (ft²)", "½ × 9 × 6 = 27 ft²"],
      ["Area (yd²)", "27 ÷ 9 = 3 yd²"],
    ],
    result: "3 yd²",
  },
  trapezoid: {
    rows: [
      ["Top (a)",    "3 yd"],
      ["Bottom (b)", "6 yd"],
      ["Height",     "2 yd"],
      ["Area",       "½ × (3 + 6) × 2 = 9 yd²"],
    ],
    result: "9 yd²",
  },
  ellipse: {
    rows: [
      ["Major axis (a)", "4 yd"],
      ["Minor axis (b)", "3 yd"],
      ["Area",           "π × 4 × 3 = 37.70 yd²"],
      ["Perimeter",      "≈ 22.10 yd (Ramanujan)"],
    ],
    result: "37.70 yd²",
  },
  semicircle: {
    rows: [
      ["Radius",    "3 yd"],
      ["Area",      "½ × π × 3² = 14.14 yd²"],
      ["Perimeter", "π × 3 + 2 × 3 = 15.42 yd"],
    ],
    result: "14.14 yd²",
  },
  lshape: {
    rows: [
      ["Length A",  "4 yd"],
      ["Width A",   "2 yd"],
      ["Length B",  "2 yd"],
      ["Width B",   "2 yd"],
      ["Area",      "(4 × 2) + (2 × 2) = 8 + 4 = 12 yd²"],
    ],
    result: "12 yd²",
  },
  ring: {
    rows: [
      ["Outer radius (R)", "3 yd"],
      ["Inner radius (r)", "1.5 yd"],
      ["Area",             "π × (3² − 1.5²) = π × 6.75 = 21.21 yd²"],
      ["Circumference",    "2π × (3 + 1.5) = 28.27 yd"],
    ],
    result: "21.21 yd²",
  },
  custom: null,
};
