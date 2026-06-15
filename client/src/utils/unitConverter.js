// ── Unit conversion engine ────────────────────────────────────
//
// Convention for `factor`:
//   factor = "how many of THIS unit equal 1 BASE unit"
//   baseValue  = input / from.factor   (converts to base)
//   result     = baseValue * to.factor (converts from base to output unit)
//
// Temperature uses toBase/fromBase functions (non-linear).
//
// All factors derived from exact SI definitions where possible.

// ── Exact definitional constants ──────────────────────────────
const INCH   = 0.0254;          // m per inch (exact)
const FOOT   = 0.3048;          // m per foot (exact)
const YARD   = 0.9144;          // m per yard (exact)
const MILE   = 1609.344;        // m per mile (exact)
const NAUT   = 1852;            // m per nautical mile (exact)
const POUND  = 453.59237;       // g per pound (exact)
const OZ     = 28.349523125;    // g per ounce (exact)
const US_GAL = 3.785411784;     // L per US gallon (exact)

export const UNIT_CATEGORIES = [

  // ── 1. Length ────────────────────────────────────────────────
  {
    id: "length",
    label: "Length",
    icon: "📏",
    defaultFrom: "m",
    defaultTo: "ft",
    units: [
      { id: "nm",  label: "Nanometer",     symbol: "nm",  factor: 1e9 },
      { id: "µm",  label: "Micrometer",    symbol: "µm",  factor: 1e6 },
      { id: "mm",  label: "Millimeter",    symbol: "mm",  factor: 1000 },
      { id: "cm",  label: "Centimeter",    symbol: "cm",  factor: 100 },
      { id: "m",   label: "Meter",         symbol: "m",   factor: 1 },
      { id: "km",  label: "Kilometer",     symbol: "km",  factor: 0.001 },
      { id: "in",  label: "Inch",          symbol: "in",  factor: 1 / INCH },
      { id: "ft",  label: "Foot",          symbol: "ft",  factor: 1 / FOOT },
      { id: "yd",  label: "Yard",          symbol: "yd",  factor: 1 / YARD },
      { id: "mi",  label: "Mile",          symbol: "mi",  factor: 1 / MILE },
      { id: "nmi", label: "Nautical Mile", symbol: "nmi", factor: 1 / NAUT },
    ],
  },

  // ── 2. Weight / Mass ─────────────────────────────────────────
  {
    id: "weight",
    label: "Weight",
    icon: "⚖️",
    defaultFrom: "kg",
    defaultTo: "lb",
    units: [
      { id: "µg", label: "Microgram",   symbol: "µg", factor: 1e6 },
      { id: "mg", label: "Milligram",   symbol: "mg", factor: 1000 },
      { id: "g",  label: "Gram",        symbol: "g",  factor: 1 },
      { id: "kg", label: "Kilogram",    symbol: "kg", factor: 0.001 },
      { id: "t",  label: "Metric Ton",  symbol: "t",  factor: 1e-6 },
      { id: "oz", label: "Ounce",       symbol: "oz", factor: 1 / OZ },
      { id: "lb", label: "Pound",       symbol: "lb", factor: 1 / POUND },
      { id: "st", label: "Stone",       symbol: "st", factor: 1 / (14 * POUND) },
    ],
  },

  // ── 3. Temperature ────────────────────────────────────────────
  // Base = Celsius; toBase converts TO Celsius, fromBase converts FROM Celsius
  {
    id: "temperature",
    label: "Temperature",
    icon: "🌡️",
    defaultFrom: "c",
    defaultTo: "f",
    special: true,
    units: [
      {
        id: "c", label: "Celsius",    symbol: "°C",
        toBase:   v => v,
        fromBase: v => v,
      },
      {
        id: "f", label: "Fahrenheit", symbol: "°F",
        toBase:   v => (v - 32) * 5 / 9,
        fromBase: v => v * 9 / 5 + 32,
      },
      {
        id: "k", label: "Kelvin",     symbol: "K",
        toBase:   v => v - 273.15,
        fromBase: v => v + 273.15,
      },
      {
        id: "r", label: "Rankine",    symbol: "°R",
        toBase:   v => (v - 491.67) * 5 / 9,
        fromBase: v => v * 9 / 5 + 491.67,
      },
    ],
  },

  // ── 4. Area ───────────────────────────────────────────────────
  // Base = square meter
  {
    id: "area",
    label: "Area",
    icon: "📐",
    defaultFrom: "m2",
    defaultTo: "ft2",
    units: [
      { id: "mm2", label: "Sq. Millimeter", symbol: "mm²",  factor: 1e6 },
      { id: "cm2", label: "Sq. Centimeter", symbol: "cm²",  factor: 1e4 },
      { id: "m2",  label: "Sq. Meter",      symbol: "m²",   factor: 1 },
      { id: "km2", label: "Sq. Kilometer",  symbol: "km²",  factor: 1e-6 },
      { id: "in2", label: "Sq. Inch",       symbol: "in²",  factor: 1 / (INCH * INCH) },
      { id: "ft2", label: "Sq. Foot",       symbol: "ft²",  factor: 1 / (FOOT * FOOT) },
      { id: "yd2", label: "Sq. Yard",       symbol: "yd²",  factor: 1 / (YARD * YARD) },
      { id: "ac",  label: "Acre",           symbol: "ac",   factor: 1 / 4046.8564224 },
      { id: "ha",  label: "Hectare",        symbol: "ha",   factor: 1e-4 },
      { id: "mi2", label: "Sq. Mile",       symbol: "mi²",  factor: 1 / (MILE * MILE) },
    ],
  },

  // ── 5. Volume ─────────────────────────────────────────────────
  // Base = liter
  {
    id: "volume",
    label: "Volume",
    icon: "🧪",
    defaultFrom: "l",
    defaultTo: "gal",
    units: [
      { id: "ml",     label: "Milliliter",    symbol: "mL",   factor: 1000 },
      { id: "cl",     label: "Centiliter",    symbol: "cL",   factor: 100 },
      { id: "l",      label: "Liter",         symbol: "L",    factor: 1 },
      { id: "m3",     label: "Cubic Meter",   symbol: "m³",   factor: 0.001 },
      { id: "cm3",    label: "Cubic Cm",      symbol: "cm³",  factor: 1000 },
      { id: "in3",    label: "Cubic Inch",    symbol: "in³",  factor: 1 / 0.016387064 },
      { id: "ft3",    label: "Cubic Foot",    symbol: "ft³",  factor: 1 / 28.316846592 },
      { id: "tsp",    label: "Teaspoon (US)", symbol: "tsp",  factor: 1 / 0.00492892159375 },
      { id: "tbsp",   label: "Tablespoon (US)",symbol:"tbsp", factor: 1 / 0.014786764781250 },
      { id: "fl_oz",  label: "Fluid Oz (US)", symbol: "fl oz",factor: 1 / 0.029573529562500 },
      { id: "cup",    label: "Cup (US)",       symbol: "cup",  factor: 1 / 0.2365882365 },
      { id: "pt",     label: "Pint (US)",      symbol: "pt",   factor: 1 / 0.473176473 },
      { id: "qt",     label: "Quart (US)",     symbol: "qt",   factor: 1 / 0.946352946 },
      { id: "gal",    label: "Gallon (US)",    symbol: "gal",  factor: 1 / US_GAL },
      { id: "gal_uk", label: "Gallon (UK)",    symbol: "gal UK", factor: 1 / 4.54609 },
    ],
  },

  // ── 6. Speed ──────────────────────────────────────────────────
  // Base = m/s
  {
    id: "speed",
    label: "Speed",
    icon: "💨",
    defaultFrom: "kmh",
    defaultTo: "mph",
    units: [
      { id: "ms",   label: "Meter/sec",    symbol: "m/s",   factor: 1 },
      { id: "kmh",  label: "Kilometer/hr", symbol: "km/h",  factor: 3.6 },
      { id: "mph",  label: "Mile/hr",      symbol: "mph",   factor: 1 / 0.44704 },
      { id: "fts",  label: "Foot/sec",     symbol: "ft/s",  factor: 1 / FOOT },
      { id: "knot", label: "Knot",         symbol: "kn",    factor: 1 / (NAUT / 3600) },
      { id: "mach", label: "Mach",         symbol: "Ma",    factor: 1 / 343 },
    ],
  },

  // ── 7. Time ───────────────────────────────────────────────────
  // Base = second
  {
    id: "time",
    label: "Time",
    icon: "⏱️",
    defaultFrom: "h",
    defaultTo: "min",
    units: [
      { id: "ns",   label: "Nanosecond",  symbol: "ns",  factor: 1e9 },
      { id: "µs",   label: "Microsecond", symbol: "µs",  factor: 1e6 },
      { id: "ms",   label: "Millisecond", symbol: "ms",  factor: 1e3 },
      { id: "s",    label: "Second",      symbol: "s",   factor: 1 },
      { id: "min",  label: "Minute",      symbol: "min", factor: 1 / 60 },
      { id: "h",    label: "Hour",        symbol: "h",   factor: 1 / 3600 },
      { id: "day",  label: "Day",         symbol: "day", factor: 1 / 86400 },
      { id: "week", label: "Week",        symbol: "wk",  factor: 1 / 604800 },
      { id: "mo",   label: "Month (avg)", symbol: "mo",  factor: 1 / 2629800 },
      { id: "yr",   label: "Year (365.25d)",symbol:"yr", factor: 1 / 31557600 },
    ],
  },

  // ── 8. Data Storage ───────────────────────────────────────────
  // Base = byte (binary prefixes: 1 KB = 1024 B)
  {
    id: "data",
    label: "Data",
    icon: "💾",
    defaultFrom: "gb",
    defaultTo: "mb",
    units: [
      { id: "bit", label: "Bit",      symbol: "bit", factor: 8 },
      { id: "b",   label: "Byte",     symbol: "B",   factor: 1 },
      { id: "kb",  label: "Kilobyte", symbol: "KB",  factor: 1 / 1024 },
      { id: "mb",  label: "Megabyte", symbol: "MB",  factor: 1 / (1024 ** 2) },
      { id: "gb",  label: "Gigabyte", symbol: "GB",  factor: 1 / (1024 ** 3) },
      { id: "tb",  label: "Terabyte", symbol: "TB",  factor: 1 / (1024 ** 4) },
      { id: "pb",  label: "Petabyte", symbol: "PB",  factor: 1 / (1024 ** 5) },
    ],
  },

  // ── 9. Energy ─────────────────────────────────────────────────
  // Base = joule
  {
    id: "energy",
    label: "Energy",
    icon: "⚡",
    defaultFrom: "kj",
    defaultTo: "kcal",
    units: [
      { id: "j",    label: "Joule",       symbol: "J",    factor: 1 },
      { id: "kj",   label: "Kilojoule",   symbol: "kJ",   factor: 1e-3 },
      { id: "mj",   label: "Megajoule",   symbol: "MJ",   factor: 1e-6 },
      { id: "cal",  label: "Calorie",     symbol: "cal",  factor: 1 / 4.184 },
      { id: "kcal", label: "Kilocalorie", symbol: "kcal", factor: 1 / 4184 },
      { id: "wh",   label: "Watt-hour",   symbol: "Wh",   factor: 1 / 3600 },
      { id: "kwh",  label: "Kilowatt-hr", symbol: "kWh",  factor: 1 / 3600000 },
      { id: "btu",  label: "BTU",         symbol: "BTU",  factor: 1 / 1055.05585262 },
      { id: "ev",   label: "Electronvolt",symbol: "eV",   factor: 1 / 1.602176634e-19 },
    ],
  },

  // ── 10. Pressure ──────────────────────────────────────────────
  // Base = pascal
  {
    id: "pressure",
    label: "Pressure",
    icon: "🔬",
    defaultFrom: "bar",
    defaultTo: "psi",
    units: [
      { id: "pa",   label: "Pascal",      symbol: "Pa",   factor: 1 },
      { id: "hpa",  label: "Hectopascal", symbol: "hPa",  factor: 0.01 },
      { id: "kpa",  label: "Kilopascal",  symbol: "kPa",  factor: 0.001 },
      { id: "mpa",  label: "Megapascal",  symbol: "MPa",  factor: 1e-6 },
      { id: "bar",  label: "Bar",         symbol: "bar",  factor: 1e-5 },
      { id: "mbar", label: "Millibar",    symbol: "mbar", factor: 0.01 },
      { id: "psi",  label: "PSI",         symbol: "psi",  factor: 1 / 6894.757293168 },
      { id: "atm",  label: "Atmosphere",  symbol: "atm",  factor: 1 / 101325 },
      { id: "mmhg", label: "mmHg (Torr)", symbol: "mmHg", factor: 1 / 133.322387415 },
      { id: "inhg", label: "inHg",        symbol: "inHg", factor: 1 / 3386.389 },
    ],
  },

  // ── 11. Angle ─────────────────────────────────────────────────
  // Base = degree
  {
    id: "angle",
    label: "Angle",
    icon: "📐",
    defaultFrom: "deg",
    defaultTo: "rad",
    units: [
      { id: "deg",    label: "Degree",    symbol: "°",    factor: 1 },
      { id: "rad",    label: "Radian",    symbol: "rad",  factor: Math.PI / 180 },
      { id: "grad",   label: "Gradian",   symbol: "grad", factor: 10 / 9 },
      { id: "turn",   label: "Turn",      symbol: "turn", factor: 1 / 360 },
      { id: "arcmin", label: "Arc Minute",symbol: "'",    factor: 60 },
      { id: "arcsec", label: "Arc Second",symbol: '"',    factor: 3600 },
    ],
  },

  // ── 12. Frequency ─────────────────────────────────────────────
  // Base = hertz
  {
    id: "frequency",
    label: "Frequency",
    icon: "📡",
    defaultFrom: "mhz",
    defaultTo: "ghz",
    units: [
      { id: "hz",  label: "Hertz",     symbol: "Hz",  factor: 1 },
      { id: "khz", label: "Kilohertz", symbol: "kHz", factor: 1e-3 },
      { id: "mhz", label: "Megahertz", symbol: "MHz", factor: 1e-6 },
      { id: "ghz", label: "Gigahertz", symbol: "GHz", factor: 1e-9 },
      { id: "thz", label: "Terahertz", symbol: "THz", factor: 1e-12 },
      { id: "rpm", label: "RPM",       symbol: "rpm", factor: 1 / 60 },
    ],
  },
];

// ── Fast O(1) lookup maps ──────────────────────────────────────
const _catMap = new Map(UNIT_CATEGORIES.map((c) => [c.id, c]));

function _unitMap(cat) {
  return new Map(cat.units.map((u) => [u.id, u]));
}

const _unitMaps = new Map(
  UNIT_CATEGORIES.map((c) => [c.id, _unitMap(c)])
);

// ── Core convert function ──────────────────────────────────────
export function convert(value, fromId, toId, catId) {
  if (!isFinite(value)) return NaN;

  const cat = _catMap.get(catId);
  if (!cat) return NaN;

  const units = _unitMaps.get(catId);
  const from  = units.get(fromId);
  const to    = units.get(toId);
  if (!from || !to) return NaN;

  // Same unit → no-op
  if (fromId === toId) return value;

  // Temperature: non-linear formula path
  if (cat.special) {
    const base = from.toBase(value);
    return to.fromBase(base);
  }

  // Standard multiplicative path
  const base = value / from.factor;
  return base * to.factor;
}

// ── Number formatting ──────────────────────────────────────────
export function formatResult(value) {
  if (!isFinite(value)) return "";
  if (value === 0) return "0";

  const abs = Math.abs(value);

  // Exact safe integer → no decimal formatting needed
  if (Number.isSafeInteger(value)) return value.toLocaleString("en-US");

  // Very large → scientific notation
  if (abs >= 1e13) {
    return value.toExponential(8).replace(/\.?0+(e)/, "$1");
  }

  // Very small → scientific notation
  if (abs > 0 && abs < 1e-7) {
    return value.toExponential(6).replace(/\.?0+(e)/, "$1");
  }

  // Normal range → 10 significant figures, strip trailing zeros
  const precise = parseFloat(value.toPrecision(10));
  // Use locale formatting only for large numbers (adds commas)
  if (Math.abs(precise) >= 10000) {
    return precise.toLocaleString("en-US", { maximumSignificantDigits: 10 });
  }
  return precise.toString();
}

// ── Helper: get category by id ─────────────────────────────────
export function getCategoryById(id) {
  return _catMap.get(id) ?? null;
}

// ── Helper: safe parse a user-typed string ────────────────────
export function safeParseFloat(str) {
  if (!str || str.trim() === "" || str === "-") return NaN;
  const n = Number(str);
  return isFinite(n) ? n : NaN;
}
