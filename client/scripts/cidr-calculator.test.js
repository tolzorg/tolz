// Plain-Node test suite for the CIDR Calculator engine.
// Run with:
//   node scripts/cidr-calculator.test.js
//
// Expected values follow the reference (omnicalculator.com/other/cidr): its screenshot (192.168.0.0/8) and custom JS.

import { cidrToRange, rangeToCidr, formatThousands } from "../src/utils/cidrCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  if (actual === expected) passed++;
  else { failed++; console.error(`✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
const sum = (r) => (r.missing ? `MISSING ${r.missing.join(",")}` : r.errors ? `ERR ${r.errors.join(" | ")}`
  : `${r.subnetMask} ${r.prefix} ${r.wildcard} ${r.firstIp}-${r.lastIp} ${formatThousands(r.range)} ${formatThousands(r.hosts)}`);
const range = (a, b) => rangeToCidr(a.split("."), b.split("."));

// ── CIDR → range ──
eq("screenshot 192.168.0.0/8", sum(cidrToRange(["192", "168", "0", "0", "8"])),
  "255.0.0.0 192.0.0.0 0.255.255.255 192.0.0.0-192.255.255.255 16,777,216 16,777,214");
eq("/24", sum(cidrToRange(["10", "1", "2", "77", "24"])), "255.255.255.0 10.1.2.0 0.0.0.255 10.1.2.0-10.1.2.255 256 254");
eq("/26", sum(cidrToRange(["172", "16", "5", "130", "26"])), "255.255.255.192 172.16.5.128 0.0.0.63 172.16.5.128-172.16.5.191 64 62");
eq("/0", sum(cidrToRange(["8", "8", "8", "8", "0"])), "0.0.0.0 0.0.0.0 255.255.255.255 0.0.0.0-255.255.255.255 4,294,967,296 4,294,967,294");
eq("/31 has no host addresses", sum(cidrToRange(["10", "0", "0", "1", "31"])), "255.255.255.254 10.0.0.0 0.0.0.1 10.0.0.0-10.0.0.1 2 0");
eq("/32", sum(cidrToRange(["10", "0", "0", "1", "32"])), "255.255.255.255 10.0.0.1 0.0.0.0 10.0.0.1-10.0.0.1 1 0");
eq("octet 256", sum(cidrToRange(["256", "0", "0", "0", "8"])), "ERR Each octet should be in the 0 to 255 range.");
eq("octet 1.5", sum(cidrToRange(["1.5", "0", "0", "0", "8"])), "ERR Octet value must be an integer.");
eq("width 33", sum(cidrToRange(["10", "0", "0", "0", "33"])), "ERR The subnet mask width must be 32 or smaller.");
eq("width 8.5", sum(cidrToRange(["10", "0", "0", "0", "8.5"])), "ERR The subnet mask width must be an integer.");
eq("width −1", sum(cidrToRange(["10", "0", "0", "0", "-1"])), "ERR The subnet mask width must be 0 or greater.");
eq("missing width", sum(cidrToRange(["10", "0", "0", "0", ""])), "MISSING width");

// ── Range → CIDR ──
const single = range("192.168.1.0", "192.168.1.255");
eq("one block /24", single.single ? `${single.single.firstIp}/${single.single.width} ${single.single.hosts}` : "x", "192.168.1.0/24 254");
eq("a /32 block: 0 hosts (the reference shows −1)", range("10.0.0.5", "10.0.0.5").single.hosts, 0);
const multi = range("10.0.0.1", "10.0.0.10");
eq("10.0.0.1 – 10.0.0.10 blocks", multi.blocks.map((b) => b.cidr).join(" "), "10.0.0.1/32 10.0.0.2/31 10.0.0.4/30 10.0.0.8/31 10.0.0.10/32");
eq("table row", `${multi.blocks[2].range} ${multi.blocks[2].count}`, "10.0.0.4 - 10.0.0.7 4");
eq("whole IPv4 space", range("0.0.0.0", "255.255.255.255").single.width, 0);
eq("first > last", JSON.stringify(range("10.0.0.9", "10.0.0.1").errors), JSON.stringify(["The first IP in the block is bigger than the last IP."]));
eq("missing", rangeToCidr(["10", "0", "", "1"], ["10", "0", "0", ""]).missing.join(), "f3,l4");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
