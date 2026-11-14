// IP Subnet Calculator engine — matches calculator.net/ip-subnet-calculator.html (its results are computed on the
// server, so the rules below were read off its responses; see scripts/ip-subnet-calculator.test.js).
//
// IPv4 (address + prefix /1–/32):
//   network = IP & mask; broadcast = network | ~mask; total hosts = 2^(32 − p); usable = total − 2, but 0 with the
//   usable range "NA" for /31 and /32. IP class follows the PREFIX, not the first octet (as the reference does):
//   /8–/15 A, /16–/23 B, /24–/32 C, and no class row below /8. IP type is "Private" only for the RFC 1918 blocks
//   (10/8, 172.16/12, 192.168/16), otherwise "Public". Binary/integer/hex IDs, in-addr.arpa, IPv4-mapped address and
//   6to4 prefix follow from the 32-bit value.
//   Network table: every /p network inside the enclosing class-sized block (/0, /8, /16 or /24 below p), shown unless
//   p is 8, 16, 24 or 32 — at most 128 rows. In it a /31 row's usable range is "network - broadcast" (as the reference).
// IPv6 (address + prefix /1–/128): full (expanded) address, total addresses 2^(128 − p), the number of /64 networks
//   (p < 64), the network (the first ceil(p/16) groups, then "::"), and the range.
//
// Deviations from the reference (flagged to the user):
//   - The reference writes the IPv4-mapped address and 6to4 prefix with a dot between the two hex groups
//     (::ffff:273c.783f); IPv6 groups are separated by colons, so here it is ::ffff:273c:783f.
//   - The reference accepts malformed IPv4 input (1.2.3, 1.2.3.4x, 1.2.3.4/16) and rejects valid IPv6 forms that start or
//     end with "::" (::1, 1::) or embed an IPv4 address (::ffff:192.168.1.1), yet accepts 8 groups plus "::". Here an
//     IPv4 address must be four 0–255 numbers and IPv6 follows RFC 4291.

import { toInt, toIp, maskInt, ipString, formatThousands } from "./cidrCalculatorEngine.js";

export { formatThousands };

export const IPV4_ERROR = "Please provide a valid IP address.";
export const IPV6_ERROR = "Please provide a valid IPv6 address.";

/** The reference's example values, shown as placeholders only. */
export const PLACEHOLDERS = { ipv4: "39.60.120.63", ipv6: "2001:db8:85a3::8a2e:370:7334" };
export const DEFAULT_IPV4_PREFIX = "30";
export const DEFAULT_IPV6_PREFIX = "64";

/** Network Class radio: limits the Subnet list to prefixes of at least this length. */
export const NETWORK_CLASSES = [
  { value: "any", label: "Any", min: 1 },
  { value: "a", label: "A", min: 8 },
  { value: "b", label: "B", min: 16 },
  { value: "c", label: "C", min: 24 },
];

/** All IPv4 subnets, /32 first (the reference's order): { value: "30", label: "255.255.255.252 /30" }. */
export const IPV4_SUBNETS = Array.from({ length: 32 }, (_, i) => {
  const p = 32 - i;
  return { value: String(p), label: `${ipString(toIp(maskInt(p)))} /${p}` };
});

/** The Subnet list for a network class. */
export const subnetsForClass = (cls) => {
  const min = (NETWORK_CLASSES.find((c) => c.value === cls) || NETWORK_CLASSES[0]).min;
  return IPV4_SUBNETS.filter((o) => Number(o.value) >= min);
};

/** The subnet kept after switching class: the current one if the class allows it, else the list's first (/32), as the reference. */
export const subnetAfterClassChange = (cls, prefix) => {
  const list = subnetsForClass(cls);
  return list.some((o) => o.value === String(prefix)) ? String(prefix) : list[0].value;
};

export const IPV6_PREFIXES = Array.from({ length: 128 }, (_, i) => ({ value: String(i + 1), label: `/${i + 1}` }));

// ── IPv4 ──

/** "a.b.c.d" (each a decimal 0–255, up to 3 digits) → [a, b, c, d], else null. Surrounding spaces are ignored. */
export function parseIpv4(text) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(text ?? "").trim());
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  return octets.every((o) => o <= 255) ? octets : null;
}

const RFC1918 = [[0x0a000000, 8], [0xac100000, 12], [0xc0a80000, 16]];
const isPrivate = (n) => RFC1918.some(([net, p]) => ((n & maskInt(p)) >>> 0) === net);
const ipClass = (p) => (p < 8 ? null : p < 16 ? "A" : p < 24 ? "B" : "C");
const hex4 = (n) => n.toString(16).padStart(4, "0");
const bin8 = (n) => n.toString(2).padStart(8, "0");

/** The network table: all /p networks in the enclosing /0, /8, /16 or /24 block (null for /8, /16, /24, /32). */
function networkTable(n, p) {
  if (p === 8 || p === 16 || p === 24 || p === 32) return null;
  const base = p < 8 ? 0 : p < 16 ? 8 : p < 24 ? 16 : 24;
  const start = (n & maskInt(base)) >>> 0;
  const size = 2 ** (32 - p);
  const count = 2 ** (p - base);
  const octets = toIp(n);
  const scope = base === 0 ? "" : ` for ${[...octets.slice(0, base / 8), ...Array(4 - base / 8).fill("*")].join(".")}`;
  const own = Math.floor((n - start) / size);
  const rows = Array.from({ length: count }, (_, i) => {
    const net = start + i * size;
    const last = net + size - 1;
    const usable = p === 31 ? `${ipString(toIp(net))} - ${ipString(toIp(last))}` : `${ipString(toIp(net + 1))} - ${ipString(toIp(last - 1))}`;
    return { network: ipString(toIp(net)), usable, broadcast: ipString(toIp(last)), current: i === own };
  });
  return { title: `All ${formatThousands(count)} of the Possible /${p} Networks${scope}`, rows };
}

/**
 * @param {{ ip: string, prefix: string|number }} input
 * @returns {{ missing: string[] } | { errors: string[] } | object}  the result rows (strings, ready to show)
 */
export function calculateIpv4({ ip, prefix }) {
  if (String(ip ?? "").trim() === "") return { missing: ["ipv4"] };
  const octets = parseIpv4(ip);
  const p = Number(prefix);
  if (!octets) return { errors: [IPV4_ERROR] };
  if (!Number.isInteger(p) || p < 1 || p > 32) return { errors: ["Please select a subnet."] };

  const n = toInt(octets);
  const mask = maskInt(p);
  const wildcard = ~mask >>> 0;
  const network = (n & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - p);
  const usable = p >= 31 ? 0 : total - 2;
  const address = ipString(octets);
  const hi = n >>> 16;
  const lo = n & 0xffff;

  return {
    prefix: p,
    ipAddress: address,
    networkAddress: ipString(toIp(network)),
    usableRange: p >= 31 ? "NA" : `${ipString(toIp(network + 1))} - ${ipString(toIp(broadcast - 1))}`,
    broadcastAddress: ipString(toIp(broadcast)),
    totalHosts: formatThousands(total),
    usableHosts: formatThousands(usable),
    subnetMask: ipString(toIp(mask)),
    wildcardMask: ipString(toIp(wildcard)),
    binarySubnetMask: toIp(mask).map(bin8).join("."),
    ipClass: ipClass(p),
    cidr: `/${p}`,
    ipType: isPrivate(n) ? "Private" : "Public",
    short: `${address} /${p}`,
    binaryId: n.toString(2).padStart(32, "0"),
    integerId: String(n),
    hexId: `0x${n.toString(16)}`,
    inAddrArpa: `${[...octets].reverse().join(".")}.in-addr.arpa`,
    ipv4Mapped: `::ffff:${hex4(hi)}:${hex4(lo)}`,
    sixToFour: `2002:${hex4(hi)}:${hex4(lo)}::/48`,
    table: networkTable(n, p),
  };
}

// ── IPv6 ──

/** RFC 4291 text → 8 groups (numbers), else null. Accepts "::" compression and a trailing embedded IPv4 address. */
export function parseIpv6(text) {
  let s = String(text ?? "").trim().toLowerCase();
  if (s === "" || !/^[0-9a-f:.]+$/.test(s)) return null;
  let tail = [];
  const v4 = /^(.*:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(s);
  if (v4) {
    const o = parseIpv4(v4[2]);
    if (!o) return null;
    tail = [(o[0] << 8) | o[1], (o[2] << 8) | o[3]];
    s = v4[1].endsWith("::") ? v4[1] : v4[1].slice(0, -1);
  }
  if (s.includes(".")) return null;
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const groups = (part) => (part === "" ? [] : part.split(":"));
  const head = groups(halves[0]);
  const rest = halves.length === 2 ? groups(halves[1]) : [];
  const all = [...head, ...rest];
  if (!all.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  const count = all.length + tail.length;
  if (halves.length === 2 ? count > 7 : count !== 8) return null;
  const zeros = halves.length === 2 ? Array(8 - count).fill(0) : [];
  return [...head.map((g) => parseInt(g, 16)), ...zeros, ...rest.map((g) => parseInt(g, 16)), ...tail];
}

const toBig = (groups) => groups.reduce((acc, g) => (acc << 16n) | BigInt(g), 0n);
const toGroups = (big) => Array.from({ length: 8 }, (_, i) => Number((big >> BigInt(16 * (7 - i))) & 0xffffn));
const fullForm = (groups) => groups.map(hex4).join(":");

/**
 * @param {{ ip: string, prefix: string|number }} input
 * @returns {{ missing: string[] } | { errors: string[] } | object}
 */
export function calculateIpv6({ ip, prefix }) {
  if (String(ip ?? "").trim() === "") return { missing: ["ipv6"] };
  const groups = parseIpv6(ip);
  const p = Number(prefix);
  if (!groups) return { errors: [IPV6_ERROR] };
  if (!Number.isInteger(p) || p < 1 || p > 128) return { errors: ["Please select a prefix length."] };

  const ALL = (1n << 128n) - 1n;
  const hostBits = BigInt(128 - p);
  const mask = (ALL >> hostBits) << hostBits;
  const first = toBig(groups) & mask;
  const last = first | (ALL ^ mask);
  const shown = Math.ceil(p / 16);
  const netGroups = toGroups(first).slice(0, shown).map(hex4).join(":");

  return {
    prefix: p,
    ipAddress: `${String(ip).trim()}/${p}`,
    fullAddress: fullForm(groups),
    totalAddresses: formatThousands(1n << hostBits),
    total64Networks: p < 64 ? formatThousands(1n << BigInt(64 - p)) : null,
    network: shown < 8 ? `${netGroups}::` : netGroups,
    range: `${fullForm(toGroups(first))} - ${fullForm(toGroups(last))}`,
  };
}
