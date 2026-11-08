// Chmod Calculator engine — matches omnicalculator.com/other/chmod (its custom JS was read from the page; see
// scripts/chmod-calculator.test.js).
//
// Find mode: octal digit per class = 4·read + 2·write + 1·execute (user, group, other); symbolic rwxrwxrwx; binary of
// the nine bits. Special modes add a leading digit 4·setuid + 2·setgid + 1·sticky and turn the execute characters into
// s/S (setuid, setgid) and t/T (sticky) — capital when that class can't execute, with a note that the mode has no
// effect. As on the reference, the interpretation table and the binary/octal lines only show without special modes.
// Decode mode: a 3-digit octal (≤ 777) or 4-digit (special digit first) value, each digit 0–7, else "Not a valid
// chmod value.".
//
// Deviations (flagged to the user): the reference reads "0755" as permissions 0-7-5 (it uses the first three
// characters whenever the number is ≤ 777); here a 4-digit value always has the special digit first, so 0755 = 755.
// Without the sticky bit, its symbolic "other" execute character copies the group's; here it is the other class's own.
// Its special-mode list says "sticky end"; here "sticky bit". Values like 070 or 007 get the conversion text too
// (the reference only shows it from 100).

export const MODES = [
  { value: "find", label: "find chmod command" },
  { value: "decode", label: "decode octal number next to chmod" },
];
export const CLASSES = [
  { key: "owner", label: "User / owner" },
  { key: "group", label: "Group" },
  { key: "other", label: "Other" },
];
export const PERMISSIONS = [
  { key: "r", title: "Who can read?" },
  { key: "w", title: "Who can write?" },
  { key: "x", title: "Who can execute?" },
];
export const SPECIALS = [
  { key: "setuid", label: "Setuid" },
  { key: "setgid", label: "Setgid" },
  { key: "sticky", label: "Sticky bit" },
];
/** The reference's defaults: rwxr-xr-x (755), no special modes. */
export const DEFAULT_BITS = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  other: { r: true, w: false, x: true },
  setuid: false, setgid: false, sticky: false,
};

const digitOf = (p) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
const bitsOf = (d) => ({ r: (d & 4) > 0, w: (d & 2) > 0, x: (d & 1) > 0 });
const rwx = (p) => `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${p.x ? "x" : "-"}`;
const bin = (p) => `${p.r ? 1 : 0}${p.w ? 1 : 0}${p.x ? 1 : 0}`;

/** Symbolic string with s/S/t/T for the special modes, and the "has no effect" notes. */
function symbolic(perms, special) {
  const notes = [];
  const cls = CLASSES.map(({ key }) => rwx(perms[key]).split(""));
  const apply = (i, on, lower, upper, note) => {
    if (!on) return;
    const canExec = perms[CLASSES[i].key].x;
    cls[i][2] = canExec ? lower : upper;
    if (!canExec) notes.push(note);
  };
  apply(0, special.setuid, "s", "S", "The user can't execute so setuid has no effect.");
  apply(1, special.setgid, "s", "S", "The group can't execute so setgid has no effect.");
  apply(2, special.sticky, "t", "T", "Others can't execute so sticky bit has no effect.");
  return { symbolic: cls.map((c) => c.join("")).join(""), perClass: cls.map((c) => c.join("")), notes };
}

/** The interpretation rows for each class. */
function table(perms, perClassSymbolic) {
  return CLASSES.map(({ key, label }, i) => ({
    key, label, read: perms[key].r, write: perms[key].w, execute: perms[key].x,
    symbolic: perClassSymbolic[i], binary: bin(perms[key]), octal: String(digitOf(perms[key])),
  }));
}

/** Find mode. @param {typeof DEFAULT_BITS} b */
export function findChmod(b) {
  const perms = { owner: b.owner, group: b.group, other: b.other };
  const special = { setuid: !!b.setuid, setgid: !!b.setgid, sticky: !!b.sticky };
  const octal = CLASSES.map(({ key }) => digitOf(perms[key])).join("");
  const specialDigit = (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0);
  const sym = symbolic(perms, special);
  return {
    command: specialDigit ? `${specialDigit}${octal}` : octal,
    symbolic: sym.symbolic,
    binary: CLASSES.map(({ key }) => bin(perms[key])).join(""),
    octal,
    hasSpecial: specialDigit > 0,
    notes: sym.notes,
    rows: specialDigit ? null : table(perms, sym.perClass),
  };
}

/** Decode mode. @param {string} text  e.g. "755" or "4755". */
export function decodeChmod(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { missing: ["chmod"] };
  if (!/^\d+$/.test(raw) || raw.length > 4 || /[89]/.test(raw)) return { errors: ["Not a valid chmod value."] };
  if (raw.length < 3) return { errors: ["Enter at least three octal digits (e.g. 755)."] };
  const digits = raw.split("").map(Number);
  const specialDigit = raw.length === 4 ? digits.shift() : 0;
  const perms = { owner: bitsOf(digits[0]), group: bitsOf(digits[1]), other: bitsOf(digits[2]) };
  const special = { setuid: (specialDigit & 4) > 0, setgid: (specialDigit & 2) > 0, sticky: (specialDigit & 1) > 0 };
  const sym = symbolic(perms, special);
  return {
    input: raw,
    specialDigit: raw.length === 4 ? String(specialDigit) : null,
    hasSpecial: specialDigit > 0,
    binary: CLASSES.map(({ key }) => bin(perms[key])).join(""),
    symbolic: sym.symbolic,
    specialModes: SPECIALS.filter(({ key }) => special[key]).map(({ label }) => label.toLowerCase()),
    notes: sym.notes,
    rows: table(perms, sym.perClass),
  };
}
