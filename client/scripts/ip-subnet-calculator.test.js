// Plain-Node test suite for the IP Subnet Calculator engine.
// Run with:
//   node scripts/ip-subnet-calculator.test.js
//
// Expected values were read off calculator.net/ip-subnet-calculator.html (its screenshots and live responses), except
// the IPv4-mapped / 6to4 group separator (":" here, "." on the reference) and the stricter input validation.

import {
  calculateIpv4, calculateIpv6, parseIpv4, parseIpv6, subnetsForClass, subnetAfterClassChange, IPV4_SUBNETS, IPV4_ERROR, IPV6_ERROR,
} from "../src/utils/ipSubnetCalculatorEngine.js";

let passed = 0;
let failed = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else { failed++; console.error(`✗ ${name} — got ${a}, expected ${e}`); }
}

// ── Reference screenshot: 39.60.120.63 /30 ──
const s = calculateIpv4({ ip: "39.60.120.63", prefix: "30" });
eq("network", s.networkAddress, "39.60.120.60");
eq("usable range", s.usableRange, "39.60.120.61 - 39.60.120.62");
eq("broadcast", s.broadcastAddress, "39.60.120.63");
eq("total", s.totalHosts, "4");
eq("usable", s.usableHosts, "2");
eq("mask", s.subnetMask, "255.255.255.252");
eq("wildcard", s.wildcardMask, "0.0.0.3");
eq("binary mask", s.binarySubnetMask, "11111111.11111111.11111111.11111100");
eq("class follows the prefix", s.ipClass, "C");
eq("cidr", s.cidr, "/30");
eq("type", s.ipType, "Public");
eq("short", s.short, "39.60.120.63 /30");
eq("binary id", s.binaryId, "00100111001111000111100000111111");
eq("integer id", s.integerId, "658274367");
eq("hex id", s.hexId, "0x273c783f");
eq("arpa", s.inAddrArpa, "63.120.60.39.in-addr.arpa");
eq("mapped (colon)", s.ipv4Mapped, "::ffff:273c:783f");
eq("6to4 (colon)", s.sixToFour, "2002:273c:783f::/48");
eq("table title", s.table.title, "All 64 of the Possible /30 Networks for 39.60.120.*");
eq("table rows", s.table.rows.length, 64);
eq("table first", s.table.rows[0], { network: "39.60.120.0", usable: "39.60.120.1 - 39.60.120.2", broadcast: "39.60.120.3", current: false });
eq("table own row", s.table.rows[15], { network: "39.60.120.60", usable: "39.60.120.61 - 39.60.120.62", broadcast: "39.60.120.63", current: true });
eq("table last", s.table.rows[63].broadcast, "39.60.120.255");

// ── Live reference responses ──
const t = calculateIpv4({ ip: "10.1.2.3", prefix: 8 });
eq("/8 class A, private, no table", [t.ipClass, t.ipType, t.table, t.totalHosts, t.usableHosts], ["A", "Private", null, "16,777,216", "16,777,214"]);
eq("/8 hex not padded", t.hexId, "0xa010203");
eq("/8 mapped padded", t.ipv4Mapped, "::ffff:0a01:0203");
const p4 = calculateIpv4({ ip: "172.16.200.77", prefix: 4 });
eq("/4 no class", p4.ipClass, null);
eq("/4 network", [p4.networkAddress, p4.usableRange, p4.broadcastAddress], ["160.0.0.0", "160.0.0.1 - 175.255.255.254", "175.255.255.255"]);
eq("/4 table title", p4.table.title, "All 16 of the Possible /4 Networks");
eq("/4 table last", p4.table.rows[15], { network: "240.0.0.0", usable: "240.0.0.1 - 255.255.255.254", broadcast: "255.255.255.255", current: false });
eq("/12 title", calculateIpv4({ ip: "172.16.200.77", prefix: 12 }).table.title, "All 16 of the Possible /12 Networks for 172.*.*.*");
eq("/23 title", calculateIpv4({ ip: "172.16.200.77", prefix: 23 }).table.title, "All 128 of the Possible /23 Networks for 172.16.*.*");
eq("/20 network", calculateIpv4({ ip: "172.16.200.77", prefix: 20 }).usableRange, "172.16.192.1 - 172.16.207.254");
eq("/16 class B, no table", (({ ipClass, table }) => [ipClass, table])(calculateIpv4({ ip: "172.16.200.77", prefix: 16 })), ["B", null]);
eq("/24 no table", calculateIpv4({ ip: "172.16.200.77", prefix: 24 }).table, null);
const p31 = calculateIpv4({ ip: "172.16.200.77", prefix: 31 });
eq("/31", [p31.networkAddress, p31.usableRange, p31.broadcastAddress, p31.totalHosts, p31.usableHosts], ["172.16.200.76", "NA", "172.16.200.77", "2", "0"]);
eq("/31 table row keeps both addresses", p31.table.rows[0].usable, "172.16.200.0 - 172.16.200.1");
eq("/31 table size", p31.table.rows.length, 128);
const p32 = calculateIpv4({ ip: "172.16.200.77", prefix: 32 });
eq("/32", [p32.networkAddress, p32.usableRange, p32.broadcastAddress, p32.totalHosts, p32.usableHosts, p32.table], ["172.16.200.77", "NA", "172.16.200.77", "1", "0", null]);
const p1 = calculateIpv4({ ip: "172.16.200.77", prefix: 1 });
eq("/1", [p1.totalHosts, p1.usableHosts, p1.table.title, p1.table.rows.length], ["2,147,483,648", "2,147,483,646", "All 2 of the Possible /1 Networks", 2]);

// IP type: only the RFC 1918 blocks are private.
const type = (ip) => calculateIpv4({ ip, prefix: 24 }).ipType;
for (const ip of ["10.0.0.0", "172.16.0.0", "172.31.255.255", "192.168.0.1"]) eq(`private ${ip}`, type(ip), "Private");
for (const ip of ["9.255.255.255", "11.0.0.0", "172.15.255.255", "172.32.0.0", "192.167.255.255", "192.169.0.0", "127.0.0.1", "169.254.1.1", "100.64.0.1", "0.0.0.0", "255.255.255.255"]) eq(`public ${ip}`, type(ip), "Public");

// Input handling
eq("blank → missing", calculateIpv4({ ip: "  ", prefix: 30 }), { missing: ["ipv4"] });
for (const bad of ["256.1.1.1", "1.2.3", "1.2.3.4.5", "1.2.3.4/16", "a.b.c.d", "1.2.3.-4", "1..3.4", "1.2.3.4x", "1234.1.1.1"]) eq(`invalid ${bad}`, calculateIpv4({ ip: bad, prefix: 30 }), { errors: [IPV4_ERROR] });
eq("spaces trimmed", calculateIpv4({ ip: " 1.2.3.4 ", prefix: 24 }).ipAddress, "1.2.3.4");
eq("leading zeros normalized", parseIpv4("01.002.3.4"), [1, 2, 3, 4]);

// Subnet list
eq("32 subnets", IPV4_SUBNETS.length, 32);
eq("first option", IPV4_SUBNETS[0], { value: "32", label: "255.255.255.255 /32" });
eq("/30 label", IPV4_SUBNETS[2].label, "255.255.255.252 /30");
eq("last option", IPV4_SUBNETS[31], { value: "1", label: "128.0.0.0 /1" });
eq("class A list", [subnetsForClass("a").length, subnetsForClass("a").at(-1).value], [25, "8"]);
eq("class B list", subnetsForClass("b").at(-1).value, "16");
eq("class C list", subnetsForClass("c").length, 9);
eq("class keeps /30", subnetAfterClassChange("c", "30"), "30");
eq("class C drops /20 → /32", subnetAfterClassChange("c", "20"), "32");

// ── IPv6 (live reference) ──
const v = calculateIpv6({ ip: "2001:db8:85a3::8a2e:370:7334", prefix: 64 });
eq("v6 screenshot", v, {
  prefix: 64,
  ipAddress: "2001:db8:85a3::8a2e:370:7334/64",
  fullAddress: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  totalAddresses: "18,446,744,073,709,551,616",
  total64Networks: null,
  network: "2001:0db8:85a3:0000::",
  range: "2001:0db8:85a3:0000:0000:0000:0000:0000 - 2001:0db8:85a3:0000:ffff:ffff:ffff:ffff",
});
const v1 = calculateIpv6({ ip: "2001:db8:85a3::8a2e:370:7334", prefix: 1 });
eq("v6 /1", [v1.totalAddresses, v1.total64Networks, v1.network, v1.range], [
  "170,141,183,460,469,231,731,687,303,715,884,105,728", "9,223,372,036,854,775,808", "0000::",
  "0000:0000:0000:0000:0000:0000:0000:0000 - 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
]);
const v127 = calculateIpv6({ ip: "2001:db8:85a3::8a2e:370:7334", prefix: 127 });
eq("v6 /127", [v127.totalAddresses, v127.network], ["2", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"]);
eq("v6 /127 range", v127.range, "2001:0db8:85a3:0000:0000:8a2e:0370:7334 - 2001:0db8:85a3:0000:0000:8a2e:0370:7335");
eq("v6 /128", calculateIpv6({ ip: "2001:db8:85a3::8a2e:370:7334", prefix: 128 }).totalAddresses, "1");
const x = "2001:db8:85a3:1234:abcd:8a2e:370:7334";
eq("v6 /63", [calculateIpv6({ ip: x, prefix: 63 }).total64Networks, calculateIpv6({ ip: x, prefix: 63 }).network], ["2", "2001:0db8:85a3:1234::"]);
eq("v6 /16", calculateIpv6({ ip: x, prefix: 16 }).network, "2001::");
eq("v6 /17", calculateIpv6({ ip: x, prefix: 17 }).network, "2001:0000::");
eq("v6 /112", calculateIpv6({ ip: x, prefix: 112 }).network, "2001:0db8:85a3:1234:abcd:8a2e:0370::");
eq("v6 /113", calculateIpv6({ ip: x, prefix: 113 }).network, "2001:0db8:85a3:1234:abcd:8a2e:0370:0000");
const up = calculateIpv6({ ip: "2001:DB8:0:0:1:0:0:1", prefix: 100 });
eq("v6 upper case", [up.ipAddress, up.fullAddress, up.network], ["2001:DB8:0:0:1:0:0:1/100", "2001:0db8:0000:0000:0001:0000:0000:0001", "2001:0db8:0000:0000:0001:0000:0000::"]);
eq("v6 /65 range", calculateIpv6({ ip: "fe80::1ff:fe23:4567:890a", prefix: 65 }).range, "fe80:0000:0000:0000:0000:0000:0000:0000 - fe80:0000:0000:0000:7fff:ffff:ffff:ffff");

// RFC 4291 parsing (the reference rejects the first five — a flagged deviation)
eq("::1", parseIpv6("::1"), [0, 0, 0, 0, 0, 0, 0, 1]);
eq("::", parseIpv6("::"), [0, 0, 0, 0, 0, 0, 0, 0]);
eq("1::", parseIpv6("1::"), [1, 0, 0, 0, 0, 0, 0, 0]);
eq("1:2:3:4:5:6:7::", parseIpv6("1:2:3:4:5:6:7::"), [1, 2, 3, 4, 5, 6, 7, 0]);
eq("embedded IPv4", parseIpv6("::ffff:192.168.1.1"), [0, 0, 0, 0, 0, 0xffff, 0xc0a8, 0x0101]);
eq("embedded IPv4 full", parseIpv6("1:2:3:4:5:6:1.2.3.4"), [1, 2, 3, 4, 5, 6, 0x0102, 0x0304]);
eq("blank → missing", calculateIpv6({ ip: "", prefix: 64 }), { missing: ["ipv6"] });
for (const bad of ["abc", "1:2:3:4:5:6:7:8:9", "12345::1", "1::2::3", "1:2:3:4:5:6::7:8", ":1:2:3:4:5:6:7", "1:2:3:4:5:6:7:", "::ffff:300.1.1.1", "1.2.3.4", "fe80::1%eth0", "g::1", "1:2:3:4:5:6:7:1.2.3.4"]) {
  eq(`invalid ${bad}`, calculateIpv6({ ip: bad, prefix: 64 }), { errors: [IPV6_ERROR] });
}

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
