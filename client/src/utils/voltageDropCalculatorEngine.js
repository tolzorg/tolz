// Voltage Drop Calculator engine — matches calculator.net/voltage-drop-calculator.html (it calculates on its server; its
// tables, formulas, rounding and messages were read off its responses, see scripts/voltage-drop-calculator.test.js).
//
//   voltage drop = k × I × Z × L / n      k = 2 (DC, AC single phase) or √3 (AC 3-phase); I load current (A);
//                                         L one-way distance (km); n conductors per phase in parallel
//   Z (Ω/km, per conductor):
//     NEC data:            AC: R × PF + X × sin(acos PF);   DC: R          (NEC Chapter 9 Table 9, metric values)
//     Estimated resistance: copper Ω/km of the wire size × conductivity of copper / conductivity of the metal
//                           (S/m × 10⁷: copper 5.96, aluminum 3.78, silver 6.30, gold 4.52)
//     Other:                the resistance typed, converted to Ω/km
//   percentage = drop / voltage × 100;  voltage at the end = voltage − the drop as shown. A drop larger than the voltage gets the
//   reference's "It is unlikely that this wire can support…" sentence instead.
//
// Deviation (flagged to the user): that sentence says "amperes of current" (the reference's text reads "of currency").

export const TABS = [
  { value: "nec", label: "NEC data" },
  { value: "size", label: "Estimated resistance" },
  { value: "other", label: "Other" },
];

export const NEC_SIZES = [
  "14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG", "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG",
  "250 kcmil", "300 kcmil", "350 kcmil", "400 kcmil", "500 kcmil", "600 kcmil", "750 kcmil", "1000 kcmil",
];
export const NEC_MATERIALS = [{ value: "copper", label: "Copper" }, { value: "aluminum", label: "Aluminum" }];
export const CONDUITS = [{ value: "pvc", label: "PVC" }, { value: "aluminum", label: "Aluminum" }, { value: "steel", label: "Steel" }];
const XL_PVC_AL = [0.19, 0.177, 0.164, 0.171, 0.167, 0.157, 0.154, 0.148, 0.151, 0.144, 0.141, 0.138, 0.135, 0.135, 0.135, 0.131, 0.131, 0.128, 0.128, 0.125, 0.121];
const XL_STEEL = [0.24, 0.223, 0.207, 0.213, 0.21, 0.197, 0.194, 0.187, 0.187, 0.18, 0.177, 0.171, 0.167, 0.171, 0.167, 0.164, 0.161, 0.157, 0.157, 0.157, 0.151];
/** NEC Chapter 9 Table 9 (Ω/km), by wire material and conduit: resistance R and reactance X per wire size (null: no data). */
const NEC = {
  copper: {
    pvc: { R: [10.2, 6.6, 3.9, 2.56, 1.61, 1.02, 0.82, 0.62, 0.49, 0.39, 0.33, 0.253, 0.203, 0.171, 0.144, 0.125, 0.108, 0.089, 0.075, 0.062, 0.049], X: XL_PVC_AL },
    aluminum: { R: [10.2, 6.6, 3.9, 2.56, 1.61, 1.02, 0.82, 0.66, 0.52, 0.43, 0.33, 0.269, 0.22, 0.187, 0.161, 0.141, 0.125, 0.105, 0.092, 0.079, 0.062], X: XL_PVC_AL },
    steel: { R: [10.2, 6.6, 3.9, 2.56, 1.61, 1.02, 0.82, 0.66, 0.52, 0.39, 0.33, 0.259, 0.207, 0.177, 0.148, 0.128, 0.115, 0.095, 0.082, 0.069, 0.059], X: XL_STEEL },
  },
  aluminum: {
    pvc: { R: [null, 10.5, 6.6, 4.3, 2.66, 1.67, 1.31, 1.05, 0.82, 0.66, 0.52, 0.43, 0.33, 0.279, 0.233, 0.2, 0.177, 0.141, 0.118, 0.095, 0.075], X: XL_PVC_AL },
    aluminum: { R: [null, 10.5, 6.6, 4.3, 2.66, 1.67, 1.35, 1.05, 0.85, 0.69, 0.52, 0.43, 0.36, 0.295, 0.249, 0.217, 0.194, 0.157, 0.135, 0.112, 0.089], X: XL_PVC_AL },
    steel: { R: [null, 10.5, 6.6, 4.3, 2.66, 1.67, 1.31, 1.05, 0.82, 0.66, 0.52, 0.43, 0.33, 0.282, 0.236, 0.207, 0.18, 0.148, 0.125, 0.102, 0.082], X: XL_STEEL },
  },
};
export const necImpedance = (material, conduit, size) => ({ R: NEC[material][conduit].R[size], X: NEC[material][conduit].X[size] });

export const SIZE_MATERIALS = [
  { value: "copper", label: "Copper", conductivity: 5.96 }, { value: "aluminum", label: "Aluminum", conductivity: 3.78 },
  { value: "silver", label: "Silver", conductivity: 6.3 }, { value: "gold", label: "Gold", conductivity: 4.52 },
];
/** Wire sizes for the estimated-resistance tab: copper resistance in Ω/km (the reference's values). */
export const WIRE_SIZES = [
  ["600 kcmil", 0.05671], ["500 kcmil", 0.06805], ["400 kcmil", 0.08507], ["350 kcmil", 0.09722], ["300 kcmil", 0.1134], ["250 kcmil", 0.1361],
  ["4/0 AWG (212 kcmil)", 0.1608], ["3/0 AWG (168 kcmil)", 0.2028], ["2/0 AWG (133 kcmil)", 0.2557], ["1/0 AWG (106 kcmil)", 0.3224],
  ["1 AWG (83.7 kcmil)", 0.4066], ["2 AWG (66.4 kcmil)", 0.5127], ["3 AWG (52.6 kcmil)", 0.6465], ["4 AWG (41.7 kcmil)", 0.8152],
  ["5 AWG (33.1 kcmil)", 1.028], ["6 AWG (26.3 kcmil)", 1.296], ["7 AWG (20.8 kcmil)", 1.634], ["8 AWG (16.5 kcmil)", 2.061],
  ["9 AWG (13.1 kcmil)", 2.599], ["10 AWG (10.4 kcmil)", 3.277], ["11 AWG (8.23 kcmil)", 4.132], ["12 AWG (6.53 kcmil)", 5.211],
  ["13 AWG (5.18 kcmil)", 6.571], ["14 AWG (4.11 kcmil)", 8.286], ["15 AWG (3.26 kcmil)", 10.45], ["16 AWG (2.58 kcmil)", 13.17],
  ["17 AWG (2.05 kcmil)", 16.61], ["18 AWG (1.62 kcmil)", 20.95], ["19 AWG (1.29 kcmil)", 26.42], ["20 AWG (1.02 kcmil)", 33.31],
  ["21 AWG (0.810 kcmil)", 42.0], ["22 AWG (0.642 kcmil)", 52.96], ["23 AWG (0.509 kcmil)", 66.79], ["24 AWG (0.404 kcmil)", 84.22],
  ["25 AWG (0.320 kcmil)", 106.2], ["26 AWG (0.254 kcmil)", 133.9], ["27 AWG (0.202 kcmil)", 168.9], ["28 AWG (0.160 kcmil)", 212.9],
  ["29 AWG (0.127 kcmil)", 268.5], ["30 AWG (0.101 kcmil)", 338.6], ["31 AWG (0.0797 kcmil)", 426.9], ["32 AWG (0.0632 kcmil)", 538.3],
  ["33 AWG (0.0501 kcmil)", 678.8], ["34 AWG (0.0398 kcmil)", 856.0], ["35 AWG (0.0315 kcmil)", 1079], ["36 AWG (0.0250 kcmil)", 1361],
  ["37 AWG (0.0198 kcmil)", 1716], ["38 AWG (0.0157 kcmil)", 2164], ["39 AWG (0.0125 kcmil)", 2729], ["40 AWG (0.00989 kcmil)", 3441],
];
export const RESISTANCE_UNITS = [
  { value: "okm", label: "Ω/km", perKm: 1 }, { value: "om", label: "Ω/m", perKm: 1000 }, { value: "mom", label: "mΩ/m", perKm: 1 },
  { value: "okf", label: "Ω/1000ft", perKm: 1 / 0.3048 }, { value: "of", label: "Ω/ft", perKm: 1000 / 0.3048 }, { value: "mof", label: "mΩ/ft", perKm: 1 / 0.3048 },
];
export const PHASES = [{ value: "dc", label: "DC" }, { value: "ac", label: "AC single phase" }, { value: "ac3", label: "AC 3-phase" }];
export const CONDUCTORS = [
  { value: "1", label: "single set of conductors" },
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ value: String(n), label: `${n} conductors per phase in parallel` })),
];
export const DISTANCE_UNITS = [
  { value: "feet", label: "feet", km: 0.0003048 }, { value: "meters", label: "meters", km: 0.001 },
  { value: "miles", label: "miles", km: 1.60934 }, { value: "kilometers", label: "kilometers", km: 1 },
];
/** The reference's prefilled values, shown here as placeholders. */
export const PLACEHOLDERS = { pf: "0.85", resistance: "1.2", voltage: "120", distance: "500", current: "1" };
export const DEFAULTS = {
  necMaterial: "copper", necSize: 6, conduit: "steel", sizeMaterial: "copper", wireSize: 10, resistanceUnit: "okm",
  phase: "ac", conductors: "1", distanceUnit: "meters",
};
export const NOTES = {
  nec: "The calculation result above is based on alternating current resistance and reactance data of 3-phase, 60 Hz, 75°C from National Electrical Code (NEC). The actual voltage drop can vary depending on the condition of the wire, the temperature, the connector, the frequency etc.",
  size: "The calculation result above is based on the resistance data estimated from the cross-section size of the wire. The actual voltage drop can vary depending on the condition of the wire, the temperature, the conduit being used, the connector, the frequency etc.",
  other: null,
};

const num = (t) => {
  const s = String(t ?? "").replace(/,/g, "").trim();
  if (s === "") return null;
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? Number(s) : NaN;
};

/** Half-up rounding on the decimal value (1.005 → 1.01, as the reference rounds). */
function roundHalfUp(x, d) {
  const [m, e] = Number(x.toPrecision(15)).toExponential().split("e"); // shift the exponent, not the float
  const [m2, e2] = Math.round(Number(`${m}e${Number(e) + d}`)).toExponential().split("e");
  return Number(`${m2}e${Number(e2) - d}`);
}
/** Decimals the reference shows: 2 from 0.1 up, otherwise 2 significant digits (0.0996 → 3, giving "0.100"). */
export const decimalsFor = (x) => (Math.abs(x) >= 0.1 || x === 0 ? 2 : 1 - Math.floor(Math.log10(Math.abs(x))));
const fixed = (x, d) => roundHalfUp(x, d).toFixed(d);
const group = (t) => {
  const [i, f] = t.split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${f !== undefined ? `.${f}` : ""}`;
};

/**
 * @param {{ tab: "nec"|"size"|"other", necMaterial, necSize: number, conduit, pf: string, sizeMaterial, wireSize: number,
 *   resistance: string, resistanceUnit, voltage: string, phase, conductors: string, distance: string, distanceUnit, current: string }} input
 * @returns {{ missing: string[] } | { errors: string[] } | { unlikely: string } | { drop, percent, end, dropText, percentText, endText, note }}
 */
export function calculateVoltageDrop(input) {
  const { tab } = input;
  const raw = { pf: tab === "nec" ? num(input.pf) : 0, resistance: tab === "other" ? num(input.resistance) : 1, voltage: num(input.voltage), distance: num(input.distance), current: num(input.current) };
  const missing = Object.keys(raw).filter((k) => raw[k] === null);
  if (missing.length) return { missing };
  const errors = [];
  if (tab === "nec" && !(raw.pf >= 0 && raw.pf <= 1)) errors.push("Please provide a Power factor (PF) value between 0 and 1.");
  if (tab === "other" && !(raw.resistance > 0)) errors.push("Please provide a positive wire resistance value.");
  if (!(raw.voltage > 0)) errors.push("Please provide a positive voltage value.");
  if (!(raw.distance > 0)) errors.push("Please provide a positive distance value.");
  if (!(raw.current > 0)) errors.push("Please provide a positive load current value.");
  let z;
  if (tab === "nec") {
    const { R, X } = necImpedance(input.necMaterial, input.conduit, input.necSize);
    if (R === null || R === undefined) errors.unshift(`Sorry, we do not have NEC resistance and reactance data for ${NEC_SIZES[input.necSize]} ${input.necMaterial} wire.`);
    else z = input.phase === "dc" ? R : R * raw.pf + X * Math.sin(Math.acos(raw.pf));
  } else if (tab === "size") {
    const m = SIZE_MATERIALS.find((x) => x.value === input.sizeMaterial) || SIZE_MATERIALS[0];
    z = (WIRE_SIZES[input.wireSize][1] * SIZE_MATERIALS[0].conductivity) / m.conductivity;
  } else {
    z = raw.resistance * (RESISTANCE_UNITS.find((u) => u.value === input.resistanceUnit) || RESISTANCE_UNITS[0]).perKm;
  }
  if (errors.length) return { errors };

  const k = input.phase === "ac3" ? Math.sqrt(3) : 2;
  const km = raw.distance * (DISTANCE_UNITS.find((u) => u.value === input.distanceUnit) || DISTANCE_UNITS[1]).km;
  const drop = (k * raw.current * z * km) / Number(input.conductors || 1);
  if (drop > raw.voltage) {
    return { unlikely: `It is unlikely that this wire can support ${String(input.current).trim()} amperes of current at a distance of ${String(input.distance).trim()} ${input.distanceUnit}.` };
  }
  const percent = (drop / raw.voltage) * 100;
  const d = decimalsFor(drop);
  const end = raw.voltage - roundHalfUp(drop, d); // the reference subtracts the drop as shown (1000 − 0.011 = 999.989)
  return {
    drop, percent, end, impedance: z,
    dropText: group(fixed(drop, d)),
    percentText: `${group(fixed(percent, decimalsFor(percent)))}%`,
    endText: fixed(end, d).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ""),
    note: NOTES[tab],
  };
}
