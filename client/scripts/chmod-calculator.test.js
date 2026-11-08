// Plain-Node test suite for the Chmod Calculator engine.
// Run with:
//   node scripts/chmod-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/chmod): its screenshot (755 / rwxr-xr-x / 111101101)
// and its custom JS.

import { findChmod, decodeChmod, DEFAULT_BITS } from "../src/utils/chmodCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const bits = (o, g, x, sp = {}) => {
  const p = (s) => ({ r: s[0] === "r", w: s[1] === "w", x: s[2] === "x" });
  return { owner: p(o), group: p(g), other: p(x), setuid: false, setgid: false, sticky: false, ...sp };
};
const row = (r) => r.rows ? r.rows.map((c) => `${c.symbolic}/${c.binary}/${c.octal}`).join(" ") : "no table";

// ── Find mode ──
const def = findChmod(DEFAULT_BITS);
eq("default command (screenshot)", def.command, "755");
eq("default symbolic", def.symbolic, "rwxr-xr-x");
eq("default binary", def.binary, "111101101");
eq("default table", row(def), "rwx/111/7 r-x/101/5 r-x/101/5");
eq("644", findChmod(bits("rw-", "r--", "r--")).command, "644");
eq("000", findChmod(bits("---", "---", "---")).symbolic, "---------");
const suid = findChmod(bits("rwx", "r-x", "r-x", { setuid: true }));
eq("setuid → 4755", suid.command, "4755");
eq("setuid symbolic", suid.symbolic, "rwsr-xr-x");
eq("special modes hide the table", row(suid), "no table");
const capital = findChmod(bits("rw-", "rw-", "rw-", { setuid: true, setgid: true, sticky: true }));
eq("all specials, no execute → 7666 rwSrwSrwT", `${capital.command} ${capital.symbolic}`, "7666 rwSrwSrwT");
eq("no-effect notes", capital.notes.join(" | "), "The user can't execute so setuid has no effect. | The group can't execute so setgid has no effect. | Others can't execute so sticky bit has no effect.");
eq("sticky 1777", `${findChmod(bits("rwx", "rwx", "rwx", { sticky: true })).command} ${findChmod(bits("rwx", "rwx", "rwx", { sticky: true })).symbolic}`, "1777 rwxrwxrwt");

// ── Decode mode ──
const d = decodeChmod("755");
eq("decode 755", `${d.binary} ${d.symbolic}`, "111101101 rwxr-xr-x");
eq("decode 755 table", row(d), "rwx/111/7 r-x/101/5 r-x/101/5");
const d2 = decodeChmod("2750");
eq("decode 2750", `${d2.specialDigit} ${d2.symbolic} ${d2.specialModes.join(",")}`, "2 rwxr-s--- setgid");
eq("decode 1754: other's own x (the reference copies the group's)", decodeChmod("1754").symbolic, "rwxr-xr-T");
eq("decode 4644 notes", decodeChmod("4644").notes.join(), "The user can't execute so setuid has no effect.");
eq("decode 0755 = 755 (the reference reads 0-7-5)", decodeChmod("0755").symbolic, "rwxr-xr-x");
eq("decode 070", decodeChmod("070").symbolic, "---rwx---");
eq("8 is not octal", decodeChmod("758").errors.join(), "Not a valid chmod value.");
eq("too long", decodeChmod("77777").errors.join(), "Not a valid chmod value.");
eq("too short", decodeChmod("75").errors.join(), "Enter at least three octal digits (e.g. 755).");
eq("blank", decodeChmod("").missing.join(), "chmod");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
