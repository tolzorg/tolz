// Electricity Calculator engine — matches calculator.net/electricity-calculator.html (it calculates on its server; factors,
// limits, rounding and messages were read off its responses, see scripts/electricity-calculator.test.js).
//
//   kWh per day = power (kW) × use/run capacity × hours used per day
//   per week = 7 days, per month = 30.44 days, per year = 365.25 days;  cost = kWh × price (unrounded kWh)
// Power units: W, kW, BTU/h (0.2930711 W), metric hp (735.49875 W), ton of refrigeration (3,516.8528421 W) — the reference's constants, fitted to its answers. Usage units are
// turned into hours per day (a month is 30.44 days, a year 365.25 days) and capped at what a day / week / month / year can
// hold, as the reference does ("Please provide a reasonable usage number.").
// Display (the reference's): kWh with 2 decimals per day and 1 per week / month, none per year; below 0.1 as many
// significant digits instead; below 0.0001 it shows 0; trailing zeros dropped. Costs: $ with 2 decimals.

export const POWER_UNITS = [
  { value: "W", label: "watt [W]", kw: 0.001 }, { value: "kW", label: "kilowatt [kW]", kw: 1 },
  { value: "btu", label: "BTU/hour [BTU/h]", kw: 0.0002930711 }, { value: "hp", label: "horsepower (metric) [hp]", kw: 0.73549875 },
  { value: "ton", label: "ton (refrigeration)", kw: 3.5168528421 },
];
const DAYS_MONTH = 30.44;
const DAYS_YEAR = 365.25;
/** Usage units: hours per day for one unit, and the most a box may hold. */
export const USAGE_UNITS = [
  { value: "mpd", label: "minutes per day", hpd: 1 / 60, max: 1440 }, { value: "hpd", label: "hours per day", hpd: 1, max: 24 },
  { value: "hpw", label: "hours per week", hpd: 1 / 7, max: 168 }, { value: "hpm", label: "hours per month", hpd: 1 / DAYS_MONTH, max: 744 },
  { value: "dpw", label: "days per week", hpd: 24 / 7, max: 7 }, { value: "dpm", label: "days per month", hpd: 24 / DAYS_MONTH, max: 31 },
  { value: "dpy", label: "days per year", hpd: 24 / DAYS_YEAR, max: 366 }, { value: "mpy", label: "months per year", hpd: (DAYS_MONTH * 24) / DAYS_YEAR, max: 12 },
];
/** The reference's typical appliances: [label, power, power unit, usage, usage unit, capacity %]. */
export const APPLIANCES = [
  ["Air conditioner (HVAC)", "5", "kW", "24", "hpd", "30"], ["Air conditioner (window unit)", "6000", "btu", "8", "hpd", "100"],
  ["Heater (home)", "5", "kW", "24", "hpd", "50"], ["Heater (portable)", "1500", "W", "8", "hpd", "100"],
  ["Humidifier", "200", "W", "8", "hpd", "100"], ["Dehumidifier", "300", "W", "8", "hpd", "100"],
  ["Fan (ceiling, table)", "25", "W", "8", "hpd", "50"], ["Light bulb (LED)", "7", "W", "8", "hpd", "100"],
  ["Light bulb (incandescent)", "60", "W", "8", "hpd", "100"], ["Electric water heater", "4", "kW", "1.5", "hpd", "100"],
  ["Refrigerator", "750", "W", "24", "hpd", "20"], ["Electric range/oven", "2400", "W", "1", "hpd", "50"],
  ["Electric cooktop/stove", "5000", "W", "1", "hpd", "30"], ["Microwave oven", "1000", "W", "10", "mpd", "75"],
  ["Dishwashers", "1500", "W", "1", "hpd", "60"], ["Coffee maker", "1000", "W", "3", "hpd", "30"],
  ["Toaster", "1000", "W", "15", "mpd", "100"], ["Electric kettle", "1000", "W", "30", "mpd", "100"],
  ["Electric cooker", "1000", "W", "45", "mpd", "50"], ["Electric vehicle charger", "10", "kW", "1.5", "hpd", "100"],
  ["Television", "100", "W", "2", "hpd", "80"], ["Clothes washer", "800", "W", "2", "hpw", "80"],
  ["Clothes dryer", "3000", "W", "2", "hpw", "50"], ["Clothes iron", "1000", "W", "2", "hpw", "50"],
  ["Hair dryer", "1500", "W", "10", "mpd", "50"], ["Desktop computer", "150", "W", "10", "hpd", "30"],
  ["Laptop computer", "60", "W", "10", "hpd", "30"], ["Phone", "15", "W", "3", "hpd", "50"], ["Water pump/motor", "1.5", "hp", "10", "hpd", "50"],
].map(([label, power, powerUnit, usage, usageUnit, capacity]) => ({ label, power, powerUnit, usage, usageUnit, capacity }));
/** The reference's prefilled values, shown here as placeholders. */
export const PLACEHOLDERS = { power: "1000", capacity: "100", usage: "24", price: "0.15" };
export const CAPACITY_HELP = "The percentage of the power actually being used. Most appliances do not run at their full capacity all the time. For example, an AC or oven will use less power to maintain the temperature. A fan may not be used at its full speed. The burners of a cooktop are typically not all used at the same time and at their full power.";

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const num = (t) => {
  const s = String(t ?? "").replace(/[$,%\s]/g, "");
  if (s === "") return null;
  return NUMERIC.test(s) ? Number(s) : NaN;
};
/** Half-up rounding on the decimal value (shifts the exponent, not the float). */
function roundHalfUp(x, d) {
  const [m, e] = Number(x.toPrecision(15)).toExponential().split("e");
  const [m2, e2] = Math.round(Number(`${m}e${Number(e) + d}`)).toExponential().split("e");
  return Number(`${m2}e${Number(e2) - d}`);
}
const group = (t) => {
  const [i, f] = t.split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${f !== undefined ? `.${f}` : ""}`;
};
/** kWh as the reference shows it, with `d` decimals for the row (day 2, week 1, month 1, year 0). */
export function formatKwh(x, d) {
  if (x < 0.0001) return "0";
  const dec = x < 0.1 ? d - 1 - Math.floor(Math.log10(x)) : d;
  const t = roundHalfUp(x, dec).toFixed(dec);
  return group(dec > 0 ? t.replace(/\.?0+$/, "") : t);
}
export const formatCost = (x) => `$${group(roundHalfUp(x, 2).toFixed(2))}`;

/**
 * @param {{ power: string, powerUnit, capacity: string, usage: string, usageUnit, price: string }} input
 * @returns {{ missing: string[] } | { errors: string[] } | { rows: { span, kwh, cost, kwhText, costText }[], dailyKwh, hoursPerDay }}
 */
export function calculateElectricity({ power, powerUnit, capacity, usage, usageUnit, price }) {
  const raw = { power: num(power), capacity: num(capacity), usage: num(usage), price: num(price) };
  const missing = Object.keys(raw).filter((k) => raw[k] === null);
  if (missing.length) return { missing };
  const unit = USAGE_UNITS.find((u) => u.value === usageUnit) || USAGE_UNITS[1];
  const errors = [];
  if (!(raw.power > 0)) errors.push("Please provide a positive appliance power value.");
  if (!(raw.capacity >= 0 && raw.capacity <= 100)) errors.push("Please provide a use/run at capacity value between 0 and 100.");
  if (!(raw.usage > 0)) errors.push("Please provide a positive usage value.");
  else if (raw.usage > unit.max) errors.push("Please provide a reasonable usage number.");
  if (!(raw.price > 0)) errors.push("Please provide a positive price value.");
  if (errors.length) return { errors };

  const kw = raw.power * (POWER_UNITS.find((u) => u.value === powerUnit) || POWER_UNITS[0]).kw;
  const hoursPerDay = raw.usage * unit.hpd;
  const dailyKwh = kw * (raw.capacity / 100) * hoursPerDay;
  const rows = [["per day", 1, 2], ["per week", 7, 1], ["per month", DAYS_MONTH, 1], ["per year", DAYS_YEAR, 0]].map(([span, days, d]) => {
    const kwh = dailyKwh * days;
    return { span, kwh, cost: kwh * raw.price, kwhText: `${formatKwh(kwh, d)} kWh`, costText: formatCost(kwh * raw.price) };
  });
  return { rows, dailyKwh, hoursPerDay };
}
