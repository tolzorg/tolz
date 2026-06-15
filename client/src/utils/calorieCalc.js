export const ACTIVITY_LEVELS = [
  { id: "sedentary",  label: "Sedentary",        desc: "Little or no exercise",        multiplier: 1.2   },
  { id: "lightly",    label: "Lightly Active",    desc: "1–3 days/week",                multiplier: 1.375 },
  { id: "moderately", label: "Moderately Active", desc: "3–5 days/week",                multiplier: 1.55  },
  { id: "very",       label: "Very Active",       desc: "6–7 days/week",                multiplier: 1.725 },
  { id: "extra",      label: "Extra Active",      desc: "Very hard exercise / physical job", multiplier: 1.9 },
];

export const WEATHER_OPTIONS = [
  { id: "normal",   label: "Mild",     desc: "Normal climate",       bonus: 0    },
  { id: "hot",      label: "Hot",      desc: "+0.5 L hot weather",   bonus: 0.5  },
  { id: "very_hot", label: "Very Hot", desc: "+0.75 L humid/extreme", bonus: 0.75 },
];

export const MACRO_MODES = [
  { id: "balanced",    label: "Balanced",     desc: "30P · 40C · 30F", protein: 0.30, carbs: 0.40, fat: 0.30 },
  { id: "lowCarb",     label: "Low Carb",     desc: "35P · 20C · 45F", protein: 0.35, carbs: 0.20, fat: 0.45 },
  { id: "highProtein", label: "High Protein", desc: "40P · 35C · 25F", protein: 0.40, carbs: 0.35, fat: 0.25 },
];

export function calculateBMI(weightKg, heightCm) {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight",  color: "#3b7bfc", textColor: "#1d4ed8", bg: "#eff6ff" };
  if (bmi < 25)   return { label: "Normal weight", color: "#22c55e", textColor: "#15803d", bg: "#f0fdf4" };
  if (bmi < 30)   return { label: "Overweight",    color: "#f59e0b", textColor: "#b45309", bg: "#fffbeb" };
  return             { label: "Obese",            color: "#ef4444", textColor: "#dc2626", bg: "#fff5f5" };
}

export function getHealthyWeightRange(heightCm) {
  const h = heightCm / 100;
  const minKg = Math.round(18.5 * h * h * 10) / 10;
  const maxKg = Math.round(24.9 * h * h * 10) / 10;
  return { minKg, maxKg, minLbs: Math.round(minKg * 2.20462 * 10) / 10, maxLbs: Math.round(maxKg * 2.20462 * 10) / 10 };
}

export function getBMIHealthMessage(bmi) {
  if (bmi < 16)   return "Very underweight. Please consult a healthcare professional about healthy weight gain.";
  if (bmi < 18.5) return "Slightly underweight. Consider increasing caloric intake with nutritious foods.";
  if (bmi < 22)   return "Excellent! Your BMI is in the optimal healthy range. Keep up your great habits!";
  if (bmi < 25)   return "Good! You're within the healthy BMI range. Maintain your current lifestyle.";
  if (bmi < 27.5) return "Slightly overweight. Small lifestyle changes can help you reach a healthier weight.";
  if (bmi < 30)   return "Overweight. Regular exercise and a balanced diet can help reduce health risks.";
  if (bmi < 35)   return "Obese Class I. Consult a healthcare provider for a personalised weight management plan.";
  return "High BMI. Please seek professional medical advice for health risk assessment and guidance.";
}

export function calculateBMR(gender, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr, activityId) {
  const level = ACTIVITY_LEVELS.find(a => a.id === activityId);
  return bmr * (level ? level.multiplier : 1.2);
}

export function calculateMacros(totalCalories, mode) {
  const profile = MACRO_MODES.find(m => m.id === mode) || MACRO_MODES[0];
  return {
    protein:     Math.round((totalCalories * profile.protein) / 4),
    carbs:       Math.round((totalCalories * profile.carbs)   / 4),
    fat:         Math.round((totalCalories * profile.fat)     / 9),
    proteinCals: Math.round(totalCalories * profile.protein),
    carbsCals:   Math.round(totalCalories * profile.carbs),
    fatCals:     Math.round(totalCalories * profile.fat),
    proteinPct:  Math.round(profile.protein * 100),
    carbsPct:    Math.round(profile.carbs   * 100),
    fatPct:      Math.round(profile.fat     * 100),
  };
}

export function calculateWater(weightKg, activityId, weatherId) {
  const actIdx  = ACTIVITY_LEVELS.findIndex(a => a.id === activityId);
  const actBonus = [0, 0.35, 0.5, 0.75, 1.0][actIdx] ?? 0;
  const weather = WEATHER_OPTIONS.find(w => w.id === weatherId);
  const wxBonus = weather ? weather.bonus : 0;
  const liters  = Math.round((weightKg * 0.033 + actBonus + wxBonus) * 10) / 10;
  return { liters, oz: Math.round(liters * 33.814), glasses: Math.round(liters / 0.25) };
}

export function kgToLbs(kg)  { return Math.round(kg  * 2.20462 * 10) / 10; }
export function lbsToKg(lbs) { return Math.round(lbs / 2.20462 * 10) / 10; }
export function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  return { feet: Math.floor(totalIn / 12), inches: Math.round(totalIn % 12) };
}
export function ftInToCm(feet, inches) { return Math.round(feet * 30.48 + inches * 2.54); }

export const MEAL_SUGGESTIONS = {
  weightLoss: [
    { name: "Grilled Chicken Salad",      cal: 350, protein: 35, carbs: 15, fat: 12, time: "20 min", emoji: "🥗" },
    { name: "Vegetable Stir Fry",          cal: 280, protein: 12, carbs: 35, fat: 8,  time: "15 min", emoji: "🥦" },
    { name: "Tuna Lettuce Wraps",          cal: 240, protein: 28, carbs: 10, fat: 8,  time: "10 min", emoji: "🥬" },
    { name: "Greek Yogurt Bowl",           cal: 200, protein: 20, carbs: 22, fat: 3,  time: "5 min",  emoji: "🫙" },
    { name: "Egg White Omelette",          cal: 180, protein: 22, carbs: 4,  fat: 4,  time: "10 min", emoji: "🍳" },
    { name: "Steamed Broccoli & Salmon",   cal: 310, protein: 32, carbs: 12, fat: 14, time: "25 min", emoji: "🐟" },
  ],
  maintenance: [
    { name: "Brown Rice & Chicken",        cal: 520, protein: 40, carbs: 62, fat: 10, time: "30 min", emoji: "🍚" },
    { name: "Whole Grain Pasta",           cal: 490, protein: 18, carbs: 72, fat: 12, time: "20 min", emoji: "🍝" },
    { name: "Quinoa Buddha Bowl",          cal: 470, protein: 22, carbs: 55, fat: 16, time: "25 min", emoji: "🥙" },
    { name: "Veggie Burrito",              cal: 510, protein: 20, carbs: 68, fat: 14, time: "20 min", emoji: "🌯" },
    { name: "Turkey & Avocado Sandwich",   cal: 450, protein: 32, carbs: 48, fat: 12, time: "10 min", emoji: "🥪" },
    { name: "Red Lentil Soup",             cal: 380, protein: 22, carbs: 52, fat: 6,  time: "35 min", emoji: "🍲" },
  ],
  muscleGain: [
    { name: "Chicken & Sweet Potato",      cal: 680, protein: 52, carbs: 72, fat: 14, time: "35 min", emoji: "🍠" },
    { name: "Beef & Rice Bowl",            cal: 720, protein: 48, carbs: 75, fat: 18, time: "30 min", emoji: "🍛" },
    { name: "High-Protein Smoothie",       cal: 480, protein: 45, carbs: 52, fat: 10, time: "5 min",  emoji: "🥤" },
    { name: "Eggs & Oatmeal Breakfast",    cal: 560, protein: 36, carbs: 62, fat: 16, time: "15 min", emoji: "🥚" },
    { name: "Salmon & Quinoa",             cal: 620, protein: 48, carbs: 55, fat: 20, time: "30 min", emoji: "🐠" },
    { name: "Cottage Cheese & Berry Bowl", cal: 380, protein: 36, carbs: 38, fat: 8,  time: "5 min",  emoji: "🍓" },
  ],
};
